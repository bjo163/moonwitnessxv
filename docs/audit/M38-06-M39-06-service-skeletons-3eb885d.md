# M38-06 SKYLINK runner and M39-06 ECHOLOG skeleton evidence

**Verified source SHA:** `3eb885d14049cd330d8d8b24544d75dfbd6c4a0d`
**M38-06 implementation commit:** `df1acb7` (included in the verified source SHA)
**M39-06 implementation commit:** `3eb885d`
**Date:** 2026-10-27 · **Integrator/reviewer:** root

## M38-06 — SKYLINK port, env and runner contract

The runner, start command, shared `PORTS` contract, egress deny-host and free-ports tool now include port 3005. The service runner forces `PORT=3005` so the root `.env` Radio value `PORT=3000` cannot leak into SKYLINK. `SKYLINK_URL_DEFAULT` is a code-owned shared URL; no unused environment override was added. `.env.example` explains the contract and the env validator retains its no-unknown/no-unused-key behavior.

Evidence:

- `pnpm --filter @moonwitness/radio exec tsx --test test/env-contract.test.ts test/workspace-topology.test.ts test/dockerfile-contract.test.ts` — 18/18 passed at the verified source SHA.
- `pnpm --filter @moonwitness/skylink build`, `typecheck`, `test` — passed; 4/4 tests.
- SKYLINK core build and typecheck — passed.
- `pnpm start:skylink` and `pnpm dev:skylink` each served `/health` on port 3005 and shut down cleanly; port was free afterward.
- Negative env-contract check with a temporary unknown key failed as expected; the key was removed and the test returned to 7/7 passing.
- Full Radio suite `pnpm --filter @moonwitness/radio test` — 320 passed, 9 optional PostgreSQL tests skipped, 0 failed at the verified source SHA.

## M39-06 — ECHOLOG health-only service skeleton

`apps/echolog` and `packages/echolog-core` now provide a buildable Fastify health service and reusable driver/sidecar/reference types plus a Web Crypto SHA-256 helper. There is no active storage driver, SQL import, bucket or UI. `/health/ready` reports the truthful `503 no driver configured` state.

Evidence:

- `pnpm --filter @moonwitness/echolog build` and `typecheck` — passed.
- `pnpm --filter @moonwitness/echolog test` — 3/3 passed, including invalid-port negative checks and a known SHA-256 vector.
- ECHOLOG core build and typecheck — passed; `pnpm exec eslint apps/echolog packages/echolog-core` — passed.
- Runtime command `pnpm --filter @moonwitness/echolog exec tsx src/index.ts --port 3006` served `GET /health` with `200` and `{"status":"ok","app":"echolog","port":3006}`; `GET /health/ready` returned `503` and `{"status":"not_ready","app":"echolog","reason":"no driver configured"}`. The process was stopped after the requests.
- `pnpm install --frozen-lockfile --ignore-scripts` — passed with pnpm 10.33.4; importer contract tests passed.
- `rg -n 'drizzle-orm|postgres|node:crypto' apps/echolog packages/echolog-core` — no forbidden SQL or Node crypto imports found.
- `pnpm build` — passed for all root build targets, including shared packages and SKYLINK. Cockpit emitted its existing large-client-chunk advisory.

## Boundaries and limitations

These results verify only M38-06 and M39-06. SKYLINK still has no providers, D18 store, operator UI or ARSY integration. ECHOLOG has no active filesystem/S3 driver, object upload/download API, bucket, retention execution, legal-hold enforcement or consumer handoff. No deployment or release acceptance is claimed.
