# M36-05: Safety and Post-Pilot Feasibility Gate

**Task:** M36-05 — Verify safety and post-pilot feasibility gate
**Milestone:** [M36 — HELIOGRID measured read-only energy pilot](../milestones/M36.md) · [packet](../tasks/M36/M36-05.md)
**Role:** EXECUTABLE LEAF (verification artifact)
**Priority / Difficulty:** P3 / D4
**Prerequisites:** M36-02 [spec](M36-02-calibration-units-timestamp-provenance.md) · M36-03 [decision](M36-03-d17-owner-readonly-data-boundary.md) · M36-04 [spec](M36-04-telemetry-cost-dashboard-failure-states.md) · **M36-01 open and BLOCKED**
**Baseline:** `dev` HEAD `5bb6334` (M36-04) at authoring
**Verdict of this leaf:** **BASELINE ESTABLISHED — gate defined and its preconditions measured. Safety is
NOT verified and feasibility is NOT established, because no pilot has run.** This is a real, executed
negative result (§6), not a paperwork deferral.
**Data:** synthetic throughout.

## 1. What This Gate Is Supposed to Decide

Two questions, in strict order:

1. **Safety** — can this pilot run at all without risking a person, an installation, or a claim that is
   not true? Sub-parts: electrical safety of installation, read-only guarantee (no actuation path),
   data privacy of high-resolution consumption, and the truthfulness boundary between measured and
   simulated.
2. **Post-pilot feasibility** — after a pilot that ran, is a wider deployment worth doing, at what cost,
   and with what accuracy claims it can honestly make?

Order matters: feasibility of a pilot that never ran is not estimable, and safety of a system that does
not exist is not verifiable. So this leaf can legitimately produce only (a) the gate, (b) its measured
precondition state, and (c) the decision thresholds to be applied later.

## 2. Observed Repository State (executed at this baseline)

These are facts, with the commands that produced them.

### 2.1 No energy application exists

```
$ git log --oneline -1
5bb6334 docs(audit): M36-04 telemetry cost dashboard and failure states specification — baseline established
$ ls apps
aigateway  arsy  dock  echolog  empire-web  headquarters  lumen-runtime  orbit  sentinel  skylink
$ pnpm --filter @moonwitness/heliogrid test
No projects matched the filters in "Z:\project\moonradio"
```

**Finding V-1:** there is no `apps/heliogrid`, no `@moonwitness/heliogrid` package, and therefore no
package test script to run. BLUEPRINT:101 describes it as "Conditional `apps/heliogrid` … Proposed
**only after** measured pilot", which is consistent with the observed absence.

### 2.2 The name exists, but only as narrative and registry placeholders

```
$ grep -rn -i "heliogrid" packages/types/src/sentinel/telemetry.ts
packages/types/src/sentinel/telemetry.ts:13:  | 'HELIOGRID'
$ grep -rn -i "heliogrid" packages/moonql-ops/src/empire.ts
packages/moonql-ops/src/empire.ts:118:    code: 'sys_heliogrid',
packages/moonql-ops/src/empire.ts:119:    name: 'HELIOGRID Tracker',
$ grep -rn -i "heliogrid" apps/headquarters/src/app/\(admin\)/page.tsx
apps/headquarters/.../page.tsx:230:  { code: 'SYS-12', name: 'HELIOGRID', domain: 'Concept: solar energy and physics telemetry; no measured feed is configured' },
$ grep -rn -i "heliogrid" apps/sentinel/src
(no output)
```

**Finding V-2:** HELIOGRID today is (i) one member of the `EmpireSystemCode` union alongside
`SIDRA TREE`, `ATMOSPHERE` and `OBSERVATORY` — i.e. the Empire narrative universe, (ii) a `sys_heliogrid`
ops-registry row, and (iii) an admin-screen concept card whose own text says **"no measured feed is
configured"**. Sentinel, which is the app that would plausibly watch telemetry, has no handler for it.
Nothing in this set is a meter, a kWh field, or a feed, which corroborates the M36-01 register note.

### 2.3 A naming-collision risk worth recording before anyone builds on the name

