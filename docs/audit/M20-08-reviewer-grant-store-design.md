# M20-08 — D12 reviewer-grant store design audit

**Closure status: design artifact complete at exact SHA `3f8062ebe56f51a46e0f74b3b20e8b6a1cfefdcb`; design-only, not implemented.** This audit records the evidence for closing the M20-08 design leaf. It does not claim a store, loader, schema, route or grant exists.

## Task and authorization

- Task: [M20-08](../tasks/M20/M20-08.md) — design the D12 reviewer-grant store contract.
- Policy authority: [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md), accepted by the owner on 29 October 2026.
- Scope authority: the owner chose **"Desain store dulu (Rekomendasi)"** on 29 October 2026 — one design task without schema, migration or route; implementation requires separate authorization.
- Baseline: `2bc0255` (branch `dev`). No schema, migration, route, UI, package code or test was changed.

## Artifacts at the cited SHA

| Artifact | Purpose |
|---|---|
| [M20-08 design](../design/M20-08-reviewer-grant-store-design.md) | Logical grant/event model, state machine, V1–V15 invariants, D08 loader contract, T1–T21 test matrix, open implementation choices |
| [M20-08 packet](../tasks/M20/M20-08.md) | Design-leaf scope, boundaries, required artifacts and report |
| [M20 milestone](../milestones/M20.md) | M20-08 entry pointing at the packet |

## What was verified

Commands actually run in this worktree, with observed results:

1. `git show --stat --oneline 3f8062e` — 3 files changed, 211 insertions; only `docs/design/M20-08-reviewer-grant-store-design.md`, `docs/tasks/M20/M20-08.md` and `docs/milestones/M20.md`. No `packages/`, `apps/`, schema, migration, route or test file appears.
2. A relative-link check over the three artifacts resolved 15/15 design links, 5/5 packet links and 12/12 milestone links; zero missing targets.
3. A content pass against ADR-0015 confirmed every accepted decision is represented: D12 grants bound to D00 (`§1`, `V1`), unchanged login roles (`§3.1`), two-admin `approve` issuance and single-admin `author` (`§4`, `V5`, `V6`, T1–T4), mandatory expiry (`V4`, T8), immediate revocation and terminal history (`§4`, V12–V13, T13–T16), no break-glass/delegation/machine review (`V2`, T5), lane mapping (`V10`), fail-closed loader and read rechecks (`§6`, T15–T17, T21), legacy values (`§7`, T20), retention deferral (`§9`), and the accepted two-account linkage risk (`§2`, T19).
4. No grant, principal, lane assignment, content, release or activation was created; the design states this in its status line and non-goals.

## Limits and non-claims

- The design is not an implementation and creates no enforcement. No `review_scope_grant` store, loader, admin route, UI or test exists.
- Physical tables/columns, pending-request TTL, route shapes, concurrency mechanics and retention remain open; the design lists them as requiring separate decisions.
- The D08 boundary still accepts caller-loaded context; only a future server-side loader can make grants authoritative.
- The residual risk of one human controlling two disjoint accounts is accepted in writing, not solved.
- No reviewer certification, independent human review, deployment, live Hub or database was exercised.

## Rollback

Revert `3f8062e` and the M20-08 TODO row/audit annotation; no code, schema, data, route or deployment depends on them.

## Sources

- [ADR-0015 — D00/D12 reviewer grants](../decisions/ADR-0015-d00-d12-reviewer-grants.md)
- [M20-08 design](../design/M20-08-reviewer-grant-store-design.md)
- [M20-08 packet](../tasks/M20/M20-08.md)
- [M18-08 decision-boundary audit](M18-08-d08-release-decision.md)
- [M20-02 role-scoped review queue](../decisions/M20-02-role-scoped-review-queue.md)
