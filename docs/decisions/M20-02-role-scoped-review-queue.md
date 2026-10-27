# M20-02 — Role-Scoped Review Queue and Work-Item Lifecycle (Design)

**Status:** M20-02 design proposal, not an accepted ADR. It does not authorize code, schema, routes, role changes or publication.

- **Milestone**: M20 — Headquarters and 100CENTER human governance
- **Task**: M20-02 (acceptance: *No account may approve its own restricted submission*)
- **Status**: DESIGN DRAFTED at tree `eef0c54`, re-verified at `b24bedd` — awaiting integrator review. This document creates no code, schema, migration, route or UI. The integrator, not this document, closes the TODO leaf.
- **Baseline**: task lease `00b006443da8a1b9408226ed776e15090f0e640b`; the cited tree was re-read at `eef0c54a057c884c04aa8a9a9efa76b0b9e54f13` and again at `b24bedd5f2e457039ef18ceff39e08f61636077d` after parallel sessions advanced `dev`. No file cited below changed across those commits (`git diff --name-only 00b0064..b24bedd -- apps/headquarters packages/moonql packages/moonql-auth packages/moonql-research packages/moonql-ops packages/moonql-apikeys` was empty).
- **Domain**: **D12 Workflow** owns the queue and lifecycle; **D08 Publication/Governance** owns rights decisions, sign-off, release and publication; **D00/ARSY** owns identity. HQ is the review surface, not an authority.
- **References**: [M20-01 audit](../audit/M20-01-hq-model-ui-route-guards-ops.md), [M18-01 publication gate](../audit/M18-01-single-publication-state-machine.md), [M14-01 review workflow](M14-01-review-workflow.md), [M03-04 roles](M03-04-tenant-role-boundaries.md), [ADR-0001](ADR-0001-arsy-is-xv-hub.md), [ADR-0002](ADR-0002-additive-moonql-domains.md), [ADR-0003](ADR-0003-source-rights-and-consent.md), [BLUEPRINT](../../BLUEPRINT.md), [SECURITY](../architecture/SECURITY.md), [LUMEN approval boundary](../architecture/LUMEN.md), [TODO row M20-02](../../TODO.md).

---

## 0. Scope and explicit non-scope

**Delivered here (design only):**

1. The work-item vocabulary and its D12/D08/D00 ownership boundary.
2. The work-item state machine and transition table.
3. The actor/role/mandate matrix, including what `admin` may **not** do.
4. The server-side enforcement pipeline (hub-owned) and the HQ thin-client contract.
5. The self-approval rule, including the two-account overlapping-scope case.
6. The audit/evidence trail that a later implementation must write.
7. The denial UX for M20-01 findings N1 and N3, and the queue's own denial posture.
8. The follow-up implementation leaves and the decisions registered for ADR/D08.

**Explicitly not delivered here:**

| Concern | Owner |
|---|---|
| Any table, migration, addon package, endpoint, server action or UI component | a later, separately authorized leaf |
| Which rights/consent states make a submission "restricted" | **BLOCKED-ON-D08** (see §10) |
| Rights clearance, approval-within-scope semantics, `PUBLISHED`, withdrawal/takedown/appeal | D08 / M18-04 |
| Adding `editor`/`reviewer` to the login-role enum | **NEEDS_ADR** (D00), not this task |
| Reviewer-scope grant storage and assignment policy | **NEEDS_ADR** (D12/D00/D08) |
| HQ database, HQ role table, second identity, second approval engine | forbidden ([BLUEPRINT:110](../../BLUEPRINT.md), [BLUEPRINT:206](../../BLUEPRINT.md)) |
| General audit attribution/retention | M20-05 |

---

## 1. Placement and authorities

### 1.1 One queue owner, one decision owner

[BLUEPRINT:210](../../BLUEPRINT.md) assigns D12 "Human task/review queue and AI suggestion lifecycle" to one orchestration owner; [BLUEPRINT:206](../../BLUEPRINT.md) assigns D08 "Rights decision, reviewer/sign-off, release/withdraw/retract and consent policy" to all public publishing gates. [BLUEPRINT:110](../../BLUEPRINT.md) forbids a second REST hub, login system, editor, approval engine or graph database, and [docs/architecture/APPS.md:11](../architecture/APPS.md) names `apps/headquarters` as the privileged review/governance frontend where "human approval and audit remain".

Therefore:

- The **work-item state, scope grants and transition events are hub data** (ARSY/MoonQL, D12). They live in the existing MoonQL-owned schema under [ADR-0002](ADR-0002-additive-moonql-domains.md); no new SQL owner is created.
- **D08 remains the only publisher.** The queue stops at `APPROVED_WITHIN_SCOPE`; it has no `PUBLISHED` state, no release endpoint and no manifest. This keeps the single publication path of [M18-01:12-26](../audit/M18-01-single-publication-state-machine.md) intact and avoids a second approval engine.
- **HQ only renders and submits.** It has no database, no role table and no eligibility logic; every decision is re-checked by the hub (§5).
- **D00 remains the only identity.** Scope grants reference `auth_users`; they do not duplicate users, sessions or credentials ([BLUEPRINT:198](../../BLUEPRINT.md), [ADR-0001](ADR-0001-arsy-is-xv-hub.md)).

### 1.2 What already exists and is reused, not reinvented

