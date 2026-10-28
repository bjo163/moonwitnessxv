# M26-07 — Early ZENIX/Universe history, AGE CODE and lost-source leads

- **Task**: M26-07 (audit leaf, read-only)
- **Milestone**: M26 — Legacy canon, Empire registries and missing sources
- **Acceptance audited**: *Reported history vs repo evidence clearly tagged*
- **Prerequisite**: M26-01 (closed; `docs/data/M26-01-chapter-crosswalk.json`, `docs/audit/M26-01-chapter-crosswalk.md`)
- **Declared baseline in the task**: `a5f9b64` — resolves as `a5f9b64 docs(todo): close M31-02, M25-03 and M26-01 at 4b0a872`
- **Audited HEAD (`dev`)**: `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139` — two commits ahead of the declared baseline (`a5f9b64 → 15e4bc4 → 3b44d28`)
- **Worktree**: another session's uncommitted changes are present under `apps/`, `docs/audit/screens/` and `todo-ui-2.md`. None touch an audited path; `git status --porcelain -- docs/vision docs/data TODO.md docs/tasks docs/audit/M26-01-chapter-crosswalk.md` returned empty. Nothing was modified by this audit except this file.
- **Worker**: M26-07 audit leaf (subagent), read-only.

---

## 1. Scope and method

In scope: every repository mention of **ZENIX**, **early Universe history**, **AGE CODE**, and **lost-source leads** attached to them.

Method, in order:

1. Record branch, HEAD and worktree state before reading anything.
2. Read the task packet, milestone context, `MASTER_VISION_NARRATIVE_XV.md`, `M06-05-historical-interfaces-map.md`, `M06-02-xiv-v10-crosswalk.md`, `BLUEPRINT.md`, the M26-01 crosswalk data and audit, and `M06-01-source-repo-pins.md`.
3. Enumerate mentions by literal search over the whole tree, excluding generated output (`node_modules`, `.git`, `.next`, `dist`, `build`). Result: **ZENIX — 11 occurrences in 5 files; AGE CODE — 11 occurrences in 4 files**, none in application or package source.
4. Attach a tag to every claim and verify its locator by reading the exact line. No claim was paraphrased into existence.
5. Attempt to resolve every cited commit, repository and file reference with `git cat-file`, `git remote -v`, `git ls-files` and `test -e`. Nothing outside this repository was fetched; no SHA, date or upstream fact was invented.

**Tag vocabulary used in the ledger**

| Tag | Meaning |
|---|---|
| `REPO_EVIDENCE` | The claim is about an artifact in *this* repository and is checkable here (line content, file presence, validator result). |
| `REPORTED_HISTORY` | A prose assertion about a past repository, organisation or event outside XV. Only *that the assertion is written down* is verifiable here; the assertion itself is not. |
| `DOC_ONLY_PLAN` | A proposal, mapping or policy that exists only as document text and has no implementation artifact. |
| `LOST_SOURCE_LEAD` | A source, repository or file is *named* (or implied) but is absent from this repository and cannot be resolved from it. |

---

## 2. Claim ledger

