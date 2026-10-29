# M20-08 — D12 reviewer-grant store design

**Status: DESIGN — NOT IMPLEMENTED. Not an ADR, not an implementation authorization.** This document proposes the logical D12 grant store and the D08 grant-loader contract required by [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md). It creates no schema, migration, table, route, endpoint, UI or code, assigns no grant or principal, and does not claim that any rule below is enforced today. Implementation requires a separate, explicitly authorized task.

- Repository: `Z:\project\moonradio`, branch `dev`.
- Scope: logical record, lifecycle, validation invariants, loader semantics and a positive/negative test matrix. Physical storage, API shapes, pending-request TTL, retention and admin UI remain implementation decisions.
- Authorities: [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md) (policy), [ADR-0013](../decisions/ADR-0013-d08-release-authority.md) §2 and §7, [M20-02](../decisions/M20-02-role-scoped-review-queue.md) (D12 design), [M20-04 reviewer authority proposal](M20-04-reviewer-authority-proposal.md), and the D08 contract in [`packages/governance/src/index.ts`](../../packages/governance/src/index.ts).
- No witness testimony, private source bytes, consent records, credentials or production data were accessed.

## 1. Problem and boundary

ADR-0015 ratifies reviewer authority as an explicit D12 scope grant bound to a D00 `auth_users.id`, issued with separation rules, mandatory expiry and immediate revocation. The D08 decision boundary already accepts a caller-loaded `ReviewerGrant`, but nothing loads grants from a canonical store. A naive implementation could let a handler pass grants from a request body, cache stale grants, or treat a display name as identity.

This design fixes the **logical** contract that closes that gap:

- D12 owns grant records and their append-only events inside the existing ARSY/MoonQL data authority ([ADR-0002](../decisions/ADR-0002-additive-moonql-domains.md)). D00 remains the only identity; D08 consumes validated projections.
- The D08 loader is the only path that turns stored grants into decision context, and it is server-side, request-scoped and fail-closed.
- No second Hub, identity store, SQL owner, approval engine or role enum is created.

## 2. Non-goals

- No table names, DDL, migration, index, constraint or storage engine is chosen here.
- No route, HTTP method, request/response schema, SDK change or UI is specified as authorized.
- No grant, account, lane or reviewer is created, named or assigned.
- No retention, export or deletion duration is invented (ADR-0015 §12 leaves them open).
- No account-linkage mechanism is proposed; the residual risk accepted by ADR-0015 §9 stands.
- No content, release, projection or activation is touched.

## 3. Logical entities

### 3.1 `review_scope_grant`

The canonical grant. Field names are logical and may be mapped differently at implementation time, but every field must survive the mapping.

| Field | Type (logical) | Rule |
|---|---|---|
| `grantRef` | opaque immutable id | Never reused or re-pointed |
| `accountRef` | D00 `auth_users.id` | Must exist, be active, have a display name, and have login role `user` or `admin`; no machine/API-key marker |
| `kind` | `author` \| `approve` | Closed enum |
| `scopeCode` | lane code | Closed vocabulary; no wildcard |
| `state` | `PENDING_CONFIRMATION` \| `ACTIVE` \| `EXPIRED` \| `REVOKED` \| `SUPERSEDED` | Derived and revalidated from events/timestamps; never caller-supplied |
| `issuedByRef` | D00 principal | Must be an `admin`; never the grantee |
| `issuedAt` | ISO-8601 UTC timestamp | Server time; caller time is not trusted |
| `expiresAt` | ISO-8601 UTC timestamp | Required, strictly after `issuedAt` |
| `confirmedByRef` | D00 principal or null | Required for `approve`; must differ from `issuedByRef` and from the grantee; null for `author` |
| `confirmedAt` | ISO-8601 UTC timestamp or null | Required iff `confirmedByRef` is set |
| `revokedAt` | ISO-8601 UTC timestamp or null | Set once; never cleared |
| `revokedByRef` | D00 principal or null | Required iff `revokedAt` is set |
| `reasonRef` | opaque reason/event reference | Required for issue request, confirmation and revocation; no free-form content |
| `supersedesRef` | grant id or null | Set when this grant replaces another for the same account/kind/lane |

Derived presentation fields (`principalName`, lane label) are read from D00/D12 at read time and are not stored as authority.

### 3.2 `review_scope_grant_event`

Append-only. Events are the audit trail and the source of truth for state transitions.

| Field | Rule |
|---|---|
| `eventRef` | Immutable id |
| `grantRef` | Target grant |
| `action` | `REQUESTED` \| `CONFIRMED` \| `ISSUED` \| `REVOKED` \| `SUPERSEDED` |
| `actorRef` | D00 principal that performed the action |
| `at` | Server timestamp |
| `reasonRef` | Opaque reason reference; required |
| `outcome` | `ACCEPTED` \| `REJECTED` with a stable refusal code |

