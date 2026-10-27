# M34-03 — Source-linked case and hypothesis draft specification

**Status:** design contract only; no route, schema, review action, rights clearance, or publication behavior is implemented by this document. `TODO.md` remains the sole task-status register.

## Boundary and ownership

- MOONLAB is a private research desk inside Headquarters (`apps/headquarters`); D05 case and hypothesis data stays owned by the existing `@moonwitness/moonql-research` addon in the single ARSY/MoonQL Hub.
- Suggested Headquarters route namespace: `/research`, `/research/cases/new`, `/research/cases/[caseCode]`, `/research/hypotheses/new`, and `/research/hypotheses/[hypothesisCode]`. These are proposed UI route names, not routes that exist today.
- Headquarters must use its server-side ARSY SDK and derive access from the Hub session and `_schema` ACL. Do not call the database directly or treat a hidden link, cookie presence, or generic model CRUD as authorization.
- The server must derive the proposing human from the authenticated Hub actor (`auth_users`) and bind that identity as `proposedBy`; never trust a client-supplied proposer name. M14-01 requires a named actor, and M34-02 D7 retains the existing four-eyes rule without creating a new role.
- M34-02 clause D5 requires explicit intent APIs for governed writes. The existing `POST /research/hypotheses/register` is an explicit registration action. The current case model has no dedicated registration action; a private case-draft write must remain unavailable until a separately reviewed intent endpoint exists. Do not use generic `research_cases` create/update to work around that gap.
- Public Dock output is outside this contract. Only the separately specified, human-approved D08 released projection in M34-04 may make Research content public.

## Draft meaning and lifecycle

“Draft” describes an unpublished authoring record in the private HQ workflow; it does not add a `DRAFT` value to either model.

- A case draft uses the existing case shape: unique `caseCode`, title, exact `citationKey`, `passageRef`, `editionRef`, optional `translationRef`, `sourceSense`, `evidenceSha`, `rightsSnapshot`, lens, and the existing `researchStatus=OPEN` while work continues. `CLOSED` and `WITHDRAWN` retain their established meanings.
- A hypothesis draft is an explicit `POST /research/hypotheses/register` candidate with a unique code, `caseCode`, optional same-case frame, mode, a question (not an asserted finding), citation, evidence span, exact case digest, and lens. The server derives `proposedBy` from the authenticated Hub actor, never from a request field. The service initializes `status=CANDIDATE`, `selfValidated=false`, `inheritedScore=null`, and `verified=false`.
- Keep the authoring question separate from source observation, inference, counter-reading, and review decision. A hypothesis does not inherit a case score or become source evidence by being saved.
- Bind every case and hypothesis to a stable passage and edition. A hypothesis must use the case’s exact `evidenceSha`; when a frame is supplied it must resolve to the same case. The citation must identify the same passage. For a future HQ workflow, a source-identity edit creates a new version/record or requires re-registration; it must not silently retarget an existing draft. The current hypothesis handler compares the digest and frame ownership, but does not explicitly compare a supplied citation with the case citation; implement and negatively test that check before exposing the UI.

## Provenance and rights rules

- Store source/edition/passage identifiers, citation key, provenance digest, rights snapshot, and only the minimum permitted evidence span. Do not copy source bytes or unapproved copyrighted text into the draft, UI, fixtures, audit, or Git.
- `RIGHTS_UNKNOWN`, `METADATA_ONLY`, and `RESTRICTED` may be retained as private metadata for investigation, but they cannot support a source-text claim or public output. A changed rights record or digest invalidates dependent support until revalidated.
- `RIGHTS_EXACT_VERSION_CLEARED` is a point-in-time declaration, not a self-granted status. It requires an exact 64-hex digest matching the edition provenance record. This specification does not select/clear a real source or translation.
- Distinguish `ORIGINAL_ARABIC` from `LICENSED_TRANSLATION`; never present a translation as source text. Research actors, interpretations, and conclusions remain attributed, bounded and contestable.
- Personal witness material requires its own consent/withdrawal controls and is not authorized by a D05 research draft.

## Positive and negative acceptance scenarios

Use synthetic rows and inert identifiers only; do not embed passage text or assert rights for a real edition. `sha256:` values below are placeholders and must be replaced by fixture digests in an executable test.

| Scenario | Input condition | Expected result |
|---|---|---|
| Positive case binding (spec/shape fixture only) | Synthetic edition, passage and case agree on citation, declared source sense and exact fixture digest; rights state is explicitly cleared in that synthetic fixture | Contract shape can describe an `OPEN` private case; this is not an available create operation or passing runtime case write. Generic CRUD remains denied, and no public projection is produced |
| Positive hypothesis binding | Candidate names an existing case, same-case optional frame, same citation and exact case digest; authenticated Hub actor supplies the proposer identity server-side | Registration yields a `CANDIDATE` with `proposedBy` bound to the authenticated actor, false self-validation/verification flags, and no inherited score |
| Negative missing source | Missing passage/edition reference, citation or digest | Reject registration or keep the draft unresolved; never report source support |
| Negative mismatch | Passage/citation differs, frame belongs to another case, or hypothesis digest differs from case/edition | Reject with a bounded validation error; create no supported claim |
| Negative rights | Rights are unknown, metadata-only, restricted, or a cleared status has no matching exact digest | Retain only allowed private metadata; block source support and every public rendering |
| Negative self-validation | Proposer attempts to validate their own hypothesis | Reject; preserve candidate status and record no validation transition |
| Negative spoofed proposer | Request body names a different `proposedBy` than the authenticated Hub actor, or tries to choose another actor | Ignore/reject the forged field and bind only the authenticated actor; do not create a draft under a spoofed identity |
| Negative generic write | HQ attempts to use generic `research_cases` or `research_hypotheses` model CRUD for governed creation/update | Deny or do not expose the control; use only reviewed intent endpoints |
| Negative public read | Anonymous Dock requests a candidate or raw D05 row | No candidate/raw row is rendered. M34-04 must supply an approved projection before any public research output exists |

These scenarios define the contract to test in the follow-up implementation. Existing API tests cover parts of hypothesis source binding and self-validation; they do not prove an HQ draft UI, a dedicated case registration endpoint, or a D08 projection.

## Non-goals

This specification adds no app, SQL owner, schema field, role, API route, publication state machine, human review, source bytes, rights decision, model-derived score, or deployment. It does not close M34-04, M34-05, or M19-19.
