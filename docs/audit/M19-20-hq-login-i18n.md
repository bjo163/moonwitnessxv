# M19-20 — Headquarters login and recoverable auth errors

- **Task:** M19-20, localize HQ login and recoverable authentication errors.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `dc82e7920d3dc61e9ae4a41b137f05d2516f9dab`.
- **Prerequisite:** M05-10 is checked in TODO; the shared canonical `id`/`en` locale resolver and catalog contract are used.
- **Worker:** `/root/m19_20_hq_login_i18n`.
- **Changed paths:** `apps/headquarters/src/lib/login-copy.ts`, `apps/headquarters/src/app/login/page.tsx`, `apps/headquarters/src/layouts/auth.tsx`, `apps/headquarters/src/app/api/session/route.ts`, `apps/headquarters/src/app/(admin)/layout.tsx`, `apps/headquarters/test/login-locale.test.ts`, root `package.json`, this report.
- **Result SHA/reviewer:** `118dcb576d1cc3b791f6a7a85b208b7f4a5f83cc`; reviewed by root integrator.

## Behavior

HQ login selects the validated `mw_locale` preference first, then the shared `Accept-Language` negotiation and English default. The login surface has a typed, parity-checked shared-contract catalog for both locales and marks the localized area with its language.

Login form validation redirects with stable `required`; a Hub 401 becomes the non-enumerating `invalid` message; expired Hub-confirmed sessions return to login with `expired`; other upstream/runtime failures become `unavailable`. The UI renders only known codes. Upstream exception text and arbitrary query strings are never reflected into redirects or page copy. Login, password, cookie, and token behavior is unchanged.

## Evidence

- `pnpm --filter @moonwitness/radio exec tsx --test ../../apps/headquarters/test/session-auth.test.ts ../../apps/headquarters/test/login-locale.test.ts` — exit 0; 8 passed, 0 failed. Tests cover both-locale catalog parity, required labels, expired-session wording, known-code selection, rejection of raw error/query values, and mapping of Hub 401, 503, and runtime errors to stable codes.
- `pnpm exec eslint apps/headquarters/src/lib/login-copy.ts apps/headquarters/src/app/login/page.tsx apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/app/api/session/route.ts 'apps/headquarters/src/app/(admin)/layout.tsx' apps/headquarters/test/login-locale.test.ts` — exit 0.
- `pnpm --filter @moonwitness/headquarters typecheck` — exit 0.
- `pnpm --filter @moonwitness/headquarters build` — exit 0; Next.js 16.4.3 compiled and generated the login route as dynamic. It emitted the existing middleware-to-proxy deprecation notice.
- `git diff --check` — exit 0.

Root `package.json` registers the new focused test alongside the existing HQ session test so the regression runs under `pnpm test` and CI. A full root test run after this exact integrated change remains for the integrator. The existing “Forgot password?” link still returns to the login page; this task localizes its label but does not implement a password-reset flow.

## Privacy, limits, rollback

The login flow continues to send credentials only to the existing same-origin session route and the existing Hub login endpoint. No credentials or raw upstream error messages are included in query strings or localized text. Rollback reverts the listed HQ changes and removes the root test registration. No browser visual review or live Hub/browser session was claimed. The outer HQ document still declares `lang="en"`; the localized login subtree declares its own `lang` so assistive technology receives the login language. Broader HQ document/shell localization remains in M19-21 and later tasks.
