# D08 release authority proposal

**Status: PROPOSAL — NOT RATIFIED.** This is a decision aid for the D08 owner and affected domain owners. It does not amend an accepted ADR, grant publication authority, clear any source, approve any content, or authorize runtime implementation. No witness content, private source bytes, consent evidence, credentials, or production data were accessed.

## Purpose

The repository has accepted a common publication lifecycle and separate pure contracts for immutable release manifests and revocation. It does not yet have an authoritative D08 release record or an approved public projection. This proposal connects those contracts at the policy boundary while leaving choices requiring owner, rights, identity, or privacy authority explicit.

The immediate motivating gap is D05 Research: M34-04 contains anonymous reads but deliberately keeps Research private; M19-19 therefore cannot demonstrate its positive released-public-projection case. The same authority boundary is needed by M18-02 and later publication consumers.

## Ownership and non-goals

- D08 owns the publication eligibility/release decision and publication-side withdrawal, correction, retraction, and takedown decisions. D01/D06/D07 remain authoritative for underlying source-rights, consent, and media-provenance decisions and facts; D08 evaluates and references those outcomes without making or replacing the source-domain decisions. HQ is a review surface, not an authority.
- D01 owns exact-edition source rights; D06 owns witness and consent facts; D07 owns Story/media rights and provenance; each source domain remains authoritative for its own records. D08 records version-bound references and decisions; it does not invent or overwrite those facts.
- D00/ARSY remains the identity and authenticated-principal authority. This proposal creates no second Hub, login system, approval engine, SQL owner, or raw-data repository.
- M18-03 and M18-04 remain pure contracts until an accepted D08 design authorizes their integration. A hash proves integrity, not authorship or approval.
- First public projection scope should be decided explicitly per domain. This proposal does not release Research, Witness, Story, a translation, or any other content.

## Candidate authority contract

These are proposed invariants for owner ratification, not current behavior:

1. **Bind decisions to one exact revision.** A review request and decision refer to the owning domain, stable record id, immutable revision id, content digest, requested audience/scope, and rights/consent snapshots. Changing any bound value invalidates the decision; a new revision requires a new review and release.
2. **Use evidence references, not copied private evidence.** Record opaque references to the authoritative rights, consent, source, and review records, plus the policy/version identifiers needed to re-check them. Do not copy raw source text, witness content, consent documents, or object-store keys into D08, Git, logs, or public responses.
3. **Preserve the accepted lifecycle.** The common states remain `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`. `APPROVED_WITHIN_SCOPE` is not publication. `PUBLISHED` requires an exact-version release manifest and a separately controlled projection activation; a reviewer decision, UI state, fixture, eligibility result, or hash alone cannot publish.
4. **Require a real human decision.** A bot, AI, source owner acting as sole approver, or self-review cannot produce a release decision. The authenticated actor must be derived from D00/ARSY rather than a caller-supplied reviewer string. The required reviewer scope grant, quorum, and separation policy remain explicit ratification choices below.
5. **Project an allowlisted derivative.** Public endpoints consume a D08-approved projection type, not raw domain rows. Every field is included only when the exact release authorizes it for the target audience. An absent or unknown field rule denies that field; raw source bytes, drafts, private evidence, unresolved conflict data, and administrative review details are never inherited from a domain model by default.
6. **Recheck gates at publication and reads.** Immediately before activation, verify that the bound rights and consent references still authorize the requested scope and that the exact revision is approved. A missing, stale, withdrawn, conflicting, or unverifiable reference leaves the projection unpublished or unavailable.
7. **Make withdrawal and takedown release-bound.** M18-04 events target the exact release id/revision. Pending withdrawal/correction/takedown and accepted withdrawal/correction deny public availability; an accepted takedown quarantines it. Reinstatement requires the contract's valid independent appeal and reason. New corrected content is a new revision and release, never an in-place mutation.
8. **Keep refusal outputs non-sensitive.** Refusals expose only opaque release/request identifiers and stable reason codes. They do not return content, source URLs, object locators, consent data, or rights evidence.
9. **Keep storage and projection ownership singular.** The eventual persistent D08 implementation must be assigned within the accepted ARSY/MoonQL ownership architecture. Search, Dock, HQ, ECHOLOG, and caches consume decisions/projections; none becomes a competing publisher or source of truth.

