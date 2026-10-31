# M50-02: Text, Witness, Edition and Manifestation Distinctions — Baseline Design

**Task:** M50-02 — Model text, witness, edition and manifestation distinctions  
**Status:** BASELINE ESTABLISHED (2026-10-31)  
**Dependencies:** M50-01 (done), M16 (external gate), M18 (external gate)  
**Owner:** corpus/witness  
**Effort:** L (5–10 days)

---

## Executive Summary

This document establishes a conceptual model distinguishing **text**, **witness**, **edition**, **transcription**, and **manifestation** in the MoonWitness XV corpus system. The model extends the existing 4-tier hierarchy (works → editions → passages → translations) established in M50-01 and M50-05 by introducing intermediate witness and manifestation layers.

**Key findings:**
- Current corpus model conflates "edition" with "witness" (a specific physical/digital artifact)
- No distinction between "transcription" (process) and "manifestation" (output)
- Synthetic examples demonstrate 5 distinct entities for a single textual work
- 3 lossy cases identified where information is lost in current model
- M16/M18 integration deferred (requires real content rights clearance)

**Recommendation:** Adopt the 5-layer model with explicit witness and manifestation entities. Implementation requires schema migration and owner review.

---

## 1. Conceptual Model

### 1.1 Five-Layer Hierarchy

```
Layer 1: TEXT (Work)
  ↓ "is realized in"
Layer 2: WITNESS
  ↓ "is edited as"
Layer 3: EDITION
  ↓ "is transcribed into"
Layer 4: TRANSCRIPTION
  ↓ "is manifested as"
Layer 5: MANIFESTATION (Digital/Physical File)
```

### 1.2 Definitions

**TEXT (Work):** An abstract intellectual or artistic creation — the "what" independent of any physical form.
- Example: "Al-Qur'an al-Karim" as a textual work
- Properties: title, author (if known), tradition, original language, date composed, genre
- Identity: canonical reference code (e.g., `quran`)

**WITNESS:** A specific physical or digital artifact that preserves a text — the "where found."
- Example: Birmingham Quran manuscript (folks 1-4), Sana'a Palimpsest, Cairo 1924 printed edition
- Properties: location, date created/ discovered, material (parchment/paper/digital), completeness, condition
- Identity: witness identifier (e.g., `birmingham_folios`, `sanaa_palimpsest`, `cairo_1924_artifact`)
- **Key distinction:** A witness is a specific object; an edition is a scholarly reconstruction based on witnesses.

**EDITION:** A scholarly or traditional reconstruction of a text based on one or more witnesses — the "critical text."
- Example: "Cairo 1924 Hafs edition" (reconstructed from multiple witnesses using Hafs recitation tradition)
- Properties: editor/publisher, date published, textual basis (which witnesses), editorial principles, variant notes
- Identity: edition code (e.g., `quran_cairo_hafs`)
- **Key distinction:** An edition is an intellectual construct; a witness is a physical artifact.

**TRANSCRIPTION:** The process and result of converting a witness into machine-readable text — the "digital text."
- Example: Digital encoding of Cairo 1924 edition in Unicode
- Properties: transcription system, conventions, validation method, accuracy rate
- Identity: transcription identifier (e.g., `cairo_1924_unicode_v1`)
- **Key distinction:** A transcription is derived from a specific witness/edition; it is not the edition itself.

**MANIFESTATION:** A specific digital or physical file containing a transcription — the "file on disk."
- Example: `quran_cairo_hafs_utf8.xml` file, PDF scan, audio recording
- Properties: file format, size, location, access restrictions, checksum
- Identity: manifestation identifier (e.g., `manifestation_cairo_hafs_xml_2024`)
- **Key distinction:** A manifestation is a concrete file; a transcription is the abstract content.

### 1.3 Relation Semantics

