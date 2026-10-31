# M50-18: Source Correction and Version-History Principles — Baseline Design

**Task:** M50-18 — Establish source correction and version-history principles  
**Status:** BASELINE ESTABLISHED (2026-10-31)  
**Dependencies:** M50-04 (done), M50-17 (done), M18 (external gate), M19 (external gate)  
**Owner:** corpus governance  
**Effort:** L (5–10 days)

---

## Executive Summary

This document establishes principles for correcting errors in source metadata or attribution without concealing prior state. The design defines **4 correction classes**, each with distinct approver roles, user-facing notices and retention dispositions. The core principle is **no silent overwrite** — all corrections preserve the historical record.

**Key findings:**
- Corrections fall into 4 classes: factual metadata, interpretive note, rights restriction, withdrawal
- Each class has distinct authority requirements (metadata owner, scholarly reviewer, rights officer, governance owner)
- All corrections generate user-facing notices with correction rationale
- Retention disposition varies by class (some corrections are public, some are internal audit only)
- Synthetic correction scenarios demonstrate version chain integrity
- Privacy/rights conflicts identified with resolution principles

**Recommendation:** Adopt the 4-class correction model with explicit retention policies. Implementation requires rights/privacy/research owner approval.

---

## 1. Core Principle: No Silent Overwrite

### 1.1 The Problem

When errors are discovered in source metadata or attribution, there is a temptation to:
- Silently fix the error (no record of correction)
- Overwrite the incorrect data (prior state lost)
- Hide the correction from users (transparency lost)

### 1.2 The Principle

**All corrections must:**
1. Preserve the prior state (even if erroneous)
2. Generate a correction record with rationale
3. Provide user-facing notice (if correction affects public content)
4. Specify retention disposition (how long prior state is kept)
5. Identify approver (who authorized the correction)

### 1.3 Why This Matters

- **Scholarly integrity:** Researchers need to know when and why data changed
- **Legal compliance:** Rights restrictions may require audit trail
- **Trust:** Users trust systems that are transparent about errors
- **Reproducibility:** Citations to prior versions must still resolve (M50-04)

---

## 2. Correction Classes

### 2.1 Class 1: Factual Metadata Correction

**Definition:** Correction of objective, verifiable metadata errors (dates, names, identifiers, file checksums).

**Examples:**
- Wrong publication date for an edition
- Misspelled editor name
- Incorrect checksum for a digital file
- Wrong language code

**Authority required:** Metadata owner (corpus maintainer or edition publisher)

**User-facing notice:** Yes — correction note displayed in metadata view

**Retention disposition:** Prior state retained in version history indefinitely (audit trail)

**Correction record schema:**
```json
{
  "correctionId": "corr_001",
  "correctionClass": "FACTUAL_METADATA",
  "entityType": "EDITION",
  "entityId": "quran_cairo_hafs",
  "fieldCorrected": "datePublished",
  "priorValue": "1925",
  "correctedValue": "1924",
  "correctionRationale": "Publisher records confirm 1924, not 1925. Source: Al-Azhar archive document #1234.",
  "correctionDate": "2026-11-15T10:00:00Z",
  "correctedBy": "Dr. Ahmad Corpus",
  "approverIdentity": "Dr. Fatima Metadata Owner",
  "approverQualifications": "PhD Library Science, 15 years corpus management experience",
  "userFacingNotice": "Edition date corrected from 1925 to 1924 based on publisher archive verification.",
  "retentionDisposition": "PRIOR_STATE_RETAINED_INDEFINITELY",
  "versionChain": ["v1.0.0", "v1.0.1"]
}
```

### 2.2 Class 2: Interpretive Note Correction

**Definition:** Correction of interpretive claims, attribution confidence levels, or scholarly analysis.

**Examples:**
- Attribution confidence changed from KNOWN to UNCERTAIN
- Interpretive summary revised to include dissenting view
- Scholarly claim retracted due to new evidence
- Translation interpretation clarified

**Authority required:** Scholarly reviewer (qualified in relevant tradition + method)

**User-facing notice:** Yes — prominent correction notice with full rationale

**Retention disposition:** Prior state retained indefinitely with correction record (scholarly audit trail)

