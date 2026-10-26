# M19-12 — Dock language switcher and route preservation

- **Task:** M19-12, accessible Dock language switcher and stable route links.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisite:** M19-09 is checked in TODO at this task baseline; ADR-0005 accepts `id`/`en` and the `mw_locale` preference cookie.
- **Task packet:** no `docs/tasks/M19/M19-12.md` exists. Scope follows the M19-12 TODO acceptance and ADR-0005.
- **Worker:** `/root/m19_12_language_switcher`.
- **Changed paths:** `apps/dock/src/ui/components/locale-switcher.tsx`, `apps/dock/src/ui/components/shell.tsx`, `apps/dock/src/lib/locale-context.mjs`, `apps/dock/src/app/globals.css`, `apps/dock/test/locale-routes.test.mjs`, this report.
- **Result SHA:** pending integrator commit/review. Worker did not change TODO or commit/push.

## Behavior and boundaries

The Dock header now contains native links for Bahasa Indonesia and English with language-specific accessible names, the current selection announced by `aria-current`, and a visible keyboard focus outline using existing MoonUI tokens. The selector applies at route roots and existing pages.

Selecting a language keeps the current localized route, query, and fragment. Legacy unprefixed routes receive the selected locale prefix. Unsupported explicit locale paths fall back to the selected locale root rather than carrying an unsupported path into a route that will fail again. The middleware overwrites untrusted internal path/search/locale headers with request metadata, and the server layout supplies that trusted metadata as initial props, so rendered language links preserve the path/query even before hydration. The click handler retains the live fragment, which is not available to the server. The link changes the URL directly to `/id` or `/en`, so it does not return to `/` and renegotiate from the browser language. The selection is also persisted in the existing same-site `mw_locale` cookie for one year; it is `Secure` on HTTPS and `SameSite=Lax`.

No new route, API, auth behavior, shared package, or locale source was added. The existing middleware remains the authority for route validation and root preference resolution.

## Verification

- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/locale-routes.test.mjs` — exit 0; 11 passed, 0 failed. Includes trusted server path/search metadata and client-header overwrite coverage.
- `pnpm --filter @moonwitness/dock test` — failed at the concurrent M19-11 test `localized Dock landing stays useful when the Hub is unreachable`; process remained running and was interrupted. The focused M19-12 suite above passes.
- `pnpm exec eslint apps/dock/src/layouts/site.tsx apps/dock/src/middleware.ts apps/dock/src/ui/components/shell.tsx apps/dock/src/ui/components/locale-switcher.tsx apps/dock/src/lib/locale-context.mjs apps/dock/test/locale-routes.test.mjs` — exit 0.
- `pnpm --filter @moonwitness/dock typecheck` — exit 0.
- `pnpm --filter @moonwitness/dock build` — exit 0; Next.js compiled, typechecked, and generated pages. The shared layout's request headers make app routes dynamic (`ƒ`); the manifest remains static (`○`). It emitted the existing middleware-to-proxy deprecation notice.

## Limits and rollback

The tests exercise route/cookie helpers and Next middleware, not a real browser keyboard session or screen-reader announcement. Keyboard accessibility is provided by native anchors; visual focus styling and ARIA attributes were reviewed in the component source. End-to-end locale route acceptance awaits the separate M19-09 middleware redirect-loop fix; this follow-up did not change redirect/rewrite semantics. No visual screenshot or deployment is claimed. Rollback removes the selector component and its header/CSS/helper/test wiring; the existing root route preference behavior remains available.

Next eligible dependent work remains M19-13/M19-14/M19-17 as their other dependencies allow; the integrator owns TODO status and exact result-SHA recording.
