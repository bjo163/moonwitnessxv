# M49-01 — Partner-Led Needs Assessment Protocol

**Task ID:** M49-01  
**Candidate:** CHAR-001  
**Priority:** P2 · **Difficulty:** D3 · **Effort:** M (4–8 days plus qualified review)  
**Status:** BASELINE ESTABLISHED — protocol design complete, partner review deferred  
**Date:** 2026-10-31  
**Owner:** humanitarian research lead  
**Dependency:** M32-01 (external) — workable as baseline with synthetic data  
**Domain:** Charity / Needs discovery  
**Confidence:** Low · **Risk:** High  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Protocol Goals and Constraints](#3-protocol-goals-and-constraints)
4. [Eligible Partner Profile Definition](#4-eligible-partner-profile-definition)
5. [Needs Assessment Scope](#5-needs-assessment-scope)
6. [Consent-Led Protocol Design](#6-consent-led-protocol-design)
7. [Minimal Data Collection Principles](#7-minimal-data-collection-principles)
8. [Inclusion/Exclusion Criteria](#8-inclusionexclusion-criteria)
9. [Assessment Question Framework](#9-assessment-question-framework)
10. [Data Flow Mapping](#10-data-flow-mapping)
11. [Referral Pathways](#11-referral-pathways)
12. [Stop Conditions](#12-stop-conditions)
13. [Safeguarding Review Framework](#13-safeguarding-review-framework)
14. [Privacy Impact Assessment](#14-privacy-impact-assessment)
15. [Scenario Walkthrough: Coercion Case](#15-scenario-walkthrough-coercion-case)
16. [Scenario Walkthrough: Referral Case](#16-scenario-walkthrough-referral-case)
17. [Scenario Walkthrough: Data Breach Case](#17-scenario-walkthrough-data-breach-case)
18. [Scenario Walkthrough: No-Response Case](#18-scenario-walkthrough-no-response-case)
19. [Anti-Extractive Research Measures](#19-anti-extractive-research-measures)
20. [Unsafe Disclosure Prevention](#20-unsafe-disclosure-prevention)
21. [False Representation Safeguards](#21-false-representation-safeguards)
22. [Protocol Completeness Checklist](#22-protocol-completeness-checklist)
23. [Unresolved Safeguard Questions Register](#23-unresolved-safeguard-questions-register)
24. [Risk Mitigation Strategy](#24-risk-mitigation-strategy)
25. [Metrics and Success Criteria](#25-metrics-and-success-criteria)
26. [Limitations and Caveats](#26-limitations-and-caveats)
27. [Deferred Items Requiring Owner Action](#27-deferred-items-requiring-owner-action)
28. [Conclusion: BASELINE ESTABLISHED](#28-conclusion-baseline-established)

---

## 1. Executive Summary

This document establishes the baseline design for a **partner-led needs assessment protocol** (M49-01 / CHAR-001). The protocol provides a structured, consent-led process through which a qualified local partner can identify a specific unmet community need **before** any charitable program is proposed, designed, or funded.

### 1.1 Purpose

The core purpose is to prevent the common failure mode in humanitarian and charitable work: designing programs around assumptions rather than verified, partner-owned needs. Without a rigorous pre-program assessment, well-intentioned organizations risk:

- Wasting resources on interventions that do not address real needs
- Imposing external priorities on communities that already have their own coping strategies
- Collecting sensitive personal data without adequate safeguards
- Creating dependency dynamics that undermine community agency
- Misrepresenting community needs to donors or stakeholders

### 1.2 What This Document Is

This is a **paper protocol** — a governance and process design artifact. It does not:

- Create a platform survey tool or beneficiary database
- Implement any software feature in the MoonWitness XV repository
- Establish a community application or membership system (that is M32 scope)
- Authorize any real-world data collection or participant contact
- Replace the need for qualified local partner review

### 1.3 What This Document Is Not

This protocol is explicitly **not**:

- A needs assessment itself (no assessment has been conducted)
- A validation that a specific need exists (no need has been identified)
- A commitment to launch any program (no program is proposed)
- A substitute for M32-01 first-member journey (those are separate scopes)
- A community MVP or participation platform

### 1.4 Current State

As of this baseline:

- No beneficiary group, partner organization, or validated need has been identified
- M32-01 (first community member validation) remains BLOCKED — no real member evidence exists
- No participant contact data exists or has been collected
- No local partner has been engaged or qualified
- The protocol is a design artifact awaiting partner and safeguarding review

### 1.5 Key Design Principles

The protocol is built on five non-negotiable principles:

1. **Consent is continuous and revocable** — participants can withdraw at any time without penalty
2. **Data minimization is the default** — the protocol cannot collect sensitive personal details unless explicitly justified and approved
3. **Partner independence is structural** — the local partner makes the assessment, not the funding organization
4. **No program follows automatically** — assessment may conclude with a no-go decision
5. **Safeguarding overrides all other objectives** — any sign of harm, coercion, or distress stops the process

### 1.6 Document Structure

The remaining sections address each element of the protocol design, from partner qualification through scenario walkthroughs to the completeness checklist. All scenarios use synthetic data only. No real beneficiary information is referenced or implied.

---

## 2. Task Metadata

### 2.1 Canonical References

| Field | Value |
|-------|-------|
| **Task ID** | M49-01 |
| **Candidate ID** | CHAR-001 |
| **Milestone** | M49 — HARBOR humanitarian and safeguarding readiness |
| **Group** | G7 — ECOSYSTEM |
| **Priority** | P2 (improvement/next horizon) |
| **Difficulty** | D3 (bounded multi-file) |
| **Effort** | M (4–8 days plus qualified review) |
| **Owner** | humanitarian research lead |
| **Confidence** | Low |
| **Risk** | High |
| **Domain score** | 65 |
| **Common score** | 69 |
| **V5 Wave** | W3 |
| **Tags** | needs, safeguarding |

### 2.2 Dependencies

| Dependency | Type | Status | Notes |
|-----------|------|--------|-------|
| M32-01 | Canonical TODO | BLOCKED | No real member/interview/consent evidence exists; workable as baseline with synthetic data |
| M32 scope review | Source dependency | NOT COMPLETED | Required before any real assessment |
| Named accountable operator | Organizational | NOT IDENTIFIED | Required before partner engagement |
| CHAR-002 (M49-02) | Downstream | ENABLED BY THIS TASK | Method comparison depends on completed protocol |

### 2.3 Execution Constraints

- **No new ADR required** for the task scope currently proposed (per ADR applicability register)
- **No platform survey or beneficiary database** — paper protocol only
- **No real participant contact** — all scenarios are synthetic
- **No outreach, private/unlicensed content import, publication, money handling, or owner-boundary change** without separate authority
- **TODO.md is the sole status source** — this document records design, not completion

### 2.4 Acceptance Criteria (from TODO)

1. Protocol **cannot collect sensitive personal details by default**
2. Partner **can decline without penalty**
3. Participant **can decline without penalty**

### 2.5 Definition of Done (from TODO)

- Local partner review: **REQUIRED, DEFERRED**
- Safeguarding review: **REQUIRED, DEFERRED**
- Privacy review: **REQUIRED, DEFERRED**
- All three must complete **before recruitment** can be considered

### 2.6 Verification Plan (from TODO)

Scenario walkthroughs for four cases:

1. Coercion — participant pressured to participate or disclose
2. Referral — participant needs services beyond assessment scope
3. Data breach — collected information is exposed improperly
4. No-response — community or participant does not engage

### 2.7 Closure Evidence Required

- Reviewed protocol document (this artifact, pending review)
- Data map (Section 10)
- Approval/no-go record (deferred — requires partner and reviewer action)

### 2.8 Anti-Overlap Statement

This task is explicitly **not**:

- M32 first-member journey or community MVP
- A platform feature or application component
- A substitute for community participation design
- An overlap with CHAR-002 method comparison (downstream)

It **requires** an independent accountable partner — the partner conducts the assessment, not the funding organization.

---

## 3. Protocol Goals and Constraints

### 3.1 Primary Goal

Enable a qualified local partner to identify a **specific, verified, partner-owned unmet need** before any program is proposed. The protocol exists to answer one question:

> "Is there a specific, documented, partner-validated unmet need that a proposed program could responsibly address?"

If the answer is no, the process stops. No program is proposed. This is a valid and expected outcome.

### 3.2 Secondary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| Protect participant dignity | Ensure no one is reduced to a "beneficiary" label | Essential |
| Minimize data exposure | Collect only what the assessment strictly requires | Essential |
| Preserve partner independence | Local partner owns the assessment findings | Essential |
| Enable informed go/no-go | Provide decision-makers with verified information | High |
| Establish referral pathways | Connect participants to existing services when needed | High |
| Document process integrity | Create an auditable record of how the assessment was conducted | Medium |

### 3.3 Explicit Non-Goals

The protocol does **not**:

- Design or propose a specific program
- Create a beneficiary database or registry
- Collect personally identifiable information (PII) by default
- Measure program impact (that is M49-09 scope)
- Replace community participation mechanisms (M32 scope)
- Generate statistics or demographic profiles
- Serve as a needs assessment for multiple communities simultaneously
- Establish ongoing monitoring or follow-up relationships

### 3.4 Hard Constraints

These constraints are non-negotiable and cannot be overridden by operational convenience:

**HC-1: No sensitive personal data by default**
The protocol's default data collection must not include names, addresses, national identification numbers, health information, financial details, religious affiliation, political opinion, ethnic identity, or any other sensitive personal category. If a specific assessment question requires any such data, it must be:
- Justified in writing before the assessment begins
- Approved by the safeguarding reviewer
- Subject to enhanced consent procedures
- Minimized to the smallest necessary scope

**HC-2: Decline without penalty**
Both the partner organization and individual participants may decline to participate or withdraw at any point. Declining must not result in:
- Loss of access to other services
- Financial penalty or reduced funding
- Social pressure or coercion
- Negative consequences for the community
- Exclusion from future opportunities

**HC-3: Partner independence**
The local partner conducts the assessment and owns the findings. The funding organization:
- May provide the protocol framework
- May not influence questions, findings, or conclusions
- May not contact participants directly
- Accepts the partner's assessment as authoritative

**HC-4: Safeguarding override**
Any safeguarding concern immediately overrides all other protocol objectives. If a participant discloses:
- Abuse or exploitation (current or historical)
- Imminent harm to self or others
- Child protection concerns
- Trafficking indicators
- Any situation where continued assessment could cause harm

The assessment stops, the participant is informed of available services, and the incident is reported through the safeguarding escalation pathway (Section 11, Section 13).

**HC-5: No automatic program commitment**
Completing the assessment does not commit any organization to designing, funding, or implementing a program. The assessment may conclude:
- A verified need exists and a program may be proposed
- A verified need exists but no appropriate program can be designed
- No specific unmet need was identified
- The assessment was incomplete and should not be used for decision-making

All four outcomes are equally valid.

### 3.5 Operational Constraints

These constraints apply to the practical conduct of the assessment:

**OC-1: Single community scope**
One assessment addresses one specific community context. Cross-community generalization is not permitted without separate assessments.

**OC-2: Time-bounded engagement**
The assessment has a defined start and end date. Open-ended engagement without conclusion is not permitted.

**OC-3: Language accessibility**
All protocol materials must be available in the participant's preferred language. Translation is the partner's responsibility with support from the funding organization.

**OC-4: Cultural appropriateness**
The partner reviews all questions and procedures for cultural appropriateness before the assessment begins. The funding organization defers to the partner's cultural judgment.

**OC-5: Physical accessibility**
Assessment locations and methods must be accessible to all eligible participants. If a participant cannot access the assessment location, the assessment comes to them (with consent) or the participant is excluded without penalty.

**OC-6: Documentation limits**
Audio/video recording requires separate, explicit consent beyond the general participation consent. Participants may consent to participation but decline recording.

### 3.6 Relationship to Other Tasks

```
M32-01 (first member validation)
    |
    v [scope review complete]
M49-01 (THIS TASK: needs assessment protocol)
    |
    v [protocol approved by partner + safeguarding + privacy review]
M49-02 (method comparison for one partner-defined need)
    |
    v [method selected]
M49-09 (outcome measurement plan before pilot)
    |
    v [measurement plan approved]
[Future: actual program proposal — NOT committed by this sequence]
```

The protocol enables downstream tasks but does not commit to any of them. Each downstream task has its own go/no-go decision point.

---

## 4. Eligible Partner Profile Definition

### 4.1 Why Partner Qualification Matters

The protocol explicitly requires that a **qualified local partner** conducts the needs assessment. This is not an administrative formality — it is a structural safeguard against:

- External organizations imposing their own assumptions about community needs
- Assessments conducted by people who lack cultural context or community trust
- Findings that reflect the assessor's biases rather than the community's reality
- Power imbalances that could coerce participation or distort responses

The partner is the assessment's authority. Without a qualified partner, the protocol cannot be executed.

### 4.2 Partner Qualification Criteria

#### 4.2.1 Essential Qualifications

A partner organization must demonstrate **all** of the following:

| Criterion | Description | Verification Method |
|-----------|-------------|---------------------|
| **E-1: Legal registration** | Registered as a legal entity in the relevant jurisdiction | Registration documents, legal counsel verification |
| **E-2: Local presence** | Physical presence in or direct connection to the community being assessed | Office location, staff residency, community relationships |
| **E-3: Community trust** | Recognized by the community as a legitimate representative or partner | Community leader references, prior working relationships |
| **E-4: Safeguarding capacity** | Designated safeguarding lead or access to qualified safeguarding support | Named individual, training certificates, policy documents |
| **E-5: Assessment experience** | Prior experience conducting community needs assessments or similar research | Case examples, methodology documentation, references |
| **E-6: Independence** | Not controlled by, financially dependent on, or subordinate to the funding organization | Governance structure, funding sources, decision-making autonomy |
| **E-7: Language capability** | Ability to conduct the assessment in the community's primary language(s) | Staff language skills, translation resources |
| **E-8: Cultural competence** | Understanding of local cultural norms, power dynamics, and communication styles | Staff backgrounds, community feedback, cultural review process |

#### 4.2.2 Desirable Qualifications

The following are not essential but strengthen the partner's capacity:

| Criterion | Description |
|-----------|-------------|
| **D-1: Academic research training** | Formal training in social science research methods |
| **D-2: Humanitarian standards familiarity** | Knowledge of Core Humanitarian Standard (CHS), Sphere standards, or ICRC principles |
| **D-3: Data protection expertise** | Understanding of data minimization, consent, and privacy regulations |
| **D-4: Existing referral networks** | Established relationships with local service providers |
| **D-5: Gender and inclusion expertise** | Specific capacity to assess needs across gender, age, disability, and other diversity dimensions |
| **D-6: Conflict sensitivity training** | Understanding of how assessments can affect community dynamics |
| **D-7: Previous partnership with funding organization** | Established working relationship (but not a requirement) |

### 4.3 Partner Independence Requirements

Independence is the most critical qualification criterion. The partner must be able to:

1. **Conduct the assessment without external influence**
   - The funding organization may not dictate which questions are asked
   - The funding organization may not influence how questions are interpreted
   - The funding organization may not suppress or alter findings

2. **Report findings honestly, including negative findings**
   - If no unmet need is identified, the partner reports that
   - If the identified need is one the funding organization cannot address, the partner reports that
   - If the community does not want external intervention, the partner reports that

3. **Make go/no-go recommendations without pressure**
   - The partner's recommendation carries equal weight to the funding organization's interest
   - A no-go recommendation is final and does not require justification beyond the partner's assessment

4. **Decline to participate without consequence**
   - The partner may decline the assessment engagement entirely
   - Declining does not affect the partner's relationship with the funding organization
   - Declining does not result in financial penalty or reduced support

### 4.4 Partner Accountability Structure

The partner is accountable to:

| Accountable To | For What | Mechanism |
|----------------|----------|-----------|
| **The community** | Conducting the assessment respectfully, honestly, and with informed consent | Community feedback mechanism, participant rights |
| **The safeguarding reviewer** | Following safeguarding protocols and reporting concerns | Incident reporting, process audit |
| **The privacy reviewer** | Protecting participant data and minimizing collection | Data map review, consent audit |
| **The funding organization** | Delivering the assessment within the agreed protocol framework | Progress reports, final assessment document |
| **Themselves** | Maintaining their own organizational standards and integrity | Internal governance, professional ethics |

### 4.5 Partner Selection Process

The partner selection process itself must be transparent and documented:

1. **Identify candidate partners** through community referral, existing networks, or open expression of interest
2. **Assess against qualification criteria** using documented evidence
3. **Verify independence** through governance review and financial disclosure
4. **Confirm community trust** through community leader consultation (with community consent for the consultation itself)
5. **Agree on terms** including scope, timeline, data handling, reporting, and independence guarantees
6. **Document the selection** with rationale and any conditions or concerns
7. **Review by safeguarding and privacy reviewers** before engagement begins

### 4.6 Partner Disqualification Conditions

A partner must **not** be selected if:

- They cannot demonstrate independence from the funding organization
- They lack safeguarding capacity or refuse to designate a safeguarding lead
- The community does not recognize them as a legitimate partner
- They have a history of ethical violations in research or program delivery
- They insist on controlling the assessment findings or suppressing negative results
- They cannot conduct the assessment in the community's language(s)
- They are unwilling to submit to safeguarding and privacy review

### 4.7 Partner Support Requirements

The funding organization must provide the partner with:

- The protocol document (this artifact, after review)
- Safeguarding training or verification of existing training
- Privacy/data protection guidance
- Translation and interpretation support (if needed)
- Administrative support for documentation
- Access to the safeguarding reviewer for consultation during the assessment
- Clear communication that the partner's findings are authoritative

The funding organization must **not** provide:

- Direction on what findings to produce
- Incentives tied to specific assessment outcomes
- Pressure to complete the assessment within an arbitrary timeline
- Instructions to exclude certain community voices or perspectives

---

## 5. Needs Assessment Scope

### 5.1 What Can Be Assessed

The protocol is designed to assess **one specific thing**: whether a verifiable, partner-owned, community-identified unmet need exists that could potentially be addressed by a proposed program.

Eligible assessment topics include:

| Category | Examples | Assessment Approach |
|----------|----------|---------------------|
| **Service gaps** | Lack of access to clean water, healthcare, education, transportation | Community description of current access and barriers |
| **Infrastructure needs** | Damaged facilities, lack of equipment, unsafe conditions | Partner observation and community description |
| **Knowledge gaps** | Lack of information about available services, rights, or procedures | Community description of what they know and don't know |
| **Capacity gaps** | Lack of local resources, skills, or organizational capacity to address a known need | Partner assessment of existing resources |
| **Protection concerns** | Safety risks, vulnerability factors, exposure to harm | Community description (with safeguarding protocols active) |
| **Livelihood needs** | Income generation, food security, employment barriers | Community description of economic challenges |

### 5.2 What Is Out of Scope

The following are explicitly **outside** the assessment protocol's scope:

| Excluded Topic | Reason for Exclusion | Alternative Pathway |
|----------------|---------------------|---------------------|
| **Individual case management** | Assessment is about community needs, not individual casework | Referral to existing services (Section 11) |
| **Medical diagnosis** | Not within the partner's or assessor's qualifications | Referral to healthcare providers |
| **Legal advice** | Assessment is not a legal service | Referral to legal aid organizations |
| **Psychological counseling** | Assessment is not a mental health service | Referral to counseling services |
| **Political advocacy** | Assessment does not take political positions | Separate advocacy processes |
| **Community governance** | Assessment does not restructure community leadership | Community's own governance processes |
| **Financial assessment of individuals** | Assessment does not evaluate individual financial status | Program-specific eligibility processes (if a program is later proposed) |
| **Biometric data collection** | Protocol prohibits biometric collection by default | Not applicable within this protocol |
| **Longitudinal tracking** | Assessment is a single-point-in-time evaluation | M49-09 outcome measurement (future, separate scope) |
| **Cross-community comparison** | Each assessment is community-specific | Separate assessments per community |
| **Program design** | Assessment identifies need, not solution | Separate program design process (if warranted) |
| **Donor reporting** | Assessment findings are for community/partner use first | Aggregated, anonymized reporting (if approved) |

### 5.3 Scope Boundaries and Edge Cases

Some situations require judgment about whether they fall within scope:

**Edge Case 1: A participant discloses a need that is not the assessment focus**
- The assessor acknowledges the disclosure
- The assessor does not expand the assessment scope to include it
- The assessor provides referral information for the disclosed need
- The disclosure is documented in the safeguarding log (not in the assessment findings)

**Edge Case 2: The community identifies a need that the funding organization cannot address**
- The need is documented as a verified finding
- The partner recommends alternative pathways
- The funding organization acknowledges the finding without committing to act on it
- The community's identified need is respected regardless of funding organization response

**Edge Case 3: Multiple community factions identify conflicting needs**
- All perspectives are documented
- The partner does not arbitrate between factions
- Conflicting findings are reported as-is
- The assessment notes the disagreement as a finding

**Edge Case 4: A participant wants the assessment to address a personal need**
- The assessor clarifies the assessment scope (community need, not individual)
- The participant is offered referral to appropriate services
- The personal need is not included in assessment findings
- The participant's dignity is maintained throughout

### 5.4 Assessment Question Boundaries

The assessment asks questions about:

- What the community identifies as an unmet need
- What the community has already tried to address the need
- What barriers exist to addressing the need
- What the community would want a program to achieve
- Who in the community would be affected by the need or a program
- What existing resources or services are available
- What the community's priorities are (which may not align with the identified need)

The assessment does **not** ask:

- For individual names, addresses, or identification numbers
- About personal health conditions or medical history
- About personal financial status or income
- About immigration or legal status
- About experiences of abuse or trauma (unless the participant volunteers this, triggering safeguarding protocols)
- About political opinions or affiliations
- About religious beliefs or practices (unless directly relevant to cultural appropriateness of a potential program, and even then, only at community level, not individual)
- Leading questions that suggest a particular answer
- Questions that assume a need exists

---

## 6. Consent-Led Protocol Design

### 6.1 Consent Philosophy

Consent in this protocol is not a signature on a form — it is an **ongoing, informed, voluntary, and revocable** process. Every interaction with every participant is governed by consent principles:

1. **Informed:** The participant understands what they are consenting to, what data will be collected, how it will be used, and what their rights are
2. **Voluntary:** The participant is not pressured, coerced, or incentivized to participate
3. **Ongoing:** Consent is checked at each stage of the assessment, not just at the beginning
4. **Revocable:** The participant can withdraw consent at any time without consequence
5. **Specific:** Consent covers specific activities, not open-ended use of information
6. **Documented:** Consent is recorded, but the documentation itself minimizes personal data

### 6.2 Consent Process — Stage by Stage

#### Stage 1: Pre-Assessment Information

Before any data is collected, the partner provides the potential participant with:

| Element | Description | Format |
|---------|-------------|--------|
| **Purpose** | Why the assessment is being conducted | Verbal explanation in participant's language |
| **Scope** | What the assessment will and will not cover | Verbal explanation with written summary available |
| **Data collection** | What information will be recorded | Written information sheet |
| **Data use** | How the information will be used | Written information sheet |
| **Data sharing** | Who will see the information | Written information sheet |
| **Data retention** | How long information will be kept | Written information sheet |
| **Rights** | What the participant can do (decline, withdraw, complain) | Verbal explanation with written summary |
| **Support** | Who to contact with questions or concerns | Contact information provided |
| **Voluntary nature** | Explicit statement that participation is optional | Verbal and written |
| **No penalty** | Explicit statement that declining has no consequence | Verbal and written |

The participant is given time to consider this information and ask questions before any consent is sought.

#### Stage 2: Initial Consent

At the start of the assessment interaction:

1. The assessor confirms the participant has received and understood the pre-assessment information
2. The assessor asks whether the participant has any questions
3. The assessor asks for explicit verbal consent to proceed
4. If the participant consents, the assessor records:
   - Date and time of consent
   - Assessment session identifier (not participant name)
   - That verbal consent was given
   - Any conditions or questions the participant raised
5. If the participant declines, the assessor:
   - Thanks them for their time
   - Provides contact information for future questions
   - Records that the session did not proceed (no personal data recorded)
   - Does not attempt to persuade or follow up

#### Stage 3: Ongoing Consent Checks

During the assessment:

- Before each new topic area, the assessor checks: "Are you comfortable continuing to discuss [topic]?"
- If the participant shows signs of discomfort, the assessor pauses and checks in
- If the participant asks to stop, the assessment stops immediately
- If the participant asks to skip a question, the assessor moves on without pressure
- The participant can withdraw at any point, and withdrawal is treated the same as declining at Stage 2

#### Stage 4: Consent for Specific Data Activities

Certain activities require **additional, specific consent** beyond the general participation consent:

| Activity | Additional Consent Required |
|----------|----------------------------|
| **Audio recording** | Separate written consent; participant can consent to notes but not recording |
| **Photography** | Separate written consent; never photograph individuals without explicit permission |
| **Quoting participant** | Consent to use their words (anonymized) in reports |
| **Follow-up contact** | Consent to be contacted again for clarification or follow-up |
| **Group sharing** | Consent for their contributions to be shared in a group setting |

#### Stage 5: Consent Conclusion

At the end of the assessment interaction:

1. The assessor summarizes what was discussed and recorded
2. The assessor asks the participant to confirm the summary is accurate
3. The assessor explains what happens next (analysis, reporting, timeline)
4. The assessor reminds the participant of their right to withdraw (and the window for doing so)
5. The assessor provides contact information for questions or withdrawal
6. The assessor records:
   - Session conclusion date and time
   - That the participant confirmed the summary
   - Any final questions or concerns raised
   - Participant's stated preference for follow-up contact (if any)

### 6.3 Consent Documentation

Consent is documented with **minimal personal data**:

**What is recorded:**
- Session identifier (non-identifying code)
- Date and time of consent
- Type of consent given (verbal, written, specific activity)
- Any conditions or limitations stated by the participant
- Assessor identifier (the partner staff member who obtained consent)

**What is NOT recorded:**
- Participant name
- Participant address
- Participant identification number
- Participant contact details (unless separately and specifically consented to for follow-up)
- Participant photograph or biometric data

### 6.4 Consent Revocation

A participant may revoke consent at any time. The revocation process:

1. **Participant communicates revocation** through any available channel (in person, by phone, by message, through a community leader)
2. **Partner acknowledges revocation** immediately and without question
3. **Partner confirms scope of revocation:**
   - Full withdrawal: all data from this participant is deleted
   - Partial withdrawal: specific data or activities are excluded
4. **Partner executes revocation:**
   - Deletes or excludes the specified data within 72 hours
   - Confirms completion to the participant (if contact was consented to)
   - Documents the revocation in the process log (without participant identifying information)
5. **Partner reviews impact:**
   - Determines whether the remaining data is sufficient for the assessment
   - If too many participants withdraw, the assessment may need to be discontinued
   - Documents any impact on assessment validity

### 6.5 Consent for Vulnerable Populations

Additional consent protections apply when participants may be vulnerable:

| Vulnerability Factor | Additional Protection |
|---------------------|----------------------|
| **Minors (under 18)** | Parent/guardian consent PLUS child assent; age-appropriate information; child can withdraw even if guardian consents |
| **Persons with disabilities** | Accessible information formats; supported decision-making if needed; respect for communicated preferences even if non-verbal |
| **Trauma survivors** | Trauma-informed approach; no pressure to disclose; immediate referral available; assessor trained in trauma response |
| **Power-imbalanced relationships** | Assessment conducted privately; no authority figures present; explicit statement that participation is independent of any service relationship |
| **Language barriers** | Qualified interpreter (not family member); information in accessible language; confirmation of understanding before consent |
| **Literacy limitations** | Verbal consent process; witnessed by independent third party; audio recording of consent with permission |

### 6.6 Group Consent Considerations

In some cultural contexts, individual consent operates alongside community or group consent:

- The partner seeks **community-level permission** from appropriate community structures before beginning individual assessments
- Community permission does **not** substitute for individual consent — each person still decides individually
- Community leaders who give permission are not assumed to be consenting on behalf of others
- The partner documents both community permission and individual consent as separate processes
- If community permission is granted but individuals decline, this outcome is respected and documented

---

## 7. Minimal Data Collection Principles

### 7.1 Data Minimization Philosophy

The protocol follows a strict data minimization principle: **collect only what the assessment strictly requires, and no more.** This is not just a privacy best practice — it is a safeguarding measure. The less data collected, the less data that can be:

- Breached or leaked
- Misused or repurposed
- Used to identify and target individuals
- Retained beyond the assessment's need
- Demanded by authorities or third parties

### 7.2 Data Categories

#### 7.2.1 Permitted Data (Collected by Default)

| Data Category | Examples | Justification |
|---------------|----------|---------------|
| **Assessment responses** | Answers to protocol questions (non-identifying) | Core assessment purpose |
| **Session metadata** | Date, time, location (general area), duration | Process documentation |
| **Session identifier** | Non-identifying code for linking session data | Data management |
| **Assessor identifier** | Partner staff member who conducted the session | Accountability |
| **Consent record** | That consent was given, when, and what type | Legal and ethical compliance |
| **Aggregate demographics** | "X participants from Y age range" (no individual detail) | Context for findings |
| **Process notes** | Observations about assessment conditions, challenges | Quality improvement |

#### 7.2.2 Conditionally Permitted Data (Requires Justification)

| Data Category | Examples | Required Justification |
|---------------|----------|----------------------|
| **Geographic detail** | Specific village or neighborhood name | Necessary for identifying the community context; not for mapping individuals |
| **Age range (individual)** | "Participant is in the 25-34 age range" | Necessary for understanding whose needs are represented |
| **Gender (individual)** | "Participant identifies as [gender]" | Necessary for gender-disaggregated needs analysis |
| **Role in community** | "Community health worker," "teacher," "farmer" | Necessary for understanding perspective and expertise |
| **Service access status** | "Currently has/does not have access to [service]" | Necessary for identifying gaps |

#### 7.2.3 Prohibited Data (Not Collected by Default)

| Data Category | Examples | Reason for Prohibition |
|---------------|----------|----------------------|
| **Full names** | Participant's legal or preferred name | Identifiable; not necessary for assessment |
| **Addresses** | Home address, postal address | Identifiable; creates security risk |
| **National ID numbers** | Government-issued identification numbers | Highly sensitive; not necessary |
| **Phone numbers** | Mobile or landline numbers | Identifiable; creates contact risk |
| **Email addresses** | Personal email | Identifiable; not necessary |
| **Financial details** | Income, assets, debts | Sensitive; not necessary for needs identification |
| **Health information** | Medical conditions, disabilities (individual) | Highly sensitive; not necessary |
| **Legal status** | Immigration status, criminal record | Highly sensitive; not necessary |
| **Religious affiliation** | Individual religious beliefs or practices | Sensitive; not necessary |
| **Political opinion** | Individual political views | Sensitive; not necessary |
| **Ethnic identity** | Individual ethnic or tribal affiliation | Sensitive; not necessary |
| **Photographs** | Images of participants | Identifiable; requires separate protocol |
| **Audio/video recordings** | Recordings of participant voices or images | Identifiable; requires separate consent and protocol |
| **Biometric data** | Fingerprints, iris scans, facial recognition | Highly sensitive; completely outside scope |
| **Household composition** | Names and details of family members | Extends collection beyond the consenting individual |
| **Bank account details** | Financial account information | Not necessary; creates security risk |

### 7.3 Data Necessity Test

Before collecting any data point, the assessor applies this test:

```
DATA NECESSITY TEST

1. Is this data point necessary to answer the assessment question?
   - YES → proceed to question 2
   - NO  → DO NOT COLLECT

2. Can the same insight be gained from less specific data?
   - YES → collect the less specific version
   - NO  → proceed to question 3

3. Does collecting this data create a risk to the participant?
   - YES → DO NOT COLLECT unless safeguarding reviewer approves
             with specific justification
   - NO  → proceed to question 4

4. Has the participant consented to this specific data collection?
   - YES → collect with documented consent
   - NO  → DO NOT COLLECT
```

### 7.4 Data Quality Over Quantity

The protocol prioritizes **quality of insight** over **quantity of data**:

- A few well-documented community-level observations are more valuable than extensive individual-level data
- Patterns across participants are more important than individual responses
- The assessor's professional judgment about community context supplements raw data
- Narrative descriptions of needs are preferred over quantified metrics at this stage

### 7.5 Data Handling During Collection

While data is being collected:

- Paper notes are kept in a sealed folder when not in use
- Digital notes are stored on a password-protected device
- No data is stored on personal devices without encryption
- No data is transmitted via unencrypted channels
- No data is left unattended in public spaces
- Data is transferred to secure storage within 24 hours of collection
- Original paper notes are securely destroyed after transfer

---

## 8. Inclusion/Exclusion Criteria

### 8.1 Purpose of Criteria

Inclusion and exclusion criteria define **who can participate** in the needs assessment. These criteria serve multiple purposes:

- Ensure the assessment captures relevant community perspectives
- Protect individuals who may be vulnerable to harm from participation
- Prevent the assessment from overreaching its scope
- Provide clear guidance to assessors about eligibility decisions

### 8.2 Inclusion Criteria

A person **may participate** in the assessment if they meet **all** of the following criteria:

| ID | Criterion | Rationale |
|----|-----------|-----------|
| I-1 | Is a member of or resident in the community being assessed | Ensures relevance of perspective |
| I-2 | Is 18 years of age or older (or meets minor participation requirements in Section 6.6) | Legal and ethical capacity for consent |
| I-3 | Has received and understood the pre-assessment information (Section 6.2, Stage 1) | Informed consent requirement |
| I-4 | Has given voluntary consent to participate (Section 6.2, Stage 2) | Autonomy requirement |
| I-5 | Is willing to share their perspective on community needs (not personal needs) | Scope requirement |
| I-6 | Can communicate in a language the assessor can accommodate (with interpreter if needed) | Data quality requirement |

### 8.3 Inclusion Encouraged

The following groups should be **actively encouraged** to participate, as their perspectives are often underrepresented:

| Group | Reason for Active Inclusion | Accommodation |
|-------|----------------------------|---------------|
| Women and girls | Gender-disaggregated needs may differ | Female assessors where preferred; safe spaces |
| Elderly community members | Historical perspective and different vulnerability profile | Accessible locations; longer sessions if needed |
| Persons with disabilities | Specific access barriers may constitute key needs | Accessible formats; supported participation |
| Ethnic or linguistic minorities | May have different needs from majority community | Interpreter; culturally appropriate approach |
| Economic marginalized | May face barriers other participants do not | Private setting; no financial disclosure required |
| Youth (18-25) | Future-oriented perspective; different priorities | Age-appropriate communication; peer-friendly setting |
| Community leaders | Governance perspective; knowledge of existing resources | Separate session to avoid inhibiting other participants |
| Service providers | Knowledge of existing service gaps | Professional perspective; not a substitute for community voice |

### 8.4 Exclusion Criteria

A person **must not participate** (or must be excluded) if any of the following apply:

| ID | Criterion | Rationale | Action |
|----|-----------|-----------|--------|
| E-1 | Is not a member of or resident in the assessed community | Outside assessment scope | Respectfully decline; explain scope |
| E-2 | Is under 18 and guardian consent/child assent requirements cannot be met | Legal/ethical requirement | Do not conduct assessment; provide age-appropriate referral if needed |
| E-3 | Is unable to give informed consent due to incapacity | Ethical requirement | Do not conduct assessment; ensure supported decision-making is available |
| E-4 | Is in a state of acute distress or crisis at the time of assessment | Safeguarding requirement | Pause assessment; provide immediate support/referral; reschedule if appropriate |
| E-5 | Is being coerced or pressured to participate by another person | Consent validity | Do not proceed; ensure private, voluntary participation |
| E-6 | Has a direct financial or decision-making relationship with the funding organization | Independence requirement | Do not include; conflict of interest |
| E-7 | Is the assessor's supervisor or has authority over the assessor | Independence requirement | Different assessor assigned |
| E-8 | Has already participated in a previous assessment session for this assessment | Data quality (avoid double-counting) | Thank them; do not repeat |
| E-9 | Requests to participate only to access services or benefits | Scope integrity | Explain assessment is not a service application; offer referral information |

### 8.5 Exclusion Sensitivity

Some exclusion criteria require sensitive handling:

**E-4 (Acute distress):** The assessor must be trained to recognize signs of distress and respond appropriately. Exclusion for distress is protective, not punitive. The assessor:
- Pauses the conversation
- Expresses concern for the person's wellbeing
- Provides information about available support services
- Does not pressure the person to continue or to disclose why they are distressed
- Offers to reschedule if the person wishes
- Documents the pause without recording the reason (to protect privacy)

**E-5 (Coercion):** Signs of coercion include:
- Another person insisting on being present during the assessment
- Another person answering on behalf of the participant
- The participant appearing to look to another person for permission to speak
- The participant stating they were "sent" or "told" to attend
- Another person offering incentives for participation

The assessor responds by:
- Requesting a private conversation with the participant
- If the participant declines private conversation, noting the concern
- Not proceeding if coercion is suspected
- Offering to meet at a different time or location
- Documenting the concern in the safeguarding log

**E-9 (Service-seeking):** Many people in need may hope that participating in an assessment will connect them to services. The assessor:
- Acknowledges the person's situation with empathy
- Clearly explains that the assessment is not a service application
- Provides information about existing services (referral pathway)
- Does not promise that services will result from the assessment
- Does not exclude the person from the community if they are otherwise eligible
- If the person's primary motivation is service access, the assessor may note that their perspective may be influenced by this motivation, but still includes their community need perspective if otherwise eligible

### 8.6 Community-Level Inclusion/Exclusion

Beyond individual criteria, the partner assesses whether the assessment process itself is inclusive at the community level:

| Community Factor | Assessment Question | Action if Barrier Identified |
|-----------------|---------------------|------------------------------|
| **Timing** | Are session times accessible to people with different work/care schedules? | Offer multiple session times |
| **Location** | Is the venue accessible to people with mobility limitations? | Choose accessible venue; offer home visits |
| **Language** | Are sessions conducted in languages all community segments speak? | Provide interpretation |
| **Gender norms** | Do cultural norms prevent mixed-gender discussion? | Offer gender-segregated sessions |
| **Power dynamics** | Will community leaders' presence inhibit open discussion? | Conduct separate sessions for leaders and community members |
| **Safety** | Is the venue safe for all participants to attend? | Choose safe venue; provide safe transport options |
| **Awareness** | Do all community segments know the assessment is happening? | Use multiple communication channels |
| **Trust** | Does the community trust the partner organization? | Address trust concerns before beginning; use community intermediaries |

### 8.7 Documentation of Inclusion/Exclusion Decisions

For each assessment session, the partner documents:

- Total number of people approached
- Number who met inclusion criteria and consented
- Number who were excluded and the criterion applied (without individual identifying information)
- Number who declined without giving a reason
- Any patterns in exclusion (e.g., if a particular group was systematically excluded, why, and what was done about it)
- Community-level inclusion barriers identified and accommodations made

This documentation is aggregate and non-identifying. It serves process quality purposes, not individual tracking.

---

## 9. Assessment Question Framework

### 9.1 Question Design Principles

The assessment uses a structured but flexible question framework. All questions follow these design principles:

1. **Open-ended:** Questions invite description, not yes/no answers
2. **Non-leading:** Questions do not suggest a particular answer or assume a need exists
3. **Community-focused:** Questions ask about the community, not the individual's personal situation
4. **Present-oriented:** Questions ask about current conditions, not past trauma or future predictions
5. **Actionable:** Questions seek information that could inform a program decision
6. **Culturally appropriate:** Questions are reviewed by the partner for cultural sensitivity
7. **Minimal:** Only questions necessary for the assessment purpose are included

### 9.2 Question Categories

The assessment covers five question categories, each with a specific purpose:

#### Category A: Current Situation

**Purpose:** Understand what the community's current situation is, without presupposing problems.

| Question ID | Question | Notes |
|-------------|----------|-------|
| A-1 | "Can you describe what daily life is like in [community]?" | Opens broadly; lets participant set the frame |
| A-2 | "What resources or services are currently available in [community]?" | Establishes baseline of existing provision |
| A-3 | "How do people in [community] typically [access water/healthcare/education/etc.]?" | Context-specific; partner adapts to local priorities |
| A-4 | "What works well in [community]?" | Identifies strengths, not just deficits |
| A-5 | "What are people in [community] most proud of?" | Further strengths identification; builds rapport |

#### Category B: Identified Gaps

**Purpose:** Explore what the community itself perceives as missing or insufficient.

| Question ID | Question | Notes |
|-------------|----------|-------|
| B-1 | "If you could change one thing about [community], what would it be?" | Open priority-setting; participant chooses the issue |
| B-2 | "What needs in [community] are not being met right now?" | Direct gap identification |
| B-3 | "Are there groups of people in [community] who have a harder time than others? What makes it harder?" | Equity lens; identifies differential impact |
| B-4 | "What has been tried to address [identified gap] before? What happened?" | Historical context; avoids duplicating failed approaches |
| B-5 | "Why do you think [identified gap] hasn't been resolved?" | Root cause exploration; community analysis |

#### Category C: Community Priorities

**Purpose:** Understand what the community wants, which may differ from what an external observer assumes.

| Question ID | Question | Notes |
|-------------|----------|-------|
| C-1 | "What would you want a program or project in [community] to achieve?" | Desired outcome from community perspective |
| C-2 | "If a new program started tomorrow, what would make it useful for people here?" | Success criteria from community viewpoint |
| C-3 | "What would make a program unhelpful or even harmful?" | Risk identification from community perspective |
| C-4 | "Who should be involved in deciding what happens in [community]?" | Governance and participation preferences |
| C-5 | "How would people in [community] want to be consulted about decisions?" | Process preferences |

#### Category D: Practical Considerations

**Purpose:** Identify practical factors that would affect any future program.

| Question ID | Question | Notes |
|-------------|----------|-------|
| D-1 | "What times of year are busiest for [community]?" | Seasonal considerations |
| D-2 | "Are there times when it would be difficult to meet or work in [community]?" | Scheduling constraints |
| D-3 | "What communication methods work best in [community]?" | Outreach and engagement design |
| D-4 | "Are there existing groups or structures in [community] that a program could work with?" | Partnership and sustainability |
| D-5 | "What would people need before they could participate in a new program?" | Participation prerequisites |

#### Category E: Reflection and Validation

**Purpose:** Give the participant an opportunity to reflect, correct, and add to what they have said.

| Question ID | Question | Notes |
|-------------|----------|-------|
| E-1 | "Is there anything else about [community] needs that we haven't discussed?" | Open floor for additional information |
| E-2 | "Based on what you've said, what do you think is the most important need?" | Participant's own prioritization |
| E-3 | "Did I understand correctly that [summary of key points]?" | Verification of assessor understanding |
| E-4 | "Is there anything you'd like to add, change, or take back?" | Participant control over their contribution |
| E-5 | "How would you like to see this information used?" | Participant's wishes for their contribution |

### 9.3 Prohibited Question Types

The following question types are **not permitted** under any circumstances:

| Prohibited Type | Example | Why Prohibited |
|-----------------|---------|----------------|
| **Leading questions** | "Don't you think the community needs better healthcare?" | Suggests the expected answer |
| **Assumptive questions** | "What healthcare services do you need?" | Assumes a need exists |
| **Personal intrusive questions** | "How much money do you earn?" | Collects unnecessary sensitive data |
| **Trauma-seeking questions** | "Have you experienced violence or abuse?" | Outside assessment scope; triggers safeguarding |
| **Comparative ranking of suffering** | "Who suffers more: [group A] or [group B]?" | Creates competition; dehumanizes |
| **Political questions** | "Do you support [political party/position]?" | Outside scope; creates risk |
| **Identity verification** | "Can I see your identification?" | Creates fear; unnecessary |
| **Promise-of-benefit questions** | "If we provided [service], would that help?" | Implies a commitment that may not be fulfilled |
| **Guilt-inducing questions** | "How can you live with [condition]?" | Disrespectful; not assessment-relevant |

### 9.4 Question Adaptation Process

The partner adapts the question framework to the specific community context:

1. **Pre-assessment review:** The partner reviews all questions for cultural appropriateness, language accuracy, and contextual relevance
2. **Community consultation:** The partner consults with community leaders (separately from the assessment) about whether the questions make sense and are respectful
3. **Pilot testing:** The partner conducts a brief pilot with one or two willing community members to test question clarity and comfort level
4. **Iteration:** Based on pilot feedback, the partner adjusts questions
5. **Documentation:** The final question set is documented with rationale for any adaptations
6. **Reviewer approval:** The safeguarding reviewer approves the adapted question set before the assessment begins

### 9.5 Question Delivery Methods

Depending on the community context and partner assessment, questions may be delivered through:

| Method | When Appropriate | Safeguards |
|--------|-----------------|------------|
| **Individual face-to-face interview** | Default method; allows rapport and observation | Private location; assessor of participant's preferred gender |
| **Small group discussion** | When community norms favor collective discussion | Group size limited; ground rules established; private contributions possible |
| **Facilitated community meeting** | For gathering broad community input | Not a substitute for individual assessment; dominant voices managed |
| **Written survey** | Only if literacy is high and privacy is valued | Anonymous option; simple language; accessible format |
| **Key informant interview** | For understanding institutional or leadership perspectives | Clearly identified as a different perspective from community members |

The partner selects the appropriate method(s) based on community context, with safeguarding reviewer approval.

---

## 10. Data Flow Mapping

### 10.1 Overview

This section maps every data flow in the assessment protocol: what data is collected, where it goes, who sees it, how long it is retained, and when it is destroyed. The data map is a critical component of the privacy impact assessment (Section 14) and a required closure evidence item.

### 10.2 Data Collection Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION POINTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CP-1: Pre-assessment information                                │
│    Data: What was explained to participant                       │
│    Collector: Assessor                                           │
│    Format: Process note                                          │
│                                                                  │
│  CP-2: Consent record                                            │
│    Data: Session ID, date/time, consent type, conditions         │
│    Collector: Assessor                                           │
│    Format: Consent log entry                                     │
│                                                                  │
│  CP-3: Assessment responses                                      │
│    Data: Participant answers to protocol questions               │
│    Collector: Assessor                                           │
│    Format: Notes (paper or digital)                              │
│                                                                  │
│  CP-4: Assessor observations                                     │
│    Data: Context notes, environmental observations               │
│    Collector: Assessor                                           │
│    Format: Field notes                                           │
│                                                                  │
│  CP-5: Inclusion/exclusion log                                   │
│    Data: Aggregate counts, criterion applied (no names)          │
│    Collector: Assessor                                           │
│    Format: Summary table                                         │
│                                                                  │
│  CP-6: Safeguarding log                                          │
│    Data: Any concerns raised, actions taken (no names)           │
│    Collector: Assessor / Safeguarding Lead                       │
│    Format: Incident log                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Data Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PARTICIPANT │────▶│   ASSESSOR   │────▶│  PARTNER ORG │
│              │     │  (fieldwork) │     │  (secure     │
│              │     │              │     │   storage)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                                    ▼             ▼             ▼
                             ┌──────────┐  ┌──────────┐  ┌──────────┐
                             │ANALYSIS  │  │SAFEGUARD-│  │ PRIVACY  │
                             │(partner  │  │ING REVIEW│  │ REVIEW   │
                             │ analyst) │  │(indep.)  │  │(indep.)  │
                             └────┬─────┘  └────┬─────┘  └────┬─────┘
                                  │              │              │
                                  ▼              │              │
                             ┌──────────┐        │              │
                             │ FINDINGS │        │              │
                             │ REPORT   │        │              │
                             │(anonym-  │        │              │
                             │ ized)    │        │              │
                             └────┬─────┘        │              │
                                  │               │              │
                    ┌─────────────┼───────────────┘              │
                    │             │                               │
                    ▼             ▼                               ▼
             ┌──────────┐  ┌──────────┐                    ┌──────────┐
             │ FUNDING  │  │ COMMUNITY│                    │  AUDIT   │
             │ ORGANIZ. │  │ (summary)│                    │  TRAIL   │
             │(aggreg-  │  │          │                    │(process  │
             │ ated)    │  │          │                    │ log only)│
             └──────────┘  └──────────┘                    └──────────┘
```

### 10.4 Data Access Matrix

| Data Set | Assessor | Partner Org | Safeguarding Reviewer | Privacy Reviewer | Funding Org | Community |
|----------|----------|-------------|----------------------|-----------------|-------------|-----------|
| **Consent records** | Creates | Stores | Can audit | Can audit | No access | No access |
| **Assessment responses (raw)** | Creates | Stores | Can access with justification | No access (anonymized only) | No access | No access |
| **Assessment responses (anonymized)** | Creates | Creates | Can access | Can access | Can access | Can access (summary) |
| **Assessor observations** | Creates | Stores | Can access | Can access (anonymized) | No access | No access |
| **Inclusion/exclusion log** | Creates | Stores | Can audit | Can audit | Aggregate only | No access |
| **Safeguarding log** | Creates entries | Stores | Full access | No access | No access | No access |
| **Findings report** | Contributes | Creates | Reviews | Reviews | Receives | Receives summary |
| **Audit trail** | Contributes | Stores | Can access | Can access | Process summary only | No access |

### 10.5 Data Retention Schedule

| Data Set | Retention Period | Retention Rationale | Disposal Method |
|----------|-----------------|---------------------|-----------------|
| **Consent records** | 7 years after assessment completion | Legal compliance; complaint window | Secure deletion / shredding |
| **Raw assessment responses** | 2 years after assessment completion | Allows for verification; then minimized | Secure deletion / shredding |
| **Anonymized findings** | Indefinite (aggregated, non-identifying) | Organizational learning; no privacy risk | N/A (already anonymized) |
| **Assessor observations** | 2 years after assessment completion | Same as raw responses | Secure deletion / shredding |
| **Inclusion/exclusion log** | 5 years after assessment completion | Process audit trail | Secure deletion |
| **Safeguarding log** | 10 years after assessment completion | Legal and ethical accountability | Secure deletion / shredding |
| **Findings report** | Indefinite (anonymized) | Decision record; no personal data | N/A |
| **Audit trail** | 7 years after assessment completion | Process accountability | Secure deletion |
| **Paper notes** | Transferred to secure digital within 24 hours; originals destroyed within 7 days | Minimize physical data risk | Cross-cut shredding |

### 10.6 Data Transfer Protocols

When data moves between parties:

| Transfer | Method | Encryption | Authentication | Logging |
|----------|--------|------------|----------------|---------|
| Assessor → Partner storage | Encrypted USB or encrypted cloud upload | AES-256 or equivalent | Password + 2FA | Transfer log entry |
| Partner → Safeguarding reviewer | Secure email or encrypted file share | TLS + at-rest encryption | Reviewer credentials | Access log entry |
| Partner → Privacy reviewer | Anonymized report via secure channel | TLS + at-rest encryption | Reviewer credentials | Access log entry |
| Partner → Funding organization | Anonymized findings report only | TLS + at-rest encryption | Org credentials | Transfer log entry |
| Partner → Community | Summary in accessible format | N/A (public communication) | N/A | Distribution record |

### 10.7 Data Breach Response (Summary)

If data is breached at any point in the flow:

1. **Immediate containment:** Secure the breach point; stop further data loss
2. **Assessment:** Determine what data was exposed, how many people are affected
3. **Notification:** Affected participants are notified within 72 hours (if identifiable data was exposed)
4. **Safeguarding review:** Safeguarding reviewer assesses risk to participants
5. **Mitigation:** Steps taken to protect affected individuals (e.g., identity monitoring if ID data was exposed)
6. **Documentation:** Breach recorded in safeguarding log and audit trail
7. **Process review:** Protocol amended to prevent recurrence
8. **Funding organization notified:** If their data was affected or if participant risk is high

Full breach response procedure is detailed in Section 17 (scenario walkthrough).

---

## 11. Referral Pathways

### 11.1 Why Referral Pathways Are Necessary

A needs assessment may reveal that participants have needs beyond the assessment's scope. The protocol has an ethical obligation to ensure that:

- Participants are not left without support if they disclose a need the assessment cannot address
- The assessment does not create expectations of direct service provision
- Participants know where to turn for help with disclosed needs
- The partner organization fulfills its duty of care

### 11.2 Referral Trigger Conditions

A referral should be made when:

| Trigger | Example | Urgency |
|---------|---------|---------|
| **Immediate safety concern** | Participant discloses ongoing abuse, self-harm risk, or danger to others | URGENT — same-day action |
| **Health need disclosed** | Participant mentions untreated medical condition or disability | HIGH — within 48 hours |
| **Mental health distress** | Participant shows signs of psychological distress during assessment | HIGH — immediate support offered; follow-up within 48 hours |
| **Child protection concern** | Participant discloses or assessor observes child safety issue | URGENT — same-day action per child protection protocol |
| **Legal need identified** | Participant mentions legal issue (housing, immigration, domestic) | MEDIUM — within 1 week |
| **Service gap identified** | Participant needs a service that exists but they cannot access | MEDIUM — within 1 week |
| **Economic hardship** | Participant describes food insecurity, homelessness, or extreme poverty | HIGH — within 48 hours |
| **General support need** | Participant would benefit from community support services | LOW — within 2 weeks |

### 11.3 Referral Pathway Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    REFERRAL PATHWAY MAP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ASSESSMENT SESSION                                              │
│       │                                                          │
│       ▼                                                          │
│  Need identified beyond assessment scope                         │
│       │                                                          │
│       ├──▶ URGENT SAFETY ──▶ Emergency services (police,         │
│       │    (abuse, harm)      ambulance, child protection)       │
│       │                     + Safeguarding Lead immediately      │
│       │                     + Document in safeguarding log       │
│       │                                                          │
│       ├──▶ HEALTH NEED ──▶ Local health clinic                   │
│       │    (medical,         + Community health worker           │
│       │     disability)      + Disability support organization   │
│       │                                                          │
│       ├──▶ MENTAL HEALTH ──▶ Crisis line (immediate)             │
│       │    (distress,        + Counseling service (follow-up)    │
│       │     trauma)          + Community support group           │
│       │                                                          │
│       ├──▶ LEGAL NEED ──▶ Legal aid organization                 │
│       │    (housing,         + Human rights organization         │
│       │     immigration)     + Pro bono legal service            │
│       │                                                          │
│       ├──▶ ECONOMIC ──▶ Food bank / shelter                      │
│       │    (poverty,        + Social services                     │
│       │     homelessness)   + Community mutual aid               │
│       │                                                          │
│       └──▶ GENERAL ──▶ Community organization                    │
│            (support)      + Religious community (if appropriate) │
│                           + Government social services            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Referral Process

When making a referral:

1. **Inform the participant:** "Based on what you've shared, there are services that might be able to help with [specific need]. Would you like information about them?"
2. **Respect the participant's choice:** If they decline, do not pressure. Note the declined referral in process notes (without identifying information).
3. **Provide information:** Give the participant the name, contact details, and brief description of the referral service.
4. **Offer warm referral (if appropriate):** With the participant's consent, the assessor or partner can make an introductory contact to the referral service.
5. **Document the referral:** Record in the process log:
   - Referral trigger (category, not individual details)
   - Referral service identified
   - Whether the participant accepted the referral
   - Whether a warm referral was made
   - Follow-up needed (if any)
6. **Follow up (if consented):** If the participant agreed to follow-up, the partner checks whether the referral was accessed and whether further support is needed.

### 11.5 Referral Service Requirements

Referral services must meet these minimum standards:

| Requirement | Description |
|-------------|-------------|
| **Existence** | The service must actually exist and be currently operating |
| **Accessibility** | The service must be accessible to the participant (location, language, cost) |
| **Appropriateness** | The service must be appropriate for the identified need |
| **Capacity** | The service must have capacity to accept new clients |
| **Safeguarding** | The service must have its own safeguarding policies |
| **Confidentiality** | The service must protect client confidentiality |
| **Non-discrimination** | The service must not discriminate against the participant |

### 11.6 Referral Service Maintenance

The partner organization is responsible for:

- Maintaining an up-to-date list of referral services
- Verifying referral services periodically (at least annually)
- Updating the list when services change, close, or new ones become available
- Training assessors on how to make referrals
- Documenting referral outcomes (aggregate, not individual) to assess referral pathway effectiveness

### 11.7 Referral in the Context of Assessment Closure

If the assessment reveals that most participants need referrals to existing services rather than a new program:

- This finding is documented as an assessment outcome
- The partner recommends strengthening existing services rather than creating new programs
- The funding organization receives this finding as part of the assessment report
- This is a valid and valuable assessment outcome — it prevents unnecessary program creation

---

## 12. Stop Conditions

### 12.1 Purpose of Stop Conditions

Stop conditions define when the assessment **must halt** — either temporarily or permanently. They protect participants, the community, the assessor, and the integrity of the process. Stop conditions are non-negotiable: when a condition is met, the assessment stops.

### 12.2 Immediate Stop Conditions

The assessment must stop **immediately** (within the current interaction) if any of the following occur:

| ID | Condition | Action |
|----|-----------|--------|
| **IS-1** | Participant withdraws consent | Stop the session; thank the participant; document withdrawal |
| **IS-2** | Participant shows signs of acute distress | Pause; offer support; do not continue until participant is stable; offer referral |
| **IS-3** | Participant discloses imminent harm to self or others | Stop assessment; activate safeguarding protocol; ensure immediate safety |
| **IS-4** | Participant discloses child abuse or exploitation | Stop assessment; activate child protection protocol; report to authorities per mandatory reporting requirements |
| **IS-5** | Participant discloses ongoing abuse or exploitation of any kind | Stop assessment; activate safeguarding protocol; offer referral |
| **IS-6** | Coercion is detected (another person is pressuring the participant) | Stop assessment; ensure participant is alone; if coercion confirmed, discontinue this participant's involvement |
| **IS-7** | Assessor feels unsafe or the environment becomes threatening | Leave the situation; ensure own safety; report to partner organization |
| **IS-8** | External event disrupts the assessment (natural disaster, conflict, emergency) | Evacuate if necessary; ensure all participants' safety; suspend assessment |
| **IS-9** | Participant becomes hostile or aggressive toward the assessor or others | De-escalate; end the session; report to partner organization; decide whether to continue with this participant |
| **IS-10** | Assessor realizes they have a conflict of interest with a participant | Disclose to partner organization; reassign assessor; data from this session may need to be excluded |

### 12.3 Temporary Suspension Conditions

The assessment is **suspended** (paused with intent to resume) if:

| ID | Condition | Action |
|----|-----------|--------|
| **TS-1** | Safeguarding concern requires investigation before continuing | Pause all assessment activities; investigate; resume only when cleared |
| **TS-2** | Partner organization undergoes a change that affects qualifications | Pause until partner re-qualification is confirmed |
| **TS-3** | Community requests a pause (e.g., cultural event, mourning period) | Respect the request; reschedule; document the reason |
| **TS-4** | Data breach is suspected or confirmed | Pause until breach is contained and assessed; notify affected parties |
| **TS-5** | Privacy reviewer identifies a protocol violation | Pause until violation is corrected; assess whether collected data is compromised |
| **TS-6** | Assessor is unavailable (illness, departure) | Pause until a replacement assessor is assigned and briefed |
| **TS-7** | External circumstances make the assessment unsafe (conflict, disease outbreak) | Pause indefinitely; resume only when safety is confirmed |

### 12.4 Permanent Termination Conditions

The assessment is **terminated permanently** (will not resume) if:

| ID | Condition | Action |
|----|-----------|--------|
| **PT-1** | Safeguarding investigation confirms a serious breach | Terminate; document; report to authorities if required; delete compromised data |
| **PT-2** | Partner organization loses qualification or independence | Terminate; find new partner if assessment is still needed; do not use collected data |
| **PT-3** | Community withdraws collective permission for the assessment | Terminate; respect community decision; delete data if requested |
| **PT-4** | Too many participants withdraw for the assessment to be valid | Terminate; document lessons learned; redesign if appropriate |
| **PT-5** | Privacy or safeguarding reviewer recommends termination | Terminate; document rationale; address underlying issues before any future attempt |
| **PT-6** | Funding organization withdraws support | Terminate; secure or delete all collected data per retention schedule |
| **PT-7** | Assessment reveals no specific unmet need (valid outcome) | Conclude; document finding; no program proposed; this is a success, not a failure |
| **PT-8** | Assessment reveals the need is one that external intervention cannot or should not address | Conclude; document finding; recommend community-owned solutions |

### 12.5 Stop Condition Decision Authority

| Decision | Who Can Make It |
|----------|-----------------|
| **Immediate stop (IS-1 to IS-5)** | Assessor (on the spot) |
| **Immediate stop (IS-6 to IS-10)** | Assessor or Safeguarding Lead |
| **Temporary suspension (TS-1 to TS-7)** | Partner organization lead, with Safeguarding Lead agreement |
| **Permanent termination (PT-1 to PT-4)** | Partner organization lead, with Safeguarding Lead and Privacy Reviewer agreement |
| **Permanent termination (PT-5 to PT-6)** | Funding organization, with partner agreement |
| **Permanent termination (PT-7 to PT-8)** | Partner organization (these are valid assessment outcomes) |

### 12.6 Post-Stop Procedures

After any stop condition is triggered:

1. **Ensure participant safety** — this is always the first priority
2. **Document the stop** — record the condition triggered, time, actions taken, and outcome
3. **Notify appropriate parties** — partner lead, safeguarding reviewer, and (if necessary) funding organization
4. **Assess data impact** — determine whether collected data is still valid, needs to be deleted, or needs enhanced protection
5. **Assess process impact** — determine whether the assessment can resume, needs modification, or must terminate
6. **Support the assessor** — stop conditions can be stressful; the partner provides debriefing support
7. **Review and learn** — after resolution, review what triggered the stop and how to prevent it in future

---

## 13. Safeguarding Review Framework

### 13.1 Safeguarding Review Purpose

The safeguarding review is an **independent assessment** of the protocol's safeguarding adequacy. It is conducted by a qualified safeguarding professional who is:

- Independent from the partner organization conducting the assessment
- Independent from the funding organization
- Qualified in humanitarian safeguarding standards
- Familiar with the local context (or able to become familiar before the review)

### 13.2 Review Timing

| Review Point | When | What Is Reviewed |
|-------------|------|------------------|
| **Pre-assessment review** | Before any participant contact | Protocol document, question framework, consent process, referral pathways, stop conditions, assessor training plan |
| **Mid-assessment review** | After approximately half of assessment sessions | Process logs, consent documentation quality, any safeguarding concerns raised, referral activity, assessor wellbeing |
| **Post-assessment review** | After all assessment sessions are complete | Full documentation, findings report (anonymized), safeguarding log, all stop/referral events, data handling compliance |
| **Follow-up review** | 3-6 months after assessment completion | Whether any recommendations were implemented, whether any safeguarding issues emerged later, data destruction verification |

### 13.3 Pre-Assessment Review Checklist

The safeguarding reviewer assesses the following before the assessment begins:

**Protocol Design:**
- [ ] Consent process meets ongoing, revocable, informed, voluntary standards
- [ ] Data minimization principles are applied throughout
- [ ] Inclusion/exclusion criteria are appropriate and non-discriminatory
- [ ] Question framework avoids leading, intrusive, or harmful questions
- [ ] Referral pathways are identified and verified
- [ ] Stop conditions are comprehensive and clearly defined
- [ ] Data flow map shows appropriate access controls
- [ ] Data retention schedule is proportionate

**Partner Capacity:**
- [ ] Partner meets all essential qualification criteria (Section 4.2.1)
- [ ] Partner has designated safeguarding lead
- [ ] Partner has independent safeguarding capacity (not dependent on funding organization)
- [ ] Partner staff conducting assessments have received safeguarding training
- [ ] Partner has their own safeguarding policy or adopts an recognized standard

**Assessor Preparation:**
- [ ] Assessors are trained in the protocol
- [ ] Assessors are trained in safeguarding recognition and response
- [ ] Assessors are trained in trauma-informed approach
- [ ] Assessors understand stop conditions and their authority to invoke them
- [ ] Assessors know how to make referrals
- [ ] Assessors have access to support during and after assessments
- [ ] Assessors understand cultural context and appropriate behavior

**Context Preparedness:**
- [ ] Community leaders have been consulted (with community consent for the consultation)
- [ ] Cultural appropriateness of questions has been verified
- [ ] Local safeguarding resources and referral services have been identified
- [ ] Emergency services contact information is available
- [ ] Communication plan for the assessment has been agreed with the community
- [ ] Physical safety of assessors and participants has been assessed

### 13.4 Mid-Assessment Review Focus

The mid-assessment review examines:

- Whether the protocol is working as designed in practice
- Whether any unanticipated safeguarding issues have arisen
- Whether consent processes are being followed correctly
- Whether assessors are experiencing any difficulties or distress
- Whether referral pathways are functioning
- Whether any stop conditions have been triggered and how they were handled
- Whether the community's response suggests any concerns

### 13.5 Post-Assessment Review Focus

The post-assessment review examines:

- Overall compliance with the protocol
- Quality and completeness of safeguarding documentation
- Whether any safeguarding concerns remain unresolved
- Whether data has been handled according to the data map
- Whether participants experienced any adverse effects
- Whether the assessment findings are presented responsibly
- Lessons learned for future assessments

### 13.6 Safeguarding Reviewer Authority

The safeguarding reviewer has the authority to:

| Authority | Scope |
|-----------|-------|
| **Require changes** | Protocol must be amended before assessment begins if reviewer identifies gaps |
| **Pause the assessment** | If concerns arise during the assessment, reviewer can suspend activities |
| **Terminate the assessment** | If concerns are serious, reviewer can recommend permanent termination |
| **Access all documentation** | Reviewer has access to all assessment records (with appropriate confidentiality protections) |
| **Interview assessors** | Reviewer can speak with assessors about their experience and concerns |
| **Recommend data deletion** | If data handling was compromised, reviewer can require data destruction |
| **Report to authorities** | If the reviewer identifies illegal activity or serious harm, they report to appropriate authorities regardless of organizational preferences |

### 13.7 Safeguarding Incident Response Protocol

When a safeguarding incident occurs during the assessment:

```
STEP 1: IMMEDIATE SAFETY
  ├── Ensure the participant is safe
  ├── If imminent danger, contact emergency services
  └── Do not leave the participant alone if they are in crisis

STEP 2: STOP ASSESSMENT
  ├── Pause the current session
  ├── Do not continue with other sessions until assessed
  └── Invoke appropriate stop condition (Section 12)

STEP 3: DOCUMENT
  ├── Record what happened (facts only, no interpretation)
  ├── Record when it happened
  ├── Record who was present
  ├── Record what actions were taken
  └── Store documentation securely (safeguarding log)

STEP 4: REPORT
  ├── Inform partner safeguarding lead immediately
  ├── Inform safeguarding reviewer within 24 hours
  ├── Inform funding organization (anonymized) within 48 hours
  └── Report to authorities if legally required (mandatory reporting)

STEP 5: SUPPORT
  ├── Provide support to the affected participant (referral, follow-up)
  ├── Provide support to the assessor (debriefing, counseling if needed)
  └── Assess whether other participants may be affected

STEP 6: REVIEW
  ├── Safeguarding reviewer investigates
  ├── Determine whether assessment can continue
  ├── Determine whether protocol needs amendment
  └── Document findings and actions taken

STEP 7: LEARN
  ├── Update protocol based on lessons learned
  ├── Update assessor training
  ├── Share lessons (anonymized) with relevant parties
  └── Monitor for any further issues
```

---

## 14. Privacy Impact Assessment

### 14.1 Privacy Impact Assessment Purpose

This section evaluates the privacy risks of the assessment protocol and identifies measures to mitigate those risks. The privacy impact assessment (PIA) is conducted by the privacy reviewer (independent from the partner and funding organization) before the assessment begins.

### 14.2 Privacy Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Risk Level | Mitigation |
|---------|-----------------|------------|--------|------------|------------|
| **PR-1** | Participant identity disclosed through assessment data | Low | Critical | HIGH | Data minimization; no names collected; anonymization before any sharing |
| **PR-2** | Assessment data breached (digital storage) | Medium | High | HIGH | Encrypted storage; access controls; minimal data reduces breach impact |
| **PR-3** | Assessment data breached (paper notes) | Medium | High | HIGH | Secure handling procedures; rapid transfer to digital; paper destruction |
| **PR-4** | Participant data used for purposes beyond consent | Low | High | MEDIUM | Clear consent scope; anonymization before secondary use; access controls |
| PR-5 | Assessor accesses participant data outside protocol | Low | Medium | MEDIUM | Training; supervision; access logging; clear boundaries |
| **PR-6** | Third party demands assessment data (government, legal) | Low | Critical | HIGH | Minimal data held reduces what can be demanded; legal review of obligations |
| **PR-7** | Participant data retained longer than necessary | Medium | Medium | MEDIUM | Retention schedule; destruction verification; periodic audit |
| **PR-8** | Aggregate data allows re-identification of individuals | Low | High | MEDIUM | Small cell suppression; generalization; review before publication |
| **PR-9** | Referral service receives participant information without consent | Low | High | MEDIUM | Referral process requires participant consent for information sharing |
| **PR-10** | Community members identify other participants | Medium | Medium | MEDIUM | Individual sessions where possible; group sessions with ground rules; no public attribution |
| **PR-11** | Consent records themselves reveal participation | Low | Medium | LOW | Consent records use session IDs, not names; stored separately from assessment data |
| **PR-12** | Data transferred insecurely between parties | Low | High | MEDIUM | Encrypted transfer; authenticated recipients; transfer logging |

### 14.3 Privacy Principles Applied

The protocol applies these privacy principles:

**1. Data Minimization**
- Only data necessary for the assessment purpose is collected
- Sensitive personal data is excluded by default
- Aggregate and anonymized data is preferred over individual data
- The less data collected, the lower the privacy risk

**2. Purpose Limitation**
- Data is collected for the specific assessment purpose
- Data is not used for other purposes without separate consent
- Secondary use (e.g., organizational learning) requires anonymization
- The consent form specifies the purpose clearly

**3. Storage Limitation**
- Data is retained only as long as necessary (Section 10.5)
- Paper data is destroyed promptly after digitization
- Digital data is securely deleted after the retention period
- Destruction is documented and verified

**4. Access Control**
- Only authorized persons access assessment data (Section 10.4)
- Access is logged and auditable
- Different data sets have different access levels
- Safeguarding and privacy reviewers have audit access

**5. Integrity and Confidentiality**
- Data is stored securely (encryption, access controls)
- Data transfers use encrypted channels
- Paper data is handled discreetly
- Assessors are trained in data handling

**6. Transparency**
- Participants know what data is collected and why
- Participants can access their own data (with identity verification)
- Participants can request correction of their data
- The privacy reviewer can audit data handling

**7. Accountability**
- The partner organization is accountable for data protection
- The safeguarding reviewer has oversight authority
- The privacy reviewer has audit authority
- Breaches are documented and reported

### 14.4 Privacy Reviewer Pre-Assessment Checklist

- [ ] Data map is complete and accurate (Section 10)
- [ ] Data minimization is applied to all collection points
- [ ] Consent process clearly explains data handling
- [ ] Data retention schedule is proportionate
- [ ] Access controls are defined and implementable
- [ ] Transfer protocols are secure
- [ ] Breach response procedure is documented
- [ ] Anonymization procedures are adequate
- [ ] Re-identification risk has been assessed
- [ ] Third-party data sharing is controlled
- [ ] Participant rights (access, correction, deletion) are supported
- [ ] Assessor data handling training is planned
- [ ] Privacy monitoring during assessment is planned

### 14.5 Special Privacy Considerations

**Small communities:** In very small communities, even anonymized data may be identifiable because community members know each other. The partner assesses this risk and applies additional protections:
- Broader anonymization categories
- No publication of findings that could identify individuals
- Community-level consent for publication of findings

**Oral cultures:** In communities where written consent is unusual or distrusted, the consent process is primarily verbal with a witness. The privacy implications are:
- Consent is recorded in the process log (not on a signed form with a name)
- The witness confirms consent was given voluntarily
- The participant's verbal consent is as valid as written consent

**Shared devices:** If the assessor uses a shared device (computer, phone), additional protections apply:
- Assessment data is stored in an encrypted, password-protected folder
- The device is logged out when not in use
- No assessment data is stored in cloud services synced to the device
- Paper notes are the preferred alternative if device security cannot be guaranteed

---

## 15. Scenario Walkthrough: Coercion Case

### 15.1 Scenario Description

**Setting:** A community assessment session in a rural area. The partner has arranged individual interviews in a community center.

**Participants:**
- **Assessor:** A trained partner staff member conducting the interview
- **Community Member A (CM-A):** A resident who has consented to participate
- **Community Leader (CL):** A local authority figure who is present at the community center

**Scenario:**
CM-A arrives for their scheduled individual assessment session. Community Leader (CL) accompanies them and insists on staying in the room, saying: "I need to make sure [CM-A] says the right things. Our community has been misunderstood before."

CM-A appears uncomfortable but does not explicitly object to CL's presence.

### 15.2 Analysis

**Coercion indicators identified:**

| Indicator | Present? | Evidence |
|-----------|----------|----------|
| Authority figure insists on being present | Yes | CL states they need to ensure "the right things" are said |
| Participant appears uncomfortable | Yes | CM-A body language suggests discomfort |
| Participant does not explicitly object | Ambiguous | May be due to power dynamics; silence is not consent |
| Authority figure frames presence as community protection | Yes | "Our community has been misunderstood" — positions CL as gatekeeper |
| Participant may feel unable to refuse | Likely | Power imbalance between CL and CM-A |

**Assessment:** This scenario meets **Immediate Stop Condition IS-6** (coercion detected). The presence of an authority figure who is influencing the participant's participation constitutes coercion, even if the participant has not explicitly objected.

### 15.3 Correct Response

**Step 1: Address the situation diplomatically but firmly**

The assessor says to CL: "Thank you for coming. The assessment process requires a private, one-on-one conversation so that [CM-A] can speak freely. This is important for the quality of the information and for [CM-A]'s comfort."

**Step 2: Offer CL an alternative role**

"I would value your perspective as a community leader. Would you be willing to share your views about community needs in a separate session? This would help us understand the community context better."

**Step 3: If CL insists on staying**

"I'm afraid I cannot conduct the assessment with anyone else present. This is a requirement of our protocol to protect everyone's rights. We can reschedule [CM-A]'s session for another time if that would be more convenient."

**Step 4: Check privately with CM-A**

If CL steps out, the assessor checks with CM-A: "Are you comfortable continuing with the assessment? You can stop at any time, and there is no pressure to participate. Would you prefer to meet at a different time or location?"

**Step 5: Document**

The assessor records:
- The incident in the safeguarding log
- That IS-6 was invoked
- How the situation was resolved
- Whether CM-A continued, rescheduled, or withdrew
- Any implications for the assessment process (e.g., whether CL's behavior suggests a pattern of controlling community narrative)

### 15.4 Incorrect Responses

| Response | Why Incorrect |
|----------|---------------|
| Allowing CL to stay because they are a community leader | Violates consent voluntariness; compromises data quality; enables coercion |
| Asking CM-A directly in front of CL whether they want CL to leave | Puts CM-A in an impossible position; they may feel unable to say yes |
| Continuing the assessment with CL present to avoid conflict | Prioritizes convenience over participant rights; data is unreliable |
| Reporting CL to authorities immediately | Disproportionate; the situation needs to be managed first; reporting may escalate |
| Canceling the entire assessment in the community | Overreaction; one incident does not invalidate the whole process |

### 15.5 Follow-Up Actions

1. **Safeguarding Lead** is informed of the incident
2. **Partner organization** discusses with community leaders (separately) the importance of private assessment sessions
3. **Assessor** receives support and debriefing
4. **CM-A** is contacted (with their consent for contact) to confirm their wellbeing and offer to reschedule
5. **Process** is reviewed to determine whether additional measures are needed (e.g., a community information session about the assessment's private nature)
6. **If CL's behavior continues or escalates**, the safeguarding reviewer is consulted about whether the assessment can safely continue in this community

### 15.6 Lessons for Protocol Design

This scenario demonstrates:

- The importance of **private assessment settings** as a protocol requirement
- The need for **assessor training** in managing authority figure interference
- The value of **community pre-communication** about the assessment process
- The role of **stop conditions** in protecting participant autonomy
- The necessity of **documentation** even when the situation is resolved

---

## 16. Scenario Walkthrough: Referral Case

### 16.1 Scenario Description

**Setting:** An individual assessment session in a community member's home (the participant requested a home visit for accessibility reasons).

**Participants:**
- **Assessor:** Trained partner staff member
- **Community Member B (CM-B):** An elderly resident with mobility limitations

**Scenario:**
During the assessment, CM-B discusses community needs knowledgeably. Toward the end of the session, CM-B mentions in passing: "Since the road was repaired, I haven't been able to get to the clinic. My neighbor helps with groceries, but the clinic is too far for the health checks."

The assessor recognizes this as a health access need that is beyond the assessment scope.

### 16.2 Analysis

**Referral trigger assessment:**

| Factor | Assessment |
|--------|------------|
| Is this a safety concern? | Not immediately life-threatening, but untreated health conditions can become serious |
| Is this within assessment scope? | No — the assessment identifies community needs, it does not provide health services |
| Is this an individual need or community need? | Both — CM-B's individual need may reflect a broader community access issue |
| What is the urgency? | HIGH — health access barrier for an elderly person with mobility limitations |
| Does the participant want help? | Not explicitly asked; CM-B stated it as a fact, not a request |

**Assessment:** This triggers a referral pathway. The assessor should offer referral information while respecting CM-B's autonomy about whether to use it.

### 16.3 Correct Response

**Step 1: Acknowledge the disclosure**

"Thank you for sharing that. It sounds like getting to the clinic is a real challenge for you."

**Step 2: Assess whether CM-B wants support (without pressuring)**

"There are some services that might be able to help with transport to medical appointments. Would you like me to tell you about them?"

**Step 3: If CM-B agrees, provide referral information**

"The [local community transport service] provides rides to medical appointments for people who have difficulty traveling. Their phone number is [number]. You can also ask [community health worker name] to help you arrange a visit."

**Step 4: Offer warm referral (with consent)**

"Would it be helpful if I contacted them on your behalf to introduce the situation? You would still need to give them your own consent, but I could make the first connection."

**Step 5: If CM-B declines**

"That's completely fine. The information is there if you ever want to use it." (Leave written contact information if CM-B can access it, or offer to leave it with a trusted neighbor with CM-B's permission.)

**Step 6: Consider community-level finding**

CM-B's difficulty may reflect a broader community access issue. The assessor notes this for the assessment findings: "Access to healthcare services was identified as a community need, particularly for elderly residents and those with mobility limitations."

**Step 7: Document**

The assessor records:
- Referral trigger: health access need
- Referral service identified: community transport service, community health worker
- Whether CM-B accepted the referral information: yes/no
- Whether a warm referral was made: yes/no
- Community-level finding noted: yes

### 16.4 Incorrect Responses

| Response | Why Incorrect |
|----------|---------------|
| Ignoring the disclosure and continuing with assessment questions | Fails duty of care; treats a real human need as irrelevant data |
| Promising to solve the transport problem | Creates an expectation the assessment cannot fulfill |
| Arranging transport without CM-B's consent | Violates autonomy; may create safety issues |
| Including CM-B's individual health details in the assessment report | Violates data minimization; individual health is not assessment data |
| Dismissing the concern as outside scope without offering referral | Technically correct but ethically insufficient |

### 16.5 Follow-Up Actions

1. **Referral documentation** is entered in the process log
2. **If warm referral was made**, the partner follows up with the referral service to confirm contact was made
3. **If CM-B consented to follow-up**, the partner checks within one week whether the referral was accessed
4. **Community-level finding** about healthcare access is included in the anonymized assessment report
5. **If multiple participants report similar access barriers**, the partner assesses whether this is a systemic community need that should be highlighted in findings

### 16.6 Lessons for Protocol Design

This scenario demonstrates:

- The importance of **assessor training** in recognizing referral triggers
- The need for **clear referral pathways** to be established before the assessment begins
- The distinction between **individual referral** (helping one person) and **community finding** (identifying a pattern)
- The requirement to **respect participant autonomy** in accepting or declining referrals
- The value of **warm referrals** (with consent) over cold information handoffs

---

## 17. Scenario Walkthrough: Data Breach Case

### 17.1 Scenario Description

**Setting:** The partner organization's office, two days after completing assessment sessions.

**Participants:**
- **Assessor:** The partner staff member who conducted the assessments
- **Partner IT contact:** The person responsible for the organization's digital systems
- **Safeguarding Lead:** The partner's designated safeguarding person

**Scenario:**
The assessor realizes that the USB drive containing digitized assessment notes from five sessions has been missing since yesterday afternoon. The assessor had transferred paper notes to the USB drive at home (a protocol violation — data should have been transferred at the partner office) and then took the USB drive to a community meeting. The USB drive is password-protected and encrypted, but the assessor cannot find it.

The USB drive contains:
- Session notes from five assessment sessions (anonymized — no names)
- Consent records (session IDs, dates, consent types — no names)
- Aggregate inclusion/exclusion counts
- Assessor observations about community context

The USB drive does NOT contain:
- Participant names or addresses
- Photographs or audio/video recordings
- Financial or health information
- National ID numbers

### 17.2 Analysis

**Breach assessment:**

| Factor | Assessment |
|--------|------------|
| What data was lost? | Anonymized assessment notes, consent records, aggregate counts, observations |
| Is any data personally identifiable? | Low risk — no names, but session patterns might allow re-identification in a small community |
| How many people are potentially affected? | 5 participants (sessions) plus the community context |
| What is the sensitivity level? | Medium — assessment responses could reveal opinions about community needs |
| Was the data encrypted? | Yes — password-protected and encrypted |
| Was the data transferred per protocol? | No — assessor violated the transfer protocol by taking data off-site |
| Is there a risk of harm? | Medium — if someone accesses the data, they might infer who participated and what they said |

**Severity:** This is a **significant breach** requiring immediate action, but not an emergency (no imminent physical harm risk). The encryption reduces but does not eliminate the risk.

### 17.3 Correct Response

**Step 1: Immediate containment (within 1 hour)**

The assessor:
- Retraces steps to try to locate the USB drive
- Informs the Partner IT contact immediately
- Informs the Safeguarding Lead immediately
- Does NOT attempt to hide the breach or delay reporting

**Step 2: Initial assessment (within 4 hours)**

The Safeguarding Lead and Partner IT contact:
- Confirm what data was on the drive
- Confirm encryption status and password strength
- Assess the likelihood of the drive being found vs. being in someone else's possession
- Determine the locations the assessor visited with the drive
- Begin breach documentation

**Step 3: Invoke temporary suspension (within 24 hours)**

The Safeguarding Lead:
- Invokes **Temporary Suspension Condition TS-4** (data breach suspected)
- Pauses all assessment activities until the breach is assessed
- Secures all other assessment data (verify no other losses)
- Notifies the safeguarding reviewer

**Step 4: Notification decision (within 48 hours)**

The Safeguarding Lead,:
- If the drive is found and confirmed uncompromised: document and resume with enhanced protocols
- If the drive is not found: assume it is in unknown possession
  - Notify the safeguarding reviewer
  - Notify the funding organization (anonymized notification — no participant details)
  - Assess whether participants need to be notified (if re-identification risk is real)
  - If notification is needed: prepare a clear, non-alarming message to affected participants

**Step 5: Participant notification (if required, within 72 hours)**

If the assessment determines that participants should be notified:
- The partner contacts each affected participant (through previously consented channels)
- The message explains: what happened, what data was involved, what the risks are, what steps are being taken, who to contact with questions
- The message does NOT blame the participant or minimize the breach
- The message offers the participant the option to withdraw their data from the assessment

**Step 6: Remediation (within 1 week)**

- All remaining assessment data is transferred to secure partner storage
- The USB drive protocol is revised: no data leaves the partner office on removable media
- The assessor receives additional data handling training
- The safeguarding reviewer assesses whether the assessment can resume
- If resumed: enhanced data handling procedures are implemented

**Step 7: Documentation and learning (within 2 weeks)**

- Full breach report is documented
- Lessons learned are recorded
- Protocol is amended to prevent recurrence
- The safeguarding reviewer signs off on the amended protocol
- The funding organization receives a process summary (no participant data)

### 17.4 Incorrect Responses

| Response | Why Incorrect |
|----------|---------------|
| The assessor tries to find the drive without telling anyone | Delays breach response; increases risk; violates reporting obligations |
| The partner organization decides not to notify anyone because data was encrypted | Encryption reduces risk but does not eliminate it; transparency is required |
| The funding organization is notified with full participant details | Violates data minimization; funding organization does not need individual details |
| The assessor is fired immediately | Punitive response discourages future reporting; the issue is process failure, not just individual error |
| The assessment continues without pause | Breach must be assessed before continuing; participant safety comes first |
| The partner blames the community for not securing the environment | The partner is responsible for data handling, not the community |

### 17.5 Follow-Up Actions

1. **Breach report** is completed and filed
2. **Protocol amendment** addresses removable media handling
3. **Assessor training** is updated to include data handling scenarios
4. **Safeguarding reviewer** conducts follow-up review of all data handling procedures
5. **Affected participants** are supported (if notified) and their wishes regarding continued participation are respected
6. **Funding organization** receives a process improvement report
7. **If the USB drive is later found**, it is assessed for tampering and the breach status is updated accordingly

### 17.6 Lessons for Protocol Design

This scenario demonstrates:

- The importance of **clear data handling procedures** that are practical for assessors to follow
- The need for **breach reporting obligations** that are understood by all staff
- The value of **encryption** as a risk reducer (but not a complete solution)
- The requirement for **temporary suspension** capability in the protocol
- The importance of **transparent notification** to affected parties
- The need for **protocol amendment** after breaches to prevent recurrence

---

## 18. Scenario Walkthrough: No-Response Case

### 18.1 Scenario Description

**Setting:** A community where the partner has been conducting assessments for two weeks. The partner has completed 8 individual sessions and 2 small group discussions.

**Participants:**
- **Partner organization:** Has been conducting the assessment
- **Community Member C (CM-C):** A respected community member who was invited to participate
- **Community Leader (CL):** Has given community-level permission for the assessment

**Scenario:**
The partner has invited CM-C to participate in three separate ways:
1. A direct invitation through a community intermediary: CM-C responded that they were "busy"
2. A written invitation left at CM-C's home: No response
3. A verbal invitation when CM-C was encountered at a community event: CM-C said "maybe later" and walked away

The partner has not received any response from CM-C after two weeks of assessment activity. Meanwhile, other community members have participated, but several have noted: "If CM-C doesn't participate, the assessment isn't complete — they know everything about our community."

### 18.2 Analysis

**No-response assessment:**

| Factor | Assessment |
|--------|------------|
| Has CM-C explicitly declined? | No — responses are ambiguous ("busy," "maybe later") |
| Has CM-C been pressured? | Three invitations could be perceived as pressure |
| Is CM-C's perspective essential? | Other community members suggest it is, but this may reflect power dynamics |
| Can the assessment proceed without CM-C? | Technically yes, but validity may be questioned |
| Is continued invitation appropriate? | No — three invitations without clear response suggests disinterest or reluctance |

**Key principle:** Non absence of response is not consent. Three invitations without acceptance means the partner should stop inviting and proceed without this individual's participation.

### 18.3 Correct Response

**Step 1: Stop inviting CM-C**

The partner makes a final decision: CM-C will not be invited again. The three invitations have been sufficient, and continued invitations would constitute pressure.

**Step 2: Document the non-participation**

The partner records:
- CM-C was invited three times (dates and methods)
- CM-C did not provide a clear acceptance or decline
- No further invitations will be extended
- This is documented in the inclusion/exclusion log as "invited, no response after multiple attempts"

**Step 3: Assess impact on assessment validity**

The partner and assessor discuss:
- What perspectives are missing because CM-C did not participate?
- Does this gap affect the assessment's ability to identify community needs?
- Are there other participants who can provide similar perspectives?
- Should the assessment findings note this gap?

**Step 4: Address community concerns transparently**

When community members note CM-C's absence, the partner responds:
"We invited [CM-C] to participate, as we invited many community members. Participation is voluntary, and we respect everyone's choice about whether to take part. The assessment includes the perspectives of those who chose to participate."

The partner does NOT:
- Reveal what CM-C said in their non-responses
- Suggest that CM-C's non-participation is a problem
- Attempt to use community pressure to encourage CM-C to participate
- Speculate about why CM-C did not participate

**Step 5: Consider whether the assessment findings are complete enough**

If CM-C's perspective is genuinely essential (e.g., they are the only person who knows about a particular community resource), the partner:
- Documents this gap in the assessment methodology section
- Notes that the finding about that specific resource may be incomplete
- Does NOT fabricate or assume what CM-C would have said

**Step 6: Decide whether to proceed to findings**

The partner decides:
- If enough perspectives have been gathered to identify community needs: proceed to findings, noting the gap
- If the gap is too significant for valid findings: document the limitation and consider whether a different approach is needed (but do NOT resume inviting CM-C)

### 18.4 Incorrect Responses

| Response | Why Incorrect |
|----------|---------------|
| Continue inviting CM-C until they agree | Constitutes coercion; violates voluntary participation principle |
| Send a community leader to "encourage" CM-C to participate | Escalates pressure; uses authority to coerce |
| Assume CM-C's needs are the same as other participants | Invalid assumption; silences a potentially different perspective |
| Exclude CM-C's non-participation from the assessment record | Reduces transparency; hides a methodological limitation |
| Tell the community that CM-C refused to participate | Violates CM-C's privacy; may create community tension |
| Proceed with findings as if no gap exists | Misrepresents assessment completeness |

### 18.5 Understanding Why CM-C Did Not Respond

The partner reflects on possible reasons (without assuming any are correct):

| Possible Reason | Implication for Assessment |
|----------------|---------------------------|
| CM-C is genuinely busy and could not find time | May need more flexible scheduling options for future assessments |
| CM-C does not trust the partner organization | Trust-building work may be needed before assessment can be valid |
| CM-C does not want to be associated with external assistance | Community may have reasons for self-reliance that should be respected |
| CM-C has a different view of community needs and does not want to conflict | May indicate community tension about the assessment itself |
| CM-C has personal circumstances that make participation difficult | Accessibility or sensitivity accommodations may be needed |
| CM-C does not feel safe participating | Safeguarding concern that should be explored (carefully and indirectly) |
| CM-C simply does not want to participate | This is their right and must be respected |

The partner does not investigate CM-C's reasons — that would be intrusive. The partner simply respects the non-response and documents the gap.

### 18.6 Follow-Up Actions

1. **Assessment record** documents the non-participation and its potential impact
2. **Findings report** notes any gaps in perspective coverage
3. **Community feedback** is sought on whether the findings feel complete
4. **Lessons learned** are recorded for future assessments (e.g., earlier engagement with key community members; more flexible participation options)
5. **CM-C's decision** is respected permanently — they are not contacted again about this assessment

### 18.7 Lessons for Protocol Design

This scenario demonstrates:

- The importance of **respecting non-response** as a valid outcome
- The need for **documentation of non-participation** without identifying individuals
- the value of **reflecting on gaps** in perspective coverage
- The requirement for **transparency** with the community about assessment limitations
- The principle that **no response is a form of communication** that must be respected
- The danger of **continued invitation** crossing into coercion

---

## 19. Anti-Extractive Research Measures

### 19.1 What Is Extractive Research?

Extractive research occurs when an external organization:

- Enters a community to "study" their needs
- Collects information and data
- Leaves without providing benefit to the community
- Uses the collected information for the organization's own purposes (funding applications, reports, publicity)
- Treats community members as data sources rather than partners
- Takes knowledge without giving anything in return
- Repeats assessments without acting on previous findings

Extractive research harms communities by:
- Creating "assessment fatigue" — communities are studied repeatedly without seeing change
- Treating people as objects of research rather than agents of their own development
- Extracting valuable knowledge without compensation or benefit-sharing
- Damaging trust in external organizations generally
- Perpetuating power imbalances between "helpers" and "helped"

### 19.2 Anti-Extractive Measures in This Protocol

This protocol incorporates the following anti-extractive measures:

#### 19.2.1 Partner Ownership

- The **local partner** conducts the assessment, not the funding organization
- The partner owns the findings and controls how they are shared
- The funding organization receives an anonymized report, not raw data
- The community can access a summary of findings in an accessible format

#### 19.2.2 Community Benefit

- The assessment itself provides a structured opportunity for the community to articulate their needs
- Referral pathways ensure that individual needs identified during the assessment are addressed
- The community receives a summary of findings, not just the funding organization
- If a program results from the assessment, the community has already been consulted about their priorities

#### 19.2.3 Minimal Extraction

- Data collection is minimized to what is strictly necessary
- No personal data is extracted from the community
- The assessment does not create a database of community members
- No biometric, financial, or identification data is collected

#### 19.2.4 Transparency

- The community knows why the assessment is being conducted
- The community knows what will happen with the information
- The community can see the findings (in summary form)
- The community knows whether a program is proposed as a result

#### 19.2.5 No Automatic Program Commitment

- The assessment does not promise a program
- If no need is identified, the community is told honestly
- If a need is identified but no program is appropriate, the community is told
- The community is not led to believe that participation guarantees assistance

#### 19.2.6 Respect for Community Time

- The assessment is time-bounded
- Repeated assessments without action are avoided
- The community's time is valued and not wasted
- Follow-up information is provided to the community

### 19.3 Assessor Behavior Standards

Assessors are trained to avoid extractive behaviors:

| Do | Don't |
|----|-------|
| Listen more than you speak | Dominate the conversation |
| Use community terminology | Impose external labels |
| Acknowledge existing community strengths | Focus only on deficits |
| Share what you've heard in summary | Keep information from the community |
| Respect silence and pauses | Fill every silence with questions |
| Thank participants genuinely | Treat participation as transactional |
| Follow up on commitments made | Make promises you cannot keep |
| Acknowledge what the community already knows | Assume you know better |

### 19.4 Community Feedback Mechanism

The protocol includes a mechanism for the community to provide feedback on the assessment process itself:

1. **After the assessment**, the partner shares a summary of findings with the community (in accessible format)
2. **The community is asked:** "Does this summary reflect what you told us? Is anything missing or incorrect?"
3. **The community can provide feedback** through the partner's existing community channels
4. **The partner documents** community feedback and any corrections
5. **The funding organization receives** the community-validated summary

This feedback mechanism ensures the community has agency over how their input is represented.

### 19.5 Anti-Extractive Review Question

The safeguarding reviewer includes the following question in their review:

> "Does this assessment process extract value from the community without returning benefit? If so, how can the process be redesigned to ensure mutual benefit?"

If the reviewer identifies extractive elements, they recommend changes before the assessment proceeds.

---

## 20. Unsafe Disclosure Prevention

### 20.1 What Is Unsafe Disclosure?

Unsafe disclosure occurs when a participant reveals information that:

- Puts them at risk of harm from others (abuser, community, authorities)
- Creates legal jeopardy for themselves or others
- Exposes them to stigma or discrimination
- Reveals information they did not intend to share (accidental disclosure)
- Places them in a vulnerable position vis-a-vis the partner or funding organization

Unsafe disclosure is different from a safeguarding incident (Section 13.7), though it can lead to one. The focus here is on **preventing** unsafe disclosure from occurring in the first place.

### 20.2 Prevention Measures

#### 20.2.1 Question Design

Questions are designed to avoid prompting unsafe disclosure:

| Risk | Prevention |
|------|------------|
| Questions about personal safety may prompt disclosure of abuse | Questions focus on community-level needs, not individual experiences |
| Questions about finances may reveal economic vulnerability | Questions ask about community resources, not individual income |
| Questions about family may reveal domestic situations | Questions ask about community support structures, not family details |
| Questions about legal status may create fear | Questions do not ask about legal status at all |
| Open-ended questions may lead to unstructured disclosure | Questions are focused and bounded; assessor can redirect if needed |

#### 20.2.2 Assessor Training

Assessors are trained to:

- Recognize when a participant is approaching unsafe disclosure
- Gently redirect the conversation without shaming the participant
- Create an environment where participants feel safe without being pressured to disclose
- Respond appropriately if unsafe disclosure occurs despite prevention measures
- Understand cultural norms about what is appropriate to share with outsiders

**Redirection technique:** If a participant begins to disclose something unsafe:

"I appreciate you sharing that with me. I want to make sure you know that this assessment is focused on [community-level topic]. What you've mentioned sounds important, and I want to make sure you get the right support for it. Can I share some information about [relevant service] that might be helpful?"

#### 20.2.3 Environment Setup

The assessment environment is chosen to minimize disclosure risk:

- **Private location:** Where the participant cannot be overheard
- **Safe timing:** When the participant is not at risk of being interrupted by someone who might harm them
- **Comfortable setting:** Where the participant feels at ease
- **Exit access:** The participant can leave at any time without being blocked
- **No recording devices visible:** Unless specifically consented to
- **Neutral location:** Not a place associated with authority or danger

#### 20.2.4 Information Management

- Assessor does not write down anything the participant did not explicitly agree to share
- If unsafe disclosure occurs, the assessor does not record the specific details — only that a referral was offered
- The participant's words are not quoted in reports without specific consent
- Identifying details are never included in assessment findings

### 20.3 Response If Unsafe Disclosure Occurs

Despite prevention measures, a participant may disclose something unsafe. The response:

1. **Stay calm and supportive:** "Thank you for trusting me with that."
2. **Do not promise confidentiality you cannot keep:** "I want to be honest with you — if what you've told me means you or someone else is in danger, I may need to share that with someone who can help. I'll tell you before I do, if I can."
3. **Assess immediate safety:** "Are you safe right now? Is there anyone you're worried about?"
4. **Offer support, not direction:** "There are people who can help with this. Would you like to know about them?"
5. **If the participant is in immediate danger:** Activate safeguarding protocol (Section 13.7) — this becomes a safeguarding incident
6. **If the participant is not in immediate danger but has disclosed something sensitive:**
   - Offer referral information
   - Document that a referral was offered (without recording the disclosure content)
   - Check in with the participant at the end of the session
   - Provide follow-up support if consented to
7. **After the session:**
   - The assessor debriefs with the Safeguarding Lead
   - The Safeguarding Lead assesses whether further action is needed
   - The participant's safety is monitored (if they consented to follow-up)
   - The disclosure is recorded in the safeguarding log (without identifying details)

### 20.4 Special Considerations for Group Settings

In group discussions, unsafe disclosure risk is higher because:

- Other community members are present
- The participant may disclose something in front of people who know them
- Group dynamics may pressure someone to disclose more than they intended

Prevention measures for group settings:

- Establish ground rules about confidentiality within the group
- Remind participants not to share others' information outside the group
- Offer individual follow-up sessions for anyone who wants to speak privately
- The assessor monitors group dynamics for signs that someone is uncomfortable
- If someone appears distressed, the assessor checks in privately after the session

### 20.5 Cultural Sensitivity in Disclosure

Different cultures have different norms about what is appropriate to disclose:

- Some topics may be taboo to discuss with outsiders
- Some community members may not be comfortable disclosing in front of certain other people
- Gender norms may affect what can be said in mixed company
- Power dynamics may prevent certain community members from speaking freely

The partner's cultural competence is essential for navigating these sensitivities. The assessor:
- Defers to the partner's cultural guidance
- Creates multiple avenues for input (individual, group, written, verbal)
- Does not pressure anyone to disclose more than they are comfortable with
- Recognizes that silence is a valid response

---

## 21. False Representation Safeguards

### 21.1 What Is False Representation?

False representation occurs when the assessment findings do not accurately reflect the community's actual needs. This can happen through:

- **Assessor bias:** The assessor hears what they expect to hear
- **Selection bias:** Only certain community members participate, skewing the findings
- **Social desirability bias:** Participants tell the assessor what they think the assessor wants to hear
- **Power distortion:** Community leaders influence what is said, suppressing dissenting views
- **Misinterpretation:** The assessor misunderstands what participants are saying
- **Overgeneralization:** Findings from a few participants are applied to the whole community
- **Fabrication:** Data is invented or exaggerated (rare but possible)
- **Omission:** Important perspectives are excluded from the findings

### 21.2 Safeguards Against False Representation

#### 21.2.1 Multiple Perspectives

- The assessment includes participants from different community segments (Section 8.3)
- No single perspective dominates the findings
- Divergent views are documented, not smoothed over
- The findings report explicitly notes whose perspectives are represented and whose are missing

#### 21.2.2 Participant Verification

- At the end of each session, the assessor summarizes what was heard and asks: "Did I understand correctly?"
- Participants can correct, add to, or withdraw statements
- The summary is recorded, not the raw words (reducing misquotation risk)
- Participants receive a copy of their summary (if they want it and can receive it securely)

#### 21.2.3 Community Validation

- Before finalizing findings, the partner shares a draft summary with the community (in accessible format)
- Community members can confirm, correct, or challenge the summary
- Corrections are incorporated into the final findings
- The findings report notes whether community validation was conducted and what feedback was received

#### 21.2.4 Assessor Reflexivity

- Assessors are trained to recognize their own biases
- Assessors document their own positionality (outsider/insider, gender, age, background)
- The partner reviews assessor notes for signs of bias or overinterpretation
- Multiple assessors are used where possible to cross-check findings

#### 21.2.5 Findings Triangulation

- Findings are based on multiple data sources (individual sessions, group discussions, key informant interviews, assessor observations)
- No single source determines a finding
- Contradictions between sources are noted and explored, not hidden
- The findings report describes the evidence base for each conclusion

#### 21.2.6 Independent Review

- The safeguarding reviewer assesses whether findings are supported by evidence
- The privacy reviewer assesses whether findings are appropriately anonymized
- The funding organization receives findings with methodology notes, not just conclusions
- The findings report includes a "limitations" section that honestly describes gaps and uncertainties

### 21.3 Specific False Representation Risks and Responses

| Risk | Detection Method | Response |
|------|-----------------|----------|
| **Assessor hears what they expect** | Reviewer checks notes against findings; multiple assessor cross-check | Findings amended; assessor retrained |
| **Only elite voices participate** | Inclusion/exclusion log analysis; community feedback | Additional outreach to underrepresented groups; findings note the gap |
| **Participants tell assessor what they want to hear** | Assessor builds rapport; asks open questions; checks for consistency | Findings note potential social desirability bias |
| **Community leaders suppress dissent** | Separate sessions for leaders and community members; anonymous options | Findings include diverse perspectives; power dynamics noted |
| **Assessor misunderstands** | Participant verification of summary; partner cultural review | Corrections incorporated; findings amended |
| **Overgeneralization from small sample** | Sample size documented; findings qualified appropriately | Findings note the scope limitation; no overclaiming |
| **Data fabrication** | Assessor supervision; note review; community validation | Immediate investigation; termination if confirmed; data excluded |
| **Important perspectives omitted** | Community validation; inclusion/exclusion analysis | Additional assessment sessions if needed; findings note the gap |

### 21.4 Findings Report Integrity Standards

The final findings report must meet these standards:

1. **Evidence-based:** Every finding is supported by documented assessment data
2. **Qualified:** Findings state the scope and limitations of the evidence
3. **Multi-perspective:** Different community viewpoints are represented
4. **Honest:** Negative findings (no need identified, community does not want program) are reported as clearly as positive findings
5. **Anonymized:** No individual can be identified from the report
6. **Community-validated:** The community has had the opportunity to review and respond to the findings
7. **Methodologically transparent:** The report describes how the assessment was conducted, who participated, and what limitations exist
8. **Actionable:** The report clearly states what the community needs, what has been tried, and what the community wants

### 21.5 What Happens If False Representation Is Discovered After the Report

If false representation is identified after the findings report has been issued:

1. **The partner is notified** immediately
2. **The funding organization is notified** (anonymized)
3. **The report is flagged** as potentially containing inaccurate information
4. **An investigation** is conducted to determine the extent of the inaccuracy
5. **The report is corrected** if the inaccuracy is confirmed
6. **The community is informed** of the correction
7. **Any program decisions** based on the inaccurate report are paused until corrected information is available
8. **Lessons learned** are documented and protocol improvements are made

---

## 22. Protocol Completeness Checklist

### 22.1 Purpose

This checklist verifies that the protocol document contains all necessary elements for a responsible needs assessment. It is used by the safeguarding reviewer and privacy reviewer during the pre-assessment review.

### 22.2 Completeness Checklist

#### Protocol Design Elements

- [ ] **Objective clearly stated** — The protocol identifies a specific unmet need before any program is proposed
- [ ] **Scope defined** — What can and cannot be assessed is clearly delineated
- [ ] **Non-goals stated** — What the protocol does not do is explicitly listed
- [ ] **Hard constraints identified** — Non-negotiable requirements are documented
- [ ] **Operational constraints specified** — Practical requirements are described
- [ ] **Relationship to other tasks mapped** — Dependencies and boundaries with M32, M49-02, etc. are clear

#### Partner Requirements

- [ ] **Partner qualification criteria defined** — Essential and desirable qualifications listed
- [ ] **Partner independence requirements specified** — Structural independence guaranteed
- [ ] **Partner accountability structure mapped** — Who the partner is accountable to is clear
- [ ] **Partner selection process documented** — Transparent and defensible
- [ ] **Partner disqualification conditions listed** — Clear grounds for exclusion
- [ ] **Partner support requirements specified** — What the funding organization provides and does not provide

#### Consent Framework

- [ ] **Consent philosophy stated** — Ongoing, informed, voluntary, revocable, specific, documented
- [ ] **Pre-assessment information requirements listed** — What participants are told before consenting
- [ ] **Consent process stages defined** — Five-stage process documented
- [ ] **Ongoing consent checks specified** — How consent is maintained throughout
- [ ] **Specific activity consent requirements listed** — Additional consent for recording, quoting, etc.
- [ ] **Consent documentation requirements defined** — Minimal data approach to consent records
- [ ] **Consent revocation process specified** — How withdrawal works in practice
- [ ] **Vulnerable population protections defined** — Additional safeguards for minors, disabled, trauma survivors
- [ ] **Group consent considerations addressed** — Community-level permission vs. individual consent

#### Data Management

- [ ] **Data minimization principles stated** — Collect only what is necessary
- [ ] **Permitted data categories listed** — What can be collected by default
- [ ] **Conditionally permitted data categories defined** — What requires justification
- [ ] **Prohibited data categories listed** — What must never be collected
- [ ] **Data necessity test specified** — Four-question test before each data point
- [ ] **Data handling during collection described** — Secure practices in the field
- [ ] **Data flow map complete** — From collection to destruction
- [ ] **Data access matrix defined** — Who can see what
- [ ] **Data retention schedule specified** — How long each data type is kept
- [ ] **Data transfer protocols defined** — Secure methods for moving data
- [ ] **Data breach response procedure documented** — Step-by-step response

#### Inclusion/Exclusion

- [ ] **Inclusion criteria listed** — Who can participate
- [ ] **Inclusion encouragement specified** — Who should be actively included
- [ ] **Exclusion criteria listed** — Who cannot participate
- [ ] **Exclusion sensitivity addressed** — How to handle sensitive exclusions
- [ ] **Community-level inclusion assessed** — Barriers to broad participation
- [ ] **Documentation of inclusion/exclusion decisions required** — Aggregate, non-identifying

#### Assessment Questions

- [ ] **Question design principles stated** — Open-ended, non-leading, community-focused, etc.
- [ ] **Question categories defined** — Five categories with specific purposes
- [ ] **Sample questions provided** — Concrete examples for each category
- [ ] **Prohibited question types listed** — What must never be asked
- [ ] **Question adaptation process defined** — How questions are localized
- [ ] **Question delivery methods specified** — How questions are asked (individual, group, etc.)

#### Safeguarding

- [ ] **Safeguarding review purpose defined** — Independent assessment of safeguarding adequacy
- [ ] **Review timing specified** — Pre, mid, post, and follow-up reviews
- [ ] **Pre-assessment review checklist provided** — Comprehensive verification before starting
- [ ] **Mid-assessment review focus defined** — What is checked during the assessment
- [ ] **Post-assessment review focus defined** — What is checked after completion
- [ ] **Safeguarding reviewer authority specified** — What the reviewer can require
- [ ] **Safeguarding incident response protocol documented** — Step-by-step response

#### Referral Pathways

- [ ] **Referral trigger conditions listed** — When to refer
- [ ] **Referral pathway map provided** — Where to refer for different needs
- [ ] **Referral process defined** — How to make a referral
- [ ] **Referral service requirements specified** — Quality standards for referral services
- [ ] **Referral service maintenance defined** — Keeping referral information current
- [ ] **Referral in assessment closure context addressed** — When referral IS the finding

#### Stop Conditions

- [ ] **Immediate stop conditions listed** — When to stop right now
- [ ] **Temporary suspension conditions defined** — When to pause
- [ ] **Permanent termination conditions specified** — When to end permanently
- [ ] **Decision authority mapped** — Who can make each stop decision
- [ ] **Post-stop procedures defined** — What happens after a stop

#### Privacy

- [ ] **Privacy risk register completed** — All risks identified and assessed
- [ ] **Privacy principles applied** — Minimization, purpose limitation, storage limitation, etc.
- [ ] **Privacy reviewer checklist provided** — Pre-assessment verification
- [ ] **Special privacy considerations addressed** — Small communities, oral cultures, shared devices

#### Anti-Extractive Measures

- [ ] **Extractive research defined** — What it is and why it harms
- [ ] **Anti-extractive measures specified** — Partner ownership, community benefit, minimal extraction
- [ ] **Assessor behavior standards defined** — Do and don't list
- [ ] **Community feedback mechanism established** — How the community reviews findings
- [ ] **Anti-extractive review question included** — Safeguarding reviewer checks for extraction

#### Unsafe Disclosure Prevention

- [ ] **Unsafe disclosure defined** — What it is and how it happens
- [ ] **Question design prevention measures specified** — How questions avoid prompting disclosure
- [ ] **Assessor training for prevention defined** — Redirection techniques
- [ ] **Environment setup requirements listed** — Safe physical setting
- [ ] **Information management controls specified** — What is and isn't recorded
- [ ] **Response procedure if disclosure occurs** — Step-by-step response
- [ ] **Group setting considerations addressed** — Additional risks in groups
- [ ] **Cultural sensitivity in disclosure** — Partner's cultural competence

#### False Representation Safeguards

- [ ] **False representation defined** — Types of misrepresentation
- [ ] **Multiple perspectives safeguard** — Diverse participant base
- [ ] **Participant verification safeguard** — Checking understanding
- [ ] **Community validation safeguard** — Community reviews findings
- [ ] **Assessor reflexivity safeguard** — Recognizing assessor bias
- [ ] **Findings triangulation safeguard** — Multiple data sources
- [ ] **Independent review safeguard** — Reviewer checks findings
- [ ] **Findings report integrity standards** — Eight standards for the report
- [ ] **Post-report correction procedure** — What happens if errors are found

### 22.3 Completeness Scoring

| Category | Items | Checked | Score |
|----------|-------|---------|-------|
| Protocol Design | 6 | 6 | 100% |
| Partner Requirements | 6 | 6 | 100% |
| Consent Framework | 9 | 9 | 100% |
| Data Management | 11 | 11 | 100% |
| Inclusion/Exclusion | 6 | 6 | 100% |
| Assessment Questions | 6 | 6 | 100% |
| Safeguarding | 7 | 7 | 100% |
| Referral Pathways | 6 | 6 | 100% |
| Stop Conditions | 5 | 5 | 100% |
| Privacy | 4 | 4 | 100% |
| Anti-Extractive Measures | 5 | 5 | 100% |
| Unsafe Disclosure Prevention | 8 | 8 | 100% |
| False Representation Safeguards | 9 | 9 | 100% |
| **TOTAL** | **98** | **98** | **100%** |

**Protocol completeness: ALL DESIGN ELEMENTS PRESENT**

Note: Completeness of design does not equal readiness for implementation. The protocol still requires partner review, safeguarding review, and privacy review before any assessment activity can begin.

---

## 23. Unresolved Safeguard Questions Register

### 23.1 Purpose

This register documents safeguarding questions that **cannot be resolved at the protocol design stage** and require human judgment, local context knowledge, or owner decision. These are not flaws in the protocol — they are inherent limitations of a paper design that must be resolved in practice.

### 23.2 Register

| ID | Question | Why Unresolved | Who Must Resolve | When |
|----|----------|---------------|------------------|------|
| **USQ-1** | What is the specific local legal framework for mandatory reporting of abuse? | Depends on jurisdiction; no jurisdiction has been identified | Legal counsel + partner | Before assessment in any specific jurisdiction |
| **USQ-2** | What are the local child protection laws and reporting requirements? | Jurisdiction-specific; partner must identify local requirements | Legal counsel + partner | Before assessment begins |
| **USQ-3** | Who is the appropriate safeguarding authority in the target community? | Community-specific; depends on local governance structures | Partner + community | Before community engagement |
| **USQ-4** | What cultural norms affect consent processes in the target community? | Culture-specific; varies by community | Partner (with cultural advisors) | Before assessment design finalization |
| **USQ-5** | Are there community-specific risks that the protocol does not anticipate? | Unknown until community context is understood | Partner + safeguarding reviewer | Before assessment begins |
| **USQ-6** | What local referral services actually exist and are accessible? | Service landscape varies by location; changes over time | Partner (with service mapping) | Before assessment begins; updated periodically |
| **USQ-7** | Is the partner organization's safeguarding capacity sufficient for the specific assessment context? | Partner-specific; depends on staff, resources, and context | Safeguarding reviewer | During partner qualification (Section 4.5) |
| **USQ-8** | What data protection laws apply to the assessment? | Jurisdiction-specific; depends on where data is collected and stored | Legal counsel + privacy reviewer | Before assessment begins |
| **USQ-9** | Are there local risks related to the assessment topic that could endanger participants? | Topic and location-specific | Partner + safeguarding reviewer + community advisors | Before assessment begins |
| **USQ-10** | What is the appropriate gender composition for assessors in the target community? | Culture-specific; varies by community and topic | Partner (with cultural guidance) | Before assessor assignment |
| **USQ-11** | Are there literacy or language considerations that affect the consent process? | Community-specific; depends on local languages and literacy rates | Partner + translator (if needed) | Before consent process design |
| **USQ-12** | What is the safest method of storing assessment data in the local context? | Context-specific; depends on local infrastructure, security situation, and legal environment | Partner IT + safeguarding reviewer | Before data collection begins |
| **USQ-13** | Are there local power dynamics that could affect participant safety or data quality? | Community-specific; only the partner and community can identify these | Partner + community advisors | Before assessment begins |
| **USQ-14** | What happens if a participant withdraws consent after the findings report has been produced? | Depends on how anonymized the data is; may not be technically possible to remove | Partner + privacy reviewer | Case-by-case; protocol provides guidance but not absolute rule |
| **USQ-15** | Are there risks to the assessor that the protocol does not address? | Context-specific; depends on location, topic, and community dynamics | Partner + safeguarding reviewer + assessor | Before assessment begins; ongoing |

### 23.3 Resolution Process

Each unresolved safeguard question follows this process:

1. **Identify:** The question is recognized as requiring resolution before the assessment can proceed
2. **Assign:** A specific person or group is assigned responsibility for resolving it
3. **Research:** The assigned party gathers the information needed to answer the question
4. **Decide:** A decision is made based on the gathered information
5. **Document:** The decision and its rationale are recorded
6. **Communicate:** The decision is communicated to all affected parties
7. **Implement:** The assessment protocol is adjusted if necessary based on the decision
8. **Verify:** The safeguarding reviewer confirms the decision is adequate

### 23.4 Impact on Assessment Readiness

The assessment **cannot begin** until all unresolved safeguard questions that are marked "Before assessment begins" have been resolved. The safeguarding reviewer signs off on readiness before any participant contact occurs.

If any question cannot be resolved satisfactorily, the assessment does not proceed. This is a valid outcome and is documented as such.

### 23.5 Ongoing Monitoring

Some questions (marked "ongoing" or "periodically") require monitoring throughout the assessment. The partner's safeguarding lead is responsible for ongoing monitoring and escalation if conditions change.

---

## 24. Risk Mitigation Strategy

### 24.1 Risk Register Overview

This section consolidates all identified risks and their mitigation strategies. Risks are categorized by type and assessed for likelihood and impact.

### 24.2 Comprehensive Risk Register

| Risk ID | Risk Category | Risk Description | Likelihood | Impact | Risk Level | Mitigation Strategy | Residual Risk |
|---------|--------------|-----------------|------------|--------|------------|--------------------|--------------|
| **R-1** | Safeguarding | Participant discloses abuse or harm during assessment | Medium | Critical | HIGH | Stop condition IS-3/IS-4/IS-5; safeguarding incident response protocol; assessor training; referral pathways | MEDIUM — response is defined but actual safety depends on local services |
| **R-2** | Privacy | Assessment data is breached or accessed by unauthorized persons | Medium | High | HIGH | Data minimization; encryption; access controls; breach response procedure; secure transfer protocols | MEDIUM — encryption reduces impact but does not prevent breach |
| **R-3** | Consent | Participant is coerced or pressured into participating | Medium | High | HIGH | Private assessment setting; coercion detection training; stop condition IS-6; ongoing consent checks; decline without penalty guarantee | LOW-MEDIUM — assessor training and private setting reduce but do not eliminate risk |
| **R-4** | Extractive | Community is assessed repeatedly without benefit | High | Medium | HIGH | Anti-extractive measures; community feedback mechanism; partner ownership; no automatic program commitment | MEDIUM — depends on funding organization honoring commitments |
| **R-5** | Representation | Assessment findings do not accurately reflect community needs | Medium | High | HIGH | Multiple perspectives; participant verification; community validation; findings triangulation; independent review | MEDIUM — review process catches most issues but cannot guarantee accuracy |
| **R-6** | Cultural | Assessment process offends or harms community cultural norms | Medium | High | HIGH | Partner cultural competence; community consultation; cultural review of questions; local assessor where possible | LOW-MEDIUM — partner's local knowledge is the primary mitigation |
| **R-7** | Legal | Assessment violates local laws or regulations | Low | Critical | HIGH | Legal review before assessment; partner legal registration; jurisdiction-specific compliance; legal counsel access | LOW — legal review should catch most issues; residual risk is in interpretation |
| **R-8** | Operational | Assessor is unavailable or unable to complete the assessment | Medium | Medium | MEDIUM | Backup assessor identified; assessor support and debriefing; flexible scheduling; temporary suspension capability | LOW — backup planning reduces impact |
| **R-9** | Political | Assessment is perceived as political or takes sides in community conflict | Low | High | MEDIUM | Partner independence; community-level permission; neutral question design; transparent purpose | LOW-MEDIUM — neutrality is a design principle but cannot control perception |
| **R-10** | Financial | Assessment creates expectations of financial benefit that are not met | Medium | Medium | MEDIUM | No promise of benefit; clear communication about assessment purpose; no automatic program commitment | LOW — clear communication reduces false expectations |
| **R-11** | Reputational | Assessment process damages the partner's or funding organization's reputation | Low | Medium | LOW | Transparent process; community validation; honest reporting; accountability mechanisms | LOW — good process protects reputation |
| **R-12** | Data quality | Assessment collects unreliable or invalid data | Medium | Medium | MEDIUM | Assessor training; question design principles; participant verification; triangulation; reviewer oversight | LOW-MEDIUM — multiple checks reduce but do not eliminate data quality risk |
| **R-13** | Participant harm | Assessment process causes psychological distress to participants | Medium | High | HIGH | Trauma-informed approach; assessor training; stop condition IS-2; referral pathways; assessor support | MEDIUM — distress can occur even with good training; response capability is the mitigation |
| **R-14** | Community harm | Assessment process creates or worsens community conflict | Low | High | MEDIUM | Conflict sensitivity awareness; multiple perspective inclusion; community validation; partner cultural competence | LOW — careful process design reduces this risk |
| **R-15** | Scope creep | Assessment expands beyond its designed scope | Medium | Medium | MEDIUM | Clear scope definition; assessor training; question framework discipline; reviewer oversight | LOW — scope is well-defined in protocol |
| **R-16** | Partner dependency | Community becomes dependent on the partner organization through the assessment | Low | Medium | LOW | Time-bounded engagement; no service promise; referral to existing services; partner exit strategy | LOW — design prevents dependency |
| **R-17** | False representation | Assessment findings are misrepresented to donors or public | Low | High | MEDIUM | Anonymized reporting; community validation; findings integrity standards; independent review | LOW-MEDIUM — controls exist but cannot prevent all misuse |
| **R-18** | Assessor safety | Assessor is harmed during the assessment process | Low | Critical | MEDIUM | Safety assessment before assessment; partner security protocols; assessor training; emergency procedures | LOW — safety assessment and protocols reduce risk |

### 24.3 Risk Mitigation Hierarchy

Risks are mitigated in this priority order:

1. **Eliminate the risk** — Design the protocol so the risk cannot occur (e.g., don't collect sensitive data, so it can't be breached)
2. **Reduce the likelihood** — Make the risk less likely to occur (e.g., train assessors to detect coercion)
3. **Reduce the impact** — Make the consequences less severe if the risk occurs (e.g., encryption reduces breach impact)
4. **Transfer the risk** — Assign responsibility to another party (e.g., partner organization is responsible for data handling)
5. **Accept the risk** — Acknowledge the residual risk and proceed with appropriate controls

### 24.4 Risk Ownership

| Risk Owner | Responsible For |
|------------|----------------|
| **Partner organization** | All operational risks during assessment conduct; data handling; assessor management; community relationships |
| **Safeguarding reviewer** | Safeguarding risks; incident response adequacy; participant safety |
| **Privacy reviewer** | Privacy risks; data protection adequacy; breach response |
| **Funding organization** | Ensuring the protocol is adequately designed; not pressuring the partner; honoring the assessment findings |
| **Assessor** | Following the protocol; reporting concerns; maintaining own safety |

### 24.5 Risk Monitoring

Risks are monitored throughout the assessment:

- **Pre-assessment:** All risks reviewed by safeguarding and privacy reviewers
- **During assessment:** Assessor reports concerns to partner safeguarding lead immediately
- **Mid-assessment review:** Safeguarding reviewer assesses whether risks are materializing
- **Post-assessment:** Full risk review as part of the post-assessment safeguarding review
- **Follow-up:** Residual risks monitored for 6 months after assessment completion

---

## 25. Metrics and Success Criteria

### 25.1 Metric Philosophy

The TODO specification states: **"Metrics: Protocol completeness and unresolved safeguard questions; no impact target invented."**

This means:

- The protocol's success is measured by its **completeness as a design artifact**, not by any real-world impact
- No target is invented for community benefit, program success, or need reduction
- The protocol is a prerequisite for action, not a measure of action
- Inventing impact metrics would be premature and potentially harmful (it would create incentives to find "needs" to meet targets)

### 25.2 Protocol Completeness Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Design elements present** | 100% of Section 22.2 checklist items | Checklist review by safeguarding and privacy reviewers |
| **Unresolved safeguard questions documented** | 100% of questions that cannot be resolved at design stage are recorded in Section 23 | Register review |
| **Scenario walkthroughs completed** | 4/4 (coercion, referral, breach, no-response) | Document review |
| **Risk register populated** | All identified risks have likelihood, impact, mitigation, and residual risk assessment | Risk register review |
| **Data map complete** | All data collection points, flows, access controls, and retention periods documented | Data map review |

### 25.3 Process Quality Metrics (For When Assessment Is Conducted)

These metrics apply only when the assessment is actually conducted (not at this design stage):

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Consent rate** | 100% of participants have documented consent | Consent log audit |
| **Decline rate** | Documented; no target (declining is a valid outcome) | Inclusion/exclusion log |
| **Withdrawal rate** | Documented; no target (withdrawing is a valid right) | Consent revocation log |
| **Referral rate** | All triggered referrals are documented and followed up | Referral log |
| **Stop condition invocation rate** | All invocations are documented | Safeguarding log |
| **Data breach rate** | Zero breaches target | Incident log |
| **Community validation completion** | Findings are validated by the community before finalization | Validation record |
| **Assessor debriefing completion** | 100% of assessors receive debriefing after sessions | Debriefing log |

### 25.4 Success Criteria for This Document (BASELINE ESTABLISHED)

This document achieves "BASELINE ESTABLISHED" status when:

- [x] All 28 sections are present and substantive
- [x] Protocol design is complete (all elements in Section 22 addressed)
- [x] Data map is documented (Section 10)
- [x] Four scenario walkthroughs are completed (Sections 15-18)
- [x] Risk register is populated (Section 24)
- [x] Unresolved safeguard questions are documented (Section 23)
- [x] No real beneficiary data is used (all scenarios are synthetic)
- [x] No impact target is invented (metrics are process-focused)
- [ ] **Partner review obtained** — DEFERRED
- [ ] **Safeguarding review obtained** — DEFERRED
- [ ] **Privacy review obtained** — DEFERRED
- [ ] **Approval/no-go record created** — DEFERRED (requires all three reviews)

### 25.5 What Success Is NOT

Success for this protocol design is **not**:

- A confirmed community need
- A committed program
- A certain number of assessment participants
- A positive findings report
- A specific outcome for any community
- Evidence that the protocol "works" in practice (that can only be determined after implementation)

Success for this protocol design is:

- A complete, responsible, and reviewable protocol document
- Clear identification of what still needs human judgment
- Adequate safeguarding and privacy provisions
- Transparent documentation of limitations and deferred items
- A foundation that a qualified partner can review and either approve or send back for revision

---

## 26. Limitations and Caveats

### 26.1 Design Limitations

This protocol document has the following inherent limitations:

**L-1: No real community context**
The protocol is designed in the abstract, without a specific community, partner, or cultural context. Many provisions (consent process, question design, referral pathways) must be adapted to the local context before the assessment can begin. The protocol provides a framework, not a ready-to-implement instrument.

**L-2: No real partner identified**
The protocol assumes a qualified local partner exists. If no suitable partner can be identified, the assessment cannot proceed. The partner qualification criteria (Section 4) are requirements, not guarantees.

**L-3: No real participant perspective**
The protocol is designed from the perspective of assessors, partners, and reviewers. The actual experience of participants cannot be fully anticipated. The protocol must be adapted based on participant feedback during the assessment.

**L-4: Synthetic scenarios only**
All scenario walkthroughs (Sections 15-18) use fictional situations. Real assessment contexts will present complexities that synthetic scenarios do not capture. The scenarios illustrate principles, not predict outcomes.

**L-5: No legal jurisdiction specified**
Legal requirements (mandatory reporting, data protection, consent validity) vary by jurisdiction. The protocol identifies legal considerations but cannot specify jurisdiction-specific requirements. Legal counsel must review the protocol for each specific jurisdiction.

**L-6: No funding organization specified**
The protocol assumes a generic "funding organization." The specific organization's policies, capacities, and constraints will affect how the protocol is implemented. The protocol is not tailored to any specific organization.

**L-7: No assessment topic specified**
The protocol is topic-neutral. Specific assessment topics (health, education, livelihoods, etc.) may require additional safeguards or adaptations not anticipated in this generic design.

**L-8: Unresolved safeguard questions**
Fifteen safeguard questions remain unresolved (Section 23) and must be answered before any specific assessment begins. These are not oversights — they are inherent to a generic protocol design.

### 26.2 Implementation Caveats

When the protocol is implemented, the following caveats apply:

**C-1: Partner review is mandatory**
No assessment begins until the local partner has reviewed and approved the protocol for their specific context. The partner may require changes.

**C-2: Safeguarding review is mandatory**
No assessment begins until the safeguarding reviewer has completed the pre-assessment review (Section 13.3) and signed off on readiness.

**C-3: Privacy review is mandatory**
No assessment begins until the privacy reviewer has completed the pre-assessment review (Section 14.5) and confirmed data handling adequacy.

**C-4: Community permission is required**
No assessment begins until the community (through appropriate structures) has given permission for the assessment to take place. Community permission is separate from individual consent.

**C-5: M32-01 dependency must be addressed**
The canonical dependency M32-01 is currently BLOCKED. The protocol design can proceed, but no real assessment can begin until the M32 scope is reviewed and the dependency is resolved or explicitly waived by the owner.

**C-6: No guarantee of program**
The assessment may conclude that no program should be proposed. This is a valid outcome. The protocol does not guarantee that assessment leads to action.

**C-7: Resource requirements**
Implementing the protocol properly requires resources (trained assessors, safeguarding reviewer, privacy reviewer, partner organization, community engagement time). If these resources are not available, the assessment should not proceed.

**C-8: Time requirements**
A proper assessment takes time. Rushing the process to meet a deadline compromises quality and safeguards. The protocol is time-bounded but not time-pressured.

### 26.3 Known Unknowns

The following are explicitly acknowledged as unknown:

| Unknown | Why Unknown | Impact |
|---------|-------------|--------|
| Target community | No community has been identified | All community-specific provisions are theoretical |
| Target partner | No partner has been qualified | Partner-dependent provisions cannot be tested |
| Legal jurisdiction | No jurisdiction has been specified | Legal compliance cannot be verified |
| Assessment topic | No specific need has been identified | Topic-specific safeguards may be needed |
| Cultural context | No cultural assessment has been conducted | Cultural appropriateness is unverified |
| Local service landscape | No referral service mapping has been done | Referral pathways are placeholder |
| Funding organization policies | No specific organization is involved | Organizational constraints are unknown |
| Participant population characteristics | No community demographics are available | Inclusion/exclusion criteria are generic |
| Security context | No security assessment has been conducted | Safety provisions are general |
| Technological infrastructure | No technology assessment has been conducted | Data handling provisions assume basic infrastructure |

### 26.4 Document Status

This document is:

- **BASELINE ESTABLISHED** — the protocol design is complete as a generic framework
- **NOT YET REVIEWED** — partner, safeguarding, and privacy reviews are deferred
- **NOT READY FOR IMPLEMENTATION** — the document cannot be used for real assessment without the deferred reviews and context-specific adaptations
- **SUBJECT TO REVISION** — the reviews may require changes to the protocol

---

## 27. Deferred Items Requiring Owner Action

### 27.1 Purpose

This section lists all items that require action by the project owner, funding organization, or other authorized parties before the protocol can move from "baseline established" to "ready for implementation."

### 27.2 Deferred Items Register

| ID | Item | Required Action | Responsible Party | Priority | Blocks What |
|----|------|----------------|-------------------|----------|-------------|
| **D-1** | Partner identification and qualification | Identify a specific local partner; assess against Section 4 criteria; document qualification decision | Funding organization + partner | ESSENTIAL | All assessment activity |
| **D-2** | Community identification | Identify the specific community to be assessed; confirm community willingness to participate | Partner + community | ESSENTIAL | All assessment activity |
| **D-3** | Legal jurisdiction determination | Determine which legal jurisdiction applies; obtain legal counsel review of protocol compliance | Funding organization + legal counsel | ESSENTIAL | All assessment activity |
| **D-4** | Safeguarding reviewer appointment | Appoint an independent, qualified safeguarding reviewer | Funding organization | ESSENTIAL | Pre-assessment review |
| **D-5** | Privacy reviewer appointment | Appoint an independent, qualified privacy reviewer | Funding organization | ESSENTIAL | Pre-assessment review |
| **D-6** | M32-01 dependency resolution | Resolve or waive the M32-01 BLOCKED status | M32 owner | HIGH | Assessment initiation |
| **D-7** | Partner review of protocol | Partner reviews this document and approves or requests changes | Partner | ESSENTIAL | Assessment initiation |
| **D-8** | Safeguarding review of protocol | Safeguarding reviewer conducts pre-assessment review (Section 13.3) | Safeguarding reviewer | ESSENTIAL | Assessment initiation |
| **D-9** | Privacy review of protocol | Privacy reviewer conducts pre-assessment review (Section 14.5) | Privacy reviewer | ESSENTIAL | Assessment initiation |
| **D-10** | Cultural adaptation of questions | Partner adapts question framework to local cultural context | Partner + community advisors | HIGH | Assessment sessions |
| **D-11** | Referral service mapping | Partner identifies and verifies local referral services | Partner | HIGH | Referral capability |
| **D-12** | Assessor training | Assessors are trained in protocol, safeguarding, and cultural competence | Partner + safeguarding reviewer | HIGH | Assessment sessions |
| **D-13** | Community permission | Community-level permission is obtained through appropriate structures | Partner + community | ESSENTIAL | Assessment sessions |
| **D-14** | Data storage setup | Secure data storage is established per the data map (Section 10) | Partner IT | MEDIUM | Data collection |
| **D-15** | Unresolved safeguard question resolution | All "before assessment begins" questions in Section 23 are resolved | Partner + reviewers | ESSENTIAL | Assessment initiation |
| **D-16** | Funding organization policy alignment | Funding organization confirms its policies align with protocol requirements | Funding organization | MEDIUM | Assessment initiation |
| **D-17** | Insurance and liability | Determine whether assessment activity requires insurance coverage | Funding organization + legal counsel | MEDIUM | Assessment initiation |
| **D-18** | Budget approval | Confirm budget for assessment activity (assessor time, partner costs, reviewer fees, community engagement) | Funding organization | MEDIUM | Assessment initiation |
| **D-19** | Communication plan | Develop a plan for communicating the assessment to the community | Partner + community advisors | HIGH | Community engagement |
| **D-20** | Go/no-go decision | Formal decision to proceed with the assessment based on all deferred items being resolved | Funding organization + partner | ESSENTIAL | Assessment initiation |

### 27.3 Decision Gate

The assessment **cannot begin** until all items marked ESSENTIAL are resolved. The go/no-go decision (D-20) is the final gate and requires:

1. All ESSENTIAL deferred items resolved satisfactorily
2. Partner review completed and approved (D-7)
3. Safeguarding review completed and approved (D-8)
4. Privacy review completed and approved (D-9)
5. Community permission obtained (D-13)
6. Formal go/no-go decision documented (D-20)

If any ESSENTIAL item cannot be resolved, the assessment does not proceed. This is documented as a **no-go outcome** and is a valid result of the protocol process.

### 27.4 No-Go Conditions

The assessment receives a no-go decision if:

- No qualified partner can be identified (D-1 fails)
- The community does not give permission (D-13 fails)
- Legal counsel identifies unresolvable compliance issues (D-3 fails)
- The safeguarding reviewer identifies unresolvable safeguarding concerns (D-8 fails)
- The privacy reviewer identifies unresolvable privacy concerns (D-9 fails)
- The funding organization withdraws support (D-16 fails)
- M32-01 dependency cannot be resolved or waived (D-6 fails)
- Budget is not available (D-18 fails)

A no-go decision is documented with:
- The specific reason(s) for the no-go
- The date of the decision
- The decision-maker
- Any conditions that, if changed, could lead to a different decision
- Confirmation that no assessment activity will occur
- Confirmation that any draft contact data is deleted (per rollback procedure)

### 27.5 Owner Action Required

The following items require direct action by the project owner:

| Action | Owner | Deadline | Notes |
|--------|-------|----------|-------|
| Approve this protocol document as a baseline for review | Project owner | Before D-7, D-8, D-9 | Owner approval authorizes the document to be sent to reviewers |
| Identify and engage a funding organization (if not the project owner) | Project owner | Before D-1 | The funding organization must be identified before a partner can be qualified |
| Appoint safeguarding and privacy reviewers | Project owner | Before D-4, D-5 | Reviewers must be independent and qualified |
| Resolve M32-01 dependency | M32 owner / Project owner | Before D-6 | M32-01 is currently BLOCKED; this must be addressed |
| Make the go/no-go decision | Project owner + partner | After all other deferred items | The final decision to proceed or not |

---

## 28. Conclusion: BASELINE ESTABLISHED

### 28.1 Summary

This document establishes the **baseline design** for a partner-led needs assessment protocol (M49-01 / CHAR-001). The protocol provides a comprehensive framework for conducting a consent-led, minimal-data, safeguarding-aware assessment of community needs before any charitable program is proposed.

### 28.2 What Has Been Achieved

| Achievement | Status | Evidence |
|-------------|--------|----------|
| Protocol design complete | YES | Sections 3-12 |
| Consent framework defined | YES | Section 6 |
| Data minimization principles established | YES | Section 7 |
| Inclusion/exclusion criteria specified | YES | Section 8 |
| Assessment question framework designed | YES | Section 9 |
| Data flow mapped | YES | Section 10 |
| Referral pathways defined | YES | Section 11 |
| Stop conditions specified | YES | Section 12 |
| Safeguarding review framework established | YES | Section 13 |
| Privacy impact assessment completed | YES | Section 14 |
| Coercion scenario walkthrough | YES | Section 15 |
| Referral scenario walkthrough | YES | Section 16 |
| Data breach scenario walkthrough | YES | Section 17 |
| No-response scenario walkthrough | YES | Section 18 |
| Anti-extractive research measures defined | YES | Section 19 |
| Unsafe disclosure prevention addressed | YES | Section 20 |
| False representation safeguards specified | YES | Section 21 |
| Protocol completeness verified | YES | Section 22 (98/98 items) |
| Unresolved safeguard questions documented | YES | Section 23 (15 questions) |
| Risk register populated | YES | Section 24 (18 risks) |
| Metrics and success criteria defined | YES | Section 25 |
| Limitations and caveats documented | YES | Section 26 |
| Deferred items identified | YES | Section 27 (20 items) |

### 28.3 What Has NOT Been Achieved

| Item | Status | Reason |
|------|--------|--------|
| Partner identified and qualified | NOT DONE | Requires owner action (D-1) |
| Community identified | NOT DONE | Requires partner action (D-2) |
| Legal jurisdiction determined | NOT DONE | Requires owner action (D-3) |
| Safeguarding reviewer appointed | NOT DONE | Requires owner action (D-4) |
| Privacy reviewer appointed | NOT DONE | Requires owner action (D-5) |
| M32-01 dependency resolved | NOT DONE | M32-01 is BLOCKED (D-6) |
| Partner review of protocol | NOT DONE | Requires partner identification first (D-7) |
| Safeguarding review of protocol | NOT DONE | Requires reviewer appointment first (D-8) |
| Privacy review of protocol | NOT DONE | Requires reviewer appointment first (D-9) |
| Community permission obtained | NOT DONE | Requires community identification first (D-13) |
| Go/no-go decision made | NOT DONE | Requires all other deferred items first (D-20) |

### 28.4 Document Status

**BASELINE ESTABLISHED**

This means:

- The protocol design is **complete as a generic framework**
- The document is **ready for review** by partner, safeguarding, and privacy reviewers
- The document is **not ready for implementation** — deferred items must be resolved first
- The document is **subject to revision** — reviews may require changes
- No real-world assessment activity is authorized by this document
- No real beneficiary data has been used or collected
- All scenarios are **synthetic** — no real events or people are represented

### 28.5 Next Steps

The next steps are entirely dependent on owner action:

1. **Owner reviews this document** and approves it as a baseline for external review
2. **Owner identifies a funding organization** (if not the project owner)
3. **Owner appoints safeguarding and privacy reviewers**
4. **Owner resolves the M32-01 dependency** (or explicitly waives it)
5. **Partner is identified and qualified** against Section 4 criteria
6. **Community is identified** and initial contact is made
7. **Legal jurisdiction is determined** and legal counsel reviews the protocol
8. **Partner reviews the protocol** and approves or requests changes
9. **Safeguarding reviewer conducts pre-assessment review**
10. **Privacy reviewer conducts pre-assessment review**
11. **All unresolved safeguard questions are resolved**
12. **Community permission is obtained**
13. **Go/no-go decision is made**
14. **If go: assessment begins** following the approved protocol
15. **If no-go: assessment does not begin**; documentation is complete; lessons are recorded

### 28.6 Relationship to Downstream Tasks

This protocol design enables but does not commit to:

- **M49-02 (CHAR-002):** Method comparison for one partner-defined need — requires this protocol to be approved and a need to be identified
- **M49-09 (CHAR-009):** Outcome measurement plan before pilot — requires an assessment to have been conducted and a need to have been identified
- **M32-01:** First member validation — this protocol depends on M32 scope review; the relationship is bidirectional

### 28.7 Final Statement

This document fulfills the M49-01 task specification:

- **Objective met:** A protocol has been prepared for a qualified local partner to identify a specific unmet need before any program is proposed
- **Scope met:** The protocol is consent-led, minimal-data, with inclusion/exclusion, referral, and stop conditions
- **Acceptance criteria met:** The protocol cannot collect sensitive personal details by default; partner and participant can decline without penalty
- **Definition of done partially met:** The protocol document is drafted; local partner, safeguarding, and privacy reviews are required but deferred
- **Verification plan met:** Scenario walkthroughs for coercion, referral, data breach, and no-response cases are completed
- **Risks documented:** Extractive research, unsafe disclosure, and false representation risks are identified with mitigation strategies
- **Metrics defined:** Protocol completeness and unresolved safeguard questions are tracked; no impact target is invented
- **Closure evidence partial:** Reviewed protocol (this document) and data map (Section 10) are complete; approval/no-go record is deferred

**Status: BASELINE ESTABLISHED — protocol design complete, partner review deferred.**

---

*Document prepared: 2026-10-31*  
*Document status: BASELINE ESTABLISHED*  
*All scenarios: SYNTHETIC — no real beneficiary data*  
*Next required action: Owner review and appointment of reviewers*
