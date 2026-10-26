# M22-06 — Private playlog, metrics and public catalogue isolation

- **Task:** M22-06, test private playlogs, admin metrics and public catalogue isolation.
- **Worker:** `/root/m22_06_privacy_isolation`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`.
- **Prerequisites at baseline:** M22-02 and M03-02 are checked in `TODO.md`.
- **Claimed/actual task-owned paths:** `apps/radio/test/m22-06-private-playlog-isolation.test.ts`, this report.
- **Integrated result SHA:** `e345178a71cf47656f729d0b30dbaa6fecdf9fad`; integrator reviewed the diff and reran the combined focused suites below.

## Behavior and evidence

The test uses the existing Radio app, its public station catalog and listen beacon, the admin-only recent-play view and metrics endpoint. A synthetic email-like listener value is submitted to the public beacon. The beacon does not echo it; the authenticated admin view contains its pseudonym. Anonymous list and filtered `where` requests against both the raw playlog model and `recentPlays` return 401 without echoing either value. The public station catalog stays readable and contains neither value. Anonymous metrics are denied; an admin metrics scrape succeeds without exposing either value.

No runtime, ACL, schema, API or data source was changed. The marker is synthetic test data only; no real listener identity or credential was used. This test demonstrates the current API behavior; it does not make a new source-rights or public-data decision.

## Commands and results

- `pnpm --filter @moonwitness/radio exec tsx --test test/m22-06-private-playlog-isolation.test.ts test/metrics.test.ts test/moonql-addons-v5.test.ts test/playlog-privacy.test.ts` — exit 0; 15 passed, 0 failed, 0 skipped. Covers private list/search denial, admin recent-play access, metric authorization and projection, public catalog projection, and the neighboring privacy/catalog/metrics regressions.
- Integrator combined exact-SHA run: `pnpm --filter @moonwitness/radio exec tsx --test --test-concurrency=2 test/m03-05-auth-cache-limits.test.ts test/moonql-identity-cache.test.ts test/ecosystem-god-tier.test.ts test/m22-06-private-playlog-isolation.test.ts test/metrics.test.ts test/moonql-addons-v5.test.ts test/playlog-privacy.test.ts` — exit 0; 30 passed, 0 failed, 0 skipped at `e345178a71cf47656f729d0b30dbaa6fecdf9fad`.
- Integrator lint: `pnpm exec eslint apps/radio/test/m03-05-auth-cache-limits.test.ts apps/radio/test/m22-06-private-playlog-isolation.test.ts` — exit 0; `git diff --check` — exit 0.
- `pnpm exec eslint apps/radio/test/m22-06-private-playlog-isolation.test.ts` — exit 0.
- `git diff --check` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 1 on existing diagnostics outside the new test: imported AIGateway source outside Radio `rootDir`, and errors in `actors`, `ecosystem-god-tier`, `journey-patches`, `testing-cli`, `unilex`, and `workspace-topology` tests. No diagnostic referenced the new M22-06 test. The integrated source SHA separately passed root `pnpm verify` before this task began.

One initial focused attempt used `recentPlays?limit=100`, which the view rejects with HTTP 400. The request was corrected to the view's supported limit of 20; the focused suite above then passed.

## Limits, rollback and next work

Evidence uses Fastify injection and the in-memory Hub; it is not a PostgreSQL parity, browser, deployment, or live-broadcast test. Rollback removes the new test and this report; there is no runtime or stored-data change. Integrator review and exact result SHA are recorded above. M22-07 is now eligible because M22-03, M22-04 and M22-05 are checked.
