# M03-07 — Threat Model: CSP, Logs, Egress, DENPA, WA & SSR (Exit Gate M03)

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: `scripts/security-headers.mjs`, `apps/radio/src/lib/egress.ts`, `apps/radio/src/modules/denpa`

---

## 1. Analisis Ancaman & Mitigasi Arsitektur (*Threat Matrix*)

| Vektor Ancaman | Permukaan Risiko | Mitigasi yang Diterapkan di Kode | Status Perlindungan |
|---|---|---|---|
| **Clickjacking & XSS** | Antarmuka Web (Dock & Headquarters) | - Header `Content-Security-Policy` ketat dipasang di Next.js & Fastify (`scripts/security-headers.mjs`).<br>- `X-Frame-Options: SAMEORIGIN` (kecuali rute `/embed/:id` untuk widget player audio).<br>- `X-Content-Type-Options: nosniff`. | **TERLINDUNGI (Mitigated)** |
| **SSRF (Server-Side Request Forgery)** | Fitur fetch eksternal (now-playing polling, cover art lookup) | - Modul `installEgress` memblokir akses ke private network (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`, dan AWS metadata `169.254.169.254`).<br>- Teruji di `apps/radio/test/egress.test.ts`. | **TERLINDUNGI (Mitigated)** |
| **Penyusupan Pesan DENPA (Spam/Poisoning)** | Webhook Inbound `POST /api/v1/denpa/transmit` | - Wajib menggunakan `DENPA_TOKEN` (registrasi ditolak jika kosong).<br>- Pesan dibatasi 500 karakter.<br>- Alamat pengirim di-hash menjadi pseudonim (`dn_<hash>`).<br>- Tombol darurat `requests_open` di HQ untuk menutup antrean. | **TERLINDUNGI (Mitigated)** |
| **Kebocoran Kredensial WhatsApp** | Komunikasi socket Baileys | - File sesi autentikasi WhatsApp diisolasi di volume Docker `moonwitness_wa_auth` dan terdaftar di `.gitignore`.<br>- Hanya admin yang dapat memicu pengiriman pesan outbound. | **TERLINDUNGI (Mitigated)** |
| **Kebocoran Informasi di Log (*Log Scrubbing*)** | Log Fastify & Next.js | - Password hash (`passwordHash`) dideklarasikan `private: true` di model ORM sehingga tidak pernah diserialisasi ke log.<br>- Parameter rahasia (token, password) di-mask otomatis pada logger. | **TERLINDUNGI (Mitigated)** |
| **Manipulasi SSR / Header Spoofing** | Reverse proxy ke Fastify Hub | - Opsi `trustProxy` hanya diaktifkan jika operator secara eksplisit mengonfirmasi adanya proxy tepercaya di depan Hub. Menghindari spoofing IP/Host ke dalam access log. | **TERLINDUNGI (Mitigated)** |

---

## 2. Exit Gate M03 Verdict
- **MILESTONE M03 RESMI SELESAI & DITUTUP LENGKAP**.
- Seluruh permukaan ACL telah diaudit (`M03-01`), template deny-by-default diratifikasi (`M03-02`), cookie verification diuji (`M03-03`), multi-tenancy diputuskan out-of-scope dan hierarki peran ditetapkan (`M03-04`), batas TTL/cache identitas dispesifikasikan (`M03-05`), kebijakan penarikan izin saksi dibuat (`M03-06`), dan threat model komprehensif telah diverifikasi (`M03-07`).
