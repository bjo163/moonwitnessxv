# ADR-0001 — ARSY is the MoonWitness XV application hub

- **Date:** 2026-10-26 (Asia/Jakarta)
- **Status:** **ACCEPTED: product/domain naming and migration destination**; **IMPLEMENTATION PENDING**.
- **Repository of record:** `bjo163/moonwitnessxv` on its existing `main` branch.
- **Requested by:** project owner in conversation: "Agar ARSY itu adalah radio ... radio tidak relevan soalnya namanya ... tolong di update lagi."
- **Scope:** application naming, logical ownership, compatibility, and migration acceptance; not the theological referent al-'Arsh, nor an AI authority.

## Decision

**The Fastify + MoonQL + plugin + channel + API service currently named `apps/radio` / `@moonwitness/radio` IS the application runtime that will be named `ARSY`.** Radio-specific streaming and stations remain a *bounded module/domain* running within that hub, not the name of the entire Hub application.

### Single target identity and ownership

| Layer | Existing technical identifier (not yet renamed) | **Accepted target** |
|---|---|---|
| App conceptual name | Radio Hub / radio API | **ARSY — MoonWitness Application & Orchestration Hub** |
| Workspace directory | `apps/radio` | **`apps/arsy`** |
| Package identifier | `@moonwitness/radio` | **`@moonwitness/arsy`** |
| Fastify process | One shared radio-named backend | **One ARSY Fastify process** (same service, no duplicate API) |
| Docker Compose service | `radio` | **`arsy`** after alias/compatibility migration |
| Dev runner and logs | `radio` label | **`arsy`** label, optionally recognize old `radio` during migration |
| Hub API URL env | `RADIO_API_URL` and inherited `RADIO_*` aliases | **`ARSY_API_URL`** / preferred `ARSY_*` **only after compatible and tested rollout** |
| Hub port | `3000` | **Still `3000` by default**; not a breaking rename |
| REST prefix | `/api/v1` | **Still `/api/v1`**; preserve route contracts |
| Public docs / health | `/docs`, `/api/v1/health` | **No breaking change** |
| Radio domain | Station/schedule/playlog/listen/channel features | **`SIGNAL/RADIO` addon/domain**, keep IDs, paths, existing data |
| Public / Admin | Dock `:3001`, Headquarters `:3002` | Remain separate frontends consuming ARSY |

**Recommended architecture:**

```text
          MOONWITNESS XV / EMPIRE OF THE LIGHT
         +------------------------------------+
         |  DOCK  :3001   HEADQUARTERS :3002  |
         +---------------+--------------------+
                         |
                  ARSY HUB :3000
               Fastify · MoonQL · API
            auth · plugins · job workflows
                 |   |     |      |
             SIGNAL CORPUS ONTOLOGY RESEARCH ...
             (Radio)      (future gated modules)
```

**Radio remains useful** as a *radio/music/signal feature* and a regression-tested existing product. It is **not** appropriate as the general name for all future scripture, ontology, witness, Empire and research APIs. Do not delete Radio, its public Dock pages, `stations`, `schedule`, `playlog` or `listen` models.

**ARSY initially inherits only the capabilities already implemented by the existing Hub**. The historical "ARSY orchestrator" ideas (research compute, model task orchestration, approved AI agents, scheduler/governance, monitoring) are **future optional additions to ARSY**, not claims that the current process already implements them.

## Why this is the chosen decision

The existing `apps/radio/src/app.ts` boots MoonQL once, registers auth/base/stations/schedule/playlog/ops, generates REST and views, loads Fastify modules and channel handlers, and offers API discovery. It is already a general-purpose backend, despite its radio-named directory/package. Reusing it avoids competing DB/API ownership and redundant bootstraps. **ARSY names its central platform role accurately; Radio becomes its first implemented domain.**

Do **not** create a separate `apps/arsy` service alongside the existing `apps/radio` and leave two API/database authorities. The physical migration **moves/renames the existing backend**, ensuring only one Hub runtime remains.

## Actual dependency and compatibility impact (confirmed from XV source)

