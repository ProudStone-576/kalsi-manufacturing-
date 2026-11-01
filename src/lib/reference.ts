import { randomInt } from "node:crypto";

// Crockford base32 without I, L, O, U: easy to read out over the phone.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const REFERENCE_PATTERN = /^SKK-\d{6}-[0-9A-HJKMNP-TV-Z]{5}$/;

/** Human-friendly enquiry reference, e.g. SKK-261101-7Q2MD. */
export function makeReference(now = new Date()): string {
  const d = now.toISOString().slice(2, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `SKK-${d}-${suffix}`;
}
