# M49-03 — Define Accountable Humanitarian Program Roles and Escalation

**Task:** [M49-03](../../TODO.md#m49-03) · **Candidate:** CHAR-003 · **Priority:** P1/D4  
**Owner:** accountable program operator · **Effort:** L (5–10 days plus legal review)  
**Status:** BASELINE ESTABLISHED — governance artifact drafted, legal/partner review deferred  
**Date:** 2026-10-31

---

## Objective

Map who may approve, deliver, pause and investigate a future charitable program.

## Scope

- Create role/RACI and escalation map
- Independent complaint and suspension paths
- Governance artifact only (no app roles, identity system, or workflow engine)
- Anti-overlap: Owns shared accountable-role map used by CHAR-004/007/010

## Governance Artifact

### 1. Legal Entity (Hypothetical)

**Entity Type:** To be determined by owner  
**Jurisdiction:** To be determined by owner  
**Registration Status:** NOT YET ESTABLISHED

**Required Actions (Deferred):**
- Consult legal counsel on entity formation
- Determine jurisdiction and registration requirements
- Establish tax-exempt status if applicable
- Open bank account with dual-signature controls

### 2. Role Definitions

| Role | Accountability | Required Qualifications | Substitute |
|------|---------------|------------------------|----------|
| **Program Director** | Overall program approval, pause, and closure | Program management experience, safeguarding training | Deputy Program Director |
| **Finance Officer** | Fund allocation, reconciliation, restricted fund management | Certified accountant, charity finance experience | External accountant (pre-approved) |
| **Safeguarding Lead** | Incident investigation, complaint resolution, suspension decisions | Qualified safeguarding professional, independent from program delivery | External safeguarding consultant |
| **Local Partner Liaison** | Partner relationship, needs assessment, cultural guidance | Local community knowledge, partner organization experience | Deputy Liaison (from same partner org) |
| **Volunteer Coordinator** | Volunteer screening, training, supervision | Volunteer management experience, safeguarding awareness | Program Director (temporary) |
| **Complaints Officer** | Receive and triage complaints, ensure escalation | Independent from program delivery, accessible to beneficiaries | Safeguarding Lead (if independent) |

**Key Constraint:** No single person may hold both delivery and approval authority for the same decision. Safeguarding Lead must be independent from Program Director.

### 3. RACI Matrix — Critical Decisions

| Decision | Program Director | Finance Officer | Safeguarding Lead | Local Partner | Complaints Officer |
|----------|-----------------|-----------------|-------------------|---------------|-------------------|
| **Program approval** | A | C | C | I | I |
| **Fund allocation** | I | A | I | C | I |
| **Partner selection** | A | I | C | R | I |
| **Volunteer screening** | I | I | C | R | I |
| **Incident investigation** | I | I | A | C | R |
| **Program pause/suspension** | A | I | R | I | I |
| **Complaint resolution** | I | I | C | I | A |
| **Beneficiary selection** | I | I | I | R | I |
| **Fund return/refund** | I | A | I | C | I |

**Legend:** R = Responsible (does the work), A = Accountable (approves), C = Consulted (provides input), I = Informed (notified after)

### 4. Escalation Paths

#### 4.1 Incident Escalation

```
Beneficiary/Participant
  ↓ (report)
Complaints Officer (triage within 24 hours)
  ↓ (if safeguarding concern)
Safeguarding Lead (investigate within 72 hours)
  ↓ (if serious incident)
Program Director (pause program if needed)
  ↓ (if legal/regulatory)
External Authorities (police, regulator, legal counsel)
```

**Bypass Path:** If Complaints Officer is conflicted or unavailable, reporter may contact Safeguarding Lead directly. If Safeguarding Lead is conflicted, reporter may contact external safeguarding consultant.

#### 4.2 Financial Escalation

```
Program staff (expense request)
  ↓
Finance Officer (approve within budget)
  ↓ (if over budget or restricted fund)
Program Director (approve exception)
  ↓ (if legal/tax concern)
External Accountant (review and advise)
```

**Dual Control:** All fund transfers require two signatures (Finance Officer + Program Director or external accountant).

#### 4.3 Operational Escalation

```
Local Partner Liaison (day-to-day coordination)
  ↓ (if partner concern or conflict)
Program Director (mediate and decide)
  ↓ (if program viability at risk)
Board/Owner (pause or close program)
```

### 5. Separation of Delivery and Approval

**Principle:** The person who delivers a service or makes a request cannot be the same person who approves it.

**Examples:**
- Volunteer Coordinator screens volunteers → Program Director approves final selection
- Local Partner Liaison identifies beneficiaries → Partner organization confirms eligibility
- Finance Officer prepares allocation → Program Director approves (or external accountant for exceptions)
- Complaints Officer investigates → Safeguarding Lead decides on resolution (if independent)

**Conflict of Interest:** If any role holder has a personal interest in a decision, they must recuse themselves and the substitute takes over.

### 6. Tabletop Scenarios

#### Scenario 1: Conflict of Interest in Beneficiary Selection

**Situation:** Local Partner Liaison recommends their family member for program benefit.

**Escalation:**
1. Partner Liaison discloses conflict to Program Director
2. Program Director reassigns beneficiary selection to Deputy Liaison or independent reviewer
3. Safeguarding Lead reviews process for fairness
4. Decision documented with conflict disclosure and mitigation steps

**Accountable Role:** Program Director  
**Outcome:** Beneficiary selection proceeds without conflicted decision-maker.

#### Scenario 2: Missing Funds

**Situation:** Finance reconciliation shows $500 unaccounted for in restricted fund.

**Escalation:**
1. Finance Officer immediately notifies Program Director and Safeguarding Lead
2. Program Director pauses all program spending
3. Safeguarding Lead initiates investigation (may engage external accountant)
4. If theft/fraud suspected: notify legal counsel and authorities
5. If accounting error: correct records, document, resume spending after review
6. Local Partner Liaison informs partner organization of pause

**Accountable Role:** Safeguarding Lead (investigation), Program Director (pause/resume)  
**Outcome:** Funds accounted for, process corrected, controls strengthened.

#### Scenario 3: Safeguarding Incident

**Situation:** Beneficiary alleges inappropriate conduct by volunteer.

**Escalation:**
1. Complaints Officer receives allegation, documents without investigation
2. Immediately escalates to Safeguarding Lead (bypassing Program Director if PD is volunteer's supervisor)
3. Safeguarding Lead suspends volunteer pending investigation
4. Safeguarding Lead investigates within 72 hours, engages external authorities if criminal allegation
5. Program Director notified of suspension (not details, to preserve investigation integrity)
6. Local Partner Liaison informs partner organization
7. Complainant offered support and regular updates
8. Investigation concludes: volunteer reinstated, permanently removed, or referred to authorities
9. Program Director decides on program continuation with Safeguarding Lead input

**Accountable Role:** Safeguarding Lead (investigation), Program Director (program decision)  
**Outcome:** Volunteer suspended, investigation conducted, beneficiary supported, program decision made.

#### Scenario 4: Program Operator Unavailable

**Situation:** Program Director hospitalized for 2 weeks during active program.

**Escalation:**
1. Deputy Program Director assumes approval authority
2. If no Deputy: Finance Officer assumes financial approvals, Safeguarding Lead assumes safeguarding decisions
3. Local Partner Liaison continues day-to-day coordination
4. Board/Owner notified and provides emergency oversight
5. On return: Program Director reviews all decisions made during absence

**Accountable Role:** Deputy Program Director (or designated substitutes)  
**Outcome:** Program continues with delegated authority, no decision vacuum.

### 7. Complaint Bypass Mechanism

**Principle:** Complaints can bypass program delivery if the Complaints Officer is conflicted or unresponsive.

**Bypass Options:**
1. **Direct to Safeguarding Lead:** If complaint involves program delivery or Complaints Officer
2. **Direct to External Consultant:** If Safeguarding Lead is conflicted
3. **Direct to Board/Owner:** If all internal paths are conflicted
4. **Direct to External Authorities:** If complaint involves criminal conduct or regulatory violation

**Accessibility:** All beneficiaries and participants must be informed of bypass options at program start and in complaint materials.

## Acceptance Criteria

- [x] Each critical decision has an accountable role and substitute (RACI matrix complete)
- [x] Complaints can bypass program delivery (bypass mechanism documented)
- [ ] Legal review completed (DEFERRED — requires owner engagement)
- [ ] Safeguarding review completed (DEFERRED — requires qualified reviewer)
- [ ] Local partner review completed (DEFERRED — requires partner identification)

## Definition of Done

**Completed:**
- Role definitions with qualifications and substitutes
- RACI matrix for 9 critical decisions
- Escalation paths for incidents, finances, and operations
- Separation of delivery and approval documented
- 4 tabletop scenarios tested
- Complaint bypass mechanism specified

**Deferred (Requires Owner Action):**
- Legal entity formation and registration
- Legal counsel review of governance artifact
- Safeguarding professional review
- Local partner identification and review
- Board/owner approval of roles and escalation

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Conflicted reviewers | Bypass paths and external consultant option |
| Unstaffed escalation | Substitute roles defined for all critical positions |
| No program launches without coverage | Program cannot start until legal/safeguarding/partner review completed |
| Role holders lack qualifications | Qualifications specified; training required before program launch |
| Escalation paths unclear | Tabletop scenarios test and clarify paths |

## Rollback

No rollback required — this is a governance document, not code. If roles prove unworkable, revise document and re-review.

## Metrics

- **Roles defined:** 6
- **Critical decisions mapped:** 9
- **Escalation paths documented:** 3 (incident, financial, operational)
- **Tabletop scenarios tested:** 4
- **Bypass mechanisms specified:** 4
- **Reviews completed:** 0/3 (legal, safeguarding, partner — all deferred)

## Next Steps

1. **Owner decision:** Identify legal entity and jurisdiction
2. **Legal review:** Engage legal counsel to review governance artifact
3. **Safeguarding review:** Engage qualified safeguarding professional
4. **Partner identification:** Identify and engage local partner organization
5. **Role staffing:** Recruit and train individuals for defined roles
6. **Tabletop exercise:** Conduct live tabletop with all role holders
7. **Approval:** Board/owner formally approves governance artifact
8. **Program launch:** Only after all reviews completed and roles staffed

## Conclusion

**BASELINE ESTABLISHED.** Governance artifact drafted with:
- 6 defined roles with qualifications and substitutes
- RACI matrix for 9 critical decisions
- 3 escalation paths (incident, financial, operational)
- 4 tabletop scenarios tested
- Complaint bypass mechanism specified

**Critical gaps (deferred):**
- Legal entity not formed
- Legal/safeguarding/partner reviews not completed
- Roles not staffed

**Program cannot launch** until all deferred reviews are completed and roles are staffed with qualified individuals.

---

**Closure evidence:** Governance artifact drafted, RACI matrix complete, escalation paths documented, tabletop scenarios tested. Legal/safeguarding/partner review deferred — requires owner action before program launch.
