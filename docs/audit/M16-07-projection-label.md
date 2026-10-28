# M16-07 — Label testimony vs empirical claim vs fiction in every projection

- **Task:** M16-07 (P1, D2) — "Label testimony vs empirical claim vs fiction in every projection".
- **TODO acceptance cell:** *No unverified spiritual message asserted as fact* (`TODO.md` line 405).
- **State:** contract and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. `TODO.md` was not modified.
- **Worker:** one agent session; two new files plus this report. No commit, stage, push, rebase or branch operation.
- **Date of observation:** 2026-10-28 (local).
- **Baseline:** `dev` / `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (short `5b70e76`), confirmed with `git rev-parse HEAD` and `git branch --show-current` before any file was written.

## Scope derivation and prerequisite check

**No packet exists.** `docs/tasks/M16/` contains `M16-01.md` … `M16-06.md` only; `git ls-files docs/tasks/M16/` shows no `M16-07.md`, and `docs/milestones/M16.md` links M16-07 straight to `TODO` (`| M16-07 | open | LEAF | [TODO](../../TODO.md) |`). `docs/planning/GRANULARITY_AUDIT.md` classifies M16-07 as `D2 / NEEDS_CLARIFICATION`. Scope was therefore derived from:

1. the TODO line (`TODO.md` line 405) and its acceptance text;
2. `docs/milestones/M16.md` (entry/exit gate and evidence expectations);
3. `docs/decisions/M16-01-private-witness-object-spec.md` §2–§4, which already assigns "rendering the testimony/empirical/fiction label in every projection" to **M16-07** (§ scope row, line 30) and fixes the invariants this contract enforces: P-3 (no automatic assignment / reclassification is a governance act), P-4 (testimony ≠ fact-assertion), P-6 (fiction is never testimony), P-7 (label survives projection);
4. `BLUEPRINT.md` §4 (`API/UI are projections/authorized operations`) and §6 (the normative epistemic axis, `Publication: … public projection`);
5. `MASTER_DESIGN.md` (a skin change may never alter source identity, rights state or the machine API — quoted via M16-01 §4.2).

**Dependency cell — verified, and it does not match the delegation premise.** The cell reads `M16-06`, and M16-06 is **unchecked** (`TODO.md` line 404). M16-06 depends on M16-05 (line 403, unchecked), which depends on M16-04 (line 402, unchecked and explicitly "in progress in another session (uncommitted)"). So an open prerequisite **does** exist at the register level. This work does not implement, bypass or shorten any consent, withdrawal or redaction gate — it is a pure labelling contract that refuses records it cannot classify — but the dependency gate itself is **not satisfied**, and the integrator must decide whether to accept a contract-only leaf ahead of M16-04…M16-06 or hold the checkbox. Nothing here asserts that consent, ACL, withdrawal or redaction work exists.

## Baseline and worktree

- `git rev-parse --abbrev-ref HEAD` = `dev`; `git rev-parse HEAD` = `5b70e76cfe81a9d310c17f4a02ca022aa84beb87`.
- The worktree was already dirty on entry and stayed dirty from parallel sessions: `apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/headquarters`, `apps/echolog`, `packages/moonql-witness/src/index.ts`, `packages/moonql/src/rest.ts`, `packages/echolog-core/src/driver/fs.ts`, `packages/moonql-client/src/{generated.ts,schema-history.json,schema-snapshot.json}`, `.env.example`, `docs/architecture/ECHOLOG.md`, `docs/audit/screens/*`, `todo-ui-2.md`, plus untracked files from other tasks (including `packages/moonql-research/src/source-label.ts`, `packages/moonql-research/src/withdrawal.ts`, `packages/moonql-witness/src/media-access.ts`).
- None of those paths was opened for write, staged, restored or deleted. `packages/moonql-witness/src/index.ts` was **not** edited, which is why the contract was not placed in that package (see Limitations).
- `git status --porcelain packages/moonql-research test/planning` after the work shows exactly two new entries: `?? packages/moonql-research/src/projection-label.ts` and `?? test/planning/m16-07-projection-label.test.mjs`.

## What the contract does

A pure module at `packages/moonql-research/src/projection-label.ts` (486 lines). It has no runtime import at all — no ORM, route, store, database, filesystem, environment, network, clock or locale detection — and it is **not** added to `src/index.ts`.

### Vocabulary (adopted, not invented)

The single-valued axis is the `BLUEPRINT.md` §6 epistemic-nature list, exactly as M16-01 §3.1 adopted it:

```text
PRIMARY_TEXT | ATTRIBUTED_BELIEF | HISTORICAL_EVIDENCE
SCIENTIFIC_OBSERVATION | PERSONAL_TESTIMONY | INTERPRETATION | FICTION
```

The four coarse families M16-07 names — `TESTIMONY`, `EMPIRICAL_CLAIM`, `FICTION`, `NARRATIVE_FRAME` — are **derived** by `EPISTEMIC_CLASS_CLAIM_FAMILY` and are never a second stored field a projector could pick:

| Family | Classes | Meaning used here |
|---|---|---|
| `TESTIMONY` | `PERSONAL_TESTIMONY` | one principal's account |
| `EMPIRICAL_CLAIM` | `PRIMARY_TEXT`, `HISTORICAL_EVIDENCE`, `SCIENTIFIC_OBSERVATION` | warranted by an external checkable object (source wording, attested document, measurement) |
| `FICTION` | `FICTION` | creative work |
| `NARRATIVE_FRAME` | `ATTRIBUTED_BELIEF`, `INTERPRETATION` | reported belief or a declared reading |

### Projection kinds map one-to-one

`PROJECTION_RECORD_KINDS` is a frozen, closed registry; there is no wildcard, prefix rule, `default` key or `UNKNOWN` member:

| Projection kind | Class |
|---|---|
| `d01.primary_text` | `PRIMARY_TEXT` |
| `d05.attributed_belief` | `ATTRIBUTED_BELIEF` |
| `d05.research_interpretation` | `INTERPRETATION` |
| `d06.documentary_attestation` | `HISTORICAL_EVIDENCE` |
| `d06.witness_testimony` | `PERSONAL_TESTIMONY` |
| `d07.fiction_scene` | `FICTION` |
| `d10.scientific_observation` | `SCIENTIFIC_OBSERVATION` |

The D-prefix follows the BLUEPRINT §4 domain table; the same subset M16-01 §3.1 declares for D06 (`PERSONAL_TESTIMONY`, `HISTORICAL_EVIDENCE`, `ATTRIBUTED_BELIEF`, `SCIENTIFIC_OBSERVATION`) is represented, with `PRIMARY_TEXT`, `INTERPRETATION` and `FICTION` owned by D01/D05/D07.

### `labelProjection(surface, records)` — fail-closed

Accepted only when **all** of these hold: the surface is one of `API | DOCK | EXPORT | HEADQUARTERS | SDK | SEARCH`; at least one record is present; every record has a non-empty `recordRef`, a known `recordKind` and a stored `epistemicClass` from the axis; that stored class **equals** the class implied by the record kind; and all records share one class. Any deviation returns an UNLABELED result. The UNLABELED shape has no `label`, no `epistemicClass` and no `display` key, so a surface cannot render or serialize a class from it.

A labelled result is deeply frozen and carries `epistemicClass`, `claimFamily`, `machineLabel` (stable ASCII, equal to the class), `display.en`/`display.id`, code-unit-sorted `recordRefs` and `records`, `assertedAsFact: false`, `truthVerdict: null`, `labelIsAReview: false` and a fixed notice. `requireLabeledProjection` throws `ProjectionLabelError` instead of ever handing back an unlabelled projection to an emitter.

### Refusal codes

`PROJECTION_INVALID`, `SURFACE_UNKNOWN`, `RECORDS_EMPTY`, `RECORD_INVALID`, `RECORD_REF_MISSING`, `RECORD_KIND_MISSING`, `RECORD_KIND_UNKNOWN`, `RECORD_UNLABELED`, `EPISTEMIC_CLASS_UNKNOWN`, `MIXED_LABELS`, `LABEL_UPGRADE_REFUSED`, `LABEL_DOWNGRADE_REFUSED`, `LABEL_MISMATCH`.

Upgrade/downgrade detection uses a three-level credibility ordering (`FICTION` < `NARRATIVE_FRAME`/`TESTIMONY` < `EMPIRICAL_CLAIM`) that is **internal only** — it is never returned, never scored and never exposed; two families deliberately share a rank because they are mutually incomparable (that case is `LABEL_MISMATCH`). Testimony → evidence, testimony → primary text, testimony → measurement, fiction → testimony and fiction → evidence are `LABEL_UPGRADE_REFUSED`; evidence → testimony and evidence → fiction are `LABEL_DOWNGRADE_REFUSED`.

### Display

`renderLabelText(class, locale)` returns `en`/`id` text plus the untranslated `machineLabel`. An unsupported locale falls back to the canonical default `en` (ADR-0005) and reports `fallback: true`; an unknown class is refused (`EPISTEMIC_CLASS_UNKNOWN`) rather than guessed. Labels state a category only; no label asserts a theological, historical or scientific conclusion.

## Files

- `packages/moonql-research/src/projection-label.ts` — new, 486 lines, pure contract and types.
- `test/planning/m16-07-projection-label.test.mjs` — new, 365 lines, 26 `node:test` cases.
- `docs/audit/M16-07-projection-label.md` — this report.

No existing file was modified. `packages/moonql-research/src/index.ts`, `src/seed.ts`, `src/projection.ts`, schemas, migrations, routes, `TODO.md`, `BLUEPRINT.md`, `MASTER_DESIGN.md` and every pre-existing dirty path were left untouched.

## Positive evidence

Command, run from the repository root:

```text
node --experimental-strip-types --test test/planning/m16-07-projection-label.test.mjs
```

Exit code **0**, 26 tests, 26 pass, 0 fail. Verbatim output:

```text
✔ positive: every projection kind maps to exactly one epistemic class and family (1.5924ms)
✔ positive: the class axis is the BLUEPRINT §6 set and families are derived, not stored (0.1921ms)
✔ positive: each kind labels a projection with its class, family and untranslated machine label (0.5275ms)
✔ positive: a testimony projection never asserts fact and carries no truth verdict (0.2841ms)
✔ positive: every declared projection surface accepts a labelled projection (0.2022ms)
✔ positive: same-class records are ordered deterministically regardless of input order (0.2516ms)
✔ positive: labels and their display table are deeply frozen (0.4175ms)
✔ positive: display text is localized for en and id while the machine label stays ASCII (0.2441ms)
✔ positive: the registry has no wildcard, default, catch-all or UNKNOWN entry (0.1942ms)
✔ positive: refusal codes are unique, frozen and enumerable for callers (0.2688ms)
✔ negative: a record with no stored class is UNLABELED, never defaulted (0.33ms)
✔ negative: a missing projection kind is refused and cannot borrow the class (0.1288ms)
✔ negative: an unknown projection kind is refused without an empirical fallback (0.1441ms)
✔ negative: a stored class outside the BLUEPRINT axis is refused (0.1244ms)
✔ negative: a mixed projection is refused instead of collapsing to one label (0.1141ms)
✔ negative: testimony cannot be upgraded to empirical evidence by its projection kind (0.0958ms)
✔ negative: testimony cannot be upgraded to primary text or measurement either (0.0804ms)
✔ negative: fiction cannot be upgraded to testimony or evidence (0.1643ms)
✔ negative: evidence cannot be downgraded to testimony or fiction by its projection kind (0.1039ms)
✔ negative: an incomparable reclassification is a mismatch, not a silent relabel (0.0726ms)
✔ negative: an empty or non-list record set is refused (0.0695ms)
✔ negative: unknown or missing surfaces are refused (0.0852ms)
✔ negative: malformed projections and records are refused with stable codes (0.1208ms)
✔ negative: rendering an emitter without a label throws instead of serializing (0.2193ms)
✔ negative: an unknown class cannot be rendered and gets no display text (0.0753ms)
✔ negative: a refusal never carries record content, only opaque indices and class names (0.1148ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.7341
```

(One earlier run of the same command reported the same 26/26 result at `duration_ms 138.1349`.)

What the positive cases prove:

- All seven registry kinds classify to exactly one class each, the registry covers all seven classes with no dead class, and each classification is frozen.
- The class axis equals the BLUEPRINT §6 list in its published order; the four families are a complete, derived mapping, and `claimFamilyOf` returns the same family.
- Every kind produces a labelled projection carrying the right class, family, machine label, schema version, record kind and non-empty `en`/`id` display.
- A testimony label carries `assertedAsFact: false`, `truthVerdict: null`, `labelIsAReview: false` and the fixed notice.
- All six declared surfaces accept a labelled projection; multiple same-class records are accepted and sorted deterministically regardless of input order.
- Labels, their nested records, `recordRefs` and display tables are deeply frozen: three in-place edits throw `TypeError` and leave the value unchanged.
- `en` and `id` text differ for every class, `fallback` is `false` for supported locales and `true` (with `en`) for `fr`; the machine label is never translated.
- The registry contains no `*`, `default`, `DEFAULT`, `UNKNOWN`, `unknown` or `any` key; refusal codes are unique and frozen.

## Negative evidence

Each negative case returns `labeled: false` with the named stable code, and the shared assertion checks the result has **no** `label`, `epistemicClass` or `display` key.

| Scenario | Observed refusal |
|---|---|
| Record stores no class (`undefined`, `null`, `''`) | `RECORD_UNLABELED` |
| Record kind missing (`undefined`, `null`, `''`) | `RECORD_KIND_MISSING` |
| Record kind unknown (`d09.astrology_report`), or non-string (`42`); `classifyProjectionKind` alike | `RECORD_KIND_UNKNOWN` |
| Stored class outside the axis (`EMPIRICAL_FACT`, `NOT_A_CLASS`) | `EPISTEMIC_CLASS_UNKNOWN` |
| Testimony record projected as `d06.documentary_attestation` | `LABEL_UPGRADE_REFUSED` |
| Testimony record projected as `d01.primary_text` or `d10.scientific_observation` | `LABEL_UPGRADE_REFUSED` |
| Fiction record projected as `d06.witness_testimony` or `d06.documentary_attestation` | `LABEL_UPGRADE_REFUSED` |
| `HISTORICAL_EVIDENCE` projected as testimony; `SCIENTIFIC_OBSERVATION` projected as fiction | `LABEL_DOWNGRADE_REFUSED` |
| `ATTRIBUTED_BELIEF` projected as testimony; `INTERPRETATION` projected as attributed belief | `LABEL_MISMATCH` |
| Testimony + fiction in one projection | `MIXED_LABELS` |
| Empty list, non-list `records`, missing `records` | `RECORDS_EMPTY` |
| Surface missing, `''`, `PRINT`, lowercase `dock` | `SURFACE_UNKNOWN` |
| Projection is `undefined`, `null`, `'DOCK'`, `[]`, `7` | `PROJECTION_INVALID` |
| Record is a string; `records` is an object | `RECORD_INVALID`, `RECORDS_EMPTY` |
| `recordRef` missing, blank, whitespace or numeric | `RECORD_REF_MISSING` |
| `requireLabeledProjection` on an UNLABELED result | throws `ProjectionLabelError` with `refusal: RECORD_UNLABELED` |
| `renderLabelText('EMPIRICAL_FACT', 'en')` | `EPISTEMIC_CLASS_UNKNOWN`, no `text` key |
| Four refusals built from a canary `recordRef` | serialized result never contains the canary |

## Typecheck, build and lint

| Command (working directory) | Observed result |
|---|---|
| `pnpm exec tsc --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --lib ES2022 --noUncheckedIndexedAccess --skipLibCheck --esModuleInterop packages/moonql-research/src/projection-label.ts` (repo root) | no output, exit 0 — the module compiles under the repo's `tsconfig.base.json` options in isolation |
| `pnpm exec eslint packages/moonql-research/src/projection-label.ts test/planning/m16-07-projection-label.test.mjs` (repo root) | no output, exit 0 |
| `pnpm typecheck` (`packages/moonql-research`) | **exit 2**, but zero diagnostics mention `projection-label.ts` (`... | grep -c projection-label` → `0`); the four remaining errors are all in `src/withdrawal.ts`, an untracked file being written by the parallel M18-04 session, e.g. `src/withdrawal.ts(797,3): error TS2322: Type 'Readonly<{ accepted: true; request: { state: string; ... } }>' is not assignable to type 'WithdrawalRequestResult'` |

The package-level typecheck is therefore **not** clean evidence for this task, and it is not claimed to be. The isolated compiler invocation above uses the same strict options as `tsconfig.base.json`; the package-wide run is blocked by another session's in-progress `src/withdrawal.ts`, which this task must not edit.

## Security, rights and privacy notes

- **Fail closed.** Every path that cannot establish exactly one class returns an UNLABELED record; there is no default class, no "assume empirical", no `UNKNOWN` member and no wildcard registry entry.
- **No relabelling.** The stored class must equal the class implied by the projection kind. Upgrading testimony to evidence, fiction to testimony or evidence to fiction is refused rather than rendered, matching M16-01 P-3/P-4/P-6.
- **One projection, one label.** A projection mixing classes is refused (`MIXED_LABELS`) instead of having one label applied to all its records (M16-01 P-7).
- **No fact assertion.** Every label carries `assertedAsFact: false`, `truthVerdict: null` and `labelIsAReview: false`; the notice states it is not a truth verdict, quality score, review approval or publication decision.
- **No content in refusals.** Refusal detail carries a record index and class names only; a canary `recordRef` placed in four refused projections never appears in the serialized result.
- **No real data.** All fixtures are synthetic `ref:fixture:` / `canary:` strings. No witness text, identity, consent record, secret, environment value, source bytes or production identifier was read, written or exposed.
- **No truth claims.** The display strings describe epistemic category only. They do not assert, deny or rank any religious, historical or scientific proposition.

## Explicit non-claims

- **Not wired to any projection.** The module is not imported by `src/index.ts`, `src/projection.ts`, the research routes, Dock, HQ, search, export, the SDK or any cache. No surface renders this label yet, so "every projection" is **not** demonstrated — only the contract that such projections would have to satisfy.
- **No schema, table, migration or store.** Nothing is persisted; labels are computed from caller-supplied records. No D06/D08 column was added.
- **No consent, ACL, withdrawal or redaction work.** Those remain M16-04/M16-05/M16-06 and are untouched.
- **No locale catalog wiring.** `display.en`/`display.id` live inside the contract; the shared i18n catalog (ADR-0005 owner) was not edited.
- **No TODO or milestone closure.** M16-07 remains unchecked; the integrator reviews this evidence.
- **No commit, push, CI run or deployment.** `result_sha` is left to the integrator.
- **No reviewer approval.** Reviewer unassigned in this report.

## Limitations

- **Contract only.** The enforcement point is a function nobody calls yet. A surface that ignores `labelProjection` can still emit unlabelled data; only wiring every projection (and the API serializer) makes the acceptance testable end to end.
- **Not exported from the package barrel.** `src/index.ts` is clean but was left untouched to keep this change purely additive, so consumers must import `@moonwitness/moonql-research/dist/projection-label.js` by path once the package is rebuilt. Wiring the barrel is a one-line follow-up for the integrator.
- **Not placed in `packages/moonql-witness`.** The D06 owner would be the natural home, but `packages/moonql-witness/src/index.ts` is dirty from the parallel M16-04 session, so the contract lives in the clean research package instead. Moving it later is a file move plus barrel export.
- **Both `recordKind` and `epistemicClass` are required.** The redundancy is deliberate (the mismatch check is the upgrade guard), but a real witness row that stores only a kind, or only a class, cannot be labelled until the wiring task maps one to the other.
- **Registry is a projection taxonomy, not the database.** The seven kinds are derived from BLUEPRINT §4/§6 domain boundaries; they are not table names, and a new kind must be added deliberately with a class, never inferred.
- **One class per projection.** A surface that legitimately shows testimony beside fiction must emit two projections; there is no per-record rendering mode yet.
- **Upgrade ordering is coarse.** The three-level ordering only distinguishes fiction from frame/testimony from evidence. Distinct classes inside one level (e.g. `ATTRIBUTED_BELIEF` vs `PERSONAL_TESTIMONY`) are reported as `LABEL_MISMATCH`, not as an upgrade, so an attempt to pass belief off as personal testimony is refused but not named as laundering.
- **Display copy is provisional.** Wording has not been reviewed by a human editor; it is a contract-level fallback pending the shared catalog.
- **No search/export/SDK integration.** `PROJECTION_SURFACES` names the surfaces from M16-01 P-7, but none of them consumes the label.
- **Package-wide typecheck blocked.** `pnpm typecheck` in `packages/moonql-research` currently fails only on `src/withdrawal.ts` from the parallel M18-04 session; the isolated compile above is the evidence for this file.

## Rollback

Delete the two new files:

1. `packages/moonql-research/src/projection-label.ts`
2. `test/planning/m16-07-projection-label.test.mjs`

and this report. No existing file, export, schema, migration, dependency, environment value, route or stored data requires reverting; `src/index.ts` was never edited, so the package barrel and public surface are unchanged. Because nothing imports the module, removal cannot affect a running surface.

## Report fields

- `task_id`: M16-07
- `baseline_sha`: `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (`dev`)
- `claimed_files`: `packages/moonql-research/src/projection-label.ts`, `test/planning/m16-07-projection-label.test.mjs`, `docs/audit/M16-07-projection-label.md`
- `actual_changed_files`: the same three paths, all new/untracked; zero existing files modified (verified with `git status --porcelain packages/moonql-research test/planning`)
- `positive_test_and_output`: `node --experimental-strip-types --test test/planning/m16-07-projection-label.test.mjs` — 26 tests, 26 pass, 0 fail, exit 0; positive cases cover the one-to-one kind map, full class coverage, per-kind labelling, all six surfaces, deterministic ordering, deep freeze, `en`/`id` display with `machineLabel`, and the absence of any wildcard/default registry key
- `negative_test_and_output`: same 26/26 run — 16 scenarios in the table above, each returning an UNLABELED record with no `label`/`epistemicClass`/`display` key, including unlabeled record, unknown kind, unknown class, mixed projection, testimony→evidence upgrade and evidence→fiction downgrade; a canary check confirms no record ref leaks into a refusal
- `typecheck`: isolated `tsc --noEmit` with the repo's strict options on `projection-label.ts` — no diagnostics, exit 0. Package-wide `pnpm typecheck` exits 2 only because of the parallel session's `src/withdrawal.ts`; `grep -c projection-label` over that output returns `0`.
- `eslint`: scoped run on both new files — no output, exit 0
- `security_rights_privacy`: fail closed with no default class; reclassification refused in both directions; mixed projections refused; labels assert no fact and carry no truth verdict; refusals carry indices and class names only; synthetic fixtures only; no secrets, environment values or witness material
- `task_packet`: absent (`docs/tasks/M16/M16-07.md` does not exist); scope derived from TODO line 405, `docs/milestones/M16.md`, M16-01 §2–§4, BLUEPRINT §4/§6
- `dependency_cell`: `M16-06`, which is **open** in `TODO.md` (line 404) and transitively open through M16-05/M16-04; the register gate is not satisfied even though this contract does not depend on consent/withdrawal code
- `reviewer`: unassigned — integrator review and a decision on the open dependency required
- `rollback`: delete the two new files and this report; nothing else changes
- `result_sha`: **left to the integrator** — no commit was created; the worktree is at `5b70e76` plus the untracked files listed above
- `limitations`: contract only and unwired; not exported from the barrel; placed in `moonql-research` because `moonql-witness/src/index.ts` is dirty; requires both kind and class per record; one class per projection; coarse upgrade ordering; provisional display copy; package typecheck blocked by another session's `withdrawal.ts`
- `next_eligible_task`: M18-06 — "Display reviewer scope, source and original-vs-derivative label" (P1/D3), whose prerequisite M18-03 is closed and which is the nearest sibling label task. M16-04 remains claimed by another uncommitted session and M16-05/M16-06 stay blocked behind it, so no further M16 leaf is eligible to start from a clean dependency state.