`'HELIOGRID'` in [packages/types/src/sentinel/telemetry.ts:13](../../packages/types/src/sentinel/telemetry.ts)
is an **Empire system code** (fictional/narrative, rendered as status), while M36's HELIOGRID is a
**proposed physical energy pilot**. Two meanings share one string. The concrete hazard: an operator
dashboard that later reads `EmpireSystemStatus` for a system named HELIOGRID could render a narrative
status as if it were plant health — exactly the class of confusion BLUEPRINT:110 warns about.

Related observation, honest and unsolicited: `EmpireSystemStatus.status` is
`'HEALTHY' | 'DEGRADED' | 'STANDBY' | 'CRITICAL'`
([packages/types/src/sentinel/telemetry.ts:19](../../packages/types/src/sentinel/telemetry.ts)), a fixed
badge vocabulary. MASTER_DESIGN:25/:27 require that freshness and error conditions be shown as words
derived from an authorized read model, with no invented badges. For the *narrative* Empire surface these
labels are fine because they describe fiction; the risk is only if a real pilot reuses that union instead
of the derived state catalog specified in M36-04 §3. This is recorded as a design caution for the
implementation task, **not** as a change to make in this leaf.

### 2.4 The guard that makes read-only cheap to enforce still passes

M36-03 §5.1 executed the topology suite at `28efbba` and recorded 7 tests / 7 pass / 0 fail, including
`SQL drivers are imported only by MoonQL and the SKYLINK store`. That evidence belongs to M36-03; this
leaf does not re-run or re-claim it. It matters here only because the safety property "the pilot cannot
own a control plane" leans on the same closed-architecture rules rather than on new machinery.

## 3. Safety Gate (S-gates) — Definition and Current State

Pass rule: **every S-gate is PASS before any device is connected to anything, and S-gates are re-run, not
carried forward, whenever the collector build changes.** A gate inherited from "last time it was fine" is
not a gate.

| id | gate | how it is verified (not asserted) | state at baseline |
|---|---|---|---|
| S-A1 | no actuation path exists in code | static scan of the collector's exported surface: no method that writes a register, sets a threshold, or commands a device; plus manifest scan for any control SDK dependency | **NOT RUN — no collector exists to scan** |
| S-A2 | write attempts fail, not just absence of a method | a compile-time negative test: an attempted write call must not typecheck against the collector interface | **NOT RUN** |
| S-A3 | protocol-level read allowlist | the collector maps only an enumerated set of readable registers/fields; unlisted addresses are unreachable in code | **NOT RUN** |
| S-A4 | site work is qualified-technician work | M36-01 site approval, technician permission, safety review documented before install | **BLOCKED — M36-01 open** |
| S-A5 | passive sensing only (CTs, not interrupts) | installation manifest reviewed by the technician; photographic evidence at the panel | **BLOCKED — no site** |
| S-A6 | no inbound network path into the site | topology check: the collector dials out; no listening port exposed to the site LAN from outside | **NOT RUN** |
| S-A7 | credentials contain no database access | secret scan: the site box holds a scoped Hub API key only | **NOT RUN** |
| S-A8 | high-resolution data bounded by retention | purge job observed running and logged; retention debt surfaced as an error (M36-04 S-17) | **NOT RUN** |
| S-A9 | measured/simulated cannot be conflated | negative test N-1 of M36-04 executed against a real surface; `presentationClass` enforced at render | **NOT RUN** |
| S-A10 | calibration tier cannot be self-declared | tier derived from the record per M36-02 §2.3; a producer assertion alone cannot raise it | **NOT RUN** |

S-A1/S-A2 are the pair that distinguishes a real safety claim from a policy claim. A README that says
"read-only" with a write-capable client is a policy statement. A client whose type interface cannot
express a write is a structural one. M36-03 W-7 and U-12 of M36-04 exist so that S-A1 is checkable by
machine.

## 4. Post-Pilot Feasibility Gate (F-gates)

These are only meaningful **after** a pilot with real data, so each is stated with the minimum evidence
that would let it be answered. A threshold without a required-evidence column is a wish.

