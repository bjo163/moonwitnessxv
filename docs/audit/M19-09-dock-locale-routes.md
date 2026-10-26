# M19-09 — Dock locale routes

- **Task:** M19-09, implement `/id`, `/en`, `/`, and unsupported-locale handling.
- **Worker:** `/root/m19_09_dock_routes`.
- **Baseline/source SHA:** `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`.
- **Branch:** `codex/m05-08-locale-audit-387f784`.
- **Integrated result SHA:** `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`.
- **Claimed/actual paths:** `apps/dock/src/middleware.ts`, `apps/dock/test/locale-routes.test.mjs`, `apps/dock/package.json`, root `package.json` (adds Dock focused tests to the CI test path), this report.

## Route behavior

- `/` uses the shared resolver and returns a temporary redirect to `/id` or `/en`, preserving the query string. It reads the existing `mw_locale` preference cookie when present and otherwise negotiates the `Accept-Language` header, with `en` fallback. Invalid cookie/header values cannot select an unsupported locale.
- A valid `/id/*` or `/en/*` prefix rewrites internally to the existing unprefixed Dock route, keeping query parameters and browser URL. Other two-letter language and language-region prefixes fail with 404; prefixed API paths fail with 404 so HTTP contracts remain unprefixed.
- Existing unprefixed routes and APIs continue through unchanged. Root redirects vary on `Accept-Language`; when a locale cookie is present, redirect responses are `private, no-store` and vary on `Cookie` as well.
- Framing policy is calculated from the rewritten content path, so `/id/embed/*` retains the existing explicit embed-origin CSP. Unprefixed SSE/API, Next assets, and the web manifest path remain intact.

## Evidence

- `pnpm --filter @moonwitness/dock test` — exit 0; 5 tests passed, 0 failed. Coverage includes root negotiation, persisted preference, invalid preference fallback, query preservation, both canonical prefixes, unsupported locale rejection, prefixed API rejection, legacy route/API continuation, matcher asset exclusion, manifest rewrite, and localized embed CSP.
- `pnpm --filter @moonwitness/dock typecheck` — exit 0.
- `pnpm --filter @moonwitness/dock build` — exit 0; Next.js 16.4.3 compiled, typechecked, generated static pages, and listed the existing API/route set.
- `pnpm test` — exit 0 at the integrated tree; core 10/10, Dock 5/5, Radio 314 total with 305 passed, 0 failed, 9 optional PostgreSQL skips.
- `git diff --check` — exit 0.

## Safety, rollback, and limits

Locale selection only changes route choice. It does not change authorization, API identifiers, response envelopes, source text, or rights decisions. Invalid explicit locale paths fail closed. Rollback reverts the Dock middleware/test/script and root test-script wiring; there are no migrations or stored-data changes.

Independent read-only review found no blocking issues and recommended closure after recording the exact result SHA. Next build emitted Next's deprecation warning that the existing `middleware` convention will move to `proxy`; this task retains the existing middleware entry point, and the build succeeded. The test runner also emitted Node's module-typeless warning for direct TypeScript stripping; the repo's Node 24 runtime handled it, and the production Next build is clean apart from the framework deprecation notice. HTML language metadata and translated UI copy remain in their respective later Dock localization tasks.

The integrator fixed the prior lint error by adding the explicit `node:process` import. `pnpm verify` passed on the exact integrated source SHA above, and CI run [`40378453247`](https://github.com/bjo163/moonwitnessxv/actions/runs/40378453247) passed for the same SHA. The promote-to-main job was skipped on the pull-request branch; no deployment is claimed.

Next eligible Dock leaves after integration: M19-10, M19-11, and M19-12, subject to their other prerequisites.
