# M47-26 — Personal Research Export Bundle

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Explore a personal research export bundle
**Priority:** P2 | Difficulty: D4 | Effort: L (6–12 days)
**Dependencies:** M47-15 (TEI comparison), M46-16 (provenance serialization) — both closed
**Owner:** research package

---

## Objective

Test whether a small, user-controlled export can preserve notes plus source references for offline scholarship.

---

## Scope (from specification)

- Define minimal package
- Generate fixture
- Verify checksum
- Test absence of private data
- Review portability

---

## Acceptance Criteria

- Bundle opens offline
- Reports version and sources
- Excludes unapproved/private material

---

## Design: Research Export Bundle

### 1. Core Concept

A **research export bundle** is a self-contained, portable package that a researcher can download and use offline. It contains:
- Research notes (Markdown)
- Source references (provenance records)
- Citations (rights-cleared text only)
- Metadata (version, checksum, export date)

**Key invariant:** The bundle is *user-controlled* — the researcher chooses what to include. It is *privacy-safe* — no private data, no unapproved sources, no rights-blocked text.

---

### 2. Minimal Package Structure

```
research-bundle-{id}/
├── manifest.json          # Bundle metadata
├── README.md              # Human-readable summary
├── notes/                 # Research notes (Markdown)
│   ├── note-001.md
│   ├── note-002.md
│   └── ...
├── sources/               # Provenance records (JSON)
│   ├── source-001.json
│   ├── source-002.json
│   └── ...
├── citations/             # Rights-cleared text (JSON)
│   ├── citation-001.json
│   ├── citation-002.json
│   └── ...
└── checksums.sha256       # SHA-256 checksums for all files
```

**File count:** ~10–50 files (depending on research scope)
**Total size:** ~100 KB – 5 MB (text-only, no images)

---

### 3. Manifest Schema

```typescript
type BundleManifest = {
  version: "1.0.0" // bundle format version
  bundleId: string // UUID v4
  exportedAt: string // ISO 8601 timestamp
  exportedBy: string // user ID (hashed for privacy)
  title: string // user-supplied bundle title
  description: string | null // user-supplied description
  
  contents: {
    notes: number // count of note files
    sources: number // count of provenance records
    citations: number // count of citation records
  }
  
  checksums: {
    algorithm: "SHA-256"
    manifestHash: string // hash of this manifest (excluding checksums field)
    fileHashes: Record<string, string> // filename → hash
  }
  
  privacy: {
    privateDataExcluded: boolean // must be true
    unapprovedSourcesExcluded: boolean // must be true
    rightsBlockedTextExcluded: boolean // must be true
  }
  
  compatibility: {
    minimumViewerVersion: "1.0.0" // minimum viewer version to open
    maximumViewerVersion: "2.0.0" // maximum viewer version (if known)
  }
}
```

**Example manifest:**
```json
{
  "version": "1.0.0",
  "bundleId": "550e8400-e29b-41d4-a716-446655440000",
  "exportedAt": "2026-10-31T09:43:00.000Z",
  "exportedBy": "user:abc123-hashed",
  "title": "QS 2:82 Salvation Study",
  "description": "Research notes on QS 2:82 interpretation",
  "contents": {
    "notes": 5,
    "sources": 3,
    "citations": 2
  },
  "checksums": {
    "algorithm": "SHA-256",
    "manifestHash": "a1b2c3d4e5f6...",
    "fileHashes": {
      "notes/note-001.md": "f1e2d3c4b5a6...",
      "sources/source-001.json": "b2c3d4e5f6a1...",
      "citations/citation-001.json": "c3d4e5f6a1b2..."
    }
  },
  "privacy": {
    "privateDataExcluded": true,
    "unapprovedSourcesExcluded": true,
    "rightsBlockedTextExcluded": true
  },
  "compatibility": {
    "minimumViewerVersion": "1.0.0",
    "maximumViewerVersion": "2.0.0"
  }
}
```

---

### 4. Fixture: Example Bundle

**Bundle title:** "QS 2:82 Salvation Study"

**Contents:**
- 5 research notes (Markdown)
- 3 provenance records (JSON)
- 2 citations (JSON)

**Note example (notes/note-001.md):**
```markdown
# QS 2:82 Initial Analysis

**Date:** 2026-10-15
**Author:** user:abc123-hashed

## Summary

QS 2:82 states that believers who perform righteous deeds are companions of Paradise. The key term "khalidun" (خالدون) is translated as "eternal" in the Indonesian Kemenag translation.

## Questions

1. Does "khalidun" imply permanence or long duration?
2. How do classical Arabic lexicons define this term?
3. What do other verses say about salvation?

## Next steps

- Consult Lisan al-Arab lexicon
- Compare with QS 3:85, QS 4:57
- Review tafsir literature (if available)
```

**Provenance record example (sources/source-001.json):**
```json
{
  "version": 1,
  "recordType": "corpus_passage",
  "passageId": "QS 2:82",
  "editionCode": "quran_cairo_hafs",
  "workCode": "quran",
  "sourceUri": "https://archive.org/details/cairo-quran-1924",
  "provenanceSha": "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912",
  "verifiedAt": "2026-10-26T00:00:00.000Z",
  "verifiedBy": "system",
  "chainOfCustody": [
    {
      "timestamp": "2026-10-26T00:00:00.000Z",
      "actor": "system",
      "action": "acquired",
      "notes": null
    }
  ],
  "metadata": {}
}
```

**Citation example (citations/citation-001.json):**
```json
{
  "citationKey": "QS 2:82",
  "editionCode": "quran_cairo_hafs",
  "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
  "text": "وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ",
  "language": "ar",
  "script": "Arab",
  "direction": "rtl",
  "translations": [
    {
      "languageCode": "id",
      "translatorName": "Kemenag RI",
      "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "text": "Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga. Mereka kekal di dalamnya."
    }
  ]
}
```

