# UI-P02..P12 `*a` — D1 route / permission / component / data-owner audits

**Baseline:** branch `dev`, HEAD `fe8e84c`, recorded 2026-10-27.
**Scope:** the nine screens the plan marks with a TBD/proposed route — **02, 03, 04, 07, 08, 09, 10, 11, 12**. Screens 01, 05, 06 are out of scope here (they already have real routes).
**Nature:** read-only D1 audit. Nothing was ticked, edited, built, deployed or committed by this document.
**Method:** every claim below is a filesystem listing, a `file:line` citation, or a quoted document line that was actually observed in this tree. Running tests and browsers was explicitly out of scope, so all test-related statements are about *test source present at this SHA*, never about *tests executed at this SHA*.

> **Working-tree caveat (fact):** `git status --porcelain` at this session start listed modified files including `TODO.md`, `apps/arsy/src/app.ts`, `apps/arsy/src/modules/channels/index.ts`, `apps/skylink/src/modules/routes.ts`, `apps/dock/next-env.d.ts`, `apps/orbit/src/app/layout.tsx` and many `docs/audit/screens/*.png`. Where a dirty file is cited, the line number was re-taken from `git show fe8e84c:<path>` and is labelled **HEAD blob**. Do not read those citations as "committed equals working copy" for that one file.
>
> **Line drift warning (fact):** a second agent was working in this tree concurrently. `git rev-parse --short HEAD` at the end of this audit returned **`ed92b12`**, not `fe8e84c`, and the dirty set had grown (`apps/dock/src/lib/states-copy.ts`, `apps/dock/src/data/queries/constellation.ts`, `apps/dock/src/ui/components/constellation.tsx`, `apps/cockpit/client/lib/cockpit-copy.ts`, `scripts/ui/*`, plus new untracked `apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts` and `docs/audit/M38-12-arsy-skylink-client.md`). **Every line number in this document was re-resolved against `git show fe8e84c:<path>` and is correct for that SHA only.** A confirmed drift example: `apps/dock/src/lib/states-copy.ts:96/:237` (cited in §4) are at `:107/:259` in the newer tree. Re-resolve before acting. The findings themselves are structural (route existence, ACL shape, model/view registry membership), so drift does not weaken them — but the new `M38-12` artifacts mean §9 should be re-audited at the current HEAD.

---

## 0. Commands actually executed (route inventory half of the evidence)

```
git rev-parse --abbrev-ref HEAD            -> dev
git rev-parse --short HEAD                 -> fe8e84c
find apps/dock/src/app apps/headquarters/src/app apps/orbit/src/app aigateway/src -name page.tsx
find apps/cockpit apps/echolog apps/orbit -name "*.tsx"   (client dirs; -prune on node_modules)
find apps/skylink -path "*/node_modules" -prune -o -path "*/dist" -prune -o -type f -print
grep -rn "/projects" apps/dock/src         -> no output
git grep -n "mockups-xv/png" -- apps/      -> no output
```

### 0.1 Dock — actual route inventory observed (`find`, Next App Router)

`/`, `/constellation`, `/constellation/relations/[relationCode]`, `/denpa`, `/embed/[id]`,
`/figures`, `/figures/[figureCode]`, `/missions`, `/patches`, `/prisms`, `/reader`,
`/reader/compare`, `/research`, `/schedule`, `/stations`, `/stations/[id]`, `/studio`,
`/terms`, `/terms/[stableId]`, `/timeline`.

That is 20 page files. **This matches the operator's stated list exactly; nothing was missing and nothing extra was found.** Dock is fully public by design: `apps/dock/src/data/sdk.ts:4-10` states "no token: the dock only reads public views and posts the listen beacon". Dock's own middleware (`apps/dock/src/middleware.ts`) is the locale gate, not an auth gate.

### 0.2 Headquarters — actual route inventory observed

`/(admin)` (dashboard), `/(admin)/models`, `/(admin)/models/[model]`,
`/(admin)/models/[model]/[id]`, `/(admin)/models/[model]/new`, `/(admin)/system`,
`/(admin)/views`, `/(admin)/views/[view]`, `/(admin)/world-monitor`, `/login`.
Plus two route handlers: `src/app/api/session/route.ts`, `src/app/api/ops/stream/route.ts`.

**Matches the operator's stated list exactly.**

### 0.3 The other client surfaces

- `apps/cockpit` — Vite SPA, `client/App.tsx` + 12 components (Ledger/Logs/Media/Ports/Preview/Progress/Sidebar/TopBar/TunerSection + two modals). One app, tabbed, no URL routes.
- `apps/echolog` — Vite SPA, `client/App.tsx` + 4 components (ConfirmDialog, DetailPanel, ObjectList, UploadPanel). Dev server on port 3106 proxying `/api` and `/health` to ECHOLOG's own loopback port 3006 (`apps/echolog/vite.config.mjs:2-3,19-21`).
- `apps/orbit` — **Next.js app, not Vite** (`apps/orbit/next.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`). Exactly one route: `/`. Has its own locale middleware (`apps/orbit/src/middleware.ts:15-21`).
- `apps/skylink` — **no UI at all.** The complete non-`node_modules`/non-`dist` file list is: `package.json`, `src/{auth,channels,config,events,index,server,ws}.ts`, `src/modules/{routes,webhooks}.ts`, `test/{control-plane,skylink}.test.ts`, `test/tsconfig.json`, `tsconfig.json`. `find apps/skylink -name "*.tsx" -o -name "*.html"` returned only `dist/.tsbuildinfo`. This re-confirms `todo-ui-2.md:11` and supersedes the older "M38-07 health skeleton" wording in `AGENTS.md:10` (see §12).

---

## 1. UI-P02 — PROJECT UNIVERSE

Plan line, verbatim (`todo-ui.md:79`):

> Reference: [`02_project_universe.svg`](docs/design/mockups-xv/02_project_universe.svg) · Canonical task owner: **M17 / M19** · Code owner: `Dock projection + HQ editor` · route: `/projects (proposed)`.

Leaf being audited, verbatim (`todo-ui.md:81`):

> **UI-P02a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.

### 1.1 Route — NO ROUTE in Dock, but a live host of the *same name* already ships in HQ

- `grep -rn "/projects" apps/dock/src` → **no output**. There is no `/projects` directory under `apps/dock/src/app` (§0.1). The plan's proposed Dock route does not exist.
- **Major finding — the plan's premise is incomplete.** Headquarters already renders a panel literally called "Project Universe" on its admin dashboard: `apps/headquarters/src/app/(admin)/page.tsx:349` (`<section className="hq-mc-bottom-grid" id="project-universe">`), containing `<Panel title="Project Universe" subtitle="All projects, worlds and creative universes.">` and a `PosterCard` grid at lines 360-371.
- That existing panel is **not data**. It is fed by a hardcoded module-level constant `const PROJECTS: ReadonlyArray<...>` at `apps/headquarters/src/app/(admin)/page.tsx:33`, with four fabricated entries: THE BATTERIES (line 42, `progress: 72`, `href: '/models/station'` line 47), PENDETA-ONLINE (50, `progress: 58`, `href: '/models/scheduleSlot'` 55), ALLAH-PROMISE (58, `progress: 34`, `href: '/views/stationCatalog'` 63), ZILL (66, `progress: 18`).
- Two of those four links are **broken routes today**. `isModelName` (`apps/headquarters/src/data/queries/registry.ts:5`) tests membership in `MODEL_NAMES` (`packages/moonql-client/src/generated.ts:2556`), which contains `stations` and `schedule_slots`, **not** `station` or `scheduleSlot` (`grep -c "'station'"` and `grep -c "scheduleSlot"` on generated.ts both returned 0). `/(admin)/models/[model]/page.tsx` calls `notFound()` for an unknown model, so `/models/station` and `/models/scheduleSlot` render 404. `/views/stationCatalog` and `/models` are the only two that resolve.
- Nearest real Dock data hosts, for honesty's sake: `/missions` is a sourced projection over the Figure Registry (`apps/dock/src/app/missions/page.tsx:2` imports `readMissions` from `@/data/queries/actors`), and `/figures`, `/terms`, `/constellation` carry canonical IDs. Dock's `/prisms` and `/timeline` are **static in-file constants**, not projections: `apps/dock/src/app/prisms/page.tsx:12-26` hardcodes `const PRISMS: PrismFunction[] = [...]`, and `apps/dock/src/app/timeline/page.tsx:10-19` hardcodes `const ERAS: NarrativeEra[] = [...]`. `apps/dock/test/panel-state-contract.test.mjs:238` explicitly pins that behaviour ("static routes stay static instead of gaining fake data states"). So `/prisms` and `/timeline` are narrative-heritage pages, not a project register.

### 1.2 Permissions

- No Dock `/projects` route exists, so there is nothing to guard.
- The existing HQ host is protected by the general HQ gate, not by a project-specific rule: cookie-presence middleware `apps/headquarters/src/middleware.ts:11` (public list `['/login','/api/session']` at line 4), then the real boundary in `apps/headquarters/src/app/(admin)/layout.tsx:5-7` (`me()` → `redirect('/login?error=expired')`), where `me()` resolves the session against the Hub (`apps/headquarters/src/data/queries/session.ts:13-15`). The `PROJECTS` panel needs no guard because it reads nothing.
- The project card badge is fake regardless of role: `apps/headquarters/src/app/(admin)/page.tsx:185-186` renders `<Badge tone="ok">12 active projects</Badge>` and `<Badge tone="cyan">4 in review</Badge>` as literals.

