# ECHOLOG — storage surface contract

**Status: ACCEPTED boundaries (ADR-0007), PLANNED implementation (M39).** This file records the contract, not shipped behaviour. Decision: [ADR-0007](../decisions/ADR-0007-echolog-storage.md). Task status: [TODO](../../TODO.md#m39--echolog-storage-and-attachments).

## What it is

`apps/echolog` / `@moonwitness/echolog` — a bounded, **stateless** storage service, port **3006**, owning domain **D19 Object Storage & Attachments**. It stores immutable objects and the metadata that travels with them; it never stores conversation rows, rights decisions or identity.

It fills the slot [BLUEPRINT](../../BLUEPRINT.md) already reserved: *"Approved asset storage owns one immutable version of consented media/source bytes; XV stores metadata/digests. No public private-archive dumps."*

Dependency direction is one-way: `other apps → API → ECHOLOG → storage driver`. ECHOLOG never calls ARSY to persist bytes.

## Stateless by contract

ECHOLOG owns **no tables** and imports no SQL driver. ADR-0006's closed SQL-owner set therefore stays exactly `{@moonwitness/moonql, @moonwitness/skylink-store}`. Object metadata is a JSON sidecar written next to the object (and mirrored into S3 object metadata/tags on the `s3` driver):

```
filename, content_type, size, digest, uploader, created_at,
retention_until, legal_hold, scan{pending|clean|infected|skipped}, tags
```

If SQL metadata ever becomes necessary, it requires a new ADR that withdraws the stateless clause — never a silent schema.

## Storage model

- **Key:** `sha256/<digest>` — content-addressed, **write-once**, immutable. Re-uploading identical bytes is a no-op that returns the same key (dedupe).
- **Drivers:** `fs` (default) then `s3` (MinIO, R2, AWS S3). MinIO is an optional profiled compose service, not a requirement.
- **Upload passes through the service:** stream to a temporary key, hash while writing, enforce size + MIME allow-list, commit atomically, then write the sidecar. Nothing becomes an object before verification.
- **Download** uses a short-lived presigned grant (≤5 min) or a streamed `fs` response.
- **Deletion** fails closed with `409` while `legal_hold` is set or retention has not elapsed; an explicit admin GC removes expired objects and reports those it held.

## Data ownership (D19)

| ECHOLOG owns | Not its concern |
|---|---|
| object bytes, digest, size, MIME, retention, legal hold, quota, download grants | rights/consent (D08), identity/sessions (D00), `media_manifests` (D07), artifact/passage metadata (D01), message rows (D18) |

Consumers store **references only**: `{object_key, digest, size, content_type}`. Attachment-to-message links stay in D18 (`messages.media[]`).

## Identity

D00 stays in ARSY. ECHOLOG issues no sessions. Two authorization modes, per route: `x-echolog-key` for services, `Authorization: Bearer <ARSY session>` for the operator UI validated upstream with a short cache. No cookies, no login endpoint.

## Surfaces

- REST: `POST /api/v1/objects` (multipart/stream) · `GET /api/v1/objects/:key/meta` · `GET /api/v1/objects/:key` (grant or stream) · `DELETE /api/v1/objects/:key` · `POST /api/v1/gc` · `GET /health` · `GET /health/ready`.
- No WebSocket surface in v1.

## Non-goals v1

Writing an S3 server · split/multipart uploads · CDN/edge cache · active antivirus (the `scan` slot records `skipped`) · image transforms/thumbnails · SQL metadata queries · home-made per-object encryption.

## Rollback

Stopping ECHOLOG leaves every object intact because nothing else writes them; consumers fall back to local files or a no-op. No schema to revert, because there is none.
