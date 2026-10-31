# M50-13 — Translation-Variant Review Exercise

**Task:** M50-13 · **Candidate:** ONT-013 · **Priority:** P2 · **Difficulty:** D4  
**Owner:** textual research · **Effort:** L (5–10 days plus rights/expert access)  
**Dependencies:** M50-03 ✓ (closed 2026-10-31), M50-11 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Test a human review workflow for comparing two authorized translation records without producing a "correct" interpretation. Describe differences without ranking unless evidence and reviewer justify it.

## 2. Scope

- Secure sample (synthetic paraphrases or cleared short sample)
- Record edition data (translator/edition/date for each translation)
- Compare variants (side-by-side analysis)
- Annotate uncertainty (without declaring one "correct")
- Review with qualified specialist (deferred)

**Out of scope:** Translation generation, alignment automation, M18 rights storage, public feature.

## 3. Sample Selection

### 3.1 Sample Criteria

**Requirement 1: Synthetic or cleared.**
- Use synthetic paraphrases (no copyright issues)
- OR use cleared short sample (rights verified)
- Never use uncleared copyrighted translations

**Requirement 2: Two authorized translations.**
- Both translations must be from recognized authorities
- Both must have complete provenance (from M50-03)
- Both must have review status (from M50-11)

**Requirement 3: Same source passage.**
- Both translations must render the same source text
- Source must be clearly identified (edition, passage, verse)

**Requirement 4: Demonstrable differences.**
- Translations must differ in meaningful ways (word choice, phrasing, interpretation)
- Differences must be analyzable (not just typographical)

### 3.2 Selected Sample: QS 2:82 (Synthetic Paraphrases)

**Source passage:** QS 2:82 (Quran, Surah Al-Baqarah, Ayah 82)  
**Original Arabic:** "وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ"

**Translation A (Synthetic Paraphrase 1):**
"Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga. Mereka kekal di dalamnya."

**Translation B (Synthetic Paraphrase 2):**
"Dan mereka yang beriman serta mengerjakan kebajikan, itulah penghuni surga; mereka akan tinggal di dalamnya selama-lamanya."

**Why synthetic?**
- No copyright issues
- Can be freely modified for testing
- Still demonstrates real translation differences
- Can be replaced with cleared real translations in future

### 3.3 Sample Provenance

**Translation A metadata:**
```json
{
  "translationId": "synthetic-001",
  "passageRef": "QS 2:82",
  "sourceLanguage": "ar",
  "targetLanguage": "id",
  "translationType": "dynamic",
  "translatorIdentity": "Synthetic Translator A",
  "translatorQualifications": "Synthetic — for testing purposes only",
  "translationDate": "2026",
  "datePrecision": "EXACT_YEAR",
  "editionVersion": "v1.0",
  "reviewStatus": "CANDIDATE",
  "attributionConfidence": "KNOWN",
  "attributionSource": "Created for M50-13 testing",
  "rightsStatus": "PUBLIC_DOMAIN",
  "licenseName": "Synthetic — no rights claimed"
}
```

**Translation B metadata:**
```json
{
  "translationId": "synthetic-002",
  "passageRef": "QS 2:82",
  "sourceLanguage": "ar",
  "targetLanguage": "id",
  "translationType": "literal",
  "translatorIdentity": "Synthetic Translator B",
  "translatorQualifications": "Synthetic — for testing purposes only",
  "translationDate": "2026",
  "datePrecision": "EXACT_YEAR",
  "editionVersion": "v1.0",
  "reviewStatus": "CANDIDATE",
  "attributionConfidence": "KNOWN",
  "attributionSource": "Created for M50-13 testing",
  "rightsStatus": "PUBLIC_DOMAIN",
  "licenseName": "Synthetic — no rights claimed"
}
```

## 4. Edition Data Recording

### 4.1 Translation A Edition Data

| Field | Value | Source |
|-------|-------|--------|
| Translator | Synthetic Translator A | Metadata |
| Translation type | Dynamic equivalence | Metadata |
| Target language | Indonesian (id) | Metadata |
| Edition version | v1.0 | Metadata |
| Translation date | 2026 | Metadata |
| Review status | CANDIDATE | Metadata |
| Rights status | PUBLIC_DOMAIN | Metadata |
| Attribution confidence | KNOWN | Metadata |