`author` grants issue in one step (`ISSUED`). `approve` grants use `REQUESTED` then `CONFIRMED` by a second, distinct admin. Rejected attempts are recorded without changing grant state. No event contains content, names, source text or private evidence.

## 4. State machine

| From | Action | Guard | To |
|---|---|---|---|
| — | request `author` | issuer is admin, issuer ≠ grantee, all §5 invariants hold | `ACTIVE` |
| — | request `approve` | issuer is admin, issuer ≠ grantee, all §5 invariants hold | `PENDING_CONFIRMATION` |
| `PENDING_CONFIRMATION` | confirm | confirmer is admin, confirmer ∉ {issuer, grantee}, request not past its pending TTL, invariants still hold | `ACTIVE` |
| `PENDING_CONFIRMATION` | pending TTL elapses | server time > request TTL | terminal (no grant) |
| `ACTIVE` | revoke | actor is issuer, another admin, or an automated account control | `REVOKED` |
| `ACTIVE` | expiry elapses | server time ≥ `expiresAt` | `EXPIRED` |
| `ACTIVE` | supersede | new grant for same account/kind/lane is confirmed | `SUPERSEDED` |

`EXPIRED`, `REVOKED` and `SUPERSEDED` are terminal; renewal creates a new `grantRef`. A pending request has no authority: the D08 loader never returns it.

## 5. Validation invariants

| # | Invariant |
|---|---|
| V1 | `accountRef` resolves to an active D00 account with a display name and login role `user` or `admin`. |
| V2 | A machine/API-key principal can never be a grantee, issuer, confirmer or revoker. |
| V3 | `kind` is exactly `author` or `approve`; `scopeCode` is in the closed lane vocabulary. |
| V4 | `expiresAt` is present and strictly after `issuedAt`; indefinite grants are refused. |
| V5 | `issuedByRef` is an admin and differs from `accountRef`. |
| V6 | `approve` requires `confirmedByRef` distinct from both `issuedByRef` and `accountRef`. |
| V7 | `author` must not carry a confirmation actor. |
| V8 | The same account may not hold live `author:<lane>` and `approve:<lane>` for one lane. |
| V9 | At most one live grant exists for an account/kind/lane; replacement uses supersession. |
| V10 | Lane mapping to D08 domains/scopes is closed: `D05.RESEARCH→D05_RESEARCH/public`, `D06.WITNESS→D06_WITNESS/public`, `D07.STORY→D07_STORY/public`; `D01.TEXT` and `D08.RIGHTS` are not release domains. |
| V11 | Server time is authoritative for issuance, confirmation, expiry and revocation; caller timestamps are ignored. |
| V12 | Revocation is one-way; `revokedAt`/`revokedByRef` are never cleared or rewritten. |
| V13 | Events are append-only and never deleted or edited by the application. |
| V14 | A non-admin actor cannot issue, confirm, revoke or supersede a grant. |
| V15 | Unknown fields on a grant or event payload are rejected, not ignored. |

## 6. D08 loader contract

The loader is the only bridge from stored grants to the D08 decision boundary.

**Input (server-supplied only):** `{ principalRef, domain, scope, at }`. The handler derives `principalRef` from `EndpointCtx.user.id` plus the canonical D00 row, and `at` from server time. No request body, query string or client context may supply grants.

**Behaviour:**

1. Load live `approve` grants for `principalRef` from the canonical store in the same transaction/snapshot as the decision; do not cache across requests.
2. Discard `PENDING_CONFIRMATION`, `EXPIRED`, `REVOKED` and `SUPERSEDED` records.
3. Map each live grant's lane to the D08 domain and scope via V10; an unmapped lane yields no grant.
4. Return `ReviewerGrant[]` shaped as `grantRef, principalRef, role: 'RELEASE_REVIEWER', domains, scopes, grantedAt, expiresAt, revokedAt` — or a stable refusal code when no live grant matches.
5. On any store error, unreadable row or inconsistent state, return no grants and refuse the decision. Never fall back to permissive defaults or caller input.
6. The read path calls the same loader; a revoked or expired grant makes the projection unavailable. The recorded decision event is not rewritten.
7. The loader never writes grants and never activates, publishes or withdraws content.

**Refusal mapping:** no grant → `REVIEWER_NOT_GRANTED`; all revoked → `REVIEWER_GRANT_REVOKED`; all expired → `REVIEWER_GRANT_EXPIRED`; wrong lane/domain/scope → `REVIEWER_SCOPE_MISMATCH`; non-human actor → `ACTOR_NOT_HUMAN`. No new codes are introduced.