| Seam | Existing behaviour (cited) | Reuse in this design |
|---|---|---|
| Identity rows and login roles | `auth_users.role` is `sel(['admin','user','guest'])`; `auth_users` has `rest: false`; only `/auth/login`, `/auth/logout`, `/auth/me` are exposed (`packages/moonql-auth/src/index.ts:36-46,85,111,126`) | Actor resolution and the named-human check |
| Role gate + row predicate | `resolveAcl`/`checkAcl` (`packages/moonql/src/acl.ts:13-40`), `preHandler` (`packages/moonql/src/rest.ts:120-126`), row rules for list/get/update (`packages/moonql/src/rest.ts:163-197,202-223,248-267`) | Coarse page gate and per-row visibility |
| Four-eyes transition pattern | `transitionReview` lock + version CAS + guard + event append (`packages/moonql-research/src/review-subsystem.ts:215-262`); unique `eventKey` (`:374-388`); immutable identity fields (`:265-289`); append-only event hooks (`:504-514`) | The queue's transition engine |
| Named-human check | `humanActor` requires a display name and an `admin`/`user` role (`packages/moonql-research/src/common.ts:74-89`) | Extended with machine-principal refusal (§5.2) |
| HQ server-side route guards | `guardModel`/`guardView`/`guardEndpoint` (`apps/headquarters/src/lib/authz.ts:82-101`), denial codes (`:19-27`), `AccessDenied` (`apps/headquarters/src/ui/widgets/AccessDenied.tsx:14-53`) | Page and action denial UX |

**Not reused as evidence:** `ops_audit`. It is written fire-and-forget by a bus listener whose comment says "the 'who' is not on the bus, by design" (`packages/moonql-ops/src/index.ts:54-60`), its columns carry no actor (`:70-81`), and it is purged on a daily cron with a default 14-day retention (`:190-193`). It cannot prove who approved what. The queue writes its own append-only events (§7); M20-05 owns the general audit contract.

---

## 2. Vocabulary

| Term | Meaning | Owner |
|---|---|---|
| `review_task` | One work item: an exact target revision submitted for an independent human decision in one scope | D12 |
| `review_task_event` | One immutable transition record for a task | D12 |
| `review_scope_grant` | One account's `author:<lane>` or `approve:<lane>` mandate, with grantor and issuance time | D12/D00 boundary (**NEEDS_ADR**) |
| lane | Stable machine code for the domain/queue a mandate covers, e.g. `D01.TEXT`, `D05.RESEARCH`, `D06.WITNESS`, `D08.RIGHTS` | D12 |
| restricted | A submission whose target needs a rights or consent decision before any public use; exact classification **BLOCKED-ON-D08** | D08 |
| decision | `APPROVE`, `REJECT` or `REQUEST_CHANGES` cast by an eligible reviewer | D12 |
| `APPROVED_WITHIN_SCOPE` | The queue's terminal positive state; it is **not** publication | D12; meaning D08 |
| `permittedActions` | Server-computed list of actions the calling account may take on this task now | hub projection |
| `human_decision_queue` | A read projection over `review_task` filtered by the caller's mandates; not a second table | D12 |
| `ai_candidate_proposals` | Tasks with `origin: AI_SUGGESTION`; a human must submit and a different human must decide | D12/M21-05 |

**Codes stay machine-stable.** Lane names, state names, action names and blocker codes are not localized; only their display text is ([ADR-0005](ADR-0005-locale.md)). A task code is a human-assigned unique code in the style of M14's `reviewCode` (`packages/moonql-research/src/review-subsystem.ts:647-665`); this design does not mint a new global ID prefix or amend M02-05.

---

## 3. State machine

### 3.1 States

| State | Meaning | Terminal |
|---|---|---|
| `DRAFT` | Submitter is composing; target digest and rights snapshot not yet bound | no |
| `SUBMITTED` | In the queue, awaiting a reviewer claim | no |
| `IN_REVIEW` | Claimed by one eligible reviewer under a lease | no |
| `CHANGES_REQUESTED` | Reviewer asked for a new revision; the old item is retained | no |
| `APPROVED_WITHIN_SCOPE` | Eligible human approved this exact revision within this scope; **not published** | yes (for the queue) |
| `REJECTED` | Eligible human rejected with a reason | yes |
| `BLOCKED` | No eligible independent approver, or a required rights/consent basis is missing; no decision exists | no (system may unblock) |
| `WITHDRAWN` | Submitter withdrew; no decision exists | yes |
| `SUPERSEDED` | A newer task for the same target/scope replaced this one | yes |
| `EXPIRED` | Queue/claim window elapsed before a decision; resubmission creates a new task | yes |

The names deliberately map onto ADR-0003's `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED` ([ADR-0003:42-45](ADR-0003-source-rights-and-consent.md), [M18-01:12-18](../audit/M18-01-single-publication-state-machine.md)): `SUBMITTED` is the queue's "in review" wait state, `IN_REVIEW` is the claimed state, and the queue stops before `PUBLISHED`.

### 3.2 Transitions

Every transition increments `version` by exactly one and appends exactly one event with
`eventKey = <taskCode>:<action>:<versionTo>`, following M14 (`packages/moonql-research/src/review-subsystem.ts:239-260`).

