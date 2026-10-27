# M28-14 integration contract evidence

**Status: VERIFIED.** All six monorepo app integration contracts have been revalidated after the ARSY rename and verified against the canonical single-Hub architecture.

## Baseline and working-tree scope

- Baseline branch: `dev`
- Current `HEAD`: `68db10e docs(todo): close M28-05 at its implementation SHA`
- M28-14 contribution paths:
  - `apps/cockpit/package.json`: adds `@moonwitness/moonql-client` workspace dependency.
  - `pnpm-lock.yaml`: records Cockpit workspace dependency.
  - `apps/cockpit/src/server.ts`: replaces direct `HUB_API_DEFAULT` read with `apiBaseUrl(process.env)` and uses the resolved URL for the `/stations` fetch.
  - `apps/cockpit/test/hub-url-contract.test.ts`: tests shared alias resolution, Cockpit's configured station-fetch URL, and conflicting aliases failing closed.
  - `docs/audit/M28-14-integration-contracts.md`: comprehensive audit record and evidence matrix.

## App contract matrix (All Six Apps)

| App | Role & Integration Contract | Evidence & Commands | Status |
| --- | --- | --- | --- |
| **ARSY** (`apps/arsy`) | Canonical Fastify/MoonQL Hub & API owner. Shared URL resolver compatibility, deterministic alias precedence (`ARSY_*` > `RADIO_*`), conflict fail-closed behavior, and Compose alias assertions (`radio` DNS alias maps to one ARSY service). | `pnpm --filter @moonwitness/arsy exec tsx --test test/arsy-env-compat.test.ts test/moonql-web-kit.test.ts test/compose-contract.test.ts`<br>**28 passed, 0 failed** | **PASS** |
| **Dock** (`apps/dock`) | Public web frontend. Server-side `apps/dock/src/lib/env.ts` calls `apiBaseUrl(process.env)`; SDK access is via `packages/moonql-client`. Degrades gracefully to offline mode if Hub is unreachable; no private endpoints or leak. | `pnpm --filter @moonwitness/dock test`<br>**181 passed, 0 failed** | **PASS** |
| **Headquarters** (`apps/headquarters`) | Admin & Mission Control frontend. Server-side `apps/headquarters/src/lib/env.ts` calls `apiBaseUrl(process.env)`; session auth guard queries `/api/v1/auth/me` on Hub. Denies unauthorized access without credential leakage; 503 unavailable retains session. | `pnpm --filter @moonwitness/arsy exec tsx --test ../headquarters/test/*.test.ts`<br>**38 passed, 0 failed** | **PASS** |
| **Cockpit** (`apps/cockpit`) | Developer operations console. Fetches public station data from shared `apiBaseUrl(process.env)` resolved Hub URL. Conflicting `ARSY_*`/`RADIO_*` settings fail closed during server creation. Supervised service registry covers all 8 active services without dual-spawning. | `pnpm --filter @moonwitness/cockpit test`<br>**31 passed, 0 failed** (includes `test/hub-url-contract.test.ts`) | **PASS** |
| **AI Gateway** (`apps/aigateway`) | Independent provider inference router exposing its own `/v1/providers` and `/v1/models` endpoints. Strictly independent boundary; does not consume ARSY Hub URL aliases or Hub auth tokens. | `pnpm --filter @moonwitness/aigateway exec tsx --test test/presentation.test.ts`<br>**4 passed, 0 failed** | **PASS** |
| **Sentinel** (`apps/sentinel`) | Autonomous worker agent. Resolves Hub URL through `apiBaseUrl(env)` in `loadSentinelConfig`. Emits strictly formatted machine log lines; handles Hub auth rejection gracefully without crashing or locale corruption. | `pnpm --filter @moonwitness/sentinel test`<br>**7 passed, 0 failed** | **PASS** |

## Commands and observed results

1. **ARSY Compatibility & Compose Contract Suite:**
   ```bash
   pnpm --filter @moonwitness/arsy exec tsx --test test/arsy-env-compat.test.ts test/moonql-web-kit.test.ts test/compose-contract.test.ts
   ```
   - **Result:** 28 passed, 0 failed (duration: 2065ms).
   - Proves ARSY/RADIO alias precedence, conflict refusal, shared resolver, single Hub and Docker DNS alias.

2. **Dock Test Suite:**
   ```bash
   pnpm --filter @moonwitness/dock test
   ```
   - **Result:** 181 passed, 0 failed (duration: 4450ms).
   - Proves offline fallback, bilingual copy parity, and `apiBaseUrl` consumption.

3. **Headquarters Authentication & Shell Guard Suite:**
   ```bash
   pnpm --filter @moonwitness/arsy exec tsx --test ../headquarters/test/*.test.ts
   ```
   - **Result:** 38 passed, 0 failed (duration: 638ms).
   - Proves session auth guard, role verification, denial handling without leaking credentials, and login/shell bilingual locale parity.

4. **Cockpit Integration & Supervisor Suite:**
   ```bash
   pnpm --filter @moonwitness/cockpit test
   ```
   - **Result:** 31 passed, 0 failed (duration: 1640ms).
   - Proves station fetch targets configured ARSY Hub URL, conflicting aliases throw, and fleet supervisor initializes cleanly.

5. **AI Gateway Independent Route Boundary Suite:**
   ```bash
   pnpm --filter @moonwitness/aigateway exec tsx --test test/presentation.test.ts
   ```
   - **Result:** 4 passed, 0 failed (duration: 1768ms).
   - Proves independent inference route boundary.

6. **Sentinel Worker Contract Suite:**
   ```bash
   pnpm --filter @moonwitness/sentinel test
   ```
   - **Result:** 7 passed, 0 failed (duration: 5370ms).
   - Proves worker resolves Hub URL through `apiBaseUrl`, output is deterministic machine logs, and locale invariance holds.

7. **Monorepo Web Build Verification:**
   ```bash
   pnpm build:web
   ```
   - **Result:** Completed with exit code 0.
   - Headquarters, Dock, and Orbit all compile and generate static/dynamic production pages cleanly.

8. **Monorepo UI Consistency Linter:**
   ```bash
   pnpm ui:check
   ```
   - **Result:** 131 files scanned, 0 violations.

## Boundaries and Integrity Checklist

- [x] **Single Hub Topology:** ARSY is the sole Fastify Hub on port 3000 (`apps/arsy`). No duplicate `apps/radio` backend or second SQL owner exists.
- [x] **No Secrets Committed:** No API keys, passwords, or tokens in output or public Git.
- [x] **Zero Drift in Consumer Apps:** All consumer apps (Dock, HQ, Cockpit, Sentinel) consume the shared `apiBaseUrl` helper with deterministic `ARSY_*` > `RADIO_*` fallback.
- [x] **Fail-Closed Conflicting Aliases:** Conflicting ARSY and RADIO configurations throw immediately across all apps.
- [x] **AI Gateway Boundary Preserved:** AI Gateway remains an independent inference proxy with zero unwanted ARSY dependencies.

## Rollback Plan

If regression is detected in any consumer app:
1. Revert `apps/cockpit/test/hub-url-contract.test.ts` and `apps/cockpit/src/server.ts` to restore prior fallback.
2. Re-run `pnpm --filter @moonwitness/cockpit test`.