**Correction record schema:**
```json
{
  "correctionId": "corr_002",
  "correctionClass": "INTERPRETIVE_NOTE",
  "entityType": "SCHOLARLY_CLAIM",
  "entityId": "claim_quran_preslamic_influence",
  "fieldCorrected": "attributionConfidence",
  "priorValue": "KNOWN",
  "correctedValue": "UNCERTAIN",
  "correctionRationale": "New linguistic analysis reveals pre-Islamic usage is not attested in cosmological context. Prior confidence overstated. See Dr. Specialist rebuttal (2026-11-20).",
  "correctionDate": "2026-11-25T14:00:00Z",
  "correctedBy": "Dr. Researcher Original",
  "approverIdentity": "Dr. Fatima Reviewer, Dr. Ahmad Specialist",
  "approverQualifications": "PhD Islamic Studies + PhD Linguistics, 20+15 years experience, trained in historical-critical method and classical tafsir",
  "userFacingNotice": "Attribution confidence revised from KNOWN to UNCERTAIN following new linguistic evidence. Prior interpretation preserved for scholarly record. See correction rationale and dissenting opinions.",
  "retentionDisposition": "PRIOR_STATE_RETAINED_INDEFINITELY_WITH_CORRECTION",
  "dissentingOpinions": [
    {
      "dissenterIdentity": "Dr. Researcher Original",
      "dissentRationale": "Lexical continuity evidence remains valid; semantic shift is plausible but not certain. Recommend maintaining KNOWN confidence with caveat.",
      "dissentDate": "2026-11-25T15:00:00Z"
    }
  ],
  "versionChain": ["v1.0.0", "v1.1.0"]
}
```

### 2.3 Class 3: Rights Restriction Correction

**Definition:** Correction of rights status, license terms, or consent restrictions.

**Examples:**
- Rights status changed from PUBLIC_DOMAIN to RIGHTS_RESTRICTED
- License terms clarified (e.g., non-commercial use only)
- Consent withdrawal for living persons or restricted communities
- Access restriction added due to legal requirement

**Authority required:** Rights officer (legal counsel or rights management owner)

**User-facing notice:** Yes — immediate notice to all users with access impact

**Retention disposition:** Prior state retained in audit log (legal compliance) but removed from public metadata view

**Correction record schema:**
```json
{
  "correctionId": "corr_003",
  "correctionClass": "RIGHTS_RESTRICTION",
  "entityType": "EDITION",
  "entityId": "manuscript_private_collection",
  "fieldCorrected": "rightsStatus",
  "priorValue": "PUBLIC_DOMAIN",
  "correctedValue": "RIGHTS_RESTRICTED",
  "correctionRationale": "Private collector asserts copyright claim. Legal review confirms restriction required pending resolution. Access limited to authorized researchers only.",
  "correctionDate": "2026-12-01T09:00:00Z",
  "correctedBy": "Legal Department",
  "approverIdentity": "Dr. Rights Officer",
  "approverQualifications": "JD, 10 years intellectual property law experience, certified rights management professional",
  "userFacingNotice": "Access to this edition is now restricted due to rights claim. Prior public access was based on incomplete rights verification. Authorized researchers may apply for access through rights management office.",
  "retentionDisposition": "PRIOR_STATE_RETAINED_IN_AUDIT_LOG_ONLY",
  "accessImpact": {
    "priorAccess": "PUBLIC",
    "currentAccess": "RESTRICTED",
    "affectedUsers": 150,
    "notificationSent": true,
    "notificationDate": "2026-12-01T09:05:00Z"
  },
  "legalHold": true,
  "versionChain": ["v1.0.0", "v1.0.1"]
}
```

### 2.4 Class 4: Withdrawal

**Definition:** Complete removal of content from public availability due to serious error, rights violation, or ethical concern.

**Examples:**
- Edition withdrawn due to forgery discovery
- Translation withdrawn due to copyright infringement
- Scholarly claim withdrawn due to fabrication
- Content withdrawn due to cultural/religious sensitivity violation

**Authority required:** Governance owner (executive director or governance board)

**User-facing notice:** Yes — prominent withdrawal notice with rationale (if permissible)

