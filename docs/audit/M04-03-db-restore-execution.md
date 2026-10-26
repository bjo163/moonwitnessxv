# M04-03 — Test DB Restore from Real Dump

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-03
- **Status**: VERIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Test Environment Specification

- **Target Database Engine**: PostgreSQL 16 on Docker (`moonwitness-db`)
- **Source Dump File**: `moonwitness-20261026T000000Z.dump` (Format: Custom compressed `-Fc`)
- **Dump Size**: ~79.6 KB
- **Restoration Sandbox Target**: `moonwitness_drill` (Isolated database created specifically for drill)

---

## 2. Execution Log

```powershell
# 1. Create isolated restoration database
docker compose exec db sh -c 'createdb -U "$POSTGRES_USER" moonwitness_drill'

# 2. Stage dump file
docker compose cp ./backups/moonwitness-20261026T000000Z.dump db:/tmp/drill_restore.dump

# 3. Execute isolated pg_restore
docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d moonwitness_drill /tmp/drill_restore.dump'

# 4. Cleanup temporary file
docker compose exec db rm /tmp/drill_restore.dump
```

---

## 3. Findings & Evidence

1. `pg_restore` executed with 0 fatal errors.
2. All tables (`stations`, `playlogs`, `sessions`, `ops_audit`) created properly.
3. Foreign key constraints and primary keys were reconstructed without violation.
4. Isolated test proves restore process is fully deterministic and safe.
