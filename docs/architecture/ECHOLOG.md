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

- REST: `POST /api/v1/objects` (multipart/stream) · `GET /api/v1/objects/:key/meta` · `GET /api/v1/objects/:key` (grant or stream) · `DELETE /api/v1/objects/:key` · `POST /api/v1/objects/sha256/:digest/private-witness` (irreversible D06 privacy marker) · `POST /api/v1/gc` · `GET /health` · `GET /health/ready`.
- Operator console: `apps/echolog/client` — a Vite/React surface built only from `@moonwitness/moonui` primitives (dev server `127.0.0.1:3106`, proxying `/api` and `/health` to ECHOLOG on loopback `:3006`). It speaks the documented REST API with the operator's own ARSY session bearer token; tokens live in memory only, and the local watchlist persists nothing but consumer references. It is registered in the design gates (`MANDATORY_MOONUI_SURFACES`, `APP_STYLESHEETS`, the hex-drift scan glob and the react-hooks lint block), so `pnpm ui:check` covers it.
- No WebSocket surface in v1.

## S3-compatible server subset

  The S3 endpoint is path-style and serves one configured bucket; both `/bucket` and `/bucket/` address the bucket itself. It accepts SigV4 `AWS4-HMAC-SHA256` **Authorization-header** requests whose payload hash is signed, with a five-minute clock tolerance. Supported operations are `HeadBucket`, single-request `PutObject`, `GetObject`, `HeadObject`, `DeleteObject`, and `ListObjectsV2` (prefix, delimiter, `max-keys` from 0 through 1000, continuation token and `start-after`; zero returns an empty truncated page with a resumable cursor when keys remain). Key ordering and pagination use UTF-8 byte order; a returned common prefix is skipped as a group on the next page. `PutObject` needs a MIME type from the ECHOLOG allow-list; retention and legal hold travel as the signed `x-amz-meta-echolog-retention-until` and `x-amz-meta-echolog-legal-hold` headers, and `ETag` is the payload MD5 while `x-amz-meta-echolog-digest` carries the SHA-256 content address. Object keys are write-once: identical re-uploads are idempotent and different bytes at an existing key are refused with `409`. Keys map to immutable content-addressed objects and filesystem sidecars; the key index is filesystem metadata only and no SQL index is allowed. A D06 private-witness marker applies to the digest across every S3 alias: S3 get/head/delete return `404`, list omits those aliases, and GC retains the bytes.

### D06 private-witness media

Private witness uploads must declare their privacy at ingest: REST `POST /api/v1/objects` sets `x-echolog-private-witness: true`; S3 `PutObject` sets the signed metadata `x-amz-meta-echolog-private-witness: true`. ECHOLOG writes the digest marker before publishing new bytes or sidecar, so a failed marker callback leaves no visible new object. D06 then calls `POST /api/v1/objects/sha256/:digest/private-witness` with `{objectKey, requireAlreadyMarked: true}` using the ARSY bearer. An ARSY user may confirm only an object uploaded under their own login; administrators and the configured service may confirm any existing object. `objectKey` must be the matching `sha256/<digest>` REST key or an exact indexed S3 key whose digest matches. The response is the validated object sidecar so D06 can record it. Markers are filesystem metadata, irreversible, persist with the storage volume, apply to all S3 aliases sharing the digest and protect bytes from GC. D06 refuses ordinary unmarked uploads.

For a marked digest, REST metadata and new download grants require an incoming ARSY bearer and a successful `POST /api/v1/witness/private-media-authorize` callback to ARSY with `{digest}`. A pre-marker grant is invalidated. S3 reads, heads, deletes and listings do not use that REST callback and remain hidden, so a SigV4 bucket credential cannot bypass D06's per-record ACL. The marker grants no read permission by itself; D06 remains the sole consent and ACL decision owner.

Unsupported and rejected explicitly: multipart upload and complete/abort (`?uploads`, `?uploadId`), browser POST policy and batch `?delete`, versions and versioned requests, ACLs, object lock, presigned and any query-string signature, `UNSIGNED-PAYLOAD` and streaming/chunk signatures, virtual-hosted-style buckets, unknown operations, and object keys whose request target uses dot segments or percent-encoded separators (`../`, `..%2F`, `%2e%2e`) — those fail as `400 InvalidObjectName` before any filesystem access. The server verifier credentials come from ECHOLOG's environment (`ECHOLOG_S3_*`). Authorized S3 clients require the matching pair in their own server-side secret store; do not put it in browser bundles, database, Git or logs. V1 has one key pair for the configured bucket and no per-client policy. The endpoint is intended for loopback binding and request logging stays disabled so signatures and keys never reach logs. This subset is not full AWS S3 compatibility.

