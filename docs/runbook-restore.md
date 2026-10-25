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

Salin keluar host sebelum dianggap aman:

```powershell
docker compose cp backup:/backups/moonwitness-20261026T000000Z.dump .\backup.dump
```

## Memulihkan

Pemulihan menimpa database target. Bacalah dua kali, jalankan satu kali.

```powershell
# 1. hentikan sisi tulis stack, biarkan db tetap hidup
docker compose stop radio headquarters dock

# 2. pastikan tidak ada koneksi lain yang menahan exclusive access
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d postgres -c "SELECT pid, usename, state FROM pg_stat_activity WHERE datname = current_database();"'

# 3. pulihkan ke database yang sama, objek lama dijatuhkan dahulu
docker compose cp .\backup.dump db:/tmp/restore.dump
docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d "$PGDATABASE" /tmp/restore.dump'
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
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$PGDATABASE" -c "SELECT count(*) FROM stations; SELECT count(*) FROM playlogs;"'
```

Tiga hal itu membuktikan: hub terhubung ke database yang dipulihkan, metadata-driven
API masih menjawab, dan jumlah baris cocok dengan ekspektasi (katalog 36 stasiun).

## Latihan pemulihan

Catat tanggal dan hasilnya di sini setiap kali resep ini dijalankan pada sebuah
salinan; sebuah runbook yang tidak pernah dieksekusi adalah asumsi.

| Tanggal | Dump | Hasil | Catatan |
| --- | --- | --- | --- |
| _(belum pernah dijalankan — isi setelah latihan pertama)_ | | | |

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
