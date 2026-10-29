# M44 — Domain cutover: runbook and current evidence

**Status: REPOSITORY SIDE IMPLEMENTED; CUTOVER NOT EXECUTED.** 29 October 2026 (Asia/Jakarta). Decision: [ADR-0016](../decisions/ADR-0016-public-domain-map.md). [TODO](../../TODO.md) owns task status; this note is the operator runbook and the place to paste evidence.

Nothing in this file proves a hostname is live. DNS, certificates and redirects are operator actions on the registrar and the Coolify host; the repository cannot observe them.

## 1. What is already in the repository

| Change | Evidence |
|---|---|
| ADR-0016 + index entry + M31-01 supersession banner | this commit |
| `apps/empire-web/src/lib/seo.ts` — `SITE_ORIGIN`, canonical helper, hreflang helper | read the file |
| Both layouts: `metadataBase` + `robots: { index: true, follow: true }` | build output |
| `robots.ts`: allow + sitemap + host | `out/robots.txt` |
| `sitemap.ts`: 23 URLs with `xhtml:link` alternates | `out/sitemap.xml` |
| `nginx.conf`: HSTS, no blanket `X-Robots-Tag` | file |
| `docker-compose.yml`: `ECHOLOG_URL` on `arsy` | file |
| Contract tests replaced (indexable canonical host, sitemap, HSTS) | suites below |

Local verification observed:

- `pnpm --filter @moonwitness/empire-web build` → emits `robots.txt` and `sitemap.xml`.
- `pnpm --filter @moonwitness/empire-web test` → 10/10.
- `node apps/empire-web/test/export-check.mjs` → six PASS lines, including "23 canonical URLs in sitemap.xml; robots.txt allows crawling and names that sitemap".
- `pnpm --filter @moonwitness/arsy exec tsx --test test/dockerfile-contract.test.ts` → 10/10.
- `pnpm --filter @moonwitness/empire-web typecheck` → clean.
- `pnpm ui:check` → 142 files, 0 violations.

Built HTML spot check at build time: `<meta name="robots" content="index, follow"/>`, `<link rel="canonical" href="https://a-l-l-a-h.com/en"/>`, `<link rel="alternate" hrefLang="id" href="https://a-l-l-a-h.com/id"/>`.

## 2. DNS records to create

Replace `<COOLIFY_IP>` with the Coolify host's public IPv4 (Coolify → Servers). Apex hosts need `A` (or `ALIAS`/`ANAME` where the provider supports it); subdomains use `CNAME`. **Do not touch `NS`, `MX`, `SPF`, `DKIM` or `DMARC`.**

| Zone | Type | Name | Value | TTL |
|---|---|---|---|---|
| `a-l-l-a-h.com` | A | `@` | `<COOLIFY_IP>` | 300 |
| `a-l-l-a-h.com` | CNAME | `www` | `a-l-l-a-h.com` | 300 |
| `moonwitness.biz.id` | A | `@` | `<COOLIFY_IP>` | 300 |
| `moonwitness.biz.id` | CNAME | `www` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `hq` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `api` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `orbit` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `media` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `skylink` | `moonwitness.biz.id` | 300 |
| `moonwitness.biz.id` | CNAME | `cockpit` | `moonwitness.biz.id` | **only with M44-07 variant B** |
| `moonwitness.biz.id` | CNAME | `ai` | `moonwitness.biz.id` | **only with M44-07 variant B** |

## 3. Coolify bindings

For each row, open the service → **Domains** → add `https://<host>` → confirm the container port → save, then wait for the certificate to show **READY**.

| Service | Domain | Port |
|---|---|---|
| empire-web | `https://a-l-l-a-h.com` | 3010 |
| empire-web | `https://www.a-l-l-a-h.com` → redirect to apex | 3010 |
| dock | `https://moonwitness.biz.id` | 3001 |
| dock | `https://www.moonwitness.biz.id` → redirect to apex | 3001 |
| headquarters | `https://hq.moonwitness.biz.id` | 3002 |
| arsy | `https://api.moonwitness.biz.id` | 3000 |
| orbit | `https://orbit.moonwitness.biz.id` | 3007 |
| echolog | `https://media.moonwitness.biz.id` | 3006 |
| skylink | `https://skylink.moonwitness.biz.id` with path `/api/v1/webhooks` | 3005 |

