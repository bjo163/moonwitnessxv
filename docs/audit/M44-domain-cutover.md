# M44 — Domain cutover: runbook and current evidence

**Status: CUTOVER EXECUTED 2026-10-29; SIX OF NINE HOSTS VERIFIED, SKYLINK NOT SERVING.** 29 October 2026 (Asia/Jakarta). Decision: [ADR-0016](../decisions/ADR-0016-public-domain-map.md). [TODO](../../TODO.md) owns task status; this note is the operator runbook and the place to paste evidence.

The evidence in §8 and §9 comes from probes run against the public hosts and the Coolify API on 2026-10-29. This host's system resolver is stale (it still answers `a-l-l-a-h.com` with the old Hostinger parking IP `2.57.91.91`), so every probe below pins the Cloudflare edge with `--resolve` or the Playwright `--host-resolver-rules` flag, and every DNS answer was read through `https://dns.google/resolve`.

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

## 9. Cutover executed — 2026-10-29 (DNS, edge, Coolify bindings)

Steps 8.5.1 and 8.5.2 were carried out on 2026-10-29 in the Cloudflare dashboard and through the Coolify API. This section replaces them as the current state.

### 9.1 DNS record set

Zone registrations were switched to Cloudflare earlier in the milestone; verified again here.

| Zone | Name servers |
|---|---|
| `a-l-l-a-h.com` | `dilbert.ns.cloudflare.com`, `sunny.ns.cloudflare.com` |
| `moonwitness.biz.id` | `brian.ns.cloudflare.com`, `chan.ns.cloudflare.com` |

`moonwitness.biz.id` zone export (`C:/Users/bjo16/Downloads/moonwitness.biz.id.txt`, exported from the dashboard):

```text
moonwitness.biz.id.          1 IN A     163.61.134.104          ; cf-proxied:true
www.moonwitness.biz.id.      1 IN CNAME moonwitness.biz.id.    ; cf-proxied:true
hq.moonwitness.biz.id.       1 IN CNAME moonwitness.biz.id.    ; cf-proxied:true
orbit.moonwitness.biz.id.    1 IN CNAME moonwitness.biz.id.    ; cf-proxied:true
media.moonwitness.biz.id.    1 IN CNAME moonwitness.biz.id.    ; cf-proxied:true
skylink.moonwitness.biz.id.  1 IN CNAME moonwitness.biz.id.    ; cf-proxied:true
```

`a-l-l-a-h.com` answers as a proxied apex A record and a proxied `www`; the proxied answers come from the Cloudflare edge:

```bash
curl -s 'https://dns.google/resolve?name=a-l-l-a-h.com&type=A'          # 104.21.32.59, 172.67.184.57
curl -s 'https://dns.google/resolve?name=www.a-l-l-a-h.com&type=A'      # 104.21.32.59, 172.67.184.57
curl -s 'https://dns.google/resolve?name=moonwitness.biz.id&type=A'     # 104.21.76.120, 172.67.194.50
curl -s 'https://dns.google/resolve?name=hq.moonwitness.biz.id&type=A'  # 104.21.76.120, 172.67.194.50
```

Proxied answers carry TTL 300, which is the TTL M44-09 requires before cutover. `cockpit` and `ai` return NXDOMAIN (`Status: 3`) in both DoH and anycast, which is the Variant A outcome M44-07 asks for. No `NS`, `MX`, `SPF`, `DKIM` or `DMARC` record was touched.

### 9.2 `www` redirects (edge, not Coolify)

**Deviation from M44-02, recorded deliberately.** The packet asks for the `www` 301 to be configured once, in Coolify. Coolify's compose integration exposes no redirect primitive — a compose domain is `scheme://host[:port][/path]` with nothing that can express "301 every path to another host" — so the redirect was configured as one Cloudflare Single Redirect (wildcard) rule per zone:

| Zone | Rule | Target |
|---|---|---|
| `a-l-l-a-h.com` | `www.a-l-l-a-h.com/*` → dynamic | `https://a-l-l-a-h.com/${1}`, 301, query string preserved |
| `moonwitness.biz.id` | `www.moonwitness.biz.id/*` → dynamic | `https://moonwitness.biz.id/${1}`, 301, query string preserved |

Observed, one hop each, path and query preserved:

