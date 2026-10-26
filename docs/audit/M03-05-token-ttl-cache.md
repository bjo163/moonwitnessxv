# M03-05 — Token TTL, Revocation and Identity Cache Bounds Specification

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: `packages/moonql-auth/src/index.ts`, `apps/radio/test/moonql-identity-cache.test.ts`

> **Revalidasi 2026-10-26 — TASK DIBUKA KEMBALI.** Test yang ada mencakup
> logout revocation, role demotion, API-key revocation, dan unknown token. Tidak
> ada test TTL expiry (`IDENTITY_TTL_MS = 15_000`, sesi 7 hari) atau batas cache
> (`IDENTITY_CACHE_MAX = 500`). Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Spesifikasi Masa Berlaku & Batas Cache Identitas

Sesuai implementasi di `@moonwitness/moonql-auth`:

| Parameter | Nilai Batas | Fungsi & Alasan Keamanan |
|---|---|---|
| **Session TTL** (`SESSION_TTL_SECONDS`) | `604,800 detik` (7 Hari) | Masa aktif sesi admin/pengguna. Sesi mati otomatis setelah melewati batas ini. |
| **Identity Cache TTL** (`IDENTITY_TTL_MS`) | `15,000 ms` (15 Detik) | Batas waktu identitas token di-cache di memori agar request berulang tidak membebani database. |
| **Identity Cache Capacity** (`IDENTITY_CACHE_MAX`) | `500 entri` | Kapasitas maksimum memori cache identitas. Mencegah *memory exhaustion DoS* akibat crawling jutaan token palsu. |

---

## 2. Jaminan Pencabutan Kredensial (*Revocation Guarantees*)

Pengujian otomatis pada [`moonql-identity-cache.test.ts`](../../apps/radio/test/moonql-identity-cache.test.ts) membuktikan:
1. **Logout Langsung Mematikan Cache**:
   - Panggilan `POST /auth/logout` langsung menghapus token dari database dan cache lokal. Permintaan berikutnya dengan token yang sama pada milidetik yang sama langsung ditolak `401`.
2. **Perubahan Hak Akses / Demosi Peran**:
   - Jika peran admin dicabut menjadi user biasa, perubahan langsung terbaca setelah cache kedaluwarsa (maksimal 15 detik), tanpa memerlukan restart Fastify Hub.
3. **Pencarian Token Tak Dikenal**:
   - Token palsu/acak tidak pernah disimpan dalam cache, sehingga serangan brute-force token tidak dapat memenuhi kapasitas 500 slot cache.
