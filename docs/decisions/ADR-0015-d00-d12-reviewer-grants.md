# ADR-0015 — D00/D12 reviewer grants

**Status: ACCEPTED — owner ratification, 29 October 2026 (WIB).** The owner ratified the **full conservative package** of the [D00/D12 reviewer-grant proposal](../design/D00-D12-reviewer-grant-proposal.md), including all ten open choices, as one position. Acceptance records policy only. It does not authorize a schema, migration, route, UI, code change, login-role value or grant assignment, and it does not clear, publish or project any content. No principal becomes a reviewer by this ADR.

## Context

[ADR-0013 §2](ADR-0013-d08-release-authority.md) accepted that a release decision is bound to verified D00/ARSY identity, never a caller-supplied reviewer string, and that **a D00/D12 reviewer-grant ADR must exist before any principal or role is treated as an authorized reviewer**. Adding a `reviewer` login role would require a separate D00 ADR.

That prerequisite was missing. [M20-02](M20-02-role-scoped-review-queue.md) is a design proposal that assigns D12 ownership of `review_scope_grant`, defines `author:<lane>`/`approve:<lane>` lanes and registers grant storage, principal linkage and a reviewer role as `NEEDS_ADR`. [M20-04](../design/M20-04-reviewer-authority-proposal.md) recommends explicit D12 grants bound to `auth_users.id` without widening the login-role enum. The D08 contract in `@moonwitness/governance` consumes a caller-loaded `ReviewerGrant` and rejects machine actors, but its context is supplied by the caller and is not proof of a real grant. No `review_scope_grant` implementation, D12 package, grant store or account-linkage mechanism exists.