```bash
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' --resolve www.a-l-l-a-h.com:443:104.21.32.59 https://www.a-l-l-a-h.com/en
# 301 https://a-l-l-a-h.com/en
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' --resolve www.a-l-l-a-h.com:443:104.21.32.59 'https://www.a-l-l-a-h.com/id?z=9'
# 301 https://a-l-l-a-h.com/id?z=9
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' 'https://www.moonwitness.biz.id/id?y=2'
# 301 https://moonwitness.biz.id/id?y=2
```

A `www` request never reaches the origin, so the redirect stays a single hop and no `www` certificate is needed on the Coolify server.

### 9.3 Coolify host bindings

`GET /api/v1/applications/hm1sboa7yp2p6ttuc9jukzzp` (`docker_compose_domains`, read 2026-10-29T16:49Z):

| Service | Bound domain |
|---|---|
| `empire-web` | `https://a-l-l-a-h.com` |
| `dock` | `https://moonwitness.biz.id` |
| `hq` → `headquarters` | `https://hq.moonwitness.biz.id` |
| `arsy` | `https://api.moonwitness.biz.id` |
| `orbit` | `https://orbit.moonwitness.biz.id` |
| `echolog` | `https://media.moonwitness.biz.id` |
| `skylink` | `https://skylink.moonwitness.biz.id/api/v1/webhooks` |

`db`, `backup`, `sentinel` and `lumen-runtime` carry no domain, as M44-02 requires. `cockpit` and `ai` were deliberately left unbound (M44-07 Variant A). Deployments observed this session: `6xueyhxvpbhmoh3ronsye7ai` and `dw8ng6m3eti9kc2kigpzw6va`.

### 9.4 Certificates

Read from the origin with `openssl s_client -connect 163.61.134.104:443 -servername <host>`:

| Host | Issuer | SAN | Validity |
|---|---|---|---|
| `a-l-l-a-h.com` | Let's Encrypt `YR2` | `a-l-l-a-h.com` | 2026-10-29 → 2027-01-27 |
| `moonwitness.biz.id` | Let's Encrypt `YR1` | `moonwitness.biz.id` | 2026-08-31 → 2026-11-29 |
| `hq.moonwitness.biz.id` | Let's Encrypt `YR2` | `hq.moonwitness.biz.id` | 2026-10-29 → 2027-01-27 |
| `api.moonwitness.biz.id` | Let's Encrypt `YR1` | `api.moonwitness.biz.id` | 2026-08-31 → 2026-11-29 |
| `orbit.moonwitness.biz.id` | Let's Encrypt `YR2` | `orbit.moonwitness.biz.id` | 2026-10-29 → 2027-01-27 |
| `media.moonwitness.biz.id` | Let's Encrypt `YR1` | `media.moonwitness.biz.id` | 2026-10-29 → 2027-01-27 |
| `skylink.moonwitness.biz.id` | **TRAEFIK DEFAULT CERT** | the Traefik self-signed default | 2026-10-29 → 2027-10-29 |

Skylink has no certificate because no container is behind its router (§9.7).

### 9.5 Host matrix observed

All probes pinned to the Cloudflare edge; `AH=104.21.32.59`, `MW=104.21.76.120`.

| Row | Result |
|---|---|
| `a-l-l-a-h.com/`, `/en`, `/id` | 200 at the apex |
| `/id` meta | `<html lang="id">`, `robots: index, follow`, canonical `https://a-l-l-a-h.com/id`, alternates `id`/`en`/`x-default` |
| `/en` headers | `strict-transport-security: max-age=15552000`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `Server: cloudflare` |
| `/sitemap.xml` | 200, 23 `<loc>` |
| `/robots.txt` | 200, `User-Agent: *`, `Allow: /`, `Host: https://a-l-l-a-h.com`, `Sitemap: https://a-l-l-a-h.com/sitemap.xml` |
| `www.a-l-l-a-h.com/*` | 301 → apex, one hop, query preserved |
| `www.moonwitness.biz.id/*` | 301 → dock, one hop, query preserved |
| `moonwitness.biz.id/` | 307 → `/en`; `/en` 200 with CSP, `nosniff`, `DENY`, referrer policy; canonical `https://moonwitness.biz.id/en` |
| `hq.moonwitness.biz.id/` | 307 → `/login`; `/login` 200 with title `Moonwitness HQ` |
| `orbit.moonwitness.biz.id/` | 200, title `ORBIT — Spatial Agent Operations | MoonWitness XV` |
| `api.moonwitness.biz.id/api/v1/health` | 200 `{"ok":true,…}` |
| API preflight, `Origin: https://moonwitness.biz.id` | 204 with `access-control-allow-origin: https://moonwitness.biz.id` |
| API preflight, `Origin: https://evil.example` | 204 with **no** `access-control-allow-origin` |
| `media.moonwitness.biz.id/health` | 200 `{"status":"ok","app":"echolog","port":3006}` |
| `media…/api/v1/objects/sha256/<digest>` (no grant, no bearer) | **401** `{"error":{"code":"unauthorized",…}}` — anonymous reads are refused |
| `skylink.moonwitness.biz.id/` | **503** `no available server` |
| `cockpit…`, `ai…` | NXDOMAIN in DoH (`Status: 3`) — no route |
| Vercel `a-l-l-a-h-empire-web.vercel.app/en` | 200, `X-Robots-Tag: noindex, nofollow` |
| Vercel `a-l-l-a-h-empire-web-bjo163s-projects.vercel.app/en` | 200, `X-Robots-Tag: noindex, nofollow` |

