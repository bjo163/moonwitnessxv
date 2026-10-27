# Audit Report: M41-07 — Integrate versioned steps, checkpoints and ARSY leases

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-07
**Reviewer:** Owner Review & ARSY / LUMEN State Machine Reviewer

---

## 1. Summary of Changes

Implemented `ArsyLeaseAdapter` in `packages/lumen/src/adapters/arsy-lease.ts` implementing `RunControlPort` and `CheckpointPort` conforming to canonical LUMEN contracts ([LUMEN_CONTRACTS.md](../../docs/architecture/LUMEN_CONTRACTS.md)) and ARSY authority:
1. **Fencing Epoch Monotonicity:** Leases are monotonically checked on every write (`fencingEpoch`). Expired leases or claims with stale tokens are rejected with `STALE_FENCING_TOKEN` or `LEASE_EXPIRED`.
2. **Deterministic Step Recording & Replay:** Steps are persisted with monotonic indices, step IDs, and cryptographic SHA-256 payload hashes. Step payloads exceeding the 256 KB hard limit are rejected with `PAYLOAD_TOO_LARGE`.
3. **Semver Checkpoint Versioning:** Checkpoints enforce schema version compatibility (`validateCheckpointVersion`) to reject forward-incompatible major schema versions (`INCOMPATIBLE_CHECKPOINT_VERSION`).
4. **Execution State Recovery:** `recoverExecutionState()` restores checkpoint snapshot data and indexes completed step results, allowing the engine to resume from durable outcomes without repeating completed external actions.
5. **Worker Capacity Release on Approval Pause:** Pausing a run for human review releases the worker's active lease, requiring a new authorized claim with an incremented fencing epoch upon resume.
6. **No Direct Database Ownership:** Adheres to Monorepo boundary rules; LUMEN creates zero SQL tables and performs no direct database queries.

---

## 2. Prerequisite Gates & Baseline

- **M29 Completion:** Classified all tasks into 339 LEAF and 21 UMBRELLA tasks (`M29-01`), verified low-context handoff envelopes (`M29-05`).
- **M41-02:** Canonical Run, Step, and Event Contracts ratified.
- **M41-04:** Bounded single-agent execution loop verified.

---

## 3. Test Verification & Results

Suite executed:
`pnpm --filter @moonwitness/lumen test`

Results:
```
✔ positive: agent loop finishes directly when model returns final answer
✔ positive: agent loop executes allowlisted tool and continues to final completion
✔ negative: reject unknown tool proposed by model
✔ negative: stop when max iterations exhausted
✔ negative: stop with CANCELLED on AbortSignal
✔ negative: pause run when tool requires human approval
✔ positive: ai gateway adapter handles standard completion and structured tool calls
✔ positive: ai gateway adapter parses structured JSON tool proposal from content fallback
✔ negative: handles 401 unauthorized, 429 rate limit, and 503 unavailable with typed errors and redacted secrets
✔ negative: handles timeout, network error, and malformed json safely without silent fallback
✔ positive: redactSensitive correctly redacts Bearer, Gemini, Groq, and OpenRouter keys
✔ positive: fake-ARSY contract completes, pauses, resumes and recovers run using saved steps
✔ negative: rejects stale fencing token, expired lease, active claim conflict, and large payload
✔ positive: @moonwitness/lumen exports documented public entries and ports
✔ negative: importing package causes no network/timer/server side effects and rejects invalid inputs
✔ positive: registered tool passes schema check and executes under trusted capabilities
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ duration_ms 10358.4487
```

---

## 4. Limitations & Invariants

- Side effects without external idempotency key support must be represented honestly; no distributed exactly-once guarantee is falsely claimed.
- Worker leases are bounded by explicit deadlines; unrenewed leases expire deterministically to allow failover.
