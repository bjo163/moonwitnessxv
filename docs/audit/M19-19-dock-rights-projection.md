# M19-19 — Dock public research/reader rights projection audit

- **Task:** M19-19 (P0), audit the Dock public research/reader projection for unreviewed or rights-unknown information.
- **Worker:** M19-19 dock rights projection leaf.
- **Baseline:** branch `dev`, HEAD `358853a970aeaa78ef3704b14d692e39cb74149f`.
- **Observed HEAD at final verification:** `891bf5e19edbbea3d5e5ada36a7b126f35fabf94`. A concurrent session committed during this audit; the three files here remain untracked and the baseline SHA above is the recorded starting point, not that commit.
- **Prerequisites:** M18-01 (D08 gate specified, not implemented) and M19-08 (Dock locale scope) were treated as recorded in the task packet and the M18-01 audit; no prerequisite status was changed.
- **Result SHA:** pending integrator commit. This audit is uncommitted; no commit or TODO edit was made.
- **Result:** **BLOCKED-with-finding** for the wider public projection set (adjacent leak below), while the scoped Dock `/research`, `/reader` and `/reader/compare` path itself is contained.

## Scope and files

Claimed by the packet: `apps/dock/src/data/queries/research.ts` and `apps/dock/src/app/reader/compare/page.tsx`. The claimed query module **does not exist**; the real Dock data path is `apps/dock/src/data/queries/reader.ts`, which calls `/corpus/reader` and `/corpus/browse`. The server owner is `packages/moonql-corpus/src/index.ts`.

Files added by this audit (no existing file was edited):

- `docs/data/M19-19-dock-rights-projection.json` — 51-row claims ledger with verbatim file:line anchors.
- `scripts/check-m19-19-dock-rights-projection.mjs` — dependency-free validator with in-memory `--self-test`.
- `docs/audit/M19-19-dock-rights-projection.md` — this report.

`git status --short` before and after shows the same pre-existing modifications from other sessions plus these three new untracked files. Nothing was staged, reverted, committed, or written to `TODO.md`.

## Positive evidence (scoped surface)

1. **Rights status gate.** Clearance is the exact token `RIGHTS_EXACT_VERSION_CLEARED` (`packages/moonql-corpus/src/index.ts:40`); `PUBLIC_DOMAIN` is only a label because the veto compares against that token (`:101`). The reader derives `editionCleared` before serializing anything (`:380`), requires both edition and translation rows to be cleared (`:386`), emits `text: null` for a blocked translation (`:395`), emits the Arabic object only when `editionCleared && arabicText` (`:422`), and returns `state: 'rights_blocked'` otherwise (`:418`).
2. **Blocked-state path.** Blocked responses carry `BLOCKED_PLACEHOLDER` (`:41`, `:428`), not source bytes. The absent path returns `arabic: null` and `citationText: null` (`:68`, `:71`). The Dock renderer derives `withheld` from the upstream state (`apps/dock/src/ui/components/reader.tsx:146`) and guards both Arabic (`:184`) and translation (`:223`) text, with a visible alert (`:165`).
3. **Browse is metadata-only.** `/corpus/browse` is public (`packages/moonql-corpus/src/index.ts:447-448`) but the runtime test asserts its body contains neither `arabicText` nor `translationText` and no cleared bytes (`apps/arsy/test/corpus-browse.test.ts:210-212`). Its export flag is true only for an exactly cleared context edition (`:609`).
4. **Compare page emits no text.** The public page is a heading plus one alert (`apps/dock/src/app/reader/compare/page.tsx:30`); its metadata points at an approved projection (`:11`). The focused test forbids the former inline edition data, citation helper, self-asserted `RIGHTS_CLEARED` badge and text payload (`apps/dock/test/research-public-withholding.test.mjs:19-21`).
5. **Consent/clearance gate for research.** Every declared research endpoint is admin- or auth-gated; no research source declares `requires: 'public'` (validator scan), with representative anchors at `packages/moonql-research/src/index.ts:653`, `:661`, `:683`. The admin-only case projection still labels itself `ENGINEERING_ONLY` (`projection.ts:263`) with `humanReviewed: false` (`:265`), and the release verdict fixes `publicationAvailable: false` (`review.ts:171`). Dock `/research` is alert-only (`apps/dock/src/app/research/page.tsx:28`).
6. **Raw REST cannot be the side door.** `corpus_passages` and `corpus_translations` are `ADMIN_FULL` (`packages/moonql-corpus/src/index.ts:226`, `:259`); `ADMIN_FULL` gates `list` and `get` (`packages/moonql/src/model.ts:39-40`) through the REST preHandler (`packages/moonql/src/rest.ts:171`). The denial matrix asserts 401 for anonymous raw reads (`apps/arsy/test/public-projection-denial.test.ts:990`, `:925`) and for every research endpoint (`:1055`).

## Negative evidence (focused tests actually run)

