# M16-04 — Consent and explicit ACL for private witness media

**Task:** M16-04 · P1 / D4 · Acceptance: no anonymous access or media-link leakage
**Baseline SHA:** `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (`dev`, M16-04 marked in progress)
**Concurrent integration:** other non-overlapping commits advanced `dev` to `8016bb5ba9a7101992474d3bd58e335dedd0ea6e` during this task. `git log <baseline>..HEAD -- <M16-04 paths>` returned no commits touching the files listed below.
**Worker:** `/root` (integrator) · independent read-only security reviewer: `/root/m16_final_security_review`
**Implementation SHA:** `ef415f3518637a3d3a65103b3973bd7019a9ba90` (`dev`); referenced by the canonical TODO status.

## Implementation

- D06 now has a private `witness_consent_records` model and authenticated consent-recording endpoint. Records keep a scope, status, validity window, guardian verification and an `evidenceRef` pointer. Consent rows cannot be deleted or edited except for withdrawal.
- Testimony intake accepts only an active consent plus the subject or a verified guardian, and it refuses an object unless ECHOLOG confirms the exact key/digest/size/content type and that the object was marked private at ingest. Each testimony stores an immutable, private per-record `viewAclPrincipalRefs` list. Owner, subject and guardian status alone do not override that list; an admin role alone does not grant access.
- ECHOLOG REST uploads set `x-echolog-private-witness: true`; S3 uploads set the signed `x-amz-meta-echolog-private-witness: true` metadata. The filesystem policy marker is created before new object bytes/sidecar publication. Failed marker creation leaves the new object unpublished.
- The marker is keyed by content digest, persists on the ECHOLOG volume, applies to every current or later S3 alias, hides S3 get/head/delete/list, protects bytes from GC, and blocks REST metadata/grant requests unless the caller's ARSY bearer passes the D06 callback. D06 confirms only objects already marked at ingest. Pre-marker grants, including grants issued at the exact same millisecond as the marker, are rejected.
- Addon responses default to `private, no-store`. The custom SDK was regenerated and checked for drift.

## Evidence actually run

- `pnpm typecheck` — passed for all 43 workspace projects with a typecheck script.
- `pnpm --filter @moonwitness/echolog-core build` — passed.
- `pnpm --filter @moonwitness/echolog typecheck` and `pnpm --filter @moonwitness/echolog build` — passed.
- `pnpm --filter @moonwitness/echolog exec tsx --test` — **38/38 passed**, including private REST ingest, S3 signed-header enforcement, alias hiding, marker persistence across store recreation, GC retention, and exact-timestamp old-grant rejection.
- `pnpm --filter @moonwitness/witness typecheck` and `pnpm --filter @moonwitness/witness build` — passed.
- `pnpm --filter @moonwitness/arsy typecheck` — passed.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/witness-access.test.ts` — **5/5 passed**: eligible owner/guardian, anonymous/stranger denial, missing/expired/withdrawn consent, explicit ACL, bounded grants, and refusal of an unmarked object.
- `pnpm --filter @moonwitness/arsy exec node --test ../../packages/moonql-witness/test/witness-lineage.test.mjs` — **2/2 passed** (M16-03 regression).
- `pnpm --filter @moonwitness/arsy exec tsx --test test/moonql-acl-surface.test.ts` — **3/3 passed**.
- `pnpm gen:sdk:check` — SDK up to date.
- `git diff --check` — passed.
- Scoped ESLint — 0 errors. It reported two warnings: the existing high-complexity S3 request handler and a pre-existing non-null assertion in `packages/moonql/src/rest.ts`. No full `pnpm verify`, Docker, PostgreSQL production migration, browser, DNS or deployment run is claimed.

The independent reviewer re-checked the exact-time grant boundary and the unsigned S3 privacy-header case after fixes; both were confirmed covered by passing tests. The full suite results above were recorded after those fixes.

## Security, rights and privacy

All fixtures and payload bytes used here are synthetic. No real witness material, personal consent document, secret, cloud bucket or production service was accessed. Denials conceal private record existence and do not return object keys, digests or grant URLs. ECHOLOG stays a stateless filesystem/S3-protocol service with no SQL owner; consent and ACL decisions remain in D06.

`evidenceRef` is an administrator-recorded pointer, not cryptographic or legal verification of the evidence behind it. Real use still requires a human administrator to verify and retain the consent evidence under the approved rights process. Withdrawing consent blocks new metadata/grant authorization, but a bearer download grant issued before withdrawal can remain usable until its ≤5-minute expiry. No production ECHOLOG volume was marked; once real markers exist they are intentionally irreversible, and operators must preserve the access/GC protections when rolling code back.

## Changed files for this task

`.env.example`; `apps/arsy/src/config.ts`; `apps/arsy/test/witness-access.test.ts`; `apps/echolog/src/grants.ts`; `apps/echolog/src/modules/objects/index.ts`; `apps/echolog/src/modules/objects/service.ts`; `apps/echolog/src/modules/s3/routes.ts`; `apps/echolog/src/modules/s3/sigv4.ts`; `apps/echolog/src/modules/s3/store.ts`; `apps/echolog/test/fs-driver.test.ts`; `apps/echolog/test/object-routes.test.ts`; `apps/echolog/test/s3-server.test.ts`; `docs/architecture/ECHOLOG.md`; `packages/echolog-core/src/driver/fs.ts`; `packages/moonql-client/src/generated.ts`; `packages/moonql-client/src/schema-history.json`; `packages/moonql-client/src/schema-snapshot.json`; `packages/moonql-witness/src/index.ts`; `packages/moonql-witness/test/witness-lineage.test.mjs`; `packages/moonql/src/rest.ts`; this audit.

Unrelated dirty Dock, Cockpit, Headquarters, screenshot and TODO UI work was not staged or changed by this task. The standalone `media-access.ts` prototype from earlier work remains unintegrated and is not used as evidence for these runtime routes.

## Rollback and next task

No deployment or production data change occurred. Before deployment, rollback is a code revert. After private markers exist, do not remove marker enforcement, GC protection or the D06 callback while markers remain; there is intentionally no unmark operation.
**Next eligible task after integrator closes M16-04:** M16-05 — redacted derivative preview for a human publishing request (requires privacy review).
