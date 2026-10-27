# M19-19 — Research public projection rights audit

- **Task:** M19-19 (P0), prevent public Dock Research from exposing unreviewed or rights-unknown records until an approved D08 public projection exists.
- **Worker:** `/root/m19_19_research_rights`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `79c6c436f38d374fdb8e23da8b836d69c48c3c53`.
- **Prerequisites:** M19-08 is checked. M18-01 was specified and integrator-closed at baseline commit `79c6c43`; the report explicitly says the specification does not implement D08 publication enforcement and permits only a fail-closed mitigation for M19-19.
- **Changed paths:** `apps/dock/src/app/research/page.tsx`, `apps/dock/src/lib/states-copy.ts`, `apps/dock/src/data/queries/research.ts` (removed), `apps/dock/test/research-public-withholding.test.mjs`, and this report. No TODO status changes.
- **Result SHA/reviewer:** `118dcb576d1cc3b791f6a7a85b208b7f4a5f83cc`; reviewed by root integrator. The mitigation is integrated, while the task remains open until the accepted D08 projection exists.

## Finding and mitigation

Before this change, Dock's public Research route called `readResearchRegistry()` and passed all `research_cases`, `research_frames`, `research_witnesses`, and `research_hypotheses` rows into the browser-side `ResearchExplorer`, without a D08 release projection or public approval filter. The addon declares these models with `rest: true` and `ADMIN_WRITE`; `ADMIN_WRITE` deliberately leaves list/get unspecified, while MoonQL's REST ACL treats an unspecified operation rule as public. Therefore unauthenticated upstream list access is **public by configured ACL contract**. No live external Hub was contacted for this audit.

The route now renders only its existing heading and a localized explicit notice that the Research ledger is withheld until an approved D08 public projection is available. Its raw query module was removed because it had no other callers. No rights were inferred, no D08 service/projection was invented, and no existing rights-approved Research projection was found in this Dock path. The TODO row remains open until such a projection exists and is separately evidenced.

## Verification

- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs` — exit 0; 2 passed, 0 failed. The negative source-contract test verifies the route cannot call `readResearchRegistry`, `serverClient`, or model reads and contains no raw Research model references. The positive catalog test checks the explicit English and Indonesian D08 withholding notices, and the route source asserts that notice is rendered in an alert.
- `pnpm --filter @moonwitness/dock exec eslint src/app/research/page.tsx src/lib/states-copy.ts test/research-public-withholding.test.mjs` — exit 0.
- `pnpm --filter @moonwitness/dock typecheck` — exit 0.
- `git diff --check` — exit 0.

## Security, rollback, limits

The public page no longer requests or returns raw Research registry rows. This is a source-contract test, not a browser or live Hub penetration test. The Dock `ResearchExplorer` component remains unused by the page; the raw query module it consumed has been removed. D08 publication enforcement, license/consent evidence, and a positive approved-projection path remain unimplemented. No deployment or external access test is claimed.

Rollback can restore the former Research page/query and prior `errorResearchUnavailable` copy, and remove the focused test/report; this would restore the raw upstream request behavior and should only occur together with an approved safe projection. Root review accepts this fail-closed mitigation. **M19-19 must remain unchecked** until the approved D08 public projection exists.

**Next eligible:** D08 owner work M18-02/M18-03 (rights evidence storage and immutable release boundary), then M19-19 can add and verify an approved public projection.

## Follow-up — comparative-reader containment in the current worktree

- **Review baseline:** `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev`; `HEAD` equaled `origin/dev` at inspection. Current result SHA is pending integration.
- **Additional changed paths:** `apps/dock/src/app/reader/compare/page.tsx` and `apps/dock/test/research-public-withholding.test.mjs`. The public compare route no longer renders six inline candidate texts, calls `createPassageCitation` with a source-owned `rightsCleared` assertion, or displays a `RIGHTS CLEARED` badge. It renders the existing localized D08 withholding notice instead.
- **Verification:** `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs` → 3 passed, 0 failed. `pnpm exec eslint apps/dock/src/app/reader/compare/page.tsx apps/dock/test/research-public-withholding.test.mjs` → exit 0.
- **Typecheck limitation:** `pnpm --filter @moonwitness/dock typecheck` → exit 1 on three diagnostics in other shared working-tree paths: `src/app/reader/page.tsx` passes an unsupported `copy` prop; `src/ui/components/reader.tsx` has unresolved `EmptyState`; `src/ui/components/states.tsx` has unresolved `skeleton`. None is in the two M19-19 files changed by this follow-up; they remain integration issues and are not claimed fixed here.
- **Independent review:** read-only reviewer found the containment safe and no concrete blocker, but noted that source-pattern tests can be evaded by a different form of hardcoded text. The positive approved-publication path still cannot exist until D08 is specified and implemented.
- **Security/rights:** no passage text, licence or approval is asserted as cleared. The route fails closed. No external Hub was contacted and no production data was used.
- **Status/limitation:** this is containment only, not M19-19 completion. M34-04/D08 projection, positive released-content coverage, negative withholding coverage on the accepted projection, and exact-SHA CI remain open.

## Revalidation after shared branch advanced

- Current `HEAD`/`origin/dev`: `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`. The compare withholding code/tests remain uncommitted; no D08 projection has been approved.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts` — 15 passed, 0 failed; the source tests continue to demonstrate anonymous API exposure.
- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs` — 3 passed, 0 failed; these checks cover the localized withholding UI in this worktree, not a positive D08 projection.
- `pnpm exec eslint apps/dock/src/app/reader/compare/page.tsx apps/dock/test/research-public-withholding.test.mjs` — passed; `pnpm --filter @moonwitness/dock typecheck` — passed at current branch baseline. Earlier type errors were resolved by intervening UI commits; no changes to those paths are claimed as part of M19-19.