## 7. Legacy and compatibility

- Legacy caller-supplied reviewer strings are never loaded as grants and are never backfilled from a display name.
- New or modified endpoints must reject the legacy field; changing the existing D03 endpoint is outside this design and needs its own D03/D00 task.
- Historic rows remain intact and are labelled legacy, unbound assertions.
- Generated clients/schemas are unaffected until a separately authorized implementation changes an API.

## 8. Test matrix for the implementation task

Each row is a required case for the future implementation; this design creates no tests.

| # | Case | Expected |
|---|---|---|
| T1 | Admin A requests `author:D05.RESEARCH` for account U | `ACTIVE`, one `ISSUED` event |
| T2 | Admin A requests `approve:D06.WITNESS` for U; admin B confirms | `ACTIVE`, `REQUESTED`+`CONFIRMED` events |
| T3 | Admin A requests `approve` and confirms their own request | Denied; no state change |
| T4 | Admin A issues any grant to account A | Denied; no state change |
| T5 | Guest, anonymous or machine/API-key account as grantee | Denied |
| T6 | Grantee account without display name or inactive | Denied |
| T7 | Unknown lane, unknown kind or wildcard lane | Denied |
| T8 | Missing expiry or `expiresAt ≤ issuedAt` | Denied |
| T9 | Same account holds live `author` and `approve` in one lane | Denied |
| T10 | Second live grant for the same account/kind/lane | Denied; supersession is the only replacement |
| T11 | Confirmation after the pending TTL | Denied; pending grant never becomes active |
| T12 | Non-admin confirms an `approve` request | Denied |
| T13 | Issuer, another admin, and an automated account control each revoke | All allowed; block is immediate |
| T14 | Non-admin revokes | Denied |
| T15 | Expired `ACTIVE` grant reaches the loader | Excluded; decision refused with `REVIEWER_GRANT_EXPIRED` |
| T16 | Revoked grant reaches the loader | Excluded; read projection unavailable |
| T17 | Caller tries to pass grants in the request body | Ignored/rejected; loader uses store only |
| T18 | Overlapping grants in another lane | Do not widen the exact domain/scope check |
| T19 | Two disjoint accounts controlled by one human | Not detected; test asserts the documented residual risk, not separation |
| T20 | Legacy `reviewer` field on a new endpoint | Rejected; no grant or decision derived from it |
| T21 | Store error or inconsistent row during loading | Fail closed; no grant returned |

## 9. Open implementation choices (not decided here)

| Choice | Constraint | Needed authority |
|---|---|---|
| Physical tables, columns, indexes, constraints | Must live in the existing ARSY/MoonQL D12 addon and preserve V1–V15 | D12/D08 owner review of a schema task |
| Pending-request TTL | Must be bounded and server-evaluated; no indefinite pending state | D00/D12 |
| Route shapes and admin surface | `review_scope_grant` must not be raw REST; all mutations through authorized handlers | D12/D00 |
| Concurrency and locking | Confirmation and revocation must be atomic; no lost update | Engineering review |
| Retention/export/deletion | Unresolved under ADR-0015 §12 and M20-05 | D08/D00/privacy |
| Account linkage | Explicitly out of scope; residual risk stands | Future D00/D08 ADR |

## 10. Acceptance for this design task

- The logical record, event model, state machine, invariants and loader semantics are specified and consistent with ADR-0015.
- The test matrix covers every positive transition and every negative path in ADR-0015, including self-grant, same-admin confirmation, expiry, revocation, supersession, caller-supplied grants and the residual linkage risk.
- No schema, migration, route, UI, code, grant or principal is created.
- An independent reader can implement the store later without guessing at authority, separation or fail-closed behaviour.

## Sources

- [ADR-0015 — D00/D12 reviewer grants](../decisions/ADR-0015-d00-d12-reviewer-grants.md)
- [ADR-0013 — D08 release authority](../decisions/ADR-0013-d08-release-authority.md)
- [ADR-0002 — additive MoonQL domains](../decisions/ADR-0002-additive-moonql-domains.md)
- [M20-02 — role-scoped review queue (design)](../decisions/M20-02-role-scoped-review-queue.md)
- [M20-04 — reviewer authority proposal](M20-04-reviewer-authority-proposal.md)
- [D00/D12 reviewer-grant proposal](D00-D12-reviewer-grant-proposal.md)
- [M18-08 decision-boundary audit](../audit/M18-08-d08-release-decision.md)
- [`packages/governance/src/index.ts`](../../packages/governance/src/index.ts)
