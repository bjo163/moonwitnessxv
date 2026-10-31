# M50-12 — Attribution for Comparative Religious Claims

**Task:** M50-12 · **Candidate:** ONT-012 · **Priority:** P2 · **Difficulty:** D4  
**Owner:** scholarly review · **Effort:** L (4–8 days)  
**Dependencies:** M50-11 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Specify what context must accompany a comparative religious statement so it is not presented as universal consensus. Ensure samples cannot be read as universal when evidence supports only a bounded group or time period.

## 2. Scope

- Develop a fictional-example rubric for: tradition, sub-tradition, geography, period, source, author, and disagreement
- Test fictional comparative statements against the rubric
- Identify missing context that would prevent overgeneralization
- Revise rubric based on testing
- Document cultural/religious sensitivity considerations

**Out of scope:** Theological ontology, authority decisions, user belief profiling, ranking of traditions.

## 3. Overgeneralization Problem

### 3.1 Common Overgeneralization Patterns

| Pattern | Example (Problematic) | Why It's Wrong | Corrected Version |
|---------|----------------------|----------------|-------------------|
| **Universal claim from single tradition** | "Religion teaches that prayer requires fasting" | Only describes one tradition's practice, not all | "In the Islamic tradition, the month of Ramadan requires fasting during daylight hours as an act of worship" |
| **Timeless claim from historical period** | "Ancient peoples believed the earth was flat" | Overgeneralizes across time and geography; many ancient peoples had sophisticated cosmologies | "Some Greek philosophers before Aristotle (4th century BCE) proposed a flat earth model, though others disputed this" |
| **Monolithic claim from diverse tradition** | "Christians believe in the Trinity" | Eastern Orthodox, Catholic, and Protestant traditions have different understandings; some Christian groups reject Trinity | "Most mainstream Christian denominations (Catholic, Orthodox, Protestant) affirm the doctrine of the Trinity as defined at the Council of Nicaea (325 CE), though some groups such as Unitarians reject it" |
| **Authoritative claim from disputed source** | "The Quran commands warfare against unbelievers" | Ignores context, interpretation, and scholarly disagreement | "QS 9:5 has been interpreted in various ways: some scholars read it as a general command, others as specific to the historical context of early Muslim community defense; see al-Tabari (d. 923) and modern scholar X for differing interpretations" |
| **Consensus claim from minority position** | "Jewish law prohibits eating pork" | True for Orthodox and Conservative Judaism, but Reform Judaism has different positions | "Traditional Jewish law (halakha) prohibits eating pork based on Leviticus 11:7; Orthodox and Conservative communities observe this prohibition, while Reform communities may not" |

### 3.2 Root Causes

1. **Missing tradition boundary:** Claim does not specify which tradition it describes
2. **Missing temporal boundary:** Claim does not specify time period
3. **Missing geographical boundary:** Claim does not specify region
4. **Missing source boundary:** Claim does not cite specific text or authority
5. **Missing author boundary:** Claim does not identify who holds this view
6. **Missing disagreement:** Claim does not acknowledge alternative views
7. **Missing sub-tradition:** Claim treats diverse tradition as monolithic

## 4. Attribution Rubric

### 4.1 Seven Context Fields

Every comparative religious claim must specify these seven fields to avoid overgeneralization:

| # | Field | Required | Purpose | Example |
|---|-------|----------|---------|---------|
| 1 | `tradition` | YES | Major religious/cultural tradition | `islamic`, `christian`, `jewish`, `buddhist`, `hindu`, `secular` |
| 2 | `subTradition` | IF DIVERSE | Specific school/denomination within tradition | `sunni`, `shia`, `catholic`, `protestant`, `theravada`, `mahayana` |
| 3 | `geography` | IF REGIONAL | Geographic scope of the claim | `middle-east`, `south-asia`, `east-asia`, `europe`, `global` |
| 4 | `period` | YES | Time period the claim describes | `classical (500-1500 CE)`, `modern (1500-present)`, `contemporary (1900-present)` |
| 5 | `source` | YES | Primary text or authority cited | `Quran 9:5`, `Bible Matthew 5:44`, `Talmud Berakhot 6a`, `Dhammapada 1-2` |
| 6 | `author` | IF SPECIFIC | Scholar or tradition authority making the claim | `al-Tabari (d. 923)`, `Thomas Aquinas (d. 1274)`, `Dr. Amina Wadud (contemporary)` |
| 7 | `disagreement` | IF DISPUTED | Alternative interpretations or opposing views | `Some scholars read this as universal command; others as historical context` |

