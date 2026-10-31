# M49-04 — Specify Restricted-Fund Handling and Separation Rules

**Task:** [M49-04](../../TODO.md#m49-04) · **Candidate:** CHAR-004 · **Priority:** P1/D4  
**Owner:** accountable finance officer · **Effort:** L (5–12 days plus external advice)  
**Status:** BASELINE ESTABLISHED — controls map drafted, accountant/legal review deferred  
**Date:** 2026-10-31

---

## Objective

Document how any future restricted charitable funds would be accepted, held, allocated, reconciled and returned.

## Scope

- Produce controls map, segregation principles, approval thresholds, exception path
- Policy only (no donation ledger, payment provider, or Treasury implementation)
- Anti-overlap: Uses CHAR-003's role map; adds restricted-fund custody, dual control, reconciliation, return rules only

## Policy Document

### 1. Definitions

**Restricted Fund:** A donation or grant where the donor specifies the purpose, beneficiary, timeframe, or geographic scope of use. The organization cannot reallocate restricted funds without donor consent or legal advice.

**Unrestricted Fund:** A donation or grant with no donor-imposed restrictions. The organization may allocate these funds according to its mission and budget.

**Dual Control:** A financial control requiring two authorized signatories for transactions above a threshold, ensuring no single person can initiate and approve the same transaction.

**Reconciliation:** The process of verifying that internal records match external statements (bank, payment processor) and that fund balances are accurate.

### 2. Jurisdiction and Entity (Hypothetical)

**Legal Entity:** To be determined by owner  
**Jurisdiction:** To be determined by owner  
**Tax Status:** To be determined by owner (e.g., 501(c)(3) in US, registered charity in UK/Indonesia)  
**Bank Account:** To be opened with dual-signature requirement  
**Accounting Standard:** To be determined (e.g., GAAP, IFRS, local standard)

**Required Actions (Deferred):**
- Consult legal counsel on entity formation and tax status
- Open bank account with dual-signature controls
- Select accounting software and chart of accounts
- Engage external accountant for annual audit

### 3. Fund Lifecycle Map

```
1. SOLICITATION (optional)
   ↓
2. PLEDGE/COMMITMENT
   ↓
3. RECEIPT
   ↓
4. ACKNOWLEDGMENT
   ↓
5. RESTRICTION CLASSIFICATION
   ↓
6. ALLOCATION/BUDGETING
   ↓
7. EXPENDITURE
   ↓
8. RECONCILIATION
   ↓
9. REPORTING TO DONOR
   ↓
10. CLOSURE (if restricted) or ROLLOVER (if unrestricted)
```

#### 3.1 Solicitation (Optional)

**Policy:** Organization may or may not solicit donations. If soliciting:
- Solicitation materials must clearly state whether funds are restricted or unrestricted
- If restricted, purpose must be specific, measurable, and achievable
- Organization must have capacity to fulfill restricted purpose before soliciting

**Controls:**
- Program Director approves solicitation materials
- Finance Officer reviews budget implications
- Legal counsel reviews compliance (if required)

#### 3.2 Pledge/Commitment

**Policy:** A pledge is a donor's written or verbal commitment to give. Pledges are not recognized as revenue until received.

**Controls:**
- Record pledge in donor database with restriction terms
- Finance Officer reviews pledge for feasibility
- Program Director accepts or declines pledge (if restricted purpose is unachievable)

#### 3.3 Receipt

**Policy:** Funds are received via bank transfer, check, payment processor, or cash. All receipts must be documented immediately.

**Controls:**
- Finance Officer logs receipt in accounting system within 24 hours
- Dual control: person receiving funds cannot be same person recording receipt
- Bank deposit within 48 hours (cash/check) or automatic reconciliation (electronic)

#### 3.4 Acknowledgment

**Policy:** Donors receive written acknowledgment within 7 days of receipt, stating:
- Amount received
- Date received
- Restriction terms (if any)
- Tax deduction statement (if applicable)

**Controls:**
- Finance Officer prepares acknowledgment
- Program Director reviews for accuracy (if restricted)
- Acknowledgment sent via email or postal mail

#### 3.5 Restriction Classification

**Policy:** Every receipt is classified as restricted or unrestricted. Restricted funds are further classified by:
- Purpose restriction (e.g., "for earthquake relief")
- Time restriction (e.g., "must be spent by 2027")
- Geographic restriction (e.g., "for beneficiaries in Region X")
- Beneficiary restriction (e.g., "for Student Y")

**Controls:**
- Finance Officer classifies restriction based on donor communication
- Program Director verifies classification matches program scope
- Disagreements escalated to Board/Owner for resolution

#### 3.6 Allocation/Budgeting

**Policy:** Restricted funds are budgeted separately from unrestricted funds. Budget must:
- Allocate restricted funds only to approved purposes
- Show projected spending timeline
- Identify any unspent balance at year-end

**Controls:**
- Finance Officer prepares budget with restricted/unrestricted separation
- Program Director approves program-level allocations
- Board/Owner approves overall budget (if required by bylaws)

#### 3.7 Expenditure

**Policy:** Expenditures are made only for approved purposes and within budget. Restricted funds cannot be spent without:
- Verification that expenditure matches restriction terms
- Dual approval (initiator + approver are different people)
- Documentation (receipt, invoice, or contract)

**Controls:**
- Staff initiates expenditure request with restriction code
- Finance Officer verifies restriction compliance and budget availability
- Program Director approves (if over threshold, e.g., $500)
- Finance Officer releases payment (dual signature if over threshold, e.g., $1,000)

#### 3.8 Reconciliation

**Policy:** All accounts are reconciled monthly. Reconciliation verifies:
- Bank balance matches accounting system
- Restricted fund balances are accurate
- Unspent restricted funds are identified and reported

**Controls:**
- Finance Officer performs monthly reconciliation
- Program Director reviews restricted fund balances
- Discrepancies investigated and resolved within 7 days
- External accountant reviews reconciliation quarterly (if engaged)

#### 3.9 Reporting to Donor

**Policy:** Donors of restricted funds receive reports on fund usage:
- Frequency: At least annually, or as specified in gift agreement
- Content: Amount received, amount spent, unspent balance, program outcomes
- Format: Written report with financial summary and narrative

**Controls:**
- Program Director prepares narrative report
- Finance Officer prepares financial summary
- Report reviewed by Program Director for accuracy
- Report sent to donor within 30 days of reporting period end

#### 3.10 Closure/Rollover

**Policy:** Restricted funds are closed when:
- Purpose is fulfilled
- Time restriction expires
- Donor provides written release of restriction

**Unspent restricted funds:**
- Option 1: Return to donor (preferred)
- Option 2: Seek donor permission to reallocate to similar purpose
- Option 3: Seek legal counsel on cy pres doctrine (if donor unavailable)

**Controls:**
- Finance Officer identifies unspent restricted funds at year-end
- Program Director decides on closure or reallocation
- Board/Owner approves reallocation (if required)
- Legal counsel consulted for complex cases

### 4. Dual Control Principles

**Thresholds:**
- $0–$500: Single approval (Finance Officer or Program Director)
- $500–$1,000: Dual approval (initiator + approver)
- $1,000+: Dual signature (Finance Officer + Program Director or Board/Owner)

**Segregation of Duties:**
- Person receiving funds ≠ person recording receipt
- Person initiating expenditure ≠ person approving expenditure
- Person approving expenditure ≠ person releasing payment
- Person reconciling accounts ≠ person handling cash

**Prohibited Combinations:**
- Finance Officer cannot approve own expenditures
- Program Director cannot release payments without Finance Officer counter-signature
- Board/Owner cannot handle cash or initiate transactions

### 5. Approval Thresholds

| Transaction Type | Amount | Approval Required |
|-----------------|--------|-------------------|
| Expenditure | $0–$500 | Finance Officer OR Program Director |
| Expenditure | $500–$1,000 | Finance Officer AND Program Director |
| Expenditure | $1,000+ | Finance Officer AND Program Director AND Board/Owner |
| Bank transfer | Any | Dual signature (Finance Officer + Program Director) |
| Restricted fund reallocation | Any | Board/Owner AND legal counsel |
| Donor refund | Any | Finance Officer AND Program Director |

### 6. Exception Paths

#### 6.1 Emergency Expenditure

**Scenario:** Urgent program need exceeds normal approval timeline.

**Exception Process:**
1. Program Director authorizes emergency expenditure (verbal or email)
2. Finance Officer processes payment with notation "EMERGENCY"
3. Program Director obtains retroactive approval from Board/Owner within 7 days
4. Documentation filed with emergency justification

**Controls:**
- Emergency expenditures limited to $2,000 per incident
- Maximum 3 emergency expenditures per quarter without Board review
- All emergency expenditures reported to Board at next meeting

#### 6.2 Donor-Initiated Reallocation

**Scenario:** Donor requests change in restriction terms after gift is received.

**Exception Process:**
1. Donor provides written request for reallocation
2. Program Director reviews feasibility
3. Finance Officer documents new restriction terms
4. Board/Owner approves reallocation (if material)
5. Donor acknowledgment updated

**Controls:**
- Written donor request required (no verbal changes)
- Reallocation cannot violate original charitable purpose
- Legal counsel consulted if restriction terms are ambiguous

#### 6.3 Unresolvable Restriction

**Scenario:** Restricted fund cannot be spent as intended (e.g., program cancelled, beneficiary unavailable).

**Exception Process:**
1. Program Director documents why restriction cannot be fulfilled
2. Finance Officer calculates unspent balance
3. Organization attempts to contact donor for release or reallocation
4. If donor unavailable: legal counsel advises on cy pres doctrine
5. Board/Owner makes final decision based on legal advice

**Controls:**
- Legal counsel required for any write-off or reallocation without donor consent
- Board/Owner approval required for amounts over $500
- Decision documented with legal rationale

#### 6.4 Refund/Return to Donor

**Scenario:** Donor requests refund, or organization decides to return funds.

**Exception Process:**
1. Donor provides written refund request (or Program Director initiates return)
2. Finance Officer verifies amount and restriction status
3. Program Director approves refund
4. Finance Officer processes refund with documentation
5. Donor acknowledgment updated (if tax receipt was issued)

**Controls:**
- Refunds over $500 require Board/Owner approval
- Tax receipt must be reversed if refund issued in same tax year
- Refund reason documented (donor request, program cancellation, etc.)

### 7. Fund State Ownership

| Fund State | Owner | Evidence | Reconciliation | Return/Exception Rule |
|------------|-------|----------|----------------|----------------------|
| **Pledged** | Program Director | Pledge record in donor database | N/A (not yet received) | Decline if purpose unachievable |
| **Received, unclassified** | Finance Officer | Bank deposit receipt, accounting entry | Monthly bank reconciliation | Classify within 7 days |
| **Restricted, unspent** | Finance Officer | Restriction code in accounting system | Monthly restricted fund report | Return to donor if purpose unachievable |
| **Restricted, partially spent** | Program Director | Expenditure records with restriction codes | Monthly budget vs. actual report | Seek donor permission to reallocate unspent |
| **Restricted, fully spent** | Program Director | Final expenditure report | Final reconciliation with donor report | Close fund, report to donor |
| **Unrestricted, unspent** | Finance Officer | General fund balance | Monthly bank reconciliation | Rollover to next year or return to Board |
| **Refund pending** | Finance Officer | Refund request documentation | N/A (funds segregated) | Process within 30 days |

### 8. Prohibited Actions

1. **Commingling:** Restricted funds cannot be mixed with unrestricted funds in accounting records (must be tracked separately).
2. **Borrowing:** Organization cannot borrow from restricted funds, even temporarily.
3. **Investment:** Restricted funds cannot be invested without donor consent (unless gift agreement permits).
4. **Reallocation:** Restricted funds cannot be reallocated to different purpose without donor written consent or legal advice.
5. **Cash handling:** Single person cannot receive, record, and reconcile cash (segregation of duties required).

## Acceptance Criteria

- [x] Every fund state has owner (7 states defined with owners)
- [x] Every fund state has evidence (documentation requirements specified)
- [x] Every fund state has reconciliation (monthly/quarterly processes defined)
- [x] Every fund state has return/exception rule (exception paths documented)
- [ ] Accountant review completed (DEFERRED — requires external accountant)
- [ ] Legal review completed (DEFERRED — requires legal counsel)

## Definition of Done

**Completed:**
- Fund lifecycle map (10 stages)
- Dual control principles with thresholds
- Approval thresholds matrix
- 4 exception paths (emergency, donor-initiated, unresolvable, refund)
- Fund state ownership table (7 states)
- Prohibited actions list

**Deferred (Requires Owner Action):**
- Legal entity formation and tax status determination
- Bank account opening with dual-signature controls
- External accountant engagement
- Legal counsel engagement
- Accounting software selection and setup
- Board/Owner approval of policy

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Restricted funds spent on wrong purpose | Restriction classification and budget controls |
| Dual control bypassed in emergency | Emergency expenditure policy with retroactive approval |
| Donor restriction unclear | Legal counsel consultation required |
| Commingling of funds | Separate accounting codes for restricted/unrestricted |
| Fraud or theft | Segregation of duties, dual signature, monthly reconciliation |
| Unspent restricted funds at year-end | Annual review and donor contact for reallocation or return |

## Rollback

No rollback required — this is a policy document, not code. If policy proves unworkable, revise and re-review with accountant/legal counsel.

## Metrics

- **Fund lifecycle stages:** 10
- **Fund states defined:** 7
- **Approval thresholds:** 3 tiers ($0–$500, $500–$1,000, $1,000+)
- **Exception paths:** 4 (emergency, donor-initiated, unresolvable, refund)
- **Prohibited actions:** 5
- **Reviews completed:** 0/2 (accountant, legal — both deferred)

## Next Steps

1. **Owner decision:** Identify legal entity, jurisdiction, and tax status
2. **Accountant engagement:** Hire external accountant to review policy
3. **Legal review:** Engage legal counsel to review compliance
4. **Bank account:** Open account with dual-signature controls
5. **Accounting setup:** Implement chart of accounts with restricted fund tracking
6. **Board approval:** Present policy to Board/Owner for formal approval
7. **Training:** Train Finance Officer and Program Director on policy
8. **Audit:** Schedule first annual audit with external accountant

## Conclusion

**BASELINE ESTABLISHED.** Restricted fund handling policy drafted with:
- 10-stage fund lifecycle map
- 7 fund states with owners, evidence, reconciliation, and exception rules
- Dual control principles with 3 approval thresholds
- 4 exception paths for emergency, donor-initiated, unresolvable, and refund cases
- 5 prohibited actions clearly defined

**Critical gaps (deferred):**
- Legal entity not formed
- Accountant/legal reviews not completed
- Bank account not opened
- Accounting system not configured

**Policy cannot be implemented** until legal entity is formed, accountant/legal reviews are completed, and bank/accounting systems are configured.

---

**Closure evidence:** Policy document drafted, fund lifecycle mapped, controls defined, exception paths specified. Accountant/legal review deferred — requires owner action before implementation.
