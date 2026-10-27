# M34-05 — Reviewer separation and wrong-role acceptance

## Evidence identity

- Task: M34-05, reviewer separation and wrong-role access.
- Branch / baseline: `dev` / `1927e8e6041110449752451f209ba167210de520`.
- Latest `main` observed before work: `2a5805c178d3671ad875d05c7d35cecccb929ae1`.
- Prerequisite M34-04 source change is present at the baseline; M34-04 CI remains a separate integration issue.
- Worker result SHA: pending integrator commit. This task did not modify TODO or commit/push.

## Result

Added a focused ARSY acceptance test for the existing hub-owned review flow. It proves that the named submitter cannot decide their own submitted review, a `guest` cannot decide it, and the review row and event trail remain unchanged after both denials. The independent named `user` can decide it through the intent endpoint. Generic REST list and patch requests against `research_reviews` return 404, so the state transition cannot bypass the review endpoint through model CRUD.

No role, route, schema, release authority, public projection, or rights decision was added. The test only uses synthetic fixture codes and existing auth users created in the test harness.

## Positive and negative evidence

- Positive: `pnpm --filter @moonwitness/moonql-research build` — passed (`tsc -b`).
- Positive and negative: `pnpm --filter @moonwitness/arsy exec tsx --test test/mizan.test.ts` — passed, 8 tests, 0 failures, 0 skips. The M34-05 test verifies independent user review succeeds and same-actor/guest/generic CRUD paths fail.
- TypeScript: `pnpm --filter @moonwitness/arsy typecheck` — passed for app and test configs.
- Lint: `pnpm exec eslint apps/arsy/test/mizan.test.ts` — passed, no output.
- Whitespace: `git diff --check -- apps/arsy/test/mizan.test.ts` — passed.

## Security and limitations

- The existing supported review-capable roles are `admin` and `user`; `guest` is denied. There is no dedicated reviewer-only identity role. ADR question NA-2 remains unresolved, so this evidence does not claim that a `user` is an authorized reviewer by a distinct role policy.
- The four-eyes check is enforced by the ARSY/MoonQL endpoint using authenticated actor IDs. A named actor cannot review their own submission.
- The review endpoint does not publish content; publication remains unavailable. No source-rights status was changed or inferred.
- This is local test evidence, not deployment evidence. M34-04's CI run `40496029758` at `1927e8e` built the monorepo and passed UI consistency and lint (58 warnings, 0 errors), then failed at `gen:sdk:check` because the intentional access-contract break had not yet been versioned or regenerated. It did not promote `main`; the follow-up API 2.0/generated-SDK fix is tracked in M34-04's audit.

## Reviewer, rollback, next task

- Independent review: passed read-only review; test logic is sound for current supported roles. Reviewer confirmed same-actor/guest denial, unchanged state and event trail, generic REST bypass denial, and independent named-user decision. No new reviewer role or authority was inferred; NA-2 remains open.
- Rollback: remove the M34-05 test and this audit file. No runtime or database change exists to roll back.
- Next eligible task: determine from the current TODO dependency graph after the integrator closes M34-04 and M34-05. NA-2 still gates any dedicated reviewer-only role implementation.
