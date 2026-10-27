# M37-01 — Current application and deployment boundary inventory

**Evidence inventory · source SHA `17b67775512964d9e198b39d34beecde6f2ba2b0` · no deployment certification.** This audit records the repository's current ten app workspaces and the smaller five-service Compose topology. It corrects the stale “six apps” framing in the task title using observed manifests and README; it does not change identity, deployment, or network configuration.

## Classification at this source SHA

| Workspace | Surface / process | Identity and data boundary | Local runnable evidence | Compose / deployment evidence |
|---|---|---|---|---|
| `apps/arsy` | Fastify API, D00/session + MoonQL | Canonical identity/session and backend owner; only SQL-backed app among the listed runtime surfaces | Registry: service, 3000, dev + supervised | `arsy` Compose service publishes `3000:3000`; DB dependency and health check present. Production perimeter/TLS not established here. |
| `apps/dock` | Public Next.js frontend | Public projection client; source-rights gates apply | Registry: web, 3001, dev + supervised | Compose publishes `3001:3001`; no auth boundary intended for public reads, but data-release gates remain. |
| `apps/headquarters` | Privileged Next.js governance UI | Session cookie is server-read; middleware allows only `/login` and `/api/session` without a cookie, then redirects to login; Hub remains authorization/data authority | Registry: web, 3002, dev + supervised | Compose publishes `3002:3002`; `HQ_COOKIE_SECURE` defaults false for plain HTTP compose and must be set true behind TLS. No public deployment verification. |
| `apps/cockpit` | Local Vite GUI + Fastify process supervisor | Developer/operator tool; can control local processes and must not be treated as public admin, canonical state, or agent executor | Registry: web, 3004, dev, not supervised by itself | Not present in Compose service list. Local control API is a security boundary; this inventory does not certify remote exposure safety. |
| `apps/aigateway` | Internal inference/model adapter | Routes inference; no task lifecycle or canonical run ownership | Registry: service, 3003, dev + supervised | Not present in Compose service list. Provider egress/credential production policy not verified here. |
| `apps/sentinel` | Worker/collector | Collection is not publication authority; no HTTP/port surface in registry | Registry: worker, dev + supervised, no URL/port | Not present in Compose service list. Static credential fallback remains a documented review gate. |
| `apps/skylink` | D18 messaging service | Accepted bounded service; no Hub, identity or SQL ownership | Registry: service, 3005, dev + supervised | Not present in Compose service list. External/provider exposure and ARSY integration remain separately gated. |
| `apps/echolog` | D19 object storage service | Accepted bounded filesystem/S3 subset; no SQL/table ownership | Registry: service, 3006, dev + supervised | Not present in Compose service list. S3 TLS/perimeter and off-host backup are not verified. |
| `apps/orbit` | Spatial operations frontend | Read-only projections; no identity/backend/data ownership; fixtures labelled simulated | Registry: web, 3007, dev + supervised | Not present in Compose service list. Independent deployment boundary is planned; no deployment evidence. |
| `apps/lumen-runtime` | Internal worker scaffold | No canonical run/identity/SQL/model-routing ownership; no public task API | Registry: worker, `dev:false`, no port, not supervised | Not present in Compose service list; no dev server or HTTP surface. |

## Evidence and limitations

Positive inventory checks at `17b67775512964d9e198b39d34beecde6f2ba2b0`: README and [`docs/architecture/APPS.md`](../architecture/APPS.md), `scripts/apps.registry.mjs`, all ten app `package.json` manifests, `docker-compose.yml`, `apps/headquarters/src/middleware.ts`, and `apps/headquarters/src/lib/session.ts`. The files confirm ten workspaces, nine `dev:true` entries (eight ported UIs/services plus Sentinel worker), one scaffolded worker with `dev:false`, and five Compose services: `db`, `arsy`, `headquarters`, `dock`, `backup`.

Negative boundary checks: the workspace/registry contains no Compose entries for Cockpit, AI Gateway, Sentinel, SKYLINK, ECHOLOG, ORBIT, or LUMEN runtime; these are not represented as deployed just because package scripts or local ports exist. The HQ middleware accepts cookie presence as a routing gate only; it is not proof of Hub authorization. No secrets, live credentials, external endpoints, Docker deployment, TLS ingress, or production host were inspected or tested.

The packet says “six app deployment/security surfaces” and emphasizes HQ middleware, but current README declares ten workspaces and current security architecture documents more boundaries. This audit inventories all ten, treats worker/scaffold separately from browser/API surfaces, and records only what source manifests/configuration establish. It does not certify all package/runtime security properties. A follow-up should correct the packet's count and specify which four surfaces its original scope omitted.

## Rollback

One additive audit file; rollback by removing this file only, after checking for references. No runtime or deployment files are changed.
