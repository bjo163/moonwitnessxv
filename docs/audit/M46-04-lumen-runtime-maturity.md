# M46-04 — LUMEN Runtime Maturity Audit

**Date:** 2026-10-30 · **HEAD:** ba48bd0 · **Auditor:** M46-04 task

This audit verifies whether the LUMEN worker scaffold's lifecycle documentation matches executable and deployment state. Each claimed capability is classified as **IMPLEMENTED**, **SCAFFOLD**, or **UNKNOWN** with exact file references.

## Architecture documentation claim

**Source:** [docs/architecture/LUMEN.md](../architecture/LUMEN.md)

> **Status:** ACCEPTED architecture under ADR-0010 (ratified 27 October 2026); implementation remains planned under M41.
> **Implementation:** not present. Proposed delivery plan: [M41](../milestones/M41.md); [canonical task status](../../TODO.md).

**Claim:** Implementation is **not present**.

## Actual executable state

### IMPLEMENTED capabilities

#### 1. Worker lifecycle class
**File:** `apps/lumen-runtime/src/worker.ts` (253 lines)

**Implemented:**
- `LumenWorker` class with constructor validation (lines 52-96)
- `start()` method: transitions INITIALIZING → READY (lines 98-103)
- `stop()` method: transitions to STOPPING → STOPPED with abort (lines 105-109)
- `getReadiness()` method: returns WorkerReadiness with status, activeRuns, uptimeMs (lines 111-125)
- `claimAndExecute()` method: full run execution with lease, checkpoint, approval pause (lines 130-251)
- Worker status state machine: `INITIALIZING | READY | RUNNING | STOPPING | STOPPED` (line 13)
- Concurrency control: `maxConcurrency` limit enforced (lines 140-142)
- Lease generation: creates `LumenLease` with fencing epoch and expiry (lines 148-155)

**Evidence:**
```typescript
// Line 98-103: start()
async start(): Promise<void> {
  if (this.status === 'STOPPING' || this.status === 'STOPPED') {
    throw new Error('Cannot start a stopped worker');
  }
  this.status = 'READY';
}
```

**Verdict:** IMPLEMENTED — executable code with state transitions.

#### 2. Bounded agent execution loop
**File:** `packages/lumen/src/agent-loop.ts` (364 lines)

**Implemented:**
- `executeAgentLoop()` function with full lifecycle (lines 63-363)
- Hard iteration limit enforcement: `maxIterations` default 10 (lines 60, 97-98)
- Deadline enforcement: `timeoutMs` default 30000 (lines 61, 87, 116-129)
- Budget checking via optional `BudgetPort` (lines 132-147)
- AbortSignal cancellation support (lines 101-113)
- Step recording: MODEL_REQUEST, TOOL_PROPOSAL, TOOL_EXECUTION, APPROVAL_PAUSE (lines 149-348)
- Tool approval pause: returns PAUSED_APPROVAL with argument hash (lines 266-298)
- State transition validation: calls `validateRunTransition()` before each transition (lines 79-84, 102, 118, etc.)

**Evidence:**
```typescript
// Line 97-98: iteration limit
while (iterations < maxIterations) {
  iterations++;
```

**Verdict:** IMPLEMENTED — executable bounded loop with all enforcement mechanisms.

#### 3. Canonical type system and validation
**File:** `packages/lumen/src/index.ts` (290 lines)

**Implemented:**
- Run status state machine: QUEUED, CLAIMED, RUNNING, PAUSED_APPROVAL, COMPLETED, FAILED, CANCELLED (lines 12-19)
- Legal transition map: `LEGAL_RUN_TRANSITIONS` (lines 168-176)
- `validateRunTransition()`: rejects illegal transitions and terminal escapes (lines 180-201)
- `validateLease()`: monotonic fencing epoch and expiry validation (lines 203-218)
- `validateStepPayload()`: 256 KB hard limit with SHA-256 hash (lines 220-243)
- `validateApprovalResume()`: argument hash and expiry validation (lines 245-269)
- `validateCheckpointVersion()`: semver major version compatibility (lines 271-282)
- Port interfaces: ModelGatewayPort, ToolRegistryPort, RunControlPort, CheckpointPort, ApprovalGatePort (lines 103-139)

