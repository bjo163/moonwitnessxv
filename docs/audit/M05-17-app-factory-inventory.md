# M05-17 — App Factory inventory

## Baseline and scope

- **Task:** M05-17 (P0), inventory existing app creation and deployment conventions.
- **Worker:** `/root/m05_17_factory_inventory`; integrator reviewed the report.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Worktree:** dirty at inspection because independent Dock, Radio, M01, and other audit changes were in progress; none were modified by the inventory worker.
- **Prerequisites:** M05-08 and M28-01 are checked at the baseline.
- **Scope:** source/config inventory only. No runtime, build, container, or scaffolder implementation is claimed.

The worker inspected `package.json`, `pnpm-workspace.yaml`, `Dockerfile.web`, `Dockerfile`, app manifests under `apps/*`, `scripts/dev.mjs`, focused source references, and `README.md`. The directory `apps/api` existed without a package manifest, so it is not counted as a workspace app.

## Existing app variants

| Workspace | Kind | Local port/runtime | Existing shared dependencies |
| --- | --- | --- | --- |
| `@moonwitness/dock` | Public Next.js frontend | 3001 | core, MoonQL client, MoonUI, web config |
| `@moonwitness/headquarters` | Admin Next.js frontend | 3002 | core, MoonQL client, MoonUI, web config |
| `@moonwitness/radio` | Fastify + MoonQL Hub; product name ARSY, physical rename pending | 3000; `RADIO_PORT` override in runner/config | core, MoonQL packages and domain addons; owns Hub/API/data |
| `@moonwitness/aigateway` | Fastify service | 3003; `AI_GATEWAY_PORT` in runner | Fastify/CORS; not another shared data owner |
| `@moonwitness/sentinel` | Background worker | No public HTTP port | core and MoonQL client; uses existing Hub |
| `@moonwitness/cockpit` | Vite client + Fastify local supervisor/optional Windows GUI | 3004 default | core and MoonUI; separate local GUI runner |

Root `pnpm dev` launches Dock, Headquarters, Radio, AI Gateway, and Sentinel through `scripts/dev.mjs`; Cockpit is separate under `dev:gui`/`gui`. The workspace globs include `apps/*` and `packages/*`; workspace package names follow `@moonwitness/<directory>`.

## Naming, ports, and deployment conventions

- A new workspace needs a unique `apps/<slug>` path and `@moonwitness/<slug>` package identity. A future factory should accept a conservative lowercase URL-safe slug and reject path separators, traversal, reserved/existing names, and existing manifests before writing.
- Current service ports occupy 3000–3004. Two are environment-overridable; workers have no public port. A new network service needs an explicit collision-free port assignment and must not silently take an occupied port.
- `Dockerfile.web` parameterizes only the two Next apps (`APP=dock|headquarters`) and their ports. Root `Dockerfile` builds the Radio/MoonQL Hub only. The workspace context supplies manifests for frozen pnpm installation; shared package artifacts are built once and reused.
- New frontends and workers should reuse the existing packages and call the existing Hub where appropriate. A generated app must not add another Fastify API, Drizzle/Postgres dependency, schema, migration, or database owner by default.
- A service template is not permission to establish a new data plane. A generated sample should not enter the default runner, Docker, or Compose topology without a separately justified integration choice.

## Minimal safe factory boundary

The M05-18 starter should validate slug and variant, preview a rendered file list on dry-run, and refuse if any destination already exists. The smallest generated workspace should be private and use neighboring app conventions for scripts and TypeScript project references. Frontend templates may reuse `@moonwitness/core`, `@moonwitness/moonui`, `@moonwitness/web-config`, and the existing client as needed. Worker/service templates may reuse `@moonwitness/core` and `@moonwitness/moonql-client` only when appropriate.

Locale UI inheritance remains M05-19; worker/service templates must not fabricate a UI. M05-21 owns integration verification, and M05-22 owns adoption/rollback guidance.

## Focused observed evidence

The integrator reran this read-only PowerShell/Node ESM check on the shared tree. Exact command:

```powershell
@'
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const workspace = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
assert.match(workspace, /apps\/\*/);
assert.match(workspace, /packages\/\*/);
const appDirs = fs.readdirSync('apps', { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).filter((name) => fs.existsSync(path.join('apps', name, 'package.json'))).sort();
assert.deepEqual(appDirs, ['aigateway', 'cockpit', 'dock', 'headquarters', 'radio', 'sentinel']);
for (const name of appDirs) assert.equal(JSON.parse(fs.readFileSync(path.join('apps', name, 'package.json'), 'utf8')).name, `@moonwitness/${name}`);
const core = fs.readFileSync('packages/core/src/workspace.ts', 'utf8');
const portBlock = core.match(/export const PORTS = \{([^}]+)\}/s)?.[1];
assert.ok(portBlock);
const ports = [...portBlock.matchAll(/:\s*(\d+)/g)].map((match) => Number(match[1])).sort((a, b) => a - b);
assert.deepEqual(ports, [3000, 3001, 3002, 3003, 3004]);
const webDocker = fs.readFileSync('Dockerfile.web', 'utf8');
assert.match(webDocker, /ARG APP/);
assert.match(webDocker, /APP=dock/);
assert.match(webDocker, /headquarters/);
const hubDocker = fs.readFileSync('Dockerfile', 'utf8');
assert.match(hubDocker, /apps\/radio/);
assert.doesNotMatch(hubDocker, /apps\/arsy/);
console.log(`PASS: workspace globs, ${appDirs.length} package identities, ${ports.length} unique central ports, Docker target boundaries`);
for (const [slug, expected] of [['new-app', 'eligible shape'], ['radio', 'reject reserved/existing'], ['../escape', 'reject traversal'], ['A New App', 'reject invalid characters'], ['a/b', 'reject path separator']]) console.log(`${expected}: ${slug}`);
'@ | node --input-type=module
```

Observed result: `PASS: workspace globs, 6 package identities, 5 unique central ports, Docker target boundaries`, followed by the eligible/reject policy cases below.

Representative slug cases were evaluated against the proposed policy: `new-app` has an eligible shape; `radio`, `../escape`, `A New App`, and `a/b` should be rejected by the inventory's reserved-name/shape constraints. These cases verify the design examples only; no App Factory implementation exists or was invoked, so they do not prove CLI rejection behavior.

The first directory-level check failed because `apps/api` lacked a package manifest; the check was narrowed to actual manifest-bearing workspace apps and then passed. This is a useful negative inventory case, not evidence of runtime behavior.

## Evidence limits, rollback, and next work

This is an inventory artifact. It does not establish that each app starts, ports are free at runtime, Docker builds pass, or deployed services match configuration. No application tests/builds/containers ran. The source/config assertions support the inventory and its positive/negative design examples, but they are not behavioral tests for the future scaffolder. That behavior belongs to M05-18.

Rollback is limited to removing this audit report; no runtime path, API, database, or deployment configuration changed. Integrator should record the integrated source SHA and decide closure against M05-17's inventory-specific DoD. Once accepted, M05-18 is the next App Factory task; M05-19/M05-20 follow it and can be developed in parallel, then M05-21/M05-22.