| Action | From | To | Who may cast it | Guard |
|---|---|---|---|---|
| `CREATE` | — | `DRAFT` | an `author:<lane>` holder; or a human creating their own proposal | target exists; no decision fields; digest optional until submit |
| `SUBMIT` | `DRAFT` | `SUBMITTED` or `BLOCKED` | the submitter account only | target digest bound; scope bound; rights/consent snapshot bound; restricted classification available; `author:<lane>` held for a restricted target; submitter mandate snapshot recorded |
| `CLAIM` | `SUBMITTED` | `IN_REVIEW` | an eligible reviewer | eligibility predicate (§6); lease duration |
| `RELEASE` | `IN_REVIEW` | `SUBMITTED` | the claimant, or an admin with a reason | claim lease still owned |
| `EXPIRE_CLAIM` | `IN_REVIEW` | `SUBMITTED` | system only | lease elapsed |
| `REQUEST_CHANGES` | `IN_REVIEW` | `CHANGES_REQUESTED` | an eligible reviewer | written reason |
| `RESUBMIT` | `CHANGES_REQUESTED` | `SUBMITTED` | the submitter only | new target digest; version CAS; prior events retained |
| `APPROVE` | `IN_REVIEW` | `APPROVED_WITHIN_SCOPE` | an eligible reviewer | exact digest; rights/consent gate passes; decision note |
| `REJECT` | `IN_REVIEW` | `REJECTED` | an eligible reviewer | exact digest; written reason |
| `WITHDRAW` | `DRAFT`,`SUBMITTED`,`IN_REVIEW`,`CHANGES_REQUESTED`,`BLOCKED` | `WITHDRAWN` | the submitter, or an admin break-glass with a reason | no decision exists |
| `BLOCK` | `SUBMITTED` | `BLOCKED` | system only | eligibility or rights evaluation says no decision is possible |
| `UNBLOCK` | `BLOCKED` | `SUBMITTED` | system only | grants/rights changed and an eligible reviewer now exists |
| `SUPERSEDE` | any non-terminal | `SUPERSEDED` | system only | a newer task for the same target/scope exists |
| `EXPIRE` | `SUBMITTED`,`BLOCKED` | `EXPIRED` | system only | queue deadline elapsed |

**Rules that make the table safe:**

1. A task is created at `DRAFT`, version 1, with no reviewer, decision or decided-at fields; creation with a decision is rejected, following M14 (`packages/moonql-research/src/review-subsystem.ts:265-274`).
2. `submittedByRef`/`submittedByName` come from the session, never from the request body, following M14 registration (`:676-677`) and its immutability list (`:276-289`).
3. Approval binds the exact `targetDigest` and `expectedVersion`. A changed target, stale version or replayed request is `409` and writes no event, following M14's CAS (`:230-237`).
4. `APPROVED_WITHIN_SCOPE` is not publication. No queue action can call a publishing endpoint, write a release pointer or set a public visibility flag ([ADR-0003:42-45](ADR-0003-source-rights-and-consent.md)).
5. There is no delete. Corrections are a new task or a `SUPERSEDE`; retraction/appeal is M18-04/D08, not a queue state.
6. System-only actions never count as human decisions. They record `actorKind: 'system'`, no `actorRef`, and are rejected on `APPROVE`/`REJECT`/`REQUEST_CHANGES`.

---

## 4. Actor and role matrix

"Role" below means the login role from `auth_users.role` (`admin`/`user`/`guest`); "mandate" means a D12 scope grant. A mandate is **not** a login role, and this design adds no role value (`packages/moonql-auth/src/index.ts:43`).

| Actor | Create draft | Submit own | Claim / decide | View queue | View detail | Withdraw | Grant scopes | Expire / supersede |
|---|---|---|---|---|---|---|---|---|
| anonymous | no (401) | no | no | no | no | no | no | no |
| guest | no (403) | no | no | no | no | no | no | no |
| named `user` without mandate | only own proposal for an internal task | own draft only; a restricted target needs `author:<lane>` | no | only own drafts | own draft only | own draft only | no | no |
| `author:<lane>` holder | yes, in lane | own draft only | no | own drafts + own-lane drafts | own + own-lane | own | no | no |
| `approve:<lane>` holder | only if also `author` in another lane | own draft only | yes, if the eligibility predicate passes | tasks in held approve lanes | tasks in held lanes | own draft only | no | no |
| `admin` | only with an explicit author mandate | own draft only, same author rule | **no implicit right**; only with an explicit approve mandate and the same predicate | all tasks (admin projection) | all tasks | any task, reason required | yes, but never self-grant | no; system only |
| system job | no | no | no | service projection only | service projection only | no | no | yes |
| AI suggestion / service key | `DRAFT` proposals via a dedicated proposal-ingest path, `origin: AI_SUGGESTION` only | no | no | no | no | no | no | no |

**Why `admin` cannot approve by role alone.** Administration (scope grants, user operations, incident response) is not content review. If `admin` implied approval, every restricted item would have a universal approver and the separation of duties would collapse. An admin may approve only by holding an explicit `approve:<lane>` grant and passing the same predicate as any reviewer. This is stricter than today's M14 endpoint, where any named `user`/`admin` may decide a research review (`packages/moonql-research/src/review-subsystem.ts:736-755`, `packages/moonql-research/src/common.ts:74-89`); the queue does not widen that behaviour.

**Machine principals are refused.** API keys resolve to the owner's `auth_users` id with the key's own role list and `meta.keyId` (`packages/moonql-apikeys/src/index.ts:88-113`, especially `:110`), while `humanActor` today checks only the owner's display name and login role (`packages/moonql-research/src/common.ts:76-88`). A key carrying `admin` or `user` can therefore look like a human reviewer. The queue's actor check must reject any request with `user.meta.keyId`, even when the owner is an admin, and record `principalKind: 'human'` only for a session principal. This is a new requirement, not current behaviour.

**Grant rules (design targets, not implemented):**

- A grant records `accountRef`, `scopeCode`, `kind` (`author`/`approve`), `issuedByRef`, `issuedAt`, `revokedAt`, and an event.
- An account may not hold both `author:<lane>` and `approve:<lane>` for the same lane. This keeps the authoring and approving populations disjoint and prevents an author from being the only possible approver.
- An admin may not grant themselves a scope, and a grant whose issuer is the submitter cannot be used to approve that submitter's task.
- Revoking a grant blocks new decisions immediately; past decisions remain valid events and are not rewritten.

---

## 5. Server-side enforcement

### 5.1 Hub-owned endpoints

