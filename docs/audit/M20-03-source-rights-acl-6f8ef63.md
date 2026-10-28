# M20-03 — Source inventory ACL behavior

**Implementation source SHA:** `6f8ef63b9ee4adb6e79800a144d469f9342010d1` on `dev`.

## Scope

The Headquarters D01 edition inventory now routes list access through `loadSourceRightsInventory`. The helper checks the published `corpus_editions` list ACL before invoking the row loader. A denied role receives no rows and does not trigger a data request; an allowed role loads the inventory once. Query failures continue to return no rows, and the existing authorization guard still owns redirect, denial, and Hub outage behavior.

This is an authorization-evidence improvement only. It does not add or infer D08 review/publication authority, and M20-03 remains open until editors can distinguish an actually released edition from an approved-but-unpublished edition using an authoritative D08 projection.

## Exact-source evidence

- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/hq-authz-guard.test.ts` — **24 passed, 0 failed**; includes synthetic viewer denial with zero edition-row calls and admin allow with exactly one call.
- `node --test apps/headquarters/test/m20-03-source-rights-status.test.mjs` — **3 passed, 0 failed**.
- `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- `pnpm exec eslint "apps/headquarters/src/app/(admin)/page.tsx" apps/headquarters/src/lib/source-rights-inventory.ts apps/headquarters/test/hq-authz-guard.test.ts` — passed.
- `git diff --cached --check` — passed before the implementation commit.
- Commit pre-hook MoonUI consistency gate — **139 files scanned, 0 violations**.
- Independent read-only review of the four-file diff — no blockers; confirmed no D08 release claim.

## Changed files

- `apps/headquarters/src/app/(admin)/page.tsx`
- `apps/headquarters/src/lib/source-rights-inventory.ts`
- `apps/headquarters/test/hq-authz-guard.test.ts`
- `apps/headquarters/test/m20-03-source-rights-status.test.mjs`

## Security and limitations

Tests use synthetic identities and edition rows; no real source or private witness material was accessed. No live Hub, database, deployment, or D08 release record was exercised. Rollback is a revert of the implementation commit; the earlier inlined ACL check had the same deny-before-fetch behavior but lacked behavioral integration evidence.

The exact-source CI run and `dev` promotion remain pending.
