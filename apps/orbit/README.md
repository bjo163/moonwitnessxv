# @moonwitness/orbit — Spatial Agent Operations

**ORBIT** is the standalone 3D-first, accessible 2D-fallback operations frontend within MoonWitness XV for observing and navigating agent operations, workstations, queues, and task lifecycles.

## Architecture and Boundaries

Pursuant to [ADR-0004](../../docs/decisions/ADR-0004-empire-surfaces.md) and [docs/architecture/ORBIT.md](../../docs/architecture/ORBIT.md):

- **Owner:** `apps/orbit` (`@moonwitness/orbit`).
- **Domain:** Pure frontend observation surface. **Zero** database tables, zero SQL ownership, zero identity services, zero background task execution engines, zero AI model routers.
- **Port:** Dev port **3007** (`ORBIT_PORT=3007`, `http://localhost:3007`).
- **Data Source:** Read-only operational projections from canonical ARSY endpoints.
- **Offline / Standalone Fallback:** Deterministic local fixtures marked `SIMULATED` with explicit `OFFLINE` indicators when ARSY is unreachable.
- **Accessibility:** 100% operable via 2D fallback view without WebGL, colour perception, hover, or sound.
- **Design System:** Strictly consumes `@moonwitness/moonui` tokens and primitives. Zero rogue hardcoded hex.

## Commands

```bash
# Run local development server on port 3007
pnpm --filter @moonwitness/orbit dev

# Build production bundle
pnpm --filter @moonwitness/orbit build

# Run unit tests
pnpm --filter @moonwitness/orbit test

# Typecheck
pnpm --filter @moonwitness/orbit typecheck
```

## Environment contract

Only two server-side modules read configuration
(`src/lib/server/arsy-runtime-client.ts`, `src/lib/handoff/approval-handoff.ts`),
and the set of variables is closed — machine-checked by
`test/orbit-cross-app-boundaries.test.mjs`. ORBIT holds no credential of any kind.

| Variable | Consumed by | Behaviour |
| --- | --- | --- |
| `ARSY_API_URL` | shared `apiBaseUrl` resolver, reached only through `resolveHubEndpoint` | the single hub origin; unset falls back to the resolver's default |
| `RADIO_API_URL` | same shared resolver | legacy alias; a value that conflicts with `ARSY_API_URL` throws, and ORBIT fails to `OFFLINE` rather than picking a second hub |
| `ORBIT_SIMULATED` | runtime client, read directly | `true` renders fixtures as `SIMULATED_LOCAL`, never as live state |
| `NEXT_PUBLIC_HEADQUARTERS_URL` | approval-handoff resolver, read directly | unset uses the loopback 100CENTER origin from `@moonwitness/core`; malformed, non-HTTP or credential-bearing values are denied |

The review origin is resolved server-side and handed to the page as projection
data, so this variable is never inlined into client code. A denied origin
renders an unavailable review surface instead of a link.

## Deployment

ORBIT is registered once, in `scripts/apps.registry.mjs` (`tag: 'orbit'`, port
3007), alongside the other surfaces; the port is not re-declared per file. It
builds independently — `pnpm --filter @moonwitness/orbit build` — and is not a
service in the shared `docker-compose.yml` database path: it opens no SQL
connection, owns no table, and runs no migration. Removing or rolling back ORBIT
changes nothing in ARSY, 100CENTER or DOCK data.
