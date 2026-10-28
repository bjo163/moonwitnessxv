# M26-03 — Recover four THE BATTERIES books, NPD scenes, 15 synopsis sources

- **Task**: M26-03 (LEAF) · **Milestone**: [M26](../milestones/M26.md) · **Prerequisite**: M26-01 (closed)
- **Declared baseline SHA**: `a5f9b6422c77f12f0ce8dd7d89de7e0b0d0363a7` (`dev`)
- **Observed worktree HEAD**: `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139` (`dev`, two commits after the declared baseline; `a5f9b64` is an ancestor)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the claimed files
- **Claimed files**: `docs/data/M26-03-batteries-npd-recovery.json` (new), `scripts/check-m26-03-recovery.mjs` (new), this audit (new)
- **Acceptance tested**: "Missing pages, chronology and rights explicitly recorded"

## 1. Result

**READY-TO-CLOSE for the recorded acceptance.** Every one of the 22 target artifacts has an explicit row; every row states page coverage, chronology and rights; 19 rows have no source locator and are marked `NEEDS_SOURCE`; the three named NPD labels have a locator but are marked `REPORTED_ONLY` because the locator is a vision report, not a manuscript.

**No book, scene or synopsis is recovered.** Zero rows are `EVIDENCED`, zero rows have page text, and zero rows are marked `RECOVERED`. The ledger records absence, not recovery. If the integrator reads the task title "Recover" as requiring manuscripts, this leaf is **NOT-CLOSABLE**: the specific gap is that no THE BATTERIES book, NPD scene or XII synopsis exists in the repository and no external archive was opened. The acceptance sentence itself is met.

| `claim_state` | Rows | Meaning applied |
|---|---:|---|
| `EVIDENCED` | **0** | an artifact-level page, scene text, transcript or primary record is locatable in-repo |
| `REPORTED_ONLY` | **3** | the label is named only in a derived XV report that says the original is missing |
| `NEEDS_SOURCE` | **19** | no locator names the individual artifact; only a count or generic gap statement exists |
| **Total** | **22** | 4 books + 3 named NPD works + 15 synopses |

Other declared tallies, all validator-checked: `by_kind` book 4 / scene 3 / synopsis 15 / variant 0; `by_rights` `RIGHTS_UNKNOWN` 22; `by_page_status` `NOT_RECOVERED` 22; `by_chronology_status` `UNRECORDED` 19 / `LABEL_ONLY` 3; `by_recovery_state` `NOT_RECOVERED` 22.

## 2. What the repository actually evidences

All quotations below are exact substrings of the cited line; the validator re-checks them at run time.

- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:973` — "**THE BATTERIES four-book narrative structure** and exact NPD page/scene/media order remain incompletely recovered. NPD 24:27, 24:37 and 25:50 are different works."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:974` — "XII's **15 story archive synopsis entries** and **63 editorially reconstructed pages** are **not** 15 guaranteed original transcripts or 63 authenticated image originals."
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:370` — "Episodes/tokens include **NPD TEAM 24:27**, **24:37 — TARIAN KIDS**, **25:50 — TARIAN HUJAN** … Preserve source versions, timestamp-like labels, sequence …"
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:681` — "`THE BATTERIES` | `appearsIn` | NPD TEAM 24:37 | Creative-brief source; verify scene"
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1071` — "Metadata-only; don't fabricate four missing books"
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1127` — "Missing originals of four-book BATTERIES/NPD | Creative archiving was only at title level | Media/scripts revision match + rights"
- `TODO.md:419` (M17-04, still open, **no packet file**) — "Record four-book THE BATTERIES and separate NPD variants gaps | … | Missing scene/pages marked NEEDS_SOURCE"
- `TODO.md:599` — the M26-03 task line and acceptance quoted at the top of this audit.
- `docs/data/M26-01-chapter-crosswalk.json:681,719` — M26-01 already records the four-book structure and NPD page/scene/media order as incompletely recovered.
- `packages/moonql-ontology/src/seed.ts:243-248` — `THE BATTERIES` exists only as a reviewed `ACTOR` entity: "A fictional band inside the MoonWitness creative universe." Identity is seeded; content is not.
- `BLUEPRINT.md:220` — "`THE BATTERIES ≠ ALLAH`" and the artifact/work/edition/passage distinction that forbids treating a label as a manuscript.

