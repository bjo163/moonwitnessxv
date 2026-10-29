# M20-04 reviewer authority proposal

**Status: non-binding owner decision proposal; not an accepted ADR or implementation authorization.** **Policy update 2026-10-29:** the reviewer-grant prerequisite is ratified by [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md); the grant-model choices below are superseded at policy level. This document remains unchanged as the historical proposal and still authorizes no code, schema, route or UI.

- Repository: `Z:\project\moonradio`, branch `dev`.
- Baseline: `7e9f2c2359aa1d3b5824e6eff9dbb69735120ac9`; `git ls-remote origin refs/heads/dev` returned the same SHA.
- Scope: resolve only reviewer mandate and D00 principal binding needed by an identity/alias review surface. This does not define the full D12 queue, D08 publication policy, ontology semantics, or HQ UI.

## Observed authorities and gaps

- D00 is the identity owner. `packages/moonql-auth/src/index.ts:35-47` keeps `auth_users` REST-disabled and limits login role to `admin`, `user`, `guest`; sessions resolve to a user ID. `packages/moonql/src/rest.ts:135-143` injects the resolved principal into `EndpointCtx.user`; `packages/moonql/src/addon.ts:35-40` defines its stable ID and role list.
- Existing M14 pattern: `packages/moonql-research/src/common.ts:74-89` resolves a named human from `EndpointCtx.user.id` and the canonical `auth_users` row. `packages/moonql-research/src/review-subsystem.ts:215-262` persists actor ID/name/role in a versioned decision event. This is a useful implementation precedent, not automatic authority for D03.
- D03 currently has admin-gated identity decisions, but `packages/moonql-ontology/src/index.ts:604-637` accepts a request `reviewer` string and reads it from `body.reviewer`; it does not derive that recorded reviewer from `ctx.user`. `onto_identity_reviews` is `rest:true` with `ADMIN_FULL` at lines 294-297; its append-only hooks at lines 417-440 validate required fields but do not bind reviewer text to a principal. `packages/moonql/src/model.ts:38-45` shows `ADMIN_FULL` allows list/get/create/update/remove under admin ACL; hooks then reject identity-review update/delete. Direct create still needs to be closed or made actor-bound if endpoint-only review attribution is adopted.
- The checked M20-02 artifact is still explicitly a proposal, not an accepted ADR (`docs/decisions/M20-02-role-scoped-review-queue.md:3`). It records reviewer-scope grant storage/assignment and D00 principal linkage as `NEEDS_ADR` (`:34-35,74,396-404`) and says admin has no implicit decision right (`:150`).

## Proposed minimum contract for owner consideration

### 1. Bind decisions to the authenticated D00 principal

Every decision handler should derive `actorRef` from `EndpointCtx.user.id`, reload the canonical `auth_users` row, and obtain the recorded name/role from that row, following M14's `humanActor` precedent. The request body must not choose reviewer ID, display name, or role. A missing session, missing account row/name, guest role, or stale/invalid account must fail closed before a write. HQ may display the actor's canonical name, but the hub remains authoritative.

Each immutable decision/event should record at least `actorRef`, canonical `actorName`, canonical `actorRole`, decision action, target pair/revision, exact evidence reference (and digest where the source supports it), written reason, timestamp, and the grant/mandate reference used. Never rewrite old reviewer strings to imply verified identity.

### 2. Require an explicit reviewer mandate without widening login roles

**Recommended direction:** keep `auth_users.role` unchanged; model reviewer authority as an explicit, revocable scope grant owned by D12 in the existing MoonQL/ARSY data authority, not as an HQ table or second identity. A grant should reference `auth_users.id`, a stable scope/lane, permitted action, grantor principal, issue time and optional expiry/revocation. Review endpoints must check the live principal and applicable grant on every decision. Storage and management route details need the relevant owner/ADR; this note creates none.

A bare `admin` role should grant access to operations but not silently grant identity-review authority. Grant administration itself must be explicit and auditable; no self-grant. If the owner instead wants a D00 `reviewer` role, that is a separate D00 ADR and a deliberate role migration, not a local HQ convention.

### 3. Separation of duties and multi-account limits

At minimum, reject decisions where the reviewer principal ID equals the proposal's submitter/author principal ID, if that submitter identity is part of the canonical work item. Do not infer a human's identity from a display name. The owner must choose whether distinct accounts controlled by one human are addressed through an accepted D00 account-linkage mechanism or remain a documented residual risk; M20-02 lists this as `NEEDS_ADR-D00-principal-linkage`.

An ontology seed's `reviewer` string is not a submitter principal and cannot establish four-eyes separation. Until a canonical submitter/author principal exists for an identity candidate, do not claim that two-person separation was enforced for that candidate. A mandate's scope and current validity should be checked server-side; stale, revoked, expired, missing or overlapping grants deny the action.

## Compatibility and migration implications

1. Inventory callers of `/ontology/merges/decide` and direct `onto_identity_reviews` creation before changing the contract. The inspected M10 constellation UI is read-only; this is not proof that no external client calls the endpoint.
2. Change the decision API so actor identity comes from authenticated context. Prefer ignoring or rejecting legacy `reviewer` request values; never treat them as authority. If request shape or response/event schema changes for generated clients, regenerate the SDK and follow the repository's API-version compatibility process.
3. Close the direct-create attribution bypass: make identity-review records non-REST or expose only read operations, and route all new decisions through the actor-bound handler. Preserve the existing append-only history and read surface. Ensure review-log writes are likewise emitted by trusted server code.
4. Add mandate storage through the approved existing owner and an explicit migration. Existing seeded/historic rows should remain intact and be marked or documented as legacy, unbound reviewer assertions; do not backfill a principal from a matching name. New decisions must carry the trusted principal and mandate reference.
5. Test both positive and negative cases: a valid scoped principal can decide; body-name substitution, anonymous/guest, missing/expired/revoked grant, self-review, direct raw creation and stale/replayed transition fail without a decision/event. Retain append-only histories and existing public/read API compatibility only if its exposure is separately accepted; the reviewer queue itself must use admin-authorized paths.

## Owner choices still required

1. **Authority model:** explicit D12 scope grants (recommended) or a new D00 reviewer login role, and which domain signs off on that choice.
2. **Account separation:** same-account rejection only, or a D00 mechanism to detect multiple accounts controlled by one human; if not solved, ratify the residual risk.
3. **Admin operations:** whether admin can decide only with an explicit scope grant (recommended) or whether any break-glass path exists, including its independent audit/review requirements.
4. **Legacy rows/API:** how to label previously caller-supplied reviewer strings and whether to reject versus ignore the legacy body field; how to version generated clients.
5. **Grant lifecycle:** who can grant/revoke reviewer scope, grant duration, renewal, and emergency revocation behavior.

Until these choices are ratified in the right owner decision/ADR, a new HQ surface may show only safe, read-only information behind the published ACL; it should not submit or imply an authoritative reviewer decision. This proposal does not accept itself, change TODO status, alter code/schema or claim that any reviewer has been assigned.