---

### 5. Checksum Verification

**Algorithm:** SHA-256

**Verification process:**
1. Compute SHA-256 hash of each file in the bundle
2. Compare to hashes in `checksums.sha256`
3. Compute SHA-256 hash of `manifest.json` (excluding `checksums` field)
4. Compare to `manifestHash` in manifest
5. If all hashes match → bundle is intact
6. If any hash mismatches → bundle is corrupted; reject

**Checksum file format (checksums.sha256):**
```
a1b2c3d4e5f6...  manifest.json
f1e2d3c4b5a6...  notes/note-001.md
b2c3d4e5f6a1...  sources/source-001.json
c3d4e5f6a1b2...  citations/citation-001.json
```

---

### 6. Privacy Testing

**Test 1: Private data exclusion**

**Scenario:** User has private notes (marked `private: true` in metadata).

**Expected:** Private notes are NOT included in the bundle.

**Test method:**
1. Create a research workspace with 3 notes (2 public, 1 private)
2. Export bundle
3. Inspect `notes/` directory
4. Assert: only 2 notes present (private note excluded)

**Test 2: Unapproved source exclusion**

**Scenario:** User has cited a source with `rightsStatus: 'RIGHTS_UNKNOWN'`.

**Expected:** Unapproved source is NOT included in the bundle.

**Test method:**
1. Create a research workspace with 2 sources (1 cleared, 1 unknown)
2. Export bundle
3. Inspect `sources/` directory
4. Assert: only 1 source present (unknown source excluded)

**Test 3: Rights-blocked text exclusion**

**Scenario:** User has cited a passage with `rightsStatus: 'METADATA_ONLY'`.

**Expected:** Rights-blocked text is NOT included in the bundle. Only metadata (citation key, edition code) is included.

**Test method:**
1. Create a research workspace with 2 citations (1 cleared, 1 metadata-only)
2. Export bundle
3. Inspect `citations/` directory
4. Assert: cleared citation has full text; metadata-only citation has no text field

---

### 7. Portability Review

**How portable is the bundle?**

| Aspect | Rating | Rationale |
|--------|--------|-----------|
| **Offline access** | ✓ Excellent | All files are local; no network required |
| **Cross-platform** | ✓ Excellent | JSON/Markdown; works on any OS |
| **Long-term preservation** | ✓ Good | Text-based formats; checksums verify integrity |
| **Human-readable** | ✓ Good | Markdown notes; JSON metadata |
| **Machine-readable** | ✓ Excellent | Structured JSON; schema-documented |
| **Version compatibility** | ⚠ Fair | Manifest specifies min/max viewer versions |
| **Size** | ✓ Excellent | ~100 KB – 5 MB (text-only) |

**Portability risks:**
- **Viewer dependency:** Bundle requires a viewer app to render properly. Mitigation: README.md provides human-readable summary; notes are plain Markdown.
- **Schema evolution:** Future bundle versions may change schema. Mitigation: Manifest specifies version; viewer supports backward compatibility.

---

### 8. Implementation Plan (Deferred)

**Phase 1: Schema definition (this task)**
- Define bundle structure (Section 2)
- Define manifest schema (Section 3)
- Create fixture example (Section 4)

**Phase 2: Export function (if approved)**
- Implement `exportBundle(workspaceId, options): Bundle` function
- Filter private data, unapproved sources, rights-blocked text
- Generate checksums
- Write bundle to disk (ZIP or directory)

**Phase 3: Import function (if approved)**
- Implement `importBundle(path): Workspace` function
- Verify checksums
- Validate manifest
- Reconstruct workspace from bundle

**Phase 4: Viewer app (if approved)**
- Build a simple viewer app (web or desktop)
- Render notes, sources, citations
- Verify checksums
- Report bundle version and compatibility

---

### 9. Verification

**How to verify this design meets acceptance criteria:**

1. **Bundle opens offline:** All files are local; no network required (Section 7).
2. **Reports version and sources:** Manifest includes `version`, `contents.sources`, and provenance records (Section 3).
3. **Excludes unapproved/private material:** Privacy tests verify exclusion (Section 6).

---

### 10. Risks & Rollback

**Risks:**
- **Bundle size:** Large research projects may produce large bundles. Mitigation: Limit bundle to 50 files; paginate if larger.
- **Checksum corruption:** File transfer may corrupt checksums. Mitigation: Verify checksums on import; reject corrupted bundles.
- **Schema drift:** Future versions may change schema. Mitigation: Manifest specifies version; viewer supports backward compatibility.

**Rollback:**
- Disable export function
- No data migration needed (bundles are additive)

---

### 11. Metrics (If Implemented)

- **Export rate:** % of researchers who export at least one bundle (target: >30%)
- **Bundle size:** avg. files per bundle (target: 10–50 files)
- **Checksum verification:** % of bundles that pass checksum verification (target: 100%)
- **Privacy compliance:** % of bundles with no private/unapproved data (target: 100%)
- **Portability:** % of bundles that open in viewer app (target: >95%)

---

## Conclusion

**M47-26 is a design document that:**
- Defines minimal bundle structure (manifest, notes, sources, citations, checksums)
- Specifies manifest schema with privacy guarantees
- Creates fixture example (QS 2:82 salvation study)
- Tests privacy (private data, unapproved sources, rights-blocked text exclusion)
- Reviews portability (offline access, cross-platform, long-term preservation)

**Deliverable:** This design document (no code implemented).

**Next step:** If research export is prioritized, implement export/import functions in Phase 2.
