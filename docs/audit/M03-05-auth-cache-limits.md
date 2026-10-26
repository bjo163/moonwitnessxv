# M03-05 — Token expiry, revocation, and cache limits

- **Task:** M03-05 (P0), test session expiry, revocation, and API-key cache limits.
- **Worker:** `/root/m03_05_identity_ttl`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`.
- **Prerequisite:** M03-03 is checked in TODO on this task baseline. `origin/main` and `origin/dev` both resolved to `d8c5bfa2e61f7d797d9478de0522514048a93886` at task start.
- **Working-tree state at task start:** existing integrator edits were limited to TODO and audit reports; the working branch already contained the unrelated M01/security follow-up commit. No worker changes were present in the M03-05 test path.
- **Claimed/actual changed paths:** `apps/radio/test/m03-05-auth-cache-limits.test.ts`, this report. No runtime source or configuration changed.
- **Integrated result SHA/reviewer:** `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`; integrator reviewed the isolation diff and reran the full regression suite twice at this exact commit.

## Behavior covered

The new in-memory Hub tests prove an expiring session is accepted before its expiry and receives 401 after expiry even though the first request warmed the identity cache. A separate case creates 501 valid synthetic sessions, warms them in order, and verifies the oldest identity has to be resolved from storage again while the newest remains cached, exercising the 500-entry identity-cache ceiling.

API-key cache tests use only synthetic hashes and identities. The TTL and 5,000-entry capacity case runs in a child Node process that imports the same public package API. It advances `Date.now` only for one synchronous cache lookup, restores it, checks the oldest entry is evicted at capacity, and exits; this isolates its fake clock from parallel test workers. Existing identity tests continue to cover logout revocation, role-demotion invalidation, and non-caching of unknown tokens.

## Commands and observed results

- `pnpm --filter @moonwitness/radio exec tsx --test test/m03-05-auth-cache-limits.test.ts` — exit 0 after isolation; 3 passed, 0 failed.
- `pnpm --filter @moonwitness/radio test:regression` — exit 0 after isolation; 323 total, 314 passed, 0 failed, 9 PostgreSQL tests skipped because no `PARITY_DATABASE_URL`/`DATABASE_URL` was configured. This ran the task tests under the normal `--test-concurrency=2` setting alongside the full Radio suite, including concurrent M22-06 changes in the shared working tree.
- `pnpm exec eslint apps/radio/test/m03-05-auth-cache-limits.test.ts` — exit 0.
- `git diff --check` — exit 0 before the integration report update.
- `pnpm --filter @moonwitness/radio typecheck` — exit 2 on existing cross-app AIGateway/rootDir and unrelated Radio test diagnostics. Capturing output and searching for `m03-05-auth-cache-limits` found no diagnostic for the new test file.

## Privacy, limits, rollback

All sessions, API-key hashes, users and passwords are synthetic and exist only in an in-memory Hub test; no real credential or database is used. The expiring-session case uses a short future expiry and a 350 ms wait. No live seven-day session passage, PostgreSQL expiry cleanup, production cache load, or deployment is claimed. The cache capacity checks exercise the current documented limits, not process-wide memory under production load.

Rollback removes this test and report. Hub remains the sole identity authority; no cache policy, API, TTL, role rule, or runtime behavior was changed. The integrator reviewed the task evidence; after this task, M03-05's remaining dependents and any other unblocked P0 rows remain governed by TODO.

## Reopened for test isolation — 2026-10-27

During the full Radio regression run, the API-key TTL assertion failed intermittently: while this test temporarily replaced process-wide `Date.now`, another parallel test altered the same clock, so the entry appeared unexpired. The focused 30-test run and CI run `40379676734` passed, but the separately observed full local failure means the task is not considered reproducible yet. The owner must isolate the clock-dependent cache case and rerun the full `test:regression` suite before M03-05 is re-closed. No runtime cache defect was established by this test-harness race.

## Reproducible follow-up — 2026-10-27

- **Isolation change:** the API-key TTL/cap assertions now run in a child Node process using `@moonwitness/moonql-apikeys`' public API; the parent test worker never patches its `Date.now`. Runtime cache code and semantics are unchanged.
- **Baseline HEAD during initial follow-up:** `78c52ef50ef2174582829fa3a2f5b51e29ed1d47`; the working tree also contained concurrent M22-06 and Dock edits. One concurrent full run still failed on this intermediate state, so that result is retained in the M22-07 chronology.
- **Verification at result SHA:** the focused M03-05 test passed 3/3. After the fix was committed, `pnpm --filter @moonwitness/radio test:regression` was run twice at exact SHA `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`; both runs passed 323 total, 314 passed, 9 optional PostgreSQL tests skipped because no database URL was configured, 0 failed. The most recent run took 63.1 seconds. Full suite used test concurrency 2.
- **Integrator review/outcome:** reviewed that the fake clock now runs in a child Node process and does not patch the parallel parent worker; cache runtime code was not changed. The prior intermittent result was test-process clock interference, not evidence of a runtime cache defect. M03-05 is closed based on the repeated exact-SHA full-suite result.
