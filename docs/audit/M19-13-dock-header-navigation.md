# M19-13 — Dock Header Navigation & Active Nav Semantics

- **Task:** M19-13, consolidate Dock header and active nav semantics.
- **Worker:** Worker M19-13 (`teamwork_preview_worker`).
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-12, M19-03 checked in TODO.
- **Claimed/actual paths:**
  - `apps/dock/src/ui/components/shell.tsx`
  - `apps/dock/test/header-navigation-semantics.test.mjs`
  - This report.
- **Result SHA/reviewer:** Pending integrator commit and review.

---

## Behavior and Navigation Semantics

Prior to M19-13, `apps/dock/src/ui/components/shell.tsx` exhibited several navigation defects:
1. Hardcoded `className="dk-nav-active"` on `<a href="/">HOME</a>`, causing `HOME` to appear active across all routes while active pages had no visual or accessible indicator.
2. `aria-current="page"` was completely missing across all navigation links.
3. Navigation links used bare paths (`/`, `/stations`, `/reader`), dropping `/id` or `/en` locale context on click.
4. Header Join CTA targeted `/#join-crew`, causing full-page reloads back to the root homepage rather than smoothly targeting `<footer class="dk-footer" id="join-crew">` on the current page.
5. On viewports <= 1040px, 15 desktop nav links caused horizontal layout overflow; no accessible mobile drawer or toggle trigger existed.

### Architectural Solution
1. **Dynamic Active Route Resolution:**
   - Implemented `normalizePath(rawPath)` and `isRouteActive(currentPath, targetHref)`.
   - Compares current path against destination after stripping locale prefixes (`/id`, `/en`).
   - Supports exact matches (e.g., `/` matching `/`, `/stations` matching `/stations`) and sub-path hierarchy (e.g., `/reader/compare` matching `/reader`).
   - Assigns `aria-current="page"` AND `className="dk-nav-active"` strictly to active links. Inactive links receive neither.
2. **Locale-Preserving Navigation:**
   - Wrapped all 15 header links with `getLocalizedNavHref(link.href, initialLocale)` calling `localizedDockHref()`.
   - Updated `BrandLogo` to target `localizedDockHref('/', '', '', initialLocale)`.
   - Updated icon buttons (`SRC` -> `/stations`, `NET` -> `/#constellation`) and footer CTA (`BECOME A MOONWITNESS` -> `/stations`) with locale preservation.
3. **In-Page Anchor Targeting:**
   - Changed header CTA href to `#join-crew`, targeting the existing footer landmark `<footer class="dk-footer" id="join-crew">` without triggering page navigation.
4. **Accessible Mobile Navigation Drawer:**
   - Added toggle button with `aria-expanded={isMenuOpen}`, `aria-controls="dk-mobile-menu"`, and bilingual `aria-label`.
   - Added drawer container with `id="dk-mobile-menu"`, `role="dialog"`, `aria-modal="true"`, and `hidden={!isMenuOpen}`.
   - Enforced keyboard accessibility:
     - Pressing Escape immediately closes the drawer and restores focus to the trigger button.
     - Focus trap cycles focusable elements (`Tab` and `Shift+Tab`) within the open drawer.
     - Clicking any drawer link closes the menu.

---

## Evidence

- `pnpm --filter @moonwitness/dock test`: Exit 0; 51 passed, 0 failed across all suites.
  - `✔ header navigation assigns aria-current="page" and dk-nav-active only to the active route`
  - `✔ header navigation links preserve active locale prefix across id and en`
  - `✔ header Join CTA points directly to in-page footer anchor #join-crew without resetting route`
  - `✔ mobile menu trigger and drawer declare valid ARIA accessibility attributes`
  - `✔ route normalization and active route computation logic covers subroutes and fragments`
- `pnpm --filter @moonwitness/dock build`: Exit 0; Next.js 16.4.3 Turbopack build succeeded with zero typecheck or lint errors.
- `pnpm exec eslint apps/dock/src/ui/components/shell.tsx apps/dock/test/header-navigation-semantics.test.mjs`: Exit 0 (0 errors, 0 warnings).

---

## Safety, Rollback, and Boundaries

- All legacy URL paths remain supported.
- Navigation changes affect only client-side presentation and routing preservation within `apps/dock`.
- Rollback: Revert `apps/dock/src/ui/components/shell.tsx` and delete `apps/dock/test/header-navigation-semantics.test.mjs`.
