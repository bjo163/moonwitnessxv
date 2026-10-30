# Domain E — Faith, Religion and Ontology (20)

Subdomain allocation: corpus/sources/provenance 5; ontology/graph/epistemology 5; interpretation/comparative/source criticism 3; exploration/education 3; governance/interpretive integrity 2; narrative/history/timeline 2. All proposals are PROPOSED planning, not implemented ontology/content. In every body, VERIFIED applies only to cited artifacts; theological/historical claims not researched remain UNKNOWN; recommendations are PROPOSED. This review consulted no sacred or primary religious text and makes no doctrinal/historical conclusion. All examples must be synthetic or rights-cleared; M16–20 rights, consent, review and publication gates remain authoritative.

Identity convention: the heading supplies ID/title; this file supplies the primary domain; the first identity phrases give subdomain/type. Identity lines include priority, difficulty, effort, confidence, risk, domain/common score, owner and proposed V5 wave. Trailing tags are suggested labels. The suggested wave is not a TODO milestone. Implementation maturity for all entries is PROPOSED.

## ONT-001 — Define a canonical source and edition identity profile

1. **Identity:** Faith/Ontology; source provenance; P1 / Medium / M / confidence Medium / risk High; domain 84, common 83; owner: corpus; V5-W0; source, citation.
2. **Executive:** Define the minimum fields that identify a source, edition, manifestation and immutable version.
3. **Current state:** Source pins and corpus/witness packages exist; selected historical refs could not be resolved by connector.
4. **Problem:** Citation ambiguity makes it hard to tell which exact artifact supports a claim.
5. **Evidence:** R13/R17; TEI P5 S08; pin cause/rights remain UNKNOWN.
6. **Value:** Supports scholarly reproducibility without claiming source authority.
7. **Solution:** Compare existing models and propose identifiers, edition metadata, date precision, language, rights state and resolution evidence.
8. **Architecture:** Contract mapping for existing corpus owner; no global source catalog.
9. **Microtasks:** Inventory fields; map source/edition/witness; test ambiguous IDs; consult scholar; record unresolved pins.
10. **Acceptance:** Two distinct editions cannot share an identity; unresolved fields remain UNKNOWN.
11. **DoD:** Corpus owner and qualified textual scholar review definitions.
12. **Tests:** Synthetic identity uniqueness and serialization fixtures.
13. **Dependencies:** ENG-002/005; enables ONT-002.
14. **Risks:** Imposed schema may erase tradition-specific distinctions; allow extension and document profile limits.
15. **Metrics:** Required identity fields covered and unresolved examples.
16. **Estimate:** 4–8 days.
17. **Rollback:** Keep profile as proposal; no stored data migrated.
18. **Synergy:** Supports AI citations, research exports and history.
19. **Anti-overlap:** Not source acquisition, rights approval, or M18 rights storage.
20. **Outcome:** Reviewed identity profile or no-go.
21. **Future:** Mappings to external catalogs only after rights/authority review.
22. **Closure evidence:** Field map, synthetic cases and scholar sign-off.

## ONT-002 — Model text, witness, edition and manifestation distinctions

1. **Identity:** Faith/Ontology; corpus provenance; P2 / Hard / L / confidence Medium / risk High; domain 80, common 71; owner: corpus/witness; V5-W1; corpus, ontology.
2. **Executive:** Specify how one textual work relates to witnesses, editions, transcriptions and digitized manifestations.
3. **Current state:** Witness-lineage and corpus modules exist; full scholarly model was not audited.
4. **Problem:** Treating a web page, manuscript image and edited text as the same object loses evidence history.
5. **Evidence:** R17 and TEI P5 S08; no manuscript source reviewed.
6. **Value:** Enables citations that identify what was actually consulted.
7. **Solution:** Produce a small conceptual model with explicit relations and example records.
8. **Architecture:** Extend existing MoonQL corpus/witness boundary only after owner review.
9. **Microtasks:** Map current types; define relation semantics; create synthetic examples; identify lossy cases; review.
10. **Acceptance:** Examples distinguish work, witness, edition, transcription and digital file; no identity inferred from title alone.
11. **DoD:** Textual studies reviewer and package owner approve.
12. **Tests:** Schema and referential-integrity fixtures.
13. **Dependencies:** ONT-001; external gate M16/M18 for real content.
14. **Risks:** Some traditions do not fit a single textual genealogy; preserve multiple relationships.
15. **Metrics:** Example coverage and ambiguous identities.
16. **Estimate:** 5–10 days.
17. **Rollback:** Retain model as proposal; no migration.
18. **Synergy:** Supports provenance, citation and comparative research.
19. **Anti-overlap:** Not a new corpus store or source rights decision.
20. **Outcome:** Clear distinction model suitable for expert review.
21. **Future:** Tradition-specific profiles after consultation.
22. **Closure evidence:** Model diagram, examples and review record.

