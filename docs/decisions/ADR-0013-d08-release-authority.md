# ADR-0013 — D08 release authority: conservative ratification

**Status: ACCEPTED — owner ratification, 29 October 2026.** The owner ratified the *conservative starting position* of [the D08 release-authority proposal](../design/D08-release-authority-proposal.md) as stated, with no item-by-item changes. Acceptance records policy only. It does not prove implementation, does not publish, clear, or release any content, and does not by itself authorize a schema, route, deployment, or public projection.

## Context

The repository accepts a common publication lifecycle (ADR-0003) and holds separate pure contracts for an immutable release manifest (M18-03) and withdrawal/correction/takedown/appeal (M18-04). No authoritative D08 release record or approved public projection exists, so M16-05, M18-02, M18-05, M19-19, M20-04 and the M27 release leaves cannot close on policy grounds alone. The proposal listed nine ratification choices with no default; the owner has now decided them as one conservative position.

## Decision

The following are accepted policy. Each line states the accepted position and what it still needs before it becomes executable behaviour.

1. **Reviewer quorum and separation.** Bounded releases may use **one independent human reviewer**; restricted-content classification and any quorum above one remain BLOCKED-ON-D08 until the D08 and privacy owners ratify the classification. Missing or unknown classification stays withheld. Self-review and conflict-of-interest exclusions apply in all cases.
2. **Reviewer mandate and identity.** The deciding actor is derived from **verified D00/ARSY identity**, never a caller-supplied reviewer string. Identity alone grants no reviewer authority: a D00/D12 reviewer-grant ADR must exist before any principal or role is treated as an authorized reviewer, and adding a `reviewer` role requires a separate D00 ADR. Until then, no reviewer role is assumed.
3. **Rights and consent evidence.** D08 records **opaque references** to exact-version D01/D06/D07 rights, consent, source and review records and rechecks them at decision and read time. D08 does not own or overwrite those facts. Missing, stale, withdrawn, conflicting or unverifiable evidence keeps the source withheld.
4. **D08 implementation boundary.** Any implementation belongs to the planned **`@moonwitness/governance`** D08 domain **inside the existing ARSY/MoonQL Hub**. No second Hub, no second SQL owner, no new approval engine, and no raw-data repository.
5. **Manifest and activation.** The M18-03 content digest is **integrity evidence only**. A matching hash never proves approval. Public activation stays off until an explicitly authorized D08 writer and activation boundary are ratified and implemented.
6. **Public projection.** Public projections are **disabled by default**. D05 Research is only the first candidate and requires an exact-version field allowlist plus D05 review/provenance and exact rights/consent evidence. Unknown fields and unknown classes deny. Raw domain rows, drafts, private evidence and administrative review detail are never inherited by a projection.
7. **Evidence retention.** No retention duration is invented and no new evidence is persisted under this decision. Retention, export and deletion stay unresolved until the privacy/security and D08 owners ratify purpose, duration and deletion rules.
8. **Revocation and consumers.** M18-04 decisions bind to the exact release id/revision. Public activation remains off until M18-05 proves that every search, preview, export and cache consumer serves no stale public content after a withdrawal or takedown.

## Consequences

- **No content becomes public.** No source is cleared, no Research/Witness/Story projection is released, and no public route is opened by this ADR.
- **The D08 contract implementation is authorized; its storage and routes are not.** Step 2 of the proposal's phased acceptance governs: implement the decision boundary under `@moonwitness/governance` within the existing Hub, with positive exact-revision cases and negative stale-digest, wrong-scope, missing-rights/consent, self-review, wrong-role, replay, withdrawal and unknown-field cases. Schema, migration and route work still require their own scoped task and owner review.
- **Leaves stay open until their own DoD passes.** M16-05, M18-02, M18-05, M19-19, M20-04 and the M27 release leaves remain open; this ADR removes a policy blocker, not an implementation or evidence requirement.
- **The D08 proposal is now ratified policy**, and any later change to these positions requires a superseding ADR rather than an edit to the proposal.

## Rollback

Revert this ADR and the proposal status line; no code, schema, data, route or deployment changes depend on it. Consumers that referenced the ratification in `TODO.md` rows must be re-annotated in the same change.

## Sources

- [D08 release-authority proposal](../design/D08-release-authority-proposal.md)
- [ADR-0003 — Source Rights, Consent, and Publishing Storage](ADR-0003-source-rights-and-consent.md)
- [M18-03 release-manifest audit](../audit/M18-03-release-manifest.md)
- [M18-04 withdrawal/takedown audit](../audit/M18-04-withdrawal-correction-takedown-appeal.md)
- [M20-02 role-scoped review queue](M20-02-role-scoped-review-queue.md)
- [M34-04 containment specification](../planning/M34-04-d08-projection-spec.md)
- [M02-02 domain assignments](M02-02-domain-assignments.md)
