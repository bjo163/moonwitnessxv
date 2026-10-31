# M50-01 Canonical Source and Edition Identity Profile

**Task ID:** M50-01  
**Status:** BASELINE ESTABLISHED  
**Date:** 2026-10-31  
**Owner:** Corpus  
**Dependencies:** M46-02 (provenance schema), M46-05 (source pin resolution)

## Objective

Define the minimum fields that identify a source, edition, manifestation, and immutable version. Compare existing models and propose identifiers, edition metadata, date precision, language, rights state, and resolution evidence.

## Scope

Contract mapping for existing corpus owner; no global source catalog. Gap audit only; does not recreate M07 source identity, M08 citation UI, source acquisition, rights approval, or M18 rights storage.

---

## 1. Identity Model Overview

### 1.1 Four-Level Identity Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  LEVEL 1: SOURCE                                        │
│  The original work or document (abstract entity)        │
│  Example: "Quran" or "Iliad"                            │
├─────────────────────────────────────────────────────────┤
│  LEVEL 2: EDITION                                       │
│  A specific published version of a source               │
│  Example: "Cairo 1924 edition" or "Oxford 1920 edition"│
├─────────────────────────────────────────────────────────┤
│  LEVEL 3: MANIFESTATION                                 │
│  A physical or digital instance of an edition           │
│  Example: "PDF scan of Cairo 1924" or "Digital OCR"    │
├─────────────────────────────────────────────────────────┤
│  LEVEL 4: VERSION                                       │
│  An immutable snapshot of a manifestation               │
│  Example: "v1.0.0 with corrections applied"            │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Identity Principles

1. **Uniqueness:** Two distinct entities at any level cannot share the same identity
2. **Immutability:** Once assigned, an identity never changes
3. **Persistence:** Identity survives across format changes, migrations, and transformations
4. **Resolution:** Identity can be resolved to a specific entity (source, edition, manifestation, or version)
5. **Provenance:** Identity includes evidence of origin and chain of custody

---

## 2. Source Identity Profile

### 2.1 Source Definition

A **source** is an abstract intellectual or artistic work that exists independently of any specific publication, format, or instance.

**Examples:**
- "Quran" (religious text)
- "Iliad" (epic poem)
- "Constitution of the United States" (legal document)
- "Dialogues of Plato" (philosophical work)

### 2.2 Source Identity Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `sourceId` | string (UUID) | Yes | Unique identifier for the source | `src_550e8400-e29b-41d4-a716-446655440000` |
| `title` | string | Yes | Canonical title of the work | `"Quran"` |
| `alternativeTitles` | string[] | No | Alternative titles, translations, or historical names | `["القرآن", "Koran", "Qur'an"]` |
| `author` | string | No | Author or creator (may be unknown or collective) | `"Prophet Muhammad (PBUH)"` or `UNKNOWN` |
| `dateCreated` | date (ISO 8601) | No | Date or period of creation (may be approximate) | `"0632/0633"` or `"circa 800 BCE"` or `UNKNOWN` |
| `datePrecision` | enum | No | Precision of dateCreated: `EXACT`, `APPROXIMATE`, `RANGE`, `UNKNOWN` | `APPROXIMATE` |
| `language` | string (ISO 639-3) | Yes | Original language of the work | `"ara"` (Arabic) |
| `genre` | string | No | Literary or intellectual genre | `"Religious text"` |
| `subject` | string[] | No | Subject categories or keywords | `["Islam", "Theology", "Law"]` |
| `provenance` | string | Yes | Origin and chain of custody | `"Revealed in Mecca and Medina, 610-632 CE"` |
| `provenanceUri` | string (URI) | No | URI to provenance evidence or documentation | `"https://example.org/provenance/quran"` or `UNKNOWN` |
| `provenanceSha256` | string (SHA-256) | No | SHA-256 hash of provenance evidence (if available) | `"c0a8f1e72b4d912a..."` or `UNKNOWN` |
| `rightsStatus` | enum | Yes | Rights/copyright status: `PUBLIC_DOMAIN`, `COPYRIGHTED`, `LICENSED`, `RIGHTS_EXACT_VERSION_CLEARED`, `RIGHTS_UNKNOWN` | `PUBLIC_DOMAIN` |
| `rightsScope` | enum | No | Scope of rights clearance: `MODEL_CONTEXT`, `PUBLICATION`, `DERIVATIVE`, `UNKNOWN` | `MODEL_CONTEXT` |
| `rightsHolder` | string | No | Rights holder (if applicable) | `UNKNOWN` (for public domain) |
| `consentStatus` | enum | No | Consent status for use: `CONSENT_GRANTED`, `CONSENT_PENDING`, `CONSENT_DENIED`, `CONSENT_UNKNOWN` | `CONSENT_GRANTED` |
| `consentScope` | enum | No | Scope of consent: `MODEL_CONTEXT`, `PUBLICATION`, `DERIVATIVE`, `UNKNOWN` | `MODEL_CONTEXT` |
| `consentExpiresAt` | date (ISO 8601) | No | Expiration date of consent (if applicable) | `"2030-12-31T23:59:59.000Z"` or `UNKNOWN` |
| `visibility` | enum | Yes | Visibility status: `PUBLIC`, `RESTRICTED`, `PRIVATE` | `PUBLIC` |
| `createdAt` | date (ISO 8601) | Yes | Timestamp when source identity was created in system | `"2026-10-31T09:00:00.000Z"` |
| `updatedAt` | date (ISO 8601) | Yes | Timestamp when source identity was last updated | `"2026-10-31T09:00:00.000Z"` |
| `version` | integer | Yes | Schema version for migration support | `1` |

