# M00-01 — Baseline HEAD & Workspace Inventory Snapshot

- **Audit Date**: 2026-10-26
- **Commit SHA**: `787210b71903020f56433f2f4b9c7b4257ba3d88` (Short: `787210b`)
- **Git Branch**: `main`
- **Remote Origin**: `https://github.com/bjo163/moonwitnessxv.git`
- **Toolchain**:
  - Node.js: `>=20`
  - Package Manager: `pnpm@10.33.4`

---

## 1. Workspace Inventory

| Package Name | Path | Type | Role |
|---|---|---|---|
| `moonwitness-xv` | `.` | Root Monorepo | Workspace scripts & orchestration |
| `@moonwitness/radio` | `apps/radio` | App (Port 3000) | Fastify & MoonQL API/ORM hub (target ARSY Hub / M28) |
| `@moonwitness/dock` | `apps/dock` | App (Port 3001) | Public homepage, station catalog & audio listening (Next.js 16 RSC) |
| `@moonwitness/headquarters` | `apps/headquarters` | App (Port 3002) | Admin command center (Next.js 16 RSC + server actions) |
| `@moonwitness/core` | `packages/core` | Package | Shared schemas, HTTP envelopes, time utils, hashing |
| `@moonwitness/denpa` | `packages/denpa` | Package | Inbound webhook signal listener plugin |
| `@moonwitness/moonql` | `packages/moonql` | Package | Declarative ORM runtime, postgres/memory engine, event bus, REST |
| `@moonwitness/moonql-apikeys`| `packages/moonql-apikeys` | Package Addon | API key management, generation, and validation |
| `@moonwitness/moonql-auth` | `packages/moonql-auth` | Package Addon | User authentication, sessions, crypto, password hashing |
| `@moonwitness/moonql-base` | `packages/moonql-base` | Package Addon | Base schemas, core contracts |
| `@moonwitness/moonql-client` | `packages/moonql-client` | Package | Type-safe SDK client generated from MoonQL schema contract |
| `@moonwitness/moonql-ops` | `packages/moonql-ops` | Package Addon | System metrics, audit trail, ops SSE event stream |
| `@moonwitness/moonql-playlog` | `packages/moonql-playlog` | Package Addon | Station airplay log, listening tracking, quality beacons |
| `@moonwitness/moonql-schedule`| `packages/moonql-schedule`| Package Addon | Station broadcast schedule and time-slot tracking |
| `@moonwitness/moonql-settings`| `packages/moonql-settings`| Package Addon | System key-value configurations |
| `@moonwitness/moonql-stations`| `packages/moonql-stations`| Package Addon | Radio station catalog, streams, and status |
| `@moonwitness/moonui` | `packages/moonui` | Package | Shared Design System (Zine aesthetic, Crown, BrandLogo, layout) |
| `@moonwitness/whatsapp` | `packages/whatsapp` | Package Channel | WhatsApp (Baileys) outbound messaging integration |

---

## 2. Integrity Verification
- `git status`: Working tree clean at `787210b`.
- Semua dependensi terisolasi dalam `pnpm-workspace.yaml`.
- Tidak ada modul duplikat atau paket tak terdaftar dalam monorepo.
