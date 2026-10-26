# M38-08 — D18 store, migrations and SQL-owner guard

| Field | Evidence |
|---|---|
| `task_id` | M38-08 |
| `baseline_sha` | `2fb01a2f121efce7f00602c36949082d503b9524` (`dev`, task start) |
| `result_sha` | `789afa8bca2bc0d1965cc46f322e47e85c5a72dc` |
| `actual_changed_files` | `packages/skylink-store/{package.json,tsconfig.json,drizzle.config.ts,src/*,migrations/*,test/store-pg.test.mjs}`; `apps/radio/test/workspace-topology.test.ts` |
| `reviewer` | Integrator |
| `rollback` | Drop only the `skylink` schema and revert the package/guard changes; MoonQL schema and data remain separately owned. |

## Positive evidence

- `pnpm --filter @moonwitness/skylink-store build` and `pnpm --filter @moonwitness/skylink-store typecheck` passed.
- `pnpm --filter @moonwitness/skylink-store test` passed: one local PostgreSQL integration test. It migrated `skylink` up, created a channel account/conversation/message, read the message, rejected page limits above 100, dropped the owned schema, and confirmed it was absent. The test does not print the local `DATABASE_URL`.
- `pnpm --filter @moonwitness/radio exec tsx --test test/workspace-topology.test.ts` passed 6/6, including the SQL-owner guard.
- On a disposable local database, `pnpm --filter @moonwitness/skylink-store db:migrate` followed by `pnpm db:push` left the `skylink` table snapshot identical: `__drizzle_migrations`, `channel_accounts`, `conversations`, `delivery_attempts`, `messages`. The disposable database was removed. MoonQL output was `[✓] Pulling schema from database...` and `[✓] Changes applied`.
- The negative mutation added a temporary third package importing `drizzle-orm`; after its manifest met package-standard checks, the guard failed only the SQL-owner assertion (5 passed, 1 failed) and listed `packages/m38-08-sql-import-probe` as the third importer. The probe was removed.
- Integrator ran `pnpm --filter @moonwitness/skylink-store build` and the topology test again; build exited 0 and topology passed 6/6.

## Security, rights and limitations

`channel_accounts.auth_ref` stores only a reference. SQL access is limited to `@moonwitness/moonql` and `@moonwitness/skylink-store`; ECHOLOG remains outside that set. `schemaFilter: ['skylink']` is package-owned. The migration emits a benign PostgreSQL NOTICE because the runner creates the schema before Drizzle checks it. Integration evidence used local PostgreSQL; it does not establish production deployment or rollback behavior outside the disposable/local environment.

## Exact commands and negative output

The package test command is `node --env-file-if-exists=../../.env --test test/*.test.mjs`, invoked through `pnpm --filter @moonwitness/skylink-store test`. The SQL-owner mutation yielded:

```text
EXPECTED NEGATIVE: guard rejected only the temporary third SQL importer.
ℹ tests 6
ℹ pass 5
ℹ fail 1
actual: [ 'packages/m38-08-sql-import-probe', 'packages/moonql', 'packages/skylink-store' ]
```

