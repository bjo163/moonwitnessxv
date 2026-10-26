# M28-01 — Hub identity inventory and pre-rename reference

- **Task:** M28-01, inventory hub-name references and freeze the compatibility baseline.
- **Baseline branch / source SHA:** `codex/m05-08-locale-audit-387f784` / `0f3a252af6e7b7d803cedab121a443911d820279`.
- **Working tree at capture:** not clean. Uncommitted M01-06 security-gate work was present in `.github/workflows/ci.yml`, `.gitignore`, and `docs/audit/M01-06-secret-dependency-gate.md`; those edits are excluded. The M19-09 Dock route and M05-12 formatter changes are committed before this baseline. The inventory uses `git grep`/`git show` against `HEAD` at the pinned SHA.
- **Scope:** documentation-only inventory. No runtime, lockfile, environment, Compose, or TODO file was changed.

## Canonical identity map

Accepted [ADR-0001](../decisions/ADR-0001-arsy-is-xv-hub.md) names the *existing single* Fastify/MoonQL service ARSY. Its physical migration is still pending at this baseline.

| Concern | Existing baseline | Accepted target / migration invariant |
|---|---|---|
| Runtime and workspace | `apps/radio`; package `@moonwitness/radio` | Move/rename once to `apps/arsy` and `@moonwitness/arsy`; no copied second hub. |
| Compose / internal DNS | service key and dependent hostname `radio`; HQ and Dock depend on its health; both pass `RADIO_API_URL=http://radio:3000${API_PREFIX:-/api/v1}` | Rename service to `arsy` only with a reviewed `radio` DNS alias/transition. Keep one process and both clients resolving throughout the approved window. |
| Host/process ports | shared `PORTS.hub = 3000`; Compose publishes `3000:3000`; health is `/api/v1/health/ready` | Preserve port `3000` and readiness behavior. |
| API | default prefix `/api/v1`, `API_PREFIX` canonical with `RADIO_PREFIX` legacy override; stable route/envelope contract | Preserve existing API paths, auth, status codes, payloads and envelope during rename. |
| Hub URL setting | server clients consume `RADIO_API_URL`; default from `HUB_API_DEFAULT` (`127.0.0.1:3000/api/v1`) | Retain safe deprecated `RADIO_*` environment aliases through an explicit migration period; no silent client URL drift. |
| Radio domain | addon name `radio`; stations, schedule, playlog, station seeds and stream behavior | Remains the bounded Radio/SIGNAL feature inside ARSY. Do not rename `radio` media type, station IDs/natural keys, addon dependency names, or Radio content as though they named the whole service. |

## References by integration boundary

- **Workspace/build/package:** root `package.json` enumerates `@moonwitness/radio` for build, `dev:hub`, start, test, and SDK generation/check; `pnpm-lock.yaml` has the `apps/radio` importer; `apps/radio/package.json` owns package identity. `Dockerfile` copies/builds `apps/radio`, copies its `dist`, and starts `apps/radio/dist/server.js`. `Dockerfile.web` explicitly notes that the root web build excludes the Radio package.
- **Compose/DNS:** `docker-compose.yml` declares service `radio`, container name `moonwitness`, port `3000`, and ready healthcheck. Dock and Headquarters both depend on `radio: service_healthy` and use `radio:3000` for their server-side BFF/API URLs. `radio` is therefore a real network DNS contract, not only a label.
- **Environment/config:** `.env.example` documents `RADIO_API_URL` and legacy `RADIO_PORT`, `RADIO_PREFIX`, `RADIO_TITLE`; `apps/radio/src/config.ts` validates them and maps them to `PORT`, `API_PREFIX`, `API_TITLE`. Shared defaults live in `packages/core/src/workspace.ts`. `apps/sentinel/src/index.ts` also reads `RADIO_API_URL` before defaulting to the shared hub port/prefix.
- **Frontend/service clients:** Dock uses `apps/dock/src/lib/env.ts` and `src/data/sdk.ts`; Headquarters uses `apps/headquarters/src/lib/env.ts`, `src/data/sdk.ts`, and the `/api/ops/stream` BFF; Cockpit supervises `@moonwitness/radio` in `apps/cockpit/src/config.ts`. The browser-facing Dock relay routes (`/api/on-air`, `/api/now-playing`, station live metadata) proxy to the hub and must retain existing API paths.
- **SDK/code generation:** `apps/radio/src/tools/gen-sdk.ts` generates the shared `packages/moonql-client/src/generated.ts` from installed addon schemas; root `gen:sdk` and `gen:sdk:check` filter through `@moonwitness/radio`. `apps/radio/test/gen-sdk-gate.test.ts` and `test/moonql-sdk.test.ts` protect generated contract consistency. The output contains model/view names and endpoint shapes; it is not the workspace package identity.
- **CLI, tests, metrics and runbooks:** shared ports are represented in `packages/cli/src/ports.ts` and `src/status.ts`; `scripts/dev.mjs` registers the hub tag/package/port. `apps/radio/test/` has topology, Dockerfile, Compose, env, SDK, metrics and domain compatibility coverage (among others). The admin metrics route remains `/api/v1/metrics` and exports stable `moonwitness_*` families. `docs/runbook-restore.md` stops `radio`/HQ/Dock and verifies readiness plus station catalog after restore.
- **Operator/repository docs:** `README.md` already distinguishes ARSY as the accepted hub identity from the pending physical rename and retained Radio domain; `BLUEPRINT.md`, `docs/architecture/APPS.md`, `TODO.md`, ADR-0001 and M28 task specs contain migration statements. Historical audit/task docs include old names intentionally and must not be rewritten as current runtime references without checking their historical purpose.

