# M01-05 — SemVer, Changelog & Protected Release Lifecycle

- **Audit Date**: 2026-10-26
- **Baseline Version**: `1.0.0`

> **Revalidasi 2026-10-26 — TASK DIBUKA KEMBALI.** Dokumen ini mendefinisikan
> SemVer dan rollback, tetapi tidak ada `CHANGELOG.md`/prosedur changelog dan
> tidak ada bukti protected branch/release protection. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Aturan Semantic Versioning (SemVer)
- **MAJOR (`x.0.0`)**:
  - Diterapkan jika ada *Breaking Change* pada model REST/ORM MoonQL, penghapusan field/view, atau perubahan skema database yang memutus kontrak API publik.
  - Memerlukan pencatatan entri di `packages/moonql-client/src/schema-history.json`.
- **MINOR (`1.x.0`)**:
  - Diterapkan pada penambahan fitur aditif (field baru opsional, addon baru, rute baru tanpa memutus yang lama).
- **PATCH (`1.0.x`)**:
  - Diterapkan pada perbaikan bug internal, optimasi linter, atau perbaikan styling UI.

---

## 2. Prosedur Release & Rollback

### Alur Release:
1. Pastikan seluruh gate lulus lokal:
   ```powershell
   pnpm verify
   ```
2. Buat git tag:
   ```powershell
   git tag -a v1.0.0 -m "Release v1.0.0: MoonWitness XV Foundation"
   git push origin v1.0.0
   ```

### Prosedur Rollback:
1. Jika terjadi regresi di produksi, rollback image container ke SHA commit stabil sebelumnya melalui Docker Compose:
   ```powershell
   git checkout <LAST_STABLE_SHA>
   docker compose up -d --build
   ```
2. Jika ada masalah migrasi database, jalankan prosedur pemulihan data dari snapshot backup terverifikasi ([`docs/runbook-restore.md`](../runbook-restore.md)).
