# S.S. Kalsi Industries — website

Company website for **S.S. Kalsi Industries, manufacturer of precision industrial tools**: product catalogue, manufacturing & quality, about, and a working enquiry / request-for-quotation system with drawing uploads and email delivery.

Built with Next.js 16 (App Router), React 19 and TypeScript (strict). No database server is required: enquiries are delivered by email and also written to an append-only log on disk.

---

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Content to confirm before launch](#content-to-confirm-before-launch)
- [Testing](#testing)
- Further docs: [Deployment](docs/DEPLOYMENT.md) · [Security](docs/SECURITY.md) · [Competitor research](docs/RESEARCH.md)

## Features

| Area | What it does |
| --- | --- |
| Hero slide banner | Full-width photo carousel with four slides (rolling mills, plate shears, manufacturing, recycling): slow zoom, progress bars, arrows, numbered tabs, swipe, pause button; pauses on hover/focus and never auto-plays with reduced motion (WAI-ARIA carousel pattern). |
| Photography | 7 licensed industrial photographs (shearing, grinding, heat treatment, coil, fabrication) on the home page, page banners, category tiles and process stages. Served by `next/image` as AVIF/WebP with blur placeholders. Credited on `/credits`. |
| Catalogue | 5 products in 4 families (shearing blades, trimming & slitting cutters, steel piercing punches, steel stamps). Filter by product type plus free-text search. Filters live in the URL (shareable) and work without JavaScript. |
| Product pages | Overview, specification table, "what to send us" checklist, related products, technical illustration, structured data. |
| Quote list | "Add to quote list" on any product; the list persists in the browser and is sent as one request with per-item quantities. |
| Enquiry / RFQ form | General question or quote request; machine and blade fields; drag-and-drop drawings (PDF, PNG, JPG, DXF, DWG, STEP). Instant client-side validation, authoritative server-side validation, reference number on success. Works without JavaScript (falls back to a normal form post). |
| Email | Each enquiry is emailed to the sales inbox via SMTP with drawings attached and Reply-To set to the customer. In development, emails are written as `.eml` files instead. |
| Site search | `/` or `Ctrl/⌘ K` opens a keyboard-navigable search over products and pages. |
| Pages | Home, Products, Product detail ×5, Manufacturing & Quality, About, Contact, Thank-you, Privacy, Photo credits, 404, error. |
| SEO | Per-page metadata and canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (Organization, BreadcrumbList, Product). |
| Accessibility | WCAG 2.1 AA checked with axe on every page; skip link, landmarks, labelled controls, focus management on errors, reduced-motion support. |
| Security | Nonce-based CSP, hardened headers, CSRF origin check, rate limiting, body-size cap, schema validation, magic-byte file checks, honeypot, no secrets in code. See [docs/SECURITY.md](docs/SECURITY.md). |

## Quick start

Requirements: **Node.js 20.9 or newer** (developed on Node 24).

```bash
npm ci
cp .env.example .env.local        # then edit; for local work the defaults are fine
npm run dev                       # http://localhost:3400
```

In development no SMTP server is needed: `MAIL_TRANSPORT` defaults to `file`, so each enquiry is written to `data/outbox/<reference>.eml` (open it with any mail client) and logged to `data/enquiries/YYYY-MM.jsonl`.

Production build:

```bash
npm run build
npm start                         # http://localhost:3400
```

For servers, Docker, reverse proxy and email setup see **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

## Configuration

All configuration is through environment variables — see [`.env.example`](.env.example) for the full list with comments. They are validated at start-up; invalid values stop the app with a clear error.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Production | Public origin, e.g. `https://www.example.com`. Used for canonical URLs, sitemap and the CSRF origin check. |
| `MAIL_TRANSPORT` | No | `smtp` (default in production) or `file` (default otherwise). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | With `smtp` | SMTP server. TLS is required (STARTTLS on 587 or implicit TLS on 465). |
| `MAIL_FROM` | With `smtp` | Sender address your provider allows. |
| `ENQUIRY_TO` | With `smtp` | Inbox(es) that receive enquiries, comma-separated. |
| `DATA_DIR` | No | Where enquiry logs and drawings are kept (default `./data`). Must be writable and outside the web root. |
| `TRUST_PROXY` | Behind a proxy | `true` when running behind a reverse proxy you control, so rate limiting sees real client IPs. |
| `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_SECONDS` | No | Enquiries per IP per window (default 8 per 600 s). |

If SMTP is not configured in production, the form tells visitors that online enquiries are temporarily unavailable (HTTP 503) rather than silently losing messages, and `/api/health` reports `degraded`.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server on port 3400 |
| `npm run build` / `npm start` | Production build / server on port 3400 |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; builds must be current — run `npm run build` first) |
| `npm run check` | typecheck + lint + unit tests |
| `npm run audit` | `npm audit` for production dependencies |
| `node scripts/fetch-images.mjs` | Re-downloads the photo set from Wikimedia Commons and rewrites the credits file |
| `node scripts/screenshots.mjs [url] [dir]` | Full-page screenshots of every page at desktop and mobile width; reports console errors and horizontal overflow |

## Project structure

```
src/
  app/                    Routes (App Router)
    api/enquiry/route.ts  Enquiry endpoint: origin check → rate limit → size cap → validate → store → email
    api/health/route.ts   Health probe
    products/[slug]/      Product pages (statically known slugs; unknown slugs 404)
    globals.css           Design system (tokens, layout, components)
    layout.tsx            Fonts (self-hosted at build), header, footer, JSON-LD
    photo.css             Hero slider, ticker, photo tiles, banners
    credits/              Photo credits page
  components/             UI components (header, search, catalogue filters, enquiry form, drawings…)
  content/                All site copy and data — edit here, not in components
    company.ts            Company facts (empty until confirmed; see below)
    products.ts           Product range and categories
    process.ts            Ordering steps, manufacturing stages, FAQ
    images.ts             Photo set and where each photo is used (+ image-credits.json)
public/images/            Photographs (2000 px masters; resized per device by next/image)
  lib/                    Logic: config, validation schema, catalogue/search, files, mail, storage, rate limit
  proxy.ts                Per-request CSP nonce (Next.js 16 "proxy", formerly middleware)
tests/
  unit/                   Vitest: validation, security helpers, catalogue, config, CSP
  e2e/                    Playwright: pages, a11y, navigation, search, catalogue, quote list, enquiry flows, API, headers
docs/                     Deployment, security, research
```

Design notes: photography carries the mood (hot steel, sparks, heavy machines) and technical drawings carry the precision — each product has its own engineering-style SVG drawing (`src/components/ToolDrawing.tsx`). Accent colours are temper colours (the straw-to-blue oxide colours of tempered steel). Typography: Archivo (display, using its width axis), IBM Plex Sans (text) and IBM Plex Mono (labels), self-hosted by `next/font`.

## Content to confirm before launch

The brief was explicit: **do not invent company information, certifications or technical specifications.** Only the company name and trade were known, so:

1. **Company facts** in [`src/content/company.ts`](src/content/company.ts) — name and year established (2010) are filled in. Legal name, phone, public email, WhatsApp, addresses, certifications, registration numbers (GSTIN etc.), business hours and social links are still empty. The UI shows each item only once it has a value. Add at least a phone number or email so visitors have a fallback when the form is unavailable.
2. **Product range** ([`src/content/products.ts`](src/content/products.ts)) is taken from the company's own description. No dimensions, hardness values or tolerances are claimed.
3. **Process wording** ([`src/content/process.ts`](src/content/process.ts)) is taken from the company's own About text.
4. **Privacy notice** ([`src/app/privacy/page.tsx`](src/app/privacy/page.tsx)) describes what the code actually does. Have it reviewed for your jurisdiction (e.g. India's DPDP Act 2023, GDPR for EU customers) and add a retention period.
5. **Photography** — the site uses 7 real photographs from Wikimedia Commons (CC BY / CC BY-SA / public domain, commercial use allowed with credit). They illustrate metalworking in general, **not S.S. Kalsi Industries' own works**, and the `/credits` page says so and credits each author as the licences require. Nothing was taken from competitor sites and no AI-generated images are used. Replace them with the company's own photographs (works, machines, finished tools, team) as soon as possible — that is the single biggest upgrade available: put the files in `public/images/`, point the entries in `src/content/images.ts` at them, and remove the replaced entries from `image-credits.json`. `scripts/fetch-images.mjs` re-downloads the current set.

## Testing

```bash
npm run check                    # typecheck + lint + 44 unit tests
npm run build && npm run test:e2e   # 79 end-to-end tests on desktop and mobile viewports
```

End-to-end tests start their own production server on port 3401 with `MAIL_TRANSPORT=file` and `DATA_DIR=./data/e2e`, and use the installed Google Chrome (`PW_CHANNEL=chromium` switches to Playwright's bundled browser after `npx playwright install chromium`).

They cover: the hero slide banner (arrows, tabs, pause, hidden slides inert), every photograph loading and credited, every page (status, single h1, title, no console or CSP errors, no horizontal scroll, axe WCAG 2.1 AA), navigation (desktop and mobile menu, skip link, footer links), site search, catalogue filtering (with and without JavaScript, hostile query strings), the quote list, the enquiry form (client validation and focus, file rejection, full quote with drawing verified in the stored record and generated email, general question, no-JavaScript submission and server-side errors), the API (CSRF, content type, field errors, disguised and oversized uploads, honeypot, rate limit, method) and security headers (nonce CSP on every script, rotating nonce, header set).