## ONT-003 — Specify translation and transcription provenance fields

1. **Identity:** Faith/Ontology; source provenance; P2 / Medium / M / confidence Medium / risk High; domain 78, common 73; owner: corpus; V5-W1; translation, provenance.
2. **Executive:** Define attribution and version fields for translations, transliterations and transcriptions.
3. **Current state:** Bilingual products exist; no complete translation provenance audit was performed.
4. **Problem:** Language labels alone do not identify translator, edition, method or revision.
5. **Evidence:** R17, TEI S08 and FAIR S13; no sacred text was reviewed.
6. **Value:** Prevents machine or human rendering from being mistaken for a source original.
7. **Solution:** Draft a source-neutral field profile and an explicit unknown/anonymous-translator state.
8. **Architecture:** Mapping to corpus metadata; no translation-generation feature.
9. **Microtasks:** Inventory fields; distinguish translation/transliteration; specify contributor/edition/version; test uncertain attribution; review.
10. **Acceptance:** A record cannot be labeled original-language text when its status is unknown.
11. **DoD:** Language and textual reviewers approve terms.
12. **Tests:** Synthetic validation for missing translator, revision and language tag.
13. **Dependencies:** ONT-001/002; related FUT-006.
14. **Risks:** Attribution may be contested or collective; support uncertainty and tradition-specific practice.
15. **Metrics:** Provenance completeness, with unknowns counted honestly.
16. **Estimate:** 4–7 days.
17. **Rollback:** Keep metadata proposal unimplemented.
18. **Synergy:** Supports multilingual reader and research export.
19. **Anti-overlap:** Does not generate or license translations; distinct from M17/M18 rights storage.
20. **Outcome:** Reviewed provenance fields.
21. **Future:** Integrate with specific editions after rights review.
22. **Closure evidence:** Profile, examples and reviewer note.

## ONT-004 — Specify citation snapshots and version-change behavior

1. **Identity:** Faith/Ontology; source citation stability; P2 / Medium / M / confidence Medium / risk Medium; domain 76, common 71; owner: research/corpus; V5-W1; citation, versioning.
2. **Executive:** Define how a citation stays resolvable when an edition or digital transcription changes.
3. **Current state:** Source labels and release manifests exist; end-user citation stability was not demonstrated.
4. **Problem:** A link that silently points to revised content can make past analysis irreproducible.
5. **Evidence:** R17, PROV-O S09 and TEI S08.
6. **Value:** Preserves scholarly audit trails.
7. **Solution:** Use immutable version refs plus a clear “current version” relation and change note.
8. **Architecture:** Reuse source identity profile; no URL shortener or external archive dependency.
9. **Microtasks:** Model revision case; define stable locator; test removed/changed span; document citation rendering.
10. **Acceptance:** Old citation resolves to its recorded version or explicitly reports unavailable; it never silently retargets.
11. **DoD:** Corpus owner approves retention/access behavior.
12. **Tests:** Version change and missing-source fixtures.
13. **Dependencies:** ONT-001; M18 publication gate applies to public citations.
14. **Risks:** Retention can conflict with rights or withdrawal; refer to existing authority.
15. **Metrics:** Citations resolving to exact version and explicit unavailable states.
16. **Estimate:** 4–8 days.
17. **Rollback:** Preserve prior citation semantics; do not rewrite old refs.
18. **Synergy:** Supports history, scholarship and AI evaluation.
19. **Anti-overlap:** Does not implement M18 revocation/cache behavior.
20. **Outcome:** Version-stable citation rule.
21. **Future:** Persistent archive only with rights/legal approval.
22. **Closure evidence:** Test cases, policy and owner sign-off.

## ONT-005 — Audit corpus inventory completeness without asserting authority

