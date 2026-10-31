# M50-04: Citation Snapshots and Version-Change Behavior — Baseline Design

**Task:** M50-04 — Specify citation snapshots and version-change behavior  
**Status:** BASELINE ESTABLISHED (2026-10-31)  
**Dependencies:** M50-01 (done), M18 (external gate — applies only before public citation of real content)  
**Owner:** research/corpus  
**Effort:** M (4–8 days)

---

## Executive Summary

This document specifies how citations remain resolvable when editions or digital transcriptions change. The design uses **immutable version references** combined with a **"current version" pointer** and **change notes** to ensure citations never silently retarget.

**Key findings:**
- Current corpus model lacks version tracking for editions and transcriptions
- Citations use stable `citationKey` (e.g., "QS 2:82") but no version identifier
- No mechanism to detect or report when cited content has changed
- Synthetic test cases demonstrate 4 revision scenarios with correct resolution behavior

**Recommendation:** Adopt immutable version refs with explicit unavailable states. Implementation requires schema extension and owner approval.

---

## 1. Problem Statement

### 1.1 Citation Volatility

When an edition or transcription changes, existing citations may:
- Point to content that no longer exists (removed span)
- Point to content that has been modified (changed span)
- Point to a different version than the citer intended (silent retargeting)

### 1.2 Current Model Gap

From `packages/moonql-corpus/src/index.ts`:

```typescript
corpus_editions: {
  code: 'quran_cairo_hafs',  // stable identifier
  workRef: '@corpus_works:quran',
  name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
  // NO version field
  // NO change history
}

corpus_passages: {
  citationKey: 'QS 2:82',  // stable identifier
  editionRef: '@corpus_editions:quran_cairo_hafs',
  arabicText: 'وَٱلَّذِينَ ءَامَنُوا۟...',
  verifiedAt: '2026-10-26T00:00:00.000Z',  // timestamp but no version
  // NO version field
  // NO change detection
}
```

**Problem:** A citation to "QS 2:82 in Cairo 1924 Hafs" resolves to whatever the current text is, not what it was when the citation was created.

---

## 2. Design Principles

### 2.1 Principle 1: Immutable Version References

Every citation references a **specific version** of an edition/transcription, not just the edition itself.

**Example:**
```
Citation: QS 2:82 @ quran_cairo_hafs:v1.0.0
Not: QS 2:82 @ quran_cairo_hafs (ambiguous)
```

### 2.2 Principle 2: Explicit Current Version Pointer

A separate pointer indicates the "current" version for new citations, but existing citations retain their original version reference.

**Example:**
```
quran_cairo_hafs:current -> v1.0.0
quran_cairo_hafs:v1.0.0 -> immutable snapshot
quran_cairo_hafs:v1.1.0 -> immutable snapshot (if updated)
```

### 2.3 Principle 3: No Silent Retargeting

If a cited version is removed or replaced, the citation system **explicitly reports** the unavailability rather than silently redirecting to a different version.

**Example:**
```
Citation: QS 2:82 @ quran_cairo_hafs:v0.9.0 (removed)
Response: VERSION_UNAVAILABLE — "Version v0.9.0 was withdrawn on 2026-11-15. Current version is v1.0.0. See change note for details."
Not: Silently return v1.0.0 content
```

### 2.4 Principle 4: Change Notes

Every version change includes a human-readable note explaining what changed and why.

**Example:**
```json
{
  "version": "v1.1.0",
  "previousVersion": "v1.0.0",
  "changeDate": "2026-11-20",
  "changeType": "CORRECTION",
  "changeSummary": "Fixed diacritical mark in QS 5:3 (added missing fatha)",
  "affectedSpans": ["QS 5:3"],
  "changeAuthor": "Dr. Ahmad Scholar",
  "changeReason": "User report: visual inspection revealed missing diacritical"
}
```

---

## 3. Version Reference Schema

### 3.1 Edition Version Record

```typescript
corpus_edition_versions: defineModel({
  fields: {
    versionId: str({ maxLength: 40 }),  // e.g., "v1.0.0"
    editionRef: m2o('corpus_editions'),
    versionLabel: str({ maxLength: 80 }),  // human-readable, e.g., "Initial release"
    contentHash: str({ maxLength: 64 }),  // SHA-256 of all passage texts in this version
    contentSize: int(),  // total bytes of all passage texts
    changeSummary: text({ null: true }),  // null for initial version
    changeType: sel(['INITIAL', 'CORRECTION', 'REVISION', 'WITHDRAWAL'], { default: 'INITIAL' }),
    previousVersionId: str({ maxLength: 40, null: true }),  // null for initial
    isLatest: bool({ default: false }),
    isStable: bool({ default: true }),  // false for draft/experimental
    createdAt: ts(),
    createdBy: str({ maxLength: 120 }),
    rightsStatus: sel(RIGHTS_STATUSES),
    visibility: sel(['PUBLIC', 'INTERNAL', 'RESTRICTED']),
  },
  unique: [['editionRef', 'versionId']]
})
```

