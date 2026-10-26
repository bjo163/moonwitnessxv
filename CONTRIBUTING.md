# Contributing

Thanks for helping improve MoonWitness XV. This guide covers how to propose and review repository changes; it does not create a second task register or authorize implementation of planned work.

## Before you start

- Read [README.md](README.md) for the project overview and [BLUEPRINT.md](BLUEPRINT.md) for architecture and ownership boundaries.
- `TODO.md` is the sole task and task-status register. Check it and the relevant task packet before proposing implementation work. GitHub Issues and Projects are coordination surfaces; an Issue does not authorize work or establish completion.
- For an existing TODO task, work only after its prerequisites and required owner decisions are satisfied. Follow [the AI execution contract](docs/planning/AI_EXECUTION_CONTRACT.md). If scope or ownership is unclear, ask for clarification before changing code.
- For work outside TODO, identify it as independent governance or documentation preparation in the issue and pull request. Do not use that label to deliver an acceptance criterion of a TODO task.

## Proposing a change

Use the repository Issue forms when they fit. Include the relevant task ID for TODO-related discussion, or state `NON-TODO GOVERNANCE PREPARATION` for independent governance work. Describe the problem, intended scope, evidence, and any owner decision needed. An Issue is for discussion and coordination; implementation still follows the repository's task authority and review process.

See [proposed Issue, branch, commit, and integration conventions](docs/governance/WORKFLOW_CONVENTIONS.md). They are guidance, not currently enforced repository policy.

Before opening a pull request, update from the current `main`, keep the change focused, and check the full diff for unrelated files, private data, credentials, and generated artifacts. Do not force-push or rewrite shared history. Never include private witness material, secrets, or source content whose rights and consent are unknown.

## Pull requests

Use the [pull request template](.github/PULL_REQUEST_TEMPLATE.md). Link relevant Issues and task packets, explain the exact files changed, and report commands and observed results. Separate verified behavior from proposals. Do not mark a TODO task complete; the authorized integrator records status only after reviewing the required evidence.

The active `main` ruleset currently requires one approving review, resolved review threads, and the `Monorepo Verification & Safety Gates` check. Follow the live repository rules if they change.

## Sources, rights, and privacy

For source-based material, identify the source and edition, provenance, rights or license, consent where applicable, and review state. Unknown rights must not be presented as publication approval. Keep private testimony and personal data out of public Issues and pull requests. Follow [the architecture security contract](docs/architecture/SECURITY.md) and accepted source-rights decisions linked from [the ADR index](docs/decisions/README.md).

## Security reports

Do not post suspected vulnerabilities, credentials, or exploit details in a public Issue. Use GitHub's private vulnerability reporting for this repository if it is enabled. If it is unavailable, contact the repository owner through a private channel before sharing details. Do not include secrets in a pull request, even to demonstrate a fix.
