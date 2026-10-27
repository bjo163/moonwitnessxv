# M37-03 — Tenant and role capability access contract

**Design specification · source SHA `9152badc3605346967181ebd3804bcc088e27312` · no new tenant model, role, endpoint, or ACL implementation.** This contract specifies how a future multi-app capability boundary must preserve existing ARSY/MoonQL authority. It does not assert that tenant isolation currently exists.

## Current authority and evidence

- ARSY/D00 owns identity, session validity and canonical roles. Headquarters is a consumer and human-governance UI; it must not create a second user, role, tenant, or capability store.
- Headquarters server code calls ARSY `/auth/me` for the current user and uses the shared `can()` matcher from `@moonwitness/moonql-client` against ARSY-published model/view/endpoint ACL metadata. Missing endpoint metadata is denied. Hub 401 is anonymous; Hub failures remain unavailable rather than becoming anonymous success.
- HQ's current `SessionUser` shape contains `id`, `login`, `displayName`, optional `email`, and `role`. No tenant or organization claim appears in that interface. Therefore no tenant boundary can be inferred from current role alone, and “tenant isolation implemented” would be unsupported.
- ORBIT is a read-only projection frontend sharing ARSY identity/data contracts; Headquarters / 100CENTER remains the restricted review and decision surface. Dock remains subject to source rights and public projection rules. Cockpit is a local technician tool, not an admin/tenant control plane.

## Capability decision

1. **Authenticate centrally; authorize each operation.** A valid ARSY session identifies the caller but does not grant all actions. Every server/API operation checks a named capability or the current published MoonQL ACL before loading or mutating protected data. UI visibility is presentation only.
2. **Use deny-by-default capability grants.** Capability names are stable machine identifiers, separate from translated labels. Grant decisions are derived from canonical ARSY role/session data plus resource/action policy in the owning service. Unknown roles, capabilities, policy versions, missing metadata, malformed scopes and policy lookup failures deny or return explicit unavailable; never fall back to “admin” or a UI default.
3. **Keep role sets in the owner.** Do not create local role tables or parallel access maps in each frontend. Each operation declares the minimum capability it needs; central policy maps canonical roles to capabilities. A high-level role name is not itself proof of access to every object or action.
4. **Scope every object access.** If/when tenant-bearing resources are introduced, the trusted server derives tenant scope from the authenticated authority and the resource owner; clients cannot choose or widen it by query/body/header. Every list/get/search/export/update/delete path applies the same scope before data leaves the owner. Cross-tenant access is denied unless an explicit, audited, time-bounded delegation contract is approved.
5. **Do not invent tenant semantics now.** Existing user accounts/resources may be global or app-specific. Before tenant implementation, document tenant identity, membership lifecycle, ownership of shared/public objects, invitations, transfers, service principals, break-glass access, and migration/backfill. Until then, do not add a nullable `tenantId` as decorative metadata or treat role as a tenant.
6. **Approval is separate from capability.** A capability to propose an action is not approval to execute it. Consequential changes remain pending a named authorized human decision in Headquarters; the action and approval bind the same resource, scope, arguments, expiry and actor rules. No self-approval or autonomous bypass.
7. **Audit the decision safely.** Record actor, capability/policy version, resource identifier, decision, reason code and correlation time in the owning audit authority. Exclude bearer tokens, secrets, raw private source and unnecessary personal data. For consequential mutations, define failure behavior under the accepted audit contract; fail closed unless that contract explicitly provides a durable alternative. This specification does not ratify a new audit durability policy.

## Positive and negative acceptance matrix for implementation

| Case | Required result |
|---|---|
| Authorized role + named capability + in-scope object | Server permits only the declared operation and returns only authorized fields |
| Same role, wrong capability or action | Denied before protected read/write; hiding the UI control alone is insufficient |
| Missing/unknown role, ACL, capability or tenant scope | Denied by default; no guessed fallback or unscoped query |
| Caller supplies another tenant ID in query/body/header | Ignore/reject client scope and deny cross-tenant resource access |
| List, search, expand, export and direct object URL | Same tenant and field-level scope is enforced on every path |
| Expired/forged/revoked session or ARSY outage | Denied/unavailable; never served from a stale positive authorization cache |
| Consequential action without valid human approval | Remains unexecuted; proposal and approval are distinct capabilities/states |
| Audit persistence fails during restricted mutation | No side effect is committed unless durable audited intent is guaranteed |

## Verification evidence and boundaries

At `9152badc3605346967181ebd3804bcc088e27312`, source inspection covered `apps/headquarters/src/data/types.ts`, `apps/headquarters/src/lib/authz.ts`, `apps/headquarters/src/lib/session-auth.mjs`, ADR-0004, the accepted ARSY/MoonQL boundary, `docs/architecture/ORBIT.md`, and security guidance. `pnpm --filter @moonwitness/headquarters typecheck` exited 0. These sources positively establish central-session/ACL ownership and HQ's current non-tenant user shape. Negative evidence is also explicit: no `tenantId` or tenant membership is present in `SessionUser`; no tenant-isolation implementation is claimed. The repository's scoped public/role denial suites exist, but this design task does not rerun or extend them.

Independent read-only review found the claims consistent with the current source and accepted this as a design-only artifact. It noted that audit-write failure behavior remains a proposal until the accepted audit contract determines it.

Independent implementation acceptance must add adversarial tests for wrong capability, object-scope injection, list/search/export/expand parity, revoked sessions, direct URL/API access and audit failure before a tenant or capability feature is called implemented. The test runner and source SHA must be recorded in that future task. This document creates no role/capability map, schema, endpoint or deployment claim.

## Rollback

One additive specification file; rollback by deleting this file only after checking references. No identity, tenant, ACL or application behavior changes.
