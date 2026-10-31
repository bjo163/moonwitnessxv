# Moonwitness


## MoonWitness XV — master program documents

**Low-context AI docs:** [Master Design](MASTER_DESIGN.md) · [Architecture](docs/architecture/README.md) · [AI execution contract](docs/planning/AI_EXECUTION_CONTRACT.md). Several milestone scopes remain planning-only. SKYLINK and ECHOLOG have bounded implementations with integration/release gates still open; ORBIT is accepted but planned; LUMEN architecture is accepted under ADR-0010 (M41) while implementation remains planned. Do not equate a directory or passing unit tests with production certification.


**Official XV planning flow:** [Master Vision Narrative](docs/vision/MASTER_VISION_NARRATIVE_XV.md) → [MASTER BLUEPRINT](BLUEPRINT.md) → [MASTER TODO / 52 milestones and 501 unique task IDs (2026-10-30 snapshot)](TODO.md). **New unified MoonWitness work belongs in this repository only.** Earlier MoonWitness, Corpus, A-L-L-A-H, Empire and Rocksoul repositories remain historical/source references or individually reviewed import candidates.

**LUMEN architecture (M41):** a TypeScript agent framework package plus an internal worker application is documented in [deep research](docs/research/LUMEN-framework-deep-research.md), [architecture](docs/architecture/LUMEN.md) and [accepted ADR-0010](docs/decisions/ADR-0010-lumen-agent-runtime.md). Architectural boundary accepted 27 October 2026; code/service creation remains planned under M41 gates. ARSY remains the only Hub and canonical run-state owner.

