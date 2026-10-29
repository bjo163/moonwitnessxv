# M25-07 — Cost, safety and hardware feasibility decision gate

- **Task:** M25-07 — Prepare cost/safety/hardware feasibility decision before execution (P3/D4). Acceptance: *"No hardware effort without empirical review"*.
- **Record type:** decision gate. It authorizes no hardware acquisition, purchase, build, measurement, fabrication, installation, actuation or deployment.
- **Baseline:** `dev` at `3e5e913eae5365855fca6ff71c051950889e79b5`.
- **Prerequisites:** M25-04 committed at `b3479e6` (unit/calibration contract) and M25-06 committed at `2b27e2e` (tradition/claim separation ledger).
- **Gate validator:** `scripts/check-m25-07-feasibility-gate.mjs`. This record must keep passing it.
- **Evidence report:** [M25-07-feasibility-gate.md](../audit/M25-07-feasibility-gate.md)
- **Decision authority:** §1.2.
- **Reviewer:** pending (integrator + repository owner).
- **Rollback:** delete this record, the validator and the evidence report (three new files only).

## 0. Prerequisite artifacts (exact repository paths)

The gate depends on three existing artifacts. They are cited here by the exact
repository-relative path the validator resolves on disk:

- `docs/design/M25-04-measurement-metadata.md` — [M25-04 measurement contract](../design/M25-04-measurement-metadata.md), the unit/calibration/provenance layer a hardware reading would have to pass.
- `docs/data/M25-06-cosmos-tradition-context.json` — [M25-06 ledger](../data/M25-06-cosmos-tradition-context.json), the STORY / ASTRONOMY / PHYSICAL_READING / SIMULATION separation a hardware result may not cross.
- `docs/audit/M25-03-heliogrid-questions.md` — [M25-03 questions audit](../audit/M25-03-heliogrid-questions.md), the only register of falsifiable questions this gate may select from (design register: [M25-03](../design/M25-03-heliogrid-material-forge-questions.md)).

If any of these paths moves or is deleted, the gate is invalid and must be
re-derived (§6, RV-3).

---

## 1. Decision

**No hardware effort without empirical review.** This repository authorizes no
hardware acquisition, purchase, build, fabrication, assembly, bench test,
installation, measurement campaign, actuation or deployment until every gate
item in §2 exists as dated, reviewable evidence and the authority named in
§1.2 has recorded a separate positive decision. A proposal missing any gate item
is BLOCKED under §5; it does not become allowed by silence, urgency, a partial
checklist or a passing script.

Decision clauses:

| # | Clause |
|---|---|
| D1 | **No purchase.** No order, quote, vendor selection, invoice, subscription, sample request, lab booking or procurement of any instrument, sensor, meter, component, material or service. |
| D2 | **No build.** No fabrication, assembly, soldering, machining, printing, enclosure, wiring, bench test or site installation. |
| D3 | **No measurement.** No data-collection campaign, no calibrated measurement and no accuracy, tolerance, resolution or uncertainty claim. |
| D4 | **No actuation.** No device is switched, energized, aimed, moved, loaded, heated or commanded; no actuator, relay, motor or control path is designed or authorized. |
| D5 | **No substitution.** A simulation, model output, datasheet figure or remembered value is never promoted to an instrument reading (M25-02, M25-04). |
| D6 | **No truth transfer.** No scriptural, narrative or astronomical material becomes evidence for a hardware result, and no hardware result becomes evidence for scripture or narrative (M25-06). |
| D7 | **No status change.** This record does not check, close or reopen any TODO leaf; closure belongs to the integrator on reproducible evidence. |

### 1.2 Who must decide

Only the **repository owner acting as M25 milestone owner, together with the
integrator**, may change this decision. A change must be a new decision record
or accepted ADR that attaches the evidence for all seven gates and names, for
each: the instrument, the site, the operator, the budget ceiling and the
accountable parties.

A leaf worker, an automated agent, a CI job, this validator or a passing
self-test cannot authorize hardware work and cannot mark a gate satisfied.
Elapsed time, an unfinished review, a verbal commitment or a partially gathered
checklist is not authorization. At this baseline none of the seven gate items
exists anywhere in the repository (§2), so no gate can honestly be recorded as
satisfied.

---

## 2. Gate checklist

No purchase, order, build, bench test, measurement or fabrication may occur
before **all** of the following evidence exists. A statement of intent, a plan
to obtain evidence, a vendor promise or a plausible assumption is not evidence.
Partial evidence counts as missing (§5).

