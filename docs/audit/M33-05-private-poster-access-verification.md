# M33-05 — Private poster access and attribution verification suite

**Task:** M33-05 — Verify private poster access and attribution (P1/D4)

**Status:** verification suite delivered at the baseline below; **runtime private-poster delivery remains BLOCKED**. This report does not close the TODO leaf; the integrator decides after review.

**Baseline:** branch `dev`, worktree SHA `cc40c205070cdb68051b30a68276f3370a3bd4f1`. Observed remote refs at baseline: `origin/dev` = `cc40c205070cdb68051b30a68276f3370a3bd4f1`, `origin/main` = `cc40c205070cdb68051b30a68276f3370a3bd4f1`.

**Prerequisite check:** M33-04 is checked in TODO at specification SHA `c62b8c6a4ed259ab87f6606198f084a4ae891beb` (`docs(m33): specify renderer review handoff`, commit present in this tree). M33-03 is closed at `b4386e2786342c685a61262467b61b6e12e33f95`.

**Worker:** M33-05 task agent

**Reviewer:** integrator pending

## What exists and what does not

Read before writing tests: `AGENTS.md`, `TODO.md` (M33 rows), `docs/tasks/M33/M33-05.md`, `docs/milestones/M33.md`, `docs/design/M33-02-shadow-host-placement.md` (recommendation only), `docs/design/M33-03-d07-scene-version-media-rights.md`, `docs/design/M33-04-single-renderer-review-handoff.md`, `docs/design/M33-05-private-poster-access-attribution.md`, `docs/audit/M33-05-private-poster-access-attribution.md`, `docs/architecture/ECHOLOG.md`, and the code below.

Committed code reused instead of a mocked pipeline:

- `packages/moonql-witness/src/index.ts` — D06 consent + per-record view ACL gate, `/witness/testimonies/:id/media-grant` and `/witness/private-media-authorize`, bounded ECHOLOG grant (≤ 5 min). Committed at `ef415f3`.
- `apps/echolog/src/modules/objects/index.ts` — private-witness marker, ARSY authorization callback per read, grant-bound byte serving, marker-before-grant rule. Committed at `ef415f3`.
- `packages/moonql-research/src/source-label.ts` — credit / source-kind / reviewer / AI disclosure labels. Committed at `2300cd0`.
- `packages/moonql-research/src/release-manifest.ts` — exact-version public projection gate over the M18-03 rights/consent vocabulary. Committed.
- `apps/echolog/src/grants.ts` — HMAC download grant bound to one exact object key with a 300 s ceiling. Committed.
- `apps/dock/src/lib/provenance-copy.ts` — the rendered rights/licence label vocabulary (en/id). Committed.
- `apps/dock/src/ui/client/GeneratorStudio.tsx` — inspected: the public demo has no upload, poster, licence, credit, rights or object-key surface.

Absent, and therefore not claimed: a private poster store, draft-attachment/media-manifest model, D08 decision service, trusted server-side poster delivery adapter, poster renderer, and any real source/licence/consent evidence. The M33-05 design still states `runtime private access is **BLOCKED**`, and the suite asserts that status so it cannot be silently overclaimed.

Observed parallel-session untracked files (not edited, not depended on): `packages/moonql-witness/src/media-access.ts` + test (M16-04 extraction), and `apps/headquarters/src/lib/shadow-editor.ts` + shadow page/test (M17-05 private-draft contract; no media/attachment, poster, licence or digest concept). They are outside this task's claim; the suite imports only committed sources.

## Claimed and actual files

Claimed (3 new files, no source edits):

- `apps/arsy/test/m33-05-private-poster-access.test.ts`
- `test/planning/m33-05-private-poster-access-attribution.test.mjs`
- `docs/audit/M33-05-private-poster-access-verification.md`

Actual at time of report (from `git status --porcelain`): exactly those three paths appear as new untracked files; no tracked file was modified by this task. Rebuilding `packages/moonql-witness` regenerated its gitignored `dist/` from committed `src/index.ts` (`dist/` is not tracked).

## Acceptance coverage

### 1. Private poster is unreachable without an explicit principal + scope grant; a denial leaks nothing

`apps/arsy/test/m33-05-private-poster-access.test.ts` boots the real MoonQL addon set (`base`, `auth`, `witness`) behind the ARSY Fastify envelope with a synthetic identity resolver and an in-process fake ECHOLOG, then attaches a synthetic `image/png` asset ("poster artwork", digest `aaa…`, opaque object-key canary) through the committed D06 intake.

- Anonymous intake → `401`, ECHOLOG never contacted.
- Intake response omits object key and digest; the private model has `rest: false`, so `/orm/witness_testimonies` (list and per-record) is `404`.
- `POST /orm/witness/testimonies/:id/media-grant`: anonymous → `401`; stranger → `404`; admin role without a per-record ACL → `404`; all three make **zero** ECHOLOG grant requests.
- Authorized author → `200` with a URL on the exact digest path, token present, expiry within five minutes, no object key in the body.
- Every denial is asserted to contain only `{ok:false, error:{statusCode,message}, timestamp}` — no `data`, no bytes signature, no `http(s)://`, no object key, no digest, no grant token.

