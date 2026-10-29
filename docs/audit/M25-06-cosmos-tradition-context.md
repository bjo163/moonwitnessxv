# M25-06 — Comparative-cosmos tradition context (evidence)

| Required report field | Value |
|---|---|
| `task_id` | M25-06 |
| `baseline_sha` | `b3479e6991831b759d842fbe753fe8c30d233792` |
| `baseline_branch` | `dev` |
| `worker` | single-owner leaf worker (research ledger + validator + evidence) |
| `claimed_files` | `docs/data/M25-06-cosmos-tradition-context.json`; `scripts/check-m25-06-cosmos-tradition-context.mjs`; `docs/audit/M25-06-cosmos-tradition-context.md` |
| `actual_changed_files` | the same three files, all new/untracked; no tracked file, TODO, manifest, package, app, CI or lockfile change |
| `positive_test_and_output` | §4 (validator PASS, exit 0) |
| `negative_test_and_output` | §5 (`--self-test`, 14/14, exit 0) |
| `security_rights_privacy` | §6 |
| `reviewer` | pending (integrator + human reviewer) |
| `rollback` | §8 — delete the three new files |
| `result_sha` | none — nothing committed |
| `limitations` | §9 |
| `next_eligible_task` | M25-07 (prerequisites M25-04 and M25-06); statement in §10 |

**Scope source.** [Task packet](../tasks/M25/M25-06.md), TODO row
`TODO.md:585` (acceptance *"Historical/scripture/scientific claims separated"*),
and the delegated statement. Prerequisites: M25-02 contract committed at
`f35f0fb` (`packages/moonui/src/claim-type.ts`, verified with `git log -1`) and
M07-05 permission-verified QS 2:82 sample selectors in
`packages/moonql-corpus/src/index.ts`. The M25-02 TODO row is still unchecked
(`TODO.md:581`); its code contract exists, and this leaf does not change that
status.

## 1. Baseline and worktree

```text
$ git rev-parse HEAD
b3479e6991831b759d842fbe753fe8c30d233792
$ git rev-parse --abbrev-ref HEAD
dev
$ git status --porcelain | wc -l
85
```

The worktree was already dirty in unrelated paths (`TODO.md`, cockpit UI,
audit screenshots, empire-web assets, `next-env.d.ts` files). At write time
`git status --porcelain | wc -l` reported 85 entries; three of those entries are
this leaf's new files. Nothing outside the three claimed files was read for
edits, reverted, staged, stashed, committed or pushed.

## 2. Method and evidence base

Repository-only research at the pinned baseline. No network request, external
source, translation lookup or commentary was fetched. Every row cites an exact
in-repo `path:line`; every statement is authored prose, not a translation.

Files read as the evidence base:

- `packages/moonui/src/claim-type.ts` (full) — the four claim types and the rule
  that `STORY` is "narrative; never evidence and never a measurement".
- `packages/moonql-corpus/src/index.ts` — QS 2:82 selector, edition/translation
  rights fields, and the interpretation lane that reports itself absent.
- `docs/audit/M07-01-editions-licenses-inventory.md` — the multi-tradition
  edition/licence table.
- `docs/audit/M25-01-mtime-antikythera-audit.md` — the mean-synodic lunar phase
  finding.