All mutating endpoints are hand-written handlers, not generic CRUD. Names are indicative; the later leaf owns exact paths.

| Endpoint | Purpose | Published ACL | Handler check |
|---|---|---|---|
| `GET /governance/review-tasks` | Scope-filtered queue projection | `auth` | resolve actor; return own drafts, tasks in held lanes, or admin projection; no unfiltered total |
| `GET /governance/review-tasks/:code` | Detail + events + `permittedActions` | `auth` | actor may see the task, else `404` |
| `POST /governance/review-tasks` | Create `DRAFT` | `auth` | human actor; author mandate or own proposal; `submittedByRef` from session |
| `POST /governance/review-tasks/proposals` | Create `DRAFT` with `origin: AI_SUGGESTION` | `auth` | service key or human; `origin` fixed by the handler; cannot submit, claim or decide |
| `POST /governance/review-tasks/:code/submit` | `SUBMIT` | `auth` | submitter only; bind digest, scope, rights snapshot |
| `POST /governance/review-tasks/:code/claim` | `CLAIM` | `auth` | eligibility predicate; lease |
| `POST /governance/review-tasks/:code/release` | `RELEASE` | `auth` | claimant or admin |
| `POST /governance/review-tasks/:code/request-changes` | `REQUEST_CHANGES` | `auth` | eligibility predicate; reason |
| `POST /governance/review-tasks/:code/approve` | `APPROVE` | `auth` | eligibility predicate; digest; rights gate |
| `POST /governance/review-tasks/:code/reject` | `REJECT` | `auth` | eligibility predicate; reason |
| `POST /governance/review-tasks/:code/withdraw` | `WITHDRAW` | `auth` | submitter or admin break-glass |
| `GET /governance/review-tasks/:code/events` | Evidence trail | `auth` | same visibility as detail |

The page-level ACL is `auth` because every named human may see their own drafts; **item-level authority is decided in the handler**, not by the route rule. HQ's `guardEndpoint` can therefore only prove "signed in", which is exactly why the hub must filter and re-check.

### 5.2 Handler pipeline (order is part of the contract)

1. **Resolve the principal once** for the request (the REST layer already caches this, `packages/moonql/src/rest.ts:110-119`).
2. **Named human:** reject anonymous (`401`), guest and no-display-name accounts (`403`), and any `meta.keyId` principal (`403`) on submit/claim/decision/withdraw/release endpoints, extending `humanActor` (`packages/moonql-research/src/common.ts:74-89`). The only service write is a separate AI-proposal ingest that can create a `DRAFT` with `origin: AI_SUGGESTION`; it cannot submit, claim or decide.
3. **Load the current task** inside the per-task lock (M14 pattern, `packages/moonql-research/src/review-subsystem.ts:215-227`).
4. **Version CAS:** `expectedVersion !== task.version` → `409`, no write (`:230-233`).
5. **Legal transition:** action must be allowed from the current state (`:235-237`).
6. **Decision eligibility:** for `APPROVE`/`REJECT`/`REQUEST_CHANGES`, run the §6 predicate against **current** grants, not a client-supplied list.
7. **Exact revision:** `targetDigest` and rights/consent snapshot must match the task; mismatch → `409`.
8. **Rights/consent gate:** for a restricted task, the D08 gate must return eligible; otherwise `400` with stable blocker codes and no state change.
9. **Write the transition** and append one event with the unique `eventKey` (`:239-260`). The unique key is the durable cross-process backstop; the in-process lock alone is not (`packages/moonql-research/src/review.ts:219-221`).
10. **Return the server-computed `permittedActions`** for the caller after the transition.

### 5.3 Why generic REST is closed

- `ADMIN_WRITE` protects only `create`/`update`/`remove`; it does not protect `list`/`get` (`packages/moonql/src/model.ts:30-41`, [SECURITY:2](../architecture/SECURITY.md)).
- The generic `create` route has a role guard but **no row predicate** (`packages/moonql/src/rest.ts:226-244`), so it cannot set or check `submittedByRef` safely; a body could spoof the submitter.
- Generic `update` would let a caller patch `state`, `reviewerRef` or `decision` unless every field is hook-protected; M14 avoids this with endpoint handlers and immutable-field hooks (`packages/moonql-research/src/review-subsystem.ts:265-289`).

Therefore `review_task`, `review_task_event` and `review_scope_grant` must be `rest: false` (or fully admin-only with no mutation), and all state changes go through the endpoints above. This matches M14's `auth_users`-style closure (`packages/moonql-auth/src/index.ts:46`) and its endpoint-only review mutations.

### 5.4 HQ is a thin client

- HQ calls the queue endpoints with the caller's own session token through the per-request server SDK; it never uses a service token to widen access (`apps/headquarters/src/data/sdk.ts`, `src/data/server-sdk.mjs`).
- HQ's page guard is `guardEndpoint(doc, 'GET', '/governance/review-tasks')` (`apps/headquarters/src/lib/authz.ts:97-101`). If the endpoint is not published in `_schema`, HQ denies rather than guesses (`:91-101`). This is the same rule already used for `/ops/dashboard` (`apps/headquarters/src/app/(admin)/page.tsx:119-120`) and `/monitor/overview` (`apps/headquarters/src/app/(admin)/world-monitor/page.tsx:97-98`).
- HQ renders only `permittedActions` returned by the hub. It does not recompute scopes, overlap, digest eligibility or rights. The hub re-checks every action regardless of what the button said.
- HQ server actions (`createRecordAction` etc., `apps/headquarters/src/data/actions.ts:44-79`) are **not** a model for queue writes: they currently rely solely on the hub and surface the hub's raw error text in a redirect query parameter (`:50,64,75`). Queue actions must carry only the task code, `expectedVersion` and a note, and map typed denial codes to the localized denial view (§8).

