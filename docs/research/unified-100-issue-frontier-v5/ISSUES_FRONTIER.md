# Domain B — Frontier Innovation (30)

Subdomain allocation: AI-native/agents 7; Future UX/HCI 5; knowledge/simulation/worlds 5; distributed/local-first 4; moonshot inventions 5; wildcard cross-domain 4. All proposals are PROPOSED research or bounded prototypes, not implemented work. In every body, VERIFIED applies only to the cited artifact; behavior not examined remains UNKNOWN; recommendations are PROPOSED/EXPERIMENTAL. Each experiment requires synthetic or explicitly authorized data, a time/resource budget, success and failure criteria, and a recorded go/no-go decision.
**ADR applicability:** Each candidate remains PROPOSED; the [item-by-item ADR applicability register](ADR_APPLICABILITY.md) identifies current boundaries and conditions requiring a future owner-reviewed ADR.

Identity convention: the heading supplies ID/title; this file supplies the primary domain; the first identity phrases give subdomain/type. Identity lines include priority, difficulty, effort, confidence, risk, domain/common score, owner and proposed V5 wave. Trailing tags are suggested labels. The suggested wave is not a TODO milestone. Implementation maturity for all entries is PROPOSED. Before running any experiment, the owner must set a numeric or categorical success threshold, failure threshold, time cap and cost cap.

## FUT-001 — Prototype citation-bounded research answers

**Canonical TODO task:** [M47-01](../../../TODO.md) — TODO is sole status source; `FUT-001` is only the V5 reference ID.

1. **Identity:** AI-native; citation-grounded assistant; P1 / Hard / L / confidence Medium / risk High; domain 86, common 80; owner: AI Gateway + MoonQL Research; V5-W2; ai, research, experiment.
2. **Executive:** Test whether a read-only assistant can answer a narrow corpus question with every claim linked to an authorized source record.
3. **Current state:** Corpus, research and AI evidence-schema foundations exist; no end-to-end capability is verified here.
4. **Problem:** Answers without traceable evidence can misstate source material.
5. **Evidence:** R17; NIST/OWASP S01–S02; implementation value remains experimental.
6. **Value:** Could reduce researcher lookup effort while preserving source attribution.
7. **Solution:** Offline POC on synthetic/cleared passages; return claim spans, citation IDs and abstention reason.
8. **Architecture:** Existing Gateway and research package; retrieval only, no write tools or new corpus owner.
9. **Microtasks:** Define one question type; create fixtures; bind source IDs; measure citations; review failure cases; write decision.
10. **Acceptance:** At least 90% of fixture claims cite an existing passage; fabricated citations are rejected; abstentions are explicit. Threshold is a proposed gate, not a baseline.
11. **DoD:** No live/private source; evaluation set and failure analysis published internally.
12. **Tests:** Offline schema/grounding tests plus small blinded human review; no live model call in CI.
13. **Dependencies:** ENG-009, ENG-012; enables FUT-002/003.
14. **Risks:** Fluent unsupported answers; require source entailment review and label model output.
15. **Metrics:** Claim citation coverage, unsupported-claim rate, abstention rate, latency and per-run cost.
16. **Estimate:** 8–15 engineering days; two-week research window; model cost capped before execution.
17. **Rollback:** Delete prototype data/output; no production route is enabled.
18. **Synergy:** Reuses research provenance for ontology and education.
19. **Anti-overlap:** Does not create a general chatbot or authoritative religious interpreter.
20. **Outcome:** Reproducible go/no-go evidence for one answer task.
21. **Future:** Expand to more question types only after source-owner and scholar review.
22. **Closure evidence:** Fixture set, score sheet, cost record and decision memo.

## FUT-002 — Benchmark abstention on ambiguous or unsupported questions

**Canonical TODO task:** [M47-02](../../../TODO.md) — TODO is sole status source; `FUT-002` is only the V5 reference ID.

1. **Identity:** AI-native; uncertainty evaluation; P1 / Hard / L / confidence Medium / risk High; domain 84, common 77; owner: AI Gateway/research; V5-W2; ai, evaluation.
2. **Executive:** Measure whether the prototype declines to answer when evidence is absent, contradictory or out of scope.
3. **Current state:** Citation-answer experiment is proposed, not implemented.
4. **Problem:** Citation formatting alone does not prevent overconfident answers.
5. **Evidence:** FUT-001; S01–S03.
6. **Value:** Makes epistemic limits visible to researchers.
7. **Solution:** Create labeled synthetic cases for missing evidence, conflicting editions, ambiguous question and prompt injection.
8. **Architecture:** Evaluation harness only; no inference service changes.
9. **Microtasks:** Define labels; author cases; have two reviewers adjudicate; score abstention; revise thresholds; decide no-go.
10. **Acceptance:** Every unsupported fixture is either abstained or surfaced as unresolved; no unsupported certainty label appears.
11. **DoD:** Reviewer disagreements recorded and thresholds justified.
12. **Tests:** Deterministic evaluator tests; model outputs reviewed outside CI.
13. **Dependencies:** FUT-001; enables FUT-006; related FUT-027.
14. **Risks:** High abstention can make feature useless; report utility alongside safety.
15. **Metrics:** Unsupported-answer rate, correct abstention, false abstention and reviewer agreement.
16. **Estimate:** 6–12 engineering days; bounded evaluation set.
17. **Rollback:** Retire eval harness without changing production behavior.
18. **Synergy:** Benefits ontology integrity and education.
19. **Anti-overlap:** Distinct from general AI security fixtures ENG-012; tests evidence uncertainty, not attack payloads.
20. **Outcome:** Calibrated confidence/abstention decision.
21. **Future:** Compare models only with approved budget and reproducible prompts.
22. **Closure evidence:** Labeled cases, anonymized scores and go/no-go memo.

## FUT-003 — Prototype human approval for proposed research actions

**Canonical TODO task:** [M47-03](../../../TODO.md) — TODO is sole status source; `FUT-003` is only the V5 reference ID.

1. **Identity:** AI-native; human-in-the-loop control; P1 / Hard / L / confidence Medium / risk High; domain 85, common 80; owner: AI Gateway/HQ; V5-W2; ai, governance.
2. **Executive:** Test whether people understand the existing read-only research handoff when it shows a synthetic proposed action, source scope and expected effect.
3. **Current state:** Human approval is a project principle; current operational tool set was not audited end-to-end.
4. **Problem:** A confirm button is not meaningful if scope and consequences are hidden.
5. **Evidence:** R03/R10; OWASP S02 and official approval guide S03; vendor-specific examples only.
6. **Value:** Can make future automation understandable and reversible.
7. **Solution:** Run a comprehension/usability study over the existing M40-08 read-only handoff using synthetic action payloads; use a paper overlay only if the existing surface cannot display the fields under review.
8. **Architecture:** Research-only evaluation; no second approval card, handoff, adapter, live tool execution, persistent grant, or reviewer store. M41-08 remains the existing pause/resume adapter.
9. **Microtasks:** Select a harmless synthetic scenario; map comprehension questions to existing handoff fields; test with consented internal reviewers; record ambiguity; decide.
10. **Acceptance:** Reviewers can identify actor, data scope, action, consequence and expiry from the existing handoff; cancellation has no effect; no new product UI or authority is created.
11. **DoD:** Usability notes and threat assumptions reviewed.
12. **Tests:** State-machine tests; manual accessibility review.
13. **Dependencies:** FUT-001 and ENG-009; M20 is an external gate only before integration with real reviewer authority.
14. **Risks:** Prototype mistaken for authority; watermark DEMO and disable network/action APIs.
15. **Metrics:** Correct comprehension, mistaken approvals, time-to-decide and accessibility blockers.
16. **Estimate:** 6–10 days; two-week design sprint; no infra cost.
17. **Rollback:** Remove local prototype; no persisted decisions.
18. **Synergy:** Can inform responsible research, commerce and community workflows.
19. **Anti-overlap:** Reuses the M40-08 handoff and M41-08 adapter; no second approval UI/handoff, D00/D12 reviewer grant, M20-04 implementation, or autonomous action.
20. **Outcome:** Evidence on whether the review interaction communicates scope.
21. **Future:** Integrate only after accepted authority contract and separate authorization.
22. **Closure evidence:** Prototype, test script, findings and explicit no-go option.

