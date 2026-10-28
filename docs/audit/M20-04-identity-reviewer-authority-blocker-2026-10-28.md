# M20-04 identity reviewer authority blocker — 2026-10-28

## Finding

M20-04 remains open at `dev` HEAD `5f894ab209e56561272e43260ccf4504a2505d89` (the inspected `git status --short --branch` reported `dev...origin/dev`). Existing D03 identity, alias, source and conflict records and decision endpoints are present. The blocker is whether an HQ action can make a safely attributable reviewer decision: the identity endpoint accepts the reviewer name from request data instead of deriving it from the authenticated D00 principal, and M20-02 leaves reviewer mandates and principal linkage pending an ADR. A UI that fills this field from the current session would improve the normal HQ path but would not make the hub decision record authoritative against direct API requests.

A second constraint is data exposure: `/ontology/conflicts` is admin-only, but the public `/ontology/constellation` projection includes unresolved conflict entries and evidence text. Any new panel must not treat that public projection as an authorized reviewer queue.

## Evidence inspected

- `packages/moonql-ontology/src/index.ts:604-635`: `POST /ontology/merges/decide` declares `requires: ADMIN_ONLY`; its schema accepts `reviewer` as required text at line 611, and the handler reads `body.reviewer` at line 621 and checks only that reviewer/reason/evidence are nonempty at lines 635-637. The inspected handler does not derive reviewer from authenticated D00 identity.
- `packages/moonql-ontology/src/index.ts:466-468`: `GET /ontology/conflicts` is guarded by `ADMIN_ONLY` and returns `conflictQueue(buildConstellation(...))`.
- `packages/moonql-ontology/src/index.ts:457-460`: `GET /ontology/constellation` is public and returns the full `buildConstellation` projection.
- `packages/moonql-ontology/src/graph.ts:241-294,372`: the projection builds unresolved relation, pending identity, contested entity and alias-collision conflicts, including relation reason, source and evidence fields; the result includes the `conflicts` collection.
- `apps/arsy/test/public-projection-denial.test.ts:836-887`: a current test is explicitly named as a permissive-today gap. It demonstrates that the admin conflict endpoint returns 401 anonymously while the public constellation returns an unreviewed edge, its reason/evidence span and a conflict-queue entry.
- `docs/decisions/M20-02-role-scoped-review-queue.md:3`: M20-02 is described as a design proposal, not an accepted ADR, and does not authorize code/schema/routes/role changes. Lines 34-35 and 74 identify reviewer roles and reviewer-scope grant policy as `NEEDS_ADR`; line 150 states admin has no implicit decision right. Lines 396-404 list pending ADRs for scope grants, D00 principal linkage and reviewer login role.
- `docs/audit/M10-ontology-identity.md:50-75`: confirms the existing source/entity/alias/relation/identity-review models, ACLs, admin-only conflict endpoint and evidence rubric. It also notes that the public projection carries the conflict list.

## Required before an HQ reviewer action is safe

1. An accepted D00/D12 decision defining reviewer authority (including whether admin can act, scope-grant issuance/revocation, principal linkage and separation-of-duties rules).
2. A trusted decision API contract that binds the recorded reviewer to the authenticated D00 principal on the server, or an explicitly accepted residual risk and compensating control. A client-supplied display name, even when prefilled by HQ, is not identity proof.
3. A safe HQ integration that reads the admin-only conflict endpoint only after checking its published ACL, and obtains source records through their owning APIs. It must not use the public constellation response as its reviewer queue while that projection exposes unresolved conflict/evidence details.
4. Exact source/evidence links for each actionable item, with unknown or missing evidence remaining unresolved; do not create or infer identity/conflict records to populate the panel.
5. After those gates, focused positive and negative tests for session-bound attribution, role/scope denial, missing evidence and conflict/source linkage, plus independent review of the exact implementation.

## Limits

This is a source/contract audit only. No live hub, production identity, source documents, user/reviewer records, database, route execution, tests or browser behavior were inspected. The code establishes that D03 APIs and seed-backed conflict records exist; it does not establish that those records represent a current real-world dispute or that any particular reviewer is authorized. No source, TODO or test file was changed, and no tests, commit or push were performed. This new audit note is the only file created for this request.
