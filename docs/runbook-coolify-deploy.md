# Coolify deployment playbook

Git-backed production deployment for `bjo163/moonwitnessxv`. Every statement below was read from the running stack on 2026-10-29, not copied from a template. Numbers that could drift (SHA, deployment UUID) are named as observations, not constants.

## 1. Source of truth

| Item | Value |
|---|---|
| Repository | `https://github.com/bjo163/moonwitnessxv` |
| Branches | `dev` (all work) and `main` (promoted only) — no feature branches |
| CI | `.github/workflows/*` "CI Verify & Gate" on every push to `dev`; a `Promote verified dev to main` job fast-forwards `main` only when `dev` has not moved since verification |
| Compose file | `docker-compose.yml` at the repository root (Coolify build pack `dockercompose`, `base_directory: /`) |
| Coolify application | uuid `hm1sboa7yp2p6ttuc9jukzzp`, name `moonwitnessxv:main-hm1sboa7yp2p6ttuc9jukzzp` |
| Build target | `main` HEAD — Coolify records `git_commit_sha: "HEAD"` and redeploys on the webhook after every promotion |
| Server | `163.61.134.104` (`apps.mycocolink.com`), Docker 29.4.3, compose 5.1.3, Traefik 3.7.16, destination network `A-L-L-A-H` |

Deployment happens by promotion, never by hand-editing the server. `git push origin dev` → CI → promote → Coolify webhook builds and replaces the stack.

## 2. Services, ports and hosts

`published` is what the host exposes; `domain` is what Traefik serves. Traefik reaches every container over the `A-L-L-A-H` network, so a published port is never required for routing.

| Service | Container | Port | Published | Domain (ADR-0016) |
|---|---|---|---|---|
| `db` | `moonwitness-db` | 5432 | `127.0.0.1:5432` | **none** |
| `arsy` (Hub) | `moonwitness` | 3000 | `127.0.0.1:3000` (was host-wide — §7) | `api.moonwitness.biz.id` |
| `skylink` | `moonwitness-skylink` | 3005 | `127.0.0.1:3005` | `skylink.moonwitness.biz.id` path `/api/v1/webhooks` (no backend, §6) |
| `aigateway` | `moonwitness-aigateway` | 3003 | `127.0.0.1:3003` | **none** |
| `echolog` | `moonwitness-echolog` | 3006 | `127.0.0.1:3006` | `media.moonwitness.biz.id` |
| `headquarters` | `moonwitness-headquarters` | 3002 | `127.0.0.1:3002` | `hq.moonwitness.biz.id` |
| `dock` | `moonwitness-dock` | 3001 | `127.0.0.1:${DOCK_HOST_PORT:-3001}` | `moonwitness.biz.id` |
| `orbit` | `moonwitness-orbit` | 3007 | `127.0.0.1:3007` | `orbit.moonwitness.biz.id` |
| `sentinel` | `moonwitness-sentinel` | — | — | **none** |
| `empire-web` | `moonwitness-empire-web` | 3010 | `127.0.0.1:3010` | `a-l-l-a-h.com` |

`db`, `sentinel`, `aigateway`, `cockpit` and `lumen-runtime` must stay unrouted. There is no scheduled `backup` sidecar since `b0b44f9` (it restart-looped in Coolify); `scripts/db-backup.sh` still ships for on-demand dumps. `cockpit` and `ai` are deliberately unbound (M44-07 Variant A).

Domains are bound through `docker_compose_domains`, a JSON **object** keyed by service name:

```bash
PATCH /api/v1/applications/hm1sboa7yp2p6ttuc9jukzzp
{ "docker_compose_domains": { "dock": { "name": "dock", "domain": "https://moonwitness.biz.id" } } }
```

Sending the object replaces the whole map, so always send every binding that must survive.

## 3. Secrets and configuration

Compose reads one environment file. In Coolify those values live in the application's environment variables; locally they come from `.env.coolify` (never committed; `.env.example` is the checked contract and `apps/arsy/test/env-contract.test.ts` fails on an unknown or missing key).