## FUT-004 — Test untrusted-source isolation in a retrieval prototype

**Canonical TODO task:** [M47-04](../../../TODO.md) — TODO is sole status source; `FUT-004` is only the V5 reference ID.

1. **Identity:** AI-native; source injection defense; P2 / Hard / L / confidence Medium / risk High; domain 82, common 71; owner: AI Gateway; V5-W2; ai, security, experiment.
2. **Executive:** Assess whether hostile instructions embedded in synthetic source text can influence the prototype’s behavior.
3. **Current state:** No retrieval assistant is verified; ENG-012 proposes generic adversarial contracts.
4. **Problem:** Retrieved passages can contain instructions that should be treated as quoted data.
5. **Evidence:** S01–S03 and proposed FUT-001; threat is general, not a reported incident.
6. **Value:** De-risks future source-grounded experiments.
7. **Solution:** Red-team a fake corpus with benign and hostile passages; compare isolated prompt construction and output.
8. **Architecture:** Offline experimental harness reusing existing Gateway; no external URLs/tools.
9. **Microtasks:** Define threat model; generate fixtures; run capped cases; classify; change one control; record residual risk.
10. **Acceptance:** No fixture grants a tool or changes policy; failures are recorded without claiming universal protection.
11. **DoD:** Security owner reviews test set and scope.
12. **Tests:** Offline deterministic prompt construction tests plus bounded manual model evaluation if approved.
13. **Dependencies:** FUT-001; related FUT-003/ENG-012.
14. **Risks:** Model variance and evaluator bias; repeat runs and preserve raw synthetic cases.
15. **Metrics:** Attack success by class, false refusal and run cost.
16. **Estimate:** 5–10 days; fixed inference cap required.
17. **Rollback:** Retire experiment; no production control changes.
18. **Synergy:** Supports safe corpus and ontology exploration.
19. **Anti-overlap:** Focuses retrieval-source instructions; ENG-012 covers API schema/authorization attacks.
20. **Outcome:** Bounded defense comparison with known limits.
21. **Future:** Expand only with rights-cleared threat data.
22. **Closure evidence:** Threat matrix, capped run log and residual-risk review.

## FUT-005 — Evaluate private local inference feasibility

**Canonical TODO task:** [M47-05](../../../TODO.md) — TODO is sole status source; `FUT-005` is only the V5 reference ID.

1. **Identity:** AI-native; privacy/cost architecture study; P2 / Hard / L / confidence Low / risk Medium; domain 70, common 66; owner: AI Gateway/research; V5-W2; ai, privacy, research.
2. **Executive:** Compare local inference against the current approved approach for one low-risk synthetic task.
3. **Current state:** No local model deployment or user demand was verified.
4. **Problem:** Cloud inference has privacy/cost trade-offs, while local models bring device, quality and maintenance costs.
5. **Evidence:** NIST S01 and local-first research S07; hardware/product fit unknown.
6. **Value:** Could reveal whether offline/private workflows are practical.
7. **Solution:** Benchmark one small open model on synthetic text; compare quality, latency, memory, license and update burden.
8. **Architecture:** Disposable developer machine only; no user-device execution or new runtime.
9. **Microtasks:** Select task/model; audit license; cap hardware/time; run fixture; measure; compare; no-go if quality/cost is poor.
10. **Acceptance:** Report includes reproducible environment, quality rubric, RAM/latency, license and maintenance comparison.
11. **DoD:** No personal or sacred/private content; model provenance recorded.
12. **Tests:** Evaluation fixture and result reproducibility.
13. **Dependencies:** No blocker for a capped synthetic benchmark on a disposable developer machine; related ENG-010/FUT-007. Existing security and license rules still apply.
14. **Risks:** Hardware-specific results and model license ambiguity; state limits.
15. **Metrics:** Task quality, latency, memory, energy estimate and maintenance hours.
16. **Estimate:** 5–10 days; hardware/inference budget capped at approval.
17. **Rollback:** Delete downloaded model/cache and report credentials; no service changed.
18. **Synergy:** May support offline research and privacy.
19. **Anti-overlap:** Study only; no model catalog, provider registry or SKYLINK capability.
20. **Outcome:** Go/no-go on one narrow local task.
21. **Future:** Broader study requires device/user evidence.
22. **Closure evidence:** Model/license record, benchmark and cleanup confirmation.

## FUT-006 — Prototype claim-level multilingual citation alignment

**Canonical TODO task:** [M47-06](../../../TODO.md) — TODO is sole status source; `FUT-006` is only the V5 reference ID.

1. **Identity:** AI-native; cross-language evidence alignment; P2 / Hard / L / confidence Low / risk High; domain 76, common 65; owner: corpus/research; V5-W2; ai, multilingual.
2. **Executive:** Test whether a translation claim can link to a source passage and translation edition without conflating them.
3. **Current state:** Bilingual product docs and corpus models exist; no aligned translation evaluator was verified.
4. **Problem:** Similar sentences across languages may not be equivalent evidence.
5. **Evidence:** TEI S08, FAIR S13, project source labels R17; scholarly fit needs review.
6. **Value:** Can help users compare translation evidence transparently.
7. **Solution:** Use a tiny authorized parallel fixture with claim span, language, edition, translator and source link; compare human-reviewed alignment to model suggestion.
8. **Architecture:** Research export only; no automatic corpus edits.
9. **Microtasks:** Select authorized sample; label spans; produce model suggestions; review differences; report unsupported matches.
10. **Acceptance:** Every suggestion is labeled machine-generated and linked to exact edition; no automatic equivalence assertion.
11. **DoD:** Qualified language/text reviewer signs evaluation method.
12. **Tests:** Schema and alignment-reference checks; human review is not replaced by unit tests.
13. **Dependencies:** FUT-002/FUT-004; ONT-003 is related.
14. **Risks:** Translation bias and false equivalence; preserve human attribution and contestation.
15. **Metrics:** Reviewer agreement, unsupported alignment and edition-link completeness.
16. **Estimate:** 8–15 days; source license/access cost unknown.
17. **Rollback:** Remove suggestions; originals remain unchanged.
18. **Synergy:** Supports ontology, reader UX and education.
19. **Anti-overlap:** Does not create translations or theological interpretation.
20. **Outcome:** Feasibility result for one language pair and source type.
21. **Future:** Extend only with community/scholar authorization.
22. **Closure evidence:** Cleared sample, annotated outcomes and reviewer decision.

## FUT-007 — Compare short-lived AI sessions with persistent memory

**Canonical TODO task:** [M47-07](../../../TODO.md) — TODO is sole status source; `FUT-007` is only the V5 reference ID.