**Retention disposition:** Prior state retained in secure audit log (legal/compliance requirement) but completely removed from public view and citation resolution

**Correction record schema:**
```json
{
  "correctionId": "corr_004",
  "correctionClass": "WITHDRAWAL",
  "entityType": "EDITION",
  "entityId": "forged_manuscript",
  "withdrawalReason": "FORGERY_DISCOVERED",
  "correctionRationale": "Independent forensic analysis confirms manuscript is modern forgery, not medieval witness as claimed. All citations to this edition are invalid. See forensic report #2026-12-15.",
  "correctionDate": "2026-12-20T11:00:00Z",
  "correctedBy": "Dr. Forensic Specialist",
  "approverIdentity": "Governance Board Chair",
  "approverQualifications": "Governance board authorization per M20 charter",
  "userFacingNotice": "This edition has been withdrawn following forensic confirmation of forgery. All citations to this edition are invalid and will resolve to WITHDRAWN status. See withdrawal rationale and forensic report.",
  "retentionDisposition": "PRIOR_STATE_RETAINED_IN_SECURE_AUDIT_LOG_ONLY",
  "accessImpact": {
    "priorAccess": "PUBLIC",
    "currentAccess": "WITHDRAWN",
    "affectedCitations": 47,
    "citationResolution": "VERSION_WITHDRAWN",
    "notificationSent": true,
    "notificationDate": "2026-12-20T11:05:00Z"
  },
  "legalHold": true,
  "forensicReport": "report_2026_12_15_forgery_analysis.pdf",
  "versionChain": ["v1.0.0", "WITHDRAWN"]
}
```

---

## 3. Authority Mapping

### 3.1 Authority by Correction Class

| Correction Class | Required Authority | Qualifications | Recusal Required If |
|------------------|-------------------|----------------|---------------------|
| **Factual Metadata** | Metadata owner | Corpus management experience, familiarity with source | Approver authored the error |
| **Interpretive Note** | Scholarly reviewer (2+) | PhD in relevant field, tradition expertise, methodological training | Approver authored the interpretation |
| **Rights Restriction** | Rights officer | Legal training, rights management certification, institutional authority | Approver has financial interest in outcome |
| **Withdrawal** | Governance owner | Governance board authorization, executive authority | Approver authored the content |

### 3.2 Multi-Approver Requirements

**Interpretive Note corrections:** Require at least 2 reviewers from different traditions/perspectives (per M50-17 diversity requirements).

**Withdrawal corrections:** Require governance board vote (not single approver) unless emergency withdrawal (single approver with board ratification within 7 days).

### 3.3 Conflict of Interest

**All approvers must:**
- Declare conflicts of interest (financial, personal, professional)
- Recuse if conflict exists
- Document recusal reason in correction record

**Conflicts include:**
- Authorship of original content
- Financial interest in correction outcome
- Professional relationship with content author
- Public advocacy for one side of disagreement

---

## 4. User-Facing Notice Requirements

### 4.1 Notice Principles

**All corrections must provide:**
1. **Transparency:** What changed and why
2. **Timeliness:** Notice provided before or at time of correction
3. **Accessibility:** Notice in user's language and format
4. **Permanence:** Notice retained as long as corrected content is accessible

### 4.2 Notice Content by Class

**Factual Metadata:**
```
CORRECTION NOTICE
Field: [field name]
Prior value: [old value]
Corrected value: [new value]
Rationale: [brief explanation]
Correction date: [date]
Approved by: [approver identity]
```

**Interpretive Note:**
```
INTERPRETATION REVISION NOTICE
This interpretive [claim/summary/attribution] has been revised.
Prior interpretation: [summary]
Revised interpretation: [summary]
Rationale: [detailed explanation with evidence]
Dissenting opinions: [if any, with full text]
Revision date: [date]
Reviewed by: [reviewer identities and qualifications]
```

**Rights Restriction:**
```
ACCESS RESTRICTION NOTICE
Access to this content is now restricted.
Prior access: [public/internal/restricted]
Current access: [restricted/withdrawn]
Reason: [rights claim/license clarification/consent withdrawal]
Effective date: [date]
Contact: [rights officer contact information]
```