### 4.2 Translation B Edition Data

| Field | Value | Source |
|-------|-------|--------|
| Translator | Synthetic Translator B | Metadata |
| Translation type | Literal (formal equivalence) | Metadata |
| Target language | Indonesian (id) | Metadata |
| Edition version | v1.0 | Metadata |
| Translation date | 2026 | Metadata |
| Review status | CANDIDATE | Metadata |
| Rights status | PUBLIC_DOMAIN | Metadata |
| Attribution confidence | KNOWN | Metadata |

### 4.3 Edition Comparison

**Key differences:**
- Translation type: A is dynamic, B is literal
- Translator: Different synthetic translators (A vs B)
- All other metadata is identical (same date, language, rights)

## 5. Variant Comparison

### 5.1 Side-by-Side Analysis

| Segment | Original Arabic | Translation A (Dynamic) | Translation B (Literal) |
|---------|----------------|------------------------|------------------------|
| 1 | وَٱلَّذِينَ ءَامَنُوا۟ | "Adapun orang-orang yang beriman" | "Dan mereka yang beriman" |
| 2 | وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ | "dan beramal saleh" | "serta mengerjakan kebajikan" |
| 3 | أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ | "mereka itulah penghuni surga" | "itulah penghuni surga" |
| 4 | هُمْ فِيهَا خَـٰلِدُونَ | "Mereka kekal di dalamnya" | "mereka akan tinggal di dalamnya selama-lamanya" |

### 5.2 Difference Analysis

**Segment 1: "Adapun orang-orang yang beriman" vs "Dan mereka yang beriman"**
- Translation A: Uses "Adapun" (as for / now) — adds discourse marker
- Translation B: Uses "Dan" (and) — simpler conjunction
- Difference: A adds emphasis, B is more direct
- Interpretation: Neither is "correct"; both are valid discourse strategies

**Segment 2: "beramal saleh" vs "mengerjakan kebajikan"**
- Translation A: "beramal saleh" (do righteous deeds) — uses Arabic loan phrase
- Translation B: "mengerjakan kebajikan" (perform good deeds) — uses native Indonesian
- Difference: A preserves Arabic terminology, B uses Indonesian equivalent
- Interpretation: A is more tradition-internal, B is more accessible to Indonesian readers

**Segment 3: "mereka itulah penghuni surga" vs "itulah penghuni surga"**
- Translation A: Includes "mereka" (they) — explicit subject
- Translation B: Omits "mereka" — implicit subject (Indonesian allows subject drop)
- Difference: A is more explicit, B is more concise
- Interpretation: Both are grammatically correct; A is clearer for non-native speakers

**Segment 4: "Mereka kekal di dalamnya" vs "mereka akan tinggal di dalamnya selama-lamanya"**
- Translation A: "kekal" (eternal) — single word for eternity
- Translation B: "akan tinggal... selama-lamanya" (will stay... forever) — verbal phrase
- Difference: A uses adjective, B uses verb + adverb
- Interpretation: A is more concise, B is more descriptive

### 5.3 Summary of Differences

| Aspect | Translation A | Translation B | Evaluation |
|--------|--------------|--------------|------------|
| Discourse strategy | Explicit ("Adapun") | Direct ("Dan") | Both valid |
| Terminology | Arabic loan ("saleh") | Native Indonesian ("kebajikan") | A: tradition-internal; B: accessible |
| Subject explicitness | Explicit ("mereka") | Implicit (subject drop) | Both grammatical |
| Eternity expression | Adjective ("kekal") | Verb phrase ("tinggal selama-lamanya") | A: concise; B: descriptive |
| Overall style | Dynamic equivalence | Literal equivalence | Both valid approaches |

**Key insight:** Differences reflect translation philosophy (dynamic vs literal), not correctness. Neither translation is "better" — they serve different purposes.

## 6. Uncertainty Annotation

### 6.1 Uncertainty Types

**Type 1: Lexical uncertainty**
- Segment 2: "ٱلصَّـٰلِحَـٰتِ" can mean "righteous deeds" or "good deeds" or "virtuous acts"
- Both translations choose different equivalents
- Uncertainty: Which English/Indonesian term best captures the Arabic?
- Annotation: "Lexical range: saleh/kebajikan — both valid, context-dependent"

