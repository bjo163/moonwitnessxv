# A-L-L-A-H.COM — Empire Gateway (Vercel preview)

**Status:** Isolated static pilot only. Accepted ADR-0012 permits this local/CI pilot while ADR-0004 and ADR-0011 keep Dock as the canonical LIGHTHOUSE runtime. This pilot does not replace or re-route Dock. **No new backend, auth, schema, API secrets, or public control plane.**

Repository: bjo163/moonwitnessxv · apps/empire-web.

## Local checks (Node 24, pnpm 10)
From the monorepo root:
```sh
pnpm install --frozen-lockfile
pnpm --filter @moonwitness/core build
pnpm --filter @moonwitness/moonui build
pnpm --filter @moonwitness/empire-web test
pnpm --filter @moonwitness/empire-web typecheck
pnpm --filter @moonwitness/empire-web build
node apps/empire-web/test/export-check.mjs
pnpm --filter @moonwitness/empire-web dev
```
Local app: http://localhost:3010

## Dedicated Vercel project settings
- Name: a-l-l-a-h-empire-web
- Git: bjo163/moonwitnessxv, branch feature/empire-web-vercel for preview
- Framework: Next.js; Root Directory: apps/empire-web
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm --filter @moonwitness/core build && pnpm --filter @moonwitness/moonui build && pnpm --filter @moonwitness/empire-web build`
- Next: static export; no API server or backend runtime; Node 24.x
- Production custom domain not attached before security, rights, DNS and editorial approvals.
- No secrets required for this static first slice.

## Acceptance gates
1. Exact SHA CI and Vercel build = READY, with proof.
2. Browser routes /, /id, /en; real accessible controls, mobile and keyboard.
3. Status copy: CODE EXISTS ≠ DEPLOYED; PLANNED has no fake clickthrough.
4. No PII, private sources, unsafe API endpoints, secrets or invented telemetry.
5. Rights, privacy and canonical-domain decision before public index/production.
6. Existing Dock, ARSY and Headquarters continue unaffected.

Read: docs/product/A-L-L-A-H-COM-MASTER-SPEC.md, BLUEPRINT.md, TODO.md, and accepted ADRs.

## Information-page increment (29 October 2026)

The isolated pilot now includes `/id/about`, `/id/sources`, `/id/privacy` and their `/en` equivalents. Language links preserve the current information page. Footer links, visible mobile section navigation, and a keyboard skip link provide navigation without client-side state or another backend. The information pages remain noindex.

Privacy copy describes the application code separately from hosting logs, whose retention has not been verified. Source copy does not imply publication rights for scripture, research, or poster assets. This increment does not complete or change the canonical M31/Dock task statuses. The owner's explicit branch-specific pilot request is the scope for this work; accepted Dock runtime decisions remain authoritative for the canonical gateway.

`node apps/empire-web/test/export-check.mjs` checks the generated HTML after building: information pages, locale links, headings, main landmarks, noindex and absence of forms/embeds. It is also run by the dedicated CI workflow. It is not a browser accessibility audit or deployment check.

## Static pilot completion scope

Both `/id` and `/en` expose home plus `about`, `ecosystem`, `values`, `roadmap`, `sources` and `privacy`. `/` deterministically serves the English fallback. Locale root layouts set the actual HTML document language before JavaScript; information-page language switches preserve the section. The multi-root layout uses Next's supported experimental `globalNotFound` configuration to produce an exported bilingual recovery page. This flag must be reviewed when upgrading Next.

The atlas includes implementation state, separate unverified public-access state, audience, design owner, pinned planning/code references and source-review date. It has no unverified service destination. Four discovery cards lead to actual local information pages. Story content remains the already-present narrative reflection; no new poster or scripture publication is implied.

Verification commands after build:
```sh
node apps/empire-web/test/export-check.mjs
pnpm exec playwright install --with-deps chromium --only-shell
pnpm exec playwright test --config apps/empire-web/playwright.config.mjs
```
The Playwright suite covers both locales at 390px and 1440px, keyboard skip navigation, all information-page links and locale round trips, overflow, global 404, JavaScript errors and unexpected external requests. The dedicated CI workflow runs it after the static build; configuring it is not evidence of a passing run.

See `docs/audit/empire-web-static-pilot-2026-10-29.md` for observed local evidence and remaining release gates. No Vercel deployment, production promotion, domain attachment or DNS change is part of this increment.
