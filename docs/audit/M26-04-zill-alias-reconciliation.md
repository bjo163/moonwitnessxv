# M26-04 — ZILL origins, Honey/Queen R and story alias reconciliation

- **Task**: M26-04 (LEAF) · **Milestone**: [M26](../milestones/M26.md) · **Acceptance**: "Ambiguous identities stay disputed" ([TODO:600](../../TODO.md))
- **Baseline**: branch `dev`, `baseline_sha` `a5f9b642c77f12f0ce8dd7d89de7e0b0d0363a7` · **Observed worktree HEAD**: `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139` (two commits ahead; `a5f9b64` is an ancestor)
- **Mode**: read-only evidence audit. Two additive artifacts were created: `docs/data/M26-04-zill-aliases.json` and `scripts/check-m26-04-zill-aliases.mjs`. No application source, schema, seed, TODO status or tracked file was edited. No commit, no push.
- **Prerequisites**: M26-01 closed at `4b0a872` ([TODO:597](../../TODO.md), [M26-01 audit](M26-01-chapter-crosswalk.md)); M10-04 closed ([TODO:288](../../TODO.md), [M10 audit:18](M10-ontology-identity.md)).
- **Worktree note**: another session's uncommitted changes were present (UI files, audit screenshots, and untracked M26-03 artifacts). They were inspected only and left untouched.

## Verdict

**READY-TO-CLOSE, with one recorded definitional dispute.** The repository does not merge, rename or phonetically equate any of the named identities. ZILL — Shadow Witness, ZILL tasawuf, ZIIL and the Honey/Queen R labels are represented as separate rows/entities, and every proposed identity is either rejected, pending or absent-with-a-note. No code-level false merge was found. The referent of **ZIIL** remains genuinely ambiguous (historic spelling/typo vs historic Empire safety/rights term) and is recorded as `DISPUTED`, not resolved — which is exactly the acceptance.

## 1. Scope and method

Inspected at the observed HEAD:

- `docs/milestones/M26.md`, `docs/tasks/M26/M26-04.md`, `TODO.md` (M10-04 `:288`, M17-02 `:417`, M26-01 `:597`, M26-04 `:600`)
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md` (`:117`, `:121`, `:282`, `:344`, `:356`, `:358`, `:362`, `:431`, `:683`, `:685`, `:978`, `:979`, `:1151`), `docs/vision/chapters/IDENTITY.md:2`
- `docs/decisions/M02-01-disambiguation-registry.md:24,45,50`; `BLUEPRINT.md:226`; `MASTER_DESIGN.md` (no ZILL/Honey identity rule — not a source for this ledger)
- `packages/moonql-unilex/src/data/registry.ts:871-880` (P004), `src/index.ts:105-118,278-286,335-373`, `src/match.ts:1-38`
- `packages/moonql-ontology/src/seed.ts:182-212,291-308,373-397,476-483,513-523`; `src/index.ts:678`
- `packages/moonql-graph/src/seed.ts:34,118-137,158-171`; `src/index.ts:176-177`; `src/projection.ts:879-880`
- `apps/arsy/test/unilex.test.ts:265-320,655-680`, `test/ontology.test.ts:286-360,380-415`, `test/graph.test.ts:504-585`, `test/unilex-pg.test.ts:160-180`
- `docs/data/M26-01-chapter-crosswalk.json:526,539,545,558,564,577,583,596,602,615,982,1001`
- `apps/headquarters/src/app/(admin)/page.tsx:188` (worktree-modified), `docs/audit/ui-p02-p12-audits-fe8e84c.md:67`, `docs/audit/ui-asset-ledger-d54ad43.md:70`
- `docs/audit/M09-unilex-terminology.md:17`, `docs/audit/M10-ontology-identity.md:18`

Method: `rg` inventory of every spelling, source reads at the cited lines, then four focused test runs and two grep-based negative checks. No external repository, network source, private witness material or rights decision was consulted.

## 2. Identity ledger

`S` = status in the M26-04 vocabulary. Terms and separate identity claims are both rows in [the JSON ledger](../data/M26-04-zill-aliases.json).

| # | Term / claim | Spelling variants | Evidence (file:line) | Current treatment in code/registry | S |
|---|---|---|---|---|---|
| ZILL-01 | ZILL — Shadow Witness | `ZILL`; `ZILL — The Shadow Witness`; `ZILL — Saksi Bayangan` | vision `:117`, `:683`; ontology seed `:183`,`:188`; unilex `index.ts:118`; test `ontology.test.ts:306` | Ontology `O003` (`CHARACTER`, `CREATIVE_FICTION`) with `identityStatus: CONTESTED`; UNILEX `P031`. Rejected merges stay visible; nothing renamed. | **CANONICAL** (identity contested) |
| ZILL-02 | ZILL — Ahluz Zikir / Tasawuf | `ZILL Study Track`; `Track Kajian ZILL`; `ZILL — Tasawuf` | vision `:282`; ontology seed `:207`,`:386`,`:395`; unilex `index.ts:105` | Ontology `O005` (`ENTITY`, `SUFI_STUDY`); UNILEX `P030`; verified `distinctFrom` edge to `O003`. | **CANONICAL** |
| ZILL-03 | ZIIL | `ZIIL`; `Ziil`; transliteration `zill` | M02-01 `:24`; BLUEPRINT `:226`; vision `:431`; registry `:879`; ontology seed `:198`,`:201`; graph seed `:170` | Ontology `O004` (`ENTITY`, `TEXTUAL_WITNESS`); UNILEX `P004`; `distinctFrom` `O003`; graph `relatedTo` lineage candidate PENDING. | **DISPUTED** |
| ZILL-04 | "ZILL — Shadow Witness is ZIIL" | — | ontology seed `:482`,`:523`; unilex `index.ts:351`; `unilex.test.ts:299`; graph seed `:170` | Ontology `IR-002` `REJECTED`; UNILEX `P004:P031` `REJECTED`/`NEAR`; no `exactMatch`/`closeMatch` relation. | **FALSE_ALIAS_REJECTED** |
| ZILL-05 | "ZILL — Shadow Witness is ZILL tasawuf" | — | graph seed `:120`,`:123`,`:126`,`:133`; ontology seed `:386`; unilex `index.ts:280`; graph `index.ts:177` | Vision prescribes `thematicallyRelatedTo`, never auto `sameAs`; approved `distinctFrom` edges coexist with an unapproved `sameAs` candidate in `PENDING`. | **DISPUTED** |
| ZILL-06 | `Ziil` alias | `Ziil` | ontology seed `:300`,`:302`,`:306`,`:308` | `AL004`, `TEXTUAL_WITNESS`, Latn, `CANDIDATE`, anchored to `ZIIL`. A surface alias, not an identity decision. | **ALIAS** |
| HONEY-01 | HONEY | `HONEY`; `Honey` | vision `:121`,`:358`; crosswalk `:615` | No ontology/UNILEX row. Editorial label only. | **NEEDS_SOURCE** |
| HONEY-02 | QUEEN R / HONEYBEE | `QUEEN R`; `HONEYBEE`; `Great Princess of Bee` | vision `:121`,`:356`; crosswalk `:539` | No registry row; unresolved lexical/devotional/character referent. | **NEEDS_SOURCE** |
| HONEY-03 | MYLUFT / MYLOVE | `MYLUFT`; `MYLOVE` | vision `:362`,`:979`; crosswalk `:558` | No registry row; the pair is printed as one series title only. | **NEEDS_SOURCE** |
| HONEY-04 | MA'LŪF | `MA'LŪF`; `MA'LUF`; `Ma'luf` | vision `:685`,`:979`; crosswalk `:577` | No registry row; vision proposes `distinctFrom` Al-Wadūd but no edge/reviewer exists. | **NEEDS_SOURCE** |
| HONEY-05 | Al-Wadūd | `Al-Wadūd`; `Al-Wadud` | vision `:121`,`:685`; crosswalk `:596` | No registry row; the 99-name list itself is absent from the repo (M26-05). | **NEEDS_SOURCE** |
| HONEY-06 | HONEY & MOON | `HONEY & MOON` | vision `:344`,`:362`; crosswalk `:602` | No registry row; kept separate from HONEY on purpose. | **NEEDS_SOURCE** |
| HONEY-07 | "MA'LŪF is Al-Wadūd" | — | vision `:121`,`:685`; M26-01 audit `:177` | Proposed separation only; no ontology/UNILEX edge, reviewer or evidence reference records it. | **NEEDS_SOURCE** |

