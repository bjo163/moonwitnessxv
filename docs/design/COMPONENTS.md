# MoonUI Component Behavior Bible

**Status: VERIFIED & SHIPPED (M19-32, M30-01, M30-02, M30-03). Ownership contract: [ADR-0017](../decisions/ADR-0017-shared-first-component-ownership.md).**  
Single Source of Truth: `packages/moonui/moon.css`, `packages/moonui/src/`, and `packages/moonui/src/client/`.

---

## 0. Shared-First Ownership (ADR-0017)

MoonUI is the only owner of UI components. Every component that renders DOM lives under `packages/moonui/src/**` and is exported from `@moonwitness/moonui` (server-safe) or `@moonwitness/moonui/client` (interactive). Application code may contain only route files, copy/locale catalogs, data readers, and markup-free containers recorded in [`moonui-exceptions.json`](moonui-exceptions.json).

That ledger is a ratchet: it may only shrink, and its ceiling is the `RATCHET` constant in `scripts/check-ui-consistency.mjs`, so raising it is a reviewable source diff rather than a quiet data edit. Components promoted into MoonUI take strings and records as props; MoonUI never imports application code, copy catalogs, routes or fetches.

Enforcement: `pnpm ui:check` runs ten checks — surface adoption, token purity, the component-class denylist, typography, the duplicate matrix, the ledger ratchet, design-system CSS ownership (C7), the markup fingerprint (C8), derived class names (C9) and primitive overrides (C10) — beside the `@moonwitness/shared-ui-only` ESLint rule and `pnpm verify` in CI.

---

## 1. Design Token Constancy (Zero Drift)
All MoonWitness surfaces (Dock, Headquarters, Cockpit, etc.) strictly draw visual tokens from `@moonwitness/moonui`:
- **Palette**: `ink` (`#07060b`), `night` (`#0b0912`), `paper` (`#0d0b14`), `surface` (`#13101d`), `surface2` (`#1b172a`), `fg` (`#f7f4ec`), `pink` (`#ff007a`), `cyan` (`#00d4ff`), `accent` (`#ffd400`), `ok` (`#00e676`), `moon` (`#9d4edd`), `muted` (`#9e96b0`).
- **Glows**: `--pink-glow`, `--cyan-glow`, `--accent-glow`, `--ok-glow` (45% alpha radial/box shadows).
- **Fonts**: `--font-sans` (`Inter`), `--font-display` (`Impact`/`Anton`), `--font-zine` (`Comic Sans MS`/`Segoe Print`), `--font-mono` (`JetBrains Mono`).
- **Spacing**: `--s1` (4px), `--s2` (6px), `--s3` (12px), `--s4` (20px), `--s5` (32px), `--ctl` (30px).

Linter enforcement: `pnpm ui:check` scans every discovered app surface (derived from `scripts/apps.registry.mjs` plus the filesystem, never a hand-written list) and fails on any arbitrary hex color, component-level class, duplicate component, or typography drift.

---

## 2. Server-Safe Primitives (`@moonwitness/moonui`)
Exported from `packages/moonui/src/index.ts`. Safe for Server-Side Rendering (SSR) and Server Components:

### Buttons & Controls
- `<Button>`: Native button semantics, supports sizes `sm`, `md`, `lg` and variants `primary`, `accent`, `cyan`, `paper`, `ghost`, `danger`, and `cyber`. Supports `loading` state (`aria-busy="true"` + inline spinner + `disabled`). Supports physical micro-haptics when clicked in client contexts.
- `<LinkButton>`: Anchor styled identically to button. Supports `variant` and optional micro-haptics.
- `<Toggle>`: Accessible native checkbox wrapper with physical relay haptics on change.
- `<Field>`: WAI-ARIA form field coupling `label`, `hint`, and `error` with target inputs via `htmlFor`.
- `<TextInput>`, `<Textarea>`, `<SelectInput>`: Standardized inputs with tokenized borders, focus rings, and affix slots.

### Cyberpunk & Tactical Feedback
- `<Tooltip>`: Lightweight hover/focus label with `role="tooltip"`, monospace styling, and position modes (`top`, `bottom`, `left`, `right`).
- `<Skeleton>`, `<CardSkeleton>`, `<TableSkeleton>`: Low-contrast shimmer placeholders (`aria-hidden="true"`) preventing layout shifts during async data loading.
- `<GlitchText>`: High-contrast chromatic glitch typography replicating cyber-dystopian terminal headers via `data-text` pseudo-elements.
- `<CyberFrame>`: HUD container featuring glowing corner brackets in `cyan`, `pink`, `accent`, or `ok`.