| id | question | minimum evidence | synthetic decision threshold | state |
|---|---|---|---|---|
| F-1 | did the meters stay calibrated? | calibration log across the pilot window | ≥ 95 % of reading-days at tier `CALIBRATED` or better | **UNANSWERABLE — no data** |
| F-2 | was the data actually complete? | `ingest completeness` per M36-04 §6, with reason mix | ≥ 98 % over 30 consecutive days, with gaps explained not averaged | **UNANSWERABLE** |
| F-3 | did the clock support the claims we made? | clock quality distribution + `DEGRADED-ACCURACY` incidents | zero sub-minute claims made on `LOCAL_RTC` sites | **UNANSWERABLE** |
| F-4 | was any simulation mistaken for measurement? | incident log + N-1 style probes | zero incidents; probes must fail closed | **UNANSWERABLE** |
| F-5 | did replay ever corrupt totals? | duplicate-rate data with totals cross-check | totals unchanged in 100 % of replayed batches | **UNANSWERABLE** |
| F-6 | what did it really cost? | invoices, labour log, storage metering vs M36-04 §4 projections | within 2× of projection, or the projection model is discarded | **UNANSWERABLE** |
| F-7 | was the answer useful to the site owner? | site-owner statement collected at the end, not the start | at least one owner continuing without incentive | **UNANSWERABLE** |
| F-8 | did privacy handling survive contact with reality? | `SENSITIVE` read audit + opt-in records + purge log | zero unaudited full-resolution reads, zero purge overdue > 24 h | **UNANSWERABLE** |
| F-9 | what breaks at 10× sites? | load test at pilot volume plus a documented scaling assumption | named, tested bottleneck, not an extrapolated one | **UNANSWERABLE** |
| F-10 | is D17 worth accepting as a domain contract? | the nine answers above + an ADR | owner decision | **NOT REACHED** |

F-7 is the gate most often skipped in instrumentation projects: the team that installs sensors rarely
asks whether anyone used the data. It is included with an explicit anti-incentive condition because a
"was this useful?" survey conducted by the party selling the pilot is not evidence.

## 5. Prerequisite Chain

```
M36-01 (site, technician, authority, consent, safety review)  ── BLOCKED
    └─> collector built (no write methods, allowlisted reads)
           └─> D17 addon + ingest live (M36-03 decision implemented)
                  └─> pilot runs ≥ 30 days of real data
                         └─> S-gates executed  ─┐
                         └─> F-gates answerable ┴─> go / no-go for wider deployment
                                                       └─> D17 acceptance ADR
```

Nothing in this chain past M36-01 can be reached by writing more documents. That is the honest limit of
this milestone: **M36-02 through M36-05 can each be completed on paper, and none of them can be turned
into a verified pilot without M36-01, which needs a human, a site, and a technician.**

## 6. Positive and Negative Evidence for This Leaf

### 6.1 Positive test — what was actually executed

| # | assertion | observed |
|---|---|---|
| P-1 | no energy app or package exists to verify | ✅ `ls apps` lists 10 apps, none named heliogrid; `pnpm --filter @moonwitness/heliogrid test` → "No projects matched the filters" |
| P-2 | the only HELIOGRID code references are narrative/registry placeholders | ✅ three files found (§2.2); one of them literally states "no measured feed is configured" |
| P-3 | Sentinel has no HELIOGRID handler | ✅ grep over `apps/sentinel/src` returned nothing |
| P-4 | the safety property has a machine-checkable anchor already in the repo | ✅ M36-03 §5.1 executed `npx tsx --test test/workspace-topology.test.ts` → 7 pass / 0 fail on the closed-owner and single-wiring-point assertions |
| P-5 | this leaf reports non-execution as non-execution | ✅ §3/§4 tables carry NOT RUN / BLOCKED / UNANSWERABLE, never PASS |

P-1…P-3 are the genuine deliverable here: they establish, by observation rather than assertion, that the
gate has nothing to grade yet. That is what prevents a future reader from mistaking the specification for
a result.

