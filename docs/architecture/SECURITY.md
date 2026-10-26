# Data release/privacy contract
Source rights/consent in accepted ADR-0003 and D08 override public UI. `ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection. Test anonymous/role/expand/export/cache/search, withdrawn witness, hardcoded RIGHTS_CLEARED, unreviewed research, minor consent and false mandate status. HQ forged cookie/TTL, Cockpit local process commands, AI Gateway model egress, Sentinel static credential fallback and off-host backups remain review gates. No inference here that services are publicly exploited. M01/M03/M04/M16–18/M27.

## Object storage and attachments (ECHOLOG, D19)

**Status: accepted contract (ADR-0007), not implemented.** Review gates for any storage work:

- **Driver credentials never leave ECHOLOG.** The S3/MinIO keys live only in that service's environment. They must not appear in the database, in consumer apps, in logs, or in committed files. A consumer holds at most a short-lived download grant.
- **Grants are short.** Presigned download TTL ≤ 5 minutes, never logged, never returned to an unauthenticated caller, never used for upload.
- **Inbound bytes are untrusted.** Enforce a size cap and a MIME allow-list *before* commit; internal keys are `sha256/<hex>` only; the original filename is sanitized before it reaches `Content-Disposition`; a partially written upload must never become a visible object.
- **No bytes in Postgres.** No `bytea` column anywhere; ECHOLOG is stateless and holds no tables. This keeps database backups small and keeps the off-host backup gate meaningful.
- **Retention is a safety property.** `legal_hold` and an unexpired `retention_until` make deletion fail closed with an explanation; only an explicit admin GC may remove expired objects.
- **Scan status is reported honestly.** `scan: skipped` is not `clean`; the UI must say which one it is, and no `LIVE`/`NOMINAL` badge may imply a scan that never ran.
- **Egress.** `echolog` belongs on the `@moonwitness/core` egress deny list so a provider URL cannot be pointed back at the storage service.
- **Related gate:** the owner-deferred off-host backup task waits specifically on an S3-compatible bucket target; once ECHOLOG provides one, that gate can be re-opened rather than assumed satisfied.
