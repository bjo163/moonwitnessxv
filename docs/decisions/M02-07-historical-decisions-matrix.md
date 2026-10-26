# M02-07 — Historical Decisions Review Matrix (XIV / Empire to XV)

- **Milestone**: M02 — XV Governance and Source of Truth
- **Status**: RATIFIED
- **Reference**: [BLUEPRINT.md §7 — Historical Federation and Migration Model](../../BLUEPRINT.md)

---

## 1. Konteks Evaluasi Keputusan Historis

Repositori terdahulu (seperti MoonWitness XIV, Rocksoul Platform, dan rancangan Empire) menghasilkan banyak keputusan arsitektur dan konseptual. Keputusan tersebut diperlakukan sebagai **arsip sejarah berharga**, bukan mandat mutlak yang harus diterapkan tanpa telaah ulang.

Setiap keputusan lama diklasifikasikan ke dalam 4 kategori:
- **ADOPT**: Diterapkan langsung karena selaras dengan prinsip XV.
- **ADAPT**: Diadaptasi atau disesuaikan dengan arsitektur modern MoonWitness XV.
- **REJECT**: Ditolak karena inefisien, membahayakan keamanan, atau tidak sesuai etika.
- **OPEN**: Ditangguhkan untuk evaluasi masa depan (tidak memblokir rilis inti).

---

## 2. Matriks Keputusan Historis

| Konsep / Keputusan Historis | Sumber Asal | Klasifikasi | Keputusan Resmi MoonWitness XV |
|---|---|---|---|
| **Kerangka Riset SRGBL** | MoonWitness XIV / Corpus | **ADOPT** | Mengadopsi 5 tingkat analisis (Source, Reality, Governing, Being, Light) sebagai metodologi riset di domain `D05 Research`. |
| **Penyelidikan QS 2:82** | Master Vision XIV | **ADOPT** | Menjadi fokus studi utama pembuktian sumber Reader pertama (ayat terpanjang tentang saksi, pencatatan, dan keadilan). |
| **Estetika Zine & Mahkota Basquiat** | Rocksoul Creative | **ADOPT** | Mahkota 3-titik Basquiat dan estetika street-art Zine diadopsi penuh dalam `@moonwitness/moonui`. |
| **ORM Knex / Objection.js** | MoonWitness XIV | **REJECT** | Ditolak. Digantikan penuh oleh runtime ORM terpadu `@moonwitness/moonql` dengan TypeScript tipe aman dan migrasi Drizzle. |
| **14 Microservices Arsitektur Empire** | Empire Specs | **REJECT** | Ditolak keras (*anti-pattern*). 14 nama sistem Empire diakomodasi sebagai taksonomi domain D00–D13 di dalam satu monorepo modular. |
| **Impor Teks Mentah / Dump CSV Bebas** | Repositori Arsip | **REJECT** | Ditolak. Setiap data teks yang masuk wajib diverifikasi edisi, hash SHA-256, dan lisensi hak ciptanya (`ADR-0003`). |
| **Dual Engine (PG + Memory)** | MoonWitness Radio | **ADAPT** | Diadaptasi dan diperkuat. Mengharuskan paritas query penuh antara Memory Engine (uji lokal cepat) dan PostgreSQL (produksi). |
| **Next.js 16 RSC BFF (Dock & HQ)** | Rocksoul Console | **ADAPT** | Menggantikan dashboard lama dengan dua aplikasi Next.js (Dock publik dan Headquarters admin) yang berkomunikasi aman via BFF. |
| **ARSY Hub Architecture** | ARSY Research | **ADAPT** | Mengadopsi nama ARSY untuk Fastify Hub eksisting (`ADR-0001` / M28), mempertahankan domain Radio sebagai `SIGNAL/RADIO`. |
| **World Monitor / Video Sentinel** | A-L-L-A-H Research | **OPEN** | Ditangguhkan ke G5 (`M24`). Memerlukan audit rate-limit, moderasi platform, dan kepatuhan privasi sebelum kode dijalankan. |
| **AETHERION 10 Realms / Journey Quest** | Empire Journey | **OPEN** | Ditangguhkan ke G4 (`M23`). Tidak menjadi prasyarat untuk rilis awal sistem Reader korpus. |

---

## 3. Exit Gate M02 Verdict
- **MILESTONE M02 RESMI SELESAI & DITUTUP LENGKAP**.
- Batasan ontologis ditegakkan (`M02-01`), pembagian domain D00–D13 disahkan (`M02-02`), ADR ekstensi domain MoonQL diratifikasi (`ADR-0002`), ADR hak cipta dan izin diterbitkan (`ADR-0003`), aturan ID stabil ditetapkan (`M02-05`), hierarki dokumen tunggal ditegaskan (`M02-06`), dan keputusan historis telah dipetakan secara jujur (`M02-07`).
