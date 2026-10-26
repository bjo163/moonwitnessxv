# M28-08 — Radio/ARSY import and identity manifest

- **Task:** M28-08, audit every actual Radio/ARSY import and backend identity.
- **Baseline branch / source SHA:** `codex/m05-08-locale-audit-387f784` / `6a4990d302fd68d5ea8111166420fd48be9b9adb`.
- **Working tree at capture:** not clean; only unrelated M01-06 edits were present in `.github/workflows/ci.yml`, `.gitignore`, and `docs/audit/M01-06-secret-dependency-gate.md`. This report enumerates committed `HEAD`.
- **Scope:** documentation-only; no package identity, runtime, test, lockfile, or TODO state changed.

## Canonical identity

Per accepted [ADR-0001](../decisions/ADR-0001-arsy-is-xv-hub.md), the existing single Fastify/MoonQL/API service is the ARSY runtime, currently implemented at `apps/radio` as `@moonwitness/radio`. The physical rename is future work. Radio/SIGNAL remains a feature domain inside that service. The manifest below is a rename checklist, not authorization to copy the service or rename Radio data contracts.

At this SHA there is no `apps/arsy` workspace or `@moonwitness/arsy` package. Search found no external ESM import of `@moonwitness/radio`; consumers select it by package/filter string or use its HTTP API. That distinction matters: package filters and paths must migrate, while API clients and domain addons retain their separate compatibility rules.

## Direct workspace dependency manifest

The `apps/radio/package.json` manifest declares 20 workspace runtime dependencies and 6 workspace development dependencies. `pnpm-lock.yaml` records them in importer `apps/radio`; the focused topology test confirms manifest/importer membership and that every declared internal dependency has a workspace target.

| Dependency class | Current workspace package identities | Rename treatment |
|---|---|---|
| Runtime foundation | `@moonwitness/core`, `@moonwitness/moonql` | Keep package identities. Update only path/service assumptions that point at the hub. |
| Runtime feature packages | `@moonwitness/denpa`, `@moonwitness/whatsapp` | Keep these feature-package identities; they are mounted/used by the one hub, not alternate backends. |
| Runtime MoonQL domains/addons | `@moonwitness/moonql-actors`, `@moonwitness/moonql-apikeys`, `@moonwitness/moonql-auth`, `@moonwitness/moonql-base`, `@moonwitness/moonql-corpus`, `@moonwitness/moonql-graph`, `@moonwitness/moonql-journey`, `@moonwitness/moonql-monitor`, `@moonwitness/moonql-ontology`, `@moonwitness/moonql-ops`, `@moonwitness/moonql-playlog`, `@moonwitness/moonql-research`, `@moonwitness/moonql-schedule`, `@moonwitness/moonql-settings`, `@moonwitness/moonql-stations`, `@moonwitness/moonql-unilex` | Preserve as domain/package identities. In particular, stations, schedule, playlog, and `radio` media values are not aliases for the backend service. |
| Development/test tools | `@moonwitness/aigateway`, `@moonwitness/cli`, `@moonwitness/moonui`, `@moonwitness/moonql-client`, `@moonwitness/sentinel`, `@moonwitness/testing` | Keep package identities; inspect any literal `apps/radio`, package-name, port, or env reference in their scripts/tests and update only that hub integration. |

Actual runtime source imports include the 16 addon modules in `apps/radio/src/addons.ts`, plus `@moonwitness/core`, `@moonwitness/moonql`, `@moonwitness/denpa`, and `@moonwitness/whatsapp` in the app/server/tool paths. The addon registry is the one wiring point and must stay the same addon set through a directory/package rename. Test-only imports of `@moonwitness/cli`, `@moonwitness/testing`, `@moonwitness/types`, and `@moonwitness/moonql-client` are tooling/fixture contracts, not extra backend services.

## Identity-bearing references to migrate

