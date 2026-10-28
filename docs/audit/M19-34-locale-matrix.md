# M19-34 — Cross-app Indonesian/English locale matrix

**Status: partial; M19-34 remains open.** This audit records a clean-checkout run of the GUI locale/accessibility suites and ARSY denial evidence. It does not certify a live Hub or production deployment.

## Baseline and scope

- Clean checkout baseline: `dev` SHA `c46552ae0ec8f809b64b7d86539d514471e084d0`.
- Test/evidence integration commit: `8720423e84cf219fa7eaea4e746b31c6936592df`.
- The locale suites, including the new ORBIT browser test, were rerun from a clean checkout at that exact integration SHA. The only differences from the visual run baseline are QA tests and audit artifacts; no app source changed between the two SHAs.
- Runtime: Node `v24.22.1`, pnpm `10.33.4`.
- GUI apps covered: Dock, Headquarters, Cockpit, and ORBIT. The app inventory classifies ARSY, AI Gateway, SKYLINK, and ECHOLOG as services and Sentinel as a worker, not GUI apps.
- Browser data was synthetic or forced offline. No production credential, live Hub, or source content was used.
- Test-only corrections: Dock's catalog boundary test now explicitly recognizes `DENPA` as an intentionally invariant proper label; HQ's browser assertion expects the locale-preserving Dock URL `/id`. ORBIT now has a real browser locale test using simulated operations and an allow-listed child environment.

## Results

| Surface | Command | Observed result |
|---|---|---|
| Cockpit browser | `pnpm --filter @moonwitness/cockpit exec node --test test/m19-34-locale-browser.test.mjs` | 2 passed, 0 failed; EN/ID visible copy, keyboard locale operation, reload persistence, `html lang`, and unsupported-locale fallback. |
| Cockpit catalog/type | `pnpm --filter @moonwitness/cockpit exec tsx --test test/locale.test.ts test/locale-usage.test.ts`; `pnpm --filter @moonwitness/cockpit typecheck` | 6 passed, 0 failed; typecheck passed. |
| Headquarters locale/auth | `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts ../../apps/headquarters/test/hq-authz-guard.test.ts ../../apps/headquarters/test/locale-preference.test.ts ../../apps/headquarters/test/hq-locale-regression.test.ts ../../apps/headquarters/test/editor-actions.test.ts`; `pnpm --filter @moonwitness/headquarters typecheck` | 46 passed, 0 failed; typecheck passed. |
| Headquarters browser | `pnpm --filter @moonwitness/arsy exec node --test ../../apps/headquarters/test/hq-locale-e2e.spec.mjs` | 1 passed, 0 failed. Covers locale switching, retained route/query, synthetic auth success/denial/expiry, and localized model form. The test confirms the Dock link carries `/id`. |
| Dock locale/accessibility | `pnpm --filter @moonwitness/dock exec node --test test/locale-routes.test.mjs test/locale-href-contract.test.mjs test/locale-boundary-coverage.test.mjs test/states-copy-parity.test.mjs test/landing-copy.test.mjs test/landing-copy-required-keys.test.mjs test/landing-copy-english.test.mjs test/responsive-accessibility.test.mjs`; `pnpm --filter @moonwitness/dock typecheck` | 54 passed, 0 failed after the proper-name exception correction; typecheck passed. |
| Dock browser matrix | `$env:UI_SCREENS_DIR='docs/audit/M19-34-clean-dock-matrix'; $env:UI_PORT='3136'; $env:UI_SCREENSHOT='viewport'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs` | 43 passed, 0 failed, 1 skipped. Geometry report has 32 locale/viewport records and 8 reduced-motion records; 0 assertion failures, 0 horizontal overflow, and 0 visible elements outside the viewport. Keyboard checks cover drawer focus, Escape return, Enter/Space activation and active READ state. The Hub was forced offline. |
| ORBIT browser | `pnpm --filter @moonwitness/orbit exec node --test test/orbit-locale-browser.test.mjs` | 1 passed, 0 failed. Visible EN/ID copy, document language, active locale, and unsupported `fr` fallback are checked in Chromium using simulated operations. |
| ORBIT suite/type | `pnpm --filter @moonwitness/orbit test`; `pnpm --filter @moonwitness/orbit typecheck` | 89 passed, 0 failed, 0 skipped; typecheck passed. |
| ARSY/API denial | `pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts` | 14 passed, 0 failed, 1 skipped. The skipped case explicitly says the global rule “guessing a public link must be denied for every unapproved projection” is not satisfied. |
| Test lint and diff | `pnpm exec eslint apps/dock/test/locale-boundary-coverage.test.mjs apps/headquarters/test/hq-locale-e2e.spec.mjs apps/orbit/test/orbit-locale-browser.test.mjs`; `git diff --check` | Both passed with no diagnostics. |

## Remaining evidence gaps

1. The Dock visual harness honestly skipped the term-detail matrix because forced-offline `/terms` exposed no stable term ID. A seeded/runtime fixture is needed to cover that route in both locales.
2. The Dock keyboard record in `geometry.json` contains one React hydration `pageerror`. The visible source `MtsTelemetryClock` initializes from the current time during render, which may explain the mismatch; that cause is an inference, not proven here. `@moonwitness/moonui` is shared and this task did not change it.
3. The ARSY denial matrix's skipped assertion documents an unapproved public-projection gap. This is tracked separately by M19-19 and is not represented as a green API gate.
4. No live Hub, PostgreSQL, CI, production deployment, or deployed URL was tested.

These gaps prevent a full M19-34 completion claim. The task checkbox must remain open until the term-detail case and hydration signal have a reviewed disposition and the API skip is handled within its owning rights/governance task.

## Artifacts and review

- Dock screenshots and machine-readable result: [`M19-34-clean-dock-matrix`](M19-34-clean-dock-matrix/geometry.json) (41 PNGs plus JSON; 32 base matrix and 8 reduced-motion records, with one term-detail skip).
- Independent review confirmed the test corrections and ORBIT case, and recommended leaving M19-34 open for the recorded gaps.
- Rollback is limited to the three QA test changes and this audit/artifact folder; no product application behavior or data changed.
