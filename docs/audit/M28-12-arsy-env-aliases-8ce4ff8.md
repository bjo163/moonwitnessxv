# M28-12 audit — fail-closed ARSY and legacy Radio aliases

- **Task:** M28-12, P0 leaf; M28-11 prerequisite closed at `2112622aaac679aeffac475781f168cec49a7ad7`.
- **Baseline:** `f5422c0612aab0b2957f33c21320fab554d3bdee`.
- **Result:** `8ce4ff8914d4427747b5dbf8cbdd02b5ba9d46ce`.
- **Worker/reviewer:** ARSY config agent; integrator reviewed changes and evidence.
- **Changed files:** `.env.example`, `apps/arsy/src/config.ts`, config alias/env/web-kit tests, `apps/sentinel/src/index.ts`, and `packages/moonql-client/src/web.ts`.
- **Behavior:** preferred `ARSY_*` values precede legacy `RADIO_*` then generic defaults; any simultaneously configured aliases must match exactly. URL consumers use the shared client resolver.
- **Positive evidence:** alias, web-kit and env-contract tests passed 18/18; ARSY, Sentinel and moonql-client builds passed; source-only ARSY TypeScript and package typechecks passed; targeted ESLint passed.
- **Negative evidence:** tests verify conflicting ARSY/RADIO aliases throw; legacy-only and identical dual values resolve deterministically.
- **Limitations:** full ARSY test-project typecheck remains blocked by existing cross-app `rootDir` and test diagnostics; source build/source-only checks pass. No deployment claim.
- **Rollback/next:** revert this commit to restore prior alias behavior. M28-13 is eligible after M22-07 (already closed); the parent M28-05 remains subject to its own full acceptance.