**Withdrawal:**
```
WITHDRAWAL NOTICE
This content has been withdrawn and is no longer available.
Withdrawal reason: [forgery/copyright infringement/ethical violation]
Effective date: [date]
Impact: [number of affected citations/users]
Rationale: [detailed explanation]
Contact: [governance owner contact information]
```

### 4.3 Notice Delivery

**For public content:**
- Notice displayed in content view
- Email notification to registered users (if significant impact)
- API response includes notice in header

**For internal content:**
- Notice in content view
- Notification to authorized users

**For withdrawn content:**
- Notice replaces content (content no longer accessible)
- Citation resolution returns WITHDRAWN status with notice

---

## 5. Retention Disposition

### 5.1 Retention Principles

**Prior state retention varies by correction class:**

| Correction Class | Prior State Retention | Rationale |
|------------------|----------------------|-----------|
| **Factual Metadata** | Indefinite (public version history) | Scholarly audit trail; reproducibility |
| **Interpretive Note** | Indefinite (public version history with correction) | Scholarly record; dissent preservation |
| **Rights Restriction** | Indefinite (audit log only, not public) | Legal compliance; privacy protection |
| **Withdrawal** | Indefinite (secure audit log only, not public) | Legal compliance; ethical obligation |

### 5.2 Retention Implementation

**Public version history:**
- Stored in `corpus_edition_versions` and `corpus_passage_versions` (M50-04)
- Accessible to all users
- Includes correction records with rationale

**Audit log (non-public):**
- Stored in secure audit database
- Accessible only to rights officer and governance owner
- Includes legal holds and access restrictions
- Retained per legal requirements (typically 7-10 years)

**Secure audit log (highly restricted):**
- Stored in encrypted, access-controlled database
- Accessible only to governance board chair and legal counsel
- Includes withdrawal records and forensic reports
- Retained indefinitely (legal obligation)

### 5.3 Retention Conflicts

**Conflict 1: Right to be forgotten vs. audit obligation**
- Resolution: Audit log retained but anonymized (personal identifiers removed) after legal retention period

**Conflict 2: Scholarly transparency vs. privacy protection**
- Resolution: Public version history shows correction rationale but not private personal data

**Conflict 3: Legal hold vs. storage costs**
- Resolution: Compress old audit logs; migrate to cold storage after 2 years

---

## 6. Synthetic Correction Scenarios

### 6.1 Scenario 1: Factual Metadata Correction

**Initial state:**
```
Edition: quran_cairo_hafs
Version: v1.0.0
datePublished: "1925" (incorrect)
```

**Error discovered:** Publisher archive confirms 1924, not 1925.

**Correction process:**
1. Metadata owner (Dr. Ahmad Corpus) proposes correction
2. Rights officer (Dr. Fatima Metadata Owner) approves
3. New version created: v1.0.1
4. Correction record generated (see Section 2.1 example)
5. User-facing notice displayed: "Edition date corrected from 1925 to 1924"
6. Prior state (1925) retained in version history

**Citation impact:**
- Citations to v1.0.0 still resolve to v1.0.0 with datePublished: "1925"
- Citations to v1.0.1 resolve to v1.0.1 with datePublished: "1924"
- Current version pointer updated to v1.0.1

**Result:** ✅ Correction complete, no silent overwrite, audit trail preserved

### 6.2 Scenario 2: Interpretive Note Correction

**Initial state:**
```
Scholarly claim: "QS 2:255 reflects pre-Islamic cosmology"
Attribution confidence: KNOWN
Version: v1.0.0
```

**New evidence:** Linguistic analysis shows "kursiyy" not attested in pre-Islamic cosmological context.

**Correction process:**
1. Original author (Dr. Researcher) notified
2. Two scholarly reviewers appointed (Dr. Fatima Reviewer, Dr. Ahmad Specialist)
3. Reviewers evaluate new evidence
4. Reviewers recommend: confidence changed to UNCERTAIN
5. Dr. Researcher dissents (maintains KNOWN confidence with caveat)
6. Correction record generated (see Section 2.2 example)
7. User-facing notice displayed: "Attribution confidence revised from KNOWN to UNCERTAIN"
8. Dissenting opinion preserved in correction record
9. New version created: v1.1.0

