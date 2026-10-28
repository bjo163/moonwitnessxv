# M19-03 — Public information architecture and responsive search flows

**Design leaf, docs only · baseline `a54198b` · no application code changed.** `TODO.md` remains the only task-status register; this document proposes the target hierarchy and marks every item not present in the tree as **PLANNED**. Parent acceptance: *"Reader not buried under 30 equal nav labels"*. Prerequisites verified: M08-02 is checked in `TODO.md:248` (Reader renders work/edition/permission/source, exercised by `apps/radio/test/corpus-reader.test.ts`); M19-02 is closed at `ed3561a` ([design](M19-02-experience-tokens.md), [audit](../audit/M19-02-experience-tokens.md)) and supplies the `reader | research | story | operator` reading modes this IA sorts surfaces by.

Related accepted decisions: [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) (four public spaces, no 13-item rail, no dead global search), [MASTER_DESIGN.md](../../MASTER_DESIGN.md) §"Public discovery surface semantics — DOCK", [COMPONENTS.md](COMPONENTS.md) §Dock Space Entry.

---

## 1. Current state (observed at `a54198b`)

### 1.1 Routes

`find apps/dock/src/app -name page.tsx` returns **20 pages**. Five API routes and two metadata routes sit beside them and are not navigation targets. Every page is reached through one shell: `apps/dock/src/app/layout.tsx:29` → `SiteLayout` (`apps/dock/src/layouts/site.tsx:16-23`) → `SiteHeader` + `<main>` + `SiteFooter`.

| # | Route | Page file | Breadcrumb (`PageHeader`) | In header nav | In sitemap | Nature |
|---|---|---|---|---|---|---|
| 1 | `/` | `src/app/page.tsx` | n/a (hero `h1`) | `HOME` | yes (`''`) | Public home; live + offline branch |
| 2 | `/reader` | `src/app/reader/page.tsx:68` | Home › Reader | `READER` | yes | Public; rights-gated citation lookup |
| 3 | `/reader/compare` | `src/app/reader/compare/page.tsx:21` | Home › Reader › … | no (linked from Reader action, `reader/page.tsx:81`) | yes | Public; withholding notice |
| 4 | `/terms` | `src/app/terms/page.tsx:98` | Home › Terms | `TERMS` | yes | Public UNILEX projection |
| 5 | `/terms/[stableId]` | `src/app/terms/[stableId]/page.tsx:25` | Home › Terms › … | no (depth) | no | Public detail |
| 6 | `/stations` | `src/app/stations/page.tsx:67` | Home › Signals | `SIGNALS` | yes | Public catalog + playback |
| 7 | `/stations/[id]` | `src/app/stations/[id]/page.tsx:29` | Home › Signals › … | no (depth) | no | Public detail |
| 8 | `/schedule` | `src/app/schedule/page.tsx:52` | Home › Archive | `ARCHIVE` | yes | Public schedule |
| 9 | `/figures` | `src/app/figures/page.tsx:25` | Home › Figures | `FIGURES` | yes | Public registry |
| 10 | `/figures/[figureCode]` | `src/app/figures/[figureCode]/page.tsx:25` | Home › Figures › … | no (depth) | no | Public detail |
| 11 | `/missions` | `src/app/missions/page.tsx:72` | Home › Missions | **no** (inbound only `figures/page.tsx:31`) | yes | Public mission table |
| 12 | `/constellation` | `src/app/constellation/page.tsx:63` | Home › Constellation | `CONSTELLATION` | yes | Public graph |
| 13 | `/constellation/relations/[relationCode]` | `src/app/constellation/relations/[relationCode]/page.tsx:57` | Home › Constellation › … | no (depth) | no | Public detail |
| 14 | `/research` | `src/app/research/page.tsx:22` | Home › Research | `RESEARCH` | yes | Public **but publishes only a withholding alert** (`Alert` + `statesCopy.errorResearchUnavailable`, `:28`) |
| 15 | `/prisms` | `src/app/prisms/page.tsx:34` | none (raw `h1`) | `PRISMS` | yes | Public |
| 16 | `/timeline` | `src/app/timeline/page.tsx:29` | none (raw `h1`) | `TIMELINE` | yes | Public |
| 17 | `/patches` | `src/app/patches/page.tsx:42` | Home › Patches | `PATCHES` | yes | Public historical registry |
| 18 | `/denpa` | `src/app/denpa/page.tsx:51` | Home › Denpa | `DENPA` | yes | Public transceiver demo |
| 19 | `/studio` | `src/app/studio/page.tsx:11` | none (`GeneratorStudio`, `h1` at `ui/client/GeneratorStudio.tsx:732`) | `STUDIO` | yes | Public generator, **DEMO** (publishing awaits M33) |
| 20 | `/embed/[id]` | `src/app/embed/[id]/page.tsx:14` | none | no | no | Framing surface, `robots: noindex` |

