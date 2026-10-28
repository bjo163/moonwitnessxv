# M18-03 — Immutable release manifest and current-version pointer

- **Task:** M18-03 (P1) — "Create immutable release manifest and current-version pointer".
- **Acceptance under test:** Public read refers to one approved revision.
- **State:** implementation and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. `TODO.md` was not modified.
- **Worker:** agent session (one new module, one new test file, this report).
- **Date of observation:** 2026-10-27 (local).
- **Baseline branch/SHA:** `dev` / `732e0478238b5b68be041b6c4c62f501ab09ce9d` (short `732e047`).

## Baseline and worktree

- Observed `git rev-parse --abbrev-ref HEAD` = `dev`; `git rev-parse HEAD` = `732e0478238b5b68be041b6c4c62f501ab09ce9d`.
- The worktree was already dirty on entry: `apps/cockpit`, `apps/arsy`, `apps/dock`, `apps/headquarters`, `.env.example`, `docs/audit/screens`, and `next-env.d.ts` / Dock source paths. Those belong to other sessions' WIP; none were opened for write, staged, restored or deleted. `apps/dock` was the shell working directory but no Dock file was edited.
- Baseline package verification before the change: `cd packages/moonql-research && pnpm typecheck` — `tsc --noEmit`, no diagnostics, exit 0.
- No commit, stage, push, rebase or branch operation was performed.

## Method

A **pure, self-contained** module was added at `packages/moonql-research/src/release-manifest.ts`. Its only runtime import is `node:crypto`; there is no ORM, route, store, database, filesystem, environment, network or wall-clock access, and it is **not exported from `src/index.ts`**. It records an approval that a named human already made and only decides which revision a public read may see.

### Manifest and hash

`buildReleaseManifest({ releaseRef, releaseVersion, revisions })` normalizes every revision (content ref, content type, exact edition ref and version, rights status, rights scope, consent scope/expiry, reviewer ref, decided timestamp, approval state), sorts revisions by the code-unit order of `contentRef|contentType|editionRef|version`, and hashes the canonical JSON with `node:crypto` sha256. Canonical JSON sorts object keys recursively, so input property order cannot change the hash; revision input order cannot change the hash either. The result is a `sha256:<64 hex>` string stored as `manifestHash` and computed excluding that field.

The manifest is deeply `Object.freeze`-d and typed `readonly`. Any field change, including `releaseRef` and `releaseVersion`, yields a different hash. Duplicate `contentRef|contentType|editionRef|version` identity throws `DUPLICATE_REVISION` rather than overwriting: **a correction is a new manifest at a new release version, never an in-place overwrite**.

### Pointer

`createCurrentPointer(manifest, { approvedAt, setBy })` returns a frozen record with `version`, `manifestHash`, `approvedAt` and `setBy`. The version is **derived from the manifest's immutable `releaseVersion`**, not supplied by the caller, so a pointer cannot claim a version the manifest does not record. Creating a new pointer record is the only way to move the current version.

### Resolution

`resolvePublicRevision(pointer, manifests)` checks, in this fixed order:

| # | Rule | Refusal |
|---|---|---|
| 1 | Pointer is an object with sha256 `manifestHash`, integer `version >= 1`, parseable `approvedAt`, non-empty `setBy` | `POINTER_INVALID`, `POINTER_VERSION_INVALID` |
| 2 | `manifests` is an array whose every entry is an object | `MANIFEST_LIST_INVALID` |
| 3 | Exactly one manifest carries the pointer's hash | `MANIFEST_NOT_FOUND`, `MANIFEST_AMBIGUOUS` |
| 4 | That manifest is a `moonwitness.release-manifest` v1 record with a non-empty revision list and well-shaped revisions | `MANIFEST_INVALID`, `REVISION_FIELD_INVALID` |
| 5 | Its canonical content still hashes to its stored hash | `MANIFEST_TAMPERED` |
| 6 | Pointer `version` equals the manifest's `releaseVersion` | `POINTER_VERSION_UNKNOWN` |
| 7 | Exactly one revision is `APPROVED_WITHIN_SCOPE` or `PUBLISHED` | `REVISION_UNAPPROVED`, `MULTIPLE_APPROVED_REVISIONS` |
| 8 | Rights are cleared for the public scope | `RIGHTS_UNKNOWN`, `RIGHTS_NOT_CLEARED`, `RIGHTS_SCOPE_MISMATCH` |
| 9 | Consent covers the public scope and is unexpired at the pointer's `approvedAt` | `CONSENT_MISSING`, `CONSENT_SCOPE_MISMATCH`, `CONSENT_TIMESTAMP_INVALID`, `CONSENT_EXPIRED` |

