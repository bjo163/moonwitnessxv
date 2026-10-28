# Runbook: mencadangkan dan memulihkan database

Stack compose menjalankan sidecar `backup` (`docker-compose.yml`) yang menulis
`pg_dump -Fc` ke volume bernama `moonwitness_db_backups`. Halaman ini adalah
satu-satunya tempat resep pemulihan ditulis, karena sebuah backup yang belum pernah
dipulihkan belum terbukti berupa backup.

## Di mana filenya

```powershell
docker compose exec backup sh -c 'ls -lt /backups | head'
```

Satu dump per `BACKUP_INTERVAL_SECONDS` (default 3600), nama
`<db>-YYYYMMDDTHHMMSSZ.dump`, hanya `BACKUP_KEEP` (default 48) terbaru dipertahankan.
Healthcheck service gagal bila dump terakhir lebih tua dari 3 × interval — itu
sinyal bahwa cron pencadangan mati, bukan bahwa database bermasalah.

Snapshot atas permintaan memakai script yang sama (`scripts/db-backup.sh`), sehingga
ia melalui write-to-`.part` lalu rename yang sama seperti dump berkala: outputnya
adalah path dump yang sudah di-commit.

```powershell
docker compose exec backup sh /backup.sh manual-pre-migration
# /backups/moonwitness-<stamp>-manual-pre-migration.dump
```

Volume dump juga ter-mount **read-only** di container `db` pada path `/backups`,
jadi resep rollback di [`docs/audit/M04-06-schema-upgrade-rollback.md`](audit/M04-06-schema-upgrade-rollback.md)
dapat menjalankan `pg_restore` langsung dari sana tanpa menyalin file. Hanya service
`backup` yang menulis ke volume itu.

Salin keluar host sebelum dianggap aman:

```powershell
# ganti nama file dengan dump terbaru dari perintah `ls` di atas
docker compose cp backup:/backups/moonwitness-20261025T213120Z.dump .\backup.dump
```

## Memulihkan

Pemulihan menimpa database target. Bacalah dua kali, jalankan satu kali.

```powershell
# 1. hentikan sisi tulis stack, biarkan db tetap hidup
docker compose stop radio headquarters dock

# 2. pastikan tidak ada koneksi lain yang menahan exclusive access.
#    `$POSTGRES_DB` disediakan service `db` (bootstrap var Postgres); di dalam
#    container itu `$PGDATABASE` TIDAK ada, dan libpq akan jatuh ke default
#    "nama database = nama user" — query-nya lalu memeriksa database yang salah.
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT pid, usename, state FROM pg_stat_activity WHERE datname = current_database();"'

# 3. pulihkan ke database yang sama, objek lama dijatuhkan dahulu
docker compose cp .\backup.dump db:/tmp/restore.dump
docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d "$POSTGRES_DB" /tmp/restore.dump'
docker compose exec db rm /tmp/restore.dump

# 4. nyalakan kembali
docker compose up -d
```

`--clean --if-exists` menjatuhkan objek yang ada sebelum memulihkan; `--no-owner`
membiarkan objek dimiliki user target, karena dump dari container lain membawa
ownership yang tidak ada di sini.

## Cek setelah pemulihan

```powershell
docker compose exec radio node -e "fetch('http://127.0.0.1:3000/api/v1/health/ready').then(r=>r.text()).then(console.log)"
curl.exe -s http://127.0.0.1:3000/api/v1/stationCatalog | Select-String -Pattern '"name"' | Select-Object -First 3
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) FROM stations; SELECT count(*) FROM playlogs;"'
```

Tiga hal itu membuktikan: hub terhubung ke database yang dipulihkan, metadata-driven
API masih menjawab, dan jumlah baris cocok dengan ekspektasi (katalog 36 stasiun).

## Latihan pemulihan

Catat tanggal dan hasilnya di sini setiap kali resep ini dijalankan pada sebuah
salinan; sebuah runbook yang tidak pernah dieksekusi adalah asumsi.