Sitemap list: `apps/dock/src/app/sitemap.ts:16-31` — 15 entries, emitted twice (`/id`, `/en`) with hreflang alternates.

### 1.2 Navigation actually rendered

`NAV_LINKS` (`apps/dock/src/ui/components/shell.tsx:27-43`) holds **15 labels**, mapped into **two** navigation surfaces — desktop `nav.dk-nav` (`:198-199`) and drawer `nav.dk-mobile-nav` inside `div#dk-mobile-menu[role=dialog][aria-modal]` (`:254-306`, map at `:293`). `apps/dock/test/header-shell-no-clip-contract.test.mjs:231` asserts exactly two `NAV_LINKS.map(` call sites and `:233` asserts `NAV_LINKS.length === 15`; `apps/dock/test/header-navigation-semantics.test.mjs:270` repeats the 15. So the DOM contains **15 × 2 = 30 equal-weight navigation anchors**, which is the literal "30 equal nav labels": not 30 destinations, but 30 identically styled labels across the two surfaces, and all 15 visible at once on desktop.

| Label | `href` | Kind | `primary` flag | Notes |
|---|---|---|---|---|
| HOME | `/` | route | `true` | Duplicate of the brand logo (`BrandLogo href={localizedDockHref('/', …)}`, `:195`) |
| SIGNALS | `/stations` | route | `true` | Also the `SRC` utility icon (`:221`) and the hero CTA (`:411`) |
| READER | `/reader` | route | `true` | Also hero CTA `EXPLORE SOURCES` (`:415`) and home `READ` card (`spaces.tsx:113`) |
| TERMS | `/terms` | route | `true` | Also home `EXPLORE` card (`spaces.tsx:123`) |
| FIGURES | `/figures` | route | — | |
| CONSTELLATION | `/constellation` | route | — | |
| RESEARCH | `/research` | route | `true` | Page body is one withholding alert today |
| PRISMS | `/prisms` | route | — | |
| TIMELINE | `/timeline` | route | — | |
| PATCHES | `/patches` | route | — | |
| DENPA | `/denpa` | route | — | |
| STUDIO | `/studio` | route | — | Home `CREATE` card is `DEMO` |
| ARCHIVE | `/schedule` | route | `true` | |
| CREW | `/#constellation` | **in-page anchor** | — | Target id at `ui/components/sections.tsx:198`; leaves the current page |
| ABOUT | `/#zine-poster` | **in-page anchor** | — | Target id at `ui/components/sections.tsx:318`; leaves the current page |

`primary` is declared (`NavItem.primary?`, `:24`) and set on 6 rows, but **no rendering code reads it**: `grep -rn "\.primary" apps/dock/src` exits 1 with no match, i.e. the field is never dereferenced anywhere in the app, and `NAV_LINKS.map` (`:199`, `:293`) styles every row identically. The flag is dead weight, so 15 labels render with one weight. This is the structural reason Reader is not visually first-class even though it is present.

Utility cluster (not `NAV_LINKS`), same row: `LocaleSwitcher` (`ui/components/locale-switcher.tsx:62`, its own `nav` landmark with 2 anchors), `MtsTelemetryClock`, `SRC` icon → `/stations` (`:221`, accessible name `copy.navSearchLabel` = *"Search signals"* / *"Cari sinyal"*, `lib/landing-copy.ts:98,208`), `NET` icon → `/#constellation` (`:229`), `JOIN THE CREW` → `#join-crew` (`:235`), `Crown`, drawer trigger (`:242`).

