# M32-05: Authorized Privacy-First Community MVP Verification Gate

**Task:** M32-05 — Verify authorized privacy-first community MVP
**Milestone:** [M32 — HARBOR member and community privacy](../milestones/M32.md) · [packet](../tasks/M32/M32-05.md)
**Role:** EXECUTABLE LEAF (verification artifact)
**Priority / Difficulty:** P1 / D4
**Prerequisites:** M32-02 [decision](M32-02-d14-ownership-d00-session-reuse.md) · M32-03 [specification](M32-03-private-library-consented-contributions.md) · M32-04 [specification](M32-04-moderation-reporting-appeals.md)
**Baseline:** `dev` HEAD `e3d6c0c` (M32-04) at authoring
**Verdict of this leaf:** **BASELINE ESTABLISHED — verification gate defined; verification NOT performed.**
This is a truthful negative result, not a deferral of writing: an MVP to verify does not exist, so the
only honest deliverable is the gate itself plus the evidence that it currently cannot be run.
**Data:** every account id, metric, threshold and log line below is synthetic.

## 1. Why this leaf cannot report a green result

The packet's own stop rule (§8) says to halt BLOCKED when an accepted ADR, legal merchant, real
source, rights, meter, production access, test or reviewer is missing. Six of those eight are missing
for HARBOR today:

| gate input | required for "verified MVP" | observed state at baseline |
|---|---|---|
| `apps/harbor` service | must exist and start | **absent** — `ls apps` yields aigateway, arsy, dock, echolog, empire-web, headquarters, lumen-runtime, orbit, sentinel, skylink |
| accepted D14 contract | community/membership domain accepted | **not accepted** — [BLUEPRINT.md:110](../../BLUEPRINT.md) lists D14–D17 as "Proposed … not globally accepted domain contracts" |
| migrations + tables | the `harbor_*` tables in M32-03 §3.1 / M32-04 §5.2 | **none authored, none applied** |
| consent authority wired to D06 | live grant issue/check/withdraw | not wired; no D06 client call exists for HARBOR |
| object storage wired to ECHOLOG | `content_ref` round-trip | not wired; HARBOR has no ECHOLOG integration |
| real members and rights holder | voluntary members with informed consent | **absent**; M32-01 is itself open and BLOCKED |
| reviewer / integrator | human sign-off | not assigned in this session |
| test runner | the scenarios in M32-03 §6 and M32-04 §12 | **runner files do not exist** |

