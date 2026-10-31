# M47-14 Claim/Evidence Scenario Simulator Design

**Task ID:** M47-14  
**Status:** BASELINE ESTABLISHED  
**Date:** 2026-10-31  
**Owner:** Research  
**Dependencies:** None (leaf task)

## Objective

Design an interactive "what evidence would change this conclusion?" exercise using invented claims and evidence. Test whether users can distinguish evidence addition from conclusion certainty, and understand that multiple outcomes remain possible.

## Scope

Paper design only — local educational prototype, no production claim store. All scenarios are fictional and synthetic.

---

## 1. Fictional Case: "The Ancient Library Discovery"

### 1.1 Scenario Overview

**Setting:** Archaeologists discover ruins of an ancient library in a fictional Mediterranean region (circa 300 BCE).

**Central Question:** Was this library primarily a religious temple archive, a secular university library, or a royal palace collection?

**Competing Hypotheses:**
- **H1: Religious Temple Archive** — Library served a nearby temple; texts are primarily religious
- **H2: Secular University Library** — Library was part of a philosophical school; texts are academic
- **H3: Royal Palace Collection** — Library belonged to a royal palace; texts are administrative/literary

### 1.2 Initial Evidence (Before User Interaction)

| Evidence ID | Type | Description | Reliability | Supports |
|-------------|------|-------------|-------------|----------|
| E01 | Architectural | Large building with columns, 50m x 30m | HIGH (physical remains) | H1, H2, H3 (all require large space) |
| E02 | Artifact | 200 clay tablets found in situ | HIGH (primary source) | Unknown (content not yet analyzed) |
| E03 | Location | Building is 500m from known temple ruins | MEDIUM (circumstantial) | H1 (proximity to temple) |
| E04 | Location | Building is 2km from known philosophical school | LOW (weak connection) | H2 (possible connection) |
| E05 | Location | Building is 1km from royal palace foundations | MEDIUM (circumstantial) | H3 (proximity to palace) |

**Initial Conclusion:** INCONCLUSIVE — Evidence is consistent with all three hypotheses. No single hypothesis is strongly supported.

### 1.3 Source Reliability Labels

| Label | Definition | Example |
|-------|-----------|---------|
| **HIGH** | Primary source, direct evidence, verified by multiple methods | Physical artifacts, contemporary documents, radiocarbon dating |
| **MEDIUM** | Secondary source, circumstantial evidence, plausible connection | Proximity to known sites, stylistic similarities, later historical accounts |
| **LOW** | Weak evidence, speculative connection, single source | Oral traditions, modern reconstructions, analogies to other sites |
| **DISPUTED** | Evidence contested by experts, multiple interpretations | Debated inscriptions, conflicting dating methods, ideological bias |
| **UNKNOWN** | Evidence not yet analyzed or categorized | Untranslated texts, unexamined artifacts, unexcavated areas |

---

## 2. Evidence Transitions

### 2.1 Transition Mechanics

Users can **ADD** or **REMOVE** evidence to see how conclusions change. Each evidence item has:
- **Support vector:** Which hypothesis it supports (H1, H2, H3, or multiple)
- **Weight:** How strongly it supports (WEAK, MEDIUM, STRONG)
- **Reliability:** Source quality (HIGH, MEDIUM, LOW, DISPUTED, UNKNOWN)

**Conclusion calculation:**
```
Support Score = Σ (Weight × Reliability Factor) for each evidence item

Weight: WEAK=1, MEDIUM=2, STRONG=3
Reliability Factor: HIGH=1.0, MEDIUM=0.7, LOW=0.4, DISPUTED=0.2, UNKNOWN=0.5

Conclusion = Hypothesis with highest Support Score (if margin > 20%)
           = INCONCLUSIVE (if margin ≤ 20%)
```

### 2.2 Available Evidence Additions

#### Evidence Batch A: Tablet Content Analysis

| Evidence ID | Type | Description | Reliability | Weight | Supports |
|-------------|------|-------------|-------------|--------|----------|
| E06 | Textual | 80% of tablets contain religious hymns and prayers | HIGH | STRONG | H1 |
| E07 | Textual | 15% of tablets contain philosophical treatises | HIGH | MEDIUM | H2 |
| E08 | Textual | 5% of tablets contain royal administrative records | HIGH | WEAK | H3 |

