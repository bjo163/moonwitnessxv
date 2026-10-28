# M33-04 — Single scene renderer and human-review handoff contract

**Status: scoped specification; no host decision, accepted ADR, or runtime implementation.** M33-02's `HOST-HQ` remains a recommendation only. This contract defines one D07 scene-rendering protocol and a D00/D08 review handoff that any later, owner-approved host must use. It adds no route, UI, schema, renderer package, or publication capability.

## Boundaries

- **D07 / ARSY:** owns scene versions and media-manifest metadata in the existing ARSY/MoonQL data boundary. The editor submits immutable version references and digests; a client does not write D07 directly or own a database.
- **D00:** remains the sole identity and authorization authority. A protected editor/handoff verifies a live server-side session and the actor's authorized D07/D08 action. Cookie presence, client-supplied role, hidden controls, or a signed-in Dock demo are not authorization.
- **D08:** owns human review decisions, rights/consent decisions, and publication authority. The renderer never approves; the editor cannot approve its own submission; rendering or review approval alone never publishes.
- **D19 / ECHOLOG:** owns object bytes. The renderer receives only the exact authorized scene snapshot and assets through a trusted adapter; manifests keep opaque refs/digests and no byte payloads in D07 or Git.
- **Host placement:** no host is selected here. If the owner later ratifies HQ placement, HQ may provide the authorized UI. If another host is approved, it must reuse this same protocol and D00/D08 boundary. Dock `/studio` remains a public demo and is not a private review surface by this specification.

## One renderer contract

There is one authoritative renderer implementation/version for a given render contract. Preview and downloadable derivative outputs call that same implementation; hosts must not reimplement scene layout, geometry, text shaping, or export serialization independently. A later owner decision may place the implementation in a shared package or a trusted service. This specification chooses neither technology nor deployment location.

The renderer accepts a normalized, immutable input tuple:

```text
sceneId + positive sceneVersion + sceneVersionDigest
+ rendererContractId + rendererVersion
+ outputFormat + bounded viewport/options
+ exact authorized asset refs and digests
```

It returns a render receipt containing the exact input digest, renderer contract/version, normalized options digest, output MIME type, output byte digest, dimensions, and creation time. Repeating the same tuple with the same renderer version must produce the same output digest; if a renderer is nondeterministic, it cannot be used as the authoritative export renderer until its nondeterminism is captured and reviewed. Any edit to the scene, assets, options, or renderer version creates a distinct render receipt.

Initial output formats are limited to the formats already emitted by the inspected demo: `image/svg+xml` and `image/png`. SVG must not contain scripts, event handlers, external resource references, or undeclared fonts/assets. Raster output must derive only from the authorized snapshot and assets. Adding a format or a renderer version requires a reviewed compatibility/security update; no generator output is a source-rights grant.

The renderer is a deterministic transformation boundary, not an authority boundary. It cannot fetch arbitrary URLs, execute scene-provided code, grant access to ECHOLOG objects, decide rights, change D08 review state, or write a public manifest. M33-03 gates remain in force: the exact scene/body and each asset need an eligible existing rights status and evidence/scope; `RIGHTS_UNKNOWN`, `METADATA_ONLY`, `RESTRICTED`, revoked evidence, or insufficient/withdrawn consent blocks export/publication. The stricter M07-04 text gate remains unchanged.

## D08 human-review handoff

1. The author requests review of an exact immutable `sceneId`, version, and `sceneVersionDigest`. A new edit creates a new version and a new request. The request includes the renderer receipt and an opaque reference to the M33-03 rights/consent gate evidence; it does not contain source bytes or private witness material.
2. A trusted server boundary resolves the author via D00 and checks permission before accepting the request. It verifies that the renderer receipt's input digest equals the submitted scene version digest and that the rights receipt is bound to the same digest and requested scope. A client cannot submit an `ALLOW` bit or impersonate the server's rights decision.
3. The host UI is a review client only. It displays the immutable version, provenance/rights/consent state, and renderer preview. It sends the decision to D08 through an authorized server action. D08 may retrieve the exact version and assets from their owners; bytes are not copied into the review request or audit event.
4. D08 records the named reviewer principal, decision time, decision/reason, exact version digest, renderer receipt/output digest, and exact scope. The reviewer must have D00's reviewer authority and differ from the author. The state vocabulary follows ADR-0003/M18 (`DRAFT`, `IN_REVIEW`, `APPROVED_WITHIN_SCOPE`, `PUBLISHED`); this spec creates no additional state machine. Approval applies only to the recorded digest/scope. A changed version or output needs fresh review.
5. A D08 review approval is not publication and does not override M33-03 rights/consent vetoes. Publication/current-version selection remains M18/D08 work. No client-side route, export button, renderer receipt, or D07 field can publish.

Pending, denied, stale, mismatched, unauthorized, self-reviewed, or missing-evidence requests fail closed. Responses and logs use opaque identifiers and reason codes; they do not echo private body text, witness identity, raw consent, signed URLs, or media bytes. A review UI added later must follow the selected host's established `id`/`en`, keyboard, focus, and accessible status patterns; this document does not claim those UI checks.

## Synthetic acceptance vectors

The accompanying validator checks only contract relationships using in-memory synthetic refs/digests:

- A positive vector binds one synthetic scene digest to one renderer input/output receipt, a matching M33-03 eligible rights receipt, a distinct authorized D08 reviewer, and exact-version/scope decision metadata.
- Negative vectors reject mismatched renderer/version digests, absent or denied rights receipts, `RIGHTS_UNKNOWN`/`RESTRICTED` or revoked evidence, mismatched scope/output receipt, self-review, missing reviewer identity, and non-allowlisted output format.

No vector contains actual media, license documents, witness content, or credentials. This proves contract-validator behavior only. Real-media validation remains **BLOCKED** until a real source/version, M33-03 rights and consent evidence, and authorized D08 review environment are available.

## Deferred work

This spec does not implement D07/MoonQL models, D00 session checks, D08 queues/actions, renderer code, ECHOLOG retrieval, Dock/HQ routes, public projections, exports, takedown/cache invalidation, or deployment. M33-05 remains responsible for private poster access and attribution. Host placement requires the owner's separate ratification of M33-02; this artifact does not provide it.
