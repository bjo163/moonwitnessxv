# M11 — Figure/Event registry and Prophetic Mission Table (evidence)

- **Milestone**: M11 Figure/Event and Prophetic Mission Table
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `fd7bf7f` (M11 code shipped with the ecosystem commit), planning baseline `8064ff6`
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-actors`, hub endpoints, Dock `/missions`, `/figures`, `/figures/[figureCode]`, PostgreSQL drill

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M11-01 | A sourced seed of prophetic figures, tradition-scoped roles and missions, each tied to an approved citation and a passage reference | `packages/moonql-actors/src/seed.ts`; `apps/radio/test/actors.test.ts` test 1 |
| M11-02 | Figures, historical events and creative avatars are separate records; an avatar is a disclosed pedagogical interface with `PEDAGOGICAL_ONLY` authority | Models `actor_figures` / `actor_events` / `actor_avatars`; tests 4–5 |
| M11-03 | Source-linked events carry a place with an accuracy label and a chronology confidence independent of verification | `actor_events`; `EVENT_SEED`; test 1 (`UNDATED`, `UNNAMED`) |
| M11-04 | The Prophetic Mission Table is a filtered read-only view over the Figure Registry — never a second prophet database | `GET /actors/missions`; `authority.viewOf = actor_figures`, `separateFigureTable: false`; test 2 |
| M11-05 | Competing tradition/source readings are grouped side by side with per-source citations and no merged doctrine | `GET /actors/figure?code=`; `competingReadings`, `mergedDoctrine: false`, `readingsNotice`; test 2; Dock detail drill |
| M11-06 | Shared names and roles never merge referents; a `VERIFIED` claim without reviewer + reason + evidence is refused; no rank field exists | Tests 3 and 4; `noExclusive.rankField: false` |
| M11-07 | The 25-avatar proposal is documented as pedagogy only, with no recovered names and no religious authority | `GET /actors/policy`; `AVATAR_POLICY`; test 5; `/missions` and `/figures/[code]` panels |

### Dashboard surface

- `/missions` — filterable mission table (`q`, tradition, figure, chronology confidence, page) with source citation, passage reference, epistemic label and an editorial interpretation note marked as such. A read-only panel names the canonical tables and states that no exclusive-mission or rank field exists.
- `/figures` — the registry: five seeded figures, kinds, attestations, roles, mission counts, per-figure reading counts, and the shared-name notice.
- `/figures/[figureCode]` — one figure with roles, competing readings grouped by tradition, source-linked events (place accuracy, chronology confidence), avatar policy and pinned provenance.
- All three pages are server-rendered (`force-dynamic`), fetch public projections only, and render **no write control**. `FIGURES` is added to public navigation; styles use MoonUI primitives and design tokens only.

---

## 2. Seed provenance

| Field | Value |
|---|---|
| Vision | `moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06`, SHA-256 `7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb` |
| Scripture edition | D01 `quran_cairo_hafs`, provenance SHA-256 `c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912` |
| Seed volume | 3 traditions · 2 locations · 5 figures · 7 roles · 6 missions · 5 events · 0 avatars |
| Traditions | `islamic-scripture` (`SCRIPTURE`), `project-reading` (`PROJECT`), `academic-historical` (`ACADEMIC`) |
| Figures | Nuh, Ibrahim, Musa, Isa, Muhammad — all `PROPHETIC_FIGURE`, `SOURCE_REPORTED`, `CANDIDATE` |

The seed is a bounded sample for the contracts, not a complete prophetic registry and not a claim of universal identity. Every seeded mission and role references the Qur'an edition `quran-cairo-hafs`; the one project reading (`ms_006`) cites the pinned vision and is marked with an editorial interpretation note. No figure carries an exclusive mission or a religious rank.

---

## 3. Contracts and invariants

| Model | ACL | Purpose |
|---|---|---|
| `actor_traditions` | `ADMIN_WRITE` | Tradition scope (`SCRIPTURE`/`PROJECT`/`ACADEMIC`) and source |
| `actor_locations` | `ADMIN_WRITE` | Place with accuracy (`NAMED`/`UNNAMED`) and source |
| `actor_figures` | `ADMIN_WRITE` | Figure registry record; labels are not unique |
| `actor_roles` | `ADMIN_WRITE` | Role claim scoped to figure, tradition and passage |
| `actor_missions` | `ADMIN_WRITE` | Mission claim scoped to figure and tradition; no rank/exclusive field |
| `actor_events` | `ADMIN_WRITE` | Source-linked event with place and chronology confidence |
| `actor_avatars` | `ADMIN_WRITE` | Pedagogical avatar proposal with disclosure and `PEDAGOGICAL_ONLY` authority |

- Codes are immutable and match `fg_###`, `rl_###`, `ms_###`, `ev_###`, `av_###`, `loc_###`. Content records are never deleted; a correction is a new reviewed state.
- Every figure, role, mission, event, location and avatar must reference an approved source on create. A mission cannot be moved to another figure or tradition, and a mission code cannot be rewritten.
- Passage references must match `qs:book:verse`, `ot:book:chapter:verse` or `nt:book:chapter:verse`; a mission without a valid reference is refused.
- A role or mission marked `VERIFIED` requires reviewer, reason and evidence in the same write (and on any later update). `ASSERTED`, `REPORTED`, `DISPUTED` and `UNKNOWN` are displayed with their own label and are never presented as verified.
- No model exposes `rank`, `exclusiveMission` or any equivalent field. The projection asserts `singleMissionField: false` and `rankField: false`, and the UI states that a figure may carry several missions and that no religious ranking exists.
- An avatar disclosure must contain `not the prophet`; `authorityStatus` is forced to `PEDAGOGICAL_ONLY`; a `REVIEWED` avatar additionally requires reviewer, reason and evidence. Avatar rows cannot be deleted.

