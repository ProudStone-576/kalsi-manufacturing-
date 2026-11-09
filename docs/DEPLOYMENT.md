# Deployment

The site is a Node.js server (Next.js). It needs:

- Node.js 20.9+ (24 LTS recommended), or Docker
- A writable directory for enquiry records and uploaded drawings (`DATA_DIR`)
- An SMTP account to deliver enquiries
- HTTPS in front of it (reverse proxy or platform TLS)

Enquiries are always emailed; they are also written to an on-disk log. On a host with **persistent storage** (VPS, VM, container with a volume) that log is kept. On Vercel (§2b) the log goes to temporary `/tmp` storage, so **email is the only record** there.

---

## 1. Pre-flight checklist

- [ ] Company facts filled in `src/content/company.ts` (at least a phone or email) — see README "Content to confirm"
- [ ] `SITE_URL` set to the public origin (`https://…`, no trailing path)
- [ ] SMTP credentials tested (see §5)
- [ ] `DATA_DIR` on persistent storage, writable by the app user only, included in backups
- [ ] `TRUST_PROXY=true` if behind nginx/Caddy/a load balancer
- [ ] `npm run check`, `npm run build`, `npm run test:e2e` all pass
- [ ] `npm run audit` reports 0 production vulnerabilities

## 2b. Option — Vercel

The project deploys to Vercel with no extra configuration (framework preset: Next.js). The app detects Vercel and adapts automatically:

| On Vercel | Why |
| --- | --- |
| Upload limit is **4 MB total** (not 20 MB); form hints and errors say so | Vercel functions reject request bodies over 4.5 MB |
| `DATA_DIR` defaults to `/tmp/sk-kalsi` | the rest of the file system is read-only; `/tmp` is temporary, so email is the record |
| `TRUST_PROXY` is on | Vercel's edge sets `X-Forwarded-For` |
| Canonical URLs use the production domain (`VERCEL_PROJECT_PRODUCTION_URL`) unless `SITE_URL` is set | sitemap and SEO tags |
| CSRF check compares against the request's own host unless `SITE_URL` is set | works on preview and production URLs |

Set these in **Project → Settings → Environment Variables** (Production), then redeploy:

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ENQUIRY_TO` — and `SITE_URL` once a custom domain is attached.

Until the SMTP variables are set, the site works fully but the enquiry form answers "Online enquiries are temporarily unavailable" (HTTP 503) instead of losing messages, and `/api/health` reports `degraded`.

The rate limiter is per function instance on Vercel, so it is weaker than on a single server; add Vercel's WAF rate-limit rule for `POST /api/enquiry` (e.g. 10 per 10 minutes per IP) for a hard limit.

CLI: `npx vercel` (preview) / `npx vercel --prod` (production). With the GitHub repository connected, every push to `main` deploys to production and every other branch gets a preview URL.

## 2. Option A — Docker (recommended)

```bash
cp .env.example .env      # fill in real values; never commit this file
docker compose up -d --build
curl -s http://127.0.0.1:3000/api/health     # {"status":"ok","enquiries":"available"}
```

The image is multi-stage, runs as a non-root user, uses Next.js standalone output, and keeps enquiries in the `enquiries` volume mounted at `/data`. `docker-compose.yml` additionally runs the container with a read-only root filesystem, no Linux capabilities and `no-new-privileges`, and binds only to `127.0.0.1` — put the reverse proxy (§4) in front.

`SITE_URL` is passed as a build argument because it is baked into the sitemap, robots.txt and canonical URLs at build time; rebuild if the domain changes.

## 3. Option B — plain Node on a server

```bash
git clone <repo> /srv/sk-kalsi && cd /srv/sk-kalsi
npm ci
SITE_URL=https://www.example.com npm run build
```

Run with systemd (`/etc/systemd/system/sk-kalsi.service`):

```ini
[Unit]
Description=S.S. Kalsi Industries website
After=network.target

