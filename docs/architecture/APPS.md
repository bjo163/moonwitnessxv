# App/runtime contract

**Current working tree:** `dev` · owner branch policy in [AGENTS.md](../../AGENTS.md). App-directory presence and service tests do not, by themselves, prove production deployment.

## Current app directories

| Workspace | Ownership | Current evidence boundary |
|---|---|---|
| `apps/arsy` / `@moonwitness/arsy` | D00 identity/session, Fastify API, MoonQL and backend runtime | In-place M28 move is present; M28-13/M28-14 integration, regression and release evidence remain open. |
| `apps/dock` | Public Next.js reading/discovery frontend | Source-rights and scoped release gates still apply. |
| `apps/headquarters` | Privileged Next.js review/governance frontend; 100CENTER | Human approval and audit remain here; individual M20 gates require evidence. |
| `apps/cockpit` | Local Vite developer/technician GUI and process supervisor | Not a public admin, agent executor or runtime source of truth. |
| `apps/aigateway` | Internal inference/model adapter | Model routing only; not the multi-agent task lifecycle/executor by itself. |
| `apps/sentinel` | Worker/collector | Source collection is not publication authority. |
| `apps/skylink` / `@moonwitness/skylink` | Accepted D18 Messages & Channels service | REST + WebSocket control plane and provider adapters exist; ARSY integration, operator UI, and end-to-end proof remain open (M38-12..14). |
| `apps/echolog` / `@moonwitness/echolog` | Accepted D19 Object Storage & Attachments service | Filesystem-backed content-addressed objects and bounded S3-compatible subset exist; consumer/operator UI and final proof remain open (M39-11/12). Stateless: no tables. |
| `apps/orbit` / `@moonwitness/orbit` | ORBIT spatial operations frontend (M40) | **Planned only; not created.** Independent frontend/build/deploy boundary; not a backend service and owns no domain/schema. |
| `apps/lumen-runtime` / `@moonwitness/lumen-runtime` | Planned internal LUMEN worker process (M41; ADR-0010 accepted) | **Planned only; not created.** Executes runs through approved ARSY/M29 contracts; no public task API, database, identity, model routing or canonical state ownership. |

## ORBIT boundary

ORBIT is an independent frontend within this monorepo, not a separate backend. It shares D00/ARSY identity and authorized API/data contracts, uses MoonUI and id/en conventions, and passes restricted decisions to Headquarters / 100CENTER. Its interactive 3D scene is a client-side presentation layer; typed read models and server-side authorization remain authoritative. See [ORBIT architecture](ORBIT.md), [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), and [M40](../../TODO.md#m40--orbit-spatial-agent-operations-frontend).

## Non-negotiable ownership rules

- Do not add a database, login/SSO system, SQL owner, graph, or publishing engine for ORBIT.
- Do not expose ARSY service credentials to browser code; cookie presence or a hidden route is not authorization.
- Only verified runtime events can be labelled live. Fixtures are `SIMULATED`; stale/offline/unknown/denied states remain explicit.
- SKYLINK (D18) is the accepted messaging-service exception; ECHOLOG (D19) is a bounded stateless-storage exception. ORBIT is not a service exception.
- Any eventual separate GitHub repository for ORBIT requires a separately reviewed extraction plan; M40 delivers only a frontend inside XV.