### 2.3 Source Identity Constraints

1. **sourceId uniqueness:** No two sources can have the same sourceId
2. **title required:** Every source must have a canonical title
3. **language required:** Every source must have an original language (ISO 639-3 code)
4. **provenance required:** Every source must have provenance statement (may be `UNKNOWN`)
5. **rightsStatus required:** Every source must have rights status (may be `RIGHTS_UNKNOWN`)
6. **visibility required:** Every source must have visibility status
7. **Immutable sourceId:** Once assigned, sourceId never changes
8. **UNKNOWN handling:** Fields with `UNKNOWN` value must be explicitly marked and cannot be left empty

### 2.4 Source Identity Example

```json
{
  "sourceId": "src_550e8400-e29b-41d4-a716-446655440000",
  "title": "Quran",
  "alternativeTitles": ["القرآن", "Koran", "Qur'an"],
  "author": "Prophet Muhammad (PBUH)",
  "dateCreated": "0632/0633",
  "datePrecision": "APPROXIMATE",
  "language": "ara",
  "genre": "Religious text",
  "subject": ["Islam", "Theology", "Law"],
  "provenance": "Revealed in Mecca and Medina, 610-632 CE",
  "provenanceUri": "https://example.org/provenance/quran",
  "provenanceSha256": "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912",
  "rightsStatus": "PUBLIC_DOMAIN",
  "rightsScope": "MODEL_CONTEXT",
  "rightsHolder": "UNKNOWN",
  "consentStatus": "CONSENT_GRANTED",
  "consentScope": "MODEL_CONTEXT",
  "consentExpiresAt": "2030-12-31T23:59:59.000Z",
  "visibility": "PUBLIC",
  "createdAt": "2026-10-31T09:00:00.000Z",
  "updatedAt": "2026-10-31T09:00:00.000Z",
  "version": 1
}
```

---

## 3. Edition Identity Profile

### 3.1 Edition Definition

An **edition** is a specific published version of a source, characterized by editorial decisions, textual variants, and publication context.

**Examples:**
- "Cairo 1924 edition" (standardized Quran edition)
- "Oxford 1920 edition" (English translation of Iliad)
- "Critical edition of Plato's Dialogues" (scholarly edition with commentary)