| Name | Needed by | Notes |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `db`, `arsy` | compose fails without them |
| `MOONQL_AUTH_ADMIN_PASSWORD` | `arsy` | seeds the admin login; rotating it does not rewrite the existing row |
| `CORS_ORIGIN`, `DOCK_URL`, `HQ_URL`, `SITE_NAME`, `TRUST_PROXY`, `HQ_COOKIE_SECURE` | frontends | public origins, not internal service names |
| `ECHOLOG_GRANT_SECRET`, `ECHOLOG_SERVICE_KEY` | `echolog` | grant signing and Hub-to-ECHOLOG auth |
| `ECHOLOG_S3_BUCKET`, `ECHOLOG_S3_ACCESS_KEY_ID`, `ECHOLOG_S3_SECRET_ACCESS_KEY` | `echolog` | optional; the SigV4 surface registers only when all three are set |
| `SKYLINK_SERVICE_KEY`, `SKYLINK_TELEGRAM_BOT_TOKEN`, `SKYLINK_TELEGRAM_WEBHOOK_SECRET` | `skylink` | production refuses to boot without the service key |
| `API_PREFIX` | `arsy` + every BFF | `RADIO_API_URL` is built as `http://arsy:3000${API_PREFIX:-/api/v1}` |

Never put a credential in a document, commit, or CI log. `.env.example` keeps placeholders only.

## 4. Deploy

1. `git push origin dev`.
2. Watch CI: `gh run list --branch dev --limit 3` then `gh run watch <id> --exit-status`. Verify and promote are separate jobs; a promote failure of the form "dev moved after verification" only means another push landed, and the next run promotes the newer commit.
3. Coolify picks up the new `main` from the webhook. Read the app record to confirm:
   ```bash
   curl -sS -H "Authorization: Bearer $COOLIFY_TOKEN" \
     https://apps.mycocolink.com/api/v1/applications/hm1sboa7yp2p6ttuc9jukzzp \
     | jq '{status, last_restart_type, last_online_at, docker_compose_domains}'
   ```
   While a build runs, per-container logs come from `GET /api/v1/applications/{uuid}/logs`; a mid-flight deployment record is visible at `GET /api/v1/deployments?application_uuid=<uuid>` and the endpoint returns `[]` when nothing is queued.
4. One deploy at a time. Coolify cannot cancel a queued deployment (`DELETE /deployments/{uuid}` → 404), so two overlapping deploys leave the stack half-replaced and every host answering 503 until the second finishes.

Expect 5–10 minutes of 503s on every host while images rebuild — that is the replacement window, not an outage to investigate.

## 5. Verify

Health endpoints: `GET /api/v1/health` (liveness), `GET /api/v1/health/ready` (database readiness, 503 when Postgres is unreachable), `GET /health` on orbit/echolog/aigateway, `GET /login` on HQ.

Public smoke, pinned to the Cloudflare edge because a stale local resolver can still answer the old parking IP:

```bash
MW=104.21.76.120   # moonwitness.biz.id edge
AH=104.21.32.59    # a-l-l-a-h.com edge
curl -sS -o /dev/null -w '%{http_code}\n' --resolve a-l-l-a-h.com:443:$AH https://a-l-l-a-h.com/en
curl -sS -o /dev/null -w '%{http_code}\n' --resolve a-l-l-a-h.com:443:$AH https://a-l-l-a-h.com/id
curl -sSI --resolve moonwitness.biz.id:443:$MW https://moonwitness.biz.id/en | grep -iE 'HTTP/|content-security|x-frame|referrer'
curl -sS --resolve api.moonwitness.biz.id:443:$MW https://api.moonwitness.biz.id/api/v1/health
curl -sS -o /dev/null -w '%{http_code}\n' --resolve hq.moonwitness.biz.id:443:$MW https://hq.moonwitness.biz.id/login
curl -s "https://dns.google/resolve?name=a-l-l-a-h.com&type=A"   # authoritative edge answers
curl -sS -m 5 -o /dev/null -w '%{http_code}\n' http://163.61.134.104:3000/api/v1/health   # must stop answering (§7)
curl -sSI --resolve moonwitness.biz.id:80:$MW http://moonwitness.biz.id/en | grep -iE 'HTTP/|location'   # 302 to https, same path
curl -sSI --resolve hq.moonwitness.biz.id:443:$MW https://hq.moonwitness.biz.id/login | grep -i strict-transport   # max-age=15552000
```