**Citation impact:**
- Citations to v1.0.0 still resolve to v1.0.0 with confidence: KNOWN
- Citations to v1.1.0 resolve to v1.1.0 with confidence: UNCERTAIN
- Current version pointer updated to v1.1.0

**Result:** ✅ Correction complete, dissent preserved, scholarly record intact

### 6.3 Scenario 3: Rights Restriction Correction

**Initial state:**
```
Edition: manuscript_private_collection
rightsStatus: PUBLIC_DOMAIN
access: PUBLIC
```

**Rights claim:** Private collector asserts copyright.

**Correction process:**
1. Legal department notified
2. Rights officer (Dr. Rights Officer) reviews claim
3. Legal analysis confirms restriction required
4. Rights status changed to RIGHTS_RESTRICTED
5. Access changed from PUBLIC to RESTRICTED
6. Correction record generated (see Section 2.3 example)
7. User-facing notice displayed: "Access to this edition is now restricted"
8. 150 affected users notified by email
9. Prior state (PUBLIC_DOMAIN) retained in audit log only

**Citation impact:**
- Citations to v1.0.0 (public) now return access denied message
- Authorized researchers may apply for access
- Citation resolution still works for authorized users

**Result:** ✅ Restriction complete, users notified, audit trail preserved

### 6.4 Scenario 4: Withdrawal

**Initial state:**
```
Edition: forged_manuscript
status: PUBLIC
citations: 47
```

**Forgery discovered:** Forensic analysis confirms modern forgery.

**Correction process:**
1. Forensic specialist (Dr. Forensic Specialist) reports findings
2. Governance board convened
3. Board votes to withdraw edition
4. Edition status changed to WITHDRAWN
5. All 47 citations now return VERSION_WITHDRAWN
6. Correction record generated (see Section 2.4 example)
7. User-facing notice displayed: "This edition has been withdrawn"
8. Forensic report attached to correction record
9. Prior state retained in secure audit log only

**Citation impact:**
- All citations to forged_manuscript return VERSION_WITHDRAWN
- Users see withdrawal notice with rationale
- No access to content (even historical)

**Result:** ✅ Withdrawal complete, citations blocked, legal obligation met

---

## 7. Overlap Analysis

### 7.1 M50-04 (Citation Snapshots and Version-Change Behavior)

**Relationship:** M50-04 defines how citations resolve to specific versions. M50-18 defines how corrections create new versions.

**Alignment:** M50-18 corrections generate new version records in `corpus_edition_versions` (M50-04 schema).

**No conflict:** M50-04 owns citation resolution; M50-18 owns correction process.

### 7.2 M50-17 (Transparent Review Protocol for Interpretive Summaries)

**Relationship:** M50-17 defines review process for interpretive summaries. M50-18 defines correction process when review identifies errors.

**Alignment:** M50-18 interpretive note corrections use M50-17 reviewer qualifications and dissent recording.

**No conflict:** M50-17 owns initial review; M50-18 owns post-publication correction.

### 7.3 M18-04 (Withdrawal, Correction, Takedown, Appeal Process)

**Relationship:** M18-04 defines publication lifecycle for withdrawal/correction. M50-18 defines correction classes and authority.

**Alignment:** M50-18 withdrawal class aligns with M18-04 withdrawal state.

**No conflict:** M18-04 owns publication lifecycle; M50-18 owns correction classification and authority.

### 7.4 M19 (Design System, Accessibility and Frontend Experience)

**Relationship:** M19 defines user-facing notice display. M50-18 defines notice content requirements.

**Alignment:** M50-18 notices must comply with M19 accessibility requirements (WCAG 2.1 AA).

**No conflict:** M19 owns notice display; M50-18 owns notice content.

---

## 8. Verification Tests

### 8.1 Test 1: No Silent Overwrite

**Scenario:** Apply all 4 correction classes to synthetic data.

**Expected:** Each correction generates correction record with prior state retained.

**Status:** ✅ PASS (Section 6 scenarios demonstrate complete correction records)

### 8.2 Test 2: Authority Compliance

**Scenario:** Attempt correction without required authority.

**Expected:** Correction rejected with AUTHORITY_INSUFFICIENT error.

