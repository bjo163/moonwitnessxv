# M34-04 — D08 released-research projection boundary
**Status:** Containment contract specified; no public D08 projection is approved or implemented.
**Baseline:** `2a5805c178d3671ad875d05c7d35cecccb929ae1` (`dev`). The anonymous-to-admin contract change is a SemVer breaking change: API major `2.0.0` is required and generated clients/snapshot/history were updated.
**Authority:** [M34-02 §6–8, §11](../decisions/M34-02-moonlab-hq-desk-decision.md), ADR-0003, and the M34-04 task packet.
## Purpose and safe contract
M34-04 records the boundary a future D08 released-research projection must satisfy and closes the current anonymous Research reads at the owning ARSY/MoonQL API. This does not create a released projection. Until D08 supplies an accepted release authority and the unresolved rights and review decisions are resolved, every Research response containing D05 rows, derived metrics, traces, or comparative research remains private.
The only current positive access case in this contract is an authenticated `admin` caller. This uses the roles the existing auth model actually supports; it does not assert that `admin` is a D08 reviewer, grant publication authority, or replace a future four-eyes workflow. Unresolved content remains admin-only raw Research. Anonymous requests must be denied before any Research payload bytes are returned.
## E1–E10 containment and projection boundary
| Exposure | Current contract after M34-04 | Later public behavior |
|---|---|---|
| E1 — `GET /research/hypotheses` | `ADMIN_ONLY`; anonymous reads denied, authenticated admin may inspect private candidate hypotheses. | No candidate list becomes public by this change. A later released projection must exclude unapproved questions unless its accepted D08 contract explicitly allows a bounded derivative. |
| E2 — `GET /research/case` | `ADMIN_ONLY`; anonymous reads denied, including cases with unresolved rights. | Per-case content, rights snapshots, claims, witnesses, and derived text require a future D08 release decision and rights basis. |
| E3 — `GET /research/trace` | `ADMIN_ONLY`; anonymous reads denied. | Trace evidence, spans, conclusions, and citations are private reviewer material until a bounded derivative is explicitly released. |
| E4 — `GET /research/overview`, `/research/metrics` | Both `ADMIN_ONLY`; anonymous reads denied. | Metadata-only overview or metrics may be considered later only under an accepted field whitelist and release decision. No present allowlist is inferred. |
| E5 — raw REST `research_cases`, `research_frames`, `research_claims`, `research_relations`, `research_witnesses`, `research_quality_runs`, `research_hypotheses` | Read/list/get and writes are admin-only (`ADMIN_FULL`); raw REST stays available solely for existing private admin workflows. Anonymous bodies contain no Research row bytes. | Raw model rows are never the public projection contract. Generic admin CRUD does not become a MOONLAB review workflow. |
| E6 — `/research/comparative-case` and `/research/comparative-case/jerusalem-70ce` | `ADMIN_ONLY`; anonymous reads denied pending the unresolved M15 re-ratification. | No public use until NA-3 is resolved through the appropriate accepted decision/sign-off or the surface is retired into a separately approved projection. |
| E7 — Dock `/reader/compare` | Remains fail-closed with its withholding notice; no Dock behavior changed. | No rendering until a D08-approved released projection is available. |
| E8 — Dock `ResearchExplorer` | Remains unwired. | Any future binding accepts only the released-projection type, never raw Research row arrays. |
| E9 — Dock `/research` | Remains fail-closed with its withholding notice; no Dock behavior changed. | No rendering until a D08-approved released projection is available. |
| E10 — Hub `/_schema` | Unchanged; it remains authenticated. | Route-shape visibility is not content publication. |
## Unresolved decisions are gates, not inferred policy
- **NA-1:** D08 still needs an authoritative release record and an owner-approved lifecycle covering scope, approver, rights snapshot, withdrawal/retraction, and takedown. This document does not define its authority or state machine.
- **NA-3:** the Jerusalem comparative view's self-declared `REVIEWED_DISTINCT_DOMAINS` state is not a ratified D08 sign-off. This change contains the endpoint; it does not ratify the fixture.
- **NA-4:** the rights attribution conflict for `QS_2_82_id_kemenag` remains unresolved. Neither source's label is treated as D08 clearance.
- D08 does not yet provide a public projection model, release record, rights approval, editorial sign-off, or takedown ledger. No approved public D05 output is claimed.
## Acceptance evidence expected
1. Positive: an authenticated admin can still read each private endpoint/model needed by the existing Research tests; private workflow behavior remains available.
2. Negative: anonymous requests to E1–E6 and the E5 raw list/get surfaces return denial, not rows or narrative bytes. Byte-level controls cover the licensed translation phrase and synthetic rights-unknown markers.
3. Boundary: E7/E9 remain withholding-only, E8 has no importer, and E10 is unchanged. No Dock UI, public projection, role, schema, database owner, or D08 authority is added.
4. Rollback: revert the M34-04 source/test/spec/audit, API major, and generated contract artifacts as one reviewed unit. A rollback that reopens anonymous access is unsafe; restore only alongside an accepted D08 projection or an owner-approved rights exception, with denial tests deliberately replaced. Coordinate API 2.0 consumers before any rollback.
This is an API containment and projection-boundary specification, not a rights clearance, human review, publication decision, or production deployment record.