### 5.5 Published schema and the coarse page gate

`GET /_schema` defaults to `auth` (`packages/moonql/src/rest.ts:438-441`), so every signed-in account can discover the queue endpoints. That is acceptable only because:

- the queue route returns no rows the caller may not see, and no unfiltered `x-total-count` (M14/REST already avoids a count oracle under a row rule, `packages/moonql/src/rest.ts:186-196`);
- the item detail returns `404` for out-of-scope tasks, not `403`, so it does not confirm that a restricted task exists;
- no scope names, rights statuses or target summaries of other lanes appear in the registry page.

This does **not** fix M20-01 N2 (the whole model registry is still disclosed to any authenticated role, `apps/headquarters/src/app/(admin)/models/page.tsx:5-18`); that remains M20-07's matrix item. The queue must not repeat N2 in its own page.

### 5.6 Durability and concurrency

The M14 pattern is the minimum: an in-process mutex serializes one task, a `version` compare-and-swap rejects stale writes, and a unique `eventKey` guarantees exactly one event per transition across processes (`packages/moonql-research/src/review-subsystem.ts:226-260,374-388`). The work-item implementation must add the same three; a UI-only guard or a check-then-write without CAS is not acceptable.

---

## 6. Self-approval, including two accounts with overlapping scopes

### 6.1 Definitions

For a task `w`:

- `A` = `w.submittedByRef` (the submitter account).
- `G(A)` = the set of `approve:<lane>` grants held by `A`, evaluated **now** at decision time (and snapshotted at submit for evidence).
- `R(w)` = the task's `requiredApprovalScope`, derived from the target's lane and, for restricted tasks, its rights/consent axis. It is not supplied by the submitter.
- `P` = the account attempting the decision.
- `G(P)` = the set of `approve:<lane>` grants held by `P`, evaluated now.

### 6.2 The predicate

A decision is allowed only if **all** of the following hold:

| # | Clause | Failure |
|---|---|---|
| I1 | `P` is a human session principal: named account, `admin`/`user` login role, no `meta.keyId` | `403` |
| I2 | `P.id !== A.id` — no account approves its own submission | `403 SELF_APPROVAL` |
| I3 | `R(w) ∈ G(P)` — the approver holds the required approval mandate | `403 MISSING_SCOPE` |
| I4 | `G(P) ∩ G(A) = ∅` — the approver shares **no** approval mandate with the submitter | `403 OVERLAPPING_SCOPE` |
| I5 | the grant that supplies `R(w)` was not issued by `A` | `403 DELEGATED_BY_SUBMITTER` |
| I6 | `targetDigest` and `expectedVersion` match the current task | `409 STALE_OR_CHANGED` |

For every task, all six clauses apply, including internal tasks; the restricted classification adds the rights/consent gate at §5.2 step 8. There is no weaker path for internal tasks and no role shortcut: `admin` passes I1 but still fails I3/I4 without an explicit, non-overlapping mandate.

**Why I4 is the two-account rule.** Two accounts that share any approval scope are treated as one approval principal for this decision. Adding a second account with the same `approve:<lane>` grant does not create independence; it creates an overlapping principal, and overlap disqualifies. The check runs on current grants inside the transition lock, so a grant added after submission cannot be used to slip past it.

**Worked example** (A submits a `D05.RESEARCH` task whose required approval scope is `approve:D05.RESEARCH`):

| Account | Approval grants | Decision on A's task | Result |
|---|---|---|---|
| A (submitter) | `approve:D08.RIGHTS` | A tries to approve | `DENY_SELF` (I2) |
| B | `approve:D05.RESEARCH`, `approve:D08.RIGHTS` | B tries to approve | `DENY_OVERLAP` (I4: shares `D08.RIGHTS` with A) |
| C | `approve:D05.RESEARCH` | C tries to approve | `ALLOW` (I1-I6 hold) |
| D | `approve:D08.RIGHTS` | D tries to approve | `DENY_SCOPE` (I3) |
| B with an API key | same grants, `meta.keyId` present | B's key tries to approve | `DENY_MACHINE` (I1) |
| E | `approve:D05.RESEARCH` granted by A | E tries to approve | `DENY_DELEGATED` (I5) |

If the task requires `approve:D08.RIGHTS` instead, A and B overlap on it, C lacks it, and D holds it but shares it with A, so D fails I4 as well — **no eligible approver exists**: the task becomes `BLOCKED` with `NO_INDEPENDENT_APPROVER`. It is never auto-approved and never escalated to an admin override.

**Worked trace (design predicate evaluated in memory, not application code):**

The predicate above was expressed as a throwaway `node -e` function and evaluated against the table; it produced `ALLOW` only for C and `DENY_SELF`, `DENY_OVERLAP`, `DENY_SCOPE`, `DENY_MACHINE`, `DENY_DELEGATED` for the other rows. This proves the rule is internally consistent; it does **not** prove the system enforces it, because no implementation exists.

### 6.3 What the overlap rule does not solve

A single human who controls two accounts with **disjoint** approval grants would still satisfy I1-I6. Nothing in D00 links accounts to a natural person today: `auth_users` is a flat row set (`packages/moonql-auth/src/index.ts:36-46`) with no principal-linkage field, and no endpoint creates accounts at all (only login/logout/me, `:85,111,126`), so accounts are operationally provisioned outside REST. The design therefore:

- states honestly that I1-I6 prove **account independence and mandate disjointness**, not human uniqueness;
- records a **NEEDS_ADR** for D00 principal linkage or a D08 separation-of-duties attestation (see §10);
- provides an evidence hook: the decision event records the actor, the actor's approval-scope snapshot, the submitter's approval-scope snapshot and an optional `conflictAttestation` text; whether an attestation is required, and what happens if it is false, is a D08 policy decision, not this task's;
- does not add a second approval, a second identity check or a "human score" heuristic. A **two-person quorum** for restricted items would be a D08 policy change; it is registered, not assumed.

### 6.4 Relationship to M14 today

M14 already enforces the account-level rule: `reviewDecide` rejects `submittedByRef === actor.id` with "four eyes: the submitter cannot decide their own review" (`packages/moonql-research/src/review-subsystem.ts:753-755`), and the regression test asserts a `403` matching `/four eyes/i` (`apps/arsy/test/mizan.test.ts:245-251`). M14 has **no scope model**, so it cannot evaluate I3-I5; its read endpoints are `ADMIN_ONLY` (`:603-606,637-640`) while its decide endpoint is `'auth'` (`:736-739`), meaning any named `user` can decide a research review. The queue is therefore stricter than M14 for restricted items. This design does not retrofit M14; whether M14 should adopt the same scope model is an M20-07/M20-04 follow-up, not a silent change.

---

## 7. Audit and evidence trail

The queue's evidence is the append-only `review_task_event` row plus the task's immutable identity fields. It must be sufficient to answer "who decided what, on which exact revision, under which mandate, with which rights basis, and why" **without** reading `ops_audit`.

| Field | Contract |
|---|---|
| `eventKey` | `<taskCode>:<action>:<versionTo>`, unique; the durable cross-process guard (`packages/moonql-research/src/review-subsystem.ts:246-247,374-388`) |
| `taskRef` / `taskCode` | stable task identity |
| `action` | one of the state-machine actions; unknown actions rejected |
| `fromState` / `toState` | must match the transition table; a mismatch is rejected (`:294-302`) |
| `versionFrom` / `versionTo` | `versionTo === versionFrom + 1` |
| `actorRef` / `actorName` / `actorRole` | nullable only for `actorKind: 'system'`; never a free-text reviewer name |
| `actorScopes` | snapshot of the actor's `approve:<lane>` grants at decision time |
| `submitterScopes` | snapshot of the submitter's approval grants at submit time |
| `principalKind` | `human` or `system`; machine principals are rejected before this point |
| `reason` | required for `REJECT`, `REQUEST_CHANGES`, `WITHDRAW`, `RELEASE`; decision note required for `APPROVE` |
| `targetDigest` | exact reviewed revision digest |
| `rightsSnapshot` | reference to the rights/consent basis used by the gate, never the private bytes |
| `conflictAttestation` | optional text for the D08 policy in §6.3; never a substitute for I1-I6 |
| `at` | server timestamp |

Immutability rules:

- Task identity fields (`taskCode`, target, scope, `submittedByRef`, `submittedAt`) are immutable after creation; changing them is rejected, following M14 (`packages/moonql-research/src/review-subsystem.ts:276-289`).
- The item is never deleted. `WITHDRAW`, `SUPERSEDE` and `EXPIRE` are states, not deletions.
- Event update/delete hooks reject with a clear error, following M14's append-only hooks (`:504-514`).
- A decision event is never rewritten by a later transition; a correction is a new task/version with its own events.
- No private witness body, source text, credential, token or raw provider payload is stored in the event or shown in the queue; only references and digests, consistent with [SECURITY:2](../architecture/SECURITY.md) and the witness rules in [M16-01:150-160](M16-01-private-witness-object-spec.md).

Retention of events, export rules and deletion-on-request are **D08/M20-05**; this design neither purges nor promises immutability beyond append-only hooks. `ops_audit` may receive a supplementary summary row, but no decision may depend on it being present (`packages/moonql-ops/src/index.ts:54-60,190-193`).

---

## 8. Denial UX for N1/N3 (and the queue's own denials)

### 8.1 Current state at the inspected tree

M20-01 recorded N1 (ungated write forms), N2 (registry disclosure), N3 (403 crash pages) and N4 (public `/monitor/overview`) at baseline `76ecdc5` (`docs/audit/M20-01-hq-model-ui-route-guards-ops.md:48-51`). At the current tree, **UI-F13 (`fe21e6d`) has already changed the page-rendering half of N1 and N3**, so the audit's handoff text is stale on those two points:

| Finding | Status at `eef0c54` | Evidence |
|---|---|---|
| N1 page render | **Mitigated.** Create page guards `create` before fetching relation options; edit page guards `get` before fetching the row and hides the form unless `can('update')`; the list page guards `list`. | `apps/headquarters/src/app/(admin)/models/[model]/new/page.tsx:27-30`; `.../[id]/page.tsx:28-43,67`; `.../[model]/page.tsx:34-39` |
| N1 server action | **Residual.** The actions themselves have no local guard; they call the SDK and redirect the hub's `errorMessage` into `?error=`. | `apps/headquarters/src/data/actions.ts:44-79`; error Alert at `new/page.tsx:48` and `[id]/page.tsx:66` |
| N2 registry | **Open.** `/models` still renders the full registry to any authenticated role with no guard. | `apps/headquarters/src/app/(admin)/models/page.tsx:5-18` |
| N3 `/system` crash | **Mitigated.** `/system` guards `/ops/dashboard` before calling `dashboard()`; the dashboard does the same. | `apps/headquarters/src/app/(admin)/system/page.tsx:14-20`; `apps/headquarters/src/app/(admin)/page.tsx:116-120` |
| N4 public monitor | **Unchanged, out of this design's scope.** The hub endpoint is still public; M20-07 owns the executed matrix. | `packages/moonql-monitor/src/index.ts:701-705`; `packages/moonql/src/rest.ts:120-122` |