Success returns exactly one whitelisted, frozen `revision` with the content ref, content type, exact edition/version, rights state, reviewer ref, decision time, approval state, manifest hash and pointer version. A refusal has **no `revision` key**, so it cannot carry a content ref by construction.

Approval semantics follow M18-01 / ADR-0003: the module does not transition `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`, does not mint a reviewer, and does not approve anything. It reads the recorded state and refuses everything not currently approved within scope.

### Rights and consent vocabulary

Rights statuses reuse the research/corpus terms in `packages/moonql-research/src/seed.ts`: `PUBLIC_DOMAIN`, `RIGHTS_EXACT_VERSION_CLEARED`, `METADATA_ONLY`, `RESTRICTED`, `RIGHTS_UNKNOWN`. Only `PUBLIC_DOMAIN` and `RIGHTS_EXACT_VERSION_CLEARED` can clear public release, and the recorded rights scope must equal `public` exactly. ADR-0003's `LICENSED` maps to `RIGHTS_EXACT_VERSION_CLEARED`; `RESTRICTED_METADATA_ONLY` maps to `METADATA_ONLY`/`RESTRICTED`. Consent must be `public`-scoped for every content type, matching the conservative M21-03 precedent; a `null` consent is a recorded state that resolves to `CONSENT_MISSING`.

### Refusal code list

`POINTER_INVALID`, `POINTER_VERSION_INVALID`, `POINTER_VERSION_UNKNOWN`, `MANIFEST_LIST_INVALID`, `MANIFEST_INVALID`, `MANIFEST_NOT_FOUND`, `MANIFEST_AMBIGUOUS`, `MANIFEST_TAMPERED`, `REVISION_UNAPPROVED`, `MULTIPLE_APPROVED_REVISIONS`, `REVISION_FIELD_INVALID`, `RIGHTS_UNKNOWN`, `RIGHTS_NOT_CLEARED`, `RIGHTS_SCOPE_MISMATCH`, `CONSENT_MISSING`, `CONSENT_SCOPE_MISMATCH`, `CONSENT_TIMESTAMP_INVALID`, `CONSENT_EXPIRED`.

Construction errors (thrown, not returned) use `ReleaseManifestError.reason` from: `RELEASE_REF_MISSING`, `RELEASE_VERSION_INVALID`, `REVISIONS_MISSING`, `REVISION_FIELD_MISSING`, `REVISION_FIELD_INVALID`, `CONTENT_TYPE_UNKNOWN`, `RIGHTS_STATUS_UNKNOWN`, `APPROVAL_STATE_UNKNOWN`, `TIMESTAMP_INVALID`, `DUPLICATE_REVISION`, `MANIFEST_INVALID`, `MANIFEST_TAMPERED`, `POINTER_FIELD_INVALID`, `POINTER_TIMESTAMP_INVALID`, `POINTER_SETTER_MISSING`.

## Files

- `packages/moonql-research/src/release-manifest.ts` — new, 654 lines, pure module and types.
- `test/planning/m18-03-release-manifest.test.mjs` — new, 350 lines, 26 `node:test` cases with synthetic fixtures.
- `docs/audit/M18-03-release-manifest.md` — this report.

Nothing else was created or changed: `TODO.md`, `packages/moonql-research/src/index.ts`, schemas, migrations, routes and all pre-existing modified files were left untouched. `git status --short -- packages/moonql-research test/planning` shows only the two untracked new files.

## Positive evidence

Command, run from the repository root:

```text
node --experimental-strip-types --test test/planning/m18-03-release-manifest.test.mjs
```

Exit code **0**, 26 tests, 26 pass, 0 fail. Verbatim output:

```text
✔ positive: exactly one approved revision resolves through the current pointer (2.896ms)
✔ positive: one published revision beside a draft resolves only the published revision (0.4293ms)
✔ positive: each content type resolves its own approved revision and exact edition/version (0.666ms)
✔ positive: approved-within-scope and published both resolve; draft and in-review do not (0.8707ms)
✔ positive: the manifest hash is deterministic across revision order and rebuilds (1.1917ms)
✔ positive: every manifest field change produces a different hash (0.564ms)
✔ positive: the pointer records version, manifest hash, approved-at instant and setter (0.3255ms)
✔ positive: a correction is a new manifest and a new pointer, never an overwrite (0.3855ms)
✔ positive: build copies its input, so mutating the source cannot alter a built manifest (0.2826ms)
✔ negative: two approved revisions are never both returned (0.4249ms)
✔ negative: rights-unknown revisions are refused (0.3218ms)
✔ negative: metadata-only and restricted rights are refused (0.3705ms)
✔ negative: rights cleared for another scope are refused (0.346ms)
✔ negative: missing consent is refused (0.3346ms)
✔ negative: consent for another scope is refused (0.2499ms)
✔ negative: consent expired at the pointer instant is refused (0.3533ms)
✔ negative: a pointer to an unknown release version or manifest is refused (1.0819ms)
✔ negative: an invalid pointer version is refused (2.3986ms)
✔ negative: a malformed pointer is refused (0.3174ms)
✔ negative: tampered manifest content is refused even when the pointer hash still matches (0.3578ms)
✔ negative: an ambiguous registry holding the same hash twice is refused (0.19ms)
✔ negative: a non-list or malformed registry is refused (0.1964ms)
✔ negative: duplicate revision identity cannot silently overwrite a revision (0.6566ms)
✔ negative: an approved revision without a reviewer or decision time is rejected (0.2814ms)
✔ negative: in-place mutation attempts throw and leave the manifest unchanged (0.3268ms)
✔ negative: pointer creation rejects tampered manifests and invalid pointer fields (1.4003ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 208.663
```

What the positive cases prove:

- A published, rights-cleared, consent-covered revision is the one revision returned for a pointer that names its manifest; the edition, version, reviewer, decision time, approval state, manifest hash and pointer version are returned exactly.
- A manifest containing one published revision beside a draft resolves only the published revision.
- `TEXT`, `TESTIMONY` and `STORY` each resolve their own approved revision with the exact edition and version.
- `APPROVED_WITHIN_SCOPE` and `PUBLISHED` resolve; `DRAFT` and `IN_REVIEW` do not.
- Revision input order and rebuilds do not change the hash; every content, edition, version, rights, consent, reviewer, decision, approval-state, release-ref and release-version change does.
- A correction produces a new manifest and a new pointer; the old pointer still resolves the old manifest and cannot resolve the corrected one.
- Mutating the caller's source object after `buildReleaseManifest` cannot alter the built manifest.
- Every returned structure is frozen; in-place edits throw `TypeError` and leave values unchanged.

## Negative evidence

Each negative case returns `resolved: false` with the named stable code; the shared assertion checks there is no `revision` key and that the serialized refusal contains none of the synthetic content, edition or release refs.