### 1.3 Locale and anchor prefixes

- Locale-prefixed: **every** page route, via `/id/*` and `/en/*` rewrite in `apps/dock/src/middleware.ts:44-62`; `/` is a 307 negotiation (`:29-43`), unknown two-letter prefixes and prefixed `/api` are 404. Root locale is `<html lang={locale}>` (`app/layout.tsx:27`).
- In-page anchors: `/#constellation` and `/#zine-poster` only; they resolve on the home page alone, so `CREW`/`ABOUT` are page navigations from anywhere else.
- Unprefixed legacy paths keep working (no redirect) — `docs/audit/M19-09-dock-locale-routes.md:14`.

### 1.4 Search affordances that exist today

| Surface | Control | Form/role | Endpoint |
|---|---|---|---|
| `/reader` | citation + edition lookup | `role="search"` (`reader/page.tsx:94`) | `/corpus/reader` via Hub |
| `/terms` | registry filter + match form | `role="search"` ×2 (`terms/page.tsx:141,211`) | Hub terms projection |
| `/stations` | `q` + genre/country selects | plain `<form>` (**no `role="search"`**, `stations/page.tsx:80`) | Hub stations |
| `/missions` | filter form | `role="search"` (`missions/page.tsx:90`) | Hub actors |
| `/patches`, `/research` | client explorers | `TextInput` in client components (`PatchesExplorer.tsx:104`, `ResearchExplorer.tsx:166`) | in-memory projection |
| Header | none | the `SRC` anchor *names* itself "Search signals" but performs navigation | — |

There is **no global/cross-surface search**, deliberately: ADR-0009 §2.3 rejects a field without a real endpoint, and `apps/dock/test/home-spaces.test.mjs` fails if an `<input>` re-enters the header.

---

## 2. Findings

1. **Reader is present but not first-class.** It is one of 15 identically styled labels; nothing in the rendered shell ranks it above `PRISMS` or `TIMELINE`. The only ranking signal is position 3 and the dead `primary` flag.
2. **Two of 15 labels are not destinations** (`CREW`, `ABOUT`): they navigate away from the current page to a home-page section, so 13 of 15 labels are routes — a 2:13 mix presented as one flat list.
3. **`HOME` duplicates the brand logo**, spending a primary slot on an affordance the logo already provides on every page.
4. **`RESEARCH` holds a primary slot while publishing no content** (`research/page.tsx:28`). A primary label that opens one alert is a false promise; it also collides with the open M19-19/M34-04 public-projection work.
5. **Reader's own children are unreachable from nav depth**: `/reader/compare` is reachable only through the Reader page's action button, and `/missions` only from `/figures`.
6. **No skip link and no focusable `<main>` target.** `grep -rn "skip" apps/dock/src` finds only the player's session-`skip` logic; `<main className="dk-main">` (`layouts/site.tsx:22`) has no `id`/`tabIndex`. A keyboard user therefore traverses brand + 15 labels + 2 locale anchors + `SRC` + `NET` + `JOIN THE CREW` + the drawer trigger before reaching content.
7. **The `SRC` anchor's accessible name says "Search signals"** while it links to `/stations`; that is a mislabelled affordance in the a11y tree even though no fake input is rendered.
8. **Two pages carry no breadcrumb** (`/prisms`, `/timeline`) and `/studio` has no page header at all, so the "breadcrumbs own depth" half of ADR-0009 §2.2 does not hold on three of 13 route labels.
9. **One breadcrumb trail drops the locale prefix.** `/reader/compare` passes bare `'/'` and `'/reader'` to `PageHeader` (`reader/compare/page.tsx:25-26`) instead of `localeHref(...)` like the other 14 pages, so a reader on `/id/reader/compare` falls back to locale negotiation when clicking `Home`. **PLANNED** (locale-preserving links are M19-33 territory; noted here because it is a navigation link, not a copy issue).

### 2.1 Where Reader, Research, Story and Terms stand today

