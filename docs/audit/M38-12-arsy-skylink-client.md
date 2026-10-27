# M38-12 — ARSY consumes the SKYLINK channel registry

- task_id: M38-12
- baseline_sha: 7a5cba95f1e2bcef47da9ec6fb25415c8aba7987
- implementation_sha: 86c1fe6af508650a000c5599dd160c61e1e7890b
- CI: exact-SHA source verification workflow 40514820310 passed on `86c1fe6`; integrated verification workflow [40520212632](https://github.com/bjo163/moonwitnessxv/actions/runs/40520212632) passed on `66ba5bb` with M38-12 unchanged and guarded promotion advanced that integrated SHA to `main`.
- reviewer: independent read-only review of implementation and follow-up validation fix; no remaining blocker reported
- rollback: set SKYLINK_ENABLED=false; local ARSY factories load and no SKYLINK request is made
- next_eligible_task: M38-14 after M38-13 verification and status integration

## Scope and changed paths

Six implementation/test files changed:

- apps/arsy/src/app.ts
- apps/arsy/src/fastify.d.ts
- apps/arsy/src/lib/skylink.ts
- apps/arsy/src/modules/channels/index.ts
- apps/arsy/test/skylink-client.test.ts
- apps/skylink/src/modules/routes.ts

The feature flag defaults off. When enabled, ARSY reads channel IDs, labels, and states from SKYLINK's service-only registration route and sends through SKYLINK. Operator start/logout forwards the caller's ARSY bearer for upstream validation; it never sends the service key or cookie. Invalid registration fails closed, leaves ARSY running, registers no channel, and makes the channel list report unavailable.

## Verification observed locally

- From apps/arsy: node --env-file=../../.env --import tsx --test test/skylink-client.test.ts — 5/5 passed, 0 skipped. The positive test used the local PostgreSQL-backed SKYLINK store and synthetic provider fixture. Negative cases cover missing credentials, flag-off zero calls, and malformed registry bodies.
- pnpm --filter @moonwitness/arsy test — 383 tests, 372 passed, 11 skipped, 0 failed. The skips are existing PostgreSQL parity slices without DATABASE_URL; the focused integration command above ran the new D18 path with the local environment file.
- pnpm --filter @moonwitness/arsy typecheck — exit 0.
- pnpm --filter @moonwitness/arsy build — exit 0.
- pnpm --filter @moonwitness/skylink test — 10/10 passed.
- Scoped ESLint across all six changed source/test paths — exit 0.
- Pre-commit UI consistency gate — 132 files scanned, 0 violations.
- The ARSY regression suite includes the Docker workspace dependency contract; it passed and confirms Dockerfile dependency dist coverage.
- Independent reviewer found and requested runtime validation of registry data. That fix and its malformed-response test are included in implementation SHA above; reviewer follow-up confirmed the blocker closed.

## Security, privacy, and limitations

Only id, label, and state are exposed to the ARSY service credential. Duplicate or malformed rows are rejected. No new identity owner, database, table, or workspace dependency was added. Fixture account and messages use synthetic test data and are cleaned up by the test.

This verifies the local API contract, not a deployed provider or real chat delivery. No provider deployment or real chat delivery is claimed. M38-12 is closed in TODO after exact full verification and guarded promotion of integrated SHA `66ba5bb`; M38-14 owns the end-to-end/rollback gate.
