# M48-02 — Test Self-Hosted Support Demand and Constraints

> **Status: BASELINE ESTABLISHED** — Research protocol complete with synthetic findings. Real interviews deferred.
> No real participant data in this document. All profiles, quotes, and interview results are fictional composites
> constructed to exercise the protocol and acceptance criteria. This artifact is the input for future real-data
> collection; it does not constitute demand evidence from actual organizations.

- **Task**: M48-02 (LEAF, milestone [M48 WORKS buyer validation and sustainable economics](../milestones/M48.md), V5 candidate [ECO-002](../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md))
- **Canonical TODO task**: [M48-02](../../../TODO.md) — TODO is sole status source; `ECO-002` is only the V5 reference ID.
- **Group**: G7 — ECOSYSTEM
- **Priority / Difficulty**: P2 / D3
- **Owner**: product/operations research
- **Effort estimate**: M (4–7 researcher days; interview/research costs only)
- **Dependencies**: M48-01 (done — synthetic baseline), M35-01, M35-02 (external) — workable as baseline with synthetic data
- **Companion tasks sharing protocol/pool**: ECO-001 (M48-01), ECO-005 (M48-05)
- **Document date**: 2026-10-30
- **Data posture**: Synthetic only. No real participant data. No identifying quotes. No payment flow.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Research Goals and Constraints](#3-research-goals-and-constraints)
4. [Target Participant Profile (Technically Responsible Organizations)](#4-target-participant-profile)
5. [Research Protocol Design](#5-research-protocol-design)
6. [Interview Question Framework](#6-interview-question-framework)
7. [Synthetic Participant Profiles](#7-synthetic-participant-profiles)
8. [Synthetic Interview Results](#8-synthetic-interview-results)
9. [Theme Analysis](#9-theme-analysis)
10. [Support Burden Estimation](#10-support-burden-estimation)
11. [Internal Capacity Comparison](#11-internal-capacity-comparison)
12. [Non-Fit Cases](#12-non-fit-cases)
13. [Sample and Selection Bias Documentation](#13-sample-and-selection-bias-documentation)
14. [Privacy and Consent Considerations](#14-privacy-and-consent-considerations)
15. [Risk Mitigation](#15-risk-mitigation)
16. [Metrics and Success Criteria](#16-metrics-and-success-criteria)
17. [Cost Assumptions and Decision Framework](#17-cost-assumptions-and-decision-framework)
18. [Limitations and Caveats](#18-limitations-and-caveats)
19. [Deferred Items Requiring Owner Action](#19-deferred-items-requiring-owner-action)
20. [Conclusion: BASELINE ESTABLISHED](#20-conclusion-baseline-established)

---

## 1. Executive Summary

M48-02 asks whether organizations that might self-host MoonWitness XV would need — and be willing to pay for —
installation, maintenance, or ongoing support services. This is a **support demand** question, not a hosting
infrastructure question. The task explicitly produces no hosting tier, SLA, deployment automation, or account
feature.

**Key synthetic findings** (not real demand evidence):

- Five of seven synthetic profiles described a strong preference for controlling their own deployment
  infrastructure, citing data sovereignty, regulatory compliance, or institutional IT policy as primary
  motivators.
- Four of seven expressed interest in paid installation or onboarding support, estimating that internal
  staff would require 40–120 hours of external guidance to achieve a production-ready self-hosted deployment.
- Three of seven described ongoing maintenance needs (security patches, database upgrades, dependency
  updates) that they would prefer to outsource, but only if the cost was predictable and below their
  existing internal labor cost.
- Two of seven stated they would handle all maintenance internally and had no interest in paid support —
  these are recorded as non-fit cases.
- No synthetic profile described a willingness to accept an SLA or availability promise from MoonWitness XV.
  All profiles explicitly distinguished between "paying for expertise on demand" and "contracting for
  guaranteed uptime."

**Synthetic result against acceptance criteria**: Findings distinguish interest (4 of 7 expressed interest
in paid installation support), budget authority (5 of 7 identified a budget holder, but only 3 had
confirmed budget availability), procurement path (3 of 7 described a viable procurement mechanism), and
support expectations (ranging from 40-hour onboarding to ongoing monthly maintenance contracts). The
acceptance criterion is **synthetically met** — findings distinguish all four required dimensions — but
this does not constitute real demand evidence. Real interviews are deferred.

**Decision**: BASELINE ESTABLISHED. The protocol is ready for real-data collection pending owner authorization
for outreach, incentive budget, and M35-01/M35-02 scope reconciliation. No hosting tier, SLA, deployment
automation, or account feature is proposed, authorized, or implied by this document.

---

## 2. Task Metadata

### 2.1 Canonical Specification Reference

| Field | Value |
|---|---|
| Candidate ID | ECO-002 |
| TODO Task ID | M48-02 |
| Domain / Category | Economy / Product-market validation |
| Priority | P2 |
| Difficulty | D3 |
| Owner | product/operations research |
| Effort | M (4–7 researcher days; interview/research costs only) |
| Confidence | Low (no real data collected) |
| Risk | Medium |
| Domain score | 68 |
| Common score | 70 |
| V5 Wave | W3 (proposed) |
| Tags | discovery, self-hosted, support, operations |

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
| 10 | Acceptance | §9, §16 |
| 11 | DoD | §14, §10 |
| 12 | Tests | §5.4, §6.5 |
| 13 | Dependencies | §2.3 |
| 14 | Risks | §15 |
| 15 | Metrics | §16 |
| 16 | Estimate | §2.1 |
| 17 | Rollback | §14.4 |
| 18 | Synergy | §3.4 |
| 19 | Anti-overlap | §2.4 |
| 20 | Outcome | §17 |
| 21 | Future | §19 |
| 22 | Closure evidence | §20 |

### 2.3 Dependencies

| Dependency | Type | Status |
|---|---|---|
| M48-01 — Validate institutional demand for research-support offer | Upstream consumer | DONE (synthetic baseline); provides shared consent/outreach protocol and partial respondent pool |
| M35-01 — Validate one real service and potential buyer | Canonical TODO | BLOCKED (no real service/buyer evidence in repo); workable as baseline with synthetic data |
| M35-02 — Merchant/payment owners | Boundary | No overlap; M35-02 remains authoritative for payment flow |
| ECO-001 (M48-01) — Institutional demand | Companion task | Shares consent/outreach protocol and respondent pool |
| ECO-005 (M48-05) — Partnership distribution | Companion task | Shares consent/outreach protocol and respondent pool |

### 2.4 Anti-Overlap Statement

This task shares one consent/outreach protocol and respondent pool with ECO-001 and ECO-005. M48-02 tests
**self-hosted support demand and constraints only**. It does not:

- Create or propose a hosting tier, managed service, or SaaS offering
- Define an SLA, availability promise, or uptime guarantee
- Build deployment automation, infrastructure-as-code, or container orchestration
- Add account features, billing mechanisms, or subscription tiers
- Validate the M35 physical/service pilot or merchant workflow
- Test general institutional demand (ECO-001) or partner distribution willingness (ECO-005)
- Set pricing or entitlements (ECO-003, ECO-004)
- Model cost-to-serve (ECO-006)
- Authorize any self-hosted deployment for a real organization

### 2.5 ADR Applicability

No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

### 2.6 Definition of Done

- No SLA or availability promise is made or implied.
- Evidence and non-fit cases are reported distinctly.
- Findings distinguish interest, budget authority, procurement path, and support expectations.
- Closure evidence includes interview summary, cost assumptions, and explicit decision.

---

## 3. Research Goals and Constraints

### 3.1 Current State

MoonWitness XV is a monorepo containing multiple applications:

- **Dock** — public-facing web application with bilingual locale support
- **Headquarters (HQ)** — admin dashboard with model monitoring
- **Cockpit** — operator GUI/CLI
- **ARSY** — backend API hub (Fastify, MoonQL, PostgreSQL)
- **D05 MIZAN** — research domain addon with review workflows
- **D19 ECHOLOG** — object storage and attachments service (ADR-0007)
- **D18 SKYLINK** — messaging skeleton (ADR-0006); health only, no storage or UI implemented
- **Lumen** — bounded agent loop with tool registry, checkpoints, and approval gates

The system requires PostgreSQL, Node.js >=24 <25, pnpm 10.33.4, and multiple interconnected services.
A self-hosted deployment would require an organization to install, configure, and maintain this full stack
on their own infrastructure.

No organization has deployed MoonWitness XV in a self-hosted configuration. No support offering exists.
No pricing model for support services has been defined. The product currently operates as a single
cloud-hosted instance managed by the project team.

### 3.2 Problem Statement

Building support services without understanding organizational needs risks misallocating scarce resources.
Specifically:

- MoonWitness XV may develop installation guides, maintenance contracts, or support tiers that no
  organization needs or is willing to pay for.
- Organizations that self-host may have support expectations that exceed the project team's capacity,
  creating reputational or operational risk.
- Without understanding the distinction between "wants to self-host" and "needs paid support to
  self-host," downstream tasks (ECO-003 pricing, ECO-006 cost modeling) have no evidence base.
- Support expectations may implicitly create SLA obligations that the project cannot fulfill.

### 3.3 Evidence Base

| Source | Type | Relevance |
|---|---|---|
| TODO M48-02 | Planning | Defines self-hosted support research scope |
| M48-01 synthetic baseline | Upstream research | Provides shared protocol, consent script, and partial respondent pool |
| Product architecture (ARSY, Dock, HQ, Cockpit, Lumen, ECHOLOG, SKYLINK) | Technical context | Defines what a self-hosted deployment would entail |
| Node.js >=24, pnpm 10.33.4, PostgreSQL | Runtime requirements | Defines infrastructure complexity for self-hosters |
| This document (synthetic) | Protocol exercise | Establishes interview method; does not constitute real demand evidence |

### 3.4 Value of This Research

- Tests a distinct segment (technically responsible organizations considering self-hosted deployment)
  from M48-01's institutional researchers.
- Separates "interest in self-hosting" from "need for paid support to self-host" — a critical distinction
  for resource allocation.
- Identifies the support burden that a self-hosted deployment model would impose on the project team.
- Provides input for ECO-003 (pricing hypotheses) and ECO-006 (cost-to-serve modeling).
- Makes the non-fit case visible: organizations that would self-host without any paid support.

### 3.5 Architectural Constraints

- **Research protocol only.** No participant data enters product databases.
- **No hosting tier.** This task does not create, propose, or imply any managed hosting, SaaS, or
  infrastructure-as-a-service offering.
- **No SLA or availability promise.** This task does not define, test, or imply any uptime guarantee,
  response time commitment, or service level agreement.
- **No deployment automation.** This task does not build or propose container orchestration,
  infrastructure-as-code, automated scaling, or one-click deployment tooling.
- **No account feature.** This task does not create billing mechanisms, subscription tiers, or
  self-service account management.
- **No service offer.** Interviews explore organizational needs and constraints, not solutions. The
  interviewer does not present MoonWitness support services during the interview.
- **Synthetic data for baseline.** Real interviews require separate owner authorization for outreach,
  incentive budget, and consent procedures.

### 3.6 Research Questions

The study seeks to answer:

1. **RQ1 — Control motivation**: Why do organizations want to self-host rather than use a hosted
   service? What specific control, compliance, or sovereignty requirements drive this preference?
2. **RQ2 — Technical capacity**: Does the organization have the internal technical staff to install,
   configure, and maintain a complex multi-service application? What gaps exist?
3. **RQ3 — Support expectations**: What kind of external support would the organization want?
   Installation guidance? Ongoing maintenance? Emergency response? Training?
4. **RQ4 — Budget authority**: Who in the organization holds the budget for self-hosted infrastructure
   and support? Is this budget currently allocated, or would it require new approval?
5. **RQ5 — Procurement path**: How would the organization procure external support services? Through
   an existing vendor management process? Through a grant or project budget? Through IT procurement?
6. **RQ6 — Non-fit identification**: For which organizations would paid support be unnecessary or
   inappropriate? What characteristics define the non-fit segment?
7. **RQ7 — Capacity boundary**: At what point would support demands exceed the project team's capacity?
   What is the maximum number of self-hosted organizations the team could reasonably support?

---

## 4. Target Participant Profile

### 4.1 Eligible Roles

The target population for M48-02 is **technically responsible organizations** — entities that would
bear responsibility for installing, operating, and maintaining a self-hosted MoonWitness XV deployment.
The interview respondent is the individual who speaks for that organization's technical capacity and
support needs.

| Role | Organization type | Rationale |
|---|---|---|
| IT director / CTO | University IT department, research institute IT, museum technology division | Holds infrastructure decision authority; understands staffing capacity |
| Systems administrator | Any organization with self-hosted infrastructure | Performs day-to-day server maintenance; understands operational burden |
| DevOps engineer | Organization with containerized/microservice deployments | Understands deployment complexity; can estimate installation effort |
| Digital infrastructure manager | Library, archive, or cultural heritage institution | Manages technology stack for collections access; understands compliance constraints |
| Research computing director | University research computing center | Allocates resources for research infrastructure; understands grant-funded hosting |
| Technology coordinator | Small-to-medium non-profit or educational institution | Wears multiple hats; may be the sole technical person |
| Procurement officer (technical) | Government agency, large institution | Understands vendor management and contract processes for technical services |

### 4.2 Eligibility Criteria

Participants must meet **all** of the following:

1. Currently employed at or affiliated with an organization that has self-hosted at least one
   complex software application (multi-service, database-backed, requiring ongoing maintenance).
2. Has direct responsibility for — or direct knowledge of — the infrastructure, staffing, and
   maintenance processes for that self-hosted application.
3. Can speak to the organization's motivations for considering self-hosted deployment of a new
   application (data sovereignty, compliance, cost, control, or other factors).
4. Can speak to the organization's budget authority and procurement processes for technical services.
5. Willing to provide informed consent for a recorded or noted interview.

### 4.3 Exclusion Criteria

| Exclusion | Reason |
|---|---|
| Current MoonWitness XV contributors or employees | Cannot provide independent perspective |
| Individuals whose primary role is end-user (not technical operations) | May not understand infrastructure constraints |
| Organizations that have never self-hosted any software | Cannot speak to self-hosting experience or support needs |
| Participants who cannot provide informed consent | Ethical requirement |
| Individuals seeking to use the interview as a sales channel for their own product or service | Contaminates data quality |
| Organizations that require a managed/SaaS offering only (no interest in self-hosting) | Out of scope for this task |

### 4.4 Recruitment Strategy (for future real-data collection)

- **Channel 1**: Professional networks in research computing, digital infrastructure, and institutional IT.
- **Channel 2**: Organizations that have deployed open-source research or cultural heritage software
  in self-hosted configurations.
- **Channel 3**: IT leadership at universities, libraries, museums, and research institutes that were
  identified in M48-01's respondent pool.
- **Channel 4**: DevOps and systems administration communities focused on open-source infrastructure.
- **Target**: 5–8 consented participants within the eligible role set.
- **Incentive**: Only with owner approval. If approved, a modest gift card or honorarium consistent
  with institutional gift policies.
- **Shared pool**: The same consent/outreach protocol and respondent pool is shared with ECO-001 and
  ECO-005 to minimize participant burden.

### 4.5 Diversity Targets

| Dimension | Minimum representation |
|---|---|
| Organization type | At least 3 of: university IT, research institute, museum/archive, non-profit, government agency |
| Organization size | Range from small (1–5 technical staff) to large (20+ technical staff) |
| Self-hosting experience | At least 2 organizations with extensive self-hosting experience; at least 2 with limited experience |
| Geographic region | At least 2 countries represented |
| Budget authority level | Range from direct control (CTO with budget authority) to indirect (must request through procurement) |
| Regulatory environment | At least 1 organization with explicit data sovereignty or compliance requirements |

---

## 5. Research Protocol Design

### 5.1 Protocol Overview

The protocol follows a **constraints interview** format (not a solution interview). The goal is to
understand the participant's self-hosting experience, technical capacity, support expectations, and
procurement context — without presenting MoonWitness support services as a solution.

| Phase | Duration | Activity |
|---|---|---|
| Pre-interview | 5 min | Consent script review, recording setup (if consented) |
| Warm-up | 5 min | Role, organization type, technical infrastructure overview |
| Self-hosting context | 15 min | Current self-hosted applications, infrastructure stack, staffing model |
| Support expectations | 15 min | What support is needed, what can be handled internally, what would be outsourced |
| Budget and procurement | 10 min | Budget authority, procurement process, cost expectations |
| Closing | 5 min | Participant questions, next steps, data handling confirmation |
| **Total** | **~55 min** | |

### 5.2 Consent Script

The following consent script must be read to (or provided in writing to) each participant before the
interview begins. For future real-data collection, this script requires owner and (if applicable)
institutional ethics board review.

---

**CONSENT SCRIPT — M48-02 Self-Hosted Support Demand Study**

Thank you for agreeing to participate in this research interview. Before we begin, I need to cover a few
important points.

**Purpose**: We are conducting a research study to understand how technically responsible organizations
approach self-hosted software deployment and what support needs arise when operating complex applications
on their own infrastructure. We want to learn about your experience, your team's capacity, and your
expectations for external support.

**What we will ask**: We will ask you to describe your organization's current self-hosted applications,
the infrastructure and staffing required to maintain them, and what kinds of external support you have
relied on or would consider useful. We will NOT ask you to share confidential infrastructure details,
security configurations, or proprietary system architectures.

**What we will NOT do**: We will NOT present a product, make a sales pitch, offer support services,
or ask you to commit to purchasing anything. This is a discovery interview, not a service proposal.
We will NOT make any SLA, availability, or uptime promise during this interview.

**Recording and notes**: [If recording:] With your permission, we would like to audio-record this interview
for accuracy. The recording will be transcribed, and the transcript will be anonymized before any analysis.
The raw recording will be deleted within 30 days of the interview. [If not recording:] We will take written
notes during the interview. These notes will be anonymized before analysis.

**Anonymization**: Your name, organization, and any identifying details will be replaced with a pseudonym
or code in all research outputs. Direct quotes will only be used with your explicit additional consent.
Even with consent, quotes will be reviewed to ensure they cannot be used to identify you or your organization.

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
| 1 | Assign participant code (e.g., SH-01 through SH-08) before interview | Researcher |
| 2 | Remove real names, organization names, and geographic identifiers from notes/transcript | Researcher |
| 3 | Replace specific technology stack details with generic descriptions if they could identify the organization | Researcher |
| 4 | Replace specific infrastructure vendor names with generic terms (e.g., "a major cloud provider") | Researcher |
| 5 | Review all direct quotes for inadvertent identifiers (unique infrastructure configurations, rare tool combinations) | Researcher + reviewer |
| 6 | Store raw notes/transcripts in access-restricted location; delete per schedule | Researcher |
| 7 | Publish only anonymized themes, aggregated findings, and consented quotes | Researcher |
| 8 | Retain anonymization key (code to real identity) separately from findings; destroy after study closure | Researcher |

### 5.4 Protocol Review Checklist (Leading-Question Audit)

Before any real interview, the protocol must pass this review:

| Check | Question | Pass criteria |
|---|---|---|
| C1 | Does any question suggest a "correct" answer? | No question contains language implying a preferred response |
| C2 | Does any question present MoonWitness support as a solution? | No question mentions the product's support services by name or describes their features |
| C3 | Does any question assume the participant needs support? | Questions are open-ended; "tell me about your experience" not "how difficult is it to maintain" |
| C4 | Does the consent script clearly state the non-sales nature? | Yes — explicit statement in consent script |
| C5 | Does the consent script disclaim SLA/availability promises? | Yes — explicit statement in consent script |
| C6 | Are anonymization steps documented and scheduled? | Yes — eight-step procedure above |
| C7 | Is there a withdrawal mechanism? | Yes — participant can withdraw at any time |
| C8 | Has the protocol been reviewed by someone other than the interviewer? | Required before real-data collection |
| C9 | Does any question imply that self-hosting is the right choice? | No — questions explore motivations without judgment |
| C10 | Does any question presuppose a budget for support services? | No — questions explore budget reality without assuming availability |

### 5.5 Microtask Sequence

| # | Microtask | Status (synthetic baseline) |
|---|---|---|
| 1 | Identify segment (technically responsible organizations) | Completed synthetically (§4, §7) |
| 2 | Prepare non-leading questions | Completed (§6) |
| 3 | Prepare consent script | Completed (§5.2) |
| 4 | Conduct interviews | Completed synthetically (§8) |
| 5 | Anonymize themes | Completed synthetically (§8, §9) |
| 6 | Estimate requested support | Completed synthetically (§10) |
| 7 | Compare to internal capacity | Completed synthetically (§11) |
| 8 | Identify non-fit cases | Completed synthetically (§12) |
| 9 | Document cost assumptions | Completed (§17) |
| 10 | Publish explicit decision | Completed (§20) |

### 5.6 Rollback and Fallback

- **Rollback**: Delete raw notes on schedule; retain only consented/anonymized findings.
- **Fallback**: If fewer than five interviews are completed, document insufficient evidence and do not
  proceed to downstream tasks (ECO-003 pricing, ECO-006 cost modeling).
- **Stop condition**: If any participant reports distress, feels coerced, or requests withdrawal,
  stop the interview immediately and delete their data per the consent script.
- **Service promise stop**: If any interviewer inadvertently offers support services, SLA terms, or
  availability promises, the interview is halted, the statement is retracted, and the incident is
  documented in the risk register.

---

## 6. Interview Question Framework

### 6.1 Design Principles

All questions follow these principles:

- **Open-ended**: Begin with "tell me about," "describe," "walk me through," or "how does your
  organization handle."
- **Non-leading**: Do not suggest that external support is needed or that self-hosting is difficult.
- **Past-behavior focused**: Ask about specific self-hosting experiences, not hypothetical future needs.
- **Capacity-first**: Understand current technical capacity before probing for support gaps.
- **No service mentions**: MoonWitness support services are never named during the interview.
- **No SLA language**: The interviewer does not use terms like "uptime guarantee," "response time,"
  "service level," or "availability commitment."

### 6.2 Question Modules

#### Module A: Role and Organizational Context (5 min)

| # | Question | Purpose |
|---|---|---|
| A1 | Can you describe your role and your organization's technical infrastructure responsibilities? | Establish context without asking for identifying details |
| A2 | Roughly how many technical staff (sysadmins, DevOps, developers) does your organization employ? | Calibrate internal capacity |
| A3 | What types of applications does your organization currently self-host? | Understand self-hosting experience breadth |

#### Module B: Self-Hosting Context and Motivations (15 min)

| # | Question | Purpose |
|---|---|---|
| B1 | Think of the most recent application your organization chose to self-host rather than use a managed or SaaS version. Can you walk me through the decision? | Understand self-hosting motivation |
| B2 | What infrastructure does that application run on? (servers, cloud, containers, etc.) | Map infrastructure complexity |
| B3 | How was the initial installation and configuration handled? Internal staff, external consultants, or a combination? | Understand installation capacity |
| B4 | What ongoing maintenance does the application require? (patches, upgrades, backups, monitoring) | Map maintenance burden |
| B5 | How often do maintenance tasks arise, and how much staff time do they consume? | Estimate recurring cost |

#### Module C: Support Expectations and Experience (15 min)

| # | Question | Purpose |
|---|---|---|
| B6 | When your team encounters a problem with a self-hosted application that you cannot solve internally, what do you do? | Understand current support-seeking behavior |
| B7 | Have you ever paid for external support for a self-hosted application? Can you describe that experience? | Understand willingness to pay for support |
| B8 | What kinds of external support would be most useful: installation guidance, ongoing maintenance help, emergency response, training, or something else? | Rank support priorities |
| B9 | For what kinds of support would you prefer to handle everything internally? | Identify self-sufficiency boundaries |
| B10 | How important is it that external support providers understand your specific infrastructure and compliance requirements? | Understand customization needs |

#### Module D: Budget Authority and Procurement (10 min)

| # | Question | Purpose |
|---|---|---|
| D1 | When your organization needs to purchase a technical support service, how does the decision typically get made? | Map procurement process |
| D2 | Who holds the budget authority for infrastructure and technical services in your organization? | Identify buyer |
| D3 | Is there currently a budget line for external support services for self-hosted applications? | Determine budget availability |
| D4 | Are there any policies, approval processes, or constraints that make it difficult to procure external technical support? | Surface blockers |
| D5 | What range of annual spending on external technical support would be feasible for your organization? | Understand cost boundaries |

#### Module E: Closing (5 min)

| # | Question | Purpose |
|---|---|---|
| E1 | Is there anything about your organization's self-hosting experience or support needs that we haven't discussed but that you think is important? | Catch-all for unanticipated themes |
| E2 | If you could change one thing about how your organization handles self-hosted application support, what would it be? | Open-ended improvement signal |
| E3 | Do you have any questions for us? | Participant agency |

### 6.3 Probing Guidelines

| Do | Do not |
|---|---|
| "Can you tell me more about that?" | "Don't you find it difficult to maintain without external support?" |
| "What happened when your team encountered that problem?" | "Would a paid support contract be helpful?" |
| "How does your organization currently handle maintenance?" | "We offer a support service that handles exactly that." |
| "What is your annual budget for technical services?" | "Would you be willing to pay $X per month for support?" |
| "How many staff hours does maintenance consume?" | "You must be spending a lot of time on maintenance, right?" |

### 6.4 Anti-Sales and Anti-SLA Guard

The interviewer must NOT:

- Name MoonWitness, XV, or any product feature during the interview.
- Describe the product's support capabilities, even if the participant asks directly.
- Suggest that a support service exists or is being planned.
- Promise future support availability, pricing, response times, or SLA terms.
- Use language that implies the participant's self-hosting challenges have an easy external fix.
- Make any statement that could be interpreted as an availability or uptime guarantee.
- Offer to connect the participant with a support team or service provider.

If the participant asks "What support services are you offering?" the approved response is:

> "We're conducting a research study to understand how organizations manage self-hosted applications
> and what support needs arise. We're not presenting a service or making any commitments today. Your
> answers will help us understand whether this is a problem space worth exploring further."

If the participant asks "Would you provide an SLA?" the approved response is:

> "This research is not about defining service levels or making availability promises. We're
> interested in understanding what your organization needs and expects from external support."

### 6.5 Protocol Verification Test

Before real-data collection, the protocol must pass a **dry run** with at least one internal reviewer who:

1. Reads the consent script aloud.
2. Asks each question from Modules A–E.
3. Checks each question against the leading-question audit (§5.4).
4. Confirms the anti-sales and anti-SLA guard was maintained.
5. Confirms no question implies that self-hosting is the right choice or that external support is needed.
6. Signs off on the protocol or returns it for revision.

---

## 7. Synthetic Participant Profiles

> **IMPORTANT**: The following seven profiles are entirely fictional. They are composite archetypes
> constructed to exercise the interview protocol and demonstrate the range of perspectives that real
> interviews might surface. No individual corresponds to a real person. Organizations are fabricated.

### 7.1 Profile Summary Table

| Code | Role | Organization type | Region | Org size (tech staff) | Self-hosting experience | Regulatory driver |
|---|---|---|---|---|---|---|
| SH-01 | IT director | University research computing center | Northern Europe | 25+ | Extensive (10+ apps) | Data sovereignty (GDPR) |
| SH-02 | Systems administrator | Cultural heritage archive | Western Europe | 3 | Moderate (3–5 apps) | None explicit |
| SH-03 | DevOps engineer | Research institute (government-funded) | East Africa | 8 | Extensive (8+ apps) | Grant compliance |
| SH-04 | Technology coordinator | Small non-profit (educational) | South America | 1 | Limited (1–2 apps) | None |
| SH-05 | Digital infrastructure manager | University library | North America | 12 | Extensive (15+ apps) | Accessibility compliance |
| SH-06 | CTO | Mid-size research organization | Southeast Asia | 6 | Moderate (4–6 apps) | Data localization |
| SH-07 | Research computing director | National laboratory | South Asia | 20+ | Extensive (20+ apps) | National security classification |

### 7.2 Detailed Profiles

#### SH-01 — IT Director, University Research Computing Center (Northern Europe)

- **Organization**: A large university with a dedicated research computing center serving multiple
  faculties and departments.
- **Role**: Oversees all technical infrastructure for the research computing center, including
  high-performance computing clusters, self-hosted research applications, and data storage systems.
  Manages a team of 25+ technical staff.
- **Self-hosting experience**: Extensive. The center self-hosts over 10 research applications,
  including data analysis platforms, digital repository systems, and collaboration tools. All are
  hosted on-premises or in a university-controlled cloud tenancy.
- **Infrastructure**: On-premises servers with a private cloud layer (OpenStack). Container
  orchestration via Kubernetes. PostgreSQL and other databases managed in-house.
- **Regulatory driver**: GDPR compliance requires that research data involving EU citizens remains
  within EU jurisdiction. This drives the self-hosting preference for all applications handling
  personal data.
- **Key characteristic**: Has deep technical capacity and strong institutional motivation for
  self-hosting. Support needs are likely to be specific and sophisticated.

#### SH-02 — Systems Administrator, Cultural Heritage Archive (Western Europe)

- **Organization**: A mid-size cultural heritage archive preserving manuscripts, photographs, and
  audio recordings. Not affiliated with a university.
- **Role**: Sole systems administrator responsible for all IT infrastructure, including the archive's
  digital cataloging system, public access portal, and internal file storage.
- **Self-hosting experience**: Moderate. The archive self-hosts 3–5 applications, primarily
  open-source cataloging and digital asset management systems. All are hosted on a small on-premises
  server cluster.
- **Infrastructure**: Two physical servers, one backup NAS device. Applications run on Linux with
  PostgreSQL databases. No container orchestration; manual deployment and updates.
- **Regulatory driver**: None explicit. The archive self-hosts primarily because commercial SaaS
  options are too expensive for their budget and because they need to customize the software for
  their specific cataloging standards.
- **Key characteristic**: Limited technical staff (one person) creates a single point of failure.
  Support needs are likely to be broad (installation through ongoing maintenance) but budget is
  constrained.

#### SH-03 — DevOps Engineer, Government-Funded Research Institute (East Africa)

- **Organization**: A research institute funded by a national government research council, focused
  on public health and agricultural research.
- **Role**: Part of an 8-person technical team responsible for deploying and maintaining research
  data platforms, collaboration tools, and analysis applications.
- **Self-hosting experience**: Extensive. The institute self-hosts 8+ applications, including data
  collection platforms, statistical analysis tools, and document management systems.
- **Infrastructure**: Hybrid — on-premises servers for sensitive data, cloud instances (regional
  data center) for public-facing applications. Docker containers for application deployment.
  PostgreSQL databases with automated backups.
- **Regulatory driver**: Grant compliance requires that research data be stored on infrastructure
  controlled by the institute or within the country's jurisdiction. Some grants specify open-source
  software only.
- **Key characteristic**: Has moderate-to-high technical capacity but faces resource constraints
  (staff time is split across many projects). Support needs are likely to focus on installation
  guidance and knowledge transfer rather than ongoing maintenance.

#### SH-04 — Technology Coordinator, Small Non-Profit (South America)

- **Organization**: A small non-profit organization focused on educational technology and community
  learning programs.
- **Role**: Sole technical staff member responsible for all IT operations, including website hosting,
  email, office productivity tools, and a small learning management system.
- **Self-hosting experience**: Limited. The organization self-hosts 1–2 applications (a learning
  management system and a community forum). Everything else is SaaS.
- **Infrastructure**: A single virtual private server (VPS) from a commercial provider. Linux
  with manually installed applications. SQLite for the forum; MySQL for the LMS. No container
  technology.
- **Regulatory driver**: None. The organization self-hosts the LMS because the SaaS alternatives
  were too expensive for their annual budget.
- **Key characteristic**: Very limited technical capacity (one person with broad but shallow
  expertise). Support needs are likely to be high-touch (installation, configuration, ongoing
  maintenance, troubleshooting). Budget is extremely constrained.

#### SH-05 — Digital Infrastructure Manager, University Library (North America)

- **Organization**: A large university library with a digital scholarship program and extensive
  special collections.
- **Role**: Manages the library's digital infrastructure, including the institutional repository,
  digital asset management system, discovery layer, and several research support applications.
  Oversees a team of 12 technical staff.
- **Self-hosting experience**: Extensive. The library self-hosts 15+ applications, primarily
  open-source library and digital scholarship tools. All are hosted in the university's data center
  with managed Kubernetes and automated deployment pipelines.
- **Infrastructure**: University data center with redundant power, networking, and storage.
  Kubernetes cluster for application deployment. PostgreSQL, Solr, and Redis managed in-house.
  CI/CD pipelines for automated updates.
- **Regulatory driver**: Accessibility compliance (WCAG 2.1 AA) requires that public-facing
  applications meet specific standards. The library self-hosts to maintain control over
  accessibility features and to customize the interface for diverse user needs.
- **Key characteristic**: Has high technical capacity and sophisticated infrastructure. Support
  needs are likely to be minimal for installation but may exist for specific application expertise
  or integration guidance.

#### SH-06 — CTO, Mid-Size Research Organization (Southeast Asia)

- **Organization**: A mid-size research organization focused on social science and policy research,
  with offices in multiple cities.
- **Role**: Chief technology officer responsible for all technology strategy, infrastructure, and
  technical staffing. Manages a team of 6 technical staff across development, operations, and
  support functions.
- **Self-hosting experience**: Moderate. The organization self-hosts 4–6 applications, including
  a research data management platform, an internal collaboration suite, and a public-facing
  publication portal.
- **Infrastructure**: Cloud-hosted (major provider, regional data center) with some on-premises
  components for sensitive research data. Docker containers for application deployment. PostgreSQL
  databases with managed backups.
- **Regulatory driver**: Data localization requirements mandate that certain categories of research
  data remain within national borders. The organization self-hosts to comply with these requirements
  while maintaining flexibility for non-sensitive applications.
- **Key characteristic**: Has moderate technical capacity and a clear regulatory motivation for
  self-hosting. Support needs are likely to focus on compliance-specific configuration and
  ongoing maintenance guidance.

#### SH-07 — Research Computing Director, National Laboratory (South Asia)

- **Organization**: A national laboratory with classified and unclassified research programs.
- **Role**: Director of the research computing division, responsible for all computational
  infrastructure, high-performance computing, and secure data systems. Manages a team of 20+
  technical staff.
- **Self-hosting experience**: Extensive. The laboratory self-hosts 20+ applications, including
  scientific computing platforms, data analysis tools, secure communication systems, and document
  management. All applications run on air-gapped or tightly controlled on-premises infrastructure.
- **Infrastructure**: Fully on-premises with air-gapped networks for classified work. Custom
  deployment pipelines with extensive security review. PostgreSQL and other databases with
  encrypted backups. Hardware security modules for key management.
- **Regulatory driver**: National security classification requires that all software and data
  remain on controlled infrastructure with no external network access. The laboratory self-hosts
  everything by necessity.
- **Key characteristic**: Has very high technical capacity but operates under extreme constraints
  (air-gapped networks, security clearance requirements). Support needs are likely to be highly
  specific (security review, offline deployment procedures) and may be difficult to meet through
  conventional support channels.

---

## 8. Synthetic Interview Results

> **Reminder**: All results below are fictional. They are constructed to demonstrate the range of
> themes the protocol is designed to capture. They do not represent actual interview data.

### 8.1 Results Summary Table

| Code | Self-hosting motivation | Internal capacity | Support interest | Budget authority | Procurement path | Non-fit? |
|---|---|---|---|---|---|---|
| SH-01 | Data sovereignty (GDPR) | High (25+ staff) | Selective — wants installation guidance and compliance review support only | Yes — IT director has budget authority | Established vendor process | No |
| SH-02 | Cost (SaaS too expensive) | Low (1 staff) | High — wants broad support from installation through maintenance | Partial — must request from archive director | No established process for technical support procurement | No |
| SH-03 | Grant compliance | Moderate (8 staff) | Moderate — wants installation guidance and knowledge transfer | Yes — grant budgets include technical assistance lines | Grant procurement process (slow but viable) | No |
| SH-04 | Cost (SaaS too expensive) | Very low (1 staff) | High — wants comprehensive support | No — no budget line for technical support; would need to request | No procurement path for support services | No |
| SH-05 | Accessibility compliance | Very high (12 staff) | Low — prefers to handle everything internally; might want specific integration guidance | Yes — library IT has budget authority | Established vendor process | **Yes** |
| SH-06 | Data localization | Moderate (6 staff) | Moderate — wants compliance configuration support and ongoing maintenance guidance | Yes — CTO has budget authority | Standard vendor procurement | No |
| SH-07 | National security classification | Very high (20+ staff) | Low — wants security review and offline deployment procedures only; no ongoing maintenance support | Yes — laboratory has dedicated infrastructure budget | Government procurement (complex but funded) | **Yes** |

### 8.2 Detailed Synthetic Findings by Participant

#### SH-01 — Selective Support for Compliance-Driven Self-Hosting

**Self-hosting motivation**: GDPR compliance requires that research data involving EU citizens
remains within EU jurisdiction. The university research computing center self-hosts all applications
that handle personal data.

**Internal capacity**: High. The center employs 25+ technical staff with expertise in Linux systems
administration, Kubernetes orchestration, PostgreSQL database management, and network security.
The team can handle most installation, configuration, and maintenance tasks independently.

**Support interest**: Selective. SH-01 expressed interest in paid support for two specific areas:
1. **Installation guidance** for new applications — particularly when the application has complex
   dependencies or non-obvious configuration requirements. Estimated need: 20–40 hours per new
   application deployment.
2. **Compliance review** — external expertise to verify that the application's data handling,
   access controls, and audit logging meet GDPR requirements. Estimated need: 10–20 hours per
   compliance review.

SH-01 explicitly stated no interest in ongoing maintenance support ("our team handles that") or
emergency response ("we have our own on-call rotation").

**Budget authority**: Yes. The IT director controls a budget for technical services and has
previously contracted external consultants for specialized infrastructure projects.

**Procurement path**: Established. The university has a vendor management office that processes
technical service contracts. Typical procurement timeline: 2–4 months for services under the
threshold requiring competitive bidding.

**Key quote (anonymized, consented)**: "We can run the infrastructure ourselves. What we can't
always do is quickly understand a new application's specific requirements. If someone who already
knows the system could spend a few days with our team during installation, that would save us
weeks of trial and error."

**Theme**: High-capacity organizations want targeted, time-bounded support for specific gaps
(installation, compliance) — not broad ongoing maintenance contracts.

#### SH-02 — Broad Support Need with Constrained Budget

**Self-hosting motivation**: Cost. Commercial SaaS alternatives for the archive's cataloging and
digital asset management needs were priced at 5–10x the archive's annual software budget. Self-hosting
open-source tools was the only financially viable option.

**Internal capacity**: Low. SH-02 is the sole technical staff member for the entire archive. They
manage servers, databases, applications, backups, and user support. Every hour spent on maintenance
is an hour not spent on other duties.

**Support interest**: High. SH-02 expressed interest in comprehensive paid support covering:
1. **Installation and initial configuration** — "I need someone to walk me through the setup so I
   don't break things." Estimated need: 40–80 hours.
2. **Ongoing maintenance guidance** — "When there's an update or a security patch, I need to know
   what to do and in what order." Estimated need: 4–8 hours per month ongoing.
3. **Troubleshooting** — "When something breaks and I can't figure it out, I need someone to call."
   Estimated need: ad hoc, 2–4 hours per incident.

SH-02 ranked installation guidance as the highest priority, followed by troubleshooting, followed
by ongoing maintenance.

**Budget authority**: Partial. SH-02 does not control a budget for technical support services.
Any expenditure must be approved by the archive director, who controls a general operations budget
but has never purchased external technical support.

**Procurement path**: No established process. The archive has purchased software licenses before
but has never procured a technical support service. SH-02 expressed uncertainty about how such a
service would be classified (consulting? software maintenance? IT services?) and which approval
chain would apply.

**Key quote (anonymized, consented)**: "I'm the only person here who understands the server. If
something goes wrong during an update, there's no one else to ask. I'd pay for the peace of mind
alone, but I don't even know how to get that approved."

**Theme**: Low-capacity organizations have the highest support needs but also face the greatest
procurement and budget barriers.

#### SH-03 — Knowledge Transfer Focus for Grant-Compliant Deployment

**Self-hosting motivation**: Grant compliance. Several research grants require that data collection
and analysis platforms be hosted on infrastructure controlled by the institute, and some grants
specify open-source software only.

**Internal capacity**: Moderate. The 8-person technical team has sufficient skills to operate and
maintain self-hosted applications but lacks deep expertise in every technology stack they encounter.
Team members are split across multiple projects, so dedicated time for learning a new application
is limited.

**Support interest**: Moderate. SH-03 expressed interest in paid support focused on:
1. **Installation guidance and knowledge transfer** — "We want to learn how to run it ourselves,
   but we need someone to show us the right way from the start." Estimated need: 30–50 hours of
   guided installation.
2. **Architecture review** — "Before we deploy, we'd want someone to look at our infrastructure
   and tell us if we're missing anything." Estimated need: 5–10 hours.

SH-03 explicitly stated no interest in ongoing maintenance contracts ("our team handles that once
they know how") but expressed openness to purchasing additional knowledge transfer sessions if new
staff joined the team.

**Budget authority**: Yes. Grant budgets at this institute typically include a "technical assistance"
line item that can cover external consulting during the deployment phase.

**Procurement path**: Viable but slow. Grant procurement requires documentation, justification,
and approval from the funding body's procurement office. Typical timeline: 3–6 months from request
to contract execution. However, the path exists and has been used for similar services.

**Key quote (anonymized, consented)**: "We don't need someone to run it for us. We need someone
to teach us how to run it well. Once our team understands the system, we're fine."

**Theme**: Moderate-capacity organizations want knowledge transfer, not dependency. They will pay
for expertise that makes them self-sufficient.

#### SH-04 — Comprehensive Need with No Procurement Path

**Self-hosting motivation**: Cost. The SaaS version of the learning management system cost more
than the organization's entire annual technology budget. Self-hosting the open-source version was
the only option.

**Internal capacity**: Very low. SH-04 is the sole technical person for a 15-person non-profit.
They manage email, the website, the LMS, the community forum, office productivity tools, and
basic user support. Their technical expertise is broad but shallow — they can follow instructions
but lack deep systems administration experience.

**Support interest**: High. SH-04 expressed interest in every category of support:
1. **Installation and configuration** — "I've never set up something this complex before. I'd need
   step-by-step guidance." Estimated need: 60–120 hours.
2. **Ongoing maintenance** — "Updates, backups, security patches — I need someone to tell me what
   to do and when." Estimated need: 6–10 hours per month.
3. **Troubleshooting** — "When something breaks — and it will — I need someone I can reach out to."
   Estimated need: ad hoc, potentially 4–8 hours per incident.
4. **Training** — "I'd like to understand the system better so I'm not completely dependent on
   external help." Estimated need: 10–20 hours of structured training.

**Budget authority**: No. SH-04 does not control any budget for technical services. The organization's
executive director controls a general operations budget that covers rent, utilities, and program
costs. Technical support has never been a budgeted expense.

**Procurement path**: None. The organization has never purchased external technical support. SH-04
expressed uncertainty about whether such a service could be funded through their existing grant
relationships or whether it would require a separate fundraising effort.

**Key quote (anonymized, consented)**: "I know we need help. I just don't know where the money
would come from. We're a small non-profit — every dollar is already spoken for."

**Theme**: The organization with the highest support need has the least capacity to procure it.
This is a structural non-fit, not a preference.

#### SH-05 — Minimal Support Need (Non-Fit Case)

**Self-hosting motivation**: Accessibility compliance. The university library self-hosts all
public-facing applications to maintain full control over the user interface and ensure WCAG 2.1 AA
compliance. SaaS options were evaluated but rejected because they did not provide sufficient
customization of accessibility features.

**Internal capacity**: Very high. The 12-person technical team includes experienced DevOps engineers,
database administrators, and front-end developers. The team manages a Kubernetes cluster with
automated CI/CD pipelines and handles all aspects of application deployment, maintenance, and
monitoring internally.

**Support interest**: Low. SH-05 expressed minimal interest in external support:
- "We've been self-hosting for over a decade. We know how to deploy and maintain applications."
- "The only scenario where we'd want external help is if we encountered a very specific integration
  challenge — for example, connecting a new application to our existing discovery layer. But even
  then, we'd probably figure it out ourselves."
- "We might read documentation or attend a webinar if the application offered one, but we wouldn't
  pay for one-on-one support."

**Budget authority**: Yes. The library IT department has a budget for technical services, but it
is rarely used for external support because the team is self-sufficient.

**Procurement path**: Established. The university has a standard vendor procurement process, but
the library has had little need to use it for technical support services.

**Key quote (anonymized, consented)**: "We have the people and the infrastructure. What we'd need
is good documentation and maybe a community forum where we could ask questions. We wouldn't pay
for a support contract."

**Theme**: High-capacity organizations with mature self-hosting practices do not need paid support.
They need good documentation and active communities. This is a genuine non-fit for a paid support
offering.

#### SH-06 — Compliance Configuration and Ongoing Guidance

**Self-hosting motivation**: Data localization. National regulations require that certain categories
of research data remain within the country's borders. The organization self-hosts to comply while
maintaining flexibility for non-sensitive applications that can use regional cloud services.

**Internal capacity**: Moderate. The 6-person technical team can manage day-to-day operations but
lacks deep expertise in every technology they deploy. Team members are frequently reassigned between
projects, so continuity on any single application is limited.

**Support interest**: Moderate. SH-06 expressed interest in paid support for:
1. **Compliance-specific configuration** — "We need to make sure the application handles data in
   a way that meets localization requirements. Someone who understands both the application and
   the regulation would be invaluable." Estimated need: 15–30 hours per deployment.
2. **Ongoing maintenance guidance** — "When there's a major update, we'd want someone to review
   our configuration and make sure nothing breaks compliance." Estimated need: 5–10 hours per
   major update.
3. **Emergency consultation** — "If something goes wrong and we suspect it's a compliance issue,
   we'd want someone to call immediately." Estimated need: ad hoc, but high priority.

**Budget authority**: Yes. The CTO controls a technology budget that includes external consulting
for specialized needs.

**Procurement path**: Standard. The organization has a vendor management process and has previously
procured technical consulting services. Typical timeline: 1–3 months.

**Key quote (anonymized, consented)**: "The technology isn't the hard part. The hard part is
making sure the technology complies with regulations we didn't write and don't fully understand.
If someone could bridge that gap, we'd pay for it."

**Theme**: Organizations with regulatory motivations want compliance expertise, not just technical
expertise. The support value proposition is regulatory confidence, not infrastructure management.

#### SH-07 — Security Review Only (Non-Fit Case)

**Self-hosting motivation**: National security classification. The laboratory operates air-gapped
networks for classified research. All software must undergo security review before deployment, and
no external network access is permitted for classified systems.

**Internal capacity**: Very high. The 20+ person technical team includes security engineers, systems
administrators, database specialists, and deployment engineers. The team has extensive experience
deploying and maintaining applications in air-gapped, security-controlled environments.

**Support interest**: Low and highly specific. SH-07 expressed interest in only one category of
external support:
1. **Security review** — "Before we deploy any application, we need an independent security review.
   If the application vendor could provide a security assessment package — source code review,
   dependency audit, configuration hardening guide — that would be useful." Estimated need:
   20–40 hours per application, one-time.

SH-07 explicitly stated no interest in:
- Installation guidance ("our team can follow any technical documentation")
- Ongoing maintenance ("we maintain everything ourselves by necessity")
- Emergency support ("we can't give external parties access to our air-gapped systems")
- Training ("our team is already highly trained")

**Budget authority**: Yes. The laboratory has a dedicated infrastructure security budget that
includes funds for independent security assessments.

**Procurement path**: Complex but funded. Government procurement for security services requires
extensive documentation, clearance verification, and approval chains. Typical timeline: 6–12 months.
However, the budget exists and the path, while slow, is established.

**Key quote (anonymized, consented)**: "We can't let anyone into our network. What we need is a
security package we can review ourselves — source code audit, dependency analysis, hardening
guidelines. After that, we're on our own."

**Theme**: Security-constrained organizations need artifacts (security reviews, hardening guides),
not ongoing relationships. This is a non-fit for traditional support models but may represent a
different kind of service opportunity.

### 8.3 Aggregate Results

| Metric | Value |
|---|---|
| Total synthetic participants | 7 |
| Self-hosting motivation: regulatory/compliance | 4 (SH-01, SH-03, SH-06, SH-07) |
| Self-hosting motivation: cost | 2 (SH-02, SH-04) |
| Self-hosting motivation: customization/control | 1 (SH-05) |
| Internal capacity: high or very high | 3 (SH-01, SH-05, SH-07) |
| Internal capacity: moderate | 2 (SH-03, SH-06) |
| Internal capacity: low or very low | 2 (SH-02, SH-04) |
| Expressed interest in paid support | 5 (SH-01, SH-02, SH-03, SH-04, SH-06) |
| Expressed no interest in paid support (non-fit) | 2 (SH-05, SH-07) |
| Interest in installation guidance specifically | 5 (SH-01, SH-02, SH-03, SH-04, SH-06) |
| Interest in ongoing maintenance support | 3 (SH-02, SH-04, SH-06) |
| Interest in knowledge transfer / training | 2 (SH-03, SH-04) |
| Interest in compliance/security review | 3 (SH-01, SH-06, SH-07) |
| Interest in emergency troubleshooting | 3 (SH-02, SH-04, SH-06) |
| Confirmed budget authority | 5 (SH-01, SH-03, SH-05, SH-06, SH-07) |
| Partial or no budget authority | 2 (SH-02 partial, SH-04 none) |
| Established procurement path | 4 (SH-01, SH-05, SH-06, SH-07) |
| Slow but viable procurement path | 1 (SH-03) |
| No procurement path | 2 (SH-02, SH-04) |
| Non-fit cases | 2 (SH-05, SH-07) |

---

## 9. Theme Analysis

### 9.1 Repeated Problem Themes

Themes are coded from the synthetic interview results using a simple frequency count. A theme
is considered "repeated" if it appears in at least three independent synthetic profiles.

| Theme | Frequency | Profiles | Strength |
|---|---|---|---|
| **T1: Installation guidance is the most universally desired support category** | 5 | SH-01, SH-02, SH-03, SH-04, SH-06 | **Strong** — meets threshold of >=3 |
| **T2: Regulatory/compliance motivations drive self-hosting preference** | 4 | SH-01, SH-03, SH-06, SH-07 | **Strong** |
| **T3: Ongoing maintenance support is desired primarily by low-capacity organizations** | 3 | SH-02, SH-04, SH-06 | **Strong** — but note SH-06 is moderate capacity |
| **T4: Budget authority does not guarantee procurement path** | 3 | SH-02 (partial authority, no path), SH-04 (no authority, no path), SH-03 (authority, slow path) | **Moderate** — structural barrier |
| **T5: High-capacity organizations prefer knowledge transfer over dependency** | 3 | SH-01, SH-03, SH-05 | **Moderate** |
| **T6: Compliance/security review is a distinct support category from technical maintenance** | 3 | SH-01, SH-06, SH-07 | **Moderate** |
| **T7: Support need is inversely correlated with internal capacity** | 4 | SH-02, SH-04 (high need, low capacity); SH-05, SH-07 (low need, high capacity) | **Strong** — key structural finding |
| **T8: No synthetic participant accepted an SLA or availability promise** | 7 | All | **Universal** — critical boundary |

### 9.2 Interest vs. Budget Authority vs. Procurement vs. Support Expectations

The acceptance criterion requires that findings distinguish four dimensions. The following matrix
maps each synthetic profile across all four:

| Code | Interest (in paid support) | Budget authority | Procurement path | Support expectation |
|---|---|---|---|---|
| SH-01 | Yes — selective | Yes | Established | Installation guidance + compliance review (20–40 hrs per deployment) |
| SH-02 | Yes — comprehensive | Partial | None | Installation + maintenance + troubleshooting (40–80 hrs initial, 4–8 hrs/month ongoing) |
| SH-03 | Yes — knowledge transfer | Yes | Slow but viable | Guided installation + architecture review (30–50 hrs per deployment) |
| SH-04 | Yes — comprehensive | No | None | Full-spectrum support (60–120 hrs initial, 6–10 hrs/month ongoing) |
| SH-05 | No | Yes | Established | Documentation and community only (0 hrs paid support) |
| SH-06 | Yes — compliance focus | Yes | Established | Compliance configuration + maintenance guidance (15–30 hrs per deployment, 5–10 hrs per update) |
| SH-07 | Minimal — security review only | Yes | Complex but funded | Security assessment package (20–40 hrs one-time) |

**Key finding**: Interest and budget authority do not always align. SH-02 and SH-04 have high
interest but weak or absent budget authority and procurement paths. SH-05 has budget authority
and a procurement path but no interest. This mismatch is a critical constraint for any support
offering.

### 9.3 Support Category Prioritization

Across all profiles that expressed interest (SH-01, SH-02, SH-03, SH-04, SH-06), support
categories were ranked by frequency of mention:

| Rank | Support category | Profiles mentioning | Priority level |
|---|---|---|---|
| 1 | Installation guidance / initial configuration | SH-01, SH-02, SH-03, SH-04, SH-06 | Highest — mentioned by all interested profiles |
| 2 | Compliance / security review | SH-01, SH-06, SH-07 | High — mentioned by 3 of 7 (including one non-fit) |
| 3 | Ongoing maintenance guidance | SH-02, SH-04, SH-06 | Moderate — mentioned by 3 of 7, all low-to-moderate capacity |
| 4 | Emergency troubleshooting | SH-02, SH-04, SH-06 | Moderate — mentioned by same 3 as ongoing maintenance |
| 5 | Knowledge transfer / training | SH-03, SH-04 | Lower — mentioned by 2 of 7 |
| 6 | Security assessment artifacts (one-time) | SH-07 | Specific — mentioned by 1 of 7 (non-fit for traditional support) |

### 9.4 Theme Interactions

The themes do not operate independently. The following interactions are noted:

- **T2 + T6**: Regulatory motivations (T2) create demand for compliance-specific support (T6),
  which is a fundamentally different service from general technical maintenance. Organizations
  driven by compliance need regulatory expertise, not just infrastructure expertise.
- **T4 + T7**: The inverse relationship between support need and internal capacity (T7) is
  compounded by procurement barriers (T4) — the organizations that need the most support are
  also the least able to procure it.
- **T5 + T1**: Even high-capacity organizations that prefer knowledge transfer (T5) still want
  installation guidance (T1) — but they want it as a one-time knowledge transfer, not as an
  ongoing dependency.
- **T8 (universal)**: The absence of SLA acceptance across all profiles is a cross-cutting
  constraint that applies regardless of interest, capacity, or motivation. No synthetic participant
  wanted to contract for guaranteed uptime; all wanted to contract for expertise on demand.

### 9.5 Theme Strength Assessment

| Criterion | Threshold | Result |
|---|---|---|
| Acceptance criterion: findings distinguish interest, budget authority, procurement, and support expectations | All four dimensions must be present | **Met** — all four dimensions are distinguished in §9.2 |
| Repeated support category | >=3 profiles | **Met** — installation guidance appears in 5 profiles |
| Non-fit cases present | >=1 | **Met** — SH-05 and SH-07 are genuine non-fit cases |
| SLA/availability boundary | No participant accepts SLA | **Met** — universal across all 7 profiles |

---

## 10. Support Burden Estimation

### 10.1 Estimated Support Hours by Category

The following table estimates the support burden that each synthetic profile would impose if they
were a real self-hosted organization. Estimates are based on stated needs in synthetic interviews.

| Code | Installation guidance (one-time) | Compliance/security review (one-time) | Ongoing maintenance (monthly) | Emergency troubleshooting (ad hoc) | Training/knowledge transfer (one-time) | Total first-year estimate |
|---|---|---|---|---|---|---|
| SH-01 | 20–40 hrs | 10–20 hrs | 0 hrs | 0 hrs | 0 hrs | 30–60 hrs |
| SH-02 | 40–80 hrs | 0 hrs | 4–8 hrs | 2–4 hrs per incident (est. 2 incidents/year = 4–8 hrs) | 0 hrs | 52–96 hrs |
| SH-03 | 30–50 hrs | 5–10 hrs | 0 hrs | 0 hrs | 10–20 hrs | 45–80 hrs |
| SH-04 | 60–120 hrs | 0 hrs | 6–10 hrs | 4–8 hrs per incident (est. 3 incidents/year = 12–24 hrs) | 10–20 hrs | 94–184 hrs |
| SH-05 | 0 hrs | 0 hrs | 0 hrs | 0 hrs | 0 hrs | 0 hrs |
| SH-06 | 15–30 hrs | 10–20 hrs | 2–4 hrs | 1–2 hrs per incident (est. 1 incident/year = 1–2 hrs) | 0 hrs | 28–56 hrs |
| SH-07 | 0 hrs | 20–40 hrs | 0 hrs | 0 hrs | 0 hrs | 20–40 hrs |

### 10.2 Aggregate Support Burden

| Metric | Low estimate | High estimate |
|---|---|---|
| Total first-year support hours (all 7 profiles) | 269 hrs | 516 hrs |
| Total first-year support hours (excluding non-fit: SH-05, SH-07) | 249 hrs | 476 hrs |
| Total first-year support hours (excluding non-fit AND no-procurement-path: SH-04) | 155 hrs | 352 hrs |
| Average per interested profile (5 profiles: SH-01, SH-02, SH-03, SH-04, SH-06) | 50–103 hrs | 95–184 hrs |
| Ongoing monthly burden (after first year, all interested profiles) | 12–22 hrs/month | 16–30 hrs/month |

### 10.3 Support Burden by Category (Aggregate)

| Support category | Total hours (first year, all profiles) | % of total burden |
|---|---|---|
| Installation guidance | 165–320 hrs | 49–62% |
| Compliance/security review | 45–90 hrs | 13–17% |
| Ongoing maintenance | 72–132 hrs (annualized) | 14–26% |
| Emergency troubleshooting | 28–58 hrs (annualized) | 5–11% |
| Training/knowledge transfer | 20–40 hrs | 4–8% |

**Key finding**: Installation guidance dominates the first-year support burden (49–62% of total
hours). This is a one-time cost per deployment, suggesting that the support burden decreases
significantly after the first year as organizations become self-sufficient.

### 10.4 Support Burden Trajectory

| Phase | Duration | Estimated monthly burden | Notes |
|---|---|---|---|
| Deployment | Months 1–3 | 40–80 hrs/month (across all profiles) | Heavy installation guidance and compliance review |
| Stabilization | Months 4–6 | 15–30 hrs/month | Ongoing maintenance begins; emergencies possible |
| Steady state | Months 7–12 | 12–22 hrs/month | Most organizations are self-sufficient; ad hoc support only |
| Year 2+ | Ongoing | 8–15 hrs/month | Reduced to emergency consultation and major update assistance |

### 10.5 Burden Sensitivity

The estimates above are sensitive to several assumptions:

| Assumption | Impact if wrong | Confidence |
|---|---|---|
| Installation takes 20–120 hours depending on complexity | Could be higher for very complex deployments or lower for simpler ones | Low — based on synthetic estimates only |
| Emergency incidents occur 1–3 times per year | Could be more frequent for less stable applications or less experienced teams | Low — no real incident data |
| Ongoing maintenance decreases after stabilization | Some organizations may never reach self-sufficiency | Medium — based on stated preferences |
| Compliance review is a one-time cost per deployment | Regulatory changes may require periodic re-review | Medium — depends on regulatory environment |

---

## 11. Internal Capacity Comparison

### 11.1 Current MoonWitness XV Technical Team Capacity

MoonWitness XV is a project with limited staffing. The following assessment estimates the team's
capacity to provide support based on observable project structure.

| Capacity dimension | Current state | Support implication |
|---|---|---|
| Development team size | Small (estimated 1–3 active developers) | Limited availability for support activities |
| Operations/DevOps staff | Minimal (project runs on managed infrastructure) | No dedicated operations team for external support |
| Documentation | Present but evolving (README, agents.md, ADRs) | Can serve as self-service support resource |
| Community | Limited (no public forum or user community observed) | No community-based support channel exists |
| Time zone coverage | Single time zone (estimated) | Cannot provide 24/7 emergency response |

### 11.2 Capacity vs. Estimated Burden

| Scenario | Monthly support burden | Team capacity available | Feasible? |
|---|---|---|---|
| 1 interested organization (steady state) | 8–15 hrs/month | ~10% of one FTE developer | Feasible |
| 2 interested organizations (steady state) | 16–30 hrs/month | ~20–38% of one FTE developer | Tight but feasible |
| 3 interested organizations (steady state) | 24–45 hrs/month | ~30–56% of one FTE developer | Strained |
| 5 interested organizations (steady state) | 40–75 hrs/month | ~50–94% of one FTE developer | Not feasible without dedicated support staff |
| 7 interested organizations (all profiles, steady state) | 56–105 hrs/month | >1 FTE dedicated | Not feasible with current team |
| 5 interested organizations (deployment phase) | 200–400 hrs/month | Multiple FTEs | Not feasible without hiring |

### 11.3 Capacity Gap Analysis

| Gap | Description | Severity | Mitigation |
|---|---|---|---|
| **No dedicated support staff** | Current team has no role designated for external support | High | Would require hiring or role reallocation |
| **No support infrastructure** | No ticketing system, knowledge base, or support communication channel | Medium | Can be built, but represents additional investment |
| **No support documentation** | Installation guides, troubleshooting docs, and compliance guides do not exist in finalized form | Medium | Documentation effort would be a prerequisite |
| **Single time zone** | Cannot provide real-time support across global time zones | Low–Medium | Async support (email, ticket-based) may be sufficient |
| **No community channel** | No forum, mailing list, or chat for peer-to-peer support | Medium | Community building is a longer-term investment |

### 11.4 Maximum Sustainable Support Load

Based on the capacity analysis, the maximum number of self-hosted organizations the current team
could support without hiring dedicated staff is estimated at:

| Support model | Maximum organizations | Assumptions |
|---|---|---|
| **Documentation only** (no paid support) | Unlimited | Organizations self-serve from documentation; team answers occasional questions |
| **Community support** (forum/chat) | 5–10 | Peer-to-peer support reduces burden on team; team monitors but does not provide 1:1 support |
| **Light paid support** (installation guidance only, 20–40 hrs per deployment) | 2–3 per year | Each deployment consumes 20–40 hrs; team can absorb this alongside development if infrequent |
| **Moderate paid support** (installation + ongoing maintenance) | 1–2 total | Ongoing maintenance (4–8 hrs/month per org) compounds; more than 2 organizations exceeds available capacity |
| **Full paid support** (installation + maintenance + emergency + training) | Not feasible | Would require dedicated support staff |

### 11.5 Capacity Decision

**The current team cannot sustainably support more than 2–3 self-hosted organizations with paid
installation guidance, or 1–2 with ongoing maintenance support.** Beyond this threshold, dedicated
support staff would need to be hired, and the cost of that staff would need to be covered by
support revenue or project funding.

This finding is a critical constraint for any downstream decision about offering support services.

---

## 12. Non-Fit Cases

### 12.1 Definition

A non-fit case is a synthetic profile or interview result where paid self-hosted support is
unnecessary, inappropriate, or structurally impossible. Non-fit cases are essential for defining
the boundaries of a support offering and for preventing scope creep.

### 12.2 Identified Non-Fit Cases

#### NF-01: SH-05 — High-Capacity, Self-Sufficient Organization

- **Profile**: Digital infrastructure manager at a large university library (North America).
- **Non-fit reason**: The organization has very high internal technical capacity (12 staff,
  Kubernetes, CI/CD, extensive self-hosting experience). They explicitly stated no interest in
  paid support. Their need is documentation and community, not consulting.
- **Implication**: A paid support offering would not serve this segment. Investing in documentation
  and community infrastructure would.
- **Strength of non-fit**: High — SH-05's self-sufficiency is clear and unambiguous.

#### NF-02: SH-07 — Security-Constrained, Air-Gapped Organization

- **Profile**: Research computing director at a national laboratory (South Asia).
- **Non-fit reason**: The organization operates air-gapped networks for national security
  classification. External support personnel cannot access their infrastructure. Their need is
  a one-time security assessment artifact, not an ongoing support relationship.
- **Implication**: Traditional support models (remote access, real-time troubleshooting) are
  structurally incompatible with this segment's security requirements.
- **Strength of non-fit**: High — the air-gap constraint is absolute and non-negotiable.

#### NF-03: SH-04 — Structurally Unfundable Organization

- **Profile**: Technology coordinator at a small non-profit (South America).
- **Non-fit reason**: While SH-04 has high support needs and expressed strong interest, they have
  no budget authority and no procurement path. Paying for support is structurally impossible within
- their current funding model.
- **Implication**: High interest does not equal viable demand. A support offering must target
  organizations that can actually procure it.
- **Strength of non-fit**: Moderate — SH-04's need is genuine, but their inability to pay is a
  structural barrier, not a preference. This organization might become viable if grant funding
  for technical support became available.

#### NF-04: Hypothetical — Organization Wanting Managed Hosting Only

- **Profile**: Not represented in the synthetic sample, but worth noting as a potential non-fit
  pattern.
- **Non-fit reason**: An organization might want a fully managed hosting service (SaaS) rather
  than self-hosting with support. This is a fundamentally different service model.
- **Implication**: Organizations that want managed hosting are non-fit for a self-hosted support
  offering. They may be fit for a different service (which is explicitly out of scope for M48-02).
- **Strength of non-fit**: N/A — this pattern is not present in the synthetic sample but should
  be watched for in real interviews.

### 12.3 Non-Fit Summary

| Case | Type | Non-fit reason | Impact on support offering |
|---|---|---|---|
| NF-01 (SH-05) | Self-sufficient | Has capacity, needs documentation not consulting | Documentation investment > support investment |
| NF-02 (SH-07) | Security-constrained | Cannot grant external access | Artifact-based service (security review package) only |
| NF-03 (SH-04) | Structurally unfundable | No budget or procurement path | Cannot be served by a paid offering regardless of need |
| NF-04 | Managed hosting preference | Wants SaaS, not self-hosted support | Out of scope for M48-02 |

**Overall assessment**: Three genuine non-fit cases are present in the synthetic sample (NF-01,
NF-02, NF-03), representing three distinct non-fit reasons. One hypothetical non-fit pattern
(NF-04) is noted for future investigation. The non-fit rate is 2 of 7 profiles (29%) for
genuine non-fit, plus 1 structurally unfundable case that represents demand but not viable demand.

---

## 13. Sample and Selection Bias Documentation

### 13.1 Sample Size

The synthetic sample consists of 7 profiles. The protocol target for real-data collection is
5–8 participants. The synthetic sample is within this range.

**Sample size limitation**: With 7 profiles, the sample is too small to support statistical
generalization. Findings are indicative, not conclusive. The acceptance criterion requires
distinguishing four dimensions (interest, budget authority, procurement, support expectations) —
a qualitative bar that the synthetic sample meets by construction.

### 13.2 Selection Bias Sources

| Bias type | Description | Impact | Mitigation |
|---|---|---|---|
| **Availability bias** | Synthetic profiles were constructed from the researcher's mental model of technically responsible organizations, not from a systematic survey of the population | Profiles may over-represent familiar archetypes (university IT, research institute) and under-represent unexpected ones (corporate self-hosters, government agencies in non-democratic countries) | Documented in §18; real recruitment should use diverse channels (§4.4) |
| **Survivorship bias** | Profiles represent organizations that are currently self-hosting successfully, not those that attempted self-hosting and failed | May understate the risks and difficulties of self-hosting; organizations that failed may have different support needs | Acknowledged; future recruitment could include organizations that abandoned self-hosting |
| **Geographic bias** | Synthetic profiles span 7 regions but are constructed by a single researcher with limited geographic expertise | Regional differences in infrastructure maturity, procurement culture, and technical capacity may be inaccurate | Real recruitment should target geographic diversity explicitly |
| **Capacity bias** | The sample includes 3 high-capacity, 2 moderate-capacity, and 2 low-capacity organizations — a distribution that may not reflect the real population | If most potential self-hosters are low-capacity, the aggregate support burden would be higher than estimated | Diversity target (§4.5) includes capacity range; real recruitment should verify distribution |
| **Motivation bias** | Profiles over-represent regulatory/compliance motivations (4 of 7) relative to cost motivations (2 of 7) | If cost is the primary motivation for most real self-hosters, their support needs and budget constraints may differ from the synthetic sample | Real recruitment should explicitly probe motivation distribution |
| **Technical complexity bias** | All profiles self-host complex, multi-service applications. Organizations that self-host simpler applications are not represented | May overstate the support burden; simpler self-hosted applications may require less support | Future research could include organizations with simpler self-hosting needs |
| **Courtesy bias** | Synthetic profiles assume participants are candid; real participants may overstate their technical capacity or understate their need for help to appear competent | May understate actual support needs | Disconfirming/non-fit cases (SH-05, SH-07) provide partial counterweight; see §15 |

### 13.3 Representativeness Assessment

The synthetic sample covers:
- 6 of 7 eligible role types (IT director, sysadmin, DevOps engineer, technology coordinator,
  digital infrastructure manager, CTO, research computing director)
- 7 geographic regions (Northern Europe, Western Europe, East Africa, South America, North America,
  Southeast Asia, South Asia)
- 3 levels of internal capacity (low, moderate, high/very high)
- 3 self-hosting motivations (regulatory/compliance, cost, customization/control)
- 3 organization types (university/research, cultural heritage/non-profit, government/national lab)

Missing from the synthetic sample:
- Corporate/commercial self-hosters (non-research, non-educational)
- Organizations in countries with less mature open-source ecosystems
- Organizations that self-host very simple applications (single service, no database)
- Organizations that have attempted self-hosting and reverted to SaaS

### 13.4 Bias Impact on Acceptance Criteria

The acceptance criterion requires that findings distinguish interest, budget authority, procurement,
and support expectations. The synthetic sample achieves this distinction across all four dimensions
for all seven profiles. However, because all seven profiles are constructed by the same researcher
using the same mental model, the distinctions are by construction rather than by observation. Real
interviews with independently recruited participants are required to validate that these dimensions
are genuinely distinct in practice.

---

## 14. Privacy and Consent Considerations

### 14.1 Data Classification

| Data type | Classification | Handling |
|---|---|---|
| Participant identity (name, organization, contact) | **Confidential** | Stored separately from research data; destroyed after study closure |
| Interview notes (raw) | **Confidential** | Access-restricted; anonymized before analysis |
| Interview recordings (if consented) | **Confidential** | Transcribed, anonymized, raw recording deleted within 30 days |
| Infrastructure details disclosed during interview | **Confidential** | Not recorded; anonymized in notes (e.g., "a major cloud provider" instead of specific vendor) |
| Anonymized themes and findings | **Research output** | Published in audit document; no identifying information |
| Direct quotes (if consented) | **Research output** | Reviewed for inadvertent identifiers before publication |
| Synthetic profiles and data | **Not classified** | Fictional; no real person data |

### 14.2 Consent Requirements

| Requirement | Implementation |
|---|---|
| Informed consent | Consent script read/provided before interview (§5.2) |
| Voluntary participation | Participant can withdraw at any time; data deleted on request |
| Recording consent | Separate consent for audio recording; if declined, notes only |
| Quote consent | Separate consent for use of direct quotes; if declined, paraphrase only |
| Infrastructure disclosure consent | Participant informed that specific infrastructure details will be anonymized |
| Data retention | Raw data deleted within 30 days of interview; anonymized findings retained |
| Data separation | No participant data enters product databases |
| No-service commitment | Consent script explicitly states that no support service is being offered |

### 14.3 Anonymization Standards

| Level | Description | Example |
|---|---|---|
| L1 — Code replacement | Name and organization replaced with code | "SH-01, an IT director at a Northern European university" |
| L2 — Detail generalization | Specific infrastructure details that could identify are generalized | "a major cloud provider" instead of "AWS eu-north-1" |
| L3 — Quote review | Direct quotes checked for unique phrasing that could identify | Remove references to specific projects, colleagues, or local systems |
| L4 — Aggregation | Individual responses aggregated into themes | "5 of 7 profiles expressed interest in installation guidance" |

**Minimum publication level**: L1 for individual findings, L4 for aggregate analysis.

### 14.4 Special Consideration: Infrastructure Sensitivity

Self-hosting interviews may inadvertently reveal sensitive infrastructure details:

- Specific server configurations that could be exploited
- Security practices (or lack thereof) that could create liability
- Compliance gaps that could trigger regulatory action
- Network architecture details that could aid attackers

**Mitigation**: The interviewer explicitly instructs participants NOT to share specific
infrastructure configurations, security settings, or network architecture details. The interview
focuses on organizational processes, staffing, and support expectations — not technical
specifications.

### 14.5 Rollback and Data Deletion

| Trigger | Action | Timeline |
|---|---|---|
| Participant withdraws consent | Delete all raw data for that participant | Within 7 days of withdrawal request |
| Study closure | Delete raw notes, recordings, and anonymization key | Within 30 days of closure |
| Data breach | Notify affected participants; delete compromised data | Within 72 hours of discovery |
| Owner directs stop | Halt all interviews; delete raw data | Immediately |
| Inadvertent infrastructure disclosure | Redact the disclosed detail from notes; confirm with participant | Within 24 hours |

---

## 15. Risk Mitigation

### 15.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Small sample size limits generalizability | High | Medium | Document limitations explicitly; do not claim statistical significance; seek >=5 real participants | Accepted |
| R2 | Support expectations exceed project capacity | Medium | High | Do not offer service during research (§3.5, §6.4); document capacity limits in findings (§11); explicit non-fit identification (§12) | Mitigated |
| R3 | Interviewer inadvertently offers support or implies SLA | Low | Critical | Anti-sales and anti-SLA guard (§6.4); protocol dry run (§6.5); reviewer sign-off; consent script disclaimer | Mitigated |
| R4 | Participant interprets interview as a service commitment | Medium | High | Consent script explicitly states no service is offered (§5.2); interviewer repeats this at closing; follow-up communication clarifies | Mitigated |
| R5 | Interest mistaken for demand — participants express interest but would not actually procure or pay | High | High | Distinguish "I have this need" from "I have budget and procurement path for this need" (§9.2); require past-behavior evidence (§6.2 Module B) | Mitigated |
| R6 | Synthetic profiles do not accurately represent real organizational diversity | Medium | Medium | Use synthetic data for protocol exercise only; real recruitment must use diverse channels (§4.4) | Accepted |
| R7 | Participant data (infrastructure details) leaks into product databases | Low | Critical | Explicit data separation (§14.1); no product database access for research data; infrastructure anonymization (§14.3) | Mitigated |
| R8 | Non-fit cases are under-represented in synthetic sample | Medium | Medium | Actively seek non-fit cases in real recruitment (§12); document non-fit reasons explicitly | Partially mitigated |
| R9 | Support burden estimates are too low because synthetic profiles underestimate complexity | Medium | High | Treat estimates as lower bounds; add 50% contingency for real-world complexity (§10.4) | Accepted |
| R10 | Downstream tasks (ECO-003, ECO-006) conflate their scope with M48-02 findings | Medium | Medium | Anti-overlap statement (§2.4); separate acceptance criteria per task; explicit boundary on SLA/pricing | Mitigated |
| R11 | Real-data collection is delayed or blocked by owner authorization | Medium | Low | Synthetic baseline is complete; real collection can begin when authorized | Accepted |
| R12 | Organizations that need support most (low capacity) cannot afford it | High | High | Document as structural finding (§12, NF-03); do not design support offering around unfundable segments | Accepted |

### 15.2 Support Expectation Management — Detailed Mitigation

The most critical risk in M48-02 is that participants develop expectations for support services
that the project cannot or will not provide. This risk is mitigated through multiple layers:

1. **Consent script disclaimer**: The consent script explicitly states "We will NOT present a
   product, make a sales pitch, offer support services, or ask you to commit to purchasing
   anything."

2. **Anti-SLA guard**: The interviewer is trained to avoid any language that implies an
   availability promise, response time commitment, or service level guarantee.

3. **Closing clarification**: At the end of each interview, the interviewer explicitly states:
   "This research does not constitute an offer of support services. No commitment has been made,
   and no service will be provided as a result of this interview."

4. **Follow-up communication**: After the interview, participants receive a written confirmation
   reiterating that the interview was research-only and that no support service is being offered.

5. **Capacity transparency**: If a participant asks about support availability, the interviewer
   provides a factual statement about current project capacity without making promises.

### 15.3 Small Sample Limitations

With 5–8 real participants (7 synthetic), the sample is too small for:

- Statistical significance testing
- Population-level generalization
- Segmentation analysis (e.g., "organizations in Region X have different support needs than
  organizations in Region Y")

The sample is sufficient for:

- Protocol validation (does the interview guide work?)
- Theme identification (what support categories recur?)
- Non-fit detection (are there organizations that don't need paid support?)
- Capacity comparison (does estimated burden exceed available capacity?)
- Dimension distinction (are interest, budget, procurement, and expectations genuinely separate?)

### 15.4 No Service Promise from Research

A critical principle: **this research does not create any service obligation**. Findings may
inform future decisions about support offerings, but no participant has a claim on MoonWitness XV
support services based on their participation in this study.

---

## 16. Metrics and Success Criteria

### 16.1 Primary Metrics (from TODO specification)

| Metric | Definition | Target | Synthetic result |
|---|---|---|---|
| **Verified budget owner** | Number of profiles where a specific budget holder for support services is identified | >=3 | 5 (SH-01, SH-03, SH-05, SH-06, SH-07) |
| **Support burden** | Estimated total hours of support required across all interested profiles | Documented | 269–516 hrs first year; 12–22 hrs/month steady state |
| **Procurement path** | Number of profiles describing a viable mechanism to procure support services | >=2 | 4 established + 1 slow but viable = 5 |
| **Repeat pain points** | Number of independent profiles describing the same support need | >=3 | 5 (installation guidance) |

### 16.2 Secondary Metrics

| Metric | Definition | Synthetic result |
|---|---|---|
| **Interest/budget alignment** | Number of profiles where interest and budget authority co-occur | 3 (SH-01, SH-03, SH-06) |
| **Non-fit rate** | Percentage of profiles that are genuine non-fit for paid support | 2 of 7 (29%) |
| **SLA acceptance rate** | Percentage of profiles that accept or request an SLA | 0 of 7 (0%) |
| **Support category diversity** | Number of distinct support categories identified | 6 (installation, compliance, maintenance, emergency, training, security artifacts) |
| **Capacity/burden ratio** | Estimated support burden as percentage of available team capacity | 50–94% of one FTE for 5 organizations (steady state) |
| **Theme distinction** | Whether findings distinguish interest, budget authority, procurement, and support expectations | Yes — all four dimensions are distinguished (§9.2) |

### 16.3 Acceptance Criteria Assessment

The TODO specification states: "Findings distinguish interest, budget authority, procurement and
support expectations."

| Dimension | Distinguished? | Evidence |
|---|---|---|
| Interest | Yes | 5 of 7 profiles expressed interest; 2 did not (SH-05, SH-07) |
| Budget authority | Yes | 5 of 7 have confirmed authority; 1 partial (SH-02); 1 none (SH-04) |
| Procurement path | Yes | 4 established; 1 slow but viable; 2 none |
| Support expectations | Yes | 6 distinct categories identified; priorities vary by capacity level |

**Acceptance criterion: MET (synthetically).** All four dimensions are distinguished in the
synthetic findings.

### 16.4 Definition of Done Assessment

The TODO specification states: "No SLA/availability promise; report evidence and non-fit."

| Requirement | Met? | Evidence |
|---|---|---|
| No SLA/availability promise | Yes | 0 of 7 profiles accepted an SLA; anti-SLA guard in protocol (§6.4); explicit disclaimer in consent script (§5.2) |
| Report evidence | Yes | Synthetic evidence reported in §8, §9, §10 |
| Report non-fit | Yes | 2 genuine non-fit cases reported (§12, NF-01, NF-02); 1 structurally unfundable case (NF-03) |

**Definition of done: MET (synthetically).**

### 16.5 Success Criteria for Real-Data Collection

The synthetic baseline establishes the following success criteria for real-data collection:

| Criterion | Minimum for "baseline established" | Minimum for "go" decision |
|---|---|---|
| Completed interviews | 5 | 5 |
| Interest/budget alignment confirmed | 3 profiles | 3 profiles |
| Non-fit cases documented | 1 | 1 |
| Procurement path validated | 2 profiles | 3 profiles |
| Support burden estimate validated | Within 50% of synthetic estimate | Within 25% of synthetic estimate |
| SLA boundary confirmed | 0 profiles accept SLA | 0 profiles accept SLA |
| Protocol review passed | Yes | Yes |
| Consent procedure validated | Yes | Yes |

---

## 17. Cost Assumptions and Decision Framework

### 17.1 Cost Assumptions

The following assumptions underpin the support burden estimates. All are synthetic and require
validation with real data.

| Assumption | Value | Basis | Confidence |
|---|---|---|---|
| Support staff cost (loaded) | $60–100/hour | Estimated fully-loaded cost for a senior technical staff member capable of providing support | Low — varies by region and employment model |
| Installation guidance effort | 20–120 hours per deployment | Range from synthetic profiles (SH-01: 20–40; SH-04: 60–120) | Low — based on synthetic estimates only |
| Ongoing maintenance effort | 4–10 hours per month per organization | Range from synthetic profiles (SH-02: 4–8; SH-04: 6–10) | Low — no real operational data |
| Emergency response effort | 2–8 hours per incident, 1–3 incidents per year | Estimated from synthetic profiles | Low — highly variable |
| Compliance review effort | 10–40 hours per review | Range from synthetic profiles (SH-01: 10–20; SH-07: 20–40) | Low — depends on regulatory complexity |
| Training effort | 10–20 hours per organization | Range from synthetic profiles | Low — depends on organization's learning curve |

### 17.2 Cost Scenarios

| Scenario | Organizations supported | First-year cost (support staff time) | Steady-state annual cost | Revenue needed to break even (at $60–100/hr) |
|---|---|---|---|---|
| Minimal | 1 | $1,800–6,000 | $480–1,500 | $1,800–6,000 first year; $480–1,500/year ongoing |
| Small | 3 | $7,680–20,160 | $2,880–7,200 | $7,680–20,160 first year; $2,880–7,200/year ongoing |
| Moderate | 5 | $14,400–36,000 | $5,760–14,400 | $14,400–36,000 first year; $5,760–14,400/year ongoing |
| Maximum feasible | 7 (all profiles) | $16,140–51,600 | $6,720–21,600 | $16,140–51,600 first year; $6,720–21,600/year ongoing |

**Note**: These costs represent the value of staff time only. They do not include:
- Infrastructure costs for support tooling (ticketing system, knowledge base, communication channels)
- Documentation development costs
- Hiring costs for dedicated support staff
- Opportunity cost of developer time diverted to support

### 17.3 Decision Framework

The decision framework evaluates whether to proceed with a support offering based on synthetic
findings. This is not a go/no-go on a real product — it is an assessment of whether the evidence
warrants further investigation.

| Decision dimension | Threshold | Synthetic finding | Assessment |
|---|---|---|---|
| **Demand signal** | >=3 profiles express interest with budget authority | 3 profiles (SH-01, SH-03, SH-06) | **Met** — but all are moderate-to-high capacity; low-capacity demand is unfundable |
| **Capacity feasibility** | Support burden does not exceed 50% of one FTE | 12–22 hrs/month for 5 organizations (steady state) | **Tight** — at 50–94% of one FTE, this is strained but theoretically feasible for a small number |
| **Non-fit clarity** | Non-fit cases are identified and documented | 2 genuine non-fit + 1 structurally unfundable | **Met** — non-fit boundaries are clear |
| **SLA boundary** | No participant expects or accepts an SLA | 0 of 7 accept SLA | **Met** — universal boundary |
| **Procurement viability** | >=2 profiles have viable procurement paths | 5 profiles have established or viable paths | **Met** — procurement is feasible for most interested profiles |
| **Cost recovery** | Support revenue can cover support cost | Break-even requires $480–1,500/year per organization at minimum | **Uncertain** — depends on pricing model (ECO-003) |

### 17.4 Decision Options

Based on the synthetic findings, the following decision options are available:

| Option | Description | Conditions | Risk |
|---|---|---|---|
| **A: PROCEED TO REAL DATA** | Authorize real interviews with 5–8 organizations | Owner approval for outreach, incentive budget, consent procedures | Low — research only, no service commitment |
| **B: REFINE PROTOCOL** | Revise interview guide based on synthetic findings, then proceed | Synthetic findings reveal gaps in question coverage | Low — additional research iteration |
| **C: PAUSE AND DOCUMENT** | Record synthetic findings as baseline; defer real data collection | Owner determines that other priorities take precedence | Medium — findings age without real validation |
| **D: NO-GO ON SUPPORT** | Conclude that support offering is not viable based on synthetic findings | Synthetic capacity analysis shows burden exceeds capacity | High — may prematurely foreclose a viable path |

**Recommended option**: A — PROCEED TO REAL DATA. The synthetic baseline meets all acceptance
criteria and definition of done requirements. Real interviews are needed to validate the findings
and to determine whether the demand/capacity balance is sustainable.

### 17.5 Explicit Decision

**BASELINE ESTABLISHED.** The research protocol is complete and has been exercised with synthetic
data. The synthetic findings indicate that:

1. There is differentiated demand for self-hosted support across four dimensions (interest, budget
   authority, procurement path, support expectations).
2. Installation guidance is the most universally desired support category.
3. Support need is inversely correlated with internal capacity.
4. High-capacity organizations prefer knowledge transfer over ongoing dependency.
5. No organization in the synthetic sample accepted an SLA or availability promise.
6. The current team can sustainably support 2–3 organizations with installation guidance or 1–2
   with ongoing maintenance, but not more without dedicated staff.
7. Three distinct non-fit cases exist (self-sufficient, security-constrained, structurally
   unfundable).

**No hosting tier, SLA, deployment automation, or account feature is proposed, authorized, or
implied by this finding.**

**Next step**: Owner authorization for real-data collection. Until authorized, M48-02 remains at
the synthetic baseline stage.

---

## 18. Limitations and Caveats

### 18.1 Fundamental Limitation: Synthetic Data

**This entire document is based on synthetic data.** No real interviews were conducted. No real
organization representatives were consulted. No real demand evidence exists.

The synthetic profiles are constructed to:
- Exercise the research protocol and interview guide.
- Demonstrate the range of themes the protocol is designed to capture.
- Test the acceptance criteria and decision framework.
- Identify potential bias, risk, and non-fit patterns.
- Estimate support burden for capacity planning.

The synthetic profiles are NOT:
- Evidence of real organizational demand.
- A substitute for real-data collection.
- A basis for support service design, pricing, or staffing decisions.
- A commitment to offer support services.

### 18.2 Specific Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **Single-researcher construction** | All synthetic profiles were constructed by one researcher, limiting perspective diversity | Real recruitment must use diverse channels and multiple recruiters if possible |
| **No real organizational knowledge** | Infrastructure stacks, procurement processes, and staffing models are approximated | Real interviews should verify technical and procurement context with actual staff |
| **Support burden estimates are speculative** | Hour estimates are based on researcher judgment, not observed data | Real interviews should ask for specific past experience with similar deployments |
| **Cost assumptions are illustrative** | Dollar figures are rough estimates based on generic staff costs; actual costs vary by region, role, and employment model | Real cost modeling requires actual staff rates and infrastructure costs |
| **Capacity analysis assumes current team structure** | Team capacity may change as the project evolves | Capacity assessment should be refreshed before any support offering decision |
| **Non-fit cases may be under-represented** | Only 2 of 7 synthetic profiles are non-fit; real non-fit rate may be higher | Real recruitment should actively seek non-fit cases |
| **No competitive landscape analysis** | Synthetic profiles do not account for existing support services from other vendors | Real research should investigate what support services organizations currently use |
| **Temporal snapshot** | Synthetic data reflects a single point in time; organizational needs and capacity evolve | Real-data collection should be time-bounded and dated |
| **MoonWitness familiarity** | The synthetic researcher knows MoonWitness architecture, which may influence profile construction | Real interviewers must be trained to separate product knowledge from research neutrality |
| **No legal review** | Support service offerings may create legal obligations (liability, warranty, data handling) that have not been reviewed | Legal review is required before any support offering is made |

### 18.3 What This Document Cannot Claim

- "Organizations need paid self-hosted support for MoonWitness XV." — No real demand evidence exists.
- "Installation guidance is the most valuable support category." — Synthetic frequency does not
  equal real value.
- "The project team can support N organizations." — Capacity estimate is based on synthetic burden;
  real burden may differ.
- "A support offering would be financially viable." — Cost assumptions are illustrative; real costs
  require actual pricing modeling (ECO-003).
- "No organization wants an SLA." — Synthetic finding based on 7 profiles; real population may differ.
- "Non-fit cases are 29% of the population." — Synthetic proportion is not a statistical estimate.
- "Self-hosting is the right deployment model for any organization." — This research does not
  evaluate deployment model suitability.

### 18.4 Confidence Levels

| Finding | Confidence | Basis |
|---|---|---|
| Protocol structure is complete | High | All sections present and internally consistent |
| Interview guide covers relevant topics | Medium | Based on researcher judgment, not pilot testing |
| Synthetic themes reflect real patterns | Low | No real data to validate against |
| Acceptance criterion is synthetically met | High (for synthetic data) | All four dimensions distinguished |
| Support burden estimates are directionally correct | Low–Medium | Based on synthetic profiles; real complexity may differ |
| Non-fit cases are genuine | Medium | Two clear non-fit patterns; one structural non-fit |
| SLA boundary is universal | Low | Based on 7 synthetic profiles; needs real validation |
| Capacity analysis is actionable | Medium | Based on observable team structure; will change over time |

---

## 19. Deferred Items Requiring Owner Action

### 19.1 Items Requiring Owner Decision

| Item | Decision needed | Blocks | Priority |
|---|---|---|---|
| **Real-data collection authorization** | Owner must approve outreach to real technically responsible organizations | All real interviews | P1 |
| **Incentive budget** | Owner must approve incentive type and amount (if any) | Recruitment | P2 |
| **M35-01/M35-02 scope reconciliation** | Owner must determine if synthetic baseline is sufficient to proceed with M48-02 real data independently | Real-data collection | P1 |
| **Protocol reviewer assignment** | Owner must assign a reviewer to validate the protocol before real-data collection | Real interviews | P1 |
| **Anti-sales/anti-SLA guard training** | Owner must ensure interviewers are trained on both guards before real interviews | Real interviews | P1 |
| **Data storage and retention** | Owner must approve data storage location and retention schedule for real participant data | Real interviews | P1 |
| **Infrastructure sensitivity review** | Owner must review the infrastructure anonymization procedure (§14.4) for adequacy | Real interviews | P1 |
| **ECO-001/ECO-005 protocol sharing** | Owner must confirm that the shared protocol/pool arrangement is acceptable | Downstream tasks | P2 |
| **Legal review for support obligations** | Owner must determine whether legal review is needed before any support service is discussed with real organizations | Real interviews (if service discussion is in scope) | P2 |

### 19.2 Items Deferred to Downstream Tasks

| Item | Deferred to | Rationale |
|---|---|---|
| Pricing hypotheses for support services | ECO-003 (M48-03) | Requires demand evidence from M48-01 and M48-02 first |
| Commercial entitlements | ECO-004 (M48-04) | Requires pricing and demand evidence first |
| Partnership distribution for support services | ECO-005 (M48-05) | Requires demand evidence and outreach authorization first |
| Cost-to-serve modeling for support | ECO-006 (M48-06) | Requires support burden evidence from M48-02 first |
| Funding model comparison | ECO-007 (M48-07) | Requires cost evidence first |
| Hosting tier or managed service design | Out of scope for M48 | M48-02 explicitly excludes hosting tier design |
| SLA framework | Out of scope for M48 | M48-02 explicitly excludes SLA/availability promises |
| Deployment automation | Out of scope for M48 | M48-02 explicitly excludes deployment automation |
| Account/billing features | Out of scope for M48 | M48-02 explicitly excludes account features |

### 19.3 Items Requiring Future Research Rounds

| Item | Reason for deferral | Suggested approach |
|---|---|---|
| Larger sample size | 7 synthetic profiles are insufficient for statistical confidence | Recruit 10–15 real participants across multiple recruitment waves |
| Competitive landscape analysis | Synthetic profiles do not account for existing support vendors | Survey organizations about current support relationships and alternatives |
| Support staff hiring analysis | Capacity analysis assumes current team; real support may require hiring | Model FTE requirements for different support offering scenarios |
| Legal obligation analysis | Support services may create legal obligations not yet reviewed | Engage legal counsel to review support service terms and liability |
| Longitudinal support burden tracking | Single-timepoint estimates cannot capture how support needs evolve | Track actual support hours for any pilot engagements |
| Non-fit rate validation | Synthetic non-fit rate (29%) may not reflect real population | Actively recruit non-fit cases in real data collection |
| Self-hosting failure analysis | Profiles represent successful self-hosters; failed attempts are not captured | Interview organizations that attempted and abandoned self-hosting |
| Documentation sufficiency assessment | High-capacity non-fit cases suggest documentation may substitute for paid support | Evaluate whether improved documentation reduces support demand |

### 19.4 Owner Action Checklist

Before real-data collection can begin, the owner must:

- [ ] Approve this document as a complete synthetic baseline
- [ ] Authorize outreach to real technically responsible organizations
- [ ] Approve or decline incentive budget
- [ ] Assign a protocol reviewer
- [ ] Confirm M35-01/M35-02 scope reconciliation (or authorize independent progression)
- [ ] Approve data storage and retention plan
- [ ] Confirm anti-sales and anti-SLA guard training for all interviewers
- [ ] Approve the consent script for real-data use
- [ ] Review infrastructure sensitivity procedure (§14.4)
- [ ] Set a target date for real-data collection start
- [ ] Confirm ECO-001/ECO-005 protocol-sharing arrangement
- [ ] Determine whether legal review is needed before real interviews

---

## 20. Conclusion: BASELINE ESTABLISHED

### 20.1 Summary

This document establishes the **synthetic baseline** for M48-02: Test self-hosted support demand
and constraints. The baseline includes:

- A complete research protocol with consent script, interview guide, anonymization procedure,
  infrastructure sensitivity review, and protocol review checklist.
- Seven synthetic participant profiles representing diverse organization types, technical capacity
  levels, self-hosting motivations, and regulatory environments.
- Synthetic interview results demonstrating the protocol's ability to capture self-hosting
  motivations, support expectations, budget authority, procurement paths, and non-fit cases.
- Theme analysis identifying eight problem themes, with the primary theme (installation guidance
  as the most universally desired support category) appearing in five of seven profiles.
- Support burden estimation indicating 269–516 hours of first-year support across seven profiles,
  decreasing to 12–22 hours per month in steady state.
- Internal capacity comparison showing the current team can sustainably support 2–3 organizations
  with installation guidance or 1–2 with ongoing maintenance, but not more without dedicated staff.
- Non-fit case documentation identifying three distinct non-fit patterns (self-sufficient,
  security-constrained, structurally unfundable).
- Sample and selection bias documentation identifying seven bias types and their mitigations.
- Privacy and consent considerations with data classification, anonymization standards,
  infrastructure sensitivity procedures, and rollback protocols.
- Risk mitigation strategies for support expectation management, SLA boundary enforcement,
  small sample limitations, and the critical distinction between interest and viable demand.
- Cost assumptions and decision framework with explicit cost scenarios and decision options.
- A comprehensive list of deferred items requiring owner action before real-data collection
  can begin.

### 20.2 Status

| Aspect | Status |
|---|---|
| Research protocol | **Complete** (synthetic) |
| Interview guide | **Complete** (synthetic) |
| Consent script | **Complete** (requires owner approval for real use) |
| Anonymization procedure | **Complete** (8-step including infrastructure sensitivity) |
| Synthetic profiles | **Complete** (7 profiles) |
| Synthetic interview results | **Complete** |
| Theme analysis | **Complete** (8 themes identified) |
| Acceptance criterion (dimension distinction) | **Synthetically met** (all 4 dimensions distinguished) |
| Non-fit cases | **Documented** (2 genuine + 1 structural) |
| Support burden estimate | **Complete** (269–516 hrs first year; 12–22 hrs/month steady state) |
| Internal capacity comparison | **Complete** (2–3 orgs installation; 1–2 orgs ongoing) |
| SLA/availability boundary | **Confirmed** (0 of 7 accept SLA) |
| Go/no-go framework | **Complete** |
| Cost assumptions | **Documented** (illustrative; requires real validation) |
| Real-data collection | **Deferred** (requires owner authorization) |
| Real demand evidence | **Not established** |

### 20.3 Decision

**BASELINE ESTABLISHED.** The research protocol is complete and has been exercised with synthetic
data. The synthetic findings indicate that differentiated demand for self-hosted support exists
across four dimensions (interest, budget authority, procurement path, support expectations), that
installation guidance is the most universally desired support category, and that the current team
can sustainably support a limited number of organizations (2–3 for installation guidance, 1–2 for
ongoing maintenance). No SLA or availability promise was accepted by any synthetic participant.
Two genuine non-fit cases and one structurally unfundable case were identified.

However, these findings are constructed, not observed, and do not constitute real demand evidence.
Real interviews are required to validate the synthetic findings and to determine whether a support
offering is viable.

**No hosting tier, SLA, deployment automation, or account feature is proposed, authorized, or
implied by this document.**

**Next step**: Owner authorization for real-data collection. Until authorized, M48-02 remains at
the synthetic baseline stage, and downstream tasks (ECO-003 pricing, ECO-006 cost modeling)
remain deferred.

### 20.4 Document Provenance

| Field | Value |
|---|---|
| Document path | `docs/audit/M48-02-self-hosted-support-demand.md` |
| Document type | Audit/design document |
| Data type | Synthetic only — no real participant data |
| Task status in TODO | Unchecked (planning only; this document does not complete the task) |
| V5 candidate | ECO-002 |
| TODO task | M48-02 |
| Milestone | M48 |
| Group | G7 — ECOSYSTEM |
| Dependencies | M48-01 (done, synthetic), M35-01 (BLOCKED), M35-02 (boundary) |
| Companion tasks | ECO-001 (M48-01), ECO-005 (M48-05) |
| Date | 2026-10-30 |
| Confidence | Low (synthetic data; no real interviews conducted) |

### 20.5 Compliance Statement

This document complies with the following project governance requirements:

- **TODO.md is the sole status source.** This document does not claim task completion.
- **No new branch created.** Work follows the owner's branch discipline policy (dev only).
- **No participant data in product databases.** All data is synthetic and stored in the audit
  document only.
- **No hosting tier, SLA, deployment automation, or account feature.** This task is research-only;
  no infrastructure, service level, or billing mechanism is created or implied.
- **No service offer.** Interviews (synthetic or real) explore organizational needs, not solutions.
- **No outreach without authorization.** Real-data collection requires explicit owner approval.
- **Anti-overlap maintained.** This document addresses self-hosted support demand only; it does not
  encroach on ECO-001 (general demand), ECO-003 (pricing), ECO-004 (entitlements), ECO-005
  (partnerships), ECO-006 (cost modeling), or M35 (buyer/service/merchant).
- **Synthetic data clearly marked.** All profiles, quotes, and results are identified as fictional
  throughout the document.
- **Non-fit cases documented.** SH-05 and SH-07 are recorded as genuine non-fit cases; SH-04 is
  recorded as structurally unfundable.
- **Sample and selection bias stated.** Seven bias types are documented in §13.
- **Limitations explicit.** §18 states what this document cannot claim.
- **SLA boundary enforced.** Zero synthetic participants accepted an SLA; anti-SLA guard is
  documented in protocol (§5.4, §6.4).
- **Support expectation management.** Multi-layer mitigation documented (§15.2).

---

## Appendix A: Consent Script Template (Printable)

> **M48-02 Self-Hosted Support Demand Study — Consent Form**
>
> **Study title**: Understanding Organizational Self-Hosted Software Deployment and Support Needs
>
> **Researcher**: [Name and contact]
>
> **Purpose**: We are conducting a research study to understand how technically responsible
> organizations approach self-hosted software deployment and what support needs arise when
> operating complex applications on their own infrastructure.
>
> **Procedures**: You will be asked to participate in a ~55-minute interview about your
> organization's self-hosting experience, technical capacity, and support expectations. The
> interview will be [audio-recorded / noted by hand].
>
> **Risks**: Minimal. You may decline to answer any question or withdraw at any time. We ask
> that you not share specific infrastructure configurations, security settings, or proprietary
> system details.
>
> **Benefits**: None direct. Your answers will help us understand whether this is a problem
> space worth exploring.
>
> **Important disclaimers**:
> - This research does not constitute an offer of support services.
> - No SLA, availability promise, or service level commitment is being made.
> - No product or service is being presented during this interview.
>
> **Confidentiality**: Your name and organization will be replaced with a code in all research
> outputs. Infrastructure details will be anonymized. Direct quotes will only be used with your
> additional explicit consent.
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
> [ ] I understand that no support service is being offered.
> [ ] I understand that no SLA or availability promise is being made.
>
> Participant name: ________________________
>
> Participant role: ________________________
>
> Participant signature: ________________________ Date: ____________
>
> Researcher signature: ________________________ Date: ____________

---

## Appendix B: Interview Note-Taking Template

> **Participant code**: SH-___
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
> **Module A: Role and Organizational Context**
>
> A1 (Role description):
>
> A2 (Technical staff count):
>
> A3 (Currently self-hosted applications):
>
> ---
>
> **Module B: Self-Hosting Context and Motivations**
>
> B1 (Most recent self-hosting decision — walk through):
>
> B2 (Infrastructure stack):
>
> B3 (Installation — who handled it):
>
> B4 (Ongoing maintenance tasks):
>
> B5 (Maintenance frequency and staff time):
>
> ---
>
> **Module C: Support Expectations and Experience**
>
> C1 (When internal capacity is exceeded — what do you do):
>
> C2 (Past experience paying for external support):
>
> C3 (Most useful support categories — rank):
>
> C4 (What you prefer to handle internally):
>
> C5 (Importance of infrastructure-specific expertise):
>
> ---
>
> **Module D: Budget Authority and Procurement**
>
> D1 (Procurement decision process):
>
> D2 (Budget authority holder):
>
> D3 (Existing budget line for support):
>
> D4 (Procurement constraints):
>
> D5 (Annual spending range for support):
>
> ---
>
> **Module E: Closing**
>
> E1 (Anything else):
>
> E2 (One thing to change):
>
> E3 (Participant questions):
>
> ---
>
> **Post-interview reflection** (researcher only):
>
> Courtesy bias observed: [ ] None [ ] Some [ ] Significant
>
> Interest vs. viable demand clarity: [ ] Clear [ ] Ambiguous
>
> SLA expectation raised by participant: [ ] No [ ] Yes — describe: ____________
>
> Infrastructure sensitivity concern: [ ] None [ ] Yes — describe: ____________
>
> Follow-up needed: [ ] No [ ] Yes — describe: ____________

---

## Appendix C: Theme Coding Sheet

> **Instructions**: For each interview, code the presence (+) or absence (-) of each theme.
> Add new themes as they emerge. A theme is "repeated" if it appears in >=3 profiles.

| Theme | SH-01 | SH-02 | SH-03 | SH-04 | SH-05 | SH-06 | SH-07 | Total | Repeated? |
|---|---|---|---|---|---|---|---|---|---|
| T1: Installation guidance is most desired support | + | + | + | + | - | + | - | 5 | Yes |
| T2: Regulatory/compliance drives self-hosting | + | - | + | - | + | + | + | 5 | Yes |
| T3: Ongoing maintenance desired by low-capacity orgs | - | + | - | + | - | + | - | 3 | Yes |
| T4: Budget authority does not guarantee procurement path | + | + | + | + | + | + | + | 7 | Yes (universal) |
| T5: High-capacity prefers knowledge transfer | + | - | + | - | + | - | - | 3 | Yes |
| T6: Compliance/security review is distinct category | + | - | - | - | - | + | + | 3 | Yes |
| T7: Support need inversely correlated with capacity | + | + | - | + | - | - | - | 4 | Yes |
| T8: No SLA acceptance | + | + | + | + | + | + | + | 7 | Universal |

---

## Appendix D: Support Burden Summary Card

> **For quick reference during decision-making**

| Metric | Value |
|---|---|
| Total first-year support hours (all 7 profiles) | 269–516 hrs |
| Total first-year support hours (excluding non-fit) | 249–476 hrs |
| Steady-state monthly burden (5 interested orgs) | 12–22 hrs/month |
| Maximum sustainable organizations (installation only) | 2–3 per year |
| Maximum sustainable organizations (installation + maintenance) | 1–2 total |
| Dominant support category | Installation guidance (49–62% of first-year burden) |
| SLA acceptance rate | 0% (universal boundary) |
| Non-fit rate | 29% (2 of 7 profiles) |
| Interest/budget alignment rate | 43% (3 of 7 profiles) |
| Estimated break-even cost per organization (first year) | $1,800–6,000 |
| Estimated break-even cost per organization (steady state) | $480–1,500/year |

---

## Appendix E: Glossary

| Term | Definition |
|---|---|
| **Acceptance criterion** | The minimum evidence threshold for the task to be considered complete. For M48-02: findings distinguish interest, budget authority, procurement path, and support expectations. |
| **Air-gapped** | A network security measure where a computer or network is physically isolated from unsecured networks (especially the internet). |
| **Anti-SLA guard** | Protocol rules preventing the interviewer from making or implying any service level agreement, availability promise, or uptime guarantee. |
| **Anti-sales guard** | Protocol rules preventing the interviewer from presenting MoonWitness or any product as a solution during the interview. |
| **BASELINE ESTABLISHED** | The document status indicating that the research protocol is complete and has been exercised with synthetic data, but real-data collection has not occurred. |
| **Compliance review** | An assessment of whether an application's data handling, access controls, and audit logging meet specific regulatory requirements (e.g., GDPR, accessibility standards). |
| **Data localization** | Legal requirements that data about a country's citizens must be stored on infrastructure within that country's borders. |
| **Data sovereignty** | The principle that data is subject to the laws of the country in which it is physically located. |
| **Installation guidance** | One-time support provided during the initial deployment of an application, including configuration, dependency setup, and initial testing. |
| **Knowledge transfer** | Support focused on teaching the organization's staff to operate and maintain the application independently. |
| **MoonWitness XV** | The product/system under development. A monorepo containing multiple applications (Dock, HQ, Cockpit, ARSY, Lumen, ECHOLOG, SKYLINK) with research, messaging, and storage capabilities. |
| **Non-fit case** | An organization for which paid self-hosted support is unnecessary, inappropriate, or structurally impossible. |
| **Ongoing maintenance support** | Continuous support for security patches, database upgrades, dependency updates, and routine operational tasks. |
| **Procurement path** | The established process by which an organization purchases external technical services, including budget approval, vendor selection, and contract execution. |
| **Self-hosted deployment** | Running an application on infrastructure owned and operated by the organization using it, rather than on the vendor's infrastructure (SaaS/managed hosting). |
| **SLA (Service Level Agreement)** | A contractual commitment to specific service metrics (e.g., uptime percentage, response time, resolution time). |
| **Support burden** | The total staff time required to provide support services to one or more organizations. |
| **Synthetic data** | Fictional data constructed to exercise a protocol or demonstrate expected patterns. Not evidence of real-world conditions. |
| **Theme** | A recurring pattern identified across multiple interview profiles. Coded qualitatively, not quantitatively. |
| **Technically responsible organization** | An organization that bears responsibility for installing, operating, and maintaining a self-hosted application deployment. |

---

## Appendix F: Cross-Reference to V5 Source Package

This document corresponds to the following entries in the V5 source package:

| V5 reference | Location | Relationship |
|---|---|---|
| ECO-002 | `docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md` | Canonical specification (full 22-section source) |
| M48-02 | `TODO.md` (M48 section) | Canonical TODO task |
| M48 milestone | `docs/milestones/M48.md` | Parent milestone |
| V5 source package | `docs/research/unified-100-issue-frontier-v5/README.md` | Source package root |
| ADR applicability | `docs/research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md` | No new ADR required |
| M48-01 upstream | `TODO.md` (M48 section) | DONE (synthetic baseline); shared protocol/pool |
| M35-01 dependency | `TODO.md` (M35 section) | BLOCKED; workable as baseline with synthetic data |
| M35-02 boundary | `TODO.md` (M35 section) | Authoritative for merchant/payment; no overlap |
| ECO-001 companion | `ISSUES_ECONOMY.md` | Shares protocol/pool |
| ECO-005 companion | `ISSUES_ECONOMY.md` | Shares protocol/pool |
| ECO-003 downstream | `ISSUES_ECONOMY.md` | Pricing hypotheses; requires M48-02 demand evidence |
| ECO-006 downstream | `ISSUES_ECONOMY.md` | Cost-to-serve modeling; requires M48-02 burden evidence |

---

## Appendix G: Interview Question Quick Reference

> **For interviewer use during real-data collection**

### Pre-Interview (5 min)
- Read consent script
- Confirm recording/note-taking consent
- Confirm understanding that no service is being offered

### Module A: Role and Context (5 min)
- A1: Describe your role and technical infrastructure responsibilities
- A2: How many technical staff does your organization employ?
- A3: What applications does your organization currently self-host?

### Module B: Self-Hosting Context (15 min)
- B1: Walk me through your most recent self-hosting decision
- B2: What infrastructure does that application run on?
- B3: How was installation handled?
- B4: What ongoing maintenance does the application require?
- B5: How often do maintenance tasks arise?

### Module C: Support Expectations (15 min)
- C1: When your team cannot solve a problem internally, what do you do?
- C2: Have you ever paid for external support? Describe that experience.
- C3: What kinds of external support would be most useful?
- C4: What do you prefer to handle internally?
- C5: How important is infrastructure-specific expertise?

### Module D: Budget and Procurement (10 min)
- D1: How does your organization procure technical support services?
- D2: Who holds the budget authority?
- D3: Is there a budget line for external support?
- D4: What constraints affect procurement?
- D5: What annual spending range is feasible?

### Module E: Closing (5 min)
- E1: Anything we haven't discussed?
- E2: One thing you would change about self-hosted support?
- E3: Your questions?

### Post-Interview
- Record reflection on courtesy bias, SLA expectations, infrastructure sensitivity
- Confirm no service promise was made
- Thank participant; provide follow-up contact information

---

## Appendix H: Non-Fit Decision Tree

> **For interviewer use when assessing whether an organization is a fit for paid support**

```
START
  |
  v
Does the organization self-host (or plan to self-host) complex applications?
  |
  +-- NO --> OUT OF SCOPE (not a self-hosting organization)
  |
  +-- YES --> Continue
               |
               v
             Does the organization have internal technical capacity to
             install, configure, and maintain applications?
               |
               +-- YES (high capacity) --> Does the organization WANT
               |     external support?
               |       |
               |       +-- YES --> FIT (selective support: compliance,
               |       |              integration guidance)
               |       |
               |       +-- NO --> NON-FIT (self-sufficient; needs
               |                    documentation only)
               |
               +-- NO (low capacity) --> Does the organization have
                     budget authority AND a procurement path for
                     external support?
                       |
                       +-- YES --> FIT (comprehensive support:
                       |              installation, maintenance,
                       |              troubleshooting)
                       |
                       +-- NO --> NON-FIT (structurally unfundable;
                                 cannot procure even if needed)
                       |
                       v
             Is the organization's infrastructure accessible to
             external support providers?
               |
               +-- YES --> FIT (standard support model)
               |
               +-- NO (air-gapped, classified) --> NON-FIT for
                         traditional support; may be FIT for
                         artifact-based support (security review
                         packages, hardening guides)
```

---

## Appendix I: Risk Matrix Quick Reference

| ID | Risk | Likelihood | Impact | Key Mitigation |
|---|---|---|---|---|
| R1 | Small sample | High | Medium | Document; seek >=5 real |
| R2 | Expectations exceed capacity | Medium | High | Don't offer service; document limits |
| R3 | Interviewer implies SLA | Low | Critical | Anti-SLA guard; dry run |
| R4 | Participant expects service | Medium | High | Consent disclaimer; closing clarification |
| R5 | Interest != demand | High | High | Distinguish dimensions; require past behavior |
| R6 | Synthetic != real diversity | Medium | Medium | Diverse recruitment channels |
| R7 | Data leak to product | Low | Critical | Data separation; anonymization |
| R8 | Non-fit under-represented | Medium | Medium | Actively seek non-fit cases |
| R9 | Burden underestimated | Medium | High | Add 50% contingency |
| R10 | Scope conflation | Medium | Medium | Anti-overlap statement |
| R11 | Authorization delay | Medium | Low | Synthetic baseline complete |
| R12 | Neediest cannot afford | High | High | Document as structural finding |

---

*End of document. Status: BASELINE ESTABLISHED. Synthetic data only. No real participant data.
No hosting tier, SLA, deployment automation, or account feature proposed, authorized, or implied.*
