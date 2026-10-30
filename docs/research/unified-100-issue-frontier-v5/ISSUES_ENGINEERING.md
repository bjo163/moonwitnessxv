# Domain A — Engineering Excellence (32)

Subdomain allocation: Reliability 7; Security & Privacy 5; Architecture & Contracts 5; Performance 4; UI/UX & Accessibility 3; Testing & CI 4; Operations 3; Documentation/DX 1. All are PROPOSED additions, not implemented work. In every body, VERIFIED applies only to the cited artifact or observed discrepancy; behavior not examined remains UNKNOWN; recommendations are PROPOSED or EXPERIMENTAL. No defect is claimed unless evidence explicitly says verified. Scores are planning judgments; see ROADMAP_QA.md.

Identity convention: the heading supplies ID/title; this file supplies the primary domain; the first identity phrases give subdomain/type. Identity lines include priority, difficulty, effort, confidence, risk, domain/common score, owner and proposed V5 wave. Trailing tags are suggested labels. The suggested wave is not a TODO milestone. Implementation maturity for all entries is PROPOSED.

## ENG-001 — Reconcile repository task and milestone counts

1. **Identity:** Reliability; documentation correction; P1 / Easy / S / confidence High / risk Low; domain 82, common 80; owner: repository docs; V5-W0; labels docs, planning, evidence.
2. **Executive:** Reconcile published task totals with TODO’s authoritative register and correct stale aggregate claims.
3. **Current state:** README reports 43 milestones/362 IDs, GRANULARITY_AUDIT 311, TODO 46/393.
4. **Problem:** Readers cannot tell which count is current, although TODO owns status.
5. **Evidence:** VERIFIED R01, R02, R14; values must be re-read at execution.
6. **Value:** Reduces planning errors and prevents stale totals entering governance decisions.
7. **Solution:** Calculate totals from TODO once; update only stale explanatory references and state date/source.
8. **Architecture:** Docs-only; no new task database or status owner.
9. **Microtasks:** Parse TODO; compare cited totals; correct references; link TODO as authority.
10. **Acceptance:** All active aggregate statements match TODO or are labeled historical with date and scope.
11. **DoD:** Diff reviewed; no checkbox or task text changed; links resolve.
12. **Tests:** Static document search and arithmetic check; no application test needed.
13. **Dependencies:** Blocked by —; enables ENG-002; related ENG-003.
14. **Risks:** Parsing can miss non-table IDs; hand-check the authoritative count.
15. **Metrics:** Zero unexplained count conflicts across the named documents.
16. **Estimate:** 0.5–1 day; no infrastructure cost.
17. **Rollback:** Revert documentation-only change.
18. **Synergy:** Supports planning in every domain without changing domain models.
19. **Anti-overlap:** Docs owner; distinct from task execution/status systems; excludes adding milestones or changing TODO status.
20. **Outcome:** One dated and traceable aggregate statement.
21. **Future:** Generate counts from a parser only if ENG-002 is accepted.
22. **Closure evidence:** Before/after references and independent count reconciliation.

## ENG-002 — Add a read-only task-register consistency check

1. **Identity:** Reliability; planning automation; P2 / Medium / M / confidence Medium / risk Low; domain 74, common 70; owner: scripts/planning; V5-W1; tooling, docs.
2. **Executive:** Add a read-only check that flags stale aggregate counts and malformed task IDs without owning task status.
3. **Current state:** TODO is authoritative; aggregate docs conflict; a task-lease checker already exists.
4. **Problem:** Manual count edits can reintroduce the same drift.
5. **Evidence:** VERIFIED R02/R14; scripts/planning/task-lease-contract-check.mjs is present (R17).
6. **Value:** Makes a narrow integrity rule repeatable without inventing a dispatcher.
7. **Solution:** Parse documented TODO syntax and compare derived totals with an explicit allowlist of active references.
8. **Architecture:** Small script under scripts/planning; no writes, network access, or status mutation.
9. **Microtasks:** Document syntax; define false-positive cases; implement parser; add fixtures; wire only after owner review.
10. **Acceptance:** Correct fixture counts; duplicate IDs fail; files are never rewritten.
11. **DoD:** Parser fixtures and usage docs reviewed; no task lease/status file added.
12. **Tests:** Unit fixtures for tables, duplicate IDs and historical sections.
13. **Dependencies:** Blocked by ENG-001; enables planning checks; related ENG-032.
14. **Risks:** Parser may misread archived sections; scope to current register.
15. **Metrics:** Exact fixture precision/recall on documented syntax.
16. **Estimate:** 2–4 days; no runtime cost.
17. **Rollback:** Remove script/invocation; source documents remain valid.
18. **Synergy:** Improves governance across all five domains.
19. **Anti-overlap:** Not a dispatcher, lease, TODO replacement, or CI approval system.
20. **Outcome:** Deterministic, read-only consistency signal.
21. **Future:** Extend to further docs only after fixtures exist.
22. **Closure evidence:** Fixture output, no-write assertion, and reviewed command wiring.

## ENG-003 — Align M38–M40 maturity statements to evidence

1. **Identity:** Reliability; service maturity reconciliation; P1 / Medium / M / confidence High / risk Medium; domain 84, common 80; owner: architecture docs; V5-W0; architecture, evidence.
2. **Executive:** Publish one evidence-linked maturity description for SKYLINK, ECHOLOG and ORBIT.
3. **Current state:** TODO, README, APPS and service docs use different completion language.
4. **Problem:** “Complete”, “implemented” and “deployed” are not reliably distinguishable.
5. **Evidence:** VERIFIED R02, R05–R07 and root guidance; no runtime probe in this pass.
6. **Value:** Prevents a planning checkbox being mistaken for operational readiness.
7. **Solution:** Table code, test, contract, deployment and operator evidence by capability, tied to exact SHA/date.
8. **Architecture:** Documentation only; TODO remains status authority and RELEASE governs deployment claims.
9. **Microtasks:** Re-read rows; collect repo evidence; request owner evidence; correct prose; list unresolved items.
10. **Acceptance:** No deployed claim without exact deployment evidence; root service boundaries remain intact.
11. **DoD:** Service and TODO owners review every corrected statement.
12. **Tests:** Link check and manual evidence audit; service suites are outside scope.
13. **Dependencies:** —; enables ENG-004; related FUT-022.
14. **Risks:** Evidence can change; include an as-of date and immutable source ref.
15. **Metrics:** Every maturity row has a source and evidence class.
16. **Estimate:** 3–6 days including review.
17. **Rollback:** Revert docs while retaining cited evidence records.
18. **Synergy:** Clarifies infrastructure assumptions for every domain.
19. **Anti-overlap:** Does not close M38–M40 or authorize SKYLINK/ECHOLOG expansion.
20. **Outcome:** Auditable status with UNKNOWN preserved where needed.
21. **Future:** Refresh at release boundaries.
22. **Closure evidence:** Reviewed capability table and immutable links.

## ENG-004 — Verify LUMEN runtime maturity claims

