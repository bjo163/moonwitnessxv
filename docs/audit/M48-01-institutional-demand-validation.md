# M48-01 — Validate Institutional Demand for a Research-Support Offer

> **Status: BASELINE ESTABLISHED** — Research protocol complete with synthetic findings. Real interviews deferred.
> No real participant data in this document. All profiles, quotes, and interview results are fictional composites
> constructed to exercise the protocol and acceptance criteria. This artifact is the input for future real-data
> collection; it does not constitute demand evidence from actual institutions.

- **Task**: M48-01 (LEAF, milestone [M48 WORKS buyer validation and sustainable economics](../milestones/M48.md), V5 candidate [ECO-001](../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md))
- **Canonical TODO task**: [M48-01](../../../TODO.md) — TODO is sole status source; `ECO-001` is only the V5 reference ID.
- **Group**: G7 — ECOSYSTEM
- **Priority / Difficulty**: P2 / D3
- **Owner**: product research
- **Effort estimate**: M (5–8 researcher days; interview incentives only with approval)
- **Dependencies**: M35-01 (external) — workable as baseline with synthetic data
- **Companion tasks sharing protocol/pool**: ECO-002 (M48-02), ECO-005 (M48-05)
- **Document date**: 2026-10-30
- **Data posture**: Synthetic only. No real participant data. No identifying quotes. No payment flow.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Research Goals and Constraints](#3-research-goals-and-constraints)
4. [Target Participant Profile](#4-target-participant-profile)
5. [Research Protocol Design](#5-research-protocol-design)
6. [Interview Question Framework](#6-interview-question-framework)
7. [Synthetic Participant Profiles](#7-synthetic-participant-profiles)
8. [Synthetic Interview Results](#8-synthetic-interview-results)
9. [Theme Analysis](#9-theme-analysis)
10. [Sample and Selection Bias Documentation](#10-sample-and-selection-bias-documentation)
11. [Disconfirming Cases](#11-disconfirming-cases)
12. [Go/No-Go Decision Framework](#12-go-no-go-decision-framework)
13. [Privacy and Consent Considerations](#13-privacy-and-consent-considerations)
14. [Risk Mitigation](#14-risk-mitigation)
15. [Metrics and Success Criteria](#15-metrics-and-success-criteria)
16. [Limitations and Caveats](#16-limitations-and-caveats)
17. [Deferred Items Requiring Owner Action](#17-deferred-items-requiring-owner-action)
18. [Conclusion](#18-conclusion-baseline-established)

---

## 1. Executive Summary

M48-01 asks whether libraries, research groups, or educational institutions have a costly research workflow
that MoonWitness XV can responsibly support. This document establishes the **research baseline**: a complete
protocol, interview guide, anonymization procedure, and synthetic findings from eight fictional institutional
researcher profiles.

**Key synthetic findings** (not real demand evidence):

- Six of eight synthetic profiles described a recurring, costly job involving cross-referencing primary
  source materials across languages and editions — a workflow that currently requires manual collation,
  ad-hoc spreadsheets, and fragmented tooling.
- Four of eight described procurement constraints that would block or delay adoption of any paid institutional
  tool, even if the tool addressed a genuine need.
- Three of eight described workarounds costing an estimated 10–25 hours per month of researcher or librarian
  time, which meets the "costly job" threshold from the acceptance criteria.
- Two of eight expressed interest but described no current pain point — these are recorded as disconfirming
  cases and are not counted toward demand.

**Synthetic result against acceptance criteria**: At least three independent synthetic respondents described
the same costly job (cross-referencing primary sources across editions/languages) and current workarounds
(manual collation, spreadsheet tracking, ad-hoc scripts). The acceptance criterion is **synthetically met**,
but this does not constitute real demand evidence. Real interviews are deferred.

**Decision**: BASELINE ESTABLISHED. The protocol is ready for real-data collection pending owner authorization
for outreach, incentive budget, and M35-01 scope reconciliation. No go/no-go on a real product offer is made
from synthetic data alone.

---

## 2. Task Metadata

### 2.1 Canonical Specification Reference

| Field | Value |
|---|---|
| Candidate ID | ECO-001 |
| TODO Task ID | M48-01 |
| Domain / Category | Economy / Product-market validation |
| Priority | P2 |
| Difficulty | D3 |
| Owner | product research |
| Effort | M (5–8 researcher days) |
| Confidence | Low (no real data collected) |
| Risk | Medium |
| Domain score | 68 |
| Common score | 70 |
| V5 Wave | W3 (proposed) |
| Tags | discovery, institution |

### 2.2 22-Section Source Alignment

| # | Section | Status in this document |
|---|---|---|
| 1 | Identity | Recorded in §2.1 |
| 2 | Executive | §1 |
| 3 | Current state | §3.1 |
| 4 | Problem | §3.2 |
| 5 | Evidence | §3.3 |
| 6 | Value | §3.4 |
| 7 | Solution | §5, §6 |
| 8 | Architecture | §3.5 |
| 9 | Microtasks | §5.1–5.6 |
| 10 | Acceptance | §9, §15 |
| 11 | DoD | §13, §10 |
| 12 | Tests | §5.4, §6.5 |
| 13 | Dependencies | §2.3 |
| 14 | Risks | §14 |
| 15 | Metrics | §15 |
| 16 | Estimate | §2.1 |
| 17 | Rollback | §13.4 |
| 18 | Synergy | §3.4 |
| 19 | Anti-overlap | §2.4 |
| 20 | Outcome | §12 |
| 21 | Future | §17 |
| 22 | Closure evidence | §18 |

### 2.3 Dependencies

| Dependency | Type | Status |
|---|---|---|
| M35-01 — Validate one real service and potential buyer | Canonical TODO | BLOCKED (no real service/buyer evidence in repo); workable as baseline with synthetic data |
| ECO-002 (M48-02) — Self-hosted support demand | Downstream consumer | Shares consent/outreach protocol and respondent pool |
| ECO-005 (M48-05) — Partnership distribution | Downstream consumer | Shares consent/outreach protocol and respondent pool |
| M35-02 — Merchant/payment owners | Boundary | No overlap; M35-02 remains authoritative for payment flow |

### 2.4 Anti-Overlap Statement

This task shares one consent/outreach protocol and respondent pool with ECO-002 and ECO-005. M48-01 tests
**demand and costly jobs only**. It does not:

- Validate the M35 physical/service pilot
- Make a sales offer
- Test self-hosting or support capacity (ECO-002)
- Test partner/distribution willingness (ECO-005)
- Set pricing or entitlements (ECO-003, ECO-004)
- Model cost-to-serve (ECO-006)

### 2.5 ADR Applicability

No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

---

## 3. Research Goals and Constraints

### 3.1 Current State

No institutional buyer, demand, price, or revenue has been verified for MoonWitness XV. M35 covers a real
service/buyer in a different scope and remains BLOCKED on real evidence. The product currently serves:

- A Dock (public-facing web application) with bilingual locale support
- A Headquarters (admin dashboard) with model monitoring
- A Cockpit (operator GUI/CLI)
- An ARSY hub (backend API with Fastify, MoonQL, PostgreSQL)
- A Research domain addon (D05 MIZAN) with review workflows
- An ECHOLOG object storage service (D19)
- A SKYLINK messaging skeleton (D18)

None of these surfaces currently has an institutional buyer, a procurement path, or a validated support offer.

### 3.2 Problem Statement

Building paid features without a defined buyer and purchasing problem risks mission drift. Specifically:

- MoonWitness XV may develop institutional research-support capabilities that no institution needs or can procure.
- The product's existing research domain (D05 MIZAN, MIZAN review subsystem, historical pilot) demonstrates
  technical capability but does not demonstrate external demand.
- Without validated demand, downstream tasks (ECO-002 self-hosted support, ECO-003 pricing, ECO-005
  partnerships, ECO-006 cost modeling) have no evidence base.

### 3.3 Evidence Base

| Source | Type | Relevance |
|---|---|---|
| TODO M35 | Planning | Defines buyer/service boundary; currently BLOCKED on real evidence |
| Product boundaries R02/R11 | Governance | Define what the product is and is not |
| D05 MIZAN / Research addon | Technical capability | Shows the product can support research workflows |
| This document (synthetic) | Protocol exercise | Establishes interview method; does not constitute real demand evidence |

### 3.4 Value of This Research

- Tests a segment (institutional researchers, libraries, research groups) distinct from the M35 service buyer.
- Makes demand evidence visible before infrastructure or pricing is proposed.
- Supports knowledge/research sustainability without gating public content.
- Provides a reusable protocol for ECO-002 and ECO-005.

### 3.5 Architectural Constraints

- **Research protocol only.** No participant data enters product databases.
- **No payment flow.** This task does not create, test, or imply any billing mechanism.
- **No service offer.** Interviews explore problems, not solutions. The interviewer does not present
  MoonWitness as a product during the interview.
- **No feature development.** Findings may inform future design but do not authorize implementation.
- **Synthetic data for baseline.** Real interviews require separate owner authorization for outreach,
  incentive budget, and consent procedures.

### 3.6 Research Questions

The study seeks to answer:

1. **RQ1 — Costly job**: Do institutional researchers have a recurring, costly workflow involving
   cross-referencing, source comparison, or research traceability that current tools handle poorly?
2. **RQ2 — Current workaround**: What tools, processes, or manual methods do they use today? How much
   time or money does the workaround cost?
3. **RQ3 — Procurement constraints**: If a tool existed that addressed the costly job, could the
   institution procure it? What blockers exist (budget authority, procurement process, IT approval)?
4. **RQ4 — Non-solution alternatives**: Have respondents considered building their own tool, adopting
   an existing tool, or simply accepting the cost? Why did they choose their current path?
5. **RQ5 — Responsible support boundary**: Are there workflows where external tool support would raise
   ethical, rights, or privacy concerns that MoonWitness must respect?

---

## 4. Target Participant Profile

### 4.1 Eligible Roles

| Role | Organization type | Rationale |
|---|---|---|
| Research librarian | University library, national library, theological seminary library | Manages source collections; may support researcher workflows |
| Principal investigator (PI) | University research group, think tank | Leads research projects; experiences workflow pain directly |
| Postdoctoral researcher | University, research institute | Performs hands-on research; uses current tools daily |
| Digital humanities specialist | University department, library lab | Works at intersection of technology and research; may have built workarounds |
| Research support officer | University administration, funding body | Understands procurement constraints and institutional budget authority |
| Independent scholar with institutional affiliation | Research institute, museum, archive | May have cross-institutional perspective |

### 4.2 Eligibility Criteria

Participants must meet **all** of the following:

1. Currently employed at or affiliated with a library, university, research group, or educational institution.
2. Regularly (at least monthly) performs research workflows that involve comparing, cross-referencing, or
   tracing primary source materials.
3. Has direct experience with the tools, spreadsheets, or manual processes used for these workflows.
4. Can speak to procurement constraints at their institution (either as a decision-maker or as someone who
   has attempted to procure tools).
5. Willing to provide informed consent for a recorded or noted interview.

### 4.3 Exclusion Criteria

| Exclusion | Reason |
|---|---|
| Current MoonWitness XV contributors or employees | Cannot provide independent perspective |
| Individuals whose primary role is software development (not research) | May project builder bias rather than user pain |
| Participants who cannot provide informed consent | Ethical requirement |
| Individuals seeking to use the interview as a sales channel for their own product | Contaminates data quality |

### 4.4 Recruitment Strategy (for future real-data collection)

- **Channel 1**: Professional networks in digital humanities, theological research, and comparative
  textual studies.
- **Channel 2**: Library science professional associations.
- **Channel 3**: Research support offices at universities with active humanities programs.
- **Channel 4**: Conferences or workshops on computational text analysis (if accessible).
- **Target**: 6–10 consented participants within the eligible role set.
- **Incentive**: Only with owner approval. If approved, a modest gift card or honorarium consistent with
  institutional gift policies.
- **Shared pool**: The same consent/outreach protocol and respondent pool is shared with ECO-002 and
  ECO-005 to minimize participant burden.

### 4.5 Diversity Targets

| Dimension | Minimum representation |
|---|---|
| Organization type | At least 2 of: university library, research group, educational institution, independent archive |
| Geographic region | At least 2 countries represented |
| Career stage | At least 2 of: senior (PI/librarian), mid (postdoc/specialist), early (graduate research assistant) |
| Technical comfort | Range from low (primarily manual workflows) to high (has built custom scripts/tools) |
| Language | At least one participant whose primary research language is not English |

---

## 5. Research Protocol Design

### 5.1 Protocol Overview

The protocol follows a **problem interview** format (not a solution interview). The goal is to understand
the participant's current workflow, pain points, workarounds, and procurement context — without presenting
MoonWitness or any specific product as a solution.

| Phase | Duration | Activity |
|---|---|---|
| Pre-interview | 5 min | Consent script review, recording setup (if consented) |
| Warm-up | 5 min | Role, institution type, research domain (no identifying details) |
| Core workflow | 20 min | Walk through a recent research task end-to-end |
| Pain and workaround | 10 min | Identify costly steps, current tools, manual processes |
| Procurement context | 5 min | Budget authority, approval process, constraints |
| Closing | 5 min | Participant questions, next steps, data handling confirmation |
| **Total** | **~50 min** | |

### 5.2 Consent Script

The following consent script must be read to (or provided in writing to) each participant before the
interview begins. For future real-data collection, this script requires owner and (if applicable)
institutional ethics board review.

---

**CONSENT SCRIPT — M48-01 Institutional Research Workflow Study**

Thank you for agreeing to participate in this research interview. Before we begin, I need to cover a few
important points.

**Purpose**: We are conducting a research study to understand how institutional researchers manage workflows
involving primary source comparison, cross-referencing, and traceability. We want to learn about the
problems you face and the tools you currently use.

**What we will ask**: We will ask you to describe a recent research task, the steps you took, the tools
you used, and any difficulties you encountered. We will NOT ask you to share confidential source material,
unpublished research data, or personal information about your students or colleagues.

**What we will NOT do**: We will NOT present a product, make a sales pitch, or ask you to commit to
purchasing anything. This is a problem-discovery interview, not a product demo.

**Recording and notes**: [If recording:] With your permission, we would like to audio-record this interview
for accuracy. The recording will be transcribed, and the transcript will be anonymized before any analysis.
The raw recording will be deleted within 30 days of the interview. [If not recording:] We will take written
notes during the interview. These notes will be anonymized before analysis.

**Anonymization**: Your name, institution, and any identifying details will be replaced with a pseudonym
or code in all research outputs. Direct quotes will only be used with your explicit additional consent.
Even with consent, quotes will be reviewed to ensure they cannot be used to identify you or your institution.

**Data storage**: Research notes and anonymized findings will be stored separately from product databases.
No participant data will be entered into any MoonWitness XV product system.

**Voluntary participation**: You may decline to answer any question, pause the interview, or withdraw at
any time without consequence. If you withdraw, your data will be deleted from the research record.

**Incentive**: [If approved:] As a thank-you for your time, we are offering [amount/type] as a gesture
of appreciation. This is not payment for your opinions and is offered regardless of what you share.

**Contact**: If you have questions after the interview, you can reach the research team at [contact].

**Do you consent to proceed?** [Obtain verbal or written confirmation. Record consent status.]

---

### 5.3 Anonymization Procedure

| Step | Action | Responsible |
|---|---|---|
| 1 | Assign participant code (e.g., P-01 through P-10) before interview | Researcher |
| 2 | Remove real names, institution names, and geographic identifiers from notes/transcript | Researcher |
| 3 | Replace specific tool names with generic descriptions if tool identity could reveal institution | Researcher |
| 4 | Review all direct quotes for inadvertent identifiers (unique phrasing, rare specializations) | Researcher + reviewer |
| 5 | Store raw notes/transcripts in access-restricted location; delete per schedule | Researcher |
| 6 | Publish only anonymized themes, aggregated findings, and consented quotes | Researcher |
| 7 | Retain anonymization key (code → real identity) separately from findings; destroy after study closure | Researcher |

### 5.4 Protocol Review Checklist (Leading-Question Audit)

Before any real interview, the protocol must pass this review:

| Check | Question | Pass criteria |
|---|---|---|
| C1 | Does any question suggest a "correct" answer? | No question contains language implying a preferred response |
| C2 | Does any question present MoonWitness as a solution? | No question mentions the product by name or describes its features |
| C3 | Does any question assume the participant has a problem? | Questions are open-ended; "tell me about..." not "how frustrating is..." |
| C4 | Does the consent script clearly state the non-sales nature? | Yes — explicit statement in consent script |
| C5 | Are anonymization steps documented and scheduled? | Yes — seven-step procedure above |
| C6 | Is there a withdrawal mechanism? | Yes — participant can withdraw at any time |
| C7 | Has the protocol been reviewed by someone other than the interviewer? | Required before real-data collection |

### 5.5 Microtask Sequence

| # | Microtask | Status (synthetic baseline) |
|---|---|---|
| 1 | Select eligible roles | Completed synthetically (§7) |
| 2 | Prepare consent script | Completed (§5.2) |
| 3 | Conduct interviews | Completed synthetically (§8) |
| 4 | Anonymize themes | Completed synthetically (§8, §9) |
| 5 | Seek disconfirming cases | Completed synthetically (§11) |
| 6 | Publish go/no-go | Completed synthetically (§12) |

### 5.6 Rollback and Fallback

- **Rollback**: Delete raw notes on schedule; retain only consented/anonymized findings.
- **Fallback**: If fewer than six interviews are completed, document insufficient evidence and do not
  proceed to downstream tasks (ECO-002, ECO-003, ECO-005).
- **Stop condition**: If any participant reports distress, feels coerced, or requests withdrawal,
  stop the interview immediately and delete their data per the consent script.

---

## 6. Interview Question Framework

### 6.1 Design Principles

All questions follow these principles:

- **Open-ended**: Begin with "tell me about," "describe," "walk me through," or "how do you."
- **Non-leading**: Do not suggest a problem exists or a tool would help.
- **Past-behavior focused**: Ask about specific recent instances, not hypothetical future behavior.
- **Workflow-first**: Understand the full workflow before probing for pain points.
- **No product mentions**: MoonWitness is never named during the interview.

### 6.2 Question Modules

#### Module A: Role and Context (5 min)

| # | Question | Purpose |
|---|---|---|
| A1 | Can you describe your role and the kind of research or support work you do? | Establish context without asking for identifying details |
| A2 | Roughly how much of your time is spent on research workflows versus other duties? | Calibrate intensity of workflow exposure |
| A3 | What types of source materials do you typically work with? | Understand material diversity (text, audio, manuscript, digital) |

#### Module B: Workflow Walkthrough (20 min)

| # | Question | Purpose |
|---|---|---|
| B1 | Think of the last research task you completed that involved comparing or cross-referencing source materials. Can you walk me through the steps you took, from start to finish? | Elicit concrete workflow description |
| B2 | At each step, what tools or methods did you use? | Map current toolchain |
| B3 | Were there any points where you had to switch between tools, or where information moved from one format to another? | Identify integration gaps |
| B4 | How long did the entire task take, from beginning to end? | Estimate workflow cost |
| B5 | How often do you perform a task like this? | Estimate recurring cost |

#### Module C: Pain Points and Workarounds (10 min)

| # | Question | Purpose |
|---|---|---|
| C1 | Looking at that workflow, which steps felt the most difficult, time-consuming, or fragile? | Surface pain without suggesting specific problems |
| C2 | Have you developed any shortcuts, workarounds, or informal processes to handle those difficult steps? | Understand current adaptation |
| C3 | Are there things you wish you could do in that workflow but currently cannot? | Identify unmet needs |
| C4 | If you could change one thing about the tools you use for this work, what would it be? | Open-ended improvement signal |
| C5 | Have you tried any other tools or approaches in the past? What made you stop using them? | Understand adoption barriers |

#### Module D: Procurement Context (5 min)

| # | Question | Purpose |
|---|---|---|
| D1 | When your institution needs a new tool or service, how does the decision typically get made? | Map procurement process |
| D2 | Who holds the budget authority for research tools in your area? | Identify buyer |
| D3 | Are there any policies, approval processes, or constraints that make it difficult to adopt new tools? | Surface blockers |
| D4 | Have you ever wanted to adopt a tool but found the procurement process too difficult or slow? Can you describe that situation? | Concrete procurement failure |

#### Module E: Closing (5 min)

| # | Question | Purpose |
|---|---|---|
| E1 | Is there anything about your research workflow that we haven't discussed but that you think is important? | Catch-all for unanticipated themes |
| E2 | If you had a magic wand and could fix one thing about how you work with source materials, what would you fix? | Prioritization signal (still hypothetical — do not treat as demand) |
| E3 | Do you have any questions for us? | Participant agency |

### 6.3 Probing Guidelines

| Do | Do not |
|---|---|
| "Can you tell me more about that?" | "Don't you find it frustrating when...?" |
| "What happened next?" | "Would a tool that does X be helpful?" |
| "How did you handle that step?" | "We're building something that solves exactly that." |
| "What tools did you use?" | "Have you heard of [product]?" |
| "How often does this happen?" | "This must happen all the time, right?" |

### 6.4 Anti-Sales Guard

The interviewer must NOT:

- Name MoonWitness, XV, or any product feature during the interview.
- Describe the product's capabilities, even if the participant asks directly.
- Suggest that a solution exists or is being built.
- Promise future access, pricing, or features.
- Use language that implies the participant's problem has an easy fix.

If the participant asks "What are you building?" the approved response is:

> "We're conducting a research study to understand how institutional researchers manage their workflows.
> We're not presenting a product today. Your answers will help us understand whether this is a problem
> space worth exploring further."

### 6.5 Protocol Verification Test

Before real-data collection, the protocol must pass a **dry run** with at least one internal reviewer who:

1. Reads the consent script aloud.
2. Asks each question from Modules A–E.
3. Checks each question against the leading-question audit (§5.4).
4. Confirms the anti-sales guard was maintained.
5. Signs off on the protocol or returns it for revision.

---

## 7. Synthetic Participant Profiles

> **IMPORTANT**: The following eight profiles are entirely fictional. They are composite archetypes
> constructed to exercise the interview protocol and demonstrate the range of perspectives that real
> interviews might surface. No individual corresponds to a real person. Names are pseudonyms.
> Institutions are fabricated.

### 7.1 Profile Summary Table

| Code | Role | Organization type | Region | Technical comfort | Research domain | Languages |
|---|---|---|---|---|---|---|
| P-01 | Senior research librarian | University library (large) | Northern Europe | Medium | Theological manuscripts | English, German, Latin |
| P-02 | Principal investigator | University research group | Southeast Asia | Low | Comparative religious texts | Arabic, English, Malay |
| P-03 | Postdoctoral researcher | Research institute | East Africa | High | Oral history and transcription | Swahili, English, French |
| P-04 | Digital humanities specialist | University library lab | North America | High | Computational text analysis | English |
| P-05 | Research support officer | University administration | South America | Low | N/A (administrative role) | Spanish, Portuguese |
| P-06 | Independent scholar | Museum / archive | Western Europe | Medium | Historical manuscript cataloging | English, French, Greek |
| P-07 | Graduate research assistant | University department | South Asia | Medium | Scriptural comparison studies | Hindi, English, Sanskrit |
| P-08 | Postdoctoral researcher | Think tank | North America | Low | Policy research with source tracing | English |

### 7.2 Detailed Profiles

#### P-01 — Senior Research Librarian (Northern Europe)

- **Organization**: A large university library with a special collections department.
- **Role**: Manages digital and physical collections of theological and philosophical manuscripts.
- Supports faculty and graduate students who work with primary source materials.
- **Research involvement**: Personally conducts provenance research on manuscript acquisitions;
- regularly compares editions across languages to verify catalog entries.
- **Technical comfort**: Moderate. Uses the library's digital asset management system daily.
- Has used spreadsheet software extensively. Has never written code but has requested custom
  reports from the library's IT team.
- **Workflow context**: Provenance research requires tracking a manuscript's ownership history
  across centuries, comparing catalog entries in multiple languages, and verifying that edition
  references match physical holdings.
- **Key characteristic**: Deeply familiar with the pain of manual cross-referencing but accustomed
  to working within institutional constraints.

#### P-02 — Principal Investigator (Southeast Asia)

- **Organization**: A university-affiliated research group focused on comparative religious texts.
- **Role**: Leads a team of three researchers and two graduate assistants.
- **Research involvement**: Compares parallel passages across Quranic manuscripts, Hadith collections,
  and earlier scriptural traditions. Requires tracking variant readings across editions.
- **Technical comfort**: Low. Uses email, word processing, and a shared folder. Has requested
  better tools from the university IT department but found the procurement process opaque.
- **Workflow context**: The team maintains a shared spreadsheet of parallel passages, manually
  copying text from different editions and noting variant readings. When a team member discovers
  a new variant, they email the group, and someone updates the spreadsheet. Version control
  is informal.
- **Key characteristic**: Experiences significant workflow pain but has low awareness of what
  digital tools could offer. Procurement literacy is a separate barrier.

#### P-03 — Postdoctoral Researcher (East Africa)

- **Organization**: A research institute focused on oral history and cultural preservation.
- **Role**: Conducts field interviews, transcribes recordings, and cross-references oral accounts
  with written historical records.
- **Technical comfort**: High. Has written Python scripts to automate transcription alignment
  and uses version control (Git) for research documents.
- **Workflow context**: Compares oral testimony transcripts against written historical sources
  to identify convergences and divergences. Maintains a custom database (SQLite) of aligned
  passages but finds it fragile and difficult to share with collaborators.
- **Key characteristic**: Has built a partial workaround but recognizes its limitations.
  Would benefit from a more robust tool but is cautious about depending on external software
  that may not be maintained.

#### P-04 — Digital Humanities Specialist (North America)

- **Organization**: A university library's digital scholarship lab.
- **Role**: Supports faculty and students with computational text analysis, data visualization,
  and digital publishing.
- **Technical comfort**: High. Proficient in multiple programming languages, familiar with
  TEI (Text Encoding Initiative) standards, and experienced with digital edition tools.
- **Workflow context**: Frequently helps researchers who need to compare multiple editions of
  a text, track variations, and visualize relationships between sources. Current tools include
  collation software, TEI editors, and custom scripts. None of these integrate smoothly.
- **Key characteristic**: Understands the tool landscape well and has strong opinions about
  what is missing. However, their perspective may be more technically sophisticated than
  the average researcher.

#### P-05 — Research Support Officer (South America)

- **Organization**: A university administration office that manages research grants and
  institutional tool procurement.
- **Role**: Facilitates the purchase of software and services for research teams. Does not
  conduct research personally but understands the procurement landscape.
- **Technical comfort**: Low. Manages forms, budgets, and approval workflows.
- **Workflow context**: Researchers come to this office when they need a new tool. The officer
  explains the procurement process, helps identify budget lines, and submits requests.
  Frequently encounters situations where the requested tool is either too expensive for the
  available budget, requires IT approval that takes months, or conflicts with existing
  institutional licenses.
- **Key characteristic**: Provides the procurement perspective rather than the researcher
  perspective. Essential for understanding D-module questions.

#### P-06 — Independent Scholar (Western Europe)

- **Organization**: A museum with an archive of historical manuscripts.
- **Role**: Catalogs and studies manuscripts in the museum's collection. Not affiliated with
  a university but collaborates with academic researchers.
- **Technical comfort**: Moderate. Uses a cataloging database and basic office software.
  Has attended workshops on digital humanities tools but does not use them regularly.
- **Workflow context**: Cataloging requires comparing manuscript descriptions across multiple
  reference works, verifying attributions, and noting physical characteristics. The scholar
  maintains detailed records in the museum's cataloging system but often needs to cross-reference
  with external databases and printed catalogs.
- **Key characteristic**: Works in a resource-constrained environment (museum, not university)
  with limited IT support. Represents the "independent scholar with institutional affiliation"
  eligible role.

#### P-07 — Graduate Research Assistant (South Asia)

- **Organization**: A university department with a focus on scriptural studies.
- **Role**: Assists a senior professor with a comparative study of scriptural passages across
  multiple traditions. Performs much of the manual cross-referencing and data entry.
- **Technical comfort**: Moderate. Comfortable with spreadsheets, reference management software,
  and web-based tools. Has basic familiarity with databases but does not write code.
- **Workflow context**: Receives a list of passages to compare from the professor, locates
  the relevant text in multiple editions (physical books and digital resources), enters
  comparisons into a shared spreadsheet, and flags discrepancies for the professor's review.
  The process is repetitive, error-prone, and time-consuming.
- **Key characteristic**: Experiences the workflow pain most directly but has the least
  authority to change tools or processes. Represents the "early career" diversity target.

#### P-08 — Postdoctoral Researcher (North America, Think Tank)

- **Organization**: A policy research think tank.
- **Role**: Conducts research on governance and transparency issues. Regularly traces claims
  back to primary source documents (government reports, legislative texts, court decisions).
- **Technical comfort**: Low to moderate. Uses standard office software and a reference
  management tool. Has attempted to use more specialized tools but found them difficult
  to integrate into the team's existing workflow.
- **Workflow context**: Source tracing in policy research involves finding the original
  document behind a claim, verifying the quotation or reference, and documenting the chain
  of evidence. The team uses a combination of web searches, PDF annotation, and shared
  documents. Version tracking is informal.
- **Key characteristic**: Works in a non-academic institutional setting. Represents the
  "research group" eligible role outside a traditional university context.

---

## 8. Synthetic Interview Results

> **Reminder**: All results below are fictional. They are constructed to demonstrate the range of
> themes the protocol is designed to capture. They do not represent actual interview data.

### 8.1 Results Summary Table

| Code | Costly job described? | Current workaround | Estimated workaround cost | Procurement blocker? | Interest in better tool? | Disconfirming? |
|---|---|---|---|---|---|---|
| P-01 | Yes — cross-referencing editions for catalog verification | Manual comparison of printed catalogs + spreadsheet tracking | 15–20 hrs/month | Yes — library IT prioritizes system stability over new tools | Cautious yes | No |
| P-02 | Yes — tracking variant readings across parallel passages | Shared spreadsheet + email coordination | 20–25 hrs/month (team total) | Yes — procurement process opaque, no dedicated budget line | Enthusiastic but unrealistic | No |
| P-03 | Yes — aligning oral transcripts with written sources | Custom SQLite database + Python scripts | 10–15 hrs/month (maintenance) | No — has technical ability to build own tools | Conditional — concerned about sustainability | No |
| P-04 | Yes — collating multiple text editions for researchers | Fragmented toolchain (collation software + TEI editor + scripts) | 8–12 hrs/month | Partial — university has site licenses for some tools but not all | Strong yes — sees gap clearly | No |
| P-05 | N/A — does not perform research workflows | N/A | N/A | N/A — IS the procurement perspective | N/A | No (provides context only) |
| P-06 | Yes — cross-referencing manuscript descriptions across catalogs | Printed reference works + museum cataloging database | 10–12 hrs/month | Yes — museum IT budget is minimal; no software procurement fund | Mild interest | No |
| P-07 | Yes — repetitive passage comparison and data entry | Shared spreadsheet + physical books + digital resources | 20–25 hrs/month | Yes — graduate students have no procurement authority | Hopeful but low expectations | No |
| P-08 | No clear costly job described | Existing tools are "good enough" | Minimal | No — think tank has a software budget but does not prioritize research tools | Polite interest only | **Yes** |

### 8.2 Detailed Synthetic Findings by Participant

#### P-01 — Cross-Referencing for Catalog Verification

**Costly job**: When verifying manuscript catalog entries, P-01 must compare descriptions across
multiple reference works in different languages (Latin, German, and the local language). Each
reference work uses different conventions for describing physical characteristics, provenance,
and content. There is no single database that aggregates these descriptions.

**Current workaround**: P-01 prints or opens each reference work side by side, manually compares
entries, and records discrepancies in a spreadsheet. For complex cases, a narrative note is
written in the cataloging system.

**Estimated cost**: 15–20 hours per month of P-01's time, plus occasional assistance from a
graduate student (5 hours/month).

**Procurement blocker**: The library's IT department prioritizes system stability and security
over new tool adoption. Requesting a new research tool requires a formal justification, IT
review, and budget approval from the library director. P-01 has not attempted this process
because "it's easier to just do it manually."

**Key quote (anonymized, consented)**: "I know there must be a better way, but the process of
getting a new tool approved is more work than the manual comparison itself."

**Theme**: Institutional friction makes even clearly beneficial tool adoption impractical.

#### P-02 — Tracking Variant Readings Across Parallel Passages

**Costly job**: P-02's team compares parallel passages across multiple scriptural editions to
track variant readings. Each team member works on different passages and records findings in a
shared spreadsheet. When a variant is discovered, the team member emails the group, and someone
updates the spreadsheet. There is no version control, no structured format, and no way to
search across entries efficiently.

**Current workaround**: A shared spreadsheet (with informal naming conventions) and email
coordination. P-02 estimates the team spends 20–25 hours per month collectively on workflow
overhead (formatting, searching, reconciling discrepancies, sending update emails).

**Procurement blocker**: P-02 does not control a budget for research tools. The university's
procurement process is opaque — P-02 has asked the IT department about available tools but
received no clear answer. There is no dedicated budget line for "research software."

**Key quote (anonymized, consented)**: "We have a spreadsheet with thousands of rows, and
finding a specific variant means scrolling and searching with Ctrl+F. It works, but it's
slow and error-prone."

**Theme**: The workaround "works" but at significant hidden cost; procurement literacy is a
separate barrier from tool awareness.

#### P-03 — Aligning Oral Transcripts with Written Sources

**Costly job**: P-03 transcribes oral interviews and then aligns the transcripts with written
historical sources to identify convergences and divergences. This requires matching passages
by topic, date, and geographic reference — a process that is inherently relational but is
currently managed in a custom SQLite database.

**Current workaround**: P-03 wrote Python scripts to parse transcripts, extract key entities
(dates, locations, names), and store them in a SQLite database. Queries can find matching
entities across oral and written sources. However, the database schema is fragile, the scripts
are undocumented, and no one else on the team can maintain them.

**Estimated cost**: 10–15 hours per month maintaining the custom system, plus the ongoing risk
that a Python or SQLite update will break the scripts.

**Procurement blocker**: None — P-03 has the technical ability to build and maintain custom
tools. However, P-03 is cautious about depending on external software that may not be
maintained long-term.

**Key quote (anonymized, consented)**: "I built this myself, which means I understand it, but
it also means if I leave, no one can pick it up. I'd prefer something more sustainable."

**Theme**: Technical self-sufficiency creates a different kind of lock-in; sustainability
concerns are a real barrier even when procurement is not.

#### P-04 — Collating Multiple Text Editions

**Costly job**: P-04 supports faculty researchers who need to compare multiple editions of a
text. This involves running collation software to identify variations, encoding the results
in TEI format, and then visualizing the relationships. Each step uses a different tool, and
data must be manually transferred between them.

**Current workaround**: A fragmented toolchain: collation software (specific tool not named for
anonymization), a TEI editor, custom XSLT scripts for transformation, and a visualization
tool. P-04 estimates 8–12 hours per month on integration and format conversion work.

**Procurement blocker**: Partial — the university has site licenses for some tools in the
chain but not all. The missing tools are either open-source (requiring maintenance effort)
or commercial (requiring individual purchase).

**Key quote (anonymized, consented)**: "The tools exist, but they don't talk to each other.
I spend most of my time converting data from one format to another rather than doing analysis."

**Theme**: The problem is not absence of tools but lack of integration between existing tools.

#### P-05 — Procurement Context (Administrative Perspective)

**No costly job described**: P-05 does not perform research workflows and therefore cannot
describe a personal costly job. However, P-05 provides essential context on procurement
constraints.

**Procurement insights**:
- Most research tool requests come from individual researchers or department heads.
- The approval process involves three steps: budget identification, IT compatibility review,
  and institutional sign-off. This typically takes 2–6 months.
- Common blockers: no dedicated budget line for research software, IT concerns about data
  security or integration, and institutional preference for existing site licenses.
- P-05 has seen requests fail because the tool was "too specialized" to justify the
  procurement effort, even when the requester demonstrated clear need.

**Theme**: Procurement processes are designed for large, generic software purchases — not for
specialized research tools with small user bases.

#### P-06 — Cross-Referencing Manuscript Descriptions

**Costly job**: P-06 catalogs manuscripts in a museum collection and must verify descriptions
against external reference works (printed catalogs, online databases, and published scholarship).
Each reference work uses different conventions, and there is no unified search.

**Current workaround**: P-06 consults printed reference works in the museum library, searches
online databases via web browser, and records findings in the museum's cataloging database.
The process is linear and cannot be parallelized.

**Estimated cost**: 10–12 hours per month.

**Procurement blocker**: The museum has a minimal IT budget and no software procurement fund.
P-06 cannot request new tools because there is no budget mechanism to support the request.

**Key quote (anonymized, consented)**: "We make do with what we have. The cataloging system
works for basic entries, but comparing across sources is all manual."

**Theme**: Resource-constrained institutions accept manual workflows because the alternative
(procurement) is structurally unavailable.

#### P-07 — Repetitive Passage Comparison and Data Entry

**Costly job**: P-07 receives lists of passages from a supervising professor, locates the
relevant text in multiple editions (physical books and digital resources), enters comparisons
into a shared spreadsheet, and flags discrepancies. The work is repetitive and time-consuming.

**Current workaround**: A shared spreadsheet, physical books, digital resources (PDFs and
websites), and manual data entry. P-07 estimates 20–25 hours per month on this work, which
constitutes a significant portion of their graduate assistantship duties.

**Procurement blocker**: P-07 has no procurement authority. As a graduate student, they cannot
request or purchase tools. The professor they assist has limited awareness of available digital
tools and has not requested any.

**Key quote (anonymized, consented)**: "I spend most of my time copying text from one place
to another. I know there must be a faster way, but no one has shown me one."

**Theme**: The person experiencing the most workflow pain has the least authority to change it.

#### P-08 — No Clear Costly Job (Disconfirming Case)

**No costly job described**: P-08 was asked the same workflow questions but did not describe
a recurring, costly research workflow. P-08's source-tracing work is intermittent (a few
hours per month), and existing tools (web search, PDF annotation, shared documents) are
"good enough" for the task.

**Current workaround**: Ad hoc web searches, PDF annotation, and shared documents. No
structured process.

**Procurement blocker**: None — the think tank has a software budget, but research tools are
not a priority.

**Interest level**: P-08 expressed polite interest in the topic but did not describe a problem
that would motivate tool adoption.

**Key quote (anonymized, consented)**: "I trace sources when I need to, but it's not a big
part of my workflow. The tools I have work fine for what I do."

**Theme**: Not all institutional researchers experience costly workflow pain. This is a
genuine disconfirming case and is recorded as such.

### 8.3 Aggregate Results

| Metric | Value |
|---|---|
| Total synthetic participants | 8 |
| Described a costly job | 6 (P-01, P-02, P-03, P-04, P-06, P-07) |
| Did not describe a costly job | 2 (P-05 — administrative role; P-08 — disconfirming case) |
| Described the same costly job (cross-referencing/comparison) | 5 (P-01, P-02, P-04, P-06, P-07) |
| Described a different costly job | 1 (P-03 — alignment of oral/written sources) |
| Reported procurement blockers | 5 (P-01, P-02, P-05 context, P-06, P-07) |
| Estimated workaround cost range | 8–25 hours/month |
| Expressed interest in a better tool | 6 (all except P-05 N/A and P-08 no) |
| Disconfirming cases | 1 (P-08) |

---

## 9. Theme Analysis

### 9.1 Repeated Problem Themes

Themes are coded from the synthetic interview results using a simple frequency count. A theme
is considered "repeated" if it appears in at least three independent synthetic profiles.

| Theme | Frequency | Profiles | Strength |
|---|---|---|---|
| **T1: Cross-referencing primary sources across editions/languages is manual and time-consuming** | 5 | P-01, P-02, P-04, P-06, P-07 | **Strong** — meets acceptance criterion of ≥3 independent descriptions |
| **T2: Current workarounds rely on spreadsheets, email, or custom scripts** | 5 | P-01, P-02, P-03, P-04, P-07 | **Strong** |
| **T3: Procurement processes block or delay tool adoption** | 4 | P-01, P-02, P-06, P-07 | **Moderate** — includes one administrative perspective (P-05) as context |
| **T4: The person experiencing workflow pain lacks authority to change tools** | 3 | P-02, P-05 (context), P-07 | **Moderate** |
| **T5: Existing tools do not integrate with each other** | 2 | P-03, P-04 | **Weak** — below threshold but notable |
| **T6: Sustainability concerns about custom-built tools** | 2 | P-03, P-06 | **Weak** — below threshold but notable |
| **T7: Not all researchers experience costly workflow pain** | 1 | P-08 | **Disconfirming** — recorded in §11 |

### 9.2 Workaround Cost Ranges

| Profile | Estimated monthly cost | Cost type | Confidence |
|---|---|---|---|
| P-01 | 15–20 hrs + 5 hrs (student) | Researcher time | Medium — self-reported estimate |
| P-02 | 20–25 hrs (team total) | Team time | Medium — aggregated across team |
| P-03 | 10–15 hrs | Maintenance + risk | High — P-03 tracks own time |
| P-04 | 8–12 hrs | Integration work | Medium — self-reported estimate |
| P-06 | 10–12 hrs | Researcher time | Medium — self-reported estimate |
| P-07 | 20–25 hrs | Assistant time | Medium — constitutes major portion of duties |
| P-08 | Minimal | N/A | N/A — disconfirming case |

**Aggregate range**: 8–25 hours per month per individual or team, with a median of approximately
15 hours per month.

**Cost translation** (rough, for context only — not a pricing study):
- At a conservative researcher cost of $30–50/hour (varies by region and institution),
  15 hours/month = $450–750/month per researcher.
- For a team of five researchers each losing 15 hours/month, the institutional cost could
  reach $2,250–3,750/month in aggregate researcher time.
- These are illustrative figures only, not validated market data.

### 9.3 Procurement Blocker Frequency

| Blocker type | Frequency | Profiles reporting |
|---|---|---|
| No dedicated budget line for research software | 3 | P-02, P-06, P-07 |
| IT review/approval process is slow or opaque | 2 | P-01, P-05 (context) |
| Institutional preference for existing site licenses | 1 | P-05 (context) |
| Tool is "too specialized" to justify procurement effort | 1 | P-05 (context) |
| No procurement authority (individual role) | 1 | P-07 |
| **Total unique profiles reporting at least one blocker** | **5** | P-01, P-02, P-05, P-06, P-07 |

**Procurement blocker rate**: 5 of 8 profiles (63%) reported at least one procurement constraint.
This is a significant finding: even if a tool addressed a genuine need, procurement friction
could prevent adoption in the majority of synthetic cases.

### 9.4 Theme Interactions

The themes do not operate independently. The following interactions are noted:

- **T1 + T2**: Manual cross-referencing (T1) drives spreadsheet/email workarounds (T2). The
  workaround is a direct consequence of the problem.
- **T3 + T4**: Procurement blockers (T3) disproportionately affect the people experiencing
  the most pain (T4), creating a structural lock-in where the worst-affected cannot adopt
  better tools.
- **T2 + T5**: Custom scripts and spreadsheets (T2) are often the result of tool integration
  failures (T5) — researchers build their own connectors because existing tools don't
  communicate.
- **T3 + T6**: Even when procurement is possible (as for P-03), sustainability concerns (T6)
  create a parallel barrier to adoption of external tools.

### 9.5 Theme Strength Assessment

| Criterion | Threshold | Result |
|---|---|---|
| Acceptance criterion: ≥3 independent respondents describe same costly job | 3 | **Met** — T1 appears in 5 profiles |
| Repeated workaround | 3 | **Met** — T2 appears in 5 profiles |
| Procurement blocker frequency | Notable if ≥3 | **Met** — 5 profiles report blockers |
| Disconfirming cases present | ≥1 | **Met** — P-08 is a genuine disconfirming case |

---

## 10. Sample and Selection Bias Documentation

### 10.1 Sample Size

The synthetic sample consists of 8 profiles. The protocol target for real-data collection is
6–10 participants. The synthetic sample is at the upper end of this range.

**Sample size limitation**: Even at 8 profiles, the sample is too small to support statistical
generalization. Findings are indicative, not conclusive. The acceptance criterion requires
only 3 independent descriptions of the same costly job — a low bar by design.

### 10.2 Selection Bias Sources

| Bias type | Description | Impact | Mitigation |
|---|---|---|---|
| **Availability bias** | Synthetic profiles were constructed from the researcher's mental model of institutional research, not from a systematic survey of the population | Profiles may over-represent familiar archetypes and under-represent unexpected ones | Documented in §16; real recruitment should use diverse channels (§4.4) |
| **Survivorship bias** | Profiles represent people who are currently performing research workflows, not those who have left academia or research due to tool frustration | May understate the severity of workflow pain | Acknowledged; future recruitment could include "alumni" perspectives |
| **Geographic bias** | Synthetic profiles span 8 regions but are constructed by a single researcher with limited geographic expertise | Regional procurement and workflow differences may be inaccurate | Real recruitment should target geographic diversity explicitly |
| **Technical comfort bias** | Profiles range from low to high technical comfort, but the distribution is skewed toward moderate-high | May under-represent the experience of researchers with very low technical literacy | Diversity target (§4.5) includes low-technical-comfort profiles |
| **Institutional type bias** | Profiles include universities, a museum, and a think tank but not government research labs, corporate R&D, or independent archives without institutional affiliation | Limits generalizability to the full institutional landscape | Future rounds could expand institutional type coverage |
| **Language bias** | Synthetic profiles include multiple languages, but the workflow descriptions are in English and may not capture language-specific challenges | May understate the cost of multilingual workflows | Real interviews should be conducted in the participant's preferred language |
| **Courtesy bias** | Synthetic profiles assume participants are candid; real participants may soften criticism or overstate interest to be polite | May inflate apparent demand | Disconfirming case (P-08) provides a partial counterweight; see §14 |

### 10.3 Representativeness Assessment

The synthetic sample covers:
- 4 of 6 eligible role types (research librarian, PI, postdoc, digital humanities specialist,
  research support officer, independent scholar)
- 8 geographic regions (Northern Europe, Southeast Asia, East Africa, North America ×2,
  South America, Western Europe, South Asia)
- 3 levels of technical comfort (low, medium, high)
- 3 career stages (senior, mid, early)

Missing from the synthetic sample:
- Government research lab perspectives
- Corporate R&D perspectives
- Independent archive without any institutional affiliation
- Researchers whose primary language is not represented in the profile set

### 10.4 Bias Impact on Acceptance Criteria

The acceptance criterion requires ≥3 independent respondents describing the same costly job.
The synthetic sample produces 5 such descriptions (T1). However, because all 5 are constructed
by the same researcher using the same mental model, they are not truly "independent" in the
statistical sense. The acceptance criterion is **synthetically met but epistemically weak**.
Real interviews with independently recruited participants are required for genuine evidence.

---

## 11. Disconfirming Cases

### 11.1 Definition

A disconfirming case is a synthetic profile or interview result that contradicts the demand
hypothesis — i.e., a profile that does NOT describe a costly research workflow or that
expresses no interest in a better tool. Disconfirming cases are essential for intellectual
honesty and for preventing false-positive demand signals.

### 11.2 Identified Disconfirming Cases

#### DC-01: P-08 — No Costly Job Described

- **Profile**: Postdoctoral researcher at a think tank (North America).
- **Finding**: P-08 does not describe a recurring, costly research workflow. Source tracing
  is intermittent (a few hours per month), and existing tools are "good enough."
- **Implication**: Not all institutional researchers experience the costly job described by
  other profiles. The demand hypothesis does not apply universally.
- **Strength of disconfirmation**: Moderate — P-08 is one of eight profiles, and their
  workflow is genuinely different (policy research vs. textual scholarship). However, P-08
  may represent a real segment of institutional researchers for whom the problem is not
  costly enough to motivate change.

#### DC-02: P-05 — Administrative Role, No Personal Workflow Pain

- **Profile**: Research support officer (South America).
- **Finding**: P-05 does not perform research workflows and therefore cannot describe personal
  workflow pain. P-05's contribution is contextual (procurement knowledge) rather than
  experiential.
- **Implication**: Including administrative roles in the sample is valuable for procurement
  context but does not contribute to the demand hypothesis directly.
- **Strength of disconfirmation**: Low — P-05 was never expected to describe a costly job;
  their role is a context provider, not a demand signal.

#### DC-03: Interest Without Pain (Hypothetical)

- **Profile**: Not represented in the synthetic sample, but worth noting as a potential
  disconfirming pattern.
- **Finding**: A participant might express interest in a better tool without describing
  current pain — e.g., "I don't have this problem now, but I can see how it could be useful."
- **Implication**: Interest alone is not demand. The protocol explicitly distinguishes
  between "I have this problem" and "I can imagine this being useful." Only the former
  counts toward the acceptance criterion.
- **Strength of disconfirmation**: N/A — this pattern is not present in the synthetic sample
  but should be watched for in real interviews.

### 11.3 Disconfirmation Summary

| Case | Type | Impact on demand hypothesis |
|---|---|---|
| DC-01 (P-08) | No costly job described | Weakens universality claim; demand is segment-specific |
| DC-02 (P-05) | Role does not perform research | Does not weaken demand hypothesis; provides procurement context |
| DC-03 | Interest without pain (hypothetical) | Would weaken demand if prevalent; not observed synthetically |

**Overall assessment**: One genuine disconfirming case (DC-01) is present. This is sufficient
to demonstrate that the protocol captures negative evidence, but real-data collection may
reveal additional disconfirming patterns.

---

## 12. Go/No-Go Decision Framework

### 12.1 Decision Criteria

The go/no-go decision determines whether to proceed to downstream tasks (ECO-002, ECO-003,
ECO-005) based on the evidence collected. The criteria are:

| Criterion | Go threshold | No-go threshold | Uncertain |
|---|---|---|---|
| **Repeated costly job** | ≥3 independent profiles describe the same costly job | <3 profiles describe any costly job | 3 profiles describe similar but not identical jobs |
| **Current workaround cost** | ≥3 profiles report workaround cost ≥10 hrs/month | <3 profiles report significant cost | Cost estimates are inconsistent or unreliable |
| **Procurement path** | ≥1 profile describes a viable procurement path | All profiles report insurmountable blockers | Blockers exist but may be addressable |
| **Disconfirming cases** | Disconfirming cases are explainable and segment-specific | Disconfirming cases dominate the sample | Disconfirming cases are numerous but not dominant |
| **Responsible support boundary** | No ethical/rights/privacy concerns raised | Significant concerns raised that cannot be mitigated | Concerns raised but mitigable with design |

### 12.2 Synthetic Baseline Assessment

| Criterion | Synthetic result | Assessment |
|---|---|---|
| Repeated costly job | 5 profiles describe cross-referencing/comparison (T1) | **GO** (synthetically met) |
| Current workaround cost | 6 profiles report 8–25 hrs/month | **GO** (synthetically met) |
| Procurement path | 5 profiles report blockers; 1 profile (P-03) has no blocker | **UNCERTAIN** — blockers are prevalent but not universal |
| Disconfirming cases | 1 genuine disconfirming case (P-08) | **GO** — disconfirmation is segment-specific |
| Responsible support boundary | No ethical concerns raised in synthetic data | **UNCERTAIN** — real interviews may surface concerns |

### 12.3 Synthetic Decision

**Based on synthetic data alone**: CONDITIONAL GO — proceed to real-data collection with the
following conditions:

1. Real interviews must confirm the repeated costly job (T1) with independent participants.
2. Procurement blockers must be investigated further — the synthetic data suggests they are
   prevalent, which could prevent adoption even if demand exists.
3. The responsible support boundary must be tested with real participants, particularly
   around data privacy, source rights, and institutional ethics.
4. Disconfirming cases should be actively sought in real recruitment, not passively accepted.

### 12.4 Real-Data Go/No-Go Matrix

After real-data collection, the decision will be:

| Scenario | Costly job confirmed? | Procurement viable? | Disconfirmation manageable? | Decision |
|---|---|---|---|---|
| A | Yes (≥3 real profiles) | Yes (≥1 viable path) | Yes (segment-specific) | **GO** — proceed to ECO-002, ECO-003 |
| B | Yes (≥3 real profiles) | No (universal blockers) | Yes | **REFINE** — address procurement before product |
| C | Yes (≥3 real profiles) | Mixed | No (widespread) | **REFINE** — investigate disconfirming segment |
| D | No (<3 real profiles) | Any | Any | **NO-GO** — demand not established |
| E | Uncertain | Uncertain | Uncertain | **REPEAT** — larger sample or different segment |

### 12.5 No-Go Implications

If the decision is NO-GO:

- Downstream tasks (ECO-002, ECO-003, ECO-005) remain deferred.
- The finding is documented as "insufficient/negative evidence" per the acceptance criteria.
- No product, feature, or pricing decision is made based on the negative finding.
- The protocol may be revised and re-run with a different participant segment if the owner
  believes the sample was mis-targeted.

---

## 13. Privacy and Consent Considerations

### 13.1 Data Classification

| Data type | Classification | Handling |
|---|---|---|
| Participant identity (name, institution, contact) | **Confidential** | Stored separately from research data; destroyed after study closure |
| Interview notes (raw) | **Confidential** | Access-restricted; anonymized before analysis |
| Interview recordings (if consented) | **Confidential** | Transcribed, anonymized, raw recording deleted within 30 days |
| Anonymized themes and findings | **Research output** | Published in audit document; no identifying information |
| Direct quotes (if consented) | **Research output** | Reviewed for inadvertent identifiers before publication |
| Synthetic profiles and data | **Not classified** | Fictional; no real person data |

### 13.2 Consent Requirements

| Requirement | Implementation |
|---|---|
| Informed consent | Consent script read/provided before interview (§5.2) |
| Voluntary participation | Participant can withdraw at any time; data deleted on request |
| Recording consent | Separate consent for audio recording; if declined, notes only |
| Quote consent | Separate consent for use of direct quotes; if declined, paraphrase only |
| Data retention | Raw data deleted within 30 days of interview; anonymized findings retained |
| Data separation | No participant data enters product databases |

### 13.3 Anonymization Standards

| Level | Description | Example |
|---|---|---|
| L1 — Code replacement | Name and institution replaced with code | "P-01, a research librarian at a large Northern European university" |
| L2 — Detail generalization | Specific details that could identify are generalized | "a university library" instead of "University of X Special Collections" |
| L3 — Quote review | Direct quotes checked for unique phrasing that could identify | Remove references to specific projects, colleagues, or local systems |
| L4 — Aggregation | Individual responses aggregated into themes | "5 of 8 profiles described cross-referencing as a costly job" |

**Minimum publication level**: L1 for individual findings, L4 for aggregate analysis.

### 13.4 Institutional Ethics

- If any participant is affiliated with an institution that requires ethics board review of
  research interviews, the researcher must comply with that institution's requirements before
  conducting the interview.
- The consent script should be reviewed by the product research owner and (if applicable)
  by an institutional ethics board before real-data collection begins.
- MoonWitness XV does not currently have an institutional ethics board. If real interviews
  involve participants from institutions that require ethics approval, the researcher must
  obtain that approval independently.

### 13.5 Rollback and Data Deletion

| Trigger | Action | Timeline |
|---|---|---|
| Participant withdraws consent | Delete all raw data for that participant | Within 7 days of withdrawal request |
| Study closure | Delete raw notes, recordings, and anonymization key | Within 30 days of closure |
| Data breach | Notify affected participants; delete compromised data | Within 72 hours of discovery |
| Owner directs stop | Halt all interviews; delete raw data | Immediately |

---

## 14. Risk Mitigation

### 14.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Small sample size limits generalizability | High | Medium | Document limitations explicitly; do not claim statistical significance; seek ≥6 real participants | Accepted |
| R2 | Institutional courtesy bias — participants say what they think the researcher wants to hear | Medium | High | Use non-leading questions (§6.3); include anti-sales guard (§6.4); seek disconfirming cases (§11) | Mitigated |
| R3 | Interest mistaken for demand — participants express interest but would not actually procure or use a tool | High | High | Distinguish "I have this problem" from "I can imagine this being useful" (§11, DC-03); require past-behavior evidence (§6.2 Module B) | Mitigated |
| R4 | Procurement blockers prevent adoption even if demand exists | Medium | High | Investigate procurement separately (§6.2 Module D); do not conflate demand with procurability | Accepted |
| R5 | Synthetic profiles do not accurately represent real institutional diversity | Medium | Medium | Use synthetic data for protocol exercise only; real recruitment must use diverse channels (§4.4) | Accepted |
| R6 | Interviewer inadvertently presents MoonWitness as a solution | Low | High | Anti-sales guard (§6.4); protocol dry run (§6.5); reviewer sign-off | Mitigated |
| R7 | Participant data leaks into product databases | Low | Critical | Explicit data separation (§13.1); no product database access for research data | Mitigated |
| R8 | Support expectations exceed MoonWitness capacity | Medium | Medium | Do not offer service during research (§3.5); document capacity limits in findings | Accepted |
| R9 | Downstream tasks (ECO-002, ECO-003) conflate their scope with M48-01 findings | Medium | Medium | Anti-overlap statement (§2.4); separate acceptance criteria per task | Mitigated |
| R10 | Real-data collection is delayed or blocked by owner authorization | Medium | Low | Synthetic baseline is complete; real collection can begin when authorized | Accepted |

### 14.2 Courtesy Bias — Detailed Mitigation

Institutional courtesy bias is the tendency of participants in professional settings to be
polite, agreeable, and supportive of the researcher's apparent goals. In the context of
M48-01, this could manifest as:

- A participant saying "yes, that would be useful" when they mean "I can see how it might be
  useful for someone, but not for me."
- A participant overstating the severity of their workflow pain because they sense the
  researcher is looking for pain points.
- A participant expressing interest in future involvement to be courteous, even if they have
  no intention of participating again.

**Mitigation strategies**:

1. **Past-behavior questions**: Ask "tell me about the last time you did this" rather than
   "would you use a tool that does this." Past behavior is harder to fabricate courteously.
2. **Cost quantification**: Ask "how many hours per month does this take?" rather than "is
   this a problem?" Concrete numbers are less susceptible to courtesy inflation.
3. **Disconfirming probes**: Ask "are there times when this workflow works fine?" to give
   the participant permission to say the problem is not universal.
4. **Anti-sales framing**: Explicitly state "we are not selling anything today" in the
   consent script and at the start of the interview.
5. **Post-interview reflection**: The researcher records their own assessment of whether
   courtesy bias may have influenced each response.

### 14.3 Small Sample Limitations

With 6–10 real participants (8 synthetic), the sample is too small for:

- Statistical significance testing
- Population-level generalization
- Segmentation analysis (e.g., "universities in Region X have different needs than museums")

The sample is sufficient for:

- Protocol validation (does the interview guide work?)
- Theme identification (what problems recur?)
- Disconfirmation detection (are there cases that contradict the hypothesis?)
- Go/no-go decision support (is there enough signal to proceed?)

### 14.4 No Demand Claim from Interest Alone

A critical principle: **expressed interest in a tool is not evidence of demand**. Demand
requires:

1. A recurring, costly problem (validated by past-behavior evidence).
2. A current workaround that is unsatisfactory (validated by cost/fragility evidence).
3. Budget authority and procurement willingness (validated by procurement context evidence).
4. A decision to act (validated by observed behavior, not stated intention).

M48-01 tests conditions 1–3. Condition 4 is explicitly out of scope — this is a discovery
study, not a sales pilot.

---

## 15. Metrics and Success Criteria

### 15.1 Primary Metrics

| Metric | Definition | Target | Synthetic result |
|---|---|---|---|
| **Repeated problem themes** | Number of independent profiles describing the same costly job | ≥3 | 5 (T1: cross-referencing) |
| **Workaround cost range** | Range of estimated monthly hours spent on current workaround | Documented | 8–25 hrs/month |
| **Procurement blocker frequency** | Number of profiles reporting at least one procurement constraint | Documented | 5 of 8 (63%) |
| **Disconfirming case count** | Number of profiles that do NOT support the demand hypothesis | ≥1 (for credibility) | 1 (P-08) |

### 15.2 Secondary Metrics

| Metric | Definition | Synthetic result |
|---|---|---|
| **Theme diversity** | Number of distinct problem themes identified | 7 (T1–T7) |
| **Role coverage** | Number of eligible role types represented | 5 of 6 |
| **Geographic coverage** | Number of distinct regions represented | 8 |
| **Technical comfort range** | Spread from low to high | Low, medium, high all represented |
| **Procurement path clarity** | Number of profiles describing a viable procurement path | 1 of 8 (P-03) |

### 15.3 Success Criteria for Real-Data Collection

The synthetic baseline establishes the following success criteria for real-data collection:

| Criterion | Minimum for "baseline established" | Minimum for "go" decision |
|---|---|---|
| Completed interviews | 6 | 6 |
| Independent descriptions of same costly job | 3 | 3 |
| Disconfirming cases documented | 1 | 1 |
| Procurement context collected | 3 profiles | 5 profiles |
| Protocol review passed | Yes | Yes |
| Consent procedure validated | Yes | Yes |

### 15.4 Metric Limitations

- All synthetic metrics are constructed, not observed. They demonstrate the protocol's
  ability to generate data, not the data's validity.
- Workaround cost estimates are self-reported in synthetic profiles; real estimates may
  differ significantly.
- Procurement blocker frequency is based on synthetic institutional types; real procurement
  processes vary widely by institution, region, and funding model.
- Theme counts are sensitive to coding decisions; different researchers might code the same
  data differently.

---

## 16. Limitations and Caveats

### 16.1 Fundamental Limitation: Synthetic Data

**This entire document is based on synthetic data.** No real interviews were conducted. No
real institutional researchers were consulted. No real demand evidence exists.

The synthetic profiles are constructed to:
- Exercise the research protocol and interview guide.
- Demonstrate the range of themes the protocol is designed to capture.
- Test the acceptance criteria and go/no-go framework.
- Identify potential bias and risk patterns.

The synthetic profiles are NOT:
- Evidence of real institutional demand.
- A substitute for real-data collection.
- A basis for product, pricing, or feature decisions.

### 16.2 Specific Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **Single-researcher construction** | All synthetic profiles were constructed by one researcher, limiting perspective diversity | Real recruitment must use diverse channels and multiple recruiters if possible |
| **No real institutional knowledge** | Procurement processes, budget structures, and IT policies are approximated | Real interviews should verify procurement context with actual administrators |
| **Language and cultural assumptions** | Workflow descriptions assume English-language academic culture | Real interviews should be conducted in participants' preferred languages |
| **Temporal snapshot** | Synthetic data reflects a single point in time; real workflows evolve | Real-data collection should be time-bounded and dated |
| **No observation of actual behavior** | Synthetic profiles report stated behavior, not observed behavior | Real interviews should ask for specific recent instances, not general patterns |
| **MoonWitness familiarity** | The synthetic researcher knows MoonWitness capabilities, which may influence profile construction | Real interviewers must be trained to separate product knowledge from research neutrality |
| **Survivorship in profile selection** | Profiles represent current researchers, not those who left due to tool frustration | Future research could include "alumni" interviews |

### 16.3 What This Document Cannot Claim

- "Institutional researchers need MoonWitness." — No real demand evidence exists.
- "The cross-referencing problem is the most costly workflow." — Synthetic frequency does not
  equal real severity.
- "Procurement blockers will prevent adoption." — Synthetic blockers are approximated; real
  procurement processes may be more or less restrictive.
- "The protocol is validated." — The protocol has been exercised synthetically but not tested
  with real participants.
- "MoonWitness can responsibly support this workflow." — Responsible support requires real
  rights, privacy, and ethics review that has not been conducted.

### 16.4 Confidence Levels

| Finding | Confidence | Basis |
|---|---|---|
| Protocol structure is complete | High | All sections present and internally consistent |
| Interview guide covers relevant topics | Medium | Based on researcher judgment, not pilot testing |
| Synthetic themes reflect real patterns | Low | No real data to validate against |
| Acceptance criterion is synthetically met | High (for synthetic data) | 5 profiles ≥ 3 threshold |
| Go decision is supported | Low | Synthetic data alone cannot support a real go decision |
| Procurement blockers are prevalent | Low | Synthetic approximation only |

---

## 17. Deferred Items Requiring Owner Action

### 17.1 Items Requiring Owner Decision

| Item | Decision needed | Blocks | Priority |
|---|---|---|---|
| **Real-data collection authorization** | Owner must approve outreach to real institutional participants | All real interviews | P1 |
| **Incentive budget** | Owner must approve incentive type and amount (if any) | Recruitment | P2 |
| **M35-01 scope reconciliation** | M35-01 is BLOCKED; owner must determine if synthetic baseline is sufficient to proceed with M48-01 real data independently | Real-data collection | P1 |
| **Ethics board review** | If real participants are affiliated with institutions requiring ethics approval, owner must determine whether to seek approval | Real interviews with affiliated participants | P2 |
| **Protocol reviewer assignment** | Owner must assign a reviewer to validate the protocol before real-data collection | Real interviews | P1 |
| **Anti-sales guard training** | Owner must ensure interviewers are trained on the anti-sales guard before real interviews | Real interviews | P1 |
| **Data storage and retention** | Owner must approve data storage location and retention schedule for real participant data | Real interviews | P1 |
| **ECO-002/ECO-005 protocol sharing** | Owner must confirm that the shared protocol/pool arrangement is acceptable | Downstream tasks | P2 |

### 17.2 Items Deferred to Downstream Tasks

| Item | Deferred to | Rationale |
|---|---|---|
| Self-hosted support demand | ECO-002 (M48-02) | Separate value proposition; requires separate acceptance criteria |
| Pricing hypotheses | ECO-003 (M48-03) | Requires demand evidence from M48-01 first |
| Commercial entitlements | ECO-004 (M48-04) | Requires pricing and demand evidence first |
| Partnership distribution | ECO-005 (M48-05) | Requires demand evidence and outreach authorization first |
| Cost-to-serve modeling | ECO-006 (M48-06) | Requires demand and support evidence first |
| Funding model comparison | ECO-007 (M48-07) | Requires cost evidence first |
| Creator/research service model | ECO-008 (M48-08) | Requires rights, pricing, and demand evidence first |

### 17.3 Items Requiring Future Research Rounds

| Item | Reason for deferral | Suggested approach |
|---|---|---|
| Larger sample size | 8 synthetic profiles are insufficient for statistical confidence | Recruit 15–20 real participants across multiple recruitment waves |
| Geographic diversity validation | Synthetic geographic coverage is approximated | Partner with regional research networks for authentic geographic representation |
| Longitudinal workflow tracking | Single-timepoint interviews cannot capture workflow evolution | Conduct follow-up interviews at 3-month and 6-month intervals |
| Quantitative cost validation | Self-reported hour estimates are unreliable | Use time-diary methods or workflow logging for a subset of participants |
| Non-English language workflows | Synthetic profiles assume English-language academic culture | Conduct interviews in participants' primary languages; use multilingual researchers |
| Tool usage observation | Interviews capture stated behavior, not observed behavior | Conduct workflow shadowing sessions with consenting participants |
| Procurement process mapping | Synthetic procurement context is approximated | Interview procurement officers and budget holders directly |

### 17.4 Owner Action Checklist

Before real-data collection can begin, the owner must:

- [ ] Approve this document as a complete synthetic baseline
- [ ] Authorize outreach to real institutional participants
- [ ] Approve or decline incentive budget
- [ ] Assign a protocol reviewer
- [ ] Confirm M35-01 scope reconciliation (or authorize independent progression)
- [ ] Approve data storage and retention plan
- [ ] Confirm anti-sales guard training for all interviewers
- [ ] Approve the consent script for real-data use
- [ ] Set a target date for real-data collection start
- [ ] Confirm ECO-002/ECO-005 protocol-sharing arrangement

---

## 18. Conclusion: BASELINE ESTABLISHED

### 18.1 Summary

This document establishes the **synthetic baseline** for M48-01: Validate institutional demand
for a research-support offer. The baseline includes:

- A complete research protocol with consent script, interview guide, anonymization procedure,
  and protocol review checklist.
- Eight synthetic participant profiles representing diverse institutional roles, geographies,
  technical comfort levels, and career stages.
- Synthetic interview results demonstrating the protocol's ability to capture costly jobs,
  workarounds, procurement blockers, and disconfirming cases.
- Theme analysis identifying seven problem themes, with the primary theme (cross-referencing
  primary sources across editions/languages) appearing in five of eight profiles — meeting
  the acceptance criterion of ≥3 independent descriptions.
- Sample and selection bias documentation identifying seven bias types and their mitigations.
- A go/no-go decision framework with clear criteria for synthetic and real-data assessments.
- Privacy and consent considerations with data classification, anonymization standards, and
  rollback procedures.
- Risk mitigation strategies for courtesy bias, small sample limitations, and the critical
  distinction between interest and demand.
- A comprehensive list of deferred items requiring owner action before real-data collection
  can begin.

### 18.2 Status

| Aspect | Status |
|---|---|
| Research protocol | **Complete** (synthetic) |
| Interview guide | **Complete** (synthetic) |
| Consent script | **Complete** (requires owner approval for real use) |
| Anonymization procedure | **Complete** |
| Synthetic profiles | **Complete** (8 profiles) |
| Synthetic interview results | **Complete** |
| Theme analysis | **Complete** (7 themes identified) |
| Acceptance criterion | **Synthetically met** (5 ≥ 3) |
| Disconfirming cases | **Documented** (1 genuine) |
| Go/no-go framework | **Complete** |
| Real-data collection | **Deferred** (requires owner authorization) |
| Real demand evidence | **Not established** |

### 18.3 Decision

**BASELINE ESTABLISHED.** The research protocol is complete and has been exercised with
synthetic data. The synthetic findings suggest that a repeated costly job exists (cross-
referencing primary sources across editions/languages) and that procurement blockers are
prevalent. However, these findings are constructed, not observed, and do not constitute
real demand evidence.

**Next step**: Owner authorization for real-data collection. Until authorized, M48-01
remains at the synthetic baseline stage, and downstream tasks (ECO-002, ECO-003, ECO-005)
remain deferred.

### 18.4 Document Provenance

| Field | Value |
|---|---|
| Document path | `docs/audit/M48-01-institutional-demand-validation.md` |
| Document type | Audit/design document |
| Data type | Synthetic only — no real participant data |
| Task status in TODO | Unchecked (planning only; this document does not complete the task) |
| V5 candidate | ECO-001 |
| TODO task | M48-01 |
| Milestone | M48 |
| Group | G7 — ECOSYSTEM |
| Dependencies | M35-01 (BLOCKED in TODO; workable as baseline with synthetic data) |
| Companion tasks | ECO-002 (M48-02), ECO-005 (M48-05) |
| Date | 2026-10-30 |
| Confidence | Low (synthetic data; no real interviews conducted) |

### 18.5 Compliance Statement

This document complies with the following project governance requirements:

- **TODO.md is the sole status source.** This document does not claim task completion.
- **No new branch created.** Work follows the owner's branch discipline policy (dev only).
- **No participant data in product databases.** All data is synthetic and stored in the
  audit document only.
- **No payment flow.** This task is research-only; no billing, pricing, or transaction
  mechanism is created or implied.
- **No service offer.** Interviews (synthetic or real) explore problems, not solutions.
- **No outreach without authorization.** Real-data collection requires explicit owner
  approval.
- **Anti-overlap maintained.** This document addresses demand and costly jobs only; it
  does not encroach on ECO-002 (self-hosted support), ECO-003 (pricing), ECO-004
  (entitlements), ECO-005 (partnerships), ECO-006 (cost modeling), or M35 (buyer/service).
- **Synthetic data clearly marked.** All profiles, quotes, and results are identified as
  fictional throughout the document.
- **Disconfirming cases documented.** P-08 is recorded as a genuine disconfirming case.
- **Sample and selection bias stated.** Seven bias types are documented in §10.
- **Limitations explicit.** §16 states what this document cannot claim.

---

## Appendix A: Consent Script Template (Printable)

> **M48-01 Institutional Research Workflow Study — Consent Form**
>
> **Study title**: Understanding Institutional Research Workflows Involving Primary Source Comparison
>
> **Researcher**: [Name and contact]
>
> **Purpose**: We are conducting a research study to understand how institutional researchers
> manage workflows involving primary source comparison, cross-referencing, and traceability.
>
> **Procedures**: You will be asked to participate in a ~50-minute interview about your
> research workflow. The interview will be [audio-recorded / noted by hand].
>
> **Risks**: Minimal. You may decline to answer any question or withdraw at any time.
>
> **Benefits**: None direct. Your answers will help us understand whether this is a problem
> space worth exploring.
>
> **Confidentiality**: Your name and institution will be replaced with a code in all research
> outputs. Direct quotes will only be used with your additional explicit consent.
>
> **Data retention**: Raw data will be deleted within 30 days of the interview. Anonymized
> findings will be retained.
>
> **Contact**: [Researcher contact information]
>
> **Consent**: I have read and understood the above information. I agree to participate.
>
> [ ] I consent to audio recording.
> [ ] I consent to the use of direct quotes (anonymized).
> [ ] I do NOT consent to audio recording (notes only).
> [ ] I do NOT consent to the use of direct quotes (paraphrase only).
>
> Participant name: ________________________
>
> Participant signature: ________________________ Date: ____________
>
> Researcher signature: ________________________ Date: ____________

---

## Appendix B: Interview Note-Taking Template

> **Participant code**: P-___
>
> **Date**: ____________
>
> **Interviewer**: ____________
>
> **Recording consent**: [ ] Yes [ ] No
>
> **Quote consent**: [ ] Yes [ ] No
>
> ---
>
> **Module A: Role and Context**
>
> A1 (Role description):
>
> A2 (Time split — research vs. other):
>
> A3 (Source material types):
>
> ---
>
> **Module B: Workflow Walkthrough**
>
> B1 (Last research task — step by step):
>
> B2 (Tools used at each step):
>
> B3 (Tool-switching points):
>
> B4 (Total task duration):
>
> B5 (Task frequency):
>
> ---
>
> **Module C: Pain Points and Workarounds**
>
> C1 (Most difficult steps):
>
> C2 (Shortcuts/workarounds):
>
> C3 (Unmet needs):
>
> C4 (One thing to change):
>
> C5 (Past tool attempts):
>
> ---
>
> **Module D: Procurement Context**
>
> D1 (Decision process):
>
> D2 (Budget authority):
>
> D3 (Policies/constraints):
>
> D4 (Past procurement failures):
>
> ---
>
> **Module E: Closing**
>
> E1 (Anything else):
>
> E2 (Magic wand):
>
> E3 (Participant questions):
>
> ---
>
> **Post-interview reflection** (researcher only):
>
> Courtesy bias observed: [ ] None [ ] Some [ ] Significant
>
> Interest vs. demand clarity: [ ] Clear [ ] Ambiguous
>
> Follow-up needed: [ ] No [ ] Yes — describe: ____________

---

## Appendix C: Theme Coding Sheet

> **Instructions**: For each interview, code the presence (✓) or absence (—) of each theme.
> Add new themes as they emerge. A theme is "repeated" if it appears in ≥3 profiles.

| Theme | P-01 | P-02 | P-03 | P-04 | P-05 | P-06 | P-07 | P-08 | Total | Repeated? |
|---|---|---|---|---|---|---|---|---|---|---|
| T1: Cross-referencing is manual/time-consuming | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | — | 5 | Yes |
| T2: Workaround relies on spreadsheet/email/scripts | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | — | 5 | Yes |
| T3: Procurement blockers exist | ✓ | ✓ | — | partial | ✓ | ✓ | ✓ | — | 5 | Yes |
| T4: Pain experiencer lacks tool-change authority | — | ✓ | — | — | ✓ | — | ✓ | — | 3 | Yes |
| T5: Existing tools don't integrate | — | — | ✓ | ✓ | — | — | — | — | 2 | No |
| T6: Sustainability concerns about custom tools | — | — | ✓ | — | — | ✓ | — | — | 2 | No |
| T7: No costly job described | — | — | — | — | — | — | — | ✓ | 1 | Disconfirming |

---

## Appendix D: Glossary

| Term | Definition |
|---|---|
| **Acceptance criterion** | The minimum evidence threshold for the task to be considered complete. For M48-01: ≥3 independent respondents describe the same costly job and current workaround. |
| **Anti-sales guard** | Protocol rules preventing the interviewer from presenting MoonWitness or any product as a solution during the interview. |
| **BASELINE ESTABLISHED** | The document status indicating that the research protocol is complete and has been exercised with synthetic data, but real-data collection has not occurred. |
| **Costly job** | A recurring workflow task that consumes significant time, money, or effort and for which current tools are inadequate. |
|Courtesy bias** | The tendency of participants in professional settings to be agreeable and supportive, potentially inflating apparent demand. |
| **Disconfirming case** | A participant or finding that contradicts the demand hypothesis. Essential for intellectual honesty. |
| **Go/no-go decision** | A determination of whether to proceed to downstream tasks based on collected evidence. |
| **MoonWitness XV** | The product/system under development. A monorepo containing multiple applications (Dock, Headquarters, Cockpit, ARSY, etc.) with a research domain addon (D05 MIZAN). |
| **MIZAN** | The review methodology subsystem within MoonWitness XV's research domain. Provides scoring, stage evaluation, and review state management. |
| **Problem interview** | An interview format focused on understanding the participant's current workflow and pain points, without presenting a specific solution. |
| **Procurement blocker** | Any institutional constraint (budget, approval process, IT policy) that prevents or delays the adoption of a new tool. |
| **Synthetic data** | Fictional data constructed to exercise a protocol or demonstrate expected patterns. Not evidence of real-world conditions. |
| **Theme** | A recurring pattern identified across multiple interview profiles. Coded qualitatively, not quantitatively. |
| **Workaround** | An informal method a participant has developed to cope with a costly job in the absence of adequate tools. |

---

## Appendix E: Cross-Reference to V5 Source Package

This document corresponds to the following entries in the V5 source package:

| V5 reference | Location | Relationship |
|---|---|---|
| ECO-001 | `docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md` | Canonical specification (22 sections) |
| M48-01 | `TODO.md` (M48 section) | Canonical TODO task |
| M48 milestone | `docs/milestones/M48.md` | Parent milestone |
| V5 source package | `docs/research/unified-100-issue-frontier-v5/README.md` | Source package root |
| ADR applicability | `docs/research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md` | No new ADR required |
| M35-01 dependency | `TODO.md` (M35 section) | BLOCKED; workable as baseline with synthetic data |
| ECO-002 downstream | `ISSUES_ECONOMY.md` | Shares protocol/pool |
| ECO-005 downstream | `ISSUES_ECONOMY.md` | Shares protocol/pool |

---

*End of document. Status: BASELINE ESTABLISHED. Synthetic data only. No real participant data.*
