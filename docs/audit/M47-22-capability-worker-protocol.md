# M47-22 — Capability-Based Worker Protocol Evaluation

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Evaluate a capability-based worker protocol
**Priority:** P2 | Difficulty: D4 | Effort: L (5–10 days)
**Dependencies:** M46-04 (LUMEN runtime maturity) — closed
**Owner:** LUMEN

---

## Objective

Study whether a narrow worker capability format can describe an authorized task without creating a new orchestrator.

---

## Scope (from specification)

- Reconcile worker status
- List job needs
- Model capabilities
- Test cancellation
- Document fit/no-fit

---

## Acceptance Criteria

- Each task declares scope, resource cap, timeout and cancel behavior
- No implicit authority

---

## Design: Capability-Based Worker Protocol

### 1. Core Concept

A **capability** is a signed, time-limited token that grants a worker permission to perform a specific action. The capability format is narrow: it declares *what* the worker can do, *how long* it can do it, and *what resources* it can consume. The worker cannot exceed the capability's scope.

**Key invariant:** The capability is *declarative*, not *imperative*. It does not orchestrate the worker — it only authorizes it. The worker remains responsible for executing the task within the capability's bounds.

---

### 2. Current Worker Status (from M46-04)

**LUMEN worker scaffold:**
- **IMPLEMENTED:** worker lifecycle (worker.ts 253 lines), agent loop (agent-loop.ts 364 lines), type system (index.ts 290 lines), contract tests (contracts.test.mjs 113 lines)
- **SCAFFOLD:** adapters, telemetry (code exists but unverified)
- **UNKNOWN:** deployment, real ARSY integration, end-to-end approval (no executable evidence)

**Current task model:**
```typescript
type WorkerTask = {
  id: string
  type: string // e.g. "process-corpus-import"
  payload: unknown // task-specific data
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}
```

**Gap:** The current model has no capability field. Workers are trusted to perform any action implied by the task type. There is no explicit authorization, no resource cap, no timeout.

---

### 3. Job Needs

**What does a worker need to perform a task?**

| Need | Example | Current Model | Capability Model |
|------|---------|---------------|------------------|
| **Scope** | "Read corpus_passages:QS-2-82" | Implicit in task type | Explicit in capability |
| **Resource cap** | "Max 10 MB memory, 5 seconds CPU" | None | Explicit in capability |
| **Timeout** | "Cancel after 30 seconds" | None | Explicit in capability |
| **Cancel behavior** | "Abort and rollback" | None | Explicit in capability |
| **Authority** | "Signed by admin" | Implicit (worker is trusted) | Explicit (capability is signed) |

---

### 4. Capability Schema

```typescript
type Capability = {
  id: string // stable across task retries
  taskId: string // → WorkerTask.id
  scope: Scope // what the worker can do
  resources: ResourceCap // how much the worker can consume
  timeout: number // milliseconds
  cancelBehavior: 'abort' | 'rollback' | 'complete-current-step'
  issuedBy: string // admin user ID or system
  issuedAt: string // ISO 8601
  expiresAt: string // ISO 8601
  signature: string // HMAC-SHA256(capability, secret)
}

type Scope = {
  actions: string[] // e.g. ['corpus.read', 'corpus.write']
  targets: string[] // e.g. ['corpus_passages:QS-2-82']
  conditions: Condition[] // e.g. [{ field: 'rightsStatus', op: 'eq', value: 'RIGHTS_EXACT_VERSION_CLEARED' }]
}

type ResourceCap = {
  memoryMB: number // e.g. 10
  cpuSeconds: number // e.g. 5
  networkBytes: number // e.g. 1048576 (1 MB)
  diskBytes: number // e.g. 10485760 (10 MB)
}

type Condition = {
  field: string
  op: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'notin'
  value: unknown
}
```

**Example capability:**
```json
{
  "id": "cap-001",
  "taskId": "task-123",
  "scope": {
    "actions": ["corpus.read"],
    "targets": ["corpus_passages:QS-2-82"],
    "conditions": [
      { "field": "rightsStatus", "op": "eq", "value": "RIGHTS_EXACT_VERSION_CLEARED" }
    ]
  },
  "resources": {
    "memoryMB": 10,
    "cpuSeconds": 5,
    "networkBytes": 1048576,
    "diskBytes": 10485760
  },
  "timeout": 30000,
  "cancelBehavior": "abort",
  "issuedBy": "admin:001",
  "issuedAt": "2026-10-31T09:35:00.000Z",
  "expiresAt": "2026-10-31T09:35:30.000Z",
  "signature": "a1b2c3d4e5f6..."
}
```

---

### 5. Integration with Current Worker Model

**Proposed change to WorkerTask:**
```typescript
type WorkerTask = {
  id: string
  type: string
  payload: unknown
  capabilityId: string // → Capability.id (NEW)
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}
```

**Worker execution flow:**
1. Worker receives task with `capabilityId`
2. Worker fetches capability from `capabilities` table
3. Worker validates capability signature (HMAC-SHA256)
4. Worker checks capability expiration (`expiresAt > now`)
5. Worker executes task within capability scope
6. Worker monitors resource usage (memory, CPU, network, disk)
7. If timeout exceeded → cancel per `cancelBehavior`
8. If resource cap exceeded → cancel per `cancelBehavior`
9. If action not in scope → deny and log

---

### 6. Cancellation Test

**Scenario:** Worker exceeds timeout

**Setup:**
- Task: "Process corpus import" (expected duration: 10 seconds)
- Capability timeout: 5 seconds
- Capability cancelBehavior: "abort"

