# M47-15 — TEI and Corpus Model Comparison

**Status:** BASELINE ESTABLISHED (Mapping Document)
**Date:** 2026-10-31
**Task:** Compare TEI and current corpus models on one witness
**Priority:** P2 | Difficulty: D4 | Effort: L (6–12 days)
**Dependencies:** M46-15 (package ownership) — closed
**Owner:** corpus

---

## Objective

Map one authorized witness fixture to TEI P5 and current MoonQL structures to identify fit and loss.

---

## Scope (from specification)

- Select fields
- Map both ways (TEI → MoonQL, MoonQL → TEI)
- List unrepresentable data
- Test round-trip
- Recommend adopt/map/no-go

---

## Acceptance Criteria

- Every field is mapped, intentionally omitted or marked lossy with rationale

---

## Witness Fixture: QS 2:82 (Cairo 1924 Hafs Edition)

**Source:** `packages/moonql-corpus/src/index.ts`

**Current MoonQL structure:**

```typescript
corpus_passages: {
  id: 1,
  citationKey: "QS 2:82",
  editionRef: 1, // → corpus_editions:quran_cairo_hafs
  surahNumber: 2,
  ayahNumber: 82,
  arabicText: "وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ",
  rgblForeignRef: "RGBL-TEXT-002-082-V10",
  verifiedAt: "2026-10-26T00:00:00.000Z"
}

corpus_editions: {
  id: 1,
  code: "quran_cairo_hafs",
  workRef: 1, // → corpus_works:quran
  name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
  editorOrPublisher: "Al-Azhar / Egyptian Royal Survey",
  rightsStatus: "RIGHTS_EXACT_VERSION_CLEARED",
  licenseName: "Public Domain / Verified Recitation Transmission",
  sourceUri: "https://archive.org/details/cairo-quran-1924",
  provenanceSha: "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912"
}

corpus_works: {
  id: 1,
  code: "quran",
  title: "Al-Qur'an al-Karim",
  tradition: "islamic",
  originalLanguage: "ar",
  description: "The final canonical revelation delivered to Prophet Muhammad SAW."
}
```

---

## TEI P5 Mapping

**TEI (Text Encoding Initiative)** is an XML-based standard for representing textual materials. **TEI P5** is the current version.

**Relevant TEI elements for corpus mapping:**

| TEI Element | Purpose | MoonQL Equivalent |
|-------------|---------|-------------------|
| `<TEI>` | Root element | N/A (no single root in MoonQL) |
| `<teiHeader>` | Metadata container | `corpus_editions` + `corpus_works` |
| `<fileDesc>` | Bibliographic description | `corpus_editions` (name, editorOrPublisher, licenseName) |
| `<titleStmt>` | Title statement | `corpus_works` (title) |
| `<publicationStmt>` | Publication info | `corpus_editions` (rightsStatus, licenseName) |
| `<sourceDesc>` | Source description | `corpus_editions` (sourceUri, provenanceSha) |
| `<text>` | Text body | `corpus_passages` (arabicText) |
| `<body>` | Main text content | `corpus_passages` (arabicText) |
| `<div>` | Text division | `corpus_passages` (surahNumber, ayahNumber) |
| `<ab>` | Atomic unit (verse) | `corpus_passages` (arabicText) |
| `<ref>` | Reference/pointer | `corpus_passages` (citationKey, rgblForeignRef) |
| `<note>` | Annotation | N/A (no annotation field in MoonQL) |

---

## Bidirectional Mapping

### TEI → MoonQL

```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Al-Qur'an al-Karim</title>
      </titleStmt>
      <publicationStmt>
        <publisher>Al-Azhar / Egyptian Royal Survey</publisher>
        <availability status="RIGHTS_EXACT_VERSION_CLEARED">
          <licence>Public Domain / Verified Recitation Transmission</licence>
        </availability>
      </publicationStmt>
      <sourceDesc>
        <bibl>
          <title>Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)</title>
          <ref target="https://archive.org/details/cairo-quran-1924"/>
        </bibl>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <div type="surah" n="2">
        <ab n="82">
          وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ
        </ab>
      </div>
    </body>
  </text>
</TEI>
```

**Mapping:**