| Surface | Route | Rendered weight today | Verdict |
|---|---|---|---|
| Reader | `/reader` | one of 15 identical labels (row 3), plus hero CTA and home `READ` card | **Subordinate-but-present** — not buried, but tied with 14 others |
| Research | `/research` | one of 15 identical labels flagged `primary: true`, but the page body is a single withholding `Alert` (`research/page.tsx:28`) | **Over-ranked** relative to what it publishes |
| Story | `/studio` | one of 15 identical labels; home `CREATE` card is `DEMO` | **Under-signalled** — nav says nothing about `DEMO`; only the home card does |
| Terms | `/terms` | one of 15 identical labels, plus home `EXPLORE` card | **Subordinate-but-present** |

---

## 3. Target hierarchy

**Rule: no more than four equal-weight primary destination labels in any navigation surface.** A fifth control may exist only as a *disclosure* (opens a group), never as another destination rendered at the same weight. That is two fewer than the 6 rows flagged-but-unrendered `primary` and eleven fewer than the 15 rendered labels, and it is the same set ADR-0009 §2.2 already ratified.

### 3.1 Primary row (4 labels, one weight, Reader first)

| Order | Label | Route | Status shown | Why primary |
|---|---|---|---|---|
| 1 | `READ` | `/reader` | `REAL` | Source-first reading is the Dock's reason to exist; first in nav, first in the home grid (`spaces.tsx:104-119`), second hero CTA (`shell.tsx:415`) |
| 2 | `EXPLORE` | `/terms` | `REAL` | Reference vocabulary is the second reading mode (`MOON_EXPERIENCES.research`) |
| 3 | `SIGNAL` | `/stations` | `REAL` | Radio catalog/playback is the existing public function |
| 4 | `CREATE` | `/studio` | `DEMO` | Story mode is a real route in demo state (M33 open); the label must carry its state in words |

Home is the brand logo — no `HOME` label. `CREW` and `ABOUT` leave the nav and become footer/section links on the home page, where their anchor targets live.

### 3.2 Secondary surface: one `INDEX` disclosure (9 existing routes, 0 new)

A single disclosure control (button + `aria-expanded`/`aria-controls`, or an in-drawer group) exposes the remaining public routes, grouped by reading mode rather than listed flat:

| Group heading | Route | Label | Mode (M19-02) |
|---|---|---|---|
| `WITNESS LIBRARY` | `/figures` | `FIGURES` | research |
| | `/missions` | `MISSIONS` | research |
| | `/constellation` | `CONSTELLATION` | research |
| | `/prisms` | `PRISMS` | story |
| | `/timeline` | `TIMELINE` | story |
| | `/patches` | `PATCHES` | research |
| `SIGNAL DESK` | `/schedule` | `ARCHIVE` | operator |
| | `/denpa` | `DENPA` | operator |
| `RESEARCH` (marked *withheld*) | `/research` | `RESEARCH` | research |

Depth routes stay children, not nav entries: `/reader/compare` (child of `READ`, already linked at `reader/page.tsx:81`), `/terms/[stableId]`, `/stations/[id]`, `/figures/[figureCode]`, `/constellation/relations/[relationCode]`, `/missions`. `/embed/[id]` is never a nav target (`noindex`).

`RESEARCH` is demoted on purpose: the route exists and must stay reachable, but until M19-19/M34-04 publish an approved D08 projection its only content is a withholding notice, so it may not outrank `READ`. **PLANNED** — no code change is proposed in this leaf.

### 3.3 Count table (the acceptance in numbers)

| Surface | Now | Target |
|---|---|---|
| Distinct labels in `NAV_LINKS` | 15 (13 routes + 2 anchors) | 4 routes |
| Rendering surfaces | desktop nav + drawer | desktop nav + drawer |
| Equal-weight nav anchors in DOM | **30** | **8** (4 × 2) |
| List routes with no nav entry | 2 (`/missions`, `/reader/compare`) | 0 — both are reachable as `READ` child or `INDEX` group members |
| Depth routes (`[id]`, `[stableId]`, relations) | 5, breadcrumb-only | 5, breadcrumb-only (unchanged) |
| Reader rank | position 3 of 15, visually tied | position 1, plus first home card and the hero's source CTA |
| Labels whose accessible name is false | 1 (`SRC` = "Search signals") | 0 |

Reader is not "removed from competition" by colour or size — it wins because the list it competes in has four entries instead of fifteen, and the four are the ratified public spaces.

