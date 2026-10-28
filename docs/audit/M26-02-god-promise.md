# M26-02 — Recover 00-MAIN GOD PROMISE distinct from ROCKSOUL/paper

- **Task**: M26-02 (LEAF) · **Milestone**: [M26](../milestones/M26.md) · **Prerequisite**: M06-06
- **Declared baseline SHA**: `659da2855f56c61ae9d21e2995be9649c77fc470` (`dev`)
- **Observed worktree HEAD**: `e76df8b0931f7553615e7eb693084c2d36d39e55` (`dev`; `659da28` is an ancestor; three commits after baseline)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the claimed files
- **Claimed files**: `docs/data/M26-02-god-promise.json`, `scripts/check-m26-02-god-promise.mjs`, this audit (all created by this task; committed concurrently by an integrator session at `f841db5`)
- **Acceptance tested**: "Different originals not automatically merged"

## 1. Result

**The recorded acceptance is evidenced; closure is the integrator's decision.** The ledger holds three explicit originals — `00-MAIN GOD PROMISE`, `GOD PROMISE: THE ROCKSOUL` and the academic `GOD-PROMISE MOONWITNESS — Monocentric 1·6·3` paper — as 16 single-origin evidence rows. Every row names the other two origins in `distinct_from`, all three separation pairs are `distinctFrom` with `merge_permitted: false`, and all three forbidden merges are `allowed: false`. The validator rejects any row that tries to hold two origins.

After the ledger and audit were produced, a concurrent integrator session committed the three files at `f841db5` and rewrote the TODO M26-02 row at `e76df8b`. This worker ran no `git add`, `git commit` or TODO edit; the closure is not claimed here. Because that rewrite removed the acceptance sentence from `TODO.md:598`, the ledger now pins the acceptance quote to the stable task packet, `docs/tasks/M26/M26-02.md:12`.

**No manuscript was recovered.** Zero rows are `EVIDENCED`, zero primary artifacts are registered, and zero rows are `RECOVERED`. Nine rows are `NEEDS_SOURCE` because the repository itself says the originals are missing, private, unimported or unreviewed; seven are `LABEL_ONLY` because only an index label or name entry exists. The task title says "Recover", but the repository contains no text to recover, and the audit does not pretend otherwise. The acceptance sentence — different originals are not automatically merged — is met and machine-checked.

| `claim_state` | Rows | Meaning applied |
|---|---:|---|
| `EVIDENCED` | **0** | primary manuscript/original text registered and quote-verified |
| `LABEL_ONLY` | **7** | title, index entry or name only; no availability claim |
| `NEEDS_SOURCE` | **9** | repository says the primary is missing, private, unimported, unreviewed, or only a non-manuscript reference exists |
| **Total** | **16** | 6 MAIN + 5 ROCKSOUL + 5 paper |

Other declared and validator-checked tallies: `by_origin` `ORIGIN_00_MAIN` 6 / `ORIGIN_ROCKSOUL` 5 / `ORIGIN_PAPER_163` 5; `by_locator_kind` `LABEL_INDEX` 6 / `GAP_NOTE` 7 / `SECONDARY_REPORT` 1 / `PIN_RECORD` 1 / `EDITORIAL_DESCRIPTION` 1; `by_recovery_state` `NOT_RECOVERED` 16. All three origins are `RIGHTS_UNKNOWN` under the M06-06 vocabulary.

## 2. Method

1. Recorded branch, HEAD and working-tree state; confirmed `659da28` is an ancestor of the observed HEAD.
2. Searched the whole working tree, case-insensitively, for `god[ -]?promise|rocksoul|00[ -]main`, including docs, data ledgers, decisions, tasks, mockups, application code, packages, scripts and fixtures.
3. Counted matching lines per file (23 files, 141 lines) and classified each file in `mention_inventory`.
4. Built one row per evidentiary mention, with one `origin_id`, exact `file:line` locator and a quote that the validator must find on that line.
5. Recorded explicit separation assertions only where a repository sentence supports one; marked the ROCKSOUL-versus-paper pair as an inference.
6. Recorded absence separately (`absence_checks`) and left `primary_artifacts` empty.
7. Ran the dependency-free validator in positive and negative (`--self-test`) modes.

