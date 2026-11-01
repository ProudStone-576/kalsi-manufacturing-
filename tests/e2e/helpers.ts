import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";

export const DATA_DIR = path.resolve("data/e2e");

let counter = 0;
/** A distinct documentation-range client address per test, so per-IP rate limits never collide. */
export function freshIp(): string {
  counter += 1;
  return `198.51.100.${(process.pid + counter) % 250 + 1}`;
}

export async function asFreshClient(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}` });
}

export const PDF_BYTES = Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n");

export async function readOutbox(reference: string): Promise<string> {
  return readFile(path.join(DATA_DIR, "outbox", `${reference}.eml`), "utf8");
}

export async function findRecord(reference: string): Promise<Record<string, unknown> | null> {
  const dir = path.join(DATA_DIR, "enquiries");
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".jsonl") || f.startsWith("mail")) continue;
    for (const line of (await readFile(path.join(dir, f), "utf8")).split("\n")) {
      if (line.includes(reference)) return JSON.parse(line) as Record<string, unknown>;
    }
  }
  return null;
}

/** Collects console errors (including CSP violations) for a page. */
export function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}
