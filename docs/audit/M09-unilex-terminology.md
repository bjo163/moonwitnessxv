# M09 — UNILEX and multilingual terminology (evidence)

- **Milestone**: M09 UNILEX and multilingual terminology
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `9fde13f` (the concurrent ecosystem commit carried the M09 addon, Terms Table and PG test); scaffold baseline `3178a4c`
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-unilex`, hub endpoints, generated SDK snapshot, Dock `/terms`, PostgreSQL drill

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M09-01 | 71 Empire concepts recovered as a pinned, versioned seed; XV addenda P030/P031 kept separate; registry explicitly "not a validated universal dictionary" | `packages/moonql-unilex/src/data/registry.ts`; `UNILEX_REGISTRY_META`; `apps/radio/test/unilex.test.ts` |
| M09-02 | Term/source/language/script/sense schema with context and editorial status on every term | 7 models and hooks in `packages/moonql-unilex/src/index.ts`; test 1 asserts source/context/status for every projected term |
| M09-03 | ALLAH/ARSY/ZILL and fictional senses stay separate; negative identity decisions preserved | Test 2: four approved `distinctFrom` edges; P004:P031 `REJECTED`/`NEAR` with reason |
| M09-04 | EXACT/NEAR/DIFFERENT review rules; resemblance never silently sameAs; reviewer + evidence required | `src/match.ts`, `POST /unilex/matches/review`; tests 2–3; anonymous POST 401 |
| M09-05 | Terms Table as a projection over the same tables, filtered by approved source and scope | `GET /unilex/terms`, `GET /unilex/term`; test 4; Dock `/terms` + `/terms/[stableId]` |
| M09-06 | Arabic/Hebrew/Greek input keeps diacritics, script and direction; transliteration is not identity | Test 5; `verify-terms-ui.tsx` 45/45 checks |
| M09-07 | Stable IDs immutable; term deprecation, successor and sense revision preserve the old sense with reviewer reasoning | Test 6; hooks reject stable-ID edits and incomplete deprecations; review log |

### Dashboard surface

- `/terms` renders the pinned registry notice, seed count, pin, path, raw SHA-256 and the XV addenda; filters by query, lane, sense scope, editorial status and source; paginates the projection.
- `/terms/[stableId]` renders forms with `lang`/`dir`, context-scoped senses (current and superseded), sources with citation/provenance/approval note, typed relations, identity reviews and the review log.
- Match preview compares two surfaces, shows normalization and script reasons, and states that **no relation is created** and **no identity is claimed**.
- `TERMS` added to public navigation; responsive layout collapses at `max-width: 900px`; links have visible `:focus-visible` styles.

---

## 2. Seed provenance and rights

| Field | Value |
|---|---|
| Pin | `bjo163/empire-of-the-light@38354ffff077d4ee1e17d40b39d86e41ce769817` |
| Path | `data/unilex/terms.v0.1.json` |
| Raw SHA-256 | `8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772` |
| Concepts | 71 Empire seed entries + 2 XV addenda (`P030`, `P031`) = 73 projected terms |
| Status | `PROPOSED_NOT_ADOPTED`; every term is `DRAFT_REVIEW` |
| Source | `empire-unilex-v0.1`, `APPROVED_FOR_CITATION` **for citation only** — not a dictionary authority |

The XV addenda cite the project vision at commit `e2f4562` with SHA-256
`7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb`, and carry an approval note separating them from the 71 pinned concepts. No external dictionary data was imported.

---

## 3. Contracts and invariants

| Model | ACL | Purpose |
|---|---|---|
| `unilex_sources` | `ADMIN_WRITE` | Source identity, citation, provenance and review status |
| `unilex_terms` | `ADMIN_WRITE` | Stable ID, lane, labels, definition, context, editorial status |
| `unilex_forms` | `ADMIN_WRITE` | Language, script, direction, headword, transliteration, normalized form |
| `unilex_senses` | `ADMIN_WRITE` | Context scope, definition, status, revision/deprecation history |
| `unilex_relations` | `ADMIN_WRITE` | Typed edges; `distinctFrom`/`exactMatch`/`closeMatch` reviewable |
| `unilex_match_reviews` | `ADMIN_FULL` | Pair classification and reviewer decision |
| `unilex_review_log` | `ADMIN_FULL` | Append-only reviewer trail |

- Stable IDs must match `^[USTP][0-9]{3}$` and are immutable; corrections use a new term plus a deprecation reason and successor.
- A term, form or sense must reference a source. The public projection excludes any term whose only source is not `APPROVED_FOR_CITATION`.
- Direction is derived from the script and enforced (`Arab`/`Hebr` → `rtl`, `Latn`/`Grek` → `ltr`); raw headwords keep diacritics, while a stored `normalized` form is used only for matching.
- An approved `exactMatch`/`closeMatch` requires reviewer, reason and evidence in the same write. `exactMatch` is refused when an approved `distinctFrom` already connects the pair.
- A revised sense keeps the old row (not current) and records `supersedesRef`, reviewer and reviewer note; a deprecated term must carry `deprecationReason` and may then name a successor.
- Match reviews and the review log stay admin-only; raw source text is never part of UNILEX (terms are metadata, not corpus bytes).

---

## 4. Matching policy

- `classifyMatch` compares surfaces only and always returns `requiresReview: true`, `identityClaimed: false`, `autoRelation: null`.
- Cross-script pairs are always `DIFFERENT`, including Arabic vs Latin transliteration ("transliteration is not identity").
- `NEAR` uses normalized Levenshtein similarity with a 0.75 threshold; normalization removes combining marks, tatweel and Arabic alef variants while keeping the raw form intact.
- The preview endpoint is read-only. Only `POST /unilex/matches/review` writes: it upserts the review, creates `exactMatch`/`closeMatch` for approvals, revokes the existing identity relation on `REJECTED`, and appends the review log.
- Projection search ranks matches by stable ID, labels, definitions, context and recorded forms. Ranking affects order only; it never creates or implies identity.

---

## 5. Verification log

All commands run from the repository root unless noted; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonql-unilex run build` | pass |
| `cd apps/radio && pnpm exec tsx --test test/unilex.test.ts` | 6 tests, 6 pass, 0 fail |
| `cd apps/radio && pnpm exec tsx --test test/unilex-pg.test.ts` (disposable PG) | 1 test, pass, `moonql.engine === 'pg'` |
| `pnpm test` | 230 tests, 226 pass, 4 skipped, 0 fail (skips: 2 parity without DB, corpus PG, UNILEX PG) |
| `pnpm verify` | pass: build → ui:check → lint → `gen:sdk:check` → test → build:web |
| `pnpm --filter @moonwitness/dock typecheck` | pass |
| `pnpm --filter @moonwitness/dock build` | pass; routes include `ƒ /terms` and `ƒ /terms/[stableId]` |
| `pnpm gen:sdk:check` | `moonql: generated SDK is up to date`; schema hash `e86eaa67aa9fd70b` |
| `pnpm ui:check` | pass; 62 files, 0 violations |
| `pnpm exec eslint <changed files>` | no findings |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-terms-ui.tsx` | 45/45 checks pass |

### PostgreSQL vertical slice

Disposable container, isolated from the shared `moonwitness-db`:

```text
docker run -d --name moonwitness-m09-unilex-pg \
  -e POSTGRES_USER=moon -e POSTGRES_PASSWORD=m09drill \
  -e POSTGRES_DB=moonwitness_m09 -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://moon:m09drill@127.0.0.1:55432/moonwitness_m09 \
  pnpm exec tsx --test test/unilex-pg.test.ts