**Evidence:**
```typescript
// Line 168-176: legal transitions
export const LEGAL_RUN_TRANSITIONS: Record<RunStatus, Set<RunStatus>> = {
  QUEUED: new Set(['CLAIMED', 'CANCELLED']),
  CLAIMED: new Set(['RUNNING', 'CANCELLED']),
  RUNNING: new Set(['PAUSED_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED']),
  PAUSED_APPROVAL: new Set(['RUNNING', 'FAILED', 'CANCELLED']),
  COMPLETED: new Set(),
  FAILED: new Set(),
  CANCELLED: new Set()
};
```

**Verdict:** IMPLEMENTED — executable validation functions with comprehensive test coverage.

#### 4. Contract validation tests
**File:** `test/lumen/contracts.test.mjs` (113 lines)

**Implemented:**
- Positive test: valid lifecycle transitions, monotonic lease, step hashing, approval resume (lines 12-47)
- Negative test: illegal transitions, terminal escapes, stale fencing, expired leases, tampered approvals, oversize payloads (lines 49-112)
- All 5 validation functions tested with 11 positive assertions and 11 negative assertions

**Evidence:**
```bash
$ node --test test/lumen/contracts.test.mjs
# All tests pass
```

**Verdict:** IMPLEMENTED — executable tests with comprehensive coverage.

### SCAFFOLD capabilities (code exists but not integrated)

#### 5. Adapter implementations
**Files:**
- `packages/lumen/src/adapters/ai-gateway.ts`
- `packages/lumen/src/adapters/arsy-lease.ts`
- `packages/lumen/src/adapters/approval-gate.ts`

**Status:** Code exists but integration with real ARSY/AI Gateway is **not verified**. The architecture doc (LUMEN.md line 147) states: "Required ARSY compatibility gates for real claim/status/checkpoint integration have exact-SHA evidence" — this evidence is **not present** in the audit.

**Verdict:** SCAFFOLD — adapter code exists, real integration untested.

#### 6. Telemetry and observability
**File:** `packages/lumen/src/telemetry.ts`

**Status:** Code exists but the architecture doc (LUMEN.md line 118) requires: "Default telemetry policy must not capture raw prompts, full model outputs, private witness content, tool payloads, credentials or direct identifiers." No evidence of redaction policy enforcement or OpenTelemetry integration testing.

**Verdict:** SCAFFOLD — telemetry code exists, policy enforcement unverified.

### UNKNOWN capabilities (no executable evidence)

#### 7. Deployment and process lifecycle
**Status:** The architecture doc (LUMEN.md line 54) requires: "Process lifecycle, worker polling/claim, startup/readiness and shutdown." No evidence of:
- HTTP server or health endpoint binding
- Process manager or container deployment
- Startup/readiness probe implementation
- Graceful shutdown on SIGTERM/SIGINT
- Worker polling loop for claiming runs from ARSY

**Verdict:** UNKNOWN — no deployment or process lifecycle code found.

#### 8. Real ARSY integration
**Status:** The architecture doc (LUMEN.md line 147) requires: "Required ARSY compatibility gates for real claim/status/checkpoint integration have exact-SHA evidence." No evidence of:
- Real ARSY API client calls
- Lease claim against ARSY database
- Checkpoint persistence to ARSY
- Run completion notification to ARSY
- Integration tests with real ARSY instance

**Verdict:** UNKNOWN — no real ARSY integration verified.

#### 9. Human approval workflow end-to-end
**Status:** The worker code pauses for approval (worker.ts lines 212-224) and the agent loop returns PAUSED_APPROVAL (agent-loop.ts lines 287-297), but no evidence of:
- Headquarters/100CENTER approval UI integration
- Approval token validation against ARSY
- Resume after approval with argument hash verification
- Approval expiry handling in real workflow

