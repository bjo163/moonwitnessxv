# M19-36 — MoonUI shared-first centralization: worktree evidence

**Status: WORKTREE EVIDENCE, NOT RELEASE EVIDENCE.** Base branch `dev`, base SHA `ad96dbf`. No exact-SHA CI run, no deployment and no screenshot harness were exercised. Commands below were run locally on the working tree on 2026-10-30.

Authority: [ADR-0017](../decisions/ADR-0017-shared-first-component-ownership.md) (supersedes ADR-0009 §2.4 component placement).

## What changed

| Area | Before | After |
|---|---|---|
| Surface discovery | 26 hand-listed files in `scripts/check-ui-consistency.mjs` | Every app from `scripts/apps.registry.mjs` plus any `apps/*` with `src/` or `client/` — 11 apps, 216 files |
| Duplicate detection | 14 literal CSS class names | Component-declaration matrix (`C5`) + case-insensitive collision with MoonUI exports + `-btn/-card/-dialog/...` suffix denylist (`C3`) |
| Bounded debt | none | `docs/design/moonui-exceptions.json`, 69 entries, ceiling `RATCHET = 69` in the linter source |
| Editor feedback | none for component ownership | `@moonwitness/shared-ui-only` (AST) for `apps/**/*.tsx`; dormant `enforce-token-purity` enabled |
| Cockpit dialogs | `CockpitConfirmModal.tsx`, `CockpitHelpModal.tsx`, `modal-focus.ts` | `<AlertDialog>` + `<Modal>` + `<KbdLegend>`; three files deleted |
| ECHOLOG dialog | `EchologConfirmDialog.tsx` + `.echolog-dialog*` CSS | `<AlertDialog>` with `note`; component and 28 CSS lines deleted |
| Orbit navigation | `OrbitNav.tsx` + `.orbit-nav-link*` CSS | `<SectionNav>`; component and 26 CSS lines deleted |
| Orbit filter chips | local `Chip` + `.orbit-filter-chip*` CSS | `<Pill>` (now carries `aria-pressed`) + `<Button>` + `<TextInput>`; 46 CSS lines deleted |
| Stat anatomy | `StatRow.tsx` (empire) + `.dk-paper-stat-row` markup | `<StatStrip>` (empire, row orientation) and `<StatStrip orientation="column">` (dock constellation card); `.dk-paper-stat-row` deleted |
| Data states | `PanelState`/`OutcomePanel` in Dock | MoonUI `states.tsx`; Dock keeps `readPanel`/`DataPanel` only |
| Four spaces | `SpaceGrid`/`SpaceCard` in Dock | MoonUI `spaces.tsx`; Dock keeps `dockSpaces(locale)` route/copy data |
| Empire chrome | `SiteHeader`, `SiteFooter`, `SocialRow`, `PageActions` | MoonUI `site.tsx` + `client/site-header.tsx`; Empire keeps `src/lib/site-copy.ts` (data only) |
| Empire buttons | `.su-btn`, `.su-btn--primary`, `.su-btn--ghost`, `.su-btn--sm` (1145 chars of CSS) | `LinkButton`; the rules are deleted |
| HQ denial | `LiveAlert.tsx` + `AccessDenied.tsx` markup | `AccessDeniedView`; `AccessDenied` is a markup-free container and `LiveAlert` is a re-export alias of `Alert` |
| HQ feeds | `ui/widgets/Feeds.tsx` (`AuditFeed`, `JobTable`) | MoonUI `feeds.tsx` over structural rows |
| HQ locale control | `LocaleSelector.tsx` markup | MoonUI `LocaleSelect`; HQ keeps the cookie + reload |
| HQ records | `widgets/RecordForm.tsx`, `widgets/ModelTable.tsx`, `fields/registry.tsx` | MoonUI `records.tsx` (`RecordForm`, `ModelTable`, `TierBadge`); HQ keeps `data/form-fields.ts` (schema → props) and the route pages |
| Orbit header + 2D fallback | `OrbitShellHeader.tsx`, `OrbitWebGLFallback.tsx` | MoonUI `surfaces/orbit.tsx` (`OrbitShellHeaderView`, `WebGLFallbackView`) + generic `LocaleLinks` |
| Cockpit views | `CockpitLedgerView`, `CockpitLogsView`, `CockpitPortsView`, `CockpitPreviewView`, `CockpitSidebar`, `CockpitFooter`, `CockpitTunerSection` | MoonUI `surfaces/cockpit.tsx` (+ client subpath for the tuner); Cockpit keeps `lib/ports.ts` and `lib/tuner.ts` (derivations) |
| Composition roots | `App.tsx` in the three Vite apps, `layouts/*`, `pages/*` | Recognised by the gate as composition roots (ADR-0017 R2), not ledgered |

Ledger: **69 → 40 entries**, 216 → 175 scanned files, and the duplicate matrix is empty. The only debt added during the session is `apps/isp-console`, a new untracked consumer app that appeared mid-session; it was registered with the same removal task instead of being excluded.

Last pass: Dock's `SiteHeader`/`SiteFooter`/`StationCard`/`StationGrid` were renamed (`DockSiteHeader`, `DockFooter`, `StationDirectoryCard`, `StationDirectoryGrid`) so no app component collides with a MoonUI export; the Dock locale switcher folded into `shell.tsx` as a labelled `role="group"` so the shell keeps exactly one navigation landmark; the Empire home route now renders MoonUI's `StoryHomePage` over `homeCopy` + artwork props.

