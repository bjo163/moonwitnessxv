# M39-12 — ECHOLOG end-to-end proof, rollback, evidence and changelog

- task_id: M39-12
- baseline_sha: `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (branch `dev`, with the uncommitted M39-11 operator-console surface in `apps/echolog` — that tree is the M39 surface under test).
- scope authority: [packet](../tasks/M39/M39-12.md), [ADR-0007](../decisions/ADR-0007-echolog-storage.md), prior evidence [M39-08](M39-08-echolog-fs-driver.md), [M39-09](M39-09-echolog-rest-auth-2112622.md), [M39-10](M39-10-echolog-s3-endpoint.md), [M39-11](M39-11-operator-console-render.md).
- result_sha: **pending** — this task did not run `git add` or `git commit` (task constraint); the result SHA is the integration commit that lands the files below on `dev`.

## Interpretation applied

Since M39-10 removed the outbound S3 driver, "upload→download→delete verified on **both drivers**" means **both surfaces of the one filesystem storage**: the REST object API (M39-09) and the bounded S3-compatible endpoint (M39-10). It is not fs/s3 driver parity and there is no MinIO anywhere in the proof.

## actual_changed_files

- `apps/echolog/test/e2e-roundtrip.test.ts` — new, the entire proof (one test, one run).
- `docs/architecture/ECHOLOG.md` — dated "M39-12 e2e proof (2026-10-27)" section appended (changelog deliverable of this task).
- `docs/audit/M39-12-e2e-rollback.md` — this evidence file.
- **No REST/S3/server source, config, manifest, lockfile or lint config was modified.** No server defect was found; nothing outside the test's own assertions was fixed.

## The test, in one run

One ephemeral storage root; two sequential in-process service instances on loopback ephemeral ports (A → stop → B), real HTTP for everything (no `inject`), the real AWS SDK v3 S3 client for the S3 surface:

1. `/health/ready` reports `ready/fs`.
2. REST: upload 2048 random bytes → `201` sidecar with `object_key = sha256/<digest>`; identical re-upload returns the **first sidecar unchanged** (write-once + first-metadata immutability); grant via `GET /api/v1/objects/:key` (TTL ≤ 5 min), download through the grant URL, byte-equality **and** re-hash of the downloaded bytes to the digest.
3. S3: `HeadBucket`; `PutObject` of the **same bytes** — `HeadObject` returns the identical `x-amz-meta-echolog-digest`, proving both surfaces address one content store; `GetObject` byte-equality; `ListObjectsV2`; idempotent re-put (same ETag); different bytes at the existing key → `409`.
4. S3 puts/heads/gets/lists/deletes **its own** transient object: delete answers success, follow-up `GetObject` → `404 NoSuchKey`, list no longer contains it.
5. Refusals on both surfaces: REST legal-hold delete → `409` code `legal_hold` with explanation; REST retention delete → `409` code `retention_active`; S3 held key delete → `409 ObjectLocked`; S3 retention key delete → `409 ObjectLocked`; **cross-surface**: an S3 key carrying the exact bytes of the REST-held object inherits the hold from the shared sidecar — its delete also fails `409 ObjectLocked` while both surfaces can still read the bytes. Unheld REST objects delete `204` (proving the `409` is hold-specific, not a broken delete path).
6. Admin GC reports `{object_key, reason}` for exactly the two REST-held objects, frees only the S3-deleted orphan (exact `bytes_freed` asserted), and both held objects remain `200` on `/meta`.
7. **Rollback:** `app.close()`; the stopped endpoint refuses connections; the test lists the storage root on disk — `objects/` holds exactly the five expected digests, `metadata/` their five sidecars (the held sidecar still parses with `legal_hold: true`), `s3-keys/` the four live key records, `tmp/` empty — then restarts a fresh instance on the same root: readiness `ready/fs`, REST `/meta` deep-equals the original sidecar, a fresh grant re-downloads byte-identical payload (digest re-verified), S3 head/get/list serve the old keys byte-identically, and the REST and S3 held-delete refusals still answer `409`.
8. All servers and SDK clients are closed via `t.after`; the test file completes in ~1.4 s total runner time — the Node test process exits immediately, i.e. no listener or socket keeps it alive.

## positive_test_and_output (commands actually executed)

- `git rev-parse HEAD` → `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3`; `git branch --show-current` → `dev`; `git status --porcelain` recorded the pre-existing M39-11 surface before any edit.
- `pnpm --filter @moonwitness/echolog exec tsx --test test/e2e-roundtrip.test.ts`

      ✔ M39-12 round trip: REST and S3 share one storage, hold refuses delete on both surfaces, restart leaves every object intact (665.046ms)
      ℹ tests 1 · pass 1 · fail 0 · cancelled 0 · skipped 0 · duration_ms 1440.1327

- `pnpm --filter @moonwitness/echolog test`

      ℹ tests 30 · pass 30 · fail 0 · cancelled 0 · skipped 0 · duration_ms 1382.0156

  (29 pre-existing + 1 new; includes the M39-11 `operator-client.test.ts` still green against this tree.)
- `pnpm --filter @moonwitness/echolog typecheck` → `tsc --noEmit && tsc --noEmit -p test/tsconfig.json && tsc --noEmit -p client/tsconfig.json` — clean, exit 0.
- `pnpm exec eslint apps/echolog` → exit 0, no messages (final tree).
- `rg -n "drizzle-orm|postgres" apps/echolog packages/echolog-core/src` → no matches, exit 1. Bytes never reach Postgres: ECHOLOG still has no SQL driver.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts` → `tests 7 / pass 7 / fail 0`, including "topology: SQL drivers are imported only by MoonQL and the SKYLINK store" — the ADR-0006/0007 SQL-owner guard still passes with ECHOLOG untouched.
- `netstat -ano | grep 127.0.0.1:3006` after the runs → no listener (tests bind ephemeral ports via `listen({port: 0})` only; nothing was left to kill).