| Tanggal | Dump | Hasil | Operator | Batasan / Catatan |
| --- | --- | --- | --- | --- |
| 2026-10-26T09:29:00+07:00 | `moonwitness-20261025T213120Z.dump` (73.900 byte; SHA-256 `8a32e171…`) | **LULUS** — restore ke `moonwitness_drill` di container terisolasi `postgres:17-alpine` (`pg_restore --no-owner --no-acl`, exit 0): 15 tabel, `stations` 36, `playlogs` 21, 9 indeks; uji DDL gagal juga rollback bersih | Qoder (revalidasi otomatis) | Bukan restore ke DB live. Dump adalah snapshot 2026-10-25T21:31Z; live saat revalidasi 36 stations/41 playlogs. Tidak ada uji off-host. Container drill dihapus setelah pengambilan bukti. |

Baris drill lama (2026-10-26T08:31:00+07:00) yang menyebut dump
`moonwitness-20261026T000000Z.dump` 79.641 byte dan `playlogs` 24 tidak dapat
direproduksi: file dump tersebut tidak ada di volume backup. Baris itu diganti
dengan hasil revalidasi di atas; rinciannya ada di
[docs/audit/M01-M05-revalidation-2026-10-26.md](audit/M01-M05-revalidation-2026-10-26.md).

## Yang TIDAK dilakukan autoSync

`moonql` menambah tabel dan kolom saat boot (`MOONQL_AUTOSYNC=true`) tetapi
**tidak pernah** menghapus atau mengganti tipe (`packages/moonql/src/sync.ts`).
Karena itu:

- Pulih dari dump yang lebih tua tidak akan "merapikan" skema; kolom hasil refactor
  terbaru tetap dibuat saat boot berikutnya.
- Menghapus kolom adalah keputusan migrasi sadar: `pnpm db:generate` lalu review SQL
  yang dihasilkan sebelum `pnpm db:push`.
- `playlogs` memiliki retensinya sendiri (`PLAYLOG_RETENTION_DAYS`, cron
  `purge-playlog`); mengembalikan dump lama dapat memunculkan kembali event yang
  seharusnya sudah dihapus. Bila itu terjadi, jalankan ulang purge dengan menaiki
  `PLAYLOG_RETENTION_DAYS` lalu mengembalikannya.

## Backup di luar stack

Volume `moonwitness_db_backups` hidup di host Docker yang sama dengan database.
Salin dump keluar (langkah di atas) sebelum host itu sendiri menjadi titik tunggal
kegagalan.

### ECHOLOG sebagai tujuan S3-compatible

Sidecar `backup` dapat mengirim setiap dump ke ECHOLOG melalui API S3-compatible
ECHOLOG. Atur `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY_ID`,
dan `BACKUP_S3_SECRET_ACCESS_KEY` melalui secret store host (atau `.env` lokal
yang diabaikan Git). Nilai kosong mempertahankan mode lokal. Konfigurasi parsial
gagal tertutup. Jangan menaruh kredensial di command line, log, atau Git.

Set `BACKUP_S3_MAX_OBJECT_BYTES` tidak lebih besar dari
`ECHOLOG_MAX_UPLOAD_BYTES`; dump yang melebihi batas akan gagal sebelum unggah,
tetap tersimpan di volume lokal, dan membuat healthcheck backup remote kedaluwarsa.
ECHOLOG melakukan buffering objek penuh; mulai dengan batas konservatif sesuai
memori host dan kuota ECHOLOG. `BACKUP_S3_KEEP` mempertahankan sejumlah dump
terbaru di prefix `BACKUP_S3_PREFIX` (default `moonwitness-backups`), dipisah
lagi ke sub-prefix untuk setiap database PostgreSQL. Retensi hanya menghitung
dan menghapus key dump berstempel waktu yang dihasilkan sidecar. Sinkronisasi memakai
satu `PutObject`, `ListObjectsV2`, lalu `DeleteObject` satu per satu; tidak
menggunakan multipart ataupun batch delete.

Setelah konfigurasi rahasia diberikan oleh operator, verifikasi tanpa mencetak
rahasia:

```powershell
docker compose up -d --build backup
docker compose exec backup sh -c 'ls -l /backups/.remote-success'
docker compose ps backup
```

Tanda `.remote-success` hanya diperbarui setelah unggah dan pemangkasan selesai.
Ia membuktikan jalur tulis saat itu, bukan pemulihan. Untuk membuktikan off-host,
ambil objek dari ECHOLOG pada host pemulihan terpisah, jalankan prosedur
[`Memulihkan`](#memulihkan), lalu catat tanggal, objek, SHA-256, hasil, dan host
di tabel latihan di atas. Sampai latihan itu dilakukan, backup off-host belum
terverifikasi dan task M04-05 tetap terbuka.