### 1.3 Reusable components to reuse (read from the package, not invented)

`packages/moonui/src/index.ts` exports exactly the primitives this screen needs: `Panel`, `PageHeader`, `Card`/`CardHeader`/`CardBody`, `PosterCard`, `Badge`, `DataTable`, `EmptyState`, `Field`, `TextInput`, `SelectInput`, `Alert`, `Stat`/`StatCard`, `Tabs`/`TabBar`, `Breadcrumbs`, `Nav`, `Skeleton`/`CardSkeleton`, `CyberFrame`, `Crown`, `Tape`, `ZineNote`, plus `@moonwitness/moonui/client`'s `Modal`/`AlertDialog`/`SearchFilterBar`/`CommandPalette`/`ToastProvider` and `tokens.ts` (`MOON_COLORS`, `MOON_FONTS`, …).
App-level, Dock-side: `OutcomePanel`/`readPanel`/`PanelState`/`DataPanel` + the `PanelCopy` four-state contract (`apps/dock/src/ui/components/states.tsx:9,74,81,92,127,144,161`), `SourceEvidence` (`apps/dock/src/ui/components/provenance.tsx`, also used by `actors.tsx`, `constellation.tsx`, `graph-relation.tsx`, `terms.tsx`), and `SpaceCard`/`SpaceGrid` with the honest `SpaceStatus = 'REAL' | 'PLANNED' | 'DEMO'` enum (`apps/dock/src/ui/components/spaces.tsx:19`). Locale catalogues: `apps/dock/src/lib/{landing-copy,states-copy,provenance-copy,reader-copy}.ts` + `locale-context.mjs`. HQ already uses `PosterCard` for this panel (line 362), so the primitive is proven; the data is not.

### 1.4 Data owner — none exists; do not invent one

- Hub surface facts: `MODEL_NAMES` (`packages/moonql-client/src/generated.ts:2556`) contains **no** project/world/arc/episode/scene model. `VIEW_NAMES` (`generated.ts:2557`) contains no project view. So there is no projection to consume and no model to edit.
- Domain owner per `BLUEPRINT.md` §4 table: **D07 Story & Media** owns "World, arc, character, episode, scene, poster/media manifest, editorial variants" (line 219 area), and D01 owns corpus works. Neither is implemented for "projects".
- Canonical task owner per the plan is **M17 / M19**. In `TODO.md` M17 is "Story canon, characters, four books and SHADOW" with **all** leaves unchecked — `M17-03 — Define story world, arc, episode, scene and version graph` (TODO.md:419) and `M17-05 — Build SHADOW editor as HQ workspace on shared auth` (TODO.md:420). No M17 leaf names a projects surface or a query.
- **Blocking prerequisite, stated as the blockers register states it** (`docs/audit/ui-blocked-screens-8737fe4.md:9`): "M17 owner files a route + data-owner decision naming the query module, then a packet can be opened." Re-verified against current code: the register's core claim (`grep -r "/projects" apps/dock` = 0) still holds at `fe8e84c`, but its "Reality in code" column is now **incomplete** — it does not mention the existing HQ `#project-universe` panel at `(admin)/page.tsx:349`.

### 1.5 Differences from the reference (`02_project_universe.svg`, read as text)

The SVG labels itself honestly: `CONCEPT · NOT LIVE`, `CONCEPT · NO INVENTED PROGRESS`, and a footer `MOONWITNESS XV / MOONUI DESIGN REFERENCE / SVG CONCEPT / NO LIVE DATA`, plus the `02 / 12` index. Depicted, and not in code:

| Mockup element | Reality at `fe8e84c` |
|---|---|
| Left rail with 13 entries (MISSION CONTROL … SKYLINK) | Rejected by ADR-0009 §2.2 ("The 13-item rail is rejected"); Dock uses header nav + `PageHeader` breadcrumbs |
| Global "Search everything…" field | Not shipped by design — ADR-0009 §2.3: "no cross-surface query endpoint exists; a dead field is a false affordance" |
| `02 / 12` index counter | Not shipped — ADR-0009 §2.3 |
| Filter group WORLDS / CHARACTERS / SERIES / RESEARCH LENS / SOURCE TRACE | No owning model, no view, no query module. Building these now would be pure chrome over nothing |
| Six project cards (THE BATTERIES, PENDETA ONLINE, ALLAH-PROMISE, ZILL, ROCKSOUL, MOONWITNESS) each with progress | HQ's `PROJECTS` const already shows the **first four with invented `progress` numbers 72/58/34/18**. This is the exact "invented progress" the SVG itself disclaims |
| "Stories and worlds separated from canonical source data" | Not separated anywhere; there is no story data at all |

**Fabrication risk if built now:** rendering `progress`, counts, or a "Canon index" status. ADR-0009 §2.5 forbids invented counters; `todo-ui.md:37` (UI-F11, already closed) is the rule that forbids fake live counters. Also note `apps/headquarters/public/art/proj-{allah,batteries,pendeta,zill}.jpg` exist and are already served as the card images for this fake panel; `docs/audit/ui-baseline-8737fe4.md` contains **no** ledger entry matching `proj-` or `public/art` (`grep -n "proj-batteries\|public/art" docs/audit/ui-baseline-8737fe4.md docs/design/mockups-xv/README.md` → no output), so their rights provenance is unverified from this evidence set (inference, not fact, that they are unresolved).

---

## 2. UI-P03 — STORY FORGE

Plan line, verbatim (`todo-ui.md:89`):

> Reference: [`03_story_forge.svg`](docs/design/mockups-xv/03_story_forge.svg) · Canonical task owner: **M17 / M33** · Code owner: `HQ initially; separate SHADOW only if approved` · route: `private draft route TBD`.

### 2.1 Route — NO ROUTE, and no model for it to render

- No `/projects`-style story route in Dock (§0.1) and no story route in HQ (§0.2).
- **The host does exist generically.** HQ's schema-driven editor is a real, working private workspace: `/(admin)/models/[model]`, `/(admin)/models/[model]/[id]`, `/(admin)/models/[model]/new`, driven entirely by the Hub `_schema` document (`getSchema()` + `RecordForm` + `fields/widgets`), i.e. "the generic CRUD editor" the blockers register calls it (`docs/audit/ui-blocked-screens-8737fe4.md:10`).
- But there is **nothing to forge**: `MODEL_NAMES` (`generated.ts:2556`) has no `story_*`, `scene_*`, `draft_*`, `arc_*` or `episode_*` model. `UI2-P21` treats the same editor as its own screen 21, so STORY FORGE is a *feature* of an existing host, not a new route.

### 2.2 Permissions as built (this is the strongest part of the tree)

The HQ private boundary is genuinely server-side, with three layers, all re-verified at this SHA:

1. `apps/headquarters/src/middleware.ts:4` (`PUBLIC = ['/login','/api/session']`), `:11` (cookie-presence check on `hq_token`), `:13-16` (redirect to `/login?next=…`). **This is explicitly NOT the authorization boundary** — `session-auth.test.ts:22` pins "a present HQ cookie passes only middleware; the Hub decides whether it is a session".
2. `apps/headquarters/src/app/(admin)/layout.tsx:5-7` — `const user = await me(); if (!user) redirect('/login?error=expired')`.
3. Per-operation ACL: `apps/headquarters/src/lib/authz.ts` — `guardModel` (`:82`), `guardView` (`:87`), `guardEndpoint` (`:97`), all funnelling through `decideAccess` (`:50-62`) and `enforce` (`:72-79`). Its header comment (`:10-16`) states the ownership rule plainly: "HQ is NOT an auth or ACL owner… There is no local role table… HQ can only ever be as strict as the API is."
   - Cookie is `httpOnly`, `sameSite: 'lax'`, `secure` in production: `apps/headquarters/src/lib/session.ts:8,13-18` (`SESSION_COOKIE = 'hq_token'`).
   - **Only a Hub 401 means anonymous; 5xx/503 stays `unavailable`, never a fake sign-out**: `apps/headquarters/src/lib/session-auth.mjs:4-11`, `session.ts:13-15`, `authz.ts:56-58`.
   - **Re-verified correction to `docs/audit/M20-01` finding N1.** M20-01 (line 29-51 area) recorded "ungated write forms" at `models/[model]/new/page.tsx:21,42`. That is **no longer true** in this tree: `apps/headquarters/src/app/(admin)/models/[model]/new/page.tsx:29-30` now runs `const guard = await guardModel(meta, 'create')` followed by `if (!guard.allowed) return <AccessDenied code={guard.code} />`, with the comment at `:27-28` "create is a privileged affordance… enforced here, server-side, before any related-row options are fetched". Same pattern on `[id]/page.tsx:28-30` and `models/[model]/page.tsx:35-44`. N1 can be treated as closed in source; N4 (§6.2 below) is **not**.

### 2.3 Reusable components

