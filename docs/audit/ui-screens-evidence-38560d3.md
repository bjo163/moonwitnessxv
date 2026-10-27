# UI-XV screens — execution evidence (screens 01, 05, 06)

**Scope:** the three screens that have an owner, a route and real data — Lighthouse/Dock (`/`), Corpus Reader (`/reader`), UNILEX (`/terms`).
**Rules:** [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) · **Blockers:** [register](ui-blocked-screens-8737fe4.md) · **Baseline audit:** [ui-baseline-8737fe4](ui-baseline-8737fe4.md)

## Commits

| SHA | Commit | Files |
|---|---|---|
| `4faa176` | `docs(ui): adopt the reference design rules (ADR-0009)` | ADR, MASTER_DESIGN, COMPONENTS, APPS, mockup README, 3 M19 packets, blockers register, todo-ui, CHANGELOG (12 files) |
| `6968777` | `feat(dock): add the four-space entry primitives` | `spaces.tsx`, `states.tsx`, `space-grid.test.mjs`, `globals.css`, `landing-copy.ts` (5 files) |
| `97eedf7` | `feat(dock): ship the Lighthouse space entry (screen 01)` | `page.tsx`, `shell.tsx`, `home-spaces.test.mjs`, `home-offline.test.mjs` (4 files) |
| `5ece78d` | `feat(dock): show reader provenance and refuse withheld text (screen 05)` | `reader.tsx`, `reader/page.tsx`, `globals.css`, `reader-rights.test.mjs` (4 files) |
| `38560d3` | `feat(dock): add the keyboard-reachable lexicon index (screen 06)` | `terms.tsx`, `terms/page.tsx`, `unilex-list.test.mjs` (3 files) |

## Gate results (run, not assumed)

| Gate | Command | Result |
|---|---|---|
| Dock behaviour | `pnpm --filter @moonwitness/dock test` | **71 tests, 71 pass, 0 fail** (baseline was 53) |
| Types | `pnpm --filter @moonwitness/dock typecheck` | exit 0 |
| Build | `pnpm --filter @moonwitness/dock build` | Next build green, all 20 routes compiled |
| Design system | `pnpm ui:check` | 100 files, **0 violations** |
| Lint | `pnpm exec eslint apps/dock` | 0 errors (3 pre-existing warnings) |
| Docs links | relative-link sweep over the 12 touched docs | all resolve |

New tests: `space-grid` (5), `home-spaces` (4), `reader-rights` (6), `unilex-list` (4) = 19 new assertions groups; suite grew 53 → 71.

## Geometry (live app on :3001, `/en` and `/id`)

Measured in same-origin iframes of exact width; the IDE browser viewport cannot be resized and pixel screenshots are unavailable in this environment.

| Width | Columns | Cards | Cards outside viewport | `pageOverflow` | Status words (`/en`) | Status words (`/id`) |
|---|---|---|---|---|---|---|
| 390 | 1 | 4 | 0 | 0 | REAL, REAL, DEMO, REAL | NYATA, NYATA, DEMO, NYATA |
| 768 | 2 | 4 | 0 | 0 | REAL, REAL, DEMO, REAL | NYATA, NYATA, DEMO, NYATA |
| 1440 | 4 | 4 | 0 | 0 | REAL, REAL, DEMO, REAL | NYATA, NYATA, DEMO, NYATA |
| 1920 | 4 | 4 | 0 | 0 | REAL, REAL, DEMO, REAL | NYATA, NYATA, DEMO, NYATA |

Also verified at every width: no `input` inside `.dk-header` (no fake global search), grid width 1332 px at ≥1440 and centred, 725 px / 347 px at 768 / 390.

## What each screen actually gained

**01 — Lighthouse / Dock.** Home renders the four-space entry under the hero on both branches (live and hub-offline), with a mono eyebrow, a two-tone display motto and a second CTA to `/reader`. `CREATE` is `DEMO` and names M33. Mockup chrome deliberately not shipped: the `01/12` index counter, a decorative search field, the footer strip, and the 13-item rail.

**05 — Corpus Reader.** Provenance strip (edition code · rights state · 12-char provenance SHA) above a native disclosure holding the full licence/retrieval record. Real defect fixed: a `rights_blocked` result could still paint Arabic text or a licensed translation if the projection returned it — the guard is now on `result.state`, not on null data.

**06 — UNILEX.** Collapsible table index (stable id, Indonesian label, lane, editorial status, sense/source/relation counts) above the term cards, every row linking to `/terms/[stableId]`; native `details/summary` over MoonUI `DataTable`, so keyboard and screen-reader behaviour is platform behaviour.

## Known limitations (recorded, not hidden)

1. **Pixel screenshots unavailable** — the IDE browser view is hidden; evidence is DOM geometry. A Playwright harness would touch the lockfile and the Docker contract tests, so it needs owner approval.
2. **Geometry measured on the hub-offline branch** — the local hub was not running, so the home rendered `OfflineLanding` + `SpaceGrid`. The live branch renders the same `SpaceGrid` (asserted twice in `home-spaces.test.mjs`); the hero block above it differs and was verified by typecheck/build, not by measurement.
3. **Reader copy is still English only.** The page has no locale plumbing at all; localizing it is M19-31/M19-09 work. The new provenance strings deliberately match the page's existing language rather than mixing locales.
4. **Screen 02 and the eight owner-blocked screens stay blocked** — see the register; nothing was built with sample data.
5. **`PanelState` is available but not yet adopted by existing pages**; adopting it across Dock is a separate refactor.
