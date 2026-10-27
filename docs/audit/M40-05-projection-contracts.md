# M40-05 — Typed Read-Only Agent/Task/Event Projection Contract Evidence

**Task ID:** `M40-05`  
**Task Title:** Typed read-only agent/task/event projection contract  
**Baseline SHA:** `007b7ac`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)  

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/tasks/M40/M40-05.md](../tasks/M40/M40-05.md), task `M40-05` delivers the typed read-only projection contract and data normalization engine for `@moonwitness/orbit`:

1. **Typed Projection Contracts ([`types.ts`](../../apps/orbit/src/lib/projections/types.ts)):**
   - Canonical read-only view models: `WorkstationProjection`, `AgentProjection`, `TaskProjection`, `TraceProjection`, and `OrbitStateProjection`.
   - Distinct typing for `ProvenanceType` (`'SIMULATED' | 'LIVE' | 'UNKNOWN'`), `FreshnessStatus` (`'FRESH' | 'STALE' | 'UNKNOWN'`), and `ConnectionStatus` (`'OFFLINE' | 'SIMULATED_LOCAL' | 'LIVE_CONNECTED' | 'UNAUTHORIZED' | 'UNKNOWN'`).

2. **Pure Projection Normalizer ([`operational-projection.ts`](../../apps/orbit/src/lib/projections/operational-projection.ts)):**
   - Pure function `projectOperationalState(rawInput, options)` that transforms raw feeds into strongly typed projections with zero SQL, database, or network side effects.
   - Fail-safe mapping: any corrupted or unrecognizable agent state, workstation status, or zone maps deterministically to `'UNKNOWN'`.
   - Primitive, null, or garbage inputs safely return a valid `OrbitStateProjection` with `connectionStatus: 'UNKNOWN'` without throwing runtime exceptions.

3. **Temporal Freshness Calculation:**
   - Pure function `calculateFreshness(timestamp, now, thresholdMs)`.
   - Accurately identifies fresh data ($< 60\text{s}$), stale data ($> 60\text{s}$), future clock drift ($> 300\text{s}$), and missing/malformed timestamps (evaluated truthfully to `'UNKNOWN'`).

4. **Honest Outage & Error Mapping:**
   - Maps HTTP 401/403 or `{ error: 'UNAUTHORIZED' }` to `connectionStatus: 'UNAUTHORIZED'` with an accompanying security audit trace.
   - Maps HTTP 503 or backend unreachable to `connectionStatus: 'OFFLINE'` with a warning trace.

5. **Credential Sanitization & Security Isolation:**
   - Pure recursive sanitizer `sanitizePayload()` strips/redacts any secret tokens matching `/(key|secret|token|password|auth|credential|cert)/i` from raw operational payloads.
   - Guarantees zero sensitive service keys or database credentials leak into client bundles or projection view models.

6. **Human Approval Preservation:**
   - Preserves `approvalPayload` (`action`, `requestedRole`, `reason`) on tasks requiring human-in-the-loop review for seamless handoff to `100CENTER` Headquarters without auto-approval bypass.

---

## 2. Verification Commands & Observed Results

### 1. ORBIT Test Suite (33/33 Passing)
```bash
pnpm --filter @moonwitness/orbit test
```
**Output:**
```
> @moonwitness/orbit@1.0.0 test Z:\project\moonradio\apps\orbit
> node --test test/*.test.mjs

✔ M40-04: isWebGLAvailable fails safe to false in server/test environments without throwing (1.2865ms)
✔ M40-04: OrbitWebGLFallback component exists and enforces accessible 2D layout (1.9533ms)
✔ M40-04: View mode switcher supports both 3D spatial and 2D accessible modes (0.5063ms)
✔ M40-04: Zero reliance on sound or audio triggers across ORBIT (1.1151ms)
✔ M40-04: Zero reliance on color alone: all status states convey explicit textual labels (0.4171ms)
✔ M40-04: Full keyboard accessibility attributes in 2D list and inspector (0.4874ms)
✔ M40-04: Responsive CSS rules for mobile breakpoints (390px, 768px) (0.343ms)
✔ M40-04: 3D performance and GPU memory disposal gates (0.5515ms)
✔ M40-02: orbitCatalog exposes identical complete key sets in English and Indonesian (1.7128ms)
✔ M40-02: Every key in both locales contains non-empty translated string (0.4567ms)
✔ M40-02: Required navigation keys are present and distinct across locales (0.17ms)
✔ M40-02: resolveOrbitLocale complies with ADR-0005 precedence and fails safe (0.8287ms)
✔ M40-02: Shell accessibility landmarks, skip link, and reduced motion (3.3338ms)
✔ M40-02: Monorepo isolation boundaries and zero private HQ imports (6.8507ms)
✔ M40-05: Positive projection of canonical simulated operations (1.0581ms)
✔ M40-05: Freshness calculation evaluates accurately across time thresholds (1.0802ms)
✔ M40-05: Fail-safe to UNKNOWN on malformed and primitive inputs without throwing (0.9314ms)
✔ M40-05: Corrupt entity states map deterministically to UNKNOWN (0.4015ms)
✔ M40-05: Unauthorized response mapping with security trace (0.2368ms)
✔ M40-05: Service outage response mapping with offline trace (0.1738ms)
✔ M40-05: Credential sanitization isolates secrets from client projection (0.5963ms)
✔ M40-05: Approval payload preservation for human-in-the-loop governance (0.2427ms)
✔ M40-01: @moonwitness/orbit package and boundary integrity (1.5599ms)
✔ M40-01: Next.js and web-config configuration integrity (0.638ms)
✔ M40-01: Offline deterministic simulated fixtures (0.4171ms)
✔ M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex (0.7325ms)
✔ M40-03: Zero external 3D model files in apps/orbit (100% procedural Three.js) (4.5399ms)
✔ M40-03: Dynamic import boundary with ssr: false (0.5635ms)
✔ M40-03: Every simulated fixture and 3D badge carries SIMULATED provenance (1.3598ms)
✔ M40-03: Deterministic two-way selection contract and safe fallback (0.4062ms)
✔ M40-03: Approval handoff contract for WAITING_APPROVAL agent (0.4759ms)
✔ M40-03: Reduced motion compliance halts auto-rotation (0.8631ms)
✔ M40-03: Design token purity in spatial scene (0.3387ms)
ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 252.178
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
✓ Compiled successfully in 1648ms
  Running TypeScript ...
  Finished TypeScript in 7.1s ...
✓ Generating static pages using 4 workers (3/3) in 788ms
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
