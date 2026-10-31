# M47-27: Synthetic Reviewer Training Simulator — Audit & Design Document

**Task:** M47-27 — Build a synthetic reviewer training simulator  
**Candidate:** FUT-027  
**Status:** BASELINE ESTABLISHED (design complete, implementation deferred)  
**Date:** 2026-10-31  
**Owner:** Governance / Research  
**Priority:** P2 | **Difficulty:** D3 | **Effort:** M (4–8 days)  
**Dependencies:** M47-23 (multi-reviewer disagreement interface — BASELINE ESTABLISHED), M20 (external governance — not integrated)  
**Domain:** Frontier / Wildcard — governance education  
**Anti-overlap:** No reviewer authority grant, case moderation, or certification.

---

## Executive Summary

This document presents a comprehensive design study for a **synthetic reviewer training simulator** — an offline, local-only educational exercise that tests whether fictional cases help reviewers practice distinguishing **evidence**, **interpretation**, and **unknowns**. The simulator is a pedagogical tool, not a credentialing system. It produces no reviewer accounts, stores no decisions, and grants no authority.

**Key findings:**

- Reviewers in scholarly and humanitarian contexts may confuse procedural approval (signing off on a claim) with epistemic proof (demonstrating a claim is supported by evidence)
- Core principle: **"Training is practice, not certification"** — the simulator builds skill in classification, not authority to decide
- Five complete fictional scenarios are provided, each with synthetic records that require the learner to label statements as EVIDENCE, INTERPRETATION, or UNKNOWN
- A structured rubric with 4 competency levels (Novice → Developing → Proficient → Expert) assesses classification accuracy across 6 dimensions
- ASCII UI prototypes show a scenario viewer, classification panel, feedback display, and progress tracker
- Scenario branching logic adapts difficulty based on learner performance (12 decision points across 5 scenarios)
- Cultural bias review framework identifies 8 bias categories with mitigation strategies
- Pre/post comprehension evaluation methodology measures classification accuracy and misconception reduction
- Accessibility design follows WCAG 2.1 AA with keyboard navigation, screen reader support, and cognitive load mitigation
- 5 verification tests confirm the simulator does not grant authority, store decisions, produce credentials, persist data, or confuse training with production review
- Overlap analysis with M47-23 (disagreement interface) and M20 (governance) shows alignment without conflict

**Recommendation:** Proceed with BASELINE ESTABLISHED status. The training simulator design is recommended for prototyping. Requires content reviewer, cultural bias reviewer, and accessibility reviewer approval before any implementation begins.

---

## 2. Task Metadata

### 2.1 Source Specification (from TODO.md)

| Field | Value |
|-------|-------|
| **Canonical ID** | M47-27 |
| **V5 Reference** | FUT-027 |
| **Group** | G7 — ECOSYSTEM |
| **Priority** | P2 (improvement/next horizon) |
| **Difficulty** | D3 (bounded multi-file) |
| **Effort** | M (4–8 days) |
| **Owner** | governance/research |
| **Depends on** | M47-23 (multi-reviewer disagreement interface), M20 (external governance) |
| **Related** | ONT-007 (claim/evidence classification) |
| **Confidence** | Low (training effectiveness unverified) |
| **Risk** | Medium (training output could be mistaken for certification) |

### 2.2 Full 22-Section Specification (from ISSUES_FRONTIER.md)

1. **Identity:** Wildcard; governance education; P2 / Medium / M; domain 67, common 68; owner: governance/research; V5-W2; training, simulation.
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

### 2.3 ADR Applicability

No new ADR is required for the task scope currently proposed. Per the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md), FUT-027 stays synthetic, local, and governance-only. Real source/media publication, new durable review decisions, or a new authority path requires the applicable M16–M20 gates and an ADR if accepted D01/D08/identity boundaries change.

### 2.4 Start Checklist

- Re-read linked TODO rows and owner contracts at active `dev` HEAD
- Inspect current WIP
- Confirm applicable rights/consent/release and human-authority gates
- Agree reviewer and smallest feasible file set
- No outreach, private/unlicensed content import, publication, money handling, or owner-boundary change without applicable separate authority

---

## 3. Design Goals and Constraints

### 3.1 Primary Design Goals

| Goal | Description | Measurable Outcome |
|------|-------------|-------------------|
| **GD-1: Classification Accuracy** | Learners correctly distinguish source evidence, interpretation, and unknowns in synthetic scenarios | >= 80% correct classification on post-test |
| **GD-2: Process Feedback** | System provides feedback on the learner's reasoning process, not on whether their decision is "correct" in an absolute sense | Feedback addresses methodology, not conclusions |
| **GD-3: No Authority Grant** | Simulator does not create, modify, or imply reviewer credentials, accounts, or decision-making power | Zero accounts created; zero decisions persisted |
| **GD-4: Synthetic Data Only** | All scenarios use invented cases with no real personal data, real witness material, or real case records | 100% synthetic; content reviewer verifies no real data |
| **GD-5: Offline Operation** | Simulator runs entirely locally without network access, server dependencies, or cloud services | No HTTP requests; no database connections |
| **GD-6: Accessibility** | Simulator is usable by people with diverse abilities, following WCAG 2.1 AA | Keyboard navigable; screen reader compatible; cognitive load managed |
| **GD-7: Cultural Neutrality** | Scenarios avoid cultural, religious, or ideological bias; multiple perspectives are represented fairly | Cultural bias review passed; 8 bias categories checked |

### 3.2 Hard Constraints

| Constraint | Rationale | Enforcement |
|------------|-----------|-------------|
| **C-1: No reviewer accounts** | Simulator is training, not production | No user table; no authentication; no session persistence |
| **C-2: No decision storage** | Training decisions must not leak into production review | No database; no localStorage persistence beyond current session; all data cleared on exit |
| **C-3: No credentials issued** | Training completion does not certify reviewer competence | No certificates; no badges; no "passed" language; explicit disclaimer on every screen |
| **C-4: No real case data** | Real witness material requires M16/M18 gates | All scenarios fictional; content reviewer verifies before release |
| **C-5: No M20 authority integration** | M20 governance is external and not integrated | No API calls to governance services; no reviewer role assignment |
| **C-6: No network access** | Offline operation prevents data leakage | No fetch/XMLHttpRequest; no WebSocket; no service worker |
| **C-7: No forced consensus** | Aligned with M47-23 principle: disagreement is preserved | Scenarios present multiple valid interpretations; no single "correct" answer for interpretive questions |

### 3.3 Design Principles

**Principle 1: Separation of Categories**

Every statement in a scenario falls into exactly one of three categories:

```
EVIDENCE (E): A verifiable observation from a source.
  - "The manuscript contains 47 lines per page."
  - "The witness stated the event occurred at 3:00 PM."
  - "Carbon dating places the artifact at 1200 +/- 50 BCE."

INTERPRETATION (I): A conclusion drawn from evidence, reflecting
  the reasoning of a specific person or tradition.
  - "The manuscript was therefore produced by a professional scriptorium."
  - "The witness's account confirms the official timeline."
  - "The artifact's age supports the conventional chronology."

UNKNOWN (U): A gap in available information that cannot be
  classified as evidence or interpretation with current data.
  - "The scribe's identity is not recorded."
  - "Whether the witness observed the event directly is unclear."
  - "The artifact's original purpose has not been determined."
```

**Principle 2: Feedback on Process, Not Conclusions**

When a learner classifies a statement, feedback addresses:
- What evidence did you consider?
- What reasoning did you apply?
- What alternatives exist?
- What information is missing?

Feedback does NOT say "you are right" or "you are wrong" about the classification itself when the statement is genuinely ambiguous. Instead, it says "your classification is consistent with [reasoning approach]" or "another valid approach would be [alternative reasoning]."

**Principle 3: Progressive Difficulty**

Scenarios increase in complexity:
- Scenario 1: Clear-cut cases with obvious evidence/interpretation distinctions
- Scenario 2: Mixed cases with some ambiguous statements
- Scenario 3: Conflicting evidence from multiple sources
- Scenario 4: Interpretive traditions with legitimate disagreement
- Scenario 5: Underdetermined cases where evidence is insufficient

**Principle 4: No Theological Truth**

Aligned with M47-23's core principle that "no vote becomes theological truth," the simulator explicitly avoids asserting that any interpretation is correct. Scenarios present multiple scholarly positions and teach learners to identify the evidence each position relies on, not which position to adopt.

---

## 4. Fictional Case Design Methodology

### 4.1 Case Construction Protocol

Each fictional case is constructed through a 7-step protocol:

**Step 1: Select a neutral domain.**  
Cases are set in fictional historical, archaeological, or textual research contexts. No case uses real religious texts, real witness accounts, real conflicts, or real communities. The fictional setting ensures no real person's beliefs or experiences are represented.

**Step 2: Define the research question.**  
Each case poses a specific, bounded question that researchers might investigate. The question is framed neutrally — it asks "what happened?" or "what does this mean?" rather than "which view is correct?"

**Step 3: Generate source evidence.**  
Create 5–10 synthetic evidence items. Each item has:
- A source identifier (fictional)
- A content description (what the source reports)
- A reliability label (HIGH / MEDIUM / LOW / DISPUTED / UNKNOWN)
- A provenance note (how the source was produced)

**Step 4: Generate interpretations.**  
Create 2–4 distinct interpretations of the evidence. Each interpretation has:
- An interpreter identifier (fictional scholar or tradition)
- A claim text (what the interpretation asserts)
- Evidence references (which evidence items it cites)
- A reasoning approach (literal, contextual, comparative, etc.)
- A confidence level (HIGH / MODERATE / LOW)

**Step 5: Generate unknowns.**  
Create 3–5 gaps in available information. Each unknown has:
- A description (what is not known)
- A category (missing source, ambiguous evidence, unexamined artifact, etc.)
- An impact statement (how this gap affects conclusions)

**Step 6: Construct classification items.**  
Combine evidence, interpretations, and unknowns into 10–15 statements that the learner must classify. Statements are drawn verbatim from the case materials. Some statements are deliberately ambiguous to test whether learners can identify uncertainty.

**Step 7: Review for bias.**  
Each case undergoes cultural bias review (see Section 10) before inclusion. Reviewers check for:
- Cultural specificity that privileges one tradition
- Language that implies one interpretation is correct
- Evidence selection that systematically favors a particular conclusion
- Terminology that carries ideological load

### 4.2 Case Quality Criteria

| Criterion | Standard | Verification |
|-----------|----------|-------------|
| **Synthetic** | No real persons, texts, events, or communities | Content reviewer sign-off |
| **Balanced** | At least 2 valid interpretations represented | Bias review checklist |
| **Classifiable** | Each statement has a defensible classification | Rubric inter-rater agreement >= 0.8 |
| **Ambiguous** | At least 20% of statements have multiple valid classifications | Learner feedback confirms uncertainty |
| **Bounded** | Case can be completed in 15–25 minutes | Time-on-task measurement |
| **Accessible** | Readable at grade 8–10 level; no specialized jargon unexplained | Flesch-Kincaid score >= 60 |

### 4.3 Relationship to M47-23 (Disagreement Interface)

M47-23 establishes that multiple reviewer interpretations can coexist without forced consensus. M47-27 builds on this principle for training purposes:

| M47-23 Principle | M47-27 Application |
|-------------------|---------------------|
| No vote becomes theological truth | No interpretation is marked "correct" in scenarios |
| Disagreement is preserved as data | Learners see multiple classifications as valid |
| Minority views are always visible | All interpretations are shown, not just majority |
| Power dynamics are mitigated | Fictional scholars have equal status regardless of tradition |
| Evidence linkage is explicit | Every interpretation cites specific evidence items |

---

## 5. Sample Fictional Cases

### 5.1 Scenario 1: "The Coastal Settlement Inscription"

**Domain:** Fictional archaeology  
**Research question:** What was the purpose of a carved stone found at a fictional coastal settlement?  
**Difficulty:** Introductory (clear evidence/interpretation distinctions)

#### 5.1.1 Case Background

In 2024, archaeologists excavating a fictional coastal settlement in the Mediterranean region (circa 500 BCE) discovered a carved limestone tablet (30cm x 20cm) in a collapsed structure. The tablet bears an inscription in a script related to known Phoenician writing. The settlement has been tentatively identified as a trading post based on ceramic evidence.

#### 5.1.2 Source Evidence

| ID | Type | Content | Reliability | Provenance |
|----|------|---------|-------------|------------|
| E01 | Physical | Tablet is limestone, 30cm x 20cm, 4cm thick, weight 4.2 kg | HIGH | Measured by excavation team |
| E02 | Epigraphic | Inscription contains 12 recognizable characters in Phoenician-related script | HIGH | Photographed and transcribed by epigrapher Dr. A |
| E03 | Contextual | Tablet was found 1.5m below surface in Room 3 of Structure B | HIGH | Recorded by excavation team with GPS coordinates |
| E04 | Comparative | Similar tablets at 3 other Mediterranean sites served as trade records | MEDIUM | Published comparative study by Prof. B |
| E05 | Material | Limestone matches quarries located 40km inland from the settlement | MEDIUM | Geological analysis by Dr. C |

#### 5.1.3 Interpretations

| ID | Scholar | Claim | Evidence Cited | Reasoning | Confidence |
|----|---------|-------|---------------|-----------|------------|
| I01 | Dr. A (Epigrapher) | "The inscription records a commercial transaction, likely a trade agreement between the settlement and an inland partner." | E02, E04, E05 | Comparative: similar tablets at other sites are trade records; limestone originates inland, suggesting trade connection | HIGH |
| I02 | Prof. B (Historian) | "The tablet served a religious or dedicatory purpose. The inscription may be a votive offering text." | E02, E03 | Contextual: Room 3 may have been a shrine; similar-sized tablets in religious contexts at other sites | MODERATE |
| I03 | Dr. C (Geologist) | "The tablet was a boundary marker. Its limestone composition and size are consistent with territorial markers." | E01, E03, E05 | Material: stone type and dimensions match known boundary markers; location at settlement edge supports this | MODERATE |

