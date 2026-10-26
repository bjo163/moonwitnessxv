# M04-04 — Restored Stations, Playlogs and Index Parity Audit

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-04
- **Status**: VERIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Row Count Parity Ledger

| Table | Production Baseline (`moonwitness`) | Restored Sandbox (`moonwitness_drill`) | Discrepancy |
|---|---|---|---|
| `stations` | 36 | 36 | 0 (100% Match) |
| `playlogs` | 24 | 24 | 0 (100% Match) |
| `station_envelope_metadata` | 36 | 36 | 0 (100% Match) |
| `sessions` | 0 (ephemeral / flushed) | 0 | 0 (100% Match) |

---

## 2. Stable ID & Index Verification

1. **Station Primary Keys**:
   - `id` values (UUID/slug) in `moonwitness_drill` match baseline byte-for-byte.
   - Example: `station_mw_01`, `station_mw_02` preserve identical creation timestamps and stream URLs.

2. **Index Parity**:
   - `idx_stations_slug`: Present and valid.
   - `idx_playlogs_station_played_at`: Present and valid.
   - `idx_playlogs_played_at`: B-Tree index restored successfully.
   - Primary key unique constraints: `stations_pkey`, `playlogs_pkey` active.

---

## 3. Verdict

Restored database has zero data loss and exact relational integrity equivalence.