**Effect of adding E06:** H1 support increases significantly (STRONG × HIGH = 3.0 points)  
**Effect of adding E07:** H2 support increases moderately (MEDIUM × HIGH = 2.0 points)  
**Effect of adding E08:** H3 support increases slightly (WEAK × HIGH = 1.0 points)

**New conclusion after E06+E07+E08:** H1 (Religious Temple Archive) — 65% confidence

#### Evidence Batch B: Architectural Features

| Evidence ID | Type | Description | Reliability | Weight | Supports |
|-------------|------|-------------|-------------|--------|----------|
| E09 | Architectural | Building contains altar room with ritual basin | HIGH | STRONG | H1 |
| E10 | Architectural | Building contains lecture hall with seating for 100 | MEDIUM | MEDIUM | H2 |
| E11 | Architectural | Building contains throne room adjacent to library | MEDIUM | STRONG | H3 |

**Effect of adding E09:** H1 support increases significantly  
**Effect of adding E10:** H2 support increases moderately  
**Effect of adding E11:** H3 support increases significantly

**Note:** E09, E10, E11 are mutually exclusive — building cannot have all three features. User must choose which architectural feature is discovered.

#### Evidence Batch C: Historical Context

| Evidence ID | Type | Description | Reliability | Weight | Supports |
|-------------|------|-------------|-------------|--------|----------|
| E12 | Historical | Contemporary account describes "temple of the muses" in this city | MEDIUM | MEDIUM | H1 |
| E13 | Historical | Philosopher X is known to have taught in this city circa 280 BCE | MEDIUM | MEDIUM | H2 |
| E14 | Historical | King Y is known to have built a palace in this city circa 300 BCE | MEDIUM | MEDIUM | H3 |

**Effect of adding E12:** H1 support increases moderately  
**Effect of adding E13:** H2 support increases moderately  
**Effect of adding E14:** H3 support increases moderately

#### Evidence Batch D: Disputed Evidence

| Evidence ID | Type | Description | Reliability | Weight | Supports |
|-------------|------|-------------|-------------|--------|----------|
| E15 | Textual | One tablet mentions "priests of the library" | DISPUTED | STRONG | H1 |
| E16 | Textual | One tablet mentions "students of the library" | DISPUTED | STRONG | H2 |
| E17 | Textual | One tablet mentions "servants of the king's library" | DISPUTED | STRONG | H3 |

**Note:** E15, E16, E17 are DISPUTED — scholars disagree on translation. User must decide whether to accept disputed evidence.

**Effect of adding E15 (if accepted):** H1 support increases significantly, but reliability is low (DISPUTED × 0.2 = 0.6 effective points)  
**Effect of adding E16 (if accepted):** H2 support increases significantly, but reliability is low  
**Effect of adding E17 (if accepted):** H3 support increases significantly, but reliability is low

### 2.3 Transition Scenarios

#### Scenario 1: Evidence Accumulation (Linear)

**User action:** Add E06, E07, E08 (tablet content analysis)

**System response:**
- Display updated support scores: H1=3.0, H2=2.0, H3=1.0
- Display conclusion: H1 (Religious Temple Archive) — 65% confidence
- Display message: "The majority of tablets contain religious texts, strongly supporting the temple archive hypothesis. However, 20% of tablets remain unanalyzed."

**User action:** Add E09 (altar room)

**System response:**
- Display updated support scores: H1=6.0, H2=2.0, H3=1.0
- Display conclusion: H1 (Religious Temple Archive) — 80% confidence
- Display message: "The presence of an altar room strongly confirms the religious function. This is now the dominant hypothesis."

**Learning objective:** Evidence accumulation increases confidence; multiple independent sources strengthen conclusion.

#### Scenario 2: Conflicting Evidence (Non-Linear)

**User action:** Add E06 (religious tablets), then E11 (throne room)

**System response:**
- After E06: H1=3.0, H2=0, H3=0 → H1 (65% confidence)
- After E11: H1=3.0, H2=0, H3=3.0 → INCONCLUSIVE (50/50 split)
- Display message: "The evidence is now evenly divided. The tablets suggest a religious function, but the throne room suggests a royal palace. Further evidence is needed."

**User action:** Add E15 (disputed "priests of the library" tablet)

