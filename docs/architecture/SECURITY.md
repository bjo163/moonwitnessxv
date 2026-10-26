# Data release/privacy contract
Source rights/consent in accepted ADR-0003 and D08 override public UI. `ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection. Test anonymous/role/expand/export/cache/search, withdrawn witness, hardcoded RIGHTS_CLEARED, unreviewed research, minor consent and false mandate status. HQ forged cookie/TTL, Cockpit local process commands, AI Gateway model egress, Sentinel static credential fallback and off-host backups remain review gates. No inference here that services are publicly exploited. M01/M03/M04/M16–18/M27.

## SKYLINK provider credentials and raw messages (D18)

- Provider bot tokens and Telegram webhook secret tokens belong only in SKYLINK's secret environment/secret manager. `channel_accounts.auth_ref` stores a reference, never the token. Do not put tokens in source, fixtures that resemble production credentials, database fields, request/response bodies, or logs. Rotate both values by setting the new secret at Telegram and the service together; reject requests during mismatch, then remove the old value.
- Telegram's Bot API authenticates webhooks with the configured `X-Telegram-Bot-Api-Secret-Token` header; it does **not** sign the body. SKYLINK must check that header in constant time before JSON parsing. Use the D18 unique provider update/message identifier to reject duplicate delivery; do not describe the Telegram header as a body signature.
- The current D18 `messages` schema stores normalized `body` and metadata and has no `raw` column. Provider request bytes are not persisted; retention for `messages.raw` is therefore **zero** today. Normalized message bodies can contain personal data (including names, contact identifiers and private text); they remain private D18 data and must not be copied into logs or public surfaces.
- Do not begin storing raw Telegram updates or real conversations until the D18 model contract defines purpose, PII classification, access controls, retention duration, and per-conversation deletion. If a future accepted change adds `messages.raw`, default retention must be at most 30 days, with deletion enforced and reviewed before real data is ingested. No task may infer that normalized message text is safe for public release.

## Object storage and attachments (ECHOLOG, D19)

**Status: accepted contract (ADR-0007).** The filesystem driver and REST/auth layer are implemented locally; S3 driver/MinIO profile validation is in progress. No production bucket or off-host backup has been verified. Review gates for storage work:

- **Driver credentials never leave ECHOLOG.** The S3/MinIO keys live only in that service's environment. They must not appear in the database, in consumer apps, in logs, or in committed files. A consumer holds at most a short-lived download grant.
- **Grants are short.** Presigned download TTL ≤ 5 minutes, never logged, never returned to an unauthenticated caller, never used for upload.
- **Inbound bytes are untrusted.** Enforce a size cap and a MIME allow-list *before* commit; internal keys are `sha256/<hex>` only; the original filename is sanitized before it reaches `Content-Disposition`; a partially written upload must never become a visible object.
- **No bytes in Postgres.** No `bytea` column anywhere; ECHOLOG is stateless and holds no tables. This keeps database backups small and keeps the off-host backup gate meaningful.
- **Retention is a safety property.** `legal_hold` and an unexpired `retention_until` make deletion fail closed with an explanation; only an explicit admin GC may remove expired objects.
- **Scan status is reported honestly.** `scan: skipped` is not `clean`; the UI must say which one it is, and no `LIVE`/`NOMINAL` badge may imply a scan that never ran.
- **Egress.** `echolog` belongs on the `@moonwitness/core` egress deny list so a provider URL cannot be pointed back at the storage service.
- **Related gate:** the owner-deferred off-host backup task waits specifically on an S3-compatible bucket target; once ECHOLOG provides one, that gate can be re-opened rather than assumed satisfied.
