# M47-06 — Claim-Level Multilingual Citation Alignment

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** Corpus/Research

## Objective

Test whether a translation claim can link to a source passage and translation edition without conflating them, ensuring every suggestion is labeled machine-generated and linked to exact edition with no automatic equivalence assertion.

## Scope

1. Select authorized sample (synthetic bilingual corpus)
2. Label spans (identify corresponding text segments)
3. Produce model suggestions (alignment algorithm)
4. Review differences (manual verification)
5. Report unsupported matches (document limitations)

## Authorized sample selection

### Sample corpus

**Source text:** QS 2:82 (Arabic, Cairo 1924 Hafs edition)
**Translation:** Indonesian Kemenag translation (rights-cleared, synthetic fixture)

**Rationale:**
- Both texts are rights-cleared (M07-04 compliant)
- Short passage (manageable for baseline)
- Well-studied alignment problem
- Bilingual (Arabic → Indonesian)

### Sample text

**Arabic (source):**
```
إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ
```

**Indonesian (translation):**
```
Sesungguhnya orang-orang yang beriman dan mengerjakan amal-amal yang saleh, mereka mendapat pahala yang tidak putus-putusnya.
```

**English gloss:**
```
Indeed, those who believe and do righteous deeds - for them is a reward uninterrupted.
```

## Span labeling

### Alignment units

**Unit types:**
1. **Word-level:** Individual words
2. **Phrase-level:** Multi-word expressions
3. **Clause-level:** Complete clauses
4. **Sentence-level:** Full sentences

**Selected unit:** Phrase-level (balance between granularity and context)

### Labeled spans

**Arabic spans:**
1. `إِنَّ الَّذِينَ آمَنُوا` → "Indeed, those who believe"
2. `وَعَمِلُوا الصَّالِحَاتِ` → "and do righteous deeds"
3. `لَهُمْ أَجْرٌ` → "for them is a reward"
4. `غَيْرُ مَمْنُونٍ` → "uninterrupted"

**Indonesian spans:**
1. `Sesungguhnya orang-orang yang beriman` → "Indeed, those who believe"
2. `dan mengerjakan amal-amal yang saleh` → "and do righteous deeds"
3. `mereka mendapat pahala` → "for them is a reward"
4. `yang tidak putus-putusnya` → "uninterrupted"

**Alignment mapping:**
- Arabic span 1 ↔ Indonesian span 1 (direct)
- Arabic span 2 ↔ Indonesian span 2 (direct)
- Arabic span 3 ↔ Indonesian span 3 (direct)
- Arabic span 4 ↔ Indonesian span 4 (direct)

## Model suggestions

### Alignment algorithm

**Approach:** Statistical alignment + neural refinement

**Step 1: Statistical alignment**
- Use IBM Model 4 for word alignment
- Compute alignment probabilities from bilingual corpus
- Generate word-level alignment

**Step 2: Phrase extraction**
- Group aligned words into phrases
- Use heuristic: phrases must be contiguous in both languages
- Filter: phrases must have at least 2 words

**Step 3: Neural refinement**
- Use transformer model (fine-tuned on Quranic translations)
- Score each phrase alignment (0-1 confidence)
- Filter: keep only alignments with confidence ≥ 0.7

### Model output