**System response:**
- Display choice: "This tablet is disputed. Scholars disagree on the translation. Do you want to: (a) Accept the translation and add evidence, (b) Reject the translation, or (c) Mark as unknown?"
- If user chooses (a): H1=3.6, H2=0, H3=3.0 → H1 (55% confidence, weak)
- If user chooses (b): H1=3.0, H2=0, H3=3.0 → INCONCLUSIVE
- If user chooses (c): H1=3.5, H2=0, H3=3.0 → H1 (54% confidence, weak)

**Learning objective:** Conflicting evidence creates uncertainty; disputed evidence requires judgment calls; confidence levels matter.

#### Scenario 3: Evidence Removal (Reversibility)

**User action:** Add E06, E09 (strong H1 support), then remove E06

**System response:**
- After E06+E09: H1=6.0, H2=0, H3=0 → H1 (100% confidence)
- After removing E06: H1=3.0, H2=0, H3=0 → H1 (100% confidence, but weaker absolute support)
- Display message: "Removing the tablet evidence reduces the total support for H1, but the architectural evidence (altar room) still strongly supports H1. However, you now have less overall evidence."

**Learning objective:** Evidence removal changes confidence; absolute support matters, not just relative ranking.

#### Scenario 4: Multiple Outcomes (Underdetermination)

**User action:** Add only E01, E02, E03, E04, E05 (initial evidence)

**System response:**
- Display support scores: H1=0.7, H2=0.4, H3=0.7
- Display conclusion: INCONCLUSIVE — all hypotheses are consistent with available evidence
- Display message: "The current evidence does not distinguish between the hypotheses. This is a case of underdetermination — multiple explanations are equally consistent with the data. More evidence is needed, or you may never reach a definitive conclusion."

**Learning objective:** Some questions remain unresolved; underdetermination is a valid outcome; absence of evidence is not evidence of absence.

---

## 3. Comprehension Test Design

### 3.1 Test Questions (After Each Scenario)

#### Scenario 1 Comprehension

**Q1:** "After adding the tablet content analysis (E06-E08), what is the conclusion?"
- (a) H1: Religious Temple Archive ✓
- (b) H2: Secular University Library
- (c) H3: Royal Palace Collection
- (d) INCONCLUSIVE

**Q2:** "How confident are we in this conclusion?"
- (a) 100% certain
- (b) 65% confident ✓
- (c) 50% confident
- (d) No confidence

**Q3:** "What would increase confidence further?"
- (a) Finding more religious tablets ✓
- (b) Finding philosophical tablets
- (c) Removing the altar room evidence
- (d) Adding disputed evidence

#### Scenario 2 Comprehension

**Q1:** "After adding both religious tablets (E06) and throne room (E11), what is the conclusion?"
- (a) H1: Religious Temple Archive
- (b) H2: Secular University Library
- (c) H3: Royal Palace Collection
- (d) INCONCLUSIVE ✓

**Q2:** "Why is the conclusion INCONCLUSIVE?"
- (a) Not enough evidence
- (b) Evidence is evenly divided between H1 and H3 ✓
- (c) All evidence is unreliable
- (d) The hypotheses are wrong

**Q3:** "What should you do when evidence is disputed (E15)?"
- (a) Always accept it
- (b) Always reject it
- (c) Make a judgment call and understand the reliability is low ✓
- (d) Ignore it completely

#### Scenario 3 Comprehension

**Q1:** "After removing E06 (religious tablets), what happens to confidence in H1?"
- (a) Confidence increases
- (b) Confidence stays the same
- (c) Confidence decreases ✓
- (d) Confidence becomes 0%

**Q2:** "Why does confidence decrease even though H1 is still the top hypothesis?"
- (a) Because we have less total evidence ✓
- (b) Because H2 is now stronger
- (c) Because H3 is now stronger
- (d) Because the altar room evidence is unreliable

**Q3:** "What does this tell us about evidence removal?"
- (a) Removing evidence never changes the conclusion
- (b) Removing evidence can reduce confidence even if conclusion stays the same ✓
- (c) Removing evidence always makes the conclusion INCONCLUSIVE
- (d) Removing evidence is not allowed

#### Scenario 4 Comprehension

**Q1:** "With only the initial evidence (E01-E05), what is the conclusion?"
- (a) H1: Religious Temple Archive
- (b) H2: Secular University Library
- (c) H3: Royal Palace Collection
- (d) INCONCLUSIVE ✓

