# M49-02 — Compare Needs-Assessment Methods for Accessibility and Harm

**Task ID:** M49-02  
**Candidate:** CHAR-002  
**Priority:** P2 · **Difficulty:** D3 · **Effort:** M (3–6 days)  
**Status:** BASELINE ESTABLISHED — comparison complete, partner validation deferred  
**Date:** 2026-10-31  
**Owner:** humanitarian research lead  
**Dependency:** M49-01 (BASELINE ESTABLISHED) — satisfied  
**Domain:** Charity / Needs discovery  
**Confidence:** Low · **Risk:** High  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Comparison Goals and Constraints](#3-comparison-goals-and-constraints)
4. [Three Assessment Methods Defined](#4-three-assessment-methods-defined)
5. [Method 1: Interview Approach](#5-method-1-interview-approach)
6. [Method 2: Facilitated Group Approach](#6-method-2-facilitated-group-approach)
7. [Method 3: Anonymous Feedback Approach](#7-method-3-anonymous-feedback-approach)
8. [Hypothetical Scenario Definition](#8-hypothetical-scenario-definition)
9. [Accessibility Analysis per Method](#9-accessibility-analysis-per-method)
10. [Privacy Risk Scoring per Method](#10-privacy-risk-scoring-per-method)
11. [Data Necessity Analysis](#11-data-necessity-analysis)
12. [Safe Alternatives Identification](#12-safe-alternatives-identification)
13. [Power Imbalance Scenarios](#13-power-imbalance-scenarios-tabletop-exercise)
14. [Disability Access Scenarios](#14-disability-access-scenarios-tabletop-exercise)
15. [Language Barrier Scenarios](#15-language-barrier-scenarios-tabletop-exercise)
16. [Unsafe Disclosure Scenarios](#16-unsafe-disclosure-scenarios-tabletop-exercise)
17. [Cultural Misapplication Risks](#17-cultural-misapplication-risks)
18. [Local Decision Authority Preservation](#18-local-decision-authority-preservation)
19. [Referral and Stop Rules per Method](#19-referral-and-stop-rules-per-method)
20. [Method Selection Decision Framework](#20-method-selection-decision-framework)
21. [Inclusion Risk Mitigation Assignment](#21-inclusion-risk-mitigation-assignment)
22. [Qualified Reviewer Consultation Protocol](#22-qualified-reviewer-consultation-protocol)
23. [Metrics and Success Criteria](#23-metrics-and-success-criteria)
24. [Limitations and Caveats](#24-limitations-and-caveats)
25. [Deferred Items Requiring Owner Action](#25-deferred-items-requiring-owner-action)
26. [Conclusion: BASELINE ESTABLISHED](#26-conclusion-baseline-established)

---

## 1. Executive Summary

This document presents a **structured comparison of three needs-assessment methods** — interview, facilitated group, and anonymous feedback — evaluated for their accessibility, harm potential, and suitability in a humanitarian or charitable context. The comparison is conducted against a single hypothetical partner-defined need and uses synthetic scenarios exclusively.

### 1.1 Purpose

The M49-01 needs assessment protocol (CHAR-001) established **that** a qualified local partner should conduct a consent-led, minimal-data assessment before any program is proposed. M49-02 now addresses **how** that assessment should be conducted by comparing the three most common methods available to a partner and identifying:

- Who each method may exclude and why
- What privacy and harm risks each method introduces
- When each method must **not** be used (no-go conditions)
- What data is strictly necessary versus optional under each method
- What safe alternatives exist when a method is inappropriate

### 1.2 What This Document Is

This is a **method comparison artifact** — a governance and process design document. It:

- Compares three assessment methods against consistent criteria
- Simulates trade-offs using a hypothetical scenario
- Documents no-go conditions and exclusion risks for each method
- Provides tabletop exercises for four risk categories
- Assigns inclusion risk mitigations with accountability
- Establishes a decision framework for method selection

### 1.3 What This Document Is Not

This document is explicitly **not**:

- A live survey, interview, or feedback collection exercise
- An implementation of any assessment method with real participants
- A determination of any community's actual needs
- A product feature, platform tool, or identity store
- A replacement for the M49-01 protocol (it extends it)
- An overlap with M32 participation mechanisms (those are separate scope)
- A validation that any specific method is appropriate for any specific community

### 1.4 Current State

As of this baseline:

- No method has been selected or approved for any community
- No participant contact has occurred or been authorized
- The hypothetical scenario is synthetic — no real community is represented
- The comparison is a design artifact awaiting partner and reviewer validation
- M49-01 remains BASELINE ESTABLISHED with partner review deferred

### 1.5 Key Findings (Summary)

No single method is universally appropriate. Each method carries distinct inclusion and exclusion profiles:

| Method | Primary Strength | Primary Risk | Key Exclusion |
|--------|-----------------|--------------|---------------|
| **Interview** | Depth, consent control, safeguarding observation | Power imbalance, assessor bias, time burden | Those who cannot attend in person, those intimidated by authority |
| **Facilitated Group** | Peer validation, collective voice, efficiency | Dominant voices suppress others, public disclosure pressure | Those who cannot speak freely in groups, those with social anxiety, marginalized subgroups |
| **Anonymous Feedback** | Reduced social pressure, broader reach | No follow-up, no consent dialogue, verification gaps | Those without literacy or technology access, those who need clarification |

### 1.6 Document Structure

The remaining sections define each method in detail (Sections 4–7), apply them to a hypothetical scenario (Section 8), analyze accessibility and privacy (Sections 9–10), examine data necessity (Section 11), identify safe alternatives (Section 12), conduct four tabletop exercises (Sections 13–16), address cultural and authority concerns (Sections 17–18), establish referral and stop rules (Section 19), provide a decision framework (Section 20), assign mitigations (Section 21), define the reviewer consultation protocol (Section 22), and close with metrics, limitations, and deferred items (Sections 23–26).

All scenarios use synthetic data only. No real beneficiary information is referenced or implied.

---

## 2. Task Metadata

### 2.1 Canonical References

| Field | Value |
|-------|-------|
| **Task ID** | M49-02 |
| **Candidate ID** | CHAR-002 |
| **Milestone** | M49 — HARBOR humanitarian and safeguarding readiness |
| **Group** | G7 — ECOSYSTEM |
| **Priority** | P2 (improvement/next horizon) |
| **Difficulty** | D3 (bounded multi-file) |
| **Effort** | M (3–6 days) |
| **Owner** | humanitarian research lead |
| **Confidence** | Low |
| **Risk** | High |
| **Domain score** | 63 |
| **Common score** | 65 |
| **V5 Wave** | W3 |
| **Tags** | research, inclusion |

### 2.2 Dependencies

| Dependency | Type | Status | Notes |
|-----------|------|--------|-------|
| M49-01 (CHAR-001) | Canonical TODO | BASELINE ESTABLISHED | Needs assessment protocol provides the framework within which methods operate |
| M32-01 | Canonical TODO | BLOCKED | No real member evidence; workable as baseline with synthetic data |
| CHAR-001 protocol | Source dependency | BASELINE ESTABLISHED | Consent, data minimization, and safeguarding principles inherited |
| CHAR-003 (M49-03) | Downstream | INDEPENDENT | Program roles are a separate scope; no dependency |

### 2.3 Execution Constraints

- **No new ADR required** for the task scope currently proposed (per ADR applicability register)
- **No live survey, identity store, or product feature** — protocol comparison only
- **No live participant contact** — all scenarios are synthetic
- **No outreach, private/unlicensed content import, publication, money handling, or owner-boundary change** without separate authority
- **TODO.md is the sole status source** — this document records comparison, not completion
- **Anti-overlap:** Does not determine beneficiary needs or implement M32 participation

### 2.4 Acceptance Criteria (from TODO)

1. Recommendation identifies **who may be excluded** and why
2. Recommendation identifies **what data is necessary** versus optional
3. Recommendation identifies **safe alternatives** when a method is inappropriate

### 2.5 Definition of Done (from TODO)

- No live participant contact: **SATISFIED** (all scenarios synthetic)
- Partner validates any locally specific conclusion: **DEFERRED** (no partner identified)

### 2.6 Verification Plan (from TODO)

Tabletop scenarios for four risk categories:

1. Power imbalance — authority dynamics suppress honest response
2. Disability — physical, sensory, or cognitive barriers exclude participants
3. Language — communication gaps distort or prevent participation
4. Unsafe disclosure — participant reveals information that puts them at risk

### 2.7 Closure Evidence Required

- Reviewed comparison document (this artifact, pending review)
- Assumptions register (Section 24)
- No-go conditions documented (Sections 5–7, 19)
- Partner validation: **DEFERRED**

### 2.8 Anti-Overlap Statement

This task is explicitly **not**:

- A needs assessment itself (no assessment has been conducted)
- A determination of any community's needs
- An implementation of M32 participation mechanisms
- A duplicate of M49-01 protocol design (it builds on that protocol)
- A method selection for any real community (it compares methods abstractly)

It **extends** M49-01 by examining how the protocol's assessment function could be delivered through different methods, and **enables** downstream method selection once a partner and community context are established.

---

## 3. Comparison Goals and Constraints

### 3.1 Primary Goal

Enable an informed, partner-led decision about which assessment method (or combination of methods) is **least harmful and most inclusive** for a specific community context and defined need. The comparison exists to answer:

> "Given a partner-defined need and a specific community context, which method(s) can gather the necessary information while minimizing exclusion, privacy risk, and harm?"

If no method can be used safely, the comparison should document that conclusion and recommend withdrawal.

### 3.2 Secondary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| Identify exclusion risks | Document who each method may exclude and why | Essential |
| Score privacy risks | Compare data exposure profiles across methods | Essential |
| Define no-go conditions | Specify when each method must not be used | Essential |
| Preserve local authority | Ensure the partner retains decision-making power over method selection | Essential |
| Enable safe alternatives | Identify fallback options when primary methods are inappropriate | High |
| Support tabletop verification | Provide scenarios that test each method against known risk categories | High |
| Document assumptions | Make explicit what the comparison assumes and what it cannot know | Medium |

### 3.3 Explicit Non-Goals

The comparison does **not**:

- Select a method for any real community (that requires partner decision)
- Validate that any method works across all cultural contexts
- Produce a quantitative scoring system that replaces qualitative judgment
- Eliminate the need for safeguarding review of any chosen method
- Create a platform tool or survey application
- Measure assessment effectiveness or impact
- Generalize findings across communities or contexts

### 3.4 Hard Constraints

These constraints are inherited from M49-01 and are non-negotiable:

**HC-1: No sensitive personal data by default**  
Any method comparison must assume the M49-01 data minimization principle. Methods that inherently require more personal data score higher on risk.

**HC-2: Decline without penalty**  
Each method must include a mechanism for participants to decline or withdraw. Methods where withdrawal is difficult or visible score higher on exclusion risk.

**HC-3: Partner independence**  
The comparison does not recommend a method — it provides information so the partner can choose. Any appearance of the funding organization directing method choice violates this constraint.

**HC-4: Safeguarding override**  
Each method must include stop conditions. Methods where safeguarding concerns are harder to detect or act on score higher on harm risk.

**HC-5: No automatic program commitment**  
The method comparison does not imply that any assessment will lead to a program. All methods must accommodate a no-go outcome.

### 3.5 Comparison Principles

The comparison follows these analytical principles:

1. **Symmetry of analysis** — each method is evaluated against the same criteria, with the same rigor
2. **Context dependency** — no method is declared universally superior; suitability depends on community context
3. **Harm-first evaluation** — exclusion and harm risks are evaluated before effectiveness or efficiency
4. **Local authority preservation** — the comparison informs but does not determine the partner's method choice
5. **Synthetic-only evidence** — all scenarios and examples are hypothetical; no real community data is referenced
6. **Transparent assumptions** — every analytical claim identifies its underlying assumption

### 3.6 Relationship to M49-01

```
M49-01 (needs assessment protocol)
    |
    | Defines: consent framework, data minimization, safeguarding,
    |          stop conditions, referral pathways, partner qualification
    |
    v
M49-02 (THIS TASK: method comparison)
    |
    | Compares: interview, facilitated group, anonymous feedback
    | Against: accessibility, harm, privacy, inclusion
    |
    v
[Future: partner selects method for a specific community context]
    |
    v
[Future: method is applied under M49-01 protocol safeguards]
```

This task does not alter, replace, or extend the M49-01 protocol. It examines how the protocol's assessment function could be delivered through different methods.

---

## 4. Three Assessment Methods Defined

### 4.1 Method Overview

The three methods compared in this document represent the most common approaches to community needs assessment in humanitarian and charitable contexts. Each is defined at a protocol level — the specific implementation details would be determined by the partner in consultation with the community.

| Method | Core Mechanism | Interaction Pattern | Data Type |
|--------|---------------|---------------------|-----------|
| **Interview** | One-on-one structured or semi-structured conversation | Assessor ↔ Participant (dyadic) | Qualitative, verbal, potentially recorded |
| **Facilitated Group** | Guided group discussion with structured activities | Assessor ↔ Group; Group ↔ Group (multi-party) | Qualitative, verbal, observational, potentially recorded |
| **Anonymous Feedback** | Self-administered response to structured prompts | Participant → System (no interpersonal interaction) | Quantitative or qualitative, written/digital |

### 4.2 Method Boundaries

Each method is defined with explicit boundaries to prevent scope creep:

**Interview boundaries:**
- One assessor with one participant at a time
- Pre-defined question guide (semi-structured)
- Scheduled session with agreed duration
- Recorded only with separate explicit consent
- Not a counseling session, not an interrogation

**Facilitated group boundaries:**
- One facilitator with multiple participants (typically 4–12)
- Structured discussion format with ground rules
- Scheduled session with agreed duration
- Recorded only with separate explicit group consent
- Not a public meeting, not a focus group for marketing, not a therapy session

**Anonymous feedback boundaries:**
- No interpersonal interaction during response collection
- Structured prompts (written, digital, or pictorial)
- Self-paced, no scheduled session required
- No identifying information collected by default
- Not a vote, not a survey for statistical generalization, not a suggestion box

### 4.3 Method Variants Acknowledged

Each method has variants that may alter its risk profile. This comparison addresses the **baseline form** of each method. Variants are noted where they materially change the analysis:

| Method | Variant | How It Changes the Analysis |
|--------|---------|----------------------------|
| Interview | Telephone/video | Reduces physical access barriers; introduces technology access barrier |
| Interview | Peer interviewer | Reduces power imbalance; may increase social pressure |
| Facilitated Group | World cafe / open space | More fluid grouping; harder to track consent individually |
| Facilitated Group | Separate demographic groups | Reduces cross-group dominance; requires multiple sessions |
| Anonymous Feedback | Digital survey | Broader reach; introduces digital literacy and access barriers |
| Anonymous Feedback | Paper ballot | Reduces technology barrier; introduces literacy barrier |
| Anonymous Feedback | Pictorial/visual | Reduces literacy barrier; requires cultural validation of symbols |

### 4.4 Method Selection Is Not This Document's Decision

This document compares methods. It does not select one. The selection decision belongs to the qualified local partner (per M49-01), who understands the community context, cultural norms, and specific assessment question. The comparison provides information to support that decision — not the decision itself.

---

## 5. Method 1: Interview Approach

### 5.1 Protocol Description

The interview method involves a trained assessor conducting a one-on-one conversation with a participant, following a semi-structured question guide. The interview is the most controlled method: the assessor manages the environment, the pace, and the consent process.

**Typical flow:**

1. Assessor and participant meet in a private, agreed location
2. Assessor reviews consent form verbally, confirms understanding, documents consent
3. Assessor follows question guide, adapting language to participant's comprehension
4. Assessor observes non-verbal cues for distress or discomfort
5. Assessor offers referral information if needed
6. Assessor closes session, confirms participant's right to withdraw consent for data use
7. Assessor documents findings, stores data per M49-01 data handling provisions

### 5.2 Strengths

| Strength | Description | Significance |
|----------|-------------|--------------|
| **Depth of response** | Participant can elaborate, clarify, and provide context | High — captures nuance that structured methods miss |
| **Consent control** | Assessor can verify understanding and ongoing willingness | High — strongest consent quality of the three methods |
| **Safeguarding observation** | Assessor can observe distress, discomfort, or disclosure cues | High — best method for detecting safeguarding concerns in real time |
| **Adaptive questioning** | Assessor can rephrase, skip, or modify questions based on responses | Medium — improves data quality and participant comfort |
| **Privacy of response** | Participant responds without audience effect | High — reduces social desirability bias |
| **Accessibility accommodation** | Assessor can adjust environment, pace, and format for individual needs | Medium — supports disability accommodation within the session |
| **Relationship building** | Human connection can build trust and validate participant dignity | Medium — supports anti-extractive research principles |

### 5.3 Weaknesses

| Weakness | Description | Significance |
|----------|-------------|--------------|
| **Power imbalance** | Assessor holds institutional authority; participant may feel pressured | High — the most significant risk of this method |
| **Time burden** | Each interview takes 30–90 minutes; limits number of participants | Medium — reduces breadth of input |
| **Assessor bias** | Assessor's identity, demeanor, and framing influence responses | High — responses reflect the interaction, not just the participant's view |
| **Physical access requirement** | Participant must travel to or host the interview location | High — excludes those with mobility, transport, or safety constraints |
| **Scheduling dependency** | Both parties must agree on time and place | Medium — creates logistical barriers |
| **Single perspective** | One participant cannot validate or challenge another's view | Medium — limits collective sense-making |
| **Cost per participant** | Trained assessor time is the most expensive resource | Medium — limits scalability |
| **Recording consent complexity** | Audio/video recording requires separate consent; notes may miss nuance | Medium — documentation trade-offs |

### 5.4 Inclusion Risks

The interview method may systematically exclude:

| Excluded Group | Reason for Exclusion | Severity |
|----------------|---------------------|----------|
| People with social anxiety or trauma related to authority figures | One-on-one with an institutional representative may be intimidating | High |
| People with mobility impairments | Physical access to interview location may be impossible | High |
| People in remote locations | Travel to interview site may be impractical | Medium |
| People with hearing impairments | Interview relies on verbal communication; interpreter may not be available | Medium |
| People with cognitive impairments | Semi-structured format requires sustained attention and comprehension | Medium |
| People with care duties (especially women) | Fixed scheduling conflicts with childcare or eldercare | Medium |
| People who fear being identified as participants | Being seen entering an interview location may carry social risk | High in some contexts |
| People who speak a different language from the assessor | Interpreter introduces a third party, reducing privacy | Medium |
| People who distrust external institutions | Institutional assessor may be viewed with suspicion | High in some contexts |

### 5.5 No-Go Conditions for Interview Method

The interview method must **not** be used when:

1. **The community context makes private meetings suspicious** — being seen with an external assessor could put the participant at risk of social sanction, accusation, or violence
2. **The assessor cannot guarantee physical privacy** — if the interview location does not provide acoustic and visual privacy, the method is inappropriate
3. **The participant cannot communicate safely** — if the participant's responses could be overheard by someone who would harm them for their views
4. **The power imbalance is too severe** — if the assessor's institutional role (employer, funder, authority figure) makes genuine free response impossible
5. **The community has not granted permission for individual interviews** — some communities view one-on-one questioning as inappropriate or disrespectful
6. **The assessor lacks safeguarding training** — the interview method requires real-time detection and response to distress
7. **No referral pathway exists** — if the interview triggers a disclosure, the assessor must have somewhere to refer the participant

### 5.6 Data Profile

| Data Category | Collected by Default? | Justification Required? |
|---------------|----------------------|------------------------|
| Participant identity (name) | NO | Required only if follow-up is needed and consented |
| Demographic information | NO | Required only if assessment question specifically demands it |
| Assessment responses | YES | Core purpose of the interview |
| Non-verbal observations | YES (assessor notes) | Part of the assessor's professional observation |
| Audio/video recording | NO | Requires separate explicit consent; not default |
| Location data | NO | Only if relevant to assessment question |
| Contact information | NO | Only if follow-up is planned and consented |

---

## 6. Method 2: Facilitated Group Approach

### 6.1 Protocol Description

The facilitated group method involves a trained facilitator guiding a structured discussion among multiple participants (typically 4–12). The group setting creates opportunities for peer validation, collective sense-making, and shared priority-setting that individual methods cannot provide.

**Typical flow:**

1. Facilitator convenes the group in an agreed location
2. Facilitator establishes ground rules (respect, confidentiality, right to pass)
3. Facilitator reviews group consent process — each individual consents to participate and to the group's collective confidentiality
4. Facilitator guides structured discussion using open-ended prompts
5. Facilitator manages group dynamics — ensures dominant voices do not suppress others
6. Facilitator uses participatory tools (ranking, mapping, diagramming) to structure input
7. Facilitator observes group interactions for inclusion gaps and safeguarding concerns
8. Facilitator offers individual follow-up for anyone who wants to speak privately
9. Facilitator closes session, summarizes key themes for group validation
10. Facilitator documents findings, noting which themes had consensus and which were contested

### 6.2 Strengths

| Strength | Description | Significance |
|----------|-------------|--------------|
| **Peer validation** | Participants can confirm, challenge, or build on each other's views | High — reduces individual bias; surfaces shared priorities |
| **Collective sense-making** | Group discussion can identify patterns and connections individuals miss | High — produces richer understanding of community dynamics |
| **Efficiency** | Multiple voices heard in one session | Medium — reduces total assessor time per participant |
| **Marginalized voice amplification** | Skilled facilitator can ensure quieter members contribute | Medium — counteracts dominance hierarchies when managed well |
| **Community ownership** | Group process feels more communal and less extractive | High — supports partner independence principle |
| **Cross-perspective exposure** | Participants hear views different from their own | Medium — challenges assumptions within the community itself |
| **Participatory tools** | Ranking, mapping, and diagramming engage different communication styles | Medium — supports inclusion of non-verbal contributors |
| **Natural consensus detection** | Facilitator can observe which themes have broad agreement | High — informs priority-setting without forcing votes |

### 6.3 Weaknesses

| Weakness | Description | Significance |
|----------|-------------|--------------|
| **Dominant voice suppression** | Community leaders, elders, or loud participants can control the narrative | High — the most significant risk of this method |
| **Public disclosure pressure** | Participants may feel unable to dissent or disclose sensitive information in a group | High — constrains honest response |
| **Consent complexity** | Individual consent within a group context is difficult to manage | High — withdrawal by one participant does not remove their contribution from group discussion |
| **Safeguarding detection difficulty** | Facilitator must monitor multiple participants simultaneously | High — distress signals may be missed in a group setting |
| **Groupthink risk** | Social cohesion pressure may produce false consensus | Medium — participants may agree publicly while disagreeing privately |
| **Exclusion of non-attendees** | People who cannot or will not attend the group session are invisible | High — systematic exclusion of certain demographics |
| **Cultural inappropriateness** | Some communities do not discuss certain topics in mixed company | High — gender, age, caste, or status mixing may violate norms |
| **Facilitator skill dependency** | Quality of the process depends heavily on facilitator competence | High — a poorly trained facilitator can cause harm |
| **Recording consent impracticality** | Group recording requires consent from all members; one objection blocks it | Medium — documentation relies on facilitator notes |
| **Retaliation risk** | Participants may face consequences for views expressed in the group | High — especially if group composition includes conflicting interests |

### 6.4 Inclusion Risks

The facilitated group method may systematically exclude:

| Excluded Group | Reason for Exclusion | Severity |
|----------------|---------------------|----------|
| People who dissent from group consensus | Social pressure to conform; fear of retaliation | High |
| People with social anxiety | Group discussion is overwhelming for some | High |
| People with hearing impairments | Group discussion is fast, multi-directional; difficult to follow | High |
| People with speech impairments or who are non-verbal | Verbal group format excludes non-speakers | High |
| People of lower social status (gender, caste, age, gender identity) | May not feel safe contradicting higher-status participants | High |
| Women in mixed-gender groups | Cultural norms may prevent women from speaking freely | High in many contexts |
| Young people in elder-dominated groups | Age hierarchy suppresses youth voices | Medium |
| People with trauma related to group settings | Group discussion may trigger traumatic memories | Medium |
| People who cannot attend at the scheduled time | Care duties, work schedules, transport limitations | Medium |
| People who are not part of the dominant social network | Outsiders, newcomers, marginalized subgroups may not be invited or feel welcome | High |
| People with cognitive impairments | Fast-paced group discussion may be difficult to follow | Medium |

### 6.5 No-Go Conditions for Facilitated Group Method

The facilitated group method must **not** be used when:

1. **The community has severe internal power imbalances** that prevent honest expression in a group setting — if lower-status members cannot speak freely in the presence of higher-status members, the method produces distorted data and may cause harm
2. **The topic is culturally inappropriate for group discussion** — some needs (e.g., domestic violence, sexual health, personal trauma) cannot be discussed in a group without violating dignity norms
3. **The facilitator lacks advanced group management skills** — managing dominance, ensuring inclusion, and detecting distress in a group requires more skill than one-on-one facilit
4. **Group composition cannot be managed** — if the partner cannot control who attends, the method is unsafe
5. **Participants cannot be assured of confidentiality** — if what is said in the group cannot be kept within the group, the method is inappropriate
6. **The community has a history of collective punishment** — if expressing a dissenting view in a group could result in retaliation against the individual or their family
7. **No individual follow-up option exists** — the method must offer a private alternative for participants who need to speak individually
8. **The group size exceeds the facilitator's capacity to manage** — groups larger than 12–15 become unmanageable for safeguarding purposes

### 6.6 Data Profile

| Data Category | Collected by Default? | Justification Required? |
|---------------|----------------------|------------------------|
| Participant identity (names) | NO | Facilitator may not know all participants by name |
| Demographic information | NO | Only if assessment question specifically demands it |
| Group-level themes | YES | Core purpose of the discussion |
| Consensus vs. contested views | YES | Facilitator documents agreement levels |
| Individual responses attributed to named persons | NO | Requires separate explicit consent |
| Audio/video recording | NO | Requires consent from all group members; not default |
| Participatory tool outputs (rankings, maps) | YES | Group-generated; attributed to the group, not individuals |
| Observation of group dynamics | YES (facilitator notes) | Part of the facilitator's professional observation |
| Individual follow-up disclosures | YES (if offered) | Must follow interview consent protocol |

---

## 7. Method 3: Anonymous Feedback Approach

### 7.1 Protocol Description

The anonymous feedback method enables participants to respond to structured prompts without interpersonal interaction. Responses are collected without identifying information, reducing social pressure and power dynamics. The method includes written surveys, digital forms, pictorial feedback tools, and suggestion mechanisms.

**Typical flow:**

1. Partner designs structured prompts aligned with the assessment question
2. Prompts are made available through one or more channels (paper, digital, pictorial, oral recording)
3. Participants respond at their own pace, in their own time, without an assessor present
4. Responses are collected without identifying information
5. Partner aggregates and analyzes responses
6. Partner identifies themes and patterns
7. Partner offers an optional follow-up mechanism for participants who want to elaborate (this transitions to interview or group method)
8. Partner documents findings, noting response rates and demographic gaps

### 7.2 Strengths

| Strength | Description | Significance |
|----------|-------------|--------------|
| **Reduced social pressure** | No assessor or group present to influence responses | High — participants may answer more honestly |
| **Power imbalance mitigation** | Institutional authority is absent from the response moment | High — the most significant advantage over other methods |
| **Self-paced** | Participants respond at their own speed, in their own time | Medium — supports cognitive accessibility |
| **Scalable** | Many participants can respond simultaneously | Medium — increases breadth of input |
| **Privacy by design** | No identifying information collected by default | High — strongest privacy profile of the three methods |
| **Multiple format options** | Written, digital, pictorial, audio — can accommodate different literacy levels | Medium — supports inclusion when designed well |
| **No scheduling dependency** | Participants respond when convenient | Medium — reduces logistical barriers |
| **Lower cost per response** | No trained assessor time required per response | Medium — enables broader participation |
| **Reduced retaliation risk** | Anonymity protects participants from consequences | High — especially important in conflict-affected communities |

### 7.3 Weaknesses

| Weakness | Description | Significance |
|----------|-------------|--------------|
| **No consent dialogue** | Participant cannot ask questions or clarify intent | High — consent is implied rather than verified; weakest consent quality |
| **No follow-up** | Cannot probe ambiguous or incomplete responses | High — data quality may be lower |
| **No safeguarding observation** | Cannot detect distress, coercion, or disclosure | High — the most significant safeguarding gap |
| **Verification impossible** | Cannot confirm who responded or whether responses are genuine | Medium — data integrity concerns |
| **Literacy dependency** | Written formats exclude non-literate participants | High — a major accessibility barrier |
| **Technology dependency** | Digital formats exclude those without device or internet access | High — creates a digital divide |
| **Cultural validation difficulty** | Prompts may be misunderstood across cultural contexts | High — questions designed externally may not translate |
| **Low response rates** | Without interpersonal engagement, participation may be sparse | Medium — reduces representativeness |
| **No relationship building** | Transactional method does not build trust or validate dignity | Medium — may feel extractive despite anonymity |
| **Aggregation loses nuance** | Individual context is stripped from responses | Medium — themes may oversimplify |
| **Anonymity cannot be guaranteed technically** | Digital systems can potentially trace responses | Medium — false sense of security |
| **No accommodation for disability** | Standard formats may not be accessible | High — requires deliberate design for each disability type |

### 7.4 Inclusion Risks

The anonymous feedback method may systematically exclude:

| Excluded Group | Reason for Exclusion | Severity |
|----------------|---------------------|----------|
| Non-literate people | Written formats are inaccessible | High |
| People without access to technology | Digital formats require devices and connectivity | High |
| People with visual impairments | Standard print or screen formats may be inaccessible | High |
| People with cognitive impairments | Complex prompts may be incomprehensible without assistance | High |
| People who need clarification before responding | No interlocutor available to explain questions | Medium |
| People who do not trust anonymous systems | Suspicion of data collection may suppress participation | Medium |
| People whose language is not represented in the prompts | Translation gaps exclude non-dominant language speakers | High |
| People who prefer verbal communication | Written/digital formats disadvantage oral communicators | Medium |
| Elderly people unfamiliar with technology | Digital divide is generational as well as economic | Medium |
| People who need human connection to feel safe | Anonymity can feel isolating rather than protective | Medium |

### 7.5 No-Go Conditions for Anonymous Feedback Method

The anonymous feedback method must **not** be used when:

1. **The assessment question requires nuanced understanding** that cannot be captured in structured prompts — if the question is complex, contextual, or emotionally sensitive, anonymous feedback is insufficient
2. **The target population has low literacy** — if a significant portion of the community cannot read or write, written formats exclude them
3. **Technology access is unreliable** — if digital formats depend on infrastructure that is unavailable or untrusted, the method fails
4. **Safeguarding observation is essential** — if the assessment topic is likely to trigger disclosures of abuse, trauma, or harm, the method cannot detect or respond
5. **Consent verification is required** — if the M49-01 protocol's consent standards require verified understanding, anonymous feedback cannot meet that bar
6. **The community does not trust written/digital systems** — if there is a history of written surveys being used for surveillance, taxation, or persecution, the method will fail
7. **No follow-up mechanism exists** — if ambiguous responses cannot be explored, the data may be misleading
8. **The prompts have not been culturally validated** — if the partner has not reviewed every prompt for cultural appropriateness and local meaning, the method risks misinterpretation
9. **Response rates are too low to be meaningful** — if fewer than a minimum threshold of participants respond, the data is not representative and should not be used for decision-making

### 7.6 Data Profile

| Data Category | Collected by Default? | Justification Required? |
|---------------|----------------------|------------------------|
| Participant identity | NO — anonymous by design | Any attempt to collect identity violates the method's core principle |
| Demographic information | NO — optional, self-reported, aggregated | Only if assessment question demands it and anonymity is preserved |
| Structured responses | YES | Core purpose of the feedback |
| Open-text responses | YES (if included in prompt design) | Core purpose; harder to anonymize if responses are distinctive |
| Timestamp | MAYBE — depends on collection system | Minimize; retain only if necessary for analysis |
| Device/IP information | MAYBE — depends on digital system | Minimize; delete after collection if not needed |
| Location data | NO | Only if assessment question specifically demands it |
| Follow-up contact information | NO | If follow-up is needed, transition to interview method with consent |

---

## 8. Hypothetical Scenario Definition

### 8.1 Scenario Parameters

To ground the method comparison, this document uses a single hypothetical scenario. The scenario is **entirely synthetic** — no real community, organization, or need is represented. The scenario is designed to exercise the key dimensions of the comparison: accessibility, privacy, power, and safeguarding.

**Hypothetical need:** A rural community reports difficulty accessing clean water sources during dry seasons.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Community type** | Rural, mixed agriculture and informal employment | Common humanitarian context |
| **Population** | Approximately 800 people | Small enough for individual methods; large enough for group variation |
| **Geographic context** | Remote, limited transport infrastructure | Tests physical access barriers |
| **Language** | One dominant local language; minority dialect speakers present | Tests language barriers |
| **Power structure** | Traditional leadership council; gender hierarchy present | Tests power imbalance scenarios |
| **Literacy** | Mixed — approximately 60% adult literacy; lower among elderly and women | Tests literacy barriers |
| **Technology access** | Limited mobile phone coverage; no household internet | Tests technology barriers |
| **Disability prevalence** | Unknown; assumed present as in any population | Tests disability access |
| **External organization interest** | A funding organization has heard about the water access issue and wants to verify the need before proposing any intervention | Establishes the assessment context |
| **Partner organization** | A local NGO with community relationships but no prior water-sector expertise | Tests partner capacity constraints |

### 8.2 Scenario Constraints

The scenario imposes these constraints on the method comparison:

1. **The need is already partially defined** — the community has expressed a water access concern; the assessment is to verify and deepen understanding, not to discover the need from scratch
2. **The partner is local but not a water-sector expert** — the partner may need technical support to design appropriate assessment questions
3. **The community has mixed literacy and limited technology** — anonymous feedback methods face significant access barriers
4. **Power hierarchies are present** — traditional leadership and gender dynamics may suppress honest expression in group settings
5. **Physical access is challenging** — the community is remote with limited transport
6. **No prior assessment has been conducted** — this is the first structured engagement on this topic

### 8.3 Scenario Assumptions

The following assumptions underpin the scenario analysis. They are explicitly stated so that the partner reviewer can assess their validity for any real context:

| Assumption | Impact if Wrong |
|------------|-----------------|
| The community's expressed need is genuine and shared | If the expressed need represents only a faction, the assessment must surface other perspectives |
| The local NGO has sufficient community trust to conduct an assessment | If trust is low, no method will work without first building trust |
| The funding organization's interest is transparent and honest | If the community perceives hidden motives, all methods are compromised |
| The water access issue is the primary concern | If other needs are more urgent, the assessment scope is wrong |
| The community has not been over-assessed by other organizations | If assessment fatigue is present, participation will be low regardless of method |
| The traditional leadership structure is representative | If the leadership excludes significant groups, the method must account for this |
| Safety conditions permit assessment activity | If the security context is volatile, no method is appropriate |

### 8.4 Scenario Application to Each Method

**Interview application in this scenario:**
- The partner's assessor conducts individual interviews with community members selected to represent different demographics (men, women, elderly, youth, minority dialect speakers, people with disabilities)
- Interviews take place in private locations within the community
- The assessor uses a question guide focused on water access: current sources, dry-season challenges, coping strategies, and priorities for improvement
- Interviews are conducted in the dominant local language with a dialect interpreter available for minority speakers

**Facilitated group application in this scenario:**
- The partner's facilitator convenes separate group sessions: one for women, one for men, one for youth, one for elders (separate by demographic to reduce power suppression)
- Each session uses participatory tools: community mapping of water sources, seasonal calendar of water availability, priority ranking of challenges
- The facilitator ensures each group's themes are documented separately and that consensus vs. disagreement is recorded
- A plenary session brings group representatives together to compare findings — but only if all groups consent to this step

**Anonymous feedback application in this scenario:**
- The partner distributes pictorial feedback forms through community health workers — forms use images rather than text to accommodate low literacy
- Forms ask structured questions about water access: Which sources do you use? When are they unavailable? What would improve access?
- A collection box is placed in a neutral community location for completed forms
- The partner also provides an oral feedback option — community members can record voice messages on a simple device, collected by a health worker

### 8.5 Scenario Limitations

This hypothetical scenario is a **teaching tool** for the comparison. It does not:

- Represent any real community
- Validate that the water access need is the correct focus
- Prove that any method would work in this context
- Replace the need for partner-led context assessment
- Account for the full complexity of any real humanitarian setting

The partner must validate any locally specific conclusion before applying any method to any real community.

---

## 9. Accessibility Analysis per Method

### 9.1 Accessibility Framework

Accessibility is evaluated across five dimensions, each of which may exclude participants from a given method:

1. **Physical access** — can the participant physically reach and engage with the method?
2. **Sensory access** — can the participant perceive and respond to the method's inputs?
3. **Cognitive access** — can the participant understand and process the method's requirements?
4. **Social access** — does the participant's social context permit engagement with the method?
5. **Technical access** — does the participant have the tools and skills the method requires?

### 9.2 Interview Accessibility Analysis

| Dimension | Access Level | Barrier Description | Mitigation |
|-----------|-------------|---------------------|------------|
| **Physical** | MODERATE | Participant must travel to or host the interview; location must be physically accessible | Home visits for mobility-impaired participants; accessible venue selection; transport assistance |
| **Sensory — hearing** | LOW-MODERATE | Interview relies on verbal communication | Sign language interpreter; written prompts as supplement; note that interpreter introduces a third party |
| **Sensory — vision** | LOW-MODERATE | Verbal format is accessible to blind participants; written consent forms are not | Verbal consent process; audio-described materials; Braille on request |
| **Cognitive** | MODERATE | Semi-structured format requires sustained attention and comprehension | Shorter sessions; simplified language; assessor training in cognitive accessibility; support person present with consent |
| **Social — gender** | LOW-HIGH | In some contexts, women cannot meet privately with a male assessor (or vice versa) | Gender-matched assessors; female assessors for female participants; community permission for cross-gender interaction |
| **Social — status** | MODERATE-HIGH | Lower-status participants may feel unable to refuse or speak honestly to an institutional representative | Peer interviewers; community introduction before individual sessions; explicit decline option |
| **Social — visibility** | LOW-MODERATE | Being seen attending an interview may carry social risk | Discreet scheduling; neutral location; community normalization of the assessment process |
| **Technical** | HIGH | No technology required beyond basic recording (optional) | Paper-based documentation; minimal technical dependency |

**Interview accessibility summary:** The method is moderately accessible for most participants but creates significant barriers for people with mobility impairments (unless home visits are provided), people in contexts where private meetings are socially risky, and people who cannot communicate verbally without support.

### 9.3 Facilitated Group Accessibility Analysis

| Dimension | Access Level | Barrier Description | Mitigation |
|-----------|-------------|---------------------|------------|
| **Physical** | LOW-MODERATE | Group venue must be accessible to all participants; transport to venue is a barrier | Accessible venue; transport assistance; multiple sessions at different locations; home participation option (remote or proxy) |
| **Sensory — hearing** | LOW | Multi-speaker environment is extremely difficult for hearing-impaired participants | Sign language interpreter (limited effectiveness in multi-speaker setting); written summary of discussion; real-time captioning if technology available |
| **Sensory — vision** | MODERATE | Participatory tools (maps, diagrams) may be visual-only | Tactile materials; verbal description of visual elements; audio-based participatory tools |
| **Cognitive** | LOW-MODERATE | Fast-paced, multi-directional discussion is difficult to follow | Structured facilitation with clear turn-taking; visual aids; breaks; small-group breakout before plenary |
| **Social — gender** | LOW-HIGH | Mixed-gender groups may prevent women from speaking in some contexts | Single-gender groups; female facilitator; culturally appropriate seating arrangements |
| **Social — status** | LOW-HIGH | Hierarchical group dynamics suppress honest expression | Separate groups by status; skilled facilitation; anonymous voting within the group; ground rules that protect dissent |
| **Social — personality** | LOW-MODERATE | Introverted or anxious participants may not speak in a group | Small breakout groups; written input options within the group; one-on-one follow-up offered |
| **Technical** | HIGH | No technology required | Paper-based participatory tools; minimal technical dependency |

**Facilitated group accessibility summary:** The method is the **least accessible** of the three for participants with sensory, cognitive, or social barriers. It requires the most facilitator skill to manage inclusion. Separate demographic groups are essential in hierarchical communities but multiply the resource cost.

### 9.4 Anonymous Feedback Accessibility Analysis

| Dimension | Access Level | Barrier Description | Mitigation |
|-----------|-------------|---------------------|------------|
| **Physical** | HIGH | No travel required; participant responds at their own location | Distribution through existing community channels (health workers, markets, places of worship) |
| **Sensory — hearing** | HIGH | No verbal interaction required | Written/pictorial formats are inherently accessible to deaf participants |
| **Sensory — vision** | LOW | Standard print formats exclude blind participants; digital formats may not be screen-reader compatible | Braille versions; audio recording option; large print; screen-reader compatible digital forms |
| **Cognitive** | LOW-MODERATE | Structured prompts require comprehension without assistance | Simplified language; pictorial formats; oral instructions; community health worker assistance (with anonymity preserved) |
| **Social — gender** | HIGH | No interpersonal interaction required; gender norms do not restrict private response | Inherent advantage of the anonymous method |
| **Social — status** | HIGH | No power dynamic with an assessor; status does not affect private response | Inherent advantage of the anonymous method |
| **Social — visibility** | HIGH | Participation is invisible; no one observes the participant responding | Inherent advantage for stigmatized topics |
| **Technical** | LOW | Paper requires literacy; digital requires device and connectivity; audio requires playback device | Multiple format options; community distribution points; assistive technology provision |

**Anonymous feedback accessibility summary:** The method is **physically and socially the most accessible** — no travel, no interpersonal barriers. However, it is **the least accessible for people with literacy, visual, or cognitive impairments** unless deliberate multi-format design is implemented. The method's accessibility depends entirely on the format design.

### 9.5 Comparative Accessibility Matrix

| Participant Profile | Interview | Facilitated Group | Anonymous Feedback |
|---------------------|-----------|-------------------|-------------------|
| Mobility impairment (can communicate) | ACCESSIBLE with home visit | BARRIER without accessible venue | ACCESSIBLE with distribution |
| Hearing impairment | MODERATE with interpreter | HIGH BARRIER in group setting | ACCESSIBLE (written/pictorial) |
| Visual impairment | ACCESSIBLE (verbal format) | MODERATE with accommodation | HIGH BARRIER without Braille/audio |
| Cognitive impairment | MODERATE with support | HIGH BARRIER in group pace | MODERATE with simplified format |
| Social anxiety | MODERATE (one-on-one pressure) | HIGH BARRIER (group pressure) | ACCESSIBLE (no interpersonal) |
| Low literacy | ACCESSIBLE (verbal) | ACCESSIBLE (verbal discussion) | HIGH BARRIER without pictorial/audio |
| No technology access | ACCESSIBLE | ACCESSIBLE | HIGH BARRIER without paper option |
| Gender-restricted context | MODERATE with gender matching | HIGH BARRIER without single-gender groups | ACCESSIBLE |
| Low social status | MODERATE with peer assessor | HIGH BARRIER in mixed-status group | ACCESSIBLE |
| Stigmatized view/identity | MODERATE (assessor may judge) | HIGH BARRIER (group may judge) | ACCESSIBLE (anonymous) |

---

## 10. Privacy Risk Scoring per Method

### 10.1 Privacy Risk Framework

Privacy risk is evaluated across five dimensions:

1. **Identity exposure** — how much personally identifiable information does the method collect or reveal?
2. **Response exposure** — who can hear or see the participant's responses?
3. **Data storage risk** — how is the collected data stored, and what is the breach risk?
4. **Secondary use risk** — could the data be used for purposes beyond the assessment?
5. **Retaliation risk** — could the participant face consequences for their participation or responses?

Each dimension is scored LOW, MODERATE, or HIGH.

### 10.2 Interview Privacy Risk Score

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Identity exposure** | MODERATE | The assessor knows who the participant is; consent forms may include names; names are not required by default but the interaction reveals identity |
| **Response exposure** | LOW | Only the assessor hears the responses; private setting minimizes exposure |
| **Data storage risk** | MODERATE | Notes, recordings, and consent forms create data artifacts that must be stored securely; breach of these artifacts exposes individual responses |
| **Secondary use risk** | MODERATE | Assessment data could be shared with the funding organization, donors, or other programs; consent must specify use limitations |
| **Retaliation risk** | MODERATE | If participation is observed (being seen entering the interview location), the participant may face social consequences; responses themselves are private but participation may not be |

**Overall privacy risk: MODERATE**

The interview method has a manageable privacy profile when the assessor maintains confidentiality and data handling follows M49-01 provisions. The primary risk is that participation itself may be observable.

### 10.3 Facilitated Group Privacy Risk Score

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Identity exposure** | MODERATE-HIGH | Other group members see who is participating; the facilitator may know names; group dynamics reveal identities |
| **Response exposure** | HIGH | Responses are made in front of other group members; even with confidentiality ground rules, participants cannot control what others remember or repeat |
| **Data storage risk** | MODERATE | Facilitator notes and participatory tool outputs are stored; group-level data is less individually identifying than interview data, but individual contributions within the group may be memorable |
| **Secondary use risk** | MODERATE | Group findings may be shared more broadly; individual contributions within the group context are harder to anonymize in reporting |
| **Retaliation risk** | HIGH | Participants who express dissenting views in a group may face consequences from other group members or community leaders; the group setting makes dissent visible |

**Overall privacy risk: HIGH**

The facilitated group method has the **highest privacy risk** of the three methods. The group setting inherently exposes participants to each other, and confidentiality cannot be guaranteed once information leaves the room. This risk is amplified when the group includes people with conflicting interests or power imbalances.

### 10.4 Anonymous Feedback Privacy Risk Score

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Identity exposure** | LOW | By design, no identifying information is collected; the method is anonymous |
| **Response exposure** | LOW | No one sees the response as it is made; responses are collected privately |
| **Data storage risk** | LOW-MODERATE | Aggregated data has minimal individual risk; however, small sample sizes or distinctive responses could enable re-identification |
| **Secondary use risk** | LOW | Anonymous data has limited secondary use potential; however, aggregated findings could be used to justify decisions that affect the community |
| **Retaliation risk** | LOW | Anonymity protects against retaliation for specific responses; however, if the community knows an assessment occurred, participation itself may be inferred |

**Overall privacy risk: LOW**

The anonymous feedback method has the **lowest privacy risk** of the three methods. The primary vulnerability is re-identification through small sample sizes or distinctive response patterns, and the limitation that anonymity prevents follow-up or verification.

### 10.5 Comparative Privacy Risk Matrix

| Risk Dimension | Interview | Facilitated Group | Anonymous Feedback |
|----------------|-----------|-------------------|-------------------|
| Identity exposure | MODERATE | MODERATE-HIGH | LOW |
| Response exposure | LOW | HIGH | LOW |
| Data storage risk | MODERATE | MODERATE | LOW-MODERATE |
| Secondary use risk | MODERATE | MODERATE | LOW |
| Retaliation risk | MODERATE | HIGH | LOW |
| **Overall** | **MODERATE** | **HIGH** | **LOW** |

### 10.6 Privacy Risk Mitigations

**Interview mitigations:**
- Use participant codes instead of names in documentation
- Conduct interviews in discreet locations
- Store all data artifacts in encrypted, access-controlled storage
- Obtain explicit consent for any data sharing beyond the assessment
- Destroy identifying data as soon as it is no longer needed

**Facilitated group mitigations:**
- Establish and enforce confidentiality ground rules
- Do not record individual attributions within group discussions
- Use separate demographic groups to reduce cross-group exposure
- Offer individual follow-up for sensitive disclosures
- Document group-level themes only; do not attribute views to individuals
- Remind participants that they cannot control what others remember

**Anonymous feedback mitigations:**
- Do not collect any identifying metadata (timestamps, device IDs, IP addresses)
- Use large enough distribution to prevent re-identification from small samples
- Aggregate responses before analysis; do not examine individual responses for distinctive content
- Do not attempt to follow up with individual respondents
- Destroy raw response data after aggregation
- Ensure collection points are neutral and do not reveal who has or has not participated

---

## 11. Data Necessity Analysis

### 11.1 Purpose of Data Necessity Analysis

The M49-01 protocol establishes data minimization as a hard constraint: collect only what the assessment strictly requires. This section applies that principle to each method, distinguishing between **necessary data** (without which the assessment cannot answer its question) and **optional data** (which may enhance the assessment but is not required).

### 11.2 Necessary Data for the Assessment Question

Regardless of method, the assessment must answer: "Is there a specific, documented, partner-validated unmet need related to [the defined topic]?"

**Necessary data categories:**

| Data Category | Purpose | Method-Specific Collection Notes |
|---------------|---------|----------------------------------|
| **Need description** | What is the unmet need as expressed by the community? | Interview: verbal description; Group: collective description; Anonymous: structured response |
| **Need scope** | How widespread is the need? How many people are affected? | Interview: participant's perception; Group: collective estimate; Anonymous: individual estimate aggregated |
| **Current coping strategies** | How does the community currently address the need? | Interview: individual account; Group: shared account; Anonymous: individual account |
| **Priority ranking** | How does this need rank relative to other community concerns? | Interview: individual ranking; Group: collective ranking exercise; Anonymous: individual ranking |
| **Community willingness to participate** | Does the community want external support for this need? | Interview: individual response; Group: collective response; Anonymous: individual response |

### 11.3 Optional Data Categories

The following data categories are **not necessary** for the assessment question and should not be collected by default:

| Data Category | Why It Is Optional | When It Might Be Justified |
|---------------|-------------------|---------------------------|
| **Individual names** | Assessment is about community need, not individual identification | Only if follow-up is planned and consented |
| **Household addresses** | Not needed for community-level assessment | Only if geographic mapping of need is essential and consented |
| **Demographic details (age, gender, ethnicity, religion)** | Community-level assessment does not require individual demographics | Only if the assessment question specifically requires disaggregated analysis and consent is obtained |
| **Income or financial information** | Not needed to establish whether a need exists | Only if economic assessment is part of the defined scope |
| **Health information** | Not within the assessment's scope | Only if health is the defined need and collection is justified |
| **Political opinions** | Not within the assessment's scope | Not justifiable within this protocol |
| **Photographs or video** | Not needed for needs assessment | Only with explicit separate consent and specific justification |
| **Audio recordings** | Not needed if notes are sufficient | Only with explicit separate consent |
| **GPS coordinates** | Not needed for community-level assessment | Only if geographic mapping is essential |
| **National identification numbers** | Never needed for needs assessment | Not justifiable within this protocol |

### 11.4 Data Collection Comparison by Method

| Data Element | Interview | Facilitated Group | Anonymous Feedback |
|--------------|-----------|-------------------|-------------------|
| Need description (verbatim) | YES — assessor notes | PARTIAL — facilitator notes group themes | PARTIAL — structured responses only |
| Need scope (estimate) | Individual perception | Collective estimate | Aggregated individual estimates |
| Coping strategies | Individual account | Shared account with peer validation | Individual account |
| Priority ranking | Individual ranking | Group ranking exercise | Individual ranking aggregated |
| Community willingness | Individual response | Group consensus + individual variation | Individual response aggregated |
| Non-verbal cues | YES — assessor observes | YES — facilitator observes | NO — no observation possible |
| Demographic data | Only if justified and consented | Only if justified and group-consented | Only if self-reported and anonymous |
| Identifying information | Minimized by default | Minimized by default | Anonymous by design |

### 11.5 Data Minimization Rules

These rules apply regardless of method:

1. **Default to anonymous** — collect no identifying information unless specifically justified
2. **Justify each data element** — before collecting any data, the partner must document why it is necessary for the assessment question
3. **Minimize granularity** — collect community-level data, not individual-level data, wherever possible
4. **Destroy when no longer needed** — raw data is destroyed after aggregation and analysis; only aggregated findings are retained
5. **Never collect what you do not need** — if a data element is "nice to have" but not necessary, do not collect it
6. **Consent governs collection** — even necessary data cannot be collected without participant consent
7. **Safeguarding overrides collection** — if collecting a data element creates a safeguarding risk, do not collect it

---

## 12. Safe Alternatives Identification

### 12.1 Purpose

When a primary method is inappropriate for a community context or participant group, safe alternatives must be available. This section identifies alternatives for each method's common failure modes.

### 12.2 Interview Alternatives

| When Interview Fails | Safe Alternative | Notes |
|---------------------|------------------|-------|
| Participant cannot meet privately | Telephone or video interview | Reduces physical privacy but maintains one-on-one format; ensure call privacy |
| Participant is intimidated by institutional assessor | Peer interviewer | A community member trained as interviewer reduces power imbalance; ensure peer interviewer has safeguarding support |
| Participant has mobility impairment | Home visit | Assessor travels to participant; ensures physical accessibility; may reduce privacy if home is shared |
| Participant has hearing impairment | Written interview with assessor present | Participant reads questions and writes responses; assessor is present for clarification; ensure written format is accessible |
| Participant speaks a different language | Interpreter-mediated interview | Interpreter is bound by confidentiality; ensure interpreter is trusted by participant; note that interpreter is a third party |
| Participant has social anxiety | Shorter sessions with breaks | Reduce session length; allow participant to control pace; offer multiple shorter sessions instead of one long session |
| Participant fears being seen attending | Neutral location with discreet scheduling | Use a community location that does not signal "assessment"; schedule at varied times |
| No trained assessor is available | Structured self-interview with partner follow-up | Participant completes a written interview guide; partner reviews and follows up if needed; consent process must be documented |

### 12.3 Facilitated Group Alternatives

| When Group Fails | Safe Alternative | Notes |
|------------------|------------------|-------|
| Power hierarchy prevents honest expression | Separate demographic groups | Conduct separate sessions for women, men, youth, elders; synthesize findings afterward |
| Topic is too sensitive for group discussion | Transition to individual interviews | Offer private one-on-one sessions for sensitive topics; group method is not appropriate |
| Group size exceeds facilitator capacity | Split into smaller groups | Use breakout groups of 4–6 with separate facilitators; reconvene for plenary if appropriate |
| Participants cannot attend at the same time | Asynchronous group input | Collect individual inputs that are shared (anonymously) with the group for collective analysis |
| Cultural norms prevent mixed-group discussion | Single-gender or single-age groups | Respect cultural norms while ensuring all groups have a voice; use same-method facilitators |
| No skilled facilitator is available | Structured group activity without facilitation | Use a highly structured participatory tool (e.g., community mapping) that guides the process; ensure a safeguarding-trained observer is present |
| Group dynamics produce false consensus | Anonymous voting within the group | Use secret ballot or anonymous ranking to surface genuine individual views within the group setting |
| Retaliation risk from dissenting views | Individual follow-up after group session | Offer private debrief for any participant who wants to express a different view from the group |

### 12.4 Anonymous Feedback Alternatives

| When Anonymous Feedback Fails | Safe Alternative | Notes |
|-------------------------------|------------------|-------|
| Target population has low literacy | Pictorial or oral feedback | Use images, symbols, or audio recordings instead of written text; validate pictorial format with community members before distribution |
| No technology access | Paper-based distribution | Use physical collection points; ensure paper forms are available in multiple locations and at multiple times |
| Prompts are culturally misunderstood | Community-validated prompt design | Partner reviews all prompts with community members before distribution; translate into local languages and dialects |
| Response rate is too low | Incentivize participation (carefully) | Provide a small, non-coercive token of appreciation; ensure the incentive does not create pressure to participate |
| Anonymity cannot be technically guaranteed | Transition to confidential interview | If anonymity is compromised, switch to interview method with explicit confidentiality protections |
| Feedback is ambiguous and cannot be followed up | Offer optional follow-up mechanism | Provide a way for respondents to identify themselves if they want to elaborate; this is opt-in and does not compromise anonymity for those who decline |
| Sensory impairment prevents access | Multi-format distribution | Provide Braille, large print, audio, and simple-language versions; ensure collection points are physically accessible |
| Community distrusts written systems | Oral community messenger | Use a trusted community figure to verbally communicate the feedback questions and collect verbal responses anonymously |

### 12.5 Cross-Method Alternatives

When no single method is appropriate, combinations may work:

| Combination | When to Use | How It Works |
|-------------|-------------|--------------|
| **Interview + Anonymous** | Community has mixed literacy and power dynamics | Use anonymous feedback for the broad community; follow up with interviews for those who want to elaborate |
| **Group + Interview** | Community benefits from collective discussion but has sensitive subtopics | Use facilitated group for general themes; offer individual interviews for sensitive topics |
| **Group + Anonymous** | Community has dominant voices but also needs collective validation | Use facilitated group for discussion; use anonymous voting for priority ranking |
| **All three (sequential)** | Comprehensive assessment with diverse community | Start with anonymous feedback for broad input; use group discussion for theme validation; use interviews for depth on specific issues |

### 12.6 When No Method Is Safe

There are contexts where **no assessment method is appropriate**:

1. **Active conflict or insecurity** — physical safety cannot be guaranteed
2. **Community has not granted permission** — any assessment would be imposed
3. **No qualified partner exists** — the M49-01 partner qualification criteria are not met
4. **Community is experiencing acute crisis** — immediate survival needs take priority over assessment
5. **Assessment fatigue** — the community has been over-assessed and participation would be coerced by exhaustion
6. **The funder's presence is the problem** — if the community perceives the assessment as a prelude to unwanted intervention

In these cases, the correct decision is to **not assess**. The M49-01 protocol's no-go outcome applies: "No specific unmet need was identified" or "The assessment was incomplete and should not be used for decision-making."

---

## 13. Power Imbalance Scenarios (Tabletop Exercise)

### 13.1 Exercise Purpose

This tabletop exercise examines how power imbalances affect each method. Power imbalances exist in every community and every assessment context. The question is not whether power dynamics exist but whether the method can manage them without causing harm or producing distorted data.

### 13.2 Scenario A: Traditional Leader Dominance

**Setup:** The community has a traditional leader (Chief, Elder, or Council) whose authority is unquestioned. The leader is present during the assessment activity.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant knows the leader may ask what they said; self-censors or reports what they think the leader wants to hear | HIGH — data is distorted; participant is not speaking freely | Interview must not occur in the leader's presence or knowledge; scheduling must be discreet |
| **Facilitated Group** | Leader speaks first and at length; other participants agree with the leader's stated priorities; dissenting views are suppressed | HIGH — group produces a leader-approved narrative, not genuine community input | Leader must not be in the group; separate group without the leader is essential; or the leader's participation is limited to an opening welcome only |
| **Anonymous Feedback** | Participant responds privately without the leader's knowledge; responses reflect genuine individual views | LOW-MODERATE — anonymity protects the individual; however, if the leader learns that anonymous feedback was collected, they may attempt to control the process | Anonymous method is the safest option in this scenario; distribution must be discreet |

**Finding:** When traditional authority is dominant, anonymous feedback is the safest method. Interview and group methods require deliberate steps to remove the authority figure's influence.

### 13.3 Scenario B: Funder-Recipient Power Dynamic

**Setup:** The funding organization's representative is known to the community. Participants believe that their responses will affect whether the organization provides assistance.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant tells the assessor what they think the funder wants to hear; overstates need to attract resources or understates need to appear self-sufficient | HIGH — data reflects strategic behavior, not genuine need | The funder's representative must not be the assessor; the partner organization conducts the interview independently |
| **Facilitated Group** | Group performs for the funder; presents a unified, strategically favorable picture; internal disagreements are hidden | HIGH — group produces a performance, not an assessment | The funder's representative must not be present; the partner facilitates independently; group should not know the funder's identity |
| **Anonymous Feedback** | Participant responds without the funder's knowledge; responses are more likely to reflect genuine views | MODERATE — anonymity reduces strategic behavior; however, if participants believe the funder will read the responses, they may still self-censor | The funder must have no visible role in the feedback collection; the partner manages the process entirely |

**Finding:** The funder must be invisible in all methods. The partner organization conducts the assessment independently. If the community believes the funder is directly involved, all methods are compromised.

### 13.4 Scenario C: Gender Power Imbalance

**Setup:** In the community, men hold decision-making authority and women's views are not traditionally sought in public.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Female participant may not be permitted to speak with a male assessor; if permitted, may not speak freely about needs that men control | MODERATE-HIGH — gender matching and private setting are essential | Female assessors for female participants; male assessors for male participants; separate sessions by gender |
| **Facilitated Group** | Mixed-gender group silences women; women do not speak or repeat their husbands' views | HIGH — women's needs are invisible in a mixed group | Single-gender groups are essential; female facilitator for female group; separate findings by gender |
| **Anonymous Feedback** | Women can respond privately without male authority present; however, if literacy is gendered (lower for women), the method may only capture men's views | MODERATE — anonymity helps but literacy gap may exclude women | Pictorial or oral formats bypass literacy gap; distribution must reach women specifically (through female health workers, women's groups, etc.) |

**Finding:** Gender power imbalances require gender-separated methods for interview and group approaches. Anonymous feedback is helpful only if the format reaches women — literacy barriers may otherwise reproduce the exclusion.

### 13.5 Scenario D: Assessor-Participant Authority Gap

**Setup:** The assessor is perceived as highly educated, urban, and connected to external institutions. The participant is rural, has limited formal education, and distrusts outsiders.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant defers to the assessor's expertise; agrees with questions rather than providing genuine views; may say what they think the educated person wants to hear | HIGH — data reflects deference, not genuine need | Peer assessors from the community reduce the gap; assessor training in humility and active listening; extended relationship-building before the interview |
| **Facilitated Group** | Participant defers to the facilitator's authority; does not challenge the facilitator's framing of issues; group follows the facilitator's lead | HIGH — group produces facilitator-influenced data | Community co-facilitator bridges the gap; facilitator explicitly invites challenge and dissent; use of participatory tools that give everyone an equal voice |
| **Anonymous Feedback** | Participant responds without the authority figure present; responses may be more genuine | LOW-MODERATE — anonymity reduces authority pressure; however, if the participant distrusts the system itself, they may not participate at all | Trust-building before distribution; community messenger introduces the feedback process; ensure the format is accessible and non-threatening |

**Finding:** The authority gap affects all methods but is most manageable in anonymous feedback. For interview and group methods, using community co-assessors or co-facilitators is essential.

### 13.6 Power Imbalance Summary

| Scenario | Safest Method | Riskiest Method | Key Mitigation |
|----------|--------------|-----------------|----------------|
| Traditional leader dominance | Anonymous feedback | Facilitated group (with leader present) | Remove authority figure from all methods |
| Funder-recipient dynamic | Anonymous feedback (if funder invisible) | All methods (if funder visible) | Funder must be invisible in all methods |
| Gender power imbalance | Anonymous feedback (with accessible format) | Facilitated group (mixed gender) | Gender-separated methods; accessible formats |
| Assessor-participant authority gap | Anonymous feedback | Interview (without peer assessor) | Community co-assessors; anonymity |

---

## 14. Disability Access Scenarios (Tabletop Exercise)

### 14.1 Exercise Purpose

This tabletop exercise examines how disability affects access to each method. Disability is diverse — physical, sensory, cognitive, and psychosocial disabilities each create different barriers. The exercise assumes disability is present in the community (as it is in every community) and tests whether each method can accommodate it.

### 14.2 Scenario E: Mobility Impairment

**Setup:** A community member uses a wheelchair or has limited mobility. Assessment activities are planned at the community center, which has steps at the entrance.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant cannot access the community center; is excluded unless the assessor travels to their home | MODERATE — exclusion is preventable with home visits | Home visits must be offered as a standard option, not an afterthought; ensure the home environment provides privacy |
| **Facilitated Group** | Participant cannot access the group venue; is excluded unless the venue is accessible or the group meets at their location | HIGH — group method inherently requires physical presence; exclusion is likely without deliberate accommodation | Accessible venue selection is essential; if no accessible venue exists, the group method excludes this participant; offer individual follow-up |
| **Anonymous Feedback** | Participant can respond from home; no physical access barrier | LOW — the method is inherently accessible for mobility impairments | Distribution must reach the participant (delivery by community health worker, neighbor, or family member); ensure the response format is physically manageable (large buttons, easy-to-mark forms) |

**Finding:** Anonymous feedback is the most accessible method for mobility impairments. Interview is accessible with home visits. Facilitated group is the least accessible unless the venue is deliberately chosen for accessibility.

### 14.3 Scenario F: Hearing Impairment

**Setup:** A community member is deaf or hard of hearing. The community's primary language is oral; sign language interpretation is not routinely available.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant cannot hear the assessor's questions; communication requires sign language interpreter, written exchange, or other accommodation | MODERATE-HIGH — the interview is possible with accommodation but the interpreter introduces a third party | Written interview format (if participant is literate); sign language interpreter (bound by confidentiality); ensure the participant consents to the interpreter's presence |
| **Facilitated Group** | Participant cannot follow multi-speaker discussion; even with an interpreter, the speed and overlap of group conversation is difficult to track | HIGH — the group method is extremely difficult to make accessible for deaf participants | Written real-time summary (if literacy permits); dedicated interpreter (limited effectiveness); consider whether the group method is appropriate at all for this participant; offer individual alternative |
| **Anonymous Feedback** | Participant reads written prompts and responds in writing; no verbal interaction required | LOW — the method is inherently accessible for deaf participants who are literate | Ensure written format is clear and simple; provide pictorial alternative for non-literate participants; ensure collection point is accessible |

**Finding:** Anonymous feedback is the most accessible method for deaf participants (assuming literacy). Interview is accessible with accommodation. Facilitated group is the least accessible and may need to be replaced by an individual alternative.

### 14.4 Scenario G: Visual Impairment

**Setup:** A community member is blind or has low vision. Assessment materials are printed in standard format.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Verbal format is inherently accessible; the participant can hear questions and respond orally | LOW — the interview method works well for blind participants | Ensure consent form is read aloud and verbally confirmed; ensure any visual aids are described verbally; Braille materials available on request |
| **Facilitated Group** | Verbal discussion is accessible; however, participatory tools (maps, diagrams, ranking cards) are visual and exclude the participant | MODERATE — the discussion component is accessible but the participatory tools are not | Provide tactile or verbal alternatives for participatory tools; ensure the facilitator describes all visual materials; assign a buddy to assist with visual tasks |
| **Anonymous Feedback** | Written format is inaccessible; digital format may be inaccessible if not screen-reader compatible | HIGH — the method excludes blind participants unless alternative formats are provided | Braille versions; audio recording option (participant dictates response); screen-reader compatible digital format; large print for low-vision participants |

**Finding:** Interview is the most accessible method for blind participants. Facilitated group is accessible for the discussion component but requires accommodation for visual tools. Anonymous feedback requires deliberate multi-format design to be accessible.

### 14.5 Scenario H: Cognitive or Psychosocial Disability

**Setup:** A community member has a cognitive disability (e.g., intellectual disability, dementia, traumatic brain injury) or a psychosocial disability (e.g., PTSD, severe anxiety, schizophrenia).

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Semi-structured format requires sustained attention, comprehension, and verbal expression; the participant may struggle with open-ended questions | MODERATE-HIGH — the method can work with significant accommodation but requires assessor training | Shorter sessions; simplified language; concrete questions; support person present with consent; assessor trained in cognitive accessibility; watch for distress and stop if needed |
| **Facilitated Group** | Fast-paced, multi-directional discussion is overwhelming; the participant may not be able to follow or contribute | HIGH — the group method is extremely difficult to make accessible for cognitive disabilities | Small breakout groups; structured activities with clear instructions; buddy support; ensure the participant can leave at any time; consider whether the group method is appropriate |
| **Anonymous Feedback** | Self-paced format is an advantage; however, complex prompts may be incomprehensible | MODERATE — the method can work with simplified format design | Simplified language; pictorial prompts; oral response option; allow extra time; ensure the participant understands that the response is anonymous and voluntary |

**Finding:** No method is fully accessible without deliberate accommodation for cognitive or psychosocial disabilities. Interview with a trained assessor is the most adaptable. Anonymous feedback with simplified format is the least demanding. Facilitated group is the most challenging and may need to be replaced by individual alternatives.

### 14.6 Disability Access Summary

| Disability Type | Most Accessible Method | Least Accessible Method | Essential Accommodation |
|-----------------|----------------------|------------------------|------------------------|
| Mobility impairment | Anonymous feedback | Facilitated group | Home visits; accessible venues; delivery of feedback forms |
| Hearing impairment | Anonymous feedback (written) | Facilitated group | Sign language interpreter; written formats; visual aids described |
| Visual impairment | Interview (verbal) | Anonymous feedback (written) | Braille; audio; tactile tools; verbal description |
| Cognitive disability | Interview (adapted) | Facilitated group | Simplified format; support person; shorter sessions; buddy system |
| Psychosocial disability | Anonymous feedback (self-paced) | Facilitated group | Safe environment; opt-out rights; simplified format; mental health support available |

---

## 15. Language Barrier Scenarios (Tabletop Exercise)

### 15.1 Exercise Purpose

This tabletop exercise examines how language barriers affect each method. Language barriers include: different spoken languages, different dialects, low literacy in any language, technical jargon, and cultural differences in communication style.

### 15.2 Scenario I: Minority Dialect Speakers

**Setup:** The community's dominant language is Language A. A minority group (approximately 15% of the community) speaks Language B, a dialect or distinct language. The partner's assessors speak Language A but not Language B.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant cannot communicate directly with the assessor; an interpreter is required | MODERATE-HIGH — the interpreter is a third party who may be known to the participant, reducing privacy; the interpreter may not translate accurately | Interpreter must be trusted by the participant; interpreter must be bound by confidentiality; assessor must verify translation accuracy; consider whether a Language B-speaking assessor is available |
| **Facilitated Group** | Group discussion occurs in Language A; minority dialect speakers cannot follow or contribute | HIGH — the method excludes the minority group entirely; their needs are invisible | Separate group sessions in Language B with a Language B-speaking facilitator; ensure the minority group's findings are integrated into the overall assessment; do not treat the minority group as an afterthought |
| **Anonymous Feedback** | Written prompts are in Language A; minority dialect speakers cannot read them | HIGH — the method excludes non-literate-in-Language-A participants | Translate all prompts into Language B; provide oral versions in Language B; ensure the translation is culturally validated, not just linguistically accurate; distribute through Language B community channels |

**Finding:** Language barriers can completely exclude minority groups from all methods. The solution is not a single method but deliberate multilingual design across all methods. The partner must invest in translation and cultural validation before any method is used.

### 15.3 Scenario J: Low Literacy in All Languages

**Setup:** The community has significant oral tradition and low literacy rates (approximately 40% of adults are fully literate; another 30% have basic literacy; 30% are non-literate).

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Verbal format is accessible regardless of literacy level | LOW — the interview method works for non-literate participants | Ensure the assessor is comfortable with oral communication; do not require the participant to read or write anything; consent process must be verbal |
| **Facilitated Group** | Verbal discussion is accessible; participatory tools may require literacy | LOW-MODERATE — the discussion component works; visual tools may exclude non-literate participants | Use oral participatory tools (storytelling, song, drama); ensure visual tools are explained verbally; do not require written input from group members |
| **Anonymous Feedback** | Written format excludes 70% of the community (non-literate + basic literacy) | HIGH — the method systematically excludes the majority | Pictorial feedback forms; oral recording option; community messenger who verbally asks questions and records answers; ensure the anonymous principle is preserved even with oral collection |

**Finding:** Interview and facilitated group methods are inherently more accessible for low-literacy communities because they are verbal. Anonymous feedback requires deliberate non-written format design to be accessible.

### 15.4 Scenario K: Technical Jargon Mismatch

**Setup:** The assessment questions use technical terms (e.g., "water security," "sanitation infrastructure," "seasonal variability") that are not part of the community's everyday vocabulary.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Assessor can rephrase questions in everyday language; participant can ask for clarification | LOW — the method adapts to the participant's language | Assessor training includes plain language techniques; questions are pre-tested with community members for comprehension; assessor checks understanding during the interview |
| **Facilitated Group** | Facilitator can rephrase; other group members can help explain; but some participants may not understand and not ask | MODERATE — the method partially adapts; those who do not understand may stay silent | Facilitator uses plain language from the start; participatory tools use community-generated terminology; ensure the group checks understanding collectively; create a safe environment for asking "What does that mean?" |
| **Anonymous Feedback** | Prompts are fixed; participant cannot ask for clarification; misunderstanding is invisible | HIGH — the method cannot adapt to the participant's language; responses may reflect misunderstanding, not genuine views | All prompts are pre-tested with community members for comprehension; use everyday language; avoid technical terms entirely; provide examples in the community's context; pictorial prompts reduce language dependency |

**Finding:** Interview is the most adaptable method for jargon barriers. Anonymous feedback is the least adaptable — prompts must be pre-validated for comprehension. The partner must invest in plain-language design for all methods.

### 15.5 Language Barrier Summary

| Barrier Type | Most Accessible Method | Least Accessible Method | Essential Accommodation |
|--------------|----------------------|------------------------|------------------------|
| Minority dialect | Interview (with interpreter) | All methods without translation | Multilingual assessors; translated materials; cultural validation |
| Low literacy | Interview (verbal) | Anonymous feedback (written) | Oral formats; pictorial tools; community messengers |
| Technical jargon | Interview (adaptive) | Anonymous feedback (fixed prompts) | Plain language design; pre-testing; community terminology |
| Non-verbal communication style | Interview (with cultural broker) | Facilitated group (verbal-dominant) | Cultural broker; visual and participatory tools; respect for silence |

---

## 16. Unsafe Disclosure Scenarios (Tabletop Exercise)

### 16.1 Exercise Purpose

This tabletop exercise examines how each method handles the risk that a participant discloses information that puts them at risk — either immediately (e.g., abuse, exploitation, imminent harm) or subsequently (e.g., retaliation for participating, stigma from disclosure).

### 16.2 Scenario L: Disclosure of Abuse or Exploitation

**Setup:** During the assessment, a participant discloses that they or a family member has experienced abuse, exploitation, or violence. The disclosure may be related to the assessment topic or unrelated.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Assessor hears the disclosure directly; can respond immediately with care and referral | LOW-MODERATE — the method enables real-time safeguarding response; however, the assessor must be trained to respond appropriately | Assessor follows the M49-01 safeguarding protocol: stop the assessment, ensure participant safety, provide referral information, document the disclosure, report through the safeguarding escalation pathway; the assessor must not investigate the disclosure |
| **Facilitated Group** | Participant discloses in front of other group members; the disclosure is now known to the group; the participant cannot control who knows | HIGH — the group setting means the disclosure is public within the group; the participant may face stigma, retaliation, or further harm | Facilitator must intervene immediately: pause the discussion, check on the participant's safety, offer individual follow-up; the group's confidentiality obligation is reinforced; however, the disclosure cannot be un-heard; the facilitator must document and report |
| **Anonymous Feedback** | Participant discloses anonymously; the disclosure is known only to the data collector; the participant's identity may or may not be known | MODERATE — the method protects the participant from group exposure; however, the safeguarding response is limited because the participant cannot be contacted | If the disclosure includes contact information, the partner can follow up; if fully anonymous, the partner can only document the disclosure and ensure referral services are available through the general community; the disclosure must be documented and reported through the safeguarding pathway |

**Finding:** Interview is the safest method for responding to abuse disclosures because it enables real-time safeguarding action. Facilitated group is the riskiest because the disclosure is public within the group. Anonymous feedback protects identity but limits response capability.

### 16.3 Scenario M: Disclosure That Triggers Legal or Social Consequences

**Setup:** A participant discloses information that is legal but stigmatized in the community context (e.g., receiving remittances from abroad, belonging to a minority group, holding a particular political view). The disclosure could result in social exclusion, economic disadvantage, or legal attention.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Assessor learns the information; must keep it confidential; the participant trusts the assessor with sensitive information | MODERATE — the risk depends on the assessor's trustworthiness and the security of the data; if the assessor is from the community, the participant may fear gossip | Assessor must be trained in confidentiality; data must be stored securely; the participant must be informed of the limits of confidentiality (e.g., mandatory reporting obligations); consider whether an external assessor is safer |
| **Facilitated Group** | Other group members learn the information; the participant has no control over what the group does with it | HIGH — the group setting means the information is public; other participants may gossip, discriminate, or report the disclosure to authorities | The method is inappropriate for topics that carry social or legal risk if disclosed; do not use group discussion for stigmatized topics; offer individual alternatives |
| **Anonymous Feedback** | No one learns the participant's identity or specific response; the information is aggregated | LOW — the method protects the participant from individual exposure | Ensure the aggregation is robust enough that individual responses cannot be identified; do not report findings in a way that reveals the stigmatized group's size or characteristics |

**Finding:** Anonymous feedback is the safest method for stigmatized disclosures. Facilitated group is the riskiest and should not be used for topics that carry social or legal consequences. Interview is intermediate — the risk depends on the assessor's trustworthiness and data security.

### 16.4 Scenario N: Participant Is Observed Participating

**Setup:** In the community, being seen meeting with an external organization is itself risky. Participants may be suspected of collaborating with outsiders, informing, or receiving special treatment.

| Method | What Happens | Risk | Outcome |
|--------|-------------|------|---------|
| **Interview** | Participant is seen entering or leaving the interview location; community members may ask what they discussed | HIGH — participation is visible; the participant cannot deny involvement | Conduct interviews in discreet locations; vary the timing; use a cover story if the community has agreed (e.g., "health check-in"); ensure the participant has a plausible explanation for the meeting |
| **Facilitated Group** | Multiple participants are seen gathering; the group activity is visible to the community | HIGH — the group's existence is public knowledge; participants cannot deny involvement | The group must have a plausible cover purpose (e.g., "community meeting"); the facilitator must not reveal the assessment topic to non-participants; ensure participants can leave without being observed |
| **Anonymous Feedback** | Participation is invisible; no one observes the participant responding | LOW — the method protects participation itself | Ensure distribution channels do not reveal who has or has not participated; collection points must be neutral; do not track who has responded |

**Finding:** Anonymous feedback is the safest method when participation itself is risky. Interview and group methods require deliberate discretion measures.

### 16.5 Unsafe Disclosure Summary

| Disclosure Type | Safest Method | Riskiest Method | Key Protection |
|----------------|--------------|-----------------|----------------|
| Abuse or exploitation | Interview (real-time response) | Facilitated group (public exposure) | Immediate safeguarding response; confidential referral |
| Stigmatized information | Anonymous feedback | Facilitated group (group knows) | Anonymity; aggregated reporting |
| Participation observation risk | Anonymous feedback | Facilitated group (visible gathering) | Discreet distribution; invisible participation |
| Retaliation for views expressed | Anonymous feedback | Facilitated group (views are public) | Anonymity; no individual attribution |

---

## 17. Cultural Misapplication Risks

### 17.1 The Core Risk

All three methods described in this document originate from Western social science research traditions. They carry embedded assumptions about:

- The appropriateness of asking strangers questions about their needs
- The value of individual opinion over collective consensus
- The legitimacy of written or recorded data as evidence
- The neutrality of the assessor-facilitator role
- The separability of "assessment" from "relationship"

These assumptions may not hold in every cultural context. Applying a method without cultural adaptation risks:

- **Misinterpretation** — the community understands the method differently from the assessor's intent
- **Offense** — the method violates cultural norms (e.g., asking elders to rank priorities, asking women to speak in mixed company)
- **Extraction** — the method takes information without giving anything back, reinforcing colonial research patterns
- **Distortion** — the method produces data that reflects cultural performance rather than genuine need
- **Harm** — the method damages community relationships, trust, or social cohesion

### 17.2 Cultural Risk Factors by Method

| Cultural Factor | Interview Risk | Group Risk | Anonymous Feedback Risk |
|----------------|---------------|------------|------------------------|
| **Stranger-danger norm** — community distrusts outsiders asking questions | HIGH — one-on-one with a stranger is suspicious | MODERATE — group setting provides social proof | LOW — no interpersonal interaction |
| **Elder authority norm** — elders' views are not questioned | HIGH — elder may not speak freely to a younger assessor | HIGH — elder may dominate or be deferred to | MODERATE — anonymity reduces authority pressure |
| **Gender segregation norm** — men and women do not mix | HIGH — cross-gender interview is inappropriate | HIGH — mixed group violates norms | LOW — no gender interaction |
| **Collective decision norm** — decisions are made communally, not individually | HIGH — individual interview bypasses community process | MODERATE — group method aligns with collective norm | HIGH — individual response bypasses community process |
| **Oral tradition norm** — knowledge is shared orally, not in writing | LOW — verbal format aligns with norm | LOW — verbal discussion aligns with norm | HIGH — written format is alien |
| **Shame/honor norm** — admitting need is shameful | HIGH — participant may not admit need to assessor | HIGH — participant may not admit need in group | MODERATE — anonymity reduces shame but may reduce honesty about real needs |
| **Reciprocity norm** — receiving a visitor requires giving them something | MODERATE — participant offers time and information; may expect something in return | MODERATE — group offers hospitality; may expect reciprocity | LOW — no visitor interaction |
| **Spiritual sensitivity** — certain topics are spiritually restricted | HIGH — assessor may inadvertently ask about restricted topics | HIGH — group may discuss restricted topics without awareness | MODERATE — prompts can be screened for spiritual sensitivity |

### 17.3 Mitigation Principles

These principles reduce the risk of cultural misapplication:

1. **The partner leads cultural adaptation** — the local partner, not the funding organization, determines how each method is adapted for the cultural context
2. **Community permission precedes method deployment** — the community's leadership (however constituted) grants permission for the assessment approach before any method is used
3. **Cultural broker is essential** — a community member who understands both the cultural context and the assessment method bridges the gap between the two
4. **Methods are piloted** — each method is tested with a small group before full deployment; the pilot checks for cultural appropriateness, comprehension, and comfort
5. **Community feedback on the process** — the community is asked whether the assessment process itself is acceptable; if it is not, the process changes, not the community
6. **No method is sacred** — if a method does not work culturally, it is replaced; the assessment question remains, but the method changes
7. **Local knowledge is authoritative** — when the partner's cultural judgment conflicts with the method's design principles, the partner's judgment prevails

### 17.4 When Cultural Risk Makes All Methods Inappropriate

There are contexts where the cultural risk is so high that no assessment method should be deployed:

- The community has not granted permission for any external assessment
- The cultural context makes the assessment topic itself taboo
- The power dynamics are so severe that any method would produce distorted data
- The community has been over-assessed and assessment fatigue is documented
- The funder's presence is itself the problem

In these cases, the correct action is to **not assess**. The M49-01 protocol's no-go outcome applies.

---

## 18. Local Decision Authority Preservation

### 18.1 Principle

This document is a **comparison tool**, not a **decision tool**. The decision about which method to use belongs to the qualified local partner (per M49-01), who understands the community context, cultural norms, and specific assessment question. The comparison informs that decision — it does not make it.

### 18.2 What This Document Prescribes

This document prescribes only:

1. **That a method comparison must occur** — the partner must consider all three methods before selecting one
2. **That exclusion risks must be documented** — for each method under consideration, the partner must identify who may be excluded and why
3. **That no-go conditions must be checked** — the partner must verify that the selected method's no-go conditions are not present in the community context
4. **That safeguarding overrides all** — regardless of the method selected, safeguarding protocols from M49-01 apply
5. **That the partner can reject all methods** — the partner may conclude that no method is safe and decline to assess

### 18.3 What This Document Does Not Prescribe

This document does **not**:

1. **Recommend a specific method** — the comparison is neutral; it does not favor any method
2. **Override the partner's cultural judgment** — if the partner says a method is culturally inappropriate, that judgment stands
3. **Create a scoring system** — there is no quantitative formula for method selection; the decision is qualitative and contextual
4. **Bind the funding organization's response** — the funding organization may have preferences, but the partner's decision is authoritative
5. **Eliminate the need for safeguarding review** — the selected method must still be reviewed by the safeguarding reviewer

### 18.4 Decision Authority Structure

```
Community (grants or withholds permission for assessment)
    |
    v
Local Partner (selects method based on context, culture, and comparison)
    |
    v
Safeguarding Reviewer (reviews selected method for safety)
    |
    v
Privacy Reviewer (reviews selected method for data protection)
    |
    v
Funding Organization (accepts the partner's method decision; does not direct it)
```

### 18.5 Preserving Authority in Practice

To preserve local decision authority:

1. **This document is provided to the partner, not imposed on them** — the partner receives the comparison as a resource
2. **The partner annotates the comparison** — the partner adds their own context-specific analysis to each method
3. **The partner makes the selection** — the partner documents which method they have selected and why
4. **The funding organization accepts the selection** — the funder does not second-guess the partner's method choice
5. **The community can veto the method** — if the community objects to the selected method, the partner revises the selection

---

## 19. Referral and Stop Rules per Method

### 19.1 Purpose

Each method must have clear rules for when to refer a participant to additional services and when to stop the assessment entirely. These rules are inherited from M49-01 but must be specified for each method's unique dynamics.

### 19.2 Interview Referral and Stop Rules

**Referral triggers (interview):**

| Trigger | Action | Timing |
|---------|--------|--------|
| Participant discloses abuse or exploitation | Stop interview; ensure participant safety; provide referral information; document and report | Immediate |
| Participant expresses psychological distress | Pause interview; check on participant; offer referral to counseling services; document | Immediate |
| Participant reveals a need outside assessment scope | Acknowledge; do not expand scope; provide referral information; document | During or after interview |
| Participant requests services the assessment cannot provide | Clarify assessment scope; provide referral information; do not promise services | During or after interview |
| Participant's situation requires legal intervention | Stop interview; follow mandatory reporting obligations; ensure participant safety | Immediate |
| Participant wants to withdraw consent | Stop interview; confirm withdrawal; document; do not pressure to continue | Immediate |

**Stop conditions (interview):**

| Condition | Action |
|-----------|--------|
| Participant is too distressed to continue | Stop immediately; ensure safety; offer referral |
| Participant asks to stop | Stop immediately; respect autonomy |
| Assessor observes signs of coercion (someone else is directing the participant's responses) | Stop immediately; address the coercion; reschedule without the coercing party |
| Assessor cannot maintain confidentiality | Stop immediately; secure data; do not continue |
| Safeguarding concern arises that the assessor is not qualified to handle | Stop immediately; report; do not investigate |
| The interview environment becomes unsafe | Stop immediately; leave; report |

### 19.3 Facilitated Group Referral and Stop Rules

**Referral triggers (group):**

| Trigger | Action | Timing |
|---------|--------|--------|
| A participant discloses abuse or exploitation | Pause group; address the individual privately if possible; provide referral; document and report | Immediate |
| A participant expresses psychological distress | Pause group; check on the individual; offer referral; if the group cannot continue, close the session | Immediate |
| Group discussion reveals a need outside assessment scope | Acknowledge; do not expand scope; provide group-level referral information; document | During or after session |
| A participant requests services the assessment cannot provide | Clarify assessment scope to the group; provide referral information; do not promise services | During or after session |
| Group dynamics become harmful ( (dominant participants suppress others, conflict escalates) | Pause group; address the dynamic; if unresolvable, close the session; offer individual follow-up | During session |

**Stop conditions (group):**

| Condition | Action |
|-----------|--------|
| A participant is too distressed to continue in the group | Stop the group; ensure the individual's safety; offer individual follow-up |
| Group consensus pressure becomes coercive | Stop the group; acknowledge the pressure; offer anonymous or individual alternatives |
| The facilitator loses control of the group's safety | Stop the session; close the group; document; offer individual alternatives |
| A participant discloses information that puts another participant at risk | Stop the group; address the safety concern; document and report |
| The group environment becomes physically unsafe | Stop immediately; evacuate if necessary; report |
| The group violates confidentiality agreements | Stop the group; reinforce ground rules; if unresolvable, close the group |

### 19.4 Anonymous Feedback Referral and Stop Rules

**Referral triggers (anonymous):**

| Trigger | Action | Timing |
|---------|--------|--------|
| Responses indicate widespread abuse or exploitation | Document pattern; report through safeguarding pathway; consider community-level referral services | After data collection |
| Individual response discloses acute distress or danger | If contact information is available, follow up; if anonymous, ensure general referral services are available in the community | After data collection |
| Responses reveal a need outside assessment scope | Document; do not expand scope; provide community-level referral information | After data collection |
| Responses indicate the assessment topic is harmful to the community | Stop collection; report; reconsider whether the assessment should continue | During collection |

**Stop conditions (anonymous):**

| Condition | Action |
|-----------|--------|
| Response rate is too low to be meaningful | Stop collection; document the low rate; do not use unrepresentative data |
| Responses are uniformly hostile to the assessment premise | Stop collection; reconsider whether the assessment question is appropriate |
| The collection system is compromised (data breach, unauthorized access) | Stop collection; secure data; report breach; do not use compromised data |
| The community requests that the collection stop | Stop immediately; respect community authority |
| Responses indicate that participation is causing harm | Stop immediately; investigate; provide referral services |

### 19.5 Cross-Method Referral Principles

These principles apply to referral and stop rules across all methods:

1. **Referral is not a promise of services** — providing referral information does not guarantee the participant will receive services
2. **Warm referral preferred** — with the participant's consent, the partner connects the participant directly to the service provider; cold information handoffs are less effective
3. **Referral respects autonomy** — the participant may decline the referral; declining does not affect their participation or the assessment
4. **Stop is final** — when a stop condition is triggered, the method stops; it does not resume without addressing the trigger condition
5. **Documentation is required** — all referrals and stops are documented in the safeguarding log
6. **Community-level referral** — when individual referral is not possible (e.g., anonymous method), community-level referral services should be made available through general information distribution

---

## 20. Method Selection Decision Framework

### 20.1 Purpose

This framework guides the partner through the method selection process. It is a **decision support tool**, not a decision-maker. The partner's judgment, informed by community context and cultural knowledge, is the final authority.

### 20.2 Decision Sequence

The partner follows this sequence to select a method:

```
Step 1: Define the assessment question
    |
    v
Step 2: Identify the community context
    |  (power dynamics, cultural norms, literacy, technology, security)
    v
Step 3: Check no-go conditions for each method
    |  (Sections 5.5, 6.5, 7.5)
    v
Step 4: Assess accessibility barriers for each method
    |  (Section 9)
    v
Step 5: Score privacy risks for each method
    |  (Section 10)
    v
Step 6: Identify safe alternatives for excluded groups
    |  (Section 12)
    v
Step 7: Run tabletop scenarios for the specific context
    |  (Sections 13-16, adapted to local conditions)
    v
Step 8: Select method (or combination) that:
    |  - Minimizes exclusion
    |  - Minimizes privacy risk
    |  - Minimizes harm potential
    |  - Answers the assessment question
    |  - Is culturally appropriate
    v
Step 9: Document the selection rationale
    |
    v
Step 10: Submit to safeguarding and privacy review
    |
    v
Step 11: Obtain community permission for the selected method
    |
    v
Step 12: Deploy the method under M49-01 protocol safeguards
```

### 20.3 Decision Criteria Matrix

The partner evaluates each method against these criteria:

| Criterion | Weight | Interview | Facilitated Group | Anonymous Feedback |
|-----------|--------|-----------|-------------------|-------------------|
| Answers the assessment question | Essential | Can provide depth | Can provide breadth and validation | Can provide breadth |
| Minimizes exclusion | Essential | Moderate — physical and social barriers | Low — multiple barriers | Moderate — literacy and technology barriers |
| Minimizes privacy risk | Essential | Moderate | High — group exposure | Low — anonymous by design |
| Minimizes harm potential | Essential | Moderate — power imbalance | High — group dynamics | Low — no interpersonal interaction |
| Is culturally appropriate | Essential | Depends on context | Depends on context | Depends on context |
| Partner has capacity to deliver | Practical | Requires trained assessor | Requires skilled facilitator | Requires prompt design and distribution |
| Community has granted permission | Essential | Required | Required | Required |
| Safeguarding reviewer approves | Essential | Required | Required | Required |

### 20.4 Method Combination

The partner is not limited to a single method. Combinations may be appropriate:

| Combination | When to Use | How to Manage |
|-------------|-------------|---------------|
| **Interview + Anonymous** | Community has mixed access profiles | Use anonymous for broad input; interview for depth; ensure both follow M49-01 consent and data rules |
| **Group + Interview** | Community benefits from collective discussion but has sensitive subtopics | Group for general themes; individual interview for sensitive topics; ensure group participants know they can opt for individual instead |
| **Group + Anonymous** | Community has dominant voices but needs collective validation | Group for discussion; anonymous for priority ranking; ensure group findings do not override anonymous rankings |
| **Sequential (all three)** | Comprehensive assessment with time and resources | Anonymous first (broad input); group second (theme validation); interview third (depth); each step informs the next |

### 20.5 When No Method Is Selected

If the decision framework concludes that no method is safe or appropriate for the community context, the outcome is:

1. **Document the decision** — record why no method was selected
2. **Report to the funding organization** — the funder is informed that the assessment cannot proceed
3. **Do not force a method** — using an inappropriate method is worse than not assessing
4. **Revisit when conditions change** — the decision can be revisited if the community context changes
5. **This is a valid outcome** — the M49-01 protocol explicitly allows a no-go outcome

---

## 21. Inclusion Risk Mitigation Assignment

### 21.1 Purpose

For each inclusion risk identified in this comparison, a specific mitigation is assigned to an accountable role. This ensures that risks are not merely documented but actively managed.

### 21.2 Risk Mitigation Register

| ID | Risk | Method | Affected Group | Mitigation | Accountable Role | Status |
|----|------|--------|----------------|------------|-----------------|--------|
| IR-01 | Physical access barrier | Interview | Mobility-impaired participants | Home visit option; accessible venue selection | Partner / Assessor | TO BE ASSIGNED |
| IR-02 | Physical access barrier | Facilitated Group | Mobility-impaired participants | Accessible venue; transport assistance; remote participation option | Partner / Facilitator | TO BE ASSIGNED |
| IR-03 | Sensory access barrier (hearing) | Interview | Deaf or hard-of-hearing participants | Sign language interpreter; written supplement | Partner / Assessor | TO BE ASSIGNED |
| IR-04 | Sensory access barrier (hearing) | Facilitated Group | Deaf or hard-of-hearing participants | Written summary; dedicated interpreter; individual alternative | Partner / Facilitator | TO BE ASSIGNED |
| IR-05 | Sensory access barrier (vision) | Anonymous Feedback | Blind or low-vision participants | Braille versions; audio recording option; large print | Partner / Prompt Designer | TO BE ASSIGNED |
| IR-06 | Cognitive access barrier | All methods | Participants with cognitive disabilities | Simplified language; support person; shorter sessions | Partner / Assessor | TO BE ASSIGNED |
| IR-07 | Social access barrier (gender) | Interview | Women in gender-restricted contexts | Gender-matched assessor; community permission | Partner | TO BE ASSIGNED |
| IR-08 | Social access barrier (gender) | Facilitated Group | Women in gender-restricted contexts | Single-gender groups; female facilitator | Partner / Facilitator | TO BE ASSIGNED |
| IR-09 | Social access barrier (status) | Interview | Low-status participants | Peer interviewer; community introduction | Partner | TO BE ASSIGNED |
| IR-10 | Social access barrier (status) | Facilitated Group | Low-status participants | Separate demographic groups; anonymous voting within group | Partner / Facilitator | TO BE ASSIGNED |
| IR-11 | Language barrier (dialect) | All methods | Minority language speakers | Multilingual assessors; translated materials; cultural validation | Partner | TO BE ASSIGNED |
| IR-12 | Language barrier (literacy) | Anonymous Feedback | Non-literate participants | Pictorial formats; oral recording option; community messenger | Partner / Prompt Designer | TO BE ASSIGNED |
| IR-13 | Technology access barrier | Anonymous Feedback | Participants without devices or connectivity | Paper-based option; community distribution points | Partner | TO BE ASSIGNED |
| IR-14 | Power imbalance (authority) | Interview | Participants intimidated by assessor | Peer interviewer; assessor humility training | Partner | TO BE ASSIGNED |
| IR-15 | Power imbalance (funder) | All methods | Participants who fear the funder | Funder invisibility in all methods; partner independence | Partner / Funding Organization | TO BE ASSIGNED |
| IR-16 | Privacy risk (group exposure) | Facilitated Group | All group participants | Confidentiality ground rules; individual follow-up option | Partner / Facilitator | TO BE ASSIGNED |
| IR-17 | Unsafe disclosure (abuse) | Facilitated Group | Participants who disclose abuse | Immediate pause; private follow-up; safeguarding report | Facilitator / Safeguarding Lead | TO BE ASSIGNED |
| IR-18 | Participation visibility | Interview | Participants observed attending | Discreet scheduling; neutral location; cover story if agreed | Partner / Assessor | TO BE ASSIGNED |
| IR-19 | Cultural misapplication | All methods | Community whose norms differ from method design | Cultural broker; community permission; method piloting | Partner | TO BE ASSIGNED |
| IR-20 | Assessment fatigue | All methods | Community that has been over-assessed | Coordinate with other organizations; limit assessment frequency; respect community's right to decline | Partner | TO BE ASSIGNED |

### 21.3 Mitigation Assignment Process

The accountable role is assigned through this process:

1. **Partner identifies the risk** — during the community context assessment (Step 2 of the decision framework)
2. **Partner selects the mitigation** — from the options in Section 12 and the register above
3. **Partner assigns the role** — a specific person is named as accountable for implementing the mitigation
4. **Safeguarding reviewer validates** — the reviewer confirms the mitigation is adequate
5. **Implementation is documented** — the partner records how each mitigation was implemented
6. **Community feedback is sought** — the community confirms whether the mitigation was effective

### 21.4 Unassigned Mitigations

All mitigations in the register above are marked "TO BE ASSIGNED" because:

- No partner has been identified
- No community context has been assessed
- No specific method has been selected
- No safeguarding reviewer has been appointed

Assignment of mitigations is a **deferred action** that occurs when a partner begins implementing the M49-01 protocol for a specific community.

---

## 22. Qualified Reviewer Consultation Protocol

### 22.1 Purpose

The M49-01 protocol requires that the assessment protocol be reviewed by qualified reviewers before deployment. M49-02 extends this requirement: the **method comparison itself** should be reviewed by qualified reviewers before a partner uses it to select a method.

### 22.2 Reviewer Roles

| Reviewer | Qualification | Reviews What | When |
|----------|--------------|--------------|------|
| **Safeguarding Reviewer** | Qualified safeguarding professional; independent from program delivery | No-go conditions; referral and stop rules; unsafe disclosure scenarios; harm mitigations | Before method selection |
| **Privacy Reviewer** | Data protection professional; understanding of anonymization and consent | Privacy risk scores; data necessity analysis; data handling provisions | Before method selection |
| **Cultural Reviewer** | Community member or cultural expert; understands the specific community context | Cultural misapplication risks; method appropriateness; accessibility barriers | Before method selection |
| **Community Reviewer** | Representative of the community being assessed (with community consent) | All aspects of the method as applied to their community | Before method deployment |
| **Peer Reviewer** | Another humanitarian research professional; understands method comparison | Analytical rigor; completeness of comparison; assumption validity | Before document finalization |

### 22.3 Consultation Sequence

```
Step 1: Partner completes method comparison (this document's framework applied to their context)
    |
    v
Step 2: Safeguarding Reviewer reviews no-go conditions and stop rules
    |  (confirms safeguarding provisions are adequate)
    v
Step 3: Privacy Reviewer reviews data necessity and privacy risk scores
    |  (confirms data minimization is maintained)
    v
Step 4: Cultural Reviewer reviews cultural misapplication risks
    |  (confirms methods are culturally appropriate)
    v
Step 5: Community Reviewer reviews the selected method
    |  (confirms community permission and comfort)
    v
Step 6: Partner documents reviewer feedback and responds to concerns
    |
    v
Step 7: Partner finalizes method selection with reviewer approval documented
```

### 22.4 Reviewer Independence

Reviewers must be:

- **Independent from the funding organization** — they do not have a financial or programmatic interest in the assessment outcome
- **Independent from the partner organization** — they are not staff or contractors of the partner
- **Qualified for their role** — they have the professional expertise their review requires
- **Free to raise concerns** — they can object to a method selection without pressure
- **Bound by confidentiality** — they do not disclose community information outside the review process

### 22.5 Reviewer Consultation for This Document

This document (the method comparison) has been prepared for reviewer consultation. The following aspects require reviewer attention:

| Aspect | Reviewer | Question |
|--------|----------|----------|
| No-go conditions (Sections 5.5, 6.5, 7.5) | Safeguarding | Are the conditions sufficient to prevent harm? |
| Privacy risk scores (Section 10) | Privacy | Are the scores accurate? Are mitigations adequate? |
| Cultural misapplication risks (Section 17) | Cultural | Are the risks correctly identified? Are mitigations appropriate? |
| Accessibility analysis (Section 9) | Cultural / Community | Are the barriers correctly identified? Are accommodations practical? |
| Power imbalance scenarios (Section 13) | Safeguarding / Cultural | Do the scenarios reflect real community dynamics? |
| Inclusion risk register (Section 21) | All reviewers | Are the risks complete? Are the mitigations adequate? |

### 22.6 Reviewer Consultation Status

| Reviewer | Consulted? | Date | Outcome |
|----------|-----------|------|---------|
| Safeguarding Reviewer | NOT YET | — | Deferred — requires reviewer appointment |
| Privacy Reviewer | NOT YET | — | Deferred — requires reviewer appointment |
| Cultural Reviewer | NOT YET | — | Deferred — requires community identification and reviewer appointment |
| Community Reviewer | NOT YET | — | Deferred — requires community identification and consent |
| Peer Reviewer | NOT YET | — | Deferred — requires peer reviewer identification |

---

## 23. Metrics and Success Criteria

### 23.1 Process Metrics

These metrics track the comparison process itself:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Methods compared** | 3 (interview, facilitated group, anonymous feedback) | Document completeness check |
| **Exclusion risks identified** | All risks in Section 9 documented | Risk register completeness |
| **Privacy risks scored** | All risks in Section 10 scored | Score card completeness |
| **No-go conditions documented** | All conditions in Sections 5.5, 6.5, 7.5 listed | Condition list completeness |
| **Tabletop scenarios completed** | 4 categories (power, disability, language, disclosure) | Scenario documentation check |
| **Safe alternatives identified** | All alternatives in Section 12 listed | Alternative register completeness |
| **Inclusion risk mitigations assigned** | All risks in Section 21 have accountable roles | Assignment register completeness |
| **Reviewer consultation completed** | All reviewers in Section 22 consulted | Consultation record |

### 23.2 Outcome Metrics

These metrics track the comparison's outcome:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Method selected** | One method or combination selected by the partner | Partner decision record |
| **Exclusion rate** | Zero unmitigated exclusion risks | Mitigation register audit |
| **Privacy risk level** | MODERATE or below for the selected method | Privacy score re-assessment |
| **Community permission obtained** | Yes — community grants permission for the selected method | Community permission record |
| **Safeguarding reviewer approval** | Yes — reviewer approves the method selection | Reviewer approval record |
| **No harm incidents** | Zero harm incidents during the assessment | Incident log |

### 23.3 Success Criteria for This Document (BASELINE ESTABLISHED)

This document achieves "BASELINE ESTABLISHED" status when:

- [x] All 26 sections are present and substantive
- [x] Three methods are compared against consistent criteria
- [x] A hypothetical scenario is defined and applied
- [x] Accessibility analysis is complete for all three methods
- [x] Privacy risk scoring is complete for all three methods
- [x] Data necessity analysis is documented
- [x] Safe alternatives are identified
- [x] Four tabletop exercise categories are completed
- [x] Cultural misapplication risks are documented
- [x] Local decision authority preservation is addressed
- [x] Referral and stop rules are specified per method
- [x] Method selection decision framework is provided
- [x] Inclusion risk mitigation register is populated
- [x] Qualified reviewer consultation protocol is defined
- [x] Metrics and success criteria are established
- [x] No real beneficiary data is used (all scenarios are synthetic)
- [x] No method is recommended for any real community (comparison only)
- [ ] **Partner review obtained** — DEFERRED
- [ ] **Safeguarding reviewer consultation** — DEFERRED
- [ ] **Privacy reviewer consultation** — DEFERRED
- [ ] **Cultural reviewer consultation** — DEFERRED
- [ ] **Community reviewer consultation** — DEFERRED

---

## 24. Limitations and Caveats

### 24.1 Analytical Limitations

This comparison has the following analytical limitations:

1. **No empirical evidence** — the comparison is based on general humanitarian research principles, not on evidence from a specific community. The method trade-offs described are theoretical; actual trade-offs depend on context.

2. **Synthetic scenario only** — the hypothetical scenario (Section 8) is a teaching tool, not a real community. The scenario's parameters are simplified and do not capture the full complexity of any real humanitarian setting.

3. **Western method origin** — all three methods originate from Western social science traditions. The comparison acknowledges cultural misapplication risks (Section 17) but cannot fully account for every cultural context.

4. **No quantitative scoring** — the comparison uses qualitative judgments (LOW, MODERATE, HIGH) rather than quantitative scores. This is deliberate — quantitative scoring would imply a precision that the analysis does not support.

5. **Static analysis** — the comparison captures a point-in-time analysis. Community contexts change; the comparison does not account for temporal dynamics.

6. **No cost analysis** — the comparison does not include a financial cost analysis of each method. Cost is a practical consideration but is context-dependent and cannot be generalized.

7. **No effectiveness measurement** — the comparison does not measure how effectively each method answers the assessment question. Effectiveness depends on the quality of implementation, not just the method design.

### 24.2 Contextual Unknowns

The following contextual factors are unknown and must be determined by the partner:

| Unknown | Impact on Method Selection | How to Resolve |
|---------|---------------------------|----------------|
| Community's power structure | Determines which methods can manage power imbalances | Partner's community context assessment |
| Community's cultural norms | Determines which methods are culturally appropriate | Cultural reviewer consultation |
| Community's literacy levels | Determines whether anonymous feedback is accessible | Partner's community context assessment |
| Community's technology access | Determines whether digital anonymous feedback is feasible | Partner's infrastructure assessment |
| Community's security context | Determines whether any method is safe | Partner's security assessment; safeguarding reviewer |
| Community's assessment history | Determines whether assessment fatigue is a factor | Partner's community engagement history |
| Partner's assessor/facilitator capacity | Determines which methods the partner can deliver | Partner's internal capacity assessment |
| Funding organization's constraints | Determines what the funder will accept | Funder-partner agreement |
| Available referral services | Determines whether referral and stop rules can be implemented | Partner's service landscape mapping |
| Community's preferred communication style | Determines which methods align with community norms | Community consultation |

### 24.3 Document Status

This document is:

- **BASELINE ESTABLISHED** — the method comparison is complete as a generic framework
- **NOT YET REVIEWED** — partner, safeguarding, privacy, cultural, and community reviews are deferred
- **NOT READY FOR IMPLEMENTATION** — the document cannot be used for real method selection without the deferred reviews and context-specific adaptations
- **SUBJECT TO REVISION** — the reviews may require changes to the comparison
- **NEUTRAL** — the document does not recommend any method for any community

### 24.4 Assumptions Register

| Assumption | Evidence Base | Impact if Wrong |
|------------|--------------|-----------------|
| Three methods (interview, group, anonymous) are the primary options | Common humanitarian research practice | Other methods may exist; the comparison is incomplete |
| Each method has distinct inclusion/exclusion profiles | General accessibility research | The profiles may overlap more than analyzed |
| Privacy risk can be scored qualitatively | Privacy impact assessment practice | Qualitative scoring may not capture all risk dimensions |
| Cultural misapplication is a significant risk | Cross-cultural research ethics literature | The risk may be higher or lower in specific contexts |
| Partner independence is achievable | M49-01 protocol design | In some contexts, the partner may not be sufficiently independent |
| Safeguarding protocols can be implemented | M49-01 protocol design | In some contexts, safeguarding capacity may be insufficient |
| Community permission can be obtained | M49-01 protocol design | In some contexts, the community may not grant permission |
| No method is universally superior | Method comparison principle | In some contexts, one method may be clearly preferable |
| Synthetic scenarios can exercise real risks | Scenario analysis practice | Synthetic scenarios may not capture all real-world dynamics |
| The partner has the capacity to adapt methods | M49-01 partner qualification criteria | Some partners may lack adaptation capacity |

---

## 25. Deferred Items Requiring Owner Action

### 25.1 Purpose

This section lists all actions that must be completed before the method comparison can be applied to a real community context. These actions are deferred because they require owner decisions, partner engagement, or community identification that has not yet occurred.

### 25.2 Deferred Action Register

| ID | Action | Owner | Prerequisite | Priority | Notes |
|----|--------|-------|--------------|----------|-------|
| D-1 | Appoint safeguarding reviewer | Project owner | None | Essential | Reviewer must be independent and qualified |
| D-2 | Appoint privacy reviewer | Project owner | None | Essential | Reviewer must have data protection expertise |
| D-3 | Identify and qualify local partner | Project owner | D-1, D-2 | Essential | Partner must meet M49-01 qualification criteria |
| D-4 | Partner reviews this method comparison | Local partner | D-3 | Essential | Partner annotates with context-specific analysis |
| D-5 | Safeguarding reviewer reviews no-go conditions and stop rules | Safeguarding Reviewer | D-1, D-4 | Essential | Reviewer confirms provisions are adequate |
| D-6 | Privacy reviewer reviews data necessity and privacy risk scores | Privacy Reviewer | D-2, D-4 | Essential | Reviewer confirms minimization is maintained |
| D-7 | Partner conducts community context assessment | Local partner | D-3, D-4 | Essential | Context assessment informs method selection |
| D-8 | Cultural reviewer reviews cultural misapplication risks | Cultural Reviewer | D-7 | Essential | Reviewer confirms methods are culturally appropriate |
| D-9 | Partner selects method (or combination) using decision framework | Local partner | D-5, D-6, D-7, D-8 | Essential | Selection is documented with rationale |
| D-10 | Community grants permission for the selected method | Community leadership | D-9 | Essential | Permission is documented |
| D-11 | Partner assigns inclusion risk mitigations | Local partner | D-9 | Essential | Mitigations are assigned to accountable roles |
| D-12 | Community reviewers validate the method selection | Community representatives | D-10 | Essential | Validation is documented |
| D-13 | Partner finalizes method deployment plan | Local partner | D-11, D-12 | Essential | Plan includes consent, data handling, and safeguarding |
| D-14 | Safeguarding reviewer approves the deployment plan | Safeguarding Reviewer | D-13 | Essential | Approval is documented |
| D-15 | Deploy the selected method under M49-01 protocol safeguards | Local partner | D-14 | Essential | Deployment is monitored and documented |

### 25.3 Deferred Item Dependencies

```
D-1 (Safeguarding reviewer appointed)
D-2 (Privacy reviewer appointed)
    |
    v
D-3 (Partner identified and qualified)
    |
    v
D-4 (Partner reviews method comparison)
    |
    +---> D-5 (Safeguarding review) --+
    |                                   |
    +---> D-6 (Privacy review) -------+
    |                                   |
    v                                   v
D-7 (Community context assessment)
    |
    v
D-8 (Cultural review)
    |
    v
D-9 (Method selection)
    |
    +---> D-10 (Community permission) --+
    |                                     |
    +---> D-11 (Mitigation assignment) --+
    |                                     |
    v                                     v
D-12 (Community validation)
    |
    v
D-13 (Deployment plan)
    |
    v
D-14 (Safeguarding approval)
    |
    v
D-15 (Method deployment)
```

### 25.4 Rollback Conditions

If any deferred action cannot be completed, the method comparison is rolled back:

| Condition | Rollback Action |
|-----------|----------------|
| No safeguarding reviewer can be appointed | Do not proceed with method selection |
| No privacy reviewer can be appointed | Do not proceed with method selection |
| No qualified partner can be identified | Do not proceed with any assessment; document the no-go outcome |
| Partner declines to review the comparison | Do not proceed; respect the partner's decision |
| Community declines to grant permission | Do not proceed; respect the community's decision |
| Safeguarding reviewer objects to the method selection | Do not deploy the method; revise or select an alternative |
| Cultural reviewer objects to the method selection | Do not deploy the method; revise or select an alternative |
| Community reviewers object to the method selection | Do not deploy the method; revise or select an alternative |

---

## 26. Conclusion: BASELINE ESTABLISHED

### 26.1 Summary

This document establishes the **baseline comparison** of three needs-assessment methods — interview, facilitated group, and anonymous feedback — evaluated for accessibility, harm potential, privacy risk, and inclusion. The comparison is conducted against a hypothetical scenario and uses synthetic data exclusively.

### 26.2 What Has Been Achieved

| Achievement | Status | Evidence |
|-------------|--------|----------|
| Three methods defined and bounded | YES | Sections 4–7 |
| Hypothetical scenario defined | YES | Section 8 |
| Accessibility analysis per method | YES | Section 9 |
| Privacy risk scoring per method | YES | Section 10 |
| Data necessity analysis | YES | Section 11 |
| Safe alternatives identified | YES | Section 12 |
| Power imbalance tabletop exercise | YES | Section 13 |
| Disability access tabletop exercise | YES | Section 14 |
| Language barrier tabletop exercise | YES | Section 15 |
| Unsafe disclosure tabletop exercise | YES | Section 16 |
| Cultural misapplication risks documented | YES | Section 17 |
| Local decision authority preservation addressed | YES | Section 18 |
| Referral and stop rules per method | YES | Section 19 |
| Method selection decision framework | YES | Section 20 |
| Inclusion risk mitigation register | YES | Section 21 |
| Qualified reviewer consultation protocol | YES | Section 22 |
| Metrics and success criteria defined | YES | Section 23 |
| Limitations and caveats documented | YES | Section 24 |
| Deferred items registered | YES | Section 25 |
| No real beneficiary data used | YES | All scenarios synthetic |
| No method recommended for any real community | YES | Comparison is neutral |

### 26.3 What Has Not Been Achieved

| Item | Status | Reason |
|------|--------|--------|
| Partner review of comparison | NOT DONE | Requires partner identification (D-3) |
| Safeguarding reviewer consultation | NOT DONE | Requires reviewer appointment (D-1) |
| Privacy reviewer consultation | NOT DONE | Requires reviewer appointment (D-2) |
| Cultural reviewer consultation | NOT DONE | Requires community identification (D-7) |
| Community reviewer consultation | NOT DONE | Requires community consent (D-10) |
| Method selected for a real community | NOT DONE | Requires all reviews (D-9) |
| Community permission obtained | NOT DONE | Requires method selection (D-10) |
| Method deployed | NOT DONE | Requires all preceding steps (D-15) |

### 26.4 Key Findings

1. **No single method is universally appropriate.** Each method has distinct inclusion/exclusion profiles, privacy risks, and harm potentials. The partner must select the method based on the specific community context.

2. **Anonymous feedback has the lowest privacy risk** but the highest accessibility barriers for non-literate, visually impaired, and technology-excluded participants.

3. **Facilitated group has the highest privacy risk** due to group exposure, but the strongest collective sense-making potential.

4. **Interview has the strongest safeguarding observation capacity** but the highest power imbalance risk.

5. **Cultural misapplication is a cross-cutting risk** that affects all methods. The partner's cultural judgment is the primary safeguard.

6. **Local decision authority must be preserved.** This comparison informs but does not determine the partner's method selection.

7. **Combinations of methods may be appropriate.** The partner is not limited to a single method.

8. **No method is safe in all contexts.** There are communities where no assessment method should be deployed.

### 26.5 Document Status

**BASELINE ESTABLISHED**

This means:

- The method comparison is **complete as a generic framework**
- The document is **ready for review** by partner, safeguarding, privacy, cultural, and community reviewers
- The document is **not ready for implementation** — deferred items must be resolved first
- The document is **subject to revision** — reviews may require changes
- No real-world assessment activity is authorized by this document
- No real beneficiary data has been used or collected
- All scenarios are **synthetic** — no real events or people are represented
- No method is **recommended** for any specific community

### 26.6 Acceptance Criteria Verification

| Criterion | Met? | Evidence |
|-----------|------|----------|
| Recommendation identifies who may be excluded | YES | Section 9 (accessibility analysis), Section 21 (inclusion risk register) |
| Recommendation identifies what data is necessary | YES | Section 11 (data necessity analysis) |
| Recommendation identifies safe alternatives | YES | Section 12 (safe alternatives identification) |

### 26.7 Definition of Done Verification

| Requirement | Met? | Evidence |
|-------------|------|----------|
| No live participant contact | YES | All scenarios synthetic |
| Partner validates locally specific conclusion | DEFERRED | No partner identified; D-4 through D-12 |

### 26.8 Verification Plan Completion

| Scenario Category | Completed? | Section |
|-------------------|-----------|---------|
| Power imbalance | YES | Section 13 |
| Disability access | YES | Section 14 |
| Language barrier | YES | Section 15 |
| Unsafe disclosure | YES | Section 16 |

### 26.9 Closure Evidence

| Evidence | Status | Location |
|----------|--------|----------|
| Reviewed comparison document | COMPLETE (pending review) | This document |
| Assumptions register | COMPLETE | Section 24.4 |
| No-go conditions documented | COMPLETE | Sections 5.5, 6.5, 7.5 |
| Partner validation | DEFERRED | D-4 through D-12 |

### 26.10 TODO Alignment

- **Objective met:** Three methods compared for accessibility and harm against a hypothetical partner-defined need
- **Scope met:** Method trade-offs simulated; no-go conditions documented; protocol comparison only — no live survey, identity store, or product feature
- **Acceptance criteria met:** Exclusion risks, data necessity, and safe alternatives are all identified
- **Definition of done partially met:** No live participant contact satisfied; partner validation deferred
- **Verification plan met:** Four tabletop scenario categories completed
- **Risks documented:** Cultural misapplication risk identified; local decision authority preserved
- **Metrics defined:** Inclusion risks identified and mitigations assigned (to be activated by partner)
- **Closure evidence partial:** Reviewed comparison (this document), assumptions register (Section 24.4), and no-go conditions (Sections 5.5, 6.5, 7.5) are complete; partner validation deferred

**Status: BASELINE ESTABLISHED — comparison complete, partner validation deferred.**

---

*Document prepared: 2026-10-31*  
*Document status: BASELINE ESTABLISHED*  
*All scenarios: SYNTHETIC — no real beneficiary data*  
*Next required action: Owner review and appointment of reviewers (D-1, D-2)*