1. Root `package.json`: `build`, `start`, `dev:hub`, `test`, `gen:sdk`, `gen:sdk:check`, scripts and filters referencing `@moonwitness/radio`.
2. `apps/radio/package.json`: package identifier, scripts/test/globs/TS project references.
3. `pnpm-lock.yaml`: `apps/radio` workspace importer must be regenerated **by pnpm**; hand-editing a lockfile is risky.
4. `Dockerfile` and `Dockerfile.web`: both copy `apps/radio/package.json`; backend runtime also uses `apps/radio/dist/server.js`.
5. `docker-compose.yml`: service `radio`, `depends_on: radio`, internal DNS URL `http://radio:3000/api/v1`, Hub title and environment aliases.
6. `scripts/dev.mjs`: `radio` tag and package filter, `RADIO_PORT`.
7. `.env.example` and `apps/radio/test/env-contract.test.ts`: `RADIO_API_URL`, `RADIO_PORT`, `RADIO_PREFIX`, `RADIO_TITLE` and config keys. Existing `RADIO_*` remain documented compatibility aliases until deprecation is tested and approved.
8. `apps/radio/src/config.ts`, `app.ts` and associated tests: `RadioConfig`, `RADIO_ENV_KEYS`, old naming in documentation/markers.
9. Frontend server-side Hub URL wiring and workspace scripts/tests (Dock, Headquarters, SDK) must be inspected for old variable/service names.
10. Backup/runbook, metrics labels, service index, container naming, smoke tests and operational documentation may expose old names; preserve external API/data contracts.
11. **No database table rename merely because the hub package is renamed.** Migrations require separate approval and real restore proof.

## Compatibility migration sequence — **tracked only in TODO milestone M28**

1. **Inventory** all name dependencies, source HEAD and Radio baseline; capture old API/SDK/DB fixtures.
2. **Ratify the semantic boundary**: `ARSY` = runtime; `SIGNAL/RADIO` = functional domain; `100CENTER` = authorized operations UI; `SHADOW` = editorial UI.
3. **Move**, do not fork, `apps/radio` → `apps/arsy`. Rename package to `@moonwitness/arsy`; update imports, project references and tests with paths.
4. Update pnpm workspace import lock, package root filters, both Dockerfiles, Compose service, internal DNS with transition alias, scripts/dev runners and CI. Maintain old env names during rollout; new preferred env names resolve deterministically, never silently competing.
5. Update internal code symbols/logging/titles and docs while keeping radio-domain vocabulary in stations/schedules/player.
6. Validate `pnpm install --frozen-lockfile`, `pnpm verify`, `pnpm typecheck`, all Docker builds, PG test, SDK drift, REST/health/metrics, Hub index, Dock, HQ, Webhook/WA, Radio playback, 401/403 access, backups and rollback.
7. Verify deployment/compose network transition and recovery, document exact SHA, deprecation window/redirect plan, no duplicate Hub service, then mark migration tasks complete.

**Release blocker:** ARSY package/folder/service rename is **not completed** by this ADR or a README change. Never call the code migrated, tests green, or production deployed without executed verification at a source SHA. If the migration cannot be safely completed yet, UI/docs can say "**ARSY Hub (currently implemented as `apps/radio`)**".

## Explicit non-goals

- Renaming the `bjo163/moonwitnessxv` repository.
- Removing real Radio/Signal functions and data.
- Renaming station API paths or database tables for visual consistency.
- Moving to a second Fastify backend, graph DB, or entirely new ORM.
- Turning ARSY into a claim about Allah, al-'Arsh, religious command, cosmic control or autonomous omniscient AI.
- Renaming Dock/Headquarters merely to match a future color scheme.
- Force-pushing or adding new branches/issues contrary to owner preference.

## Reconciliation with prior documents

Earlier XV text said to keep `apps/radio` untouched and described ARSY as *proposed orchestration*. **The user has explicitly decided to adopt ARSY as the runtime name, superseding only that nomenclature advice.** Source/baseline snapshots may still correctly say `apps/radio`; don't rewrite history. The accepted new name is the **migration target**, not evidence that the current tree is already renamed. [BLUEPRINT.md](../../BLUEPRINT.md) defines architecture and [TODO.md](../../TODO.md) owns M28 tasks and status.

**Decision:** ACCEPTED naming/ownership. **Implementation:** NOT YET EXECUTED. **Test evidence:** NOT YET RUN for physical rename.