### 6.2 Negative test — the ways this gate must refuse to be closed

| # | attempt | required refusal |
|---|---|---|
| NT-1 | mark M36-05 checked because a CI job is green | rejected: CI for other apps says nothing about a pilot with no code (P-1) |
| NT-2 | mark it checked because this leaf exists | rejected: gate defined ≠ gate passed; §3 states the opposite explicitly |
| NT-3 | declare read-only safe because the README says read-only | rejected: S-A1/S-A2 require a code/interface scan, and the scan has no subject yet |
| NT-4 | declare measured data honest because `presentationClass` exists in a spec | rejected: S-A9 requires an executed probe against a real surface |
| NT-5 | use the narrative `EmpireSystemStatus` HELIOGRID entry as evidence a feed exists | rejected: §2.2 shows the same name means a fiction code and an unconfigured concept card |
| NT-6 | borrow M25-03's falsifiable questions as if they had been tested | rejected: they are hypotheses; nothing in M36 measured against them |
| NT-7 | estimate feasibility from vendor datasheets | rejected: F-6/F-9 require invoices, labour logs and a load test at real volume |
| NT-8 | satisfy F-7 with an enthusiastic kickoff statement | rejected: F-7 requires an end-of-pilot owner statement, and §4 names the incentive problem |
| NT-9 | run the pilot on simulated data to answer F-1…F-9 | rejected outright: a simulated pilot is the exact BLUEPRINT:110 violation the milestone exists to prevent |
| NT-10 | accept D17 as a domain contract before F-10 | rejected: acceptance is an owner ADR decision with the nine answers attached |

NT-9 is the most tempting and the most damaging: a "pilot" built from synthetic readings would let every
F-gate be filled with numbers that look like evidence. The gate is written so that a synthetic-data run
is disqualifying rather than merely flagged.

## 7. Go / No-Go Decision Record (to be completed by a real run)

```
Decision:   HELIOGRID wider deployment     [ GO | NO-GO | PIVOT | INSUFFICIENT ]
Date / SHA: _______________________________
S-gates:    S-A1..S-A10  PASS ____ / 10     blockers: ______________________
F-gates:    F-1..F-9     answered ____ / 9   unanswerable: ___________________
Evidence:   gate JSON + invoices + calibration log + audit log + owner statement
              pinned at commit ______________________
Safety officer: ______________   Legal/rights: ______________   Owner: ______________
Why this is NOT a go even if counts look good: ______________________________________
Re-run date required: ______________________________________________________________
```

Rules encoded by the form: a `GO` requires 10/10 S-gates and 9/9 F-gates answered from real data, a
named safety officer and a named owner, a pinned SHA, and an explicit re-run date. `INSUFFICIENT` is a
valid and expected outcome, and is the one this leaf actually records for the current baseline.

## 8. Risks

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | the gate is mistaken for a verification result | high | high | §3/§4 status columns, §6.1 P-5, NT-1/NT-2/NT-3 |
| R-2 | read-only drifts from "no methods" back to "no permissions checked" | medium | severe | S-A2 compile-time negative test; M36-03 W-7 manifest scan |
| R-3 | simulated pilot reported as real | medium | severe | NT-9 disqualifies it; M36-02 R-1 refuses simulation before every other check |
| R-4 | electrical work performed without M36-01's approvals | low | severe | S-A4/S-A5 are preconditions to touching hardware, not postconditions |
| R-5 | name collision between the narrative Empire system and the pilot | medium | medium | §2.3 records it; implementation must not reuse `EmpireSystemCode` for plant status |
| R-6 | feasibility decided from datasheets | medium | high | F-6 requires invoices; F-9 requires a real-volume load test |
| R-7 | gates copied forward from a previous build | medium | high | §3 pass rule: re-run whenever the collector build changes |
| R-8 | privacy handling assumed because retention is configured | medium | high | S-A8 requires an observed, logged purge; F-8 requires zero overdue purge |
| R-9 | the milestone chain feels finished because all four leaves are checked | high | medium | §5 states plainly that only M36-01 (human/site work) can move this |