The search was repository-only. No external repository, archive, private handoff or network source was opened.

## 3. Findings

All quotations below are exact substrings of the cited line; the validator re-checks them at run time.

| ID | Origin | State | Locator | Evidence |
|---|---|---|---|---|
| `gp-00-main-label-vision-118` | MAIN | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:118` | "`00-MAIN GOD PROMISE` **distinct from**" |
| `gp-00-main-label-vision-715` | MAIN | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:715` | "19 The Original GOD-PROMISE" |
| `gp-00-main-gap-vision-972` | MAIN | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:972` | "`00-MAIN GOD PROMISE` and `GOD PROMISE: THE ROCKSOUL` original lines" … "require independent identity and revision review" |
| `gp-00-main-gap-vision-981` | MAIN | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:981` | "GOD-PROMISE MAIN, MOONDANCE, Mercy × 3, AL-HAKIM and Signal Collection" … "missing primary work that must be located before any original-copy publication" |
| `gp-00-main-gap-crosswalk-356` | MAIN | `NEEDS_SOURCE` | `docs/data/M26-01-chapter-crosswalk.json:356` | "00-MAIN GOD PROMISE original lines require independent identity and revision review." |
| `gp-00-main-map-audit-60` | MAIN | `LABEL_ONLY` | `docs/audit/M26-01-chapter-crosswalk.md:60` | "`00-MAIN GOD PROMISE` → slot 19" … "Family-to-slot mapping is editorial." |
| `gp-rocksoul-label-vision-118` | ROCKSOUL | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:118` | "`GOD PROMISE: THE ROCKSOUL` and from the academic" |
| `gp-rocksoul-label-vision-718` | ROCKSOUL | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:718` | "27 GOD PROMISE: THE ROCKSOUL" |
| `gp-rocksoul-gap-vision-972` | ROCKSOUL | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:972` | "`GOD PROMISE: THE ROCKSOUL` original lines" |
| `gp-rocksoul-gap-crosswalk-478` | ROCKSOUL | `NEEDS_SOURCE` | `docs/data/M26-01-chapter-crosswalk.json:478` | "GOD PROMISE: THE ROCKSOUL original lines require independent identity and revision review." |
| `gp-rocksoul-pin-m12-8` | ROCKSOUL | `NEEDS_SOURCE` | `docs/decisions/M12-01-rocksoul-boundaries.md:8` | "Pinned legacy source" … "(MFTL manifest)" |
| `gp-paper-label-vision-118` | PAPER | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:118` | "academic `GOD-PROMISE MOONWITNESS` 1·6·3 paper." |
| `gp-paper-label-vision-189` | PAPER | `LABEL_ONLY` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:189` | "**GOD-PROMISE MOONWITNESS** proposes a conceptual **Monocentric 1·6·3**" |
| `gp-paper-gap-vision-972` | PAPER | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:972` | "academic 1·6·3 draft require independent identity and revision review" |
| `gp-paper-private-vision-1237` | PAPER | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1237` | "GOD-PROMISE MOONWITNESS — Monocentric 1·6·3" … "their original private bytes are not copied here" |
| `gp-paper-description-vision-1017` | PAPER | `NEEDS_SOURCE` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1017` | "The original GOD-PROMISE paper replaces crude" |

### 3.1 How the separation is stated

- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:118` — "`00-MAIN GOD PROMISE` **distinct from** `GOD PROMISE: THE ROCKSOUL` and from the academic `GOD-PROMISE MOONWITNESS` 1·6·3 paper." This is the only sentence that names all three together and separates them.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:684` — "`00-MAIN GOD PROMISE` | `distinctFrom` | `GOD PROMISE: THE ROCKSOUL` | Competing original manuscripts". The candidate-edge matrix forbids merging them.
- `BLUEPRINT.md:228` — "`00-MAIN GOD PROMISE`, `GOD PROMISE: THE ROCKSOUL` and 1·6·3 research paper." It appears in the "Keep different" list.
- `BLUEPRINT.md:232` — "NEVER turn similarity of names, numbers, sounds, nicknames or rhetorical symbolism into `sameAs` automatically." The ledger therefore approves no `sameAs` claim.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:972` — the original lines of the first two and the academic draft "require independent identity and revision review".

The ROCKSOUL-versus-paper pair has **no standalone sentence**. It is inferred from two facts: both are listed under "Keep different" at `BLUEPRINT.md:228`, and `MASTER_VISION_NARRATIVE_XV.md:118` separates each of them from `00-MAIN`. The ledger says so in `sep-rocksoul-vs-paper.note`; this is an inference, not a quotation.

### 3.2 What each original actually is in the repository

- **`00-MAIN GOD PROMISE` (MAIN)** — a name in the vision's name-constitution section, a single slot label ("19 The Original GOD-PROMISE") in the 99-chapter index, and a recovery-gap subject called `GOD-PROMISE MAIN`. No title page, author, page, edition, date or text.
- **`GOD PROMISE: THE ROCKSOUL` (ROCKSOUL)** — a name in the same constitution, slot 27 in the 99-chapter index under the ROCKSOUL band, and a gap subject. The only pinned Rocksoul source is an **MFTL manifest** (`M12-01:8`, `M06-01:22`), which is not this original. The many other ROCKSOUL hits refer to the historical ecosystem of tools, assets and research families (`MASTER_VISION_NARRATIVE_XV.md:105`, `M19-01`), not to the manuscript.
- **`GOD-PROMISE MOONWITNESS — Monocentric 1·6·3` (PAPER)** — called the academic 1·6·3 paper and a prior private research handoff. The vision paraphrases its thesis (`:189`, `:1017`) but states at `:1237` that the original private bytes were not copied. No file, DOI, edition or quotation exists.

## 4. Explicit missing inventory

- **Manuscripts / original lines:** none. `primary_artifacts` is empty; no row is `EVIDENCED`; no row is `RECOVERED`.
- **Paper draft:** not in the repository. The only statement about its bytes is that they are not copied (`:1237`).
- **Pages / counts / dates:** not recorded for any of the three. The repository supplies no page count, table of contents, edition date or revision history.
- **Rights:** `RIGHTS_UNKNOWN` for all three. No licence, clearance or consent record exists.
- **Source pin:** no `GOD PROMISE` or `00-MAIN` row in the M06-01 pin table. The Rocksoul pin names an MFTL manifest, not the manuscript.
- **Code / fixtures:** zero references in `apps/`, `packages/` or `scripts/` to any of the three names.

## 5. Absence checks

| ID | Probe | Observed |
|---|---|---|
| `ABS_NO_MANUSCRIPT_FILENAME` | `git ls-files \| rg -i "god\|promise\|rocksoul\|00-main"` | 2 paths, neither a manuscript: `apps/arsy/test/ecosystem-god-tier.test.ts`, `docs/decisions/M12-01-rocksoul-boundaries.md` |
| `ABS_NO_HISTORY_MANUSCRIPT` | `git log --all --pretty=format: --name-only --diff-filter=A \| sort -u \| rg -i ...` | 2 paths (the same test at its pre-rename `apps/radio/` path, and the M12-01 decision); no manuscript ever added and deleted |
| `ABS_NO_CODE_REFERENCE` | grep over `apps packages scripts` for `*.{ts,tsx,js,mjs,json,yml,yaml,css}` | 0 matching files; corroborated by `M19-01:25` "Zero code references" |
| `ABS_NO_GOD_PROMISE_SOURCE_PIN` | inspect M06-01 pin table and M12-01 pin | no GOD PROMISE/00-MAIN row; Rocksoul pin is `packages/mftl/manifest.json` |
| `ABS_NO_PRIMARY_ARTIFACT_REGISTERED` | inspect `primary_artifacts` | 0 entries |
| `ABS_PRIVATE_BYTES_NOT_IN_REPO` | `MASTER_VISION_NARRATIVE_XV.md:1237` | "their original private bytes are not copied here" |

## 6. Mention survey

The case-insensitive survey found **23 pre-existing files / 141 matching lines**. Classification in `mention_inventory`:

| Class | Files | Matching lines |
|---|---:|---:|
| `ORIGINAL_EVIDENCE` | 1 (`MASTER_VISION_NARRATIVE_XV.md`) | 60 |
| `SECONDARY_ANALYSIS` | 3 (M26-01 JSON and audit, M26-04 JSON) | 24 |
| `FAMILY_CONTEXT` | 12 (README, M06-01, M06-07, M12 typed graph, M16-01, M19-01, ADR-0003, M02-05, M02-07, M06-05, M12-01, M16-01 spec) | 42 |
| `ARCHITECTURE_CONSTRAINT` | 1 (`BLUEPRINT.md`) | 4 |
| `TASK_SPECIFICATION` | 2 (`TODO.md`, `docs/tasks/M26/M26-02.md`) | 7 |
| `MOCKUP_LABEL` | 1 (`02_project_universe.svg`) | 1 |
| `INCIDENTAL_NAME` | 3 (M26-07, UI audit, ADR-0007) | 3 |
| **Total** | **23** | **141** |

The mockup hit is the word `ROCKSOUL` inside a card labelled "CONCEPT · NO INVENTED PROGRESS" (`docs/design/mockups-xv/02_project_universe.svg:18`); it is a label, not a source. ADR-0007's hit is the rejected name `rocksoul-assets`; M26-07's hit is an owner-map row. Neither says anything about the three originals.

## 7. Commands and observed outputs

### Baseline, drift and worktree

At task start the worktree was on `dev` at `659da28`. A concurrent session then committed M31-03 work; an integrator session subsequently committed this task's three files at `f841db5` and closed the TODO row at `e76df8b`. This worker ran no Git write command.

```
$ git rev-parse --abbrev-ref HEAD ; git rev-parse HEAD
dev
e76df8b0931f7553615e7eb693084c2d36d39e55
$ git merge-base --is-ancestor 659da2855f56c61ae9d21e2995be9649c77fc470 HEAD && echo "659da28 IS ancestor of HEAD"
659da28 IS ancestor of HEAD
$ git log --oneline 659da28..HEAD
e76df8b docs(todo): close M26-02 at the separation ledger
f841db5 docs(m26): record GOD PROMISE separation evidence
dfc6556 docs(todo): close M31-03 at the accepted Dock runtime decision
f4c18ca docs(m31): accept Dock as the LIGHTHOUSE gateway runtime
$ git diff --stat 659da28..HEAD -- <cited evidence files>
 TODO.md | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
