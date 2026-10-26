# Repository workflow conventions

**Status: active integration policy.** Branch/commit naming conventions remain guidance; the `dev` → `main` integration path is enforced by GitHub rulesets and CI. `TODO.md` remains the only task/status register. An Issue, branch, commit, or PR does not authorize implementation or prove completion.

## Issue titles and contents

- For discussion of a registered task, use `[Mxx-yy] Concise outcome` and put the exact stable task ID in the body. Include its milestone, canonical TODO entry, task packet if present, prerequisites, scope/exclusions, acceptance and evidence expectations, relevant security/rights/privacy/human approval constraints, and baseline SHA only when observed. Do not copy or invent status or missing requirements.
- For independent governance work, use `[GOV] Concise outcome`; use `[PREP]` for a clearly bounded preparation request. Do not assign an invented milestone ID.
- Issues are coordination records only. Check the current inventory before creating one; do not duplicate tasks or bulk-sync TODO to Issues.

## Topic branch names

Proposed form: `<type>/<task-id>-<short-kebab-description>` for TODO-linked work, or `<type>/<short-kebab-description>` for independent work. Use lowercase type and description. Examples are illustrative; do not create branches from this document.

| Type | Use |
| --- | --- |
| `feat` | Authorized new behavior |
| `fix` | Verified defect correction |
| `chore` | Independent maintenance/preparation |
| `docs` | Documentation |
| `refactor` | Behavior-preserving restructuring |
| `test` | Authorized tests |
| `ci` | Authorized CI changes |
| `build` | Build tooling |
| `perf` | Verified performance work |
| `revert` | Explicitly authorized reversal |

Examples: `feat/M03-03-expired-cookie-check`, `docs/M05-03-addon-boundaries`, `chore/phase-6-governance-consolidation`.

## Conventional Commits

Proposed message form: `<type>(<scope>): <imperative summary>`. For TODO work, use the task ID as scope, such as `fix(M03-03): reject expired HQ cookies`. For independent work, use a descriptive scope, such as `docs(governance): propose repository workflow conventions`.

Accepted types are `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, and `revert`. A commit must describe the change that actually happened, avoid unrelated outcomes, and never claim checks, deployment, or release success without evidence. Do not label implementation `chore` to avoid its true meaning.

Breaking changes use `!` before the colon (`feat(api)!: ...`) and a `BREAKING CHANGE: ...` footer explaining impact. Both may be included. Proposed release interpretation is specified separately in the Phase 6 decision report; it is not active automation.

## Pull requests and review

Proposed PR titles use the same format as commits. The existing [PR template](../../.github/PULL_REQUEST_TEMPLATE.md) remains the detail checklist: task ID or explicit `NON-TODO GOVERNANCE PREPARATION`, bounded scope and paths, linked Issues/contracts, actual commands/results, evidence, compatibility and security/rights/privacy/localization impact, rollback, and required reviewers. Record exact baseline SHA only after observing it. A PR or passing CI does not itself authorize implementation or close a task.

## Integration flow: direct & automated

The required path is `push to dev (direct or PR) → verified push to dev → automatic fast-forward to main`. `main` is the GitHub default branch; `dev` is the active integration branch. Both `dev` and `main` reject direct force-pushes and deletion.

1. **Development into `dev`:**
   - Changes can be committed and pushed directly to `dev`. Intermediate topic branches and pull requests are optional, not enforced by repository rules.
   - On each push to `dev`, the `Monorepo Verification & Safety Gates` check runs.

2. **Automatic Fast-Forward to `main` (Zero-Approval, Zero-Duplicate):**
   - After verification succeeds on `dev`, the `promote` job immediately fast-forwards `main` to that exact verified commit.
   - There are no duplicate verification checks on `main`, no secondary release PRs, and no human approval bottlenecks.
   - Local environments use no pre-commit hooks (Husky is omitted) to preserve rapid local iteration; verification is owned by CI.

## Enforcement state

There is no commit-message validator, branch-name validator, PR-title validator, or TODO-to-Issue synchronizer. These conventions remain guidance, while branch protection and automated promotion to `main` are enforced by repository rules and CI.
