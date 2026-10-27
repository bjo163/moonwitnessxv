# M05-14 — ARSY human messages and embedded UI locale evidence

## Evidence identity

- Task: M05-14, localize ARSY human messages and embedded UI while preserving machine identifiers.
- Branch / working baseline: `dev` / `de4282426d322da119316d81f3b5c82943e56998`.
- Latest `origin/main` checked before edits: `2a5805c178d3671ad875d05c7d35cecccb929ae1`.
- Prerequisites M05-09 and M28-05 were checked as closed in TODO.
- Result SHA: `947fdff2bfb1c11fe985a2d546a21fe7722cadd9`; this is the task source/test commit. Exact-SHA CI run `40498636963` at `d3a825b5337c29c9c7233ba04d727142fe012378` passed `pnpm verify` and promoted this SHA to `main`.

## Result

ARSY now negotiates the existing canonical `id`/`en` locale through `Accept-Language` for its browser launchpad and `/api/v1/studio` HTML. Both HTML responses set `Vary: Accept-Language`. Studio copy, including create/action buttons, view descriptions, aggregate captions, and accessibility titles, uses fixed application-owned messages; product names, routes, API paths, schema/model/field identifiers and dynamic data remain unchanged.

The centralized error handler uses the same shared `preferredLocale` helper for safe allowlisted application messages. It localizes known authentication/authorization failures, generic validation summaries, and the generic internal-server summary. Structured validation details remain present. Dynamic route-not-found text and unrecognized/runtime error text remain verbatim, and log messages continue using the original error text. Error responses set `Vary: Accept-Language`.

No locale affects authentication decisions, status codes, response envelope fields, route paths, stable identifiers, API request shape, source text, rights metadata, or structured logs. The existing English default remains the fallback.

## Positive and negative evidence

- `pnpm --filter @moonwitness/arsy build` — passed (`tsc -b`).
- `pnpm --filter @moonwitness/arsy exec tsx --test test/m05-14-locale.test.ts` — passed, 2 tests, 0 failures, 0 skips. Covers Indonesian and English HTML negotiation, unsupported-language fallback, Indonesian Studio action/view/aggregate/accessibility copy, the existing `/api/v1/studio` path, safe 400/401/403 messages with unchanged statuses/envelope, preserved validation details, and an unchanged 404 route identifier.
- `pnpm --filter @moonwitness/arsy typecheck` — passed for app and test TypeScript configs.
- `pnpm exec eslint apps/arsy/src/plugins/error-handler.ts apps/arsy/src/lib/launchpad.ts apps/arsy/src/modules/studio/index.ts apps/arsy/src/app.ts apps/arsy/test/m05-14-locale.test.ts` — passed, no output.
- `git diff --check -- apps/arsy/src/plugins/error-handler.ts apps/arsy/src/lib/launchpad.ts apps/arsy/src/modules/studio/index.ts apps/arsy/src/app.ts apps/arsy/test/m05-14-locale.test.ts` — passed; Git printed existing LF/CRLF normalization warnings for shared files.

## Security, privacy, and limits

- `Accept-Language` selects presentation text only. Only `id` and `en` are supported, via `packages/core`'s existing validated negotiator; malformed/unsupported preferences fall back to English.
- Error translation is an explicit exact-message allowlist. Provider/runtime text and dynamic route/path text are not translated. Validation internals are retained in the existing `details` field while the human summary is safe and localized.
- Existing auth checks and responses were exercised: bad credentials still return 401, a user-role caller still receives 403 on an admin-only API-key route, and malformed login input still returns 400. No credentials or source/rights data were changed.
- The HTML responses were verified via Fastify injection; no browser interaction or production deployment is claimed.
- The shared checkout also had separate uncommitted M38 SKYLINK edits in `apps/arsy/src/app.ts`. The integrator staged only the M05-14 locale import and root HTML handler hunk; M38 lines remain unstaged and outside this task commit.

## Reviewer, rollback, next task

- Independent reviewer: passed two read-only reviews; final review confirmed the visible Studio copy is localized, all locale behavior follows the shared `id`/`en` negotiator, and no auth/status/envelope/API-path regression was introduced.
- Rollback: revert the M05-14 error handler, launchpad, Studio, root-handler locale hunk in `app.ts`, test, and audit changes together. Keep the separate M38 SKYLINK `app.ts` lines untouched. `packages/core` contracts and API routes are unchanged.
- Next eligible task: M18-02 follows M18-01 but is blocked pending the D06/D08 storage owner and real license/consent evidence. M18-03 remains blocked pending the D08 release-authority and ownership decision.