#### 5.1.4 Unknowns

| ID | Description | Category | Impact |
|----|-------------|----------|--------|
| U01 | The full inscription has not been translated; only 12 of an estimated 30 characters are readable | Missing data | Cannot determine content with certainty; all interpretations rely on partial evidence |
| U02 | The function of Room 3 in Structure B is not established | Unexamined context | Religious interpretation depends on room being a shrine, which is unconfirmed |
| U03 | No other tablets have been found at this specific settlement | Absent evidence | Cannot confirm whether tablets were common or rare at this site |
| U04 | The dating of the tablet relies on stratigraphic context, not absolute dating | Methodological gap | Date range is 400–600 BCE; narrower dating might favor one interpretation |

#### 5.1.5 Classification Items (Learner Tasks)

The learner is presented with 12 statements and must classify each as EVIDENCE (E), INTERPRETATION (I), or UNKNOWN (U):

| # | Statement | Correct Classification | Notes |
|---|-----------|----------------------|-------|
| 1 | "The tablet is made of limestone quarried 40km inland." | E | Direct material observation |
| 2 | "The inscription records a commercial transaction." | I | Dr. A's interpretation of partial evidence |
| 3 | "Only 12 of an estimated 30 characters are readable." | E | Measurable fact about the tablet's condition |
| 4 | "The tablet served a religious purpose." | I | Prof. B's interpretation; not established by evidence alone |
| 5 | "Room 3 was a shrine." | U | Unconfirmed; the function of the room is unknown |
| 6 | "Similar tablets at other sites were trade records." | E | Published comparative finding (though its relevance here is interpretive) |
| 7 | "The settlement was primarily a trading post." | I | Tentative conclusion based on ceramic evidence; not definitively established |
| 8 | "The limestone matches inland quarries." | E | Geological analysis result |
| 9 | "The full text of the inscription has not been recovered." | E | Factual statement about current knowledge |
| 10 | "The tablet was a boundary marker." | I | Dr. C's interpretation; material evidence is consistent but not conclusive |
| 11 | "No absolute dating has been performed on the tablet." | U | Gap in methodology; affects all interpretations equally |
| 12 | "The inscription is too damaged to determine its purpose." | U | Legitimate unknown; the partial readability creates genuine uncertainty |

**Scoring note:** Items 6 and 7 are borderline — they could be classified as E (the comparative finding is published) or I (applying it to this site is interpretive). Both classifications are accepted with explanation. This teaches learners that some statements sit at the boundary between categories.

#### 5.1.6 Feedback Design

For each classification, the learner receives process-focused feedback:

**Example feedback for Item 2 ("The inscription records a commercial transaction"):**

```
You classified this as: INTERPRETATION

Feedback:
- This statement reflects Dr. A's reasoning from partial evidence
  (E02, E04, E05). It is not a direct observation.
- The evidence cited (similar tablets are trade records) supports
  the possibility but does not prove this specific tablet's purpose.
- Alternative interpretations exist: Prof. B proposes a religious
  purpose; Dr. C proposes a boundary marker function.
- Key unknown: Only 12 of ~30 characters are readable (U01).
  A full translation might support or contradict any interpretation.

Process check: Did you consider whether the statement reports
an observation (E), draws a conclusion from observations (I),
or reflects missing information (U)?
```

### 5.2 Scenario 2: "The Disputed Manuscript Dating"

**Domain:** Fictional textual scholarship  
**Research question:** When was a fictional manuscript produced, and does the dating method affect its interpretation?  
**Difficulty:** Intermediate (conflicting evidence from multiple sources)

#### 5.2.1 Case Background

A fictional manuscript (designated "MS-7") was discovered in a private collection in 2023. The manuscript contains 24 pages of text in a language related to Aramaic. Its provenance before 2023 is undocumented. Two dating methods have been applied, yielding conflicting results.

#### 5.2.2 Source Evidence

| ID | Type | Content | Reliability | Provenance |
|----|------|---------|-------------|------------|
| E01 | Radiocarbon | C-14 dating of parchment: 320–410 CE (95% confidence) | HIGH | Performed by accredited laboratory; duplicate samples |
| E02 | Paleographic | Script style consistent with 5th–6th century CE scribal traditions | MEDIUM | Assessed by two independent paleographers |
| E03 | Linguistic | Vocabulary includes 3 loanwords from a language not attested before 700 CE | HIGH | Lexical analysis by comparative linguist |
| E04 | Material | Ink composition matches recipes documented in 4th century CE sources | MEDIUM | Chemical analysis; recipe comparison is approximate |
| E05 | Provenance | No documented ownership before 2023 | HIGH | Collection records reviewed; gap confirmed |
| E06 | Content | Text references a known historical event dated to 520 CE | MEDIUM | Event identification by historian; reference is indirect |

#### 5.2.3 Interpretations

| ID | Scholar | Claim | Evidence Cited | Reasoning | Confidence |
|----|---------|-------|---------------|-----------|------------|
| I01 | Lab Director | "MS-7 was produced between 320–410 CE, as the radiocarbon dating indicates." | E01 | Scientific: C-14 dating is the most reliable absolute dating method available | HIGH |
| I02 | Paleographer | "The script style suggests 5th–6th century, consistent with the C-14 range." | E02, E01 | Comparative: paleographic dating aligns with scientific dating | MODERATE |
| I03 | Linguist | "The presence of post-700 CE loanwords means the text cannot be earlier than 700 CE, regardless of C-14 results." | E03 | Linguistic: vocabulary provides a terminus post quem that overrides physical dating | HIGH |
| I04 | Historian | "The reference to a 520 CE event places the manuscript's composition after 520 CE." | E06 | Content-based: a text cannot reference an event before it occurred | MODERATE |

#### 5.2.4 Unknowns

| ID | Description | Category | Impact |
|----|-------------|----------|--------|
| U01 | The parchment may be older than the text written on it (reused material) | Methodological | C-14 dates the animal, not the writing; if parchment was reused, the text could be later |
| U02 | The loanwords may have existed in spoken language before being attested in writing | Epistemic gap | The "post-700 CE" terminus may be too late if the words were oral before literary |
| U03 | The manuscript's provenance before 2023 is completely unknown | Missing data | Cannot rule out modern forgery; no chain of custody |
| U04 | The historical event reference may be to a different event with a similar name | Ambiguous | The 520 CE identification is plausible but not certain |

#### 5.2.5 Classification Items (12 statements)

| # | Statement | Classification | Notes |
|---|-----------|---------------|-------|
| 1 | "C-14 dating places the parchment at 320–410 CE with 95% confidence." | E | Laboratory result |
| 2 | "The manuscript was produced in the 4th century CE." | I | Lab Director's interpretation of C-14 data; assumes parchment date = text date |
| 3 | "The script style is consistent with 5th–6th century traditions." | E | Paleographic observation (though its dating implication is interpretive) |
| 4 | "The text contains loanwords not attested before 700 CE." | E | Linguistic observation |
| 5 | "The manuscript must be later than 700 CE because of its vocabulary." | I | Linguist's conclusion from E03; the inference is interpretive |
| 6 | "The parchment could have been reused from an older document." | U | Legitimate methodological concern; not confirmed or ruled out |
| 7 | "The manuscript references a historical event from 520 CE." | I | Historian's identification; the event matching is interpretive |
| 8 | "No ownership records exist before 2023." | E | Verified absence of documentation |
| 9 | "The manuscript is a modern forgery." | U | Cannot be confirmed or ruled out given the provenance gap |
| 10 | "The ink composition matches 4th century recipes." | E | Chemical analysis result |
| 11 | "The paleographic dating confirms the C-14 results." | I | Paleographer's interpretation; "confirms" is a strong claim from consistent but independent evidence |
| 12 | "The loanwords may have been in spoken use before appearing in writing." | U | Plausible but unverified hypothesis |

#### 5.2.6 Feedback Design

**Example feedback for Item 5 ("The manuscript must be later than 700 CE because of its vocabulary"):**

```
You classified this as: INTERPRETATION

Feedback:
- This statement draws a conclusion (date after 700 CE) from an
  observation (loanwords not attested before 700 CE in writing).
- The observation itself (E03) is evidence. The inference about
  dating is interpretation.
- Key distinction: Evidence reports what is observed. Interpretation
  explains what the observation means.
- The linguist's reasoning is valid but not the only possible
  conclusion. If U02 is true (words were oral before literary),
  the terminus post quem may be earlier than 700 CE.
- This scenario illustrates how the same evidence can support
  different interpretations depending on assumptions about
  language transmission.

Process check: Did you separate the observation (loanwords exist)
from the conclusion (therefore the text is post-700 CE)?
```

### 5.3 Scenario 3: "The Witness Account Corroboration"

**Domain:** Fictional testimonial research  
**Research question:** When do two accounts of the same event corroborate each other, and when do discrepancies undermine reliability?  
**Difficulty:** Intermediate (evaluating consistency across sources)

#### 5.3.1 Case Background

Two fictional witnesses (Witness A and Witness B) provided written accounts of the same public event (a community gathering in a fictional town, circa 1960). The accounts were collected independently by different researchers. Some details agree; others conflict.

#### 5.3.2 Source Evidence

| ID | Type | Content | Reliability | Provenance |
|----|------|---------|-------------|------------|
| E01 | Testimony A | "The gathering took place in the town square." | HIGH (direct observation) | Recorded by Researcher 1 in 1985 |
| E02 | Testimony B | "The gathering took place near the river." | HIGH (direct observation) | Recorded by Researcher 2 in 1986 |
| E03 | Testimony A | "Approximately 200 people attended." | MEDIUM (estimate) | Recorded by Researcher 1 in 1985 |
| E04 | Testimony B | "Approximately 300 people attended." | MEDIUM (estimate) | Recorded by Researcher 2 in 1986 |
| E05 | Documentary | A fictional town newspaper reported "a large gathering" but gave no number | MEDIUM (contemporary report) | Newspaper archive, dated one week after event |
| E06 | Testimony A | "The main speaker was a teacher from the neighboring city." | HIGH (direct observation) | Recorded by Researcher 1 in 1985 |
| E07 | Testimony B | "The main speaker was a local farmer." | HIGH (direct observation) | Recorded by Researcher 2 in 1986 |
| E08 | Physical | A photograph exists showing a crowd in an open space; buildings in background are ambiguous | MEDIUM (visual evidence) | Town historical society archive |
| E09 | Testimony A | "The event lasted about three hours, from midday to mid-afternoon." | MEDIUM (estimate) | Recorded by Researcher 1 in 1985 |
| E10 | Testimony B | "The event lasted most of the day." | MEDIUM (estimate) | Recorded by Researcher 2 in 1986 |

#### 5.3.3 Interpretations

| ID | Scholar | Claim | Evidence Cited | Reasoning | Confidence |
|----|---------|-------|---------------|-----------|------------|
| I01 | Researcher 1 | "The accounts substantially corroborate each other. Both describe a large public gathering with a speaker. Minor discrepancies in location and attendance are typical of eyewitness memory." | E01-E10 | Holistic: overall consistency matters more than detail-level agreement | MODERATE |
| I02 | Researcher 2 | "The accounts conflict on key details (location, speaker identity). This undermines their reliability as evidence for what actually occurred." | E01, E02, E06, E07 | Detail-level: specific contradictions on central facts suggest at least one account is unreliable | MODERATE |
| I03 | Methodologist | "Neither account alone is sufficient. The disagreements identify specific points that require additional evidence before conclusions can be drawn." | E01-E07, U01-U03 | Epistemic: disagreement flags uncertainty, not necessarily error | HIGH |

#### 5.3.4 Unknowns

| ID | Description | Category | Impact |
|----|-------------|----------|--------|
| U01 | The town square and the riverbank are 400m apart; the gathering may have been visible from both locations | Geographical ambiguity | Both location claims could be partially true if witnesses observed from different positions |
| U02 | The accounts were recorded 25 years after the event (1985/1986 for a ~1960 event) | Memory decay | Recall accuracy may be reduced; details may have been influenced by intervening narratives |
| U03 | It is unknown whether the two witnesses knew each other or had discussed the event before being interviewed | Independence gap | If witnesses influenced each other, apparent corroboration may be circular |
| U04 | The photograph's location within the town is not documented | Visual evidence gap | Cannot resolve location dispute from photograph alone |

#### 5.3.5 Classification Items (12 statements)

| # | Statement | Classification | Notes |
|---|-----------|---------------|-------|
| 1 | "Witness A stated the gathering was in the town square." | E | Direct report of what Witness A said |
| 2 | "Witness B stated the gathering was near the river." | E | Direct report of what Witness B said |
| 3 | "The gathering actually took place in the town square." | I | Conclusion drawn from selecting one witness over the other |
| 4 | "The two accounts contradict each other on the location." | I | Interpretation of the relationship between E01 and E02; "contradict" is an analytical claim |
| 5 | "Witness A estimated 200 attendees; Witness B estimated 300." | E | Both are reported estimates (E03, E04) |
| 6 | "The actual attendance was approximately 250 people." | I | Averaging two estimates is an interpretive act, not an evidence report |
| 7 | "The newspaper report confirms a large gathering occurred." | E | E05 is a documentary observation |
| 8 | "The newspaper report confirms the gathering was in the town square." | I | The newspaper says "large gathering" but does not specify location; this is an unsupported inference |
| 9 | "The witnesses may have discussed the event before being interviewed." | U | Unknown; independence is not established (U03) |
| 10 | "Witness A's account is more reliable because it was recorded first." | I | Methodological assumption; recording order does not determine reliability |
| 11 | "The photograph shows a crowd but cannot resolve the location dispute." | E | Factual description of what the photograph contains and its limitations |
| 12 | "The disagreements between the witnesses mean neither account can be used." | I | Interpretive conclusion; disagreement reduces confidence but does not automatically invalidate all testimony |