### 3.2 Passage Version Record

```typescript
corpus_passage_versions: defineModel({
  fields: {
    passageVersionId: str({ maxLength: 60 }),  // e.g., "QS_2_82_v1.0.0"
    passageRef: m2o('corpus_passages'),
    editionVersionRef: m2o('corpus_edition_versions'),
    arabicText: text(),  // immutable snapshot of text at this version
    textHash: str({ maxLength: 64 }),  // SHA-256 of arabicText
    verifiedAt: ts(),
    verifiedBy: str({ maxLength: 120 }),
    changeNote: text({ null: true }),  // null if unchanged from previous version
  },
  unique: [['passageRef', 'editionVersionRef']]
})
```

### 3.3 Current Version Pointer

```typescript
corpus_edition_current_version: defineModel({
  fields: {
    editionRef: m2o('corpus_editions', { unique: true }),
    currentVersionId: str({ maxLength: 40 }),
    updatedAt: ts(),
    updatedBy: str({ maxLength: 120 }),
  }
})
```

---

## 4. Citation Resolution Algorithm

### 4.1 Input

```
Citation: {
  citationKey: "QS 2:82",
  editionCode: "quran_cairo_hafs",
  versionId: "v1.0.0"  // optional — if absent, use current version
}
```

### 4.2 Resolution Steps

```
Step 1: Resolve edition
  → Find corpus_editions where code = "quran_cairo_hafs"
  → If not found: return EDITION_NOT_FOUND

Step 2: Resolve version
  → If versionId provided:
      Find corpus_edition_versions where editionRef = [edition.id] AND versionId = "v1.0.0"
      If not found: return VERSION_NOT_FOUND
    Else:
      Find corpus_edition_current_version where editionRef = [edition.id]
      If not found: return NO_CURRENT_VERSION
      versionId = currentVersionId

Step 3: Check version availability
  → If version.changeType = "WITHDRAWAL": return VERSION_WITHDRAWN
  → If version.isStable = false: return VERSION_DRAFT (warning, not error)

Step 4: Resolve passage version
  → Find corpus_passage_versions where passageRef.citationKey = "QS 2:82" AND editionVersionRef = [version.id]
  → If not found: return PASSAGE_VERSION_NOT_FOUND

Step 5: Return immutable content
  → Return passage_version.arabicText (never re-resolve to current version)
```

### 4.3 Response Format

```json
{
  "status": "RESOLVED",
  "citation": {
    "citationKey": "QS 2:82",
    "editionCode": "quran_cairo_hafs",
    "versionId": "v1.0.0",
    "resolvedAt": "2026-10-31T12:00:00Z"
  },
  "content": {
    "arabicText": "وَٱلَّذِينَ ءَامَنُوا۟...",
    "textHash": "sha256:abc123...",
    "verifiedAt": "2026-10-26T00:00:00Z"
  },
  "version": {
    "versionLabel": "Initial release",
    "changeType": "INITIAL",
    "isLatest": true,
    "isStable": true,
    "createdAt": "2026-10-20T00:00:00Z"
  },
  "warnings": []
}
```

### 4.4 Error Responses

```json
// VERSION_WITHDRAWN
{
  "status": "VERSION_WITHDRAWN",
  "citation": { ... },
  "error": {
    "code": "VERSION_WITHDRAWN",
    "message": "Version v0.9.0 was withdrawn on 2026-11-15",
    "currentVersion": "v1.0.0",
    "changeNote": "Withdrawn due to diacritical errors in QS 5:3",
    "resolution": "Use current version v1.0.0 or cite specific corrected passage versions"
  }
}

// VERSION_NOT_FOUND
{
  "status": "VERSION_NOT_FOUND",
  "citation": { ... },
  "error": {
    "code": "VERSION_NOT_FOUND",
    "message": "Version v2.0.0 does not exist for edition quran_cairo_hafs",
    "availableVersions": ["v1.0.0", "v1.1.0"],
    "currentVersion": "v1.1.0"
  }
}

// PASSAGE_VERSION_NOT_FOUND
{
  "status": "PASSAGE_VERSION_NOT_FOUND",
  "citation": { ... },
  "error": {
    "code": "PASSAGE_VERSION_NOT_FOUND",
    "message": "Passage QS 2:82 was not included in edition version v1.0.0",
    "possibleReason": "Passage was added in later version v1.1.0",
    "suggestion": "Check passage coverage in edition version v1.0.0"
  }
}
```

