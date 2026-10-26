# M04-02 — Non-Additive Migration & Rollback Plan

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-02
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Limitations of MoonQL `autoSync`

`MOONQL_AUTOSYNC=true` provides automatic, non-destructive additive DDL updates during boot:
- Adds missing tables declared in addons.
- Adds missing columns declared in model definitions.
- Creates declared single and composite indexes.

**What `autoSync` NEVER does**:
- Does **not** drop tables or views.
- Does **not** drop columns or alter column types (e.g., widening/narrowing varchar or changing nullable constraints).
- Does **not** execute data migrations (e.g., splitting a field, copying data across schemas, or populating new non-nullable defaults).

---

## 2. Formal Non-Additive Schema Migration Lifecycle

For any schema change involving column deletion, renaming, or type narrowing:

1. **Step 1: Expand Phase (Additive)**:
   - Add the new column/table alongside the legacy one via MoonQL model definitions.
   - Deploy code that dual-writes to both legacy and new structures.
   - Run background backfill script to sync historical data.

2. **Step 2: Switch Phase**:
   - Update readers to read from the new structure.
   - Verify zero errors and consistent query performance.

3. **Step 3: Contract Phase (Destructive / Non-Additive)**:
   - Generate manual SQL migration file via `pnpm db:generate`.
   - Explicitly review the generated `.sql` file in PR review.
   - Every destructive migration MUST include a corresponding `rollback.sql` script.

---

## 3. SQL Rollback Procedure

Before applying non-additive changes:
1. Trigger an on-demand snapshot: `docker compose exec backup sh /backup.sh manual-pre-migration`.
   The sidecar's interval loop and this one-shot are the same script
   (`scripts/db-backup.sh`), so a manual snapshot carries the same write-to-`.part`
   then rename discipline as an automatic one; it prints the committed path.
2. Apply migration within an explicit transaction:
   ```sql
   BEGIN;
   -- destructive migration steps
   COMMIT;
   ```
3. If an error occurs:
   ```sql
   ROLLBACK;
   ```
   Or execute `rollback.sql` to reconstruct dropped structures from the snapshot backup.
