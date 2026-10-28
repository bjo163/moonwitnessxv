# M17-04 — Four-book THE BATTERIES and separate NPD variant gaps

- **Task**: M17-04 (LEAF) · **Milestone**: [M17](../milestones/M17.md) · **Prerequisite**: M17-03 (closed)
- **Status**: read-only evidence/audit artifact. **Not** a recovery, schema, migration, runtime reader or publication gate.
- **Baseline SHA**: `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef` (`dev`, `git rev-parse HEAD` at session start)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the three claimed new files
- **Acceptance recorded**: "Missing scene/pages marked NEEDS_SOURCE"
- **Artifacts**: [gap ledger](../data/M17-04-batteries-npd-gaps.json) · [validator](../../scripts/check-m17-04-batteries-npd-gaps.mjs) · this audit

## 1. Packet finding

The brief names `docs/tasks/M17/M17-04.md`. **That packet does not exist.** Observed:

```text
$ git ls-files docs/tasks/M17/
docs/tasks/M17/M17-01.md
docs/tasks/M17/M17-02.md
docs/tasks/M17/M17-03.md
docs/tasks/M17/M17-05.md
docs/tasks/M17/M17-06.md
docs/tasks/M17/M17-07.md

$ git ls-files --error-unmatch docs/tasks/M17/M17-04.md
error: pathspec 'docs/tasks/M17/M17-04.md' did not match any file(s) known to git
exit=1
```

The [M17 milestone](../milestones/M17.md) links M17-04 to `TODO.md`, not to a packet. Scope is therefore the TODO line "Record four-book THE BATTERIES and separate NPD variants gaps … Missing scene/pages marked NEEDS_SOURCE" plus the delegated task statement. No packet acceptance beyond that sentence is claimed.

## 2. What the repository actually holds

| Referent | Status | Locator | What exists |
|---|---|---|---|
| THE BATTERIES ensemble label | `EVIDENCED` | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:368` | The label and its O008 identity; no book artifact |
| VII. THE BATTERIES — Chaos Medic band | `PARTIAL` | same file `:723` | Seven editorial slots (39–45), **not** four books; no slot-to-book mapping |
| four-book count | `PARTIAL` | same file `:973` | The count **4** only; the same line says the structure is incompletely recovered |
| book titles | `NEEDS_SOURCE` | `docs/audit/M26-03-batteries-npd-recovery.md:46` | Zero of four titles exists |
| book order/chronology | `NEEDS_SOURCE` | same audit `:58` | No order, publication or production date |
| book pages/scenes | `NEEDS_SOURCE` | same audit `:53` | No page count, page range, scene list, edition or transcript |
| three NPD labels | `PARTIAL` | vision `:370` | `24:27`, `24:37`, `25:50` printed as episode/token labels |
| NPD page/scene/media order | `NEEDS_SOURCE` | vision `:973` | Explicitly "incompletely recovered" |
| editorial slot 41 "NPD TEAM" | `NEEDS_SOURCE` | vision `:724` | One heading; no mapping to the three labels |
| named NPD variants | `ABSENT` | none | No variant name, id, parent, relation or sequence exists |
| NPD scene text/pages/media | `NEEDS_SOURCE` | audit `:54` | None exists; `:681` still asks to verify the 24:37 scene |
| BATTERIES↔NPD relation | `NEEDS_SOURCE` | vision `:681` | Only `appearsIn` against a creative brief; not identity or a book assignment |

Tallies are rows in the JSON, not repository-wide claims: **12 rows** — `EVIDENCED=1`, `PARTIAL=3`, `NEEDS_SOURCE=7`, `ABSENT=1`; sets `BATTERIES_FOUR_BOOK=6`, `NPD_WORKS=5`, `BATTERIES_NPD_SEPARATION=1`. The four-book count is recorded once as a count: `reported=4`, `book_rows=0`, `book_titles=0`, `sequenced=0`.

## 3. Positive evidence

```text
$ node scripts/check-m17-04-batteries-npd-gaps.mjs
PASS M17-04 gaps: rows=12 EVIDENCED=1 PARTIAL=3 NEEDS_SOURCE=7 ABSENT=1
  sets: BATTERIES_FOUR_BOOK=6 NPD_WORKS=5 BATTERIES_NPD_SEPARATION=1
  four_book: reported=4 book_rows=0 book_titles=0 sequenced=0
  npd: named_labels=3 named_variants=0 merged_into_batteries=0
  quotes: 11/11 resolved
