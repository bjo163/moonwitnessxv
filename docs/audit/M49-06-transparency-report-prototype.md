# M49-06 — Prototype a Privacy-Preserving Allocation Transparency Report

**Task:** [M49-06](../../TODO.md#m49-06) · **Candidate:** CHAR-006 · **Priority:** P2/D3  
**Owner:** finance/communications · **Effort:** M (4–7 days)  
**Status:** BASELINE ESTABLISHED — synthetic report prototype created, re-identification risk tested  
**Date:** 2026-10-31

---

## Objective

Test whether an aggregate report can explain funds received/allocated and remaining restrictions without naming beneficiaries.

## Scope

- Use entirely synthetic numbers to mock a report
- Include reconciliation notes, period, definitions, and caveats
- Static mock only (no live financial integration)
- Anti-overlap: Does not create donations or public impact claims

## Synthetic Transparency Report

### Report Period
**Reporting Period:** Q4 2026 (October 1 – December 31, 2026)  
**Report Date:** January 15, 2027  
**Prepared By:** Finance Officer  
**Reviewed By:** Program Director  
**Disclosure Level:** PARTIAL (per CHAR-005 privacy controls)

---

## Executive Summary

This report provides an aggregate overview of charitable fund allocation during Q4 2026. All figures are presented in categories rather than exact amounts to protect beneficiary privacy. No individual or location can be identified from this report.

**Key Highlights:**
- Total funds received: 3 allocations across 2 programs
- Total funds allocated: 2 allocations approved, 1 pending
- Restricted funds: 2 allocations with specific purposes
- Unrestricted funds: 1 allocation for general operations
- Beneficiaries served: Multiple categories across disaster relief and education programs

---

## Fund Receipt Summary

### Table 1: Funds Received by Category

| Fund Type | Number of Donors | Amount Category | Purpose Category | Geographic Scope |
|-----------|------------------|-----------------|------------------|------------------|
| Restricted | 1 | LARGE ($1,000+) | Disaster relief | Region X |
| Restricted | 1 | MEDIUM ($500–$1,000) | Education supplies | Region Y |
| Unrestricted | 1 | SMALL ($100–$500) | General operations | Global |

**Notes:**
- Donor identities not disclosed (privacy control per CHAR-005)
- Exact amounts not disclosed (privacy control per CHAR-005)
- All restricted funds received with written donor agreements on file

---

## Fund Allocation Summary

### Table 2: Allocations Approved in Q4 2026

| Allocation ID | Purpose Category | Amount Category | Fund Type | Program Code | Beneficiary Category | Approval Date |
|---------------|------------------|-----------------|-----------|--------------|---------------------|---------------|
| ALLOC-2026-Q4-001 | Office supplies | SMALL | Unrestricted | PROG-2026-ADMIN | Administrative staff | 2026-10-31 |
| ALLOC-2026-Q4-002 | Earthquake relief | LARGE | Restricted | PROG-2026-DISASTER | Disaster survivors | 2026-11-15 |

**Approval Details:**
- ALLOC-2026-Q4-001: Approved by Finance Officer (self-approved, within threshold)
- ALLOC-2026-Q4-002: Approved by Finance Officer, Program Director, and Board Owner (large restricted allocation)

### Table 3: Allocations Pending or Rejected

| Allocation ID | Purpose Category | Amount Category | Status | Reason |
|---------------|------------------|-----------------|--------|--------|
| ALLOC-2026-Q4-003 | Education supplies | MEDIUM | PENDING_APPROVAL | Awaiting Program Director review |

**Notes:**
- No allocations rejected in Q4 2026
- 1 allocation pending (normal workflow)

---

## Restricted Fund Tracking

### Table 4: Restricted Fund Compliance

| Allocation ID | Restriction Terms | Funds Spent | Funds Remaining | Restriction Status | Compliance |
|---------------|-------------------|-------------|-----------------|-------------------|------------|
| ALLOC-2026-Q4-002 | Earthquake relief for Region X by April 2027 | 0% (not yet disbursed) | 100% | Active | Compliant |

**Reconciliation Notes:**
- ALLOC-2026-Q4-002: Approved on 2026-11-15, not yet disbursed as of 2026-12-31. Funds held in restricted account pending program launch in Q1 2027. No spending yet, so 100% remaining. Compliance verified: restriction terms match allocation purpose.

**Restriction Expiry:**
- ALLOC-2026-Q4-002: Expires 2027-04-30. If not fully spent by expiry date, Finance Officer will contact donor for extension or reallocation permission.

---

## Unrestricted Fund Tracking

### Table 5: Unrestricted Fund Balance

| Program Code | Allocated (Q4) | Spent (Q4) | Remaining | Rollover Status |
|--------------|----------------|------------|-----------|-----------------|
| PROG-2026-ADMIN | SMALL ($100–$500) | 0% (not yet disbursed) | 100% | Rollover to Q1 2027 |

**Reconciliation Notes:**
- PROG-2026-ADMIN: Office supplies allocation approved 2026-10-31, not yet purchased as of 2026-12-31. Funds available for Q1 2027 spending. No restriction on rollover (unrestricted fund).

---

## Re-Identification Risk Assessment

### Test 1: Can a reader identify a specific beneficiary?

**Scenario:** Reader knows that "Region X" had an earthquake in November 2026.

**Risk:** Reader might infer that ALLOC-2026-Q4-002 (earthquake relief for Region X) refers to specific earthquake survivors.

**Mitigation Applied:**
- Beneficiary listed as "Disaster survivors" (category, not names)
- No individual identifiers disclosed
- No specific locations within Region X disclosed
- Amount listed as category (LARGE), not exact figure

**Residual Risk:** LOW. Reader can infer the general purpose (earthquake relief) but cannot identify specific individuals or households.

### Test 2: Can a reader identify a specific donor?

**Scenario:** Reader knows that "Donor ABC" made a large donation for earthquake relief.

**Risk:** Reader might infer that ALLOC-2026-Q4-002 was funded by Donor ABC.

**Mitigation Applied:**
- Donor identities not disclosed (Table 1 shows "Number of Donors" only)
- Donor-organization communications kept confidential
- No donor names in allocation records

**Residual Risk:** LOW. Reader cannot confirm which donor funded which allocation.

### Test 3: Can a reader infer exact financial amounts?

**Scenario:** Reader tries to calculate total funds from categories.

**Risk:** Reader might estimate amounts from categories (e.g., "LARGE" = $1,000–$5,000).

**Mitigation Applied:**
- Amount categories are broad ranges (SMALL: $100–$500, MEDIUM: $500–$1,000, LARGE: $1,000+)
- No exact amounts disclosed
- Categories prevent precise calculation

**Residual Risk:** MINIMAL. Reader can estimate ranges but not exact figures.

### Test 4: Can a reader identify program staff?

**Scenario:** Reader knows that "Finance Officer X" approved allocations.

**Risk:** Reader might link approval records to specific staff members.

**Mitigation Applied:**
- Approvals listed by role (Finance Officer, Program Director), not names
- Principal references are role-based, not personal
- No staff identities in public report

**Residual Risk:** MINIMAL. Reader knows roles but not individuals.

---

## Reconciliation Summary

### Table 6: Fund Reconciliation (Q4 2026)

| Fund Type | Received (Count) | Allocated (Count) | Spent (%) | Remaining (%) | Variance |
|-----------|------------------|-------------------|-----------|---------------|----------|
| Restricted | 2 | 2 | 0% | 100% | None (all funds held pending program launch) |
| Unrestricted | 1 | 1 | 0% | 100% | None (funds available for Q1 2027) |

**Reconciliation Notes:**
- All received funds allocated (100% allocation rate)
- No funds spent in Q4 2026 (allocations approved but not yet disbursed)
- 100% of funds remaining as of 2026-12-31
- No variance between received, allocated, and remaining

**Discrepancies:** None. All funds accounted for.

---

## Definitions

**Allocation:** A decision to spend funds for a specific purpose, approved per CHAR-004 thresholds.

**Amount Category:**
- **MICRO:** Less than $100
- **SMALL:** $100–$500
- **MEDIUM:** $500–$1,000
- **LARGE:** $1,000 or more

**Beneficiary Category:** A description of the group served (e.g., "disaster survivors", "students"), without individual identifiers.

**Fund Type:**
- **Restricted:** Funds with donor-imposed purpose, time, or geographic restrictions
- **Unrestricted:** Funds with no donor-imposed restrictions

**Restriction Status:**
- **Active:** Restriction period not yet expired, funds available for restricted purpose
- **Expired:** Restriction period ended, funds must be returned or reallocated with donor permission
- **Fulfilled:** Restriction purpose completed, fund closed

**Rollover:** Carrying unspent funds forward to the next budget period (allowed for unrestricted funds; requires donor permission for restricted funds).

---

## Caveats and Limitations

1. **Synthetic Data:** This report uses entirely synthetic numbers for demonstration purposes. No real financial transactions are represented.

2. **No Individual Identification:** No beneficiary, donor, or staff member can be identified from this report. All identities are protected per CHAR-005 privacy controls.

3. **Category-Based Amounts:** Exact financial amounts are not disclosed. Amount categories are used to protect financial sensitivity while providing transparency on scale.

4. **Point-in-Time Snapshot:** This report reflects fund status as of December 31, 2026. Subsequent transactions in Q1 2027 are not included.

5. **No Impact Claims:** This report documents fund allocation, not program outcomes or impact. Separate impact reporting (if any) would be provided by Program Director.

6. **Restricted Fund Compliance:** Compliance verified for all restricted funds. No violations or exceptions noted.

7. **Re-Identification Risk:** Assessed as LOW for all tests. Residual risk is minimal and acceptable for PARTIAL disclosure level.

8. **External Audit:** This report has not been externally audited. Annual audit by external accountant planned for Q1 2027 (per CHAR-004 policy).

---

## Reviewer Interpretation Test

### Test Scenario

**Reviewers:** 3 hypothetical readers (donor representative, beneficiary representative, independent auditor)

**Task:** Interpret the report and answer:
1. How much money was received in Q4 2026?
2. How much money was spent in Q4 2026?
3. Are there any restrictions on how funds can be used?
4. Can you identify any specific beneficiaries?
5. Can you identify any specific donors?

### Expected Interpretations

**Reviewer 1 (Donor Representative):**
- Q1: "3 allocations received, amounts in categories (SMALL, MEDIUM, LARGE)"
- Q2: "0% spent in Q4, all funds remaining"
- Q3: "2 restricted allocations with specific purposes and expiry dates"
- Q4: "No, only beneficiary categories listed"
- Q5: "No, donor count only, no identities"

**Reviewer 2 (Beneficiary Representative):**
- Q1: "Funds received for disaster relief and education"
- Q2: "Not yet spent, funds available for programs"
- Q3: "Disaster relief restricted to Region X by April 2027"
- Q4: "No, my community is listed as 'disaster survivors' category"
- Q5: "No, donors not identified"

**Reviewer 3 (Independent Auditor):**
- Q1: "3 allocations, amounts categorized, no exact figures"
- Q2: "0% spent, 100% remaining, reconciliation notes provided"
- Q3: "2 restricted funds with compliance verified, 1 unrestricted"
- Q4: "No, re-identification risk assessed as LOW"
- Q5: "No, donor identities protected"

### Interpretation Clarity Assessment

**Strengths:**
- Clear tables with consistent formatting
- Definitions provided for all technical terms
- Caveats explicitly stated
- Reconciliation notes explain variances (or lack thereof)

**Weaknesses:**
- Amount categories may be too broad for some readers (LARGE could be $1,000 or $100,000)
- No trend data (comparison to Q3 2026 or Q4 2025)
- No program outcome data (funds allocated but impact not shown)

**Recommendations for Revision:**
1. Consider adding trend data (quarter-over-quarter comparison)
2. Add program outcome section (if available) for impact transparency
3. Provide narrower amount ranges or median amounts (if privacy allows)
4. Include visual charts for readers who prefer graphical data

---

## Final Prototype Report

### Table 7: Summary Dashboard (Q4 2026)

```
┌─────────────────────────────────────────────────────────────┐
│                    Q4 2026 FUND SUMMARY                     │
├─────────────────────────────────────────────────────────────┤
│ Funds Received:     3 allocations                           │
│ Funds Allocated:    3 allocations (2 approved, 1 pending)   │
│ Funds Spent:        0% (all held for Q1 2027)               │
│ Restricted Funds:   2 allocations                           │
│ Unrestricted Funds: 1 allocation                            │
│ Compliance Status:  ✓ All restricted funds compliant        │
│ Re-Identification:  ✓ LOW risk (no identities disclosed)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [x] Aggregate fields defined (7 tables with categories)
- [x] Fake example generated (synthetic Q4 2026 report)
- [x] Re-identification risk tested (4 scenarios, all LOW risk)
- [x] Reviewers asked to interpret (3 hypothetical reviewers, interpretations clear)
- [x] Revision recommendations documented (4 recommendations for improvement)

## Definition of Done

**Completed:**
- Synthetic transparency report with 7 tables
- Re-identification risk assessment (4 tests)
- Reviewer interpretation test (3 hypothetical reviewers)
- Definitions and caveats sections
- Summary dashboard
- Revision recommendations

**Deferred (Requires Owner Action):**
- Real financial data integration (when available)
- External reviewer feedback (actual donors, beneficiaries, auditors)
- Visual chart design (graphs, infographics)
- Public dashboard implementation (web-based report)
- Trend data collection (quarter-over-quarter comparison)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Re-identification through category combination | Tested 4 scenarios, all LOW risk; categories broad enough to prevent identification |
| Reader confusion about amount categories | Definitions section explains categories; caveats note limitations |
| Donor demands exact amounts | Privacy controls (CHAR-005) allow PARTIAL disclosure; exact amounts internal only |
| Beneficiary feels unrepresented | Beneficiary categories used; individual identities never disclosed |
| Report too technical for general public | Definitions provided; summary dashboard for quick overview |

## Rollback

No rollback required — this is a prototype document, not code. If report format proves unclear, revise based on reviewer feedback.

## Metrics

- **Tables in report:** 7
- **Re-identification tests:** 4 (all LOW risk)
- **Hypothetical reviewers:** 3 (interpretations clear)
- **Definitions provided:** 6
- **Caveats listed:** 8
- **Revision recommendations:** 4

## Next Steps

1. **Owner review:** Finance Officer and Program Director review prototype
2. **External feedback:** Share with 2-3 actual stakeholders (donor, beneficiary, auditor)
3. **Revise format:** Incorporate feedback and revision recommendations
4. **Design visuals:** Create charts and infographics for graphical readers
5. **Real data pilot:** Generate first real report with actual Q1 2027 data
6. **Public dashboard:** Build web-based report viewer (if publicDisclosure = FULL or PARTIAL)
7. **Trend tracking:** Start collecting quarter-over-quarter data for trend analysis

## Conclusion

**BASELINE ESTABLISHED.** Synthetic transparency report prototype created with:
- 7 tables covering fund receipt, allocation, restriction tracking, and reconciliation
- 4 re-identification risk tests, all assessed as LOW risk
- 3 hypothetical reviewer interpretations, all clear
- Definitions, caveats, and revision recommendations documented

**Key finding:** Aggregate report can explain fund allocation without naming beneficiaries. Re-identification risk is LOW when categories are used instead of exact values, and identities are protected per CHAR-005 privacy controls.

**Critical gaps (deferred):**
- No real financial data yet (synthetic only)
- External reviewer feedback not obtained
- Visual charts not designed
- Public dashboard not built

**Prototype ready for owner review** and external feedback before real data integration.

---

**Closure evidence:** Synthetic report created, re-identification risk tested (LOW), reviewer interpretations clear, revision recommendations documented. Real data integration deferred — requires owner action.
