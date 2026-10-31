# ORBIT — Spatial Agent Operations

**Decision:** accepted frontend boundary in [ADR-0004](../decisions/ADR-0004-empire-surfaces.md) · **Implementation:** planned under [M40](../../TODO.md#m40--orbit-spatial-agent-operations-frontend); not shipped.

**Operational status: PARKED (31 October 2026).** The app and its tests remain in `apps/orbit`, but nothing spawns, supervises, builds or deploys it: the dev registry entry is `dev:false`, port 3007 is retired, and the Compose service was removed. Unpark only when M40 is scheduled; see [APPS](APPS.md).

## Purpose

ORBIT is a standalone 3D-first, accessible 2D-fallback frontend for observing and navigating agent operations: workstations, agents, task lifecycle, work queues, tool/activity traces, and blocked/approval-required work. The experience should feel like a coherent futuristic spatial workspace, not a decorative dashboard whose animation pretends to be execution.

**Target product label:** **ORBIT — Spatial Agent Operations**. It may be linked from Headquarters / 100CENTER, but has its own application shell and frontend build.

## Ownership map

| Concern | Owner |
|---|---|
| Spatial visualization, scene navigation, agent/workstation inspector | `apps/orbit` (frontend only) |
| Human decisions, restricted review, approve/reject, audit | Headquarters / 100CENTER |
| Identity, roles, sessions, canonical operational API | Existing D00 / ARSY contracts |
| Shared tokens, primitives, keyboard and locale patterns | `@moonwitness/moonui` and accepted i18n contract |
| Task lease, execution, tool permissions, events and result semantics | Explicit runtime contracts (M29); not invented in ORBIT |
| Developer telemetry and process/port supervision | Cockpit; ORBIT does not replace it |

ORBIT owns **no canonical business domain or database tables**. Do not allocate a new D20 domain, SQL owner, database, identity provider, publishing engine, graph store, AI model router, or background executor. Read from approved typed APIs/SDK or a server-side adapter/BFF. Browser code must never receive ARSY service keys.

## App and technology boundary

- Target path: `apps/orbit`; target package: `@moonwitness/orbit`. No ORBIT directory, package, port, or deployment currently exists.
- Use existing Next.js application conventions for the outer shell, routes, and server-side authorization. Keep the interactive 3D scene in a lazy-loaded client-only boundary.
- Preferred scene candidate: React Three Fiber + Three.js + Drei, after compatibility and license checks against actual React/Next/toolchain versions. Pin dependencies through pnpm and measure bundle weight; do not assume compatibility or install unreviewed latest versions.
- Keep workspace imports minimal and explicit. Prefer public package exports and typed API clients over imports from Headquarters internals. Do not depend on HQ's route tree, server actions, or private UI.
- The frontend must have independent build/deploy instructions. Update root workspace/build scripts, lint/UI design gates, Docker/deployment path, and CI intentionally. Do not reserve a port or publish a URL until M40-01 records the topology decision.
- Local development must work with the backend unavailable. Use deterministic fixtures labelled `SIMULATED`; never conflate fixtures with runtime state.

## Spatial UX contract

1. **World view:** show a clear spatial overview of agent/workstation nodes grouped by actual task/run or named logical workspace. Avoid unbounded particles, excessive overdraw, and motion that blocks reading.
2. **Inspectable objects:** selecting a node opens a readable 2D inspector showing available identity/source, state, task, last event timestamp, data freshness, and permitted next steps.
3. **Task lifecycle:** display only states backed by runtime contracts; preserve unknown, blocked, failed, and cancelled states. Activity paths come from real event relationships, not visual conjecture.
4. **Human approval:** restricted/consequential actions hand off to Headquarters / 100CENTER. ORBIT can show `approval-required` and link to a permitted route; it never silently approves or publishes.
5. **2D and keyboard path:** every essential interaction works without WebGL, 3D rotation, colour perception, hover, or sound. Provide list/table navigation, labels, focus states, and accessible names.
6. **Motion/performance:** honor reduced motion; pause nonessential animation when hidden/idle; avoid forced camera movement; dynamically import the scene; test on integrated GPUs and modest devices before release.
7. **Truthful state language:** fixtures say `SIMULATED`; use `LIVE` only when an authorized data source confirms freshness. Render `STALE`, `OFFLINE`, `UNKNOWN`, `BLOCKED`, and errors explicitly. No fake counters, activity, health badges, or invented agent names.
8. **Design:** moonpunk/futuristic spatial-workstation language grounded in MoonUI semantic tokens, readable contrast, restrained glow, licensed/original assets, accessible typography, `id`/`en`, and source-aware RTL. Visual effects never change permissions or factual meaning.

## Integration and security gates

- Start with read-only view models; do not add write endpoints because a visual prototype needs them. If the existing API lacks required data, record the gap and request owner-reviewed contract work instead of creating a second backend.
- Reuse central sessions and server-side authorization. Test direct URLs, expired sessions, role isolation, tenant/object scope, origin constraints where relevant, and absence of browser-visible service secrets.
- Tool actions are evidence/traces, not arbitrary-command buttons. Any future invocation must use the authorized execution contract, allowlisted tools, scope, and human-approval gates.
- Do not create a second AI executor in ORBIT. M29 owns task leases/planning integrity; M20 owns human-governance decisions; M37 owns cross-app identity/deployment boundaries.
- Simulated fixtures stay separate from real sources in both type and presentation. Backend unavailability produces honest offline/unknown states, never simulated-green live status.

## Extraction readiness

ORBIT starts inside this repo to reuse shared contracts but is designed to be separable later: no imports from Headquarters internals, only public shared packages/narrow typed API interfaces, isolated frontend build artifact/deployment configuration, minimal environment contract, separate auth/deployment/health/readiness checks, documented shutdown/rollback, and no direct database access.

Repository extraction is a future decision, not part of M40. The first release is a frontend surface inside this monorepo.
