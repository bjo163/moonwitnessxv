# UI screen audit — screens 01 / 05 / 06 at `d54ad43`

**Scope:** `todo-ui.md` leaves **UI-P01a · UI-P05a · UI-P06a** (D1 audit only — routes, permissions, reusable components, data owner, differences from reference). No code changed, no checkbox ticked, no gate re-run.
**Rules:** [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) · **Blockers:** [register](ui-blocked-screens-8737fe4.md) · **Baseline audit:** [ui-baseline-8737fe4](ui-baseline-8737fe4.md) · **Prior evidence:** [ui-screens-evidence-38560d3](ui-screens-evidence-38560d3.md) · **Tasks:** [todo-ui.md](../../todo-ui.md)

## 0. Baseline recorded before reading anything

| Item | Observed at audit time |
|---|---|
| Branch | `dev` |
| HEAD | `76ecdc5` — **not** `d54ad43`; three commits have landed since (`d9fb23d`, `9514e25`, `76ecdc5`) |
| Working tree | **not** clean: `apps/echolog/package.json`, `apps/echolog/tsconfig.json`, `docs/architecture/ECHOLOG.md`, `packages/eslint-config/src/index.js`, `pnpm-lock.yaml`, `scripts/check-ui-consistency.mjs` modified; `apps/echolog/client/`, `apps/echolog/test/operator-client.test.ts`, `apps/echolog/vite.config.mjs`, `docs/audit/M39-11-operator-console-render.md` untracked (other agents' territory, untouched here) |
| audited paths vs `d54ad43` | `git diff --name-only d54ad43..HEAD` returns **zero** files under `apps/dock`, `packages/moonui` or `packages/moonql*`. Every path audited below is byte-identical to `d54ad43`, so the findings are the `d54ad43` baseline |
| `scripts/check-ui-consistency.mjs` | dirty in the tree, so it was read as the `d54ad43` blob (`git show d54ad43:…`), not the working copy |
| Commands actually run | read-only: `git rev-parse/log/diff/show/status`, file reads, `grep`, one `ls`. **No** test, typecheck, build, dev server or install was executed in this pass; gate results quoted in §6 are the prior cycle's records, not this baseline's |

## 1. How locale is actually applied (shared by all three screens)

`apps/dock/src/middleware.ts` is the only locale writer. Four distinct behaviours, all verified against the file and against `apps/dock/test/locale-routes.test.mjs`:

| Case | Lines | Behaviour |
|---|---|---|
| `/` | `29-43` | `resolveLocale({persistedLocale: mw_locale cookie, acceptLanguage})` → **307 redirect** to `/${locale}`, `Vary: Accept-Language`, `private, no-store` when a cookie exists; **404** if resolution fails (`:34`) |
| `/id…` `/en…` page | `44-59` | **rewrite** to the unprefixed pathname and inject `x-mw-locale`, `x-mw-route-path`, `x-mw-route-search` via `pageRequestHeaders` (`:97-104`), which *overwrites* any client-supplied value |
| `/fr`, `/id-ID`, `/en/api/…` | `45-53` | **404** — unsupported locale prefix never remaps; locale-prefixed `/api` is refused so the machine contract has exactly one unprefixed form |
| `/reader`, `/terms` (bare, no prefix) | `60-77` | **passthrough** — `NextResponse.next()` with the resolved locale header, *no redirect*. `locale-routes.test.mjs:93-97` asserts this explicitly ("unprefixed API and framework asset traffic keeps its original path") |

Consequence for the audit: bare paths are a **deliberate legacy surface**, not an accident, so a raw `href="/terms"` still renders — but it renders at a second URL whose locale comes from cookie/`Accept-Language`, not from the path. `apps/dock/src/lib/metadata.ts:65-87` then emits a localized `canonical` plus bidirectional hreflang alternates from the root layout (`apps/dock/src/app/layout.tsx:14-24`), which mitigates the SEO half of the problem but not the user-visible one.

Locale is **read** in only 14 of 24 pages. These 10 pages never read `DOCK_LOCALE_HEADER`, so they render English chrome even at `/id/...`:

`reader/page.tsx` · `reader/compare/page.tsx` · `terms/[stableId]/page.tsx` · `constellation/relations/[relationCode]/page.tsx` · `figures/[figureCode]/page.tsx` · `denpa/page.tsx` · `prisms/page.tsx` · `studio/page.tsx` · `timeline/page.tsx` · `embed/[id]/page.tsx`
(verified by scanning every `apps/dock/src/app/**/page.tsx` for the constant; `prisms`, `timeline`, `embed`, `reader/compare` additionally import no copy catalog at all).

## 2. Screen 01 — DOCK & LIGHTHOUSE (UI-P01a)

Reference: [`01_dock_lighthouse.svg`](../design/mockups-xv/01_dock_lighthouse.svg) · Owner: M19-09..19 / M31 · Code owner: `apps/dock`.

### 2.1 Actual routes

| Route (file) | Locale applied | What renders |
|---|---|---|
| `apps/dock/src/app/page.tsx:43-181` | `:44-46` reads `x-mw-locale`, `getLandingCopy(locale)` | two branches: `!payload.liveDataAvailable` → `OfflineLanding` + `SpaceGrid` (`:48-50`); live → `Hero`, `SpaceGrid`, `ZineFeatureTrio`, `CrewConstellation`, `ArchiveTimeline`, `ZineSkaPosterSection`, `#world-monitor` card (`:72-137`), `#signals` card (`:139-170`), `Player` |
| `/id` `/en` | redirect at `middleware.ts:36` | the same page; the canonical pair is emitted by `layout.tsx:14-24` |
| `api/on-air`, `api/now-playing`, `api/listen`, `api/denpa/transmit`, `api/stations/[id]/live-meta` | unprefixed only (`middleware.ts:61-62`; prefixed → 404 at `:51-53`) | machine endpoints, not screens |

Header/footer wrap every screen through `apps/dock/src/layouts/site.tsx:12-25` (`SiteHeader` → `main.dk-main` → `SiteFooter`).

### 2.2 Permissions / visibility

| Fact | Evidence |
|---|---|
| Dock holds **no database and no token**. The client is anonymous by construction | `apps/dock/src/data/sdk.ts:9-11` — `createServerSdk({ env: { RADIO_API_URL } })`, with the comment "no token: the dock only reads public views and posts the listen beacon" |
| Home therefore reaches only `public` endpoints and `view`s resolved inside ARSY | `apps/dock/src/data/queries/program.ts:52-70` (`Promise.all` over `nowPlaying`, `stationCatalog`, playlog aggregates, settings, signals) |
| The hub, not Dock, owns read eligibility: `corpusPassageOverview` is `ADMIN_ONLY`, so a leaked view name cannot widen text access from the browser | `packages/moonql-corpus/src/index.ts:213-227` |
| No Dock page implements its own authz; there is no session, cookie or role check anywhere in `apps/dock/src/app` | the only cookie Dock touches is the locale preference (`apps/dock/src/lib/locale-context.mjs:53-58`) |

Honest gap this audit must record: **`ADMIN_WRITE` guards writes, not reads.** `packages/moonql/src/model.ts:30-35` sets only `create/update/remove` to `['admin']` and leaves `list`/`get` at the `rest: true` default, i.e. public. Raw REST therefore exposes `research_cases` (`packages/moonql-research/src/index.ts:359-362`), `onto_entities` (`packages/moonql-ontology/src/index.ts:225-228`), `unilex_terms` (`packages/moonql-unilex/src/index.ts:503-506`), `graph_candidates`/`graph_releases`/`graph_adjacency` (`packages/moonql-graph/src/index.ts:70-73, 97-100, 136-139`) and all seven `actor_*` tables (`packages/moonql-actors/src/index.ts:202-331`). The review trails and corpus text are the exception — `onto_identity_reviews`/`onto_review_log` (`:294-297, 318-321`), `unilex_match_reviews`/`unilex_review_log` (`:595-598, 617-620`), `corpus_passages`/`corpus_translations` (`packages/moonql-corpus/src/index.ts:137-142, 172-175`) and `graph_release_pointer` (`packages/moonql-graph/src/index.ts:118-121`) are `ADMIN_FULL` (`model.ts:36-41`). This is exactly the standing warning in [`docs/architecture/SECURITY.md:2`](../architecture/SECURITY.md): "`ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection."

### 2.3 Reusable components

| MoonUI primitive | Used by screen 01 | Evidence |
|---|---|---|
| `Card`, `CardBody`, `Badge`, `Tape`, `LinkButton`, `Chevron`, `Crown`, `BrandLogo`, `ZineNote`, `LiveDot`, `Glyph`, `ChartList`, `ProgressBar`, `StationGrid` | yes | `app/page.tsx:1`, `shell.tsx:10`, `sections.tsx` header import list, `spaces.tsx:2-10` |
| `Panel`, `PageHeader`, `Breadcrumbs`, `Alert`, `EmptyState`, `Spinner`, `Skeleton`, `DataTable`, `Tabs`, `Field` | **not used on home** | home substitutes `Card`+`CardBody`+inline `style` and hand-built `div.dk-deck-header` (`page.tsx:73-84, 139-149`); `PageHeader` is reserved for sub-pages |
| Dock-local structure | `Hero`/`SiteHeader`/`SiteFooter` (`shell.tsx:101-498`), `SpaceCard`/`SpaceGrid` (`spaces.tsx:70-160`), `OfflineLanding` (`page.tsx:25-41`), eight section composites (`sections.tsx`) | ADR-0009 §2.4 keeps these in Dock until a second consumer |
| `@moonwitness/moonui/client` | `MtsTelemetryClock` only (`shell.tsx:11`) | |

Duplicated/ad-hoc patterns that should have reused MoonUI:
1. Signal cards re-implement a card with `border: '1px solid var(--m-border)'` + inline padding instead of `Card variant` (`page.tsx:93-133`).
2. Two "deck header" bands are hand-rolled with the same flex layout (`page.tsx:75-83` and `:141-149`) — a `PanelHeader`/`PageHeader`-sized primitive would cover both.
3. Number formatting is inconsistent: `page.tsx:126-128, 147` use `formatLocaleNumber`, but `shell.tsx:458, 461` interpolate `counts.stations` / `counts.countries` raw, so `/id` never gets Indonesian digit grouping in the hero stats.
4. `SiteHeader` writes its own `@media (max-width: 1040px)` block inside a `<style>` tag (`shell.tsx:315-327`) rather than relying on the token stylesheet.

### 2.4 Data owner (per panel)

| Panel on `/` | Query | Endpoint/view | Owning package | Owning tables |
|---|---|---|---|---|
| Hero counters + station grid + week grid | `program.ts:52` | `view stationCatalog`, `view nowPlaying`, `view weekSchedule`, `settings` | `packages/moonql-stations`, `moonql-playlog`, `moonql-schedule`, `moonql-settings` | `stations`, `playlogs`, `schedules`, `app_settings` |
| `#world-monitor` signals | `program.ts` signals leg | `view worldSignals` | `packages/moonql-monitor` (`src/index.ts:53, 167, 348` = `ADMIN_WRITE`) | monitor tables |
| `CrewConstellation` | counts from `program.ts` | same station view | stations | `stations` |
| `ZineSkaPosterSection`, `ArchiveTimeline` art strip | none | static arrays | none — **no data owner** | `ARCHIVE_SIGNALS` literal `sections.tsx:37-45`, seven `/art/archive-*.jpg` |

### 2.5 Differences from reference 01

Filtered through [ADR-0009 §2.2–2.3](../decisions/ADR-0009-public-ui-reference-adoption.md) — a rejected element is *not* a gap.

| Reference element (svg line) | Ships today | Classification |
|---|---|---|
| 12-entry left rail, active row filled pink (`:9`) | no rail; 15-entry header nav `shell.tsx:26-42` + breadcrumbs on sub-pages | **Rejected by ADR-0009 §2.2** (rail). Note the shipped nav is 15 labels, not the "3-link header" the stale comment at `layouts/site.tsx:11` still claims |
| `Search everything…` field (`:11`) | absent; header has an `SRC` button linking to `/stations` (`shell.tsx:216-223`) | **Rejected by §2.3** (no cross-surface query endpoint). The `SRC` label is a dead affordance candidate: it looks like search but is a station link |
| `01 / 12` counter (`:19`) and footer strip "…NO LIVE DATA" (`:18`) | absent; `SiteFooter` is the product footer | **Rejected by §2.3** |
| `CONCEPT · NOT LIVE` watermark (`:17`) | not on the hero; status words live in the space cards (`spaces.tsx:19`) | **Equivalent, different position** — honest-status rule satisfied by §2.5 wording rather than a badge |
| Hero: `LIGHTHOUSE / DOCK` + `EMPIRE OF THE LIGHT` + subtitle (`:14-16`) | `Hero` shows `MOONWITNESS` + `dk-eyebrow` + two-tone motto (`shell.tsx:412-434`), all localized via `getLandingCopy` | **Equivalent** |
| Panel `WELCOME TO THE XV OBSERVATORY` with `DIFFERENT PEOPLE. / SAME SKY. / MANY STORIES.` and `Discover • Read • Research • Create` (`:18`) | no observatory panel; the four-space grid is the entry taxonomy | **Difference** — the mockup's call-to-action verbs do not match the adopted READ/EXPLORE/CREATE/SIGNAL vocabulary; `Research` is a mockup verb with no public surface |
| Three feature tiles `SOURCE FIRST` / `CREATIVE UNIVERSE` / `SIGNAL / RADIO` (`:18`) | four `SpaceCard`s READ→`/reader` REAL, EXPLORE→`/terms` REAL, CREATE→`/studio` **DEMO**, SIGNAL→`/stations` REAL (`spaces.tsx:102-146`) | **Equivalent + one more**; every href is locale-built with `localizedDockHref` (`:113, 123, 133, 144`) and asserted to map to a real `page.tsx` by `test/space-grid.test.mjs` |
| Decorative waveform bars (`:18`) | not shipped | **Difference, intentional** |
| — | `/research` is marked `primary: true` in the nav (`shell.tsx:33`) while the page is a fail-closed notice (§3.2 of ADR-0009 honesty rule) | **Gap** — nav promises a surface that renders one Alert; not a mockup difference, a shipped inconsistency |
**Leaf mapping for screen 01:** the nav-vs-page honesty item and the two-tone hero are `UI-F11`-adjacent (already closed); the raw hrefs in `page.tsx:146` and `sections.tsx:131, 165, 205, 224, 285, 293, 479`, the untranslated blocks at `sections.tsx:255-261` and `shell.tsx:343-390`, and `SiteFooter` being mounted **without a locale** at `layouts/site.tsx:20` (defaulting to `en`, `shell.tsx:332`, so the footer CTA at `:365` always emits `/en/...`) all unblock **UI-F12**; absence of per-panel loading/empty/error on `#world-monitor` and `#signals` (both render only when the array is non-empty — `page.tsx:72, 137`) unblocks **UI-F10**.

## 3. Screen 05 — CORPUS READER (UI-P05a)

Reference: [`05_corpus_reader.svg`](../design/mockups-xv/05_corpus_reader.svg) · Owner: M08 / M19-19 / M19-31 · Code owner: `apps/dock`.

### 3.1 Actual routes

| Route | File | Locale | Notes |
|---|---|---|---|
| `/reader` | `app/reader/page.tsx:12-61` | **not read** | `searchParams` `citation` + `edition` (`:15`); default citation `QS 2:82` from `data/queries/reader.ts:3`; lookup is a plain GET form (`page.tsx:45-55`) |
| `/reader/compare` | `app/reader/compare/page.tsx:72-165` | **not read**, no params at all | **zero data-owner calls** — see §3.5 |
| No dynamic reader route exists | `find apps/dock/src/app/reader` → `page.tsx`, `compare/page.tsx` only | | so there is no per-citation deep link like `/reader/QS-2-82`; the only identity carrier is the query string |

### 3.2 Permissions / visibility — the veto is in the data owner, not in Dock

| Stage | Evidence | Behaviour |
|---|---|---|
| Endpoint admission | `packages/moonql-corpus/src/index.ts:235-236` | `path: '/corpus/reader'`, `requires: 'public'` — anyone may call it; the gate is the veto, not the route |
| Edition veto | `:294` `const editionCleared = meta.rightsStatus === CLEARED` with `CLEARED = 'RIGHTS_EXACT_VERSION_CLEARED'` (`:40`) | anything else is not cleared |
| Passage gate | `:332-336` | `arabic` is emitted **only** when `editionCleared && arabicText`, else `null` |
| Translation veto | `:300` `const cleared = editionCleared && row.rightsStatus === CLEARED` → `:307-308` `text: cleared ? … : null, blocked: !cleared` | a licensed translation cannot survive an uncleared edition |
| State word | `:329-330` | `state: editionCleared ? 'available' : 'rights_blocked'` plus a human message |
| Underlying tables are not publicly readable | `packages/moonql-corpus/src/index.ts:137-142, 172-175` (`corpus_passages`, `corpus_translations` = `ADMIN_FULL`) and `:213-216` (`corpusPassageOverview` view = `ADMIN_ONLY`) | the projection is the *only* text exit |
| Dock renderer | `apps/dock/src/ui/components/reader.tsx:124` `const withheld = result.state === 'rights_blocked'`, applied at `:160` (`!withheld && result.arabic`) and `:197` (`row.text && !withheld`), with the Alert at `:141` | defence in depth: Dock keys off `result.state`, so a projection that accidentally returned text would still be refused — the exact defect recorded as fixed in [prior evidence §"05"](ui-screens-evidence-38560d3.md) and asserted by `test/reader-rights.test.mjs:19-34` |
| Research/D08 sibling surface | `apps/dock/src/app/research/page.tsx:14-29` renders `PageHeader` + one `<Alert tone="hot">` and imports no query module; contract test `apps/dock/test/research-public-withholding.test.mjs:11-15` asserts the source contains no `readResearchRegistry`, `ResearchExplorer`, `serverClient` or `.model(` | fail-closed by test, not by convention |

### 3.3 Reusable components

| Primitive | Where |
|---|---|
| `PageHeader` (+ its `breadcrumbs` prop → `Breadcrumbs`), `Panel`, `Badge`, `Button`, `Field`, `TextInput`, `LinkButton` | `app/reader/page.tsx:1, 24-56` |
| `Panel`, `Alert`, `Badge`, `EmptyState` | `ui/components/reader.tsx:2`, used at `:85-90` (absent/invalid), `:96-116` (ambiguous candidate list), `:141` (withheld), `:213-231` (citation) |
| Native `<details>/<summary>` for the provenance drawer | `reader.tsx:152-155` — chosen over MoonUI `Modal`; ADR-0009 §2.4 says a dialog primitive already exists, so this is a deliberate non-modal, not a missing primitive |
| `Card`, `CardHeader`, `CardBody`, `Tape`, `ZineNote`, `Badge`, `PageHeader` | `app/reader/compare/page.tsx:2` |
| Not used anywhere on screen 05 | `Skeleton`, `Spinner`, `Tabs`, `DataTable`, `EmptyState` on `/reader` itself, and `PanelState` (`states.tsx:20-55`) |

Ad-hoc duplication to fold back into MoonUI: `reader.tsx:26-72` is a hand-laid `<dl className="dk-reader-source">` doing the job of a `DataTable`/key-value primitive; `compare/page.tsx:124-153` styles its text block entirely with inline `style` objects rather than tokens; `RIGHTS_LABEL` (`reader.tsx:8-14`) is a fourth place rights vocabulary is spelled out in English after `packages/moonql-corpus` (`:26-40`), the `STATUS_TONE` map in `terms.tsx:12-21`, and the compare page's literal badge.

### 3.4 Data owner

| Panel | Endpoint | Package | Tables |
|---|---|---|---|
| Lookup form + passage + translations + citation string | `POST-free` `GET /corpus/reader` via `data/queries/reader.ts:56-63` (`serverClient().call`) | `packages/moonql-corpus` | `corpus_works`, `corpus_editions`, `corpus_passages`, `corpus_translations` (read through the handler's `orm.model(...).list`, e.g. `:250-264` and `:298`) |
| Citation copy control | none — client clipboard | `apps/dock/src/ui/client/CitationCopy.tsx` | none |
| Reproducible citation text | built server-side at `moonql-corpus/src/index.ts:313-323` | corpus | as above |
| `/reader/compare` | **none** | **none** | **none** — citations are minted locally by `createPassageCitation` from `@moonwitness/core` (`compare/page.tsx:73-83`) over an inline array |

### 3.5 Differences from reference 05

| Reference element | Ships today | Classification |
|---|---|---|
| `WORKS / CONTENTS` left rail with 5 entries: Source catalog, Editions, Passage index, Translations, Citation export (`:18`) | **none of the five exist as a panel**. `/reader` is single-passage by citation only; there is no browse-by-work, no edition list, no passage index, no translation list, no export surface | **Missing** — the largest real gap on this screen; unblocks `UI-P05b` |
| `SOURCE READER` centre rows: original placeholder, translator/edition identity, passage anchored by stable ID, text direction preserved per source, uncertainty and alternate rendering, copy with citation + attribution (`:18`) | rows 1-4 and 6 ship: `reader.tsx:158-175` (source text with `lang`/`dir` from the projection), `:129-138` + `:24-74` (identity), `:182-208` (translations), `:219-222` + `CitationCopy` (copy with attribution). Row 5, "Uncertainty and alternate rendering", ships only as the `ambiguous` edition-choice list (`:94-116`) — no variant apparatus, no alternate-reading display | **Partial** — one row absent, one degraded |
| `PROVENANCE` right rail: `EDITION: UNSELECTED`, `RIGHTS: UNVERIFIED`, `LANGUAGE: SOURCE`, `INTERPRETATION: LABELED`, `EXPORT: GUARDED` (`:18`) | a single provenance strip (`reader.tsx:148-151`: edition code · rights label · 12-char SHA) above a disclosure (`:152-155`) with the full record; no separate interpretation or export panel | **Equivalent for 3 of 5**; **`INTERPRETATION: LABELED` is missing entirely** — no tafsir/interpretation lane is rendered or queried, and `EXPORT: GUARDED` is only implicit |
| Rail, search box, `05 / 12`, footer strip, `CONCEPT · NOT LIVE` badge (`:9, 11, 17, 18-19`) | absent | **Rejected by ADR-0009 §2.2-2.3** |
| — | `/reader/compare` renders six complete texts — Arabic, Indonesian Kemenag, English, morphology, commentary — each labelled `licenseStatus: 'RIGHTS_CLEARED'` (`:23, 32, 41, 50, 59, 68`) and a green `Badge tone="ok"` reading `RIGHTS CLEARED` (`:95`), with no call to the corpus owner and no veto | **Not in the reference, and the most serious shipped defect.** It contradicts ADR-0009 §2.5 (never state a status the data cannot prove) and is precisely the negative case `docs/architecture/SECURITY.md:2` lists as a test target ("hardcoded RIGHTS_CLEARED"). It also undercuts the rights work on `/reader` two links away |
| — | `UI-P05d` claims "term navigation" as shipped ([todo-ui.md:114](../../todo-ui.md)), but `grep` for `/terms` across `ui/components/reader.tsx`, `app/reader/page.tsx` and `app/reader/compare/page.tsx` returns nothing: the Reader links to no lexicon entry | **Claim-vs-code discrepancy** — record for the checkbox owner; does not by itself unblock a leaf, but it is the evidence a `UI-P06c` link target needs |

## 4. Screen 06 — UNILEX EXPLORER (UI-P06a)

Reference: [`06_unilex_explorer.svg`](../design/mockups-xv/06_unilex_explorer.svg) · Owner: M10 / M12 / M19 · Code owner: existing lexicon/ontology owners + Dock projection.

### 4.1 Actual routes

| Route | File | Locale | Notes |
|---|---|---|---|
| `/terms` | `app/terms/page.tsx:46-219` | read at `:51-53` (form labels + errors via `getStatesCopy`) | filters `q, lane, scope, status, source, page, left, right` (`:23-32`); `PAGE_SIZE = 12` (`:21`) |
| `/terms/[stableId]` | `app/terms/[stableId]/page.tsx:13-33` | **not read** | `readTerm` → `notFound()` on 400/404 (`:16`, helper at `data/queries/terms.ts:183-190`) |
| `/constellation` | `app/constellation/page.tsx:18-54` | read at `:20-22` | two owners in one page: `/ontology/constellation` + `/graph/overview` (`data/queries/constellation.ts:149-151`, `data/queries/graph.ts:206-208`) |
| `/constellation/relations/[relationCode]` | `page.tsx` + `ui/components/graph-relation.tsx` | **not read** | `/graph/relation` (`graph.ts:197-204`) |
| `/figures`, `/figures/[figureCode]`, `/missions` | `app/figures/...`, `app/missions/page.tsx` | mixed (list reads locale, detail does not) | `/actors/figures`, `/actors/figure`, `/actors/missions` (`data/queries/actors.ts:213-224`) |
| No term-graph canvas route | — | | the reference's graph has no Dock counterpart |

### 4.2 Permissions / visibility

| Gate | Evidence | Behaviour |
|---|---|---|
| Endpoints are public reads | `packages/moonql-unilex/src/index.ts:726-727` (`/unilex/terms`, `requires: 'public'`), `:916-917` (`/unilex/term`), `:1088-1089` (`/unilex/matches/preview`) | no token needed; Dock never holds one (`data/sdk.ts:9-11`) |
| Citation-approval filter | `:179-180` `approvedSourceIds` keeps only `source.reviewStatus === 'APPROVED_FOR_CITATION'`; applied to the list at `:759` and `:826` (`if (!hasApprovedSource) return null`), to the source filter at `:767-772` (explicit 400 for an unapproved `--source`), and to the detail source list at `:892` | a term without an approved source is **not in the projection at all** — this, not a UI label, is the visibility rule |
| Review vocabulary kept separate from text | `:44-52` seven relation types (`relatedTo, inspiredBy, distinctFrom, exactMatch, closeMatch, narrowerThan, broaderThan`), `:53` four relation statuses, `:54-55` match classes/decisions | UI shows these as `Badge`s (`ui/components/terms.tsx:12-34`), never as prose synonymy |
| Identity decisions are **not** publicly readable | `:595-598` `unilex_match_reviews` = `ADMIN_FULL`, `:617-620` `unilex_review_log` = `ADMIN_FULL`; the write endpoint `/unilex/matches/review` is `ADMIN_ONLY` (`:1120-1121`) | so the raw REST route for the same rows is closed — unlike `unilex_terms` itself (`:503-506`, `ADMIN_WRITE` → public `list`/`get`), which is the honest gap recorded in §2.2 |
| Preview never claims identity | `data/queries/terms.ts:159-165` types `autoRelation: null` literally; `ui/components/terms.tsx:210-247` renders `identityClaimed` as words | matches the panel subtitle at `app/terms/page.tsx:195-198` |
| Research sibling | `app/research/page.tsx:14-29` + `test/research-public-withholding.test.mjs:11-15` | fail-closed; its data owner (`/research/overview`, `packages/moonql-research/src/index.ts:650-656`) exists but is deliberately not wired to a public page |

### 4.3 Reusable components

| Primitive | Where |
|---|---|
| `PageHeader`, `Panel`, `Field`, `TextInput`, `SelectInput`, `Button`, `Alert`, `Badge`, `Pagination` | `app/terms/page.tsx:2, 88-216` |
| `DataTable` + `ColumnDef` wrapped in native `<details>` | `ui/components/terms.tsx:2, 116-155` — deliberate: `test/unilex-list.test.mjs:26-31` asserts a native disclosure over a custom widget |
| `EmptyState`, `Alert`, `Chevron`, `Badge` | `Badge` at `terms.tsx:76, 102-103, 183-185, 214-215`; `DataTable` at `:142`; `EmptyState` at `:147-151` and `:161-164`; `Alert` at `:255-258`; `Chevron` at `:201` |
| `Badge`, `EmptyState`, `Panel` | `ui/components/constellation.tsx:2`, `ui/components/graph-relation.tsx:2`, `ui/components/actors.tsx:2` |
| Unused on screen 06 | `Tabs` (would suit Forms / Senses / Sources / Relations on the detail page), `Skeleton`/`Spinner` (no loading affordance on a 12-row page), `Tooltip` (relation `direction` and `perspective` are bare text), `SplitView`, `Stat`, and **`PanelState`** |

Structural owners in Dock: `TermIndexTable`, `TermList`, `MatchPreviewView`, `TermDetailView` + private `FormChips`, `SourceList`, `IdentityReviewRow` (`terms.tsx:39-114`); `ConstellationView`/`EdgeRow`/`AliasChips` (`constellation.tsx`); `GraphReleasePanel` (`graph-relation.tsx`); `FigureRegistryView` (`actors.tsx`).

Ad-hoc duplication worth naming: `STATUS_TONE`, `RELATION_TONE`, `MATCH_TONE` (`terms.tsx:12-34`) re-implement a status→tone map that `constellation.tsx` (`EPISTEMIC_TONE`, `toneFor`) and `actors.tsx` each repeat separately; three files therefore hand-roll the same Badge vocabulary. The `+N more forms` chip overflow (`terms.tsx:62-64`) and the `{n} sense(s) · {n} source(s) · {n} relation(s)` counter (`:194-199`) are hand-built pluralization that no MoonUI `Stat`/`Pill` is being reused for, and both are English-only.

### 4.4 Data owner

| Panel | Endpoint | Package | Tables |
|---|---|---|---|
| Registry header (version, pin, seed count, raw SHA-256, addenda) | `/unilex/terms` payload `registry` | `packages/moonql-unilex` | none — literal `UNILEX_REGISTRY_META` (`:71`, seeded `data/unilex/terms.v0.1.json` path at `:76`) served by `registryMeta()` (`:182`) |
| Filters + options | `/unilex/terms` `options.lanes/scopes/statuses/sources` | unilex | `unilex_terms` (`:503`), `unilex_sources` (`:447`) |
| Term cards + table index | `/unilex/terms` (`data/queries/terms.ts:179-181`) | unilex | `unilex_terms`, `unilex_forms`, `unilex_senses`, `unilex_relations`, `unilex_sources` (joined at `:752-758`) |
| Term detail: Forms / Senses / Sources | `/unilex/term` (`:183-190`) | unilex | as above |
| Term detail: Relations panel | same payload | unilex | `unilex_relations` (`:572`) |
| Term detail: Identity reviews + Review log panels | same payload | unilex | `unilex_match_reviews` (`:595`), `unilex_review_log` (`:617`) — both `ADMIN_FULL` at the raw layer, projected through the handler |
| Match preview | `/unilex/matches/preview` (`:192-194`) | unilex | read-only scoring, no write |
| Constellation nodes/aliases/edges | `/ontology/constellation` (`data/queries/constellation.ts:149`) | `packages/moonql-ontology` | `onto_entities` (`:225`), `onto_aliases` (`:249`), `onto_relations` (`:272`), `onto_identity_reviews` (`:294`), `onto_review_log` (`:318`); endpoint at `:455` |
| Graph release/candidate panels | `/graph/overview`, `/graph/relation`, `/graph/adjacency`, `/graph/search`, `/graph/releases`, `/graph/release`, `/graph/export`, `/graph/policy` — all `requires: 'public'` at `packages/moonql-graph/src/index.ts:255-340` | `packages/moonql-graph` | `graph_candidates` (`:70`), `graph_releases` (`:97`), `graph_release_pointer` (`:118`, `ADMIN_FULL`), `graph_adjacency` (`:136`) |
| Figures / missions | `/actors/figures`, `/actors/figure`, `/actors/missions` (`data/queries/actors.ts:213-224`) | `packages/moonql-actors` | `actor_figures` (`:239`), `actor_roles` (`:260`), `actor_missions` (`:281`), `actor_events` (`:306`), `actor_avatars` (`:328`); endpoints `:503-572` |
| Editorial/review state feeding any "publication" claim | none projected publicly | `packages/moonql-research` | `reviewModels` start at `src/review-subsystem.ts:340-467` (`research_reviews` `:341`, `research_review_events`, `research_quality_runs`); **every** response hardcodes `publicationAvailable: false` — `:211, 625, 631, 696, 804, 832, 863, 898, 938, 1148, 1198, 1216`, plus `src/review.ts:171, 205` and `src/seed.ts:625` (a wider set than the five sites previously recorded) |
| D08 publication gate that the Reader/UNILEX would eventually cite | **does not exist as code** | the only reference is [`docs/decisions/M02-02-domain-assignments.md:27`](../decisions/M02-02-domain-assignments.md): `@moonwitness/governance` *(Planned G3)* with `release_manifests`, `rights_approvals`, `editorial_signoffs`, `takedown_logs`. Verified: no `packages/governance` directory, and those four table names appear nowhere else under `packages/`, `apps/` or `docs/` | so `UI-P05e` ("unapproved D08 projection denied even when UI link guessed") currently has **no object to test against** — it can only be written against the fail-closed `/research` page until D08 is accepted |

### 4.5 Differences from reference 06

| Reference element | Ships today | Classification |
|---|---|---|
| `GRAPH OF REVIEWED RELATIONS`: centre node TERM linked to ALIAS, FIGURE, SOURCE, EVENT, CONTEXT (`:18`) | **no graph canvas.** `/terms` has no visual relation view at all; `/constellation` renders nodes and typed edges as an ordered list (`ui/components/constellation.tsx` — the file contains no `svg`, `circle` or `line` element) | **Partial by decision** — the list form is the shipped `UI-P06e` answer for keyboard and mobile; the canvas is the outstanding difference and belongs to `UI-P06c`, not to a copy-the-mockup request |
| `RELATION INSPECTOR` fields (`:18`) | EDGE TYPE → `relation.relationType` (`terms.tsx:329`); SOURCE PASSAGE → **absent as a link**, `relation.evidenceRef` is inert text (`terms.tsx:344-346`; same pattern at `constellation.tsx:90, 164, 200, 353`); CONFIDENCE + REVIEW → status/reviewer present, **no confidence value anywhere**; NOT EQUIVALENT BY DEFAULT → `distinctFrom` type plus `MatchPreviewView` (`terms.tsx:210-247`) but the preview sits on the *list* page, never beside a term's relations; TERM HISTORY → senses with `supersedes`/`supersededBy`/`deprecatedAt` (`:287-307`) + Review log panel (`:365-384`); HUMAN REVIEW → `reviewer`/`reason`/`evidenceRef` (`:342-346`) | **Partial**: 3 of 6 fully, 2 degraded, 1 missing |
| Rail, search box, `06 / 12`, footer strip, `CONCEPT · NOT LIVE` (`:9, 11, 17, 18-19`) | absent | **Rejected by ADR-0009 §2.2-2.3** |
| Breadcrumb `THE EMPIRE › DOCK / RESEARCH` (`:10`) | `breadcrumbs={[{label:'Home',href:'/'},{label:'Terms'}]}` (`app/terms/page.tsx:91`) | **Equivalent**, but the Home crumb is locale-losing (see §5) |
| — | `FIGURE` and `EVENT` are reference node types, yet UNILEX relations are term↔term only (`RELATION_TYPES`, `moonql-unilex/src/index.ts:44-52`) and the only cross-namespace key, `onto_entities.unilexStableId` (`moonql-ontology/src/index.ts:243`), is printed as a `<code>` at `ui/components/constellation.tsx:126-127` with **no link** to `/terms/[stableId]` | **Missing, and the single highest-value `UI-P06c` item**: the bridge exists in data in one direction and is inert in the UI in both |
| — | `/figures` and `/constellation` render `labelEn`/`preferredEn` only (`actors.tsx:148, 293`) although the data carries `labelId` (`moonql-actors/src/index.ts:247`, seeded required at `:390`) | **Gap** — Indonesian labels exist but are never shown; `UI-F12` |

## 5. Cross-screen findings

### 5.1 Locale-preserving links (unblocks `UI-F12`)

`localizedDockHref` (`apps/dock/src/lib/locale-context.mjs:17-35`) is the single correct helper, used by `shell.tsx:96-99, 192, 217, 225, 274, 365, 437, 441` and `spaces.tsx:113, 123, 133, 144`. Everything else bypasses it. Full inventory at this baseline:

| Kind | Sites |
|---|---|
| Template-literal detail hrefs | `terms.tsx:123, 175, 200, 334` · `actors.tsx:148, 293` · `constellation.tsx:145` · `graph-relation.tsx:255` · `sections.tsx:224, 479` · `reader.tsx:21` (via `:103`) · `embed/[id]/page.tsx:34` |
| Literal card/button hrefs | `page.tsx:146` · `sections.tsx:131, 165, 205, 285, 293` · `reader/page.tsx:37` · `missions/page.tsx:69` · `figures/page.tsx:37` |
| GET `form action` (drops the prefix on every submit) | `reader/page.tsx:45` · `terms/page.tsx:129, 199` · `stations/page.tsx:53` · `missions/page.tsx:81` |
| Pagination builder | `terms/page.tsx:36-44` returns `/terms?…` (`:43`), so page 2 of the lexicon is un-prefixed even though the page itself is localized |
| Breadcrumb `href: '/'` (forces a 307 and re-negotiation instead of the current locale) | `missions:66` · `figures:34` · `figures/[figureCode]:24` · `denpa:30` · `terms:91` · `terms/[stableId]:24-25` · `schedule:21` · `patches:35` · `research:24` · `constellation:44` · `constellation/relations/[relationCode]:30-31` · `reader:33` · `reader/compare:91-92` · `stations:49` · `stations/[id]:28` |
| Footer mounted without a locale | `layouts/site.tsx:22` → `shell.tsx:332` default `'en'` |
| English-only page metadata | 12 `export const metadata` blocks, e.g. `reader/page.tsx:7-10`, `terms/page.tsx:16-19`, `terms/[stableId]/page.tsx:8-11`, `research/page.tsx:9-12` |
| Client-side locale re-detection duplicating the server path | `loading.tsx:7-14`, `CitationCopy.tsx:10-17` |

Locale persistence itself lives at `apps/dock/src/lib/locale-context.mjs:53-58` (`mw_locale` cookie, `SameSite=Lax`, one-year max-age) and is the only cookie Dock writes.

### 5.2 Four-state contract (unblocks `UI-F10`)

`PanelState` (`apps/dock/src/ui/components/states.tsx:9-55`) implements the whole contract on `Spinner`/`Alert`/`EmptyState`. A grep for `PanelState` across `apps/dock` matches **only its own declaration file** — zero consumers, confirming limitation 5 of the prior evidence doc is still true at `d54ad43`. Meanwhile the shipped substitutes are page-level and inconsistent: `/terms` uses `Alert`+`EmptyState` by hand (`terms/page.tsx:180`, `terms.tsx:147-151, 161-164`), `/constellation` uses `Alert` only (`page.tsx:46-47`) with `EmptyState` inside the view, `/reader` uses `EmptyState` for absent/invalid (`reader.tsx:83-92`), and `/` renders **nothing at all** when `signals` is empty (`page.tsx:72`) — an empty state that is indistinguishable from a missing panel. `Skeleton`/`TableSkeleton`/`CardSkeleton` exist in MoonUI but no Dock page imports them; the only loading UI is the router-level `loading.tsx`.

### 5.3 Dead code and unwired tooling (verified before asserting)

| Item | Verification | Result |
|---|---|---|
| `apps/dock/src/ui/client/ResearchExplorer.tsx` | repo-wide grep for `ResearchExplorer` | 3 hits, all inside the file itself (`:24, 61, 66`) plus `test/research-public-withholding.test.mjs:12`, which asserts it is **absent** from the research page. No import exists → **unreferenced dead code**, kept only as a negative-test token |
| `apps/dock/scripts/verify-{reader,terms,constellation,graph,missions}-ui.tsx` | `apps/dock/package.json` scripts are only `dev/build/start/test/typecheck`; `test` runs `node --test test/*.test.mjs`; root `verify` = `build && ui:check && lint && gen:sdk:check && test && build:web`; `.github/workflows/ci.yml:51-52` runs `pnpm verify` | **No npm script and no CI step executes any of the five.** Their own header says `node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-terms-ui.tsx`, and `apps/radio` does not exist (apps are `arsy, api, aigateway, cockpit, dock, echolog, headquarters, sentinel, skylink`), so the documented invocation is stale. `TODO.md:250` still cites `verify-reader-ui.tsx` as M08-06 evidence — an unenforceable citation |
| `pnpm ui:check` coverage | `git show d54ad43:scripts/check-ui-consistency.mjs` | checks hex-colour drift (`:186-193`) and forbidden stylesheet classes (`:221-224`) only. It does **not** check raw hrefs, missing locale reads, or `PanelState` adoption, so a green `ui:check` proves none of §5.1/§5.2 |

### 5.4 Product raster with no rights trail

18 files in `apps/dock/public/art/` are shipped in the product: `globals.css:130` (`hero-banner.jpg` as the hero background), `:384` (`moon-corner.jpg`), `:617` (`footer-crowd.jpg`), plus `<img>` at `sections.tsx:215` (`constellation-map.jpg`), `:295` and `:328`. Their `alt` text is a hardcoded English array (`sections.tsx:37-45`). The ADR-0009 §2.1 rule (`git grep -n "mockups-xv/png" apps/`) is verified **empty**, so no mockup raster leaked into code — but §2.1's per-asset ledger requirement covers only the twelve references; no provenance record exists for these 18 Dock assets anywhere under `docs/`. Screen 01 therefore ships art whose rights state is unrecorded.

## 6. Evidence status for the D2 halves of these leaves

Pixel screenshots remain **environment-blocked**: ADR-0009 §2.6 records that the repository has no screenshot harness and the local IDE browser cannot be resized, and `todo-ui.md:44` leaves `UI-F18` (Playwright harness) open. The prior cycle's numbers (`ui-screens-evidence-38560d3.md:29-40`) are **DOM-geometry** measurements taken on the hub-offline branch against code at `38560d3`, not screenshots and not this baseline; `d54ad43..HEAD` touched no Dock file, so those geometries remain plausible, but they are unverified here because this audit ran no server and no gate. Each `UI-P0xf`/`UI-F18` checkbox stays blocked until the owner approves the Playwright harness (the follow-up named in ADR-0009 §2.6 / §"Follow-ups").

## 7. Leaf unblock map

| Screen | Findings above | Unblocks |
|---|---|---|
| 01 | §2.5 nav-vs-research-page inconsistency; §5.1 raw hrefs and locale-less footer; §5.4 unledgers art; §2.3 inline-style duplication | `UI-F12` (links + copy parity), `UI-F10` (empty/loading on `#world-monitor`, `#signals`), `UI-P01f` blocked on `UI-F18` |
| 05 | §3.5 five missing left-rail panels; missing interpretation lane; no variant apparatus; `compare` page with no data owner and literal `RIGHTS_CLEARED`; no reader→term link | `UI-P05b` (static structure), `UI-P05e` (needs D08 to exist first — §4.4 last two rows), `UI-F12`, `UI-F10` |
| 06 | §4.5 graph canvas absent, 3 of 6 inspector fields partial/missing, inert `unilexStableId` bridge, no confidence value, `labelId` unused | `UI-P06b`, `UI-P06c` (typed alias/figure/event/source inspector), `UI-P06d` (uncertainty + alternatives), `UI-F12`, `UI-F10` |

## 8. Per-screen verdict

| Screen | Verdict | One-line basis |
|---|---|---|
| 01 DOCK & LIGHTHOUSE | **SHIPPED, partial parity** | real routes, real hub data, four-space entry per ADR-0009, honest offline branch; loses locale on 7 links + the footer, no per-panel empty/loading states, unprovenanced hero art |
| 05 CORPUS READER | **PARTIAL** | `/reader` is correctly rights-gated end-to-end in the owner and re-guarded in the renderer; the reference's browse/contents structure is absent and `/reader/compare` is an unowned, hardcoded-`RIGHTS_CLEARED` page reachable from the primary CTA |
| 06 UNILEX EXPLORER | **PARTIAL** | list + detail are real, approval-filtered and reviewer-labelled with a keyboard-reachable index; the reference graph and the alias/figure/event/source side of the inspector do not exist, and the lexicon↔ontology bridge is inert text |
