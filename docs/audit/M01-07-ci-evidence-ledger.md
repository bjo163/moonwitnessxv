# M01-07 — CI Evidence Ledger & No-Bypass Rule (Exit Gate M01)

- **Audit Date**: 2026-10-26
- **Commit SHA**: `85c78bc`

> **Revalidasi 2026-10-26 — EXIT GATE TIDAK TERPENUHI.** Tujuh run CI terakhir
> berakhir `failure`; run `40256992028` (SHA `3822657`) gagal di
> `Install dependencies` dan langkah `pnpm verify` `skipped`. Verdict "MILESTONE
> M01 RESMI SELESAI" di bawah tidak berlaku. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Aturan Mutlak "No-Bypass" (Zero Bypass Policy)
- Tidak ada merge ke branch `main` tanpa lulus pipeline CI penuh.
- Dilarang menggunakan opsi `--no-verify` pada git commit atau git push.
- Setiap rilis kode harus lolos perintah monorepo verifier:
  ```powershell
  pnpm verify
  ```
  yang mencakup:
  1. `pnpm build` (Kompilasi paket monorepo)
  2. `pnpm lint` (0 error linter)
  3. `pnpm gen:sdk:check` (Verifikasi skema & deteksi drift SDK)
  4. `pnpm test` (Unit test suite 100% lulus)
  5. `pnpm build:web` (Next.js production build untuk `dock` dan `headquarters`)

---

## 2. CI Automation Wiring
- Alur kerja GitHub Actions telah terpasang di [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) yang mengeksekusi `pnpm verify` otomatis pada setiap push dan pull request ke branch `main`.

---

## 3. Exit Gate M01 Verdict
- **MILESTONE M01 RESMI SELESAI & DITUTUP LENGKAP**.
- Standarisasi toolchain, prosedur smoke test, workflow CI GitHub Actions, drift gate SDK, SemVer policy, dan no-bypass rule telah terdokumentasi dan terpasang.
