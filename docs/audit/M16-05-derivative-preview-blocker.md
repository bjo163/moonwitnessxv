# M16-05 — Redacted derivative preview readiness blocker

**Status:** OPEN / BLOCKED pending a verifiable reference to the owner-approved redaction rules and independent privacy review. No preview implementation or public output is claimed.

**Baseline:** `dev` at `9fa9b373fcbed977cc033c376476435692ee4692`.
**Latest observed `origin/main`:** `32060943102120428bff26849601c2c760f851ca`.
**Prerequisite:** M16-04 is checked at implementation SHA `ef415f3518637a3d3a65103b3973bd7019a9ba90`.

## Owner clarification — 2026-10-28

The owner reports that approved redaction rules and a reviewer exist. The response did not include the policy document path or reviewer role, so the contents, approval scope, independence, and review evidence cannot yet be verified. A read-only search of repository Markdown and the M16 decision/audit/task folders found no identified general redaction procedure or M16-05 review record; the existing M03-06 minor-protection rule is not a complete redaction method for arbitrary testimony. No witness content, consent document, or private evidence was accessed. M16-05 remains open pending the exact policy reference and reviewer role/evidence.

## Evidence and boundary

- The M16-05 packet requires a redacted derivative preview for an explicit human publishing request and says to stop when a required source, rights basis, or reviewer is missing.
- Ratified [M03-06](../decisions/M03-06-witness-withdrawal-policy.md) requires explicit consent scoped to publication and forbids identifiable publication of minors. It does not define a general redaction algorithm or a reviewer checklist for arbitrary testimony.
- [M16-01](../decisions/M16-01-private-witness-object-spec.md) states that originals remain private and only an explicitly requested redacted derivative approved through D08 can become public.
- [ADR-0003](../decisions/ADR-0003-source-rights-and-consent.md) defines the publication lifecycle as `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`; it does not authorize a preview to bypass review.
- [M34-04](../planning/M34-04-d08-projection-spec.md) explicitly records that D08 has no public projection model, release record, rights approval, editorial sign-off, or takedown ledger. This is an authority gap, not a missing UI component.
- M16-04 verification used synthetic fixtures and states that its `evidenceRef` is an administrator-recorded pointer, not proof that consent or rights were independently verified. No real witness content or privacy approval is evidenced by the current repository state.
- The current source search found no integrated witness derivative preview pipeline in Headquarters or the witness package. An untracked `packages/moonql-witness/src/media-access.ts` prototype is outside the M16-04 integrated implementation and provides no M16-05 evidence.

## Why this task remains open

A synthetic private mock could test rendering mechanics, but it cannot prove a valid human publishing request, source-specific consent, effective redaction, or privacy review. Inventing redaction rules or showing a simulated request as approved would conflict with the ratified consent and D08 boundaries. Public output is separately blocked until D08 authority exists.

## Required inputs to resume

1. The path to the owner-approved rules for producing and checking a redacted derivative, including how publication scope in consent constrains the preview.
2. The independent privacy reviewer's role and where review evidence for the preview workflow is recorded; do not place witness content or private evidence in Git.
3. For any public rendering, an accepted D08 release authority and projection. A private preview must remain behind the existing D06 consent and per-record ACL checks.

## Commands and limits

- Read-only checks: inspected M16-05/M16-04 packets, ADR-0003, M03-06, M16-01, M34-04 spec, current TODO, and searched witness/HQ source for derivative/redaction handling.
- No tests or builds were run because no implementation was changed.
- No source text, consent document, attachment, or private witness material was accessed or copied.