**Accepted naming decision:** ARSY is the single existing Fastify + MoonQL Hub. The in-place move to `apps/arsy` / `@moonwitness/arsy`, exact-SHA regression, app integration, Docker build and image rollback evidence are recorded at source SHA `dbc5f01`; operator handoff docs are tracked in M28-07 and live deployment compatibility proof remains M28-15. This is not production deployment certification. Radio stations/schedule/listening remain the **SIGNAL/RADIO** domain in the same service. No duplicate Fastify Hub is allowed; keep port 3000 and `/api/v1` compatible. See [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md), [ARSY operator handoff](docs/runbook-arsy-migration.md) and [M28](TODO.md#m28--arsy-hub-rename-and-compatibility-migration).

Current `dev` has ten established app workspaces under `apps/`: `arsy`, `dock`, `headquarters`, `aigateway`, `sentinel`, `skylink`, `echolog`, `orbit`, `empire-web` and `lumen-runtime` (an empty `apps/api` directory is not a package). The local technician Cockpit is tooling rather than a product surface, and lives in `tools/cockpit`. SKYLINK's bounded control plane/provider adapters exist but ARSY integration, operator UI and final end-to-end gates remain open (M38-12..14). ECHOLOG's filesystem content-addressed storage and bounded S3-compatible subset exist; its consumer UI and final end-to-end/rollback gates remain open (M39-11/12). ORBIT's frontend shell is **parked**: its code stays in `apps/orbit` but nothing spawns or deploys it (port 3007 retired), with M40 implementation gates open. `apps/lumen-runtime` is a scaffold with tests but **no dev server** (M41 planned). Corpus, ontology, comparative research, SHADOW, 100CENTER, World Monitor and Journey remain planned capability areas. Use TODO and exact-SHA evidence before claiming implementation or production readiness; rights, privacy, security and recovery gates remain mandatory.

Modular **TypeScript/pnpm** monorepo with ten app workspaces. The existence of a workspace does not imply production certification: ORBIT is parked (fixtures only when run manually), the LUMEN worker has no server, and no SKYLINK/ECHOLOG operator UI is shipped.

**Ecosystem direction (PLANNED, not deployed):** Empire of the Light / `a-l-l-a-h.com` Lighthouse experience (initially reuse Dock), Harbor community, SHADOW creative authoring, MoonLab research, WORKS commerce and a conditional HELIOGRID read-only energy operations app after calibrated pilot. Those proposed app surfaces share D00 auth, one ARSY/MoonQL Hub and global `id`/`en` UI conventions; SKYLINK is the bounded D18 service and ECHOLOG the bounded stateless D19 object service, neither a second Hub. See [Blueprint §2A](BLUEPRINT.md#2a--global-ecosystem-surfaces-and-implementation-reality-proposal-26-october-2026) and [Immediate Execution](TODO.md#immediate-execution--foundation--global-i18n--first-bilingual-public-release) for **planning**; service integration/release gates remain explicit.

**First delivery target:** existing Dock landing page in `/id` and `/en`; M19-09–18 record localized route, SEO, fallback, and accessibility evidence. Frozen Docker/Compose readiness and publication are still unverified; `pnpm verify` passing alone is **not** production Docker or public deployment evidence. ARSY's physical path/package rename is in place; deployment compatibility proof remains open under M28-15.

Current application surfaces and accepted planned targets:

| App | Port | Role |
|---|---|---|
| **ARSY Hub (`@moonwitness/arsy`)** | 3000 | Single Fastify + MoonQL API/ORM hub; exact-SHA compatibility, regression and rollback evidence recorded at `dbc5f01`; M28-07 handoff and M28-15 deployment proof remain open |
| **`@moonwitness/headquarters`** | 3002 | Admin command center (Next.js 16, RSC + server actions) |
| **`@moonwitness/dock`** | 3001 | Public homepage, station catalog and schedule (Next.js 16, RSC) |
| **`@moonwitness/cockpit`** | 3004 by default (local) | Developer Vite/React GUI + process supervision in `tools/cockpit`; not a public production admin |
| **`@moonwitness/aigateway`** | 3003 by default (internal) | Bounded model inference adapter; not an independent truth owner |
| **`@moonwitness/sentinel`** | Worker, no public HTTP port expected | Source-monitor ingestion/background tasks; not publication authority |
| **`@moonwitness/skylink`** (M38) | 3005 by default (local) | Bounded REST/WebSocket control plane and provider adapters; ARSY integration, operator UI and final e2e gates remain open; D18, not a second Hub |
| **`@moonwitness/echolog`** (M39) | 3006 by default (local) | Filesystem content-addressed storage and bounded S3-compatible subset; consumer UI/final e2e gates remain open; D19, no tables |
| **ORBIT** (M40; parked) | no HTTP port | Spatial frontend shell (3D plus accessible 2D); code kept in `apps/orbit` but not spawned, supervised or deployed; no backend/domain owner yet |
| **LUMEN Runtime** (M41; planned app) | no HTTP port | Internal worker paired with `@moonwitness/lumen`; no dev server, task API, database, identity or model-routing owner; ADR-0010 accepted |

Process, port and supervision assignment is defined once in `scripts/apps.registry.mjs`; run `pnpm apps` to print what the dev runner and the Cockpit actually cover. See [Dev processes](docs/architecture/DEV_PROCESSES.md).

The hub behind everything:

- **ARSY** — canonical identity of the existing central API/ORM/plugin runtime; path/package move and exact-SHA compatibility/rollback evidence are recorded, while deployment proof remains open (M28-15)
- **D20 ISP & Network Operations** — withdrawn 31 October 2026 by [ADR-0019](docs/decisions/ADR-0019-withdraw-isp-vertical.md); the domain, `apps/isp-radius` and `apps/isp-console` are removed and any existing `isp_*` tables are left orphaned
- **stations** — radio station management (CRUD)
- **moonql addons** — declarative ORM features (schedule, playlog, settings, auth, api keys, ops) with auto-REST, views and a metadata-driven Studio admin
- **channels** — outbound IM channels (WhatsApp first, add more as plugins); **target: served by [SKYLINK](docs/architecture/SKYLINK.md) (D18, ADR-0006), with these routes kept as an admin proxy**
- **denpa 電波** — simple inbound webhook: anyone transmits, radio catches the signal
- OpenAPI/Swagger docs generated from all route schemas

Neither frontend ever calls the hub from the browser: both are BFFs (route handlers
and server actions), so the admin token stays in an httpOnly cookie and CORS stays
exactly as it was. Clean, minimal, plugin-system driven, Docker-ready.

## Monorepo layout (pnpm workspaces + TS project references)

```
moonwitness/
├─ pnpm-workspace.yaml        # apps/* + packages/*
├─ tsconfig.base.json         # shared TS config (NodeNext, strict)
├─ Dockerfile                 # ARSY Hub (apps/arsy): multi-stage, one image
├─ Dockerfile.web             # dock / headquarters (ARG APP)
├─ docker-compose.yml         # db + ARSY Hub :3000 (legacy DNS alias radio) + dock :3001 + hq :3002
├─ docker-compose.db.yml      # Postgres only (pnpm db:up) for host-side development
├─ apps/
│  ├─ arsy/                   # canonical Hub path; exact-SHA regression/rollback passed, docs/deployment gates remain
│  │  └─ src/
│  │     ├─ server.ts · app.ts · config.ts · fastify.d.ts
│  │     ├─ lib/  channels.ts (Channel contract + ChannelManager) · types.ts (TypedModule) · loader.ts
│  │     ├─ tools/gen-sdk.ts  # registry → packages/moonql-client/src/generated.ts
│  │     ├─ channels/         # 👈 channel PLUGINS (one file each)
│  │     ├─ plugins/          # cors · envelope · error-handler · helmet · swagger
│  │     └─ modules/          # 👈 feature modules, auto-mounted at <prefix>/<folder>
│  │        ├─ health/ · channels/ · denpa/
│  │        └─ studio/        # Moonql Studio: zero-build admin rendered from /_schema
│  ├─ headquarters/           # @moonwitness/headquarters — command center (Next.js 16)
│  │  └─ src/{app,data,ui,layouts,lib}/  # LDD layers, see below
│  ├─ dock/                   # @moonwitness/dock — public site (Next.js 16)
│  │  └─ src/{app,data,ui,layouts,lib}/
│  ├─ skylink/                # @moonwitness/skylink — bounded D18 service; integration gates remain open
│  └─ echolog/                # @moonwitness/echolog — bounded stateless D19 object storage
└─ packages/
   ├─ core/                   # @moonwitness/core — httpError helpers, the envelope + the /_schema types
   ├─ moonql/                 # @moonwitness/moonql — the declarative ORM: descriptors → tables, repos, REST, views, bus, codegen
   ├─ moonql-client/          # @moonwitness/moonql-client — typed SDK (generated.ts from `pnpm gen:sdk`)
   ├─ moonui/                 # @moonwitness/moonui — shared design system (moon.css + server-safe components)
   ├─ moonql-stations/        # ADDON: stations + stationCatalog / genre+country charts
   ├─ moonql-auth/            # ADDON (base): users/sessions, /auth/login|logout|me, resolveUser, session-purge cron
   ├─ moonql-base/            # ADDON (base): COMPLETE ISO countries/currencies/languages as reference data
   ├─ moonql-schedule/        # ADDON: program slots + nowPlaying/weeklySchedule/upcoming views
   ├─ moonql-playlog/         # ADDON: listen events, topStations aggregate, public POST /listen beacon
   ├─ moonql-apikeys/         # ADDON (base): machine tokens, second resolveUser in the chain
   ├─ moonql-settings/        # ADDON (base): typed settings + uiSettings view
   ├─ moonql-ops/             # ADDON: audit trail, cron monitor, /ops/dashboard, /ops/stream (SSE)
   ├─ whatsapp/               # @moonwitness/whatsapp — Baileys MD client (+ optional Fastify plugin)
   ├─ denpa/                  # @moonwitness/denpa — 電波: simple inbound webhook receiver
   ├─ skylink-core/           # @moonwitness/skylink-core — M38-07 message/provider contract types only
```

**Current M38 layout:** `apps/skylink`, `packages/skylink-core`, `packages/skylink-store`, `packages/skylink-whatsapp` and `packages/skylink-telegram` exist in `dev`. Provider/control-plane implementation is present; M38-12..14 ARSY integration, operator UI and end-to-end/release evidence remain open. See [SKYLINK architecture](docs/architecture/SKYLINK.md).

**Current M39 layout:** `apps/echolog` and `packages/echolog-core` exist in `dev`. ECHOLOG is stateless by design and owns no tables; the accepted SQL-owner set remains bounded to the existing MoonQL and SKYLINK-store owners. M39-11/12 UI, e2e and rollback gates remain open. See [ECHOLOG architecture](docs/architecture/ECHOLOG.md).

## Requirements

- Node 24 LTS (`>=24 <25`) · pnpm 10 (`corepack enable`)

## Getting started

```bash
cp .env.example .env      # optional; typed defaults exist
pnpm install
pnpm dev                  # ALL three: hub :3000 + HQ :3002 + dock :3001
pnpm dev:hub              # just the API/ORM hub
pnpm build && pnpm start  # compiled hub
pnpm test                 # 101 tests via fastify.inject (no ports needed)
pnpm verify               # build + SDK drift + tests + both Next builds
pnpm verify:docker        # the three production images (also proves compose can boot)
pnpm ports:free           # kill leftovers holding :3000/:3001/:3002
```

`pnpm dev` runs the three apps through `scripts/dev.mjs`: every line is prefixed with `radio | dock | hq`, and Ctrl+C kills the whole process tree (a plain `Stop-Process`/Ctrl+C on a raw `pnpm --parallel` run leaves the Next.js children bound to :3001/:3002, so the next start dies with `EADDRINUSE`). `pnpm ports:free` is the escape hatch for anything started outside that runner — it clears the three ports *and* the repo's leftover `--watch`/`next dev` processes, then waits until the ports are actually bindable again.

- API base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs` · OpenAPI JSON: `/docs/json`
- Command center: `http://localhost:3002` (login with the seeded admin)
- Public site: `http://localhost:3001`

> Dev tip: after editing `packages/*`, run `pnpm build` once (or
> `pnpm --filter @moonwitness/whatsapp dev` in a second terminal).

### App Factory (M05-17–M05-22)

Create a private workspace scaffold with `pnpm app:create <slug> [--variant worker|frontend] [--dry-run] [--locale id|en]`. Run `pnpm app:create --help` for current options. Use `--dry-run` first to review the exact file list without writing. The default `worker` is an internal package with no UI, public port, or database; `frontend` is a Vite/React internal UI inheriting the shared locale catalog and MoonUI. A generated workspace is a scaffold, not a production app: the factory does not create a new domain or data owner, register a service with the runtime supervisor, add Docker/Compose routing, or claim a public domain. Add those integrations only through their owning app and approved architecture task; do not duplicate an existing app or domain.

Reproduce the current disposable workspace validation from the repository root with `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs`. It generates one frontend and one worker in a temporary fixture, checks workspace lock resolution and frozen install, runs generated-app typechecks/builds/tests/lint, and rejects a traversal slug without writing an app. The fixture is removed on exit. Focused contract tests are available with `pnpm exec node --test test/app-factory/app-create.test.mjs test/app-factory/container-mapping.test.mjs test/app-factory/registry-coverage.test.mjs`.

Rollback a deliberately generated but uncommitted scaffold only after reviewing its diff and confirming that `apps/<slug>/` contains only that generated app and no follow-on work: remove that directory alone. The generator refuses an existing destination and does not rewrite the root lockfile, app registry, domain configuration, or shared packages. If other work has since been added under that directory, preserve it and resolve ownership before removing anything. Roll back committed integration by reverting only the reviewed task changes after checking dependents; do not use a broad workspace reset.

## REST endpoints (all in one app)

### Response contract — ONE envelope for everything

Every JSON response is wrapped centrally by `plugins/envelope.ts` (routes just
return data or throw; zero per-route formatting):

```jsonc
// success (any 2xx)
{ "ok": true, "data": <whatever the route returned>, "timestamp": "ISO" }

// failure (4xx/5xx, incl. validation, 404, 503 offline channel…)
{ "ok": false, "error": { "statusCode": 404, "message": "Station not found", "details": <optional validation> }, "timestamp": "ISO" }
```

`/docs*` (OpenAPI spec + Swagger UI) is deliberately not wrapped.

### Stations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/stations` | list stations (public) |
| POST | `/api/v1/stations` | create station — **admin** |
| GET | `/api/v1/stations/:id` | one station (public) |
| PATCH / DELETE | `/api/v1/stations/:id` | update / delete — **admin** |

Every REST model declares its own `acl` (reads public, writes `['admin']`); a model
that forgets is reported at boot by `MOONQL_ACL_POLICY` (and the build fails with
`require`, which is what the compose stack runs).

### Objects & attachments (moving to ECHOLOG)

> **Current bounded implementation ([ADR-0007](docs/decisions/ADR-0007-echolog-storage.md), [ECHOLOG contract](docs/architecture/ECHOLOG.md)):** `@moonwitness/echolog` currently implements filesystem-backed content-addressed objects and a limited S3-compatible subset on its configured service port. Consumers should store object references only; bytes do not enter Postgres. Consumer UI and final e2e/rollback evidence remain open, and this is not full AWS S3 compatibility.

### Channels (IM — moving to SKYLINK)

> **Current bounded implementation ([ADR-0006](docs/decisions/ADR-0006-skylink-communication-surface.md), [SKYLINK contract](docs/architecture/SKYLINK.md)):** multi-provider messaging control belongs to `@moonwitness/skylink` on its internal service boundary (D18). ARSY's existing channel routes remain compatibility/admin-proxy surfaces until M38-12..14 integration and release checks are complete.

Admin-only: these routes can pair, unpair and **send as the operator**, and
`detail.qr` is the live pairing code, so the whole group sits behind `['admin']`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/channels` | list channels + live status |
| GET | `/api/v1/channels/:id` | one channel status (QR in `detail.qr`) |
| POST | `/api/v1/channels/:id/start` · `/logout` | lifecycle |
| POST | `/api/v1/channels/:id/send` | send via one channel `{to,text}` |
| POST | `/api/v1/channels/broadcast` | send to **all** channels at once |

### DENPA 電波 (inbound webhook)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/denpa` | receive a transmission (any JSON) → `202` |
| GET | `/api/v1/denpa` | recent transmissions (newest-first, `?limit=`) |
| GET | `/api/v1/denpa/:id` | one transmission by id |

A token is **required**: `DENPA_ENABLED=true` with an empty `DENPA_TOKEN` is
refused at boot (it used to mount an open public writer). Senders must send the
header `x-denpa-key`; reads of collected transmissions are gated by the same key.

### Database — Postgres (with zero-config fallback)

Data access is owned entirely by **moonql**: set `DATABASE_URL` → postgres engine
(migrations + additive schema auto-sync at boot), leave it empty → in-memory engine
(identical semantics, so dev and tests need no database at all).

Two compose files, two jobs:

| File | Starts | Command |
|---|---|---|
| `docker-compose.db.yml` | **Postgres only** (127.0.0.1:5432, healthchecked) | `pnpm db:up` · `pnpm db:down` |
| `docker-compose.yml` | db + radio + headquarters + dock (built images) | `pnpm docker:up` |

The db-only file is what you want while the apps run on the host; both files share
the same `moonwitness_pgdata` volume, so data survives either way.

```bash
pnpm db:up        # Postgres 17 on 127.0.0.1:5432 (credentials from .env)
# .env needs the identity once, and the URL points at it:
#   POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB
#   DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB
pnpm dev          # hub :3000 + command center :3002 + dock :3001
pnpm db:studio    # browse data (drizzle-kit)
pnpm db:down
```

> Compose reads **no secrets from the tracked files**: `POSTGRES_USER/PASSWORD/DB`,
> `MOONQL_AUTH_ADMIN_PASSWORD` and friends are interpolated from `.env` and the
> stack refuses to start without them (`${VAR:?…}`). Port 5432 is published on
> loopback only, so the host toolchain connects while the internet cannot.

```bash
# transmit something
curl -X POST http://localhost:3000/api/v1/denpa \
  -H "Content-Type: application/json" -H "x-denpa-key: $DENPA_TOKEN" \
  -d '{"station":"moon-fm","event":"shoutout","text":"on air!"}'
```

## Centralized by design (no duplication)

- **Responses**: one envelope (`plugins/envelope.ts` + `@moonwitness/core` types).
- **Errors**: one idiom — `httpError()/notFound()/…` from `@moonwitness/core`, used by
  apps *and* packages; the error-handler + envelope convert them into the response contract.
- **Typing**: `@fastify/type-provider-json-schema-to-ts` (`TypedModule` in `lib/types.ts`) —
  `request.body/params/query` are inferred from the route's JSON Schema. Casting is not needed.
- **Config**: everything parsed + validated once in `config.ts` with **zod** —
  invalid env fails fast at boot with one readable error.
- **Database**: wrapped ENTIRELY by **`@moonwitness/moonql`** — a declarative,
  Odoo-style ORM on top of Drizzle. Addons declare models with plain
  descriptors; moonql derives the pg table (+ uuid `id`, `created_at`,
  `updated_at`), validation/serialization schemas, the repository, hooks and
  optional auto-REST CRUD. No app imports `drizzle-orm`/`postgres` directly.
  Two engines behind one interface: **postgres** (with seeded drizzle
  migrations + additive schema auto-sync at boot) and **memory** (Map-based,
  identical semantics) so dev/tests need no database at all.

## Moonql addons — the standard format

**Every addon is a package: `packages/moonql-<name>` → `@moonwitness/moonql-<name>`, exporting exactly one
`defineAddon` object.** No fastify, no drizzle, no postgres imports inside an addon — ever.
This is the ENTIRE stations feature:

```ts
// packages/moonql-stations/src/index.ts
import { defineAddon, defineModel, bool, str } from '@moonwitness/moonql'

export default defineAddon({
  name: 'radio',
  models: {
    stations: defineModel({
      label: 'Station',              // -> "Station not found" error messages
      fields: {
        name: str({ maxLength: 120 }),
        streamUrl: str({ format: 'uri' }),
        genre: str({ maxLength: 60, null: true, index: true }),
        active: bool({ default: true }),
        statusLabel: computed({ type: 'string', get: (r) => (r.active ? 'live' : 'off') }),
      },
      unique: [['name']],            // -> 409 on violation, index in DDL
      rest: true,                    // -> full /api/v1/stations CRUD + OpenAPI
    }),
  },
})
```

### What the ORM base gives you ("punya apa saja?")

| Feature | Declaration | What moonql does |
|---|---|---|
| Tables + audit | any `defineModel` | drizzle pg table with uuid `id`, `created_at`, `updated_at` (+ `deleted_at` when soft) |
| Validation + docs | field descriptors (`str/int/bool/text/ts/sel/m2o`) | AJV body schemas, response serializers, OpenAPI — one source |
| Computed | `computed({ type, get })` | read-only value in every response; with `store: true` it becomes a real column, recomputed on write and filterable via `?where` |
| Private fields | `str({ private: true })` | writable, never serialized (passwordHash etc.) |
| Semantic checks | `str({ validate: (v) => v.includes('@') ? null : 'bad email' })` | 400 with your message |
| Uniqueness | `unique: [['login'], ['a','b']]` | pre-check 409 + `CREATE UNIQUE INDEX` (pg) |
| Soft delete | `delete: 'soft'` | DELETE stamps, everything filters, rows survive |
| Fixtures | `seed: [...] \| async (ctx) => [...]` | inserted once when the table is empty |
| Hooks | `hooks: { posts: { beforeCreate... } }` | mutate payloads, react after writes |
| Query language | — | `?where={"genre":"lofi","n":{"gte":5},"$or":[...]}` operators `eq ne gt gte lt lte in nin like`, `?order=-createdAt`, `?limit &offset`, `?total=true` → `x-total-count` |
| Relations | `m2o('users')`, `one2many('comments','postId')` | `?expand=authorRef,comments` → `authorRefRecord` / arrays |
| Access control | `acl: { list: 'auth', create: ['admin'], get: { row: (u, r) => r.ownerRef === u.id } }` | 401/403 role gates in preHandler + optional row-level rules in handlers |
| Views (projections) | `views: { nowPlaying: defineView({ from, select, where, aggregate }) }` | mounted read-only `GET /<view>` with own schema/ACL; `where` can be dynamic per request (`{ now }`); `aggregate` = GROUP BY (real SQL on pg, identical fold on memory) |
| Custom routes | `endpoints: { '/auth/login': { method, path?, body, handler } }` | mounted with validation + envelope; handler gets `{ body, user, orm, env, status, bus, engine, schema, signal }`; `path` lets several methods share one route; `stream: true` turns it into SSE |
| Identity | `provides: { resolveUser }` | ANY number of addons contribute — chained in dependency order, first match wins (sessions + api keys coexist) |
| Crons | `cron: [{ name, '1h', run: ({ orm }) => … }]` | armed at boot (`MOONQL_CRON_ENABLED`), overlap-guarded, stopped on close |
| Introspection | — | `GET /_schema` (default `auth`): pure-JSON contract of addons/models/views/endpoints/crons/menu incl. create/update/read schemas — no functions ever leak |
| Navigation | `menu` on models, views and endpoints | one sorted `menu` array in `/_schema`; every frontend maps it to its own routes |
| Observability | `observe?: (bus, ctx)` | react to `model.created/updated/deleted`, `cron.run`, `data.synced`, `seed.applied` |
| Engines | `DATABASE_URL` or not | postgres (migrations + additive auto-sync DDL incl. indexes) **or** memory — identical semantics, tests need no DB |

### Add a feature

1. New package `packages/moonql-<name>` with one `defineAddon` (+ optional `depends`, `views`, `endpoints`, `cron`, `hooks`).
2. One import line in `apps/arsy/src/addons.ts`.
3. Boot — moonql installs addons in dependency order, syncs the schema (CREATE TABLE / ADD COLUMN / CREATE [UNIQUE] INDEX only, never drops), seeds empty tables, arms crons and mounts routes + views. Done.

Row types are inferred: descriptors carry phantom types, so addon hooks get typed
`RowOf`/`CreateOf` without writing interfaces.

### View-driven: define data, get APIs and an admin

A view is a read-only projection over one model — the public face an addon
exposes, curated independently of the model's own ACL:

```ts
// packages/moonql-schedule/src/index.ts (excerpt)
views: {
  nowPlaying: defineView('nowPlaying', {
    from: 'schedule_slots',
    select: { title: 'title', host: 'host', station: 'stationRef' },   // rename + subset
    where: ({ now }) => ({                                              // re-evaluated per request
      weekday: DAYS[now.getUTCDay()],
      startMin: { lte: minutesOf(now) }, endMin: { gt: minutesOf(now) }, live: true,
    }),
  }),
  topStations: defineView('topStations', {                              // GROUP BY, real SQL on pg
    from: 'playlogs',
    aggregate: { groupBy: ['stationRef'], metrics: { plays: { fn: 'count' } } },
    order: '-plays',
  }),
}
```

Everything clients need is machine-readable: `GET /api/v1/_schema` (requires login)
returns addons, models (fields, constraints, ACL, create/update JSON Schemas),
views and endpoints — with functions structurally excluded. **Moonql Studio**
(`GET /api/v1/studio/`) is the in-your-face payoff: a single zero-build HTML
page that logs in, browses every model, renders tables and create-forms purely
from that contract. Demo-grade by design, but it proves the method: declare
your data + views once, and any frontend (admin, mobile, web) can render itself.

Note: list `?total` counts pre-row-rule rows (approximate when row rules are used);
aggregate views order/slice in memory over at most `view.limit` groups (default 200).

## Frontends: Layered Data-Driven (LDD)

Both Next apps use the same four layers (Vuexy-style layout discipline, but the
model drives everything):

| Layer | Folder | Contains | Rule |
|---|---|---|---|
| **Data** | `src/data/` | `sdk.ts`, `schema.ts`, `types.ts`, `queries/<domain>.ts`, `actions.ts` | the ONLY layer that calls the API/SDK |
| **UI** | `src/ui/` | `widgets/`, `fields/` (kind → widget), `components/`, `client/` | no fetching: props in → JSX out |
| **Layout** | `src/layouts/` | `vertical.tsx` (sidebar+navbar), `auth.tsx`, `site.tsx` | the shell only |
| **App** | `src/app/` | `page.tsx`, `route.ts` | thin: query → widget → layout |

Headquarters renders **entirely from `GET /_schema`**: the sidebar comes from
`menu`, tables from `fields`, forms from `createSchema`/`updateSchema` plus the
widget registry (`str→input`, `sel→select`, `m2o→relation select`, `bool→toggle`,
`int→number`, `ts→datetime-local`, `text→textarea`). No model is hardcoded.

## Generated SDK (schema → TypeScript, with a drift gate)

```bash
pnpm gen:sdk         # registry -> packages/moonql-client/src/generated.ts
pnpm gen:sdk:check   # fails when the committed file is stale
```

`generated.ts` is committed, so app builds never run the generator. It exports
`ModelName`/`ViewName`, `StationsRow`/`StationsCreate`/`StationsUpdate`,
`NowPlayingOutput`, `Rows`/`Creates`/`Updates`/`ViewOutputs`, `MODEL_NAMES`,
`VIEW_NAMES` and `ENDPOINTS`. Relations keep named interfaces
(`countryRefRecord?: CountriesRow | null`), enums become literal unions and
nullable fields become `| null`. A test compares the file byte-for-byte, so the
frontend can never drift from the ORM.

```ts
const client = createMoonClient({ baseUrl, token: readToken })
const page = await client.model('stations').list({ where: { genre: 'lofi' }, expand: ['countryRef'], total: true })
await client.view('nowPlaying').read()
await client.call('/listen', { method: 'POST', body: { stationRef: id } })
```

## moonql v5 primitives

| Primitive | Declaration | Payoff |
|---|---|---|
| `menu` | `menu: { group, icon, order }` on a model/view/endpoint | `GET /_schema` publishes a sorted `menu`; HQ's sidebar is generated, never hardcoded |
| `view.expand` | `expand: ['stationRef']` | the join travels with the view: `<key>Record` in every row, one request per page, no N+1 |
| `MoonBus` + `observe` | `observe: (bus, ctx) => bus.on('model.created', …)` | any addon reacts to ANY write (audit, metrics, webhooks) without touching the owner addon |
| `stream: true` | `endpoints: { live: { method: 'GET', stream: true, handler: async function* () { … } } }` | declarative SSE: framing, heartbeats and abort handling live in the framework |
| `EndpointCtx` | — | handlers now receive `bus`, `engine`, `schema()` (cached metadata) and `signal` (aborted on client disconnect) |

Listener isolation is part of the contract: a subscriber that throws only logs, the
write still succeeds.

## moonql-ops — audit, jobs, dashboard, live stream

`packages/moonql-ops` is the observability addon: it subscribes to the bus and
records every write in `ops_audit`, every cron tick in `ops_jobs` (a feedback guard
skips its own models), purges old audit rows daily (`OPS_AUDIT_RETENTION_DAYS`), and
exposes two admin endpoints:

- `GET /api/v1/ops/dashboard` — engine, uptime, addons, per-model counts + `dataTier`,
  views, crons with their last run, the 10 newest audit entries and job runs.
- `GET /api/v1/ops/stream?limit=&seconds=` — SSE over the bus (bounded queue,
  heartbeats, finite under `limit`). HQ proxies it at `/api/ops/stream`, so the
  browser never sees the token.

## Public listen beacon

`POST /api/v1/listen` is the one public write: `{ stationRef, event?, listener? }`
→ 201 and a new `playlogs` row. The dock's player calls its own `/api/listen`, so the
"most played" chart is fed by real listeners while the raw playlog model stays
admin-only.

### Base data & seed policy — no empty tables

Every addon ships default data, in two tiers (the Odoo `base` discipline, made mechanical):

| Tier | Declaration | Boot behavior |
|---|---|---|
| **reference** | `data: { rows, matchBy?, noupdate? }` | diff-synced EVERY boot: insert new, update changed (only the fields you author — user edits on other columns survive), **never deletes**. Matched by a natural unique key. |
| **demo/runtime** | `seed: [...] \| fn(ctx)` | inserted ONCE when the table is empty. `MOONQL_SEED_POLICY=warn` nudges below 10 rows. |
| **none** | `seedless: true` | honest opt-out for live-state stores (sessions, api keys). |

Selections that must be *complete* (countries!) are reference models, not `sel`
enums — `@moonwitness/moonql-base` ships the full ISO 3166-1 country list (248),
active ISO 4217 currencies and ISO 639-1 languages, linked with declarative
references right inside the data:

```ts
{ name: 'Indonesia', code: 'id', calling: '+62',
  currencyRef: '@currencies:idr', officialLang: '@languages:id' }
// '@model[.field]:value' resolves to the row id — here against the currencies
// table's unique `code`. Reference refs are strict (boot fails on typos);
// demo-seed refs are lenient (null + warn) so addons work standalone.
```

`MOONQL_SEED_POLICY`: `warn` (default) | `require` (boot fails listing REST models
without default data) | `off`. The policy also flags `sel` fields with >15
choices ("use a reference model") and `GET /_schema` publishes each model's
`dataTier` — Studio shows it as a badge.

Every table arrives populated: **36 real stations** (30 Indonesia, 6 international),
14 program slots covering the whole week (so `/api/v1/nowPlaying` is never empty),
12 play events, 10 settings — try `/api/v1/studio/` after login.

#### Seeded stations (36 — 1 off-air)

The Indonesian catalog is the focus: mainstream on-air stations across Jakarta,
Bandung, Surabaya, Semarang and Bali, next to the international picks.

| Station | Genre | Country |
|---|---|---|
| Prambors FM Jakarta | pop | Indonesia |
| Gen FM 98.7 Jakarta | pop | Indonesia |
| Hard Rock FM 87.6 Jakarta | rock | Indonesia |
| I-Radio 101.4 Jakarta | pop | Indonesia |
| Delta FM 99.1 Jakarta | pop | Indonesia |
| Female Radio 95.9 Jakarta | pop | Indonesia |
| Mustang FM 88.0 Jakarta | rock | Indonesia |
| Most FM 105.8 Jakarta | pop | Indonesia |
| JAK FM 101.0 Jakarta | pop | Indonesia |
| RDI 97.1 Jakarta | dangdut | Indonesia |
| PAS FM 92.4 Jakarta | news | Indonesia |
| RRI Pro 1 Jakarta 91.2 | news | Indonesia |
| RRI Pro 3 KBRN | news | Indonesia |
| Radio Rodja 756 AM | religious | Indonesia |
| Sonora FM 92 Jakarta | news | Indonesia |
| Elshinta FM Jakarta | news | Indonesia |
| Campursari FM Jakarta | dangdut | Indonesia |
| Mettaswara Dangdut | dangdut | Indonesia |
| Amandit 93.9 FM *(inactive)* | dangdut | Indonesia |
| Ardan Radio 105.9 Bandung | pop | Indonesia |
| Dahlia FM 101.5 Bandung | dangdut | Indonesia |
| K-Lite FM 107.1 Bandung | pop | Indonesia |
| Suara Surabaya FM 100.0 | news | Indonesia |
| Mercury FM 96.0 Surabaya | news | Indonesia |
| Suzana FM 91.3 Surabaya | pop | Indonesia |
| Wijaya FM 103.5 Surabaya | dangdut | Indonesia |
| Hard Rock FM 89.7 Surabaya | rock | Indonesia |
| Radio Idola 92.6 Semarang | news | Indonesia |
| Rasika FM 105.6 Semarang | pop | Indonesia |
| The Beat Radio Bali | electronic | Indonesia |
| SomaFM Groove Salad | electronic | United States |
| NTS Radio London | electronic | United Kingdom |
| FIP Paris | jazz | France |
| KEXP Seattle | indie | United States |
| WNYC New York | news | United States |
| NPO Radio 1 | news | Netherlands |

`streamUrl` values are the broadcasters' public endpoints, probed when they were
added. They are third-party URLs and can move at any time — re-check one with
`curl -sIL -m 6 <url>` (expect `audio/mpeg`, `audio/aac` or `audio/ogg`); if it is gone, point it
at the broadcaster's new endpoint or set `active: false` (that is exactly what
`stationCatalog` filters on).

### Base auth addon (`@moonwitness/moonql-auth`)

Built 100% on the primitives above — it is the reference "what can an addon do":

```bash
# login with the seeded admin (MOONQL_AUTH_ADMIN_PASSWORD, or random+logged once)
curl -X POST localhost:3000/api/v1/auth/login -H 'content-type: application/json' \
     -d '{"login":"admin","password":"moonwitness-admin"}'
# -> { "ok": true, "data": { "token": "…", "user": { … } } }

curl localhost:3000/api/v1/auth/me -H 'Authorization: Bearer <token>'
curl -X POST localhost:3000/api/v1/auth/logout -H 'Authorization: Bearer <token>'   # instant revocation
```

Opaque DB-session tokens (scrypt-hashed passwords, zero external deps). Any addon can now
protect models with `acl: { create: ['admin'] }` — the auth resolver fills `ctx.user`.
- **Storage choice**: moonql picks the pg vs memory engine once, in `bootMoonQl`.
- **Modules/plugins/channels**: three auto-discovery conventions via `lib/loader.ts`.

## The plugin system

Three extension points, all auto-discovered by `src/lib/loader.ts`:

1. **`plugins/*.ts`** — global setup, `export default` a plugin (use `fastify-plugin`
   when decorators must be shared app-wide). Loaded first, alphabetically.
2. **`modules/<name>/index.ts`** — feature routes, auto-mounted at
   `<API_PREFIX>/<name>`. Relative paths inherit the folder prefix.
3. **`channels/<name>.ts`** — IM channel plugins: `export default` a factory
   `(config) => Channel | null` (`null` = disabled). Registered into a
   `ChannelManager`; the `channels` module exposes them uniformly.

A `Channel` is a tiny contract: `id, label, status(), send({to,text})`, optional
`start/logout/shutdown()`. Add Telegram/Discord by dropping one file in `src/channels/`
+ a config slice — it instantly appears in `/channels`, `/channels/:id/*` and `/broadcast`.

## WhatsApp channel (Baileys MD)

- `WHATSAPP_ENABLED=true` turns the channel on; `WHATSAPP_AUTO_CONNECT=true`
  additionally connects it at boot (the pairing QR then lands in the server log).
- Session persists in `WHATSAPP_AUTH_DIR` — keep it on a volume in Docker.
- Pair (admin only, like every channel route): `POST /api/v1/channels/whatsapp/start`
  with an `authorization: Bearer <token>` → `GET` the same path → render `detail.qr`,
  scan it, state becomes `open`. Easiest from a browser: **Studio → Channels**,
  which already carries the token. Built-in `ping`/`help` bot responder.
- `packages/whatsapp` also exports a standalone Fastify plugin with its own
  `/status` `/qr` `/start` `/logout` `/send` routes. The hub does **not** mount it
  (that would expose pairing outside the channel guard) — use it only when you
  want WhatsApp as the whole app instead of one channel among many.

## Docker

Two compose files:

- **`docker-compose.db.yml`** — Postgres only, for local development while the apps
  run on the host (`pnpm db:up` / `pnpm db:down`).
- **`docker-compose.yml`** — the full stack: db + radio :3000 + dock :3001 +
  headquarters :3002, all built from this repo (`pnpm docker:up`).

```bash
pnpm db:up                       # just Postgres
pnpm docker:up                   # everything in containers
# or one image at a time
docker build -t moonwitness .
docker build -f Dockerfile.web --build-arg APP=dock --build-arg APP_PORT=3001 -t moonwitness-dock .
docker build -f Dockerfile.web --build-arg APP=headquarters --build-arg APP_PORT=3002 -t moonwitness-hq .
```

Both web images install without TypeScript (`next.config.mjs` is plain JS) and run
`next start` — no `output: 'standalone'`, which keeps pnpm workspace tracing out of
the picture. HQ talks to the hub over `RADIO_API_URL` (in compose: `http://arsy:3000/api/v1`).

The hub answers two probes: `GET /api/v1/health` (liveness — process + channel
count) and `GET /api/v1/health/ready` (**readiness** — runs `SELECT 1` with a
2 s timeout, `503` when the database is unreachable). Compose gates the frontends
on readiness, so a hub that booted against a dead database no longer looks healthy.

Docker checklist: create `.env` from `.env.example` (compose fails without
`POSTGRES_*` and `MOONQL_AUTH_ADMIN_PASSWORD`), then `pnpm db:up`,
`docker compose build`, `curl :3000/api/v1/health/ready`, `curl :3002/login`,
`curl :3001/`.

Production deploys from Git through Coolify — repository/branch, the full
service→port→domain table, the secret names, health probes, deploy and rollback
steps, and the behaviour that bites (profiles ignored, `default` aliases not
resolved, no redirects in compose domains) are in
[docs/runbook-coolify-deploy.md](docs/runbook-coolify-deploy.md).

## Conventions

- Shared contract lives in `@moonwitness/core`: envelope types, `PORTS` /
  `API_PREFIX` / `SITE_NAME` / `FRONTEND_URLS` / `SESSION_TTL_SECONDS` / `PAGE_SIZE`,
  the weekday+minute schedule helpers, and `displayLabel`/`cellText`. Neither
  frontend, addon or script re-declares them.
- One ACL vocabulary: `ADMIN_WRITE` / `ADMIN_FULL` from `@moonwitness/moonql` for
  models, `requireAdmin` (hub modules) and `can(meta, user, op)` (clients) for the
  same decision at the two other layers.
- BFF responses use `okJson` / `failJson` / `errorMessage` from
  `@moonwitness/moonql-client`, so a hub 400 never arrives as a generic 502.
- `.env.example` is a checked contract (`apps/arsy/test/env-contract.test.ts`):
  unknown or missing keys fail the test suite, and the template keeps placeholders
  instead of credentials.
- Unauthenticated entry points (`/auth/login`, `/listen`) are rate-limited per ip
  (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`); both also got explicit guards because
  they cost more than one cheap read per call.
- `packages/moonql-*` = addon (one `defineAddon`, no fastify/drizzle/postgres imports) ·
  `packages/moon*` = library (`core`, `moonui`, `moonql-client`) · `apps/*` = deployable.
- `src/data/**` is the only place that calls the API; `src/ui/**` never fetches.
- Casts (`as`) stay inside the framework boundary: moonql's runtime-schema routes,
the generated SDK and the thin query layer — never in components.
- One envelope for every JSON response, one error type (`MoonApiError` in the client),
one design system (`@moonwitness/moonui`), one `.env` at the repo root.
- The SDK is generated, not written: edit an addon → `pnpm gen:sdk` → commit.

## Notes

- `fastify.config` is typed and available everywhere; env-driven — see `.env.example`.
- Errors normalized centrally: deliberate errors (with `statusCode`) surface their
  message (`503` when WhatsApp offline, `401` bad denpa key…); unexpected ones → `500`.
- AJV `strictSchema: false` so OpenAPI keywords like `example` are allowed.
- `GET /` on the hub is a service index (engine, api, docs, health, studio, frontends).
- Studio (`/api/v1/studio/`) stays as the zero-build emergency console; Headquarters is
  the operator surface. Memory engine is the dev/demo default; set `DATABASE_URL` for pg.
