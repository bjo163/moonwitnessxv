# M20-05 — Best-effort audit, actor, and retention contract

**State:** integrated and verified at exact source SHA `d03c59d819b5ec0f655bfc289a8cdf1bd3024f1f`.

- **Baseline:** branch `dev`, `HEAD` `701b629216ad9ef722c7c6571ca20eabff4b831a`; the checkout already contained unrelated concurrent task changes, which were preserved.
- **Changed paths:** `apps/arsy/test/moonql-ops.test.ts` and this audit report. No production/package source or TODO status was changed.
- **Positive reliability evidence:** a deterministic rejected `ops_audit.create()` does not change the originating `POST /orm/stations` response (201); the created station remains readable; the async audit failure warning is emitted. The test also verifies that the model bus event and the `ops_audit` schema contain no actor field. This documents the current absence of actor attribution; it does not invent or infer an actor.
- **Retention evidence:** the `purge-audit` cron is invoked with `OPS_AUDIT_RETENTION_DAYS=30`. A stubbed engine confirms the configured 30-day cutoff, 1,000-row bounded purge chunks, and reporting of residual old rows. Existing metadata coverage confirms the cron cadence is one day.
- **Commands/results:**
  - Baseline `pnpm --filter @moonwitness/arsy exec tsx --test test/moonql-ops.test.ts` — 6/6 passed.
  - Updated focused suite — 8/8 passed.
  - `pnpm --filter @moonwitness/arsy typecheck` — passed (source and test projects).
  - `pnpm exec eslint apps/arsy/test/moonql-ops.test.ts` — passed.
  - `git diff --check -- apps/arsy/test/moonql-ops.test.ts` — passed.
- **Security/governance limits:** audit writes are asynchronous best-effort and can be missing after storage failure. Actor identity is not attached to current model events or `ops_audit`; the tests make no attribution claim. Audit records are not immutable, durable approval evidence, or a substitute for D08 decision records. The retention test exercises the cron's bounded calls/cutoff through a stubbed engine; it does not prove database durability or a live PostgreSQL purge.
- **Warning limit:** the current warning includes the storage error message. The fixture uses a fixed harmless error string; this test does not prove arbitrary backend error text cannot contain sensitive data.
- **Independent review:** read-only review found no concrete blocker. It confirmed that write-failure behavior is tested, actor/immutability claims remain bounded, and retention behavior is exercised through a stubbed engine.
- **Exact-SHA CI:** [run 40502948854](https://github.com/bjo163/moonwitnessxv/actions/runs/40502948854) passed full monorepo verification for `d03c59d` and promoted the same source SHA to `main`.
- **Closure:** M20-05 is verified at `d03c59d`. It documents and tests the current best-effort boundary; it does not implement actor attribution or establish immutable/durable audit evidence.
- **Rollback:** revert only the new assertions/tests in `apps/arsy/test/moonql-ops.test.ts` and remove this report; no production behavior changed.
