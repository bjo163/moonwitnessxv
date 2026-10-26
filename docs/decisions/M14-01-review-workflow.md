# M14-01 — Role-Scoped Review Workflow and the Human Release Boundary

- **Milestone**: M14 MIZAN and human research review
- **Task**: M14-01
- **Status**: ACCEPTED — engineering contract, not a human review
- **Depends on**: M13-05 (bounded derived reading), M03-04 (auth actors and roles), M14-02..M14-07
- **Evidence of record**: `docs/audit/M14-mizan-review.md`, `docs/decisions/M13-01-srgbgl-p19-gates.md`
- **Implementation**: `packages/moonql-research/src/{seed,review,index}.ts`, `apps/radio/test/mizan.test.ts`, `apps/radio/test/mizan-pg.test.ts`

---

## 1. Decision

Reviewed knowledge claims use one explicit, role-scoped state machine. A review can only move
through named actions by a named human actor loaded from `auth_users`; no endpoint accepts a
free-text reviewer name, no candidate is auto-approved, and no review row can be approved at
creation time. Publication is not implemented in M14: a review can become **release-eligible**
under the documented criteria, but the system reports `publicationAvailable: false` everywhere.

> A green suite, a checksum, or a commit is not a human reviewer attestation. `humanReviewed`
> is only true when a named reviewer approved a review whose evidence, counterevidence, MIZAN
> run and pilot all pass the derived release check.

## 2. State machine

States: `DRAFT` → `SUBMITTED` → `REVIEWED`, with `REJECTED`, `DISPUTED` and the terminal
`RETRACTED`.

| Action | From | To | Who |
|---|---|---|---|
| `SUBMIT` | `DRAFT` | `SUBMITTED` | the named submitter only |
| `APPROVE` | `SUBMITTED` | `REVIEWED` | named reviewer, different from the submitter (four-eyes) |
| `REJECT` | `SUBMITTED` | `REJECTED` | named reviewer, different from the submitter |
| `REQUEST_REVISION` | `SUBMITTED` | `DRAFT` | named reviewer, reason required |
| `DISPUTE` | `REVIEWED` | `DISPUTED` | any named non-guest actor, reason required |
| `RESOLVE_DISPUTE` | `DISPUTED` | `REVIEWED` | named actor, not the disputer, reason required |
| `RETRACT` | any non-terminal | `RETRACTED` | submitter, reviewer, or admin, reason required |

`REJECTED` can still be retracted but never resubmitted; corrections go through a new version
of the draft after `REQUEST_REVISION`. `RETRACTED` is terminal. Every transition increments the
review `version` and appends one immutable event with `eventKey = reviewCode:action:versionTo`.

## 3. Named actors and four-eyes

- `register` accepts `auth` but re-checks the actor through `humanActor()`: guest and anonymous
  callers are rejected (`403`/`401`), and the display name must exist on the `auth_users` row.
- `submit` requires the caller to be the registered submitter.
- `decide` requires a named reviewer whose `id` differs from the submitter; self-approval is
  refused even for admins.
- `resolve` refuses the disputer as resolver.
- `retract` preserves the prior decision fields; retraction is a new state, never a deletion.

## 4. Exact-SHA evidence

Registration binds `evidenceSha` to the case SHA; the target must belong to the same case and
already carry the same exact SHA. Counterevidence registration, pilot annotations and MIZAN
runs all repeat that check, so a forged or stale digest yields `400` and cannot create a row.
The seed case `RC-QS-002-082-AR` is pinned to `QURAN_SHA256 =
c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912`; the translation and
unresolved-edition cases cannot produce an eligible release.

## 5. Counterevidence

Approval requires at least one registered counterevidence item for the case, and every item
must be resolved (`ACKNOWLEDGED` or `REJECTED`) with a written reason. Seeded items
`CE-QS2-82-RECIPIENT` and `CE-QS2-82-DEFINITION` start `OPEN`, which keeps the seeded case
ineligible until a named reviewer records a resolution. Counterevidence identity fields are
immutable; resolution is append-only and a second resolution returns `409`.

## 6. MIZAN bounds

`MIZAN-EVIDENCE-RISK-CONSISTENCY` v1 is a candidate method (`CANDIDATE_NOT_RATIFIED`) pinned by
canonical text and SHA-256:

```text
MIZAN v1 criteria: evidenceGrounding,counterevidenceCoverage,provenance,consistency,riskDisclosure,unknownHonesty; each 0-4; total 24; no ranking; not divine judgment.
```

Six criteria × 0–4 = 24. A run must bind a registered method by code/version/SHA, supply
explanation, context and unknowns, and store the server-computed total; mismatches are `400`.
The score never merges with maturity/quality/witness/direction, never ranks traditions, and is
never a verdict: `scoreIsVerdict: false` on every projection.

## 7. Human pilot

A pilot status is `RECORDED` only when at least two distinct named annotators assessed the same
case at the same exact SHA. Duplicate annotators return `409`; a different SHA returns `400`.
Agreement is computed and reported, but disagreement does **not** block recording — it is
evidence for the reviewer. With fewer than two annotators the status remains `BLOCKED`, and no
pilot row is seeded in this milestone.

## 8. Release criteria

`releaseVerdict()` returns `eligible: true` only when all of the following hold: state
`REVIEWED`, decision `APPROVED`, named reviewer, reviewer ≠ submitter, exact case SHA present,
target at that SHA, counterevidence present and resolved with reasons, a bounded MIZAN run
bound to the registered method, and a `RECORDED` pilot. Even then:

- `publicationAvailable: false`
- `autoApproved: false`
- `scoreIsVerdict: false`
- `humanReviewed` follows eligibility only

Approval through the API re-runs the same verdict; a pilot with recorded disagreement must be
acknowledged explicitly before approval. M14 has no publish endpoint.

## 9. Concurrency and immutability

Transitions run under a per-review in-process mutex and a version compare-and-swap. A stale
`expectedVersion` returns `409` with `expected version X, found Y`. The immutable event table
adds a second, durable guard through the unique `eventKey`, so a cross-process race still ends
with exactly one approval event. Review identity fields, events, runs and annotations are
append-only; hooks reject updates and deletes of events, runs and annotations and reject
changes to counterevidence identity.

## 10. What this does not mean

- No human has yet reviewed anything: seeds are engineering data, and pilot rows are only
  created by tests with named test users.
- Release eligibility is not publication, rights clearance, or a theological verdict.
- MIZAN is a bounded engineering rubric, not a divine judgment or a ranking of traditions.
- The pilot process is prepared but not executed with real annotators; until it is, the
  pilot gate stays `BLOCKED`.
