# M48-08 — Assess a Rights-Cleared Creator/Research Service Model

> **Status: BASELINE ESTABLISHED** — Workflow/rights study complete with hypothetical scenarios.
> Real implementation deferred. No content solicited. No rights transferred. No payments modeled
> as real. No creator interviews conducted. All personas, works, and service scenarios are synthetic.
> This document is an offline research artifact; it does not constitute a service offering, legal
> opinion, rights agreement, or solicitation of creator participation.

- **Task**: M48-08 (LEAF, milestone [M48 WORKS buyer validation and sustainable economics](../milestones/M48.md), V5 candidate [ECO-008](../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md))
- **Canonical TODO task**: [M48-08](../../../TODO.md) — TODO is sole status source; `ECO-008` is only the V5 reference ID.
- **Group**: G7 — ECOSYSTEM
- **Priority / Difficulty**: P2 / D4
- **Owner**: product/rights research
- **Effort estimate**: L (5–10 days; expert review cost TBD)
- **Dependencies**: M48-04 (done — commercial/donation boundary); M17-06 (open — poster/music/media license tracking); M18-02 (open — single publication state machine); M35-02 (external — merchant/legal ownership)
- **Companion tasks consuming this study**: M17-06 (license manifests), M18-02 (publication state), M48-04 (commerce/charity boundary)
- **Document date**: 2026-10-31
- **Data posture**: Synthetic only. No real content solicited. No real creators contacted. No real rights agreements. No real payments.

---

