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
