# M22-05 — OpenAPI and Hub service discovery contracts

- **Task:** M22-05 (P0), protect OpenAPI and root Hub service discovery; preserve current API/SDK names.
- **Worker:** `/root/m22_05_openapi`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Current `dev` SHA checked:** `d8c5bfa2e61f7d797d9478de0522514048a93886`; the task branch is based on it.
- **Prerequisites:** TODO rows M05-07 and M22-01 are checked at the captured baseline.
- **Changed paths:** `apps/radio/test/m22-05-service-contracts.test.ts`, this report. No runtime route, OpenAPI schema, generated SDK, or package manifest changed.
- **Result SHA/reviewer:** pending integrator commit and review.

## Contract coverage

The in-memory tests pin the machine-readable root index at `/`, Hub port `3000`, the `/api/v1` prefix, and its advertised `/docs`, `/docs/json`, health, metrics, and Studio paths. They verify that the live OpenAPI document still exposes the station, station-catalog, weekly-schedule, and health paths with a relative server URL. Generated SDK names `stations`, `stationCatalog`, and `weeklySchedule` remain present, with no alternate `radioStations` or `radioStationCatalog` aliases.

Negative cases assert that unprefixed `/stations` and the guessed renamed `/api/v1/radioStations` alias return 404. These tests complement the existing `service-index.test.ts`, which already verifies the advertised root/OpenAPI endpoint; this task adds path and SDK name protection, not another endpoint implementation.

## Verification

- `pnpm --filter @moonwitness/radio exec tsx --test test/m22-05-service-contracts.test.ts` — exit 0; 2 passed, 0 failed.
- `pnpm exec eslint apps/radio/test/m22-05-service-contracts.test.ts` — exit 0.
- `git diff --check -- apps/radio/test/m22-05-service-contracts.test.ts` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 1 on existing diagnostics outside the new file: AIGateway source imported across Radio `rootDir`, plus existing Radio tests (`actors`, `ecosystem-god-tier`, `journey-patches`, `testing-cli`, `unilex-pg`, `unilex`, and `workspace-topology`). No diagnostic names `m22-05-service-contracts.test.ts`.

## Safety, limits, rollback

Tests use `fastify.inject()` against the in-memory app with WhatsApp and DENPA disabled. They make no external network calls and expose no credentials or private data. The checks do not prove deployment, Docker routing, or a public service instance. Rollback removes the one test file and this report. The next eligible dependent Radio leaf is M22-06 after M22-02 is integrated and reviewed.
