# M04-03 — Test DB Restore from Real Dump

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-03
- **Status**: VERIFIED (revalidated 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** dokumen lama menyebut dump
> `moonwitness-20261026T000000Z.dump` (~79,6 KB). File itu tidak ada di volume
> backup maupun di host. Drill diulang dengan dump terbaru yang benar-benar ada:
> `moonwitness-20261025T213120Z.dump` (73.900 byte). Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Test Environment

- **Engine**: PostgreSQL `17-alpine`, container sementara `mw-recheck-pg`
- **Source dump**: `moonwitness-20261025T213120Z.dump` (`pg_dump -Fc`)
- **Ukuran**: 73.900 byte
- **SHA-256**: `8a32e171cbb86c561f0d528af1d21a5895763d7863abad37f71ec03cb325729f`
- **Target restore**: database `moonwitness_drill` di container sementara
- **Database live**: tidak disentuh selama drill

Dump diambil dari volume `moonwitness_db_backups`. Isi volume saat revalidasi:

```text
moonwitness-20261025T210837Z.dump   69.787 byte
moonwitness-20261025T213120Z.dump   73.900 byte
```

---

## 2. Execution Log

```bash
# 1. Ambil dump dari volume backup
docker run --rm -v moonwitness_db_backups:/b alpine:3.20 \
  sh -c 'cat /b/moonwitness-20261025T213120Z.dump' > /tmp/mw-recheck.dump

# 2. Postgres terisolasi (bukan container db live)
docker run -d --name mw-recheck-pg \
  -e POSTGRES_PASSWORD=recheck -e POSTGRES_DB=moonwitness_drill \
  postgres:17-alpine

# 3. Salin dan restore
docker cp /tmp/mw-recheck.dump mw-recheck-pg:/tmp/drill.dump
docker exec -u postgres mw-recheck-pg \
  pg_restore --no-owner --no-acl -d moonwitness_drill /tmp/drill.dump
```

`pg_restore` selesai dengan **exit 0** dan tanpa error fatal.

---

## 3. Findings & Evidence

1. Restore membuat 15 tabel di schema `public`.
2. `stations` = 36 baris, 36 ID unik.
3. `playlogs` = 21 baris, 21 ID unik.
4. Sembilan indeks `stations`/`playlogs` terbentuk dengan nama yang sama seperti
   database live.
5. Tidak ada tabel `station_envelope_metadata` atau `sessions`; tabel sesi yang
   ada bernama `auth_sessions`.

Schema dan isi database live saat revalidasi berbeda karena dump adalah snapshot
2026-10-25T21:31Z: live memiliki 36 stations dan 41 playlogs, sedangkan dump
memiliki 21 playlogs. Perbedaan ini berasal dari waktu snapshot, bukan dari
kegagalan restore.