| Scenario | Observed refusal |
|---|---|
| Two `PUBLISHED` revisions in one manifest | `MULTIPLE_APPROVED_REVISIONS` |
| `DRAFT` / `IN_REVIEW` only | `REVISION_UNAPPROVED` |
| `RIGHTS_UNKNOWN` with valid consent | `RIGHTS_UNKNOWN` |
| `METADATA_ONLY`, `RESTRICTED` | `RIGHTS_NOT_CLEARED` |
| Rights scope `internal-preview` or `null` | `RIGHTS_SCOPE_MISMATCH` |
| Consent scope `null` | `CONSENT_MISSING` |
| Consent scope `internal-preview` | `CONSENT_SCOPE_MISMATCH` |
| Consent expiry before or exactly at the pointer instant | `CONSENT_EXPIRED` |
| Pointer version 99 over a release-version-3 manifest | `POINTER_VERSION_UNKNOWN` |
| Pointer hash with no manifest, or empty registry | `MANIFEST_NOT_FOUND` |
| Pointer version 0, negative, fractional or string | `POINTER_VERSION_INVALID` |
| Null pointer, bad hash format, bad timestamp, blank setter, missing hash | `POINTER_INVALID` |
| Manifest field changed while keeping its stored hash, or an extra field added | `MANIFEST_TAMPERED` |
| Same manifest hash listed twice | `MANIFEST_AMBIGUOUS` |
| Registry is not an array, or contains a non-object entry | `MANIFEST_LIST_INVALID` |
| Duplicate content+edition+version build | throws `DUPLICATE_REVISION` |
| Approved revision without reviewer or decided-at; invalid consent timestamp; release version 0 | throws `REVISION_FIELD_MISSING`, `TIMESTAMP_INVALID`, `RELEASE_VERSION_INVALID` |
| Tampered manifest passed to pointer creation; invalid pointer fields | throws `MANIFEST_TAMPERED`, `POINTER_TIMESTAMP_INVALID`, `POINTER_SETTER_MISSING`, `POINTER_FIELD_INVALID` |
| In-place edit of manifest, revisions array or hash | `TypeError`, values unchanged |

## Commands and observed results

All commands were run locally on 2026-10-27. No network, database, Docker, build or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `git rev-parse --abbrev-ref HEAD` / `git rev-parse HEAD` (repo root) | `dev` / `732e0478238b5b68be041b6c4c62f501ab09ce9d` |
| `pnpm typecheck` (`packages/moonql-research`), before the change | no diagnostics, exit 0 |
| `node --experimental-strip-types --test test/planning/m18-03-release-manifest.test.mjs` (repo root) | 26 tests, 26 pass, 0 fail, exit 0, 208.663 ms |
| `pnpm exec eslint test/planning/m18-03-release-manifest.test.mjs packages/moonql-research/src/release-manifest.ts` (repo root) | no output, exit 0 |
| `pnpm typecheck` (`packages/moonql-research`), after the change | no diagnostics, exit 0 |

The first test run after an intermediate design step failed one case: a forged higher pointer version over a known manifest hash still resolved. That exposed that a caller-supplied version was not bound to the manifest. The design was corrected so the pointer version is derived from the manifest's immutable `releaseVersion` and a mismatch returns `POINTER_VERSION_UNKNOWN`; the final run above is the corrected one, 26/26.

## Security, rights and privacy notes

- **Fail closed.** Authorization is the last return statement; every malformed, missing, mismatched or unknown input returns a refusal with no content ref. Structures are built from a whitelist so extra input fields cannot leak.
- **Rights gate.** `RIGHTS_UNKNOWN`, `METADATA_ONLY` and `RESTRICTED` never release; only `PUBLIC_DOMAIN` and `RIGHTS_EXACT_VERSION_CLEARED` with a `public` rights scope can.
- **Consent gate.** Consent must be `public`-scoped and unexpired at the pointer instant for every content type. Withdrawn or absent consent yields no revision.
- **Single approved revision.** Zero approved revisions is a refusal; two or more is a refusal. The resolver never returns more than one revision and never returns a draft.
- **Tamper detection.** A manifest edited without rehashing is `MANIFEST_TAMPERED`; an edited manifest with a new hash no longer matches the old pointer (`MANIFEST_NOT_FOUND`).
- **Immutability.** Manifests, revisions, pointers and resolutions are deeply frozen; the public surface has no update, overwrite or delete operation.
- **No real data.** All fixtures are synthetic `fixture:` refs and `principal:fixture:` names. No witness, source text, consent record, secret, environment value, review note or production identifier was used or written.
- **No alternate approval path.** The module cannot create an approval; it reads `APPROVED_WITHIN_SCOPE`/`PUBLISHED` from a record whose origin remains the named-human review in M18-01/ADR-0003.

## Explicit non-claims