### 3.2 Edition Identity Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `editionId` | string (UUID) | Yes | Unique identifier for the edition | `ed_550e8400-e29b-41d4-a716-446655440001` |
| `sourceId` | string (UUID) | Yes | Reference to parent source | `src_550e8400-e29b-41d4-a716-446655440000` |
| `editionTitle` | string | Yes | Title of this specific edition | `"Cairo 1924 Standard Edition"` |
| `editionNumber` | string | No | Edition number or name (e.g., "1st edition", "Revised edition") | `"Standard"` |
| `editor` | string | No | Editor(s) or publisher responsible for this edition | `"Al-Azhar Scholars Committee"` or `UNKNOWN` |
| `datePublished` | date (ISO 8601) | Yes | Date of publication | `"1924"` |
| `datePrecision` | enum | Yes | Precision of datePublished: `EXACT`, `APPROXIMATE`, `RANGE`, `UNKNOWN` | `EXACT` |
| `publisher` | string | No | Publishing house or organization | `"Cairo Royal Press"` or `UNKNOWN` |
| `placePublished` | string | No | City/location of publication | `"Cairo, Egypt"` or `UNKNOWN` |
| `language` | string (ISO 639-3) | Yes | Language of this edition (may differ from source) | `"ara"` |
| `script` | string | No | Writing script used | `"Arabic"` |
| `textualBasis` | string | No | Description of textual basis (manuscripts, prior editions) | `"Based on 7 canonical readings"` or `UNKNOWN` |
| `editorialPrinciples` | string | No | Description of editorial decisions and methodology | `"Standardized rasm, selected canonical readings"` or `UNKNOWN` |
| `variantNotes` | boolean | No | Whether edition includes textual variant notes | `true` |
| `criticalApparatus` | boolean | No | Whether edition includes critical apparatus | `false` |
| `rightsStatus` | enum | Yes | Rights status for this specific edition | `PUBLIC_DOMAIN` |
| `rightsScope` | enum | No | Scope of rights clearance | `MODEL_CONTEXT` |
| `visibility` | enum | Yes | Visibility status | `PUBLIC` |
| `canonicalStatus` | enum | No | Whether this is considered the canonical/standard edition: `CANONICAL`, `NON_CANONICAL`, `DISPUTED`, `UNKNOWN` | `CANONICAL` |
| `createdAt` | date (ISO 8601) | Yes | Timestamp when edition identity was created | `"2026-10-31T09:00:00.000Z"` |
| `updatedAt` | date (ISO 8601) | Yes | Timestamp when edition identity was last updated | `"2026-10-31T09:00:00.000Z"` |
| `version` | integer | Yes | Schema version | `1` |

### 3.3 Edition Identity Constraints

1. **editionId uniqueness:** No two editions can have the same editionId
2. **sourceId reference:** Every edition must reference a valid sourceId
3. **editionTitle required:** Every edition must have a title
4. **datePublished required:** Every edition must have a publication date (may be `UNKNOWN`)
5. **language required:** Every edition must have a language
6. **rightsStatus required:** Every edition must have rights status
7. **visibility required:** Every edition must have visibility status
8. **Distinct editions:** Two editions of the same source must have different editionIds and different editorial characteristics
9. **No edition sharing:** An edition cannot be shared across multiple sources (1:1 relationship with source)

### 3.4 Edition Identity Example

```json
{
  "editionId": "ed_550e8400-e29b-41d4-a716-446655440001",
  "sourceId": "src_550e8400-e29b-41d4-a716-446655440000",
  "editionTitle": "Cairo 1924 Standard Edition",
  "editionNumber": "Standard",
  "editor": "Al-Azhar Scholars Committee",
  "datePublished": "1924",
  "datePrecision": "EXACT",
  "publisher": "Cairo Royal Press",
  "placePublished": "Cairo, Egypt",
  "language": "ara",
  "script": "Arabic",
  "textualBasis": "Based on 7 canonical readings",
  "editorialPrinciples": "Standardized rasm, selected canonical readings",
  "variantNotes": true,
  "criticalApparatus": false,
  "rightsStatus": "PUBLIC_DOMAIN",
  "rightsScope": "MODEL_CONTEXT",
  "visibility": "PUBLIC",
  "canonicalStatus": "CANONICAL",
  "createdAt": "2026-10-31T09:00:00.000Z",
  "updatedAt": "2026-10-31T09:00:00.000Z",
  "version": 1
}
```

---

## 4. Manifestation Identity Profile

### 4.1 Manifestation Definition

A **manifestation** is a specific physical or digital instance of an edition, characterized by format, medium, and technical properties.

**Examples:**
- "PDF scan of Cairo 1924 edition" (digital scan)
- "OCR text of Cairo 1924 edition" (machine-readable text)
- "Printed copy of Cairo 1924 edition, Library of Congress" (physical copy)
- "Audio recording of Cairo 1924 edition" (audio manifestation)