No source text accompanies any of these. `docs/vision/MASTER_VISION_NARRATIVE_XV.md:635` and `:775` point at the external `moonwitness-II` and `moonwitness-xii-season-global-championships` repositories, but record no per-artifact path and were **not fetched** (see §7).

## 3. Why zero rows are EVIDENCED

- The only NPD strings are **labels** in a vision report that itself says the "exact NPD page/scene/media order remain[s] incompletely recovered" (`:973`), and one relation row that says "verify scene" (`:681`). A label plus a verification warning is not evidence of the scene.
- The four books have **no individual titles anywhere**. Only the count "four-book narrative structure" (`:973`), the P1 gap "Missing originals of four-book BATTERIES/NPD" (`:1127`) and TODO M17-04 (`:419`) exist. A count is not four identifiable artifacts.
- The 15 synopses have **no titles, text or sequence**. `:974` records a count and immediately denies that it implies 15 original transcripts.
- No D07 story/media package exists (`ls packages | rg -i "story|media"` → no output). `git ls-files | rg -ic "batter|npd|synops"` → `1`, and that one tracked file is `apps/headquarters/public/art/proj-batteries.jpg`, a card image whose rights are recorded `UNRESOLVED` / `EXCLUDED-FROM-PRODUCTION` at `docs/audit/ui-asset-ledger-d54ad43.md:68`. `git log --all --diff-filter=A --name-only` also yields exactly one such path, so no story manuscript was ever added and deleted.

## 4. Explicit missing inventory

### Pages / coverage
- Four books: `page_status = NOT_RECOVERED` for each. No title, page count, page range, scene list, edition or transcript exists.
- Three named NPD works: `NOT_RECOVERED`. No page, scene text or media manifest; `:973` says page/scene/media order is incomplete; `:681` says the 24:37 scene still needs verification.
- Fifteen synopses: `NOT_RECOVERED`. `:974` gives only the count; the related "63 editorially reconstructed pages" are also explicitly not authenticated originals.

### Chronology
- Four books: `UNRECORDED`. No publication dates, production dates or book order.
- NPD: `LABEL_ONLY`. `24:27`, `24:37`, `25:50` are "timestamp-like labels" (`:370`), but `:973` says the order is incompletely recovered and the three are different works. The labels are not verified release times.
- Synopses: `UNRECORDED`. No per-entry date, season order or sequence number.

### Rights
- All 22 rows: `RIGHTS_UNKNOWN` under the [M06-06](docs/decisions/M06-06-rights-classification.md) vocabulary. No licence, edition, clearance or consent record exists for any book, scene or synopsis. M06-06 then restricts them to `METADATA_ONLY` and flags text `NEEDS_SOURCE`.
- Note: [ADR-0003](docs/decisions/ADR-0003-source-rights-and-consent.md) §2.1 uses a different `rightsStatus` enum (`PUBLIC_DOMAIN` / `LICENSED` / `RESTRICTED_METADATA_ONLY`). This ledger uses the M06-06 vocabulary as instructed; M07-04's publication gate keys on `RIGHTS_EXACT_VERSION_CLEARED`.
- The only BATTERIES media file in Git (`proj-batteries.jpg`) has unresolved rights and is excluded from production per the UI asset ledger; this ledger makes no claim about it.

## 5. Commands and observed outputs

### Baseline and worktree

```
$ git rev-parse --abbrev-ref HEAD ; git rev-parse a5f9b64 ; git rev-parse HEAD
dev
a5f9b6422c77f12f0ce8dd7d89de7e0b0d0363a7
3b44d28d0abb0aa37fd5bde9a59a588ce3db2139
$ git merge-base --is-ancestor a5f9b64 HEAD && echo "a5f9b64 IS ancestor of HEAD"
a5f9b64 IS ancestor of HEAD
$ git diff --stat a5f9b64..HEAD -- docs/vision/MASTER_VISION_NARRATIVE_XV.md TODO.md docs/tasks/M26/M26-03.md docs/decisions/M06-06-rights-classification.md docs/decisions/M06-02-xiv-v10-crosswalk.md docs/decisions/M06-03-ii-lore-recovery.md
(no output: every cited evidence file is identical at a5f9b64 and 3b44d28)
$ git status --porcelain | wc -l
72        # pre-existing other-session entries at task start
77        # after this task's 2 data/script files plus 3 more added concurrently by that session
78        # final check: the other session added one more file; this task still contributes 3
```

