# M03-01 — Default Public Exposure Audit & Negative Request Paths

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: `apps/radio/test/moonql-acl-surface.test.ts`, `moonql-acl-policy.test.ts`

> **Revalidasi 2026-10-26:** tiga path/status diperbaiki — `/api/v1/on-air`
> (bukan `schedules/on-air`), `/api/v1/listen` + `201` (bukan `playlogs/beacon` +
> `204`), `/api/v1/api-keys` (bukan `api_keys`), pseudonym `lp_` (bukan `ls_`).
> Referensi test `on-air-privacy.test.ts` tidak ada; diganti
> `moonql-stream.test.ts`. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Audit Cakupan Paparan Akses (Public vs Protected)

Berdasarkan audit rute dan pengujian injeksi langsung pada Fastify Hub:

| Endpoint Path | Method | Akses yang Diizinkan | Hasil Uji Negatif (Anonymous Direct Call) | Catatan Keamanan |
|---|---|---|---|---|
| `/api/v1/stations` | `GET` | Public (Anonymous) | `200 OK` (Daftar stasiun) | Informasi publik katalog radio. |
| `/api/v1/stations` | `POST/PUT/DELETE` | Admin only | `401 Unauthorized` / `403 Forbidden` | Penulisan data stasiun diblokir untuk pemanggil anonim. |
| `/api/v1/on-air` | `GET` (SSE) | Public | `200 OK` (Frame On-Air) | Kolom internal server/database tidak diekspos (`moonql-stream.test.ts`). |
| `/api/v1/listen` | `POST` | Public | `201 Created` | IP pendengar di-hash menjadi pseudonim (`lp_<hash>`), tidak disimpan plaintext. |
| `/api/v1/auth_users` | `ANY` | None (`rest: false`) | `404 Not Found` | Tabel user tidak membuka antarmuka CRUD REST mentah sama sekali. |
| `/api/v1/api-keys` | `GET/POST` | Admin only | `401 Unauthorized` | Kunci API terlindungi penuh dari akses publik. |
| `/api/v1/ops/dashboard` | `GET` | Admin only | `401 Unauthorized` | Data metrik operasional dan hitungan baris hanya untuk admin. |
| `/api/v1/ops/stream` | `GET` (SSE) | Admin only | `401 Unauthorized` | Aliran event bus real-time terlindungi penuh. |

---

## 2. Pengujian Jalur Tidak Langsung (*Indirect Vector Tests*)

Sesuai bukti uji di [`moonql-acl-surface.test.ts`](file:///z:/project/moonradio/apps/radio/test/moonql-acl-surface.test.ts):
1. **Pencegahan Kebocoran via `?expand=`**:
   - Jika entitas publik me-relasikan entitas privat (misal model `things` merujuk `owners` yang bersifat admin-only), pemanggil anonim yang meminta `?expand=ownerRef` akan menerima `ownerRefRecord: null`. Entitas target tidak dibocorkan.
2. **Pencegahan Kebocoran via `x-total-count` (Counting Oracle)**:
   - Header `x-total-count` tidak dikirimkan jika ada *row rule* yang memfilter baris privat, sehingga penyerang tidak dapat menebak jumlah baris tersembunyi.
