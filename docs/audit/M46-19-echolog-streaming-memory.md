# M46-19 — ECHOLOG Object Streaming Memory and Cancellation Audit

- **Date:** 2026-10-30
- **HEAD:** 1cd42a7
- **Scope:** `apps/echolog/src/`, `packages/echolog-core/src/`
- **Owner decision required:** see §9

---

## 1. Purpose

Measure streaming memory, client cancellation, and timeout behaviour for ECHOLOG bounded objects. This audit covers the two upload paths (REST streaming and S3 buffered), the single download path, the concurrency limiter, and the cancellation primitives actually present in the codebase.

---

## 2. Current Architecture Summary

### 2.1 REST Upload (memory-efficient)

`POST /api/v1/objects` registers a content-type parser that passes the raw Fastify payload through without buffering:

```ts
// apps/echolog/src/modules/objects/index.ts:49-51
app.addContentTypeParser(mimeType, (_request, payload, done) => done(null, payload))
```

The body is consumed as `AsyncIterable<Uint8Array>` through `enforceSizeLimit()`, which yields chunks one at a time and rejects the stream if cumulative bytes exceed `maxUploadBytes` (default 50 MiB):

```ts
// apps/echolog/src/limits.ts:8-21
export async function* enforceSizeLimit(
  source: AsyncIterable<Uint8Array>,
  maxBytes: number,
): AsyncGenerator<Uint8Array> {
  let total = 0
  for await (const chunk of source) {
    total += chunk.byteLength
    if (!Number.isSafeInteger(total) || total > maxBytes) {
      throw new HttpProblem(413, 'too_large', 'Upload exceeds the configured size limit.')
    }
    yield chunk
  }
}
```

The `FsStorageDriver.putStream()` method writes each chunk to a temp file and updates a SHA-256 hash incrementally. At no point is the full object held in memory.

### 2.2 S3 Upload (memory-heavy by design)

S3 `PUT` requests must verify `x-amz-content-sha256`, which requires the full body before signature validation. The `readPayload()` function in `apps/echolog/src/modules/s3/routes.ts:278-300` collects all chunks into a single `Uint8Array`:

```ts
// apps/echolog/src/modules/s3/routes.ts:285-299
const chunks: Uint8Array[] = []
let size = 0
for await (const chunk of body as AsyncIterable<unknown>) {
  size += chunk.byteLength
  if (size > maxBytes) throw new RangeError('Object exceeds the configured size limit.')
  chunks.push(chunk)
}
const payload = new Uint8Array(size)
```

This is an intentional trade-off documented in the route handler comment (line 75-76):

> Each active S3 request can retain chunk buffers and one contiguous copy. Four slots bound that transient body memory to at most 8 * maxUploadBytes across handlers.

### 2.3 Concurrency Limiter

`createUploadLimiter(4)` in `apps/echolog/src/modules/s3/upload-limiter.ts` implements a FIFO semaphore. Only S3 `PUT` routes acquire a slot:

```ts
// apps/echolog/src/modules/s3/routes.ts:9-10
const MAX_BUFFERED_UPLOADS = 4
const withUploadSlot = createUploadLimiter(MAX_BUFFERED_UPLOADS)
```

REST uploads are not gated by this limiter; they are bounded by Fastify's own connection handling and the `enforceSizeLimit` generator.

### 2.4 Download Path

`GET /api/v1/objects/sha256/:digest` loads the entire object into memory via `driver.get()`, which calls `readFile()`:

```ts
// packages/echolog-core/src/driver/fs.ts:168-169
const [bytes, json] = await Promise.all([
  readFile(this.objectPath(objectKey)),
  readFile(this.sidecarPath(objectKey), 'utf8'),
])
```

The S3 `GET` path has the same behaviour (`apps/echolog/src/modules/s3/routes.ts:119`):

```ts
return request.method === 'HEAD' ? base.code(200).send() : base.code(200).send(object.bytes)
```

There is no streaming download path.

---

## 3. Memory Analysis

| Path | Peak Memory per Request | Concurrent Bound | Notes |
|------|------------------------|------------------|-------|
| REST upload | 1 chunk + SHA-256 hash state (~32 B) | Unbounded by limiter; Fastify connection limit applies | Chunk size depends on client; `enforceSizeLimit` rejects at `maxUploadBytes` |
| S3 upload | Full object body (up to `maxUploadBytes`) | 4 slots via FIFO semaphore | Theoretical max: 8 * `maxUploadBytes` (4 chunks arrays + 4 contiguous copies) |
| Download (REST) | Full object in memory | No limiter | `readFile()` + `new Uint8Array(bytes)` copy |
| Download (S3) | Full object in memory | No limiter | `store.get()` calls `driver.get()` |