1. **Identity:** AI-native; memory/privacy experiment; P2 / Hard / L / confidence Low / risk High; domain 72, common 65; owner: AI Gateway/privacy; V5-W2; ai, privacy.
2. **Executive:** Measure whether a narrow research task benefits from session memory and what data it would retain.
3. **Current state:** No approved persistent AI memory service was verified.
4. **Problem:** Memory may improve continuity but can preserve sensitive or incorrect assumptions.
5. **Evidence:** NIST S01; local-first principles S07; demand UNKNOWN.
6. **Value:** May guide a privacy-preserving choice between ephemeral and saved notes.
7. **Solution:** Compare two disposable prototypes using synthetic sessions; expose inspect/delete and retention behavior.
8. **Architecture:** Local experiment files only; no server-side memory, identity, or new database.
9. **Microtasks:** Define task; create fake data; measure success; inspect retained fields; test deletion; issue recommendation.
10. **Acceptance:** Report shows user-visible retained data and deletion result; no hidden cross-session state.
11. **DoD:** Privacy review; no actual personal/session data.
12. **Tests:** State reset/deletion tests and synthetic carry-over checks.
13. **Dependencies:** FUT-005; related FUT-003.
14. **Risks:** Prototype behavior may understate model/vendor retention; document boundary.
15. **Metrics:** Task completion, retained-field count and deletion success.
16. **Estimate:** 5–9 days; capped inference budget.
17. **Rollback:** Clear all local experiment state and stop prototype.
18. **Synergy:** Informs research UX and consent design.
19. **Anti-overlap:** No persistent production memory or account feature.
20. **Outcome:** Evidence-based choice of ephemeral vs explicit note.
21. **Future:** Persistent feature needs separate consent/retention decision.
22. **Closure evidence:** Data-flow diagram, test results and deletion proof.

## FUT-008 — Prototype a source-first evidence navigator

**Canonical TODO task:** [M47-08](../../../TODO.md) — TODO is sole status source; `FUT-008` is only the V5 reference ID.

1. **Identity:** Future UX/HCI; research navigation; P2 / Medium / M / confidence Medium / risk Medium; domain 78, common 74; owner: Dock/research; V5-W2; ux, research.
2. **Executive:** Compare a source-first panel with current navigation for a synthetic research question.
3. **Current state:** Dock research/compare surfaces are being withheld pending existing rights gates.
4. **Problem:** Users may have trouble moving from a claim to its source and context.
5. **Evidence:** MASTER_DESIGN and M19 TODO records R02/R04; no current usability study.
6. **Value:** Could reduce evidence lookup effort.
7. **Solution:** Clickable local mock with claim list, source edition, context and uncertainty controls.
8. **Architecture:** Prototype only; no public data route or production projection.
9. **Microtasks:** Create synthetic scenario; sketch two variants; test with 5 consented internal reviewers; measure comprehension; decide.
10. **Acceptance:** Reviewers can locate source/edition and explain uncertainty; no identifiable source is real.
11. **DoD:** Findings include sample limits and accessibility observations.
12. **Tests:** Usability tasks, keyboard walkthrough and static contract checks.
13. **Dependencies:** M19 gate is external for real-source integration; related FUT-009/014.
14. **Risks:** Mock may imply public release; label DEMO and use fake records.
15. **Metrics:** Source-find time, attribution comprehension and error rate.
16. **Estimate:** 4–8 days; one-week prototype.
17. **Rollback:** Delete local mock and synthetic fixtures.
18. **Synergy:** Helps faith/ontology research without changing source authority.
19. **Anti-overlap:** Synthetic prototype only; shares test fixtures, not product implementation, with FUT-009, FUT-025 and ONT-014. Not implementation of M19-19/Dock release.
20. **Outcome:** Interaction decision supported by limited usability evidence.
21. **Future:** Real source integration only under publication/rights gates.
22. **Closure evidence:** Prototype, task script, notes and decision.

## FUT-009 — Visualize uncertainty without a single confidence badge

**Canonical TODO task:** [M47-09](../../../TODO.md) — TODO is sole status source; `FUT-009` is only the V5 reference ID.

1. **Identity:** Future UX/HCI; uncertainty visualization; P2 / Medium / M / confidence Medium / risk Medium; domain 75, common 71; owner: research UX; V5-W2; ux, epistemics.
2. **Executive:** Test a compact visual language that separates source quality, reviewer agreement and model confidence.
3. **Current state:** Evidence classes exist in project guidance; no tested uncertainty interface verified.
4. **Problem:** One numeric badge can collapse different kinds of uncertainty.
5. **Evidence:** R03 and NIST S01; interface need inferred.
6. **Value:** Helps readers interpret what a system knows and does not know.
7. **Solution:** Compare labeled chips, layered evidence bars and plain-language notes on mock claims.
8. **Architecture:** Design study; no changes to underlying epistemic classes.
9. **Microtasks:** Define distinctions; create mock cards; conduct comprehension test; identify ambiguity; select/no-go.
10. **Acceptance:** Reviewers distinguish evidence quality from model confidence and reviewer agreement in test cases.
11. **DoD:** Language reviewed by domain and accessibility reviewers.
12. **Tests:** Comprehension prompts, color-independent and screen-reader review.
13. **Dependencies:** FUT-008; related ONT-007.
14. **Risks:** Visual treatment may imply false precision; avoid percentages absent calibration.
15. **Metrics:** Correct classification and disagreement rate.
16. **Estimate:** 4–7 days.
17. **Rollback:** Discard mock; no underlying record altered.
18. **Synergy:** Benefits all evidence-bearing domains.
19. **Anti-overlap:** Owns only the uncertainty-visualization question; shares synthetic fixtures with FUT-008/FUT-025/ONT-014 and does not redefine evidence labels or scholarly review policy.
20. **Outcome:** Tested vocabulary/visual pattern or documented no-go.
21. **Future:** Adopt only after ontology and accessibility review.
22. **Closure evidence:** Mock variants, responses and decision note.

## FUT-010 — Study bilingual context switching in a research reader

**Canonical TODO task:** [M47-10](../../../TODO.md) — TODO is sole status source; `FUT-010` is only the V5 reference ID.

1. **Identity:** Future UX/HCI; language comparison; P2 / Medium / M / confidence Low / risk Medium; domain 70, common 65; owner: Dock/Empire UX; V5-W2; ux, i18n.
2. **Executive:** Evaluate whether users can switch languages without losing their source position or edition context.
3. **Current state:** Bilingual routes exist; this behavior was not observed in a user study.
4. **Problem:** Language changes can silently change edition, source span or navigation position.
5. **Evidence:** I18N architecture R17; no user evidence.
6. **Value:** Reduces comparison friction for bilingual research.
7. **Solution:** Prototype two context-switch patterns on synthetic records and compare task completion.
8. **Architecture:** Frontend mock; no corpus edits or route changes.
9. **Microtasks:** Define scenario; create fake paired editions; build mock; test; record position/context errors.
10. **Acceptance:** User can identify current edition/language and resume same source location after switching.
11. **DoD:** Include keyboard, RTL-readiness question and sample limitations.
12. **Tests:** State transition tests and moderated task.
13. **Dependencies:** FUT-008; publication gate applies before real content; related FUT-009.
14. **Risks:** Paired language content may not be equivalent; label editions independently.
15. **Metrics:** Context-loss errors and task completion.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove prototype; no persisted state.
18. **Synergy:** Helps multilingual education and source comparison.
19. **Anti-overlap:** No translation generation or source alignment claims.
20. **Outcome:** Evidence for a language-switch interaction pattern.
21. **Future:** Validate RTL and more languages after evidence.
22. **Closure evidence:** Mock, task results and language reviewer note.

## FUT-011 — Prototype accessible audio navigation for cleared excerpts

**Canonical TODO task:** [M47-11](../../../TODO.md) — TODO is sole status source; `FUT-011` is only the V5 reference ID.

