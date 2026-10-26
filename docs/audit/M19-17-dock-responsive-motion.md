# M19-17 — Dock Responsive Layout & Reduced-Motion Accessibility

- **Task:** M19-17, test bilingual homepage responsive and reduced-motion.
- **Worker:** Worker M19-17 (`teamwork_preview_worker`).
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-10, M19-11, M19-12 checked in TODO.
- **Claimed/actual paths:**
  - `apps/dock/src/app/globals.css`
  - `apps/dock/test/responsive-accessibility.test.mjs`
  - This report.
- **Result SHA/reviewer:** Pending integrator commit and review.

---

## Behavior and Accessibility Enhancements

Prior to M19-17, `apps/dock/src/app/globals.css` lacked accessibility safeguards for users with vestibular sensitivities or visual tracking needs:
1. Zero declarations of `@media (prefers-reduced-motion: reduce)`. Continuous spin animations (`.m-spinner`, `.m-live-dot`) and hover translations (`.dk-station:hover`, `.m-btn:hover`) ran unconditionally.
2. Keyboard navigation (`:focus-visible`) was invisible against the dark `#07060b` background for navigation links, icon buttons, brand logo, and MoonUI buttons.
3. At viewports < 1040px, the 15 uncollapsed desktop navigation links caused horizontal viewport displacement and overflow.

### Architectural Solution
1. **Reduced-Motion Media Query (WCAG 2.1 SC 2.3.3):**
   - Added dedicated `@media (prefers-reduced-motion: reduce)` block.
   - Neutralizes transitions and animations globally:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
       .m-spinner,
       .m-live-dot[data-on="true"]::after {
         animation: none !important;
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
         opacity: 0.7;
       }
       .dk-station:hover,
       .m-btn:hover {
         transform: none !important;
       }
     }
     ```
2. **High-Contrast Visible Focus Rings (WCAG 2.1 SC 2.4.7 Level AA):**
   - Declared explicit outline rules for all interactive navigation and action elements:
     ```css
     .dk-nav a:focus-visible,
     .dk-icon-btn:focus-visible,
     .m-btn:focus-visible,
     .m-brand-link:focus-visible {
       outline: 3px solid var(--accent);
       outline-offset: 3px;
     }
     ```
3. **Horizontal Viewport Containment & Responsive Breakpoints:**
   - Enforced `max-width: 100vw; overflow-x: hidden;` on `html, body` and `overflow-x: clip;` on `.dk-shell`.
   - At `@media (max-width: 1040px)`, hid desktop `.dk-nav` and configured `.dk-header` padding/gap to ensure zero horizontal overflow.

---

## Evidence

- `pnpm --filter @moonwitness/dock test`: Exit 0; 51 passed, 0 failed across all suites.
  - `✔ globals.css defines prefers-reduced-motion media query suppressing animations and hover transforms`
  - `✔ globals.css defines visible keyboard focus-visible outline rules for navigation links and buttons`
  - `✔ globals.css defines responsive layout safeguards and horizontal overflow containment`
- `node --experimental-strip-types --test apps/dock/test/responsive-accessibility.test.mjs`: Exit 0 (3/3 pass).
- `pnpm --filter @moonwitness/dock build`: Exit 0; Next.js 16.4.3 Turbopack build succeeded with zero typecheck or CSS compilation errors.

---

## Safety, Rollback, and Boundaries

- CSS modifications enhance accessibility and responsive containment without breaking existing design tokens or desktop layout appearance.
- Rollback: Revert `apps/dock/src/app/globals.css` and remove `apps/dock/test/responsive-accessibility.test.mjs`.