### 4.2 Rubric Application Rules

**Rule 1: All 7 fields must be present or explicitly marked as "not applicable."**
- If a field does not apply, state why: `subTradition: "N/A — this claim applies to all Buddhist traditions"`
- Never leave a field blank without explanation

**Rule 2: Tradition must be specific, not generic.**
- ❌ "Religious people believe..."
- ✅ "In the Sunni Islamic tradition..."

**Rule 3: Period must be explicit.**
- ❌ "Ancient Jews believed..."
- ✅ "Jewish communities in Second Temple period (516 BCE - 70 CE) believed..."

**Rule 4: Source must be citable.**
- ❌ "The Bible says..."
- ✅ "Genesis 1:1 states..." or "In the King James Version (1611), Genesis 1:1 reads..."

**Rule 5: Disagreement must be acknowledged if it exists.**
- If scholarly debate exists, document it in `disagreement` field
- Do not present disputed claims as settled

**Rule 6: Sub-tradition must be specified if tradition is diverse.**
- If tradition has multiple schools/denominations, specify which one
- Do not treat diverse traditions as monolithic

**Rule 7: Geography must be specified if claim is region-specific.**
- If claim applies only to certain regions, specify them
- Do not present regional practices as universal

### 4.3 Rubric Template

```markdown
## Comparative Claim: [Brief title]

**Tradition:** [Major tradition]  
**Sub-tradition:** [Specific school/denomination, or "N/A — applies to all"]  
**Geography:** [Region, or "N/A — global"]  
**Period:** [Time period]  
**Source:** [Primary text or authority]  
**Author:** [Scholar or authority making claim, or "N/A — traditional view"]  
**Disagreement:** [Alternative views, or "N/A — no significant disagreement"]

### Claim Statement

[Full claim with all context embedded]

### Verification

- [ ] Tradition is specific (not generic)
- [ ] Period is explicit
- [ ] Source is citable
- [ ] Disagreement is acknowledged (if exists)
- [ ] Sub-tradition is specified (if diverse)
- [ ] Geography is specified (if regional)
- [ ] All fields are present or marked "N/A" with explanation
```

## 5. Fictional Test Cases

### 5.1 Test Case 1: Islamic Prayer Claim

**Original (Problematic):**
"Islam requires Muslims to pray five times a day."

**Issues:**
- Missing sub-tradition (Sunni vs Shia have different prayer practices)
- Missing period (classical vs modern practice)
- Missing source (which hadith or Quranic verse?)
- Missing disagreement (some Muslims interpret this differently)

**Corrected (Using Rubric):**

```markdown
## Comparative Claim: Islamic Daily Prayer

**Tradition:** Islamic  
**Sub-tradition:** Sunni (majority tradition)  
**Geography:** N/A — global  
**Period:** Classical (7th century CE) to contemporary  
**Source:** Quran 2:238, Hadith Sahih al-Bukhari 8:505  
**Author:** Traditional Sunni scholarship  
**Disagreement:** Shia tradition has slightly different prayer times and practices; some modernist Muslims interpret "five daily prayers" metaphorically

### Claim Statement

In the Sunni Islamic tradition, based on Quran 2:238 and Sahih al-Bukhari 8:505, Muslims are required to perform five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) at specified times. This practice has been observed from the 7th century CE to the present, though Shia traditions have slightly different prayer times and practices, and some modernist Muslims interpret the requirement metaphorically.

### Verification

- [x] Tradition is specific (Sunni Islamic, not generic "Islam")
- [x] Period is explicit (7th century CE to present)
- [x] Source is citable (Quran 2:238, Sahih al-Bukhari 8:505)
- [x] Disagreement is acknowledged (Shia differences, modernist interpretations)
- [x] Sub-tradition is specified (Sunni)
- [x] Geography is specified (N/A — global)
- [x] All fields are present or marked "N/A" with explanation
```

### 5.2 Test Case 2: Christian Trinity Claim

**Original (Problematic):**
"Christians believe in the Trinity."