The only M26-03 paths in `git status` are this task's three new files; no tracked file, TODO entry or pre-existing change was modified.

### Discovery

```
$ git ls-files | rg -i "batter|npd|synops|episode|scene"
apps/headquarters/public/art/proj-batteries.jpg
apps/orbit/src/components/spatial/OrbitScene.tsx
apps/orbit/test/orbit-spatial-scene.test.mjs
docs/audit/M40-03-spatial-scene-fixtures.md
$ git ls-files | rg -ic "batter|npd|synops"
1
$ git log --all --pretty=format: --name-only --diff-filter=A | sort -u | rg -ic "batter|npd|synops"
1
$ ls packages | rg -i "story|media"
(no output; no D07 story/media package)
$ test -f docs/tasks/M17/M17-04.md
M17-04 packet absent
```

`OrbitScene.tsx` and its test are a spatial UI scene, not a story scene. The sole name-matching asset is the unresolved `proj-batteries.jpg`.

```
$ rg -n "four-book narrative structure|15 story archive synopsis|NPD 24:27, 24:37" docs/vision/MASTER_VISION_NARRATIVE_XV.md
973:- **THE BATTERIES four-book narrative structure** and exact NPD page/scene/media order remain incompletely recovered. NPD 24:27, 24:37 and 25:50 are different works.
974:- XII's **15 story archive synopsis entries** and **63 editorially reconstructed pages** are **not** 15 guaranteed original transcripts or 63 authenticated image originals.
```

### Positive check

```
$ node scripts/check-m26-03-recovery.mjs
PASS rows=22 unique ids=22
PASS claim states EVIDENCED=0 REPORTED_ONLY=3 NEEDS_SOURCE=19
PASS kinds book=4 scene=3 synopsis=15 variant=0
PASS rights RIGHTS_UNKNOWN=22 of 22 (M06-06 vocabulary)
PASS chronology UNRECORDED=19 LABEL_ONLY=3
PASS page status NOT_RECOVERED=22 of 22
PASS 49 locator quotes resolved at the cited file:line
PASS zero EVIDENCED rows without a primary-artifact source_locator
PASS declared counts match rows; book 1-4 and synopsis 1-15 series complete
NOTE zero rows recovered: labels and reports are not manuscripts
exit=0
```

The checker resolves every row and evidence locator against the real file, requires the quoted substring on that exact line, and rejects a row whose `source_locator` is not repeated in quote-verified evidence.

### Negative check

```
$ node scripts/check-m26-03-recovery.mjs --self-test
PASS  negative: EVIDENCED row without source_locator is rejected
      first error: row batteries-book-01 claims EVIDENCED without source_locator
PASS  negative: EVIDENCED row with a locator line outside the file is rejected
      first error: row batteries-book-01 evidence[0] locator line 99999 is outside docs/vision/MASTER_VISION_NARRATIVE_XV.md lines 1-1268
PASS  negative: EVIDENCED row with a quote absent from the cited line is rejected
      first error: row batteries-book-01 evidence[0] quote "THE BATTERIES ARE FULLY RECOVERED" not found at TODO.md:419
PASS  negative: EVIDENCED row marked NOT_RECOVERED is rejected
      first error: row batteries-book-01 claims EVIDENCED but recovery_state is NOT_RECOVERED
PASS  negative: rights_status outside the M06-06 vocabulary is rejected
      first error: row batteries-book-01 rights_status "PUBLIC_DOMAIN" is not in M06-06 vocabulary RIGHTS_EXACT_VERSION_CLEARED|RIGHTS_UNKNOWN|PRIVATE_WITNESS|MISSING_MEDIA
PASS  negative: redefined rights_enum is rejected
      first error: rights_enum does not match the M06-06 rights vocabulary
PASS  negative: duplicate id is rejected
      first error: duplicate id batteries-book-01
PASS  negative: misdeclared total is rejected
      first error: declared total 23 !== rows 22
PASS  negative: misdeclared claim-state tally is rejected
      first error: declared by_claim_state.REPORTED_ONLY=4 !== rows 3
PASS  negative: misdeclared kind tally is rejected
      first error: declared by_kind.synopsis=14 !== rows 15
PASS  negative: misdeclared rights tally is rejected
      first error: declared by_rights.RIGHTS_UNKNOWN=21 !== rows 22
PASS  negative: NEEDS_SOURCE row carrying a source_locator is rejected
      first error: row xii-synopsis-01 is NEEDS_SOURCE but carries source_locator "TODO.md:419"
PASS  negative: REPORTED_ONLY row pointing at a primary artifact is rejected
      first error: row npd-24-27 claims REPORTED_ONLY but locator_kind is "PRIMARY_ARTIFACT"
PASS  negative: evidenced title_status with a null title is rejected
      first error: row batteries-book-01 claims an evidenced title but title is null
PASS  negative: unknown kind is rejected
      first error: row batteries-book-01 kind "manuscript" is not in book|scene|synopsis|variant
PASS  negative: book without a series_index is rejected
      first error: book batteries-book-01 series_index must be a positive integer
PASS  negative: duplicate book series_index is rejected
      first error: book series_index has duplicates
SELF-TEST PASS: all 17 invalid datasets rejected
exit=0
```

