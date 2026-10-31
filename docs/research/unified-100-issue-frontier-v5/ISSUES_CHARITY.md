# Domain D — Charity and Humanitarian Impact (10)

Subdomain allocation: needs/impact discovery 2; program operations/governance 2; donations/allocation/transparency 2; volunteers/participation 2; impact/protection/accountability 2. All proposals are PROPOSED research/governance preparation, not implemented services. In every body, VERIFIED applies only to cited references; local need, beneficiary, partner, donation, disbursement and impact remain UNKNOWN; recommendations are PROPOSED. M32 community validation and M35/M36 operating gates remain separate and authoritative.
**ADR applicability:** Each candidate remains PROPOSED; the [item-by-item ADR applicability register](ADR_APPLICABILITY.md) identifies current boundaries and conditions requiring a future owner-reviewed ADR.

Identity convention: the heading supplies ID/title; this file supplies the primary domain; the first identity phrases give subdomain/type. Identity lines include priority, difficulty, effort, confidence, risk, domain/common score, owner and proposed V5 wave. Trailing tags are suggested labels. The suggested wave is not a TODO milestone. Implementation maturity for all entries is PROPOSED.

## CHAR-001 — Prepare a partner-led needs assessment protocol

**Canonical TODO task:** [M49-01](../../../TODO.md) — TODO is sole status source; `CHAR-001` is only the V5 reference ID.

1. **Identity:** Charity; beneficiary needs discovery; P2 / Medium / M / confidence Low / risk High; domain 65, common 69; owner: humanitarian research lead; V5-W3; needs, safeguarding.
2. **Executive:** Prepare a protocol for a qualified local partner to identify a specific unmet need before any program is proposed.
3. **Current state:** No beneficiary group, partner, or validated need was verified; M32-01 concerns the first community member.
4. **Problem:** Designing aid around assumptions can waste resources and harm dignity.
5. **Evidence:** TODO M32; ICRC S10 and CHS S11 provide process guidance, not local need evidence.
6. **Value:** Establishes whether a real, partner-owned need exists.
7. **Solution:** Draft a consent-led, minimal-data assessment protocol with inclusion/exclusion, referral and stop conditions.
8. **Architecture:** Paper protocol only; no platform survey or beneficiary database.
9. **Microtasks:** Identify eligible partner profile; draft questions; map consent/data flow; review safeguarding; define stop/go criteria.
10. **Acceptance:** Protocol cannot collect sensitive personal details by default; partner and participant can decline without penalty.
11. **DoD:** Local partner, safeguarding and privacy review required before recruitment.
12. **Tests:** Scenario walkthrough for coercion, referral, data breach and no-response cases.
13. **Dependencies:** M32 owner scope review; enables CHAR-002.
14. **Risks:** Extractive research, unsafe disclosure, or false representation of community needs.
15. **Metrics:** Protocol completeness and unresolved safeguard questions; no impact target invented.
16. **Estimate:** 4–8 days plus qualified review.
17. **Rollback:** Do not recruit; delete draft contact data if any exists.
18. **Synergy:** Informs responsible program design without creating a community app.
19. **Anti-overlap:** Not M32 first-member journey or community MVP; requires an independent accountable partner.
20. **Outcome:** Approved protocol or documented no-go due lack of partner.
21. **Future:** Field research only with partner and ethics approval.
22. **Closure evidence:** Reviewed protocol, data map and approval/no-go record.

## CHAR-002 — Compare needs-assessment methods for accessibility and harm

**Canonical TODO task:** [M49-02](../../../TODO.md) — TODO is sole status source; `CHAR-002` is only the V5 reference ID.

