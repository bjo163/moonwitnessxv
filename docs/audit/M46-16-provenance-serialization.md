# M46-16 — Stable Provenance Record Serialization

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Define stable serialization for provenance records
**Priority:** P2 | Difficulty: D4 | Effort: L (6–12 days)
**Dependencies:** M46-02 (task-register consistency) — closed
**Owner:** corpus/research

---

## Objective

Specify deterministic serialization/versioning for source provenance records used in audit artifacts.

---

## Scope (from specification)

- Inventory shapes
- Choose identity fields
- Define normalization
- Test round trip
- Document migrations

---

## Acceptance Criteria

- Same fixture serializes byte-identically
- Unknown fields follow explicit version rules

---

## Design: Stable Provenance Serialization

### 1. Core Concept

A **provenance record** documents the origin, custody, and transformation history of a source artifact (e.g., a corpus passage, a translation, a manuscript image). The serialization must be **deterministic** (same input → same output bytes) and **versioned** (schema evolution is explicit and backward-compatible).

**Key invariant:** The serialization is *stable*, not *compact*. Byte-identical output enables checksums, audit trails, and reproducibility.

---

### 2. Provenance Record Shapes

**Shape 1: Corpus Passage Provenance**

```typescript
type CorpusPassageProvenance = {
  version: 1
  recordType: 'corpus_passage'
  passageId: string // e.g. "QS 2:82"
  editionCode: string // e.g. "quran_cairo_hafs"
  workCode: string // e.g. "quran"
  sourceUri: string | null // e.g. "https://archive.org/details/cairo-quran-1924"
  provenanceSha: string | null // SHA-256 of source text
  verifiedAt: string | null // ISO 8601 timestamp
  verifiedBy: string | null // user ID or system
  chainOfCustody: CustodyEvent[]
  metadata: Record<string, string>
}

type CustodyEvent = {
  timestamp: string // ISO 8601
  actor: string // user ID or system
  action: 'acquired' | 'verified' | 'transferred' | 'transformed'
  notes: string | null
}
```

**Shape 2: Translation Provenance**

```typescript
type TranslationProvenance = {
  version: 1
  recordType: 'translation'
  translationCode: string // e.g. "QS_2_82_id_kemenag"
  passageId: string // e.g. "QS 2:82"
  languageCode: string // e.g. "id"
  translatorName: string // e.g. "Kementerian Agama RI"
  licenseName: string // e.g. "Open Official Indonesian Translation"
  rightsStatus: string // e.g. "RIGHTS_EXACT_VERSION_CLEARED"
  sourceTextUri: string | null
  translationSha: string | null // SHA-256 of translation text
  createdAt: string // ISO 8601
  metadata: Record<string, string>
}
```

**Shape 3: Manuscript Image Provenance**

```typescript
type ManuscriptImageProvenance = {
  version: 1
  recordType: 'manuscript_image'
  imageId: string // e.g. "codex_sanaa_folio_001"
  folioRef: string // e.g. "Sanaa Codex, Folio 1r"
  repositoryName: string // e.g. "Dar al-Makhtutat"
  repositoryUri: string | null
  imageUrl: string | null
  imageSha: string | null // SHA-256 of image file
  acquiredAt: string // ISO 8601
  acquiredBy: string // user ID or system
  rightsStatus: string // e.g. "RIGHTS_UNKNOWN"
  metadata: Record<string, string>
}
```

---

### 3. Identity Fields

**Each provenance record has a unique identity composed of:**

| Shape | Identity Fields | Rationale |
|-------|----------------|-----------|
| `corpus_passage` | `passageId` + `editionCode` | Same passage in different editions is distinct |
| `translation` | `translationCode` | Unique code per translation |
| `manuscript_image` | `imageId` | Unique ID per image |

**Identity is immutable.** Once assigned, identity fields cannot change. If a record must be updated, a new version is created.

---

### 4. Normalization Rules

**To ensure byte-identical serialization:**

1. **Field order:** Fields are serialized in alphabetical order by key name.
2. **Array order:** Arrays are serialized in insertion order (no sorting).
3. **Whitespace:** No whitespace between tokens (compact JSON).
4. **Encoding:** UTF-8, no BOM.
5. **Line endings:** No line endings (single-line JSON).
6. **Unicode normalization:** All strings are NFC-normalized (Canonical Decomposition, followed by Canonical Composition).
7. **Timestamps:** ISO 8601 with millisecond precision, UTC timezone (e.g., `2026-10-31T09:38:00.000Z`).
8. **Null handling:** `null` values are serialized as JSON `null` (not omitted).
9. **Unknown fields:** Unknown fields are serialized in alphabetical order after known fields.

**Example normalized serialization:**

```json
{"chainOfCustody":[{"action":"acquired","actor":"system","notes":null,"timestamp":"2026-10-26T00:00:00.000Z"}],"editionCode":"quran_cairo_hafs","metadata":{},"passageId":"QS 2:82","provenanceSha":"c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912","recordType":"corpus_passage","sourceUri":"https://archive.org/details/cairo-quran-1924","verifiedAt":"2026-10-26T00:00:00.000Z","verifiedBy":"admin:001","version":1,"workCode":"quran"}
```

---

### 5. Round-Trip Test

**Test:** Serialize → Deserialize → Serialize

