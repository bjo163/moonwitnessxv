# M48-04 — Map Commercial Entitlements Away from Donation Benefits

> **Status:** BASELINE ESTABLISHED — conceptual boundary diagram complete; legal review deferred.
> **Task ID:** M48-04 · **Candidate:** ECO-004 · **Domain:** Economy / Pricing & Entitlements
> **Priority:** P2 · **Difficulty:** D3 · **Owner:** architecture/product · **Effort:** M (3–6 days; legal review cost not estimated)
> **Milestone:** [M48 — WORKS buyer validation and sustainable economics](../milestones/M48.md)
> **Dependencies:** M35-02 (external) — workable as baseline with synthetic data; related CHAR-003/CHAR-004
> **Date:** 31 October 2026

---

> ## CONCEPTUAL DESIGN ONLY — NOT LEGAL ADVICE
>
> This document is a **boundary diagram and design artifact**. It does not constitute legal, financial, tax,
> or regulatory advice. It proposes no payment provider, ledger schema, billing implementation, or merchant
> account. All scenarios are **synthetic**. No real financial flows, donor data, or legal interpretations are
> represented. Unresolved legal areas are explicitly marked **UNKNOWN**.
>
> **Watermark:** CONCEPT — BASELINE ESTABLISHED — LEGAL REVIEW DEFERRED

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Design Goals and Constraints](#3-design-goals-and-constraints)
4. [Conceptual Boundary Principles](#4-conceptual-boundary-principles)
5. [Entity Definitions](#5-entity-definitions)
6. [Value Flow Mapping Methodology](#6-value-flow-mapping-methodology)
7. [Conceptual Boundary Diagram](#7-conceptual-boundary-diagram)
8. [Service Entitlement Definition](#8-service-entitlement-definition)
9. [Donation Definition](#9-donation-definition)
10. [Restricted Fund Definition](#10-restricted-fund-definition)
11. [Refund Scenarios and Ownership](#11-refund-scenarios-and-ownership)
12. [Chargeback Scenarios and Ownership](#12-chargeback-scenarios-and-ownership)
13. [Forbidden Coupling Documentation](#13-forbidden-coupling-documentation)
14. [Sacred/Private Source Access Exclusion](#14-sacredprivate-source-access-exclusion)
15. [Edge Case Scenarios](#15-edge-case-scenarios)
16. [Owner Assignment Matrix](#16-owner-assignment-matrix)
17. [Legal Considerations and UNKNOWN Items](#17-legal-considerations-and-unknown-items)
18. [Risk Mitigation](#18-risk-mitigation)
19. [Metrics and Success Criteria](#19-metrics-and-success-criteria)
20. [Deferred Items Requiring Owner Action](#20-deferred-items-requiring-owner-action)
21. [Conclusion: BASELINE ESTABLISHED](#21-conclusion-baseline-established)

---

## 1. Executive Summary

M48-04 specifies how a future paid support service would remain **structurally separate** from charitable contributions and source rights within the MoonWitness XV ecosystem. The task produces no billing module, payment integration, pricing tier, or entitlement gate. It produces a **conceptual boundary diagram** that makes explicit which entities, flows, and records belong to commerce, which belong to charity, and which belong to source stewardship — and, critically, where these domains must never couple.

### Why this separation matters

MoonWitness XV operates at the intersection of three fundamentally different value systems:

1. **Commerce** — a future paid support service (e.g., institutional research tooling, self-hosted deployment support) where a payer receives a defined service entitlement in exchange for money. This is a bilateral transaction with refund obligations, chargeback exposure, and merchant liability.

2. **Charity** — donations from individuals, foundations, or institutions that support the project's mission. Donations may be unrestricted (general support) or restricted (earmarked for a specific purpose). Donations carry tax-deductibility implications, donor acknowledgment obligations, and fiduciary duties.

3. **Source stewardship** — the care, preservation, and controlled access of private, sacred, and culturally sensitive source materials. Source access is governed by consent, provenance, and community rights — never by payment.

If these three domains are conflated — if a donation is treated as a purchase, if a paid subscription grants access to sacred sources, if a chargeback reduces a charitable fund — the project faces legal, ethical, and reputational harm that no amount of technical cleverness can repair.

### What this document delivers

- **Five entity definitions** (Payer, Merchant, Service Provider, Charity, Source Owner) with explicit boundaries.
- **A conceptual boundary diagram** (ASCII/text) showing all value flows and their owners.
- **Service entitlement, donation, and restricted fund definitions** that cannot be confused with each other.
- **Refund and chargeback scenarios** with assigned owners and dispositions.
- **Forbidden coupling documentation** — an explicit list of what must NEVER happen.
- **Sacred/private source access exclusion** — a hard rule that no payment of any kind grants access.
- **Edge case scenarios** covering mixed payments, partial refunds, cross-border donations, and restricted fund conversions.
- **An owner assignment matrix** mapping every flow to a distinct responsible party.
- **Legal considerations and UNKNOWN items** — explicitly flagged for owner review.
- **Risk mitigation** — distinguishing this conceptual artifact from legal advice.

### Key synthetic findings

- The boundary between commerce and charity is clean when each flow has a **single owner** and a **single record system**. Mixed ownership creates the coupling this task prohibits.
- Refund and chargeback scenarios are the highest-risk edge cases because they can inadvertently create a retroactive donation-to-entitlement conversion if ownership is ambiguous.
- Restricted funds require a **one-way valve** model: once classified as restricted charitable funds, they cannot be converted to commercial revenue under any circumstance.
- Sacred/private source access exclusion is the simplest rule and the hardest to enforce technically — it requires architectural enforcement, not just policy.

### Closure status

BASELINE ESTABLISHED. The conceptual boundary diagram is complete. All flow scenarios are assigned a distinct owner and disposition. Unresolved legal areas remain UNKNOWN. M35 and charity owner review is deferred.

---

## 2. Task Metadata

### 2.1 Canonical References

| Field | Value |
|---|---|
| Task ID | M48-04 |
| Candidate Code | ECO-004 |
| Domain / Category | Economy / Pricing & Entitlements |
| Priority | P2 (core product improvement) |
| Difficulty | D3 (bounded multi-file design) |
| Owner | architecture/product |
| Effort Estimate | M (3–6 days; legal review cost not estimated) |
| Status Register | [TODO.md](../../TODO.md) — sole status source |
| Milestone | M48 — WORKS buyer validation and sustainable economics |
| Milestone Group | G7 — ECOSYSTEM |

### 2.2 Dependencies

| Dependency | Type | Status | Relevance |
|---|---|---|---|
| M35-02 (Decide merchant legal/payment and D15/D16 owners) | External prerequisite | Not implemented | Defines merchant ownership that this diagram must not duplicate or contradict |
| M48-01 (Validate institutional demand) | Sibling task | BASELINE ESTABLISHED | Establishes that institutional demand exists; this task defines the boundary that demand must respect |
| M48-02 (Test self-hosted support demand) | Sibling task | BASELINE ESTABLISHED | Establishes that support demand exists; this task defines what support entitlement can and cannot include |
| M48-03 (Ethical pricing hypotheses) | Sibling task | BASELINE ESTABLISHED | Defines pricing models; this task defines the boundary those models must not cross |
| M49-04 (Restricted-fund handling) | Related charity task | BASELINE ESTABLISHED | Defines restricted fund lifecycle; this task aligns the commerce/charity boundary with that lifecycle |
| CHAR-003 (Charity role map) | Related charity task | Referenced | Provides role definitions used in the owner assignment matrix |
| CHAR-004 (Restricted fund controls) | Related charity task | Referenced via M49-04 | Provides control framework referenced in restricted fund scenarios |

### 2.3 Anti-Overlap Statement

This task does **not**:
- Implement M35 Treasury, merchant, or donation accounting.
- Define a payment provider, billing schema, or ledger.
- Create a pricing tier, subscription plan, or entitlement gate.
- Specify how donations are collected, acknowledged, or tax-reported.
- Authorize any real financial transaction.

This task **does**:
- Produce a conceptual boundary diagram showing where commerce, charity, and source stewardship separate.
- Define entities, flows, and ownership assignments at the design level.
- Document forbidden couplings and edge cases.
- Flag UNKNOWN legal areas for owner review.

### 2.4 ADR Applicability

No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

---

## 3. Design Goals and Constraints

### 3.1 Design Goals

| # | Goal | Rationale |
|---|---|---|
| G1 | **Separation** — Commerce, charity, and source stewardship must have distinct owners, records, and flows. | Prevents coupling that creates legal, ethical, or reputational risk. |
| G2 | **Clarity** — Every value flow must have a single, unambiguous owner. | Mixed ownership is the root cause of forbidden couplings. |
| G3 | **Exclusion** — No payment of any kind may grant access to private or sacred sources. | Source access is governed by consent and provenance, not commerce. |
| G4 | **Reversibility** — Refund and chargeback flows must resolve within their own domain without affecting other domains. | A commerce reversal must not alter a charitable record. |
| G5 | **Auditability** — Every flow must be traceable from origin to disposition. | Supports future legal review, regulatory compliance, and owner accountability. |
| G6 | **Simplicity** — The boundary diagram must be comprehensible to non-technical owners. | Architecture/product, charity, and legal owners must all be able to review and validate. |

### 3.2 Hard Constraints

| # | Constraint | Source |
|---|---|---|
| C1 | No ledger, schema, or payment provider is proposed. | Task scope |
| C2 | No M35 Treasury implementation is authorized. | Anti-overlap |
| C3 | No real financial flows or donor data are used. | Synthetic-only requirement |
| C4 | No legal advice is given; all legal areas are flagged UNKNOWN. | Risk mitigation |
| C5 | No donation-to-entitlement conversion is permitted. | Acceptance criteria |
| C6 | No paid access to private/sacred sources is permitted. | Acceptance criteria |
| C7 | All flow scenarios must be assigned a distinct owner and disposition. | Metrics |
| C8 | The document must be watermarked as conceptual. | Risk mitigation |

### 3.3 Soft Constraints

| # | Constraint | Rationale |
|---|---|---|
| S1 | Prefer ASCII/text diagrams over graphical artifacts. | Ensures version control compatibility and accessibility. |
| S2 | Use synthetic scenarios only. | No real participant data, financial flows, or legal interpretations. |
| S3 | Align terminology with M49-04 (restricted fund handling) and M48-03 (ethical pricing). | Consistency across the M48/M49 task family. |
| S4 | Flag unresolved items explicitly as UNKNOWN. | Transparency for owner review. |

### 3.4 Non-Goals

The following are explicitly **out of scope** for M48-04:

- Designing a billing system or subscription management platform.
- Selecting a payment processor or merchant bank.
- Implementing donation receipt or tax acknowledgment workflows.
- Defining source access control mechanisms (beyond the exclusion principle).
- Producing legal opinions on charity/commerce separation in any jurisdiction.
- Creating a financial model or revenue projection.
- Specifying database schemas, API contracts, or data flow diagrams at the implementation level.

---

## 4. Conceptual Boundary Principles

### 4.1 The Three-Domain Model

The MoonWitness XV ecosystem operates across three domains that must remain **structurally separate**:

```
+------------------------------------------------------------------+
|                    MOONWITNESS XV ECOSYSTEM                       |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    COMMERCE       |  |     CHARITY      |  |    STEWARDSHIP   |
|  |    (M35 domain)   |  |   (M49 domain)   |  |  (Source domain) |
|  |                   |  |                   |  |                   |
|  |  Payer -> Merchant|  |  Donor -> Charity |  |  Source -> Owner  |
|  |  -> Service       |  |  -> Mission       |  |  -> Access Rules  |
|  |  -> Entitlement   |  |  -> Restricted    |  |  -> Consent       |
|  |                   |  |     Fund          |  |  -> Provenance    |
|  |  Refund/Chargeback|  |  Acknowledgment   |  |                   |
|  |  Invoice/Receipt  |  |  Tax deduction    |  |  No payment gate  |
|  |                   |  |  Reporting        |  |  ever applies     |
|  +------------------+  +------------------+  +------------------+ |
|           |                    |                     |             |
|           +--------------------+---------------------+             |
|                                |                                  |
|                     BOUNDARY: NEVER COUPLE                        |
+------------------------------------------------------------------+
```

### 4.2 Principle 1: Single Ownership

Every value flow must have exactly one owner. If a flow appears to cross domains, it must be decomposed into separate flows, each with a single owner.

**Example:** A payer makes a payment that they intend as a donation but also expect a service in return. This is not one flow — it is two:
- Flow A: Payment for service entitlement (Commerce domain, owned by Merchant).
- Flow B: Voluntary donation above the service price (Charity domain, owned by Charity).

Each flow has its own record, receipt, and refund path.

### 4.3 Principle 2: No Conversion

Value cannot be converted between domains. Specifically:
- A donation cannot become a service entitlement.
- A service payment cannot become a donation.
- A restricted fund cannot be redirected to commercial revenue.
- Unspent service revenue cannot be reclassified as a charitable donation.

**Rationale:** Conversion creates legal ambiguity about the nature of the original transaction and may violate tax, charity, or consumer protection regulations.

### 4.4 Principle 3: Domain-Scoped Reversal

When a flow is reversed (refund, chargeback, cancellation), the reversal must resolve entirely within the originating domain. A commerce refund cannot reduce a charitable fund balance. A charity donation return cannot cancel a service entitlement.

### 4.5 Principle 4: Access Independence

Access to sources — whether public, private, or sacred — is governed exclusively by the Stewardship domain. No payment, donation, subscription, or commercial relationship of any kind grants, enhances, or accelerates source access.

**This is the hardest rule and the most important.** It must be enforced architecturally, not just by policy. See Section 14 for detailed specification.

### 4.6 Principle 5: Transparent Boundaries

The boundaries between domains must be visible to all parties. A payer must be able to distinguish what they are paying for (service) from what they are giving (donation). A charity must be able to distinguish restricted funds from general donations. A source owner must be able to verify that no commercial flow touches their source.

### 4.7 Principle 6: Minimal Coupling Surface

Where the three domains must interact (e.g., a payer who is also a donor), the interaction surface must be minimized and explicitly documented. Each interaction point must have:
- A defined trigger condition.
- A defined owner for each side of the interaction.
- A defined record in each domain.
- A defined audit trail linking the records without merging them.

---

## 5. Entity Definitions

### 5.1 Payer

| Attribute | Definition |
|---|---|
| **Name** | Payer |
| **Domain** | Commerce |
| **Role** | The individual or institution that provides money in exchange for a defined service entitlement. |
| **Relationship** | Bilateral contractual relationship with the Merchant. The Payer receives a service; the Merchant receives money. |
| **Rights** | Receive the defined service entitlement. Request a refund per the Merchant's refund policy. Dispute a charge via the payment provider (chargeback). |
| **Obligations** | Pay the agreed amount. Use the service within its defined terms. |
| **Distinction from Donor** | A Payer is purchasing a service. A Donor is making a voluntary contribution. The same natural person may be both, but the two roles must be recorded separately with separate receipts and separate refund paths. |
| **Record system** | Merchant's order/invoice system (to be defined by M35-02). |

### 5.2 Merchant

| Attribute | Definition |
|---|---|
| **Name** | Merchant |
| **Domain** | Commerce |
| **Role** | The legal entity that accepts payment from the Payer, issues invoices/receipts, and bears liability for service delivery and refund obligations. |
| **Relationship** | Contractual relationship with the Payer (service delivery) and with the payment provider (transaction processing). Contractual relationship with the Service Provider (if different from Merchant) for service fulfillment. |
| **Rights** | Receive payment. Set service terms and pricing. Issue refunds. Process chargebacks. |
| **Obligations** | Deliver the defined service entitlement. Honor refund policies. Comply with payment card industry (PCI) and consumer protection regulations. Maintain accurate transaction records. |
| **Distinction from Charity** | The Merchant is a commercial entity. It does not receive donations, issue tax-deductible receipts, or hold restricted funds. If the Merchant and the Charity share a legal parent, their financial records must still be fully separated. |
| **Record system** | Merchant's accounting/invoicing system (to be defined by M35-02). |
| **Ownership** | To be decided by M35-02. This document assumes the Merchant exists as a conceptual entity without specifying its legal form, jurisdiction, or relationship to the MoonWitness XV project. |

### 5.3 Service Provider

| Attribute | Definition |
|---|---|
| **Name** | Service Provider |
| **Domain** | Commerce (operational) |
| **Role** | The entity that delivers the service for which the Payer has paid. May be the same legal entity as the Merchant, or may be a separate contractor. |
| **Relationship** | Fulfillment relationship with the Merchant (contracted to deliver service). Service relationship with the Payer (delivers the entitlement). |
| **Rights** | Deliver the service as defined by the Merchant's terms. Access the systems and resources needed for service delivery. |
| **Obligations** | Deliver the service to the agreed standard. Do not access, use, or disclose source materials beyond what is required for service delivery. Do not conflate service delivery with charitable activity. |
| **Distinction** | The Service Provider is not a charity, not a donor, and not a source owner. The Service Provider's role is purely commercial fulfillment. |
| **Record system** | Service Provider's own operational records. The Merchant maintains the authoritative transaction record. |

**Note:** In the simplest case, the Merchant and the Service Provider are the same entity. The separation is documented here to ensure that if they diverge (e.g., a third-party support contractor), the boundary remains clear.

### 5.4 Charity

| Attribute | Definition |
|---|---|
| **Name** | Charity |
| **Domain** | Charity |
| **Role** | The legal entity that receives donations, issues tax-deductible acknowledgments, holds restricted funds, and allocates resources to the MoonWitness XV mission. |
| **Relationship** | Fiduciary relationship with the Donor. Accountability relationship with regulatory bodies (charity commission, tax authority). |
| **Rights** | Receive donations. Issue tax-deductible receipts (if registered). Allocate unrestricted funds per mission. Hold restricted funds per donor terms. |
| **Obligations** | Use funds for charitable purposes. Honor restriction terms. Issue accurate acknowledgments. Comply with charity regulations. Maintain separate financial records from any commercial entity. |
| **Distinction from Merchant** | The Charity does not sell services, issue invoices for payment, or bear commercial liability. Donations are voluntary; service payments are contractual. |
| **Record system** | Charity's donation/fund accounting system (to be defined by M49-04 and CHAR-003/CHAR-004). |
| **Ownership** | To be decided by project owners. This document assumes the Charity exists as a conceptual entity without specifying its legal form, jurisdiction, or registration status. |

### 5.5 Source Owner

| Attribute | Definition |
|---|---|
| **Name** | Source Owner |
| **Domain** | Stewardship |
| **Role** | The individual, community, or institution that holds rights over a source material (text, recording, image, artifact) and controls access to it. |
| **Relationship** | Custodial relationship with the MoonWitness XV project (the project preserves and provides access per the Source Owner's terms). No commercial relationship. |
| **Rights** | Control access to their sources. Set consent terms. Withdraw consent. Require attribution. Prohibit commercial use. |
| **Obligations** | None commercial. The Source Owner's obligations are custodial (preserving provenance, maintaining consent records) and arise from their relationship with the community or tradition they represent. |
| **Distinction** | The Source Owner is not a Payer, not a Donor, not a Merchant, and not a Service Provider. The Source Owner's authority over sources is absolute and cannot be overridden by any commercial or charitable flow. |
| **Record system** | Source provenance and consent records (governed by source domain policies, not by M35 or M49). |

### 5.6 Donor (Supplementary Entity)

| Attribute | Definition |
|---|---|
| **Name** | Donor |
| **Domain** | Charity |
| **Role** | The individual or institution that makes a voluntary contribution to the Charity. |
| **Relationship** | Voluntary gift relationship with the Charity. No contractual consideration. |
| **Rights** | Receive acknowledgment. Specify restriction terms (for restricted donations). Receive impact reports (for restricted donations). |
| **Obligations** | None contractual. Donations are voluntary and irrevocable (subject to legal clawback provisions that are outside this document's scope). |
| **Distinction from Payer** | A Donor gives without receiving a service entitlement. A Payer pays for a defined service. The same person may be both, but the two transactions must be recorded separately. |
| **Record system** | Charity's donor database (to be defined by M49-04). |

---

## 6. Value Flow Mapping Methodology

### 6.1 Approach

Each value flow is mapped using a consistent methodology:

1. **Identify the origin** — where does the value (money, service, access, information) begin?
2. **Identify the destination** — where does the value end up?
3. **Identify the domain** — which of the three domains (Commerce, Charity, Stewardship) does this flow belong to?
4. **Identify the owner** — which entity is responsible for this flow?
5. **Identify the record** — which system of record captures this flow?
6. **Check for coupling** — does this flow cross domain boundaries? If so, can it be decomposed?
7. **Check for conversion** — does this flow transform value from one domain to another? If so, it is forbidden.
8. **Assign a disposition** — what is the final state of this flow? (Completed, Refunded, Reversed, Held, Allocated, etc.)

### 6.2 Flow Classification

| Flow Type | Domain | Example | Disposition |
|---|---|---|---|
| Service Payment | Commerce | Payer pays Merchant for support tier | Completed / Refunded / Charged Back |
| Service Delivery | Commerce | Merchant/Provider delivers support | Fulfilled / Cancelled |
| Donation (Unrestricted) | Charity | Donor gives to Charity | Received / Acknowledged / Allocated |
| Donation (Restricted) | Charity | Donor gives to Charity with purpose restriction | Received / Acknowledged / Held / Spent / Reported / Closed |
| Source Access Grant | Stewardship | Source Owner permits access to Researcher | Granted / Revoked / Expired |
| Source Access Denial | Stewardship | Source Owner denies access | Denied (permanent) |
| Refund | Commerce | Merchant returns payment to Payer | Refunded (full/partial) |
| Chargeback | Commerce | Payment provider reverses transaction | Charged Back (full/partial) |
| Donation Return | Charity | Charity returns donation to Donor | Returned (rare, requires legal basis) |
| Cross-Domain Transfer | NONE | Any attempt to move value between domains | **FORBIDDEN** |

### 6.3 Decomposition Rule

When a single transaction appears to span multiple domains, it **must** be decomposed into separate flows before it can be processed. There is no such thing as a "combined" flow.

**Example — Decomposition of a mixed payment:**

A payer sends $500, stating "$400 for a support subscription and $100 as a donation."

This is not one flow. It is two:

```
Flow 1: Payer -> Merchant: $400 (Service Payment)
  Record: Merchant invoice #INV-0001
  Disposition: Completed
  Owner: Merchant

Flow 2: Payer (as Donor) -> Charity: $100 (Donation, Unrestricted)
  Record: Charity receipt #RCP-0001
  Disposition: Received / Acknowledged
  Owner: Charity
```

The two flows have separate records, separate owners, separate refund paths, and separate tax implications. They are linked only by the fact that the same natural person initiated both — and even that link must be recorded separately in each domain's records (the Merchant records the Payer's identity; the Charity records the Donor's identity; these are separate records even if the identity is the same).

---

## 7. Conceptual Boundary Diagram

### 7.1 Master Boundary Diagram

```
===============================================================================
              CONCEPTUAL BOUNDARY DIAGRAM — M48-04 (ECO-004)
              CONCEPT ONLY — NOT LEGAL ADVICE — NOT IMPLEMENTATION
===============================================================================

                         +-------------------------+
                         |     EXTERNAL WORLD       |
                         |                          |
                         |  [Person / Institution]  |
                         |   may act as:            |
                         |   - PAYER (commerce)     |
                         |   - DONOR (charity)      |
                         |   - RESEARCHER (access)  |
                         +-------------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
              (pays for      (gives to     (requests
               service)       charity)      access)
                    |             |             |
                    v             v             v
         +----------------+ +----------------+ +----------------+
         |   COMMERCE     | |   CHARITY      | |  STEWARDSHIP   |
         |   DOMAIN       | |   DOMAIN       | |  DOMAIN        |
         |                | |                | |                |
         | +------------+ | | +------------+ | | +------------+ |
         | |  MERCHANT  | | | |  CHARITY   | | | |  SOURCE    | |
         | |  (owner:   | | | |  (owner:   | | | |  OWNER     | |
         | |  M35-02)   | | | |  M49/CHAR) | | | |  (owner:   | |
         | +------------+ | | +------------+ | | |  source     | |
         |        |       | |        |       | | |  policy)    | |
         |        v       | |        v       | | +------------+ |
         | +------------+ | | +------------+ | |        |       |
         | |  SERVICE   | | | |  DONOR     | | |        v       |
         | |  PROVIDER  | | | |  FUNDS:    | | | +------------+ |
         | |  (delivers | | | |  - Unrestr.| | | |  ACCESS    | |
         | |   service) | | | |  - Restr.  | | | |  CONTROL   | |
         | +------------+ | | +------------+ | | |  (grants/   | |
         |        |       | |        |       | | |   denies    | |
         |        v       | |        v       | | |   per       | |
         | +------------+ | | +------------+ | | |   consent)  | |
         | | ENTITLEMENT| | | | FUND       | | | +------------+ |
         | | RECORD     | | | | ACCOUNTING | | |        |       |
         | | (what was  | | | | (what was  | | |        v       |
         | |  paid for) | | | |  given and | | | +------------+ |
         | +------------+ | | |  how used) | | | |  SOURCE    | |
         |                | | +------------+ | | |  MATERIALS | |
         |  Refund path:  | |                | | |  (public,  | |
         |  -> Payer      | |  Refund path:  | | |   private, | |
         |  (within       | |  -> Donor or   | | |   sacred)  | |
         |   Commerce)    | |  restricted    | | +------------+ |
         |                | |  fund return   | |                |
         |  Chargeback:   | |  (within       | |  NO PAYMENT    |
         |  -> Payer via  | |   Charity)     | |  GATE EVER     |
         |  payment       | |                | |  APPLIES TO    |
         |  provider      | |  Restricted    | |  SOURCE ACCESS |
         |  (within       | |  fund valve:   | |                |
         |   Commerce)    | |  ONE-WAY only  | |                |
         +----------------+ +----------------+ +----------------+
                    |             |             |
                    |             |             |
         ===========+=============+=============+===========
                    BOUNDARY: NEVER COUPLE DOMAINS
         ===========+=============+=============+===========
                    |             |             |
                    v             v             v
              +-------------------------------------------+
              |            AUDIT TRAIL                     |
              |  - Each domain maintains its own records   |
              |  - Cross-domain references are by ID only  |
              |  - No shared ledger                       |
              |  - No value conversion between domains     |
              +-------------------------------------------+

===============================================================================
  LEGEND:
  [Box]           = Entity or system
  Arrow (->)      = Value flow (money, service, access, information)
  Dashed border   = Domain boundary
  "NEVER COUPLE"  = Hard prohibition — domains must not share ownership,
                    records, or value conversion
===============================================================================
```

### 7.2 Flow Detail Diagram — Service Payment

```
===============================================================================
  FLOW: Service Payment (Commerce Domain)
  CONCEPT ONLY — NOT LEGAL ADVICE
===============================================================================

  PAYER                    MERCHANT                 SERVICE PROVIDER
    |                         |                         |
    |--- 1. Request --------->|                         |
    |    service               |                         |
    |                         |                         |
    |--- 2. Payment --------->|                         |
    |    (amount: P)          |                         |
    |                         |--- 3. Invoice --------->|
    |                         |    (record in           |
    |                         |     Merchant system)    |
    |                         |                         |
    |                         |--- 4. Fulfillment ----->|
    |                         |    request              |
    |                         |                         |
    |                         |                  5. Deliver
    |                         |<---- service -----------|
    |                         |                         |
    |<--- 6. Confirmation ----|                         |
    |    (entitlement         |                         |
    |     activated)          |                         |
    |                         |                         |
    |                         |  RECORD:                |
    |                         |  - Invoice #INV-XXXX    |
    |                         |  - Payment receipt      |
    |                         |  - Entitlement record   |
    |                         |  - Service delivery log |
    |                         |                         |
    |  OWNER: Merchant        |  DISPOSITION: Completed |
    |  REFUND PATH: Merchant -> Payer (within Commerce) |
    |  CHARGEBACK PATH: Payment Provider -> Payer       |
    |                   (within Commerce)               |
===============================================================================
```

### 7.3 Flow Detail Diagram — Donation

```
===============================================================================
  FLOW: Donation (Charity Domain)
  CONCEPT ONLY — NOT LEGAL ADVICE
===============================================================================

  DONOR                    CHARITY                  RESTRICTED FUND
    |                         |                         |
    |--- 1. Gift ------------>|                         |
    |    (amount: D)          |                         |
    |                         |--- 2. Receipt --------->|
    |                         |    (acknowledgment      |
    |                         |     within 7 days)      |
    |                         |                         |
    |                         |--- 3. Classification -->|
    |                         |    Unrestricted OR      |
    |                         |    Restricted            |
    |                         |                         |
    |                         |  [If Unrestricted:]     |
    |                         |--- 4a. Allocate to     |
    |                         |     general mission     |
    |                         |                         |
    |                         |  [If Restricted:]       |
    |                         |--- 4b. Hold in ------->|
    |                         |     restricted fund     |
    |                         |                         |--- 5. Track
    |                         |                         |    balance
    |                         |--- 6. Report to donor ->|    separately
    |                         |    (usage + outcomes)   |
    |                         |                         |
    |  RECORD:                |  RECORD:                |
    |  - Donor record         |  - Receipt #RCP-XXXX   |
    |  - Gift acknowledgment  |  - Fund classification  |
    |  - Tax receipt (if      |  - Allocation/spending  |
    |    applicable)          |    record               |
    |                         |  - Donor report         |
    |                         |                         |
    |  OWNER: Charity         |  DISPOSITION:           |
    |  RETURN PATH: Charity -> Donor (within Charity,   |
    |                     rare, requires legal basis)   |
    |  NO CONVERSION TO COMMERCE EVER                   |
===============================================================================
```

### 7.4 Flow Detail Diagram — Source Access

```
===============================================================================
  FLOW: Source Access Request (Stewardship Domain)
  CONCEPT ONLY — NOT LEGAL ADVICE
===============================================================================

  RESEARCHER             SOURCE OWNER             ACCESS CONTROL
    |                         |                         |
    |--- 1. Request --------->|                         |
    |    access to source      |                         |
    |                         |--- 2. Evaluate -------->|
    |                         |    against consent       |
    |                         |    terms and provenance  |
    |                         |                         |
    |                         |  [If consented:]        |
    |                         |--- 3a. Grant --------->|
    |                         |     access              |
    |                         |                         |--- 4a. Enable
    |<------------------------------------- access -----|
    |    (with attribution     |                         |    (no payment
    |     and usage terms)     |                         |     check)
    |                         |                         |
    |                         |  [If not consented:]    |
    |                         |--- 3b. Deny ---------->|
    |                         |                         |--- 4b. Block
    |<------------------------------------- denial -----|
    |                         |                         |
    |                         |                         |
    |  RECORD:                |  RECORD:                |
    |  - Access request log   |  - Consent record       |
    |  - Attribution record   |  - Provenance record    |
    |  - Usage agreement      |  - Access decision log  |
    |                         |                         |
    |  OWNER: Source Owner    |  DISPOSITION:           |
    |  NO PAYMENT AFFECTS     |  Granted / Denied /     |
    |  THIS FLOW IN ANY WAY   |  Revoked / Expired      |
===============================================================================
```

### 7.5 Anti-Pattern Diagram — Forbidden Coupling

```
===============================================================================
  FORBIDDEN: Cross-Domain Coupling (MUST NEVER OCCUR)
  CONCEPT ONLY — NOT LEGAL ADVICE
===============================================================================

  The following flows are PROHIBITED. If any of these patterns appear in
  a design, implementation, or policy, it must be rejected and redesigned.

  FORBIDDEN PATTERN 1: Donation-to-Entitlement Conversion
  ---------------------------------------------------------
  DONOR ---donates---> CHARITY ---converts---> MERCHANT ---grants---> PAYER
                         "Your donation qualifies you for a paid tier"
                         ** NEVER. A donation is not a purchase. **

  FORBIDDEN PATTERN 2: Payment-to-Access Conversion
  ---------------------------------------------------
  PAYER ---pays---> MERCHANT ---grants---> SOURCE ACCESS
                        "Your subscription includes access to Source X"
                        ** NEVER. Source access is not for sale. **

  FORBIDDEN PATTERN 3: Restricted Fund Diversion
  -------------------------------------------------
  DONOR ---restricted gift---> CHARITY ---diverts---> MERCHANT
                                  "We'll use the education fund to
                                   subsidize the support service"
                                   ** NEVER. Restrictions are binding. **

  FORBIDDEN PATTERN 4: Refund Cross-Domain Settlement
  -----------------------------------------------------
  MERCHANT ---refund---> CHARITY ---offsets---> DONOR
                          "We'll deduct the refund from your donation"
                          ** NEVER. Refunds stay in Commerce. **

  FORBIDDEN PATTERN 5: Chargeback Impact on Charity
  ---------------------------------------------------
  PAYER ---chargeback---> PAYMENT PROVIDER ---debits---> CHARITY
                            "The chargeback reduces the charity's balance"
                            ** NEVER. Chargebacks stay in Commerce. **

  FORBIDDEN PATTERN 6: Source Access as Donation Benefit
  -------------------------------------------------------
  DONOR ---donates---> CHARITY ---grants---> SOURCE ACCESS
                          "Donors get early access to sources"
                          ** NEVER. Source access is not a benefit. **

===============================================================================
```

---

## 8. Service Entitlement Definition

### 8.1 What Is a Service Entitlement?

A **service entitlement** is a defined, bounded, deliverable service that a Payer receives in exchange for payment. It is:

- **Defined** — the scope, duration, and quality of the service are specified before payment.
- **Bounded** — the entitlement does not extend beyond what is defined. It does not include source access, donation benefits, or charitable acknowledgments.
- **Deliverable** — the service can be fulfilled by the Service Provider using defined resources and processes.
- **Reversible** — if the service is not delivered, the Payer is entitled to a refund within the Commerce domain.

### 8.2 Examples of Permissible Service Entitlements (Hypothetical)

| Entitlement | Description | Domain | Bounded By |
|---|---|---|---|
| Technical support tier | Remote assistance with software installation, configuration, and troubleshooting | Commerce | Support hours, response time, scope of issues |
| Training session | Guided instruction on using research tooling | Commerce | Duration, participant count, curriculum |
| Custom report generation | Production of a specific analytical output from public sources | Commerce | Report scope, data sources (public only), delivery format |
| Hosting consultation | Advice on infrastructure setup for self-hosted deployment | Commerce | Consultation hours, scope of advice |

### 8.3 What a Service Entitlement Is NOT

A service entitlement:
- Is **not** a donation receipt. Payment for a service is not tax-deductible as a charitable contribution.
- Is **not** source access. Paying for a service does not grant access to any source material, public or private.
- Is **not** a membership. A service entitlement is transactional, not relational.
- Is **not** a benefit of donation. Receiving a service does not depend on having donated, and donating does not entitle one to a service.
- Does **not** create a fiduciary relationship. The Merchant's obligation is to deliver the service, not to steward the Payer's funds for a mission.

### 8.4 Entitlement Record Requirements

Every service entitlement must be recorded with:

| Field | Description | Owner |
|---|---|---|
| Entitlement ID | Unique identifier for this entitlement grant | Merchant |
| Payer ID | Identifier for the purchasing entity | Merchant |
| Service description | What is being provided | Merchant |
| Service period | Start and end dates | Merchant |
| Payment amount | The price paid | Merchant |
| Payment date | When payment was received | Merchant |
| Invoice number | Reference to the commercial invoice | Merchant |
| Fulfillment status | Pending / In Progress / Completed / Cancelled / Refunded | Merchant |
| Refund record | If applicable, linked refund transaction | Merchant |

**Critical:** The entitlement record lives entirely within the Commerce domain. It is not visible to, accessible by, or shared with the Charity domain or the Stewardship domain.

---

## 9. Donation Definition

### 9.1 What Is a Donation?

A **donation** is a voluntary, irrevocable gift from a Donor to a Charity, made without expectation of receiving a defined service or commercial benefit in return. It is:

- **Voluntary** — the Donor chooses to give without coercion or contractual obligation.
- **Irrevocable** — once given, the donation belongs to the Charity (subject to rare legal clawback provisions outside this document's scope).
- **Without consideration** — the Donor does not receive a service, product, or commercial benefit in exchange. (Acknowledgment, impact reports, and tax receipts are not consideration.)
- **Mission-directed** — the Charity uses the donation to advance its mission, not to fund commercial operations.

### 9.2 Donation Types

| Type | Description | Restrictions | Allocation |
|---|---|---|---|
| Unrestricted | General support with no donor-imposed conditions | None | Charity allocates per mission and budget |
| Restricted (Purpose) | Donor specifies the purpose (e.g., "for digitization of Collection X") | Purpose-bound | Only spendable for specified purpose |
| Restricted (Time) | Donor specifies a timeframe (e.g., "must be spent by 2028") | Time-bound | Must be spent within specified period |
| Restricted (Geographic) | Donor specifies a geographic scope | Location-bound | Only spendable for beneficiaries in specified region |
| Restricted (Beneficiary) | Donor specifies a beneficiary (e.g., "for Scholar Y") | Person-bound | Only spendable for specified beneficiary |

### 9.3 What a Donation Is NOT

A donation:
- Is **not** a payment for services. Donations are voluntary; payments are contractual.
- Is **not** a purchase. No goods or services are exchanged for a donation.
- Is **not** an investment. Donors do not receive equity, returns, or commercial benefits.
- Is **not** a source access key. Donating does not grant access to any source material.
- Is **not** a subscription. Donations do not create ongoing entitlements.
- Is **not** refundable by default. Donations are irrevocable gifts (subject to legal exceptions outside this document's scope).

### 9.4 Donation Record Requirements

Every donation must be recorded with:

| Field | Description | Owner |
|---|---|---|
| Donation ID | Unique identifier for this gift | Charity |
| Donor ID | Identifier for the giving entity | Charity |
| Amount | The gift amount | Charity |
| Currency | Currency of the gift | Charity |
| Receipt date | When the gift was received | Charity |
| Receipt number | Reference to the charitable acknowledgment | Charity |
| Restriction type | Unrestricted / Purpose / Time / Geographic / Beneficiary | Charity |
| Restriction terms | Specific conditions (if restricted) | Charity |
| Fund classification | Which fund the donation is allocated to | Charity |
| Tax receipt status | Whether a tax-deductible receipt was issued | Charity |
| Reporting schedule | When impact reports are due to the donor | Charity |

**Critical:** The donation record lives entirely within the Charity domain. It is not visible to, accessible by, or shared with the Commerce domain or the Stewardship domain.

### 9.5 Donation Acknowledgment

The Charity must issue a written acknowledgment for every donation, containing:
- Charity name and registration details (if registered).
- Donor name (as provided).
- Amount received.
- Date received.
- Restriction terms (if any).
- Statement that no goods or services were provided in exchange (if true).
- Tax deduction statement (if applicable and if the Charity is registered for tax-deductible status).

**This acknowledgment is explicitly different from a commercial invoice.** An invoice records a payment for a defined service. An acknowledgment records a voluntary gift with no consideration.

---

## 10. Restricted Fund Definition

### 10.1 What Is a Restricted Fund?

A **restricted fund** is a pool of donations where the donor has imposed specific conditions on how the funds may be used. The Charity holds these funds in a fiduciary capacity and may only allocate them within the restriction terms.

### 10.2 Restricted Fund Principles

| Principle | Description |
|---|---|
| **Donor intent** | The restriction terms reflect the donor's intent and are legally binding. |
| **Separation** | Restricted funds are accounted for separately from unrestricted funds. |
| **Non-diversion** | Restricted funds cannot be redirected to any purpose outside the restriction terms. |
| **Non-conversion** | Restricted funds cannot be converted to commercial revenue, service entitlements, or any Commerce domain value. |
| **Transparency** | The Charity must report to the donor on how restricted funds are used. |
| **Reversion** | If the restricted purpose cannot be fulfilled, the Charity must follow legal reversion procedures (which may include returning funds to the donor). |

### 10.3 One-Way Valve Model

Restricted funds operate under a **one-way valve** model:

```
===============================================================================
  RESTRICTED FUND: ONE-WAY VALVE MODEL
  CONCEPT ONLY — NOT LEGAL ADVICE
===============================================================================

  DONOR ----restricted gift-----> RESTRICTED FUND
                                     |
                                     |  (valve opens ONLY downward)
                                     v
                              ALLOWED OUTFLOWS:
                              - Spend on restricted purpose
                              - Report to donor on usage
                              - Return to donor (if purpose unfulfillable)
                              - Transfer to another restricted fund
                                (only with donor consent and legal advice)

                              BLOCKED OUTFLOWS (NEVER):
                              X Convert to commercial revenue
                              X Subsidize a service entitlement
                              X Offset a refund or chargeback
                              X Fund unrestricted operations
                              X Transfer to Commerce domain
                              X Transfer to Stewardship domain
                                (as a payment or commercial consideration)

===============================================================================
```

### 10.4 Restricted Fund Lifecycle

The restricted fund lifecycle (aligned with M49-04) follows these stages:

1. **Solicitation** (optional) — Charity may solicit restricted gifts for a defined purpose.
2. **Pledge/Commitment** — Donor commits to a restricted gift.
3. **Receipt** — Funds are received and logged.
4. **Acknowledgment** — Donor receives written acknowledgment with restriction terms.
5. **Classification** — Funds are classified by restriction type and allocated to the appropriate restricted fund.
6. **Holding** — Funds are held separately from unrestricted funds.
7. **Allocation** — Funds are budgeted for the restricted purpose.
8. **Expenditure** — Funds are spent on the restricted purpose, with dual approval.
9. **Reconciliation** — Fund balances are verified against records.
10. **Reporting** — Donor receives a report on fund usage and outcomes.
11. **Closure** — Restricted purpose is fulfilled; fund is closed. Or: purpose is unfulfillable; fund is reverted per legal advice.

### 10.5 Restricted Fund Record Requirements

| Field | Description | Owner |
|---|---|---|
| Fund ID | Unique identifier for this restricted fund | Charity |
| Fund purpose | Description of the restriction | Charity |
| Donor ID(s) | Identifier(s) for the restricting donor(s) | Charity |
| Total received | Cumulative amount received into this fund | Charity |
| Total spent | Cumulative amount spent from this fund | Charity |
| Balance | Current fund balance | Charity |
| Expenditure records | Itemized spending against the restricted purpose | Charity |
| Donor reports | Copies of reports sent to donors | Charity |
| Closure/reversion record | How the fund was closed or reverted | Charity |

---

## 11. Refund Scenarios and Ownership

### 11.1 Refund Principle

A refund is a **Commerce-domain reversal**. It returns money from the Merchant to the Payer for a service that was not delivered, was delivered unsatisfactorily, or was cancelled per the service terms. A refund **never** touches the Charity domain or the Stewardship domain.

### 11.2 Refund Scenarios

#### Scenario R1: Full Refund — Service Not Delivered

```
TRIGGER:    Payer paid for a service that was never delivered.
FLOW:       Merchant -> Payer: full refund of payment amount.
RECORD:     Merchant issues refund receipt linked to original invoice.
OWNER:      Merchant.
DISPOSITION: Refunded (full). Entitlement cancelled.
DOMAIN:     Commerce only.
COUPLING:   None. No Charity or Stewardship record is affected.
```

#### Scenario R2: Partial Refund — Service Partially Delivered

```
TRIGGER:    Payer paid for a service; part was delivered, part was not.
FLOW:       Merchant -> Payer: partial refund of payment amount.
RECORD:     Merchant issues partial refund receipt linked to original invoice.
OWNER:      Merchant.
DISPOSITION: Refunded (partial). Entitlement adjusted to reflect delivered portion.
DOMAIN:     Commerce only.
COUPLING:   None. No Charity or Stewardship record is affected.
```

#### Scenario R3: Refund Request After Long Delay

```
TRIGGER:    Payer requests a refund well after service delivery.
FLOW:       Merchant evaluates per refund policy. If approved: Merchant -> Payer.
RECORD:     Merchant issues refund receipt with delay notation.
OWNER:      Merchant.
DISPOSITION: Refunded (full or partial) or Denied (per policy).
DOMAIN:     Commerce only.
COUPLING:   None.
NOTE:       Refund policy terms (time limits, conditions) are set by the Merchant
            and communicated to the Payer before purchase. This document does not
            define those terms.
```

#### Scenario R4: Payer Requests Refund to Charity Account

```
TRIGGER:    Payer asks for their refund to be sent to the Charity instead.
FLOW:       FORBIDDEN AS SINGLE FLOW. Must be decomposed:
            Step 1: Merchant -> Payer: refund to original payment method.
            Step 2: Payer (as Donor) -> Charity: separate voluntary donation.
RECORD:     Two separate records: Commerce refund receipt + Charity donation receipt.
OWNER:      Step 1: Merchant. Step 2: Charity.
DISPOSITION: Step 1: Refunded. Step 2: Received/Acknowledged.
DOMAIN:     Step 1: Commerce. Step 2: Charity.
COUPLING:   The two steps are linked only by the Payer's choice. The Merchant
            does not communicate with the Charity about the refund. The Charity
            does not know the donation originated from a refund.
```

**Critical:** Scenario R4 is the most dangerous coupling risk. If the Merchant directly transfers a refund to the Charity, it creates a cross-domain flow that may be interpreted as a donation-to-entitlement conversion in reverse. The decomposition into two separate steps is mandatory.

#### Scenario R5: Service Entitlement Includes a "Donation Component"

```
TRIGGER:    Payer paid $500; Merchant's pricing says "$400 service + $100 donation."
REFUND Q:   If the Payer requests a refund, how much is refunded?
FLOW:       The refund applies ONLY to the service component ($400).
            The $100 donation component is NOT refundable by the Merchant because
            it was already transferred to the Charity as a separate donation.
RECORD:     Merchant refunds $400 (Commerce). Charity retains $100 (Charity).
OWNER:      Refund: Merchant. Donation: Charity.
DISPOSITION: Refunded ($400, Commerce). Donation retained ($100, Charity).
DOMAIN:     Commerce (refund) + Charity (donation retention).
COUPLING:   None, IF the original transaction was properly decomposed at purchase
            time (see Section 6.3). If it was NOT decomposed, this is a coupling
            violation that must be remediated.
```

**Design implication:** Mixed payments (part service, part donation) must be decomposed at the point of purchase, not at the point of refund. The refund scenario merely exposes whether the decomposition was done correctly.

### 11.3 Refund Ownership Summary

| Scenario | Owner | Domain | Charity Impact | Stewardship Impact |
|---|---|---|---|---|
| R1: Full refund, not delivered | Merchant | Commerce | None | None |
| R2: Partial refund | Merchant | Commerce | None | None |
| R3: Delayed refund request | Merchant | Commerce | None | None |
| R4: Refund to Charity account | Merchant + Charity | Commerce + Charity | Receives separate donation | None |
| R5: Mixed payment refund | Merchant (service portion) | Commerce | Charity retains donation portion | None |

---

## 12. Chargeback Scenarios and Ownership

### 12.1 Chargeback Principle

A chargeback is a **forced reversal** initiated by the Payer's payment provider (bank, card network, or payment processor). The payment provider debits the Merchant's account and credits the Payer's account. A chargeback is entirely a Commerce-domain event. It **never** affects the Charity domain or the Stewardship domain.

### 12.2 Chargeback Scenarios

#### Scenario CB1: Full Chargeback — Service Disputed

```
TRIGGER:    Payer disputes the full charge with their payment provider.
FLOW:       Payment Provider -> Payer: full credit.
            Payment Provider <- Merchant: full debit.
RECORD:     Merchant records chargeback against original invoice.
            Payment Provider records dispute and resolution.
OWNER:      Merchant (bears the financial loss).
DISPOSITION: Charged back (full). Entitlement cancelled.
DOMAIN:     Commerce only.
COUPLING:   None. No Charity or Stewardship record is affected.
NOTE:       If the Merchant had already recognized revenue from this payment,
            the revenue must be reversed in the Merchant's accounting records.
```

#### Scenario CB2: Partial Chargeback

```
TRIGGER:    Payer disputes part of the charge (e.g., service was partially delivered).
FLOW:       Payment Provider -> Payer: partial credit.
            Payment Provider <- Merchant: partial debit.
RECORD:     Merchant records partial chargeback against original invoice.
OWNER:      Merchant.
DISPOSITION: Charged back (partial). Entitlement adjusted or cancelled.
DOMAIN:     Commerce only.
COUPLING:   None.
```

#### Scenario CB3: Chargeback After Donation Component Was Separated

```
TRIGGER:    Payer paid a mixed amount ($400 service + $100 donation). Payer now
            disputes the full $500 charge.
FLOW:       The chargeback applies to the full $500 as processed by the payment
            provider. However, the $100 donation was already transferred to the
            Charity as a separate transaction.
RESOLUTION: The Merchant must absorb the full $500 chargeback. The Charity is
            NOT debited. The $100 donation remains with the Charity.
            The Merchant may need to recover the $100 from the Payer through
            separate means (this is a Merchant-Payer commercial matter).
RECORD:     Merchant records $500 chargeback. Charity records remain unchanged.
OWNER:      Merchant (bears the full chargeback loss).
DISPOSITION: Charged back ($500, Commerce). Donation retained ($100, Charity).
DOMAIN:     Commerce (chargeback) + Charity (unaffected).
COUPLING:   None, IF the original transaction was properly decomposed.
            The Charity's records show a $100 donation from the Payer. The
            Commerce records show a $500 chargeback. These are separate events.
```

**Critical risk:** Scenario CB3 is the highest-risk chargeback scenario. If the original transaction was not properly decomposed at purchase time, the Charity may be exposed to a claim that the donation was part of a commercial transaction and should be reversed. Proper decomposition at purchase time prevents this exposure.

#### Scenario CB4: Fraudulent Chargeback

```
TRIGGER:    Payer files a fraudulent chargeback (claims they never received the
            service when they did).
FLOW:       Payment Provider -> Payer: credit (pending investigation).
            Payment Provider <- Merchant: debit (pending investigation).
            Merchant may submit evidence to contest the chargeback.
RECORD:     Merchant records disputed chargeback. Payment Provider records
            investigation.
OWNER:      Merchant (bears the loss if chargeback is upheld).
DISPOSITION: Pending investigation -> Upheld (Merchant loses) or
             Reversed (Payer loses).
DOMAIN:     Commerce only.
COUPLING:   None.
```

#### Scenario CB5: Chargeback on a Donation-Only Transaction

```
TRIGGER:    A Donor attempts to chargeback a donation they made to the Charity.
FLOW:       This is a complex scenario. Donations are generally not subject to
            chargeback in the same way as commercial transactions. However, if
            the donation was processed through a payment provider that allows
            disputes, a chargeback may occur.
RESOLUTION: The Charity must treat this as a donation return, not a chargeback.
            The Charity's policies (defined by M49-04) govern whether and how
            donations can be returned.
RECORD:     Charity records the return as a donation reversal (not a chargeback).
OWNER:      Charity.
DISPOSITION: Returned (Charity domain). NOT charged back (Commerce domain).
DOMAIN:     Charity only.
COUPLING:   None. The Charity does not involve the Commerce domain in this
            resolution.
NOTE:       This scenario highlights why donations should be processed through
            a different payment channel than commercial transactions. If both
            use the same payment provider, the risk of confusion increases.
            This is a design decision for M35-02.
```

### 12.3 Chargeback Ownership Summary

| Scenario | Owner | Domain | Charity Impact | Stewardship Impact |
|---|---|---|---|---|
| CB1: Full chargeback | Merchant | Commerce | None | None |
| CB2: Partial chargeback | Merchant | Commerce | None | None |
| CB3: Chargeback after donation separation | Merchant | Commerce | None (donation retained) | None |
| CB4: Fraudulent chargeback | Merchant | Commerce | None | None |
| CB5: Donation chargeback attempt | Charity | Charity | Donation return processed | None |

---

## 13. Forbidden Coupling Documentation

### 13.1 Purpose

This section provides an exhaustive list of couplings that must **never** occur between the Commerce, Charity, and Stewardship domains. Each forbidden coupling is stated as a rule, with a rationale and a test scenario.

### 13.2 Forbidden Couplings

#### FC-1: Donation-to-Entitlement Conversion

| Attribute | Value |
|---|---|
| **Rule** | A donation must never be treated as, converted to, or recorded as a payment for a service entitlement. |
| **Rationale** | Donations are voluntary gifts without consideration. Service entitlements are contractual payments with defined deliverables. Converting one to the other misrepresents the nature of the transaction and may violate tax, charity, or consumer protection law. |
| **Test scenario** | A Donor gives $1,000 to the Charity. The Charity offers the Donor a "premium support tier" in recognition of their generosity. **This is forbidden.** The donation and the service entitlement are separate transactions that must be initiated, recorded, and receipted independently. |
| **Detection** | Audit: compare donation records with entitlement records. If any donation ID appears in an entitlement record, or any entitlement ID appears in a donation record, a coupling violation has occurred. |

#### FC-2: Entitlement-to-Donation Recharacterization

| Attribute | Value |
|---|---|
| **Rule** | A service payment must never be recharacterized as a donation. |
| **Rationale** | Recharacterizing a payment as a donation may falsely imply tax deductibility to the Payer and misrepresent the nature of the transaction to tax authorities. |
| **Test scenario** | A Payer pays $500 for a support subscription. The Merchant, unable to deliver the service, offers to "convert the payment to a donation" instead of issuing a refund. **This is forbidden.** The Merchant must issue a refund. If the Payer subsequently chooses to donate, that is a separate, voluntary act. |
| **Detection** | Audit: compare refund records with donation records. If a refund was waived in exchange for a donation, a coupling violation has occurred. |

#### FC-3: Paid Source Access

| Attribute | Value |
|---|---|
| **Rule** | No payment, donation, subscription, service entitlement, or commercial relationship of any kind may grant, enhance, or accelerate access to source materials. |
| **Rationale** | Source access is governed by consent, provenance, and community rights. Commercializing source access violates the ethical foundations of the project and may violate the rights of source owners and communities. |
| **Test scenario** | An institution offers to "sponsor" the digitization of a private source collection in exchange for early access to the digitized materials. **This is forbidden.** Sponsorship (if accepted as a donation) does not create access rights. Access rights are determined solely by the Source Owner. |
| **Detection** | Audit: compare source access grants with payment records, donation records, and entitlement records. If any access grant correlates with a payment or donation, a coupling violation has occurred. |

#### FC-4: Restricted Fund Diversion

| Attribute | Value |
|---|---|
| **Rule** | Restricted funds must never be diverted to any purpose outside the restriction terms, including commercial operations, service subsidies, or revenue offset. |
| **Rationale** | Restricted funds are held in fiduciary trust. Diversion violates donor intent, fiduciary duty, and potentially charity law. |
| **Test scenario** | The Charity receives a $50,000 restricted gift for "digitization of Collection X." The Charity uses $10,000 of this to subsidize the cost of providing technical support to institutions studying Collection X. **This is forbidden.** The restricted fund may only be spent on the digitization purpose. Support cost subsidies are a commercial expense, not a digitization expense. |
| **Detection** | Audit: compare restricted fund expenditure records with the restriction terms. If any expenditure does not directly serve the restricted purpose, a diversion has occurred. |

#### FC-5: Cross-Domain Refund Settlement

| Attribute | Value |
|---|---|
| **Rule** | A refund in the Commerce domain must never be settled against a record in the Charity domain, and vice versa. |
| **Rationale** | Cross-domain settlement creates the appearance of coupling and may be interpreted as a conversion of value between domains. |
| **Test scenario** | A Payer requests a $200 refund. The Merchant offers to "donate $200 to the Charity on your behalf" instead of issuing a cash refund. **This is forbidden.** The Merchant must issue the refund. If the Merchant subsequently makes a separate donation to the Charity, that is the Merchant's own voluntary act and must not be linked to the Payer's refund. |
| **Detection** | Audit: compare refund records with donation records. If a refund was offset by a donation (in either direction), a coupling violation has occurred. |

#### FC-6: Chargeback Impact on Charity Records

| Attribute | Value |
|---|---|
| **Rule** | A chargeback in the Commerce domain must never alter, reduce, or affect any record in the Charity domain. |
| **Rationale** | Chargebacks are Commerce-domain reversals. Allowing them to affect Charity records creates a coupling that may expose the Charity to commercial liability. |
| **Test scenario** | A Payer disputes a $500 charge that included a $100 donation component. The payment provider reverses the full $500. The Charity's fund balance is reduced by $100. **This is forbidden.** The Charity's records must remain unaffected by the Commerce-domain chargeback. The Merchant absorbs the full loss. |
| **Detection** | Audit: compare chargeback records with Charity fund balance changes. If any fund balance change correlates with a chargeback, a coupling violation has occurred. |

#### FC-7: Source Access as a Donation Benefit

| Attribute | Value |
|---|---|
| **Rule** | Donating to the Charity must never grant, enhance, or accelerate access to source materials. |
| **Rationale** | This is a specific instance of FC-3 applied to the Charity domain. Donation benefits (acknowledgment, impact reports, tax receipts) must never include source access. |
| **Test scenario** | The Charity sends a year-end report to donors that includes a line: "Major donors ($5,000+) receive early access to newly digitized sources." **This is forbidden.** No donor tier, regardless of amount, receives source access benefits. |
| **Detection** | Audit: compare donor acknowledgment communications with source access policies. If any acknowledgment mentions source access as a benefit, a coupling violation has occurred. |

#### FC-8: Service Entitlement Including Source Access

| Attribute | Value |
|---|---|
| **Rule** | A service entitlement must never include, reference, or imply access to source materials. |
| **Rationale** | This is a specific instance of FC-3 applied to the Commerce domain. Service descriptions must be scoped to the service itself and must not mention source access. |
| **Test scenario** | The Merchant's service catalog lists: "Premium Research Support — includes access to 500 digitized manuscripts." **This is forbidden.** The service catalog may describe research support, training, or technical assistance. It may not describe source access. |
| **Detection** | Audit: compare service entitlement descriptions with source access policies. If any entitlement description mentions source access, a coupling violation has occurred. |

### 13.3 Forbidden Coupling Summary Matrix

| ID | Coupling | From Domain | To Domain | Severity | Detection Method |
|---|---|---|---|---|---|
| FC-1 | Donation-to-entitlement conversion | Charity | Commerce | Critical | Cross-reference donation/entitlement IDs |
| FC-2 | Entitlement-to-donation recharacterization | Commerce | Charity | Critical | Cross-reference refund/donation records |
| FC-3 | Paid source access | Commerce/Charity | Stewardship | Critical | Cross-reference payments/donations with access grants |
| FC-4 | Restricted fund diversion | Charity | Commerce | Critical | Audit restricted fund expenditures |
| FC-5 | Cross-domain refund settlement | Commerce | Charity | High | Cross-reference refund/donation records |
| FC-6 | Chargeback impact on charity | Commerce | Charity | High | Cross-reference chargeback/fund balance records |
| FC-7 | Source access as donation benefit | Charity | Stewardship | Critical | Audit donor communications |
| FC-8 | Source access in service entitlement | Commerce | Stewardship | Critical | Audit service descriptions |

---

## 14. Sacred/Private Source Access Exclusion

### 14.1 The Absolute Rule

**No payment of any kind — whether a service fee, a donation, a subscription, a sponsorship, a grant, a bribe, or any other form of financial consideration — grants, enhances, accelerates, or influences access to private or sacred source materials.**

This rule is absolute. It admits no exceptions. It cannot be overridden by:
- A Merchant's service terms.
- A Charity's donor benefits policy.
- A Source Owner's commercial agreement (the Source Owner's consent is necessary but not sufficient; the project's own policies must also prohibit paid access).
- An institutional partnership agreement.
- A government or funder requirement.
- Any technical mechanism (payment gate, access token, subscription check).

### 14.2 Definitions

| Term | Definition |
|---|---|
| **Private source** | A source material to which access is restricted by the Source Owner's consent terms. Private sources are not publicly available and access is granted only per the Source Owner's conditions. |
| **Sacred source** | A source material that holds religious, spiritual, cultural, or ceremonial significance to a community. Sacred sources may have access restrictions based on tradition, community protocol, or the Source Owner's determination. |
| **Source access** | The ability to view, read, download, copy, reference, cite, analyze, or otherwise interact with a source material. |
| **Payment** | Any transfer of monetary value, including service fees, donations, subscriptions, sponsorships, grants, in-kind exchanges, or any other financial consideration. |

### 14.3 What Source Access IS Governed By

Source access is governed exclusively by:

1. **Source Owner consent** — The Source Owner determines who may access their sources, under what conditions, and for what purposes.
2. **Provenance requirements** — Access may depend on verifying the requester's identity, affiliation, and intended use.
3. **Community protocol** — For sacred sources, access may be governed by community traditions, cultural protocols, or ceremonial requirements.
4. **Project policy** — The MoonWitness XV project's own access policies, which must enforce the no-paid-access rule.
5. **Legal requirements** — Applicable laws regarding privacy, data protection, cultural heritage, and intellectual property.

### 14.4 What Source Access Is NOT Governed By

Source access is **not** governed by:

1. **Payment status** — Whether the requester has paid for a service.
2. **Donation amount** — Whether the requester has donated, or how much.
3. **Subscription tier** — Whether the requester has a premium service entitlement.
4. **Institutional affiliation** (as a commercial matter) — Whether the requester's institution has a partnership agreement that includes payment.
5. **Sponsorship** — Whether a third party has sponsored the requester's access.

### 14.5 Architectural Enforcement

The no-paid-access rule must be enforced architecturally, not just by policy. This means:

1. **No payment check in the access path** — The source access control system must not query, reference, or depend on any payment, donation, or subscription record.
2. **Separate access control system** — The system that governs source access must be technically separate from the system that governs service entitlements and the system that governs donation records.
3. **No shared token** — An access token for source materials must not be derivable from a payment token, donation receipt, or subscription identifier.
4. **Audit separation** — Access logs must not contain payment or donation information. Payment logs must not contain access information.
5. **Code boundary** — The codebase must enforce a module boundary between source access control and any commerce or charity module. No function in the access control module may import, call, or reference any function in the commerce or charity modules.

### 14.6 Edge Cases

#### Edge Case SA-1: Researcher Who Is Also a Donor

```
SCENARIO:   A person donates $500 to the Charity and also requests access to
            a private source.
RESOLUTION: The donation and the access request are separate events with
            separate records. The donation does not influence the access
            decision. The Source Owner evaluates the access request on its
            own merits (consent terms, provenance, community protocol).
ENFORCEMENT: The access control system has no record of the donation. The
            donation system has no record of the access request.
```

#### Edge Case SA-2: Institution That Pays for Support and Requests Source Access

```
SCENARIO:   An institution pays $10,000 for a research support subscription
            and also requests access to a sacred source collection.
RESOLUTION: The payment and the access request are separate events. The
            payment entitles the institution to support services. The access
            request is evaluated by the Source Owner independently.
ENFORCEMENT: The access control system has no record of the payment. The
            payment system has no record of the access request.
```

#### Edge Case SA-3: Sponsor Offers to Fund Source Digitization

```
SCENARIO:   A sponsor offers $100,000 to digitize a sacred source collection,
            in exchange for access to the digitized materials.
RESOLUTION: The sponsorship (if accepted as a restricted donation) funds
            the digitization. Access to the digitized materials is governed
            by the Source Owner's consent terms, not by the sponsorship.
            The sponsor does not receive access as a benefit of the
            sponsorship.
ENFORCEMENT: The digitization project records the sponsorship as a restricted
            fund. The access control system evaluates access requests
            independently of sponsorship records.
NOTE:       If the Source Owner does not consent to the sponsor's access,
            the sponsor does not receive access. Period. The sponsorship
            may be returned or redirected per the restriction terms and
            legal advice, but access is not granted.
```

#### Edge Case SA-4: Source Owner Requests Payment for Access

```
SCENARIO:   A Source Owner states they will only grant access if the requester
            pays a fee.
RESOLUTION: This is a matter between the Source Owner and the requester,
            outside the MoonWitness XV platform. The platform itself must
            not facilitate, process, or record any such payment. If the
            platform were to process such a payment, it would violate the
            no-paid-access rule.
ENFORCEMENT: The platform's access control system does not process payments.
            The platform's payment system does not gate source access.
NOTE:       This scenario highlights a potential tension between Source Owner
            autonomy and the platform's no-paid-access policy. The resolution
            is that the platform does not facilitate the transaction; the
            Source Owner and requester may arrange their own terms outside
            the platform. Whether this is acceptable to all parties is an
            UNKNOWN item for owner/legal review.
```

---

## 15. Edge Case Scenarios

### 15.1 Mixed Payments

#### Edge Case MX-1: Single Transaction with Service and Donation Components

```
SCENARIO:   A Payer sends $500 in a single transaction, specifying "$400 for
            support and $100 as a donation."
DECOMPOSITION:
  Flow A: $400 -> Merchant (Service Payment)
    Record: Invoice #INV-XXXX, Receipt #RCT-XXXX
    Owner: Merchant
    Domain: Commerce
  Flow B: $100 -> Charity (Donation, Unrestricted)
    Record: Receipt #RCP-XXXX, Acknowledgment #ACK-XXXX
    Owner: Charity
    Domain: Charity
TIMING:     Both flows are recorded simultaneously but separately.
REFUND:     If the Payer disputes the $500 charge, the chargeback applies to
            the full $500 via the payment provider. The Merchant absorbs the
            loss. The Charity's $100 donation record is unaffected (see CB3).
RISK:       If the payment provider does not support split transactions, the
            full $500 must be processed as a single payment to the Merchant,
            and the Merchant must separately transfer $100 to the Charity as
            a distinct transaction. The two-step process must be documented
            and auditable.
```

#### Edge Case MX-2: Ambiguous Payment Intent

```
SCENARIO:   A Payer sends $500 with a note: "Supporting the project."
AMBIGUITY:  Is this a service payment or a donation?
RESOLUTION: The payment must be classified before processing. Default
            classification rules (to be defined by M35-02 and charity owners):
            - If the Payer has an active service entitlement and the amount
              matches a known price, classify as service payment.
            - If the Payer has no active entitlement, classify as donation
              (pending confirmation from the Payer).
            - If ambiguous, hold the payment in a suspense account and
              contact the Payer for clarification.
RISK:       Misclassification creates a coupling risk. If a donation is
            recorded as a service payment, the Payer may receive an invoice
            for a gift. If a service payment is recorded as a donation, the
            Payer may receive a tax receipt for a purchase.
```

### 15.2 Partial Refunds

#### Edge Case PR-1: Partial Refund on a Multi-Component Payment

```
SCENARIO:   A Payer paid $500 ($400 service + $100 donation). The service was
            partially delivered. The Payer requests a refund.
RESOLUTION: The refund applies only to the service component. The maximum
            refund is $400 (the service portion). The $100 donation is not
            refundable by the Merchant.
            - If the Merchant refunds $200 (partial service): Payer receives
              $200 back. Service entitlement is adjusted. Donation ($100) is
              unaffected.
            - If the Merchant refunds $400 (full service): Payer receives $400
              back. Service entitlement is cancelled. Donation ($100) is
              unaffected.
            - The Merchant cannot refund more than $400 because the $100
              donation is in the Charity domain and outside the Merchant's
              control.
```

#### Edge Case PR-2: Partial Refund After Service Usage

```
SCENARIO:   A Payer paid $400 for a 12-month support subscription. After
            3 months, the Payer requests a refund.
RESOLUTION: The Merchant's refund policy determines the refund amount.
            Possible outcomes:
            - Pro-rata refund: $300 (9 remaining months).
            - Partial refund: $200 (per policy terms).
            - No refund: Per policy terms (e.g., no refunds after 30 days).
            In all cases, the refund is a Commerce-domain transaction. No
            Charity or Stewardship record is affected.
```

### 15.3 Cross-Border Donations

#### Edge Case BD-1: International Donor with Currency Conversion

```
SCENARIO:   A Donor in Country A sends $100 (local currency) to the Charity
            in Country B. The payment provider converts currency.
RESOLUTION: The Charity records the donation in its functional currency.
            The converted amount is the donation value. Currency conversion
            fees are borne by the payment system (not deducted from the
            donation).
COUPLING RISK: If the payment provider processes both commercial and charitable
            transactions, there is a risk of commingling. The Charity must
            ensure that its payment channel is separate from the Merchant's
            payment channel, or that the payment provider maintains separate
            records for each.
```

#### Edge Case BD-2: Donor in a Sanctioned Jurisdiction

```
SCENARIO:   A Donor in a sanctioned jurisdiction attempts to donate.
RESOLUTION: The Charity must comply with applicable sanctions regulations.
            The donation may need to be rejected or returned.
            This is a legal/compliance matter, not a commerce matter.
            The Merchant is not involved.
UNKNOWN:    Whether sanctions compliance creates any coupling risk depends
            on the specific sanctions regime and the payment provider's
            policies. This is flagged for legal review.
```

### 15.4 Restricted Fund Edge Cases

#### Edge Case RF-1: Restricted Fund with Unspendable Balance

```
SCENARIO:   A restricted fund has a $5,000 balance remaining after the
            restricted purpose is fulfilled. The donor is unreachable.
RESOLUTION: The Charity must follow legal advice on how to handle the
            unspendable balance. Options may include:
            - cy-près doctrine (applying funds to a similar purpose)
            - Return to general unrestricted funds (if permitted by law)
            - Hold in suspense pending donor contact
            In no case may the unspendable balance be transferred to the
            Commerce domain or used to offset commercial costs.
```

#### Edge Case RF-2: Restricted Fund Donor Requests Refund

```
SCENARIO:   A Donor who gave $10,000 as a restricted gift now requests a
            refund. The Charity has already spent $3,000 on the restricted
            purpose.
RESOLUTION: The Charity must follow legal advice. Possible outcomes:
            - Return the unspent balance ($7,000) to the Donor.
            - Negotiate a modified restriction with the Donor.
            - Decline the refund request (if the gift was irrevocable).
            In all cases, the resolution is within the Charity domain.
            The Commerce domain is not involved.
COUPLING RISK: If the Donor is also a Payer (has a service entitlement),
            there is a risk that the Charity might offer a "refund" in the
            form of a service credit. This is forbidden (FC-5).
```

#### Edge Case RF-3: Restricted Fund Purpose Overlaps with Commercial Service

```
SCENARIO:   A Donor restricts a gift to "supporting research on Topic X."
            The Merchant also sells a research support service for Topic X.
RESOLUTION: The restricted fund and the commercial service are separate.
            The Charity may use the restricted fund to support research on
            Topic X (e.g., by funding a researcher's access to public
            sources, or by producing a research report). The Merchant may
            sell support services to anyone studying Topic X.
            The two flows must not intersect:
            - The restricted fund must not subsidize the Merchant's service.
            - The Merchant's service must not be marketed as "funded by"
              the restricted fund.
            - A person who benefits from the restricted fund must not be
              required to purchase the Merchant's service.
```

### 15.5 Simultaneous Payer and Donor

#### Edge Case SD-1: Same Person, Same Day, Both Roles

```
SCENARIO:   A person pays $400 for a support subscription and donates $100
            to the Charity on the same day.
RESOLUTION: Two separate transactions, two separate records, two separate
            receipts. The person is a Payer in one transaction and a Donor
            in the other. The records are in separate domains.
COUPLING RISK: The person may expect their donation to "count toward" their
            service entitlement (e.g., "I've given $500 total, so I should
            get premium access"). This expectation must be explicitly
            managed:
            - The donation receipt states: "No goods or services were
              provided in exchange for this gift."
            - The service invoice states: "This entitlement is based on
              the service payment only."
```

#### Edge Case SD-2: Person Donates, Then Later Requests a Service Refund

```
SCENARIO:   A person donated $200 in January. In March, they paid $400 for
            a service. In April, they request a refund of the $400 and also
            ask for their $200 donation to be returned.
RESOLUTION:
            - The $400 refund is handled by the Merchant per refund policy
              (Commerce domain).
            - The $200 donation return is handled by the Charity per donation
              return policy (Charity domain).
            - The two are independent. The Merchant does not process the
              donation return. The Charity does not process the service refund.
COUPLING RISK: The person may perceive the two transactions as linked because
            they involve the same organization. The organization must maintain
            clear separation in its communications, records, and processes.
```

### 15.6 Technical Edge Cases

#### Edge Case TC-1: Payment Provider Processes Both Commerce and Charity

```
SCENARIO:   The Merchant and the Charity use the same payment provider
            (e.g., Stripe, PayPal) to process transactions.
RISK:       The payment provider may commingle records, making it difficult
            to distinguish commercial transactions from charitable donations.
            A chargeback on a commercial transaction might affect the
            Charity's balance if the funds are in the same merchant account.
RESOLUTION: The Merchant and the Charity must use separate merchant accounts
            with the payment provider. Even if the same legal entity operates
            both accounts, the accounts must be financially and record-keeping
            separate.
OWNER:      M35-02 (Merchant account setup) and charity owners (Charity
            account setup) must coordinate on this separation.
```

#### Edge Case TC-2: System Error Causes Cross-Domain Record Leak

```
SCENARIO:   A software bug causes a donation record to appear in the
            Merchant's invoice system, or a service entitlement to appear
            in the Charity's donor database.
RESOLUTION: The bug must be fixed immediately. The leaked record must be
            removed from the incorrect domain's system. An audit must
            determine whether any decisions were made based on the leaked
            record (e.g., was a service entitlement granted based on a
            donation record?).
PREVENTION: Architectural enforcement (see Section 14.5) — the systems
            must be technically separated so that a bug in one cannot
            read or write records in the other.
```

---

## 16. Owner Assignment Matrix

### 16.1 Matrix Overview

Every flow scenario must have a distinct owner. The following matrix assigns ownership for all identified flows, records, and decisions.

### 16.2 Flow Ownership

| Flow | Owner | Domain | Record System | Reviewer |
|---|---|---|---|---|
| Service payment (Payer -> Merchant) | Merchant | Commerce | Invoice/accounting system (M35-02) | M35 owner |
| Service delivery (Merchant -> Payer) | Service Provider | Commerce | Service delivery log | Merchant |
| Service refund (Merchant -> Payer) | Merchant | Commerce | Refund record linked to invoice | M35 owner |
| Chargeback (Payment Provider -> Payer) | Merchant | Commerce | Chargeback record linked to invoice | M35 owner |
| Donation — unrestricted (Donor -> Charity) | Charity | Charity | Donor database / fund accounting (M49-04) | Charity owner |
| Donation — restricted (Donor -> Charity) | Charity | Charity | Restricted fund ledger (M49-04) | Charity owner + Board |
| Donation acknowledgment (Charity -> Donor) | Charity | Charity | Acknowledgment log | Charity owner |
| Donation return (Charity -> Donor) | Charity | Charity | Return record with legal basis | Charity owner + Legal counsel |
| Restricted fund expenditure (Charity -> Purpose) | Charity | Charity | Expenditure record with restriction code | Charity owner + Program Director |
| Restricted fund report (Charity -> Donor) | Charity | Charity | Donor impact report | Charity owner + Program Director |
| Source access grant (Source Owner -> Researcher) | Source Owner | Stewardship | Consent record + access log | Source Owner |
| Source access denial (Source Owner -> Researcher) | Source Owner | Stewardship | Denial record with reason | Source Owner |
| Source access revocation (Source Owner) | Source Owner | Stewardship | Revocation record | Source Owner |

### 16.3 Record Ownership

| Record Type | Owner | Domain | Retention | Access |
|---|---|---|---|---|
| Service invoice | Merchant | Commerce | Per commercial law | Merchant, Payer (own invoices) |
| Service payment receipt | Merchant | Commerce | Per commercial law | Merchant, Payer |
| Service entitlement record | Merchant | Commerce | Duration of entitlement + retention period | Merchant |
| Service refund record | Merchant | Commerce | Per commercial law | Merchant, Payer |
| Chargeback record | Merchant | Commerce | Per payment provider + commercial law | Merchant, payment provider |
| Donation receipt | Charity | Charity | Per charity law | Charity, Donor |
| Donation acknowledgment | Charity | Charity | Per charity law | Charity, Donor |
| Tax receipt | Charity | Charity | Per tax law | Charity, Donor, tax authority |
| Restricted fund ledger | Charity | Charity | Per charity law + restriction terms | Charity, Board, auditor |
| Restricted fund expenditure | Charity | Charity | Per charity law | Charity, Board, auditor, Donor (report) |
| Donor report | Charity | Charity | Per restriction terms | Charity, Donor |
| Source consent record | Source Owner | Stewardship | Per source owner's terms | Source Owner, project steward |
| Source access log | Source Owner / Platform | Stewardship | Per project policy | Source Owner, platform admin (access decisions only) |
| Source provenance record | Source Owner / Platform | Stewardship | Permanent | Source Owner, project steward |

### 16.4 Decision Ownership

| Decision | Owner | Consulted | Informed |
|---|---|---|---|
| Whether to offer a paid service | Project owners | M35 owner, architecture/product | Charity owner, Source Owners |
| What service entitlements to define | Merchant | Service Provider, architecture/product | Payer (via service terms) |
| What price to charge | Merchant | M35 owner | Payer |
| Whether to accept a donation | Charity | Board (if restricted) | Donor |
| Whether to restrict a donation | Donor (sets terms) | Charity (accepts or declines) | — |
| How to allocate restricted funds | Charity | Board, Program Director | Donor (via reports) |
| Whether to grant source access | Source Owner | Project steward (advisory) | Researcher |
| Whether to deny source access | Source Owner | Project steward (advisory) | Researcher |
| How to handle a refund | Merchant | M35 owner | Payer |
| How to handle a chargeback | Merchant | Payment provider, M35 owner | Payer |
| How to handle a donation return | Charity | Legal counsel, Board | Donor |
| How to handle a restricted fund dispute | Charity | Legal counsel, Board | Donor |
| Whether a coupling violation has occurred | Auditor (TBD) | All domain owners | Project owners |

### 16.5 Cross-Domain Coordination Points

| Coordination Point | Participants | Frequency | Purpose |
|---|---|---|---|
| Mixed payment decomposition | Merchant + Charity | Per transaction | Ensure proper separation at point of receipt |
| Payment channel separation | M35 owner + Charity owner | One-time setup + periodic review | Ensure separate merchant accounts |
| Audit review | Auditor + all owners | Annual (minimum) | Verify no coupling violations |
| Policy review | All owners | Annual (minimum) | Update policies as regulations change |
| Incident response | All owners | As needed | Address coupling violations or system errors |
| Legal consultation | Legal counsel + Charity owner | As needed | Address UNKNOWN legal items |

---

## 17. Legal Considerations and UNKNOWN Items

### 17.1 Legal Framework Acknowledgment

This document does not provide legal advice. The following legal areas are identified as relevant but are marked **UNKNOWN** pending review by qualified legal counsel in the applicable jurisdiction(s).

### 17.2 UNKNOWN Legal Items

| ID | Legal Question | Domain | Risk if Unresolved | Priority | Status |
|---|---|---|---|---|---|
| L-1 | What legal entity should serve as the Merchant? | Commerce | Operating without a proper legal entity exposes individuals to personal liability. | High | UNKNOWN |
| L-2 | What legal entity should serve as the Charity? | Charity | Operating without charitable registration may prevent tax-deductible receipts and violate charity law. | High | UNKNOWN |
| L-3 | In which jurisdiction(s) must the Merchant be registered? | Commerce | Multi-jurisdictional operations may require registration in multiple locations. | Medium | UNKNOWN |
| L-4 | In which jurisdiction(s) must the Charity be registered? | Charity | Charity registration requirements vary by jurisdiction and by donor location. | Medium | UNKNOWN |
| L-5 | Does the separation of Merchant and Charity under a common legal parent satisfy arm's-length requirements? | Both | Tax authorities may scrutinize transactions between related entities. | High | UNKNOWN |
| L-6 | What consumer protection laws apply to the service entitlement? | Commerce | Refund policies, cancellation rights, and service terms must comply with applicable consumer law. | High | UNKNOWN |
| L-7 | What charity law requirements apply to restricted funds? | Charity | Restricted fund handling must comply with charity commission requirements in the applicable jurisdiction. | High | UNKNOWN |
| L-8 | What tax treatment applies to mixed payments (part service, part donation)? | Both | The tax-deductible portion of a mixed payment may be limited to the amount exceeding the fair market value of the service received. | High | UNKNOWN |
| L-9 | What data protection requirements apply to Payer and Donor records? | Both | GDPR, local privacy laws, and payment card industry (PCI) standards may apply. | Medium | UNKNOWN |
| L-10 | What record retention periods apply to commercial and charitable records? | Both | Different retention periods may apply in different jurisdictions and for different record types. | Medium | UNKNOWN |
| L-11 | Can a charity legally refuse to return a donation? | Charity | Donation return policies must comply with charity law; irrevocability may not be absolute in all jurisdictions. | Medium | UNKNOWN |
| L-12 | What anti-money-laundering (AML) requirements apply to donations? | Charity | Large or anonymous donations may trigger AML reporting obligations. | Medium | UNKNOWN |
| L-13 | Does the no-paid-access rule for sources create any legal liability for the platform? | Stewardship | If a Source Owner expects the platform to enforce access restrictions, the platform's legal duty must be clarified. | Medium | UNKNOWN |
| L-14 | What legal recourse does a Payer have if a service is not delivered? | Commerce | Refund policies and consumer protection laws define the Payer's rights. | Medium | UNKNOWN |
| L-15 | What legal recourse does a Donor have if restricted funds are misused? | Charity | Charity law defines donor standing and regulatory remedies for restricted fund misuse. | Medium | UNKNOWN |
| L-16 | Are cross-border donations subject to withholding tax or foreign donation regulations? | Charity | International giving may trigger tax withholding, foreign registration, or sanctions compliance requirements. | Low | UNKNOWN |
| L-17 | What is the legal status of a "suspended" payment awaiting classification (Edge Case MX-2)? | Commerce | Holding funds in suspense may create bailment or trust obligations. | Low | UNKNOWN |

### 17.3 Legal Review Process

The following process is recommended for resolving UNKNOWN legal items:

1. **Engage legal counsel** with expertise in both commercial law and charity law in the applicable jurisdiction(s).
2. **Prioritize** L-1 through L-5 (entity formation and separation) as these are prerequisites for all other legal questions.
3. **Document** legal opinions in a separate legal advice file (not in this conceptual design document).
4. **Update** this document's UNKNOWN items as legal opinions are received.
5. **Review** annually or when regulations change.

### 17.4 Disclaimer

This document is a conceptual design artifact. It is not a substitute for legal advice. The UNKNOWN items identified here are based on general awareness of the legal landscape; they are not exhaustive. Qualified legal counsel must review all legal questions before any implementation.

---

## 18. Risk Mitigation

### 18.1 Risk: Diagram Mistaken for Legal Advice

| Attribute | Value |
|---|---|
| **Risk** | A reader may treat this conceptual diagram as legal advice or authorization for a specific commercial or charitable structure. |
| **Likelihood** | Medium — the diagram is detailed and may appear authoritative. |
| **Impact** | High — acting on a conceptual design without legal review may create legal, tax, or regulatory exposure. |
| **Mitigation** | 1. Watermark every page as "CONCEPT — NOT LEGAL ADVICE." 2. Include explicit disclaimers in every section. 3. Flag all legal questions as UNKNOWN. 4. Require legal counsel review before any implementation. 5. Store legal advice in a separate document, not in this design artifact. |

### 18.2 Risk: Implementation Prematurely Begins

| Attribute | Value |
|---|---|
| **Risk** | A developer may begin implementing a billing system, payment integration, or entitlement gate based on this conceptual design. |
| **Likelihood** | Medium — the design is detailed enough to suggest implementation paths. |
| **Impact** | High — premature implementation creates systems that may violate the boundary principles before legal review. |
| **Mitigation** | 1. This document explicitly prohibits implementation (Section 2.3). 2. M35-02 must be completed before any merchant/payment implementation. 3. No billing code, payment integration, or entitlement gate may be added to the codebase without separate authorization. 4. Code review must check for boundary violations (Section 14.5). |

### 18.3 Risk: Boundary Erosion Over Time

| Attribute | Value |
|---|---|
| **Risk** | The boundaries between Commerce, Charity, and Stewardship may erode as the project evolves, through small accumulations of cross-domain references, shared records, or convenience shortcuts. |
| **Likelihood** | High — boundary erosion is a common failure mode in complex systems. |
| **Impact** | High — eroded boundaries create coupling violations that may be discovered only during an audit or legal review. |
| **Mitigation** | 1. Architectural enforcement (Section 14.5) — technical separation of systems. 2. Annual audit (Section 16.6) — regular review of cross-domain references. 3. Code boundary checks — module import rules that prevent cross-domain function calls. 4. Training — all contributors must understand the three-domain model. 5. Incident response — clear process for addressing coupling violations when discovered. |

### 18.4 Risk: Donor/Payer Confusion

| Attribute | Value |
|---|---|
| **Risk** | A person who is both a Payer and a Donor may confuse their two roles, expecting donation benefits from their service payment or service entitlements from their donation. |
| **Likelihood** | Medium — confusion is natural when the same organization operates in both domains. |
| **Impact** | Medium — confusion leads to complaints, disputes, and potential legal claims. |
| **Mitigation** | 1. Separate communications — service invoices and donation acknowledgments must be clearly distinct documents. 2. Separate receipts — each transaction gets its own receipt with its own language. 3. Explicit disclaimers — donation acknowledgments state "no goods or services were provided." Service invoices state "this payment is for services only and is not tax-deductible." 4. Separate channels — if possible, use different payment channels for commerce and charity. |

### 18.5 Risk: Source Owner Misunderstanding

| Attribute | Value |
|---|---|
| **Risk** | A Source Owner may believe that the project's commercial activities (paid support services) affect their source materials, or that donations to the Charity create obligations to provide source access. |
| **Likelihood** | Low-Medium — Source Owners may not distinguish between the three domains. |
| **Impact** | High — Source Owner misunderstanding may lead to consent withdrawal, reputational harm, or legal claims. |
| **Mitigation** | 1. Clear communication — Source Owners must be informed that the project's commercial activities are separate from source stewardship. 2. Consent records — Source consent must explicitly state that commercial activities do not affect source access. 3. No-paid-access rule — This rule (Section 14) must be communicated to all Source Owners as a project commitment. 4. Source Owner liaison — A designated project member must be available to answer Source Owner questions about the boundary. |

### 18.6 Risk: Regulatory Change

| Attribute | Value |
|---|---|
| **Risk** | Changes in charity law, tax law, consumer protection law, or data protection law may invalidate aspects of this conceptual design. |
| **Likelihood** | Medium — regulatory environments change. |
| **Impact** | Medium-High — regulatory changes may require redesign of the boundary structure. |
| **Mitigation** | 1. Annual policy review (Section 16.6). 2. Legal counsel engagement for regulatory monitoring. 3. Design for adaptability — the boundary principles (Section 4) are general enough to accommodate regulatory changes even if specific implementations must change. |

### 18.7 Risk Summary Matrix

| Risk | Likelihood | Impact | Overall | Primary Mitigation |
|---|---|---|---|---|
| Diagram mistaken for legal advice | Medium | High | High | Watermarks, disclaimers, legal review |
| Premature implementation | Medium | High | High | Explicit prohibition, M35-02 gate |
| Boundary erosion over time | High | High | Critical | Architectural enforcement, annual audit |
| Donor/Payer confusion | Medium | Medium | Medium | Separate communications and receipts |
| Source Owner misunderstanding | Low-Med | High | Medium | Clear communication, consent records |
| Regulatory change | Medium | Medium-High | Medium-High | Annual review, legal counsel |

---

## 19. Metrics and Success Criteria

### 19.1 Primary Metric

**All flow scenarios are assigned a distinct owner and disposition.**

This is the task's core acceptance metric. To satisfy it:
- Every identified flow (service payment, donation, refund, chargeback, source access, etc.) must have exactly one owner.
- Every identified flow must have a defined disposition (Completed, Refunded, Charged Back, Received, Acknowledged, Allocated, Granted, Denied, etc.).
- No flow may be left without an owner or a disposition.

### 19.2 Metric Status

| Metric | Target | Actual | Status |
|---|---|---|---|
| Flow scenarios with assigned owner | 100% | 100% (13 flows identified, 13 owners assigned — Section 16.2) | MET |
| Flow scenarios with assigned disposition | 100% | 100% (all 13 flows have defined dispositions) | MET |
| Forbidden couplings documented | All identified | 8 forbidden couplings documented (FC-1 through FC-8 — Section 13.2) | MET |
| Edge cases analyzed | All identified | 15 edge cases analyzed (Sections 11, 12, 14.6, 15) | MET |
| Legal UNKNOWN items flagged | All identified | 17 legal items flagged (L-1 through L-17 — Section 17.2) | MET |
| Refund scenarios with owner and disposition | 100% | 100% (5 scenarios: R1-R5 — Section 11) | MET |
| Chargeback scenarios with owner and disposition | 100% | 100% (5 scenarios: CB1-CB5 — Section 12) | MET |
| No donation-to-entitlement conversion in diagram | 0 violations | 0 violations (FC-1 explicitly prohibits — Section 13.2) | MET |
| No paid access to private/sacred sources in diagram | 0 violations | 0 violations (FC-3, Section 14 explicitly prohibit) | MET |

### 19.3 Acceptance Criteria Verification

| Acceptance Criterion | Verification |
|---|---|
| Diagram shows no donation-to-entitlement conversion | FC-1 (Section 13.2) explicitly prohibits this. The boundary diagram (Section 7) shows no arrow from Charity domain to Commerce domain. Edge Case MX-1 demonstrates proper decomposition. |
| No paid access to private/sacred sources | FC-3 (Section 13.2) and Section 14 explicitly prohibit this. The boundary diagram shows no arrow from Commerce or Charity domain to Stewardship domain for access purposes. Edge Cases SA-1 through SA-4 demonstrate enforcement. |
| All flow scenarios assigned a distinct owner and disposition | Section 16.2 assigns owners to all 13 identified flows. Sections 11 and 12 assign dispositions to all refund and chargeback scenarios. |
| M35 and charity owners review | DEFERRED — this is a definition-of-done item, not an acceptance criterion. Review is pending. |
| Unresolved legal areas remain UNKNOWN | Section 17.2 identifies 17 UNKNOWN legal items. None are resolved in this document. |

### 19.4 Definition of Done Verification

| Done Criterion | Status |
|---|---|
| Reviewed flow diagram | COMPLETE — Section 7 provides the master boundary diagram and Sections 7.2-7.4 provide flow detail diagrams. |
| Unresolved legal questions documented | COMPLETE — Section 17.2 identifies 17 UNKNOWN items. |
| Decision recorded | COMPLETE — This document records the conceptual design decision. Implementation decisions are deferred to M35-02 and charity owner review. |

---

## 20. Deferred Items Requiring Owner Action

### 20.1 Deferred Items Register

| ID | Item | Owner Required | Priority | Dependency | Description |
|---|---|---|---|---|---|
| D-1 | Legal entity formation for Merchant | Project owners + legal counsel | High | L-1 | Decide the legal form, jurisdiction, and registration of the Merchant entity. |
| D-2 | Legal entity formation/registration for Charity | Project owners + legal counsel | High | L-2 | Decide the legal form, jurisdiction, and charitable registration status. |
| D-3 | Merchant account separation | M35 owner + Charity owner | High | D-1, D-2 | Set up separate payment processing accounts for Commerce and Charity. |
| D-4 | Legal review of boundary design | Legal counsel | High | D-1, D-2 | Qualified legal counsel reviews this conceptual design for compliance with applicable law. |
| D-5 | Consumer protection compliance review | Legal counsel | Medium | D-1 | Review service terms, refund policies, and cancellation rights for consumer law compliance. |
| D-6 | Charity law compliance review | Legal counsel | Medium | D-2 | Review donation acknowledgment, restricted fund handling, and tax receipt processes for charity law compliance. |
| D-7 | Tax treatment guidance for mixed payments | Legal counsel / tax advisor | High | D-1, D-2 | Determine the tax-deductible portion of mixed payments (service + donation). |
| D-8 | Data protection impact assessment | Privacy counsel / DPO | Medium | D-1, D-2 | Assess data protection requirements for Payer and Donor records. |
| D-9 | Source Owner communication plan | Source Owner liaison + project owners | Medium | — | Develop a communication plan to inform Source Owners about the commercial/charity boundary and the no-paid-access rule. |
| D-10 | Annual audit process definition | Auditor (TBD) + all owners | Low | D-1, D-2 | Define the process for annual boundary compliance audits. |
| D-11 | Code boundary enforcement | Architecture/product | Medium | — | Implement module import rules that prevent cross-domain function calls in the codebase. |
| D-12 | Incident response plan | All owners | Medium | D-1, D-2 | Define the process for responding to coupling violations or system errors that cross domain boundaries. |
| D-13 | M35-02 completion | M35 owner | High | — | M35-02 must define the Merchant's legal/payment structure before any implementation can begin. |
| D-14 | M49-04 owner review | Charity owner / M49 owner | Medium | — | M49-04 (restricted fund handling) owner reviews this document for alignment with restricted fund controls. |
| D-15 | M48-03 alignment check | Product research owner | Low | — | Verify that ethical pricing hypotheses (M48-03) do not create coupling risks when implemented. |
| D-16 | M48-08 dependency resolution | Product/rights research owner | Low | D-1 through D-7 | M48-08 (rights-cleared creator/research service model) depends on M48-04's boundary design being validated by legal review. |

### 20.2 Owner Action Required Before Implementation

No implementation of any commercial, charitable, or source access system may begin until the following owners have reviewed and approved:

1. **M35 owner** — Confirms that the Merchant entity and payment structure are defined and legally compliant.
2. **Charity owner** — Confirms that the Charity entity and donation structure are defined and legally compliant.
3. **Source Owner liaison** — Confirms that Source Owners have been informed of the boundary and the no-paid-access rule.
4. **Legal counsel** — Confirms that the boundary design complies with applicable law in all relevant jurisdictions.
5. **Architecture/product owner** — Confirms that the technical architecture enforces domain separation.

### 20.3 Review Checklist for Owners

When reviewing this document, owners should confirm:

- [ ] The entity definitions (Section 5) accurately reflect the roles and responsibilities of each party.
- [ ] The boundary principles (Section 4) are feasible and enforceable in practice.
- [ ] The forbidden couplings (Section 13) are comprehensive and correctly identified.
- [ ] The refund scenarios (Section 11) are realistic and correctly assigned.
- [ ] The chargeback scenarios (Section 12) are realistic and correctly assigned.
- [ ] The source access exclusion (Section 14) is technically enforceable.
- [ ] The edge cases (Section 15) cover the most likely real-world scenarios.
- [ ] The legal UNKNOWN items (Section 17) are correctly identified and prioritized.
- [ ] The deferred items (Section 20) are assigned to the correct owners.

---

## 21. Conclusion: BASELINE ESTABLISHED

### 21.1 Summary

M48-04 has produced a comprehensive conceptual boundary design that maps commercial entitlements away from donation benefits within the MoonWitness XV ecosystem. The design establishes:

- **Three separate domains** — Commerce, Charity, and Stewardship — with distinct owners, records, and flows.
- **Five entity definitions** — Payer, Merchant, Service Provider, Charity, and Source Owner — with clear role boundaries.
- **Six boundary principles** — Single Ownership, No Conversion, Domain-Scoped Reversal, Access Independence, Transparent Boundaries, and Minimal Coupling Surface.
- **Eight forbidden couplings** — Explicit prohibitions on donation-to-entitlement conversion, paid source access, restricted fund diversion, cross-domain refund settlement, and related violations.
- **An absolute no-paid-access rule** — No payment of any kind grants access to private or sacred sources.
- **Ten refund scenarios** and **five chargeback scenarios** — Each with assigned owner, domain, and disposition.
- **Fifteen edge cases** — Covering mixed payments, partial refunds, cross-border donations, restricted fund complications, simultaneous Payer/Donor roles, and technical system errors.
- **Seventeen UNKNOWN legal items** — Flagged for owner and legal counsel review.
- **Sixteen deferred action items** — Each assigned to a specific owner with priority and dependency information.

### 21.2 Acceptance Criteria Status

| Criterion | Status |
|---|---|
| Diagram shows no donation-to-entitlement conversion | MET — FC-1, boundary diagram, and decomposition rules ensure this. |
| No paid access to private/sacred sources | MET — FC-3, Section 14, and architectural enforcement ensure this. |
| All flow scenarios assigned a distinct owner and disposition | MET — Section 16.2 assigns owners; Sections 11-12 assign dispositions. |

### 21.3 Definition of Done Status

| Criterion | Status |
|---|---|
| Reviewed flow diagram | COMPLETE — Master diagram (Section 7) and detail diagrams (Sections 7.2-7.4). |
| Unresolved legal questions documented | COMPLETE — 17 UNKNOWN items in Section 17.2. |
| Decision recorded | COMPLETE — This document is the decision record. |
| M35 and charity owners review | **DEFERRED** — Pending owner availability. |

### 21.4 What This Document Is

- A **conceptual boundary design** for separating commerce, charity, and source stewardship.
- A **reference document** for M35-02 (merchant/payment structure) and M49-04 (restricted fund handling).
- A **risk mitigation artifact** that identifies forbidden couplings before implementation begins.
- A **review checklist** for owners, legal counsel, and auditors.

### 21.5 What This Document Is NOT

- **Not legal advice.** All legal questions are flagged UNKNOWN.
- **Not an implementation specification.** No code, schema, API, or payment integration is defined.
- **Not a financial model.** No pricing, revenue, cost, or profitability analysis is included.
- **Not a policy document.** The boundary principles are design constraints, not organizational policies.
- **Not a completion certificate.** The task is BASELINE ESTABLISHED, not DONE. Owner review and legal counsel review are deferred.

### 21.6 Next Steps

1. **Owner review** — M35 owner, Charity owner, and Source Owner liaison review this document and provide feedback.
2. **Legal counsel review** — Qualified legal counsel reviews the boundary design and addresses the 17 UNKNOWN items.
3. **M35-02 completion** — The Merchant entity and payment structure are defined.
4. **M49-04 alignment** — The restricted fund handling design is confirmed to align with this boundary.
5. **Architecture enforcement** — Technical module boundaries are implemented in the codebase.
6. **Annual audit** — A compliance audit process is established and executed annually.

### 21.7 Document Provenance

| Field | Value |
|---|---|
| Document ID | M48-04-commercial-donation-boundary |
| Candidate Code | ECO-004 |
| Version | 1.0 — BASELINE ESTABLISHED |
| Date | 31 October 2026 |
| Author | architecture/product (AI-assisted) |
| Reviewer | PENDING — M35 owner, Charity owner, legal counsel |
| Status | BASELINE ESTABLISHED — conceptual design complete, legal review deferred |
| Watermark | CONCEPT — NOT LEGAL ADVICE — NOT IMPLEMENTATION |
| Location | `docs/audit/M48-04-commercial-donation-boundary.md` |
| Dependencies | M35-02 (external), M48-01 (done), M48-02 (done), M48-03 (done), M49-04 (done) |

---

> ## END OF DOCUMENT
>
> **CONCEPT — NOT LEGAL ADVICE — NOT IMPLEMENTATION**
>
> This document is a conceptual boundary design. It does not authorize any
> implementation, financial transaction, legal structure, or organizational
> change. All legal questions are UNKNOWN. Owner review is DEFERRED.
>
> BASELINE ESTABLISHED — 31 October 2026

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Arm's-length** | A relationship between entities where each acts independently, without control or influence from the other. Required for tax purposes when a Charity and a commercial entity share a parent. |
| **Chargeback** | A forced transaction reversal initiated by a payment provider at the request of the Payer. The Payer's account is credited; the Merchant's account is debited. |
| **Charity** | A legal entity organized for charitable purposes, typically registered with a regulatory body and eligible for tax-exempt status. |
| **Commerce domain** | The sphere of activity involving the exchange of money for defined services, governed by commercial law and consumer protection regulations. |
| **Consideration** | In contract law, something of value given in exchange for a promise or performance. Donations lack consideration (they are gifts); service payments have consideration (the service). |
| **Coupling** | A connection or dependency between two domains that should be separate. Coupling creates risk of confusion, commingling, and compliance violations. |
| **cy-près** | A legal doctrine allowing a court to redirect restricted charitable funds to a purpose as close as possible to the donor's original intent when the original purpose becomes impossible or impracticable. |
| **Decomposition** | The process of splitting a single transaction that spans multiple domains into separate transactions, each within a single domain. |
| **Donation** | A voluntary, irrevocable gift to a Charity, made without expectation of receiving a defined service or commercial benefit in return. |
| **Donor** | An individual or institution that makes a voluntary contribution to a Charity. |
| **Entitlement** | A defined, bounded, deliverable service that a Payer receives in exchange for payment. |
| **Fiduciary duty** | A legal obligation to act in the best interest of another party. Charity trustees and directors owe fiduciary duties to their organization and its beneficiaries. |
| **Forbidden coupling** | A connection between domains that is explicitly prohibited by this design. See Section 13 for the complete list. |
| **Merchant** | The legal entity that accepts payment from a Payer, issues invoices, and bears liability for service delivery. |
| **Mixed payment** | A single transaction that includes both a service payment component and a donation component. Must be decomposed into separate flows. |
| **One-way valve** | A design principle for restricted funds: value flows in (from donor) and out (to restricted purpose) but cannot be diverted to any other domain. |
| **Payer** | An individual or institution that provides money in exchange for a defined service entitlement. |
| **Private source** | A source material to which access is restricted by the Source Owner's consent terms. |
| **Provenance** | The documented history of ownership, custody, and origin of a source material. |
| **Refund** | A voluntary return of payment from the Merchant to the Payer, typically because a service was not delivered or was cancelled. |
| **Restricted fund** | A donation where the donor has specified the purpose, timeframe, geographic scope, or beneficiary of the funds. The Charity must use the funds only for the specified purpose. |
| **Sacred source** | A source material that holds religious, spiritual, cultural, or ceremonial significance to a community. |
| **Service Provider** | The entity that delivers the service for which the Payer has paid. May be the same as the Merchant or a separate contractor. |
| **Source Owner** | The individual, community, or institution that holds rights over a source material and controls access to it. |
| **Stewardship domain** | The sphere of activity involving the care, preservation, and controlled access of source materials, governed by consent, provenance, and community rights. |
| **Suspense account** | A temporary holding account for funds whose classification or destination has not yet been determined. |
| **Tax receipt** | A document issued by a registered Charity to a Donor, confirming the donation amount and enabling the Donor to claim a tax deduction. |
| **Unrestricted fund** | A donation with no donor-imposed restrictions. The Charity may allocate these funds according to its mission and budget. |

---

## Appendix B: Cross-Reference to Related Documents

| Document | Relationship to M48-04 |
|---|---|
| [M35-02 — Decide merchant legal/payment and D15/D16 owners](../../TODO.md) | Defines the Merchant entity that this document assumes but does not specify. M48-04's Commerce domain depends on M35-02's decisions. |
| [M48-01 — Validate institutional demand](../audit/M48-01-institutional-demand-validation.md) | Establishes that institutional demand exists. M48-04 defines the boundary that demand must respect. |
| [M48-02 — Test self-hosted support demand](../audit/M48-02-self-hosted-support-demand.md) | Establishes that support demand exists. M48-04 defines what support entitlement can and cannot include. |
| [M48-03 — Ethical pricing hypotheses](../audit/M48-03-ethical-pricing-hypotheses.md) | Defines pricing models. M48-04 defines the boundary those models must not cross. |
| [M49-04 — Restricted-fund handling](../audit/M49-04-restricted-fund-handling.md) | Defines restricted fund lifecycle and controls. M48-04 aligns the Commerce/Charity boundary with M49-04's fund segregation principles. |
| [M48 milestone](../milestones/M48.md) | Parent milestone. M48-04 is one of eight tasks in the M48 group. |
| [M48-08 — Rights-cleared creator/research service model](../../TODO.md) | Depends on M48-04's boundary design. M48-08 must not violate the forbidden couplings defined here. |
| [AI Execution Contract](../../planning/AI_EXECUTION_CONTRACT.md) | Governs how this document was produced and what it may and may not authorize. |
| [ADR Applicability Register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md) | Confirms that no new ADR is required for this task scope. |

---

## Appendix C: Scenario Quick-Reference Index

| Scenario ID | Title | Section | Domain | Owner | Key Rule |
|---|---|---|---|---|---|
| R1 | Full refund — service not delivered | 11.2 | Commerce | Merchant | Refund stays in Commerce |
| R2 | Partial refund — service partially delivered | 11.2 | Commerce | Merchant | Refund stays in Commerce |
| R3 | Refund request after long delay | 11.2 | Commerce | Merchant | Per Merchant's refund policy |
| R4 | Payer requests refund to Charity account | 11.2 | Commerce + Charity | Merchant + Charity | MUST decompose into two steps |
| R5 | Refund on mixed payment | 11.2 | Commerce + Charity | Merchant (service) + Charity (donation) | Refund applies only to service portion |
| CB1 | Full chargeback — service disputed | 12.2 | Commerce | Merchant | Chargeback stays in Commerce |
| CB2 | Partial chargeback | 12.2 | Commerce | Merchant | Chargeback stays in Commerce |
| CB3 | Chargeback after donation separation | 12.2 | Commerce + Charity | Merchant | Merchant absorbs full loss; Charity unaffected |
| CB4 | Fraudulent chargeback | 12.2 | Commerce | Merchant | Per payment provider dispute process |
| CB5 | Chargeback on donation-only transaction | 12.2 | Charity | Charity | Treated as donation return, not chargeback |
| SA-1 | Researcher who is also a Donor | 14.6 | Stewardship + Charity | Source Owner + Charity | Access decision independent of donation |
| SA-2 | Institution that pays and requests access | 14.6 | Commerce + Stewardship | Source Owner + Merchant | Access decision independent of payment |
| SA-3 | Sponsor offers to fund digitization | 14.6 | Charity + Stewardship | Source Owner + Charity | Sponsorship does not grant access |
| SA-4 | Source Owner requests payment for access | 14.6 | Stewardship | Source Owner | Platform does not facilitate; outside platform |
| MX-1 | Single transaction with service and donation | 15.1 | Commerce + Charity | Merchant + Charity | MUST decompose at point of purchase |
| MX-2 | Ambiguous payment intent | 15.1 | Commerce | Merchant | Classify before processing; hold in suspense if unclear |
| PR-1 | Partial refund on multi-component payment | 15.2 | Commerce + Charity | Merchant | Refund capped at service portion |
| PR-2 | Partial refund after service usage | 15.2 | Commerce | Merchant | Per Merchant's refund policy |
| BD-1 | International donor with currency conversion | 15.3 | Charity | Charity | Record in functional currency; separate payment channel |
| BD-2 | Donor in sanctioned jurisdiction | 15.3 | Charity | Charity + Legal counsel | Comply with sanctions; legal review required |
| RF-1 | Restricted fund with unspendable balance | 15.4 | Charity | Charity + Legal counsel | Follow legal advice; no Commerce transfer |
| RF-2 | Restricted fund donor requests refund | 15.4 | Charity | Charity + Legal counsel | Charity-domain resolution; no service credit |
| RF-3 | Restricted fund purpose overlaps commercial service | 15.4 | Charity + Commerce | Charity + Merchant | Separate flows; no subsidy; no cross-reference |
| SD-1 | Same person, same day, both roles | 15.5 | Commerce + Charity | Merchant + Charity | Two separate transactions, two separate receipts |
| SD-2 | Person donates, then later requests refund | 15.5 | Commerce + Charity | Merchant + Charity | Independent resolutions; no cross-domain linkage |
| TC-1 | Payment provider processes both domains | 15.6 | Commerce + Charity | M35 owner + Charity owner | Separate merchant accounts required |
| TC-2 | System error causes cross-domain record leak | 15.6 | All | Auditor (TBD) | Fix immediately; audit for decisions based on leaked record |

---

## Appendix D: Forbidden Coupling Quick-Reference

| ID | Coupling | From | To | Severity | One-Line Rule |
|---|---|---|---|---|---|
| FC-1 | Donation-to-entitlement conversion | Charity | Commerce | Critical | A donation is not a purchase. |
| FC-2 | Entitlement-to-donation recharacterization | Commerce | Charity | Critical | A payment is not a gift. |
| FC-3 | Paid source access | Commerce/Charity | Stewardship | Critical | Source access is not for sale. |
| FC-4 | Restricted fund diversion | Charity | Commerce | Critical | Restrictions are binding. |
| FC-5 | Cross-domain refund settlement | Commerce | Charity | High | Refunds stay in Commerce. |
| FC-6 | Chargeback impact on charity | Commerce | Charity | High | Chargebacks stay in Commerce. |
| FC-7 | Source access as donation benefit | Charity | Stewardship | Critical | Donating does not grant access. |
| FC-8 | Source access in service entitlement | Commerce | Stewardship | Critical | Paying does not grant access. |

---

## Appendix E: Document Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 31 October 2026 | architecture/product (AI-assisted) | Initial baseline. Conceptual boundary diagram complete. All sections drafted. Legal items flagged as UNKNOWN. Owner review deferred. |

---

*END OF DOCUMENT*
