# ADR-0001 — ARSY is the MoonWitness XV application hub

- **Date:** 2026-10-26 (Asia/Jakarta)
- **Status:** ACCEPTED naming/ownership; in-place app/package move and M28-13/M28-14 compatibility evidence are recorded at exact source SHA `dbc5f01`; live deployment compatibility remains OPEN under M28-15.
- **Repository of record:** `bjo163/moonwitnessxv`; development is on existing `dev`, with promotion after verification.
- **Requested by:** project owner in conversation: "Agar ARSY itu adalah radio ... radio tidak relevan soalnya namanya ... tolong di update lagi."
- **Scope:** application naming, logical ownership, compatibility, and migration acceptance; not the theological referent al-'Arsh, nor an AI authority.

## Decision

**The Fastify + MoonQL + plugin + channel + API service is the single ARSY Hub.** The current dev tree contains its in-place move to `apps/arsy` / `@moonwitness/arsy`; legacy `apps/radio` references describe the previous source path. Radio-specific streaming and stations remain a *bounded module/domain* within the same Hub.

### Single target identity and ownership

| Layer | Current dev implementation/state | **Accepted identity / invariant** |
|---|---|---|
| App conceptual name | Radio Hub / radio API | **ARSY — MoonWitness Application & Orchestration Hub** |
| Workspace directory | **`apps/arsy`** | **`apps/arsy`** — one Hub; no parallel `apps/radio` service |
| Package identifier | **`@moonwitness/arsy`** | **`@moonwitness/arsy`** — same service/package owner |
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

The existing Hub was moved in place to `apps/arsy` / `@moonwitness/arsy` in the current dev tree. It remains the single general-purpose backend and Radio stays a bounded domain. Reusing this one Hub avoids competing API/data ownership and duplicate bootstraps. M28-13/M28-14 compatibility, integration and rollback evidence is recorded at exact source SHA `dbc5f01`; M28-15 live deployment compatibility proof remains open. Directory presence and local runtime drills do not certify production readiness.

Do **not** create a separate `apps/arsy` service alongside an `apps/radio` production Hub. The in-place path/package move is present in dev; the exact-SHA integration and rollback rehearsal is recorded, and M28-15 must still verify the actual deployment while ensuring only one Hub runtime remains.

## Migration surfaces and current compatibility contract

1. `apps/arsy` and `@moonwitness/arsy` are the canonical app/package; root scripts, lockfile, Dockerfiles and package imports use that path.
2. Compose names the service `arsy`, and deliberately retains internal DNS alias `radio` for Dock and Headquarters consumers during the compatibility window.
3. `ARSY_PORT`, `ARSY_PREFIX`, `ARSY_TITLE` and `ARSY_API_URL` are preferred. `RADIO_*` and generic Hub aliases remain supported; conflicting values fail closed.
4. Port `3000`, `/api/v1`, station APIs and playback remain compatible. Radio is a domain inside the Hub, not another backend.
5. **No database table rename merely because the Hub package is named ARSY.** Migrations require separate approval and real restore proof.

## Remaining deployment acceptance — **tracked as M28-15 in TODO**

The in-place move, app integration, Docker/runtime checks and local rollback are recorded at source `dbc5f01`; see the [operator handoff](../runbook-arsy-migration.md) and [M28-06 audit](../audit/M28-06-e2e-rollback-dbc5f01.md). M28-15 must verify the actual target environment and record its deployed source/image identity, service/DNS/API compatibility, authorized and denied behavior, health/routes and reviewed rollback. Do not infer these results from local images or CI.

**Release blocker:** the path/package move exists in dev and M28-13/M28-14 exact-SHA evidence is recorded, but full M28 deployment acceptance is **not complete** until M28-15. Never claim production deployed without deployment evidence. Describe ARSY as the single Hub; the `dbc5f01` runtime rehearsal is not a production deployment.

## Explicit non-goals

- Renaming the `bjo163/moonwitnessxv` repository.
- Removing real Radio/Signal functions and data.
- Renaming station API paths or database tables for visual consistency.
- Moving to a second Fastify backend, graph DB, or entirely new ORM.
- Turning ARSY into a claim about Allah, al-'Arsh, religious command, cosmic control or autonomous omniscient AI.
- Renaming Dock/Headquarters merely to match a future color scheme.
- Force-pushing or adding new branches/issues contrary to owner preference.

## Reconciliation with prior documents

Earlier snapshots correctly record the original `apps/radio` implementation. The current dev tree contains the in-place path/package move; M28-13/M28-14 evidence is recorded at `dbc5f01` and live deployment compatibility remains open under M28-15. Do not rewrite historical snapshots or infer production readiness from the move. [BLUEPRINT.md](../../BLUEPRINT.md) defines architecture and [TODO.md](../../TODO.md) owns M28 task status.

**Decision:** ACCEPTED naming/ownership. **Implementation:** in-place app/package move present in dev. **Integration/rollback evidence:** recorded at exact source SHA `dbc5f01`. **Live deployment evidence:** incomplete; M28-15 remains open.
