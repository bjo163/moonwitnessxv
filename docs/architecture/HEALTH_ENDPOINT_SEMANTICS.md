# Health Endpoint Semantics Specification

**Date:** 2026-10-30 · **HEAD:** fec54ab · **Author:** M46-07 task

This document defines bounded semantics for liveness and readiness probes across MoonWitness XV services. It inventories existing implementations, proposes a standard schema, and identifies gaps.

## Purpose

Kubernetes and Docker Compose use two distinct probe types:
- **Liveness:** "Is the process alive?" — cheap, no dependency checks, failure triggers restart
- **Readiness:** "Can this instance serve traffic?" — probes dependencies, failure removes from load balancer

Conflating these causes cascading failures: a slow database marks the app "dead" and restarts it, even though the process is healthy and the DB is temporarily unreachable.

## Current inventory

| Service | Liveness route | Readiness route | Dependencies probed | Schema |
|---|---|---|---|---|
| **ARSY** | `GET /health` | `GET /health/ready` | DB (pg/mem) via `select 1` with 2s timeout | Custom (see below) |
| **SKYLINK** | `GET /health` | — | None | Minimal `{status, app, port}` |
| **ECHOLOG** | `GET /health` | `GET /health/ready` | Storage filesystem | Custom (see below) |
| **AIGateway** | `GET /health` | — | Provider statuses (non-blocking) | Extended `{status, service, port, providers}` |
| **Cockpit** | `GET /health` | — | None | Minimal `{status, app, port, timestamp}` |

### ARSY implementation (`apps/arsy/src/modules/health/index.ts`)

**Liveness** (`GET /health`):
```typescript
{
  status: 'ok',
  uptime: process.uptime(),
  channels: fastify.channels.list().length,
  timestamp: new Date().toISOString()
}
```
- No dependency probes
- Returns channel count (non-blocking, in-memory)
- Always 200 if process is running

**Readiness** (`GET /health/ready`):
```typescript
// Success (200)
{
  status: 'ready',
  engine: 'pg' | 'mem',
  timestamp: new Date().toISOString()
}

// Failure (503)
{
  status: 'not-ready',
  engine: 'pg' | 'mem',
  error: string,
  timestamp: new Date().toISOString()
}
```
- Probes database with `select 1` and 2s timeout
- Returns 503 if DB unreachable or timeout
- Error message included in failure response

### ECHOLOG implementation (`apps/echolog/src/server.ts`)

**Liveness** (`GET /health`):
```typescript
{
  status: 'ok',
  app: 'echolog',
  port: 3006
}
```

**Readiness** (`GET /health/ready`):
```typescript
{
  status: 'ready',
  app: 'echolog',
  storage: 'filesystem',
  port: 3006
}
```
- Probes storage filesystem accessibility
- Returns 503 if storage unavailable

## Proposed standard schema

### Liveness probe response (200 OK)

```typescript
{
  status: 'ok',
  service: string,        // e.g., 'arsy', 'skylink', 'echolog'
  uptime?: number,        // seconds since process start (optional)
  timestamp: string       // ISO 8601
}
```

**Semantics:**
- Always returns 200 if the process is running
- No dependency probes (database, storage, external APIs)
- Cheap: <10ms response time
- Failure triggers container restart
- Must not expose secrets or topology

### Readiness probe response (200 OK or 503 Service Unavailable)

**Success (200):**
```typescript
{
  status: 'ready',
  service: string,
  dependencies: {
    [name: string]: {
      status: 'up' | 'degraded',
      latencyMs?: number
    }
  },
  timestamp: string
}
```

**Failure (503):**
```typescript
{
  status: 'not-ready',
  service: string,
  dependencies: {
    [name: string]: {
      status: 'down',
      error: string,
      latencyMs?: number
    }
  },
  timestamp: string
}
```

**Semantics:**
- Probes all critical dependencies (database, storage, required external APIs)
- Returns 503 if any critical dependency is unavailable
- Dependency statuses included in response (bounded, no secrets)
- Timeout: 2s per dependency, 5s total
- Failure removes instance from load balancer, does not trigger restart
- Must not expose connection strings, credentials, or internal topology