- **Not wired to anything.** The module is not imported by `src/index.ts`, the review subsystem, Dock, any route, endpoint, projection, search, export or cache. No consumer exists yet.
- **No D08 store, database, schema or migration.** Nothing is persisted; manifests and pointers are in-memory caller-supplied objects. No table, column, index or seed was added.
- **No publication occurs.** No content is published, served, indexed, exported or made public by this change. No rights or consent record was created, inferred or granted.
- **No endpoint or HTTP behavior changed.**
- **No TODO or milestone closure.** M18-03 remains unchecked; the integrator must review the evidence.
- **No commit, push, deployment or CI result.** `result_sha` is the baseline plus untracked files.
- **No reviewer approval.** Reviewer is unassigned in this report.

## Limitations

- **Prototype pure functions.** The module trusts caller-supplied manifests, pointers and the pointer's `approvedAt`. It does not verify who approved, whether the reviewer is independent, or whether the manifest came from the D08 store.
- **Hash is integrity, not authenticity.** A sha256 hash detects accidental or stale edits; it is not a signature. An actor who can rewrite both a manifest and the pointer can produce a self-consistent pair. Pointer write authority, monotonic version enforcement and audit logging belong to the D08 store, which is not implemented.
- **No wall clock and no live consent re-evaluation.** Consent expiry is evaluated against the pointer's `approvedAt` only. A pointer that remains current after consent expires is not automatically re-checked; M18-04/M18-05 must re-evaluate at read time or move/withdraw the pointer. This is deliberate to keep the function deterministic.
- **Exact-string scopes.** `public` must match character-for-character; no hierarchy, wildcard or normalization exists.
- **Per-manifest granularity.** The manifest can list many revisions, but only one may be approved at a time; a release needing two simultaneously public revisions is not modeled and would be refused as `MULTIPLE_APPROVED_REVISIONS`.
- **No revision-selection policy.** If two revisions are approved, the resolver refuses rather than choosing a "latest"; choosing is an editorial decision this module must not invent.
- **Manifest registry is caller-supplied.** Ambiguity, duplicates and ordering are handled fail-closed but the registry itself is not authenticated.
- **Reviewer identity is an opaque ref.** No signature, issuer or four-eyes verification is performed here; M14/ADR-0003 remain the source of the review decision.
- **No content bytes.** The module returns references only; it cannot redact or inspect content after resolution.

## Rollback

Delete the three new files:

1. `packages/moonql-research/src/release-manifest.ts`
2. `test/planning/m18-03-release-manifest.test.mjs`
3. `docs/audit/M18-03-release-manifest.md`

No existing file, export, schema, migration, dependency, environment, route or stored data requires reverting. `packages/moonql-research/src/index.ts` was never edited, so the package barrel is unchanged.

## Report fields

- `task_id`: M18-03
- `baseline_sha`: `732e0478238b5b68be041b6c4c62f501ab09ce9d` (`dev`)
- `worker`: agent session
- `claimed_files`: `packages/moonql-research/src/release-manifest.ts`, `test/planning/m18-03-release-manifest.test.mjs`, `docs/audit/M18-03-release-manifest.md`
- `actual_changed_files`: same three paths, all new/untracked; no existing file changed
- `positive_test_and_output`: `node --experimental-strip-types --test test/planning/m18-03-release-manifest.test.mjs` — 26 tests, 26 pass, 0 fail, exit 0; positive cases cover one-approved resolution, draft-beside-published, all three content types, both approved states, determinism, field-change hashing, pointer fields, correction-as-new-manifest, input-copy immutability
- `negative_test_and_output`: same 26/26 run — 17 refusal scenarios plus thrown construction errors and in-place mutation rejection, each checked to carry no content ref; full table above
- `security_rights_privacy`: fail-closed whitelist construction; rights-unknown/metadata-only/restricted never release; public-scope rights and consent required; expired/missing consent refused; two approved revisions refused; tampered manifests refused; frozen structures; synthetic fixtures only; no secrets or real source content
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the three new files (above); no existing path changes
- `result_sha`: no commit created; worktree remains at `732e047` plus the three untracked files
- `limitations`: pure prototype, caller-supplied registry and clock, hash is not a signature, consent not re-evaluated after the pointer instant, exact-string scopes, one approved revision per manifest, reviewer identity unverified, not wired to any store or route
- `next_eligible_task`: M18-04 — "Implement withdrawal, correction, takedown and appeal process" (after integrator acceptance of M18-03; M18-02 remains open and independently eligible, and M18-06 also depends on M18-03)