Plain HTTP is answered with a `302` to the same path and query, not a browser-pinned `301`; the `301` for `www` lives at the edge and matches HTTPS only, so `http://www.<zone>/…` falls through to the origin (observed `404` at `a-l-l-a-h.com` in October 2026). Each app therefore sends its own HSTS — empire from nginx, the hub from helmet, dock/HQ/orbit from the shared `securityHeaders()`, and echolog from an `onSend` hook.

DNS answers must come from `https://dns.google/resolve` or a Cloudflare DoH endpoint; the machine resolver in this workspace is not authoritative.

`DEPLOYED_VERIFIED` (see [RELEASE](architecture/RELEASE.md)) needs real HTTPS on `/id` and `/en` plus the Coolify SHA/logs that produced them. A green CI run and a 200 from one host do not satisfy it.

## 6. Operational behaviour that bites

1. **Compose `profiles` are ignored.** Coolify starts only services without a profile, so `skylink` never runs (`COMPOSE_PROFILES` has no effect — [coollabsio/coolify#6395](https://github.com/collabsio/coolify/issues/6395)). Its host therefore answers 503 and Traefik serves its default certificate.
2. **Compose network aliases on `default` do not resolve.** Coolify puts every service on its own external network; an alias declared under `default` is not registered there. Call services by service name (`arsy`, not `radio`).
3. **Domains cannot express redirects.** A compose domain is `scheme://host[:port][/path]`; the `www` 301s live in Cloudflare (one wildcard Single Redirect per zone) and a `www` request never reaches the origin.
4. **The proxy does not pin plain HTTP.** It answers `302`, so HSTS has to come from the app; a host that sends none leaves the first visit upgradable by anyone who can intercept it.
5. **`localhost` inside a container is the container.** Any URL passed to a BFF must name the service, and any cookie must be `Secure` only when the public origin is HTTPS (`HQ_COOKIE_SECURE`).

## 7. Hub port binding

Until 2026-10-30 the hub published `3000:3000` on every interface while the other ten services were loopback-only. Observed that day: `curl -sS -m 10 http://163.61.134.104:3000/api/v1/health` answered `200`, so the API was reachable on the host's public IP over plaintext HTTP, outside Traefik, TLS and CORS.

`docker-compose.yml` now publishes `127.0.0.1:3000:3000`. Routing is unaffected because Traefik reaches the hub over the `A-L-L-A-H` network. `apps/arsy/test/compose-contract.test.ts` pins this: the hub's only binding is loopback, and no service may hold a host-wide port (the assertion fails on the previous file with "the hub publishes on loopback only").

The running host still serves the pre-change container until the next promotion, so the probe above keeps answering `200` until then; after the deploy, a refused connection is the expected result.

## 8. Rollback

1. **Code:** re-run the Coolify deployment for the previous tag. `v2.21.0` is the first release carrying the M44 index flip; anything earlier reverts the canonical-host change as well.
2. **Configuration:** re-apply the previous `docker_compose_domains` object (send the full map) and the previous environment variables.
3. **DNS:** repoint the record at the previous target. All proxied records answer with TTL 300, so recovery is bounded by minutes; NS, MX, SPF, DKIM and DMARC are out of scope and must not be touched.
4. **Detach a failing domain** rather than leaving a router with no healthy backend: `PATCH` the domain map without that service.

Every step above is reversible from Git plus the Coolify API; nothing requires editing files on the server.
