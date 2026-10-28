# M31-02 — Gateway journeys and available/planned states

**Design specification · baseline SHA `a54198b` · no route, copy, code or deployment change.** This document is the M31-02 leaf artifact. It designs the visitor journeys of the LIGHTHOUSE public gateway across `id`/`en` and fixes how the gateway may label a surface `AVAILABLE` versus `PLANNED`. It does not implement a gate, a route, a domain, a copy change (M31-04) or a test (M31-05), and it does not close the M31 milestone. Evidence commands and observed output are recorded in [the companion audit](../audit/M31-02-gateway-journeys.md).

## 1. Scope and authorities

The ratified hierarchy is [M31-01](../audit/M31-01-brand-hierarchy-proposal.md): MoonWitness XV is the program, A-L-L-A-H / Empire of the Light is the vision label, **LIGHTHOUSE is the public gateway implemented inside the existing Dock application**, and `a-l-l-a-h.com` is the intended entry point *only after* ownership, DNS/TLS and release gates are separately verified. That ratification grants no separate app, backend, identity, database, public exposure or deployment.

Constraints applied here:

- [ADR-0004](../decisions/ADR-0004-empire-surfaces.md) §6 — LIGHTHOUSE stays within Dock initially and gains no independent owner, schema or deployment.
- [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) §2.2–2.5 — four public spaces, `REAL`/`PLANNED`/`DEMO` stated in words, no invented counter or `LIVE` badge, no decorative global search field, header nav plus `PageHeader` breadcrumbs own navigation.
- [MASTER_DESIGN.md](../../MASTER_DESIGN.md) §DOCK — public discovery surface semantics (entry states exactly four spaces; forbidden chrome).
- [BLUEPRINT.md](../../BLUEPRINT.md) line 95 — LIGHTHOUSE is "Proposed; domain, DNS and TLS unverified".

**Terminology used in this document.** `AVAILABLE` means "an existing Dock route or component renders this today, at baseline `a54198b`, as shown by `file:line`". It is a documentation word, not a new UI state: the UI word for this condition is `REAL` (`NYATA` in `id`). `PLANNED` means "no implementation exists in this repository"; it must be shown as a non-navigable statement of intent, never as a working destination.

## 2. Grounded surface inventory (baseline `a54198b`)

The gateway would reuse this surface as-is. 20 `page.tsx` routes plus one root `layout.tsx` exist under `apps/dock/src/app` (full enumeration in the audit).

| Surface | Route | Evidence | Gateway role |
|---|---|---|---|
| Home | `/` (negotiated) → `/en`, `/id` | `src/middleware.ts:29-43`, `src/app/page.tsx:43` | Entry + orientation |
| Reader | `/reader` | `src/app/reader/page.tsx:18` | Reader discovery |
| Comparative reader | `/reader/compare` | `src/app/reader/compare/page.tsx:14` | Withholding notice only |
| UNILEX terms | `/terms`, `/terms/[stableId]` | `src/app/terms/page.tsx:47`, `src/app/terms/[stableId]/page.tsx:15` | Research/context discovery |
| Figures, constellation | `/figures`, `/figures/[figureCode]`, `/constellation`, `/constellation/relations/[relationCode]` | `src/app/figures/page.tsx:17`, `src/app/figures/[figureCode]/page.tsx:15`, `src/app/constellation/page.tsx:25`, `src/app/constellation/relations/[relationCode]/page.tsx:20` | Research/context discovery |
| Prophetic mission table | `/missions` (not in nav; in sitemap) | `src/app/missions/page.tsx:40` | Discovery, secondary |
| Signals | `/stations`, `/stations/[id]`, `/schedule` | `src/app/stations/page.tsx:24`, `src/app/stations/[id]/page.tsx:14`, `src/app/schedule/page.tsx:16` | SIGNAL space |
| Research ledger | `/research` | `src/app/research/page.tsx:14,28` | Notice only, no records |
| Studio, patches, denpa, prisms, timeline | `/studio`, `/patches`, `/denpa`, `/prisms`, `/timeline` | `src/app/studio/page.tsx:11`, `src/app/patches/page.tsx:18`, `src/app/denpa/page.tsx:20`, `src/app/prisms/page.tsx:27`, `src/app/timeline/page.tsx:23` | Secondary surfaces |
| Embed | `/embed/[id]` (framing allow-list) | `src/app/embed/[id]/page.tsx:18`, `src/middleware.ts:106-113` | Out of gateway journey |

