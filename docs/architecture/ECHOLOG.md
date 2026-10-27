# ECHOLOG — storage surface contract

**Status: ACCEPTED boundaries (ADR-0007 Amendment 1), implementation in progress (M39).** This file records the contract, not shipped behaviour. Decision: [ADR-0007](../decisions/ADR-0007-echolog-storage.md). Task status: [TODO](../../TODO.md#m39--echolog-storage-and-attachments).

## What it is

`apps/echolog` / `@moonwitness/echolog` — a bounded, **stateless** storage service, port **3006**, owning domain **D19 Object Storage & Attachments**. It stores immutable objects and the metadata that travels with them; it never stores conversation rows, rights decisions or identity.

It fills the slot [BLUEPRINT](../../BLUEPRINT.md) already reserved: *"Approved asset storage owns one immutable version of consented media/source bytes; XV stores metadata/digests. No public private-archive dumps."*

Dependency direction is one-way: `other apps → API → ECHOLOG → storage driver`. ECHOLOG never calls ARSY to persist bytes.

## Stateless by contract

ECHOLOG owns **no tables** and imports no SQL driver. ADR-0006's closed SQL-owner set therefore stays exactly `{@moonwitness/moonql, @moonwitness/skylink-store}`. Object metadata is a JSON sidecar written next to the object (and, on the S3 endpoint, returned as `x-amz-meta-*` object metadata):

```
filename, content_type, size, digest, uploader, created_at,
retention_until, legal_hold, scan{pending|clean|infected|skipped}, tags
```

If SQL metadata ever becomes necessary, it requires a new ADR that withdraws the stateless clause — never a silent schema.

## Storage model

- **Key:** `sha256/<digest>` — content-addressed, **write-once**, immutable. Re-uploading identical bytes is a no-op that returns the same key (dedupe).
- **Storage:** ECHOLOG stores objects on its configured filesystem volume and exposes a bounded S3-compatible server endpoint itself. It does not require or proxy to MinIO or another S3 service.
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

## S3-compatible server subset

The S3 endpoint is path-style and serves one configured bucket; both `/bucket` and `/bucket/` address the bucket itself. It accepts SigV4 `AWS4-HMAC-SHA256` **Authorization-header** requests whose payload hash is signed, with a five-minute clock tolerance. Supported operations are `HeadBucket`, single-request `PutObject`, `GetObject`, `HeadObject`, `DeleteObject`, and `ListObjectsV2` (prefix, delimiter, `max-keys` up to 1000, continuation token and `start-after`). `PutObject` needs a MIME type from the ECHOLOG allow-list; retention and legal hold travel as the signed `x-amz-meta-echolog-retention-until` and `x-amz-meta-echolog-legal-hold` headers, and `ETag` is the payload MD5 while `x-amz-meta-echolog-digest` carries the SHA-256 content address. Object keys are write-once: identical re-uploads are idempotent and different bytes at an existing key are refused with `409`. Keys map to immutable content-addressed objects and filesystem sidecars; the key index is filesystem metadata only and no SQL index is allowed.

Unsupported and rejected explicitly: multipart upload and complete/abort (`?uploads`, `?uploadId`), browser POST policy and batch `?delete`, versions and versioned requests, ACLs, object lock, presigned and any query-string signature, `UNSIGNED-PAYLOAD` and streaming/chunk signatures, virtual-hosted-style buckets, unknown operations, and object keys whose request target uses dot segments or percent-encoded separators (`../`, `..%2F`, `%2e%2e`) — those fail as `400 InvalidObjectName` before any filesystem access. Credentials come only from ECHOLOG's environment (`ECHOLOG_S3_*`); the endpoint is intended for loopback binding and request logging stays disabled so signatures and keys never reach logs. This subset is not full AWS S3 compatibility.

## Non-goals v1

 Split/multipart uploads · CDN/edge cache · active antivirus (the `scan` slot records `skipped`) · image transforms/thumbnails · SQL metadata queries · home-made per-object encryption · unlisted S3 operations.

## Rollback

Stopping ECHOLOG leaves every object intact because nothing else writes them; consumers fall back to local files or a no-op. No schema to revert, because there is none.