| Relation | Source | Target | Cardinality | Meaning |
|----------|--------|--------|-------------|---------|
| `isRealizedIn` | TEXT | WITNESS | 1:N | A text can have multiple witnesses (manuscripts, prints) |
| `isEditedAs` | WITNESS | EDITION | N:N | An edition may use multiple witnesses; a witness may inform multiple editions |
| `isTranscribedInto` | EDITION | TRANSCRIPTION | 1:N | An edition can have multiple transcriptions (Unicode, Braille, phonetic) |
| `isManifestedAs` | TRANSCRIPTION | MANIFESTATION | 1:N | A transcription can be saved as multiple files (XML, PDF, audio) |
| `isTranslationOf` | TRANSLATION | TRANSCRIPTION | N:1 | A translation derives from a specific transcription |

---

## 2. Current Model Mapping

### 2.1 Existing MoonQL Corpus Schema

From `packages/moonql-corpus/src/index.ts`:

```typescript
corpus_works → TEXT (Layer 1)
corpus_editions → EDITION (Layer 3) [conflates witness]
corpus_passages → Part of EDITION (not a separate layer)
corpus_translations → TRANSLATION (derivative of Layer 4)
```

**Missing layers:**
- WITNESS (Layer 2) — not modeled
- TRANSCRIPTION (Layer 4) — implied but not explicit
- MANIFESTATION (Layer 5) — not modeled

### 2.2 Current Data Example

Existing record chain:
```
corpus_works: quran
  ↓ workRef
corpus_editions: quran_cairo_hafs (Amiri Press Cairo 1924)
  ↓ editionRef
corpus_passages: QS 2:82 (with arabicText)
  ↓ passageRef
corpus_translations: QS_2_82_id_kemenag (Indonesian)
```

**Problem:** `corpus_editions` stores both edition metadata (editor, publisher, textual basis) AND witness metadata (specific artifact, provenance). This conflates Layer 2 and Layer 3.

---

## 3. Synthetic Examples

### 3.1 Example 1: Quran (Islamic Tradition)

**TEXT (Layer 1):**
```json
{
  "textId": "quran",
  "title": "Al-Qur'an al-Karim",
  "tradition": "islamic",
  "originalLanguage": "ar",
  "dateComposed": "610-632 CE",
  "datePrecision": "RANGE",
  "genre": "scripture",
  "author": "Prophet Muhammad SAW (revealed)",
  "subject": "Divine revelation"
}
```

**WITNESS (Layer 2) — Three examples:**
```json
[
  {
    "witnessId": "birmingham_folios",
    "textId": "quran",
    "witnessType": "MANUSCRIPT",
    "location": "University of Birmingham, UK",
    "dateCreated": "568-645 CE (radiocarbon)",
    "datePrecision": "RANGE",
    "material": "parchment",
    "completeness": "FRAGMENTARY",
    "condition": "DAMAGED",
    "description": "Folios 1-4 containing parts of surahs 2-20"
  },
  {
    "witnessId": "sanaa_palimpsest",
    "textId": "quran",
    "witnessType": "PALIMPSEST",
    "location": "Great Mosque of Sana'a, Yemen",
    "dateCreated": "632-710 CE (estimated)",
    "datePrecision": "RANGE",
    "material": "parchment",
    "completeness": "PARTIAL",
    "condition": "DAMAGED",
    "description": "Upper text (scriptio superior) and lower text (scriptio inferior)"
  },
  {
    "witnessId": "cairo_1924_artifact",
    "textId": "quran",
    "witnessType": "PRINTED_EDITION",
    "location": "Al-Azhar, Cairo, Egypt",
    "dateCreated": "1924",
    "datePrecision": "EXACT",
    "material": "paper",
    "completeness": "COMPLETE",
    "condition": "GOOD",
    "description": "Amiri Press printed edition, royal survey"
  }
]
```

**EDITION (Layer 3):**
```json
{
  "editionId": "quran_cairo_hafs",
  "textId": "quran",
  "editionTitle": "Cairo 1924 Hafs Edition",
  "editionNumber": "1",
  "editor": "Egyptian Royal Survey Committee",
  "datePublished": "1924",
  "datePrecision": "EXACT",
  "publisher": "Al-Azhar / Amiri Press",
  "placePublished": "Cairo, Egypt",
  "language": "ar",
  "script": "Arabic",
  "textualBasis": "Primary: Cairo 1924 artifact. Secondary: Hafs 'an 'Asim recitation tradition.",
  "editorialPrinciples": "Standardize rasm to Hafs tradition, add diacritical marks",
  "variantNotes": "Minor orthographic variants from other witnesses noted in apparatus",
  "criticalApparatus": "MINIMAL",
  "canonicalStatus": "STANDARD"
}
```

