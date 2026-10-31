# M49-09: Outcome Measurement Plan Design

**Task ID:** M49-09  
**Priority:** P1  
**Difficulty:** D4  
**Dependencies:** M49-01  
**Owner:** Program evaluator  
**Effort:** L (5–10 days plus evaluator time)  
**Status:** BASELINE ESTABLISHED — 2026-10-31  
**Evidence Type:** Design document (no code implemented)

---

## Executive Summary

This design document establishes an outcome measurement plan for a hypothetical charitable pilot program before any pilot begins. The plan defines one specific outcome, baseline measurement strategy, credible evidence methods, consent protocols, and procedures for handling null or harmful results.

**Key Findings:**
- Outcome must be specific, measurable, and separated from outputs and attribution claims
- Baseline measurement requires pre-pilot data collection with informed consent
- Evidence methods must be credible (randomized control, quasi-experimental, or pre-post with comparison)
- Consent must be ongoing, revocable, and documented
- Null and harmful results must be planned for in advance, not improvised
- Missing data handling must be specified before collection begins

**Scope Limitation:** This document covers design only. Implementation requires program evaluator recruitment, partner approval, and IRB/ethics review, which are deferred to future work.

**Hypothetical Scenario:** This plan is designed for a hypothetical "Digital Literacy for Rural Youth" program, where trained volunteers deliver basic computer skills training to youth aged 15-24 in rural areas. The outcome being measured is "improved digital literacy confidence" as self-reported by participants.

---

## 1. Problem Statement

### 1.1 Why Measure Outcomes Before a Pilot?

Most charitable programs launch without clear outcome definitions:
- **Output confusion:** Programs measure activities (e.g., "100 youth trained") instead of outcomes (e.g., "youth confidence in using digital tools improved by 30%")
- **Attribution gaps:** Programs claim impact without credible evidence methods (e.g., "our program caused the improvement" without control groups)
- **Consent failures:** Programs collect data without informed consent or data protection
- **Publication bias:** Programs only publish positive results, hiding null or harmful outcomes
- **Missing data chaos:** Programs improvise data handling after collection, introducing bias

### 1.2 What This Plan Provides

A structured approach to outcome measurement that:
1. **Defines one specific outcome** (not multiple vague goals)
2. **Separates output, outcome, and attribution** (clear logical chain)
3. **Specifies baseline measurement** (pre-pilot data collection)
4. **Chooses credible evidence methods** (randomized control, quasi-experimental, or pre-post with comparison)
5. **Defines consent protocols** (informed, ongoing, revocable)
6. **Plans for null/harmful results** (pre-commit to publication regardless of outcome)
7. **Handles missing data** (specified before collection begins)

### 1.3 Constraints

- **Privacy:** No sensitive personal data collected without explicit consent
- **Feasibility:** Measurement methods must be practical for a small pilot (50-100 participants)
- **Credibility:** Evidence methods must meet minimum standards for causal inference
- **Transparency:** All results (positive, null, harmful) must be published
- **Ethics:** Program must do no harm; measurement must not burden participants

---

## 2. Outcome Definition

### 2.1 Program Theory of Change

```
INPUTS                    ACTIVITIES                  OUTPUTS                   OUTCOMES                  IMPACT
─────────                 ──────────                  ─────────                   ──────────                  ──────
Trained volunteers   →    Deliver training      →    Youth complete        →    Youth report higher     →    Youth access
Curriculum materials       (10 sessions,             training program           digital literacy             employment,
Funding                    2 hours each)             (100 youth)                  confidence                 higher income,
Facilities                                                                                  (30% increase)          improved wellbeing
                                                                                                              (long-term, 5+ years)
```

### 2.2 Specific Outcome Statement

**Outcome:** Participants self-report increased confidence in using digital tools for everyday tasks (email, online banking, job applications) after completing the 10-session training program.

**Measurement:**
- **Metric:** Digital Literacy Confidence Score (DLCS), a 10-item self-report scale
- **Scale:** 1 (not confident at all) to 5 (very confident)
- **Range:** 10-50 points
- **Target:** 30% increase in mean DLCS from baseline to post-program
- **Timeframe:** Baseline (week 0) → Post-program (week 10) → Follow-up (week 22, 3 months post-program)

**Why This Outcome?**
- **Specific:** Measures one construct (digital literacy confidence), not multiple vague goals
- **Measurable:** Uses validated self-report scale with clear scoring
- **Meaningful:** Confidence is a prerequisite for actual digital tool use
- **Feasible:** Can be measured with surveys, not expensive tests or observations
- **Time-bound:** Measured at 3 time points (baseline, post, follow-up)

**What This Outcome Is NOT:**
- **Not an output:** "100 youth trained" is an output, not an outcome
- **Not an impact:** "Youth access employment" is a long-term impact, not a pilot-scale outcome
- **Not attribution:** This plan does not claim the program *caused* the confidence increase (attribution requires a control group, which may not be feasible for a small pilot)

### 2.3 Logical Chain

```
HYPOTHESIS:
If rural youth aged 15-24 complete a 10-session digital literacy training program,
then they will self-report increased confidence in using digital tools,
because they will have learned basic skills (email, online banking, job applications)
and practiced them in a supportive environment.

ASSUMPTIONS:
1. Participants have access to digital devices (smartphones, computers) outside the program
2. Participants are motivated to learn (self-selected, not forced)
3. Training is delivered with fidelity (volunteers follow curriculum)
4. Confidence is a prerequisite for actual use (psychological literature supports this)
5. Self-report is a valid measure of confidence (validated scale exists)

RISKS TO LOGICAL CHAIN:
1. Participants may lack device access → confidence does not translate to use
2. Participants may be unmotivated → dropout, no learning
3. Volunteers may deviate from curriculum → inconsistent delivery
4. Confidence may not predict use → outcome is meaningless
5. Self-report may be biased (social desirability, recall) → measurement is invalid
```

### 2.4 Alternative Outcomes Considered

**Alternative 1: Digital tool usage frequency**
- **Metric:** Number of times per week participant uses email, online banking, job applications
- **Pros:** Behavioral measure, not self-report
- **Cons:** Requires device access, hard to verify, privacy concerns
- **Decision:** Rejected — too difficult to measure reliably

**Alternative 2: Employment rate**
- **Metric:** % of participants employed 6 months post-program
- **Pros:** Meaningful impact, easy to verify
- **Cons:** Long-term (6+ months), many confounding factors, not pilot-scale
- **Decision:** Rejected — too long-term for pilot measurement

**Alternative 3: Digital literacy test score**
- **Metric:** Score on standardized digital literacy test (e.g., IC3 Digital Literacy Certification)
- **Pros:** Objective measure, not self-report
- **Cons:** Expensive ($100/test), requires test administration, cultural bias concerns
- **Decision:** Rejected — too expensive and culturally biased for small pilot

**Selected Outcome:** Digital Literacy Confidence Score (DLCS) — self-report scale
- **Rationale:** Feasible, meaningful, validated, low-cost, low-burden

---

## 3. Baseline Measurement

### 3.1 Baseline Data Collection Protocol