## 9. Overlap Analysis

| neighbour | relationship | boundary |
|---|---|---|
| M36-01 | hard blocker for every gate in §3–§4 | nothing here unblocks it |
| M36-02 | supplies the refusal order and tier derivation that S-A9/S-A10 probe | no measurement vocabulary redefined |
| M36-03 | supplies the closed-owner/read-only architecture that S-A1/S-A2 scan | its §5.1 executed evidence is cited, not re-run or re-claimed |
| M36-04 | supplies the state catalog whose error states feed F-8 and S-A8 | no UI decided here |
| ADR-0002 | deny-by-default and one-Hub rule constrain S-A6/S-A7 | |
| ADR-0006 / ADR-0007 | closed SQL-owner set, stateless storage | no third owner, no bytes in D17 |
| BLUEPRINT:101 / :110 | conditional app; read-only meters; simulation honesty | the mandate this gate exists to check |
| M25-03 | hypotheses the pilot should eventually speak to | explicitly not treated as tested (NT-6) |
| M25-07 | hardware feasibility decision | informs S-A5/F-6 without pre-empting them |
| MASTER_DESIGN:25/:27 | no invented badges; states are words | applied as a caution in §2.3, not as a code change |

## 10. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | obtaining a site, technician, calibration authority and consent | **M36-01, human work** |
| 2 | building the collector with no write surface | implementation |
| 3 | S-A1/S-A2/S-A3 scanner tooling | implementation + CI |
| 4 | the actual 30-day pilot run | operator |
| 5 | F-6 cost reconciliation against invoices | ops |
| 6 | F-7 owner-statement instrument (and who asks it, given the incentive problem) | owner decision |
| 7 | naming separation between the Empire narrative code and the pilot | implementation review; §2.3 |
| 8 | a decision record template as a real artifact rather than a form | governance owner |
| 9 | safety-officer role definition | owner |
| 10 | statutory/power-quality scope if a customer demands it | separate decision |
| 11 | insurance/liability posture for on-site equipment | legal owner |
| 12 | decommissioning and data-handback procedure | implementation |
| 13 | gate re-run automation tied to collector build hashes | implementation |
| 14 | multi-site aggregation feasibility | post-pilot |
| 15 | whether HELIOGRID ships inside an existing app or as a new conditional app | owner (M36-03 §9.8) |
| 16 | D17 acceptance ADR | owner, after F-10 |
| 17 | published accuracy claims for any customer-facing figure | rights/claims review |
| 18 | independent review of this gate before a real run | integrator |
| 19 | a synthetic-data test harness that cannot be confused with a pilot | implementation |
| 20 | explicit invalidation of this leaf's status once any gate is run | integrator |

## 11. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. no device, key, job or route was provisioned, so there is nothing to unwind;
3. if the gate is rebuilt, three properties must survive: **S-gates are executed against code and never
   inherited (§3 pass rule)**, **a simulated data run disqualifies rather than decorates (§6.2 NT-9)**,
   and **`INSUFFICIENT` remains a legal recorded outcome (§7)**.

## 12. Report