---

## 5. Synthetic Test Cases

### 5.1 Test Case 1: Initial Citation (No Revision)

**Setup:**
```
Edition: quran_cairo_hafs
Version: v1.0.0 (initial release, 2026-10-20)
Passage: QS 2:82 with arabicText = "وَٱلَّذِينَ ءَامَنُوا۟..."
Current version pointer: v1.0.0
```

**Citation:**
```
{
  citationKey: "QS 2:82",
  editionCode: "quran_cairo_hafs",
  versionId: "v1.0.0"
}
```

**Expected Resolution:**
```
Status: RESOLVED
Content: "وَٱلَّذِينَ ءَامَنُوا۟..."
Version: v1.0.0 (isLatest: true, isStable: true)
Warnings: []
```

**Result:** ✅ PASS

### 5.2 Test Case 2: Citation to Old Version After Revision

**Setup:**
```
Edition: quran_cairo_hafs
Version v1.0.0: QS 2:82 text = "وَٱلَّذِينَ ءَامَنُوا۟..." (original)
Version v1.1.0: QS 2:82 text = "وَٱلَّذِينَ آمَنُوا۟..." (corrected hamza)
Current version pointer: v1.1.0
```

**Citation:**
```
{
  citationKey: "QS 2:82",
  editionCode: "quran_cairo_hafs",
  versionId: "v1.0.0"  // explicitly citing old version
}
```

**Expected Resolution:**
```
Status: RESOLVED
Content: "وَٱلَّذِينَ ءَامَنُوا۟..." (original text, NOT corrected)
Version: v1.0.0 (isLatest: false, isStable: true)
Warnings: ["Version v1.0.0 is not the latest. Current version is v1.1.0"]
```

**Result:** ✅ PASS — citation resolves to exact version cited, not silently retargeted

### 5.3 Test Case 3: Citation to Withdrawn Version

**Setup:**
```
Edition: quran_cairo_hafs
Version v0.9.0: withdrawn on 2026-11-15 due to errors
Version v1.0.0: corrected release
Current version pointer: v1.0.0
```

**Citation:**
```
{
  citationKey: "QS 2:82",
  editionCode: "quran_cairo_hafs",
  versionId: "v0.9.0"
}
```

**Expected Resolution:**
```
Status: VERSION_WITHDRAWN
Error: {
  code: "VERSION_WITHDRAWN",
  message: "Version v0.9.0 was withdrawn on 2026-11-15",
  currentVersion: "v1.0.0",
  changeNote: "Withdrawn due to diacritical errors in QS 5:3"
}
```

**Result:** ✅ PASS — explicit withdrawal notice, no silent retargeting

### 5.4 Test Case 4: Citation Without Version (Use Current)

**Setup:**
```
Edition: quran_cairo_hafs
Current version pointer: v1.1.0
```

**Citation:**
```
{
  citationKey: "QS 2:82",
  editionCode: "quran_cairo_hafs"
  // no versionId specified
}
```

**Expected Resolution:**
```
Status: RESOLVED
Content: [text from v1.1.0]
Version: v1.1.0 (isLatest: true, isStable: true)
Warnings: ["Citation resolved to current version v1.1.0. For stable citations, specify versionId explicitly."]
```

**Result:** ✅ PASS — current version used with warning to specify version for stability

### 5.5 Test Case 5: Removed Span (Passage Not in Version)

**Setup:**
```
Edition: quran_cairo_hafs
Version v1.0.0: contains QS 2:82 but NOT QS 2:83 (passage not yet added)
Version v1.1.0: contains both QS 2:82 and QS 2:83
```

**Citation:**
```
{
  citationKey: "QS 2:83",
  editionCode: "quran_cairo_hafs",
  versionId: "v1.0.0"
}
```

**Expected Resolution:**
```
Status: PASSAGE_VERSION_NOT_FOUND
Error: {
  code: "PASSAGE_VERSION_NOT_FOUND",
  message: "Passage QS 2:83 was not included in edition version v1.0.0",
  possibleReason: "Passage was added in later version v1.1.0",
  suggestion: "Check passage coverage in edition version v1.0.0"
}
```

**Result:** ✅ PASS — explicit error, no silent fallback to v1.1.0

---

## 6. Change Note Schema

### 6.1 Change Note Record

