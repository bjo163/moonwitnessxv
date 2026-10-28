# M17-02 — Implement false-alias prevention for Shadow/Batteries/Honey/ZILL

- **Task**: M17-02 (LEAF) · **Milestone**: [M17](../../docs/milestones/M17.md) · **Prerequisites**: M17-01 (closed at `89cfd7c`), M10-04 (closed)
- **Declared baseline SHA**: `ee608f7` (`dev`) — "docs(todo): record the external blockers on M32-01, M35-01 and M36-01"
- **Observed worktree HEAD at final verification**: `4a9cb46f760f8d6595c0677c309c21d779d44f72` (`dev`)
- **Baseline drift note**: the session first observed HEAD `91a5ff7f2d9f94fa764115e4c875b6fb443bc453`; the ledger and validator were written when HEAD was `ee608f7a12448a497d3295bf1649616693ffc5be`; final verification observed `4a9cb46f760f8d6595c0677c309c21d779d44f72` after other sessions committed. `git diff --stat 91a5ff7 4a9cb46` shows changes only in `TODO.md`, one new Dock test and five unrelated audit/data files. Every file cited by this ledger is identical at all three SHAs.
- **Worker**: repository-evidence leaf (AI agent), read-only outside the claimed files
- **Claimed files**: `docs/data/M17-02-false-alias-decisions.json` (new), `scripts/check-m17-02-false-aliases.mjs` (new), this audit (new)
- **Acceptance tested**: "No phonetic or mystical sameAs"

## 1. Result

**READY FOR INTEGRATOR REVIEW against the recorded acceptance.** The ledger records 20 concrete alias/near-alias pairs drawn only from labels and decisions already present in this repository. Every row resolves at least one exact `file:line` quote (49 locator quotes in total), names the rule an automatic merger would violate, and carries no approved `sameAs`. `same_as_claims` and `alias_approvals` are explicitly empty; 13 pairs are `REJECTED`, 2 remain `DISPUTED`, 5 remain `NEEDS_SOURCE`, and 0 are `ALIAS_APPROVED`.

The two `DISPUTED` rows are the important negative finding:

- `SHADOW` character (`O007`) vs `SHADOW` workspace (`O006`) is **not** recorded as finally rejected, because ontology identity review `IR-003` is still `PENDING` even though the vision and graph approve a `distinctFrom` edge.
- `ZILL — Shadow Witness` vs `ZILL — Tasawuf` carries a verified `distinctFrom` edge **and** an unapproved graph `sameAs` candidate in `PENDING`.

Neither state is converted into an approval or a resolution.

**Nothing is recovered, renamed or invented.** No `NEEDS_SOURCE` row is guessed into an alias; no HONEY/QUEEN R referent is typed; no ZIIL referent is chosen; no performer or real person is identified. Policy-only rows are explicit non-identity statements, not typed pair decisions, and the ledger says so.

| Decision | Rows | Meaning applied |
|---|---:|---|
| `REJECTED` | **13** | a registry decision, ratified policy or explicit document states the referents are not one identity |
| `ALIAS_APPROVED` | **0** | no repository record approves a phonetic or mystical alias for these pairs |
| `DISPUTED` | **2** | an open `sameAs` candidate coexists with a separation decision; nothing is merged |
| `NEEDS_SOURCE` | **5** | both labels exist, but no record decides the referent; absence is recorded |
| **Total** | **20** | 24 referents, 49 evidence items |

Other declared tallies, all validator-checked: by basis `REGISTRY_DECISION` 5 / `RATIFIED_POLICY` 10 / `MISSING_SOURCE` 5; 20 rule codes all `forbids_same_as: true`; 4 rows carry a PHONETIC rule, 4 carry a MYSTICAL rule, 3 carry a NUMERICAL rule; rejected pairs 13; evidence items 49.

## 2. Findings table

Rules are the ledger's rule codes. Every row's rationale and exact quotes are in `docs/data/M17-02-false-alias-decisions.json`.