The owner chose the [proposal's](../design/D00-D12-reviewer-grant-proposal.md) conservative package instead of a reviewer login role. Where the proposal required a choice between inventing account linkage and recording a residual risk, this ADR records the residual risk because no linkage mechanism exists and none is authorized here.

## Decision

1. **Authority model.** Reviewer authority is an explicit, revocable **D12 scope grant** bound to a D00 `auth_users.id`. It is not a login role and is not implied by `admin`. `auth_users.role` stays `admin`/`user`/`guest`; `RELEASE_REVIEWER` is a grant label inside the D08 contract, never a login-role value. An `admin` may approve only while holding an explicit `approve:<lane>` grant and passing the same eligibility checks as any reviewer.
2. **Grant record.** The canonical record belongs to D12 and carries at least `grantRef`, `accountRef`, `kind` (`author`/`approve`), `scopeCode`, `issuedByRef`, `issuedAt`, `expiresAt`, `revokedAt`, `revokedByRef`, `reasonRef` and a derived `state`. A D08 `ReviewerGrant` is a server-derived projection of live D12 `approve` grants (`grantRef`, `principalRef`, `role: RELEASE_REVIEWER`, `domains`, `scopes`, `grantedAt`, `expiresAt`, `revokedAt`), built from the canonical store on every decision and read. It is never accepted from a request body.
3. **Issuance.** `approve:<lane>` grants require two distinct D00 `admin` principals, neither of them the grantee. `author:<lane>` grants require one `admin` principal, never the grantee. Issuance is an explicit audited action with a written reason; there are no implicit grants on login, role change or account creation. The grantee must be an existing active D00 account with a display name and login role `user` or `admin`, without a machine/API-key marker. Lanes are a closed vocabulary with no wildcard; unknown lane, kind or account is refused.
4. **Expiry and renewal.** Every grant carries a mandatory expiry. Renewal is a new grant event with its own issuer and audit record; it is never implicit. An expired grant denies new decisions. Indefinite grants are not permitted even though the D08 contract type allows `expiresAt: null`; contract permissibility is not policy.
5. **Revocation and supersession.** The issuer, any other admin, or an automated account-deactivation/role-change control may revoke immediately; revocation blocks new decisions at once and never rewrites past events. A superseded grant (changed lane or term) is a new record; history is not mutated.
6. **No break-glass, delegation or machine review.** There is no break-glass approval path, no grant delegation or proxy, and no machine or API-key reviewer. Any future exception requires a superseding ADR; it cannot be introduced by convention, configuration or UI.
7. **Lane mapping.** Only `approve:<lane>` grants feed release decisions; `author:<lane>` controls submission and never authorizes approval. `D05.RESEARCH` maps to D08 domain `D05_RESEARCH` with scope `public`; `D06.WITNESS` to `D06_WITNESS`; `D07.STORY` to `D07_STORY`. `D01.TEXT` and `D08.RIGHTS` are rights-review lanes, not release domains. `public` is the only decidable release scope in the current D08 contract.
8. **Identity binding and separation.** The acting principal comes from `EndpointCtx.user.id` plus the canonical `auth_users` row; a missing session/row/display name, `guest`, stale account or machine principal fails closed. The request body cannot choose reviewer id, name or role. A principal may not decide its own submission or a conflicting one, may not hold both `author:<lane>` and `approve:<lane>` for the same lane, and overlapping approval grants never widen the exact domain/scope check.
9. **Principal-linkage residual risk (ratified).** A single human controlling two accounts with disjoint grants is **not detected** by this decision, and no account-linkage field or mechanism is created. The owner ratified this residual risk in writing. Same-account, self-review, conflict and overlap checks still apply. Enforcing account linkage requires a future D00/D08 ADR; this ADR does not claim four-eyes separation across disjoint accounts.
10. **Recheck at decision and read time.** Grants are evaluated against the current canonical store inside the decision transaction, never a client-supplied or stale cached list. The decision records only the opaque `grantRef` used. The read path rechecks the grant, exact release/revision binding, allowlist, withdrawal state and all four evidence references; revoked, expired, missing or out-of-scope grants make the projection unavailable. A grant change never activates, publishes or withdraws content; activation remains off under ADR-0013.
11. **Legacy reviewer values.** Reviewer strings from request bodies are assertions, not authority. New or modified endpoints must reject the legacy field; existing handling changes only under a separately scoped D03/D00 task. Historic rows stay intact, labelled legacy and unbound; no backfill from a matching display name, ever.
12. **Audit and retention.** Issue, renewal, revocation and supersession are append-only grant events containing grant id, actor, timestamp, reason reference and outcome, and no content or private evidence. Admin may inspect grants and events through an authorized surface; other roles see only their own grants. Retention, export and deletion of grant events remain unresolved; this ADR invents no duration.
13. **Refusal vocabulary.** Refusals expose only stable codes and opaque ids, using the existing D08 codes `IDENTITY_UNVERIFIED`, `ACTOR_NOT_HUMAN`, `REVIEWER_NOT_GRANTED`, `REVIEWER_GRANT_REVOKED`, `REVIEWER_GRANT_EXPIRED`, `REVIEWER_SCOPE_MISMATCH`, `SELF_REVIEW` and `REVIEWER_CONFLICT`. No new codes are created here.

Proposal choice mapping: choice 1 → §1, 2 → §3/§5, 3 → §6, 4 → §4, 5 → §9, 6 → §11, 7 → §10, 8 → §12, 9 → §6, 10 → §6.

## Consequences

- **ADR-0013 §2's policy prerequisite is satisfied.** A principal or role may be treated as an authorized reviewer only through the grants described above; identity still grants no reviewer authority by itself.
- **M20-02's `NEEDS_ADR-D12-review-scope-grants` is addressed at policy level.** The M20-02 design document remains a proposal and is unchanged by this ADR.
- **No implementation is authorized.** There is no grant store, schema, migration, endpoint, UI, loader, audit trail or role change. A separately scoped task must design the D12 grant store and D08 grant loader, with positive and negative tests, before any real grant exists.
- **No TODO row closes.** M20-04 and the D08-blocked rows lose a policy blocker but keep their implementation evidence requirements; M18-02, M18-05, M19-19 and M20-04 remain open.
- **No content, principal or grant is created or assigned.** No publication, projection or activation follows.
- **The proposal is now ratified policy**; later changes to these positions require a superseding ADR rather than an edit to the proposal.

## Known gaps

- Account linkage across disjoint grants is an accepted residual risk, not a solved control.
- The existing D03 `/ontology/merges/decide` caller-supplied reviewer handling is unchanged and still requires its own scoped implementation under D03/D00.
- Grant persistence, API surface, event immutability and retention/export/deletion are unimplemented and unresolved.
- The D08 contract's caller-supplied context remains a boundary; only a future server-side loader can make grants authoritative.

## Rollback

Revert this ADR and the proposal's status line; nothing in code, schema, data, routes or deployment depends on it. TODO annotations that reference the ratification must be re-annotated in the same change. The conservative position can be withdrawn without affecting any published content because none exists.

## Sources

- [D00/D12 reviewer-grant proposal](../design/D00-D12-reviewer-grant-proposal.md)
- [ADR-0013 — D08 release authority](ADR-0013-d08-release-authority.md)
- [M20-02 — role-scoped review queue (design)](M20-02-role-scoped-review-queue.md)
- [M20-04 — reviewer authority proposal](../design/M20-04-reviewer-authority-proposal.md)
- [ADR-0001 — ARSY is the XV Hub](ADR-0001-arsy-is-xv-hub.md)
- [ADR-0002 — additive MoonQL domains](ADR-0002-additive-moonql-domains.md)
- [`packages/governance/src/index.ts`](../../packages/governance/src/index.ts)
- [`packages/moonql-auth/src/index.ts`](../../packages/moonql-auth/src/index.ts)
