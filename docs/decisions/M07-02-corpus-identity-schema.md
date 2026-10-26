# M07-02 — 4-Tier Citation Identity & Version Schema

- **Milestone**: M07 Corpus source rights and ingestion pilot
- **Task**: M07-02
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Citation Hierarchy Formalization

Implemented in `@moonwitness/moonql-corpus`:

1. **`corpus_works` (Work)**:
   - Primary intellectual creation (e.g. `quran`).
   - Fields: `code`, `title`, `tradition`, `originalLanguage`, `description`.

2. **`corpus_editions` (Edition)**:
   - Specific physical or recitational manuscript edition (e.g. `quran_cairo_hafs`).
   - Fields: `code`, `workRef`, `name`, `editorOrPublisher`, `rightsStatus`, `licenseName`, `sourceUri`, `provenanceSha`.

3. **`corpus_passages` (Passage)**:
   - Atomic addressable unit of scripture (e.g. `QS 2:82`).
   - Fields: `citationKey`, `editionRef`, `surahNumber`, `ayahNumber`, `arabicText`, `rgblForeignRef`, `verifiedAt`.

4. **`corpus_translations` (Translation)**:
   - Licensed vernacular renderings attached to a passage.
   - Fields: `code`, `passageRef`, `languageCode`, `translatorName`, `translationText`, `rightsStatus`, `licenseName`.

---

## 2. Invariant Rule
Every passage citation resolves to a validated parent Edition with an exact provenance SHA. No floating passage strings exist without an edition context.