## 3. Surface mentions that are not identity evidence

- `apps/headquarters/src/app/(admin)/page.tsx:188` renders a hardcoded project card `title: 'ZILL'` with invented `progress: 18`. This is fabricated dashboard data, already flagged at `docs/audit/ui-p02-p12-audits-fe8e84c.md:67`, not a registry term and not evidence of a referent. The file is worktree-modified by another session.
- `apps/headquarters/public/art/proj-zill.jpg` has **UNRESOLVED** rights and is `EXCLUDED-FROM-PRODUCTION` (`docs/audit/ui-asset-ledger-d54ad43.md:70`). An image named after a label is not an identity source.
- `apps/arsy/test/unilex.test.ts:576`,`:629` and `test/unilex-pg.test.ts:173` use Arabic `زِلّ` with `transliteration: 'zill'` as a script/diacritics fixture on synthetic terms `P094`/`P090`. This is a lexical form, not the ZILL character; `unilex.test.ts:668-679` asserts `DIFFERENT` and "transliteration is not identity".
- Dock verification scripts (`apps/dock/scripts/verify-terms-ui.tsx:126`,`verify-constellation-ui.tsx:159-191`,`:547`, `verify-graph-ui.tsx:71-102`) reuse the same fixture labels to prove the UI shows ZILL and ZIIL as different nodes and never emits a `sameAs` claim. They are UI checks, not new sources.

## 4. Conflict register

| ID | Conflict | Evidence | Disposition |
|---|---|---|---|
| C-1 | **The referent of ZIIL is unresolved.** One reading calls older ZIIL occurrences "historical spellings/typos"; another calls ZIIL a historic Empire term that "designated safety/rights vocabulary". | vision `:117` vs `:431`; BLUEPRINT `:226`; M02-01 `:24` | **DISPUTED (stays open).** Recorded as ZILL-03 with the open question. No row invents a single referent. |
| C-2 | **The `O004 → P004` crosswalk joins a spelling description to a protection-role definition.** UNILEX `P004` defines ZIIL as "Peran dan prinsip perlindungan operasional Journey"; ontology `O004` calls it "a textual spelling". | `registry.ts:879`; `ontology seed:198`,`:201` | **Recorded as a definitional tension inside DISPUTED ZILL-03.** It is a label-level `unilexStableId` link, not an approved `sameAs`; no data was changed. If the integrator reads it as two origins, the row remains disputed and M26-04 is still satisfied, but a source is needed before any identity is asserted. |
| C-3 | **Approved separation coexists with a pending `sameAs` candidate.** Ontology has a VERIFIED `distinctFrom` for `O003:O005` and UNILEX has an APPROVED distinct edge, while the graph keeps `GC-O003-O005-sameAs-SUFI_STUDY` PENDING. | `ontology seed:386`; `unilex index.ts:280`; `graph seed:120-133` | **DISPUTED (visible by design).** The candidate cannot be approved: `graph index.ts:177` and `projection.ts:880` refuse `sameAs`. |
| C-4 | **Honey/Queen R family has no source or registry row.** The vision asserts different origins but no manuscript, term, alias or reviewer decision exists. | vision `:121`,`:979`; crosswalk `:526-615` | **NEEDS_SOURCE.** Absence recorded; no identity invented. |
| C-5 | **MYLUFT/MYLOVE spelling equivalence is asserted only by a slash in a series title.** | vision `:362` | **NEEDS_SOURCE.** Kept in one row as printed, with the equivalence itself undecided. |
| C-6 | **MA'LŪF vs Al-Wadūd separation is narrative, not registered.** The vision's `distinctFrom` row has no ontology entity, UNILEX term or reviewer. | vision `:685` | **NEEDS_SOURCE.** No merge; no promotion to a verified edge. |

