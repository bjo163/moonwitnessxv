# D00/D12 reviewer-grant proposal

**Status: RATIFIED AS POLICY — 29 October 2026, by [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md).** The owner accepted the full conservative package below, including all ten choices, as one position. Ratification authorizes no schema, migration, route, UI, code change, role value, principal or grant assignment, and it does not clear, publish or project content. The document body is preserved as the ratification record and is not edited further.

- Repository: `Z:\project\moonradio`, branch `dev`.
- Local baseline: `aaa19d13993b434efdbf5bb46a2511aedea411c8`. At preparation time `git ls-remote origin refs/heads/dev` returned `3d8b6a00838a768a89f5218a2a5679769a588c2d`, which is an ancestor of this worktree: local `dev` is ahead of the remote and nothing has been pushed.
- Scope: define the grant contract that binds reviewer authority to verified D00 principals, with issuer, revoker, expiry and revocation rules, so that [M20-04](../tasks/M20/M20-04.md) and the D08 decision boundary can later use a real mandate. It does not define the D12 queue, D08 publication policy, classification taxonomy, HQ UI or storage implementation.
- No witness testimony, private source bytes, consent records, credentials or production data were accessed.

## Why this exists

[ADR-0013 §2](../decisions/ADR-0013-d08-release-authority.md) accepted that the deciding actor is derived from verified D00/ARSY identity, never a caller-supplied reviewer string, and that identity alone grants no reviewer authority: "a D00/D12 reviewer-grant ADR must exist before any principal or role is treated as an authorized reviewer, and adding a `reviewer` role requires a separate D00 ADR." That prerequisite is still missing, so M20-04, M18-02, M18-05 and M19-19 remain blocked even though the pure D08 decision contract exists at `81d2638`.

Observed facts this proposal builds on, not changes:

- D00 is the only identity owner. `packages/moonql-auth/src/index.ts:43` limits `auth_users.role` to `admin`, `user`, `guest`; `:46` keeps the model REST-disabled. `packages/moonql/src/addon.ts:35-40` exposes the session principal as `{ id, roles, meta? }`.
- The accepted M14 pattern resolves a named human from `EndpointCtx.user.id` plus the canonical `auth_users` row and rejects guest, anonymous and machine actors (`packages/moonql-research/src/common.ts:74-89`). It is a precedent, not a mandate.
- [M20-02](../decisions/M20-02-role-scoped-review-queue.md) is still a design proposal (`:3`). It assigns D12 ownership of `review_scope_grant` (`:74`), defines `author:<lane>`/`approve:<lane>` lanes (`:74-75`), forbids holding both kinds in one lane and self-granting (`:160-163`), gives admin no implicit approval right (`:150`) and registers grant storage/assignment, D00 principal linkage and a reviewer login role as `NEEDS_ADR` (`:34-35`, `:396-404`).
- [M20-04 reviewer authority proposal](M20-04-reviewer-authority-proposal.md) recommends explicit revocable D12 scope grants bound to `auth_users.id`, with the login-role enum unchanged and no self-grant.
- The D08 contract consumes a caller-loaded `ReviewerGrant` shaped as `grantRef, principalRef, role, domains, scopes, grantedAt, expiresAt, revokedAt` (`packages/governance/src/index.ts:95-104`), requires `role === 'RELEASE_REVIEWER'`, rejects `MACHINE` actors (`:626`), and refuses with `REVIEWER_NOT_GRANTED`, `REVIEWER_GRANT_REVOKED`, `REVIEWER_GRANT_EXPIRED` or `REVIEWER_SCOPE_MISMATCH` (`:606-617`, `:209-212`). Its context is supplied by the caller, so it is a boundary, not proof of a real grant.
- No `review_scope_grant` implementation and no D12 package exist in the workspace. No account-creation endpoint exists; accounts are provisioned operationally (`M20-02:282-285`).

## Proposed grant contract

These are candidate rules for owner ratification. "Must" below describes the proposed contract, not current behaviour.

### 1. Authority model

1. Reviewer authority is an explicit, revocable **D12 scope grant** bound to a D00 principal. It is not a login role and not implied by `admin`.
2. `auth_users.role` stays `admin`/`user`/`guest`. `RELEASE_REVIEWER` is a grant role label inside the D08 contract, never a value in the login enum. Choosing a real `reviewer` login role instead is a separate D00 ADR.
3. An `admin` principal may approve only while holding an explicit `approve:<lane>` grant and passing the same eligibility checks as any reviewer.
4. D00 remains the only identity; D12 owns grant records and their lifecycle; D08 consumes validated grants for release decisions. No second Hub, identity store, SQL owner or approval engine is created.

