# M00-03 — Station Seed & Public Response Envelope Specification

- **Audit Date**: 2026-10-26
- **Context**: Existing Signal/Radio Public Contract (Port 3000 / Dock 3001)

---

## 1. Standard API Envelope

Semua respons REST dikembalikan dalam format envelope standar dari `@moonwitness/core`:

```typescript
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    serverTime?: string
  }
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

---

## 2. Seed Stations (Initial Seed Baseline)

Data stasiun yang di-seed saat database kosong:

| ID | Name | Genre / Tag | Stream URL | Status |
|---|---|---|---|---|
| `station-nightfall` | Nightfall FM | Lofi / Ambient / Noir | `https://stream.moonwitness.internal/nightfall` | active |
| `station-denpa` | Denpa Wave | Glitch / Post-punk / Tokyo | `https://stream.moonwitness.internal/denpa` | active |
| `station-shadow` | Shadow Transmission | Drone / Storytelling / Underground | `https://stream.moonwitness.internal/shadow` | active |

---

## 3. Public Response Fixture Examples

### `GET /api/v1/stations` (Public List)
```json
{
  "data": [
    {
      "id": "station-nightfall",
      "name": "Nightfall FM",
      "genre": "Lofi / Ambient",
      "status": "active",
      "bitrate": 320,
      "format": "mp3",
      "createdAt": "2026-10-26T00:00:00.000Z",
      "updatedAt": "2026-10-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "limit": 50,
    "page": 1
  }
}
```

### `GET /api/v1/schedules/on-air` (Public On-Air Frame)
```json
{
  "data": {
    "stationId": "station-nightfall",
    "trackTitle": "Midnight Tape #04",
    "artist": "Echo Operator",
    "startedAt": "2026-10-26T08:00:00.000Z",
    "durationSeconds": 180
  }
}
```
*Catatan Keamanan:* Kolom internal stasiun/server tidak pernah diekspos dalam respons publik on-air frame.
