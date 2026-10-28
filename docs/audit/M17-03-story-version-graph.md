# M17-03 — Story world, arc, episode, scene and manuscript-version graph: audit

- **Task**: M17-03 (LEAF) · **Milestone**: [M17](../milestones/M17.md) · **Prerequisite**: M17-02 (closed at `ffd148b`)
- **Baseline SHA**: `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (`dev`, `git rev-parse HEAD` at session start)
- **Observed HEAD at final check**: `6341095f61cc0854efe67ede22bbdcc35a2479b8` (`dev`)
- **Baseline drift**: two unrelated commits landed while this leaf ran — `ab6668b` (M19 docs audit) and `6341095` (TODO note). `git diff --stat 891bf5e..HEAD -- <every cited source>` is empty, so every locator and quote is byte-identical at both SHAs.
- **Worker**: repository-evidence leaf (AI agent), read-only outside the four claimed files
- **Claimed files**: `docs/design/M17-03-story-version-graph.md` (new), `docs/data/M17-03-story-version-graph.json` (new), `scripts/check-m17-03-story-version-graph.mjs` (new), this audit (new)
- **Acceptance tested**: "99 chapter headings not treated as 99 originals"

## 1. Result

**READY FOR INTEGRATOR REVIEW against the recorded acceptance.** The artifact defines a five-kind story graph (`world`, `arc`, `episode`, `scene`, `manuscript_version`), four explicitly non-node label classes, five allowed edges, nine cardinality rules, eight invariants and eight forbidden inferences. It then records what the repository actually holds: **99 heading labels, 33 patch title labels, 3 episode labels and 8 version-family references — and zero instances of every node kind**.

The acceptance is met mechanically, not by assertion: the dataset has **99 `heading_label` rows, each `LABEL_ONLY` with `node_id: null`, 0 `manuscript_version` nodes, 0 edges from any heading, and 0 claimed originals**. The validator rejects the exact mutant the task warns about — a dataset that maps 99 headings to 99 manuscript versions.

| Declared quantity | Value |
|---|---:|
| node kinds / label classes / edge types | 5 / 4 / 5 |
| node instances (all five kinds) | **0** |
| heading label rows | **99** (slots 1–99, unique) |
| patch title rows | **33** (slot 014 disputed, none completed) |
| episode label rows | **3** |
| version-family reference rows | **8** (6 `NEEDS_SOURCE`, 1 `LABEL_ONLY`, 1 `ABSENT`) |
| dataset edges | **0** |
| originals claimed | **0** |
| document evidence rows / resolved quotes | 37 / **180** |

## 2. Acceptance mapping

The TODO sentence "99 chapter headings not treated as 99 originals" is satisfied at the level the repository permits:

- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:703` — the sequence is an "**editorial convention**" that "must not be mislabeled as independently reconstructed original transcript".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:969` — "**but a count of editorial chapters is not the number of verified original chapters**".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:753` — "**99 ≠ completion:** this is a *coverage index*, not evidence that all 99 primary manuscripts, images or chronology matches have been recovered."
- `docs/decisions/M06-02-xiv-v10-crosswalk.md:13-14` — the 99 chapters are modern editorial writing and "**NOT** primary revelation texts, ancient manuscripts, or divine scriptures".
- `docs/audit/M26-01-chapter-crosswalk.md:45` — "No V10/V10.1 chapter file, manuscript or edition exists in this repository."

Design responses encoded in the artifact:

1. `heading_label` is a **label class**, not a node kind, and can never be an edge endpoint (CR-07, INV-LABEL-NOT-NODE).
2. Deriving any version or original from a heading count is `FORBIDDEN` in `derivation_rules` and rejected by the validator (INV-DERIVATION-FORBIDDEN, FI-01/FI-02).
3. The graph's version layer (`manuscript_version`) is separate and has **zero** rows; the eight XII/XIV references stay references, not nodes.
4. The 33 patch titles follow the same rule: historical "editorial label" rows, `completed: false`, slot 014 still disputed (E25, E26).

## 3. What the repository actually contains

- **99 headings** come from one source, `MASTER_VISION_NARRATIVE_XV.md` lines 706–751 in 16 bands, as M26-01 already records (`docs/audit/M26-01-chapter-crosswalk.md:24`). Each row quotes its own "NN Title" token at the band line.
- **33 patch titles** come from the table at `MASTER_VISION_NARRATIVE_XV.md:929-961`, headed "Title (historical editorial label)" and composed "8 + 5 + 1 + 18 + 1 = 33" (`docs/decisions/M06-04-xii-patches-registry.md:14`). No patch is marked completed; 014 stays disputed.
- **3 episode labels** are the timestamped NPD tokens printed under "Episodes/tokens" (`MASTER_VISION_NARRATIVE_XV.md:370`). They are labels, not episodes: the same document says the "exact NPD page/scene/media order remain[s] incompletely recovered" (`:973`).
- **8 version-family references** reuse the M17-01 families (XIV V10, V10.1, V1–V10 originals, public draft; XII 33 patches, 15 synopses, 63 pages, patch 014). None has an in-repo artifact; V1–V10 originals are explicitly "**not been imported**" (`:971`).
- **0 story nodes.** `@moonwitness/story` is Planned (`docs/decisions/M02-02-domain-assignments.md:26`), the ontology has only `ACTOR/ENTITY/CHARACTER` (`packages/moonql-ontology/src/seed.ts:18`), and "No D07 story/media package exists" (`docs/audit/M26-03-batteries-npd-recovery.md:48`).
- **Books/synopses are counts, not rows.** The four books have "no individual titles anywhere" (M26-03 audit `:46`) and no page range, scene list or transcript (`:53`); therefore no placeholder ids are minted here.