### 2. Grant record

The canonical record belongs to D12. It must carry at least:

| Field | Meaning |
|---|---|
| `grantRef` | Immutable grant identifier; never reused or re-pointed |
| `accountRef` | D00 `auth_users.id` of the grantee |
| `kind` | `author` or `approve` |
| `scopeCode` | Stable lane code such as `D05.RESEARCH`, `D06.WITNESS`, `D07.STORY` |
| `issuedByRef` | D00 principal of the issuer; never the grantee |
| `issuedAt` | Issue time |
| `expiresAt` | Explicit expiry, or `null` only under a ratified policy that permits it |
| `revokedAt` | Revocation time, or `null` |
| `revokedByRef` | Revoker principal, or `null` |
| `reasonRef` | Opaque reason/event reference for issue and revocation |
| `state` | Derived: live, expired, revoked, superseded |

A D08 `ReviewerGrant` is a **server-derived projection** of live D12 `approve` grants: `grantRef` = D12 grant id, `principalRef` = `accountRef`, `role` = `RELEASE_REVIEWER`, `domains`/`scopes` from the lane mapping, `grantedAt` = `issuedAt`, `expiresAt`/`revokedAt` copied. The projection is built from the canonical store on each decision and read; it is never accepted from a request body. Fields not in the D08 contract must not be added to the projection.

### 3. Issuance

1. Only an authenticated D00 `admin` principal may issue a grant, and never to itself.
2. The issuer must be distinct from the grantee for both kinds. Issuance must be an explicit, audited action with a written reason; no implicit grants on login, role change or account creation.
3. The grantee must be an existing, active D00 account with a display name, login role `user` or `admin`, and no machine/API-key marker.
4. Whether `approve:<lane>` needs a second, distinct admin confirmation is an owner choice below; this proposal does not assume it.
5. A grant for an unknown lane, unknown kind or inactive account is refused. There is no wildcard lane.

### 4. Revocation and expiry

1. The issuer, any other admin, or an automated account-deactivation/role-change control may revoke a grant immediately. Revocation blocks new decisions at once.
2. Revocation never rewrites past decision events. Whether a past decision stays readable after its grant is revoked is an owner choice (see §7 and the choices table); the current D08 read path rechecks the grant and therefore refuses.
3. Expiry is evaluated server-side against the decision/read time, never a caller-supplied clock. An expired grant is not renewed implicitly; renewal is a new grant event with its own issuer and audit record.
4. Superseding a grant (for example a changed lane or shorter term) creates a new record and marks the old one superseded; it does not mutate history.

### 5. Lane mapping

Lanes are a closed vocabulary. The D08 release domains map as follows; any other lane or scope is denied rather than guessed:

| D12 lane | D08 domain | D08 scope |
|---|---|---|
| `D05.RESEARCH` | `D05_RESEARCH` | `public` |
| `D06.WITNESS` | `D06_WITNESS` | `public` |
| `D07.STORY` | `D07_STORY` | `public` |
| `D01.TEXT` | — (rights review only; not a release domain) | — |
| `D08.RIGHTS` | — (rights review only; not a release domain) | — |

Only `approve:<lane>` grants feed release decisions. `author:<lane>` grants control submission and never authorize approval. The `public` scope is the only decidable release scope in the current D08 contract; a future scope needs its own accepted decision.

### 6. Identity binding and separation of duties

1. The acting principal comes from `EndpointCtx.user.id` plus the canonical `auth_users` row. Missing session, missing row, missing display name, `guest`, stale account or machine principal fails closed. The request body cannot choose reviewer id, name or role.
2. A principal may not decide a release it submitted; a conflicting principal reference in the request is denied.
3. A principal may not hold both `author:<lane>` and `approve:<lane>` for the same lane. A grant whose issuer is the submitter cannot be used to approve that submitter's work.
4. If an account holds overlapping approval grants in a lane, the decision still needs a grant that satisfies the exact domain and scope; overlapping grants do not widen authority.
5. One human controlling two accounts with disjoint grants can still satisfy these checks. No D00 account-linkage mechanism exists today, so this remains a documented residual risk unless the owner ratifies one (M20-02 `NEEDS_ADR-D00-principal-linkage`).
6. Machine principals and API keys can never hold reviewer grants; the D08 contract already rejects `MACHINE` actors.

