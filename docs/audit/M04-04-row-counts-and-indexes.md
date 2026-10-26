# M04-04 — Restored Stations, Playlogs and Index Parity Audit

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-04
- **Status**: VERIFIED (revalidated 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** angka lama (`playlogs` 24,
> `station_envelope_metadata` 36, ID `station_mw_01`, indeks
> `idx_stations_slug`) tidak sesuai dengan dump/schema aktual. Dokumen ini diganti
> dengan hasil drill terisolasi pada dump
> `moonwitness-20261025T213120Z.dump`. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Row Counts from the Restored Snapshot

Baseline diambil dari isi dump yang sama (bukan dari database live yang sudah
berubah setelah snapshot):

| Table | Restored `moonwitness_drill` | Notes |
|---|---:|---|
| `stations` | 36 | 36 ID unik |
| `playlogs` | 21 | 21 ID unik |
| `auth_users` | 1 | admin seed |
| `schedule_slots` | 14 | |
| `countries` | 248 | |
| `currencies` | 155 | |
| `languages` | 180 | |
| `ops_audit` | 45 | |
| `ops_jobs` | 5 | |
| `airplay_daily` | 9 | |
| `auth_sessions` | 7 | |
| `settings_entries` | 10 | |
| `api_keys` | 0 | |
| `now_playing` | 0 | |
| `requests` | 0 | |

Database live saat revalidasi: 36 `stations`, 41 `playlogs`. Snapshot dump lebih
tua, jadi jumlah playlogs yang lebih kecil adalah ekspektasi, bukan data loss.

---

## 2. Stable ID & Index Verification

1. **Station IDs**:
   - `id` adalah UUID; tidak ada contoh `station_mw_01` di schema aktual.
   - `SELECT count(DISTINCT id) FROM stations` = 36 dari 36 baris.
2. **Playlog IDs**:
   - `SELECT count(DISTINCT id) FROM playlogs` = 21 dari 21 baris.
3. **Indexes restored** (9):

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

Nama indeks di atas sama dengan database live. Tidak ada tabel
`station_envelope_metadata`; tabel sesi bernama `auth_sessions`.

---

## 3. Verdict

Restore mempertahankan 36 stations, 21 playlogs, ID unik, dan seluruh indeks
utama. Paritas skema/indeks terhadap database live terverifikasi; paritas row
count terhadap live tidak relevan karena live sudah bertambah setelah snapshot.