MoonUI: `Field`, `TextInput`, `Textarea`, `SelectInput`, `Toggle`, `Tabs`/`TabItem`, `Panel`, `SplitView`, `Alert`, `Badge`, `Modal`/`AlertDialog` (ADR-0009 §2.4: "Dialogs do not need a new primitive"). HQ already has the field-widget registry: `packages/moonui/src/index.ts` exports `FIELD_WIDGETS`, `WIDGET_KINDS`, `fieldWidgetFor`, `StrField`, `TextField`, `IntField`, `BoolField`, `SelField`, `M2oField`, `TsField` — consumed by `apps/headquarters/src/ui/widgets/RecordForm.tsx` and `apps/headquarters/src/ui/fields/*`. `UI2-G09` (todo-ui-2.md:38) already owns "Define HQ schema-driven form components and a11y/role tests separately from publishing approval state machine" — so STORY FORGE must not fork those widgets.

### 2.4 Data owner

- **D07 Story & Media** (`BLUEPRINT.md` §4): "World, arc, character, episode, scene, poster/media manifest, editorial variants" with the anti-overlap note "SHADOW workspace consumes it". D07 has no implemented addon: no `packages/moonql-story*` exists (the `packages/` listing has `moonql-{actors,apikeys,auth,base,corpus,graph,journey,monitor,ontology,ops,playlog,schedule,settings,stations,unilex}` only).
- Canonical tasks: `M17-03` (story world/arc/episode/scene/version graph) and `M33-03` (`TODO.md`: "Specify D07 scene version and media rights"), both **unchecked**. `M33-01` ("Inventory existing generator and HQ Story plans") is the natural predecessor and is also unchecked.
- Per `todo-ui.md:21`: "Implement Story/Poster/Research as authorized workspaces in the existing HQ first; split into SHADOW/MoonLab/Harbor/WORKS only after their accepted milestone/ADR decisions." No SHADOW ADR exists in `docs/decisions/` for it.

### 2.5 Differences from the reference (`03_story_forge.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › SHADOW", footer `NO LIVE DATA`, `03 / 12`.
Depicted, absent in code: Story Outline (Logline / Four-book arc / Episode-chapter / Scene beats / Characters / Rights & attribution), a Scene Board with ACT 01–04 each carrying "Beat • source links • version history", and a REVIEW/PROVENANCE column ("Witness vs fiction", "Media license", "Citation links", "Consent status", "Version compare", "Review decision").
**Fabrication flags if built now:** version history, review decisions, consent status and rights/attribution states would all be unverifiable — there is no `scene_versions`, no rights store, and no review queue. D08 (Publication & Governance) has no implementation: `apps/arsy/test/public-projection-denial.test.ts:1252-1255` proves it from the live registry — "D08 (Publication & Governance) is planned-only — no `@moonwitness/governance` addon and none of `release_manifests` / `rights_approvals` / `editorial_signoffs` / `takedown_logs` exist (proved above from `moonql.registry.models`)".

---

## 3. UI-P04 — POSTER LAB

Plan line, verbatim (`todo-ui.md:99`):

> Reference: [`04_poster_lab.svg`](docs/design/mockups-xv/04_poster_lab.svg) · Canonical task owner: **M18 / M33** · Code owner: `Existing GeneratorStudio before new renderer` · route: `private studio route TBD`.

### 3.1 Route — HOST EXISTS, at `/studio` in Dock, and it is **public**, not private

This is the sharpest route/ownership contradiction found. The plan's route line says `private studio route TBD` and the code owner says "Existing GeneratorStudio"; `apps/dock/src/app/studio/page.tsx` **exists** at this SHA:

```
3   import { GeneratorStudio } from '@/ui/client/GeneratorStudio'
11  export default function StudioPage(): ReactNode {
12    return <GeneratorStudio />
```

`/studio` is a Dock route, so it sits behind Dock's locale middleware only (`apps/dock/src/middleware.ts`) — **there is no auth boundary on `/studio`, because Dock has no auth at all** (`apps/dock/src/data/sdk.ts:4-10`: "no token"). ADR-0009 §2.2 resolved this deliberately: `CREATE | /studio | DEMO (publishing awaits M33)` — a public *demo* generator, and `apps/dock/src/ui/components/spaces.tsx:126-134` implements exactly that (`status: 'DEMO'`, `href: localizedDockHref('/studio', …)`).

What `GeneratorStudio` actually is (`apps/dock/src/ui/client/GeneratorStudio.tsx`, 817 lines): a client-side deterministic SVG generator with three tabs — `AVATAR FORGE`, `HERALDIC SEAL FORGE`, `VECTOR GLYPH FORGE` (lines 718-722) — using `MoonAvatar`, `StationSeal`, `Glyph` from MoonUI. It is **not** a poster compositor: there is no canvas, no layer stack, no selected-object model, no shape/brush/palette editing beyond a colour pill row (lines 434-438).

### 3.2 Permissions as built

- `/studio`: **none** (public Dock). If POSTER LAB's export gate is meant to be private, the current host is the wrong trust level — and moving it private would break the `/studio` link ADR-0009 §2.2 already adopted as the public CREATE space.
- Export is real and ungated. `GeneratorStudio.tsx:666-672` serialises the preview `<svg>` with `XMLSerializer`, wraps it in a `Blob`, and triggers `link.download = \`${filename}.svg\``; `:680-694` does the same for a rasterised PNG at `exportDimension = 1024`. `:647-648` copies SVG to clipboard. **There is no rights check, no consent check, no approval step anywhere on that path.**

### 3.3 Reusable components

Already used by the existing host — reuse these, do not add renderer primitives: `Tabs`, `Card`/`CardHeader`/`CardBody`, `Badge`, `Pill`/`PillGroup`, `Button`, `TextInput`, `LiveDot`, `Tape`, `MoonAvatar`, `StationSeal`, `Glyph`, `MOON_COLORS` (`GeneratorStudio.tsx:4-31`), plus `triggerHaptic` from `@moonwitness/moonui/client` (`:32`). For a future poster canvas the plan itself forbids a new renderer: `todo-ui.md:9` "no … second renderer", `todo-ui.md:215` "do not duplicate … the media renderer", and `M33-04` ("Specify single renderer and HQ review handoff") owns the single-renderer decision.

### 3.4 Data owner

- Poster/media manifests belong to **D07** (`BLUEPRINT.md` §4, "poster/media manifest") and asset provenance to **D13 Design (Git)** ("UI contracts, tokens, sensory feedback, brand, asset provenance"). Neither has a model: no `poster*`, `asset*` or `media_manifest*` name in `MODEL_NAMES` (`generated.ts:2556`).
- Export approval → M18: `M18-01` (publication state machine **spec**) is closed (`docs/audit/M18-01-single-publication-state-machine.md:15` defines `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`), but `M18-02` "Store edition/body license, media consent and reviewer evidence" and `M18-03` "Create immutable release manifest" are **unchecked** — so the approval state the mockup's "EXPORT GATE › HUMAN APPROVAL" needs has no owner row that is done.
- Asset consent → `M33` (`M33-03`, `M33-05`) and `M17-06` "Track original poster/music/derived media license and manifests", all unchecked.
- `todo-ui.md:41` (UI-F08, unchecked) is the other real blocker: "Build/verify one common Crown/Logo/DistressedBorder pattern using semantic tokens and original SVG." Primitives exist in MoonUI (`Crown`, `DistressedBorder`, `BrandLogo`, `ModuleCard`, `PosterCard`, `Tape`, `ZineNote`) but that leaf is not closed.

### 3.5 Differences from the reference (`04_poster_lab.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › SHADOW", "Single renderer, layered artwork, reviewable media rights", `04 / 12`.
Absent in code: TOOLS+ASSETS rails for LAYERS / SHAPES / TYPOGRAPHY / BRUSHES / COLORS / SOURCE LINKS; a "POSTER CANVAS — PREVIEW"; the six-step EXPORT GATE (CANVAS 16:9, ALT TEXT, RIGHTS REVIEW, ORIGINAL ASSET, HUMAN APPROVAL, EXPORT PREVIEW).
**Fabrication flags if built now:** all six export-gate steps. Rendering "RIGHTS REVIEW ✓" or "HUMAN APPROVAL" would assert a D08 capability that `public-projection-denial.test.ts:1252-1255` proves does not exist. A 16:9 canvas preset is buildable as pure tooling, but any "publish" button would be the first fake approval surface in the repo.

---

## 4. UI-P07 — MOONLAB RESEARCH

Plan line, verbatim (`todo-ui.md:129`):

> Reference: [`07_moonlab_research.svg`](docs/design/mockups-xv/07_moonlab_research.svg) · Canonical task owner: **M14 / M34** · Code owner: `HQ research desk until scope approved` · route: `private research route TBD`.

### 4.1 Route — HOST EXISTS, and it is a **public** Dock route, not a private HQ one

`apps/dock/src/app/research/page.tsx` exists (§0.1). It is an honest fail-closed stub, not a workspace:

```
14  export default async function ResearchPage(): Promise<ReactNode> {
28      <Alert tone="hot">{copy.errorResearchUnavailable}</Alert>
```
with `export const dynamic = 'force-dynamic'` at `:7`. The notice is localized in both catalogues: `apps/dock/src/lib/states-copy.ts:96` (en: "The research ledger is withheld until an approved D08 public projection is available.") and `:237` (id). `apps/dock/src/app/reader/compare/page.tsx:30` renders the same notice.
There is **no** research route in HQ (§0.2). So the plan's "HQ research desk / private research route TBD" is accurate about the *private* desk (it does not exist) but incomplete about the *public* surface (it does exist, deliberately, and is guarded by a regression test).
**M34-02 has already decided the placement** (`TODO.md:741`, closed): "integrator review accepted the recommendation of a private research desk inside Headquarters, with D05 data still owned by the ARSY/MoonQL research addon, no `apps/moonlab`, no new identity/SQL owner/Hub/review engine, and Dock kept fail-closed until a D08 projection exists (M34-04/M19-19)."

