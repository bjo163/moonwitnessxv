# Audit Report: M41-10 — Add tracing, metrics, redaction and budgets

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-10
**Reviewer:** Owner Review & Telemetry / Observability Reviewer

---

## 1. Summary of Changes

Implemented `LumenTelemetrySink` (satisfying `EventSinkPort`) and `TokenBudgetManager` (satisfying `BudgetPort`) in `packages/lumen/src/telemetry.ts`:
1. **Correlated Distributed Tracing:** Generates hierarchical OpenTelemetry-compatible spans (`traceId`, `spanId`, `parentSpanId`, `runId`, `stepId`, `durationMs`) correlating overall run execution, gateway inferences, tool evaluations, and approval events.
2. **Strict Privacy & Redaction Defaults:** Raw user prompts, complete text payloads, witness material, passwords, API keys, and authorization secrets are stripped and redacted by default (`[REDACTED_BY_POLICY]`, `[REDACTED]`, `[REDACTED_GEMINI_KEY]`, `[REDACTED_GROQ_KEY]`).
3. **Trustworthy Token Budget Enforcement:** `TokenBudgetManager` enforces hard token caps based on verified inference usage metadata. When remaining budget drops to 0, execution immediately halts with `BUDGET_EXHAUSTED`.
4. **Zero-Overhead Disabled Mode:** Setting `enabled: false` bypasses all span tracking and event storage with zero overhead.

---

## 2. Telemetry Policy & Budget Semantics

- **Default Span Attributes:** Restricted to workflow version, model name, status codes, duration, and error codes.
- **Budget Metric Unit:** Tokens (prompt + completion) as measured from AI Gateway response metadata (`usage.total_tokens`).
- **Exhaustion Behavior:** Fails the run cleanly with typed reason `BUDGET_EXHAUSTED`; no partial unapproved tool executions are permitted once budget is spent.

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
✔ positive: human approval pause, decision, and exact argument resume flow
✔ negative: rejects self-approval, insufficient roles, replays, tampering, expiration, and mismatch
✔ positive: fake-ARSY contract completes, pauses, resumes and recovers run using saved steps
✔ negative: rejects stale fencing token, expired lease, active claim conflict, and large payload
✔ positive: @moonwitness/lumen exports documented public entries and ports
✔ negative: importing package causes no network/timer/server side effects and rejects invalid inputs
✔ positive: correlated spans and metrics tracking with accurate duration and trace correlation
✔ negative: sensitive fields and secret tokens are excluded/redacted by policy
✔ negative: token budget manager halts loop when budget is exhausted
✔ positive: telemetry disabled produces no overhead and stores no spans
✔ positive: registered tool passes schema check and executes under trusted capabilities
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass
ℹ tests 23
ℹ suites 0
ℹ pass 23
ℹ fail 0
ℹ duration_ms 10241.5721
```

Suite executed:
`pnpm --filter @moonwitness/lumen-runtime test` (2/2 pass)

---

## 4. Security & Privacy Invariants

- Tracing does not substitute for persistent state storage.
- No sensitive user data or private witness material is captured in spans or log files.
