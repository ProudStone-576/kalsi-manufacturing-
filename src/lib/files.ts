import { ATTACHMENT_RULES } from "./enquiry-schema";

export type CheckedFile = { filename: string; ext: string; mime: string; bytes: Buffer };
export type FileCheck = { ok: true; files: CheckedFile[] } | { ok: false; error: string };

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  dxf: "image/vnd.dxf",
  dwg: "image/vnd.dwg",
  step: "model/step",
  stp: "model/step",
};

const startsWith = (b: Buffer, sig: number[]) => sig.every((v, i) => b[i] === v);

/** Checks the file content really is the type its extension claims. */
export function sniffMatches(ext: string, b: Buffer): boolean {
  switch (ext) {
    case "pdf":
      return b.subarray(0, 5).toString("latin1") === "%PDF-";
    case "png":
      return startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "jpg":
    case "jpeg":
      return startsWith(b, [0xff, 0xd8, 0xff]);
    case "dwg":
      return /^AC10\d\d/.test(b.subarray(0, 6).toString("latin1"));
    case "dxf": {
      // ASCII DXF starts with group code 0 then SECTION; binary DXF has a fixed sentinel.
      if (b.subarray(0, 22).toString("latin1") === "AutoCAD Binary DXF\r\n\u001a\u0000") return true;
      const body = startsWith(b, [0xef, 0xbb, 0xbf]) ? b.subarray(3) : b; // skip a UTF-8 byte-order mark
      const head = body.subarray(0, 64).toString("latin1");
      return /^\s*0\s*\r?\n\s*SECTION/.test(head) || /^\s*999\s*\r?\n/.test(head);
    }
    case "step":
    case "stp":
      return b.subarray(0, 13).toString("latin1") === "ISO-10303-21;";
    default:
      return false;
  }
}

/** Reduces a client filename to a safe display name: no paths, control chars or odd punctuation. */
export function safeFilename(name: string, fallbackExt: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._ -]+/gu, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^[.\s]+/, "")
    .slice(0, 100)
    .trim();
  return cleaned && cleaned.includes(".") ? cleaned : `drawing.${fallbackExt}`;
}

/** Validates uploaded drawings: count, size, extension allowlist and content signature. */
export async function checkAttachments(entries: FormDataEntryValue[]): Promise<FileCheck> {
  const files = entries.filter((e): e is File => typeof e !== "string" && e.size > 0);
  if (files.length > ATTACHMENT_RULES.maxFiles) {
    return { ok: false, error: `Attach up to ${ATTACHMENT_RULES.maxFiles} files.` };
  }
  let total = 0;
  const out: CheckedFile[] = [];
  for (const f of files) {
    const ext = (f.name.split(".").pop() ?? "").toLowerCase();
    if (!(ATTACHMENT_RULES.extensions as readonly string[]).includes(ext)) {
      return { ok: false, error: `“${f.name.slice(0, 60)}” is not an accepted file type.` };
    }
    if (f.size > ATTACHMENT_RULES.maxFileBytes) {
      return { ok: false, error: `“${f.name.slice(0, 60)}” is larger than ${ATTACHMENT_RULES.fileMb} MB.` };
    }
    total += f.size;
    if (total > ATTACHMENT_RULES.maxTotalBytes) return { ok: false, error: `Attachments total more than ${ATTACHMENT_RULES.totalMb} MB.` };
    const bytes = Buffer.from(await f.arrayBuffer());
    if (!sniffMatches(ext, bytes)) {
      return { ok: false, error: `“${f.name.slice(0, 60)}” does not look like a valid .${ext} file.` };
    }
    out.push({ filename: safeFilename(f.name, ext), ext, mime: MIME[ext] ?? "application/octet-stream", bytes });
  }
  return { ok: true, files: out };
}