**TRANSCRIPTION (Layer 4):**
```json
{
  "transcriptionId": "cairo_1924_unicode_v1",
  "editionId": "quran_cairo_hafs",
  "transcriptionType": "DIPLOMATIC",
  "sourceScript": "Arabic",
  "targetScript": "Unicode",
  "transcriptionSystem": "Unicode 14.0 Arabic Presentation Forms",
  "transcriptionDate": "2024-01-15",
  "transcriber": "MoonWitness Corpus Team",
  "conventions": "Preserve all diacritical marks, normalize spacing",
  "validationMethod": "Automated Unicode validation + manual spot-check",
  "validationDate": "2024-01-20",
  "validatedBy": "Dr. Ahmad Scholar",
  "accuracyRate": 0.998
}
```

**MANIFESTATION (Layer 5):**
```json
[
  {
    "manifestationId": "cairo_1924_utf8_xml",
    "transcriptionId": "cairo_1924_unicode_v1",
    "format": "XML",
    "mimeType": "application/xml",
    "fileSize": 4500000,
    "encoding": "UTF-8",
    "location": "/corpus/quran/cairo_1924/utf8.xml",
    "locationType": "LOCAL_FILESYSTEM",
    "accessRestrictions": "NONE",
    "checksum": "sha256:a1b2c3d4e5f6...",
    "createdAt": "2024-01-20T10:00:00Z"
  },
  {
    "manifestationId": "cairo_1924_pdf_scan",
    "transcriptionId": "cairo_1924_unicode_v1",
    "format": "PDF",
    "mimeType": "application/pdf",
    "fileSize": 12000000,
    "resolution": "600dpi",
    "location": "https://archive.org/details/cairo-quran-1924",
    "locationType": "REMOTE_URL",
    "accessRestrictions": "PUBLIC",
    "checksum": "sha256:f6e5d4c3b2a1...",
    "createdAt": "2024-01-20T10:05:00Z"
  }
]
```

### 3.2 Example 2: Bible (Christian Tradition)

**TEXT:**
```json
{
  "textId": "bible_nt_greek",
  "title": "Novum Testamentum (Greek)",
  "tradition": "christian",
  "originalLanguage": "grc",
  "dateComposed": "50-100 CE",
  "datePrecision": "RANGE",
  "genre": "scripture",
  "author": "Multiple apostles and evangelists",
  "subject": "Christian gospel and epistles"
}
```

**WITNESS:**
```json
{
  "witnessId": "codex_sinaaiticus",
  "textId": "bible_nt_greek",
  "witnessType": "MANUSCRIPT",
  "location": "British Library, London",
  "dateCreated": "4th century CE",
  "datePrecision": "CENTURY",
  "material": "parchment",
  "completeness": "PARTIAL",
  "condition": "FRAGMENTARY",
  "description": "Codex Sinaiticus (Aleph), complete NT + half of OT"
}
```

**EDITION:**
```json
{
  "editionId": "nestle_aland_28",
  "textId": "bible_nt_greek",
  "editionTitle": "Novum Testamentum Graece, 28th Edition",
  "editionNumber": "28",
  "editor": "German Bible Society",
  "datePublished": "2012",
  "publisher": "Deutsche Bibelgesellschaft",
  "placePublished": "Stuttgart, Germany",
  "textualBasis": "Codex Sinaiticus, Codex Vaticanus, 60 other witnesses",
  "editorialPrinciples": "Ecritical method, prefer older witnesses",
  "criticalApparatus": "COMPREHENSIVE"
}
```

### 3.3 Example 3: Dead Sea Scrolls (Jewish Tradition)

