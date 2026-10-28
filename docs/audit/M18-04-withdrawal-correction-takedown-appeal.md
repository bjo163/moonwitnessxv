# M18-04 — Withdrawal, correction, takedown and appeal lifecycle

- **Task:** M18-04 (P1, D4) — "Implement withdrawal, correction, takedown and appeal process".
- **Acceptance under test:** Revoked content ceases public availability.
- **Prerequisites:** M18-03 and M03-06, both closed in `TODO.md`.
- **State:** implementation and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. `TODO.md` was not edited.
- **Worker:** agent session (one new module, one new test file, this report).
- **Date of observation:** 2026-10-28 (local).
- **Baseline branch/SHA:** `dev` / `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (short `5b70e76`), recorded with `git rev-parse HEAD` at task start.
- **Evidence SHA:** `4fc8cdc240273740a14a3ebedd2be0e02d982199` (`4fc8cdc`), the HEAD observed before and after the final test run. HEAD advanced during the session through nine commits by other work (docs, Dock tests, the M18-06 research label modules, the M16-04 media consent/ACL change, and two TODO close commits); none touched this task's three files. No rebase, reset, checkout, commit, stage, push or branch operation was performed by this worker.

## Baseline and worktree

- Observed `git rev-parse --abbrev-ref HEAD` = `dev`; `git rev-parse HEAD` at start = `5b70e76cfe81a9d310c17f4a02ca022aa84beb87`.
- The worktree was already dirty on entry: `.env.example`, `apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/headquarters`, `apps/echolog`, `packages/moonql-witness/src/index.ts`, `packages/moonql/src/rest.ts`, and `docs/audit/screens/*`. Those belong to other sessions and were neither opened for write, staged, restored nor deleted.
- During the session, HEAD moved from `5b70e76` to `4fc8cdc` through other sessions' commits: documentation, Dock reader tests, the M18-06 `projection-label.ts` / `source-label.ts` feature work, the M16-04 media consent/ACL work, and two TODO close commits. Those paths are not part of this task's claim; they were not read, edited or removed by this worker. At final status, `packages/moonql-research` shows only this task's untracked module and test directory; the other new modules were committed by their own session.
- `packages/moonql-research/package.json`, `tsconfig.json` and `src/index.ts` were not edited. `git diff --stat` for those three paths produced no output. The new `test/` directory contains only this task's test file.
- No commit, stage, push, rebase or branch operation was performed. The three files below remain untracked for the integrator.

## Method

A **pure, self-contained** module was added at `packages/moonql-research/src/withdrawal.ts`. It has **no imports at all**: no ORM, route, store, database, filesystem, environment, network, clock, crypto or barrel dependency. It models an append-only request lifecycle over caller-supplied release and request records and answers one question for a public read: may this exact release be publicly available now?

### Request lifecycle

```text
SUBMITTED -> UNDER_REVIEW -> ACCEPTED | REJECTED
```

| Kind | Who may submit | Who may decide | Effect when accepted |
|---|---|---|---|
| `WITHDRAWAL` | bound `RIGHTS_HOLDER` or `WITNESS` | `REVIEWER` or `GOVERNANCE`, not the requester | Release becomes `WITHDRAWN`; public availability ends permanently |
| `CORRECTION` | bound `RIGHTS_HOLDER` or `WITNESS` | `REVIEWER` or `GOVERNANCE`, not the requester | Release becomes `CORRECTED`; the old version is superseded and a new approved release is required |
| `TAKEDOWN` | `GOVERNANCE` or `REVIEWER` | `REVIEWER` or `GOVERNANCE`, not the requester | Reversible quarantine recorded on the ledger; the release record is not destroyed |
| `APPEAL` | bound `RIGHTS_HOLDER` or `WITNESS` | `REVIEWER` only, not the requester and not the original takedown reviewer | Reinstates the referenced accepted takedown only when later in time and decided with a reinstatement reason code |

A withdrawal cannot be rejected (`WITHDRAWAL_IS_A_RIGHT`), following M03-06 §3.1. A correction follows M18-03's rule that a correction is a new release, never an in-place overwrite. A takedown follows M03-06 §3.2: quarantine without damaging the underlying record. An appeal follows four-eyes review: the appellant cannot decide, and the reviewer who accepted the takedown cannot reinstate it.

### Public-availability order

`evaluatePublicAvailability(release, requests)` checks, in this fixed order:

| # | Rule | Refusal |
|---|---|---|
| 1 | Release is an object with non-empty id/ref, a known state and the exact `public` scope | `RELEASE_FIELD_MISSING`, `RELEASE_FIELD_INVALID`, `RELEASE_STATE_UNKNOWN`, `PUBLIC_SCOPE_INVALID` |
| 2 | A `WITHDRAWN` or `CORRECTED` release is always unavailable, before any request is read | `RELEASE_WITHDRAWN`, `RELEASE_CORRECTED` |
| 3 | Rights and consent references exist and their scopes equal `public` | `RIGHTS_REFERENCE_MISSING`, `CONSENT_REFERENCE_MISSING`, `RIGHTS_SCOPE_MISMATCH`, `CONSENT_SCOPE_MISMATCH` |
| 4 | Ledger is a list of well-formed, single-id records bound to this release | `REQUEST_LIST_INVALID`, `REQUEST_FIELD_MISSING`, `REQUEST_FIELD_INVALID`, `REQUEST_ID_MISSING`, `REQUEST_ID_REPLAY`, `REQUEST_KIND_UNKNOWN`, `REQUEST_STATE_UNKNOWN`, `REQUEST_TIMESTAMP_INVALID`, `REQUEST_RELEASE_MISMATCH` |
| 5 | Every non-rejected request has an authorized requester; every decided request has an independent decider with a recorded known reason | `REQUESTER_ROLE_UNKNOWN`, `REQUESTER_NOT_AUTHORIZED`, `REQUESTER_NOT_BOUND`, `REQUESTER_SCOPE_MISMATCH`, `SELF_REVIEW_FORBIDDEN`, `APPEAL_SELF_REVIEW`, `APPEAL_REVIEWER_REQUIRED`, `ACTOR_NOT_AUTHORIZED` |
| 6 | Every non-rejected appeal names an accepted takedown of this release; an accepted appeal has a reinstatement reason, an independent decider and a later decision instant | `APPEAL_TARGET_MISSING`, `APPEAL_TARGET_UNKNOWN`, `APPEAL_TARGET_INVALID`, `APPEAL_TARGET_OTHER_RELEASE`, `REINSTATEMENT_REASON_MISSING`, `APPEAL_BEFORE_TAKEDOWN` |
| 7 | A pending withdrawal, correction or takedown blocks availability (deny-by-default) | `REQUEST_PENDING` |
| 8 | An accepted withdrawal or correction blocks availability | `RELEASE_WITHDRAWN`, `RELEASE_CORRECTED` |
| 9 | Every accepted takedown must be overturned by its own accepted, valid, later appeal | `RELEASE_TAKEDOWN` |
| 10 | Otherwise the release is available, carrying only the opaque rights and consent references | success |

A rejected request is terminal and has no effect; it cannot block availability merely because its historical requester is no longer in the caller-supplied binding list.

### Opaque refusals

Every refusal interface contains only an opaque id and a stable reason code:

- `{ accepted: false, requestId, reason }` for submit/triage/decision.
- `{ applied: false, releaseId, reason }` for release-state application.
- `{ available: false, releaseId, reason }` for public availability.

No refusal has a request, revision, text, URL, locator, digest, payload or content key. Every test asserts the exact key set and checks that five synthetic canaries attached to the release and request inputs never appear in any result, positive or negative.

### Input hardening

All inputs are `unknown` and whitelisted. Unknown release states, request kinds, request states, actor roles, requester roles and reason codes are refused rather than ignored. Partially decided records, decided records without decider/reason, records with a wrong policy version, empty required ids, non-ISO timestamps and decisions earlier than submission are refused. Duplicate request ids, duplicate open requests, replayed triage and replayed decisions are refused. `decidedAt` is never read from a wall clock; both the release and the clock are caller-supplied.

## Files

- `packages/moonql-research/src/withdrawal.ts` — new, 1076 lines, pure module and types.
- `packages/moonql-research/test/withdrawal.test.mjs` — new, 1023 lines, 38 `node:test` cases with synthetic fixtures.
- `docs/audit/M18-04-withdrawal-correction-takedown-appeal.md` — this report.

Nothing else was created or changed by this task. `TODO.md`, `packages/moonql-research/src/index.ts`, `package.json`, `tsconfig.json`, schemas, migrations, routes and all pre-existing modified/untracked files were left untouched.

## Positive evidence

Command, run from `packages/moonql-research`:

```text
node --experimental-strip-types --test test/withdrawal.test.mjs
```

Exit code **0**, 38 tests, 38 pass, 0 fail. Verbatim output:

```text
✔ positive: a published release with rights and consent references is available (1.8974ms)
✔ positive: withdrawal moves SUBMITTED -> UNDER_REVIEW -> ACCEPTED and blocks public availability (1.2998ms)
✔ positive: applying an accepted withdrawal moves the release to WITHDRAWN and keeps its references (0.5322ms)
✔ positive: an accepted correction supersedes the old release; a new release needs its own approval (0.355ms)
✔ positive: an accepted takedown quarantines the release without mutating its record (0.3219ms)
✔ positive: an accepted appeal by an independent reviewer with a recorded reason reinstates the release (0.464ms)
✔ positive: a pending appeal does not outrank an accepted takedown (0.3887ms)
✔ positive: a rejected appeal leaves the accepted takedown in force (0.4546ms)
✔ positive: a rejected takedown leaves the release available (0.3354ms)
✔ positive: a witness may submit a withdrawal within the exact public scope (0.3432ms)
✔ positive: accepted requests and availability results carry no text, URL or locator (0.2971ms)
✔ positive: a rejected request does not block availability even when its historical requester is unbound (0.1612ms)
✔ negative: an unknown release state is refused (0.1168ms)
✔ negative: a non-public scope is refused (0.108ms)
✔ negative: missing rights or consent references are refused (0.1124ms)
✔ negative: rights or consent cleared for another scope are refused (0.1005ms)
✔ negative: a WITHDRAWN or CORRECTED release is never public, whatever the ledger says (0.0829ms)
✔ negative: a malformed request ledger is refused (0.1174ms)
✔ negative: unknown request kinds and states are refused (0.1118ms)
✔ negative: duplicate request ids in one ledger are a replay (0.1898ms)
✔ negative: a second open request of the same kind is refused (0.0973ms)
✔ negative: a request bound to another release is refused (0.0866ms)
✔ negative: a pending withdrawal or takedown blocks availability (0.0973ms)
✔ negative: a missing, unknown or mismatched requester is refused (0.1367ms)
✔ negative: a requester role that does not match the request kind is refused (0.0837ms)
✔ negative: a missing or unknown actor is refused (0.1412ms)
✔ negative: an actor without a deciding role is refused (0.1398ms)
✔ negative: the requester cannot begin or decide their own request (0.1283ms)
✔ negative: a withdrawal cannot be rejected (0.1102ms)
✔ negative: a decision before review or a replayed decision is refused (0.1437ms)
✔ negative: a stale request copy that diverges from the ledger record is a replay (0.605ms)
✔ negative: missing, unknown or invalid decision input is refused (0.1787ms)
✔ negative: an appeal requires an accepted takedown target (0.2363ms)
✔ negative: an appeal cannot be submitted or decided by the takedown reviewer (0.2659ms)
✔ negative: an appeal cannot be decided by its requester or by governance alone (0.1938ms)
✔ negative: a forged accepted appeal without a reinstatement reason, an independent reviewer or correct order is refused (0.2166ms)
✔ negative: an appeal cannot revive an accepted withdrawal (0.2671ms)
✔ negative: applying to an already terminal or mismatched release is refused (0.1989ms)
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 169.0278
```

What the positive cases prove:

- A `PUBLISHED` release with non-null rights/consent references for the exact `public` scope is available.
- A withdrawal moves `SUBMITTED -> UNDER_REVIEW -> ACCEPTED`; the accepted record names the reviewer, role, timestamp and reason, and the release stops being publicly available (`RELEASE_WITHDRAWN`).
- Applying an accepted withdrawal moves the release record to `WITHDRAWN` while retaining its rights/consent references; the release stays unavailable.
- An accepted correction supersedes the old release (`RELEASE_CORRECTED`); a different release id with no requests is available, showing that corrected content needs its own approved release rather than an in-place edit.
- An accepted takedown quarantines the release (`RELEASE_TAKEDOWN`) but is not a release-state mutation (`REQUEST_KIND_NOT_APPLICABLE` when applied as one).
- An accepted appeal by a different reviewer, later than the takedown and with `APPEAL_UPHELD`, restores availability.
- A pending appeal does not restore availability while the accepted takedown stands.
- A rejected appeal leaves the takedown in force; a rejected takedown leaves the release available.
- A witness can submit a withdrawal within the exact public scope.
- Rejected requests cannot block availability after their historical requester leaves the binding list.
- Accepted request records and availability successes carry none of the hostile text/URL/locator payloads.

## Negative evidence

Every negative case below was asserted to return `accepted: false`, `applied: false` or `available: false`, with the named stable reason code and exactly the refusal keys. All 38 cases also assert no canary leaks.

| Scenario | Observed reason |
|---|---|
| Unknown release state `RETRACTED` | `RELEASE_STATE_UNKNOWN` |
| Release scope `internal` | `PUBLIC_SCOPE_INVALID` |
| `rightsReference: null` | `RIGHTS_REFERENCE_MISSING` |
| `consentReference: null` | `CONSENT_REFERENCE_MISSING` |
| Rights scope `internal` | `RIGHTS_SCOPE_MISMATCH` |
| Consent scope `internal` | `CONSENT_SCOPE_MISMATCH` |
| Release already `WITHDRAWN` / `CORRECTED` | `RELEASE_WITHDRAWN` / `RELEASE_CORRECTED` |
| Ledger is a string or contains `null` / a record without id | `REQUEST_LIST_INVALID` / `REQUEST_FIELD_MISSING` / `REQUEST_ID_MISSING` |
| Unknown request kind `RETRACTION` | `REQUEST_KIND_UNKNOWN` |
| Unknown request state `RETRACTED` | `REQUEST_STATE_UNKNOWN` |
| Same request id twice in one ledger or submitted again | `REQUEST_ID_REPLAY` |
| Second open request of the same kind | `DUPLICATE_REQUEST` |
| Request bound to another release id | `REQUEST_RELEASE_MISMATCH` |
| Pending withdrawal or pending takedown | `REQUEST_PENDING` |
| Missing requester | `REQUESTER_MISSING` |
| Unknown requester role `ADMIN` | `REQUESTER_ROLE_UNKNOWN` |
| Requester scope `internal` | `REQUESTER_SCOPE_MISMATCH` |
| Rights holder not bound to the release | `REQUESTER_NOT_BOUND` (submit and forged ledger) |
| Reviewer or rights holder using a role not valid for the kind | `REQUESTER_NOT_AUTHORIZED` |
| Missing actor / unknown actor role `ADMIN` | `ACTOR_MISSING` / `ACTOR_ROLE_UNKNOWN` |
| Actor with only `RIGHTS_HOLDER` decides | `ACTOR_NOT_AUTHORIZED` |
| Requester begins or decides their own withdrawal | `SELF_REVIEW_FORBIDDEN` |
| Withdrawal rejected by a reviewer | `WITHDRAWAL_IS_A_RIGHT` |
| Decision before `UNDER_REVIEW` | `REQUEST_NOT_UNDER_REVIEW` |
| Triage replayed / decision replayed | `REQUEST_ALREADY_IN_REVIEW` / `REQUEST_ALREADY_DECIDED` |
| Stale request copy whose state or decider diverges from the ledger record | `REQUEST_ID_REPLAY` |
| Decision `null`, action `APPROVE` | `DECISION_INVALID` |
| Decision without reason / unknown reason `FREE_TEXT_NOTE` | `DECISION_REASON_MISSING` / `DECISION_REASON_UNKNOWN` |
| Decision earlier than submission | `REQUEST_TIMESTAMP_INVALID` |
| Appeal without target / unknown target / non-accepted takedown / other release | `APPEAL_TARGET_MISSING` / `APPEAL_TARGET_UNKNOWN` / `APPEAL_TARGET_INVALID` / `APPEAL_TARGET_OTHER_RELEASE` |
| Appeal submitted by the takedown reviewer | `APPEAL_SELF_REVIEW` |
| Appeal decided by the takedown reviewer, by its requester, or by governance alone | `APPEAL_SELF_REVIEW` / `APPEAL_SELF_REVIEW` / `APPEAL_REVIEWER_REQUIRED` |
| Forged accepted appeal with `APPEAL_DENIED`, by its requester, by governance, or before the takedown | `REINSTATEMENT_REASON_MISSING` / `APPEAL_SELF_REVIEW` / `APPEAL_REVIEWER_REQUIRED` / `APPEAL_BEFORE_TAKEDOWN` |
| Withdrawal accepted, then a fully valid takedown and reinstatement appeal | `RELEASE_WITHDRAWN` (appeal cannot revive it) |
| Apply to terminal/mismatched release, pending request, or request absent from the ledger | `RELEASE_WITHDRAWN` / `REQUEST_RELEASE_MISMATCH` / `REQUEST_NOT_ACCEPTED` / `REQUEST_FIELD_MISSING` |

## Commands and observed results

All commands were run locally on 2026-10-28. No network, database, Docker, build or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `git rev-parse --abbrev-ref HEAD` / `git rev-parse HEAD` (repo root, start) | `dev` / `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` |
| `git rev-parse HEAD` (repo root, final evidence, before and after the 38-case run) | `4fc8cdc240273740a14a3ebedd2be0e02d982199` |
| `pnpm typecheck` (`packages/moonql-research`), before and after the change | `tsc --noEmit`, no diagnostics, exit 0 |
| `node --experimental-strip-types --test test/withdrawal.test.mjs` (`packages/moonql-research`) | 38 tests, 38 pass, 0 fail, exit 0, 169.0278 ms |
| `pnpm exec eslint packages/moonql-research/src/withdrawal.ts packages/moonql-research/test/withdrawal.test.mjs` (repo root) | no output, exit 0 |
| `git status --short -- packages/moonql-research` (repo root, final) | `?? packages/moonql-research/src/withdrawal.ts`, `?? packages/moonql-research/test/` |
| `git diff --stat -- packages/moonql-research/src/index.ts packages/moonql-research/package.json packages/moonql-research/tsconfig.json` (repo root) | no output; none of those files changed |

The first full test run after implementation failed one case because the availability assertion hard-coded the original release id while the correction test deliberately evaluates a new release id. The assertion was corrected to accept the expected id. A later hardening step required the request passed to triage, decision and application to equal the ledger record exactly, refusing a stale or divergent copy as `REQUEST_ID_REPLAY`; the first draft of that test asserted a state refusal that the pipeline checks earlier, and a second assertion reused the request-refusal helper on the application result, which returns `applied` rather than `accepted`. Both test mistakes were corrected, and the final run above is 38/38.

## Security, rights and privacy notes

- **Revocation is terminal.** A `WITHDRAWN` or `CORRECTED` release is refused before any request is read, and an accepted withdrawal/correction refuses availability even when the ledger also contains a fully valid takedown and reinstatement appeal. No appeal, takedown resolution, role, or score can revive it.
- **Takedown outranks appeal.** A pending appeal does not restore availability; only an accepted appeal by a different `REVIEWER`, decided after the takedown, with a recorded reinstatement reason, overturns that exact takedown.
- **Withdrawal is a right.** A valid withdrawal request cannot be rejected; the module refuses `WITHDRAWAL_IS_A_RIGHT`.
- **Requester scope.** Withdrawal/correction/appeal require a bound `RIGHTS_HOLDER` or `WITNESS` and the exact `public` scope. Takedown requires `GOVERNANCE` or `REVIEWER`. Scope is an exact string match; there is no hierarchy or wildcard.
- **Four-eyes review.** A requester cannot begin or decide their own request. An appeal cannot be submitted or decided by the takedown reviewer, and cannot be decided by governance alone.
- **Fail closed.** Unknown states, kinds, roles and reason codes; missing actors/requesters; missing rights/consent references; wrong scopes; duplicate ids; duplicate open requests; stale or divergent request copies; partial decisions; replay; malformed ledgers; and every appeal anomaly produce a stable refusal instead of availability.
- **Refusal minimization.** Refusals carry only `requestId` or `releaseId` plus a reason code. Tests assert exact keys and the absence of five synthetic text/URL/locator/payload canaries in every result.
- **No real data.** Fixtures are `fixture:`/`principal:fixture:`/`release_fixture_` strings only. No witness material, source text, consent record, secret, environment value, production identifier or reviewer identity was used or written.
- **No alternate authority.** The module cannot approve, publish, grant rights, infer consent, create a reviewer or move the current release pointer. It reads caller-supplied records; the origin of an approval remains the M18-01/ADR-0003 human path and M18-03's manifest/pointer.
- **No new owner.** No SQL table, migration, store, route, Hub, model catalog or identity authority was added.

## Limitations

- **In-process prototype only.** The module is not imported by `src/index.ts`, the review subsystem, Dock, any route, endpoint, projection, search, export or cache. No consumer exists yet.
- **No D08 store, database, schema or migration.** Releases, requests and decisions are in-memory caller-supplied objects. Nothing is persisted and no audit trail is written by this module.
- **No authentication or signature.** The ledger, actor list, binding lists, timestamps and `decidedByRole` are supplied by the caller. A party able to rewrite the ledger could forge a self-consistent accepted request; `decidedByRole` is recorded evidence, not proof. Ledger write authority, authentication, monotonic sequencing and durable audit belong to the unimplemented D08 store.
- **Pending requests can deny availability.** Deny-by-default means a pending withdrawal, correction or takedown blocks a public read. A party able to submit an authorized request could therefore cause temporary unavailability; there is no rate limit or independent complaint review in this prototype.
- **No wall clock.** Every timestamp is caller-supplied. The module checks ordering, not real time, and does not re-evaluate rights/consent expiry; M18-03 evaluates consent expiry only at the pointer instant.
- **Opaque references only.** Rights and consent references are checked for presence and exact scope, not for validity, authenticity or legal sufficiency. No rights or consent record is read.
- **Correction needs another release.** This module supersedes the corrected version but does not build the replacement manifest, obtain approval or move the pointer; that remains M18-03 plus the human path.
- **Takedown is reversible; withdrawal is not.** An accepted withdrawal or correction cannot be appealed into availability by design. A takedown is a quarantine recorded on the ledger, not a destructive release-state change.
- **No notification or legal workflow.** No requester notification, legal hold, evidence retention, counter-notice or jurisdiction handling is modeled.
- **No downstream invalidation.** Search, preview, export, AI retrieval and generated caches are not invalidated here; M18-05 owns that. Concurrency, wrong-role and broader replay tests beyond the ledger remain M18-07.
- **Caller-supplied ids.** `requestId` and `releaseId` are echoed unchanged as opaque ids; the module neither hashes nor validates their syntax. A caller that puts text, a URL or a locator into an id would defeat refusal minimization. The fixtures use opaque synthetic ids only.
- **Exact-string scopes.** `public` must match character-for-character; there is no hierarchy, wildcard or normalization.
- **Prototype review unassigned.** No human reviewer has approved this artifact; the integrator must review the evidence and decide the TODO checkbox.

## Rollback

Delete the three new files:

1. `packages/moonql-research/src/withdrawal.ts`
2. `packages/moonql-research/test/withdrawal.test.mjs` (and the now-empty `packages/moonql-research/test/` directory, which contains no other file)
3. `docs/audit/M18-04-withdrawal-correction-takedown-appeal.md`

No existing file, export, schema, migration, dependency, environment, route or stored data requires reverting. `packages/moonql-research/src/index.ts`, `package.json` and `tsconfig.json` were never edited.

## Report fields

- `task_id`: M18-04
- `baseline_sha`: `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (`dev`, at task start); final evidence ran at externally advanced `4fc8cdc240273740a14a3ebedd2be0e02d982199`
- `worker`: agent session
- `claimed_files`: `packages/moonql-research/src/withdrawal.ts`, `packages/moonql-research/test/withdrawal.test.mjs`, `docs/audit/M18-04-withdrawal-correction-takedown-appeal.md`
- `actual_changed_files`: same three paths, all new/untracked; no existing file changed by this task
- `positive_test_and_output`: `node --experimental-strip-types --test test/withdrawal.test.mjs` from `packages/moonql-research` — 38 tests, 38 pass, 0 fail, exit 0, 169.0278 ms; positive cases cover availability, withdrawal/correction/takedown lifecycle, appeal reinstatement, pending/rejected appeals, witness withdrawal, rejected-request neutrality, and canary absence
- `negative_test_and_output`: same 38/38 run — all refusal scenarios in the table above, each checked for exact refusal keys and zero canary leaks
- `security_rights_privacy`: terminal withdrawal/correction, reversible takedown, four-eyes appeal, bound requester roles and exact public scope, fail-closed unknown states/roles/ids/stale copies/replay/missing references, minimized opaque refusals, synthetic fixtures only, no secrets or real source content
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the three new files (above); no existing path changes
- `result_sha`: no commit created by this worker; worktree contains the three new files atop observed HEAD `4fc8cdc`; the integrator owns the result SHA
- `limitations`: pure in-process prototype, caller-supplied ledger/actors/clock, no authentication/signature/durable audit, pending-request availability denial, no consent re-evaluation, opaque reference checks only, correction needs a new M18-03 release, no notification/legal workflow, no downstream cache/search invalidation (M18-05), concurrency outside scope (M18-07), exact-string scopes, reviewer unassigned
- `next_eligible_task`: M18-05 — "Invalidate search, preview, export and generated cache on revoke" after integrator acceptance of M18-04. M18-02 remains independently open; M18-06 was closed by another session at `2300cd0` during this work; M18-07 still waits for M18-05 and the now-closed M18-06.