| Area | Exact baseline references | Migration action / invariant |
|---|---|---|
| Workspace/package | `apps/radio/package.json` name/main/scripts; `pnpm-lock.yaml` importer `apps/radio`; root `pnpm-workspace.yaml` is a generic `apps/*` glob | Move the workspace once and rename the package; regenerate the importer through pnpm. The generic workspace glob needs no semantic change. |
| Root commands | root `package.json`: `build`, `dev:hub`, `start`, `test`, `gen:sdk`, `gen:sdk:check` filters | Point each filter/path at the new package; preserve the root command behavior. |
| Service runner | `scripts/dev.mjs` package tag `@moonwitness/radio`, shared port `3000`, legacy `RADIO_PORT` fallback | Update package tag/path while preserving the port contract and compatibility alias. |
| Container | `Dockerfile` copies `apps/radio`, builds `@moonwitness/radio`, copies `apps/radio/dist`, starts `apps/radio/dist/server.js` | Update all stage paths/package filters together; retain a single runtime. `Dockerfile.web` explicitly excludes the hub from its web build and references the old package in that explanation. |
| Compose/DNS | `docker-compose.yml` service/dependency `radio`, `RADIO_API_URL=http://radio:3000${API_PREFIX:-/api/v1}`, hub title/config names | Rename service with the ADR-approved `radio` DNS transition alias; preserve port, readiness route, API prefix, and client resolution. |
| Cockpit runner | `apps/cockpit/src/config.ts` service package string `@moonwitness/radio` | Update the process-supervisor package identity; retain service label/domain semantics where they refer to Radio functionality. |
| HTTP clients | Dock: `apps/dock/src/lib/env.ts`, `src/data/sdk.ts`; HQ: `apps/headquarters/src/lib/env.ts`, `src/data/sdk.ts`, `/api/ops/stream`; Sentinel: `apps/sentinel/src/index.ts` | These are `RADIO_API_URL` consumers, not ESM package imports. Preserve the HTTP path/envelope/auth and migrate env aliases only under an explicit compatibility plan. |
| Tests | `apps/radio/test/workspace-topology.test.ts` resolves `@moonwitness/radio`; `dockerfile-contract.test.ts`, `env-contract.test.ts`, `moonql-web-kit.test.ts`, `tsconfig.json` and PostgreSQL test instructions in `actors-pg`, `corpus-reader-pg`, `graph-pg`, `mizan-pg`, `ontology-pg`, `research-pg`, and `unilex-pg` contain path/filter/env assumptions | Update path/package assertions and commands; keep the tests as migration regression gates. Change references to test instructions only when the rename lands. |
| Env/defaults | `.env.example`, `apps/radio/src/config.ts`, `packages/core/src/workspace.ts`, web clients | Preserve `RADIO_API_URL`, `RADIO_PORT`, `RADIO_PREFIX`, and `RADIO_TITLE` as documented aliases during the accepted window; `PORTS.hub` and `HUB_API_DEFAULT` remain shared contracts. |

## References that must survive

- `packages/moonql-stations`, `moonql-schedule`, and `moonql-playlog` use addon/model/ref names and seeds for actual Radio-domain data. Do not rename `radio` media type, station natural keys, routes, or stored schema just because the hub package moves.
- `packages/whatsapp` and `packages/denpa` remain feature packages mounted/used by the one hub; their names are not competing backend identities.
- Station IDs are generated by MoonQL; M22-01 pins stable station names and normalized response shapes, not a fabricated permanent UUID. Existing `/api/v1`, auth/status/envelope, port `3000`, readiness and SDK behavior remain compatibility invariants.
- Comments and historical docs that say `apps/radio` describe the actual old baseline; rewrite them only when the relevant runtime or runbook changes, not as a bulk find/replace.

Other concrete path-sensitive source references found and classified: lint file globs in `packages/eslint-config/src/index.js`; the launchpad scan path in `scripts/check-ui-consistency.mjs`; a test-contract comment in `scripts/db-backup.sh`; path examples in `packages/cli/src/ports.ts`, `packages/core/src/web-fetch.ts`, `packages/moonql/src/augment.ts`, and `packages/whatsapp/src/plugin.ts`; and the shared-env comment in `apps/headquarters/next.config.mjs`. These comments/globs belong in the eventual path migration manifest even though they are not imports. `README.md`, `BLUEPRINT.md`, `docs/architecture/APPS.md`, ADR-0001, M28 specs and audit history are descriptive/historical sources; update current guidance after the rename is verified, preserve pinned historical source references.

## Evidence and limits

Executed against the pinned/current committed source: `pnpm --filter @moonwitness/radio exec tsx --test test/workspace-topology.test.ts test/dockerfile-contract.test.ts test/env-contract.test.ts`. Result: exit 0, 17 passed, 0 failed. The suite checks workspace/package alignment, the addon-to-dependency set, Docker importer/runtime copies, env contract and retired alias rejection. Static discovery used `git grep` at `HEAD` for `apps/radio`, `@moonwitness/radio`, and the `RADIO_*` API/port/prefix/title names, then direct source/package inspection. The M28-01 audit separately recorded broad tracked-text counts; those counts overlap and are not rename-task counts.

No import, package, lockfile or code change was made. The exact inventory SHA is `6a4990d302fd68d5ea8111166420fd48be9b9adb`; the three unrelated uncommitted M01-06 changes were excluded. This audit does not claim that migration, Compose transition, deployment, database migration, or live radio verification has occurred. Rollback is deletion of this documentation-only manifest.

**Integrator review:** accepted at exact inventory SHA `6a4990d302fd68d5ea8111166420fd48be9b9adb`. **Next eligible M28 leaves:** M28-02 (compatibility-map ratification) and M28-09 (fixture regression), both subject to their own acceptance; M28-10 must wait for M28-02 and M28-08.