Also removed in the last pass: the four app stylesheet exemptions (Empire `.su-nav`/`.su-mobile-menu-button`, HQ `.hq-shadow-card`/`.hq-mc-radar-card`, Orbit's nine `-btn`/`-panel`/`-spinner` classes) — Orbit's buttons and spinner are now `Button`/`Spinner`, and the surviving layout bands were renamed so no app stylesheet defines a primitive-level class. ECHOLOG's `EchologDetailPanel` became MoonUI's `ObjectDetailPanel` over pre-formatted stats.

## Second pass — the five governed primitive tests and the last stat fork

| Change | Detail |
|---|---|
| `packages/moonui/test/spaces.test.ts` | `SpaceCard` is the anchor, `data-tone` drives the rule, the status stays a word, `SpaceGrid` owns the single labelled section and never invents a heading |
| `packages/moonui/test/states.test.ts` | `PanelState` maps `loading`/`empty`/`error`/`ready` onto `role="status"` + `Spinner`, `m-empty`, `role="alert"`, and a wrapper-free pass-through; `OutcomePanel` keeps the same contract |
| `packages/moonui/test/section-nav.test.ts` | one `<nav>` landmark, exactly one `aria-current="page"`, none when no key is active |
| `packages/moonui/test/stat-strip.test.ts` | `<b>`/`<span>` anatomy, `as="section"`, `data-orientation` row/column, consumer band class composed not replaced |
| `packages/moonui/test/alert-dialog.test.ts` | `role="alertdialog"`, `note` inside the `aria-describedby` target, `busy` disables both actions and sets `aria-busy`, closed dialog renders nothing |
| `StatStrip orientation` | additive `orientation?: 'row' \| 'column'` + `.m-stat-strip[data-orientation="column"]` in `moon.css`, so Dock deletes `.dk-paper-stat-row` instead of restyling the primitive (ADR-0017 R4) |
| `apps/dock/src/ui/components/sections.tsx` | the two paper stat rows become one `<StatStrip orientation="column">`; `Stat` and `Glyph` imports leave the file |
| `apps/dock/test/constellation-stats.test.mjs` | source contract: Dock consumes `StatStrip`, keeps no `.dk-paper-stat-row` rule, and the column anatomy lives in `moon.css` |
| `packages/eslint-config/src/index.js` | `ROUTE_SHELL_BASENAMES` gains `route.tsx` and `App.tsx`, mirroring `ROUTE_BASENAMES` in the gate script; `apps/skylink/client/App.tsx` is the single Vite composition root and must not be judged by a different list than the gate uses |

Observed after the second pass:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonui test` | 152/152 pass (121 before the five new files) |
| `node scripts/check-ui-consistency.mjs` | PASS — 175 files scanned, 0 violations, ledger 40/40 |
| `pnpm --filter @moonwitness/dock test` | 322/322 pass (319 before the constellation-stat contract) |
| `pnpm --filter @moonwitness/orbit test` | 89/89 pass |
| `pnpm --filter @moonwitness/echolog test` | 39/39 pass |
| `pnpm --filter @moonwitness/empire-web test` | 10/10 pass |
| `pnpm --filter @moonwitness/dock exec tsc --noEmit` | clean |
| `pnpm exec node --test test/governance/*.test.mjs` (UI linter + ESLint rule) | 10/10 pass |
| `pnpm exec eslint .` | 0 errors outside untracked scratch files (`.tmp/**`, `.vercel-tmp/**`, `apps/skylink/zz-diag.mjs`) |

## Third pass — ECHOLOG's operator watchlist becomes a MoonUI view

| Change | Detail |
|---|---|
| `packages/moonui/src/client/surfaces/echolog.tsx` | new `ObjectWatchlist` (+ `WatchlistRow`, `WatchlistCopy`, `ObjectWatchlistProps`), exported from `@moonwitness/moonui/client`. It composes `Panel`, `DataTable`, `Button`, `TextInput` and `Alert`; it holds only the digest draft and its own track error. |
| `apps/echolog/client/components/EchologObjectList.tsx` | rewritten as a markup-free container (ADR-0017 R2): it maps the local references to `WatchlistRow` words (`formatBytes`, the 17-char label, the three read-state sentences) and forwards every callback. No `<button>`, `<input>`, `<p>` or `<div>` survives in the file. |
| Ledger entry | `mode` changed from `view` to `container`, reason states the delegation. The count stays 40 because the file still exists; the debt that left is the anatomy and the three app-local classes. |
| `apps/echolog/client/echolog-layout.css` | `.echolog-track` and `.echolog-track-error` deleted (10 lines). The track error now renders through `Alert tone="hot"`, so it is announced instead of merely coloured. |
| `packages/moonui/test/watchlist.test.ts` | 6 SSR cases: copy-supplied headers, finished values only, selection through `data-variant`, explicit empty state, destructive action disabled without a target, refresh disabled while busy, and no `echolog-` class in the markup. |

Environment limit found in this pass: the IDE file-delete operation fails (`recordFileDelete returned false`) for every path, including a stale scratch JSON. The plan's "delete the file" step is therefore not executable here, so the migration was completed by converting the app file into the container form the plan's own final target describes ("≤ 6 entries, all `mode: "container"` with no intrinsic markup") rather than leaving an orphan behind. Deleting the container is the first step once file deletion works.

Observed after the third pass:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonui test` | 158/158 pass (152 before `watchlist.test.ts`) |
| `pnpm --filter @moonwitness/echolog test` | 39/39 pass |
| `pnpm --filter @moonwitness/echolog typecheck` | clean (root + test + client tsconfigs) |
| `pnpm --filter @moonwitness/moonui build` | clean (`tsc -b`) |
| `node scripts/check-ui-consistency.mjs` | PASS — 175 files scanned, 0 violations, ledger 40/40, matrix empty |
| `pnpm exec eslint apps/echolog/client packages/moonui/src/client/surfaces/echolog.tsx packages/moonui/test/watchlist.test.ts` | exit 0 |

## Fourth pass — the gate could still be bypassed, and the design system owed an app its CSS

Two defects in the guardrail itself were found by reading the gate against the tree rather than trusting its green result:

| Defect | Evidence | Fix |
|---|---|---|
| C3 matched component-class suffixes only after a hyphen, so BEM spellings escaped | `ui:check` reported 0 violations while `apps/empire-web/src/app/globals.css` defined `.su-lib__tab`, `.su-lib__card`, `.su-info__nav`, `.su-info__card`, `.su-home__card`, `.su-reader__pager`, `.su-footer__nav` — the same `-tab`/`-card`/`-nav`/`-pager` anatomy the plan says must not live in an app stylesheet | `normaliseSelectorName()` folds `__` and `--` to `-` before the suffix test. 46 line-level hits in one hitherto-invisible stylesheet are now measured |
| MoonUI emitted classes that only an application stylesheet defines | `site.tsx`, `client/site-header.tsx`, `story.tsx`, `surfaces/{cockpit,echolog,orbit}.tsx` put 120 `su-*`/`cockpit-*`/`echolog-*`/`orbit-*` classes on elements while the rules live under `apps/`. Any consumer other than that one app renders unstyled markup — the inverted dependency the whole plan exists to prevent | new check **C7** measures exactly that set (emitted by `packages/moonui/src`, defined only in `apps/**`, absent from `moon.css`) and ratchets it in the script source |

Ledger consequence: `docs/design/moonui-exceptions.json` gains `apps/empire-web/src/app/globals.css` with 9 selectors (`.su-footer__nav`, `.su-home__card`, `.su-info__card`, `.su-info__nav`, `.su-lib__card`, `.su-lib__select`, `.su-lib__tab`, `.su-lib__tabs`, `.su-reader__pager`), so **RATCHET moved 40 → 41**. This is a measurement correction, not an allowance: the debt existed before, the detector could not see it. It is recorded here and in the constant's HISTORY comment because R5 requires every increase to be visible and reviewable. It must come down from here.

First C7 pay-down (ECHOLOG, 120 → 117):

| Change | Detail |
|---|---|
| `packages/moonui/src/surfaces/echolog.tsx` | `echolog-row` → `m-row`; `echolog-stats` → `m-detail-stats`; `echolog-pills` → `m-detail-pills` |
| `packages/moonui/moon.css` | `.m-detail-stats` (auto-fit 220px grid) and `.m-detail-pills` (wrapping pill band) now belong to the design system |
| `apps/echolog/client/echolog-layout.css` | `.echolog-row`, `.echolog-stats`, `.echolog-pills` deleted (21 lines); only page bands remain |
| `apps/echolog/client/App.tsx`, `components/EchologUploadPanel.tsx` | the two app call sites of `echolog-row` switched to `m-row`, so the class no longer exists anywhere |

Remaining C7 work, measured and bounded: Empire 82 classes, Orbit 24, Cockpit 11. The fix for each is the same move — rename to `.m-*`, put the rule in `moon.css`, delete it from the app stylesheet.

Governance tests grew from 10 to 13: a BEM-spelling case, a C7 measurement case, and a C7 over-ceiling case that reads the ceiling back out of the linter source so the bound cannot be quietly widened.

Observed after the fourth pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 7 checks, 175 files scanned, 0 violations, ledger 41/41, CSS debt 117/117, matrix empty |
| `node scripts/check-ui-consistency.mjs --json` | `cssDebt.entries` lists class → emitting MoonUI file → defining app stylesheet |
| `pnpm exec node --test test/governance/ui-consistency-linter.test.mjs test/governance/shared-ui-eslint-rule.test.mjs` | 13/13 pass |
| `pnpm --filter @moonwitness/moonui test` | 158/158 pass |
| `pnpm --filter @moonwitness/echolog test` | 39/39 pass |
| `pnpm --filter @moonwitness/echolog typecheck` | clean |
| `pnpm --filter @moonwitness/cockpit test` | 46/48 — the two unchanged pre-existing failures |

## Fifth pass — the C7 list went to zero, and a renamed fork was found and deleted

C7 was reported as 117 remaining. Reading what it actually listed showed the same inversion in Orbit and Cockpit, so the whole list was paid down instead of parked.

| Move | Blocks | App stylesheet | moon.css |
|---|---|---|---|
| Empire site chrome + story surfaces (`site.tsx`, `client/site-header.tsx`, `story.tsx`) | 175 (138 top level, 37 inside three `@media` groups) | 817 → 623 lines | +201 |
| Orbit surfaces (`surfaces/orbit.tsx`, `client/surfaces/orbit.tsx`) | 26 | 835 → 610 lines | +184 |
| Cockpit surfaces (`surfaces/cockpit.tsx`) | 12 | 276 → 182 lines | +92 |
| ECHOLOG (previous pass) | 3 classes folded into `m-row` + `.m-detail-stats`/`.m-detail-pills` | −21 lines | +14 |

C7 debt: **120 → 0**. `MOONUI_CSS_DEBT_CEILING` is set to **0**, so the dependency is now forbidden rather than merely counted. Every file stayed brace-balanced, and all four apps import `moon.css` before their own stylesheet, so a page band can still refine a value without restating an anatomy.

The list also exposed a real fork that C5 cannot see: `packages/moonui/src/story.tsx` exported `StoryGgsPage` while `apps/empire-web/src/components/story/GgsPage.tsx` still carried a **complete second implementation of the same page** (99 lines, identical class anatomy, different component name), and the MoonUI copy was never exported from the barrel — so nothing rendered it. The Empire `/ggs` route was rendering the app fork.

| Change | Detail |
|---|---|
| `packages/moonui/src/story.tsx` | `StoryGgsPage` now takes `artwork: StoryGgsArtwork`; the four hard-coded `/story-universe/*.webp` paths left the design system. The reflection band reads `--m-surface-art`. |
| `packages/moonui/src/index.ts` | exports `StoryGgsPage`, `StoryGgsCopy`, `StoryGgsArtwork` (the view was unreachable before, which is how the duplicate survived). |
| `apps/empire-web/src/lib/ggs-copy.ts` | owns `ggsArtwork` — content stays with the app (R3). |
| `apps/empire-web/src/components/story/GgsPage.tsx` | 99 lines of duplicate markup replaced by a JSX-free `ggsViewProps(locale)` returning copy, footer, `hrefFor` and artwork. It left the exception ledger, so **RATCHET returned to 40**. |
| `apps/empire-web/src/app/(localized)/[locale]/ggs/page.tsx` | renders MoonUI's `StoryGgsPage` and composes the shared `SiteHeader` itself. |
| `scripts/check-ui-consistency.mjs` C8 | new check: an app file that renders a MoonUI view's class fingerprint (≥12 moon.css-defined classes, all present) is a fork even under a different name. 9 view anatomies tracked, 0 duplicated. |
| `test/governance/ui-consistency-linter.test.mjs` | +2 cases: a renamed twin must fail C8; a page merely composing shared primitives must not. 15/15 now. |
| `apps/orbit/test/orbit-queues-inspectors.test.mjs`, `apps/empire-web/test/token-purity.test.mjs` | guards follow the CSS to its new owner (R6): the filter-bar rule is asserted in `moon.css`, and artwork is asserted to be owned by `ggs-copy.ts` and absent from both stylesheets' `url()` values. |

**Markup equivalence evidence.** The Empire static export was rebuilt and `/en/ggs` diffed against the previously prerendered page (baseline snapshot kept at `.tmp/ggs-baseline.html`): 392 nodes before and after, identical visible text (2,033 characters both), and exactly two intentional differences — `data-orientation="row"` on the shared `StatStrip` and `style="--m-surface-art:url(/story-universe/home-mooncity.webp)"` on the reflection panel. Promoting the page changed no markup.

Observed after the fifth pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 8 checks, 175 files, 0 violations, ledger 40/40, C7 0/0, C8 0 duplicates |
| `pnpm exec node --test test/governance/ui-consistency-linter.test.mjs test/governance/shared-ui-eslint-rule.test.mjs` | 15/15 |
| `pnpm --filter @moonwitness/moonui test` | 158/158 (skins test still parses the enlarged `moon.css`) |
| `pnpm --filter @moonwitness/dock test` | 322/322 |
| `pnpm --filter @moonwitness/orbit test` | 89/89 |
| `pnpm --filter @moonwitness/echolog test` | 39/39 |
| `pnpm --filter @moonwitness/empire-web test` | 10/10 |
| `pnpm --filter @moonwitness/cockpit test` | 46/48 — the same two pre-existing failures |
| `pnpm --filter @moonwitness/moonui build`, `@moonwitness/empire-web build`, `@moonwitness/orbit build`, `@moonwitness/cockpit build` | all clean (cockpit vite build 1.27s, Empire static export 11 routes) |
| `pnpm exec eslint scripts/check-ui-consistency.mjs test/governance packages/moonui/src apps/{empire-web,orbit,cockpit,echolog}` | 0 errors, 1 pre-existing `max-lines-per-function` warning in `apps/cockpit/client/App.tsx` |

## Sixth pass — the Story Universe has one implementation each

Phase 3 item 2 ("Empire story pages → MoonUI, copy injected") is now complete for every reference page. Each app page module keeps its path and becomes a JSX-free props reader; the route composes the shared `SiteHeader` and renders the MoonUI view.

| Route | MoonUI view (only implementation) | App module now |
|---|---|---|
| `/[locale]/ggs` | `story.tsx` → `StoryGgsPage` | `components/story/GgsPage.tsx` → `ggsViewProps(locale)` |
| `/[locale]/characters` | `codex.tsx` → `StoryCodexPage` | `CodexPage.tsx` → `codexViewProps(locale)` |
| `/[locale]/stories` | `client/surfaces/empire.tsx` → `StoryLibraryPage` | `LibraryPage.tsx` → `libraryViewProps(locale)` |
| `/[locale]/stories/angelwithshotgun` | `client/surfaces/empire.tsx` → `StoryReaderPage` | `ReaderPage.tsx` → `readerViewProps(locale)` |

Words that were JSX literals moved into the catalogs where they belonged: `traitsLabel` (codex), and for the reader `breadcrumbLabel`, `pageNavLabel`, `thumbGroupLabel`, `previousLabel`, `nextLabel`, `posterAlt`, `posterWords`, `posterWordsLow` — previously either inline English/Indonesian conditionals or hard-coded poster text (`PROTECT / WHAT / STILL / MATTERS.`). Every picture URL is a prop (`codexArtwork`, `artwork.hero`, `artwork.poster`).

One design constraint the first build caught: a function cannot cross from a Server Component into a Client Component, so the two interactive views take `basePath: string` (`/id`, `/en`) and build their own hrefs instead of receiving `hrefFor`. The server-only views keep the callback form.

CSS ownership followed automatically: after each move, the C7 list named the newly MoonUI-rendered classes and the same rule-block move relocated them — Empire's stylesheet went 623 → 561 → 417 lines and `moon.css` grew to 2,849 lines. **C7 remains at 0 entries with ceiling 0.**

Ledger: **40 → 37** (RATCHET 37). `LibraryPage`, `ReaderPage` and `CodexPage` left it as JSX-free readers, and Empire's stylesheet entry dropped the `.su-lib__*`, `.su-reader__pager`, `.su-home__card` selectors whose rules moved into `moon.css`.

Markup equivalence, page by page, from rebuilding the static export and diffing against the previously prerendered HTML of the app-owned version:

| Route pair | Nodes | Structural mismatches | Visible text |
|---|---|---|---|
| `/en/characters`, `/id/characters` | 356 → 356 | 0 | identical (2,613 / 2,773 chars) |
| `/en/stories`, `/id/stories` | 387 → 387 | 0 | identical (1,980 / 2,057 chars) |
| `/en/stories/angelwithshotgun` | 294 → 294 | 0 | identical (1,955 chars) |
| `/en/ggs` (fifth pass) | 392 → 392 | 2 intended attributes | identical (2,033 chars) |

Observed after the sixth pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 8 checks, 175 files, 0 violations, ledger 37/37, C7 0/0, 11 tracked view anatomies, 0 duplicated |
| `pnpm --filter @moonwitness/moonui test` / `typecheck` / `build` | 158/158, clean, clean |
| `pnpm --filter @moonwitness/dock test` | 322/322 |
| `pnpm --filter @moonwitness/orbit test` | 89/89 |
| `pnpm --filter @moonwitness/echolog test` | 39/39 |
| `pnpm --filter @moonwitness/empire-web test` / `typecheck` / `build` | 10/10, clean, clean static export |
| `pnpm exec node --test test/governance/*` | 15/15 |
| `pnpm exec eslint packages/moonui apps/empire-web scripts/check-ui-consistency.mjs test/governance` | exit 0 |

`apps/empire-web/test/contracts.test.mjs` scans the publication gates across the files that render story strings; its list gained `codex.tsx` and `client/surfaces/empire.tsx` so `aria-pressed`/`setActive` are still asserted — of their new owner, which is what R6 requires.

## Seventh pass — the information-page shell moved too, and Phase 3 item 1 is complete

`apps/empire-web/src/components/site/InfoPage.tsx` was the last app-local shell the plan names in item 1. It is now MoonUI's `InfoPage` in `packages/moonui/src/site.tsx`, and the app file resolves its props.

| Piece | Where it went | Why |
|---|---|---|
| bar, breadcrumb, section nav (`aria-current`), locale switch (`.emp-lang`, `hrefLang`), document band, back action | `site.tsx` → `InfoPage` | one implementation of the shell shared by the six information pages |
| `locale`, `other`, `local()` | became `basePath`, `langCode`, `langHref` props | MoonUI keeps no locale or route knowledge (R3) |
| `title`, `summary`, `preview`, `home`, `navigation`, `langLabel`, `sections`, footer copy | `infoPageProps(locale, section)` in the app | copy and catalogues stay in the app (R2) |
| `header`, `children` (paragraphs, ecosystem cards, source list) | the route supplies them | a route file is the composition point, and the page-specific bodies are content |

The three pinned contracts the old comment named — the exact `<h1>`, `.emp-lang`, `aria-current` — are stated in the new component's docblock and are now rendered by the shared code. Moving the shell made 12 classes MoonUI-rendered, so C7 named them and their rules followed into `moon.css` (Empire stylesheet 417 → 386 lines, `moon.css` 2,892). C7 stays at 0 with ceiling 0.

Ledger: **37 → 36** (RATCHET 36).

Equivalence, from rebuilding the static export and diffing against the prerendered app-owned HTML:

| Route | Nodes | Structural mismatches | Visible text |
|---|---|---|---|
| `/en/about` | 169 → 169 | 0 | identical (1,269 chars) |
| `/id/sources` (with the source list children) | 178 → 178 | 0 | identical (1,615 chars) |

Observed after the seventh pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 8 checks, 175 files, 0 violations, ledger 36/36, C7 0/0, 11 anatomies, 0 duplicated |
| `pnpm --filter @moonwitness/moonui build` / `typecheck` / `test` | clean, clean, 158/158 |
| `pnpm --filter @moonwitness/empire-web typecheck` / `build` / `test` | clean, clean static export, 10/10 |
| `pnpm --filter @moonwitness/dock test` | 322/322 |
| `pnpm --filter @moonwitness/orbit test` / `echolog test` | 89/89 / 39/39 |
| `pnpm exec node --test test/governance/*.test.mjs` | 29/29 |
| HQ focused (`hq-authz-guard`, `hq-locale-regression`) | 26/26 |
| `pnpm --filter @moonwitness/cockpit test` | 46/48 — the same two pre-existing failures |

## Eighth pass — the entry page, and Empire leaves the ledger except one stylesheet entry

`apps/empire-web/src/components/Landing.tsx` was the last Empire component with markup of its own. Its anatomy is now `LandingPage` in `packages/moonui/src/landing.tsx` (bar, hero with the CSS-drawn orbit figure, manifesto, four starting points, space atlas, story band, principles), and the app module resolves the copy.

| Moved out of the component | Where it lives now |
|---|---|
| hero art labels (`FROM THE SKY`, `TO THE CLOUD`, `MW XV · 2026`, `00 / LIGHTHOUSE`), `01 / MISSION`, the discover heading and four starting points, the notebook date/line/foot | new `landingExtras` in `apps/empire-web/src/lib/copy.ts` — they had been JSX literals, English-only in both locales |
| `status === 'CODE EXISTS' ? 'cyan' : 'night'` and `/${locale}/${section}` | `landingProps(locale)` in `components/Landing.tsx`; the view takes `statusTone` and finished `href`s |
| hand-written `<a class="m-btn" data-variant data-size>` pairs | `LinkButton`, so the CTA markup is the primitive rather than a copy of it |
| the whole `emp-*` band CSS (39 classes MoonUI now renders) | moved into `moon.css`; Empire's stylesheet fell 386 → 235 lines and `moon.css` is 3,048 |

Ledger: **36 → 35** (RATCHET 35), and Empire is down to its stylesheet entry alone — 7 component-class selectors whose rules sit in mixed selector lists that also cover app-owned bands. C7 remains 0/0 and C8 now tracks 12 MoonUI view anatomies with 0 duplicated.

Equivalence: rebuilding the static export and diffing `out/index.html` against the previously prerendered entry page gives 301 → 301 nodes, **0 structural mismatches**, and identical visible text (2,539 characters) — the locale-prefixed `m-btn` markup, ordinals and every string land exactly where they did before.

Observed after the eighth pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 8 checks, 175 files, 0 violations, ledger 35/35, C7 0/0, C8 0 duplicates over 12 anatomies |
| `pnpm --filter @moonwitness/moonui build` / `test` | clean, 158/158 |
| `pnpm --filter @moonwitness/empire-web typecheck` / `build` / `test` | clean, clean static export, 10/10 |
| `pnpm --filter @moonwitness/dock test` / `orbit` / `echolog` | 322/322, 89/89, 39/39 |
| `pnpm exec eslint packages/moonui apps/empire-web scripts` | exit 0 |

Ledger composition now: Dock 19, HQ 5, Cockpit 3, Orbit 3, ECHOLOG 2, isp-console 2, Empire 1.

## Ninth pass — every gate check has a failing fixture, and the migrated pages were driven in a browser

**Phase 0.1 exit criterion closed.** The plan required the rewritten script to pass on the real tree *and* fail on a fixture tree carrying each violation class. C2 and C4 had no fixture. `test/governance/ui-consistency-linter.test.mjs` gained three cases, and the file now covers all eight checks:

| Check | Fixture that must fail |
|---|---|
| C1 surface adoption | icons-only component |
| C2 token purity | `#00e5ff` in a component's inline style **and** `#22d3ee` in its stylesheet — both reported, each with the token named as the remedy |
| C3 component classes | hyphen form, BEM form |
| C4 typography | `font-family: Arial, sans-serif`, with a second assertion that the token form is accepted (the check cannot be satisfied by deleting CSS) |
| C5 duplicate matrix | icons-only twin, cross-app name, MoonUI-owned name |
| C6 ledger | over-cap, unregistered file, **and a stale entry whose declared export or selector exemption no longer exists** |
| C7 design-system CSS | measurement case + over-ceiling case |
| C8 markup fingerprint | renamed twin fails; a page composing shared primitives does not |

**Browser evidence on the migrated surfaces.** The rebuilt static export was served on `127.0.0.1:4321` (no backend needed) and driven in a real browser:

| Page | Observed |
|---|---|
| `/` (now `LandingPage`) | title `A-L-L-A-H.COM \| Empire of the Light`, one `<h1>`, six sections; `.emp-hero` computed `display: grid`, `border-bottom-width: 4px` — the styles whose rules moved into `moon.css` apply; `.emp-manifesto` background `rgb(255, 212, 0)`, not transparent; six `.emp-space`; `scrollWidth` 1366 = `clientWidth` 1366 |
| `/id/stories` (now `StoryLibraryPage`) | five `button.su-lib__tab`; clicking a non-first tab takes four visible cards to one and flips `aria-pressed`; the sort `select` reorders (Terlama reverses, Judul A–Z sorts by title); `.su-lib__tabs` `padding-top: 48px`, `.su-lib__tab` `background-image: none` + `border-left-width: 1px`, pressed colour `rgb(255, 90, 107)` vs unpressed `rgb(181, 175, 164)` |
| `/en/ggs` | `.su-ggs__reflection` carries inline `--m-surface-art:url(/story-universe/home-mooncity.webp)` and its `::before` computes to that URL — the artwork-prop design works in a browser, not only in HTML text |
| `/en/characters` | six trait articles; hero art `alt=""` with `src=/story-universe/codex-guardian.webp`, second image `/story-universe/reader-poster.webp` loaded (`naturalWidth` 1024) |
| `/id/about` (now `InfoPage`) | `<h1>` `TENTANG PROYEK`, six `nav.su-info__nav a` with `display: flex`, exactly one `aria-current="page"` (the active section), `a.emp-lang` `hreflang="en"`, `aria-label="Switch to English"`, `href=/en/about` |
| all five | zero console messages of any type; zero failed requests; one stylesheet per page containing both the moved `.su-*`/`.emp-*` rules and the shared `.m-*` ones |

**One real defect the browser pass found, now fixed.** A search or filter that matches nothing left `section.su-lib__grid` empty — a blank band with an `aria-live="polite"` promise and nothing to announce. The original app page had the same hole, and the migration faithfully preserved it; the design system's own rule (asserted in `apps/dock/test/ui2-p16-patches-census-states.test.mjs:272`: "a filter that removes every record says so instead of showing a blank grid") says the shared view must state it. `StoryLibraryPage` now renders `EmptyState` from the view's `emptyTitle`/`emptyHint` copy, and `moon.css` spans it across the band. Re-verified in the browser: with `zzzz` typed, zero cards, `.m-empty` present with `grid-column: 1 / -1`, `align-self: center`, full-band width (534 of 534 content px), text `Tidak ada cerita yang cocok …` in Indonesian and `No stories match this filter …` in English. The prerendered HTML of `/en/stories` and `/id/stories` still diffs at 387 → 387 nodes with 0 mismatches, because the block is conditional.

Limits of this evidence, stated plainly: the browser's screenshot writer refused every path (embedded view `visible=false`, and the CDP server's roots rejected both the workspace and the temp dir), so the captures exist only as inline frames — no new PNG was written. Automation also could not type into the search field through ordinary key events (`fill`/`click` timed out; `press_key` registered without inserting); the value was set with the native `HTMLInputElement` setter plus a bubbling `input` event, which drives React's real `onChange` path, but no OS-level keystroke was proven.

Observed after the ninth pass:

| Command | Result |
|---|---|
| `pnpm exec node --test test/governance/*.test.mjs` | 32/32 (was 29) |
| `node scripts/check-ui-consistency.mjs` | PASS — 175 files, 0 violations, ledger 35/35, C7 0/0, C8 0 duplicates |
| `pnpm --filter @moonwitness/{moonui,empire-web,dock,orbit,echolog} test` | 158/158, 10/10, 322/322, 89/89, 39/39 |
| `pnpm --filter @moonwitness/moonui build`, `@moonwitness/empire-web typecheck` + static export | all clean; `moon.css` 3,051 lines, braces balanced |
| `pnpm exec eslint packages/moonui apps/empire-web test/governance scripts` | exit 0 |

## Tenth pass — the geometry matrix, and a blind spot in my own new check

The browser pass that followed the ninth pass exposed a hole in C7 that I had created myself: a class name *assembled from data* never appears as a literal, so nothing can tell whether an application stylesheet is the only thing styling it. `landing.tsx` emitted `emp-space-${space.accent}` — `emp-space-warm|cool|pink` were defined in Empire's stylesheet, invisible to C7, and the pages looked correct because the app happened to style them.

| Fix | Detail |
|---|---|
| new gate check **C9** | a MoonUI file may not concatenate a class name from data: a template fragment ending in `-` inside `className`/`cn()` is rejected, with the remedy "render a data-* attribute and put the variant rule in moon.css". Substituting a whole caller-supplied `className` stays legal, and a `key={`${i}-${label}`}` is not a class slot (the first draft of the check flagged exactly that, so the patterns are anchored to `className=`/`cn(`) |
| `landing.tsx` + `moon.css` | `data-accent={space.accent}` with `.emp-space[data-accent="warm|cool|pink"]` rules in `moon.css`; the three modifier rules left `apps/empire-web/src/app/globals.css` |
| `terminal.tsx` + `moon.css` | C9's second genuine hit, pre-existing: `m-terminal-${line.level}` became `data-level` with five `[data-level=…]` selectors replacing `.m-terminal-info/.m-terminal-warn/.m-terminal-error`. `git grep` showed no consumer of the old names |
| `client/surfaces/empire.tsx` | the three library `select`s gained `name` (`library-sort`, `library-world`, `library-status`) after the browser reported Chrome's "a form field element should have an id or name attribute" issue; verified gone on a fresh load and after interaction |
| `moon.css` headers | the moved-CSS banner comments named a wrong path (`src/surfaces/empire-web*`); they now name the real emitting modules |

**Geometry matrix, the plan's unmet Test Plan line.** Served from the rebuilt static export and measured at 390, 768, 1440 and 1920 (×900, fresh load per cell, `document.documentElement.scrollWidth` vs `clientWidth`) across the five migrated routes:

| Route | 390 | 768 | 1440 | 1920 |
|---|---|---|---|---|
| `/` | 375 = 375 | 753 = 753 | 1425 = 1425 | 1905 = 1905 |
| `/id/stories` | 375 = 375 | 753 = 753 | 1425 = 1425 | 1905 = 1905 |
| `/en/characters` | 375 = 375 | 753 = 753 | 1425 = 1425 | 1905 = 1905 |
| `/en/ggs` | 375 = 375 | 753 = 753 | 1425 = 1425 | 1905 = 1905 |
| `/id/about` | 375 = 375 | 768 = 768 | 1440 = 1440 | 1920 = 1920 |

20/20 — no horizontal overflow on any migrated route at any width. Two advisory observations that pass the criterion but are not styled-away: at 390 and 768 the library hero copy band is clipped ~21px inside its own `overflow:hidden` container (`.su-lib__hero-copy` at `left:41px; width:min(620px,54%)`), and at 390 the landing orbit art is clipped ~16px. Both are pre-existing M45 mockup-faithful geometry carried over unchanged (the markup diff is identical), they clip content rather than creating scroll, and resizing them touches another milestone's visual acceptance — recorded, not touched.

Re-measured after the fixes: all six `article.emp-space` resolve `border-top-color` from `data-accent` — `rgb(255,212,0)` warm, `rgb(0,212,255)` cool, `rgb(255,0,122)` pink, matching `--accent`/`--cyan`/`--pink` — with zero elements anywhere on the page carrying a transparent bordered top; no `emp-space-warm|cool|pink` remains in the DOM; the empty state still renders `div.m-empty` first when nothing matches; and both pages log no console messages at all.

Observed after the tenth pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — **9 checks**, 175 files, 0 violations, ledger 35/35, C7 0/0, C8 0 duplicates, C9 0 sites |
| `pnpm exec node --test test/governance/*.test.mjs` | 33/33; each of the nine checks now has a fixture that must fail, including C9's rejecting-concatenation and accepting-caller-class pair |
| `pnpm --filter @moonwitness/moonui build` + `test`; `@moonwitness/empire-web build` + `test` | clean + 158/158; clean static export + 10/10 |
| `pnpm --filter @moonwitness/{dock,orbit,echolog} test` | 322/322, 89/89, 39/39 |
| `pnpm exec eslint packages/moonui apps/{empire-web,dock,orbit} scripts test/governance` | 0 errors (3 pre-existing warnings) |

## Eleventh pass — C10, and what only a browser could see

The tenth pass's browser run returned three findings that no static check could reach, because a CSS override is a *computed-style* fact, not a source-level one:

| Finding | Measurement |
|---|---|
| the landing status dot was still an app-private drawing of a shared primitive | `.emp-state-dot { width:7px; height:7px; border-radius:50%; background:var(--muted) }` sat on the same span as `m-live-dot` and won, so the "shared" dot rendered 7px, not the primitive's 8px. C10's first half cannot see it: the selector never mentions `.m-*` |
| the library search field had **no focus indicator at all** | focused `input#story-search` computed `outline: rgb(241,237,229) none 3px`, `box-shadow: none`, and `label.su-lib__search` had no `:focus-within` rule — a WCAG 2.4.7 gap that had moved into `moon.css` along with the markup |
| 8 of 24 library controls wore the browser's default ring | five `.su-lib__tab` buttons, three `select`s, the card CTA and the reader pager carry no `m-*` class, so the enumerated focus list simply missed them |

| Fix | Detail |
|---|---|
| gate check **C10 extended** | a second half, `collectBandRedrawsOfPrimitives()`: read the class pairs MoonUI puts on one element, and fail any self-selector rule on the band side that restates an anatomy property the primitive itself declares. Size counts only there (`BAND_REDRAW_PROPERTIES`) — a band may give a `.m-card` a width the primitive never had, it may not resize a dot the primitive sized. Descendant selectors and `data-*` compounds stay legal |
| `landing.tsx` + `moon.css` | `<span className="emp-state-dot m-live-dot" />` became `<LiveDot on={false} />`; the band keeps only `.emp-state .m-live-dot { margin-right: 8px }`. Rendered: 8px, `rgb(158,150,176)` (= `--muted`), `border-radius:50%`, no glow, 8px right margin, and zero `.emp-state-dot` rules in the shipped CSSOM |
| `moon.css` focus rings | `.su-lib__search:focus-within` and `.su-lib__select select:focus` joined the design system's field-focus group (pink border + `0 0 0 2px` glow, the same treatment `.m-input-group:focus-within` already gave), and a new shell-scoped rule — `.su-shell a/button/select:focus-visible`, `.emp-shell a/button:focus-visible` — gives every interactive element in a design-system page its ring without a list that silently misses the next button |

Re-measured on the rebuilt export: library page 25 focusable controls, **0** with no indicator and **0** on the UA `auto` ring (21 system rings, 3 field glows); the search label computes `border-color: rgb(219,30,49)` with `box-shadow: rgba(255,0,122,.28) 0 0 0 2px` while its input is focused; reader page 19 controls, 0 unindicated. Geometry re-checked after the CSS change on `/`, `/en/stories` and `/en/stories/angelwithshotgun` at 390 and 1920 — 6/6 cells `scrollWidth == clientWidth` (390 = 390, 1905 = 1905). Markup neutrality re-proved by HTML diff: `/` 301 nodes with 7 intended deltas (1 dot, 6 `data-accent`), `/en/stories` and `/id/stories` 387 nodes with 3 (`name=` on the selects), `/en/characters` and the reader 0, `/en/ggs` 2 (`data-orientation`, whitespace); visible text identical on every route.

Observed after the eleventh pass:

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — **10 checks**, 175 files, 0 violations, ledger 35/35. Before the fix the same command reported the `.emp-state-dot` repaint as its only violation, which is the check working |
| `pnpm exec node --test test/governance/*.test.mjs` | 35/35 (new fixture: *a band class stacked on a primitive may not repaint it*, asserting the repaint is caught and `margin-right` is not) |
| `pnpm --filter @moonwitness/moonui build` + `test` | clean (`tsc -b`) + 158/158 |
| `pnpm --filter @moonwitness/empire-web build` | clean static export, 20 localized documents |
| browser (Chrome, static export served on `127.0.0.1:4321`, then stopped) | computed-style and focus walks above; viewport screenshot returned inline — writing a PNG into the workspace is still rejected by the CDP root configuration |
| `pnpm --filter @moonwitness/{cockpit} test`; HQ focused (`hq-locale-regression`, `editor-actions`, `shadow-editor`) | 46/48 — the same two pre-existing `progress`/`locale-usage` failures; 17/17 |
| `pnpm exec eslint packages/moonui apps/empire-web scripts/check-ui-consistency.mjs test/governance` | 0 errors, 0 warnings |
| documentation | `TODO.md` gained the plan's **M19-36** row (open, with the remaining burn-down named), `docs/tasks/M19/M19-36.md` gained an *As executed* note explaining why the six planned checks became ten, and [ADR-0017](../decisions/ADR-0017-shared-first-component-ownership.md) records C10 in its R4 row |

## Observed commands and results

| Command | Result |
|---|---|
| `node scripts/check-ui-consistency.mjs` | PASS — 216 files scanned, 0 violations, ledger 69/69 |
| `node scripts/check-ui-consistency.mjs --update-ledger` | Wrote 69 entries (was 76 before Phase 1/2) |
| `pnpm exec node --test test/governance/ui-consistency-linter.test.mjs test/governance/shared-ui-eslint-rule.test.mjs` | 10/10 pass (fixtures prove the gate fails on a local `Chip`, a `.demo-btn` class, an icons-only import, an over-cap ledger and an unregistered component) |
| `pnpm --filter @moonwitness/moonui test` | 121/121 pass |
| `pnpm --filter @moonwitness/dock test` | 319/319 pass |
| `pnpm --filter @moonwitness/orbit test` | 89/89 pass |
| `pnpm --filter @moonwitness/echolog test` | 39/39 pass |
| `pnpm --filter @moonwitness/empire-web test` | 10/10 pass |
| `pnpm --filter @moonwitness/orbit test` (after the header/fallback move) | 89/89 pass |
| `pnpm --filter @moonwitness/cockpit test` | 46/48 — the two failures are the pre-existing `progress`/`locale-usage` ones; `security.test.ts` C1b/C2 were updated to follow the views into MoonUI |
| `pnpm --filter @moonwitness/orbit test` (after the filter-bar move) | 89/89 pass |
| `pnpm --filter @moonwitness/echolog test` (after the detail panel move) | 39/39 pass |
| HQ focused (`hq-locale-regression`, `editor-actions`, `shadow-editor`) | 17/17 pass |
| HQ `model-view-locale.test.ts` | 4/4 pass — **first time it runs**: it now imports the shared components instead of modules that failed to resolve |
| `pnpm --filter @moonwitness/moonui build` | clean (`tsc -b`) |
| `pnpm --filter @moonwitness/{dock,orbit,cockpit,echolog,empire-web} typecheck` | clean |
| `pnpm --filter @moonwitness/empire-web build` | clean static export (11 localized routes) |
| `pnpm --filter @moonwitness/dock build` | clean (`next build`, 26 routes) |

## Browser evidence (Dock, offline branch)

`pnpm --filter @moonwitness/dock dev` on `:3001`, driven through Chrome:

| Observation | Value |
|---|---|
| `GET /en`, `/id`, `/en/reader`, `/en/prisms` | 200 |
| `<h1>` count | 1 (`MOONWITNESS`) |
| `.m-space-card` count | 4 (READ / EXPLORE / CREATE / SIGNAL) |
| First card | `<a class="m-space-card" href="/en/reader">` with `h3` "READ" |
| Click through | navigated to `/en/reader`, rendered, no error page |
| Horizontal overflow | none (`scrollWidth` 1351 = `clientWidth` 1351) |
| Console errors | none |

Full-page capture: [dock home](moonui-centralization-dock-home.png). The live-payload branch was not exercised because no Hub was running; the offline branch is the one that renders the four-space grid. The constellation stat card renders only on the live branch (the offline branch states that live counts are unavailable instead of printing zero), so the `StatStrip orientation="column"` migration is verified by its SSR test in `packages/moonui/test/stat-strip.test.ts` and the Dock source contract, not by a browser pass. A second browser attempt on 2026-10-30 reached `GET /en → 200` with one `h1` and no horizontal overflow, but the Hub on `:3000` accepted and never answered, so the streamed home segment never arrived and the constellation card was not in the DOM.

## Pre-existing failures, not caused by this change

Re-checked on 2026-10-30 against `git show HEAD:<path>` and `git grep <key> HEAD`:

- `apps/cockpit/test/progress.test.ts` (`GROUP_DEFS covers every milestone id in the real register`) — TODO.md at HEAD already carries `M42-01` and `M51-01`, and `apps/cockpit/src/todoRegister.ts` is untouched by this work, so `GROUP_DEFS` has no entry for M42–M51 at HEAD too. The unmapped ids observed are `M42…M51`.
- `apps/cockpit/test/locale-usage.test.ts` (`every key is actually rendered somewhere`) — `git grep progressFeedReconnecting HEAD -- apps/cockpit/client` returns only `client/lib/cockpit-copy.ts`, the catalog the guard excludes. The eleven `progress*` keys were already unreferenced at HEAD; the scan directory (`apps/cockpit/client`) is unchanged by the migration.
- `pnpm -r typecheck` stops earlier at `apps/arsy`: `test/compose-contract.test.ts:143` `TS18048: 'fallback' is possibly 'undefined'` under `tsconfig.base.json`'s `noUncheckedIndexedAccess`. No arsy file belongs to this change; the six UI-facing packages (`moonui`, `dock`, `orbit`, `cockpit`, `empire-web`, `headquarters`) were therefore typechecked individually and each is clean.
- `pnpm exec eslint .` — 27 errors, all in untracked local scratch: `.tmp/**`, `.vercel-tmp/vercel-install.cjs`, `apps/skylink/zz-diag.mjs`. Repository source reports 0 errors; the earlier `@moonwitness/shared-ui-only` hit on `apps/skylink/client/App.tsx` was the ESLint config disagreeing with the gate about composition roots and is fixed in the second pass.

## Limitations

- The migration changes markup, so DOM-geometry was re-asserted through the existing source-level dock tests (`responsive-accessibility`, `a11y-focus`), the 390/768/1440/1920 matrix recorded in the tenth pass, and the 390/1920 re-check in the eleventh pass after the last CSS change.
- No screenshot harness exists (ADR-0009 §2.6); the restyle to the MoonUI look is verified by class/token assertions and the one browser capture.
- 35 app-local files remain in the ledger. Each names `M19-36` as its removal task; the ceiling may only decrease. The dock stylesheet entry holds 10 selector exemptions after `.dk-paper-stat-row` was deleted; Empire's entry lost the selectors whose rules moved into `moon.css`.
- Phase 3 items 1 and 2 are complete (site chrome, the information-page shell and all four Story Universe bodies are MoonUI's, with artwork and copy injected). Item 3 (HQ widgets) is done. Item 4 remains, and the ledger is its exact list: Dock's 19 files (18 components plus its stylesheet), HQ's five client helpers and widgets, Cockpit's TopBar/MediaView/ProgressView, Orbit's inspector/workspace/viewport, ECHOLOG's upload panel (its object list is already a markup-free container), `apps/isp-console`'s Dashboard and stylesheet, and Empire's stylesheet — the last one is a `stylesheet` entry, not a component, because every Empire view has moved.
- The rule blocks moved into `moon.css` keep their original `su-*`/`orbit-*`/`cockpit-*` class spellings. Renaming them to the `.m-*` convention is open; ownership is already correct and C7 fails any new app-styled MoonUI class either way.