### Lint and parse

```
$ pnpm exec eslint scripts/check-m26-03-recovery.mjs
exit=0
$ node -e "JSON.parse(require('fs').readFileSync('docs/data/M26-03-batteries-npd-recovery.json','utf8')); console.log('JSON parse OK')"
JSON parse OK
```

`pnpm verify`, `pnpm typecheck` and application test suites were **not** run: the change is two documentation/data artifacts plus one dependency-free Node script, with no TypeScript or application code change.

## 6. Limitations

- **No external archive was opened.** The vision names `moonwitness-II` and `moonwitness-xii-season-global-championships`, but this task performed no network fetch. Nothing is claimed about their current contents, and no pin/path is recorded for a specific book or synopsis.
- **Reports and labels are not manuscripts.** `EVIDENCED` is deliberately zero. The NPD rows point at a report line, not at a scene. The four book ids and fifteen synopsis ids are ledger-local placeholders, not source titles or catalogue numbers.
- **No page counts can be stated.** Because no original exists in-repo, "missing pages" can only be recorded as `NOT_RECOVERED` plus the absence of any page count/title, not as specific missing ranges.
- **Counts are claims by a secondary document.** Four books and fifteen synopses are repeated from `MASTER_VISION_NARRATIVE_XV.md:973-974`, which itself cites XIV `RECOVERY_GAPS_V10.md`; that file is not in this repository.
- **Three NPD labels are not an exhaustive scene inventory.** Only the three works named at `:370` are rows. Other NPD scenes may exist without a label here.
- **No variants row.** `:973` says the three named NPD works are different works, so none is classified `variant`; no named variant exists. M17-04's "NPD variants" gap remains open and has no packet.
- **Rights are evidentiary, not legal.** `RIGHTS_UNKNOWN` is the M06-06 classification for unconfirmed provenance; this audit does not decide ownership.
- **HEAD drift.** Evidence was read at `3b44d28`, not the declared `a5f9b64`; the cited files are byte-identical at both SHAs (`git diff --stat` empty), so the drift does not affect the evidence.

## 7. Rollback

Additive only. Delete the three new files; no tracked file, migration or schema change is involved:

```
rm docs/data/M26-03-batteries-npd-recovery.json
rm scripts/check-m26-03-recovery.mjs
rm docs/audit/M26-03-batteries-npd-recovery.md
```

Do not remove `docs/data/`: it also holds the M26-01 ledger.

## 8. Required report fields

- `task_id`: M26-03
- `baseline_sha`: `a5f9b6422c77f12f0ce8dd7d89de7e0b0d0363a7` (declared); observed HEAD `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139`
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: the three files above
- `actual_changed_files`: the three files above (all new); pre-existing other-session changes untouched
- `positive_test_and_output`: §5, 9 PASS + 1 NOTE, 49 locators verified, exit 0
- `negative_test_and_output`: §5, 17/17 invalid datasets rejected, exit 0
- `security_rights_privacy`: no source text, media bytes or private material copied; all rows restrict to `RIGHTS_UNKNOWN` / metadata-only; no network fetch
- `reviewer`: pending (integrator)
- `rollback`: §7
- `result_sha`: n/a (not committed)
- `limitations`: §6
- `next_eligible_task`: M17-04 (four-book/NPD gap record, no packet yet) or an authorized archive retrieval against the pinned external repositories; M26-04 and M26-06 are independent.
