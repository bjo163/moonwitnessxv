# M21-02 — AI candidate and tool-call evidence contract

**Status:** Versioned design contract; no runtime implementation or persistence is implied. Schema version `1.0.0`. The test-only Zod definition in `test/planning/m21-02-ai-candidate-evidence.test.mjs` is authoritative; the published JSON Schema is generated from it.

## Purpose and ownership

This contract records evidence references for an AI suggestion: the model/gateway request, prompt template version and digest, source provenance, consent snapshot, output digest, and any associated proposed/executed tool-call references. It is not a candidate truth record, rights decision, authorization, human approval, or publication instruction.

AI candidates remain `AI_SUGGESTION` proposals. Under the M20-02 design, D12 owns queue/work-item lifecycle and D08 owns rights, consent and publication decisions; D00/ARSY owns identity. Headquarters is a review surface, not an authority. This evidence record creates no D12 work item and grants no action. A human decision must be made through the separately authorized D12/D08 flow; a consent state of `GRANTED` does not mean candidate approval or publication clearance.

The existing AI Gateway remains the model/provider authority. LUMEN owns orchestration only; ARSY remains canonical run/state owner. This contract creates no runtime persistence, endpoint, database table, model catalog, consent store, source registry, or new data owner.

## Fields and evidence rules

The schema requires:

- `model`: provider and model identifier plus an opaque gateway request reference; optional model revision only when supplied by the gateway.
- `prompt`: opaque template reference, version and SHA-256 digest. No prompt text or rendered prompt bytes.
- `provenance`: one or more externally owned source references, optional edition reference when the source has editions, source-content SHA-256 digest, and authorization/rights snapshot reference. No source bytes or replacement source registry.
- `consent`: externally owned, subject-bound decision reference, scope reference, observation timestamp, and explicit `GRANTED`, `DENIED`, `WITHDRAWN` or `UNKNOWN` state. The reference resolves to the external decision record that binds the decision to its subject; this candidate schema intentionally does not duplicate identity or subject data. Absence of consent evidence is invalid; non-granted states are representable for audit and must not be treated as permission.
- `output`: opaque output reference and SHA-256 digest. No full model response text.
- `toolCalls`: references to LUMEN `runId`, canonical `stepId` (`step_<index>_<runId>` per LUMEN contracts), and event ID; tool ID/version and SHA-256 argument digest. No raw tool arguments. Optional approval reference merely points to an independently governed decision and is not proof by itself.

LUMEN currently defines provider tool-call response IDs and event IDs as strings, but does not establish a durable tool-call identifier contract. Therefore this schema does not promote provider tool-call IDs as canonical; it uses the verified run/step/event identifiers and an opaque tool ID/version reference. The AI Gateway's observed response model/provider fields likewise do not establish prompt-template, provenance, or consent data ownership; producers must provide references from their respective owners before emitting this evidence.

## Privacy and security limits

All references are opaque identifiers, not credentials or access grants. Hashes support integrity comparison and do not anonymize low-entropy content. Do not include secrets, prompt/source/tool bytes, private witness content, or unredacted model output. Access control, retention, revocation behavior, source authorization, consent validity, and reviewer eligibility remain with their existing owners and are not validated by this schema. Conformance proves structural shape only, not the truth of referenced records or runtime enforcement.

## Versioning and verification

Version `1.0.0` is immutable. Incompatible changes require a new schema version and explicit consumer migration; consumers must reject unsupported versions. Zod v4 in the existing root development toolchain validates positive and negative fixtures, and generates the published JSON Schema for exact structural comparison. Focused check: `node --test test/planning/m21-02-ai-candidate-evidence.test.mjs`.