## Search evidence and classification

At the pinned `HEAD`, tracked-text searches returned these **overlapping** path counts: `apps/radio` in 72 paths; `@moonwitness/radio` in 36; `RADIO_API_URL` in 14; and literal `radio:3000` in 5. The broad hits include audit/history, Radio-domain words and generated content, so these counts are discovery totals, not a rename checklist. A focused scan of runtime clients/tests found:

`apps/cockpit/src/config.ts`; `apps/dock/src/data/sdk.ts`; `apps/dock/src/lib/env.ts`; `apps/headquarters/src/app/api/ops/stream/route.ts`; `apps/headquarters/src/data/sdk.ts`; `apps/headquarters/src/lib/env.ts`; `apps/sentinel/src/index.ts`; `packages/cli/src/ports.ts`; `packages/core/src/web-fetch.ts`; `packages/moonql-client/src/web.ts`; plus Radio tests `actors-pg`, `compose-contract`, `corpus-reader-pg`, `dockerfile-contract`, `env-contract`, `field-registry`, `graph-pg`, `mizan-pg`, `moonql-web-kit`, `ontology-pg`, `research-pg`, `unilex-pg`, `workspace-topology`, and `tsconfig`.

Domain references that should survive the hub rename include `packages/moonql-stations/src/index.ts` (`name: 'radio'` addon and station fixtures), `packages/moonql-schedule` and `packages/moonql-playlog` dependencies on addon `radio`, media type `radio` in Cockpit/MoonUI/types, Radio command/help content, and station natural keys. M22-01 records 36 station seeds (35 active, one intentionally inactive), generated database IDs rather than pinned UUIDs, schedule/playlog shapes, the `/api/v1` success/error envelope, and normalized in-memory response fixtures. Its exact fixture/test SHA is `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`; the Radio app/package source paths are unchanged between that SHA and this inventory SHA. It explicitly makes no live-stream availability claim.

## Evidence, limits and next tasks

This is a source inventory, not a rename or deployment test. `git grep`/`git show` were used against the pinned commit; no M28 runtime tests were run. M22-01's Radio suite at its pinned fixture SHA passed 305 tests, failed 0, with 9 optional PostgreSQL cases skipped because no parity database URL was configured; this is inherited evidence from [its audit](M22-01-radio-baseline.md), not a test run performed for M28-01. I found no evidence of an existing `apps/arsy` service or second hub at the pinned commit.

M28-08 should turn this crosswalk into the actual rename manifest and classify each runtime/import path. M28-09 should use the M22-01 normalized fixtures to pin API compatibility, adding deterministic tests where M22-01 explicitly records limits. M28-01 is eligible for integrator review; do not start directory/package/Compose migration until M28-02 ratifies its compatibility map.