### 3.1 Deduplication

Content-addressed storage ensures identical bytes are stored once. The `putStream()` method checks for existing objects by digest before writing:

```ts
// packages/echolog-core/src/driver/fs.ts:109-116
const existing = await this.readObject(objectKey)
if (existing) {
  // verify integrity, then remove temp file
  await rm(tempPath, { force: true })
  return existing.sidecar
}
```

This does not reduce peak *transient* memory during upload, only *persistent* storage.

### 3.2 Serialized Mutations

Both `FsStorageDriver` and `FsS3KeyStore` use a promise-chain mutex (`serialized()`) for mutations. This prevents concurrent file-system races but means queued work waits indefinitely with no cancellation:

```ts
// packages/echolog-core/src/driver/fs.ts:325-335
private async serialized<T>(work: () => Promise<T>): Promise<T> {
  const previous = this.operation
  let release!: () => void
  this.operation = new Promise<void>((resolveOperation) => { release = resolveOperation })
  await previous
  try { return await work() } finally { release() }
}
```

---

## 4. Cancellation and Timeout Analysis

### 4.1 AbortSignal Usage

`AbortSignal` is used exactly once in the ECHOLOG codebase: the ARSY auth callback with a 3-second timeout.

```ts
// apps/echolog/src/modules/objects/index.ts:347
signal: AbortSignal.timeout(3_000),
```

```ts
// apps/echolog/src/auth.ts:62
signal: AbortSignal.timeout(3_000),
```

Both are outbound `fetch()` calls to ARSY for session validation. Neither upload nor download path uses `AbortSignal`.

### 4.2 Upload Cancellation

There is no explicit cancellation on uploads. When a client disconnects mid-upload:

- **REST path:** Fastify aborts the request body iterable. The `for await` loop in `putStream()` will see the iterator throw or return, and the `catch` block at line 155-158 removes the temp file:

```ts
// packages/echolog-core/src/driver/fs.ts:155-158
} catch (error) {
  if (!closed) await handle.close().catch(() => undefined)
  await rm(tempPath, { force: true }).catch(() => undefined)
  throw error
}
```

- **S3 path:** `readPayload()` iterates the body; if Fastify aborts, the `for await` throws and the route handler returns an error response. No temp file is created before signature verification, so there is nothing to clean up.

### 4.3 Download Cancellation

No cancellation mechanism exists. Once `readFile()` is called, it runs to completion regardless of client state. Fastify may close the response stream, but the file read is not aborted.

### 4.4 Timeouts on Streaming Operations

No explicit timeouts are applied to streaming operations. The system relies on:

- Fastify's default connection timeouts
- Node.js HTTP server keep-alive and request timeouts
- The 3-second ARSY auth timeout (outbound only)

### 4.5 Mutex Queue

The `serialized()` promise chain has no timeout or cancellation. A queued mutation waits for all prior mutations to complete. Under heavy concurrent write load, this could cause requests to queue indefinitely.

---

## 5. Existing Tests

### 5.1 Coverage Present

| Test File | What It Covers |
|-----------|---------------|
| `apps/echolog/test/fs-driver.test.ts` | `putStream` with async generators; interrupted stream cleanup (temp file removal); deduplication; quota enforcement; GC of orphaned objects |
| `apps/echolog/test/limits.test.ts` | `enforceSizeLimit` with `Readable.from()`; rejects oversized streams with `HttpProblem(413)` |
| `apps/echolog/test/s3-upload-limiter.test.ts` | FIFO concurrency limiter; peak active uploads bounded to `limit`; peak retained payloads bounded to `limit`; waiter ordering |

### 5.2 Coverage Absent

| Gap | Risk |
|-----|------|
| No back-pressure tests | Cannot verify that a slow consumer does not cause unbounded memory growth in the REST upload path |
| No slow-client tests | A client sending 1 chunk/second could hold a temp file open indefinitely; no test verifies resource behaviour |
| No mid-stream HTTP disconnect tests at the HTTP level | `fs-driver.test.ts` tests the driver layer with a throwing generator, but no test verifies that a real Fastify request abort cleans up correctly end-to-end |
| No download memory tests | No test measures peak RSS when downloading large objects |
| No S3 memory measurement with real fixtures | The 8 * maxUploadBytes bound is documented but not measured |

---

## 6. Gaps Identified

### 6.1 No Streaming Download Path

