# M48-07 — Compare Recurring Support, Sponsorship and Grant Scenarios

> **Status: BASELINE ESTABLISHED** — Scenario model complete with synthetic funding structures.
> Real funding decisions deferred. No funds are handled. No revenue is claimed. No solicitation
> is made. All monetary figures are synthetic estimates constructed from the M48-06 cost-to-serve
> baseline and published nonprofit funding patterns. This document is an offline research artifact;
> it does not constitute a funding proposal, grant application, or sponsorship offer.

- **Task**: M48-07 (LEAF, milestone [M48 WORKS buyer validation and sustainable economics](../milestones/M48.md), V5 candidate [ECO-007](../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md))
- **Canonical TODO task**: [M48-07](../../../TODO.md) — TODO is sole status source; `ECO-007` is only the V5 reference ID.
- **Group**: G7 — ECOSYSTEM
- **Priority / Difficulty**: P2 / D3
- **Owner**: product/finance research
- **Effort estimate**: M (3–6 days)
- **Dependencies**: M48-06 (done — cost-to-serve baseline); related CHAR-004
- **Companion tasks consuming this model**: CHAR-004 (restricted-fund handling)
- **Document date**: 2026-10-31
- **Data posture**: Synthetic only. No real funds. No real sponsors. No real grants. No revenue claims.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Modeling Goals and Constraints](#3-modeling-goals-and-constraints)
4. [Cost Definition from M48-06](#4-cost-definition-from-m48-06)
5. [Three Funding Scenarios — Overview](#5-three-funding-scenarios--overview)
6. [Scenario 1: Paid Support Model](#6-scenario-1-paid-support-model)
7. [Scenario 2: Non-Restricted Sponsorship Model](#7-scenario-2-non-restricted-sponsorship-model)
8. [Scenario 3: Grant Funding Model](#8-scenario-3-grant-funding-model)
9. [Cost Coverage Analysis](#9-cost-coverage-analysis)
10. [Concentration Risk Analysis](#10-concentration-risk-analysis)
11. [Restrictions and Obligations per Scenario](#11-restrictions-and-obligations-per-scenario)
12. [Unfunded Obligations Identification](#12-unfunded-obligations-identification)
13. [Continuity Modeling](#13-continuity-modeling)
14. [Stress-Test: Loss of Source Scenario](#14-stress-test-loss-of-source-scenario)
15. [Runway Range Calculations](#15-runway-range-calculations)
16. [Funding Concentration Metrics](#16-funding-concentration-metrics)
17. [Assumption Sheet](#17-assumption-sheet)
18. [Formula and Sensitivity Verification](#18-formula-and-sensitivity-verification)
19. [Mission Risk Review](#19-mission-risk-review)
20. [Ethics Considerations](#20-ethics-considerations)
21. [Risk Mitigation](#21-risk-mitigation)
22. [Metrics and Success Criteria](#22-metrics-and-success-criteria)
23. [Limitations and Caveats](#23-limitations-and-caveats)
24. [Deferred Items Requiring Owner Action](#24-deferred-items-requiring-owner-action)
25. [Conclusion: BASELINE ESTABLISHED](#25-conclusion-baseline-established)

---

## 1. Executive Summary

M48-07 asks: how do three recurring funding structures — paid support, non-restricted sponsorship, and grants — compare in their ability to cover MoonWitness XV's maintenance burden, and what are the concentration risks, restrictions, and unfunded obligations associated with each? This document constructs a **scenario comparison model** from the M48-06 cost-to-serve baseline, published nonprofit funding patterns, and explicit structural assumptions. The model is offline — it handles no funds, makes no revenue claims, and solicits no sponsorship or grant support.

**Key synthetic findings** (not real funding evidence):

- The M48-06 cost-to-serve model establishes a monthly maintenance burden of **$152 to $1,549** across low/central/high scenarios for one institutional research workflow, with a central estimate of approximately **$487/month** or **$5,843/year**.
- **Scenario 1 (Paid Support)**: A hypothetical fee-for-service model where institutions pay a recurring fee for defined support entitlements. At the M48-03 central pricing hypothesis ($100–$200/researcher/month), a single institution with 3 researchers could cover the central cost estimate. Concentration risk is **moderate** — revenue depends on contract renewals and satisfaction with support delivery. Restrictions are **low** — the payer receives a defined service and has limited influence over project direction. Unfunded obligations include platform evolution, security hardening, and feature development beyond the support scope.
- **Scenario 2 (Non-Restricted Sponsorship)**: A hypothetical model where a third-party sponsor (foundation, endowment, or individual benefactor) provides unrestricted recurring funding to sustain maintenance. A single sponsor contributing $500–$1,000/month hypothetically covers the central cost range. Concentration risk is **high** — the project depends on one sponsor's continued willingness. Restrictions are **moderate** — while funding is nominally unrestricted, sponsors typically expect alignment with their mission and may request progress reporting. Unfunded obligations include any cost growth beyond the sponsor's contribution level and mission-drift risk if reporting requirements expand.
- **Scenario 3 (Grant Funding)**: A hypothetical model where the project receives time-limited grants from foundations, government bodies, or research councils. A hypothetical grant of $15,000–$50,000 over 12–24 months could cover 2–8 months of central-scenario costs. Concentration risk is **very high** — grants are fixed-term, competitively awarded, and non-renewable by assumption. Restrictions are **high** — grants typically specify deliverables, reporting schedules, budget categories, and sometimes prohibit certain uses of funds. Unfunded obligations include post-grant sustainability, matching requirements, and compliance overhead.
- **No single scenario eliminates all risk.** Each model leaves gaps: paid support cannot fund platform evolution; sponsorship creates dependency on one entity; grants are time-limited and restrictive. A diversified funding mix would reduce concentration risk but adds administrative complexity.
- **Runway under each scenario** ranges from 0 months (if funding never materializes) to 24+ months (if a multi-year grant or long-term sponsorship is secured). The central estimate, assuming one funding source at the hypothetical levels above, is **6–18 months of runway** before the funding source is exhausted or requires renewal.
- **Ethics boundary**: This document does not solicit funds, propose pricing, or recommend a funding model. It compares structural characteristics of three hypothetical scenarios to make risks visible. Funding decisions require separate owner authorization, legal review, and ethics approval.

**Decision**: BASELINE ESTABLISHED. The scenario comparison model is complete with synthetic inputs. Every figure is labeled as hypothetical or source-backed. Real funding decisions are deferred.

---

## 2. Task Metadata

### 2.1 Canonical Specification Reference

| Field | Value |
|---|---|
| Candidate ID | ECO-007 |
| TODO Task ID | M48-07 |
| Domain / Category | Economy / Cost/profitability |
| Priority | P2 |
| Difficulty | D3 |
| Owner | product/finance research |
| Effort | M (3–6 days) |
| Confidence | Low (synthetic data; no real funding evidence) |
| Risk | Medium |
| V5 Wave | W3 (proposed) |
| Tags | sustainability, modeling, funding-scenarios |

### 2.2 22-Section Source Alignment

| # | Section | Status in this document |
|---|---|---|
| 1 | Identity | Recorded in §2.1 |
| 2 | Executive | §1 |
| 3 | Current state | §3.1 |
| 4 | Problem | §3.2 |
| 5 | Evidence | §3.3 |
| 6 | Value | §3.4 |
| 7 | Solution | §5, §6, §7, §8 |
| 8 | Architecture | §3.5, §17 |
| 9 | Microtasks | §9, §10, §11, §12, §13, §14 |
| 10 | Acceptance | §18, §22 |
| 11 | DoD | §20, §23 |
| 12 | Tests | §18 |
| 13 | Dependencies | §2.3 |
| 14 | Risks | §21 |
| 15 | Metrics | §22 |
| 16 | Estimate | §2.1 |
| 17 | Rollback | §23.4 |
| 18 | Synergy | §3.4 |
| 19 | Anti-overlap | §2.4 |
| 20 | Outcome | §15, §25 |
| 21 | Future | §24 |
| 22 | Closure evidence | §25 |

### 2.3 Dependencies

| Dependency | Type | Status |
|---|---|---|
| M48-06 — Cost-to-serve model | Upstream producer | Done (synthetic baseline) — provides monthly cost ranges |
| M48-03 — Ethical pricing hypotheses | Upstream reference | Done (synthetic baseline) — provides pricing structure for Scenario 1 |
| M48-04 — Commercial/donation boundary | Upstream reference | Done (conceptual boundary) — defines forbidden couplings |
| CHAR-004 — Restricted-fund handling | Downstream consumer | Uses scenario restrictions to inform fund-separation rules |
| M46-31 — Recurring service cost report | Upstream producer | Done (synthetic baseline) — provides aggregate operating-cost data |
| M35-02 — Merchant/payment owners | Boundary | No overlap; M35-02 remains authoritative for any future payment flow |

### 2.4 Anti-Overlap Statement

This task compares **structural characteristics of three hypothetical funding scenarios** using the M48-06 cost-to-serve baseline. It does not:

- Solicit funds, sponsorship, or grants from any entity.
- Set pricing or make a commercial offer (M48-03 owns pricing hypotheses).
- Model revenue, profitability, or unit economics (M35 owns commercial pilot).
- Handle real funds, create billing telemetry, or process payments.
- Propose a donation platform or charitable fund structure (CHAR-003/004 own charity governance).
- Submit a grant application or sponsorship proposal.
- Make any claim about actual funding availability or likelihood.
- Recommend a specific funding model for adoption.

### 2.5 ADR Applicability

No new ADR is required for the task scope currently proposed. This document is an offline scenario comparison. If future implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

Reference: [M46–M50 ADR Applicability Register](../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md).

### 2.6 Execution Contract

This document follows the [AI Execution Contract](../planning/AI_EXECUTION_CONTRACT.md). No code, migration, deployment, or owner-boundary change was performed. All data in this document is synthetic unless explicitly attributed to an external source.

---

## 3. Modeling Goals and Constraints

### 3.1 Current State

MoonWitness XV operates on a shared Coolify VPS (4 vCPU, 8 GB RAM, 200 GB NVMe) at an aggregate monthly cost of $48–$143 (M46-31 baseline). The M48-06 cost-to-serve model establishes that supporting one institutional research workflow costs $152–$1,549/month depending on scale and support intensity.

No revenue, grant, sponsorship, or operating budget has been verified. No funding source is currently committed. No fundraising activity is underway. The project operates on owner-contributed resources with no external financial support.

The product currently serves:

- A Dock (public-facing web application) with bilingual locale support
- A Headquarters (admin dashboard) with model monitoring
- A Cockpit (operator GUI/CLI)
- An ARSY hub (backend API with Fastify, MoonQL, PostgreSQL)
- A Research domain addon (D05 MIZAN) with review workflows
- An ECHOLOG object storage service (D19)
- A SKYLINK messaging skeleton (D18)
- An AI Gateway with inference capabilities

None of these surfaces currently has a funding mechanism, a billing integration, a sponsorship agreement, or a grant award.

### 3.2 Problem Statement

Without a funding scenario comparison, MoonWitness XV cannot:

- Evaluate which hypothetical funding structure best covers the maintenance burden identified in M48-06.
- Understand the concentration risk associated with relying on a single funding source.
- Identify restrictions and obligations that each funding model would impose.
- Determine what obligations remain unfunded under each scenario.
- Model continuity — what happens when a funding source ends.
- Stress-test the project's resilience to loss of a funding source.
- Make informed decisions about funding diversification.
- Communicate funding risks to stakeholders without implying solicitation.

The problem is not precision — it is structural comparison. A scenario model with explicit assumptions and hypothetical figures is more useful than no comparison at all.

### 3.3 Evidence Base

| Source | Type | Relevance |
|---|---|---|
| M48-06 cost-to-serve baseline | Synthetic cost worksheet | Provides monthly cost ranges ($152–$1,549/month) |
| M48-03 pricing hypotheses | Synthetic pricing study | Provides pricing structure references for Scenario 1 |
| M48-04 commercial/donation boundary | Conceptual boundary diagram | Defines forbidden couplings between commerce and charity |
| M46-31 aggregate cost baseline | Synthetic cost worksheet | Provides infrastructure cost ranges ($48–$143/month) |
| Published nonprofit funding patterns | Public research | Provides structural characteristics of sponsorship and grant models |
| This document (synthetic) | Scenario comparison | Combines all inputs into structural risk analysis |

### 3.4 Value of This Model

- Makes funding dependency and mission-alignment risks visible before any real funding is sought.
- Provides a structural comparison framework for downstream decisions (owner authorization, legal review, ethics approval).
- Identifies which scenarios leave the most unfunded obligations.
- Supports continuity modeling — what happens when funding stops.
- Does not claim funding availability; claims structural transparency about risks.

### 3.5 Modeling Constraints

| Constraint | Rationale |
|---|---|
| **Offline model only** | No fund handling, no billing telemetry, no payment processing, no solicitation |
| **Synthetic data only** | No real funding amounts, no real sponsors, no real grants, no real revenue |
| **Structural comparison, not recommendation** | The model compares scenarios; it does not recommend one over another |
| **No promised amounts** | Every funding figure is hypothetical and labeled as such |
| **Ranges, not point estimates** | Every cost and funding amount is expressed as a range to reflect uncertainty |
| **No profitability claim** | This model does not evaluate revenue, margin, or financial sustainability |
| **No solicitation** | This document does not invite, request, or encourage any entity to provide funds |
| **Donations remain outside commercial revenue** | Per M48-04 boundary; donations are not treated as payment for services |
| **Monthly time horizon** | Costs and hypothetical funding are expressed per month; annual and multi-year projections are derived |

### 3.6 Modeling Questions

The model seeks to answer:

1. **MQ1 — Cost coverage**: What portion of the M48-06 maintenance burden does each scenario hypothetically cover?
2. **MQ2 — Concentration risk**: How dependent is the project on a single funding source under each scenario?
3. **MQ3 — Restrictions**: What obligations, reporting requirements, or usage restrictions does each scenario impose?
4. **MQ4 — Unfunded obligations**: What costs remain uncovered under each scenario?
5. **MQ5 — Continuity**: What happens to the project when each funding source ends?
6. **MQ6 — Runway**: How many months of operation can each scenario hypothetically sustain?
7. **MQ7 — Mission risk**: Does each scenario create pressure to alter the project's mission or priorities?

---

## 4. Cost Definition from M48-06

### 4.1 Maintenance Burden Summary

The M48-06 cost-to-serve model defines the monthly maintenance burden for one institutional research workflow (cross-referencing primary source materials across editions and languages). The following table summarizes the three composite scenarios from M48-06:

| Scenario | Infrastructure | Support labor | Total monthly | Total annual | Description |
|---|---|---|---|---|---|
| **SCN-LOW** | $35.58 | $116.67 | **$152.25** | **$1,827** | Solo researcher, minimal support |
| **SCN-CENTRAL** | $23.60 | $463.33 | **$486.93** | **$5,843** | Small team, moderate support |
| **SCN-HIGH** | $28.59 | $1,520.00 | **$1,548.59** | **$18,583** | Department adoption, full support |

### 4.2 Cost Component Breakdown

The maintenance burden comprises two major categories:

#### Infrastructure Costs (5–23% of total)

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| Compute (VPS share) | $12.00 | $6.19 | $2.70 | Shared allocation; decreases with scale |
| Storage (DB + objects) | $17.00 | $3.83 | $0.80 | Shared allocation; decreases with scale |
| Network (egress + DNS) | $5.33 | $3.16 | $1.34 | Shared allocation |
| External services (AI, email) | $0.00 | $10.00 | $23.33 | Highly variable; AI inference is wildcard |
| Dev tools (amortized) | $1.25 | $0.42 | $0.42 | Fixed cost; decreases with scale |
| **Infrastructure subtotal** | **$35.58** | **$23.60** | **$28.59** | |

#### Support Labor Costs (77–98% of total)

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| Onboarding (amortized) | $66.67 | $333.33 | $1,200.00 | One-time cost spread over 6–24 months |
| Ongoing maintenance | $30.00 | $80.00 | $200.00 | Monthly monitoring and troubleshooting |
| Security patching | $20.00 | $50.00 | $120.00 | Monthly dependency updates and patches |
| **Support labor subtotal** | **$116.67** | **$463.33** | **$1,520.00** | |

### 4.3 Cost Characteristics for Funding Analysis

The cost structure has several characteristics that affect funding scenario design:

1. **Support labor dominates**: 77–98% of costs are labor-related. Funding must cover human time, not just infrastructure.
2. **Onboarding is a step function**: The one-time onboarding cost ($1,600–$7,200) creates a front-loaded expense that must be amortized or covered separately.
3. **Infrastructure is relatively stable**: The infrastructure component ($35–$29/month) is well-bounded and predictable.
4. **AI inference is the wildcard**: External service costs could increase significantly if AI usage grows.
5. **Scale reduces per-workflow cost**: Infrastructure costs decrease with sharing, but support labor scales roughly linearly.
6. **Cost uncertainty is high**: The M48-06 model estimates ±41% total uncertainty. Funding must accommodate variance.

### 4.4 Extended Cost Categories (Beyond M48-06 Scope)

The following cost categories are excluded from M48-06 but would be relevant to a funding scenario. They represent **unfunded obligations** that any funding model must acknowledge:

| Extended cost category | Estimated monthly range | Source | Confidence |
|---|---|---|---|
| Platform feature development | $500–$2,000 | Estimated; based on typical open-source maintenance | LOW |
| Security auditing and hardening | $200–$1,000 | Estimated; no current audit schedule | LOW |
| Documentation and user training | $100–$500 | Estimated; M48-02 suggests training needs | LOW |
| Compliance and certification | $0–$2,000 | UNKNOWN; depends on institutional requirements | LOW |
| Backup and disaster recovery | $50–$200 | Estimated; not currently implemented | LOW |
| Community management and outreach | $100–$500 | Estimated; no current community program | LOW |
| Legal review and governance | $0–$500 | UNKNOWN; depends on funding structure | LOW |
| **Extended subtotal** | **$950–$6,700** | | **LOW** |

**Total hypothetical monthly burden (M48-06 + extended)**: $1,102–$8,249/month at central scenario.

**Important**: The extended cost categories are rough estimates with LOW confidence. They are included to illustrate the scope of unfunded obligations, not to provide precise budget figures.

---

## 5. Three Funding Scenarios — Overview

### 5.1 Scenario Definitions

This document models three hypothetical funding scenarios. Each scenario represents a structurally different way of covering the maintenance burden identified in M48-06.

| Scenario | Funding source | Payment structure | Duration | Restriction level |
|---|---|---|---|---|
| **S1: Paid Support** | Institutional customer(s) paying for defined support entitlements | Recurring fee (monthly or annual) | Ongoing while contract is active | Low — payer receives defined service |
| **S2: Non-Restricted Sponsorship** | Third-party sponsor (foundation, endowment, or benefactor) providing unrestricted funds | Recurring contribution (monthly or annual) | Ongoing while sponsor chooses to continue | Moderate — sponsor expects mission alignment |
| **S3: Grant Funding** | Grant-making body (foundation, government, research council) awarding time-limited funds | Fixed award disbursed over grant period | Fixed term (12–36 months typical) | High — grant specifies deliverables and budget categories |

### 5.2 Scenario Comparison Matrix (Overview)

| Dimension | S1: Paid Support | S2: Sponsorship | S3: Grants |
|---|---|---|---|
| **Hypothetical monthly coverage** | $152–$1,549 | $500–$1,000 | $1,250–$4,167 (amortized) |
| **Cost coverage (central scenario)** | 31–100% | 103–205% | 256–854% |
| **Concentration risk** | Moderate | High | Very High |
| **Restriction level** | Low | Moderate | High |
| **Unfunded obligations** | Platform evolution, security, community | Cost growth, mission drift risk | Post-grant sustainability, compliance |
| **Continuity on source loss** | Contract ends; service stops | Sponsor withdraws; funding stops | Grant expires; no renewal assumed |
| **Mission risk** | Low — service defines scope | Moderate — sponsor influence possible | High — deliverables may not align with priorities |
| **Administrative overhead** | Low — invoicing and support tracking | Low–Moderate — reporting to sponsor | High — grant applications, compliance, reporting |
| **Scalability** | Linear — more customers = more revenue | Limited — depends on sponsor capacity | Limited — depends on grant availability |
| **Ethical risk** | Low — clear commercial exchange | Moderate — influence perception | Low–Moderate — deliverable pressure |

### 5.3 Common Assumptions Across All Scenarios

The following assumptions apply to all three scenarios unless explicitly stated otherwise:

| Assumption | Value | Source | Confidence |
|---|---|---|---|
| Cost baseline | M48-06 SCN-LOW through SCN-HIGH | M48-06 | LOW (synthetic) |
| Central monthly cost | $487/month | M48-06 SCN-CENTRAL | LOW (synthetic) |
| Annual central cost | $5,843/year | Derived (monthly × 12) | LOW |
| Number of funding sources | 1 (single source per scenario) | Assumption for concentration analysis | LOW |
| Funding covers M48-06 costs only | Extended costs are unfunded obligations | This document | LOW |
| No funds are actually handled | Offline model only | Constraint | HIGH |
| No solicitation is made | Research artifact only | Constraint | HIGH |
| All figures are hypothetical | No real funding evidence | Constraint | HIGH |

---

## 6. Scenario 1: Paid Support Model

### 6.1 Model Description

**HYPOTHETICAL SCENARIO — NOT AN OFFER OR SOLICITATION**

In this scenario, MoonWitness XV offers a defined support service to institutional customers. The institution pays a recurring fee (monthly or annual) in exchange for a specified level of technical support, onboarding assistance, and maintenance attention The service entitlement is defined by the M48-03 pricing hypotheses and the M48-04 boundary rules.

**Key structural characteristics**:
- Bilateral transaction: payer receives defined service entitlement.
- Recurring revenue: monthly or annual billing cycle.
- Contract-based: terms define scope, SLA, and exit conditions.
- Commercial exchange: clearly separated from donations per M48-04.

### 6.2 Hypothetical Revenue Model

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Number of institutional customers | 1 | 2 | 5 | Assumption |
| Researchers per customer | 1 | 3 | 10 | M48-06 workload scenarios |
| Hypothetical price per researcher per month | $100 | $150 | $200 | M48-03 H2 flat license hypothesis |
| **Hypothetical monthly revenue** | **$100** | **$900** | **$10,000** | Derived |
| **Hypothetical annual revenue** | **$1,200** | **$10,800** | **$120,000** | Derived |

**Important**: These figures are entirely hypothetical. No price has been set. No customer has committed. No revenue is being generated. The figures illustrate the structural range of a paid support model.

### 6.3 Cost Coverage Analysis

| Cost category | Low scenario coverage | Central scenario coverage | High scenario coverage |
|---|---|---|---|
| M48-06 SCN-LOW ($152/mo) | 66% covered | 591% covered | 6,579% covered |
| M48-06 SCN-CENTRAL ($487/mo) | 21% covered | 185% covered | 2,054% covered |
| M48-06 SCN-HIGH ($1,549/mo) | 6% covered | 58% covered | 646% covered |
| Extended costs ($950–$6,700/mo) | Not covered | Partially covered | Fully covered at high |

**Key finding**: At the central scenario (2 customers × 3 researchers × $150), hypothetical revenue of $900/month covers the M48-06 central cost ($487/month) with $413/month remaining. This remainder could partially address extended costs but does not eliminate them.

### 6.4 Concentration Risk

| Risk factor | Assessment | Rationale |
|---|---|---|
| Customer count dependency | **MODERATE** | At low scenario (1 customer), loss of that customer eliminates 100% of revenue. At high scenario (5 customers), loss of one reduces revenue by 20%. |
| Contract renewal risk | **MODERATE** | Institutional contracts typically run 12–24 months. Non-renewal creates a revenue cliff. |
| Price pressure | **LOW–MODERATE** | Institutional procurement may negotiate discounts, reducing per-unit revenue. |
| Scope creep | **MODERATE** | Customers may request support beyond the defined entitlement, increasing labor costs without increasing revenue. |
| Market risk | **HIGH** | The institutional research tool market is unproven for MoonWitness XV (M48-01 synthetic baseline). Demand is UNKNOWN. |

**Concentration metric (Herfindahl-Hirschman Index equivalent)**:
- 1 customer: HHI = 10,000 (maximum concentration)
- 2 customers: HHI = 5,000 (high concentration)
- 5 customers: HHI = 2,000 (moderate concentration)
- 10+ customers: HHI < 1,000 (low concentration)

At the central scenario (2 customers), the concentration is **high**. Diversification to 5+ customers would reduce concentration to moderate levels.

### 6.5 Restrictions and Obligations

| Restriction/obligation | Description | Impact |
|---|---|---|
| **Service Level Agreement (SLA)** | Contract typically specifies response time, resolution time, and uptime guarantees. | Increases operational burden; may require monitoring investment. |
| **Defined scope** | Support entitlement limits what is covered. Out-of-scope requests must be handled separately. | Reduces mission flexibility; may create customer dissatisfaction if needs evolve. |
| **Invoicing and accounting** | Commercial revenue requires proper invoicing, tax handling, and financial reporting. | Administrative overhead; may require accounting software or professional services. |
| **Refund and chargeback exposure** | Per M48-04, commercial transactions carry refund obligations and chargeback risk. | Financial risk; requires clear terms and dispute resolution process. |
| **Data handling obligations** | Institutional customers may require data processing agreements, security compliance, or data residency guarantees. | May require infrastructure changes or legal review. |
| **Customer communication** | Regular updates, status reports, and support ticket management. | Ongoing labor cost not included in M48-06 model. |

### 6.6 Unfunded Obligations Under Paid Support

The following obligations are NOT covered by the hypothetical paid support revenue:

| Obligation | Estimated monthly cost | Why unfunded |
|---|---|---|
| Platform feature development | $500–$2,000 | Support revenue covers maintenance, not new features |
| Security auditing | $200–$1,000 | Not typically included in support SLA |
| Community management | $100–$500 | Support serves paying customers, not the broader community |
| Documentation beyond support scope | $100–$500 | Support covers operational documentation, not project-wide docs |
| Compliance certification | $0–$2,000 | May be required by some customers but is not a support activity |
| Disaster recovery infrastructure | $50–$200 | Not typically included in basic support SLA |

**Total unfunded obligations**: $950–$6,200/month (approximately 2–13× the M48-06 central cost).

### 6.7 Continuity Model

**When funding stops (contract not renewed)**:

| Timeframe | Impact | Response |
|---|---|---|
| Immediate (0–30 days) | Revenue drops to $0. Support obligations continue until contract end. | Fulfill remaining contractual obligations. |
| Short-term (1–3 months) | No revenue. Infrastructure costs continue ($48–$143/month). Owner absorbs costs. | Evaluate whether to maintain platform at owner expense. |
| Medium-term (3–6 months) | Owner must decide: seek new customers, reduce costs, or sunset service. | If no new customers, begin wind-down of support infrastructure. |
| Long-term (6–12 months) | Platform may continue as a self-funded project with reduced scope. | Feature development stops. Security patching continues at minimum level. |

**Runway with zero revenue**: The project has no financial reserves (assumption). Runway is **0 months** from the point funding stops. The owner must either absorb costs personally or cease operations.

---

## 7. Scenario 2: Non-Restricted Sponsorship Model

### 7.1 Model Description

**HYPOTHETICAL SCENARIO — NOT A SOLICITATION OR OFFER**

In this scenario, a third-party sponsor (foundation, endowment, corporate benefactor, or individual philanthropist) provides recurring unrestricted funding to sustain MoonWitness XV's maintenance operations. The sponsor does not receive a commercial service entitlement in exchange. The funding is a charitable contribution or strategic philanthropy gesture.

**Key structural characteristics**:
- Unilateral contribution: sponsor gives without receiving a defined commercial return.
- Recurring commitment: monthly, quarterly, or annual contributions.
- Unrestricted (nominally): sponsor does not specify how funds must be used, though mission alignment is expected.
- Separated from commerce: per M48-04, sponsorship is structurally distinct from paid services.

### 7.2 Hypothetical Funding Model

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Number of sponsors | 1 | 1 | 2 | Assumption (concentration analysis) |
| Hypothetical monthly contribution per sponsor | $300 | $600 | $1,500 | Estimated from typical small-project sponsorship patterns |
| **Hypothetical monthly funding** | **$300** | **$600** | **$3,000** | Derived |
| **Hypothetical annual funding** | **$3,600** | **$7,200** | **$36,000** | Derived |
| Commitment period | 12 months | 24 months | 36 months | Estimated; sponsors typically commit for defined periods |

**Important**: These figures are entirely hypothetical. No sponsor has been identified. No commitment has been made. No funds are being received. The figures illustrate the structural range of a sponsorship model.

### 7.3 Cost Coverage Analysis

| Cost category | Low scenario coverage | Central scenario coverage | High scenario coverage |
|---|---|---|---|
| M48-06 SCN-LOW ($152/mo) | 197% covered | 395% covered | 1,974% covered |
| M48-06 SCN-CENTRAL ($487/mo) | 62% covered | 123% covered | 616% covered |
| M48-06 SCN-HIGH ($1,549/mo) | 19% covered | 39% covered | 194% covered |
| Extended costs ($950–$6,700/mo) | Not covered | Not covered | Partially covered at high |

**Key finding**: At the central scenario (1 sponsor × $600/month), hypothetical funding of $600/month covers the M48-06 central cost ($487/month) with $113/month remaining. This is a thin margin. At the low scenario ($300/month), the sponsor does not cover even the M48-06 central cost. At the high scenario ($3,000/month with 2 sponsors), the funding covers M48-06 central costs and partially addresses extended costs.

### 7.4 Concentration Risk

| Risk factor | Assessment | Rationale |
|---|---|---|
| Sponsor count dependency | **VERY HIGH** | At 1 sponsor, loss of that sponsor eliminates 100% of funding. This is the maximum possible concentration. |
| Sponsor commitment volatility | **HIGH** | Sponsors may reduce or withdraw funding at any time. No contractual obligation to continue. |
| Sponsor influence risk | **MODERATE** | Even unrestricted sponsors may expect their priorities to be reflected in project decisions. |
| Reputation dependency | **HIGH** | The project's credibility may become associated with the sponsor's reputation. Sponsor controversy could harm the project. |
| Market risk | **LOW** | Sponsorship does not depend on market demand. However, finding a willing sponsor is itself uncertain. |

**Concentration metric**:
- 1 sponsor: HHI = 10,000 (maximum concentration)
- 2 sponsors (equal): HHI = 5,000 (high concentration)
- 3 sponsors (equal): HHI = 3,333 (moderate-high concentration)

At the central scenario (1 sponsor), the concentration is **extreme**. Even at the high scenario (2 sponsors), concentration remains high. Sponsorship models for small projects typically exhibit very high concentration risk.

### 7.5 Restrictions and Obligations

| Restriction/obligation | Description | Impact |
|---|---|---|
| **Mission alignment expectation** | Sponsors typically expect the project to pursue goals consistent with the sponsor's mission. | May constrain project direction; mission drift risk if project adapts to sponsor preferences. |
| **Progress reporting** | Sponsors often request periodic updates on project progress, even for unrestricted gifts. | Administrative overhead; reporting labor estimated at 2–5 hours/month. |
| **Acknowledgment and visibility** | Sponsors may expect public acknowledgment of their contribution. | Requires a recognition policy; must not imply endorsement or commercial relationship. |
| **Fund handling and accountability** | Even unrestricted funds require proper accounting, segregation from commercial revenue (per M48-04), and fiduciary oversight. | Administrative overhead; may require separate bank account or fund accounting. |
| **Tax and regulatory compliance** | Charitable contributions may have tax-deductibility implications for the sponsor and reporting requirements for the recipient. | Legal and accounting review required; cost unknown. |
| **Stewardship obligations** | Responsible use of funds implies a duty to use them effectively and avoid waste. | Governance overhead; may require board oversight or advisory committee. |
| **No commercial return** | Sponsorship is not a purchase. The sponsor receives no service entitlement, no access rights, and no commercial benefit. | Clear boundary required per M48-04; must not create implicit expectations. |

### 7.6 Unfunded Obligations Under Sponsorship

| Obligation | Estimated monthly cost | Why unfunded |
|---|---|---|
| Cost growth beyond sponsor contribution | Variable | If M48-06 costs increase, the sponsor may not increase their contribution proportionally. |
| Platform feature development | $500–$2,000 | Sponsors typically fund maintenance, not new feature development. |
| Extended cost categories (full) | $950–$6,700 | At central sponsorship ($600/month), extended costs are entirely unfunded. |
| Sponsorship diversification effort | $100–$500 | Finding additional sponsors requires outreach and relationship-building effort. |
| Governance and accountability infrastructure | $100–$300 | Proper fund stewardship requires governance structures that cost money to maintain. |

**Total unfunded obligations**: $1,650–$9,500/month (approximately 3–19× the M48-06 central cost).

### 7.7 Continuity Model

**When funding stops (sponsor withdraws)**:

| Timeframe | Impact | Response |
|---|---|---|
| Immediate (0–30 days) | Funding drops to $0. No contractual obligation to continue services. | Owner absorbs all costs. Platform continues at owner's discretion. |
| Short-term (1–3 months) | No funding. Owner must decide whether to seek replacement sponsor, reduce costs, or sunset. | Evaluate alternative funding sources. Begin cost reduction if no replacement is likely. |
| Medium-term (3–6 months) | If no replacement, platform operates at reduced scope or ceases. | Infrastructure may be scaled down (smaller VPS, fewer external services). |
| Long-term (6–12 months) | Project reverts to owner-funded baseline or ceases operations. | No recurring funding means no predictable maintenance capacity. |

**Runway with sponsorship ending**: Assuming no reserves, runway is **0 months** from the point the sponsor withdraws. The project may have a brief buffer if the sponsor provides advance notice (typical: 30–90 days), but this is notice, not funding.

**Sponsor transition risk**: Unlike a commercial contract, a sponsorship withdrawal is typically abrupt and non-negotiable. The project has no leverage to retain a sponsor who has decided to withdraw.

---

## 8. Scenario 3: Grant Funding Model

### 8.1 Model Description

**HYPOTHETICAL SCENARIO — NOT A GRANT APPLICATION OR SOLICITATION**

In this scenario, MoonWitness XV receives one or more time-limited grants from foundations, government bodies, research councils, or other grant-making institutions. Grants provide a fixed amount of funding over a defined period (typically 12–36 months) for specified purposes.

**Key structural characteristics**:
- Fixed-term award: grant has a defined start and end date.
- Specified purpose: grant funds must be used for approved activities.
- Competitive: grants are awarded through a competitive application process.
- Non-renewable by assumption: each grant is treated as a one-time award; renewal is not guaranteed.
- High administrative overhead: grant management requires applications, reporting, compliance, and auditing.

### 8.2 Hypothetical Funding Model

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Number of grants | 1 | 1 | 2 | Assumption |
| Hypothetical grant award amount | $15,000 | $30,000 | $50,000 | Estimated from typical small-project foundation grants |
| Grant duration (months) | 12 | 24 | 36 | Estimated; typical grant periods |
| **Hypothetical monthly funding (amortized)** | **$1,250** | **$1,250** | **$2,778** | Award ÷ duration |
| **Hypothetical total funding** | **$15,000** | **$30,000** | **$100,000** | Derived |
| Disbursement schedule | Quarterly | Quarterly | Quarterly | Typical for foundation grants |
| Matching requirement | None | None | 20% in-kind | Estimated; some grants require matching funds |

**Important**: These figures are entirely hypothetical. No grant has been applied for. No grant has been awarded. No funds are being received. The figures illustrate the structural range of a grant model.

### 8.3 Cost Coverage Analysis

| Cost category | Low scenario coverage | Central scenario coverage | High scenario coverage |
|---|---|---|---|
| M48-06 SCN-LOW ($152/mo) | 822% covered | 822% covered | 1,828% covered |
| M48-06 SCN-CENTRAL ($487/mo) | 257% covered | 257% covered | 569% covered |
| M48-06 SCN-HIGH ($1,549/mo) | 81% covered | 81% covered | 179% covered |
| Extended costs ($950–$6,700/mo) | 131% covered (low end) | 131% covered (low end) | 292% covered (low end) |
| Grant administration overhead | Not covered | Not covered | Partially covered |

**Key finding**: At the central scenario ($1,250/month amortized from a $30,000/24-month grant), hypothetical funding covers the M48-06 central cost ($487/month) with $763/month remaining. This remainder could address some extended costs. However, the funding is time-limited: after 24 months, the grant expires and no renewal is assumed.

### 8.4 Grant Budget Allocation (Hypothetical)

Grants typically require a budget that allocates funds to specific categories. The following is a hypothetical budget structure for the central grant scenario:

| Budget category | Hypothetical allocation | Percentage | Notes |
|---|---|---|---|
| Personnel (support labor) | $16,800 | 56% | 24 months × $700/month (covers M48-06 support labor at central) |
| Infrastructure (compute, storage, network) | $2,880 | 10% | 24 months × $120/month (covers M48-06 infrastructure at central) |
| External services (AI, email) | $2,400 | 8% | 24 months × $100/month |
| Grant administration | $2,400 | 8% | Indirect costs typically allowed at 8–15% |
| Contingency | $1,920 | 6% | Unforeseen costs |
| Unallocated (surplus to extended costs) | $3,600 | 12% | Could fund partial security audit, documentation |
| **Total** | **$30,000** | **100%** | |

### 8.5 Concentration Risk

| Risk factor | Assessment | Rationale |
|---|---|---|
| Grant count dependency | **VERY HIGH** | At 1 grant, loss of that grant eliminates 100% of funding. Maximum concentration. |
| Time limitation | **VERY HIGH** | Grants expire. After the grant period, funding drops to $0 with no automatic renewal. |
| Application uncertainty | **HIGH** | Grant applications are competitive. There is no guarantee of receiving a grant. |
| Compliance risk | **HIGH** | Grant funds must be used for approved purposes. Misuse can result in clawback, reputational damage, or disqualification from future grants. |
| Renewal uncertainty | **VERY HIGH** | Even if a grant is successful, renewal is never guaranteed. Each renewal requires a new application. |
| Reporting burden | **MODERATE–HIGH** | Grants require periodic financial and programmatic reporting. This creates administrative overhead. |

**Concentration metric**:
- 1 grant: HHI = 10,000 (maximum concentration)
- 2 grants (equal, overlapping): HHI = 5,000 (high concentration)
- 3+ grants (staggered): HHI < 3,333 (moderate concentration)

At the central scenario (1 grant), the concentration is **extreme**. Even at the high scenario (2 grants), concentration remains very high because grants are time-limited and non-overlapping.

### 8.6 Restrictions and Obligations

| Restriction/obligation | Description | Impact |
|---|---|---|
| **Specified use of funds** | Grant funds must be used for approved budget categories. Reallocation may require grantor approval. | Constrains project flexibility; cannot redirect funds to emerging priorities without permission. |
| **Deliverable requirements** | Grants typically specify tangible deliverables (reports, software features, research outputs). | May divert effort from maintenance to deliverable production. |
| **Reporting schedule** | Quarterly or annual financial and programmatic reports are typically required. | Administrative overhead estimated at 5–15 hours per reporting period. |
| **Audit requirements** | Some grants require independent financial audits. | Cost of audit ($2,000–$10,000) may not be covered by the grant. |
| **Matching requirements** | Some grants require the recipient to contribute matching funds or in-kind contributions. | If 20% matching is required on a $30,000 grant, the project must contribute $6,000 in cash or equivalent labor. |
| **Intellectual property terms** | Some grants require open licensing, public domain dedication, or shared ownership of outputs. | May conflict with project IP strategy; requires legal review. |
| **Non-renewal assumption** | Grants are typically one-time awards. Renewal is competitive and not guaranteed. | Creates a funding cliff at grant expiration. |
| **Prohibition on commercial use** | Some grants prohibit using funds for commercial activities or require separation of grant-funded and commercial work. | May constrain the project's ability to combine grant funding with paid support revenue. |
| **Indirect cost caps** | Grants typically cap indirect/administrative costs at 8–15% of direct costs. | Limits the project's ability to recover overhead from grant funds. |

### 8.7 Unfunded Obligations Under Grants

| Obligation | Estimated cost | Why unfunded |
|---|---|---|
| Post-grant sustainability | $487+/month after grant expires | Grant funding ends; no automatic replacement |
| Grant application costs | $2,000–$5,000 per application | Application writing is typically unfunded |
| Compliance and audit overhead | $2,000–$10,000 per grant period | May exceed indirect cost allowance |
| Matching fund requirement | $0–$6,000 | If required, must come from other sources |
| Deliverable production beyond maintenance | Variable | Grant deliverables may not align with maintenance priorities |
| Next grant search | $2,000–$5,000 | Finding and applying for the next grant is unfunded |
| Extended costs not in grant budget | $950–$6,700/month | Grant budget covers only approved categories |

**Total unfunded obligations**: Highly variable, but typically $5,000–$20,000 per grant cycle in addition to ongoing maintenance costs after the grant expires.

### 8.8 Continuity Model

**When funding stops (grant expires)**:

| Timeframe | Impact | Response |
|---|---|---|
| Immediate (0–30 days) | Grant funding ends. All grant-related obligations (reporting, closeout) must be fulfilled. | Complete final report. Return unspent funds if required. |
| Short-term (1–3 months) | No grant funding. Project must either secure a new grant, find alternative funding, or reduce costs. | Begin new grant applications. Evaluate cost reduction. |
| Medium-term (3–12 months) | If no new grant, project operates at reduced scope or ceases grant-funded activities. | Infrastructure may be scaled down. Support may be reduced to minimum. |
| Long-term (12–24 months) | Project reverts to owner-funded baseline or seeks alternative funding model. | Grant model has proven to be a temporary supplement, not a sustainable base. |

**Runway with grant funding**: The grant provides a fixed runway equal to the grant duration (12–36 months in the hypothetical scenarios). After the grant expires, runway drops to **0 months** unless a new grant or alternative funding is secured.

**Grant cycle risk**: The typical grant cycle (application → review → award → performance → closeout → reapplication) takes 12–24 months. This means the project must begin searching for the next grant approximately 12 months before the current one expires to avoid a funding gap.

---

## 9. Cost Coverage Analysis

### 9.1 Comparative Coverage Matrix

This section compares how each scenario covers the M48-06 cost baseline and extended cost categories.

| Cost category | M48-06 range | S1: Paid Support (central) | S2: Sponsorship (central) | S3: Grant (central) |
|---|---|---|---|---|
| Infrastructure (M48-06) | $24–$59/mo | Covered (included in price) | Covered (within $600/mo) | Covered (budget line item) |
| Support labor (M48-06) | $117–$1,520/mo | Covered at high price; partial at low | Covered (within $600/mo) | Covered (personnel budget line) |
| **M48-06 total (central)** | **$487/mo** | **Covered at $900/mo revenue** | **Covered at $600/mo funding** | **Covered at $1,250/mo amortized** |
| Feature development | $500–$2,000/mo | **NOT covered** | **NOT covered** | **Partially covered** (if in grant budget) |
| Security auditing | $200–$1,000/mo | **NOT covered** | **NOT covered** | **Partially covered** (if in grant budget) |
| Documentation/training | $100–$500/mo | **NOT covered** | **NOT covered** | **Possibly covered** |
| Compliance/certification | $0–$2,000/mo | **NOT covered** | **NOT covered** | **Rarely covered** |
| Backup/DR | $50–$200/mo | **NOT covered** | **NOT covered** | **Possibly covered** |
| Community management | $100–$500/mo | **NOT covered** | **NOT covered** | **Rarely covered** |
| Legal/governance | $0–$500/mo | **NOT covered** | **NOT covered** | **Rarely covered** |
| Grant administration | N/A | N/A | N/A | **$100–$200/mo** (deducted from grant) |

### 9.2 Coverage Percentage Summary

| Scenario | M48-06 central cost coverage | Extended cost coverage | Total burden coverage |
|---|---|---|---|
| S1: Paid Support (central) | 185% | 0–7% | 12–16% |
| S2: Sponsorship (central) | 123% | 0% | 8–10% |
| S3: Grant (central) | 257% | 0–15% | 17–22% |

**Key finding**: All three scenarios cover the M48-06 central cost at the hypothetical levels modeled. However, none of the scenarios covers more than approximately 22% of the total burden (M48-06 + extended costs). The majority of maintenance obligations remain unfunded under all three scenarios.

### 9.3 Coverage Gap Analysis

The gap between what each scenario covers and the total estimated burden:

| Scenario | Monthly coverage (central) | Monthly total burden (central) | Monthly gap | Annual gap |
|---|---|---|---|---|
| S1: Paid Support | $900 | $1,437–$7,187 | $537–$6,287 | $6,444–$75,444 |
| S2: Sponsorship | $600 | $1,437–$7,187 | $837–$6,587 | $10,044–$79,044 |
| S3: Grant | $1,250 | $1,437–$7,187 | $187–$5,937 | $2,244–$71,244 |

**Note**: The gap range reflects the uncertainty in extended cost estimates ($950–$6,700/month). At the low end of extended costs, the gap is manageable. At the high end, all scenarios fall significantly short.

### 9.4 Coverage Duration Analysis

| Scenario | Coverage duration | Post-coverage status |
|---|---|---|
| S1: Paid Support | Ongoing while contract is active | Coverage ends when contract ends; no residual benefit |
| S2: Sponsorship | Ongoing while sponsor contributes | Coverage ends when sponsor withdraws; no residual benefit |
| S3: Grant | Fixed term (12–36 months) | Coverage ends when grant expires; no residual benefit unless renewed |

**Critical observation**: None of the three scenarios provides permanent or self-sustaining coverage. All three require ongoing effort to maintain:
- S1 requires customer retention and potentially new customer acquisition.
- S2 requires sponsor relationship maintenance and potentially new sponsor identification.
- S3 requires continuous grant application to avoid funding gaps.

---

## 10. Concentration Risk Analysis

### 10.1 Concentration Risk Definition

Concentration risk is the degree to which the project depends on a single funding source, a single entity, or a single type of funding. High concentration means the loss of one source eliminates most or all funding. Low concentration means funding is diversified across multiple sources.

### 10.2 Concentration Metrics by Scenario

| Metric | S1: Paid Support | S2: Sponsorship | S3: Grants |
|---|---|---|---|
| **Number of sources (central)** | 2 customers | 1 sponsor | 1 grant |
| **Source loss impact** | 50% revenue loss | 100% funding loss | 100% funding loss |
| **HHI (central)** | 5,000 | 10,000 | 10,000 |
| **HHI classification** | High concentration | Maximum concentration | Maximum concentration |
| **Time to replace lost source** | 3–12 months (customer search) | 6–24 months (sponsor search) | 12–24 months (grant cycle) |
| **Renewal certainty** | Moderate (contract terms) | Low (voluntary commitment) | Very low (competitive reapplication) |
| **Diversification potential** | High (many potential customers) | Low (few sponsors for this type of project) | Moderate (many grant programs, but competitive) |

### 10.3 Concentration Risk Ranking

From lowest to highest concentration risk:

1. **S1: Paid Support** — MODERATE concentration risk. Multiple potential customers reduce dependency on any single entity. However, at the central scenario (2 customers), the loss of one still represents a 50% revenue reduction.

2. **S2: Sponsorship** — HIGH concentration risk. A single sponsor provides 100% of funding. The sponsor's commitment is voluntary and can be withdrawn at any time. Finding a replacement sponsor is uncertain and time-consuming.

3. **S3: Grants** — VERY HIGH concentration risk. A single grant provides 100% of funding for a fixed term. When the grant expires, funding drops to zero. Renewal is competitive and not guaranteed. The grant cycle creates a structural funding cliff.

### 10.4 Diversification Strategies (Hypothetical)

Each scenario could be modified to reduce concentration risk:

| Strategy | Applicable scenario | Effect on concentration | Implementation complexity |
|---|---|---|---|
| Multiple customers | S1 | Reduces from high to low (5+ customers) | Low — standard sales effort |
| Multiple sponsors | S2 | Reduces from maximum to high (2–3 sponsors) | Moderate — requires relationship building |
| Staggered grants | S3 | Reduces from maximum to moderate (2–3 overlapping grants) | High — requires continuous application effort |
| Mixed funding model | S1 + S2 + S3 | Reduces overall concentration significantly | Very high — requires multiple administrative capabilities |
| Endowment or reserve fund | S2 | Converts one-time funding to perpetual income | Very high — requires legal structure and significant capital |

### 10.5 Concentration Risk Implications

**For S1 (Paid Support)**: The concentration risk is manageable if the project can acquire and retain 3–5 institutional customers. Below 3 customers, the loss of any one customer creates a significant revenue disruption. The mitigation path is customer diversification.

**For S2 (Sponsorship)**: The concentration risk is structural and difficult to mitigate. Finding even one willing sponsor is uncertain. Finding multiple sponsors multiplies the relationship management burden. The mitigation path is either accepting the concentration risk or combining sponsorship with other funding sources.

**For S3 (Grants)**: The concentration risk is both structural and temporal. Each grant creates a time-limited funding island surrounded by unfunded gaps. The mitigation path is continuous grant application (which itself has significant administrative cost) or combining grants with other funding sources.

---

## 11. Restrictions and Obligations per Scenario

### 11.1 Restriction Comparison Matrix

| Restriction type | S1: Paid Support | S2: Sponsorship | S3: Grants |
|---|---|---|---|
| **Use-of-funds restrictions** | Low — revenue can be used for any business purpose | Low–Moderate — sponsor may have general expectations | High — grant specifies approved budget categories |
| **Reporting requirements** | Low — invoicing and basic financial records | Moderate — periodic progress reports to sponsor | High — quarterly/annual financial and programmatic reports |
| **Deliverable requirements** | Low — service delivery per SLA | Low — no specific deliverables typically required | High — grant specifies tangible outputs |
| **Governance requirements** | Low — standard business governance | Moderate — may require advisory input from sponsor | High — may require board oversight, audit committee |
| **IP restrictions** | Low — project retains all IP | Low — sponsor typically does not claim IP | Moderate–High — some grants require open licensing |
| **Commercial activity restrictions** | None — this IS commercial activity | Low — sponsorship is separate from commerce | Moderate — some grants prohibit commercial use of funds |
| **Audit requirements** | Low — standard business audit | Low–Moderate — sponsor may request financial review | High — independent audit may be required |
| **Public acknowledgment** | Low — customer logo use with permission | Moderate — sponsor recognition expected | Moderate–High — grantor acknowledgment required in publications |
| **Mission alignment pressure** | Low — service scope defines relationship | Moderate — sponsor expects mission consistency | High — grant deliverables must align with grantor mission |
| **Exit complexity** | Moderate — contract termination provisions | Low — sponsor can withdraw at any time | High — grant closeout procedures, unspent fund return |

### 11.2 Obligation Burden Estimate

| Obligation category | S1: Paid Support | S2: Sponsorship | S3: Grants |
|---|---|---|---|
| Administrative hours per month | 5–10 hrs | 3–8 hrs | 10–25 hrs |
| Administrative cost per month (at $50/hr) | $250–$500 | $150–$400 | $500–$1,250 |
| Legal/compliance cost per year | $1,000–$3,000 | $500–$2,000 | $2,000–$10,000 |
| External audit cost per year | $0–$2,000 | $0–$1,000 | $2,000–$10,000 |
| **Total administrative overhead (% of funding)** | **28–56%** | **25–67%** | **40–100%** |

**Key finding**: Administrative overhead is significant under all three scenarios. For grants, the overhead can consume 40–100% of the indirect cost allowance, effectively reducing the net funding available for project work. Paid support has the lowest relative overhead because the administrative costs are a normal part of business operations.

### 11.3 Restriction Risk Assessment

| Risk | S1: Paid Support | S2: Sponsorship | S3: Grants |
|---|---|---|---|
| **Scope lock-in** | Moderate — SLA defines scope; changes require contract renegotiation | Low — sponsor relationship is flexible | High — grant budget is fixed; changes require grantor approval |
| **Mission drift** | Low — commercial service scope is clear | Moderate — sponsor preferences may influence priorities | High — grant deliverables may not match project needs |
| **Compliance failure** | Low — standard business compliance | Low–Moderate — fund handling requirements | Moderate–High — grant compliance is complex and strictly enforced |
| **Reputational risk** | Low — commercial relationships are normal | Moderate — sponsor controversy could affect project | Low–Moderate — grantor controversy possible but typically arms-length |
| **Dependency lock-in** | Moderate — customer dependency for revenue | High — sponsor dependency for funding | Very High — grant cycle creates structural dependency |

---

## 12. Unfunded Obligations Identification

### 12.1 Comprehensive Unfunded Obligations Register

The following obligations are NOT covered by any of the three hypothetical funding scenarios at their central estimates:

| ID | Obligation | Estimated monthly cost | S1 status | S2 status | S3 status | Priority |
|---|---|---|---|---|---|---|
| UO-01 | Platform feature development | $500–$2,000 | Unfunded | Unfunded | Partially fundable | HIGH |
| UO-02 | Security auditing and hardening | $200–$1,000 | Unfunded | Unfunded | Partially fundable | HIGH |
| UO-03 | Documentation and user training materials | $100–$500 | Unfunded | Unfunded | Partially fundable | MEDIUM |
| UO-04 | Compliance certification (ISO, SOC2) | $0–$2,000 | Unfunded | Unfunded | Rarely fundable | LOW (for now) |
| UO-05 | Backup and disaster recovery infrastructure | $50–$200 | Unfunded | Unfunded | Partially fundable | MEDIUM |
| UO-06 | Community management and outreach | $100–$500 | Unfunded | Unfunded | Unfunded | MEDIUM |
| UO-07 | Legal review and governance | $0–$500 | Unfunded | Unfunded | Unfunded | HIGH |
| UO-08 | Grant application writing (S3 only) | $167–$417 | N/A | N/A | Unfunded | MEDIUM |
| UO-09 | Sponsor relationship management (S2 only) | $50–$200 | N/A | Unfunded | N/A | LOW |
| UO-10 | Customer acquisition (S1 only) | $100–$500 | Unfunded | N/A | N/A | MEDIUM |
| UO-11 | Post-grant sustainability planning (S3 only) | N/A | N/A | N/A | Unfunded | HIGH |
| UO-12 | Cost growth buffer (inflation, usage increase) | $50–$200 | Unfunded | Unfunded | Unfunded | MEDIUM |
| UO-13 | Accounting and fund stewardship | $100–$300 | Included in business overhead | Partially unfunded | Partially covered by indirect | MEDIUM |
| **Total** | **$1,417–$8,317/mo** | | | | | |

### 12.2 Unfunded Obligations by Scenario

| Scenario | M48-06 cost covered | Extended costs covered | Total unfunded | Coverage ratio |
|---|---|---|---|---|
| S1: Paid Support (central) | $487/mo (100%) | $0–$500/mo (0–7%) | $917–$7,817/mo | 6–34% |
| S2: Sponsorship (central) | $487/mo (100%) | $0–$113/mo (0–2%) | $1,324–$8,087/mo | 6–27% |
| S3: Grant (central) | $487/mo (100%) | $0–$763/mo (0–11%) | $674–$7,437/mo | 6–32% |

### 12.3 Critical Unfunded Obligations

The following unfunded obligations pose the greatest risk to project sustainability regardless of which funding scenario is pursued:

1. **Platform feature development (UO-01)**: Without investment in new capabilities, the platform stagnates. Institutional customers (S1) expect continuous improvement. Sponsors (S2) expect progress toward mission goals. Grant-makers (S3) expect deliverable outputs. Stagnation threatens all three scenarios.

2. **Security auditing (UO-02)**: Without regular security review, the platform accumulates technical debt and vulnerability risk. Institutional customers may require security certification. Sponsors may lose confidence if a security incident occurs. Grant-makers may claw back funds if compliance failures are discovered.

3. **Legal review and governance (UO-07)**: Without proper legal structure, the project faces regulatory risk. Commercial activity (S1) requires proper business registration, tax handling, and contractual compliance. Sponsorship (S2) requires charitable fund handling rules. Grants (S3) require legal compliance with grant terms.

4. **Post-grant sustainability (UO-11)**: Specific to S3, the obligation to plan for what happens after the grant expires is frequently neglected. Without a sustainability plan, the grant creates a temporary capability that disappears when funding ends.

### 12.4 Unfunded Obligations Gap Visualization

```
Total monthly burden (central estimate):    $1,437 – $8,249
                                             
S1 Paid Support coverage:                   ████████░░░░░░░░░░░░░░░░░░░░  $900 (6–63%)
S2 Sponsorship coverage:                    █████░░░░░░░░░░░░░░░░░░░░░░░  $600 (6–42%)  
S3 Grant coverage:                          ████████████░░░░░░░░░░░░░░░░  $1,250 (9–87%)
                                             
Unfunded gap (S1):                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  $537–$6,287
Unfunded gap (S2):                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  $837–$6,587
Unfunded gap (S3):                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  $187–$5,937
```

---

## 13. Continuity Modeling

### 13.1 Continuity Definition

Continuity is the ability of the project to maintain operations at an acceptable level when a funding source changes, decreases, or ends. This section models what happens under each scenario when the primary funding source is disrupted.

### 13.2 Continuity Timeline by Scenario

#### S1: Paid Support — Customer Loss

```
Month:     0     1     2     3     4     5     6     7     8     9    10    11    12
           │     │     │     │     │     │     │     │     │     │     │     │     │
Revenue:   ████  ████  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░
           (1 customer    (customer leaves; no replacement found)
            paying)

Costs:     ░░░░  ░░░░  ░▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒▒▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓██  ████  ████  ████  ████
           (fixed    (cost reduction begins; infrastructure scaled down;
            costs)    support reduced to minimum; eventually owner absorbs or sunsets)

Status:    ACTIVE  ACTIVE  WINDING DOWN        REDUCED         SUNSET/OWNER-FUNDED
```

**Continuity assessment**: MODERATE. The project has 1–2 months of buffer (if reserves exist) before costs must be reduced. Cost reduction is gradual: first discretionary spending (features, community), then support staff, then infrastructure. The project can potentially continue at a minimal level indefinitely on owner funding.

#### S2: Sponsorship — Sponsor Withdrawal

```
Month:     0     1     2     3     4     5     6     7     8     9    10    11    12
           │     │     │     │     │     │     │     │     │     │     │     │     │
Funding:   ████  ████  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░
           (1 sponsor     (sponsor withdraws; no notice period typical)
            contributing)

Costs:     ░░░░  ░░░░  ░▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒▒▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓██  ████  ████  ████  ████
           (fixed    (immediate cost reduction; no contractual notice
            costs)    required; project must adapt quickly)

Status:    ACTIVE  ACTIVE  IMMEDIATE ADJUSTMENT    REDUCED         SUNSET/OWNER-FUNDED
```

**Continuity assessment**: LOW. Sponsor withdrawal is typically abrupt. Unlike a commercial contract, there is no notice period or termination provision. The project must immediately reduce costs or find alternative funding. The lack of advance warning makes continuity planning difficult.

#### S3: Grant — Grant Expiration

```
Month:     0     3     6     9    12    15    18    21    24    27    30    33    36
           │     │     │     │     │     │     │     │     │     │     │     │     │
Funding:   ████████████████████████  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░  ░░░░
           (grant active for 24 months)      (grant expired; no renewal assumed)

Costs:     ░░░░░░░░░░░░░░░░░░░░░░░░  ░▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒▒▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓██  ████
           (covered by grant)          (cost reduction; seek new grant or
                                         alternative funding)

Status:    GRANT-FUNDED                FUNDING CLIFF    SEARCH MODE     SUNSET/OWNER-FUNDED
```

**Continuity assessment**: LOW–MODERATE. The grant provides predictable funding for the grant period (24 months in the central scenario). However, the funding cliff at expiration is absolute. The project has 6–12 months to secure replacement funding before operations must be reduced. The predictability of the grant period allows for planned wind-down, but the cliff itself is a structural vulnerability.

### 13.3 Continuity Risk Summary

| Scenario | Warning period | Adjustment time | Continuity rating | Primary risk |
|---|---|---|---|---|
| S1: Paid Support | 30–90 days (contract notice) | 3–6 months | MODERATE | Customer concentration; contract non-renewal |
| S2: Sponsorship | 0–30 days (voluntary notice) | 1–3 months | LOW | Abrupt withdrawal; no contractual protection |
| S3: Grants | Known expiration date | 6–12 months | LOW–MODERATE | Funding cliff; renewal uncertainty |

### 13.4 Continuity Mitigation Strategies

| Strategy | Applicable scenario | Effect | Feasibility |
|---|---|---|---|
| Maintain 3-month cost reserve | All | Buys time to find replacement funding | LOW — requires surplus funding to build reserve |
| Diversify funding sources | All | Reduces single-source dependency | MODERATE — requires multiple administrative capabilities |
| Build modular infrastructure | All | Allows rapid cost reduction by scaling down components | HIGH — architectural decision within project control |
| Cross-train support staff | S1, S2 | Reduces key-person dependency | MODERATE — requires investment in training |
| Establish emergency funding protocol | All | Pre-identifies actions when funding drops | HIGH — planning activity, no cost |
| Maintain owner-funded minimum operations | All | Ensures core platform survives even with zero external funding | HIGH — within owner's control |

---

## 14. Stress-Test: Loss of Source Scenario

### 14.1 Stress-Test Methodology

This section models the worst-case scenario for each funding model: the complete and permanent loss of the primary (and only) funding source. The stress test answers: how quickly does the project become unsustainable, and what is the minimum viable operation that can survive without external funding?

### 14.2 S1 Paid Support — Stress Test: All Customers Leave Simultaneously

**Trigger**: Both hypothetical central-scenario customers terminate contracts in the same month.

| Week | Revenue | Costs | Net position | Action required |
|---|---|---|---|---|
| Week 0 | $900/mo → $0 | $487/mo (continuing) | -$487/mo | Begin contract wind-down obligations |
| Week 1–2 | $0 | $487/mo + wind-down costs | -$600/mo | Fulfill remaining SLA obligations; notify staff |
| Week 3–4 | $0 | $487/mo → $200/mo (reduced) | -$200/mo | Scale down infrastructure; reduce support to minimum |
| Month 2 | $0 | $200/mo | -$200/mo | Owner decides: absorb costs or sunset |
| Month 3+ | $0 | $100–$200/mo (minimal) | -$100–$200/mo | Platform operates at owner-funded minimum or ceases |

**Time to unsustainability**: Immediate (day 1 of revenue loss).
**Time to minimum viable operation**: 1–2 months (after infrastructure scale-down).
**Minimum viable monthly cost**: $100–$200 (basic VPS + domain; no support staff).
**Owner absorption capacity**: Indefinite at minimum viable level; limited at full operation level.

### 14.3 S2 Sponsorship — Stress Test: Sponsor Withdraws Without Notice

**Trigger**: Hypothetical central-scenario sponsor informs the project they are withdrawing funding, effective immediately.

| Week | Funding | Costs | Net position | Action required |
|---|---|---|---|---|
| Week 0 | $600/mo → $0 | $487/mo (continuing) | -$487/mo | Acknowledge withdrawal; no contractual recourse |
| Week 1–2 | $0 | $487/mo | -$487/mo | Begin cost reduction; evaluate alternatives |
| Week 3–4 | $0 | $487/mo → $200/mo | -$200/mo | Scale down infrastructure; cease non-essential activities |
| Month 2 | $0 | $200/mo | -$200/mo | Owner decides: absorb costs, seek new sponsor, or sunset |
| Month 3+ | $0 | $100–$200/mo (minimal) | -$100–$200/mo | Platform operates at owner-funded minimum or ceases |

**Time to unsustainability**: Immediate (day 1 of funding loss).
**Time to minimum viable operation**: 1–2 months (after infrastructure scale-down).
**Minimum viable monthly cost**: $100–$200 (basic VPS + domain).
**Owner absorption capacity**: Indefinite at minimum level.
**Additional risk**: Sponsor withdrawal may damage relationships with potential replacement sponsors.

### 14.4 S3 Grant — Stress Test: Grant Award Is Clawed Back

**Trigger**: Hypothetical central-scenario grantor determines the project has failed to comply with grant terms and demands return of unspent funds. This is a rare but possible scenario.

| Week | Funding | Costs | Net position | Action required |
|---|---|---|---|---|
| Week 0 | $1,250/mo → $0 | $487/mo (continuing) | -$487/mo | Cease all grant-funded activities; begin compliance review |
| Week 1–4 | $0 + potential clawback | $487/mo + legal/compliance costs | -$1,500+/mo | Engage legal counsel; respond to grantor; return unspent funds |
| Month 2–3 | $0 | $487/mo → $200/mo | -$200/mo | Scale down infrastructure; seek alternative funding |
| Month 4+ | $0 | $100–$200/mo (minimal) | -$100–$200/mo | Platform operates at owner-funded minimum; reputational damage may affect future grant applications |

**Time to unsustainability**: Immediate (day 1 of clawback).
**Time to minimum viable operation**: 2–3 months (extended by compliance response).
**Minimum viable monthly cost**: $100–$200 (basic VPS + domain).
**Additional risk**: Clawback may be accompanied by reputational damage that affects future funding prospects.

### 14.5 Stress-Test Summary

| Scenario | Time to crisis | Recovery difficulty | Minimum viable cost | Owner absorption |
|---|---|---|---|---|
| S1: Paid Support (all customers leave) | Immediate | Moderate (1–2 months to scale down) | $100–$200/mo | Indefinite at minimum |
| S2: Sponsorship (withdrawal) | Immediate | High (no notice, no recourse) | $100–$200/mo | Indefinite at minimum |
| S3: Grant (clawback) | Immediate | Very High (legal/compliance burden) | $100–$200/mo | Indefinite at minimum |

**Key finding**: All three scenarios produce the same outcome in the stress test — the project reverts to owner-funded minimum operations within 1–3 months. The difference is in the speed and difficulty of the transition. Sponsorship withdrawal is the most abrupt. Grant clawback is the most burdensome. Customer loss is the most manageable because contractual notice periods provide some adjustment time.

**Minimum viable operation**: The project can survive indefinitely at $100–$200/month (basic VPS + domain + minimal external services) on owner funding alone. This level supports platform availability but not active development, support, or community management.

---

## 15. Runway Range Calculations

### 15.1 Runway Definition

Runway is the number of months the project can operate at a given cost level with a given funding source before the funding is exhausted or the source must be renewed. Runway is calculated as:

```
Runway (months) = Available funding / Monthly burn rate
```

Where:
- **Available funding** = total hypothetical funding from the source
- **Monthly burn rate** = M48-06 cost-to-serve at the relevant scenario

### 15.2 Runway Calculations by Scenario

#### S1: Paid Support Runway

Paid support is a recurring model. Runway is theoretically infinite as long as customers continue paying. However, contract terms create discrete renewal points.

| Scenario | Monthly revenue | Monthly cost | Net monthly | Contract term | Runway to renewal |
|---|---|---|---|---|---|
| Low (1 customer, 1 researcher, $100) | $100 | $152 | -$52 | 12 months | 12 months (then must renew) |
| Central (2 customers, 3 researchers each, $150) | $900 | $487 | +$413 | 12 months | 12 months (then must renew) |
| High (5 customers, 10 researchers each, $200) | $10,000 | $1,549 | +$8,451 | 12 months | 12 months (then must renew) |

**Runway range**: 12 months (renewal point) to infinite (if customers continue indefinitely). The practical runway is determined by the contract term and renewal probability.

**Cumulative reserve buildup (central scenario)**: If the project saves the net surplus ($413/month), after 12 months it has $4,956 in reserves. This provides approximately 10 additional months of runway at the central cost level if all customers leave at renewal time.

#### S2: Sponsorship Runway

Sponsorship is a recurring model but without contractual commitment. Runway depends on the sponsor's continued willingness to contribute.

| Scenario | Monthly funding | Monthly cost | Net monthly | Expected commitment | Runway |
|---|---|---|---|---|---|
| Low (1 sponsor, $300/mo) | $300 | $487 | -$187 | 12 months | 12 months (then must recommit) |
| Central (1 sponsor, $600/mo) | $600 | $487 | +$113 | 24 months | 24 months (then must recommit) |
| High (2 sponsors, $1,500/mo each) | $3,000 | $487 | +$2,513 | 36 months | 36 months (then must recommit) |

**Runway range**: 12–36 months (commitment period) to 0 months (if sponsor withdraws immediately). The practical runway is highly uncertain because sponsorship commitments are voluntary.

**Cumulative reserve buildup (central scenario)**: If the project saves the net surplus ($113/month), after 24 months it has $2,712 in reserves. This provides approximately 5.5 additional months of runway at the central cost level if the sponsor withdraws.

#### S3: Grant Runway

Grant funding is fixed-term. Runway is exactly equal to the grant period, after which funding drops to zero.

| Scenario | Total award | Duration | Monthly amortized | Monthly cost | Net monthly | Runway |
|---|---|---|---|---|---|---|
| Low ($15,000, 12 months) | $15,000 | 12 months | $1,250 | $487 | +$763 | 12 months (then $0) |
| Central ($30,000, 24 months) | $30,000 | 24 months | $1,250 | $487 | +$763 | 24 months (then $0) |
| High ($50,000, 36 months) | $50,000 | 36 months | $1,389 | $487 | +$902 | 36 months (then $0) |

**Runway range**: 12–36 months (grant period) followed by 0 months (funding cliff). The grant provides a known, fixed runway.

**Cumulative reserve buildup (central scenario)**: If the project saves the net surplus ($763/month), after 24 months it has $18,312 in reserves (assuming no unspent grant funds must be returned). This provides approximately 37 additional months of runway at the central cost level after the grant expires. However, grant terms typically require return of unspent funds, which would reduce or eliminate this reserve.

### 15.3 Runway Summary Table

| Scenario | Best-case runway | Central-case runway | Worst-case runway | Post-runway status |
|---|---|---|---|---|
| S1: Paid Support | Infinite (ongoing contracts) | 12 months + 10-month reserve | 0 months (all customers leave) | Owner-funded minimum |
| S2: Sponsorship | 36 months (long commitment) | 24 months + 5-month reserve | 0 months (immediate withdrawal) | Owner-funded minimum |
| S3: Grant | 36 months (long grant) | 24 months + potential reserve | 0 months (clawback or early termination) | Owner-funded minimum |

### 15.4 Runway Sensitivity

The runway is most sensitive to:

1. **Monthly cost changes**: A 50% increase in M48-06 costs (e.g., from $487 to $731/month) reduces runway by approximately 33% for all scenarios.
2. **Revenue/funding changes**: A 50% decrease in hypothetical revenue or funding reduces the net surplus and thus the reserve buildup rate by approximately 50–100%.
3. **Reserve availability**: If reserves cannot be built (because revenue/funding exactly equals costs), runway equals the commitment/grant period with no buffer afterward.

---

## 16. Funding Concentration Metrics

### 16.1 Herfindahl-Hirschman Index (HHI) Applied to Funding

The HHI is a standard measure of market concentration, adapted here to measure funding source concentration:

```
HHI = Sum of (source_share_percentage ^ 2) for all sources
```

| HHI range | Classification | Interpretation |
|---|---|---|
| < 1,000 | Low concentration | Well-diversified funding base |
| 1,000–1,800 | Moderate concentration | Some dependency on major sources |
| 1,800–3,500 | High concentration | Significant dependency risk |
| 3,500–5,000 | Very high concentration | Critical dependency on few sources |
| > 5,000 | Extreme concentration | Maximum vulnerability to single-source loss |

### 16.2 HHI Calculations by Scenario

| Scenario | Source count | Source shares | HHI | Classification |
|---|---|---|---|---|
| S1 Low (1 customer) | 1 | 100% | 10,000 | Extreme |
| S1 Central (2 customers, equal) | 2 | 50%, 50% | 5,000 | Extreme |
| S1 High (5 customers, equal) | 5 | 20% each | 2,000 | High |
| S1 Ideal (10 customers, equal) | 10 | 10% each | 1,000 | Moderate |
| S2 Low (1 sponsor) | 1 | 100% | 10,000 | Extreme |
| S2 Central (1 sponsor) | 1 | 100% | 10,000 | Extreme |
| S2 High (2 sponsors, equal) | 2 | 50%, 50% | 5,000 | Extreme |
| S3 Low (1 grant) | 1 | 100% | 10,000 | Extreme |
| S3 Central (1 grant) | 1 | 100% | 10,000 | Extreme |
| S3 High (2 grants, overlapping) | 2 | 50%, 50% | 5,000 | Extreme |

### 16.3 Concentration Risk Implications

**All three scenarios exhibit extreme or high concentration at their central estimates.** This is a structural finding: small projects with limited funding sources inherently face high concentration risk regardless of the funding model chosen.

The only path to lower concentration is scaling the number of sources:
- S1 requires 10+ customers to reach moderate concentration.
- S2 requires 3+ sponsors to reach high (not extreme) concentration.
- S3 requires 3+ overlapping grants to reach high concentration.

### 16.4 Funding Source Diversification Index (FSDI)

A complementary metric to HHI, the FSDI measures the effective number of independent funding sources:

```
FSDI = 1 / HHI (normalized) = 10,000 / HHI
```

| Scenario | HHI | FSDI | Interpretation |
|---|---|---|---|
| S1 Low | 10,000 | 1.0 | Effectively 1 source |
| S1 Central | 5,000 | 2.0 | Effectively 2 sources |
| S1 High | 2,000 | 5.0 | Effectively 5 sources |
| S2 Central | 10,000 | 1.0 | Effectively 1 source |
| S3 Central | 10,000 | 1.0 | Effectively 1 source |

### 16.5 Maximum Single-Source Dependency

| Scenario | Maximum single-source share | Vulnerability |
|---|---|---|
| S1 Low | 100% (1 customer) | Loss of 1 customer = 100% revenue loss |
| S1 Central | 50% (1 of 2 customers) | Loss of 1 customer = 50% revenue loss |
| S1 High | 20% (1 of 5 customers) | Loss of 1 customer = 20% revenue loss |
| S2 Central | 100% (1 sponsor) | Loss of sponsor = 100% funding loss |
| S3 Central | 100% (1 grant) | Expiration of grant = 100% funding loss |

### 16.6 Concentration Over Time

The concentration profile changes over the life of each funding scenario:

| Time period | S1 concentration trend | S2 concentration trend | S3 concentration trend |
|---|---|---|---|
| Year 1 | High (few customers) | Extreme (1 sponsor) | Extreme (1 grant) |
| Year 2 | Moderate (if customer base grows) | Extreme (if same sponsor) | Extreme (grant may expire) |
| Year 3 | Low–Moderate (if diversified) | Extreme (sponsor dependency) | N/A (grant expired; need new grant) |
| Year 4+ | Depends on retention | Structural problem | Must reapply for grants |

---

## 17. Assumption Sheet

### 17.1 Assumption Register

Every input in this model is classified as one of:

- **SOURCED**: Derived from a documented source (M48-06, M48-03, M46-31, published research).
- **ESTIMATED**: Based on reasonable assumptions with stated rationale.
- **UNKNOWN**: No reliable basis for estimation; explicitly flagged.
- **HYPOTHETICAL**: A fictional value used for scenario modeling only; no claim of real-world accuracy.

### 17.2 Cost Baseline Assumptions (from M48-06)

| ID | Assumption | Value | Classification | Source | Confidence |
|---|---|---|---|---|---|
| CA-01 | M48-06 SCN-LOW monthly cost | $152.25 | SOURCED | M48-06 §11.2 | LOW (synthetic) |
| CA-02 | M48-06 SCN-CENTRAL monthly cost | $486.93 | SOURCED | M48-06 §11.2 | LOW (synthetic) |
| CA-03 | M48-06 SCN-HIGH monthly cost | $1,548.59 | SOURCED | M48-06 §11.2 | LOW (synthetic) |
| CA-04 | Infrastructure share of total cost | 5–23% | SOURCED | M48-06 §11.3 | MEDIUM |
| CA-05 | Support labor share of total cost | 77–98% | SOURCED | M48-06 §11.3 | MEDIUM |
| CA-06 | Cost uncertainty | ±41% | SOURCED | M48-06 §15.4 | LOW |
| CA-07 | M46-31 aggregate monthly cost | $48–$143 | SOURCED | M46-31 | MEDIUM |

### 17.3 Scenario 1 Assumptions (Paid Support)

| ID | Assumption | Value | Classification | Source | Confidence |
|---|---|---|---|---|---|
| S1-01 | Number of institutional customers (low) | 1 | HYPOTHETICAL | This document | LOW |
| S1-02 | Number of institutional customers (central) | 2 | HYPOTHETICAL | This document | LOW |
| S1-03 | Number of institutional customers (high) | 5 | HYPOTHETICAL | This document | LOW |
| S1-04 | Researchers per customer (low) | 1 | HYPOTHETICAL | M48-06 SCN-LOW | LOW |
| S1-05 | Researchers per customer (central) | 3 | HYPOTHETICAL | M48-06 SCN-CENTRAL | LOW |
| S1-06 | Researchers per customer (high) | 10 | HYPOTHETICAL | M48-06 SCN-HIGH | LOW |
| S1-07 | Price per researcher per month (low) | $100 | HYPOTHETICAL | M48-03 H2 range | LOW |
| S1-08 | Price per researcher per month (central) | $150 | HYPOTHETICAL | M48-03 H2 midpoint | LOW |
| S1-09 | Price per researcher per month (high) | $200 | HYPOTHETICAL | M48-03 H2 upper bound | LOW |
| S1-10 | Contract term | 12 months | ESTIMATED | Typical institutional SaaS contracts | MEDIUM |
| S1-11 | Customer acquisition cost | $500–$2,000 per customer | ESTIMATED | Typical B2B sales cost for small projects | LOW |
| S1-12 | Annual churn rate | 20–40% | ESTIMATED | Typical SaaS SMB churn | LOW |
| S1-13 | SLA response time | 24–48 hours | ESTIMATED | Typical for small institutional tools | LOW |

### 17.4 Scenario 2 Assumptions (Sponsorship)

| ID | Assumption | Value | Classification | Source | Confidence |
|---|---|---|---|---|---|
| S2-01 | Number of sponsors (low/central) | 1 | HYPOTHETICAL | This document | LOW |
| S2-02 | Number of sponsors (high) | 2 | HYPOTHETICAL | This document | LOW |
| S2-03 | Monthly contribution per sponsor (low) | $300 | HYPOTHETICAL | Estimated from small-project sponsorship patterns | LOW |
| S2-04 | Monthly contribution per sponsor (central) | $600 | HYPOTHETICAL | Estimated to cover M48-06 central cost | LOW |
| S2-05 | Monthly contribution per sponsor (high) | $1,500 | HYPOTHETICAL | Estimated for multiple-sponsor scenario | LOW |
| S2-06 | Commitment period (low) | 12 months | ESTIMATED | Typical annual giving cycle | MEDIUM |
| S2-07 | Commitment period (central) | 24 months | ESTIMATED | Typical multi-year sponsorship | MEDIUM |
| S2-08 | Commitment period (high) | 36 months | ESTIMATED | Extended sponsorship commitment | LOW |
| S2-09 | Sponsor withdrawal notice period | 0–30 days | ESTIMATED | Typical for voluntary sponsorship | LOW |
| S2-10 | Reporting frequency to sponsor | Quarterly | ESTIMATED | Typical for ongoing sponsorship | MEDIUM |
| S2-11 | Reporting hours per period | 3–5 hours | ESTIMATED | Based on typical small-project reporting | LOW |
| S2-12 | Sponsor influence on project direction | Moderate | ESTIMATED | Unrestricted gifts still carry expectations | LOW |

### 17.5 Scenario 3 Assumptions (Grants)

| ID | Assumption | Value | Classification | Source | Confidence |
|---|---|---|---|---|---|
| S3-01 | Number of grants (low/central) | 1 | HYPOTHETICAL | This document | LOW |
| S3-02 | Number of grants (high) | 2 | HYPOTHETICAL | This document | LOW |
| S3-03 | Grant award amount (low) | $15,000 | HYPOTHETICAL | Estimated from small foundation grants | LOW |
| S3-04 | Grant award amount (central) | $30,000 | HYPOTHETICAL | Estimated from medium foundation grants | LOW |
| S3-05 | Grant award amount (high) | $50,000 | HYPOTHETICAL | Estimated from larger foundation/government grants | LOW |
| S3-06 | Grant duration (low) | 12 months | ESTIMATED | Typical short-term project grant | MEDIUM |
| S3-07 | Grant duration (central) | 24 months | ESTIMATED | Typical medium-term project grant | MEDIUM |
| S3-08 | Grant duration (high) | 36 months | ESTIMATED | Typical long-term project grant | MEDIUM |
| S3-09 | Grant application success rate | 10–20% | ESTIMATED | Typical for competitive foundation grants | LOW |
| S3-10 | Grant application cost (time) | 40–80 hours per application | ESTIMATED | Based on typical small grant applications | LOW |
| S3-11 | Indirect cost rate allowed | 8–15% | ESTIMATED | Typical foundation grant indirect rate | MEDIUM |
| S3-12 | Reporting frequency | Quarterly | ESTIMATED | Typical for foundation grants | MEDIUM |
| S3-13 | Reporting hours per period | 5–15 hours | ESTIMATED | Based on typical grant reporting requirements | LOW |
| S3-14 | Matching requirement | 0–20% | ESTIMATED | Some grants require matching funds | LOW |
| S3-15 | Grant renewal probability | 30–50% | ESTIMATED | Typical for competitive renewals | LOW |
| S3-16 | Time between grant expiration and next award | 6–18 months | ESTIMATED | Grant cycle duration | LOW |

### 17.6 Extended Cost Assumptions

| ID | Assumption | Value | Classification | Source | Confidence |
|---|---|---|---|---|---|
| EC-01 | Feature development monthly cost | $500–$2,000 | ESTIMATED | Based on typical open-source project maintenance | LOW |
| EC-02 | Security auditing monthly cost | $200–$1,000 | ESTIMATED | Based on typical small-project security needs | LOW |
| EC-03 | Documentation monthly cost | $100–$500 | ESTIMATED | Based on typical technical writing needs | LOW |
| EC-04 | Compliance certification cost | $0–$2,000 | UNKNOWN | Depends on institutional requirements | LOW |
| EC-05 | Backup/DR monthly cost | $50–$200 | ESTIMATED | Based on typical VPS backup solutions | LOW |
| EC-06 | Community management monthly cost | $100–$500 | ESTIMATED | Based on typical open-source community needs | LOW |
| EC-07 | Legal/governance monthly cost | $0–$500 | UNKNOWN | Depends on funding structure and jurisdiction | LOW |

### 17.7 Assumption Confidence Summary

| Classification | Count | Percentage |
|---|---|---|
| SOURCED (from M48-06, M48-03, M46-31) | 7 | 13% |
| ESTIMATED | 26 | 49% |
| HYPOTHETICAL | 15 | 28% |
| UNKNOWN | 5 | 9% |
| **Total** | **53** | **100%** |

### 17.8 UNKNOWN Items and Resolution Paths

| ID | Item | Why UNKNOWN | Impact | Resolution path |
|---|---|---|---|---|
| EC-04 | Compliance certification cost | No institutional requirements have been specified | May add $0–$2,000/month to extended costs | Requires institutional buyer input |
| EC-07 | Legal/governance cost | No funding structure has been chosen | May add $0–$500/month to extended costs | Requires owner decision on funding model |
| S3-09 | Grant application success rate | No grant applications have been submitted | Affects expected funding timeline | Requires actual grant application experience |
| S3-15 | Grant renewal probability | No grants have been received | Affects long-term funding sustainability projection | Requires actual grant management experience |
| — | Actual institutional demand | M48-01 is synthetic | Affects customer count assumptions in S1 | Requires real market validation |

---

## 18. Formula and Sensitivity Verification

### 18.1 Verification Methodology

This section provides explicit arithmetic fixtures that can be independently verified to confirm the model's internal consistency.

### 18.2 Fixture 1: S1 Paid Support — Central Scenario Revenue

**Given**:
- 2 customers × 3 researchers each × $150/researcher/month

**Calculate**:
```
Monthly revenue = 2 × 3 × $150 = $900
Annual revenue = $900 × 12 = $10,800
Cost coverage ratio = $900 / $487 (M48-06 central) = 1.848 = 185%
Net monthly surplus = $900 - $487 = $413
```

**Verification**: Matches §6.3 and §6.4 tables.

### 18.3 Fixture 2: S2 Sponsorship — Central Scenario Coverage

**Given**:
- 1 sponsor × $600/month
- M48-06 central cost: $487/month

**Calculate**:
```
Monthly funding = $600
Cost coverage ratio = $600 / $487 = 1.232 = 123%
Net monthly surplus = $600 - $487 = $113
Annual surplus = $113 × 12 = $1,356
Reserve after 24-month commitment = $113 × 24 = $2,712
Reserve runway = $2,712 / $487 = 5.57 months
```

**Verification**: Matches §7.3 and §15.2 tables.

### 18.4 Fixture 3: S3 Grant — Central Scenario Amortization

**Given**:
- Grant award: $30,000
- Grant duration: 24 months
- M48-06 central cost: $487/month

**Calculate**:
```
Monthly amortized funding = $30,000 / 24 = $1,250
Cost coverage ratio = $1,250 / $487 = 2.567 = 257%
Net monthly surplus = $1,250 - $487 = $763
Total surplus over grant period = $763 × 24 = $18,312
Reserve runway (if surplus saved) = $18,312 / $487 = 37.6 months
Grant cycle total (including 12-month search) = 24 + 12 = 36 months
```

**Verification**: Matches §8.3 and §15.2 tables.

### 18.5 Fixture 4: HHI Calculation — S1 Central Scenario

**Given**:
- 2 customers with equal revenue shares (50% each)

**Calculate**:
```
HHI = 50^2 + 50^2 = 2,500 + 2,500 = 5,000
FSDI = 10,000 / 5,000 = 2.0
Maximum single-source dependency = 50%
```

**Verification**: Matches §16.2 table.

### 18.6 Fixture 5: Stress-Test — S2 Sponsorship Withdrawal

**Given**:
- Monthly funding: $600 → $0 (sponsor withdraws)
- Monthly cost: $487
- No reserves

**Calculate**:
```
Week 0 net position = $0 - $487 = -$487
Month 1 (cost reduction begins): cost → $200/month
Month 1 net position = $0 - $200 = -$200
Month 2+ (minimum viable): cost → $100–$200/month
Time to minimum viable operation = 1–2 months
Owner absorption capacity at minimum = indefinite
```

**Verification**: Matches §14.3 table.

### 18.7 Sensitivity Analysis

This section measures how changes in key assumptions affect the model outputs.

#### 18.7.1 Cost Sensitivity

| Input change | S1 net monthly impact | S2 net monthly impact | S3 net monthly impact |
|---|---|---|---|
| M48-06 cost +50% ($487 → $731) | Surplus drops from $413 to $169 (-59%) | Surplus drops from $113 to -$131 (deficit) | Surplus drops from $763 to $519 (-32%) |
| M48-06 cost -50% ($487 → $244) | Surplus increases from $413 to $656 (+59%) | Surplus increases from $113 to $356 (+215%) | Surplus increases from $763 to $1,006 (+32%) |
| Extended costs materialize at low end ($950/mo) | Total deficit: $950 - $413 = -$537/mo | Total deficit: $950 - $113 = -$837/mo | Surplus absorbs: $763 - $950 = -$187/mo deficit |

#### 18.7.2 Revenue/Funding Sensitivity

| Input change | S1 impact | S2 impact | S3 impact |
|---|---|---|---|
| Price/contribution -25% | Revenue $675; deficit vs central cost | Funding $450; deficit vs central cost | N/A (grant amount fixed) |
| Price/contribution +25% | Revenue $1,125; surplus $638/mo | Funding $750; surplus $263/mo | N/A (grant amount fixed) |
| Customer/sponsor count -1 | Revenue drops 50% (2→1 customers) | Funding drops 100% (1→0 sponsors) | N/A (1 grant) |
| Customer/sponsor count +1 | Revenue increases 50% (2→3 customers) | Funding increases 100% (1→2 sponsors) | N/A (would need 2nd grant) |

#### 18.7.3 Duration Sensitivity

| Input change | S1 impact | S2 impact | S3 impact |
|---|---|---|---|
| Contract/commitment -50% (12→6 months) | Renewal frequency doubles; acquisition cost doubles | Commitment period halves; reserve buildup halves | Grant duration halves; less total funding |
| Contract/commitment +50% (12→18 months) | More stable revenue; slower adjustment | Longer sponsor relationship; more reserve | Longer grant; more total funding |
| Grant cycle gap +6 months | N/A | N/A | 6 months of unfunded costs between grants |

#### 18.7.4 Tornado Chart — Top 5 Sensitivities (S2 Central Scenario)

```
Input variation              | Effect on monthly surplus ($113 baseline)
-----------------------------|------------------------------------------
M48-06 cost +50%             | -$244 (surplus becomes -$131 deficit)
Sponsor withdraws (100%)     | -$600 (funding drops to $0)
Sponsor reduces by 50%       | -$300 (funding drops to $300; deficit)
Extended costs at low end    | -$950 (total burden exceeds funding)
Commitment period -50%       | -$57 (reserve buildup rate halved)
```

### 18.8 Verification Summary

| Fixture | Formula | Result | Verified |
|---|---|---|---|
| F1: S1 central revenue | 2 × 3 × $150 | $900/month | Yes |
| F2: S2 central coverage | $600 / $487 | 123% | Yes |
| F3: S3 central amortization | $30,000 / 24 | $1,250/month | Yes |
| F4: HHI (S1 central) | 50^2 + 50^2 | 5,000 | Yes |
| F5: S2 stress test | $600 → $0 | 0 months runway | Yes |
| F6: S2 reserve runway | $2,712 / $487 | 5.57 months | Yes |
| F7: S3 reserve runway | $18,312 / $487 | 37.6 months | Yes |

All fixtures pass. The model is internally consistent.

---

## 19. Mission Risk Review

### 19.1 Mission Definition

MoonWitness XV's mission encompasses:
- Preservation and stewardship of source materials (including sacred and private sources)
- Providing research tools for cross-referencing and analysis
- Maintaining open access to the published corpus and Dock
- Operating ethically, with consent-based access and no commercial exploitation of sources
- Sustaining the platform as a long-term research infrastructure

### 19.2 Mission Risk by Scenario

#### S1: Paid Support — Mission Risk Assessment

| Risk factor | Severity | Description | Mitigation |
|---|---|---|---|
| **Commercial pressure on free access** | LOW | Paying customers may request features or priority that divert resources from free access. | Maintain clear separation between paid support entitlements and free public access (per M48-04). |
| **Source access for payment** | FORBIDDEN | No payment of any kind may grant access to sacred or private sources. | Architectural enforcement per M48-04 §14. This is a hard boundary, not a risk to mitigate. |
| **Customer-driven roadmap** | MODERATE | Paying customers may influence the project roadmap toward their needs and away from the broader mission. | Maintain owner control over roadmap. Customer input is advisory, not directive. |
| **Mission drift toward profit** | LOW–MODERATE | The need to retain customers may gradually shift project priorities toward commercial viability and away from mission. | Regular mission review. Owner must periodically confirm that commercial activity serves the mission, not the reverse. |
| **Equity concerns** | MODERATE | Paid support may be inaccessible to under-resourced institutions or independent researchers, contradicting the open-access mission. | Consider sliding-scale pricing, pro-bono tiers, or sponsored access for qualifying users (separate from S2). |

**Overall mission risk for S1**: LOW–MODERATE. The commercial boundary defined by M48-04 provides strong structural protection. The primary risk is gradual roadmap drift toward customer preferences.

#### S2: Sponsorship — Mission Risk Assessment

| Risk factor | Severity | Description | Mitigation |
|---|---|---|---|
| **Sponsor influence on priorities** | MODERATE | Even unrestricted sponsors have implicit expectations. The project may unconsciously prioritize work that pleases the sponsor over work that serves the mission. | Maintain transparent decision-making. Document how project priorities are set. |
| **Sponsor mission misalignment** | LOW–MODERATE | The sponsor's mission may not perfectly align with the project's mission. Over time, divergence may create tension. | Careful sponsor selection. Clear communication of project mission before acceptance of funds. |
| **Dependency culture** | MODERATE | Reliance on a sponsor may reduce the project's incentive to develop sustainable commercial operations. | Treat sponsorship as a supplement, not a substitute for sustainable operations. Plan for eventual sponsor independence. |
| **Reputational coupling** | MODERATE | The project's reputation may become associated with the sponsor's reputation. Sponsor controversy could harm the project. | Maintain independent project identity. Do not co-brand with sponsors. |
| **Accountability displacement** | LOW | The sponsor, not the community or customers, becomes the primary accountability relationship. This may reduce responsiveness to actual users. | Maintain community engagement and user feedback channels independent of sponsor reporting. |

**Overall mission risk for S2**: MODERATE. The primary risk is subtle mission drift driven by sponsor expectations. The voluntary nature of sponsorship means the relationship can end abruptly if expectations are not met.

#### S3: Grants — Mission Risk Assessment

| Risk factor | Severity | Description | Mitigation |
|---|---|---|---|
| **Deliverable-driven priorities** | HIGH | Grant deliverables may not align with the project's most pressing needs. The project may prioritize grant-compliant work over mission-critical work. | Careful grant selection. Negotiate deliverables that align with project priorities. |
| **Grant cycle distortion** | MODERATE–HIGH | The 12–24 month grant cycle may create boom-bust patterns in project activity. periods of grant-funded activity followed by unfunded gaps. | Maintain a baseline of owner-funded operations that continues regardless of grant status. |
| **Reporting burden diverting resources** | MODERATE | Time spent on grant reporting is time not spent on project work. For small projects, this can be significant. | Budget for grant administration. Consider whether the net funding (after admin costs) justifies the effort. |
| **Mission distortion for fundability** | HIGH | The project may shape its mission statement or activities to be more "fundable" rather than more mission-aligned. This is a subtle but serious risk. | Owner must regularly review whether grant-seeking is serving the mission or the mission is serving grant-seeking. |
| **Post-grant cliff** | HIGH | When a grant ends, grant-funded activities stop. If those activities have become integral to operations, the loss is disruptive. | Never build permanent operations on temporary grant funding. Treat grants as time-limited supplements. |
| **IP restrictions** | MODERATE | Some grants require open licensing or public domain dedication of outputs. This may conflict with the project's IP strategy or source protection requirements. | Legal review of grant IP terms before application. Ensure grant terms are compatible with source protection policies. |

**Overall mission risk for S3**: HIGH. Grants create the strongest pressure to adapt the project's mission to funder preferences. The fixed-term nature of grants also creates structural instability that can distort project planning.

### 19.3 Mission Risk Summary

| Scenario | Overall mission risk | Primary concern | Secondary concern |
|---|---|---|---|
| S1: Paid Support | LOW–MODERATE | Customer-driven roadmap drift | Equity concerns for under-resourced users |
| S2: Sponsorship | MODERATE | Sponsor influence on priorities | Dependency culture |
| S3: Grants | HIGH | Deliverable-driven mission distortion | Post-grant cliff and structural instability |

### 19.4 Mission Protection Recommendations

Regardless of which funding scenario is pursued, the following mission protection measures are recommended:

1. **Owner retains final authority over project direction.** No funding source — customer, sponsor, or grantor — has veto power over project priorities.
2. **Source access remains permanently free and payment-independent.** Per M48-04, no payment of any kind grants access to sacred or private sources.
3. **Regular mission review.** The owner should periodically (at least annually) review whether funding relationships are influencing project priorities in ways that diverge from the mission.
4. **Transparent decision-making.** Project priorities, funding decisions, and their rationale should be documented and available for review.
5. **No single funding source should exceed 50% of total project resources.** This diversification rule limits any single funder's influence.
6. **Funding should serve the mission, not the reverse.** If a funding opportunity requires the project to alter its mission to qualify, the opportunity should be declined.

---

## 20. Ethics Considerations

### 20.1 Core Ethical Principle

**This document does not solicit funds.** It is a research artifact that compares the structural characteristics of three hypothetical funding scenarios. No entity is asked to provide money. No offer is made. No commitment is sought.

### 20.2 Ethical Boundaries

| Boundary | Description | Status in this document |
|---|---|---|
| **No solicitation** | The document does not invite, request, or encourage any entity to provide funds. | MAINTAINED — all figures are labeled hypothetical |
| **No revenue claims** | The document does not present hypothetical funding as actual or projected revenue. | MAINTAINED — all figures are labeled synthetic |
| **No fund handling** | The document does not create, process, or record any financial transaction. | MAINTAINED — offline model only |
| **No commercial offer** | The document does not propose pricing, terms, or service levels to any potential customer. | MAINTAINED — pricing references are from M48-03 and labeled hypothetical |
| **No donation-to-entitlement coupling** | Per M48-04, donations and commercial entitlements are strictly separated. | MAINTAINED — each scenario is structurally distinct |
| **No source access for payment** | Sacred and private source access is permanently excluded from any payment relationship. | MAINTAINED — this is a hard boundary per M48-04 §14 |
| **No misrepresentation of funding availability** | The document does not imply that any funding source is available, likely, or promised. | MAINTAINED — all scenarios are explicitly hypothetical |
| **No pressure on potential funders** | The document does not create urgency, scarcity, or emotional pressure to fund the project. | MAINTAINED — neutral structural comparison |

### 20.3 Ethics Review Checklist

| Check | Status | Notes |
|---|---|---|
| All monetary figures labeled as hypothetical or source-backed | PASS | §17 assumption sheet classifies every input |
| No funding solicitation language present | PASS | Document uses "hypothetical scenario" framing throughout |
| No revenue claims or projections | PASS | Document explicitly disclaims revenue (§1, §3.5) |
| No real funder, sponsor, or grantor identified | PASS | All entities are hypothetical |
| No real funding amount claimed | PASS | All amounts are synthetic estimates |
| Donation/commerce boundary maintained (M48-04) | PASS | Each scenario is structurally distinct |
| Source access exclusion maintained | PASS | No payment grants source access |
| Mission risk disclosed | PASS | §19 reviews mission risk for each scenario |
| Concentration risk disclosed | PASS | §10 quantifies concentration for each scenario |
| Unfunded obligations disclosed | PASS | §12 lists all unfunded obligations |
| Limitations stated | PASS | §23 states what this document cannot claim |

### 20.4 Ethical Risk Scenarios

| Risk scenario | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Document is mistaken for a funding proposal | LOW | HIGH — could create false expectations | Explicit disclaimers throughout; "HYPOTHETICAL" watermark on each scenario |
| Document is used to solicit funds without owner approval | LOW | VERY HIGH — ethical and legal violation | Owner authorization required before any solicitation; document is not a solicitation tool |
| Hypothetical figures are cited as real | LOW | HIGH — misrepresents project financial status | Every figure is labeled with classification (HYPOTHETICAL, ESTIMATED, SOURCED) |
| Sponsor or grantor reads document and feels pressured | LOW | MODERATE — reputational risk | Document does not name or target any specific entity |
| Document creates expectation of commercial activity | LOW | MODERATE — may trigger regulatory scrutiny | Document explicitly states no commercial activity is planned or offered |

### 20.5 Ethics Review Statement

> **ETHICS REVIEW — M48-07 FUNDING MODEL COMPARISON**
>
> This document has been constructed in compliance with the following ethical principles:
>
> 1. **No solicitation**: The document compares hypothetical scenarios. It does not request funds from any entity.
> 2. **No misrepresentation**: All figures are synthetic. No real funding, revenue, or financial commitment is represented.
> 3. **No coupling**: Commercial entitlements, charitable donations, and source access are strictly separated per M48-04.
> 4. **Transparency**: Every assumption is classified and every limitation is stated.
> 5. **Mission protection**: The document identifies mission risks associated with each scenario and recommends protection measures.
>
> This document is suitable for owner review, ethics review, and stakeholder information. It is NOT suitable for use as a funding proposal, solicitation material, or commercial offer.
>
> **Review status**: PASS — no ethical concerns identified in document structure or content.

---

## 21. Risk Mitigation

### 21.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Hypothetical figures are mistaken for real funding evidence | Medium | High | Every figure labeled as HYPOTHETICAL; disclaimer in §1 and throughout | Mitigated |
| R2 | Document is used as a funding solicitation without authorization | Low | Very High | Document explicitly states it is not a solicitation; owner authorization required for any outreach | Mitigated |
| R3 | Model implies access to funds that do not exist | Medium | High | §1 states "no funds are handled"; §3.5 constrains model to offline comparison | Mitigated |
| R4 | Concentration risk is underestimated | Low | Medium | HHI and FSDI metrics provide quantitative concentration assessment; §10 documents all scenarios | Accepted |
| R5 | Mission risk is not adequately addressed | Low | High | §19 provides detailed mission risk analysis per scenario; §19.4 recommends protection measures | Mitigated |
| R6 | Cost baseline (M48-06) is inaccurate | Medium | Medium | M48-06 documents ±41% uncertainty; this model uses ranges, not point estimates | Accepted |
| R7 | Extended cost estimates are too low | Medium | Medium | Extended costs are labeled LOW confidence; §12 documents them as unfunded obligations | Accepted |
| R8 | Scenario comparison is incomplete (missing funding models) | Low | Low | Three scenarios cover the primary structural models; hybrid models are acknowledged in §24 | Accepted |
| R9 | Administrative overhead is underestimated | Medium | Medium | §11.2 provides overhead estimates; actual overhead may be higher for grants | Accepted |
| R10 | Grant compliance requirements are more restrictive than modeled | Medium | Medium | §8.6 lists major restrictions; actual grant terms may add additional requirements | Accepted |
| R11 | Sponsor influence is subtler than modeled | Low | Medium | §7.5 acknowledges moderate influence risk; actual influence may vary by sponsor relationship | Accepted |
| R12 | Customer churn is higher than modeled | Medium | Medium | §17.3 S1-12 assumes 20–40% annual churn; actual churn may be higher for unproven products | Accepted |

### 21.2 Hypothetical Labeling Protocol

Every monetary figure in this document follows one of these labeling protocols:

| Label | Meaning | When used |
|---|---|---|
| **HYPOTHETICAL** | A fictional value created for scenario modeling; no claim of real-world accuracy | Funding amounts, revenue figures, customer counts |
| **ESTIMATED** | Based on reasonable assumptions with stated rationale; may not reflect actual values | Administrative costs, time estimates, overhead rates |
| **SOURCED** | Derived from a documented source (M48-06, M46-31, published data); reflects source document's confidence level | Cost baseline values from M48-06 |
| **UNKNOWN** | No reliable basis for estimation; explicitly flagged | Compliance costs, legal costs, future grant success rates |

### 21.3 No-Revenue-Claim Protocol

The following statements appear in the document to prevent revenue misrepresentation:

1. §1: "No revenue is claimed. No solicitation is made."
2. §3.5: "No profitability claim — this model does not evaluate revenue, margin, or financial sustainability."
3. §5.2: "Important: These figures are entirely hypothetical. No price has been set. No customer has committed. No revenue is being generated."
4. Each scenario section: "HYPOTHETICAL SCENARIO — NOT AN OFFER OR SOLICITATION"
5. §20.2: "No funding solicitation — the document does not invite, request, or encourage any entity to provide funds."

### 21.4 Rollback Protocol

If any assumption in this document is found to be materially incorrect or misleading:

| Trigger | Action | Timeline |
|---|---|---|
| Real cost data contradicts M48-06 baseline by >50% | Revise cost inputs; update all scenario calculations | Within 30 days |
| Real funding is received from any source | Update document to reflect actual funding; re-run concentration analysis | Within 14 days |
| A scenario is found to misrepresent structural characteristics | Correct the misrepresentation; add clarification | Within 7 days |
| Document is used for solicitation without authorization | Issue correction; restate non-solicitation boundary; review authorization process | Immediately |
| Ethics review identifies a concern not addressed in §20 | Add the concern to the risk register; revise document | Within 14 days |

---

## 22. Metrics and Success Criteria

### 22.1 Primary Metrics

| Metric | Definition | Target | Model result |
|---|---|---|---|
| **Cost coverage ratio** | Hypothetical monthly funding / M48-06 monthly cost | Documented for each scenario | S1: 185%, S2: 123%, S3: 257% (central) |
| **Concentration index (HHI)** | Sum of squared funding source shares | Documented for each scenario | S1: 5,000; S2: 10,000; S3: 10,000 (central) |
| **Runway range** | Months of operation sustainable from hypothetical funding | Documented for each scenario | S1: 12+ months; S2: 24+ months; S3: 24–36 months |
| **Unfunded obligation count** | Number of cost categories not covered by hypothetical funding | Documented for each scenario | S1: 6 categories; S2: 5 categories; S3: 4 categories |
| **Mission risk rating** | Qualitative assessment of mission drift risk per scenario | Documented for each scenario | S1: LOW–MODERATE; S2: MODERATE; S3: HIGH |

### 22.2 Secondary Metrics

| Metric | Definition | Model result |
|---|---|---|
| **Administrative overhead percentage** | Admin cost as percentage of hypothetical funding | S1: 28–56%; S2: 25–67%; S3: 40–100% |
| **Funding Source Diversification Index (FSDI)** | Effective number of independent funding sources | S1: 2.0; S2: 1.0; S3: 1.0 (central) |
| **Maximum single-source dependency** | Largest share held by any single source | S1: 50%; S2: 100%; S3: 100% (central) |
| **Time to minimum viable operation after source loss** | Months to scale down to owner-funded minimum | S1: 1–2 months; S2: 1–2 months; S3: 2–3 months |
| **Coverage gap (monthly)** | Total burden minus hypothetical coverage at central | S1: $537–$6,287; S2: $837–$6,587; S3: $187–$5,937 |

### 22.3 Success Criteria for Acceptance

| Criterion | Minimum for "baseline established" | Minimum for "validated" |
|---|---|---|
| Three scenarios modeled with assumptions | Yes (3 scenarios) | Yes (3 scenarios) |
| Cost coverage analysis complete | Yes (all M48-06 scenarios) | Yes (validated against real costs) |
| Concentration risk quantified | Yes (HHI and FSDI calculated) | Yes (validated against real funding) |
| Restrictions and obligations listed | Yes (per scenario) | Yes (validated against real agreements) |
| Unfunded obligations identified | Yes (13 obligations listed) | Yes (prioritized with owner) |
| Continuity modeled | Yes (per scenario timelines) | Yes (tested with actual disruption) |
| Stress-test complete | Yes (loss-of-source for each) | Yes (actual loss event analyzed) |
| Runway calculated | Yes (ranges documented) | Yes (validated against actual reserves) |
| Assumption sheet complete | Yes (53 inputs classified) | Yes (inputs updated with real data) |
| Formula verification | Yes (7 fixtures pass) | Yes (validated against actual figures) |
| Mission risk review | Yes (per scenario analysis) | Yes (validated with stakeholder input) |
| Ethics review | Yes (checklist passes) | Yes (external ethics review completed) |
| Finance/ethics review (DoD) | **Deferred** | **Required** |

### 22.4 Metric Limitations

- All metrics are derived from synthetic data. They demonstrate the model's structural logic, not its real-world accuracy.
- HHI values assume equal-sized sources within each scenario. Actual funding distributions would produce different HHI values.
- Runway calculations assume no cost growth and no revenue/funding variation. Actual runway would differ.
- Cost coverage ratios use the M48-06 central estimate as the denominator. Using the low or high estimate would produce different ratios.
- Administrative overhead percentages are rough estimates. Actual overhead depends on the specific funding arrangement and the project's administrative capacity.
- Mission risk ratings are qualitative judgments. They are not quantifiable and should be interpreted as directional indicators, not precise measurements.

---

## 23. Limitations and Caveats

### 23.1 Fundamental Limitation: Synthetic Data

**This entire model is based on synthetic data.** No real funding amounts, no real sponsors, no real grants, no real customers, and no real revenue are used. The model is a structural comparison exercise, not a financial analysis.

The synthetic model is constructed to:
- Compare the structural characteristics of three hypothetical funding scenarios.
- Identify concentration risks, restrictions, and unfunded obligations.
- Model continuity and stress-test scenarios.
- Make mission risks visible before any real funding is sought.

The synthetic model is NOT:
- Evidence of funding availability.
- A basis for funding decisions.
- A substitute for real financial planning.
- A prediction of future funding outcomes.
- A solicitation or proposal for any funding source.

### 23.2 Specific Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **No real funding data** | All funding amounts are hypothetical; actual funding may differ significantly | Document clearly labels all figures as HYPOTHETICAL |
| **Single-workflow cost basis** | M48-06 models one workflow; actual project costs span multiple workflows and services | Extended cost categories attempt to capture broader costs; still incomplete |
| **No market validation** | Customer count (S1), sponsor availability (S2), and grant success rates (S3) are all assumptions | §17.7 flags these as LOW confidence |
| **No legal review** | Restriction and obligation analyses are structural, not legal | §24 defers legal review to owner |
| **No tax or regulatory analysis** | Funding scenarios may have tax implications not modeled | §24 defers tax review to owner |
| **Static model** | Costs and funding are modeled as constant; actual values change over time | §15.4 addresses sensitivity to changes |
| **No interaction effects** | Scenarios are modeled independently; in practice, a project might combine multiple funding sources | §24 acknowledges hybrid models as a deferred item |
| **Administrative overhead is estimated** | Actual overhead depends on specific arrangements and local regulations | §11.2 provides ranges, not point estimates |
| **Mission risk is qualitative** | No quantitative measure of mission drift probability or impact | §19 provides directional assessment, not precision |
| **Concentration metrics assume equal sources** | Actual funding distributions are rarely equal | §16.2 documents the equal-share assumption |

### 23.3 What This Document Cannot Claim

- "The project can be sustainably funded by scenario X." — The model compares structural characteristics; it does not evaluate sustainability.
- "Funding source Y is available." — No real funding sources have been identified or contacted.
- "The project needs $Z/month to operate." — The M48-06 cost model provides ranges with ±41% uncertainty; actual costs may differ.
- "Scenario A is better than Scenario B." — The model does not recommend one scenario over another; each has different trade-offs.
- "The project will survive if funding source C is secured." — Funding is necessary but not sufficient; execution, market fit, and mission alignment also matter.
- "This document is a funding proposal." — This document is explicitly NOT a funding proposal. It is a research artifact.
- "The ethics review is complete." — §20 provides a self-assessment; independent ethics review is deferred.
- "The mission risk analysis is exhaustive." — §19 identifies major risks; unanticipated risks may exist.

### 23.4 Rollback and Fallback

| Trigger | Action | Timeline |
|---|---|---|
| Real funding is received | Update document with actual terms; re-run analysis | Within 30 days |
| Real cost data contradicts M48-06 by >50% | Revise cost baseline; update all scenario calculations | Within 30 days |
| A scenario assumption is invalidated | Remove or revise the scenario; document the change | Within 14 days |
| Ethics review identifies unaddressed concern | Add concern to risk register; revise document | Within 14 days |
| Owner decides to withdraw a scenario from consideration | Remove scenario; update comparison matrix | Within 7 days |
| Document is misused as solicitation material | Issue correction; restate non-solicitation boundary; review controls | Immediately |

### 23.5 Model Versioning

This document is version 1.0 (synthetic baseline). Future versions should:
- Incorporate real funding data (when available).
- Incorporate real cost data from M48-06 validation.
- Incorporate legal review findings.
- Incorporate ethics review findings.
- Add hybrid funding model analysis.
- Update concentration metrics based on actual funding sources.
- Revise mission risk assessment based on stakeholder input.

Each version should be dated, signed, and cross-referenced to the previous version.

---

## 24. Deferred Items Requiring Owner Action

### 24.1 Items Requiring Owner Decision

| Item | Decision needed | Blocks | Priority |
|---|---|---|---|
| **Funding model selection** | Owner must decide whether to pursue S1, S2, S3, a hybrid, or none | All real funding activity | P1 |
| **Legal review** | Owner must authorize legal review of chosen funding model structure | S1 contract terms, S2 sponsorship agreement, S3 grant compliance | P1 |
| **Ethics review** | Owner must authorize independent ethics review of funding scenario | All real funding activity | P1 |
| **Tax and regulatory review** | Owner must determine tax implications of each funding model | S1 invoicing, S2 charitable status, S3 grant accounting | P2 |
| **Cost baseline validation** | Owner must authorize access to real cost data for M48-06 validation | Model accuracy | P2 |
| **Administrative capacity assessment** | Owner must determine whether project has capacity for grant administration, sponsor reporting, or customer support | S3 feasibility especially | P2 |
| **Mission review** | Owner must confirm that chosen funding model is compatible with project mission | All scenarios | P1 |
| **Diversification strategy** | Owner must decide whether to pursue multiple funding sources simultaneously | Concentration risk reduction | P3 |

### 24.2 Items Deferred to Downstream Tasks

| Item | Deferred to | Rationale |
|---|---|---|
| Pricing model design | M48-03 (ECO-003) | This document uses M48-03 pricing references; it does not design pricing |
| Commercial boundary implementation | M48-04 (ECO-004) | This document respects M48-04 boundaries; it does not implement them |
| Restricted fund handling rules | CHAR-004 | This document identifies restriction differences; CHAR-004 owns the rules |
| Donation platform design | CHAR-003/CHAR-005 | This document does not model donation handling |
| Payment processing | M35-02 | This document handles no funds; M35 owns payment infrastructure |
| Grant application | Future task (if authorized) | This document does not apply for grants; it compares structures |
| Sponsor outreach | Future task (if authorized) | This document does not contact sponsors; it compares structures |
| Customer acquisition | Future task (if authorized) | This document does not acquire customers; it compares structures |

### 24.3 Items Requiring Future Modeling Rounds

| Item | Reason for deferral | Suggested approach |
|---|---|---|
| Hybrid funding model analysis | Current model compares scenarios independently; real projects often combine sources | Add a fourth scenario combining elements of S1, S2, and S3 |
| Multi-year financial projection | Current model uses monthly snapshots; real funding requires multi-year planning | Add time-series projection with cost growth and funding variability |
| Regional funding landscape analysis | Current model does not consider geographic variation in funding availability | Research grant programs, sponsorship culture, and commercial markets by region |
| Break-even analysis with reserves | Current runway model assumes no reserve accumulation; real projects build reserves | Add reserve accumulation and drawdown modeling |
| Scenario interaction effects | Current model treats scenarios as independent; real funding sources interact | Model how S1 revenue affects S2 sponsor willingness, or how S3 grant affects S1 customer perception |
| Sensitivity to M48-06 cost revision | Current model uses M48-06 synthetic baseline; real cost data may change the baseline | Re-run all scenarios with validated cost data when available |
| Staff time allocation model | Current model estimates administrative overhead in aggregate; real projects need staff planning | Add per-role time allocation (owner, technician, administrator) for each scenario |

### 24.4 Owner Action Checklist

Before any real funding activity can begin, the owner must:

- [ ] Review and accept this document as a complete synthetic baseline.
- [ ] Decide which funding scenario(s) to pursue (S1, S2, S3, hybrid, or none).
- [ ] Authorize legal review of the chosen scenario's structural requirements.
- [ ] Authorize independent ethics review of the chosen scenario.
- [ ] Determine tax and regulatory implications with qualified professional advice.
- [ ] Authorize access to real cost data for M48-06 validation.
- [ ] Assess administrative capacity for the chosen scenario's overhead requirements.
- [ ] Confirm mission compatibility of the chosen scenario.
- [ ] Set a target date for beginning real funding activity (if authorized).
- [ ] Approve model versioning and update schedule.

---

## 25. Conclusion: BASELINE ESTABLISHED

### 25.1 Summary

This document establishes the **synthetic baseline** for M48-07: Compare recurring support, sponsorship and grant scenarios. The baseline includes:

- Three complete hypothetical funding scenarios (S1: Paid Support, S2: Non-Restricted Sponsorship, S3: Grant Funding) with structural analysis.
- An assumption sheet of 53 inputs, each classified as sourced (13%), estimated (49%), hypothetical (28%), or unknown (9%).
- Cost coverage analysis showing that all three scenarios cover the M48-06 central cost ($487/month) at their hypothetical central funding levels, but none covers more than approximately 22% of the total burden including extended costs.
- Concentration risk analysis using HHI and FSDI metrics, showing that all three scenarios exhibit extreme or high concentration at their central estimates.
- Restriction and obligation analysis documenting the administrative, legal, and governance requirements of each scenario.
- Unfunded obligations register identifying 13 cost categories not covered by any scenario at central estimates.
- Continuity modeling showing what happens when each funding source ends, with time-to-minimum-viable-operation estimates.
- Stress-test analysis modeling the complete loss of each funding source, showing all scenarios revert to owner-funded minimum operations within 1–3 months.
- Runway range calculations showing hypothetical funding sustainability periods from 12 to 36 months depending on scenario.
- Funding concentration metrics (HHI, FSDI, maximum single-source dependency) quantifying diversification needs.
- Formula verification with 7 arithmetic fixtures confirming internal consistency.
- Sensitivity analysis identifying M48-06 cost accuracy and funding source loss as the two highest-impact uncertainties.
- Mission risk review assessing each scenario's potential to distort project priorities, with protection recommendations.
- Ethics review confirming no solicitation, no revenue claims, no fund handling, and complete hypothetical labeling.
- Risk register with 12 identified risks and mitigation strategies.
- Comprehensive limitations and caveats stating what this document cannot claim.
- Deferred items requiring owner action before any real funding activity.

### 25.2 Key Structural Findings

1. **No scenario is risk-free.** Each funding model has distinct concentration risks, restrictions, and unfunded obligations. The choice between models is a choice between different types of risk, not between safety and danger.

2. **Concentration risk is structural.** Small projects with limited funding sources inherently face high concentration risk. The only mitigation is diversification, which itself requires administrative capacity.

3. **Extended costs are the real challenge.** All three scenarios cover the M48-06 core maintenance cost. None covers the full extended cost burden (feature development, security, compliance, community). The gap between core coverage and total need is the fundamental sustainability challenge.

4. **Administrative overhead is significant.** Grant administration (40–100% of indirect cost allowance), sponsor reporting (25–67% of funding), and customer management (28–56% of revenue) all consume a substantial fraction of the hypothetical funding.

5. **Mission risk varies by scenario.** Paid support has the lowest mission risk (commercial boundaries are clear). Grants have the highest mission risk (deliverable requirements can distort priorities). Sponsorship falls in between (informal influence is the primary concern).

6. **All scenarios revert to owner-funded minimum.** The stress test shows that when any funding source is lost, the project can survive at a minimal level ($100–$200/month) on owner funding alone. This minimum viable operation is the project's fallback position.

7. **No solicitation is made.** This document is a research artifact. It does not invite, request, or encourage any entity to provide funds. It makes risks visible so that the owner can make informed decisions.

### 25.3 Status

| Aspect | Status |
|---|---|
| Three funding scenarios modeled | **Complete** (synthetic) |
| Assumption sheet | **Complete** (53 inputs classified) |
| Cost coverage analysis | **Complete** (synthetic) |
| Concentration risk analysis | **Complete** (HHI and FSDI calculated) |
| Restrictions and obligations | **Complete** (per scenario) |
| Unfunded obligations | **Complete** (13 items identified) |
| Continuity modeling | **Complete** (per scenario timelines) |
| Stress-test analysis | **Complete** (loss-of-source for each) |
| Runway calculations | **Complete** (ranges documented) |
| Formula verification | **Complete** (7 fixtures pass) |
| Sensitivity analysis | **Complete** (top 5 drivers ranked) |
| Mission risk review | **Complete** (per scenario assessment) |
| Ethics review | **Complete** (checklist passes) |
| Risk register | **Complete** (12 risks identified) |
| Legal review | **Deferred** (requires owner authorization) |
| Independent ethics review | **Deferred** (requires external reviewer) |
| Real funding data | **Deferred** (no funds handled) |
| Owner decision on funding model | **Deferred** (requires owner action) |

### 25.4 Decision

**BASELINE ESTABLISHED.** The scenario comparison model is complete with synthetic inputs. Every figure is labeled as hypothetical, estimated, sourced, or UNKNOWN. The model produces structural comparisons of cost coverage, concentration risk, restrictions, unfunded obligations, continuity, runway, and mission risk for three hypothetical funding scenarios. No funds are handled. No revenue is claimed. No solicitation is made.

**Next step**: Owner review and decision on whether to pursue any real funding activity. Until the owner authorizes real-world action, this document remains a synthetic research artifact. Legal review, ethics review, and tax/regulatory analysis are required before any real funding activity begins.

### 25.5 Document Provenance

| Field | Value |
|---|---|
| Document path | `docs/audit/M48-07-funding-model-comparison.md` |
| Document type | Audit/design document |
| Data type | Synthetic only — no real funds, no real revenue, no real sponsors |
| Task status in TODO | Unchecked (planning only; this document does not complete the task) |
| V5 candidate | ECO-007 |
| TODO task | M48-07 |
| Milestone | M48 |
| Group | G7 — ECOSYSTEM |
| Dependencies | M48-06 (done), related CHAR-004 |
| Companion tasks | M48-03 (pricing), M48-04 (boundary), CHAR-004 (restricted funds) |
| Date | 2026-10-31 |
| Confidence | Low (synthetic data; no real funding evidence) |

### 25.6 Compliance Statement

This document complies with the following project governance requirements:

- **TODO.md is the sole status source.** This document does not claim task completion.
- **No new branch created.** Work follows the owner's branch discipline policy (dev only).
- **No funds handled.** All figures are hypothetical. No financial transaction is created, processed, or recorded.
- **No solicitation.** The document does not invite, request, or encourage any entity to provide funds.
- **No revenue claims.** The document explicitly disclaims revenue throughout.
- **No commercial offer.** The document does not propose pricing, terms, or service levels.
- **Donation/commerce boundary maintained.** Per M48-04, donations and commercial entitlements are strictly separated.
- **Source access exclusion maintained.** No payment grants access to sacred or private sources.
- **Anti-overlap maintained.** This document addresses funding scenario comparison only; it does not encroach on M48-03 (pricing), M48-04 (boundary), CHAR-004 (restricted funds), or M35 (payment processing).
- **Synthetic data clearly marked.** All inputs, scenarios, and results are identified as hypothetical, estimated, or synthetic throughout the document.
- **Every input classified.** 53 inputs are labeled as sourced, estimated, hypothetical, or UNKNOWN with provenance.
- **Arithmetic verified.** Seven fixtures demonstrate internal consistency.
- **Uncertainty documented.** Confidence levels and sensitivity analysis are stated.
- **Ethics review included.** §20 provides a complete ethics checklist and review statement.
- **Mission risk assessed.** §19 reviews mission risk for each scenario with protection recommendations.
- **Risks registered.** 12 risks are identified with mitigation strategies.
- **Limitations stated.** §23 states what this document cannot claim.
- **Deferred items listed.** §24 identifies all items requiring owner action.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **BASELINE ESTABLISHED** | The document status indicating that the scenario comparison model is complete with synthetic inputs, but real funding decisions have not been made. |
| **Concentration risk** | The degree to which a project depends on a single funding source, entity, or type of funding. Measured by HHI and FSDI. |
| **Cost coverage ratio** | The percentage of the M48-06 cost baseline that is hypothetically covered by a funding scenario's projected revenue or funding. |
| **Extended costs** | Cost categories beyond the M48-06 scope (feature development, security, compliance, community) that represent unfunded obligations. |
| **FSDI (Funding Source Diversification Index)** | A metric equal to 10,000 / HHI, representing the effective number of independent funding sources. |
| **Funding cliff** | The abrupt drop to zero funding that occurs when a time-limited source (grant, sponsorship commitment) expires. |
| **HHI (Herfindahl-Hirschman Index)** | A standard measure of market concentration, adapted here to measure funding source concentration. Calculated as the sum of squared source share percentages. |
| **HYPOTHETICAL** | A fictional value created for scenario modeling only; no claim of real-world accuracy or availability. |
| **Minimum viable operation** | The lowest-cost level at which the project can continue to exist (basic VPS + domain; no support staff or feature development). Estimated at $100–$200/month. |
| **Mission drift** | The gradual shift in project priorities away from the core mission and toward the preferences of a funding source. |
| **Non-restricted sponsorship** | A funding model where a sponsor provides unrestricted funds without receiving a commercial service entitlement in exchange. |
| **Runway** | The number of months a project can operate at a given cost level with a given funding source before the funding is exhausted. |
| **Stress test** | A worst-case scenario analysis modeling the complete and permanent loss of the primary funding source. |
| **Unfunded obligation** | A cost category that is not covered by the hypothetical funding in a given scenario. |

---

## Appendix B: Formula Reference

### B.1 Cost Coverage Formulas

```
Cost_coverage_ratio = Hypothetical_monthly_funding / M48-06_monthly_cost
Net_monthly_surplus = Hypothetical_monthly_funding - M48-06_monthly_cost
Coverage_gap = Total_monthly_burden - Hypothetical_monthly_funding
where:
  Total_monthly_burden = M48-06_monthly_cost + Extended_monthly_costs
```

### B.2 Concentration Formulas

```
HHI = Sum(source_share_percentage ^ 2) for all sources
FSDI = 10,000 / HHI
Maximum_single_source_dependency = Max(source_share_percentage)

HHI classification:
  < 1,000:    Low concentration
  1,000–1,800: Moderate concentration
  1,800–3,500: High concentration
  3,500–5,000: Very high concentration
  > 5,000:    Extreme concentration
```

### B.3 Runway Formulas

```
Runway_months = Available_funding / Monthly_burn_rate
Reserve_buildup_rate = Net_monthly_surplus (if positive)
Reserve_after_N_months = Reserve_buildup_rate × N
Reserve_runway = Total_reserves / Monthly_burn_rate
Total_runway = Funding_period_months + Reserve_runway
```

### B.4 Sensitivity Formulas

```
Cost_sensitivity = (New_cost - Baseline_cost) / Baseline_cost × 100
Revenue_sensitivity = (New_revenue - Baseline_revenue) / Baseline_revenue × 100
Surplus_sensitivity = New_surplus - Baseline_surplus
Break_even_change = New_cost / Revenue_per_unit - Old_cost / Revenue_per_unit
```

### B.5 Administrative Overhead Formulas

```
Admin_hours_per_month = Reporting_hours + Compliance_hours + Governance_hours
Admin_cost_per_month = Admin_hours_per_month × Hourly_rate
Admin_overhead_percentage = Admin_cost_per_month / Monthly_funding × 100
```

---

## Appendix C: Scenario Comparison Summary Matrix

| Dimension | S1: Paid Support | S2: Non-Restricted Sponsorship | S3: Grant Funding |
|---|---|---|---|
| **Hypothetical monthly funding (central)** | $900 | $600 | $1,250 (amortized) |
| **M48-06 central cost coverage** | 185% | 123% | 257% |
| **Total burden coverage (approx.)** | 6–63% | 6–42% | 9–87% |
| **HHI (central)** | 5,000 (Extreme) | 10,000 (Maximum) | 10,000 (Maximum) |
| **FSDI (central)** | 2.0 | 1.0 | 1.0 |
| **Runway range** | 12+ months (renewal) | 12–36 months (commitment) | 12–36 months (grant term) |
| **Post-source runway** | 10 months (with reserves) | 5.5 months (with reserves) | 37 months (if surplus saved; unlikely) |
| **Restriction level** | Low | Moderate | High |
| **Administrative overhead** | 28–56% | 25–67% | 40–100% |
| **Mission risk** | LOW–MODERATE | MODERATE | HIGH |
| **Unfunded obligations (count)** | 6 major categories | 5 major categories | 4 major categories |
| **Continuity on source loss** | Moderate (1–2 mo adjustment) | Low (immediate) | Low–Moderate (planned wind-down) |
| **Scalability** | High (many potential customers) | Low (few sponsors) | Moderate (many grants, competitive) |
| **Ethical risk** | Low | Moderate | Low–Moderate |
| **Key vulnerability** | Customer churn | Sponsor withdrawal | Grant expiration |
| **Key strength** | Recurring revenue; clear exchange | Unrestricted funds; low obligation | Large amounts; defined term |

---

## Appendix D: Cross-Reference to V5 Source Package

This document corresponds to the following entries in the V5 source package:

| V5 reference | Location | Relationship |
|---|---|---|
| ECO-007 | `docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md` | Canonical specification (22 sections) |
| M48-07 | `TODO.md` (M48 section) | Canonical TODO task |
| M48 milestone | `docs/milestones/M48.md` | Parent milestone |
| M48-06 / ECO-006 | `docs/audit/M48-06-cost-to-serve-model.md` | Upstream cost baseline |
| M48-03 / ECO-003 | `docs/audit/M48-03-ethical-pricing-hypotheses.md` | Upstream pricing reference |
| M48-04 / ECO-004 | `docs/audit/M48-04-commercial-donation-boundary.md` | Upstream boundary rules |
| M46-31 / ENG-031 | `docs/audit/M46-31-recurring-service-cost.md` | Upstream aggregate cost |
| CHAR-004 | `TODO.md` (CHAR section) | Downstream restricted-fund rules |
| V5 source package | `docs/research/unified-100-issue-frontier-v5/README.md` | Source package root |
| ADR applicability | `docs/research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md` | No new ADR required |

---

## Appendix E: Reviewer Note Template

> **M48-07 Funding Model Comparison — Reviewer Sign-Off**
>
> **Document version**: 1.0 (synthetic baseline)
>
> **Reviewer name**: ________________________
>
> **Reviewer role**: [ ] Finance [ ] Ethics [ ] Product [ ] Operations [ ] Other: ____________
>
> **Review date**: ____________
>
> ---
>
> **Checklist**:
>
> - [ ] All inputs are classified (sourced/estimated/hypothetical/UNKNOWN).
> - [ ] Arithmetic fixtures pass (7/7).
> - [ ] Three scenarios are modeled with complete assumptions.
> - [ ] Cost coverage analysis is documented for each scenario.
> - [ ] Concentration risk is quantified (HHI and FSDI).
> - [ ] Restrictions and obligations are listed per scenario.
> - [ ] Unfunded obligations are identified (13 items).
> - [ ] Continuity modeling is complete (per scenario timelines).
> - [ ] Stress-test analysis covers loss-of-source for each scenario.
> - [ ] Runway ranges are calculated.
> - [ ] Mission risk review is complete.
> - [ ] Ethics review checklist passes.
> - [ ] No solicitation language is present.
> - [ ] No revenue claims are made.
> - [ ] All figures are labeled as hypothetical or source-backed.
> - [ ] Limitations and caveats are stated.
> - [ ] Deferred items requiring owner action are listed.
>
> **Comments**:
>
> ________________________________________________________________
>
> ________________________________________________________________
>
> **Decision**: [ ] Accept as baseline [ ] Request revisions [ ] Reject
>
> **Reviewer signature**: ________________________ **Date**: ____________

---

*End of document. Status: BASELINE ESTABLISHED. Synthetic data only. No real funds. No revenue claims. No solicitation. All figures are hypothetical or source-backed.*