1. **Identity:** Future UX/HCI; multimodal access; P2 / Medium / M / confidence Low / risk High; domain 68, common 67; owner: reader UX; V5-W2; audio, accessibility.
2. **Executive:** Test whether optional audio navigation improves access to a synthetic/cleared short excerpt.
3. **Current state:** Media and rights gates exist; no audio feature is verified for this research scope.
4. **Problem:** Text-only navigation may be a barrier for some users.
5. **Evidence:** MASTER_DESIGN, M17/M33 TODO and WCAG S05–S06; no user need quantified.
6. **Value:** May support alternate access if rights and user value are demonstrated.
7. **Solution:** Local prototype with play/pause, transcript, time-linked focus and reduced-motion-compatible controls.
8. **Architecture:** No public audio route, generated voice or new media owner.
9. **Microtasks:** Confirm allowed synthetic asset; prototype controls; test keyboard/captions; conduct small access review; go/no-go.
10. **Acceptance:** Controls work by keyboard; transcript remains available; asset provenance is clear.
11. **DoD:** Rights/accessibility review; no sacred text audio without exact approval.
12. **Tests:** Player state, transcript sync and keyboard tests.
13. **Dependencies:** Rights approval is external; related ENG-022/024.
14. **Risks:** Audio source, attribution and religious reading norms; stop if permissions unclear.
15. **Metrics:** Task completion, transcript use and accessibility blockers.
16. **Estimate:** 5–9 days; asset costs unknown.
17. **Rollback:** Delete local asset/prototype.
18. **Synergy:** Can support education and reader access.
19. **Anti-overlap:** No media access implementation or M33-05 replacement.
20. **Outcome:** Decision on usefulness and safe controls.
21. **Future:** Production requires rights, consent and content-owner approval.
22. **Closure evidence:** Cleared asset record, test notes and no-go option.

## FUT-012 — Test a spatially anchored source exploration concept

**Canonical TODO task:** [M47-12](../../../TODO.md) — TODO is sole status source; `FUT-012` is only the V5 reference ID.

1. **Identity:** Future UX/HCI; spatial interaction; P3 / Complex / XL / confidence Low / risk High; domain 57, common 53; owner: research UX; V5-W2; spatial, prototype.
2. **Executive:** Explore whether spatial arrangement helps users understand relationships among a small synthetic set of sources.
3. **Current state:** No spatial product requirement or runtime was verified.
4. **Problem:** A relationship graph may be difficult to navigate in flat lists, but 3D may add cognitive load.
5. **Evidence:** Moonshot scope from V5 brief; current product evidence absent.
6. **Value:** Tests a future interaction hypothesis without product commitment.
7. **Solution:** Build one desktop mock with 12 synthetic nodes, 2D fallback, keyboard navigation and source labels.
8. **Architecture:** Disposable browser prototype; no spatial runtime/app or graph owner.
9. **Microtasks:** Define task; build mock; compare 2D/3D; test orientation; measure errors; stop if no advantage.
10. **Acceptance:** Users complete a relation-finding task at least as accurately as 2D; otherwise record no-go.
11. **DoD:** 2D alternative, accessibility review and cost note included.
12. **Tests:** Synthetic graph contract and moderated usability.
13. **Dependencies:** None; no production integration.
14. **Risks:** Motion sickness, depth confusion, inaccessible controls and novelty bias.
15. **Metrics:** Completion, wrong links, time, nausea/accessibility feedback.
16. **Estimate:** 10–20 days, strict prototype cap.
17. **Rollback:** Delete demo and assets.
18. **Synergy:** Could complement knowledge navigation if evidence is strong.
19. **Anti-overlap:** No 3D world, game, or production graph rendering.
20. **Outcome:** Clear invest/no-invest decision.
21. **Future:** Any XR study needs dedicated participants/safeguards.
22. **Closure evidence:** Demo, task protocol, results and budget reconciliation.

## FUT-013 — Explore evidence-aware graph traversal

**Canonical TODO task:** [M47-13](../../../TODO.md) — TODO is sole status source; `FUT-013` is only the V5 reference ID.

1. **Identity:** Knowledge/Simulation; graph exploration; P2 / Hard / L / confidence Medium / risk Medium; domain 76, common 69; owner: MoonQL Graph; V5-W2; graph, prototype.
2. **Executive:** Prototype a traversal that shows why two attributed claims are connected and which edges remain uncertain.
3. **Current state:** Graph and ontology packages exist; feature behavior not verified.
4. **Problem:** A graph path may appear evidentially stronger than its source records justify.
5. **Evidence:** R17 and PROV-O S09; no claim of current defect.
6. **Value:** Supports transparent research discovery.
7. **Solution:** Synthetic graph demo with edge provenance, relation type, attribution and confidence class.
8. **Architecture:** Read-only projection over fixture graph; no new ontology owner.
9. **Microtasks:** Define path semantics; create synthetic records; render alternatives; test ambiguity; review with researcher.
10. **Acceptance:** Each displayed path shows all edge sources and labels inference vs direct source relation.
11. **DoD:** Graph owner accepts truncation and epistemic rules.
12. **Tests:** Fixture graph traversal and provenance-link checks.
13. **Dependencies:** ENG-020; related ONT-009.
14. **Risks:** Visual path implies causality; use neutral relation language.
15. **Metrics:** Edge provenance coverage and user interpretation error.
16. **Estimate:** 6–12 days.
17. **Rollback:** Remove read-only prototype.
18. **Synergy:** Connects ontology and research UX.
19. **Anti-overlap:** Does not introduce graph schema or prove metaphysical relations.
20. **Outcome:** Evaluated path explanation pattern.
21. **Future:** Extend only after ontology owner approval.
22. **Closure evidence:** Demo, fixtures and researcher review.

## FUT-014 — Prototype a claim/evidence scenario simulator

**Canonical TODO task:** [M47-14](../../../TODO.md) — TODO is sole status source; `FUT-014` is only the V5 reference ID.

1. **Identity:** Knowledge/Simulation; research scenario; P2 / Hard / L / confidence Low / risk Medium; domain 69, common 67; owner: research; V5-W2; simulation, epistemology.
2. **Executive:** Test an interactive “what evidence would change this conclusion?” exercise using invented claims and evidence.
3. **Current state:** No simulation capability or user need was verified.
4. **Problem:** Researchers may benefit from rehearsing inference boundaries before working with sensitive real material.
5. **Evidence:** Proposed cross-domain idea; OECD evaluation structure S12 is adjacent only.
6. **Value:** Could teach evidence quality without asserting a worldview.
7. **Solution:** Build a fictional case with competing hypotheses, source reliability labels and reversible evidence additions.
8. **Architecture:** Local educational prototype; no production claim store.
9. **Microtasks:** Draft fictional case; define transitions; test comprehension; assess bias; decide.
10. **Acceptance:** Users distinguish evidence addition from conclusion certainty; multiple outcomes remain possible.
11. **DoD:** Domain reviewer approves neutral language.
12. **Tests:** State transition tests and moderated comprehension.
13. **Dependencies:** —; related ONT-009.
14. **Risks:** Game framing trivializes sensitive inquiry; keep case wholly fictional and optional.
15. **Metrics:** Correct explanation of evidence vs inference and task completion.
16. **Estimate:** 5–10 days.
17. **Rollback:** Remove prototype content and preserve method notes only.
18. **Synergy:** Supports education and epistemology.
19. **Anti-overlap:** Not an actual theology or historical simulation.
20. **Outcome:** Go/no-go on educational interaction.
21. **Future:** Real examples require scholarly approval and consent.
22. **Closure evidence:** Fictional dataset, test plan and review decision.

## FUT-015 — Compare TEI and current corpus models on one witness

**Canonical TODO task:** [M47-15](../../../TODO.md) — TODO is sole status source; `FUT-015` is only the V5 reference ID.

