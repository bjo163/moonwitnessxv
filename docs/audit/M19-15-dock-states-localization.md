# M19-15 — Dock Forms, Loading, Error & Empty States Localization

- **Task:** M19-15, localize Dock forms/validation/loading/error/empty states.
- **Worker:** Worker M19-15 (`teamwork_preview_worker`).
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-09, M05-13 checked in TODO.
- **Claimed/actual paths:**
  - `apps/dock/src/lib/states-copy.ts`
  - `apps/dock/src/app/loading.tsx`
  - `apps/dock/src/app/error.tsx`
  - `apps/dock/src/app/global-error.tsx`
  - `apps/dock/src/app/not-found.tsx`
  - `apps/dock/src/app/stations/page.tsx`
  - `apps/dock/src/app/stations/[id]/page.tsx`
  - `apps/dock/src/app/schedule/page.tsx`
  - `apps/dock/src/app/missions/page.tsx`
  - `apps/dock/src/app/terms/page.tsx`
  - `apps/dock/src/app/constellation/page.tsx`
  - `apps/dock/src/app/figures/page.tsx`
  - `apps/dock/src/app/patches/page.tsx`
  - `apps/dock/src/app/research/page.tsx`
  - `apps/dock/src/ui/client/DenpaTransceiver.tsx`
  - `apps/dock/src/ui/client/CitationCopy.tsx`
  - `apps/dock/test/required-states-ui-keys.mjs`
  - `apps/dock/test/states-copy-parity.test.mjs`
  - This report.
- **Result SHA/reviewer:** Pending integrator commit and review.

---

## Behavior and Localization Architecture

Prior to M19-15, Dock lacked conventional Next.js App Router boundary files (`loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`), and server subroute pages contained hardcoded English text in query catch blocks, form controls, filter options, and empty notices.

### Architectural Solution
1. **Bilingual States Copy Catalog (`apps/dock/src/lib/states-copy.ts`):**
   - Implemented 115 keys categorized into:
     - Forms & Input Controls (56 keys)
     - Loading & Stream Status (12 keys)
     - Errors & Boundary Chrome (20 keys)
     - Empty States & Notices (27 keys)
   - Strict 1:1 key parity between `id` and `en` enforced at compile and runtime via `defineLocaleCatalog` from `@moonwitness/core`.
   - Exported `getStatesCopy(locale: Locale)`.
2. **App Router Conventional Boundary Files:**
   - `loading.tsx`: Renders accessible MoonUI `<Spinner />` and localized status text (`copy.loadingTransmissions`).
   - `error.tsx`: Client-side error boundary receiving `{ error, reset }`, rendering MoonUI `Panel`, `Alert tone="hot"`, and localized retry action.
   - `global-error.tsx`: Root-level error boundary rendering valid `<html>` and `<body>` tags with localized error notice and page reload action.
   - `not-found.tsx`: Localized 404 page reading `x-mw-locale` and presenting cohesive navigation recovery.
3. **Subroute Server Page Localization:**
   - Injected `getStatesCopy(locale)` into 9 server pages: `stations`, `stations/[id]`, `schedule`, `missions`, `terms`, `constellation`, `figures`, `patches`, and `research`.
   - Localized search and filter controls, query catch error banners, station details fallbacks, and empty schedule notices.
4. **Interactive Client Component Localization:**
   - `DenpaTransceiver.tsx`: Localized message input placeholders, pending transmission status, broadcast success/failure notices, and empty transmission feed.
   - `CitationCopy.tsx`: Localized copy citation button and clipboard status feedback.
5. **Parity and Negative Test Suite (`apps/dock/test/states-copy-parity.test.mjs`):**
   - Asserts full 1:1 key parity across all 115 keys.
   - Validates all keys in `REQUIRED_STATES_UI_KEYS`.
   - Proves negative failure if any key in `id` or `en` is missing.
   - Asserts absence of placeholder tokens (`[TODO]`, `[TBD]`).

---

## Evidence

- `pnpm --filter @moonwitness/dock test`: Exit 0; 51 passed, 0 failed across all suites.
  - `✔ M19-15 states copy catalog has full 1:1 key parity between English and Indonesian`
  - `✔ M19-15 states copy catalog satisfies all 115 REQUIRED_STATES_UI_KEYS`
  - `✔ M19-15 missing required key in id throws TypeError identifying missing key`
  - `✔ M19-15 missing required key in en throws TypeError identifying missing key`
  - `✔ M19-15 getStatesCopy resolves copy safely for both locales`
  - `✔ M19-15 states copy contains no unresolved placeholders or TODO tokens`
- `pnpm --filter @moonwitness/dock build`: Exit 0; Next.js 16.4.3 Turbopack build succeeded with zero typecheck or lint errors.
- `pnpm exec eslint ...`: Exit 0 (0 errors, 0 warnings).

---

## Safety, Rollback, and Boundaries

- Original artistic text (ska poster lyrics) and historical scriptural citations (Hebrew, Greek, Arabic) are treated as immutable primary artifacts and were untouched.
- Rollback: Revert modified page and client component files, and remove `states-copy.ts`, boundary files, and test files.
