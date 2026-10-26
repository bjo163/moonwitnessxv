# M05-05 — Pagination, Filter/Expand, Locale and UNKNOWN Query Standards

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-05
- **Status**: RATIFIED (revalidated 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** tiga klaim dikoreksi — stations memakai
> `maxLimit` 200 (bukan 100), `?limit` di atas maximum ditolak schema 400 (bukan
> di-clamp), dan belum ada filter/fallback locale di MoonQL. Lihat
> [laporan revalidasi](../audit/M01-M05-revalidation-2026-10-26.md).

---

## 1. Query Bounds Enforcement

1. **Upper Bound on ?limit**:
   - Setiap model punya `maxLimit`; default 200 (`packages/moonql/src/model.ts:213`). Stations memakai 200; countries/currencies/languages memakai 300.
   - `?limit` di atas maximum ditolak schema Fastify dengan `400` (`packages/moonql/src/jsonschema.ts:100`), bukan di-clamp diam-diam. Repository memakai `query.limit ?? maxLimit` (`repository.ts:204`).
   - Tujuannya tetap mencegah query tak terbatas; kontraknya adalah penolakan eksplisit, bukan pemotongan.

2. **Bounded Expand**:
   - `expand` pada relasi `m2o` hanya mengambil parent record.
   - `expand` pada relasi `o2m` dibatasi 50 child per parent (`packages/moonql/src/repository.ts:151`); truncation dicatat di log.

3. **Locale & UNKNOWN Values**:
   - Tidak ada parameter `locale`, filter locale, atau fallback locale di MoonQL saat ini. Perilaku locale adalah **UNKNOWN/out of scope** sampai diimplementasikan.
   - Nilai enum/filter yang tidak dikenal tidak boleh menghasilkan 500; nilai yang tidak tersimpan diserialisasi sebagai `null`, bukan nilai karangan.
