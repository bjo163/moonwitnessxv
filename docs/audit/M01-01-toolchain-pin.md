# M01-01 — Toolchain Pin & Lockfile Compatibility Specification

- **Audit Date**: 2026-10-26
- **Commit SHA**: `fb6a548`

> **Revalidasi akhir 2026-10-26 — LULUS.** Pin lama `>=20` dan `.nvmrc 20.18.0`
> tidak kompatibel dengan lockfile: `@eslint/js@10.0.1` membutuhkan
> `^20.19.0 || ^22.13.0 || >=24`, dan `cookie@2.0.1` membutuhkan Node `>=22`.
> Seluruh sisi kini memakai **Node 24 LTS**: `.nvmrc`, `package.json#engines`,
> CI (`node-version-file: .nvmrc`), serta kedua Dockerfile (`node:24-slim`).
> Checkout bersih di `fb6a548` lulus `pnpm install --frozen-lockfile` dan
> `pnpm verify` (199 test, 197 pass, 2 skipped, 0 fail). Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Toolchain Specifications

| Tool | Pinned Version / Range | Configuration Source |
|---|---|---|
| **Node.js** | `24.x` LTS (range `>=24 <25`) | `.nvmrc` (`24`), `package.json#engines`, `.github/workflows/ci.yml` (`node-version-file: .nvmrc`), `Dockerfile`/`Dockerfile.web` (`node:24-slim`) |
| **pnpm** | `10.33.4` (Exact) | `package.json#packageManager` |
| **Lockfile Version** | `pnpm-lock.yaml` (v9 / pnpm v10 compliant) | Root `pnpm-lock.yaml` |

---

## 2. Strict Engine & Workspace Enforcement
- `.npmrc`:
  - `engine-strict=true`: Mencegah instalasi dependensi jika versi Node.js tidak memenuhi syarat `>=24 <25`.
  - `link-workspace-packages=true`: Memastikan paket internal monorepo selalu terhubung lokal secara konsisten.
- `package.json`:
  ```json
  "packageManager": "pnpm@10.33.4",
  "engines": {
    "node": ">=24 <25"
  }
  ```

---

## 3. Clean-Checkout Verification

Dijalankan pada worktree bersih di `fb6a548` dengan Node `v24.22.1` dan pnpm
`10.33.4`:

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | exit 0 |
| `pnpm build` | exit 0 |
| `pnpm lint` | exit 0 (0 error; warning non-blocking) |
| `pnpm gen:sdk:check` | `moonql: generated SDK is up to date` |
| `pnpm test` | 199 test, 197 pass, 2 skipped, 0 fail |
| `pnpm build:web` | exit 0 (dock + headquarters) |

`.gitattributes` memaku tiga artefak kontrak SDK ke LF agar checkout Windows
tidak menghasilkan drift palsu pada `gen:sdk:check`.