| Gate | Required evidence that must exist before any purchase or build | Status |
|---|---|---|
| HG-1 | A named instrument: manufacturer, model, serial or asset identifier, calibration certificate identifier, calibration date and validity window, the traceability chain to a recognised standard, the uncertainty budget, and the range actually used. No instrument, model, serial or certificate exists in this repository and none may be named speculatively. | MISSING |
| HG-2 | A written physical safety plan for the specific site and instrument, covering electrical, thermal, optical (including direct solar observation), mechanical, chemical and access hazards, with identified controls, a named safety reviewer, stop-work authority and an incident-report path. No site, instrument or safety review exists, so no plan can yet be written. | MISSING |
| HG-3 | An operator with documented authority: a named role and accountable individual, the permitted actions, training or licence evidence, an emergency-stop procedure and a second reviewer who is not the budget holder. A role title without a named accountable person does not satisfy this gate; no operator exists today. | MISSING |
| HG-4 | A budget with a named responsible party: currency, ceiling, contingency, funding source, spend path and the accountable person who owns the number. This record states no amount, vendor or price. No budget, currency, ceiling or responsible party exists today. | MISSING |
| HG-5 | One falsifiable question selected from the M25-03 register (H1–H6, F1–F5) with its measurable signal, a unit from the M25-04 table, its pass threshold, falsification condition and safety boundary. The register marks six questions BLOCKED-INSTRUMENT and one BLOCKED-SOURCE and leaves thresholds at `U_?`; a threshold invented outside that register does not satisfy this gate. | MISSING |
| HG-6 | A rights and consent position for any observation that would be recorded, retained or published: site-owner consent, observer consent, licence for any third-party data, an ADR-0003 rights classification, and a withdrawal rule. No consent, licence or rights classification for a hardware observation exists today. | MISSING |
| HG-7 | A data-retention rule: what is recorded, where it is stored, for how long, who may read or delete it, what is never retained (personal data, private-site coordinates, witness material), and the deletion evidence that proves it. No retention rule, store or deletion path exists today. | MISSING |

A gate becomes satisfied only when the authority in §1.2 attaches the evidence
to a new record. This table stays `MISSING` until then, and the validator
rejects any other status (it cannot verify attachments, so it refuses to accept
a claim of satisfaction).

---

## 3. Non-goals

Each item is a prohibition, not a deferral. None of them may be traded for
another, and none becomes allowed when a gate is satisfied.

| # | Non-goal |
|---|---|
| NG-1 | **No calibrated measurement claim.** No value, tolerance, accuracy class, resolution, uncertainty or calibration status is asserted for any instrument or result. |
| NG-2 | **No actuation.** No switching, energizing, aiming, moving, heating, loading or commanding of any device; no actuator or control path is designed or authorized. |
| NG-3 | **No astronomy-as-scripture.** No celestial or scriptural text is evidence for a physical result, and no hardware result is presented as confirmation of a sacred or narrative claim (M25-06). |
| NG-4 | **No device purchase.** No order, quote, vendor selection, invoice, sample, lab booking or procurement of hardware, components, materials or services. |
| NG-5 | **No deployment.** No installation at a site, no network connection, no public surface, no production service and no change to any deployed environment. |

---

## 4. Dependencies between the gate and the existing contracts

The gate does not replace these contracts; it consumes them. A hardware record
that fails any of them is not evidence for any gate item.

| Contract | Artifact | What it already fixes | Obligation this gate adds |
|---|---|---|---|
| M25-02 claim types | `packages/moonui/src/claim-type.ts` | Four claim types. `ASTRONOMY` is never an instrument reading; a `SIMULATION` may not be relabelled as a measurement; a `STORY` is never evidence. | Any future reading declares exactly one claim type and one source before it is rendered. |
| M25-04 measurement metadata | `docs/design/M25-04-measurement-metadata.md`, `packages/moonui/src/measurement-metadata.ts` | Eight accepted units; a physical reading requires unit, instrument, calibration reference, UTC observation instant, source and uncertainty; a simulation value is refused as sensor data. The contract is not wired to any producer or UI. | HG-1 must supply the certificate *behind* `calibrationRef`: the contract checks that a reference string exists, and explicitly does not verify, date, expire or sign it. HG-5's unit must be in the M25-04 table; conformance needs a producer test, not an assumption. |
| M25-06 source separation | `docs/data/M25-06-cosmos-tradition-context.json` | Nineteen rows separated into STORY, ASTRONOMY, PHYSICAL_READING and SIMULATION; a scripture tradition is STORY only; an astronomy row may not cite scripture. | No instrument record may cite scripture as evidence; no scripture row may carry instrument evidence. HG-6's rights position follows ADR-0003. |
| M25-03 question register | `docs/audit/M25-03-heliogrid-questions.md`, `docs/design/M25-03-heliogrid-material-forge-questions.md` | Eleven questions (H1–H6, F1–F5), each with signal, instrument, threshold, falsification, safety boundary and non-claim. Six are `BLOCKED-INSTRUMENT`, one `BLOCKED-SOURCE`; unsupported thresholds are `U_?`. | HG-5 selects exactly one question and carries its threshold. No threshold may be invented to fit an available instrument. |
| M25-01 time separation | `docs/audit/M25-01-mtime-antikythera-audit.md` | UTC is the only persisted and transported time base; the lunar phase is a display-only approximation; MTS is not a time standard. | HG-1 and HG-7 records carry UTC `Z` instants only. The MTS display clock is never a measurement time base. |
| Rights and pilot boundary | `docs/decisions/ADR-0003-source-rights-and-consent.md`, `BLUEPRINT.md:110` | Rights/consent classification; a HELIOGRID-type pilot must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation or savings. | HG-1 and HG-6 restate that rule as evidence to be produced, not as a condition already met. |