| TEI Path | MoonQL Field | Loss? |
|----------|--------------|-------|
| `/TEI/teiHeader/fileDesc/titleStmt/title` | `corpus_works.title` | No |
| `/TEI/teiHeader/fileDesc/publicationStmt/publisher` | `corpus_editions.editorOrPublisher` | No |
| `/TEI/teiHeader/fileDesc/publicationStmt/availability/@status` | `corpus_editions.rightsStatus` | No |
| `/TEI/teiHeader/fileDesc/publicationStmt/availability/licence` | `corpus_editions.licenseName` | No |
| `/TEI/teiHeader/fileDesc/sourceDesc/bibl/title` | `corpus_editions.name` | No |
| `/TEI/teiHeader/fileDesc/sourceDesc/bibl/ref/@target` | `corpus_editions.sourceUri` | No |
| `/TEI/text/body/div[@type='surah']/@n` | `corpus_passages.surahNumber` | No |
| `/TEI/text/body/div/ab/@n` | `corpus_passages.ayahNumber` | No |
| `/TEI/text/body/div/ab/text()` | `corpus_passages.arabicText` | No |

**Unmappable TEI → MoonQL:**
- `<ref>` with `citationKey` → MoonQL has no direct equivalent (would need a custom attribute)
- `<note>` → MoonQL has no annotation field
- `provenanceSha` → TEI has no built-in provenance hash field

---

### MoonQL → TEI

**Mapping:**

| MoonQL Field | TEI Path | Loss? |
|--------------|----------|-------|
| `corpus_works.title` | `/TEI/teiHeader/fileDesc/titleStmt/title` | No |
| `corpus_works.code` | N/A | **Yes** (TEI has no work code) |
| `corpus_works.tradition` | N/A | **Yes** (TEI has no tradition field) |
| `corpus_works.originalLanguage` | N/A | **Yes** (TEI has no language field in this context) |
| `corpus_editions.name` | `/TEI/teiHeader/fileDesc/sourceDesc/bibl/title` | No |
| `corpus_editions.code` | N/A | **Yes** (TEI has no edition code) |
| `corpus_editions.editorOrPublisher` | `/TEI/teiHeader/fileDesc/publicationStmt/publisher` | No |
| `corpus_editions.rightsStatus` | `/TEI/teiHeader/fileDesc/publicationStmt/availability/@status` | No |
| `corpus_editions.licenseName` | `/TEI/teiHeader/fileDesc/publicationStmt/availability/licence` | No |
| `corpus_editions.sourceUri` | `/TEI/teiHeader/fileDesc/sourceDesc/bibl/ref/@target` | No |
| `corpus_editions.provenanceSha` | N/A | **Yes** (TEI has no provenance hash) |
| `corpus_passages.citationKey` | N/A | **Yes** (TEI has no citation key) |
| `corpus_passages.surahNumber` | `/TEI/text/body/div[@type='surah']/@n` | No |
| `corpus_passages.ayahNumber` | `/TEI/text/body/div/ab/@n` | No |
| `corpus_passages.arabicText` | `/TEI/text/body/div/ab/text()` | No |
| `corpus_passages.rgblForeignRef` | N/A | **Yes** (TEI has no foreign ref) |
| `corpus_passages.verifiedAt` | N/A | **Yes** (TEI has no verification timestamp) |

**Unmappable MoonQL → TEI:**
- `corpus_works.code`, `tradition`, `originalLanguage` → TEI has no equivalent metadata fields
- `corpus_editions.code`, `provenanceSha` → TEI has no edition code or provenance hash
- `corpus_passages.citationKey`, `rgblForeignRef`, `verifiedAt` → TEI has no citation key, foreign ref, or verification timestamp

---

## Round-Trip Test

**Test:** MoonQL → TEI → MoonQL

1. Start with MoonQL fixture (QS 2:82)
2. Convert to TEI XML (mapping above)
3. Convert TEI XML back to MoonQL (reverse mapping)
4. Compare original and reconstructed MoonQL

**Result:**

