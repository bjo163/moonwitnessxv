# ADR-0012 — Isolated Empire Web static pilot

**Status: ACCEPTED — owner instruction, 29 October 2026 (WIB).** This decision permits the local and CI pilot delivered by PR #11. ADR-0011 remains authoritative for the canonical LIGHTHOUSE runtime: Dock.

## Context

The owner requested that the existing `apps/empire-web` implementation be merged into `dev` and previewed locally at port 3010. The request excludes Vercel deployment, production promotion, and DNS changes. The implementation is a static bilingual information pilot with no backend or private-data access.

## Decision

1. Keep `apps/empire-web` as an isolated static pilot workspace using MoonUI and the shared `id`/`en` locale convention. Register its local development port as 3010.
2. Keep Dock as the canonical LIGHTHOUSE runtime under ADR-0011. The pilot does not replace or re-route Dock, own identity or domain data, add an API, or publish private content.
3. Keep the pilot `noindex`. This decision authorizes repository integration and local/CI preview only. Vercel deployment, production promotion, custom-domain attachment, and DNS changes require separate explicit authorization and release review.
4. Preserve source rights, privacy, security, and publication gates. A static build or passing CI does not prove hosting, domain control, or release readiness.

## Rollback

Remove the `empire-web` entry from `scripts/apps.registry.mjs`, its `PORTS.empireWeb` assignment, the workspace, and the pilot documentation. Dock remains the canonical gateway.
