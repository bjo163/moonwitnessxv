# Multi-agent task lease contract (M29-02)

**Status:** Ratified by the repository owner in this conversation on 2026-10-27; implementation evidence and TODO status remain subject to exact-SHA review. It does not create a second TODO register. **Canonical task status:** [TODO.md](../../TODO.md). **Prerequisite:** M29-01.

## Purpose and authority

The contract prevents two workers from implementing the same deliverable, losing shared changes, or treating a partial task as complete. `TODO.md` remains the only status register. The human owner authorizes the overall goal; the integrator coordinates assignments and is the only person who changes TODO status after review. A worker may edit only its assigned leaf and declared files. No lease grants authority to deploy, publish, send external messages, expose private material, or bypass existing security, rights, consent, and architecture decisions.

## Claim record

Before work starts, the integrator records one claim in the active coordination channel with:

| Field | Required value |
| --- | --- |
| Task | One TODO task ID, classified `LEAF`; never an umbrella |
| Worker | Stable agent/worker name |
| Baseline | Current `dev` commit SHA and observed tree state |
| Dependencies | Each predecessor checked against TODO and its evidence |
| Scope | Expected paths (normally at most three) and one outcome |
| Acceptance | Positive and negative check, evidence location, rollback |
| Lease state | `CLAIMED`, `RELEASED`, `BLOCKED`, or `INTEGRATED` in coordination only; not a TODO task status |

Claims are exclusive by task ID and by overlapping write scope. A worker may hold only one active task claim. Parent/child conflicts are rejected using M29-01 classification. Read-only review can run concurrently if it is explicitly marked read-only and receives no write scope.

## Start, execution, and finish

1. Recheck `dev` HEAD immediately before starting; do not rely on a stale prompt SHA. Confirm all predecessors are complete under TODO's evidence rules. If the baseline changed, preserve the changes and re-evaluate scope before writing.
2. The integrator allocates a unique leaf and non-overlapping paths. Shared TODO, manifests, lockfiles, MoonUI/i18n catalogs, and ARSY runtime files require their designated owner or explicit integrator coordination.
3. The worker edits only declared paths, preserves unrelated staged, unstaged, and untracked changes, and reports any necessary scope expansion before touching additional shared files. Never reset, clean, force-push, or delete another worker's artifacts.
4. The worker returns exact commands and observed output, actual changed paths, baseline and resulting SHA (or explicitly `worktree-only` if not committed), tests, security/rights/privacy findings, reviewer request, rollback, limitations, and next eligible leaf. A passing test does not imply deployment or parent completion.
5. The integrator reviews the diff and evidence, resolves conflicts, and marks a TODO leaf only after its DoD passes at the integrated exact SHA. Only the integrator changes TODO. A task is released without completion when blocked, cancelled, or abandoned; its evidence and partial changes remain preserved.

## Conflict and recovery rules

- Duplicate task or overlapping write claims: reject the later claim until the first is released or scope is renegotiated.
- Unsatisfied dependency, unknown rights/consent, unclear source ownership, missing required external access, or an unavailable reviewer: mark the coordination claim `BLOCKED`, state the dependency, and do not invent a substitute result.
- Worker interruption or failure: integrator records the last observed baseline and changed paths, preserves the worktree, releases the claim only after confirming no process is still writing, then reassigns with the preserved state disclosed.
- Integration conflict: stop writes to the conflicted paths, retain both versions in recoverable form, and have the integrator resolve against the latest `dev` baseline. Do not silently select or discard another worker's work.
- Secrets, private witness material, or unapproved source content found in a diff: do not quote it in reports; stop and follow repository security guidance.

## Positive and negative acceptance

Positive: two independent, eligible leaf tasks with disjoint scopes may be assigned simultaneously and both reports identify their own baseline, files, and evidence. Negative: reject an umbrella claim, a duplicate task claim, a parent/child conflict, a task with an unverified predecessor, and a write outside the declared scope. Rejection must leave all files untouched and the existing claim recoverable.

## Rollback

Rollback is path- and task-scoped: revert only the reviewed task's changes from its recorded diff/patch, after checking no later work depends on them. Preserve unrelated changes and untracked files. If safe isolation cannot be demonstrated, stop and ask the integrator to resolve; never use a broad reset/clean as rollback.

## Limits

This document specifies coordination semantics; it is not an automated lock service, task dispatcher, Git branch policy, or permission system. TODO remains authoritative for task status and accepted architecture remains authoritative for product boundaries. Exact-SHA evidence and human review are still required.