---

## 4. Responsive flow

Breakpoint authority stays `globals.css` (§`@media (max-width: 1040px)`, `globals.css:755`; the single-owner comment at `:708-714`). Inline `style` objects in `shell.tsx` are a known second owner of `display` in the drawer (`:260-278`) — **PLANNED** to fold into CSS; not done here.

### 4.1 Desktop (≥1366px, 4-across space grid at `globals.css:2285-2289`)

```
[brand]  READ  EXPLORE  SIGNAL  CREATE   [INDEX ▾]  [ID|EN]  [JOIN THE CREW]  [☰ hidden]
```

- One row; the 4-label band measures roughly a third of the current 1296px 15-label band, so the wrap safety net at `globals.css:44-56` becomes slack rather than load-bearing.
- `INDEX` opens a single panel that pushes/focus-moves into the 9 grouped links; closing returns focus to the trigger.
- Focus order: skip link → brand → READ → EXPLORE → SIGNAL → CREATE → INDEX → ID → EN → JOIN → main content, and nothing else.

### 4.2 Tablet (1041–1365px)

- Same DOM and same five controls; the header row wraps to two lines exactly as today (`flex-wrap: wrap`, `globals.css:34`).
- The `INDEX` panel becomes full-width beneath the header row rather than a dropdown.
- No second `nav` landmark and no second `h1` may be introduced — `apps/dock/test/landmarks.test.mjs` (one `nav`/`h1` per composed page) is the guard, and ADR-0009 §2.2 rejects a second rail.

### 4.3 Mobile (≤1040px; drawer is the only nav surface)

- Drawer order: 4 primary labels (18px, the current drawer type at `globals.css:736`) → `INDEX` group headings (smaller, `.m-muted`-weight, not equal-weight labels) → locale switch → JOIN.
- The drawer already traps focus, closes on `Escape`, restores focus to the trigger, and is `hidden` at rest (`shell.tsx:125-180`, `:254-306`; `header-navigation-semantics.test.mjs` case 4; `header-shell-no-clip-contract.test.mjs:214-228`). Target keeps that behaviour and reduces what it has to trap.
- Space grid reflows 4 → 2 (`globals.css:2381-2384`) → 1 (`:2387-2390`) columns; cards already carry `min-width: 0` and `overflow-wrap: anywhere` (`:2291-2297`).

### 4.4 Keyboard and focus invariants

1. **PLANNED** skip link as the first focusable element, targeting `<main id="main" tabIndex={-1}>`. Neither exists today (`grep` in §2 finding 6).
2. Visible `:focus-visible` outline on every nav anchor and control — already present (`globals.css:114-117`, drawer `:740`); must not regress.
3. `aria-current="page"` stays on exactly one destination per surface, computed by `isRouteActive` (`shell.tsx:75-95`) — already true for 15 labels and must stay true for 4.
4. The `INDEX` disclosure is a real button with `aria-expanded`, `aria-controls`, and `Escape`-to-close; grouped links are reachable only while it is open (or, in the drawer, after the primary four in DOM order).
5. `aria-label` on a navigation link must describe navigation. **PLANNED**: rename the `SRC` anchor's `navSearchLabel` usage to a navigation name (or drop the icon now that `SIGNAL` is a labelled primary).
6. `prefers-reduced-motion` stays global (`globals.css:2468-2492`, which already neutralises spacing/transform animation). The new disclosure must not introduce a height/slide animation as the only affordance; if animated, the existing reduced-motion block must cover it.

### 4.5 Offline / degraded behaviour

- The home renders `SpaceGrid` on **both** the live and the offline branch (`app/page.tsx:50` and `:58`; asserted `home-spaces.test.mjs:17-18`). Target: the same four-space entry and the same 4-label header survive a Hub outage, because neither reads Hub data — navigation must never depend on the DB.
- Degraded copy stays truthful: `role="status"` outage notice (`app/page.tsx:36`), `PanelState` maps loading/empty/error/ready (`ui/components/states.tsx:26-60`), and `/research` shows a withholding alert rather than invented text.
- No service worker is planned: `app/manifest.ts:11-13` states cache-offline browsing is rejected because a stale directory is worse than none. Offline means "static landing + real routes + honest error states", not cached content.
- Per-surface search forms submit via `method="get"` to the same route, so a degraded Hub yields the surface's error/empty panel, not a broken URL.

