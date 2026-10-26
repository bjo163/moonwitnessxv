# M39-09 audit — ECHOLOG REST and authorization

- **Task:** M39-09, P0 leaf; prerequisite M39-08 is closed and ADR-0007 was ratified by the owner.
- **Baseline:** `37517ca` (ECHOLOG work started from the integrated M39-08 baseline).
- **Result:** `2112622aaac679aeffac475781f168cec49a7ad7`.
- **Worker/reviewer:** ECHOLOG REST/auth agent; integrator reviewed readiness semantics and added a storage write probe plus readiness regression test.
- **Changed paths:** `apps/echolog` REST/config/auth/grants/limits/tests, `packages/echolog-core/src/driver/fs.ts`, ECHOLOG env contract and `.env.example`.
- **Positive evidence:** `pnpm --filter @moonwitness/echolog test` — 17/17 passed; build passed; typecheck passed; `pnpm --filter @moonwitness/arsy exec tsx --test test/env-contract.test.ts` — 9/9 passed. Routes cover upload, metadata, grant/download, delete and GC using a real in-process MoonQL auth addon.
- **Negative evidence:** tests cover anonymous/invalid/expired auth (401), over-size (413), unsupported MIME (415), held delete (409), tampered grant, and absent/wrong session. Captured logs contain no test token, grant URL or body. Readiness now creates, syncs and removes a unique temp probe; an invalid storage-root path yields 503.
- **Security/rights/privacy:** secrets remain blank placeholders in `.env.example`; production requires separately configured secrets. No deployed ARSY instance or real external session was exercised. No storage bytes, credentials or grants are logged in tested requests.
- **Reviewer/rollback:** integrator; revert routes and restore the previous ECHOLOG service while retaining the independently introduced storage driver.
- **Limitations/next:** filesystem behavior is locally tested; no S3 target was exercised. M39-10 is eligible after this leaf. Multi-process quota/power-loss behavior remains unverified.
