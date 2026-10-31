# Package owner onboarding map

One page that takes a contributor from "I own a task" to the status source, the
package that owns the change, the contract it must respect, the coding guide for
its language, and the command that discovers what can be run. It links; it does
not copy. Status, counts and maturity statements live only in [TODO](../../TODO.md)
— if this file ever restates them, this file is wrong.

## 1. Status and scope come from three places, in this order

| Question | Authority |
|---|---|
| Is this done? | [TODO](../../TODO.md) — the only status source |
| What is the boundary of this row? | its task packet under `docs/tasks/<M##>/<M##-##>.md` (index: [tasks](../tasks)) |
| What is the domain and why does it exist? | [BLUEPRINT](../../BLUEPRINT.md), [milestone context](../milestones) |
| May I change this boundary at all? | [ADR index](../decisions/README.md) and the [AI execution contract](AI_EXECUTION_CONTRACT.md) |
| UI semantics only | [MASTER_DESIGN](../../MASTER_DESIGN.md) |

Milestone files under [docs/milestones](../milestones) are context, not
trackers; they carry a snapshot that is already stale by design.

## 2. Which package owns the change

App and domain ownership is stated once in [APPS](../architecture/APPS.md);
this table adds only the two things a contributor needs next: the focused test
command for that workspace and, where one exists, the contract the workspace
must obey. Commands are `pnpm --filter <name> <script>` from the repo root.

| Workspace | Focused test | Contract / domain doc |
|---|---|---|
| `apps/arsy` (`@moonwitness/arsy`) | `test` | [Fastify API patterns](../../.agents/skills/moonwitness-fastify-api/SKILL.md) |
| `apps/dock` (`@moonwitness/dock`) | `test` | [I18N](../architecture/I18N.md) |
| `apps/headquarters` (`@moonwitness/headquarters`) | no package `test` script — runs through the root `test` script via `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/<file>.ts` | [DEV_PROCESSES](../architecture/DEV_PROCESSES.md) |
| `apps/aigateway` (`@moonwitness/aigateway`) | `test` | [AI candidate evidence](../architecture/M21-02-ai-candidate-evidence.md) |
| `apps/orbit` (`@moonwitness/orbit`) | `test` | [ORBIT](../architecture/ORBIT.md) |
| `apps/sentinel` (`@moonwitness/sentinel`) | `test` | [DEV_PROCESSES](../architecture/DEV_PROCESSES.md) |
| `apps/cockpit` (`@moonwitness/cockpit`) | `test` | [DEV_PROCESSES](../architecture/DEV_PROCESSES.md) |
| `apps/skylink` (`@moonwitness/skylink`) | `test` | [APPS](../architecture/APPS.md) — SKYLINK is not a second Hub and owns no identity, catalog or third SQL store (ADR-0006) |
| `apps/echolog` (`@moonwitness/echolog`) | `test` | [ECHOLOG](../architecture/ECHOLOG.md) — D19 object storage; owns no tables, is not a SQL owner (ADR-0007) |
| `apps/lumen-runtime` (`@moonwitness/lumen-runtime`) | `test` | [LUMEN](../architecture/LUMEN.md) · [contracts](../architecture/LUMEN_CONTRACTS.md) |
| `apps/empire-web` (`@moonwitness/empire-web`) | `test` | [APPS](../architecture/APPS.md) |
| `packages/core` (`@moonwitness/core`) | `test` | [BLUEPRINT](../../BLUEPRINT.md) |
| `packages/governance` (`@moonwitness/governance`) | `test` | [governance docs](../governance) |
| `packages/moonql-journey` (`@moonwitness/moonql-journey`) | `test` (builds first, tests read `dist/`) | [M23 milestone](../milestones/M23.md) |
| `packages/moonql-unilex`, `packages/moonql-*` addons without a `test` script | covered by the root `test` script and their app's suite | [moonql boundaries](../../.agents/skills/moonwitness-monorepo-boundaries/SKILL.md) |
| `packages/moonui` (`@moonwitness/moonui`) | `test` | [shared UI gate](../../scripts/check-ui-consistency.mjs) (ADR-0017) and [exceptions ledger](../design/moonui-exceptions.json) |
| `packages/skylink-core`, `skylink-store`, `skylink-telegram`, `skylink-whatsapp` | `test` where present | [APPS](../architecture/APPS.md) |
| `packages/review-grants` (`@moonwitness/review-grants`) | `test` | [D08 authority proposal](../design/D08-release-authority-proposal.md) |

A workspace with no `test` script is not untested: the owning app's suite or the
root `test` script covers it. Check the root [package.json](../../package.json)
`test` script for the exact list before adding a new lane — the standing owner
policy is one cheap build-and-test gate, not parallel automation.

## 3. Coding guides by language of the change

- Where the change belongs (which app/package owns the boundary): [monorepo boundaries](../../.agents/skills/moonwitness-monorepo-boundaries/SKILL.md)
- TypeScript and lint rules actually enforced, including per-file overrides: [TypeScript/ESLint](../../.agents/skills/moonwitness-eslint-typescript/SKILL.md) and [eslint-config](../../packages/eslint-config)
- Fastify API conventions (routes, plugins, schemas, errors, tests): [Fastify API](../../.agents/skills/moonwitness-fastify-api/SKILL.md)
- Reviewing a diff for regression, privacy, scope and evidence risk: [diff risk review](../../.agents/skills/diff-risk-review/SKILL.md)
- Existing failures, build or CI: [failure triage](../../.agents/skills/failure-triage/SKILL.md)
- General contribution flow: [CONTRIBUTING](../../CONTRIBUTING.md); security reporting: [SECURITY](../../SECURITY.md)

## 4. Command discovery without guessing

Do not hard-code commands into docs or CI, and do not run application scripts to
"see what's there". [scripts/diagnostics/README.md](../../scripts/diagnostics/README.md)
discovers the declared scripts and toolchain versions read-only; the
[environment doctor](../../.agents/skills/environment-doctor/SKILL.md) and
[environment-doctor.mjs](../../scripts/diagnostics/environment-doctor.mjs) inspect
local versions, the Git baseline and runtime requirements without installing or
executing anything. Toolchain requirements come from the live manifests:
root [package.json](../../package.json) and the lockfile — read them, do not
recall them.

The narrow loop for a change is always: focused package script first, root
`pnpm verify` only as a broad integration check. A green root check is not
evidence that a specific row's acceptance holds, and CI configuration is not
proof of deployment.

## 5. Stop conditions a new owner hits first

- Branches: only `dev` and `main`; work lands on `dev`, then the promote job
  fast-forwards `main`. No topic or feature branches (owner policy in
  [AGENTS.md](../../AGENTS.md)).
- Preparation-only requests (and any "Phase 3") freeze TODO implementation and
  status changes; a skill or a doc never authorizes executing a task.
- DNS and mail authority (NS/MX/SPF/DKIM/DMARC) is out of scope (ADR-0016).
- Secrets, environment values, private witness material and unapproved source
  content never enter output or public Git; a packet whose acceptance needs a
  real source, rights decision, meter, production access, test or reviewer is
  **BLOCKED**, and the honest outcome is a blocker audit instead of a checked box.
- A change that would move an owner, system of record, durable schema, public
  API, identity/reviewer authority or rights/release boundary stops at the
  [ADR applicability register](../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md)
  until the owner reviews it.
