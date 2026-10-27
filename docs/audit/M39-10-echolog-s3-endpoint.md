# M39-10 — ECHOLOG bounded S3-compatible endpoint: evidence

- task_id: M39-10
- baseline_sha: `e8efe213ea93f504d56ae4b01d1e2ed9ecdcf61c` (branch `dev`)
- scope authority: [packet](../tasks/M39/M39-10.md), [ADR-0007 Amendment 1](../decisions/ADR-0007-echolog-storage.md)

## actual_changed_files
- `apps/echolog/src/modules/s3/routes.ts` — path-style single-bucket routes; allow-list `HeadBucket`, single-request `PutObject`, `GetObject`, `HeadObject`, `DeleteObject`, `ListObjectsV2`; everything else (multipart, batch delete, browser POST, versions/ACL/presign, virtual-host) fails closed with S3 XML errors.
- `apps/echolog/src/modules/s3/sigv4.ts` — `AWS4-HMAC-SHA256` Authorization-header verification against the client's declared `SignedHeaders` only; signed payloads only; constant-time comparison; Web Crypto (no `node:crypto` in `apps/**`).
- `apps/echolog/src/modules/s3/store.ts` — S3 keys mapped to ECHOLOG's content-addressed filesystem storage; write-once (identical bytes idempotent, differing bytes `409`); retention/legal-hold checks preserved; no SQL.
- `apps/echolog/src/config.ts` — `ECHOLOG_S3_BUCKET/REGION/ACCESS_KEY_ID/SECRET_ACCESS_KEY`; endpoint disabled until bucket+credentials are configured; required in production.
- `packages/echolog-core/src/index.ts` — owns `sha256HexSync` (security digest) and `md5Hex` (S3 protocol ETag only); outbound `s3` driver removed with `driver/s3.ts`, `test/s3-driver.test.ts` and stale `dist/driver/s3.*`.
- `apps/echolog/test/s3-server.test.ts` — AWS SDK v3 interop + negative matrix (this task's evidence).
- `docker-compose.yml`, `.env.example` — MinIO service/credentials removed; no second storage server.
- `apps/arsy/test/compose-contract.test.ts`, `apps/arsy/test/env-contract.test.ts` — MinIO contracts retired; anti-regression assertion that no `minio` text remains in compose; `ECHOLOG_S3_*` documented; `ECHOLOG_S3_SECRET_ACCESS_KEY` must stay a blank placeholder.
- `docs/architecture/ECHOLOG.md` — precise supported subset and every rejected S3 feature.

## positive_test_and_output (all executed at this tree)
- `pnpm --filter @moonwitness/echolog-core build` → clean.
- `pnpm exec tsx --test test/s3-server.test.ts` → `tests 2 / pass 2 / fail 0` (AWS SDK real client: put, head, get, list, delete; byte equality, ETag, idempotent re-put).
- `pnpm --filter @moonwitness/echolog test` → `tests 19 / pass 19 / fail 0 / skipped 0`.
- `pnpm --filter @moonwitness/echolog typecheck` + `-core typecheck` + `echolog build` → clean.
- `pnpm exec eslint apps/echolog packages/echolog-core` → exit 0.
- `pnpm install --frozen-lockfile` → Done (lock matches manifests).
- ARSY `compose-contract.test.ts` + `env-contract.test.ts` → `tests 21 / pass 21 / fail 0`.

## negative_test_and_output
- Wrong secret key → `403 SignatureDoesNotMatch`; missing Authorization → `403 AccessDenied`.
- Date skewed 10 minutes → `403 RequestTimeTooSkewed`.
- Traversal with a valid signature (`../`, `..%2F`, `%2e%2e`) → `400 InvalidObjectName`, checked before auth-body handling and without touching the filesystem; the real AWS SDK additionally refuses such keys client-side.
- `CreateMultipartUpload` / batch `?delete` / browser POST → `501 NotImplemented`.
- Overwrite with different bytes → `409`; after failures, `ListObjectsV2 KeyCount: 0` and a recursive scan of the storage root finds no rejected bytes on disk.

## security_rights_privacy
S3 credentials exist only in ECHOLOG's env; consumers hold none. Requests are logged nowhere; no signature, key, or token at info level. Default bind loopback; endpoint inactive without configuration. This is a bounded subset, **not** full AWS S3 compatibility, and is documented as such.

## rollback
Disable the S3 routes (leave bucket/credentials unset): the ECHOLOG REST API and every existing filesystem object remain available; nothing else was changed.

## limitations
- Body is buffered (bounded by `ECHOLOG_MAX_UPLOAD_BYTES`) before signature verification.
- `ListObjectsV2` caps at 1000 keys; no uploads with `Content-MD5`-only validation; ETag is protocol MD5, not a security digest.
- ECHOLOG hosted on the same machine as the backup source does **not** satisfy M04-05; that task stays open until the endpoint runs on a separate host and restore is demonstrated.