## Gap analysis

| Service | Missing | Priority | Effort |
|---|---|---|---|
| **SKYLINK** | Readiness probe (`/health/ready`) | P1 | S (1-2 days) |
| **Cockpit** | Readiness probe (`/health/ready`) | P2 | S (1 day) |
| **AIGateway** | Readiness probe (`/health/ready`) | P2 | M (2-3 days) |
| **All services** | Standard schema alignment | P2 | M (3-5 days) |

### SKYLINK readiness requirements

SKYLINK depends on:
- PostgreSQL database (D18 schema)
- Provider sessions (WhatsApp/Telegram, external)

Readiness probe should:
1. Verify database connectivity with `select 1` on `skylink` schema
2. Optionally check provider session health (non-blocking, informational)
3. Return 503 if database unreachable

### Cockpit readiness requirements

Cockpit is a frontend-only service with no database. Readiness probe should:
1. Verify ARSY API connectivity (optional, depends on deployment model)
2. Always return 200 if process is running (Cockpit is stateless)
3. May be omitted if Cockpit is deployed as static assets

### AIGateway readiness requirements

AIGateway depends on:
- External model providers (OpenAI, Anthropic, etc.)

Readiness probe should:
1. Check provider availability (non-blocking, cached)
2. Return 200 if at least one provider is available
3. Return 503 if all providers are unreachable
4. Include provider statuses in response (already partially implemented)

## Security and privacy constraints

**Must NOT expose:**
- Database connection strings or credentials
- API keys or service tokens
- Internal hostnames or IP addresses
- File system paths beyond service name
- Provider session details (WhatsApp QR, Telegram bot tokens)

**Must include:**
- Service name (bounded vocabulary)
- Dependency status (up/down/degraded)
- Error messages (sanitized, no stack traces)
- Timestamp (ISO 8601)

## Testing requirements

Each service must have unit tests covering:
1. **Liveness happy path:** returns 200 with standard schema
2. **Readiness happy path:** all dependencies up, returns 200
3. **Readiness degraded:** one optional dependency down, returns 200 with degraded status
4. **Readiness failure:** critical dependency down, returns 503
5. **Timeout:** dependency probe exceeds 2s, returns 503 with timeout error
6. **No secrets:** response bodies do not contain credentials or connection strings

## Migration path

1. **Phase 1 (M46-07):** Document semantics and schema (this document)
2. **Phase 2:** Add missing readiness probes to SKYLINK, Cockpit, AIGateway
3. **Phase 3:** Align existing implementations to standard schema
4. **Phase 4:** Add integration tests for probe behavior under dependency failure

## Owner approval

**Services:**
- ARSY: existing implementation approved as reference
- SKYLINK: readiness probe required (P1)
- ECHOLOG: existing implementation approved
- AIGateway: readiness probe required (P2)
- Cockpit: readiness probe optional (P2, stateless frontend)

**Schema:**
- Proposed standard schema approved for Phase 3 migration
- Existing custom schemas tolerated until Phase 3

## Evidence links

- ARSY health module: `apps/arsy/src/modules/health/index.ts`
- ECHOLOG health routes: `apps/echolog/src/server.ts` (lines 39-70)
- SKYLINK health route: `apps/skylink/src/server.ts` (lines 76-80)
- AIGateway health route: `apps/aigateway/src/server.ts` (lines 31-40)
- Cockpit health route: `apps/cockpit/src/server.ts` (lines 211-216)

## Unresolved items

1. **Cockpit deployment model:** If deployed as static assets (no Node.js process), readiness probe is not applicable.
2. **AIGateway provider caching:** How long should provider status be cached? (Proposed: 30s TTL)
3. **SKYLINK provider session health:** Should WhatsApp/Telegram session status be included in readiness? (Proposed: no, keep it DB-only for v1)
4. **Schema migration timeline:** When should Phase 3 (standard schema alignment) be scheduled? (Proposed: after M46-07 closure)
