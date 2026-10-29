# A-L-L-A-H.COM — Empire Gateway (Vercel preview)

**Status:** Isolated static pilot only. Separate frontend is a proposed exception to the accepted Lighthouse-within-Dock boundary (ADR-0004); see ADR-0011 (PROPOSED). **No new backend, auth, schema, API secrets, or public control plane.**

Repository: bjo163/moonwitnessxv · branch feature/empire-web-vercel · apps/empire-web.

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

`node apps/empire-web/test/export-check.mjs` checks the generated HTML after building: six pages, locale links, headings, main landmarks, noindex and absence of forms/embeds. It is also run by the dedicated CI workflow. It is not a browser accessibility audit or deployment check.