1. **Identity:** Charity; beneficiary needs discovery; P2 / Medium / M / confidence Low / risk High; domain 63, common 65; owner: humanitarian research lead; V5-W3; research, inclusion.
2. **Executive:** Compare interview, facilitated group and anonymous feedback approaches for one partner-defined need.
3. **Current state:** No method or population has been approved.
4. **Problem:** A single research method can exclude people or pressure them to disclose.
5. **Evidence:** ICRC S10; CHS S11 stresses safe feedback; applicability requires partner expertise.
6. **Value:** Chooses the least harmful method that answers a defined question.
7. **Solution:** Simulate method trade-offs and document when each must not be used.
8. **Architecture:** Protocol comparison; no live survey, identity store, or product feature.
9. **Microtasks:** Define hypothetical scenario; score access/privacy risks; consult qualified reviewer; set referral/stop rules; choose or reject methods.
10. **Acceptance:** Recommendation identifies who may be excluded, what data is necessary, and safe alternatives.
11. **DoD:** No live participant contact; partner validates any locally specific conclusion.
12. **Tests:** Tabletop scenarios for power imbalance, disability, language and unsafe disclosure.
13. **Dependencies:** CHAR-001.
14. **Risks:** Generic methods can be misapplied across cultures; preserve local decision authority.
15. **Metrics:** Inclusion risks identified and mitigations assigned.
16. **Estimate:** 3–6 days.
17. **Rollback:** Withdraw method recommendation if local context is unknown.
18. **Synergy:** Supports accessible, consent-based community work.
19. **Anti-overlap:** Does not determine beneficiary needs or implement M32 participation.
20. **Outcome:** Method decision aid with explicit limits.
21. **Future:** Update only with partner feedback and evidence.
22. **Closure evidence:** Reviewed comparison, assumptions and no-go conditions.

## CHAR-003 — Define accountable humanitarian program roles and escalation

**Canonical TODO task:** [M49-03](../../../TODO.md) — TODO is sole status source; `CHAR-003` is only the V5 reference ID.

1. **Identity:** Charity; program operations/governance; P1 / Hard / L / confidence Medium / risk High; domain 80, common 77; owner: accountable program operator; V5-W3; governance, safeguarding.
2. **Executive:** Map who may approve, deliver, pause and investigate a future charitable program.
3. **Current state:** No accountable charitable operator or program was verified.
4. **Problem:** Without named responsibility, safeguarding and financial issues may go unhandled.
5. **Evidence:** CHS S11, ICRC S10 and TODO community context; no compliance claim.
6. **Value:** Establishes operational readiness before software.
7. **Solution:** Create a role/RACI and escalation map with independent complaint and suspension paths.
8. **Architecture:** Governance artifact; no app roles, new identity system or workflow engine.
9. **Microtasks:** Identify legal entity; define roles; separate delivery/approval; map incident escalation; tabletop failure cases.
10. **Acceptance:** Each critical decision has an accountable role and substitute; complaints can bypass program delivery.
11. **DoD:** Legal, safeguarding and local partner review.
12. **Tests:** Tabletop scenarios for conflict, misconduct, missing funds and operator unavailability.
13. **Dependencies:** Identified operator; related CHAR-004.
14. **Risks:** Conflicted reviewers or unstaffed escalation; no program launches without coverage.
15. **Metrics:** Critical responsibilities with named owner and backup.
16. **Estimate:** 5–10 days plus legal review.
17. **Rollback:** Freeze proposed program until roles are re-approved.
18. **Synergy:** Creates a prerequisite for trustworthy charity participation.
19. **Anti-overlap:** Owns the shared accountable-role and escalation map used by CHAR-004/007/010; those tasks add fund controls, volunteer boundaries and safeguarding remedies respectively. Does not define M32 community ownership or commercial Treasury roles.
20. **Outcome:** Readiness role map or explicit no-go.
21. **Future:** Revisit per program and jurisdiction.
22. **Closure evidence:** Approved responsibility map and tabletop findings.

## CHAR-004 — Specify restricted-fund handling and separation rules

**Canonical TODO task:** [M49-04](../../../TODO.md) — TODO is sole status source; `CHAR-004` is only the V5 reference ID.