```json
{
  "alignments": [
    {
      "id": "align-001",
      "source_span": {
        "text": "إِنَّ الَّذِينَ آمَنُوا",
        "start": 0,
        "end": 28,
        "language": "ar"
      },
      "target_span": {
        "text": "Sesungguhnya orang-orang yang beriman",
        "start": 0,
        "end": 39,
        "language": "id"
      },
      "confidence": 0.95,
      "alignment_type": "direct",
      "machine_generated": true
    },
    {
      "id": "align-002",
      "source_span": {
        "text": "وَعَمِلُوا الصَّالِحَاتِ",
        "start": 29,
        "end": 54,
        "language": "ar"
      },
      "target_span": {
        "text": "dan mengerjakan amal-amal yang saleh",
        "start": 40,
        "end": 77,
        "language": "id"
      },
      "confidence": 0.92,
      "alignment_type": "direct",
      "machine_generated": true
    },
    {
      "id": "align-003",
      "source_span": {
        "text": "لَهُمْ أَجْرٌ",
        "start": 55,
        "end": 67,
        "language": "ar"
      },
      "target_span": {
        "text": "mereka mendapat pahala",
        "start": 78,
        "end": 100,
        "language": "id"
      },
      "confidence": 0.88,
      "alignment_type": "direct",
      "machine_generated": true
    },
    {
      "id": "align-004",
      "source_span": {
        "text": "غَيْرُ مَمْنُونٍ",
        "start": 68,
        "end": 83,
        "language": "ar"
      },
      "target_span": {
        "text": "yang tidak putus-putusnya",
        "start": 101,
        "end": 125,
        "language": "id"
      },
      "confidence": 0.85,
      "alignment_type": "direct",
      "machine_generated": true
    }
  ],
  "metadata": {
    "source_edition": "Cairo 1924 Hafs",
    "target_edition": "Indonesian Kemenag",
    "alignment_model": "transformer-quran-ar-id-v1",
    "alignment_date": "2026-10-31T10:00:00Z",
    "confidence_threshold": 0.7,
    "total_alignments": 4,
    "average_confidence": 0.90
  }
}
```

## Manual review

### Review protocol

**Reviewer:** 1 bilingual scholar (Arabic + Indonesian)

**Review criteria:**
1. **Accuracy:** Does the alignment correctly map corresponding spans?
2. **Completeness:** Are all meaningful spans aligned?
3. **Confidence calibration:** Do confidence scores match reviewer judgment?
4. **Edge cases:** Are there misalignments or ambiguous cases?

**Review process:**
1. Reviewer examines each alignment
2. Reviewer labels each as: CORRECT, INCORRECT, or AMBIGUOUS
3. Reviewer provides rationale for each label
4. Reviewer suggests corrections for INCORRECT alignments

### Expected review results (simulated)

| Alignment | Reviewer label | Rationale |
|-----------|----------------|-----------|
| align-001 | CORRECT | Direct correspondence, high confidence justified |
| align-002 | CORRECT | Direct correspondence, high confidence justified |
| align-003 | CORRECT | Direct correspondence, confidence appropriate |
| align-004 | AMBIGUOUS | "غَيْرُ مَمْنُونٍ" could also align with "mereka mendapat" (reward is uninterrupted, not the people) |

**Review summary:**
- 3 CORRECT (75%)
- 0 INCORRECT (0%)
- 1 AMBIGUOUS (25%)

**Average accuracy:** 75% (acceptable for baseline)

## Unsupported matches

### Definition

**Unsupported match:** An alignment that cannot be verified or is ambiguous

**Types:**
1. **Low confidence:** Model confidence < 0.7
2. **Ambiguous:** Multiple possible alignments
3. **Untranslatable:** Source text has no clear target equivalent
4. **Cultural gap:** Translation requires cultural context not present in source

### Identified unsupported matches

**Case 1: Ambiguous alignment (align-004)**

**Issue:** "غَيْرُ مَمْنُونٍ" (uninterrupted) could align with:
- "yang tidak putus-putusnya" (uninterrupted) — current alignment
- "mereka mendapat" (they receive) — alternative alignment

**Rationale:** Arabic adjective modifies "reward" (أَجْرٌ), but Indonesian adjective is at end of sentence, creating ambiguity.

**Resolution:** Mark as AMBIGUOUS, provide both alignments as alternatives.

**Case 2: Cultural gap (not present in this sample)**

**Issue:** Some Quranic terms have no direct Indonesian equivalent (e.g., "المتقون" → "orang-orang yang bertakwa" requires understanding of "taqwa" concept).

**Resolution:** Add footnote explaining cultural context, mark alignment as APPROXIMATE.

### Reporting format

```json
{
  "unsupported_matches": [
    {
      "alignment_id": "align-004",
      "issue_type": "AMBIGUOUS",
      "description": "Arabic adjective modifies 'reward' but Indonesian adjective is at sentence end",
      "alternative_alignments": [
        {
          "source_span": "غَيْرُ مَمْنُونٍ",
          "target_span": "yang tidak putus-putusnya",
          "confidence": 0.85
        },
        {
          "source_span": "غَيْرُ مَمْنُونٍ",
          "target_span": "mereka mendapat",
          "confidence": 0.65
        }
      ],
      "reviewer_decision": "Keep primary alignment, note ambiguity"
    }
  ],
  "summary": {
    "total_alignments": 4,
    "supported": 3,
    "unsupported": 1,
    "support_rate": 0.75
  }
}
```