| # | Claim (quoted) | Locator | Tag | Verification result |
|---|---|---|---|---|
| R1 | "01 The Unrecorded Beginning · **02 The ZENIX Years** · **03 The Universe Years** · 04 The Great Convergence." | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:706` | REPO_EVIDENCE | Resolves. These are editorial coverage-index labels in band "I. Three-year legacy (01–04)" (`:705`). Labels only; no text, manuscript or edition. |
| R2 | Slot 2 "The ZENIX Years", `source_status: NEEDS_SOURCE`, gap note "Early ZENIX/2023-2025 origins remain historical leads without comprehensive signed-off source timelines." | `docs/data/M26-01-chapter-crosswalk.json:73-91` | REPO_EVIDENCE | Resolves. `gap_evidence.locator` points at `MASTER_VISION_NARRATIVE_XV.md:983`, which contains that sentence. M26-01 validator PASS at this HEAD. |
| R3 | Slot 3 "The Universe Years", `source_status: LABEL_ONLY`, empty `gap_evidence` | `docs/data/M26-01-chapter-crosswalk.json:92-105` | REPO_EVIDENCE | Resolves. Label only; no source named. |
| R4 | Slot 77 "AGE CODE", `source_status: LABEL_ONLY`, empty `gap_evidence` | `docs/data/M26-01-chapter-crosswalk.json:1262-1275` | REPO_EVIDENCE | Resolves. Observation: no AGE CODE source exists (L3), yet no gap note is recorded on this row — see §8 limitation 3. |
| R5 | "Early ZENIX/2023–2025 origins remain historical leads without comprehensive signed-off source timelines." | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:983` | REPO_EVIDENCE | Resolves verbatim. This sentence is the in-repo warrant for tagging all ZENIX chronology `REPORTED_HISTORY` rather than fact. |
| R6 | "**8 MOONWITNESS II eras** \| Narrative stages \| AGE CODE eras" and "8 eras vs AGE CODE four phases vs AETHERION \| Different narrative/time/game constructs \| Separate native IDs and units" | `MASTER_VISION_NARRATIVE_XV.md:469`, `:1147` | REPO_EVIDENCE | Both resolve. Disambiguation rules, not history and not implementation. |
| R7 | "AGE CODE calendars require method, units, epoch, uncertainty and source; no automatic extension of lifespan." | `MASTER_VISION_NARRATIVE_XV.md:497` | REPO_EVIDENCE | Resolves. Document policy with no enforcement code. |
| R8 | The repository contains no ZENIX or AGE CODE code, data model, schema, route or test. | whole tree | REPO_EVIDENCE | Confirmed: all 11 ZENIX occurrences and all 11 AGE CODE occurrences are in `TODO.md`, `docs/tasks/M26/M26-07.md`, `docs/vision/MASTER_VISION_NARRATIVE_XV.md`, `docs/data/M26-01-chapter-crosswalk.json`, `docs/audit/M26-01-chapter-crosswalk.md`. `git ls-files` matches only `docs/design/mockups-xv/02_project_universe.svg` and its PNG, which are unrelated art assets. |
| R9 | `BLUEPRINT.md` and the ratified ADRs neither mention ZENIX nor define AGE CODE. | `BLUEPRINT.md`; `docs/decisions/M06-02-xiv-v10-crosswalk.md`; `docs/decisions/M06-05-historical-interfaces-map.md` | REPO_EVIDENCE | 0 ZENIX matches in `BLUEPRINT.md`. M06-05's 4-row owner map lists Corpus/RGBL, Empire, A-L-L-A-H Hub and Rocksoul only. M06-02 assigns V10 chapters to `D07 Story & Media` as `INTERPRETATION / FICTION`. |
| H1 | "The archive presents a **three-year project legacy**. Dates for reconstructed ideas are not necessarily dates of first creation:" | `MASTER_VISION_NARRATIVE_XV.md:133` | REPORTED_HISTORY | Prose caveat. No dated artifact, manifest, release or third-party record supports a three-year span inside this repository. |
| H2 | "2023 — unrecorded/early \| Source material whose original timestamps or manuscripts are incomplete" | `MASTER_VISION_NARRATIVE_XV.md:137` | REPORTED_HISTORY | No 2023 artifact exists. The repository's root commit is dated 2026-10-26. |
| H3 | "2024 — ZENIX / ZENIVERSE \| ERP, Odoo/Fastify, integrations, geolocation, ISP tooling, SaaS, enterprise systems" | `MASTER_VISION_NARRATIVE_XV.md:138` | REPORTED_HISTORY | No ZENIX repository, URL, SHA, path, package, commit or dataset anywhere in the repository; absent from the M06-01 pin matrix. Phase year unverifiable. |
| H4 | "2025 — Universe / platform \| Metadata-driven models, APIs, auth, PostgreSQL, ORM, packages, workers, deployment, local AI" | `MASTER_VISION_NARRATIVE_XV.md:139` | REPORTED_HISTORY | "Universe" is never bound to a repository name, URL or SHA. The capability list describes a project family that is not present here. |
| H5 | "**Historical AGE CODE:** `T-2 MYTH AGE → T-1 AGE OF DARKNESS → T0 THE LIGHT (transition) → T1 AGE OF LIGHT`, with numbered role classes inside T1. This is a separately authored taxonomy." | `MASTER_VISION_NARRATIVE_XV.md:174` | REPORTED_HISTORY | Only this sentence exists. No source document, version, author or artefact is named, although `:113` requires preserving "its exact scope and version". |
| H6 | AGE CODE values "`19`, `under 40`, `40`, `40D40N`, `63 lunar`, `~64 lunar`, `100+`, `+15`, `950`, `969`, approximate `30`, `unknown` and RPG `33/100 levels`" | `MASTER_VISION_NARRATIVE_XV.md:485` | REPORTED_HISTORY | A prose list. The same line says "See the source's scripture-context warnings before displaying ages" but the source is never identified (L3). |
| H7 | "An earlier creative ontology used a `SHADOW` root and an `AGE OF LIGHT` class numbered `0 ALLAH` … **Preserve this as a historical/fictional taxonomy**, including its exact scope and version." | `MASTER_VISION_NARRATIVE_XV.md:113` | REPORTED_HISTORY | No artefact of that ontology is present; the scope/version it asks to preserve is not recorded (L4). |
| P1 | Slot 2 is mapped to source family `xiv-v10-chapters` (`bjo163/moonwitness-xiv`, path `docs/narrative/v10/`), `family_resolution: FAMILY_ONLY` | `docs/data/M26-01-chapter-crosswalk.json:32`, `:83-84` | DOC_ONLY_PLAN | Editorial mapping only: the family is XIV, not ZENIX, `per_slot_locator` is false, and the pin itself does not resolve (L5). |
| P2 | AGE CODE is a future XV registry/domain (slot 77) subject to method/units/epoch rules | `docs/data/M26-01-chapter-crosswalk.json:1264`; `MASTER_VISION_NARRATIVE_XV.md:497` | DOC_ONLY_PLAN | No model, table, schema, route, seed or test exists. Nothing to verify beyond the label. |
| P3 | "`moonships`, `mw-edge`, `mwx-isp`, prior ZENIX / ZENIVERSE code \| Desktop, edge/data, ISP and enterprise engineering \| Engineering heritage, not automatically new XV dependencies" | `MASTER_VISION_NARRATIVE_XV.md:652` | DOC_ONLY_PLAN | A policy statement inside the §19 "read-only research inputs" table (`:624-626`). No import is planned in code and no dependency is declared in any manifest. |
| P4 | "- [x] MOONWITNESS II original story cycle, eight-era family and AGE CODE kept distinct." | `MASTER_VISION_NARRATIVE_XV.md:1210` | DOC_ONLY_PLAN | A document self-check ("kept distinct" in prose). It asserts editorial separation, not a shipped capability, and creates no runtime artefact. |
| L1 | "prior ZENIX / ZENIVERSE code" | `MASTER_VISION_NARRATIVE_XV.md:652` | LOST_SOURCE_LEAD | Named with no URL, SHA or path. Not in `docs/audit/M06-01-source-repo-pins.md` (0 matches). `git remote -v` shows only `bjo163/moonwitnessxv`. Present in no local or remote branch, tag or pack object. |
| L2 | "`moonships`, `mw-edge`, `mwx-isp`" | `MASTER_VISION_NARRATIVE_XV.md:652` | LOST_SOURCE_LEAD | Bare names in the same cell; no repository address, no directory, package or manifest in the tree. |
| L3 | "See the source's scripture-context warnings before displaying ages." | `MASTER_VISION_NARRATIVE_XV.md:485` | LOST_SOURCE_LEAD | The "source" is never named; no AGE CODE source document, age table or calendar dataset exists in the repository. |
| L4 | "including its exact scope and version" (AGE OF LIGHT / SHADOW taxonomy) | `MASTER_VISION_NARRATIVE_XV.md:113` | LOST_SOURCE_LEAD | Neither scope nor version is recorded anywhere in the tree. |
| L5 | Family pin "`bjo163/moonwitness-xiv`", ref `99e1a4f028b37dc1`, path `docs/narrative/v10/` | `docs/audit/M06-01-source-repo-pins.md:17`, quoted in `docs/data/M26-01-chapter-crosswalk.json:32` | LOST_SOURCE_LEAD | `git cat-file -t 99e1a4f028b37dc1` → `fatal: Not a valid object name` (exit 128). A 16-hex prefix is not a resolvable commit; the path does not exist here. Consistent with the caveat already recorded in the M26-01 crosswalk. |
| L6 | `docs/knowledge/narratives/MASTER_NARRATIVE_V10_1_EXPANDED.md` @ `fff3b0dbc452e998f221e2ca15fd1d41e0ffc599` | `MASTER_VISION_NARRATIVE_XV.md:779`, `:853` | LOST_SOURCE_LEAD | `git cat-file -t fff3b0dbc452e998f221e2ca15fd1d41e0ffc599` → `fatal: git cat-file: could not get object info` (exit 128); `git ls-files` has no such path. |