**When:** Week 0, before first training session  
**Who:** All participants (n=50-100)  
**How:** In-person survey, administered by trained facilitator  
**Duration:** 15-20 minutes

**Baseline Survey Components:**

1. **Demographics (5 items)**
   - Age (years)
   - Gender (male/female/non-binary/prefer not to say)
   - Education level (none/primary/secondary/tertiary)
   - Employment status (employed/unemployed/student/homemaker/other)
   - Household device access (none/phone only/phone + computer)

2. **Digital Literacy Confidence Score (10 items)**
   - "How confident are you in your ability to..."
   - 1. Send an email with an attachment
   - 2. Search for information online
   - 3. Create a document using word processing software
   - 4. Use social media safely
   - 5. Recognize phishing emails
   - 6. Set up a new email account
   - 7. Apply for a job online
   - 8. Use online banking
   - 9. Video call with family/friends
   - 10. Protect your personal information online
   - **Response scale:** 1 (not confident at all) to 5 (very confident)
   - **Scoring:** Sum of 10 items, range 10-50

3. **Prior digital experience (3 items)**
   - "How often do you currently use a computer or smartphone?" (daily/weekly/monthly/rarely/never)
   - "Have you ever taken a digital literacy course before?" (yes/no)
   - "How many years have you been using digital devices?" (0/1-2/3-5/6-10/10+)

4. **Motivation and expectations (2 open-ended items)**
   - "What do you hope to learn from this program?"
   - "How do you think this program will help you?"

**Data Quality Checks:**
- Facilitator reviews survey for completeness before participant leaves
- Missing items flagged and clarified with participant
- Surveys with >2 missing items excluded from analysis
- Data entry double-checked by second person

### 3.2 Baseline Analysis

**Descriptive Statistics:**
- Mean DLCS score (SD)
- Median DLCS score (IQR)
- % of participants at floor (score = 10)
- % of participants at ceiling (score = 50)
- Distribution of demographics (age, gender, education, employment, device access)
- Distribution of prior digital experience

**Subgroup Analysis:**
- Mean DLCS by gender
- Mean DLCS by education level
- Mean DLCS by employment status
- Mean DLCS by device access
- Mean DLCS by prior digital experience

**Purpose:**
- Establish baseline characteristics of participants
- Identify potential confounders (e.g., if one gender has lower baseline confidence)
- Check for floor/ceiling effects (if most participants score 10 or 50, scale may not be sensitive)
- Inform power analysis (estimate variance for sample size calculation)

### 3.3 Baseline Consent

**Consent Process:**
1. Facilitator explains purpose of baseline survey
2. Facilitator reads consent form aloud (for low-literacy participants)
3. Participant asks questions
4. Participant signs consent form (or provides verbal consent if unable to sign)
5. Participant receives copy of consent form

**Consent Form Elements:**
- Purpose: "We are collecting data to understand your digital literacy confidence before the program starts."
- Voluntary: "Your participation is voluntary. You can stop at any time without penalty."
- Confidential: "Your responses will be kept confidential. We will not share your individual responses."
- Data use: "We will use your responses to measure the effectiveness of the program."
- Data storage: "Your responses will be stored securely and deleted after 5 years."
- Contact: "If you have questions, contact [program evaluator] at [email/phone]."

**Consent Documentation:**
- Signed consent forms stored in locked file cabinet
- Digital copies stored in encrypted database
- Consent status tracked in participant database (consented/withdrew/declined)

---

## 4. Evidence Methods

### 4.1 Method 1: Pre-Post Design (Minimum Viable)

**Design:**
- Measure DLCS at baseline (week 0)
- Deliver program (weeks 1-10)
- Measure DLCS at post-program (week 10)
- Compare mean DLCS baseline vs. post-program

**Analysis:**
- Paired t-test (if DLCS is normally distributed)
- Wilcoxon signed-rank test (if DLCS is not normally distributed)
- Effect size: Cohen's d (paired)

**Strengths:**
- Simple, feasible for small pilot
- Measures change within participants

**Weaknesses:**
- No control group → cannot attribute change to program (could be maturation, history, testing effects)
- Threats to internal validity: history, maturation, testing, instrumentation, regression to mean

**When to Use:**
- When control group is not feasible (small sample, ethical concerns, logistical constraints)
- When goal is to estimate effect size for future randomized trial, not to prove causation

### 4.2 Method 2: Pre-Post with Comparison Group (Quasi-Experimental)

**Design:**
- Measure DLCS at baseline (week 0) for participants and comparison group
- Deliver program to participants (weeks 1-10)
- Comparison group does not receive program (waitlist control)
- Measure DLCS at post-program (week 10) for both groups
- Compare change in DLCS: participants vs. comparison group

**Comparison Group Selection:**
- **Option A:** Waitlist control — participants who applied but were deferred to next cohort
- **Option B:** Matched comparison — participants from similar demographic area who did not apply
- **Option C:** Historical control — participants from previous cohort (if available)

**Analysis:**
- Difference-in-differences (DiD) regression
- Control for baseline DLCS, demographics, prior digital experience
- Effect size: Cohen's d (independent groups)

**Strengths:**
- Controls for history, maturation, testing effects
- Stronger causal inference than pre-post alone

**Weaknesses:**
- Comparison group may not be equivalent to participants (selection bias)
- Requires larger sample size (participants + comparison group)
- Ethical concerns if comparison group is denied services

**When to Use:**
- When control group is feasible and ethical
- When goal is to make stronger causal claims, but randomization is not possible

### 4.3 Method 3: Randomized Controlled Trial (Gold Standard)

**Design:**
- Recruit participants (n=100)
- Randomly assign to treatment group (n=50) or control group (n=50)
- Measure DLCS at baseline (week 0) for both groups
- Deliver program to treatment group (weeks 1-10)
- Control group does not receive program (waitlist control)
- Measure DLCS at post-program (week 10) for both groups
- Compare change in DLCS: treatment vs. control

**Randomization:**
- Computer-generated random sequence
- Allocation concealment: sealed opaque envelopes
- Stratified randomization (if needed): by gender, education, device access

**Analysis:**
- Independent t-test (if DLCS change is normally distributed)
- Mann-Whitney U test (if DLCS change is not normally distributed)
- ANCOVA regression: post-program DLCS ~ treatment + baseline DLCS + covariates
- Effect size: Cohen's d (independent groups)
- Intention-to-treat (ITT) analysis: include all randomized participants, regardless of program completion

**Strengths:**
- Controls for selection bias, history, maturation, testing effects
- Strongest causal inference

**Weaknesses:**
- Requires larger sample size (n=100+)
- Ethical concerns if control group is denied services
- Logistically complex (randomization, allocation concealment, ITT)
- Expensive (requires more staff, more data collection)

**When to Use:**
- When sample size is sufficient (n=100+)
- When ethical review board approves waitlist control
- When goal is to prove causation, not just estimate effect size

### 4.4 Selected Method for This Pilot

**Recommended Method:** Pre-Post Design (Method 1)

**Rationale:**
- Pilot is small (n=50-100), not sufficient for RCT
- Ethical concerns about denying services to control group
- Logistical constraints (rural area, limited staff)
- Goal is to estimate effect size for future RCT, not to prove causation
- Pre-post design is feasible, low-cost, low-burden