1. **Identity:** Charity; program operations/governance; P1 / Hard / L / confidence Medium / risk Critical; domain 85, common 75; owner: accountable finance officer; V5-W3; finance, controls.
2. **Executive:** Document how any future restricted charitable funds would be accepted, held, allocated, reconciled and returned.
3. **Current state:** No donation flow, account owner or restricted funds were verified.
4. **Problem:** Restricted money can be misapplied or commingled if rules are unclear.
5. **Evidence:** IATI S14, CHS S11 and ECO-004; legal/accounting requirements are UNKNOWN.
6. **Value:** Protects intended purpose and donor/beneficiary trust.
7. **Solution:** Produce a controls map, segregation principles, approval thresholds and exception path; no transactions.
8. **Architecture:** Policy only; no donation ledger, payment provider, or Treasury implementation.
9. **Microtasks:** Identify jurisdiction/entity; map fund lifecycle; define dual control; list refund/unspent cases; obtain accountant/legal review.
10. **Acceptance:** Every fund state has owner, evidence, reconciliation and return/exception rule.
11. **DoD:** Qualified finance/legal sign-off before solicitation or acceptance.
12. **Tests:** Tabletop cases for restricted purpose, chargeback, unspent funds and record discrepancy.
13. **Dependencies:** CHAR-003; related ECO-004/007; enables CHAR-005.
14. **Risks:** Regulatory mismatch and fraud; block collection until entity and controls exist.
15. **Metrics:** Unassigned control steps and unresolved legal questions.
16. **Estimate:** 5–12 days plus external advice.
17. **Rollback:** No funds accepted; withdraw policy draft if jurisdiction changes.
18. **Synergy:** Enables accountable charity while protecting commercial separation.
19. **Anti-overlap:** Uses CHAR-003's role map and adds restricted-fund custody, dual control, reconciliation and return rules only. No commercial Treasury or M35 payment flow; no new SQL owner.
20. **Outcome:** Approved controls prerequisite or no-go.
21. **Future:** Software follows audited process, not vice versa.
22. **Closure evidence:** Signed controls map, tabletop outcomes and legal/accounting caveats.

## CHAR-005 — Design a transparent allocation decision record

**Canonical TODO task:** [M49-05](../../../TODO.md) — TODO is sole status source; `CHAR-005` is only the V5 reference ID.

1. **Identity:** Charity; donations/allocation; P1 / Hard / L / confidence Medium / risk High; domain 78, common 73; owner: program/finance; V5-W3; allocation, audit.
2. **Executive:** Define the minimum evidence for documenting a charitable allocation decision.
3. **Current state:** No donation, recipient or allocation is verified.
4. **Problem:** Totals alone do not explain why resources went to a particular use.
5. **Evidence:** CHS S11 and IATI S14 as frameworks; no project allocation evidence.
6. **Value:** Supports accountability without exposing beneficiary identities.
7. **Solution:** Prototype an offline decision record with purpose, approvers, restrictions, amount category, date and evidence reference.
8. **Architecture:** Synthetic records; no real financial store or public dashboard.
9. **Microtasks:** Define fields; separate identity from public report; model approval/reversal; review privacy; document owner.
10. **Acceptance:** Record supports independent reconciliation while public view omits identifying data.
11. **DoD:** Finance/privacy reviewer approves fields and access model.
12. **Tests:** Schema checks for missing approvals, purpose mismatch and redaction.
13. **Dependencies:** CHAR-004.
14. **Risks:** Public detail could identify recipients; aggregate only with disclosure review.
15. **Metrics:** Allocation records with complete approval/evidence fields.
16. **Estimate:** 4–8 days.
17. **Rollback:** Remove synthetic prototype; no real records created.
18. **Synergy:** Supports public trust and future impact measurement.
19. **Anti-overlap:** Not payment processing, donation UI or M35 commercial accounting.
20. **Outcome:** Reviewed minimum allocation audit record.
21. **Future:** Data system considered only after operator and legal approval.
22. **Closure evidence:** Schema, synthetic cases and review.

## CHAR-006 — Prototype a privacy-preserving allocation transparency report

**Canonical TODO task:** [M49-06](../../../TODO.md) — TODO is sole status source; `CHAR-006` is only the V5 reference ID.

1. **Identity:** Charity; donations/transparency; P2 / Medium / M / confidence Low / risk High; domain 71, common 65; owner: finance/communications; V5-W3; transparency, privacy.
2. **Executive:** Test whether an aggregate report can explain funds received/allocated and remaining restrictions without naming beneficiaries.
3. **Current state:** No funds or impact data verified; no report should imply otherwise.
4. **Problem:** Transparency can conflict with beneficiary privacy or reveal unsafe locations.
5. **Evidence:** IATI S14, CHS S11 and ICRC S10; reporting applicability depends on operator.
6. **Value:** Demonstrates accountability while protecting dignity.
7. **Solution:** Use entirely synthetic numbers to mock a report with reconciliation notes, period, definitions and caveats.
8. **Architecture:** Static mock only; no live financial integration.
9. **Microtasks:** Define aggregate fields; generate fake example; test re-identification risk; ask reviewers to interpret; revise.
10. **Acceptance:** Readers distinguish received, committed, disbursed and remaining; no person/location inferable from fixture.
11. **DoD:** Finance and protection reviewers approve the mock language.
12. **Tests:** Arithmetic reconciliation and re-identification scenario review.
13. **Dependencies:** CHAR-005; related CHAR-010.
14. **Risks:** Aggregates can still reveal small groups; use suppression or no publication.
15. **Metrics:** Reconciliation errors and privacy-risk findings.
16. **Estimate:** 4–7 days.
17. **Rollback:** Withdraw mock; no public posting.
18. **Synergy:** Supports trust without exposing personal records.
19. **Anti-overlap:** Does not create donations or public impact claims.
20. **Outcome:** Report format/no-go decision.
21. **Future:** Real reporting only with audited operator data and consent review.
22. **Closure evidence:** Synthetic report, reconciliation and privacy review.

