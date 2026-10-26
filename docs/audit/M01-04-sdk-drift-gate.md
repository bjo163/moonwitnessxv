# M01-04 — Schema Drift & Generated SDK Gate Specification

- **Audit Date**: 2026-10-26
- **Tool**: `pnpm gen:sdk:check` (`apps/radio/src/tools/gen-sdk.ts --check`)

> **Revalidasi 2026-10-26:** gate lulus di worktree saat ini
> (`moonql: generated SDK is up to date`), tetapi gagal di checkout bersih HEAD
> karena `packages/moonql-base/dist/data/*` tidak dapat dibuat (file sumber
> `data/` di-ignore). CI belum pernah menjalankan gate ini karena install gagal.
> Lihat [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Mekanisme Gate Drift

Gate ini memastikan kode TypeScript client SDK (`packages/moonql-client/src/generated.ts`) dan dokumen snapshot (`schema-snapshot.json`) tidak pernah menyimpang (*drift*) dari model aktual yang terdaftar di Fastify Hub:

```powershell
pnpm --filter @moonwitness/radio exec tsx src/tools/gen-sdk.ts --check
```

### Logika Gate:
1. `installAddons` memuat seluruh addon MoonQL dan merender `SchemaDocument` saat ini.
2. Membandingkan hash dan konten dengan file yang sudah di-commit (`generated.ts` dan `schema-snapshot.json`).
3. Jika ada modifikasi model atau rute yang belum di-generate ulang, perintah keluar dengan **exit code 1** dan menggagalkan `pnpm verify` / CI.
4. Jika terdapat perubahan yang memecah kompatibilitas (*breaking change* seperti menghapus field/view), perintah mewajibkan peningkatan versi SemVer mayor atau flag `--force` dengan alasan tertulis di `schema-history.json`.

---

## 2. Test Verification
- Pengujian otomatis pada [`apps/radio/test/gen-sdk-gate.test.ts`](file:///z:/project/moonradio/apps/radio/test/gen-sdk-gate.test.ts):
  - Menguji penolakan breaking change tanpa persetujuan manusia.
  - Menguji pencatatan histori skema pada `appendHistory`.
  - Menguji drift gate deteksi modifikasi file tak sinkron.