1. **Identity:** Faith/Ontology; source inventory; P2 / Medium / M / confidence Low / risk Medium; domain 70, common 65; owner: corpus/research; V5-W1; inventory, research.
2. **Executive:** Produce a metadata-only map of source families, versions and known gaps in the current repository.
3. **Current state:** Corpus packages exist; no full source inventory was completed in this pass.
4. **Problem:** Users may mistake an incomplete inventory for comprehensive coverage.
5. **Evidence:** R17 and research source scan limits; no sacred text reviewed.
6. **Value:** Makes absence and scope visible.
7. **Solution:** Inventory only approved metadata and mark not reviewed, unavailable, contested or rights-unknown states.
8. **Architecture:** Read-only report from existing records; no source ingestion.
9. **Microtasks:** Agree scope; enumerate metadata; classify evidence; identify missing provenance; review wording.
10. **Acceptance:** Every row states review status and rights state; no completeness claim without denominator.
11. **DoD:** Corpus and rights owners approve scope; confidential sources excluded.
12. **Tests:** Inventory parser and missing-state fixtures.
13. **Dependencies:** ONT-001; related ENG-005.
14. **Risks:** Inventory itself may reveal sensitive/private material; publish only approved metadata.
15. **Metrics:** Records with known source/version status and unknown count.
16. **Estimate:** 4–8 days.
17. **Rollback:** Withhold report if classification or rights is unclear.
18. **Synergy:** Guides research planning and source selection.
19. **Anti-overlap:** Not M19 public-source release, corpus import or theological canon.
20. **Outcome:** Scoped inventory with gaps explicit.
21. **Future:** Expand after rights clearance and scholarly review.
22. **Closure evidence:** Approved scope, inventory and gap list.

## ONT-006 — Define neutral entity identity and disambiguation rules

1. **Identity:** Faith/Ontology; ontology/entity resolution; P2 / Hard / L / confidence Medium / risk High; domain 81, common 68; owner: MoonQL ontology; V5-W1; ontology, identity.
2. **Executive:** Specify how an entity is distinguished from aliases, homonyms and interpretations.
3. **Current state:** Ontology and UNILEX packages contain entity/term concepts; no cross-package audit was done.
4. **Problem:** Name matching can incorrectly merge people, places, traditions or concepts.
5. **Evidence:** R17; no identity-error rate measured.
6. **Value:** Prevents false equivalence in research graphs.
7. **Solution:** Define stable IDs, alias provenance, confidence, merge review and reversible candidate state.
8. **Architecture:** Existing ontology package; no third SQL owner or central identity provider.
9. **Microtasks:** Inventory current types; define candidate/accepted distinction; create synthetic collisions; review merge/reversal.
10. **Acceptance:** Similar labels alone never auto-merge; every alias has source and reviewer/state.
11. **DoD:** Ontology owner approves semantics; no production merge.
12. **Tests:** Collision, alias, language and rollback fixtures.
13. **Dependencies:** ENG-015 and FUT-015; enables ONT-007.
14. **Risks:** Identity model imposes tradition-specific assumptions; make uncertainty explicit.
15. **Metrics:** False merge fixture rate and unresolved candidate count.
16. **Estimate:** 6–12 days.
17. **Rollback:** Candidate mapping reversible; accepted records unchanged.
18. **Synergy:** Supports comparison and knowledge navigation.
19. **Anti-overlap:** Not M20-04 reviewer panel or identity/authentication system.
20. **Outcome:** Reviewed disambiguation rules.
21. **Future:** Human-reviewed candidate tooling after authority gates.
22. **Closure evidence:** Rule set, fixture results and scholarly review.

## ONT-007 — Separate claim, evidence, interpretation and tradition records

1. **Identity:** Faith/Ontology; epistemology model; P1 / Hard / L / confidence Medium / risk High; domain 88, common 80; owner: MoonQL research/ontology; V5-W1; epistemology, provenance.
2. **Executive:** Map current records to distinct source evidence, attributed claims, interpretations and tradition context.
3. **Current state:** Project distinguishes testimony/evidence/fiction in guidance; a complete cross-package mapping was not verified.
4. **Problem:** A data relation can be mistaken for proof or an attributed interpretation for source text.
5. **Evidence:** BLUEPRINT and M16-07 TODO R02/R03; M16-07 remains open.
6. **Value:** Protects source integrity across AI, graphs and UI.
7. **Solution:** Produce a schema mapping and missing-state examples; defer projection labels until M16-07 is resolved.
8. **Architecture:** Reuse existing epistemic classes; no parallel classification enum.
9. **Microtasks:** Inventory types; map class semantics; identify ambiguous records; review examples; record blockers.
10. **Acceptance:** Every example has one explicit class or remains unlabelled/withheld; no silent conversion.
11. **DoD:** Ontology and rights owners approve mapping; no production projection changed.
12. **Tests:** Pure mapping fixtures for missing, unknown and conflicting labels.
13. **Dependencies:** FUT-009/027; external gate M16-07; enables ONT-008.
14. **Risks:** Category definitions may be contested; attribute framework and reviewer scope.
15. **Metrics:** Records mapped/unknown and invalid class transition count.
16. **Estimate:** 6–12 days.
17. **Rollback:** Keep mapping proposal only; no schema migration.
18. **Synergy:** Supports every domain that presents knowledge claims.
19. **Anti-overlap:** Does not redo the M16-07 projection label contract.
20. **Outcome:** Cross-package epistemic mapping and unresolved questions.
21. **Future:** Implementation only under existing class authority.
22. **Closure evidence:** Mapping, fixtures and owner review.