Chrome: `SiteHeader` with a 15-item `NAV_LINKS` list (13 route links and 2 home anchors `/#constellation`, `/#zine-poster`) at `src/ui/components/shell.tsx:27-43`, rendered desktop-only nav `:198-213`, drawer nav `:288-309`; `LocaleSwitcher` `src/ui/components/locale-switcher.tsx:61-83`; `SiteFooter` join banner `src/ui/components/shell.tsx:328-355`; the four-space grid `src/ui/components/spaces.tsx:102-146`.

## 3. Journey matrix — first-time public visitor, both locales

Locales are not separate routes: `/en/...` and `/id/...` rewrite to the same page (`src/middleware.ts:44-58`), and every internal link is rebuilt with the active locale (`localizedDockHref`, `src/lib/locale-context.mjs:18`; nav usage `shell.tsx:97-100,201`). One row therefore covers both locales unless a locale-specific gap is called out.

| # | Stage | Visitor intent | What exists today (both `/en` and `/id`) | State | Evidence / why PLANNED |
|---|---|---|---|---|---|
| J1 | Entry | Open the site root | 307 to `/id` or `/en` from cookie or `Accept-Language`, `Vary: Accept-Language` | **AVAILABLE** | `middleware.ts:29-43` |
| J2 | Entry | Open a localized URL directly | `/en/...` and `/id/...` rewrite to the page; `<html lang>` follows the resolved locale | **AVAILABLE** | `middleware.ts:44-58`, `app/layout.tsx:22-32` |
| J3 | Entry | Arrive at `a-l-l-a-h.com` | Intended host only. Canonical origin comes from `DOCK_PUBLIC_URL`/`NEXT_PUBLIC_SITE_URL` or `FRONTEND_URLS.dock`; no domain, DNS, TLS or certificate evidence exists in the repository | **PLANNED** | `app/sitemap.ts:7-12`, `lib/metadata.ts:13,48`; M31-01 ratification withholds domain claims |
| J4 | Orientation | Understand the brand and switch language | Header brand, 13 route links, `EN`/`ID` switcher with `aria-current` and persisted preference | **AVAILABLE** | `shell.tsx:194-217`, `locale-switcher.tsx:24-84` |
| J5 | Orientation | Choose what to do first | Four space cards READ/EXPLORE/CREATE/SIGNAL, each with a one-word status tape; CREATE is `DEMO` and names its blocker | **AVAILABLE** | `spaces.tsx:19-38,102-146`; copy `landing-copy.ts:90,94-96` |
| J6 | Orientation | See LIGHTHOUSE-specific gateway framing | No LIGHTHOUSE copy exists; the `h1` is `MOONWITNESS` | **PLANNED** | `shell.tsx:390`; `rg -i "lighthouse"` over `apps/dock/src` was empty in M31-01; copy ownership is M31-04 |
| J7 | Orientation (small screen) | Reach navigation without a mouse | Menu button opens a `role="dialog"` drawer with the same links, Escape close, Tab trap, focus restore | **AVAILABLE** | `shell.tsx:124-181,239-316`; breakpoint owner `globals.css:755-784` |
| J8 | Reader discovery | Read an exact source with rights state | Reader route, citation/edition GET form, provenance strip, denial state instead of blocked text | **AVAILABLE** | `reader/page.tsx:18,94-105`; `ui/components/reader.tsx:142-166,194-196` |
| J9 | Research discovery | Browse names, relations, context | UNILEX browse + term detail, figure registry, constellation and relation inspector, each with panel loading/empty/error states | **AVAILABLE** | `terms/page.tsx:47,141-143`, `terms/[stableId]/page.tsx:15`, `figures/page.tsx:17`, `constellation/page.tsx:25`; `ui/components/states.tsx:26-68` |
| J10 | Research discovery | Look at the research ledger | A hot alert stating the ledger is withheld pending an approved D08 public projection; no rows, no query | **AVAILABLE (denial notice only)** | `research/page.tsx:14,28`; withheld by `test/research-public-withholding.test.mjs` (existing, not executed here) |
| J11 | Research discovery | Read research cases/witnesses/hypotheses | `ResearchExplorer` exists in source but the page does not import it | **PLANNED** | `research/page.tsx` imports only `Alert`/`PageHeader`; no D08 public projection |
| J12 | Research discovery | Compare two readings | Comparative reader route renders the same withholding alert | **AVAILABLE (denial notice only)** | `reader/compare/page.tsx:14,30` |
| J13 | Search | Find a station, term, mission, citation | Per-surface GET forms: stations `q`/genre/country, terms `q`, missions `q`, reader citation/edition | **AVAILABLE (per surface only)** | `stations/page.tsx:27,80-101`, `terms/page.tsx:141-143`, `missions/page.tsx:90-92`, `reader/page.tsx:94-105` |
| J14 | Search | Search everything from the header | No cross-surface query endpoint; ADR-0009 §2.3 rejects a decorative field | **PLANNED** | Header `SRC` control is a link to `/stations`, not a global search box: `shell.tsx:219-226` |
| J15 | Join / community | Join the crew | In-page banner `#join-crew` in the footer plus a header button to that anchor; the footer CTA opens SIGNAL (`/stations`) | **AVAILABLE (call-to-signal only)** | `shell.tsx:235,312,328-350`; anchors resolve to the footer element at `shell.tsx:328` |
| J16 | Join / community | Create an account, newsletter or community profile | No route, form, identity or consent record exists in Dock | **PLANNED** | Baseline search `git grep -i -E "sign ?in\|log ?in\|/account\|newsletter\|subscribe\|password\|cookie"` over `apps/dock/src` returned only locale-preference cookie plumbing; identity is D00/ARSY, not Dock |
| J17 | Join / community | Enter HARBOR | No HARBOR surface | **PLANNED** | `ADR-0004` §6 gates HARBOR (D14) |
| J18 | Offline / degraded | Open the site when the Hub is unreachable | Home still renders the curated hero, mission text and four-space grid with a `role="status"` outage sentence; live counts are not shown as zero | **AVAILABLE** | `page.tsx:25-41,49-50`; copy `landing-copy.ts:11,121`; asserted by `test/home-offline.test.mjs` (existing, not executed here) |
| J19 | Offline / degraded | Survive a failing sub-read on any route | Route-level `loading.tsx`, `error.tsx` with reset, localized `not-found.tsx`, and four-state panels | **AVAILABLE** | `app/loading.tsx:9`, `app/error.tsx:9-30`, `app/not-found.tsx:8-30`, `ui/components/states.tsx:26-68` |
| J20 | Offline / degraded | Browse a cached catalog with no network | Deliberately no service worker | **PLANNED (not planned)** | `app/manifest.ts:11-13` states installability only and that offline catalog browsing is deliberately absent |
| J21 | Entry | Recover from a bad URL or unsupported locale segment | Unknown segment under a valid locale → 404 page; unsupported locale segment → 404, never silently remapped | **AVAILABLE** | `middleware.ts:34,47`, `not-found.tsx:8` |