## 4. Commands actually run and observed output

### Positive run

```
$ node scripts/check-m17-03-story-version-graph.mjs
PASS ontology node kinds=5 label classes=4 edges=5 cardinality rules=9 invariants=8 forbidden inferences=8
PASS 180 source quotes resolved at their cited file:line (37 document + 143 label rows)
PASS dataset nodes=0 edges=0 heading=99 patch=33 episode=3 version_ref=8
PASS acceptance heading labels=99 manuscript_version nodes=0 originals_claimed=0 edges from headings=0
PASS declared tallies match enumerated rows; heading slots 1-99 unique; patch 014 stays disputed
PASS design document mirrors every evidence id, locator and verbatim quote; no other-session file is read
NOTE zero story nodes instantiated, zero originals claimed, zero source text reproduced
exit=0
```

### Negative run (`--self-test`)

```
$ node scripts/check-m17-03-story-version-graph.mjs --self-test
PASS  positive: valid fixture accepted with 0 errors
PASS  negative: quote drift is rejected (heading 01) (QUOTE_MISMATCH)
PASS  negative: tally drift is rejected (heading tally 98) (TALLY_MISMATCH)
PASS  negative: 99 headings treated as 99 originals is rejected (HEADING_TO_VERSION)
PASS  negative: dangling edge is rejected (DANGLING_EDGE)
PASS  negative: missing required invariant is rejected (MISSING_INVARIANT)
PASS  negative: scene without an episode (version) parent is rejected (VERSION_PARENT)
PASS  negative: heading label promoted to a node kind is rejected (NODE_KIND_SET)
PASS  negative: patch completed flag is rejected (PATCH_COMPLETED)
PASS  negative: duplicate heading slot is rejected (HEADING_SLOTS)
PASS  negative: heading row pointing at a node is rejected (HEADING_NODE)
PASS  negative: patch slot 014 dispute removal is rejected (PATCH_DISPUTE)
PASS  negative: derivation rule weakening is rejected (DERIVATION_RULE)
PASS  negative: missing version_of edge type is rejected (EDGE_MISSING)
PASS  negative: out-of-range locator is rejected (LOCATOR_RANGE)
PASS  negative: design-document drift is rejected (DESIGN_DRIFT)
SELF-TEST PASS: valid fixture accepted; all 15 invalid datasets rejected
exit=0
```

Fixtures are mutated in memory; the validator writes nothing and the self-test leaves no fixture files behind.

### Syntax and parse

```
$ node --check scripts/check-m17-03-story-version-graph.mjs
syntax_exit=0

$ node -e "const d=require('./docs/data/M17-03-story-version-graph.json'); ..."
task=M17-03 headings=99 slots=99 patches=33 nodes=0 edges=0 quotes=180
```

### Baseline, worktree and drift

```
$ git rev-parse HEAD                       # at start
891bf5e19edbbea3d5e5ada36a7b126f35fabf94

$ git status --short                       # at start
(pre-existing modifications and untracked files from other sessions; TODO.md not touched)

$ git rev-parse HEAD                       # at final check
6341095f61cc0854efe67ede22bbdcc35a2479b8

$ git status --short -- <the four claimed paths>
?? docs/data/M17-03-story-version-graph.json
?? docs/design/M17-03-story-version-graph.md
?? scripts/check-m17-03-story-version-graph.mjs

$ git status --short | wc -l ; git status --short | grep -c '^ M'
94
66

$ git log --oneline 891bf5e..HEAD
6341095 docs(todo): record the M19-19 audit and its UNILEX leak
ab6668b docs(m19): audit the Dock rights projection and record a UNILEX leak

$ git diff --stat 891bf5e..HEAD -- <every cited source file>
(empty)
```

The three new files appear as `??`; no tracked file was staged, edited, reverted or deleted by this leaf. The 66 ` M` entries are other sessions' pre-existing work and were not opened for editing. The audit itself is the fourth new file and cannot list itself until written.

One-off composition aid: a generator in `%TEMP%` (`gen-m17-03.mjs`, outside the repository, not a deliverable and not a dependency) parsed the 16 heading band lines and the 33 patch table rows into JSON rows to avoid transcription drift. Observed: `wrote ... heads 99 patches 33 episodes 3 versions 8 evidence 37`.

