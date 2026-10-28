# M21-05 — HQ review inbox for AI-suggested claims or edits

**Task:** M21-05 — "Implement HQ review inbox for AI-suggested claims or edits".
**Acceptance under test:** "Human reviewer required for canonical action".
**State:** implementation and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. `TODO.md` was not modified.
**Worker:** agent session (one new module, one new test file, one export line, this report).
**Date of observation:** 2026-10-27 (local).
**baseline_sha:** `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (branch `dev`, short `891bf5e`).

## Baseline and worktree

- Observed `dev` HEAD at start: `891bf5e19edbbea3d5e5ada36a7b126f35fabf94`. No commit, stage, push, rebase or delete was performed by this session.
- `apps/aigateway` was clean at start: `git status --porcelain -- apps/aigateway` produced no output. The repository worktree was already dirty elsewhere (`apps/cockpit`, `apps/arsy`, `apps/dock`, `apps/headquarters`, `packages/moonql*`, `docs/audit/screens`, various untracked files). Those paths belong to other sessions; none were opened for write or modified.
- During the work, parallel sessions advanced `dev` to `ab6668b682456278c627a72143b834f1c2936320` (`docs(m19): audit the Dock rights projection and record a UNILEX leak`), preceded by `6341095`. `git diff --stat 891bf5e..HEAD -- apps/aigateway` is empty: neither commit touches this package. This session did not rebase, merge or edit those paths.
- The task packet `docs/tasks/M21/M21-05.md` and the closed sibling implementations `docs/audit/M21-03-permission-retrieval.md` / `docs/audit/M21-04-source-guard.md` were read. The M21-05 TODO row remains unchecked.
- Baseline verification before the change: `pnpm --filter @moonwitness/aigateway test` — 44 tests, 44 pass, 0 fail, exit 0.

## Method

A **pure, dependency-free review-inbox policy** was added at the AI Gateway boundary, following the accepted M21-03/M21-04 leaf pattern. `apps/aigateway/src/review-inbox.ts` has no imports, no network, no filesystem, no database, no environment lookup, no provider/server dependency and no wall clock. The caller supplies the suggestion, its recorded decisions, the reviewer authorizations and `evaluatedAt`.

The module answers one question per canonical-action request: *may this AI suggestion become canonical?* It does not create the canonical action, persist a decision, notify a reviewer or render an inbox.

### Data model

- **Suggestion:** `{ id, kind: 'CLAIM' | 'EDIT', sourceId, proposedBy, proposedAt, payloadSummary, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' }`.
- **Decision:** `{ actor, role, decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', decidedAt, note?, conflictOfInterest? }`.
- **Authorization (caller-supplied):** `{ principalRef, principalKind: 'HUMAN' | 'AI_AGENT', role, expiresAt? }`.
- **Policy:** `{ requiredRole, reviewerAuthorizations, evaluatedAt }`.
- **Request:** `{ suggestion, decisions }`, where `decisions` is the recorded history for that suggestion.

`evaluateCanonicalAction(request, policy)` evaluates one request. `evaluateReviewInbox(requests, policy)` evaluates a list in order, returns one decision per input and never throws for a malformed request.

### Rule order and reason codes

Checks run in this fixed order, so the first reason is deterministic:

| # | Rule | Result when it fails |
|---|---|---|
| 1 | Policy shape: object, non-blank `requiredRole`, `reviewerAuthorizations` array of entries with a valid principal ref, exact `principalKind`, non-blank `role` and an optional parseable `expiresAt`, parseable ISO `evaluatedAt` | `POLICY_MISSING`, `POLICY_TIMESTAMP_INVALID`, `REVIEWER_AUTHORIZATION_INVALID` |
| 2 | Request is an object with a `suggestion` object whose fields are valid: opaque id, known kind, opaque source id, non-blank proposer, parseable `proposedAt`, non-blank string `payloadSummary`, known status | `REQUEST_MISSING`, `SUGGESTION_MISSING`, `SUGGESTION_FIELD_MISSING`, `SUGGESTION_FIELD_INVALID`, `SUGGESTION_ID_INVALID`, `SUGGESTION_KIND_INVALID`, `SUGGESTION_SOURCE_ID_INVALID`, `SUGGESTION_TIMESTAMP_INVALID`, `SUGGESTION_STATUS_INVALID` |
| 3 | Suggestion lifecycle is `APPROVED`; pending, withdrawn and rejected suggestions never pass | `SUGGESTION_PENDING`, `SUGGESTION_WITHDRAWN`, `SUGGESTION_REJECTED` |
| 4 | Decision history is an array with exactly one entry (missing, non-array and more than one entry are distinct refusals) | `DECISION_MISSING`, `DECISIONS_INVALID`, `DUPLICATE_DECISION` |
| 5 | The single decision is well formed: non-blank actor, non-blank role, known value, parseable `decidedAt`, string `note` if present, boolean `conflictOfInterest` if present | `REVIEWER_MISSING`, `REVIEWER_ROLE_MISSING`, `DECISION_INVALID`, `DECISION_TIMESTAMP_INVALID` |
| 6 | The decision value is exactly `APPROVE` | `DECISION_NOT_APPROVE` |
| 7 | No declared conflict of interest | `REVIEWER_CONFLICT_OF_INTEREST` |
| 8 | The actor is human: a non-human ref prefix (`ai:`/`agent:`/`model:`/`bot:`/`service:`/`robot:` with optional `principal:`/`actor:`/`user:` prefix) is refused; an authorization whose declared `principalKind` is `AI_AGENT` can never satisfy the approval | `REVIEWER_NOT_HUMAN` |
| 9 | The actor is not the proposer (no self-approval) | `REVIEWER_IS_PROPOSER` |
| 10 | `decision.role` equals `requiredRole` exactly | `REVIEWER_ROLE_MISSING` |
| 11 | A matching principal authorization exists, is declared `HUMAN` and carries the required role | `REVIEWER_NOT_AUTHORIZED` |
| 12 | At least one matching authorization is unexpired at the caller's `evaluatedAt` (absent expiry means no recorded expiry) | `REVIEWER_AUTHORIZATION_EXPIRED` |
| 13 | Otherwise allow with reviewer, role, approval timestamp, policy version and caller timestamp | allowed decision |

A non-array request list yields `REQUEST_LIST_INVALID`.

Complete reason-code list (30):

`REQUEST_LIST_INVALID`, `REQUEST_MISSING`, `POLICY_MISSING`, `POLICY_INVALID`, `POLICY_TIMESTAMP_INVALID`, `REVIEWER_AUTHORIZATION_INVALID`, `SUGGESTION_MISSING`, `SUGGESTION_FIELD_MISSING`, `SUGGESTION_FIELD_INVALID`, `SUGGESTION_ID_INVALID`, `SUGGESTION_KIND_INVALID`, `SUGGESTION_SOURCE_ID_INVALID`, `SUGGESTION_TIMESTAMP_INVALID`, `SUGGESTION_STATUS_INVALID`, `SUGGESTION_PENDING`, `SUGGESTION_WITHDRAWN`, `SUGGESTION_REJECTED`, `DECISIONS_INVALID`, `DECISION_MISSING`, `DECISION_INVALID`, `DECISION_TIMESTAMP_INVALID`, `DECISION_NOT_APPROVE`, `DUPLICATE_DECISION`, `REVIEWER_MISSING`, `REVIEWER_ROLE_MISSING`, `REVIEWER_NOT_HUMAN`, `REVIEWER_NOT_AUTHORIZED`, `REVIEWER_AUTHORIZATION_EXPIRED`, `REVIEWER_IS_PROPOSER`, `REVIEWER_CONFLICT_OF_INTEREST`.

`POLICY_INVALID` is declared in the union but is not emitted by the current normalizer; malformed authorization entries map to `REVIEWER_AUTHORIZATION_INVALID`, and missing required policy fields map to `POLICY_MISSING`.

### Refusal shape

A refusal is constructed from a fixed field list: `suggestionId`, `allowed: false`, `reason`, `policyVersion`, `evaluatedAt` (`null` when the policy itself is malformed). It has no `payloadSummary`, `note`, `sourceId`, `proposedBy`, `suggestion`, `decisions`, `decision`, `text`, `content`, `snippet`, `body` or `url` field. Suggestion and source ids are restricted to an opaque shape (`^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$`) so an echoed id cannot carry a scheme, slash, query or fragment.

## Files

- `apps/aigateway/src/review-inbox.ts` — new, pure module and types (`REVIEW_INBOX_POLICY_VERSION`, `ClaimSuggestion`, `ReviewerDecision`, `ReviewerAuthorization`, `ReviewInboxPolicy`, `CanonicalActionRequest`, `CanonicalActionDecision`, `evaluateCanonicalAction`, `evaluateReviewInbox`). No imports.
- `apps/aigateway/test/m21-05-review-inbox.test.ts` — new, 15 `tsx --test` / `node:test` tests (3 positive, 11 negative, 1 determinism) with synthetic canary fixtures.
- `apps/aigateway/src/index.ts` — one line added: `export * from './review-inbox.js'`, directly after the existing re-exports. The file was clean (`git status --porcelain -- apps/aigateway` empty) before this edit.
- `docs/audit/M21-05-review-inbox.md` — this report.

`git status --porcelain -- apps/aigateway` after the work shows exactly:

```
 M apps/aigateway/src/index.ts
?? apps/aigateway/src/review-inbox.ts
?? apps/aigateway/test/m21-05-review-inbox.test.ts
```

No provider, router, server, route, schema, package manifest, config, migration or HQ file was changed.

## Positive evidence

Command (working directory `Z:\project\moonradio\apps\aigateway`), exit code **0**:

```
pnpm exec tsx --test --test-name-pattern "M21-05 positive" test/m21-05-review-inbox.test.ts
```

```
✔ M21-05 positive: an authorized human reviewer who is not the proposer approves and canonical action is allowed (1.5064ms)
✔ M21-05 positive: an EDIT suggestion with a live role-scoped grant passes (0.2299ms)
✔ M21-05 positive: a mixed inbox returns one ordered decision per request (0.2609ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113.0971
```

What the positive tests prove:

- A synthetic `CLAIM` suggestion proposed by `principal:fixture:model-run-001`, holding status `APPROVED` and populated with a URL-bearing canary `payloadSummary`, is allowed only when the single recorded decision is an explicit `APPROVE` by a distinct human `principal:fixture:reviewer-001` who holds a live `canonical-reviewer` authorization. The allowed result names the suggestion, kind, opaque source id, reviewer principal, reviewer role, approval timestamp, policy version and caller timestamp. It does **not** echo `payloadSummary`, the canary or the URL.
- An `EDIT` suggestion passes with a second live role-scoped grant present; an unrelated `viewer` grant does not interfere.
- A mixed inbox returns exactly one ordered decision per request: the first allowed, the second refused as `SUGGESTION_WITHDRAWN`.

## Negative evidence

Command (same directory), exit code **0**:

```
pnpm exec tsx --test --test-name-pattern "M21-05 negative" test/m21-05-review-inbox.test.ts
```

```
✔ M21-05 negative: an approved suggestion with no recorded decision cannot become canonical (2.0329ms)
✔ M21-05 negative: pending, withdrawn and rejected suggestions never pass (0.3951ms)
✔ M21-05 negative: non-approve decisions cannot become canonical (0.395ms)
✔ M21-05 negative: a reviewer without a live exact-role authorization fails closed (0.8379ms)
✔ M21-05 negative: the proposer cannot approve its own suggestion even with a valid grant (0.2157ms)
✔ M21-05 negative: an AI principal can never approve, even when granted the required role (0.2287ms)
✔ M21-05 negative: a declared conflict of interest fails closed (0.3134ms)
✔ M21-05 negative: duplicate decisions are refused instead of the later decision overriding (0.1776ms)
✔ M21-05 negative: malformed suggestions and decisions fail closed without echoing input (0.5755ms)
✔ M21-05 negative: malformed or missing policy fails closed before any approval (0.4129ms)
✔ M21-05 negative: no refusal in a mixed inbox carries payload, note, source id or URL (0.3543ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 166.39
```

Scenario-to-code coverage (all fixtures synthetic):

| Scenario | Observed reason |
|---|---|
| Status `APPROVED`, `decisions: []` | `DECISION_MISSING` |
| Status `PENDING` / `WITHDRAWN` / `REJECTED` with an APPROVE decision present | `SUGGESTION_PENDING` / `SUGGESTION_WITHDRAWN` / `SUGGESTION_REJECTED` |
| Decision `REJECT` / `REQUEST_CHANGES` | `DECISION_NOT_APPROVE` |
| Reviewer with no matching authorization | `REVIEWER_NOT_AUTHORIZED` |
| Decision role `viewer` while `requiredRole` is `canonical-reviewer` | `REVIEWER_ROLE_MISSING` |
| Matching authorization carrying a different role | `REVIEWER_NOT_AUTHORIZED` |
| Matching authorization expired (`expiresAt` before `evaluatedAt`) | `REVIEWER_AUTHORIZATION_EXPIRED` |
| Only another principal is authorized | `REVIEWER_NOT_AUTHORIZED` |
| Proposer recorded as the approving actor with a valid human grant | `REVIEWER_IS_PROPOSER` |
| AI principal (`principalKind: 'AI_AGENT'`) with the required role | `REVIEWER_NOT_HUMAN` |
| `principal:agent:007` labelled `HUMAN` | `REVIEWER_NOT_HUMAN` |
| `conflictOfInterest: true` | `REVIEWER_CONFLICT_OF_INTEREST` |
| Two APPROVE decisions, or APPROVE followed by REJECT | `DUPLICATE_DECISION` |
| Non-object request, missing suggestion, non-object suggestion, missing id, URL-shaped id, unknown kind, missing/URL-shaped source id, missing proposer, invalid `proposedAt`, non-string/blank `payloadSummary`, unknown status | `REQUEST_MISSING`, `SUGGESTION_MISSING`, `SUGGESTION_FIELD_MISSING`, `SUGGESTION_ID_INVALID`, `SUGGESTION_KIND_INVALID`, `SUGGESTION_SOURCE_ID_INVALID`, `SUGGESTION_TIMESTAMP_INVALID`, `SUGGESTION_FIELD_INVALID`, `SUGGESTION_STATUS_INVALID` |
| Decision list not an array, non-object decision, missing reviewer, missing role, unknown decision value, invalid `decidedAt`, non-string note, non-boolean conflict flag | `DECISIONS_INVALID`, `DECISION_INVALID`, `REVIEWER_MISSING`, `REVIEWER_ROLE_MISSING`, `DECISION_TIMESTAMP_INVALID` |
| Missing/non-object policy, missing required role, missing authorizations, missing/invalid `evaluatedAt`, non-array authorizations, unknown principal kind, blank authorization role, invalid authorization expiry | `POLICY_MISSING`, `POLICY_TIMESTAMP_INVALID`, `REVIEWER_AUTHORIZATION_INVALID`; `evaluatedAt: null` |

Every refusal is checked by a shared assertion for the absence of the payload-bearing keys listed above and for the absence of the canary, `payload.example`, `://`, the source id, the proposer ref and the reviewer ref anywhere in the serialized decision. A dedicated mixed-inbox test repeats that assertion over a batch containing status, self-approval, AI, duplicate and URL-shaped-id refusals.

## Commands and observed results

All commands were run locally on 2026-10-27. No network, model provider, database, Docker, browser or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `git rev-parse HEAD` / `git status --short` (repo root), before the change | `891bf5e19edbbea3d5e5ada36a7b126f35fabf94`; `apps/aigateway` clean, unrelated paths dirty |
| `pnpm --filter @moonwitness/aigateway test` (repo root), before the change | 44 tests, 44 pass, 0 fail, exit 0 |
| `pnpm exec tsx --test --test-name-pattern "M21-05 positive" test/m21-05-review-inbox.test.ts` (`apps/aigateway`) | 3 tests, 3 pass, 0 fail, exit 0 |
| `pnpm exec tsx --test --test-name-pattern "M21-05 negative" test/m21-05-review-inbox.test.ts` (`apps/aigateway`) | 11 tests, 11 pass, 0 fail, exit 0 |
| `pnpm --filter @moonwitness/aigateway test` (repo root), after the change | 59 tests, 59 pass, 0 fail, exit 0, 488.5651 ms (44 existing + 15 M21-05) |
| `pnpm --filter @moonwitness/aigateway typecheck` (repo root) | `tsc --noEmit`, no diagnostics, exit 0 |
| `pnpm exec eslint apps/aigateway/src/review-inbox.ts apps/aigateway/test/m21-05-review-inbox.test.ts` (repo root) | no output, exit 0 |
| `git status --porcelain -- apps/aigateway` / `git diff -- apps/aigateway/src/index.ts` | exactly the three expected paths; the diff is the single added export line |

`pnpm typecheck` compiles `src` only. The test file is type-aware linted through the repository's ESLint `projectService` and `apps/aigateway/test/tsconfig.json`, and that scoped ESLint run passed.

## Security, rights and privacy notes

- **Fail-closed construction.** A refusal is built from a fixed field list. Extra input fields such as `payloadSummary`, `note` or `sourceId` are never copied into a decision.
- **No suggestion content in refusals.** The canary includes a URL; every refusal is asserted free of the canary, the host name, `://`, the source id, the proposer ref and the reviewer ref. Test failure messages print the decision object, not the suggestion payload.
- **Human approval is structural.** Reaching the allowed result requires an explicit `APPROVE` decision, a distinct actor, an exact required role, a live caller-supplied authorization declared `HUMAN`, and passing the non-human ref check. An `AI_AGENT` authorization can never satisfy the approval even when its role matches.
- **One decision per suggestion.** A second recorded decision is refused as `DUPLICATE_DECISION`; the evaluator does not pick the later one, so a replay cannot silently override a prior decision.
- **Expiry uses only the caller clock.** `evaluatedAt` is parsed and used for authorization expiry; no wall clock is read. Missing authorization fails as `REVIEWER_NOT_AUTHORIZED`.
- **No real data.** All fixtures are synthetic strings, reserved example hostnames and fake opaque ids. No witness, private source, AI output, secret, environment value or production record was used or written.
- **No ambient state or side effects.** No network, filesystem, database, provider or clock. No decision is persisted, no notification is sent and no canonical record is created.
- **Bounded work.** The evaluator is linear in the small decision and authorization arrays; ids are capped at 128 characters and principal refs at 512. No formal complexity or ReDoS audit was performed.

## Explicit non-claims

- **No HQ UI, route or database wiring.** No Headquarters page, inbox view, API route, schema, table, migration, notification or queue was added or changed. HQ is not touched by this task, and `apps/aigateway/src/index.ts` only re-exports the module. The module is not called by `server.ts`, `router.ts` or any provider.
- **No canonical write.** The evaluator returns a decision descriptor. It does not apply the suggestion, publish a claim, edit a source or record the decision.
- **Principal kind is declared, not authenticated.** `principalKind`, reviewer refs and decision actors are caller-supplied. The non-human ref check is a prefix heuristic, not identity verification, and this module cannot detect a caller that mislabels an AI principal as human.
- **No reviewer or decision store.** There is no persisted decision history; the caller passes the history in and must enforce uniqueness at its own store. The duplicate rule protects this evaluation only.
- **No model, provider, database, schema, consent store, rights store or ACL source** was touched or introduced.
- **No production data, CI, Docker or deployment success** is claimed.
- **No TODO or milestone closure.** M21-05 remains unchecked; the integrator must review the evidence and record the result SHA.
- **No reviewer approval.** Reviewer is unassigned in this report.

## Limitations

- **Prototype scope.** This is a policy module, not an inbox. There is no queue, claim-lease, reviewer assignment, SLA, pagination, search, audit log or UI.
- **Caller-supplied history.** Duplicate detection only sees the `decisions` array passed for one request. A caller that drops a prior decision from the array can replay an approval; the module cannot know the store's history.
- **No identity or signature verification.** A human-looking principal ref with a `HUMAN` authorization is trusted. No signature, session, MFA, issuer or approval reference is checked.
- **Heuristic non-human detection.** The prefix check covers `ai:`/`agent:`/`model:`/`bot:`/`service:`/`robot:` forms; a differently named AI principal that is also declared `HUMAN` is not detected.
- **Status must be pre-set.** The suggestion's `status` is an input, not derived from the decision. An `APPROVED` status with a missing or non-approve decision is refused, but a caller that never advances the status leaves a valid approval blocked.
- **Conflict of interest is declared only.** Self-approval is enforced; other conflicts (employer, family, financial, source ownership) pass unless the caller sets `conflictOfInterest: true`. The module has no relationship graph.
- **Role model is a single exact string.** There is no hierarchy, delegation, quorum or separation-of-duties beyond one approver. A second reviewer is not required.
- **Timestamps are syntactic except expiry.** `proposedAt` and `decidedAt` are parsed but not ordered against each other or against `evaluatedAt`; only authorization expiry uses the caller clock. A future-dated decision is not refused.
- **No freshness or revocation window.** An authorization with no `expiresAt` never expires. Revocation is not modeled; omitting the authorization is the only revocation signal.
- **Allow result echoes metadata.** The allowed decision includes the opaque suggestion id, kind, source id, reviewer ref, role and timestamps. It does not include the payload summary, but a caller that derives ids from content could still leak through an id; the opaque id shape limits but cannot eliminate that.
- **Runtime inputs are not frozen.** Types are `readonly`, but objects are not frozen. Determinism is proven only for unchanged inputs.
- **Package-root import side effects.** `src/index.ts` remains the Fastify bootstrap and now also re-exports this module; importing the built package root still starts the server by existing design. No consumer was changed.

## Rollback

Delete the three new files:

1. `apps/aigateway/src/review-inbox.ts`
2. `apps/aigateway/test/m21-05-review-inbox.test.ts`
3. `docs/audit/M21-05-review-inbox.md`

Then remove the single line `export * from './review-inbox.js'` from `apps/aigateway/src/index.ts`. No schema, data, dependency, environment, route, HQ or provider change requires reverting.

## Report fields

- `task_id`: M21-05
- `baseline_sha`: `891bf5e19edbbea3d5e5ada36a7b126f35fabf94`
- `worker`: agent session
- `claimed_files`: `apps/aigateway/src/review-inbox.ts`, `apps/aigateway/test/m21-05-review-inbox.test.ts`, `apps/aigateway/src/index.ts`, `docs/audit/M21-05-review-inbox.md`
- `actual_changed_files`: same four paths; `apps/aigateway/src/index.ts` changed by one export line
- `positive_test_and_output`: `pnpm exec tsx --test --test-name-pattern "M21-05 positive" test/m21-05-review-inbox.test.ts` — 3/3 pass, 0 fail, exit 0 (verbatim above); full package `pnpm --filter @moonwitness/aigateway test` — 59/59 pass, 0 fail, exit 0
- `negative_test_and_output`: `pnpm exec tsx --test --test-name-pattern "M21-05 negative" test/m21-05-review-inbox.test.ts` — 11/11 pass, 0 fail, exit 0 (verbatim above); every refusal asserted to carry no payload, note, source id, URL, canary or text-like key
- `security_rights_privacy`: pure deny-by-default review policy; no network/filesystem/database/clock; canonical action requires one explicit APPROVE from a distinct, live, exact-role human reviewer; AI principals and self-approval always refused; duplicate decisions refused rather than overridden; expired/missing authorization fails closed; refusals carry only an opaque id, reason, version and caller timestamp; synthetic fixtures only; no rights, consent, publication or canonical write is performed
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the three new files and the export line (above)
- `result_sha`: no commit created by this session. Current `dev` HEAD is `ab6668b682456278c627a72143b834f1c2936320` (advanced by two unrelated M19 documentation commits, neither touching `apps/aigateway`), with the four uncommitted paths listed above on top of it. The integrator records the result SHA after review.
- `limitations`: prototype policy only; no HQ UI/route/DB store, no canonical write and no notification; caller-supplied decision history and declared principal kinds are unauthenticated; non-human detection is a prefix heuristic; single approver and single exact role; other conflicts only if declared; timestamps not ordered; no revocation; no browser, DB, CI or deployment evidence
- `next_eligible_task`: M21-07 — "Test forged citations, scope bypass and auto-publication denial" (its prerequisites M21-04 and M21-06 are closed; M21-05 must be integrated first)