Do **not** add a domain to `db`, `backup`, `sentinel` or `lumen-runtime`. Add `cockpit`/`ai` only after M44-07 variant B ships.

## 4. Environment values

`docker-compose.yml` already maps them; set the values in Coolify (see the local `.env.coolify`, which is gitignored):

- `CORS_ORIGIN=https://moonwitness.biz.id,https://orbit.moonwitness.biz.id`
- `DOCK_URL=https://moonwitness.biz.id`
- `HQ_URL=https://hq.moonwitness.biz.id`
- `HQ_COOKIE_SECURE=true`, `TRUST_PROXY=true`
- `ECHOLOG_URL` defaults to `http://echolog:3006` inside the stack
- `SKYLINK_TELEGRAM_WEBHOOK_SECRET`, webhook URL `https://skylink.moonwitness.biz.id/api/v1/webhooks/telegram`

## 5. Verification commands (paste the output here)

```bash
# apex + locale, headers and meta
curl -sSI https://a-l-l-a-h.com/en | sed -n '1,12p'
curl -s https://a-l-l-a-h.com/id | grep -o '<meta name="robots"[^>]*>\|<link rel="canonical"[^>]*>'

# crawl surface
curl -s https://a-l-l-a-h.com/robots.txt
curl -s https://a-l-l-a-h.com/sitemap.xml | grep -c '<loc>'

# redirects
curl -sSI https://www.a-l-l-a-h.com/en | grep -i '^HTTP/\|^location'
curl -sSI https://moonwitness.biz.id/ | sed -n '1,6p'

# cookie flags (no Domain attribute)
curl -sSI https://hq.moonwitness.biz.id/login | grep -i '^set-cookie'

# CORS: allowed origin echoes, random origin does not
curl -sSI -X OPTIONS https://api.moonwitness.biz.id/api/v1/health \
  -H 'Origin: https://moonwitness.biz.id' -H 'Access-Control-Request-Method: GET' | grep -i 'access-control'
curl -sSI -X OPTIONS https://api.moonwitness.biz.id/api/v1/health \
  -H 'Origin: https://example.invalid' -H 'Access-Control-Request-Method: GET' | grep -i 'access-control'

# media refuses anonymous access
curl -sS -o /dev/null -w '%{http_code}\n' https://media.moonwitness.biz.id/objects/does-not-exist

# preview must stay noindex
curl -sSI https://a-l-l-a-h-empire-web-bjo163s-projects.vercel.app/en | grep -i 'x-robots-tag'
```

Expected: 200 with `index, follow` + canonical on the apex; `Allow: /` and a `Sitemap:` line; 23 `<loc>` entries; single-hop 301 for `www`; `Secure; HttpOnly; SameSite=Lax` and no `Domain=` on the HQ cookie; CORS echoed only for the allowed origin; 403 for unsigned media; `x-robots-tag: noindex, nofollow` on the Vercel alias.

## 6. Rollback

1. Repoint the record to the previous target: Coolify auto-domain for the stack, `*.vercel.app` alias for the pilot. TTL is 300, so recovery is bounded by DNS propagation.
2. Redeploy the last known-good tag — `v2.20.2` is the last release before this milestone.
3. Indexing: revert the single commit that touches `robots.ts`, `sitemap.ts`, both layouts, `nginx.conf` and their tests.
4. Remove temporary aliases only after 48 h of clean operation.

## 7. Not observed

- No certificate was issued, no record was created, no hostname was resolved.
- `apps/orbit`'s call path (server-side or browser) is unconfirmed, which is why `CORS_ORIGIN` lists it optimistically but no preflight has been measured.
- Cockpit and the AI Gateway are declared in ADR-0016 but intentionally unrouted until M44-07 decides.
