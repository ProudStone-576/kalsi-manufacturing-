import { isIP } from "node:net";

/**
 * Client IP for rate limiting. Forwarded headers are only honoured behind a trusted proxy, and then
 * only the right-most X-Forwarded-For entry is used: that is the address the proxy itself appended.
 * Entries to its left come from the client and can be forged to dodge the limit.
 */
export function clientIp(headers: Headers, trustProxy: boolean): string {
  if (trustProxy) {
    const hops = headers.get("x-forwarded-for")?.split(",") ?? [];
    const last = hops[hops.length - 1]?.trim();
    if (last && isIP(last)) return last;
  }
  return "direct";
}

/**
 * CSRF defence for form posts: the Origin (or Referer) must match the site's own origin.
 * `expected` is SITE_URL when configured; otherwise the Host the request arrived on.
 */
export function isSameOrigin(headers: Headers, expected: string | null, requestUrl: string): boolean {
  const allowed = new Set<string>();
  if (expected) allowed.add(expected);
  else {
    const host = headers.get("host");
    const proto = new URL(requestUrl).protocol;
    if (host) allowed.add(`${proto}//${host}`);
  }
  const origin = headers.get("origin");
  if (origin && origin !== "null") return allowed.has(origin);
  const referer = headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  // Browsers always send Origin on cross-site POSTs, so a missing header is a non-browser client.
  return false;
}

export class BodyTooLargeError extends Error {}

/** Reads a request body into memory, aborting as soon as it exceeds `limit` bytes. */
export async function readBodyLimited(body: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array> {
  if (!body) return new Uint8Array(0);
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new BodyTooLargeError(`Body exceeds ${limit} bytes`);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

export function wantsHtml(headers: Headers): boolean {
  const accept = headers.get("accept") ?? "";
  return accept.includes("text/html") && !accept.includes("application/json");
}
