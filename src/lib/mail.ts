import nodemailer, { type Transporter } from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppConfig } from "./config";
import type { EnquiryRecord } from "./store";
import type { CheckedFile } from "./files";
import { productBySlug } from "@/content/products";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Row = [label: string, value: string];

export function enquiryRows(rec: EnquiryRecord): Row[] {
  const e = rec.enquiry;
  const mm = (n: number | null) => (n === null ? "" : `${n} mm`);
  const rows: Row[] = [
    ["Reference", rec.reference],
    ["Type", e.kind === "quote" ? "Request for quotation" : "General enquiry"],
    ["Name", e.name],
    ["Company", e.company],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Country", e.country],
    ["Machine", e.machine],
    ["Material being cut", e.materialCut],
    ["Material thickness", mm(e.materialThickness)],
    ["Blade length", mm(e.bladeLength)],
    ["Blade width", mm(e.bladeWidth)],
    ["Blade thickness", mm(e.bladeThickness)],
    ["Cutting edges", e.cuttingEdges === "unsure" ? "Not sure" : e.cuttingEdges],
  ];
  return rows.filter(([, v]) => v !== "");
}

export function buildEnquiryEmail(rec: EnquiryRecord) {
  const e = rec.enquiry;
  const rows = enquiryRows(rec);
  const items = e.items.map((i) => `${productBySlug.get(i.slug)?.name ?? i.slug} × ${i.quantity}`);
  const files = rec.attachments.map((a) => `${a.filename} (${Math.ceil(a.bytes / 1024)} KB)`);

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(items.length ? ["", "Blades:", ...items.map((s) => `  - ${s}`)] : []),
    "",
    "Message:",
    e.message,
    ...(files.length ? ["", "Attached drawings:", ...files.map((s) => `  - ${s}`)] : []),
  ].join("\n");

  const td = 'style="padding:6px 12px;border-bottom:1px solid #ddd;vertical-align:top"';
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#14171a">
<h2 style="margin:0 0 12px">${escapeHtml(rows[1]?.[1] ?? "Enquiry")} — ${escapeHtml(rec.reference)}</h2>
<table style="border-collapse:collapse;font-size:14px">${rows
    .map(([k, v]) => `<tr><th align="left" ${td}>${escapeHtml(k)}</th><td ${td}>${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
${items.length ? `<h3>Blades</h3><ul>${items.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}
<h3>Message</h3><p style="white-space:pre-wrap">${escapeHtml(e.message)}</p>
${files.length ? `<h3>Attached drawings</h3><ul>${files.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}
</body></html>`;

  const subjectName = e.company || e.name;
  const subject = `[${rec.reference}] ${e.kind === "quote" ? "RFQ" : "Enquiry"} from ${subjectName}`.slice(0, 180);
  return { subject, text, html };
}

let smtp: Transporter | null = null;

function smtpTransport(cfg: AppConfig): Transporter {
  smtp ??= nodemailer.createTransport({
    host: cfg.mail.smtp.host,
    port: cfg.mail.smtp.port,
    secure: cfg.mail.smtp.secure,
    requireTLS: !cfg.mail.smtp.secure,
    auth: cfg.mail.smtp.user ? { user: cfg.mail.smtp.user, pass: cfg.mail.smtp.pass ?? "" } : undefined,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return smtp;
}

/**
 * Sends the enquiry to the sales inbox. Reply-To is the customer so staff can answer directly.
 * No auto-reply is sent to the submitted address: that would let anyone use the form to mail a third party.
 */
export async function sendEnquiryMail(cfg: AppConfig, rec: EnquiryRecord, files: CheckedFile[]): Promise<void> {
  const { subject, text, html } = buildEnquiryEmail(rec);
  const message = {
    from: cfg.mail.from,
    to: cfg.mail.to,
    replyTo: { name: rec.enquiry.name, address: rec.enquiry.email },
    subject,
    text,
    html,
    attachments: files.map((f, i) => ({
      filename: rec.attachments[i]?.filename ?? `drawing.${f.ext}`,
      content: f.bytes,
      contentType: f.mime,
    })),
    headers: { "X-Enquiry-Reference": rec.reference },
    disableFileAccess: true,
    disableUrlAccess: true,
  };

  if (cfg.mail.transport === "file") {
    const t = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
    const info = await t.sendMail(message);
    const dir = path.join(path.resolve(cfg.dataDir), "outbox");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${rec.reference}.eml`), info.message as Buffer);
    return;
  }
  await smtpTransport(cfg).sendMail(message);
}