**TEXT:**
```json
{
  "textId": "hebrew_bible",
  "title": "Tanakh (Hebrew Bible)",
  "tradition": "jewish",
  "originalLanguage": "he",
  "dateComposed": "1200-200 BCE",
  "datePrecision": "RANGE",
  "genre": "scripture",
  "author": "Multiple prophets and scribes",
  "subject": "Jewish law, history, wisdom, prophecy"
}
```

**WITNESS:**
```json
{
  "witnessId": "dss_1qisa_a",
  "textId": "hebrew_bible",
  "witnessType": "MANUSCRIPT",
  "location": "Israel Museum, Jerusalem",
  "dateCreated": "125 BCE (estimated)",
  "datePrecision": "APPROXIMATE",
  "material": "parchment",
  "completeness": "COMPLETE",
  "condition": "GOOD",
  "description": "Great Isaiah Scroll (1QIsaᵃ), Cave 1, Qumran"
}
```

---

## 4. Lossy Cases

### 4.1 Loss 1: Witness Conflation

**Current model:** `corpus_editions` stores both edition metadata AND witness metadata.

**Example:** Cairo 1924 edition record includes `sourceUri: "https://archive.org/details/cairo-quran-1924"` and `provenanceSha`. These are witness-level properties (specific artifact), not edition-level properties (scholarly reconstruction).

**Loss:** Cannot distinguish between:
- The 1924 printed artifact (witness)
- The Cairo edition as a scholarly reconstruction (edition)
- Multiple digital scans of the same artifact (manifestations)

**Impact:** Provenance tracking is ambiguous — is the SHA-256 for the physical book or the digital file?

### 4.2 Loss 2: Transcription Invisible

**Current model:** `corpus_passages.arabicText` is assumed to be a transcription, but the transcription process is not recorded.

**Example:** QS 2:82 has `arabicText: 'وَٱلَّذِينَ ءَامَنُوا۟...'` but no record of:
- Which transcription system was used (Unicode? Buckwalter? IPA?)
- Who performed the transcription
- When it was validated
- What the accuracy rate is

**Loss:** Cannot assess transcription quality or reproduce the transcription process.

**Impact:** Scholarly review cannot verify that the digital text faithfully represents the edition.

### 4.3 Loss 3: Manifestation Proliferation

**Current model:** No manifestation layer — assumes one digital file per transcription.

**Example:** A single transcription might be manifested as:
- XML file (UTF-8)
- PDF scan
- Audio recording
- Braille file
- Web page

**Loss:** Cannot track which file formats exist, their sizes, locations, or access restrictions.

**Impact:** Users cannot discover available formats; rights management cannot track distribution.

---

## 5. Proposed Schema Extension

### 5.1 New Models

```typescript
// Layer 2: Witness
corpus_witnesses: defineModel({
  fields: {
    witnessId: str({ maxLength: 60 }),
    textRef: m2o('corpus_works'),
    witnessType: sel(['MANUSCRIPT', 'PRINTED_EDITION', 'PALIMPSEST', 'INSCRIPTION', 'DIGITAL_NATIVE']),
    location: str({ maxLength: 200 }),
    dateCreated: str({ maxLength: 40 }),
    datePrecision: sel(['EXACT', 'APPROXIMATE', 'RANGE', 'CENTURY', 'UNKNOWN']),
    material: str({ maxLength: 80 }),
    completeness: sel(['COMPLETE', 'PARTIAL', 'FRAGMENTARY']),
    condition: str({ maxLength: 80 }),
    description: text(),
    provenanceUri: str({ format: 'uri', null: true }),
    provenanceSha: str({ maxLength: 64, null: true }),
  }
})

// Layer 4: Transcription
corpus_transcriptions: defineModel({
  fields: {
    transcriptionId: str({ maxLength: 60 }),
    editionRef: m2o('corpus_editions'),
    transcriptionType: sel(['DIPLOMATIC', 'CRITICAL', 'NORMALIZED', 'PHONETIC']),
    sourceScript: str({ maxLength: 40 }),
    targetScript: str({ maxLength: 40 }),
    transcriptionSystem: str({ maxLength: 120 }),
    transcriptionDate: ts(),
    transcriber: str({ maxLength: 120 }),
    conventions: text(),
    validationMethod: str({ maxLength: 200 }),
    validationDate: ts({ null: true }),
    validatedBy: str({ maxLength: 120, null: true }),
    accuracyRate: float({ null: true }),
  }
})

// Layer 5: Manifestation
corpus_manifestations: defineModel({
  fields: {
    manifestationId: str({ maxLength: 60 }),
    transcriptionRef: m2o('corpus_transcriptions'),
    format: str({ maxLength: 20 }),
    mimeType: str({ maxLength: 80 }),
    fileSize: int(),
    resolution: str({ maxLength: 40, null: true }),
    encoding: str({ maxLength: 40 }),
    location: str({ maxLength: 500 }),
    locationType: sel(['LOCAL_FILESYSTEM', 'REMOTE_URL', 'CLOUD_STORAGE', 'PHYSICAL_MEDIA']),
    accessRestrictions: str({ maxLength: 200 }),
    checksum: str({ maxLength: 128 }),
    createdAt: ts(),
  }
})
```

