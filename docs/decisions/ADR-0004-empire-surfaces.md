# ADR-0004 — Empire application boundaries

**Status: ACCEPTED — owner ratification 27 October 2026.** This decision accepts ORBIT as a bounded specialized frontend. It does not authorize every proposed Empire surface or imply an application has shipped.

## Decision

1. **Headquarters / 100CENTER remains the human-governance surface.** It owns restricted review queues, human decisions, audit views, source rights, and release controls.
2. **ORBIT is approved as a standalone frontend application** in the existing XV monorepo: `apps/orbit`, product label **ORBIT — Spatial Agent Operations**. It is a 3D-first, accessible 2D-fallback workspace for inspecting agent, workstation, and task state. It is not a Headquarters page and not a backend service.
3. **ORBIT shares existing identity and data authority.** It uses D00/ARSY identity, roles, sessions, approved typed APIs/SDK/BFF contracts, and MoonUI. It creates no new login, database, SQL owner, domain owner, publishing engine, graph store, AI executor, or model router.
4. **Runtime authority stays elsewhere.** Task leases, execution, tools, and events must come from explicit runtime contracts, not animations. Headquarters remains the approval destination for consequential/restricted actions. ORBIT can hand off an approval request but may not approve, auto-publish, or execute unapproved actions.
5. **Standalone frontend does not mean immediate repository split.** ORBIT initially lives in this pnpm monorepo with its own workspace, build/check gates, app entry, and deployable frontend artifact. Keep dependencies explicit and shallow. A future repo split needs a separate migration, identity, CI, secrets, observability, cost, and rollback review.
6. **Other proposed spaces remain individually gated.** LIGHTHOUSE stays within Dock initially; HARBOR (D14), SHADOW (D07), MOONLAB (D05), WORKS (D15/D16), and HELIOGRID (conditional D17) do not get independent ownership, schemas, or deployments because ORBIT is accepted.

## Options considered

| Option | Decision | Reason |
|---|---|---|
| Put every surface inside Headquarters | Rejected for ORBIT | Couples the spatial workspace to privileged administration and impedes future separation. |
| Specialized frontend sharing ARSY/D00 | **Accepted for ORBIT** | Independent frontend/build/deployment boundary without duplicating backend or identity. |
| New backend/API/database per frontend | Rejected | Duplicates authority, auth, schemas, and operations. |

## Constraints and acceptance gates

- Workspace, build, lint, design-system, CI, and deployment definitions must intentionally include ORBIT; do not assume App Factory already supports it.
- Evaluate React Three Fiber / Three.js / Drei only after checking current React/Next versions, dependencies, licenses, bundle size, and performance. Load the scene client-side and lazily; retain a usable 2D path.
- Use certified MoonUI tokens, keyboard/ARIA behavior, `id`/`en`, reduced motion, and source RTL requirements. No arbitrary hard-coded colors or unlicensed mockup derivatives.
- Initial fixtures must be labelled `SIMULATED`. Real views distinguish `LIVE`, `STALE`, `OFFLINE`, `UNKNOWN`, `BLOCKED`, and errors based on evidence; never invent a green/healthy state.
- No ARSY service credentials in browser code. Server authorization is mandatory; hidden pages, cookie presence, or scene state are not access control.
- Integrate only after the relevant M03, M05, M20, M28, M29, M30, and M37 gates for the behavior in use. M40 is the canonical implementation plan; TODO remains the sole task/status register.
- Acceptance approves an architecture boundary only. It does **not** claim `apps/orbit`, 3D UI, live agent runtime, production authentication, or deployment exists.

**Canonical implementation plan:** [M40 — ORBIT](../../TODO.md#m40--orbit-spatial-agent-operations-frontend) · [ORBIT architecture contract](../architecture/ORBIT.md).
