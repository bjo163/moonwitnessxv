# Data release/privacy contract
Source rights/consent in accepted ADR-0003 and D08 override public UI. `ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection. Test anonymous/role/expand/export/cache/search, withdrawn witness, hardcoded RIGHTS_CLEARED, unreviewed research, minor consent and false mandate status. HQ forged cookie/TTL, Cockpit local process commands, AI Gateway model egress, Sentinel static credential fallback and off-host backups remain review gates. No inference here that services are publicly exploited. M01/M03/M04/M16–18/M27.

## SKYLINK provider credentials and raw messages (D18)

- Provider bot tokens and Telegram webhook secret tokens belong only in SKYLINK's secret environment/secret manager. `channel_accounts.auth_ref` stores a reference, never the token. Do not put tokens in source, fixtures that resemble production credentials, database fields, request/response bodies, or logs. Rotate both values by setting the new secret at Telegram and the service together; reject requests during mismatch, then remove the old value.
- Telegram's Bot API authenticates webhooks with the configured `X-Telegram-Bot-Api-Secret-Token` header; it does **not** sign the body. SKYLINK must check that header in constant time before JSON parsing. Use the D18 unique provider update/message identifier to reject duplicate delivery; do not describe the Telegram header as a body signature.
- The current D18 `messages` schema stores normalized `body` and metadata and has no `raw` column. Provider request bytes are not persisted; retention for `messages.raw` is therefore **zero** today. Normalized message bodies can contain personal data (including names, contact identifiers and private text); they remain private D18 data and must not be copied into logs or public surfaces.
- Do not begin storing raw Telegram updates or real conversations until the D18 model contract defines purpose, PII classification, access controls, retention duration, and per-conversation deletion. If a future accepted change adds `messages.raw`, default retention must be at most 30 days, with deletion enforced and reviewed before real data is ingested. No task may infer that normalized message text is safe for public release.

## Object storage and attachments (ECHOLOG, D19)

**Status: accepted contract (ADR-0007 Amendment 1).** ECHOLOG is being changed to serve a bounded S3-compatible API over its own filesystem storage. The protocol/authentication implementation is not yet verified; no production endpoint or off-host backup has been verified. Review gates for storage work:

- **S3 credentials never leave ECHOLOG.** S3 access and secret keys live only in ECHOLOG's environment and must not appear in the database, consumer apps, logs, or committed files. A consumer holds at most a short-lived download grant for the ECHOLOG REST surface.
- **SigV4 is fail-closed.** The S3 endpoint accepts only the documented SigV4 header-auth subset, signed payloads, one configured path-style bucket, bounded request sizes and a narrow operation allow-list. Reject invalid signatures, unsupported streaming/query auth, stale dates, malformed canonical paths, and unknown credentials without storage writes. Never log Authorization headers, signatures, secrets, or object bytes. Use constant-time signature comparison and TLS at any non-loopback boundary.
- **Grants are short.** Presigned download TTL ≤ 5 minutes, never logged, never returned to an unauthenticated caller, never used for upload.
- **Inbound bytes are untrusted.** Enforce a size cap and a MIME allow-list *before* commit; internal keys are `sha256/<hex>` only; the original filename is sanitized before it reaches `Content-Disposition`; a partially written upload must never become a visible object.
- **No bytes in Postgres.** No `bytea` column anywhere; ECHOLOG is stateless and holds no tables. This keeps database backups small and keeps the off-host backup gate meaningful.
- **Retention is a safety property.** `legal_hold` and an unexpired `retention_until` make deletion fail closed with an explanation; only an explicit admin GC may remove expired objects.
- **Scan status is reported honestly.** `scan: skipped` is not `clean`; the UI must say which one it is, and no `LIVE`/`NOMINAL` badge may imply a scan that never ran.
- **Egress.** `echolog` belongs on the `@moonwitness/core` egress deny list so a provider URL cannot be pointed back at the storage service.
- **Related gate:** the owner-deferred off-host backup task waits for an S3-compatible target hosted off the backup machine and a demonstrated restore. ECHOLOG running on the same host does not satisfy “off-host.”

## Cockpit local control plane

Cockpit is a loopback-only supervisor that can spawn/kill workspace processes (`pnpm --filter <pkg> dev`), release ports, and read the error ledger. Its trust model is "same machine, same operator", which is enforced as follows:

- **The server binds `127.0.0.1` only** (`apps/cockpit/src/index.ts`). It is never exposed publicly; there is no identity system and no multi-user story.
- **CORS accepts only loopback origins.** `@fastify/cors` is configured with a predicate that allows `http(s)://(127.0.0.1|localhost|[::1])(:port)` and refuses anything else, so a page on another host cannot read responses (`apps/cockpit/src/server.ts`, `LOOPBACK_ORIGIN`).
- **Mutating routes require a per-boot token.** Every `POST/PUT/PATCH/DELETE` must carry `x-moondeck-token` matching a token generated at boot and delivered only through the same-origin `GET /api/config`. The same `preHandler` also rejects a non-loopback `Host` (DNS rebinding) and a non-loopback `Origin` (cross-site form/fetch) with 403, and a missing/invalid token with 401. The token is a CSRF guard for one process lifetime — it is not a secret store, is never logged, and must not be reused as an identity credential.
- **Static assets are contained.** `/assets/*` resolves the requested path and refuses anything outside the built assets directory, serving only an allow-listed set of static extensions; the ledger and error-log paths are never taken from a request.
- **The in-memory channel list is bounded** (`MAX_CHANNELS`) with a scheme-validated `http/https` `streamUrl`, so a runaway client cannot grow the process heap without limit. Channels are session-scoped and not persisted: Cockpit owns no SQL and must not become a data owner.
- **Review gate:** changes to the `preHandler`, the CORS predicate, the token delivery path, or `/api/ports/free` must re-verify these properties with the tests in `apps/cockpit/test/` (no token → 401, foreign `Origin` → 403, rebinding `Host` → 403, traversal → 404).