1. **Identity:** Reliability; runtime readiness audit; P2 / Medium / M / confidence Medium / risk Medium; domain 72, common 72; owner: LUMEN; V5-W0; runtime, audit.
2. **Executive:** Determine whether the worker scaffold’s lifecycle documentation matches executable and deployment state.
3. **Current state:** Worker source/contracts/tests exist; app registry says no dev server; production readiness is unknown.
4. **Problem:** A scaffold may be read as a live service or a viable worker may be understated.
5. **Evidence:** VERIFIED R08/R15; local tests exist but were not run here.
6. **Value:** Aligns architecture with operator expectations.
7. **Solution:** Audit entrypoint, lifecycle, transport, config, shutdown and deployment support; recommend bounded changes only afterward.
8. **Architecture:** LUMEN package/app only; no second scheduler or orchestrator.
9. **Microtasks:** Trace entrypoints; map start/stop; inspect registry; classify executable paths; write go/no-go.
10. **Acceptance:** Each claimed capability has a reproducible command or is marked scaffold/unknown.
11. **DoD:** Audit references exact files and lists untested claims.
12. **Tests:** Existing lifecycle tests may be follow-up; execution requires separate authorization.
13. **Dependencies:** ENG-003; enables FUT-022.
14. **Risks:** Local simulation may not represent deployment; label evidence classes.
15. **Metrics:** All documented lifecycle states map to code or an explicit gap.
16. **Estimate:** 3–5 days; no deployment.
17. **Rollback:** Revert only audit/documentation changes.
18. **Synergy:** Avoids redundant compute services and informs frontier prototypes.
19. **Anti-overlap:** Distinct from M41 design/scaffold record; no runtime expansion.
20. **Outcome:** Correct maturity classification and bounded next decision.
21. **Future:** Implement only a separately accepted worker capability.
22. **Closure evidence:** Source map, authorized command evidence if any, and UNKNOWN list.

## ENG-005 — Resolve source pins to immutable full references

1. **Identity:** Reliability; source-integrity maintenance; P1 / Medium / M / confidence Medium / risk High; domain 83, common 79; owner: corpus/provenance; V5-W0; sources, provenance.
2. **Executive:** Verify and normalize historical source pins to full immutable references without importing content.
3. **Current state:** M06-01 records abbreviated refs and an allah-hub path; selected connector lookups failed.
4. **Problem:** Unresolvable identifiers block reproducibility and can lead to reviewing the wrong repository state.
5. **Evidence:** VERIFIED R13 and lookup failures; rename, access and rights status UNKNOWN.
6. **Value:** Protects provenance and future review.
7. **Solution:** Record original ID, canonical URL, full commit SHA, resolution evidence and rights status; leave unresolved pins untouched.
8. **Architecture:** Extend existing pin audit; no new source catalog or content publication.
9. **Microtasks:** Retry exact refs; capture SHA; compare tree identity; record unresolved entries; require rights review before use.
10. **Acceptance:** Resolved pins have full SHA/evidence; unresolved pins say UNKNOWN; no content imported.
11. **DoD:** M06 owner reviews mapping; task does not change status checkbox.
12. **Tests:** Validate SHA and repository URL fields with fixtures.
13. **Dependencies:** —; enables ONT-001/002; related ENG-016.
14. **Risks:** Renamed/private/deleted sources and license uncertainty; infer neither absence nor permission.
15. **Metrics:** Resolved pins with evidence, not raw URLs.
16. **Estimate:** 2–6 days plus external access.
17. **Rollback:** Preserve original text and revert mapping.
18. **Synergy:** Makes research and ontology citations reproducible.
19. **Anti-overlap:** Existing pin owner; not source import or M06 reimplementation.
20. **Outcome:** Traceable pin-resolution record.
21. **Future:** Periodic pin checks only if maintainers request them.
22. **Closure evidence:** Full refs, lookup records and rights labels.

## ENG-006 — Specify and test a stable API error envelope

1. **Identity:** Reliability; API failure contract; P2 / Medium / M / confidence Low / risk Medium; domain 68, common 68; owner: ARSY API; V5-W1; api, contracts.
2. **Executive:** Check whether selected ARSY routes emit incompatible client errors; define a bounded contract only if a mismatch exists.
3. **Current state:** Fastify API and route tests exist; no inconsistency was reproduced here.
4. **Problem:** Incompatible errors can make client handling fragile; this is a hypothesis.
5. **Evidence:** VERIFIED route/test inventory R17; defect status UNKNOWN.
6. **Value:** Improves client resilience and diagnosis.
7. **Solution:** Compare representative schemas, document intentional exceptions, add shared schema only if needed.
8. **Architecture:** Reuse existing error hooks/schemas; preserve status codes and privacy-safe messages.
9. **Microtasks:** Select routes; collect schemas; compare payloads; document exceptions; implement minimal shape if justified.
10. **Acceptance:** Tests cover error status/fields; no stack or private source leaks.
11. **DoD:** API owner approves compatibility and migration.
12. **Tests:** Route schema and client compatibility fixtures.
13. **Dependencies:** —; enables ENG-007/012.
14. **Risks:** Normalization can break clients or expose internals; preserve intentional distinctions.
15. **Metrics:** Route conformance and unexpected shape changes.
16. **Estimate:** 3–7 days if gap exists; otherwise close with no-go evidence.
17. **Rollback:** Retain legacy serializer behind compatibility if changed.
18. **Synergy:** Supports all client apps without new API ownership.
19. **Anti-overlap:** Not a full API redesign or a claim of current defect.
20. **Outcome:** Verified no-change result or tested error contract.
21. **Future:** Extend after bounded review.
22. **Closure evidence:** Inventory, fixtures and owner decision.

## ENG-007 — Define readiness semantics for health endpoints

1. **Identity:** Reliability; health contract; P2 / Medium / S / confidence Low / risk Medium; domain 66, common 67; owner: service owners; V5-W1; operations, api.
2. **Executive:** Compare liveness/readiness responses and specify bounded semantics.
3. **Current state:** Health routes and diagnostics exist; no cross-service probe ran in this review.
4. **Problem:** Process-alive may be misread as dependency-ready or deployed.
5. **Evidence:** VERIFIED route/diagnostic inventory R17; runtime consistency UNKNOWN.
6. **Value:** Improves triage without claiming uptime.
7. **Solution:** Define liveness, readiness, degraded dependency and safe response fields.
8. **Architecture:** Existing per-service routes; no global aggregator or new network dependency.
9. **Microtasks:** Inventory routes; classify dependencies; propose schema; test dependency failure/timeout; document meaning.
10. **Acceptance:** Tests distinguish liveness from readiness and omit secrets/topology.
11. **DoD:** Owners approve states; probes remain bounded.
12. **Tests:** Unit route tests for ready, degraded, timeout and shutdown.
13. **Dependencies:** —; enables ENG-029; related ENG-003.
14. **Risks:** Deep probes amplify outages; keep liveness cheap.
15. **Metrics:** False-ready and false-unready cases in fixture matrix.
16. **Estimate:** 2–4 days; no recurring cost.
17. **Rollback:** Restore prior contract with compatibility tests.
18. **Synergy:** Makes service state understandable across domains.
19. **Anti-overlap:** Does not duplicate M44 deployment proof.
20. **Outcome:** Health status means a documented, tested state.
21. **Future:** Dashboard only under approved operations plan.
22. **Closure evidence:** Contract, tests and owner-approved table.

## ENG-008 — Audit log fields for privacy-safe diagnostics

