# M04-01 — Production PostgreSQL Requirement vs Memory Fallback

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-01
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Context & Danger of Accidental Ephemeral Storage

MoonQL supports two execution backends:
1. `packages/moonql/src/engines/pg.ts` (PostgreSQL / Drizzle-backed persistent store).
2. `packages/moonql/src/engines/memory.ts` (In-memory JavaScript Map store).

In development mode, `DATABASE_URL` is optional. When absent, MoonQL defaults gracefully to `memory` so developers can run unit tests and smoke tests without launching Docker.

However, in production:
- Running `memory` means that every container restart, OOM kill, or deployment wipes all dynamic stations, telemetry, listening sessions, and audit records.
- Silent fallback to `memory` when PostgreSQL is temporarily unavailable is an **anti-pattern** that causes silent data loss.

---

## 2. Hard Verification Rules

1. **Strict Production Environment Check**:
   - When `NODE_ENV === 'production'`, `DATABASE_URL` is **mandatory**.
   - If `DATABASE_URL` is missing or invalid in production, the application **MUST crash immediately with exit code 1** during the boot phase.
   - Fallback to in-memory engine is strictly forbidden when `NODE_ENV === 'production'`.

2. **Connection Readiness Gate**:
   - In production, MoonQL must execute a verification ping (`SELECT 1`) against PostgreSQL before mounting API routes.
   - If the connection fails within the retry window (max 3 retries, 5000ms timeout), boot must abort with an explicit error log: `FATAL: Database connection failed in production. Refusing to start with ephemeral storage.`

3. **Docker Compose & Deployment Enforcements**:
   - `docker-compose.yml` must explicitly pass `DATABASE_URL=postgres://moonwitness:moonwitness@db:5432/moonwitness`.
   - The `radio` service must define `depends_on: { db: { condition: service_healthy } }`.