Ordering rule: HG-1 is not satisfied by an M25-04 `calibrationRef` string, HG-5
is not satisfied by a question written after the data exists, and HG-6 is not
satisfied by a repository licence that covers documents only.

---

## 5. Failure mode when a gate is missing

If any gate item is missing, partial or unverifiable at the moment an action is
proposed, the action is **BLOCKED**. Blocking is the intended output of this
decision, not a defect in it.

Required response:

1. **Record the gap.** State the gate id, the missing evidence, the requester
   and role, the date, and what was *not* done. The gap belongs in the task or
   audit trail — never in a purchase order, a calendar invite or a chat message
   as a substitute for the record.
2. **Leave the gate `MISSING`.** A blocked request does not become allowed by
   expiry, repetition or a later milestone.
3. **Re-run the validator and the authority review** only when real evidence
   exists for every gate. Then a *new*, separately authorized task may act; this
   record authorizes nothing itself.

Prohibited improvisations, all of which are themselves gate failures:

| Situation | BLOCKED at | Prohibited improvisation |
|---|---|---|
| One gate missing | the missing gate | Ordering "just the cheap part" or splitting a purchase below a review threshold. |
| Evidence is partial | the partial gate | Treating "good enough for a pilot" as satisfaction. |
| A meter is available but uncalibrated | HG-1 | Borrowing an uncalibrated meter; using a vendor datasheet as a calibration certificate. |
| Budget is verbal | HG-4 | Spending first and documenting later; assuming a ceiling from a similar project. |
| A willing helper is unnamed | HG-3 | Self-appointment or a role title with no accountable person. |
| The question was written after seeing data | HG-5 | Inventing a threshold to fit the observed values. |
| Rights are unclear | HG-6 | "Internal only" recording with no retention rule; keeping a private-site coordinate "temporarily". |
| No safety plan | HG-2 | A bench test "just to check" or a temporary rig without a stop-work path. |
| A device is already owned or donated | HG-1–HG-7 | Exempting zero-cost hardware from the gate; the gate is about evidence, not money. |

No worker, agent, validator or CI result may waive, downgrade or reinterpret a
gate. If the evidence does not exist, the correct artifact is a gap record, not
an improvised plan.

---

## 6. Conditions that require this decision to be revisited

The decision must be revisited, in full, when any of the following is observed:

| # | Revisit condition |
|---|---|
| RV-1 | The repository owner and integrator record a new decision that names one M25-03 question, one instrument scope, one site and one operator, and attaches evidence for all seven gates. |
| RV-2 | The M25-03 register changes: a `BLOCKED-INSTRUMENT` or `BLOCKED-SOURCE` question becomes answerable, or a threshold stops being `U_?` because a real instrument or source now exists. |
| RV-3 | M25-02, M25-04 or M25-06 changes incompatibly: the claim-type set, the unit table, the ledger enums or statuses, or any cited prerequisite path changes, so the gate obligations no longer match the contracts. |
| RV-4 | A safety event, near miss, injury, equipment fault, regulatory change or site-access restriction is reported for any related work. |
| RV-5 | The repository gains hardware evidence: a device dependency, meter or sensor adapter, instrument record, calibration field, hardware route, app, or any claim that hardware exists. That falsifies the "no hardware exists" premise of this record. |
| RV-6 | Any proposed hardware action arrives — including zero-cost, donated, borrowed or already-owned equipment, or a request to spend before the checklist is complete. Every such request triggers a full validator re-run and a fresh authority review. |

---

## 7. Explicit non-claims

This record does **not** claim that:

- the empirical review has been performed; it defines the gate the review must pass;
- any instrument, vendor, model, serial, calibration certificate, budget, currency, ceiling, operator, site, consent, licence, retention store or safety certification exists in the repository or is named here;
- any calibrated measurement, accuracy, tolerance, uncertainty, safety certification or deployment is approved or achievable;
- the validator proves more than document properties: it is a tripwire, not an authority, an access control or a scientific review;
- legal, regulatory, insurance or site-compliance obligations are satisfied;
- M25-07 is closed. Closure belongs to the integrator on reproducible evidence.

## 8. Rollback and verification

Rollback: delete the three M25-07 files listed in the evidence report. They are
documents and one read-only script; nothing imports them, and no runtime,
schema, manifest, CI job, route, deployment or TODO status references them.

Verification commands (also recorded with observed output in the
[evidence report](../audit/M25-07-feasibility-gate.md)):

```text
node scripts/check-m25-07-feasibility-gate.mjs
node scripts/check-m25-07-feasibility-gate.mjs --self-test
node --check scripts/check-m25-07-feasibility-gate.mjs
pnpm exec eslint scripts/check-m25-07-feasibility-gate.mjs
```