## Owner ratification choices still required

Each choice must be decided by its named authority. The rows below are not settled by this proposal.

| Decision | Current evidence / constraint | Options to ratify (no default) | Required authority |
|---|---|---|---|
| Reviewer quorum and separation | ADR-0003 requires human review; M18-01 specifies a named reviewer; M20-02 registers one-versus-two-person restricted quorum as BLOCKED-ON-D08. | Choose one independent human for every release, or require a two-person quorum for a defined restricted scope. Define conflict/self-review exclusions either way. | D08 owner with privacy/rights reviewers. |
| Reviewer mandate and grant issuance/revocation | M20-02 registers D12/D00 reviewer-scope grants as NEEDS_ADR; D00 currently has `admin/user/guest`, not a reviewer role. | Choose scoped D12 mandates bound to D00 principals, or an explicit policy using existing roles; adding a `reviewer` role requires a separate D00 ADR. Specify grant issuer, revoker and principal-linkage rule. | D00 and D12 owners with D08. |
| Consent evidence authority | D06 owns consent records; M16-04's `evidenceRef` is an administrator-recorded pointer, not proof that consent was verified. | Choose a canonical D06 consent record reference that can be revalidated, or a verified external-evidence attestation with a named verification authority. In both cases define audience/scope and expiry/withdrawal checks; do not copy raw evidence into D08. | D06 owner and privacy reviewer. |
| Rights eligibility by source type | M18-01 supplies type-specific veto boundaries; M34-02 records unresolved `QS_2_82_id_kemenag` attribution; M34-04 NA-3 records the unratified comparative pilot. | Choose to allow only already-defined exact-version clearance while all unresolved types stay withheld, or first ratify explicit D01/D05/D06/D07 criteria for additional types. Resolve the named conflicts before those records are eligible. | D01/D05/D06/D07 owners and rights reviewers. |
| Release manifest and authenticity | M18-03 supplies a content-hash manifest and current-version pointer, but states that a hash is not a signature and pointer write authority is unimplemented. | Choose a trusted, authorized D08 writer with integrity hashes only, or cryptographically signed manifests with explicit key custody/rotation. A hash alone never proves approval. Define atomic activation and consumer validation. | D08 and security owners. |
| Persistent D08 storage owner and API boundary | M02-02 assigns D08 to `@moonwitness/governance`; no accepted implementation/schema or second SQL owner is authorized. | Choose the planned governance MoonQL addon within existing ARSY, or another in-place ARSY/MoonQL module under explicit owner decision. Both retain one Hub and one canonical D08 data owner. | Architecture/domain owners. |
| Decision/event retention, export, deletion | M20-02 §10 leaves evidence retention/export/deletion unresolved; M20-05 says current async `ops_audit` is not immutable approval evidence. | Choose bounded retention with defined deletion/export behavior, or a longer explicit governance-evidence period with a documented privacy/legal basis and deletion exceptions. No duration is assumed here. | D08, D00 and privacy/security owners. |
| Projection field policy and activation | M34-04 explicitly provides no allowlist or released projection. | Choose a versioned per-domain allowlist for a first bounded projection (D05 is the current candidate), or keep all public projections disabled until each domain's allowlist is ratified. Unknown fields default to denial in either option. | D08 plus each source-domain owner. |
| Withdrawal, correction, appeal and cache expiry | M18-04 provides a pure policy contract; M18-05 says search/preview/export/cache consumers are not wired. | Choose synchronous D08 availability checks, or a denormalized path with a defined propagation limit that can never serve stale public content after a withdrawal decision. Verify every search/preview/export/cache consumer before release. | D08 and each consumer owner. |

## Recommended conservative starting position for ratification

**Every item below is a recommendation pending approval by the named owners; none is current policy or authorization.** These defaults are intended to keep unfinished scopes private while giving owners a concrete starting point.