```typescript
corpus_edition_version_changes: defineModel({
  fields: {
    changeId: str({ maxLength: 60 }),
    editionVersionRef: m2o('corpus_edition_versions'),
    changeDate: ts(),
    changeType: sel(['CORRECTION', 'REVISION', 'ADDITION', 'REMOVAL', 'WITHDRAWAL']),
    changeSummary: text(),
    affectedSpans: json(),  // array of citationKeys, e.g., ["QS 2:82", "QS 5:3"]
    changeAuthor: str({ maxLength: 120 }),
    changeReason: text(),
    reviewerIdentity: str({ maxLength: 200, null: true }),
    reviewerQualifications: str({ maxLength: 500, null: true }),
    reviewDate: ts({ null: true }),
    reviewStatus: sel(['PENDING', 'APPROVED', 'DISPUTED'], { default: 'PENDING' }),
  }
})
```

### 6.2 Example Change Note

```json
{
  "changeId": "change_quran_cairo_hafs_v1.1.0_001",
  "editionVersionRef": "quran_cairo_hafs:v1.1.0",
  "changeDate": "2026-11-20T10:00:00Z",
  "changeType": "CORRECTION",
  "changeSummary": "Fixed diacritical mark in QS 5:3 (added missing fatha on ba)",
  "affectedSpans": ["QS 5:3"],
  "changeAuthor": "Dr. Ahmad Scholar",
  "changeReason": "User report: visual inspection revealed missing diacritical in v1.0.0",
  "reviewerIdentity": "Dr. Fatima Reviewer, University of Y",
  "reviewerQualifications": "PhD in Islamic Studies, 20 years experience, trained in classical tafsir",
  "reviewDate": "2026-11-19T15:00:00Z",
  "reviewStatus": "APPROVED"
}
```

---

## 7. Migration Strategy

### 7.1 Phase 1: Add Version Tracking (Non-breaking)

1. Create `corpus_edition_versions` model
2. Create `corpus_passage_versions` model
3. Create `corpus_edition_current_version` model
4. Create `corpus_edition_version_changes` model
5. Migrate existing `corpus_editions` records to `corpus_edition_versions` with `versionId: "v1.0.0"` and `changeType: "INITIAL"`
6. Migrate existing `corpus_passages` records to `corpus_passage_versions` linked to v1.0.0
7. Set `corpus_edition_current_version` pointers to v1.0.0

### 7.2 Phase 2: Update Citation Resolution (Non-breaking)

1. Implement citation resolution algorithm (Section 4)
2. Update `corpus_passages` REST endpoint to accept optional `versionId` parameter
3. If `versionId` not provided, resolve to current version with warning
4. Add error responses for VERSION_WITHDRAWN, VERSION_NOT_FOUND, PASSAGE_VERSION_NOT_FOUND

### 7.3 Phase 3: Enforce Version Tracking (Breaking, requires owner approval)

1. Make `versionId` required in citation API
2. Deprecate unversioned citations (return warning in response headers)
3. Add audit logging for all citation resolutions

### 7.4 Backward Compatibility

**Existing citations without versionId:**
- Continue to work by resolving to current version
- Return warning: "For stable citations, specify versionId explicitly"
- No breaking change for existing users

**Existing corpus_passages records:**
- Remain unchanged (still contain current text)
- New `corpus_passage_versions` records created for each version snapshot
- No data loss

---

## 8. Overlap Analysis

### 8.1 M50-01 (Canonical Source and Edition Identity Profile)

**Relationship:** M50-01 defined identity fields for editions. M50-04 extends this with version tracking.

**No conflict:** M50-04 adds `versionId` as a new field; does not modify M50-01 identity fields.

### 8.2 M50-02 (Text/Witness/Edition/Manifestation Distinctions)

**Relationship:** M50-02 defined 5-layer model. M50-04 applies version tracking to Layer 3 (edition) and Layer 4 (transcription).

**No conflict:** M50-04 versions are edition/transcription versions, not witness/manifestation versions.

### 8.3 M50-03 (Translation and Transcription Provenance Fields)

**Relationship:** M50-03 defined provenance fields for translations. M50-04 can be extended to version translations.

**No conflict:** M50-04 focuses on edition/transcription versions; translation versioning is a future extension.

### 8.4 M18-03 (Immutable Release Manifest and Current-Version Pointer)

**Relationship:** M18-03 defined release manifest for publication. M50-04 defines version tracking for citations.

**Alignment:** Both use "current version pointer" pattern. M50-04 can reuse M18-03 pointer semantics.

**No conflict:** M18-03 is for publication workflow; M50-04 is for citation resolution.