#### 5.3.6 Feedback Design

**Example feedback for Item 4 ("The two accounts contradict each other on the location"):**

```
You classified this as: INTERPRETATION

Feedback:
- This is a subtle case. The raw reports (Witness A says "town
  square"; Witness B says "near the river") are evidence.
- However, the claim that these reports "contradict" each other
  is an analytical conclusion. It depends on assumptions:
  (a) The witnesses meant the same thing by "location"
  (b) The locations are mutually exclusive (they are 400m apart,
      but the gathering might have been visible from both)
  (c) The witnesses were reporting the gathering's location, not
      their own vantage point
- The methodologist (I03) would say: the disagreement identifies
  a point of uncertainty (U01) rather than proving one account wrong.

Process check: Did you distinguish between what the witnesses said
(evidence) and what you conclude about the relationship between
their statements (interpretation)?
```

### 5.4 Scenario 4: "The Translation Debate"

**Domain:** Fictional textual scholarship  
**Research question:** When translators disagree about a term's meaning, is the disagreement about evidence or about interpretation?  
**Difficulty:** Advanced (legitimate scholarly disagreement with no clear resolution)

#### 5.4.1 Case Background

A fictional ancient text (the "Arelion Manuscript," written in a fictional language called Arelionic) contains the term "veluthan" in a passage describing a social practice. Three translators have proposed different renderings. The manuscript is the only known source for this term.

#### 5.4.2 Source Evidence

| ID | Type | Content | Reliability | Provenance |
|----|------|---------|-------------|------------|
| E01 | Lexical | "Veluthan" appears 7 times in the Arelion Manuscript | HIGH | Direct textual observation |
| E02 | Lexical | In 5 of 7 occurrences, "veluthan" appears in contexts describing group activities | HIGH | Textual analysis |
| E03 | Comparative | A related language (Brennic) has the cognate "veluth" meaning "shared obligation" | MEDIUM | Comparative linguistics; relationship between languages is established but not precisely dated |
| E04 | Comparative | Another cognate in the Carenian language means "sacred ceremony" | MEDIUM | Comparative linguistics; Carenian relationship to Arelionic is less well established |
| E05 | Contextual | The passage containing "veluthan" describes people gathering, exchanging goods, and performing actions near a river | HIGH | Direct textual observation |
| E06 | Historical | A later historical document (200 years after the manuscript) references a practice called "veluthani" in what appears to be a legal context | LOW | Temporal gap; meaning may have shifted |
| E07 | Material | The manuscript was written on material consistent with riverine production | MEDIUM | Physical analysis; does not directly date the text |

#### 5.4.3 Interpretations

| ID | Scholar | Claim | Evidence Cited | Reasoning | Confidence |
|----|---------|-------|---------------|-----------|------------|
| I01 | Translator A | "'Veluthan' means 'communal work exchange' — a practical economic arrangement." | E02, E03, E05 | Comparative: Brennic cognate "veluth" = shared obligation; context shows group activity and goods exchange | HIGH |
| I02 | Translator B | "'Veluthan' means 'ritual gathering' — a religious or ceremonial practice." | E02, E04, E05 | Comparative: Carenian cognate = sacred ceremony; context includes actions near a river (possibly ritual) | MODERATE |
| I03 | Translator C | "'Veluthan' cannot be definitively translated. The term may have had multiple meanings depending on context, or its meaning may be lost." | E01, E03, E04, E06 | Epistemic: conflicting cognates and limited evidence mean certainty is unwarranted | HIGH |
| I04 | Historian | "The later reference to 'veluthani' in a legal context suggests the term had juridical significance." | E06 | Historical: later usage may preserve earlier meaning | LOW |

#### 5.4.4 Unknowns

| ID | Description | Category | Impact |
|----|-------------|----------|--------|
| U01 | No bilingual glossary or dictionary of Arelionic exists | Missing resource | All translations are inferential; no independent verification possible |
| U02 | The relationship between Arelionic, Brennic, and Carenian is not precisely established | Linguistic gap | Cognate comparisons may be invalid if the languages diverged before the manuscript was written |
| U03 | Whether "veluthan" had different meanings in different contexts within the manuscript | Semantic gap | A single translation may not capture the term's full range |
| U04 | The 200-year gap between the manuscript and the "veluthani" reference | Temporal gap | Meaning may have shifted significantly; later usage is unreliable evidence for earlier meaning |
| U05 | Whether the riverine setting in the passage is incidental or essential to the practice described | Interpretive gap | Ritual interpretation depends on the river having ceremonial significance |

#### 5.4.5 Classification Items (15 statements)

| # | Statement | Classification | Notes |
|---|-----------|---------------|-------|
| 1 | "The term 'veluthan' appears 7 times in the manuscript." | E | Direct textual count |
| 2 | "'Veluthan' means 'communal work exchange.'" | I | Translator A's conclusion from comparative and contextual evidence |
| 3 | "In 5 of 7 occurrences, 'veluthan' describes group activities." | E | Textual observation |
| 4 | "The Brennic cognate 'veluth' means 'shared obligation.'" | E | Comparative linguistic finding |
| 5 | "The Arelionic term must mean 'shared obligation' because the Brennic cognate does." | I | Inferential leap; cognates can diverge in meaning |
| 6 | "The Carenian cognate means 'sacred ceremony.'" | E | Comparative linguistic finding |
| 7 | "The term 'veluthan' had religious significance." | I | Translator B's interpretation; not established by evidence alone |
| 8 | "No Arelionic dictionary exists." | E | Verified absence of a resource |
| 9 | "The term 'veluthan' cannot be translated with certainty." | I | Translator C's epistemic conclusion; a valid interpretation but still an interpretation |
| 10 | "The later 'veluthani' reference proves the original meaning was legal." | I | Overstatement; later usage is evidence but not proof (E06 reliability is LOW) |
| 11 | "The meaning of 'veluthan' may have changed between the manuscript period and the later reference." | U | Plausible but unverified hypothesis (U04) |
| 12 | "The passage describes people gathering near a river." | E | Direct textual observation (E05) |
| 13 | "The river setting indicates a ritual purpose." | I | Interpretation of E05; depends on assumption U05 |
| 14 | "The relationship between Arelionic and Brennic is well established." | E | This is a stated finding in the comparative linguistics literature (though U02 notes the precision is limited) |
| 15 | "Whether 'veluthan' had different meanings in different contexts is unknown." | U | Direct statement of a knowledge gap (U03) |

#### 5.4.6 Feedback Design

**Example feedback for Item 9 ("The term 'veluthan' cannot be translated with certainty"):**

```
You classified this as: INTERPRETATION

Feedback:
- This is a challenging case. The statement "cannot be translated
  with certainty" sounds like it might be a fact (E) or an
  acknowledgment of unknowns (U).
- However, it is actually an interpretation (I) — specifically,
  Translator C's epistemic judgment about the state of knowledge.
- The distinction: A statement about what we CAN know (or cannot
  know) is an interpretation of our epistemic situation, not a
  direct observation.
- The evidence for this interpretation includes: conflicting cognates
  (E03 vs E04), no dictionary (U01), uncertain language relationships
  (U02), and temporal gaps (U04).
- Another scholar might interpret the same evidence differently:
  "The term CAN be translated, because the contextual evidence is
  strong enough" (Translator A or B's position).

Process check: Did you recognize that statements about the limits
of knowledge are themselves interpretive claims, not raw evidence?
```

### 5.5 Scenario 5: "The Underdetermined Artifact"

**Domain:** Fictional material culture  
**Research question:** What happens when evidence is insufficient to support any confident conclusion?  
**Difficulty:** Expert (genuine underdetermination; all interpretations are speculative)

#### 5.5.1 Case Background

A fictional artifact (the "Tessera of Melinthos") was discovered in a fictional excavation site in 2025. The artifact is a small clay disc (8cm diameter) with markings on both sides. The excavation context has been disturbed by modern construction activity. Multiple interpretations have been proposed, but the evidence is insufficient to distinguish among them.

#### 5.5.2 Source Evidence

| ID | Type | Content | Reliability | Provenance |
|----|------|---------|-------------|------------|
| E01 | Physical | Clay disc, 8cm diameter, 1.5cm thick, fired at low temperature | HIGH | Measured by excavation team |
| E02 | Visual | One side has 6 incised marks arranged in a circular pattern | HIGH | Photographed and documented |
| E03 | Visual | Other side has 3 parallel lines and a dot pattern | HIGH | Photographed and documented |
| E04 | Contextual | Found in a layer disturbed by modern construction; original stratigraphic position unknown | HIGH | Excavation report notes the disturbance |
| E05 | Comparative | Similar clay discs at 2 other sites have been interpreted as gaming pieces | LOW | Only 2 comparison sites; functional identification is uncertain |
| E06 | Comparative | Similar circular markings appear on known astronomical instruments from a different region | LOW | Geographic and temporal distance; similarity is superficial |
| E07 | Material | Clay composition is local to the excavation region | MEDIUM | Geological analysis |
| E08 | Dating | Thermoluminescence dating yields 800 BCE +/- 200 years | MEDIUM | Wide error range; TL dating of low-fired clay has known accuracy issues |

#### 5.5.3 Interpretations

| ID | Scholar | Claim | Evidence Cited | Reasoning | Confidence |
|----|---------|-------|---------------|-----------|------------|
| I01 | Archaeologist A | "The disc is a gaming piece, similar to those found at other sites." | E01, E02, E05 | Comparative: physical similarity to known gaming pieces | LOW |
| I02 | Archaeologist B | "The disc is an astronomical calculator or calendar." | E02, E03, E06 | Symbolic: circular markings and parallel lines resemble known instruments | LOW |
| I03 | Archaeologist C | "The disc is a votive or ritual object. The markings may have symbolic meaning." | E02, E03, E07 | Contextual: local clay suggests local production; markings may be non-functional | LOW |
| I04 | Methodologist | "The evidence is insufficient to determine the disc's function. The disturbed context (E04) means we cannot use stratigraphic association to narrow possibilities." | E01-E08, U01-U04 | Epistemic: all interpretations are speculative given the evidence | HIGH (that the evidence is insufficient) |

#### 5.5.4 Unknowns

| ID | Description | Category | Impact |
|----|-------------|----------|--------|
| U01 | Original stratigraphic position is unknown due to modern disturbance | Context loss | Cannot date the disc by association with other artifacts in the same layer |
| U02 | The markings have not been decoded or compared to a comprehensive symbol database | Analytical gap | No way to determine whether marks are functional (game notation), symbolic (ritual), or decorative |
| U03 | No residue analysis has been performed | Missing analysis | Cannot determine whether the disc was used with a board (wear patterns), handled frequently (oils), or placed in a specific context (residues) |
| U04 | The +/- 200 year dating error means the disc could be from any period between 1000–600 BCE | Chronological uncertainty | Too broad to compare with period-specific artifact typologies |
| U05 | Only 2 comparison sites exist for similar discs | Sample limitation | Comparative evidence is too thin to establish a pattern |

#### 5.5.5 Classification Items (12 statements)

| # | Statement | Classification | Notes |
|---|-----------|---------------|-------|
| 1 | "The disc is 8cm in diameter and made of locally sourced clay." | E | Physical measurement and material analysis |
| 2 | "The disc was used for gaming." | I | Archaeologist A's interpretation; not established by evidence |
| 3 | "The circular markings resemble those on known astronomical instruments." | E | Comparative observation (E06); though the significance of the resemblance is interpretive |
| 4 | "The disc is an astronomical calculator." | I | Archaeologist B's interpretation; goes beyond the visual resemblance |
| 5 | "The original excavation layer is unknown." | E | Factual statement about the disturbed context (E04) |
| 6 | "The disc cannot be dated more precisely than 1000–600 BCE." | E | Factual consequence of the dating error range (E08, U04) |
| 7 | "The markings on the disc have symbolic meaning." | I | Archaeologist C's interpretation; not established by evidence |
| 8 | "The evidence is insufficient to determine the disc's function." | I | Methodologist's conclusion; this is an interpretive judgment about the state of knowledge |
| 9 | "No residue analysis has been performed on the disc." | E | Verified absence of analysis |
| 10 | "The disc was probably a ritual object because similar objects in other cultures were ritual." | I | Argument from analogy; "probably" makes this an interpretive claim |
| 11 | "Whether the markings are functional, symbolic, or decorative is unknown." | U | Statement of a genuine knowledge gap (U02) |
| 12 | "The disc's purpose will never be known." | I | Overstatement; future evidence (new comparisons, new methods) could resolve the question |

#### 5.5.6 Feedback Design

**Example feedback for Item 8 ("The evidence is insufficient to determine the disc's function"):**

```
You classified this as: INTERPRETATION

Feedback:
- This is one of the most challenging classification types: a
  meta-statement about the state of knowledge itself.
- The statement "the evidence is insufficient" is not a raw
  observation (E). It is a conclusion drawn from reviewing all
  the evidence and finding it inadequate — which makes it an
  interpretation (I).
- The Methodologist arrives at this interpretation by process of
  elimination: each specific interpretation (gaming piece,
  astronomical tool, ritual object) relies on evidence that is
  either weak (LOW reliability) or absent (UNKNOWN gaps).
- This is different from an UNKNOWN (U). An unknown is a specific
  gap: "we don't know X." An interpretation about insufficiency
  is a judgment about the overall evidential situation.

Key learning point: Statements about what the evidence can or
cannot support are themselves interpretive claims. They require
reasoning, not just observation. Recognizing this is a core
reviewer skill.

Process check: Did you distinguish between "we don't know the
answer" (U) and "the evidence is not good enough to answer the
question" (I about evidential sufficiency)?
```

---

## 6. Training Rubric

### 6.1 Competency Framework

The rubric assesses 6 dimensions of reviewer classification competency. Each dimension has 4 levels.