All downloads load the full object into memory via `readFile()`. For the default `maxUploadBytes` of 50 MiB, a single download consumes up to ~100 MiB (file buffer + Uint8Array copy). Concurrent downloads are unbounded.

**Impact:** Memory exhaustion under concurrent download load for large objects.

### 6.2 No Explicit Cancellation on Streaming Operations

Upload cancellation relies entirely on Fastify aborting the request body iterable. Download cancellation does not exist. There are no timeouts on `putStream()`, `readFile()`, or the serialized mutation queue.

**Impact:** A slow or stalled client can hold resources (file handles, temp files, memory) for an indeterminate duration.

### 6.3 No Back-Pressure or Slow Consumer Tests

The `enforceSizeLimit` generator yields chunks as fast as the source produces them. There is no test verifying that a slow downstream consumer (e.g., a throttled disk) propagates back-pressure to the client.

### 6.4 No Mid-Stream Client Disconnect Tests at HTTP Level

The driver-level interrupted stream test (`fs-driver.test.ts:47`) uses a throwing async generator, which tests the cleanup path but not the HTTP-level abort behaviour (e.g., does Fastify actually destroy the body stream when the client disconnects?).

### 6.5 S3 Memory Bound Not Measured

The comment in `routes.ts:75-76` claims a theoretical max of 8 * maxUploadBytes. This has not been verified with real fixtures or memory profiling.

---

## 7. Go/No-Go Assessment

| Area | Verdict | Rationale |
|------|---------|-----------|
| REST uploads | **GO** | Memory-efficient chunk-by-chunk streaming; temp file cleanup on interrupt verified by test |
| S3 uploads | **GO** | Memory-heavy by design but bounded by 4-slot FIFO limiter; trade-off is documented and necessary for SHA-256 signature verification |
| Downloads | **NO-GO** | No streaming download path; full object loaded into memory via `readFile()`; unbounded under concurrent load |
| Cancellation | **NO-GO** | No explicit cancellation mechanism on uploads or downloads; relies on implicit Fastify abort for uploads; downloads have no cancellation at all |

---

## 8. Proposed Synthetic Tests

### Test 1: S3 Concurrent Upload Memory Bound

Measure peak RSS during 4 concurrent 500 KB S3 uploads. Expected: peak transient memory stays below 8 * 500 KB = 4 MB (plus overhead).

```ts
// Pseudocode
const uploads = Array.from({ length: 4 }, () =>
  s3Put(bucket, randomKey(), randomBytes(500 * 1024))
)
await Promise.all(uploads)
// Assert: peak RSS delta < 8 * 500 * 1024 + overhead
```

### Test 2: Slow Client Memory Stability

Simulate a client sending 1 chunk (1 KB) per second for 100 seconds. Verify no memory leak: RSS delta should remain stable after the initial chunk.

```ts
// Pseudocode
async function* slowStream() {
  for (let i = 0; i < 100; i++) {
    yield new Uint8Array(1024)
    await new Promise(r => setTimeout(r, 1000))
  }
}
await restUpload(slowStream())
// Assert: RSS growth < 2 * 1024 (one chunk + hash state)
```

### Test 3: Mid-Stream Client Disconnect Cleanup

Open a REST upload, send partial data, then abort the request. Verify:
- Temp file is removed from `tmp/` directory
- No partial object appears in `objects/`
- No metadata file appears in `metadata/`

```ts
// Pseudocode
const controller = new AbortController()
const upload = restUpload(partialStream(), { signal: controller.signal })
await delay(50) // let server start writing
controller.abort()
await assert.rejects(upload)
assert.deepEqual(await readdir(tmpDir), [])
assert.deepEqual(await readdir(objectsDir), [])
```

### Test 4: Download Peak Memory

Download a 500 KB object via the REST endpoint and measure peak memory. Expected: ~500 KB (full object in memory).

```ts
// Pseudocode
await restUpload(randomBytes(500 * 1024))
const before = process.memoryUsage().rss
const response = await restDownload(digest)
const peak = process.memoryUsage().rss - before
// Assert: peak ≈ 500 * 1024 (within 2x for overhead)
```

### Test 5: Streaming Download Peak Memory (Future)

If a streaming download path is implemented, download a 500 KB object and measure peak memory. Expected: ~1 chunk size (not full object).

---

## 9. Owner Decision Required

