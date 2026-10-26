# M04-06 — Schema Upgrade Failure and Rollback Test

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-06
- **Status**: VERIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Scenario: Malformed Migration Simulation

To test resilience against failed schema migrations:
1. An intentional faulty DDL migration was introduced (syntax error midway through a multi-table alter script).
2. The migration was executed inside an automated migration runner.

---

## 2. Test Execution & Rollback Behavior

1. **Transactional Safety Check**:
   - PostgreSQL executes DDL within transactions (`BEGIN ... COMMIT`).
   - When the malformed statement failed (`syntax error at or near 'INVALID_KEYWORD'`), the transaction aborted immediately.
   - `ROLLBACK` was triggered automatically by the migration runner.

2. **Database Integrity Verification**:
   - `SELECT * FROM stations;` succeeded without partial changes.
   - All tables remained readable by Fastify Hub.
   - No table was left in a locked or orphaned state.

---

## 3. Failure Recovery Procedure (When Not Fully Transactional)

In rare cases where external locks or non-transactional operations cause corruption:
1. Stop application: `docker compose stop radio headquarters dock`.
2. Re-apply the pre-migration snapshot:
   ```bash
   docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d "$POSTGRES_DB" /backups/pre-migration.dump'
   ```
3. Restart application: `docker compose up -d`.
4. Prior station streaming and playlogs remain 100% intact.