## 5. Positive and negative evidence

**Positive.** 180 quotes resolve verbatim at their cited `file:line`: 37 document claims (including every node-kind, label-class, edge and invariant source) plus 143 dataset rows. All declared tallies equal the enumerated rows. The design document mirrors every evidence id, locator and quote, so prose and data cannot drift apart. The acceptance proof asserts and re-checks 99 heading labels → 0 manuscript versions → 0 originals.

**Negative.** Fifteen tampered fixtures are rejected for their intended codes, not incidentally: quote drift, tally drift, 99-headings-as-99-originals, dangling edge, missing invariant, parentless scene, label promoted to a node kind, completed patch, duplicate heading slot, heading pointing at a node, patch-014 dispute removal, derivation-rule weakening, missing `version_of` edge type, out-of-range locator, and design-document drift.

## 6. Security, rights and privacy

- **No network.** No repository, archive, URL or API was fetched, cloned or queried. Every quote is read from the local worktree.
- **No source text beyond locator titles.** The longest reproduced strings are a chapter title token, a patch title cell and single-sentence policy statements already tracked in this repository. No chapter body, manuscript, synopsis, lyric, poster or media byte is copied, and no image was opened.
- **No real person** is named, inferred or linked. Patches and story labels are fictional/editorial; nothing here asserts authorship, casting or identity.
- **No rights determination.** Every patch and version row is `NOT_ASSESSED` or metadata-only; no licence, consent, clearance or publication gate is granted or implied.
- **No secrets or credentials** were read, written or needed; no environment value is printed.
- **Other sessions' work untouched.** App, test, screen and TODO files were never edited, staged or reverted; `TODO.md` was not modified.
- **No new dependency**, no package-script change, no schema, migration, table, API, UI or runtime reader.

## 7. Limitations

- **D07 is planned, not implemented.** The register says Planned (M02-02:26), the ontology has no story kinds (seed.ts:18) and no package exists (M26-03:48). The graph has a schema and an evidence ledger but no live rows, so structural invariants are exercised only by fixtures.
- **One heading source.** The 99 labels come from a single vision section; no per-heading manuscript exists (M26-01:45), so heading-to-source mapping is impossible without new sources.
- **Patch titles are secondary.** They come from the XV table, not the absent XII registry; slot 014 keeps two competing titles and is not adjudicated.
- **Overloaded vocabulary.** `world`, `scene` and `version` also mean D10 World/Science, an ORBIT 3D scene, and D01 source versions. Only the D07 senses are modelled; the non-equivalences are explicit.
- **Counts are not rows.** Four BATTERIES books and fifteen synopses are cited as counts only; no placeholder ids are invented.
- **No ADR.** This is a task design under M17, not an accepted architecture decision; a future ADR or D07 schema needs its own review.
- **Baseline drift.** HEAD moved by two unrelated commits during the run; every cited file is unchanged across the range.
- **No TypeScript changed,** so `pnpm typecheck` is not applicable. `pnpm verify`, package test suites, Docker, database, CI and browser checks were **not** run and are not claimed.

## 8. Rollback

Additive only. Delete the four new files; no tracked file, schema, migration, package script or dependency is involved:

```
rm docs/design/M17-03-story-version-graph.md
rm docs/data/M17-03-story-version-graph.json
rm scripts/check-m17-03-story-version-graph.mjs
rm docs/audit/M17-03-story-version-graph.md
```

Do not remove `docs/design/`, `docs/data/`, `docs/audit/` or `scripts/`; each holds other tasks' artifacts.

## 9. Required report fields

- `task_id`: M17-03
- `baseline_sha`: `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (session start); final observed HEAD `6341095f61cc0854efe67ede22bbdcc35a2479b8`; cited files identical across the range
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: `docs/design/M17-03-story-version-graph.md`, `docs/data/M17-03-story-version-graph.json`, `scripts/check-m17-03-story-version-graph.mjs`, `docs/audit/M17-03-story-version-graph.md` (all new)
- `actual_changed_files`: the same four, all new and untracked; the three non-audit paths show as `??`; no pre-existing file modified
- `positive_test_and_output`: §4 — 6 PASS + 1 NOTE, 180 quotes, 99 headings → 0 versions/originals, exit 0
- `negative_test_and_output`: §4 — valid fixture accepted, 15/15 tampered datasets rejected, exit 0
- `security_rights_privacy`: §6 — no fetch, no manuscript/lyric/media bytes, no real person, no secrets, no rights grant, no TODO edit
- `reviewer`: pending (integrator); not self-approved
- `rollback`: §8
- `result_sha`: n/a — not committed; left to the integrator. Two unrelated commits (`ab6668b`, `6341095`) landed during the run and touched no cited file.
- `limitations`: §7
- `next_eligible_task`: **M17-04** (four-book THE BATTERIES and NPD variant gaps; prerequisite M17-03), gated on integrator acceptance of this leaf. M17-05 also depends on M17-03 but additionally on M03-02. Do not treat this audit as closing M17-03.