## negative_test_and_output

All observed inside `e2e-roundtrip.test.ts` at runtime:

- REST `DELETE` of the legal-hold object → `409` body `{"error":{"code":"legal_hold","message":"Object is protected by retention policy."}}` (test asserts code and `/protected/`).
- REST `DELETE` of the active-retention object → `409` code `retention_active`.
- S3 `DeleteObject` of held and retained keys → SDK rejects with `httpStatusCode 409`, error `ObjectLocked: Object is protected by ECHOLOG retention policy.` — fails closed, delete never reaches the volume (object still readable afterwards).
- Cross-surface: S3 key sharing bytes with a REST-held object → same `409 ObjectLocked`; the shared sidecar is the single protected version (`/meta` still reports `legal_hold: true`).
- S3 overwrite of an existing key with different bytes → `409`; the old object is unchanged (head digest and get bytes re-verified).
- S3 `GetObject` after a successful `DeleteObject` → `404 NoSuchKey`.
- After `app.close()`, `fetch` to the old endpoint rejects (connection refused) — the stopped instance proves the on-disk listing was taken with **no** server running.
- GC deletes only the orphaned, previously S3-deleted object (`bytes_freed` equals exactly its size); the two held objects are reported, not deleted.
- Task-execution negatives honestly recorded: the first two runs of the new test **failed** while its assertions were being fitted to documented server behavior (see Limitations), and the first `pnpm exec eslint apps/echolog` reported 3 `prefer-const` errors in the new test file (`clientA`/`clientB`/`appB`); both were fixed **inside the test file only**, and the re-run outputs above are from the corrected tree.

## security_rights_privacy

- Everything runs in-process on loopback with OS-assigned ephemeral ports; storage lives in a `mkdtemp` directory removed by `t.after`. No deployment, no real credentials, no external services.
- Service key, grant secret and S3 credentials are synthetic constants scoped to this test file; none of them, no grant URL, and no object bytes are logged (Fastify logger is off by default, as in M39-09/M39-10).
- The proof exercises the documented auth modes only (`x-echolog-key` service principal); no ARSY session was created or needed, so no identity surface was touched.
- No rights/consent decisions change: ECHOLOG still owns no SQL (guard re-run above) and holds only synthetic test bytes.

