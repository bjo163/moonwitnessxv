# Empire Web — Dedicated Vercel preview runbook

Scope: public static A-L-L-A-H.COM gateway **only**; not ARSY, Dock, Headquarters, Cockpit, Sentinel, AI Gateway, SKYLINK or ECHOLOG.

1. ADR-0012 permits repository and local/CI preview only. Any future deployment needs separate explicit authorization and release review alongside ADR-0004 and ADR-0011.
2. Verify Node 24, pnpm 10.33.4 and clean lockfile; build MoonUI dependencies and app, run app contract tests.
3. Link GitHub repo bjo163/moonwitnessxv; root apps/empire-web; Next.js; build from app README. Do not point to monorepo root.
4. After separate explicit authorization, deploy the selected branch as **preview**; verify the correct team, project, ref, commit SHA and logs.
5. Smoke /, /id, /en; language links; accessibility mobile/desktop; reduced motion; no fake LIVE; no secret/PII; robots noindex; security headers.
6. Release review must approve the exception to Lighthouse-within-Dock, privacy/source-rights content, production canonical routes and support/contact policies.
7. Only then promote or merge reviewed SHA to authorized production branch and separately configure a-l-l-a-h.com DNS/TLS.
8. Record Vercel deployment URL, SHA, rollback target, smoke evidence. Do not treat successful CI as deployment proof.
9. Maintain strict separation: no second ARSY, DB, IAM, or custom API from this new frontend.

Open gates: root redirect vs static fallback, reviewed public content, SEO/canonical, privacy/legal, real browser evidence and DNS ownership.
