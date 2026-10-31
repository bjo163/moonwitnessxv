# Changelog

All notable changes to MoonWitness XV are recorded here. This private monorepo
uses [Semantic Versioning](https://semver.org/). Entries describe repository
releases; they do not imply that an application is deployed or publicly
available.

## [Unreleased]

### Added
- SKYLINK now has a dedicated runtime image and an opt-in, loopback-published Compose service with a healthcheck. M38-14 synthetic integration tests verify the existing operator event path and flag-off rollback; no real Telegram delivery is claimed.
- Release and changelog guidance in `docs/audit/M01-05-release-lifecycle.md`.
- Automated fast-forward promotion from verified `dev` to `main` without redundant checks or approval gates.
- Integration branch `dev` with PR gating and safety checks.
- Local Git gates in `.githooks/`: Conventional Commit validation, secret-file block, `ui:check`, and `dev`/`main` branch discipline, activated by `pnpm install`.
- `scripts/release.mjs` SemVer bumper and changelog generator, available as `pnpm release` and `pnpm release:dry`.
- ECHOLOG (D19) includes a bounded, SigV4-authenticated S3-compatible server backed by its own filesystem storage (no MinIO). This entry does not claim production deployment, off-host backup restoration, or D18 attachment delivery.
- [ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md) public UI reference adoption: Dock four-space entry (`READ`/`EXPLORE`/`CREATE`/`SIGNAL`) with explicit `REAL`/`PLANNED`/`DEMO` labels, reader provenance disclosure and a keyboard-reachable lexicon list.
- Baseline evidence for the twelve design references: [UI audit](docs/audit/ui-baseline-8737fe4.md) and the [blocked-screen register](docs/audit/ui-blocked-screens-8737fe4.md).

### Changed
- The Cockpit moved from `apps/cockpit` to `tools/cockpit`. It is local operator tooling, not a deployable product surface, so `apps/` now means "product app" again. `pnpm-workspace.yaml` gains a `tools/*` group; the dev registry entry carries `root: 'tools'`, and the UI-consistency/asset scanners, the app-factory registry-coverage test, the ESLint React-Hooks override and the MoonUI debt ledger follow that root.
- ORBIT (`apps/orbit`) is parked: it stays in the tree with its tests, but the dev registry entry is `dev:false`, port 3007 is retired from `PORTS`, the Cockpit no longer supervises it, `build:web`/`verify:docker`/the root test chain skip it, and the Compose service is removed (10 → 9 services). M40 stays open and no task is closed; unparking restores the registry entry, `PORTS.orbit`, the Cockpit entry and the Compose service.
- Graph and Ontology candidate/reviewer projections and raw REST reads now require admin authorization until an approved D08 public projection exists. The API major default advances to 5.0.0; Dock shows a localized withholding state. This is a security containment change, not D08 publication approval or deployment evidence.
- Recorded the verified in-place ARSY Hub migration and exact-SHA rollback rehearsal at source `dbc5f01` in the [operator handoff](docs/runbook-arsy-migration.md). This is compatibility/runtime evidence, not a production deployment; M28-15 remains open.
- Streamlined CI pipeline to run verification exactly once on `dev` and eliminate duplicate verification on `main`.
- Reference design mockups (`docs/design/mockups-xv`) are reference-only and never shipped as product art; a per-asset rights ledger is required first ([ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md)).
- The `promote` job now tags and publishes a GitHub Release for each verified commit that reaches `main`; the workflow never rewrites `CHANGELOG.md` or `package.json`.
- Protected `main` with the required exact CI status check while preserving verified automatic fast-forward promotion.

### Removed
- The ISP & Network Operations vertical (D20) is withdrawn by [ADR-0019](docs/decisions/ADR-0019-withdraw-isp-vertical.md), superseding [ADR-0018](docs/decisions/ADR-0018-isp-network-operations.md). `apps/isp-console`, `apps/isp-radius`, `packages/moonql-isp`, the `isp-alerts` ARSY module, two M51 governance scripts and two planning tests are removed. At this step the workspace went 13 apps / 36 packages → 11 / 35 and Compose 11 → 10 services; ports 3008/3009 retire. After the Cockpit move and the ORBIT parking recorded above, the shipped tree is 10 app workspaces under `apps/` plus `tools/cockpit`, 35 packages, and 9 Compose services. Existing `isp_*` tables are left orphaned on purpose: MoonQL auto-sync never drops tables, so no data is destroyed by this change. The published API major advances from 5.0.0 to 6.0.0 because ten `/isp/**` and `/isp-radius/**` endpoints disappear.