### 2. Cross-draft, cross-principal and revoked/expired access denied

- Author A cannot request a grant for author B's poster (`404`, zero ECHOLOG calls).
- ECHOLOG authorization callback (`/witness/private-media-authorize`) denies author A for B's digest (`404`), allows B for B's digest (`204`), and denies an unknown digest (`404`) without echoing it.
- Expired consent cannot attach artwork (`404`, ECHOLOG not contacted); withdrawn consent revokes grant access (`404`, ECHOLOG not contacted).
- ECHOLOG grants that are already expired, longer than five minutes, bound to another object (cross-draft reuse) or widened with an extra query parameter are all refused (`503`, fail-closed) with no token/URL leak.

### 3. Attribution is preserved and required

`test/planning/m33-05-private-poster-access-attribution.test.mjs` drives the committed source-label and rights-label contracts:

- Positive: licensed third-party artwork carries a named credit (`sourceIdentity.ref`/version exact), the licence kind label, `DERIVATIVE — NOT ORIGINAL SOURCE`, and the cleared licence label `Rights cleared for this exact version` (plus a non-empty `id` label).
- Negative: `RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, `PUBLIC_DOMAIN` and an unrecognised code never render the cleared label; a missing/blank credit renders `SOURCE UNAVAILABLE — no source identity recorded` with reason `SOURCE_IDENTITY_MISSING`; missing source kind / reviewer / AI record downgrade with reasons; no label field is ever blank.
- Matrix (4 credit values × 4 reviewer variants × 4 AI states): third-party artwork can never be badged positive (`0`), and project-original artwork badges positive exactly once — only with exact credit, verified rights reviewer, `NONE` AI record and no reasons.
- Limitation made explicit in the test and here: the committed code **downgrades**; it never refuses. "An attribution-missing poster must be refused rather than rendered" exists only in the written M33-05 contract (and the synthetic validator), so the suite asserts the contract text (`Missing/ambiguous required credit … blocks the request`, `Attribution is not a license and does not grant access`) instead of pretending a renderer enforces it.

### 4. Public projection never includes a private poster

- `resolvePublicRevision` refuses `DRAFT`/`IN_REVIEW` (`REVISION_UNAPPROVED`), `RIGHTS_UNKNOWN`, `METADATA_ONLY`/`RESTRICTED`, rights scopes `INTERNAL_PREVIEW`/`DOWNLOAD`, consent scopes `PRIVATE_ARCHIVE`/null, and expired consent. Each refusal has exactly `{resolved, refusal}` and does not leak the content reference.
- Positive resolution requires cleared rights + `public` rights scope + `public` consent + `PUBLISHED`; the resolved revision has only reference/metadata fields — no object key, digest, credit, media or grant field — and the serialized record is bounded.
- `RELEASE_CONTENT_TYPES` is exactly `['TEXT','TESTIMONY','STORY']`: the public projection vocabulary has no media/artwork type at all, so a private poster has no public projection path today.
- Grant primitive: the 300 s HMAC grant verifies only for its exact object key and time window; expired, cross-object, wrong-key, tampered, extra-segment and opaque tokens all fail.

### 5. Structural contract guards

The planning test asserts the exact scope (`INTERNAL_PREVIEW` and `DOWNLOAD` each requiring its own decision), the "roles/object URLs/cache/prior approval are not authority" rule, "only after that check may a trusted server retrieve bytes", the prohibition on mislabelling a poster as witness media, publication-only public credit, the M33-04 render-receipt/identical-digest rules, the M33-03 non-exportable list and "return no bytes or access grant", plus the blocked runtime status. It also asserts the Dock generator contains no `upload|attach|poster|licen|credit|rights|echolog|objectKey` surface.

## Commands actually run and observed output

All commands were executed in this worktree at `cc40c205…`.

1. Harness baseline — existing committed gate test (probe only):

```text
cd apps/arsy && pnpm exec tsx --test test/witness-access.test.ts
✔ 5 tests, pass 5, fail 0 (duration ~1028 ms)
```

2. Rebuild the witness package so the runtime test exercises `dist/` compiled from committed `src/index.ts` (`dist/` is gitignored):

```text
pnpm --filter @moonwitness/witness build
> @moonwitness/witness@1.0.0 build … > tsc -b
exit 0
```

3. New runtime access test (positive + negative):

```text
cd apps/arsy && pnpm exec tsx --test test/m33-05-private-poster-access.test.ts
✔ M33-05: a private poster asset needs an explicit principal-bound, in-scope grant; every denial is leak-free
✔ M33-05: cross-draft and cross-principal access is denied before ECHOLOG is asked
✔ M33-05: expired consent, withdrawn consent and expired or mismatched grants fail closed
✔ M33-05: a private poster reference has no public REST projection
tests 4, pass 4, fail 0, exit 0
```

4. New planning contract test:

```text
node --test test/planning/m33-05-private-poster-access-attribution.test.mjs
✔ M33-05 positive: a licensed, credited poster carries its credit and licence label
✔ M33-05 negative: an unlicensed or attribution-missing poster never renders as cleared or original
✔ M33-05 negative: no credit/reviewer/AI combination can render a positive badge
✔ M33-05 negative: a public projection refuses a private or unlicensed poster revision
✔ M33-05 positive: only an exact-version, publicly cleared poster revision can project, and it carries no media bytes
✔ M33-05 negative: a download grant is bound to one exact object and expires
✔ M33-05 structural: the poster contract requires scoped access, leak-free denial and attribution
tests 7, pass 7, fail 0, exit 0
```

Observed stderr (cosmetic, pre-existing): `MODULE_TYPELESS_PACKAGE_JSON` / "Reparsing as ES module" for `apps/dock/src/lib/provenance-copy.ts` because `apps/dock/package.json` declares no `type`. No file was edited to silence it. The committed M18-06 planning test uses the same direct-TS-import idiom.

5. Scoped ESLint:

```text
pnpm exec eslint apps/arsy/test/m33-05-private-poster-access.test.ts   → exit 0
pnpm exec eslint test/planning/m33-05-private-poster-access-attribution.test.mjs → exit 0
```

6. Focused TypeScript check of the owning package's test project:

```text
pnpm --filter @moonwitness/arsy exec tsc --noEmit -p test/tsconfig.json → exit 0
```

7. Existing M33-05 synthetic contract validator (regression, not new evidence):

```text
node scripts/check-m33-05-private-poster-contract.mjs
M33-05 private poster/access attribution contract: PASS
synthetic positive: exact scene/render/object, scoped rights, private decision and required credit accepted
negative vectors rejected: anonymous request, principal mismatch, decision for another render, revoked rights, download without download scope, missing required credit, public credit outside publication scope, credit evidence mismatch, public publication absent, object bytes changed
real-media/access verification: BLOCKED (no approved source, operational D08, or private delivery integration)
exit 0
```

Not run: root `pnpm verify`, full `pnpm test`, `pnpm typecheck`, Docker, browser, database, S3, D08, deployment. The suite was not mutation-tested. After the original task run, the integrator added this planning suite to the root `test` script alongside the M21-02 planning test; that combined root invocation and exact-SHA CI remain pending. The ARSY runtime test is already included by the existing `test/**/*.test.ts` glob.

## Security, rights and privacy

- Only synthetic principals, a repeated-hex digest, an opaque key canary, an in-memory ECHOLOG double and fabricated credit refs were used. No real artwork, licence, consent, witness material, principal, credential, service key or signed URL was read, written, logged or committed.
- Assertions require denials to carry only a generic reason envelope: no bytes, URL, object key, digest or grant token.
- No new identity authority, SQL owner, route, table, role, renderer, publication path or public projection was added.
- The suite records that the ECHOLOG private-witness marker is a D06 safeguard, not a poster ACL, and that the contract forbids relabelling a poster as witness media.

## Rollback

Delete the three new files; no tracked file, migration, schema, credential or configuration was changed. The `packages/moonql-witness/dist/` rebuild is gitignored and regenerable with `pnpm --filter @moonwitness/witness build` (CI builds libraries before tests). No TODO status was changed and nothing was staged, committed, pushed, rebased or deleted.

## Limitations

- **No real poster, store or delivery path.** The runtime evidence exercises the D06 witness consent/ACL gate and the ECHOLOG marker/grant handshake — the only committed private-media path — with poster-shaped synthetic images. The M33-05 contract forbids using that path to deliver a poster, so this proves gate semantics, not an approved poster route.
- **No D08 decision service, D00 server adapter, S3, database, browser or deployment.** No end-to-end exact-object private delivery is verified; runtime private access remains BLOCKED.
- **Attribution refusal is contract-only.** `buildSourceLabel` downgrades and never blocks; the "refuse an attribution-missing poster" rule is asserted structurally from the design document, not from executable enforcement (no renderer exists).
- **Public projection evidence is an absence claim.** The committed manifest has no media/asset type, so a poster cannot be publicly projected today; as a positive publication gate for posters this is untested because no such contract exists.
- **No mutation testing.** The suite was not proven to fail under an injected bypass because app source may not be edited by this task.
- **Concurrent work.** Untracked M16-04 (`media-access.ts`) and M17-05 (`shadow-editor.ts`) files from parallel sessions were observed and left untouched; the M17-05 private-draft contract has no media attachment concept yet and must be re-checked if it later gains one.

## Result

`result_sha`: left to the integrator.

Next eligible task: none in sequence — M33-05 is the last M33 leaf and remains OPEN because runtime verification is blocked; the next open TODO leaf, M35-01, is itself BLOCKED on a real service/buyer. The integrator should keep M33-05 open with this verification evidence attached until an authorized exact poster/source, an operational D08 decision path and a trusted private delivery adapter exist.
