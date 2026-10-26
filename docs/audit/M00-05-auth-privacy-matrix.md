# M00-05 — Authentication, Cookies, REST, Webhooks & Privacy Exposure Audit Matrix

- **Audit Date**: 2026-10-26
- **Context**: MoonWitness XV Fastify Hub (`apps/radio`) & Frontends (`dock`, `headquarters`)

---

## 1. Authentication & Session Surface

| Component | Mechanism | Security Controls | Exposure / Risk Level |
|---|---|---|---|
| **Hub Auth Addon** (`@moonwitness/moonql-auth`) | `Bearer <token>` in `Authorization` header | - Token hash sha256.<br>- Password hash scrypt/argon2id via `crypto.ts`.<br>- Dummy hashing to prevent timing attack on non-existent logins.<br>- Identity cache capped at 500 entries (15s TTL).<br>- `rest: false` on `auth_users` (tidak ada CRUD mentah user). | **Low**: Protected against timing attacks and memory bloating. |
| **Headquarters Session** (`apps/headquarters`) | HTTP-only Cookie (`mw_session`) via Next.js BFF | - Cookie `httpOnly: true`, `sameSite: lax`, `secure: true` in production.<br>- Proxy/Middleware memverifikasi cookie terhadap Hub tanpa mengekspos token ke browser client-side. | **Low**: XSS cannot steal the admin session cookie directly. |
| **API Keys** (`@moonwitness/moonql-apikeys`) | `X-Api-Key` header | - SHA-256 hashed storage.<br>- Scope-based permissions.<br>- Admin only management. | **Medium**: Stored keys must be rotated if leaked. |

---

## 2. Inbound Webhooks & External Triggers

| Webhook / Channel | Endpoint | Security Controls | Exposure / Risk Level |
|---|---|---|---|
| **DENPA Inbound** (`@moonwitness/denpa`) | `POST /api/v1/denpa/transmit` | - `DENPA_TOKEN` wajib (menolak registrasi jika kosong).<br>- Message capped (500 karakter).<br>- Origin IP di-hash menjadi pseudonim (`dn_<hash>`), tidak pernah disimpan plaintext.<br>- Setting gate `requests_open` dapat ditutup oleh operator kapan saja. | **Low**: DoS & data leakage mitigations in place. |
| **WhatsApp Inbound/Outbound** (`@moonwitness/whatsapp`) | Baileys Socket | - Outbound only via ChannelManager (admin-triggered).<br>- Session credentials disimpan di volume aman (`moonwitness_wa_auth`). | **Medium**: WA session keys must not be checked into Git. |

---

## 3. Privacy & Public Telemetry Surface

| Feature | Surface | Privacy Controls | Compliance Status |
|---|---|---|---|
| **Playlog Listen Beacon** (`@moonwitness/moonql-playlog`) | `POST /api/v1/playlogs/beacon` | - Pendengar di-hash dengan pseudonim deterministik (`ls_<hash>`), IP mentah langsung dibuang.<br>- Waktu dengar di-clamp (maksimal 24 jam) untuk mencegah overflow data aneh. | **Safe**: Zero PII (Personally Identifiable Information) stored. |
| **Announcer Request** (`apps/radio/src/modules/announcer`) | `POST /api/v1/announcer/request` | - Input string dibatasi panjangnya.<br>- Tidak menyimpan identitas pribadi selain pesan lagu. | **Safe**: Non-PII queue. |
| **Metrics** (`/api/v1/metrics`) | Prometheus Text | - Admin only atau restricted internal scrape.<br>- Dynamic ID di-path di-aggregate menjadi satu label series untuk mencegah cardinality explosion. | **Safe**: No customer data in metrics. |

---

## 4. Egress Policy (Outbound Traffic)
- Outbound fetch dibatasi oleh `installEgress`:
  - Mencegah SSRF terhadap private IP (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254` AWS metadata).
  - Mengisolasi cron jobs (now-playing fetcher) agar kegagalan jaringan eksternal tidak membuat crash Fastify process.
