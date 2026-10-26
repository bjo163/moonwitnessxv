# M03-04 — Tenant & Role Boundaries Decision

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: [BLUEPRINT.md §4, §8](../../BLUEPRINT.md)

---

## 1. Keputusan Batas Multi-Tenancy

- **Keputusan Arsitektur**: **Multi-tenancy mandiri (SaaS multi-tenant komersial) DINYATAKAN BERADA DI LUAR CAKUPAN (OUT OF SCOPE)** untuk baseline MoonWitness XV.
- **Rasional**: MoonWitness XV adalah monorepo pengetahuan, saksi, dan siaran terpadu (*single-universe knowledge & broadcasting system*). Menambahkan kompleksitas isolasi tenant database pada tahap ini akan memecah kesatuan ontologi dan memperumit paritas engine tanpa kebutuhan nyata.

---

## 2. Struktur Peran Sistem (*Role Hierarchy*)

MoonWitness XV menggunakan sistem Role-Based Access Control (RBAC) berbasis 4 peran kanonikal:

| Peran (*Role*) | Cakupan Akses | Model / Rute Terkait |
|---|---|---|
| **`anonymous`** | Akses baca publik ke katalog stasiun, frame On-Air, bacaan teks Reader yang berlisensi terbuka, dan pengiriman beacon mendengarkan (pseudonim). | `GET /stations`, `GET /schedules/on-air`, `POST /playlogs/beacon` |
| **`user`** | Pengguna terdaftar untuk partisipasi publik terautentikasi (bookmark bacaan, preferensi tema, interaksi pendengar). | `GET /auth/me`, User preferences |
| **`editor` / `reviewer`** | Penelaah teks sejarah, verifikator metadata edisi naskah, dan kurator antrean kesaksian. Tidak dapat mengubah konfigurasi sistem atau menghapus user. | `D01 Corpus`, `D02 UNILEX`, `D05 Research`, `D08 Governance` review queue |
| **`admin`** | Pengendali operasional penuh sistem: manajemen stasiun, konfigurasi stream, audit trail, rotasi API keys, dan manajemen pengguna. | `ADMIN_FULL` di seluruh model, `GET /api/v1/ops/dashboard`, `POST /stations` |