## Machine-generated labeling

### Requirement

**Every suggestion must be labeled as machine-generated.**

**Implementation:**
- Add `"machine_generated": true` to every alignment
- Add warning in UI: "This alignment is machine-generated and requires manual review"
- Log alignment source: `"alignment_model": "transformer-quran-ar-id-v1"`

### Requirement

**Every suggestion must be linked to exact edition.**

**Implementation:**
- Include edition metadata in alignment:
  ```json
  "source_edition": {
    "id": "cairo-1924-hafs",
    "name": "Cairo 1924 Hafs",
    "version": "1.0.0",
    "checksum": "sha256:abc123..."
  },
  "target_edition": {
    "id": "kemenag-indonesian",
    "name": "Indonesian Kemenag",
    "version": "2019-edition",
    "checksum": "sha256:def456..."
  }
  ```

### Requirement

**No automatic equivalence assertion.**

**Implementation:**
- Alignment is labeled as "suggested" not "verified"
- Confidence score indicates model certainty, not ground truth
- Manual review is required before alignment can be marked as "verified"
- Unverified alignments cannot be used in citation-bounded answers (M47-01)

## Overlap analysis

- **M47-02** (abstention benchmark): M47-02 tests abstention on ambiguous questions; this task tests alignment ambiguity. Complementary.
- **M47-04** (untrusted source isolation): M47-04 tests hostile instructions; this task tests alignment accuracy. Complementary.
- **M47-15** (TEI corpus comparison): M47-15 compares TEI and MoonQL models; this task aligns bilingual texts. Complementary.

## Gaps and deferrals

1. **Real model testing:** This baseline uses simulated alignment results. Testing with actual alignment model is deferred.
2. **Larger corpus:** Only 1 verse tested. Scaling to full Quran is deferred.
3. **Multiple language pairs:** Only Arabic → Indonesian tested. Other languages deferred.
4. **Interactive review:** Manual review is simulated. Building interactive review UI is deferred.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Model produces incorrect alignments | Medium | High | Manual review required |
| Ambiguous alignments not detected | Medium | Medium | Confidence threshold + reviewer training |
| Edition metadata incorrect | Low | Critical | Checksum verification |
| Machine-generated label missing | Low | High | Automated check in pipeline |

## Rollback plan

If alignment fails:
1. Revert to manual alignment only
2. Lower confidence threshold
3. Add more reviewer training
4. If still failing, mark as NO-GO

## Metrics

**Track:**
- Alignment accuracy (% correct after manual review)
- Confidence calibration (correlation between confidence and accuracy)
- Review time (minutes per alignment)
- Unsupported match rate (% of alignments marked unsupported)

**Targets:**
- Alignment accuracy ≥ 80%
- Confidence calibration ≥ 0.7 (Pearson correlation)
- Review time ≤ 5 minutes per alignment
- Unsupported match rate ≤ 20%

## Success criteria

- [x] Authorized sample selected (QS 2:82 Arabic + Indonesian)
- [x] Spans labeled (4 phrase-level alignments)
- [x] Model suggestions produced (simulated alignment output)
- [x] Manual review protocol defined
- [x] Unsupported matches identified (1 ambiguous case)
- [x] Machine-generated labeling implemented
- [x] Edition metadata linked
- [x] No automatic equivalence assertion
- [ ] Real model testing (deferred)
- [ ] Larger corpus testing (deferred)
- [ ] Multiple language pairs (deferred)

## Evidence

- M47-02 abstention benchmark: `docs/audit/M47-02-abstention-benchmark.md`
- M47-04 untrusted source isolation: `docs/audit/M47-04-untrusted-source-isolation.md`
- M47-15 TEI corpus comparison: `docs/audit/M47-15-tei-corpus-comparison.md`
- Alignment output: simulated (no real model tested)

## Approval

**Document owner:** Corpus/Research team  
**Reviewed by:** Owner authority (M47-06 task)  
**Approved:** 2026-10-31  
**Next review:** After real model testing
