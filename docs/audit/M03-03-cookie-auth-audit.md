# M03-03 — Forged & Expired Cookies vs Hub Authorization Audit

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: `apps/headquarters/src/middleware.ts`, `apps/radio/test/moonql-auth.test.ts`

---

## 1. Analisis Batas Keamanan Antara BFF dan Fastify Hub

Di arsitektur MoonWitness XV:
- **Headquarters (Next.js 16)** bertindak sebagai Backend-for-Frontend (BFF).
- Cookie `hq_token` diperiksa oleh Next.js middleware hanya sebagai penjaga pintu rute halaman UI (`middleware.ts`).
- **FASTIFY HUB MERUPAKAN SATU-SATUNYA OTORITAS OTENTIKASI & OTORISASI SEBENARNYA**. Keberadaan cookie palsu atau token kadaluarsa di browser tidak memberikan akses ke data sensitif.

---

## 2. Pengujian Skenario Serangan Kredensial

| Skenario | Aksi Pengujian | Respons Sistem | Hasil Evaluasi |
|---|---|---|---|
| **Cookie Palsu / Forged Token** | Penyerang membuat cookie buatan `hq_token=fake_random_payload` di browser. | Middleware Next.js meloloskan akses halaman shell, tetapi saat server actions / route handlers meminta data ke Fastify Hub dengan token palsu tersebut: Hub menjawab `401 Unauthorized`. | **AMAN (Defended)**: Tidak ada data sensitif yang berhasil ditarik. |
| **Token Kadaluarsa (Expired)** | Penyerang menggunakan token sesi lama yang sudah melewati masa TTL (`SESSION_TTL_SECONDS`). | Fastify Hub memvalidasi `expiresAt` sesi pada tabel `auth_sessions`: menolak dengan `401 Unauthorized` dan membersihkan cache identitas. | **AMAN (Defended)**: Sesi mati sesuai window waktu. |
| **Pencabutan Sesi (Logout)** | Pengguna melakukan logout, lalu penyerang mencoba memakai kembali token lama. | Handler logout menghapus sesi dari database dan mengeksekusi penghapusan token dari cache identitas lokal (`identity-cache`). Permintaan berikutnya langsung `401`. | **AMAN (Defended)**: Teruji di `moonql-identity-cache.test.ts`. |
