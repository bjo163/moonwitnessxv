# M49-05 — Design a Transparent Allocation Decision Record

**Task:** [M49-05](../../TODO.md#m49-05) · **Candidate:** CHAR-005 · **Priority:** P1/D4  
**Owner:** program/finance · **Effort:** L (4–8 days)  
**Status:** BASELINE ESTABLISHED — decision record schema designed, synthetic examples provided  
**Date:** 2026-10-31

---

## Objective

Define the minimum evidence for documenting a charitable allocation decision.

## Scope

- Prototype offline decision record with purpose, approvers, restrictions, amount category, date, evidence reference
- Synthetic records only (no real financial store or public dashboard)
- Anti-overlap: Not payment processing, donation UI, or M35 commercial accounting

## Decision Record Schema

### 1. Core Fields

```json
{
  "recordId": "string (UUID)",
  "recordVersion": "integer (starts at 1, increments on amendment)",
  "createdAt": "ISO-8601 timestamp",
  "createdBy": "principal reference (role, not name)",
  "decisionType": "enum: ALLOCATION | AMENDMENT | REVERSAL",
  "status": "enum: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | REVERSED",
  
  "allocation": {
    "purpose": "string (max 200 chars)",
    "amountCategory": "enum: MICRO (<$100) | SMALL ($100-$500) | MEDIUM ($500-$1000) | LARGE ($1000+)",
    "fundType": "enum: RESTRICTED | UNRESTRICTED",
    "restrictionCode": "string | null (references restricted fund terms)",
    "programCode": "string (references program budget line)",
    "beneficiaryCategory": "string (category, not identity)",
    "geographicScope": "string | null (region or 'GLOBAL')",
    "timeframe": {
      "startDate": "ISO-8601 date",
      "endDate": "ISO-8601 date | null (null = open-ended)"
    }
  },
  
  "approvers": [
    {
      "role": "string (e.g., 'Finance Officer', 'Program Director')",
      "principalRef": "string (role instance, not PII)",
      "decision": "enum: APPROVE | REJECT | ABSTAIN",
      "decidedAt": "ISO-8601 timestamp",
      "rationale": "string | null (max 500 chars)"
    }
  ],
  
  "evidence": [
    {
      "evidenceType": "enum: DONOR_REQUEST | BUDGET_APPROVAL | INVOICE | RECEIPT | REPORT | LEGAL_ADVICE | OTHER",
      "reference": "string (file path, URL, or document ID)",
      "description": "string (max 200 chars)",
      "attachedAt": "ISO-8601 timestamp"
    }
  ],
  
  "privacy": {
    "publicDisclosure": "enum: FULL | PARTIAL | NONE",
    "redactedFields": ["string (list of fields redacted in public view)"],
    "retentionPeriod": "string (e.g., '7 years', 'permanent')",
    "accessControl": "enum: INTERNAL | RESTRICTED | PUBLIC"
  },
  
  "audit": {
    "amends": "string (recordId of previous version, if amendment) | null",
    "reverses": "string (recordId of original decision, if reversal) | null",
    "reversedBy": "string (recordId of reversal, if this record was reversed) | null",
    "changeLog": [
      {
        "changedAt": "ISO-8601 timestamp",
        "changedBy": "principal reference",
        "changeType": "enum: CREATED | AMENDED | APPROVED | REJECTED | REVERSED",
        "changeSummary": "string (max 200 chars)"
      }
    ]
  }
}
```

### 2. Field Definitions

#### 2.1 Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recordId` | UUID | Yes | Unique identifier for this decision record |
| `recordVersion` | Integer | Yes | Version number (increments on amendment) |
| `createdAt` | Timestamp | Yes | When record was first created |
| `createdBy` | Principal Ref | Yes | Role that created record (not personal name) |
| `decisionType` | Enum | Yes | Type of decision: new allocation, amendment, or reversal |
| `status` | Enum | Yes | Current workflow status |

#### 2.2 Allocation Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purpose` | String | Yes | Brief description of allocation purpose (max 200 chars) |
| `amountCategory` | Enum | Yes | Amount range category (not exact amount for privacy) |
| `fundType` | Enum | Yes | Whether funds are restricted or unrestricted |
| `restrictionCode` | String | Conditional | Required if fundType = RESTRICTED; references CHAR-004 restriction terms |
| `programCode` | String | Yes | References program budget line from approved budget |
| `beneficiaryCategory` | String | Yes | Category description (e.g., "earthquake survivors", "students in Region X") — never personal identity |
| `geographicScope` | String | No | Region or 'GLOBAL' if not location-specific |
| `timeframe.startDate` | Date | Yes | When allocation period begins |
| `timeframe.endDate` | Date | No | When allocation period ends (null = open-ended) |

#### 2.3 Approver Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approvers[].role` | String | Yes | Role title (e.g., "Finance Officer") |
| `approvers[].principalRef` | String | Yes | Role instance identifier (not personal name) |
| `approvers[].decision` | Enum | Yes | APPROVE, REJECT, or ABSTAIN |
| `approvers[].decidedAt` | Timestamp | Yes | When decision was made |
| `approvers[].rationale` | String | No | Brief explanation (max 500 chars) |

**Approval Rules (from CHAR-004):**
- Amount $0–$500: 1 approver (Finance Officer OR Program Director)
- Amount $500–$1,000: 2 approvers (Finance Officer AND Program Director)
- Amount $1,000+: 3 approvers (Finance Officer AND Program Director AND Board/Owner)
- Restricted fund: Additional legal counsel review required

#### 2.4 Evidence Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `evidence[].evidenceType` | Enum | Yes | Type of supporting document |
| `evidence[].reference` | String | Yes | File path, URL, or document ID |
| `evidence[].description` | String | Yes | Brief description (max 200 chars) |
| `evidence[].attachedAt` | Timestamp | Yes | When evidence was attached |

**Minimum Evidence Requirements:**
- ALLOCATION: At least 1 evidence item (budget approval or donor request)
- AMENDMENT: At least 1 evidence item (reason for amendment)
- REVERSAL: At least 1 evidence item (reason for reversal, legal advice if applicable)

#### 2.5 Privacy Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `privacy.publicDisclosure` | Enum | Yes | Level of public disclosure: FULL, PARTIAL, or NONE |
| `privacy.redactedFields` | Array | Conditional | List of fields redacted if publicDisclosure = PARTIAL |
| `privacy.retentionPeriod` | String | Yes | How long record is kept (e.g., "7 years", "permanent") |
| `privacy.accessControl` | Enum | Yes | Who can access: INTERNAL, RESTRICTED, or PUBLIC |

**Privacy Rules:**
- Beneficiary identity: NEVER disclosed (use category only)
- Exact amounts: Disclosed only if publicDisclosure = FULL
- Donor identity: Disclosed only with explicit donor consent
- Restricted fund terms: Disclosed if publicDisclosure = FULL or PARTIAL
- Approver identities: Disclosed if publicDisclosure = FULL (role only, not personal names)

#### 2.6 Audit Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audit.amends` | UUID | Conditional | Required if decisionType = AMENDMENT; references original record |
| `audit.reverses` | UUID | Conditional | Required if decisionType = REVERSAL; references original record |
| `audit.reversedBy` | UUID | No | Populated if this record was later reversed |
| `audit.changeLog[]` | Array | Yes | Chronological record of all changes |

### 3. Separation: Identity vs. Public Report

**Internal Record (Full Identity):**
- Contains all fields as defined above
- Accessible to: Finance Officer, Program Director, Board/Owner, auditors
- Retention: As specified in privacy.retentionPeriod
- Includes: Exact amounts, approver identities, evidence references, beneficiary categories

**Public Report (Redacted):**
- Generated from internal record with redactions applied
- Accessible to: Donors, beneficiaries, public (depending on privacy.accessControl)
- Redactions based on privacy.publicDisclosure:
  - **FULL:** All fields except beneficiary identity and donor identity (without consent)
  - **PARTIAL:** Only purpose, amountCategory, fundType, programCode, geographicScope, timeframe, approver roles (not identities), evidence types (not references)
  - **NONE:** No public report generated (internal record only)

**Example Public Report (PARTIAL disclosure):**
```json
{
  "recordId": "abc123... (first 8 chars only)",
  "decisionType": "ALLOCATION",
  "status": "APPROVED",
  "allocation": {
    "purpose": "Earthquake relief supplies for Region X",
    "amountCategory": "MEDIUM",
    "fundType": "RESTRICTED",
    "programCode": "PROG-2026-DISASTER",
    "beneficiaryCategory": "Earthquake survivors in Region X",
    "geographicScope": "Region X",
    "timeframe": {
      "startDate": "2026-11-01",
      "endDate": "2027-04-30"
    }
  },
  "approvers": [
    {
      "role": "Finance Officer",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T10:00:00Z"
    },
    {
      "role": "Program Director",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T11:00:00Z"
    }
  ],
  "evidence": [
    {
      "evidenceType": "DONOR_REQUEST",
      "description": "Donor request for earthquake relief"
    },
    {
      "evidenceType": "BUDGET_APPROVAL",
      "description": "Q4 2026 disaster relief budget"
    }
  ]
}
```

### 4. Approval and Reversal Models

#### 4.1 Approval Workflow

```
DRAFT (createdBy initiates)
  ↓
PENDING_APPROVAL (submitted for review)
  ↓
[Approvers review and decide]
  ↓
APPROVED (all required approvers approve)
  OR
REJECTED (any required approver rejects)
```

**Approval Rules:**
- DRAFT → PENDING_APPROVAL: createdBy submits with all required fields populated
- PENDING_APPROVAL → APPROVED: All required approvers (per CHAR-004 thresholds) vote APPROVE
- PENDING_APPROVAL → REJECTED: Any required approver votes REJECT
- Change log entry created for each status transition

#### 4.2 Amendment Workflow

```
APPROVED (original decision)
  ↓
[Amendment initiated]
  ↓
DRAFT (new record with decisionType = AMENDMENT)
  ↓
PENDING_APPROVAL
  ↓
APPROVED (amendment approved)
  ↓
Original record updated: audit.amends points to amendment record
```

**Amendment Rules:**
- Amendment creates a NEW record (does not modify original)
- New record has decisionType = AMENDMENT
- New record references original via audit.amends
- Original record status remains APPROVED (not changed)
- New record status becomes APPROVED after approval workflow
- Public report shows latest approved version (original + amendment)

#### 4.3 Reversal Workflow

```
APPROVED (original decision)
  ↓
[Reversal initiated]
  ↓
DRAFT (new record with decisionType = REVERSAL)
  ↓
PENDING_APPROVAL
  ↓
APPROVED (reversal approved)
  ↓
Original record updated: status = REVERSED, audit.reversedBy points to reversal record
```

**Reversal Rules:**
- Reversal creates a NEW record (does not modify original)
- New record has decisionType = REVERSAL
- New record references original via audit.reverses
- Original record status changes to REVERSED
- Original record gets audit.reversedBy pointing to reversal record
- Reversal requires same approval thresholds as original allocation
- Reversal of restricted fund requires legal counsel review
- Public report shows original as REVERSED with reversal reference

### 5. Privacy Review

**Privacy Principles:**
1. **Minimization:** Collect only necessary data. Use categories instead of exact values where possible.
2. **Purpose limitation:** Use data only for stated purpose. Donor data not shared without consent.
3. **Beneficiary protection:** Never disclose beneficiary identity. Use category descriptions only.
4. **Transparency:** Disclose allocation decisions to extent permitted by privacy rules.
5. **Retention:** Keep records only as long as legally required or operationally necessary.

**Privacy Risks:**
| Risk | Mitigation |
|------|------------|
| Beneficiary identity leakage | Use category descriptions only; never store personal identity |
| Donor identity exposure | Store donor ref separately; require explicit consent for disclosure |
| Exact amount sensitivity | Use amount categories in public reports; exact amounts internal only |
| Approver identity risk | Disclose roles only in public reports; store principal refs internally |
| Evidence reference exposure | Store evidence separately; reference by ID in decision record |

**Privacy Controls:**
- Access control lists (ACL) for internal vs. public views
- Redaction engine for generating public reports from internal records
- Consent management for donor identity disclosure
- Retention schedule with automated deletion reminders
- Audit log of all access to decision records

### 6. Document Owner

**Primary Owner:** Finance Officer  
**Secondary Owner:** Program Director  
**Oversight:** Board/Owner  
**Legal Review:** External legal counsel (for restricted funds)  
**Audit:** External accountant (annual review)

**Owner Responsibilities:**
- Ensure all allocation decisions are documented per schema
- Maintain internal records with full identity
- Generate public reports with appropriate redactions
- Enforce privacy controls and access restrictions
- Retain records per retention schedule
- Coordinate legal/audit reviews

## Acceptance Criteria

- [x] Schema defines minimum evidence for allocation decision (core fields specified)
- [x] Identity separated from public report (internal vs. public views defined)
- [x] Approval/reversal modeled (workflow states and transitions defined)
- [x] Privacy reviewed (risks and mitigations documented)
- [x] Owner documented (Finance Officer as primary owner)

## Synthetic Examples

### Example 1: Unrestricted Allocation (Small)

```json
{
  "recordId": "550e8400-e29b-41d4-a716-446655440000",
  "recordVersion": 1,
  "createdAt": "2026-10-31T09:00:00Z",
  "createdBy": "role:finance-officer",
  "decisionType": "ALLOCATION",
  "status": "APPROVED",
  "allocation": {
    "purpose": "Office supplies for Q4 2026",
    "amountCategory": "SMALL",
    "fundType": "UNRESTRICTED",
    "restrictionCode": null,
    "programCode": "PROG-2026-ADMIN",
    "beneficiaryCategory": "Administrative staff",
    "geographicScope": "GLOBAL",
    "timeframe": {
      "startDate": "2026-10-01",
      "endDate": "2026-12-31"
    }
  },
  "approvers": [
    {
      "role": "Finance Officer",
      "principalRef": "role:finance-officer",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T09:00:00Z",
      "rationale": "Within Q4 admin budget"
    }
  ],
  "evidence": [
    {
      "evidenceType": "BUDGET_APPROVAL",
      "reference": "/docs/budgets/2026-Q4-admin.pdf",
      "description": "Q4 2026 administrative budget",
      "attachedAt": "2026-10-31T09:00:00Z"
    }
  ],
  "privacy": {
    "publicDisclosure": "FULL",
    "redactedFields": [],
    "retentionPeriod": "7 years",
    "accessControl": "PUBLIC"
  },
  "audit": {
    "amends": null,
    "reverses": null,
    "reversedBy": null,
    "changeLog": [
      {
        "changedAt": "2026-10-31T09:00:00Z",
        "changedBy": "role:finance-officer",
        "changeType": "CREATED",
        "changeSummary": "Initial allocation request"
      },
      {
        "changedAt": "2026-10-31T09:00:00Z",
        "changedBy": "role:finance-officer",
        "changeType": "APPROVED",
        "changeSummary": "Self-approved (small amount, unrestricted)"
      }
    ]
  }
}
```

### Example 2: Restricted Allocation (Large, with Reversal)

```json
{
  "recordId": "660e8400-e29b-41d4-a716-446655440001",
  "recordVersion": 1,
  "createdAt": "2026-10-31T10:00:00Z",
  "createdBy": "role:program-director",
  "decisionType": "ALLOCATION",
  "status": "REVERSED",
  "allocation": {
    "purpose": "Earthquake relief supplies for Region X",
    "amountCategory": "LARGE",
    "fundType": "RESTRICTED",
    "restrictionCode": "REST-2026-DISASTER-X",
    "programCode": "PROG-2026-DISASTER",
    "beneficiaryCategory": "Earthquake survivors in Region X",
    "geographicScope": "Region X",
    "timeframe": {
      "startDate": "2026-11-01",
      "endDate": "2027-04-30"
    }
  },
  "approvers": [
    {
      "role": "Finance Officer",
      "principalRef": "role:finance-officer",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T10:30:00Z",
      "rationale": "Within restricted fund terms"
    },
    {
      "role": "Program Director",
      "principalRef": "role:program-director",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T11:00:00Z",
      "rationale": "Aligns with disaster relief program"
    },
    {
      "role": "Board Owner",
      "principalRef": "role:board-owner",
      "decision": "APPROVE",
      "decidedAt": "2026-10-31T12:00:00Z",
      "rationale": "Approved after legal review"
    }
  ],
  "evidence": [
    {
      "evidenceType": "DONOR_REQUEST",
      "reference": "/docs/donors/donor-abc-request-2026.pdf",
      "description": "Donor request for Region X earthquake relief",
      "attachedAt": "2026-10-31T10:00:00Z"
    },
    {
      "evidenceType": "LEGAL_ADVICE",
      "reference": "/docs/legal/opinion-2026-10-31.pdf",
      "description": "Legal counsel review of restriction terms",
      "attachedAt": "2026-10-31T11:30:00Z"
    }
  ],
  "privacy": {
    "publicDisclosure": "PARTIAL",
    "redactedFields": ["evidence.reference", "approvers.principalRef"],
    "retentionPeriod": "permanent",
    "accessControl": "RESTRICTED"
  },
  "audit": {
    "amends": null,
    "reverses": null,
    "reversedBy": "770e8400-e29b-41d4-a716-446655440002",
    "changeLog": [
      {
        "changedAt": "2026-10-31T10:00:00Z",
        "changedBy": "role:program-director",
        "changeType": "CREATED",
        "changeSummary": "Initial allocation request"
      },
      {
        "changedAt": "2026-10-31T12:00:00Z",
        "changedBy": "role:board-owner",
        "changeType": "APPROVED",
        "changeSummary": "All required approvers approved"
      },
      {
        "changedAt": "2026-11-15T09:00:00Z",
        "changedBy": "role:board-owner",
        "changeType": "REVERSED",
        "changeSummary": "Reversed due to program cancellation"
      }
    ]
  }
}
```

## Definition of Done

**Completed:**
- Decision record schema with 6 field categories (37 fields total)
- Approval/reversal workflows modeled (3 workflows)
- Privacy review with risks and mitigations
- Document owner specified (Finance Officer)
- 2 synthetic examples provided

**Deferred (Requires Owner Action):**
- Implementation in actual database/storage system
- Integration with CHAR-004 restricted fund tracking
- Public dashboard for PARTIAL/FULL disclosure reports
- Automated retention schedule enforcement
- Legal/audit review of schema design

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Schema too complex for manual tracking | Provide template and examples; consider simple spreadsheet for small orgs |
| Privacy controls not enforced | Access control lists and redaction engine required |
| Reversal creates audit confusion | Clear change log with links between original and reversal |
| Public report leaks identity | Automated redaction with manual review before publication |

## Rollback

No rollback required — this is a schema design, not code. If schema proves unworkable, revise and re-review with stakeholders.

## Metrics

- **Schema fields:** 37 (across 6 categories)
- **Workflow states:** 5 (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, REVERSED)
- **Approval thresholds:** 3 (per CHAR-004)
- **Privacy levels:** 3 (FULL, PARTIAL, NONE)
- **Synthetic examples:** 2
- **Workflows modeled:** 3 (approval, amendment, reversal)

## Next Steps

1. **Owner review:** Finance Officer and Program Director review schema
2. **Legal review:** External legal counsel reviews privacy controls
3. **Implementation decision:** Choose storage system (database, spreadsheet, custom app)
4. **Template creation:** Build data entry template based on schema
5. **Training:** Train staff on schema and workflows
6. **Pilot:** Test with 3-5 synthetic decisions before going live
7. **Public dashboard:** Design public report generation (if publicDisclosure = FULL or PARTIAL)

## Conclusion

**BASELINE ESTABLISHED.** Decision record schema designed with:
- 37 fields across 6 categories (identity, allocation, approvers, evidence, privacy, audit)
- 3 workflows (approval, amendment, reversal) with clear state transitions
- Privacy controls with 3 disclosure levels (FULL, PARTIAL, NONE)
- Document owner specified (Finance Officer)
- 2 synthetic examples demonstrating schema usage

**Critical gaps (deferred):**
- Not implemented in actual storage system
- Legal/audit review not completed
- Public dashboard not built
- Staff training not conducted

**Schema ready for owner review** and implementation planning.

---

**Closure evidence:** Schema designed, workflows modeled, privacy reviewed, owner documented, synthetic examples provided. Implementation deferred — requires owner action.