### 8.2 Required denial semantics

| Situation | HTTP / HQ result | Copy / data rule |
|---|---|---|
| No session at all | Redirect to `/login` (middleware) | no content rendered; existing behaviour (`apps/headquarters/src/middleware.ts:11-16`) |
| Cookie present but hub says 401 | Redirect to `/login?error=expired` (layout) | no fake admin shell; existing behaviour (`(admin)/layout.tsx:5-7`; `lib/session-auth.mjs:4-11`) |
| Signed in, route/operation not permitted | Hub returns `403`; HQ renders `AccessDenied code="forbidden"` (the page's own HTTP status is not asserted) | fixed localized title/body; no records loaded (`apps/headquarters/src/ui/widgets/AccessDenied.tsx:14-25`; `lib/denial-copy.ts:13-25`) |
| Hub unreachable or 5xx | HQ renders `AccessDenied code="unavailable"` (no HTTP status asserted) | session preserved; retry action; never a logout (`lib/authz.ts:50-61`; `lib/denial-copy.ts:16-18`) |
| Task not visible to this account | `404` | do not confirm that a restricted task exists |
| Stale version / changed target | `409` | "This task changed; reload before deciding"; no decision written |
| Illegal transition | `400` | stable transition code, no state change |
| Rights/consent missing | `400` with stable blocker codes | show the blocker name; no approval, no publication |
| No independent approver | Task projection is `BLOCKED`; an approve attempt is refused (`409`/`403`) | "No eligible independent reviewer exists for this scope"; no override |

**Copy rules.** Only stable codes select text, exactly as `denialMessage` already does (`apps/headquarters/src/lib/denial-copy.ts:45-51`). Hub error strings, tokens, cookies, witness material and source text never reach the page or the URL. This means the N1 server-action pattern of `redirect('...?error=' + errorMessage)` (`apps/headquarters/src/data/actions.ts:50,64,75`) must be replaced by a code such as `?denial=forbidden|unavailable|conflict|blocked` rendered through the same catalog. Reflecting a hub message in a query parameter is a content-spoofing surface even when React escapes it.

**Action-level guard.** Each queue action must call `guardModel`/`guardEndpoint` for its operation before the SDK call, so a signed-in user without the grant gets an honest `AccessDenied` instead of a hub `403` bounced back as text. The hub remains the final authority; the local guard is UX and defense in depth, not the authorization decision (`lib/authz.ts:7-17,82-101`).

### 8.3 Queue UI rules

- The queue page shows only tasks the caller may see, from the hub projection; it never computes "all tasks" and filters in the browser.
- Every empty state is honest: "No tasks in your scopes", not a fabricated count. The dashboard's demo fallbacks (`|| 46`, `|| 10`, `Math.max(18, ...)`) are explicitly not a pattern (`docs/audit/M20-01-hq-model-ui-route-guards-ops.md:29`).
- The detail page shows the target, exact `targetDigest`, scope, rights/consent snapshot reference, state, submitter, age and the event trail. It does not show private bytes, source text or another lane's metadata.
- Actions are rendered only from `permittedActions` returned by the hub. A blocked task shows the blocker code in words; it never shows an "Approve" button that would fail.
- The page is bilingual `id`/`en` through the existing denial/locale pattern (`AccessDenied.tsx:17-24`), and the state/action machine codes stay untranslated.

---

## 9. Future implementation work (not registered tasks)

This design assigns no task IDs beyond those already in TODO. The following work areas are planning notes only; the integrator must register a concrete leaf in TODO before assigning implementation. This design does not authorize or execute them.

| Work area | Deliverable | Primary area | Acceptance test sketch |
|---|---|---|---|
| Hub D12 core (proposed; not a TODO task) | `review_task`, `review_task_event`, `review_scope_grant`; handlers; eligibility module; no generic REST. Fixture grants are enough to test; production grant assignment stays `NEEDS_ADR`. | `packages/moonql-*` (new D12 addon), `apps/arsy` wiring | Positive: a disjoint, required-scope human approves under a fixture grant. Negative: self, overlap, missing scope, delegated grant, API-key principal, guest, stale version, changed digest all fail without an event. |
| HQ queue surface (proposed; not a TODO task) | `/review` queue + detail, server-computed `permittedActions`, action denial codes, no fabricated counts | `apps/headquarters/src/app/(admin)/review/**`, `src/data/actions.ts`, `src/lib/denial-copy.ts` | Positive: eligible reviewer sees only their lane and can approve. Negative: out-of-scope detail `404`; action without mandate renders `AccessDenied`; hub outage renders `unavailable`; no data before guard. |
| **M20-03** | Rights/import blocker and reviewed-source status display, backed by `rightsSnapshot` | HQ + D08 projection | Metadata-only vs released is distinguishable; unknown rights never renders "approved". |
| **M20-04** | Identity/alias/evidence reviewer panels, decisions recorded as work items | HQ + D04/D05 read models | Reviewer resolves with source and conflict links; no free-text reviewer name. |
| **M20-05** | Audit actor attribution, retention and reliability contract; decide whether `ops_audit` can ever be trusted | `packages/moonql-ops` + D08 | No assumption that current async audit is immutable; work-item events remain the decision evidence. |
| **M20-06** | 100CENTER view for ordinary human task/incident decisions | HQ | No supernatural mandate; no automatic irreversible action; ordinary tasks still require an independent actor. |
| **M20-07** | Execute the direct-URL/API role/stale-cookie matrix, including queue endpoints | HQ tests + ARSY API tests | Server denies unauthorized operations; N1/N2/N3/N4 each have an executed test, not a code-path inference. |
| **M21-05** | AI-suggested claims/edits enter as `origin: AI_SUGGESTION` drafts | HQ + D12 | A human reviewer is required for the canonical action; the AI principal cannot submit or decide. |
| **M40-08** | LUMEN/100CENTER approval handoff to a durable work item | `packages/lumen` + HQ + D12 | No approval bypass/self-approval/auto-publication; LUMEN's in-memory gate (`packages/lumen/src/adapters/approval-gate.ts:91`) is not treated as the audit record; no second approval engine. |

Sequencing: if the proposed hub/HQ work areas are registered, hub authorization must precede the thin HQ client. M20-03/M20-04 may start after this M20-02 design is integrated, following their TODO dependencies; M20-06 follows M20-03/M20-05; M20-07 tests the real surfaces last in the M20 series.

---

## 10. NEEDS_ADR / BLOCKED-ON-D08 register

Nothing below is decided or implemented by this design.

| ID | Needed decision | Gate |
|---|---|---|
| `NEEDS_ADR-D12-review-scope-grants` | Whether reviewer authority is a D12 scope grant, a D00 login role, or both; who may issue/revoke grants; the grant-time separation rule (§4) | New ADR under D12/D00, with D08 review |
| `NEEDS_ADR-D00-principal-linkage` | How two accounts controlled by one human are detected (account linkage, attestation, or an accepted residual risk) | D00/D08 ADR |
| `BLOCKED-ON-D08-restricted-classification` | Which rights/consent states make a task `RESTRICTED`, and which source types use which gate. Text already has the M07-04 veto ([M07-04:10-15](M07-04-rights-veto-policy.md); `packages/moonql-corpus/src/index.ts:31-40`); witness/story/consent classes do not | D08 |
| `BLOCKED-ON-D08-approval-within-scope` | What `APPROVED_WITHIN_SCOPE` authorizes, and how it hands off to `PUBLISHED`; queue must not invent it | D08/M18-02/M18-03 |
| `BLOCKED-ON-D08-quorum` | Whether a restricted approval needs one independent human (ADR-0003 baseline) or two | D08 |
| `BLOCKED-ON-D08-evidence-retention` | Retention, export and deletion-on-request for task events; no assumption of permanent immutability | D08/M20-05 |
| `BLOCKED-ON-D08-withdrawal-appeal` | Withdrawal, correction, takedown and appeal after a decision | M18-04/D08 |
| `NEEDS_MIGRATION-D12-tables` | The three D12 tables and their indexes | Covered by ADR-0002 **if** they stay in the MoonQL-owned schema; destructive changes follow M04-02. No new SQL owner. |
| `NEEDS_ADR-reviewer-login-role` | Adding `reviewer`/`editor` to `auth_users.role` (currently `admin`/`user`/`guest`, `packages/moonql-auth/src/index.ts:43`, while [M03-04:24](M03-04-tenant-role-boundaries.md) names those roles) | D00 ADR; this task does **not** widen the enum |

---

## 11. Design acceptance and future implementation gates

For this design task, the TODO acceptance is the specified prohibition on an account approving its own restricted submission. Clause I2 rejects `P.id === A.id` before any scope or role can grant an exception, including for `admin`; the existing M14 four-eyes test and the design-only predicate check are recorded in the M20-02 audit. This is a specification result, not a claim that an M20 queue exists or enforces the rule.

The unchecked items below are **future runtime implementation gates**, not outstanding acceptance criteria for the M20-02 design task. They remain unchecked until a concrete implementation leaf is registered in TODO, assigned, implemented, and verified:

- [ ] **No account approves its own restricted submission:** I2 rejects `P.id === A.id` for every decision, including admin (M14 precedent: `packages/moonql-research/src/review-subsystem.ts:753-755`).
- [ ] **No overlapping principal approves it:** I4 rejects any approver sharing an approval scope with the submitter; two accounts with the same mandate are one principal.
- [ ] **No machine approves it:** I1 rejects `meta.keyId` principals and guests; system actions cannot decide.
- [ ] **No admin shortcut:** `admin` without an explicit, non-overlapping mandate fails I3/I4.
- [ ] **No stale/forged approval:** I6 binds the exact digest and version; mismatch is `409` with no event.
- [ ] **No publication from the queue:** the state machine has no `PUBLISHED`; D08 remains the only publisher.
- [ ] **No HQ authority:** HQ has no role table, database or eligibility logic; it renders `permittedActions` and the hub re-checks every write.
- [ ] **Evidence survives:** every transition appends one immutable event with a unique key; `ops_audit` is not the evidence.

No item above is runtime evidence. The design does not decide the gates in §10, and no restricted decision or publication is authorized by this document.

---

## References

- [M20-01 audit](../audit/M20-01-hq-model-ui-route-guards-ops.md) — N1-N4, guard layers, HQ reuse verdict.
- [M18-01 publication gate](../audit/M18-01-single-publication-state-machine.md) — one human path, rights vetoes, no publication claim.
- [M14-01 review workflow](M14-01-review-workflow.md) — four-eyes machine and evidence rules.
- [M03-04 roles](M03-04-tenant-role-boundaries.md) — canonical role vocabulary (not yet implemented in `auth_users`).
- [ADR-0003](ADR-0003-source-rights-and-consent.md), [M07-04](M07-04-rights-veto-policy.md) — rights veto.
- [BLUEPRINT](../../BLUEPRINT.md):110,206,210 — no second approval engine; D08/D12 ownership.
- [SECURITY](../architecture/SECURITY.md):2 — `ADMIN_WRITE` does not protect list/get.
- [LUMEN approval boundary](../architecture/LUMEN.md):104-108,134-135 — HQ owns approval; LUMEN cannot self-approve or become a second approval system.
