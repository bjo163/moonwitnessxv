# M19-22 — HQ model and view localization evidence

**Task:** M19-22 — Localize HQ model/forms/views/actions/validation
**Worker:** `/root/m19_22_evidence_audit`
**Lease baseline:** `2257139321c77e9d0ec9a12c61af32cc2c13eefa` (`dev`)
**Current repository HEAD when verified:** `deb1fa74a7d6c37059bcf9f6219ca05b28dfce06` (`dev`; integrator's docs-only M19-31 commit landed during this work)
**Result:** worktree-only; no implementation commit was created. The changed source and tests were run with the exact HEAD above plus the listed uncommitted M19-22 files. Integrator must rerun acceptance after integrating them at one result SHA.

## Claim and scope

M19-21 was checked at `701b629216ad9ef722c7c6571ca20eabff4b831a`. Integrator recorded the exclusive M19-22 claim under the ratified M29-02 contract. The implementation kept the `_schema` names, field names, query keys, routes, and permission rules intact. It localized HQ-owned model/view chrome and stable action/error messages for Indonesian and English. Metadata-provided model and field labels remain unchanged so localization does not alter source identifiers.

Changed paths:

- `apps/headquarters/src/app/(admin)/models/locale-copy.ts`
- `apps/headquarters/src/app/(admin)/models/page.tsx`
- `apps/headquarters/src/app/(admin)/models/[model]/page.tsx`
- `apps/headquarters/src/app/(admin)/models/[model]/new/page.tsx`
- `apps/headquarters/src/app/(admin)/models/[model]/[id]/page.tsx`
- `apps/headquarters/src/app/(admin)/views/page.tsx`
- `apps/headquarters/src/app/(admin)/views/[view]/page.tsx`
- `apps/headquarters/src/ui/widgets/RecordForm.tsx`
- `apps/headquarters/src/ui/widgets/ModelTable.tsx`
- `apps/headquarters/test/model-view-locale.test.ts`
- `docs/audit/M19-22-hq-model-view-localization.md`

No changes were made to `apps/headquarters/src/data/actions.ts`, `apps/headquarters/src/lib/editor-copy.ts`, `apps/headquarters/src/lib/monitor-copy.ts`, or `TODO.md`; those files had unrelated existing worktree changes and were outside the lease.

## Behavior and acceptance evidence

- Model registry/list, create/edit form, table, view registry, and view runner resolve the request locale using the existing `requestLocale()` helper and show paired `id`/`en` copy.
- Schema-derived field names, form names such as `title::text`, model/view keys, and URLs remain identical across locales.
- Known action results and validation/auth errors render localized fixed messages. Unknown query values (including credential-like strings and prototype keys) select no message.
- Existing model/view guards and CRUD affordances remain in place. The focused regression asserts authorization precedes model/view reads and that create/update/delete controls remain derived from the published ACL. Existing authorization tests cover anonymous redirects, role denial, unavailable Hub, and refusal to fetch data before denial.
- HQ action implementation in `apps/headquarters/src/data/actions.ts` is outside this task's changed-file scope and was not edited. M20-01 establishes HQ as a thin client and the Hub as the single ACL authority; therefore this task does not add a duplicate HQ role policy. The focused HQ tests verify published permission affordances and authorization-before-read behavior, while the Hub REST contract test below verifies mutation enforcement for all three write operations.
- Unknown non-empty action error query values are rendered as one fixed localized generic message. This avoids reflecting arbitrary hub validation text or user input; empty/missing errors render no notice.

Commands actually run at HEAD `deb1fa74a7d6c37059bcf9f6219ca05b28dfce06` with the listed source present in the worktree:

| Command | Observed result |
|---|---|
| `pnpm --filter @moonwitness/arsy exec tsx --tsconfig ../../apps/headquarters/tsconfig.json --test ../../apps/headquarters/test/model-view-locale.test.ts ../../apps/headquarters/test/hq-authz-guard.test.ts` | 27 passed, 0 failed, 0 skipped (4 localization tests and 23 authorization tests) |
| `pnpm --filter @moonwitness/headquarters typecheck` | exit 0 |
| `pnpm exec eslint "apps/headquarters/src/app/(admin)/models" "apps/headquarters/src/app/(admin)/views" apps/headquarters/src/ui/widgets/RecordForm.tsx apps/headquarters/src/ui/widgets/ModelTable.tsx apps/headquarters/test/model-view-locale.test.ts` | exit 0; 3 `no-non-null-assertion` warnings at existing relation-option extraction lines in model edit/new and view runner |
| `git diff --check -- "apps/headquarters/src/app/(admin)/models" "apps/headquarters/src/app/(admin)/views" apps/headquarters/src/ui/widgets/RecordForm.tsx apps/headquarters/src/ui/widgets/ModelTable.tsx apps/headquarters/test/model-view-locale.test.ts` | exit 0, no output |

## Security, rights, rollback, and limits

This is UI localization over existing schema/ACL data; no source corpus, private witness content, or model/field identity mapping was added. Error messages are local fixed strings and do not echo API text or query input. No authorization policy or backend owner changed. Rollback only the ten implementation/test paths above; preserve all other dirty changes. The audit file itself may be removed with this task's documentation rollback.

The HQ UI tests render synthetic forms/tables and verify page-level guards; they do not submit browser create/update/delete requests. A separate ARSY auth fixture exercises the Hub's actual Fastify REST routes using synthetic data and tokens: admin create/update/remove succeed; anonymous writes return 401; an authenticated user without the admin role gets 403 for create/update/remove; a final privileged read confirms denied update/remove did not alter the protected row. This is focused Hub ACL contract evidence, not a live PostgreSQL or deployed-Hub test. No browser E2E or deployment was run. The task is ready for exact integrated-SHA verification; do not claim live CRUD or deployment. M19-23 follows only after M19-22 is accepted and integrated.

## Expanded Hub ACL contract evidence (integrator review)

The M19-22 lease was explicitly expanded by the integrator to one additional path, `apps/arsy/test/moonql-auth.test.ts`, so the existing Hub ACL authority could be tested without creating a second HQ authorization layer. The synthetic `vault_items` fixture now declares authenticated list/get and admin-only create/update/remove. The admin flow asserts POST 201, PATCH 200 with the changed value, and DELETE 204. The negative flow asserts anonymous POST/PATCH/DELETE each return 401, and a signed-in `user` may list but receives 403 for each admin-only write. A final privileged read confirms the protected row remains unchanged after denied update/remove, and an admin collection read confirms denied create attempts did not add rows. Independent read-only review accepted the evidence and architecture.

At dirty worktree based on `feb5d224ef3e2ce1b93d02a52f7424b761231fe9`, before the M19-22 integration commit:

| Command | Observed result |
|---|---|
| `pnpm --filter @moonwitness/arsy exec tsx --test test/moonql-auth.test.ts` | 3 passed, 0 failed, 0 skipped |
| `pnpm --filter @moonwitness/arsy exec tsx --tsconfig ../../apps/headquarters/tsconfig.json --test ../../apps/headquarters/test/model-view-locale.test.ts ../../apps/headquarters/test/hq-authz-guard.test.ts` | 27 passed, 0 failed, 0 skipped |
| `pnpm --filter @moonwitness/headquarters typecheck` | exit 0 |
| `pnpm exec eslint "apps/headquarters/src/app/(admin)/models" "apps/headquarters/src/app/(admin)/views" apps/headquarters/src/ui/widgets/RecordForm.tsx apps/headquarters/src/ui/widgets/ModelTable.tsx apps/headquarters/test/model-view-locale.test.ts` | exit 0; 3 non-null assertion warnings in relation-option extraction |
| `git diff --check -- apps/arsy/test/moonql-auth.test.ts "apps/headquarters/src/app/(admin)/models" "apps/headquarters/src/app/(admin)/views" apps/headquarters/src/ui/widgets/RecordForm.tsx apps/headquarters/src/ui/widgets/ModelTable.tsx apps/headquarters/test/model-view-locale.test.ts` | exit 0, no output |

These are worktree-only results; the integrator must rerun them after committing the scoped files and record the resulting exact SHA before changing TODO status.