Consequently any document that claimed "MVP verified, privacy-first confirmed" would be fabricated
evidence, which AGENTS.md forbids ("Report only commands actually executed and results actually
observed"). What this leaf therefore produces is the **machine-checkable gate** that a later,
real run must satisfy, together with the current measured state of each check.

## 2. What "privacy-first" means as a testable claim

Three properties, taken from the prerequisite leaves, and nothing more mystical:

1. **Private by default** — no library content is readable by any other principal, including staff
   roles, absent a §4 exception (M32-03 I-1).
2. **Consent is the only widening mechanism** — visibility increases only through a per-item,
   per-purpose, expiring grant, and an edit invalidates the earlier grant (M32-03 §4.1).
3. **Power is bounded and contestable** — moderation can act only on derivatives, temporary actions
   expire by themselves, and no principal reviews its own act (M32-04 §3, §6.4, §7.2).

Each property maps to executable checks in §4–§6. A property with no check is not claimed.

## 3. Verification Gate Structure

```
G0 preconditions (must all be TRUE before any other gate runs)
 ├─ G1 privacy of the private library          (8 checks)
 ├─ G2 consent correctness                     (9 checks)
 ├─ G3 derivation integrity                    (5 checks)
 ├─ G4 moderation boundaries                   (7 checks)
 ├─ G5 appeals and separation of powers        (5 checks)
 ├─ G6 data-subject rights                     (6 checks)
 ├─ G7 platform boundary conformance           (6 checks)
 └─ G8 release decision                        (owner sign-off; not automatable)
```

Pass rule: every check in G1–G6 is **PASS**, all of G7 is **PASS**, and G8 is signed. A single FAIL in
G1, G2 or G6 is a **release blocker**, not a known issue, because those gates are the privacy claim
itself.

## 4. Gate Checks

Legend: `V` = verification command type (unit / integration / static-scan / manual). Thresholds are
proposed acceptance values, all tunable, none observed in a real deployment.

### G0 — Preconditions

| id | check | V | current state |
|---|---|---|---|
| G0.1 | `apps/harbor` exists with a package manifest exposing `test`, `typecheck`, `migrate` | static-scan | **FAIL — app absent** |
| G0.2 | D14 accepted via an ADR, or the gate is re-scoped to whatever name D14 becomes | manual | **FAIL — proposed only** |
| G0.3 | migrations create the 10 specified tables with the declared CHECK constraints | integration | **FAIL — none authored** |
| G0.4 | ECHOLOG and D06 clients configured for the staging stack | integration | **FAIL** |
| G0.5 | an integrator and a reviewer other than the author are named | manual | **FAIL — not assigned** |

G0 being red means G1–G8 are **not executable**. That is the honest status of the whole leaf.

### G1 — Privacy of the private library

| id | check | expected | V |
|---|---|---|---|
| G1.1 | member A creates `kind=research` item; member B GETs the item | 404, byte-identical response shape to a nonexistent id | integration |
| G1.2 | same, as moderator | 404 | integration |
| G1.3 | same, as admin | 404 | integration |
| G1.4 | same, as legal-reviewer outside an escalated case | 403 + `disclosure-attempt-denied` audit event | integration |
| G1.5 | same, as EMPIRE/ARSY service token | denied, no derivative exists to serve | integration |
| G1.6 | anonymous request with a guessed item id | 404 | integration |
| G1.7 | static scan: any SQL that reads `harbor_library_*` without a `user_id` predicate | 0 occurrences | static-scan |
| G1.8 | response-log grep for body text of a private item across a full test session | 0 occurrences | integration |

G1.7 is the check that catches the class of bug the functional tests can miss: a future "search all
library titles" feature that quietly omits the author predicate.

### G2 — Consent correctness

| id | check | expected | V |
|---|---|---|---|
| G2.1 | publish with no grant | 403 `CONSENT_REQUIRED`, contribution stays `pending-consent` | integration |
| G2.2 | publish `kind=private-note` | 422 `KIND_NOT_PUBLISHABLE`, no contribution row created | integration |
| G2.3 | grant `scope=metadata-only` → member B reads | title + tags present, body absent (not empty string — absent) | integration |
| G2.4 | grant with `expires_at` 1 s in the past | 404, contribution → `revoked-pending-takedown` | integration |
| G2.5 | author edits to `seq=2` after publishing `seq=1` | surface still serves the `seq=1` derivative; `seq=2` requires a fresh grant | integration |
| G2.6 | duplicate grant for `(item, revision, purpose, audience)` | 409, second grant not stored | integration |
| G2.7 | grant lifetime > 365 d | rejected at creation | integration |
| G2.8 | grant naming a specific recipient | no such field exists in the schema; rejected | static-scan |
| G2.9 | withdrawal → readers see 404 within 60 s and a tombstone row exists | PASS | integration |

G2.5 is the single most valuable check in the gate. Edit-after-publish is where consent systems leak in
practice, because the implementation "refreshes" the derivative for convenience.

### G3 — Derivation integrity

| id | check | expected | V |
|---|---|---|---|
| G3.1 | derivative `content_ref` ≠ source revision `content_ref` | assert in test | integration |
| G3.2 | derivative bytes do not contain the source bytes' hash chain or private link edges | scan | integration |
| G3.3 | deleting the contribution leaves the source revision intact and readable by the author | PASS | integration |
| G3.4 | deleting the source item after publication leaves the published derivative readable until takedown | PASS (documented consequence) | integration |
| G3.5 | `UPDATE` on `harbor_library_revisions` | no such route exists; direct DB update is out of contract | static-scan |

### G4 — Moderation boundaries

| id | check | expected | V |
|---|---|---|---|
| G4.1 | report with `targetKind=library-item` | 422, enum rejects it | integration |
| G4.2 | moderator attempts level 5 or 6 | 403 `ROLE_FORBIDDEN` | integration |
| G4.3 | action with no reason code, or `ladder_level=7`, or `RSN-OTHER` at level ≥4 | 422 | integration |
| G4.4 | automated rule attempts level 3 hide | blocked; automation capped at 1–2 | integration |
| G4.5 | level-2 action past `ends_at` | effect removed by the store with no human action | integration |
| G4.6 | subject-facing report view | no reporter identity field present at all | integration |
| G4.7 | audit `detail_json` after inserting an excerpt containing an email + phone | both scrubbed at write time | integration |

### G5 — Appeals and separation of powers

| id | check | expected | V |
|---|---|---|---|
| G5.1 | original actor assigned to their own appeal | refused; reassigned | integration |
| G5.2 | a case participant within 30 d assigned to the appeal | refused | integration |
| G5.3 | holder of a legal hold on the case assigned to the appeal | refused | integration |
| G5.4 | `denied` → second review by a different senior principal | allowed exactly once | integration |
| G5.5 | appeal on `RSN-CONSENT-WITHDRAWN` hide | refused; withdrawal is the author's dispositive act | integration |
| G5.6 | appeal granted while the consent grant is expired | nothing republished; decision names the blocker as authorisation | integration |

### G6 — Data-subject rights (M32-02 §5)

| id | right | check | expected | V |
|---|---|---|---|---|
| G6.1 | access | `GET /me/visibility` | every live grant with purpose, scope, audience, expiry | integration |
| G6.2 | access | item export | NDJSON of own items + revisions + refs, no other member's rows | integration |
| G6.3 | rectification | `reviseItem` | new `seq`, dated, with note; old revision unchanged | integration |
| G6.4 | erasure | delete account | library purged after the retention clock; published derivatives removed; tombstones retained with hashes only | integration |
| G6.5 | restriction | withdraw every grant | all derivatives enter takedown; library untouched | integration |
| G6.6 | portability | export while suspended at level 5 | **succeeds** — suspension must not strand a member's own data | integration |

G6.6 is easy to implement wrong and hard to notice afterwards, because the failure looks like a
safety feature.

### G7 — Platform boundary conformance

| id | rule | source | V |
|---|---|---|---|
| G7.1 | HARBOR creates no second identity table; D00 sessions validated only | M32-02 §3, AGENTS.md | static-scan |
| G7.2 | HARBOR stores no bytes; only ECHOLOG references | ADR-0007, M32-03 I-3 | static-scan |
| G7.3 | no direct cross-domain SQL | M32-02 §4 | static-scan |
| G7.4 | no writes into another domain's tables | M32-02 §4 | static-scan |
| G7.5 | HARBOR is not a second Hub and gains no model catalog or third SQL owner | AGENTS.md (Skylink/EchoLog clauses) | static-scan |
| G7.6 | public surfaces receive only approved derivatives | D06, BLUEPRINT.md:207 | integration |

### G8 — Release decision (not automatable)

| sign-off | who | why it cannot be replaced by G1–G7 |
|---|---|---|
| privacy/rights | security owner | a green suite cannot certify that the consent semantics are the ones the organisation accepts |
| legal | legal reviewer | minors, copyright and statutory disclosure are judgement calls (M03-06 §2–§3) |
| product | owner | "launch a community" is a business act, not a verification outcome |
| first-member need | M32-01 owner | M32-01 is BLOCKED on a real first member and an opt-in journey |

## 5. Evidence Artifacts the Run Must Produce

A verification run is only as good as its artifacts. Required outputs, all synthetic:

| artifact | content | retention |
|---|---|---|
| `m32-05-gate.json` | per-check id, PASS/FAIL, commit SHA, started/finished, duration | 90 d |
| `m32-05-captures/` | request/response pairs with PII scrubbed, never raw bodies of private items | 30 d |
| `m32-05-scans.txt` | static-scan findings with file:line for G1.7, G3.5, G7.1–G7.5 | 90 d |
| `m32-05-rights.log` | G6 traces proving erasure and portability completed | 90 d |
| `m32-05-signoff.md` | the three G8 signatures with dates | indefinite |

The SHA requirement matters: the register asks for "positive/negative acceptance evidence at exact
SHA". A gate result without a pinned `dev` SHA is not evidence for any specific state of the code.

## 6. Current Measured State

Commands actually executed while authoring this leaf, and what they returned:

```
$ git rev-parse --abbrev-ref HEAD
dev
$ git log --oneline -1
e3d6c0c docs(audit): M32-04 moderation reporting and appeals specification — baseline established
$ ls apps
aigateway  arsy  dock  echolog  empire-web  headquarters  lumen-runtime  orbit  sentinel  skylink
$ ls docs/audit | grep -c "M32-0[2345]"
3        # M32-02, M32-03, M32-04 exist; no M32-05 evidence file other than this gate document
```

Not executed, because they cannot succeed: any HARBOR test, any migration, any consent round-trip, any
moderation action, any real erasure. No `pnpm verify` run is claimed for HARBOR because HARBOR has no
package to verify.

Aggregate gate state at baseline:

| gate | checks | PASS | FAIL | NOT RUN |
|---|---|---|---|---|
| G0 | 5 | 0 | 5 | 0 |
| G1 | 8 | 0 | 0 | 8 |
| G2 | 9 | 0 | 0 | 9 |
| G3 | 5 | 0 | 0 | 5 |
| G4 | 7 | 0 | 0 | 7 |
| G5 | 6 | 0 | 0 | 6 |
| G6 | 6 | 0 | 0 | 6 |
| G7 | 6 | 0 | 0 | 6 |
| G8 | 4 | 0 | 0 | 4 |

**36 of 56 checks are not runnable; 5 preconditions are red. The MVP is not verified and cannot be
verified at this baseline.**

## 7. Positive Test for This Leaf

The acceptance the register states for a LEAF is "deliver one reviewed artifact and positive/negative
acceptance evidence at exact SHA". For a verification leaf whose subject does not exist, the positive
test is that the gate is complete, self-consistent and executable-as-written:

| # | assertion | how checked |
|---|---|---|
| PT-1 | every check id in G1–G7 traces back to a rule authored in M32-02/03/04 | cross-reference §4 rows against the two prerequisite docs |
| PT-2 | no check demands data that would itself breach privacy (e.g. "dump all library rows to compare") | review — checks use two synthetic members and assert absence, never bulk reads |
| PT-3 | the gate distinguishes release blockers from defects | §3 pass rule |
| PT-4 | the document states non-execution plainly rather than implying success | §1, §6 |
| PT-5 | `m32-05-gate.json` schema is defined so a future run is comparable across SHAs | §5 |

Observed: PT-1…PT-5 hold by construction of this document (the rules cited exist in the two
specifications in this repository at `e3d6c0c`). This is a documentation-level pass, deliberately not
presented as product verification.

## 8. Negative Test for This Leaf

| # | scenario | expected safe failure |
|---|---|---|
| NT-1 | a future contributor marks M32-05 checked on the strength of a green `pnpm verify` in another app | must be refused: G0.1 fails, HARBOR has no package; cross-app CI proves nothing here |
| NT-2 | an attempt to satisfy G1.7 by running `SELECT * FROM harbor_library_items` in a test helper | the check asserts *no* such unscoped query exists; a helper that adds one is a FAIL, not a shortcut |
| NT-3 | evidence captured with raw private bodies "so we can debug later" | violates §5 (`m32-05-captures/` must be scrubbed); run is invalid |
| NT-4 | verification at an unpinned SHA | rejected; §5 SHA requirement |
| NT-5 | passing G2.9 by deleting the item instead of the derivative | FAIL — M32-03 I-6 requires the author's history to survive withdrawal |
| NT-6 | treating the absence of apps/harbor as "nothing to break, therefore pass" | FAIL — §6 records NOT RUN, not PASS |
| NT-7 | verifying consent semantics with a real witness account | refused; packet §8 (real source/rights missing) and AGENTS.md keep secrets and private witness material out of evidence |

NT-1 and NT-6 are the two ways this leaf could be falsely closed. Both are named so an integrator can
reject them on sight.

## 9. Risks

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | the gate is treated as if it were a verification result | high | high | §6 table with NOT RUN counts, and NT-1/NT-6 named as rejection criteria |
| R-2 | thresholds (60 s cache, 365 d, 24 h SLA) harden into law without measurement | medium | medium | each is labelled a proposed acceptance value, tunable, unobserved |
| R-3 | D14 renaming invalidates ids in the checks | medium | low | checks cite behaviours (G0.2 says re-scope on rename) rather than a frozen domain name |
| R-4 | G1.7/G7 static scans give false confidence if their rules are thin | medium | high | each scan must report file:line findings and an empty result must be diffable |
| R-5 | privacy checks pass on synthetic members while real consent copy is incomprehensible | medium | high | G8 keeps a human rights sign-off; a green G2 does not clear the wording |
| R-6 | moderation gate runs without a real reviewer roster, so G5.1–G5.3 are vacuous | high | high | M32-04 R-1 contingency must be resolved before G5 can be meaningfully executed |
| R-7 | erasure test (G6.4) passes while backups retain purged content | medium | severe | erasure must assert backup/replica policy, not only the primary table |
| R-8 | this leaf closes M32 entirely in people's minds | medium | medium | milestone exit gate still requires G1–G8 actually run |

## 10. Deferred / Follow-on Work

| # | item | to |
|---|---|---|
| 1 | implement the gate runner that emits `m32-05-gate.json` | implementation task, only after G0 clears |
| 2 | real D06 consent-client integration tests | D06 owner + implementation |
| 3 | backup/replica erasure proof for G6.7-class extension | implementation + ops |
| 4 | load and quota calibration for M32-03 §3.2 defaults | post-pilot |
| 5 | accessibility and locale verification of consent/moderation copy | MASTER_DESIGN + a11y review |
| 6 | security pen-test of the read paths | security owner |
| 7 | DPIA-style record for a community product | legal owner |
| 8 | metrics dashboard for takedown SLA adherence | implementation |
| 9 | re-scope the gate once D14 is accepted or renamed | integrator |
| 10 | extend G7 scans to a shared repo-wide boundary linter | governance owner |

## 11. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. no runner, table, or flag exists to unwind because none was created;
3. if a later implementation ships and this gate is superseded, three properties must survive:
   **checks assert absence rather than bulk-read private data (§8 NT-2)**, **a not-runnable check is
   recorded as NOT RUN and never as PASS (§8 NT-6)**, and **cross-app CI green is never accepted as
   HARBOR evidence (§8 NT-1)**.

## 12. Report

| field | value |
|---|---|
| `task_id` | M32-05 |
| `baseline_sha` | `e3d6c0c` (dev, M32-04) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M32-05-privacy-first-community-mvp-verification-gate.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files |
| `positive_test_and_output` | §7 PT-1…PT-5 (documentation-level consistency assertions, satisfied by construction against the two prerequisite specs in-tree) |
| `negative_test_and_output` | §8 NT-1…NT-7 (seven ways this gate must be refused, including treating it as a verification result) |
| `security_rights_privacy` | checks assert absence of disclosure rather than reading private content; no raw private bodies in evidence; no real accounts used; G8 retains a human rights/legal sign-off that automation cannot replace |
| `reviewer` | integrator + security owner + legal reviewer (G8); none assigned in this session |
| `rollback` | §11 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | the MVP is **not verified**; 5 preconditions FAIL and 36 of 56 checks are NOT RUN; all thresholds are proposed values, none measured; D14 remains unaccepted; M32-01 (real first-member need) is open and BLOCKED |
| `next_eligible_task` | M36-02 — Specify calibration units and timestamp provenance (M32's remaining work needs an accepted D14 and a running app, i.e. human decisions, not further specification) |

## 13. Conclusion

The strongest thing this leaf can contribute is a refusal to confuse a plan with a result. The gate is
concrete — 56 checks, each traceable to a rule already authored in M32-02, M32-03 and M32-04, each
naming the failure it is there to catch, each pinned to the artifacts a real run must emit. What it is
not is evidence that HARBOR works, because `apps/harbor` has never existed in this repository. Recording
that asymmetry plainly, and pre-committing the three shortcuts that would make the gate look greener
than the product (§8 NT-1, NT-6, NT-7), is what lets a later run be trusted when it finally happens.

## Appendix A: Gate Execution Order

```
G0 preconditions ──all true──> stand up staging stack (synthetic members only)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   G1 privacy              G2 consent               G3 derivation
        │                        │                        │
        └───────────┬────────────┴────────────┬───────────┘
                    ▼                         ▼
              G4 moderation             G6 rights
                    └───────────┬─────────────┘
                                ▼
                          G5 appeals
                                ▼
                          G7 boundaries
                                ▼
                    assemble artifacts (§5) + pin SHA
                                ▼
                          G8 human sign-off
                                ▼
                          release decision
```

Any path that reaches G8 without G1, G2 or G6 fully green is void by the §3 pass rule.

## Appendix B: `m32-05-gate.json` Shape

```json
{
  "task": "M32-05",
  "baseline_sha": "<dev sha under test>",
  "started_at": "<ISO8601>",
  "finished_at": "<ISO8601>",
  "stack": "staging",
  "member_data": "synthetic",
  "gates": {
    "G1": {
      "checks": [
        {"id": "G1.1", "result": "PASS", "duration_ms": 42,
         "note": "404 with identical shape to unknown id", "artifact": "captures/g1-1.json"},
        {"id": "G1.7", "result": "NOT_RUN", "reason": "scan rules not authored"}
      ],
      "blockers_present": false
    }
  },
  "summary": {"pass": 0, "fail": 0, "not_run": 0, "release_blockers": []},
  "signoffs": {"privacy": null, "legal": null, "product": null, "first_member_need": null}
}
```

Rules encoded by the shape: `result` is only ever `PASS`, `FAIL`, or `NOT_RUN` — there is no
`SKIPPED`, `WAIVED`, or `N/A`; a `NOT_RUN` must carry a `reason`; `release_blockers` is populated from
G1/G2/G6 failures per §3; and every check names the artifact that proves it, so an empty
`artifact` string is itself a failure.

## Appendix C: Traceability Map (check → authored rule)

| gate | source rule |
|---|---|
| G1.1–G1.6 | M32-03 §4.4 read-path matrix, §3.3 I-1, §5 404-not-403 |
| G1.7–G1.8 | M32-03 §3.3 I-1 extended to a repo-wide scan |
| G2.1–G2.8 | M32-03 §4.1 grant rules 1–4, §3.2 `private-note` never publishable |
| G2.9 | M32-03 §4.5 withdrawal steps, §3.3 I-6 |
| G3.1–G3.5 | M32-03 §4.2 derivation, §3.1 immutable revisions |
| G4.1–G4.7 | M32-04 §2.2 targetKind enum, §3 ladder, §4 reason codes, §6.2 PII rules |
| G5.1–G5.6 | M32-04 §7.2 separation pseudocode, §7.4 decisions, §7.5 restoration rule |
| G6.1–G6.6 | M32-02 §5 six user rights; M32-03 §3.2 export/delete; M32-04 §3 suspension carve-out |
| G7.1–G7.6 | M32-02 §3 and §4 cross-domain rules; ADR-0007; BLUEPRINT.md:207 (D06); AGENTS.md |
| G8 | packet §8 stop rule; M32-01 real first-member dependency |

## Appendix D: Glossary (selected)

| term | definition used here |
|---|---|
| gate | a set of executable checks whose combined result licenses a release decision |
| precondition | a fact that must hold before any check can be run at all |
| release blocker | a failure that voids the release decision rather than becoming a tracked defect |
| NOT_RUN | recorded when a check could not execute; never equivalent to PASS |
| assert-absence check | a test that proves data is *not* disclosed, as opposed to reading everything and comparing |
| pinned SHA | the exact commit the gate ran against, required for register acceptance |
| scrubbed capture | request/response evidence with identifiers and private bodies removed before storage |
| sign-off | a named human approval that cannot be substituted by automation |
| synthetic member | a test principal that exists only in a test fixture and has no real-world identity |
| boundary conformance | G7: the app respects the repo's existing domain and storage ownership |
