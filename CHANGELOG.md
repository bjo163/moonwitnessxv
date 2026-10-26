# Changelog

All notable changes to MoonWitness XV are recorded here. This private monorepo
uses [Semantic Versioning](https://semver.org/). Entries describe repository
releases; they do not imply that an application is deployed or publicly
available.

## [Unreleased]

### Added
- Release and changelog guidance in `docs/audit/M01-05-release-lifecycle.md`.

### Changed
- Repository integration is main-only: pull requests into `main` require the
  `Monorepo Verification & Safety Gates` check, with no required human approval
  and no bypass actors. Direct pushes, force-pushes, and deletion are blocked by
  the active `main-release-protection` ruleset.
- Removed the temporary `dev` branch, promotion job, and
  `dev-integration-protection` ruleset.
