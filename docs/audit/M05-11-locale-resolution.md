# M05-11 — Shared locale resolution and malformed preference behavior

- **Task:** M05-11, add locale resolution and persistence negative tests.
- **Owner/worker:** platform/i18n; `/root/m05_11_resolver`.
- **Baseline SHA:** `e73e156bf4616131152ff865b3f6f67658a92d77`.
- **Result SHA:** `dae3c9042d721af4481a430316617b660d7952a1`.
- **Claimed/actual files:** `packages/core/src/locale-resolution.ts`, `packages/core/src/index.ts`, `packages/core/test/locale-resolution.test.mjs`, `packages/core/package.json`, this report.

## Behavior

The shared pure resolver follows ADR-0005 priority: supported URL locale, valid persisted user preference, valid existing account preference, highest-quality supported `Accept-Language`, then `en`. Region tags in the header map to supported primary languages. The parser honors quality weights, rejects malformed quality parameters, ignores unsupported ranges and wildcard-only input, skips `q=0`, and preserves header order on equal quality. It performs no location, network, or IP lookup.

An unsupported explicit URL locale returns a distinct `unsupported-url-locale` outcome. Callers can reject that route without silently redirecting/remapping it; this helper does not implement an app router. Invalid persisted/account values are ignored so a later valid source or `en` default can be used.

## Evidence

- `pnpm --filter @moonwitness/core test` — exit 0; package build succeeded; 7 tests passed, 0 failed. Tests cover each precedence level, region mapping, weights/ties, q=0, wildcard, invalid q/range, invalid stored preferences, safe default, and explicit unsupported URLs.
- `pnpm --filter @moonwitness/core typecheck` — exit 0.
- `pnpm exec eslint packages/core/src/locale-resolution.ts packages/core/src/index.ts` — exit 0.
- `git diff --check` — exit 0.

Independent review matched the resolver to ADR-0005 and requested an equal-quality header-order case. That tie case was added, and the final focused suite passed 7/7.

## Safety, rollback, and limits

The resolver consumes supplied values only and has no authority over authorization, API identity, source content, or machine contracts. Rollback removes this module, its root export/test, and restores the prior core test script. No app runtime has yet adopted the resolver; Dock/HQ route and persistence wiring remains in their application tasks. No independent reviewer or result commit SHA is available yet.