$ git status --porcelain | wc -l
78        # at this task's first count: pre-existing other-session entries plus 2 new files
99        # final recount: other sessions added further entries; this task now has 2 modified tracked files
$ git status --porcelain -- docs/data/M26-02-god-promise.json scripts/check-m26-02-god-promise.mjs docs/audit/M26-02-god-promise.md
 M docs/audit/M26-02-god-promise.md
 M docs/data/M26-02-god-promise.json
```

The two `TODO.md` changes are M31-03 at line 700 and M26-02 at line 598. The M26-02 closure rewrote the acceptance cell, so the acceptance quote is now pinned to `docs/tasks/M26/M26-02.md:12` instead of `TODO.md:598`. That packet line is unchanged at both SHAs. No other cited evidence file differs between `659da28` and the observed HEAD, and the validator resolves all quotes at the final worktree.

The ledger and audit edits shown as modified are post-commit accuracy fixes made by this worker (the acceptance re-pin and the observed-output corrections); the validator ran clean after them. The `scripts/` file is unchanged since `f841db5`.

### Discovery

```
$ rg -ni "god[ -]?promise|rocksoul|00[ -]main" --hidden -g '!node_modules' -g '!.git' -l | wc -l
23
$ rg -ci "god[ -]?promise|rocksoul|00[ -]main" --hidden -g '!node_modules' -g '!.git' | awk -F: '{s+=$NF} END {print s}'
141
$ git ls-files | rg -i "god|promise|rocksoul|00-main"
apps/arsy/test/ecosystem-god-tier.test.ts
docs/decisions/M12-01-rocksoul-boundaries.md
$ git log --all --pretty=format: --name-only --diff-filter=A | sort -u | rg -i "god|promise|rocksoul|00-main"
apps/radio/test/ecosystem-god-tier.test.ts
docs/decisions/M12-01-rocksoul-boundaries.md
$ rg -ni "god[ -]?promise|rocksoul|00-main" apps packages scripts -g '*.{ts,tsx,js,mjs,json,yml,yaml,css}' -l
(no output; 0 matching files)
```

`ecosystem-god-tier.test.ts` is an ecosystem-tier test, not a God-Promise manuscript. `M12-01-rocksoul-boundaries.md` is a ratified decision about Rocksoul domain boundaries.

### Positive check

```
$ node scripts/check-m26-02-god-promise.mjs
PASS rows=16 unique ids=16
PASS claim states EVIDENCED=0 LABEL_ONLY=7 NEEDS_SOURCE=9
PASS origins ORIGIN_00_MAIN=6 ORIGIN_ROCKSOUL=5 ORIGIN_PAPER_163=5
PASS locator kinds LABEL_INDEX=6 GAP_NOTE=7 SECONDARY_REPORT=1 PIN_RECORD=1 EDITORIAL_DESCRIPTION=1
PASS 3/3 separation assertions are distinctFrom; 3/3 forbidden merges are disabled
PASS 23 mention-inventory files / 141 matching lines recounted
PASS 35 locator quotes resolved at the cited file:line
PASS zero EVIDENCED rows without a registered primary artifact (registered=0)
PASS declared counts match rows; 0 manuscripts recovered
NOTE labels, editorial descriptions and gap notes are not originals
exit=0
```

The checker resolves every row, separation, acceptance, origin and absence locator against the real file, requires the quoted substring on that exact line, and recounts the mention inventory from the files themselves.

### Negative check

```
$ node scripts/check-m26-02-god-promise.mjs --self-test
PASS  negative: EVIDENCED row without a registered primary artifact is rejected
      first error: row gp-00-main-label-vision-715 claims EVIDENCED without a registered primary artifact
