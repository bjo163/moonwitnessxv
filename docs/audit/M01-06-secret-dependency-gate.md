# M01-06 — Dependency Audit & Secret-Scanning Gate

- **Audit Date**: 2026-10-26

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
