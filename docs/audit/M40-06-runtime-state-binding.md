# M40-06 Audit: Bind the UI to Verified ARSY Runtime State

**Status: COMPLETED, VERIFIED.**
**Task ID:** M40-06
**Milestone:** [M40 — ORBIT: Spatial Agent Operations Frontend](../milestones/M40.md)
**Task Packet:** [docs/tasks/M40/M40-06.md](../tasks/M40/M40-06.md)
**Branch:** `dev`

---

## 1. Executive Summary & Boundaries

M40-06 establishes the verified runtime state binding for `@moonwitness/orbit`, fulfilling Milestone M40's foundational integrity requirement:
> **LIVE requires verified source/freshness; animation never masquerades as runtime state; outage/staleness tests pass; Radio/SIGNAL regression green.**

Key architectural invariants verified:
1. **Frontend-Only Boundary:** `@moonwitness/orbit` owns zero database tables, SQL drivers, or backend mutations. It consumes the canonical single Fastify/MoonQL Hub on port 3000 through the shared `apiBaseUrl(env)` helper from `@moonwitness/moonql-client`.
2. **Truthful Provenance & Freshness:**
   - Active `LIVE` badge with animated `LiveDot` is rendered **only** when `connectionStatus === 'LIVE_CONNECTED'` AND `freshness === 'FRESH'`.
   - Data older than the stale threshold (60s) is rendered with an explicit caution badge: `⚠ STALE ({lastSyncTimestamp})`.
   - When ARSY Hub is down, unreachable, or timed out, connection status evaluates strictly to `OFFLINE`, and an honest warning banner is rendered without pretending execution.
   - When ARSY Hub rejects credentials (HTTP 401/403), connection status evaluates strictly to `UNAUTHORIZED`.
   - Explicit simulation mode (`mode=simulated` or `ORBIT_SIMULATED=true`) produces `SIMULATED_LOCAL` with all fixtures labelled `[SIMULATED]`.
3. **Zero Secrets in Client Boundary:** Any sensitive fields (`apiKey`, `authToken`, `password`, `secret`) in arbitrary payloads are sanitized to `[REDACTED]` before reaching the client.
4. **BFF Route Protection:** Next.js route `/api/ops/state` proxies to ARSY server-side with `cache-control: no-store`, ensuring browser code never learns ARSY internal service credentials.
5. **Zero Regression:** ARSY Hub core routes, Radio playback, and Compose contracts remain 100% green (28/28 pass).

---

## 2. Deliverables & Changed Files

| File | Purpose |
| --- | --- |
| `apps/orbit/package.json` | Adds `@moonwitness/moonql-client` workspace dependency |
| `apps/orbit/src/lib/server/arsy-runtime-client.ts` | Server-side runtime adapter resolving Hub endpoint, probing health/runtime, sanitizing payloads, calculating freshness, and constructing fail-safe OFFLINE/UNAUTHORIZED projections |
| `apps/orbit/src/app/api/ops/state/route.ts` | Next.js BFF route handler returning sanitized operational projections with `no-store` cache headers |
| `apps/orbit/src/components/OrbitShellHeader.tsx` | Status bar rendering truthful badges for `LIVE` (tone: `ok`), `STALE` (tone: `accent`), `OFFLINE` (tone: `hot`), `UNAUTHORIZED` (tone: `hot`), and `SIMULATED_LOCAL` (tone: `accent`) |
| `apps/orbit/src/app/page.tsx` | Server Component page dynamically querying operational state and rendering honest offline alert banner when disconnected |
| `apps/orbit/src/lib/orbit-copy.ts` | Bilingual `id`/`en` 1:1 parity for `liveBadge`, `statusConnected`, `statusOffline`, `offlineNotice`, and `switchSimulatedFallback` |
| `apps/orbit/test/orbit-runtime-binding.test.mjs` | Comprehensive unit and contract tests verifying live binding, staleness, outage, 401/403, credential stripping, and header badge rules |
| `docs/tasks/M40/M40-06.md` | Formal task packet for M40-06 |
| `TODO.md` | Updates M40-06 to closed (`- [x]`) |

---

## 3. Verification & Evidence

### Test Suite: `@moonwitness/orbit`
Command executed:
```bash
pnpm --filter @moonwitness/orbit test
```
Result: **43 passed, 0 failed** (duration: 2233ms)
- `M40-06: resolveHubEndpoint resolves via apiBaseUrl with ARSY_* > RADIO_* and rejects conflicting values` — PASS
- `M40-06: fetchOrbitOperationalState returns SIMULATED_LOCAL when forceSimulated or ORBIT_SIMULATED is set` — PASS
- `M40-06: fetchOrbitOperationalState successfully projects LIVE_CONNECTED with FRESH state when ARSY Hub is healthy` — PASS
- `M40-06: fetchOrbitOperationalState evaluates STALE freshness when ARSY timestamp exceeds stale threshold (> 60s)` — PASS
- `M40-06: fetchOrbitOperationalState safely maps to OFFLINE when ARSY Hub is unreachable or times out` — PASS
- `M40-06: fetchOrbitOperationalState safely maps to UNAUTHORIZED on HTTP 401 or 403` — PASS
- `M40-06: fetchOrbitOperationalState sanitizes credentials from live ARSY payloads` — PASS
- `M40-06: OrbitShellHeader component enforces truthful status badges across all states` — PASS
- `M40-06: buildOfflineState and buildUnauthorizedState helper factories are deterministic` — PASS
- `M40-06: BFF route handler exists and prevents credential leakage to browser` — PASS

### TypeScript Typecheck
Command executed:
```bash
pnpm --filter @moonwitness/orbit typecheck
```
Result: **Exit status 0** (0 errors).

### Web Applications Build
Command executed:
```bash
pnpm build:web
```
Result: **Exit status 0**. All 3 Next.js applications (`@moonwitness/headquarters`, `@moonwitness/dock`, and `@moonwitness/orbit`) compiled successfully and generated static/dynamic production pages.

### Design System & UI Consistency Linter
Command executed:
```bash
pnpm ui:check
```
Result: **131 files scanned, 0 violations**. 100% adherence to MoonUI semantic design tokens.

### ARSY Backend Regression Invariance
Command executed:
```bash
pnpm --filter @moonwitness/arsy exec tsx --test test/arsy-env-compat.test.ts test/moonql-web-kit.test.ts test/compose-contract.test.ts
```
Result: **28 passed, 0 failed** (duration: 1292ms).

---

## 4. Rollback Plan

If regressions occur in live ARSY runtime integration:
1. Revert changes in `apps/orbit/src/app/page.tsx` and `apps/orbit/src/components/OrbitShellHeader.tsx`.
2. Remove `apps/orbit/src/lib/server/arsy-runtime-client.ts`, `apps/orbit/src/app/api/ops/state/route.ts`, and `apps/orbit/test/orbit-runtime-binding.test.mjs`.
3. Restore `apps/orbit/package.json` to previous commit.
4. Run `pnpm --filter @moonwitness/orbit test`.