### 4.2 Permissions as built

- Public `/research`: intentionally has no auth because it reads nothing. Pinned by `apps/dock/test/research-public-withholding.test.mjs:12-15`: asserts the page source does **not** import `readResearchRegistry|ResearchExplorer|serverClient|.model(`, does not reference `research_(cases|frames|witnesses|hypotheses)`, and does render the withholding Alert. Also `apps/dock/test/panel-state-contract.test.mjs:281` ("the research route stays a fail-closed denial, not a panel state").
- **But the Hub side is not fail-closed.** Re-verified at this SHA: `packages/moonql-research/src/index.ts:690-694` declares `hypotheses: { method: 'GET', path: '/research/hypotheses', requires: 'public', … }`. `TODO.md:14` records the same re-verification at M34-01 closure. Additionally **all seven research models use `ADMIN_WRITE`**, which only gates writes: `packages/moonql-research/src/index.ts:362,385,411,432,454,492,517`. `packages/moonql/src/model.ts:31-37` documents the consequence — "reads stay public, writes need admin" — and `packages/moonql/src/rest.ts:120-122` shows `guard()` returns `undefined` (no preHandler) when the rule is absent or `public`. So `GET /orm/research_cases`, `/orm/research_frames`, `/orm/research_claims`, `/orm/research_witnesses`, … are anonymous-readable REST lists.
- If MOONLAB becomes an HQ desk, the available boundary is `guardModel(doc.models['research_cases'], 'list')` / `guardEndpoint(doc, 'GET', '/research/hypotheses')` (`authz.ts:82,97`), which HQ already uses elsewhere. Note `guardEndpoint` refuses an endpoint the Hub does not publish rather than guessing (`authz.ts:91-101`).

### 4.3 Reusable components

Dock-side: `SourceEvidence` (`apps/dock/src/ui/components/{provenance,constellation,graph-relation}.tsx`), `OutcomePanel`/`readPanel` + `PanelCopy` (`states.tsx:92,127,74`), `states-copy.ts` catalogue. MoonUI: `Panel`, `PageHeader`, `Badge`, `DataTable`, `Tabs`, `Stat`, `ProgressBar`, `EmptyState`, `Alert`, `Modal`/`AlertDialog`. The four-state contract is the honest-state requirement `todo-ui.md:36` (UI-F10) and QA-07 lean on.

### 4.4 Data owner — **D05 Research, implemented and reachable**

This is the one blocked screen whose data domain is genuinely built:
- Models exist: `research_cases`, `research_frames`, `research_claims`, `research_relations`, `research_witnesses`, `research_quality_runs`, `research_hypotheses` (`generated.ts:2556`).
- Addon exists: `packages/moonql-research/src/{common,gates,historical-pilot,index,projection,review,review-subsystem,seed}.ts`.
- Four-eyes governance exists: `apps/arsy/test/mizan.test.ts` has 7 tests — `:195` "named role-scoped draft/submitted/reviewed machine, no auto approval", `:655` "M14-06: wrong role, forged evidence and a concurrent approval race", `:728` "M14-07: release criteria stay fail-closed while publication is unavailable".
- **Missing:** a released/approved public projection. `VIEW_NAMES` (`generated.ts:2557`) has **no** research view — D05 has a model layer but no curated projection, which is exactly what `M34-04` "Specify D08 released research projection" must produce. `M34-03`, `M34-04`, `M34-05` are all unchecked in `TODO.md:742-744`.
- No second owner may be created: D05 stays in ARSY/MoonQL per M34-02's wording above.

### 4.5 Differences from the reference (`07_moonlab_research.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › MOONLAB", `07 / 12`.
Absent: CASE FILES (RESEARCH QUESTION / HYPOTHESIS-DRAFT / EVIDENCE LEDGER / COUNTEREVIDENCE / ATTRIBUTION-BIAS / OPEN QUESTIONS), an EVIDENCE BOARD with four lanes each stamped "No unsupported claim is published", and a REVIEW WORKFLOW (PREPARED → SUBMITTED → HUMAN REVIEW → APPROVED PROJECTION → RETRACT/CORRECT).
**Fabrication flags:** "APPROVED PROJECTION" and "RETRACT / CORRECT" are D08 release/withdraw controls; `M18-04` (withdrawal/takedown) and `M34-04` are open, and `apps/arsy/test/public-projection-denial.test.ts:1143` asserts today that "no public research projection can render a released state". Building the workflow strip now would render a state machine that the tests prove does not exist. Screen 07's own leaf `UI-P07e` ("Only approved D08 projections can reach public UI") is the same gate.

---

## 5. UI-P08 — WORLD MONITOR

Plan line, verbatim (`todo-ui.md:139`):

> Reference: [`08_world_monitor.svg`](docs/design/mockups-xv/08_world_monitor.svg) · Canonical task owner: **M24** · Code owner: `Proposed source-backed WORLD projection` · route: `world route TBD`.

### 5.1 Route — HOST EXISTS **twice**, and neither is the plan's "world route"

1. **HQ `/world-monitor` — a full private, data-backed World Monitor exists.** `apps/headquarters/src/app/(admin)/world-monitor/page.tsx` (verified in §0.2). It implements the mockup's three-tier drill-down as real server-side filtering: radar → sources → signals, lines 111-133, with query params `radar|source|platform|driver` (`:25-30`) and `buildHref` (`:134+`). `todo-ui-2.md:10` states it plainly: "HQ already renders the schema editor and World Monitor." Its UI-II row is screen 22 (`todo-ui-2.md:132-139`), which is a *usability* task on the existing route, not a build task.
2. **Dock `#world-monitor` — a public world card on the home page.** `apps/dock/src/app/page.tsx:74` `<Card id="world-monitor">`, rendered only when `{payload.signals?.length ? … : null}` (`:73`), showing the first six signals (`:95`). Data comes from a real Hub view: `apps/dock/src/data/queries/program.ts:10` (`type MonitorSignal = ViewOutputs['monitorSignalFeed']`) and `:106` (`client.view('monitorSignalFeed').read({ limit: 6 })`).
3. There is **no** `world` route in Dock and none in HQ other than `(admin)/world-monitor`. The plan's `world route TBD` is therefore stale for the private desk and unaddressed for a public WORLD surface — M24-05 ("Build source-backed public World Monitor with stale flags") remains the open owner of any public route.

### 5.2 Permissions as built

- HQ `/world-monitor` is the best-guarded page in this audit set: session via layout (`(admin)/layout.tsx:5-7`) **plus** an explicit server-side read gate before any fetch — `:94-98`: "read gate: the hub's published `/monitor/overview` ACL, checked server-side before the snapshot is requested", then per-affordance `can()` checks `:100-105` (`canCreateRadar`, `canCreateSource`) and `:12` imports `guardEndpoint` from `@/lib/authz`.
- Dock `#world-monitor` is public by design and honest about it: it only renders when the hub answered with rows.
- **Re-verified against `docs/audit/M20-01` (prior HQ guard evidence, as instructed) — one finding persists, one is fixed, one moved.**
  - **PERSISTS (N4):** `packages/moonql-monitor/src/index.ts:701-705` defines the `overview` endpoint with `path: '/monitor/overview'`, `method: 'GET'`, a `menu` and a `handler` — and **no `requires:` key at all**. With `roleRule === undefined`, `packages/moonql/src/rest.ts:120-122` returns `undefined`, i.e. installs no preHandler. Every sibling monitor endpoint *does* declare one (`:763,765,801,803,876,878` — `requires: ['admin','bot']`). Consequence: `monitor_radars`/`monitor_sources`/`monitor_signals`/`monitor_tasks` rows — including `aiSummary`, `author`, `url`, `targetUrl` — are anonymous-readable straight through the API whenever the hub is network-reachable; HQ only masks this behind cookie presence. This is the single most important permission finding for screen 08.
  - **FIXED (N1):** HQ write forms are now guarded — see §2.2.
  - **LINE DRIFT:** M20-01 cited `ThreatRadarMap` receiving only `selectedRadarId` at world-monitor line 179; at `fe8e84c` the call is `:203` (`<ThreatRadarMap selectedRadarId={selectedRadarId} />`). Substance unchanged.

### 5.3 Reusable components

The page already uses `Badge`, `Card`, `Crown`, `DataTable`, `LinkButton`, `LiveDot`, `ModuleCard`, `PageHeader`, `Panel`, `ProgressBar`, `StatCard`, `ZineNote` (`world-monitor/page.tsx:1-17`) and the client component `ThreatRadarMap` (`:23`). Dock's home card uses `Card`/`CardBody`/`Tape`/`BadgeTone`. For honest states Dock has `OutcomePanel`/`readPanel`/`PanelCopy` (`states.tsx:74,92,127`) and `states-copy.ts`; HQ's denial view is `apps/headquarters/src/ui/widgets/AccessDenied.tsx` with localized copy in `apps/headquarters/src/lib/denial-copy.ts`.

