# M40-03 — Spatial Scene with Clearly Labelled Simulated Fixtures Evidence

**Task ID:** `M40-03`  
**Task Title:** Spatial scene with clearly labelled simulated fixtures  
**Baseline SHA:** `70b6b14b6630b21da4449df5ad7e2c247be7736f`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)  

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/tasks/M40/M40-03.md](../tasks/M40/M40-03.md), task `M40-03` delivers the 3D-first spatial operations viewport and synchronized 2D inspector for `@moonwitness/orbit`:

1. **Client-Only Boundary (`apps/orbit/src/components/OrbitSpatialViewport.tsx`):**
   - Implements Next.js dynamic import with `ssr: false` and accessible status fallback (`INITIALIZING SPATIAL WORKSPACE...`), guaranteeing zero WebGL initialization failures during SSR, SSG, or hydration.
   - Provides an accessible keyboard quick-select toolbar enabling screen reader and keyboard users to focus any workstation or agent loop without pointer events.

2. **Procedural 3D Scene (`apps/orbit/src/components/spatial/`):**
   - [`HologramBadge.tsx`](../../apps/orbit/src/components/spatial/HologramBadge.tsx): Canvas-backed Three.js `Sprite` dynamically generating high-contrast holographic labels with prominent `[SIMULATED]` indicators and clean WebGL texture disposal on unmount.
   - [`WorkstationMesh.tsx`](../../apps/orbit/src/components/spatial/WorkstationMesh.tsx): Procedural hexagonal prism with halo ring and wireframe edges colored with MoonUI tokens (`--cyan`, `--accent`, `--muted`).
   - [`AgentMesh.tsx`](../../apps/orbit/src/components/spatial/AgentMesh.tsx): Procedural octahedron with orbital gimbal ring rotating around parent workstation coordinates with state-driven emissive lighting (`--ok` for `EXECUTING`, `--accent` for `WAITING_APPROVAL`, `--cyan` for `IDLE`).
   - [`ConnectionLines.tsx`](../../apps/orbit/src/components/spatial/ConnectionLines.tsx): Procedural constellation lines connecting workstation nodes in 3D space.
   - [`BoundedOrbitControls.tsx`](../../apps/orbit/src/components/spatial/BoundedOrbitControls.tsx): Lightweight wrapper using native Three.js `OrbitControls` with clamped polar angle (`maxPolarAngle = π/2 - 0.05`), distance limits (`minDistance = 5`, `maxDistance = 25`), and smooth damping.
   - [`OrbitScene.tsx`](../../apps/orbit/src/components/spatial/OrbitScene.tsx): R3F `<Canvas>` root combining controlled directional/ambient lights, cyber ground grid, and background deselection handlers.

3. **Two-Way Selection & 2D Inspector Drawer (`apps/orbit/src/components/OrbitNodeInspector.tsx`, `OrbitOperationsWorkspace.tsx`):**
   - Selecting a node in 3D opens the 2D inspector drawer with complete details (cycle, steps, lease token, coordinates, and persistent `PROVENANCE: SIMULATED` badge).
   - Selecting an item in the 2D operational fallback grid highlights the corresponding 3D mesh.
   - For agents in `WAITING_APPROVAL`, prominently displays the required action, requested role, reason, and direct link to Headquarters (`100CENTER`).
   - Fully accessible: closes on `Escape` keypress, includes close button with `aria-label`, and provides clear selection reset.

4. **Reduced Motion Compliance:**
   - Honors `(prefers-reduced-motion: reduce)` media query dynamically.
   - Auto-rotation in `BoundedOrbitControls` and orbital math in `AgentMesh` halt immediately, freezing objects on deterministic static positions.

5. **Design Token Purity & Zero External 3D Models:**
   - 100% procedural geometries. Zero binary `.gltf`, `.glb`, or `.obj` files in `@moonwitness/orbit`.
   - All Three.js materials strictly match `@moonwitness/moonui` design tokens via [`SPATIAL_TOKENS`](../../apps/orbit/src/components/spatial/tokens.ts).
   - Passed `pnpm ui:check` with zero color drift or rogue hex.

---

## 2. Verification Commands & Observed Results

### 1. ORBIT Test Suite (17/17 Passing)
```bash
pnpm --filter @moonwitness/orbit test
```
**Output:**
```
> @moonwitness/orbit@1.0.0 test Z:\project\moonradio\apps\orbit
> node --test test/*.test.mjs

✔ M40-02: orbitCatalog exposes identical complete key sets in English and Indonesian (4.6792ms)
✔ M40-02: Every key in both locales contains non-empty translated string (0.5119ms)
✔ M40-02: Required navigation keys are present and distinct across locales (0.2137ms)
✔ M40-02: resolveOrbitLocale complies with ADR-0005 precedence and fails safe (0.8173ms)
✔ M40-02: Shell accessibility landmarks, skip link, and reduced motion (0.8087ms)
✔ M40-02: Monorepo isolation boundaries and zero private HQ imports (0.943ms)
✔ M40-01: @moonwitness/orbit package and boundary integrity (1.4225ms)
✔ M40-01: Next.js and web-config configuration integrity (0.4047ms)
✔ M40-01: Offline deterministic simulated fixtures (0.358ms)
✔ M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex (0.6546ms)
✔ M40-03: Zero external 3D model files in apps/orbit (100% procedural Three.js) (3.1094ms)
✔ M40-03: Dynamic import boundary with ssr: false (1.6041ms)
✔ M40-03: Every simulated fixture and 3D badge carries SIMULATED provenance (0.5823ms)
✔ M40-03: Deterministic two-way selection contract and safe fallback (0.255ms)
✔ M40-03: Approval handoff contract for WAITING_APPROVAL agent (0.4519ms)
✔ M40-03: Reduced motion compliance halts auto-rotation (0.5155ms)
✔ M40-03: Design token purity in spatial scene (0.1752ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 880.9282
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
Files scanned: 130 | Total Violations: 0
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
✓ Running next.config.mjs took 543ms
✓ Compiled successfully in 9.6s
  Running TypeScript ...
  Finished TypeScript in 43s ...
✓ Generating static pages using 4 workers (3/3) in 889ms
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