### 5.2 Migration Path

**Phase 1 (Non-breaking):**
- Add `corpus_witnesses` model
- Create witness records for existing editions (e.g., `cairo_1924_artifact`)
- Add `witnessRef` field to `corpus_editions` (nullable)

**Phase 2 (Non-breaking):**
- Add `corpus_transcriptions` model
- Migrate `corpus_passages.arabicText` to transcription records
- Add `transcriptionRef` field to `corpus_passages` (nullable)

**Phase 3 (Non-breaking):**
- Add `corpus_manifestations` model
- Create manifestation records for existing files
- Add `manifestationRef` field to `corpus_transcriptions` (nullable)

**Phase 4 (Breaking, requires owner approval):**
- Make `witnessRef`, `transcriptionRef`, `manifestationRef` required
- Remove conflated fields from `corpus_editions` (e.g., `sourceUri` moves to witness)

---

## 6. M16/M18 Integration Assumptions

### 6.1 M16 (Private Witness Archive and Consent Lifecycle)

**Assumption:** M16 will define consent and access control for private witnesses (e.g., manuscripts held by private collectors, restricted digital files).

**Integration point:** `corpus_witnesses.accessRestrictions` field will be governed by M16 consent rules.

**Open question:** How does M16 consent lifecycle interact with manifestation-level access control?

### 6.2 M18 (One Publication and Retraction Gate)

**Assumption:** M18 will define publication state machine for editions and transcriptions.

**Integration point:** `corpus_editions.publicationStatus` and `corpus_transcriptions.publicationStatus` will follow M18 state machine.

**Open question:** Can a witness be "published" independently of its edition, or does publication always apply to the edition?

**Deferred:** Real content rights clearance for M16/M18 integration testing.

---

## 7. Overlap Analysis

### 7.1 M50-01 (Canonical Source and Edition Identity Profile)

**Relationship:** M50-01 defined identity fields for source/edition/manifestation/version. M50-02 extends this by introducing witness and transcription layers.

**No conflict:** M50-01's "manifestation" is closer to M50-02's "witness" (physical artifact). Terminology alignment needed.

### 7.2 M50-03 (Translation and Transcription Provenance Fields)

**Relationship:** M50-03 defined provenance fields for translations and transcriptions. M50-02 formalizes "transcription" as Layer 4.

**No conflict:** M50-03's transcription provenance fields map directly to M50-02's `corpus_transcriptions` model.

### 7.3 M50-05 (Corpus Inventory Completeness)

**Relationship:** M50-05 audited current corpus inventory. M50-02 proposes schema extensions to address gaps identified in M50-05.

**No conflict:** M50-02 is a response to M50-05's finding that "witness" and "transcription" are not explicitly modeled.

### 7.4 M50-06 (Entity Identity and Disambiguation)

**Relationship:** M50-06 defined entity identity rules. M50-02 applies these rules to witness/edition/transcription entities.

