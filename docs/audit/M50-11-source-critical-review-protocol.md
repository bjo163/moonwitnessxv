# M50-11 — Source-Critical Review Protocol for Contested Material

**Task:** M50-11 · **Candidate:** ONT-011 · **Priority:** P2 · **Difficulty:** D4  
**Owner:** scholarly review lead · **Effort:** L (5–10 days plus expert review)  
**Dependencies:** M50-01 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Define how a future study distinguishes primary artifact, edition, translation, scholarly claim, and tradition-specific interpretation. Create a review checklist that enables a qualified reviewer to classify source observations, inferences, and interpretations without asserting authority over contested material.

## 2. Scope

- Create a review checklist with exact citation, edition/version, method, counterevidence, and uncertainty fields
- Define classification categories (primary artifact / edition / translation / scholarly claim / interpretation)
- Test against fictional case study
- Address bias and conflict of interest
- Document tradition-specific limitations

**Out of scope:** Content moderation, publication authorization, automated authority scoring.

## 3. Classification Framework

### 3.1 Five Content Categories

| Category | Definition | Example | Verification Method |
|----------|------------|---------|---------------------|
| **Primary Artifact** | Original source material (manuscript, inscription, recording) | Cairo 1924 Qur'an manuscript page | Physical examination, radiocarbon dating, paleographic analysis |
| **Edition** | Pinned, reproducible version of a primary artifact | Hafs 'an 'Asim, Cairo 1924 print | Collation with other editions, stemmatic analysis |
| **Translation** | Vernacular rendering in a different language | Indonesian translation by Kemenag RI | Back-translation, translator credentials, manuscript comparison |
| **Scholarly Claim** | Researcher's assertion based on evidence analysis | "This verse reflects pre-Islamic Arabian cosmology" | Methodology transparency, evidence citation, peer review |
| **Tradition-Specific Interpretation** | Community-authorized reading within a living tradition | "This verse commands ethical monotheism" (Islamic tafsir) | Tradition-internal authority, chain of transmission, community acceptance |

### 3.2 Classification Decision Tree

```
START: Is this a direct representation of source material?
├─ YES → Is it in the original language/script?
│        ├─ YES → PRIMARY ARTIFACT
│        └─ NO → Is it a different script of the same language?
│                ├─ YES → TRANSLITERATION (see M50-03)
│                └─ NO → Is it a phonetic/diacritical representation?
│                        ├─ YES → TRANSCRIPTION (see M50-03)
│                        └─ NO → EDITION (pinned version)
└─ NO → Is it in a different language?
        ├─ YES → TRANSLATION
        └─ NO → Is it an analytical assertion?
                ├─ YES → SCHOLARLY CLAIM
                └─ NO → Is it a community-authorized reading?
                        ├─ YES → TRADITION-SPECIFIC INTERPRETATION
                        └─ NO → UNCLASSIFIED (requires reviewer decision)
```

### 3.3 Critical Distinctions

**Edition vs Translation:**
- Edition: Same language, pinned version (e.g., "Cairo 1924 Hafs")
- Translation: Different language (e.g., "Indonesian Kemenag")

**Scholarly Claim vs Interpretation:**
- Scholarly claim: Researcher's analysis, open to falsification, cites evidence
- Interpretation: Community-authorized reading, tradition-internal authority, may cite chain of transmission

**Primary Artifact vs Edition:**
- Artifact: Unique physical object (manuscript, inscription)
- Edition: Reproducible version derived from one or more artifacts

## 4. Review Checklist

### 4.1 Citation and Identity Fields