## ONT-008 — Represent contested claims as attributed parallel positions

1. **Identity:** Faith/Ontology; epistemology/contestation; P2 / Hard / L / confidence Medium / risk High; domain 82, common 71; owner: ontology/research; V5-W1; contested, attribution.
2. **Executive:** Specify how incompatible scholarly or tradition-specific positions remain separately attributable.
3. **Current state:** Contested/unknown labels are prescribed by the V5 brief; current schema coverage is unknown.
4. **Problem:** One canonical answer may erase a live disagreement.
5. **Evidence:** R03/R17; no doctrinal issue reviewed.
6. **Value:** Enables honest comparative inquiry.
7. **Solution:** Model positions, proponents, source refs, scope, date and response/critique links without majority ranking.
8. **Architecture:** Proposed extension to existing claim/research records; no consensus engine.
9. **Microtasks:** Create synthetic disagreement; map current schema; test multiple positions; review ordering and attribution.
10. **Acceptance:** Both positions remain visible; disagreement is not averaged or resolved by vote.
11. **DoD:** Qualified researchers approve terminology and attribution.
12. **Tests:** Round-trip multiple claims and critique relations.
13. **Dependencies:** ONT-007; related FUT-023.
14. **Risks:** False balance or selective representation; source quality and scope must remain visible.
15. **Metrics:** Position attribution completeness and reviewer misinterpretation.
16. **Estimate:** 5–10 days.
17. **Rollback:** Remove proposed extension; current records unchanged.
18. **Synergy:** Supports education and interpretive transparency.
19. **Anti-overlap:** Not a voting/reviewer authority system.
20. **Outcome:** Reviewable contested-claim representation.
21. **Future:** Tradition profiles require community/scholar consultation.
22. **Closure evidence:** Synthetic examples, mapping and review record.

## ONT-009 — Make graph edges traceable to source and reasoning

1. **Identity:** Faith/Ontology; graph provenance; P1 / Hard / L / confidence Medium / risk High; domain 83, common 77; owner: MoonQL Graph; V5-W1; graph, evidence.
2. **Executive:** Ensure a displayed graph edge identifies whether it comes directly from a source, editorial assertion or derived rule.
3. **Current state:** Graph/ontology packages exist; cross-projection traceability not audited.
4. **Problem:** An edge can look like independent proof even when inferred from another record.
5. **Evidence:** R17 and PROV-O S09; no graph claim reviewed here.
6. **Value:** Makes knowledge relations inspectable.
7. **Solution:** Add a provenance reference and relation-kind requirement to a synthetic projection.
8. **Architecture:** Existing graph projection; no new graph store.
9. **Microtasks:** Inventory edge creation; classify source; add fixture refs; test omission behavior; review user meaning.
10. **Acceptance:** Missing source/reasoning leaves edge withheld or explicitly unknown.
11. **DoD:** Graph owner and researcher approve relation semantics.
12. **Tests:** Projection tests for direct, editorial, derived and unknown edges.
13. **Dependencies:** ENG-020 and ONT-008; enables ONT-010.
14. **Risks:** Provenance fields can be falsely treated as validation; explain source vs proof.
15. **Metrics:** Edges with complete provenance and withheld count.
16. **Estimate:** 5–10 days.
17. **Rollback:** Hide new edge type; retain existing records.
18. **Synergy:** Supports source-first navigation and citation AI.
19. **Anti-overlap:** No ontology redesign or inference engine.
20. **Outcome:** Traceable edge semantics.
21. **Future:** Add richer reasoning graph only after evidence.
22. **Closure evidence:** Synthetic projections, tests and reviewer sign-off.

## ONT-010 — Evaluate a PROV-O mapping for existing provenance records

