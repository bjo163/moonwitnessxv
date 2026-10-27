# M29-02 — Multi-agent task lease contract evidence

**Task:** M29-02 — Ratify one multi-agent task lease contract\
**Baseline SHA:** `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`\
**Worker:** Root integrator\
**Status:** Owner ratified the proposal in this conversation on 2026-10-27. Artifacts remain worktree-only until exact-SHA integration review; TODO remains open pending that evidence.

## Scope and artifacts

- `docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md` specifies leaf-only exclusive claims, dependency checks, worker/baseline/path scope, shared-file ownership, safe release/recovery, exact-SHA reporting, integrator-only TODO status updates, conflict handling and scoped rollback.
- `scripts/planning/task-lease-contract-check.mjs` is a small local acceptance harness. It is intentionally not an automated global lock service or alternate status register.
- `test/planning/task-lease-contract-check.test.mjs` checks eligible claims, independent disjoint scopes, umbrella and duplicate rejection, unmet dependencies, one active claim per worker, and out-of-scope writes.

## Commands and observed results

- `node --test test/planning/task-lease-contract-check.test.mjs` — 3 passed, 0 failed.
- `node --test test/planning/task-role-classification.test.mjs` — 2 passed, 0 failed; rechecked all 360 TODO IDs and umbrella/leaf claim rules.
- `git diff --check -- docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md scripts/planning/task-lease-contract-check.mjs test/planning/task-lease-contract-check.test.mjs` — no whitespace errors.
- `git rev-parse HEAD` — `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; changes remain uncommitted, so this is the baseline SHA, not an integrated result SHA.

## Acceptance and security review

Positive: a leaf with an explicitly completed predecessor receives a claim containing worker, baseline, exclusive paths and `CLAIMED`; two eligible workers with distinct task paths can claim concurrently.

Negative: umbrella and duplicate task claims, missing predecessor evidence, reuse of a worker with an active claim, and a reported path outside the declared scope are rejected. Rejection happens before modifying repo files.

No secrets, private witness data, new domain owner, app API, task-status register or deployment behavior is introduced. Contract keeps existing security, rights, consent and architecture decisions controlling.

## Review, rollback, and limits

The integrator inspected the proposal, harness, and focused tests. Owner ratification is recorded above; exact-SHA integration review is still required and no TODO box was changed yet. Roll back only the three listed task artifacts from their diff after confirming no dependent task used them; preserve unrelated worktree changes. The harness is an executable acceptance fixture, not atomic cross-process locking and must not be presented as a production lock system.

**Next eligible task after M29-02 is ratified/integrated:** M29-03. It is not claimed or started here.
