# M39-08 — ECHOLOG content-addressed filesystem driver

| Field | Evidence |
|---|---|
| `task_id` | M39-08 |
| `baseline_sha` | `695db15ba433b386243c8c56521c22274c5ddefe` (`dev`, task start) |
| `result_sha` | `6f3b798d08ae59d5636842e9921f390a1e22a7f4` |
| `actual_changed_files` | `packages/echolog-core/{package.json,src/index.ts,src/sidecar.ts,src/driver/fs.ts}`; `apps/echolog/src/modules/objects/service.ts`; `apps/echolog/test/fs-driver.test.ts`; lockfile integration |
| `reviewer` | Integrator |
| `rollback` | Remove the ECHOLOG filesystem root and revert the driver/service changes. Test roots are temporary and removed by the tests. |

## Positive and negative evidence

- `pnpm install --frozen-lockfile --ignore-scripts` passed after the core `@types/node` dependency and workspace lock entries were integrated.
- `pnpm --filter @moonwitness/echolog-core build` and `pnpm --filter @moonwitness/echolog-core typecheck` passed.
- `pnpm --filter @moonwitness/echolog build` and `pnpm --filter @moonwitness/echolog typecheck` passed.
- `pnpm --filter @moonwitness/echolog test` passed 12/12. Cases cover duplicate bytes and first-sidecar immutability, interrupted uploads leaving no visible object or temp file, legal hold and active-retention refusal/reporting, quota refusal, expiry deletion, orphan cleanup, same-size corruption detection, and malformed/non-content-addressed keys.
- `pnpm exec eslint` over the changed ECHOLOG/core/SKYLINK files and the moved topology test passed after the ARSY test override was updated.
- `rg -n "drizzle-orm|postgres" apps/echolog packages/echolog-core/src` returned no matches.

## Security, rights and limitations

The key and bytes are verified as `sha256/<hex>`; reads re-hash bytes and reject same-size corruption. Sidecars are created only after object data is synced and atomically renamed within the same root filesystem. Duplicate uploads preserve the first metadata. ECHOLOG still owns no SQL tables, and this task adds no REST/auth surface or rights/consent decision.

The quota lock serializes commits within one driver instance, not across processes. Tests ran on the local Windows filesystem; multi-process quota contention and power-loss durability were not verified. Production durability remains tied to the configured volume, as ADR-0007 records. M39-09 owns HTTP/auth/limits.

