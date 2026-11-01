# Security

Threat model: a public marketing site with one write path — the enquiry form, which accepts personal data and file uploads and sends email. There are no user accounts, no admin panel and no database server, which removes whole classes of risk (credential theft, session hijacking, SQL injection, privilege escalation).

## Controls

| Risk | Control | Where |
| --- | --- | --- |
| XSS | React escapes all output; no `dangerouslySetInnerHTML` with user data (only JSON-LD built from our own content, with `<` escaped). Strict CSP: scripts only with a per-request nonce + `strict-dynamic`, no `unsafe-inline`/`unsafe-eval` in production, `object-src 'none'`, `base-uri 'self'`. | `src/proxy.ts`, `src/components/JsonLd.tsx` |
| HTML injection in emails | All customer values HTML-escaped in the email body; plain-text part included. | `src/lib/mail.ts` |
| Email header injection | Single-line fields reject CR/LF and Unicode line separators; nodemailer encodes headers. | `src/lib/enquiry-schema.ts` |
| Mail relay abuse | No auto-reply is sent to the submitted address, so the form cannot be used to mail third parties. Customer address goes only into Reply-To. | `src/lib/mail.ts` |
| CSRF | POSTs must carry an `Origin` (or `Referer`) matching `SITE_URL`; missing/`null` origin rejected. Only form encodings accepted (415 otherwise). `form-action 'self'` in CSP. No cookies or sessions to ride. | `src/lib/http.ts`, route |
| SQL / NoSQL injection | No database queries. Enquiries are serialised with `JSON.stringify` to an append-only file. | `src/lib/store.ts` |
| Input validation | Zod schema on the server (authoritative) and client (UX): lengths, formats, enums, numeric ranges, known product slugs, item caps, duplicate detection, control characters, Unicode normalisation. URL query parameters on the catalogue are reduced to known values. | `src/lib/enquiry-schema.ts`, `src/lib/catalog.ts` |
| Malicious uploads | Extension allowlist, per-file and total size limits, max 3 files, and magic-byte signature check so content must match its extension. Files are stored outside the web root with server-chosen names (`01.pdf`) and are never served back. Original names are sanitised before use as attachment names. | `src/lib/files.ts`, `src/lib/store.ts` |
| Path traversal | Storage paths are built only from the server-generated reference and index. | `src/lib/store.ts` |
| Denial of service | Body read through a streaming byte cap (rejects >20.5 MB without buffering it all; `Content-Length` pre-check). Per-IP sliding-window rate limit with `Retry-After`; limiter memory bounded. nginx `client_max_body_size` as an outer limit. | `src/lib/http.ts`, `src/lib/rate-limit.ts` |
| IP spoofing to dodge limits | Forwarded headers ignored unless `TRUST_PROXY=true`; then only the right-most `X-Forwarded-For` hop (the one the proxy appended) is used. | `src/lib/http.ts` |
| Bots / spam | Hidden honeypot field (bots get a fake success and nothing is stored), plus rate limiting. | form + route |
| Clickjacking | `frame-ancestors 'none'` and `X-Frame-Options: DENY`. | `src/proxy.ts`, `next.config.ts` |
| Transport | HSTS (2 years, preload-ready), `upgrade-insecure-requests`; SMTP requires TLS ≥ 1.2 with certificate verification. | `next.config.ts`, `src/lib/mail.ts` |
| Information leakage | `X-Powered-By` removed; API errors are generic; health endpoint exposes no settings; internal errors logged server-side only. | config, routes |
| Secrets | Only in environment variables, validated at start-up; `.env*` git- and docker-ignored; `.env.example` has no real values. | `src/lib/config.ts` |
| Other headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy: same-origin`, `Cache-Control: no-store` on the API. | `next.config.ts` |
| Third-party content | Photographs are self-hosted (no hotlinking), so the CSP keeps `img-src 'self'`; no third-party scripts, fonts or trackers. |
| Supply chain | Minimal runtime dependencies (next, react, react-dom, zod, nodemailer); lockfile committed; `npm run audit`. | `package.json` |
| Container | Non-root user, read-only root filesystem, all capabilities dropped, `no-new-privileges`, bound to localhost. | `Dockerfile`, `docker-compose.yml` |

## Known trade-offs

- **`style-src 'unsafe-inline'`**: React style attributes (used for a few computed SVG/layout values) need it. Inline *scripts* remain blocked, which is where the XSS risk is.
- **In-memory rate limiter** resets on restart and is per instance — see DEPLOYMENT §7.
- **Uploaded files are not virus-scanned.** They are type-checked and never served, but they are emailed to staff. Staff should open drawings with up-to-date software; for higher assurance, add a ClamAV scan in `checkAttachments`.
- **Honeypot + rate limit** stop casual spam. If targeted spam appears, add a privacy-friendly challenge (e.g. Cloudflare Turnstile) to the form and verify its token in the route.

## Dependency audit (at delivery)

- `npm audit --omit=dev`: **0 vulnerabilities** in production dependencies.
- `npm audit` (including dev): 16 *moderate* advisories, all one chain — `minimatch` used by ESLint and its plugins (ReDoS in glob patterns). ESLint only runs on developer machines and in CI against our own files; it is not part of the built site. The fix requires a breaking ESLint major; revisit when `eslint-config-next` supports it.

## Verification

Automated: `tests/unit/security.test.ts` (file signatures, filename sanitising, origin checks, IP handling, body cap, rate limiter, references, email escaping, config, CSP) and `tests/e2e/api.spec.ts` (CSRF, content type, validation, disguised/oversized uploads, honeypot, rate limit, method, nonce on every script, rotating nonce, header set). Every page is also checked in a real browser for CSP violations and console errors.

## Reporting

Report suspected vulnerabilities privately to the site owner (add a contact to `company.ts` and, ideally, a `/.well-known/security.txt`).