**Type 2: Discourse uncertainty**
- Segment 1: Arabic "وَ" (wa) can mean "and" or "but" or "now" or "as for"
- Translation A chooses "Adapun" (as for), Translation B chooses "Dan" (and)
- Uncertainty: What is the discourse function of "wa" here?
- Annotation: "Discourse marker: Adapun/Dan — both valid, depends on context"

**Type 3: Grammatical uncertainty**
- Segment 3: Arabic allows subject drop; Indonesian also allows it
- Translation A makes subject explicit ("mereka"), Translation B leaves it implicit
- Uncertainty: Should translator make implicit subject explicit?
- Annotation: "Subject explicitness: explicit/implicit — both grammatical, stylistic choice"

**Type 4: Semantic uncertainty**
- Segment 4: Arabic "خَـٰلِدُونَ" (khalidun) means "eternal" or "abiding forever"
- Translation A uses adjective "kekal" (eternal), Translation B uses verb phrase "tinggal selama-lamanya" (stay forever)
- Uncertainty: Is eternity best expressed as state (adjective) or process (verb)?
- Annotation: "Eternity expression: state/process — both valid, different aspect"

### 6.2 Uncertainty Documentation

**For each uncertainty, document:**
1. Source of uncertainty (lexical, discourse, grammatical, semantic)
2. Range of valid interpretations
3. Translation choices made
4. Rationale for choices (if known)
5. Whether choice affects meaning significantly

**Example documentation:**
```
Uncertainty: Lexical (Segment 2)
Source: Arabic "ٱلصَّـلِحَـٰتِ" has semantic range including righteous/good/virtuous deeds
Range: "saleh" (righteous, Arabic loan), "kebajikan" (good, native Indonesian), "keutamaan" (virtue, native Indonesian)
Translation A choice: "saleh" — preserves Arabic terminology, tradition-internal
Translation B choice: "kebajikan" — uses native Indonesian, more accessible
Rationale: Not documented (synthetic translations)
Significance: Low — all three terms are valid equivalents in context
```

### 6.3 Uncertainty Principles

**Principle 1: Uncertainty is normal, not a defect.**
- All translations involve choices
- Choices reflect translator's philosophy, audience, purpose
- Uncertainty does not mean one translation is "wrong"

**Principle 2: Document uncertainty, don't hide it.**
- Explicitly annotate where choices were made
- Provide range of valid interpretations
- Let reader decide which interpretation fits their needs

**Principle 3: Don't rank translations by uncertainty.**
- More uncertainty ≠ worse translation
- Less uncertainty ≠ better translation
- Uncertainty is a feature of the source text, not the translation

## 7. Review Workflow

### 7.1 Review Steps

**Step 1: Metadata verification**
- Check that both translations have complete provenance (from M50-03)
- Verify translator identity, edition, date, rights status
- Ensure both translations are authorized (not unauthorized)

**Step 2: Side-by-side comparison**
- Align translations segment by segment
- Identify differences (lexical, discourse, grammatical, semantic)
- Document differences without evaluating

**Step 3: Uncertainty annotation**
- For each difference, identify source of uncertainty
- Document range of valid interpretations
- Note translation choices and rationale (if known)

**Step 4: Reviewer walkthrough**
- Qualified specialist reviews annotations
- Specialist confirms uncertainty documentation is accurate
- Specialist adds notes on tradition-specific considerations

**Step 5: Final report**
- Compile comparison table
- Summarize uncertainties
- Document specialist review
- State explicitly: "Differences reflect translation philosophy, not correctness"

### 7.2 Reviewer Qualifications

**Required qualifications:**
- Expertise in source language (Arabic for QS 2:82)
- Expertise in target language (Indonesian)
- Knowledge of translation theory (dynamic vs literal equivalence)
- Familiarity with tradition-specific terminology
- No conflict of interest (not translator of either version)

**Recommended qualifications:**
- Experience with religious text translation
- Knowledge of Islamic studies (for Quranic texts)
- Published work on translation comparison

### 7.3 Review Checklist