| Area | Recommended starting position, pending required owners |
|---|---|
| Reviewer quorum | Only after D08 ratifies what `UNCLASSIFIED` means, a bounded release in that class may use one independent human reviewer, consistent with ADR-0003 and M18-01. Missing or unknown classification stays withheld. Restricted-content taxonomy and whether it requires a larger quorum remain BLOCKED-ON-D08 until D08/privacy owners ratify the classification and quorum. |
| Identity and reviewer authority | Derive the actor from verified D00 identity. This identifies the human only; it grants no reviewer authority. Require a D00/D12 grant ADR before treating any principal or role as an authorized reviewer. |
| Rights and consent evidence | Reference and recheck exact-version evidence from D01/D06/D07 for the requested scope. D08 owns the publication decision, not the underlying source-rights, consent, or media-provenance facts. Missing or unresolved evidence keeps that source withheld. |
| D08 implementation boundary | Follow M02-02's planned `@moonwitness/governance` ownership within the existing ARSY/MoonQL Hub. This recommendation does not authorize implementation, a new Hub, or a second SQL owner. |
| Manifest and activation | Treat the M18-03 digest manifest as integrity evidence only. Do not activate a public projection until an explicitly authorized D08 writer and activation boundary are ratified and implemented; do not infer publication authority from a matching hash. |
| Public projection | Keep public projections disabled by default. D05 Research is only the first candidate; before enabling it, ratify an exact-version field allowlist and require D05 review/provenance plus exact source-rights/consent evidence for the release. Exclude unresolved rights, consent, review, or source records. Unknown classes and fields remain denied. |
| Evidence retention | Do not invent a retention duration or persist new evidence under this proposal. Keep retention/export/deletion unresolved until privacy/security and D08 owners ratify a purpose, duration, and deletion rule. |
| Revocation | Apply M18-04 decisions to the exact release id/revision. Do not serve stale public content after a withdrawal/takedown decision. Public activation stays off until M18-05 proves every search, preview, export, and cache consumer honors the decision. |

## Suggested phased acceptance after ratification

1. Ratify the policy questions above and register the decision in an accepted ADR. If any source-type rights or consent evidence remains unresolved, keep that type out of scope.
2. Implement only the authorized D08 persistence and decision boundary under the selected existing owner. Add positive exact-revision release cases and negative stale-digest, wrong-scope, missing-rights/consent, self-review, wrong-role, replay, withdrawal, and unknown-field cases.
3. Wire one bounded source-domain projection (D05 Research is the current motivating candidate) to the accepted manifest and explicit allowlist. Keep raw endpoints private and prove the public response contains only approved fields.
4. Wire revocation, cache, search, preview, and export consumers; verify withdrawal and takedown remove public availability and that rollback cannot reopen anonymous raw access.
5. Have the designated human privacy/rights reviewer inspect the exact result SHA and evidence. Only the integrator closes TODO leaves after DoD and exact-SHA evidence pass.

## Current disposition

No task is closed by this proposal. M19-19 remains open because the D08 released-public-projection authority and positive exact-source release path are absent. M18-02 remains open because no durable D08 decision binds verified rights/consent/reviewer evidence to an exact publishable version. M18-05 remains open because revocation is not wired to consumers. M34-04 containment remains in force: unresolved Research stays private.

## Sources

- [ADR-0003 — Source Rights, Consent, and Publishing Storage](../decisions/ADR-0003-source-rights-and-consent.md)
- [M18-01 publication state-machine audit](../audit/M18-01-single-publication-state-machine.md)
- [M18-03 release-manifest contract](../audit/M18-03-release-manifest.md)
- [M18-04 withdrawal/takedown contract](../audit/M18-04-withdrawal-correction-takedown-appeal.md)
- [M20-02 role-scoped review queue decision, §10](../decisions/M20-02-role-scoped-review-queue.md)
- [M34-02 decision, §8](../decisions/M34-02-moonlab-hq-desk-decision.md)
- [M34-04 containment specification](../planning/M34-04-d08-projection-spec.md)
- [M02-02 domain assignments](../decisions/M02-02-domain-assignments.md)
