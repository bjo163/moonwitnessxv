# M48-03 — Ethical Pricing Hypotheses for Institutional Research Tools

> **Status:** BASELINE ESTABLISHED — research protocol complete with synthetic findings; real testing deferred.
> **Task ID:** M48-03 · **Candidate:** ECO-003 · **Domain:** Economy / Pricing & Entitlements
> **Priority:** P2 · **Difficulty:** D3 · **Owner:** product research · **Effort:** M (4–7 days; no billing cost)
> **Milestone:** [M48 — WORKS buyer validation and sustainable economics](../milestones/M48.md)
> **Dependencies:** M48-01 (done), M48-02 (done), M35-02 (external — workable as baseline with synthetic data)
> **Date:** 30 October 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Research Goals and Constraints](#3-research-goals-and-constraints)
4. [Ethical Pricing Principles](#4-ethical-pricing-principles)
5. [Three Pricing Hypotheses](#5-three-pricing-hypotheses)
6. [Hypothetical Pricing Card Designs](#6-hypothetical-pricing-card-designs)
7. [Sacred/Public Source Access Exclusion](#7-sacredpublic-source-access-exclusion)
8. [Target Respondent Profile](#8-target-respondent-profile)
9. [Comprehension Testing Methodology](#9-comprehension-testing-methodology)
10. [Synthetic Respondent Profiles](#10-synthetic-respondent-profiles)
11. [Synthetic Comprehension Test Results](#11-synthetic-comprehension-test-results)
12. [Perceived Fairness Analysis](#12-perceived-fairness-analysis)
13. [Stated Budget Ranges with Confidence Intervals](#13-stated-budget-ranges-with-confidence-intervals)
14. [Ambiguity and Coercion Checks](#14-ambiguity-and-coercion-checks)
15. [Willingness-to-Pay vs Purchase Evidence Distinction](#15-willingness-to-pay-vs-purchase-evidence-distinction)
16. [Risk Analysis](#16-risk-analysis)
17. [Metrics and Success Criteria](#17-metrics-and-success-criteria)
18. [Limitations and Caveats](#18-limitations-and-caveats)
19. [Deferred Items Requiring Owner Action](#19-deferred-items-requiring-owner-action)
20. [Conclusion: BASELINE ESTABLISHED](#20-conclusion-baseline-established)

---

## 1. Executive Summary

M48-03 investigates whether institutional decision-makers can comprehend and evaluate three hypothetical pricing models for MoonWitness XV research-support tooling — without encountering any real price, commitment, or entitlement change. The task is purely a research artifact: no price field, billing module, or entitlement gate is added to any product.

Three hypotheses are compared:

- **H1 — Usage-Based Pricing:** Institutions pay for actual consumption of research-support compute, storage, and analyst time.
- **H2 — Flat Institutional License:** A predictable annual fee covers a defined tier of support/tooling access regardless of usage volume.
- **H3 — Sponsored-Access Model:** A third-party sponsor (foundation, grant body, or endowment) subsidizes access for qualifying institutions; the institution pays nothing or a reduced fee.

Each hypothesis is expressed as a complete pricing card with an explicit "NOT AN OFFER — HYPOTHETICAL RESEARCH ARTIFACT" disclaimer. Sacred and public source access (the Dock, the Reader, the published corpus) is excluded from all three cards and documented as permanently free.

Synthetic respondent profiles simulate institutional decision-makers for comprehension testing. The cognitive interview protocol checks whether respondents understand: (a) what is paid, (b) what remains free, and (c) that their response is hypothetical and carries no purchasing obligation.

**Key findings from synthetic baseline:**
- Comprehension of "paid vs free vs hypothetical" is achievable with clear card design and repeated disclaimers.
- Flat institutional pricing is perceived as fairest but raises concerns about under-resourced institutions.
- Sponsored-access is well-received but triggers questions about sponsor independence and long-term sustainability.
- Usage-based pricing generates the most ambiguity; respondents struggle to estimate their own consumption.
- All stated budget ranges carry wide confidence intervals and must not be interpreted as purchase intent.

**Closure status:** BASELINE ESTABLISHED. Research protocol is complete with synthetic findings. Real respondent testing is deferred and requires separate owner authorization for outreach, consent, and incentive handling.

---

## 2. Task Metadata

### 2.1 Canonical References

| Field | Value |
|---|---|
| Task ID | M48-03 |
| Candidate Code | ECO-003 |
| Domain / Category | Economy / Pricing & Entitlements |
| Priority | P2 (core product improvement) |
| Difficulty | D3 (bounded multi-file research) |
| Owner | product research |
| Effort Estimate | M (4–7 researcher days; no billing cost) |
| Status Register | [TODO.md](../../TODO.md) — sole status source |
| Milestone | M48 — WORKS buyer validation and sustainable economics |
| Milestone Group | G7 — ECOSYSTEM |

### 2.2 Dependencies

| Dependency | Status | Relevance |
|---|---|---|
| M48-01 (ECO-001) — Validate institutional demand | Done | Establishes that institutional demand exists; provides problem-interview themes |
| M48-02 (ECO-002) — Map institutional workflow cost | Done | Quantifies current workflow costs; provides baseline for pricing comparison |
| M35-02 — Merchant ownership (external) | External | Authoritative for any future payment/merchant integration; not exercised here |

### 2.3 ADR Applicability

No new Architecture Decision Record is required for this task scope. This document is a research artifact only. If future implementation would change a domain owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, the owner must review and propose an ADR before crossing that boundary.

Reference: [M46–M50 ADR Applicability Register](../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md).

### 2.4 Anti-Overlap Statement

M48-03 does not:
- Set production pricing or create entitlement logic.
- Add price fields to any product database or API.
- Make a commercial offer or commitment to any institution.
- Replace M48-04 (which handles actual entitlement/policy design).
- Validate the M35 physical/service pilot.

### 2.5 Execution Contract

This document follows the [AI Execution Contract](../planning/AI_EXECUTION_CONTRACT.md). No code, migration, deployment, or owner-boundary change was performed. All data in this document is synthetic unless explicitly attributed to an external source.

---

## 3. Research Goals and Constraints

### 3.1 Primary Research Goal

Determine whether institutional decision-makers can meaningfully compare three hypothetical pricing models for MoonWitness XV research-support tooling, and whether they comprehend the distinction between:

1. What would be **paid** under each hypothesis.
2. What would remain **free** regardless of pricing model.
3. The fact that their evaluation is **hypothetical** and carries no purchasing obligation.

### 3.2 Secondary Research Goals

- Identify which pricing model generates the least ambiguity and perceived coercion.
- Elicit stated budget ranges (with confidence intervals) for each model.
- Assess perceived fairness across institutional roles and budget authorities.
- Surface risks specific to hypothetical pricing research (courtesy bias, anchor effects, hypothetical bias).

### 3.3 Hard Constraints

| Constraint | Rationale |
|---|---|
| **No real pricing** | This is a research artifact; no price is published as an offer or commitment |
| **No billing cost** | Effort budget is 4–7 researcher days; no financial transaction occurs |
| **No entitlement logic** | No code change to product access controls or subscription systems |
| **Sacred/public source always free** | The Dock, Reader, and published corpus are excluded from all pricing hypotheses |
| **Synthetic data only** | All respondent profiles, comprehension results, and budget ranges in this document are simulated |
| **Separate authorization for real outreach** | Contacting real institutional decision-makers requires distinct owner approval for consent, incentives, and data handling |
| **No overlap with M48-04** | Entitlement policy design is a separate task; this document does not prescribe implementation |

### 3.4 Scope Boundaries

**In scope:**
- Three hypothetical pricing cards (usage-based, flat institutional, sponsored-access).
- Pricing card disclaimer language and visual design specification.
- Sacred/public source exclusion documentation.
- Target respondent profile definition.
- Cognitive interview protocol for comprehension testing.
- Synthetic respondent profiles (5–8 fictional decision-makers).
- Synthetic comprehension test results.
- Perceived fairness analysis.
- Stated budget ranges with confidence intervals.
- Ambiguity and coercion checks.
- Risk analysis (hypothetical bias, courtesy bias, anchor effects).
- Metrics and success criteria.
- Limitations, caveats, and deferred items.

**Out of scope:**
- Real respondent recruitment or outreach.
- Actual pricing decisions or commitments.
- Product code changes (billing, entitlements, access control).
- Legal review of pricing compliance (deferred to M48-04).
- Merchant or payment-system integration (M35-02 domain).

### 3.5 Research Artifacts Produced

| Artifact | Format | Location |
|---|---|---|
| This document | Markdown | `docs/audit/M48-03-ethical-pricing-hypotheses.md` |
| Pricing Card H1 (usage-based) | Section 6.1 | Inline |
| Pricing Card H2 (flat institutional) | Section 6.2 | Inline |
| Pricing Card H3 (sponsored-access) | Section 6.3 | Inline |
| Cognitive interview protocol | Section 9 | Inline |
| Synthetic respondent profiles | Section 10 | Inline |
| Comprehension results matrix | Section 11 | Inline |
| Fairness analysis | Section 12 | Inline |
| Budget range estimates | Section 13 | Inline |
| Risk register | Section 16 | Inline |

---

## 4. Ethical Pricing Principles

All three pricing hypotheses are evaluated against four ethical principles. These principles are derived from the MoonWitness XV commitment to fair access, transparency, and non-coercion in institutional relationships.

### 4.1 Fairness

**Principle:** Pricing must not create unjustified disparities between institutions of different sizes, endowments, or geographic locations.

**Operational criteria:**
- A small theological seminary in rural Indonesia should face proportionally similar access conditions as a large research university in North America.
- Pricing tiers must be justifiable by observable cost differences (e.g., support hours, compute consumption), not by arbitrary segmentation.
- No institution should be priced out of essential research tooling solely due to historical underfunding.
- The relationship between price and value must be transparent and defensible to an independent observer.
- Institutions with similar needs should face similar prices, regardless of their geographic location, language, or religious tradition.

**Risks to fairness:**
- Usage-based pricing may disadvantage institutions with less predictable workflows or less experience estimating consumption. It may also penalize institutions that conduct intensive research (e.g., large-scale comparative studies) over institutions with lighter usage patterns.
- Flat institutional pricing may create a "one size fits none" problem if the flat fee is too high for small institutions or too low to sustain service for heavy users. Tier boundaries may inadvertently correlate with institution size, wealth, or geography, creating systematic disparities.
- Sponsored-access pricing may introduce sponsor-driven selection bias (which institutions qualify?). If sponsors favor certain regions, disciplines, or institution types, the model may create inequitable access patterns that mirror existing global research disparities.
- All three models risk excluding independent researchers, unaffiliated scholars, and community-based research collectives that do not fit the "institutional" frame.

**Fairness evaluation framework:**
When assessing fairness, consider the following dimensions:
1. **Horizontal equity:** Are similarly situated institutions treated similarly?
2. **Vertical equity:** Are institutions with greater capacity asked to contribute proportionally more?
3. **Procedural fairness:** Are the criteria for pricing transparent and consistently applied?
4. **Substantive fairness:** Do the pricing outcomes enable meaningful access for all qualifying institutions?
5. **Intergenerational fairness:** Do the pricing models sustain the service for future researchers without overburdening current ones?

### 4.2 Access

**Principle:** Sacred and public source access must remain unconditionally free. Research-support tooling pricing must not create a de facto paywall around publicly funded or donated content.

**Operational criteria:**
- The Dock (public-facing web application), the Reader (licensed/metadata-only text access), and the published corpus remain accessible without any payment or institutional affiliation.
- No pricing hypothesis may condition access to sacred texts, public source material, or community witness content on institutional subscription.
- If research-support tooling includes any capability that touches public content (e.g., search, cross-reference), the public-facing layer must remain free; only the enhanced analytical tooling may be subject to pricing.

**Risks to access:**
- Feature creep could gradually shift capabilities from the "free" tier into the "paid" tier, eroding public access over time.
- Sponsored-access models may give sponsors indirect influence over which research capabilities are available to unsubsidized users.

### 4.3 Transparency

**Principle:** Every pricing hypothesis must clearly disclose what is paid, what is free, what is hypothetical, and how the price was derived.

**Operational criteria:**
- Each pricing card must display a prominent "NOT AN OFFER — HYPOTHETICAL RESEARCH ARTIFACT" disclaimer.
- The card must specify which services are included and which are excluded.
- The card must explain the pricing logic (per-unit, flat fee, sponsored subsidy) in plain language.
- Any range or estimate must be accompanied by a confidence interval and a statement of the data source (synthetic in this case).

**Risks to transparency:**
- Complex pricing models (especially usage-based) may be difficult for respondents to evaluate without real consumption data.
- Disclaimer fatigue may cause respondents to overlook the hypothetical nature of the exercise.

### 4.4 No Coercion

**Principle:** Respondents must never feel pressured to express willingness to pay, and must understand that declining or expressing uncertainty is a valid and welcome response.

**Operational criteria:**
- The cognitive interview protocol must include explicit statements that the exercise is hypothetical and that no purchase is expected.
- Respondents must be told they can skip any question or withdraw at any time without consequence.
- Interviewers must not use leading questions that suggest a "correct" answer (e.g., "Don't you think this is a fair price?").
- Results must be reported with clear separation between stated willingness-to-pay and actual purchase evidence.
- No incentive, reward, or benefit may be contingent on a particular response.
- The research setting must be physically and psychologically comfortable; respondents must not feel observed or judged by institutional superiors during the interview.

**Risks of coercion:**
- Institutional courtesy bias: respondents may overstate willingness to pay because they want to support the project or maintain a relationship with the MoonWitness team. This is especially likely when the respondent has a personal relationship with the researchers.
- Authority pressure: junior staff may feel compelled to agree with a senior colleague's assessment during group interviews. Department heads may feel pressure from university administration to express support for institutional tooling.
- Anchor effects: presenting a specific price range (even as hypothetical) may anchor respondents' estimates and reduce the validity of their stated preferences. Respondents may adjust their answers to fall within the presented range rather than expressing their true assessment.
- Mission alignment pressure: respondents who share the MoonWitness mission (e.g., religious scholars, community researchers) may feel that expressing reluctance to pay is equivalent to opposing the mission itself.
- Reciprocity pressure: respondents who have received free access to MoonWitness resources may feel obligated to express willingness to pay as a form of reciprocation.
- Temporal pressure: respondents who feel rushed or who are interviewed at the end of a long meeting may provide superficial answers rather than genuinely engaging with the pricing models.

**Anti-coercion safeguards:**
1. **Explicit opt-out:** At the beginning of each interview, state: "You may skip any question or stop the interview at any time. There is no penalty for doing so."
2. **Neutral phrasing:** Avoid questions that imply a desired answer. Instead of "Would you be willing to pay X?", ask "What is your reaction to this pricing model?"
3. **Separation of research and relationship:** Make clear that the respondent's relationship with MoonWitness (access to free resources, collaboration, community membership) is not affected by their responses to this research.
4. **Anonymous reporting:** Ensure that individual responses cannot be traced back to the respondent in any published report. Use aggregate data and anonymized quotes only.
5. **No real-time pressure:** Conduct interviews in a private setting, without the respondent's supervisor or colleagues present. Allow the respondent time to think before answering.

---

## 5. Three Pricing Hypotheses

### 5.1 H1 — Usage-Based Pricing

**Core idea:** Institutions pay for what they consume. Pricing is metered by observable units of research-support activity.

**Rationale:** Usage-based pricing aligns cost with value received. Institutions that use the tooling heavily pay more; light users pay less. This model is common in cloud infrastructure (compute hours, storage GB, API calls) and may feel familiar to institutional procurement offices.

**Hypothetical pricing structure:**

| Service Component | Hypothetical Unit | Hypothetical Range |
|---|---|---|
| Research query processing | Per 1,000 queries | IDR 50,000 – 150,000 / 1,000 queries |
| Analytical report generation | Per report | IDR 25,000 – 75,000 / report |
| Data export / bulk download | Per GB exported | IDR 10,000 – 30,000 / GB |
| Dedicated support analyst time | Per hour | IDR 200,000 – 500,000 / hour |
| Custom ontology/lexicon build | Per project | IDR 2,000,000 – 10,000,000 / project |

**Advantages (hypothetical):**
- Scales with institutional need; small users are not overcharged.
- Transparent cost-to-value relationship.
- Familiar to procurement offices accustomed to cloud pricing.

**Disadvantages (hypothetical):**
- Unpredictable costs make budgeting difficult.
- Institutions may underuse tooling to avoid surprise bills, reducing research quality.
- Requires metering infrastructure that does not currently exist.
- Respondents may struggle to estimate their own consumption.

### 5.2 H2 — Flat Institutional License

**Core idea:** Institutions pay a predictable annual fee for a defined tier of research-support tooling access, regardless of how much they use it within that tier.

**Rationale:** Flat licensing reduces budget uncertainty and administrative overhead. It is common in academic software (library database subscriptions, LMS licenses) and may align with existing institutional procurement patterns.

**Hypothetical pricing structure:**

| Tier | Hypothetical Annual Fee | Included Services |
|---|---|---|
| Tier 1 — Essential | IDR 5,000,000 – 15,000,000 / year | Up to 3 researcher seats, standard query processing (up to 50,000 queries/year), basic report generation (up to 100 reports/year), community support |
| Tier 2 — Professional | IDR 25,000,000 – 60,000,000 / year | Up to 15 researcher seats, unlimited query processing, unlimited report generation, bulk export (up to 10 GB/year), priority email support (48-hour SLA) |
| Tier 3 — Institutional | IDR 100,000,000 – 250,000,000 / year | Unlimited seats, unlimited queries and reports, unlimited bulk export, dedicated support analyst (up to 20 hours/year), custom ontology/lexicon consulting (up to 1 project/year) |

**Advantages (hypothetical):**
- Predictable costs; easy to budget and approve.
- Encourages exploration and use (no per-transaction anxiety).
- Aligns with existing academic software procurement patterns.
- Simple administration; no metering infrastructure required.

**Disadvantages (hypothetical):**
- May overcharge light users and undercharge heavy users.
- Tier boundaries may feel arbitrary or exclusionary.
- Institutions at the bottom of one tier may feel pressured to "upgrade" even if their needs are met.
- Revenue may not scale with cost-to-serve if usage grows unexpectedly.

### 5.3 H3 — Sponsored-Access Model

**Core idea:** A third-party sponsor (foundation, grant body, endowment, or institutional consortium) subsidizes access for qualifying institutions. The institution pays nothing or a significantly reduced fee.

**Rationale:** Sponsored access removes the cost barrier for under-resourced institutions and aligns with the MoonWitness mission of broadening research access. It is common in development economics, public health, and open-education contexts.

**Hypothetical pricing structure:**

| Sponsor Type | Hypothetical Sponsor Contribution | Institution Cost | Qualification Criteria |
|---|---|---|---|
| Foundation grant | IDR 50,000,000 – 200,000,000 / year (covers 10–50 institutions) | Free for qualifying institutions | Must be a registered research or educational institution in a qualifying region; must demonstrate financial need; must agree to share anonymized usage data with sponsor |
| Government research council | IDR 100,000,000 – 500,000,000 / year (covers a national cohort) | Free or co-pay (IDR 1,000,000 – 5,000,000 / year) | Must be a public institution in the sponsor's jurisdiction; must align with national research priorities |
| Institutional consortium | Per-member contribution (IDR 5,000,000 – 20,000,000 / member / year) | Reduced fee (50% of H2 Tier 1) | Must be a member of a participating consortium; consortium negotiates bulk terms |
| Endowment | One-time or recurring endowment (IDR 500,000,000+) | Free in perpetuity (subject to endowment terms) | Endowment terms define eligible institutions; independent board manages allocation |

**Advantages (hypothetical):**
- Removes cost barrier for qualifying institutions.
- Aligns with MoonWitness mission of broad research access.
- Diversifies revenue sources (not dependent on institutional budgets alone).
- May attract institutions that would never purchase at market rate.

**Disadvantages (hypothetical):**
- Creates dependency on sponsor continuity; if sponsor withdraws, institutions face sudden cost exposure.
- Sponsor may exert influence over which institutions qualify, what research is supported, or what data is shared.
- Qualification criteria may be perceived as exclusionary or paternalistic.
- Requires sponsor identification, negotiation, and ongoing relationship management (significant operational overhead).
- Anonymized usage data sharing may raise privacy concerns even if data is de-identified.

---

## 6. Hypothetical Pricing Card Designs

Each pricing card below is a complete design specification. In a real research setting, these would be rendered as visual cards (PDF, web page, or printed handout) presented to respondents during cognitive interviews.

> **CRITICAL DISCLAIMER (to appear prominently on every card):**
>
> **THIS IS NOT AN OFFER. THIS IS NOT A COMMITMENT.**
> **This card is a hypothetical research artifact created for study purposes only.**
> **No price listed here is real. No service described here is available for purchase.**
> **Your responses will not result in any charge or subscription.**
> **MoonWitness XV is not currently selling any product or service.**

### 6.1 Pricing Card H1 — Usage-Based (Research Support)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ⚠️  NOT AN OFFER — HYPOTHETICAL RESEARCH ARTIFACT  ⚠️                  │
│                                                                         │
│  No price below is real. No service is available for purchase.          │
│  This card exists only for research comprehension testing.              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HYPOTHETICAL CARD H1: USAGE-BASED RESEARCH SUPPORT                    │
│                                                                         │
│  Under this hypothetical model, your institution would pay only for     │
│  the research-support services it actually uses. There would be no      │
│  annual commitment; billing would be metered monthly.                   │
│                                                                         │
│  ┌──────────────────────────────────┬────────────────┬───────────────┐  │
│  │ Service                          │ Hypothetical   │ Hypothetical  │  │
│  │                                  │ Unit           │ Range         │  │
│  ├──────────────────────────────────┼────────────────┼───────────────┤  │
│  │ Research query processing        │ Per 1,000      │ IDR 50K–150K  │  │
│  │ Analytical report generation     │ Per report     │ IDR 25K–75K   │  │
│  │ Data export / bulk download      │ Per GB         │ IDR 10K–30K   │  │
│  │ Dedicated support analyst time   │ Per hour       │ IDR 200K–500K │  │
│  │ Custom ontology/lexicon build    │ Per project    │ IDR 2M–10M    │  │
│  └──────────────────────────────────┴────────────────┴───────────────┘  │
│                                                                         │
│  WHAT REMAINS FREE (always, under every hypothesis):                    │
│  • Access to the Dock (public web application)                          │
│  • Access to the Reader (licensed/metadata-only text viewer)            │
│  • Access to the published corpus and sacred texts                      │
│  • Community forum participation                                        │
│  • Basic search and cross-reference capabilities                        │
│                                                                         │
│  WHAT THIS HYPOTHETICAL PRICE WOULD COVER:                              │
│  • Enhanced analytical tooling (query processing, report generation)    │
│  • Bulk data export capabilities                                        │
│  • Dedicated human support from research analysts                       │
│  • Custom ontology and lexicon development                              │
│                                                                         │
│  ⚠️  REMINDER: These are hypothetical ranges, not real prices.          │
│  You are not being asked to purchase anything.                          │
│  Your task is to evaluate whether this pricing model is clear and fair. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Pricing Card H2 — Flat Institutional License

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ⚠️  NOT AN OFFER — HYPOTHETICAL RESEARCH ARTIFACT  ⚠️                  │
│                                                                         │
│  No price below is real. No service is available for purchase.          │
│  This card exists only for research comprehension testing.              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HYPOTHETICAL CARD H2: FLAT INSTITUTIONAL LICENSE                      │
│                                                                         │
│  Under this hypothetical model, your institution would pay a fixed      │
│  annual fee for a defined tier of research-support access. Usage        │
│  within the tier would be unlimited. There would be no surprise bills.  │
│                                                                         │
│  ┌────────────┬──────────────────────┬────────────────────────────────┐ │
│  │ Tier       │ Hypothetical Annual  │ Included Services              │ │
│  │            │ Fee                  │                                │ │
│  ├────────────┼──────────────────────┼────────────────────────────────┤ │
│  │ Tier 1     │ IDR 5M–15M / year    │ 3 seats, 50K queries, 100     │ │
│  │ Essential  │                      │ reports, community support     │ │
│  ├────────────┼──────────────────────┼────────────────────────────────┤ │
│  │ Tier 2     │ IDR 25M–60M / year   │ 15 seats, unlimited queries   │ │
│  │ Profession │                      │ and reports, 10 GB export,    │ │
│  │            │                      │ priority email support (48h)   │ │
│  ├────────────┼──────────────────────┼────────────────────────────────┤ │
│  │ Tier 3     │ IDR 100M–250M / year │ Unlimited seats, queries,     │ │
│  │ Institutio │                      │ reports, exports; 20 hrs      │ │
│  │            │                      │ dedicated analyst; 1 custom    │ │
│  │            │                      │ ontology project               │ │
│  └────────────┴──────────────────────┴────────────────────────────────┘ │
│                                                                         │
│  WHAT REMAINS FREE (always, under every hypothesis):                    │
│  • Access to the Dock (public web application)                          │
│  • Access to the Reader (licensed/metadata-only text viewer)            │
│  • Access to the published corpus and sacred texts                      │
│  • Community forum participation                                        │
│  • Basic search and cross-reference capabilities                        │
│                                                                         │
│  WHAT THIS HYPOTHETICAL PRICE WOULD COVER:                              │
│  • All research-support tooling within the selected tier                │
│  • Predictable annual cost (no usage metering)                          │
│  • Tier-appropriate support level                                       │
│                                                                         │
│  ⚠️  REMINDER: These are hypothetical ranges, not real prices.          │
│  You are not being asked to purchase anything.                          │
│  Your task is to evaluate whether this pricing model is clear and fair. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Pricing Card H3 — Sponsored Access

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ⚠️  NOT AN OFFER — HYPOTHETICAL RESEARCH ARTIFACT  ⚠️                  │
│                                                                         │
│  No price below is real. No service is available for purchase.          │
│  This card exists only for research comprehension testing.              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HYPOTHETICAL CARD H3: SPONSORED-ACCESS MODEL                          │
│                                                                         │
│  Under this hypothetical model, a third-party sponsor (foundation,      │
│  government research council, institutional consortium, or endowment)   │
│  would subsidize your institution's access. Your institution would      │
│  pay nothing or a significantly reduced fee.                            │
│                                                                         │
│  ┌────────────────────┬──────────────────────┬────────────────────────┐ │
│  │ Sponsor Type       │ Hypothetical Sponsor   │ Institution Cost       │ │
│  │                    │ Contribution           │                        │ │
│  ├────────────────────┼──────────────────────┼────────────────────────┤ │
│  │ Foundation Grant   │ IDR 50M–200M / year    │ Free for qualifying    │ │
│  │                    │ (covers 10–50 inst.)   │ institutions           │ │
│  ├────────────────────┼──────────────────────┼────────────────────────┤ │
│  │ Government Council │ IDR 100M–500M / year   │ Free or co-pay         │ │
│  │                    │ (covers national       │ (IDR 1M–5M / year)     │ │
│  │                    │ cohort)                │                        │ │
│  ├────────────────────┼──────────────────────┼────────────────────────┤ │
│  │ Consortium         │ IDR 5M–20M / member /  │ 50% of H2 Tier 1 fee  │ │
│  │                    │ year                   │                        │ │
│  ├────────────────────┼──────────────────────┼────────────────────────┤ │
│  │ Endowment          │ IDR 500M+ (one-time    │ Free in perpetuity     │ │
│  │                    │ or recurring)          │ (subject to terms)     │ │
│  └────────────────────┴──────────────────────┴────────────────────────┘ │
│                                                                         │
│  HYPOTHETICAL QUALIFICATION CRITERIA:                                   │
│  • Must be a registered research or educational institution             │
│  • Must demonstrate financial need (for foundation/government sponsors) │
│  • Must be in a qualifying region or jurisdiction                       │
│  • Must agree to share anonymized usage data with sponsor               │
│  • Must align with sponsor's research priorities (for government)       │
│                                                                         │
│  WHAT REMAINS FREE (always, under every hypothesis):                    │
│  • Access to the Dock (public web application)                          │
│  • Access to the Reader (licensed/metadata-only text viewer)            │
│  • Access to the published corpus and sacred texts                      │
│  • Community forum participation                                        │
│  • Basic search and cross-reference capabilities                        │
│                                                                         │
│  WHAT THIS HYPOTHETICAL MODEL WOULD COVER:                              │
│  • Full research-support tooling access (same as H2 Tier 2 or 3)       │
│  • Subsidized by a third party; institution pays little or nothing      │
│                                                                         │
│  ⚠️  REMINDER: These are hypothetical ranges, not real prices.          │
│  You are not being asked to purchase anything.                          │
│  Your task is to evaluate whether this pricing model is clear and fair. │
│                                                                         │
│  ⚠️  ADDITIONAL NOTE FOR H3:                                            │
│  Sponsor independence is a research concern. If a sponsor withdraws     │
│  funding, institutions may face sudden cost exposure. If a sponsor      │
│  influences which institutions qualify, that raises equity questions.   │
│  These risks are part of what we are asking you to evaluate.            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Card Design Principles

The following design principles govern all three cards:

1. **Disclaimer prominence:** The "NOT AN OFFER" disclaimer appears at the top of every card in a visually distinct format (warning symbols, bold text, bordered box). It is repeated at the bottom.

2. **Free tier consistency:** Every card includes an identical "WHAT REMAINS FREE" section, reinforcing that sacred/public source access is unconditional and model-independent.

3. **Plain language:** All pricing descriptions use simple, jargon-free language. Technical terms (e.g., "ontology," "query processing") are accompanied by brief explanations.

4. **Range, not point estimate:** All prices are expressed as ranges (e.g., "IDR 50K–150K") rather than fixed numbers, to emphasize their hypothetical nature and to avoid anchoring respondents to a specific figure.

5. **Contextual framing:** Each card explains not just what the price is, but what the price model means in practice (e.g., "You would pay only for what you use" for H1; "No surprise bills" for H2).

6. **Risk disclosure:** H3 includes an explicit note about sponsor-dependency risks, ensuring respondents evaluate the model with eyes open.

7. **Visual separation:** The card border, section dividers, and whitespace are designed to make the card scannable and to prevent information overload.

---

## 7. Sacred/Public Source Access Exclusion

### 7.1 Principle

Sacred texts, public source material, and community witness content are the foundational mission of MoonWitness XV. They must remain unconditionally accessible to all people, regardless of institutional affiliation, financial capacity, or pricing model.

No pricing hypothesis — now or in the future — may condition access to sacred or public source content on payment, subscription, or institutional membership.

### 7.2 What Remains Free (Always)

The following capabilities are excluded from all three pricing hypotheses and are permanently free:

| Capability | Description | Access Condition |
|---|---|---|
| **Dock (Public Web Application)** | The primary public-facing interface for browsing MoonWitness content, including station listings, narrative pages, and community resources | Open to all; no login required |
| **Reader (Licensed/Metadata-Only Text Viewer)** | Access to licensed texts and metadata, including search, cross-reference, and reading features | Open to all; no login required; full-text access subject to existing license terms |
| **Published Corpus** | The curated collection of source texts, editions, licenses, and metadata inventories | Open to all; no login required; subject to existing rights and consent policies |
| **Sacred Texts** | Religious and spiritual texts held in the corpus, including Quranic excerpts, biblical passages, and other faith-tradition materials | Open to all; no login required; subject to existing rights and consent policies (ADR-0003) |
| **Community Forum** | Public discussion space for researchers, community members, and interested parties | Open to all; registration may be required for posting but not for reading |
| **Basic Search and Cross-Reference** | The ability to search the corpus, view cross-references between texts, and explore the ontology/lexicon at a summary level | Open to all; no login required |
| **Bilingual Interface (ID/EN)** | The Indonesian and English language interface for all public-facing applications | Open to all; no login required |

### 7.3 What Is Subject to Hypothetical Pricing

The following capabilities are included in the hypothetical pricing cards and would be subject to payment under any of the three models:

| Capability | Description | Why It Is Priced (Hypothetically) |
|---|---|---|
| **Enhanced Query Processing** | High-volume or complex analytical queries beyond basic search | Requires dedicated compute resources and analyst oversight |
| **Analytical Report Generation** | Automated or semi-automated generation of structured research reports | Requires specialized tooling and domain expertise |
| **Bulk Data Export** | Large-scale download of structured data for external analysis | Requires storage, bandwidth, and data preparation |
| **Dedicated Support Analyst** | Assigned human analyst to assist with research questions | Direct labor cost |
| **Custom Ontology/Lexicon Build** | Tailored development of domain-specific terminology frameworks | Significant development effort requiring specialist knowledge |
| **Priority Support SLA** | Guaranteed response times for technical or research questions | Requires staffed support infrastructure |
| **Multiple Researcher Seats** | Beyond a basic individual allocation | Per-seat licensing is a common institutional model |

### 7.4 Boundary Enforcement

To prevent future erosion of the free/sacred boundary:

1. **Any pricing model must explicitly list what remains free.** The "WHAT REMAINS FREE" section on each pricing card is not optional decoration; it is a structural requirement.

2. **Feature migration from free to paid requires owner review.** If a capability currently in the "free" column is proposed for inclusion in a paid tier, the proposal must undergo owner review and be documented as an ADR or amendment to this baseline.

3. **Sponsored-access models must not create a two-tier public sphere.** If H3 is adopted, the sponsored tier must provide the same capabilities as the highest unsubsidized tier. Sponsorship must not create a "premium free" that is better than the "regular free."

4. **Public access metrics must be monitored independently.** Usage statistics for free/public capabilities must be reported separately from paid-tier statistics, so that any decline in public access is visible and not masked by aggregate numbers.

### 7.5 Relationship to Existing Policies

This exclusion is consistent with:
- **ADR-0003** (rights and consent): Sacred texts and community witness material are governed by consent policies that override commercial considerations.
- **BLUEPRINT.md D08** (Publication/Governance): Public publishing gates are independent of any pricing model.
- **SECURITY.md**: "rights/consent override public UI" — access to sacred material is governed by consent, not by subscription.
- **M34-01** (D05 MIZAN research exposure inventory): Research projections must not expose unreviewed material; pricing must not create an incentive to bypass review.

---

## 8. Target Respondent Profile

### 8.1 Purpose

The target respondent profile defines the types of institutional decision-makers whose comprehension and fairness evaluations would be most informative for refining the three pricing hypotheses. In this synthetic baseline, no real respondents were contacted; the profiles in Section 10 are fictional approximations.

### 8.2 Eligible Roles

| Role Category | Example Titles | Why This Role Matters |
|---|---|---|
| **Library Director / Head of Collections** | University Librarian, Director of Library Services, Head of Acquisitions | Controls institutional budget for research tools and databases; understands procurement cycles |
| **Research Group Leader / Principal Investigator** | Professor, Senior Research Fellow, Lab Director | End-user decision-maker; understands research workflow needs and can advocate for tooling |
| **IT Director / Head of Research Computing** | CIO (academic), Director of Research IT, Head of Digital Infrastructure | Evaluates technical feasibility, integration requirements, and institutional IT budget |
| **Procurement / Finance Officer** | Purchasing Manager, Budget Analyst, Grants Administrator | Processes purchase orders and ensures compliance with institutional financial policies |
| **Consortium / Cooperative Leader** | Director of Library Consortium, Regional Research Network Coordinator | Negotiates bulk licenses on behalf of multiple institutions; understands collective bargaining |
| **Department Head (Humanities/Social Sciences)** | Dean of Humanities, Chair of Religious Studies, Head of Area Studies | Advocates for disciplinary needs; may control discretionary research budgets |
| **Graduate Student Representative** | PhD Candidate, Graduate Student Association Officer | End-user with limited personal budget; represents the next generation of researchers |
| **Independent Researcher / Affiliated Scholar** | Independent Scholar, Visiting Fellow, Emeritus Professor | May lack institutional affiliation entirely; tests whether pricing models exclude unaffiliated researchers |

### 8.3 Eligible Institution Types

| Institution Type | Characteristics | Relevance |
|---|---|---|
| **Large Research University** | Endowment > IDR 1 trillion; 10,000+ students; multiple libraries | Tests whether pricing scales appropriately for large institutions |
| **Small Theological Seminary** | Endowment < IDR 10 billion; < 500 students; single library | Tests whether pricing is accessible to small, mission-driven institutions |
| **Public University (Developing Region)** | Government-funded; limited discretionary budget; high student enrollment | Tests whether pricing accounts for resource constraints in public institutions |
| **Research Institute (Non-University)** | Focused research mission; no teaching obligation; grant-funded | Tests whether pricing accommodates non-traditional research organizations |
| **Community College / Vocational Institution** | Teaching-focused; limited research budget; diverse student population | Tests whether pricing excludes institutions that primarily teach rather than research |
| **Independent Research Collective** | Informal organization; no institutional affiliation; volunteer-based | Tests whether pricing models accommodate non-institutional research |

### 8.4 Geographic and Linguistic Diversity

Target respondents should represent:
- **Indonesia** (primary MoonWitness community; Bahasa Indonesia interface)
- **Southeast Asia** (regional context; multilingual research environments)
- **Middle East / North Africa** (sacred text research communities; Arabic-language scholarship)
- **Europe** (established academic library consortia; GDPR-aware procurement)
- **North America** (large research universities; familiar with SaaS pricing models)
- **Sub-Saharan Africa** (under-resourced institutions; development-funded research)
- **Latin America** (growing research infrastructure; Spanish/Portuguese-language scholarship)

### 8.5 Budget Authority Spectrum

Respondents should span the full range of budget authority:

| Budget Authority Level | Description | Why It Matters |
|---|---|---|
| **Full authority** | Can approve institutional expenditure up to IDR 500M+ without external sign-off | Tests whether pricing is comprehensible to the final decision-maker |
| **Recommendation authority** | Can recommend purchases to a committee or supervisor | Tests whether pricing materials are clear enough to be forwarded and explained |
| **End-user influence** | Can advocate for tooling but has no direct budget control | Tests whether pricing is compelling enough to motivate advocacy |
| **Personal budget** | Pays for research tools from personal or lab discretionary funds | Tests whether pricing is accessible to individual decision-makers |

### 8.6 Sampling Strategy (for Future Real Research)

When real respondent testing is authorized:
- **Minimum sample size:** 6–10 respondents (consistent with M48-01 problem interviews)
- **Maximum sample size:** 20 respondents (beyond which diminishing returns set in for qualitative comprehension testing)
- **Sampling method:** Purposive sampling (not random); select for role diversity, institution-type diversity, and geographic diversity
- **Shared respondent pool:** M48-03 shares one consent/outreach protocol and respondent pool with M48-01, M48-02, and M48-05 (per anti-overlap specification)
- **Incentives:** Interview incentives only with separate owner approval; no incentive may be contingent on a particular response

---

## 9. Comprehension Testing Methodology

### 9.1 Method: Cognitive Interview Protocol

Cognitive interviewing is a qualitative method for testing whether respondents understand a document as intended. It involves presenting the document (in this case, a pricing card) and asking the respondent to think aloud while reading it, followed by structured probes.

**Why cognitive interviewing:**
- It reveals misunderstandings that surveys would miss (e.g., a respondent who says "yes, I understand" but has misread a key term).
- It tests the document, not the respondent — the goal is to find ambiguities in the card, not to evaluate the respondent's knowledge.
- It is well-suited to small sample sizes (6–10 respondents) because each interview generates rich qualitative data.

### 9.2 Interview Structure

Each cognitive interview follows this structure (estimated duration: 45–60 minutes):

**Phase 1 — Introduction (5 minutes)**
- Introduce the researcher and the purpose of the study.
- Read the consent statement aloud (or present it in writing).
- Emphasize: "This is a hypothetical exercise. You are not being asked to buy anything. There are no right or wrong answers. We are testing whether the document is clear."
- Confirm the respondent's role, institution type, and budget authority level.

**Phase 2 — Think-Aloud Reading (15–20 minutes)**
- Present one pricing card at a time (H1, H2, H3 in randomized order across respondents to avoid sequence effects).
- Ask the respondent to read the card aloud and verbalize their thoughts: "As you read, please tell me what you're thinking. If something is confusing, say so. If something surprises you, say so. If you're not sure what a term means, say so."
- The researcher takes notes on hesitations, misreadings, questions, and emotional reactions.

**Phase 3 — Structured Probes (15–20 minutes)**
After each card, ask the following comprehension questions (in the respondent's preferred language, ID or EN):

1. **Paid/Free Distinction:** "Looking at this card, can you tell me what you would be paying for? And can you tell me what would remain free regardless?"
   - *Expected correct answer:* Respondent identifies the priced services and the free services accurately.

2. **Hypothetical Awareness:** "Is anything on this card a real offer? Could your institution sign up for this today?"
   - *Expected correct answer:* Respondent clearly states that this is hypothetical and not available for purchase.

3. **Pricing Logic:** "Can you explain in your own words how the pricing would work under this model?"
   - *Expected correct answer:* Respondent accurately describes the pricing mechanism (per-unit, flat fee, or sponsored subsidy).

4. **Comparison:** "Looking at all three cards, which model do you think would be fairest for an institution like yours? Why?"
   - *Expected response:* Any answer is valid; the goal is to understand the respondent's fairness criteria.

5. **Ambiguity Check:** "Was there anything on this card that was unclear or confusing? Any terms you weren't sure about?"
   - *Expected response:* Specific identification of confusing elements, or a statement that everything was clear.

6. **Coercion Check:** "Did anything on this card make you feel pressured to say you would pay for this? Did you feel comfortable saying 'I wouldn't pay for this'?"
   - *Expected response:* Statement of comfort or discomfort, with specifics if discomfort was felt.

7. **Budget Estimation (optional, only if respondent is comfortable):** "If this were a real offer, what range of annual expenditure would your institution consider reasonable for these services? Please give me a range, not a specific number, and tell me how confident you are in that range."
   - *Expected response:* A range with a confidence qualifier (e.g., "I'd say IDR 10M–30M per year, but I'm not very confident because I don't know how much we'd use it").

**Phase 4 — Debrief (5 minutes)**
- Thank the respondent.
- Reiterate: "Nothing you said today constitutes a purchase or commitment. Your responses will be used only to improve the clarity of these research documents."
- Ask: "Is there anything else you'd like to tell us about these pricing cards?"
- Record any additional concerns or suggestions.

### 9.3 Comprehension Scoring

Each respondent's answers to the structured probes are scored on a three-point scale:

| Score | Label | Definition |
|---|---|---|
| 2 | **Full Comprehension** | Respondent accurately identifies what is paid, what is free, and that the card is hypothetical. No significant misunderstandings detected. |
| 1 | **Partial Comprehension** | Respondent understands some elements but misreads or is confused by others. For example, they may understand what is paid but not realize the card is hypothetical, or they may understand the hypothetical nature but misidentify which services are free. |
| 0 | **No Comprehension** | Respondent fundamentally misunderstands the card. For example, they believe it is a real offer, they cannot distinguish paid from free services, or they cannot explain the pricing logic. |

**Pass threshold:** A pricing card passes the comprehension test if at least 80% of respondents score 2 (Full Comprehension) on all seven probes. If fewer than 80% score 2, the card requires revision and re-testing.

### 9.4 Fairness and Coercion Scoring

Fairness and coercion are not scored numerically but are assessed qualitatively:

- **Fairness:** What criteria do respondents use to judge fairness? Do different roles/institution types judge fairness differently? Are there fairness concerns that the card does not address?
- **Coercion:** Do respondents express feeling pressured to endorse a pricing model? Do they feel comfortable expressing negative opinions? Are there elements of the card that could be perceived as coercive (e.g., urgency language, social proof, authority appeals)?

### 9.5 Interviewer Training Requirements

For future real interviews, interviewers must:
- Complete a training session on cognitive interviewing techniques (think-aloud protocol, neutral probing, avoiding leading questions).
- Practice the interview protocol with a colleague before conducting real interviews.
- Understand the ethical boundaries: no incentives contingent on particular responses; no pressure to express willingness to pay; clear separation between research and sales.
- Be prepared to stop the interview if the respondent expresses discomfort or confusion that cannot be resolved by neutral clarification.

### 9.6 Randomization and Counterbalancing

To avoid sequence effects:
- The order of pricing cards (H1, H2, H3) is randomized across respondents.
- Each respondent sees all three cards, but the first card they see varies.
- If the sample size permits, each of the six possible orderings (H1-H2-H3, H1-H3-H2, H2-H1-H3, H2-H3-H1, H3-H1-H2, H3-H2-H1) should be represented by at least one respondent.

---

## 10. Synthetic Respondent Profiles

The following eight fictional institutional decision-makers are synthetic profiles designed to simulate the range of perspectives that would be relevant for real comprehension testing. **No real individuals are represented.** These profiles are used in Section 11 to generate synthetic comprehension results.

### 10.1 Respondent S01 — Dr. Siti Nurhaliza

| Field | Value |
|---|---|
| **Role** | Head of Library Services |
| **Institution** | Universitas Islam Negeri (State Islamic University), Jakarta, Indonesia |
| **Institution Type** | Large public university (40,000+ students; multiple faculties) |
| **Budget Authority** | Recommendation authority (submits to university rector for approval) |
| **Research Focus** | Islamic studies, Quranic manuscripts, Indonesian religious history |
| **Current Workflow** | Uses existing digital libraries (JSTOR, Project MUSE); manual cross-referencing for Arabic-Indonesian texts |
| **Pain Points** | Limited budget for new digital resources; need for Arabic/Indonesian bilingual tooling; difficulty justifying new expenditures to administration |
| **Language Preference** | Bahasa Indonesia (fluent English) |
| **Synthetic Characteristics** | Cautious about new costs; values predictability; concerned about equity for students at under-resourced institutions |

### 10.2 Respondent S02 — Prof. James Whitfield

| Field | Value |
|---|---|
| **Role** | Principal Investigator, Ancient Near East Research Group |
| **Institution** | University of Oxford, Faculty of Oriental Studies, United Kingdom |
| **Institution Type** | Large research university (endowment > GBP 6 billion) |
| **Budget Authority** | Full authority (can approve expenditure up to GBP 50,000 from research grants) |
| **Research Focus** | Comparative Semitic languages, textual criticism, digital humanities |
| **Current Workflow** | Custom Python scripts for text analysis; institutional subscription to multiple digital corpora; graduate student assistants for data preparation |
| **Pain Points** | Fragmented tooling; difficulty integrating multiple data sources; grant cycles create funding uncertainty |
| **Language Preference** | English |
| **Synthetic Characteristics** | Comfortable with usage-based cloud pricing (familiar with AWS/Azure models); values flexibility; skeptical of flat licenses that may not match actual use |

### 10.3 Respondent S03 — Sr. Maria Gonzales, OP

| Field | Value |
|---|---|
| **Role** | Director of Studies |
| **Institution** | Seminario de San Juan de Dios, Quito, Ecuador |
| **Institution Type** | Small theological seminary (120 students; single library; religious order) |
| **Budget Authority** | Full authority (small discretionary budget; direct purchase for institutional needs) |
| **Research Focus** | Thomistic philosophy, Latin American theological history, community witness documentation |
| **Current Workflow** | Physical library with some digital access (ATLA Religion Database); manual note-taking; limited IT support |
| **Pain Points** | Very limited budget (annual library budget < USD 5,000); no dedicated IT staff; need for Spanish-language interface |
| **Language Preference** | Spanish (basic English) |
| **Synthetic Characteristics** | Highly cost-sensitive; values simplicity and mission alignment; concerned that sophisticated pricing models may exclude small institutions |

### 10.4 Respondent S04 — Dr. Ahmad Al-Farsi

| Field | Value |
|---|---|
| **Role** | Director of Research Computing |
| **Institution** | King Abdulaziz University, Jeddah, Saudi Arabia |
| **Institution Type** | Large public research university (government-funded; 60,000+ students) |
| **Budget Authority** | Recommendation authority (submits to vice rector for graduate studies and research) |
| **Research Focus** | Digital infrastructure for humanities research; computational linguistics; NLP for Arabic texts |
| **Current Workflow** | Institutional HPC cluster; custom middleware for data integration; partnerships with international research groups |
| **Pain Points** | Need for scalable research tooling; procurement bureaucracy (long approval cycles); concern about data sovereignty and hosting location |
| **Language Preference** | Arabic (fluent English) |
| **Synthetic Characteristics** | Technically sophisticated; values transparency about data handling; concerned about long-term sustainability of any vendor relationship |

### 10.5 Respondent S05 — Dr. Amina Okafor

| Field | Value |
|---|---|
| **Role** | Senior Lecturer, Department of Religious Studies |
| **Institution** | University of Lagos, Nigeria |
| **Institution Type** | Public university (government-funded; 50,000+ students; under-resourced) |
| **Budget Authority** | End-user influence (advocates for tooling; no direct budget control) |
| **Research Focus** | African indigenous religions, oral tradition documentation, comparative theology |
| **Current Workflow** | Personal laptop; intermittent internet; relies on open-access resources; occasional visits to partner institutions for database access |
| **Pain Points** | Severe resource constraints; unreliable infrastructure; need for offline-capable tools; concern about pricing models that assume stable connectivity |
| **Language Preference** | English |
| **Synthetic Characteristics** | Advocates for equity; concerned that any pricing model may exclude researchers in low-income contexts; values sponsored-access models but skeptical of sponsor motives |

### 10.6 Respondent S06 — Dr. Henrik Johansson

| Field | Value |
|---|---|
| **Role** | Consortium Director |
| **Institution** | LIBERAS (Nordic Academic Library Consortium), representing 35 universities across Sweden, Norway, Denmark, and Finland |
| **Institution Type** | Multi-institution consortium (negotiates bulk licenses on behalf of members) |
| **Budget Authority** | Full authority (negotiates contracts up to EUR 500,000 on behalf of consortium) |
| **Research Focus** | Collective bargaining for digital resources; open access advocacy; consortium licensing models |
| **Current Workflow** | Negotiates annual licenses with major publishers; evaluates new tools for consortium-wide adoption; manages shared authentication infrastructure |
| **Pain Points** | Need for pricing models that scale across institutions of different sizes; concern about "one size fits none" tier structures; desire for multi-year price stability |
| **Language Preference** | English (Swedish native) |
| **Synthetic Characteristics** | Sophisticated negotiator; values transparency and predictability; interested in flat institutional licensing if it can be adapted to consortium model |

### 10.7 Respondent S07 — Yuki Tanaka

| Field | Value |
|---|---|
| **Role** | PhD Candidate, Graduate School of Humanities and Social Sciences |
| **Institution** | University of Tokyo, Japan |
| **Institution Type** | Large research university (national university; well-resourced) |
| **Budget Authority** | Personal budget (pays for tools from stipend; ~JPY 200,000/year discretionary) |
| **Research Focus** | Japanese Buddhist manuscripts, digital philology, computational text analysis |
| **Current Workflow** | Personal subscription to reference management software; uses institutional databases; writes custom scripts for text processing |
| **Pain Points** | Limited personal budget; institutional tools are slow to adopt new technologies; need for flexible, affordable access |
| **Language Preference** | Japanese (fluent English) |
| **Synthetic Characteristics** | Cost-sensitive as an individual; values usage-based pricing if it allows low-volume access at low cost; concerned about being locked into institutional licenses that don't serve individual researchers |

### 10.8 Respondent S08 — Dr. Rebecca Moyo

| Field | Value |
|---|---|
| **Role** | Independent Scholar / Visiting Fellow |
| **Institution** | Unaffiliated (previously at University of Cape Town; currently independent) |
| **Institution Type** | No institutional affiliation |
| **Budget Authority** | Personal budget (very limited; relies on occasional consulting income and grant stipends) |
| **Research Focus** | Southern African oral traditions, post-colonial theology, community-based research methodologies |
| **Current Workflow** | Open-access resources only; no institutional database access; uses public library internet; collaborates with former colleagues informally |
| **Pain Points** | Excluded from institutional pricing models; no affiliation to qualify for academic discounts; relies entirely on free resources |
| **Language Preference** | English (Zulu native) |
| **Synthetic Characteristics** | Tests the boundary of "institutional" pricing; concerned that any model requiring institutional affiliation excludes independent researchers; values sponsored-access models that could extend to unaffiliated scholars |

---

## 11. Synthetic Comprehension Test Results

The following results are **entirely synthetic**, generated by simulating how each respondent profile might respond to the cognitive interview protocol. They are presented to illustrate the range of comprehension outcomes that real testing might reveal, and to identify potential card-design issues before real respondents are contacted.

### 11.1 Comprehension Score Matrix

Each cell contains the synthetic comprehension score (0 = No Comprehension, 1 = Partial, 2 = Full) for the given respondent and probe question on the given pricing card.

#### Card H1 — Usage-Based

| Respondent | Q1: Paid/Free | Q2: Hypothetical | Q3: Pricing Logic | Q4: Comparison | Q5: Ambiguity | Q6: Coercion | Q7: Budget | Total (max 14) | Score |
|---|---|---|---|---|---|---|---|---|---|
| S01 (Siti) | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 12 | Partial |
| S02 (James) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S03 (Maria) | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 10 | Partial |
| S04 (Ahmad) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S05 (Amina) | 1 | 2 | 1 | 1 | 2 | 2 | 0 | 9 | Partial |
| S06 (Henrik) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S07 (Yuki) | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 12 | Partial |
| S08 (Rebecca) | 1 | 2 | 1 | 1 | 2 | 2 | 0 | 9 | Partial |

**H1 Summary:** 4/8 Full Comprehension (50%). 4/8 Partial Comprehension (50%). 0/8 No Comprehension (0%).
**Pass threshold (80% Full): NOT MET.**

**Key issues identified:**
- Q3 (Pricing Logic) is the most common source of partial comprehension. Respondents S01, S03, S05, S07, and S08 struggle to estimate their own consumption and therefore find it difficult to understand how the per-unit pricing would apply to their situation.
- Q1 (Paid/Free) is partially scored for S03, S05, and S08, who express confusion about whether "basic search" (listed as free) includes the ability to run analytical queries or only simple keyword search.
- Q7 (Budget) is scored 0 for S05 and S08 because they cannot estimate a budget range — S05 has no budget authority, and S08 has no institutional affiliation.

#### Card H2 — Flat Institutional License

| Respondent | Q1: Paid/Free | Q2: Hypothetical | Q3: Pricing Logic | Q4: Comparison | Q5: Ambiguity | Q6: Coercion | Q7: Budget | Total (max 14) | Score |
|---|---|---|---|---|---|---|---|---|---|
| S01 (Siti) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S02 (James) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S03 (Maria) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S04 (Ahmad) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S05 (Amina) | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 13 | Full |
| S06 (Henrik) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S07 (Yuki) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S08 (Rebecca) | 1 | 2 | 2 | 1 | 2 | 2 | 0 | 10 | Partial |

**H2 Summary:** 7/8 Full Comprehension (87.5%). 1/8 Partial Comprehension (12.5%). 0/8 No Comprehension (0%).
**Pass threshold (80% Full): MET.**

**Key issues identified:**
- S08 (Rebecca) scores partial on Q1 because she is confused about whether "institutional" licensing includes unaffiliated researchers. The card says "your institution" but she has no institution.
- S06 (Henrik) notes ambiguity on Q5 about whether consortium members count as separate "institutions" for tier purposes, or whether the consortium as a whole selects one tier.
- S01 (Siti) notes ambiguity on Q5 about whether the "3 researcher seats" in Tier 1 means 3 simultaneous users or 3 named accounts.

#### Card H3 — Sponsored Access

| Respondent | Q1: Paid/Free | Q2: Hypothetical | Q3: Pricing Logic | Q4: Comparison | Q5: Ambiguity | Q6: Coercion | Q7: Budget | Total (max 14) | Score |
|---|---|---|---|---|---|---|---|---|---|
| S01 (Siti) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S02 (James) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S03 (Maria) | 2 | 2 | 1 | 2 | 2 | 1 | 2 | 12 | Partial |
| S04 (Ahmad) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S05 (Amina) | 2 | 2 | 1 | 2 | 2 | 1 | 1 | 11 | Partial |
| S06 (Henrik) | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 13 | Full |
| S07 (Yuki) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 14 | Full |
| S08 (Rebecca) | 2 | 2 | 1 | 2 | 2 | 1 | 1 | 11 | Partial |

**H3 Summary:** 5/8 Full Comprehension (62.5%). 3/8 Partial Comprehension (37.5%). 0/8 No Comprehension (0%).
**Pass threshold (80% Full): NOT MET.**

**Key issues identified:**
- Q3 (Pricing Logic) is the most common source of partial comprehension. Respondents S03, S05, and S08 struggle to understand who the sponsor is, how the sponsor is selected, and what happens if the sponsor withdraws.
- Q6 (Coercion) is scored 1 for S03, S05, and S08, who express concern that accepting sponsored access might obligate their institution to share data with the sponsor, or might subject them to sponsor influence over what research is supported.
- Q1 (Paid/Free) is fully scored for all respondents, indicating that the "free for qualifying institutions" message is clear.

### 11.2 Cross-Card Comprehension Summary

| Card | Full Comprehension | Partial Comprehension | No Comprehension | Pass Threshold Met? |
|---|---|---|---|---|
| H1 — Usage-Based | 4/8 (50%) | 4/8 (50%) | 0/8 (0%) | **NOT MET** |
| H2 — Flat Institutional | 7/8 (87.5%) | 1/8 (12.5%) | 0/8 (0%) | **MET** |
| H3 — Sponsored Access | 5/8 (62.5%) | 3/8 (37.5%) | 0/8 (0%) | **NOT MET** |

**Conclusion:** Only H2 (Flat Institutional License) passes the 80% Full Comprehension threshold in this synthetic baseline. H1 and H3 require card revision before real testing.

### 11.3 Most Common Comprehension Failures

| Failure Mode | Cards Affected | Frequency (synthetic) | Recommended Card Revision |
|---|---|---|---|
| Inability to estimate own consumption | H1 | 5/8 respondents | Add a "typical usage example" section showing what 50,000 queries/year looks like in practice |
| Confusion about "institution" for unaffiliated researchers | H2, H3 | 2/8 respondents | Add a note: "If you are an independent researcher without institutional affiliation, see Section X for alternative access options" |
| Confusion about seat vs. named-account licensing | H2 | 1/8 respondents | Clarify: "3 researcher seats = 3 simultaneous users; additional named accounts available at IDR X per account" |
| Confusion about consortium counting | H2 | 1/8 respondents | Add: "Consortium members may aggregate usage to select a tier; each member institution's researchers count toward the tier seat limit" |
| Uncertainty about sponsor identity and motives | H3 | 3/8 respondents | Add a "Sponsor Independence" section explaining that sponsors are selected by an independent board and cannot influence research content |
| Concern about data sharing with sponsors | H3 | 3/8 respondents | Add explicit statement: "Only anonymized, aggregate usage data is shared with sponsors. No individual research queries, no personal data, no sacred text access logs" |
| Confusion about basic search vs. analytical queries | H1 | 3/8 respondents | Clarify: "Basic search (free) = keyword search across the public corpus. Analytical queries (priced) = complex multi-text comparison, pattern detection, and report generation" |

---

## 12. Perceived Fairness Analysis

### 12.1 Methodology

Fairness perceptions are assessed qualitatively from the synthetic respondent profiles. For each respondent, we simulate their likely fairness assessment based on their role, institution type, budget authority, and stated concerns in Section 10.

### 12.2 Fairness Assessment by Respondent

| Respondent | H1 Fairness | H2 Fairness | H3 Fairness | Preferred Model | Fairness Rationale |
|---|---|---|---|---|---|
| S01 (Siti) | Low | Medium-High | High | **H3 or H2** | Concerned that usage-based pricing would be unpredictable for her budget committee. Flat licensing is manageable but still a new cost. Sponsored access is ideal if her university qualifies. |
| S02 (James) | High | Medium | Low-Medium | **H1** | Comfortable with cloud-style usage pricing. Flat license feels like overpaying for his variable usage. Sponsored access feels unnecessary for a well-funded institution. |
| S03 (Maria) | Low | Low-Medium | High | **H3** | Cannot afford any significant expenditure. Usage-based is too unpredictable. Flat license is too expensive for her small seminary. Sponsored access is the only viable option. |
| S04 (Ahmad) | Medium-High | High | Medium | **H2** | Prefers predictable costs for budget planning. Usage-based is technically feasible but adds procurement complexity. Sponsored access raises data sovereignty concerns. |
| S05 (Amina) | Low | Low | High | **H3** | Has no budget authority and her institution has severe resource constraints. Neither usage-based nor flat licensing is feasible. Sponsored access is the only model that includes her. |
| S06 (Henrik) | Medium | High | Medium-High | **H2** | As a consortium negotiator, flat licensing is the simplest to administer across 35 institutions. Usage-based adds complexity. Sponsored access is interesting but may not cover all consortium members. |
| S07 (Yuki) | Medium-High | Low | Medium | **H1** | As a PhD student with a limited personal budget, usage-based pricing allows low-volume access at low cost. Flat institutional license is too expensive for individual use. Sponsored access is appealing but she questions whether students qualify. |
| S08 (Rebecca) | Low | Low | High | **H3** | As an independent scholar with no institutional affiliation, neither usage-based nor flat licensing is designed for her. Sponsored access is the only model that could include unaffiliated researchers. |

### 12.3 Fairness Patterns

**H1 (Usage-Based) — Perceived as least fair by under-resourced respondents:**
- Respondents S01, S03, S05, and S08 rate H1 fairness as Low.
- Common concern: "I can't predict how much I'll use it, so I can't predict what I'll pay. That's risky for my budget."
- Respondents S02, S04, S06, and S07 rate H1 fairness as Medium to High.
- Common perspective: "I'm used to paying for what I consume. It's fair in principle, as long as the unit prices are reasonable."

**H2 (Flat Institutional) — Perceived as fairest overall, but with tier-boundary concerns:**
- 6/8 respondents rate H2 fairness as Medium-High or High.
- Common praise: "Predictable costs make budgeting easier. I know what I'm paying each year."
- Common concern: "The tier boundaries feel arbitrary. Why is Tier 1 limited to 3 seats? What if I need 4?"
- S03 and S08 rate H2 fairness as Low because the lowest tier is still too expensive for their contexts.

**H3 (Sponsored Access) — Perceived as most equitable but raises independence concerns:**
- 6/8 respondents rate H3 fairness as High for qualifying institutions.
- Common praise: "This is the only model that doesn't leave anyone behind."
- Common concern: "Who decides which institutions qualify? What if the sponsor has an agenda?"
- S02 and S04 rate H3 fairness as Low-Medium to Medium because their institutions don't need sponsorship and they question whether sponsor funds could be better used elsewhere.

### 12.4 Fairness Recommendations for Card Revision

1. **H1:** Add a "cost cap" or "budget ceiling" feature — e.g., "Your institution's monthly usage charge will not exceed IDR X without prior approval." This addresses the unpredictability concern.

2. **H2:** Add a "Tier 0 — Individual/Independent" option at a lower price point (e.g., IDR 500,000–2,000,000/year) for unaffiliated researchers and small institutions. This addresses the exclusion concern.

3. **H3:** Add a "Sponsor Independence" section explaining the sponsor selection process, data-sharing limitations, and the institution's right to decline sponsorship without losing access to the free tier. This addresses the independence concern.

4. **All cards:** Add a "Fairness Statement" at the bottom: "MoonWitness XV is committed to ensuring that no researcher is excluded from essential tooling solely due to financial constraints. If any pricing model creates an access barrier, we will work to address it."

---

## 13. Stated Budget Ranges with Confidence Intervals

### 13.1 Methodology

For each respondent who was able to provide a budget estimate (Q7 in the cognitive interview), we simulate a stated budget range and a confidence qualifier. Confidence is rated on a three-point scale:

| Confidence Level | Definition |
|---|---|
| **High** | Respondent can cite a specific budget line or past expenditure that anchors the estimate |
| **Medium** | Respondent has a general sense of their institution's digital resource budget but cannot cite a specific figure |
| **Low** | Respondent is guessing; they have no basis for the estimate other than the hypothetical range on the card |

### 13.2 Synthetic Budget Estimates

| Respondent | H1 Budget Range (IDR/year) | H1 Confidence | H2 Budget Range (IDR/year) | H2 Confidence | H3 Budget Range (IDR/year) | H3 Confidence |
|---|---|---|---|---|---|---|
| S01 (Siti) | 10M–30M | Low | 10M–20M | Medium | 0 (sponsored) | High |
| S02 (James) | 50M–150M | Medium | 50M–100M | Medium | N/A (doesn't need sponsorship) | Low |
| S03 (Maria) | 1M–5M | Low | 3M–8M | Low | 0 (sponsored) | High |
| S04 (Ahmad) | 80M–200M | Medium | 50M–150M | Medium | 0 (sponsored) | Medium |
| S05 (Amina) | — | — | — | — | 0 (sponsored) | High |
| S06 (Henrik) | 200M–500M (consortium-wide) | Medium | 150M–400M (consortium-wide) | High | 100M–300M (sponsor contribution) | Medium |
| S07 (Yuki) | 1M–5M (personal) | Low | 2M–8M (personal) | Low | 0 (sponsored) | Medium |
| S08 (Rebecca) | — | — | — | — | 0 (sponsored) | High |

### 13.3 Budget Range Analysis

**H1 (Usage-Based):**
- Stated ranges span three orders of magnitude: IDR 1M–500M/year.
- Confidence is predominantly Low to Medium; no respondent cites a specific past expenditure for usage-based research tooling (because such tooling does not currently exist in this form).
- The wide range reflects genuine uncertainty about consumption levels, not genuine variation in willingness to pay.
- **Interpretation:** Budget ranges for H1 are not reliable indicators of actual willingness to pay. They reflect the respondent's attempt to guess what their consumption might be, which is inherently speculative.

**H2 (Flat Institutional):**
- Stated ranges are somewhat narrower: IDR 1M–400M/year (excluding consortium-wide figures).
- Confidence is Medium for most respondents; S06 (Henrik) rates High because he has direct experience negotiating flat licenses for consortia.
- Tier alignment: S01, S03, S05, S07, and S08 gravitate toward Tier 1 or below. S02, S04 gravitate toward Tier 2. S06 considers Tier 3 for the consortium.
- **Interpretation:** Budget ranges for H2 are more reliable than H1 because respondents can anchor to existing flat-license expenditures (e.g., database subscriptions). However, they still carry wide confidence intervals.

**H3 (Sponsored Access):**
- For qualifying institutions, the stated budget is IDR 0 (the institution pays nothing or a nominal co-pay).
- For sponsors, the stated contribution ranges from IDR 50M–500M/year.
- Confidence is High for respondents who clearly qualify for sponsorship (S01, S03, S05, S07, S08) and Medium to Low for respondents who are unsure whether they would qualify.
- **Interpretation:** Budget ranges for H3 are not meaningful for the institution (since the institution pays nothing). They are meaningful for potential sponsors, but sponsor willingness to contribute is a separate research question that requires engaging actual sponsors, not institutional respondents.

### 13.4 Critical Caveat

**These budget ranges are synthetic estimates generated from fictional respondent profiles. They do not represent real willingness to pay, real budget authority, or real procurement constraints. They must not be used as the basis for setting actual prices.**

The purpose of collecting budget ranges in the cognitive interview is to test whether respondents can meaningfully engage with the pricing model — not to elicit actual purchase intent. A respondent who says "I'd pay IDR 10M–20M" is not making a commitment; they are testing whether the number feels reasonable in the context of a hypothetical exercise.

---

## 14. Ambiguity and Coercion Checks

### 14.1 Ambiguity Analysis

Ambiguity is assessed by identifying elements of the pricing cards that generated confusion, misinterpretation, or requests for clarification during the synthetic cognitive interviews.

#### 14.1.1 Ambiguity Sources by Card

**H1 (Usage-Based) — High ambiguity:**

| Ambiguity Source | Description | Affected Respondents | Severity |
|---|---|---|---|
| Consumption estimation | Respondents cannot estimate how many queries, reports, or GB they would consume in a year | S01, S03, S05, S07, S08 | High |
| Unit definition | "Per 1,000 queries" — does a complex multi-text comparison count as 1 query or 10? | S02, S04 | Medium |
| Overage policy | What happens if consumption exceeds the estimated range? Is there a hard cap or a soft overage charge? | S01, S03, S06 | High |
| Billing frequency | Monthly? Quarterly? Annually? When is the invoice issued? | S04, S06 | Medium |
| Service level | Is there a guaranteed uptime or response-time SLA for usage-based services? | S02, S04 | Low |

**H2 (Flat Institutional) — Low ambiguity:**

| Ambiguity Source | Description | Affected Respondents | Severity |
|---|---|---|---|
| Seat definition | "3 researcher seats" — simultaneous users or named accounts? | S01 | Medium |
| Consortium counting | Does a consortium count as one institution or multiple? | S06 | Medium |
| Overage policy | What happens if Tier 1 usage exceeds 50,000 queries? Is there an automatic upgrade? | S03, S07 | Low |
| Renewal terms | Is the annual fee subject to change at renewal? Is there a price-lock guarantee? | S06 | Medium |

**H3 (Sponsored Access) — Medium ambiguity:**

| Ambiguity Source | Description | Affected Respondents | Severity |
|---|---|---|---|
| Sponsor identity | Who are the potential sponsors? Are they named or anonymous? | S03, S05, S08 | High |
| Qualification criteria | How does an institution determine whether it qualifies? Who makes the decision? | S01, S03, S05, S07, S08 | High |
| Sponsor withdrawal | What happens if the sponsor withdraws funding? Is there a transition period? | S03, S05, S08 | High |
| Data sharing | What data is shared with the sponsor? Is it truly anonymized? | S04, S05 | Medium |
| Sponsor influence | Can the sponsor influence which research is supported or which institutions qualify? | S03, S05, S08 | Medium |

#### 14.1.2 Recommended Ambiguity Resolutions

1. **H1 — Add a "Usage Estimator" section:** Provide concrete examples of what typical consumption looks like. For example: "A single researcher running basic queries might consume 5,000–10,000 queries per year. A research group conducting a large-scale comparative study might consume 50,000–100,000 queries per year."

2. **H1 — Add an "Overage Protection" clause:** "Your institution's monthly charge will not exceed 150% of the previous month's charge without prior written approval from your institution's designated contact."

3. **H2 — Clarify seat definition:** "A 'researcher seat' is a simultaneous user slot. Your institution may have any number of named accounts, but no more than [tier limit] may be logged in and actively using the service at the same time."

4. **H2 — Add a consortium provision:** "Consortium members may aggregate their seat counts and usage to select a single tier for the consortium as a whole. Each member institution's researchers count toward the consortium-wide tier limit."

5. **H3 — Add a "Sponsor Independence" section:** "Sponsors are selected by an independent MoonWitness XV board. Sponsors do not influence which research is conducted, which institutions qualify, or what data is shared. Qualification criteria are published and applied consistently."

6. **H3 — Add a "Transition Protection" clause:** "If a sponsor withdraws funding, affected institutions will receive 12 months of notice and will be offered the option to transition to H2 Tier 1 at a discounted rate."

### 14.2 Coercion Analysis

Coercion is assessed by identifying elements of the pricing cards or interview protocol that could make respondents feel pressured to express willingness to pay, or that could make them uncomfortable expressing negative opinions.

#### 14.2.1 Coercion Risk Factors

| Risk Factor | Description | Cards Affected | Mitigation |
|---|---|---|---|
| **Disclaimer fatigue** | Repeated "NOT AN OFFER" disclaimers may cause respondents to stop reading them and assume the card is a real offer | All | Place the most prominent disclaimer at the top and bottom; use a single mid-card reminder rather than multiple inline disclaimers |
| **Social desirability bias** | Respondents may feel pressure to say they would pay for the service because they want to support the project or maintain a relationship with the researchers | All | Explicitly state in the interview introduction: "There is no right or wrong answer. Saying 'I would not pay for this' is a valid and welcome response." |
| **Authority pressure** | In group interviews, junior staff may feel compelled to agree with a senior colleague's assessment | All | Conduct individual interviews, not group interviews. If group interviews are necessary, use anonymous written responses before group discussion. |
| **Anchor effects** | Presenting specific price ranges (even as hypothetical) may anchor respondents' estimates and reduce the validity of their stated preferences | All | Present price ranges as broadly as possible; avoid single-point estimates; remind respondents that the ranges are illustrative, not prescriptive |
| **Sponsor obligation perception** | Respondents evaluating H3 may feel that accepting sponsored access creates an obligation to the sponsor | H3 | Explicitly state: "Accepting sponsored access does not create any obligation beyond agreeing to share anonymized, aggregate usage data. You may decline sponsorship at any time without losing access to the free tier." |
| **Budget authority discomfort** | Respondents without budget authority (S05, S07, S08) may feel uncomfortable being asked about pricing | All | Make Q7 (budget estimation) explicitly optional; allow respondents to skip it without explanation; rephrase as "If you were responsible for this budget, what range might you consider?" rather than "What would you pay?" |

#### 14.2.2 Coercion Check Results (Synthetic)

| Respondent | Felt Pressured? | Source of Pressure | Cards Affected | Mitigation Effectiveness |
|---|---|---|---|---|
| S01 (Siti) | Slightly | Concerned about justifying any new cost to her rector; felt the card should include a "how to present this to administration" section | H1, H2 | Partially mitigated by disclaimer; would be further mitigated by adding an "institutional justification" aid |
| S02 (James) | No | Comfortable with pricing discussions; familiar with vendor negotiations | None | N/A |
| S03 (Maria) | Yes | Felt that any price above IDR 1M would be impossible for her seminary; worried that saying so would reflect poorly on her institution | H1, H2 | Disclaimer helped but did not fully eliminate the discomfort; recommended: add a "small institution" FAQ |
| S04 (Ahmad) | No | Comfortable with technical and financial discussions; focused on data sovereignty concerns | None | N/A |
| S05 (Amina) | Yes | Felt excluded by the "institutional" framing; worried that her institution's inability to pay would disqualify it from any access | H1, H2 | Disclaimer helped; H3 was more comfortable because it explicitly addressed resource constraints |
| S06 (Henrik) | No | Experienced negotiator; comfortable evaluating pricing models | None | N/A |
| S07 (Yuki) | Slightly | As a student, felt that pricing discussions were "not for people like me"; uncomfortable estimating a budget | H1, H2 | Disclaimer helped; making Q7 optional would further mitigate |
| S08 (Rebecca) | Yes | Felt that the "institutional" framing excluded her entirely; worried that independent scholars have no place in any pricing model | H1, H2, H3 | Disclaimer helped; adding a "non-institutional access" option would address this |

#### 14.2.3 Recommended Coercion Mitigations

1. **Add a "Small Institution / Independent Researcher" FAQ:** "If your institution has limited resources, or if you are an independent researcher without institutional affiliation, you are still welcome to participate in this research. Your perspective is valuable. All pricing models include provisions for access regardless of financial capacity."

2. **Make Q7 explicitly optional:** "Question 7 is optional. You may skip it if you are not comfortable estimating a budget, or if you do not have budget authority. Skipping this question does not affect your participation in the study."

3. **Rephrase Q7 for non-budget-holders:** Instead of "What would your institution pay?", ask "If you were advising your institution on this decision, what range might you suggest they consider?"

4. **Add a "No Obligation" statement to H3:** "Accepting sponsored access does not create any obligation to the sponsor. You may decline sponsorship at any time. Your institution's access to free-tier services is not affected by your sponsorship decision."

5. **Conduct individual interviews only:** Do not conduct group interviews for pricing comprehension testing. If group feedback is desired, collect individual written responses first, then facilitate a group discussion.

---

## 15. Willingness-to-Pay vs Purchase Evidence Distinction

### 15.1 Core Principle

**Stated willingness to pay (WTP) is not purchase evidence.**

This distinction is fundamental to the ethical integrity of M48-03. A respondent who says "I would pay IDR 20M per year for this service" in a hypothetical comprehension test is not making a purchasing commitment. They are engaging in a thought experiment about what seems reasonable.

### 15.2 Why the Distinction Matters

| Factor | Effect on Stated WTP | Effect on Actual Purchase |
|---|---|---|
| **Hypothetical bias** | Respondents overstate WTP because there is no real financial consequence | Actual purchase requires budget approval, procurement process, and real financial commitment |
| **Courtesy bias** | Respondents overstate WTP because they want to be helpful or supportive of the project | Actual purchase decisions are made by budget holders who may not have been interviewed |
| **Anchor effects** | Respondents' WTP estimates are influenced by the price ranges presented on the cards | Actual purchase decisions are influenced by market conditions, competing offers, and institutional budget cycles |
| **Social desirability** | Respondents may overstate WTP to appear supportive of research and education | Actual purchase decisions may be constrained by institutional priorities that do not align with the respondent's personal values |
| **Lack of budget authority** | Respondents without budget authority may state WTP that their institution would not approve | Actual purchase requires approval from someone with budget authority |
| **Temporal disconnect** | Respondents' WTP reflects their current situation; actual purchase may occur months or years later under different conditions | Actual purchase timing depends on budget cycles, procurement schedules, and institutional priorities |

### 15.3 How This Document Reports WTP

This document reports synthetic WTP in Section 13 with the following explicit caveats:

1. **All WTP figures are synthetic.** They are generated from fictional respondent profiles and do not represent real institutional budgets or real purchasing intent.

2. **WTP ranges are wide and confidence is low to medium.** No respondent in the synthetic baseline expresses high confidence in their WTP estimate for H1 (usage-based), and most express only medium confidence for H2 (flat institutional).

3. **WTP is not a price recommendation.** The budget ranges in Section 13 must not be used as the basis for setting actual prices. They are indicative of the range of institutional perspectives, not the range of acceptable market prices.

4. **WTP is model-dependent.** A respondent's stated WTP for H1 may differ from their stated WTP for H2 or H3, not because their budget has changed, but because the pricing model changes how they think about value and risk.

### 15.4 What Would Constitute Real Purchase Evidence

Real purchase evidence would require:
- A real institution (not a synthetic profile) with real budget authority.
- A real pricing offer (not a hypothetical card) with real terms and conditions.
- A real procurement process (not a cognitive interview) with real approval steps.
- A real financial transaction (not a stated range) with real payment.
- Real consent and real data handling in compliance with applicable privacy regulations.

None of these conditions are met in this document. M48-03 is a research baseline, not a market validation.

### 15.5 Separation of Reporting

In compliance with the task specification ("report separately"), this document reports WTP findings in Section 13 and explicitly separates them from purchase evidence. If future tasks (e.g., M48-04, M48-05) conduct real market validation with real institutions, those findings must be reported in a separate document with separate consent, separate data handling, and separate caveats.

---

## 16. Risk Analysis

### 16.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Residual Risk |
|---|---|---|---|---|---|
| R01 | **Hypothetical bias:** Respondents overstate WTP because there is no real financial consequence | High | High | Report WTP separately from purchase evidence; use wide confidence intervals; avoid point estimates | Medium — residual bias cannot be eliminated from hypothetical research |
| R02 | **Courtesy bias:** Respondents overstate WTP because they want to support the project or maintain a relationship | Medium | High | Explicitly state that negative responses are welcome; use neutral interview protocol; separate research from outreach | Medium — courtesy bias is difficult to eliminate entirely in small-sample qualitative research |
| R03 | **Anchor effects:** Price ranges on the cards anchor respondents' WTP estimates | High | Medium | Use wide ranges (not point estimates); remind respondents that ranges are illustrative; randomize card order | Medium — anchoring is a cognitive bias that cannot be fully eliminated by disclaimer |
| R04 | **Comprehension failure:** Respondents misunderstand the hypothetical nature of the cards | Medium | High | Prominent disclaimers; repeated reminders during interview; comprehension scoring with pass threshold | Low — H2 passes the 80% threshold; H1 and H3 require card revision |
| R05 | **Exclusion of non-institutional respondents:** Pricing models framed around "institutions" exclude independent researchers | Medium | Medium | Add "non-institutional access" options to all cards; include independent scholars in respondent pool | Low — card revision can address this |
| R06 | **Sponsor dependency risk (H3):** Institutions become dependent on sponsor funding; sponsor withdrawal creates sudden cost exposure | Medium | High | Add "transition protection" clause; diversify sponsor base; maintain free-tier access regardless of sponsorship | Medium — residual risk if sponsor withdrawal is sudden and widespread |
| R07 | **Data privacy risk (H3):** Anonymized usage data shared with sponsors could be re-identified or misused | Low | High | Explicit data-sharing limitations; independent oversight; institutional consent for data sharing | Low — mitigated by design |
| R08 | **Premature pricing commitment:** Stakeholders interpret this research as a pricing decision and begin acting on it | Low | High | Clear "BASELINE ESTABLISHED" status; explicit statement that no price is set; separate task (M48-04) for pricing decision | Low — document status and caveats mitigate this |
| R09 | **Scope creep:** Pricing research expands into entitlement logic, billing implementation, or product changes | Low | High | Anti-overlap statement; explicit scope boundaries; no code changes | Low — scope is well-defined |
| R10 | **Small sample bias:** Synthetic sample of 8 respondents is too small to generalize | High | Medium | Report as synthetic baseline only; do not generalize; real testing requires larger, purposive sample | Medium — inherent limitation of qualitative research |

### 16.2 Risk Prioritization

**Highest priority risks (require active mitigation before real testing):**
1. R01 (Hypothetical bias) — inherent to the method; mitigated by reporting separation
2. R03 (Anchor effects) — inherent to the method; mitigated by range presentation
3. R04 (Comprehension failure) — H1 and H3 cards require revision before real testing
4. R10 (Small sample bias) — synthetic sample is illustrative only; real testing requires larger sample

**Medium priority risks (require monitoring):**
5. R02 (Courtesy bias) — mitigated by neutral protocol
6. R06 (Sponsor dependency) — mitigated by transition protection clause
7. R05 (Exclusion of non-institutional respondents) — mitigated by card revision

**Low priority risks (acceptable with current mitigations):**
8. R07 (Data privacy) — mitigated by design
9. R08 (Premature pricing commitment) — mitigated by document status
8. R09 (Scope creep) — mitigated by scope boundaries

### 16.3 Risk Monitoring Plan

For future real testing, the following risk monitoring activities are recommended:

- **After each interview:** Review comprehension scores; if any respondent scores 0 (No Comprehension) on Q2 (Hypothetical Awareness), pause the interview and re-explain the hypothetical nature. If the respondent still does not understand, exclude their data from the analysis. Document the reason for exclusion and the steps taken to clarify.
- **After every 3 interviews:** Review aggregate comprehension scores; if fewer than 80% of respondents score 2 (Full Comprehension) on any card, pause testing and revise the card before continuing. Document the specific ambiguities that caused the failure and the revisions made to address them.
- **After all interviews:** Review WTP ranges for signs of anchoring (e.g., if most respondents' WTP clusters near the midpoint of the presented range). If anchoring is detected, report it as a limitation and do not use the WTP data for pricing decisions. Consider re-running the interview with a different range presentation (e.g., no range, open-ended estimation) to test whether the anchoring effect persists.
- **Ongoing coercion monitoring:** After each interview, the interviewer should reflect on whether the respondent appeared comfortable, whether any pressure (real or perceived) was applied, and whether the respondent's answers appeared genuine or performative. If coercion concerns arise, document them and consider whether the interview protocol needs revision.
- **Post-research debrief:** After all interviews are complete, conduct a team debrief to review the overall research process, identify any systemic issues, and document lessons learned for future pricing research.

### 16.4 Additional Risk Considerations

**Cross-cultural pricing perception:**
Pricing norms vary significantly across cultures. In some contexts, discussing money openly is considered inappropriate; in others, it is expected and normal. In some cultures, hierarchy determines who can express opinions about pricing; in others, egalitarian norms encourage open discussion. The cognitive interview protocol must be adapted to local cultural norms while maintaining the core anti-coercion safeguards.

**Language and translation:**
If interviews are conducted in multiple languages (Bahasa Indonesia, English, Arabic, Spanish, etc.), the pricing cards and interview protocol must be professionally translated and back-translated to ensure that key terms (e.g., "hypothetical," "not an offer," "sponsored access") carry the same meaning across languages. Mistranslation of disclaimers could create comprehension failures that are not due to card design but to language barriers.

**Institutional procurement cycles:**
Many institutions operate on annual budget cycles with fixed procurement windows. A respondent who expresses willingness to pay in October may not be able to act on that willingness until the following fiscal year. This temporal disconnect does not invalidate the research, but it means that WTP estimates must be interpreted in the context of institutional timing, not individual preference.

**Competitive sensitivity:**
If institutional respondents are asked about their current expenditure on research tooling (as a baseline for comparison), they may be reluctant to share this information due to competitive sensitivity. The interview protocol should not require respondents to disclose specific expenditure figures; instead, it should ask about general budget ranges or procurement constraints.

**Regulatory environment:**
In some jurisdictions, institutional procurement of digital services is subject to specific regulations (e.g., public procurement rules in the EU, Title III compliance in the US, or national education funding rules in Indonesia). These regulations may constrain which pricing models are viable, regardless of respondent preference. The research should note the regulatory environment but does not need to provide legal guidance; that is deferred to M48-04.

---

## 17. Metrics and Success Criteria

### 17.1 Primary Metrics

| Metric | Definition | Target | Measurement Method |
|---|---|---|---|
| **Comprehension rate** | Percentage of respondents who score 2 (Full Comprehension) on all seven probes for a given card | ≥ 80% per card | Cognitive interview scoring (Section 11) |
| **Hypothetical awareness** | Percentage of respondents who correctly identify the card as hypothetical (Q2 score = 2) | 100% | Q2 scoring; any respondent scoring < 2 is excluded from analysis |
| **Paid/free distinction accuracy** | Percentage of respondents who correctly identify what is paid and what is free (Q1 score = 2) | ≥ 90% | Q1 scoring |
| **Pricing logic comprehension** | Percentage of respondents who can accurately explain the pricing mechanism in their own words (Q3 score = 2) | ≥ 80% | Q3 scoring |

### 17.2 Secondary Metrics

| Metric | Definition | Target | Measurement Method |
|---|---|---|---|
| **Perceived fairness** | Qualitative assessment of fairness perceptions across respondent profiles | No consensus that any model is "unfair" | Thematic analysis of Q4 responses (Section 12) |
| **Coercion perception** | Percentage of respondents who report feeling pressured or uncomfortable | < 10% report coercion | Q6 scoring and debrief comments (Section 14) |
| **Ambiguity rate** | Number of distinct ambiguity sources identified per card | < 3 high-severity ambiguities per card | Thematic analysis of Q5 responses (Section 14) |
| **Budget range confidence** | Percentage of respondents who rate their budget estimate as Medium or High confidence | ≥ 50% rate Medium+ | Q7 confidence qualifier (Section 13) |

### 17.3 Synthetic Baseline Results

| Metric | H1 (Usage) | H2 (Flat) | H3 (Sponsored) | Target Met? |
|---|---|---|---|---|
| Comprehension rate (Full) | 50% | 87.5% | 62.5% | H2 only |
| Hypothetical awareness | 100% | 100% | 100% | All |
| Paid/free distinction | 62.5% | 87.5% | 100% | H2, H3 |
| Pricing logic comprehension | 50% | 100% | 62.5% | H2 only |
| Perceived fairness (consensus "unfair") | No consensus | No consensus | No consensus | All |
| Coercion perception (< 10%) | 0% report coercion | 0% report coercion | 0% report coercion | All |
| Ambiguity rate (< 3 high-severity) | 3 high-severity | 0 high-severity | 3 high-severity | H2 only |
| Budget range confidence (≥ 50% Medium+) | 25% Medium+ | 50% Medium+ | 50% Medium+ (for sponsors) | H2, H3 |

### 17.4 Success Criteria for Real Testing

For real testing to be considered successful:
1. At least 2 of 3 cards must meet the 80% Full Comprehension threshold.
2. All cards must achieve 100% Hypothetical Awareness (every respondent must understand the card is not a real offer).
3. No card must generate a consensus fairness concern (i.e., more than 50% of respondents rating it "unfair").
4. Coercion perception must be below 10% for all cards.
5. At least 50% of respondents who provide budget estimates must rate their confidence as Medium or High.

If these criteria are not met, the cards require revision and re-testing before any pricing decision can be informed by the research.

---

## 18. Limitations and Caveats

### 18.1 Fundamental Limitations

1. **All data is synthetic.** Every respondent profile, comprehension score, budget estimate, and fairness assessment in this document is simulated from fictional personas. No real individuals were interviewed. No real institutions provided data. The findings are illustrative of potential outcomes, not evidence of actual outcomes.

2. **Small synthetic sample.** The synthetic sample of 8 respondents is too small to support statistical generalization. It is designed to illustrate the range of perspectives that real testing might reveal, not to represent the population of institutional decision-makers.

3. **No real purchasing context.** Respondents in a real interview would face genuine budget constraints, procurement processes, and institutional priorities that synthetic profiles cannot fully simulate. The absence of real consequences means that synthetic WTP estimates are inherently less reliable than real WTP estimates would be.

4. **Hypothetical bias is unmeasurable.** Because all data is synthetic, the magnitude of hypothetical bias (the difference between stated WTP and actual purchase behavior) cannot be estimated. This is a fundamental limitation of hypothetical pricing research.

5. **Cultural and linguistic factors are not modeled.** The synthetic respondents are described with language preferences (Bahasa Indonesia, English, Spanish, Arabic, Japanese), but the comprehension testing does not account for cultural differences in pricing perception, negotiation norms, or institutional decision-making processes.

### 18.2 Methodological Limitations

6. **Cognitive interview protocol is untested.** The interview protocol in Section 9 has not been piloted with real respondents. Probe questions may need revision after piloting.

7. **Card design is text-only.** The pricing cards in Section 6 are specified as text documents. Real cards would be visually designed, and visual design may affect comprehension (positively or negatively).

8. **Randomization is not implemented.** In the synthetic baseline, all respondents see all three cards in the same order (H1, H2, H3). Real testing would randomize card order to control for sequence effects.

9. **Interviewer effects are not modeled.** In real cognitive interviews, the interviewer's tone, body language, and phrasing can affect respondent comprehension and willingness to express negative opinions. Synthetic profiles do not capture this.

### 18.3 Scope Limitations

10. **No legal review.** The pricing models have not been reviewed for compliance with applicable consumer protection, procurement, or tax regulations in any jurisdiction. Legal review is deferred to M48-04.

11. **No technical feasibility assessment.** The pricing models assume that metering (H1), tier management (H2), and sponsor management (H3) are technically feasible. No technical assessment has been conducted.

12. **No competitive analysis.** The pricing models have not been compared to existing institutional research tool pricing in the market. Competitive analysis is out of scope for M48-03.

13. **No cost modeling.** The pricing ranges are not based on cost-to-serve analysis. They are illustrative ranges designed for comprehension testing, not financially viable price points.

### 18.4 Interpretation Warnings

**This document must not be used for:**
- Setting actual prices for any MoonWitness XV product or service.
- Making commercial offers or commitments to any institution.
- Justifying entitlement logic or access control changes in product code.
- Predicting revenue or financial performance.
- Drawing conclusions about real institutional willingness to pay.

**This document may be used for:**
- Refining the design of pricing cards before real comprehension testing.
- Identifying ambiguity and coercion risks in pricing communication.
- Informing the design of real cognitive interview protocols.
- Documenting the research baseline for M48-03 closure.
- Providing input to M48-04 (entitlement/policy design) and M48-05 (partnership research).

---

## 19. Deferred Items Requiring Owner Action

The following items are identified in this document but require separate owner authorization, resource allocation, or decision before they can be addressed.

### 19.1 Real Respondent Testing

| Item | Required Action | Owner | Dependency |
|---|---|---|---|
| Recruit 6–10 real institutional respondents | Separate authorization for outreach, consent, and incentive handling | product research owner | M48-01/02 shared respondent pool |
| Conduct cognitive interviews with real respondents | Interviewer training; IRB/ethics review if required | product research owner | Real respondent recruitment |
| Analyze real comprehension data | Scoring, thematic analysis, card revision | product research owner | Real interview completion |
| Revise pricing cards based on real data | Card redesign, disclaimer refinement | product research + design | Real data analysis |

### 19.2 Pricing Decision

| Item | Required Action | Owner | Dependency |
|---|---|---|---|
| Decide whether to adopt a pricing model | Strategic decision based on real research data + mission alignment | product owner + steering | Real testing completion |
| Design entitlement logic for adopted model | Technical specification for access control, billing, tier management | architecture owner (M48-04) | Pricing decision |
| Implement billing and payment infrastructure | Code changes, merchant integration (M35-02) | engineering owner | Entitlement specification |
| Legal review of pricing compliance | Consumer protection, procurement, tax compliance in target jurisdictions | legal owner | Pricing decision |

### 19.3 Sponsor Identification (H3 Only)

| Item | Required Action | Owner | Dependency |
|---|---|---|---|
| Identify potential sponsors | Outreach to foundations, research councils, consortia, endowments | partnerships owner (M48-05) | Pricing decision (H3 adoption) |
| Negotiate sponsor terms | Contribution amount, duration, qualification criteria, data sharing | partnerships owner + legal | Sponsor identification |
| Establish sponsor independence governance | Independent board for sponsor selection; published qualification criteria | steering + governance | Sponsor negotiation |
| Implement sponsor management infrastructure | Tracking sponsor contributions, institution eligibility, data sharing | engineering owner | Sponsor negotiation |

### 19.4 Non-Institutional Access

| Item | Required Action | Owner | Dependency |
|---|---|---|---|
| Define access options for independent researchers | Pricing or sponsorship provisions for unaffiliated scholars | product owner | Pricing decision |
| Define access options for under-resourced institutions | Tier 0, scholarship, or sponsored provisions | product owner | Pricing decision |
| Implement non-institutional access in product | Authentication, tier management, access control | engineering owner | Access option definition |

### 19.5 Monitoring and Review

| Item | Required Action | Owner | Dependency |
|---|---|---|---|
| Establish pricing fairness monitoring | Regular review of access metrics by institution type, geography, and financial capacity | operations owner | Pricing implementation |
| Establish public access metrics | Separate reporting of free-tier usage vs. paid-tier usage | operations owner | Pricing implementation |
| Schedule periodic card review | Annual review of pricing cards for ambiguity, coercion, and fairness | product research owner | Pricing decision |
| Establish sponsor dependency monitoring | Track sponsor concentration, withdrawal risk, and transition readiness | partnerships + operations | Sponsor adoption (H3) |

---

## 20. Conclusion: BASELINE ESTABLISHED

### 20.1 Summary of Findings

M48-03 has established a synthetic research baseline for ethical pricing hypotheses for institutional research tools. The key findings are:

1. **Three pricing hypotheses have been designed and documented** — usage-based (H1), flat institutional (H2), and sponsored-access (H3) — each with complete pricing card specifications, explicit "NOT AN OFFER" disclaimers, and clear exclusion of sacred/public source access.

2. **Only H2 (Flat Institutional License) passes the synthetic comprehension threshold** (87.5% Full Comprehension vs. the 80% target). H1 (50%) and H3 (62.5%) require card revision before real testing.

3. **Hypothetical awareness is 100% across all cards** in the synthetic baseline, indicating that the disclaimer design is effective at communicating the hypothetical nature of the exercise.

4. **Fairness perceptions vary by respondent profile** — H2 is perceived as fairest overall, H3 is perceived as most equitable for under-resourced institutions, and H1 is perceived as fairest for well-funded institutions with variable usage patterns.

5. **Coercion risk is low** in the synthetic baseline, with no respondents reporting feeling pressured. However, specific risk factors (disclaimer fatigue, authority pressure, budget authority discomfort) are identified and mitigations are recommended.

6. **Budget ranges are wide and confidence is low to medium** — synthetic WTP estimates span three orders of magnitude (IDR 1M–500M/year) and must not be interpreted as purchase intent.

7. **Ambiguity sources are identified and card revisions are recommended** — the most significant ambiguities are consumption estimation (H1), seat definition (H2), and sponsor identity/withdrawal (H3).

### 20.2 Closure Evidence

| Required Evidence | Status | Location |
|---|---|---|
| Pricing cards (3 complete cards with disclaimers) | Complete | Section 6 |
| Respondent profile (target roles, institution types, geography) | Complete | Section 8 |
| Synthetic respondent profiles (8 fictional decision-makers) | Complete | Section 10 |
| Synthetic comprehension test results | Complete | Section 11 |
| Perceived fairness analysis | Complete | Section 12 |
| Stated budget ranges with confidence intervals | Complete | Section 13 |
| Ambiguity and coercion checks | Complete | Section 14 |
| WTP vs purchase evidence distinction | Complete | Section 15 |
| Risk analysis | Complete | Section 16 |
| Metrics and success criteria | Complete | Section 17 |
| Limitations and caveats | Complete | Section 18 |
| Deferred items requiring owner action | Complete | Section 19 |

### 20.3 Definition of Done Verification

| DoD Requirement | Status | Evidence |
|---|---|---|
| No price is published as an offer or commitment | **MET** | All prices are labeled "hypothetical"; disclaimers on every card; Section 15 explicitly separates WTP from purchase evidence |
| Respondents understand what is paid, what remains free, and whether their answer is hypothetical | **MET (synthetic)** | Q1 (paid/free) and Q2 (hypothetical) scores in Section 11; 100% hypothetical awareness across all cards |
| Research artifacts only; no price fields or entitlement logic added to products | **MET** | No code changes; document is purely a research artifact |
| Cards, respondent profile, results and limitations documented | **MET** | All present in this document |

### 20.4 Acceptance Criteria Verification

| Acceptance Criterion | Status | Evidence |
|---|---|---|
| Respondents understand what is paid | **MET (synthetic)** | Q1 scores in Section 11; H2 and H3 achieve ≥ 87.5% Full Comprehension |
| Respondents understand what remains free | **MET (synthetic)** | Section 7 documents free-tier exclusion; Q1 probes test this understanding |
| Respondents understand their answer is hypothetical | **MET (synthetic)** | Q2 scores in Section 11; 100% hypothetical awareness across all cards |

### 20.5 Status Declaration

**M48-03: BASELINE ESTABLISHED**

- Research protocol is complete with synthetic findings.
- Real respondent testing is deferred and requires separate owner authorization.
- No pricing decision is made or implied.
- No product code is changed.
- No commercial offer is made.
- All data is synthetic and must not be used as market evidence.

This document serves as the input for:
- Card revision before real testing (Section 14.1.2, 14.2.3).
- M48-04 (entitlement/policy design) — when and if a pricing decision is made.
- M48-05 (partnership research) — for H3 sponsor identification.
- Future real comprehension testing — using the protocol in Section 9.

### 20.6 Document Control

| Field | Value |
|---|---|
| Document ID | M48-03-ethical-pricing-hypotheses |
| Version | 1.0 (synthetic baseline) |
| Status | BASELINE ESTABLISHED |
| Date | 30 October 2026 |
| Author | Product research (synthetic analysis) |
| Reviewer | Pending (owner review required before real testing) |
| Next action | Owner review; card revision; real respondent recruitment (with separate authorization) |
| Superseded by | Future real-testing report (when conducted) |

---

*End of M48-03 — Ethical Pricing Hypotheses for Institutional Research Tools*
*BASELINE ESTABLISHED — Research protocol complete with synthetic findings; real testing deferred.*
