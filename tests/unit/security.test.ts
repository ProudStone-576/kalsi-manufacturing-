import { describe, expect, it } from "vitest";
import { checkAttachments, safeFilename, sniffMatches } from "@/lib/files";
import { BodyTooLargeError, clientIp, isSameOrigin, readBodyLimited, wantsHtml } from "@/lib/http";
import { SlidingWindowLimiter } from "@/lib/rate-limit";
import { makeReference, REFERENCE_PATTERN } from "@/lib/reference";
import { buildEnquiryEmail, escapeHtml } from "@/lib/mail";
import { loadConfig } from "@/lib/config";
import { buildCsp } from "@/proxy";
import type { EnquiryRecord } from "@/lib/store";

const PDF = Buffer.from("%PDF-1.7\n%âãÏÓ\n1 0 obj");
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const file = (name: string, bytes: Buffer) => new File([new Uint8Array(bytes)], name);

describe("file signatures", () => {
  it("accepts real files", () => {
    expect(sniffMatches("pdf", PDF)).toBe(true);
    expect(sniffMatches("png", PNG)).toBe(true);
    expect(sniffMatches("jpg", Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(sniffMatches("dwg", Buffer.from("AC1032\0\0"))).toBe(true);
    expect(sniffMatches("dxf", Buffer.from("  0\r\nSECTION\r\n  2\r\nHEADER"))).toBe(true);
    expect(sniffMatches("dxf", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("0\nSECTION\n")]))).toBe(true);
    expect(sniffMatches("step", Buffer.from("ISO-10303-21;\nHEADER;"))).toBe(true);
  });

  it("rejects files whose content does not match the extension", () => {
    expect(sniffMatches("pdf", Buffer.from("<html><script>alert(1)</script>"))).toBe(false);
    expect(sniffMatches("png", PDF)).toBe(false);
    expect(sniffMatches("dxf", Buffer.from("MZ\x90\x00"))).toBe(false);
    expect(sniffMatches("exe", Buffer.from("MZ"))).toBe(false);
  });

  it("validates count, type, size and content", async () => {
    expect((await checkAttachments([file("a.pdf", PDF)])).ok).toBe(true);
    expect((await checkAttachments([file("evil.exe", PDF)])).ok).toBe(false);
    expect((await checkAttachments([file("fake.pdf", Buffer.from("not a pdf"))])).ok).toBe(false);
    expect((await checkAttachments(["a", "b"].map((n) => file(`${n}.pdf`, PDF)).concat([file("c.pdf", PDF), file("d.pdf", PDF)]))).ok).toBe(false);
    const big = Buffer.concat([PDF, Buffer.alloc(8 * 1024 * 1024)]);
    expect((await checkAttachments([file("big.pdf", big)])).ok).toBe(false);
    expect((await checkAttachments([new File([], "empty.pdf")])).ok).toBe(true); // empty input is ignored
  });

  it("sanitises filenames", () => {
    expect(safeFilename("../../etc/passwd.pdf", "pdf")).toBe("passwd.pdf");
    expect(safeFilename("C:\\Users\\me\\drawing <1>.pdf", "pdf")).toBe("drawing _1_.pdf");
    expect(safeFilename("...", "png")).toBe("drawing.png");
    expect(safeFilename("noext", "dxf")).toBe("drawing.dxf");
  });
});