### 5.4 Data owner — **WORLD (D10), partially real; freshness/uncertainty unowned**

- Real today: `packages/moonql-monitor/src/index.ts` + models `monitor_radars`, `monitor_sources`, `monitor_signals`, `monitor_tasks` (`generated.ts:2556`) + views `monitorHierarchy`, `monitorActiveSources`, `monitorSignalFeed`, `monitorSignalsByPlatform`, `monitorSignalsByRadar`, `empireSystemsOverview` (`generated.ts:2557`).
- The fields the mockup demands mostly exist as *row columns*: `MonitorSourcesRow` has `lastCheckedAt`, `healthStatus: 'healthy' | 'degraded' | 'idle'`, `failCount`, `intervalMin`, `active` (`generated.ts:349-369`); `MonitorSignalsRow` has `sentiment`, `urgencyScore`, `status: 'new'|'analyzing'|'verified'|'flagged'|'promoted'`, `publishedAt` (`generated.ts:399-421`). So freshness and uncertainty are representable without new SQL. `grep -niE "freshness|uncertain|stale|revoke" packages/moonql-monitor/src/index.ts` → **no output**, confirming there is no derived freshness/uncertainty *model* yet — exactly what `M24-02` ("Specify source, units, geo precision, temporal and revision model") and `M24-05` own; both unchecked (`TODO.md:567`).
- `BLUEPRINT.md:80` classifies **WORLD as "(optional)"** with canonical kind "World-source quality"; `BLUEPRINT.md:208` (D10) says "Cosmos/world views, no physical-device claim".
- **Error-laundering defect, re-verified:** `apps/headquarters/src/data/queries/monitor.ts:51-55` — `.catch(() => EMPTY_OVERVIEW)`. A hub 403/500 renders as "zero radars", directly contradicting the fail-loud rule HQ itself declares at `data/queries/session.ts:6-14` and `lib/session-auth.mjs:4-11`, and contradicting `apps/dock/test/panel-state-contract.test.mjs:213` ("a hub failure is never laundered into an empty panel"). Dock is pinned to that rule; HQ's monitor path is not.
- Deliberately **not** proposed here: no new hub, no new SQL owner, no new world service. D10/WORLD via the existing `moonql-monitor` addon is the only legitimate feeder.

### 5.5 Differences from the reference (`08_world_monitor.svg`)

Self-labelled `CONCEPT · NOT LIVE`, and unusually honest about its own fake parts: `TIME: SAMPLE ONLY`, `OBSERVATION: PROPOSED`, `CITATION: REQUIRED`, `FRESHNESS: UNKNOWN`, `QUALITY: UNVERIFIED`, **`NO LIVE FEEDS CLAIMED`**, `08 / 12`.
Absent in code: a WORLD SIGNAL MAP with real geography; per-observation freshness/uncertainty rendering; a citation affordance.
**Fabrication flags — the biggest one is already shipped.** `apps/headquarters/src/ui/client/ThreatRadarMap.tsx:18-25` renders `const DEFAULT_TARGETS: RadarTarget[]` — six invented theatres ("Asia-Pacific Geopolitics", "Levant & MENA Corridor", "Eastern European Theater", "North American Defense Grid", "South American Resources", "Sub-Saharan Minerals & Energy") each with invented `signals` (42/29/56/18/12/24), invented `urgency` (88/74/92/45/38/65) and invented `status: 'critical'|'warning'|'active'`. The page passes it only `selectedRadarId` (`world-monitor/page.tsx:203`) — **no real radar row reaches the map**. Under ADR-0009 §2.5 that is a fabricated global threat map presented inside the real admin product, and it is the screen-08 equivalent of the fake live metrics the plan forbids (`todo-ui.md:195` "no invented `LIVE` metrics"). Same pattern on the HQ dashboard: `(admin)/page.tsx:211-212` `{monitor.counts.signals || 46} active signals` / `|| 10} radars`, `:264-265` `|| 12} live sources` / `|| 3} alerts`, `:292` `{Math.max(18, crons.length)} active workflows`, `:293` `{ops.jobs.length || 3} runs`, `:94` a literal `'Publishing queue delayed (2 items)'` in `MISSION_ALERTS`, and a hardcoded "ALERTS" badge in `apps/headquarters/src/layouts/vertical.tsx`. Screen 08's `*b` leaf must not inherit these.

---

## 6. UI-P09 — PUBLISHING HUB

Plan line, verbatim (`todo-ui.md:149`):

> Reference: [`09_publishing_hub.svg`](docs/design/mockups-xv/09_publishing_hub.svg) · Canonical task owner: **M18 / M20** · Code owner: `apps/headquarters` · route: `private publishing route TBD`.

### 6.1 Route — NO ROUTE; the only "Publishing Hub" in code is a hardcoded dashboard card

- No `/publishing` route in HQ (§0.2).
- **Finding:** `apps/headquarters/src/app/(admin)/page.tsx:269-280` renders `<ModuleCard href="/models/scheduleSlot" icon="PH" tone="pink" title="Publishing Hub" description="Prepare and publish across platforms and communities." …/>` with metrics `<Badge tone="ok">5 scheduled</Badge>` and `<Badge tone="cyan">2 publishing</Badge>` (`:278-279`) — both literals, and the `href` points at the invalid model route identified in §1.1, so the only existing "Publishing Hub" entry point **404s**.
- Real partial hosts, none of them a publishing flow: `/(admin)/views/[view]` reads published views under the view's own ACL (`views/[view]/page.tsx:23`), `/(admin)/models/*` does generic CRUD, `api/ops/stream/route.ts` proxies the admin SSE feed.

### 6.2 Permissions as built

Same three-layer HQ boundary as §2.2 (`middleware.ts:4,11` → `(admin)/layout.tsx:5-7` → `lib/authz.ts:82/87/97`). The specific *publish* permission does not exist anywhere: `grep -rn "publish" apps/headquarters/src` found no publish action, no publish guard, no publish route — only dashboard copy (lines 94, 142, 274, 302) and comments about ACLs being "published". HQ's own comment at `lib/authz.ts:91-95` is on point: "An endpoint the hub does not publish is treated as forbidden — HQ will not guess a permission it cannot read from the authority." There is nothing to guard yet.

### 6.3 Reusable components

`StepProgress`-like lanes are not in MoonUI, so compose from what is: `Panel`, `PageHeader`, `DataTable`, `Badge`, `Stat`/`StatCard`, `ProgressBar` (with `ProgressTone`), `Alert`, `Modal`/`AlertDialog` for confirmations, `Field`/`TextInput`/`SelectInput`, `Breadcrumbs`, `EmptyState`, `Skeleton`/`TableSkeleton`. The HQ-native pieces: `AccessDenied` (`apps/headquarters/src/ui/widgets/AccessDenied.tsx`) + `apps/headquarters/src/lib/denial-copy.ts` (its `forbiddenBody` at `:14` already says "Your account does not hold the role this area requires. No records were loaded."), `RecordForm`, `fields/widgets`.

### 6.4 Data owner — **D08 Publication/Governance, not implemented**

- The intended machine is specified but not built. `docs/audit/M18-01-single-publication-state-machine.md:15` defines `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED` as a **specification only** — `TODO.md:431` closes M18-01 "Ditutup sebagai spesifikasi" (closed as a spec) and warns it "tidak mengklaim D08/consent store sudah ada" (does not claim the D08/consent store already exists).
- Everything downstream is unchecked: `M18-02` (store license/consent/reviewer evidence), `M18-03` (immutable release manifest + version pointer), `M18-04` (withdrawal/correction/takedown/appeal), `M18-05` (cache invalidation on revoke), `M18-06` (reviewer scope labels), `M18-07` (wrong-role concurrency test); and on the HQ side `M20-03`, `M20-04`, `M20-05`, `M20-06`, `M20-07`. `M20-02` is design-only ("Design only: no queue routes/tables/implementation; D08 and ADR gates remain").
- No model: `MODEL_NAMES` (`generated.ts:2556`) has no `releases`, `release_manifests`, `rights_approvals`, `editorial_signoffs`, `takedown_logs` — independently proved at `apps/arsy/test/public-projection-denial.test.ts:1252-1255`.
- Existing adjacent machinery the state machine should reuse, not duplicate: the **MIZAN** role-scoped draft/submitted/reviewed machine (`packages/moonql-research/src/review*.ts`, tested by `apps/arsy/test/mizan.test.ts:195`) and the released-graph pointer trio `graph_candidates` / `graph_releases` / `graph_release_pointer`. `todo-ui.md:9` and `todo-ui.md:215` forbid a second approval engine.

### 6.5 Differences from the reference (`09_publishing_hub.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › HEADQUARTERS", "DRAFT IS NOT PUBLISHED", `09 / 12`. Its four lanes are DRAFT / RIGHTS CHECK / HUMAN REVIEW / RELEASED, each carrying "Document candidate / Attribution status / Release manifest" stamped `STATE REQUIRES EVIDENCE`, and the RELEASED lane stamped `DEMO • NOT PUBLISHED`.
**The mockup's own stamp is the audit result:** every one of those twelve state cells reads `STATE REQUIRES EVIDENCE`, and the only "released-looking" lane says `DEMO • NOT PUBLISHED`. Reproducing that in code today would be *faithful*; converting any cell into a real state would be a fabricated claim, because D08 has no store and `M18-02..07` are open.

