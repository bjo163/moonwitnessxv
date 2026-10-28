# M33-03 — D07 scene version and media-rights contract

**Status: scoped specification; not an accepted ADR and not an implementation.** This host-agnostic contract is a follow-on to the M33-02 `HOST-HQ` recommendation. It defines the metadata and fail-closed rules a later D07 implementation must satisfy; it does not choose a renderer, app route, database schema, or storage provider.

## Ownership and boundaries

- D07 / Story & Media owns story, scene, scene-version and media-manifest metadata, as assigned in [M02-02](../decisions/M02-02-domain-assignments.md). ARSY/MoonQL remains the existing Hub and SQL owner. A future HQ workspace consumes D07 through the established server-side data/action boundary.
- ECHOLOG (D19) owns isolated object bytes and content digests; D07 stores references and metadata, never media payloads. D08 owns rights/consent decisions and publication approval. D00 owns principals and identity. This document creates none of those owners or services.
- A scene version is an immutable snapshot. A saved edit creates a new version; it never mutates an existing version. Each version identifies a stable `sceneId`, positive integer `version`, parent version when applicable, author principal, timestamp, and a SHA-256 digest of a canonical metadata snapshot. The snapshot includes the body digest/reference, each media manifest entry, and the rights/consent evidence references. Canonical serialization must be versioned and specified by implementation before any digest is treated as authoritative.
- Scene body bytes and media bytes stay in approved object storage. The D07 manifest stores opaque object references, SHA-256 digests, byte length and media type. Never put bytes, private witness text, access tokens, or signed URLs in Git or public projections.

## Per-version and per-asset evidence

The exact scene body and every referenced asset are independently gated. Minimum metadata for the body and each asset:

| Field | Contract |
|---|---|
| Stable reference and digest | Opaque object/reference key, SHA-256 digest, non-negative byte length and media type; digest binds evidence to the exact bytes/version. |
| Origin | Explicit source class (`ORIGINAL`, `THIRD_PARTY`, `WITNESS_DERIVED`, or `UNKNOWN`); origin does not itself grant rights. |
| Rights status | Reuse the existing `ReleaseRightsStatus` vocabulary from M18-03: `PUBLIC_DOMAIN`, `RIGHTS_EXACT_VERSION_CLEARED`, `METADATA_ONLY`, `RESTRICTED`, `RIGHTS_UNKNOWN`. Missing, malformed, stale, or unrecognized values resolve to `RIGHTS_UNKNOWN`; do not introduce another rights enum. |
| Rights evidence | For an export-eligible status (`PUBLIC_DOMAIN` or `RIGHTS_EXACT_VERSION_CLEARED`), require an immutable D08 decision/evidence reference, evidence digest, reviewer principal and decision time. Do not copy private evidence bytes into D07. A license name, public URL, creator assertion, or source label alone is not evidence. |
| Use scope | Explicit allow-list from `INTERNAL_PREVIEW`, `DOWNLOAD`, `SHARE`, `PUBLICATION`; empty/missing means no export, share or publication. Clearance for one scope never implies another. |
| Consent | For witness-origin or witness-derived material, require an active D08 consent decision reference and digest, decision reviewer/time, and scope covering the requested operation. Missing or withdrawn consent blocks the operation. Consent is separate from copyright/license status. |

`RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, missing evidence, scope mismatch, digest mismatch, or withdrawn/unknown consent is non-exportable by default. `REVOKED` is not a new `rightsStatus`: it is a D08 revocation/takedown stop signal that vetoes access regardless of the stored status. The rule applies to the scene body and to every asset in the selected scene version; one blocked component blocks the whole requested export. A draft, reviewer note, or engineering fixture cannot be treated as rights evidence.

## Operations and review boundary

1. **Save draft:** creates an immutable version and records evidence references; it does not publish or imply clearance. Unknown rights/consent may be recorded as unknown for private workflow, but must not produce an export grant.
2. **Internal preview:** requires authenticated, server-authorized access to the exact draft/version. UI hiding and cookie presence alone are not authorization. Unknown rights never become cleared because an internal preview succeeded.
3. **Download/share:** require `PUBLIC_DOMAIN` or `RIGHTS_EXACT_VERSION_CLEARED` and matching scope for the body and every asset, plus active matching consent wherever personal witness material is involved. The existing M07-04 Corpus text veto remains exact: only `RIGHTS_EXACT_VERSION_CLEARED` passes that text gate. Return no bytes or access grant when any check fails.
4. **Publication:** additionally requires D08 human approval for the exact immutable version digest and exact publication scope, following ADR-0003's `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED` path. For the current M18-03 public-read contract, the scope token is exactly `public`; D07 cannot approve itself. An approval for another version or narrower scope is insufficient.
5. **Revocation/correction:** a D08 rights or consent revocation makes subsequent checks fail closed for all affected versions. Cache/search/export invalidation and takedown mechanics remain governed by M18-04/M18-05 and are not implemented here.

No UI, renderer, generated SVG, or “original” label bypasses these checks. Derived assets retain provenance links to all contributing inputs; derived output is blocked if any input lacks the required scope. Scene-version storage, review workflow, object retention and access-control implementation remain future tasks under M17/M18/M33.

## Acceptance vectors

The accompanying validator uses synthetic in-memory records only:

- **Positive:** a well-formed synthetic version has exact digests, explicit synthetic rights evidence scoped to `DOWNLOAD`, and active synthetic consent where applicable; the contract validator accepts the vector for structural testing.
- **Negative:** unknown/missing rights, missing scope/evidence, withdrawn consent, or a mismatched snapshot digest is rejected for export/publication. Missing fields do not inherit a permissive default.

These vectors test policy shape only. They do not claim any real media is licensed, any person consented, D08 exists as an operational service, or an export/publication route is implemented. Real source and rights verification remains BLOCKED pending a specific source, exact version, rights instrument and scope, plus D08 consent evidence where applicable.

## Deferred implementation decisions

- M33-04 selects the single renderer and review handoff; do not infer renderer identity from this metadata contract.
- M17-03 owns the story/scene identity graph; M17-06 owns concrete license/manifests; M33-05 owns private access and attribution; M18 owns immutable publication, withdrawal and cache invalidation details.
- No new app, SQL owner, identity authority, publication authority, role, route, renderer dependency, source asset, accepted ADR, or task status is created by this specification.