**Q2:** "What does INCONCLUSIVE mean in this context?"
- (a) The hypotheses are wrong
- (b) We need more evidence to distinguish between them ✓
- (c) The evidence is unreliable
- (d) The library doesn't exist

**Q3:** "Is INCONCLUSIVE a valid outcome?"
- (a) No, we must always reach a conclusion
- (b) Yes, some questions are underdetermined by available evidence ✓
- (c) Only if we have no evidence at all
- (d) Only if all evidence is disputed

### 3.2 Comprehension Metrics

**Target performance:**
- 80% of users answer all comprehension questions correctly
- Users can distinguish between "evidence addition increases confidence" and "evidence addition changes conclusion"
- Users understand that INCONCLUSIVE is a valid outcome
- Users recognize that disputed evidence requires judgment calls

**Assessment method:**
- Pre-test: Users answer comprehension questions before interacting with simulator
- Post-test: Users answer same questions after completing all scenarios
- Compare pre/post scores to measure learning

---

## 4. Bias Assessment Framework

### 4.1 Potential Biases in Evidence Interpretation

| Bias Type | Definition | Example in Simulator | Mitigation Strategy |
|-----------|-----------|---------------------|---------------------|
| **Confirmation bias** | Favoring evidence that confirms pre-existing beliefs | User only adds evidence supporting their preferred hypothesis | Show all evidence; require user to consider counter-evidence |
| **Anchoring bias** | Relying too heavily on first piece of evidence | User's initial hypothesis choice influences how they interpret later evidence | Randomize evidence order; show confidence intervals |
| **Availability bias** | Overweighting easily recalled or vivid evidence | User overweights dramatic evidence (e.g., throne room) over mundane evidence (e.g., tablet content) | Show reliability labels; weight evidence by quality not vividness |
| **Disputed evidence bias** | Accepting or rejecting evidence based on desired conclusion | User accepts disputed evidence if it supports their hypothesis, rejects if it doesn't | Apply same reliability weighting regardless of which hypothesis evidence supports |
| **Premature closure** | Reaching conclusion too quickly without considering all evidence | User adds 1-2 pieces of evidence and stops | Require user to consider at least 5 pieces of evidence before final conclusion |
| **Authority bias** | Overweighting evidence from perceived authorities | User overweights "HIGH" reliability evidence even when it's wrong | Show cases where HIGH reliability evidence is disputed or later overturned |

### 4.2 Bias Detection Questions

After each scenario, ask users:

1. **"Did you feel tempted to only add evidence supporting your preferred hypothesis?"**
   - (a) Yes, strongly tempted
   - (b) Yes, somewhat tempted
   - (c) No, not tempted
   - (d) No, I actively tried to add counter-evidence

2. **"How much did the first piece of evidence influence your final conclusion?"**
   - (a) Very much — I anchored on it
   - (b) Somewhat — it was a starting point
   - (c) Not much — I considered all evidence equally
   - (d) Not at all — I ignored it

3. **"When you encountered disputed evidence, did you:"**
   - (a) Accept it if it supported my hypothesis
   - (b) Reject it if it contradicted my hypothesis
   - (c) Apply the same judgment regardless of which hypothesis it supported
   - (d) Skip all disputed evidence

4. **"How many pieces of evidence did you consider before reaching a conclusion?"**
   - (a) 1-2 pieces
   - (b) 3-4 pieces
   - (c) 5-7 pieces
   - (d) 8+ pieces

### 4.3 Bias Scoring

**Low bias score (good):**
- User considers all evidence types (textual, architectural, historical, disputed)
- User adds at least 5 pieces of evidence before concluding
- User applies same reliability weighting regardless of hypothesis
- User recognizes INCONCLUSIVE as valid outcome

**High bias score (concern):**
- User only adds evidence supporting preferred hypothesis
- User concludes after 1-2 pieces of evidence
- User accepts disputed evidence only if it supports preferred hypothesis
- User refuses to accept INCONCLUSIVE as valid outcome

---

## 5. User Interface Design (Paper Mockup)

