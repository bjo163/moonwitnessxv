# M19-03 — Dock header and home geometry evidence

**Scope:** Exact-SHA browser geometry for the M19-03 four-space Dock home and revised header IA. This is a scoped Dock result, not the full M19 milestone or a live-Hub verification.

## Source and method

- Source SHA: `9afe6ecb1dff94b0cdc36338ec60d23c25d13e09` (`dev`). The Dock CSS was restored to the committed tree for the browser run; the unrelated shared working-tree edits were preserved afterward.
- Command: `UI_SCREENS_DIR=docs/audit/M19-03-header-geometry UI_PORT=3119 UI_SCREENSHOT=viewport pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs --grep 'home ·'`
- Result: 10 passed (8 home geometry cases and 2 reduced-motion cases), 0 skipped, exit 0. The harness started its own Dock dev server at port 3119 and released it on completion.
- Hub condition: `offline-forced`; these measurements do not cover the live-data branch.
- Machine-readable measurements and viewport screenshots: [geometry.json](M19-03-header-geometry/geometry.json).

## Geometry results

All eight locale/width combinations rendered four cards, reported `scrollWidth === clientWidth`, zero horizontal overflow, and zero interactive elements outside the viewport. The grid columns were 1/2/4/4 at 390/768/1440/1920 px for both `en` and `id`. No matrix case was skipped or reported a geometry failure.

The run also recorded one React hydration error at `en` 768 px, and several cases observed a loading fallback before the settled capture. The harness settled and the geometry assertions passed. The hydration error is a remaining browser-quality signal; this report does not attribute its cause or certify a clean hydration run. `MtsTelemetryClock` initializes from the current time during render, which is a plausible source, but that is an inference and remains unverified.

The screenshots are viewport captures and the matrix uses the honest offline Dock branch. Reduced-motion coverage in this scoped run is `en` at 390 and 1440 px only; the full M30-05 matrix remains open.

## Decision

This proves the M19-03 home geometry clause at the stated source SHA and offline condition. It does not close M19-03: the design's remaining keyboard/accessibility and broader visual-baseline evidence is tracked by M19-04 and M19-06, and M19-03 still needs integrator review of the combined evidence.