1. **Identity:** Faith/Ontology; provenance interoperability; P2 / Hard / L / confidence Medium / risk Medium; domain 76, common 66; owner: research/corpus; V5-W1; prov-o, interoperability.
2. **Executive:** Compare a small set of MoonWitness provenance events with W3C PROV-O concepts.
3. **Current state:** Source lineage/release records exist; no PROV-O mapping was performed.
4. **Problem:** Adopting an external vocabulary wholesale may lose domain meaning or create duplication.
5. **Evidence:** W3C PROV-O S09 and R17.
6. **Value:** Determines whether interoperability benefits justify a mapping.
7. **Solution:** Map three synthetic activities/entities/agents and list unmapped concepts.
8. **Architecture:** Optional export vocabulary only; existing package remains canonical.
9. **Microtasks:** Select events; map terms; validate graph; note semantics lost; recommend adopt/mapping/no-go.
10. **Acceptance:** Every mapping has rationale; no exported term silently claims stronger provenance.
11. **DoD:** Package owner and provenance researcher approve.
12. **Tests:** Fixture validation against published vocabulary terms.
13. **Dependencies:** ENG-012 and ONT-009.
14. **Risks:** External term drift and false equivalence.
15. **Metrics:** Mapped concepts and unresolved semantics.
16. **Estimate:** 4–8 days.
17. **Rollback:** Drop exporter; current records unaffected.
18. **Synergy:** Can support portable research outputs.
19. **Anti-overlap:** No new provenance database or system of record.
20. **Outcome:** Evidence-based interoperability decision.
21. **Future:** Implement exporter only after a concrete consumer exists.
22. **Closure evidence:** Mapping table, validator output and decision.

## ONT-011 — Prepare a source-critical review protocol for contested material

1. **Identity:** Faith/Ontology; source criticism; P2 / Hard / L / confidence Low / risk High; domain 77, common 72; owner: scholarly review lead; V5-W2; source-criticism, research.
2. **Executive:** Define how a future study distinguishes primary artifact, edition, translation, scholarly claim and tradition-specific interpretation.
3. **Current state:** No primary religious source was reviewed in this planning pass.
4. **Problem:** Secondary summaries can be mistaken for primary evidence.
5. **Evidence:** TEI S08 and source inventory limits; no doctrine asserted.
6. **Value:** Sets a rigorous method before comparative content work.
7. **Solution:** Create a review checklist with exact citation, edition/version, method, counterevidence and uncertainty fields.
8. **Architecture:** Human research protocol; no automated authority score.
9. **Microtasks:** Consult qualified scholars; draft checklist; test against fictional case; revise bias/conflict section.
10. **Acceptance:** Reviewer can distinguish source observation, inference and interpretation in sample.
11. **DoD:** Qualified domain reviewers approve and note tradition limitations.
12. **Tests:** Tabletop case and reviewer agreement check.
13. **Dependencies:** ONT-001/007; related FUT-008.
14. **Risks:** One tradition’s method may be generalized inappropriately.
15. **Metrics:** Classification agreement and unresolved method questions.
16. **Estimate:** 5–10 days plus expert review.
17. **Rollback:** Withdraw protocol if consultation is inadequate.
18. **Synergy:** Protects knowledge integrity across ontology/AI experiences.
19. **Anti-overlap:** Not content moderation or publication authorization.
20. **Outcome:** Review process or explicit no-go for comparative research.
21. **Future:** Tradition-specific protocols co-designed with qualified communities.
22. **Closure evidence:** Protocol, fictional test case and reviewers.

## ONT-012 — Define attribution for comparative religious claims

1. **Identity:** Faith/Ontology; comparative studies; P2 / Hard / L / confidence Low / risk High; domain 75, common 69; owner: scholarly review; V5-W2; comparative, attribution.
2. **Executive:** Specify what context must accompany a comparative statement so it is not presented as universal consensus.
3. **Current state:** No comparative claims were authored or verified in this review.
4. **Problem:** Broad labels can erase internal diversity and historical change.
5. **Evidence:** Research-method gap; no sacred sources consulted.
6. **Value:** Encourages careful, attributed scholarship.
7. **Solution:** Develop a fictional-example rubric for tradition, subtradition, geography, period, source, author and disagreement.
8. **Architecture:** Content review protocol; no user belief profile or ranking.
9. **Microtasks:** Draft rubric; test fictional statements; consult diverse scholars; identify missing context; revise.
10. **Acceptance:** Samples cannot be read as universal when evidence supports only a bounded group/time.
11. **DoD:** Cultural/religious sensitivity review and documented limits.
12. **Tests:** Reviewer interpretation of fictional examples.
13. **Dependencies:** ONT-011; related FUT-023.
14. **Risks:** Checklist can create false completeness; require narrative caveat where needed.
15. **Metrics:** Attribution completeness and overgeneralization flags.
16. **Estimate:** 4–8 days.
17. **Rollback:** Keep rubric as draft; no content projection.
18. **Synergy:** Supports comparative education.
19. **Anti-overlap:** Not a theological ontology or authority decision.
20. **Outcome:** Tested attribution guidance.
21. **Future:** Validation with relevant scholarly communities before use.
22. **Closure evidence:** Rubric, fictional cases and reviewer notes.

## ONT-013 — Create a translation-variant review exercise