1. **Identity:** Security/Privacy; data-minimizing logs; P1 / Medium / M / confidence Medium / risk High; domain 81, common 80; owner: service/security; V5-W1; privacy, logging.
2. **Executive:** Inventory representative logs for sensitive payloads and define safe structured fields.
3. **Current state:** Security/consent guidance exists; no log scan or leak was asserted here.
4. **Problem:** Debug logs may retain tokens, personal data, private testimony or source payloads.
5. **Evidence:** VERIFIED R12 and privacy contracts; actual exposure UNKNOWN.
6. **Value:** Improves incident usefulness while minimizing retained data.
7. **Solution:** Review callsites and add redaction tests for explicitly classified fields.
8. **Architecture:** Existing logger wrappers only; no private source copied into telemetry.
9. **Microtasks:** Agree sensitive fields; inspect callsites; create synthetic fixtures; add redaction tests; document retention.
10. **Acceptance:** Synthetic secrets/private strings never appear; required correlation fields remain.
11. **DoD:** Privacy/security review; no real private data used.
12. **Tests:** Unit captures for normal and error paths.
13. **Dependencies:** Reconcile M16/M18/M19; related ONT-017.
14. **Risks:** Over-redaction harms diagnosis; under-redaction exposes data; review both.
15. **Metrics:** Secret fixture leakage = 0; useful fields retained.
16. **Estimate:** 4–8 days for a bounded service set.
17. **Rollback:** Revert redactor but never restore raw secret logging.
18. **Synergy:** Helps engineering, source privacy and trust.
19. **Anti-overlap:** Distinct from consent withdrawal and public projection tasks.
20. **Outcome:** Audited safe log contract for selected services.
21. **Future:** Expand after first set is reviewed.
22. **Closure evidence:** Inventory, synthetic output and reviewer sign-off.

## ENG-009 — Enforce least-privilege AI tool manifests

1. **Identity:** Security/Privacy; AI tool authorization; P1 / Hard / L / confidence Medium / risk High; domain 84, common 80; owner: AI Gateway; V5-W1; ai, security.
2. **Executive:** Define an inspectable tool allowlist and prove denied tools cannot execute.
3. **Current state:** AI schemas/gateway paths exist; no unauthorized execution was verified.
4. **Problem:** Prompt text alone is not an authorization boundary for side effects.
5. **Evidence:** R17; NIST/OWASP S01–S02; no incident asserted.
6. **Value:** Enables safe experiments without broad agent authority.
7. **Solution:** Bind tool to caller, action, data class and explicit approval; fail closed.
8. **Architecture:** Reuse AI Gateway and existing auth; metadata only, not another orchestrator.
9. **Microtasks:** Inventory tools; classify effects; define schema; test denied/unknown/approval paths; document revocation.
10. **Acceptance:** Unknown tool and missing grant are denied before handler; approval is attributable and replay-safe.
11. **DoD:** Security review and negative tests in owning package.
12. **Tests:** Offline fake-tool tests; no production credentials.
13. **Dependencies:** —; enables FUT-001–007.
14. **Risks:** Stale grants/confused deputy; bind principal and action, log minimal evidence.
15. **Metrics:** Unauthorized fixture calls reaching handlers = 0.
16. **Estimate:** 8–15 days; no external model spend required.
17. **Rollback:** Disable new tool routes; retain explicit human workflow.
18. **Synergy:** Supports research and accessible workflows with human control.
19. **Anti-overlap:** No autonomous financial, publication, rights or moderation actions.
20. **Outcome:** Testable boundary for each registered tool.
21. **Future:** Add read-only tools after review.
22. **Closure evidence:** Manifest, denial results and approval fixtures.

## ENG-010 — Inventory browser security headers and CSP safely

1. **Identity:** Security/Privacy; web hardening review; P2 / Medium / M / confidence Medium / risk Medium; domain 73, common 71; owner: web apps; V5-W1; web, security.
2. **Executive:** Assess current headers and propose report-only CSP for a bounded route set.
3. **Current state:** Shared header helper exists; M44 has recent header evidence; no CSP weakness verified here.
4. **Problem:** Header drift may weaken browser defenses or block legitimate media/scripts.
5. **Evidence:** scripts/security-headers.mjs and TODO M44 records R02/R17; no new probe.
6. **Value:** Adds defense in depth with compatibility evidence.
7. **Solution:** Inventory origins, collect report-only violations, then propose a policy.
8. **Architecture:** Reuse shared helper; no new proxy and no weakening current headers.
9. **Microtasks:** Inspect helper; map sources; design report-only policy; test fixtures; capture authorized staging violations.
10. **Acceptance:** No selected route break; inline exceptions have written rationale.
11. **DoD:** Owner-approved origin inventory and rollback instructions.
12. **Tests:** Header contracts and browser checks under separate staging authorization.
13. **Dependencies:** Deployment approval; M44-08 is an external gate only.
14. **Risks:** Broad policy ineffective; strict policy blocks content.
15. **Metrics:** Violation categories and exception count; no invented baseline.
16. **Estimate:** 4–8 days; report endpoint cost unknown.
17. **Rollback:** Remove CSP header, preserve existing security headers.
18. **Synergy:** Protects reading and admin surfaces.
19. **Anti-overlap:** Not a reimplementation of M44 host/HTTPS proof.
20. **Outcome:** Evidence-based CSP proposal or documented no-go.
21. **Future:** Enforce only after review.
22. **Closure evidence:** Route matrix, report and rollback check.

## ENG-011 — Produce dependency provenance and license inventory

1. **Identity:** Security/Privacy; software supply chain; P2 / Medium / M / confidence Medium / risk Medium; domain 75, common 68; owner: release engineering; V5-W1; dependencies, supply-chain.
2. **Executive:** Generate a point-in-time inventory of dependencies, licenses and provenance metadata.
3. **Current state:** pnpm workspace/lockfile exist; no inventory was generated in this task.
4. **Problem:** Reviewers lack one auditable view of third-party components and license evidence.
5. **Evidence:** Root manifest/lockfile R16; no vulnerable dependency claim.
6. **Value:** Supports reproducible builds and rights review.
7. **Solution:** Evaluate current tooling and produce a non-blocking pilot SBOM.
8. **Architecture:** Existing release workflow after approval; no network dependency on developer startup.
9. **Microtasks:** Select format; generate sample; validate URLs/versions/licenses; mark unknowns; review size/secrets.
10. **Acceptance:** Inventory matches lockfile package set; unknown metadata remains unknown.
11. **DoD:** Release owner approves scope and retention.
12. **Tests:** Fixture comparison and artifact schema validation.
13. **Dependencies:** —; related M27 but not a substitute.
14. **Risks:** False license labels/noise; retain tool version and source.
15. **Metrics:** Package coverage and unresolved metadata count.
16. **Estimate:** 3–6 days; recurring tool cost TBD.
17. **Rollback:** Disable artifact publication; retain local instructions.
18. **Synergy:** Helps all domains review software components.
19. **Anti-overlap:** Not vulnerability remediation or replacement for release gates.
20. **Outcome:** Reproducible inventory with unknowns visible.
21. **Future:** Signing/attestation only after format acceptance.
22. **Closure evidence:** Sample artifact, lockfile comparison, review.

## ENG-012 — Add adversarial contract tests for AI input boundaries