PASS  negative: EVIDENCED row referencing an unregistered primary artifact is rejected
      first error: row gp-00-main-label-vision-715 references unregistered primary artifact "PA-GOD-PROMISE-01"
PASS  negative: row carrying a merged origin id list is rejected
      first error: row gp-00-main-label-vision-715 merges 2 origins into one row; record separate rows instead
PASS  negative: row with an origin_id array is rejected
      first error: row gp-00-main-label-vision-715 origin_id ["ORIGIN_00_MAIN","ORIGIN_ROCKSOUL"] is not a single declared origin
PASS  negative: row whose distinct_from omits an origin is rejected
      first error: row gp-00-main-label-vision-715 distinct_from must name exactly the other two origins
PASS  negative: row declaring same_as is rejected
      first error: row gp-00-main-label-vision-715 carries a same_as claim "ORIGIN_ROCKSOUL"; no sameAs claim is approved
PASS  negative: row with an unknown origin id is rejected
      first error: row gp-00-main-label-vision-715 origin_id "ORIGIN_UNKNOWN" is not a single declared origin
PASS  negative: separation assertion permitting merge is rejected
      first error: separation[0] merge_permitted must be false
PASS  negative: forbidden merge marked allowed is rejected
      first error: forbidden_merges[0] must set allowed=false