---

## 7. UI-P10 — HARBOR COMMONS

Plan line, verbatim (`todo-ui.md:159`):

> Reference: [`10_harbor_commons.svg`](docs/design/mockups-xv/10_harbor_commons.svg) · Canonical task owner: **M32 / M37** · Code owner: `Proposed app, no independent auth` · route: `private community route TBD`.

### 7.1 Route — NO ROUTE, NO APP

- `ls apps` → `aigateway arsy cockpit dock echolog headquarters lumen-runtime orbit sentinel skylink`. **No `harbor`.** `grep -rniE "harbor|works-economy|\bSHADOW\b" apps/*/src packages/*/src` returned only unrelated hits (CSS `box-shadow`, "frameworks", seed prose) — no Harbor module, no Harbor route file.
- The name survives only as copy: `apps/headquarters/src/app/(admin)/page.tsx:142` renders the tagline "and publishing operations. Different people. Same sky." — the mockup's own subtitle. That is a slogan in the dashboard header, not a surface.

### 7.2 Permissions as built

Nothing Harbor-specific exists. The governing constraint is the plan's own line: "Proposed app, **no independent auth**" — and `BLUEPRINT.md` §4 D00 makes ARSY the sole identity/role owner. `todo-ui.md:201` (Security row) restates: "BFF/httpOnly; no admin token browser; source rights and consent checked server-side". The reusable precedent for a non-Hub client with its own surface is ECHOLOG's Vite console (`apps/echolog/client/App.tsx`, token typed at `:27-28`, api helper in `client/lib/api.ts`) — it is a client of its own service and holds no identity of its own. Any Harbor surface must reuse ARSY sessions the way HQ does (`resolveHqSession`, `hq_token`) or the way ORBIT does (read-only + `UNAUTHORIZED` projection, M40-09).

### 7.3 Reusable components

`Panel`, `SplitView`, `Nav`/`Tabs`, `Field`/`TextInput`/`Textarea`/`Toggle`, `Badge`, `EmptyState`, `Modal`/`AlertDialog`, plus `apps/dock/src/ui/components/states.tsx` for honest states and the id/en catalogues under `apps/dock/src/lib/*-copy.ts` / `apps/orbit/src/lib/orbit-copy.ts` / `apps/headquarters/src/lib/login-copy.ts`.

### 7.4 Data owner — **D14, explicitly not accepted**

`BLUEPRINT.md:110` is decisive: "**Proposed D14–D17 (not accepted domain contracts):** D14 Community/Membership; D15 Commerce & Work; D16 Financial Operations/treasury oversight; D17 physical Energy & Assets. Design governance by separate ADR before creating schemas."
No model exists (`MODEL_NAMES`, `generated.ts:2556`, has no member/library/consent/moderation/report/appeal row). Canonical tasks `M32-01..05` are all unchecked in `TODO.md:712-716`, and `M32-02` — "Decide D14 ownership and D00 session reuse" — is literally the missing decision the plan's blocker row names. Consent-adjacent primitives that do exist and must be reused, not re-invented: the AMANAH/mandate model set (`journey_mandates`, `activeMandates` view) and HQ's `SYS-05 · AMANAH Access — 'Human permissions, mandate, and consent' · GUARDED` (`(admin)/page.tsx:102`).

### 7.5 Differences from the reference (`10_harbor_commons.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › HARBOR", `10 / 12`.
Absent: PRIVATE LIBRARY (Saved readings / Owned contributions / Privacy controls / Export my data / Leave voluntarily), COMMUNITY CIRCLES (Research club / Creative club / Member messages / Resource sharing), MODERATION + CONSENT (Consent requested / Report content / Appeal decision / Erase-export / Role boundary).
**Fabrication flags — two of them are privacy-law-grade:** "Member messages" would create a community messaging surface with no D14 owner and would collide with D18/SKYLINK ownership. "Private library" / "Owned contributions" / "Export my data" / "Erase / export" are personal-data operations with no consent store and no deletion mechanism; `todo-ui.md:165` (UI-P10e) already demands "do not expose private witness data", and D06 witness data is still spec-only (`TODO.md`: `M16-01` closed as a spec, `M16-02..05` unchecked, `M16-04` = "No anonymous access or media link leakage"). Building Harbor now would be a second identity/consent owner by construction — forbidden by `BLUEPRINT.md:110` and `todo-ui.md:9`.

---

## 8. UI-P11 — WORKS ECONOMY

Plan line, verbatim (`todo-ui.md:169`):

> Reference: [`11_works_economy.svg`](docs/design/mockups-xv/11_works_economy.svg) · Canonical task owner: **M35 / M37** · Code owner: `Proposed app, D15/D16 source-of-truth reviewed` · route: `private works route TBD`.

### 8.1 Route — NO ROUTE, NO APP, NO TABLE

No `works` app in `ls apps` (§7.1) and no works route in any app's page inventory (§0.1-0.3). A targeted search for the domain vocabulary — `grep -rniE "\binvoice|\border_item|\bpayment_|checkout|\bquote\b|merchant" apps/*/src packages/moonql*/src packages/core/src` — returned **only** unrelated matches: two code comments about string quoting (`apps/arsy/src/modules/studio/index.ts:82`, `apps/cockpit/src/todoRegister.ts:82`) and the SDK codegen helper `quote()` (`packages/moonql/src/codegen.ts:12,23,31,42,126,127,159,161,164,171`). **Zero commerce implementation.**

### 8.2 Permissions as built

Nothing exists to protect. The only relevant precedent is that financial data must be `ADMIN_FULL`, not `ADMIN_WRITE` — and `ADMIN_WRITE` is precisely the shape that leaks reads (`packages/moonql/src/model.ts:31-37`; the live consequence is proved for research at `apps/arsy/test/public-projection-denial.test.ts:1015`). D00 keeps identity/roles in ARSY (`BLUEPRINT.md` §4, D00 row: "Users/sessions, API keys, role/permission, audit/job/state").

### 8.3 Reusable components

`DataTable`, `Panel`, `PageHeader`, `Stat`/`StatCard`, `ProgressBar`, `Badge`, `Field`/`TextInput`/`SelectInput`, `Modal`/`AlertDialog`, `EmptyState`, `Breadcrumbs`. For the audit trail the repo already has the right shape: `packages/moonql/src/model.ts:44+` grants "Columns every model gets for free — never writable from outside", and HQ reads real audit rows via `/ops/dashboard` + `/ops/stream` (`(admin)/page.tsx:117`, `api/ops/stream/route.ts`). Reuse `ops_audit`; do not build a parallel ledger.

### 8.4 Data owner — **D15/D16, explicitly not accepted**

`BLUEPRINT.md:110` again: D15 Commerce & Work and D16 Financial Operations are "**not accepted domain contracts** … Design governance by separate ADR before creating schemas. Each model has precisely one ARSY/MoonQL owner; frontend boundaries do not confer database ownership." Same line sets the commercial rule: "WORKS initially sells actual existing products/services via appropriately licensed payment providers; multi-seller wallets, banking, speculative tokens and automated payouts are out of initial scope."
No model exists (`MODEL_NAMES`, `generated.ts:2556`). Canonical tasks `M35-01..05` are all unchecked (`TODO.md:754-758`), and `M35-02` — "Decide merchant legal/payment and D15/D16 owners" — is the exact missing decision, with `M35-04` owning "Specify Treasury roles and payment idempotency". `M37-05` ("Test cross-app token expiry and role isolation") is also unchecked, which is the row that gates any new private app's auth.

### 8.5 Differences from the reference (`11_works_economy.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › WORKS", "REAL WORK, CLEAR ACCOUNTING", **"no invented revenue"**, `11 / 12`. Its workflow strip is OFFER → QUOTE → ORDER → DELIVERY → INVOICE with columns OFFERS / QUOTES / ORDERS / INVOICES / CUSTOMER SERVICE, three record tables each stamped "EXAMPLE RECORD / OWNER CHECK / AUDITABLE STATE", plus ACCOUNTING.
**Fabrication flags — the most severe in this set.** Every one of those five columns is a financial document. `UI-P11d` (`todo-ui.md:174`) already states "No fake sales or payment provider before integration approval", and `UI-P11c` demands "Actual offers / quotes / orders / invoices and current owner". Building any of them now would display invented revenue and invented accounting in a product that has no D15/D16 owner, no payment integration, and no idempotency design (`M35-04` unchecked). "EXAMPLE RECORD" in the mockup means exactly that: it must carry a `DEMO` label per `todo-ui.md:37`/UI-F11 if shown at all — and per ADR-0009 §2.5 it cannot be shown at all until its owner decision exists, which is why the row is in the blockers register.

---

## 9. UI-P12 — SKYLINK MESSAGING

Plan line, verbatim (`todo-ui.md:179`):

> Reference: [`12_skylink_messaging.svg`](docs/design/mockups-xv/12_skylink_messaging.svg) · Canonical task owner: **M38 / M19** · Code owner: `apps/skylink, bounded D18 owner` · route: `operator inbox proposed`.

### 9.1 Route — NO UI ROUTE, but the backend is far past "skeleton"

