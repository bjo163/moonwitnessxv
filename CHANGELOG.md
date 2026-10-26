# Changelog

All notable changes to MoonWitness XV are recorded here. This private monorepo
uses [Semantic Versioning](https://semver.org/). Entries describe repository
releases; they do not imply that an application is deployed or publicly
available.

## [Unreleased]

### Added
- Release and changelog guidance in `docs/audit/M01-05-release-lifecycle.md`.
- Automated fast-forward promotion from verified `dev` to `main` without redundant checks or approval gates.
- Integration branch `dev` with PR gating and safety checks.

### Changed
- Streamlined CI pipeline to run verification exactly once on `dev` and eliminate duplicate gates on `main` and local hooks.
- Protected `main` with the required exact CI status check while preserving verified automatic fast-forward promotion.
