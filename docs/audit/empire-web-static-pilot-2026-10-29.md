# Empire Web static pilot — verification record

Date: 29 October 2026 (Asia/Jakarta). Scope: the owner-requested `apps/empire-web` pilot on `feature/empire-web-vercel`, following remote baseline `2d6c5eebfbd9e1fd7b4beb027b6bde91130515e1`. This is an implementation evidence record, not a second TODO register or a claim that M31/Dock is complete.

## Delivered boundary

- Home at `/`, `/id`, `/en`; English deterministic fallback at `/`.
- `about`, `ecosystem`, `values`, `roadmap`, `sources`, `privacy` in both locales: twelve information pages.
- Actual document-language metadata from locale-specific root layouts, guarded static parameters, and noindex preserved.
- Four real local discovery destinations; no false service-entry links. Atlas separates documented code/plans from unverified deployment/access and cites pinned source references.
- Mobile navigation, semantic main/header/footer landmarks, keyboard skip link, page-preserving locale links and bilingual global 404 recovery.
- Static content only. No authentication, backend, data owner, payment, donation, private source, poster publication or DNS mutation added.

## Observed checks

| Command / evidence | Result |
| --- | --- |
| `NEXT_TELEMETRY_DISABLED=1 corepack pnpm --filter @moonwitness/empire-web build` | PASS: static routes generated, including all twelve information pages |
| `node apps/empire-web/test/export-check.mjs` | PASS: locale HTML language, headings, main landmark, noindex, locale links, all local links/anchors across 17 HTML files, unsupported locale absence, global 404 recovery |
| `corepack pnpm --filter @moonwitness/empire-web test` | PASS: 4 contract tests |
| `corepack pnpm --filter @moonwitness/empire-web typecheck` | PASS |
| Focused ESLint on app TS/TSX, export checker, browser suite and Playwright config | PASS |
| `corepack pnpm exec playwright test --config apps/empire-web/playwright.config.mjs --list` | PASS: discovers four locale/viewport journeys; discovery only, not browser execution |
| `git diff --check` | PASS |
| Chromium full and headless-shell installation | BLOCKED: downloaded archive reports zero MiB / invalid ZIP; browser executable unavailable |

## Browser and hosting limits

The browser suite is configured in dedicated CI, but local browser navigation, visual screenshots, keyboard behavior and overflow are not claimed as passed. HTML checks cannot establish visual correctness or WCAG compliance. Obtain a passing exact-commit CI browser result or run the documented suite in a browser-capable environment before declaring that gate complete.

Next's `experimental.globalNotFound` is used because separate root layouts are required to emit the correct document language without client-side mutation. The current installed Next version successfully exports `404.html`; review this experimental option on framework upgrades.

Vercel import remains deferred by the owner after the previously observed 403 project-create failure. No preview URL or production deployment is claimed. DNS and domain attachment are untouched. A successful static build is not a deployment.

Illustrated stories, reader/radio integrations, community, research studio and economic services remain future, rights/owner-gated product work. Existing Dock, ARSY, Headquarters and canonical TODO statuses are unchanged. This record closes the implemented static content scope, not the broader ecosystem or its release gates.

## Rollback

Revert this branch increment to the baseline above if required; no schema, migration, secret or external service state needs rollback. Do not force-push shared history. Rebuild and run the same export/contract checks after a revert.
