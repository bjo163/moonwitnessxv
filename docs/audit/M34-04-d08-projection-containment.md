# M34-04 — D08 projection boundary and API containment audit

## Evidence identity

- Task: M34-04, “Specify D08 released research projection.”
- Baseline branch/SHA: `dev` / `2a5805c178d3671ad875d05c7d35cecccb929ae1`.
- Worker result SHA: pending integrator commit; this working-tree result is not committed.
- Pre-existing unrelated worktree changes were preserved. TODO status was not edited.

## Result

The Research owning API now denies anonymous reads for E1–E6 and E5 raw model list/get. The seven raw `research_*` models use `ADMIN_FULL`, so raw REST reads and writes require the existing admin role. The seven D05 research read endpoints use `ADMIN_ONLY`. Existing writes and model ownership stay in `@moonwitness/moonql-research`; no new role, storage owner, release schema, or projection endpoint was added.

The behavioral contract and unresolved projection boundaries are recorded in [M34-04 D08 projection spec](../planning/M34-04-d08-projection-spec.md). This change intentionally does not create any public projection. E7/E9 remain fail-closed in Dock, E8 remains unwired, and E10 stays authenticated and unchanged.

## Acceptance evidence

Required positive controls are authenticated-admin reads of private Research endpoints and raw models. Required negative controls are anonymous denials for E1–E6/E5 plus no licensed or synthetic rights-unknown bytes in denied response bodies.

Commands run and observed results:

- Initial `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts test/public-projection-denial.test.ts test/research-pg.test.ts`: **failed diagnostic attempt** (8 failures). Tests were loading the package's declared `dist/index.js` export before it reflected the source ACL changes; two additional harness failures came from invoking async `adminHeaders()` inline after creating the request chain. These issues were corrected; this is not the final acceptance result.
- `pnpm --filter @moonwitness/moonql-research build`: **passed** (`tsc -b`); generated dist is ignored and not part of the claimed changes.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts test/public-projection-denial.test.ts test/research-pg.test.ts`: **passed**, 31 total, 29 pass, 0 fail, 2 skipped. The skips are the separate unsatisfied public-projection test and optional PostgreSQL slice (no `PARITY_DATABASE_URL`/`DATABASE_URL`).
- `pnpm --filter @moonwitness/arsy typecheck`: **passed**, both app and test TypeScript configs.
- `pnpm --filter @moonwitness/moonql-research typecheck`: **passed**.
- `pnpm exec eslint packages/moonql-research/src/index.ts packages/moonql-research/src/historical-pilot.ts apps/arsy/test/public-projection-denial.test.ts apps/arsy/test/research.test.ts apps/arsy/test/m15-historical-pilot.test.ts apps/arsy/test/research-pg.test.ts`: **passed**, no output.
- `git diff --check`: **passed**; Git emitted line-ending normalization warnings for pre-existing dirty files in the shared worktree.

## Security, rights, and privacy limits

- Authenticated admin is only the existing technical access role. It is not a D08 reviewer designation, release approver, or four-eyes sign-off.
- The `QS_2_82_id_kemenag` rights attribution conflict remains unresolved (NA-4); containment does not resolve it.
- M15 Jerusalem comparative-case re-ratification remains unresolved (NA-3); its endpoints are private pending a real accepted sign-off or retirement.
- NA-1 release authority and lifecycle are not specified here. No record means no anonymous released-research output.
- M19-19 stays fail-closed/open and M27-08 stays blocked pending a separately approved D08 projection. No deployment is asserted.

## Reviewer, rollback, next task

- Required reviewer: independent M34 integrator/security reviewer; do not self-approve the parent leaf.
- Rollback: revert this task's source, tests, specification, and audit together. Do not restore anonymous reads without an approved D08 projection or owner-signed rights exception and deliberate replacement of denial tests.
- Next eligible task: M34-05 after M34-04 is reviewed and the integrator records its exact checked-in result in TODO. Any public projection implementation remains gated by NA-1/NA-3/NA-4 and the required D08 owner decisions.
