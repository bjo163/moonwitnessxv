# Audit Report: M41-08 — Implement human-approval pause and resume

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-08
**Reviewer:** Owner Review & Headquarters/100CENTER Security Reviewer

---

## 1. Summary of Changes

Implemented `ApprovalGateAdapter` in `packages/lumen/src/adapters/approval-gate.ts` satisfying LUMEN's `ApprovalGatePort`:
1. **Cryptographic Argument Binding:** Tool execution arguments are serialized and bound via SHA-256 (`argumentHash`). Any modification between approval and resume causes immediate rejection with `ARGUMENT_HASH_MISMATCH`.
2. **Deterministic Anti-Replay Guard:** Once validated and executed, an approval token is marked `consumed: true` with a timestamp; re-use attempts are rejected with `APPROVAL_ALREADY_CONSUMED`.
3. **Self-Approval Prohibition:** Agents, models, automated worker IDs, and prompt texts are forbidden from approving restricted actions (`SELF_APPROVAL_PROHIBITED`). Only authorized human operators from Headquarters/100CENTER can submit approval decisions.
4. **Role & Authority Enforcement:** Rejects decisions submitted by actors without the required role (e.g. `GUEST_VIEWER` attempting to approve actions requiring `100CENTER_OPERATOR`).
5. **Expiration Enforcement:** Enforces strict TTL deadlines. Tokens past `expiresAt` automatically transition to `EXPIRED`.
6. **Correlated Audit Logging:** Binds `runId`, `toolName`, `toolVersion`, `requiredRole`, `decidedBy`, and `decidedAt` in the immutable approval record.

---

## 2. Prerequisite Gates & Baseline

- **M41-05:** Typed Tool Registry and Policy Enforcement verified.
- **M41-07:** Versioned steps, checkpoints and ARSY lease fencing verified.
- **M20 / M37:** Headquarters/100CENTER role boundaries preserved without making LUMEN an identity provider or SQL database.

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
✔ positive: registered tool passes schema check and executes under trusted capabilities
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ duration_ms 10290.7734
```

---

## 4. Security Invariants Preserved

- The execution loop halts immediately when a restricted tool is requested, releasing worker capacity.
- Model text like "approved" or automated worker claims cannot trigger approval bypass.
- Tampered arguments or expired tokens never execute tools.
