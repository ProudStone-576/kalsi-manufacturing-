import { NextResponse, type NextRequest } from "next/server";
import { getConfig } from "@/lib/config";
import { enquirySchema, fieldErrors, formDataToInput, ATTACHMENT_RULES } from "@/lib/enquiry-schema";
import { checkAttachments } from "@/lib/files";
import { BodyTooLargeError, clientIp, isSameOrigin, readBodyLimited, wantsHtml } from "@/lib/http";
import { SlidingWindowLimiter } from "@/lib/rate-limit";
import { makeReference } from "@/lib/reference";
import { recordMailOutcome, saveEnquiry } from "@/lib/store";
import { sendEnquiryMail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Attachments plus form fields and multipart framing.
const MAX_BODY = ATTACHMENT_RULES.maxTotalBytes + 512 * 1024;

const cfg = getConfig();
const limiter = new SlidingWindowLimiter(cfg.rateLimit.max, cfg.rateLimit.windowMs);

if (cfg.isProduction && !cfg.trustProxy && process.env.NEXT_PHASE !== "phase-production-build") {
  console.warn(
    "[enquiry] TRUST_PROXY is off: all visitors share one rate-limit bucket. Behind a reverse proxy, set TRUST_PROXY=true (see docs/DEPLOYMENT.md).",
  );
}

type ErrorCode = "forbidden" | "unsupported" | "rate_limited" | "too_large" | "invalid" | "unavailable" | "server";

function fail(req: NextRequest, status: number, code: ErrorCode, message: string, extra: Record<string, unknown> = {}, headers: HeadersInit = {}) {
  if (wantsHtml(req.headers)) {
    // Plain HTML form post without JavaScript: send the visitor back to the form with a status code.
    return NextResponse.redirect(new URL(`/contact?status=${code}`, req.url), { status: 303, headers });
  }
  return NextResponse.json({ ok: false, code, message, ...extra }, { status, headers });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req.headers, cfg.siteUrl, req.url)) {
    return fail(req, 403, "forbidden", "This form must be submitted from the website.");
  }

  const type = req.headers.get("content-type") ?? "";
  if (!type.startsWith("multipart/form-data") && !type.startsWith("application/x-www-form-urlencoded")) {
    return fail(req, 415, "unsupported", "Unsupported request format.");
  }

  const ip = clientIp(req.headers, cfg.trustProxy);
  const rl = limiter.take(ip);
  if (!rl.allowed) {
    return fail(
      req,
      429,
      "rate_limited",
      `Too many enquiries from your connection. Please try again in ${Math.ceil(rl.retryAfter / 60)} minute(s).`,
      { retryAfter: rl.retryAfter },
      { "Retry-After": String(rl.retryAfter) },
    );
  }

  if (!cfg.mail.ready) {
    console.error(`[enquiry] mail not configured, missing: ${cfg.mail.missing.join(", ")}`);
    return fail(req, 503, "unavailable", "Online enquiries are temporarily unavailable. Please email or call us directly.");
  }

  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY) return fail(req, 413, "too_large", `Attachments total more than ${ATTACHMENT_RULES.totalMb} MB.`);

  let form: FormData;
  try {
    const raw = await readBodyLimited(req.body, MAX_BODY);
    form = await new Response(raw as BodyInit, { headers: { "content-type": type } }).formData();
  } catch (err) {
    if (err instanceof BodyTooLargeError) return fail(req, 413, "too_large", `Attachments total more than ${ATTACHMENT_RULES.totalMb} MB.`);
    return fail(req, 400, "invalid", "The form could not be read. Please try again.");
  }

  // Honeypot: real visitors never see or fill this field. Answer like a success so bots learn nothing.
  const trap = form.get("website");
  if (typeof trap === "string" && trap.trim() !== "") {
    return wantsHtml(req.headers)
      ? NextResponse.redirect(new URL("/contact/thank-you", req.url), 303)
      : NextResponse.json({ ok: true, reference: null }, { status: 200 });
  }

  const parsed = enquirySchema.safeParse(formDataToInput(form));
  if (!parsed.success) {
    return fail(req, 422, "invalid", "Please correct the highlighted fields.", { fields: fieldErrors(parsed.error) });
  }

  const files = await checkAttachments(form.getAll("drawings"));
  if (!files.ok) {
    return fail(req, 422, "invalid", files.error, { fields: { drawings: files.error } });
  }

  const reference = makeReference();
  try {
    const record = await saveEnquiry(
      cfg.dataDir,
      {
        reference,
        receivedAt: new Date().toISOString(),
        enquiry: parsed.data,
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 160),
      },
      files.files,
    );

    try {
      await sendEnquiryMail(cfg, record, files.files);
      await recordMailOutcome(cfg.dataDir, reference, "sent");
    } catch (err) {
      // The enquiry is safely stored; staff are alerted through logs and the mail-status file.
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[enquiry] ${reference} stored but mail delivery failed: ${detail}`);
      await recordMailOutcome(cfg.dataDir, reference, "failed", detail).catch(() => undefined);
    }
  } catch (err) {
    console.error(`[enquiry] could not store enquiry: ${err instanceof Error ? err.message : String(err)}`);
    return fail(req, 500, "server", "We could not save your enquiry. Please try again, or contact us directly.");
  }

  if (wantsHtml(req.headers)) {
    return NextResponse.redirect(new URL(`/contact/thank-you?ref=${reference}`, req.url), 303);
  }
  return NextResponse.json({ ok: true, reference }, { status: 201 });
}

export function GET() {
  return NextResponse.json({ ok: false, code: "method_not_allowed" }, { status: 405, headers: { Allow: "POST" } });
}