- `docs/audit/M25-03-heliogrid-questions.md` and
  `docs/design/M25-05-cosmos-time-explorer-sketch.md` — absent ephemeris,
  almanac and comparative-cosmos source set.
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md` — strict category separation,
  scripture-vs-timescale warning, tradition-scoped canon, editorial lenses.
- `docs/tasks/M25/M25-06.md` and `M25-07.md`, `TODO.md:581-586`.

## 3. Row ledger summary

19 rows. A row has one `claimType`, one `evidenceKind` and one `sourceStatus`;
the validator rejects any combination the M25-02 vocabulary does not allow.

| Status | Count | Rows |
|---|---|---|
| `EVIDENCED` | 10 | QS 2:82 address, verification, translator, edition rights, tafsir lane absent, lunar arithmetic, strict categories, scripture-not-timescale, tradition-scoped canon, editorial lenses |
| `PARTIAL` | 3 | Torah, Psalms and Gospel editions inventoried only; no passage seeded |
| `NEEDS_SOURCE` | 3 | Licensed QS 2:82 tafsir; pinned ephemeris/almanac; comparative-cosmos source set with per-edition rights |
| `ABSENT` | 3 | Ancient Near Eastern text; physical instrument record; named cosmological model output |

| Claim type | Count | Meaning in this ledger |
|---|---|---|
| `STORY` | 15 | Scripture, commentary, historical inventory and project-policy claims; never evidence for a measurement |
| `ASTRONOMY` | 2 | The mean-synodic arithmetic finding and the missing pinned ephemeris |
| `PHYSICAL_READING` | 1 | No instrument/calibration/UTC observation exists, recorded as `ABSENT` |
| `SIMULATION` | 1 | No named model with declared inputs exists, recorded as `ABSENT` |

| Tradition | Count |
|---|---|
| `islamic-quran` | 4 |
| `islamic-commentary` | 2 |
| `historical-near-east` | 1 |
| `abrahamic-torah` | 1 |
| `abrahamic-zabur` | 1 |
| `abrahamic-injil` | 1 |
| `modern-astronomy` | 4 |
| `comparative-method` | 5 |

**Separation result.** No row merges categories:

- every scripture tradition is `STORY` only; an `ASTRONOMY` row cannot cite
  corpus scripture or its metadata;
- a `STORY` row cannot carry instrument, model or astronomy evidence;
- no statement asserts a measurement or proof from a scriptural text (the
  validator checks sentence-level positive measurement predicates with a
  negation allowance);
- `ABSENT` rows carry no locator, and `NEEDS_SOURCE` rows must state exactly
  what document or edition is missing.

The only seeded Qur'anic passage is QS 2:82; the ledger does not treat one verse
as a corpus, and it reproduces no translation or Arabic text.

## 4. Positive evidence

```text
$ node scripts/check-m25-06-cosmos-tradition-context.mjs
PASS M25-06 cosmos tradition context: rows=19 EVIDENCED=10 PARTIAL=3 NEEDS_SOURCE=3 ABSENT=3
  claim_types: PHYSICAL_READING=1 SIMULATION=1 ASTRONOMY=2 STORY=15
  traditions: islamic-quran=4 islamic-commentary=2 historical-near-east=1 abrahamic-torah=1 abrahamic-zabur=1 abrahamic-injil=1 modern-astronomy=4 comparative-method=5
  locators: 15/15 resolved, quotes <= 120 chars