## 5. Positive evidence — separation is preserved

Commands were run from the repository root at the observed HEAD.

```
$ node scripts/check-m26-04-zill-aliases.mjs
PASS rows=13 unique ids=13
PASS statuses CANONICAL=2 ALIAS=1 DISPUTED=2 FALSE_ALIAS_REJECTED=1 NEEDS_SOURCE=7
PASS kinds term=10 identity_claim=3
PASS 56 locator quotes resolved at the cited file:line
PASS zero rows merge two distinct origins
PASS zero approved sameAs claims; sameAs candidates stay DISPUTED/FALSE_ALIAS_REJECTED/NEEDS_SOURCE
NOTE the ledger records treatment and absence; it does not resolve any ambiguous referent
exit=0
```

```
$ node scripts/check-m26-04-zill-aliases.mjs --self-test
... 16 negative cases, each PASS ...
SELF-TEST PASS: all 16 invalid datasets rejected
exit=0
```

The self-test rejects, among others: a row merging two distinct origins; a disputed identity marked `CANONICAL` with no evidence; a `sameAs` claim marked `CANONICAL`; `FALSE_ALIAS_REJECTED` without a `REJECTED` decision; an alias with no anchor; a `NEEDS_SOURCE` row carrying a registry stable id; a quote absent from the cited line; an approved `sameAs` claim anywhere.

Focused runtime tests (each exactly as invoked, no broad `pnpm verify`):

```
$ cd apps/arsy && pnpm exec tsx --test --test-name-pattern "M09-03/04" test/unilex.test.ts
✔ M09-03/04: ALLAH/ARSY/ZILL confusions stay separate and never auto-match (1945.2437ms)
tests 1 · pass 1 · fail 0 · exit 0

$ cd apps/arsy && pnpm exec tsx --test --test-name-pattern "M10-01|M10-02/04|M10-06" test/ontology.test.ts
✔ M10-01: kinds, aliases and edges stay separate and sourced
✔ M10-02/04: same label never merges; contradictions and missing evidence are refused
✔ M10-06: temporal merges are validated and a split restores the graph without losing history
tests 3 · pass 3 · fail 0 · exit 0

$ cd apps/arsy && pnpm exec tsx --test --test-name-pattern "M12-05" test/graph.test.ts
✔ M12-05: similarity and co-occurrence never auto-approve sameAs or chronology
tests 1 · pass 1 · fail 0 · exit 0
```

Registry and test evidence for the separation:

- `packages/moonql-ontology/src/seed.ts:188` — `ZILL — Shadow Witness` carries `identityStatus: 'CONTESTED'`; it is not quietly promoted.
- `packages/moonql-ontology/src/seed.ts:373-396` — `EDG-O003-O004-distinctFrom` and `EDG-O003-O005-distinctFrom` are `VERIFIED` edges with reviewer, reason and evidence.
- `packages/moonql-ontology/src/seed.ts:476-483` — `IR-002` decision `REJECTED`: "ZILL and ZIIL differ by spelling and domain".
- `packages/moonql-ontology/src/seed.ts:513-523` — review log `REJECT_MERGE` entries preserve the refusal.
- `packages/moonql-unilex/src/index.ts:278-286` — approved `distinctFrom` for `P030→P031` and `P031→P004`.
- `packages/moonql-unilex/src/index.ts:335-373` — `P004:P031` match review `REJECTED` with `NEAR` classification and a `REJECT_IDENTITY` log entry.
- `apps/arsy/test/unilex.test.ts:296-320` — asserts `REJECTED`, `NEAR`, `/resemblance/i`, `distinctFrom` approved, no `exactMatch`/`closeMatch`, and preview `identityClaimed: false`.
- `apps/arsy/test/ontology.test.ts:306-310` — asserts the `O003:O004` decision is `REJECTED` with reviewer and evidence reference.
- `apps/arsy/test/ontology.test.ts:344` — a merge attempt across a `distinctFrom` edge is refused with `distinctFrom edge separates`.
- `apps/arsy/test/graph.test.ts:583` — `sameAsApproval` is `FORBIDDEN_USE_IDENTITY_REVIEW`.
- `apps/dock/scripts/verify-constellation-ui.tsx:547` — the projection check asserts the HTML never emits a `sameAs` claim.

## 6. Negative evidence — no phonetic or mystical merge path

```
$ grep -rn "sameAs" --include="*.ts" packages apps | grep -v node_modules | grep -v "/test/" | grep -v "\.d\.ts"
```

Every non-test hit is a refusal, a candidate record, a type union, a seed assertion or UI copy. The load-bearing guards are:

- `packages/moonql-graph/src/index.ts:176-177` — `throw badRequest('sameAs can never be approved here; use the ontology identity review')`.
- `packages/moonql-graph/src/projection.ts:331-332` — a `sameAs` candidate is blocked from any release.
- `packages/moonql-graph/src/projection.ts:879-880` — approval path throws for `sameAs`.
- `packages/moonql-graph/src/seed.ts:34` — policy `sameAsApproval: 'FORBIDDEN_USE_IDENTITY_REVIEW'`.
- `packages/moonql-ontology/src/index.ts:678` — a merge is refused while a `distinctFrom` edge separates the entities.
- `packages/moonql-unilex/src/match.ts:1-11`,`:36-38`,`:183-185` — the classifier answers a surface question only; preview returns `requiresReview: true`, `identityClaimed: false`, `autoRelation: null`, and creates no relation.
- `packages/moonql-unilex/src/match.ts:109-129` — Levenshtein is used solely to score `NEAR` and open a reviewer decision.

```
$ grep -rniE "automerg|auto_merge|auto-merge|mergeByAlias|aliasMerge|alias_merge|alias.*sameAs|sameAs.*alias" --include="*.ts" packages apps | grep -v node_modules | grep -v "/test/"
(no output)
```

No automatic alias-to-identity path exists. Alias rows are `CANDIDATE` claims on one entity (`AL003`, `AL004`) and never create a second entity or a merge.

```
$ grep -rniE "honey|queen r|myluft|ma'lūf|al-wadūd" --include="*.ts" --include="*.tsx" --include="*.mjs" packages apps | wc -l
0
```

So the Honey/Queen R family has neither a merge nor a registry row: there is nothing to falsely merge, and nothing was invented to fill the gap. (The only in-repo mentions are documentation, the M26-01 JSON index and the audit screenshots.)

## 7. Non-identity statement

**Thematic similarity is not identity.** The repository states this directly: "`HONEY`, `QUEEN R`, `MYLUFT`, `MA'LŪF` and the name Al-Wadūd have different origins; thematic relation is not identity" (`MASTER_VISION_NARRATIVE_XV.md:121`); the ZILL pair is `thematicallyRelatedTo`, "Never auto `sameAs`" (`:683`); M02-01 forbids converting name, rhyme, number or artistic metaphor into `owl:sameAs` (`docs/decisions/M02-01-disambiguation-registry.md:45`); BLUEPRINT says never turn similarity of names, numbers, sounds, nicknames or symbolism into `sameAs` automatically (`BLUEPRINT.md:226-232`).