- [ ] Both translations have complete provenance (M50-03 fields)
- [ ] Both translations are authorized (rights status verified)
- [ ] Side-by-side comparison completed for all segments
- [ ] All differences documented (lexical, discourse, grammatical, semantic)
- [ ] All uncertainties annotated (source, range, choices, rationale, significance)
- [ ] Qualified specialist reviewed annotations
- [ ] Specialist added tradition-specific notes
- [ ] Final report compiled
- [ ] Report states: "Differences reflect translation philosophy, not correctness"
- [ ] No ranking of translations as "better" or "more correct"

## 8. Anti-Ranking Principles

### 8.1 Why No Ranking?

**Reason 1: Translation is interpretation.**
- Every translation involves interpretive choices
- Choices reflect translator's context, audience, purpose
- No translation is "neutral" or "objective"

**Reason 2: Different purposes, different translations.**
- Dynamic equivalence: prioritizes readability and naturalness
- Literal equivalence: prioritizes formal correspondence to source
- Neither is inherently "better" — they serve different needs

**Reason 3: Ranking implies authority.**
- If we rank Translation A > Translation B, we imply A is "more correct"
- This contradicts the principle that differences are philosophical, not factual
- Ranking would mislead readers into thinking one translation is authoritative

### 8.2 When Ranking Is Permitted

**Exception: Evidence-based ranking.**
- If evidence shows one translation misrepresents the source, it can be ranked lower
- Example: Translation A renders "khalidun" as "temporary" — this is factually wrong
- In such cases, ranking is justified by evidence, not preference

**Exception: Reviewer-justified ranking.**
- If qualified reviewer provides explicit justification, ranking is permitted
- Example: Reviewer states "For academic study, literal Translation B is preferred; for devotional use, dynamic Translation A is preferred"
- Justification must be documented and attributed

**Default: No ranking.**
- Unless exception applies, do not rank translations
- Present differences neutrally
- Let reader choose based on their needs

### 8.3 Anti-Ranking Checklist

- [ ] No language implying one translation is "better" or "more accurate"
- [ ] No numerical scores or ratings
- [ ] No ranking in summary or conclusion
- [ ] Differences described neutrally (e.g., "A uses X, B uses Y" not "A correctly uses X, B incorrectly uses Y")
- [ ] If ranking is used, explicit evidence or reviewer justification is provided
- [ ] Reader is empowered to choose based on their needs

## 9. Fictional Review Exercise

### 9.1 Exercise Setup

**Task:** Review the two synthetic translations of QS 2:82 (Translations A and B from §3)

**Materials:**
- Source text: Arabic QS 2:82
- Translation A: Dynamic equivalence (Indonesian)
- Translation B: Literal equivalence (Indonesian)
- Comparison table (§5.1)
- Difference analysis (§5.2)
- Uncertainty annotations (§6)

**Reviewer:** Dr. Fatima Specialist (fictional)
- PhD in Islamic Studies, University of X
- 20 years experience with Quranic translation
- Fluent in Arabic and Indonesian
- No conflict of interest (not translator of either version)

### 9.2 Reviewer Walkthrough

**Step 1: Metadata verification**
- ✅ Translation A: Complete provenance (translator, type, language, edition, date, rights, attribution)
- ✅ Translation B: Complete provenance (translator, type, language, edition, date, rights, attribution)
- ✅ Both authorized (PUBLIC_DOMAIN rights status)

**Step 2: Side-by-side comparison**
- ✅ All 4 segments aligned
- ✅ Differences identified: discourse strategy, terminology, subject explicitness, eternity expression
- ✅ Differences documented neutrally

**Step 3: Uncertainty annotation**
- ✅ 4 uncertainty types annotated: lexical, discourse, grammatical, semantic
- ✅ Range of valid interpretations documented for each
- ✅ Translation choices noted
- ✅ Rationale not documented (synthetic translations) — acceptable for testing

**Step 4: Specialist review**
- Dr. Fatima reviews annotations
- Confirms uncertainty documentation is accurate
- Adds tradition-specific notes:
  - "Segment 2: 'saleh' is commonly used in Indonesian Islamic context; 'kebajikan' is more general. Both are acceptable, but 'saleh' may resonate more with Muslim readers."
  - "Segment 4: 'kekal' is the standard theological term for eternity in Indonesian Islamic discourse; 'tinggal selama-lamanya' is more colloquial. Both are valid."

**Step 5: Final report**
- Comparison table compiled
- Uncertainties summarized
- Specialist notes included
- Explicit statement: "Differences reflect translation philosophy (dynamic vs literal), not correctness. Both translations are valid renderings of QS 2:82."