| field | value |
|---|---|
| `task_id` | M36-05 |
| `baseline_sha` | `5bb6334` (dev, M36-04) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M36-05-safety-post-pilot-feasibility-gate.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files; `packages/types/src/sentinel/telemetry.ts`, `packages/moonql-ops/src/empire.ts`, `apps/headquarters/src/app/(admin)/page.tsx`, `apps/sentinel/src`, `apps` read-only |
| `positive_test_and_output` | §6.1 P-1…P-5, **executed**: `ls apps` (10 apps, no heliogrid), `pnpm --filter @moonwitness/heliogrid test` → "No projects matched the filters", greps isolating HELIOGRID to a narrative enum member, a `sys_heliogrid` registry row and an admin card reading "no measured feed is configured", and an empty Sentinel handler search |
| `negative_test_and_output` | §6.2 NT-1…NT-10: ten refusal conditions, with the executed observations of §2 as the ground they are refused against; NT-9 (a simulated pilot answering the feasibility gates) is disqualifying by rule |
| `security_rights_privacy` | safety gates verified by scanning exported surfaces and manifests rather than by reading policy; passive sensing and qualified-technician work restated as M36-01 preconditions; outbound-only connectivity and no DB credential at sites; high-resolution retention bounded with an error state for purge debt; audited `SENSITIVE` reads; measured/simulated conflation and self-declared calibration tiers both probed, not assumed |
| `reviewer` | integrator + a named safety officer + owner; none assigned in this session |
| `rollback` | §11 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | safety is **not verified**; feasibility is **not established**; 10 safety gates are NOT RUN or BLOCKED and all 10 feasibility gates are UNANSWERABLE; M36-01 remains open and BLOCKED so no site, technician, authority, consent, meter or data exists; every threshold and cost figure in the prerequisite specs is synthetic; the naming collision in §2.3 is recorded as a caution and no code was changed to fix it; the badge-vocabulary observation in §2.3 concerns a narrative surface and is deliberately not acted on in this leaf |
| `next_eligible_task` | none in M36 — M36-01 (site, technician, calibration authority, consent, safety review) is human/operator work, not a specification leaf; further leaves would add paper without moving the pilot |

## 13. Conclusion

The safety question in this milestone is unusually well-defined, because the dangerous outcome is not a
subtle bug but a category error: a system described as read-only that can nevertheless be told to do
something. That is why the first two gates here are scans of the collector's exported surface and a
compile-time negative test rather than a review of intent, and why a pilot run on simulated data is
disqualified instead of flagged — a synthetic pilot would satisfy every feasibility question with
numbers that prove nothing about a real site. What this leaf could genuinely establish is narrower and it
is in §2: HELIOGRID exists in code only as a name in a fiction enum, a registry row and an admin card
that says in its own words that no measured feed is configured. Everything else in this gate is a
measurement waiting for M36-01, which is a person, a panel and a technician, not another document.

## Appendix A: Gate Status Summary at Baseline

| gate group | gates | PASS | NOT RUN | BLOCKED | UNANSWERABLE |
|---|---|---|---|---|---|
| S-gates (§3) | 10 | 0 | 8 | 2 | — |
| F-gates (§4) | 10 | 0 | — | — | 10 |
| Executed observations (§6.1) | 5 | 5 | 0 | 0 | 0 |

Overall recorded outcome: **INSUFFICIENT — preconditions unmet, nothing to grade.**

## Appendix B: What Would Make S-A1/S-A2 Real

```
// shape of the two checks that turn "read-only" from policy into structure
// (NOT authored by this leaf; there is no collector to scan yet)

S-A1  scan the collector package:
        - exported functions/members containing write/set/command/publish-to-device semantics → count must be 0
        - dependencies matching a control-SDK denylist → count must be 0
        - any Modbus function code in the write range (05,06,15,16) present in source → must be absent

S-A2  compile-time negative test:
        const c: Collector = getCollector()
        // @ts-expect-error no write method exists on the read-only collector interface
        c.writeRegister?.(0x0001, 1)

        if the above line typechecks, the collector is not read-only and S-A1 is void,
        regardless of what any README, permission scope or review comment says.
```

## Appendix C: Glossary (selected)

| term | definition used here |
|---|---|
| safety gate (S-gate) | a check whose failure could harm a person, an installation, or the truth of a claim |
| feasibility gate (F-gate) | a question that only real pilot data can answer |
| executed observation | a result produced by a command actually run at the pinned SHA (§2, §6.1) |
| NOT RUN | the check exists and could run in principle; it has not |
| BLOCKED | the check cannot run because a named human precondition is missing |
| UNANSWERABLE | the question requires data that does not exist yet |
| INSUFFICIENT | a legitimate recorded outcome meaning the gate produced no basis for a decision |
| disqualifying run | an experiment whose design voids its own result, e.g. a simulated pilot (§6.2 NT-9) |
| structural read-only | unrepresentable writes at the interface/type level, not merely disallowed ones |
| gate re-run | repetition of the scans whenever the collector build changes, never carried forward |
