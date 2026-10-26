# M00-07 — Discrepancy Ledger (CODE vs TESTED vs RELEASED vs UNKNOWN)

- **Audit Date**: 2026-10-26
- **Commit SHA**: `5da8bed`
- **Purpose**: Menegakkan batasan realitas kode saat ini agar visi atau rencana tidak dianggap sebagai fitur aktif tanpa bukti uji.

---

## 1. Status Classification Ledger

| Domain / Feature | Status | Bukti Nyata / Implementasi | Catatan & Batasan |
|---|---|---|---|
| **Radio / SIGNAL Hub** | **TESTED & CODE** | `apps/radio` (Fastify :3000), 190 tests pass | Berfungsi penuh: CRUD stasiun, streaming live status, on-air schedule, playlog, Quality beacon. |
| **Dock Frontend** | **TESTED & CODE** | `apps/dock` (Next.js 16 :3001) | Halaman publik, audio player streaming, jadwal, embed widget, Zine UI design system. |
| **Headquarters Admin** | **TESTED & CODE** | `apps/headquarters` (Next.js 16 :3002) | Autentikasi cookie httpOnly, Studio admin, manajemen stasiun & addon MoonQL. |
| **MoonQL ORM Core** | **TESTED & CODE** | `packages/moonql` + addons | Dual engine (PG & Memory), event bus, declarative REST, soft delete, RBAC ACL. |
| **DENPA Inbound** | **TESTED & CODE** | `packages/denpa` + `apps/radio/src/modules/denpa` | Inbound token-guarded webhook, request queue, listener pseudonym hashing. |
| **Egress Policy & SSRF Guard** | **TESTED & CODE** | `apps/radio/src/lib/egress.ts`, test pass | Isolasi network outbound terhadap private range dan metadata cloud. |
| **ARSY Renaming (ADR-0001)** | **CODE PLANNED** | `BLUEPRINT.md`, `ADR-0001` | Nama arsitektur disetujui, **nama fisik folder & package masih `@moonwitness/radio`** hingga M28. |
| **Corpus & Lexicon Modules** | **UNKNOWN (PLAN)** | `TODO.md` (M06–M11) | **Belum ada di kode.** Tidak ada model korpus, ontologi, atau leksikon di `apps/radio` saat ini. |
| **Research / MIZAN / Key Witness**| **UNKNOWN (PLAN)** | `TODO.md` (M12–M15) | **Belum ada di kode.** Rencana riset komparatif dan relasi bertipe. |
| **SHADOW / Creative Stories** | **UNKNOWN (PLAN)** | `TODO.md` (M16–M19) | **Belum ada di kode.** SHADOW saat ini baru berupa visual branding / layout konsep di HQ. |
| **100CENTER / World Monitor / AI** | **UNKNOWN (PLAN)** | `TODO.md` (M20–M26) | **Belum ada di kode.** Fitur opsional/masa depan yang tidak memblokir rilis dasar. |

---

## 2. P0 Blocker & Guard Rules untuk Tahap Selanjutnya

1. **Aturan "No Phantom Feature"**:
   - Dilarang mengimpor data korpus atau riset ke dalam repositori sebelum milestone M06–M11 dibuat skema dan ACL-nya.
2. **Aturan "Preserve Radio"**:
   - Fungsi radio streaming dan port 3000 tidak boleh rusak selama persiapan migrasi nama ARSY (M28).
3. **Exit Gate M00 Verdict**:
   - **M00 DITUTUP LENGKAP & TERVERIFIKASI**. Seluruh status kode telah terdokumentasi dengan SHA `5da8bed`, inventarisasi paket bersih, kontrak rute terpeta, dan diskrepansi visi vs kode telah dipisahkan secara tegas.
