# M26-01 — Crosswalk 99 chapter labels to actual source versions

- **Task**: M26-01 (LEAF) · **Milestone**: [M26](../milestones/M26.md) · **Prerequisite**: M06-02 (closed)
- **Baseline SHA**: `a54198bd04705ba191c79e0bd1b36584a885622a` (`dev`)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the claimed files
- **Claimed files**: `docs/data/M26-01-chapter-crosswalk.json` (new), `scripts/check-m26-01-crosswalk.mjs` (new), this audit
- **Acceptance tested**: "All slots indexed without falsely claiming 99 manuscripts"

## 1. Result

**READY-TO-CLOSE.** Slots 1–99 are indexed from the single in-repository label source, every row carries a status, and **zero** rows claim `VERIFIED_SOURCE`. The crosswalk states, in machine-readable form, that a label is not a manuscript and that 99 labels are not 99 originals. Only the integrator may check the TODO leaf.

| Status | Rows | Meaning |
|---|---:|---|
| `VERIFIED_SOURCE` | **0** | manuscript/edition/source version named with a per-slot locator |
| `LABEL_ONLY` | **65** | label exists in the editorial index; no source version named |
| `NEEDS_SOURCE` | **34** | label exists and a repository document records the slot subject as unrecovered, ambiguous or disputed |
| **Total** | **99** | unique slots 1–99, no padding |

`NEEDS_SOURCE` slots: 2, 11, 13–16, 19, 20, 27, 31–35, 38–46, 49, 57, 58, 74, 78–80, 84, 85, 88, 89.

## 2. Where the 99 labels actually live

The only 99-label source in the repository is `docs/vision/MASTER_VISION_NARRATIVE_XV.md` §21, "The 99-chapter archival master index (V10 preserved)" (lines 701–753), in 16 bands:

| Band | Lines | Slots |
|---|---|---|
| I Three-year legacy | 706 | 01–04 |
| II Original MoonWitness | 709 | 05–10 |
| III Me and My Crew | 712 | 11–18 |
| IV GOD-PROMISE Core Research | 715 | 19–26 |
| V ROCKSOUL | 718 | 27–31 |
| VI The Heart and the Name | 721 | 32–38 |
| VII THE BATTERIES — Chaos Medic | 724 | 39–45 |
| VIII Personal Witness Stories | 727 | 46–51 |
| IX Comparative and Spiritual Arcs | 730 | 52–58 |
| X The Forgotten | 733 | 59–62 |
| XI Science and Time | 736 | 63–69 |
| XII Empire Organization | 739 | 70–75 |
| XIII Human Journey and Patches | 742 | 76–83 |
| XIV Remaining Archives | 745 | 84–90 |
| XV Integrity Constitution | 748 | 91–98 |
| XVI Epilogue | 751 | 99 |

No V10/V10.1 chapter file, manuscript or edition exists in this repository. `git ls-files` returns 7 tracked paths matching `v10|narrative|chapter`, all of them XV documents (`docs/decisions/M06-02-xiv-v10-crosswalk.md`, `docs/vision/MASTER_VISION_NARRATIVE_XV.md`, `docs/vision/chapters/*.md`) — no source text.

## 3. What "source version" evidence exists (and why no row is VERIFIED)