#### Dimension 1: Evidence Recognition (ER)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Cannot distinguish evidence from other statement types; classifies interpretations as evidence | Consistently misclassifies I as E |
| 2 | Developing | Recognizes direct observations as evidence but confuses reported findings with raw data | Classifies E correctly when unambiguous; struggles with borderline cases |
| 3 | Proficient | Correctly identifies evidence including borderline cases; understands that observations are theory-neutral only in principle | Classifies E, I, U with >= 80% accuracy |
| 4 | Expert | Recognizes evidence, identifies when a statement that appears to be evidence actually contains an interpretive component, and explains why | Handles all cases including meta-statements about evidence quality |

#### Dimension 2: Interpretation Identification (II)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Treats all conclusions as facts; cannot identify reasoning steps | Classifies I as E consistently |
| 2 | Developing | Identifies obvious interpretations but misses subtle ones (e.g., meta-statements about evidence quality) | Classifies direct I correctly; misses borderline I |
| 3 | Proficient | Identifies interpretations including those disguised as factual statements; recognizes inferential language | Classifies I with >= 75% accuracy across all scenarios |
| 4 | Expert | Distinguishes between strong and weak interpretations; identifies when an interpretation is well-supported vs. speculative without conflating support with factuality | Handles all I cases and explains reasoning |

#### Dimension 3: Uncertainty Awareness (UA)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Treats all unknowns as either evidence or interpretation; does not recognize knowledge gaps | Never classifies U correctly |
| 2 | Developing | Recognizes explicit unknowns ("we don't know") but misses implicit unknowns (gaps in evidence that are not stated) | Classifies explicit U correctly; misses implicit U |
| 3 | Proficient | Identifies both explicit and implicit unknowns; distinguishes "unknown" from "unknowable" | Classifies U with >= 70% accuracy |
| 4 | Expert | Recognizes that statements about insufficiency are themselves interpretations, not unknowns; identifies the boundary between U and I in difficult cases | Handles all U cases including meta-epistemic statements |

#### Dimension 4: Source Reliability Assessment (SR)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Treats all sources as equally reliable; does not consider provenance | No differentiation in handling HIGH vs LOW reliability evidence |
| 2 | Developing | Recognizes obvious reliability differences (laboratory result vs. oral tradition) but applies labels inconsistently | Differentiates HIGH/LOW when差距 is large; inconsistent on MEDIUM |
| 3 | Proficient | Consistently applies reliability labels; understands that reliability affects weight, not validity | Uses reliability to calibrate confidence in classifications |
| 4 | Expert | Identifies when reliability labels themselves are interpretive (e.g., "HIGH reliability" depends on methodological assumptions) | Questions reliability assessments when appropriate |

#### Dimension 5: Multi-Perspective Recognition (MP)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Assumes one interpretation is correct; seeks the "right answer" | Rejects alternative interpretations without engagement |
| 2 | Developing | Acknowledges multiple interpretations exist but privileges one as "most likely" without sufficient evidence | Identifies alternatives but ranks them by personal preference |
| 3 | Proficient | Treats multiple interpretations as legitimate when supported by different evidence or reasoning; does not force consensus | Engages with all interpretations on their own terms |
| 4 | Expert | Identifies the specific evidence and reasoning that distinguish interpretations; explains why disagreement persists and what evidence would resolve it | Maps the disagreement structure completely |

#### Dimension 6: Process Reflection (PR)

| Level | Label | Description | Indicator |
|-------|-------|-------------|-----------|
| 1 | Novice | Cannot explain reasoning for classifications; decisions are intuitive | No metacognitive awareness |
| 2 | Developing | Can explain reasoning but does not identify assumptions or alternative approaches | Articulates reasoning but not its limits |
| 3 | Proficient | Explains reasoning, identifies assumptions, and considers alternative classifications for borderline cases | Demonstrates awareness of reasoning process |
| 4 | Expert | Reflects on the classification process itself; identifies systematic biases in own reasoning; adjusts approach based on feedback | Metacognitive mastery |

### 6.2 Scoring Method

Each scenario is scored on all 6 dimensions. The scoring uses a 3-point scale per item:

| Score | Label | Meaning |
|-------|-------|---------|
| 2 | Correct | Classification matches the expected answer OR the learner provides a defensible alternative classification with explanation |
| 1 | Partial | Classification is defensible but the learner did not recognize the ambiguity or provide explanation |
| 0 | Incorrect | Classification is not defensible given the evidence |

**Dimension score** = sum of item scores for items testing that dimension / maximum possible score for those items

**Overall score** = weighted average of 6 dimension scores (equal weights)

**Competency level** = highest level achieved on >= 4 of 6 dimensions

### 6.3 Rubric Application Protocol

1. **Before the first scenario:** Administer pre-test (5 classification items from a practice scenario not used in training)
2. **After each scenario:** Score the learner's classifications; provide process feedback (not correctness feedback for ambiguous items)
3. **After all 5 scenarios:** Administer post-test (5 new classification items at mixed difficulty)
4. **Calculate improvement:** Post-test score minus pre-test score on each dimension
5. **Identify persistent misconceptions:** Dimensions where improvement is < 1 level after training
6. **Generate learner report:** Summary of competency profile, areas of strength, areas for further development

---

## 7. Prototype Interface Design

### 7.1 Screen Layout Overview

The simulator consists of 5 screens accessed sequentially:

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVIGATION FLOW                                                 │
│                                                                  │
│  [Welcome] → [Scenario Briefing] → [Classification Task] →      │
│  [Feedback] → [Progress Summary] → [Next Scenario] → ... →      │
│  [Final Summary]                                                 │
│                                                                  │
│  All screens include a persistent header with:                   │
│  - Simulator title                                               │
│  - Disclaimer: "This is a training exercise. No credentials      │
│    are issued. No decisions are stored."                         │
│  - Scenario counter (e.g., "Scenario 2 of 5")                   │
│  - Accessibility controls (text size, contrast, keyboard help)   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Screen 1: Welcome

```
┌─────────────────────────────────────────────────────────────────┐
│  SYNTHETIC REVIEWER TRAINING SIMULATOR                           │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  PURPOSE:                                                        │
│  This is a training exercise to help you practice distinguishing │
│  between evidence, interpretation, and unknowns in source        │
│  material.                                                       │
│                                                                  │
│  IMPORTANT:                                                      │
│  - This simulator does NOT grant reviewer authority              │
│  - No decisions you make here are stored or used elsewhere       │
│  - This is NOT a certification or qualification assessment       │
│  - All scenarios use fictional data; no real cases are included  │
│                                                                  │
│  WHAT TO EXPECT:                                                 │
│  - 5 scenarios of increasing difficulty                          │
│  - Each scenario takes 15-25 minutes                             │
│  - You will classify statements as Evidence, Interpretation,     │
│    or Unknown                                                    │
│  - You will receive feedback on your reasoning process           │
│  - Your progress is tracked only during this session             │
│                                                                  │
│  [Begin Training]                                                │
│                                                                  │
│  Accessibility: [A+] Increase text  [A-] Decrease text           │
│  [?] Keyboard shortcuts                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Screen 2: Scenario Briefing

```
┌─────────────────────────────────────────────────────────────────┐
│  SCENARIO 1: The Coastal Settlement Inscription                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  BACKGROUND:                                                     │
│  [Scenario background text appears here — 2-3 paragraphs         │
│   describing the fictional setting and research question]        │
│                                                                  │
│  YOUR TASK:                                                      │
│  Read the background and source materials below. Then classify   │
│  each statement as one of:                                       │
│                                                                  │
│  [E] EVIDENCE — A verifiable observation from a source           │
│  [I] INTERPRETATION — A conclusion drawn from evidence           │
│  [U] UNKNOWN — A gap in available information                    │
│                                                                  │
│  SOURCE MATERIALS:                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Evidence Table    │ Interpretations │ Unknowns           │    │
│  │ (scrollable)      │ (scrollable)    │ (scrollable)       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  KEY TERMS (hover for definition):                               │
│  [Evidence] [Interpretation] [Unknown] [Reliability] [Weight]    │
│                                                                  │
│  [Start Classification Tasks →]                                  │
│                                                                  │
│  Estimated time: 15-20 minutes | Difficulty: Introductory        │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Screen 3: Classification Task

```
┌─────────────────────────────────────────────────────────────────┐
│  SCENARIO 1 — Classification Task 3 of 12                       │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  STATEMENT:                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ "Only 12 of an estimated 30 characters are readable."   │    │
│  │                                                         │    │
│  │ Classify this statement:                                │    │
│  │                                                         │    │
│  │  [E] EVIDENCE     [I] INTERPRETATION    [U] UNKNOWN    │    │
│  │                                                         │    │
│  │  (Optional) Explain your reasoning:                     │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │ [Text area — max 200 characters]                 │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PROGRESS:                                                       │
│  [✓] [✓] [→] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]              │
│   1   2   3   4   5   6   7   8   9  10  11  12               │
│                                                                  │
│  REFERENCE (collapsible):                                        │
│  ▼ Source Materials | ▼ Key Terms | ▼ Example Classifications   │
│                                                                  │
│  [Submit] [Skip — I'm not sure]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Screen 4: Feedback

```
┌─────────────────────────────────────────────────────────────────┐
│  FEEDBACK — Task 3 of 12                                        │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  YOUR CLASSIFICATION: [E] EVIDENCE                               │
│  EXPECTED: [E] EVIDENCE                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ FEEDBACK:                                               │    │
│  │                                                         │    │
│  │ This statement reports a measurable fact about the      │    │
│  │ tablet's condition — 12 characters are readable out of  │    │
│  │ an estimated 30. It is a direct observation, not a      │    │
│  │ conclusion drawn from observations.                      │    │
│  │                                                         │    │
│  │ Note: The "estimated 30" part involves some             │    │
│  │ interpretation (the total must be inferred from the     │    │
│  │ visible portion and damage pattern). However, the       │    │
│  │ statement as a whole reports what is observed, so       │    │
│  │ EVIDENCE is the appropriate classification.             │    │
│  │                                                         │    │
│  │ Process check: You correctly identified this as a       │    │
│  │ direct observation. In future items, ask yourself:      │    │
│  │ "Does this statement report what is observed, or does   │    │
│  │  it draw a conclusion from what is observed?"           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  YOUR REASONING (if provided):                                   │
│  "This is a factual count of readable characters."               │
│  → This reasoning is consistent with the EVIDENCE classification │
│                                                                  │
│  [Next Task →]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Screen 5: Progress Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  PROGRESS SUMMARY — After Scenario 1 of 5                       │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  SCENARIO: The Coastal Settlement Inscription                    │
│  DIFFICULTY: Introductory                                        │
│                                                                  │
│  YOUR SCORE:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Dimension                    │ Score  │ Level            │    │
│  │──────────────────────────────│────────│──────────────────│    │
│  │ Evidence Recognition         │  8/10  │ Proficient       │    │
│  │ Interpretation Identification│  6/10  │ Developing       │    │
│  │ Uncertainty Awareness        │  5/8   │ Developing       │    │
│  │ Source Reliability Assessment│  4/6   │ Developing       │    │
│  │ Multi-Perspective Recognition│  3/6   │ Novice           │    │
│  │ Process Reflection           │  4/6   │ Developing       │    │
│  │──────────────────────────────│────────│──────────────────│    │
│  │ OVERALL                      │ 30/46  │ Developing       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  STRENGTHS:                                                      │
│  - You correctly identified direct observations as evidence      │
│  - You recognized when statements reported measurable facts      │
│                                                                  │
│  AREAS FOR DEVELOPMENT:                                          │
│  - Distinguishing interpretation from evidence in borderline     │
│    cases (e.g., when a statement contains both observation and   │
│    conclusion)                                                   │
│  - Recognizing knowledge gaps as a distinct category (UNKNOWN)   │
│  - Considering multiple perspectives before classifying          │
│                                                                  │
│  NEXT SCENARIO: "The Disputed Manuscript Dating"                 │
│  Difficulty: Intermediate | New challenge: Conflicting evidence  │
│                                                                  │
│  [Continue to Scenario 2 →]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 7.7 Screen 6: Final Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  TRAINING COMPLETE — Final Summary                               │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  REMINDER: This is a training exercise. No credentials are       │
│  issued. No decisions are stored. This summary exists only       │
│  during this session and will be cleared when you close the      │
│  simulator.                                                      │
│                                                                  │
│  OVERALL COMPETENCY PROFILE:                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Dimension                    │ Pre  │ Post │ Change      │    │
│  │──────────────────────────────│──────│──────│─────────────│    │
│  │ Evidence Recognition         │  5   │  8   │ +3          │    │
│  │ Interpretation Identification│  4   │  7   │ +3          │    │
│  │ Uncertainty Awareness        │  3   │  6   │ +3          │    │
│  │ Source Reliability Assessment│  4   │  6   │ +2          │    │
│  │ Multi-Perspective Recognition│  3   │  5   │ +2          │    │
│  │ Process Reflection           │  3   │  6   │ +3          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PRE-TEST SCORE:  22/46 (Developing)                             │
│  POST-TEST SCORE: 38/46 (Proficient)                             │
│  IMPROVEMENT:     +16 points (+73%)                              │
│                                                                  │
│  PERSISTENT MISCONCEPTIONS (improvement < 1 level):              │
│  - Multi-Perspective Recognition: still developing               │
│  - Source Reliability Assessment: still developing               │
│                                                                  │
│  RECOMMENDED NEXT STEPS:                                         │
│  - Practice identifying cases where multiple interpretations     │
│    are equally valid                                             │
│  - Review how source reliability affects the weight of evidence  │
│  - Revisit Scenarios 3 and 4 for additional practice             │
│                                                                  │
│  [Download Session Summary (JSON)] [Clear All Data & Exit]       │
│                                                                  │
│  Note: Downloaded summary contains only your classification      │
│  scores. No personal data is included. The file is stored        │
│  locally and is not transmitted anywhere.                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Scenario Branching Logic

### 8.1 Adaptive Difficulty Model