> ## CONCEPTUAL STUDY ONLY — NOT LEGAL ADVICE
>
> This document is a **workflow/rights study and design artifact**. It does not constitute legal,
> financial, intellectual property, or regulatory advice. It proposes no service offering, rights
> agreement, license contract, payment schedule, or creator solicitation. All scenarios are
> **hypothetical** with **synthetic data**. No real content is requested, transferred, licensed,
> or sold. Unresolved rights areas are explicitly marked **UNKNOWN**.
>
> **Watermark:** CONCEPT — BASELINE ESTABLISHED — IMPLEMENTATION DEFERRED

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Research Goals and Constraints](#3-research-goals-and-constraints)
4. [Service Model Definition](#4-service-model-definition)
5. [Work Types Mapping](#5-work-types-mapping)
6. [Rights Holder Identification Methodology](#6-rights-holder-identification-methodology)
7. [Creator Consent Framework](#7-creator-consent-framework)
8. [License Model Design](#8-license-model-design)
9. [Payment Obligation Mapping](#9-payment-obligation-mapping)
10. [Withdrawal Rights](#10-withdrawal-rights)
11. [Derivative Work Handling](#11-derivative-work-handling)
12. [Attribution Requirements](#12-attribution-requirements)
13. [Dispute Resolution Pathway](#13-dispute-resolution-pathway)
14. [Hypothetical Service Scenarios](#14-hypothetical-service-scenarios)
15. [Scenario Walkthrough: Withdrawal Case](#15-scenario-walkthrough-withdrawal-case)
16. [Scenario Walkthrough: Derivative Work Case](#16-scenario-walkthrough-derivative-work-case)
17. [Scenario Walkthrough: Attribution Case](#17-scenario-walkthrough-attribution-case)
18. [Scenario Walkthrough: Refund Case](#18-scenario-walkthrough-refund-case)
19. [Unpaid Labor Prevention Measures](#19-unpaid-labor-prevention-measures)
20. [Cultural Appropriation Safeguards](#20-cultural-appropriation-safeguards)
21. [Contributor Comprehension Testing](#21-contributor-comprehension-testing)
22. [Service Cost Range Estimation](#22-service-cost-range-estimation)
23. [Rights/Finance Review Considerations](#23-rightsfinance-review-considerations)
24. [Risk Analysis](#24-risk-analysis)
25. [Metrics and Success Criteria](#25-metrics-and-success-criteria)
26. [Limitations and Caveats](#26-limitations-and-caveats)
27. [Deferred Items Requiring Owner Action](#27-deferred-items-requiring-owner-action)
28. [Conclusion: BASELINE ESTABLISHED](#28-conclusion-baseline-established)

---

## 1. Executive Summary

M48-08 asks whether a **paid service** could support authorized corpus preparation or research tooling within the MoonWitness XV ecosystem **without selling source rights**. This is a workflow and rights study — not a service launch, not a marketplace design, not a rights transfer mechanism. The study produces a **conceptual framework** that maps how creator consent, license boundaries, payment obligations, withdrawal rights, derivative work handling, attribution, and dispute resolution would need to function if such a service were ever proposed.

### Why this question matters

MoonWitness XV sits at the intersection of creative works, historical sources, and research tooling. Previous M48 tasks have established:

- **M48-01**: Institutional demand exists for research-support workflows (BASELINE ESTABLISHED).
- **M48-02**: Self-hosted support demand is real but bounded; SLA expectations must be separated from support interest (BASELINE ESTABLISHED).
- **M48-03**: Ethical pricing hypotheses can be constructed without coercion, but comprehension varies significantly across models (BASELINE ESTABLISHED).
- **M48-04**: Commerce, charity, and source stewardship must remain structurally separate with distinct owners and flows (BASELINE ESTABLISHED).
- **M48-05**: Partnership distribution is feasible under non-exclusive control principles (BASELINE ESTABLISHED).
- **M48-06**: Cost-to-serve ranges from $152–$1,549/month depending on workflow scope (BASELINE ESTABLISHED).
- **M48-07**: No single funding model eliminates concentration risk; diversified mixes reduce dependency but add complexity (BASELINE ESTABLISHED).

M48-08 extends this body of work by asking: if a creator or rights holder wanted their work included in a **corpus preparation service** or **research tooling offering**, what would the rights, consent, payment, and withdrawal framework need to look like? The question is structural, not operational. No service is launched. No content is solicited.

### What this document delivers

- **A service model definition** that distinguishes corpus preparation and research tooling from content sales or rights transfers.
- **A work types mapping** covering five categories of creative/scholarly work that might participate in such a service.
- **A rights holder identification methodology** for determining who holds what rights in complex, multi-contributor works.
- **A creator consent framework** built on informed, revocable, and specific consent principles.
- **A license model design** that separates what is licensed (service access, derived outputs) from what is retained (source rights, moral rights, attribution).
- **A payment obligation mapping** identifying who pays, how much, when, and what the payment does and does not purchase.
- **Withdrawal rights** specifying how creators can remove their content from the service.
- **Derivative work handling** defining what happens to outputs created from contributed works.
- **Attribution requirements** establishing how creators are credited.
- **A dispute resolution pathway** for conflicts between creators, the service, and end users.
- **Five hypothetical service scenarios** with synthetic data illustrating how the framework would function.
- **Four scenario walkthroughs** (withdrawal, derivative work, attribution, refund) testing the framework under stress.
- **Unpaid labor prevention measures** ensuring contributors are not exploited.
- **Cultural appropriation safeguards** protecting traditional knowledge and culturally sensitive material.
- **Contributor comprehension testing** methodology to verify informed consent.
- **Service cost range estimation** for hypothetical pricing.
- **Rights/finance review considerations** flagging items requiring expert approval.
- **Risk analysis** covering implied ownership, licensing confusion, and related hazards.
- **Metrics and success criteria** for evaluating the study.
- **Limitations and caveats** acknowledging what this study cannot resolve.
- **Deferred items** requiring owner action before any implementation.

### Key synthetic findings

- **The service model is structurally feasible** but only if every participant (creator, service operator, end user) has a clearly defined role with explicit rights boundaries. The highest risk is **implied licensing** — where a creator's participation is interpreted as granting broader rights than intended.
- **Consent must be layered**: general participation consent, specific work consent, derivative work consent, and ongoing withdrawal consent are separate decisions that cannot be bundled into a single agreement.
- **Withdrawal is the hardest problem**: once a work has been included in a corpus or used to generate research outputs, complete withdrawal may be technically impossible without degrading the corpus. The framework must define what "withdrawal" means at each stage (pre-ingestion, post-ingestion/pre-publication, post-publication).
- **Payment flows must be unidirectional**: the creator receives payment (or compensation) for participation; the end user pays the service for tooling access. Money must never flow from creator to service as a condition of participation — that would constitute unpaid labor or pay-to-play exploitation.
- **Derivative works create a boundary problem**: if a research tool generates analysis, summaries, or transformations of contributed works, who holds the rights to those derivatives? The framework assigns derivative ownership to the service for operational purposes but requires creator consent for each derivative category and preserves creator attribution and integrity rights.
- **Cultural appropriation is not solved by consent alone**: even with informed consent, certain cultural materials may not be appropriate for inclusion in a commercial service. The framework requires a separate cultural review step that can veto participation regardless of individual consent.
- **No scenario eliminates all risk.** Each hypothetical service type leaves gaps: corpus preparation faces provenance challenges; research tooling faces derivative work ambiguity; translation services face fidelity and integrity questions. The framework makes these gaps visible rather than hiding them.

### Closure status

BASELINE ESTABLISHED. The workflow/rights study is complete with hypothetical scenarios. All proposed services have identifiable rights, contributor choice, payment obligation, and dispute route as required by acceptance criteria. Unresolved legal and ethical areas remain UNKNOWN. M17-06, M18-02, and M35-02 owner review is deferred. No real content has been solicited.

---

## 2. Task Metadata

### 2.1 Canonical Specification Reference

| Field | Value |
|---|---|
| Candidate ID | ECO-008 |
| TODO Task ID | M48-08 |
| Domain / Category | Economy / Creator/service economy |
| Priority | P2 (core product improvement) |
| Difficulty | D4 (complex with cross-domain review) |
| Owner | product/rights research |
| Effort | L (5–10 days; expert review cost TBD) |
| Confidence | Low (synthetic data; no real creator engagement) |
| Risk | High (rights, labor, and cultural sensitivity implications) |
| V5 Wave | W3 (proposed) |
| Tags | rights, consent, creator-economy, corpus, research-tooling, withdrawal, derivatives |
| Status Register | [TODO.md](../../../TODO.md) — sole status source |
| Milestone | M48 — WORKS buyer validation and sustainable economics |
| Milestone Group | G7 — ECOSYSTEM |

### 2.2 Dependencies

| Dependency | Type | Status | Relevance |
|---|---|---|---|
| M48-04 (Commercial/donation boundary) | Sibling task | BASELINE ESTABLISHED | Defines the commerce/charity/stewardship separation this study must respect |
| M17-06 (Poster/music/media license tracking) | Upstream prerequisite | Open | Defines license manifests that any service would need to respect |
| M18-02 (Single publication state machine) | Upstream prerequisite | Open | Defines publication states that affect when content becomes irrevocable |
| M35-02 (Merchant legal/payment ownership) | External prerequisite | Not implemented | Defines merchant ownership that any payment flow must respect |
| M48-01 (Institutional demand validation) | Sibling task | BASELINE ESTABLISHED | Establishes that institutional demand exists; this study defines rights boundaries for serving that demand |
| M48-03 (Ethical pricing hypotheses) | Sibling task | BASELINE ESTABLISHED | Defines pricing models; this study defines what pricing can and cannot purchase |
| M48-06 (Cost-to-serve model) | Sibling task | BASELINE ESTABLISHED | Provides cost baseline for service cost range estimation |
| M48-07 (Funding model comparison) | Sibling task | BASELINE ESTABLISHED | Provides funding context; this study defines rights boundaries within any funding model |

### 2.3 Anti-Overlap Statement

This task does **not**:

- Build a creator marketplace or content upload pipeline.
- Implement a royalty ledger or payment distribution system.
- Make rights decisions (determine who owns what, whether a license is valid, or whether a transfer is permissible).
- Replace M17-06 license manifest tracking or M18-02 publication state machine.
- Solicit real content from real creators.
- Propose pricing tiers, subscription plans, or commercial offers.
- Authorize any real rights transfer, license grant, or payment flow.
- Implement M35 Treasury, merchant, or donation accounting.

This task **does**:

- Produce a conceptual workflow/rights study mapping how a paid service could operate within rights boundaries.
- Define work types, consent frameworks, license models, and withdrawal mechanisms at the design level.
- Document hypothetical scenarios with synthetic data to test the framework.
- Flag UNKNOWN legal, ethical, and cultural areas for owner/expert review.
- Establish baseline conditions that any future implementation must satisfy.

### 2.4 ADR Applicability

No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

### 2.5 22-Section Source Alignment

| # | Section | Status in this document |
|---|---|---|
| 1 | Identity | Recorded in §2.1 |
| 2 | Executive | §1 |
| 3 | Current state | §3.1 |
| 4 | Problem | §3.2 |
| 5 | Evidence | §3.3 |
| 6 | Value | §3.4 |
| 7 | Solution | §4, §5, §6, §7, §8 |
| 8 | Architecture | §3.5, §9, §10, §11 |
| 9 | Microtasks | §12, §13, §14, §15, §16, §17, §18 |
| 10 | Tests | §14.1–14.5, §15–18 |
| 11 | Risks | §19, §20, §24 |
| 12 | Rollback | §10, §27 |
| 13 | Metrics | §21, §25 |
| 14 | Owner | §2.1 |
| 15 | Dependencies | §2.2 |
| 16 | ADR | §2.4 |
| 17 | Start checklist | §3.5 |
| 18 | Execution steps | §4–§18 |
| 19 | Acceptance | §25 |
| 20 | DoD | §28 |
| 21 | Verification | §15–§18 |
| 22 | Closure | §27, §28 |

---

## 3. Research Goals and Constraints

### 3.1 Current State

The MoonWitness XV ecosystem currently supports:

- **Source stewardship**: Historical texts, manuscripts, and cultural materials are managed with provenance tracking, consent controls, and access restrictions (M16, M17, M18).
- **Research tooling**: Cross-referencing, comparative analysis, and corpus preparation workflows exist or are planned (M12–M15, M47).
- **Creative canon**: Original creative works (stories, music, visual art) are managed with rights tracking and publication state machines (M17, M18).
- **Economic modeling**: Cost-to-serve, pricing hypotheses, funding models, and commerce/charity boundaries have been established (M48-01 through M48-07).

What does **not** yet exist:

- A framework for determining whether a **paid service** could include creator-contributed works without purchasing or transferring source rights.
- A consent model that covers corpus preparation, research tooling, and derivative work generation.
- A withdrawal mechanism that accounts for works already ingested into a corpus or used in research outputs.
- A payment obligation map that distinguishes compensation for participation from purchase of rights.
- A cultural appropriation safeguard that goes beyond individual consent.

### 3.2 Problem Statement

If MoonWitness XV were to offer a paid service that incorporates creator-contributed works — for example, a corpus preparation service for institutional researchers, or a research tooling platform that analyzes contributed texts — the following questions must be answered **before any implementation**:

1. **What work types can participate?** Not all creative or scholarly works are suitable for inclusion in a paid service. Some may carry restrictions that make participation inappropriate.
2. **Who holds the rights?** Works may have multiple rights holders (author, translator, illustrator, performer, estate, community). Each must be identified and their consent obtained.
3. **What is being licensed?** The service must not purchase source rights. It must license only the specific uses needed for the service to function.
4. **How is consent obtained?** Consent must be informed, specific, revocable, and separate from any pressure to participate.
5. **What happens on withdrawal?** Creators must be able to withdraw their works. The framework must define what withdrawal means at each stage of the service lifecycle.
6. **Who owns derivatives?** If the service generates analysis, summaries, or transformations, derivative ownership must be clearly assigned.
7. **How are creators compensated?** Payment must flow to creators, not from creators. The framework must prevent unpaid labor and pay-to-play exploitation.
8. **How are disputes resolved?** Conflicts between creators, the service, and end users need a defined resolution pathway.
9. **What cultural safeguards apply?** Some works carry cultural significance that transcends individual consent. The framework must respect community rights.

### 3.3 Evidence Base

This study draws on:

- **M48-01**: Synthetic institutional demand validation showing 6/8 profiles described costly cross-referencing workflows.
- **M48-02**: Synthetic self-hosted support demand showing 5/7 profiles want installation guidance but 0/7 accept SLA.
- **M48-03**: Synthetic ethical pricing research showing flat institutional model (H2) passes comprehension threshold at 87.5%.
- **M48-04**: Conceptual boundary diagram establishing commerce/charity/stewardship separation.
- **M48-06**: Cost-to-serve model establishing $152–$1,549/month range for institutional research workflows.
- **M48-07**: Funding model comparison showing no single scenario eliminates concentration risk.
- **M16-04**: Media consent ACL framework (referenced for consent principles).
- **M17-06**: License tracking requirements (open — referenced as upstream dependency).
- **M18-02**: Publication state machine (open — referenced for state-dependent withdrawal rules).
- **Published research** on creator rights, cultural appropriation in digital archives, and ethical data stewardship (referenced conceptually, not as legal authority).

All evidence is synthetic or referenced from other baseline-established studies. No real creator interviews have been conducted.

### 3.4 Value Statement

The value of this study is **risk reduction**. By mapping the rights, consent, payment, and withdrawal framework **before** any service is built, the project avoids:

- **Legal risk**: Unresolved rights questions could expose the project to infringement claims.
- **Ethical risk**: Unpaid labor or cultural appropriation could harm creators and communities.
- **Reputational risk**: A service that appears to exploit creators undermines the project's mission.
- **Technical risk**: Building a service without understanding withdrawal and derivative work implications creates technical debt that is expensive to remediate.

The study's value is measured not by what it enables, but by what it prevents.

### 3.5 Start Checklist

- [x] Re-read linked TODO rows (M48-08, M48-04, M17-06, M18-02, M35-02) at active `dev` HEAD.
- [x] Inspect current WIP (M48-01 through M48-07 baseline documents).
- [x] Confirm applicable rights/consent/release and human-authority gates.
- [x] Agree reviewer (product/rights research owner).
- [x] Define smallest feasible scope (workflow/rights study with hypothetical examples only).
- [x] Confirm no outreach, private/unlicensed content import, publication, money handling, or owner-boundary change without applicable separate authority.

### 3.6 Hard Constraints

| # | Constraint | Source |
|---|---|---|
| C1 | No marketplace, upload pipeline, royalty ledger, or rights decision is built. | Task scope |
| C2 | No real content is solicited from real creators. | Definition of done |
| C3 | No actual payments are modeled as real financial flows. | Synthetic-only requirement |
| C4 | No legal advice is given; all legal areas are flagged UNKNOWN. | Risk mitigation |
| C5 | Every proposed service must have identifiable rights, contributor choice, payment obligation, and dispute route. | Acceptance criteria |
| C6 | No source rights are sold, transferred, or exclusively licensed. | Anti-overlap |
| C7 | All scenarios must use synthetic data with labeled personas. | Data posture |
| C8 | The document must be watermarked as conceptual. | Risk mitigation |
| C9 | Cultural appropriation safeguards must be included even though no real cultural materials are involved. | Risk mitigation |
| C10 | Unpaid labor prevention must be explicit, not implicit. | Acceptance criteria |

### 3.7 Non-Goals

The following are explicitly **out of scope** for M48-08:

- Designing a content management system or upload pipeline.
- Implementing a rights management system or license tracking database.
- Creating a payment processing system or billing infrastructure.
- Drafting legal contracts, license agreements, or consent forms.
- Conducting real creator interviews or outreach.
- Making legal determinations about copyright, moral rights, or cultural ownership.
- Proposing specific pricing or revenue models (covered by M48-03, M48-06, M48-07).
- Building a dispute resolution platform or arbitration system.
- Replacing or duplicating M17-06 license manifests or M18-02 publication states.

---

## 4. Service Model Definition

### 4.1 What the Paid Service Would Do

The hypothetical paid service under study is a **rights-cleared creator/research service** that provides authorized corpus preparation or research tooling to institutional users. The service does **not** sell, transfer, or exclusively license source rights. It provides **access to tooling** that operates on contributed works within defined boundaries.

**Core service functions (hypothetical):**

| Function | Description | Rights Boundary |
|---|---|---|
| F1: Corpus preparation | Organize, tag, and structure contributed works into research corpora | Service operates on works with creator consent; does not acquire ownership |
| F2: Cross-referencing tool | Enable researchers to search and compare across contributed works | Service provides search infrastructure; does not reproduce works in outputs |
| F3: Analysis generation | Produce summaries, statistical analyses, or pattern detection from corpora | Derivatives owned by service per §11; creator attribution preserved |
| F4: Translation assistance | Support multilingual research by providing translation tooling over contributed texts | Translation is a derivative per §11; original integrity preserved |
| F5: Citation generation | Produce properly attributed citations referencing contributed works | Citations are factual references; no rights transfer required |

### 4.2 What the Service Does NOT Do

| Exclusion | Rationale |
|---|---|
| Does not sell source works | Source rights remain with creators/estates/communities |
| Does not grant exclusive access | All contributed works remain available to other service participants per their consent terms |
| Does not transfer copyright | No rights assignment; only operational licenses for service function |
| Does not permit unrestricted reproduction | End users access tooling outputs, not raw source works |
| Does not operate as a marketplace | No buyer/seller matching; service is the intermediary operator |
| Does not solicit content proactively | Content participation is creator-initiated with informed consent |
| Does not override withdrawal rights | Creators can withdraw per §10 regardless of service impact |

### 4.3 Service Participants

The hypothetical service involves three participant roles:

```
+------------------------------------------------------------------+
|                  RIGHTS-CLEARED SERVICE MODEL                      |
|                                                                    |
|  +------------------+     +------------------+     +-------------+ |
|  |    CREATOR       |     |  SERVICE OPERATOR |     |  END USER   | |
|  |  (Rights Holder) |     |  (MoonWitness XV) |     | (Researcher)| |
|  +--------+---------+     +--------+---------+     +------+------+ |
|           |                         |                       |       |
|           | 1. Consents to          | 2. Provides           |       |
|           |    participation with   |    tooling access     |       |
|           |    defined boundaries   |    for contributed    |       |
|           |                         |    works              |       |
|           v                         v                       v       |
|  +----------------------------------------------------------------+ |
|  |                    CONSENT LAYER                                 | |
|  |  - Specific (per-work, per-function)                            | |
|  |  - Informed (creator understands what happens)                  | |
|  |  - Revocable (creator can withdraw)                             | |
|  |  - Documented (consent record persists)                         | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +----------------------------------------------------------------+ |
|  |                    PAYMENT LAYER                                 | |
|  |  - End user pays service operator for tooling access            | |
|  |  - Service operator compensates creator for participation       | |
|  |  - No payment grants source rights                              | |
|  |  - No payment flows from creator to service                     | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +----------------------------------------------------------------+ |
|  |                    RIGHTS LAYER                                  | |
|  |  - Creator retains all source rights                            | |
|  |  - Service receives operational license for defined functions   | |
|  |  - End user receives tooling output, not source access          | |
|  |  - Derivative works assigned per §11                            | |
|  +----------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### 4.4 Service Boundary Principles

| # | Principle | Rationale |
|---|---|---|
| P1 | **Consent precedes participation** | No work is included without explicit, informed, documented consent |
| P2 | **Operational license, not ownership** | The service receives only the minimum rights needed to function |
| P3 | **Creator retains source rights** | Copyright, moral rights, and attribution rights remain with the creator |
| P4 | **Payment compensates, does not purchase** | Creator compensation is for participation effort, not rights transfer |
| P5 | **Withdrawal is always possible** | Creators can withdraw at any time; the service absorbs the cost |
| P6 | **Derivatives are bounded** | Derivative works are limited to what the consent specifically authorizes |
| P7 | **Access is tooling-mediated** | End users interact with tooling, not raw source works |
| P8 | **Cultural review is separate from consent** | Individual consent does not override community cultural protections |

---

## 5. Work Types Mapping

### 5.1 Categories of Contributable Works

Not all creative or scholarly works are alike. The following taxonomy identifies five work types that might participate in the hypothetical service, with their distinct rights characteristics:

| Work Type | Description | Example (Synthetic) | Rights Complexity |
|---|---|---|---|
| WT-1: Literary text | Prose, poetry, narrative fiction, or non-fiction text | A short story collection in Indonesian and English | Low-Medium (author holds clear copyright) |
| WT-2: Musical composition | Sheet music, recorded performance, or compositional notation | A set of traditional melodies with original arrangements | High (composer, performer, arranger, recording owner may differ) |
| WT-3: Visual artwork | Illustration, photography, calligraphy, or graphic design | A series of manuscript illustrations from a historical text | Medium (artist holds copyright; reproduction rights may be licensed) |
| WT-4: Scholarly annotation | Critical apparatus, commentary, translation notes, or editorial markup | Annotated edition of a classical text with apparatus criticus | Medium (annotator holds copyright on annotations; underlying text may be public domain) |
| WT-5: Oral tradition transcript | Transcribed and formatted oral history, storytelling, or recitation | A transcribed oral narrative with speaker consent and community approval | Very High (speaker, community, transcriber, and cultural custodians may all have claims) |

### 5.2 Rights Complexity by Work Type

Each work type carries different rights identification challenges:

**WT-1: Literary text**
- Primary rights holder: Author (or estate if deceased)
- Secondary rights: Translator (if translated work), publisher (if exclusive license granted)
- Consent complexity: Low — typically one or two identifiable rights holders
- Withdrawal complexity: Low — text can be removed from corpus without structural damage

**WT-2: Musical composition**
- Primary rights holder: Composer (or estate)
- Secondary rights: Performer, arranger, recording owner, lyricist (if separate from composer)
- Consent complexity: High — multiple rights holders may need separate consent
- Withdrawal complexity: Medium — if a recording is removed, the underlying composition may remain with different consent

**WT-3: Visual artwork**
- Primary rights holder: Artist (or estate)
- Secondary rights: Photographer (if photograph of artwork), publisher (if reproduction licensed), physical owner (if access required for reproduction)
- Consent complexity: Medium — artist consent may not cover all reproduction contexts
- Withdrawal complexity: Low-Medium — image can be removed; references in analysis outputs may need redaction

**WT-4: Scholarly annotation**
- Primary rights holder: Annotator/editor
- Secondary rights: Publisher of annotated edition, underlying text rights holder (if not public domain)
- Consent complexity: Medium — annotation rights may be entangled with publication contracts
- Withdrawal complexity: Medium — annotations may be deeply integrated into corpus structure; removal may require corpus re-indexing

**WT-5: Oral tradition transcript**
- Primary rights holder: Speaker/narrator
- Secondary rights: Community (cultural ownership), transcriber (copyright on transcription format), recording owner (if audio exists), cultural custodians
- Consent complexity: Very High — individual consent may not be sufficient; community consent may be required
- Withdrawal complexity: High — oral traditions may be interwoven with other materials; withdrawal may affect multiple corpus entries

### 5.3 Work Type Exclusion Criteria

Certain works are **excluded** from participation regardless of rights holder consent:

| Exclusion Category | Rationale | Example |
|---|---|---|
| EX-1: Sacred/restricted ceremonial material | Cultural protocols may prohibit sharing outside specific contexts | A prayer text restricted to initiated community members |
| EX-2: Content with unresolved provenance | Cannot confirm rights holder identity or chain of title | An anonymous manuscript with competing ownership claims |
| EX-3: Content under active legal dispute | Litigation creates uncertainty about rights validity | A work subject to an ongoing copyright infringement lawsuit |
| EX-4: Content requiring community consent not obtained | Individual consent is insufficient for collectively-held cultural materials | A traditional story that requires elder council approval |
| EX-5: Content that would create unacceptable appropriation risk | Even with consent, the service's commercial nature may be inappropriate | A culturally significant text used in a way that trivializes its meaning |

### 5.4 Synthetic Work Inventory

For scenario testing purposes, the following synthetic works are defined:

| Work ID | Type | Title (Synthetic) | Creator (Synthetic) | Rights Status | Consent Status |
|---|---|---|---|---|---|
| SW-001 | WT-1 | "Crossing the Archipelago" (bilingual edition) | Author: Synthetic Persona A (Indonesian, living) | Copyright held by author; translation copyright held by author | Consent granted for F1, F2, F5; F3 and F4 not consented |
| SW-002 | WT-2 | "Seven Night Modes" (composition + recording) | Composer: Synthetic Persona B (Malaysian, deceased 2019); Performer: Synthetic Persona C | Composition copyright held by B's estate; recording copyright held by C | Consent granted by estate for F1, F2; C consented separately for F1, F3 |
| SW-003 | WT-3 | "Manuscript Marginalia Series" (12 illustrations) | Artist: Synthetic Persona D (Filipino, living) | Copyright held by artist; reproduction license granted to historical society | Artist consented for F1, F5; historical society consented for reproduction in corpus |
| SW-004 | WT-4 | "Annotated Merchant Records" (critical edition) | Annotator: Synthetic Persona E (British, living); Underlying text: Public domain | Annotation copyright held by annotator; underlying text PD | Annotator consented for F1, F2, F3, F4, F5 |
| SW-005 | WT-5 | "The Tide Keeper's Account" (oral narrative transcript) | Speaker: Synthetic Persona F (Pacific Islander, living); Community: Synthetic Community G | Speaker consented; community consent pending | Speaker consented for F1, F2; community consent NOT YET OBTAINED — work excluded from service until resolved |

---

## 6. Rights Holder Identification Methodology

### 6.1 Why Identification Is Hard

Rights holder identification is the foundational step that every subsequent consent, license, payment, and withdrawal decision depends on. Getting it wrong — even unintentionally — can lead to:

- **Unauthorized use**: Including a work without proper consent exposes the service to infringement claims.
- **Missed compensation**: Failing to identify a rights holder means that person does not receive payment or attribution.
- **Invalid consent**: Consent obtained from the wrong party is void, even if given in good faith.
- **Cultural harm**: For traditional knowledge or community-held materials, individual identification may miss collective rights.

### 6.2 Identification Protocol

The following protocol must be completed for every work before it can be considered for service participation:

**Step 1: Primary rights holder identification**

| Question | Method | Evidence Required |
|---|---|---|
| Who created the work? | Creator self-identification, publication records, provenance documentation | Name, date of creation, medium |
| Is the creator living or deceased? | Public records, estate contacts, community knowledge | Date of death (if applicable), estate representative |
| Has copyright been transferred? | Publication contracts, estate records, rights registry searches | Transfer documentation or confirmation of retention |
| Are there joint authors? | Co-creation records, contributor agreements | All joint authors identified and their respective contributions documented |

**Step 2: Secondary rights holder identification**

| Question | Method | Evidence Required |
|---|---|---|
| Are there performers, translators, or arrangers? | Publication credits, recording metadata, contributor agreements | Each secondary rights holder identified separately |
| Does a publisher hold exclusive rights? | Publication contracts, rights registry searches | Scope and duration of exclusive license |
| Are there photographic or reproduction rights? | Physical owner agreements, museum/collection records | Reproduction license terms |
| Are there cultural custodians? | Community consultation, traditional knowledge registries | Community representative and consent protocol |

**Step 3: Rights status determination**

| Status | Definition | Service Eligibility |
|---|---|---|
| CLEAR | All rights holders identified and consent obtained | Eligible for participation |
| PARTIAL | Some rights holders identified; others pending | Eligible only for functions covered by obtained consents |
| UNCLEAR | Rights holders cannot be fully identified | NOT ELIGIBLE — requires further research before participation |
| DISPUTED | Competing claims exist | NOT ELIGIBLE — requires legal resolution before participation |
| EXCLUDED | Work falls under exclusion criteria (EX-1 through EX-5) | NOT ELIGIBLE regardless of rights status |

**Step 4: Documentation and verification**

Every identification must be documented with:

- Rights holder name (or pseudonym if requested)
- Relationship to the work (creator, heir, estate, publisher, community)
- Contact method (or intermediary if direct contact is inappropriate)
- Evidence basis (how the identification was made)
- Verification status (confirmed by independent source, self-reported, inferred)
- Date of identification
- Identifier who performed the research

### 6.3 Synthetic Identification Examples

| Work ID | Primary Holder | Secondary Holders | Status | Notes |
|---|---|---|---|---|
| SW-001 | Author A (living, self-identified) | None | CLEAR | Single author, no transfers |
| SW-002 | Composer B estate (confirmed via probate) | Performer C (living, self-identified) | CLEAR | Two separate consents required and obtained |
| SW-003 | Artist D (living, self-identified) | Historical Society (reproduction license holder) | PARTIAL | Artist consented; society consent needed for corpus reproduction |
| SW-004 | Annotator E (living, self-identified) | None (underlying text PD) | CLEAR | Annotation copyright only; base text is public domain |
| SW-005 | Speaker F (living, self-identified) | Community G (consent pending), Transcriber H (identified, consent not sought) | UNCLEAR | Community consent required; transcriber rights on formatting unresolved |

### 6.4 Identification Failure Protocol

If rights holders cannot be identified after reasonable effort:

1. **Document the effort**: Record all search methods used, sources consulted, and dates.
2. **Escalate to review**: Flag the work for product/rights research owner review.
3. **Suspend participation**: The work cannot be included in the service until identification is resolved.
4. **Set a review deadline**: If identification is not resolved within 90 days, the work is permanently excluded from the current service scope.
5. **Preserve the record**: Documentation of the identification effort is retained for future reference, even if the work is excluded.

---

## 7. Creator Consent Framework

### 7.1 Consent Principles

Creator consent is the ethical and legal foundation of the hypothetical service. Consent must satisfy four principles:

| Principle | Definition | Implementation |
|---|---|---|
| **Informed** | The creator understands what they are consenting to, including risks and limitations | Consent form explains each service function, derivative work implications, withdrawal process, and payment terms in plain language |
| **Specific** | Consent is granted for defined functions, not blanket permission | Creator selects which functions (F1–F5) their work may be used for; each selection is recorded separately |
| **Revocable** | The creator can withdraw consent at any time | Withdrawal process is defined in §10; consent form explicitly states withdrawal is always possible |
| **Documented** | Consent is recorded and persists for the life of the service participation | Consent record includes date, scope, creator identity verification, and version of consent form used |

### 7.2 Consent Layers

Consent is not a single decision. It is layered, with each layer covering a distinct aspect of participation:

**Layer 1: General participation consent**
- Creator agrees to be considered for service participation
- Does not grant any specific rights
- Can be withdrawn at any time without affecting any works already consented
- Covers: communication, evaluation, eligibility determination

**Layer 2: Work-specific consent**
- Creator agrees to include a specific work in the service
- Identifies the work by title, description, and Work ID
- Specifies which service functions (F1–F5) the work may be used for
- Can be withdrawn independently of other works
- Covers: ingestion, storage, operational use within consented functions

**Layer 3: Derivative work consent**
- Creator agrees to allow the service to generate derivatives of their work
- Specifies which derivative types are permitted (summaries, analyses, translations, statistical patterns)
- Can be withdrawn independently; withdrawal halts new derivative generation but does not recall existing derivatives per §11
- Covers: derivative creation, storage, and distribution within service boundaries

**Layer 4: Attribution consent**
- Creator specifies how they wish to be attributed
- Options: full name, pseudonym, anonymous, institutional affiliation
- Can be modified at any time; modifications are applied retroactively to existing outputs
- Covers: display of creator identity in service outputs, citations, and acknowledgments

**Layer 5: Payment consent**
- Creator agrees to the compensation structure
- Specifies payment method and currency preference
- Can be withdrawn (creator declines payment); withdrawal of payment consent does not affect other consent layers but triggers a review of whether participation can continue without compensation
- Covers: compensation amount, payment schedule, tax reporting

**Layer 6: Cultural consent (where applicable)**
- For works with cultural significance, community consent is obtained separately
- Community consent follows the community's own protocols and decision-making processes
- Can be withdrawn by the community regardless of individual creator consent
- Covers: cultural appropriateness, community attribution, cultural protocol compliance

### 7.3 Consent Process Flow

```
+------------------+
| Creator expresses |
| interest in       |
| participating     |
+--------+---------+
         |
         v
+------------------+     +------------------+
| Service provides |---->| Creator reviews  |
| consent          |     | information      |
| information      |     | independently    |
| package          |     |                  |
+------------------+     +--------+---------+
                                  |
                                  v
                         +------------------+
                         | Creator asks     |
                         | questions?       |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
            +--------------+          +------------------+
            | Service      |          | Creator provides |
            | answers      |          | general          |
            | questions    |          | participation    |
            +--------------+          | consent (Layer 1)|
                                      +--------+---------+
                                               |
                                               v
                                      +------------------+
                                      | For each work:   |
                                      | - Identify rights|
                                      | - Determine      |
                                      |   eligibility    |
                                      | - Creator grants |
                                      |   work-specific  |
                                      |   consent        |
                                      |   (Layer 2)      |
                                      +--------+---------+
                                               |
                                               v
                                      +------------------+
                                      | For each         |
                                      | function/        |
                                      | derivative:      |
                                      | - Creator grants |
                                      |   specific       |
                                      |   consent        |
                                      |   (Layers 3-6)   |
                                      +--------+---------+
                                               |
                                               v
                                      +------------------+
                                      | Consent record   |
                                      | created and      |
                                      | stored           |
                                      +------------------+
```

### 7.4 Consent Withdrawal

Consent withdrawal is covered in detail in §10. Key principles:

- Any consent layer can be withdrawn independently.
- Withdrawal is effective within a defined timeframe (see §10.3).
- Withdrawal does not require justification.
- Withdrawal does not penalize the creator (no financial penalty, no loss of previously-earned compensation).
- Withdrawal is documented and confirmed to the creator in writing.

### 7.5 Synthetic Consent Records

| Work ID | Layer 1 | Layer 2 | Layer 3 | Layer 4 | Layer 5 | Layer 6 | Overall Status |
|---|---|---|---|---|---|---|---|
| SW-001 | Granted 2026-09-15 | Granted 2026-09-20 (F1, F2, F5) | Granted 2026-09-20 (F3: summaries only) | Full name | Agreed | N/A | ACTIVE |
| SW-002 | Granted 2026-09-18 | Granted 2026-09-25 (F1, F2) by estate; (F1, F3) by performer | Partial (F3 by performer only) | Composer name + performer name | Agreed (split 50/50) | N/A | ACTIVE |
| SW-003 | Granted 2026-09-20 | Granted 2026-10-01 (F1, F5) | Not granted | Pseudonym "D-Artist" | Agreed | N/A | ACTIVE |
| SW-004 | Granted 2026-09-22 | Granted 2026-10-05 (F1, F2, F3, F4, F5) | Granted (all derivative types) | Full name + institutional affiliation | Agreed | N/A | ACTIVE |
| SW-005 | Granted 2026-09-25 | Granted 2026-10-10 (F1, F2) by speaker; COMMUNITY CONSENT PENDING | Not granted (pending community) | Speaker name + community name | Pending | PENDING | SUSPENDED |

---

## 8. License Model Design

### 8.1 What Is Licensed vs. What Is Retained

The license model is the legal-operational bridge between creator rights and service function. It defines what the creator grants to the service, what the service grants to end users, and what neither party acquires.

**Creator retains (always):**

| Right | Description |
|---|---|
| Copyright | The creator remains the copyright holder of their original work |
| Moral rights | Attribution, integrity, and disclosure rights remain with the creator |
| Source rights | The right to control reproduction, distribution, and adaptation of the source work |
| Withdrawal right | The right to remove their work from the service at any time |
| Reversion right | Upon withdrawal, all operational licenses revert to the creator |
| Derivative approval right | The creator must approve each category of derivative work before generation |

**Service receives (operational license):**

| License | Scope | Duration | Transferable |
|---|---|---|---|
| L1: Ingestion license | Right to copy the work into the service's secure storage for the purpose of providing the consented functions | For the duration of consent or until withdrawal | No |
| L2: Processing license | Right to process the work using consented functions (F1–F5) | For the duration of consent or until withdrawal | No |
| L3: Display license | Right to display limited excerpts or metadata to end users as part of tooling output | For the duration of consent or until withdrawal | No |
| L4: Derivative generation license | Right to create derivatives as specifically consented by the creator | For the duration of consent or until withdrawal; existing derivatives survive per §11 | No |
| L5: Citation license | Right to include properly attributed citations in research outputs | Perpetual for citations already generated; revocable for future citations | No |

**End user receives (tooling access):**

| Right | Scope | Limitation |
|---|---|---|
| R1: Tooling access | Right to use the service's research tools on contributed works | Does not include access to raw source works |
| R2: Output access | Right to receive and use tooling outputs (analyses, summaries, citations) | Outputs are subject to derivative work rules (§11) |
| R3: Citation use | Right to use generated citations in research publications | Citations must maintain attribution per §12 |

**Nobody receives (explicit exclusions):**

| Exclusion | Rationale |
|---|---|
| E1: Source reproduction | No one may reproduce the full source work outside the service |
| E2: Commercial redistribution | No one may sell, sublicense, or commercially redistribute the work or derivatives |
| E3: Unconsented adaptation | No one may create adaptations beyond the specifically consented derivative categories |
| E4: Identity removal | No one may remove or alter creator attribution |
| E5: Sublicensing | The service may not sublicense any received license to third parties |

### 8.2 License Duration and Termination

| Event | Effect on Licenses |
|---|---|
| Consent granted | Licenses L1–L5 become active |
| Consent layer withdrawn | Affected licenses terminate; unaffected licenses continue |
| Full consent withdrawal | All licenses terminate; L5 (citation) survives for already-generated citations per §10 |
| Service termination | All licenses terminate; derivative works handled per §11.4 |
| Creator death | Licenses continue under estate terms unless estate withdraws consent |
| Community consent withdrawn (Layer 6) | All licenses for the affected work terminate immediately regardless of individual consent |

### 8.3 License Compatibility with M48-04 Boundary

The license model must respect the M48-04 commercial/charity/stewardship separation:

- **Commerce domain**: The service's operational licenses (L1–L5) and end user rights (R1–R3) are commercial in nature. They are managed by the service operator and subject to payment obligations (§9).
- **Charity domain**: No license or right granted under this model constitutes a charitable donation. Creator compensation is payment for participation, not a gift to the service.
- **Stewardship domain**: Source rights, moral rights, and cultural rights are never licensed. They remain under the stewardship of the creator, their estate, or their community.

### 8.4 Synthetic License Matrix

| Work ID | L1 | L2 | L3 | L4 | L5 | E1–E5 Applied |
|---|---|---|---|---|---|---|
| SW-001 | Active | Active (F1, F2, F5) | Active (metadata + short excerpts) | Active (summaries only) | Active | Yes |
| SW-002 | Active | Active (F1, F2 by estate; F1, F3 by performer) | Active (metadata + short excerpts) | Active (F3 by performer only) | Active | Yes |
| SW-003 | Active | Active (F1, F5) | Active (metadata only — no image display) | Not active | Active | Yes |
| SW-004 | Active | Active (F1, F2, F3, F4, F5) | Active (excerpts + annotations) | Active (all types) | Active | Yes |
| SW-005 | Suspended (community consent pending) | Suspended | Suspended | Suspended | Suspended | Yes |

---

## 9. Payment Obligation Mapping

### 9.1 Who Pays, How Much, When

The payment model must satisfy three constraints:

1. **Creators are compensated, not charged.** No payment flows from creator to service as a condition of participation.
2. **End users pay for tooling, not content.** The payment is for access to research tools, not for purchasing works.
3. **Payment does not purchase rights.** Compensation is for participation effort and time, not for rights transfer.

### 9.2 Payment Flow Diagram

```
+------------------+                          +------------------+
|   END USER       |                          |    CREATOR       |
|   (Researcher)   |                          |   (Rights Holder)|
+--------+---------+                          +--------+---------+
         |                                             ^
         |                                             |
         | A. Pays service fee                         | D. Receives
         |    for tooling access                       |    compensation
         |                                             |    for participation
         v                                             |
+--------+---------+                          +--------+---------+
|  SERVICE OPERATOR |------------------------->|  COMPENSATION   |
|  (MoonWitness XV) |   C. Pays compensation  |    FUND          |
+------------------+   for creator partic.     +-----------------+
         |
         | B. Retains service fee
         |    minus compensation
         v
+------------------+
|  OPERATIONAL     |
|  REVENUE         |
+------------------+
```

### 9.3 Payment Categories

| Category | Payer | Recipient | Basis | Frequency | Synthetic Range |
|---|---|---|---|---|---|
| P1: Service access fee | End user (institution or individual researcher) | Service operator | Tooling access, not content | Monthly or per-project | $50–$200/researcher/month (aligned with M48-03 H2 hypothesis) |
| P2: Creator participation compensation | Service operator | Creator (or estate/community) | Time and effort of participation, not rights | Per-work, one-time or annual | $100–$500/work/first year; $50–$200/work/year subsequent |
| P3: Community benefit share (where applicable) | Service operator | Community organization or cultural fund | Cultural stewardship recognition, not rights purchase | Annual | 10–20% of P2 directed to community fund |
| P4: Derivative work royalty (if applicable) | Service operator | Creator | Share of revenue from derivative outputs that directly incorporate creator's work | Quarterly, based on usage | 5–15% of derivative revenue attributable to the work |

### 9.4 Payment Timing

| Event | Payment Triggered | Timing |
|---|---|---|
| Creator consent granted (Layer 2) | P2: First-year compensation | Within 30 days of consent |
| Annual consent renewal | P2: Subsequent-year compensation | Within 30 days of renewal |
| End user subscribes to service | P1: Service access fee | At subscription start |
| Derivative output generated and distributed | P4: Derivative royalty | Within 60 days of quarter-end |
| Community consent granted | P3: Community benefit share | Within 60 days of consent |
| Creator withdraws consent | Pro-rated P2 refund or final payment | Within 30 days of withdrawal |

### 9.5 Payment Prohibitions

| Prohibition | Rationale |
|---|---|
| Creator must never pay to participate | Payment from creator to service constitutes exploitation or pay-to-play |
| Service must never condition participation on rights transfer | Consent and compensation are separate from licensing |
| End user payment must never grant source access | Payment is for tooling, not for works |
| Community benefit share must never replace individual compensation | Community recognition is additional to, not substitutive of, individual payment |
| Derivative royalty must never be zero if derivatives generate revenue | Creators share in the value their work creates |

### 9.6 Synthetic Payment Scenario

For the five synthetic works (SW-001 through SW-005), assuming 3 end-user researchers subscribed:

| Category | Calculation | Total |
|---|---|---|
| P1: Service access | 3 researchers × $150/month × 12 months | $5,400/year |
| P2: Creator compensation (4 active works) | SW-001: $300 + SW-002: $400 (split estate/performer) + SW-003: $200 + SW-004: $350 | $1,250/year |
| P3: Community benefit (SW-005, when active) | 15% of $250 (hypothetical) | $37.50/year (not yet active) |
| P4: Derivative royalty (estimated) | 10% of hypothetical derivative revenue $2,000 | $200/year |
| **Total service revenue** | P1 | **$5,400/year** |
| **Total service obligations** | P2 + P3 + P4 | **$1,487.50/year** |
| **Net operational margin** | Revenue − obligations | **$3,912.50/year** |

**Note**: These figures are synthetic estimates for framework testing only. They do not represent real pricing, real costs, or real revenue projections. Actual figures would require M48-06 cost-to-serve analysis, M48-03 ethical pricing review, and legal/financial expert consultation.

---

## 10. Withdrawal Rights

### 10.1 The Withdrawal Principle

Creators have an **absolute, unconditional right** to withdraw their work from the service at any time, for any reason, without penalty. This principle is non-negotiable and is embedded in every consent layer.

### 10.2 Withdrawal Stages

The meaning and effect of withdrawal depends on the stage of the work's participation in the service:

| Stage | Definition | Withdrawal Effect |
|---|---|---|
| STAGE 0: Pre-ingestion | Creator has consented but work has not yet been ingested into the service | Full withdrawal. Consent record is deleted. No traces remain. |
| STAGE 1: Post-ingestion, pre-publication | Work is stored in the service but no outputs referencing it have been published | Full withdrawal. Work is deleted from service storage. Consent record is archived (not deleted) for audit purposes. |
| STAGE 2: Post-publication, pre-derivative | Work has been used in published tooling outputs (citations, metadata displays) but no derivatives have been generated | Partial withdrawal. Work is removed from active service. Published citations remain but are flagged as "source withdrawn." No new citations are generated. |
| STAGE 3: Post-derivative | Derivatives (summaries, analyses, translations) have been generated from the work | Conditional withdrawal. Work is removed from active service. Existing derivatives are handled per §11.3. No new derivatives are generated. Creator attribution is maintained on existing derivatives. |
| STAGE 4: Post-community-consent | Work has community consent (Layer 6) in addition to individual consent | Community withdrawal overrides individual consent. All service functions cease for the work. Existing derivatives are recalled per §11.3. Community is consulted on disposition of existing outputs. |

### 10.3 Withdrawal Process

```
+------------------+
| Creator submits  |
| withdrawal       |
| request          |
+--------+---------+
         |
         v
+------------------+     +------------------+
| Service verifies |---->| Creator identity |
| identity         |     | confirmed        |
+--------+---------+     +--------+---------+
                                  |
                                  v
                         +------------------+
                         | Determine current|
                         | stage (0-4)      |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |             |             |
                    v             v             v
            +----------+  +----------+  +--------------+
            | Stage 0-1|  | Stage 2  |  | Stage 3-4    |
            | Full     |  | Partial  |  | Conditional  |
            | removal  |  | removal  |  | removal      |
            +----------+  +----------+  +--------------+
                    |             |             |
                    v             v             v
            +----------------------------------------------+
            | Execute removal actions:                      |
            | - Delete/archive work from storage           |
            | - Update consent record                      |
            | - Notify end users of citation changes       |
            | - Handle derivatives per §11.3               |
            | - Calculate final/pro-rated compensation     |
            +--------+---------+
                     |
                     v
            +------------------+
            | Confirm          |
            | withdrawal to    |
            | creator in       |
            | writing          |
            +------------------+
```

### 10.4 Withdrawal Timeframes

| Action | Maximum Timeframe |
|---|---|
| Acknowledgment of withdrawal request | 2 business days |
| Cessation of new service functions for the work | 5 business days |
| Removal from active corpus/tooling | 15 business days |
| Handling of existing derivatives (per §11.3) | 30 business days |
| Final compensation calculation and payment | 30 business days |
| Written confirmation to creator | Upon completion of all actions |

### 10.5 Withdrawal and Compensation

| Scenario | Compensation Treatment |
|---|---|
| Withdrawal within first year of consent | Creator retains first-year compensation; no refund required |
| Withdrawal after first year, before annual renewal | Creator retains compensation for the current year; no refund required |
| Withdrawal after annual renewal | Creator retains compensation for the current year; no additional compensation |
| Withdrawal due to service breach of consent terms | Creator retains all past compensation; may be entitled to additional remedies per §13 |
| Community-initiated withdrawal (Stage 4) | Individual creator retains compensation; community benefit share ceases |

### 10.6 Synthetic Withdrawal Example

**Scenario**: Creator of SW-003 ("Manuscript Marginalia Series") withdraws consent 8 months after initial consent. At time of withdrawal:

- Work is at STAGE 2 (post-publication, pre-derivative — no derivatives were consented for SW-003).
- 3 citations have been generated referencing the work.
- Creator received $200 first-year compensation.

**Withdrawal actions**:

1. Acknowledgment sent to creator within 2 business days.
2. Work removed from active corpus within 15 business days.
3. Existing citations flagged as "source withdrawn" — citations remain but are annotated.
4. No derivatives to handle (none were generated).
5. Creator retains $200 first-year compensation (no refund).
6. Written confirmation sent to creator upon completion.
7. Consent record archived for audit purposes.

---

## 11. Derivative Work Handling

### 11.1 Definition of Derivative Works

For the purposes of this framework, a **derivative work** is any output generated by the service that incorporates, transforms, summarizes, analyzes, or otherwise processes a contributed work. Derivative works include but are not limited to:

| Derivative Type | Description | Example |
|---|---|---|
| DT-1: Summary | Condensed representation of the work's content | A 500-word abstract of a 10,000-word text |
| DT-2: Statistical analysis | Quantitative patterns extracted from the work | Word frequency distributions, topic modeling results |
| DT-3: Translation | The work rendered in another language | Indonesian text translated to English |
| DT-4: Cross-reference | Connections identified between the work and other works | Citation network showing relationships to 15 other texts |
| DT-5: Annotation layer | Service-generated commentary or markup applied to the work | Automated linguistic tagging of a transcribed oral narrative |
| DT-6: Visualization | Graphical representation of data derived from the work | A network graph showing character relationships in a story |

### 11.2 Derivative Ownership

| Party | Rights in Derivative | Basis |
|---|---|---|
| Service operator | Operational ownership of the derivative as a service output | Created by service tooling using licensed operational rights |
| Creator | Attribution right, integrity right, and consent-based control | Source work remains creator's property; derivative cannot exist without it |
| End user | Usage right for the derivative output within research context | Granted by service terms; does not include redistribution |

**Key principle**: The service owns the derivative as an operational output, but the creator's rights in the source work constrain what the service can do with the derivative. The creator's attribution and integrity rights persist in all derivatives.

### 11.3 Derivative Disposition on Withdrawal

When a creator withdraws consent and the work is at STAGE 3 or STAGE 4:

| Derivative State | Disposition |
|---|---|
| Derivative generated but not yet published | Deleted. No trace remains. |
| Derivative published and accessible to end users | Flagged as "source withdrawn." Derivative remains accessible but is annotated with withdrawal notice. No new access is granted after 90 days. |
| Derivative incorporated into another derivative (nested) | Inner derivative flagged; outer derivative reviewed for whether it can stand independently. If not, outer derivative is also flagged. |
| Derivative cited in external publication | Citation remains valid (citations are factual references). Service notifies creator of the citation for their records. |

### 11.4 Derivative Disposition on Service Termination

If the service ceases operation:

| Derivative State | Disposition |
|---|---|
| All unpublished derivatives | Deleted. No transfer to third parties. |
| All published derivatives | Made inaccessible. Creators are notified and may request deletion or archival transfer. |
| Derivatives cited in external publications | Citations remain valid. Service cooperates with creators to ensure attribution is maintained. |

### 11.5 Derivative Consent Requirements

Not all derivative types require the same level of consent:

| Derivative Type | Consent Required | Consent Layer |
|---|---|---|
| DT-1: Summary | Explicit consent required | Layer 3 |
| DT-2: Statistical analysis | Explicit consent required | Layer 3 |
| DT-3: Translation | Explicit consent required | Layer 3 |
| DT-4: Cross-reference | Implicit in corpus participation consent | Layer 2 |
| DT-5: Annotation layer | Explicit consent required | Layer 3 |
| DT-6: Visualization | Explicit consent required | Layer 3 |

### 11.6 Synthetic Derivative Matrix

| Work ID | DT-1 | DT-2 | DT-3 | DT-4 | DT-5 | DT-6 |
|---|---|---|---|---|---|---|
| SW-001 | Consented | Consented (as part of F3) | Not consented | Implicit | Not consented | Not consented |
| SW-002 | Consented (performer only) | Not consented | Not consented | Implicit | Not consented | Not consented |
| SW-003 | Not consented | Not consented | Not consented | Implicit | Not consented | Not consented |
| SW-004 | Consented | Consented | Consented (F4) | Implicit | Consented | Consented |
| SW-005 | Suspended | Suspended | Suspended | Suspended | Suspended | Suspended |

---

## 12. Attribution Requirements

### 12.1 Attribution Principles

Every use of a contributed work — whether direct display, derivative generation, or citation — must include proper attribution to the creator. Attribution is a moral right that cannot be waived, transferred, or revoked (though its form can be modified by the creator per consent Layer 4).

### 12.2 Attribution Components

| Component | Required | Description |
|---|---|---|
| Creator name or pseudonym | Yes | As specified by the creator in consent Layer 4 |
| Work title | Yes | As specified in the consent record |
| Work type | Yes | From the work type taxonomy (WT-1 through WT-5) |
| Source statement | Yes | "Included in [Service Name] with creator consent" |
| Consent scope | Recommended | Brief description of what functions are consented |
| Community attribution | Where applicable | Community name and role, as specified in Layer 6 consent |
| Date of consent | Recommended | Date when consent was granted |
| Withdrawal status | If withdrawn | "Source withdrawn on [date]" |

### 12.3 Attribution Display Rules

| Context | Attribution Format |
|---|---|
| Direct display in service UI | Full attribution with all required components |
| Derivative output (summary, analysis) | Creator name + work title + "Derived from [work] by [creator], included with consent" |
| Citation in research output | Standard academic citation format + consent statement |
| Metadata in corpus listing | Creator name + work title + work type + consent status |
| Community-attributed work | Community name appears alongside individual creator name |
| Withdrawn work | "Source withdrawn on [date]" replaces active consent statement |

### 12.4 Attribution Modification

Creators may modify their attribution preferences at any time by updating consent Layer 4:

| Change | Effect |
|---|---|
| Switch from real name to pseudonym | All existing and future displays updated to pseudonym |
| Switch from pseudonym to anonymous | All existing and future displays updated to remove name; work identified by ID only |
| Add or change institutional affiliation | Future displays include affiliation |
| Request community attribution | Community name added to all future displays |

Attribution modifications are applied within 15 business days of the request.

### 12.5 Synthetic Attribution Examples

| Work ID | Attribution Display |
|---|---|
| SW-001 | "Crossing the Archipelago" by Author A. Included in [Service] with creator consent. Bilingual edition (Indonesian/English). Consent scope: F1, F2, F5. |
| SW-002 | "Seven Night Modes" composed by Composer B (estate of); performed by Performer C. Included in [Service] with consent of estate and performer. Consent scope: F1, F2 (estate), F1, F3 (performer). |
| SW-003 | "Manuscript Marginalia Series" by D-Artist [pseudonym]. Included in [Service] with creator consent. Consent scope: F1, F5. |
| SW-004 | "Annotated Merchant Records" annotated by Scholar E, [Institution]. Included in [Service] with creator consent. Underlying text: public domain. Consent scope: F1–F5. |
| SW-005 | "The Tide Keeper's Account" narrated by Speaker F, [Community G]. Speaker consent granted; community consent pending. NOT CURRENTLY IN SERVICE. |

---

## 13. Dispute Resolution Pathway

### 13.1 Dispute Types

| Type | Description | Example |
|---|---|---|
| D-1: Rights dispute | Disagreement about who holds what rights in a work | Two parties claim authorship of SW-002 |
| D-2: Consent dispute | Disagreement about whether consent was properly obtained or what it covers | Creator claims they consented to F1 only, service records show F1, F2, F5 |
| D-3: Attribution dispute | Disagreement about whether attribution is correct or sufficient | Creator requests pseudonym change; service fails to implement within timeframe |
| D-4: Compensation dispute | Disagreement about payment amounts, timing, or conditions | Creator claims derivative royalty was under-calculated |
| D-5: Withdrawal dispute | Disagreement about whether withdrawal was properly executed | Creator withdrew 6 months ago; work still appears in service |
| D-6: Derivative dispute | Disagreement about whether a derivative exceeds consented scope | Creator consented to summaries; service generated translations |
| D-7: Cultural dispute | Community objects to use of culturally significant material | Community G withdraws consent for SW-005; service had already generated derivatives |
| D-8: End user dispute | End user objects to service output or its use | Researcher publishes derivative analysis; creator objects to interpretation |

### 13.2 Resolution Pathway

```
+------------------+
| Dispute raised   |
| by any party     |
+--------+---------+
         |
         v
+------------------+     +------------------+
| Step 1: Internal |---->| Service operator |
| review           |     | reviews dispute  |
| (15 business     |     | and responds     |
|  days)           |     | in writing       |
+--------+---------+     +--------+---------+
         |                         |
         v                         v
+------------------+     +------------------+
| Dispute          |     | Dispute resolved |
| escalated?       |---->| Document         |
|                  |     | resolution       |
+--------+---------+     +------------------+
         |
         | No → Resolved
         |
         | Yes
         v
+------------------+     +------------------+
| Step 2: Mediated |---->| Independent      |
| review           |     | mediator reviews |
| (30 business     |     | and recommends   |
|  days)           |     | resolution       |
+--------+---------+     +--------+---------+
         |                         |
         v                         v
+------------------+     +------------------+
| Dispute          |     | Dispute resolved |
| escalated?       |---->| Document         |
|                  |     | resolution       |
+--------+---------+     +------------------+
         |
         | No → Resolved
         |
         | Yes
         v
+------------------+
| Step 3: Formal   |
| arbitration or   |
| legal proceedings|
| (as applicable)  |
+------------------+
```

### 13.3 Resolution Principles

| Principle | Description |
|---|---|
| P1: Creator-favoring | In cases of ambiguity, the interpretation that best protects creator rights prevails |
| P2: Transparent | All dispute proceedings and outcomes are documented (with privacy protections) |
| P3: Timely | Each step has a maximum timeframe; delays require written justification |
| P4: Accessible | Dispute process is available to all parties regardless of resources |
| P5: Non-retaliatory | Raising a dispute cannot result in penalty, reduced service, or consent pressure |

### 13.4 Dispute Escalation Contacts (Synthetic)

| Step | Contact | Role | Response Time |
|---|---|---|---|
| Step 1 | Service Operations Lead | Internal review | 15 business days |
| Step 2 | Independent Mediator (TBD) | Mediated review | 30 business days |
| Step 3 | Legal counsel (TBD) | Formal resolution | As required by jurisdiction |
| Cultural disputes | Community Liaison (TBD) | Cultural protocol guidance | 10 business days |
| Rights/finance review | Rights/Finance Reviewer (TBD) | Expert approval | Per review schedule |

---

## 14. Hypothetical Service Scenarios

### 14.1 Scenario 1: Institutional Corpus Preparation Service

**Description**: A university library consortium contracts with the service to prepare a research corpus of bilingual literary texts (WT-1) for cross-linguistic analysis.

**Participants**:
- 3 creators (Authors A, I, J — all synthetic) contributing 5 bilingual text works
- 1 institutional consortium (12 researchers)
- Service operator

**Consent profile**:
- All 3 creators grant Layer 2 consent for F1 (corpus preparation), F2 (cross-referencing), F5 (citation)
- 2 of 3 grant Layer 3 consent for DT-1 (summaries)
- All grant Layer 4 consent for full name attribution
- All grant Layer 5 consent for standard compensation

**Rights status**: All CLEAR.

**Payment flow**:
- Consortium pays $180/researcher/month × 12 researchers = $2,160/month
- Service compensates each creator $300/work/year × 5 works = $1,500/year
- Net operational margin: $2,160 × 12 − $1,500 = $24,420/year

**Risk assessment**: LOW. All rights clear, all consent obtained, standard work type, no cultural sensitivity concerns.

**Key question tested**: Can a standard corpus preparation service operate within the framework without rights ambiguity? **Answer**: Yes, provided all rights are CLEAR and consent is documented.

### 14.2 Scenario 2: Music Research Tooling Service

**Description**: A musicology research group uses the service to analyze a corpus of traditional melodies with original arrangements (WT-2).

**Participants**:
- 2 creators: Composer B's estate and Performer C (both synthetic)
- 1 research group (5 researchers)
- Service operator

**Consent profile**:
- Estate grants Layer 2 consent for F1, F2 (composition analysis)
- Performer C grants Layer 2 consent for F1, F3 (performance analysis)
- Estate grants Layer 3 consent for DT-2 (statistical analysis of composition)
- Performer C grants Layer 3 consent for DT-1 (summary of performance characteristics)
- Attribution: Composer name + performer name

**Rights status**: CLEAR for estate; CLEAR for performer. Consent scopes differ between the two rights holders.

**Payment flow**:
- Research group pays $150/researcher/month × 5 researchers = $750/month
- Service compensates estate $200/work/year and performer $200/work/year = $400/year
- Derivative royalty: 10% of any revenue from derivative outputs
- Net operational margin: $750 × 12 − $400 − royalties = $8,600/year (before royalties)

**Risk assessment**: MEDIUM. Multiple rights holders with different consent scopes create operational complexity. Service must ensure that functions are applied only to the extent each rights holder consented.

**Key question tested**: Can the framework handle works with multiple rights holders who have different consent scopes? **Answer**: Yes, but operational complexity increases. The service must implement function-level consent enforcement.

### 14.3 Scenario 3: Visual Art Corpus with Restricted Reproduction

**Description**: A digital humanities project creates a corpus of manuscript illustrations (WT-3) where the artist has consented to inclusion but not to image display.

**Participants**:
- 1 creator: Artist D (synthetic, using pseudonym)
- 1 historical society (reproduction license holder)
- 1 research institution (8 researchers)
- Service operator

**Consent profile**:
- Artist grants Layer 2 consent for F1 (corpus inclusion), F5 (citation) — NOT F2, F3, F4
- Historical society grants reproduction license for metadata-only display
- Artist grants Layer 4 consent for pseudonym attribution
- No Layer 3 consent (no derivatives)

**Rights status**: PARTIAL. Artist consented; historical society reproduction license covers metadata but not full image display in research outputs.

**Payment flow**:
- Institution pays $120/researcher/month × 8 researchers = $960/month
- Service compensates artist $200/work/year
- Historical society receives acknowledgment (no financial compensation — their contribution is a license, not a work)
- Net operational margin: $960 × 12 − $200 = $11,320/year

**Risk assessment**: MEDIUM. Restricted reproduction creates display limitations. Service must ensure that researchers cannot access full images, only metadata and citations.

**Key question tested**: Can the framework handle works where the creator consents to inclusion but not to display or derivative generation? **Answer**: Yes. The service operates in a metadata-only mode for this work, with citations and structural information available but no visual content.

### 14.4 Scenario 4: Scholarly Annotation Service

**Description**: A classics research consortium uses the service to access an annotated edition of a public-domain text (WT-4) with full function consent.

**Participants**:
- 1 creator: Annotator E (synthetic)
- 1 research consortium (15 researchers across 3 institutions)
- Service operator

**Consent profile**:
- Annotator grants Layer 2 consent for F1, F2, F3, F4, F5 (all functions)
- Annotator grants Layer 3 consent for all derivative types (DT-1 through DT-6)
- Annotator grants Layer 4 consent for full name + institutional affiliation
- Underlying text is public domain (no additional consent required)

**Rights status**: CLEAR. Single rights holder for annotations; public domain for base text.

**Payment flow**:
- Consortium pays $100/researcher/month × 15 researchers × 3 institutions = $4,500/month
- Service compensates annotator $500/work/year (higher rate for full-function consent)
- Derivative royalty: 10% of derivative revenue
- Net operational margin: $4,500 × 12 − $500 − royalties = $53,500/year (before royalties)

**Risk assessment**: LOW. Clear rights, single holder, full consent, public domain base text.

**Key question tested**: Can the framework handle a "full consent" scenario where all functions and derivatives are authorized? **Answer**: Yes. This is the simplest case and demonstrates the framework's upper bound of permissibility.

### 14.5 Scenario 5: Oral Tradition with Pending Community Consent

**Description**: A linguistic research project seeks to include a transcribed oral narrative (WT-5) in the service corpus, but community consent has not yet been obtained.

**Participants**:
- 1 creator: Speaker F (synthetic)
- 1 community: Community G (synthetic) — consent PENDING
- 1 transcriber: Transcriber H (synthetic) — rights on transcription format unresolved
- 1 research group (3 researchers)
- Service operator

**Consent profile**:
- Speaker F grants Layer 2 consent for F1, F2
- Community G consent: PENDING (not yet obtained)
- Transcriber H rights: UNRESOLVED (transcription formatting may carry independent copyright)
- Layer 3 consent: NOT GRANTED (no derivatives)
- Layer 6 consent: PENDING

**Rights status**: UNCLEAR. Community consent pending; transcriber rights unresolved. Work is SUSPENDED and cannot enter the service.

**Payment flow**:
- Research group pays $150/researcher/month × 3 researchers = $450/month (into escrow — not disbursed until rights are resolved)
- No creator compensation disbursed (work is suspended)
- If community consent is obtained: community benefit share of 15% of speaker compensation
- If transcriber rights are resolved: transcriber compensation for formatting contribution
- Net operational margin: $0 (work not active)

**Risk assessment**: HIGH. Multiple unresolved rights holders, community consent required, cultural sensitivity concerns.

**Key question tested**: Can the framework handle a scenario where consent is incomplete and the work cannot enter the service? **Answer**: Yes. The framework explicitly suspends the work, prevents any service function from operating on it, and holds payments in escrow until rights are resolved. If resolution is not achieved within 90 days, the work is permanently excluded from the current service scope.

### 14.6 Scenario Comparison Matrix

| Dimension | Scenario 1 (Corpus) | Scenario 2 (Music) | Scenario 3 (Visual Art) | Scenario 4 (Annotation) | Scenario 5 (Oral Tradition) |
|---|---|---|---|---|---|
| Work type | WT-1 | WT-2 | WT-3 | WT-4 | WT-5 |
| Rights status | CLEAR | CLEAR | PARTIAL | CLEAR | UNCLEAR |
| Consent completeness | Full | Full (split scopes) | Partial (no display) | Full | Incomplete |
| Functions active | F1, F2, F5 | F1, F2, F3 | F1, F5 | F1–F5 | None (suspended) |
| Derivatives active | DT-1 (2/3 creators) | DT-1, DT-2 | None | DT-1–DT-6 | None |
| Payment active | Yes | Yes | Yes | Yes | Escrow only |
| Risk level | LOW | MEDIUM | MEDIUM | LOW | HIGH |
| Service operational | Yes | Yes (with restrictions) | Yes (metadata only) | Yes | No (suspended) |

---

## 15. Scenario Walkthrough: Withdrawal Case

### 15.1 Scenario Setup

**Work**: SW-002 ("Seven Night Modes")
**Current state**: STAGE 3 (post-derivative — summaries and statistical analyses have been generated)
**Withdrawal trigger**: Performer C discovers that a derivative analysis misrepresents their performance style and requests withdrawal of their consent.

### 15.2 Timeline

| Day | Action | Actor |
|---|---|---|
| Day 0 | Performer C submits withdrawal request via service contact form | Performer C |
| Day 1 | Service acknowledges receipt and verifies identity | Service Operations |
| Day 2 | Service determines current stage (STAGE 3) and identifies affected derivatives | Service Operations |
| Day 3 | Service notifies Composer B's estate that performer consent is being withdrawn (estate consent remains active) | Service Operations |
| Day 5 | Service compiles inventory of all derivatives involving Performer C's contribution | Service Operations |
| Day 7 | Service presents withdrawal options to Performer C: (a) full withdrawal of all functions, (b) partial withdrawal of only the disputed derivative | Service Operations |
| Day 8 | Performer C chooses option (a): full withdrawal of their consent | Performer C |
| Day 10 | Service ceases all functions involving Performer C's contribution | Service Operations |
| Day 12 | Service removes Performer C's recording from active corpus | Service Operations |
| Day 15 | Service handles existing derivatives per §11.3: unpublished derivatives deleted; published derivatives flagged as "performer contribution withdrawn" | Service Operations |
| Day 20 | Service calculates final compensation: Performer C retains compensation for months 1–8; pro-rated compensation for month 9 (partial) | Service Finance |
| Day 25 | Final compensation paid to Performer C | Service Finance |
| Day 28 | Estate of Composer B notified that their consent remains active but the work can no longer be used with performer-related functions | Service Operations |
| Day 30 | Written confirmation sent to Performer C documenting all actions taken | Service Operations |

### 15.3 Outcome

- **Performer C's consent**: Fully withdrawn. All functions involving their contribution cease.
- **Estate's consent**: Remains active for composition-related functions only.
- **Existing derivatives**: Unpublished derivatives involving performer deleted. Published derivatives flagged.
- **Compensation**: Performer retains past compensation; no future payments.
- **Service impact**: The work remains in the service in a reduced capacity (composition analysis only, no performance analysis).
- **End user notification**: Researchers using the work are notified that performer contribution has been withdrawn and that certain analyses are no longer available.

### 15.4 Lessons Learned (Synthetic)

1. **Multi-rights-holder works create complex withdrawal scenarios.** When different rights holders have different consent scopes, withdrawal by one does not necessarily affect the other, but the service must carefully track which functions remain authorized.
2. **Derivative handling is the most operationally expensive part of withdrawal.** Deleting unpublished derivatives is straightforward; flagging published derivatives and notifying end users requires significant manual effort.
3. **The 30-day timeframe is achievable but tight.** Service operations must be prepared to execute withdrawal actions promptly.
4. **Estate notification is essential.** The remaining rights holder must understand how the withdrawal affects their work's participation in the service.

---

## 16. Scenario Walkthrough: Derivative Work Case

### 16.1 Scenario Setup

**Work**: SW-004 ("Annotated Merchant Records")
**Current state**: STAGE 3 (derivatives have been generated — summaries, translations, statistical analyses, visualizations)
**Trigger**: A researcher requests access to a translation (DT-3) of the annotated text. The annotator consented to F4 (translation assistance) and DT-3 (translation) in Layer 3.

### 16.2 Derivative Generation Process

| Step | Action | Actor | Consent Check |
|---|---|---|---|
| 1 | Researcher submits translation request via service tooling | End user | N/A |
| 2 | Service checks whether DT-3 is consented for SW-004 | Service system | Layer 3: YES — translation consented |
| 3 | Service checks whether F4 (translation assistance) is in Layer 2 consent | Service system | Layer 2: YES — F4 consented |
| 4 | Service generates translation using tooling | Service system | Operational license L4 active |
| 5 | Service attributes the translation: "Translated from [original] by [Service] tooling. Original annotation by Scholar E, [Institution]. Included with creator consent." | Service system | Attribution per §12 |
| 6 | Translation delivered to researcher | End user | Usage right R2 active |
| 7 | Derivative royalty calculated: 10% of any revenue attributable to this translation | Service finance | P4: Derivative royalty active |
| 8 | Royalty recorded for quarterly payment to Scholar E | Service finance | Compensation tracking |

### 16.3 Derivative Boundary Check

**What the derivative CAN do**:
- Present the annotated text in another language
- Include statistical analysis of translation patterns
- Be cited by the researcher in their publication

**What the derivative CANNOT do**:
- Reproduce the original annotation without attribution
- Be redistributed outside the service without permission
- Be used to create further derivatives (nested derivatives require separate consent)
- Be claimed as the researcher's original work

### 16.4 Dispute Scenario (Synthetic)

**Trigger**: Scholar E discovers that a researcher has published a paper that includes long excerpts from the translation, effectively reproducing the annotated text.

**Resolution pathway**:
1. Scholar E raises D-8 (end user dispute) per §13.
2. Step 1: Service Operations reviews the publication and confirms that the excerpts exceed fair use boundaries.
3. Service contacts the researcher and requests correction.
4. If researcher complies: Dispute resolved. Documentation filed.
5. If researcher does not comply: Step 2 — mediated review. Service explains citation/attribution boundaries.
6. If mediation fails: Step 3 — formal proceedings. Service supports Scholar E's rights claim.

**Outcome (synthetic)**: Researcher complies after Step 1. Excerpts reduced to proper citation length. Attribution maintained. Dispute documented.

### 16.5 Lessons Learned (Synthetic)

1. **Derivative generation is straightforward when consent is clear.** SW-004 has full consent for all functions and derivative types, so the translation request can be processed without additional approval steps.
2. **Derivative usage boundaries must be enforced.** The service cannot control what end users do with derivatives after receiving them, but it can set clear usage terms and respond to disputes.
3. **Nested derivatives require explicit consent.** If a researcher wants to create a derivative of a derivative, the service must check whether the original creator consented to that specific use.
4. **Attribution persists in all derivatives.** Even when a derivative is generated automatically, the creator's attribution must be included.

---

## 17. Scenario Walkthrough: Attribution Case

### 17.1 Scenario Setup

**Work**: SW-003 ("Manuscript Marginalia Series")
**Current state**: STAGE 2 (post-publication, pre-derivative)
**Trigger**: Artist D requests a change from pseudonym ("D-Artist") to real name attribution.

### 17.2 Attribution Modification Process

| Step | Action | Actor | Timeframe |
|---|---|---|---|
| 1 | Artist D submits attribution change request via service contact form | Creator | Day 0 |
| 2 | Service verifies identity and checks consent Layer 4 | Service Operations | Day 1 |
| 3 | Service confirms that Layer 4 allows modification at any time | Service Operations | Day 1 |
| 4 | Service updates attribution preference from pseudonym to real name | Service system | Day 2 |
| 5 | Service identifies all existing displays of the work with pseudonym attribution | Service Operations | Day 3 |
| 6 | Service updates all existing displays to use real name | Service system | Days 3–10 |
| 7 | Service notifies end users who have cited the work under pseudonym of the attribution change | Service Operations | Day 10 |
| 8 | Service confirms completion to Artist D | Service Operations | Day 15 |

### 17.3 Complication: Third-Party Citation

**Trigger**: A researcher has already published a paper citing the work under the pseudonym "D-Artist."

**Resolution**:
- The service cannot modify external publications.
- The service notifies the researcher of the attribution change and provides the correct real-name citation.
- The researcher may choose to publish a correction or erratum.
- The service records the notification for audit purposes.
- Future citations from the service will use the real name.

### 17.4 Complication: Anonymity Request

**Alternative scenario**: Artist D instead requests a change from pseudonym to fully anonymous (no name at all).

**Resolution**:
- Layer 4 permits this change.
- All displays updated to remove name; work identified by Work ID only.
- Third-party citations under pseudonym remain as-is (service cannot modify external publications).
- Future citations use anonymous format: "[Work ID] (anonymous creator). Included in [Service] with creator consent."

### 17.5 Lessons Learned (Synthetic)

1. **Attribution changes are always possible** because Layer 4 consent explicitly permits modification at any time.
2. **The 15-business-day implementation window** is achievable for service-controlled displays but cannot be enforced on external publications.
3. **Third-party citations are a permanent record.** The service can notify but not compel correction. This is a fundamental limitation of attribution rights in distributed research.
4. **Anonymity is a valid attribution choice.** The framework supports it, but researchers may prefer named attribution for citation purposes. The service should make the implications clear.

---

## 18. Scenario Walkthrough: Refund Case

### 18.1 Scenario Setup

**Work**: SW-001 ("Crossing the Archipelago")
**Current state**: STAGE 3 (derivatives generated — summaries and cross-references active)
**Trigger**: Author A discovers that the service has been generating DT-2 (statistical analysis) derivatives that were not explicitly consented to. Author A's Layer 3 consent specified "F3: summaries only" — statistical analysis was not included.

### 18.2 Refund and Remediation Process

| Step | Action | Actor | Timeframe |
|---|---|---|---|
| 1 | Author A raises D-6 (derivative dispute) per §13 | Creator | Day 0 |
| 2 | Service Operations reviews consent record and confirms: Layer 3 consent covers summaries only, not statistical analysis | Service Operations | Day 2 |
| 3 | Service confirms that DT-2 derivatives were generated in error (system bug or operator mistake) | Service Operations | Day 3 |
| 4 | Service immediately ceases generation of DT-2 derivatives for SW-001 | Service Operations | Day 3 |
| 5 | Service identifies all DT-2 derivatives already generated and distributed | Service Operations | Day 5 |
| 6 | Service deletes unpublished DT-2 derivatives | Service Operations | Day 7 |
| 7 | Service flags published DT-2 derivatives as "generated outside consent scope" and restricts access | Service Operations | Day 10 |
| 8 | Service notifies end users who received DT-2 derivatives of the consent scope error | Service Operations | Day 10 |
| 9 | Service calculates compensation adjustment: Author A is entitled to additional compensation for the period during which unconsented derivatives were generated | Service Finance | Day 12 |
| 10 | Additional compensation paid to Author A | Service Finance | Day 15 |
| 11 | Author A given option to: (a) continue participation with corrected consent scope, (b) withdraw consent entirely, (c) expand consent to include DT-2 with additional compensation | Service Operations | Day 15 |
| 12 | Author A chooses option (a): continue with corrected scope | Creator | Day 18 |
| 13 | Service documents the incident, resolution, and systemic fix | Service Operations | Day 20 |
| 14 | Written confirmation sent to Author A | Service Operations | Day 20 |

### 18.3 Refund Calculation (Synthetic)

| Component | Calculation | Amount |
|---|---|---|
| Base annual compensation | $300/work/year | $300 |
| Unconsented derivative period | 4 months (DT-2 generated for months 3–6) | — |
| Additional compensation (estimated) | 20% surcharge on pro-rated annual compensation for 4 months | $20 |
| Goodwill adjustment (disal error) | 10% of annual compensation | $30 |
| **Total adjusted compensation** | Base + additional + goodwill | **$350** |

### 18.4 Systemic Fix

The service implements the following preventive measures:

1. **Consent scope enforcement**: Service tooling checks Layer 3 consent before generating any derivative. If the derivative type is not consented, generation is blocked.
2. **Audit logging**: All derivative generation events are logged with consent verification status.
3. **Periodic consent audit**: Service Operations reviews a random sample of derivative generation events quarterly to verify consent compliance.
4. **Creator notification**: If a consent scope error is detected, the creator is notified within 48 hours.

### 18.5 Lessons Learned (Synthetic)

1. **Consent scope errors are the highest-risk operational failure.** Generating a derivative outside the consented scope is not just a technical error — it is a rights violation.
2. **Refund calculations must account for both the unauthorized period and the goodwill impact.** The creator's trust has been damaged; financial compensation alone does not restore it.
3. **Systemic fixes are more important than individual remediation.** The service must prevent recurrence, not just compensate for the current incident.
4. **The creator's choice to continue participation** after a consent error is a significant trust signal. The service must honor that trust with enhanced safeguards.

---

## 19. Unpaid Labor Prevention Measures

### 19.1 The Problem

Creator participation in a service requires labor: time spent understanding the service, preparing works for ingestion, reviewing consent terms, communicating with service operators, and monitoring service outputs. If this labor is not compensated, the service exploits creators — particularly those from economically disadvantaged communities.

### 19.2 Prevention Principles

| Principle | Description |
|---|---|
| PL-1: Compensation is mandatory | No creator participates without financial compensation or equivalent benefit |
| PL-2: Compensation is for labor, not rights | Payment acknowledges the creator's time and effort, not the value of their rights |
| PL-3: Compensation is transparent | The amount, basis, and schedule of compensation are clearly stated in consent Layer 5 |
| PL-4: Compensation is non-negotiable downward | The service cannot reduce compensation below the stated minimum without creator consent |
| PL-5: Compensation continues during withdrawal | A creator who withdraws consent retains all compensation earned up to the withdrawal date |
| PL-6: Community compensation is separate | Community benefit shares (P3) are additional to individual compensation, not substitutive |

### 19.3 Compensation Minimums (Synthetic)

| Work Type | Minimum First-Year Compensation | Minimum Annual Renewal | Basis |
|---|---|---|---|
| WT-1: Literary text | $200 | $100 | Standard complexity |
| WT-2: Musical composition | $300 | $150 | Multi-rights-holder complexity |
| WT-3: Visual artwork | $250 | $125 | Reproduction coordination |
| WT-4: Scholarly annotation | $350 | $175 | High expertise requirement |
| WT-5: Oral tradition transcript | $400 | $200 | Community consultation requirement |

**Note**: These figures are synthetic estimates for framework testing. Actual compensation would be determined by ethical pricing review (M48-03), cost-to-serve analysis (M48-06), and creator negotiation.

### 19.4 Non-Financial Compensation

In addition to financial payment, the service provides:

| Benefit | Description |
|---|---|
| Attribution visibility | Creator's name and work are visible to the research community |
| Research access | Creator receives complimentary access to service tooling |
| Derivative copies | Creator receives copies of all derivatives generated from their work |
| Impact reporting | Creator receives periodic reports on how their work is being used |
| Professional development | Service offers training on rights management, corpus preparation, and research tooling |

### 19.5 Unpaid Labor Detection

The service implements the following detection mechanisms:

| Check | Frequency | Action if Detected |
|---|---|---|
| Compensation audit: verify all active creators are receiving payment | Quarterly | Immediate payment correction + retroactive compensation |
| Consent review: verify all consented creators have compensation records | Monthly | Suspend service function until compensation is confirmed |
| Creator survey: ask creators whether they feel fairly compensated | Annually | Review and adjust compensation rates if majority report under-compensation |
| Community feedback: ask communities whether benefit shares are adequate | Annually | Adjust community benefit percentage |

### 19.6 Volunteer Exception

**Can creators volunteer their participation without compensation?**

The framework allows a narrow volunteer exception under strict conditions:

| Condition | Rationale |
|---|---|
| Creator must explicitly decline compensation in writing | Prevents implicit coercion |
| Creator must confirm understanding that they are providing labor without payment | Ensures informed decision |
| Service must document the volunteer declaration | Audit trail |
| Service must review volunteer declarations annually | Prevents drift into systematic unpaid labor |
| Volunteer creators retain all other rights (attribution, withdrawal, consent control) | Volunteering compensation does not mean volunteering rights |
| Community benefit share still applies even if individual declines compensation | Community recognition is not waivable by individual |

**Default position**: Compensation is mandatory. Volunteering is the exception, not the norm.

---

## 20. Cultural Appropriation Safeguards

### 20.1 The Problem

Cultural appropriation occurs when elements of one culture are used by members of another culture in ways that are disrespectful, exploitative, or divorced from their original cultural context. In the context of a paid research service, the risk is that culturally significant materials — oral traditions, traditional designs, sacred texts, community histories — are included in the service without adequate community consultation, cultural protocol compliance, or benefit sharing.

### 20.2 Safeguard Principles

| Principle | Description |
|---|---|
| SP-1: Individual consent is necessary but not sufficient | A creator may consent to participation, but if the work has cultural significance, community consent is also required |
| SP-2: Cultural protocols are defined by the community | The service does not determine what is culturally appropriate; the community does |
| SP-3: Cultural review precedes participation | No culturally significant work enters the service until cultural review is complete |
| SP-4: Community benefit is mandatory | Works with cultural significance must include a community benefit share |
| SP-5: Cultural withdrawal is absolute | If a community withdraws consent, the work is removed regardless of individual creator consent |
| SP-6: Context preservation is required | Culturally significant works must be presented with their cultural context, not decontextualized |
| SP-7: Cultural sensitivity training is mandatory for service operators | All service personnel must complete cultural sensitivity training before handling culturally significant works |

### 20.3 Cultural Significance Assessment

Before any work is accepted into the service, a cultural significance assessment is conducted:

| Assessment Question | If YES | If NO |
|---|---|---|
| Does the work originate from or represent a specific cultural community? | Proceed to community identification | No cultural assessment required |
| Does the work have ceremonial, sacred, or restricted cultural significance? | Work is EXCLUDED (EX-1) | Proceed to next question |
| Does the work have cultural significance that extends beyond the individual creator? | Community consent required (Layer 6) | Individual consent sufficient |
| Does the community have established cultural protocols for sharing this type of work? | Protocols must be followed | Service works with community to develop appropriate protocols |
| Would inclusion of this work in a commercial service be viewed as culturally inappropriate by the community? | Work is EXCLUDED (EX-5) | Proceed with consent process |

### 20.4 Community Consent Process

When community consent is required (Layer 6):

1. **Identify the community**: Determine which community or communities have cultural stakes in the work.
2. **Identify community representatives**: Determine who has authority to grant or withhold consent on behalf of the community.
3. **Present the service proposal**: Explain to the community what the service does, how the work would be used, what compensation is offered, and what withdrawal rights exist.
4. **Allow community deliberation**: The community decides according to its own processes and timelines. The service does not rush or pressure this decision.
5. **Document community consent or refusal**: The outcome is recorded regardless of the decision.
6. **If consent is granted**: Specify conditions, attribution preferences, benefit share arrangements, and cultural protocol requirements.
7. **If consent is refused**: The work is excluded from the service. No appeal. No alternative pathway.

### 20.5 Cultural Benefit Sharing

| Component | Description | Synthetic Range |
|---|---|---|
| Community benefit share (P3) | Annual payment to community organization or cultural fund | 10–20% of individual creator compensation |
| Cultural acknowledgment | Public recognition of the community's cultural stewardship | Included in all attribution displays |
| Community access | Complimentary service access for community members | Free access for up to 5 community researchers |
| Cultural protocol compliance | Service follows community-defined protocols for handling, displaying, and referencing the work | Operational requirement |
| Community review of outputs | Community has the right to review and request changes to how their cultural materials are presented | Annual review cycle |

### 20.6 Cultural Appropriation Red Flags

The following indicators suggest a risk of cultural appropriation that requires immediate review:

| Red Flag | Action |
|---|---|
| Creator is not a member of the community whose cultural material is being contributed | Suspend participation; verify community relationship |
| Community has not been consulted about the contribution | Suspend participation; initiate community consultation |
| The work is being used in a context that trivializes or misrepresents its cultural significance | Suspend the specific use; review with community |
| Compensation is offered to an individual but not to the community | Review benefit sharing arrangement |
| The creator cannot identify the community's cultural protocols for the material | Suspend participation; protocols must be established |
| External parties have previously objected to the use of similar materials from this community | Review objection history; consult with community |

### 20.7 Synthetic Cultural Assessment Examples

| Work ID | Cultural Significance | Community Identified | Community Consent | Status |
|---|---|---|---|---|
| SW-001 | Low — contemporary bilingual fiction | N/A | N/A | No cultural assessment required |
| SW-002 | Medium — traditional melodies with original arrangements | Community B (synthetic) identified | Granted with conditions | Active with cultural protocol compliance |
| SW-003 | Low-Medium — manuscript illustrations in traditional style | Community D (synthetic) identified | Not required (artist is community member, style is general) | Active |
| SW-004 | Low — scholarly annotation of public-domain historical text | N/A | N/A | No cultural assessment required |
| SW-005 | High — oral narrative from specific Pacific Islander community | Community G (synthetic) identified | PENDING | SUSPENDED until community consent obtained |

---

## 21. Contributor Comprehension Testing

### 21.1 Why Comprehension Matters

Informed consent is only valid if the consent-giver **understands** what they are consenting to. If a creator signs a consent form without understanding the implications for withdrawal, derivative works, or payment, the consent is ethically void even if it is legally valid.

### 21.2 Comprehension Testing Methodology

Adapted from M48-03's comprehension testing approach for pricing hypotheses:

**Phase 1: Pre-consent education**
- Creator receives an information package explaining the service in plain language
- Package covers: what the service does, what consent means, what rights are retained, what rights are licensed, how withdrawal works, how derivatives are handled, how compensation works, how disputes are resolved
- Package is available in the creator's preferred language (or with qualified translation)
- Creator is given at least 7 days to review the package before being asked to consent

**Phase 2: Comprehension assessment**
- Creator completes a structured questionnaire testing understanding of key concepts
- Questions are non-leading and scenario-based
- Minimum passing score: 80% (aligned with M48-03 threshold)
- If the creator does not pass, the service provides additional education and re-tests

**Phase 3: Ongoing comprehension verification**
- At each annual consent renewal, the creator completes a brief refresher assessment
- If the service introduces new functions or changes existing ones, affected creators complete a targeted comprehension check
- Creators can request a comprehension review at any time

### 21.3 Comprehension Questionnaire (Synthetic)

| # | Question | Correct Answer | Concept Tested |
|---|---|---|---|
| Q1 | If you consent to include your work in the service, does the service own your copyright? | No — you retain all copyright | Rights retention |
| Q2 | Can you remove your work from the service after consenting? | Yes — at any time, for any reason | Withdrawal right |
| Q3 | If the service generates a summary of your work, who owns the summary? | The service owns the summary as an operational output, but you retain attribution and your source rights | Derivative ownership |
| Q4 | If you withdraw your work, are existing summaries deleted immediately? | No — unpublished summaries are deleted; published summaries are flagged but not immediately deleted | Withdrawal stages |
| Q5 | Are you paid for participating in the service? | Yes — compensation is for your time and effort, not for rights transfer | Unpaid labor prevention |
| Q6 | If you disagree with how the service is using your work, what can you do? | Raise a dispute through the resolution pathway (§13) | Dispute resolution |
| Q7 | Does your consent allow the service to sell your original work to third parties? | No — the service cannot sell, sublicense, or transfer your source rights | License boundary |
| Q8 | If your work has cultural significance to a community, does the community also need to consent? | Yes — community consent (Layer 6) is required in addition to individual consent | Cultural safeguard |
| Q9 | Can the service change how your work is used without asking you? | No — any material changes require new consent | Consent specificity |
| Q10 | If you agreed to let the service create summaries, can it also create translations without asking? | No — each derivative type requires separate consent | Derivative consent specificity |

### 21.4 Synthetic Comprehension Results

| Creator Persona | Attempt | Score | Result | Action |
|---|---|---|---|---|
| Author A (SW-001) — experienced academic, high technical comfort | 1 | 100% | PASS | Consent accepted |
| Estate representative B (SW-002) — legal background, moderate technical comfort | 1 | 90% | PASS | Consent accepted |
| Artist D (SW-003) — visual artist, low technical comfort, prefers pseudonym | 1 | 70% | FAIL | Additional education provided |
| Artist D (SW-003) — re-test after education | 2 | 90% | PASS | Consent accepted |
| Annotator E (SW-004) — academic, high technical comfort | 1 | 100% | PASS | Consent accepted |
| Speaker F (SW-005) — community elder, moderate technical comfort, requires interpreter | 1 | 80% | PASS (borderline) | Consent accepted with enhanced support |
| Community G representative (SW-005) — cultural leader, low technical comfort | 1 | 60% | FAIL | Additional education provided; community consultation ongoing |

### 21.5 Comprehension Support Measures

| Measure | Description |
|---|---|
| Plain language summary | All consent materials are written at a reading level accessible to non-specialists |
| Multilingual availability | Materials are available in the creator's preferred language, with qualified translation |
| Visual aids | Diagrams and flowcharts explain complex concepts like derivative ownership and withdrawal stages |
| Interactive walkthrough | Service staff walk the creator through the consent process, answering questions in real time |
| Independent advisor | Creator may consult an independent advisor (legal, cultural, or technical) before consenting |
| Cooling-off period | Creator has 7 days after signing to change their mind without any consequence |
| Ongoing support | Creator can contact the service at any time with questions about their consent |

---

## 22. Service Cost Range Estimation

### 22.1 Methodology

This section estimates the cost range for operating the hypothetical rights-cleared service, drawing on the M48-06 cost-to-serve baseline and adding rights-specific cost components.

### 22.2 Cost Components

| Component | Low Estimate | Central Estimate | High Estimate | Basis |
|---|---|---|---|---|
| Infrastructure (hosting, storage, compute) | $48/month | $95/month | $143/month | M48-06 aggregate baseline |
| Consent management (administration, verification, renewal) | $100/month | $250/month | $500/month | Estimated from workflow complexity |
| Rights identification research | $200/month | $500/month | $1,000/month | Per-work research effort |
| Creator compensation (4 active works) | $104/month | $260/month | $417/month | §9.6 synthetic scenario |
| Community benefit shares | $10/month | $31/month | $63/month | 10–20% of creator compensation |
| Derivative royalty payments | $17/month | $42/month | $83/month | 5–15% of derivative revenue |
| Cultural review and protocol compliance | $50/month | $150/month | $300/month | Per-review effort |
| Dispute resolution administration | $25/month | $75/month | $150/month | Estimated from dispute frequency |
| Comprehension testing and education | $50/month | $125/month | $250/month | Per-creator education effort |
| Attribution management | $25/month | $63/month | $125/month | Ongoing display updates |
| Withdrawal processing | $42/month | $104/month | $208/month | Estimated from withdrawal frequency |
| Legal review (periodic) | $100/month | $250/month | $500/month | Amortized annual review cost |
| **Total monthly cost** | **$771** | **$1,945** | **$3,739** | Sum of components |
| **Total annual cost** | **$9,252** | **$23,340** | **$44,868** | Monthly × 12 |

### 22.3 Revenue Requirements

For the service to be financially sustainable, revenue must exceed costs:

| Scenario | Required Revenue (Central) | Break-Even Researchers (at $150/month each) | Break-Even Researchers (at $200/month each) |
|---|---|---|---|
| Low cost | $771/month | 6 researchers | 4 researchers |
| Central cost | $1,945/month | 13 researchers | 10 researchers |
| High cost | $3,739/month | 25 researchers | 19 researchers |

### 22.4 Cost Sensitivity

| Cost Driver | Sensitivity | Impact of ±25% Change |
|---|---|---|
| Rights identification research | High | ±$125–$250/month |
| Creator compensation | High | ±$65–$104/month |
| Legal review | Medium | ±$25–$125/month |
| Cultural review | Medium | ±$38–$75/month |
| Infrastructure | Low | ±$12–$36/month |

### 22.5 Comparison with M48-06 Baseline

| Metric | M48-06 (Institutional Research Workflow) | M48-08 (Rights-Cleared Service) | Ratio |
|---|---|---|---|
| Low monthly cost | $152 | $771 | 5.1× |
| Central monthly cost | $487 | $1,945 | 4.0× |
| High monthly cost | $1,549 | $3,739 | 2.4× |

The rights-cleared service costs 2.4–5.1× more than a basic institutional research workflow because of the additional overhead of consent management, rights identification, cultural review, creator compensation, and dispute resolution.

### 22.6 Affordability Assessment

| Question | Assessment |
|---|---|
| Can a single institution with 3 researchers afford the central cost? | At $200/researcher/month: revenue $600/month vs. cost $1,945/month — **NO, not sustainable** |
| Can a consortium with 15 researchers afford it? | At $150/researcher/month: revenue $2,250/month vs. cost $1,945/month — **Marginally yes** |
| Can a department with 25 researchers afford it? | At $150/researcher/month: revenue $3,750/month vs. cost $1,945/month — **Yes, with surplus** |
| Is the service viable at the low cost estimate? | At $150/researcher/month with 13 researchers: revenue $1,950/month vs. cost $771/month — **Yes** |

**Conclusion**: The service is financially viable only at institutional scale (10+ researchers) or with subsidized funding. Small-scale deployment is not financially sustainable without external support.

---

## 23. Rights/Finance Review Considerations

### 23.1 Review Scope

Before any implementation, the following areas require review by qualified rights/finance professionals:

| Review Area | Reviewer | Priority | Status |
|---|---|---|---|
| R-1: Copyright law compliance (jurisdiction-specific) | IP legal counsel | HIGH | UNKNOWN |
| R-2: Moral rights compliance (attribution, integrity) | IP legal counsel | HIGH | UNKNOWN |
| R-3: Community cultural rights recognition | Cultural rights expert | HIGH | UNKNOWN |
| R-4: Compensation structure compliance (labor law) | Employment/legal counsel | MEDIUM | UNKNOWN |
| R-5: Tax implications of creator compensation | Tax advisor | MEDIUM | UNKNOWN |
| R-6: Cross-border payment compliance | International trade counsel | MEDIUM | UNKNOWN |
| R-7: Derivative ownership enforceability | IP legal counsel | HIGH | UNKNOWN |
| R-8: Withdrawal mechanism legal validity | IP legal counsel | HIGH | UNKNOWN |
| R-9: Consent form legal sufficiency | IP legal counsel | HIGH | UNKNOWN |
| R-10: Dispute resolution pathway enforceability | Legal counsel / arbitrator | MEDIUM | UNKNOWN |
| R-11: Service cost estimate accuracy | Finance reviewer | MEDIUM | UNKNOWN |
| R-12: Revenue model sustainability | Finance reviewer | MEDIUM | UNKNOWN |
| R-13: Cultural benefit share adequacy | Cultural rights expert | HIGH | UNKNOWN |
| R-14: Unpaid labor risk assessment | Labor rights expert | HIGH | UNKNOWN |
| R-15: Insurance and liability coverage | Insurance/risk advisor | MEDIUM | UNKNOWN |

### 23.2 Review Triggers

Each review area has specific triggers that would require re-review:

| Review Area | Re-Review Trigger |
|---|---|
| R-1: Copyright compliance | Change in jurisdiction, new work types added, legal precedent change |
| R-2: Moral rights | Change in attribution policy, new derivative types introduced |
| R-3: Cultural rights | New community engaged, cultural protocol change, community complaint |
| R-4: Compensation | Change in compensation rates, new work types with different labor profiles |
| R-5: Tax | Change in tax jurisdiction, compensation structure change |
| R-6: Cross-border | New country involved in payment flow |
| R-7: Derivative ownership | New derivative types, change in derivative distribution model |
| R-8: Withdrawal | Change in withdrawal timeframes, new withdrawal stages identified |
| R-9: Consent form | Any change to consent layers or process |
| R-10: Dispute resolution | First dispute raised, change in resolution pathway |
| R-11: Cost estimate | Actual costs deviate from estimates by >20% |
| R-12: Revenue model | Actual revenue deviates from projections by >20% |
| R-13: Cultural benefit | Community feedback indicates benefit share is inadequate |
| R-14: Unpaid labor | Creator reports feeling uncompensated, volunteer exception used >3 times |
| R-15: Insurance | First liability claim, change in service scope |

### 23.3 Review Documentation Requirements

Each review must produce:

1. **Reviewer identity and qualifications**: Who conducted the review and their expertise.
2. **Scope of review**: What was reviewed and what was excluded.
3. **Findings**: Specific conclusions about compliance, adequacy, and risk.
4. **Recommendations**: Actions required before implementation can proceed.
5. **Conditions**: Ongoing conditions that must be maintained for the review to remain valid.
6. **Review date and expiry**: When the review was conducted and when it must be repeated.
7. **UNKNOWN items**: Areas where the reviewer could not reach a conclusion and further investigation is needed.

---

## 24. Risk Analysis

### 24.1 Risk Register

| ID | Risk | Likelihood | Impact | Rating | Mitigation |
|---|---|---|---|---|---|
| RISK-01 | Implied ownership: creator's participation is interpreted as transferring ownership | Medium | Very High | HIGH | Explicit consent layers (§7); license model (§8) separates operational license from ownership; comprehension testing (§21) |
| RISK-02 | Licensing confusion: creator does not understand what they are licensing | High | High | HIGH | Plain language consent forms; comprehension questionnaire (§21.3); independent advisor option; cooling-off period |
| RISK-03 | Unpaid labor: creator participates without adequate compensation | Medium | High | HIGH | Mandatory compensation (§19); compensation audit; volunteer exception with strict conditions; annual survey |
| RISK-04 | Cultural appropriation: culturally significant material included without proper community consent | Low | Very High | HIGH | Cultural significance assessment (§20.3); community consent requirement (Layer 6); cultural review before participation; red flag detection (§20.6) |
| RISK-05 | Withdrawal failure: service fails to execute withdrawal within required timeframe | Low | High | MEDIUM | Defined timeframes (§10.4); automated withdrawal workflow; audit logging; creator notification |
| RISK-06 | Derivative overreach: service generates derivatives beyond consented scope | Medium | High | HIGH | Consent scope enforcement (§18.4); audit logging; periodic consent audit; creator notification on error |
| RISK-07 | Attribution failure: service fails to properly attribute creator | Medium | Medium | MEDIUM | Attribution display rules (§12.3); modification process (§12.4); annual audit; creator self-service attribution management |
| RISK-08 | Dispute escalation: dispute cannot be resolved at Step 1 or Step 2 | Low | Medium | MEDIUM | Defined escalation pathway (§13.2); independent mediator; legal counsel availability; creator-favoring principle |
| RISK-09 | Consent record loss: consent documentation is lost or corrupted | Low | Very High | HIGH | Redundant storage; regular backup verification; audit trail; consent record persistence through withdrawal |
| RISK-10 | Rights holder identification error: wrong person identified as rights holder | Medium | Very High | HIGH | Multi-step identification protocol (§6.2); independent verification; documentation requirement; identification failure protocol (§6.4) |
| RISK-11 | Financial sustainability failure: service costs exceed revenue | High | High | HIGH | Cost range estimation (§22); affordability assessment; minimum researcher threshold; subsidy option |
| RISK-12 | Scope creep: service gradually expands beyond original consent boundaries | Medium | High | HIGH | Explicit consent layers; annual re-consent; comprehension re-testing; audit logging; creator notification of changes |
| RISK-13 | Community harm: service participation causes harm to the creator's community | Low | Very High | HIGH | Cultural safeguards (§20); community consent requirement; community benefit share; community withdrawal right; cultural sensitivity training |
| RISK-14 | Legal jurisdiction conflict: service operates across multiple legal jurisdictions with conflicting requirements | Medium | High | HIGH | Jurisdiction-specific legal review (R-1); cross-border payment compliance review (R-6); legal counsel retention |
| RISK-15 | Reputational damage: service is perceived as exploitative despite safeguards | Low | High | MEDIUM | Transparency reporting; creator satisfaction survey; public documentation of safeguards; independent review |

### 24.2 Risk Heat Map

```
                    IMPACT
              Low    Medium   High    Very High
           +------+------+-------+-------------+
    High   |      |      | R-11  | R-01, R-10  |
           |      |      |       | R-02, R-06  |
L          +------+------+-------+-------------+
I  Medium  |      | R-07 | R-12  | R-04, R-13  |
K          |      |      |       | R-09        |
E          +------+------+-------+-------------+
L  Low     |      | R-08 | R-05  |             |
I          |      |      |       |             |
H          +------+------+-------+-------------+
O
O
D
```

### 24.3 Risk Prioritization

**Immediate mitigation required (HIGH rating):**
- RISK-01: Implied ownership
- RISK-02: Licensing confusion
- RISK-03: Unpaid labor
- RISK-04: Cultural appropriation
- RISK-06: Derivative overreach
- RISK-09: Consent record loss
- RISK-10: Rights holder identification error
- RISK-13: Community harm

**Ongoing monitoring required (MEDIUM rating):**
- RISK-05: Withdrawal failure
- RISK-07: Attribution failure
- RISK-08: Dispute escalation
- RISK-11: Financial sustainability
- RISK-12: Scope creep
- RISK-14: Legal jurisdiction conflict
- RISK-15: Reputational damage

---

## 25. Metrics and Success Criteria

### 25.1 Primary Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| M1: Unresolved rights questions | 0 at service launch; <5% of works at any time | Rights status audit (§6.3) |
| M2: Creator comprehension pass rate | ≥80% on first attempt; 100% on re-test | Comprehension questionnaire (§21.3) |
| M3: Service cost range accuracy | Actual costs within ±25% of estimates | Quarterly financial review |
| M4: Consent completeness | 100% of active works have all required consent layers | Monthly consent audit |
| M5: Withdrawal execution time | 100% of withdrawals completed within §10.4 timeframes | Withdrawal process audit |
| M6: Derivative consent compliance | 100% of derivatives generated within consented scope | Quarterly derivative audit |
| M7: Attribution accuracy | 100% of displays use correct attribution per creator preference | Monthly attribution audit |
| M8: Dispute resolution time | 90% of disputes resolved at Step 1; 100% at Step 2 | Dispute tracking log |
| M9: Creator compensation timeliness | 100% of payments made within §9.6 timeframes | Financial audit |
| M10: Cultural protocol compliance | 100% of culturally significant works follow community protocols | Annual cultural review |

### 25.2 Secondary Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| M11: Creator satisfaction | ≥80% report feeling fairly treated | Annual creator survey |
| M12: Community satisfaction | ≥80% of communities report adequate benefit sharing | Annual community survey |
| M13: End user comprehension | ≥70% of end users understand attribution and usage boundaries | Annual end user survey |
| M14: Service financial sustainability | Revenue ≥ costs for 3 consecutive quarters | Quarterly financial review |
| M15: Volunteer exception frequency | ≤3 active volunteer declarations at any time | Compensation audit |
| M16: Consent renewal rate | ≥90% of creators renew consent at annual review | Consent tracking |
| M17: Withdrawal rate | <10% of works withdrawn per year | Withdrawal tracking |
| M18: Dispute frequency | <5 disputes per year per 100 active works | Dispute tracking |

### 25.3 Success Criteria for This Study

This study (M48-08) is considered successful if:

| Criterion | Status | Evidence |
|---|---|---|
| Every proposed service has identifiable rights | MET | §5 work types mapping; §6 identification methodology |
| Every proposed service has contributor choice | MET | §7 consent framework with 6 layers; §10 withdrawal rights |
| Every proposed service has payment obligation | MET | §9 payment mapping with 4 categories; §19 unpaid labor prevention |
| Every proposed service has dispute route | MET | §13 dispute resolution with 3 steps; 8 dispute types |
| Scenario walkthroughs completed | MET | §15 withdrawal; §16 derivative; §17 attribution; §18 refund |
| Cultural appropriation safeguards documented | MET | §20 with 7 principles, assessment protocol, red flags |
| Unpaid labor prevention measures specified | MET | §19 with 6 principles, minimums, detection mechanisms |
| Risk analysis completed | MET | §24 with 15 risks, heat map, prioritization |
| Metrics defined | MET | 18 metrics across primary and secondary categories |
| Limitations documented | MET | §26 |
| Deferred items identified | MET | §27 |
| No real content solicited | MET | All data synthetic; all personas fictional |
| BASELINE ESTABLISHED watermark applied | MET | Document header and conclusion |

---

## 26. Limitations and Caveats

### 26.1 Study Limitations

This study has the following inherent limitations that must be acknowledged:

**L1: Synthetic data only.** All personas, works, scenarios, and financial figures are synthetic. No real creators were consulted, no real rights were assessed, no real payments were modeled. The framework is untested against real-world conditions.

**L2: No legal advice.** This study does not constitute legal advice. Copyright law, moral rights, cultural rights, and labor law vary by jurisdiction. Every legal aspect of the framework requires qualified legal review before implementation.

**L3: No financial projections.** Cost estimates (§22) are synthetic ranges based on M48-06 analogies and hypothetical assumptions. Actual costs will differ. Revenue projections are not made — the study assesses viability, not profitability.

**L4: No technical implementation.** This study describes a conceptual framework, not a technical system. Implementation would require significant engineering work to build consent management, rights tracking, derivative generation controls, withdrawal workflows, and audit logging.

**L5: No creator engagement.** No real creators have been asked whether they would participate in such a service, whether the consent framework is comprehensible, or whether the compensation is adequate. Creator demand is assumed from M48-01 institutional demand, but creator willingness to participate is untested.

**L6: No community engagement.** No real communities have been consulted about whether the cultural safeguards (§20) are adequate or appropriate. Community consent processes are described conceptually but not tested.

**L7: Jurisdictional assumptions.** The framework assumes a single legal jurisdiction for simplicity. Real deployment would likely involve multiple jurisdictions with conflicting legal requirements.

**L8: Temporal limitations.** The framework does not address how rights, consent, and compensation evolve over long time periods (decades). Estate succession, community leadership changes, and legal evolution are not fully modeled.

**L9: Scale limitations.** The framework is designed for a small number of works (5 synthetic examples) and creators. Scaling to hundreds or thousands of works would require significant operational infrastructure not described here.

**L10: Derivative complexity.** The framework handles derivatives at a conceptual level. Real derivative generation (especially translations, statistical analyses, and visualizations) involves technical and interpretive complexities that may create unintended meaning changes not captured by the consent framework.

### 26.2 What This Study Cannot Resolve

| Question | Why It Cannot Be Resolved Here |
|---|---|
| Is the framework legally valid? | Requires jurisdiction-specific legal review |
| Will creators participate? | Requires real creator outreach and demand testing |
| Will communities consent? | Requires real community engagement |
| Is the compensation adequate? | Requires real creator and community feedback |
| Can the service be financially sustainable? | Requires real cost data and revenue evidence |
| Are the safeguards sufficient? | Requires real-world testing and independent audit |
| How do withdrawal mechanics work at scale? | Requires technical implementation and stress testing |
| What happens when rights are disputed? | Requires legal resolution, not conceptual framework |
| Can derivative outputs be trusted? | Requires quality assurance and expert review |
| Does the framework prevent all harm? | No framework can guarantee harm prevention |

### 26.3 Confidence Levels

| Component | Confidence | Basis |
|---|---|---|
| Consent framework structure | Medium | Based on published consent best practices; untested with real creators |
| License model | Medium | Based on standard IP licensing principles; legal review required |
| Payment model | Low | Synthetic estimates only; no real cost or revenue data |
| Withdrawal mechanism | Medium-High | Clear process design; operational complexity untested |
| Derivative handling | Medium | Conceptual framework; technical implementation challenges unexplored |
| Attribution system | High | Well-understood problem with standard solutions |
| Dispute resolution | Medium | Process design is clear; real-world effectiveness untested |
| Cultural safeguards | Low-Medium | Principles are sound; real community engagement required |
| Cost estimates | Low | Synthetic; ±41% uncertainty (per M48-06 methodology) |
| Risk assessment | Medium | Comprehensive identification; likelihood/impact estimates are judgmental |

---

## 27. Deferred Items Requiring Owner Action

### 27.1 Deferred Items Register

The following items are explicitly deferred and require owner action before the framework can move from baseline to implementation:

| ID | Deferred Item | Required Action | Owner | Priority | Dependency |
|---|---|---|---|---|---|
| D-01 | Legal review of consent framework | Engage IP legal counsel to review consent layers, license model, and withdrawal mechanism | Product/rights research owner | HIGH | R-1, R-2, R-7, R-8, R-9 |
| D-02 | Cultural rights expert review | Engage cultural rights expert to review safeguards and community consent process | Product/rights research owner | HIGH | R-3, R-13 |
| D-03 | Financial viability assessment | Engage finance reviewer to validate cost estimates and revenue model | Finance owner | MEDIUM | R-11, R-12 |
| D-04 | M17-06 license manifest integration | Complete M17-06 (license tracking) and integrate its manifests with the consent framework | M17 owner | HIGH | Upstream dependency |
| D-05 | M18-02 publication state integration | Complete M18-02 (publication state machine) and integrate its states with the withdrawal mechanism | M18 owner | HIGH | Upstream dependency |
| D-06 | M35-02 merchant/payment ownership | Complete M35-02 (merchant legal ownership) and integrate its payment infrastructure with the compensation model | M35 owner | HIGH | Upstream dependency |
| D-07 | Real creator outreach protocol | Develop and approve a protocol for engaging real creators (separate authorization required) | Product owner | MEDIUM | D-01, D-02 |
| D-08 | Real community engagement protocol | Develop and approve a protocol for engaging real communities (separate authorization required) | Product/rights research owner | MEDIUM | D-02 |
| D-09 | Technical system design | Design the technical architecture for consent management, rights tracking, and workflow automation | Architecture owner | MEDIUM | D-01 |
| D-10 | Insurance and liability assessment | Assess insurance needs and liability exposure for the service | Risk/finance owner | MEDIUM | R-15 |
| D-11 | Jurisdictional legal review | Determine which jurisdictions are relevant and obtain jurisdiction-specific legal advice | Legal counsel | HIGH | D-01 |
| D-12: Labor law compliance review | Verify that compensation structure complies with applicable labor laws | Legal counsel | HIGH | D-03 |
| D-13: Cross-border payment compliance | Determine compliance requirements for international payments | Legal/finance counsel | MEDIUM | D-06, D-11 |
| D-14: Creator demand testing | Test whether real creators would participate under the proposed framework | Product research owner | MEDIUM | D-07 |
| D-15: Community demand testing | Test whether real communities would engage with the proposed framework | Product/rights research owner | MEDIUM | D-08 |
| D-16: Pilot service design | Design a minimal pilot service for testing the framework with a small number of real works | Product/architecture owner | LOW | D-01 through D-15 |

### 27.2 No-Go Conditions

The following conditions, if identified during deferred reviews, would constitute a **no-go** for implementation:

| Condition | Implication |
|---|---|
| Legal review finds the consent framework is unenforceable in relevant jurisdictions | STOP — framework must be redesigned |
| Cultural rights expert finds safeguards are inadequate | STOP — safeguards must be strengthened before any culturally significant work is included |
| Financial review finds the service cannot be sustainably funded | STOP — funding model must be resolved before launch |
| Creator demand testing finds insufficient willingness to participate | STOP — service concept must be re-evaluated |
| M17-06 or M18-02 reveal incompatible rights/publication requirements | PAUSE — integration must be resolved before service design proceeds |
| Labor law review finds compensation structure non-compliant | STOP — structure must be redesigned |

### 27.3 Decision Record

**Current decision**: BASELINE ESTABLISHED. The framework is documented for review. No implementation is authorized. All deferred items require separate owner approval before proceeding.

**Decision date**: 2026-10-31
**Decision maker**: Product/rights research owner
**Next review**: After D-01 (legal review) and D-02 (cultural rights review) are completed

---

## 28. Conclusion: BASELINE ESTABLISHED

### 28.1 Study Summary

M48-08 has produced a comprehensive workflow/rights study for a hypothetical rights-cleared creator/research service model. The study:

- **Defines the service model** (§4): A paid tooling service that operates on creator-contributed works without purchasing or transferring source rights.
- **Maps work types** (§5): Five categories from literary text to oral tradition transcript, each with distinct rights complexity.
- **Establishes rights identification methodology** (§6): A four-step protocol for determining who holds what rights in each work.
- **Designs a creator consent framework** (§7): Six consent layers from general participation to cultural consent, each independently grantable and withdrawable.
- **Specifies a license model** (§8): Clear separation of what is licensed (operational rights), what is retained (source and moral rights), and what is excluded (commercial redistribution, sublicensing).
- **Maps payment obligations** (§9): Four payment categories ensuring creators are compensated, not charged, and that payment does not purchase rights.
- **Defines withdrawal rights** (§10): Five withdrawal stages from pre-ingestion to post-community-consent, each with specific effects and timeframes.
- **Establishes derivative work handling** (§11): Six derivative types with consent requirements, ownership rules, and disposition on withdrawal.
- **Sets attribution requirements** (§12): Mandatory attribution with creator-controlled display preferences and modification rights.
- **Designs a dispute resolution pathway** (§13): Three-step process from internal review to formal arbitration, with creator-favoring principles.
- **Tests five hypothetical scenarios** (§14): From straightforward corpus preparation to complex oral tradition with pending community consent.
- **Walks through four stress scenarios** (§15–§18): Withdrawal, derivative work, attribution, and refund cases.
- **Establishes unpaid labor prevention** (§19): Mandatory compensation, transparency, detection mechanisms, and a narrow volunteer exception.
- **Defines cultural appropriation safeguards** (§20): Seven principles, assessment protocol, community consent process, and red flag detection.
- **Tests contributor comprehension** (§21): Methodology adapted from M48-03 with a 10-question assessment and support measures.
- **Estimates service cost ranges** (§22): $771–$3,739/month depending on scale and scope; viable only at institutional scale (10+ researchers).
- **Flags rights/finance review considerations** (§23): Fifteen review areas with triggers and documentation requirements.
- **Analyzes risks** (§24): Fifteen risks with likelihood, impact, rating, and mitigation strategies.
- **Defines metrics** (§25): Eighteen primary and secondary metrics with targets and measurement methods.
- **Documents limitations** (§26): Ten study limitations and ten questions the study cannot resolve.
- **Identifies deferred items** (§27): Sixteen items requiring owner action before implementation, with six no-go conditions.

### 28.2 Acceptance Criteria Verification

| Criterion | Status | Evidence |
|---|---|---|
| Every proposed service has identifiable rights | **MET** | §5 work types; §6 identification methodology; §14.6 comparison matrix |
| Every proposed service has contributor choice | **MET** | §7 consent framework (6 layers); §10 withdrawal rights (5 stages) |
| Every proposed service has payment obligation | **MET** | §9 payment mapping (4 categories); §19 unpaid labor prevention |
| Every proposed service has dispute route | **MET** | §13 dispute resolution (3 steps); 8 dispute types defined |

### 28.3 Definition of Done Verification

| Requirement | Status | Evidence |
|---|---|---|
| Rights/finance reviewer approves | **DEFERRED** | Review considerations documented (§23); actual review requires owner action |
| No actual content solicited | **MET** | All data synthetic; all personas fictional; no real creators contacted |

### 28.4 Verification Plan Results

| Scenario | Result | Key Finding |
|---|---|---|
| Withdrawal walkthrough (§15) | **COMPLETED** | Multi-rights-holder withdrawal is the most operationally complex scenario; 30-day timeframe is achievable but tight |
| Derivative work walkthrough (§16) | **COMPLETED** | Derivative generation is straightforward when consent is clear; usage boundaries must be enforced |
| Attribution walkthrough (§17) | **COMPLETED** | Attribution changes are always possible but third-party citations cannot be retroactively modified |
| Refund walkthrough (§18) | **COMPLETED** | Consent scope errors are the highest-risk operational failure; systemic fixes are more important than individual remediation |

### 28.5 Closure Evidence

| Evidence Type | Status | Location |
|---|---|---|
| Workflow map | **COMPLETE** | §4 (service model), §7 (consent process), §10 (withdrawal process), §13 (dispute pathway) |
| Consented findings | **COMPLETE** | §14 (5 hypothetical scenarios), §15–§18 (4 walkthroughs) |
| Documented decision | **COMPLETE** | §27.3 (BASELINE ESTABLISHED; implementation deferred) |
| Risk register | **COMPLETE** | §24 (15 risks with mitigations) |
| Metrics framework | **COMPLETE** | §25 (18 metrics with targets) |
| Deferred items register | **COMPLETE** | §27 (16 items requiring owner action) |

### 28.6 Final Status

**BASELINE ESTABLISHED.**

This study is complete. The conceptual framework for a rights-cleared creator/research service model has been documented with:

- All acceptance criteria met
- All verification scenarios completed
- All risks identified and mitigated
- All limitations acknowledged
- All deferred items registered

No implementation is authorized. No real content has been solicited. No real rights have been transferred. No real payments have been modeled. The framework is a **study artifact** that makes the rights, consent, payment, and withdrawal questions visible and tractable for future owner review.

The next step — if the owner decides to proceed — is to engage qualified legal, cultural, financial, and creator review of the framework before any technical or operational implementation begins.

---

> **Document watermark:** CONCEPT — BASELINE ESTABLISHED — IMPLEMENTATION DEFERRED
>
> **Synthetic data disclaimer:** All personas (Author A, Composer B, Performer C, Artist D, Annotator E, Speaker F, Community G, Transcriber H), all works (SW-001 through SW-005), all financial figures, and all scenario outcomes in this document are entirely fictional. No real individuals, communities, works, or financial transactions are represented.
>
> **Not legal advice:** This document does not constitute legal, financial, intellectual property, or regulatory advice. All legal aspects require qualified professional review before any implementation.
>
> **No solicitation:** No real content has been solicited from any creator, community, or rights holder. This study is purely conceptual.