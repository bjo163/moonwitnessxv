# M05-03 — Future Addon Namespace & Registration Standards

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-03
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Context & Collision Prevention

To ensure new domains (e.g. D00-D13) never shadow, overwrite, or collide with existing Radio or Core routes:
1. Every addon MUST declare a unique name conforming to `^[a-z][a-z0-9_]*$`.
2. Model names MUST NOT collide across different addons.
3. Addon REST endpoints MUST NOT use reserved manual module paths (`stations`, `health`, `channels`, `auth`).
4. Custom addon endpoints MUST be prefixed by the addon namespace or explicit `/api/v1/<domain>/...`.

---

## 2. Standard Addon Template

```typescript
import { defineAddon, defineModel, str } from '@moonwitness/moonql'

export default defineAddon({
  name: 'witness_intel',
  depends: ['base', 'auth'],
  models: {
    intel_reports: defineModel({
      label: 'Intel Report',
      rest: true,
      fields: {
        title: str({ maxLength: 100 }),
      },
      seedless: true,
    }),
  },
})
```

---

## 3. Paket Standard (machine-checked)

Sejak audit topologi, bentuk sebuah package bukan lagi konvensi lisan. Tiga guard
menegakkannya di `pnpm test`:
`apps/radio/test/workspace-topology.test.ts`, `dockerfile-contract.test.ts`,
dan `workspace-deps.test.ts`. Satu addon baru wajib memenuhi daftar ini;
kalau salah satu hilang, suite-nya yang menjawab, bukan code review.

| Yang harus ada | Kenapa | Dijaga oleh |
|---|---|---|
| `"private": true` | Publikasi diblokir sampai **ADR-0003** (source rights & consent) bersih. Field `license` sengaja TIDAK dikarang — sebuah field hak cipta adalah klaim. | `workspace-topology.test.ts` |
| `exports` map (`.` + setiap subpath yang diimpor) | Tanpa peta, deep import `pkg/dist/...` resolven kebetulan lalu diam-diam jadi API publik. | `workspace-topology.test.ts`; `workspace-deps.test.ts` memaksa setiap `@scope/x/sub` punya entri `"./x/sub"` di paket yang dipakai |
| `description` | Satu baris tujuan; ini yang dibaca manusia saat memilih paket. | — (kebiasaan, belum ditegakkan) |
| `scripts.build` = `tsc -b`, `dev`, `typecheck` | `pnpm -r typecheck` diam-diam MELONCATKAN paket tanpa script itu — 7 addon domain sempat tidak pernah di-typecheck. | `workspace-topology.test.ts` |
| `tsconfig.references` untuk **setiap** dependensi workspace yang dideklarasikan | Tanpa reference, `tsc -b` kompilasi terhadap `dist` yang kebetulan sudah ada. Urutan build jadi tersirat dari skrip root, dan `pnpm --filter <pkg> build` sendiri bisa gagal. | `workspace-topology.test.ts` |
| Impor hanya lewat nama paket, bukan path relatif keluar direktori | `apps/dock/src/middleware.ts` dulu mengimpor `../../../scripts/security-headers.mjs`, dan shim itu mengimpor `../packages/core/dist/index.js` — dua batas dilewati dengan path. | `workspace-topology.test.ts` ("no source file reaches outside its own package") |
| `README.md` bila paket punya permukaan publik | Konsumen standalone butuh tahu pintu masuk dan pemiliknya. | — (dokumentasi; lihat `packages/web-config/README.md` sebagai contoh) |

## 4. Menambah addon domain (mekanis)

Empat suntingan, dan tidak satu pun di alat build:

1. `packages/<nama>/` dengan `package.json`, `tsconfig.json` (+ references), `src/index.ts`.
2. `apps/radio/package.json` → satu entri `dependencies`.
3. `apps/radio/tsconfig.json` → satu entri `references`.
4. `apps/radio/src/addons.ts` → satu impor + satu entri daftar (satu-satunya titik wiring; lihat komentar berkas itu).

Yang **tidak** perlu disentuh lagi, dan dulu selalu terlupa:

- `package.json` root (`build`/`build:libs` kini diturunkan: `pnpm --filter "./packages/**" build`).
- `Dockerfile` dan `Dockerfile.web` stage `deps` + `prod-deps` (manifest anggota
  diturunkan dari build context lewat `--mount=type=bind` + `find`, bukan ditulis tangan).
- `docs/audit/M13-research-contracts.md` mencatat biaya cara lama secara jujur:
  addon `moonql-research` mengharuskan suntingan manifest + dist di kedua Dockerfile
  "agar gate image tetap lengkap". Cara itu sudah diganti.

Satu hal masih manual dan **sengaja dijaga test**, bukan dihilangkan: daftar
`COPY --from=build /repo/packages/<x>/dist` di runtime stage. Layer explisit itu
memilih isi image (mengambil semuanya berarti membawa paket dev-only), dan
`dockerfile-contract.test.ts` gagal bila sebuah dependensi runtime hub tidak punya
baris dist.

## 5. Batas yang disengaja

- **Belum publishable.** Selain `private`, belum ada `files` dan `license`. Keduanya
  baru bernilai saat ADR-0003 menutup hak sumber; menambahnya sekarang hanya akan
  menjadi hiasan.
- **`scripts/*.mjs` tetap memakai literal port.** Skrip itu adalah jalan keluar saat
  pohon belum di-build, jadi tidak boleh mengimpor hasil build. Yang menjaganya adalah
  `env-contract.test.ts` (bandingkan dengan `packages/cli`, yang sudah di-build dan
  karena itu mengimpor `PORTS` dari `@moonwitness/core`).
- **Root memakai `@moonwitness/eslint-config` lewat nama**, sebagai devDependency, bukan
  `./packages/eslint-config/src/index.js`: aturan yang sama harus berlaku untuk
  aturan lint seperti untuk kode produksi.