---

## 4. Reading, chronology and identity policy

- The mission table is a filtered view over `actor_figures` and the seven actor tables. `authority.viewOf` is `actor_figures`, `view.separateFigureTable` is `false`, and no `actor_prophets` table exists.
- Readings are grouped by tradition and carry the source codes of their claims. A figure with claims in more than one tradition sets `competingReadings: true`; `mergedDoctrine` is always `false` and the reading notice states that nothing is merged into one doctrine.
- Chronology confidence is one of `UNDATED`, `REPORTED_DATE`, `DISPUTED_DATE`, `ATTESTED_DATE`. All seeded events are `UNDATED` with the label `Not dated by the source`; the UI states that confidence is not a verification of the event.
- A place the source does not name is stored as `UNNAMED` with the text `Place not named by the source`; the UI never invents a location. A named place keeps its region and source.
- Figure labels are not unique. The same name can exist as multiple rows (`fg_003`, `fg_900`, `fg_901` in the test) without any automatic merge; identity decisions remain the M10 reviewer flow, not a side effect of this table.
- The 25-avatar proposal is recorded as `PROPOSAL_ONLY_NOT_INTEGRATED`, `namesRecovered: false`, `seededNames: 0`, with five policy rules and a disclosure template. No avatar is seeded. An avatar is never the prophet and never new revelation.

---

## 5. Verification log

All commands run from the repository root unless noted; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonql-actors build` | pass |
| `pnpm --filter @moonwitness/radio exec tsx --test test/actors.test.ts` | 5 tests, 5 pass, 0 fail |
| `pnpm --filter @moonwitness/dock typecheck` | pass |
| `pnpm --filter @moonwitness/dock build` | pass; routes include `ƒ /missions`, `ƒ /figures`, `ƒ /figures/[figureCode]` |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-missions-ui.tsx` | 56/56 checks pass |
| `PARITY_DATABASE_URL=… pnpm --filter @moonwitness/radio exec tsx --test test/actors-pg.test.ts` | 1 test, pass, `moonql.engine === 'pg'`; second run pass (idempotent cleanup) |
| `pnpm build` | pass (full root chain, including `moonql-actors` and radio) |
| `pnpm build:web` | pass; Dock routes include the three M11 pages |
| `pnpm test` | 242 tests, 236 pass, 6 skipped, 0 fail |
| `pnpm gen:sdk` / `pnpm gen:sdk:check` | generated SDK up to date |
| `pnpm ui:check` | pass; 72 files, 0 violations |
| `pnpm exec eslint <M11 files>` | pass; 0 errors, 0 warnings |

### PostgreSQL vertical slice

Disposable container, isolated from the shared `moonwitness-db`:

```text
docker run -d --name mw-m11-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres \
  -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres \
  pnpm --filter @moonwitness/radio exec tsx --test test/actors-pg.test.ts
→ 1 test, 1 pass, 0 fail (moonql.engine === 'pg')
```

The drill asserts the seeded SQL counts (5 figures / 6 missions / 7 roles / 5 events / 0 avatars / 3 traditions / 2 locations), the view authority over `actor_figures`, the project-reading filter (`ms_006`), competing readings with per-tradition source codes, `UNDATED` events and the unnamed flood place, the avatar policy, public read with admin-only writes (`200` read, `401` anonymous write), a shared label kept as three SQL rows, refusal of a `VERIFIED` mission without review, persistence of a sourced `ASSERTED` mission, refusal to move a mission to another tradition or delete it, forced `PEDAGOGICAL_ONLY` avatar authority with disclosure, and read-only projections. A second run passed with the same counts, proving the drill cleanup is idempotent.

Cleanup: `docker stop mw-m11-pg`; container list count 0; port 55432 has no listener.

---

## 6. Limits / follow-ups

- UI verification is server-rendered markup plus CSS/UI-consistency assertions; no browser session was left running (owner preference). There are no interactive write controls by design, so keyboard behaviour is limited to navigation and filters.
- The PG drill used a disposable database and a small fixture; it validates schema, joins, ACL, review guards and read-only projection, not production volume.
- The Docker images were not rebuilt in this milestone. `Dockerfile`/`Dockerfile.web` carry the actors manifest and runtime `dist`, but `pnpm verify:docker` remains a separate deployment gate.
- The five-figure seed is a contract sample, not a complete or authoritative prophetic registry. Expansion requires source-by-source review; nothing here validates a universal identity or an exclusive mission.
- The 25-avatar proposal remains unintegrated and unseeded. Any future avatar work must keep the disclosure, the `PEDAGOGICAL_ONLY` authority and the ban on prophet impersonation.
