# UI baseline audit — `dev` @ `8737fe4`

**Scope:** `todo-ui.md` packets **UI-F01..UI-F04** (audit only, no UI rewrite).
**Anchor:** branch `dev`, HEAD `8737fe4` (`docs(moonui): upload 12 original PNG references and index PNG/SVG gallery`), 2026-10-27.
**Owner:** single agent pass; no other leaf claimed in the same packet.
**Rule applied:** a reference image never proves a feature exists. Every row below states what the *code* does today.

## 1. Inventory (UI-F01)

### Applications on disk

| App | Port | Surface today | Relevant to the 12 references |
|---|---|---|---|
| `apps/dock` | 3001 | Next.js 16 public site, 17 routes | screens 01, 02 (projection), 05, 06 |
| `apps/headquarters` | 3002 | Next.js admin shell, session-gated `(admin)` group | screens 03, 04, 07, 09 |
| `apps/cockpit` | 3004 | Vite+React operator console, 6 tabs | not one of the 12 (operator tooling) |
| `apps/skylink` | 3005 | Fastify service skeleton (auth, channels, events, ws, modules) — **no UI** | screen 12 |
| `apps/echolog` | 3006 | Fastify storage service, no UI | explicitly excluded by the plan |
| `apps/arsy`, `apps/api`, `apps/aigateway`, `apps/sentinel` | 3000/3003/etc. | services | none |

### Dock routes (public surface that actually renders)

`/` · `/stations` · `/stations/[id]` · `/reader` · `/reader/compare` · `/terms` · `/terms/[stableId]` · `/figures` · `/figures/[figureCode]` · `/constellation` · `/constellation/relations/[relationCode]` · `/timeline` · `/missions` · `/patches` · `/prisms` · `/denpa` · `/research` · `/studio` · `/schedule` · `/embed/[id]`.

Every route renders through `SiteLayout` (`apps/dock/src/layouts/site.tsx`) → `SiteHeader` + `main` + `SiteFooter`. Pages use `PageHeader` from MoonUI, whose `breadcrumbs` prop renders the `Breadcrumbs` primitive; **14 Dock pages pass a breadcrumb trail**, so depth routes already have one. The home page renders `Hero` instead of `PageHeader`, so only the home header band lacks a trail (a home page trail is not meaningful anyway).

### Headquarters routes

`/login` · `(admin)/` · `(admin)/models` · `(admin)/models/[model]` (`/new`, `/[id]`) · `(admin)/views` · `(admin)/views/[view]` · `(admin)/system` · `(admin)/world-monitor`. Session logic: `lib/session.ts`, `middleware.ts`, `app/api/session/route.ts`.

### Existing UI test contracts already guarding behaviour

`apps/dock/test`: `landmarks`, `locale-routes`, `home-offline`, `responsive-accessibility`, `header-navigation-semantics`, `metadata`, `landing-copy*`, `states-copy-parity`, `required-landing-ui-keys`, `required-states-ui-keys`, `research-public-withholding`.

These already cover parts of UI-F10 (states), UI-F11/F15 (public withholding), UI-F12 (copy keys), UI-F16 (drawer/landmark), UI-F19 (gate wiring). New work must extend them, not duplicate them.

## 2. Reference → owner → reality map (UI-F02)