### 5.1 Main Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  CLAIM/EVIDENCE SCENARIO SIMULATOR                          │
│  "The Ancient Library Discovery"                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CENTRAL QUESTION:                                          │
│  Was this library primarily a religious temple archive,     │
│  a secular university library, or a royal palace collection?│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  CURRENT EVIDENCE (5 items)          CURRENT CONCLUSION:    │
│  ┌─────────────────────────┐         INCONCLUSIVE          │
│  │ E01: Large building     │         H1: 20%               │
│  │ E02: 200 clay tablets   │         H2: 20%               │
│  │ E03: 500m from temple   │         H3: 20%               │
│  │ E04: 2km from school    │         Margin: 0%            │
│  │ E05: 1km from palace    │                               │
│  └─────────────────────────┘                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  AVAILABLE EVIDENCE TO ADD:                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Batch A: Tablet Content Analysis                    │   │
│  │ [E06] 80% religious tablets (HIGH, STRONG) → H1    │   │
│  │ [E07] 15% philosophical tablets (HIGH, MEDIUM) → H2│   │
│  │ [E08] 5% administrative tablets (HIGH, WEAK) → H3  │   │
│  │ [ADD ALL]                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Batch B: Architectural Features                     │   │
│  │ [E09] Altar room (HIGH, STRONG) → H1               │   │
│  │ [E10] Lecture hall (MEDIUM, MEDIUM) → H2           │   │
│  │ [E11] Throne room (MEDIUM, STRONG) → H3            │   │
│  │ Note: Mutually exclusive — choose one               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [RESET]  [UNDO LAST]  [NEXT SCENARIO]  [SHOW CONCLUSION]  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Evidence Detail Panel (When User Clicks Evidence Item)

```
┌─────────────────────────────────────────────────────────────┐
│  EVIDENCE DETAIL: E06                                       │
├─────────────────────────────────────────────────────────────┤
│  Type: Textual analysis                                     │
│  Description: 80% of tablets contain religious hymns/prayers│
│  Reliability: HIGH (primary source, verified by 3 scholars) │
│  Weight: STRONG (directly supports H1)                      │
│  Supports: H1 (Religious Temple Archive)                    │
│                                                             │
│  EFFECT IF ADDED:                                           │
│  H1 support: +3.0 points (STRONG × HIGH = 3.0)             │
│  H2 support: +0.0 points                                    │
│  H3 support: +0.0 points                                    │
│                                                             │
│  NEW CONCLUSION IF ADDED:                                   │
│  H1: 75% confidence (up from 20%)                           │
│  H2: 10% confidence (down from 20%)                         │
│  H3: 15% confidence (down from 20%)                         │
│                                                             │
│  [ADD THIS EVIDENCE]  [CANCEL]                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Conclusion Display (After Evidence Added)

```
┌─────────────────────────────────────────────────────────────┐
│  UPDATED CONCLUSION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  H1: Religious Temple Archive ████████████████░░░░ 75%     │
│  H2: Secular University Library ████░░░░░░░░░░░░░░ 10%    │
│  H3: Royal Palace Collection ██████░░░░░░░░░░░░░░ 15%     │
│                                                             │
│  Margin: 60% (H1 leads H3 by 60 percentage points)         │
│                                                             │
│  INTERPRETATION:                                            │
│  The majority of tablets contain religious texts, strongly  │
│  supporting the temple archive hypothesis. However, 20% of  │
│  tablets remain unanalyzed and could change the conclusion. │
│                                                             │
│  CONFIDENCE LEVEL: HIGH (75% > 60% threshold)               │
│                                                             │
│  [CONTINUE]  [RESET]  [SHOW EXPLANATION]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Learning Objectives and Assessment

### 6.1 Core Learning Objectives

After completing the simulator, users should be able to:

1. **Distinguish evidence addition from conclusion certainty**
   - Adding evidence increases support for a hypothesis
   - But it does not guarantee the hypothesis is correct
   - Confidence levels matter (75% confident ≠ 100% certain)

2. **Understand that multiple outcomes remain possible**
   - INCONCLUSIVE is a valid outcome
   - Underdetermination occurs when evidence is insufficient
   - Absence of evidence is not evidence of absence

3. **Evaluate source reliability**
   - HIGH reliability evidence is more trustworthy than LOW
   - DISPUTED evidence requires judgment calls
   - Reliability weighting affects conclusion strength

4. **Recognize bias in evidence interpretation**
   - Confirmation bias: favoring evidence that confirms beliefs
   - Anchoring bias: over-weighting first evidence
   - Premature closure: concluding too quickly

5. **Apply reversible reasoning**
   - Evidence can be added and removed
   - Removing evidence changes confidence even if conclusion stays same
   - Conclusions are provisional, not final

### 6.2 Assessment Rubric