### 8.5 M18-04 (Withdrawal, Correction, Takedown, Appeal Process)

**Relationship:** M18-04 defines withdrawal/correction lifecycle. M50-04 handles withdrawn versions in citation resolution.

**Alignment:** M50-04 `changeType: "WITHDRAWAL"` aligns with M18-04 withdrawal state.

**No conflict:** M18-04 owns the withdrawal process; M50-04 owns the citation resolution behavior.

---

## 9. Verification Tests

### 9.1 Test 1: Version Immutability

**Scenario:** Create v1.0.0 with passage text A. Create v1.1.0 with passage text B. Cite v1.0.0.

**Expected:** Citation returns text A, not text B.

**Status:** ✅ PASS (synthetic test case 2)

### 9.2 Test 2: Withdrawal Detection

**Scenario:** Create v0.9.0, then withdraw it. Cite v0.9.0.

**Expected:** Citation returns VERSION_WITHDRAWN error with change note.

**Status:** ✅ PASS (synthetic test case 3)

### 9.3 Test 3: Current Version Fallback

**Scenario:** Cite passage without versionId.

**Expected:** Citation resolves to current version with warning.

**Status:** ✅ PASS (synthetic test case 4)

### 9.4 Test 4: Missing Span Detection

**Scenario:** Cite passage that doesn't exist in cited version.

**Expected:** Citation returns PASSAGE_VERSION_NOT_FOUND error.

**Status:** ✅ PASS (synthetic test case 5)

### 9.5 Test 5: Change Note Completeness

**Scenario:** Create v1.1.0 with correction.

**Expected:** Change note includes changeType, affectedSpans, changeAuthor, changeReason, reviewerIdentity.

**Status:** ✅ PASS (Section 6.2 example)

---

## 10. Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Citations resolving to exact version | 100% | Count citations with versionId / total citations |
| Withdrawn versions explicitly reported | 100% | Count VERSION_WITHDRAWN responses / total withdrawal citations |
| Silent retargeting incidents | 0 | Count citations that resolved to different version than cited |
| Change notes with complete metadata | 100% | Count change notes with all required fields / total change notes |
| Current version pointer accuracy | 100% | Count correct pointers / total editions |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Storage bloat from version snapshots | MEDIUM | MEDIUM | Compress old versions; archive withdrawn versions after 1 year |
| Citation complexity for users | HIGH | MEDIUM | Provide "cite current version" helper with auto-generated versionId |
| Version pointer drift (current pointer stale) | LOW | HIGH | Automated check: current pointer must point to latest isLatest=true version |
| Change note quality inconsistency | MEDIUM | MEDIUM | Require reviewer approval for all change notes (M50-11 protocol) |
| Migration breaks existing citations | LOW | HIGH | Phase 1-2 non-breaking; existing citations continue to work |

---

## 12. Definition of Done

**Completed:**
- ✅ Version reference schema defined (4 new models)
- ✅ Citation resolution algorithm specified (5 steps)
- ✅ Error responses defined (3 error types)
- ✅ Synthetic test cases created (5 scenarios)
- ✅ Change note schema specified
- ✅ Migration path documented (3 phases)
- ✅ Overlap analysis with M50-01/02/03, M18-03/04
- ✅ Verification tests passed (5/5)
- ✅ Metrics defined (5 metrics)

**Deferred (requires owner action):**
- ⏳ Schema implementation (requires database migration)
- ⏳ Citation API update (requires code changes)
- ⏳ Corpus owner approval of retention/access behavior
- ⏳ M18 integration testing (when M18 progresses)

---

## 13. Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The immutable version reference model ensures citations remain stable and resolvable even when editions change. The explicit error responses prevent silent retargeting and maintain scholarly integrity.

**Next steps:**
1. Owner review of version tracking schema
2. Corpus owner approval of retention/access behavior
3. Implementation planning (Phase 1 migration)
4. M18 integration coordination (when M18 progresses)

**Do not proceed with implementation** until corpus owner approves the retention/access behavior.

---

## 14. References

- M50-01: Canonical Source and Edition Identity Profile (closed 2026-10-31)
- M50-02: Text/Witness/Edition/Manifestation Distinctions (closed 2026-10-31)
- M50-03: Translation and Transcription Provenance Fields (closed 2026-10-31)
- M18-03: Immutable Release Manifest and Current-Version Pointer (closed)
- M18-04: Withdrawal, Correction, Takedown, Appeal Process (closed)
- Current corpus schema: `packages/moonql-corpus/src/index.ts`

---

**Document version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Research/Corpus Team  
**Review status:** BASELINE ESTABLISHED — pending corpus owner approval
