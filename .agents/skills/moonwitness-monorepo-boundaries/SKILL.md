---
name: moonwitness-monorepo-boundaries
description: Route MoonWitness XV changes to the existing owning app or package and check path-specific import boundaries before proposing code.
---

# MoonWitness XV package and ownership boundaries

Use when a change touches more than one package, introduces an import, or its data/API/UI owner is unclear. This is a manual orientation aid, not a task classifier, architecture validator, dependency checker, or authorization to implement.

## Start with the real owner

Read [BLUEPRINT](../../../BLUEPRINT.md), [app/runtime ownership](../../../docs/architecture/APPS.md), [the architecture index](../../../docs/architecture/README.md), [accepted ADRs](../../../docs/decisions/README.md), and the relevant package manifests. `TODO.md` remains the sole task/status register; check its scope and packet before editing. Preserve one owner for a domain or stored model and reuse the package's public exports instead of deep-importing another package's source or `dist`.

The implemented backend is `apps/radio` / `@moonwitness/radio`; accepted ADR-0001 names that same Fastify + MoonQL service as the future ARSY runtime, with physical rename still pending. It does not authorize another generic Hub. `apps/dock`, `apps/headquarters`, `tools/cockpit`, `apps/aigateway` and `apps/sentinel` are the established app/tooling directories. **`apps/skylink` has only the M38-07 health skeleton**; D18 provider messaging, store and operator UI are not implemented. Under ADR-0006 it is the one accepted bounded service besides the Hub and is explicitly *not* a second Hub — no identity, no model catalog, no graph, no publishing engine. ECHOLOG is a separate accepted D19 plan under ADR-0007, and it owns no tables. Recheck current manifests and architecture docs before relying on this map.

## Enforced import boundaries are path-specific

The current central ESLint configuration restricts:

- `drizzle-orm`, its subpaths, and `postgres` in all `apps/**/*.{ts,tsx}` and selected addon/package trees. Database/ORM ownership belongs to `@moonwitness/moonql`; feature addons declare models through its API. **Planned `packages/skylink-store` is the single accepted second SQL owner** (ADR-0006, `skylink` schema only); ECHOLOG owns no tables or SQL imports (ADR-0007). No third importer of `drizzle-orm`/`postgres` may appear, and M38 requires a guard test to enforce the closed set.
- Direct `fastify`, `drizzle-orm`, and `postgres` imports in `packages/moonql-*/src/**/*.{ts,tsx}`. Addons receive the MoonQL context/API; they do not own the server or driver.
- Node built-ins (`node:*`, `fs`, `path`, `crypto`, `os`, `http`) in `packages/core/src` and `packages/types/src`, which are browser-safe shared packages.
- `node:crypto` in apps and selected shared packages, reserving secret operations to the packages that own them (see the rule message and [security architecture](../../../docs/architecture/SECURITY.md)).

These are ESLint path patterns, not universal bans inferred from package names. Inspect the matching block for the exact target. A missing lint error does not approve a cross-owner import.

## Preserve existing architecture

- Use existing package APIs and declared workspace exports. A relative path that escapes an app/package boundary bypasses package ownership.
- Keep domain storage and writes in their owning service/package. A frontend projection is a consumer view, not a second source model; inspect the existing typed client/query path.
- For MoonQL addons, follow [ADR-0002](../../../docs/decisions/ADR-0002-additive-moonql-domains.md) and [M05-03](../../../docs/decisions/M05-03-addon-namespace-standards.md): declarative `defineAddon`/`defineModel`, namespace/reserved-path rules, a single Hub bootstrap, and central registration in `apps/radio/src/addons.ts` where authorized.
- For new runtime or domain ownership, API/schema changes, or boundary exceptions, stop and identify the responsible contract/owner. Do not add a parallel API, database, auth system, or duplicate domain implementation.

The result should name the owning package, public import path, matching ESLint boundary, and any owner decision needed. This skill adds no automated validation and cannot satisfy M29 task-classification or dependency-validation work.
