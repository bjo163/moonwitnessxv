# M04-06 — Schema Upgrade Failure and Rollback Test

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-06
- **Status**: VERIFIED (revalidated 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** dokumen lama mengklaim "automated migration runner"
> dan test yang tidak ada di repo. Drill diulang secara manual di database
> terisolasi; hasilnya dicatat di bawah. Test otomatis tetap perlu ditambahkan
> agar bukti ini repeatable. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Scenario: Failed Migration Simulation

Database `moonwitness_drill` hasil restore dump
`moonwitness-20261025T213120Z.dump` dipakai sebagai target. Sebuah DDL valid
diikuti statement yang gagal di dalam satu transaksi:

```sql
BEGIN;
ALTER TABLE stations ADD COLUMN recheck_probe text;
SELECT * FROM definitely_not_a_table;
COMMIT;
```

Statement pertama berhasil, statement kedua gagal, sehingga PostgreSQL
membatalkan seluruh transaksi. `COMMIT` efektif menjadi rollback.

---

## 2. Test Execution & Rollback Behavior

Output aktual:

```text
BEGIN
ALTER TABLE
ERROR:  relation "definitely_not_a_table" does not exist
psql exit: 1
```

Verifikasi setelah kegagalan:

```text
kolom recheck_probe pada stations: 0
stations: 36
playlogs: 21
```

Artinya:

1. Tidak ada kolom parsial yang tertinggal.
2. Row count `stations` dan `playlogs` tidak berubah.
3. Transaksi DDL Postgres aman untuk kegagalan di tengah migrasi.

---

## 3. Failure Recovery Procedure (When Not Fully Transactional)

Prosedur ini belum diuji dalam drill ini; ini adalah langkah operasional jika
terjadi kegagalan non-transaksional:

1. Stop aplikasi: `docker compose stop radio headquarters dock`.
2. Pulihkan snapshot pra-migrasi:
   ```bash
   docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d "$POSTGRES_DB" /backups/pre-migration.dump'
   ```
3. Restart aplikasi: `docker compose up -d`.
4. Verifikasi row count dan endpoint health sebelum menyatakan pulih.

---

## 4. Gap

Belum ada test otomatis/reproducible script untuk skenario ini di repo. Drill di
atas adalah bukti manual pada 2026-10-26; jadikan skrip test agar M04-06 tidak
bergantung pada satu eksekusi.
