# M19-03 — Dock header keyboard evidence

**Scope:** Keyboard and focus behavior for the four primary Dock destinations, desktop INDEX disclosure, and mobile navigation drawer.

## Source and method

- Source SHA: `449db11abebce13c1e55b786e2b1d3e785a81fa5` (`dev`).
- Command: `UI_SCREENS_DIR=docs/audit/M19-03-keyboard-evidence UI_PORT=3120 UI_SCREENSHOT=viewport pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs --grep 'keyboard pass'`
- Result: 1 browser test passed; the harness started Dock on port 3120 and released it after the run.
- Hub condition: offline-forced. The screenshot and machine-readable interaction report are in [M19-03-keyboard-evidence](M19-03-keyboard-evidence/geometry.json).

## Observed behavior

- Mobile drawer opens by Enter and Space, traps focus, closes with Escape, and restores focus to the menu trigger.
- On the home route, no route link is marked active because the brand represents home; on `/en/reader`, READ is the only active route in both desktop navigation and the mobile drawer.
- Desktop READ is first. Enter opens INDEX, moves focus to the first grouped route (`/en/figures`), Escape closes it and restores focus.
- In the collapsed mobile drawer, Tab and Shift+Tab skip the hidden INDEX links. Enter opens the group and moves focus to the first link; Escape closes it and returns focus to the trigger.
- The drawer screenshot is linked from the report at [drawer-en-390-open.png](M19-03-keyboard-evidence/drawer-en-390-open.png).

## Limitation

This keyboard run captured no page errors, but it exercised the offline Dock branch only; no live-Hub behavior is claimed. The separate geometry run is documented in [M19-03-header-geometry.md](M19-03-header-geometry.md) and did record a hydration warning at EN/768.
