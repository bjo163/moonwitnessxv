# Revalidasi M01–M05 — 2026-10-26

- **Baseline:** `main` @ `382265756a514e280c899f2de86ec40d2c88fe03`
- **Worktree:** tidak bersih saat revalidasi; perubahan yang relevan termasuk `packages/core/src/hash.ts`, `packages/moonql-base/src/data/*` (untracked), `apps/sentinel/`, dan `packages/moonql-monitor/src/` (untracked).
- **Lingkup:** 35 task M01–M05 (7 task per milestone).
- **Sifat:** kode/konfigurasi tidak diubah. Hanya dokumen status, dokumen bukti, dan checkbox TODO yang direkonsiliasi.

> **Kesimpulan utama:** exit gate M01–M05 **belum terbukti di HEAD**. CI berakhir `failure` pada 7/7 run terakhir; run terakhir (`40256992028`, SHA `3822657`) gagal di langkah `Install dependencies`, sehingga `pnpm verify` tidak pernah dieksekusi. Checkout bersih di HEAD juga gagal `build`, `test`, dan `gen:sdk:check` karena `data/` di-ignore dan perbaikan `pseudonym()` masih uncommitted. Di worktree saat ini, build, `gen:sdk:check`, dan 196 test lulus.

## 1. Ringkasan verdict

| Milestone | `[x]` setelah revalidasi | Dibuka kembali | Verdict |
|---|---:|---:|---|
| M01 | 2/7 | 5 | Exit gate tidak terpenuhi; CI merah; toolchain tidak kompatibel. |
| M02 | 7/7 | 0 | Dokumen lengkap; satu tabrakan prefix ID dikoreksi. |
| M03 | 5/7 | 2 | ACL utama terbukti; test forged/expired cookie dan TTL/cache-cap tidak ada. |
| M04 | 6/7 | 1 | Restore dan rollback DDL direvalidasi nyata; backup off-host belum ada. |
| M05 | 7/7 | 0 | Kontrak SDK/pagination dikoreksi; verifikasi test hanya di worktree, bukan HEAD. |

**Delapan task dibuka kembali:** M01-01, M01-03, M01-05, M01-06, M01-07, M03-03, M03-05, M04-05.

Checkbox yang tetap `[x]` tidak berarti exit gate milestone lulus. Untuk task yang bergantung pada test, lulusnya dibuktikan di worktree saat ini (196 test, `gen:sdk:check`), bukan di checkout bersih HEAD.

## 2. Blocker reproduksibilitas (berlaku untuk M01–M05)

### 2.1 CI selalu gagal sebelum verifikasi

Tujuh run terakhir semuanya `failure`:

| Run | SHA | Kesimpulan |
|---|---|---|
| [40256992028](https://github.com/bjo163/moonwitnessxv/actions/runs/40256992028) | `3822657` | failure |
| [40256461631](https://github.com/bjo163/moonwitnessxv/actions/runs/40256461631) | `1feb5c3` | failure |
| [40256168448](https://github.com/bjo163/moonwitnessxv/actions/runs/40256168448) | `7986988` | failure |
| [40255595378](https://github.com/bjo163/moonwitnessxv/actions/runs/40255595378) | `46e0e9c` | failure |
| [40254546348](https://github.com/bjo163/moonwitnessxv/actions/runs/40254546348) | `bf29753` | failure |
| [40253979303](https://github.com/bjo163/moonwitnessxv/actions/runs/40253979303) | `2ea676c` | failure |
| [40253487404](https://github.com/bjo163/moonwitnessxv/actions/runs/40253487404) | `c933751` | failure |

Langkah run terakhir:

```text
1 Set up job                          success
2 Checkout repository                 success
3 Install pnpm                        success
4 Setup Node.js                       success
5 Install dependencies                failure
6 Run Monorepo Verification (...)     skipped
```

### 2.2 Pin Node tidak kompatibel dengan lockfile

| Bukti | Nilai |
|---|---|
| `.nvmrc` | `20.18.0` |
| `package.json` engines | `node >=20` |
| CI | `node-version: 20` |
| `@eslint/js@10.0.1` | engines `^20.19.0 || ^22.13.0 || >=24` |
| `cookie@2.0.1` | engines `>=22` |

Reproduksi lokal: Node `20.18.0` gagal pada `@eslint/js@10.0.1`; Node `20.19.5` masih gagal pada `cookie@2.0.1`; Node `22.13.0` lolos `pnpm install`. Artinya `>=20` bukan range yang benar: minimum praktis adalah **Node 22.13+**.

### 2.3 Checkout bersih HEAD tidak bisa build/test

`pnpm --filter @moonwitness/radio build` di worktree bersih pada SHA `3822657`:

```text
../../packages/moonql-base/src/index.ts(2,28): error TS2307: Cannot find module './data/currencies.js' or its corresponding type declarations.
../../packages/moonql-base/src/index.ts(3,27): error TS2307: Cannot find module './data/languages.js' or its corresponding type declarations.
../../packages/moonql-base/src/index.ts(4,27): error TS2307: Cannot find module './data/countries.js' or its corresponding type declarations.
../../packages/moonql-playlog/src/index.ts(65,93): error TS2554: Expected 2 arguments, but got 3.
```

Penyebab 1 — `.gitignore:5` berisi `data/`, sehingga tiga file sumber wajib tidak pernah masuk repo:

```text
$ git check-ignore -v packages/moonql-base/src/data/currencies.ts
.gitignore:5:data/    packages/moonql-base/src/data/currencies.ts

$ git ls-files packages/moonql-base/src/data
(kosong)
```

File tersebut ada di worktree lokal tetapi untracked. Akibatnya test di HEAD juga gagal:

```text
ERR_MODULE_NOT_FOUND: Cannot find module '.../packages/moonql-base/dist/data/currencies.js'
```

Penyebab 2 — perbaikan salt pseudonym masih uncommitted. `packages/core/src/hash.ts:29` di worktree menerima tiga argumen (`prefix, value, salt = ''`), sedangkan `packages/moonql-playlog/src/index.ts:65` memanggil `pseudonym('lp', value, salt)`. Di HEAD, `hash.ts` masih dua argumen, sehingga build gagal `TS2554`.

### 2.4 Worktree saat ini lulus, HEAD tidak

| Pemeriksaan | Worktree (dirty) | HEAD bersih |
|---|---|---|
| `pnpm build` | lulus (`zz-build.log`) | gagal (TS2307 + TS2554) |
| `pnpm test` | 196 pass, 0 fail (`zz-test.log`) | gagal (`ERR_MODULE_NOT_FOUND`) |
| `pnpm gen:sdk:check` | `moonql: generated SDK is up to date` | gagal (`ERR_MODULE_NOT_FOUND`) |
| `pnpm verify` | tidak dijalankan penuh | tidak mungkin sampai blocker di atas diperbaiki |

Focused suite M03–M05 juga lulus: 49 test, 0 fail (`zz-recheck-focused.log`).

## 3. M01 — CI, version and release foundation

| Task | Status | Bukti / alasan |
|---|---|---|
| M01-01 | **REOPENED** | Pin `>=20`/`20.18.0` tidak kompatibel; CI merah. |
| M01-02 | PASS | Prosedur smoke dan `pnpm ports:free` ada. |
| M01-03 | **REOPENED** | Workflow ada, tetapi 7/7 run gagal di install; `pnpm verify` selalu `skipped`. |
| M01-04 | PASS* | `gen:sdk:check` lulus di worktree dan test gate ada; gagal di HEAD karena data dist hilang; CI belum pernah menjalankannya. |
| M01-05 | **REOPENED** | Tidak ada `CHANGELOG.md`/prosedur changelog; tidak ada bukti protected branch/release protection. |
| M01-06 | **REOPENED** | Tidak ada langkah `pnpm audit`/secret scan di CI; `.gitignore` tidak memuat `*.key`, `*.pem`, `*.dump`, atau store WhatsApp yang diklaim dokumen. |
| M01-07 | **REOPENED** | Ledger mengklaim "Exit Gate Verified", tetapi CI tidak pernah hijau. |

Catatan: `docs/audit/M01-01-toolchain-pin.md`, `M01-05-release-lifecycle.md`, `M01-06-secret-dependency-gate.md`, dan `M01-07-ci-evidence-ledger.md` sudah diberi banner revalidasi.

## 4. M02 — Governance and source of truth

Semua dokumen M02 ada. Satu defect ditemukan dan diperbaiki:

- `docs/decisions/M02-05-stable-ids-and-legacy-refs.md` memakai `st_<id>` untuk **Stations** dan juga untuk **Story Arcs & Episodes**. Prefix Story dikoreksi menjadi `sa_<id>`, dan dokumen diberi catatan bahwa belum ada kode yang memakai prefix tersebut.

| Task | Status | Catatan |
|---|---|---|
| M02-01..04, M02-06, M02-07 | PASS | Dokumen keputusan/ADR ada dan konsisten dengan hierarki dokumen. |
| M02-05 | PASS* | Prefix tabrakan dikoreksi 2026-10-26. |

## 5. M03 — ACL, privacy, consent and abuse prevention

| Task | Status | Bukti / alasan |
|---|---|---|
| M03-01 | PASS* | Audit path dikoreksi: `/api/v1/on-air` (bukan `schedules/on-air`), `/api/v1/listen` + `201` (bukan `playlogs/beacon` + `204`), pseudonym `lp_` (bukan `ls_`), `/api/v1/api-keys` (bukan `api_keys`). Test `moonql-stream.test.ts` menggantikan referensi `on-air-privacy.test.ts` yang tidak ada. |
| M03-02 | PASS | Template deny-by-default ada. |
| M03-03 | **REOPENED** | Tidak ada test forged/expired cookie. `apps/headquarters/src/middleware.ts:11` hanya mengecek keberadaan `hq_token`; otoritas tetap Hub, tetapi skenario cookie palsu/kedaluwarsa tidak diuji. |
| M03-04 | PASS | Batas tenant/reviewer terdokumentasi. |
| M03-05 | **REOPENED** | Test yang ada mencakup logout revocation, role demotion, API-key revocation, dan unknown token. Tidak ada test TTL expiry (`IDENTITY_TTL_MS = 15_000`, sesi 7 hari) atau batas cache (`IDENTITY_CACHE_MAX = 500`). |
| M03-06 | PASS | Kebijakan witness/minors/withdrawal ada. |
| M03-07 | PASS* | Nama volume WhatsApp dikoreksi dari `moonwitness_wa_auth` menjadi volume compose `whatsapp-session` (`docker-compose.yml:86,215`), dan klaim `.gitignore` yang tidak benar dihapus. |

Dokumen M03-01, M03-03, M03-05, dan M03-07 sudah diberi banner/catatan revalidasi.

## 6. M04 — Database continuity and recovery

### 6.1 Drill restore terisolasi (revalidasi)

Drill dijalankan di container Postgres sementara, **bukan** di database live:

```bash
# Ambil dump nyata dari volume backup
docker run --rm -v moonwitness_db_backups:/b alpine:3.20 \
  sh -c 'cat /b/moonwitness-20261025T213120Z.dump' > /tmp/mw-recheck.dump

# Postgres terisolasi
docker run -d --name mw-recheck-pg \
  -e POSTGRES_PASSWORD=recheck -e POSTGRES_DB=moonwitness_drill \
  postgres:17-alpine

docker cp /tmp/mw-recheck.dump mw-recheck-pg:/tmp/drill.dump
docker exec -u postgres mw-recheck-pg \
  pg_restore --no-owner --no-acl -d moonwitness_drill /tmp/drill.dump
```

| Item | Hasil |
|---|---|
| Dump | `moonwitness-20261025T213120Z.dump` |
| Ukuran | 73.900 byte |
| SHA-256 | `8a32e171cbb86c561f0d528af1d21a5895763d7863abad37f71ec03cb325729f` |
| `pg_restore` | exit 0 |
| Tabel | 15 tabel `public` |
| `stations` | 36 baris; 36 ID unik |
| `playlogs` | 21 baris; 21 ID unik |
| Indeks | 9 indeks untuk `stations`/`playlogs`, nama sama dengan DB live |

Indeks yang terpasang:

```text
playlogs playlogs_created_at_idx
playlogs playlogs_listener_idx
playlogs playlogs_pkey
playlogs playlogs_station_ref_created_at_idx
playlogs playlogs_station_ref_idx
stations stations_country_ref_idx
stations stations_created_at_idx
stations stations_genre_idx
stations stations_name_uq
stations stations_pkey
```

Row count tabel lain di drill: `auth_users` 1, `schedule_slots` 14, `countries` 248, `currencies` 155, `languages` 180, `ops_audit` 45, `ops_jobs` 5, `airplay_daily` 9, `auth_sessions` 7, `settings_entries` 10; `api_keys`, `now_playing`, `requests` 0.

### 6.2 Uji rollback DDL gagal

```sql
BEGIN;
ALTER TABLE stations ADD COLUMN recheck_probe text;
SELECT * FROM definitely_not_a_table;
COMMIT;
```

Hasil:

```text
ERROR:  relation "definitely_not_a_table" does not exist
psql exit: 1
```

Setelah transaksi gagal:

```text
recheck_probe columns: 0
stations: 36
playlogs: 21
```

Artinya `ALTER TABLE` yang sudah berhasil di dalam transaksi ikut di-rollback; tidak ada kolom parsial dan tidak ada perubahan row count. Ini adalah drill manual di database terisolasi, bukan test otomatis di repo.

### 6.3 Koreksi terhadap dokumen M04 lama

Dokumen lama tidak cocok dengan volume backup dan schema aktual:

| Klaim lama | Kenyataan |
|---|---|
| Dump `moonwitness-20261026T000000Z.dump`, ~79,6 KB | File tidak ada; dump terbaru `moonwitness-20261025T213120Z.dump`, 73.900 byte. |
| PostgreSQL 16 | Container yang dipakai `postgres:17-alpine`; DB live juga `postgres:17-alpine`. |
| `playlogs` 24 | Drill mengembalikan 21 (snapshot dump); DB live saat revalidasi 41. |
| Tabel `station_envelope_metadata` 36 baris | Tabel tidak ada di schema hasil restore. |
| ID contoh `station_mw_01` | ID aktual UUID; 36 station ID unik. |
| Indeks `idx_stations_slug`, `idx_playlogs_station_played_at` | Nama aktual seperti daftar 9 indeks di atas. |
| "Automated migration runner" untuk DDL gagal | Tidak ada test otomatis; bukti baru berasal dari drill manual di 6.2. |

Dokumen M04-03, M04-04, M04-06, M04-07, dan runbook sudah diperbarui dengan bukti aktual. M04-05 tetap berupa rencana.

| Task | Status | Bukti / alasan |
|---|---|---|
| M04-01 | PASS | `requirePg` + test; produksi menolak memory engine. |
| M04-02 | PASS | Rencana migrasi/rollback ada. |
| M04-03 | PASS* | Drill restore nyata 2026-10-26, exit 0; dump dan ukuran dikoreksi. |
| M04-04 | PASS* | 36 stations/21 playlogs, ID unik, 9 indeks; angka lama 24 dan tabel fiktif dihapus. |
| M04-05 | **REOPENED** | Masih strategi; tidak ada implementasi rclone/prune, target off-host, atau test retensi. |
| M04-06 | PASS* | Rollback DDL gagal terbukti di drill terisolasi; test otomatis belum ditambahkan. |
| M04-07 | PASS* | Runbook diperbarui dengan metadata drill aktual (dump, ukuran, hasil, operator revalidasi, batasan). |

## 7. M05 — API/SDK and module behavior contracts

| Task | Status | Bukti / alasan |
|---|---|---|
| M05-01 | PASS* | Fixture envelope/error ada; sintaks filter dikoreksi dari `?where[field]=<val>` menjadi `?where={...}` (diparse `parseWhereJson`, `rest.ts:37,180`). |
| M05-02 | PASS* | Test collision model/view/manual route lulus di worktree. |
| M05-03 | PASS | Standar namespace addon ada. |
| M05-04 | PASS* | Test determinisme hash/render SDK lulus; `gen:sdk:check` lulus di worktree. |
| M05-05 | PASS* | Dokumen dikoreksi: stations `maxLimit` 200 (bukan 100); `?limit` di atas maximum ditolak schema 400 (bukan di-clamp); tidak ada filter/locale fallback di MoonQL. |
| M05-06 | PASS | Batas adapter lama terdokumentasi. |
| M05-07 | PASS* | Smoke kompatibilitas ada dan suite worktree 196/196 lulus; di HEAD test gagal karena blocker 2.3. |

`?limit=1000` bukan di-clamp: `packages/moonql/src/jsonschema.ts:100` memasang `maximum: maxLimit`, jadi Fastify menolak query sebelum repository. `packages/moonql/src/repository.ts:204` hanya memakai `query.limit ?? maxLimit`. Satu-satunya override `maxLimit` saat ini adalah countries/currencies/languages (`300`); stations memakai default `200` (`model.ts:213`). Tidak ditemukan parameter locale di MoonQL.

## 8. Temuan lintas milestone

1. **HEAD tidak lengkap sebagai checkout:** `apps/radio/package.json` di HEAD mereferensikan `@moonwitness/moonql-monitor` dan `@moonwitness/sentinel`, tetapi `apps/sentinel` dan `packages/moonql-monitor/src` tidak tracked. Build HEAD tidak gagal karena `addons.ts` di HEAD belum mengimpor keduanya, tetapi inventory workspace di HEAD tidak konsisten.
2. **Dokumen bukti beberapa kali mendahului kenyataan:** path rute, status HTTP, nama volume, nama tabel, angka row count, nama indeks, dan test yang tidak ada. Pola ini paling parah di M04 dan M03-01.
3. **`gen:sdk:check` bekerja di worktree, tetapi tidak di HEAD.** Gate bukan masalah implementasi; gate gagal karena `dist/data/*` tidak pernah bisa dibuat dari checkout bersih.
4. **DB live saat revalidasi:** 36 stations, 41 playlogs, 9 indeks. Drill memakai snapshot 2026-10-25T21:31Z sehingga playlogs 21; perbedaan ini wajar dan bukan bukti kehilangan data.

## 9. Rekomendasi perbaikan (berurutan)

### P0 — agar HEAD bisa diverifikasi

1. **Pin Node 22.13+** di `.nvmrc`, `package.json#engines`, dan `.github/workflows/ci.yml`; pertimbangkan Node 22 LTS atau 24. Jalankan `pnpm install --frozen-lockfile` di Node tersebut.
2. **Tambahkan pengecualian `.gitignore`** untuk `packages/moonql-base/src/data/` dan commit ketiga file sumber (`currencies.ts`, `languages.ts`, `countries.ts`).
3. **Commit perbaikan `pseudonym()`** di `packages/core/src/hash.ts` yang menerima salt, atau sesuaikan pemanggil agar HEAD konsisten.
4. **Putuskan WIP `sentinel`/`monitor`/`aigateway`**: commit paket yang direferensikan `apps/radio/package.json`, atau keluarkan referensinya sampai siap. Pastikan checkout bersih lolos install tanpa file untracked.
5. Jalankan `pnpm verify` pada SHA bersih dan rekam hasilnya; baru setelah itu M01-03/M01-07 dapat ditutup.

### P1 — melengkapi task yang dibuka kembali

6. **M03-03:** tambah test forged/expired `hq_token` terhadap Hub (bukan hanya middleware) dan pastikan tidak ada akses data tanpa sesi valid.
7. **M03-05:** tambah test TTL expiry identitas/sesi dan batas `IDENTITY_CACHE_MAX`.
8. **M04-05:** implementasikan salinan off-host (rclone/object storage) + uji retensi/prune; saat ini hanya rencana.
9. **M01-05:** tambah `CHANGELOG.md`/prosedur changelog dan bukti protected branch/release.
10. **M01-06:** tambah langkah `pnpm audit --audit-level high` dan secret scanning ke CI; lengkapi `.gitignore` untuk pola sensitif yang benar-benar dipakai.
11. **M04-06:** jadikan drill rollback sebagai skrip/test otomatis agar tidak bergantung pada satu eksekusi manual.

## 10. Batasan revalidasi

- Tidak ada perubahan pada kode, konfigurasi CI, `.nvmrc`, `.gitignore`, atau lockfile.
- Tidak ada commit/push.
- Tidak ada dev server aplikasi yang dijalankan.
- Tidak ada test off-host backup; M04-05 tetap tidak bisa ditutup tanpa target penyimpanan eksternal.
- Container drill `mw-recheck-pg` dan dump sementara `/tmp/mw-recheck.dump` adalah artefak audit dan dihapus setelah pengambilan bukti.