## CHAR-007 — Define safe volunteer roles and safeguarding boundaries

**Canonical TODO task:** [M49-07](../../../TODO.md) — TODO is sole status source; `CHAR-007` is only the V5 reference ID.

1. **Identity:** Charity; volunteer participation; P1 / Hard / L / confidence Medium / risk High; domain 78, common 74; owner: accountable program operator; V5-W3; volunteers, safeguarding.
2. **Executive:** Specify what volunteers may and may not do in a hypothetical program.
3. **Current state:** No volunteer program or partner was verified.
4. **Problem:** Unclear role boundaries can expose participants and volunteers to harm.
5. **Evidence:** CHS S11 and ICRC S10; local regulation unknown.
6. **Value:** Prevents software from assigning unsafe or unauthorized tasks.
7. **Solution:** Draft role cards, supervision requirements, prohibited actions and escalation contacts.
8. **Architecture:** Policy document; no volunteer directory or dispatch feature.
9. **Microtasks:** Identify task types; assess risk; define screening/training; set supervision; review incidents and appeals.
10. **Acceptance:** Every role has scope, supervisor, training and prohibited tasks; high-risk roles are excluded absent qualified partner.
11. **DoD:** Local legal/safeguarding review and partner approval.
12. **Tests:** Tabletop cases for boundary crossing, complaint and no supervisor.
13. **Dependencies:** CHAR-003.
14. **Risks:** Role description mistaken for clearance; never recruit before approval.
15. **Metrics:** Roles with complete safeguards and unresolved high-risk duties.
16. **Estimate:** 4–8 days plus expert review.
17. **Rollback:** Freeze volunteer activity and withdraw role cards.
18. **Synergy:** Supports safe community participation.
19. **Anti-overlap:** Uses CHAR-003's role/escalation map and adds volunteer screening, training, supervision and prohibited-task limits only. No M32 member journey/moderation app.
20. **Outcome:** Approved role framework or no-go.
21. **Future:** Pilot only with named partner and supervision.
22. **Closure evidence:** Role matrix, risk review and approvals.

## CHAR-008 — Design accessible volunteer participation without coercion

**Canonical TODO task:** [M49-08](../../../TODO.md) — TODO is sole status source; `CHAR-008` is only the V5 reference ID.

1. **Identity:** Charity; volunteer/community participation; P2 / Medium / M / confidence Low / risk Medium; domain 69, common 63; owner: program/UX; V5-W3; inclusion, volunteers.
2. **Executive:** Explore flexible participation, reimbursement and opt-out needs for a future partner-led activity.
3. **Current state:** No volunteer need or activity is verified.
4. **Problem:** Participation designs can exclude people by disability, language, cost or schedule.
5. **Evidence:** CHS S11 and WCAG S05; no local participant research.
6. **Value:** Helps programs avoid unpaid hidden costs and inaccessible expectations.
7. **Solution:** Create a role-choice and expense policy mock; test fictional cases with expert reviewers.
8. **Architecture:** Paper design; no sign-up or location tracking.
9. **Microtasks:** Identify barriers; specify accommodations; define reimbursement questions; set opt-out; review.
10. **Acceptance:** No role requires undisclosed cost; accommodation and refusal paths are explicit.
11. **DoD:** Local partner confirms feasibility before any recruitment.
12. **Tests:** Scenario review for disability, travel, care duties and language access.
13. **Dependencies:** CHAR-007.
14. **Risks:** Promise of reimbursement without funding; all costs remain hypothetical.
15. **Metrics:** Barriers identified and accommodations with an accountable owner.
16. **Estimate:** 3–6 days.
17. **Rollback:** Remove proposal if funding/partner unavailable.
18. **Synergy:** Supports equitable participation and trust.
19. **Anti-overlap:** No community app, member profiles or M32 workflow.
20. **Outcome:** Inclusion decision framework, not a volunteer program.
21. **Future:** Validate with a partner and participants only after approval.
22. **Closure evidence:** Barrier matrix and partner/reviewer response.

