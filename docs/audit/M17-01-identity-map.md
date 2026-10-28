# M17-01 — Map II eight eras, crew and XII/XIV story versions to identities

- **Task**: M17-01 (LEAF) · **Milestone**: [M17](../milestones/M17.md) · **Prerequisites**: M06-03, M16-01
- **Declared baseline SHA**: `dfc6556` (`dev`) — "docs(todo): close M31-03 at the accepted Dock runtime decision"
- **Observed worktree HEAD**: `7ea03670de9369252d615a80b66d71e37b8fa1d5` (`dev`, 25 commits after the declared baseline; `dfc6556` is an ancestor)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the claimed files
- **Claimed files**: `docs/data/M17-01-identity-map.json` (new), `scripts/check-m17-01-identity-map.mjs` (new), this audit (new)
- **Acceptance tested**: "Separate character/actor IDs with source locator"

## 1. Result

**READY FOR INTEGRATOR REVIEW against the recorded acceptance.** The ledger has 36 rows, every row carries a status and resolving evidence locators with exact quotes; the two `ABSENT` rows correctly have no row-level `source_locator` (their `evidence` cites the repository's own absence statements), and no character identity is the same identity as an actor. The validator proves the acceptance mechanically: unique ids, kind-prefixed ids, zero character/actor collisions, zero `sameAs` claims, zero real-person assertions, every count reconciled, every eight-era claim enumerated from a repository source or explicitly gapped.

**Nothing is recovered, aligned or invented.** No II era artifact was opened, no era enumeration was chosen as canonical, no real performer is named, and no XII/XIV manuscript or patch title is claimed. The ledger records identity *references* that the repository already contains, not lore.

| Status | Rows | Meaning applied |
|---|---:|---|
| `EVIDENCED` | **3** | a typed registry row exists in-repo (ontology seed or disambiguation registry) with a locator |
| `LABEL_ONLY` | **19** | the label appears in-repo, but no identity, type or person is asserted |
| `NEEDS_SOURCE` | **12** | the repository says the referent is ambiguous, disputed or source-dependent; no resolution is guessed |
| `ABSENT` | **2** | the repository explicitly records that the artifact/person is not present |
| **Total** | **36** | 1 character, 6 crew labels, 2 ensembles, 1 entity, 1 actor, 16 eras, 8 story versions, 1 gap |

`EVIDENCED` here means "typed registry row + locator", **not** "canon settled". Status is identity evidence, not narrative authority.

Other declared tallies, all validator-checked: `by_kind` character 1 / crew_label 6 / ensemble 2 / entity 1 / actor 1 / era 16 / story_version 8 / gap 1; nine guards all `true`; `same_as_claims` empty.

## 2. Plain evidenced-versus-unresolved counts

### II eight eras

- **16 era label rows**, because the repository contains **two incompatible eight-era enumerations**. They are deliberately kept as two separate sets and never merged.
- **0 era rows are `EVIDENCED`** from a recovered source artifact. **0** II era source artifacts are present in the repository.
- **16 / 16 rows are `LABEL_ONLY`**: both lists are quoted from XV documents, not from II's own `data/eras.yaml`.
- **1 `NEEDS_SOURCE` gap row** (`gap_era_alignment`) records that the two lists cannot be aligned from repository evidence.
- **2 claims × 8 eras** = 16 enumerated rows; each claim points at an explicit 8-item list, satisfying the "enumerated or gapped" rule.

### II crew

- **8 slots** (slots 11–18), complete and unique.
- **1 `EVIDENCED`**: `THE SHADOW` is registered as ontology `CHARACTER` (`O007`) and is explicitly a story character distinct from the SHADOW workspace.
- **1 `EVIDENCED` ensemble outside the 8 slots**: `THE BATTERIES` (`O008`) — its ontology kind is `ACTOR` while the seed text calls it a **fictional band**. It is mapped as `ensemble`, not as a real performer, and is not counted in the slot tally (`crew.evidenced = 1` counts slot rows only).
- **2 `LABEL_ONLY`**: `THE RUNAWAY TRACE` and `The Second Crew Generation` (surface label / generation group; no typed identity).
- **5 `NEEDS_SOURCE`**: slots 13–17, including combined surfaces (`BLUE WITCH & DJ DAVID`, `ELECTRIC FOREST, INDESTRUCTIBLE & JHNNY DEPP`) that no registry row resolves.
- **0 real performers/actors are named.** The single `actor` row (`fg_ii_crew_performers`) is `ABSENT`, with `real_person_identity: "ABSENT"`.

### XII/XIV story versions

- **8 story-version rows** (4 XIV, 4 XII).
- **0 `EVIDENCED`**, **1 `LABEL_ONLY`** (the public V10 draft link is a mutable branch pointer), **6 `NEEDS_SOURCE`**, **1 `ABSENT`** (private V1–V10 originals).
- Counts are treated as claims by secondary documents, not as opened chapter/patch records.

### Character/actor separation

| Check | Value |
|---|---:|
| character rows | 1 |
| crew-label rows | 6 |
| actor rows | 1 |
| shared character/actor ids | **0** |
| `sameAs` claims | **0** |
| rows asserting a real person is a character | **0** |

## 3. What the repository actually evidences

All quotations below are exact substrings of the cited line; the validator re-checks them at run time (116 locator/quote checks in the positive run).

### The two era enumerations

- `docs/decisions/M06-03-ii-lore-recovery.md:18` — "**The 8 Eras (Chronology Schema)**:"; lines 20–27 enumerate:
  Era 1 Origin & Genesis · Era 2 Ancient Alliances · Era 3 Rise of the Towers · Era 4 The Great Eclipse · Era 5 Fragmented Realms · Era 6 The Voice in the Wasteland · Era 7 Digital Radio & Silent Frequencies · Era 8 The Witness Horizon (XV).
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:805` — "**All eight eras** recovered from the public XIV V10.1 companion to II: `BEFORE LIGHT → THE ARRIVAL → THE WITNESS → THE RUNAWAYS → THE EXPOSURE → THE CHANGE → END OF AN ERA → NEXT PHASE`. Preserve II's own `data/eras.yaml` source/version and publication status."

These two lists **do not align by name or ordinal**, and no repository document aligns them. The map therefore contains no crosswalk between them — only the gap row.

- `docs/audit/M06-01-source-repo-pins.md:19` — the "II 13 Functions / 8 Eras" row pins `github.com/bjo163/moonwitness-ii` at `48a27d19c0bfe831`, path `spec/lore/13-functions.yaml`. **The pin points at a functions file, not at `data/eras.yaml`.**
- `docs/audit/M26-07-zenix-age-code-audit.md:94` — every M06-01 pin, including `spec/lore/13-functions.yaml`, is `ABSENT` (`test -e` → absent for each; consistent with M26-01's "0 VERIFIED_SOURCE").
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:173` — "**Historical AGE CODE:** … This is a separately authored taxonomy." A third chronology exists and is explicitly not II's eight eras; it was not imported into the map.

### The crew

- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:711` — "## III. Me and My Crew (11–18)"; `:712` enumerates slots 11–18: THE SHADOW · THE RUNAWAY TRACE · A LAH / THE BOSS · DOGS FROM UNIVERSE · BLUE WITCH & DJ DAVID · WALTER WHITE / WHITER / WHITE · ELECTRIC FOREST, INDESTRUCTIBLE & JHNNY DEPP · The Second Crew Generation.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:977` — "THE SHADOW, A LAH / 4-LAH, DOGS FROM UNIVERSE, BLUE WITCH, WALTER aliases and generations require **typed candidate identity review**." This is the repository's own reason for `NEEDS_SOURCE` on those slots.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:368` — "Fictional ensemble: **THE BATTERIES** … **THE SHADOW**, **BLUE WITCH**, **DOGFROMUNIVERSE**, and supporting crews."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:370` — "**Do not infer ethnicity or identify real people from fictional labels.**" This is the governing rule applied to `JHNNY DEPP`, `WALTER WHITE` and every alias-like crew surface.
- `docs/decisions/M02-01-disambiguation-registry.md:25` — SHADOW splits into "**SHADOW (Workspace)**" (editorial/studio UI) and "**SHADOW (Character)**" (narrative entity), differentiated by type. The map records them as `ent_shadow_workspace` and `ch_shadow` with a `DISTINCT_FROM` claim.
- `docs/decisions/M02-01-disambiguation-registry.md:27` — "THE BATTERIES … Nama band/proyek kreatif dalam dunia fiksi MoonWitness. Sepenuhnya domain fiksi."
- `packages/moonql-ontology/src/seed.ts:228-234` — `O007`, `kind: 'CHARACTER'`, `labelEn: 'SHADOW Character'`.
- `packages/moonql-ontology/src/seed.ts:240-246` — `O008`, `kind: 'ACTOR'`, `labelEn: 'THE BATTERIES'`, described as a fictional band. **Ontology `ACTOR` is a registry kind, not evidence of a real performer.**
- `packages/moonql-actors/src/seed.ts` — `fg_001`–`fg_005` exist, but none is linked to an II crew slot. The actor row is therefore `ABSENT`: no casting/performer identity is present.

### XII/XIV story versions

- `docs/audit/M06-01-source-repo-pins.md:17` — "**V10 / 99 Chapters**" pinned at `99e1a4f028b37dc1`, path `docs/narrative/v10/`, classified `EDITORIAL_CHAPTERS`.
- `docs/audit/M06-01-source-repo-pins.md:20` — "**XII 33 Patch Statuses**" pinned at `33f0014bca881029`, path `patches/registry/33-patches.json`.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:779` — the V10.1 expanded companion is cited at full SHA `fff3b0dbc452e998f221e2ca15fd1d41e0ffc599`, with "Pin exact file/path and commit before importing each record. Branch pointers … are **not permanent content identifiers**."
- `docs/audit/M26-07-zenix-age-code-audit.md:91` — V10.1 at `fff3b0d…` is `ABSENT`: `git cat-file` fatal plus "`git ls-files` miss".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:971` — "Full private V1–V10 originals and user-authorized immutable versions have **not been imported**."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:974` — "XII's **15 story archive synopsis entries** and **63 editorially reconstructed pages** are **not** 15 guaranteed original transcripts or 63 authenticated image originals."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:976` — "World Patch #014 numbering dispute remains open." No title is chosen.
- `docs/decisions/M06-04-xii-patches-registry.md:14-19` — the 33 patches decompose 8 + 5 + 1 + 18 + 1; patch 014 is `DISPUTED`, retained with "zero divine approval inferred".
- `docs/decisions/M06-02-xiv-v10-crosswalk.md:13` and `:31` — the 99 V10/V10.1 chapters are editorial chapters by modern authors; ambiguous authorship stays `NEEDS_SOURCE`, metadata-only.

## 4. Identity guards encoded in the ledger

All nine top-level guards are literal `true` and enforced by the validator:

`character_actor_distinct`, `no_character_actor_same_as`, `no_real_person_asserted_as_character`, `every_row_has_resolving_locator`, `eight_eras_claims_enumerated_or_gapped`, `ontology_actor_kind_is_not_performer`, `no_invented_lore`, `no_external_fetch`, `source_locator_required_unless_absent`.

Concrete constraints the validator applies:

- ids are unique and prefixed by kind: `ch_` character, `cr_` crew label, `grp_` ensemble, `ent_` entity, `fg_` actor, `er_` era, `sv_` story version, `gap_` gap.
- no id may be valid under two kind prefixes; character and actor id sets must not intersect.
- `actor` rows must declare `fiction: "REALITY"` and may not declare a `real_person_identity` of `ASSERTED`; no row may carry `portrays`.
- `character` rows may not assert a real-person identity; `ensemble` rows are explicitly fiction.
- no row-level `same_as`; `identity_claims` may only be `DISTINCT_FROM`.
- `EVIDENCED` story versions require an `artifact_in_repo` of `PRESENT`; `LABEL_ONLY` rows may not carry a registry ref; `ABSENT` rows must carry an `absence` statement with no row-level `source_locator`/`source_quote` and no registry ref (their evidence locators still resolve).
- every eight-era claim must enumerate exactly 8 distinct `era` rows, or name a `NEEDS_SOURCE` gap; differing enumerations must be `UNRESOLVED` and gapped; no era row may be claimed twice.
- crew slots 11–18 must be present and unique.

## 5. Tests and observed output

### Positive test

```
$ node scripts/check-m17-01-identity-map.mjs
PASS rows=36 unique ids=36
PASS statuses EVIDENCED=3 LABEL_ONLY=19 NEEDS_SOURCE=12 ABSENT=2
PASS kinds character=1 crew_label=6 ensemble=2 entity=1 actor=1 era=16 story_version=8 gap=1
PASS character/actor separation character_ids=1 actor_ids=1 shared=0 same_as=0 real_person_asserted=0
PASS eras label_rows=16 claims=2 evidenced=0 label_only=16 source_artifacts_present=0 alignment=UNRESOLVED gap=gap_era_alignment
PASS crew slots=8 evidenced=1 label_only=2 needs_source=5 absent=0
PASS story versions rows=8 xiv=4 xii=4 evidenced=0 label_only=1 needs_source=6 absent=1
PASS 116 locator quotes resolved at the cited file:line
PASS declared counts match rows; crew slots 11-18 complete; both eight-era claims enumerate 8 rows
PASS zero character/actor id collisions; zero sameAs claims; zero real-person assertions
NOTE zero era artifacts recovered, zero real performers named, zero XII/XIV source text claimed
exit=0
```

The positive run proves the acceptance sentence directly: separate id namespaces (`ch_` vs `fg_`), zero intersection, zero merger claims, and 116 exact locator quotes.

### Negative test / self-test

```
$ node scripts/check-m17-01-identity-map.mjs --self-test
PASS  negative: duplicate row id is rejected
PASS  negative: character id using the actor prefix is rejected
PASS  negative: EVIDENCED row without source_locator is rejected
PASS  negative: EVIDENCED row with a quote absent from the cited line is rejected
PASS  negative: locator line outside the file is rejected
PASS  negative: evidence item without a locator is rejected
PASS  negative: NEEDS_SOURCE row with a null source_locator is rejected
PASS  negative: misdeclared total is rejected
PASS  negative: misdeclared kind tally is rejected
PASS  negative: eight-era claim enumerating only seven rows is rejected
PASS  negative: eight-era claim with no enumeration and no gap is rejected
PASS  negative: era claim enumerating a non-era row is rejected
PASS  negative: era row enumerated by two claims is rejected
PASS  negative: SAME_AS claim between actor and character is rejected
PASS  negative: identity claim using SAME_AS is rejected
PASS  negative: actor row marked as fiction is rejected
PASS  negative: character row asserting a real person is rejected
PASS  negative: unknown kind is rejected
PASS  negative: duplicate crew slot is rejected
PASS  negative: false guard flag is rejected
PASS  negative: ABSENT row carrying a source_locator is rejected
PASS  negative: full-SHA flag on a 16-hex ref is rejected
PASS  negative: LABEL_ONLY row carrying a registry_ref is rejected
PASS  negative: row with no evidence locators is rejected
SELF-TEST PASS: all 24 invalid datasets rejected
exit=0
```

24 negative fixtures, all rejected, each mutating one well-formed field in memory so no fixture file is written.

### Syntax and parse

```
$ node --check scripts/check-m17-01-identity-map.mjs
syntax_exit=0
```

`pnpm verify`, `pnpm typecheck` and application suites were **not** run: the change is two documentation/data artifacts plus one dependency-free Node script, with no TypeScript or application code change and no package-script edit.

## 6. Security, rights and privacy

- **No network access.** No repository was fetched, cloned, opened or queried. All evidence is in the local worktree at the cited lines.
- **No real person is named or inferred.** `JHNNY DEPP`, `WALTER WHITE`, alias surfaces and crew labels are recorded as labels only; `docs/vision/MASTER_VISION_NARRATIVE_XV.md:370` forbids identifying real people from fictional labels. The single actor row is `ABSENT` rather than a guessed cast.
- **No source text, lyrics, manuscript, image or media bytes were copied.** Only short identity quotations appear.
- **No secrets or credentials** were read, written or needed.
- **No rights determination** is made. The ledger maps identities; it does not grant or imply publication rights.
- **Other sessions' WIP was not touched** (`apps/cockpit`, `apps/dock`, `apps/headquarters`, `docs/audit/screens`). `apps/dock/src/ui/client/GeneratorStudio.tsx` was inspected only and contains no story/crew/actor identity data relevant to this leaf; it was not modified.

## 7. Limitations

- **Two era enumerations, no crosswalk.** M06-03 and the vision list different names and orders. The ledger refuses to guess an alignment; `gap_era_alignment` stays `NEEDS_SOURCE`. Any future alignment needs II's `data/eras.yaml` or another primary source.
- **No era artifact exists in-repo.** The M06-01 II pin targets `spec/lore/13-functions.yaml` and uses a 16-hex ref, not a full commit; M26-07 records all such pins absent. `source_artifacts_present: 0`.
- **The ontology `ACTOR` kind is not performer evidence.** `O008 THE BATTERIES` is a fictional band. Reading `ACTOR` as "real actor" would be exactly the conflation this task forbids.
- **Absence is repository silence, not a casting archive.** No performer row exists; that is recorded as `ABSENT`, not as proof that no performer was ever involved in II.
- **Crew slots are not characters by default.** `UNRESOLVED` referent types remain unresolved; combined labels (e.g. three surfaces in slot 17) are not split without a registry row.
- **Story-version counts are claims.** "99 chapters", "33 patches", "15 synopses" and "63 pages" come from XV documents and pins; none was opened. `EVIDENCED` is zero.
- **Patch 014 has no chosen title.** The dispute is recorded, not adjudicated.
- **No per-chapter or per-patch identity rows.** The map is version-level, not a chapter graph.
- **HEAD drift.** Evidence was read at `7ea0367`, not the declared `dfc6556`. `git diff --stat dfc6556 HEAD -- <all ten cited source files>` is empty, so every locator and quote is identical at both SHAs.
- **`fg_` is reused as the repo's figure prefix** for a negative row (`fg_ii_crew_performers`). It is an absence marker, not a minted figure; no `fg_006+` id is created and no seed file is changed.

## 8. Rollback

Additive only. Delete the three new files; no tracked file, schema, migration or package script is involved:

```
rm docs/data/M17-01-identity-map.json
rm scripts/check-m17-01-identity-map.mjs
rm docs/audit/M17-01-identity-map.md
```

Do not remove `docs/data/` or `docs/audit/`; both hold other tasks' artifacts.

## 9. Required report fields

- `task_id`: M17-01
- `baseline_sha`: `dfc6556` (declared); observed HEAD `7ea03670de9369252d615a80b66d71e37b8fa1d5`; `dfc6556` is an ancestor and all cited files are byte-identical at both SHAs
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: `docs/data/M17-01-identity-map.json` (new), `scripts/check-m17-01-identity-map.mjs` (new), `docs/audit/M17-01-identity-map.md` (new)
- `actual_changed_files`: the same three, all new; `git status --short -- <three paths>` shows exactly three `??` entries and no `M`/`D` entry; pre-existing other-session changes untouched
- `positive_test_and_output`: §5 — 10 PASS + 1 NOTE, 116 locators, exit 0
- `negative_test_and_output`: §5 — 24/24 invalid datasets rejected, exit 0
- `security_rights_privacy`: §6 — no external fetch, no real performer, no manuscript/media bytes, no secrets, no rights grant
- `reviewer`: pending (integrator); not self-approved
- `rollback`: §8
- `result_sha`: n/a (not committed; the three files are uncommitted additions)
- `limitations`: §7
- `next_eligible_task`: **M17-02** (false-alias prevention for Shadow/Batteries/Honey/ZILL), gated on M10-04 and integrator acceptance of this leaf; M17-03 then follows M17-02. Do not treat this audit as closing M17-01.
