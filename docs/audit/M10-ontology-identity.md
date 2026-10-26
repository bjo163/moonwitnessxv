# M10 — Ontology, alias and identity review (evidence)

- **Milestone**: M10 Ontology, alias and identity review
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `d539cee` plus the isolated M10 changes
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-ontology`, hub endpoints, Dock `/constellation`, PostgreSQL drill

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M10-01 | Separate `ACTOR`/`ENTITY`/`CHARACTER` kinds, aliases as per-entity claims, typed edges, and versioned identity on 6 models | `packages/moonql-ontology/src/index.ts`, `seed.ts`; `apps/radio/test/ontology.test.ts` test 1 |
| M10-02 | Identity changes only through a reviewer-approved candidate action with a temporal window; no destructive merger | `POST /ontology/merges/decide`; tests 2–3 |
| M10-03 | Source- and perspective-scoped typed edges; a claim is verified only with reviewer, reason and evidence | `POST /ontology/edges/register`; tests 1 and 4 |
| M10-04 | ZILL/ZIIL, THE BATTERIES/ALLAH and SHADOW workspace/character stay separate; negative decisions are preserved | Tests 1–2; seed `IR-001`–`IR-004` |
| M10-05 | Constellation is a read-only projection over canonical tables; Dock renders the backend graph ID and never computes its own | `GET /ontology/constellation`; test 5; Dock `/constellation` + 71-check drill |
| M10-06 | Splits restore the graph without deleting history; invalid temporal merges are refused; source lineage survives | Test 3; PG drill merge → split → edge flow |
| M10-07 | Admin conflict queue and reviewer evidence rubric; UNKNOWN may remain unresolved | `GET /ontology/conflicts`; test 4; `/constellation` rubric panel |

### Dashboard surface

- `/constellation` renders the graph identity (`graphId`, registry, read-only notice, canonical tables), counts, entities with kinds/perspectives/identity versions, aliases with `lang`/`dir`, typed edges with epistemic labels, identity decisions (candidate/active/superseded), the review rubric and the unresolved conflict queue.
- The page is server-rendered (`force-dynamic`), fetches one public projection, and renders **no form, input or button** — it cannot write.
- `CONSTELLATION` added to public navigation; the layout collapses at `max-width: 900px`; source links have `:focus-visible` styles; graph styles use design tokens only.

---

## 2. Seed provenance

| Field | Value |
|---|---|
| M02 decision | `moonwitnessxv@d539cee:docs/decisions/M02-01-disambiguation-registry.md`, SHA-256 `ee1836db96543f96cc88a1996a6a31cbc5cb099a82c07e3e0a8bc033fd6a3b95` |
| M09 review | `moonwitnessxv@d539cee:docs/audit/M09-unilex-terminology.md`, SHA-256 `a1aaf2376b245dacf2392039b59f1eda5f02c8006c0ed817701b6a16d83ad2da` |
| Empire registry | `empire-of-the-light@38354ff:data/unilex/terms.v0.1.json`, SHA-256 `8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772` |
| Vision | `moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06`, SHA-256 `7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb` |
| Scripture edition | D01 `quran_cairo_hafs`, provenance SHA-256 `c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912` |
| Seed volume | 5 sources · 8 entities · 7 aliases · 7 relations · 4 identity reviews · 3 review-log entries |

The seed is a bounded, reviewed baseline for the boundaries ratified in M02-01 and reviewed in M09. It is not a complete world graph and does not claim universal identity for any label.

---

## 3. Contracts and invariants

| Model | ACL | Purpose |
|---|---|---|
| `onto_sources` | `ADMIN_WRITE` | Source identity, citation, provenance and review status |
| `onto_entities` | `ADMIN_WRITE` | Stable ID, kind, perspective, labels, validity window, identity status/version |
| `onto_aliases` | `ADMIN_WRITE` | Surface claim scoped by language, script, direction and perspective |
| `onto_relations` | `ADMIN_WRITE` | Typed edge with source, perspective, epistemic status and reviewer |
| `onto_identity_reviews` | `ADMIN_FULL` | Append-only merge/reject/revoke decisions |
| `onto_review_log` | `ADMIN_FULL` | Append-only reviewer trail |

- Stable IDs match `^O[0-9]{3}$`, are immutable, and an entity can never be deleted.
- Every entity, alias and edge must reference a source. Edge registration accepts only sources whose status is `APPROVED_FOR_CITATION`.
- Alias direction is derived from the script (`Arab`/`Hebr` → `rtl`, `Latn`/`Grek` → `ltr`) and validated. An `ATTESTED` alias needs reviewer, reason and evidence in the same write.
- An edge is unique per `(source, target, relationType, perspective)`. `VERIFIED` needs reviewer, reason and evidence; `UNKNOWN`/`DISPUTED`/`ASSERTED` are never projected as verified.
- Identity reviews are append-only. Every non-`PENDING` decision needs reviewer, reason and evidence. `APPROVED_MERGE` needs an `effectiveFrom` inside both entities' validity windows; an open-ended merge cannot outlive a bounded entity. `REVOKED` requires an active merge; a plain `REJECTED` cannot be recorded over one.
- An approved merge updates entity status to `MERGED` and increments `identityVersion`, but never deletes or rewrites a referent. A split appends `REVOKED`, restores `REVIEWED`, increments the version again, and keeps both decisions plus the review log.
- `onto_identity_reviews` and `onto_review_log` are admin-only; the projection never exposes a write path.

---

## 4. Identity, graph and conflict policy

- The latest decision per pair wins. Only a latest `APPROVED_MERGE` opens an active merge window and unions components; a later `REVOKED` closes it.
- Components are computed with union-find over active merges. Node `componentId` is the smallest stable ID in the component.
- The graph ID is deterministic: SHA-256 over canonical arrays of nodes, aliases, edges and identity decisions, rendered as `gph_<16 hex>`. Any canonical change (including an alias status) changes the ID; repeated reads do not.
- The projection is read-only and derives from `onto_entities`, `onto_aliases`, `onto_relations` and `onto_identity_reviews`; it is not a second graph authority.
- The conflict queue contains: `UNKNOWN`/`DISPUTED` edges, the latest `PENDING` identity candidate, `CONTESTED` entities, and normalized alias collisions. A shared label never opens a merge.
- Evidence rubric: reviewer required, evidence required for every decision, automatic merge never, unresolved items allowed. Accepted evidence kinds are a pinned source document (commit + SHA-256), an edition provenance digest for a textual witness, and a reviewer record naming the evidence for a negative decision.
- `GET /ontology/conflicts` is admin-only (anonymous `401`). The public projection carries the same rubric and conflict list without any admin control.

---

## 5. Verification log

All commands run from the repository root unless noted; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonql-ontology build` | pass |
| `pnpm --filter @moonwitness/radio exec tsx --test test/ontology.test.ts` | 5 tests, 5 pass, 0 fail |
| `pnpm --filter @moonwitness/dock build` | pass; routes include `ƒ /constellation` |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-constellation-ui.tsx` | 71/71 checks pass |
| `PARITY_DATABASE_URL=… pnpm --filter @moonwitness/radio exec tsx --test test/ontology-pg.test.ts` | 1 test, pass, `moonql.engine === 'pg'`; rerun pass (idempotent cleanup) |
| `pnpm build` | pass (full root chain, including `moonql-ontology` and radio) |
| `pnpm build:web` | pass; headquarters and Dock builds, Dock routes include `ƒ /constellation` |
| `pnpm test` | 236 tests, 231 pass, 5 skipped, 0 fail |
| `pnpm gen:sdk:check` | pass — `moonql: generated SDK is up to date` (schema hash `0a97846a800aa4e9`) |
| `pnpm ui:check` | pass; 65 files, 0 violations |
| `pnpm exec eslint <M10 files>` | pass; 0 errors, 0 warnings |
| `pnpm verify` | blocked at `pnpm lint` by unrelated concurrent work in `packages/moonui/src/client/*` (untracked, not part of M10); every other stage passes individually and CI on the pushed commit is the combined gate |

### PostgreSQL vertical slice

Disposable container, isolated from the shared `moonwitness-db`:

```text
docker run -d --name mw-m10-pg -e POSTGRES_PASSWORD=postgres \
  -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres \
  pnpm --filter @moonwitness/radio exec tsx --test test/ontology-pg.test.ts
→ 1 test, 1 pass, 0 fail (moonql.engine === 'pg')
```

The drill asserts the seeded counts (5/8/7/7/4/3), the Arabic RTL alias after the SQL round-trip, the rejected ZILL/ZIIL identity, admin-only reviews/log/queue (`401`), the rubric, a temporal `APPROVED_MERGE` with `MERGED` entities and a changed graph ID, a `REVOKED` split that restores 8 components while keeping both decisions and the source lineage, an `UNKNOWN` edge projected as unresolved, a `VERIFIED` edge refused without evidence, and a verified edge persisted as a canonical SQL row. A second run passed with the same counts, proving the drill cleanup is idempotent.

Cleanup: `docker stop mw-m10-pg && docker rm mw-m10-pg`; container list count 0; port 55432 has no listener.

---

## 6. Limits / follow-ups

- UI verification is server-rendered markup plus CSS assertions; no browser session was left running (owner preference). Keyboard behaviour is covered by the absence of write controls and documented `:focus-visible` styles, not an automated browser run.
- The PG drill used a disposable database and a small fixture; it validates schema, joins, ACL, temporal guard and reviewer flow, not production volume.
- The Docker images were not rebuilt in this milestone. `Dockerfile`/`Dockerfile.web` now carry the ontology manifest and runtime `dist`, but a full `pnpm verify:docker` remains a separate deployment gate.
- The eight-entity seed is a reviewed boundary sample, not a complete ontology. Expanding it requires source-by-source review; this milestone is not a validation of any universal identity claim.
- CI verification is recorded after the M10 commit is pushed; see the revalidation note in `TODO.md`.
