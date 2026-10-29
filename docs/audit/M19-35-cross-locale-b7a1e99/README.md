# M19-35 — bilingual visual and navigation regression

- **Verified application SHA:** `b7a1e9970738fad7e4f6b7e91869724b3b35802e`
- **Branch state at verification:** `origin/dev` and `origin/main` both pointed to this SHA.
- **CI:** run `40836695194` passed; its promotion job advanced `main` to the same SHA.
- **Owner:** platform QA (parallel agent); **integrator review:** primary agent.
- **Runtime scope:** Dock with Hub explicitly offline; no live Hub, private source content, or production deployment was used.

## Evidence

- `visual.spec.mjs`: 44 passed, 1 documented skip. The matrix covers EN/ID at 390, 768, 1440, and 1920 px plus 8 reduced-motion captures. `geometry.json` records 32 regular matrix records, 8 reduced-motion records, 0 failures, 0 px maximum horizontal overflow, and 0 interactive or other sampled elements outside the viewport.
- The one skip is term detail: the offline UNILEX index exposes no term ID to navigate to. It is recorded as skipped, not counted as a pass.
- `m19-35-long-label.spec.mjs`: 8/8 passed using synthetic English and Indonesian long labels. It checks accessible names, locale-prefixed links, clipping/overflow, drawer-link hidden/tab-exclusion behavior, Escape close, and focus restoration at the same four widths.
- `qa-matrix.spec.mjs` focused reduced-motion and unknown-station checks: 16/16 passed after making the probes wait for settled route UI and inspect the actual motion contract. A synthetic `.m-live-dot::after` probe verifies its animation is disabled without claiming an offline page rendered a live dot.
- Drawer keyboard contract: 1/1 passed.
- ESLint on both Playwright specs and `git diff --check` passed.

## Reproduction

Run in a clean checkout at the verified application SHA. Keep screenshots outside the repository with `UI_SCREENS_DIR`.

```powershell
$env:UI_PORT='3193'; $env:UI_SCREENS_DIR='C:\Users\bjo16\AppData\Local\Temp\mw-m19-35-b7a1-screens'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs
$env:UI_PORT='3200'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/qa-matrix.spec.mjs --grep 'reduced motion leaves|unknown station id'
$env:UI_PORT='3201'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-35-long-label.spec.mjs
$env:UI_PORT='3197'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/qa-matrix.spec.mjs --grep 'drawer keyboard contract'
pnpm exec eslint scripts/ui/qa-matrix.spec.mjs scripts/ui/m19-35-long-label.spec.mjs
git diff --check
```

The 41 PNG screenshots plus geometry ledger (42 files total) are retained in the local external evidence directory `C:\Users\bjo16\AppData\Local\Temp\mw-m19-35-b7a1-screens`; they are not committed because they total about 19.7 MB. The compact geometry ledger is stored beside this report.

No human accessibility certification, live data behavior, term-detail behavior, or deployment status is claimed.