### Navigation & Layout
- `<Tabs>`: WAI-ARIA roving `tabIndex` (`0` for active, `-1` for inactive) with full keyboard arrow navigation (`ArrowRight`/`ArrowDown`, `ArrowLeft`/`ArrowUp`), `Home` (first tab), `End` (last tab), and optional switch haptics.
- `<Nav>`, `<TabBar>`, `<UserChip>`: Structured navigation primitives.
- `<SectionNav items activeKey>`: in-page section anchors in one `<nav>` landmark with `aria-current="page"` on the active item. Server-safe; Orbit consumes it instead of an app-local nav.
- `<Card>`, `<CardHeader>`, `<CardBody>`, `<Panel>`, `<Badge>`, `<EmptyState>`, `<DataTable>`.
- `<Stat>`, `<StatCard>`, `<StatStrip items orientation as>`: the `<b>`/`<span>` stat anatomy. The strip owns the item anatomy; the page owns the band (position, height, breakpoints). `orientation="column"` is the stacked form a narrow paper card needs (Dock's constellation card consumes it), so no app stylesheet has to redeclare the anatomy.
- `<Pill>`, `<PillGroup>`: toggle chips with `aria-pressed`; the pressed state is part of the primitive, not the caller.

### Shared Site Chrome and Operational Feeds (ADR-0017)
- `<SiteHeader copy currentIds>` (client barrel): collapsible site chrome with `aria-expanded`, an Escape handler and `aria-current="page"` for the ids the route names. It owns no strings: the surface passes `copy`.
- `<SiteFooter copy>`, `<SiteBrand brand>`, `<SocialRow>`: the footer band, the brand lockup and the decorative social marks. The draft/preview disclosure stays `role="note"` inside the bottom bar.
- `<PageActions className primary secondary>`: the hero action pair, built from `LinkButton` so its focus ring and variants are the shared ones.
- `<InfoPage sections section title summary preview home navigation langLabel langCode langHref basePath header footer children>`: the information-page shell (bar, breadcrumb, section nav with `aria-current`, locale switch, document band, back action). It takes `basePath`/`langCode`/`langHref` instead of a locale, so no route or locale rule lives in the design system; the three pinned contracts (`<h1>` text, `.emp-lang`, `aria-current`) are its responsibility.
- `<AuditFeed rows>`, `<JobTable rows>`: operational tables over structural rows. Column labels default to the machine names; a surface may pass localized `labels`.
- `<LocaleSelect label value options onChange>`: the language control; the cookie contract stays with the surface.
- `<ModelTable fields rows labels empty>`: schema-driven table. `fields` is the metadata map, so a compute or many-to-one column keeps its tone without the design system knowing a model name.
- `<RecordForm title fields action submitLabel cancelLabel cancelHref>`: schema-driven form. The surface converts its `/_schema` into `SchemaField[]`; `kind` picks the widget through `fieldWidgetFor`.
- `<TierBadge tier>`: the default-data tier badge.
- `<AccessDeniedView title body backLabel retryLabel canRetry subtitle>`: the guarded-page denial. A `canRetry` denial renders a GET form that re-checks the same URL.
- `Alert` accepts `role` (`alert`/`status`) and `live`; a `status` role defaults to `aria-live="polite"`, so a caller cannot announce a polite message assertively by accident.

### App Surface Views (`src/surfaces/*`, ADR-0017)
A surface view is presentation only: strings and rows arrive as props, and the app keeps the reader and the derivation.
- `src/surfaces/cockpit.tsx`: `CockpitLedgerView`, `CockpitLogsView`, `CockpitPortsView`, `CockpitPreviewView`, `CockpitSidebar`, `CockpitFooter`. `CockpitTunerSection` lives on the client subpath because it holds band/frequency state.
- `src/surfaces/orbit.tsx`: `OrbitShellHeaderView`, `WebGLFallbackView`; `<LocaleLinks>` is the generic locale switcher both Orbit and Dock can use.
- `src/client/surfaces/echolog.tsx`: `ObjectWatchlist` — the operator table, the digest track field and the stop-tracking action. Rows arrive as finished words (`label`, `size`, `stateLine`) and every sentence arrives in `WatchlistCopy`, so the view knows no transport, no storage key and no digest truncation rule.
- `src/story.tsx`: `StoryHomePage` and `StoryGgsPage` render the Story Universe bodies. Copy, locale-prefixed hrefs and **artwork URLs** arrive as props (`StoryGgsArtwork`); the GGS reflection is painted by `moon.css` from the `--m-surface-art` custom property the view sets, because a picture file is the app's content, never the design system's.
- `src/codex.tsx` and `src/client/surfaces/empire.tsx`: `StoryCodexPage` (server) plus the two interactive bodies `StoryLibraryPage` and `StoryReaderPage` (client barrel). Filter and page-cursor state is the view's; words, cards, artwork URLs and `basePath` are props. A filter or search that matches nothing renders `EmptyState` from `emptyTitle`/`emptyHint` inside the live region — the grid is never blank. `StoryHomePage`/`StoryGgsPage` take `hrefFor` because they render on the server, where a callback is legal; the client pair take `basePath` because a function may not cross into a Client Component.
- `SurfaceCopy` is `Readonly<Record<string, string>>`: the app's own catalog type stays the authority at the call site.

### Space Entry and Data States (ADR-0017, formerly app-local)
Dock was their only consumer; under ADR-0017 they are MoonUI's, and Dock passes routes and copy as props.
- `<SpaceGrid spaces heading headingId>`: one `<section aria-labelledby>` landmark holding exactly four `<SpaceCard>`s (READ `/reader`, EXPLORE `/terms`, CREATE `/studio`, SIGNAL `/stations`). It never renders a second `<nav>` and never a second `<h1>`, so `apps/dock/test/landmarks.test.mjs` keeps one navigation landmark and one page heading. Routes and locale arrive pre-built from `apps/dock/src/ui/components/spaces-data.tsx` (`dockSpaces(locale)`), which is the only place `localizedDockHref` is called.
- `<SpaceCard>`: anchor card with `data-tone` in `accent | cyan | pink | moon` driving a 3px top rule (`--space-tone`), a MoonUI `Icon*`, a phrase-sized title, a one-line description and an arrow link label. It renders **no numeric counter** and no `LIVE` badge; the status is words only.
- `SpaceStatus`: exactly three literals — `REAL`, `PLANNED`, `DEMO`. Anything else fails type-check, so a screen cannot invent a fourth claim.
- `<PanelState state copy>`: maps `loading | empty | error | ready` onto `Spinner` (`role="status"`), `EmptyState`, `Alert` (`role="alert"`) and the children. `<OutcomePanel>` renders one resolved outcome; the read resolver (`readPanel`) and the streamed boundary (`DataPanel`) stay in `apps/dock/src/ui/components/states.tsx` because they carry no markup.

Invariants for all of them: visible `:focus-visible` outline from `moon.css`, keyboard reachability, no hover-only affordance, `min-width: 0` so a long title wraps instead of forcing horizontal scroll, copy that comes from the bilingual catalog rather than a literal, and variants expressed as a `data-*` attribute with its rule in `moon.css` — a component never concatenates a class name from data, because a name no stylesheet can see is a name no gate can check (ADR-0017 check C9).

A page band may place a primitive; it may not redraw it (ADR-0017 check C10). The test is whether the rule restates an anatomy property the primitive itself declares: `.emp-state .m-live-dot { margin-right: 8px }` positions the shared dot and is fine, `.emp-state-dot { width: 7px; background: var(--muted) }` on the same element resizes and recolours it and fails, even though it never names `.m-live-dot`. The focus ring is granted the same way — once, to every interactive element inside a design-system shell (`.su-shell`/`.emp-shell`) and to each `.m-*` control — so no consumer has to add a ring, and a field whose visible box is a wrapping `<label>` shows the field treatment on `:focus-within`.

---

## 3. Client Interactive & Sensory Primitives (`@moonwitness/moonui/client`)
Exported from `packages/moonui/src/client/index.ts`. Client-only (`'use client'`):

### Modal & Dialogs
- `<Modal>`: Accessible tactile modal with backdrop blur, `role="dialog"`, `aria-modal="true"`, accessible focus trapping, focus restoration on unmount, and `Escape` handle.
- `<AlertDialog>`: High-risk confirmation dialog (`role="alertdialog"`) with tone modes (`danger`, `accent`, `ok`), explicit confirmation/cancel actions, and focus guard. `note` renders the consequence (object key, "cannot be undone") inside the `aria-describedby` target so it is announced with the question; `busy` disables both actions and sets `aria-busy` while the caller's request is in flight.

### Micro-Haptics & Audio Feedback
- `triggerHaptic(pattern)`: Couples Web Audio synthesized clicks/relays with physical device vibration (`navigator.vibrate`) in 0KB network payload. Patterns: `tap` (8ms), `switch` (15ms), `alert` ([20ms, 40ms, 20ms]), `error` ([40ms, 60ms, 40ms, 60ms, 40ms]), `tuning` (5ms).
- `playUiSound(type)`: Real-time Web Audio API oscillator tone generator (`click`, `toggle`, `relay`, `alert`, `tuning`).

### Toast Notifications
- `<ToastProvider>`, `<ToastContainer>`, `useToast()`: Global floating notifications with tone borders (`ok`, `pink`, `cyan`, `accent`), auto-dismissal, dismiss haptics, and click-to-close.

### Audio & Telemetry Visualizers
- `<AudioSpectrum>`: HiDPI neon FFT frequency spectrum visualizer. Binds to Web Audio `AnalyserNode` or renders synthetic ambient radio pulse.
- `<AudioVisualizer>`: Multifunction phosphor visualizer supporting `bars`, `oscilloscope`, and circular `radar` modes.
- `<SMeterGauge>`, `<AnalogTuner>`, `<LivingBackdrop>`, `<MtsTelemetryClock>`.

---

## 4. Verification & Testing
The test suite in `packages/moonui/test/` runs natively under Node 24:
```bash
pnpm --filter @moonwitness/moonui test
pnpm ui:check
```
All components are certified for WAI-ARIA accessibility, keyboard traversal, token purity, and zero visual drift.