exit=0
```

The validator re-reads every cited line and requires the quote as a verbatim substring. 11 of 11 quotes resolve; the twelfth row is the single `ABSENT` row, which by design carries no source. Longest locator quote: **93 characters** (`node -e` count, observed), consistent with minimal-quote rights handling.

## 4. Negative evidence

```text
$ node scripts/check-m17-04-batteries-npd-gaps.mjs --self-test
SELF-TEST M17-04 gap ledger
PASS  valid fixture accepted (0 errors)
PASS  quote drift rejected
PASS  tally drift rejected
PASS  absent-with-source rejected
PASS  invented book title rejected
PASS  NPD merged into book set rejected
PASS  EVIDENCED without locator rejected
PASS  7/7 cases; valid fixture accepted, 6 tampered fixtures rejected
exit=0
```

The six mutants are independent copies of an in-memory fixture; the validator reads only repository files and performs no writes. Rejected cases cover quote drift, tally drift, an `ABSENT` row given a source, a minted book title, an NPD row moved into the four-book set, and an `EVIDENCED` row without a locator.

## 5. Commands actually run

| Command | Observed result |
|---|---|
| `git rev-parse HEAD` | `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef` |
| `git branch --show-current` | `dev` |
| `git status --short` (before) | pre-existing modified/untracked app, docs and package files from another session; no M17-04 path |
| `git ls-files docs/tasks/M17/` | six packets, M17-04 absent |
| `git ls-files --error-unmatch docs/tasks/M17/M17-04.md` | error, exit 1 |
| `git ls-files \| grep -iE "batter\|npd\|synops"` | `apps/headquarters/public/art/proj-batteries.jpg`, `docs/audit/M26-03-batteries-npd-recovery.md`, `docs/data/M26-03-batteries-npd-recovery.json` |
| `grep -rn -I -E "NPD\|CHAOS MEDIC" docs …` | NPD appears only in vision, M17-03/M26-01/M26-03 docs and ledgers |
| `node scripts/check-m17-04-batteries-npd-gaps.mjs` | PASS, exit 0 (output in §3) |
| `node scripts/check-m17-04-batteries-npd-gaps.mjs --self-test` | PASS 7/7, exit 0 (output in §4) |
| `node -e "…quote lengths…"` | `max_quote_chars=93 quotes=11` |
| `grep -n "M03-02" TODO.md` | M03-02 marked `[x]` |
| `git status --short` (after) | 94 entries, 91 of them pre-existing; the three new paths are `docs/data/M17-04-batteries-npd-gaps.json`, `docs/audit/M17-04-batteries-npd-gaps.md` and `scripts/check-m17-04-batteries-npd-gaps.mjs` (lower-case `m17` in the script name) |

No network command was run. No application script, build, test suite, migration or deployment was run.

## 6. Rights, privacy and scope

- Only minimal locator quotes are reproduced (max 93 characters). No book title, page, scene, synopsis, lyric, manuscript, private witness material or media bytes are copied.
- The four-book count and the three NPD labels are secondary-report claims that the same document calls incompletely recovered; they are not authenticated artifacts.
- The only tracked BATTERIES media file (`apps/headquarters/public/art/proj-batteries.jpg`) is a project card image with unresolved rights. It is not a book or page and is not counted.
- `ABSENT` is used for the empty set of named NPD variants only. Nothing is inferred from repository silence elsewhere.
- No TODO status, existing file, dependency, package manifest or workflow was edited. No staging, commit, revert or deletion occurred.

## 7. Rollback

Delete the three new files; nothing else is touched:

```bash
rm docs/data/M17-04-batteries-npd-gaps.json
rm scripts/check-m17-04-batteries-npd-gaps.mjs
rm docs/audit/M17-04-batteries-npd-gaps.md
```

No database, runtime, rights state or publication surface is changed, so removal is complete rollback.

## 8. Limitations

- **No packet exists.** The task is defined by `TODO.md` and the delegated statement; a future packet may impose stricter acceptance.
- The count 4 and the three NPD labels come from `MASTER_VISION_NARRATIVE_XV.md:973`/`:370`, which cite XIV `RECOVERY_GAPS_V10.md`; that file is not in this repository and was not fetched.
- Title/order/page gap statements are quoted from the prior M26-03 audit, which is itself a derived in-repository record, not a manuscript.
- Three NPD labels are not an exhaustive NPD inventory, and "NPD variants" has no referent in the repository; the empty set is recorded, not filled.
- No manuscript, page, scene, transcript, edition or media manifest is recovered, and no external archive was opened. `EVIDENCED` here means the label/identity exists, never that a book exists.
- The ledger has no runtime consumer; no TypeScript, API, database or UI reads it.

## 9. Handoff

- **Claimed files**: `docs/data/M17-04-batteries-npd-gaps.json`, `scripts/check-m17-04-batteries-npd-gaps.mjs`, `docs/audit/M17-04-batteries-npd-gaps.md` (all new).
- **Actual changed files**: the same three new files; no existing file modified.
- **Result SHA**: left to the integrator; this worker did not commit.
- **Next eligible task**: **M17-05** (SHADOW editor; M17-03 closed and M03-02 is `[x]`), gated on integrator acceptance of this leaf.