**Media row deviation.** M44-08 expects `403` for an unsigned object and a `200` for a SigV4 fixture. The implementation splits the surface in two: the JSON object API refuses an unauthenticated read with `401 unauthorized`, and the S3/SigV4 surface only registers when `ECHOLOG_S3_BUCKET` *and* both S3 keys are set — none are set in Coolify, so `/moonwitness/<key>` returns 404 and no SigV4 fixture can be observed at all. Enabling it means creating S3 credentials for the deployment, which is operator work.

### 9.6 Defect found and fixed: the BFFs could not reach the hub

The first live login attempt returned `303 /login?error=unavailable`, and the Coolify log for the stack repeated:

```text
⨯ [TypeError: fetch failed] { cause: Error: getaddrinfo ENOTFOUND radio … hostname: 'radio' }
```

Coolify rewrites the compose file so every service joins its own external network (`networks: {<uuid>: null}`); `arsy` keeps `default: {aliases: [radio]}`, and no other service joins `default`, so the legacy `radio` alias is never registered where the BFFs resolve it. `headquarters`, `dock`, `orbit` and `sentinel` now dial `http://arsy:3000${API_PREFIX:-/api/v1}`. Fixed in `25a1e784fbce7c3134ad360bde20d10216b9cd32`; the compose contract test asserts both the new host and the absence of the old one (`pnpm --filter @moonwitness/arsy exec tsx --test test/compose-contract.test.ts` → 17/17).

That defect is also what the browser pass saw: dock `/en` and `/id` rendered the route error boundary ("Transmission Interrupted", React error `#441`) instead of the page, at the edge and at the origin alike.

### 9.7 Rows still not observed

