# Read-only local diagnostics

Run from the repository root:

```text
node scripts/diagnostics/environment-doctor.mjs
node scripts/diagnostics/environment-doctor.mjs --json
node scripts/diagnostics/environment-doctor.mjs --commands
node scripts/diagnostics/environment-doctor.mjs --help
```

The helper reads the root manifest and Git baseline, reports fixed tool-version probes, compares the declared Node major range and exact pnpm version, and discovers every root script definition. It never runs those definitions. Unsupported version requirement syntax remains UNKNOWN. The Docker probe queries only the CLI version, not the daemon. Child-process Corepack networking is disabled; no persistent environment setting is changed. The actual host shell must be reported separately.

`--commands` is a live command reference generated from package.json. Every row includes its actual definition, likely effect, directly named package filters, protected-work context, and execution authorization. Classification is conservative and is not task readiness or a TODO validator. Re-read nested definitions before executing anything. All rows remain NOT_RUN.

| Existing command group | Effect to inspect before any future execution |
| --- | --- |
| build, build:libs, build:web, verify, verify:docker | Writes build output; verify includes application tests; M27 and package-specific acceptance applies. |
| dev/start variants, gui, moon | Starts services or an interactive CLI; may load environment values and mutate data. |
| db:* | Database, generated-schema, service, or interactive operations; M04/M27 scope. |
| docker:build, docker:up | Container/image creation or service start; M27. |
| clean, ports:free, lint:fix, gen:sdk | Deletes output, terminates processes, or rewrites repository files. |
| lint, typecheck, ui:check, gen:sdk:check, test | Executes check code; typecheck may write cache. Inspect the owning packet and permission before use. |

For GitHub state and Wiki preview, reuse [Phase 2 tools](../governance/README.md). Use the [report template](report-template.md) for an environment, log, diff, or access report. It is not a task handoff, task tracker, or release evidence ledger.

## Phase 3 scope decisions

- AGENTS.md: stable navigation, preservation, and evidence rules only; no task lease or handoff implementation.
- Five skills under .agents/skills: INDEPENDENT_SKILL_ALLOWED. They inspect paths, versions, supplied failures, known diffs, and existing governance tools.
- This helper and its isolated tests: INDEPENDENT_DIAGNOSTIC_TOOL_ALLOWED. It does not pin toolchains or satisfy M01 acceptance.
- A full deployment-preflight planner and app/security-surface classification: TODO_TASK_OVERLAP with M27/M37 and, for Empire, M31. No planner was saved.
- Task-role/dependency/link validator, dispatcher, lease, and handoff: TODO_TASK_OVERLAP with M29. No implementation was added.
- CI evidence ledger, secret-scanning gates, release automation: TODO_TASK_OVERLAP with M01/M27. Log triage only explains existing evidence.
- Dedicated documentation-link automation: omitted because M29-03 owns the canonical validator; bounded manual reference review stays within diff review.
- Claude/Copilot/Cursor adapters and specialist-agent definitions: omitted; the observed client is Codex and no extra adapter is needed.

No deployment acceptance command is run here. Future named-app inspection should start at its manifest and existing configuration, then identify the exact packet owning each required check. M27-09/10/12 own image/topology/build evidence, M27-14/19 own live deployment evidence, M31 owns Lighthouse, and M37 owns cross-app deployment/security classification. These references are routing, not approval or readiness findings.