**Counts: 21 journey rows — 14 AVAILABLE (two of them denial-notice-only) and 7 PLANNED.** No row is tagged AVAILABLE without a `page.tsx`/component line, and no PLANNED row is presented as a working destination.

## 4. Available/planned state vocabulary

The gateway must speak with the vocabulary the public surface already owns; it may not invent a fourth word.

| Documentation term | UI word (`en` / `id`) | Meaning | Rendering rule |
|---|---|---|---|
| `AVAILABLE` | `REAL` / `NYATA` | A route renders today | May be a link; must resolve to an existing `page.tsx` |
| `PLANNED` | `PLANNED` / `RENCANA` | Designed, not implemented | Text only: no `href`, no card-wide link, no "OPEN SPACE" affordance, not a focus stop; states its blocker in words |
| `DEMO` | `DEMO` / `DEMO` | Tool exists, outcome not authorized | Existing precedent: CREATE names M33 (`landing-copy.ts:90,200`) |

Source of this vocabulary: `SpaceStatus` at `spaces.tsx:19-29`, localized words at `landing-copy.ts:94-96,204-206`. `statusPlanned` (word `PLANNED` / `RENCANA`) exists in both catalogs but **no card uses it today** (`spaces.tsx:104-146` sets only `REAL`, `REAL`, `DEMO`, `REAL`).