→ 1 test, 1 pass, 0 fail (moonql.engine === 'pg')
```

The drill asserts the seeded counts, the Indonesian form and diacritic-bearing Arabic form after the SQL round-trip, an approved `distinctFrom` between P031 and P004, admin-only match reviews/review log (401), a cross-script `DIFFERENT` preview with no identity/relation, and an `APPROVED_EXACT` decision that persists as a typed `exactMatch` relation, a match review and a review-log row.

Direct SQL check:

```text
sources | terms | forms | senses | relations
      3 |    73 |   146 |     73 |        28

stable_id | lane      | editorial_status | registry_version
P004      | PROJECT   | DRAFT_REVIEW     | 0.1.0
P031      | PROJECT   | DRAFT_REVIEW     | xv-addendum-1
S001      | SCRIPTURE | DRAFT_REVIEW     | 0.1.0

relation_type | status        | count
distinctFrom  | APPROVED      | 4
distinctFrom  | SEED_PROPOSED | 1
inspiredBy    | SEED_PROPOSED | 2
relatedTo     | SEED_PROPOSED | 21
```

Cleanup: `docker rm -f moonwitness-m09-unilex-pg`; container list count 0; port 55432 has no listener.

---

## 6. Limits / follow-ups

- UI verification is server-rendered markup plus CSS assertions; no browser session was left running (owner preference). Keyboard behaviour is covered by native form controls and documented `:focus-visible` styles, not an automated browser run.
- The PG drill used a disposable database and a small fixture; it validates schema, joins, ACL and reviewer flow, not production volume.
- The Docker image was not rebuilt in this milestone. `Dockerfile`/`Dockerfile.web` now carry the unilex manifest, build sources and runtime `dist`, but the build-stage copy list predates the ecosystem apps added on main, so a full `pnpm verify:docker` remains a separate deployment gate.
- The 71-concept seed is a proposal. Promotion to an approved vocabulary needs source-by-source review and must not treat this milestone as validation.
- Local gates above were run on `9fde13f` plus the isolated evidence changes. CI on the final M09 head `77b96d0` passed ([run 40272393554](https://github.com/bjo163/moonwitnessxv/actions/runs/40272393554)) after declaring `typescript`/`@types/node` for the new `moonql-unilex` package, whose build had failed with `tsc: not found`.
