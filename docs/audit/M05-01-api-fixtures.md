# M05-01 — OpenAPI, Envelopes and Error Fixtures Baseline

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-01
- **Status**: PINNED & VERIFIED (revalidated 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** sintaks filter dikoreksi. REST MoonQL memakai
> `?where={...}` (JSON object yang diparse `parseWhereJson`,
> `packages/moonql/src/rest.ts:37,180`), bukan `?where[field]=<val>`. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Pinned Envelope Contracts

MoonWitness Hub adheres to a unified JSON response envelope format across all endpoints:

### Success Envelope (`{ ok: true, data: ..., timestamp: ... }`)
```json
{
  "ok": true,
  "data": {
    "status": "ok"
  },
  "timestamp": "2026-10-26T08:44:00.000Z"
}
```

### Error Envelope (`{ ok: false, error: { message: ... } }`)
```json
{
  "ok": false,
  "error": {
    "message": "Route GET:/api/v1/unknown not found"
  }
}
```

---

## 2. Pinned Query Parameters Contract

All MoonQL generated REST routes (`/api/v1/<model>` or `/orm/<model>`) support deterministic querying:
- `?limit=<N>`: Bounded by model `maxLimit` (default 200).
- `?offset=<N>`: Integer offset pagination.
- `?where={"field":"value"}`: Filter JSON object, divalidasi dan diparameterisasi.
- `?order=-createdAt`: Deterministic ordering.
- `?expand=m2oField`: Bounded relation joining.
- `?total=true`: Mengirim header `x-total-count`; dihilangkan bila ada row rule
  agar tidak menjadi counting oracle.