exit=0
```

```text
$ node --check scripts/check-m25-06-cosmos-tradition-context.mjs
exit=0
$ pnpm exec eslint scripts/check-m25-06-cosmos-tradition-context.mjs
exit=0
```

`scripts/**/*.mjs` is covered by the central ESLint config
(`packages/eslint-config/src/index.js:215`), so the lint run is a real check, not
an ignored path. No output means no findings.

Every locator quote was independently re-read before writing the ledger:

```text
OK   packages/moonql-corpus/src/index.ts:243 len=23
OK   packages/moonql-corpus/src/index.ts:250 len=39
OK   packages/moonql-corpus/src/index.ts:286 len=29
OK   packages/moonql-corpus/src/index.ts:212 len=45
OK   packages/moonql-corpus/src/index.ts:131 len=68
OK   docs/audit/M07-01-editions-licenses-inventory.md:18 len=31
OK   docs/audit/M07-01-editions-licenses-inventory.md:19 len=30
OK   docs/audit/M07-01-editions-licenses-inventory.md:20 len=45
OK   docs/audit/M25-01-mtime-antikythera-audit.md:62 len=38
OK   docs/design/M25-05-cosmos-time-explorer-sketch.md:106 len=37
OK   docs/vision/MASTER_VISION_NARRATIVE_XV.md:493 len=69
OK   docs/vision/MASTER_VISION_NARRATIVE_XV.md:194 len=75
OK   docs/vision/MASTER_VISION_NARRATIVE_XV.md:205 len=59
OK   docs/vision/MASTER_VISION_NARRATIVE_XV.md:467 len=78
OK   docs/vision/MASTER_VISION_NARRATIVE_XV.md:817 len=19
```

## 5. Negative evidence — self-test

```text
$ node scripts/check-m25-06-cosmos-tradition-context.mjs --self-test
SELF-TEST M25-06 cosmos tradition context
PASS  valid fixture accepted (0 errors)
PASS  invented quote rejected
PASS  locator line beyond the file rejected
PASS  unknown claimType rejected
PASS  STORY row with instrument evidence rejected
PASS  ASTRONOMY row citing scripture rejected
PASS  scripture tradition as non-STORY rejected
PASS  measurement asserted from scripture rejected
PASS  ABSENT row with locator rejected
PASS  NEEDS_SOURCE without a stated gap rejected
PASS  over-long quote rejected
PASS  tally drift rejected
PASS  dropped claim type rejected
PASS  unknown tradition rejected
PASS  14/14 cases; valid fixture accepted, 13 tampered fixtures rejected
exit=0
```

The 13 tampered fixtures cover the requested failure classes: invented quote,
bad locator, unknown `claimType`, category mixing (STORY carrying instrument
evidence; ASTRONOMY citing scripture; scripture tradition as non-STORY),
ABSENT-with-source, tally drift, plus missing stated gap, over-long quote,
dropped claim type and unknown tradition.

## 6. Rights, privacy and security notes

- **Quote minimality.** Locator quotes are repository fragments of at most 120
  characters; the longest used is 78 characters. The validator rejects longer
  quotes.
- **No scripture reproduction.** No Arabic script is copied into the ledger and
  the validator rejects Arabic script inside a statement. No translation wording
  is reproduced: the Kemenag translation already stored in the repository is
  referenced only through translator/rights metadata.
- **Rights metadata is cited, not assumed.** The ledger records that only an
  exact `RIGHTS_EXACT_VERSION_CLEARED` edition may serialize text, and it marks
  unlicensed tafsir and comparative sources `NEEDS_SOURCE` rather than quoting
  them.
- **No external fetch.** The validator reads local files only; no network, no
  secrets, no environment values, no personal data, no observer coordinates.
- **Tradition-scoped claims.** Canon and sacredness are recorded as
  tradition-scoped assertions; no row asserts a universal verdict or a
  scientific result from scripture.
- **No writes.** The script only reads files and prints a report.

## 7. What was not run

No `pnpm typecheck`, `pnpm verify`, application test, build, migration or
deployment was run. The change is one JSON data file, one standalone read-only
Node script and one Markdown report; no TypeScript, runtime, route, schema or
package manifest changed. A green build would not strengthen the documentary
acceptance and would not prove deployment.

## 8. Rollback

Delete the three new files:

```text
docs/data/M25-06-cosmos-tradition-context.json
scripts/check-m25-06-cosmos-tradition-context.mjs
docs/audit/M25-06-cosmos-tradition-context.md
```

Nothing imports them; no route, schema, runtime, build, CI job or TODO status
references them.

## 9. Limitations

1. **Repository-only evidence.** No external edition, translation, commentary,
   historical atlas or almanac was consulted. Every `NEEDS_SOURCE` row names the
   document that would be required; none was invented.
2. **One seeded passage is not a corpus.** QS 2:82 is the only verified selector
   available; the ledger samples the corpus, it does not survey it.
3. **Abrahamic rows are inventory-level.** The Torah, Psalms and Gospel rows are
   `PARTIAL` because only an edition/licence inventory exists; no passage is
   seeded, so no text comparison is possible.
4. **Ancient Near East is absent.** The repository holds no text, edition or
   excerpt for that tradition; the row records absence without a locator.
5. **Astronomy rows record absence or approximation.** No ephemeris, almanac or
   astronomy store exists, and the header lunar phase remains a mean-synodic
   approximation. No astronomical accuracy claim is made.
6. **Heuristic, not semantic proof.** The measurement-assertion check is a
   sentence-level predicate with a negation allowance. It catches the tested
   patterns; an oblique wording could evade it, so human review remains required.
7. **Working-tree scan.** The validator reads the current working tree, which is
   shared with other sessions. A concurrent edit to a cited line would make the
   gate fail loudly (quote mismatch) rather than pass silently.
8. **Closure is not claimed.** Only the integrator checks the TODO leaf when
   reproducible evidence passes.

## 10. Verdict, next task and resulting statement

**Acceptance `"Historical/scripture/scientific claims separated"` is evidenced**
by the 19-row ledger and the passing gate: scripture and commentary rows are
`STORY`; historical inventories are `PARTIAL` and text-free; astronomy rows cite
an audit finding or an absent pinned reference; the physical-reading and
simulation classes are explicitly `ABSENT`; no row mixes them.

**Next eligible task: M25-07** — *Prepare cost/safety/hardware feasibility
decision before execution* (P3/D4; prerequisites M25-04 and M25-06; acceptance
*"No hardware effort without empirical review"*).

**Resulting statement for M25-07.** M25-06 supplies the separated source
context M25-07 needs: any comparative-cosmos material is either `STORY` (never a
measurement), `PARTIAL` inventory, or a named `NEEDS_SOURCE` gap. M25-07 may now
prepare the cost/safety/hardware feasibility decision, but this leaf authorises
no hardware effort, no measurement, no ephemeris and no comparative source
acquisition; those remain blocked until an empirical review and the missing
rights/source records exist.