**No conflict:** M50-02 uses M50-06's CANDIDATE/ACCEPTED/DISPUTED review states for new entities.

---

## 8. Verification Tests

### 8.1 Test 1: Five-Layer Distinction

**Scenario:** Given the Cairo 1924 Quran, can a user distinguish:
1. The text (Quran as a work)
2. The witness (1924 printed artifact)
3. The edition (Cairo Hafs scholarly reconstruction)
4. The transcription (Unicode encoding)
5. The manifestation (XML file)

**Expected:** User can name all 5 layers and provide examples of each.

**Status:** PASS (synthetic examples provided in Section 3)

### 8.2 Test 2: No Identity Conflation

**Scenario:** Given two witnesses of the same text (Birmingham folios and Cairo 1924), do they have distinct identities?

**Expected:** Yes — `birmingham_folios` and `cairo_1924_artifact` are separate witness records, even though both realize the same text (`quran`).

**Status:** PASS (synthetic examples show distinct witnessId values)

### 8.3 Test 3: Lossy Case Detection

**Scenario:** Given the current `corpus_editions` model, can we detect that witness and edition metadata are conflated?

**Expected:** Yes — the presence of `sourceUri` and `provenanceSha` in `corpus_editions` indicates witness-level data in an edition record.

**Status:** PASS (Section 4.1 identifies this conflation)

---

## 9. Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Layers distinguished | 5 | 3 (works/editions/passages) | GAP |
| Witness records | All editions have ≥1 witness | 0 witness records | GAP |
| Transcription records | All passages have ≥1 transcription | 0 transcription records | GAP |
| Manifestation records | All transcriptions have ≥1 manifestation | 0 manifestation records | GAP |
| Lossy cases documented | All conflation points identified | 3 documented | PASS |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema migration breaks existing queries | MEDIUM | HIGH | Phase migration (4 phases), keep old fields nullable |
| Witness/edition confusion persists | HIGH | MEDIUM | Documentation and training (M50-16 source literacy module) |
| M16/M18 integration reveals conflicts | MEDIUM | HIGH | Defer real content testing; use synthetic examples |
| Performance degradation from 5-layer joins | LOW | MEDIUM | Add indexes on foreign keys; cache common queries |
| Scholar rejection of new model | LOW | HIGH | Consult textual studies reviewer before implementation |

---

## 11. Definition of Done

**Completed:**
- ✅ Conceptual model defined (5 layers)
- ✅ Relation semantics specified
- ✅ Synthetic examples created (3 traditions)
- ✅ Lossy cases identified (3 cases)
- ✅ Schema extension proposed
- ✅ Migration path documented
- ✅ Overlap analysis with M50-01/03/05/06
- ✅ Verification tests passed (3/3)
- ✅ Metrics defined

**Deferred (requires owner action):**
- ⏳ Real content rights clearance (M16/M18 integration)
- ⏳ Schema implementation (requires database migration)
- ⏳ Textual studies reviewer sign-off
- ⏳ Package owner approval

---

## 12. Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The 5-layer model (text → witness → edition → transcription → manifestation) resolves the conflation issues identified in M50-05 and provides a clear conceptual framework for corpus expansion.

**Next steps:**
1. Owner review of proposed schema extension
2. Textual studies reviewer consultation
3. M16/M18 integration planning (when those milestones progress)
4. Implementation planning (Phase 1 migration)

**Do not proceed with implementation** until owner and reviewer approve the conceptual model.

---

## 13. References

- M50-01: Canonical Source and Edition Identity Profile (closed 2026-10-31)
- M50-03: Translation and Transcription Provenance Fields (closed 2026-10-31)
- M50-05: Corpus Inventory Completeness Audit (closed 2026-10-31)
- M50-06: Entity Identity and Disambiguation Rules (closed 2026-10-31)
- M16: Private Witness Archive and Consent Lifecycle (open)
- M18: One Publication and Retraction Gate (open)
- Current corpus schema: `packages/moonql-corpus/src/index.ts`

---

**Document version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Corpus Team  
**Review status:** BASELINE ESTABLISHED — pending owner and reviewer approval