### 9.3 Review Outcome

**Result:** ✅ Review completed successfully

**Key findings:**
1. Both translations have complete provenance
2. Differences are philosophical (dynamic vs literal), not factual
3. Uncertainties are normal and well-documented
4. No ranking is warranted — both translations are valid
5. Reader can choose based on their needs (academic study vs devotional use)

**Recommendation:** Publish both translations side-by-side with uncertainty annotations. Do not rank. Let reader choose.

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Context loss in comparison | Medium | Provide full source text alongside translations; document context |
| Copyright violation | High | Use synthetic paraphrases or cleared samples only; verify rights status |
| Theological overreach | High | Do not rank translations; present differences neutrally; let reader decide |
| Reviewer bias | Medium | Use qualified reviewer with no conflict of interest; document reviewer qualifications |
| Uncertainty hidden | Medium | Explicitly annotate all uncertainties; document range of valid interpretations |
| Reader misled into thinking one translation is "correct" | High | Add explicit statement: "Differences reflect translation philosophy, not correctness" |

## 11. Metrics

- **Provenance completeness:** % of translations with all M50-03 fields populated (target: 100%)
- **Interpretation disagreement:** Count of uncertainties annotated (target: document all)
- **Anti-ranking compliance:** % of reviews that avoid ranking translations (target: 100%)
- **Reviewer qualification:** % of reviewers with required qualifications (target: 100%)
- **Uncertainty documentation:** % of differences with uncertainty annotations (target: 100%)

## 12. Verification Plan

### 12.1 Metadata Completeness Test

**Test:** Verify both translations have complete provenance

**Success criteria:**
- All M50-03 fields populated for both translations
- Rights status verified (PUBLIC_DOMAIN or RIGHTS_EXACT_VERSION_CLEARED)
- Attribution confidence documented

**Test procedure:**
1. Load Translation A metadata
2. Check all M50-03 fields
3. Load Translation B metadata
4. Check all M50-03 fields
5. Verify rights status for both

### 12.2 Reviewer Walkthrough Test

**Test:** Qualified reviewer completes review workflow

**Success criteria:**
- Reviewer verifies metadata
- Reviewer completes side-by-side comparison
- Reviewer annotates uncertainties
- Reviewer adds tradition-specific notes
- Reviewer compiles final report
- Report states: "Differences reflect translation philosophy, not correctness"

**Test procedure:**
1. Recruit qualified reviewer (Dr. Fatima Specialist or equivalent)
2. Provide review materials (source, translations, comparison table, uncertainty annotations)
3. Reviewer completes 5-step workflow (§7.1)
4. Reviewer submits final report
5. Verify report meets success criteria

### 12.3 Anti-Ranking Compliance Test

**Test:** Verify review does not rank translations

**Success criteria:**
- No language implying one translation is "better"
- No numerical scores or ratings
- No ranking in summary or conclusion
- Explicit statement: "Differences reflect translation philosophy, not correctness"

**Test procedure:**
1. Review final report
2. Search for ranking language ("better," "more accurate," "superior")
3. Search for numerical scores (1-10, A-F, etc.)
4. Verify explicit anti-ranking statement is present
5. If ranking found, verify it is evidence-based or reviewer-justified (§8.2)

### 12.4 Rights/Language/Cultural Review

**Deferred:** Requires qualified reviewers to:
- Verify rights status of all translations
- Review language accuracy (Arabic, Indonesian)
- Assess cultural sensitivity
- Approve publication

## 13. Rollback Plan

- Remove sample if rights issue discovered
- Retain only synthetic method example if real sample cannot be cleared
- Keep review workflow as template for future exercises
- Document lessons learned

## 14. Closure Evidence