1. **Identity:** Security/Privacy; AI trust tests; P1 / Hard / L / confidence Medium / risk High; domain 83, common 78; owner: AI Gateway; V5-W1; ai, testing, security.
2. **Executive:** Test prompt injection, malformed output and citation spoofing against the existing bounded AI route.
3. **Current state:** AI evidence schemas exist; no adversarial suite ran in this review.
4. **Problem:** Happy-path parsing does not show that untrusted source text remains data, not instructions.
5. **Evidence:** AI evidence schema path R17; sources S01–S03.
6. **Value:** Gives future AI work concrete failure boundaries.
7. **Solution:** Use synthetic adversarial fixtures to assert schema/permission gates reject unsafe action or fabricated citation fields.
8. **Architecture:** Reuse schema/Gateway; tests never call live models.
9. **Microtasks:** Define threat cases; craft fixtures; assert parse/deny; add encoding variants; list untested behaviors.
10. **Acceptance:** Untrusted text never authorizes tools; invalid citations are rejected or marked unresolved.
11. **DoD:** Deterministic fixtures reviewed by AI/security owners.
12. **Tests:** Offline contracts only; live-model evaluation is separate and budgeted.
13. **Dependencies:** ENG-006/009; enables FUT-001.
14. **Risks:** Overfit fixtures; vary encoding and state coverage limits.
15. **Metrics:** Fixture outcomes; no total prompt-injection prevention claim.
16. **Estimate:** 5–10 days; no model spend.
17. **Rollback:** Remove test hook; production allowlist unchanged.
18. **Synergy:** Protects ontology and research experiments.
19. **Anti-overlap:** Not a new agent runtime or general red-team certification.
20. **Outcome:** Repeatable negative tests for current boundary.
21. **Future:** Curate rights-cleared eval data.
22. **Closure evidence:** Fixtures, observed output and coverage limits.

## ENG-013 — Document API compatibility and deprecation rules

1. **Identity:** Architecture/Contracts; API lifecycle; P2 / Medium / S / confidence Medium / risk Low; domain 70, common 71; owner: ARSY API; V5-W1; api, docs.
2. **Executive:** Define how route/schema changes are versioned, announced and retired.
3. **Current state:** API versions and generated clients exist; TODO records SDK consistency work.
4. **Problem:** Consumers can break if compatibility expectations are implicit.
5. **Evidence:** TODO M19-19 and route/schema inventory R02/R17.
6. **Value:** Enables safer cross-app iteration.
7. **Solution:** Write concise rules with additive/breaking examples, migration window and owners.
8. **Architecture:** Reuse current route versioning, schema generation and release docs.
9. **Microtasks:** Inventory markers; agree terms; document cases; link checks; review consumers.
10. **Acceptance:** Three sample changes classify consistently and map to a check or explicit gap.
11. **DoD:** ARSY and consumer owners approve; no version changed.
12. **Tests:** Check examples against representative schema diffs.
13. **Dependencies:** —; enables ENG-014.
14. **Risks:** Policy can overconstrain iteration; separate public/internal contracts.
15. **Metrics:** Review includes explicit compatibility classification.
16. **Estimate:** 1–3 days.
17. **Rollback:** Revert policy doc and retain prior release rules.
18. **Synergy:** Reduces integration cost across products.
19. **Anti-overlap:** Distinct from ENG-006 error envelope and API redesign.
20. **Outcome:** Shared compatibility vocabulary with examples.
21. **Future:** Automate only stable rules.
22. **Closure evidence:** Approved policy and examples.

## ENG-014 — Check generated API schemas against route contracts

1. **Identity:** Architecture/Contracts; schema conformance; P2 / Hard / L / confidence Medium / risk Medium; domain 77, common 69; owner: API tooling; V5-W1; api, ci.
2. **Executive:** Add a focused check that published schemas agree with selected Fastify route schemas.
3. **Current state:** Route schemas and generated SDK evidence exist; drift status is unknown.
4. **Problem:** A stale schema may make clients accept or reject the wrong fields.
5. **Evidence:** R17 and TODO M19-19 API/SDK evidence; no mismatch claimed.
6. **Value:** Improves predictable client integration.
7. **Solution:** Normalize generated schemas for selected routes and fail on unreviewed incompatible differences.
8. **Architecture:** Use existing generation; no second OpenAPI source of truth.
9. **Microtasks:** Find canonical schemas; compare output; normalize; add fixtures; wire focused check.
10. **Acceptance:** Intentional change updates canonical source/artifact; stale artifact fails.
11. **DoD:** ENG-013 compatibility rules and API owner approval.
12. **Tests:** Semantic schema tests; avoid key-order snapshots.
13. **Dependencies:** ENG-013; enables FUT-018.
14. **Risks:** False diffs/tool drift; pin generator and normalize deterministically.
15. **Metrics:** Stale artifact detection and route coverage.
16. **Estimate:** 6–12 days; CI time to measure.
17. **Rollback:** Remove check invocation while preserving artifacts.
18. **Synergy:** Supports app consumers and research prototypes.
19. **Anti-overlap:** Not error-envelope work or broad API redesign.
20. **Outcome:** Detectable schema drift on bounded routes.
21. **Future:** Expand after false-positive review.
22. **Closure evidence:** Fixtures, generation command and compatibility review.

## ENG-015 — Add package ownership metadata to workspace inventory

1. **Identity:** Architecture/Contracts; ownership map; P2 / Medium / M / confidence Medium / risk Low; domain 73, common 70; owner: workspace maintainers; V5-W1; monorepo, architecture.
2. **Executive:** Make package ownership and allowed dependency direction easy to inspect.
3. **Current state:** BLUEPRINT, APPS, manifests and lint rules carry overlapping boundary information.
4. **Problem:** Contributors can miss the canonical data owner and introduce cross-boundary imports.
5. **Evidence:** R03/R05, workspace manifests and lint guidance; no new violation claimed.
6. **Value:** Protects ARSY, SKYLINK, ECHOLOG and domain boundaries.
7. **Solution:** Create a read-only inventory sourced from package metadata and authoritative docs.
8. **Architecture:** Prefer manifest-derived view; no second manual registry where derivation works.
9. **Microtasks:** Identify owners; map directions; test derivability; render table; document exceptions.
10. **Acceptance:** Every package has owner/boundary link or UNKNOWN; no duplicate canonical owner implied.
11. **DoD:** Owners approve entries and source-of-truth choice.
12. **Tests:** Fixture flags unowned package and duplicate owner.
13. **Dependencies:** —; enables FUT-015/ONT-006.
14. **Risks:** Stale metadata; derive and review exceptions.
15. **Metrics:** Owner coverage and unresolved exceptions.
16. **Estimate:** 3–6 days.
17. **Rollback:** Remove generated view; dependencies unchanged.
18. **Synergy:** Prevents duplication in all domains.
19. **Anti-overlap:** Not a service registry or new architecture authority.
20. **Outcome:** Inspectable ownership map aligned to accepted docs.
21. **Future:** Guide import linting only if approved.
22. **Closure evidence:** Inventory, fixture output and owner review.

## ENG-016 — Define stable serialization for provenance records

