# M01-06 — Dependency Audit & Secret-Scanning Gate

- **Audit Date**: 2026-10-26

> **Revalidasi 2026-10-26 — TASK DIBUKA KEMBALI.** Tidak ada langkah
> `pnpm audit` atau secret scanning di `.github/workflows/ci.yml`. `.gitignore`
> aktual tidak memuat `*.key`, `*.pem`, `*.dump`, atau store WhatsApp seperti
> yang diklaim dokumen ini. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Secret Scanning & Git Leaks Prevention
- File sensitif yang wajib diabaikan (`.gitignore`):
  - `.env`, `.env.local`, `.env.production`
  - `*.key`, `*.pem`, `*.dump`
  - WhatsApp credential stores (`data/`, `auth_info_baileys/`)
- Guard pada `.gitignore`:
  ```
  .env
  *.log
  dist/
  data/
  ```

---

## 2. Dependency Audit Procedure
Pengecekan kerentanan dependensi internal pnpm:
```powershell
pnpm audit --audit-level high
```
- Menolak penambahan paket third-party yang membawa kerentanan tingkat kritis (`critical` atau `high`).
- Paket yang di-install wajib tercatat di `pnpm-lock.yaml` dan menggunakan versi fixed / catalog.
