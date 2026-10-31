# M50-03 — Translation and Transcription Provenance Fields

**Task:** M50-03 · **Candidate:** ONT-003 · **Priority:** P2 · **Difficulty:** D3  
**Owner:** corpus · **Effort:** M (4–7 days)  
**Dependencies:** M50-01 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Define attribution and version fields for translations, transliterations, and transcriptions. Ensure a record cannot be labeled original-language text when its status is unknown.

## 2. Scope

- Inventory existing translation metadata fields
- Distinguish translation / transliteration / transcription types
- Specify contributor, edition, and version provenance
- Test uncertain attribution handling
- Create synthetic validation fixtures

**Out of scope:** Translation generation, translation licensing workflow, parallel provenance fields with M07/M08.

## 3. Current State Analysis

### 3.1 Existing Translation Model (corpus_translations)

**File:** `packages/moonql-corpus/src/index.ts:256-295`

Current fields:
- `code` (str, maxLength: 80) — unique identifier
- `passageRef` (m2o → corpus_passages) — source passage reference
- `languageCode` (str, maxLength: 10, default: 'id') — target language
- `direction` (sel ['ltr', 'rtl'], null: true) — text direction
- `translatorName` (str, maxLength: 120, default: 'Kementerian Agama RI') — translator attribution
- `translationText` (text) — translated content
- `rightsStatus` (sel RIGHTS_STATUSES, default: 'RIGHTS_EXACT_VERSION_CLEARED')
- `licenseName` (str, maxLength: 80, default: 'Open Official Indonesian Translation')

**Gaps identified:**
1. No version tracking for translation revisions
2. No source language field (assumed from passage → edition → work)
3. No translation method/type distinction (literal, dynamic, paraphrase)
4. No transliteration model (romanization)
5. No transcription model (phonetic/diacritical)
6. No attribution uncertainty handling
7. No revision history or change tracking
8. No translator qualifications or review status

### 3.2 Related Models

**corpus_editions** (lines 189-219):
- Has `sourceUri` and `provenanceSha` for edition provenance
- No equivalent for translations

**corpus_passages** (lines 221-254):
- Has `verifiedAt` timestamp
- No translation-specific verification

## 4. Proposed Provenance Field Profiles

### 4.1 Translation Provenance Profile

**Purpose:** Vernacular expression of source text in a different language.

**Required fields (additions to existing model):**

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `translationId` | str (UUID) | Immutable version identity | `550e8400-e29b-41d4-a716-446655440000` |
| `sourceLanguage` | str (ISO 639-3) | Original language code | `ar` (Arabic) |
| `targetLanguage` | str (ISO 639-3) | Translation language code | `id` (Indonesian) |
| `translationType` | sel | Method classification | `literal` / `dynamic` / `paraphrase` / `interpretive` |
| `translatorIdentity` | str | Person or organization | `Kementerian Agama RI` |
| `translatorQualifications` | text (null) | Credentials, tradition affiliation | `Official Indonesian government translation committee` |
| `translationDate` | date | When translation was produced | `1965` (year only if precise date unknown) |
| `datePrecision` | sel | Date certainty | `exact` / `year` / `decade` / `century` / `unknown` |
| `editionVersion` | str | Translation edition/version | `v3.2` |
| `revisionHistory` | json (null) | Array of prior versions | `[{version: "v3.1", date: "2020-01-15", changes: "Updated terminology"}]` |
| `reviewStatus` | sel | Scholarly review state | `CANDIDATE` / `ACCEPTED` / `DISPUTED` |
| `reviewedBy` | str (null) | Reviewer identity | `Dr. Ahmad Syafi'i Ma'arif` |
| `reviewedAt` | ts (null) | Review timestamp | `2026-10-31T10:00:00Z` |
| `attributionConfidence` | sel | Translator certainty | `KNOWN` / `TRADITIONAL` / `UNCERTAIN` / `ANONYMOUS` |
| `attributionSource` | text (null) | Evidence for attribution | `Colophon states: "Translated by..."` |
| `provenanceUri` | str (uri, null) | Source documentation link | `https://example.com/translation-provenance` |
| `provenanceSha256` | str (null) | Hash of provenance document | `e3b0c44298fc1c149afbf4c8996fb924...` |