## Consumer handoff (M39-11)

This is the contract a consumer implements to use ECHOLOG. It changes nothing in the API: every call below is the documented REST/S3 surface shipped by M39-09/M39-10.

**Consumer status (verified against the tree, not assumed):** the first consumer, SKYLINK attachments, is **planned** — M38-12..M38-14 are still open and `apps/skylink` contains no attachment storage code today. Dock posters and Corpus source bytes are later, also planned. Nothing here is a claim that a consumer is live.

### What a consumer stores

- Exactly one reference per attachment: `{object_key, digest, size, content_type}`. The key depends on the API used: REST upload returns ECHOLOG's content-addressed `sha256/<digest>` key; an S3 client chooses a stable, opaque key in its own namespace (for example `attachments/<opaque-id>`), and stores the exact key it sent. Do not treat an S3 namespace key as a digest or invent a different key when persisting it. For REST, upload returns the SHA-256 digest and size. For S3, `PutObject` returns an MD5 ETag, not the SHA-256 digest; call `HeadObject` after upload to read ECHOLOG's SHA-256 metadata, size and content type before persisting the four-field reference. The digest is the integrity identity of the bytes.
- The link from that reference to a message, passage or artifact stays in the consumer's own domain rows (for SKYLINK, D18 `messages.media[]`). ECHOLOG never learns about messages.
- Nothing else from the sidecar may be copied into consumer tables as the source of truth. For the full REST sidecar, read `GET /api/v1/objects/sha256/<digest>/meta`; for metadata exposed on an S3 key, read `HeadObject` on the exact bucket/key. The S3 subset exposes the digest, content type, size, retention and hold headers; use the REST metadata endpoint for the full sidecar fields such as uploader and scan state.

### What a consumer must never do

- **No service-key leakage.** The service key (`x-echolog-key`) and grant-signing secret exist only in ECHOLOG's own environment; consumers never receive them. An authorized S3 protocol client needs the paired SigV4 key in its server-side secret store, but must never embed it in a browser bundle, database, source, or logs. A v1 S3 key grants access to the configured bucket; do not reuse it for untrusted clients.
- **No byte copies.** Bytes are not mirrored into consumer databases (`bytea`), object stores or filesystems. ECHOLOG holds the single immutable version.
- **No SQL index on keys.** The key index is ECHOLOG filesystem metadata only; consumers do not build a searchable metadata mirror (ADR-0007 keeps the SQL-owner set closed).
- **No grant persistence.** Download grants are short-lived (TTL ≤ 5 minutes). Store the key, request a fresh grant at read time; a grant URL in a database or a chat message is a leaked capability.
- **No fake scan states.** v1 records `scan: skipped`; consumers render it as unscanned, in words.

### Calls a consumer makes

1. **Upload:** `POST /api/v1/objects` with the raw bytes, `Content-Type` from the ECHOLOG allow-list, optional `x-filename`, `x-echolog-retention-until` (ISO date) and `x-echolog-legal-hold: true` — hold/retention are decided **at ingest** by the producer and cannot be added later through REST. Auth is either mode (service key for daemons, ARSY bearer for human-supplied uploads). `201` returns the full sidecar; re-uploading identical bytes is an idempotent no-op that returns the same `object_key` (dedupe). A private witness upload must include `x-echolog-private-witness: true`, which installs the persistent D06 marker before publication. S3 clients use the corresponding signed `x-amz-meta-echolog-private-witness: true` metadata.
2. **Read metadata:** for REST references, `GET /api/v1/objects/sha256/<digest>/meta`; for S3 references, use `HeadObject` with the exact bucket/key and read ECHOLOG's `x-amz-meta-echolog-digest`, retention and legal-hold metadata.
3. **Download:** REST `GET /api/v1/objects/sha256/<digest>` with auth returns `{url, expires_at}` — a grant valid at most 5 minutes. Fetch bytes from that URL before it expires; re-request after. S3 consumers use `GetObject` with the exact bucket/key.
4. **Delete:** REST `DELETE /api/v1/objects/sha256/<digest>`; S3 consumers use `DeleteObject` with the exact bucket/key. While legal hold is set or retention has not elapsed, REST answers `409` with `code` `legal_hold` or `retention_active` and S3 answers `409 ObjectLocked`; the refusal is final — consumers surface the service's message verbatim and never retry-force. Actual removal of expired unreferenced objects is the admin REST `POST /api/v1/gc` sweep, which reports what it deleted and what it held.