### 4.2 Manifestation Identity Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `manifestationId` | string (UUID) | Yes | Unique identifier for the manifestation | `man_550e8400-e29b-41d4-a716-446655440002` |
| `editionId` | string (UUID) | Yes | Reference to parent edition | `ed_550e8400-e29b-41d4-a716-446655440001` |
| `manifestationType` | enum | Yes | Type: `PHYSICAL_COPY`, `DIGITAL_SCAN`, `OCR_TEXT`, `AUDIO_RECORDING`, `VIDEO_RECORDING`, `DIGITAL_TRANSCRIPTION`, `OTHER` | `DIGITAL_SCAN` |
| `format` | string | Yes | File format or physical format | `"PDF"` or `"Printed book"` |
| `mimeType` | string | No | MIME type (for digital manifestations) | `"application/pdf"` |
| `fileSize` | integer | No | File size in bytes (for digital manifestations) | `15728640` (15 MB) |
| `resolution` | string | No | Resolution or quality (for scans/recordings) | `"300 DPI"` or `"High quality"` |
| `ocrAccuracy` | float | No | OCR accuracy percentage (if applicable) | `98.5` |
| `encoding` | string | No | Character encoding (for text) | `"UTF-8"` |
| `language` | string (ISO 639-3) | Yes | Language of manifestation | `"ara"` |
| `location` | string | No | Physical location or URL | `"https://archive.org/details/quran-cairo-1924"` or `"Library of Congress, Rare Books"` |
| `locationType` | enum | No | Type of location: `URL`, `PHYSICAL_ADDRESS`, `REPOSITORY`, `UNKNOWN` | `URL` |
| `accessRestrictions` | string | No | Access restrictions or requirements | `"Public access"` or `"Requires authentication"` |
| `provenance` | string | Yes | Origin and chain of custody for this manifestation | `"Scanned from original 1924 printed copy by Internet Archive, 2020"` |
| `provenanceUri` | string (URI) | No | URI to provenance evidence | `"https://archive.org/details/quran-cairo-1924/provenance"` or `UNKNOWN` |
| `provenanceSha256` | string (SHA-256) | No | SHA-256 hash of provenance evidence | `"a1b2c3d4e5f6..."` or `UNKNOWN` |
| `rightsStatus` | enum | Yes | Rights status for this manifestation | `PUBLIC_DOMAIN` |
| `rightsScope` | enum | No | Scope of rights clearance | `MODEL_CONTEXT` |
| `visibility` | enum | Yes | Visibility status | `PUBLIC` |
| `createdAt` | date (ISO 8601) | Yes | Timestamp when manifestation was created | `"2020-05-15T14:30:00.000Z"` |
| `updatedAt` | date (ISO 8601) | Yes | Timestamp when manifestation was last updated | `"2026-10-31T09:00:00.000Z"` |
| `version` | integer | Yes | Schema version | `1` |

### 4.3 Manifestation Identity Constraints

1. **manifestationId uniqueness:** No two manifestations can have the same manifestationId
2. **editionId reference:** Every manifestation must reference a valid editionId
3. **manifestationType required:** Every manifestation must have a type
4. **format required:** Every manifestation must have a format
5. **language required:** Every manifestation must have a language
6. **provenance required:** Every manifestation must have provenance statement
7. **rightsStatus required:** Every manifestation must have rights status
8. **visibility required:** Every manifestation must have visibility status
9. **Multiple manifestations:** One edition can have multiple manifestations (1:N relationship)
10. **Format diversity:** Manifestations of the same edition can have different formats (PDF, OCR, audio, etc.)

### 4.4 Manifestation Identity Example

```json
{
  "manifestationId": "man_550e8400-e29b-41d4-a716-446655440002",
  "editionId": "ed_550e8400-e29b-41d4-a716-446655440001",
  "manifestationType": "DIGITAL_SCAN",
  "format": "PDF",
  "mimeType": "application/pdf",
  "fileSize": 15728640,
  "resolution": "300 DPI",
  "ocrAccuracy": null,
  "encoding": null,
  "language": "ara",
  "location": "https://archive.org/details/quran-cairo-1924",
  "locationType": "URL",
  "accessRestrictions": "Public access",
  "provenance": "Scanned from original 1924 printed copy by Internet Archive, 2020",
  "provenanceUri": "https://archive.org/details/quran-cairo-1924/provenance",
  "provenanceSha256": "a1b2c3d4e5f6789012345678901234567890abcd",
  "rightsStatus": "PUBLIC_DOMAIN",
  "rightsScope": "MODEL_CONTEXT",
  "visibility": "PUBLIC",
  "createdAt": "2020-05-15T14:30:00.000Z",
  "updatedAt": "2026-10-31T09:00:00.000Z",
  "version": 1
}
```

---

## 5. Version Identity Profile

### 5.1 Version Definition

A **version** is an immutable snapshot of a manifestation at a specific point in time, characterized by content hash, correction status, and temporal marker.

