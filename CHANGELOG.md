# Changelog

All notable changes to MoonWitness XV are recorded here. This private monorepo
uses [Semantic Versioning](https://semver.org/). Entries describe repository
releases; they do not imply that an application is deployed or publicly
available.

## [Unreleased]

### Added
- Release and changelog guidance in `docs/audit/M01-05-release-lifecycle.md`.
- Automated staging-to-production synchronization PR workflow (`.github/workflows/sync-dev-to-main.yml`).
- Staging integration branch `dev` with PR gating and safety checks.

### Changed
- Integration flow routes topic branches into `dev` via Pull Request; direct pushes to `dev` and `main` are blocked.
- Pull requests targeting `main` must originate from `dev`.