- `docs/audit/M06-01-source-repo-pins.md:17` pins the *family*: `bjo163/moonwitness-xiv`, ref `99e1a4f028b37dc1`, path `docs/narrative/v10/`, class `EDITORIAL_CHAPTERS`.
- `docs/audit/M06-07-source-crosswalk-queue.md:15` records the same family as "99 Chapters · Editorial Only".
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:779` and `:853` cite a **different** path at a **different, full** SHA: `docs/knowledge/narratives/MASTER_NARRATIVE_V10_1_EXPANDED.md` @ `fff3b0dbc452e998f221e2ca15fd1d41e0ffc599`.
- `:971` states "Full private V1–V10 originals … have **not** been imported. V10.1 is a public-safe expansion, not verbatim original."
- `docs/decisions/M06-02-xiv-v10-crosswalk.md:11-13` classifies the 99 chapters as modern editorial writing, not primary revelation or manuscripts; §3 keeps ambiguous chapters at `NEEDS_SOURCE`.

A family pin with a truncated 16-hex ref, a path that contradicts another in-repo citation, and an explicit "not verbatim original" statement cannot satisfy `VERIFIED_SOURCE`, which requires a named manuscript/edition/source version **with a per-slot locator**. Hence 0 verified rows. This is the core protection against falsely claiming 99 manuscripts.

## 4. Status assignment rules (applied, not inferred per label)

- `LABEL_ONLY`: default. The label is an index entry; nothing more is named.
- `NEEDS_SOURCE`: only where a repository sentence explicitly names the slot subject or its band as unrecovered/ambiguous/disputed. Each row quotes that sentence in `gap_evidence.locator` (file:line) and `.note`. Mapping a named family to a slot is editorial (e.g. `00-MAIN GOD PROMISE` → slot 19); the audit says so rather than presenting it as attested identity.
- No label was invented, renamed, split or merged. Duplicate labels do not exist; the checker fails if one appears without an explicit `duplicate_label_ack`.

Evidence used for the 34 flags: `MASTER_VISION_NARRATIVE_XV.md:961` (patch #033 chat-only), `:972` (GOD-PROMISE/1·6·3 originals), `:973` (BATTERIES four-book structure, NPD order), `:975` (Kingslayer posters), `:976` (patch #014 dispute), `:977` (SHADOW/A LAH/DOGS/BLUE WITCH/WALTER aliases), `:978` (ZILL origins), `:979` (MYLUFT/MA'LŪF/HONEY/QUEEN R/Al-Wadūd), `:980` (Tick-Tock, MOONRIDLEY), `:981` (Signal Collection), `:982` (MAHSYAR, AD-DEEN, Ghost in Machine, KADO), `:983` (ZENIX origins), and `docs/audit/M26-05-empire-taxonomy-audit.md:60` (no 99-name Asma list in repo).

## 5. Commands and observed outputs

Discovery (baseline recorded first):

```
$ git rev-parse --abbrev-ref HEAD ; git rev-parse HEAD
dev
a54198bd04705ba191c79e0bd1b36584a885622a
$ git status --porcelain | wc -l
72        # at first count: 70 pre-existing entries by another session + 2 new files of this task
          # later 75 (57 modified + 18 untracked) as that session kept editing; none touched here
```

```
$ rg -l "99-chapter|99 chapter|99 editorial chapter" -g '!node_modules' -g '!*.png'
BLUEPRINT.md
TODO.md
docs/vision/MASTER_VISION_NARRATIVE_XV.md
docs/vision/chapters/README.md
docs/tasks/M17/M17-03.md
docs/tasks/M26/M26-01.md
docs/audit/M26-05-empire-taxonomy-audit.md
docs/decisions/M02-01-disambiguation-registry.md
docs/decisions/M02-06-document-hierarchy.md
docs/decisions/M06-02-xiv-v10-crosswalk.md
docs/audit/M06-01-source-repo-pins.md
docs/audit/M06-07-source-crosswalk-queue.md
```

```
$ git ls-files | rg -ic "v10|narrative|chapter"
7
$ rg -n "V10 / 99 Chapters|V10 Narrative" docs/audit/
docs/audit/M06-01-source-repo-pins.md:17: ...
docs/audit/M06-07-source-crosswalk-queue.md:15: ...
```

Positive check:

```
$ node scripts/check-m26-01-crosswalk.mjs
PASS slots=1-99 unique rows=99 labels_match_source=99/99
PASS statuses VERIFIED_SOURCE=0 LABEL_ONLY=65 NEEDS_SOURCE=34
PASS zero VERIFIED_SOURCE rows without a named source_locator (no manuscript claimed)
PASS no duplicate labels silently merged
exit=0
```

The checker re-parses §21 and requires every JSON label and `label_source` line to be byte-identical to the source, so a fabricated or drifted label fails.

Negative checks (mutated in memory, no files written):

```
$ node scripts/check-m26-01-crosswalk.mjs --self-test
PASS  negative: VERIFIED_SOURCE with empty source_locator is rejected
      first error: slot 1 claims VERIFIED_SOURCE without source_locator
