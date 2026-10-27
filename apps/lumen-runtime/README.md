# @moonwitness/lumen-runtime

> Dedicated internal worker process for MoonWitness XV LUMEN runs.

## Overview

`@moonwitness/lumen-runtime` is an internal background worker process located at `apps/lumen-runtime`. It continuously polls or claims queued agent task runs from ARSY, acquires monotonic fenced leases, executes the single-agent bounded loop from `@moonwitness/lumen`, persists checkpoints, enforces approval pauses, and terminates gracefully.

### Key Operational Characteristics

- **Internal Worker Only:** Exposes NO public HTTP ports, NO task creation API, and NO public management endpoints.
- **Monotonic Leases:** All work is claimed under fenced leases (`fencingEpoch`). Stale workers cannot write canonical state.
- **Internal Readiness:** Programmatic inspection via `worker.getReadiness()` provides status (`INITIALIZING`, `READY`, `RUNNING`, `STOPPING`, `STOPPED`), worker ID, concurrency count, and uptime.
- **Bounded Concurrency:** Concurrency is strictly bounded (`maxConcurrency: 1` by default) to prevent runaway memory usage or thread starvation.
- **Graceful Termination:** Responds to `SIGINT` and `SIGTERM` by aborting active cooperative loops via `AbortSignal`, finalizing state, and releasing capacity cleanly.

---

## Commands

```bash
# Build TypeScript
pnpm --filter @moonwitness/lumen-runtime build

# Run unit & lifecycle test suite
pnpm --filter @moonwitness/lumen-runtime test

# Typecheck
pnpm --filter @moonwitness/lumen-runtime typecheck

# Start worker process
pnpm --filter @moonwitness/lumen-runtime start
```

---

## Architecture Boundaries

Under accepted [ADR-0010](../../docs/decisions/ADR-0010-lumen-agent-runtime.md):
- `apps/lumen-runtime` is NOT a second Hub.
- It does NOT connect to PostgreSQL directly; all state and lease management are performed via ARSY RPC/HTTP contracts.
- It does NOT connect directly to third-party model providers; inference routes through `apps/aigateway`.
