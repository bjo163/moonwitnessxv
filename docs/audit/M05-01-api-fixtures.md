# M05-01 — OpenAPI, Envelopes and Error Fixtures Baseline

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-01
- **Status**: PINNED & VERIFIED
- **Auditor**: MoonWitness XV Architecture Group

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
- `?where[field]=<val>`: Filtering with parameterization.
- `?order=-createdAt`: Deterministic ordering.
- `?expand=m2oField`: Bounded relation joining.
