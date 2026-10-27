# M40-04 — 2D Accessibility Fallback and 3D Performance Gates Evidence

**Task ID:** `M40-04`  
**Task Title:** 2D accessibility fallback and 3D performance gates  
**Baseline SHA:** `fbf176e`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)  

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/tasks/M40/M40-04.md](../tasks/M40/M40-04.md), task `M40-04` delivers the 2D accessibility fallback, mobile responsive reflow, and 3D performance gates for `@moonwitness/orbit`:

1. **Deterministic WebGL Capability Detection & Fallback ([`WebGLDetector.ts`](../../apps/orbit/src/components/spatial/WebGLDetector.ts), [`OrbitWebGLFallback.tsx`](../../apps/orbit/src/components/OrbitWebGLFallback.tsx)):**
   - Client-side WebGL capability tester safely detects if WebGL/WebGL2 is supported or active, failing safe to `false` during SSR and test environments without throwing exceptions.
   - When WebGL is unavailable or disabled, `@moonwitness/orbit` automatically displays `OrbitWebGLFallback`, a high-contrast accessible 2D operational card outlining topology counts and keyboard instructions.

2. **Interactive View Mode Switcher ([`OrbitSpatialViewport.tsx`](../../apps/orbit/src/components/OrbitSpatialViewport.tsx), [`OrbitOperationsWorkspace.tsx`](../../apps/orbit/src/components/OrbitOperationsWorkspace.tsx)):**
   - Users can explicitly toggle between **Spatial 3D View** and **Accessible 2D Only** via an accessible toolbar button.
   - When in 2D mode, the 3D scene unmounts cleanly and displays the 2D fallback stage with an action button to switch back to 3D.

3. **Accessibility Parity (Zero Reliance on Hover, Sound, or Color Alone):**
   - Every workstation status (`STANDALONE`, `DEGRADED`, `OFFLINE`) and agent state (`WAITING_APPROVAL`, `EXECUTING`, `IDLE`) conveys meaning via explicit textual labels in high-contrast badges.
   - Verified zero audio elements, `AudioContext`, or sound effects across the entire application.
   - All interactive items in the 2D grid are keyboard-accessible with `tabIndex={0}`, `role="button"`, `aria-pressed`, `aria-label`, and `Enter`/`Space` activation handlers.
   - Modal/drawer inspector binds `Escape` keyboard dismiss listener.

4. **Narrow & Mobile Viewport Adaptation ([`apps/orbit/src/app/globals.css`](../../apps/orbit/src/app/globals.css)):**
   - Media queries for `@media (max-width: 768px)` and `@media (max-width: 480px)` reflow the multi-column 2D grid into a single responsive column.
   - At $\le 768\text{px}$, the inspector drawer transitions from an absolute overlay to a natural flow block, preventing content clipping or obstruction on mobile touch screens.
   - At $\le 480\text{px}$, dense quick-select buttons hide gracefully since 2D list items below provide direct touch selection.

5. **3D Performance & GPU Memory Disposal Gates:**
   - [`OrbitScene.tsx`](../../apps/orbit/src/components/spatial/OrbitScene.tsx) sets `frameloop={prefersReducedMotion ? 'demand' : 'always'}` so continuous rendering halts when reduced motion is preferred.
   - Canvas clamps device pixel ratio with `dpr={[1, 2]}` to prevent GPU throttling on ultra-high-density displays.
   - All Three.js dynamic textures (`CanvasTexture`), geometries (`BufferGeometry`), and camera controls (`OrbitControls`) deterministically execute `.dispose()` on unmount.

---

## 2. Verification Commands & Observed Results

### 1. ORBIT Test Suite (25/25 Passing)
```bash
pnpm --filter @moonwitness/orbit test
```
**Output:**
```
> @moonwitness/orbit@1.0.0 test Z:\project\moonradio\apps\orbit
> node --test test/*.test.mjs

✔ M40-04: isWebGLAvailable fails safe to false in server/test environments without throwing (1.0974ms)
✔ M40-04: OrbitWebGLFallback component exists and enforces accessible 2D layout (0.4734ms)
✔ M40-04: View mode switcher supports both 3D spatial and 2D accessible modes (0.4099ms)
✔ M40-04: Zero reliance on sound or audio triggers across ORBIT (16.5245ms)
✔ M40-04: Zero reliance on color alone: all status states convey explicit textual labels (0.4909ms)
✔ M40-04: Full keyboard accessibility attributes in 2D list and inspector (0.4043ms)
✔ M40-04: Responsive CSS rules for mobile breakpoints (390px, 768px) (0.2903ms)
✔ M40-04: 3D performance and GPU memory disposal gates (0.6826ms)
✔ M40-02: orbitCatalog exposes identical complete key sets in English and Indonesian (2.199ms)
✔ M40-02: Every key in both locales contains non-empty translated string (0.6024ms)
✔ M40-02: Required navigation keys are present and distinct across locales (0.2395ms)
✔ M40-02: resolveOrbitLocale complies with ADR-0005 precedence and fails safe (1.0005ms)
✔ M40-02: Shell accessibility landmarks, skip link, and reduced motion (0.7401ms)
✔ M40-02: Monorepo isolation boundaries and zero private HQ imports (9.7549ms)
✔ M40-01: @moonwitness/orbit package and boundary integrity (1.6676ms)
✔ M40-01: Next.js and web-config configuration integrity (0.4292ms)
✔ M40-01: Offline deterministic simulated fixtures (0.3925ms)
✔ M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex (0.7008ms)
✔ M40-03: Zero external 3D model files in apps/orbit (100% procedural Three.js) (3.2547ms)
✔ M40-03: Dynamic import boundary with ssr: false (1.4547ms)
✔ M40-03: Every simulated fixture and 3D badge carries SIMULATED provenance (0.6288ms)
✔ M40-03: Deterministic two-way selection contract and safe fallback (0.4146ms)
✔ M40-03: Approval handoff contract for WAITING_APPROVAL agent (1.5932ms)
✔ M40-03: Reduced motion compliance halts auto-rotation (1.3451ms)
✔ M40-03: Design token purity in spatial scene (0.1976ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 535.0623
```

### 2. TypeScript Typecheck
```bash
pnpm --filter @moonwitness/orbit typecheck
```
**Output:** Exit code 0, zero errors.

### 3. UI Consistency & Token Linter
```bash
pnpm ui:check
```
**Output:**
```
═══════════════════════════════════════════════════════════════════════
   🌙 MOONWITNESS MONOREPO UI CONSISTENCY & HARDCODE ENFORCER       
═══════════════════════════════════════════════════════════════════════
Scanning monorepo apps for design system adoption & token purity...
...
Files scanned: 131 | Total Violations: 0
✨ Monorepo UI consistency check PASSED! All apps are 100% unified with @moonwitness/moonui.
```

### 4. ESLint Check
```bash
pnpm exec eslint apps/orbit
```
**Output:** Exit code 0, zero lint violations.

### 5. Next.js Production Build
```bash
pnpm --filter @moonwitness/orbit build
```
**Output:**
```
▲ Next.js 16.4.3 (Turbopack)
✓ Compiled successfully in 3.4s
  Running TypeScript ...
  Finished TypeScript in 6.9s ...
✓ Generating static pages using 4 workers (3/3) in 721ms
Finalizing page optimization ...
Route (app)
┌ ƒ /
└ ƒ /_not-found
```

### 6. Monorepo Web Build Chain
```bash
pnpm build:web
```
**Output:** Exit code 0. Successfully built `@moonwitness/headquarters`, `@moonwitness/dock`, and `@moonwitness/orbit`.