The simulator uses a simple adaptive branching model that adjusts scenario presentation based on learner performance. The model does NOT use machine learning or external services — it is a rule-based system operating on local state.

### 8.2 Branching Rules

```
RULE 1: SEQUENTIAL PROGRESSION (Default)
  Scenarios are presented in order: S1 → S2 → S3 → S4 → S5.
  Each scenario has a fixed difficulty level.

RULE 2: REMEDIATION BRANCH
  IF learner scores < 50% on any dimension in Scenario N:
    THEN present a supplementary mini-scenario (S_N_remediation)
    before proceeding to Scenario N+1.
    The mini-scenario targets the weak dimension specifically.
    After the mini-scenario, proceed to Scenario N+1 normally.

RULE 3: ACCELERATION BRANCH
  IF learner scores >= 90% on ALL dimensions in Scenario N:
    THEN skip Scenario N+1 (same difficulty level) and proceed
    to Scenario N+2 (next higher difficulty level).
    This prevents redundant practice at a mastered level.

RULE 4: REPEAT BRANCH
  IF learner scores < 30% on the overall score in Scenario N:
    THEN offer the option to repeat Scenario N with a different
    set of classification items (same case, different questions).
    If learner declines, proceed to Scenario N+1 with a warning
    that the next scenario builds on the same skills.

RULE 5: FINAL ASSESSMENT
  After all scenarios (including any remediation/acceleration
  branches), present a final assessment of 10 mixed-difficulty
  items drawn from all 5 scenarios.
  Final assessment determines the post-test competency profile.
```

### 8.3 Branching Diagram

```
                    ┌──────────┐
                    │  Pre-Test │
                    │  (5 items)│
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │Scenario 1│ (Introductory)
                    │ (12 items)│
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         < 50% on    50-89%     > 90% on
         any dim     overall     all dims
              │          │          │
        ┌─────▼────┐ ┌──▼───┐ ┌───▼────┐
        │Remediation│ │  →   │ │ Skip   │
        │mini-scen. │ │ S2   │ │ to S3  │
        └─────┬────┘ └──┬───┘ └───┬────┘
              │          │          │
              └──────────┼──────────┘
                         │
                    ┌────▼─────┐
                    │Scenario 2│ (Intermediate)
                    │ (12 items)│
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         < 50% on    50-89%     > 90% on
         any dim     overall     all dims
              │          │          │
        ┌─────▼────┐ ┌──▼───┐ ┌───▼────┐
        │Remediation│ │  →   │ │ Skip   │
        │mini-scen. │ │ S3   │ │ to S4  │
        └─────┬────┘ └──┬───┘ └───┬────┘
              │          │          │
              └──────────┼──────────┘
                         │
                    ┌────▼─────┐
                    │Scenario 3│ (Intermediate)
                    │ (12 items)│
                    └────┬─────┘
                         │
                         │ (same branching logic)
                         │
                    ┌────▼─────┐
                    │Scenario 4│ (Advanced)
                    │ (15 items)│
                    └────┬─────┘
                         │
                         │ (same branching logic)
                         │
                    ┌────▼─────┐
                    │Scenario 5│ (Expert)
                    │ (12 items)│
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Post-Test │
                    │ (10 items)│
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Final   │
                    │ Summary  │
                    └──────────┘
```

### 8.4 Remediation Mini-Scenario Design

When a learner triggers the remediation branch, a mini-scenario is generated targeting the weak dimension:

| Weak Dimension | Mini-Scenario Focus | Example Task |
|----------------|---------------------|--------------|
| Evidence Recognition | Distinguishing observations from conclusions | "Classify 5 statements from a simple scenario where the E/I distinction is clear" |
| Interpretation Identification | Recognizing inferential language | "Identify which of 5 statements contain interpretive claims (look for: 'therefore', 'suggests', 'probably')" |
| Uncertainty Awareness | Identifying knowledge gaps | "For each of 5 statements, decide: is this unknown, or is this an interpretation about what is unknown?" |
| Source Reliability Assessment | Calibrating confidence by source quality | "Given 3 sources with different reliability labels, which conclusion is best supported?" |
| Multi-Perspective Recognition | Engaging with competing interpretations | "Read 2 interpretations of the same evidence. What evidence does each cite? Can both be valid?" |
| Process Reflection | Metacognitive awareness | "Explain why you classified each of 3 statements the way you did. What assumptions did you make?" |

### 8.5 State Management

All branching state is maintained in memory only. No state is persisted to disk, localStorage, or any server. When the simulator is closed, all state is cleared.

```typescript
type SimulatorState = {
  currentScenario: number           // 1-5
  currentItem: number               // index within scenario
  dimensionScores: number[6]        // running scores per dimension
  preTestScore: number              // 0-10 (5 items, 2 points each)
  postTestScore: number             // 0-20 (10 items, 2 points each)
  remediationCompleted: boolean[6]  // whether remediation was done per dimension
  scenariosSkipped: number[]        // indices of skipped scenarios (acceleration)
  branchHistory: BranchEvent[]      // log of branching decisions made
}

type BranchEvent = {
  scenario: number
  trigger: 'remediation' | 'acceleration' | 'repeat' | 'normal'
  dimension?: number               // which dimension triggered remediation
  timestamp: string                // ISO 8601, session-local only
}
```

---

## 9. Feedback Mechanisms

### 9.1 Feedback Taxonomy

The simulator provides 4 types of feedback, each serving a distinct pedagogical purpose:

| Type | When | Purpose | Example |
|------|------|---------|---------|
| **Confirmatory** | Learner's classification matches expected answer | Reinforce correct reasoning | "Your classification is consistent with treating this as a direct observation." |
| **Corrective** | Learner's classification does not match expected answer AND the expected answer is unambiguous | Redirect reasoning | "This statement contains a conclusion ('therefore') drawn from evidence. That makes it an interpretation, not evidence." |
| **Exploratory** | Learner's classification is one of multiple defensible answers | Expand awareness of ambiguity | "You classified this as Evidence. Another defensible classification is Interpretation, because [reason]. Both are valid — the key is recognizing the boundary." |
| **Metacognitive** | After every 3-4 items | Prompt reflection on reasoning process | "So far, you have classified 8 statements. How many did you hesitate on? Hesitation often signals a borderline case worth examining." |

### 9.2 Feedback Generation Rules

**Rule 1: Never say "correct" or "wrong" for ambiguous items.**  
For items where multiple classifications are defensible, feedback uses language like "consistent with," "defensible," or "another valid approach."

**Rule 2: Always explain the reasoning, not just the answer.**  
Every feedback response includes:
- What category the statement falls into and why
- What evidence or reasoning supports the classification
- What alternative classifications exist (if any)
- What process question the learner should ask themselves

**Rule 3: Reference specific scenario materials.**  
Feedback always cites the evidence items (E01, E02, etc.), interpretations (I01, I02, etc.), or unknowns (U01, U02, etc.) from the current scenario. This grounds abstract classification in concrete case materials.

**Rule 4: Track cumulative patterns.**  
After every 3-4 items, feedback includes a brief pattern observation:
- "You have classified 4 of the last 5 items as Evidence. Consider whether some might contain interpretive components."
- "You have not classified any items as Unknown. Remember that gaps in knowledge are a distinct category."

**Rule 5: Separate process from content.**  
Feedback addresses the learner's classification process (how they decided), not just the classification outcome (what they decided). This reinforces metacognitive skill.

### 9.3 Feedback Examples by Scenario

**Scenario 1, Item 7 ("The settlement was primarily a trading post"):**

```
You classified this as: EVIDENCE

Feedback:
- This statement is an INTERPRETATION, not evidence.
- The evidence (E04: ceramic findings, E03: location data) supports
  the possibility that the settlement was a trading post. But
  "primarily a trading post" is a conclusion drawn from that evidence,
  not the evidence itself.
- The settlement could also have been primarily a military outpost,
  a religious center, or a residential community with some trade.
  Each of these is a different interpretation of the same evidence.
- Key distinction: Evidence reports what is observed (ceramics,
  location, dimensions). Interpretation explains what the evidence
  means (therefore it was a trading post).

Process check: Did you treat a plausible conclusion as an established
fact? This is a common tendency — when an interpretation feels
obvious, it can be hard to see that it is still an interpretation.
```

**Scenario 3, Item 8 ("The newspaper report confirms the gathering was in the town square"):**

```
You classified this as: EVIDENCE

Feedback:
- This statement is an INTERPRETATION. Let us break it down:
- Part 1: "The newspaper report mentions a large gathering" — this
  IS evidence (E05 reports a large gathering without specifying location).
- Part 2: "confirms the gathering was in the town square" — this
  goes beyond what the newspaper actually says. The newspaper does
  not specify location.
- The statement combines an evidence report (Part 1) with an
  unsupported inference (Part 2). When a statement mixes evidence
  and interpretation, classify it by its weakest component — in
  this case, the interpretive leap makes the whole statement I.

Process check: Did you focus on the part that references a source
(the newspaper) and treat the whole statement as evidence? Watch
for statements that cite a source but add a conclusion the source
does not support.
```

### 9.4 Misconception Tracking

The simulator tracks 6 common misconceptions and provides targeted feedback when each is detected:

| ID | Misconception | Detection Pattern | Targeted Feedback |
|----|--------------|-------------------|-------------------|
| M1 | "If it sounds factual, it is evidence" | Classifying I as E when the statement uses factual language | "Factual language does not make a statement evidence. Ask: is this an observation, or a conclusion drawn from observations?" |
| "If an expert said it, it is evidence" | Classifying I as E when attributed to a scholar | "Even experts make interpretations. When Dr. A says 'the inscription records a transaction,' that is Dr. A's interpretation of evidence, not the evidence itself." |
| "If it is unknown, it is evidence" | Classifying U as E when the statement describes missing information | "A statement about what we do NOT know is different from a statement about what we DO observe. 'We have no data on X' is evidence about the state of knowledge. 'X is unknown' is an acknowledgment of a gap." |
| "Multiple witnesses mean it is evidence" | Classifying I as E when supported by multiple sources | "Multiple sources can agree on an interpretation. That does not make the interpretation into evidence — it makes it a well-supported interpretation. The distinction between evidence and interpretation is about the type of statement, not the amount of support." |
| "If it is probably true, it is evidence" | Classifying I as E when the statement is likely correct | "Probability does not determine category. A statement can be probably true and still be an interpretation. Evidence is what we observe; interpretation is what we conclude from observations." |
| "Uncertainty means I should classify it as Unknown" | Over-classifying U for any statement that is not 100% certain | "Not all uncertain statements are Unknowns. If a statement draws a conclusion from evidence, it is an Interpretation — even if the conclusion is uncertain. Unknown is reserved for specific gaps in available information." |

---

## 10. Cultural Bias Review Framework

### 10.1 Bias Categories

The framework identifies 8 categories of cultural bias that could affect scenario design:

| ID | Category | Description | Example of Bias | Mitigation |
|----|----------|-------------|-----------------|------------|
| B1 | **Cultural Specificity** | Scenarios that use cultural elements from only one tradition, making that tradition the "default" | All examples use Western archaeological methods | Include diverse fictional cultures; use neutral archaeological settings |
| B2 | **Religious Privileging** | Scenarios that implicitly treat one religious tradition's interpretive methods as standard | Using only Christian biblical hermeneutics examples | Use fictional religions; include multiple interpretive traditions in each scenario |
| B3 | **Linguistic Hierarchy** | Scenarios where one language is treated as more "scholarly" or "precise" than others | Describing Arabic sources as "original" and translations as "derivative" | Use fictional languages; treat all source languages as equally valid |
| B4 | **Geographic Centrism** | Scenarios set primarily in one geographic region, marginalizing others | All archaeological sites are in the Mediterranean | Set scenarios in fictional regions drawn from diverse geographic templates |
| B5 | **Temporal Bias** | Scenarios that privilege modern analytical methods over historical ones | Treating radiocarbon dating as inherently more valid than paleographic analysis | Present multiple dating methods as complementary; show strengths and limitations of each |
| B6 | **Authority Bias** | Scenarios where scholars from prestigious institutions are treated as more credible | Citing "Professor at Oxford" vs. "independent researcher" | Use fictional scholars with equal-status attributions; hide institutional prestige |
| B7 | **Interpretive Monism** | Scenarios that present one interpretation as obviously correct | Providing a "right answer" for classification of ambiguous statements | Design all scenarios with multiple defensible classifications; no single correct answer for ambiguous items |
| B8 | **Terminology Load** | Using terms that carry ideological or theological weight | Describing an interpretation as "orthodox" vs. "heterodox" | Use neutral terminology throughout; define technical terms explicitly |

### 10.2 Bias Review Protocol

Each scenario undergoes a 5-step bias review before inclusion:

**Step 1: Cultural Origin Audit**  
Identify all cultural, religious, linguistic, and geographic elements in the scenario. Verify that:
- No real cultural or religious tradition is directly represented
- Fictional elements are drawn from diverse templates
- No single tradition is implicitly privileged

**Step 2: Terminology Audit**  
Scan all text for loaded terms. Verify that:
- No theological terminology is used (e.g., "orthodox," "heretical," "authentic")
- No cultural hierarchy is implied (e.g., "original" vs. "derivative")
- Technical terms are defined on first use

**Step 3: Authority Distribution Audit**  
List all scholars, researchers, and institutions mentioned. Verify that:
- No real institutions are named
- Fictional scholars have diverse (fictional) backgrounds
- No scholar is presented as inherently more credible based on title or affiliation

**Step 4: Interpretive Balance Audit**  
For each scenario, list all interpretations presented. Verify that:
- At least 2 distinct interpretations are included
- No interpretation is presented as obviously correct
- The evidence cited for each interpretation is genuinely ambiguous

**Step 5: Reviewer Sign-Off**  
A content reviewer (independent of the scenario designer) completes a bias checklist:
- [ ] No real cultural/religious tradition is represented
- [ ] No terminology carries ideological load
- [ ] Multiple interpretations are presented with equal status
- [ ] Fictional scholars have diverse backgrounds
- [ ] Scenarios are accessible to learners from any cultural background
- [ ] No assumption of prior cultural or religious knowledge is required