| # | Pair | Decision | Rules | Record / basis |
|---:|---|---|---|---|
| 1 | SHADOW Character (`O007`) vs SHADOW Workspace (`O006`) | `DISPUTED` | shared surface label; type/domain boundary | `IR-003` PENDING + graph `GC-O006-O007-distinctFrom-GENERAL` APPROVED |
| 2 | legacy SHADOW taxonomy root vs SHADOW Character | `REJECTED` | shared surface label; mystical hierarchy | vision `:113` separate identities |
| 3 | legacy SHADOW root vs ALLAH | `REJECTED` | shared surface label; mystical hierarchy | vision `:113` no theological hierarchy |
| 4 | THE BATTERIES (`O008`) vs ALLAH (`O001`) | `REJECTED` | name-sound resemblance; theological domain | `IR-004` REJECTED |
| 5 | A-L4H THE BATTERY vs ALLAH | `REJECTED` | leetspeak sound; theological domain | vision `:119`, `:101` |
| 6 | THE BATTERIES vs A-L4H THE BATTERY | `NEEDS_SOURCE` | whole/part membership; version scope | vision `:368` "in particular versions" |
| 7 | HONEY vs QUEEN R | `REJECTED` | thematic metaphor | vision `:121`, `:358` |
| 8 | HONEY vs HONEYBEE | `NEEDS_SOURCE` | shared substring | vision `:356`, `:718` |
| 9 | HONEY vs HONEY & MOON | `NEEDS_SOURCE` | shared substring | vision `:362`; M26-04 `:458` |
| 10 | QUEEN R vs HONEYBEE | `NEEDS_SOURCE` | co-listed archive label | vision `:718`, `:356` |
| 11 | HONEY vs Al-Wadūd | `REJECTED` | thematic metaphor; nickname/devotional resonance | vision `:121`, `:979` |
| 12 | ZILL — Shadow Witness (`O003`) vs ZIIL (`O004`) | `REJECTED` | phonetic resemblance | `IR-002` REJECTED + UNILEX `P004:P031` REJECTED |
| 13 | ZILL — Shadow Witness vs ZILL — Tasawuf (`O005`) | `DISPUTED` | shared surface label; type/domain boundary | graph `sameAs` PENDING + `distinctFrom` VERIFIED |
| 14 | ZILL — Shadow Witness vs THE SHADOW crew character | `NEEDS_SOURCE` | shared token "shadow" | vision `:730`, `:712`, `:977` |
| 15 | WINGS 10 vs AETHERION 10 realms | `REJECTED` | numerological ten; type/domain boundary | vision `:687`, `:123`, `:472` |
| 16 | WINGS 10 vs real angels | `REJECTED` | mystical resonance | vision `:471` |
| 17 | AETHERION 100 levels vs AGE CODE `100+` | `REJECTED` | numerological hundred | vision `:480`, `:485` |
| 18 | G.O.D. 99 vs Asmaul Husna 99 | `REJECTED` | numerological 99; theological domain | vision `:476`, `:122`; M02-01 `:36` |
| 19 | 1·6·3 Framework vs hidden esoteric scripture cipher | `REJECTED` | numerological mysticism | M02-01 `:26`, `:45` |
| 20 | ALLAH vs A-L-L-A-H acronym | `REJECTED` | letter-sound acronym; theological domain | `IR-001` REJECTED |

## 3. Method and what the repository actually evidences

