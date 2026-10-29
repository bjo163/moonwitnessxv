# M25-07 — Cost/safety/hardware feasibility gate (evidence)

| Required report field | Value |
|---|---|
| `task_id` | M25-07 |
| `baseline_sha` | `3e5e913eae5365855fca6ff71c051950889e79b5` |
| `baseline_branch` | `dev` |
| `worker` | single-owner leaf worker (decision record + validator + evidence) |
| `claimed_files` | `docs/decisions/M25-07-hardware-feasibility-decision.md`; `scripts/check-m25-07-feasibility-gate.mjs`; `docs/audit/M25-07-feasibility-gate.md` |
| `actual_changed_files` | the same three files, all new/untracked; no tracked file, TODO, manifest, package, app, CI or lockfile change |
| `positive_test_and_output` | §3 (validator PASS, exit 0) |
| `negative_test_and_output` | §4 (`--self-test`, 14/14, exit 0) |
| `security_rights_privacy` | §6 |
| `reviewer` | pending (integrator + human reviewer) |
| `rollback` | §8 — delete the three new files |
| `result_sha` | none — nothing committed |
| `limitations` | §9 |
| `next_eligible_task` | §10 — no further M25 leaf; M25-07 is the last row |

**Scope source.** [Task packet](../tasks/M25/M25-07.md), TODO row `TODO.md:586`
(acceptance *"No hardware effort without empirical review"*, P3/D4), and the
delegated statement. Prerequisites: M25-04 committed at `b3479e6` and M25-06
committed at `2b27e2e`; both TODO rows are checked (`TODO.md:583`, `:585`).

## 1. Baseline and worktree

```text
$ git rev-parse HEAD
3e5e913eae5365855fca6ff71c051950889e79b5
$ git rev-parse --abbrev-ref HEAD
dev
$ git status --porcelain | wc -l
87
```

The worktree was already dirty in unrelated paths (cockpit UI, M19 audit
screenshots and `docs/audit/M19-04-accessibility-progress.md`, empire-web assets,
`next-env.d.ts` files). `TODO.md` itself is clean at this baseline. The count
above was observed after the decision record and validator were written and
before this report existed; this report makes 88. Nothing outside the three
claimed files was read for edits, reverted, staged, stashed, committed or
pushed. No commit, checkout, rebase or push was performed.

## 2. What the gate decides

The decision record states the acceptance rule as a hard gate:
**no hardware effort without empirical review**. It authorizes no acquisition,
purchase, build, measurement, fabrication, installation, actuation or
deployment, and it names the only authority able to change that: the repository
owner acting as M25 milestone owner together with the integrator.

| Gate | Evidence that must exist before any purchase or build | Recorded status |
|---|---|---|
| HG-1 | Named instrument: manufacturer, model, serial/asset id, calibration certificate id, calibration date and validity, traceability chain, uncertainty budget, used range | `MISSING` |
| HG-2 | Written physical safety plan for the specific site and instrument (electrical, thermal, optical incl. direct solar, mechanical, chemical, access), named safety reviewer, stop-work authority, incident path | `MISSING` |
| HG-3 | Named operator with documented authority, permitted actions, training/licence evidence, emergency stop, independent second reviewer | `MISSING` |
| HG-4 | Budget with currency, ceiling, contingency, funding source and a named responsible party who owns the number | `MISSING` |
| HG-5 | One falsifiable M25-03 question with signal, M25-04 unit, pass threshold, falsification condition and safety boundary | `MISSING` |
| HG-6 | Rights/consent position for any recorded observation: site and observer consent, third-party licence, ADR-0003 classification, withdrawal rule | `MISSING` |
| HG-7 | Data-retention rule: what is stored, where, how long, who reads/deletes, what is never retained, deletion evidence | `MISSING` |

Non-goals (NG-1..NG-5): no calibrated measurement claim, no actuation, no
astronomy-as-scripture, no device purchase, no deployment.

Revisit conditions (RV-1..RV-6): a new owner decision naming question,
instrument, site and operator; an M25-03 question becoming answerable; an
incompatible change to M25-02/M25-04/M25-06 or a moved cited path; a safety
event or regulatory change; the repository gaining hardware evidence; or any
proposed hardware action, including donated or already-owned equipment.

Failure mode (§5 of the record): any missing or partial gate is `BLOCKED`; the
gap is recorded with the gate id, missing evidence, requester, date and what was
not done; no substitution, no split purchase, no borrowed meter, no vendor
datasheet as a certificate, no invented threshold, no zero-cost exemption.

**Dependencies.** The decision record maps the gate onto the existing contracts:

- M25-02 (`packages/moonui/src/claim-type.ts`) fixes the four claim types and
  forbids relabelling; the gate requires exactly one type and one source per
  future reading.
- M25-04 (`docs/design/M25-04-measurement-metadata.md`,
  `packages/moonui/src/measurement-metadata.ts`) fixes the eight-unit table and
  the physical-reading fields; the gate notes `calibrationRef` is a reference,
  not a certificate, so HG-1 must supply the certificate itself, and the
  contract is not wired to any producer.
- M25-06 (`docs/data/M25-06-cosmos-tradition-context.json`) fixes
  STORY/ASTRONOMY/PHYSICAL_READING/SIMULATION separation; the gate forbids
  instrument evidence in a scripture row and scripture in an instrument record.
- M25-03 supplies the only admissible question register for HG-5 (11 questions;
  6 `BLOCKED-INSTRUMENT`, 1 `BLOCKED-SOURCE`, thresholds `U_?`). M25-01 keeps
  UTC as the only time base. ADR-0003 and `BLUEPRINT.md:110` supply the
  rights/read-only-pilot boundary that HG-6 restates as evidence to produce.

## 3. Positive evidence

```text
$ node scripts/check-m25-07-feasibility-gate.mjs; echo "exit=$?"
PASS M25-07 feasibility gate: gates=7/7 stated, status MISSING=7/7
  non-goals: 5/5; revisit conditions: 6/6
  prerequisites: 3/3 cited and present
  authorization: none found (purchase, build, actuation, deployment, calibrated measurement)
NOTE the gate authorizes no hardware effort; MISSING is the honest state of every gate
exit=0
```

Gate, non-goal and revisit row counts in the record:

```text
$ grep -cE '^\| HG-[0-9]+ \|.*\| MISSING \|$' docs/decisions/M25-07-hardware-feasibility-decision.md
7
$ grep -cE '^\| NG-[0-9]+ \|.*\|$' docs/decisions/M25-07-hardware-feasibility-decision.md
5
$ grep -cE '^\| RV-[0-9]+ \|.*\|$' docs/decisions/M25-07-hardware-feasibility-decision.md
6
```

No invented figure, currency or serial was written:

```text
$ grep -nE '\$ ?[0-9]|€ ?[0-9]|Rp ?[0-9]|USD ?[0-9]|serial [A-Z0-9]{3,}' docs/decisions/M25-07-hardware-feasibility-decision.md; echo "exit=$?"
exit=1
```

Syntax and lint:

```text
$ node --check scripts/check-m25-07-feasibility-gate.mjs; echo "exit=$?"
exit=0
$ pnpm exec eslint scripts/check-m25-07-feasibility-gate.mjs; echo "exit=$?"
exit=0
```

`scripts/**/*.mjs` is covered by the central ESLint config
(`packages/eslint-config/src/index.js:215`), so the lint run is a real check,
not an ignored path. No output means no findings. No third-party dependency was
added; both tools are existing root dev dependencies.

## 4. Negative evidence — self-test

```text
$ node scripts/check-m25-07-feasibility-gate.mjs --self-test; echo "exit=$?"
SELF-TEST M25-07 feasibility gate
PASS  valid in-memory fixture accepted (0 errors)
PASS  missing gate rejected (GATE_MISSING)
PASS  empty gate requirement rejected (GATE_REQUIREMENT_MISSING)
PASS  gate claimed satisfied rejected (GATE_STATUS_NOT_MISSING)
PASS  purchase authorization rejected (AUTHORIZATION_PRESENT)
PASS  calibrated-measurement authorization rejected (AUTHORIZATION_PRESENT)
PASS  missing non-goal rejected (NON_GOAL_MISSING)
PASS  empty non-goal rejected (NON_GOAL_EMPTY)
PASS  missing revisit condition rejected (REVISIT_CONDITION_MISSING)
PASS  empty revisit condition rejected (REVISIT_CONDITION_EMPTY)
PASS  dangling prerequisite path rejected (CITATION_UNRESOLVED)
PASS  uncited prerequisite rejected (PREREQUISITE_NOT_CITED)
PASS  missing decision statement rejected (DECISION_MISSING)
PASS  missing decision authority rejected (AUTHORITY_MISSING)
PASS  14/14 cases; valid fixture accepted, 13 tampered fixtures rejected
exit=0
```

The requested tamper classes are covered: missing gate (`HG-3`), empty
requirement (`HG-1`), authorization added (`approved to purchase…` and
`calibrated measurement approved…`), missing non-goal (`NG-4`), missing revisit
condition (`RV-5`), dangling prerequisite path (M25-06 path replaced with a
non-existent one). Extra cases cover a gate claimed `SATISFIED`, an empty
non-goal and revisit condition, an uncited prerequisite, and the missing
decision/authority statements.

