# Report 11 — Exact 100-Issue Master Matrix

All rows are proposed candidates. Scores are heuristic planning scores, not observed outcomes. Evidence states the strongest basis, not a claim that the task is already proven necessary. Full specifications appear in exactly one domain file.

| Rank | Issue ID | Title | Domain | Category | Priority | Difficulty | Effort | Domain score | Common score | U (20%) | V (20%) | A (20%) | R (15%) | D (15%) | E (10%) | Evidence | Milestone |
|---:|---|---|---|---|---|---|---|---:|---:|---|---|
| 1 | ENG-001 | Reconcile repository task and milestone counts | Engineering | Reliability | P1 | Easy | S | 82 | 80 | 7 | 8 | 9 | 8 | 7 | 9 | 9 | VERIFIED: docs count conflict |
| 2 | ENG-002 | Add a read-only task-register consistency check | Engineering | Reliability | P2 | Medium | M | 74 | 70 | 5 | 7 | 9 | 6 | 8 | 7 | 7 | UNKNOWN / proposed validation |
| 3 | ENG-003 | Align M38–M40 maturity statements to evidence | Engineering | Reliability | P1 | Medium | M | 84 | 80 | 8 | 8 | 9 | 8 | 7 | 7 | 8 | VERIFIED: maturity-doc conflict |
| 4 | ENG-004 | Verify LUMEN runtime maturity claims | Engineering | Reliability | P2 | Medium | M | 72 | 72 | 6 | 7 | 9 | 6 | 8 | 7 | 6 | UNKNOWN / proposed validation |
| 5 | ENG-005 | Resolve source pins to immutable full references | Engineering | Reliability | P1 | Medium | M | 83 | 79 | 9 | 8 | 9 | 6 | 7 | 7 | 8 | VERIFIED: lookup failed; cause UNKNOWN |
| 6 | ENG-006 | Specify and test a stable API error envelope | Engineering | Reliability | P2 | Medium | M | 68 | 68 | 6 | 7 | 9 | 4 | 7 | 7 | 7 | UNKNOWN / proposed validation |
| 7 | ENG-007 | Define readiness semantics for health endpoints | Engineering | Reliability | P2 | Medium | S | 66 | 67 | 6 | 7 | 9 | 4 | 5 | 9 | 6 | UNKNOWN / proposed validation |
| 8 | ENG-008 | Audit log fields for privacy-safe diagnostics | Engineering | Security & Privacy | P1 | Medium | M | 81 | 80 | 9 | 8 | 9 | 6 | 8 | 7 | 7 | UNKNOWN / proposed validation |
| 9 | ENG-009 | Enforce least-privilege AI tool manifests | Engineering | Security & Privacy | P1 | Hard | L | 84 | 80 | 9 | 8 | 9 | 6 | 9 | 5 | 8 | UNKNOWN / proposed validation |
| 10 | ENG-010 | Inventory browser security headers and CSP safely | Engineering | Security & Privacy | P2 | Medium | M | 73 | 71 | 6 | 7 | 9 | 6 | 7 | 7 | 7 | UNKNOWN / proposed validation |
| 11 | ENG-011 | Produce dependency provenance and license inventory | Engineering | Security & Privacy | P2 | Medium | M | 75 | 68 | 6 | 7 | 9 | 6 | 5 | 7 | 7 | UNKNOWN / proposed validation |
| 12 | ENG-012 | Add adversarial contract tests for AI input boundaries | Engineering | Security & Privacy | P1 | Hard | L | 83 | 78 | 9 | 8 | 9 | 6 | 8 | 5 | 7 | UNKNOWN / proposed validation |
| 13 | ENG-013 | Document API compatibility and deprecation rules | Engineering | Architecture & Contracts | P2 | Medium | S | 70 | 71 | 5 | 7 | 9 | 6 | 7 | 9 | 6 | UNKNOWN / proposed validation |
| 14 | ENG-014 | Check generated API schemas against route contracts | Engineering | Architecture & Contracts | P2 | Hard | L | 77 | 69 | 6 | 7 | 9 | 6 | 7 | 5 | 7 | UNKNOWN / proposed validation |
| 15 | ENG-015 | Add package ownership metadata to workspace inventory | Engineering | Architecture & Contracts | P2 | Medium | M | 73 | 70 | 5 | 7 | 9 | 6 | 8 | 7 | 7 | UNKNOWN / proposed validation |
| 16 | ENG-016 | Define stable serialization for provenance records | Engineering | Architecture & Contracts | P2 | Hard | L | 76 | 69 | 6 | 7 | 9 | 6 | 7 | 5 | 7 | UNKNOWN / proposed validation |
| 17 | ENG-017 | Validate application environment configuration at startup | Engineering | Architecture & Contracts | P2 | Medium | M | 70 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 7 | UNKNOWN / proposed validation |
| 18 | ENG-018 | Establish a representative corpus ingestion benchmark | Engineering | Performance | P2 | Medium | M | 67 | 66 | 5 | 7 | 9 | 4 | 7 | 7 | 6 | UNKNOWN / proposed validation |
| 19 | ENG-019 | Bound object streaming memory and cancellation | Engineering | Performance | P2 | Hard | L | 69 | 66 | 6 | 7 | 9 | 4 | 7 | 5 | 6 | UNKNOWN / proposed validation |
| 20 | ENG-020 | Measure graph query fan-out and enforce safe limits | Engineering | Performance | P2 | Hard | L | 72 | 69 | 6 | 7 | 9 | 4 | 9 | 5 | 6 | UNKNOWN / proposed validation |
| 21 | ENG-021 | Add route bundle-size budgets to selected web apps | Engineering | Performance | P2 | Medium | M | 66 | 66 | 5 | 7 | 9 | 4 | 7 | 7 | 6 | UNKNOWN / proposed validation |
| 22 | ENG-022 | Audit keyboard and zoom access in Orbit operations | Engineering | UI/UX & Accessibility | P2 | Medium | M | 68 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | UNKNOWN / proposed validation |
| 23 | ENG-023 | Audit accessible names in Sentinel review controls | Engineering | UI/UX & Accessibility | P2 | Medium | M | 67 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | UNKNOWN / proposed validation |
| 24 | ENG-024 | Audit focus and reduced-motion behavior in Cockpit navigation | Engineering | UI/UX & Accessibility | P2 | Medium | M | 66 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | UNKNOWN / proposed validation |
| 25 | ENG-025 | Make shared test fixtures deterministic and isolated | Engineering | Testing & CI | P2 | Medium | M | 72 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | UNKNOWN / proposed validation |
| 26 | ENG-026 | Verify authorization denial matrices for selected routes | Engineering | Testing & CI | P1 | Hard | L | 82 | 74 | 9 | 8 | 9 | 6 | 5 | 5 | 7 | UNKNOWN / proposed validation |
| 27 | ENG-027 | Report flaky tests from observed CI history | Engineering | Testing & CI | P2 | Medium | M | 67 | 66 | 5 | 7 | 9 | 4 | 7 | 7 | 6 | UNKNOWN / proposed validation |
| 28 | ENG-028 | Document the supported focused validation matrix | Engineering | Testing & CI | P2 | Medium | S | 71 | 68 | 5 | 7 | 9 | 6 | 5 | 9 | 7 | UNKNOWN / proposed validation |
| 29 | ENG-029 | Instrument worker lifecycle state transitions | Engineering | Operations | P2 | Medium | M | 69 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | UNKNOWN / proposed validation |
| 30 | ENG-030 | Correlate requests across one existing boundary | Engineering | Operations | P2 | Hard | L | 70 | 63 | 6 | 7 | 9 | 4 | 5 | 5 | 7 | UNKNOWN / proposed validation |
| 31 | ENG-031 | Report recurring service cost by bounded workload | Engineering | Operations | P2 | Medium | M | 66 | 66 | 5 | 7 | 9 | 4 | 7 | 7 | 6 | UNKNOWN / proposed validation |
| 32 | ENG-032 | Create a package-owner onboarding map | Engineering | Documentation/DX | P2 | Easy | S | 72 | 68 | 5 | 7 | 9 | 6 | 5 | 9 | 8 | UNKNOWN / proposed validation |
| 33 | FUT-001 | Prototype citation-bounded research answers | Frontier | AI-native/Agents | P1 | Hard | L | 86 | 80 | 9 | 8 | 9 | 6 | 9 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 34 | FUT-002 | Benchmark abstention on ambiguous or unsupported questions | Frontier | AI-native/Agents | P1 | Hard | L | 84 | 77 | 9 | 8 | 9 | 6 | 7 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 35 | FUT-003 | Prototype human approval for proposed research actions | Frontier | AI-native/Agents | P1 | Hard | L | 85 | 80 | 9 | 8 | 9 | 6 | 9 | 5 | 8 | EXPERIMENTAL: hypothesis |
| 36 | FUT-004 | Test untrusted-source isolation in a retrieval prototype | Frontier | AI-native/Agents | P2 | Hard | L | 82 | 71 | 7 | 7 | 9 | 6 | 7 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 37 | FUT-005 | Evaluate private local inference feasibility | Frontier | AI-native/Agents | P2 | Hard | L | 70 | 66 | 6 | 7 | 9 | 4 | 7 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 38 | FUT-006 | Prototype claim-level multilingual citation alignment | Frontier | AI-native/Agents | P2 | Hard | L | 76 | 65 | 7 | 7 | 9 | 4 | 5 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 39 | FUT-007 | Compare short-lived AI sessions with persistent memory | Frontier | AI-native/Agents | P2 | Hard | L | 72 | 65 | 7 | 7 | 9 | 4 | 5 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 40 | FUT-008 | Prototype a source-first evidence navigator | Frontier | Future UX/HCI | P2 | Medium | M | 78 | 74 | 6 | 7 | 9 | 6 | 9 | 7 | 7 | EXPERIMENTAL: hypothesis |
| 41 | FUT-009 | Visualize uncertainty without a single confidence badge | Frontier | Future UX/HCI | P2 | Medium | M | 75 | 71 | 6 | 7 | 9 | 6 | 7 | 7 | 7 | EXPERIMENTAL: hypothesis |
| 42 | FUT-010 | Study bilingual context switching in a research reader | Frontier | Future UX/HCI | P2 | Medium | M | 70 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | EXPERIMENTAL: hypothesis |
| 43 | FUT-011 | Prototype accessible audio navigation for cleared excerpts | Frontier | Future UX/HCI | P2 | Medium | M | 68 | 67 | 7 | 7 | 9 | 4 | 5 | 7 | 6 | EXPERIMENTAL: hypothesis |
| 44 | FUT-012 | Test a spatially anchored source exploration concept | Frontier | Future UX/HCI | P3 | Complex | XL | 57 | 53 | 5 | 6 | 7 | 4 | 5 | 3 | 4 | EXPERIMENTAL: hypothesis |
| 45 | FUT-013 | Explore evidence-aware graph traversal | Frontier | Knowledge/Simulation | P2 | Hard | L | 76 | 69 | 6 | 7 | 9 | 6 | 7 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 46 | FUT-014 | Prototype a claim/evidence scenario simulator | Frontier | Knowledge/Simulation | P2 | Hard | L | 69 | 67 | 6 | 7 | 9 | 4 | 8 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 47 | FUT-015 | Compare TEI and current corpus models on one witness | Frontier | Knowledge/Simulation | P2 | Hard | L | 78 | 70 | 6 | 7 | 9 | 6 | 8 | 5 | 8 | EXPERIMENTAL: hypothesis |
| 48 | FUT-016 | Prototype a media provenance timeline | Frontier | Knowledge/Simulation | P2 | Hard | L | 70 | 63 | 6 | 7 | 9 | 4 | 5 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 49 | FUT-017 | Simulate research workload and resource scaling | Frontier | Knowledge/Simulation | P2 | Medium | M | 65 | 63 | 5 | 7 | 9 | 4 | 5 | 7 | 6 | EXPERIMENTAL: hypothesis |
| 50 | FUT-018 | Test API contract evolution in an offline client sandbox | Frontier | Distributed/Local-first | P2 | Hard | L | 74 | 66 | 6 | 7 | 9 | 6 | 5 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 51 | FUT-019 | Prototype an offline research notebook with explicit export | Frontier | Distributed/Local-first | P2 | Hard | L | 79 | 74 | 7 | 7 | 9 | 6 | 9 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 52 | FUT-020 | Compare deterministic local conflict-resolution strategies | Frontier | Distributed/Local-first | P2 | Hard | L | 72 | 65 | 7 | 7 | 9 | 4 | 5 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 53 | FUT-021 | Test encrypted local cache boundaries with synthetic data | Frontier | Distributed/Local-first | P2 | Hard | L | 74 | 68 | 7 | 7 | 9 | 4 | 7 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 54 | FUT-022 | Evaluate a capability-based worker protocol | Frontier | Moonshot | P2 | Hard | L | 70 | 65 | 7 | 7 | 9 | 4 | 5 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 55 | FUT-023 | Explore a multi-reviewer disagreement interface | Frontier | Moonshot | P2 | Hard | L | 75 | 68 | 7 | 7 | 9 | 4 | 7 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 56 | FUT-024 | Prototype a “research journey” planner without spiritual ranking | Frontier | Moonshot | P3 | Complex | XL | 62 | 53 | 5 | 6 | 7 | 4 | 5 | 3 | 5 | EXPERIMENTAL: hypothesis |
| 57 | FUT-025 | Explore a “claim path” narrative with provenance visible | Frontier | Moonshot | P2 | Hard | L | 70 | 63 | 6 | 7 | 9 | 4 | 5 | 5 | 6 | EXPERIMENTAL: hypothesis |
| 58 | FUT-026 | Explore a personal research export bundle | Frontier | Moonshot | P2 | Hard | L | 73 | 66 | 6 | 7 | 9 | 6 | 5 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 59 | FUT-027 | Build a synthetic reviewer training simulator | Frontier | Wildcard | P2 | Medium | M | 67 | 68 | 6 | 7 | 9 | 4 | 7 | 7 | 6 | EXPERIMENTAL: hypothesis |
| 60 | FUT-028 | Prototype an uncertainty-aware “living atlas” | Frontier | Wildcard | P3 | Complex | XL | 61 | 53 | 5 | 6 | 7 | 4 | 5 | 3 | 5 | EXPERIMENTAL: hypothesis |
| 61 | FUT-029 | Explore a consent-preserving feedback loop for research tools | Frontier | Wildcard | P2 | Medium | M | 67 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | EXPERIMENTAL: hypothesis |
| 62 | FUT-030 | Prototype portable evidence bundles with integrity checks | Frontier | Wildcard | P2 | Hard | L | 77 | 66 | 6 | 7 | 9 | 6 | 5 | 5 | 7 | EXPERIMENTAL: hypothesis |
| 63 | ECO-001 | Validate institutional demand for a research-support offer | Economy | Product-market validation | P2 | Medium | M | 68 | 70 | 6 | 6 | 9 | 4 | 10 | 7 | 5 | UNKNOWN: demand |
| 64 | ECO-002 | Test self-hosted support demand and constraints | Economy | Product-market validation | P2 | Medium | M | 66 | 67 | 6 | 6 | 9 | 4 | 8 | 7 | 5 | UNKNOWN: demand |
| 65 | ECO-003 | Define ethical pricing hypotheses for institutional research tools | Economy | Pricing/entitlements | P2 | Medium | M | 67 | 63 | 6 | 6 | 9 | 4 | 5 | 7 | 6 | UNKNOWN: demand |
| 66 | ECO-004 | Map commercial entitlements away from donation benefits | Economy | Pricing/entitlements | P2 | Medium | M | 75 | 71 | 7 | 6 | 9 | 6 | 7 | 7 | 6 | UNKNOWN: demand |
| 67 | ECO-005 | Test partnership distribution with research organizations | Economy | Partnerships | P2 | Medium | M | 65 | 63 | 6 | 6 | 9 | 4 | 5 | 7 | 5 | UNKNOWN: demand |
| 68 | ECO-006 | Model cost-to-serve ranges for research workflows | Economy | Cost/profitability | P2 | Medium | M | 72 | 64 | 5 | 6 | 9 | 4 | 7 | 7 | 6 | UNKNOWN: demand |
| 69 | ECO-007 | Compare recurring support, sponsorship and grant scenarios | Economy | Cost/profitability | P2 | Medium | M | 69 | 63 | 6 | 6 | 9 | 4 | 5 | 7 | 6 | UNKNOWN: demand |
| 70 | ECO-008 | Assess a rights-cleared creator/research service model | Economy | Creator/service economy | P2 | Hard | L | 70 | 63 | 7 | 6 | 9 | 4 | 5 | 5 | 7 | UNKNOWN: demand |
| 71 | CHAR-001 | Prepare a partner-led needs assessment protocol | Charity | Needs discovery | P2 | Medium | M | 65 | 69 | 7 | 6 | 9 | 4 | 8 | 7 | 5 | UNKNOWN: need/outcomes |
| 72 | CHAR-002 | Compare needs-assessment methods for accessibility and harm | Charity | Needs discovery | P2 | Medium | M | 63 | 65 | 7 | 6 | 9 | 4 | 5 | 7 | 5 | UNKNOWN: need/outcomes |
| 73 | CHAR-003 | Define accountable humanitarian program roles and escalation | Charity | Program governance | P1 | Hard | L | 80 | 77 | 9 | 6 | 9 | 6 | 10 | 5 | 7 | UNKNOWN: need/outcomes |
| 74 | CHAR-004 | Specify restricted-fund handling and separation rules | Charity | Program governance | P1 | Hard | L | 85 | 75 | 10 | 6 | 9 | 6 | 7 | 5 | 7 | UNKNOWN: need/outcomes |
| 75 | CHAR-005 | Design a transparent allocation decision record | Charity | Donations/allocation | P1 | Hard | L | 78 | 73 | 9 | 6 | 9 | 6 | 7 | 5 | 7 | UNKNOWN: need/outcomes |
| 76 | CHAR-006 | Prototype a privacy-preserving allocation transparency report | Charity | Donations/allocation | P2 | Medium | M | 71 | 65 | 7 | 6 | 9 | 4 | 5 | 7 | 7 | UNKNOWN: need/outcomes |
| 77 | CHAR-007 | Define safe volunteer roles and safeguarding boundaries | Charity | Volunteers/participation | P1 | Hard | L | 78 | 74 | 9 | 6 | 9 | 6 | 8 | 5 | 7 | UNKNOWN: need/outcomes |
| 78 | CHAR-008 | Design accessible volunteer participation without coercion | Charity | Volunteers/participation | P2 | Medium | M | 69 | 63 | 6 | 6 | 9 | 4 | 5 | 7 | 5 | UNKNOWN: need/outcomes |
| 79 | CHAR-009 | Define an outcome measurement plan before a pilot | Charity | Impact/protection | P1 | Hard | L | 80 | 73 | 9 | 6 | 9 | 6 | 7 | 5 | 7 | UNKNOWN: need/outcomes |
| 80 | CHAR-010 | Define complaint, incident and remedy pathways | Charity | Impact/protection | P1 | Hard | L | 86 | 72 | 10 | 6 | 9 | 6 | 5 | 5 | 7 | UNKNOWN: need/outcomes |
| 81 | ONT-001 | Define a canonical source and edition identity profile | Faith/Ontology | Corpus/source provenance | P1 | Medium | M | 84 | 83 | 9 | 8 | 9 | 6 | 10 | 7 | 8 | PROPOSED: no primary source reviewed |
| 82 | ONT-002 | Model text, witness, edition and manifestation distinctions | Faith/Ontology | Corpus/source provenance | P2 | Hard | L | 80 | 71 | 7 | 7 | 9 | 6 | 7 | 5 | 7 | PROPOSED: no primary source reviewed |
| 83 | ONT-003 | Specify translation and transcription provenance fields | Faith/Ontology | Corpus/source provenance | P2 | Medium | M | 78 | 73 | 7 | 7 | 9 | 6 | 7 | 7 | 7 | PROPOSED: no primary source reviewed |
| 84 | ONT-004 | Specify citation snapshots and version-change behavior | Faith/Ontology | Corpus/source provenance | P2 | Medium | M | 76 | 71 | 6 | 7 | 9 | 6 | 7 | 7 | 6 | PROPOSED: no primary source reviewed |
| 85 | ONT-005 | Audit corpus inventory completeness without asserting authority | Faith/Ontology | Corpus/source provenance | P2 | Medium | M | 70 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 7 | PROPOSED: no primary source reviewed |
| 86 | ONT-006 | Define neutral entity identity and disambiguation rules | Faith/Ontology | Ontology/epistemology | P2 | Hard | L | 81 | 68 | 7 | 7 | 9 | 6 | 5 | 5 | 7 | PROPOSED: no primary source reviewed |
| 87 | ONT-007 | Separate claim, evidence, interpretation and tradition records | Faith/Ontology | Ontology/epistemology | P1 | Hard | L | 88 | 80 | 9 | 8 | 9 | 6 | 9 | 5 | 8 | PROPOSED: no primary source reviewed |
| 88 | ONT-008 | Represent contested claims as attributed parallel positions | Faith/Ontology | Ontology/epistemology | P2 | Hard | L | 82 | 71 | 7 | 7 | 9 | 6 | 7 | 5 | 7 | PROPOSED: no primary source reviewed |
| 89 | ONT-009 | Make graph edges traceable to source and reasoning | Faith/Ontology | Ontology/epistemology | P1 | Hard | L | 83 | 77 | 9 | 8 | 9 | 6 | 7 | 5 | 7 | PROPOSED: no primary source reviewed |
| 90 | ONT-010 | Evaluate a PROV-O mapping for existing provenance records | Faith/Ontology | Ontology/epistemology | P2 | Hard | L | 76 | 66 | 6 | 7 | 9 | 6 | 5 | 5 | 6 | PROPOSED: no primary source reviewed |
| 91 | ONT-011 | Prepare a source-critical review protocol for contested material | Faith/Ontology | Interpretation/source criticism | P2 | Hard | L | 77 | 72 | 7 | 7 | 9 | 4 | 10 | 5 | 6 | PROPOSED: no primary source reviewed |
| 92 | ONT-012 | Define attribution for comparative religious claims | Faith/Ontology | Interpretation/source criticism | P2 | Hard | L | 75 | 69 | 7 | 7 | 9 | 4 | 8 | 5 | 6 | PROPOSED: no primary source reviewed |
| 93 | ONT-013 | Create a translation-variant review exercise | Faith/Ontology | Interpretation/source criticism | P2 | Hard | L | 73 | 65 | 7 | 7 | 9 | 4 | 5 | 5 | 6 | PROPOSED: no primary source reviewed |
| 94 | ONT-014 | Prototype a citation-first compare view | Faith/Ontology | Exploration/education | P2 | Medium | M | 75 | 68 | 6 | 7 | 9 | 6 | 5 | 7 | 6 | PROPOSED: no primary source reviewed |
| 95 | ONT-015 | Test provenance-aware search facets | Faith/Ontology | Exploration/education | P2 | Medium | M | 70 | 65 | 6 | 7 | 9 | 4 | 5 | 7 | 6 | PROPOSED: no primary source reviewed |
| 96 | ONT-016 | Design a source-literacy learning module | Faith/Ontology | Exploration/education | P2 | Medium | M | 68 | 63 | 5 | 7 | 9 | 4 | 5 | 7 | 7 | PROPOSED: no primary source reviewed |
| 97 | ONT-017 | Define a transparent review protocol for interpretive summaries | Faith/Ontology | Interpretive governance | P1 | Hard | L | 82 | 77 | 9 | 8 | 9 | 6 | 7 | 5 | 7 | PROPOSED: no primary source reviewed |
| 98 | ONT-018 | Establish source correction and version-history principles | Faith/Ontology | Interpretive governance | P2 | Hard | L | 78 | 68 | 7 | 7 | 9 | 6 | 5 | 5 | 7 | PROPOSED: no primary source reviewed |
| 99 | ONT-019 | Define historical date and calendar provenance | Faith/Ontology | History/timeline | P2 | Medium | M | 70 | 68 | 6 | 7 | 9 | 4 | 7 | 7 | 6 | PROPOSED: no primary source reviewed |
| 100 | ONT-020 | Prototype a timeline that displays uncertain dates honestly | Faith/Ontology | History/timeline | P2 | Hard | L | 71 | 63 | 6 | 7 | 9 | 4 | 5 | 5 | 6 | PROPOSED: no primary source reviewed |
