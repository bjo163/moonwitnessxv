# M19-07 — J01/J03 browser acceptance (MET)

**Task:** M19-07 — "Run J01/J03 browser acceptance; J05 only when Story is in release scope".
**Acceptance:** "Selected-scope flows pass with accessibility; optional Story cannot block Reader".
**Result: MET at this baseline.** A real Chromium run against the ephemeral in-memory Hub plus the Dock dev server passed 39/39 clauses in both locales and at six viewport widths, with the reader passage rendered at full width and the skip link as the first keyboard focus stop. This is a browser-acceptance record, not an accessibility certification or a deployment.

**Run baseline:** `ca80eeabacc11f42a8a8578daa946bafb7dafc8a` (`dev`) plus the reader/skip-link fix committed at `818a92d86a2c0ff97fad833504b361fba3f2fd34`. The breakpoint sweep, visibility wait and this record are a later commit whose SHA is cited in `TODO.md`.

**Supersedes:** [M19-07-j01-j03-browser-acceptance-attempt.md](M19-07-j01-j03-browser-acceptance-attempt.md) (NOT MET at `8cd98ab183c528110fed82e56f7b045291f5db68`).

## Defects fixed before this run

The earlier attempt's measured cause was a nested CSS grid collapse, not a hydration or disclosure problem. Two fixes were made in the Dock shell:

1. **Reader passage collapse** — `apps/dock/src/app/globals.css`:
   - `.dk-reader-grid` declared `minmax(0, 1.7fr) minmax(280px, 1fr)` while it holds two panes; inside the reader's 286 px main column the 280 px export minimum consumed the only free track and the passage resolved to 0 px. It now defaults to one content column (`minmax(0, 1fr)`) and only splits into passage + export panes inside a container query at `@container (min-width: 640px)`, where both panes fit.
   - `.dk-reader-main` gained `min-width: 0` and `container-type: inline-size` so the query measures the reading column, not the viewport.
   - `.dk-reader-layout` rails are bounded at `minmax(0, 200px)` / `minmax(0, 230px)` instead of fixed minima, so the passage column owns the width left inside the accepted 72 rem reader measure. The static contract in `apps/dock/test/reader-static-structure.test.mjs` was updated with a regression guard for the single-column default.
2. **No skip link, no focusable `main`** — `apps/dock/src/layouts/site.tsx` now renders `<a class="dk-skip" href="#main">` as the first element of `.dk-shell` and `<main class="dk-main" id="main" tabIndex={-1}>`; the label is locale-bound through `landing-copy.ts` (`Skip to content` / `Lompat ke konten`). Styling is `.dk-skip` in `globals.css` (off-screen until focused, `:focus`/`:focus-visible` outline). This is the M19-03 §4.4 target: skip link first, `main id="main" tabIndex={-1}`.

Scope source: [MASTER_VISION_NARRATIVE_XV.md:1067](../../vision/MASTER_VISION_NARRATIVE_XV.md) (J01), `:1069` (J03), `:1071` (J05); the J05 exclusion follows the TODO row because Story is not in release scope. No packet exists at `docs/tasks/M19/M19-07.md`.

## How it was run

The harness is committed as `scripts/ui/m19-07-acceptance.mjs` and stays out of `pnpm test` (it boots the real hub app in-memory and a Next dev server, so it is an on-demand evidence run rather than a CI lane). It:

- spawns `scripts/ui/ephemeral-hub.mjs` through the `apps/arsy` tsx CLI with `MOONQL_AUTH_ADMIN_PASSWORD` set to a throwaway value, in-memory engine, cron off, seeded, on a free loopback port;
- spawns the Dock dev server on another free loopback port with `RADIO_API_URL` pointing at that hub;
- drives Chromium at 1440×900, asserting the J01 search/source/translation/citation clauses in `en` and `id`, the J03 comparison journey and the skip-link focus order, then sweeps 390, 640, 768, 900, 1280 and 1440 px — both sides of the 640 px container query and the 900 px rail breakpoint — for overflow and passage/Arabic width;
- waits for `article.dk-reader-passage` to have a visible box before measuring: the route is `force-dynamic` and streams its panel, so a measurement taken at the `load` event can sample a 0×0 box that says nothing about layout. An earlier harness revision did exactly that and reported intermittent 0×0 passages; with the wait, two consecutive runs passed 39/39. This was a sampling race in the harness, not a regression in the page;
- stops both processes and the browser in `finally`.

Command (repository root), exit code **0**:

```
node scripts/ui/m19-07-acceptance.mjs
```

## Verbatim output

