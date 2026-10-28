# M16-05 — Redaction policy proposal

**Status: PROPOSAL — NOT RATIFIED.** This document is a candidate policy for owner and independent privacy review. It is not evidence of approval, a privacy review, consent, rights clearance, or authority to publish. It uses repository contracts only; no witness testimony, consent records, source bytes, or private evidence were accessed.

## Purpose and boundary

Define a conservative, reviewable process for producing a private preview of a redacted derivative after an explicit human publishing request. The original witness object remains private and immutable. A preview does not itself authorize public projection; public release still requires the D08 authority and release record described by ADR-0003 and the M34-04 projection specification.

ECHOLOG may store the original and derivative bytes as D19 objects, but it does not decide consent, rights, redaction, review, or publication. D06 remains the authority for witness consent and access. Object-store credentials must never substitute for a D06 authorization decision.

## Candidate rules

1. **Require a scoped request.** Record an authenticated human requester, the exact source revision, requested purpose and audience, and the consent scope being relied upon. Missing, expired, withdrawn, ambiguous, or narrower-than-requested consent blocks preview generation.
2. **Keep originals separate.** Generate a new derivative from an authorized working copy. Never overwrite or mutate the original. Keep identity fields, attachments, object keys, and raw bytes out of public projections, Git, logs, errors, telemetry, and ordinary review metadata.
3. **Redact identifying information.** Review direct identifiers (names, contact details, account identifiers, faces, voices, signatures, and exact locations) and indirect or combined identifiers (dates, places, relationships, occupations, rare events, and contextual details) that could reasonably identify a person when linked together.
4. **Minimize third-party disclosure.** Remove or generalize private information about people other than the consenting witness. A witness's consent does not grant rights over another person's private information.
5. **Apply heightened caution.** Any indication that a person is a minor or otherwise vulnerable requires masking before review. Identifiable publication of a minor remains prohibited absent the verified guardian permission required by M03-06. If age, permission, or masking adequacy is uncertain, stop and escalate; do not infer permission.
6. **Preserve meaning and epistemic labels.** Do not alter a derivative in a way that reverses or overstates the witness's meaning. Preserve provenance and the distinction between personal testimony, empirical evidence, and fiction. Redaction alone does not turn testimony into verified fact or make it anonymous.
7. **Require independent human review.** A reviewer distinct from the requester, derivative author, and subject of the testimony checks the exact derivative revision and its scope. AI may assist with candidate detection only; it cannot make the approval decision. Review authority and the independence standard require explicit owner/privacy-reviewer ratification before implementation.
8. **Keep preview private.** A preview remains behind the existing D06 consent and per-record ACL checks. Anonymous/public access is denied until a separate D08 `APPROVED_WITHIN_SCOPE` decision and release manifest exist. A reviewer link or storage URL is not an authorization mechanism.
9. **Honor withdrawal and revocation.** A withdrawn source or revoked consent blocks new previews and public projection. Existing derivative preview, export, search, and cache invalidation behavior must be specified and verified before release; this proposal does not claim those integrations exist.
10. **Fail closed.** Unclear scope, uncertain identification risk, missing rights or consent, unavailable reviewer, unavailable authority, or technical failure means no preview or release. Return a stable non-sensitive reason; do not return witness text, a snippet, an attachment, a locator, or identity-bearing metadata in the refusal.

## Candidate reviewer checklist

- Exact source revision and derivative digest are bound to the request and review record.
- Requester, purpose, audience, and consent scope are explicit and authorized.
- Rights and consent cover the exact proposed audience and use; withdrawal is checked.
- Direct identifiers, indirect identifiers, combinations of details, and third-party private information were assessed.
- Minor/vulnerable-person indicators and any required guardian permission were handled under the ratified rule.
- Meaning, provenance, and testimony/evidence/fiction labels remain accurate after redaction.
- No original bytes, attachment, key, storage locator, or unnecessary identity metadata enters the preview or ordinary logs.
- Preview access is denied to anonymous and out-of-scope principals; the review URL does not bypass D06 ACLs.
- Reviewer is independent under an explicitly approved role/standard and reviews this exact derivative revision.
- Decision, scope, reason, reviewer identity reference, and version are recorded in the authoritative D08 record without copying testimony into the audit record.
- Public release remains denied without an exact-version D08 release record and manifest.
- Withdrawal, revocation, deletion/retention, search/export, and cache invalidation behavior is defined and verified.
- Any uncertainty or unresolved mismatch results in rejection or return for further redaction.

## Decisions still required

Before this proposal can become policy, the owner and an independent privacy reviewer must identify the approving roles and ratify: the consent evidence authority; audience/scope vocabulary; standard for assessing re-identification risk; treatment of uncertain age and vulnerable subjects; permitted redaction transformations and meaning-preservation checks; safe audit metadata; preview retention and deletion; revocation/cache invalidation behavior; and the D08 authority/release record needed for publication.

The repository currently records no D08 public projection/release model (M34-04). This document does not fill that authority gap. M16-05 remains open until the proposal is ratified, an independent review is recorded, and the private-preview positive/negative access behavior is implemented and verified. Public release remains separately blocked on D08.

## Contract sources

- [M16-05 task packet](../tasks/M16/M16-05.md)
- [ADR-0003 — Source Rights, Consent, and Publishing Storage](../decisions/ADR-0003-source-rights-and-consent.md)
- [M03-06 — Witness Withdrawal Policy](../decisions/M03-06-witness-withdrawal-policy.md)
- [M16-01 — Private Witness Object Specification](../decisions/M16-01-private-witness-object-spec.md)
- [M34-04 — D08 projection specification](../planning/M34-04-d08-projection-spec.md)
- [ECHOLOG architecture (D19)](../architecture/ECHOLOG.md)
