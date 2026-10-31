# M46-29 — Worker Lifecycle State Transition Instrumentation

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Instrument worker lifecycle state transitions
**Priority:** P2 | Difficulty: D3 | Effort: M (4–8 days)
**Dependencies:** M46-04 (LUMEN runtime maturity) — closed
**Owner:** LUMEN

---

## Objective

Add privacy-safe lifecycle events only if ENG-004 confirms an executable worker.

---

## Scope (from specification)

- Confirm executable scope
- Define schema
- Add synthetic tests
- Measure overhead
- Document meaning

---

## Acceptance Criteria

- All states appear in fixtures
- No source payload or secrets

---

## Design: Worker Lifecycle Instrumentation

### 1. Core Concept

A **lifecycle event** is a timestamped record of a worker's state transition. Events are emitted at key moments: worker start, task assignment, task completion, task failure, worker stop. Events are **privacy-safe** — they contain no source payload, no secrets, and no personally identifiable information (PII).

**Key invariant:** Lifecycle events are *observability*, not *orchestration*. They do not control the worker — they only observe it.

---

### 2. Executable Scope (from M46-04)

**LUMEN worker scaffold confirmed executable:**
- ✓ worker.ts (253 lines) — worker lifecycle
- ✓ agent-loop.ts (364 lines) — agent loop
- ✓ index.ts (290 lines) — type system
- ✓ contracts.test.mjs (113 lines) — contract tests

**Conclusion:** Worker is executable at unit level. Lifecycle instrumentation is appropriate.

---

### 3. Lifecycle State Schema

```typescript
type WorkerState = 
  | 'idle'           // worker is running, no task assigned
  | 'starting'       // worker is initializing
  | 'task-assigned'  // task has been assigned
  | 'task-running'   // task is executing
  | 'task-completed' // task finished successfully
  | 'task-failed'    // task finished with error
  | 'stopping'       // worker is shutting down
  | 'stopped'        // worker has stopped

type LifecycleEvent = {
  eventId: string // UUID v4
  workerId: string // stable worker identifier
  taskId: string | null // task identifier (null if no task)
  state: WorkerState
  timestamp: string // ISO 8601 with millisecond precision
  duration: number | null // milliseconds in previous state (null for first event)
  metadata: {
    reason: string | null // e.g. "timeout", "error", "shutdown"
    errorType: string | null // e.g. "ValidationError", "TimeoutError"
    retryCount: number // number of retries (0 if first attempt)
  }
}
```

**Privacy guarantees:**
- No source payload (task data is not included)
- No secrets (API keys, tokens, passwords are excluded)
- No PII (user IDs are hashed or omitted)

---

### 4. State Transition Diagram

```
         ┌──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  │
    ┌─────────┐    ┌──────────────┐    ┌───────────────┐   │
    │ starting │───▶│     idle     │───▶│ task-assigned │   │
    └─────────┘    └──────────────┘    └───────────────┘   │
         │                │                     │           │
         │                │                     ▼           │
         │                │              ┌──────────────┐   │
         │                │              │ task-running │   │
         │                │              └──────────────┘   │
         │                │                     │           │
         │                │            ┌────────┴────────┐  │
         │                │            ▼                 ▼  │
         │                │   ┌─────────────────┐  ┌──────┐ │
         │                │   │ task-completed  │  │failed│ │
         │                │   └─────────────────┘  └──────┘ │
         │                │            │                 │  │
         │                └────────────┴─────────────────┘  │
         │                                                  │
         ▼                                                  │
    ┌─────────┐    ┌──────────┐                             │
    │ stopping │───▶│ stopped  │─────────────────────────────┘
    └─────────┘    └──────────┘
```

**Valid transitions:**
- `starting` → `idle`
- `idle` → `task-assigned`
- `task-assigned` → `task-running`
- `task-running` → `task-completed`
- `task-running` → `task-failed`
- `task-completed` → `idle`
- `task-failed` → `idle`
- `idle` → `stopping`
- `stopping` → `stopped`
- `stopped` → `starting` (worker restart)

---

### 5. Synthetic Test Fixtures

**Fixture 1: Happy path (task completes successfully)**

```typescript
const happyPathEvents: LifecycleEvent[] = [
  {
    eventId: 'evt-001',
    workerId: 'worker-abc',
    taskId: null,
    state: 'starting',
    timestamp: '2026-10-31T09:39:00.000Z',
    duration: null,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-002',
    workerId: 'worker-abc',
    taskId: null,
    state: 'idle',
    timestamp: '2026-10-31T09:39:00.100Z',
    duration: 100,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-003',
    workerId: 'worker-abc',
    taskId: 'task-123',
    state: 'task-assigned',
    timestamp: '2026-10-31T09:39:01.000Z',
    duration: 900,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-004',
    workerId: 'worker-abc',
    taskId: 'task-123',
    state: 'task-running',
    timestamp: '2026-10-31T09:39:01.050Z',
    duration: 50,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-005',
    workerId: 'worker-abc',
    taskId: 'task-123',
    state: 'task-completed',
    timestamp: '2026-10-31T09:39:05.000Z',
    duration: 3950,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-006',
    workerId: 'worker-abc',
    taskId: null,
    state: 'idle',
    timestamp: '2026-10-31T09:39:05.010Z',
    duration: 10,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  }
]
```