**Limitations:**
- Cannot attribute change to program (no control group)
- Threats to internal validity (history, maturation, testing, etc.)
- Results are preliminary, not definitive

**Future Work:**
- If pre-post shows promising effect size (d > 0.5), design RCT for larger trial
- If pre-post shows null effect, investigate why (program not effective? measurement not sensitive?)

### 4.5 Measurement Validity

**Construct Validity:**
- DLCS measures digital literacy confidence, not actual digital literacy skills
- Confidence is a prerequisite for skill use (psychological literature supports this)
- But confidence may not translate to behavior (participants may feel confident but not use tools)

**Content Validity:**
- DLCS items cover key digital literacy domains (email, search, document creation, social media, security, job applications, banking, video calls, privacy)
- Items reviewed by digital literacy experts (n=3) for relevance and clarity
- Pilot tested with 10 participants for comprehension

**Criterion Validity:**
- DLCS compared to standardized digital literacy test (e.g., IC3) in future validation study
- Not feasible for this pilot (test is expensive)

**Internal Consistency:**
- Cronbach's alpha for DLCS items (target: α > 0.7)
- Calculated at baseline and post-program

**Test-Retest Reliability:**
- DLCS administered twice, 2 weeks apart, to subset of participants (n=20)
- Intraclass correlation coefficient (ICC) calculated (target: ICC > 0.7)
- Not feasible for this pilot (requires additional data collection)

---

## 5. Consent Framework

### 5.1 Informed Consent Principles

**Principle 1: Comprehension**
- Consent form written in plain language (8th grade reading level)
- Facilitator reads consent form aloud for low-literacy participants
- Participant asks questions before signing
- Consent form available in local language(s)

**Principle 2: Voluntary**
- Participation is voluntary, not required for program enrollment
- Participant can withdraw at any time without penalty
- Participant can refuse to answer specific questions
- Participant can request data deletion

**Principle 3: Informed**
- Participant told purpose of data collection
- Participant told how data will be used
- Participant told who will have access to data
- Participant told how long data will be stored
- Participant told risks and benefits of participation

**Principle 4: Documented**
- Participant signs consent form (or provides verbal consent if unable to sign)
- Consent form includes date, participant name, facilitator name
- Copy of consent form given to participant
- Original stored securely by program

### 5.2 Consent Process Stages

**Stage 1: Pre-Enrollment**
- Program staff explains program goals, activities, time commitment
- Program staff explains data collection purpose (outcome measurement)
- Program staff answers questions
- Participant decides whether to enroll

**Stage 2: Enrollment**
- Participant signs consent form for program participation
- Consent form includes data collection for outcome measurement
- Participant receives copy of consent form

**Stage 3: Baseline Survey**
- Facilitator explains baseline survey purpose
- Facilitator reviews consent form (remind participant of rights)
- Participant confirms consent (verbal or written)
- Participant completes baseline survey

**Stage 4: Program Participation**
- Participant attends training sessions
- Facilitator checks in with participant periodically
- Participant can withdraw at any time

**Stage 5: Post-Program Survey**
- Facilitator explains post-program survey purpose
- Facilitator reviews consent form (remind participant of rights)
- Participant confirms consent (verbal or written)
- Participant completes post-program survey

**Stage 6: Follow-Up Survey (Optional)**
- Facilitator contacts participant 3 months post-program
- Facilitator explains follow-up survey purpose
- Participant can decline follow-up survey
- If participant consents, complete follow-up survey

**Stage 7: Data Deletion Request (Optional)**
- Participant can request data deletion at any time
- Program staff verifies participant identity
- Program staff deletes all participant data from database
- Program staff confirms deletion to participant
- Exception: anonymized data already included in published reports cannot be deleted

### 5.3 Consent Documentation

**Consent Form Template:**

```
INFORMED CONSENT FORM

Program Title: Digital Literacy for Rural Youth
Principal Investigator: [Program Evaluator Name]
Organization: [Organization Name]
Contact: [Email/Phone]

PURPOSE:
We are conducting a program to improve digital literacy confidence among rural youth aged 15-24. 
We are collecting data to measure the effectiveness of the program.

PROCEDURES:
If you agree to participate, you will:
1. Complete a 10-session training program (2 hours per session, 10 weeks)
2. Complete a baseline survey before the program starts (15-20 minutes)
3. Complete a post-program survey after the program ends (15-20 minutes)
4. Optionally complete a follow-up survey 3 months after the program ends (15-20 minutes)

RISKS:
There are no known risks to participating in this program or data collection. 
You may feel uncomfortable answering some questions. You can skip any question or stop at any time.

BENEFITS:
You may learn new digital skills and feel more confident using digital tools. 
Your participation will help us improve the program for future participants.

CONFIDENTIALITY:
Your responses will be kept confidential. We will not share your individual responses. 
We will only report aggregate results (e.g., average confidence score for all participants). 
Your data will be stored securely and deleted after 5 years.

VOLUNTARY PARTICIPATION:
Your participation is voluntary. You can stop at any time without penalty. 
You can refuse to answer specific questions. You can request data deletion.

CONTACT:
If you have questions, contact [Program Evaluator] at [Email/Phone].

CONSENT:
I have read this consent form (or it has been read to me). I understand the purpose of the program 
and data collection. I agree to participate voluntarily.

Participant Name: _________________________
Participant Signature: ______________________
Date: ______________________________________

Facilitator Name: ___________________________
Facilitator Signature: _______________________
Date: ______________________________________
```

**Consent Tracking:**
- Participant database tracks consent status (consented/withdrew/declined)
- Consent forms stored in locked file cabinet
- Digital copies stored in encrypted database
- Consent status reviewed before each data collection point

### 5.4 Consent for Vulnerable Populations

**Minors (aged 15-17):**
- Parental consent required (parent signs consent form)
- Minor assent required (minor signs assent form)
- Assent form written in age-appropriate language
- Minor can withdraw assent at any time (even if parent consents)

**Low-Literacy Participants:**
- Facilitator reads consent form aloud
- Facilitator uses visual aids (pictures, diagrams) to explain concepts
- Participant provides verbal consent (witnessed by facilitator)
- Verbal consent documented in participant database

**Participants with Disabilities:**
- Facilitator accommodates disability (e.g., sign language interpreter, large print)
- Participant provides consent in accessible format
- Consent documented in participant database

---

## 6. Handling Null or Harmful Results

### 6.1 Pre-Commitment to Publication

**Policy:**
- All results (positive, null, harmful) will be published
- Publication will occur regardless of outcome
- Publication will be accessible (open access, plain language summary)

**Rationale:**
- Prevents publication bias (only publishing positive results)
- Builds trust with participants, funders, public
- Contributes to evidence base (null results are informative)
- Ethical obligation (participants contributed data, deserve to see results)

**Publication Plan:**
- **Timeline:** Publish within 6 months of post-program data collection
- **Format:** Technical report (full analysis) + plain language summary (for participants)
- **Venue:** Organization website, funder report, conference presentation (if applicable)
- **Authorship:** Program evaluator, program staff, participant representatives (if desired)