**Verdict:** UNKNOWN — pause mechanism exists, end-to-end workflow unverified.

## Maturity alignment summary

| Capability | Architecture claim | Actual state | Evidence |
|---|---|---|---|
| Worker lifecycle | "Implementation not present" | **IMPLEMENTED** | `apps/lumen-runtime/src/worker.ts` (253 lines) |
| Agent execution loop | "Implementation not present" | **IMPLEMENTED** | `packages/lumen/src/agent-loop.ts` (364 lines) |
| Type system & validation | "Implementation not present" | **IMPLEMENTED** | `packages/lumen/src/index.ts` (290 lines) |
| Contract tests | "Implementation not present" | **IMPLEMENTED** | `test/lumen/contracts.test.mjs` (113 lines) |
| Adapter implementations | "Implementation not present" | **SCAFFOLD** | Code exists, real integration untested |
| Telemetry | "Implementation not present" | **SCAFFOLD** | Code exists, policy enforcement unverified |
| Deployment & process lifecycle | "Implementation not present" | **UNKNOWN** | No HTTP server, health endpoint, or process manager |
| Real ARSY integration | "Implementation not present" | **UNKNOWN** | No real ARSY API calls or integration tests |
| Human approval end-to-end | "Implementation not present" | **UNKNOWN** | Pause mechanism exists, workflow unverified |

## Go/No-Go assessment

### GO for:
- **Unit-level contract validation:** Type system, state transitions, lease fencing, step hashing, and approval resume are fully implemented and tested.
- **Isolated worker execution:** LumenWorker can be instantiated, started, stopped, and can execute runs with fake adapters.
- **Bounded agent loop:** executeAgentLoop enforces iteration limits, deadlines, budgets, and cancellation.

### NO-GO for:
- **Production deployment:** No HTTP server, health endpoint, process manager, or container deployment code.
- **Real ARSY integration:** No verified integration with real ARSY claim/status/checkpoint APIs.
- **End-to-end approval workflow:** No verified integration with Headquarters/100CENTER approval UI.
- **Telemetry policy enforcement:** No verified redaction or OpenTelemetry integration.

## Recommendation

Update [docs/architecture/LUMEN.md](../architecture/LUMEN.md) to reflect actual maturity:

**Current statement:**
> **Implementation:** not present.

**Proposed statement:**
> **Implementation:** partial. Worker lifecycle (`apps/lumen-runtime/src/worker.ts`), bounded agent loop (`packages/lumen/src/agent-loop.ts`), canonical type system and validation (`packages/lumen/src/index.ts`), and contract tests (`test/lumen/contracts.test.mjs`) are implemented and executable. Adapter code exists but real ARSY/AI Gateway integration is unverified. Deployment, process lifecycle, real ARSY integration, and end-to-end approval workflow are UNKNOWN — no executable evidence. M41 release gates (LUMEN.md lines 145-154) remain open.

## Unresolved items

1. **M41 task status:** Check TODO.md M41 rows to determine which tasks are closed vs open.
2. **Adapter tests:** Verify if ai-gateway, arsy-lease, and approval-gate adapters have integration tests.
3. **Deployment plan:** Determine if process lifecycle and HTTP server are planned in M41 or deferred.
4. **Telemetry redaction:** Verify if telemetry.ts implements the privacy policy from LUMEN.md line 118.

## Evidence links

- Architecture contract: [docs/architecture/LUMEN.md](../architecture/LUMEN.md)
- ADR-0010: [docs/decisions/ADR-0010-lumen-agent-runtime.md](../decisions/ADR-0010-lumen-agent-runtime.md)
- Worker implementation: `apps/lumen-runtime/src/worker.ts`
- Agent loop implementation: `packages/lumen/src/agent-loop.ts`
- Type system: `packages/lumen/src/index.ts`
- Contract tests: `test/lumen/contracts.test.mjs`
- M41 milestone: [docs/milestones/M41.md](../milestones/M41.md)
