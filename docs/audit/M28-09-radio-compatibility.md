# M28-09 — Radio/SIGNAL backward-compatibility fixtures

- **Task:** M28-09, freeze Radio/player/WhatsApp/DENPA route compatibility before the ARSY rename.
- **Worker:** `/root/m28_09_radio_contract_tests`.
- **Task-start baseline SHA:** `8f96ee12cf88fa3aba838cc8cb81e61e9205af9b`.
- **M22-01 fixture source SHA:** `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`.
- **HEAD during final full-suite run:** `ffd435677a3bfb240ff1877ae51a9c940c414b12`.
- **Result SHA:** pending integrator commit; no commit was made by this worker.
- **Claimed/actual files:** `apps/radio/test/fixtures/m28-09-radio-compatibility.ts`, `apps/radio/test/m28-09-compatibility.test.ts`, this report.
- **Concurrent tree state:** other tasks had independent uncommitted changes in CI/security files, Dock localization files, and station seed token markers. This test does not import or assert `tokenHash` values and does not touch those files.

## Frozen contract

The fixture pins hub port `3000`, API prefix `/api/v1`, standard success/error envelope keys, and the pre-rename M22-01 seed counts and route shapes. Its integration test boots the real app with the in-memory engine and WhatsApp disabled, so it makes no external media, WhatsApp, DENPA, or database calls.

The test verifies 36 seeded stations, 35 active station-catalog rows, the 14-slot weekly schedule, an active station natural key, the timeshift and public on-air player routes, anonymous listener-beacon projection without listener/row identity, and the WhatsApp control-plane auth boundary. It also checks DENPA webhook rejection without/with a wrong synthetic key, acceptance with a synthetic test key, public transmit behavior, empty-message rejection, and omission of internal `tokenHash` from the public transmission projection. Generated station IDs and timestamps are consumed dynamically rather than frozen as constants; the M22 report withholds stream URLs and pseudonym values.

## Evidence

- `pnpm --filter @moonwitness/radio exec tsx --test test/m28-09-compatibility.test.ts` — exit 0; 1 test passed, 0 failed.
- `pnpm --filter @moonwitness/radio test` — exit 0; 315 total, 306 passed, 0 failed, 9 optional PostgreSQL tests skipped because no parity database URL was configured.
- `pnpm exec eslint apps/radio/test/m28-09-compatibility.test.ts apps/radio/test/fixtures/m28-09-radio-compatibility.ts` — exit 0.
- `git diff --check` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 2 due to existing diagnostics outside the claimed files: cross-app `apps/aigateway/src` imports violate Radio's `rootDir`, and existing `apps/radio/test/unilex.test.ts` / `workspace-topology.test.ts` typing diagnostics. No diagnostic named either M28-09 file.

## Safety, limits, rollback

Only deterministic in-memory API calls and synthetic test data are used. No real stream, external webhook, private listener, or production credential is accessed. The test checks stable port/prefix/envelope/domain identities without freezing generated database IDs or asserting stream availability. PostgreSQL parity remains skipped by the suite and live playback is not tested. Rollback removes the two test fixture files and this report; runtime/package identity is unchanged.

The exact result SHA and integrator review remain pending. M28-09's fixture work should be reviewed alongside M28-08's identity map before any hub rename; the existing Radio/SIGNAL domain and public API contract must remain intact.