1. **Identity:** Architecture/Contracts; provenance serialization; P2 / Hard / L / confidence Medium / risk Medium; domain 76, common 69; owner: corpus/research; V5-W1; provenance, data-contract.
2. **Executive:** Specify deterministic serialization/versioning for source provenance records used in audit artifacts.
3. **Current state:** Source labels, lineage tests and release manifests exist in distinct packages.
4. **Problem:** Comparisons may vary if identity, ordering or normalization differ.
5. **Evidence:** moonql-witness lineage tests and moonql-research modules R17; no corruption claim.
6. **Value:** Supports archival checks and source traceability.
7. **Solution:** Compare shapes and define a narrow canonical export with schema version and stable order.
8. **Architecture:** Mapping/export only; no replacement database or global provenance owner.
9. **Microtasks:** Inventory shapes; choose identity fields; define normalization; test round trip; document migrations.
10. **Acceptance:** Same fixture serializes byte-identically; unknown fields follow explicit version rules.
11. **DoD:** Package owners approve schema and compatibility.
12. **Tests:** Golden fixture, round trip and version incompatibility.
13. **Dependencies:** ENG-002; related ONT-001/003.
14. **Risks:** Over-normalization loses nuance; preserve original value and attribution.
15. **Metrics:** Deterministic fixture hashes and migration coverage.
16. **Estimate:** 6–12 days.
17. **Rollback:** Stop new export version; preserve old records.
18. **Synergy:** Helps ontology, research and audit users.
19. **Anti-overlap:** No new source-of-truth service.
20. **Outcome:** Versioned stable export contract.
21. **Future:** Map to PROV-O only if an experiment justifies it.
22. **Closure evidence:** Schema, golden output, owner decision and migration note.

## ENG-017 — Validate application environment configuration at startup

1. **Identity:** Architecture/Contracts; configuration safety; P2 / Medium / M / confidence Low / risk Medium; domain 70, common 65; owner: app maintainers; V5-W1; config, reliability.
2. **Executive:** Audit selected app environment parsing and propose fail-fast checks for required values.
3. **Current state:** Apps have separate manifests/config; no missing-variable failure was reproduced.
4. **Problem:** Silent defaults can create misleading local or deployed states.
5. **Evidence:** R16 and selected app manifests R17; behavior remains to be inspected.
6. **Value:** Makes configuration errors diagnosable before serving requests.
7. **Solution:** Reuse existing validators; centralize only shared primitives, not per-service policy.
8. **Architecture:** Per-app schema; redact secrets from validation messages.
9. **Microtasks:** Inventory variables; classify required/optional; compare parsers; add safe diagnostics; document examples.
10. **Acceptance:** Missing required value exits before listen; diagnostics name key but never its value.
11. **DoD:** Each touched app has positive/negative config fixtures.
12. **Tests:** Unit tests with synthetic values.
13. **Dependencies:** —; related ENG-020.
14. **Risks:** False requiredness can block deployment; owner review required.
15. **Metrics:** Misconfigurations caught before server start.
16. **Estimate:** 4–9 days for bounded apps.
17. **Rollback:** Restore prior parser while retaining secret redaction.
18. **Synergy:** Reduces setup friction across domains.
19. **Anti-overlap:** Not a secret-management replacement or new config service.
20. **Outcome:** Explicit startup config behavior.
21. **Future:** Expand after pilot.
22. **Closure evidence:** Variable matrix, tests and safe output capture.

## ENG-018 — Establish a representative corpus ingestion benchmark

1. **Identity:** Performance; corpus throughput baseline; P2 / Medium / M / confidence Low / risk Low; domain 67, common 66; owner: corpus package; V5-W1; performance, research.
2. **Executive:** Measure ingestion throughput and memory on an authorized synthetic fixture.
3. **Current state:** Corpus package exists; no benchmark was collected here.
4. **Problem:** Optimization without measurement risks wasted effort or resource spikes.
5. **Evidence:** Package inventory R17; this is a measurement gap, not a regression claim.
6. **Value:** Provides a reproducible basis for scale decisions.
7. **Solution:** Add a bounded synthetic dataset and report time, memory and item count by size.
8. **Architecture:** Isolated benchmark; no production database or real source content.
9. **Microtasks:** Choose synthetic shapes; record machine/runtime; measure sizes; document variance; defer thresholds until repeat runs.
10. **Acceptance:** Results include environment metadata and repeat within a declared tolerance.
11. **DoD:** No unlicensed text; benchmark owner reviews methodology.
12. **Tests:** Correctness assertions; performance run is opt-in.
13. **Dependencies:** —; enables FUT-017.
14. **Risks:** Synthetic data may not represent real corpora; state limits.
15. **Metrics:** Throughput, peak RSS and variance.
16. **Estimate:** 3–6 days; local compute.
17. **Rollback:** Remove benchmark without touching ingestion.
18. **Synergy:** Helps knowledge and archive planning.
19. **Anti-overlap:** Not content import or M19 publication work.
20. **Outcome:** Baseline for later optimization decisions.
21. **Future:** Add licensed fixtures only after rights review.
22. **Closure evidence:** Fixture generator, results, environment and limitations.

## ENG-019 — Bound object streaming memory and cancellation

1. **Identity:** Performance; object stream bounds; P2 / Hard / L / confidence Low / risk Medium; domain 69, common 66; owner: ECHOLOG; V5-W1; echolog, performance.
2. **Executive:** Measure streaming memory, client cancellation and timeout behavior for bounded objects.
3. **Current state:** ECHOLOG routes/tests exist; object-store availability varies by environment.
4. **Problem:** Buffering or abandoned streams may consume resources; hypothesis only.
5. **Evidence:** R07/R17; no runtime performance evidence collected.
6. **Value:** Protects attachment delivery while preserving stateless service role.
7. **Solution:** Add synthetic stream tests and a local harness; tune only after reproducing a gap.
8. **Architecture:** ECHOLOG boundary; no tables or second storage layer.
9. **Microtasks:** Inspect stream path; define test size/time; simulate slow client/cancel; measure memory; record go/no-go.
10. **Acceptance:** Memory stays within owner-agreed cap; cancellation releases handles within timeout.
11. **DoD:** Contract tests and operator note; no deployment claim.
12. **Tests:** Fake-source tests; live S3 excluded unless separately enabled.
13. **Dependencies:** —; enables FUT-016.
14. **Risks:** Incorrect cap rejects valid media; derive limits from real needs.
15. **Metrics:** Peak RSS, cancel latency and timeout count.
16. **Estimate:** 5–10 days; local compute.
17. **Rollback:** Revert tuning; preserve prior behavior.
18. **Synergy:** Supports media UX and cost control.
19. **Anti-overlap:** Does not close M33-05/M44 media evidence or add SQL.
20. **Outcome:** Evidence-backed resource bounds or no-change decision.
21. **Future:** External store test after deployment owner approval.
22. **Closure evidence:** Fixture results, measurements and owner decision.

## ENG-020 — Measure graph query fan-out and enforce safe limits