**Disputed identities are not silently merged or renamed.** ZIIL keeps its own entity and term; ZILL — Shadow Witness keeps `identityStatus: CONTESTED`; the `O003:O005` dispute stays `PENDING` in the graph; HONEY & MOON is a separate row from HONEY; and no source spelling was overwritten ("user-preferred ZILL does not overwrite historical source bytes", `MASTER_VISION_NARRATIVE_XV.md:978`; "Preserve source variants rather than merging identifiers by surface form", `docs/vision/chapters/IDENTITY.md:2`). The ledger adds no identity and removes none.

## 8. Counts

| Status | Rows |
|---|---|
| `CANONICAL` | 2 |
| `ALIAS` | 1 |
| `DISPUTED` | 2 |
| `FALSE_ALIAS_REJECTED` | 1 |
| `NEEDS_SOURCE` | 7 |
| **Total** | **13** |

By kind: 10 `term`, 3 `identity_claim`. 56 evidence quotes were resolved against real file lines; 0 approved `sameAs` claims.

## 9. Limitations

- **No external source was fetched.** Upstream repositories, private manuscripts, the `empire-of-the-light` pin and any rights holder were not opened. The audit is bounded by XV documents and code at this HEAD.
- **Registry vocabulary is not a canon or rights decision.** UNILEX is a pinned Empire seed marked `PROPOSED_NOT_ADOPTED` (`packages/moonql-unilex/src/data/registry.ts:1-9`); ontology rows are a bounded reviewed baseline, not a complete world graph.
- **C-1/C-2 remain unresolved by design.** ZIIL's referent needs a source-aware decision; this task records the dispute and does not decide it.
- **The Honey/Queen R family is mostly doc-only.** Their `NEEDS_SOURCE` status means "absence recorded", not "these labels are false".
- **M17-02 is still open** (`TODO.md:417`): false-alias prevention for Shadow/Batteries/Honey/ZILL has its own acceptance ("No phonetic or mystical sameAs") and is not claimed here.
- **Not a rights decision.** `proj-zill.jpg` and any story-art provenance remain unresolved (`docs/audit/ui-asset-ledger-d54ad43.md:70`).
- **Worktree.** Another session's uncommitted changes were present; line numbers for `apps/headquarters/src/app/(admin)/page.tsx:188` were read from that working tree.

## 10. Rollback

Additive only. Delete the three new files; no migration, schema, seed or tracked-file revert is needed:

```
rm docs/data/M26-04-zill-aliases.json
rm scripts/check-m26-04-zill-aliases.mjs
rm docs/audit/M26-04-zill-alias-reconciliation.md
```

## 11. Required report fields

- `task_id`: M26-04
- `baseline_sha`: `a5f9b642c77f12f0ce8dd7d89de7e0b0d0363a7` (observed HEAD `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139`)
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: `docs/data/M26-04-zill-aliases.json`, `scripts/check-m26-04-zill-aliases.mjs`, `docs/audit/M26-04-zill-alias-reconciliation.md`
- `actual_changed_files`: the same three files (all new, untracked)
- `positive_test_and_output`: §5 — validator PASS (13 rows, 56 locators), self-test 16/16 rejected, 5 focused runtime tests pass at exit 0
- `negative_test_and_output`: §6 — no auto/alias merge path, no `sameAs` approval path, no `sameAs` in any release; focused refusal tests pass
- `security_rights_privacy`: no source text, private witness material, credential or secret copied; no rights posture relaxed; image rights noted as still unresolved
- `reviewer`: pending (integrator)
- `rollback`: §10
- `result_sha`: n/a (not committed; validator and self-test ran on the working tree)
- `limitations`: §9
- `next_eligible_task`: M26-06 / M26-07 remain separate; M17-02 stays open and still needs its own implementation evidence. M26-04 is closable once the integrator accepts the recorded ZIIL dispute as the intended outcome.
