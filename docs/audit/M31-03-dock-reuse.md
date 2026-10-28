# M31-03 — Dock reuse decision audit

**Baseline SHA `659da28` · decision leaf · no route, copy, app or deployment change.** The artifact is [ADR-0011](../decisions/ADR-0011-lighthouse-dock-runtime.md), accepted by the owner in [M31-01](M31-01-brand-hierarchy-proposal.md). This audit records the structural evidence and the checks actually run.

## 1. Scope

M31-03 asks whether LIGHTHOUSE reuses the existing Dock application or adds an extra frontend. It depends on [M31-02](../design/M31-02-gateway-journeys.md), which inventoried 21 gateway journeys against Dock. This leaf decides the runtime only: it does not write gateway copy (M31-04), add tests (M31-05), create a route, buy a domain, or deploy.

## 2. Evidence reviewed

| Claim | Evidence | Observed at `659da28` |
|---|---|---|
| Dock is a real Next.js app with public routes | `apps/dock/package.json`, `apps/dock/src/app/**/page.tsx` | package `@moonwitness/dock`; 20 route files including `/`, `/reader`, `/terms`, `/stations`, `/research` |
| Locale negotiation is shared, not gateway-specific | `apps/dock/src/middleware.ts:8`, `packages/core/src/locale.ts:2` | middleware imports `isLocale`/`resolveLocale` from `@moonwitness/core`; `SUPPORTED_LOCALES = ['id', 'en']` |
| Navigation exists and is Dock-owned | `apps/dock/src/ui/components/shell.tsx:27-43` | 15 `NAV_LINKS` entries; the first four route links include `/`, `/reader`, `/stations`, `/terms` |
| Dock already builds as a deployable web artifact | `docker-compose.yml:205-236`, `Dockerfile.web:10,46-53` | `dock` service builds `Dockerfile.web` with `APP: dock`, port 3001 |
| No extra LIGHTHOUSE frontend exists | `apps/*` directory listing, workspace manifests | 10 app directories (`aigateway`, `arsy`, `cockpit`, `dock`, `echolog`, `headquarters`, `lumen-runtime`, `orbit`, `sentinel`, `skylink`); none named LIGHTHOUSE |
| ADR-0004 already bounds the runtime | `docs/decisions/ADR-0004-empire-surfaces.md:12` | LIGHTHOUSE stays within Dock initially and gains no independent owner, schema or deployment |
| Owner ratified reuse | `docs/audit/M31-01-brand-hierarchy-proposal.md:38-44` | option A; no separate app/backend/identity granted |

## 3. Checks performed

### Positive — reuse path exists

Command: `node scripts/check-m31-03-dock-reuse.mjs`

Observed: `PASS Dock reuse evidence: pages=20 apps=10 services=6` (exit 0). The script asserts the Dock package identity, the five required public routes, the four core navigation links, shared `id`/`en` locale authority, and that the `dock` Compose service builds the same `Dockerfile.web` artifact with `APP: dock`.

### Negative — no extra frontend, no private surface

The same command asserts: no `apps/lighthouse` directory, no workspace package named or located under LIGHTHOUSE, no `lighthouse` Compose service, and no reference to `headquarters`, `cockpit`, `arsy`, `skylink`, `echolog` or `/admin` anywhere under `apps/dock/src`. All pass at baseline.

Command: `node scripts/check-m31-03-dock-reuse.mjs --self-test`

Observed: `PASS self-test summary 15/15 invalid fixtures rejected` (exit 0). Fixtures include an extra LIGHTHOUSE app, a LIGHTHOUSE Compose service, a Dock service switched to another Dockerfile or `APP`, a missing public route, a missing nav link, a private-surface import, removal of locale negotiation, removal of `en` from the shared locale authority, and a missing ADR.

### Boundary observation (not fixed here)

The earlier M31-02 audit recorded that Dock renders Hub-sourced outbound links (`page.tsx:112-119`, `:178-184`) whose targets come from live data and cannot be declared safe by static inspection. This leaf does not change them; M31-05 must allow-list or omit Hub-sourced links in any scoped gateway preview.

## 4. Decision recorded

[ADR-0011](../decisions/ADR-0011-lighthouse-dock-runtime.md): Dock is the LIGHTHOUSE runtime; no extra frontend, backend, database, identity owner or Compose service is added. A future split requires a superseding ADR.

Index updated: `docs/decisions/README.md` now lists ADR-0011.

## 5. Limitations

- This is structural evidence, not a browser, Lighthouse, screenshot, accessibility or deployment result. No server was started and no image was built.
- The 20-page count and component line numbers reflect `659da28`; a parallel session is editing unrelated Dock files (`patches` route, `globals.css`, cockpit/headquarters), so later SHAs may move lines without changing this decision.
- Dock still carries the duplicate 15-item navigation tracked by M19-03 (two renderings of the same links) and has no global search; reuse inherits both.
- No claim is made about `a-l-l-a-h.com` ownership, DNS, TLS or release status.

## 6. Rollback

Delete `docs/decisions/ADR-0011-lighthouse-dock-runtime.md`, `scripts/check-m31-03-dock-reuse.mjs` and this audit; remove the ADR-0011 line from `docs/decisions/README.md`. No application code, route, schema or deployment is touched, so no runtime rollback is required.

## 7. Handoff

- **M31-04** writes `id`/`en` gateway copy and metadata inside `apps/dock`.
- **M31-05** adds the executable link, permission and offline-fallback tests, including Hub-sourced outbound links.
- **M19-03** still owns navigation hierarchy; this decision does not claim the gateway information architecture is implemented.
