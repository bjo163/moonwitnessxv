# M13-01 — SRGBL v8 P19 Gates and the Engineering / Human Review Boundary

- **Milestone**: M13 SRGBL v8, Key Witness and SWING
- **Task**: M13-01
- **Status**: ACCEPTED — engineering contract, not a human review
- **Depends on**: M07-07 (rights-gated corpus ingestion), M02-07 (D05 method adoption), M12-05 (evidence graph discipline)
- **Evidence of record**: `docs/decisions/M02-07-historical-decisions-matrix.md`, `docs/audit/M07-01-editions-licenses-inventory.md`, `docs/audit/M12-typed-correlation-graph.md`
- **Implementation**: `packages/moonql-research/src/{seed,gates,projection,index}.ts`

---

## 1. Decision

MoonWitness XV adopts the SRGBL v8 five-stage contract as the D05 research method and
implements the executable P19 detail at exact pinned digests. The method is a **bounded
engineering contract**: it can mark a source gate UNKNOWN, reject speculation presented as
source, and keep four independent scores apart. It cannot certify a human review, clear
rights, ratify a key scheme, or issue a theological verdict.

> A green suite, a checksum, or a commit is not a human reviewer attestation. The P19 release
> decision stays **BLOCKED** until a named human completes the open gates below.

## 2. Pinned evidence

| Material | Reference | SHA-256 | Status |
|---|---|---|---|
| P19 executable specs | `moonwitness-corpus@e2f5b93fe172b61a78f0c8650f356e87600387ae:docs/MOONWITNESS-P19-EXECUTABLE-SPECS.md` | `c87c2a498dbe5340fe5a4ef3680f9c55d858beb89362f88d28832f314fa8c456` | `READ_AT_EXACT_SHA` |
| P19 issue register | `moonwitness-corpus@e2f5b93f:docs/P19-REGISTER-RECONCILIATION.md` | `dfdc679fe3a08c16ae7004e40a092611a4c3daccb8e196d5cab772b4c1c93656` | `READ_AT_EXACT_SHA` |
| SRGBL v8 implementation status | `moonwitness-corpus@e2f5b93f:docs/SRGBL-V8-IMPLEMENTATION-STATUS.md` | `e136fc9d402cf3dfc5089925cf8091207e5f487d2bcf263b93fdc1d71fa10835` | `READ_AT_EXACT_SHA` |
| Source/edition matrix | `moonwitness-corpus@e2f5b93f:docs/SRGBL-V8-SOURCE-EDITION-MATRIX.md` | `f1881959b36bdb9bda9f0f741676a9e1c76120d31708f89d12113708203b498b` | `AUDIT_ONLY_NO_CLEARANCE` |
| D05 adoption decision | `moonwitnessxv@d539cee:docs/decisions/M02-07-historical-decisions-matrix.md` | `2cc26c18d5c8e8214a7f55de3386b3c55d361ebaaba7d926ed6aaf799fccd6c4` | `ADOPT_SRGBL_AS_D05_METHOD` |
| Vision contract | `moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06` | `7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb` | `FROZEN_CONTRACT` |
| Legacy XIV SRGBL doc | `moonwitness-xiv@99e1a4f028b37dc1:research/frameworks/srgbl.md` | — (unavailable) | `UNAVAILABLE_AT_PIN` |

The XIV document is recorded as an **unresolved gate**, not silently replaced by another
document: the raw URL returned 404, the commit API returned 422 for the short SHA, and the path
is absent from the public main tree. The stage contract itself is taken from the P19 specs and
frozen against the vision pin, so M13 can implement the gates without pretending the XIV
document was read.

## 3. Stage contract (S1–L5)

Each stage answers one question and declares what it cannot prove. A later stage is only
evaluated when its upstream stage passes; otherwise it inherits `UNKNOWN`.

| Stage | Question | Cannot prove |
|---|---|---|
| **S1** Source & Sense | Is the source, edition, rights and provenance traceable? | Cannot prove the source is infallible or licensed for every use |
| **R2** Reality | What does this specific text express? | Cannot prove that every external or supernatural event occurred |
| **G3** Governing Order | Which relations, conditions or rules follow from the evidence? | Cannot turn a coincidental pattern into a universal law |
| **B4** Being | Who is the actor, recipient, role and context? | Cannot establish ontological identity from a nickname or role |
| **L5** Light | What bounded, derived reading is reviewable? | Cannot issue divine instruction, absolute truth or a salvation verdict |

Stage results are strictly `PASS` / `UNKNOWN` / `FAIL`. Missing evidence is `UNKNOWN`, never a
pass by default. A `FAIL` is a detected contradiction (wrong digest, blocked rights, inference
promoted to source), not a low score.

## 4. Gate rules

### S1 — Source & Sense

- The case must resolve a corpus edition and passage; an unresolved edition or passage is
  `UNKNOWN` with an explicit reason code.
- The passage must belong to the declared edition and carry the same citation key as the case.
- Edition rights must equal `RIGHTS_EXACT_VERSION_CLEARED`; `RIGHTS_UNKNOWN`/`METADATA_ONLY`
  stay `UNKNOWN`, `RESTRICTED` fails. The case rights snapshot must agree with the edition.