**Expected behavior:**
1. Worker starts task at T=0
2. Worker monitors elapsed time
3. At T=5, worker detects timeout exceeded
4. Worker aborts task (no rollback, no partial completion)
5. Worker updates task status to "cancelled"
6. Worker logs cancellation reason: "timeout exceeded"

**Test fixture:**
```typescript
const task: WorkerTask = {
  id: 'task-001',
  type: 'process-corpus-import',
  payload: { editionCode: 'quran_cairo_hafs' },
  capabilityId: 'cap-001',
  status: 'pending',
  createdAt: '2026-10-31T09:35:00.000Z',
  updatedAt: '2026-10-31T09:35:00.000Z'
}

const capability: Capability = {
  id: 'cap-001',
  taskId: 'task-001',
  scope: {
    actions: ['corpus.read', 'corpus.write'],
    targets: ['corpus_editions:quran_cairo_hafs'],
    conditions: []
  },
  resources: {
    memoryMB: 10,
    cpuSeconds: 5,
    networkBytes: 1048576,
    diskBytes: 10485760
  },
  timeout: 5000, // 5 seconds
  cancelBehavior: 'abort',
  issuedBy: 'admin:001',
  issuedAt: '2026-10-31T09:35:00.000Z',
  expiresAt: '2026-10-31T09:35:05.000Z',
  signature: 'a1b2c3d4e5f6...'
}

// Worker starts at T=0
// At T=5, timeout exceeded → abort
// Task status: 'cancelled'
// Log: "Task task-001 cancelled: timeout exceeded"
```

---

### 7. Fit Assessment

**Does the capability model fit the current LUMEN worker scaffold?**

| Aspect | Fit? | Rationale |
|--------|------|-----------|
| **Worker lifecycle** | ✓ Yes | Worker already has start/stop; capability adds authorization layer |
| **Agent loop** | ✓ Yes | Agent loop can validate capability before each action |
| **Type system** | ✓ Yes | Capability schema extends existing type system |
| **Contract tests** | ✓ Yes | New tests for capability validation, timeout, cancellation |
| **Adapters** | ⚠ Partial | Adapters need to fetch capability from external store |
| **Telemetry** | ⚠ Partial | Telemetry needs to log capability usage and violations |
| **Deployment** | ✗ No | Deployment model unknown; capability signing requires secret management |
| **ARSY integration** | ✗ No | ARSY integration unknown; capability scope may conflict with ARSY actions |

**Overall fit:** PARTIAL. The capability model fits the implemented parts of LUMEN (lifecycle, agent loop, type system, tests) but requires clarification on scaffold/unknown parts (adapters, telemetry, deployment, ARSY integration).

---

### 8. No-Fit Assessment

**What does NOT fit?**

1. **Implicit authority:** The current model trusts workers implicitly. The capability model requires explicit authorization. This is a cultural shift, not a technical one.
2. **Resource monitoring:** The current model does not monitor resource usage. The capability model requires memory, CPU, network, and disk monitoring. This is a new subsystem.
3. **Cancellation:** The current model does not support cancellation. The capability model requires abort, rollback, and complete-current-step behaviors. This is a new state machine.
4. **Secret management:** The capability model requires HMAC-SHA256 signing. This requires a secret management system (e.g., environment variable, vault). This is new infrastructure.

---

### 9. Recommendation

**Decision:** FIT (with deferred items)

**Rationale:**
1. **Capability model aligns with LUMEN's implemented parts.** Worker lifecycle, agent loop, type system, and contract tests can adopt capabilities without major refactoring.
2. **Capability model closes the authorization gap.** The current model's implicit authority is a security risk. Capabilities make authorization explicit.
3. **Capability model enables resource governance.** Resource caps and timeouts prevent runaway workers.
4. **Deferred items are scaffold/unknown.** Adapters, telemetry, deployment, and ARSY integration are not yet implemented. Capability adoption can proceed in parallel.

**Implementation plan (deferred):**
1. Define `Capability` schema (this document, Section 4)
2. Add `capabilityId` to `WorkerTask` (Section 5)
3. Implement capability validation in agent loop (Section 5, step 3)
4. Implement resource monitoring (new subsystem)
5. Implement cancellation state machine (new subsystem)
6. Add contract tests for capability validation, timeout, cancellation
7. Document secret management for capability signing

**Risks:**
- **Complexity:** Capability model adds complexity to worker execution. Mitigation: Start with narrow scope (e.g., corpus.read only), expand gradually.
- **Performance:** Resource monitoring adds overhead. Mitigation: Sample resource usage (e.g., every 100ms), not continuous.
- **Secret management:** Capability signing requires secret management. Mitigation: Use environment variable for development; vault for production.

---

### 10. Metrics (If Implemented)

- **Capability adoption:** % of tasks with capabilities (target: 100%)
- **Authorization violations:** % of tasks denied due to scope violation (target: <1%)
- **Timeout cancellations:** % of tasks cancelled due to timeout (target: <5%)
- **Resource cap violations:** % of tasks cancelled due to resource cap (target: <5%)
- **Secret rotation:** days since last capability signing secret rotation (target: <90 days)

---

## Conclusion

**M47-22 is a design document that:**
- Defines a narrow capability format (scope, resources, timeout, cancel behavior)
- Maps capability schema to existing LUMEN worker scaffold
- Tests cancellation via timeout scenario
- Assesses fit (PARTIAL) and no-fit (implicit authority, resource monitoring, cancellation, secret management)
- Recommends FIT with deferred items

**Deliverable:** This design document (no code implemented).

**Next step:** If capability model is approved, implement in Phase 2 starting with narrow scope (corpus.read only).