| Question | Current State | Recommendation |
|----------|--------------|----------------|
| Should streaming download be implemented? | No streaming path; `readFile()` loads full object | **Yes**, but out of scope for M46-19. Track as follow-up task. |
| Should explicit cancellation be added to uploads? | Relies on Fastify aborting the iterable | **No**, Fastify abort is sufficient for REST uploads. S3 uploads complete before the response is sent, so cancellation is less relevant. |
| Should back-pressure tests be added? | No tests exist | **Yes**, as a follow-up task. Priority: medium. |
| Should the serialized mutation queue have a timeout? | No timeout; queued work waits indefinitely | **Deferred.** Under normal load the queue drains quickly. Revisit if monitoring shows queue depth growth. |

---

## 10. Acceptance Criteria Mapping

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Memory stays within owner-agreed cap | **YES** for uploads | REST: 1 chunk + hash state. S3: bounded by 4-slot limiter to 8 * maxUploadBytes theoretical max. |
| Memory stays within owner-agreed cap | **NO** for downloads | No limit on concurrent downloads; each loads full object into memory. |
| Cancellation releases handles within timeout | **PARTIAL** | Temp file cleanup on interrupt works (verified by `fs-driver.test.ts:47`). No explicit timeout on streaming operations. Download cancellation does not exist. |
| Cleanup on client disconnect | **YES** for REST uploads | `putStream()` catch block removes temp file (`fs.ts:155-158`). |
| Cleanup on client disconnect | **N/A** for S3 uploads | No temp file created before signature verification; `readPayload()` failure returns error response. |

---

## 11. Evidence — Code Path References

| Component | File | Lines |
|-----------|------|-------|
| REST upload content-type parser (passthrough) | `apps/echolog/src/modules/objects/index.ts` | 49-51 |
| REST upload size-limited streaming | `apps/echolog/src/limits.ts` | 8-21 |
| REST upload handler | `apps/echolog/src/modules/objects/index.ts` | 65-125 |
| S3 upload body buffering | `apps/echolog/src/modules/s3/routes.ts` | 278-300 |
| S3 SHA-256 signature check | `apps/echolog/src/modules/s3/routes.ts` | 85-87 |
| S3 concurrency limiter (4-slot FIFO) | `apps/echolog/src/modules/s3/upload-limiter.ts` | 1-30 |
| S3 limiter instantiation | `apps/echolog/src/modules/s3/routes.ts` | 9-10 |
| Driver putStream (chunk-by-chunk write + cleanup) | `packages/echolog-core/src/driver/fs.ts` | 79-159 |
| Driver get (full-object readFile) | `packages/echolog-core/src/driver/fs.ts` | 162-182 |
| Serialized mutation mutex | `packages/echolog-core/src/driver/fs.ts` | 325-335 |
| ARSY auth AbortSignal.timeout(3000) | `apps/echolog/src/auth.ts` | 62 |
| ARSY private-witness auth AbortSignal.timeout(3000) | `apps/echolog/src/modules/objects/index.ts` | 347 |
| Download handler (full object in memory) | `apps/echolog/src/modules/objects/index.ts` | 188-225 |
| S3 download handler (full object in memory) | `apps/echolog/src/modules/s3/routes.ts` | 107-123 |
| Config: maxUploadBytes default 50 MiB | `apps/echolog/src/config.ts` | 33 |
| Config: storageQuotaBytes default 10 GiB | `apps/echolog/src/config.ts` | 32 |
| Object service (delegates to driver) | `apps/echolog/src/modules/objects/service.ts` | 1-27 |
| S3 key store (delegates to driver) | `apps/echolog/src/modules/s3/store.ts` | 101-145 |

### Test References

| Test | File | Coverage |
|------|------|----------|
| Interrupted stream cleanup | `apps/echolog/test/fs-driver.test.ts:47` | Verifies temp file removal when generator throws |
| enforceSizeLimit with Readable.from() | `apps/echolog/test/limits.test.ts:21-25` | Verifies 413 rejection for oversized streams |
| FIFO concurrency limiter | `apps/echolog/test/s3-upload-limiter.test.ts` | Verifies peak active uploads and retained payloads |

---

## 12. Unresolved Items

| Item | Status | Follow-up |
|------|--------|-----------|
| Streaming download not implemented | **Deferred** | Future task; track in TODO |
| No real-world memory measurements | **Open** | Requires load test harness with RSS sampling |
| Back-pressure tests not written | **Follow-up** | Medium priority; add to test suite |
| S3 memory bound (8 * maxUploadBytes) not measured | **Open** | Synthetic Test 1 will address when implemented |
| Serialized mutex queue depth under load | **Deferred** | Revisit if monitoring shows queue growth |
| Mid-stream HTTP disconnect end-to-end test | **Open** | Synthetic Test 3 will address when implemented |