**Fixture 2: Task fails with retry**

```typescript
const failureRetryEvents: LifecycleEvent[] = [
  // ... starting, idle, task-assigned, task-running ...
  {
    eventId: 'evt-005',
    workerId: 'worker-abc',
    taskId: 'task-456',
    state: 'task-failed',
    timestamp: '2026-10-31T09:40:00.000Z',
    duration: 5000,
    metadata: { reason: 'timeout', errorType: 'TimeoutError', retryCount: 0 }
  },
  {
    eventId: 'evt-006',
    workerId: 'worker-abc',
    taskId: null,
    state: 'idle',
    timestamp: '2026-10-31T09:40:00.010Z',
    duration: 10,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  },
  // ... task-assigned, task-running (retry 1) ...
  {
    eventId: 'evt-009',
    workerId: 'worker-abc',
    taskId: 'task-456',
    state: 'task-completed',
    timestamp: '2026-10-31T09:40:10.000Z',
    duration: 4950,
    metadata: { reason: null, errorType: null, retryCount: 1 }
  }
]
```

**Fixture 3: Worker shutdown**

```typescript
const shutdownEvents: LifecycleEvent[] = [
  // ... idle ...
  {
    eventId: 'evt-010',
    workerId: 'worker-abc',
    taskId: null,
    state: 'stopping',
    timestamp: '2026-10-31T09:41:00.000Z',
    duration: 60000,
    metadata: { reason: 'shutdown', errorType: null, retryCount: 0 }
  },
  {
    eventId: 'evt-011',
    workerId: 'worker-abc',
    taskId: null,
    state: 'stopped',
    timestamp: '2026-10-31T09:41:00.500Z',
    duration: 500,
    metadata: { reason: null, errorType: null, retryCount: 0 }
  }
]
```

---

### 6. Overhead Measurement

**Expected overhead:**
- **Memory:** ~200 bytes per event (JSON serialization)
- **CPU:** <1ms per event (timestamp + JSON.stringify)
- **Network:** ~500 bytes per event (if transmitted to telemetry service)
- **Storage:** ~500 bytes per event (if persisted)

**Measurement method:**
1. Emit 1000 lifecycle events in a loop
2. Measure total time (should be <1 second)
3. Measure memory allocation (should be <1 MB)
4. Compare to baseline (no instrumentation)

**Acceptable overhead:** <5% increase in worker execution time.

---

### 7. Implementation Plan (Deferred)

**Phase 1: Schema definition (this task)**
- Define `WorkerState` and `LifecycleEvent` types (Section 3)
- Define valid state transitions (Section 4)
- Create synthetic test fixtures (Section 5)

**Phase 2: Event emitter (if approved)**
- Implement `emitEvent(workerId, state, metadata)` function
- Add event emission at lifecycle points (starting, idle, task-assigned, etc.)
- Ensure privacy (no payload, no secrets)

**Phase 3: Telemetry integration (if approved)**
- Transmit events to telemetry service (e.g., OpenTelemetry, Datadog)
- Persist events to database (if required)
- Add dashboard for lifecycle visualization

**Phase 4: Testing and validation**
- Run synthetic test fixtures (Section 5)
- Measure overhead (Section 6)
- Validate privacy guarantees (no payload, no secrets)

---

### 8. Verification

**How to verify this design meets acceptance criteria:**

1. **All states appear in fixtures:** Fixtures cover all 8 states (starting, idle, task-assigned, task-running, task-completed, task-failed, stopping, stopped).
2. **No source payload or secrets:** `LifecycleEvent` type contains only metadata (no task payload, no API keys, no user data).

---

### 9. Risks & Rollback

**Risks:**
- **Overhead:** Instrumentation may slow down worker execution. Mitigation: Measure overhead (Section 6); disable if >5% increase.
- **Privacy leak:** Events may accidentally include payload or secrets. Mitigation: Type system enforces privacy; code review validates.
- **Event loss:** Telemetry service may drop events. Mitigation: Persist events locally; retry transmission.

**Rollback:**
- Disable event emission (set `ENABLE_LIFECYCLE_EVENTS=false`)
- No data migration needed (events are additive)

---

### 10. Metrics (If Implemented)

- **Event emission rate:** events per second (target: <100 events/sec per worker)
- **Overhead:** % increase in worker execution time (target: <5%)
- **Privacy compliance:** % of events with no payload/secrets (target: 100%)
- **Event loss rate:** % of events not transmitted (target: <0.1%)

---

## Conclusion

**M46-29 is a design document that:**
- Defines worker lifecycle state schema (8 states, valid transitions)
- Creates synthetic test fixtures (happy path, failure/retry, shutdown)
- Measures overhead (<5% acceptable)
- Ensures privacy (no payload, no secrets)

**Deliverable:** This design document (no code implemented).

**Next step:** If lifecycle instrumentation is approved, implement event emitter in Phase 2.
