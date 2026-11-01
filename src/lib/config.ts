import { z } from "zod";

const boolish = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((v) => v === "true" || v === "1");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SITE_URL: z.url().optional(),
  MAIL_TRANSPORT: z.enum(["smtp", "file"]).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: boolish,
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(3).optional(),
  ENQUIRY_TO: z.string().min(3).optional(),
  DATA_DIR: z.string().min(1).optional(),
  VERCEL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  TRUST_PROXY: boolish,
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10_000).default(8),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(10).max(86_400).default(600),
});

export type AppConfig = ReturnType<typeof loadConfig>;

/** Reads and validates environment variables. Empty strings are treated as unset. */
export function loadConfig(env: Record<string, string | undefined> = process.env) {
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined && v !== ""));
  const e = envSchema.parse(cleaned);
  const transport = e.MAIL_TRANSPORT ?? (e.NODE_ENV === "production" ? "smtp" : "file");
  const recipients = (e.ENQUIRY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const mailProblems: string[] = [];
  if (transport === "smtp") {
    if (!e.SMTP_HOST) mailProblems.push("SMTP_HOST");
    if (!e.MAIL_FROM) mailProblems.push("MAIL_FROM");
    if (recipients.length === 0) mailProblems.push("ENQUIRY_TO");
  }

  const onVercel = e.VERCEL === "1";
  return {
    isProduction: e.NODE_ENV === "production",
    onVercel,
    /** Explicit public origin: used for the CSRF origin check. When unset, the request's own Host is used. */
    siteUrl: e.SITE_URL ? new URL(e.SITE_URL).origin : null,
    /** Origin for canonical URLs and the sitemap: SITE_URL, else Vercel's production domain. */
    canonicalOrigin: e.SITE_URL
      ? new URL(e.SITE_URL).origin
      : e.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${e.VERCEL_PROJECT_PRODUCTION_URL}`
        : null,
    // Vercel's file system is read-only apart from /tmp (which is per-instance and temporary).
    dataDir: e.DATA_DIR ?? (onVercel ? "/tmp/sk-kalsi" : "./data"),
    // Vercel's edge sets X-Forwarded-For itself, so it is trustworthy there.
    trustProxy: e.TRUST_PROXY || onVercel,
    rateLimit: { max: e.RATE_LIMIT_MAX, windowMs: e.RATE_LIMIT_WINDOW_SECONDS * 1000 },
    mail: {
      transport,
      ready: mailProblems.length === 0,
      missing: mailProblems,
      from: e.MAIL_FROM ?? "S.K. Kalsi Website <no-reply@localhost>",
      to: recipients.length ? recipients : ["enquiries@localhost"],
      smtp: {
        host: e.SMTP_HOST ?? "",
        port: e.SMTP_PORT,
        secure: e.SMTP_SECURE,
        user: e.SMTP_USER,
        pass: e.SMTP_PASS,
      },
    },
  } as const;
}

let cached: AppConfig | null = null;
export function getConfig(): AppConfig {
  cached ??= loadConfig();
  return cached;
}

/** Public site origin for canonical URLs; falls back to localhost in development. */
export function siteOrigin(): string {
  return getConfig().canonicalOrigin ?? "http://localhost:3400";
}