### 6.2 Defining Null Results

**Null Result:**
- No statistically significant change in DLCS from baseline to post-program
- Effect size is small (Cohen's d < 0.2)
- Confidence interval includes zero

**Interpretation:**
- Program did not improve digital literacy confidence
- Possible reasons:
  - Program not effective (curriculum, delivery, dosage)
  - Measurement not sensitive (DLCS not capturing change)
  - Sample size too small (underpowered study)
  - Ceiling effect (participants already confident at baseline)
  - Floor effect (participants too unfamiliar to benefit)

**Response:**
- Investigate why program did not work (qualitative interviews, process evaluation)
- Revise program (curriculum, delivery, dosage)
- Revise measurement (DLCS items, scale, timing)
- Do not abandon program without investigation

### 6.3 Defining Harmful Results

**Harmful Result:**
- Statistically significant decrease in DLCS from baseline to post-program
- Effect size is negative and large (Cohen's d < -0.5)
- Participants report negative experiences (qualitative feedback)

**Interpretation:**
- Program caused harm (decreased confidence, negative experience)
- Possible reasons:
  - Program not appropriate for participants (too advanced, too basic, culturally insensitive)
  - Delivery was poor (volunteers untrained, unsupportive environment)
  - Measurement captured temporary frustration (not lasting harm)

**Response:**
- Immediately investigate harm (qualitative interviews, process evaluation)
- Suspend program if harm is confirmed
- Revise program (curriculum, delivery, volunteer training)
- Provide support to affected participants (counseling, alternative programs)
- Report harm to funder, ethics board, public

### 6.4 Scenario Planning

**Scenario 1: Positive Result**
- DLCS increases by 30% (target met)
- Statistically significant (p < 0.05)
- Effect size is medium (Cohen's d = 0.5)

**Response:**
- Publish positive result
- Celebrate success with participants, staff, funders
- Scale up program (if feasible)
- Design RCT to confirm causation

**Scenario 2: Null Result**
- DLCS increases by 5% (target not met)
- Not statistically significant (p > 0.05)
- Effect size is small (Cohen's d = 0.1)

**Response:**
- Publish null result
- Investigate why program did not work
- Revise program and measurement
- Do not scale up without further evidence

**Scenario 3: Harmful Result**
- DLCS decreases by 10%
- Statistically significant (p < 0.05)
- Effect size is negative (Cohen's d = -0.3)

**Response:**
- Publish harmful result
- Immediately investigate harm
- Suspend program
- Provide support to affected participants
- Revise program before resuming

**Scenario 4: Mixed Result**
- DLCS increases by 20% (target not met)
- Statistically significant (p < 0.05)
- Effect size is small (Cohen's d = 0.3)
- Subgroup analysis shows effect for some participants, not others

**Response:**
- Publish mixed result
- Investigate why effect varies by subgroup
- Revise program to better serve all participants
- Do not scale up without addressing subgroup differences

---

## 7. Missing Data Handling

### 7.1 Types of Missing Data

**Type 1: Item Non-Response**
- Participant skips one or more DLCS items
- Causes: confusion, discomfort, fatigue

**Type 2: Wave Attrition**
- Participant completes baseline but not post-program survey
- Causes: dropout, lost to follow-up, withdrew consent

**Type 3: Item Dropout**
- Participant completes some program sessions but not all
- Causes: scheduling conflicts, loss of interest, personal issues

### 7.2 Missing Data Prevention

**Strategy 1: Reduce Burden**
- Keep surveys short (15-20 minutes)
- Use clear, simple language
- Provide breaks during survey if needed

**Strategy 2: Build Rapport**
- Facilitator introduces self, explains purpose
- Facilitator builds trust with participant
- Facilitator checks in with participant periodically

**Strategy 3: Reminders**
- Send reminder before each survey (SMS, phone call, in-person)
- Offer flexible scheduling (multiple times, locations)
- Provide transportation assistance if needed

**Strategy 4: Incentives**
- Offer small incentive for completing surveys (e.g., phone credit, voucher)
- Incentive should not be coercive (small enough to not influence decision)

### 7.3 Missing Data Analysis

**Step 1: Quantify Missing Data**
- Count number of participants with missing data by type
- Calculate % of missing data (item non-response, wave attrition, item dropout)
- Compare baseline characteristics of participants with vs. without missing data

**Step 2: Assess Missing Data Mechanism**
- **Missing Completely at Random (MCAR):** Missing data is unrelated to observed or unobserved variables
  - Test: Little's MCAR test
  - If MCAR: listwise deletion is unbiased (but reduces power)
- **Missing at Random (MAR):** Missing data is related to observed variables, but not unobserved variables
  - Test: Compare baseline characteristics of participants with vs. without missing data
  - If MAR: multiple imputation is unbiased (if model is correct)
- **Missing Not at Random (MNAR):** Missing data is related to unobserved variables
  - Test: Sensitivity analysis (vary assumptions about missing data mechanism)
  - If MNAR: all methods are biased (must acknowledge limitation)

**Step 3: Choose Missing Data Method**

**Method 1: Listwise Deletion**
- Remove participants with any missing data
- Pros: Simple, unbiased if MCAR
- Cons: Reduces sample size, biased if not MCAR
- When to use: Missing data is <5% and MCAR

**Method 2: Mean Imputation**
- Replace missing values with mean of observed values
- Pros: Simple, preserves sample size
- Cons: Underestimates variance, biased if not MCAR
- When to use: Missing data is <5% and MCAR (rarely appropriate)

**Method 3: Multiple Imputation**
- Create multiple datasets with imputed values, analyze each, combine results
- Pros: Preserves sample size, unbiased if MAR, accounts for uncertainty
- Cons: Complex, requires statistical expertise, biased if MNAR
- When to use: Missing data is 5-40% and MAR

**Method 4: Sensitivity Analysis**
- Analyze data under different assumptions about missing data mechanism
- Pros: Acknowledges uncertainty, tests robustness of results
- Cons: Does not provide definitive answer
- When to use: Missing data is >40% or MNAR suspected

**Selected Method for This Pilot:**
- If missing data is <5%: listwise deletion
- If missing data is 5-40%: multiple imputation (assuming MAR)
- If missing data is >40%: sensitivity analysis (acknowledge limitation)

### 7.4 Missing Data Documentation

**Documentation Requirements:**
- Report number and % of participants with missing data by type
- Report baseline characteristics of participants with vs. without missing data
- Report missing data mechanism assessment (MCAR, MAR, MNAR)
- Report missing data method chosen and rationale
- Report sensitivity analysis results (if applicable)

**Example Missing Data Report:**
```
MISSING DATA REPORT

Sample: n=100 participants enrolled
Baseline survey: n=95 completed (95%), n=5 missing (5%)
Post-program survey: n=80 completed (80%), n=20 missing (20%)
Follow-up survey: n=70 completed (70%), n=30 missing (30%)

Missing data by type:
- Item non-response: n=5 participants skipped 1-2 DLCS items
- Wave attrition: n=20 participants did not complete post-program survey
- Item dropout: n=10 participants attended <8 of 10 sessions

Missing data mechanism:
- Little's MCAR test: χ²(50) = 65.3, p = 0.07 (not MCAR)
- Compare baseline characteristics: participants with missing post-program survey 
  had lower baseline DLCS (M=25 vs. M=30, p = 0.03) → MAR suspected

Missing data method:
- Multiple imputation (m=5 datasets) assuming MAR
- Imputation model: DLCS ~ age + gender + education + employment + device access + prior experience

Sensitivity analysis:
- Listwise deletion: d = 0.45 (95% CI: 0.20, 0.70)
- Multiple imputation: d = 0.48 (95% CI: 0.25, 0.71)
- Best case: d = 0.52 (95% CI: 0.28, 0.76)
- Worst case: d = 0.35 (95% CI: 0.10, 0.60)

Conclusion: Results are robust to missing data assumptions.
```

---

## 8. Ethical Review

### 8.1 Ethics Board Requirements

**When Ethics Review is Required:**
- Program involves human participants
- Program collects personal data (even if anonymized)
- Program tests intervention (program) and measures outcome
- Results will be published or presented

**Ethics Board Types:**
- **Institutional Review Board (IRB):** For academic institutions
- **Research Ethics Committee (REC):** For healthcare organizations
- **Independent Ethics Committee (IEC):** For non-profit organizations
- **Community Ethics Board:** For community-based programs (if available)

**Ethics Review Process:**
1. Submit ethics application (protocol, consent form, survey instruments)
2. Ethics board reviews application (2-4 weeks)
3. Ethics board approves, requests revisions, or rejects
4. If approved, begin data collection
5. If revisions requested, revise and resubmit
6. If rejected, do not proceed (or appeal)

**Ethics Review Timeline:**
- Start ethics review 2-3 months before data collection
- Allow 2-4 weeks for review
- Allow 2-4 weeks for revisions (if requested)
- Total: 2-3 months

### 8.2 Ethical Principles

**Principle 1: Respect for Persons**
- Participants are autonomous agents
- Participants with diminished autonomy are entitled to protection
- Informed consent is required (see Section 5)

**Principle 2: Beneficence**
- Maximize benefits, minimize harms
- Program should do good (improve digital literacy confidence)
- Program should do no harm (not decrease confidence, not burden participants)

**Principle 3: Justice**
- Benefits and burdens are distributed fairly
- Participants are not exploited (e.g., low-income populations bearing burden of research)
- Participants are not excluded (e.g., people with disabilities, non-native speakers)

**Principle 4: Privacy**
- Participants have right to control access to their personal information
- Data is collected only with consent
- Data is stored securely
- Data is shared only with consent

**Principle 5: Transparency**
- Participants are informed about purpose, procedures, risks, benefits
- Results are published (positive, null, harmful)
- Methods are documented (protocol, analysis plan)

### 8.3 Ethical Risks and Mitigations

**Risk 1: Coercion**
- Participants may feel pressured to consent (by staff, peers, family)
- Mitigation: Emphasize voluntary nature, allow time to decide, no penalty for refusal

**Risk 2: Privacy Breach**
- Personal data may be leaked, hacked, or misused
- Mitigation: Store data securely (encrypted database, locked file cabinet), limit access, anonymize for analysis

**Risk 3: Psychological Harm**
- Participants may feel uncomfortable answering questions (e.g., about digital skills)
- Mitigation: Allow skipping questions, provide support, refer to counseling if needed

**Risk 4: Stigmatization**
- Participants may be stigmatized for low digital literacy
- Mitigation: Emphasize confidentiality, avoid labeling, frame program positively

**Risk 5: Exploitation**
- Participants may bear burden of research without receiving benefits
- Mitigation: Provide program free of charge, share results with participants, involve participants in design

**Risk 6: Cultural Insensitivity**
- Program may not respect local customs, values, language
- Mitigation: Involve local community in design, translate materials, hire local staff

---

## 9. Data Management Plan

### 9.1 Data Collection

**Data Sources:**
- Baseline survey (week 0)
- Post-program survey (week 10)
- Follow-up survey (week 22)
- Program records (attendance, completion)

**Data Collection Methods:**
- In-person survey (paper or tablet)
- Phone survey (if in-person not feasible)
- Online survey (if participants have internet access)

**Data Collection Tools:**
- Paper survey forms (backup)
- Tablet with survey app (primary)
- Database for data entry and storage

### 9.2 Data Storage

**Storage Locations:**
- **Primary:** Encrypted database (password-protected, access-controlled)
- **Backup:** Encrypted cloud storage (password-protected, access-controlled)
- **Physical:** Locked file cabinet (consent forms, paper surveys)

**Storage Security:**
- Encryption: AES-256 (industry standard)
- Password: Strong password (12+ characters, mixed case, numbers, symbols)
- Access control: Only authorized staff (program evaluator, data entry staff)
- Audit trail: Log all access (who, when, what)

**Storage Duration:**
- Active data: 5 years (for analysis, publication, verification)
- After 5 years: Delete all personal data, retain anonymized data for future research

### 9.3 Data Processing

**Data Entry:**
- Double entry: Two staff enter data independently
- Discrepancy resolution: Third staff reviews and resolves discrepancies
- Data validation: Check for out-of-range values, missing data, logical inconsistencies

**Data Cleaning:**
- Remove duplicates
- Handle missing data (see Section 7)
- Recode variables (e.g., categorical variables)
- Create derived variables (e.g., DLCS total score)

**Data Analysis:**
- Descriptive statistics (mean, SD, median, IQR, frequencies)
- Inferential statistics (t-test, Wilcoxon, regression, effect size)
- Subgroup analysis (by demographics, prior experience)
- Sensitivity analysis (missing data assumptions)

**Data Analysis Software:**
- R (open source, reproducible)
- SPSS (commercial, user-friendly)
- Excel (for basic analysis, data visualization)

### 9.4 Data Sharing

**Data Sharing Policy:**
- Anonymized data may be shared for future research
- Personal data will not be shared
- Data sharing requires participant consent (see consent form)

**Data Sharing Methods:**
- De-identified dataset (remove names, contact info, identifiers)
- Data dictionary (describe variables, coding, units)
- Analysis code (R scripts, SPSS syntax)
- Documentation (protocol, consent form, survey instruments)

**Data Sharing Platforms:**
- Organization website (public download)
- Data repository (e.g., Dryad, Figshare, Zenodo)
- Request-based (email program evaluator)

### 9.5 Data Security Breach Protocol

**Breach Detection:**
- Unauthorized access detected by audit trail
- Data loss detected by backup verification
- Data leak detected by participant report or media

**Breach Response:**
1. Contain breach: Disable access, secure data
2. Assess breach: Determine scope, affected participants, data types
3. Notify participants: Inform affected participants within 72 hours
4. Notify authorities: Report breach to ethics board, funder, regulators (if required)
5. Investigate breach: Determine cause, responsible party
6. Remediate breach: Fix vulnerability, prevent recurrence
7. Document breach: Record details, response, lessons learned

**Breach Prevention:**
- Regular security audits
- Staff training on data security
- Encryption and access control
- Backup and disaster recovery plan

---

## 10. Analysis Plan

### 10.1 Primary Analysis

**Primary Outcome:** Change in DLCS from baseline to post-program

**Primary Analysis:**
- Paired t-test (if DLCS change is normally distributed)
- Wilcoxon signed-rank test (if DLCS change is not normally distributed)
- Effect size: Cohen's d (paired)
- Significance level: α = 0.05 (two-tailed)
- Confidence interval: 95% CI

**Normality Test:**
- Shapiro-Wilk test (n < 50)
- Kolmogorov-Smirnov test (n ≥ 50)
- Visual inspection: Histogram, Q-Q plot

**If Normal:**
- Paired t-test
- Report mean difference, SD, 95% CI, p-value, Cohen's d

**If Not Normal:**
- Wilcoxon signed-rank test
- Report median difference, IQR, 95% CI, p-value, effect size r

### 10.2 Secondary Analyses

**Secondary Outcome 1:** Change in DLCS from baseline to follow-up (week 22)
- Paired t-test or Wilcoxon signed-rank test
- Effect size: Cohen's d (paired)

**Secondary Outcome 2:** % of participants with clinically meaningful improvement (≥10 points on DLCS)
- Binomial test
- Report proportion, 95% CI

**Secondary Outcome 3:** Subgroup analysis (by demographics, prior experience)
- ANCOVA regression: post-program DLCS ~ treatment + baseline DLCS + subgroup
- Report subgroup-specific effect sizes

**Secondary Outcome 4:** Dose-response analysis (attendance vs. DLCS change)
- Linear regression: DLCS change ~ attendance + baseline DLCS + covariates
- Report regression coefficient, 95% CI, p-value

### 10.3 Exploratory Analyses

**Exploratory Analysis 1:** Qualitative analysis of open-ended responses
- Thematic analysis (identify themes in participant feedback)
- Report themes, frequencies, illustrative quotes

**Exploratory Analysis 2:** Process evaluation (program fidelity, participant satisfaction)
- Descriptive statistics (attendance, completion, satisfaction ratings)
- Report mean, SD, frequencies

**Exploratory Analysis 3:** Cost-effectiveness analysis (cost per unit of DLCS improvement)
- Calculate cost per participant
- Calculate cost per unit of DLCS improvement
- Report cost-effectiveness ratio

### 10.4 Statistical Power

**Power Analysis (Pre-Study):**
- Expected effect size: Cohen's d = 0.5 (medium)
- Significance level: α = 0.05 (two-tailed)
- Power: 1 - β = 0.80
- Required sample size: n = 34 participants (paired t-test)
- Adjust for attrition (20%): n = 43 participants
- Adjust for design effect (if clustered): n = 43 × DEFF

**Post-Hoc Power Analysis:**
- If results are null, calculate post-hoc power
- If power is low (<0.50), study was underpowered (null result may be Type II error)
- If power is high (≥0.80), study was adequately powered (null result is informative)

### 10.5 Analysis Software and Reproducibility

**Software:**
- R version 4.3.0 (or later)
- R packages: tidyverse, psych, effsize, ggplot2, knitr

**Reproducibility:**
- Analysis code saved in version control (Git)
- Analysis code documented (comments, README)
- Analysis code shared with publication (supplementary materials)
- Random seed set for reproducibility (set.seed(12345))

---

## 11. Reporting Plan

### 11.1 Reporting Standards

**CONSORT Checklist (for RCTs):**
- Not applicable (this is a pre-post design, not RCT)

**TREND Checklist (for quasi-experimental studies):**
- Not applicable (this is a pre-post design, not quasi-experimental)

**STROBE Checklist (for observational studies):**
- Applicable (this is a pre-post observational study)
- Report all STROBE items (title, abstract, introduction, methods, results, discussion)

**TIDieR Checklist (for intervention descriptions):**
- Applicable (this is an intervention study)
- Report all TIDieR items (brief name, why, what, who, how, where, when, how much, tailoring, modifications, fidelity)

### 11.2 Reporting Timeline

**Interim Report (Month 6):**
- Baseline characteristics
- Program enrollment, attendance, completion
- Preliminary results (if available)
- Challenges, lessons learned

**Final Report (Month 12):**
- Full analysis (primary, secondary, exploratory)
- Interpretation, implications, limitations
- Recommendations for future research, practice, policy

**Publication (Month 18):**
- Journal article (peer-reviewed)
- Conference presentation (if applicable)
- Plain language summary (for participants, community)

### 11.3 Reporting Format

**Technical Report:**
- Length: 50-100 pages
- Audience: Funders, researchers, policymakers
- Format: PDF, Word
- Sections: Executive summary, introduction, methods, results, discussion, recommendations, references, appendices

**Plain Language Summary:**
- Length: 2-4 pages
- Audience: Participants, community, general public
- Format: PDF, web page
- Sections: What we did, what we found, what it means, what's next

**Journal Article:**
- Length: 3,000-5,000 words
- Audience: Researchers, practitioners
- Format: PDF, HTML
- Sections: Abstract, introduction, methods, results, discussion, references

**Conference Presentation:**
- Length: 15-20 minutes
- Audience: Researchers, practitioners, policymakers
- Format: PowerPoint, Prezi
- Sections: Background, methods, results, discussion, Q&A

### 11.4 Reporting Dissemination

**Dissemination Channels:**
- Organization website (public download)
- Funder report (confidential, if required)
- Participant communication (email, phone, in-person meeting)
- Community meeting (present results, discuss implications)
- Conference presentation (peer-reviewed)
- Journal article (peer-reviewed)
- Social media (brief summary, infographic)
- Press release (if newsworthy)

**Dissemination Timeline:**
- Month 6: Interim report to funder
- Month 12: Final report to funder, participants, community
- Month 18: Journal article submission
- Month 24: Conference presentation

---

## 12. Limitations and Caveats

### 12.1 Design Limitations

**Limitation 1: No Control Group**
- Pre-post design cannot attribute change to program
- Threats to internal validity: history, maturation, testing, instrumentation, regression to mean
- Mitigation: Acknowledge limitation, interpret results cautiously, design RCT for future study

**Limitation 2: Self-Report Measure**
- DLCS is self-reported confidence, not actual skill
- Social desirability bias: participants may over-report confidence
- Recall bias: participants may not accurately remember baseline confidence
- Mitigation: Use validated scale, ensure anonymity, triangulate with behavioral measure (if feasible)

**Limitation 3: Small Sample Size**
- Pilot is small (n=50-100), limiting statistical power
- May not detect small effects (Type II error)
- May not generalize to larger population
- Mitigation: Calculate power, interpret results as preliminary, design larger study for future

**Limitation 4: Short Follow-Up**
- Follow-up is 3 months post-program, not long-term
- May not capture lasting effects (or decay of effects)
- Mitigation: Acknowledge limitation, plan longer follow-up for future study

### 12.2 Measurement Limitations

**Limitation 5: DLCS Validity**
- DLCS measures confidence, not skill
- Confidence may not translate to behavior
- DLCS may not capture all aspects of digital literacy
- Mitigation: Use validated scale, triangulate with other measures (if feasible), acknowledge limitation

**Limitation 6: DLCS Reliability**
- DLCS may have low test-retest reliability
- DLCS may have low internal consistency
- Mitigation: Calculate Cronbach's alpha, ICC, acknowledge limitation

**Limitation 7: Cultural Bias**
- DLCS items may be culturally biased (e.g., "online banking" not relevant in all contexts)
- DLCS may not be valid for all populations
- Mitigation: Review items with local community, translate to local language, pilot test, acknowledge limitation

### 12.3 Implementation Limitations

**Limitation 8: Program Fidelity**
- Volunteers may not deliver program as intended
- Program may vary across sites, sessions
- Mitigation: Train volunteers, monitor fidelity, document deviations, acknowledge limitation

**Limitation 9: Participant Attrition**
- Participants may drop out of program
- Participants may not complete surveys
- Attrition may be non-random (e.g., less motivated participants drop out)
- Mitigation: Track attrition, compare completers vs. non-completers, use multiple imputation, acknowledge limitation

**Limitation 10: Resource Constraints**
- Pilot may lack resources for rigorous evaluation (e.g., no control group, small sample)
- Mitigation: Prioritize feasible methods, document resource constraints, seek funding for future study

### 12.4 Ethical Limitations

**Limitation 11: Consent Process**
- Participants may not fully understand consent form
- Participants may feel pressured to consent
- Mitigation: Use plain language, allow time to decide, emphasize voluntary nature, acknowledge limitation

**Limitation 12: Privacy Protection**
- Data may be breached, leaked, or misused
- Mitigation: Store data securely, limit access, anonymize for analysis, acknowledge limitation

**Limitation 13: Cultural Sensitivity**
- Program may not respect local customs, values, language
- Mitigation: Involve local community in design, translate materials, hire local staff, acknowledge limitation

---

## 13. Deferred Items

The following items are explicitly deferred to future work:

1. **Ethics Board Approval:** This document includes ethics review requirements, but does not include actual ethics board approval. Approval is deferred to ethics board.

2. **Participant Recruitment:** This document includes recruitment criteria, but does not include actual recruitment. Recruitment is deferred to program staff.

3. **Baseline Data Collection:** This document includes baseline data collection protocol, but does not include actual data collection. Collection is deferred to program implementation.

4. **Program Implementation:** This document includes program design, but does not include actual implementation. Implementation is deferred to program staff.

5. **Post-Program Data Collection:** This document includes post-program data collection protocol, but does not include actual data collection. Collection is deferred to program implementation.

6. **Data Analysis:** This document includes analysis plan, but does not include actual analysis. Analysis is deferred to data collection completion.

7. **Result Publication:** This document includes reporting plan, but does not include actual publication. Publication is deferred to analysis completion.

8. **Program Evaluator Recruitment:** This document includes evaluator qualifications, but does not include actual recruitment. Recruitment is deferred to organization.

9. **DLCS Validation Study:** This document includes validity and reliability requirements, but does not include actual validation study. Validation is deferred to future research.

10. **RCT Design:** This document recommends RCT for future study, but does not include actual RCT design. Design is deferred to future work.

11. **Long-Term Follow-Up:** This document includes 3-month follow-up, but does not include long-term follow-up (1 year, 5 years). Long-term follow-up is deferred to future work.

12. **Cost-Effectiveness Analysis:** This document mentions cost-effectiveness analysis as exploratory, but does not include full analysis. Full analysis is deferred to future work.

13. **Qualitative Study:** This document mentions qualitative analysis as exploratory, but does not include full qualitative study. Full study is deferred to future work.

14. **Process Evaluation:** This document mentions process evaluation as exploratory, but does not include full process evaluation. Full evaluation is deferred to future work.

15. **Subgroup Analysis Plan:** This document mentions subgroup analysis, but does not include detailed plan for all subgroups. Detailed plan is deferred to future work.

16. **Missing Data Sensitivity Analysis:** This document mentions sensitivity analysis, but does not include full analysis under all assumptions. Full analysis is deferred to data collection completion.

17. **Cultural Adaptation:** This document mentions cultural sensitivity, but does not include full cultural adaptation of materials. Full adaptation is deferred to local community review.

18. **Translation:** This document mentions translation, but does not include actual translation of materials. Translation is deferred to program implementation.

19. **Training Materials:** This document mentions volunteer training, but does not include actual training materials. Materials are deferred to program implementation.

20. **Data Security Audit:** This document mentions data security, but does not include actual security audit. Audit is deferred to IT department.

---

## 14. Success Metrics

### 14.1 Quantitative Metrics

1. **Enrollment Rate:** % of eligible participants who enroll
   - Target: >80%
   - Measurement: Program records

2. **Retention Rate:** % of enrolled participants who complete program
   - Target: >70%
   - Measurement: Program records

3. **Survey Completion Rate:** % of participants who complete surveys
   - Target: >90% baseline, >80% post-program, >70% follow-up
   - Measurement: Survey records

4. **Missing Data Rate:** % of survey items missing
   - Target: <5%
   - Measurement: Data quality checks

5. **Effect Size:** Cohen's d for DLCS change
   - Target: d > 0.5 (medium effect)
   - Measurement: Statistical analysis

6. **Statistical Significance:** p-value for DLCS change
   - Target: p < 0.05
   - Measurement: Statistical analysis

### 14.2 Qualitative Metrics

1. **Participant Satisfaction:** Participant feedback on program
   - Target: Positive feedback
   - Measurement: Open-ended survey responses, interviews

2. **Program Fidelity:** Volunteer adherence to curriculum
   - Target: High fidelity
   - Measurement: Observation, volunteer self-report

3. **Cultural Appropriateness:** Program respect for local customs, values
   - Target: Culturally appropriate
   - Measurement: Community feedback, participant feedback

4. **Evaluator Confidence:** Program evaluator confidence in results
   - Target: High confidence
   - Measurement: Evaluator self-assessment

5. **Stakeholder Trust:** Funder, community, participant trust in results
   - Target: High trust
   - Measurement: Stakeholder feedback

---

## 15. Conclusion

This design document establishes an outcome measurement plan for a hypothetical charitable pilot program before any pilot begins. The plan defines:

- **One specific outcome:** Digital Literacy Confidence Score (DLCS), a 10-item self-report scale measuring confidence in using digital tools
- **Baseline measurement:** Pre-pilot data collection with informed consent, descriptive statistics, subgroup analysis
- **Credible evidence method:** Pre-post design (minimum viable), with rationale for why RCT is not feasible for this pilot
- **Consent framework:** 7-stage consent process, documentation, vulnerable population protections
- **Null/harmful results handling:** Pre-commitment to publication, scenario planning, response protocols
- **Missing data handling:** Prevention strategies, analysis methods (listwise deletion, multiple imputation, sensitivity analysis), documentation requirements
- **Ethical review:** Ethics board requirements, ethical principles, risk mitigations
- **Data management plan:** Collection, storage, processing, sharing, security breach protocol
- **Analysis plan:** Primary, secondary, exploratory analyses, statistical power, reproducibility
- **Reporting plan:** Reporting standards, timeline, format, dissemination
- **Limitations and caveats:** 13 design, measurement, implementation, and ethical limitations
- **Deferred items:** 20 items explicitly deferred to future work
- **Success metrics:** 6 quantitative and 5 qualitative metrics

The plan satisfies the requirements of M49-09: it separates output, outcome, and attribution; includes null/harmful results and missing data; and is designed before the pilot begins.

**Status:** BASELINE ESTABLISHED — design complete, implementation deferred.

---

## Appendix A: Digital Literacy Confidence Score (DLCS) Instrument

**Instructions:** "How confident are you in your ability to do the following? Please circle one number for each item."

**Response Scale:** 1 = Not confident at all, 2 = Slightly confident, 3 = Moderately confident, 4 = Very confident, 5 = Extremely confident

**Items:**
1. Send an email with an attachment: 1 2 3 4 5
2. Search for information online: 1 2 3 4 5
3. Create a document using word processing software: 1 2 3 4 5
4. Use social media safely: 1 2 3 4 5
5. Recognize phishing emails: 1 2 3 4 5
6. Set up a new email account: 1 2 3 4 5
7. Apply for a job online: 1 2 3 4 5
8. Use online banking: 1 2 3 4 5
9. Video call with family/friends: 1 2 3 4 5
10. Protect your personal information online: 1 2 3 4 5

**Scoring:**
- Sum of 10 items: Range 10-50
- Higher score = higher confidence
- Missing items: If ≤2 items missing, calculate mean of completed items and multiply by 10. If >2 items missing, exclude from analysis.

**Interpretation:**
- 10-20: Low confidence
- 21-30: Moderate confidence
- 31-40: High confidence
- 41-50: Very high confidence

**Validation:**
- Cronbach's alpha: Target α > 0.7
- Test-retest reliability: Target ICC > 0.7
- Construct validity: Compare to digital literacy test scores (future study)

## Appendix B: Sample Size Calculation

**Power Analysis (Pre-Study):**
- Expected effect size: Cohen's d = 0.5 (medium)
- Significance level: α = 0.05 (two-tailed)
- Power: 1 - β = 0.80
- Required sample size: n = 34 participants (paired t-test)
- Adjust for attrition (20%): n = 34 / 0.80 = 43 participants
- Adjust for design effect (if clustered): n = 43 × DEFF

**Formula:**
```
n = (Zα/2 + Zβ)² × 2σ² / Δ²

Where:
- Zα/2 = 1.96 (for α = 0.05, two-tailed)
- Zβ = 0.84 (for power = 0.80)
- σ = standard deviation of DLCS change (estimate from pilot data or literature)
- Δ = minimum detectable difference (estimate from pilot data or literature)

For Cohen's d = 0.5:
n = (1.96 + 0.84)² × 2 / 0.5² = 34 participants
```

**Software:**
- G*Power (free, user-friendly)
- R (pwr package)
- Stata (power command)

## Appendix C: Consent Form Template (Local Language)

**Instructions:** Translate consent form into local language(s). Use plain language (8th grade reading level). Have local community review for cultural appropriateness.

**Template:**

```
[LOCAL LANGUAGE CONSENT FORM]

Program Title: [Translate]
Principal Investigator: [Translate]
Organization: [Translate]
Contact: [Translate]

PURPOSE:
[Translate]

PROCEDURES:
[Translate]

RISKS:
[Translate]

BENEFITS:
[Translate]

CONFIDENTIALITY:
[Translate]

VOLUNTARY PARTICIPATION:
[Translate]

CONTACT:
[Translate]

CONSENT:
[Translate]

Participant Name: _________________________
Participant Signature: ______________________
Date: ______________________________________

Facilitator Name: ___________________________
Facilitator Signature: _______________________
Date: ______________________________________
```

## Appendix D: Data Collection Timeline

**Week 0 (Baseline):**
- Day 1: Recruit participants, obtain consent
- Day 2: Administer baseline survey
- Day 3: Enter data, check quality

**Weeks 1-10 (Program):**
- Week 1: Session 1
- Week 2: Session 2
- ...
- Week 10: Session 10

**Week 10 (Post-Program):**
- Day 1: Administer post-program survey
- Day 2: Enter data, check quality

**Week 22 (Follow-Up):**
- Day 1: Contact participants, administer follow-up survey
- Day 2: Enter data, check quality

**Week 26 (Analysis):**
- Week 26-30: Clean data, analyze data
- Week 31-34: Write report
- Week 35-38: Submit report, publish results

## Appendix E: Budget Estimate

**Personnel:**
- Program evaluator: 20 days × $500/day = $10,000
- Data entry staff: 10 days × $200/day = $2,000
- Facilitators: 20 days × $150/day = $3,000
- Total personnel: $15,000

**Materials:**
- Survey tablets: 5 × $200 = $1,000
- Paper surveys: 500 × $0.50 = $250
- Consent forms: 500 × $0.25 = $125
- Total materials: $1,375

**Travel:**
- Transportation: $500
- Accommodation: $1,000
- Total travel: $1,500

**Miscellaneous:**
- Participant incentives: 100 × $10 = $1,000
- Data storage (cloud): $200
- Software (R, SPSS): $500
- Total miscellaneous: $1,700

**Total Budget:**
- Personnel: $15,000
- Materials: $1,375
- Travel: $1,500
- Miscellaneous: $1,700
- **Total: $19,575**

**Note:** Budget is estimate only. Actual costs depend on local context, duration, scale.

## Appendix F: Glossary

**Baseline:** Pre-program measurement of outcome variable.

**Post-program:** Post-program measurement of outcome variable.

**Follow-up:** Measurement of outcome variable at specified time after program completion.

**Outcome:** Change in participant knowledge, skill, behavior, or condition resulting from program.

**Output:** Product or service delivered by program (e.g., training sessions, materials).

**Impact:** Long-term change in participant or community condition resulting from program.

**Attribution:** Causal link between program and outcome.

**Effect size:** Standardized measure of magnitude of program effect (e.g., Cohen's d).

**Statistical significance:** Probability that observed effect is due to chance (p-value).

**Power:** Probability of detecting effect if effect exists (1 - β).

**Attrition:** Loss of participants from study over time.

**Missing data:** Absent data points due to non-response, dropout, or error.

**Multiple imputation:** Statistical method for handling missing data by creating multiple plausible values.

**Sensitivity analysis:** Analysis of results under different assumptions about missing data.

**Informed consent:** Voluntary agreement to participate in study after receiving information about purpose, procedures, risks, benefits.

**Ethics review:** Review of study protocol by independent ethics board to ensure ethical standards.

**Data management:** Processes for collecting, storing, processing, sharing, and securing data.

**Analysis plan:** Pre-specified plan for statistical analysis of data.

**Reporting plan:** Pre-specified plan for disseminating results.

**CONSORT:** Consolidated Standards of Reporting Trials (checklist for RCTs).

**TREND:** Transparent Reporting of Evaluations with Nonrandomized Designs (checklist for quasi-experimental studies).

**STROBE:** Strengthening the Reporting of Observational Studies in Epidemiology (checklist for observational studies).

**TIDieR:** Template for Intervention Description and Replication (checklist for intervention descriptions).