describe("request helpers", () => {
  const h = (o: Record<string, string>) => new Headers(o);

  it("checks the origin against SITE_URL", () => {
    expect(isSameOrigin(h({ origin: "https://sk.example" }), "https://sk.example", "https://sk.example/api/enquiry")).toBe(true);
    expect(isSameOrigin(h({ origin: "https://evil.example" }), "https://sk.example", "https://sk.example/api/enquiry")).toBe(false);
    expect(isSameOrigin(h({ referer: "https://sk.example/contact" }), "https://sk.example", "https://sk.example/x")).toBe(true);
    expect(isSameOrigin(h({}), "https://sk.example", "https://sk.example/x")).toBe(false);
    expect(isSameOrigin(h({ origin: "null" }), "https://sk.example", "https://sk.example/x")).toBe(false);
  });

  it("falls back to the Host header when SITE_URL is unset", () => {
    expect(isSameOrigin(h({ origin: "http://localhost:3400", host: "localhost:3400" }), null, "http://localhost:3400/api")).toBe(true);
    expect(isSameOrigin(h({ origin: "http://attacker:3400", host: "localhost:3400" }), null, "http://localhost:3400/api")).toBe(false);
  });

  it("only trusts forwarded IPs behind a proxy, and only valid ones", () => {
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.9" }), false)).toBe("direct");
    // the right-most hop is the one our proxy added; a forged left-most value is ignored
    expect(clientIp(h({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" }), true)).toBe("203.0.113.9");
    expect(clientIp(h({ "x-real-ip": "1.2.3.4" }), true)).toBe("direct");
    expect(clientIp(h({ "x-forwarded-for": "<script>" }), true)).toBe("direct");
  });

  it("stops reading oversized bodies", async () => {
    const stream = new Blob([new Uint8Array(2048)]).stream();
    await expect(readBodyLimited(stream, 1024)).rejects.toBeInstanceOf(BodyTooLargeError);
    expect((await readBodyLimited(new Blob([new Uint8Array(512)]).stream(), 1024)).byteLength).toBe(512);
  });

  it("detects plain HTML form posts", () => {
    expect(wantsHtml(h({ accept: "text/html,application/xhtml+xml" }))).toBe(true);
    expect(wantsHtml(h({ accept: "application/json" }))).toBe(false);
  });
});

describe("rate limiter", () => {
  it("allows up to max per window, then blocks with Retry-After", () => {
    const rl = new SlidingWindowLimiter(3, 60_000);
    const t = 1_000_000;
    expect(rl.take("ip", t).allowed).toBe(true);
    expect(rl.take("ip", t + 1).allowed).toBe(true);
    expect(rl.take("ip", t + 2).allowed).toBe(true);
    const blocked = rl.take("ip", t + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(60);
    expect(rl.take("other", t + 3).allowed).toBe(true);
    expect(rl.take("ip", t + 60_001).allowed).toBe(true);
  });

  it("bounds memory under many distinct keys", () => {
    const rl = new SlidingWindowLimiter(1, 60_000, 100);
    for (let i = 0; i < 1000; i++) rl.take(`k${i}`, 5);
    expect((rl as unknown as { hits: Map<string, number[]> }).hits.size).toBeLessThanOrEqual(101);
  });
});

describe("references", () => {
  it("are well-formed and unique", () => {
    const refs = new Set(Array.from({ length: 500 }, () => makeReference(new Date("2026-11-01T10:00:00Z"))));
    expect(refs.size).toBe(500);
    for (const r of refs) expect(r).toMatch(REFERENCE_PATTERN);
    expect([...refs][0]!.startsWith("SSK-261101-")).toBe(true);
  });
});

describe("email", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">&'`)).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;");
  });

  it("never puts raw customer input into the HTML body", () => {
    const rec: EnquiryRecord = {
      reference: "SSK-261101-ABCDE",
      receivedAt: "2026-11-01T10:00:00.000Z",
      userAgent: "test",
      attachments: [],
      enquiry: {
        kind: "quote",
        name: "<b>Mallory</b>",
        company: "",
        email: "m@example.com",
        phone: "",
        country: "",
        message: "<script>alert(1)</script>",
        items: [{ slug: "shearing-blades", quantity: 2 }],
        machine: "",
        materialCut: "",
        materialThickness: null,
        bladeLength: 3100,
        bladeWidth: null,
        bladeThickness: null,
        cuttingEdges: "4",
        consent: "yes",
      },
    };
    const m = buildEnquiryEmail(rec);
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain("<b>Mallory");
    expect(m.html).toContain("&lt;script&gt;");
    expect(m.text).toContain("Shearing blades × 2");
    expect(m.text).toContain("Tool length: 3100 mm");
    expect(m.subject).toBe("[SSK-261101-ABCDE] RFQ from <b>Mallory</b>");
  });
});

describe("configuration", () => {
  it("defaults to file mail in development and requires SMTP settings in production", () => {
    expect(loadConfig({ NODE_ENV: "development" }).mail).toMatchObject({ transport: "file", ready: true });
    const prod = loadConfig({ NODE_ENV: "production" });
    expect(prod.mail.transport).toBe("smtp");
    expect(prod.mail.ready).toBe(false);
    expect(prod.mail.missing).toEqual(["SMTP_HOST", "MAIL_FROM", "ENQUIRY_TO"]);
    const ok = loadConfig({ NODE_ENV: "production", SMTP_HOST: "smtp.x", MAIL_FROM: "a@x.com", ENQUIRY_TO: "s@x.com, t@x.com" });
    expect(ok.mail.ready).toBe(true);
    expect(ok.mail.to).toEqual(["s@x.com", "t@x.com"]);
  });

  it("rejects malformed values", () => {
    expect(() => loadConfig({ SITE_URL: "not a url" })).toThrow();
    expect(() => loadConfig({ SMTP_PORT: "99999" })).toThrow();
  });
});

describe("content security policy", () => {
  it("allows scripts only by nonce in production", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
  });
});