### 7. Recheck at decision and read time

1. Grants are evaluated against the **current** canonical store inside the decision transaction, not a client-supplied list and not a cached list of unknown age.
2. The decision records only the opaque `grantRef` used, plus the actor and evidence references; it does not copy account details, names or lane descriptions into the decision.
3. The read path rechecks the grant, the exact release/revision binding, the allowlist, withdrawal state and all four evidence references. Revoked, expired, missing or out-of-scope grants make the projection unavailable; they never turn a decision into a publication.
4. A grant change never activates, publishes or withdraws content by itself. Activation remains off under ADR-0013.

### 8. Refusal vocabulary

Refusals expose only stable codes and opaque ids. This proposal adds no new codes; it binds the existing D08 codes to the grant lifecycle:

| Code | Condition |
|---|---|
| `IDENTITY_UNVERIFIED` | No verified D00 principal or canonical account row |
| `ACTOR_NOT_HUMAN` | Machine/API-key principal |
| `REVIEWER_NOT_GRANTED` | No live `approve` grant for the principal |
| `REVIEWER_GRANT_REVOKED` | All candidate grants revoked |
| `REVIEWER_GRANT_EXPIRED` | All candidate grants expired |
| `REVIEWER_SCOPE_MISMATCH` | Grant exists but not for the exact domain and scope |
| `SELF_REVIEW` / `REVIEWER_CONFLICT` | Submitter or conflicting-principal collision |

M20-02's queue-level codes (`DENY_MACHINE`, `DENY_DELEGATED`, etc.) remain D12 names; no mapping is claimed as implemented.

### 9. Legacy caller-supplied reviewer values

1. Reviewer strings previously accepted from request bodies are assertions, not authority. They must not be treated as grants, used to pass eligibility, or backfilled into `accountRef`.
2. Historic rows stay intact and are labelled as legacy, unbound assertions. New endpoints must reject or ignore the legacy field; the owner chooses which (choice 6).
3. No display-name matching, ever. A name is not an identity and cannot establish four-eyes separation.

### 10. Audit and retention

1. Issue, renewal, revocation and supersession are append-only grant events with grant id, actor, timestamp, reason reference and outcome. Grant events contain no content, source bytes or private evidence.
2. Admin may inspect grants and their events through an authorized surface; other roles see nothing beyond their own grants.
3. Retention, export and deletion of grant events are unresolved. ADR-0013 §7 invents no duration, and M20-02 §10 leaves evidence retention open. This proposal does not set one.

## Mapping to existing contracts

| Existing artifact | What this proposal uses | What it does not do |
|---|---|---|
| ADR-0013 §2 | Identity from D00; grant ADR prerequisite; login-role enum unchanged | Does not ratify ADR-0013 or replace it |
| M20-02 `review_scope_grant` | Lane vocabulary, `author`/`approve` kinds, issuer/issuedAt/revokedAt, no self-grant | Does not implement or accept M20-02 |
| M20-04 authority proposal | D12 grant direction, canonical-row actor, no self-grant, legacy handling | Does not close M20-04 or activate HQ actions |
| `@moonwitness/governance` `ReviewerGrant` | Field shape and refusal codes for the derived projection | Does not change the package, its context loading or tests |
| M14 `humanActor` | Canonical-row verification precedent | Does not grant D03/D05 review authority |

## Explicit non-goals

- No schema, migration, table, route, endpoint, UI, package code or test is created or authorized.
- No `auth_users.role` value is added; no account, principal or grant is assigned to a real or fictional person.
- No content is cleared, published, projected or activated; no D08 release record is created.
- No TODO checkbox changes, and no leaf (M20-04, M18-02, M18-05, M19-19, M27) closes on this proposal.
- No retention, export or deletion duration is invented.
- No claim is made that any current code enforces these rules. The D08 contract's negative cases are tested; real grant storage and loading are not built.

## Owner choices still required

Each row needs an owner decision. No option is adopted here and the rows have no default.