**Method.** Start from pairs the repository itself names (M10-04's ZILL/ZIIL, THE BATTERY/ALLAH, SHADOW variants; M26-04's Honey/Queen R; M17-01's crew and ensemble rows; the vision and Blueprint numeric boundaries). For each pair, record the two referents, the strongest in-repository decision, the rule that would be violated by an automatic merger, and exact locators. If no decision exists, record `NEEDS_SOURCE` and state what is missing. Never read a `PENDING` candidate as an approval; never read a policy sentence as a typed pair record.

Key evidence lines, all re-checked by the validator:

- `docs/decisions/M02-01-disambiguation-registry.md:22` — "DILARANG menggunakan relasi `sameAs`." for ALLAH vs A-L-L-A-H.
- `docs/decisions/M02-01-disambiguation-registry.md:24` — historical `ZIIL` retained as an archaic text variant.
- `docs/decisions/M02-01-disambiguation-registry.md:25` — SHADOW (Workspace) vs SHADOW (Character) "Dibedakan secara tipe".
- `docs/decisions/M02-01-disambiguation-registry.md:26` — 1·6·3 is "BUKAN kode numerik rahasia kitab suci".
- `docs/decisions/M02-01-disambiguation-registry.md:36` — G.O.D.99 is separate from 99 editorial chapters and Asmaul Husna.
- `docs/decisions/M02-01-disambiguation-registry.md:45` — no automatic conversion of name, rhyme, number or artistic metaphor into `owl:sameAs`.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:113` — the legacy SHADOW/`0 ALLAH` taxonomy is historical fiction, not a theological hierarchy; `story:shadow`, `workspace:shadow` and `legacy-taxonomy:shadow-root` are separate identities.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:119` — "`THE BATTERIES / A-L4H THE BATTERY` is a **fictional character/alias**, not ALLAH."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:121` — HONEY, QUEEN R, MYLUFT, MA'LŪF and Al-Wadūd "have different origins; thematic relation is not identity."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:358` — honey metaphors are literary, "not ... automatic romantic identity matches".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:368` — THE BATTERIES includes A-L4H THE BATTERY "in particular versions".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:471-472` — 10 WINGS is fictional org departments against "Real angels"; 10 AETHERION realms is game progression against WINGS.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:480`, `:485` — 100 AETHERION levels are RPG progression; age and level numbers are not interchangeable.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:687` — the relation table records `WINGS10 distinctFrom AETHERION 10 realms`.
- `packages/moonql-ontology/src/seed.ts:465-506` — `IR-001` REJECTED, `IR-002` REJECTED, `IR-003` PENDING, `IR-004` REJECTED.
- `packages/moonql-ontology/src/seed.ts:523` — "Phonetic resemblance only; ZILL and ZIIL remain separate."
- `packages/moonql-unilex/src/index.ts:351` — UNILEX rejects `P004:P031` as phonetic resemblance.
- `packages/moonql-graph/src/seed.ts:102-118` — approved `distinctFrom` edge for O006:O007.
- `packages/moonql-graph/src/seed.ts:119-136` — `GC-O003-O005-sameAs-SUFI_STUDY` still `PENDING`, with the reason "the source explicitly refuses an automatic sameAs".
- `BLUEPRINT.md:220` — "`THE BATTERIES ≠ ALLAH`. `SHADOW(character) ≠ SHADOW(workspace)`."
- `BLUEPRINT.md:232` — never turn similarity of names, numbers, sounds, nicknames or rhetorical symbolism into `sameAs` automatically.

The `SHADOW` character/workspace row is deliberately `DISPUTED`, not `REJECTED`: `IR-003` is `PENDING` in the ontology seed while the graph candidate is `APPROVED` `distinctFrom`. Calling it rejected would overstate the registry state; calling it approved would violate the acceptance.

## 4. Guards encoded in the ledger and validator

All twelve top-level guards are literal `true` and enforced: `no_same_as_claims`, `no_alias_approvals`, `no_phonetic_alias_approved`, `no_mystical_alias_approved`, `every_rule_forbids_same_as`, `rejected_pairs_not_equivalent`, `every_row_has_resolving_locator`, `every_referent_is_used`, `no_invented_referents`, `no_real_person_identified`, `source_variants_preserved`, `no_external_fetch`.

Concrete constraints the validator applies:

- every row id starts `fa_` and is unique; every referent id starts `ref_` and is unique.
- a row may not pair a referent with itself; no unordered pair may appear twice.
- every row cites two existing referents; an unknown referent is an invented pair.
- every evidence locator must exist, be inside the file, and contain the quote verbatim; no row may have zero evidence.
- every rule must set `forbids_same_as: true`; disabling any rule fails, and the vocabulary must retain at least one PHONETIC and one MYSTICAL rule.
- `ALIAS_APPROVED` requires an approved `alias` decision record and is refused when the row's rules include a PHONETIC or MYSTICAL category.
- `DISPUTED` requires a `PENDING` `sameAs` record; `NEEDS_SOURCE` requires a missing statement and may not carry any `APPROVED` record; `REJECTED` may not carry an approved `sameAs`.
- every row must set `approved_same_as: false`.
- `same_as_claims` and `alias_approvals` must both be empty; a claim naming a rejected or disputed pair gets a specific error.
- no referent may be classified as a real person; every referent must be used.
- declared totals for rows, referents, decision, basis, rule, rejected pairs and evidence items must equal the actual counts.

## 5. Tests and observed output

All commands were run from the repository root `Z:\project\moonradio`.

### Positive test

```
$ node scripts/check-m17-02-false-aliases.mjs
PASS rows=20 unique ids=20 referents=24
PASS decisions REJECTED=13 ALIAS_APPROVED=0 DISPUTED=2 NEEDS_SOURCE=5
PASS basis REGISTRY_DECISION=5 RATIFIED_POLICY=10 MISSING_SOURCE=5
PASS rule categories phonetic_rows=4 mystical_rows=4 numerical_rows=3 all_forbid_same_as=true
PASS 49 locator quotes resolved at the cited file:line
PASS same_as_claims=0 alias_approvals=0 rejected_pairs=13 evidence_items=49
PASS declared counts match rows; every referent is used; no invented, self-linked or duplicate pair
PASS no PHONETIC or MYSTICAL rule approves an alias; rejected pairs carry no approved equivalence
NOTE NEEDS_SOURCE rows record repository silence, not proof of distinctness; SHADOW character/workspace stays DISPUTED
exit=0
```

The positive run proves the acceptance mechanically: zero `sameAs` claims, zero alias approvals, all 20 rules forbid `sameAs`, and every PHONETIC/MYSTICAL row is either rejected, disputed or missing a source. It also proves that no rejected pair can be approved retroactively.

### Negative test / self-test

```
$ node scripts/check-m17-02-false-aliases.mjs --self-test
PASS  negative: duplicate row id is rejected
      first error: duplicate row id fa_shadow_character_workspace
PASS  negative: invented left referent is rejected
      first error: row fa_batteries_allah left_ref "ref_invented_batteries" does not exist
PASS  negative: invented right referent is rejected
      first error: row fa_batteries_allah right_ref "ref_invented_allah" does not exist
PASS  negative: row pairing a referent with itself is rejected
      first error: row fa_batteries_allah pairs a referent with itself
PASS  negative: duplicate referent id is rejected
      first error: duplicate referent id ref_shadow_character
PASS  negative: unused referent is rejected
      first error: referent ref_unused_label is never used by a row
PASS  negative: real-person referent class is rejected
      first error: referent ref_real_person class "REAL_PERSON" is unknown
PASS  negative: quote absent from the cited line is rejected
      first error: row fa_batteries_allah evidence[0] quote "THIS QUOTE IS NOT IN THE FILE" not found at packages/moonql-ontology/src/seed.ts:504
PASS  negative: locator line outside the file is rejected
      first error: row fa_batteries_allah evidence[0] locator line 99999 is outside BLUEPRINT.md lines 1-269
PASS  negative: locator file that does not exist is rejected
      first error: row fa_batteries_allah evidence[0] locator file docs/data/does-not-exist.json does not exist
PASS  negative: evidence item without a locator is rejected
      first error: row fa_batteries_allah evidence[3] locator undefined is not a file:line string
PASS  negative: row with no evidence is rejected
      first error: row fa_batteries_allah has no evidence locators
PASS  negative: unknown decision value is rejected
      first error: row fa_batteries_allah decision "SAME_AS" is not in REJECTED|ALIAS_APPROVED|DISPUTED|NEEDS_SOURCE
PASS  negative: unknown rule code is rejected
      first error: row fa_batteries_allah rule "VIBE_BASED_IDENTITY" is unknown
PASS  negative: row with no rules is rejected
      first error: row fa_batteries_allah has no rules
PASS  negative: misdeclared total is rejected
      first error: declared total 19 !== rows 20
PASS  negative: misdeclared referent tally is rejected
      first error: declared referents 23 !== referents 24
PASS  negative: misdeclared decision tally is rejected
      first error: declared by_decision.REJECTED=12 !== rows 13
PASS  negative: misdeclared basis tally is rejected
      first error: declared by_basis.REGISTRY_DECISION=4 !== rows 5
PASS  negative: misdeclared rule tally is rejected
      first error: declared by_rule.PHONETIC_RESEMBLANCE=0 !== rows 1
PASS  negative: misdeclared evidence tally is rejected
      first error: declared evidence_items 48 !== rows 49
PASS  negative: misdeclared rejected-pair tally is rejected
      first error: declared rejected_pairs 12 !== rows 13
PASS  negative: sameAs between a rejected pair is rejected
      first error: same_as_claims must be empty: this ledger permits no identity merger
PASS  negative: sameAs with invented referents is rejected
      first error: same_as_claims must be empty: this ledger permits no identity merger
PASS  negative: non-empty alias approval list is rejected
      first error: alias_approvals must be empty: no repository record approves a phonetic or mystical alias here
PASS  negative: false phonetic guard is rejected
      first error: guard no_phonetic_alias_approved must be true, got false
PASS  negative: disabled phonetic rule is rejected
      first error: rule PHONETIC_RESEMBLANCE must forbid sameAs, got false
PASS  negative: disabled mystical rule is rejected
      first error: rule MYSTICAL_RESONANCE must forbid sameAs, got false
PASS  negative: ALIAS_APPROVED without an approved alias record is rejected
      first error: row fa_honey_queen_r is ALIAS_APPROVED without an APPROVED alias record
PASS  negative: ALIAS_APPROVED on a phonetic row is rejected even with a record
      first error: row fa_zill_ziil approves an alias on a PHONETIC or MYSTICAL rule; that is forbidden
PASS  negative: REJECTED row carrying an approved sameAs is rejected
      first error: row fa_batteries_allah is REJECTED but records an APPROVED sameAs
PASS  negative: DISPUTED row without a pending sameAs is rejected
      first error: row fa_shadow_character_workspace is DISPUTED without a PENDING sameAs record
PASS  negative: NEEDS_SOURCE row carrying an approved record is rejected
      first error: row fa_batteries_battery_al4h is NEEDS_SOURCE but carries an APPROVED record
PASS  negative: NEEDS_SOURCE row without a missing statement is rejected
      first error: row fa_batteries_battery_al4h NEEDS_SOURCE has no missing statement
PASS  negative: row approving same_as is rejected
      first error: row fa_batteries_allah approved_same_as must be false, got true
PASS  negative: duplicate unordered pair is rejected
      first error: row fa_battery_al4h_allah repeats the pair already used by fa_batteries_allah
PASS  negative: decision vocabulary drift is rejected
      first error: decision_enum does not match the ledger vocabulary
PASS  negative: missing guard key is rejected
      first error: guard no_external_fetch must be true, got undefined
SELF-TEST PASS: all 38 invalid datasets rejected
exit=0
```

38 negative fixtures, all rejected. Each mutates one well-formed field in memory, so no fixture file is written. The fixtures cover duplicate ids, invented pairs, self-pairs, unused referents, real-person classification, quotes not on the cited line, out-of-range and missing files, missing evidence, unknown decisions and rules, every declared tally, `sameAs` between a rejected pair, fake alias approvals, false guards, disabled phonetic/mystical rules, approved records on rejected/needs-source rows, a disputed row without a pending candidate, duplicate pairs, vocabulary drift and a missing guard.

### Syntax and lint

```
$ node --check scripts/check-m17-02-false-aliases.mjs
syntax_exit=0
```

```
$ pnpm exec eslint scripts/check-m17-02-false-aliases.mjs
eslint_exit=0
```

ESLint processed the file: `--format json` reported `"errorCount":0,"warningCount":0,"messages":[]` for `Z:\project\moonradio\scripts\check-m17-02-false-aliases.mjs`.

`pnpm verify` and `pnpm typecheck` were **not** run: this change is one JSON data ledger, one dependency-free Node script and one audit document. No TypeScript, application code, schema, migration or package script changed.

## 6. Security, rights and privacy

- **No network access.** No repository, website, registry or private witness material was fetched or queried. Every quote is from the local worktree at the cited line.
- **No real person is named or inferred.** No referent is classified as a real person; the validator rejects a `REAL_PERSON` referent class. Crew and alias-like surfaces are not linked to performers or public figures.
- **No theological redefinition.** ALLAH, Al-Wadūd and Asmaul Husna are recorded only as referents the repository already distinguishes; no authority, ranking or equivalence is asserted.
- **No source text, lyric, manuscript, image or media bytes were copied.** Only short identity quotations appear.
- **No secrets or environment values** were read, written or required.
- **No rights determination** is made. The ledger decides identity questions, not publication rights.
- **Other sessions' uncommitted work was not touched.** `apps/cockpit`, `apps/dock` (including `globals.css`, `patches/page.tsx`, `PatchesExplorer.tsx`, `responsive-accessibility.test.mjs`), `apps/headquarters` and `docs/audit/screens` were not edited or staged. `TODO.md` was not edited.
- **No commit, stage, push, rebase or delete** was performed.

## 7. Limitations

- **Not an exhaustive alias graph.** The ledger covers pairs the repository already names; it does not enumerate every era, patch, ship or crew surface.
- **Policy-only rows are not typed pair decisions.** `REJECTED` rows based on the vision, Blueprint or M02-01 carry explicit non-identity sentences but no per-pair reviewer record. The basis column distinguishes them from registry decisions.
- **`NEEDS_SOURCE` records silence, not distinctness.** HONEY/HONEYBEE, HONEY/HONEY & MOON, QUEEN R/HONEYBEE, THE BATTERIES/A-L4H THE BATTERY and ZILL/THE SHADOW remain undecided; the ledger does not claim they are different referents.
- **SHADOW character/workspace stays `DISPUTED`.** `IR-003` was never rejected; an approved `distinctFrom` edge and a pending `sameAs` candidate coexist.
- **ZIIL stays disputed.** The historical-spelling and Empire safety/rights readings remain unreconciled; no referent is chosen.
- **HONEY and QUEEN R have no registry row.** Their rows rely on the vision's policy statements and M26-04's absence record, not on a term entity.
- **WINGS/AETHERION and 99/100 separations are documentary.** No game, org or runtime schema enforces them.
- **No runtime consumer.** No API, UI, search index or alias store reads this ledger; the task is evidence and prevention policy, not an implemented resolver.
- **HEAD drift.** Evidence was read across `91a5ff7`, `ee608f7` and `4a9cb46`; the cited files are byte-identical at all three SHAs, but later commits could invalidate locators.
- **No external verification.** ZIIL and Honey source questions could only be closed with an authorized source, which was not available or fetched.

## 8. Rollback

Additive only. Delete the three new files; no tracked file, schema, migration or package script is involved:

```
rm docs/data/M17-02-false-alias-decisions.json
rm scripts/check-m17-02-false-aliases.mjs
rm docs/audit/M17-02-false-aliases.md
```

Do not remove `docs/data/`, `docs/audit/` or `scripts/`; all hold other tasks' artifacts.

## 9. Required report fields

- `task_id`: M17-02
- `baseline_sha`: `ee608f7` (ledger creation); final observed worktree HEAD `4a9cb46f760f8d6595c0677c309c21d779d44f72`; session start observed `91a5ff7f2d9f94fa764115e4c875b6fb443bc453`, and all cited files are identical at all three SHAs
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: `docs/data/M17-02-false-alias-decisions.json` (new), `scripts/check-m17-02-false-aliases.mjs` (new), `docs/audit/M17-02-false-aliases.md` (new)
- `actual_changed_files`: the same three, all new; no existing file was modified, staged or committed (see §6; verified with `git status --short -- <three paths>`)
- `positive_test_and_output`: §5 — 8 PASS + 1 NOTE, 49 locators, exit 0
- `negative_test_and_output`: §5 — 38/38 invalid datasets rejected, exit 0
- `security_rights_privacy`: §6 — no external fetch, no real person, no source/media bytes, no secrets, no rights grant, no TODO edit
- `reviewer`: pending (integrator); not self-approved
- `rollback`: §8
- `result_sha`: n/a (not committed; the three files are uncommitted additions)
- `limitations`: §7
- `next_eligible_task`: **M17-03** (story world/arc/episode/scene/version graph), gated on integrator acceptance of this leaf and on M17-02 evidence passing. Do not treat this audit as closing M17-02.
