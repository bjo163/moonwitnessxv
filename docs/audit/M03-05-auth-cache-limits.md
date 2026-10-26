# M03-05 — Token expiry, revocation, and cache limits

- **Task:** M03-05 (P0), test session expiry, revocation, and API-key cache limits.
- **Worker:** `/root/m03_05_identity_ttl`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`.
- **Prerequisite:** M03-03 is checked in TODO on this task baseline. `origin/main` and `origin/dev` both resolved to `d8c5bfa2e61f7d797d9478de0522514048a93886` at task start.
- **Working-tree state at task start:** existing integrator edits were limited to TODO and audit reports; the working branch already contained the unrelated M01/security follow-up commit. No worker changes were present in the M03-05 test path.
- **Claimed/actual changed paths:** `apps/radio/test/m03-05-auth-cache-limits.test.ts`, this report. No runtime source or configuration changed.
- **Integrated result SHA/reviewer:** `e345178a71cf47656f729d0b30dbaa6fecdf9fad`; integrator reviewed the diff and reran the combined focused suites below.

## Behavior covered

The new in-memory Hub tests prove an expiring session is accepted before its expiry and receives 401 after expiry even though the first request warmed the identity cache. A separate case creates 501 valid synthetic sessions, warms them in order, and verifies the oldest identity has to be resolved from storage again while the newest remains cached, exercising the 500-entry identity-cache ceiling.

API-key cache tests use only synthetic hashes and identities. They advance `Date.now` only for one synchronous cache lookup to verify expiry after 60 seconds, restore the clock immediately, then insert 5,001 unique entries and confirm the oldest is absent while the newest is available, proving the documented 5,000-entry cap. Existing identity tests continue to cover logout revocation, role-demotion invalidation, and non-caching of unknown tokens.

## Commands and observed results

- `pnpm --filter @moonwitness/radio exec tsx --test test/m03-05-auth-cache-limits.test.ts` — exit 0; 3 passed, 0 failed.
- `pnpm --filter @moonwitness/radio exec tsx --test test/m03-05-auth-cache-limits.test.ts test/moonql-identity-cache.test.ts test/ecosystem-god-tier.test.ts` — exit 0; 15 passed, 0 failed. Includes session expiry, identity LRU cap, API-key TTL/cap, logout revocation, role demotion, unknown-token behavior, and API-key invalidation.
- Integrator combined exact-SHA run: `pnpm --filter @moonwitness/radio exec tsx --test --test-concurrency=2 test/m03-05-auth-cache-limits.test.ts test/moonql-identity-cache.test.ts test/ecosystem-god-tier.test.ts test/m22-06-private-playlog-isolation.test.ts test/metrics.test.ts test/moonql-addons-v5.test.ts test/playlog-privacy.test.ts` — exit 0; 30 passed, 0 failed, 0 skipped at `e345178a71cf47656f729d0b30dbaa6fecdf9fad`.
- Integrator lint: `pnpm exec eslint apps/radio/test/m03-05-auth-cache-limits.test.ts apps/radio/test/m22-06-private-playlog-isolation.test.ts` — exit 0; `git diff --check` — exit 0.
- `pnpm exec eslint apps/radio/test/m03-05-auth-cache-limits.test.ts` — exit 0.
- `git diff --check -- apps/radio/test/m03-05-auth-cache-limits.test.ts` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 2 on existing cross-app AIGateway/rootDir and unrelated Radio test diagnostics. Capturing output and searching for `m03-05-auth-cache-limits` found no diagnostic for the new test file.

## Privacy, limits, rollback

All sessions, API-key hashes, users and passwords are synthetic and exist only in an in-memory Hub test; no real credential or database is used. The expiring-session case uses a short future expiry and a 350 ms wait. No live seven-day session passage, PostgreSQL expiry cleanup, production cache load, or deployment is claimed. The cache capacity checks exercise the current documented limits, not process-wide memory under production load.

Rollback removes this test and report. Hub remains the sole identity authority; no cache policy, API, TTL, role rule, or runtime behavior was changed. The integrator reviewed the task evidence; after this task, M03-05's remaining dependents and any other unblocked P0 rows remain governed by TODO.
