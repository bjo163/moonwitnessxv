# Audit Report: M41-09 — Build standalone internal worker application

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-09
**Reviewer:** Owner Review & Monorepo Runtime Boundary Reviewer

---

## 1. Summary of Changes

Created and verified **`apps/lumen-runtime`** (`@moonwitness/lumen-runtime`), the dedicated internal worker application that executes LUMEN single-agent runs without exposing public business endpoints or violating database ownership boundaries:
1. **Worker Lifecycle Engine:** Implemented `LumenWorker` in `apps/lumen-runtime/src/worker.ts`. Supports lifecycle transitions (`INITIALIZING` $\rightarrow$ `READY` $\rightarrow$ `RUNNING` $\rightarrow$ `STOPPING` $\rightarrow$ `STOPPED`), graceful signal handling (`SIGINT`/`SIGTERM`), cooperative `AbortController`, and bounded worker concurrency (`maxConcurrency: 1`).
2. **Internal Readiness Inspection:** `getReadiness()` reports internal worker health, uptime, and active execution status separately from upstream ARSY/Gateway infrastructure.
3. **No Database or API Violations:** The worker owns zero SQL tables, has no direct connection to PostgreSQL, uses no Redis/extra queue, and exposes no public task creation or management endpoints.
4. **Monorepo Structure:** Configured `apps/lumen-runtime/package.json` and `tsconfig.json` extending root `tsconfig.base.json` with workspace references to `@moonwitness/lumen`.
5. **Separate Lifecycle Tests:** Built isolated positive and negative suite in `apps/lumen-runtime/test/worker-lifecycle.test.mjs` verifying startup, run claim under monotonic lease, allowlisted tool execution, checkpoint persistence, graceful shutdown, and rejection of unauthorized tools or missing config.

---

## 2. Package Scripts & Commands

- **Build:** `pnpm --filter @moonwitness/lumen-runtime build` (`tsc -b`)
- **Test:** `pnpm --filter @moonwitness/lumen-runtime test` (`node --test test/**/*.test.mjs`)
- **Typecheck:** `pnpm --filter @moonwitness/lumen-runtime typecheck` (`tsc --noEmit`)
- **Start:** `node dist/index.js`

---

## 3. Test Verification & Results

Suite executed:
`pnpm --filter @moonwitness/lumen-runtime test`

Results:
```
✔ positive: runtime starts with fake adapters, claims fixture, executes run, stops gracefully and reports readiness (4.9097ms)
✔ negative: rejects missing config, unauthorized tools, unavailable ARSY, and enforces concurrency bounds (1.463ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ duration_ms 10135.145
```

Suite executed:
`pnpm --filter @moonwitness/lumen test` (19/19 pass)

---

## 4. Boundary Confirmation

- Local test execution proves worker correctness; no production deployment or live network claim is made.
- Worker liveness is strictly partitioned from upstream gateway and ARSY availability.
