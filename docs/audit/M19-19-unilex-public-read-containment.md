# M19-19 — UNILEX public-read containment

**Status:** containment implemented; M19-19 remains open until an approved D08 public projection and positive release evidence exist.

## Run identity

- **Task:** M19-19, P0 — audit source rights/public research projection in Dock.
- **Branch:** `dev`.
- **Baseline:** `0121fa9b95d312c84b96aab9471829c7eb9ac6ef`.
- **Implementation/result SHA:** `ac3d35ddc8210c159d4d0413e484b5e1d08137d1`.
- **Reviewer:** independent read-only AI review found no remaining issue within the updated UNILEX routes/models. This is not a human privacy or rights approval.

## Change

The public `/unilex/terms` projection and raw REST reads could expose editorial drafts, reviewer context, and unapproved source data. The list route now requires the existing `admin` role. Raw reads for `unilex_sources`, `unilex_terms`, `unilex_forms`, `unilex_senses`, and `unilex_relations` now use `ADMIN_FULL`, closing anonymous list/get access while retaining the existing admin workflow. The detail route remains admin-only; the public match preview is input-only and reads no UNILEX records.

Dock maps the denied Terms request to the existing bilingual D08 withholding state. No dictionary data, private source material, consent evidence, or credentials were added. Because the route/model ACL contract is breaking, the API version and generated SDK schema history move from 3.0.0 to 4.0.0.

## Verification at the implementation SHA

Commands run from the repository root:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts test/unilex.test.ts test/unilex-pg.test.ts` | 21 passed, 0 failed, 2 skipped. Skips: the documented broader Graph/Ontology gap test and PostgreSQL coverage (no database URL configured). |
| `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-ai-unavailable.test.mjs` | 9 passed, 0 failed; includes bilingual D08 withholding copy and 401 mapping. |
| `pnpm --filter @moonwitness/arsy exec tsx --test test/env-contract.test.ts` | 9 passed, 0 failed. |
| `pnpm exec eslint packages/moonql-unilex/src/index.ts apps/arsy/src/config.ts apps/arsy/test/public-projection-denial.test.ts apps/arsy/test/unilex.test.ts apps/arsy/test/unilex-pg.test.ts apps/dock/src/app/terms/page.tsx apps/dock/src/data/queries/terms.ts apps/dock/src/lib/states-copy.ts apps/dock/test/research-ai-unavailable.test.mjs` | Passed, no diagnostics. |
| `pnpm --filter @moonwitness/arsy typecheck`, `pnpm --filter @moonwitness/moonql-unilex typecheck`, `pnpm --filter @moonwitness/moonql-client typecheck`, `pnpm --filter @moonwitness/dock typecheck` | All passed. |
| `API_VERSION=4.0.0 pnpm gen:sdk:check` | Passed; generated SDK is up to date. |
| `git diff --check` on the 13 implementation paths | Passed. |
| Pre-commit MoonUI consistency gate | Passed; 139 files scanned, 0 violations. |

The API/SDK generator accepted the combined breaking ACL change from 3.0.0 to 4.0.0; schema history has one 4.0.0 entry. Tests use synthetic records. No live PostgreSQL, browser against a live Hub, production API, deployment, or D08 release was exercised.

## Limits and rollback

This closes anonymous reads on the listed UNILEX paths but does not create or imply a D08 approval. The public Terms page remains intentionally withheld. M19-19 cannot close until an approved D08 projection exists and both approved-content positive and unapproved-content negative cases are tested against it; the separately tracked Graph/Ontology exposure findings also remain unresolved under their owning tasks.

Rollback would restore the anonymous UNILEX read paths and is unsafe unless an equivalent reviewed D08 projection or ACL protection replaces this containment.

**Next eligible:** continue the D08 owner/architecture decision and implementation path under M18-02; keep public UNILEX reads denied until that authority and projection are implemented.
