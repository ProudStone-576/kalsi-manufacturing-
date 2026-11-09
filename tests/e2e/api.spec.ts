import { expect, test, type APIRequestContext } from "@playwright/test";
import { freshIp, PDF_BYTES } from "./helpers";

const valid = {
  kind: "general",
  name: "API Tester",
  email: "api@example.com",
  message: "Checking the enquiry endpoint behaves.",
  consent: "yes",
};

function post(request: APIRequestContext, baseURL: string, opts: { multipart?: Record<string, unknown>; headers?: Record<string, string>; data?: string }) {
  return request.post("/api/enquiry", {
    headers: { origin: baseURL, accept: "application/json", "x-forwarded-for": freshIp(), ...opts.headers },
    ...(opts.multipart ? { multipart: opts.multipart as never } : {}),
    ...(opts.data !== undefined ? { data: opts.data } : {}),
  });
}

test.describe("enquiry API", () => {
  test("accepts a valid enquiry", async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, { multipart: valid });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({ ok: true, reference: expect.stringMatching(/^SSK-/) });
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("rejects cross-site and origin-less posts (CSRF)", async ({ request, baseURL }) => {
    expect((await post(request, baseURL!, { multipart: valid, headers: { origin: "https://evil.example" } })).status()).toBe(403);
    const noOrigin = await request.post("/api/enquiry", { multipart: valid, headers: { "x-forwarded-for": freshIp() } });
    expect(noOrigin.status()).toBe(403);
  });

  test("rejects JSON and other content types", async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, { data: JSON.stringify(valid), headers: { "content-type": "application/json" } });
    expect(res.status()).toBe(415);
  });

  test("returns field errors for invalid input", async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, {
      multipart: { ...valid, email: "nope", name: "Bad\r\nBcc: x@y.z", itemSlug: "../../etc/passwd", itemQty: "1", kind: "quote" },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.fields).toMatchObject({ email: expect.any(String), name: expect.any(String), items: expect.any(String) });
  });

  test("rejects disguised and oversized uploads", async ({ request, baseURL }) => {
    const fake = await post(request, baseURL!, {
      multipart: { ...valid, drawings: { name: "drawing.pdf", mimeType: "application/pdf", buffer: Buffer.from("<html>not a pdf</html>") } },
    });
    expect(fake.status()).toBe(422);
    expect((await fake.json()).fields.drawings).toMatch(/does not look like a valid \.pdf/);

    const big = await post(request, baseURL!, {
      multipart: { ...valid, drawings: { name: "huge.pdf", mimeType: "application/pdf", buffer: Buffer.concat([PDF_BYTES, Buffer.alloc(21 * 1024 * 1024)]) } },
    });
    expect(big.status()).toBe(413);
  });

  test("silently drops honeypot submissions", async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, { multipart: { ...valid, website: "http://spam.example" } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, reference: null });
  });

  test("rate limits repeated submissions from one client", async ({ request, baseURL }) => {
    const ip = freshIp();
    const statuses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const res = await post(request, baseURL!, { multipart: { ...valid, email: "bad" }, headers: { "x-forwarded-for": ip } });
      statuses.push(res.status());
      if (res.status() === 429) expect(Number(res.headers()["retry-after"])).toBeGreaterThan(0);
    }
    expect(statuses.slice(0, 6)).toEqual([422, 422, 422, 422, 422, 422]);
    expect(statuses.slice(6)).toEqual([429, 429]);
  });

  test("GET is not allowed", async ({ request }) => {
    const res = await request.get("/api/enquiry");
    expect(res.status()).toBe(405);
  });
});

test.describe("security headers", () => {
  test("documents carry a nonce-based CSP and hardening headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["x-powered-by"]).toBeUndefined();
    const nonce = /'nonce-([^']+)'/.exec(h["content-security-policy"]!)![1];
    const html = await res.text();
    // every inline or external script on the page carries the nonce
    const scripts = html.match(/<script\b[^>]*>/g) ?? [];
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) expect(s, s).toContain(`nonce="${nonce}"`);
  });

  test("each request gets a different nonce", async ({ request }) => {
    const a = (await request.get("/about")).headers()["content-security-policy"];
    const b = (await request.get("/about")).headers()["content-security-policy"];
    expect(a).not.toBe(b);
  });

  test("health endpoint reveals no configuration", async ({ request }) => {
    const body = await (await request.get("/api/health")).json();
    expect(Object.keys(body).sort()).toEqual(["enquiries", "status"]);
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).toContain("/products/shearing-blades");
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  });
});