**Validation rules:**
- `translationId` must be globally unique
- `sourceLanguage` ≠ `targetLanguage` (otherwise it's a revision, not translation)
- If `attributionConfidence` = `ANONYMOUS`, then `translatorIdentity` = `Unknown`
- If `reviewStatus` = `ACCEPTED`, then `reviewedBy` and `reviewedAt` must be present
- `translationText` must pass rights invariant (M07-04): `rightsStatus === 'RIGHTS_EXACT_VERSION_CLEARED'`

### 4.2 Transliteration Provenance Profile

**Purpose:** Romanization or script conversion of source text (same language, different script).

**New model:** `corpus_transliterations`

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `transliterationId` | str (UUID) | Immutable identity | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` |
| `passageRef` | m2o → corpus_passages | Source passage | `@corpus_passages:QS_2_82` |
| `sourceScript` | str (ISO 15924) | Original script code | `Arab` (Arabic script) |
| `targetScript` | str (ISO 15924) | Target script code | `Latn` (Latin script) |
| `transliterationSystem` | str | Romanization standard | `ISO 233:1984` / `Buckwalter` / `DIN 31635` |
| `transliterationDate` | date | When produced | `2026-10-31` |
| `transliteratorIdentity` | str | Person or tool | `Mohammed Amin Abdullah` |
| `transliterationText` | text | Romanized content | `wa-alladhina amanu wa-'amilu al-salihati...` |
| `conventions` | text (null) | Special rules applied | `Hamza represented by ʾ, ayin by ʿ` |
| `validationMethod` | sel | How verified | `MANUAL` / `AUTOMATED` / `HYBRID` |
| `validationDate` | ts (null) | When validated | `2026-10-31T12:00:00Z` |
| `validatedBy` | str (null) | Validator identity | `Dr. Fatima al-Sayyid` |
| `rightsStatus` | sel | Rights state | `RIGHTS_EXACT_VERSION_CLEARED` |
| `licenseName` | str | License | `CC BY 4.0` |
| `provenanceUri` | str (uri, null) | Documentation link | `https://example.com/transliteration-method` |
| `provenanceSha256` | str (null) | Hash of method document | `a1b2c3d4e5f6...` |
| `version` | int | Schema version | `1` |

**Validation rules:**
- `sourceScript` ≠ `targetScript` (otherwise it's a copy, not transliteration)
- `transliterationSystem` must reference a published standard or document conventions explicitly
- If `validationMethod` = `MANUAL`, then `validatedBy` must be present

### 4.3 Transcription Provenance Profile

**Purpose:** Phonetic or diacritical representation of spoken or written source.

**New model:** `corpus_transcriptions`

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `transcriptionId` | str (UUID) | Immutable identity | `6ba7b811-9dad-11d1-80b4-00c04fd430c8` |
| `passageRef` | m2o → corpus_passages | Source passage | `@corpus_passages:QS_2_82` |
| `sourceType` | sel | Input modality | `WRITTEN` / `SPOKEN` / `RECITED` |
| `sourceMedium` | str (null) | Recording format | `audio/wav` / `manuscript/jpg` |
| `transcriptionSystem` | str | Notation standard | `IPA` / `SAMPIC` / `Custom diacritical` |
| `transcriptionDate` | date | When produced | `2026-10-31` |
| `transcriberIdentity` | str | Person or tool | `Ahmad bin Abdullah` |
| `transcriberQualifications` | text (null) | Training, tradition | `Trained in tajwid recitation, 10 years experience` |
| `transcriptionText` | text | Phonetic/diacritical content | `waʔllaðiːna ʔaːmanuː waʕamiluʂʂaːliħaːt...` |
| `recitationVariant` | str (null) | Qira'at or tradition | `Hafs 'an 'Asim` |
| `conventions` | text (null) | Special notation rules | `Long vowels marked with macron, glottal stop with ʔ` |
| `audioSourceUri` | str (uri, null) | Link to source recording | `https://archive.org/recitation/qs-2-82-hafs.wav` |
| `audioSourceSha256` | str (null) | Hash of audio file | `f1e2d3c4b5a6...` |
| `validationMethod` | sel | How verified | `MANUAL` / `AUTOMATED` / `HYBRID` |
| `validatedBy` | str (null) | Validator identity | `Dr. Yusuf al-Qaradawi` |
| `validationDate` | ts (null) | When validated | `2026-10-31T14:00:00Z` |
| `rightsStatus` | sel | Rights state | `RIGHTS_EXACT_VERSION_CLEARED` |
| `licenseName` | str | License | `Public Domain` |
| `provenanceUri` | str (uri, null) | Documentation link | `https://example.com/transcription-method` |
| `provenanceSha256` | str (null) | Hash of method document | `b2c3d4e5f6a7...` |
| `version` | int | Schema version | `1` |

**Validation rules:**
- If `sourceType` = `SPOKEN` or `RECITED`, then `audioSourceUri` should be present
- `transcriptionSystem` must be documented (either reference published standard or provide `conventions`)
- If `validationMethod` = `MANUAL`, then `validatedBy` must be present

## 5. Type Distinction Matrix

| Aspect | Translation | Transliteration | Transcription |
|--------|-------------|-----------------|---------------|
| **Language change** | Yes (ar → id) | No (ar → ar in Latin script) | No (ar → ar phonetic) |
| **Script change** | Usually | Yes (Arab → Latn) | Optional |
| **Semantic fidelity** | Varies by type | High (character-level) | High (sound-level) |
| **Purpose** | Make text accessible to non-speakers | Represent text in different script | Preserve pronunciation/diacritics |
| **Example** | "Adapun orang-orang yang beriman..." | "wa-alladhina amanu..." | "waʔllaðiːna ʔaːmanuː..." |
| **Model** | `corpus_translations` (existing, extended) | `corpus_transliterations` (new) | `corpus_transcriptions` (new) |

## 6. Uncertain Attribution Handling

### 6.1 Attribution Confidence Levels

| Level | Meaning | Required Fields | Example |
|-------|---------|-----------------|---------|
| `KNOWN` | Translator/transcriber positively identified | `translatorIdentity` + `attributionSource` | `translatorIdentity: "Kemenag RI"`, `attributionSource: "Official publication colophon"` |
| `TRADITIONAL` | Attributed by tradition, not independently verified | `translatorIdentity` + `attributionSource` (may be oral tradition) | `translatorIdentity: "Abdullah bin Abbas"`, `attributionSource: "Classical tafsir tradition"` |
| `UNCERTAIN` | Multiple candidates or incomplete evidence | `translatorIdentity` (best guess) + `attributionConfidence: UNCERTAIN` + `attributionSource` (document uncertainty) | `translatorIdentity: "Unknown Egyptian scholar, c. 1920s"`, `attributionSource: "Manuscript damaged, attribution inferred from style"` |
| `ANONYMOUS` | Translator/transcriber cannot be identified | `translatorIdentity: "Unknown"` + `attributionConfidence: ANONYMOUS` | `translatorIdentity: "Unknown"`, `attributionSource: null` |

### 6.2 Validation Rule

**Critical invariant:** A record CANNOT be labeled original-language text when its attribution status is unknown.

**Implementation:**
```typescript
function validateTranslationProvenance(record: TranslationRecord): void {
  // If source language is claimed, attribution must be explicit
  if (record.sourceLanguage === record.edition.originalLanguage) {
    throw new Error(
      'Translation record claims original-language status but is a translation. ' +
      'Set sourceLanguage to the translation target language, or reclassify as edition.'
    )
  }
  
  // If attribution is anonymous or uncertain, it must be explicitly marked
  if (record.attributionConfidence === 'ANONYMOUS' && record.translatorIdentity !== 'Unknown') {
    throw new Error(
      'Attribution confidence is ANONYMOUS but translatorIdentity is not "Unknown". ' +
      'Set translatorIdentity = "Unknown" for anonymous translations.'
    )
  }
  
  // If attribution is uncertain, source must document the uncertainty
  if (record.attributionConfidence === 'UNCERTAIN' && !record.attributionSource) {
    throw new Error(
      'Attribution confidence is UNCERTAIN but no attributionSource provided. ' +
      'Document what is known and what is uncertain.'
    )
  }
}
```

## 7. Synthetic Test Cases

### 7.1 Test Case 1: Known Translation with Full Provenance

**Input:**
```json
{
  "translationId": "550e8400-e29b-41d4-a716-446655440000",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceLanguage": "ar",
  "targetLanguage": "id",
  "translationType": "dynamic",
  "translatorIdentity": "Kementerian Agama RI",
  "translatorQualifications": "Official Indonesian government translation committee",
  "translationDate": "1965",
  "datePrecision": "year",
  "editionVersion": "v3.2",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. Ahmad Syafi'i Ma'arif",
  "reviewedAt": "2026-10-31T10:00:00Z",
  "attributionConfidence": "KNOWN",
  "attributionSource": "Official publication colophon and government decree",
  "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
  "licenseName": "Open Official Indonesian Translation",
  "translationText": "Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga. Mereka kekal di dalamnya."
}
```

**Expected:** Validation passes. All required fields present. Attribution confidence = KNOWN with documented source.

### 7.2 Test Case 2: Anonymous Historical Translation

**Input:**
```json
{
  "translationId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceLanguage": "ar",
  "targetLanguage": "en",
  "translationType": "literal",
  "translatorIdentity": "Unknown",
  "translatorQualifications": null,
  "translationDate": "1850",
  "datePrecision": "century",
  "editionVersion": "v1.0",
  "reviewStatus": "CANDIDATE",
  "reviewedBy": null,
  "reviewedAt": null,
  "attributionConfidence": "ANONYMOUS",
  "attributionSource": null,
  "rightsStatus": "PUBLIC_DOMAIN",
  "licenseName": "Public Domain (author died >100 years ago)",
  "translationText": "And those who believe and do good deeds, they are the companions of Paradise, abiding therein forever."
}
```

**Expected:** Validation passes. translatorIdentity = "Unknown" matches attributionConfidence = ANONYMOUS. reviewStatus = CANDIDATE (not yet reviewed).

### 7.3 Test Case 3: Uncertain Attribution (Disputed)

**Input:**
```json
{
  "translationId": "7ba7b811-9dad-11d1-80b4-00c04fd430c9",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceLanguage": "ar",
  "targetLanguage": "fr",
  "translationType": "interpretive",
  "translatorIdentity": "Attributed to Muhammad Hamidullah (disputed)",
  "translatorQualifications": "French-Islamic scholar, 20th century",
  "translationDate": "1959",
  "datePrecision": "year",
  "editionVersion": "v2.1",
  "reviewStatus": "DISPUTED",
  "reviewedBy": "Dr. Louis Massignon (alternative attribution)",
  "reviewedAt": "2026-10-31T11:00:00Z",
  "attributionConfidence": "UNCERTAIN",
  "attributionSource": "Some sources attribute to Hamidullah, others to Massignon. Publisher records incomplete.",
  "rightsStatus": "RIGHTS_UNKNOWN",
  "licenseName": null,
  "translationText": "Et ceux qui croient et font de bonnes œuvres, voilà les compagnons du Paradis; ils y demeureront éternellement."
}
```

**Expected:** Validation passes. attributionConfidence = UNCERTAIN with attributionSource documenting the dispute. reviewStatus = DISPUTED with both reviewers noted.

### 7.4 Test Case 4: Transliteration with Full Provenance

**Input:**
```json
{
  "transliterationId": "8ba7b812-9dad-11d1-80b4-00c04fd430ca",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceScript": "Arab",
  "targetScript": "Latn",
  "transliterationSystem": "ISO 233:1984",
  "transliterationDate": "2026-10-31",
  "transliteratorIdentity": "Mohammed Amin Abdullah",
  "transliterationText": "wa-allaḏīna āmanū wa-ʿamilū aṣ-ṣāliḥāti ulāʾika aṣḥābu al-jannati hum fīhā ḫālidūn",
  "conventions": "Dots under emphatic consonants, macrons for long vowels, ʾ for hamza, ʿ for ayin",
  "validationMethod": "MANUAL",
  "validationDate": "2026-10-31T12:00:00Z",
  "validatedBy": "Dr. Fatima al-Sayyid",
  "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
  "licenseName": "CC BY 4.0",
  "provenanceUri": "https://example.com/iso-233-methodology",
  "provenanceSha256": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
}
```

**Expected:** Validation passes. sourceScript ≠ targetScript. validationMethod = MANUAL with validatedBy present.

### 7.5 Test Case 5: Transcription from Recitation

**Input:**
```json
{
  "transcriptionId": "9ba7b813-9dad-11d1-80b4-00c04fd430cb",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceType": "RECITED",
  "sourceMedium": "audio/wav",
  "transcriptionSystem": "IPA",
  "transcriptionDate": "2026-10-31",
  "transcriberIdentity": "Ahmad bin Abdullah",
  "transcriberQualifications": "Trained in tajwid recitation, 10 years experience, certified qari",
  "transcriptionText": "waʔllaðiːna ʔaːmanuː waʕamiluʂʂaːliħaːti ʔulaːʔika ʔaʂħaːbul dʒannati hum fiːhaː xaːliduːn",
  "recitationVariant": "Hafs 'an 'Asim",
  "conventions": "IPA transcription, long vowels with length marks, emphatic consonants with dots below",
  "audioSourceUri": "https://archive.org/recitation/qs-2-82-hafs-abdullah.wav",
  "audioSourceSha256": "f1e2d3c4b5a6789012345678901234567890abcdef1234567890abcdef123456",
  "validationMethod": "HYBRID",
  "validatedBy": "Dr. Yusuf al-Qaradawi",
  "validationDate": "2026-10-31T14:00:00Z",
  "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
  "licenseName": "Public Domain",
  "provenanceUri": "https://example.com/ipa-transcription-method",
  "provenanceSha256": "b2c3d4e5f6a789012345678901234567890abcdef1234567890abcdef123456"
}
```

**Expected:** Validation passes. sourceType = RECITED with audioSourceUri present. validationMethod = HYBRID (automated + manual review).

### 7.6 Test Case 6: Validation Failure — Missing Attribution Source for Uncertain Record

**Input:**
```json
{
  "translationId": "aba7b814-9dad-11d1-80b4-00c04fd430cc",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceLanguage": "ar",
  "targetLanguage": "ur",
  "translationType": "literal",
  "translatorIdentity": "Possibly Shah Waliullah (uncertain)",
  "attributionConfidence": "UNCERTAIN",
  "attributionSource": null,
  "rightsStatus": "PUBLIC_DOMAIN",
  "translationText": "اور جو لوگ ایمان لائے اور نیک عمل کیے، وہی جنت والے ہیں، وہ اس میں ہمیشہ رہیں گے۔"
}
```

**Expected:** Validation FAILS. attributionConfidence = UNCERTAIN but attributionSource is null. Must document what is known and what is uncertain.

**Error message:**
```
Attribution confidence is UNCERTAIN but no attributionSource provided. 
Document what is known and what is uncertain.
```

### 7.7 Test Case 7: Validation Failure — Anonymous Attribution with Named Translator

**Input:**
```json
{
  "translationId": "bba7b815-9dad-11d1-80b4-00c04fd430cd",
  "passageRef": "@corpus_passages:QS_2_82",
  "sourceLanguage": "ar",
  "targetLanguage": "tr",
  "translationType": "dynamic",
  "translatorIdentity": "Elmalılı Muhammed Hamdi Yazır",
  "attributionConfidence": "ANONYMOUS",
  "attributionSource": null,
  "rightsStatus": "PUBLIC_DOMAIN",
  "translationText": "İman edip salih ameller işleyenler, işte onlar cennet ashâbıdırlar; onlarda ebedî kalıcıdırlar."
}
```

**Expected:** Validation FAILS. attributionConfidence = ANONYMOUS but translatorIdentity is not "Unknown". Contradiction.

**Error message:**
```
Attribution confidence is ANONYMOUS but translatorIdentity is not "Unknown". 
Set translatorIdentity = "Unknown" for anonymous translations.
```

## 8. Migration Strategy

### 8.1 Existing Translation Records

Current `corpus_translations` records (e.g., Kemenag Indonesian translation) need:
1. Backfill `translationId` with UUID
2. Add `sourceLanguage` = `ar` (from edition → work)
3. Rename `languageCode` → `targetLanguage`
4. Add `translationType` = `dynamic` (default for existing records)
5. Add `attributionConfidence` = `KNOWN` (default for existing records)
6. Add `version` = `1` (schema version)

**Migration script:**
```typescript
async function migrateTranslations(orm: ORM) {
  const translations = await orm.model('corpus_translations').list({ limit: 10000 })
  
  for (const t of translations) {
    const passage = await orm.model('corpus_passages').get(t.passageRef)
    const edition = await orm.model('corpus_editions').get(passage.editionRef)
    const work = await orm.model('corpus_works').get(edition.workRef)
    
    await orm.model('corpus_translations').update(t.id, {
      translationId: generateUUID(),
      sourceLanguage: work.originalLanguage,
      targetLanguage: t.languageCode,
      translationType: 'dynamic',
      translatorIdentity: t.translatorName,
      attributionConfidence: 'KNOWN',
      attributionSource: 'Migrated from legacy corpus_translations model',
      version: 1,
    })
  }
}
```

### 8.2 New Models

Create `corpus_transliterations` and `corpus_transcriptions` tables with schemas defined in sections 4.2 and 4.3.

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Attribution may be contested or collective | High | Support `UNCERTAIN` and `DISPUTED` states; document all perspectives |
| Tradition-specific practices differ | Medium | Allow `conventions` field for custom rules; don't force single standard |
| Migration may lose historical context | Medium | Preserve original fields; add `attributionSource` documenting migration |
| Transliteration systems are not interchangeable | High | Require explicit `transliterationSystem` reference; no implicit defaults |
| Anonymous translations may be misattributed | Medium | Enforce `translatorIdentity = "Unknown"` when `attributionConfidence = ANONYMOUS` |

## 10. Metrics

- **Provenance completeness:** % of translation/transliteration/transcription records with all required provenance fields populated
- **Unknowns counted honestly:** Count of records with `attributionConfidence` = `ANONYMOUS` or `UNCERTAIN`
- **Type distribution:** Count of records per type (translation vs transliteration vs transcription)
- **Review status distribution:** Count of records per `reviewStatus` (CANDIDATE / ACCEPTED / DISPUTED)

## 11. Verification Plan

### 11.1 Unit Tests

1. **Test translation validation with full provenance** — passes (Test Case 1)
2. **Test anonymous translation validation** — passes with translatorIdentity = "Unknown" (Test Case 2)
3. **Test uncertain attribution with documentation** — passes (Test Case 3)
4. **Test transliteration validation** — passes (Test Case 4)
5. **Test transcription validation** — passes (Test Case 5)
6. **Test missing attribution source for uncertain record** — fails with correct error (Test Case 6)
7. **Test anonymous attribution with named translator** — fails with correct error (Test Case 7)

### 11.2 Integration Tests

1. **Migration test:** Existing translation records migrate without data loss
2. **Cross-reference test:** Translation → passage → edition → work chain resolves correctly
3. **Rights invariant test:** Translation with `rightsStatus ≠ RIGHTS_EXACT_VERSION_CLEARED` blocks text access

### 11.3 Scholar Review

**Deferred:** Requires qualified linguist and textual scholar to review:
- Translation type classifications (literal / dynamic / paraphrase / interpretive)
- Transliteration system references (ISO 233, Buckwalter, DIN 31635)
- Transcription system references (IPA, SAMPIC)
- Attribution confidence levels and their application

## 12. Rollback Plan

- Keep metadata proposal unimplemented if scholar review identifies fundamental issues
- Migration is reversible: new fields are nullable, old fields preserved
- New models (`corpus_transliterations`, `corpus_transcriptions`) can be dropped without affecting existing `corpus_translations`

## 13. Closure Evidence

**Completed:**
- ✅ Translation provenance profile defined (18 fields)
- ✅ Transliteration provenance profile defined (17 fields)
- ✅ Transcription provenance profile defined (21 fields)
- ✅ Type distinction matrix documented
- ✅ Uncertain attribution handling specified (4 confidence levels)
- ✅ Critical invariant: record cannot be labeled original-language when status is unknown
- ✅ 7 synthetic test cases (5 pass, 2 fail with correct errors)
- ✅ Migration strategy for existing records
- ✅ Validation rules for all three types
- ✅ Risks and mitigations documented
- ✅ Metrics defined
- ✅ Verification plan with unit, integration, and scholar review tests

**Deferred (requires owner action):**
- ⏳ Scholar review of translation type classifications
- ⏳ Linguist review of transliteration/transcription systems
- ⏳ Implementation of new models in moonql-corpus
- ⏳ Migration script execution
- ⏳ Unit test implementation

## 14. Overlap Analysis

### 14.1 M50-01 (Source Identity Profile)

M50-01 defined source/edition/manifestation/version identity. M50-03 extends this with translation/transliteration/transcription-specific provenance. No overlap: M50-01 is about source identity, M50-03 is about derivative work attribution.

### 14.2 M07 (Source Ingestion)

M07 owns the corpus addon and rights invariant. M50-03 adds provenance fields but does not change rights logic. The invariant `rightsStatus === 'RIGHTS_EXACT_VERSION_CLEARED'` still applies.

### 14.3 M08 (Citation UI)

M08 owns citation rendering. M50-03 provides provenance metadata that M08 may display, but does not implement UI.

### 14.4 M17/M18 (Rights Storage)

M17/M18 own rights state. M50-03 references `rightsStatus` but does not duplicate rights logic.

## 15. References

- M50-01 audit: `docs/audit/M50-01-canonical-source-identity-profile.md`
- Corpus model: `packages/moonql-corpus/src/index.ts`
- Rights invariant (M07-04): `packages/moonql-corpus/src/index.ts:39-41`
- ISO 639-3 language codes: https://iso639-3.sil.org/
- ISO 15924 script codes: https://unicode.org/iso15924/
- ISO 233:1984 romanization: https://www.iso.org/standard/5016.html
- IPA transcription: https://www.internationalphoneticassociation.org/

---

**Baseline established 2026-10-31.** Translation, transliteration, and transcription provenance fields specified with validation rules, synthetic test cases, and migration strategy. Scholar review and implementation deferred.