**Examples:**
- "v1.0.0 — Original scan, no corrections" (initial version)
- "v1.1.0 — OCR corrections applied" (corrected version)
- "v2.0.0 — Re-scanned at higher resolution" (new scan version)

### 5.2 Version Identity Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `versionId` | string (UUID) | Yes | Unique identifier for the version | `ver_550e8400-e29b-41d4-a716-446655440003` |
| `manifestationId` | string (UUID) | Yes | Reference to parent manifestation | `man_550e8400-e29b-41d4-a716-446655440002` |
| `versionNumber` | string (Semantic Versioning) | Yes | Version number (MAJOR.MINOR.PATCH) | `"1.0.0"` |
| `versionLabel` | string | No | Human-readable label | `"Original scan, no corrections"` |
| `contentHash` | string (SHA-256) | Yes | SHA-256 hash of content (ensures immutability) | `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"` |
| `contentSize` | integer | Yes | Size of content in bytes | `15728640` |
| `changeSummary` | string | Yes | Description of changes from previous version | `"Initial scan, no corrections applied"` |
| `changeType` | enum | Yes | Type of change: `INITIAL`, `CORRECTION`, `ENHANCEMENT`, `RESCAN`, `OTHER` | `INITIAL` |
| `previousVersionId` | string (UUID) | No | Reference to previous version (null for initial) | `null` or `ver_550e8400-e29b-41d4-a716-446655440002` |
| `isLatest` | boolean | Yes | Whether this is the latest version | `true` |
| `isStable` | boolean | Yes | Whether this version is stable (no pending changes) | `true` |
| `createdAt` | date (ISO 8601) | Yes | Timestamp when version was created | `"2020-05-15T14:30:00.000Z"` |
| `createdBy` | string | No | Person or system that created this version | `"Internet Archive Scan Service"` or `UNKNOWN` |
| `rightsStatus` | enum | Yes | Rights status (inherited from manifestation) | `PUBLIC_DOMAIN` |
| `visibility` | enum | Yes | Visibility status (inherited from manifestation) | `PUBLIC` |
| `version` | integer | Yes | Schema version | `1` |

### 5.3 Version Identity Constraints

1. **versionId uniqueness:** No two versions can have the same versionId
2. **manifestationId reference:** Every version must reference a valid manifestationId
3. **versionNumber required:** Every version must have a version number (Semantic Versioning)
4. **contentHash required:** Every version must have a content hash (SHA-256)
5. **contentSize required:** Every version must have a content size
6. **changeSummary required:** Every version must have a change summary
7. **changeType required:** Every version must have a change type
8. **isLatest required:** Every version must be marked as latest or not
9. **isStable required:** Every version must be marked as stable or not
10. **Immutability:** Once created, a version cannot be modified (new version required for changes)
11. **Version chain:** Each version (except initial) must reference previous version
12. **Single latest:** Only one version per manifestation can be marked as `isLatest: true`

### 5.4 Version Identity Example

```json
{
  "versionId": "ver_550e8400-e29b-41d4-a716-446655440003",
  "manifestationId": "man_550e8400-e29b-41d4-a716-446655440002",
  "versionNumber": "1.0.0",
  "versionLabel": "Original scan, no corrections",
  "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "contentSize": 15728640,
  "changeSummary": "Initial scan, no corrections applied",
  "changeType": "INITIAL",
  "previousVersionId": null,
  "isLatest": true,
  "isStable": true,
  "createdAt": "2020-05-15T14:30:00.000Z",
  "createdBy": "Internet Archive Scan Service",
  "rightsStatus": "PUBLIC_DOMAIN",
  "visibility": "PUBLIC",
  "version": 1
}
```

---

## 6. Identity Resolution and Uniqueness

### 6.1 Resolution Algorithm

