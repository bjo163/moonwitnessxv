# M01-01 — Toolchain Pin & Lockfile Compatibility Specification

- **Audit Date**: 2026-10-26
- **Commit SHA**: `85c78bc`

---

## 1. Toolchain Specifications

| Tool | Pinned Version / Range | Configuration Source |
|---|---|---|
| **Node.js** | `>=20` (CI / Recommended runtime: `20.x` LTS or `22.x`) | `package.json#engines`, `.nvmrc` |
| **pnpm** | `10.33.4` (Exact) | `package.json#packageManager` |
| **Lockfile Version** | `pnpm-lock.yaml` (v9 / pnpm v10 compliant) | Root `pnpm-lock.yaml` |

---

## 2. Strict Engine & Workspace Enforcement
- `.npmrc`:
  - `engine-strict=true`: Mencegah instalasi dependensi jika versi Node.js tidak memenuhi syarat `>=20`.
  - `link-workspace-packages=true`: Memastikan paket internal monorepo selalu terhubung lokal secara konsisten.
- `package.json`:
  ```json
  "packageManager": "pnpm@10.33.4",
  "engines": {
    "node": ">=20"
  }
  ```