| # | Reference | Owning code today | Reality | Gap to close | Status |
|---|---|---|---|---|---|
| 01 | LIGHTHOUSE / DOCK | `apps/dock/src/app/page.tsx` (hero, zine trio, constellation, timeline, poster, world monitor, radio telemetry, player) + `ui/components/shell.tsx` | Real data via `homePayload()`, honest `OfflineLanding`, id/en via `landing-copy` | no breadcrumb trail; no explicit READ/EXPLORE/CREATE/SIGNAL space entry; nav labels English-only | **shippable** |
| 02 | PROJECT UNIVERSE | **none** — `grep -r "/projects" apps/dock` = 0 matches; `/missions` is the *Prophetic Mission Table* over the Figure Registry, not a project universe | No project surface and no project data owner inside Dock | needs an M17 route + data-owner decision before any UI exists | **blocked (M17)** |
| 03 | STORY FORGE | HQ admin generic model editor (`(admin)/models/[model]`) | No dedicated story workspace; draft fiction vs witness distinction absent | needs HQ scope decision (M33) before a dedicated route | **blocked (M33 owner)** |
| 04 | POSTER LAB | `apps/dock/src/ui/client/GeneratorStudio.tsx` + `/studio` | Existing generator studio | no canvas/layer/export-approval model; asset consent gate absent | **blocked (M18/M33 export + rights)** |
| 05 | CORPUS READER | `apps/dock/src/app/reader/page.tsx`, `/reader/compare`, `ui/components/reader.tsx`, `ui/client/CitationCopy.tsx` | Real edition/passage rendering + citation copy | provenance drawer, D08 denial negative test (M19-19) still open | **shippable (partial)** |
| 06 | UNILEX EXPLORER | `/terms`, `/terms/[stableId]`, `/figures`, `/constellation`, `data/queries/terms.ts` | Term + relation pages exist | no list alternative to graph for keyboard/mobile; uncertainty display unverified | **shippable (partial)** |
| 07 | MOONLAB RESEARCH | `/research` (public, withholding-tested) + HQ `world-monitor` | Public research page with source withholding | private case workspace + reviewer separation belongs to M14/M34 | **blocked (M34)** |
| 08 | WORLD MONITOR | Dock home `#world-monitor` card + HQ `(admin)/world-monitor` | Signal feed already rendered with sentiment/urgency | no freshness/uncertainty/revoked-source states; no map | **blocked (M24)** |
| 09 | PUBLISHING HUB | HQ `(admin)/views`, `(admin)/models` | Generic admin CRUD only | draft→rights→reviewer→released state machine absent (M18/M20) | **blocked (M18/M20)** |
| 10 | HARBOR COMMONS | — | Planned app, no code | requires ADR + new app | **blocked (M32/M37)** |
| 11 | WORKS / ECONOMY | — | Planned app, no code | requires ADR + D15/D16 review | **blocked (M35/M37)** |
| 12 | SKYLINK MESSAGING | `apps/skylink` (Fastify only), `docs/architecture/SKYLINK.md` | Service skeleton; no inbox UI, no pairing surface | operator inbox route + 4 connection states (M38) | **blocked (M38 UI not yet authorized)** |

Result: **one screen is fully shippable today** (01) and two more can be completed against real data (05, 06 partially). Screen 02 has no data owner at all. The rest are gated by an owner milestone or a missing ADR. That matches the plan's own ordering and forbids building 12 fake surfaces.

## 3. Rights / licence review of the reference assets (UI-F03)

`docs/design/mockups-xv/png/*.png` — 1920×1080, 11.9 MB total, `manifest.json` → `licenseReviewRequired: true`, `pngUse: "reference-only; pending rights review before production assets"`.

| # | File | Size | SHA-256 (first 16) |
|---|---|---|---|
| 01 | `01_dock_lighthouse.png` | 1 392 KB | `80c315c954c2652b` |
| 02 | `02_project_universe.png` | 1 299 KB | `4bcff08d6ab9907f` |
| 03 | `03_story_forge.png` | 1 265 KB | `859e0b788710b85c` |
| 04 | `04_poster_lab.png` | 1 333 KB | `aadad8f3293b5fe7` |
| 05 | `05_corpus_reader.png` | 839 KB | `960073f54982c220` |
| 06 | `06_unilex_explorer.png` | 1 007 KB | `0395aed20b33ea91` |
| 07 | `07_moonlab_research.png` | 857 KB | `c74461de3548f3b1` |
| 08 | `08_world_monitor.png` | 940 KB | `e1247803a21dfad5` |
| 09 | `09_publishing_hub.png` | 614 KB | `4f94d6b34b5a1e5d` |
| 10 | `10_harbor_commons.png` | 1 103 KB | `1749b20eff957935` |
| 11 | `11_works_economy.png` | 763 KB | `497af92fd2f4d62d` |
| 12 | `12_skylink_messaging.png` | 788 KB | `45ee7843a1785186` |

Findings:

- **Author / origin is not recorded** beyond "October 2026 design handoff" in `README.md`. No per-file author, no SPDX identifier, no signed consent.
- The images contain *illustrative* portraits, city art and station art. They are therefore **not cleared for redistribution inside the product** and must not be embedded as UI imagery, backgrounds or OG images.
- Decision: they remain **design reference only**. Implementation uses MoonUI semantic tokens and original CSS/SVG, never a cropped PNG.
- Blocking follow-up for QA-01: a signed rights ledger per asset (author, SPDX/consent, usage grant) before any raster is shipped.

## 4. MoonUI primitive inventory (UI-F04)

Available from `@moonwitness/moonui` (verified in `packages/moonui/src/index.ts`):

- Layout: `Card/CardBody/CardHeader`, `Panel`, `PageHeader`, **`Breadcrumbs`**, `SplitView`, `Stat`/`StatCard`, `StationGrid`, `ScheduleGrid`, `StickyPlayerBar`, `Alert`.
- Data: `DataTable`, `ChartList`, `EmptyState`, `Spinner`, `ProgressBar`, `Pagination`, `LiveDot`.
- Form: `Button`, `LinkButton`, `Field`, `TextInput`, `Textarea`, `SelectInput`, `Toggle` + metadata field widgets.
- Nav: `Nav`, `TabBar`, `Tabs` (roving tabindex), `UserChip`, `Glyph`, `Chevron`, `Kbd`.
- Zine/art: `BrandLogo`, `Crown`, `ModuleCard`, `PosterCard`, `Tape`, `ZineNote`, `StationSeal`, `MoonAvatar`.
- Feedback: `Tooltip`, `Skeleton`, `CardSkeleton`, `TableSkeleton`, `GlitchText`, `CyberFrame`, `CrtBackdrop`.
- Icons: 33 `Icon*` components + `tokens.ts` (`MOON_COLORS` etc.).

Gaps found while inventorying:

1. **No modal/dialog primitive is exported.** The 12 references use modal-like overlays (Poster Lab, Publishing Hub); the only dialog in production code is the Cockpit's local `CockpitConfirmModal`. A shared dialog has to be added before screens 03/04/09 can be built without duplicating.
2. **`Breadcrumbs` reaches the UI only through `PageHeader`** — 14 pages pass `breadcrumbs`, so the gap is not the primitive but the home header band (the mockup's "The Empire › Dock / Lighthouse" trail has no public equivalent for a root page).
3. **No screenshot/visual-regression harness.** `apps/dock/test` is behavioural (`node --test`), so `todo-ui.md` QA-05 "browser screenshots at 390/768/1440/1920" cannot be satisfied by the current tooling.
4. **No shared 4-state data component.** `EmptyState` + `Alert` + `Spinner` exist separately; each page composes them ad hoc, so the "loading/empty/error/ready" contract is not enforced centrally.
5. **No demo/provenance label primitive.** `Tape`/`Badge` are used as free-form tags; nothing prevents a sample counter from looking live.

## 5. What this audit changes in the plan

- Packets `UI-F05..F11` must be executed **inside Dock's existing shell**; the reference's 13-item left rail is not copied (M19-03 explicitly forbids burying Reader under dozens of equal labels). The four-space taxonomy (READ / EXPLORE / CREATE / SIGNAL) is safe because it maps to real routes.
- `UI-F16` (mobile drawer) is already implemented in `SiteHeader` with Escape + focus trap + restoration; remaining work is regression coverage, not a rewrite.
- `UI-F18` needs a new capability (screenshot harness) or must be recorded as environment-blocked; behavioural + geometry assertions are the honest substitute.
- Screens 03/04/07/08/09/10/11/12 stay blocked until their owner milestone or ADR authorizes the surface; screen 12 additionally needs an M38 UI decision.

## 6. Evidence commands

```
git rev-parse HEAD                       # 8737fe4
git ls-tree -r --name-only HEAD apps/dock/src/app | wc -l
grep -r "Breadcrumbs" apps/dock/src      # no matches
Get-FileHash docs/design/mockups-xv/png/*.png -Algorithm SHA256
```

Baseline gates measured at this anchor:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/dock test` | **53 tests, 53 pass, 0 fail** (17.6 s) |
| `pnpm --filter @moonwitness/cockpit test` | 27 tests, 27 pass (previous packet) |
| `pnpm ui:check` | 100 files, 0 violations |