| Row | Why |
|---|---|
| `skylink.moonwitness.biz.id` | The `skylink` compose service sits behind `profiles: ["skylink"]`, and Coolify does not honour `COMPOSE_PROFILES` ([coollabsio/coolify#6395](https://github.com/collabsio/coolify/issues/6395)), so no container starts and Traefik has no backend. `SKYLINK_SERVICE_KEY` is also unset, and SKYLINK refuses to boot in production without it. No webhook row can be measured until M38 messaging exists |
| SigV4 fixture on `media` | S3 surface not enabled (§9.5) |
| `http://` → `https://` upgrade | Probed through the local resolver, which still answers the parking IP for `a-l-l-a-h.com`; the redirect was not observed through a clean resolver |
| HSTS on `moonwitness.biz.id` and subdomains | Absent at the edge and at the origin. Only `a-l-l-a-h.com` sends it (empire-web nginx) |
| 48 h alias retention, timed `www` repoint rehearsal | M44-09; the clock starts at this cutover |

### 9.8 Operator actions left

1. Enable HSTS for `moonwitness.biz.id` in Cloudflare (SSL/TLS → Edge Certificates), or accept a per-host split.
2. Decide the SKYLINK host: leave it bound and failing, detach it until M38 lands, or drop the profile and provide `SKYLINK_SERVICE_KEY`.
3. Add the Cloudflare analytics host to dock's CSP or disable automatic injection — the beacon script is blocked by `script-src 'self'` and logs a console error on every page.
4. Create S3 credentials for `media` if the SigV4 row is to be verified.

## 10. Post-fix verification — 2026-10-29 17:16–17:20Z

`373324e` (containing `25a1e78`, the BFF networking fix) was promoted to `main` at ~16:57Z and Coolify redeployed the stack. All probes below run against the public hosts through the Cloudflare edge.

### 10.1 HQ login and cookie

```bash
curl -sS -c jar -D - -o /dev/null -X POST \
  --resolve hq.moonwitness.biz.id:443:104.21.76.120 \
  -H 'content-type: application/json' \
  -d '{"login":"admin","password":"<from .env.coolify>"}' \
  https://hq.moonwitness.biz.id/api/session
curl -sS -b jar -o /dev/null -w '%{http_code}\n' https://hq.moonwitness.biz.id/
curl -sS -b jar -o /dev/null -w '%{http_code}\n' https://hq.moonwitness.biz.id/world-monitor
```

| Check | Result |
|---|---|
| `POST /api/session` | `303 See Other`, `location: /` — no `?error=unavailable` |
| `Set-Cookie` | `hq_token=<redacted>; Path=/; Expires=Thu, 05 Nov 2026 17:19:57 GMT; Max-Age=604800; Secure; HttpOnly; SameSite=lax` |
| `Domain` attribute | absent (host-only cookie) |
| `GET /` with the cookie | 200, title `Moonwitness HQ` |
| `GET /world-monitor` with the cookie | 200 |

The `error=unavailable` failure from §9.6 is gone, so the BFFs reach the hub again. Availability during the redeploy was not clean: `hq` answered 503 from 17:13:40Z to 17:16:30Z while Coolify recreated the container, then held 200 for every probe from 17:16:37Z onward.

### 10.2 Browser pass at 390 / 768 / 1440

Playwright (Chromium, `--host-resolver-rules` pinning the two zones to their Cloudflare edge addresses), `domcontentloaded` + element wait, then a 2.5 s settle. Six pages × three widths.

| Page | 390 | 768 | 1440 | Route error boundary | Horizontal overflow |
|---|---|---|---|---|---|
| `a-l-l-a-h.com/en` | 200 | 200 | 200 | no | 0 px |
| `a-l-l-a-h.com/id` | 200 | 200 | 200 | no | 0 px |
| `moonwitness.biz.id/en` | 200 | 200 | 200 | no | 0 px |
| `moonwitness.biz.id/id` | 200 | 200 | 200 | no | 0 px |
| `hq.moonwitness.biz.id/login` | 200 | 200 | 200 | no | **21 px at 390** |
| `orbit.moonwitness.biz.id/` | 200 | 200 | 200 | no | 0 px |

Dock now renders its page at every width; the "Transmission Interrupted" boundary from §9.6 is gone and no React error appears in the console. Screenshots were written to `.m44-shots/` locally and are not committed (they are throwaway captures, ~4 MB total).

Two defects surfaced by the pass, neither part of the M44 matrix:

1. **HQ login overflows 21 px at 390.** Offenders reported by `getBoundingClientRect`: `DIV.m-row`, `DIV.m-zine-sticker`, `LABEL.m-row`, `SELECT` (the language picker), `A.m-btn`. The page also renders a broken image box above the "WITNESS THE REAL" sticker.
2. **Dock's CSP blocks the Cloudflare analytics beacon** (`script-src 'self'`), producing one console error per page. Nothing else in the console fails.

### 10.3 What this closes

| Row | State |
|---|---|
| M44-02 host binding and certificate table | Nine of ten rows pass; skylink has no backend (§9.7) |
| M44-05 Vercel preview-only | Closed: header proof on both aliases, apex served by Coolify |
| M44-07 Variant A | Closed: both hostnames NXDOMAIN, unbound in Coolify |
| M44-08 hq cookie, apex meta, sitemap, robots, CORS, redirects, certificates, browser pass | Observed |
| M44-08 media unsigned object | Refused with `401`, not `403` (§9.5); SigV4 fixture still unobservable |
| M44-08 skylink webhook rows | Not observable; no container (§9.7) |
| M44-09 TTL 300 | Observed |
| M44-09 48 h retention and timed drill | Not started/not possible (§9.7, packet note) |

`DEPLOYED_VERIFIED` in `docs/architecture/RELEASE.md` is **not** claimed: the matrix still has two unobserved rows.
