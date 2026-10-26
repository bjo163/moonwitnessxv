# M22-03 — DENPA opt-in, token, and payload gate

- **Task:** M22-03 (P0), verify DENPA opt-in, webhook token, and payload validation.
- **Worker:** `/root/m22_03_denpa`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Prerequisite:** M03-07 is checked in TODO. The M03 milestone still has other open gates; this test claims only the M22-03 acceptance.
- **Actual task files:** `apps/radio/test/m22-03-denpa-gate.test.ts`, this report.
- **Result SHA:** pending integrator commit/review. No runtime code or TODO status was changed by this task.

## Evidence

The focused in-memory test uses a synthetic token and payload marker. It verifies that requests with no `x-denpa-key` and a wrong key receive 401, do not echo the payload marker, and do not create a public transmission. A non-object JSON payload with the correct key receives 400. The same object payload with the configured synthetic token receives 202 and appears in the public transmission projection after the asynchronous write settles. Existing `denpa.test.ts` coverage also verifies disabled-by-default and enabled-with-empty-token configurations do not mount an inbound writer.

Commands executed:

- `pnpm --filter @moonwitness/radio exec tsx --test test/m22-03-denpa-gate.test.ts test/denpa.test.ts test/denpa-transmissions.test.ts` (from `apps/radio`) — exit 0; 9 passed, 0 failed.
- `pnpm exec eslint apps/radio/test/m22-03-denpa-gate.test.ts` — exit 0.
- `git diff --check -- apps/radio/test/m22-03-denpa-gate.test.ts` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 1. Reported diagnostics are in pre-existing cross-app AIGateway imports and other Radio tests (`actors`, `ecosystem-god-tier`, `journey-patches`, `testing-cli`, `unilex-pg`, `unilex`, `workspace-topology`); none names the new M22-03 test.

An initial test run used `?limit=100` on `publicLiveTransmissions`, which returned 400 because that view does not accept a limit query. The test was corrected to use the established route without that parameter and the focused suite then passed. This was a test correction; no endpoint behavior changed.

## Safety, rollback, and limits

Only an in-memory app and dummy token are used; no real webhook or credential is contacted. Public assertions inspect the safe transmission projection and do not expose internal token hashes or sender identity. Rollback removes the new test and this report. The focused result does not establish production deployment or external webhook operation. Independent integrator review and exact result SHA remain pending.