```javascript
function resolveIdentity(identityRef) {
  // Parse identity reference
  const [type, id] = identityRef.split(':');
  
  switch (type) {
    case 'src':
      return resolveSource(id);
    case 'ed':
      return resolveEdition(id);
    case 'man':
      return resolveManifestation(id);
    case 'ver':
      return resolveVersion(id);
    default:
      throw new Error(`Unknown identity type: ${type}`);
  }
}

function resolveSource(sourceId) {
  const source = database.sources.find(s => s.sourceId === sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);
  return {
    type: 'source',
    id: source.sourceId,
    data: source,
    resolved: true
  };
}

function resolveEdition(editionId) {
  const edition = database.editions.find(e => e.editionId === editionId);
  if (!edition) throw new Error(`Edition not found: ${editionId}`);
  const source = resolveSource(edition.sourceId);
  return {
    type: 'edition',
    id: edition.editionId,
    data: edition,
    source: source,
    resolved: true
  };
}

function resolveManifestation(manifestationId) {
  const manifestation = database.manifestations.find(m => m.manifestationId === manifestationId);
  if (!manifestation) throw new Error(`Manifestation not found: ${manifestationId}`);
  const edition = resolveEdition(manifestation.editionId);
  return {
    type: 'manifestation',
    id: manifestation.manifestationId,
    data: manifestation,
    edition: edition,
    source: edition.source,
    resolved: true
  };
}

function resolveVersion(versionId) {
  const version = database.versions.find(v => v.versionId === versionId);
  if (!version) throw new Error(`Version not found: ${versionId}`);
  const manifestation = resolveManifestation(version.manifestationId);
  return {
    type: 'version',
    id: version.versionId,
    data: version,
    manifestation: manifestation,
    edition: manifestation.edition,
    source: manifestation.source,
    resolved: true
  };
}
```

### 6.2 Uniqueness Validation

```javascript
function validateUniqueness(entity) {
  const type = getEntityType(entity);
  const idField = getIdField(type);
  const id = entity[idField];
  
  // Check for duplicate ID
  const existing = database[`${type}s`].find(e => e[idField] === id);
  if (existing && existing[idField] !== entity[idField]) {
    throw new Error(`Duplicate ${type} ID: ${id}`);
  }
  
  // Check for distinct editions of same source
  if (type === 'edition') {
    const existingEditions = database.editions.filter(e => 
      e.sourceId === entity.sourceId && 
      e.editionTitle === entity.editionTitle &&
      e.datePublished === entity.datePublished
    );
    if (existingEditions.length > 0) {
      throw new Error(`Distinct editions cannot share identity: ${entity.editionTitle} (${entity.datePublished})`);
    }
  }
  
  return true;
}
```

### 6.3 Ambiguous Identity Cases

| Case | Scenario | Resolution |
|------|----------|------------|
| **Same title, different authors** | Two sources titled "Iliad" but different authors | Distinguish by author field; assign different sourceIds |
| **Same author, different dates** | Two editions by same editor but different dates | Distinguish by datePublished; assign different editionIds |
| **Same edition, different formats** | One edition in PDF and OCR formats | Same editionId, different manifestationIds |
| **Same manifestation, different versions** | One manifestation with corrections applied | Same manifestationId, different versionIds |
| **Unknown author/date** | Source with unknown author or date | Use `UNKNOWN` value; assign unique sourceId based on title+provenance |
| **Disputed canonical status** | Two editions claiming canonical status | Mark both as `DISPUTED`; assign different editionIds; document dispute |

---

## 7. Serialization Format

### 7.1 Canonical Serialization

All identity records must be serialized in a deterministic, byte-identical format for hashing and verification.

**Serialization rules:**
1. **JSON format:** Use JSON with UTF-8 encoding
2. **Field order:** Fields must be in alphabetical order
3. **No whitespace:** No spaces, newlines, or indentation
4. **Null handling:** Null values must be represented as `null` (not omitted)
5. **Date format:** ISO 8601 with UTC timezone (`Z` suffix)
6. **Number format:** Integers and floats (no scientific notation)
7. **String escaping:** Standard JSON string escaping

**Example canonical serialization:**
```json
{"author":"Prophet Muhammad (PBUH)","consentExpiresAt":"2030-12-31T23:59:59.000Z","consentScope":"MODEL_CONTEXT","consentStatus":"CONSENT_GRANTED","createdAt":"2026-10-31T09:00:00.000Z","dateCreated":"0632/0633","datePrecision":"APPROXIMATE","genre":"Religious text","language":"ara","provenance":"Revealed in Mecca and Medina, 610-632 CE","provenanceSha256":"c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912","provenanceUri":"https://example.org/provenance/quran","rightsHolder":"UNKNOWN","rightsScope":"MODEL_CONTEXT","rightsStatus":"PUBLIC_DOMAIN","sourceId":"src_550e8400-e29b-41d4-a716-446655440000","subject":["Islam","Theology","Law"],"title":"Quran","updatedAt":"2026-10-31T09:00:00.000Z","version":1,"visibility":"PUBLIC"}
```

### 7.2 Serialization Function

