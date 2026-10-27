# LUMEN Canonical Run, Step and Event Contracts (M41-02)

**Status:** Canonical specification.  
**Canonical task register:** [TODO.md](../../TODO.md) · [M41 specification](../milestones/M41.md) · [ADR-0010](../decisions/ADR-0010-lumen-agent-runtime.md).  
**Prerequisites:** M41-01 (ratified ADR-0010), M29-02 (multi-agent lease contract), M29-05 (low-context handoff).

---

## 1. Domain Separation

LUMEN strictly isolates:
1. **Canonical Run State:** Authoritative state owned by ARSY (stored via approved task/run contracts).
2. **Step Outcomes & Checkpoints:** Fine-grained execution states held within the LUMEN worker during an active lease and checkpointed to ARSY.
3. **Trace Spans & Telemetry:** Ephemeral diagnostic signals emitted with unredacted prompt/secret protection.
4. **UI Projections:** Read-only projections consumable by ORBIT and Headquarters without write authority.

---

## 2. Run State Machine

### Valid Run Statuses
- `QUEUED`: Awaiting assignment or pickup by a worker.
- `CLAIMED`: Claimed under an active, fenced lease by an authorized worker.
- `RUNNING`: Actively progressing through execution steps.
- `PAUSED_APPROVAL`: Interrupted awaiting human decision at Headquarters/100CENTER for consequential side effects.
- `COMPLETED`: Terminal state; goal satisfied successfully.
- `FAILED`: Terminal state; unrecoverable failure, budget exhaustion, or fatal policy violation.
- `CANCELLED`: Terminal state; explicit cancellation requested by user or deadline expiration.

### Legal Transition Matrix
```
QUEUED ──► CLAIMED ──► RUNNING ──► COMPLETED (terminal)
               │          │   ▲
               │          ▼   │
               │   PAUSED_APPROVAL
               ▼          ▼
             CANCELLED  FAILED / CANCELLED (terminal)
```

**Terminal Invariant:** Once in `COMPLETED`, `FAILED`, or `CANCELLED`, no further state transitions are permitted.

---

## 3. Fenced Lease & Concurrency Contracts

To prevent split-brain execution and stale writes across restarts:
- **`fencingEpoch`:** A strictly monotonic integer incremented whenever a lease is granted or renewed.
- **Stale Writer Rejection:** Any checkpoint write, step outcome, or state transition submitted with a `fencingEpoch` strictly less than the currently recorded epoch is rejected with `STALE_FENCING_EPOCH`.
- **Lease Expiry:** If current time exceeds `leaseExpiresAt`, the worker is considered untrusted and all mutations are rejected with `LEASE_EXPIRED`.
- **Heartbeat Requirement:** Active workers must renew their lease before half of the lease TTL elapses.

---

## 4. Step Contracts & Idempotency

- **`stepId`:** Stable deterministic string format `step_<index>_<runId>`.
- **Step Types:**
  - `MODEL_REQUEST`: Invoking model inference via AI Gateway port.
  - `TOOL_PROPOSAL`: Validating tool calls proposed by the model against the registry schema.
  - `TOOL_EXECUTION`: Executing an allowlisted, schema-validated tool.
  - `APPROVAL_PAUSE`: Pausing execution for consequential actions.
  - `CHECKPOINT`: Persisting step outcome and context state.
- **Payload Limits:** Maximum payload per step is **256 KB**. Payloads exceeding this threshold are rejected with `PAYLOAD_SIZE_EXCEEDED` to preserve bounded memory.
- **At-Least-Once Delivery & Idempotency:** LUMEN guarantees at-least-once delivery of step intents. Side-effecting tools MUST be idempotent or explicitly classify uncertain outcomes. Exactly-once execution against arbitrary third-party APIs is mathematically impossible and explicitly not promised.

---

## 5. Human Approval Interruption & Binding

When a tool call is classified as `REQUIRES_HUMAN_APPROVAL`:
1. The execution loop halts immediately.
2. The run transitions to `PAUSED_APPROVAL`.
3. An approval token is generated with a cryptographic SHA-256 `argumentHash` of the exact tool inputs.
4. When resumed, Headquarters provides the signed decision. If the proposed arguments differ by even a single bit from the `argumentHash`, execution is rejected with `APPROVAL_TAMPERED`.
5. If `approvalExpiresAt < now`, execution is rejected with `APPROVAL_EXPIRED`.