**Ledger counts:** `REPO_EVIDENCE` 9 · `REPORTED_HISTORY` 7 · `DOC_ONLY_PLAN` 4 · `LOST_SOURCE_LEAD` 6 — total 26 claims.

---

## 3. Resolved vs unresolved references

**Resolved inside this repository**

| Reference | Status | Evidence |
|---|---|---|
| `docs/vision/MASTER_VISION_NARRATIVE_XV.md` (1,267 lines) | RESOLVED | read at `:113`, `:133-141`, `:174`, `:469`, `:485`, `:497`, `:624-663`, `:701-753`, `:963-985`, `:1147`, `:1210` |
| `docs/data/M26-01-chapter-crosswalk.json` | RESOLVED | slots 2 (`:73-91`), 3 (`:92-105`), 77 (`:1262-1275`); validator PASS |
| `docs/audit/M26-01-chapter-crosswalk.md` | RESOLVED | reading rules §4, limitations §6 (`:148` defers ZENIX history to this task) |
| `docs/decisions/M06-02-xiv-v10-crosswalk.md`, `M06-05-historical-interfaces-map.md` | RESOLVED | read in full; no ZENIX/AGE CODE content |
| `BLUEPRINT.md` | RESOLVED | 0 ZENIX matches; `:25` states historical snapshots may retain `apps/radio` and current paths take precedence |
| `packages/moonql/src/model.ts` | RESOLVED | exists (the narrative's `:1023` model claim has a live target) |
| `scripts/check-m26-01-crosswalk.mjs` | RESOLVED | executes and passes (§6) |

**Unresolved or absent**

| Reference | Status | Command and result |
|---|---|---|
| `bjo163/moonwitness-xiv` @ `99e1a4f028b37dc1` | UNRESOLVED | `git cat-file -t 99e1a4f028b37dc1` → fatal, exit 128 |
| `.../MASTER_NARRATIVE_V10_1_EXPANDED.md` @ `fff3b0d…` | ABSENT | `git cat-file -t fff3b0d…` → fatal, exit 128; `git ls-files` miss |
| ZENIX / ZENIVERSE / `moonships` / `mw-edge` / `mwx-isp` | ABSENT (no address at all) | `git remote -v` → only `moonwitnessxv`; `grep` finds 2 doc cells, nothing else |
| `apps/radio/src/app.ts` (narrative `:1021`, outside this task's scope) | ABSENT under that path | `test -e` → absent; `apps/arsy/src/app.ts` present. Covered by `BLUEPRINT.md:25` historical-snapshot wording. |
| `docs/narrative/v10/`, `spec/lore/13-functions.yaml`, `research/frameworks/srgbl.md`, `core/manifest.json`, `packages/mftl/manifest.json`, `patches/registry/33-patches.json`, `data/editions/quran-hafs.json` (all M06-01 pins) | ABSENT | `test -e` → absent for each; consistent with M26-01's "0 VERIFIED_SOURCE" finding |

No external repository was opened. Where a source is external, this audit reports only "named here, not resolvable here" and makes no statement about upstream content, history or existence.

---

## 4. Chronology caveats

- **The reported order is not a verified timeline.** The 2023 → 2024 → 2025 → 2026 sequence in `MASTER_VISION_NARRATIVE_XV.md:135-141` is narrative ordering. The same section warns that "Dates for reconstructed ideas are not necessarily dates of first creation" (`:133`), and `:983` states the ZENIX/2023–2025 origins lack "comprehensive signed-off source timelines".
- **Repository history cannot corroborate any of it.** Root commit `0e0b3b8de0b39d1fee01589e939cca0457af9566` is dated 2026-10-26 ("feat: initial commit for moonwitness-xv"); the branch has 368 commits, all on or after that date. There is no 2023/2024/2025 commit, tag or artefact.
- **Only authoring dates are observable.** `git log -S "ZENIX"` attributes every introduction of the string to documentation commits dated 2026-10-26 (`1877f51`, `43dfcde`, `7c13947`, `94047e8`) and 2026-10-28 (`4b0a872`). Those are dates this narrative was written, not dates of the events it describes.
- **AGE CODE era numbers are taxonomic, not calendrical.** `:174` numbers eras `T-2 … T1`; `:179` forbids translating an era number into calendar years, virtue, station or quest level; `:469` and `:1147` forbid equating the eight MOONWITNESS II eras with AGE CODE eras. Any future display must carry method, units, epoch and uncertainty (`:497`).
- **No ordering claim is upgraded by repetition.** The same phase table is restated in `docs/data/M26-01-chapter-crosswalk.json:73-105` as slot labels; that restatement is derived from `:706`, not independent evidence.

---

## 5. Rights, privacy and canon note

- **Reported history is not canon and not ownership proof.** A named phase, repository or taxonomy in the master narrative establishes only that XV's own document asserts it. `:155` states that workflow labels are not proof of a historical proposition; `:985` states that "final" means bounded decisions, "not a certification that all primary artifacts are recovered"; `:1002-1013` requires separate recordedness, epistemic, confidence, rights, publication and engineering axes.
- **Naming is not licensing.** ZENIX-era ERP, ISP, geolocation and SaaS work plausibly involves employer or client code and personal data. Nothing in this repository records a rights decision for it; its rights status remains `UNVERIFIED` under the `:1011` axis. `:153` states a public repository does not automatically carry permission for personal chats, private diaries, unlicensed translations or copyrighted media. Do not treat this audit's mention of ZENIX as permission to import, quote or publish any such material.
- **Private material stays out.** `:653` records that prior authored chat/visual/media manuscripts are "**Not imported** by this public synthesis; private archive permission gate". This audit quotes only lines already public in this repository and reproduces no private witness, credential, client or personal data.
- **AGE CODE is age data.** `:485` warns that chronological age, scripture-reported years, fictional appearance, lunar calculation, duration and aspiration are not interchangeable, and that ages must not be displayed without the source's scripture-context warnings. Any future implementation must treat AGE CODE values as possibly sensitive personal or scriptural claims, not as a scoring input.

---

## 6. Commands and observed output

Baseline and worktree (recorded first, before any reading):

```
$ git rev-parse HEAD
3b44d28d0abb0aa37fd5bde9a59a588ce3db2139
$ git rev-parse dev
3b44d28d0abb0aa37fd5bde9a59a588ce3db2139
$ git log --oneline -3
3b44d28 fix(dock): the DENPA deck stops claiming the hub reviews a transmission
15e4bc4 feat(dock): make the Constellation inspector a keyboard path with wrapped, contained chrome
a5f9b64 docs(todo): close M31-02, M25-03 and M26-01 at 4b0a872
$ git cat-file -t a5f9b64
commit
$ git status --porcelain -- docs/vision docs/data TODO.md docs/tasks docs/audit/M26-01-chapter-crosswalk.md
(no output — audited paths clean)
```

Mention enumeration (generated output excluded):

```
$ grep -rniIl --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=build "zenix" .
./docs/audit/M26-01-chapter-crosswalk.md
./docs/data/M26-01-chapter-crosswalk.json
./docs/tasks/M26/M26-07.md
./docs/vision/MASTER_VISION_NARRATIVE_XV.md
./TODO.md
$ grep -rniIo ... "zenix" . | wc -l
11
$ grep -rniIwo ... "AGE CODE" . | wc -l
11
```

Method note: the first `AGE CODE` count used `grep -o "AGE CODE"` without a word boundary and returned 20, because the substring matches inside `languageCode`/`language code`. The quoted figures use `-w`; without it the measurement over-counts.

Absence checks:

```
$ grep -rniI --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build -n "zenix\|AGE CODE" apps packages
(no ZENIX or AGE CODE hit; only unrelated languages.ts / direction-inference assertions)
$ git ls-files | grep -iE "age[-_]?code|zenix|zeniverse|universe"
docs/design/mockups-xv/02_project_universe.svg
docs/design/mockups-xv/png/02_project_universe.png
```

Reference resolution:

```
$ git cat-file -t 99e1a4f028b37dc1
fatal: Not a valid object name 99e1a4f028b37dc1          (exit 128)
$ git cat-file -t fff3b0dbc452e998f221e2ca15fd1d41e0ffc599
fatal: git cat-file: could not get object info            (exit 128)
$ git remote -v
origin  https://github.com/bjo163/moonwitnessxv.git (fetch)
origin  https://github.com/bjo163/moonwitnessxv.git (push)
$ git rev-list --max-parents=0 HEAD
0e0b3b8de0b39d1fee01589e939cca0457af9566
$ git rev-list --count HEAD
368
$ git log --all --oneline -S "ZENIX"
4b0a872 docs(milestones): map gateway journeys, HELIOGRID questions and chapter crosswalk
94047e8 docs(xv): ship 38 milestone contexts and small-agent leaf task packets
7c13947 docs(todo): complete XV 28 milestones 196 task register and dependency QA
43dfcde docs(vision): deepen XV master with source-pinned repository and narrative audit v1.1
1877f51 docs(vision): consolidate MoonWitness XV master vision and cross-repository research
$ git log --all --oneline --grep="ZENIX" -i
(no output)
$ for p in packages/moonql/src/model.ts apps/radio/src/app.ts apps/arsy/src/app.ts docs/narrative/v10 ...; do test -e "$p" && echo PRESENT $p || echo ABSENT $p; done
PRESENT packages/moonql/src/model.ts
ABSENT  apps/radio/src/app.ts
PRESENT apps/arsy/src/app.ts
ABSENT  docs/narrative/v10
ABSENT  spec/lore/13-functions.yaml
ABSENT  research/frameworks/srgbl.md
ABSENT  core/manifest.json
ABSENT  packages/mftl/manifest.json
ABSENT  patches/registry/33-patches.json
ABSENT  data/editions/quran-hafs.json
```

Positive test (every locator in the ledger resolves; the prerequisite data still validates):

```
$ node scripts/check-m26-01-crosswalk.mjs
PASS slots=1-99 unique rows=99 labels_match_source=99/99
PASS statuses VERIFIED_SOURCE=0 LABEL_ONLY=65 NEEDS_SOURCE=34
PASS zero VERIFIED_SOURCE rows without a named source_locator (no manuscript claimed)
PASS no duplicate labels silently merged
```

Negative test (absent or unresolvable input fails safely instead of being asserted):

```
$ git cat-file -t 99e1a4f028b37dc1   → fatal: Not a valid object name (exit 128)
$ git cat-file -t fff3b0d…           → fatal: could not get object info (exit 128)
```

Both failures are recorded as `LOST_SOURCE_LEAD`/absent; no SHA, date, author or upstream content was substituted, and no external network fetch was attempted.

---

## 7. Verdict on the acceptance criterion

**Reported history vs repo evidence clearly tagged — SATISFIED at `3b44d28`.**

Every ZENIX, early-Universe and AGE CODE mention in the repository (11 + 11 occurrences, 5 and 4 files respectively) is carried by a ledger row with an explicit tag, an exact `file:line`, and a recorded verification result. The split is unambiguous: 9 claims are checkable repository facts, 7 are prose assertions about a past outside this repository, 4 are document-only plans, and 6 are named-but-absent sources. Because the repository contains **zero** ZENIX/AGE CODE implementation artifacts, there is no code path that could silently promote a reported history claim into a product behaviour; and because the M26-01 crosswalk already marks slot 2 `NEEDS_SOURCE` with the `:983` caveat quoted, downstream consumers inherit the same caution.

**Result: READY-TO-CLOSE.**

No ZENIX, early-Universe or AGE CODE claim was found presented elsewhere as verified fact. Two adjacent, out-of-scope risks are recorded rather than treated as blockers for M26-07:

1. `MASTER_VISION_NARRATIVE_XV.md:1021` asserts "XV `apps/radio/src/app.ts` actually boots MoonQL once" as an inspection result; that path is now absent (`apps/arsy/src/app.ts` exists). `BLUEPRINT.md:25` already governs historical-snapshot paths, so this is a stale-path citation, not an unlabelled historical claim, and it belongs to a code-inventory task rather than M26-07.
2. `docs/audit/M06-01-source-repo-pins.md` is headed "PINNED & RATIFIED" while carrying 16-hex refs that cannot resolve (L5). M26-01 already declined to treat them as `VERIFIED_SOURCE`; this audit corroborates that, and the correction belongs to M06, not M26-07.

---

## 8. Limitations

1. **No external verification.** No ZENIX, ZENIVERSE, XIV or XII repository was fetched, opened or inspected. "Unresolved" means *not resolvable from this repository*, not *proven nonexistent upstream*.
2. **Reported history is taken at face value as a report.** This audit establishes what the repository says and whether it can check itself; it cannot establish what happened in 2023–2025.
3. **Slot 77 looks under-flagged.** `AGE CODE` is `LABEL_ONLY` with empty `gap_evidence`, although the only AGE CODE material (`:174`, `:485`) cites a source that is neither named nor present, and no age table exists. Under M26-01's own rule (`NEEDS_SOURCE` requires an explicit "unrecovered" sentence), `LABEL_ONLY` is defensible, but a reviewer may reasonably expect a gap note. Recorded here; the crosswalk data was not modified.
4. **Search is literal.** Variants of the AGE CODE idea that never use the string (for example "era", "lunar age", "age registry") were not exhaustively swept; only `40D40N`, `MYTH AGE`, `AGE OF LIGHT`, `ZENIVERSE`, `moonships`, `mw-edge`, `mwx-isp` were spot-checked, each appearing only in the cited lines.
5. **Generated output excluded.** `.next/`, `dist/` and `node_modules/` contain incidental matches (for example bundled UI strings); they were excluded as build artefacts, not evidence.
6. **Not a rights decision.** Tags here are evidentiary. They do not clear, license or reject any historical material; the `:1011` rights axis still governs.
7. **Scope.** This closes only the ZENIX/Universe/AGE CODE/lost-source tagging acceptance of M26-07. It does not close M26-02, M26-03 (BATTERIES recovery), M26-04 (ZILL/Honey aliases) or M26-06, and it does not change any TODO status.

## 9. Rollback

Additive documentation only. Delete this file and the tree returns to the audited state:

```
rm docs/audit/M26-07-zenix-age-code-audit.md
```
