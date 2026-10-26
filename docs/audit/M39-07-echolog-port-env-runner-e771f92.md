# M39-07 ECHOLOG port, environment and runner evidence

**Result SHA:** `e771f92e9bc3dc0ef1a30d4a71f63e788847b0ae`
**Date:** 2026-10-27 · **Reviewer:** root integrator

## Change

ECHOLOG now has its own `PORTS.echolog = 3006`, `ECHOLOG_URL_DEFAULT`, and egress deny-host entry. The dev runner and free-ports script expose the service; the runner explicitly passes `ECHOLOG_PORT=3006` and removes the inherited Radio `PORT` before starting it. `.env.example` documents the two keys the ECHOLOG config actually reads. Root build/test scripts include the ECHOLOG app while `build:libs` remains derived from workspace packages. No storage driver or bucket was enabled.

## Verification

- `pnpm --filter @moonwitness/radio exec tsx --test test/env-contract.test.ts test/egress.test.ts` — 17/17 passed at the verified source state.
- `pnpm --filter @moonwitness/echolog build` and `typecheck` — passed; `pnpm --filter @moonwitness/echolog test` — 4/4 passed.
- ECHOLOG core build and typecheck — passed; `pnpm exec eslint apps/echolog packages/echolog-core` — passed.
- Full `pnpm --filter @moonwitness/radio test` — 322 passed, 9 optional PostgreSQL tests skipped, 0 failed.
- Negative env test added a temporary unknown key, confirmed the contract test rejected it, and restored `.env.example` byte-for-byte. Focused env/egress tests passed again afterward.
- With inherited `PORT=3000`, `pnpm dev:echolog` served `GET /health` on port 3006 with `200` and `{"status":"ok","app":"echolog","port":3006}`. `GET /health/ready` returned `503` and `{"status":"not_ready","app":"echolog","reason":"no driver configured"}`. After stopping the runner, a listener check reported `port 3006 free`.
- Root `pnpm build` passed for the configured packages and apps, including ECHOLOG and SKYLINK.

## Limitations

The runner emitted Node's `DEP0190` warning on Windows; it did not affect the smoke test. Database/storage behavior, S3, upload/download APIs, and deployment remain unimplemented and untested.