[Service]
Type=simple
User=skkalsi
WorkingDirectory=/srv/sk-kalsi
EnvironmentFile=/etc/sk-kalsi.env
ExecStart=/usr/bin/npm start -- -p 3000
Restart=on-failure
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/sk-kalsi /srv/sk-kalsi/.next/cache
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

`/etc/sk-kalsi.env` (mode `600`, owned by root) holds the variables from `.env.example`, with `DATA_DIR=/var/lib/sk-kalsi` (create it, owned by `skkalsi`, mode `750`).

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now sk-kalsi
```

## 4. Reverse proxy and TLS

Example nginx server block:

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    ssl_certificate     /etc/letsencrypt/live/www.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Enquiries carry up to 20 MB of drawings.
    client_max_body_size 21m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        # The app uses the right-most X-Forwarded-For entry, which nginx appends here.
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 80;
    server_name www.example.com;
    return 301 https://$host$request_uri;
}
```

Set `TRUST_PROXY=true` with this setup. Do **not** set it if clients can reach the Node port directly (they could then forge their address). Without it, all visitors share one rate-limit bucket, and the app logs a warning at start-up.

If there is more than one proxy hop (e.g. CDN → nginx → app), configure the outer layers so the address nginx appends is the real client (for Cloudflare, nginx `real_ip` with Cloudflare's ranges and `CF-Connecting-IP`).

## 5. Email

Any SMTP provider works (Google Workspace, Microsoft 365, Zoho, Amazon SES, Postmark, Brevo…).

- Use an app password or API SMTP credentials, not a personal password.
- `MAIL_FROM` must be an address the provider allows you to send as, on your own domain.
- Publish SPF, DKIM and DMARC for that domain so enquiries do not land in spam.
- TLS is enforced: port 587 uses STARTTLS (`SMTP_SECURE=false`), port 465 implicit TLS (`SMTP_SECURE=true`). Certificates are verified.

Test: submit the contact form once on the deployed site and check that the email arrives with the reference number in the subject and Reply-To set to the address you entered.

If delivery fails, the enquiry is still saved, the failure is logged to stderr and to `DATA_DIR/enquiries/mail-status.jsonl`, and the visitor still receives their reference. Monitor logs for `[enquiry] … mail delivery failed`.

## 6. Data, backups and retention

```
DATA_DIR/
  enquiries/2026-11.jsonl       one JSON object per enquiry (append-only)
  enquiries/mail-status.jsonl   delivery outcome per reference
  uploads/<reference>/01.pdf    drawings, server-chosen names
  outbox/<reference>.eml        only with MAIL_TRANSPORT=file
```

- Back the directory up with the rest of the server.
- It contains personal data. Restrict access, and delete records older than your retention period, e.g. monthly:
  `find /var/lib/sk-kalsi/uploads -mindepth 1 -maxdepth 1 -mtime +730 -exec rm -rf {} +`
- To list recent enquiries: `tail -n 20 /var/lib/sk-kalsi/enquiries/$(date +%Y-%m).jsonl | jq '{reference, receivedAt, name: .enquiry.name, email: .enquiry.email}'`

## 7. Scaling notes

The rate limiter is in-process memory, which is correct for one instance. For several instances behind a load balancer, either keep sticky sessions or replace `SlidingWindowLimiter` (`src/lib/rate-limit.ts`) with a shared store (e.g. Redis) behind the same `take()` interface. The on-disk enquiry log also assumes one instance (or a shared volume).

## 8. Monitoring

- `GET /api/health` → `200 {"status":"ok"|"degraded","enquiries":"available"|"unavailable"}`. `degraded` means SMTP settings are missing.
- Watch stderr for `[enquiry]` lines.
- Uptime-check `/` and `/api/health`.

## 9. Updating

```bash
git pull && npm ci && npm run check && npm run build && npm run test:e2e
sudo systemctl restart sk-kalsi        # or: docker compose up -d --build
npm run audit                          # monthly, and act on findings
```