| # | Field | Required | Purpose | Example |
|---|-------|----------|---------|---------|
| 1 | `exactCitation` | YES | Precise location in source | "QS 2:255, line 3, Cairo 1924 edition, p. 42" |
| 2 | `sourceCategory` | YES | Classification from §3.1 | "EDITION" |
| 3 | `editionVersion` | YES | Pinned edition identifier | "quran_cairo_hafs" (from M50-01) |
| 4 | `translatorIdentity` | IF TRANSLATION | Translator name and credentials | "Kementerian Agama RI, official committee" |
| 5 | `translationVersion` | IF TRANSLATION | Edition/version of translation | "v3.2, 2019 revision" |
| 6 | `scholarIdentity` | IF CLAIM/INTERPRETATION | Researcher or tradition authority | "Dr. Ahmad Syafi'i Ma'arif" or "Classical Sunni tafsir tradition" |
| 7 | `scholarQualifications` | IF CLAIM/INTERPRETATION | Credentials or tradition affiliation | "Professor of Islamic thought, UIN Jakarta" or "Sunni, Ash'ari theological tradition" |

### 4.2 Method and Evidence Fields

| # | Field | Required | Purpose | Example |
|---|-------|----------|---------|---------|
| 8 | `methodStatement` | YES | How conclusion was reached | "Comparative analysis of 3 manuscripts + stemmatic reconstruction" |
| 9 | `evidenceBase` | YES | What sources support the claim | "Cairo 1924, Sana'a manuscript, Birmingham fragment" |
| 10 | `counterevidence` | YES | Known contradictory evidence | "Ibn Kathir tafsir reads this verse differently" |
| 11 | `uncertaintyStatement` | YES | What is unknown or disputed | "Dating of Sana'a manuscript contested: 650-750 CE range" |
| 12 | `confidenceLevel` | YES | Reviewer's assessment | "HIGH (multiple independent witnesses) / MEDIUM (single witness + method) / LOW (inference only)" |

### 4.3 Bias and Conflict Fields

| # | Field | Required | Purpose | Example |
|---|-------|----------|---------|---------|
| 13 | `reviewerIdentity` | YES | Who performed the review | "Dr. Fatima al-Sayyid, University of Oxford" |
| 14 | `reviewerQualifications` | YES | Reviewer's expertise | "PhD in Qur'anic studies, 15 years experience, published 20 peer-reviewed articles" |
| 15 | `reviewerTraditionAffiliation` | YES | Tradition the reviewer represents | "Sunni, Shafi'i school" or "Secular academic" |
| 16 | `conflictOfInterest` | YES | Any financial, institutional, or personal conflicts | "None declared" or "Funded by XYZ Foundation, which advocates for interpretation Y" |
| 17 | `biasStatement` | YES | Reviewer's self-identified perspective | "I approach this text from a historical-critical perspective, not a devotional one" |
| 18 | `limitationAcknowledgment` | YES | What the reviewer cannot assess | "I cannot evaluate the chain of transmission (isnad) as I am not trained in hadith sciences" |

### 4.4 Review Outcome Fields

| # | Field | Required | Purpose | Example |
|---|-------|----------|---------|---------|
| 19 | `reviewDate` | YES | When review was performed | "2026-10-31" |
| 20 | `reviewStatus` | YES | Outcome classification | "ACCEPTED / DISPUTED / REQUIRES_REVISION / WITHHELD" |
| 21 | `reviewNotes` | YES | Narrative explanation | "The claim is well-supported by manuscript evidence but overstates the case for pre-Islamic influence. Recommend adding nuance." |
| 22 | `dissentingOpinions` | IF ANY | Alternative views | "Dr. X disagrees, citing Y evidence. See attached dissent." |
| 23 | `followUpRequired` | YES | Next steps | "Yes: consult hadith specialist for isnad verification" or "No: review complete" |

## 5. Fictional Case Study: "The Contested Verse"

### 5.1 Scenario