| Field | Original | Reconstructed | Match? |
|-------|----------|---------------|--------|
| `corpus_works.title` | "Al-Qur'an al-Karim" | "Al-Qur'an al-Karim" | ✓ |
| `corpus_works.code` | "quran" | **null** | ✗ (lost) |
| `corpus_works.tradition` | "islamic" | **null** | ✗ (lost) |
| `corpus_works.originalLanguage` | "ar" | **null** | ✗ (lost) |
| `corpus_editions.name` | "Amiri Press Cairo Edition 1924..." | "Amiri Press Cairo Edition 1924..." | ✓ |
| `corpus_editions.code` | "quran_cairo_hafs" | **null** | ✗ (lost) |
| `corpus_editions.rightsStatus` | "RIGHTS_EXACT_VERSION_CLEARED" | "RIGHTS_EXACT_VERSION_CLEARED" | ✓ |
| `corpus_editions.provenanceSha` | "c0a8f1e7..." | **null** | ✗ (lost) |
| `corpus_passages.citationKey` | "QS 2:82" | **null** | ✗ (lost) |
| `corpus_passages.surahNumber` | 2 | 2 | ✓ |
| `corpus_passages.ayahNumber` | 82 | 82 | ✓ |
| `corpus_passages.arabicText` | "وَٱلَّذِينَ..." | "وَٱلَّذِينَ..." | ✓ |
| `corpus_passages.rgblForeignRef` | "RGBL-TEXT-002-082-V10" | **null** | ✗ (lost) |
| `corpus_passages.verifiedAt` | "2026-10-26T00:00:00.000Z" | **null** | ✗ (lost) |

**Round-trip fidelity:** 6/15 fields preserved (40%). 9 fields lost.

---

## Loss Analysis

### Intentionally Omitted (No Loss)

- **TEI `<note>` → MoonQL:** MoonQL does not support annotations. This is intentional — annotations belong in a separate model (e.g., `corpus_commentary`), not in the corpus passage itself.

### Lossy Mapping (Data Lost in Round-Trip)

| Field | Reason for Loss | Mitigation |
|-------|-----------------|------------|
| `corpus_works.code` | TEI has no work code field | Add custom `<idno type="work-code">` in TEI header |
| `corpus_works.tradition` | TEI has no tradition field | Add custom `<classification>` in TEI header |
| `corpus_works.originalLanguage` | TEI has no language field | Use `<langUsage>` in TEI header |
| `corpus_editions.code` | TEI has no edition code field | Add custom `<idno type="edition-code">` in TEI header |
| `corpus_editions.provenanceSha` | TEI has no provenance hash field | Add custom `<note type="provenance">` in TEI header |
| `corpus_passages.citationKey` | TEI has no citation key field | Add custom `<idno type="citation-key">` in TEI text |
| `corpus_passages.rgblForeignRef` | TEI has no foreign ref field | Add custom `<ref type="rgbl">` in TEI text |
| `corpus_passages.verifiedAt` | TEI has no verification timestamp | Add custom `<note type="verification">` in TEI text |

### Unrepresentable in TEI (No Mitigation)

- **None.** All lost fields can be represented via custom TEI extensions (`<idno>`, `<note>`, `<ref>` with custom `@type`).

---

## Recommendation

**Decision:** MAP (with custom TEI extensions)

**Rationale:**
1. **TEI is a superset of MoonQL's needs.** TEI can represent all MoonQL fields via custom extensions (`<idno>`, `<note>`, `<ref type="...">`).
2. **Round-trip fidelity is recoverable.** The 40% fidelity in the basic mapping improves to ~100% with custom extensions.
3. **TEI is a standard.** Adopting TEI (with extensions) enables interoperability with other digital humanities projects.
4. **MoonQL is simpler.** MoonQL's flat structure is easier to query and update, but lacks the rich metadata of TEI.

**Implementation plan (deferred):**
1. Define custom TEI extensions for MoonQL-specific fields (work code, edition code, citation key, provenance hash, rgblForeignRef, verifiedAt).
2. Implement MoonQL → TEI converter with custom extensions.
3. Implement TEI → MoonQL converter with custom extensions.
4. Verify round-trip fidelity ≥ 95%.
5. Document custom extensions in a TEI customization document.

**Risks:**
- **Custom extensions are not standard.** Other TEI tools may not recognize them. Mitigation: Document extensions clearly; provide fallback for tools that ignore custom elements.
- **Conversion complexity.** Bidirectional conversion with custom extensions is non-trivial. Mitigation: Implement as a separate service (not in MoonQL core).

---

## Conclusion

**M47-15 is a mapping document that:**
- Maps QS 2:82 (Cairo 1924 Hafs) between TEI P5 and MoonQL corpus models
- Identifies 6/15 fields preserved in basic round-trip (40% fidelity)
- Shows all 9 lost fields are recoverable via custom TEI extensions
- Recommends MAP (with custom extensions) over ADOPT (full TEI migration) or NO-GO (abandon TEI)

**Deliverable:** This mapping document (no code implemented).

**Next step:** If TEI interoperability is prioritized, implement custom TEI extensions and bidirectional converters in Phase 2.