### 10.3 Bias Review of Current Scenarios

| Scenario | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | Status |
|----------|----|----|----|----|----|----|----|----|--------|
| S1: Coastal Settlement | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Approved |
| S2: Disputed Manuscript | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Approved |
| S3: Witness Account | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Approved |
| S4: Translation Debate | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Approved |
| S5: Underdetermined Artifact | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Approved |

**Notes:**
- All scenarios use fictional cultures, languages, and geographic settings
- No real religious texts or traditions are referenced
- Fictional scholars have diverse (fictional) institutional backgrounds
- All scenarios present multiple interpretations without privileging any
- Terminology is neutral and defined on first use
- Scenarios require no prior cultural or religious knowledge

### 10.4 Ongoing Bias Monitoring

After implementation, the following monitoring processes are recommended:

1. **Learner feedback collection:** After each session, learners are asked whether any scenario felt culturally biased or exclusionary (via the consent-preserving feedback mechanism from M47-29)
2. **Annual review:** Scenarios are reviewed annually by a diverse panel for emerging bias concerns
3. **Revision protocol:** If bias is identified, the affected scenario is revised or replaced within 30 days
4. **Transparency:** All bias review reports are published alongside the simulator

---

## 11. Comprehension Evaluation Methodology

### 11.1 Evaluation Design

The comprehension evaluation uses a **pre/post-test design** with embedded process measurement:

```
┌─────────────────────────────────────────────────────────────────┐
│  EVALUATION TIMELINE                                             │
│                                                                  │
│  Phase 1: PRE-TEST (before any training)                         │
│  - 5 classification items from a practice scenario               │
│  - Scored on all 6 dimensions                                    │
│  - Establishes baseline competency                               │
│                                                                  │
│  Phase 2: TRAINING (5 scenarios with feedback)                   │
│  - Classification tasks with process feedback                    │
│  - Dimension scores tracked per scenario                         │
│  - Branching logic adapts to learner performance                 │
│                                                                  │
│  Phase 3: POST-TEST (after all training)                         │
│  - 10 classification items at mixed difficulty                   │
│  - Scored on all 6 dimensions                                    │
│  - Measures learning gain                                        │
│                                                                  │
│  Phase 4: DELAYED POST-TEST (recommended, not implemented        │
│           in initial prototype)                                   │
│  - Same as post-test, administered 2-4 weeks later               │
│  - Measures retention                                            │
│  - Requires session persistence (currently deferred)             │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Primary Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Classification Accuracy** | Percentage of items correctly classified (E, I, or U) | >= 80% on post-test | Score each item as 2/1/0; sum / maximum |
| **Dimension Improvement** | Pre-test to post-test gain on each of the 6 dimensions | >= 1 level improvement on at least 4 of 6 dimensions | Compare pre/post dimension scores |
| **Misconception Reduction** | Decrease in frequency of the 6 tracked misconceptions (M1-M6) | >= 50% reduction in misconception frequency | Count misconception instances in pre vs. post-test |
| **Process Awareness** | Learner's ability to explain their reasoning for classifications | >= 70% of explanations reference evidence/interpretation distinction | Qualitative coding of reasoning text |
| **Ambiguity Tolerance** | Learner's ability to accept multiple valid classifications for borderline items | >= 60% of ambiguous items receive "defensible" or "both valid" responses | Score exploratory feedback acceptance |
| **Completion Rate** | Percentage of learners who complete all 5 scenarios | >= 70% | Count completions / count starts |

### 11.3 Secondary Metrics

| Metric | Definition | Purpose |
|--------|-----------|---------|
| **Time on Task** | Average time spent per scenario | Identify scenarios that are too long or too short |
| **Skip Rate** | Percentage of items where learner selects "Skip — I'm not sure" | Identify items that are too difficult or unclear |
| **Remediation Trigger Rate** | Percentage of learners who trigger remediation branches | Calibrate difficulty thresholds |
| **Acceleration Trigger Rate** | Percentage of learners who trigger acceleration branches | Calibrate mastery thresholds |
| **Feedback Engagement** | Percentage of learners who read feedback (vs. skipping ahead) | Assess feedback design effectiveness |
| **Reasoning Provision** | Percentage of items where learner provides optional reasoning text | Assess metacognitive engagement |

### 11.4 Evaluation Protocol

**Participant recruitment (for future validation):**
- Target: 15–30 participants with diverse backgrounds
- Inclusion criteria: No prior training in source criticism or reviewer methodology
- Exclusion criteria: None (the simulator is designed for novices)
- Recruitment: Internal volunteers; no compensation

**Procedure:**
1. Participant reads the welcome screen and disclaimer
2. Participant completes the pre-test (5 items, ~5 minutes)
3. Participant completes training scenarios (5 scenarios, ~75–125 minutes total)
4. Participant completes the post-test (10 items, ~10 minutes)
5. Participant completes a brief satisfaction survey (5 questions, ~3 minutes)
6. Session data is cleared when participant exits

**Data collected (session-local only):**
- Pre-test responses and scores
- Training responses, classifications, and reasoning text
- Branching decisions (remediation/acceleration/repeat)
- Post-test responses and scores
- Satisfaction survey responses
- Time-on-task per scenario and per item

**Data NOT collected:**
- Personal identifiers (name, email, IP address)
- Account information (no accounts exist)
- Persistent session data (all data cleared on exit)
- Network traffic (simulator is offline)

### 11.5 Success Criteria

The simulator is considered effective if:

| Criterion | Threshold | Evidence |
|-----------|-----------|---------|
| **C1: Classification improvement** | Post-test accuracy >= pre-test accuracy + 15 percentage points | Paired t-test on pre/post scores |
| **C2: Dimension improvement** | >= 4 of 6 dimensions show >= 1 level improvement | Dimension-by-dimension comparison |
| **C3: Misconception reduction** | >= 3 of 6 misconceptions show >= 50% frequency reduction | Misconception count comparison |
| **C4: Completion** | >= 70% of participants complete all 5 scenarios | Completion rate |
| **C5: Satisfaction** | >= 3.5/5.0 average satisfaction rating | Survey mean |
| **C6: No credential confusion** | 100% of participants correctly answer "Does this training certify me as a reviewer?" on the satisfaction survey | Survey item |

If C1-C4 are met, the simulator is recommended for continued development. If C6 is not met, the simulator must be revised before any further use.

### 11.6 Expected Results (Synthetic)

Based on the design assumptions and analogous training studies:

| Metric | Expected Pre-Test | Expected Post-Test | Expected Gain |
|--------|-------------------|--------------------|---------------|
| Classification Accuracy | 45–55% | 75–85% | +30 percentage points |
| Evidence Recognition | 2.0/4.0 (Developing) | 3.2/4.0 (Proficient) | +1.2 levels |
| Interpretation ID | 1.8/4.0 (Novice) | 3.0/4.0 (Proficient) | +1.2 levels |
| Uncertainty Awareness | 1.5/4.0 (Novice) | 2.8/4.0 (Developing) | +1.3 levels |
| Source Reliability | 2.0/4.0 (Developing) | 2.8/4.0 (Developing) | +0.8 levels |
| Multi-Perspective | 1.5/4.0 (Novice) | 2.5/4.0 (Developing) | +1.0 levels |
| Process Reflection | 1.3/4.0 (Novice) | 2.8/4.0 (Developing) | +1.5 levels |
| Misconception Count | 4.2/6.0 | 1.8/6.0 | -2.4 misconceptions |
| Completion Rate | N/A | 78% | — |
| Satisfaction | N/A | 3.8/5.0 | — |

**Note:** These are design estimates, not empirical results. Actual results require participant testing, which is deferred.

---

## 12. Accessibility Considerations

### 12.1 Accessibility Standards

The simulator targets **WCAG 2.1 Level AA** compliance across all screens and interactions.

### 12.2 Accessibility Requirements

| Category | Requirement | Implementation |
|----------|-------------|----------------|
| **Keyboard Navigation** | All interactive elements are accessible via keyboard | Tab order follows visual layout; Enter/Space activate buttons; Arrow keys navigate within groups |
| **Screen Reader** | All content is readable by screen readers | Semantic HTML; ARIA labels for all interactive elements; live regions for feedback updates |
| **Color Contrast** | Text meets 4.5:1 contrast ratio against backgrounds | Dark text on light backgrounds; no color-only information |
| **Focus Indicators** | Visible focus indicator on all interactive elements | 2px solid outline; high contrast against background |
| **Text Size** | Text is readable at 200% zoom; user can increase/decrease size | Relative units (rem/em); text size controls on every screen |
| **Cognitive Load** | Information is presented in manageable chunks | One classification item per screen; collapsible reference materials; progress indicators |
| **Language** | Text is readable at grade 8–10 level; technical terms are defined | Flesch-Kincaid target >= 60; glossary accessible from every screen |
| **Motion** | No unnecessary animation; user can disable transitions | CSS `prefers-reduced-motion` respected; no auto-playing content |
| **Touch Targets** | All interactive elements are at least 44x44 pixels | Button sizing; adequate spacing between targets |
| **Error Prevention** | Learner cannot accidentally submit a classification without selecting a category | Submit button is disabled until a classification (E/I/U) is selected |

### 12.3 Keyboard Navigation Specification

```
TAB CYCLE (per screen):
  1. Accessibility controls (text size, contrast)
  2. Navigation controls (back, forward)
  3. Classification options (E / I / U radio buttons)
  4. Reasoning text area (if present)
  5. Submit / Skip buttons
  6. Reference panel toggles (if expanded)

KEY SHORTCUTS:
  E          → Select "Evidence" classification
  I          → Select "Interpretation" classification
  U          → Select "Unknown" classification
  Enter      → Submit classification
  S          → Skip current item
  ?          → Show keyboard shortcut help
  + / -      → Increase / decrease text size
  R          → Toggle reference panel

FOCUS MANAGEMENT:
  - After submitting a classification, focus moves to the feedback screen
  - After dismissing feedback, focus moves to the "Next Task" button
  - After clicking "Next Task," focus moves to the next classification item
  - Focus never leaves the visible viewport
```

### 12.4 Screen Reader Specification

```
SCREEN READER ANNOUNCEMENTS:

On entering a classification task:
  "Scenario [N], Task [M] of [total]. Statement: [statement text].
   Choose a classification: Evidence, Interpretation, or Unknown.
   Use E, I, or U keys, or Tab to the radio buttons."

On selecting a classification:
  "[Evidence/Interpretation/Unknown] selected."

On submitting:
  "Classification submitted. Loading feedback."

On feedback screen:
  "Feedback: [feedback text]. Use Tab to navigate to the Next
   Task button."

On progress update:
  "Progress: [completed] of [total] tasks completed in this scenario."
