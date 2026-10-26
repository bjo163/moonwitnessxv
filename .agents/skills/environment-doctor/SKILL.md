---
name: environment-doctor
description: Inspect MoonWitness XV local tool versions, Git baseline, declared runtime requirements, and root script definitions without installing software or running application scripts.
---

# Environment diagnosis

Read [project guidance](../../../AGENTS.md). Input: repository path and any reported environment problem.

From the repository root, run `node scripts/diagnostics/environment-doctor.mjs` or add `--json`. Add `--commands` to view script definitions. See the [command guide](../../../scripts/diagnostics/README.md) for output interpretation.

The helper only reads manifests/Git metadata and invokes an allowlist of version commands. It does not inspect .env values, contact a container daemon, execute package scripts, install software, or certify builds. A shell hint is not a verified shell identity; use the host's read-only version information if the distinction matters.

Compare observed Node/pnpm with the current manifest, retaining UNKNOWN when the requirement syntax is unsupported or a tool cannot be queried. Diagnose availability separately from compatibility and application behavior. Do not upgrade tools, change PATH/configuration, restart services, run Corepack installs, or invoke build/test/deployment commands.

Report declared versus observed versions, missing tools, repository branch/SHA, existing changes, commands actually executed, and the smallest proposed next check. Use the [diagnostic report template](../../../scripts/diagnostics/report-template.md) when a reusable report is requested. Keep suggestions separate from executed commands.