**Completed:**
- ✅ Sample selection criteria defined (4 requirements: synthetic/cleared, two authorized translations, same source passage, demonstrable differences)
- ✅ Sample selected: QS 2:82 with two synthetic Indonesian paraphrases (Translation A: dynamic, Translation B: literal)
- ✅ Sample provenance documented (complete M50-03 metadata for both translations)
- ✅ Edition data recorded for both translations (8 fields each: translator, type, language, edition, date, review status, rights status, attribution confidence)
- ✅ Edition comparison completed (key difference: translation type — dynamic vs literal)
- ✅ Side-by-side analysis completed (4 segments aligned, differences identified)
- ✅ Difference analysis documented (4 aspects: discourse strategy, terminology, subject explicitness, eternity expression)
- ✅ Summary of differences table created (Translation A vs B for each aspect, evaluation: both valid)
- ✅ Key insight documented: "Differences reflect translation philosophy (dynamic vs literal), not correctness"
- ✅ Uncertainty annotation completed (4 uncertainty types: lexical, discourse, grammatical, semantic)
- ✅ Uncertainty documentation template created (source, range, choices, rationale, significance)
- ✅ Uncertainty principles documented (3 principles: uncertainty is normal, document don't hide, don't rank by uncertainty)
- ✅ Review workflow defined (5 steps: metadata verification, side-by-side comparison, uncertainty annotation, reviewer walkthrough, final report)
- ✅ Reviewer qualifications specified (required: source/target language expertise, translation theory knowledge, tradition familiarity, no conflict; recommended: religious text experience, Islamic studies knowledge, published work)
- ✅ Review checklist created (10 items)
- ✅ Anti-ranking principles documented (3 reasons why no ranking, 2 exceptions when ranking permitted, default: no ranking)
- ✅ Anti-ranking checklist created (6 items)
- ✅ Fictional review exercise completed (setup, reviewer walkthrough with Dr. Fatima Specialist, review outcome)
- ✅ Key findings documented (5 findings: complete provenance, philosophical differences, normal uncertainties, no ranking warranted, reader choice)
- ✅ Recommendation: publish both translations side-by-side with uncertainty annotations, do not rank
- ✅ Risks and mitigations table (6 risks with mitigations)
- ✅ Metrics defined (5 metrics: provenance completeness, interpretation disagreement, anti-ranking compliance, reviewer qualification, uncertainty documentation)
- ✅ Verification plan with 4 tests (metadata completeness, reviewer walkthrough, anti-ranking compliance, rights/language/cultural review)

**Deferred (requires owner action):**
- ⏳ Rights verification for real translations (if replacing synthetic sample)
- ⏳ Qualified reviewer recruitment (Dr. Fatima Specialist is fictional)
- ⏳ Actual reviewer walkthrough with real translations
- ⏳ Rights/language/cultural review by qualified specialists
- ⏳ Publication decision

## 15. Overlap Analysis

### 15.1 M50-03 (Translation/Transcription Provenance)

M50-03 defined translation provenance fields (18 fields). M50-13 uses these fields to record edition data for both translations. No overlap: M50-03 is the metadata schema, M50-13 is the review workflow.

### 15.2 M50-11 (Source-Critical Review Protocol)

M50-11 defined review checklist for source classification (23 fields). M50-13 uses review status field from M50-11. No overlap: M50-11 is for source classification, M50-13 is for translation comparison.

### 15.3 M50-12 (Attribution for Comparative Religious Claims)

M50-12 defined attribution rubric for comparative claims (7 fields). M50-13 does not directly use this rubric, but both address attribution concerns. Potential future overlap: if translation comparison involves comparative religious claims, M50-12 rubric would apply.

## 16. References

- M50-03 audit: `docs/audit/M50-03-translation-transcription-provenance.md`
- M50-11 audit: `docs/audit/M50-11-source-critical-review-protocol.md`
- M50-12 audit: `docs/audit/M50-12-attribution-comparative-religious-claims.md`
- QS 2:82 Arabic text: https://corpus.quran.com/verse.jsp?key=2:82
- Translation theory: https://en.wikipedia.org/wiki/Translation_studies#Dynamic_and_formal_equivalence
- Dynamic vs formal equivalence: https://en.wikipedia.org/wiki/Dynamic_and_formal_equivalence

---

**Baseline established 2026-10-31.** Translation-variant review exercise designed with sample selection criteria, QS 2:82 synthetic paraphrases (2 translations), complete edition data recording, side-by-side comparison (4 segments), difference analysis (4 aspects), uncertainty annotation (4 types), 5-step review workflow, reviewer qualifications, anti-ranking principles (3 reasons, 2 exceptions), fictional review exercise with Dr. Fatima Specialist, risks/mitigations, metrics, and verification plan. Rights verification and qualified reviewer recruitment deferred.
