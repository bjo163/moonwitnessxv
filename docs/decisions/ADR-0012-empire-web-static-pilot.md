# ADR-0012 — Isolated Empire Web static pilot

**Status: ACCEPTED — owner instruction, 29 October 2026 (WIB).** This decision permits the local and CI pilot delivered by PR #11. ADR-0011 remains authoritative for the canonical LIGHTHOUSE runtime: Dock.

## Context

The owner requested that the existing `apps/empire-web` implementation be merged into `dev` and previewed locally at port 3010. The request excludes Vercel deployment, production promotion, and DNS changes. The implementation is a static bilingual information pilot with no backend or private-data access.

## Decision

1. Keep `apps/empire-web` as an isolated static pilot workspace using MoonUI and the shared `id`/`en` locale convention. Register its local development port as 3010.
2. Keep Dock as the canonical LIGHTHOUSE runtime under ADR-0011. The pilot does not replace or re-route Dock, own identity or domain data, add an API, or publish private content.
3. Keep the pilot `noindex`. This decision authorizes repository integration and local/CI preview only. Vercel deployment, production promotion, custom-domain attachment, and DNS changes require separate explicit authorization and release review.
4. Preserve source rights, privacy, security, and publication gates. A static build or passing CI does not prove hosting, domain control, or release readiness.

## Owner addendum — scoped production authorization (29 October 2026, Asia/Jakarta)

The project owner explicitly authorized an isolated production deployment of this static pilot to a **new Vercel project** connected to `bjo163/moonwitnessxv`, rooted at `apps/empire-web`, on the repository's promoted `main` branch. This does not change the canonical Dock/LIGHTHOUSE decision. It does not authorize modifying the pre-existing `empire-of-the-light` project, attaching a custom domain, changing DNS, enabling indexing, or publishing private PNG references or unreviewed editorial/source content. Retain `noindex, nofollow`; require the exact-SHA and live-route release evidence in [M42-02](../../TODO.md#m42--empire-story-universe-visual-implementation-and-isolated-vercel-release).

## Owner addendum — container deployment path (29 October 2026, Asia/Jakarta)

The project owner authorized packaging this pilot as an isolated container image and running it on the owner-operated Coolify host. `apps/empire-web` is therefore a service in `docker-compose.yml`, built by `Dockerfile.empire-web` as a static export (`output: 'export'`) served by nginx on the registered port 3010. This carries the same constraints as the Vercel addendum above: Dock remains the canonical LIGHTHOUSE runtime, the pilot stays `noindex, nofollow` (page metadata plus an edge `X-Robots-Tag`), and this addendum authorizes no backend, API, identity, database, analytics, custom domain, DNS change or indexing. The Vercel authorization is unchanged — either hosting path may serve the pilot, never as two index-able origins, and release evidence still belongs to [M42-02](../../TODO.md#m42--empire-story-universe-visual-implementation-and-isolated-vercel-release).

## Rollback

Remove the `empire-web` entry from `scripts/apps.registry.mjs`, its `PORTS.empireWeb` assignment, the workspace, and the pilot documentation. Dock remains the canonical gateway.
