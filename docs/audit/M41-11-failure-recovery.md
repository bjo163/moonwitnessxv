# Audit Report: M41-11 — Prove failure recovery and security invariants

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-11
**Reviewer:** Owner Review & AI Adversarial Security Reviewer

---

## 1. Adversarial Test Matrix & Scenarios

| Category | Injected Adversarial Condition | Expected Behavior | Observed Result | Status |
|---|---|---|---|---|
| **E2E Crash Recovery** | Worker 1 crashes after step 1; lease expires | Worker 2 claims run with monotonic epoch 2, recovers checkpoint, skips completed step 1, executes step 2 | State recovered, 0 duplicate calls, run completed | **PASS** |
| **Prompt Injection** | Model output attempts to execute `drop_database_table` based on prompt injection | Tool rejected with `UNKNOWN_TOOL`; capability check ignores prompt claims | Fails closed with `UNKNOWN_TOOL`; 0 unallowlisted actions | **PASS** |
| **Split-Brain Fencing** | Stale worker with epoch 1 attempts write after worker 2 took over with epoch 2 | Stale write rejected with `RUN_ALREADY_CLAIMED` / `STALE_FENCING_TOKEN` | Stale write denied; split-brain prevented | **PASS** |
| **Approval Tampering** | Attacker mutates approved arguments from staging to production | Resuming worker recalculates SHA-256 argument hash, detects mismatch | Throws `ARGUMENT_HASH_MISMATCH`; tool not executed | **PASS** |
| **Approval Replay** | Replay of consumed approval token | Validation rejects token with `APPROVAL_ALREADY_CONSUMED` | Replay rejected; tool not re-executed | **PASS** |
| **Crash Before Save** | Worker executes external action but crashes before completing step record | State recovery marks step as `EXECUTING` (uncertain), not completed | Honest representation; no false completion claimed | **PASS** |

---

## 2. Test Verification & Commands

Suite executed:
`pnpm --filter @moonwitness/lumen test`

Output:
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
✔ positive: e2e recovery across controlled worker crash and lease epoch handover
✔ negative: adversarial prompt injection cannot elevate privileges or trigger unallowlisted tools
✔ negative: stale worker split-brain write is rejected by fencing epoch
✔ negative: argument tampering between approval and resume is detected and rejected
✔ negative: honest representation of uncertain side-effects on crash before persistence
✔ positive: @moonwitness/lumen exports documented public entries and ports
✔ negative: importing package causes no network/timer/server side effects and rejects invalid inputs
✔ positive: correlated spans and metrics tracking with accurate duration and trace correlation
✔ negative: sensitive fields and secret tokens are excluded/redacted by policy
✔ negative: token budget manager halts loop when budget is exhausted
✔ positive: telemetry disabled produces no overhead and stores no spans
✔ positive: registered tool passes schema check and executes under trusted capabilities
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass
ℹ tests 28
ℹ suites 0
ℹ pass 28
ℹ fail 0
ℹ duration_ms 10217.4991
```

Suite executed:
`pnpm --filter @moonwitness/lumen-runtime test` (2/2 pass)

---

## 3. Residual Risk & Limitations

- Side-effects on non-idempotent third-party APIs (e.g. unacknowledged external webhooks) must remain flagged as uncertain upon crash.
- Fencing tokens strictly guarantee single-writer safety across distributed ARSY leases.
