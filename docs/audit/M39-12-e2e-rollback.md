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

- **Verification SHA:** `724fb1556f7f58c39e8c71550bce8c1e6e4cba38` on `dev`; ECHOLOG source and the M39-12 test were committed and the checkout was clean before this audit-only update. The test path and service source did not change after that SHA.
- **Task paths present at the verification SHA:** `apps/echolog/test/e2e-roundtrip.test.ts`, `docs/audit/M39-12-e2e-rollback.md`, `docs/tasks/M39/M39-12.md`, and `CHANGELOG.md`. The audit refinement in this section is a documentation-only change made after the test run; it does not change the source or test. The root changelog has an `Unreleased` ECHOLOG (D19) entry for the bounded SigV4 S3-compatible server and filesystem ownership. It makes no production deployment, off-host restore, or D18 attachment-delivery claim.
- **Positive and negative verification at exact SHA `724fb1556f7f58c39e8c71550bce8c1e6e4cba38`:** `pnpm --filter @moonwitness/echolog test` → 36 tests, 36 passed, 0 failed, 0 skipped. This includes the M39-12 REST/S3 shared-filesystem round trip, object-integrity checks, fail-closed delete/overwrite/unsupported-operation cases, and stop/restart persistence proof.
- **Build/type at the same SHA:** `pnpm --filter @moonwitness/echolog typecheck` → exit 0 for service, test and client TypeScript; `pnpm --filter @moonwitness/echolog build` → exit 0; `pnpm exec eslint apps/echolog` → exit 0, 0 errors and 1 existing disclosed complexity warning in `src/modules/s3/routes.ts`.
- **Storage-boundary evidence at the same SHA:** `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts` → 7/7 passed, including the closed SQL-driver owner set. The test runs in process against a temporary filesystem root; no Postgres database is configured or used by ECHOLOG. `git diff --check` → exit 0.
- **Dependency status:** M39-10 and M39-11 are checked in the canonical TODO at this verification SHA. Their exact-SHA implementation and integration evidence is recorded in their respective TODO rows and audits; this M39-12 run does not re-run their full gates.
- **Status at the original 724fb review: OPEN.** The server/storage rollback was demonstrated, but the consumer side still needed evidence. At that point SKYLINK attachments were planned and not present; that remains true, but the packet does not require SKYLINK specifically to serve as the consumer.
- **Other limits:** restart is sequential and in-process; multi-process contention and power-loss durability remain unverified under M39-08. This temp-volume drill is not off-host backup/retention/restore evidence; M04-05 remains separate and open. No application process is left running by the suite.
- **Reviewer at 724fb:** independent read-only review reproduced 36/36 tests, typecheck/build success, scoped ESLint with 0 errors and one disclosed warning, and SQL-owner guard 7/7. It correctly left the task open because packet step 3 had not yet been demonstrated.

## Integrated consumer rollback evidence

**Source and test verification SHA:** `49180c9d0b56d81a2623f53a7d54f1ed46a21457` (`dev` and `main`). The ECHOLOG source and tests are unchanged from `724fb1556f7f58c39e8c71550bce8c1e6e4cba38`; `git diff --quiet 724fb155..49180c9 -- apps/echolog packages/echolog-core` returned 0. The exact CI run [40529310035](https://github.com/bjo163/moonwitnessxv/actions/runs/40529310035) passed monorepo verification and guarded promotion. The present TODO/audit closure update changes documentation only; its commit will receive its own exact-SHA CI run.

The actual ECHOLOG operator console is the consumer exercised for packet step 3. I launched the client on loopback port `3116` with its backend proxy pointed at intentionally unbound loopback port `3016`; an existing unrelated ECHOLOG listener on `3006` was left untouched. A synthetic, valid four-field reference was seeded in browser local storage, then a synthetic expired operator session was armed. The browser observed:

- Health showed **not reachable**; the one tracked reference remained visible in the count and remained byte-for-byte present in local storage after a full page reload.
- Metadata read failed visibly as `unreadable`; no fallback metadata or object bytes were fabricated.
- Upload stayed disabled, and the recorded browser requests were only `GET /health/ready` and `GET /api/v1/objects/.../meta`; no `POST`, `PUT` or `DELETE` was sent.
- The session and reference were synthetic test inputs only. No production credential, user object, or private data was used.

This consumer-side observation complements the existing REST/S3 round-trip test: that test stops instance A, verifies its endpoint refuses connections while object files and sidecars remain intact, then starts instance B on the same storage root and verifies byte-identical reads and retained hold refusals. Together these prove the service rollback and the real operator console's local/no-op behavior when the service is unavailable. They do **not** claim SKYLINK attachment delivery; that consumer remains planned.

At integrated source SHA `49180c9d0b56d81a2623f53a7d54f1ed46a21457`, revalidation produced:

- `pnpm --filter @moonwitness/echolog test` — 36/36 passed, including shared REST/S3 storage, fail-closed negatives, and stop/restart persistence.
- `pnpm --filter @moonwitness/echolog typecheck` — exit 0; `pnpm --filter @moonwitness/echolog build` — exit 0.
- `pnpm exec eslint apps/echolog` — exit 0, 0 errors and 1 disclosed complexity warning in `src/modules/s3/routes.ts`. The stricter `--max-warnings 0` invocation exits 1 solely for that warning; it was not silently counted as clean.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts` — 7/7 passed, including the closed SQL-owner set.
- Root `CHANGELOG.md` contains the Unreleased ECHOLOG/D19 entry. No deployment, off-host backup restore, or SKYLINK attachment-delivery claim is made; M04-05 remains open.

**Independent review:** read-only review confirmed the operator console is a real ECHOLOG API consumer, retains its local reference, reports unreadable metadata, leaves upload disabled and makes no mutating request while the service is unavailable. The reviewer confirmed packet step 3 is satisfied generically; SKYLINK is not required by this packet to be the consumer.