1. **Identity:** Performance; graph complexity bounds; P2 / Hard / L / confidence Low / risk Medium; domain 72, common 69; owner: MoonQL graph/ontology; V5-W1; graph, performance.
2. **Executive:** Characterize query cost on synthetic graphs and define fan-out/time limits if needed.
3. **Current state:** Graph and ontology packages exist; no slow query was reproduced.
4. **Problem:** Relationship expansion can grow rapidly with depth and fan-out.
5. **Evidence:** moonql-graph and moonql-ontology inventory R17; performance status UNKNOWN.
6. **Value:** Prevents accidentally expensive exploration requests.
7. **Solution:** Benchmark depth/fan-out; apply explicit query budgets only at owning boundary.
8. **Architecture:** Existing graph package; no graph database or query service.
9. **Microtasks:** Build synthetic graphs; measure; identify worst cases; agree caps; add budget test.
10. **Acceptance:** Query terminates at configured budget and marks partial results explicitly.
11. **DoD:** Product owner accepts truncation semantics.
12. **Tests:** Complexity, timeout and cancellation tests.
13. **Dependencies:** —; related ONT-009.
14. **Risks:** Truncation can hide relations; expose limits and never omit silently.
15. **Metrics:** Nodes/edges visited, runtime and truncation rate.
16. **Estimate:** 6–12 days.
17. **Rollback:** Disable new cap with conservative fallback; retain warning.
18. **Synergy:** Improves knowledge exploration and stability.
19. **Anti-overlap:** Graph package; not ontology redesign or a new store.
20. **Outcome:** Bounded graph exploration with visible truncation.
21. **Future:** Tune from authorized workloads.
22. **Closure evidence:** Dataset, results and semantics review.

## ENG-021 — Add route bundle-size budgets to selected web apps

1. **Identity:** Performance; web payload baseline; P2 / Medium / M / confidence Low / risk Low; domain 66, common 66; owner: web app maintainer; V5-W1; web, performance.
2. **Executive:** Measure and optionally gate initial bundle size for one representative app.
3. **Current state:** Multiple web apps/UI packages exist; no size regression is claimed.
4. **Problem:** Large initial payloads may slow low-bandwidth readers and operators.
5. **Evidence:** R05/R17; baseline unmeasured in this review.
6. **Value:** Supports faster access and lower data use.
7. **Solution:** Capture reproducible build report; set budget only after two stable baselines.
8. **Architecture:** Existing bundler output; no new analytics or media service.
9. **Microtasks:** Select app; record environment; separate initial/lazy assets; repeat baseline; propose budget.
10. **Acceptance:** Budget has measured baseline, owner and reproducible check; no arbitrary threshold.
11. **DoD:** Agreed route remains within budget; exceptions state rationale.
12. **Tests:** CI artifact-size assertion; functional tests remain separate.
13. **Dependencies:** —; related ENG-024/FUT-017.
14. **Risks:** Tool/compression changes create noise; pin toolchain and compare like output.
15. **Metrics:** Initial JS/CSS bytes and build variance.
16. **Estimate:** 3–6 days; CI time measured later.
17. **Rollback:** Remove gate but retain reports.
18. **Synergy:** Helps access on constrained devices.
19. **Anti-overlap:** Not M45 page rebuild or ECHOLOG media optimization.
20. **Outcome:** One measured client payload budget.
21. **Future:** Expand after value is confirmed.
22. **Closure evidence:** Reports, rationale and CI fixture.

## ENG-022 — Audit keyboard and zoom access in Orbit operations

1. **Identity:** UI/Accessibility; Orbit operational UI; P2 / Medium / M / confidence Low / risk Medium; domain 68, common 65; owner: Orbit; V5-W1; accessibility, orbit.
2. **Executive:** Assess keyboard, focus, contrast and zoom on selected Orbit operator flow.
3. **Current state:** Orbit shell/API exists; conformance was not tested here.
4. **Problem:** Visual controls can remain inaccessible to keyboard or magnification users.
5. **Evidence:** R05/R17; WCAG 2.2 S05–S06.
6. **Value:** Enables independent operation for more users.
7. **Solution:** Run scoped manual audit, then fix only evidenced defects.
8. **Architecture:** Existing Orbit/MoonUI components; no parallel design system.
9. **Microtasks:** Select flow; record baseline; inspect keyboard/name/contrast/zoom; document gaps; fix/retest.
10. **Acceptance:** Controls keyboard reachable and named; usable at 200% zoom or documented exception.
11. **DoD:** Manual and automated evidence tied to route; no blanket WCAG claim.
12. **Tests:** Existing tooling plus keyboard/zoom review.
13. **Dependencies:** Coordinate with active Orbit worktree changes.
14. **Risks:** Layout changes affect operators; seek user review.
15. **Metrics:** Reproducible blockers by criterion.
16. **Estimate:** 4–8 days.
17. **Rollback:** Revert isolated fixes; retain audit.
18. **Synergy:** Helps cross-domain operations.
19. **Anti-overlap:** Not M19 publication or M44 deployment work.
20. **Outcome:** Evidence-backed fixes for one flow.
21. **Future:** Expand after scope approval.
22. **Closure evidence:** Before/after capture, keyboard checklist and tests.

## ENG-023 — Audit accessible names in Sentinel review controls

1. **Identity:** UI/Accessibility; Sentinel review interface; P2 / Medium / M / confidence Low / risk Medium; domain 67, common 65; owner: Sentinel; V5-W1; accessibility, sentinel.
2. **Executive:** Verify selected review controls expose labels, focus and keyboard behavior.
3. **Current state:** Sentinel contract tests exist; UI conformance was not reviewed.
4. **Problem:** Review actions can be unclear through assistive technology.
5. **Evidence:** R17 and WCAG S05–S06; no defect asserted.
6. **Value:** Supports equitable and accountable review.
7. **Solution:** Audit one non-destructive review screen and apply narrow control fixes.
8. **Architecture:** Existing Sentinel UI; no new moderation behavior/policy.
9. **Microtasks:** Select screen; inspect labels/focus/error announcement; fix verified gaps; retest.
10. **Acceptance:** Action has programmatic name, visible focus and announced result/error.
11. **DoD:** Accessibility review; destructive behavior unchanged.
12. **Tests:** Component assertions and manual assistive-technology pass.
13. **Dependencies:** Coordinate with current Sentinel changes.
14. **Risks:** Better labels can obscure state; preserve exact status meaning.
15. **Metrics:** Remaining blockers in scoped flow.
16. **Estimate:** 4–8 days.
17. **Rollback:** Revert isolated markup; keep workaround record.
18. **Synergy:** Improves reviewer access and trust.
19. **Anti-overlap:** Excludes policy, classification and publication rights.
20. **Outcome:** Keyboard/assistive-technology-usable flow.
21. **Future:** Audit other screens after owner approval.
22. **Closure evidence:** Test output, manual checklist and reviewer feedback.

## ENG-024 — Audit focus and reduced-motion behavior in Cockpit navigation