1. **Identity:** Faith/Ontology; source criticism; P2 / Hard / L / confidence Low / risk High; domain 73, common 65; owner: textual research; V5-W2; translation, study.
2. **Executive:** Test a human review workflow for comparing two authorized translation records without producing a “correct” interpretation.
3. **Current state:** Translation provenance is not comprehensively documented; no text sample was consulted here.
4. **Problem:** Readers may treat a translation variation as an error or consensus without context.
5. **Evidence:** TEI P5 S08; source selection and rights remain UNKNOWN.
6. **Value:** Supports textual literacy and cautious comparison.
7. **Solution:** Use synthetic paraphrases or a cleared short sample to label translator/edition/date and reviewer notes.
8. **Architecture:** Research exercise; no generated translation or public feature.
9. **Microtasks:** Secure sample; record edition data; compare variants; annotate uncertainty; review with qualified specialist.
10. **Acceptance:** Difference is described without ranking unless evidence and reviewer justify it.
11. **DoD:** Rights, language specialist and cultural reviewer approve.
12. **Tests:** Metadata completeness and reviewer walkthrough.
13. **Dependencies:** ONT-003 and ONT-011; related FUT-006.
14. **Risks:** Context loss, copyright and theological overreach.
15. **Metrics:** Provenance completeness and interpretation disagreement.
16. **Estimate:** 5–10 days plus rights/expert access.
17. **Rollback:** Remove sample; retain only synthetic method example.
18. **Synergy:** Connects source integrity and reader education.
19. **Anti-overlap:** Not translation generation, alignment automation or M18 rights storage.
20. **Outcome:** Human workflow decision and known limits.
21. **Future:** Broader studies require rights and tradition review.
22. **Closure evidence:** Cleared/synthetic sample, annotations and sign-off.

## ONT-014 — Prototype a citation-first compare view

1. **Identity:** Exploration/Education; source comparison UX; P2 / Medium / M / confidence Medium / risk Medium; domain 75, common 68; owner: Dock/research UX; V5-W2; compare, citation.
2. **Executive:** Test a side-by-side view that keeps source versions and attribution visible while comparing two synthetic records.
3. **Current state:** Dock comparison is withheld under existing rights/publication gates.
4. **Problem:** A compare view can obscure which edition or source each panel represents.
5. **Evidence:** M19 TODO, MASTER_DESIGN R04; no real source used.
6. **Value:** Helps researchers compare without conflating editions.
7. **Solution:** Build local mock with persistent citation header, differences and unknown fields.
8. **Architecture:** Static prototype only; no Dock route or publication.
9. **Microtasks:** Create synthetic pair; build view; test scroll/context; check screen reader; review.
10. **Acceptance:** Each panel retains edition/version when scrolling; unmatched fields remain explicit.
11. **DoD:** Rights/status labels included as demo data only.
12. **Tests:** Layout/state tests and keyboard usability.
13. **Dependencies:** FUT-008; external M19 gate for any real data.
14. **Risks:** Compare implies equivalence; label differences and scope.
15. **Metrics:** Edition identification accuracy and context-loss rate.
16. **Estimate:** 4–8 days.
17. **Rollback:** Delete prototype.
18. **Synergy:** Supports research and education.
19. **Anti-overlap:** Does not implement M19 Dock compare/publication.
20. **Outcome:** Interaction/no-go decision.
21. **Future:** Production only after D08 and rights approval.
22. **Closure evidence:** Mock, usability notes and boundary review.

## ONT-015 — Test provenance-aware search facets

1. **Identity:** Exploration/Education; knowledge discovery; P2 / Medium / M / confidence Low / risk Medium; domain 70, common 65; owner: research UX/search; V5-W2; search, provenance.
2. **Executive:** Explore filters for language, source type, version and evidence class on synthetic records.
3. **Current state:** Search capabilities exist in the ecosystem; this facet behavior was not verified.
4. **Problem:** Relevance ranking can hide source differences unless users can narrow evidence context.
5. **Evidence:** R17 and FAIR S13; user need unknown.
6. **Value:** Supports transparent discovery rather than popularity ranking.
7. **Solution:** Mock facets over a small synthetic dataset and compare task completion with plain search.
8. **Architecture:** UX study only; no search index or taxonomy change.
9. **Microtasks:** Define neutral fields; create fake records; prototype; test retrieval tasks; examine bias.
10. **Acceptance:** Filters never imply authority; unknown metadata remains filterable as unknown.
11. **DoD:** Search/ontology owner reviews categories.
12. **Tests:** Facet semantics and accessible control review.
13. **Dependencies:** ONT-001/007.
14. **Risks:** Missing metadata hides sources; present unknown explicitly.
15. **Metrics:** Source findability, filter error and metadata coverage.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove mock.
18. **Synergy:** Helps research and education without AI ranking.
19. **Anti-overlap:** No search backend rebuild.
20. **Outcome:** Evidence on whether facets add value.
21. **Future:** Integrate only with authoritative data fields.
22. **Closure evidence:** Dataset, task results and owner decision.