The validator also enforces a stricter rule than the task text: every gate must
be recorded `MISSING`. No evidence exists in this repository, so a record that
claims a satisfied gate is itself a failure (`GATE_STATUS_NOT_MISSING`). This
means a genuinely evidenced future review needs a new decision record and a
deliberate validator change, not a silent edit.

## 5. What the gate does not do

The validator checks document properties: gate ids and non-empty requirements,
`MISSING` status, non-goals, revisit conditions, absence of authorization
sentences, and that every cited `docs/` path exists. It cannot verify a
calibration certificate, a budget, an operator, a consent record or a safety
review, because none exists. The authorization detection is a sentence-level
predicate list with a negation allowance; an oblique wording could evade it, so
human review remains required.

## 6. Rights, privacy and security notes

- **No secrets, credentials, personal data or site data.** The repository holds
  no operator, site, observer coordinate, consent or witness material for
  hardware work; none was invented, and no environment value was read.
- **No external fetch.** The validator reads the decision record and checks
  three local paths; no network request is made.
- **Rights are a precondition, not a claim.** HG-6 requires a rights/consent
  position and ADR-0003 classification before any observation may be recorded;
  this leaf asserts no licence and quotes no third-party text.
- **Retention is a precondition.** HG-7 requires a retention and deletion rule,
  including explicit exclusions for personal data, private-site coordinates and
  witness material.
- **No writes at runtime.** The script only reads files and prints a report.

## 7. What was not run

No `pnpm typecheck`, `pnpm verify`, package suite, build, migration, Docker run
or deployment was executed. The change is two Markdown documents and one
standalone read-only Node script; no TypeScript, runtime, route, schema,
manifest or CI job changed. A green build would not strengthen a decision gate
and would not prove deployment.

## 8. Rollback

Delete the three new files:

```text
docs/decisions/M25-07-hardware-feasibility-decision.md
scripts/check-m25-07-feasibility-gate.mjs
docs/audit/M25-07-feasibility-gate.md
```

Nothing imports them; no route, schema, runtime, build, CI job, manifest or TODO
status references them. Removal leaves the repository exactly at the baseline
behaviour: no hardware work, no gate.

## 9. Limitations

1. **This is a decision gate, not a completed review.** The empirical review
   has not happened and could not: there is no instrument, calibration
   certificate, budget, currency, operator, site, consent record, safety plan,
   retention store or tested question in the repository. Every unknown is
   written as a required evidence item, not filled in.
2. **No vendor, model, serial or figure is named.** The record deliberately
   contains no manufacturer, price, ceiling or certificate identifier; the
   validator cannot prove absence of an invented figure beyond the quoted grep.
3. **`MISSING` is enforced by construction.** The gate will fail if a future
   editor claims a satisfied gate; that is intended, but it means the validator
   is not a general-purpose evidence verifier.
4. **Document-level proof only.** The authorization detector is heuristic. It
   rejects the tested phrasings; a paraphrase could pass. Human review by the
   named authority is the actual control.
5. **Shared working tree.** The validator reads the current tree. A concurrent
   session moving or deleting one of the three cited prerequisite paths makes
   the gate fail loudly (`CITATION_UNRESOLVED` / `PREREQUISITE_NOT_CITED`)
   rather than pass silently.
6. **No TODO or CI integration.** The validator is not wired into any package
   script or workflow, by instruction; running it is a manual act.
7. **Closure is not claimed.** Only the integrator checks the TODO leaf when
   reproducible evidence passes.

## 10. Verdict and resulting next step

**Acceptance `"No hardware effort without empirical review"` is evidenced as a
decision gate.** The record states the rule and its deciding authority; lists
seven pre-purchase/pre-build evidence items, all `MISSING`; prohibits the five
requested classes of work; ties the gate to M25-02, M25-04 and M25-06 plus the
M25-03 question register; defines a blocked/record-the-gap failure mode with
prohibited improvisations; and names six conditions that force a revisit. The
validator passes, its self-test rejects 13 tampered fixtures, syntax and lint
are clean.

**Hardware work remains blocked.** No instrument, budget, operator, site,
calibration, consent or retention rule exists, so no gate can be satisfied
today. M25-07 is a decision leaf: it defines the gate and produces no hardware
evidence of its own.

**Next step.** The integrator may check the M25-07 TODO row on this evidence.
M25-07 is the final M25 leaf; no further M25 task is eligible, and any M26 or
M36 work is outside this leaf and unchanged. No closure of any other leaf is
claimed here.
