# M40-02 — MoonUI Shell, Navigation, and id/en Locale Parity Evidence

**Task ID:** `M40-02`  
**Task Title:** MoonUI shell, navigation, and id/en locale parity  
**Baseline SHA:** `04533ab27b765f198c4449022b04f2a83f17b902`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)  

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [ADR-0005](../decisions/ADR-0005-locale.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/milestones/M40.md](../milestones/M40.md), task `M40-02` delivers an independent MoonUI shell with full bilingual `id`/`en` parity, accessible landmarks, and reduced-motion enforcement for `@moonwitness/orbit`:

1. **Locale Parity Catalog:** [`apps/orbit/src/lib/orbit-copy.ts`](../../apps/orbit/src/lib/orbit-copy.ts) implements `defineLocaleCatalog` from `@moonwitness/core`, enforcing 100% key parity between English (`en`) and Indonesian (`id`) across 30+ semantic keys (brand, navigation, section headings, field labels, status notices, and a11y labels). Zero raw key fallbacks.
2. **Deterministic Locale Negotiation:** Implements `resolveOrbitLocale()` adhering to ADR-0005 precedence: explicit URL query (`?locale=id|en`) $\rightarrow$ persisted cookie (`mw_locale`) $\rightarrow$ `Accept-Language` header $\rightarrow$ default `en`. Unsupported or invalid tags fail safe to `en`.
3. **Server-Side Locale Resolution:** [`apps/orbit/src/lib/request-locale.ts`](../../apps/orbit/src/lib/request-locale.ts) resolves the user's preferred language server-side across headers and cookies, populating HTML `lang={locale}` and rendering localized server components.
4. **Independent Navigation & Header:**
   - [`apps/orbit/src/components/OrbitShellHeader.tsx`](../../apps/orbit/src/components/OrbitShellHeader.tsx): Renders brand title, localized subtitle, cross-app link to Headquarters / 100CENTER (`http://localhost:3002`), operational status badges (`PROVENANCE: SIMULATED`), and accessible locale switcher (`EN` / `ID`).
   - [`apps/orbit/src/components/OrbitNav.tsx`](../../apps/orbit/src/components/OrbitNav.tsx): Renders section navigation (`Overview`, `Workstations`, `Agent Loops`, `Task Queues`, `Audit Traces`) and view mode badges (`Spatial 3D View`, `Accessible 2D Fallback`).
5. **Accessibility & Reduced Motion:**
   - [`apps/orbit/src/app/globals.css`](../../apps/orbit/src/app/globals.css) adds:
     - Accessible skip-to-content link targeting `#main-content`.
     - Explicit `:focus-visible` styling (`outline: 2px solid var(--cyan)`).
     - Standard ARIA landmark styling and full keyboard focusability.
     - `@media (prefers-reduced-motion: reduce)` halting animations and smooth scrolling.
6. **Strict Monorepo Isolation:** Verified zero private imports from `apps/headquarters` or `apps/dock`.

---

## 2. Verification Commands & Observed Results

### ORBIT Test Suite (10/10 Passing)
```bash
pnpm --filter @moonwitness/orbit test
```
**Output:**
```
> @moonwitness/orbit@1.0.0 test Z:\project\moonradio\apps\orbit
> node --test test/*.test.mjs

✔ M40-02: orbitCatalog exposes identical complete key sets in English and Indonesian (1.9739ms)
✔ M40-02: Every key in both locales contains non-empty translated string (0.4308ms)
✔ M40-02: Required navigation keys are present and distinct across locales (0.2829ms)
✔ M40-02: resolveOrbitLocale complies with ADR-0005 precedence and fails safe (1.934ms)
✔ M40-02: Shell accessibility landmarks, skip link, and reduced motion (0.6357ms)
✔ M40-02: Monorepo isolation boundaries and zero private HQ imports (1.5849ms)
✔ M40-01: @moonwitness/orbit package and boundary integrity (1.5107ms)
✔ M40-01: Next.js and web-config configuration integrity (0.5361ms)
✔ M40-01: Offline deterministic simulated fixtures (0.5616ms)
✔ M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex (1.2286ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 275.0361
```

### Typecheck
```bash
pnpm --filter @moonwitness/orbit typecheck
```
**Output:**
```
> @moonwitness/orbit@1.0.0 typecheck Z:\project\moonradio\apps\orbit
> tsc --noEmit
# Exit code 0
```

### Next.js Production Build
```bash
pnpm --filter @moonwitness/orbit build
```
**Output:**
```
▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.mjs took 37ms
✓ Compiled successfully in 872ms
  Running TypeScript ...
  Finished TypeScript in 2.7s ...
✓ Generating static pages using 4 workers (3/3) in 702ms
Route (app)
┌ ƒ /
└ ƒ /_not-found
ƒ  (Dynamic)  server-rendered on demand
# Exit code 0
```

### UI Consistency Linter
```bash
pnpm ui:check
```
**Output:**
```
Files scanned: 121 | Total Violations: 0
✨ Monorepo UI consistency check PASSED! All apps are 100% unified with @moonwitness/moonui.
```

### ESLint Linter Gate
```bash
pnpm exec eslint apps/orbit
```
**Output:**
```
# Exit code 0 (0 problems)
```

---

## 3. Rollback Plan

To revert task `M40-02`:
1. Revert `apps/orbit/src/components/`, `apps/orbit/src/lib/`, `apps/orbit/src/app/`, and `apps/orbit/test/orbit-locale-shell.test.mjs`.
2. Delete `docs/tasks/M40/M40-02.md` and this audit document.