1. **Identity:** Knowledge/Simulation; scholarly encoding experiment; P2 / Hard / L / confidence Medium / risk Medium; domain 78, common 70; owner: corpus; V5-W2; tei, interoperability.
2. **Executive:** Map one authorized witness fixture to TEI P5 and current MoonQL structures to identify fit and loss.
3. **Current state:** Corpus/witness models exist; no full mapping study was done.
4. **Problem:** New format adoption without a loss analysis risks duplicating or flattening existing source models.
5. **Evidence:** TEI P5 S08 and R17.
6. **Value:** Informs export/interchange decisions for digital scholarship.
7. **Solution:** Compare a small synthetic/cleared witness with variants, provenance and editorial notes.
8. **Architecture:** Export/import mapping study only; no replacement model or dependency.
9. **Microtasks:** Select fields; map both ways; list unrepresentable data; test round-trip; recommend adopt/map/no-go.
10. **Acceptance:** Every field is mapped, intentionally omitted or marked lossy with rationale.
11. **DoD:** Corpus specialist reviews scholarly semantics and licensing.
12. **Tests:** Round-trip fixture and schema validation.
13. **Dependencies:** ENG-015; enables ONT-006.
14. **Risks:** TEI complexity and profile mismatch; constrain to one task.
15. **Metrics:** Field coverage and lossy transformations.
16. **Estimate:** 6–12 days.
17. **Rollback:** Discard converter prototype; current model unchanged.
18. **Synergy:** Could improve export interoperability.
19. **Anti-overlap:** Not automatic conversion of existing corpus or an additional database owner.
20. **Outcome:** Evidence-backed interoperability decision.
21. **Future:** Broader profile only after a use case.
22. **Closure evidence:** Mapping table, fixtures, reviewer sign-off.

## FUT-016 — Prototype a media provenance timeline

**Canonical TODO task:** [M47-16](../../../TODO.md) — TODO is sole status source; `FUT-016` is only the V5 reference ID.

1. **Identity:** Knowledge/Simulation; asset lifecycle visualization; P2 / Hard / L / confidence Low / risk Medium; domain 70, common 63; owner: ECHOLOG/rights owner; V5-W2; media, provenance.
2. **Executive:** Show an asset’s synthetic creation, transformation, review and access events without exposing its contents.
3. **Current state:** ECHOLOG owns object storage; rights and private media tasks remain open.
4. **Problem:** Operators may need to inspect asset lineage without copying private media into logs.
5. **Evidence:** ECHOLOG contract R07; M17/M33 TODO; no end-to-end lineage proof.
6. **Value:** Could clarify auditability for authorized media handling.
7. **Solution:** Static prototype over fabricated event records and opaque object IDs.
8. **Architecture:** Read-only view; no rights decision, media fetching or storage schema change.
9. **Microtasks:** Define event vocabulary; create fake records; test redaction; evaluate comprehension; stop if redundant.
10. **Acceptance:** Timeline distinguishes storage events from consent/publication decisions; content remains unavailable.
11. **DoD:** ECHOLOG and privacy owners approve event fields.
12. **Tests:** Event-order, redaction and state rendering fixtures.
13. **Dependencies:** No task blocker for fabricated event records; ENG-019/021 and M33-05 apply only if a later scope uses streaming, shipping, or real assets; related ENG-019/021.
14. **Risks:** Timeline mistaken for a rights clearance; label decisions as external authority.
15. **Metrics:** Lineage comprehension and sensitive-field leakage.
16. **Estimate:** 5–9 days.
17. **Rollback:** Remove prototype and fake records.
18. **Synergy:** Supports research audit and media stewardship.
19. **Anti-overlap:** Synthetic timeline study only; no private-media access or replacement for M17/M33 rights tasks. Real assets require their separate rights gate.
20. **Outcome:** Decision on lineage view utility.
21. **Future:** Integration only after event contract approval.
22. **Closure evidence:** Prototype, redaction fixtures and owner review.

## FUT-017 — Simulate research workload and resource scaling

**Canonical TODO task:** [M47-17](../../../TODO.md) — TODO is sole status source; `FUT-017` is only the V5 reference ID.

1. **Identity:** Knowledge/Simulation; workload model; P2 / Medium / M / confidence Low / risk Low; domain 65, common 63; owner: research/operations; V5-W2; simulation, capacity.
2. **Executive:** Model synthetic reader/research workloads to explore capacity and cost sensitivity.
3. **Current state:** No measured user load or service baseline supplied.
4. **Problem:** Capacity planning from imagined growth can overbuild infrastructure.
5. **Evidence:** ENG-018/020 and R05; workload numbers remain hypothetical.
6. **Value:** Gives architects a transparent sensitivity model.
7. **Solution:** Simulate ranges rather than forecast a single demand curve; mark every assumption.
8. **Architecture:** Offline spreadsheet/script; no production load test or user telemetry.
9. **Microtasks:** Define scenarios; obtain baseline if available; model uncertainty; vary cost drivers; document breakpoints.
10. **Acceptance:** Results reproduce from explicit inputs and show ranges, not falsely precise forecasts.
11. **DoD:** Operations review assumptions; no capacity purchase recommended solely from model.
12. **Tests:** Arithmetic fixtures and sensitivity checks.
13. **Dependencies:** No blocker; ENG-018/020 baselines are optional inputs and must be labeled if used; related ENG-031.
14. **Risks:** Synthetic assumptions mistaken for demand; mark as scenario, not forecast.
15. **Metrics:** Break-even ranges and sensitivity to key variables.
16. **Estimate:** 3–6 days.
17. **Rollback:** Delete model if inputs cannot be justified.
18. **Synergy:** Informs engineering and economy cost work.
19. **Anti-overlap:** No production load generation or billing changes.
20. **Outcome:** Transparent capacity scenarios.
21. **Future:** Update only when real aggregate workloads exist.
22. **Closure evidence:** Input register, formulas and limitation note.

## FUT-018 — Test API contract evolution in an offline client sandbox

**Canonical TODO task:** [M47-18](../../../TODO.md) — TODO is sole status source; `FUT-018` is only the V5 reference ID.

1. **Identity:** Distributed/local-first; offline compatibility; P2 / Hard / L / confidence Medium / risk Medium; domain 74, common 66; owner: API tooling; V5-W2; api, compatibility.
2. **Executive:** Test how an older client handles an additive schema change using fixtures only.
3. **Current state:** API versioning exists; no client compatibility experiment was performed.
4. **Problem:** Distributed clients may update later than the server.
5. **Evidence:** ENG-013/014; no specific break reported.
6. **Value:** Informs safe roll-forward behavior for offline-capable clients.
7. **Solution:** Create two versioned fixture clients and replay the same fake response.
8. **Architecture:** Offline sandbox; no API route change or new sync service.
9. **Microtasks:** Pick schema; define old/new clients; simulate extra/missing fields; capture behavior; recommend.
10. **Acceptance:** Unknown additive fields are handled per documented policy; breaking case is detected.
11. **DoD:** Compatibility results inform version policy.
12. **Tests:** Deterministic fixture replay.
13. **Dependencies:** ENG-014; related ONT-006.
14. **Risks:** Fixtures miss real clients; state boundary.
15. **Metrics:** Compatibility outcomes by schema change class.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove sandbox; no client is released.
18. **Synergy:** Helps future offline, ontology and mobile clients.
19. **Anti-overlap:** No data synchronization implementation.
20. **Outcome:** Evidence for additive-contract rules.
21. **Future:** Real app participation after owner approval.
22. **Closure evidence:** Fixture versions and compatibility report.

## FUT-019 — Prototype an offline research notebook with explicit export

**Canonical TODO task:** [M47-19](../../../TODO.md) — TODO is sole status source; `FUT-019` is only the V5 reference ID.