Rules that keep PLANNED from becoming fake availability:

1. **One word, in the tape.** Status is a `Tape` word, never a colour alone and never a counter (`spaces.tsx:87-92`; enforced by `test/space-grid.test.mjs`, existing).
2. **PLANNED is not a link.** A planned gateway entry renders as a card without `href`, without `aria-disabled` pretending to be clickable, and without a chevron. If a designer wants a link, the surface is not planned — build it or omit it.
3. **Name the blocker.** Every PLANNED entry states the holding milestone or gate in both locales, following the CREATE precedent. "Coming soon" is not a blocker statement.
4. **No new state without an ADR.** The enum is asserted as exactly three literals; a fourth value requires an ADR and a test change, which is not authorized here.
5. **Availability is a route fact, not a copy decision.** Any AVAILABLE card must map to an existing `page.tsx`; the existing route-existence assertion is the model.
6. **No invented liveness.** No `LIVE`/`NOMINAL` badge and no numeric counter on a gateway card; the outage sentence either states unavailable data or says nothing.

## 5. Responsive search flow

There is no global search, and the design does not add one. The gateway's search journey is: *header search affordance → SIGNAL (`/stations`) → per-surface filter*, plus direct per-surface filters for readers and researchers.

| Width | What the visitor sees | State | Evidence |
|---|---|---|---|
| Desktop (≥ 1041 px) | Full 15-item nav; header utility row with `EN`/`ID`, telemetry clock, `SRC` (search signals) and `NET` (constellation) icon links, and the JOIN button | AVAILABLE | `shell.tsx:198-250`; `globals.css:44`, breakpoint block `globals.css:755` |
| Tablet / mobile (≤ 1040 px) | `.dk-nav` hidden, menu toggle shown; drawer contains the same links and JOIN; `SRC` sits in the header utility row outside `.dk-nav` and no rule hides `.dk-icon-btn`, so the search entry is still in the DOM at narrow widths (fit at 320–390 px was not measured) | AVAILABLE (structure only) | `globals.css:767-784`, `:84-115`; `shell.tsx:216-234,252-316`; no-clipping contract note `shell.tsx:317-320` |
| Any width, SIGNAL | `q` + genre + country as a GET form posting to the localized route, then paginated results | AVAILABLE | `stations/page.tsx:27,53-57,80-101` |
| Any width, READER / TERMS / MISSIONS | GET filter forms with visible labels and hints posting to the localized route | AVAILABLE | `reader/page.tsx:94-105`; `terms/page.tsx:141-143`; `missions/page.tsx:90-92` |
| Any width, keyboard | Drawer search is reachable through the focus trap; forms are native GET forms | AVAILABLE (structure only) | `shell.tsx:124-181` |
| Reduced motion | One global `@media (prefers-reduced-motion: reduce)` block suppresses animation and hover transforms | AVAILABLE (CSS only) | `globals.css:2468` (baseline line); assertions in `test/responsive-accessibility.test.mjs` |
| Cross-surface / global search | None; a decorative global field is explicitly rejected | PLANNED (rejected) | `ADR-0009` §2.3; no endpoint in `apps/dock` |

Design notes for the preview leaf that would implement this:

- Promoting `SRC` into an expectation of search is only honest if the label keeps pointing at SIGNAL. It is currently labelled `Search signals` / `Cari sinyal` (`landing-copy.ts:98,208`), which is accurate today and must stay accurate.
- The stations filter form (`stations/page.tsx:80`) does not carry `role="search"`, while terms (`:141`) and missions (`:90`) do. If the gateway presents search as a first-class journey, aligning that role is a copy/markup decision for M31-04 and a test decision for M31-05 — not a claim made here.
- No responsive or reduced-motion claim in this document is a browser measurement. It records which CSS/test artifacts own those behaviours.