```javascript
function canonicalSerialize(entity) {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(entity).sort();
  
  // Build canonical JSON
  const canonical = {};
  for (const key of sortedKeys) {
    canonical[key] = entity[key];
  }
  
  // Serialize with no whitespace
  return JSON.stringify(canonical);
}

function computeHash(entity) {
  const canonical = canonicalSerialize(entity);
  return sha256(canonical);
}
```

### 7.3 Migration Strategy

**Schema version field:** All entities include a `version` field to support future migrations.

**Migration process:**
1. Check entity `version` field
2. If version < current schema version, apply migration functions
3. Update entity `version` field to current schema version
4. Re-compute content hash (if applicable)

**Example migration function:**
```javascript
function migrateEntity(entity, fromVersion, toVersion) {
  let migrated = { ...entity };
  
  for (let v = fromVersion; v < toVersion; v++) {
    switch (v) {
      case 1:
        // Migration from v1 to v2
        migrated.newField = 'default_value';
        migrated.version = 2;
        break;
      case 2:
        // Migration from v2 to v3
        migrated.anotherField = computeDerivedValue(migrated);
        migrated.version = 3;
        break;
      default:
        throw new Error(`Unknown migration version: ${v}`);
    }
  }
  
  return migrated;
}
```

---

## 8. Unresolved Identity Pins

### 8.1 Unresolved Pin Definition

An **unresolved pin** is an identity record where one or more required fields have `UNKNOWN` values, preventing full resolution or verification.

**Examples:**
- Source with unknown author
- Edition with unknown publication date
- Manifestation with unknown provenance
- Version with unknown content hash

### 8.2 Unresolved Pin Handling

**Policy:**
1. **Explicit marking:** All `UNKNOWN` values must be explicitly marked (not left empty or null)
2. **Documentation:** Record reason for `UNKNOWN` value in metadata
3. **Resolution attempt:** Make reasonable effort to resolve `UNKNOWN` values before marking as unresolved
4. **Rights caution:** If rightsStatus or consentStatus is `UNKNOWN`, treat as restricted (do not use)
5. **Periodic review:** Review unresolved pins quarterly; attempt resolution with new evidence
6. **Scholar consultation:** For disputed or ambiguous identities, consult qualified textual scholar

### 8.3 Unresolved Pin Registry

Maintain a registry of all unresolved pins:

```json
{
  "unresolvedPins": [
    {
      "identityRef": "src_550e8400-e29b-41d4-a716-446655440000",
      "entityType": "source",
      "unresolvedFields": ["author", "dateCreated"],
      "reason": "Ancient text with disputed authorship and uncertain date",
      "resolutionAttempts": [
        {
          "date": "2026-10-15",
          "method": "Scholar consultation",
          "result": "No consensus among scholars"
        }
      ],
      "nextReviewDate": "2027-01-15",
      "status": "OPEN"
    }
  ]
}
```

### 8.4 Example: M46-05 Source Pin

From M46-05 (source pin resolution audit), the Cairo Quran 1924 source has:

```json
{
  "sourceId": "src_cairo_quran_1924",
  "title": "Quran (Cairo 1924 Edition)",
  "sourceUri": "https://archive.org/details/cairo-quran-1924",
  "provenanceSha": "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912",
  "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
  "consentScope": "MODEL_CONTEXT",
  "consentExpiresAt": "2027-10-27T12:00:00.000Z",
  "unresolvedFields": [],
  "status": "RESOLVED"
}
```

This pin is **RESOLVED** — all required fields are known.

---

## 9. Testing and Validation

### 9.1 Identity Uniqueness Tests

**Test 1: Distinct sources cannot share identity**
```javascript
const source1 = createSource({ title: "Quran", author: "Prophet Muhammad" });
const source2 = createSource({ title: "Quran", author: "UNKNOWN" });

assert(source1.sourceId !== source2.sourceId, "Distinct sources must have different IDs");
```

**Test 2: Distinct editions cannot share identity**
```javascript
const edition1 = createEdition({ sourceId: src1, title: "Cairo 1924", date: "1924" });
const edition2 = createEdition({ sourceId: src1, title: "Cairo 1924", date: "1925" });

assert(edition1.editionId !== edition2.editionId, "Distinct editions must have different IDs");
```

**Test 3: Same edition cannot have duplicate manifestations**
```javascript
const man1 = createManifestation({ editionId: ed1, format: "PDF" });
const man2 = createManifestation({ editionId: ed1, format: "PDF" });

assert(man1.manifestationId !== man2.manifestationId, "Each manifestation must have unique ID");
```

