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
