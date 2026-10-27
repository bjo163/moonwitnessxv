# M29-05 — Low-Context Agent Handoff Evidence

**Task:** M29-05 — Verify one low-context agent handoff
**Baseline:** `3c60a74212dcb5d62868b390b4ca662d312ab4f2`
**Worker:** root integrator; independent subagent served as a read-only low-context recipient
**Current status:** OPEN; evidence below diagnoses an invalid first handoff and a corrected read-only handoff. The artifacts have not been committed or independently reviewed at an integrated SHA.

## Positive and negative handoff evidence

The first isolated handoff was deliberately started without TODO or packet context. The worker invented a nonexistent `M29-06`. This is a negative result: it must not authorize work or advance the register. No repository files were changed by that attempt.

A corrected read-only handoff supplied the committed canonical register from `git show 6eddc101ef947cf857cede40d67d46dd668ca807:TODO.md`, the task packet and lease contract. The recipient correctly reported M29-05 as the final M29 leaf, confirmed M29-04 as its predecessor, and identified P0 M01-07 as the next priority candidate. It did not modify files. The recipient ran relevant suites in a shared dirty checkout, so those results alone are not exact-tree proof.

The root integrator reran the focused suites in the current dirty worktree after adding TODO existence checks, strict field types, exact-true security/rights flags, and safe repository-relative path validation:

```text
node --test test/planning/task-lease-contract-check.test.mjs test/planning/task-register-validator.test.mjs test/planning/task-register-invalid-fixtures.test.mjs test/planning/task-role-classification.test.mjs test/planning/agent-handoff.test.mjs
```

Observed: 14 tests, 14 passed, 0 failed, 0 skipped; scoped ESLint and `git diff --check` also passed after fixes. Because the checkout is dirty and includes untracked M29-01/M29-05 artifacts, this proves behavior in the current worktree only, not the committed tree. The M29-05-specific tests establish valid-envelope acceptance and rejection for malformed fields, incomplete envelope, umbrella task, unknown task/successor IDs, unsafe paths, scope breach, invalid SHA, false/non-boolean security and rights declarations, and unverified deployment claim.

## Scope and review findings

The artifacts currently claimed are `docs/planning/LOW_CONTEXT_AGENT_HANDOFF.md`, `scripts/planning/agent-handoff-validator.mjs`, `scripts/planning/task-lease-contract-check.mjs`, `test/planning/agent-handoff.test.mjs`, and this report. The lease harness now declares all five paths. Independent review initially identified TODO ID, strict rights/privacy, directional path-scope, rollback wording, and predecessor-verification gaps. The corrected worktree review found no remaining code/spec/test blockers; exact-SHA integration evidence is pending. The reviewer made no changes.

The initial draft incorrectly reported 13 handoff tests, described verifier behavior that the code did not enforce, claimed a next task without checking priority/dependencies, and marked the task closed. That draft is superseded by this diagnostic report. The validator now checks successor ID existence, but does not establish successor priority, open status, dependency eligibility, test truth, or SHA provenance; the receiver must verify these separately. M29-05 remains unchecked.

## Security, rights, rollback, and limits

No secrets, private witness material, source content, deployment access, or external service were used. The handoff validator is a local envelope checker, not an atomic coordination service; its schema checks declarations but cannot prove evidence truth, source rights, predecessor completion, or successor eligibility. The invalid-context attempt demonstrates that agents must be given the authoritative register and packet before interpreting task IDs.

Rollback is limited to the M29-05 paths after confirming no dependent work relies on them. Preserve all unrelated staged, unstaged, and untracked files. Do not reset or clean the shared checkout.

**Next priority candidate:** P0 M01-07; this report does not claim it is unblocked by M29-05. Exact integrated-tree evidence is still required before M29-05 can close.