1. **Identity:** Distributed/local-first; local-first UX; P2 / Hard / L / confidence Medium / risk High; domain 79, common 74; owner: research UX; V5-W2; local-first, privacy.
2. **Executive:** Test local-only notes for synthetic sources, with user-controlled export and deletion.
3. **Current state:** Local-first prototypes exist in external research; no MoonWitness notebook feature verified.
4. **Problem:** Research may be interrupted by connectivity, but local persistence can retain sensitive notes.
5. **Evidence:** Ink & Switch S07; no user demand verified.
6. **Value:** Could improve continuity and user control.
7. **Solution:** Disposable browser prototype storing only synthetic notes locally; inspect/export/delete controls.
8. **Architecture:** No server sync, account binding or private witness data.
9. **Microtasks:** Define note schema; prototype local save; test reload/export/delete; threaten device loss; conduct usability study.
10. **Acceptance:** User sees local-only status; export is readable; delete removes the prototype data.
11. **DoD:** Browser storage limits and recovery risks documented.
12. **Tests:** Storage, export, deletion and offline/reload tests.
13. **Dependencies:** —; enables FUT-020/030.
14. **Risks:** Shared device exposure and browser clearing; warn and avoid sensitive data.
15. **Metrics:** Task completion, loss/recovery comprehension and delete success.
16. **Estimate:** 7–12 days; two-week cap.
17. **Rollback:** Clear local store and remove demo.
18. **Synergy:** Supports research accessibility and resilience.
19. **Anti-overlap:** Owns local-only note save/reload/delete and a minimal user-controlled export; FUT-026 owns a portable research bundle and FUT-030 owns tamper-evident evidence verification. No media offline cache, private archive, or production account feature.
20. **Outcome:** Local notebook go/no-go evidence.
21. **Future:** Sync requires conflict, encryption and consent decisions.
22. **Closure evidence:** Prototype, threat notes, test results and decision.

## FUT-020 — Compare deterministic local conflict-resolution strategies

**Canonical TODO task:** [M47-20](../../../TODO.md) — TODO is sole status source; `FUT-020` is only the V5 reference ID.

1. **Identity:** Distributed/local-first; sync semantics study; P2 / Hard / L / confidence Low / risk High; domain 72, common 65; owner: research package; V5-W2; local-first, data-contract.
2. **Executive:** Compare explicit user choice, append-only revisions and merge-on-disjoint-fields on synthetic notes.
3. **Current state:** No production local sync was verified.
4. **Problem:** Silent conflict resolution can erase or misattribute user work.
5. **Evidence:** S07 and FUT-019; no implementation claim.
6. **Value:** Helps decide whether syncing is worth its complexity.
7. **Solution:** Replay a small event set through three strategies and compare resulting state/history.
8. **Architecture:** Pure local simulation; no CRDT dependency.
9. **Microtasks:** Define events; implement miniature replay; create collision cases; compare; publish no-go if semantics unclear.
10. **Acceptance:** Every strategy preserves original values or explains the merge; no lost-write case is silent.
11. **DoD:** Decision record lists unsupported multi-device cases.
12. **Tests:** Property fixtures for order, replay and duplicate events.
13. **Dependencies:** FUT-019; related FUT-030.
14. **Risks:** Prototype may be mistaken for production sync; label as simulation.
15. **Metrics:** Lost updates, conflict resolution steps and state convergence.
16. **Estimate:** 5–9 days.
17. **Rollback:** Delete simulator; no data migration.
18. **Synergy:** Informs any future offline workflow.
19. **Anti-overlap:** Not a third persistence/SQL owner or sync service.
20. **Outcome:** Trade-off comparison with a documented stop decision.
21. **Future:** Further study needs actual user workflows.
22. **Closure evidence:** Event fixtures, strategy output and owner decision.

## FUT-021 — Test encrypted local cache boundaries with synthetic data

**Canonical TODO task:** [M47-21](../../../TODO.md) — TODO is sole status source; `FUT-021` is only the V5 reference ID.

1. **Identity:** Distributed/local-first; local privacy proof; P2 / Hard / L / confidence Low / risk High; domain 74, common 68; owner: security/research UX; V5-W2; local-first, privacy.
2. **Executive:** Evaluate whether a browser prototype can protect synthetic notes at rest and erase them predictably.
3. **Current state:** No offline private-source cache was verified.
4. **Problem:** Local persistence is not automatically private, particularly on shared or compromised devices.
5. **Evidence:** S07 and ICRC guidance S10 by analogy; no security guarantee asserted.
6. **Value:** Exposes threat and recovery trade-offs before any sensitive local feature.
7. **Solution:** Threat-model and prototype browser crypto for fake notes; compare key-loss and deletion behavior.
8. **Architecture:** No real testimony/source; no claim of hardware-backed protection.
9. **Microtasks:** Define attacker model; prototype; test export/delete/key loss; review browser limits; decide no-go.
10. **Acceptance:** Report states what encryption does not protect and shows key/data deletion behavior in fixture.
11. **DoD:** Security review before any reuse.
12. **Tests:** Synthetic encrypt/decrypt, tamper and delete tests.
13. **Dependencies:** FUT-019; related FUT-030.
14. **Risks:** False sense of security, XSS, shared profile, lost keys.
15. **Metrics:** Data recoverability in defined threat cases and deletion behavior.
16. **Estimate:** 6–12 days; no production key service.
17. **Rollback:** Delete keys, fixtures and prototype.
18. **Synergy:** Informs privacy-first research interaction.
19. **Anti-overlap:** No private media access or M16/M33 implementation.
20. **Outcome:** Threat-informed go/no-go for local storage.
21. **Future:** Requires independent cryptographic and legal review.
22. **Closure evidence:** Threat model, test records and deletion confirmation.

## FUT-022 — Evaluate a capability-based worker protocol

**Canonical TODO task:** [M47-22](../../../TODO.md) — TODO is sole status source; `FUT-022` is only the V5 reference ID.

1. **Identity:** Moonshot; bounded worker capability; P2 / Hard / L / confidence Low / risk High; domain 70, common 65; owner: LUMEN; V5-W2; runtime, experiment.
2. **Executive:** Study whether a narrow worker capability format can describe an authorized task without creating a new orchestrator.
3. **Current state:** LUMEN worker scaffold/contracts exist; runtime maturity uncertain.
4. **Problem:** Future background jobs need clear inputs, authority and cancellation.
5. **Evidence:** R08/R15 and ENG-004; no workload demand verified.
6. **Value:** Could improve bounded background processing.
7. **Solution:** Model three synthetic jobs as declarative capabilities and compare against current worker contract.
8. **Architecture:** Contract study only; ARSY remains owner, no queue service or autonomous scheduler.
9. **Microtasks:** Reconcile worker status; list job needs; model capabilities; test cancellation; document fit/no-fit.
10. **Acceptance:** Each task declares scope, resource cap, timeout and cancel behavior; no implicit authority.
11. **DoD:** LUMEN owner approves/no-go.
12. **Tests:** Schema and lifecycle fixture tests.
13. **Dependencies:** ENG-004.
14. **Risks:** Scope creep toward a second orchestration system.
15. **Metrics:** Contract coverage and unbounded-field count.
16. **Estimate:** 5–10 days.
17. **Rollback:** Discard proposed schema; existing contract unchanged.
18. **Synergy:** Could support research and operations tasks.
19. **Anti-overlap:** No new worker app or SKYLINK messaging capability.
20. **Outcome:** Narrow fit decision.
21. **Future:** Implementation requires a separately approved workload.
22. **Closure evidence:** Mapping table, fixtures and boundary review.

## FUT-023 — Explore a multi-reviewer disagreement interface

**Canonical TODO task:** [M47-23](../../../TODO.md) — TODO is sole status source; `FUT-023` is only the V5 reference ID.

