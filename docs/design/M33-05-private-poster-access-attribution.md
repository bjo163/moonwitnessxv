# M33-05 — Private poster access and attribution contract

**Status: scoped verification contract only.** This document does not implement a poster service, authorize a host, establish rights, or make a poster public. M33-02 remains a recommendation; M33-04's renderer/review binding and M33-03's exact-version rights gates remain prerequisites.

## Ownership and object identity

- D07/ARSY owns the poster's scene-version and render-receipt references. The poster object is identified by the exact ECHOLOG object key and SHA-256 digest from the M33-04 renderer receipt; the scene id/version/digest and renderer version/output digest are immutable bindings. Editing or rerendering creates a new identity and requires a new decision.
- D19/ECHOLOG owns bytes only. It does not decide whether a principal may view a poster, whether a source is licensed, or what attribution is required. D00 remains the identity/session authority; D08 remains the rights, consent and scoped review authority. No new SQL/table owner is introduced.
- The existing public Dock `/studio` generator is a demo, not a private poster store or review surface. Do not expose private bytes, object keys, signed grants, D00 credentials, or S3 credentials through it.

## Private access check

For every private poster request, a trusted server boundary must resolve the live principal through D00 and make a current D08 decision for the requested action and exact poster/render digest. Access is denied if the principal, session, object reference, current scene version, renderer receipt, D08 decision, rights/consent receipt, requested scope, or attribution record is missing, stale, revoked, mismatched, or unknown. Client-supplied roles, object URLs, cache state, and a prior poster approval are not authority.

The initial allowed actions are `INTERNAL_PREVIEW` and `DOWNLOAD`, each requiring its own explicit decision scope. Neither implies sharing or publication. Public access is denied unless a separate D08 publication decision approves this exact render digest and exact `PUBLICATION` scope, and M18's public projection/current-version gates pass. M33-05 creates no such public projection.

Only after that check may a trusted server retrieve bytes from ECHOLOG. Do not place the ECHOLOG service key or the configured bucket's shared SigV4 key in a browser, Dock demo, database, URL, log, or source repository. ECHOLOG's current S3 v1 credential covers the configured bucket and has no per-object policy; therefore a browser or untrusted client must never receive it. The ECHOLOG private-witness marker is a D06 privacy safeguard, not a general poster ACL and not a substitute for D08 authorization. A private poster must not be mislabeled as witness media to obtain that marker's behavior.

For this contract, direct S3 access is not an approved private-poster delivery path. A later owner-approved server adapter must enforce the D00/D08 check before each read and keep broad ECHOLOG credentials server-side. It must not expose a reusable long-lived grant or rely on a client cache. Revocation/cache invalidation remains subject to M18-04/M18-05; until an integration proves that path, runtime private access is **BLOCKED**.

## Attribution binding

Each exact poster render receipt carries a complete attribution manifest for every source input and derived asset. Each entry binds the exact source reference and digest to a D08 rights-evidence reference/digest, allowed use scope, required credit text, attribution visibility scope, and any consent evidence needed for the requested action. Derived poster credits preserve the chain to every contributing input; they are not replaced by the renderer's own name or by a generic "AI-generated" label.

Attribution text, creator identity, URLs, and consented personal details must come from the scoped rights/consent decision, not be inferred from filenames, a public URL, EXIF, a generator preset, or a user assertion. Missing/ambiguous required credit, mismatched source digest, attribution scope mismatch, revoked rights, or withdrawn consent blocks the request. Private review may display only the credit fields approved for that private scope. Public credit is emitted only with the separate exact-version publication decision. Attribution is not a license and does not grant access.

Audit records contain opaque references, exact digests, principal/reviewer references, action/scope, decision time and reason code. They do not copy poster bytes, source material, raw consent, private witness identity, secrets, or signed URLs.

## Synthetic verification vectors

`scripts/check-m33-05-private-poster-contract.mjs` exercises a pure in-memory decision contract. Its positive fixture grants a synthetic authorized reviewer `INTERNAL_PREVIEW` for one exact scene/render/object digest and emits only the synthetic attribution fields approved for that scope. Negative fixtures deny anonymous/stale sessions, another principal's decision, missing or revoked rights, wrong action scope, changed renderer/object digest, missing required credit, disallowed attribution visibility, and a public request without exact D08 publication approval. Fixtures are fabricated identifiers and contain no real media or rights claims.

These vectors establish only that the written policy can be checked consistently. They do not verify D00, D08, ECHOLOG, storage credentials, byte delivery, a real source, consent, renderer output, UI, cache revocation, or publication. Real-media/access verification remains **BLOCKED** until an authorized exact poster and source evidence, D08 decision service, and private server delivery path are available for end-to-end testing.