## ONT-016 — Design a source-literacy learning module

1. **Identity:** Exploration/Education; research literacy; P2 / Medium / M / confidence Low / risk Low; domain 68, common 63; owner: education/research; V5-W2; education, provenance.
2. **Executive:** Develop a short lesson teaching source, edition, interpretation and uncertainty distinctions.
3. **Current state:** No curriculum was evaluated.
4. **Problem:** Users may need context to interpret citations responsibly.
5. **Evidence:** TEI S08, FAIR S13 and project boundaries; educational efficacy unverified.
6. **Value:** Improves independent evaluation rather than dependence on system summaries.
7. **Solution:** Create three fictional examples and a self-check explanation.
8. **Architecture:** Static content prototype; no user profiles, score or belief assessment.
9. **Microtasks:** Define learning outcomes; draft examples; review neutrality; test comprehension; revise.
10. **Acceptance:** Learner distinguishes primary record, edition and interpretation in all fixture cases.
11. **DoD:** Scholar/accessibility review; no doctrinal advice.
12. **Tests:** Answer-key correctness, keyboard and plain-language review.
13. **Dependencies:** ONT-011/012.
14. **Risks:** Lesson presents one scholarly approach as universal; identify scope.
15. **Metrics:** Pre/post classification and confidence calibration.
16. **Estimate:** 4–7 days.
17. **Rollback:** Withdraw module; no learner data persisted.
18. **Synergy:** Supports every knowledge experience.
19. **Anti-overlap:** Not a religious instruction or curriculum claim.
20. **Outcome:** Tested learning artifact.
21. **Future:** Co-design with appropriate communities.
22. **Closure evidence:** Lesson, rubric and review.

## ONT-017 — Define a transparent review protocol for interpretive summaries

1. **Identity:** Governance/Interpretive integrity; scholarly review process; P1 / Hard / L / confidence Medium / risk High; domain 82, common 77; owner: research governance; V5-W2; review, attribution.
2. **Executive:** Specify how human reviewers check attribution, evidence scope and disagreement in a future interpretive summary.
3. **Current state:** Project has reviewer and publication gates; no summary protocol was tested in this pass.
4. **Problem:** Review approval can be mistaken for universal truth or public-release permission.
5. **Evidence:** ADR index, M18/M20 TODO and CHS-style accountability only by analogy; no review is claimed.
6. **Value:** Separates scholarly quality review from authorization.
7. **Solution:** Create review checklist with reviewer expertise, conflicts, scope, dissent and decision limits.
8. **Architecture:** Process document; no reviewer grant store or UI.
9. **Microtasks:** Define review questions; separate content/rights/publication checks; test fictional summaries; record dissent process.
10. **Acceptance:** Review record states what was and was not reviewed; approval never implies D08 release.
11. **DoD:** Qualified reviewers and governance owner approve.
12. **Tests:** Tabletop cases for conflict, disagreement, missing evidence and publication.
13. **Dependencies:** ONT-011/012; M20 authority remains external.
14. **Risks:** Reviewer scarcity and authority concentration; allow unresolved/dissent outcomes.
15. **Metrics:** Checklist coverage and unresolved review questions.
16. **Estimate:** 5–10 days.
17. **Rollback:** Keep draft only; no summary released.
18. **Synergy:** Supports knowledge integrity and user trust.
19. **Anti-overlap:** Not M20 reviewer panel/store, M18 release decision or M16 projection label implementation.
20. **Outcome:** Review protocol or explicit no-go.
21. **Future:** Revisit with representative scholarly participation.
22. **Closure evidence:** Approved protocol and scenario results.

## ONT-018 — Establish source correction and version-history principles