PASS  negative: missing separation pair is rejected
      first error: separation_assertions has 2 entries; expected 3 pair assertions
PASS  negative: separation quote absent from the cited line is rejected
      first error: separation[0] evidence[0] quote "00-MAIN AND ROCKSOUL ARE ONE MANUSCRIPT" not found at docs/vision/MASTER_VISION_NARRATIVE_XV.md:684
PASS  negative: duplicate row id is rejected
      first error: duplicate id gp-00-main-label-vision-118
PASS  negative: misdeclared total is rejected
      first error: declared total 17 !== rows 16
PASS  negative: misdeclared claim-state tally is rejected
      first error: declared by_claim_state.NEEDS_SOURCE=10 !== rows 9
PASS  negative: misdeclared origin tally is rejected
      first error: declared by_origin.ORIGIN_PAPER_163=6 !== rows 5
PASS  negative: misdeclared locator-kind tally is rejected
      first error: declared by_locator_kind.GAP_NOTE=8 !== rows 7
PASS  negative: mention-inventory count that does not match the file is rejected
      first error: mention_inventory.files[0] declared 5 matching lines but BLUEPRINT.md has 4
PASS  negative: missing mention-inventory file is rejected
      first error: mention_inventory.files[23] file docs/data/does-not-exist-god-promise.json does not exist
PASS  negative: acceptance quote absent from the cited line is rejected
      first error: acceptance quote "All three originals recovered" not found at docs/tasks/M26/M26-02.md:12
PASS  negative: redefined claim_state_enum is rejected
      first error: claim_state_enum does not match the ledger vocabulary
PASS  negative: LABEL_ONLY row carrying a primary artifact id is rejected
      first error: row gp-00-main-label-vision-715 is LABEL_ONLY but carries primary_artifact_id "PA-GOD-PROMISE-01"
PASS  negative: row locator line outside the file is rejected
      first error: row gp-00-main-label-vision-715 evidence[0] locator line 99999 is outside TODO.md lines 1-908
PASS  negative: row quote absent from the cited line is rejected
      first error: row gp-00-main-label-vision-715 evidence[0] quote "ALL THREE ORIGINALS ARE ONE MANUSCRIPT" not found at docs/vision/MASTER_VISION_NARRATIVE_XV.md:715
PASS  negative: absence check without a statement is rejected
      first error: absence[0] statement is empty
PASS  negative: flipped no-manuscript-recovered assertion is rejected
      first error: assertions.no_manuscript_recovered must be true