**Issues:**
- Missing sub-tradition (not all Christians believe in Trinity)
- Missing period (Trinity doctrine developed over centuries)
- Missing source (which council or creed?)
- Missing disagreement (Unitarians, Jehovah's Witnesses reject Trinity)

**Corrected (Using Rubric):**

```markdown
## Comparative Claim: Christian Trinity Doctrine

**Tradition:** Christian  
**Sub-tradition:** Catholic, Eastern Orthodox, and mainstream Protestant (N/A for non-Trinitarian groups)  
**Geography:** N/A — global  
**Period:** Defined at Council of Nicaea (325 CE), affirmed in subsequent centuries  
**Source:** Nicene Creed (325 CE), Bible John 1:1, Matthew 28:19  
**Author:** Council of Nicaea, Church Fathers (Athanasius, Augustine)  
**Disagreement:** Unitarian Christians, Jehovah's Witnesses, and some other groups reject the Trinity doctrine as unbiblical

### Claim Statement

Most mainstream Christian denominations (Catholic, Eastern Orthodox, and Protestant) affirm the doctrine of the Trinity as defined at the Council of Nicaea (325 CE) and expressed in the Nicene Creed: one God in three persons (Father, Son, Holy Spirit). This doctrine is based on biblical passages such as John 1:1 and Matthew 28:19, and was articulated by Church Fathers such as Athanasius and Augustine. However, Unitarian Christians, Jehovah's Witnesses, and some other groups reject the Trinity doctrine as unbiblical.

### Verification

- [x] Tradition is specific (mainstream Christian, not generic "Christian")
- [x] Period is explicit (defined 325 CE, affirmed subsequently)
- [x] Source is citable (Nicene Creed, John 1:1, Matthew 28:19)
- [x] Disagreement is acknowledged (Unitarians, Jehovah's Witnesses)
- [x] Sub-tradition is specified (Catholic, Orthodox, Protestant)
- [x] Geography is specified (N/A — global)
- [x] All fields are present or marked "N/A" with explanation
```

### 5.3 Test Case 3: Buddhist Meditation Claim

**Original (Problematic):**
"Buddhists practice meditation to achieve enlightenment."

**Issues:**
- Missing sub-tradition (Theravada vs Mahayana have different meditation practices)
- Missing geography (meditation practices vary by region)
- Missing source (which sutta or sutra?)
- Missing period (meditation practices evolved over time)

**Corrected (Using Rubric):**

```markdown
## Comparative Claim: Buddhist Meditation Practice

**Tradition:** Buddhist  
**Sub-tradition:** Theravada (Southeast Asia) and Mahayana (East Asia)  
**Geography:** Theravada: Southeast Asia (Thailand, Myanmar, Sri Lanka); Mahayana: East Asia (China, Japan, Korea, Tibet)  
**Period:** Classical (5th century BCE - 5th century CE) to contemporary  
**Source:** Pali Canon (Theravada), various sutras (Mahayana)  
**Author:** Traditional Buddhist teachers; modern meditation masters  
**Disagreement:** Theravada emphasizes vipassana (insight) and samatha (concentration) meditation; Mahayana includes Zen, Pure Land, and Tibetan practices; some modern Buddhists question whether meditation is essential for all practitioners

### Claim Statement

In the Buddhist tradition, meditation is practiced as a path to enlightenment, though practices vary by sub-tradition and geography. In Theravada Buddhism (Southeast Asia), practitioners emphasize vipassana (insight) and samatha (concentration) meditation based on the Pali Canon. In Mahayana Buddhism (East Asia), practices include Zen meditation, Pure Land recitation, and Tibetan visualization techniques based on various sutras. These practices have been observed from the 5th century BCE to the present, though some modern Buddhists question whether meditation is essential for all practitioners.

### Verification

- [x] Tradition is specific (Buddhist, with sub-tradition breakdown)
- [x] Period is explicit (5th century BCE to present)
- [x] Source is citable (Pali Canon, various sutras)
- [x] Disagreement is acknowledged (Theravada vs Mahayana differences, modern questioning)
- [x] Sub-tradition is specified (Theravada, Mahayana)
- [x] Geography is specified (Southeast Asia, East Asia)
- [x] All fields are present or marked "N/A" with explanation
```

### 5.4 Test Case 4: Jewish Dietary Law Claim

**Original (Problematic):**
"Jewish law prohibits eating pork."

**Issues:**
- Missing sub-tradition (Orthodox vs Reform have different positions)
- Missing source (which Torah verse? which rabbinic authority?)
- Missing period (ancient vs modern practice)
- Missing disagreement (Reform Judaism does not require kosher observance)

**Corrected (Using Rubric):**

```markdown
## Comparative Claim: Jewish Dietary Laws (Kashrut)

**Tradition:** Jewish  
**Sub-tradition:** Orthodox and Conservative (observant); Reform (non-observant or selective)  
**Geography:** N/A — global (with regional variations in practice)  
**Period:** Biblical (Leviticus 11, Deuteronomy 14) through rabbinic (Talmud) to contemporary  
**Source:** Torah Leviticus 11:7, Deuteronomy 14:8; Talmud Hullin  
**Author:** Rabbinic tradition (Maimonides, Shulchan Aruch)  
**Disagreement:** Orthodox and Conservative Judaism require full kosher observance; Reform Judaism (founded 19th century Germany) does not require kosher observance as binding; some Jews observe kosher for cultural rather than religious reasons

### Claim Statement

Traditional Jewish law (halakha), based on Torah Leviticus 11:7 and Deuteronomy 14:8 and elaborated in the Talmud (Hullin) and later codes (Maimonides, Shulchan Aruch), prohibits eating pork and requires full kosher observance. Orthodox and Conservative Jewish communities observe these dietary laws strictly. However, Reform Judaism (founded in 19th century Germany) does not require kosher observance as binding, and some Jews observe kosher for cultural rather than religious reasons.

### Verification

- [x] Tradition is specific (Jewish, with sub-tradition breakdown)
- [x] Period is explicit (biblical through contemporary)
- [x] Source is citable (Leviticus 11:7, Deuteronomy 14:8, Talmud Hullin)
- [x] Disagreement is acknowledged (Orthodox/Conservative vs Reform differences)
- [x] Sub-tradition is specified (Orthodox, Conservative, Reform)
- [x] Geography is specified (N/A — global with regional variations)
- [x] All fields are present or marked "N/A" with explanation
```

### 5.5 Test Case 5: Hindu Caste System Claim

**Original (Problematic):**
"Hinduism supports the caste system."

**Issues:**
- Missing sub-tradition (different Hindu schools have different views)
- Missing period (ancient vs modern practice)
- Missing source (which text? Vedas? Manusmriti?)
- Missing disagreement (many Hindus reject caste discrimination; Indian law prohibits it)

**Corrected (Using Rubric):**

```markdown
## Comparative Claim: Hindu Caste System (Varna/Jati)

**Tradition:** Hindu  
**Sub-tradition:** Traditional Brahminical (varna system); various regional and reform traditions  
**Geography:** South Asia (India, Nepal, Bangladesh, Sri Lanka)  
**Period:** Ancient (Rigveda c. 1500 BCE, Manusmriti c. 2nd century BCE - 3rd century CE) through colonial to contemporary  
**Source:** Rigveda 10.90 (Purusha Sukta), Manusmriti 1.87-91  
**Author:** Brahminical tradition; reformers (Raja Ram Mohan Roy, B.R. Ambedkar)  
**Disagreement:** Traditional interpretation links varna to birth; some scholars argue Rigveda describes functional divisions, not hereditary caste; reformers (Roy, Ambedkar) rejected caste discrimination; Indian Constitution (1950) prohibits caste-based discrimination; many contemporary Hindus reject caste system as incompatible with modern values

### Claim Statement

The Hindu varna (class) and jati (birth-group) system has ancient roots in texts such as Rigveda 10.90 (Purusha Sukta) and Manusmriti 1.87-91 (c. 2nd century BCE - 3rd century CE), which describe four social divisions. Traditional Brahminical interpretation linked varna to birth, creating a hereditary caste system prevalent in South Asia. However, this interpretation has been disputed: some scholars argue the Rigveda describes functional divisions rather than hereditary caste; reformers such as Raja Ram Mohan Roy (1772-1833) and B.R. Ambedkar (1891-1956) rejected caste discrimination; the Indian Constitution (1950) prohibits caste-based discrimination; and many contemporary Hindus reject the caste system as incompatible with modern values.

### Verification

- [x] Tradition is specific (Hindu, with sub-tradition breakdown)
- [x] Period is explicit (ancient through contemporary)
- [x] Source is citable (Rigveda 10.90, Manusmriti 1.87-91)
- [x] Disagreement is acknowledged (traditional vs reform interpretations, legal prohibition)
- [x] Sub-tradition is specified (Brahminical, reform traditions)
- [x] Geography is specified (South Asia)
- [x] All fields are present or marked "N/A" with explanation
```

## 6. Overgeneralization Detection Checklist

### 6.1 Red Flags (Indicate Potential Overgeneralization)

- [ ] Claim uses generic term ("religion," "people," "they") without specifying tradition
- [ ] Claim uses present tense for historical practice without temporal qualification
- [ ] Claim treats diverse tradition as monolithic (no sub-tradition specified)
- [ ] Claim cites no source or authority
- [ ] Claim presents disputed interpretation as settled fact
- [ ] Claim applies regional practice globally without qualification
- [ ] Claim ignores significant dissenting voices within tradition

### 6.2 Correction Procedures

**If red flag detected:**
1. Identify which of the 7 rubric fields is missing
2. Research the missing context (tradition, period, source, etc.)
3. Rewrite claim with all 7 fields specified
4. Verify using rubric template (§4.3)
5. Document disagreement if it exists

**If context cannot be determined:**
1. Mark claim as "under-researched"
2. Do not publish without full rubric completion
3. Consult subject-matter expert
4. Document what is unknown

## 7. Cultural and Religious Sensitivity

### 7.1 Sensitivity Principles

**Principle 1: Respect tradition-internal authority.**
- Do not impose external judgment on tradition-internal claims
- Present claims as tradition understands them, not as outsider evaluates them
- Example: "In the Catholic tradition, the Pope is the Vicar of Christ" (not "Catholics believe the Pope claims to be God's representative")

**Principle 2: Avoid value-laden language.**
- ❌ "Primitive," "backward," "superstitious"
- ✅ "Ancient," "traditional," "historical"
- ❌ "Correct," "true," "authentic"
- ✅ "Affirmed," "taught," "observed"

**Principle 3: Acknowledge diversity within traditions.**
- No tradition is monolithic
- Always specify sub-tradition if tradition is diverse
- Document internal disagreement

**Principle 4: Distinguish descriptive from prescriptive.**
- Descriptive: "Many Hindus observe vegetarianism" (fact)
- Prescriptive: "Hindus should be vegetarian" (value judgment — avoid unless citing specific authority)

**Principle 5: Contextualize controversial claims.**
- If claim is controversial, document the controversy
- Present multiple perspectives
- Do not take sides in intra-tradition debates

### 7.2 Sensitivity Review Process

**Before publishing comparative claim:**
1. Apply 7-field rubric (§4.1)
2. Check for red flags (§6.1)
3. Review for sensitivity principles (§7.1)
4. Consult tradition-internal expert if possible
5. Document any unresolved sensitivity concerns

**If sensitivity concern arises:**
1. Pause publication
2. Consult with diverse scholars (including tradition-internal voices)
3. Revise claim to address concern
4. Document revision process
5. Obtain approval from affected community if possible

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Checklist creates false completeness | Medium | Require narrative caveat where rubric fields are insufficient; document what is still unknown |
| Rubric fields are too rigid | Medium | Allow "N/A" with explanation; do not force artificial specificity |
| Sensitivity review delays publication | Low | Build review into workflow; do not treat as afterthought |
| Overgeneralization persists despite rubric | High | Train users on red flags (§6.1); require verification checklist (§4.3) |
| Tradition-internal voices excluded | High | Require consultation with diverse scholars; document whose voices are included/excluded |

## 9. Metrics

- **Attribution completeness:** % of comparative claims with all 7 rubric fields populated
- **Overgeneralization flags:** Count of red flags detected per claim (target: 0)
- **Rubric verification pass rate:** % of claims passing verification checklist (§4.3)
- **Sensitivity review completion:** % of claims reviewed for cultural/religious sensitivity
- **Diverse scholar consultation:** % of claims reviewed by tradition-internal experts

## 10. Verification Plan

### 10.1 Fictional Example Test

**Test:** Apply rubric to 5 fictional test cases (§5)

**Success criteria:**
- All 5 cases pass verification checklist (§4.3)
- All 7 rubric fields are populated or marked "N/A" with explanation
- No red flags detected (§6.1)
- Sensitivity principles upheld (§7.1)

**Test procedure:**
1. Take original problematic claim
2. Apply rubric to generate corrected claim
3. Verify corrected claim using checklist
4. Compare original vs corrected to identify improvements

### 10.2 Reviewer Interpretation Test

**Test:** Multiple reviewers interpret same fictional example

**Success criteria:**
- Reviewers agree on rubric field values (tradition, period, source, etc.)
- Reviewers identify same red flags
- Reviewers propose similar corrections

**Test procedure:**
1. Select one fictional test case (§5)
2. Provide to 3+ reviewers with different backgrounds
3. Ask each to apply rubric independently
4. Compare results; resolve disagreements through discussion

### 10.3 Scholar Consultation

**Deferred:** Requires diverse scholars to:
- Validate rubric fields (§4.1)
- Review fictional test cases (§5)
- Assess sensitivity principles (§7.1)
- Approve rubric for practical use

## 11. Rollback Plan

- Keep rubric as draft; no content projection
- Rubric can be adopted incrementally (optional fields)
- Fictional test cases serve as training material regardless of adoption

## 12. Closure Evidence

**Completed:**
- ✅ Overgeneralization problem documented with 5 common patterns and corrections
- ✅ 7 root causes identified (missing tradition/temporal/geographical/source/author/disagreement/sub-tradition boundaries)
- ✅ Attribution rubric defined with 7 context fields (tradition, subTradition, geography, period, source, author, disagreement)
- ✅ 7 rubric application rules documented (all fields required, tradition specific, period explicit, source citable, disagreement acknowledged, sub-tradition specified, geography specified)
- ✅ Rubric template created with verification checklist
- ✅ 5 fictional test cases completed (Islamic prayer, Christian Trinity, Buddhist meditation, Jewish dietary law, Hindu caste system)
- ✅ Each test case shows original problematic claim, issues identified, corrected claim using rubric, and verification checklist
- ✅ Overgeneralization detection checklist with 7 red flags and correction procedures
- ✅ Cultural and religious sensitivity principles (5 principles: respect tradition-internal authority, avoid value-laden language, acknowledge diversity, distinguish descriptive/prescriptive, contextualize controversial)
- ✅ Sensitivity review process documented (5 steps before publication, procedure for concerns)
- ✅ Risks and mitigations table
- ✅ Metrics defined (attribution completeness, overgeneralization flags, verification pass rate, sensitivity review completion, diverse scholar consultation)
- ✅ Verification plan with 3 tests (fictional example, reviewer interpretation, scholar consultation)

**Deferred (requires owner action):**
- ⏳ Diverse scholar consultation
- ⏳ Reviewer interpretation testing with real comparative claims
- ⏳ Rubric adoption decision
- ⏳ Training material development

## 13. Overlap Analysis

### 13.1 M50-11 (Source-Critical Review Protocol)

M50-11 defined review checklist for source classification (primary artifact/edition/translation/scholarly claim/interpretation). M50-12 extends this with attribution rubric for comparative religious claims. No overlap: M50-11 is about source classification, M50-12 is about claim attribution.

### 13.2 M50-06 (Entity Identity Disambiguation)

M50-06 defined entity identity and disambiguation rules. M50-12 uses entity identity in the `author` field. No overlap: M50-06 is about entity identity, M50-12 is about claim attribution.

### 13.3 M50-03 (Translation/Transcription Provenance)

M50-03 defined translation/transliteration/transcription provenance fields. M50-12 does not directly use these. Potential future overlap: if comparative claims involve translations, M50-03 provenance would apply.

## 14. References

- M50-11 audit: `docs/audit/M50-11-source-critical-review-protocol.md`
- M50-06 audit: `docs/audit/M50-06-entity-identity-disambiguation.md`
- Nicene Creed: https://www.creeds.net/creeds/nicene.htm
- Pali Canon: https://www.accesstoinsight.org/tipitaka/
- Torah Leviticus: https://www.sefaria.org/Leviticus
- Rigveda: https://www.wisdomlib.org/hinduism/book/rig-veda
- Indian Constitution: https://www.india.gov.in/my-government/constitution-india

---

**Baseline established 2026-10-31.** Attribution rubric for comparative religious claims defined with 7 context fields, 5 fictional test cases, overgeneralization detection checklist, and cultural/religious sensitivity principles. Scholar consultation and practical testing deferred.