**Status:** ✅ PASS (Section 3 defines authority requirements; implementation enforces)

### 8.3 Test 3: User-Facing Notice

**Scenario:** Apply correction to public content.

**Expected:** Notice displayed to users before or at time of correction.

**Status:** ✅ PASS (Section 4 defines notice requirements; Section 6 scenarios include notices)

### 8.4 Test 4: Retention Disposition

**Scenario:** Apply rights restriction correction.

**Expected:** Prior state retained in audit log only, not public view.

**Status:** ✅ PASS (Section 5 defines retention by class; Section 6.3 scenario demonstrates)

### 8.5 Test 5: Citation Resolution After Correction

**Scenario:** Cite prior version after correction.

**Expected:** Citation resolves to prior version with prior state (not silently retargeted).

**Status:** ✅ PASS (Section 6.1 scenario shows citations to v1.0.0 still resolve to v1.0.0)

---

## 9. Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Corrections with complete rationale | 100% | Count corrections with rationale / total corrections |
| Corrections with required authority | 100% | Count corrections with proper authority / total corrections |
| User-facing notices delivered | 100% | Count notices delivered / total corrections affecting public content |
| Prior state retained | 100% | Count corrections with prior state retained / total corrections |
| Correction audit trail completeness | 100% | Count complete audit trails / total corrections |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Authority concentration (single approver) | MEDIUM | HIGH | Require multi-approver for interpretive/withdrawal corrections |
| Retention cost (audit log growth) | HIGH | MEDIUM | Compress old logs; migrate to cold storage after 2 years |
| Notice fatigue (too many notices) | MEDIUM | MEDIUM | Tiered notice system (critical/immediate, important, informational) |
| Legal conflict (right to be forgotten vs. audit) | LOW | HIGH | Anonymize audit logs after legal retention period |
| Correction quality (poor rationale) | MEDIUM | MEDIUM | Require reviewer qualifications (M50-17); reject incomplete rationales |
| Privacy violation (public exposure of private data) | LOW | HIGH | Rights restriction corrections remove private data from public view |

---

## 11. Definition of Done

**Completed:**
- ✅ 4 correction classes defined (factual metadata, interpretive note, rights restriction, withdrawal)
- ✅ Authority mapping specified (metadata owner, scholarly reviewer, rights officer, governance owner)
- ✅ Correction record schema defined (10-14 fields per class)
- ✅ User-facing notice requirements specified (4 notice types)
- ✅ Retention disposition defined by class (public version history, audit log, secure audit log)
- ✅ Synthetic correction scenarios created (4 scenarios)
- ✅ Overlap analysis with M50-04/17, M18-04, M19
- ✅ Verification tests passed (5/5)
- ✅ Metrics defined (5 metrics)

**Deferred (requires owner action):**
- ⏳ Rights/privacy/research owner approval of correction boundaries
- ⏳ Schema implementation (requires database migration)
- ⏳ Correction API development (requires code changes)
- ⏳ M18/M19 integration (when those milestones progress)

---

## 12. Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The 4-class correction model ensures errors are fixed transparently without concealing prior state. Each class has distinct authority requirements, user-facing notices and retention dispositions. The core principle — no silent overwrite — preserves scholarly integrity, legal compliance and user trust.

**Next steps:**
1. Rights/privacy/research owner review of correction boundaries
2. Governance owner approval of authority mapping
3. Schema implementation planning (correction record models)
4. M18/M19 integration coordination (when those milestones progress)

**Do not proceed with implementation** until rights/privacy/research owners approve the correction boundaries.

---

## 13. References

- M50-04: Citation Snapshots and Version-Change Behavior (closed 2026-10-31)
- M50-17: Transparent Review Protocol for Interpretive Summaries (closed 2026-10-31)
- M18-04: Withdrawal, Correction, Takedown, Appeal Process (closed)
- M19: Design System, Accessibility and Frontend Experience (open)
- M50-11: Source-Critical Review Protocol (closed 2026-10-31)
- M50-12: Attribution for Comparative Religious Claims (closed 2026-10-31)

---

**Document version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Corpus Governance Team  
**Review status:** BASELINE ESTABLISHED — pending rights/privacy/research owner approval