---

## 5. Search design

**No global search field.** The search story is: one search field per surface, at the surface, with the query in the URL.

| Surface | Desktop | Mobile | Offline/degraded |
|---|---|---|---|
| `/reader` | lookup panel left, passage right | lookup panel above passage (DOM order already places the passage before the rail: `reader-rail.tsx:15-18`) | `PanelState` error names the Reader, no invented passage |
| `/terms` | filter row above table | filter row stacks, table scrolls in `.m-table-wrap` | error/empty named in words |
| `/stations` | `q` + selects inline (`stations/page.tsx:80`) | selects stack; **PLANNED** add `role="search"` for parity with reader/terms/missions | catalog empty state |
| `/missions` | filter panel above table | stacks | error state |

Ordering rule: the field the page is named after comes first, results after; the search form is never the only thing above the fold on mobile (hero/space entry precede it on `/`).

---

## 6. Non-goals and hard boundary

**Non-goals**
1. No new route, no `/projects`, no fifth space (ADR-0009 §4; the M19-03 executable slice packet stops on a fifth space).
2. No global search endpoint, index service, or autocomplete backend.
3. No second navigation landmark, rail or mega-menu column set; depth stays breadcrumbs.
4. No restyling of existing Dock sections, no new palette, no new component promoted into MoonUI from a single consumer (ADR-0009 §2.4).
5. No change to `/api/*`, `/embed/*`, `/manifest.webmanifest`, stream or metadata contracts.
6. No locale-routing change; this document assumes the accepted `/id`, `/en`, `/` behaviour.

**Boundary — never in public nav:** Headquarters (session-gated operator UI), Cockpit (mission supervisor), ARSY/Hub endpoints, Sentinel, AI Gateway, SKYLINK (inbox skeleton only), ECHOLOG (attachments service), ORBIT (planned workspace), and any `/admin`, account, session, billing or reviewer surface. Public nav may contain only routes under `apps/dock/src/app` that render public data. Evidence at baseline: no `headquarters|cockpit|arsy|skylink|echolog|orbit` link exists in `apps/dock/src` (only the decorative word "orbit" in zine copy and `.dk-moon-orbit-tag`). The only cross-origin public surface is `Player`'s ambient failover stream (`ui/client/Player.tsx:24`), which is an audio source, not navigation.

---

## 7. What remains PLANNED (no code in this leaf)

| Item | Owner next |
|---|---|
| 4-label `NAV_LINKS` + grouped `INDEX` disclosure (replaces 15) | M19-13 follow-up / a new authorized leaf — **not** this docs leaf |
| Skip link + `<main id="main" tabIndex={-1}>` | M19-04 (keyboard/focus) |
| `role="search"` on the `/stations` filter form | M19-04 |
| Rename `SRC` accessible name away from "Search signals" | M19-13 follow-up |
| Breadcrumbs on `/prisms`, `/timeline`, `/studio` | M19-13 follow-up |
| Consume `MOON_EXPERIENCES.reader/research` at a layout boundary | M19-04 / M19-06 |
| Browser/geometry verification of the target header at 390/768/1440/1920 in `id` and `en` | M19-06 (screenshots are environment-blocked per ADR-0009 §2.6) |

No screenshot, browser or accessibility certification is claimed anywhere in this document.

---

## 8. Ownership, rollback, acceptance trace

- Owner: Dock public surface (`apps/dock/src/ui/components/shell.tsx`, `spaces.tsx`, `src/app/**`), with MoonUI semantics unchanged.
- Rollback: documentation only — delete this file; no runtime artefact exists to revert.
- Acceptance trace for *"Reader not buried under 30 equal nav labels"*: baseline measures **30** equal nav anchors (15 × 2). The target states **4** equal-weight primary destination labels per surface (**8** anchors across desktop + drawer), `READ` first in nav, first home card, second hero CTA, and `RESEARCH` demoted while it publishes a withholding notice. Closing the parent row requires the header change plus M19-04 keyboard evidence and M19-06 geometry — this leaf alone does not close it.