1. **Identity:** Governance/Interpretive integrity; correction process; P2 / Hard / L / confidence Medium / risk High; domain 78, common 68; owner: corpus governance; V5-W2; corrections, integrity.
2. **Executive:** Define how an error in source metadata or attribution is corrected without concealing prior state.
3. **Current state:** Existing release and revocation contracts cover broader rights; exact correction workflow not audited.
4. **Problem:** Silent edits can break citations and trust; immutable retention can conflict with rights/withdrawal.
5. **Evidence:** R07/R09 and TODO M18; legal and rights-specific rules remain external.
6. **Value:** Makes corrections visible and traceable.
7. **Solution:** Draft separate correction classes: factual metadata, interpretive note, rights restriction and withdrawal.
8. **Architecture:** Governance mapping to existing version/revocation owners; no new history database.
9. **Microtasks:** Define classes; map authority; model synthetic correction; test citation behavior; review privacy/rights conflicts.
10. **Acceptance:** Each class has approver, user-facing notice and retention disposition; no silent overwrite.
11. **DoD:** Rights/privacy/research owners approve boundaries.
12. **Tests:** Tabletop cases; regression fixtures for synthetic version chain.
13. **Dependencies:** ONT-004/017; M18/M19 external gates.
14. **Risks:** Retaining withdrawn data may be unlawful or unsafe; existing authority takes precedence.
15. **Metrics:** Correction events with complete rationale and access disposition.
16. **Estimate:** 5–10 days.
17. **Rollback:** Do not implement until policy resolves conflicts.
18. **Synergy:** Supports provenance, citation stability and trust.
19. **Anti-overlap:** Does not replace M18 revocation/cache or M19 public rights work.
20. **Outcome:** Correction policy map with unresolved legal cases.
21. **Future:** Integrate only with accepted data authority.
22. **Closure evidence:** Correction matrix, scenario outcomes and sign-off.

## ONT-019 — Define historical date and calendar provenance

1. **Identity:** Narrative/History; chronology provenance; P2 / Medium / M / confidence Low / risk Medium; domain 70, common 68; owner: research/ontology; V5-W2; chronology, sources.
2. **Executive:** Specify how uncertain dates, calendar systems and conversion assumptions are represented.
3. **Current state:** No historical timeline content was reviewed in this pass.
4. **Problem:** A single normalized date can conceal disputed chronology or conversion choices.
5. **Evidence:** Research gap; no historical claim or sacred text cited.
6. **Value:** Makes later timelines more transparent.
7. **Solution:** Draft a date record with original expression, calendar, conversion method, range, source and disagreement.
8. **Architecture:** Data-profile proposal within existing ontology/corpus owners.
9. **Microtasks:** Create synthetic calendar cases; define range semantics; record conversion provenance; review with historian.
10. **Acceptance:** Uncertain date stays a range/unknown; conversion is reproducible from stated method.
11. **DoD:** Qualified historian reviews terms and examples.
12. **Tests:** Date range, calendar and conversion fixtures.
13. **Dependencies:** ONT-001/011.
14. **Risks:** Calendar conversion may imply false precision or culturally privilege one epoch.
15. **Metrics:** Dates with source/method and uncertainty fields.
16. **Estimate:** 4–8 days.
17. **Rollback:** Keep profile proposal; no historical records changed.
18. **Synergy:** Supports any future history/knowledge timeline.
19. **Anti-overlap:** No historical assertions or religious chronology production.
20. **Outcome:** Reviewed chronology metadata profile.
21. **Future:** Populate only from scholarly sources after rights review.
22. **Closure evidence:** Synthetic examples, tests and historian note.

## ONT-020 — Prototype a timeline that displays uncertain dates honestly

1. **Identity:** Narrative/History; uncertainty-aware timeline; P2 / Hard / L / confidence Low / risk Medium; domain 71, common 63; owner: research UX; V5-W2; timeline, visualization.
2. **Executive:** Test whether users can interpret date ranges, contested ordering and unknown dates in a synthetic history view.
3. **Current state:** No timeline feature/content was validated.
4. **Problem:** A line with exact points can make uncertain chronology appear settled.
5. **Evidence:** ONT-019 profile proposal; no real timeline source reviewed.
6. **Value:** Could support research while showing limits.
7. **Solution:** Build a non-interactive mock with ranges, multiple calendar labels and text table alternative.
8. **Architecture:** Static visualization over synthetic records; no new history service.
9. **Microtasks:** Create fictional dataset; render ranges/contested ordering; test comprehension; check screen reader; decide.
10. **Acceptance:** Users identify uncertain ranges and can read same facts in text alternative.
11. **DoD:** Historian and accessibility review; no real claims included.
12. **Tests:** Date-range rendering and keyboard/text alternative checks.
13. **Dependencies:** ONT-019; related FUT-025.
14. **Risks:** Layout implies a canonical chronology; offer parallel ordering and explicit source labels.
15. **Metrics:** Date uncertainty comprehension and order misread rate.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove prototype.
18. **Synergy:** Supports education and historical research.
19. **Anti-overlap:** No Empire Web rebuild, story canon change or publication.
20. **Outcome:** Visualization/no-go evidence.
21. **Future:** Real content requires source, rights and scholarly review.
22. **Closure evidence:** Mock, synthetic data, results and review.
