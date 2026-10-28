# M33-03 — D07 scene-version and media-rights contract evidence

**Task:** M33-03 — Specify D07 scene version and media rights

**Status:** scoped design leaf accepted by integrator; M33-03 is closed at the implementation SHA below. Real-media rights verification remains blocked and is outside this specification's claim.

**Initial baseline branch/SHA:** `dev` / `d7c5103b75316fa21ae4547bc9c8aa1f19a247e2`

**Implementation/result SHA:** `dev` / `b4386e2786342c685a61262467b61b6e12e33f95`

**Remote refs observed:** `origin/dev` = `d7c5103b75316fa21ae4547bc9c8aa1f19a247e2`; `origin/main` = `32060943102120428bff26849601c2c760f851ca`

**Worker:** M16 final security review agent, assigned M33-03 leaf

**Reviewer:** `/root` integrator; reviewed specification, validator, rights vocabulary and boundaries

**Implementation commit:** `b4386e2786342c685a61262467b61b6e12e33f95`; the audit/TODO evidence update is recorded in its descendant.

## 1. Scope and files

This task defines host-agnostic metadata and fail-closed rules for immutable D07 scene versions, body rights, per-asset rights/consent, and exact-version D08 publication approval. It is a specification, not an accepted ADR or runtime implementation. It follows the M33-02 `HOST-HQ` placement recommendation without treating that recommendation as ratified.

| Kind | Path |
|---|---|
| Contract specification | `docs/design/M33-03-d07-scene-version-media-rights.md` |
| Contract validator and synthetic vectors | `scripts/check-m33-03-scene-rights-contract.mjs` |
| This evidence report | `docs/audit/M33-03-scene-version-media-rights.md` |

The two implementation paths are the complete design/code scope: `docs/design/M33-03-d07-scene-version-media-rights.md` and `scripts/check-m33-03-scene-rights-contract.mjs`. This audit is the third task evidence path. No ADR, application source, source media, or schema was changed. The TODO status is closed by the integrator's separate evidence update. Pre-existing unrelated changes were preserved.

## 2. Grounding and boundary

- M33-02 is closed in the baseline TODO at `a7b71c0`; its host choice is explicitly a recommendation, not an accepted ADR. It assigns D07 records to ARSY/MoonQL and leaves identity in D00, approval in D08, and object bytes in ECHOLOG/D19.
- M02-02 assigns Story & Media metadata (including scenes and `media_manifests`) to D07. ADR-0003 separates original bytes from metadata, requires consent for witness material, and requires a human publication path. The revision reuses M18-03's `ReleaseRightsStatus` vocabulary: only `PUBLIC_DOMAIN` or `RIGHTS_EXACT_VERSION_CLEARED` can proceed with evidence/scope; `METADATA_ONLY`, `RESTRICTED`, and `RIGHTS_UNKNOWN` deny. M07-04's text-specific exact-status veto is preserved. Revocation remains an independent D08 stop signal, not a new rights status.
- The inspected `GeneratorStudio.tsx` is a client-side avatar/seal/icon SVG demo with copy/SVG/PNG export handlers. It has no scene model, version store, media-rights evidence, consent check, or authorization boundary. No related focused GeneratorStudio test file was found under `apps/dock/test`.
- The contract therefore specifies metadata and policy only. It does not make the existing Dock demo a private editor and does not create a renderer, schema, route, storage mechanism, publication process, or rights claim.

## 3. Positive evidence

Command executed at exact implementation SHA `b4386e2786342c685a61262467b61b6e12e33f95`:

```text
node scripts/check-m33-03-scene-rights-contract.mjs
```

Observed result (exit 0):

```text
M33-03 scene-rights contract: PASS
synthetic positive vectors accepted for scoped download and exact-version publication approval
negative vectors rejected: RIGHTS_UNKNOWN, RESTRICTED, D08 revocation, missing evidence, withdrawn consent, consent-scope mismatch, missing publication scope/exact-version approval
real-source rights/consent verification: BLOCKED (no real source or evidence supplied)
```

The accepted vectors are in-memory synthetic data with explicitly synthetic evidence references. They check the validator's documented download and exact-version publication contract paths, not an actual D07 implementation, actual rights clearance, or actual export/publication.

## 4. Negative evidence

The same command builds and checks the following in-memory synthetic denials:

- body rights `RIGHTS_UNKNOWN` and `RESTRICTED`;
- an active D08 revocation veto despite an otherwise eligible rights status;
- missing rights evidence;
- witness-derived asset with withdrawn consent;
- active consent whose scope does not cover the requested download;
- publication request with no rights scope for publication and an approval bound to a different version digest.

Every negative vector is asserted rejected by a specific stable error code. No private or real source bytes are used or emitted.

Additional syntax/whitespace checks executed at the same SHA:

```text
node --check scripts/check-m33-03-scene-rights-contract.mjs
git diff --check HEAD^ HEAD -- docs/design/M33-03-d07-scene-version-media-rights.md scripts/check-m33-03-scene-rights-contract.mjs
PowerShell: $matches = Select-String -Path docs/design/M33-03-d07-scene-version-media-rights.md,scripts/check-m33-03-scene-rights-contract.mjs -Pattern '[ \t]+$'; if ($matches) { $matches; exit 1 } else { 'M33-03 implementation whitespace scan: no trailing whitespace' }
```

Both exited 0. No package build, app test suite, database, browser, or deployment was run; this is a docs/contract validator only.

## 5. Security, rights, and privacy

Unknown, missing, restricted, revoked, stale, mismatched, or unrecognized rights/consent remains non-exportable by default. The contract binds review and rights evidence to exact version/content digests and scopes; witness consent is independent of copyright clearance. ECHOLOG is referenced only as byte owner; D07 stores references/metadata. D08 remains the approval authority. No real source, license, consent, or rights instrument was supplied or verified. Real-source verification is **BLOCKED** until the exact source/version, rights instrument and intended use scope are independently reviewed; witness-derived material additionally requires actual D08 consent evidence. Synthetic test strings are not grants or evidence.

## 6. Rollback and result identity

Rollback consists of reverting implementation commit `b4386e2786342c685a61262467b61b6e12e33f95` and its separate TODO/audit evidence commit; it removes only the scoped contract, validator, audit and status note. `git hash-object` recorded the implementation blobs: specification `3aedb21bde9c3243f5e6e9f91d577bf2f20fffd0`; validator `f28bc87c757e58055436f2fa6908d61ee99ffccf`. The validator checks policy vectors; it does not compute/verify a canonical scene snapshot from inaccessible source bytes.

## 7. Limitations and next eligible task

- This artifact defines a minimum policy/data contract only. It does not choose a concrete database representation or canonical serialization implementation; both must be fixed and tested before scene digests are authoritative.
- Real rights and consent are intentionally blocked pending source-owner evidence. No public release or export is authorized by this specification.
- M17-03 identity/version graph, M17-06 concrete media manifests, M33-04 renderer/review handoff, M33-05 private access/attribution, and M18 revocation/cache invalidation remain separate implementation gates.
- **Next eligible:** M33-04 may proceed as a specification task while preserving M33-03's rights gates. Real media integration remains blocked until exact-source rights evidence exists.
