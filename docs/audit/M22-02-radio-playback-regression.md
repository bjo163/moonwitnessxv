# M22-02 — Radio playback, beacon, pseudonym and schedule regressions

- **Task:** M22-02, test player, playlog pseudonyms, listening beacons and schedules.
- **Worker:** `/root/m22_02_playback`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Prerequisite:** M22-01 checked at the captured baseline; its pinned fixture source SHA is `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`.
- **Result SHA:** pending integrator commit; no commit made by this worker.
- **Actual task-owned code file:** `apps/radio/test/m22-02-listen-validation.test.ts`.
- **Report:** `docs/audit/M22-02-radio-playback-regression.md`.

## Scope and coverage

The working tree already contained separate tests for beacon pseudonymization and duration validation (`playlog-privacy.test.ts`), public SSE projection and raw identity omission (`moonql-stream.test.ts`), public schedule views (`moonql-addons-v5.test.ts`), and player/timeshift plus schedule compatibility (`m28-09-compatibility.test.ts`). To avoid duplicating those suites, this leaf adds the unverified negative beacon case identified by the M22-01 audit: an unsupported event must be rejected without echoing or persisting listener-authored input.

The test uses an in-memory Radio app, a synthetic invalid-event label, and existing admin headers only for the persisted-row check. No real identity, stream, database, external service, or credential is used. Runtime APIs and source are unchanged.

## Verification

Executed on the dirty working tree based at the baseline SHA above:

- `pnpm --filter @moonwitness/radio exec tsx --test test/m22-02-listen-validation.test.ts test/playlog-privacy.test.ts test/moonql-stream.test.ts test/moonql-addons-v5.test.ts test/m28-09-compatibility.test.ts` — exit 0; 16 tests passed, 0 failed, 0 skipped. Covers the new invalid-event case plus pseudonymization, missing/invalid beacon data, public-feed privacy, schedule, and M28-09 playback/timeshift compatibility.
- `pnpm exec eslint apps/radio/test/m22-02-listen-validation.test.ts` — exit 0.
- `git diff --check` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 1 on existing diagnostics in unrelated AIGateway imports and existing Radio tests (`actors`, `ecosystem-god-tier`, `journey-patches`, `testing-cli`, `unilex`, and `workspace-topology`). No diagnostic referenced the M22-02 test file.

One initial focused run used `recentPlays?limit=100`, which the endpoint rejected with HTTP 400; the test was corrected to its supported `limit=20` and the full focused command then passed. No endpoint behavior was changed.

## Safety, rollback, limitations

The negative case proves schema rejection and no persistence of an unsupported event. Existing tests supply the positive beacon and playback/schedule assertions described above. This is injected in-memory evidence only; it does not prove browser audio playback, external stream availability, PostgreSQL parity, deployment, or live broadcast state. Rollback is limited to removing the new test and this report. Independent integrator review and exact result SHA remain pending.
