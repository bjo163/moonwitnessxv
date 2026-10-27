# M19-24 — HQ id/en visible UI regression and E2E

**Task:** M19-24 (P1, LEAF)  
**Baseline:** `47441a08c8e60bafd840c4a43c0670d081042a92` (`dev`, with M19-23 complete)  
**Verified result SHA:** `31a24ec0eb9f9a0fac8ab2b6bdb28ed7fae2af50`  
**Integrator:** `/root`; implementation was reviewed against the task packet and test evidence.

## Delivered scope

- Added rendered component regression coverage for Indonesian and English login, denied-access, empty, error, and model-field views, including deterministic English fallback for an unsupported locale.
- Added a browser-driven HQ flow using only synthetic Hub data and credentials. It exercises locale selection and route/query preservation, localized login and errors, admin and viewer behavior, empty models, visible model fields, expired sessions, and anonymous redirects.
- Registered the focused locale suite and browser flow in the repository verification script. Added a CI setup step to install the Playwright Chromium browser required by that flow.
- The browser fixture starts local synthetic services on loopback and uses an environment allowlist; no production Hub, credentials, or user data are involved.

## Changed implementation paths

- `apps/headquarters/test/hq-locale-regression.test.ts`
- `apps/headquarters/test/hq-locale-e2e.spec.mjs`
- `package.json`
- `.github/workflows/ci.yml` (CI Chromium setup, added after the first CI run exposed the missing browser executable)

## Evidence

- Focused HQ locale regression and related session/authz tests: **47/47 passed** in a clean isolated checkout.
- HQ browser flow: **1/1 passed** locally in a clean isolated checkout, and passed in the exact-SHA CI run.
- `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- ESLint on the two new test files — passed.
- GitHub Actions run [40550064515](https://github.com/bjo163/moonwitnessxv/actions/runs/40550064515) at exact head `31a24ec` — passed dependency audit, secret scan, Chromium installation, full `pnpm verify` (build, UI check, lint, SDK check, tests and web build), then promoted the same SHA to `main`.
- The focused browser test output in that run was `HQ browser flow preserves id/en locale, session boundaries, denial, and model UI`; it passed in 10.8 seconds. The focused 47-test locale/session group reported 47 passed and 0 failed.
- Remote `dev` and `main` both resolve to `31a24ec0eb9f9a0fac8ab2b6bdb28ed7fae2af50`.

## Security, limits and rollback

The test credentials and records are synthetic. Viewer denial is checked before protected model data is fetched; expired/anonymous sessions return to localized login. This is a local browser regression proof, not a production deployment or external Dock integration test. Existing unrelated dirty HQ/Cockpit/Dock/UI files in the shared working tree were not included.

Rollback the M19-24 test and script registration only after removing or replacing their CI invocation. Keep the Chromium setup while any Playwright browser tests remain in `pnpm verify`; it is required runtime setup for those tests.

**Next:** continue with the highest-priority unchecked leaf whose dependencies and source/rights gates are verified. M04-05 remains externally blocked until ECHOLOG runs on a separate backup host and off-host backup, retention, and restore are exercised.
