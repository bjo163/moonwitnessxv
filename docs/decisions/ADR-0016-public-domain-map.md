# ADR-0016 — Public domain map and hostname ownership

**Status: ACCEPTED — owner instruction, 29 October 2026 (Asia/Jakarta).** This decision records the owner's domain instruction and supersedes the custom-domain clause of ADR-0012 §3 and the `a-l-l-a-h.com` purpose in `docs/planning/M31-01-brand-hierarchy-proposal.md`. ADR-0011 (Dock is the canonical LIGHTHOUSE runtime) is unchanged.

## Context

The owner assigned the brand apex **`a-l-l-a-h.com`** to `apps/empire-web` and the program apex **`moonwitness.biz.id`** to Dock, and asked for a hostname for every service. Three repository statements conflict with that instruction and must be resolved explicitly rather than silently:

- `docs/planning/M31-01-brand-hierarchy-proposal.md:20,27` proposes `a-l-l-a-h.com` as the address of *LIGHTHOUSE inside Dock* and states that no ownership is established.
- `docs/decisions/ADR-0012-empire-web-static-pilot.md:13,18` forbids a custom domain and requires `noindex`.
- `docs/architecture/SECURITY.md:26-31` states Cockpit is loopback-only with no identity system, and `apps/aigateway/src` has no inbound authentication.

The owner has now authorized a public site on a custom domain, and has asked for hostnames on every service. That last part cannot be implemented literally for Cockpit and the AI Gateway without breaking their security models, so this ADR splits the question: **every service gets a declared hostname, and every hostname gets an access tier that must be satisfied before DNS exists.**

## Decision

1. **Canonical host → service binding.**

   | Hostname | Service | Tier | Index |
   |---|---|---|---|
   | `a-l-l-a-h.com` | `empire-web` (3010, nginx) | Public | index |
   | `www.a-l-l-a-h.com` | `empire-web` | 301 → apex | n/a |
   | `moonwitness.biz.id` | `dock` (3001) | Public | index |
   | `www.moonwitness.biz.id` | `dock` | 301 → apex | n/a |
   | `hq.moonwitness.biz.id` | `headquarters` (3002) | Login-gated | noindex |
   | `api.moonwitness.biz.id` | `arsy` (3000) | Public API, CORS allow-list | noindex |
   | `orbit.moonwitness.biz.id` | `orbit` (3007) | Public | noindex |
   | `media.moonwitness.biz.id` | `echolog` (3006) | Edge-gated, SigV4 only | noindex |
   | `skylink.moonwitness.biz.id` | `skylink` (3005) | Path-limited to `/api/v1/webhooks` | noindex |
   | `cockpit.moonwitness.biz.id` | `cockpit` (3004) | Edge-gated **and** code patch | noindex |
   | `ai.moonwitness.biz.id` | `aigateway` (3003) | Edge-gated **and** inbound API key | noindex |
   | — | `sentinel`, `lumen-runtime`, `db`, `backup` | Internal, never routed | n/a |

   A service not in this table is never routed. A hostname that is not in this table does not exist.

2. **Tier before DNS.** No record may be created for a host whose tier is not satisfied: public hosts need nothing, login-gated hosts need their auth path verified, edge-gated hosts need the gate proving 401 before a certificate is issued.

3. **`a-l-l-a-h.com` is a pilot surface, not a second runtime.** `apps/empire-web` stays static, backend-free and `noindex`-free only because this ADR opens indexing. Dock remains the canonical LIGHTHOUSE runtime under ADR-0011 and keeps `moonwitness.biz.id`; this decision does not move, clone or replace it.

4. **Indexing.** `a-l-l-a-h.com` and `moonwitness.biz.id` are indexable. The owner accepted the residual risk that editorial copy, religious/source claims and rights review remain open; nothing in the app quotes scripture (GGS renders `RELIGIOUS SOURCE CONTENT WITHHELD`), so indexing publishes fiction and draft-labelled editorial copy, not unverified quotations. Reverting the flip is one commit (`robots.ts`, `sitemap.ts`, the two layouts, `nginx.conf`, and their tests). Every other host stays `noindex` until its own decision.

5. **Single canonical origin.** Coolify serves `a-l-l-a-h.com`. The Vercel project keeps the pilot as a preview-only deployment with its existing `X-Robots-Tag: noindex, nofollow` header and no custom domain, so the same build can never be indexed twice (ADR-0012's rule survives in substance).

6. **TLS and redirects.** Coolify's Traefik terminates TLS with a per-host Let's Encrypt certificate; no wildcard certificate in this milestone. `www` redirects are configured in exactly one place (Coolify), never in nginx, to avoid redirect loops.

7. **DNS scope.** Only `A`/`AAAA`/`CNAME` records for the hosts above. `NS`, `MX`, `SPF`, `DKIM` and `DMARC` are out of scope and must not be touched; email delivery must survive this cutover.

8. **Cockpit and the AI Gateway stay dark until their tier is satisfied.** Declaring a hostname is not authorization to expose an unauthenticated process supervisor or an unauthenticated LLM proxy. M44-07 is the gated task that either adds the edge gate plus its code change, or leaves both unrouted.

## Consequences

- The empire build emits `robots.txt` (allow + sitemap), `sitemap.xml` (23 canonical URLs) and per-route canonical/hreflang links; nginx adds HSTS and drops the blanket `X-Robots-Tag`.
- `apps/empire-web/docs/story-universe/contracts/content_manifest.json` records `noIndexRequired: false` with `noIndexSupersededBy: ADR-0016`.
- `docker-compose.yml` passes `ECHOLOG_URL` to `arsy` so D06 media-reference validation stops dialling `127.0.0.1` inside its own container.
- Verification is per host and follows `docs/architecture/RELEASE.md`: `DEPLOYED_VERIFIED` requires real HTTPS on `/id` and `/en` with the Coolify SHA and logs, not a green CI run.

## Rollback

Repoint a record to its previous target (Coolify auto-domain or the `*.vercel.app` alias) and redeploy the last known-good tag (`v2.20.2`). Reverting the indexing flip is a single commit. Deleting this ADR requires also reverting the domain bindings and the indexing change, in that order.

## Known limits

- Domain ownership and registrar state are not verified by the repository; this ADR records an owner instruction, not a registrar fact.
- The `www` redirects, certificates and DNS records are operator actions on the Coolify host and the registrar, not repository state.
- `apps/orbit` consumes `apiBaseUrl(env)` through `arsy-runtime-client.ts`; whether it calls the hub from the browser must be confirmed before widening `CORS_ORIGIN`.