- Confirmed zero UI: the full `apps/skylink` file list is in §0.3 — src/test/tsconfig only, no `.tsx`, no `client/`, no `public/`, no `index.html`.
- **AGENTS.md is stale on this point (fact, from `git`-verified code, not from `AGENTS.md:10`)**: it says SKYLINK "has only an M38-07 health skeleton: messaging, D18 storage and UI are not implemented". At `fe8e84c`, messaging and D18 storage **are** implemented; only the UI is not. Evidence: `TODO.md:809` closes **M38-11** ("Publish REST and WS surfaces with two auth modes and a duplicate-channel guard") at implementation SHA `a53fffe…` with control-plane 5/5 against real PostgreSQL, and `TODO.md:808` closes **M38-10** (Telegram provider + webhook verification) at `48b3886…`. `todo-ui-2.md:11` and `docs/audit/ui2-g11-m38-m39-status.md` are the current wording, and M38-13 is named as the UI's owner.
- Real REST surface, quoted from the **HEAD blob** of `apps/skylink/src/modules/routes.ts` (this file is dirty in the working tree — line numbers are from `git show fe8e84c:…`): `/api/v1/channels` 128, `/api/v1/send` 140, `/api/v1/broadcast` 160, `/api/v1/channels/:id/start` 179, `/api/v1/channels/:id/logout` 183, `/api/v1/conversations` 187, `/api/v1/conversations/:id/messages` 200, `/api/v1/channels/accounts` 216. The working tree additionally contains an **uncommitted** `POST /api/v1/channels/register` (working-tree line 146) that is not at HEAD.
- Real D18 storage: `packages/skylink-store/src/repositories.ts:4` imports `channelAccounts, conversations, deliveryAttempts, messages` from `./schema.js` — all four tables named in `BLUEPRINT.md:212` exist, with conversation/message upsert logic at `:66-98`.
- No consumer anywhere: `grep -rn "api/v1/channels|api/v1/conversations|skylink" apps/{dock,headquarters,cockpit/client,orbit}` matched only `apps/cockpit/src/config.ts:66-78`, i.e. Cockpit supervising SKYLINK's `/health`. **Nothing renders a message.**

### 9.2 Permissions as built (the strongest gate in the set — and it is not identity ownership)

- `apps/skylink/src/auth.ts:8-18`: a principal is either `kind: 'service'` or `kind: 'arsy'` (with `login`/`role` carried through from ARSY), and `AuthResult` failures are `status: 401 | 503` with codes `unauthorized` / `auth_unavailable`. Authenticator built from `verifySecretToken` (`@moonwitness/skylink-core`) plus an ARSY round-trip, with a 2 000 ms / 500-entry cache and 4 096-byte token cap (`auth.ts:4-6,22-24`). **ARSY stays the identity authority — SKYLINK borrows it, it does not own it.**
- Per-route policy in the HEAD blob of `modules/routes.ts`: `authorizePolicy(..., 'admin')` at 138/182/206/220/232/292; `'service'` at 149; the composite `'admin-or-service-send'` at 166. The refusal copy is explicit — `:340-341`: "This operation requires the SKYLINK service credential." vs "This operation requires an ARSY administrator."
- Log hygiene is a tested boundary, not a hope: `apps/skylink/test/control-plane.test.ts:145` "SKYLINK keeps tokens, QR payloads and message bodies out of info logs", and `:196` "SKYLINK REST and WS enforce service/ARSY auth and publish channel events".
- There is **no operator inbox, no pairing QR endpoint and no browser session binding** for any of it. `todo-ui.md:184` (UI-P12d) presupposes a pairing flow the API does not expose.

### 9.3 Reusable components

The pattern to copy is ECHOLOG's shipped console, explicitly cited as done work: `apps/echolog/client/App.tsx` composes `Panel`, `PageHeader`, `SplitView`, `Alert`, `Button`, `Stat`, `TextInput` from MoonUI (`:3-11`) with four local components and a `lib/api.ts` wrapper exposing `ApiError` (`:13`) — closed under M39-11 with keyboard and 1440×1000 evidence (`todo-ui-2.md:11`). For SKYLINK specifically, `M38-13`'s DoD (`TODO.md:811`) mandates: "inbox, pairing and channel status render from MoonUI primitives, `pnpm ui:check` reports zero violations, client enters the lint and design-system globs". Primitives needed and present: `SplitView` (three panes), `Badge`, `LiveDot` (disconnected/connecting/open states), `Nav`/`Tabs`, `EmptyState`, `Spinner`, `Skeleton`/`TableSkeleton`, `Field`/`TextInput`/`Textarea`, `Button`, `Alert`, `Modal`/`AlertDialog`, `ToastProvider`/`useToast`, `DensityProvider`, `CommandPalette`, `KbdLegend`, plus `tokens.ts`. Direction handling comes from the shared locale layer (`packages/core` exports `isLocale`; Dock precedent `apps/dock/src/lib/locale-context.mjs`, HQ precedent `apps/headquarters/src/lib/login-copy.ts`).

### 9.4 Data owner — **D18 / SKYLINK, and it is the only one of the nine that is real and owned**

`BLUEPRINT.md:212`: "**D18 Messages & Channels — owned by SKYLINK** | `channel_accounts`, `conversations`, `messages`, `delivery_attempts` (schema `skylink`) | ARSY and other apps are clients only; no identity/session ownership; D09 `channels` migrated here". `BLUEPRINT.md:112` (ADR-0006) fixes the carve-out: SKYLINK is "the second and final SQL/migration owner" and the exception "authorizes **no** second REST hub, no second login/identity system, no second publishing/approval engine, no graph database and no second database container". `BLUEPRINT.md:214` (D19) keeps message rows out of ECHOLOG. `AGENTS.md:10` restates "it is not a second Hub and must not gain identity, a model catalog, or a third SQL owner."
The honest gap is the **client**, not the data: `M38-12` ("Make ARSY a SKYLINK client behind `SKYLINK_ENABLED`", P0) and `M38-13` ("Build the operator UI…") are **both unchecked** (`TODO.md:810-811`), with `M38-14` after them. `todo-ui-2.md:142` states the non-duplication rule verbatim and is the binding constraint on this screen: "**SKYLINK M38-12 → M38-13 → M38-14:** … then build *authorized* MoonUI three-pane channel/conversation/message inbox, pairing and delivery history… Backend M38-11 is already checked; **do not reimplement it**. UI-II only tracks dependency/readiness." and "**ECHOLOG M39-11 → M39-12** … Not a gallery and not a duplicate S3 backend. **No UI claim until actual app and tests exist**."

### 9.5 Differences from the reference (`12_skylink_messaging.svg`)

Self-labelled `CONCEPT · NOT LIVE`, "THE EMPIRE › SKYLINK", "MESSAGES ARE IN TRANSIT", `12 / 12`, and every pane stamped honestly: `WA / DISCONNECTED`, `TELEGRAM / PLANNED`, `PAIRING / NOT STARTED`, `PROVIDER ERRORS`, **"No confirmed messages"**, `INBOUND • EXAMPLE ONLY`, `OUTBOUND • QUEUED (DEMO)`, `FAILED • PROVIDER REASON`, `RETRY REQUIRES EXPLICIT ACTION`.
Absent: the entire three-pane UI. `PAIRING / NOT STARTED` in the mockup is accurate — no pairing endpoint exists in the HEAD blob of `modules/routes.ts`.
**Fabrication flag, and it is the one the operator brief named:** building a "real messaging inbox" screen now would be the repo's first fabricated private-channel surface. `todo-ui.md:183` (UI-P12c) asks for `disconnected/connecting/open/logged-out`, which would be a live WS claim before `M38-12`'s flag-gated ARSY client and before `M38-14`'s end-to-end proof; `UI-P12e` asks for delivery attempts and retry, and `delivery_attempts` exists as a table but has no read projection intended for a browser. Any message body rendered would have to come from real D18 rows via the `'admin'`-gated `/api/v1/conversations/:id/messages` — a browser cannot hold that credential, and `auth.ts` gives SKYLINK no session of its own by design. **The correct first move is `M38-12`, not this screen.**

---

## 10. Final table — screen → route status → data owner → `*b` unblock → `*a` verdict

Legend for route status, as proven by §0 listings: **EXISTS at X** = a route with this screen's name/function; **HOST EXISTS at Y** = a real, differently-named route that already performs part or all of the function; **NO ROUTE** = nothing found.

