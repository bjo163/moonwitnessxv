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

## Revalidation after independent review — current worktree

- **Review baseline:** `bb751262d9ae215620acc634998fb63ab6e4b887` on branch `dev` (`HEAD` = `origin/dev` at inspection).
- **result_sha:** pending integration. The M39-10 row remains open until these source and test changes are on an exact commit SHA and CI evidence for that integration is recorded.
- **actual_changed_files in this follow-up:** `apps/echolog/src/config.ts`; `apps/echolog/src/modules/objects/index.ts`; `apps/echolog/src/modules/objects/service.ts`; `apps/echolog/src/modules/s3/routes.ts`; `apps/echolog/src/modules/s3/sigv4.ts`; `apps/echolog/src/modules/s3/store.ts`; new `apps/echolog/src/modules/s3/upload-limiter.ts`; `apps/echolog/test/s3-server.test.ts`; new `apps/echolog/test/s3-upload-limiter.test.ts`.
- **Positive test:** `pnpm --filter @moonwitness/echolog test` → 34 tests, 34 pass, 0 fail, 0 skipped. This includes AWS SDK v3 operations, common-prefix pagination, concurrent S3 PUT/GC integrity, the upload semaphore, and the independent M39-12 REST/S3 filesystem round trip.
- **Negative test:** signed unsupported object queries (`acl`, `versionId`, batch `delete`) → `501 NotImplemented`; a body changed after signing → `403 SignatureDoesNotMatch`; authenticated unsupported POST → `501` before its body is read; a signed payload of 1 MiB + 1 byte against the 1 MiB test limit → `413 EntityTooLarge`; storage-root marker scans show none of the rejected bodies were persisted.
- **Build/type/lint:** `pnpm --filter @moonwitness/echolog build` → exit 0; `pnpm --filter @moonwitness/echolog typecheck` → exit 0 for source, tests and client; scoped ESLint → 0 errors and one existing complexity warning (`handleS3Request`, complexity 60; configured maximum 50).
- **Independent reviewer:** read-only review found no blocker after the five original findings were addressed. The review inspected the permit handoff, the permit lifetime through storage/index publication, query rejection, pagination, GC synchronization, default MIME, POST early refusal and oversized request test. Reviewer did not execute tests; commands above were run by the integrator.
- **Security/privacy:** S3 header authentication is checked before a PUT body is consumed; its signed hash is then compared with the streamed bytes before persistence. A four-permit FIFO limiter spans the full PUT handler, and every GC path now shares the S3 store's publication lock. S3 credentials are not written to consumers, logs, SQL or this report.
- **Rollback:** unset `ECHOLOG_S3_BUCKET` and S3 credentials to disable the endpoint; REST and existing filesystem objects remain available.
- **Limitations:** this remains a deliberately bounded S3-compatible subset, not full AWS S3. A raw slow-body/connection-abort case after early refusal was not exercised; per-request over-limit and concurrent-retention limits are covered. Off-host placement and restoration remain M04-05 evidence, not M39-10 evidence.

## Revalidation after branch advanced

- Current branch/HEAD/origin: `dev` / `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; ECHOLOG source changes remain worktree-only.
- `pnpm --filter @moonwitness/echolog test` rerun at this worktree: 34 passed, 0 failed, 0 skipped. Includes AWS SDK compatibility, delimiter pagination, PUT/GC serialization, unsupported operation/body refusal, upload limiter, and M39-12 round trip.
- GitHub returned no statuses or workflow runs for current `2a3aaf16…`; no result SHA exists. M39-10 remains open pending integration and CI.
- Focused current-worktree rerun: `pnpm --filter @moonwitness/echolog test` → 34 passed, 0 failed; `pnpm --filter @moonwitness/echolog typecheck` → exit 0 (source, tests, client); `pnpm --filter @moonwitness/echolog build` → exit 0; scoped ESLint over source and tests → 0 errors, 1 complexity warning (`handleS3Request`, 60 > 50). No external S3 credentials or remote endpoint were used.

## Revalidation after protocol review — exact implementation SHA

- **result_sha:** `21f3bc7b27361ffd843a4980e2d39615bd17fba4` on `dev`; S3 implementation, pagination regressions, and the ADR clarification are committed. The preceding commits `a080644` and `21f3bc7` contain the review fixes; no M39-10 source files are dirty at this SHA.
- **Review finding and correction:** independent review at `b323f8c` found ListObjectsV2 could skip keys because locale sorting disagreed with continuation filtering. The implementation now uses UTF-8 byte ordering consistently, and continuation cursors skip a returned CommonPrefix's descendants. Follow-up review at `21f3bc7` also verified `MaxKeys=0` returns an empty truncated page with a usable cursor; no remaining pagination blocker was found.
- **actual_changed_files in the final review fixes:** `apps/echolog/src/modules/s3/routes.ts`, `apps/echolog/src/modules/s3/store.ts`, `apps/echolog/test/s3-server.test.ts`, and `docs/decisions/ADR-0007-echolog-storage.md`.
- **Positive evidence at the exact committed tree:** `pnpm --filter @moonwitness/echolog test` → 36 pass, 0 fail, 0 skipped; `pnpm --filter @moonwitness/echolog typecheck` → exit 0; `pnpm --filter @moonwitness/echolog build` → exit 0; `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts` → 7 pass, 0 fail, including the closed SQL-driver owner set.
- **Pagination regressions:** the AWS SDK v3 client pages with `MaxKeys=1` through mixed-case and punctuation keys without omissions; delimiter pagination reaches a supplementary Unicode common prefix; `MaxKeys=0` returns `KeyCount=0`, `IsTruncated=true`, a continuation token, then resumes to the first object when called with `MaxKeys=1`.
- **Scoped lint:** `pnpm exec eslint apps/echolog` → 0 errors and one complexity warning (`handleS3Request`, complexity 60 over configured 50); this warning remains disclosed and is not treated as a passing zero-warning lint result.
- **CI/promotion/release:** exact-SHA workflow run `40452126111` for `21f3bc7` completed successfully: the full `Monorepo Verification & Safety Gates` job passed, followed by successful guarded promotion. GitHub readback confirms `dev` and `main` both point to `21f3bc7b27361ffd843a4980e2d39615bd17fba4`; release `v1.2.0` (ID `425049039`) targets that exact SHA. This is CI/release evidence, not proof of production deployment.
- **reviewer:** independent read-only review at exact HEAD `21f3bc7` confirmed UTF-8 ordering, delimiter cursor skipping, `MaxKeys=0` continuation and 7/7 focused S3 tests; no remaining pagination blocker found.
- **Security/rights/rollback:** tests use synthetic object bytes, credentials, temporary filesystem roots, and loopback listeners. The service remains filesystem-backed, stateless, and MinIO-free; no real backup or off-host restore is claimed. Disable the S3 endpoint by leaving `ECHOLOG_S3_*` unconfigured; REST and existing filesystem objects remain available.
- **Verdict:** M39-10 DoD is satisfied at exact implementation SHA `21f3bc7b27361ffd843a4980e2d39615bd17fba4`, with exact-SHA CI and reviewer evidence above. M04-05 remains open until ECHOLOG is operated on a host separate from the backup source and backup, retention, and restore are demonstrated.
