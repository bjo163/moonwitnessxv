# M37-05 — Cross-app token expiry and role-isolation evidence

**Verification audit · revalidated on dev baseline `7f1c06d7defcdbb3a7bc5049e8ddd1624c27f5a6` · no live SSO or deployment test.** This task verifies the current server-side boundary shared by Headquarters and ORBIT: ARSY session confirmation, server-side role/ACL checks, fail-closed expiry/outage behavior, and no browser-visible credential. Tests use deterministic local adapters/stubs and synthetic markers only.

## Integrated test coverage change

`package.json` now includes `apps/headquarters/test/hq-authz-guard.test.ts` in the root `pnpm test` command. This keeps the role/ACL isolation regression in the suite CI runs. It is an additive test-command change only; no production route, identity policy, or role behavior changed.

## Targeted positive evidence

| Command | Result | Scope |
|---|---|---|
| `pnpm --filter @moonwitness/orbit test` | 43 passed, 0 failed | Includes M40-06 runtime binding: ARSY 401/403 maps to `UNAUTHORIZED`, secrets are sanitized, and BFF contract prevents credential leakage into browser code. |
| `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/session-auth.test.ts ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts ../../apps/headquarters/test/hq-authz-guard.test.ts` | 38 passed, 0 failed | Root test-command slice now includes HQ authz guard coverage. HQ middleware cookie presence is not identity; forged/expired opaque cookie is rejected by Hub; role mismatch and unpublished/missing ACL deny; valid admin subject to ACL allows; 503/unreachable stays unavailable; denial responses omit credential/identity. |
| `pnpm --filter @moonwitness/headquarters typecheck` | Exit 0 | HQ source typecheck. |

## Negative/fail-safe cases observed

- Expired/forged HQ token marker: ARSY 401 becomes anonymous/redirect; no protected record is fetched.
- Authenticated viewer on admin-only model/view/endpoint: forbidden before privileged data reads.
- Missing or unpublished ACL/endpoint: forbidden, including for an admin; HQ does not guess policy.
- ARSY 503 or fetch error: explicit unavailable, not anonymous success or cached authorization.
- ORBIT receives 401/403: `UNAUTHORIZED`; credential-like values are sanitized from the projection and are not sent to the browser BFF response.

## Review and security boundaries

Tests use local deterministic stubs and obviously synthetic cookie values; no credential, external endpoint, production account, network identity provider, or private witness content was used. HQ and ORBIT do not own identity or role stores; ARSY/D00 supplies identity and the published MoonQL ACL is evaluated by the shared `can()` matcher.

This is not browser end-to-end proof, production SSO, cross-domain cookie exchange, TLS/proxy validation, live session revocation, real tenant/object isolation, or deployed deployment evidence. No local package test script exists in HQ; the actual HQ test files are invoked via the existing ARSY workspace's `tsx` runner. Initial attempts `pnpm --filter @moonwitness/headquarters test` (script absent) and root `pnpm exec tsx` (binary absent) failed before assertions; they are not counted as passing tests.

An earlier complete root `pnpm test` attempt after the script change stopped in Dock before reaching later packages: an existing local server on port 3001 blocked the offline landing probe, and the then-dirty Dock worktree made one `relation-inspector.test.mjs` text assertion stale. The assertion was subsequently updated in Dock commit `7f1c06d`; this M37-05 worker did not rerun the full root suite. The exact integrated commit still requires CI before TODO closure.

Independent reviewer approved the bounded auth/session evidence, the added root test-command wiring, and the documented limitations.

## Rollback

Rollback removes the `hq-authz-guard.test.ts` argument from the root `package.json` test script and deletes this audit file after checking references. No application route, identity, or ACL behavior changes.

## Current verification state

- Re-ran the targeted HQ slice on baseline `7f1c06d` with the package-script edit: 38/38 passed. `pnpm --filter @moonwitness/headquarters typecheck` exited 0. The earlier ORBIT 43/43 run is retained as separate corroborating evidence; M37-05 did not modify ORBIT.
- Before M37-05 integration, `package.json` and this audit were worktree-only. The test-chain integration is present at exact source SHA `91d844da7da5ba2c53126f9c7731b47e9af492b2`; CI run `40507170705` passed full verification at that SHA and guarded-promoted it to `main`. The root suite includes the HQ 38-test and ORBIT 43-test slices recorded above.
- CI run `40476362621` at `bd11cf2` predates the package-script change and is not evidence for it. The failed full-suite attempt described above also predates Dock commit `7f1c06d` and did not validate the integrated source. The passing exact-SHA CI above supersedes that incomplete attempt for M37-05; it still does not prove live SSO or deployment.