- `apps/dock/test/reader-rights.test.mjs` proves a blocked result cannot render Arabic or translation text even if bytes arrive, and that the denial is stated in words.
- `apps/arsy/test/public-projection-denial.test.ts` seeds four uncleared rights statuses (`RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, `PUBLIC_DOMAIN`) and asserts `rights_blocked`, `arabic: null`, the placeholder, and no cleared bytes for five citation variants (`:232-256`).
- The same matrix creates a synthetic `RIGHTS_UNKNOWN` research case, asserts anonymous raw and endpoint reads are 401 with no claim/span bytes (`:1103-1134`), and asserts the identical address through `/corpus/reader` is still `rights_blocked` (`:1137-1138`).
- The admin-only research payload reports nothing as published/released (`:1191`).

## Finding: adjacent public projection leak (not patched)

- **Surface:** `/unilex/term` is `requires: 'public'` at `packages/moonql-unilex/src/index.ts:917`.
- **Leak line:** `packages/moonql-unilex/src/index.ts:1041` serializes `definition: term.definition,` without an `editorialStatus` or `APPROVED_FOR_CITATION`-source filter.
- **Leak class:** unreviewed editorial content and unapproved source citation emitted by a public projection. The existing denial matrix creates a `DRAFT_REVIEW` term backed only by a non-`APPROVED_FOR_CITATION` source and asserts the withheld definition/headword/citation are publicly readable (`apps/arsy/test/public-projection-denial.test.ts:505-519`). The same projection also returns admin-only identity-review and review-log rows.
- **Relation to M19-19:** this is **not** the Dock research/reader path and is outside the packet's claimed files. It was found by running the repository's own denial matrix, not by editing code.
- **Follow-up owner:** UNILEX registry owner plus D08 publication/rights gate. Candidate follow-up is the existing M34-04/UNILEX projection work and M18-02/M18-03 for the D08 gate. The test file also records `PERMISSIVE-TODAY` gaps for `/graph/relation` and `/ontology/constellation`; those were observed by test name only and were not line-audited here.

No app code was patched, per the read-only mandate. The scoped Dock research/reader projection passes; the wider "public" set does not, so the task result is BLOCKED-with-finding rather than a clean completion.

## Commands actually run and observed output

| Command | Observed |
|---|---|
| `git rev-parse HEAD` | baseline `358853a970aeaa78ef3704b14d692e39cb74149f`; final verification `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (concurrent commit) |
| `git branch --show-current` | `dev` |
| `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs test/reader-rights.test.mjs` | exit 0; `tests 8`, `pass 8`, `fail 0` |
| `pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts` | exit 0; `tests 15`, `pass 14`, `fail 0`, `skipped 1` (the skipped test is `UI-P05e NOT SATISFIED: guessing a public link must be denied for every unapproved projection`) |
| `pnpm --filter @moonwitness/arsy exec tsx --test test/corpus-browse.test.ts` | exit 0; `tests 6`, `pass 6`, `fail 0` |
| `node scripts/check-m19-19-dock-rights-projection.mjs` | exit 0; `rows=51 unique_ids=51`; tallies `total=51 EVIDENCED=48 ABSENT=2 NEEDS_SOURCE=1`; invariants `rights_status_gate=8 consent_clearance_gate=9 blocked_state_path=10 compare_page_no_text=4`; `51 quotes resolved verbatim`; checks `file_absent=1 no_match=2 files_scanned=18` |
| `node scripts/check-m19-19-dock-rights-projection.mjs --self-test` | exit 0; `SELF-TEST PASS: 7/7 fixtures behaved as expected` |
| `pnpm exec eslint scripts/check-m19-19-dock-rights-projection.mjs` | exit 0 |

`pnpm typecheck` was not run because no TypeScript was changed.

## Security, rights and privacy

No source text, verse, translation wording, witness material, secret or environment value was copied into the ledger or this report. Quotes are code identifiers, schema names, test assertions and a translator label only. The ledger records the rights statuses by name, not by content. Tests use in-memory synthetic fixtures and the public-domain seed; no external Hub, production data, network call or deployment was used.

## Limitations

- Source/static evidence plus in-process `fastify.inject()` tests; no browser, deployed Dock, live Hub, cache, proxy or search-index test.
- The D08 approved-public-projection path does not exist, so the positive approved-publication case cannot be tested. A03 in the ledger is `NEEDS_SOURCE` for that reason.
- The umbrella denial test remains skipped; no claim is made that every unapproved public link is denied.
- The adjacent UNILEX leak, and the graph/ontology gaps recorded by the denial matrix, are outside this packet and remain open.
- The M18-01 audit is a specification record, not runtime D08 enforcement.

## Rollback

Delete the three new files listed above. No existing file, database row, migration, environment value or TODO status was changed, so there is nothing else to revert. The added validator and ledger are inert unless invoked.

## Next eligible

Integrator triage of the adjacent `/unilex/term` public-projection leak (owner: UNILEX + D08), with M18-02/M18-03 as the D08 gate prerequisites. M19-19 remains open; the Dock research/reader containment is evidenced, but no approved D08 public projection exists and the wider public set is not leak-free.
