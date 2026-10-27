# M29-02 — Multi-agent task lease contract evidence

**Task:** M29-02 — Ratify one multi-agent task lease contract\
**Baseline SHA:** `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`\
**Worker:** Root integrator\
**Result SHA:** `8c2e2198a46f9b1c9c66b802241b3def9e8e0358`\
**Status:** Owner ratified 2026-10-27; committed and independently reviewed. Focused tests passed after the commit. **Next eligible:** M29-03.

## Scope and artifacts

- `docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md` specifies leaf-only exclusive claims, dependency checks, worker/baseline/path scope, shared-file ownership, safe release/recovery, exact-SHA reporting, integrator-only TODO status updates, conflict handling and scoped rollback.
- `scripts/planning/task-lease-contract-check.mjs` is a small local acceptance harness. It is intentionally not an automated global lock service or alternate status register.
- `test/planning/task-lease-contract-check.test.mjs` checks eligible claims, independent disjoint scopes, umbrella and duplicate rejection, unmet dependencies, one active claim per worker, and out-of-scope writes.

## Commands and observed results

- `node --test test/planning/task-lease-contract-check.test.mjs` — 3 passed, 0 failed.
- `node --test test/planning/task-role-classification.test.mjs` — 2 passed, 0 failed; rechecked all 360 TODO IDs and umbrella/leaf claim rules.
- `git diff --check -- docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md scripts/planning/task-lease-contract-check.mjs test/planning/task-lease-contract-check.test.mjs` — no whitespace errors.
- `git rev-parse HEAD` after commit — `8c2e2198a46f9b1c9c66b802241b3def9e8e0358`.
- Post-commit reruns at the result SHA: `node --test test/planning/task-lease-contract-check.test.mjs` — 3 passed, 0 failed; `node --test test/planning/task-role-classification.test.mjs` — 2 passed, 0 failed; `git show --check --oneline HEAD` — no whitespace errors.

## Acceptance and security review

Positive: a leaf with an explicitly completed predecessor receives a claim containing worker, baseline, exclusive paths and `CLAIMED`; two eligible workers with distinct task paths can claim concurrently.

Negative: umbrella and duplicate task claims, missing predecessor evidence, reuse of a worker with an active claim, and a reported path outside the declared scope are rejected. Rejection happens before modifying repo files.

No secrets, private witness data, new domain owner, app API, task-status register or deployment behavior is introduced. Contract keeps existing security, rights, consent and architecture decisions controlling.

## Review, rollback, and limits

The integrator inspected the proposal, harness, and focused tests. An independent read-only reviewer inspected commit `8c2e219` and found no blocker; the owner ratified the contract in this conversation. Roll back only the four task files in commit `8c2e219` after confirming no dependent task used them; preserve unrelated worktree changes. The harness is an executable acceptance fixture, not atomic cross-process locking and must not be presented as a production lock system.

**TODO status:** Evidence verified at source SHA `ab4409393dba448b5678bdb0f1ecb457a70c1672`; M29-02 closure is recorded in the current TODO update. M29-03 is eligible after this status update is integrated.

## Integrated exact-SHA revalidation

At `ab4409393dba448b5678bdb0f1ecb457a70c1672`, with M29-01 checked in the authoritative TODO:

- `node --test test/planning/task-lease-contract-check.test.mjs test/planning/task-role-classification.test.mjs` — 6 passed, 0 failed, 0 skipped.
- `pnpm exec eslint scripts/planning/task-lease-contract-check.mjs test/planning/task-lease-contract-check.test.mjs` — exit 0.
- Scoped `git diff --check` — no whitespace errors.
- The path table now names the actual M29-02 harness/spec/test/audit, M29-03 spec/validator/test/audit, and M29-04 fixture test/directory/audit. Tests assert exact path lists, verify M29-03 and M29-04 scopes do not overlap, and retain negative checks for duplicate claims, missing dependencies, and out-of-scope writes.
- Independent reviewer confirmed path accuracy and lease lifecycle semantics at the committed change; reviewer did not run tests.

No distributed lock service, network behavior, secret, deployment, or new status register was added. Roll back only the M29-02 contract harness and focused test change in commit `f32da87484ac78a92735121823a1b7b21cad47d0`; preserve all unrelated edits.