PASS  negative: VERIFIED_SOURCE with locator but no source_version is rejected
PASS  negative: duplicate slot is rejected
PASS  negative: padded extra row is rejected
PASS  negative: fabricated label that is not in the source is rejected
PASS  negative: missing status is rejected
PASS  negative: NEEDS_SOURCE without gap_evidence is rejected
PASS  negative: misdeclared counts are rejected
PASS  negative: duplicate label silently merged is rejected
SELF-TEST PASS: all invalid datasets rejected
exit=0
```

```
$ pnpm exec eslint scripts/check-m26-01-crosswalk.mjs
exit=0
```

No application source, package manifest, TODO entry or pre-existing worktree change was modified. `pnpm verify`, `pnpm typecheck` and the app test suites were **not** run: the change is documentation plus one dependency-free Node script, and no app code or TypeScript changed.

## 6. Limitations

- **Labels are not manuscripts.** This crosswalk indexes labels only. It does not recover, quote, or authenticate any chapter text.
- **The external source family was not opened.** The pin is a truncated ref with a conflicting path; no network fetch was performed, so nothing is claimed about the upstream repository beyond what XV documents say.
- **Family-to-slot mapping is editorial.** Where `00-MAIN GOD PROMISE` was mapped to slot 19, or `AD-DEEN` to slot 85, the note is quoted but the identification is a human-editorial judgement, not an attested identity.
- **Under-flagged neighbours.** Slot 86 mentions Mahsyar but is not the separately named `MAHSYAR COVENANT` slot 84; slot 12 is adjacent to the "runaways" era but is not named in the alias gap. These were left `LABEL_ONLY` rather than over-claiming a gap.
- **Unassigned global gaps.** XII's 15 synopses / 63 reconstructed pages (`:974`), alternate endings, and "Astronomy Festival" (`:982`) have no unambiguous slot and are recorded here rather than forced onto a row.
- **Not a rights decision.** Statuses are evidentiary, not legal. M06-06/ADR rights classification still governs publication.
- **Scope.** This closes only the indexing/source-claim acceptance of M26-01, not M26-03 (BATTERIES recovery), M26-04 (ZILL/Honey aliases) or M26-07 (ZENIX history).

## 7. Rollback

Additive only; delete the three new files and the tree returns to baseline `a54198b` for this task:

```
rm docs/data/M26-01-chapter-crosswalk.json
rm scripts/check-m26-01-crosswalk.mjs
rm docs/audit/M26-01-chapter-crosswalk.md
rmdir docs/data   # only if empty
```

No migration, schema, runtime or tracked-file revert is required.

## 8. Required report fields

- `task_id`: M26-01
- `baseline_sha`: `a54198bd04705ba191c79e0bd1b36584a885622a`
- `worker`: repository-evidence leaf (AI agent)
- `claimed_files`: the three files above
- `actual_changed_files`: the three files above (all new)
- `positive_test_and_output`: §5, 4/4 PASS, exit 0
- `negative_test_and_output`: §5, 9/9 rejected, exit 0
- `security_rights_privacy`: no source text or private material copied; statuses add restrictions, none relax them
- `reviewer`: pending (integrator)
- `rollback`: §7
- `result_sha`: n/a (not committed; `--self-test` and lint were run on the working tree)
- `limitations`: §6
- `next_eligible_task`: M26-03 (BATTERIES/NPD recovery) and M26-04 (ZILL/alias reconciliation) are unblocked by this index but each needs its own source evidence.