| Competency | Novice (1) | Developing (2) | Proficient (3) | Expert (4) |
|------------|-----------|----------------|----------------|------------|
| **Evidence evaluation** | Adds evidence randomly | Adds evidence supporting preferred hypothesis | Adds evidence systematically, considers all types | Adds evidence strategically, weights by reliability |
| **Conclusion interpretation** | Believes conclusion is certain | Understands conclusion is probable | Distinguishes confidence levels | Recognizes provisional nature of all conclusions |
| **Bias awareness** | Unaware of bias | Recognizes bias in others | Recognizes own bias | Actively mitigates bias |
| **Underdetermination** | Rejects INCONCLUSIVE as failure | Accepts INCONCLUSIVE but frustrated | Understands INCONCLUSIVE as valid | Uses INCONCLUSIVE to identify evidence gaps |
| **Reversible reasoning** | Cannot undo evidence | Undoes evidence but confused by changes | Understands how removal affects confidence | Uses removal to test robustness of conclusion |

---

## 7. Limitations and Deferred Items

### 7.1 Not Covered in This Baseline

1. **Actual prototype implementation:** This is a paper design only. No interactive simulator has been built.
2. **Real user testing:** Comprehension tests and bias assessments are designed but not administered.
3. **Domain expert review:** Fictional case has not been reviewed by archaeologists or historians.
4. **Neutral language validation:** Language has not been reviewed for cultural or ideological bias.
5. **Accessibility review:** UI mockup has not been tested with screen readers or keyboard navigation.
6. **Production integration:** This is explicitly not a production claim store; no database or API.

### 7.2 Requires Owner Action

1. **Prototype development:** Build actual interactive simulator (estimated 5-10 days development)
2. **User testing:** Recruit 10-20 test users and administer comprehension tests
3. **Domain review:** Consult archaeologist or historian to validate fictional case
4. **Language review:** Consult domain expert to ensure neutral language
5. **Accessibility review:** Test with users with disabilities
6. **Iteration:** Revise design based on user testing feedback

---

## 8. Success Metrics

### 8.1 Quantitative Metrics

- **Comprehension score:** Target 80% of users answer all comprehension questions correctly
- **Bias score:** Target 70% of users demonstrate low bias (see Section 4.3)
- **Completion rate:** Target 90% of users complete all 4 scenarios
- **Time on task:** Target 20-30 minutes per user (not too fast, not too slow)

### 8.2 Qualitative Metrics

- **User feedback:** Target 80% of users report "simulator helped me understand evidence evaluation"
- **Expert review:** Target domain expert approval of fictional case and neutral language
- **Accessibility review:** Target no critical accessibility barriers
- **Learning transfer:** Target users apply evidence evaluation skills to real-world scenarios

---

## 9. Revision Recommendations

### 9.1 Short-Term (0-3 months)

1. Build actual interactive prototype (HTML/CSS/JavaScript)
2. Recruit 10-20 test users
3. Administer comprehension tests and bias assessments
4. Collect user feedback
5. Iterate on design based on testing

### 9.2 Medium-Term (3-12 months)

6. Consult domain expert (archaeologist/historian) to validate fictional case
7. Consult language expert to ensure neutral language
8. Conduct accessibility review with users with disabilities
9. Expand to additional fictional cases (e.g., historical event, scientific discovery)
10. Develop advanced scenarios (e.g., conflicting expert testimony, evolving evidence)

### 9.3 Long-Term (12+ months)

11. Integrate with production claim store (if applicable)
12. Develop multiplayer version (users collaborate on evidence evaluation)
13. Develop AI-guided version (system provides hints and feedback)
14. Benchmark against other evidence evaluation training tools
15. Publish results in educational technology journal

---

## 10. Conclusion

This baseline establishes a comprehensive design for a claim/evidence scenario simulator. The fictional case ("The Ancient Library Discovery") provides a neutral, engaging context for exploring evidence evaluation. Four transition scenarios (linear accumulation, conflicting evidence, evidence removal, underdetermination) cover key learning objectives. Comprehension tests and bias assessments provide quantitative and qualitative metrics. Paper UI mockups demonstrate user interface design.

**Status:** BASELINE ESTABLISHED — ready for prototype development and user testing.

**Next steps:** Owner action required on prototype development, user testing, and domain expert review (see Section 7.2).

**Evidence:** This document.