- The case must declare a 64-hex `evidenceSha` equal to the edition `provenanceSha`; a missing
  or mismatched digest blocks the source gate.
- `ORIGINAL_ARABIC` requires original passage bytes. `LICENSED_TRANSLATION` requires a resolved
  translation for the same passage with cleared rights and available bytes. An undeclared
  source sense stays `UNKNOWN`.
- Raw text is never exposed by the research projections; `rawTextExposed` is always `false`.

### R2 — Reality

- Only an `OBSERVED_TEXT` claim may be `SUPPORTED`; an inference is never a text claim.
- A supported claim needs a non-empty evidence span and the case's exact SHA plus citation key.
- `TRANSLATION` representation is only valid inside a resolved translation sense; `SOURCE_TEXT`
  is only valid for `ORIGINAL_ARABIC`. A mismatch fails the stage.

### G3 — Governing Order

- Relations must reference existing claims from the same case; dangling or cross-case links fail.
- `CORRECTS_WITHIN_FRAME` may not be labelled `COMPARATIVE_NEUTRAL` and must preserve a
  counter-reading.
- A `SPECULATIVE` relation can never carry `presentedAsSource`; speculation presented as source
  fails the stage.
- A `DEFENSIBLE` relation needs an evidence span and the case's exact SHA, and both endpoints
  must be observed text — an inference cannot become a defensible text relation.

### B4 — Being

- Frames require agent, recipient, domain, scope, genre and lens. Blank required fields are
  rejected at write time and fail the stage.
- `ACTOR_REGISTRY` requires a resolved actor reference; `UNSPECIFIED` requires an explicit
  written reason. No identity is derived from a nickname, role, or shared label.
- The declared lens is stored and displayed with the frame; a frame cannot silently switch
  lenses to win an argument.

### L5 — Light

- A Key Witness conclusion is one `BOUNDED_DERIVED_READING` with explicit `limits`,
  `boundaryNote`, `contextNote`, citation key, evidence reference and exact SHA.
- Conclusions are never labelled as divine judgment, salvation verdict, or canonical truth.
- Every witness is `ENGINEERING_ONLY` and `humanReviewed: false`; M13 has no path to record a
  human review (that belongs to M14).
- The trace projection is derived from stored records at the cited digest; a checksum is not a
  signature.

## 5. Independent measurements

| Measure | Scale | Rule |
|---|---|---|
| Maturity | 0–15 | Contiguous `PASS` prefix only; triangular `n(n+1)/2`; a gap stops accumulation |
| Quality | 0–40 | Ten dimensions × 0–4, available only on a complete, caller-labelled bundle |
| Witness support | 0–100 | 25/25/20/15/15 components; ≥70 is `eligible-for-review` only, never approval |
| Direction | −2…+2 | Intensity × weight × confidence; zero positive weight is `UNKNOWN`, not neutral |

These values never merge. There is no combined score, no ranking, and no theological ordering.
`combined: null`, `ranking: false`, `merged: false`, `automaticCanonicalApproval: false` are part
of the API contract. A candidate witness score is support, not a religion score.

## 6. Hypotheses

- **SWING** uses exactly seven operators (`direction`, `polarity`, `subject-object`,
  `cause-effect`, `perspective`, `temporal`, `semantic-opposition`) to a maximum depth of three.
  Every hop is a `CANDIDATE` with `evidenceStatus: 'UNVERIFIED'` and `inheritedScore: null`;
  duplicate signatures stop the chain before a cycle guard. Reversal never inherits truth.
- **Positive Correction** requires a declared non-neutral lens and preserved counter-readings.
- **OFFSIDE** names a frame mismatch and proposes a frame for human examination; it never edits
  the stored frame, and `verified` is always `false`.
- A hypothesis must cite an exact SHA and cannot self-validate. `CORROBORATED` requires a
  different validator and an independent source reference; `REJECTED` requires a verification
  note. The generator never verifies its own candidate.

## 7. Open gates (recorded, not resolved)

| ID | Finding | Status |
|---|---|---|
| `P19-REG-L18-L19` | L19 has no commit of its own; the p19-l18 tag implements its declared outcome | `OPEN_FOR_HUMAN` |
| `P19-REG-L13` | L13 commit subject describes a different outcome than the declared rejection | `OPEN_FOR_HUMAN` |
| `P19-REG-L25` | The source/edition matrix is an audit, not a rights clearance; no interpretation edition is selected and `reviewedBy` stays null | `RIGHTS_GATE_OPEN` |
| `P19-REG-CI` | No per-micro CI run exists; green wave runs prove tree state, not a reviewed acceptance | `OPEN_FOR_HUMAN` |

These findings are exposed in `GET /research/overview` rather than hidden, and the P19 release
decision remains `BLOCKED`.

## 8. What this does not mean

- An engineering `PASS` is not a human sign-off, a rights clearance, or a publication approval.
- The key scheme `semantic-core:v0` is `CANDIDATE_NOT_RATIFIED`; key tokens support retrieval and
  are not a canon.
- No witness score, maturity level, or hypothesis status grants religious authority, ranks
  persons, or settles a doctrinal dispute.
- M13 exposes read-only projections plus admin-only registration endpoints; it does not open a
  reviewer workflow (M14) or a publication path (M18).