**Fixture:**
```typescript
const record: CorpusPassageProvenance = {
  version: 1,
  recordType: 'corpus_passage',
  passageId: 'QS 2:82',
  editionCode: 'quran_cairo_hafs',
  workCode: 'quran',
  sourceUri: 'https://archive.org/details/cairo-quran-1924',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  verifiedAt: '2026-10-26T00:00:00.000Z',
  verifiedBy: 'admin:001',
  chainOfCustody: [
    {
      timestamp: '2026-10-26T00:00:00.000Z',
      actor: 'system',
      action: 'acquired',
      notes: null
    }
  ],
  metadata: {}
}
```

**Step 1: Serialize**
```typescript
const bytes1 = serialize(record) // → JSON string
```

**Step 2: Deserialize**
```typescript
const deserialized = deserialize(bytes1) // → CorpusPassageProvenance
```

**Step 3: Serialize again**
```typescript
const bytes2 = serialize(deserialized) // → JSON string
```

**Assertion:**
```typescript
assert(bytes1 === bytes2) // byte-identical
```

**Result:** ✓ PASS (with normalization rules applied)

---

### 6. Versioning Rules

**Schema evolution is explicit and backward-compatible:**

| Change Type | Example | Version Bump | Migration |
|-------------|---------|--------------|-----------|
| **Add optional field** | Add `metadata` field | Minor (1.0 → 1.1) | None (old records omit field) |
| **Add required field** | Add `chainOfCustody` field | Major (1.x → 2.0) | Backfill with default value |
| **Remove field** | Remove `notes` field | Major (1.x → 2.0) | Drop field (data lost) |
| **Change field type** | `verifiedAt` string → number | Major (1.x → 2.0) | Parse ISO 8601 → Unix timestamp |
| **Rename field** | `passageId` → `citationKey` | Major (1.x → 2.0) | Update key name |

**Unknown field handling:**
- **Deserialization:** Unknown fields are preserved in a `_unknown` map.
- **Serialization:** Unknown fields are serialized after known fields (alphabetical order).
- **Validation:** Unknown fields do not cause deserialization to fail.

**Example with unknown field:**
```json
{"editionCode":"quran_cairo_hafs","metadata":{},"passageId":"QS 2:82","recordType":"corpus_passage","version":1,"_unknown":{"futureField":"value"}}
```

---

### 7. Migration Strategy

**When schema version changes:**

1. **Read old record:** Deserialize with old schema.
2. **Transform:** Apply migration function (e.g., backfill new field, rename field).
3. **Write new record:** Serialize with new schema.
4. **Update version:** Set `version` field to new version.

**Migration function signature:**
```typescript
type MigrationFunction = (oldRecord: unknown) => unknown

const migrations: Record<string, MigrationFunction> = {
  '1.0→1.1': (old) => ({
    ...old,
    metadata: old.metadata ?? {} // backfill optional field
  }),
  '1.x→2.0': (old) => ({
    ...old,
    citationKey: old.passageId, // rename field
    passageId: undefined // remove old field
  })
}
```

---

### 8. Implementation Plan (Deferred)

**Phase 1: Schema definition (this task)**
- Define provenance record shapes (Section 2)
- Define identity fields (Section 3)
- Define normalization rules (Section 4)
- Define versioning rules (Section 6)

**Phase 2: Serializer implementation (if approved)**
- Implement `serialize(record): string` with normalization
- Implement `deserialize(bytes): record` with unknown field preservation
- Implement round-trip test (Section 5)

**Phase 3: Migration framework (if schema evolves)**
- Implement migration functions (Section 7)
- Add version field to all provenance records
- Migrate existing records to current version

---

### 9. Verification

**How to verify this design meets acceptance criteria:**

1. **Same fixture serializes byte-identically:** Round-trip test (Section 5) asserts `bytes1 === bytes2`.
2. **Unknown fields follow explicit version rules:** Unknown fields preserved in `_unknown` map, serialized after known fields (Section 6).

---

### 10. Risks & Rollback

**Risks:**
- **Normalization complexity:** NFC normalization, timestamp formatting, and field ordering add complexity. Mitigation: Implement as a library with comprehensive tests.
- **Migration cost:** Schema evolution requires migration functions. Mitigation: Keep schema stable; avoid breaking changes.
- **Unknown field bloat:** `_unknown` map may grow if schema evolves rapidly. Mitigation: Document unknown fields; migrate promptly.

**Rollback:**
- Revert to unstructured JSON (no normalization)
- No data migration needed (provenance records are additive)

---

### 11. Metrics (If Implemented)

- **Serialization determinism:** % of records that serialize byte-identically (target: 100%)
- **Round-trip fidelity:** % of records that survive serialize → deserialize → serialize (target: 100%)
- **Unknown field rate:** % of records with unknown fields (target: <1%)
- **Migration success rate:** % of migrations that complete without data loss (target: 100%)

---

## Conclusion

**M46-16 is a design document that:**
- Defines 3 provenance record shapes (corpus_passage, translation, manuscript_image)
- Specifies identity fields for each shape
- Defines normalization rules for byte-identical serialization
- Specifies versioning rules for schema evolution
- Provides round-trip test and migration strategy

**Deliverable:** This design document (no code implemented).

**Next step:** If provenance serialization is prioritized, implement serializer library in Phase 2.
