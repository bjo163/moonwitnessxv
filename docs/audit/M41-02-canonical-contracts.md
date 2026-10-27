# M41-02 — LUMEN Canonical Contracts Evidence

**Task ID:** `M41-02`  
**Task Title:** Specify canonical run, step and event contracts  
**Baseline SHA:** `04533ab27b765f198c4449022b04f2a83f17b902`  
**Date:** 2026-10-27  
**Worker:** AI Pair Programmer  
**Reviewer:** Root Integrator  
**Status:** CLOSED (`- [x]`)

---

## 1. Summary of Deliverables

Under task `M41-02`, the canonical data models, state machines, and contract validators for LUMEN have been formalized:

1. **Architecture Contract:** [`docs/architecture/LUMEN_CONTRACTS.md`](../architecture/LUMEN_CONTRACTS.md) specifies domain isolation, run state machines (`QUEUED` $\rightarrow$ `CLAIMED` $\rightarrow$ `RUNNING` $\rightarrow$ `COMPLETED`/`FAILED`/`CANCELLED`), fenced lease tokens, monotonic `fencingEpoch`, bounded 256 KB step payload limits, cryptographic SHA-256 argument binding for human approvals, and semver checkpoint compatibility.
2. **State & Contract Validator:** [`scripts/lumen/contract-validator.mjs`](../../scripts/lumen/contract-validator.mjs) provides programmatic verification of state transitions, lease fencing, step payload limits, and approval validation.
3. **Automated Test Suite:** [`test/lumen/contracts.test.mjs`](../../test/lumen/contracts.test.mjs) validates positive transitions and adversarial negative rejection conditions.

---

## 2. Verification Commands & Observed Results

### Test Execution
```bash
node --test test/lumen/contracts.test.mjs
```

### Observed Output
```
✔ positive: valid run lifecycle transitions, monotonic lease fencing, step hashing and approval resume (2.6077ms)
✔ negative: reject illegal state transitions, terminal escapes, stale fencing, expired leases, tampered approvals, and oversize payloads (1.9749ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 197.8361
```

- **Positive Proof:** Validated complete lifecycle progression through `QUEUED`, `CLAIMED`, `RUNNING`, `PAUSED_APPROVAL`, and terminal `COMPLETED`; confirmed monotonic fencing epoch incrementation; verified step hashing; proved exact approval resume matching.
- **Negative Proof:** Rejects illegal transitions (e.g. `QUEUED` to `COMPLETED`), attempts to escape terminal states, stale fencing epochs, expired worker leases, oversized step payloads (>256 KB), tampered approval arguments, expired approval tokens, and incompatible major checkpoint semver versions.

---

## 3. Changed Paths

- `docs/architecture/LUMEN_CONTRACTS.md` (contract specification)
- `scripts/lumen/contract-validator.mjs` (state machine and validator)
- `test/lumen/contracts.test.mjs` (test suite)
- `docs/audit/M41-02-canonical-contracts.md` (this evidence document)
- `TODO.md` (updated M41-02 status)

---

## 4. Rollback and Limitations

- **Rollback Procedure:** Remove the four created paths; preserve all unrelated working tree files.
- **Limitations:** Contracts and validation logic only; does not implement package scaffolding (`M41-03`), core execution loop (`M41-04`), or AI Gateway adapters (`M41-06`).
- **Next Eligible Task:** **M41-03** (`Scaffold reusable LUMEN framework package`).
