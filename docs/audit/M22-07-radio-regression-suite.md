# M22-07 — Reusable Radio regression suite

- **Task:** M22-07, publish a reusable Radio regression suite for future gates.
- **Worker:** `/root/m22_07_radio_regression_suite`.
- **Task-start baseline:** branch `codex/m05-08-locale-audit-387f784`, HEAD `107662d570aa2e17c395abd0053cf221259d1090`; `origin/dev` and `origin/main` were both `d8c5bfa2e61f7d797d9478de0522514048a93886`.
- **Prerequisites:** M22-03, M22-04, M22-05 and M22-06 are checked in TODO at task start.
- **Task packet:** no `docs/tasks/M22/M22-07.md` exists; `docs/planning/GRANULARITY_AUDIT.md` lists this row as `NEEDS_CLARIFICATION`. The implementation follows the narrow TODO acceptance (“Run before and after each integration”) and does not invent a test subset or add assertions.
- **Changed paths for this task:** `apps/radio/package.json` and this report. The package script is committed in exact result SHA `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`.

## Reusable command

The existing Radio package test script already discovers every `test/**/*.test.ts` file with concurrency 2. This task exposes that full suite under `test:regression` and keeps the existing `test` script delegating to it. The root `pnpm test` continues invoking the package's `test` script, and root `pnpm verify` continues invoking `pnpm test`. Future integrations can run the same canonical package command directly before and after changes:

```powershell
pnpm --filter @moonwitness/radio test:regression
```

No runtime API, dependencies, lockfile, or test assertions were changed.

## Verification and current status

- `pnpm --filter @moonwitness/radio test:regression` — initial run passed: 323 tests, 314 passed, 9 optional PostgreSQL tests skipped because no database URL was configured, 0 failed.
- Integrator reported a clean post-fix run. One concurrent rerun by this worker during the M03-05 fix integration (HEAD `78c52ef50ef2174582829fa3a2f5b51e29ed1d47`) failed: 323 tests, 313 passed, 1 failed, 9 skipped. Failure: `M03-05: API key cache TTL and capacity are isolated from parallel test clocks` at `apps/radio/test/m03-05-auth-cache-limits.test.ts:105,144`; child assertion `an API key identity older than 60 seconds must expire` expected `null` and received `synthetic-user-0` with `cachedAt: 1793040558123`.
- After that fix landed at HEAD `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`, a fresh `pnpm --filter @moonwitness/radio test:regression` run passed: 323 tests, 314 passed, 9 optional PostgreSQL tests skipped because no database URL was configured, 0 failed (63.7 seconds).
- `git diff --check -- docs/audit/M22-07-radio-regression-suite.md apps/radio/package.json` — passed (no whitespace errors). Radio has no package lint script, and the only M22-07 source change is package JSON, so no source-file lint command applies. The M03-05 test file was not edited by this worker.

- **Integrator review:** verified `test:regression` delegates to the existing full Radio suite (concurrency 2), and that `test` delegates to the same command. The current full suite passed twice at `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`; one intermediate failure during the M03-05 isolation fix is preserved above. M22-07 is closed on local exact-SHA evidence; no new CI run or deployment is claimed for `fae40f7`.

**Status: closed by integrator review.** Exact-SHA evidence above verifies the reusable command and its current result.

## Limits and rollback

The suite provides in-memory/API and unit regression coverage; nine PostgreSQL cases are skipped without a database URL. A pass does not prove Docker, browser, deployment, live stream, or production database behavior. Rollback is limited to removing the `test:regression` alias and restoring `test` to its original direct `tsx` command, then removing this report. The root integrator owns TODO status and should record the final exact-SHA run and review outcome there.

**Next eligible work:** downstream exact-SHA matrices that depend on this gate include M27-03 and M28-06. They remain gated until integrator closes M22-07; the current TODO section lists no later M22 task.