1. **Identity:** Moonshot; disagreement-aware review; P2 / Hard / L / confidence Low / risk High; domain 75, common 68; owner: research UX; V5-W2; governance, ux.
2. **Executive:** Prototype how reviewers can record distinct interpretations without forced consensus.
3. **Current state:** Reviewer authority is governed by ADRs/TODO; no new interface authority is proposed.
4. **Problem:** A single resolved label may hide genuine scholarly disagreement.
5. **Evidence:** R03/R09 and contested-status rules; no reviewer study.
6. **Value:** Could make research disagreement legible and respectful.
7. **Solution:** Local mock with attributed positions, evidence links, abstain and unresolved states.
8. **Architecture:** Synthetic records; no reviewer grants, durable decisions or public projection.
9. **Microtasks:** Draft neutral case; prototype; test comprehension; review power dynamics; decide.
10. **Acceptance:** Users can distinguish “different views” from “no evidence”; no vote becomes theological truth.
11. **DoD:** Qualified researcher and cultural-sensitivity reviewer review language.
12. **Tests:** State tests and moderated usability.
13. **Dependencies:** FUT-003; M20 is an external gate only before integration with real reviewer authority.
14. **Risks:** Vote count implies authority; omit popularity ranking.
15. **Metrics:** Interpretation recall, perceived coercion and accessibility.
16. **Estimate:** 5–9 days.
17. **Rollback:** Remove mock; preserve no records.
18. **Synergy:** Benefits ontology and community deliberation.
19. **Anti-overlap:** No M20-04 reviewer panels or decision storage.
20. **Outcome:** Interaction evidence and no-go option.
21. **Future:** Any implementation needs reviewer governance.
22. **Closure evidence:** Prototype and review notes.

## FUT-024 — Prototype a “research journey” planner without spiritual ranking

**Canonical TODO task:** [M47-24](../../../TODO.md) — TODO is sole status source; `FUT-024` is only the V5 reference ID.

1. **Identity:** Moonshot; guided research path; P3 / Complex / XL / confidence Low / risk High; domain 62, common 53; owner: research UX; V5-W2; journey, experiment.
2. **Executive:** Test whether optional checkpoints help a user organize a research question without ranking beliefs or claiming spiritual direction.
3. **Current state:** Project has Journey/Mandate concepts in TODO M23; existing human-mandate work is open.
4. **Problem:** A learning path could help structure work but might be mistaken for authority or progression ranking.
5. **Evidence:** TODO M23 and current ontology docs; no user demand.
6. **Value:** Could make research goals more manageable.
7. **Solution:** Prototype a personal checklist with user-authored goals, editable steps and explicit opt-out.
8. **Architecture:** Static mock only; no account state, mandate, recommendations or spiritual score.
9. **Microtasks:** Define secular research example; prototype; test coercion/accessibility; assess overlap with M23; stop if duplicated.
10. **Acceptance:** User can reorder/delete steps; no ranking, supernatural claim or default enrollment.
11. **DoD:** M23 owner confirms distinctness before any adoption.
12. **Tests:** State manipulation and accessibility review.
13. **Dependencies:** M23 overlap decision; related CHAR-006.
14. **Risks:** Repeats M23 or nudges religious belief; hard no-go gate.
15. **Metrics:** User control comprehension and perceived pressure.
16. **Estimate:** 5–10 days.
17. **Rollback:** Remove prototype; no persistent journey data.
18. **Synergy:** Could support learning but not charity/commercial conversion.
19. **Anti-overlap:** Explicitly does not implement M23-03/05/07.
20. **Outcome:** Evidence on checklist utility and boundary.
21. **Future:** No expansion until owner and user validation.
22. **Closure evidence:** Prototype, overlap sign-off and no-go record.

## FUT-025 — Explore a “claim path” narrative with provenance visible

**Canonical TODO task:** [M47-25](../../../TODO.md) — TODO is sole status source; `FUT-025` is only the V5 reference ID.

1. **Identity:** Moonshot; research narrative visualization; P2 / Hard / L / confidence Low / risk Medium; domain 70, common 63; owner: research UX; V5-W2; narrative, provenance.
2. **Executive:** Prototype a sequence view that follows how a claim is cited, interpreted and revised.
3. **Current state:** Story/media and research concepts coexist; no merged feature verified.
4. **Problem:** Narrative can make evidence easier to follow but may blend fiction, testimony and empirical claims.
5. **Evidence:** R03/R04; project epistemic classes; no user research.
6. **Value:** May make source history understandable without asserting a canon.
7. **Solution:** Fictional case study with separate lanes for source, interpretation, testimony and narrative.
8. **Architecture:** Static, synthetic timeline; no public Story integration.
9. **Microtasks:** Draft case; model lanes; test category distinction; review with researcher; decide.
10. **Acceptance:** Users correctly identify the origin/class of each card; transitions show source/version.
11. **DoD:** No real claim/content; sensitivity review.
12. **Tests:** Category integrity and chronology tests; moderated tasks.
13. **Dependencies:** FUT-014; related ONT-011/ONT-014.
14. **Risks:** Narrative implies linear proof; show branches and disagreement.
15. **Metrics:** Class identification, source recall and misinterpretation.
16. **Estimate:** 6–12 days.
17. **Rollback:** Delete local prototype and fictional assets.
18. **Synergy:** Links knowledge integrity with educational UX.
19. **Anti-overlap:** Synthetic claim-path narrative only; shares fixture vocabulary with FUT-008/FUT-009/ONT-014 but answers a distinct sequence-and-attribution question. No story-rights, publication, or timeline production changes.
20. **Outcome:** Validated narrative pattern or no-go.
21. **Future:** Real examples only with rights/scholar approval.
22. **Closure evidence:** Prototype, user outcomes and review.

## FUT-026 — Explore a personal research export bundle

**Canonical TODO task:** [M47-26](../../../TODO.md) — TODO is sole status source; `FUT-026` is only the V5 reference ID.

1. **Identity:** Moonshot; portable research artifact; P2 / Hard / L / confidence Medium / risk Medium; domain 73, common 66; owner: research package; V5-W2; export, interoperability.
2. **Executive:** Test whether a small, user-controlled export can preserve notes plus source references for offline scholarship.
3. **Current state:** Research/release packages exist; export behavior was not audited end-to-end.
4. **Problem:** Users may need portable work without granting the platform ownership of their notes.
5. **Evidence:** FAIR S13 and PROV-O S09; current export scope UNKNOWN.
6. **Value:** Supports user agency and durable citation.
7. **Solution:** Generate a synthetic archive with manifest, checksums, license/rights metadata and explicit omissions.
8. **Architecture:** Export adapter only; no new storage or import authority.
9. **Microtasks:** Define minimal package; generate fixture; verify checksum; test absence of private data; review portability.
10. **Acceptance:** Bundle opens offline, reports version and sources, and excludes unapproved/private material.
11. **DoD:** Data owner and rights reviewer approve fields.
12. **Tests:** Deterministic output, checksum and exclusion tests.
13. **Dependencies:** FUT-015 and ENG-016; related ONT-004.
14. **Risks:** Export could leak restricted sources; deny by default.
15. **Metrics:** Required provenance field coverage and excluded-field tests.
16. **Estimate:** 6–12 days.
17. **Rollback:** Disable export path; retain synthetic sample only.
18. **Synergy:** Benefits research, ontology and local-first use.
19. **Anti-overlap:** Owns a user-requested portable archive/export contract; distinguish it from FUT-019's local-note lifecycle and FUT-030's tamper-evident evidence package. Not a data portability promise or M18/M19 publication feature.
20. **Outcome:** Export-format decision with privacy review.
21. **Future:** User-facing export requires rights/access contract.
22. **Closure evidence:** Bundle fixture, checksums and field review.

## FUT-027 — Build a synthetic reviewer training simulator

**Canonical TODO task:** [M47-27](../../../TODO.md) — TODO is sole status source; `FUT-027` is only the V5 reference ID.