| Screen | Route status (proven) | Auth boundary as built | Canonical data owner (real today?) | What must land before `*b` can start | Verdict on the `*a` leaf |
|---|---|---|---|---|---|
| 02 PROJECT UNIVERSE | **NO ROUTE** for `/projects` (`grep /projects apps/dock/src` = 0); **HOST EXISTS** at HQ `/` panel `#project-universe` (`(admin)/page.tsx:349`), currently hardcoded + partly 404 links | HQ layout gate `(admin)/layout.tsx:5-7`; panel itself reads nothing | **none** — no project model/view; D07 not implemented; M17 all open | M17 route + data-owner decision naming the query module; deletion/replacement of the `PROJECTS` const at `(admin)/page.tsx:33-71` and the fake badges at `:185-186` | **AUDIT COMPLETE, LEAF SHOULD STAY UNTICKED AS BLOCKED.** The audit is done and this document is its evidence; ticking `*a` would also imply the register's claim is current, and that claim is now incomplete (existing HQ host). Nothing is buildable: no owner, no data. |
| 03 STORY FORGE | **NO ROUTE**; **HOST EXISTS** as HQ generic editor `(admin)/models/*` | Strong: `middleware.ts:11` + `(admin)/layout.tsx:5-7` + `authz.ts:82/97` + `new/page.tsx:29-30` | **D07 Story & Media — not implemented** (no `moonql-story*` package, no model) | `M33-01/02/03` + `M17-03`; a D07 model; SHADOW scope acceptance | **AUDIT COMPLETE; `*a` honestly closeable.** Every element the reference asks for was located, named or proven absent with file:line. Blocked for `*b` by M33, not by missing audit. |
| 04 POSTER LAB | **NO ROUTE** for a *private* studio; **HOST EXISTS** at public Dock `/studio` (`app/studio/page.tsx:3,11-12` → `GeneratorStudio.tsx:616`) | **None** on `/studio` (public Dock, `data/sdk.ts:4-10`). Real ungated export at `GeneratorStudio.tsx:666-694` | **D07/D13 — not implemented**; M18-02/03, M33-03/05, M17-06 open | Owner decision on **public-DEMO `/studio` vs a new private HQ studio** (ADR-0009 §2.2 adopted the public one); export-approval state machine; asset-consent ledger format; UI-F08 | **AUDIT COMPLETE; `*a` closeable, but it must record a conflict.** The plan's "private studio route TBD" and the shipped public `/studio` cannot both be left standing; the audit surfaces this instead of silently picking one. |
| 07 MOONLAB RESEARCH | **NO ROUTE** for a *private* desk; **HOST EXISTS** at public Dock `/research` (`app/research/page.tsx:14,28`) as a tested fail-closed stub | Public stub (by design, test-pinned `research-public-withholding.test.mjs:12-15`); **Hub side is NOT gated**: `moonql-research/index.ts:692` `requires:'public'`, models `ADMIN_WRITE` (`:362,385,411,432,454,492,517`) | **D05 Research — IMPLEMENTED** (7 models + addon + MIZAN), but **no released projection** (no research view in `generated.ts:2557`) | `M34-03` (case/hypothesis drafts), `M34-04` (D08 released projection), `M34-05` (reviewer separation + wrong-role test); M19-19; gating of `/research/hypotheses` and the `research_*` REST reads | **AUDIT COMPLETE; `*a` closeable — with a finding that outranks the leaf.** Placement is already decided (M34-02). The live exposure is an API-side ACL problem, not a missing UI audit. |
| 08 WORLD MONITOR | **NO ROUTE** named `world`; **HOST EXISTS twice**: HQ `/(admin)/world-monitor` (full 3-tier page, `page.tsx:111-133`) and Dock `#world-monitor` home card (`app/page.tsx:74`) | HQ: best-gated page in the set — `(admin)/layout.tsx:5-7` + `guardEndpoint(doc,'GET','/monitor/overview')` at `page.tsx:97`. **Hub endpoint declares no `requires`** (`moonql-monitor/index.ts:701-705` + `moonql/rest.ts:120-122`) ⇒ anonymous | **WORLD/D10 — PARTLY REAL**: models `monitor_*`, views `monitorHierarchy/ActiveSources/SignalFeed/…`, rows carry `lastCheckedAt`,`healthStatus`,`failCount` (`generated.ts:349-369,399-421`). No freshness/uncertainty **model** (grep for `freshness|uncertain|stale|revoke` in the addon = 0) | `M24-02` (units/temporal/revision model), `M24-05` (public monitor with stale flags); **fix `monitor.ts:51-55` error laundering**; **replace `ThreatRadarMap` `DEFAULT_TARGETS` `:18-25`** or gate it behind an explicit DEMO label; add `requires` to `/monitor/overview` | **AUDIT COMPLETE; `*a` closeable.** The plan is simply out of date here: the screen is largely shipped. The unblock action is remediation of existing fabricated telemetry, not building a new screen. |
| 09 PUBLISHING HUB | **NO ROUTE**; only a hardcoded dashboard card whose `href` 404s (`(admin)/page.tsx:269-280`, `href="/models/scheduleSlot"`) | HQ gate applies to the dashboard; no publish permission exists anywhere to check | **D08 Publication/Governance — NOT implemented.** State machine specified only (`M18-01 …:15`); `M18-02..07` open; no `release*/rights_approvals/editorial_signoffs/takedown_logs` (`public-projection-denial.test.ts:1252-1255`) | D08 store (M18-02/03) + withdrawal (M18-04) + `M20-03/04/07`; reuse MIZAN's `draft/submitted/reviewed` machine (`mizan.test.ts:195`) and the `graph_releases`/`graph_release_pointer` trio instead of a second engine | **AUDIT COMPLETE; `*a` closeable.** Nothing to build on. The mockup's own `STATE REQUIRES EVIDENCE` cells are the honest status quo, so a `*b` that renders real states would be a fabricated claim. |
| 10 HARBOR COMMONS | **NO ROUTE, NO APP** (`ls apps` has no `harbor`; the only trace is tagline copy at `(admin)/page.tsx:142`) | Nothing to audit; must not add a second identity (D00, `BLUEPRINT.md:214`-area, `AGENTS.md:10`) | **D14 Community/Membership — explicitly "not accepted domain contract"** (`BLUEPRINT.md:110`). No member/consent/moderation model in `MODEL_NAMES` | `M32-01/02` (need + D14 ownership/D00 session reuse) and an **ADR authorizing the app**; `M37-05`; D06 witness consent path (`M16-02..05`) before any "private library" | **AUDIT COMPLETE; `*a` closeable, verdict = hard BLOCKED.** The correct D1 output is "no host, no owner, no ADR" — which is also the only finding that says do not open a packet. |
| 11 WORKS ECONOMY | **NO ROUTE, NO APP** — the commerce vocabulary search returned only unrelated codegen/comment hits (§8.1) | Nothing exists | **D15/D16 — explicitly "not accepted domain contracts"** (`BLUEPRINT.md:110`). No offer/quote/order/invoice model anywhere | ADR + `M35-02` (merchant legal/payment + D15/D16 owners) + `M35-03/04` (quote-order-delivery-invoice-refund; treasury roles + payment idempotency) + `M37-05` | **AUDIT COMPLETE; `*a` closeable, verdict = hard BLOCKED, highest fabrication risk.** Any revenue, order or invoice figure rendered today would be invented accounting; `UI-P11d` forbids it and there is no owner to permit it. |
| 12 SKYLINK MESSAGING | **NO UI ROUTE** (`apps/skylink` has no `.tsx`, no `client/`, no `index.html`); backend **EXISTS**: 8 REST routes + WS + D18 tables | Two-mode gate fully implemented: `auth.ts:8-18` (`service` \| `arsy`, 401/503) and `authorizePolicy(...,'admin'|'service'|'admin-or-service-send')` (HEAD blob `routes.ts:138,149,166,182,206,220,232,292`); log hygiene tested (`control-plane.test.ts:145`) | **D18 / SKYLINK — REAL**: `channel_accounts`,`conversations`,`messages`,`delivery_attempts` (`skylink-store/src/repositories.ts:4`). **Not a second Hub** (`BLUEPRINT.md:112,212`) | `M38-12` (ARSY as SKYLINK client under `SKYLINK_ENABLED`, flag-off non-regression) **then** `M38-13` (the inbox UI, `ui:check` zero, client into lint + design globs). No pairing endpoint exists yet — `UI-P12d` cannot be met. | **AUDIT COMPLETE; `*a` closeable — and it must correct two documents' premises.** `AGENTS.md:10` ("only an M38-07 health skeleton: messaging, D18 storage and UI are not implemented") understates the shipped backend; `todo-ui.md:179`'s "operator inbox proposed" understates nothing but the ordering is fixed: M38-12 first. Per `todo-ui-2.md:142` the UI stays in M38-13 and must not be duplicated here. |

### 10.1 Cross-cutting facts worth repeating in the register

- **Three of the nine screens already have a real host the plan does not credit** (04 → `/studio`; 08 → HQ `/world-monitor` + Dock `#world-monitor`; 07 → public `/research`). Screens 02, 09 have *fake* hosts (a hardcoded panel and a 404-ing card). Screens 03, 10, 11, 12 have no host at all.
- **The repo's dominant honesty defect is not the un-built screens — it is the built HQ dashboard.** Confirmed fabricated telemetry at `(admin)/page.tsx:185,186,211,212,264,265,292,293` and `ThreatRadarMap.tsx:18-25`, plus the swallowed error at `monitor.ts:51-55`. ADR-0009 §2.5 and `todo-ui.md:195` are what these violate, and they violate it today.
- **Route-existence re-verified as claimed by the prior register** (screens 02/10/11 no host under those names; 12 has no UI), **but the register's "Reality in code" column is now wrong or incomplete for 02, 04, 07, 08** because it predates the `/studio`, `/research`, `/world-monitor` and `#project-universe` states this audit measured. This document is the correction; `docs/audit/screens/**` and `docs/audit/ui-blocked-screens-8737fe4.md` were not touched.
- **No new backend, second Hub or additional SQL owner is proposed anywhere in this document.** The only legitimate feeders named are existing ones: ARSY/MoonQL addons (`moonql-monitor`, `moonql-research`, `moonql-graph`, `moonql-corpus`), D18/SKYLINK (`skylink-store`), D19/ECHOLOG (stateless, no tables), and the existing HQ/Dock shells.