## CHAR-009 — Define an outcome measurement plan before a pilot

**Canonical TODO task:** [M49-09](../../../TODO.md) — TODO is sole status source; `CHAR-009` is only the V5 reference ID.

1. **Identity:** Charity; impact measurement; P1 / Hard / L / confidence Medium / risk High; domain 80, common 73; owner: program evaluator; V5-W3; evaluation, impact.
2. **Executive:** Define one outcome, baseline and credible evidence method before any charitable pilot begins.
3. **Current state:** No program outcomes or beneficiaries verified.
4. **Problem:** Activity counts can be reported as impact without showing change for people.
5. **Evidence:** OECD DAC S12, CHS S11; no local evaluation data.
6. **Value:** Prevents unsupported humanitarian claims and improves learning.
7. **Solution:** Draft a theory-of-change and evaluation matrix for a partner-selected hypothetical program.
8. **Architecture:** Evaluation plan only; no personal outcome database.
9. **Microtasks:** Specify problem/outcome; identify comparison limits; choose measures; define consent; define adverse findings/publication.
10. **Acceptance:** Plan separates output, outcome and attribution; includes null/harmful results and missing data.
11. **DoD:** Independent evaluator/partner reviews method.
12. **Tests:** Scenario critique for selection bias, attrition and attribution.
13. **Dependencies:** CHAR-001/003.
14. **Risks:** Measurement burden or false causal claim; minimize collection and state limitations.
15. **Metrics:** Measurement completeness and data burden; no numeric impact target invented.
16. **Estimate:** 5–10 days plus evaluator time.
17. **Rollback:** Do not run pilot if ethical measurement cannot be designed.
18. **Synergy:** Supports honest reporting and resource allocation.
19. **Anti-overlap:** Does not implement M32 community analytics or claim program success.
20. **Outcome:** Go/no-go evaluation design.
21. **Future:** Independent review during and after a real approved pilot.
22. **Closure evidence:** Theory-of-change, measurement matrix and reviewer decision.

## CHAR-010 — Define complaint, incident and remedy pathways

**Canonical TODO task:** [M49-10](../../../TODO.md) — TODO is sole status source; `CHAR-010` is only the V5 reference ID.

1. **Identity:** Charity; protection/accountability; P1 / Hard / L / confidence Medium / risk Critical; domain 86, common 72; owner: independent safeguarding lead; V5-W3; accountability, protection.
2. **Executive:** Specify safe feedback, complaint, safeguarding incident and appeal paths before any program contact.
3. **Current state:** No charitable program, complaint mechanism or responsible safeguarding lead was verified.
4. **Problem:** People affected by a program need safe ways to report harm and seek remedy.
5. **Evidence:** CHS S11, ICRC S10; no conformity or local mechanism claim.
6. **Value:** Makes accountability operational rather than promotional.
7. **Solution:** Draft multiple reporting routes, confidentiality limits, response owner, escalation and retaliation protections.
8. **Architecture:** Governance protocol; no public form or sensitive case database.
9. **Microtasks:** Map report types; define urgent response; assign independent contact; set retention/access; tabletop unsafe disclosure.
10. **Acceptance:** Complainant can report without public identity; urgent cases have escalation; limits and response timing are clear.
11. **DoD:** Local safeguarding/legal reviewer approves before program launch.
12. **Tests:** Tabletop cases for retaliation, anonymous report, conflict of interest and unavailable lead.
13. **Dependencies:** CHAR-003/007; related CHAR-009.
14. **Risks:** Confidentiality cannot be absolute; explain limits and referral boundaries honestly.
15. **Metrics:** Path coverage, owner availability and time-to-acknowledge target set by partner.
16. **Estimate:** 5–10 days plus qualified review.
17. **Rollback:** Pause program/contact if safe response capacity lapses.
18. **Synergy:** Protects participants, volunteers and institutional trust.
19. **Anti-overlap:** Defines independent complaint, incident and remedy paths from the shared CHAR-003/007 role map; make the path ready before program contact. CHAR-009 outcome measurement is not a prerequisite. No M32 moderation/appeals implementation.
20. **Outcome:** Approved accountability mechanism or program no-go.
21. **Future:** Audit mechanism with independent user feedback.
22. **Closure evidence:** Protocol, tabletop results and sign-off.