1. **Identity:** Wildcard; governance education; P2 / Medium / M / confidence Low / risk Medium; domain 67, common 68; owner: governance/research; V5-W2; training, simulation.
2. **Executive:** Test whether fictional cases help reviewers practice distinguishing evidence, interpretation and unknowns.
3. **Current state:** Reviewer roles and decisions are governed elsewhere; no training tool verified.
4. **Problem:** Reviewers may confuse procedural approval with proof of a claim.
5. **Evidence:** R03/R09 and S01; training effectiveness unverified.
6. **Value:** Could improve consistency without centralizing authority.
7. **Solution:** Local scenario with synthetic records, decision prompts and feedback on process only.
8. **Architecture:** Offline exercise; no actual reviewer account or decision storage.
9. **Microtasks:** Define fictional case; write rubric; prototype; review cultural bias; evaluate comprehension.
10. **Acceptance:** Learner distinguishes source evidence, interpretation and policy decision in scenarios.
11. **DoD:** Content reviewer approves; no real personal case data.
12. **Tests:** Scenario branching and accessibility checks.
13. **Dependencies:** FUT-023; related ONT-007; no M20 authority integration.
14. **Risks:** Training output mistaken for certification; state no credential.
15. **Metrics:** Pre/post scenario classification and misconception count.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove module; no decisions persisted.
18. **Synergy:** Supports research and charity reviewer readiness.
19. **Anti-overlap:** No reviewer authority grant, case moderation or certification.
20. **Outcome:** Evidence about educational utility.
21. **Future:** Any deployment needs trainer/owner approval.
22. **Closure evidence:** Rubric, fictional cases and results.

## FUT-028 — Prototype an uncertainty-aware “living atlas”

**Canonical TODO task:** [M47-28](../../../TODO.md) — TODO is sole status source; `FUT-028` is only the V5 reference ID.

1. **Identity:** Wildcard; exploratory knowledge atlas; P3 / Complex / XL / confidence Low / risk High; domain 61, common 53; owner: ontology/research UX; V5-W2; atlas, moonshot.
2. **Executive:** Explore a navigable map of attributed concepts where contested and unknown relations are visually distinct.
3. **Current state:** Graph and ontology packages exist; no atlas experience or user demand verified.
4. **Problem:** Lists may hide relations, while maps risk implying certainty or hierarchy.
5. **Evidence:** R17 and PROV-O S09; innovation hypothesis only.
6. **Value:** Could support exploratory scholarship if the map communicates limits.
7. **Solution:** Synthetic 30-node map with provenance, disputed edges, filters and text equivalent.
8. **Architecture:** Disposable client projection; existing graph owner only.
9. **Microtasks:** Define neutral semantics; build mock; add text alternative; test interpretation; compare list/map; decide.
10. **Acceptance:** Users identify contested and unknown relations; map offers equivalent nonvisual path.
11. **DoD:** Ontology and accessibility reviewers approve semantics.
12. **Tests:** Edge-class rendering, keyboard traversal and comprehension test.
13. **Dependencies:** FUT-013; related FUT-021/ONT-009.
14. **Risks:** Visual hierarchy may encode bias; allow multiple views and no rank.
15. **Metrics:** Relation-class recall, accessibility completion and misreading rate.
16. **Estimate:** 10–20 days; strict prototype budget.
17. **Rollback:** Delete demo; no production projection.
18. **Synergy:** May bridge ontology and HCI.
19. **Anti-overlap:** Synthetic atlas projection only; reuses graph-owned fields, does not add cache behavior from FUT-021, and is distinct from ONT-009's provenance audit.
20. **Outcome:** Invest/no-invest evidence.
21. **Future:** Real data requires scholarly and rights approval.
22. **Closure evidence:** Demo, text equivalent, usability results and decision.

## FUT-029 — Explore a consent-preserving feedback loop for research tools

**Canonical TODO task:** [M47-29](../../../TODO.md) — TODO is sole status source; `FUT-029` is only the V5 reference ID.

1. **Identity:** Wildcard; feedback design; P2 / Medium / M / confidence Low / risk Medium; domain 67, common 65; owner: research UX/privacy; V5-W2; feedback, privacy.
2. **Executive:** Test anonymous/optional feedback on a synthetic research prototype without collecting source content or identity by default.
3. **Current state:** Community and feedback programs are not validated; no feedback pipeline reviewed.
4. **Problem:** Product teams need feedback, but default telemetry can collect sensitive text.
5. **Evidence:** ICRC S10 and CHS S11 by analogy; actual need UNKNOWN.
6. **Value:** Could gather actionable usability evidence with less data.
7. **Solution:** Prototype opt-in structured feedback with preview, omit, delete and no free-text default.
8. **Architecture:** Local mock; no analytics vendor, community identity or server collection.
9. **Microtasks:** Define minimal questions; mock preview/submit; test consent comprehension; map retention; go/no-go.
10. **Acceptance:** Participant understands what is sent; no submission occurs before explicit action.
11. **DoD:** Privacy and safeguarding review before any real collection.
12. **Tests:** Consent-state tests and data-field allowlist.
13. **Dependencies:** FUT-014; CHAR-001 is related.
14. **Risks:** Feedback may reveal sensitive data; no free text initially and provide stop/delete.
15. **Metrics:** Consent comprehension, submission completion and fields collected.
16. **Estimate:** 4–7 days; no external service cost.
17. **Rollback:** Remove prototype; discard all sample feedback.
18. **Synergy:** Informs future research and humanitarian discovery.
19. **Anti-overlap:** No M32 community moderation or production analytics.
20. **Outcome:** Design decision on a minimized feedback channel.
21. **Future:** Real participation only with approved protocol.
22. **Closure evidence:** Mock, data map and review decision.

## FUT-030 — Prototype portable evidence bundles with integrity checks

**Canonical TODO task:** [M47-30](../../../TODO.md) — TODO is sole status source; `FUT-030` is only the V5 reference ID.

1. **Identity:** Wildcard; portable provenance artifact; P2 / Hard / L / confidence Medium / risk Medium; domain 77, common 66; owner: research/provenance; V5-W2; provenance, archival.
2. **Executive:** Evaluate a compact bundle of synthetic citations, version refs and hashes that can be verified offline.
3. **Current state:** Source pins, release manifests and lineage concepts exist; integrated portable evidence was not demonstrated.
4. **Problem:** Research context can be separated from the mutable source environment.
5. **Evidence:** R13/R17, FAIR S13 and PROV-O S09.
6. **Value:** Improves auditability and durable scholarly handoff.
7. **Solution:** Build a synthetic signed-or-hashed manifest prototype; compare integrity-only vs signed issuer model.
8. **Architecture:** File artifact only; no identity service or blockchain.
9. **Microtasks:** Define fields; create bundle; alter fixture; verify failure; review signatures/keys; decide.
10. **Acceptance:** Tampering is detected; provenance and issuer are not conflated; no content is included without rights.
11. **DoD:** Key custody and threat assumptions documented.
12. **Tests:** Hash/tamper, schema and offline verification fixtures.
13. **Dependencies:** FUT-019; related ENG-016.
14. **Risks:** Hash may be misread as truth/authenticity; explain what it proves and does not.
15. **Metrics:** Tamper detection, bundle size and verification time.
16. **Estimate:** 5–10 days.
17. **Rollback:** Delete prototype keys/artifacts.
18. **Synergy:** Supports local-first research and provenance.
19. **Anti-overlap:** Tamper-evident evidence package with issuer/checksum verification only; keep its manifest contract distinct from FUT-019's local notes and FUT-026's user export. No blockchain, global identity or source authority.
20. **Outcome:** Portable evidence format go/no-go.
21. **Future:** Signing only with accountable issuer and key lifecycle.
22. **Closure evidence:** Bundle, tamper output, threat model and decision.