1. **Identity:** UI/Accessibility; Cockpit navigation; P2 / Medium / M / confidence Low / risk Medium; domain 66, common 65; owner: Cockpit; V5-W1; accessibility, cockpit.
2. **Executive:** Check focus restoration and reduced motion through a bounded navigation sequence.
3. **Current state:** Cockpit has active UI/reduced-motion WIP; this behavior was not re-audited.
4. **Problem:** Navigation can lose focus or ignore motion preference.
5. **Evidence:** Dirty worktree observation, R04 and WCAG S05–S06; no defect asserted.
6. **Value:** Improves shell access for keyboard and motion-sensitive users.
7. **Solution:** After current WIP settles, test menu/route focus and OS motion preference.
8. **Architecture:** Reuse existing Cockpit hooks/MoonUI; do not replace active work.
9. **Microtasks:** Identify canonical revision; define flows; test focus/motion; patch one verified defect.
10. **Acceptance:** Focus returns to invoking control; nonessential animation respects reduced motion; no duplicate hook.
11. **DoD:** Owner reviews against settled WIP.
12. **Tests:** Component tests and manual keyboard check.
13. **Dependencies:** Wait for active Cockpit changes to settle; related ENG-021.
14. **Risks:** Parallel edits conflict; do not start against ambiguous baseline.
15. **Metrics:** Focus-loss reproductions and preference assertions.
16. **Estimate:** 3–7 days after baseline.
17. **Rollback:** Revert isolated change.
18. **Synergy:** Supports shared accessible shell.
19. **Anti-overlap:** Explicitly not a second reduced-motion implementation.
20. **Outcome:** Verified navigation behavior for one flow.
21. **Future:** Extend to dialogs with separate evidence.
22. **Closure evidence:** Baseline SHA, tests and manual notes.

## ENG-025 — Make shared test fixtures deterministic and isolated

1. **Identity:** Testing/CI; fixture reliability; P2 / Medium / M / confidence Low / risk Medium; domain 72, common 65; owner: test infrastructure; V5-W1; tests, reliability.
2. **Executive:** Audit fixtures for hidden time, randomness, environment and mutable state.
3. **Current state:** Many packages have contract tests; no flakiness claim from this review.
4. **Problem:** Nondeterministic fixtures create false failures and conceal regressions.
5. **Evidence:** Test inventory R17; no suite run here.
6. **Value:** Makes CI evidence more trustworthy.
7. **Solution:** Select shared fixture patterns; inject clock/seed/config and assert cleanup.
8. **Architecture:** Keep helpers package-local unless reuse is proven.
9. **Microtasks:** Select fixture families; inspect globals; define helpers; add isolation checks; document pattern.
10. **Acceptance:** Repeated fixture runs are identical and leave no shared state.
11. **DoD:** Supported Node runs deterministic; cleanup verified.
12. **Tests:** Repeat-in-process and isolated-worker checks.
13. **Dependencies:** —; enables ENG-026.
14. **Risks:** Excess abstraction; require two real consumers before extraction.
15. **Metrics:** Output variance and leaked-state cases.
16. **Estimate:** 4–8 days.
17. **Rollback:** Keep package-local fixtures if shared helper is rejected.
18. **Synergy:** Improves confidence across domains.
19. **Anti-overlap:** Does not assert CI is flaky.
20. **Outcome:** Deterministic pattern and first conversions.
21. **Future:** Expand only to affected suites.
22. **Closure evidence:** Repeat outputs and cleanup assertions.

## ENG-026 — Verify authorization denial matrices for selected routes

1. **Identity:** Testing/CI; route authorization regression; P1 / Hard / L / confidence Medium / risk High; domain 82, common 74; owner: ARSY/security; V5-W1; authz, tests.
2. **Executive:** Build a matrix for one route family with anonymous, allowed, denied and malformed principals.
3. **Current state:** Denial tests and recent M19 containment evidence exist; no new exposure is asserted.
4. **Problem:** Existing deny behavior can regress when schemas or roles change.
5. **Evidence:** TODO M19-19 and ARSY tests R02/R17; avoid its open acceptance scope.
6. **Value:** Makes access boundaries repeatable without publishing data.
7. **Solution:** Select an independent route family with owner approval; use synthetic fixtures and no live DB.
8. **Architecture:** Existing route test harness and auth hooks.
9. **Microtasks:** Select route; map principals; assert call counts/response; add positive control; review overlap.
10. **Acceptance:** Denial causes zero protected-store calls; allowed fixture succeeds; no private fields leak.
11. **DoD:** Security owner signs route scope/roles.
12. **Tests:** Route tests with fake store and exact denial matrix.
13. **Dependencies:** M19 overlap review; related ENG-008.
14. **Risks:** Role assumptions may be stale; use accepted ADR and current contract.
15. **Metrics:** Matrix cells covered; protected calls on deny = 0.
16. **Estimate:** 5–10 days.
17. **Rollback:** Test-only scope can be removed; production ACL unchanged.
18. **Synergy:** Protects cross-domain data boundaries.
19. **Anti-overlap:** Excludes M19-19 and existing Graph/UNILEX containment work.
20. **Outcome:** Reviewed denial contract for one distinct route.
21. **Future:** Reuse after each owner approves scope.
22. **Closure evidence:** Route rationale, matrix output and review.

## ENG-027 — Report flaky tests from observed CI history

1. **Identity:** Testing/CI; flaky-test diagnosis; P2 / Medium / M / confidence Low / risk Low; domain 67, common 66; owner: CI maintainers; V5-W1; ci, quality.
2. **Executive:** Determine whether repeated CI failures are flaky before adding retries/quarantines.
3. **Current state:** CI status is partially visible; no failure log was supplied or rerun.
4. **Problem:** Calling failures flakes can hide defects; treating flakes as deterministic wastes time.
5. **Evidence:** Connector supplied incomplete workflow evidence; failure status UNKNOWN.
6. **Value:** Improves response without masking red builds.
7. **Solution:** Collect authorized CI history and classify reproducibility by test/environment.
8. **Architecture:** Read-only reporting first; no automatic retry policy.
9. **Microtasks:** Define data window; export outcomes; normalize signatures; classify manually; propose targeted fixes.
10. **Acceptance:** Report separates repeatable, environment and unconfirmed failures with links.
11. **DoD:** Maintainer review; no retry change without evidence.
12. **Tests:** Validate parser on synthetic logs.
13. **Dependencies:** CI-history access; enables ENG-028.
14. **Risks:** Sparse data creates false labels; low samples remain UNKNOWN.
15. **Metrics:** Sample count and reviewer agreement.
16. **Estimate:** 2–5 days plus access.
17. **Rollback:** Delete report; CI behavior unchanged.
18. **Synergy:** Helps all package quality processes.
19. **Anti-overlap:** Not a CI rebuild or retry system.
20. **Outcome:** Evidence-backed flake diagnosis or no-go.
21. **Future:** Maintain report if useful.
22. **Closure evidence:** Data window, anonymized signatures and dispositions.

## ENG-028 — Document the supported focused validation matrix

1. **Identity:** Testing/CI; command discoverability; P2 / Medium / S / confidence Medium / risk Low; domain 71, common 68; owner: DX; V5-W1; developer-experience, ci.
2. **Executive:** Map package validation commands to changed-file scopes and prerequisites.
3. **Current state:** Diagnostic guide discovers commands; package scripts exist.
4. **Problem:** Contributors may run unrelated broad commands or confuse discovery with success.
5. **Evidence:** scripts/diagnostics/README.md and root scripts R16/R17.
6. **Value:** Reduces waste and sharpens evidence reporting.
7. **Solution:** Create dated command map from manifests and distinguish command discovery from execution.
8. **Architecture:** Documentation/read-only discovery; generator never runs app scripts.
9. **Microtasks:** Inventory scripts; classify lint/typecheck/test/build; list prerequisites; check freshness; document wording.
10. **Acceptance:** Each command exists or is marked unavailable; no success is implied.
11. **DoD:** Package owners review; discovery remains non-executing.
12. **Tests:** Fixture validates paths/names; commands themselves are not run by this task.
13. **Dependencies:** ENG-027 for history links; related ENG-032.
14. **Risks:** Scripts change; date and regeneration method required.
15. **Metrics:** Coverage and stale entries.
16. **Estimate:** 1–3 days.
17. **Rollback:** Remove table; scripts unchanged.
18. **Synergy:** Improves DX across domains.
19. **Anti-overlap:** Not a mandate to run tests or alter package scripts.
20. **Outcome:** Clear, current validation reference.
21. **Future:** Automate regeneration when stable.
22. **Closure evidence:** Manifest comparison and owner review.