A researcher publishes a study claiming that QS 2:255 (Ayat al-Kursi) reflects pre-Islamic Arabian cosmology. The study cites three manuscripts (Cairo 1924, Sana'a, Birmingham) and argues that the phrase "Kursi" (throne/footstool) derives from pre-Islamic Arabian royal iconography.

A tradition authority disputes this, stating that "Kursi" must be understood within Islamic theological tradition as divine authority/knowledge, not a physical throne.

### 5.2 Applying the Review Checklist

**Citation and Identity:**
1. `exactCitation`: "QS 2:255, phrase 'wasi'a kursiyyuhu al-samawati wa-al-ard'"
2. `sourceCategory`: "SCHOLARLY CLAIM" (researcher's analytical assertion)
3. `editionVersion`: "quran_cairo_hafs" (base text)
4. `scholarIdentity`: "Dr. Ahmad Researcher, University of X"
5. `scholarQualifications`: "PhD in Comparative Religion, 10 years experience, published 15 articles on pre-Islamic influences"

**Method and Evidence:**
6. `methodStatement`: "Comparative linguistic analysis of 'kursiyy' in pre-Islamic poetry + manuscript comparison + iconographic analysis"
7. `evidenceBase`: "Cairo 1924 manuscript, Sana'a palimpsest (lower text), Birmingham fragment, pre-Islamic poetry corpus (Imru' al-Qays, Tarafa)"
8. `counterevidence`: "Classical tafsir (Ibn Kathir, al-Tabari) interprets 'kursiyy' as divine knowledge/authority, not physical throne; no pre-Islamic Arabian text uses 'kursiyy' in cosmological context"
9. `uncertaintyStatement`: "Sana'a manuscript dating contested (650-750 CE range); lower text reading uncertain due to palimpsest damage; pre-Islamic poetry corpus incomplete"
10. `confidenceLevel`: "MEDIUM (single witness + method, but counterevidence from tradition exists)"

**Bias and Conflict:**
11. `reviewerIdentity`: "Dr. Fatima Reviewer, University of Y"
12. `reviewerQualifications`: "PhD in Islamic Studies, 20 years experience, trained in classical tafsir and historical-critical method"
13. `reviewerTraditionAffiliation`: "Sunni, Ash'ari theological tradition + academic historical-critical perspective"
14. `conflictOfInterest`: "None declared. Research funded by university grant, no external advocacy ties."
15. `biasStatement`: "I approach this text with dual perspective: academic historical-critical method AND tradition-internal theological training. I acknowledge tension between these perspectives."
16. `limitationAcknowledgment`: "I cannot definitively resolve the dating of the Sana'a manuscript. I am not a specialist in pre-Islamic Arabian iconography."

**Review Outcome:**
17. `reviewDate`: "2026-10-31"
18. `reviewStatus`: "DISPUTED"
19. `reviewNotes`: "The researcher's linguistic analysis is methodologically sound, but the conclusion overstates the evidence. The word 'kursiyy' appears in pre-Islamic poetry but never in a cosmological context. The classical tafsir tradition offers a coherent alternative reading. Recommend revising claim from 'reflects pre-Islamic cosmology' to 'may preserve lexical continuity with pre-Islamic usage, though semantic shift is plausible.'"
20. `dissentingOpinions`: "Dr. Researcher maintains that lexical continuity is sufficient evidence. See attached rebuttal."
21. `followUpRequired`: "Yes: consult pre-Islamic Arabian iconography specialist and classical tafsir scholar for joint review."

### 5.3 Classification Analysis

**What is this?**
- The base text (QS 2:255) is an **EDITION** (Cairo 1924 Hafs)
- The researcher's claim is a **SCHOLARLY CLAIM** (analytical assertion)
- The tradition authority's response is a **TRADITION-SPECIFIC INTERPRETATION** (community-authorized reading)

**Can they coexist?**
- YES. The protocol does not adjudicate which is "correct." It classifies them as distinct categories with different verification methods.
- The scholarly claim is open to falsification via evidence and method.
- The tradition-specific interpretation is authoritative within its community but not universally binding.

**What is uncertain?**
- The dating of the Sana'a manuscript (650-750 CE range)
- The lower text reading (palimpsest damage)
- Whether "kursiyy" in pre-Islamic poetry has cosmological meaning (no attested examples)

**What is disputed?**
- Whether lexical continuity = semantic continuity
- Whether the classical tafsir reading is historically original or theologically motivated

## 6. Bias and Conflict of Interest Framework

### 6.1 Types of Bias

| Bias Type | Definition | Example | Mitigation |
|-----------|------------|---------|------------|
| **Confirmation Bias** | Seeking evidence that supports pre-existing belief | Researcher only cites manuscripts that support pre-Islamic influence claim | Require counterevidence field; mandate engagement with opposing scholarship |
| **Tradition Bias** | Assuming one's own tradition's reading is universally valid | Muslim reviewer assumes tafsir reading is historically original without evidence | Require tradition-internal AND tradition-external perspectives; document limitations |
| **Academic Bias** | privileging historical-critical method over tradition-internal knowledge | Academic reviewer dismisses chain of transmission (isnad) as "unscientific" | Acknowledge method limits; consult tradition specialists for isnad evaluation |
| **Financial Bias** | Funding source influences conclusion | Research funded by organization advocating for specific interpretation | Disclose all funding sources; recuse if conflict is severe |
| **Institutional Bias** | Career incentives shape research questions | Researcher avoids topics that might alienate department or tradition | Document institutional affiliation; acknowledge potential constraints |
| **Cultural Bias** | Applying one cultural framework to another | Western reviewer imposes Greek philosophical categories on Arabic text | Consult cultural insiders; use tradition-specific terminology |

### 6.2 Conflict of Interest Declaration

**Required disclosure:**
- Funding sources (grants, endowments, institutional support)
- Employment affiliations (university, religious institution, advocacy organization)
- Personal commitments (religious tradition, theological school, ideological position)
- Financial interests (book sales, consulting fees, patents)

**Recusal criteria:**
- Direct financial interest in outcome
- Institutional mandate to reach specific conclusion
- Personal relationship with subject that prevents objective analysis

**If recusal is not possible:**
- Disclose conflict explicitly in `conflictOfInterest` field
- Add dissenting reviewer from opposing perspective
- Document limitation in `limitationAcknowledgment` field

### 6.3 Multi-Perspective Review

**For contested material, require:**
1. At least TWO reviewers with different tradition affiliations
2. At least ONE reviewer with tradition-internal expertise (e.g., trained in classical tafsir)
3. At least ONE reviewer with tradition-external expertise (e.g., historical-critical method)
4. Explicit `dissentingOpinions` field if reviewers disagree

**Example:**
- Reviewer 1: Sunni Muslim scholar trained in classical tafsir
- Reviewer 2: Secular academic historian with no tradition affiliation
- Reviewer 3: Shia Muslim scholar (if tradition diversity is relevant)
- All three complete the checklist independently
- Dissenting opinions are recorded, not resolved

## 7. Tradition-Specific Limitations

### 7.1 Islamic Tradition

**Strengths:**
- Rich manuscript tradition (Cairo, Sana'a, Birmingham, Topkapi)
- Established textual criticism methods (qira'at, rasm analysis)
- Chain of transmission (isnad) evaluation system
- Classical tafsir corpus (al-Tabari, Ibn Kathir, al-Razi)

**Limitations:**
- Isnad evaluation requires specialized training in hadith sciences
- Qira'at (recitation variants) are tradition-internal, not universally accessible
- Classical tafsir assumes theological commitments not shared by secular academics
- Modern academic dating methods (radiocarbon, paleography) may conflict with traditional dating

**Protocol adaptation:**
- Consult hadith specialist for isnad evaluation
- Document qira'at variants explicitly
- Acknowledge theological commitments in tafsir sources
- Note where academic and traditional dating diverge

### 7.2 Christian Tradition

**Strengths:**
- Extensive manuscript corpus (Greek, Latin, Syriac, Coptic)
- Established textual criticism methods (Nestle-Aland, UBS)
- Long history of scholarly engagement with variants
- Multiple tradition perspectives (Catholic, Orthodox, Protestant)

**Limitations:**
- Manuscript dating often contested (2nd-4th century range for earliest fragments)
- Translation tradition (Septuagint, Vulgate) complicates "original text" concept
- Doctrinal commitments influence textual decisions (e.g., Johannine Comma)
- Modern critical editions may not align with community-authorized texts

**Protocol adaptation:**
- Specify which manuscript tradition is being used (Alexandrian, Byzantine, Western)
- Document translation vs original language distinctions
- Acknowledge doctrinal influences on textual decisions
- Note where critical editions diverge from community-authorized texts

### 7.3 Jewish Tradition

**Strengths:**
- Masoretic text with established vocalization and cantillation
- Rich commentary tradition (Rashi, Ibn Ezra, Ramban)
- Dead Sea Scrolls provide ancient manuscript evidence
- Established textual criticism methods (BHS, BHQ)

**Limitations:**
- Masoretic text is medieval (10th-11th century), not ancient
- Dead Sea Scrolls show textual diversity not reflected in Masoretic text
- Commentary tradition assumes theological commitments
- Hebrew language evolution complicates "original meaning" concept

**Protocol adaptation:**
- Specify which textual tradition is being used (Masoretic, Samaritan, LXX, DSS)
- Document where DSS diverges from Masoretic text
- Acknowledge theological commitments in commentary sources
- Note Hebrew language diachronic changes

### 7.4 Secular Academic Tradition

**Strengths:**
- Historical-critical method with established protocols
- Peer review process
- Interdisciplinary engagement (archaeology, linguistics, anthropology)
- Explicit methodology statements

**Limitations:**
- May lack tradition-internal expertise
- Methodological naturalism excludes supernatural claims a priori
- Western academic assumptions may not apply to ancient Near Eastern texts
- Publication incentives favor novel claims over careful analysis

**Protocol adaptation:**
- Consult tradition specialists for tradition-internal questions
- Acknowledge methodological naturalism as a commitment, not a neutral fact
- Document where Western academic assumptions may not apply
- Prioritize careful analysis over novel claims

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| One tradition's method may be generalized inappropriately | High | Document tradition-specific limitations; require multi-perspective review |
| Reviewer may lack qualification for specific material | Medium | Require `reviewerQualifications` field; mandate `limitationAcknowledgment` |
| Conflict of interest may bias review | High | Require `conflictOfInterest` disclosure; recusal if severe |
| Disputed material may be prematurely resolved | Medium | Use `reviewStatus: DISPUTED`; record dissenting opinions |
| Protocol may be too complex for practical use | Low | Provide checklist template; allow partial completion with explanation |

## 9. Metrics

- **Classification agreement:** % of records where two independent reviewers assign same `sourceCategory`
- **Unresolved method questions:** Count of records with `reviewStatus: DISPUTED` or `REQUIRES_REVISION`
- **Multi-perspective coverage:** % of contested records with 2+ reviewers from different traditions
- **Bias disclosure compliance:** % of records with all 6 bias/conflict fields completed
- **Follow-up completion:** % of records with `followUpRequired: YES` where follow-up was actually performed

## 10. Verification Plan

### 10.1 Tabletop Case Test

**Test:** Apply checklist to fictional "Contested Verse" case (§5)

**Success criteria:**
- Reviewer can classify base text, scholarly claim, and tradition interpretation correctly
- Reviewer identifies uncertainty and dispute points
- Reviewer completes all bias/conflict fields
- Reviewer records dissenting opinions without resolving them

**Test procedure:**
1. Provide reviewer with case description (§5.1)
2. Ask reviewer to complete checklist (§4) independently
3. Compare reviewer's classification with expected classification (§5.3)
4. Evaluate bias/conflict disclosure completeness
5. Assess whether dissenting opinions are preserved

### 10.2 Reviewer Agreement Check

**Test:** Two reviewers independently classify same material

**Success criteria:**
- Both reviewers assign same `sourceCategory` (or document disagreement)
- Both reviewers identify same uncertainty points
- Both reviewers complete bias/conflict fields
- Disagreements are recorded in `dissentingOpinions`

**Test procedure:**
1. Select contested material (e.g., QS 2:255 pre-Islamic influence claim)
2. Recruit two reviewers with different tradition affiliations
3. Ask each to complete checklist independently
4. Compare classifications, uncertainty statements, bias disclosures
5. Record agreements and disagreements

### 10.3 Scholar Review

**Deferred:** Requires qualified domain reviewers to:
- Validate classification framework (§3)
- Test checklist completeness (§4)
- Evaluate bias/conflict framework (§6)
- Assess tradition-specific limitations (§7)
- Approve protocol for practical use

## 11. Rollback Plan

- Withdraw protocol if consultation is inadequate
- Keep protocol as proposal; no stored data migrated
- Checklist can be used informally without formal adoption
- Fictional case study (§5) serves as training material regardless of protocol adoption

## 12. Closure Evidence

**Completed:**
- ✅ Five content categories defined (primary artifact / edition / translation / scholarly claim / interpretation)
- ✅ Classification decision tree documented
- ✅ Critical distinctions clarified (edition vs translation, scholarly claim vs interpretation, artifact vs edition)
- ✅ Review checklist with 23 fields across 4 sections (citation/identity, method/evidence, bias/conflict, review outcome)
- ✅ Fictional case study ("The Contested Verse") with complete checklist application
- ✅ Classification analysis demonstrating coexistence of scholarly claim and tradition interpretation
- ✅ Bias and conflict of interest framework with 6 bias types and mitigation strategies
- ✅ Conflict of interest declaration requirements and recusal criteria
- ✅ Multi-perspective review protocol (2+ reviewers from different traditions)
- ✅ Tradition-specific limitations documented for Islamic, Christian, Jewish, and secular academic traditions
- ✅ Risks and mitigations table
- ✅ Metrics defined (classification agreement, unresolved questions, multi-perspective coverage, bias disclosure compliance, follow-up completion)
- ✅ Verification plan with tabletop case test, reviewer agreement check, and scholar review

**Deferred (requires owner action):**
- ⏳ Qualified domain reviewer consultation
- ⏳ Reviewer agreement testing with real contested material
- ⏳ Protocol adoption decision
- ⏳ Training material development

## 13. Overlap Analysis

### 13.1 M50-01 (Source Identity Profile)

M50-01 defined source/edition/manifestation/version identity. M50-11 uses these identity profiles in the review checklist (`editionVersion` field references M50-01 identity). No overlap: M50-01 is about identity, M50-11 is about review process.

### 13.2 M50-03 (Translation/Transcription Provenance)

M50-03 defined translation/transliteration/transcription provenance fields. M50-11 references these in the classification framework (translation is one of five categories). No overlap: M50-03 is about provenance metadata, M50-11 is about review process.

### 13.3 M50-06 (Entity Identity Disambiguation)

M50-06 defined entity identity and disambiguation rules. M50-11 uses entity identity in the review checklist (`scholarIdentity` field). No overlap: M50-06 is about entity identity, M50-11 is about review process.

### 13.4 M50-07 (Claim/Evidence/Interpretation Separation)

M50-07 (not yet done) will map records to distinct source evidence, attributed claims, interpretations, and tradition context. M50-11's classification framework (§3.1) anticipates this separation. Potential overlap: M50-11's five categories may align with M50-07's record types. Coordination needed when M50-07 is implemented.

## 14. References

- M50-01 audit: `docs/audit/M50-01-canonical-source-identity-profile.md`
- M50-03 audit: `docs/audit/M50-03-translation-transcription-provenance.md`
- M50-06 audit: `docs/audit/M50-06-entity-identity-disambiguation.md`
- QS 2:255 (Ayat al-Kursi): https://corpus.quran.com/verse.jsp?key=2:255
- Sana'a manuscript: https://islamicart.museumofart.org/research/sanaa-manuscripts/
- Birmingham fragment: https://www.birmingham.ac.uk/news/2015/coran-fragment.aspx
- Classical tafsir: al-Tabari, Jami' al-Bayan; Ibn Kathir, Tafsir al-Qur'an al-'Azim
- Historical-critical method: https://en.wikipedia.org/wiki/Historical_criticism

---

**Baseline established 2026-10-31.** Source-critical review protocol defined with 5 content categories, 23-field checklist, fictional case study, bias/conflict framework, and tradition-specific limitations. Scholar review and practical testing deferred.
