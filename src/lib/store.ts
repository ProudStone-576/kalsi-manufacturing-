import { mkdir, appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Enquiry } from "./enquiry-schema";
import type { CheckedFile } from "./files";

export type EnquiryRecord = {
  reference: string;
  receivedAt: string;
  enquiry: Enquiry;
  attachments: { filename: string; storedAs: string; bytes: number; mime: string }[];
  /** Truncated client hint for abuse review; never a full fingerprint. */
  userAgent: string;
};

/**
 * Append-only enquiry log: one JSON line per enquiry in DATA_DIR/enquiries/YYYY-MM.jsonl, and the
 * drawings under DATA_DIR/uploads/<reference>/ with server-chosen names. DATA_DIR sits outside
 * the web root, so nothing stored here is ever served.
 */
export async function saveEnquiry(
  dataDir: string,
  rec: Omit<EnquiryRecord, "attachments">,
  files: CheckedFile[],
): Promise<EnquiryRecord> {
  const root = path.resolve(dataDir);
  const uploadDir = path.join(root, "uploads", rec.reference);
  const attachments: EnquiryRecord["attachments"] = [];

  if (files.length) {
    await mkdir(uploadDir, { recursive: true, mode: 0o750 });
    for (const [i, f] of files.entries()) {
      const storedAs = `${String(i + 1).padStart(2, "0")}.${f.ext}`;
      await writeFile(path.join(uploadDir, storedAs), f.bytes, { mode: 0o640, flag: "wx" });
      attachments.push({ filename: f.filename, storedAs, bytes: f.bytes.byteLength, mime: f.mime });
    }
  }

  const record: EnquiryRecord = { ...rec, attachments };
  const logDir = path.join(root, "enquiries");
  await mkdir(logDir, { recursive: true, mode: 0o750 });
  const file = path.join(logDir, `${rec.receivedAt.slice(0, 7)}.jsonl`);
  await appendFile(file, JSON.stringify(record) + "\n", { mode: 0o640 });
  return record;
}

export async function recordMailOutcome(dataDir: string, reference: string, status: "sent" | "failed", detail?: string) {
  const logDir = path.join(path.resolve(dataDir), "enquiries");
  await mkdir(logDir, { recursive: true, mode: 0o750 });
  const line = JSON.stringify({ reference, mail: status, detail: detail?.slice(0, 300), at: new Date().toISOString() });
  await appendFile(path.join(logDir, "mail-status.jsonl"), line + "\n", { mode: 0o640 });
}