## reviewer

Worker: M39-12 e2e agent (this task). Reviewer: pending integrator — this file, the test and the ECHOLOG.md section are the review surface; no source diff to review.

## rollback

- Task deliverables: delete `apps/echolog/test/e2e-roundtrip.test.ts` and revert the two documentation edits; nothing else changes.
- Service rollback property is the tested object, not an instruction: the test stops the service, lists the untouched volume, and restarts clean. M39-10's S3-off procedure (unset `ECHOLOG_S3_*`) and M39-08's root-removal procedure remain valid and are unchanged by this task.

## limitations

- **Restart is sequential in-process** (stop A, then start B on the same root). Multi-process quota/commit contention and power-loss durability remain unverified, as documented in M39-08.
- The volume is a local temp directory; this does **not** satisfy the off-host backup gate M04-05 (no real bucket, no restore performed — packet boundary respected, no such claim made).
- "Consumer degrading to local/no-op" (packet step 3) cannot be proven: the first consumer, SKYLINK attachments (M38-12..14), is not implemented. The service-side half of the rollback gate — objects intact, downloadable after restart, no schema — is fully proven.
- Two assertion-fitting iterations are recorded above; both revealed **documented, intended** behavior, not defects: (1) the S3 surface answers every protected delete with the one generic `ObjectLocked` XML refusal rather than distinguishing hold vs retention (fail closed without leaking reason), and (2) admin GC's `held` report covers objects that are *unreferenced*; objects referenced by a live S3 key are skipped from the sweep entirely and are protected by their own `409` delete path. The test asserts both semantics as observed.
- Root `CHANGELOG.md` was not modified: the assignment for this task designates the dated "M39-12 e2e proof" section in `docs/architecture/ECHOLOG.md` as the changelog deliverable; packet step 6's separate `CHANGELOG.md` line is left to the integrator's release hygiene.
- While this task ran, parallel sessions advanced `dev` from `76ecdc5` to `0d397fe` with **docs-only** commits (`git diff --stat 76ecdc5..HEAD -- apps/echolog packages/echolog-core` → empty); the code surface under test is identical to the recorded baseline.
- Node test counts above cover `apps/echolog` only; no application process was left running by this task (all servers/clients closed in `t.after`, verified by process exit and the port check).

## Integrator follow-up — current worktree evidence and changelog

- **Review baseline:** `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev`; exact result SHA remains pending integration.
- **Changed path:** root `CHANGELOG.md` now has an `Unreleased` ECHOLOG (D19) entry describing its bounded SigV4 S3-compatible server and filesystem ownership, explicitly withholding claims for production deployment, off-host restore, or D18 attachment delivery. This completes the packet's root changelog deliverable; the prior limitation above is historical and superseded for the current working tree.
- **Current ECHOLOG test evidence:** root ran `pnpm --filter @moonwitness/echolog test` → 34 tests, 34 pass, 0 fail, 0 skipped. The output includes the M39-12 REST/S3 shared-filesystem round trip and restart/rollback proof.
- **Build/type:** `pnpm --filter @moonwitness/echolog build` → exit 0; `pnpm --filter @moonwitness/echolog typecheck` → exit 0 (source, tests and client).
- **SQL-owner guard:** `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts` → 7 pass, 0 fail, including SQL-driver ownership.
- **Dependency status:** M39-10 fixes now pass the same 34-test suite and have an independent no-blocker review, but await an exact integration SHA/CI result; M39-11 screenshot and UI interaction evidence are now captured, but it remains gated on M39-10. Therefore M39-12 remains open.
- **Remaining limitation:** rollback was proven at service/storage level, but a consumer degrading to local/no-op cannot be tested until SKYLINK attachment integration (M38-12..14) exists. Off-host backup/restore is still outside this evidence and remains M04-05.
