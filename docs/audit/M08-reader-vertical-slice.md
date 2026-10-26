# M08 — Source-first Corpus Reader (evidence)

- **Milestone**: M08 Source-first Corpus Reader
- **Status**: IMPLEMENTED AND DRILL-VERIFIED
- **Implementation commit**: `9a31351` (baseline `f517fb8`)
- **Date**: 2026-10-26
- **Scope**: hub API (`@moonwitness/moonql-corpus`, `apps/radio`), generated SDK, Dock `/reader`, PostgreSQL drill

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M08-01 | UI states: `available`, `absent`, `invalid`, `ambiguous`, `rights_blocked`; the Reader never composes or fills a verse | `apps/radio/test/corpus-reader.test.ts`; `apps/dock/scripts/verify-reader-ui.tsx` (absent/ambiguous checks) |
| M08-02 | Work, edition, publisher, original language, permission, license, source URI, provenance SHA, source date and retrieval time rendered as source identity | Reader test asserts QS 2:82 identity; SSR drill asserts provenance/source date are visible |
| M08-03 | Arabic (`lang="ar" dir="rtl"`, script note) and licensed parallel translations in separate sections with their own language tags | Reader test (Arabic + Kemenag text); SSR drill checks `lang`/`dir` and blocked row |
| M08-04 | Reproducible citation string (edition code, provenance, source date, retrieval) with a labelled copy button and optional edition selector | SSR drill checks `aria-label="Copy citation for QS 2:82"` and focusable `<pre tabindex="0">` |
| M08-05 | Negative behavior: absent/invalid citations, admin-only raw REST, rights-unknown edition and translation withheld | `corpus-reader.test.ts` (6 tests), `corpus-reviewer.test.ts`, PG drill |
| M08-06 | RTL, mobile breakpoint, labelled regions, keyboard focus styles | `apps/dock/scripts/verify-reader-ui.tsx` — 28 checks |
| M08-07 | API + PostgreSQL + Reader + Reviewer slice share one source identity | `corpus-reader-pg.test.ts` on real PG; `corpus-reviewer.test.ts` compares admin REST with public Reader |

### Rights invariant in the public projection

- `corpus_passages` and `corpus_translations` use `acl: ADMIN_FULL`; `corpusPassageOverview` uses `ADMIN_ONLY`. Generic REST never serves source bytes to anonymous callers (401).
- `GET /corpus/reader` is public and is the only text projection:
  - `state=available` only when the edition is `RIGHTS_EXACT_VERSION_CLEARED`.
  - Otherwise `state=rights_blocked`, `arabic: null`, translation text `null`, explicit `[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]`.
  - A translation is serialized only when **both** the edition and the translation row are cleared.
  - Several editions for one address return `state=ambiguous` with metadata-only candidates; the reader must pick `?edition=<code>`.
- Passage uniqueness is `(citationKey, editionRef)`, so the same address can exist in multiple editions without silent overwrites. The seeded translation resolves its passage id explicitly because `@model.field:value` refs only accept lower-case field names.

### Dock

- New `/reader` route with citation + optional edition form, `READER` navigation entry.
- Arabic block is `lang="ar" dir="rtl"`; translations carry `lang`; blocked text exposes a labelled `role="note"` placeholder.
- Citation `<pre>` is keyboard-focusable; the copy button has an accessible label and a `role="status"` live region.
- Responsive CSS collapses the two-column layout at `max-width: 900px`.

---

## 2. Verification log

All commands run from the repository root unless noted; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonql-corpus run build` | pass |
| `cd apps/radio && pnpm exec tsx --test test/corpus-ingestion.test.ts test/corpus-reader.test.ts` | 8 tests, 8 pass, 0 fail |
| `cd apps/radio && pnpm exec tsx --test test/corpus-reviewer.test.ts` | 1 test, pass (admin REST and Reader agree on edition, provenance, source URI, source date) |
| `pnpm test` | 215 tests, 212 pass, 3 skipped, 0 fail (skips: 2 parity tests without a DB, 1 PG Reader drill without `PARITY_DATABASE_URL`) |
| `pnpm --filter @moonwitness/radio build` | pass (`tsc -b`, includes the corpus project reference) |
| `pnpm --filter @moonwitness/dock typecheck` | pass |
| `pnpm --filter @moonwitness/dock build` | pass; route table lists `ƒ /reader` |
| `pnpm gen:sdk:check` | `moonql: generated SDK is up to date`; schema hash `1fa620155ba520bf` |
| `pnpm exec eslint <changed files>` | no findings |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-reader-ui.tsx` | 28/28 checks pass |

### PostgreSQL vertical slice (M08-07)

Disposable container, isolated from the shared `moonwitness-db`:

```text
docker run -d --name moonwitness-m08-reader-pg \
  -e POSTGRES_USER=moon -e POSTGRES_PASSWORD=m08drill \
  -e POSTGRES_DB=moonwitness_m08 -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://moon:m08drill@127.0.0.1:55432/moonwitness_m08 \
  pnpm exec tsx --test test/corpus-reader-pg.test.ts
→ 1 test, 1 pass, 0 fail (moonql.engine === 'pg')
```

The test asserts the available slice (metadata, provenance, Arabic, Kemenag translation), admin-only raw REST (401), an inserted `RIGHTS_UNKNOWN` edition staying metadata-only (no private bytes in the HTTP body), and `QS 99:1` returning `absent`.

Direct SQL check of the four-tier identity:

```text
work                | edition          | rights_status                 | version      | citation_key | surah | ayah | lang | translator | translation_rights
Al-Qur'an al-Karim  | quran_cairo_hafs | RIGHTS_EXACT_VERSION_CLEARED | c0a8f1e72b4d | QS 2:82      | 2     | 82   | id   | Kemenag RI | RIGHTS_EXACT_VERSION_CLEARED
(1 row; works=1 editions=1 passages=1 translations=1)
```

Cleanup: `docker rm -f moonwitness-m08-reader-pg`; container list count 0; port 55432 free.

---

## 3. Limits / follow-ups

- UI verification is build + server-render markup + CSS assertions; no browser session was left running (owner preference). Keyboard behavior is covered by native form controls, focusable citation block and documented `:focus-visible` styles, not by an automated browser.
- The PG drill used a disposable database; it validates schema, join and rights behavior, not production data volume.
- Docker images were not rebuilt in this milestone; the Dockerfiles now include the corpus manifest and runtime `dist` needed by the hub.
- CI evidence: [run 40265719999](https://github.com/bjo163/moonwitnessxv/actions/runs/40265719999) on `61cc3ef` — success; local gates above are from the same tree.
