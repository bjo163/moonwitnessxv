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
- Graph and Ontology candidate/reviewer projections and raw REST reads now require admin authorization until an approved D08 public projection exists. The API major default advances to 5.0.0; Dock shows a localized withholding state. This is a security containment change, not D08 publication approval or deployment evidence.
- Recorded the verified in-place ARSY Hub migration and exact-SHA rollback rehearsal at source `dbc5f01` in the [operator handoff](docs/runbook-arsy-migration.md). This is compatibility/runtime evidence, not a production deployment; M28-15 remains open.
- Streamlined CI pipeline to run verification exactly once on `dev` and eliminate duplicate verification on `main`.
- Reference design mockups (`docs/design/mockups-xv`) are reference-only and never shipped as product art; a per-asset rights ledger is required first ([ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md)).
- The `promote` job now tags and publishes a GitHub Release for each verified commit that reaches `main`; the workflow never rewrites `CHANGELOG.md` or `package.json`.
- Protected `main` with the required exact CI status check while preserving verified automatic fast-forward promotion.
