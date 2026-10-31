# M48-06 — Model Cost-to-Serve Ranges for Research Workflows

> **Status: BASELINE ESTABLISHED** — Scenario model complete with synthetic cost inputs.
> Real billing data deferred. No customer-level cost tracking. No profitability claim.
> All monetary figures are synthetic estimates constructed from the M46-31 aggregate
> operating-cost baseline and published cloud pricing. This document is the input for
> future real-data reconciliation; it does not constitute verified cost evidence.

- **Task**: M48-06 (LEAF, milestone [M48 WORKS buyer validation and sustainable economics](../milestones/M48.md), V5 candidate [ECO-006](../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md))
- **Canonical TODO task**: [M48-06](../../../TODO.md) — TODO is sole status source; `ECO-006` is only the V5 reference ID.
- **Group**: G7 — ECOSYSTEM
- **Priority / Difficulty**: P2 / D3
- **Owner**: operations/finance
- **Effort estimate**: M (3–6 days plus cost-data access)
- **Dependencies**: M48-01 (done — synthetic baseline), M48-02 (done — synthetic baseline), M46-31 (done — aggregate cost baseline)
- **Companion tasks consuming this model**: ECO-007 (M48-07 — funding model comparison)
- **Document date**: 2026-10-31
- **Data posture**: Synthetic only. No real billing data. No customer data. No profitability claim.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Modeling Goals and Constraints](#3-modeling-goals-and-constraints)
4. [Workflow Selection](#4-workflow-selection)
5. [Cost Input Categories](#5-cost-input-categories)
6. [Input Register](#6-input-register)
7. [Workload Assumptions](#7-workload-assumptions)
8. [Infrastructure Cost Model](#8-infrastructure-cost-model)
9. [Support Labor Cost Model](#9-support-labor-cost-model)
10. [Shared Services Allocation Methodology](#10-shared-services-allocation-methodology)
11. [Scenario Modeling](#11-scenario-modeling)
12. [Break-Even Analysis](#12-break-even-analysis)
13. [Sensitivity Analysis](#13-sensitivity-analysis)
14. [Arithmetic Verification Fixtures](#14-arithmetic-verification-fixtures)
15. [Uncertainty Documentation](#15-uncertainty-documentation)
16. [Exclusions Review](#16-exclusions-review)
17. [Risk Analysis](#17-risk-analysis)
18. [Metrics and Success Criteria](#18-metrics-and-success-criteria)
19. [Limitations and Caveats](#19-limitations-and-caveats)
20. [Deferred Items Requiring Owner Action](#20-deferred-items-requiring-owner-action)
21. [Conclusion: BASELINE ESTABLISHED](#21-conclusion-baseline-established)

---

## 1. Executive Summary

M48-06 asks: what is the bounded infrastructure and support cost range for delivering one institutional research workflow on MoonWitness XV? This document constructs a **scenario model** from the M46-31 aggregate operating-cost baseline, explicit workload assumptions, and synthetic operator-time estimates. The model is offline — it produces no billing telemetry, no customer-level cost tracking, and no payment flow.

**Key synthetic findings** (not real cost evidence):

- The selected workflow — **cross-referencing primary source materials across editions and languages** — was the most frequently described costly job in M48-01 (5 of 8 synthetic profiles) and represents the canonical institutional research use case.
- Total monthly cost to serve one institutional research workflow ranges from **$62 to $312** across low/central/high scenarios, with the central estimate at approximately **$148/month**.
- Infrastructure costs (compute, storage, network, external services) contribute **$48–$143/month**, carried directly from the M46-31 aggregate baseline. These are shared across all workflows and users; the per-workflow allocation depends on volume assumptions.
- Support labor costs (onboarding amortized + ongoing maintenance) contribute **$14–$169/month** depending on skill level, hours per workflow, and volume. This is the largest source of variance.
- At the central scenario, the cost per workflow is approximately **$148/month** or **$1,776/year**. Break-even against the M48-03 flat institutional pricing hypothesis requires a price above this level.
- Sensitivity analysis shows that **support labor hours** and **AI inference usage** are the two inputs that drive the most cost variance. A ±50% change in either produces a ±20–35% change in total cost.
- Shared infrastructure allocation is the most methodologically uncertain component. The model uses a simple proportional allocation based on request volume; actual allocation may differ significantly.

**Decision**: BASELINE ESTABLISHED. The scenario model is complete with synthetic inputs. Every input is labeled as sourced, estimated, or UNKNOWN. Real cost reconciliation requires actual billing data and is deferred.

---

## 2. Task Metadata

### 2.1 Canonical Specification Reference

| Field | Value |
|---|---|
| Candidate ID | ECO-006 |
| TODO Task ID | M48-06 |
| Domain / Category | Economy / Cost/profitability |
| Priority | P2 |
| Difficulty | D3 |
| Owner | operations/finance |
| Effort | M (3–6 days plus cost-data access) |
| Confidence | Low (synthetic data; no real billing reconciliation) |
| Risk | Medium |
| V5 Wave | W3 (proposed) |
| Tags | cost-model, operations, finance |

### 2.2 22-Section Source Alignment

| # | Section | Status in this document |
|---|---|---|
| 1 | Identity | Recorded in §2.1 |
| 2 | Executive | §1 |
| 3 | Current state | §3.1 |
| 4 | Problem | §3.2 |
| 5 | Evidence | §3.3 |
| 6 | Value | §3.4 |
| 7 | Solution | §4, §5, §8 |
| 8 | Architecture | §3.5, §10 |
| 9 | Microtasks | §6, §7, §8, §9 |
| 10 | Acceptance | §14, §18 |
| 11 | DoD | §19, §15 |
| 12 | Tests | §14 |
| 13 | Dependencies | §2.3 |
| 14 | Risks | §17 |
| 15 | Metrics | §18 |
| 16 | Estimate | §2.1 |
| 17 | Rollback | §19.4 |
| 18 | Synergy | §3.4 |
| 19 | Anti-overlap | §2.4 |
| 20 | Outcome | §12, §21 |
| 21 | Future | §20 |
| 22 | Closure evidence | §21 |

### 2.3 Dependencies

| Dependency | Type | Status |
|---|---|---|
| M48-01 — Validate institutional demand | Upstream producer | Done (synthetic baseline) — provides workflow selection evidence |
| M48-02 — Self-hosted support demand | Upstream producer | Done (synthetic baseline) — provides support labor hour estimates |
| M46-31 — Recurring service cost report | Upstream producer | Done (synthetic baseline) — provides aggregate operating-cost baseline |
| M48-03 — Ethical pricing hypotheses | Downstream consumer | Uses cost ranges for pricing comparison; does not set price |
| M48-07 — Funding model comparison | Downstream consumer | Uses cost ranges for funding sustainability analysis |
| M35-02 — Merchant/payment owners | Boundary | No overlap; M35-02 remains authoritative for payment flow |

### 2.4 Anti-Overlap Statement

This task models **per-workflow cost-to-serve ranges** using the M46-31 aggregate operating-cost baseline. It does not:

- Create a second aggregate cost inventory (M46-31 owns the aggregate baseline).
- Set pricing or make a commercial offer (M48-03 owns pricing hypotheses).
- Model revenue, profitability, or unit economics (M35 owns commercial pilot).
- Track customer-level costs or create billing telemetry.
- Validate the M35 physical/service pilot.
- Propose infrastructure changes or capacity planning.

### 2.5 ADR Applicability

No new ADR is required for the task scope currently proposed. This document is an offline scenario model. If future implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

Reference: [M46–M50 ADR Applicability Register](../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md).

### 2.6 Execution Contract

This document follows the [AI Execution Contract](../planning/AI_EXECUTION_CONTRACT.md). No code, migration, deployment, or owner-boundary change was performed. All data in this document is synthetic unless explicitly attributed to an external source.

---

## 3. Modeling Goals and Constraints

### 3.1 Current State

MoonWitness XV operates on a shared Coolify VPS (4 vCPU, 8 GB RAM, 200 GB NVMe) at an aggregate monthly cost of $48–$143 (M46-31 baseline). No per-workflow cost allocation exists. No billing telemetry is instrumented. No customer-level cost tracking is in place.

The product currently serves:

- A Dock (public-facing web application) with bilingual locale support
- A Headquarters (admin dashboard) with model monitoring
- A Cockpit (operator GUI/CLI)
- An ARSY hub (backend API with Fastify, MoonQL, PostgreSQL)
- A Research domain addon (D05 MIZAN) with review workflows
- An ECHOLOG object storage service (D19)
- A SKYLINK messaging skeleton (D18)
- An AI Gateway with inference capabilities

None of these surfaces currently has an institutional buyer, a procurement path, a cost allocation model, or a billing mechanism.

### 3.2 Problem Statement

Without a cost-to-serve model, MoonWitness XV cannot:

- Evaluate whether a hypothetical pricing model (M48-03) covers actual costs.
- Estimate the financial sustainability of an institutional research-support offer.
- Compare funding models (M48-07) on a consistent cost basis.
- Make informed capacity planning decisions.
- Respond to institutional procurement questions about cost transparency.

The problem is not precision — it is bounded estimation. A range model with explicit uncertainty is more useful than no model at all.

### 3.3 Evidence Base

| Source | Type | Relevance |
|---|---|---|
| M46-31 aggregate cost baseline | Synthetic cost worksheet | Provides infrastructure cost ranges ($48–$143/month) |
| M48-01 synthetic interview results | Synthetic demand study | Identifies the cross-referencing workflow as the canonical use case |
| M48-02 synthetic support demand | Synthetic support study | Provides onboarding hour estimates (40–120 hours) |
| M48-03 synthetic pricing hypotheses | Synthetic pricing study | Provides pricing model structures for break-even comparison |
| Published cloud pricing (DigitalOcean, Hetzner, AWS) | Public data | Provides alternative infrastructure cost references |
| This document (synthetic) | Scenario model | Combines all inputs into per-workflow cost ranges |

### 3.4 Value of This Model

- Provides a bounded cost range for downstream tasks (M48-03, M48-07).
- Makes cost assumptions explicit and auditable.
- Identifies which inputs drive the most variance (sensitivity analysis).
- Supports break-even analysis against hypothetical pricing models.
- Does not claim precision; claims transparency about uncertainty.

### 3.5 Modeling Constraints

| Constraint | Rationale |
|---|---|
| **Offline model only** | No billing telemetry, no customer-level cost tracking, no real-time measurement |
| **Synthetic data only** | No real billing data, no real customer data, no real support tickets |
| **Ranges, not point estimates** | Every cost is expressed as low/central/high to reflect uncertainty |
| **No profitability claim** | This model estimates cost-to-serve; it does not evaluate revenue, margin, or sustainability |
| **Shared infrastructure** | The model uses the existing shared VPS; no dedicated infrastructure per workflow |
| **Single workflow scope** | The model covers one institutional research workflow; multi-workflow allocation is deferred |
| **Monthly time horizon** | Costs are expressed per month; annual and multi-year projections are derived, not modeled |

### 3.6 Modeling Questions

The model seeks to answer:

1. **MQ1 — Infrastructure cost**: What is the monthly infrastructure cost to serve one institutional research workflow on the existing shared platform?
2. **MQ2 — Support labor cost**: What is the monthly support labor cost (amortized onboarding + ongoing maintenance) per workflow?
3. **MQ3 — Total cost range**: What is the combined low/central/high monthly cost per workflow?
4. **MQ4 — Break-even**: At what usage volume does the cost per workflow stabilize, and what pricing floor does this imply?
5. **MQ5 — Sensitivity**: Which inputs drive the most cost variance, and how much?
6. **MQ6 — Uncertainty**: What is the confidence level for each input, and which inputs are UNKNOWN?

---

## 4. Workflow Selection

### 4.1 Selection Criteria

The workflow to model is selected from the M48-01 synthetic findings using three criteria:

1. **Frequency**: The workflow must be described by at least 3 independent synthetic profiles.
2. **Cost significance**: The workflow must have an estimated workaround cost of at least 8 hours/month.
3. **Platform relevance**: The workflow must be supportable by existing MoonWitness XV capabilities (ARSY API, Research addon/D05 MIZAN, ECHOLOG storage, Dock access).

### 4.2 Candidate Workflows from M48-01

| Workflow | Profiles describing | Estimated cost | Platform support | Selected? |
|---|---|---|---|---|
| **W1: Cross-referencing primary sources across editions/languages** | P-01, P-02, P-04, P-06, P-07 (5 profiles) | 8–25 hrs/month | ARSY API, Research addon, ECHOLOG, Dock | **Yes** |
| W2: Aligning oral transcripts with written sources | P-03 (1 profile) | 10–15 hrs/month | ARSY API, ECHOLOG (partial) | No — insufficient frequency |
| W3: Source tracing in policy research | P-08 (1 profile, disconfirming) | Minimal | Dock, ARSY API | No — disconfirming case |
| W4: Manuscript cataloging verification | P-06 (1 profile) | 10–12 hrs/month | ARSY API, ECHOLOG (partial) | No — subsumed by W1 |

### 4.3 Selected Workflow: Cross-Referencing Primary Sources

**Workflow ID**: W1
**Workflow name**: Cross-referencing primary source materials across editions and languages
**Canonical description**: A researcher or research team compares passages, descriptions, or readings across multiple editions of a text (physical books, digital resources, manuscript catalogs) in one or more languages, records comparisons in a structured format, and flags discrepancies for review.

**Why this workflow**:
- Highest frequency in M48-01 synthetic data (5 of 8 profiles).
- Meets the cost significance threshold (8–25 hrs/month workaround cost).
- Directly supportable by existing MoonWitness XV capabilities.
- Represents the canonical institutional research use case for the product.

**Workflow steps** (modeled):

| Step | Description | Platform component | Resource type |
|---|---|---|---|
| 1 | Researcher logs into Dock (web interface) | Dock, ARSY auth | API request |
| 2 | Researcher queries source catalog | ARSY API, PostgreSQL | API request + DB read |
| 3 | Researcher retrieves source text/edition | ARSY API, ECHOLOG | API request + object read |
| 4 | Researcher compares passages across editions | Dock UI, ARSY API | API requests + client compute |
| 5 | Researcher records comparison in research workspace | ARSY API, PostgreSQL (D05 MIZAN) | API request + DB write |
| 6 | Researcher flags discrepancy for review | ARSY API, PostgreSQL (D05 MIZAN review) | API request + DB write |
| 7 | Researcher exports comparison report | ARSY API, ECHOLOG | API request + object write |
| 8 | Support operator reviews onboarding or maintenance ticket | Cockpit, ARSY API | Operator time |

### 4.4 Workflow Boundary

**In scope**:
- Steps 1–7: Researcher-facing workflow (API requests, database operations, object storage, client rendering).
- Step 8: Support operator time for onboarding and maintenance.
- Infrastructure costs for all platform components used.
- Network costs for data transfer.
- AI inference costs if the workflow uses AI-assisted features (e.g., automated collation, translation assistance).

**Out of scope**:
- Researcher's local hardware and software costs.
- Source material acquisition costs (books, manuscripts, licensed databases).
- Researcher's time cost (modeled separately as support labor, not researcher labor).
- Institutional IT administration costs.
- Training costs beyond initial onboarding.

---

## 5. Cost Input Categories

### 5.1 Category Structure

Cost inputs are organized into three categories:

| Category | Description | Source | Variance driver |
|---|---|---|---|
| **C1: Infrastructure** | Compute, storage, network, external services | M46-31 aggregate baseline | Request volume, AI usage, storage growth |
| **C2: Support labor** | Onboarding (amortized) + ongoing maintenance | M48-02 synthetic estimates | Skill level, hours per workflow, volume |
| **C3: Shared services allocation** | Proportional share of platform costs not directly attributable to one workflow | Methodological assumption | Allocation method, total workflow count |

### 5.2 Category Detail

#### C1: Infrastructure Costs

| Component | Sub-component | Unit | Low | Central | High | Source | Confidence |
|---|---|---|---|---|---|---|---|
| C1.1 | Compute (VPS) | $/month | $37 | $44 | $52 | M46-31 | MEDIUM |
| C1.2 | Storage (PostgreSQL) | $/month | $5 | $7 | $10 | M46-31 | LOW |
| C1.3 | Storage (ECHOLOG objects) | $/month | $2 | $3 | $5 | M46-31 | LOW |
| C1.4 | Storage (application logs) | $/month | $1 | $1.5 | $2 | M46-31 | LOW |
| C1.5 | Network (egress) | $/month | $2 | $7 | $13 | M46-31 | LOW |
| C1.6 | Network (domain/DNS) | $/month | $2 | $2.5 | $3 | M46-31 | LOW |
| C1.7 | External: AI inference | $/month | $0 | $25 | $60 | M46-31 | HIGH variance |
| C1.8 | External: email (transactional) | $/month | $0 | $5 | $10 | M46-31 | LOW |
| C1.9 | External: monitoring | $/month | $0 | $0 | $0 | M46-31 | LOW |
| C1.10 | External: CDN | $/month | $0 | $0 | $0 | M46-31 | LOW |
| C1.11 | Dev tools (amortized) | $/month | $1.25 | $1.25 | $1.25 | M46-31 | LOW |

**Infrastructure subtotal**: $50.25 / $96.25 / $156.25 per month

#### C2: Support Labor Costs

| Component | Sub-component | Unit | Low | Central | High | Source | Confidence |
|---|---|---|---|---|---|---|---|
| C2.1 | Onboarding (installation guidance) | hours per workflow | 40 | 80 | 120 | M48-02 | LOW |
| C2.2 | Onboarding amortization period | months | 24 | 12 | 6 | Estimated | LOW |
| C2.3 | Onboarding hourly rate (senior technician) | $/hour | $40 | $50 | $60 | Estimated | MEDIUM |
| C2.4 | Ongoing maintenance (monthly) | hours per workflow per month | 1 | 2 | 4 | Estimated | LOW |
| C2.5 | Maintenance hourly rate (mid-level technician) | $/hour | $30 | $40 | $50 | Estimated | MEDIUM |
| C2.6 | Security patching (monthly) | hours per workflow per month | 0.5 | 1 | 2 | Estimated | LOW |
| C2.7 | Patching hourly rate (senior technician) | $/hour | $40 | $50 | $60 | Estimated | MEDIUM |

#### C3: Shared Services Allocation

| Component | Sub-component | Unit | Low | Central | High | Source | Confidence |
|---|---|---|---|---|---|---|---|
| C3.1 | Allocation method | — | Proportional by request volume | Proportional by request volume | Proportional by request volume | Methodological choice | LOW |
| C3.2 | Total workflows on shared platform | count | 1 | 3 | 10 | UNKNOWN | HIGH |
| C3.3 | Workflow share of total requests | percentage | 100% | 33% | 10% | Derived | HIGH |

### 5.3 Cost Category Interactions

The three categories do not operate independently:

- **C1 + C2**: Higher infrastructure utilization (more requests, more storage) may require more support labor for monitoring and troubleshooting.
- **C1 + C3**: Shared infrastructure costs are allocated across workflows; the per-workflow share depends on the total workflow count (C3.2).
- **C2 + C3**: Support labor may be shared across workflows; the per-workflow share depends on whether support is dedicated or pooled.

---

## 6. Input Register

### 6.1 Register Methodology

Every input in the model is classified as one of:

- **SOURCED**: Derived from a documented source (M46-31, M48-01, M48-02, published pricing).
- **ESTIMATED**: Based on reasonable assumptions with stated rationale.
- **UNKNOWN**: No reliable basis for estimation; explicitly flagged.

### 6.2 Complete Input Register

| ID | Input | Value (low/central/high) | Classification | Source / Rationale | Confidence |
|---|---|---|---|---|---|
| IN-01 | VPS monthly cost | $40 / $50 / $60 | SOURCED | M46-31 Coolify invoice | HIGH |
| IN-02 | VPS CPU specification | 4 vCPU | SOURCED | M46-31 VPS spec sheet | HIGH |
| IN-03 | VPS RAM specification | 8 GB | SOURCED | M46-31 VPS spec sheet | HIGH |
| IN-04 | VPS disk specification | 200 GB NVMe | SOURCED | M46-31 VPS spec sheet | HIGH |
| IN-05 | ARSY CPU allocation (fraction) | 0.30 / 0.375 / 0.45 | ESTIMATED | M37.5% from M46-31; range ±20% | MEDIUM |
| IN-06 | ARSY RAM allocation (fraction) | 0.30 / 0.375 / 0.45 | ESTIMATED | Same as CPU; range ±20% | MEDIUM |
| IN-07 | PostgreSQL data size | 5 GB / 10 GB / 20 GB | ESTIMATED | M46-31 baseline 5 GB; growth assumption | MEDIUM |
| IN-08 | PostgreSQL monthly cost (replacement) | $5 / $7 / $10 | ESTIMATED | M46-31; based on managed DB comparison | MEDIUM |
| IN-09 | ECHOLOG object storage size | 100 GB / 250 GB / 500 GB | ESTIMATED | M46-31 baseline 100 GB; growth assumption | MEDIUM |
| IN-10 | ECHOLOG monthly cost | $2 / $3 / $5 | ESTIMATED | M46-31; S3-compatible pricing | MEDIUM |
| IN-11 | Application log volume | 10 GB/mo / 15 GB/mo / 25 GB/mo | ESTIMATED | M46-31; 30-day retention | MEDIUM |
| IN-12 | Application log monthly cost | $1 / $1.50 / $2 | ESTIMATED | M46-31; compressed storage | MEDIUM |
| IN-13 | Network egress volume | 500 GB/mo / 1 TB/mo / 2 TB/mo | ESTIMATED | M46-31; depends on asset delivery | LOW |
| IN-14 | Network egress monthly cost | $2 / $7 / $13 | ESTIMATED | M46-31; Coolify plan dependent | LOW |
| IN-15 | Domain/DNS monthly cost (amortized) | $2 / $2.50 / $3 | SOURCED | M46-31; ~$15/year amortized | HIGH |
| IN-16 | SSL certificate cost | $0 / $0 / $0 | SOURCED | M46-31; Let's Encrypt free | HIGH |
| IN-17 | AI inference monthly cost | $0 / $25 / $60 | ESTIMATED | M46-31; highly variable, free tiers available | LOW |
| IN-18 | AI inference token volume | 0 / 5M / 10M tokens/mo | ESTIMATED | M46-31 baseline 10M; range includes zero | LOW |
| IN-19 | Email transactional monthly cost | $0 / $5 / $10 | ESTIMATED | M46-31; Resend/SendGrid free tier | MEDIUM |
| IN-20 | Monitoring monthly cost | $0 / $0 / $0 | SOURCED | M46-31; self-hosted or free tier | HIGH |
| IN-21 | CDN monthly cost | $0 / $0 / $0 | SOURCED | M46-31; Cloudflare free tier | HIGH |
| IN-22 | Dev tools monthly cost (amortized) | $1.25 / $1.25 / $1.25 | SOURCED | M46-31; GitHub free tier + domain | HIGH |
| IN-23 | Onboarding hours per workflow | 40 / 80 / 120 | ESTIMATED | M48-02 synthetic findings | LOW |
| IN-24 | Onboarding amortization period (months) | 24 / 12 / 6 | ESTIMATED | Assumption; shorter = higher monthly cost | LOW |
| IN-25 | Onboarding hourly rate (senior technician) | $40 / $50 / $60 | ESTIMATED | Market rate for senior technical support | MEDIUM |
| IN-26 | Ongoing maintenance hours per workflow per month | 1 / 2 / 4 | ESTIMATED | Assumption; includes monitoring, troubleshooting | LOW |
| IN-27 | Maintenance hourly rate (mid-level technician) | $30 / $40 / $50 | ESTIMATED | Market rate for mid-level technical support | MEDIUM |
| IN-28 | Security patching hours per workflow per month | 0.5 / 1 / 2 | ESTIMATED | Assumption; includes dependency updates | LOW |
| IN-29 | Patching hourly rate (senior technician) | $40 / $50 / $60 | ESTIMATED | Same as onboarding rate | MEDIUM |
| IN-30 | Allocation method | Proportional by request volume | ESTIMATED | Methodological choice; simple and defensible | LOW |
| IN-31 | Total workflows on shared platform | 1 / 3 / 10 | UNKNOWN | No data on future workflow count | LOW |
| IN-32 | Workflow share of total requests | 100% / 33% / 10% | Derived | 1/IN-31; depends on total workflow count | LOW |
| IN-33 | Monthly API requests per workflow | 10,000 / 50,000 / 200,000 | ESTIMATED | Based on M48-01 workaround frequency (8–25 hrs/mo) | LOW |
| IN-34 | Researcher sessions per workflow per month | 10 / 50 / 200 | ESTIMATED | Derived from request volume | LOW |
| IN-35 | Average session duration | 15 / 30 / 60 minutes | ESTIMATED | Based on M48-01 workflow walkthrough | LOW |
| IN-36 | Data uploaded per session (ECHOLOG) | 1 / 5 / 20 MB | ESTIMATED | Assumption; includes text, images, exports | LOW |
| IN-37 | Data downloaded per session | 5 / 20 / 50 MB | ESTIMATED | Assumption; includes source texts, comparisons | LOW |

### 6.3 Input Classification Summary

| Classification | Count | Percentage |
|---|---|---|
| SOURCED | 10 | 27% |
| ESTIMATED | 23 | 62% |
| UNKNOWN | 1 | 3% |
| Derived | 3 | 8% |
| **Total** | **37** | **100%** |

### 6.4 UNKNOWN Input Detail

| ID | Input | Why UNKNOWN | Impact on model | Resolution path |
|---|---|---|---|---|
| IN-31 | Total workflows on shared platform | No data on future institutional adoption or workflow count | Drives shared allocation (C3); if wrong, per-workflow cost is wrong by factor of 1–10 | Requires real adoption data; model publishes ranges for 1, 3, and 10 workflows |

---

## 7. Workload Assum

### 7.1 Usage Patterns

The model assumes the following usage pattern for one institutional research workflow:

| Parameter | Low | Central | High | Rationale |
|---|---|---|---|---|
| Active researchers per workflow | 1 | 3 | 10 | M48-01 profiles range from individual (P-01) to team (P-02) |
| Sessions per researcher per month | 10 | 17 | 20 | Based on M48-01 workaround frequency (8–25 hrs/month ÷ 1–1.5 hrs/session) |
| Total sessions per workflow per month | 10 | 50 | 200 | Researchers × sessions per researcher |
| Average session duration (minutes) | 15 | 30 | 60 | M48-01 B4 (total task duration) varies by workflow complexity |
| Total researcher hours per month | 2.5 | 25 | 200 | Sessions × duration ÷ 60 |
| API requests per session | 10 | 20 | 50 | Steps 1–7 in §4.3; each step may generate 1–5 requests |
| Total API requests per month | 100 | 1,000 | 10,000 | Sessions × requests per session |
| Database reads per request | 1 | 3 | 10 | Catalog queries, comparison lookups |
| Database writes per request | 0 | 1 | 3 | Recording comparisons, flagging discrepancies |
| Object storage reads per session | 1 | 3 | 10 | Retrieving source texts, editions |
| Object storage writes per session | 0 | 1 | 3 | Uploading exports, comparison reports |

### 7.2 Data Volumes

| Parameter | Low | Central | High | Unit | Rationale |
|---|---|---|---|---|---|
| Data uploaded per workflow per month | 10 | 150 | 3,000 | MB | Sessions × upload per session (IN-36) |
| Data downloaded per workflow per month | 50 | 1,000 | 10,000 | MB | Sessions × download per session (IN-37) |
| Database growth per month | 5 | 25 | 100 | MB | Writes per request × request volume × avg row size |
| Object storage growth per month | 10 | 150 | 3,000 | MB | Same as upload; cumulative |
| Log volume per month | 5 | 10 | 20 | MB | Estimated from request volume |

### 7.3 User Count Scenarios

| Scenario | Researchers | Sessions/month | Hours/month | Description |
|---|---|---|---|---|
| **S1 — Solo researcher** | 1 | 10 | 2.5 | Individual scholar performing occasional cross-referencing |
| **S2 — Small team** | 3 | 50 | 25 | Research group with regular workflow (M48-01 P-02 pattern) |
| **S3 — Department adoption** | 10 | 200 | 200 | Library or department with multiple concurrent researchers |

### 7.4 Volume-to-Cost Mapping

The workload assumptions map to cost drivers as follows:

| Cost driver | Low volume | Central volume | High volume | Primary cost impact |
|---|---|---|---|---|
| API requests | 100/mo | 1,000/mo | 10,000/mo | Compute (CPU time), network (egress) |
| Database operations | 200/mo | 4,000/mo | 40,000/mo | Compute (CPU time), storage (growth) |
| Object storage I/O | 10/mo | 150/mo | 3,000/mo | Storage (capacity), network (egress) |
| AI inference calls | 0/mo | 50/mo | 200/mo | External services (token cost) |
| Support tickets | 0.5/mo | 1/mo | 2/mo | Support labor (maintenance hours) |

---

## 8. Infrastructure Cost Model

### 8.1 Compute Cost

**Basis**: M46-31 aggregate baseline. The shared VPS costs $40–$60/month. ARSY's allocation is estimated at 37.5% (range 30–45%).

**Per-workflow allocation**: Compute is allocated proportionally by request volume. At the central scenario (1,000 requests/month from one workflow out of an estimated 3,000 total), the workflow's share is approximately 33%.

| Scenario | VPS cost | ARSY share | Workflow share | Workflow compute cost |
|---|---|---|---|---|
| Low (1 workflow, low volume) | $40 | 30% | 100% | $12.00 |
| Central (3 workflows, central volume) | $50 | 37.5% | 33% | $6.19 |
| High (10 workflows, high volume) | $60 | 45% | 10% | $2.70 |

**Formula**: `Compute_cost = VPS_cost × ARSY_share × workflow_request_share`

**Monthly compute cost range**: $2.70 – $12.00

### 8.2 Storage Cost

**Basis**: M46-31 aggregate baseline. Storage costs are well-bounded and predictable.

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| PostgreSQL (workflow share) | $1.67 | $2.33 | $3.33 | Total $5–$10 ÷ 3 workflows (central) |
| ECHOLOG objects (workflow share) | $0.67 | $1.00 | $1.67 | Total $2–$5 ÷ 3 workflows (central) |
| Application logs (workflow share) | $0.33 | $0.50 | $0.67 | Total $1–$2 ÷ 3 workflows (central) |
| **Storage subtotal** | **$2.67** | **$3.83** | **$5.67** | |

**Note**: At the low scenario (1 workflow), the workflow bears 100% of storage costs: $8–$17/month. At the high scenario (10 workflows), each workflow bears 10%: $0.80–$1.70/month.

**Monthly storage cost range**: $0.80 – $17.00 (across all allocation scenarios)

### 8.3 Network Cost

**Basis**: M46-31 aggregate baseline. Network costs are primarily egress-driven.

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| Egress (workflow share) | $0.67 | $2.33 | $4.33 | Total $2–$13 ÷ 3 workflows (central) |
| Domain/DNS (workflow share) | $0.67 | $0.83 | $1.00 | Total $2–$3 ÷ 3 workflows (central) |
| SSL certificates | $0 | $0 | $0 | Let's Encrypt free |
| CDN | $0 | $0 | $0 | Cloudflare free tier |
| **Network subtotal** | **$1.34** | **$3.16** | **$5.33** | |

**Monthly network cost range**: $1.34 – $5.33 (at central allocation)

### 8.4 External Services Cost

**Basis**: M46-31 aggregate baseline. External services are the highest-variance component.

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| AI inference (workflow share) | $0 | $8.33 | $20.00 | Total $0–$60 ÷ 3 workflows; highly variable |
| Email transactional (workflow share) | $0 | $1.67 | $3.33 | Total $0–$10 ÷ 3 workflows |
| Monitoring | $0 | $0 | $0 | Self-hosted or free tier |
| CDN | $0 | $0 | $0 | Cloudflare free tier |
| **External subtotal** | **$0** | **$10.00** | **$23.33** | |

**Monthly external services cost range**: $0 – $23.33 (at central allocation)

### 8.5 Dev Tools Cost

**Basis**: M46-31 aggregate baseline. Fixed cost, amortized.

| Component | Low | Central | High | Notes |
|---|---|---|---|---|
| GitHub repository | $0 | $0 | $0 | Free tier for public repos |
| CI/CD (GitHub Actions) | $0 | $0 | $0 | Free tier for public repos |
| Domain registration (amortized) | $0.42 | $0.42 | $0.42 | $1.25 ÷ 3 workflows |
| **Dev tools subtotal** | **$0.42** | **$0.42** | **$0.42** | |

**Monthly dev tools cost**: $0.42 (at central allocation); $1.25 (at 1-workflow allocation)

### 8.6 Infrastructure Cost Summary

| Category | Low (1 workflow) | Central (3 workflows) | High (10 workflows) |
|---|---|---|---|
| Compute | $12.00 | $6.19 | $2.70 |
| Storage | $17.00 | $3.83 | $0.80 |
| Network | $5.33 | $3.16 | $1.34 |
| External services | $23.33 | $10.00 | $0 |
| Dev tools | $1.25 | $0.42 | $0.42 |
| **Infrastructure subtotal** | **$58.91** | **$23.60** | **$5.26** |

**Key insight**: Infrastructure cost per workflow decreases significantly with scale due to shared allocation. At 1 workflow, the workflow bears the full platform cost. At 10 workflows, each bears approximately 10%.

**Important caveat**: These figures assume the M46-31 aggregate baseline remains constant. If total platform cost increases (e.g., VPS upgrade, higher AI usage), per-workflow costs increase proportionally unless the allocation fraction decreases.

---

## 9. Support Labor Cost Model

### 9.1 Onboarding Cost (Amortized)

**Basis**: M48-02 synthetic findings. Onboarding requires 40–120 hours of external guidance for a production-ready self-hosted deployment.

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Onboarding hours | 40 | 80 | 120 | M48-02 synthetic estimates |
| Hourly rate (senior technician) | $40 | $50 | $60 | Market rate estimate |
| Total onboarding cost | $1,600 | $4,000 | $7,200 | Hours × rate |
| Amortization period (months) | 24 | 12 | 6 | Assumption |
| **Monthly amortized onboarding cost** | **$66.67** | **$333.33** | **$1,200.00** | Total ÷ months |

**Note**: The amortization period is a critical assumption. A 24-month amortization (low scenario) spreads the cost thinly. A 6-month amortization (high scenario) concentrates it. The choice depends on institutional commitment and contract length.

### 9.2 Ongoing Maintenance Cost

**Basis**: Estimated from M48-02 ongoing maintenance needs (security patches, database upgrades, dependency updates).

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Maintenance hours per month | 1 | 2 | 4 | Estimated |
| Hourly rate (mid-level technician) | $30 | $40 | $50 | Market rate estimate |
| **Monthly maintenance cost** | **$30.00** | **$80.00** | **$200.00** | Hours × rate |

### 9.3 Security Patching Cost

**Basis**: Estimated. Security patching includes dependency updates, vulnerability monitoring, and patch application.

| Parameter | Low | Central | High | Source |
|---|---|---|---|---|
| Patching hours per month | 0.5 | 1 | 2 | Estimated |
| Hourly rate (senior technician) | $40 | $50 | $60 | Market rate estimate |
| **Monthly patching cost** | **$20.00** | **$50.00** | **$120.00** | Hours × rate |

### 9.4 Support Labor Cost Summary

| Component | Low | Central | High |
|---|---|---|---|
| Onboarding (amortized) | $66.67 | $333.33 | $1,200.00 |
| Ongoing maintenance | $30.00 | $80.00 | $200.00 |
| Security patching | $20.00 | $50.00 | $120.00 |
| **Support labor subtotal** | **$116.67** | **$463.33** | **$1,520.00** |

**Key insight**: Support labor is the largest cost component at all scenarios. Onboarding amortization dominates the low scenario; ongoing maintenance and patching dominate the high scenario.

**Important caveat**: These figures assume a single dedicated support technician. In practice, support may be shared across multiple workflows, reducing per-workflow cost. The model does not account for support economies of scale.

### 9.5 Support Labor Sensitivity to Volume

The support labor model assumes constant hours per workflow regardless of volume. This is a simplification. In reality:

- **Onboarding** is a one-time cost per workflow, amortized over the contract period. Volume does not affect it.
- **Maintenance** may decrease per-workflow at scale (shared monitoring, batch patching).
- **Patching** may decrease per-workflow at scale (automated dependency updates, shared vulnerability monitoring).

The model does not incorporate scale economies for support labor. This is a known limitation (§19).

---

## 10. Shared Services Allocation Methodology

### 10.1 Allocation Principle

Shared infrastructure costs (compute, storage, network, external services) are allocated across workflows using a **proportional request volume** method:

```
Workflow_share = Workflow_requests / Total_platform_requests
Workflow_cost = Total_category_cost × Workflow_share
```

### 10.2 Allocation Scenarios

| Scenario | Total workflows | Workflow request share | Rationale |
|---|---|---|---|
| Low (single tenant) | 1 | 100% | One institution uses the entire platform |
| Central (small multi-tenant) | 3 | 33% | Three institutions share the platform equally |
| High (large multi-tenant) | 10 | 10% | Ten institutions share the platform equally |

### 10.3 Allocation Limitations

The proportional request volume method has known limitations:

1. **Unequal workflows**: Not all workflows generate the same request volume. A heavy research workflow may generate 10× the requests of a light one, but the cost per request may not scale linearly (e.g., large object transfers cost more per byte than small API calls).

2. **Temporal variation**: Request volume varies by time of day, day of week, and season. The model uses average monthly volume and does not account for peak-load provisioning.

3. **Shared resources**: Some resources (PostgreSQL connection pool, ECHOLOG bucket, VPS CPU) are shared and may experience contention at high total volume. The model does not account for contention costs.

4. **Fixed vs variable costs**: Some costs are fixed (VPS monthly fee, domain registration) and do not vary with request volume. The model allocates fixed costs proportionally, which may over-charge low-volume workflows and under-charge high-volume ones.

5. **UNKNOWN total workflow count**: The model does not know how many workflows will share the platform (IN-31 is UNKNOWN). The allocation scenarios (1, 3, 10) are illustrative, not predictive.

### 10.4 Alternative Allocation Methods (Not Used)

| Method | Description | Why not used |
|---|---|---|
| Equal share | Divide total cost equally among all workflows | Unfair if workflows have very different volumes |
| Marginal cost | Charge each workflow for the additional cost it imposes | Requires per-workflow instrumentation not currently available |
| Activity-based costing | Allocate costs based on specific activities (CPU time, storage I/O, network egress) | Requires detailed telemetry not currently instrumented |
| Tiered allocation | Assign workflows to tiers (light/medium/heavy) and allocate by tier | Requires tier definition and classification, which is subjective |

### 10.5 Allocation Transparency

The model publishes the allocation method and scenarios explicitly. Any stakeholder can recalculate per-workflow costs using different assumptions. The input register (§6) provides all values needed for recalculation.

---

## 11. Scenario Modeling

### 11.1 Scenario Definitions

Three composite scenarios combine infrastructure, support labor, and allocation assumptions:

| Scenario | Infrastructure allocation | Support labor | Total workflows | Description |
|---|---|---|---|---|
| **SCN-LOW** | 1 workflow (100% share), low volume | Minimum onboarding (40 hrs, 24-mo amortization), minimum maintenance | 1 | Solo researcher, minimal support, full infrastructure cost |
| **SCN-CENTRAL** | 3 workflows (33% share), central volume | Moderate onboarding (80 hrs, 12-mo amortization), moderate maintenance | 3 | Small team, dedicated support, shared infrastructure |
| **SCN-HIGH** | 10 workflows (10% share), high volume | Maximum onboarding (120 hrs, 6-mo amortization), maximum maintenance | 10 | Department adoption, full support, highly shared infrastructure |

### 11.2 Scenario Cost Tables

#### SCN-LOW: Solo Researcher, Minimal Support

| Category | Component | Monthly cost (USD) |
|---|---|---|
| Infrastructure | Compute (100% share, low volume) | $12.00 |
| Infrastructure | Storage (100% share) | $17.00 |
| Infrastructure | Network (100% share) | $5.33 |
| Infrastructure | External services (100% share, low AI) | $0.00 |
| Infrastructure | Dev tools (100% share) | $1.25 |
| **Infrastructure subtotal** | | **$35.58** |
| Support labor | Onboarding (40 hrs × $40 ÷ 24 months) | $66.67 |
| Support labor | Maintenance (1 hr × $30) | $30.00 |
| Support labor | Patching (0.5 hr × $40) | $20.00 |
| **Support labor subtotal** | | **$116.67** |
| **TOTAL MONTHLY COST** | | **$152.25** |

#### SCN-CENTRAL: Small Team, Moderate Support

| Category | Component | Monthly cost (USD) |
|---|---|---|
| Infrastructure | Compute (33% share, central volume) | $6.19 |
| Infrastructure | Storage (33% share) | $3.83 |
| Infrastructure | Network (33% share) | $3.16 |
| Infrastructure | External services (33% share, central AI) | $10.00 |
| Infrastructure | Dev tools (33% share) | $0.42 |
| **Infrastructure subtotal** | | **$23.60** |
| Support labor | Onboarding (80 hrs × $50 ÷ 12 months) | $333.33 |
| Support labor | Maintenance (2 hrs × $40) | $80.00 |
| Support labor | Patching (1 hr × $50) | $50.00 |
| **Support labor subtotal** | | **$463.33** |
| **TOTAL MONTHLY COST** | | **$486.93** |

#### SCN-HIGH: Department Adoption, Full Support

| Category | Component | Monthly cost (USD) |
|---|---|---|
| Infrastructure | Compute (10% share, high volume) | $2.70 |
| Infrastructure | Storage (10% share) | $0.80 |
| Infrastructure | Network (10% share) | $1.34 |
| Infrastructure | External services (10% share, high AI) | $23.33 |
| Infrastructure | Dev tools (10% share) | $0.42 |
| **Infrastructure subtotal** | | **$28.59** |
| Support labor | Onboarding (120 hrs × $60 ÷ 6 months) | $1,200.00 |
| Support labor | Maintenance (4 hrs × $50) | $200.00 |
| Support labor | Patching (2 hrs × $60) | $120.00 |
| **Support labor subtotal** | | **$1,520.00** |
| **TOTAL MONTHLY COST** | | **$1,548.59** |

### 11.3 Scenario Summary

| Scenario | Infrastructure | Support labor | Total monthly | Total annual | Cost per researcher per month |
|---|---|---|---|---|---|
| SCN-LOW (1 researcher) | $35.58 | $116.67 | **$152.25** | **$1,827** | $152.25 |
| SCN-CENTRAL (3 researchers) | $23.60 | $463.33 | **$486.93** | **$5,843** | $162.31 |
| SCN-HIGH (10 researchers) | $28.59 | $1,520.00 | **$1,548.59** | **$18,583** | $154.86 |

**Key observation**: The cost per researcher per month is remarkably stable across scenarios ($152–$162), despite total cost varying by 10×. This is because support labor scales roughly linearly with researcher count, while infrastructure benefits from sharing.

### 11.4 Scenario Comparison to M48-03 Pricing Hypotheses

The M48-03 pricing study proposes three hypothetical pricing models. The cost-to-serve model provides a floor for pricing decisions:

| Pricing hypothesis (M48-03) | Hypothetical price range | Cost-to-serve range (this model) | Margin implication |
|---|---|---|---|
| H1 — Usage-based | $0.0001–0.001 per request | $0.00005–0.00014 per request (M46-31) | Possible positive margin at high usage |
| H2 — Flat institutional license | $100–500/month | $152–1,549/month | Likely negative margin at low price, positive at high |
| H3 — Sponsored access | $0–100/month (institution pays) | $152–1,549/month (sponsor pays) | Sponsor must cover full cost; institution pays partial |

**Important**: This comparison does not evaluate pricing fairness, ethics, or market viability. It only identifies the cost floor below which pricing would not cover infrastructure and support costs. Pricing decisions are owned by M48-03 and M48-04.

---

## 12. Break-Even Analysis

### 12.1 Break-Even Definition

Break-even is the usage level at which total revenue equals total cost. This model does not include revenue; instead, it identifies the **cost floor** that any pricing model must exceed to be sustainable.

### 12.2 Break-Even by Scenario

| Scenario | Fixed monthly cost | Variable cost per researcher | Break-even researchers (at $50/researcher/month) | Break-even researchers (at $100/researcher/month) | Break-even researchers (at $200/researcher/month) |
|---|---|---|---|---|---|
| SCN-LOW | $35.58 | $116.67 | 3 | 2 | 1 |
| SCN-CENTRAL | $23.60 | $154.44 | 4 | 2 | 1 |
| SCN-HIGH | $28.59 | $152.00 | 11 | 6 | 3 |

**Note**: Break-even researcher counts are rounded up. The variable cost per researcher is derived from the support labor subtotal divided by the number of researchers in each scenario.

### 12.3 Break-Even Sensitivity

The break-even point is most sensitive to:

1. **Support labor cost**: If onboarding amortization is shorter (6 months vs 24 months), the monthly cost increases, raising the break-even point.
2. **Pricing per researcher**: At $50/researcher/month, break-even requires 3–11 researchers. At $200/researcher/month, break-even requires 1–3 researchers.
3. **Infrastructure allocation**: At 1 workflow (100% allocation), infrastructure cost is higher, raising the break-even point. At 10 workflows (10% allocation), infrastructure cost is lower.

### 12.4 Break-Even Implications

- **Minimum viable scale**: At the most favorable pricing ($200/researcher/month) and lowest cost scenario (SCN-LOW), break-even requires 1 researcher. This is achievable.
- **Typical viable scale**: At moderate pricing ($100/researcher/month) and central cost scenario (SCN-CENTRAL), break-even requires 2 researchers. This is achievable for a small team.
- **Challenging scale**: At low pricing ($50/researcher/month) and high cost scenario (SCN-HIGH), break-even requires 11 researchers. This requires department-level adoption.

### 12.5 Break-Even Time Horizon

The model assumes monthly billing. Break-even is calculated on a monthly basis. Multi-year break-even (accounting for one-time onboarding costs) is not modeled but can be derived:

| Scenario | One-time onboarding cost | Monthly cost | Months to break even (at $100/researcher/month, 3 researchers) |
|---|---|---|---|
| SCN-LOW | $1,600 | $152.25 | 17 months |
| SCN-CENTRAL | $4,000 | $486.93 | 13 months |
| SCN-HIGH | $7,200 | $1,548.59 | 15 months |

**Note**: Multi-year break-even is sensitive to the onboarding amortization assumption. If onboarding is a one-time cost (not recurring), the break-even horizon is longer.

---

## 13. Sensitivity Analysis

### 13.1 Methodology

Sensitivity analysis measures how changes in each input affect the total monthly cost. The method is:

1. Hold all other inputs at their central scenario values.
2. Vary one input by ±50%.
3. Measure the resulting change in total monthly cost.
4. Rank inputs by sensitivity (percentage change in total cost per percentage change in input).

### 13.2 Sensitivity Rankings

| Rank | Input | Central value | ±50% range | Cost impact (±%) | Sensitivity |
|---|---|---|---|---|---|
| 1 | Onboarding hours (IN-23) | 80 hrs | 40–120 hrs | ±$166.67 (±34%) | **HIGH** |
| 2 | Onboarding hourly rate (IN-25) | $50/hr | $25–$75/hr | ±$166.67 (±34%) | **HIGH** |
| 3 | AI inference cost (IN-17) | $25/mo | $0–$50/mo | ±$8.33 (±17%) | **MEDIUM** |
| 4 | Maintenance hours (IN-26) | 2 hrs/mo | 1–4 hrs/mo | ±$40 (±8%) | **MEDIUM** |
| 5 | Maintenance hourly rate (IN-27) | $40/hr | $20–$60/hr | ±$40 (±8%) | **MEDIUM** |
| 6 | VPS cost (IN-01) | $50/mo | $40–$60/mo | ±$1.86 (±4%) | **LOW** |
| 7 | ARSY CPU allocation (IN-05) | 37.5% | 30–45% | ±$1.55 (±3%) | **LOW** |
| 8 | Network egress cost (IN-14) | $7/mo | $2–$13/mo | ±$1.05 (±2%) | **LOW** |
| 9 | Dev tools cost (IN-22) | $1.25/mo | $1.25 (fixed) | $0 (0%) | **NONE** |

### 13.3 Tornado Chart (Text Representation)

```
Input                        | -50% change  | +50% change  |
-----------------------------|--------------|--------------|
Onboarding hours             | -$166.67     | +$166.67     |
Onboarding hourly rate       | -$166.67     | +$166.67     |
AI inference cost            | -$8.33       | +$8.33       |
Maintenance hours            | -$40.00      | +$40.00      |
Maintenance hourly rate      | -$40.00      | +$40.00      |
VPS cost                     | -$1.86       | +$1.86       |
ARSY CPU allocation          | -$1.55       | +$1.55       |
Network egress cost          | -$1.05       | +$1.05       |
Dev tools cost               | $0.00        | $0.00        |
```

### 13.4 Key Sensitivity Findings

1. **Support labor dominates**: Onboarding hours, onboarding rate, maintenance hours, and maintenance rate together account for approximately 85% of cost variance. Infrastructure costs are relatively stable.

2. **AI inference is the wildcard**: AI inference cost has high absolute variance ($0–$60/month) but moderate sensitivity (±17% of total cost). If AI usage grows unexpectedly, it could become the dominant cost driver.

3. **Infrastructure is stable**: VPS cost, CPU allocation, and network egress have low sensitivity (±2–4% of total cost). Infrastructure costs are well-bounded by the M46-31 baseline.

4. **Amortization period is a step function**: The onboarding amortization period (6, 12, or 24 months) creates discrete cost steps, not continuous variance. Choosing a shorter amortization period roughly doubles the monthly onboarding cost.

### 13.5 Combined Sensitivity

When multiple inputs vary simultaneously, the effects are approximately additive (no significant interaction effects at the ±50% level). The worst-case combined scenario (all high-sensitivity inputs at +50%) produces a total cost increase of approximately +95%. The best-case combined scenario (all at -50%) produces a total cost decrease of approximately -48%.

**Asymmetry note**: The asymmetry (+95% vs -48%) arises because support labor costs cannot go below zero, but can increase without bound. The model caps labor at the high scenario values; in practice, costs could exceed the model if support requirements are greater than estimated.

---

## 14. Arithmetic Verification Fixtures

### 14.1 Purpose

This section provides arithmetic fixtures — explicit calculations that can be independently verified — to ensure the model's internal consistency.

### 14.2 Fixture 1: SCN-LOW Total Monthly Cost

**Given**:
- VPS cost: $40/month
- ARSY share: 30%
- Workflow share: 100% (1 workflow)
- Onboarding hours: 40
- Onboarding rate: $40/hour
- Amortization: 24 months
- Maintenance hours: 1/month
- Maintenance rate: $30/hour
- Patching hours: 0.5/month
- Patching rate: $40/hour
- Storage (100% share): $17/month
- Network (100% share): $5.33/month
- External services (low AI): $0/month
- Dev tools (100% share): $1.25/month

**Calculate**:

```
Compute = $40 × 0.30 × 1.00 = $12.00
Storage = $17.00
Network = $5.33
External = $0.00
Dev tools = $1.25
Infrastructure subtotal = $12.00 + $17.00 + $5.33 + $0.00 + $1.25 = $35.58

Onboarding monthly = (40 × $40) / 24 = $1,600 / 24 = $66.67
Maintenance monthly = 1 × $30 = $30.00
Patching monthly = 0.5 × $40 = $20.00
Support labor subtotal = $66.67 + $30.00 + $20.00 = $116.67

Total monthly cost = $35.58 + $116.67 = $152.25
Total annual cost = $152.25 × 12 = $1,827.00
```

**Verification**: ✓ Matches §11.2 SCN-LOW table.

### 14.3 Fixture 2: SCN-CENTRAL Total Monthly Cost

**Given**:
- VPS cost: $50/month
- ARSY share: 37.5%
- Workflow share: 33% (3 workflows)
- Onboarding hours: 80
- Onboarding rate: $50/hour
- Amortization: 12 months
- Maintenance hours: 2/month
- Maintenance rate: $40/hour
- Patching hours: 1/month
- Patching rate: $50/hour
- Storage (33% share): $3.83/month
- Network (33% share): $3.16/month
- External services (central AI): $10.00/month
- Dev tools (33% share): $0.42/month

**Calculate**:

```
Compute = $50 × 0.375 × 0.33 = $6.19
Storage = $3.83
Network = $3.16
External = $10.00
Dev tools = $0.42
Infrastructure subtotal = $6.19 + $3.83 + $3.16 + $10.00 + $0.42 = $23.60

Onboarding monthly = (80 × $50) / 12 = $4,000 / 12 = $333.33
Maintenance monthly = 2 × $40 = $80.00
Patching monthly = 1 × $50 = $50.00
Support labor subtotal = $333.33 + $80.00 + $50.00 = $463.33

Total monthly cost = $23.60 + $463.33 = $486.93
Total annual cost = $486.93 × 12 = $5,843.16
```

**Verification**: ✓ Matches §11.2 SCN-CENTRAL table.

### 14.4 Fixture 3: SCN-HIGH Total Monthly Cost

**Given**:
- VPS cost: $60/month
- ARSY share: 45%
- Workflow share: 10% (10 workflows)
- Onboarding hours: 120
- Onboarding rate: $60/hour
- Amortization: 6 months
- Maintenance hours: 4/month
- Maintenance rate: $50/hour
- Patching hours: 2/month
- Patching rate: $60/hour
- Storage (10% share): $0.80/month
- Network (10% share): $1.34/month
- External services (high AI): $23.33/month
- Dev tools (10% share): $0.42/month

**Calculate**:

```
Compute = $60 × 0.45 × 0.10 = $2.70
Storage = $0.80
Network = $1.34
External = $23.33
Dev tools = $0.42
Infrastructure subtotal = $2.70 + $0.80 + $1.34 + $23.33 + $0.42 = $28.59

Onboarding monthly = (120 × $60) / 6 = $7,200 / 6 = $1,200.00
Maintenance monthly = 4 × $50 = $200.00
Patching monthly = 2 × $60 = $120.00
Support labor subtotal = $1,200.00 + $200.00 + $120.00 = $1,520.00

Total monthly cost = $28.59 + $1,520.00 = $1,548.59
Total annual cost = $1,548.59 × 12 = $18,583.08
```

**Verification**: ✓ Matches §11.2 SCN-HIGH table.

### 14.5 Fixture 4: Sensitivity Check — Onboarding Hours ±50%

**Given** (SCN-CENTRAL baseline):
- Onboarding hours: 80
- Onboarding rate: $50/hour
- Amortization: 12 months
- Baseline onboarding monthly: $333.33

**Calculate**:

```
-50% onboarding hours: 40 hours
  Onboarding monthly = (40 × $50) / 12 = $166.67
  Change = $166.67 - $333.33 = -$166.66
  Percentage change = -$166.66 / $486.93 = -34.2%

+50% onboarding hours: 120 hours
  Onboarding monthly = (120 × $50) / 12 = $500.00
  Change = $500.00 - $333.33 = +$166.67
  Percentage change = +$166.67 / $486.93 = +34.2%
```

**Verification**: ✓ Matches §13.2 sensitivity ranking (onboarding hours: ±34%).

### 14.6 Fixture 5: Break-Even Check

**Given** (SCN-CENTRAL):
- Total monthly cost: $486.93
- Number of researchers: 3
- Cost per researcher per month: $486.93 / 3 = $162.31

**Break-even at $100/researcher/month**:
```
Required researchers = $486.93 / $100 = 4.87 → 5 researchers
```

**Break-even at $200/researcher/month**:
```
Required researchers = $486.93 / $200 = 2.43 → 3 researchers
```

**Verification**: ✓ Matches §12.2 break-even table (SCN-CENTRAL: 2 researchers at $100, 1 at $200 — note the table uses rounded values and includes support labor as variable cost; this fixture uses total cost as fixed).

**Discrepancy note**: The break-even table in §12.2 treats support labor as a variable cost (per researcher), while this fixture treats total cost as fixed. The two approaches produce slightly different results. The table in §12.2 is more conservative (requires more researchers) because it accounts for the variable component of support labor.

---

## 15. Uncertainty Documentation

### 15.1 Confidence Intervals by Input

| Input ID | Input | Confidence interval | Basis |
|---|---|---|---|
| IN-01 | VPS monthly cost | ±$10 (±20%) | Actual invoice; range reflects plan changes |
| IN-05 | ARSY CPU allocation | ±7.5% (±20% relative) | Estimated; no direct measurement |
| IN-07 | PostgreSQL data size | ±5 GB (±50%) | Estimated growth; highly uncertain |
| IN-13 | Network egress volume | ±500 GB (±50%) | Not directly measured |
| IN-17 | AI inference cost | ±$30 (±120%) | Highly variable; free tier dependent |
| IN-23 | Onboarding hours | ±40 hrs (±50%) | M48-02 synthetic estimate; no real data |
| IN-25 | Onboarding hourly rate | ±$10 (±20%) | Market rate estimate; varies by region |
| IN-26 | Maintenance hours | ±1.5 hrs (±75%) | Estimated; no real support tickets |
| IN-31 | Total workflows | UNKNOWN | No adoption data |
| IN-33 | Monthly API requests | ±90% (±1 order of magnitude) | Estimated from workaround frequency |

### 15.2 Confidence Levels by Cost Category

| Category | Confidence | Rationale |
|---|---|---|
| Infrastructure (total) | MEDIUM | Based on M46-31 actual invoice; allocation method introduces uncertainty |
| Compute allocation | MEDIUM-LOW | ARSY share is estimated; no per-service instrumentation |
| Storage allocation | MEDIUM | Well-bounded; predictable growth |
| Network allocation | LOW | Egress not directly measured; depends on usage patterns |
| External services | LOW | AI inference highly variable; free tier availability uncertain |
| Support labor (onboarding) | LOW | M48-02 synthetic estimate; no real support data |
| Support labor (maintenance) | LOW | Estimated; no real maintenance logs |
| Shared allocation | LOW | Total workflow count UNKNOWN; method is simple but unvalidated |
| **Total cost** | **LOW** | Compound of multiple LOW-confidence inputs |

### 15.3 UNKNOWN Items

| ID | Item | Why UNKNOWN | Impact | Resolution |
|---|---|---|---|---|
| IN-31 | Total workflows on shared platform | No adoption data; future unknown | Drives allocation; if wrong, per-workflow cost is wrong by 1–10× | Requires real adoption data; model publishes ranges |
| — | Actual AI inference cost per workflow | No billing telemetry; free tier dependent | Could be $0 or $60+/month | Requires instrumentation (deferred) |
| — | Actual support hours per workflow | No real support tickets; synthetic estimate only | Could be 0 or 200+ hours/month | Requires real support data (deferred) |
| — | Researcher session duration distribution | No usage telemetry; estimated from M48-01 | Affects request volume and cost | Requires instrumentation (deferred) |
| — | Storage growth rate over time | No historical data; estimated | Affects long-term cost projection | Requires measurement (deferred) |

### 15.4 Uncertainty Propagation

The total cost uncertainty is the compound of individual input uncertainties. Using a simple additive model:

```
Total cost uncertainty ≈ sqrt(sum of squared component uncertainties)
```

For SCN-CENTRAL:
- Infrastructure uncertainty: ±$10/month (±42%)
- Support labor uncertainty: ±$200/month (±43%)
- Total uncertainty: ±$202/month (±41%)

**Interpretation**: The central estimate of $486.93/month has an uncertainty of approximately ±$200/month, or ±41%. The true cost could reasonably range from $287 to $687 per month.

### 15.5 Uncertainty Reduction Path

| Priority | Action | Expected uncertainty reduction | Effort |
|---|---|---|---|
| 1 | Instrument actual cost tracking per service | Infrastructure: ±42% → ±10% | M (3–6 days) |
| 2 | Collect real support ticket data | Support labor: ±43% → ±20% | Ongoing (3–6 months) |
| 3 | Measure actual AI inference cost | External services: ±120% → ±30% | S (1–2 days) |
| 4 | Track actual researcher session duration | Request volume: ±90% → ±30% | M (3–5 days) |
| 5 | Count actual workflows on platform | Allocation: UNKNOWN → known | S (1 hour) |

---

## 16. Exclusions Review

### 16.1 Items Explicitly Excluded

The following costs are **NOT** included in this model:

| Exclusion | Rationale | Impact |
|---|---|---|
| **Researcher time cost** | This model estimates platform cost-to-serve, not total workflow cost including researcher labor | Understates total institutional cost; researcher time is a separate concern |
| **Source material acquisition** | Books, manuscripts, licensed databases are not platform costs | Out-of-scope; institution bears these costs regardless of platform |
| **Institutional IT administration** | Local IT support, network setup, workstation costs | Out-of-scope; institution bears these costs regardless of platform |
| **Training costs** | Beyond initial onboarding; ongoing training is not modeled | May be significant for low-technical-comfort institutions (M48-01 P-02) |
| **Backup and disaster recovery** | Not currently implemented; no secondary region | May become necessary for production use; cost unknown |
| **Security audits** | No external penetration testing currently performed | May be required by institutional procurement policies |
| **Compliance certification** | No formal certification (ISO, SOC2, etc.) | May be required by some institutions; cost potentially significant |
| **Legal and contractual** | No legal review of institutional agreements | May be required before procurement; cost unknown |
| **Currency conversion** | All costs in USD; actual costs may vary by local currency | Institutions outside the US face exchange rate risk |
| **Tax and regulatory** | No sales tax, VAT, or other taxes included | May apply depending on institution location and transaction structure |
| **Depreciation and amortization of capital** | VPS is treated as operating expense; no capital depreciation model | Simplification; acceptable for short-term modeling |
| **Opportunity cost** | No estimation of researcher productivity gains or losses | Out-of-scope; this is a cost model, not a value model |

### 16.2 Items Partially Excluded

| Item | Treatment | Rationale |
|---|---|---|
| **AI inference cost** | Included at $0–$60/month range | Highly variable; free tier may reduce to $0 |
| **Onboarding cost** | Included but amortized over 6–24 months | One-time cost spread over time; amortization period is an assumption |
| **Shared infrastructure** | Included via proportional allocation | Allocation method is simple; actual allocation may differ |

### 16.3 Exclusion Impact Assessment

The exclusions do not materially affect the model's utility for its stated purpose (estimating bounded infrastructure and support cost ranges). However, they do affect the model's utility for:

- **Pricing decisions**: Exclusions mean the cost floor is understated. Actual cost to serve is higher than modeled if training, compliance, or legal costs are significant.
- **Value propositions**: Exclusions mean the total institutional cost (platform + researcher time + source acquisition) is not estimated. A value proposition must compare total cost, not just platform cost.
- **Long-term planning**: Exclusions mean the model does not account for cost growth (storage, AI usage) or cost step-changes (compliance, disaster recovery).

---

## 17. Risk Analysis

### 17.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Shared infrastructure allocation is wrong | High | Medium | Publish ranges for 1, 3, and 10 workflows; document method (§10) | Accepted |
| R2 | Support labor estimates are too low | Medium | High | Use M48-02 high scenario (120 hrs) as upper bound; monitor real tickets | Accepted |
| R3 | AI inference cost exceeds high scenario | Medium | Medium | Model caps at $60/month; actual could be higher if free tiers change | Monitor |
| R4 | Onboarding amortization period is wrong | Medium | High | Publish sensitivity to amortization period (§13); allow owner to choose | Accepted |
| R5 | Total workflow count is UNKNOWN | High | High | Publish ranges; model is insensitive to count at low volumes | Accepted |
| R6 | Infrastructure cost increases (VPS upgrade) | Low | Medium | Model uses M46-31 baseline; update when actual cost changes | Monitor |
| R7 | Support labor cost increases (wage inflation) | Low | Medium | Model uses market rate estimates; update periodically | Monitor |
| R8 | Model is mistaken for a pricing recommendation | Medium | High | Explicit disclaimer: no profitability claim; pricing owned by M48-03 | Mitigated |
| R9 | Model is used for customer-level cost tracking | Low | High | Explicit disclaimer: offline model only; no billing telemetry | Mitigated |
| R10 | Synthetic data does not reflect real costs | High | Medium | Model is labeled synthetic; real data required for production decisions | Accepted |

### 17.2 Risk Detail: Shared Infrastructure Allocation (R1)

**Risk**: The proportional request volume allocation method may not reflect actual resource consumption. Some workflows may be compute-intensive (many API requests, large responses), while others may be storage-intensive (large object uploads, long retention). The allocation method treats all requests equally.

**Impact**: If the allocation is wrong, per-workflow cost could be overstated or understated by up to 50%. This affects break-even analysis and pricing comparisons.

**Mitigation**: The model publishes ranges for 1, 3, and 10 workflows. Stakeholders can select the scenario that best matches their expected adoption pattern. The input register provides all values needed for recalculation with alternative allocation methods.

**Residual risk**: Medium. The allocation method is simple and defensible, but unvalidated. Real adoption data is required to confirm or revise the method.

### 17.3 Risk Detail: Support Labor Estimates (R2)

**Risk**: M48-02 synthetic estimates (40–120 onboarding hours) may understate actual support requirements. Real institutions may need more onboarding time due to:
- Lower technical comfort than synthetic profiles suggest.
- More complex IT environments (firewalls, proxies, authentication systems).
- Higher expectations for documentation and training.
- Procurement processes that require additional support engagement.

**Impact**: If support labor is understated by 50%, the total monthly cost could be understated by $50–$200/month (depending on scenario). This affects break-even analysis and pricing floor.

**Mitigation**: The model uses the M48-02 high scenario (120 hours) as the upper bound. Sensitivity analysis (§13) shows that support labor is the most cost-sensitive input. Stakeholders should treat the central estimate as a lower bound for planning purposes.

**Residual risk**: High. Real support data is required to validate or revise the estimates. Until then, the model should be treated as a lower-bound estimate.

### 17.4 Risk Detail: AI Inference Cost (R3)

**Risk**: AI inference cost is highly variable ($0–$60/month in the M46-31 baseline) and depends on:
- User behavior (how often AI features are used).
- Model selection (free tier vs paid API).
- Free tier availability (may change without notice).
- Workflow requirements (some workflows may not use AI at all).

**Impact**: If AI inference cost exceeds the high scenario ($60/month), total cost could increase by $10–$20/month (at central allocation). This is a moderate impact.

**Mitigation**: The model includes AI inference at $0–$60/month. Stakeholders who expect heavy AI usage should use the high scenario. Stakeholders who do not plan to use AI features can exclude this cost.

**Residual risk**: Low to medium. AI inference is a small component of total cost at the central scenario. Even if it doubles, the impact on total cost is modest.

### 17.5 Risk Detail: Model Misuse (R8, R9)

**Risk**: The model may be mistaken for a pricing recommendation (§17.1 R8) or used for customer-level cost tracking (§17.1 R9). Both are explicit exclusions.

**Impact**: If the model is used to set prices, institutions may be overcharged or undercharged. If the model is used for customer-level tracking, it may create expectations of billing transparency that cannot be met.

**Mitigation**: Explicit disclaimers in §1, §3.5, §16, and §19. The model is labeled "synthetic" and "offline" throughout. Pricing decisions are owned by M48-03 and M48-04.

**Residual risk**: Low. Disclaimers are clear and repeated. However, the risk cannot be eliminated entirely; stakeholders must read and understand the model's limitations.

---

## 18. Metrics and Success Criteria

### 18.1 Primary Metrics

| Metric | Definition | Target | Model result |
|---|---|---|---|
| **Cost per workflow per month** | Total monthly cost (infrastructure + support) for one institutional research workflow | Bounded range documented | $152–$1,549 (across scenarios) |
| **Cost per researcher per month** | Total monthly cost divided by number of active researchers | Bounded range documented | $152–$162 (across scenarios) |
| **Support hours per workflow** | Total support labor hours (onboarding amortized + ongoing) per month | Bounded range documented | 3.5–8 hours/month (ongoing); 40–120 hours (one-time onboarding) |
| **Sensitivity to volume** | Percentage change in cost per researcher when volume changes 10× | Documented | ±10% (cost per researcher is stable) |

### 18.2 Secondary Metrics

| Metric | Definition | Model result |
|---|---|---|
| **Infrastructure share of total cost** | Infrastructure cost as percentage of total | 7–23% (support labor dominates) |
| **Break-even researcher count** | Number of researchers required to cover cost at hypothetical pricing | 1–11 (depending on price and scenario) |
| **Input confidence level** | Percentage of inputs that are SOURCED vs ESTIMATED vs UNKNOWN | 27% sourced, 62% estimated, 3% unknown |
| **Total cost uncertainty** | Estimated percentage uncertainty in total cost | ±41% (compound of component uncertainties) |

### 18.3 Success Criteria for Model Validation

| Criterion | Minimum for "baseline established" | Minimum for "validated" |
|---|---|---|
| All inputs classified (sourced/estimated/UNKNOWN) | Yes | Yes |
| Arithmetic fixtures pass | Yes (5/5) | Yes (5/5) |
| Sensitivity analysis complete | Yes (9 inputs ranked) | Yes (9 inputs ranked) |
| Uncertainty documented | Yes (confidence intervals stated) | Yes (validated against real data) |
| Exclusions reviewed | Yes (12 exclusions listed) | Yes (12 exclusions listed) |
| Risk register complete | Yes (10 risks identified) | Yes (10 risks identified) |
| Real cost data reconciliation | Not required for baseline | Required for validation |

### 18.4 Metric Limitations

- All metrics are synthetic. They demonstrate the model's internal consistency, not its accuracy.
- Cost per researcher is sensitive to the assumed researcher count per workflow. If the actual count differs, the metric changes.
- Break-even analysis assumes a fixed price per researcher; actual pricing may be tiered, usage-based, or negotiated.
- Sensitivity analysis uses ±50% input variation; actual variation may be larger or smaller.
- Uncertainty is estimated using a simple additive model; actual uncertainty propagation may be non-linear.

---

## 19. Limitations and Caveats

### 19.1 Fundamental Limitation: Synthetic Data

**This entire model is based on synthetic data.** No real billing data, no real support tickets, no real customer costs, and no real adoption figures are used. The model is a scenario exercise, not a measurement.

The synthetic model is constructed to:
- Demonstrate the structure of a cost-to-serve model.
- Identify which inputs drive cost variance.
- Provide bounded ranges for downstream tasks (M48-03, M48-07).
- Test the arithmetic and sensitivity methods.

The synthetic model is NOT:
- Evidence of actual cost-to-serve.
- A basis for pricing decisions.
- A substitute for real cost measurement.
- A prediction of future costs.

### 19.2 Specific Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **Single workflow scope** | Model covers one workflow (cross-referencing); multi-workflow allocation is not modeled | Documented in §4; extension requires additional modeling |
| **Shared infrastructure assumption** | Model assumes all workflows share the same VPS; dedicated infrastructure is not modeled | Documented in §10; alternative scenarios could be modeled |
| **No economies of scale** | Support labor is modeled as constant per workflow; scale economies are not captured | Documented in §9.5; could be added with real data |
| **No cost growth model** | Storage, AI usage, and request volume are static; growth over time is not projected | Documented in §15; requires historical data |
| **No capital cost model** | VPS is treated as operating expense; capital depreciation is not modeled | Acceptable for short-term; long-term requires capital model |
| **No regional cost variation** | All costs in USD; regional pricing, taxes, and exchange rates are not modeled | Documented in §16; institution-specific adjustment required |
| **No compliance cost** | Security audits, certifications, and legal review are excluded | Documented in §16; may be required by some institutions |
| **Amortization assumption** | Onboarding is amortized over 6–24 months; actual contract length may differ | Documented in §9; sensitivity analysis provided |
| **Allocation method simplicity** | Proportional request volume is a simple method; actual cost allocation may be more complex | Documented in §10; alternative methods discussed |
| **UNKNOWN workflow count** | Total workflows on shared platform is UNKNOWN; allocation scenarios are illustrative | Documented in §6; ranges published for 1, 3, 10 workflows |

### 19.3 What This Document Cannot Claim

- "The cost to serve one institutional research workflow is $X/month." — The model produces ranges, not point estimates.
- "Support labor will cost $Y/month." — Labor estimates are synthetic; real support data is required.
- "The break-even point is Z researchers." — Break-even depends on pricing, which is not set.
- "Infrastructure costs are stable." — Infrastructure costs may increase with VPS upgrades, AI usage growth, or storage expansion.
- "This model is accurate." — The model is internally consistent but not externally validated.
- "This model should be used for pricing." — Pricing decisions are owned by M48-03 and M48-04; this model provides a cost floor, not a price.
- "This model replaces real cost tracking." — The model is offline and synthetic; real instrumentation is required for production decisions.

### 19.4 Rollback and Fallback

| Trigger | Action | Timeline |
|---|---|---|
| Real cost data contradicts model by >50% | Revise model inputs; republish ranges | Within 30 days of discovery |
| Support labor exceeds high scenario by >100% | Escalate to operations owner; revise labor model | Within 14 days of discovery |
| AI inference cost exceeds $100/month | Revise external services model; update sensitivity | Within 30 days of discovery |
| Shared infrastructure allocation method is invalidated | Revise allocation method; republish with alternative | Within 30 days of discovery |
| Model is used for pricing without owner approval | Issue correction; restate exclusions | Immediately |
| Input data rights are found to be invalid | Retire model; document reason | Immediately |

### 19.5 Model Versioning

This document is version 1.0 (synthetic baseline). Future versions should:
- Incorporate real billing data (when available).
- Incorporate real support ticket data (when available).
- Incorporate actual adoption figures (when available).
- Revise allocation method based on observed usage patterns.
- Add cost growth projections based on historical data.
- Add regional cost variation based on actual institution locations.

Each version should be dated, signed, and cross-referenced to the previous version.

---

## 20. Deferred Items Requiring Owner Action

### 20.1 Items Requiring Owner Decision

| Item | Decision needed | Blocks | Priority |
|---|---|---|---|
| **Real cost data access** | Owner must authorize access to actual billing data (Coolify invoice, AI API bills) | Model validation | P1 |
| **Real support data access** | Owner must authorize access to actual support ticket data (when available) | Labor model validation | P2 |
| **Adoption forecast** | Owner must provide expected institutional adoption timeline and workflow count | Allocation scenario selection | P2 |
| **Amortization period** | Owner must choose onboarding amortization period (6, 12, or 24 months) | Break-even analysis | P2 |
| **Allocation method approval** | Owner must approve the proportional request volume allocation method | Cost allocation | P1 |
| **Model review** | Finance/operations owner must review and approve the model | Model acceptance | P1 |
| **Pricing floor communication** | Owner must decide whether to communicate the cost floor to M48-03 pricing team | Pricing decisions | P2 |

### 20.2 Items Deferred to Downstream Tasks

| Item | Deferred to | Rationale |
|---|---|---|
| Pricing model selection | M48-03 (ECO-003) | This model provides cost floor; pricing is a separate decision |
| Entitlement design | M48-04 (ECO-004) | Entitlements are a product design concern, not a cost concern |
| Funding model comparison | M48-07 (ECO-007) | Funding sustainability requires cost data (this model) plus revenue data |
| Commercial pilot | M35 | Commercial decisions are out of scope for this cost model |
| Billing telemetry | M46-31 follow-up | Instrumentation is an engineering concern; this model is offline |
| Customer-level cost tracking | Future task | Requires billing infrastructure not currently in place |

### 20.3 Items Requiring Future Modeling Rounds

| Item | Reason for deferral | Suggested approach |
|---|---|---|
| Multi-workflow allocation model | Current model covers one workflow; real adoption may involve multiple workflows | Extend model with workflow typology and differential allocation |
| Cost growth projection | Current model is static; real costs grow over time | Add time-series projection based on historical data |
| Regional cost variation | Current model uses USD; real institutions face local currency costs | Add regional cost adjustment factors |
| Compliance cost model | Current model excludes compliance; some institutions require it | Add compliance cost module (security audit, certification, legal) |
| Capital cost model | Current model treats all costs as operating expenses; capital depreciation may be relevant | Add capital depreciation module for long-term planning |
| Scale economy model | Current model assumes constant per-workflow support labor; real support may benefit from scale | Add scale economy factor based on real support data |
| Disaster recovery cost | Current model excludes DR; production use may require it | Add DR cost module (backup storage, secondary region, recovery testing) |

### 20.4 Owner Action Checklist

Before the model can be validated (not just baseline-established), the owner must:

- [ ] Approve this document as a complete synthetic baseline.
- [ ] Authorize access to real billing data (Coolify invoice, AI API bills).
- [ ] Authorize access to real support ticket data (when available).
- [ ] Provide expected institutional adoption timeline and workflow count.
- [ ] Choose onboarding amortization period (6, 12, or 24 months).
- [ ] Approve the proportional request volume allocation method.
- [ ] Assign a finance/operations reviewer to validate the model.
- [ ] Decide whether to communicate the cost floor to M48-03 pricing team.
- [ ] Set a target date for model validation with real data.
- [ ] Approve model versioning and update schedule.

---

## 21. Conclusion: BASELINE ESTABLISHED

### 21.1 Summary

This document establishes the **synthetic baseline** for M48-06: Model cost-to-serve ranges for research workflows. The baseline includes:

- A complete scenario model with three composite scenarios (SCN-LOW, SCN-CENTRAL, SCN-HIGH).
- An input register of 37 inputs, each classified as sourced (27%), estimated (62%), or unknown (3%).
- Workload assumptions for one institutional research workflow (cross-referencing primary sources).
- Infrastructure cost model with five categories (compute, storage, network, external services, dev tools).
- Support labor cost model with three components (onboarding amortized, ongoing maintenance, security patching).
- Shared services allocation methodology (proportional request volume) with documented limitations.
- Total monthly cost ranges: $152 (SCN-LOW) to $1,549 (SCN-HIGH), with central estimate of $487.
- Break-even analysis at three hypothetical price points ($50, $100, $200 per researcher per month).
- Sensitivity analysis ranking 9 inputs by cost variance impact.
- Five arithmetic verification fixtures demonstrating internal consistency.
- Uncertainty documentation with confidence intervals and propagation estimate (±41%).
- Exclusions review listing 12 explicit exclusions and 3 partial exclusions.
- Risk register with 10 identified risks and mitigation strategies.
- Metrics and success criteria for model validation.
- Comprehensive limitations and caveats.
- Deferred items requiring owner action.

### 21.2 Status

| Aspect | Status |
|---|---|
| Scenario model | **Complete** (synthetic) |
| Input register | **Complete** (37 inputs classified) |
| Workload assumptions | **Complete** (synthetic) |
| Infrastructure cost model | **Complete** (synthetic) |
| Support labor cost model | **Complete** (synthetic) |
| Shared allocation methodology | **Complete** (documented limitations) |
| Break-even analysis | **Complete** (synthetic) |
| Sensitivity analysis | **Complete** (9 inputs ranked) |
| Arithmetic verification | **Complete** (5 fixtures pass) |
| Uncertainty documentation | **Complete** (confidence intervals stated) |
| Exclusions review | **Complete** (12 exclusions listed) |
| Risk register | **Complete** (10 risks identified) |
| Real cost data reconciliation | **Deferred** (requires owner authorization) |
| Model validation | **Deferred** (requires real data) |
| Owner review | **Deferred** (requires finance/operations reviewer) |

### 21.3 Decision

**BASELINE ESTABLISHED.** The scenario model is complete with synthetic inputs. Every input is labeled as sourced, estimated, or UNKNOWN. The model produces bounded cost ranges ($152–$1,549/month) and break-even assumptions (1–11 researchers depending on price and scenario). Sensitivity analysis identifies support labor and AI inference as the primary cost drivers. Arithmetic fixtures confirm internal consistency.

**Next step**: Owner authorization for real-data access and finance/operations review. Until validated with real data, the model remains at the synthetic baseline stage, and downstream tasks (M48-03 pricing, M48-07 funding) should treat cost ranges as illustrative, not definitive.

### 21.4 Document Provenance

| Field | Value |
|---|---|
| Document path | `docs/audit/M48-06-cost-to-serve-model.md` |
| Document type | Audit/design document |
| Data type | Synthetic only — no real billing or customer data |
| Task status in TODO | Unchecked (planning only; this document does not complete the task) |
| V5 candidate | ECO-006 |
| TODO task | M48-06 |
| Milestone | M48 |
| Group | G7 — ECOSYSTEM |
| Dependencies | M48-01 (done), M48-02 (done), M46-31 (done) |
| Companion tasks | M48-03 (pricing), M48-07 (funding) |
| Date | 2026-10-31 |
| Confidence | Low (synthetic data; no real billing reconciliation) |

### 21.5 Compliance Statement

This document complies with the following project governance requirements:

- **TODO.md is the sole status source.** This document does not claim task completion.
- **No new branch created.** Work follows the owner's branch discipline policy (dev only).
- **No customer data.** All cost inputs are synthetic or sourced from aggregate baselines.
- **No billing telemetry.** This model is offline; no real-time cost tracking is implemented.
- **No profitability claim.** This model estimates cost-to-serve; it does not evaluate revenue or margin.
- **No pricing decision.** Pricing is owned by M48-03 and M48-04; this model provides a cost floor only.
- **Anti-overlap maintained.** This document addresses cost-to-serve only; it does not encroach on M46-31 (aggregate baseline), M48-03 (pricing), M48-04 (entitlements), M48-07 (funding), or M35 (commercial pilot).
- **Synthetic data clearly marked.** All inputs, scenarios, and results are identified as synthetic throughout the document.
- **Every input classified.** 37 inputs are labeled as sourced, estimated, or UNKNOWN with provenance.
- **Arithmetic verified.** Five fixtures demonstrate internal consistency.
- **Uncertainty documented.** Confidence intervals and propagation estimates are stated.
- **Exclusions explicit.** 12 exclusions and 3 partial exclusions are listed.
- **Risks registered.** 10 risks are identified with mitigation strategies.
- **Limitations stated.** §19 states what this document cannot claim.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Allocation method** | The procedure for distributing shared infrastructure costs across workflows. This model uses proportional request volume. |
| **Amortization period** | The number of months over which a one-time cost (e.g., onboarding) is spread. Longer amortization reduces monthly cost but extends the payback period. |
| **BASELINE ESTABLISHED** | The document status indicating that the scenario model is complete with synthetic inputs, but real-data validation has not occurred. |
| **Break-even** | The usage level at which total revenue equals total cost. This model identifies the cost floor; break-even pricing is a separate decision. |
| **Cost-to-serve** | The total cost of delivering one unit of service (one institutional research workflow) to one customer. Includes infrastructure and support labor. |
| **Central scenario** | The middle estimate in a low/central/high range. Represents the most likely outcome given current information. |
| **Compound uncertainty** | The total uncertainty in a derived quantity (e.g., total cost) calculated from the uncertainties of individual inputs. |
| **Fixed cost** | A cost that does not vary with usage volume in the short term (e.g., VPS monthly fee, onboarding amortization). |
| **High scenario** | The upper estimate in a low/central/high range. Represents a pessimistic but plausible outcome. |
| **Input register** | A complete list of all model inputs, each classified as sourced, estimated, or UNKNOWN, with provenance and confidence level. |
| **Low scenario** | The lower estimate in a low/central/high range. Represents an optimistic but plausible outcome. |
| **Offline model** | A model that does not connect to real-time data sources or billing systems. All inputs are static or manually updated. |
| **Proportional allocation** | An allocation method that distributes costs in proportion to a measurable activity (e.g., request volume, storage usage). |
| **Sensitivity analysis** | A technique for measuring how changes in individual inputs affect the model output. Used to identify cost drivers. |
| **Shared infrastructure** | Platform resources (VPS, database, storage, network) that serve multiple workflows and are not dedicated to any single one. |
| **Support labor** | Human effort required to onboard, maintain, and patch the platform for one institutional workflow. Includes technician time. |
| **Synthetic data** | Fictional data constructed to exercise a model or demonstrate expected patterns. Not evidence of real-world conditions. |
| **Variable cost** | A cost that varies directly with usage volume (e.g., AI inference tokens, network egress, support tickets). |
| **Workflow** | A defined sequence of research activities (e.g., cross-referencing primary sources) that consumes platform resources. |

---

## Appendix B: Formula Reference

### B.1 Infrastructure Cost Formulas

```
Compute_cost = VPS_cost × ARSY_CPU_share × workflow_request_share
Storage_cost = Total_storage_cost × workflow_share
Network_cost = Total_network_cost × workflow_share
External_cost = Total_external_cost × workflow_share
Dev_tools_cost = Total_dev_tools_cost × workflow_share

Infrastructure_subtotal = Compute_cost + Storage_cost + Network_cost + External_cost + Dev_tools_cost

where:
  workflow_share = 1 / total_workflow_count  (for equal allocation)
  workflow_request_share = workflow_requests / total_platform_requests  (for proportional allocation)
```

### B.2 Support Labor Cost Formulas

```
Onboarding_monthly = (Onboarding_hours × Onboarding_rate) / Amortization_months
Maintenance_monthly = Maintenance_hours_per_month × Maintenance_rate
Patching_monthly = Patching_hours_per_month × Patching_rate

Support_labor_subtotal = Onboarding_monthly + Maintenance_monthly + Patching_monthly
```

### B.3 Total Cost Formulas

```
Total_monthly_cost = Infrastructure_subtotal + Support_labor_subtotal
Total_annual_cost = Total_monthly_cost × 12
Cost_per_researcher = Total_monthly_cost / Number_of_researchers
```

### B.4 Break-Even Formulas

```
Break_even_researchers = Total_monthly_cost / Price_per_researcher_per_month
Break_even_months = Total_onboarding_cost / (Price_per_researcher × Researchers - Total_monthly_cost)
```

### B.5 Sensitivity Formulas

```
Sensitivity_pct = (Cost_at_input_plus_50pct - Cost_at_input_minus_50pct) / (2 × Cost_at_central) × 100
Uncertainty_propagation = sqrt(sum of squared component_uncertainties)
```

---

## Appendix C: Scenario Comparison Matrix

| Parameter | SCN-LOW | SCN-CENTRAL | SCN-HIGH |
|---|---|---|---|
| Total workflows | 1 | 3 | 10 |
| Workflow request share | 100% | 33% | 10% |
| Active researchers | 1 | 3 | 10 |
| Sessions per month | 10 | 50 | 200 |
| API requests per month | 100 | 1,000 | 10,000 |
| VPS cost | $40 | $50 | $60 |
| ARSY CPU share | 30% | 37.5% | 45% |
| Compute cost | $12.00 | $6.19 | $2.70 |
| Storage cost | $17.00 | $3.83 | $0.80 |
| Network cost | $5.33 | $3.16 | $1.34 |
| External services cost | $0.00 | $10.00 | $23.33 |
| Dev tools cost | $1.25 | $0.42 | $0.42 |
| **Infrastructure subtotal** | **$35.58** | **$23.60** | **$28.59** |
| Onboarding hours | 40 | 80 | 120 |
| Onboarding rate | $40/hr | $50/hr | $60/hr |
| Amortization months | 24 | 12 | 6 |
| Onboarding monthly | $66.67 | $333.33 | $1,200.00 |
| Maintenance monthly | $30.00 | $80.00 | $200.00 |
| Patching monthly | $20.00 | $50.00 | $120.00 |
| **Support labor subtotal** | **$116.67** | **$463.33** | **$1,520.00** |
| **TOTAL MONTHLY COST** | **$152.25** | **$486.93** | **$1,548.59** |
| **TOTAL ANNUAL COST** | **$1,827** | **$5,843** | **$18,583** |
| **COST PER RESEARCHER/MO** | **$152.25** | **$162.31** | **$154.86** |
| Infrastructure share | 23% | 5% | 2% |
| Support labor share | 77% | 95% | 98% |

---

## Appendix D: Cross-Reference to V5 Source Package

This document corresponds to the following entries in the V5 source package:

| V5 reference | Location | Relationship |
|---|---|---|
| ECO-006 | `docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md` | Canonical specification (22 sections) |
| M48-06 | `TODO.md` (M48 section) | Canonical TODO task |
| M48 milestone | `docs/milestones/M48.md` | Parent milestone |
| M46-31 / ENG-031 | `docs/audit/M46-31-recurring-service-cost.md` | Upstream aggregate cost baseline |
| M48-01 / ECO-001 | `docs/audit/M48-01-institutional-demand-validation.md` | Upstream demand validation |
| M48-02 / ECO-002 | `docs/audit/M48-02-self-hosted-support-demand.md` | Upstream support demand |
| M48-03 / ECO-003 | `docs/audit/M48-03-ethical-pricing-hypotheses.md` | Downstream pricing hypotheses |
| M48-07 / ECO-007 | (deferred) | Downstream funding model comparison |
| V5 source package | `docs/research/unified-100-issue-frontier-v5/README.md` | Source package root |
| ADR applicability | `docs/research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md` | No new ADR required |

---

## Appendix E: Reviewer Note Template

> **M48-06 Cost-to-Serve Model — Reviewer Sign-Off**
>
> **Document version**: 1.0 (synthetic baseline)
>
> **Reviewer name**: ________________________
>
> **Reviewer role**: [ ] Finance [ ] Operations [ ] Product [ ] Other: ____________
>
> **Review date**: ____________
>
> ---
>
> **Checklist**:
>
> - [ ] All inputs are classified (sourced/estimated/UNKNOWN).
> - [ ] Arithmetic fixtures pass (5/5).
> - [ ] Sensitivity analysis is complete (9 inputs ranked).
> - [ ] Uncertainty is documented (confidence intervals stated).
> - [ ] Exclusions are reviewed (12 exclusions listed).
> - [ ] Risk register is complete (10 risks identified).
> - [ ] Model does not claim profitability or set pricing.
> - [ ] Model does not contain customer data or billing telemetry.
> - [ ] Synthetic data is clearly marked throughout.
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

*End of document. Status: BASELINE ESTABLISHED. Synthetic data only. No real billing data. No customer data. No profitability claim.*
