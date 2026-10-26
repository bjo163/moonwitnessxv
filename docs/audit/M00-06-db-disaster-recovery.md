# M00-06 — Database Migrations, Engine Parity & Disaster Recovery Evidence

- **Audit Date**: 2026-10-26
- **Engines Supported**: PostgreSQL (`@moonwitness/moonql/engines/pg`) & In-Memory (`@moonwitness/moonql/engines/memory`)

---

## 1. Engine Parity & Schema Sync Status

| Feature | PostgreSQL Engine (`pg.ts`) | Memory Engine (`memory.ts`) | Parity Status |
|---|---|---|---|
| **CRUD & Serialization** | Drizzle ORM / Raw SQL parameterized | In-memory JS Map / object clone | **VERIFIED PARITY** (`apps/radio/test/engine-parity.test.ts`) |
| **Domain Queries** | SQL `WHERE` (`eq`, `in`, `like`, `$or`) | JS predicate matching | **VERIFIED PARITY** (User wildcards preserved as literals) |
| **Soft Delete** | `deleted_at` timestamp check | `deletedAt` property check | **VERIFIED PARITY** (204 on delete, 404 on subsequent get) |
| **Relation Expands** | Foreign key JOINs | In-memory map lookup | **VERIFIED PARITY** (`m2o` & `o2m` arrays) |
| **Aggregations** | SQL `GROUP BY`, `COUNT()`, `SUM()`, `AVG()` | JS accumulator | **VERIFIED PARITY** (Empty groups preserve null metrics) |
| **Schema Synchronization** | Drizzle migrations (`packages/moonql/migrations`) / `autoSync: true` | Runtime memory table generator | **VERIFIED PARITY** |

---

## 2. Disaster Recovery & Backup Verification

### Sidecar Backup Strategy (`docker-compose.yml`)
- Container: `backup` (sidecar ke service `db`).
- Script: `pg_dump -Fc` setiap `BACKUP_INTERVAL_SECONDS` (default: 3600 detik).
- Retensi: Menyimpan 48 dump terbaru (`BACKUP_KEEP: 48`).
- Volume: `moonwitness_db_backups`.

### Prosedur Pemulihan (Verified Runbook: `docs/runbook-restore.md`)
1. **Stop Writers**: Menghentikan kontainer aplikasi (`radio`, `headquarters`, `dock`) agar koneksi ke database terputus.
2. **Koneksi Exclusive**: Memeriksa `pg_stat_activity` memastikan tidak ada koneksi aktif yang menahan table lock.
3. **Restore**:
   ```bash
   pg_restore --clean --if-exists --no-owner -d "$POSTGRES_DB" /tmp/restore.dump
   ```
4. **Verifikasi Pasca-Restore**:
   - Memeriksa readiness probe: `GET /api/v1/health`.
   - Menguji query hitungan stasiun dan playlog di PostgreSQL.

---

## 3. Discrepancy & Unverified Notes
- Backup otomatis hanya aktif ketika stack Docker Compose dijalankan penuh dengan Postgres.
- Saat development lokal host (`pnpm dev` dengan Memory Engine), data tidak di-persist ke disk (volatile).
- Diperlukan uji coba simulasi restore berkala di staging environment sebelum rilis produksi (M27).