## 6. Privacy and rights boundary

**Forbidden on the public gateway.** Nothing in this list may be linked, embedded, proxied or described as reachable from LIGHTHOUSE:

- Headquarters / 100CENTER review queues, audit views, source-rights and release controls (ADR-0004 §1).
- The Cockpit operator console, ORBIT, SKYLINK and ECHOLOG consoles (ADR-0004 §2, §6; ADR-0006/0007).
- ARSY/D00 identity, session, role or tenant endpoints — the gateway has no login (J16).
- Private witness material, unreviewed research rows, and any source text whose rights are not cleared (ADR-0003; `research/page.tsx:28`; `reader/compare/page.tsx:30`).
- Reference mockup rasters as product art (ADR-0009 §2.1).

Boundary evidence at baseline: a case-insensitive search for `headquarters|cockpit|/admin|arsy|skylink|echolog` across `apps/dock/src` returns **no matches**; the only Headquarters mention in the Dock app is a build-time comment in `apps/dock/next.config.mjs:6` about shared header vocabulary, and it is not a link or route. Nav items resolve only to Dock-relative paths (`shell.tsx:27-43`).

Rights behaviour the gateway inherits and must not weaken:

- A rights-blocked reader result renders an alert and a blocked placeholder, never passage text (`reader.tsx:142-166,194-196`).
- The research and comparative-reader routes render a denial notice only (`research/page.tsx:28`, `reader/compare/page.tsx:30`).
- Withholding notices are localized in both locales (`lib/states-copy.ts:113,271`).
- A gateway preview may remove surfaces; it may not add a surface that exposes the above, and it may not replace a denial notice with placeholder prose that implies the data exists.

**Limit of this check.** Two classes of link were not exhaustively proven here: (a) runtime Hub-sourced links — the home world-monitor renders `sig.url` with `target="_blank"` (`page.tsx:112-119`) and the player receives a Hub-provided `streamUrl` (`page.tsx:178-184`); these come from live data, were not fetched or dereferenced, and cannot be declared safe by a static read; (b) framework redirects — only `middleware.ts` and the routes above were inspected. A scoped gateway preview must either allow-list or omit hub-sourced outbound links, and M31-05 must test that requirement.

## 7. Out of scope for a scoped gateway preview

1. **Domain and hosting.** No purchase, DNS record, TLS certificate, redirect from any apex host, HSTS, or CDN change. `a-l-l-a-h.com` remains an intention (J3).
2. **New application, backend, database, identity or API.** LIGHTHOUSE remains inside `apps/dock`; no second Hub, SQL owner, session store or consent record (ADR-0004 §6).
3. **Implementation.** No new route, component, copy string, locale key, test or CSS in this leaf. M31-03 decides Dock reuse; M31-04 writes copy/metadata; M31-05 tests links, permissions and offline fallback.
4. **Content expansion.** No new source, translation, research record or review queue item. Withheld research stays withheld.
5. **Search expansion.** No global search, index, crawler or query API (J14).
6. **Community and commerce.** No membership, newsletter, comments, HARBOR, WORKS payments, SHADOW authoring or MOONLAB.
7. **Brand claims.** No claim of religious authority, canon approval, rights clearance for the vision narrative, or that A-L-L-A-H is a shipped product.
8. **Verification claims.** No browser, screenshot, viewport, screen-reader, Lighthouse or deployment evidence; no claim that existing automated tests pass. Only static file evidence at `a54198b`.
9. **Parent milestone.** M31 is not implemented by this document; the leaf is one artifact with positive and negative evidence.

## 8. Handoff

- **M31-03** decides reuse-Dock versus a separate frontend. This design assumes Dock reuse only because ADR-0004 §6 and the M31-01 ratification say so; it does not decide it.
- **M31-04** owns the `id`/`en` gateway copy and metadata, including whether a LIGHTHOUSE label appears beside the existing `MOONWITNESS` heading (J6), and the blocker sentence for any PLANNED card.
- **M31-05** owns the executable checks: every AVAILABLE card resolves to a page, every PLANNED card has no `href`, no private-surface link appears in header/footer/page chrome, `/` negotiates a locale, and the outage sentence appears when the Hub is unreachable.
