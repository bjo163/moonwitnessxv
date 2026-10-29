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
- `DOCK_URL=https://moonwitness.biz.id` (the hub's advertisement only)
- `DOCK_PUBLIC_URL=https://moonwitness.biz.id` (Dock's canonical, OpenGraph and sitemap origin — without it Dock renders `http://localhost:3001` even behind the public host)
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

- `apps/orbit`'s call path (server-side or browser) is unconfirmed, which is why `CORS_ORIGIN` lists it optimistically but no preflight has been measured.
- Cockpit and the AI Gateway are declared in ADR-0016 but intentionally unrouted until M44-07 decides.

## 8. Coolify execution log — 2026-10-29

Recorded by probing `apps.mycocolink.com` (Coolify) and the public hosts; nothing here is inferred from a green CI run.

### 8.1 Stack state

| Item | Value |
|---|---|
| Application uuid | `hm1sboa7yp2p6ttuc9jukzzp` (`moonwitnessxv:main-…`, compose) |
| Deployment | `mwixadma2zkoptaqi3kfu7jr`, webhook-triggered from `main` |
| Commit | `9cab9650da62f3ad8ee4c25a03a2ffcfc4d277d2` |
| Result | `finished` at `2026-10-29T16:01:58Z`; all service containers started |
| Follow-up deploy | `00pb7afq6l00l2whsyzloov3`, `ee4ff9b`, `finished` at `2026-10-29T16:21:04Z` — carries the dock `robots.txt` route |
| Bindings | `arsy` → `https://api.moonwitness.biz.id`, `dock` → `https://moonwitness.biz.id` |
| Env | `DOCK_PUBLIC_URL=https://moonwitness.biz.id` present in both the production and preview env rows |

Only hosts that already resolve are bound. A domain has **not** been attached to `empire-web`, `headquarters`, `orbit`, `echolog` or `skylink`, because their names do not resolve yet: attaching one would fail the ACME challenge and leave the router returning 404 for that host.

### 8.2 Deployment failures seen and fixed

1. Deployment `5766` (`9900868`) failed with `Bind for 127.0.0.1:3001 failed: port is already allocated` — another compose on the same server publishes `127.0.0.1:3001`. Fixed by publishing dock on `127.0.0.1:${DOCK_HOST_PORT:-3001}` with `DOCK_HOST_PORT=13001` in Coolify, and headquarters on loopback only (`177fc62`). Traefik reaches both over the `A-L-L-A-H` network, so the published port is irrelevant to routing.
2. Two overlapping deploys (an automatic one and a manual one) both failed at `15:36:57Z`; Coolify cannot cancel a queued deployment (`DELETE /deployments/{uuid}` → 404). One deploy at a time is the working rule.
3. Dock emitted `http://localhost:3001` in its canonical/OpenGraph/sitemap because nothing set the public origin. Fixed by passing `DOCK_PUBLIC_URL` through compose (`0bd10cf`) plus the Coolify env above; Dock computes metadata per request, so no rebuild behaviour was needed beyond the deploy.

### 8.3 Observed rows (probes run 2026-10-29 16:02–16:05Z)

```bash
curl -sSI https://moonwitness.biz.id/en
curl -s  https://moonwitness.biz.id/en | grep -oE '<link rel="canonical"[^>]*>|<link rel="alternate"[^>]*>|<meta property="og:url"[^>]*>'
curl -s  https://moonwitness.biz.id/sitemap.xml | grep -c '<loc>'
curl -sS -o /dev/null -w '%{http_code}\n' https://moonwitness.biz.id/id
curl -sS https://api.moonwitness.biz.id/api/v1/health
curl -sSI -X OPTIONS https://api.moonwitness.biz.id/api/v1/health -H 'Origin: https://moonwitness.biz.id' -H 'Access-Control-Request-Method: GET'
curl -sSI -X OPTIONS https://api.moonwitness.biz.id/api/v1/health -H 'Origin: https://evil.example'            -H 'Access-Control-Request-Method: GET'
curl -sSI --resolve moonwitness.biz.id:443:163.61.134.104 https://moonwitness.biz.id/en
echo | openssl s_client -connect 163.61.134.104:443 -servername moonwitness.biz.id 2>/dev/null | openssl x509 -noout -issuer -subject -dates -ext subjectAltName
for p in 3000 3001 3002 3003 3004 3005 3006 3007; do timeout 3 bash -c "</dev/tcp/163.61.134.104/$p" 2>/dev/null && echo "$p open" || echo "$p closed"; done
```

| Check | Result |
|---|---|
| `https://moonwitness.biz.id/en`, `/id` | 200 / 200 |
| Canonical + hreflang | `canonical https://moonwitness.biz.id/en`; alternates `id`→`/id`, `en`→`/en`, `x-default`→`/en`; `og:url` matches. No `localhost` anywhere in the sitemap (0 occurrences) |
| `sitemap.xml` | 30 `<loc>` (15 dock routes × 2 locales) with hreflang alternates |
| Security headers (origin) | CSP, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy` |
| `Strict-Transport-Security` | **absent** at both Cloudflare and the origin |
| Origin certificate | Let's Encrypt `CN=YR1`, `CN=moonwitness.biz.id`, SAN that host only, valid 2026-08-31 → 2026-11-29 |
| `api.…/api/v1/health` | 200 `{"ok":true,…}`; preflight from `https://moonwitness.biz.id` echoes `access-control-allow-origin`; from `https://evil.example` no allow-origin header |
| API certificate | Let's Encrypt `CN=YR1`, `CN=api.moonwitness.biz.id`, valid 2026-08-31 → 2026-11-29 |
| Public port surface | only `3000` open; `3001`–`3007` closed (dock and HQ are loopback-only) |
| `https://moonwitness.biz.id/robots.txt` | 200 with `User-Agent: *`, `Allow: /`, `Host: https://moonwitness.biz.id`, `Sitemap: https://moonwitness.biz.id/sitemap.xml` — first at the origin (`--resolve`), then through Cloudflare once the route existed. Before the route, Cloudflare substituted its managed file (no `Sitemap:` line) and the origin 404'd; `apps/dock/src/app/robots.ts` fixed the origin |

### 8.4 Rows not observed

| Row | Why |
|---|---|
| `a-l-l-a-h.com` / `www.a-l-l-a-h.com` | Both resolve to `2.57.91.91` (`Server: hcdn`, Hostinger parking). The apex is not on the Coolify server, so no `/en`, `/id`, canonical, sitemap or 301 exists to measure |
| `www.moonwitness.biz.id` → 301 | NXDOMAIN |
| `hq.moonwitness.biz.id/login` | NXDOMAIN (also unbound in Coolify) |
| `orbit`, `media`, `skylink` | NXDOMAIN and unbound |
| `cockpit`, `ai` | NXDOMAIN; unrouted by design under M44-07 variant A |
| Vercel alias `X-Robots-Tag` | not fetched in this pass |

### 8.5 Operator actions left

1. Point `a-l-l-a-h.com` and `www.a-l-l-a-h.com` from the Hostinger parking IP to `163.61.134.104`, then attach `https://a-l-l-a-h.com` to `empire-web` (3010) and the `www` redirect.
2. Create the `www`, `hq`, `orbit`, `media`, `skylink` names (CNAME → `moonwitness.biz.id`, proxied) and attach the matching Coolify domains.
3. Enable HSTS at the Cloudflare edge for `moonwitness.biz.id`, or accept that the apex will be the only host sending it (empire-web's nginx already does).
