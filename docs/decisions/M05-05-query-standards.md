# M05-05 — Pagination, Filter/Expand, Locale and UNKNOWN Query Standards

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-05
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Query Bounds Enforcement

1. **Upper Bound on ?limit**:
   - Every model has `maxLimit` (default 200, stations 100).
   - Any query requesting `?limit=1000` is automatically clamped to `maxLimit` to prevent denial-of-service memory exhaustion.

2. **Bounded Expand**:
   - `expand` on `m2o` relations resolves only the parent record.
   - `expand` on `o2m` relations is strictly capped (default 50 children per parent) to prevent runaway join query expansion.

3. **Locale & UNKNOWN Values**:
   - Unrecognized enum values or unsupported locale filters must not throw unhandled 500 errors.
   - Safe fallbacks: default locale (`id-ID` / `en-US`), and unknown values serialize cleanly as `null` or explicit UNKNOWN indicator.