**Test 4: Same manifestation cannot have duplicate versions**
```javascript
const ver1 = createVersion({ manifestationId: man1, versionNumber: "1.0.0" });
const ver2 = createVersion({ manifestationId: man1, versionNumber: "1.0.0" });

assert(ver1.versionId !== ver2.versionId, "Each version must have unique ID");
```

### 9.2 Serialization Tests

**Test 1: Canonical serialization is byte-identical**
```javascript
const entity = createSource({ title: "Quran", language: "ara" });
const serialized1 = canonicalSerialize(entity);
const serialized2 = canonicalSerialize(entity);

assert(serialized1 === serialized2, "Canonical serialization must be deterministic");
```

**Test 2: Content hash matches serialization**
```javascript
const entity = createSource({ title: "Quran", language: "ara" });
const serialized = canonicalSerialize(entity);
const hash = computeHash(entity);

assert(hash === sha256(serialized), "Content hash must match serialization");
```

### 9.3 Resolution Tests

**Test 1: Resolve source identity**
```javascript
const source = createSource({ title: "Quran" });
const resolved = resolveIdentity(`src:${source.sourceId}`);

assert(resolved.type === 'source', "Must resolve to source type");
assert(resolved.data.title === "Quran", "Must return correct data");
```

**Test 2: Resolve edition with source**
```javascript
const edition = createEdition({ sourceId: src1, title: "Cairo 1924" });
const resolved = resolveIdentity(`ed:${edition.editionId}`);

assert(resolved.type === 'edition', "Must resolve to edition type");
assert(resolved.source.data.title === "Quran", "Must include parent source");
```

**Test 3: Resolve version chain**
```javascript
const version = createVersion({ manifestationId: man1, versionNumber: "2.0.0", previousVersionId: ver1 });
const resolved = resolveIdentity(`ver:${version.versionId}`);

assert(resolved.type === 'version', "Must resolve to version type");
assert(resolved.data.previousVersionId === ver1.versionId, "Must include previous version reference");
```

---

## 10. Limitations and Deferred Items

### 10.1 Not Covered in This Baseline

1. **Global source catalog:** This profile defines identity structure, not a global registry
2. **M07 source identity:** Does not recreate existing M07 implementation
3. **M08 citation UI:** Does not define citation user interface
4. **Source acquisition:** Does not cover source collection or ingestion
5. **Rights approval:** Does not cover rights clearance workflow (only rights status)
6. **M18 rights storage:** Does not recreate existing M18 implementation
7. **Scholar consultation:** Qualified textual scholar review not yet conducted
8. **Production implementation:** This is a design document, not implemented code

### 10.2 Requires Owner Action

1. **Corpus owner review:** Corpus owner must review and approve identity profile
2. **Scholar consultation:** Qualified textual scholar must review definitions and constraints
3. **Implementation:** Build actual identity resolution system based on this profile
4. **Migration:** Migrate existing sources/editions/manifestations/versions to new identity profile
5. **Testing:** Conduct comprehensive testing with real corpus data
6. **Documentation:** Create user documentation for identity management

---

## 11. Success Metrics

### 11.1 Quantitative Metrics

- **Uniqueness:** 100% of identities are unique (no duplicates)
- **Resolution:** 100% of identities can be resolved to entities
- **Serialization:** 100% of serializations are byte-identical (deterministic)
- **Unresolved pins:** <5% of identities have unresolved fields
- **Schema compliance:** 100% of identities comply with schema constraints

### 11.2 Qualitative Metrics

- **Clarity:** Identity profile is clear and understandable
- **Completeness:** All necessary fields are included
- **Flexibility:** Profile accommodates diverse source types
- **Provenance:** Identity includes sufficient provenance information
- **Rights:** Rights and consent status are clearly tracked

---

## 12. Conclusion

This baseline establishes a comprehensive canonical source and edition identity profile with four-level hierarchy (source, edition, manifestation, version). Each level has defined identity fields, constraints, and examples. Identity resolution algorithm and uniqueness validation are specified. Canonical serialization format ensures byte-identical hashing. Unresolved pin handling policy is defined. Testing and validation procedures are documented.

**Status:** BASELINE ESTABLISHED — ready for corpus owner and scholar review.

**Next steps:** Owner action required on scholar consultation, implementation, and migration (see Section 10.2).

**Evidence:** This document.