```text
PASS  J01 en: /en/reader returns 200 — status 200
PASS  en: one main#main.dk-main[data-experience=reader] — {"mains":1,"experience":"reader"}
PASS  en: header and footer landmarks render — header=1 footer=1
PASS  en: html lang matches the route — lang=en
PASS  en: page heading is present — Corpus Reader
PASS  en: J01 search form is visible, GETs /en/reader — method=get action=/en/reader
PASS  en: J01 citation field is prefilled with QS 2:82 — QS 2:82
PASS  en: J01 Arabic source exists once — count=1
PASS  en: J01 Arabic source is visible with real width — box={"width":364,"height":240} passage={"width":406,"height":800}
PASS  en: J01 licensed translation renders — Adapun orang-orang yang beriman dan beramal saleh, mereka it
PASS  en: citation panel renders beside the passage — box={"width":406,"height":504}
PASS  J03: comparative route opens from the Reader — Comparative Reader
PASS  J03: comparison body is withheld, no fabricated names — The research ledger is withheld until an approved D08 public projection is avail
PASS  J03: the withheld comparison cannot block the Reader — before=364 after=364
PASS  a11y: the skip link is the first keyboard focus stop — {"tag":"a","className":"dk-skip","text":"Skip to content","href":"#main"}
PASS  a11y: the skip link moves focus to main#main — {"hash":"#main","activeId":"main","focusable":"-1"}
PASS  J01 id: /id/reader returns 200 — status 200
PASS  id: one main#main.dk-main[data-experience=reader] — {"mains":1,"experience":"reader"}
PASS  id: header and footer landmarks render — header=1 footer=1
PASS  id: html lang matches the route — lang=id
PASS  id: page heading is present — Corpus Reader
PASS  id: J01 search form is visible, GETs /id/reader — method=get action=/id/reader
PASS  id: J01 citation field is prefilled with QS 2:82 — QS 2:82
PASS  id: J01 Arabic source exists once — count=1
PASS  id: J01 Arabic source is visible with real width — box={"width":364,"height":240} passage={"width":406,"height":800}
PASS  id: J01 licensed translation renders — Adapun orang-orang yang beriman dan beramal saleh, mereka it
PASS  id: citation panel renders beside the passage — box={"width":406,"height":504}
PASS  390px: no horizontal overflow — scrollWidth=390 innerWidth=390
PASS  390px: the passage and Arabic source keep real width — passage={"width":326,"height":760} arabic={"width":292,"height":168}
PASS  640px: no horizontal overflow — scrollWidth=640 innerWidth=640
PASS  640px: the passage and Arabic source keep real width — passage={"width":576,"height":565} arabic={"width":542,"height":120}
PASS  768px: no horizontal overflow — scrollWidth=768 innerWidth=768
PASS  768px: the passage and Arabic source keep real width — passage={"width":704,"height":576} arabic={"width":670,"height":128}
PASS  900px: no horizontal overflow — scrollWidth=900 innerWidth=900
PASS  900px: the passage and Arabic source keep real width — passage={"width":836,"height":599} arabic={"width":802,"height":146}
PASS  1280px: no horizontal overflow — scrollWidth=1280 innerWidth=1280
PASS  1280px: the passage and Arabic source keep real width — passage={"width":406,"height":800} arabic={"width":364,"height":240}
PASS  1440px: no horizontal overflow — scrollWidth=1440 innerWidth=1440
PASS  1440px: the passage and Arabic source keep real width — passage={"width":406,"height":800} arabic={"width":364,"height":240}
J05 / Story: NOT RUN — Story is not in release scope (matches the M19-07 row).

39/39 clauses PASS
```

Before the fix the same diagnostic measured `p.dk-reader-arabic box=0x3984` inside `ARTICLE.dk-reader-passage box=42x8773`; the run above measures the same paragraph at `364×240` inside a `406×800` article, so the collapse is gone rather than masked.

## Static and package checks (same working tree)

```
apps/dock: pnpm test         → tests 317, pass 317, fail 0
apps/dock: pnpm typecheck    → tsc --noEmit, no diagnostics
```

## What this proves and what it does not

- Proves: at 1440 px the selected-scope Reader journey (search entry, seeded rights-cleared Arabic source, licensed translation, reproducible citation) is usable and visible in `en` and `id`; the comparative route resolves and withholds its body without fabricating names; the skip link is the first focus stop and moves focus to `main#main`; at 390, 640, 768, 900, 1280 and 1440 px the reader neither overflows nor loses the passage/Arabic width; Story is not required and was not exercised.
- Does not prove: any other journey, a deployment, the real Hub, production data, a screen-reader matrix, or a WCAG conformance claim. The run used loopback ports, an in-memory seeded engine and throwaway credentials only.
- J05 / Story remains NOT RUN by design; the TODO row keeps that conditional.

## Rights, privacy and limits

- Only the seeded, rights-cleared QS 2:82 sample already used by the repository's own tests was rendered. The Indonesian translation line echoed by the harness is the fixture's own cleared public-domain text, not additional scripture content.
- No screenshots, private witness material, environment values or secrets were captured.
- Generated churn from the dev server (`apps/dock/next-env.d.ts`) was reverted after the run; no listener was left behind on any port.