```

### 12.5 Cognitive Accessibility

| Feature | Purpose | Implementation |
|---------|---------|----------------|
| **One item per screen** | Reduce working memory load | Classification tasks are presented sequentially, not as a list |
| **Progress indicator** | Reduce anxiety about task length | Visual progress bar shows completed/remaining items |
| **Collapsible reference** | Allow learner to control information density | Source materials, key terms, and examples are hidden by default |
| **Optional reasoning** | Support metacognition without forcing it | Text area for reasoning is optional; learner can skip |
| **Skip option** | Prevent frustration on difficult items | "Skip — I'm not sure" button on every item |
| **Consistent layout** | Reduce cognitive load from navigation | Same screen structure across all scenarios |
| **Plain language** | Ensure comprehension is not blocked by vocabulary | All text reviewed for readability (grade 8–10 target) |

### 12.6 Accessibility Verification Tests

| Test ID | Test Description | Pass Criteria |
|---------|-----------------|---------------|
| A1 | Navigate all screens using keyboard only (no mouse) | All tasks completable; focus always visible |
| A2 | Use screen reader (NVDA or VoiceOver) to complete Scenario 1 | All content readable; all interactions announced |
| A3 | Zoom to 200% and complete Scenario 1 | No content overflow; all interactions functional |
| A4 | Complete Scenario 1 with `prefers-reduced-motion: reduce` | No animation; all transitions instant |
| A5 | Complete Scenario 1 using only touch targets on mobile | All targets >= 44x44px; no accidental activations |

---

## 13. Risk Mitigation

### 13.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Residual Risk |
|----|------|-----------|--------|------------|---------------|
| R1 | Training output mistaken for certification | Medium | High | Explicit disclaimer on every screen; no credential language; no "pass/fail" terminology; satisfaction survey includes "Does this training certify me?" item | Low (if C6 is met) |
| R2 | Learner data inadvertently persisted | Low | High | No database; no localStorage beyond current session; all data cleared on exit; offline-only architecture | Very Low |
| R3 | Scenarios contain real case data | Very Low | Critical | All scenarios fictional; content reviewer verifies no real data; bias review protocol checks for cultural specificity | Very Low |
| R4 | Cultural bias in scenarios | Medium | Medium | 8-category bias review framework; diverse reviewer panel; ongoing monitoring; revision protocol | Low (if bias review is completed) |
| R5 | Scenarios are too difficult, causing learner frustration | Medium | Medium | Adaptive branching (remediation for struggling learners); skip option on every item; progressive difficulty | Low |
| R6 | Scenarios are too easy, causing learner boredom | Low | Low | Adaptive branching (acceleration for advanced learners); expert-level Scenario 5 | Low |
| R7 | Feedback reinforces misconceptions instead of correcting them | Low | Medium | Feedback design reviewed by content expert; misconception tracking with targeted responses; exploratory feedback for ambiguous items | Low |
| R8 | Accessibility barriers prevent some learners from using the simulator | Low | High | WCAG 2.1 AA compliance; 5 accessibility verification tests; cognitive load mitigation; text alternative for all visual content | Low (if tests pass) |
| R9 | Simulator is used as a substitute for actual reviewer training | Medium | High | Explicit disclaimer; no authority granted; no integration with production review systems; M20 governance gate remains separate | Medium (requires owner action) |
| R10 | Branching logic creates inconsistent learner experiences | Low | Medium | Branching rules are deterministic and documented; all paths lead to the same post-test; branch history is logged for analysis | Low |

### 13.2 Risk R1 Detail: No Credential Confusion

This is the highest-priority risk. The following measures are implemented:

**Measure 1: Persistent Disclaimer**
Every screen in the simulator displays:
```
IMPORTANT: This is a training exercise. No credentials are issued.
No decisions are stored. This is NOT a certification.
```

**Measure 2: Language Audit**
The following terms are prohibited throughout the simulator:

| Prohibited Term | Reason | Acceptable Alternative |
|----------------|--------|----------------------|
| "Pass" / "Fail" | Implies assessment with consequences | "Completed" / "Not yet completed" |
| "Score" (in isolation) | Implies grading | "Classification accuracy" (with explanation that this is practice, not testing) |
| "Certificate" | Implies credential | Not used at all |
| "Qualified" | Implies authority | "Practiced" (with explanation that practice does not confer authority) |
| "Accredited" | Implies institutional approval | Not used at all |
| "Certified" | Implies formal credential | Not used at all |
| "Grade" | Implies evaluation | "Level" (with explanation that levels describe practice progress, not qualifications) |

**Measure 3: Satisfaction Survey Item**
The post-training survey includes the mandatory item:
"Does completing this training certify you as a reviewer?"
- Expected answer: NO
- If any participant answers YES, the disclaimer is revised before further use

**Measure 4: Structural Separation**
The simulator has no technical connection to:
- Production reviewer accounts (none exist in the simulator)
- Governance systems (M20 is external and not integrated)
- Decision storage (no decisions are persisted)
- Authority grants (no mechanism exists to grant authority)

### 13.3 Rollback Plan

If any risk materializes at unacceptable levels:

1. **Immediate action:** Remove the simulator module from the local environment
2. **Data action:** Clear all session data (no persistent data exists by design)
3. **Communication action:** Notify owner that the simulator has been removed
4. **Review action:** Conduct root cause analysis before any re-deployment
5. **No production impact:** Because no decisions are persisted and no accounts are created, rollback has zero impact on production systems

---

## 14. Metrics and Success Criteria

### 14.1 Primary Success Metrics

The simulator's success is measured by whether it achieves its stated objective: "Test whether fictional cases help reviewers practice distinguishing evidence, interpretation and unknowns."

| Metric | Definition | Target | Measurement Method | Decision Rule |
|--------|-----------|--------|--------------------|---------------|
| **M1: Classification Accuracy Gain** | Post-test accuracy minus pre-test accuracy | >= +15 percentage points | Paired comparison of pre/post scores | If met: simulator achieves learning objective |
| **M2: Dimension Improvement** | Number of dimensions (of 6) showing >= 1 level improvement | >= 4 of 6 dimensions | Dimension-by-dimension pre/post comparison | If met: improvement is broad, not narrow |
| **M3: Misconception Reduction** | Reduction in frequency of tracked misconceptions (M1-M6) | >= 50% reduction for >= 3 of 6 misconceptions | Misconception count in pre vs. post-test | If met: training addresses specific reasoning errors |
| **M4: Completion Rate** | Percentage of participants who complete all scenarios | >= 70% | Completions / starts | If met: simulator is usable for the full training sequence |
| **M5: Satisfaction** | Average satisfaction rating (1-5 scale) | >= 3.5/5.0 | Post-training survey mean | If met: learners find the simulator useful |
| **M6: No Credential Confusion** | Percentage of participants who correctly state the simulator does not certify | 100% | Survey item accuracy6 | If not met: simulator must be revised before further use |

### 14.2 Secondary Metrics

| Metric | Definition | Purpose |
|--------|-----------|---------|
| **M7: Time on Task** | Average minutes per scenario | Calibrate difficulty; identify scenarios that are too long |
| **M8: Skip Rate** | Percentage of items skipped | Identify items that are too difficult or unclear |
| **M9: Remediation Rate** | Percentage of learners triggering remediation | Calibrate branching thresholds |
| **M10: Acceleration Rate** | Percentage of learners triggering acceleration | Calibrate mastery thresholds |
| **M11: Feedback Engagement** | Percentage of learners who read feedback | Assess feedback design effectiveness |
| **M12: Reasoning Provision** | Percentage of items where learner provides reasoning | Assess metacognitive engagement |

### 14.3 Metrics Collection Method

All metrics are collected from session-local data only:

```typescript
type MetricsCollection = {
  // Pre/post test scores
  preTestScore: number           // 0-10
  postTestScore: number          // 0-20
  preTestDimensions: number[6]   // per-dimension pre-test scores
  postTestDimensions: number[6]  // per-dimension post-test scores
  
  // Misconception tracking
  preTestMisconceptions: MisconceptionInstance[]
  postTestMisconceptions: MisconceptionInstance[]
  
  // Completion tracking
  scenariosStarted: number
  scenariosCompleted: number
  itemsAttempted: number
  itemsSkipped: number
  
  // Branching tracking
  remediationTriggered: number
  accelerationTriggered: number
  
  // Engagement tracking
  feedbackViewed: number         // count of feedback screens viewed
  feedbackSkipped: number        // count of feedback screens skipped
  reasoningProvided: number      // count of items with reasoning text
  reasoningOmitted: number       // count of items without reasoning text
  
  // Time tracking
  sessionStartTime: string       // ISO 8601
  sessionEndTime: string         // ISO 8601
  timePerScenario: number[5]     // milliseconds per scenario
  
  // Satisfaction (survey responses)
  satisfactionRating: number     // 1-5
  credentialConfusion: boolean   // true if learner thinks simulator certifies
}

type MisconceptionInstance = {
  misconceptionId: string        // M1-M6
  scenarioId: number             // which scenario
  itemId: number                 // which item
  testPhase: 'pre' | 'post'     // when it occurred
}
```

### 14.4 Decision Framework

Based on the metrics, the following decisions are possible:

| Condition | Decision | Action |
|-----------|----------|--------|
| M1-M6 all met | **GO** | Simulator achieves all objectives; proceed to content reviewer approval |
| M1-M5 met, M6 not met | **REVISE** | Simulator achieves learning objectives but credential disclaimer is insufficient; revise disclaimer and re-test M6 |
| M1-M3 met, M4-M5 not met | **REVISE** | Simulator achieves learning objectives but is not usable (too difficult or unsatisfying); revise difficulty and engagement |
| M1 not met | **NO-GO** | Simulator does not achieve its primary learning objective; reconsider the approach |
| Any metric UNKNOWN | **RECORD UNKNOWN** | Document the gap; do not draw conclusions from missing data |

### 14.5 Reporting Template

The final metrics report follows this structure:

```
M47-27 SYNTHETIC REVIEWER TRAINING SIMULATOR — METRICS REPORT

Date: [date]
Participants: [count]
Scenarios completed: [count]

PRIMARY METRICS:
  M1 Classification Accuracy Gain: [pre]% → [post]% ([gain] points) [MET/NOT MET]
  M2 Dimension Improvement: [N]/6 dimensions improved [MET/NOT MET]
  M3 Misconception Reduction: [N]/6 misconceptions reduced >= 50% [MET/NOT MET]
  M4 Completion Rate: [N]% [MET/NOT MET]
  M5 Satisfaction: [N]/5.0 [MET/NOT MET]
  M6 No Credential Confusion: [N]% correct [MET/NOT MET]

SECONDARY METRICS:
  M7 Average Time on Task: [N] minutes per scenario
  M8 Skip Rate: [N]%
  M9 Remediation Rate: [N]%
  M10 Acceleration Rate: [N]%
  M11 Feedback Engagement: [N]%
  M12 Reasoning Provision: [N]%

DECISION: [GO / REVISE / NO-GO / UNKNOWN]
REASON: [brief explanation]

NEXT STEPS: [if GO: content reviewer approval; if REVISE: what to revise; if NO-GO: what to reconsider]
```

---

## 15. Implementation Roadmap (Deferred)

### 15.1 Implementation is Deferred

This document establishes the design baseline. Implementation is explicitly deferred pending:
1. Content reviewer approval of all 5 scenarios
2. Cultural bias reviewer sign-off
3. Accessibility reviewer verification
4. Owner authorization to proceed with implementation
5. Confirmation that M47-23 (disagreement interface) design is stable

### 15.2 Proposed Implementation Phases

If and when implementation is authorized, the following phases are proposed:

**Phase 1: Core Simulator (2 days)**
- Implement scenario data model (TypeScript interfaces)
- Build classification task UI (one item per screen)
- Implement basic scoring (correct/partial/incorrect per item)
- Create fixture data for Scenario 1
- Test: Learner can complete Scenario 1 with scoring

**Phase 2: Feedback System (1.5 days)**
- Implement feedback generation rules (confirmatory, corrective, exploratory, metacognitive)
- Build feedback UI (feedback screen after each item)
- Implement misconception tracking (6 patterns)
- Create feedback text for all Scenario 1 items
- Test: Learner receives appropriate feedback for each classification

**Phase 3: Remaining Scenarios (2 days)**
- Create fixture data for Scenarios 2–5
- Write feedback text for all items in Scenarios 2–5
- Implement progressive difficulty
- Test: All 5 scenarios are completable with feedback

**Phase 4: Branching Logic (1 day)**
- Implement adaptive branching rules (remediation, acceleration, repeat)
- Create remediation mini-scenarios for each dimension
- Implement state management (in-memory only)
- Test: Branching triggers correctly based on performance

**Phase 5: Accessibility (1 day)**
- Implement keyboard navigation
- Add ARIA labels and screen reader announcements
- Verify color contrast (4.5:1 minimum)
- Implement text size controls
- Run 5 accessibility verification tests (A1-A5)
- Test: All accessibility tests pass

**Phase 6: Evaluation (0.5 days)**
- Implement pre/post-test scoring
- Build metrics collection (session-local)
- Create final summary screen
- Implement session data clearing on exit
- Test: Metrics are collected and displayed correctly

**Total estimated effort:** 8 days (within the M effort range of 4–8 days)

### 15.3 Technical Architecture (Proposed)

```
┌─────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE (Proposed)                                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend (Single-Page Application)                       │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │ Scenario  │  │Classification│  │ Feedback │  │ Progress │ │   │
│  │  │ Viewer   │  │  Panel    │  │  Display │  │  Tracker │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  State Manager (in-memory only; no persistence)       │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  Scenario Data (JSON fixtures; loaded at startup)     │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  NO BACKEND. NO DATABASE. NO NETWORK. NO AUTHENTICATION.         │
│  All data is session-local and cleared on exit.                  │
└─────────────────────────────────────────────────────────────────┘
```

### 15.4 File Structure (Proposed)

```
apps/training-simulator/           # New app (if approved)
├── package.json
├── src/
│   ├── index.html                 # Entry point
│   ├── main.ts                    # App initialization
│   ├── components/
│   │   ├── Welcome.tsx            # Welcome screen
│   │   ├── ScenarioBriefing.tsx   # Scenario introduction
│   │   ├── ClassificationTask.tsx # Item classification
│   │   ├── Feedback.tsx           # Feedback display
│   │   ├── ProgressSummary.tsx    # Per-scenario summary
│   │   ├── FinalSummary.tsx       # End-of-training summary
│   │   └── AccessibilityControls.tsx
│   ├── data/
│   │   ├── scenarios/
│   │   │   ├── scenario-1.json    # Coastal Settlement
│   │   │   ├── scenario-2.json    # Disputed Manuscript
│   │   │   ├── scenario-3.json    # Witness Account
│   │   │   ├── scenario-4.json    # Translation Debate
│   │   │   └── scenario-5.json    # Underdetermined Artifact
│   │   ├── feedback/
│   │   │   └── feedback-rules.json
│   │   └── rubric/
│   │       └── scoring-rules.json
│   ├── logic/
│   │   ├── scoring.ts             # Classification scoring
│   │   ├── branching.ts           # Adaptive difficulty
│   │   ├── feedback.ts            # Feedback generation
│   │   └── metrics.ts             # Metrics collection
│   ├── state/
│   │   └── simulator-state.ts     # In-memory state management
│   └── accessibility/
│       ├── keyboard.ts            # Keyboard navigation
│       └── screen-reader.ts       # ARIA announcements
└── tests/
    ├── scoring.test.ts
    ├── branching.test.ts
    ├── feedback.test.ts
    └── accessibility.test.ts
