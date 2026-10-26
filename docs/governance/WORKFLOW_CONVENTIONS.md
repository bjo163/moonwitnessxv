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

## Integration flow: enforced

The required path is `topic branch → PR to dev → verified merge → automated PR to main → release merge`. The `dev` branch is the GitHub default branch and the primary staging integration branch. Both `dev` and `main` reject direct pushes, force-pushes, and deletion.

1. **Development into `dev`:**
   - Topic branches target `dev` via Pull Request.
   - PRs into `dev` require the `Monorepo Verification & Safety Gates` check to pass before merging.
   - Merging into `dev` stages features together for end-to-end integration.

2. **Promotion from `dev` to `main`:**
   - PRs into `main` are restricted strictly to this repository's `dev` branch.
   - Pushes to `dev` trigger the `Auto PR dev to main` workflow. If `dev` contains commits ahead of `main`, it ensures an open sync PR (`chore(release): sync dev to main`) exists.
   - The sync PR automatically receives subsequent `dev` commits and runs the `Monorepo Verification & Safety Gates` check.
   - When ready for a production release, the maintainer reviews the sync PR and merges it into `main`.

## Enforcement state

There is no commit-message validator, branch-name validator, PR-title validator, or TODO-to-Issue synchronizer. These conventions remain guidance, while branch routing, PR gating, and automated sync PR management are enforced by repository rules and CI.
