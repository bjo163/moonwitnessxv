# M19-18 — Remove Nested Dock SiteLayout & Duplicate Landmarks

- **Task:** M19-18, remove nested Dock SiteLayout and duplicate landmarks.
- **Worker:** Worker M19-18 (`teamwork_preview_worker`).
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-08 is checked in TODO.
- **Claimed/actual paths:**
  - `apps/dock/src/app/prisms/page.tsx`
  - `apps/dock/src/app/timeline/page.tsx`
  - `apps/dock/src/app/studio/page.tsx`
  - `apps/dock/src/app/reader/compare/page.tsx`
  - `apps/dock/test/landmarks.test.mjs`
  - This report.
- **Result SHA/reviewer:** Pending integrator commit and review.

---

## Behavior and Defect Resolution

In Next.js App Router, `apps/dock/src/app/layout.tsx` (`RootLayout`) unconditionally wraps `{children}` in `<SiteLayout>{children}</SiteLayout>`. `SiteLayout` (`apps/dock/src/layouts/site.tsx`) defines the site shell:
- `<SiteHeader ... />` rendering `<header className="dk-header">`
- `<main className="dk-main">{children}</main>`
- `<SiteFooter />` rendering `<footer className="dk-footer" id="join-crew">`

Prior to M19-18, exactly 4 subroutes imported `SiteLayout` from `@/layouts/site` and wrapped their component returns inside `<SiteLayout>`:
1. `apps/dock/src/app/prisms/page.tsx`
2. `apps/dock/src/app/timeline/page.tsx`
3. `apps/dock/src/app/studio/page.tsx`
4. `apps/dock/src/app/reader/compare/page.tsx`

This caused redundant rendering of the shell inside the outer `<main className="dk-main">`, resulting in:
- Duplicate `<header>` landmarks
- Invalid nested `<main>` landmarks (`<main><main>...</main></main>`) violating WCAG 2.1 / HTML semantic requirements
- Duplicate `<footer>` landmarks
- Duplicate DOM element IDs (`id="join-crew"`)

### Changes Applied
1. Removed `import { SiteLayout } from '@/layouts/site'` and `<SiteLayout>` JSX wrapper tags from `prisms/page.tsx`, `timeline/page.tsx`, `studio/page.tsx`, and `reader/compare/page.tsx`.
2. Preserved all inner layout containers, styling, cards, badges, and text verbatim.
3. Created `apps/dock/test/landmarks.test.mjs` asserting AST clean status across all 20 pages in `apps/dock/src/app`.

---

## Evidence

- `pnpm --filter @moonwitness/dock test`: Exit 0; 51 passed, 0 failed across all suites.
  - `✔ M19-18: NO page component in apps/dock/src/app imports or wraps in SiteLayout (except layout.tsx)` (AST inspection of all 20 pages)
  - `✔ M19-18: RootLayout is the exclusive consumer of SiteLayout in apps/dock/src/app`
  - `✔ M19-18: The 4 specific sub-route pages do not contain SiteLayout or landmark tags`
  - `✔ M19-18: SiteLayout definition provides the single canonical set of landmark elements`
  - `✔ M19-18: Rendered pages inside RootLayout have exactly one <header>, one top-level <main>, and one <footer>`
  - `✔ M19-18: Negative guard - nesting SiteLayout inside page causes landmark duplication and fails validation`
- `pnpm --filter @moonwitness/dock build`: Exit 0; Next.js 16.4.3 Turbopack compiled and generated static pages without error.
- `git grep -n "SiteLayout" apps/dock/src/app`: Confirms only `apps/dock/src/app/layout.tsx` imports and uses `SiteLayout`.

---

## Safety, Rollback, and Boundaries

- Changes are strictly isolated to JSX markup cleanup in the 4 affected subroute files.
- No application logic, API route, state management, or styling tokens were modified.
- Rollback: Revert `apps/dock/src/app/prisms/page.tsx`, `apps/dock/src/app/timeline/page.tsx`, `apps/dock/src/app/studio/page.tsx`, `apps/dock/src/app/reader/compare/page.tsx`, and delete `apps/dock/test/landmarks.test.mjs`.