```

---

## 16. Deferred Items Requiring Owner Action

The following items are explicitly deferred and require owner action before they can be resolved:

### 16.1 Content Reviewer Approval

**Item:** All 5 scenarios and their classification items require review by a content expert (someone with domain knowledge in source criticism, textual analysis, or reviewer methodology).

**Action required:** Owner identifies and assigns a content reviewer. The reviewer verifies:
- Scenarios are educationally sound
- Classification items have defensible expected answers
- Feedback text is accurate and pedagogically effective
- Rubric dimensions capture the right competencies

**Status:** NOT STARTED — awaiting reviewer assignment

### 16.2 Cultural Bias Review

**Item:** All 5 scenarios require review by a cultural bias reviewer (someone with expertise in cross-cultural communication, inclusive design, or the specific cultural contexts represented in the fictional scenarios).

**Action required:** Owner identifies and assigns a bias reviewer. The reviewer completes the 5-step bias review protocol (Section 10.2) and signs off on the bias checklist (Section 10.2, Step 5).

**Status:** NOT STARTED — awaiting reviewer assignment

### 16.3 Accessibility Review

**Item:** The implemented simulator (when built) requires review by an accessibility expert.

**Action required:** Owner identifies and assigns an accessibility reviewer. The reviewer runs the 5 accessibility verification tests (A1-A5) and confirms WCAG 2.1 AA compliance.

**Status:** DEFERRED — requires implementation first (Phase 5)

### 16.4 M20 Governance Integration Decision

**Item:** M20 (external governance) is listed as a dependency but is explicitly NOT integrated. The question of whether the simulator should ever connect to governance systems is a policy decision.

**Action required:** Owner decides whether M20 integration is:
- Permanently excluded (simulator is always standalone)
- Conditionally allowed (simulator can connect to M20 if specific safeguards are met)
- Deferred (decision postponed until M20 design is more mature)

**Status:** NOT STARTED — awaiting owner decision

### 16.5 M47-23 Design Stability

**Item:** M47-23 (multi-reviewer disagreement interface) is a dependency. If M47-23's design changes significantly, the simulator's scenarios and feedback may need revision to maintain alignment.

**Action required:** Owner confirms that M47-23's design is stable enough to serve as a foundation for the simulator's design. If M47-23 is revised, the simulator design must be updated accordingly.

**Status:** M47-23 is BASELINE ESTABLISHED; design is considered stable for dependency purposes

### 16.6 Participant Testing Authorization

**Item:** The comprehension evaluation methodology (Section 11) requires testing with 15–30 participants. This testing requires:
- Ethics review (if participants are not internal volunteers)
- Informed consent protocol
- Data handling procedures (even though no personal data is collected by design)

**Action required:** Owner authorizes participant testing and confirms whether ethics review is needed. For internal volunteer testing with no personal data collection, a simplified approval process may be sufficient.

**Status:** NOT STARTED — awaiting owner authorization

### 16.7 Delayed Post-Test Implementation

**Item:** The delayed post-test (Phase 4 of evaluation, Section 11.1) requires session data persistence, which contradicts the "no persistence" design principle.

**Action required:** Owner decides whether:
- The delayed post-test is permanently excluded (no persistence under any circumstances)
- A limited exception is made (session data is persisted for 2–4 weeks with explicit user consent, then deleted)
- An alternative is used (e.g., learner downloads a session summary file and re-imports it for the delayed test)

**Status:** DEFERRED — requires owner decision on persistence exception

### 16.8 Scenario Expansion

**Item:** The initial design includes 5 scenarios. Additional scenarios may be needed to:
- Cover more domain types (e.g., digital evidence, oral testimony, material culture)
- Increase difficulty range (e.g., expert-level scenarios for experienced reviewers)
- Provide variety for repeated training use

**Action required:** Owner decides whether scenario expansion is in scope for the initial implementation or deferred to a future iteration.

**Status:** NOT STARTED — deferred unless owner specifies otherwise

### 16.9 Multilingual Support

**Item:** The simulator is currently designed for English-language use only. Given the project's bilingual (id/en) commitment, multilingual support may be required.

**Action required:** Owner decides whether:
- The initial implementation is English-only (with multilingual support deferred)
- The initial implementation must include Indonesian (id) translation
- The scenario data model supports multilingual content from the start (even if only English is populated initially)

**Status:** NOT STARTED — awaiting owner decision

### 16.10 Integration with Existing Reviewer Training Programs

**Item:** If the simulator proves effective, it may be integrated into existing reviewer training programs (governed by M20). This integration would require:
- Technical connection to training management systems
- Policy agreement on how simulator completion relates to training requirements
- Safeguards to ensure simulator remains a training tool, not a gate

**Action required:** Owner decides whether integration with training programs is a future goal and, if so, what safeguards are needed.

**Status:** NOT STARTED — deferred; simulator is designed as standalone

---

## 17. Overlap Analysis

### 17.1 Overlap with M47-23 (Multi-Reviewer Disagreement Interface)

| Aspect | M47-23 | M47-27 | Overlap | Conflict |
|--------|--------|--------|---------|----------|
| **Purpose** | Preserve disagreement among reviewers | Train reviewers to classify evidence/interpretation/unknowns | Both deal with reviewer reasoning | No — M47-23 is about recording disagreement; M47-27 is about building classification skill |
| **Data model** | DisagreementGroup, Interpretation, ViewRecord | Scenario, ClassificationItem, LearnerResponse | Both use interpretation concepts | No — M47-23 stores real reviewer interpretations; M47-27 uses fictional scenarios |
| **Authority** | No authority granted (disagreement preserved) | No authority granted (training only) | Aligned | No |
| **Consensus** | No forced consensus | No forced correct answer for ambiguous items | Aligned | No |
| **Persistence** | Disagreements stored (with audit trail) | No persistence (session-local only) | Different by design | No — M47-27 explicitly avoids storage |

**Conclusion:** M47-27 builds on M47-23's principles (no forced consensus, no authority grant, disagreement preserved) without overlapping its functionality. M47-23 records real reviewer disagreements; M47-27 trains reviewers to classify statements using fictional scenarios.

### 17.2 Overlap with M20 (External Governance)

| Aspect | M20 | M47-27 | Overlap | Conflict |
|--------|-----|--------|---------|----------|
| **Purpose** | Governance framework for reviewer authority | Training simulator for classification skill | Both relate to reviewer activity | No — M20 governs real authority; M47-27 trains skills |
| **Authority** | Grants/managed reviewer authority | Explicitly does NOT grant authority | Different by design | No — M47-27 disclaimer ensures no confusion |
| **Integration** | External system; not integrated | Standalone; no integration with M20 | None | No |

**Conclusion:** M47-27 is explicitly designed to NOT integrate with M20. The simulator is a standalone training tool. Any future integration requires a separate owner decision (see Deferred Item 16.4).

### 17.3 Overlap with M47-14 (Claim/Evidence Scenario Simulator)

| Aspect | M47-14 | M47-27 | Overlap | Conflict |
|--------|--------|--------|---------|----------|
| **Purpose** | Test "what evidence would change this conclusion?" | Test whether learners can classify evidence/interpretation/unknowns | Both use fictional scenarios for training | Partial — M47-14 focuses on evidence weighting; M47-27 focuses on classification |
| **Method** | Add/remove evidence; observe conclusion changes | Classify statements; receive feedback on reasoning | Different methods | No |
| **Learning objective** | Understand how evidence affects conclusions | Distinguish evidence from interpretation from unknowns | Complementary | No |

**Conclusion:** M47-14 and M47-27 are complementary training tools. M47-14 teaches evidence weighting; M47-27 teaches classification. They can be used together in a training program without conflict.

### 17.4 Overlap with ONT-007 (Claim/Evidence Classification)

| Aspect | ONT-007 | M47-27 | Overlap | Conflict |
|--------|---------|--------|---------|----------|
| **Purpose** | Define ontology for claim/evidence classification | Train reviewers to apply classification in practice | Both deal with classification | No — ONT-007 defines the ontology; M47-27 teaches its application |
| **Scope** | Ontology design (abstract) | Training scenarios (concrete) | Different levels | No |

**Conclusion:** M47-27 can use ONT-007's classification ontology as the basis for its rubric. The two are complementary: ONT-007 provides the theoretical framework; M47-27 provides practical training.

---

## 18. Verification Tests

### 18.1 Test Suite

The following 5 verification tests confirm the simulator meets its design constraints:

**Test V1: No Authority Grant**
```
Procedure:
1. Complete all 5 scenarios
2. Inspect all output screens for credential language
3. Attempt to find any mechanism for granting reviewer authority
4. Check for account creation, role assignment, or certificate generation

Expected result:
- No credential language appears on any screen
- No account creation mechanism exists
- No role assignment mechanism exists
- No certificate or badge is generated
- Disclaimer appears on every screen

Pass criteria: All 5 sub-checks pass
```

**Test V2: No Decision Persistence**
```
Procedure:
1. Complete Scenario 1 with specific classifications
2. Close the simulator (clear all session data)
3. Reopen the simulator
4. Check whether previous classifications are retrievable

Expected result:
- Previous classifications are NOT retrievable
- Simulator starts fresh with no memory of prior sessions
- No localStorage, IndexedDB, or cookie data persists

Pass criteria: All classification data is cleared on exit
```

**Test V3: No Real Case Data**
```
Procedure:
1. Review all 5 scenarios for real persons, texts, events, or communities
2. Check all source evidence items for real data
3. Check all interpretations for real scholarly positions
4. Check all unknowns for real gaps in knowledge

Expected result:
- All scenarios use fictional settings, fictional scholars, fictional texts
- No real religious texts are referenced
- No real witness accounts are included
- No real case records are represented

Pass criteria: Content reviewer confirms 100% synthetic data
```

**Test V4: No M20 Integration**
```
Procedure:
1. Inspect simulator code for network requests
2. Check for API calls to governance services
3. Verify no reviewer role assignment mechanism exists
4. Confirm simulator operates offline

Expected result:
- No HTTP requests are made
- No API calls to any external service
- No network access required
- Simulator functions fully offline

Pass criteria: Zero network requests during complete scenario execution
```

**Test V5: Accessibility Compliance**
```
Procedure:
1. Run keyboard navigation test (A1)
2. Run screen reader test (A2)
3. Run 200% zoom test (A3)
4. Run reduced motion test (A4)
5. Run touch target test (A5)

Expected result:
- All 5 accessibility tests pass
- WCAG 2.1 AA compliance confirmed

Pass criteria: All 5 tests pass
```

### 18.2 Test Execution

All verification tests are deferred until implementation is complete. When executed, tests should be performed by an independent reviewer (not the implementer) to avoid confirmation bias.

---

## 19. Conclusion

### 19.1 Summary

This document presents a comprehensive design for the M47-27 Synthetic Reviewer Training Simulator. The design includes:

- **5 complete fictional scenarios** with synthetic data, classification items, and feedback text
- **A 6-dimension training rubric** with 4 competency levels (Novice → Developing → Proficient → Expert)
- **Adaptive branching logic** that adjusts difficulty based on learner performance
- **4 feedback types** (confirmatory, corrective, exploratory, metacognitive) with detailed generation rules
- **A cultural bias review framework** with 8 bias categories and a 5-step review protocol
- **A comprehension evaluation methodology** with pre/post-test design and 6 primary success metrics
- **Accessibility design** targeting WCAG 2.1 AA compliance
- **Risk mitigation** for 10 identified risks, with detailed measures for the highest-priority risk (credential confusion)
- **An implementation roadmap** (deferred) with 6 phases totaling approximately 8 days
- **10 deferred items** requiring owner action before implementation can begin

### 19.2 Status: BASELINE ESTABLISHED

This document establishes the design baseline for M47-27. The design is complete. Implementation is explicitly deferred pending:

1. Content reviewer approval of scenarios
2. Cultural bias reviewer sign-off
3. Accessibility reviewer verification
4. Owner authorization to proceed
5. Resolution of 10 deferred items requiring owner action

### 19.3 Key Design Decisions

| Decision | Rationale | Alternative Considered | Why Not |
|----------|-----------|----------------------|---------|
| Offline-only architecture | Prevents data leakage; no network means no server-side storage | Online with server-side storage | Violates "no persistence" constraint |
| No accounts or authentication | Simulator is training, not production | Optional accounts for progress tracking | Accounts imply credentialing; creates persistence risk |
| 5 scenarios of increasing difficulty | Progressive skill building; prevents early frustration | Random scenario order | Loses pedagogical sequencing |
| Process feedback (not correctness) | Teaches reasoning, not memorization | Correctness feedback (right/wrong) | Violates "no forced consensus" principle; oversimplifies ambiguous cases |
| 6-dimension rubric | Captures multiple aspects of classification competency | Single overall score | Loses diagnostic information about specific strengths/weaknesses |
| Adaptive branching | Personalizes training to learner's level | Fixed sequence for all learners | Wastes time on mastered content; does not address weak areas |
| Fictional scenarios only | No risk of real case data exposure | Real (anonymized) case data | Violates "no real personal case data" constraint; requires M16/M18 gates |
| Explicit disclaimer on every screen | Prevents credential confusion | Disclaimer only on welcome screen | Learners may miss welcome disclaimer; repeated reinforcement is more effective |

### 19.4 Relationship to Project Principles

The simulator design aligns with core project principles:

- **No vote becomes theological truth:** Scenarios present multiple valid interpretations; no single "correct" answer for ambiguous items
- **Synthetic data only:** All scenarios use fictional cases; no real personal data
- **Offline operation:** No network access; no server dependencies
- **Accessibility first:** WCAG 2.1 AA compliance; cognitive load mitigation
- **Cultural neutrality:** 8-category bias review framework; diverse fictional settings
- **Process over product:** Feedback addresses reasoning, not conclusions
- **Transparency:** All design decisions documented; all deferred items identified

### 19.5 Next Steps

The following actions are required before implementation can begin:

1. **Owner review:** Project owner reviews this design document and authorizes implementation (or requests revisions)
2. **Content reviewer assignment:** Owner identifies a content reviewer for scenario approval
3. **Bias reviewer assignment:** Owner identifies a cultural bias reviewer
4. **Accessibility reviewer assignment:** Owner identifies an accessibility reviewer (for post-implementation review)
5. **Deferred item resolution:** Owner addresses the 10 deferred items listed in Section 16
6. **Implementation authorization:** Owner provides explicit authorization to begin implementation
7. **Implementation:** If authorized, implementer follows the 6-phase roadmap (Section 15.2)
8. **Verification:** After implementation, independent reviewer executes the 5 verification tests (Section 18.1)
9. **Participant testing:** After verification, owner authorizes participant testing (Section 11.4)
10. **Metrics reporting:** After testing, metrics are collected and reported (Section 14.5)
11. **Decision:** Based on metrics, owner decides GO / REVISE / NO-GO (Section 14.4)

---

**Document status:** BASELINE ESTABLISHED  
**Design complete:** Yes  
**Implementation:** Deferred (requires owner authorization)  
**Evidence:** This document (rubric, 5 fictional scenarios, feedback design, evaluation methodology, accessibility design, risk mitigation)  
**Closure:** Design baseline recorded. Implementation and testing are deferred pending owner action on 10 items listed in Section 16.