SELF-TEST PASS: all 25 invalid datasets rejected
exit=0
```

### Parse and lint

```
$ node -e "JSON.parse(require('fs').readFileSync('docs/data/M26-02-god-promise.json','utf8')); console.log('JSON parse OK')"
JSON parse OK
$ pnpm exec eslint scripts/check-m26-02-god-promise.mjs
exit=0
$ git diff --stat -- docs/data/M26-02-god-promise.json scripts/check-m26-02-god-promise.mjs docs/audit/M26-02-god-promise.md
(no output at the pre-commit run: all three files were new and untracked)
```

`pnpm verify`, `pnpm typecheck` and application test suites were **not** run: the change is two documentation/data artifacts plus one dependency-free Node script, with no TypeScript, runtime or application code change.

## 8. Explicit non-claims

- No manuscript, original lines, paper draft or primary artifact of any of the three originals was recovered.
- A label in the 99-chapter index is not a chapter, edition or manuscript.
- The ROCKSOUL ecosystem, the ROCKSOUL family name and the Rocksoul MFTL manifest are not the `GOD PROMISE: THE ROCKSOUL` original.
- Shared themes, shared 1·6·3 numbering and ROCKSOUL family membership do not establish identity between the three originals.
- This audit does not decide authorship, ownership, rights or legal status.
- The pairwise separation of ROCKSOUL from the paper is inferred from two repository statements; it is not a single quoted sentence.
- No external archive, private handoff or network source was consulted.

## 9. Limitations

- **No external archive was opened.** The vision mentions the prior private handoff and external repositories, but this task performed no fetch. Nothing is claimed about their current contents.
- **Titles come from prose.** `00-MAIN GOD PROMISE`, `GOD PROMISE: THE ROCKSOUL` and `GOD-PROMISE MOONWITNESS — Monocentric 1·6·3` are names used by repository documents, not verified title pages or catalogue records.
- **No page, date, edition, language or revision history** can be stated.
- **The mention inventory is a snapshot.** It counts matching lines in pre-existing text files at the observed HEAD and excludes the three files this task creates. It will drift if those files change.
- **One pair is inferred.** No repository sentence says "ROCKSOUL is distinct from the paper" as a standalone claim; see §3.1.
- **Rights are evidentiary, not legal.** All three originals remain `RIGHTS_UNKNOWN`.
- **HEAD drift and concurrent closure.** The survey was read at `dfc6556`, two commits after the declared `659da28`; an integrator then committed the three files at `f841db5` and closed the TODO row at `e76df8b`. `659da28` is an ancestor. The only cited-file changes are the M31-03 and M26-02 TODO rows; the acceptance quote is pinned to the unchanged task packet, and the validator confirms every quote resolves at the final worktree.
- **The closure was not performed here.** This worker made no `git add`, `git commit`, `git stash`, checkout or reset, and did not edit `TODO.md`. The ledger and this audit carry uncommitted post-commit accuracy edits.
- **The committed ledger still has the old acceptance locator.** `git show HEAD:docs/data/M26-02-god-promise.json` at `e76df8b` still pins acceptance to `TODO.md:598`, whose text the closure rewrote. The re-pin to `docs/tasks/M26/M26-02.md:12` exists only in the worktree because this task may not commit. The integrator must commit the two modified files before treating HEAD as validator-clean.
- **Concurrent worktree.** Other-session changes under `apps/cockpit`, `apps/dock`, `apps/headquarters` and `docs/audit/screens` were present and untouched; none contains a God-Promise reference.

## 10. Rollback

Additive only. Delete the three files; no other tracked file, migration, schema or TODO entry is involved. The three were untracked when created and were committed concurrently at `f841db5`, so a rollback after that commit is a normal deletion commit:

```
rm docs/data/M26-02-god-promise.json
rm scripts/check-m26-02-god-promise.mjs
rm docs/audit/M26-02-god-promise.md
```

Do not remove `docs/data/`: it also holds the M26-01, M26-03 and M26-04 ledgers.

## 11. Required report fields

- `task_id`: M26-02
- `baseline_sha`: `659da2855f56c61ae9d21e2995be9649c77fc470` (declared); observed HEAD `e76df8b0931f7553615e7eb693084c2d36d39e55`
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: the three files above
- `actual_changed_files`: the three files above (created by this task; committed concurrently at `f841db5`); pre-existing other-session changes untouched
- `positive_test_and_output`: §7, 9 PASS + 1 NOTE, 35 locators verified, exit 0
- `negative_test_and_output`: §7, 25/25 invalid datasets rejected, exit 0
- `security_rights_privacy`: no manuscript text, private bytes, media or secrets copied; only short public-document quotes; no network fetch; all origins remain `RIGHTS_UNKNOWN`
- `reviewer`: integrator session closed the TODO row at `e76df8b`; no independent reviewer identity was observed by this worker
- `rollback`: §10
- `result_sha`: `f841db5` (commit containing the three files, made by the integrator session); worktree HEAD `e76df8b` also carries this worker's uncommitted accuracy edits to the ledger and audit
- `limitations`: §9
- `next_eligible_task`: M26-06 (independent); archive retrieval would need separate authorization and a pinned source
