# M28-02 — ARSY technical compatibility map

**Status:** RATIFIED by integrator under accepted ADR-0001  
**Scope:** compatibility contract for the later move of the existing Radio backend to ARSY. This document does not authorize or perform that move.

## Baseline and authority

This map was prepared against repository HEAD `ffd435677a3bfb240ff1877ae51a9c940c414b12` (branch `codex/m05-08-locale-audit-387f784`). At inspection time `origin/main` and `origin/dev` both resolved to `d8c5bfa2e61f7d797d9478de0522514048a93886`. The working tree contained unrelated in-progress edits; this map was based on committed source at the stated HEAD and those edits were left untouched.

Authority order: accepted [ADR-0001](../decisions/ADR-0001-arsy-is-xv-hub.md) establishes the rename decision and invariants; [M28-01 inventory](M28-01-hub-identity-inventory.md) identifies affected consumers and names; [M22-01 Radio baseline](M22-01-radio-baseline.md) records the existing fixture boundary. Source paths below were checked at the baseline SHA. This document proposes the concrete compatibility contract for review; it does not itself mark M28-02 accepted or close its TODO row.

## Canonical identity and transition

| Surface | Canonical target | Compatibility rule |
| --- | --- | --- |
| Workspace | `apps/arsy` | Move the existing `apps/radio` workspace once; never keep a second copy. |
| Package | `@moonwitness/arsy` | Rename the existing package identity. Preserve its implementation and domain behavior. |
| Runtime process | One ARSY Hub process | One owner for Hub HTTP APIs and persistence; no parallel Radio/ARSY Hub. |
| Compose service and DNS | `arsy` | During migration, the old `radio` DNS name may be an alias to the same container. It must not address a second service. |
| Dev-runner/log identity | `arsy` | Recognize `radio` only as a transition alias where existing tooling needs it. |
| Domain identity | `radio`, stations, schedules, playlogs, listen/channel concepts and their IDs | These describe the SIGNAL/RADIO domain, not the Hub workspace name; retain them. |

The rename changes Hub identity only. It does not rename the Radio domain, SDK surface, API resources, tables, or records as a side effect.

## Environment aliases and deprecation window

The current server config reads `PORT` with default `3000`, and supports `RADIO_PORT`, `RADIO_PREFIX`, and `RADIO_TITLE` as overrides. Client applications consume `RADIO_API_URL`; it is a client URL setting, not a server setting. The transition contract is:

| Purpose | Preferred name after migration | Deprecated alias / fallback | Resolution |
| --- | --- | --- | --- |
| Server listen port | `ARSY_PORT` | `RADIO_PORT`, then generic `PORT` | `ARSY_PORT` → `RADIO_PORT` → `PORT` → `3000` |
| API prefix | `ARSY_PREFIX` | `RADIO_PREFIX`, then generic `API_PREFIX` | `ARSY_PREFIX` → `RADIO_PREFIX` → `API_PREFIX` → `/api/v1` |
| API title | `ARSY_TITLE` | `RADIO_TITLE`, then generic `API_TITLE` | `ARSY_TITLE` → `RADIO_TITLE` → `API_TITLE` → existing default |
| Hub base URL in clients | `ARSY_API_URL` | `RADIO_API_URL` | `ARSY_API_URL` → `RADIO_API_URL` → shared `HUB_API_DEFAULT` |

When both canonical and deprecated forms are set, the canonical `ARSY_*` value wins. During the transition, emit a warning naming the deprecated variable only; never print its value. Keep aliases for the entire first-party consumer migration and for at least two successful CI-verified `dev`→`main` promotion cycles after all first-party consumers use canonical names. Removal requires a separate reviewed change and evidence from repository-wide consumer search plus focused config/client contract checks. Generic `PORT`, `API_PREFIX`, `API_TITLE`, and `HUB_API_DEFAULT` remain shared compatibility defaults; this map does not deprecate them.

## HTTP, readiness, and data contract

- Keep the public port at `3000`; keep the REST prefix at `/api/v1`.
- Preserve all existing routes, methods, request and response schemas, status codes, error shape, and authentication/authorization behavior. In particular, retain `/api/v1/health`, `/api/v1/health/ready`, `/api/v1/metrics`, and the current station, schedule, now-playing, listen, and denpa API families. `/docs` remains available as currently configured.
- Preserve the existing API envelope and generated SDK compatibility. A Hub rename does not introduce `/api/v2`, alter auth, or change envelopes.
- Keep readiness at `GET /api/v1/health/ready` on port `3000`; Compose readiness must probe the same process and route.
- Preserve `DATABASE_URL` as the runtime connection setting and the existing PostgreSQL identity: Compose service `db`, its current volume, schema, migrations, roles, and data. Production must continue to require PostgreSQL rather than silently falling back to in-memory storage.
- Do not add another Hub database, connection owner, migration history, or mirrored dataset. Renaming a workspace or service does not authorize a table/schema migration.

## Rollout and rollback gates

1. Add canonical env aliases and precedence coverage while keeping current names functional; verify clients can resolve either URL name.
2. Move the existing workspace and package identity, updating workspace references and lockfile as one change. Confirm only one Hub app/package is registered.
3. Rename the Compose service to `arsy`; temporarily expose `radio` as a DNS alias to that same container. Update first-party clients and runner labels, retaining the compatibility window above.
4. Verify the existing route/envelope/auth/readiness contract, PostgreSQL connection and fixture-backed Radio regression behavior before promotion. M28-09 and the later runtime-move task supply their own evidence; this map does not substitute for those gates.

Rollback is a code/config revert to the single existing Radio workspace and service identity, with the same PostgreSQL volume and schema. Keep the `radio` alias pointed at the one process until rollback is no longer needed. Do not run destructive migrations, create a second Hub, or copy database contents as a rollback technique. Any schema change needs separate authorization, review, and restore evidence.

## Evidence, limits, and review

Observed source anchors at the baseline SHA: `packages/core/src/workspace.ts` defines `/api/v1`, Hub port `3000`, and the shared Hub URL default; `apps/radio/src/config.ts` defines the current `RADIO_*` overrides and production database requirement; `docker-compose.yml` defines service `radio`, port mapping, `db` connection, client URL, and readiness probe. Consumer inventory is recorded in M28-01. M22-01 documents normalized in-memory Radio fixtures and explicitly does not establish live playback or PostgreSQL parity.

This is a source-based compatibility map, not runtime verification. No migration, container rollout, live database check, or deployment was performed for this document. The route families above are representative; the preservation requirement applies to the complete route and schema surface present at the baseline. The integrator ratified this map against the exact source SHA above. M28-03/M28-10 may implement the physical move only subject to their dependencies, regression gates, and this compatibility contract.
