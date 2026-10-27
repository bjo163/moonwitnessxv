# M40-01 — Scaffold Standalone ORBIT Workspace and Build Boundary Evidence

**Task ID:** `M40-01`  
**Task Title:** Scaffold standalone ORBIT workspace and build boundary  
**Baseline SHA:** `04533ab27b765f198c4449022b04f2a83f17b902`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)  

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/milestones/M40.md](../milestones/M40.md), task `M40-01` scaffolds the standalone Next.js frontend workspace **`apps/orbit`** (`@moonwitness/orbit`) within the MoonWitness XV monorepo:

1. **Workspace Manifest:** [`apps/orbit/package.json`](../../apps/orbit/package.json) establishes `@moonwitness/orbit` with private workspace boundaries, Next.js 16.4.3, React 19, `@moonwitness/moonui`, `@moonwitness/core`, and `@moonwitness/web-config`. Scripts provide independent `dev` (port 3007), `build`, `start` (port 3007), `typecheck` (`tsc --noEmit`), and `test` (`node --test test/*.test.mjs`).
2. **TypeScript & Bundler Setup:** [`apps/orbit/tsconfig.json`](../../apps/orbit/tsconfig.json) configures bundler module resolution, path alias `@/*` -> `./src/*`, and strict typechecking without emitting.
3. **Security Headers & Environment:** [`apps/orbit/next.config.mjs`](../../apps/orbit/next.config.mjs) applies centralized non-framing security headers and root `.env` loading from `@moonwitness/web-config`.
4. **Deterministic Simulated Fixtures:** [`apps/orbit/src/fixtures/simulated-operations.ts`](../../apps/orbit/src/fixtures/simulated-operations.ts) supplies structured workstation, agent, and task records with explicit `provenance: 'SIMULATED'` and `connectionStatus: 'SIMULATED_LOCAL'`, enabling development when ARSY is offline.
5. **MoonUI Layout & Page Shell:** [`apps/orbit/src/app/layout.tsx`](../../apps/orbit/src/app/layout.tsx), [`apps/orbit/src/app/globals.css`](../../apps/orbit/src/app/globals.css), and [`apps/orbit/src/app/page.tsx`](../../apps/orbit/src/app/page.tsx) render the initial ORBIT shell. It provides an explicit `SIMULATED` badge, a spatial viewport boundary container for downstream M40-03 WebGL integration, and an accessible 2D operations inspector grid (workstations, agent loops, task queues, audit traces). Strict token purity is enforced: zero rogue hardcoded hex.
6. **Central Integrations:**
   - [`scripts/dev.mjs`](../../scripts/dev.mjs) updated with `orbit` on port **3007** (`ORBIT_PORT=3007`).
   - [`package.json`](../../package.json) updated with `"dev:orbit"`, `"start:orbit"`, and included in `"build:web"` and `"test"`.
   - [`packages/eslint-config/src/index.js`](../../packages/eslint-config/src/index.js) updated to cover `apps/orbit/**/*.tsx` in React hooks linting.
   - [`scripts/check-ui-consistency.mjs`](../../scripts/check-ui-consistency.mjs) updated to enforce `@moonwitness/moonui` adoption and zero hex drift across `apps/orbit`.
7. **Automated Verification:** [`apps/orbit/test/orbit-shell.test.mjs`](../../apps/orbit/test/orbit-shell.test.mjs) validates package metadata, script ports, absence of database/SQL drivers (`drizzle-orm`, `postgres`, `pg`), simulated fixture provenance, and token purity.

---

## 2. Boundaries and Non-Goals Verified

- **Zero SQL/Database Owners:** No `drizzle-orm`, `postgres`, `pg`, `sqlite`, or database migration is added.
- **Zero Backend/Hub Duplication:** ORBIT is strictly a read-only frontend observation surface; it does not introduce an AI executor, background worker, or API server.
- **Truthful State:** Fixtures explicitly declare `provenance: 'SIMULATED'` and `status: 'STANDALONE'`. No simulation is disguised as `LIVE`.
- **Accessible Fallback:** All critical operations are rendered in an accessible 2D grid that requires zero WebGL, hover, or motion.

---

## 3. Verification Commands & Observed Results

### Unit Tests
```bash
pnpm --filter @moonwitness/orbit test
```
**Output:**
```
> @moonwitness/orbit@1.0.0 test Z:\project\moonradio\apps\orbit
> node --test test/*.test.mjs

✔ M40-01: @moonwitness/orbit package and boundary integrity (1.4996ms)
✔ M40-01: Next.js and web-config configuration integrity (0.6069ms)
✔ M40-01: Offline deterministic simulated fixtures (0.3747ms)
✔ M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex (0.5809ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 255.9462
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
> @moonwitness/orbit@1.0.0 build Z:\project\moonradio\apps\orbit
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.mjs took 35ms

  Creating an optimized production build ...
✓ Compiled successfully in 3.6s
  Running TypeScript ...
  Finished TypeScript in 2.4s ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 557ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
# Exit code 0
```

### Central UI Consistency Check
```bash
pnpm ui:check
```
**Output:**
```
═══════════════════════════════════════════════════════════════════════
   🌙 MOONWITNESS MONOREPO UI CONSISTENCY & HARDCODE ENFORCER       
═══════════════════════════════════════════════════════════════════════
Scanning monorepo apps for design system adoption & token purity...

📦 CHECK 1: UI Surfaces Consuming @moonwitness/moonui
  ✔ PASS: apps/orbit/src/app/page.tsx (and all other 16 surfaces)

🎨 CHECK 2: Rogue Hex Color Drift & Design Token Violations
  ✔ PASS: All inspected apps adhere 100% to Moon design tokens. Zero color drift detected!

🧩 CHECK 3: Duplicate Component Classes in App Stylesheets
  ✔ PASS: No duplicate component classes detected in local app stylesheets.

🔤 CHECK 4: Font & Typography Consistency
  ✔ PASS: All typography uses standardized font design tokens.

Files scanned: 119 | Total Violations: 0
✨ Monorepo UI consistency check PASSED!
```

### Central ESLint Gate
```bash
pnpm exec eslint apps/orbit
```
**Output:**
```
# Exit code 0 (0 errors, 0 warnings)
```

### Web Build Chain (`pnpm build:web`)
```bash
pnpm build:web
```
**Output:**
`@moonwitness/headquarters`, `@moonwitness/dock`, and `@moonwitness/orbit` all compiled and generated static pages successfully (Exit code 0).

---

## 4. Rollback Plan

To revert task `M40-01`:
1. Remove `apps/orbit` directory.
2. Revert edits to `scripts/dev.mjs`, `package.json`, `packages/eslint-config/src/index.js`, and `scripts/check-ui-consistency.mjs`.
3. Run `pnpm install` to unlink `@moonwitness/orbit`.
4. Delete `docs/tasks/M40/M40-01.md` and this audit document.