| # | Decision | Constraint / evidence | Options to ratify (no default) | Authority |
|---|---|---|---|---|
| 1 | Authority model | ADR-0013 §2; M20-02 `NEEDS_ADR-D12-review-scope-grants` | D12 scope grants (recommended) · new D00 reviewer login role · both | D00, D12, D08 |
| 2 | Grant issuer and revoker | No grant administration exists; admin has no implicit approval right | Any admin except self · named grant-admin group · two distinct admins for `approve` · issuer plus any admin for revoke | D00, D12 |
| 3 | Break-glass | M20-02 gives admin no implicit right | No break-glass (recommended) · emergency approval with independent post-hoc review · owner-defined path | D00, D08 |
| 4 | Grant lifetime | D08 contract permits `expiresAt: null`; no policy sets a duration | Mandatory expiry with a stated maximum and renewal event · bounded default with exception · indefinite grants | D00, D12, D08 |
| 5 | Principal linkage | Accounts are provisioned outside REST; no linkage field exists | D00 account-linkage mechanism · attested sole-account declaration · ratify the residual risk | D00, D08 |
| 6 | Legacy reviewer values | D03 accepts `body.reviewer` today | Reject legacy field · ignore it and record actor only · deprecation window then reject | D03, D00 |
| 7 | History after revocation | Current D08 read path rechecks grants and refuses | Fail-closed read (recommended) · historical read with independent verifier · sealed decision readable without projection | D08, D12 |
| 8 | Grant-event retention | ADR-0013 §7; M20-02 §10 | Bounded retention with deletion/export rules · longer governance period with privacy basis · unresolved and no new persistence | D08, D00, privacy |
| 9 | Delegation / proxy | No delegation exists in M20-02 | No delegation (recommended) · time-bounded delegation with issuer and expiry · owner-defined | D00, D12 |
| 10 | Machine/API keys | D08 rejects `MACHINE`; API keys exist on accounts | Fixed prohibition (recommended) · separate machine-reviewer policy with its own ADR | D00, D08 |

## Recommended conservative starting position

**Non-binding recommendation pending ratification; not policy.** It keeps unfinished scopes private and adds no authority.

- D12 scope grants bound to `auth_users.id`; login roles unchanged; `RELEASE_REVIEWER` stays a grant label.
- `approve:<lane>` issuance by two distinct admins, neither the grantee; `author:<lane>` by one admin, never the grantee.
- Mandatory expiry for every grant, renewal as a new event; no indefinite grants even though the contract permits `null`.
- No break-glass approval, no delegation, no machine grants, no wildcard lanes.
- Legacy reviewer strings ignored or rejected, never backfilled; historic rows labelled legacy.
- Fail-closed read after revocation; past decision events retained unmodified.
- Principal linkage unresolved: ratify it explicitly or accept the residual risk in writing.
- No retention duration invented; no grant persistence until a separately authorized schema/route task exists.

## Acceptance path

1. The owner ratifies each choice above in an accepted ADR. The next free ADR number at the time of writing is `ADR-0015`; this proposal reserves nothing.
2. That ADR satisfies the ADR-0013 §2 prerequisite. Only then may a separately scoped task design the D12 grant store and the D08 grant loader, with schema, migration, routes and negative tests under owner review.
3. Until then, no principal is a reviewer, no grant exists, and M20-04, M18-02, M18-05 and M19-19 stay blocked for the same reason.

## Sources

- [ADR-0013 — D08 release authority](../decisions/ADR-0013-d08-release-authority.md)
- [ADR-0001 — ARSY is the XV Hub](../decisions/ADR-0001-arsy-is-xv-hub.md)
- [ADR-0002 — additive MoonQL domains](../decisions/ADR-0002-additive-moonql-domains.md)
- [M20-02 — role-scoped review queue (design)](../decisions/M20-02-role-scoped-review-queue.md)
- [M20-04 — reviewer authority proposal](M20-04-reviewer-authority-proposal.md)
- [D08 release authority proposal](D08-release-authority-proposal.md)
- [M18-08 decision-boundary audit](../audit/M18-08-d08-release-decision.md)
- [`packages/governance/src/index.ts`](../../packages/governance/src/index.ts)
- [`packages/moonql-auth/src/index.ts`](../../packages/moonql-auth/src/index.ts)
- [`packages/moonql-research/src/common.ts`](../../packages/moonql-research/src/common.ts)
