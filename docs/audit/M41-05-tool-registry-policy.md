# M41-05 — Typed Tool Registry & Policy Enforcement Evidence

**Task ID:** `M41-05`  
**Task Title:** Implement typed tool registry and policy enforcement  
**Baseline SHA:** `04533ab27b765f198c4449022b04f2a83f17b902`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)

---

## 1. Summary of Deliverables

Under task `M41-05`, the typed allowlisted tool registry and pre-execution policy boundary for `@moonwitness/lumen` have been implemented:

1. **Tool Registry Class:** [`packages/lumen/src/tool-registry.ts`](../../packages/lumen/src/tool-registry.ts) implements `ToolRegistry` implementing `ToolRegistryPort`.
2. **Policy & Least-Privilege Invariants:**
   - Tools expose stable ID, version, description, side-effect class (`READ_ONLY`, `IDEMPOTENT_MUTATION`, `CONSEQUENTIAL_MUTATION`), required capabilities, and approval requirement.
   - Evaluates capabilities strictly against trusted owner-supplied `context.capabilities`. Prompt text or model-generated arguments can never elevate tool permissions.
   - Denies unknown tools and missing permissions by default (`UNKNOWN_TOOL`, `PERMISSION_DENIED`).
   - Validates arguments against parameter type and custom validator constraints (`MALFORMED_TOOL_ARGUMENTS`).
   - Rejects direct execution of tools requiring human approval (`APPROVAL_REQUIRED`).
3. **Automated Test Suite:** [`packages/lumen/test/tool-registry.test.mjs`](../../packages/lumen/test/tool-registry.test.mjs) verifies positive tool execution and 7 negative threat / rejection conditions.

---

## 2. Verification Commands & Observed Results

### Test Execution
```bash
pnpm --filter @moonwitness/lumen test
```

### Observed Output
```
> @moonwitness/lumen@0.1.0 test Z:\project\moonradio\packages\lumen
> pnpm build && node --test test/**/*.test.mjs

✔ positive: agent loop finishes directly when model returns final answer (5.9818ms)
✔ positive: agent loop executes allowlisted tool and continues to final completion (0.5751ms)
✔ negative: reject unknown tool proposed by model (0.4018ms)
✔ negative: stop when max iterations exhausted (0.5679ms)
✔ negative: stop with CANCELLED on AbortSignal (0.2863ms)
✔ negative: pause run when tool requires human approval (0.4051ms)
✔ positive: @moonwitness/lumen exports documented public entries and ports (11.7711ms)
✔ negative: importing package causes no network/timer/server side effects and rejects invalid inputs (1.6006ms)
✔ positive: registered tool passes schema check and executes under trusted capabilities (2.0398ms)
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass (2.2512ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10173.7471
```

---

## 3. Changed Paths

- `packages/lumen/src/tool-registry.ts`
- `packages/lumen/src/index.ts`
- `packages/lumen/test/tool-registry.test.mjs`
- `docs/audit/M41-05-tool-registry-policy.md` (this evidence document)
- `TODO.md` (updated M41-05 status)

---

## 4. Rollback and Limitations

- **Rollback Procedure:** Remove `packages/lumen/src/tool-registry.ts` and its test, revert `packages/lumen/src/index.ts`, and revert `M41-05` in `TODO.md`.
- **Limitations:** Defines typed registry and policy enforcement logic; does not provide arbitrary shell, OS, or unrestricted network tools in v1.
- **Next Eligible Task:** **M41-06** (`Add the existing AI Gateway adapter`).