## ENG-029 — Instrument worker lifecycle state transitions

1. **Identity:** Operations; worker observability; P2 / Medium / M / confidence Low / risk Medium; domain 69, common 65; owner: LUMEN; V5-W1; observability, runtime.
2. **Executive:** Add privacy-safe lifecycle events only if ENG-004 confirms an executable worker.
3. **Current state:** Lifecycle contracts/tests exist; runtime maturity/deployment unknown.
4. **Problem:** Operators may not distinguish startup, drain, failure and stop.
5. **Evidence:** R08/R15 and test inventory; no log review here.
6. **Value:** Helps diagnose workers without exposing task contents.
7. **Solution:** Emit a small set of state, duration and opaque correlation fields.
8. **Architecture:** Existing logger; no telemetry backend required.
9. **Microtasks:** Confirm executable scope; define schema; add synthetic tests; measure overhead; document meaning.
10. **Acceptance:** All states appear in fixtures; no source payload or secrets.
11. **DoD:** LUMEN/privacy owners approve retention.
12. **Tests:** Lifecycle and redaction assertions.
13. **Dependencies:** ENG-004/008.
14. **Risks:** Logs may be mistaken for availability; include environment and caveat.
15. **Metrics:** Missing events and overhead.
16. **Estimate:** 4–8 days; no vendor cost assumed.
17. **Rollback:** Disable emission; lifecycle unchanged.
18. **Synergy:** Supports reliable prototypes.
19. **Anti-overlap:** No observability platform or deployment claim.
20. **Outcome:** Safe worker trace.
21. **Future:** Export only to an approved backend.
22. **Closure evidence:** Synthetic trace, privacy review and overhead measure.

## ENG-030 — Correlate requests across one existing boundary

1. **Identity:** Operations; request trace correlation; P2 / Hard / L / confidence Low / risk Medium; domain 70, common 63; owner: ARSY plus one consumer; V5-W1; observability, api.
2. **Executive:** Determine whether one request can be traced across ARSY and a consumer without exposing identifiers.
3. **Current state:** Multiple service boundaries exist; no trace baseline was taken.
4. **Problem:** Cross-service diagnosis may require matching disparate logs.
5. **Evidence:** APPS/service inventory R05/R17; no outage or trace gap confirmed.
6. **Value:** Speeds diagnosis with minimal log data.
7. **Solution:** Use bounded opaque correlation ID; validate propagation; reject sensitive user IDs.
8. **Architecture:** Existing request context/logging; no new bus or trace database.
9. **Microtasks:** Pick boundary; inspect headers; define format; propagate/redact; test invalid IDs.
10. **Acceptance:** Synthetic request traceable end-to-end; invalid IDs replaced; no personal data.
11. **DoD:** Both owners and privacy reviewer approve.
12. **Tests:** Fake service integration and redaction tests.
13. **Dependencies:** ENG-008; related ENG-029.
14. **Risks:** Spoofing/cardinality explosion; enforce length, randomness and rate.
15. **Metrics:** Fixture completeness and malformed-ID rejection.
16. **Estimate:** 5–10 days.
17. **Rollback:** Stop propagation at consumer; local logs remain.
18. **Synergy:** Observability without changing data ownership.
19. **Anti-overlap:** No shared trace store or identity function.
20. **Outcome:** One demonstrated correlated request path.
21. **Future:** Extend after privacy/cost review.
22. **Closure evidence:** Synthetic trace and overhead report.

## ENG-031 — Report recurring service cost by bounded workload

1. **Identity:** Operations; operational cost visibility; P2 / Medium / M / confidence Low / risk Low; domain 66, common 66; owner: operations; V5-W1; operations, cost.
2. **Executive:** Measure cost drivers for one existing workload before capacity changes.
3. **Current state:** No cost baseline was independently collected.
4. **Problem:** Growth assumptions can hide recurring costs.
5. **Evidence:** Service map R05; amounts UNKNOWN until aggregate billing is supplied.
6. **Value:** Supports sustainable engineering and product experiments.
7. **Solution:** Build bounded worksheet from authorized aggregate billing and synthetic volume; no user-level telemetry.
8. **Architecture:** Read-only analysis; no billing SDK or per-user ledger.
9. **Microtasks:** Select workload; list cost components; obtain aggregate data; normalize units; state uncertainty.
10. **Acceptance:** Worksheet reproduces supplied totals and labels exclusions.
11. **DoD:** Operations/finance review; no customer data.
12. **Tests:** Arithmetic fixtures and sensitivity analysis.
13. **Dependencies:** Aggregate cost data; related ECO-005.
14. **Risks:** Shared infrastructure allocation can mislead; show method and range.
15. **Metrics:** Cost per defined workload unit with uncertainty.
16. **Estimate:** 3–6 days plus data access.
17. **Rollback:** Remove analysis if data rights/method are invalid.
18. **Synergy:** Informs scale and pricing research.
19. **Anti-overlap:** Not revenue analytics or payment processing.
20. **Outcome:** Transparent operational baseline.
21. **Future:** Repeat after workload changes.
22. **Closure evidence:** Inputs, formula, exclusions and approval.

## ENG-032 — Create a package-owner onboarding map

1. **Identity:** Documentation/DX; contributor onboarding; P2 / Easy / S / confidence Medium / risk Low; domain 72, common 68; owner: documentation; V5-W1; docs, onboarding.
2. **Executive:** Give contributors a route from task ownership to package, contract and diagnostics.
3. **Current state:** README, BLUEPRINT, APPS, diagnostics and AI contract provide authoritative context.
4. **Problem:** Entry points are distributed and can be confused with authorization.
5. **Evidence:** R01/R03/R05/R10/R11 and diagnostics guide.
6. **Value:** Reduces orientation time and reinforces evidence discipline.
7. **Solution:** Add linked index rather than duplicate architecture/commands.
8. **Architecture:** One concise existing-doc page; links first.
9. **Microtasks:** Map reader needs; link authority docs; mark non-authorizing diagnostics; review paths.
10. **Acceptance:** Contributor finds TODO, owning contract, coding guide and command discovery from one page.
11. **DoD:** Links checked; no copied status tables.
12. **Tests:** Static link validation.
13. **Dependencies:** —; related ENG-001/028.
14. **Risks:** Another stale index; keep minimal.
15. **Metrics:** Broken links and available findability feedback.
16. **Estimate:** 1–2 days.
17. **Rollback:** Remove page and references.
18. **Synergy:** Helps all contributors follow shared evidence rules.
19. **Anti-overlap:** Not a duplicate README or governance system.
20. **Outcome:** Maintained entry map to authoritative material.
21. **Future:** Add examples after approval.
22. **Closure evidence:** Link-check output and owner review.