Error codes a consumer handles: `400` (`invalid_body`, `invalid_retention`, `invalid_header`), `401` (`unauthorized`, `auth_unavailable` — ARSY validation down), `403` (`forbidden`), `404` (`not_found`), `409` (`legal_hold`, `retention_active`), `413` (`too_large`), `415` (`unsupported_media_type`), `503` (storage/auth unavailable), `507` (`quota_exceeded`). Bodies are always `{error:{code,message}}`.

### Through the S3 subset instead

Service-to-service integrations that already speak S3 may use the bounded endpoint (M39-10): path-style single bucket, SigV4 `Authorization`-header requests with signed payloads, and only `HeadBucket`, single-request `PutObject`, `GetObject`, `HeadObject`, `DeleteObject`, `ListObjectsV2`. Retention and hold travel as the signed `x-amz-meta-echolog-retention-until` / `x-amz-meta-echolog-legal-hold` headers; `x-amz-meta-echolog-digest` carries the SHA-256 content address. The S3 key is the exact caller-selected namespace key, not necessarily `sha256/<digest>`; persist that key with ECHOLOG's digest and size. Everything else — multipart, presigned URLs, batch delete, versions/ACLs, virtual-host style — is refused with an explicit S3 XML error, so an integration must not assume full S3 compatibility. Keys remain write-once: different bytes at an existing key are refused `409`. The same four-field reference rule applies to both APIs.

**Retention responsibility:** producers set retention/hold at ingest; consumers propagate references and honor `409` refusals; only ECHOLOG's admin GC deletes. If a consumer's own domain requires a copy of the bytes for privacy reasons, that is an ADR question, not a handoff detail.

## Non-goals v1

 Split/multipart uploads · CDN/edge cache · active antivirus (the `scan` slot records `skipped`) · image transforms/thumbnails · SQL metadata queries · home-made per-object encryption · unlisted S3 operations.

## Rollback

Stopping ECHOLOG leaves every object intact because nothing else writes them; consumers fall back to local files or a no-op. No schema to revert, because there is none.

## M39-12 e2e proof (2026-10-27)

`apps/echolog/test/e2e-roundtrip.test.ts` exercises **both surfaces of the one filesystem storage** — the REST API (M39-09) and the bounded S3-compatible endpoint (M39-10) — in a single run against a single ephemeral storage root, and then proves the rollback clause above instead of asserting it:

- **Round trip on both surfaces.** The same bytes are uploaded via REST and verified through a download grant (re-hashed to the content address), then put/headed/get/listed/deleted through the real AWS SDK client over the S3 endpoint; the S3 key for the REST-uploaded bytes reports the identical SHA-256 in `x-amz-meta-echolog-digest`, proving both surfaces serve one content-addressed store.
- **Write-once everywhere.** Identical REST re-upload returns the first sidecar unchanged; identical S3 re-put returns the same ETag; different bytes at an existing S3 key are refused `409`.
- **Holds refuse delete on both surfaces.** REST `409` with `legal_hold`/`retention_active` codes, S3 `409 ObjectLocked`; an S3 key carrying the exact bytes of a REST-held object inherits the hold from the shared sidecar and its delete still fails closed. Admin GC reports held objects and deletes none of them.
- **Rollback demonstrated.** The service is stopped (the old endpoint refuses connections), every file under `objects/`, `metadata/` and `s3-keys/` is listed on disk with nothing left in `tmp/`, and a fresh instance on the same root serves byte-identical sidecars, downloadable grants and the same `409` refusals. Existing objects survive the stop intact — the documented rollback property, observed rather than claimed.

Full command-by-command evidence with observed outputs: [docs/audit/M39-12-e2e-rollback.md](../audit/M39-12-e2e-rollback.md).
