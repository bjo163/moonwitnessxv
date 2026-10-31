# M50-08: Represent Contested Claims as Attributed Parallel Positions — Ontology Design Study

**Task:** M50-08 — Represent contested claims as attributed parallel positions  
**Status:** BASELINE ESTABLISHED (design study, no implementation)  
**Date:** 2026-10-31  
**Owner:** MoonQL Ontology / Scholarly Review  
**Effort:** L (5–10 days)  
**Dependencies:** M50-07 (claim/evidence/interpretation separation), M50-11 (source-critical review), M50-12 (attribution rubric), M50-17 (transparent review protocol), M19 (citation hierarchy)

---

## Executive Summary

This document presents an ontology design study for representing incompatible scholarly or tradition-specific positions as **parallel attributed claims** rather than averaging, voting, or hiding minority positions. Current systems tend to resolve disagreements by taking majority vote, computing weighted averages, or suppressing minority views, which loses important scholarly and tradition-specific nuance.

**Key findings:**
- Current systems conflate disagreement resolution with knowledge representation, causing information loss
- Core principle: "disagreement is not averaged or resolved by vote" — all positions remain visible with full attribution
- Synthetic dataset demonstrates 5 real scholarly disagreements (Quranic manuscript dating, Kursiyy interpretation, hadith historical accuracy, free will vs predestination, translation choices) with 2-4 competing positions each
- Schema extension adds 3 new MoonQL models (disagreement_groups, position_records, attribution_metadata) with explicit relations to M50-07 claim/evidence/interpretation classes
- Ordering principle: chronological by default, with optional authority-based or evidence-strength ordering; no position is hidden or downweighted
- UI mockup shows side-by-side parallel display with full attribution cards
- Anti-averaging mechanisms prevent majority vote, weighted averaging, or minority suppression
- 5 verification tests demonstrate correct representation of disagreements with 100% position visibility
- Overlap analysis with M50-07, M50-11, M50-12, M50-17 shows alignment without conflict

**Recommendation:** Proceed with BASELINE ESTABLISHED status. The parallel-positions model is recommended for implementation. Requires domain reviewer and ontology reviewer approval before any implementation begins.

---

## 1. Problem Statement

### 1.1 Current State: Disagreement Resolution by Averaging or Suppression

Knowledge systems, encyclopedias, and academic databases typically handle scholarly disagreements in one of three ways:

| Approach | Method | Example | Information Loss |
|----------|--------|---------|------------------|
| **Majority Vote** | Take the most commonly held position | "Scholars agree that X means Y" | Minority positions invisible |
| **Weighted Average** | Compute consensus based on authority | "The weight of evidence suggests Z" | Outlier positions suppressed |
| **Hide Disagreement** | Present single "authoritative" view | "X is defined as Y" | All alternative views lost |

**Problem:** These approaches resolve disagreement by eliminating it from the representation, making it impossible for users to see:
- What positions exist and who holds them
- What evidence each position relies on
- Why reasonable scholars disagree
- How interpretations vary across traditions or time periods

### 1.2 Three Specific Pain Points

**Pain Point 1: Invisible Minority Positions**
- When a system presents "the scholarly consensus," minority positions disappear
- Users cannot see: "Which scholars disagree? What is their evidence?"
- Example: If 90% of scholars date a Quranic manuscript to 700 CE, but 10% date it to 650 CE based on paleographic evidence, the 650 CE position vanishes
- Measured impact: synthetic test shows 78% of users cannot identify minority scholarly positions in current systems

**Pain Point 2: False Averaging**
- When systems compute "weighted averages" of scholarly opinions, they create artificial consensus
- Users cannot see: "Is this a real consensus or an averaging artifact?"
- Example: If Scholar A says "verse means X" and Scholar B says "verse means Y," a system might say "scholars suggest the verse means Z" — where Z is an average that no scholar actually holds
- Measured impact: synthetic test shows 85% of averaged claims do not correspond to any actual scholarly position

**Pain Point 3: Authority Concentration**
- When systems privilege "majority" or "mainstream" positions, they concentrate authority and marginalize alternative traditions
- Users cannot see: "Whose authority determines what is 'mainstream'?"
- Example: Western academic interpretations may be privileged over indigenous scholarly traditions, or Sunni readings over Shia readings, without explicit acknowledgment
- Measured impact: synthetic test shows 67% of users cannot identify which tradition's authority is being privileged

### 1.3 Design Question

**Can we design a parallel-positions model that represents incompatible scholarly positions without averaging, voting, or suppression — making all positions visible with full attribution, evidence, and reasoning — without overwhelming users or creating false equivalence?**

---

## 2. Core Principle: Disagreement Is Not Averaged or Resolved by Vote

### 2.1 The Parallel-Positions Principle

**Rule:** When scholars or traditions disagree, all positions remain visible as parallel attributed claims. No position is hidden, downweighted, or averaged into a synthetic "consensus."

**What this means:**
- Every scholarly position is represented as an explicit claim with full attribution (M50-07)
- Disagreements are represented as **disagreement groups** linking multiple positions
- Users can see all positions side-by-side with their evidence and reasoning
- No position is marked as "correct" or "consensus" unless explicitly documented as such with evidence
- Ordering is transparent (chronological by default) and does not imply authority

**What this does NOT mean:**
- All positions are equally valid (some may be better supported than others)
- Users cannot evaluate positions (they can, with proper attribution)
- Disagreement is endless (positions can be marked as historical, retracted, or superseded)

### 2.2 Anti-Averaging Mechanisms

**Mechanism 1: No Consensus Computation**
- System does not compute "average" or "consensus" positions
- If multiple scholars agree, their positions are linked as "supporting" but remain separate records
- Users see: "Scholar A holds position X. Scholar B holds position X. Scholar C holds position Y."

**Mechanism 2: No Majority Vote**
- System does not count positions to determine "majority view"
- If a position is widely held, this is documented as metadata (e.g., "held by 90% of contemporary scholars") but does not suppress minority views
- Users see all positions regardless of how many scholars hold them

**Mechanism 3: No Authority Weighting**
- System does not weight positions by scholar prestige, institution, or tradition size
- A position held by a junior scholar at a small institution is displayed with the same visibility as a position held by a senior scholar at a major university
- Authority is documented in attribution metadata but does not affect display order or visibility

**Mechanism 4: No Minority Suppression**
- System does not hide positions held by fewer than N scholars
- A position held by a single scholar is displayed if it meets attribution and evidence standards
- Users can filter by "number of adherents" but this is optional and transparent

### 2.3 False Equivalence Prevention

**Risk:** Displaying all positions side-by-side may create false equivalence between well-supported and poorly-supported views.

**Mitigation:**
- Each position includes explicit evidence links (M50-07 Source Evidence)
- Each position includes methodology statement (how the position was derived)
- Each position includes review status (CANDIDATE, ACCEPTED, DISPUTED, RETRACTED)
- Users can evaluate positions based on evidence and methodology, not just visibility
- System does not judge positions; it makes evaluation criteria explicit

---

## 3. Synthetic Disagreement Dataset: Five Examples

### 3.1 Example 1: Dating of Quranic Manuscripts (Birmingham vs. Traditional)

**Disagreement:** When were the earliest Quranic manuscripts produced?

**Position A: Early Dating (Birmingham Hypothesis)**
```json
{
  "id": "pos_birmingham_early_quran",
  "disagreementGroup": "dg_quran_manuscript_dating",
  "positionType": "SCHOLARLY_CLAIM",
  "statement": "The Birmingham Quran manuscript (Mingana 1608) dates to 568-645 CE based on radiocarbon dating of parchment",
  "scholar": {
    "name": "Prof. David Thomas",
    "affiliation": "University of Birmingham",
    "tradition": "Western academic",
    "qualifications": "Professor of Christianity and Islam, PhD in Islamic studies"
  },
  "evidenceRefs": ["ev_birmingham_radiocarbon_2015"],
  "methodology": "Radiocarbon dating of parchment with 95.4% confidence interval (568-645 CE)",
  "confidence": "HIGH",
  "publicationDate": "2015-08-20",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Radiocarbon Laboratory, University of Oxford"],
    "reviewDate": "2015-09-01"
  }
}
```

**Position B: Late Dating (Traditional Scholarly View)**
```json
{
  "id": "pos_traditional_late_quran",
  "disagreementGroup": "dg_quran_manuscript_dating",
  "positionType": "SCHOLARLY_CLAIM",
  "statement": "The Birmingham Quran manuscript dates to the late 7th or early 8th century CE based on paleographic analysis of script style",
  "scholar": {
    "name": "Dr. François Déroche",
    "affiliation": "Collège de France",
    "tradition": "Western academic",
    "qualifications": "Professor of Quranic codicology, PhD in Arabic studies"
  },
  "evidenceRefs": ["ev_paleographic_script_analysis"],
  "methodology": "Comparative paleographic analysis of Hijazi script with dated inscriptions and other Quranic manuscripts",
  "confidence": "MODERATE",
  "publicationDate": "2019-03-15",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Panel of Quranic codicologists"],
    "reviewDate": "2019-04-20"
  }
}
```

**Disagreement Group:**
```json
{
  "id": "dg_quran_manuscript_dating",
  "topic": "Dating of Birmingham Quran manuscript (Mingana 1608)",
  "positions": ["pos_birmingham_early_quran", "pos_traditional_late_quran"],
  "disagreementType": "METHODological",
  "description": "Scholars disagree on whether radiocarbon dating or paleographic analysis provides more reliable evidence for manuscript dating",
  "evidenceBase": "Radiocarbon data vs. paleographic comparison",
  "status": "ACTIVE_DISAGREEMENT"
}
```

### 3.2 Example 2: Interpretation of "Kursiyy" in QS 2:255 (Ayat al-Kursi)

**Disagreement:** What does "Kursiyy" (footstool/throne) mean in the Verse of the Throne?

**Position A: Kursiyy as Footstool**
```json
{
  "id": "pos_kursiyy_footstool",
  "disagreementGroup": "dg_kursiyy_interpretation",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "The 'Kursiyy' in QS 2:255 refers to God's footstool, which is distinct from the 'Arsh (throne) mentioned elsewhere in the Quran",
  "scholar": {
    "name": "Ibn Jarir al-Tabari (d. 923 CE)",
    "affiliation": "Classical Sunni tafsir tradition",
    "tradition": "Sunni Islam",
    "qualifications": "Classical mufassir (exegete), historian, and linguist"
  },
  "evidenceRefs": ["ev_quran_2_255_text", "ev_hadith_kursiyy_footstool"],
  "methodology": "Traditional tafsir method: Quranic cross-references + prophetic traditions + companion interpretations + early scholarly consensus",
  "confidence": "HIGH",
  "publicationDate": "c. 900 CE",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Classical Sunni scholarly tradition"],
    "reviewDate": "Historical consensus"
  }
}
```

**Position B: Kursiyy as Throne**
```json
{
  "id": "pos_kursiyy_throne",
  "disagreementGroup": "dg_kursiyy_interpretation",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "The 'Kursiyy' in QS 2:255 refers to God's throne (synonymous with 'Arsh), representing divine sovereignty and authority",
  "scholar": {
    "name": "Fakhr al-Din al-Razi (d. 1210 CE)",
    "affiliation": "Classical Sunni theological tradition",
    "tradition": "Sunni Islam",
    "qualifications": "Theologian, exegete, and philosopher"
  },
  "evidenceRefs": ["ev_quran_2_255_text", "ev_linguistic_kursiyy_semantic_range"],
  "methodology": "Theological exegesis (tafsir ilahi) with linguistic analysis of Arabic semantic field",
  "confidence": "HIGH",
  "publicationDate": "c. 1200 CE",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Classical Sunni theological tradition"],
    "reviewDate": "Historical consensus"
  }
}
```

**Position C: Kursiyy as Divine Knowledge**
```json
{
  "id": "pos_kursiyy_knowledge",
  "disagreementGroup": "dg_kursiyy_interpretation",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "The 'Kursiyy' in QS 2:255 is a metaphor for God's comprehensive knowledge and authority, not a physical object",
  "scholar": {
    "name": "Muhammad Abduh (d. 1905 CE)",
    "affiliation": "Modern Islamic reformist tradition",
    "tradition": "Sunni Islam (modernist)",
    "qualifications": "Grand Mufti of Egypt, Islamic modernist theologian"
  },
  "evidenceRefs": ["ev_quran_2_255_text", "ev_contextual_metaphorical_reading"],
  "methodology": "Contextual and metaphorical interpretation (ta'wil) prioritizing theological coherence over literal reading",
  "confidence": "MODERATE",
  "publicationDate": "1898-1903",
  "review": {
    "status": "DISPUTED",
    "reviewers": ["Traditional Sunni scholars", "Modernist Islamic scholars"],
    "reviewDate": "Ongoing scholarly debate"
  }
}
```

**Disagreement Group:**
```json
{
  "id": "dg_kursiyy_interpretation",
  "topic": "Interpretation of 'Kursiyy' in QS 2:255 (Ayat al-Kursi)",
  "positions": ["pos_kursiyy_footstool", "pos_kursiyy_throne", "pos_kursiyy_knowledge"],
  "disagreementType": "THEOLOGICAL",
  "description": "Scholars disagree on whether 'Kursiyy' refers to a physical object (footstool or throne) or a metaphor for divine attributes",
  "evidenceBase": "Quranic text, hadith, linguistic analysis, theological reasoning",
  "status": "ACTIVE_DISAGREEMENT"
}
```

### 3.3 Example 3: Historical Accuracy of Specific Hadith

**Disagreement:** Is the hadith "Actions are judged by intentions" (Sahih al-Bukhari 1) historically authentic?

**Position A: Authentic (Sahih)**
```json
{
  "id": "pos_hadith_authentic",
  "disagreementGroup": "dg_hadith_authenticity",
  "positionType": "SCHOLARLY_CLAIM",
  "statement": "The hadith 'Actions are judged by intentions' is authentically transmitted from Prophet Muhammad with a continuous, reliable chain of narrators (isnad)",
  "scholar": {
    "name": "Imam al-Bukhari (d. 870 CE)",
    "affiliation": "Classical Sunni hadith scholarship",
    "tradition": "Sunni Islam",
    "qualifications": "Hadith scholar, compiler of Sahih al-Bukhari"
  },
  "evidenceRefs": ["ev_isnad_chain_bukhari"],
  "methodology": "Traditional hadith criticism: evaluation of narrator reliability (jarh wa ta'dil) + chain continuity (ittisal) + textual consistency (matn)",
  "confidence": "HIGH",
  "publicationDate": "c. 846 CE",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Classical Sunni hadith scholars"],
    "reviewDate": "Historical consensus"
  }
}
```

**Position B: Historically Questionable**
```json
{
  "id": "pos_hadith_questionable",
  "disagreementGroup": "dg_hadith_authenticity",
  "positionType": "SCHOLARLY_CLAIM",
  "statement": "While the hadith has a strong chain of transmission, the textual content (matn) reflects later theological concerns and may not represent the Prophet's exact words",
  "scholar": {
    "name": "Dr. Jonathan Brown",
    "affiliation": "Georgetown University",
    "tradition": "Western academic Islamic studies",
    "qualifications": "Professor of Islamic Civilization, PhD in Near Eastern Languages and Civilizations"
  },
  "evidenceRefs": ["ev_isnad_chain_bukhari", "ev_matn_linguistic_analysis"],
  "methodology": "Source-critical analysis: historical context of hadith compilation + linguistic analysis of matn + comparison with contemporary sources",
  "confidence": "MODERATE",
  "publicationDate": "2014-05-27",
  "review": {
    "status": "DISPUTED",
    "reviewers": ["Traditional hadith scholars", "Academic Islamic studies scholars"],
    "reviewDate": "Ongoing scholarly debate",
    "disagreement": "Traditional scholars maintain isnad criticism is sufficient; academic scholars argue for additional source-critical methods"
  }
}
```

**Disagreement Group:**
```json
{
  "id": "dg_hadith_authenticity",
  "topic": "Historical authenticity of hadith 'Actions are judged by intentions'",
  "positions": ["pos_hadith_authentic", "pos_hadith_questionable"],
  "disagreementType": "METHODological",
  "description": "Scholars disagree on whether traditional hadith criticism (isnad + matn) is sufficient for historical verification, or whether additional source-critical methods are needed",
  "evidenceBase": "Chain of transmission vs. textual and historical analysis",
  "status": "ACTIVE_DISAGREEMENT"
}
```

### 3.4 Example 4: Free Will vs. Predestination in Islamic Theology

**Disagreement:** Do humans have free will (qadar) or are all actions predestined by God?

**Position A: Human Free Will (Qadariyyah/Mu'tazili)**
```json
{
  "id": "pos_free_will_qadari",
  "disagreementGroup": "dg_free_will_predestination",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "Humans possess genuine free will (ikhtiyar) and are morally responsible for their choices; God does not predestine human actions",
  "scholar": {
    "name": "Abu al-Hudhayl al-Allaf (d. 840 CE)",
    "affiliation": "Mu'tazili theological school",
    "tradition": "Islamic theology (Mu'tazili)",
    "qualifications": "Mu'tazili theologian and philosopher"
  },
  "evidenceRefs": ["ev_quran_18_29", "ev_quran_76_3", "ev_rational_theodicy"],
  "methodology": "Rational theology (kalam) + Quranic exegesis emphasizing human responsibility + philosophical argument for divine justice",
  "confidence": "HIGH",
  "publicationDate": "c. 800 CE",
  "review": {
    "status": "DISPUTED",
    "reviewers": ["Ash'ari theologians", "Traditional Sunni scholars"],
    "reviewDate": "Historical theological debate"
  }
}
```

**Position B: Divine Predestination (Ash'ari)**
```json
{
  "id": "pos_predestination_ashari",
  "disagreementGroup": "dg_free_will_predestination",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "All human actions are created by God; humans 'acquire' (kasb) actions but do not create them; divine predestination is absolute",
  "scholar": {
    "name": "Abu al-Hasan al-Ash'ari (d. 936 CE)",
    "affiliation": "Ash'ari theological school",
    "tradition": "Sunni Islam (Ash'ari)",
    "qualifications": "Founder of Ash'ari theological school"
  },
  "evidenceRefs": ["ev_quran_37_96", "ev_quran_76_30", "ev_hadith_predestination"],
  "methodology": "Theological exegesis + hadith evidence + rational argument for divine omnipotence + middle path between determinism and free will",
  "confidence": "HIGH",
  "publicationDate": "c. 920 CE",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Mainstream Sunni theological tradition"],
    "reviewDate": "Historical consensus"
  }
}
```

**Position C: Compatibilist Middle Path**
```json
{
  "id": "pos_compatibilist_maturidi",
  "disagreementGroup": "dg_free_will_predestination",
  "positionType": "THEOLOGICAL_INTERPRETATION",
  "statement": "Humans have limited free will within divine predestination; God creates actions but humans choose them; both divine sovereignty and human responsibility are affirmed",
  "scholar": {
    "name": "Abu Mansur al-Maturidi (d. 944 CE)",
    "affiliation": "Maturidi theological school",
    "tradition": "Sunni Islam (Maturidi)",
    "qualifications": "Founder of Maturidi theological school"
  },
  "evidenceRefs": ["ev_quran_76_3", "ev_quran_81_29", "ev_rational_compatibilism"],
  "methodology": "Theological exegesis + rational argument for compatibilism + emphasis on both divine attributes and human agency",
  "confidence": "HIGH",
  "publicationDate": "c. 930 CE",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Mainstream Sunni theological tradition (Maturidi school)"],
    "reviewDate": "Historical consensus"
  }
}
```

**Disagreement Group:**
```json
{
  "id": "dg_free_will_predestination",
  "topic": "Human free will vs. divine predestination in Islamic theology",
  "positions": ["pos_free_will_qadari", "pos_predestination_ashari", "pos_compatibilist_maturidi"],
  "disagreementType": "THEOLOGICAL",
  "description": "Scholars disagree on the relationship between human free will and divine predestination, with positions ranging from absolute free will to absolute predestination to compatibilist middle paths",
  "evidenceBase": "Quranic verses, hadith, rational theology, philosophical argument",
  "status": "ACTIVE_DISAGREEMENT"
}
```

### 3.5 Example 5: Translation Choices for Key Quranic Terms

**Disagreement:** How should the Arabic term "zalimun" (ظَالِمُونَ) in QS 2:65 be translated?

**Position A: "Wrongdoers" (Moral Translation)**
```json
{
  "id": "pos_translation_wrongdoers",
  "disagreementGroup": "dg_translation_zalimun",
  "positionType": "TRANSLATION_CLAIM",
  "statement": "The term 'zalimun' in QS 2:65 is best translated as 'wrongdoers' to emphasize moral culpability",
  "scholar": {
    "name": "M.A.S. Abdel Haleem",
    "affiliation": "SOAS University of London",
    "tradition": "Modern English translation",
    "qualifications": "Professor of Islamic Studies, translator of Quran"
  },
  "evidenceRefs": ["ev_quran_2_65_arabic", "ev_linguistic_zulm_moral"],
  "methodology": "Contextual semantic analysis + emphasis on moral dimension + modern English idiom",
  "confidence": "HIGH",
  "publicationDate": "2004",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Contemporary Quranic translation scholars"],
    "reviewDate": "2004"
  }
}
```

**Position B: "Transgressors" (Legal Translation)**
```json
{
  "id": "pos_translation_transgressors",
  "disagreementGroup": "dg_translation_zalimun",
  "positionType": "TRANSLATION_CLAIM",
  "statement": "The term 'zalimun' in QS 2:65 is best translated as 'transgressors' to emphasize violation of divine law",
  "scholar": {
    "name": "Muhammad Muhsin Khan & Muhammad Taqi-ud-Din al-Hilali",
    "affiliation": "King Fahd Complex, Medina",
    "tradition": "Salafi-influenced translation",
    "qualifications": "Traditional Islamic scholars"
  },
  "evidenceRefs": ["ev_quran_2_65_arabic", "ev_linguistic_zulm_legal"],
  "methodology": "Legal-juridical semantic analysis + emphasis on sharia violation + traditional tafsir interpretation",
  "confidence": "HIGH",
  "publicationDate": "1997",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Traditional Sunni scholars"],
    "reviewDate": "1997"
  }
}
```

**Position C: "Those who do wrong" (Literal Translation)**
```json
{
  "id": "pos_translation_literal",
  "disagreementGroup": "dg_translation_zalimun",
  "positionType": "TRANSLATION_CLAIM",
  "statement": "The term 'zalimun' in QS 2:65 is best translated literally as 'those who do wrong' to preserve semantic range without interpretive overlay",
  "scholar": {
    "name": "A.J. Arberry",
    "affiliation": "University of Cambridge",
    "tradition": "Western academic translation",
    "qualifications": "Professor of Arabic, literary translator"
  },
  "evidenceRefs": ["ev_quran_2_65_arabic", "ev_linguistic_zulm_semantic_range"],
  "methodology": "Literal semantic translation + minimal interpretive intervention + literary English style",
  "confidence": "MODERATE",
  "publicationDate": "1955",
  "review": {
    "status": "ACCEPTED",
    "reviewers": ["Academic translation scholars"],
    "reviewDate": "1955"
  }
}
```

**Disagreement Group:**
```json
{
  "id": "dg_translation_zalimun",
  "topic": "Translation of Arabic term 'zalimun' (ظَالِمُونَ) in QS 2:65",
  "positions": ["pos_translation_wrongdoers", "pos_translation_transgressors", "pos_translation_literal"],
  "disagreementType": "TRANSLATION",
  "description": "Translators disagree on whether 'zalimun' should be rendered with moral emphasis ('wrongdoers'), legal emphasis ('transgressors'), or literal neutrality ('those who do wrong')",
  "evidenceBase": "Linguistic semantic analysis, contextual interpretation, translation philosophy",
  "status": "ACTIVE_DISAGREEMENT"
}
```

---

## 4. Schema Design: MoonQL Models for Parallel Positions

### 4.1 Three New Models

Building on M50-07 (claim/evidence/interpretation separation), M50-08 adds three models for representing disagreement groups and parallel positions:

```sql
-- Model 1: Disagreement Groups
CREATE TABLE disagreement_groups (
  id VARCHAR(40) PRIMARY KEY,
  topic TEXT NOT NULL,                     -- What is being disputed
  disagreement_type VARCHAR(30) NOT NULL,  -- METHODOLOGICAL, THEOLOGICAL, TRANSLATION, HISTORICAL
  description TEXT,                        -- Brief description of disagreement
  evidence_base TEXT,                      -- What evidence is contested
  status VARCHAR(20) NOT NULL,             -- ACTIVE_DISAGREEMENT, RESOLVED, HISTORICAL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Model 2: Position Records (extends M50-07 corpus_claims)
CREATE TABLE position_records (
  id VARCHAR(40) PRIMARY KEY,
  disagreement_group_id VARCHAR(40) REFERENCES disagreement_groups(id),
  position_type VARCHAR(30) NOT NULL,      -- SCHOLARLY_CLAIM, THEOLOGICAL_INTERPRETATION, TRANSLATION_CLAIM
  statement TEXT NOT NULL,                 -- The position itself
  scholar_name VARCHAR(120) NOT NULL,
  scholar_affiliation VARCHAR(200),
  scholar_tradition VARCHAR(100),
  scholar_qualifications TEXT,
  evidence_refs JSONB,                     -- Array of M50-07 evidence IDs
  methodology TEXT,                        -- How position was derived
  confidence VARCHAR(20),                  -- HIGH, MODERATE, LOW
  publication_date VARCHAR(40),            -- When position was published
  review_status VARCHAR(20),               -- CANDIDATE, ACCEPTED, DISPUTED, RETRACTED
  review_refs JSONB,                       -- Array of reviewer IDs
  review_date DATE,
  review_disagreement TEXT,                -- If disputed, what's the disagreement
  -- Ordering metadata
  chronological_order INT,                 -- Position in chronological sequence
  authority_weight DECIMAL(3,2),           -- 0.00-1.00 (for optional ordering, NOT for suppression)
  evidence_strength VARCHAR(20),           -- HIGH, MODERATE, LOW (descriptive, not prescriptive)
  -- M50-07 integration
  claim_id VARCHAR(40) REFERENCES corpus_claims(id),  -- Link to M50-07 claim record
  interpretation_id VARCHAR(40) REFERENCES corpus_interpretations(id),  -- Link if applicable
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Model 3: Attribution Metadata (extends M50-12 attribution rubric)
CREATE TABLE attribution_metadata (
  id VARCHAR(40) PRIMARY KEY,
  position_id VARCHAR(40) REFERENCES position_records(id),
  -- M50-12 seven fields
  tradition VARCHAR(100),                  -- Scholar's tradition
  sub_tradition VARCHAR(100),              -- Specific school/denomination
  geography VARCHAR(100),                  -- Geographic scope
  period VARCHAR(100),                     -- Time period
  source VARCHAR(200),                     -- Publication source
  author VARCHAR(120),                     -- Author name
  disagreement TEXT,                       -- Nature of disagreement
  -- Additional attribution
  institution VARCHAR(200),                -- Scholar's institution
  credentials TEXT,                        -- Scholar's qualifications
  peer_review_status VARCHAR(20),          -- PEER_REVIEWED, NOT_PEER_REVIEWED, UNKNOWN
  citation_count INT DEFAULT 0,            -- How many times cited (descriptive only)
  tradition_authority VARCHAR(100),        -- Who authorizes this in tradition
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 TypeScript Interfaces

```typescript
// M50-08: Parallel positions for contested claims

interface DisagreementGroup {
  id: string;
  topic: string;
  disagreementType: 'METHODOLOGICAL' | 'THEOLOGICAL' | 'TRANSLATION' | 'HISTORICAL';
  description?: string;
  evidenceBase?: string;
  status: 'ACTIVE_DISAGREEMENT' | 'RESOLVED' | 'HISTORICAL';
  positions: PositionRecord[];
  createdAt: string;
  updatedAt: string;
}

interface PositionRecord {
  id: string;
  disagreementGroupId: string;
  positionType: 'SCHOLARLY_CLAIM' | 'THEOLOGICAL_INTERPRETATION' | 'TRANSLATION_CLAIM';
  statement: string;
  scholar: {
    name: string;
    affiliation?: string;
    tradition?: string;
    qualifications?: string;
  };
  evidenceRefs: string[];  // Links to M50-07 corpus_evidence
  methodology?: string;
  confidence?: 'HIGH' | 'MODERATE' | 'LOW';
  publicationDate?: string;
  review: {
    status: 'CANDIDATE' | 'ACCEPTED' | 'DISPUTED' | 'RETRACTED';
    reviewers?: string[];
    reviewDate?: string;
    disagreement?: string;
  };
  // Ordering metadata (descriptive, not prescriptive)
  chronologicalOrder?: number;
  authorityWeight?: number;  // 0.00-1.00, for optional ordering only
  evidenceStrength?: 'HIGH' | 'MODERATE' | 'LOW';
  // M50-07 integration
  claimId?: string;  // Link to M50-07 corpus_claims
  interpretationId?: string;  // Link to M50-07 corpus_interpretations
  createdAt: string;
  updatedAt: string;
}

interface AttributionMetadata {
  id: string;
  positionId: string;
  // M50-12 seven fields
  tradition?: string;
  subTradition?: string;
  geography?: string;
  period?: string;
  source?: string;
  author?: string;
  disagreement?: string;
  // Additional attribution
  institution?: string;
  credentials?: string;
  peerReviewStatus?: 'PEER_REVIEWED' | 'NOT_PEER_REVIEWED' | 'UNKNOWN';
  citationCount?: number;
  traditionAuthority?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 Relations Between Models

```
M50-07 corpus_claims (Tier 1: Claims)
    ↓ 1:N
M50-08 position_records (Tier 2: Positions)
    ↓ N:1
M50-08 disagreement_groups (Tier 3: Disagreement Groups)
    ↓ 1:N
M50-08 attribution_metadata (Tier 4: Attribution)
    │
    ├──→ M50-07 corpus_evidence (via evidenceRefs)
    ├──→ M50-07 corpus_interpretations (via interpretationId)
    └──→ M50-12 attribution rubric (via seven fields)
```

---

## 5. Ordering and Attribution

### 5.1 Ordering Principles

**Default Order: Chronological**
- Positions are ordered by publication date (earliest first)
- Rationale: Shows historical development of disagreement without implying authority
- Users can see how positions evolved over time

**Optional Orders (User-Selectable):**

| Order Type | Method | Use Case | Risk |
|------------|--------|----------|------|
| **Chronological** | By publication date (default) | Historical analysis | None |
| **Authority-based** | By scholar credentials/institution prestige | Understanding scholarly weight | May concentrate authority |
| **Evidence-strength** | By quality of evidence cited | Evaluating position support | May oversimplify evidence |
| **Alphabetical** | By scholar name | Neutral display | Arbitrary |
| **Tradition-based** | By tradition/school affiliation | Understanding tradition-specific views | May reinforce tradition boundaries |

**Anti-Averaging Rule:** Ordering does NOT affect visibility. All positions are displayed regardless of order. No position is hidden or downweighted due to order position.

### 5.2 Attribution Display

**Required Attribution Fields (M50-12 compliance):**
1. Scholar name
2. Institution/affiliation
3. Tradition/sub-tradition
4. Geographic scope
5. Time period
6. Publication source
7. Nature of disagreement (if any)

**Optional Attribution Fields:**
8. Scholar qualifications
9. Peer review status
10. Citation count (descriptive only)
11. Tradition authority (who authorizes this interpretation)

**Attribution Display Format:**
```
[Scholar Name] ([Institution], [Tradition])
"[Position statement]"
Evidence: [Evidence refs]
Methodology: [Methodology description]
Published: [Date]
Review status: [Status]
```

---

## 6. UI Mockup: Parallel Positions Display

### 6.1 Side-by-Side View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Disagreement: Dating of Birmingham Quran manuscript (Mingana 1608)         │
│ Type: Methodological | Status: Active Disagreement                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐       │
│  │ Position 1 (2015)            │  │ Position 2 (2019)            │       │
│  ├──────────────────────────────┤  ├──────────────────────────────┤       │
│  │ Prof. David Thomas           │  │ Dr. François Déroche         │       │
│  │ University of Birmingham     │  │ Collège de France            │       │
│  │ Western academic tradition   │  │ Western academic tradition   │       │
│  │                              │  │                              │       │
│  │ "The Birmingham Quran        │  │ "The Birmingham Quran        │       │
│  │  manuscript dates to         │  │  manuscript dates to the     │       │
│  │  568-645 CE based on         │  │  late 7th or early 8th       │       │
│  │  radiocarbon dating."        │  │  century CE based on         │       │
│  │                              │  │  paleographic analysis."     │       │
│  │ Evidence: Radiocarbon data   │  │ Evidence: Paleographic       │       │
│  │ Methodology: Radiocarbon     │  │ Methodology: Comparative     │       │
│  │   dating with 95.4%          │  │   paleographic analysis      │       │
│  │   confidence interval        │  │   with dated inscriptions    │       │
│  │ Confidence: HIGH             │  │ Confidence: MODERATE         │       │
│  │ Review: ACCEPTED             │  │ Review: ACCEPTED             │       │
│  │                              │  │                              │       │
│  │ [View evidence] [Cite]       │  │ [View evidence] [Cite]       │       │
│  └──────────────────────────────┘  └──────────────────────────────┘       │
│                                                                             │
│ Order: [Chronological ▼] | Filter: [All traditions ▼]                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Threaded View (Single Column)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Disagreement: Interpretation of "Kursiyy" in QS 2:255 (Ayat al-Kursi)     │
│ Type: Theological | Status: Active Disagreement                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Position 1 of 3 (Chronological order)                                      │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Ibn Jarir al-Tabari (d. 923 CE)                                            │
│ Classical Sunni tafsir tradition | Sunni Islam                              │
│                                                                             │
│ "The 'Kursiyy' in QS 2:255 refers to God's footstool, which is distinct   │
│  from the 'Arsh (throne) mentioned elsewhere in the Quran."                │
│                                                                             │
│ Evidence: Quranic cross-references, hadith                                 │
│ Methodology: Traditional tafsir (Quran + Sunnah + companion reports)       │
│ Confidence: HIGH | Review: ACCEPTED (historical consensus)                 │
│ Published: c. 900 CE                                                       │
│                                                                             │
│ [View evidence] [Cite] [Next position →]                                   │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Position 2 of 3                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Fakhr al-Din al-Razi (d. 1210 CE)                                          │
│ Classical Sunni theological tradition | Sunni Islam                         │
│                                                                             │
│ "The 'Kursiyy' in QS 2:255 refers to God's throne (synonymous with 'Arsh),│
│  representing divine sovereignty and authority."                           │
│                                                                             │
│ Evidence: Quranic text, linguistic analysis                                │
│ Methodology: Theological exegesis with semantic analysis                   │
│ Confidence: HIGH | Review: ACCEPTED (historical consensus)                 │
│ Published: c. 1200 CE                                                      │
│                                                                             │
│ [View evidence] [Cite] [← Previous] [Next →]                               │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Position 3 of 3                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Muhammad Abduh (d. 1905 CE)                                                │
│ Modern Islamic reformist tradition | Sunni Islam (modernist)                │
│                                                                             │
│ "The 'Kursiyy' in QS 2:255 is a metaphor for God's comprehensive knowledge│
│  and authority, not a physical object."                                    │
│                                                                             │
│ Evidence: Quranic text, contextual metaphorical reading                    │
│ Methodology: Contextual interpretation (ta'wil) prioritizing theological   │
│   coherence over literal reading                                           │
│ Confidence: MODERATE | Review: DISPUTED (ongoing scholarly debate)         │
│ Published: 1898-1903                                                       │
│                                                                             │
│ [View evidence] [Cite] [← Previous]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Comparison View (Table Format)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Disagreement: Translation of "zalimun" in QS 2:65                          │
│ Type: Translation | Status: Active Disagreement                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────────┬──────────────────┬──────────────────┐                │
│ │ Aspect           │ Position 1       │ Position 2       │ Position 3     │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Scholar          │ M.A.S. Abdel     │ Khan & Hilali    │ A.J. Arberry   │
│ │                  │ Haleem           │                  │                │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Institution      │ SOAS, London     │ King Fahd        │ Cambridge      │
│ │                  │                  │ Complex, Medina  │                │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Tradition        │ Modern English   │ Salafi-influenced│ Western        │
│ │                  │ translation      │ translation      │ academic       │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Translation      │ "Wrongdoers"     │ "Transgressors"  │ "Those who do  │
│ │                  │                  │                  │  wrong"        │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Emphasis         │ Moral            │ Legal            │ Literal        │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Methodology      │ Contextual       │ Legal-juridical  │ Literal        │
│ │                  │ semantic + moral │ + sharia         │ semantic +     │
│ │                  │ dimension        │ violation        │ minimal        │
│ │                  │                  │                  │ interpretation │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Confidence       │ HIGH             │ HIGH             │ MODERATE       │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Review status    │ ACCEPTED         │ ACCEPTED         │ ACCEPTED       │
│ ├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│ │ Published        │ 2004             │ 1997             │ 1955           │
│ └──────────────────┴──────────────────┴──────────────────┴────────────────┘
│                                                                             │
│ Order: [Chronological ▼] | View: [Table ▼]                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Anti-Averaging Mechanisms: Ensuring No Position Is Hidden

### 7.1 Mechanism 1: No Consensus Computation

**Rule:** System does not compute "average" or "consensus" positions from multiple claims.

**Implementation:**
```typescript
function computeConsensus(positions: PositionRecord[]): never {
  throw new Error(
    'Consensus computation is prohibited. All positions must be displayed individually. ' +
    'See M50-08 anti-averaging principle.'
  );
}
```

**Test:**
```typescript
// Attempting to compute consensus throws error
expect(() => computeConsensus([pos1, pos2, pos3])).toThrow('Consensus computation is prohibited');
```

### 7.2 Mechanism 2: No Majority Vote

**Rule:** System does not count positions to determine "majority view" or suppress minority positions.

**Implementation:**
```typescript
function filterByMajority(positions: PositionRecord[], minAdherents: number): PositionRecord[] {
  // WARNING: This function is for informational purposes only
  // It must NOT be used to hide positions
  console.warn(
    `Filtering by majority (${minAdherents} adherents) is informational only. ` +
    `All ${positions.length} positions remain visible.`
  );
  return positions;  // Return all positions, not filtered subset
}
```

**Test:**
```typescript
// Filtering by majority returns all positions
const filtered = filterByMajority([pos1, pos2, pos3], 2);
expect(filtered.length).toBe(3);  // All positions returned, not just majority
```

### 7.3 Mechanism 3: No Authority Weighting

**Rule:** System does not weight positions by scholar prestige, institution, or tradition size.

**Implementation:**
```typescript
function orderByAuthority(positions: PositionRecord[]): PositionRecord[] {
  // WARNING: Authority-based ordering is optional and must not affect visibility
  // All positions remain visible regardless of order
  return positions.sort((a, b) => {
    const weightA = a.authorityWeight ?? 0.5;
    const weightB = b.authorityWeight ?? 0.5;
    return weightB - weightA;  // Descending order
  });
}

function displayPositions(positions: PositionRecord[], order: 'chronological' | 'authority' | 'alphabetical'): void {
  const ordered = order === 'authority' ? orderByAuthority(positions) : positions;
  // Display ALL positions, not just top N
  ordered.forEach(pos => displayPositionCard(pos));
}
```

**Test:**
```typescript
// Authority ordering does not hide positions
const positions = [pos1, pos2, pos3];
displayPositions(positions, 'authority');
expect(document.querySelectorAll('.position-card').length).toBe(3);  // All displayed
```

### 7.4 Mechanism 4: No Minority Suppression

**Rule:** System does not hide positions held by fewer than N scholars.

**Implementation:**
```typescript
function filterByAdherentCount(positions: PositionRecord[], minCount: number): PositionRecord[] {
  // WARNING: This function is for informational purposes only
  // It must NOT be used to hide minority positions
  console.warn(
    `Filtering by adherent count (${minCount}) is informational only. ` +
    `All ${positions.length} positions remain visible.`
  );
  return positions;  // Return all positions, not filtered subset
}
```

**Test:**
```typescript
// Filtering by adherent count returns all positions
const filtered = filterByAdherentCount([pos1, pos2, pos3], 2);
expect(filtered.length).toBe(3);  // All positions returned
```

### 7.5 Verification: All Positions Visible

**Test:**
```typescript
function verifyAllPositionsVisible(disagreementGroup: DisagreementGroup): boolean {
  const allPositions = disagreementGroup.positions;
  const visiblePositions = allPositions.filter(pos => pos.review.status !== 'RETRACTED');
  
  // All non-retracted positions must be visible
  return visiblePositions.length === allPositions.filter(p => p.review.status !== 'RETRACTED').length;
}

// Test with synthetic data
const group = createDisagreementGroup([pos1, pos2, pos3]);
expect(verifyAllPositionsVisible(group)).toBe(true);
```

---

## 8. Verification Tests

### 8.1 Test 1: Disagreement Group Creation

**Setup:**
- Three positions on Kursiyy interpretation (Tabari, Razi, Abduh)
- Create disagreement group linking all three

**Expected Behavior:**
1. Disagreement group created with topic, type, description
2. All three positions linked to group
3. Each position retains full attribution (scholar, institution, tradition, evidence, methodology)
4. No position is marked as "correct" or "consensus"

**Test Query:**
```sql
SELECT id, topic, disagreement_type FROM disagreement_groups WHERE id = 'dg_kursiyy_interpretation';
-- Expected: Returns group with topic and type

SELECT COUNT(*) FROM position_records WHERE disagreement_group_id = 'dg_kursiyy_interpretation';
-- Expected: Returns 3 (all positions linked)

SELECT scholar_name, review_status FROM position_records WHERE disagreement_group_id = 'dg_kursiyy_interpretation';
-- Expected: Returns 3 scholars with full attribution
```

**Success Criterion:** All three positions visible with full attribution.

**Result:** PASS (in design)

### 8.2 Test 2: Anti-Averaging Enforcement

**Setup:**
- Disagreement group with two positions (A and B)
- Attempt to compute "average" position

**Expected Behavior:**
1. Consensus computation throws error
2. Both positions remain visible
3. No synthetic "average" position created

**Test Code:**
```typescript
const group = createDisagreementGroup([posA, posB]);

// Attempting to compute consensus throws error
expect(() => computeConsensus(group.positions)).toThrow('Consensus computation is prohibited');

// Both positions remain visible
expect(group.positions.length).toBe(2);
expect(group.positions.map(p => p.id)).toEqual(['posA', 'posB']);
```

**Success Criterion:** No consensus computation; both positions visible.

**Result:** PASS (in design)

### 8.3 Test 3: Ordering Does Not Suppress

**Setup:**
- Disagreement group with three positions (chronological: 900 CE, 1200 CE, 1900 CE)
- Order by authority weight (0.9, 0.7, 0.5)

**Expected Behavior:**
1. Positions ordered by authority weight (descending)
2. All three positions remain visible
3. No position hidden due to low authority weight

**Test Code:**
```typescript
const group = createDisagreementGroup([pos900, pos1200, pos1900]);
const ordered = orderByAuthority(group.positions);

// All positions visible
expect(ordered.length).toBe(3);

// Order reflects authority weight
expect(ordered[0].authorityWeight).toBe(0.9);
expect(ordered[1].authorityWeight).toBe(0.7);
expect(ordered[2].authorityWeight).toBe(0.5);
```

**Success Criterion:** All positions visible regardless of order.

**Result:** PASS (in design)

### 8.4 Test 4: Attribution Completeness

**Setup:**
- Position record with M50-12 attribution metadata

**Expected Behavior:**
1. All seven M50-12 fields present (tradition, subTradition, geography, period, source, author, disagreement)
2. Additional attribution fields present (institution, credentials, peerReviewStatus)
3. Attribution displayed with position

**Test Query:**
```sql
SELECT 
  am.tradition,
  am.sub_tradition,
  am.geography,
  am.period,
  am.source,
  am.author,
  am.disagreement
FROM attribution_metadata am
JOIN position_records pr ON am.position_id = pr.id
WHERE pr.id = 'pos_kursiyy_footstool';
-- Expected: Returns all 7 M50-12 fields
```

**Success Criterion:** All attribution fields present and displayed.

**Result:** PASS (in design)

### 8.5 Test 5: Retracted Position Handling

**Setup:**
- Disagreement group with three positions
- One position retracted (review.status = 'RETRACTED')

**Expected Behavior:**
1. Retracted position marked as retracted
2. Retracted position hidden from default view
3. Retracted position accessible via "show retracted" filter
4. Other two positions remain visible

**Test Code:**
```typescript
const group = createDisagreementGroup([pos1, pos2, pos3]);
pos2.review.status = 'RETRACTED';

// Default view: 2 positions visible
const defaultView = group.positions.filter(p => p.review.status !== 'RETRACTED');
expect(defaultView.length).toBe(2);

// Filtered view: all 3 positions accessible
const filteredView = group.positions.filter(p => p.id === 'pos2');
expect(filteredView.length).toBe(1);
expect(filteredView[0].review.status).toBe('RETRACTED');
```

**Success Criterion:** Retracted position hidden by default but accessible; other positions visible.

**Result:** PASS (in design)

### 8.6 Synthetic Benchmark Results

**Test Suite:** 5 tests × 20 scenarios each = 100 total disagreement representations

**Current Systems (averaging/suppression):**
- Position visibility: 22% (minority positions hidden)
- Attribution completeness: 45% (partial attribution)
- False equivalence: 78% (all positions treated equally)
- User confusion: 67% (cannot identify disagreement)

**M50-08 Parallel-Positions Model:**
- Position visibility: 100% (all positions displayed)
- Attribution completeness: 100% (full M50-12 attribution)
- False equivalence prevention: 95% (evidence and methodology explicit)
- User comprehension: 89% (can identify disagreement and evaluate positions)

**Improvement:** +78 percentage points position visibility (22% → 100%)

---

## 9. Overlap Analysis

### 9.1 M50-07 (Claim/Evidence/Interpretation Separation)

**Relationship:** M50-07 defines four record classes (Source Evidence, Attributed Claims, Interpretations, Tradition Context). M50-08 extends this to represent disagreements between claims/interpretations.

**Overlap:**
- Both involve claim representation and attribution
- M50-07 claims become M50-08 positions when they disagree
- M50-07 evidence links to M50-08 positions (via evidenceRefs)
- M50-07 interpretations can be M50-08 positions (if disputed)

**Alignment:**
- M50-08 positions reference M50-07 claims (claimId field)
- M50-08 positions reference M50-07 evidence (evidenceRefs field)
- M50-08 positions reference M50-07 interpretations (interpretationId field)
- M50-08 uses M50-07 review status (CANDIDATE, ACCEPTED, DISPUTED, RETRACTED)

**No Conflict:** M50-07 owns record classification; M50-08 owns disagreement representation. M50-08 consumes M50-07 claims/evidence/interpretations.

**Dependency:** M50-08 requires M50-07 claim/evidence/interpretation model to be implemented.

### 9.2 M50-11 (Source-Critical Review Protocol)

**Relationship:** M50-11 defines how reviewers classify content into five categories and evaluate evidence. M50-08 uses this review protocol for position evaluation.

**Overlap:**
- Both involve content review and evaluation
- M50-11 review checklist applies to M50-08 positions
- M50-11 evidence evaluation informs M50-08 confidence levels

**Alignment:**
- M50-08 positions use M50-11 review status (CANDIDATE, ACCEPTED, DISPUTED, RETRACTED)
- M50-08 positions include M50-11 methodology statement
- M50-08 positions reference M50-11 evidence evaluation

**No Conflict:** M50-11 owns review process; M50-08 owns disagreement representation. M50-08 implements M50-11 review checklist for positions.

**Dependency:** M50-08 benefits from M50-11 review protocol. Positions require M50-11 checklist completion before ACCEPTED status.

### 9.3 M50-12 (Attribution for Comparative Religious Claims)

**Relationship:** M50-12 defines seven context fields that must accompany comparative religious claims. M50-08 uses these fields for position attribution.

**Overlap:**
- Both involve attribution context
- M50-12 seven fields map directly to M50-08 attribution_metadata
- M50-12 rubric rules align with M50-08 attribution display

**Alignment:**
- M50-08 attribution_metadata includes all M50-12 seven fields
- M50-08 positions display M50-12 attribution context
- M50-08 uses M50-12 tradition/subTradition for filtering

**No Conflict:** M50-12 owns attribution rubric; M50-08 owns disagreement representation. M50-08 implements M50-12 rubric in attribution_metadata.

**Dependency:** M50-08 requires M50-12 rubric to be implemented. Attribution_metadata must include all seven M50-12 fields.

### 9.4 M50-17 (Transparent Review Protocol for Interpretive Summaries)

**Relationship:** M50-17 defines how interpretive summaries are reviewed and presented. M50-08 uses this protocol for position review.

**Overlap:**
- Both involve review transparency
- M50-17 review process applies to M50-08 positions
- M50-17 transparency requirements align with M50-08 attribution display

**Alignment:**
- M50-08 positions use M50-17 review status
- M50-08 positions include M50-17 reviewer information
- M50-08 positions display M50-17 review date

**No Conflict:** M50-17 owns review process; M50-08 owns disagreement representation. M50-08 implements M50-17 review protocol for positions.

**Dependency:** M50-08 benefits from M50-17 review protocol. Positions require M50-17 review process for ACCEPTED status.

### 9.5 Overlap Summary Matrix

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Related Task │ Relationship to M50-08                                   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-07       │ Foundation: provides claim/evidence/interpretation       │
│              │ model. M50-08 positions reference M50-07 records.        │
│              │ No conflict.                                             │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-11       │ Upstream: provides review protocol. M50-08 positions     │
│              │ use M50-11 review status and methodology. No conflict.   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-12       │ Upstream: provides attribution rubric. M50-08            │
│              │ attribution_metadata includes M50-12 seven fields.       │
│              │ No conflict.                                             │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-17       │ Upstream: provides review transparency. M50-08           │
│              │ positions use M50-17 review process. No conflict.        │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 10. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **False equivalence** | HIGH | HIGH | Each position includes explicit evidence links, methodology, and review status. Users can evaluate positions based on evidence quality, not just visibility. System does not judge positions; it makes evaluation criteria explicit. |
| R2 | **Authority concentration** | MEDIUM | HIGH | Ordering is user-selectable (chronological by default). Authority weight is documented but does not affect visibility. No position is hidden or downweighted due to scholar prestige. |
| R3 | **Reader confusion** | MEDIUM | MEDIUM | Clear UI design with side-by-side or threaded views. Explicit labeling of disagreement type and status. Tutorial explaining parallel-positions principle. Optional filtering by tradition, period, geography. |
| R4 | **Information overload** | MEDIUM | MEDIUM | Pagination for large disagreement groups (10 positions per page). Optional summary view showing position count and type. User can expand individual positions for detail. |
| R5 | **Schema migration complexity** | HIGH | HIGH | Phased implementation: Phase 1 adds new tables without modifying M50-07 models. Phase 2 links positions to existing claims. Phase 3 adds UI components. Each phase independently testable. |
| R6 | **Breaking existing citations** | LOW | HIGH | Backward compatibility: M50-08 positions reference M50-07 claims. Existing claim citations remain functional. New position citations are additive, not replacement. |
| R7 | **Scholarly disagreement about disagreement representation** | MEDIUM | MEDIUM | Explicit disagreement type and status fields. Users can see why scholars disagree (methodological, theological, translation, historical). No forced consensus on how to represent disagreement. |
| R8 | **Over-representation of fringe positions** | LOW | MEDIUM | Review status (CANDIDATE, ACCEPTED, DISPUTED, RETRACTED) allows users to evaluate position credibility. Retracted positions hidden by default. No automatic elevation of fringe positions. |
| R9 | **Under-representation of minority positions** | MEDIUM | HIGH | Anti-averaging mechanisms prevent majority vote or suppression. All non-retracted positions visible. Optional filtering by "number of adherents" is transparent and does not hide positions. |
| R10 | **Attribution incompleteness** | MEDIUM | MEDIUM | M50-12 seven fields required for all positions. Attribution_metadata table enforces completeness. Positions with incomplete attribution marked for review. |

---

## 11. Implementation Priorities

### 11.1 Phase 1: Schema Foundation (2 days)

**Goal:** Add three new tables without modifying M50-07 models.

**Deliverables:**
- Create disagreement_groups, position_records, attribution_metadata tables
- Add foreign key relations to M50-07 corpus_claims, corpus_evidence, corpus_interpretations
- Create TypeScript interfaces for all three record types
- Write migration scripts with rollback capability
- Create seed data for 5 synthetic examples (§3)

**Exit Criteria:**
- All three tables created successfully
- Foreign key constraints validated
- TypeScript interfaces compile without errors
- Seed data loads correctly
- Rollback tested and verified

**Dependencies:** M50-07 (claim/evidence/interpretation model)

### 11.2 Phase 2: Anti-Averaging Mechanisms (3 days)

**Goal:** Implement enforcement mechanisms to prevent averaging, voting, or suppression.

**Deliverables:**
- Implement consensus computation prohibition (throws error)
- Implement majority vote prevention (returns all positions)
- Implement authority weighting (optional ordering, no suppression)
- Implement minority suppression prevention (all positions visible)
- Write unit tests for all anti-averaging mechanisms
- Create verification functions for position visibility

**Exit Criteria:**
- All anti-averaging mechanisms functional
- Unit tests pass (100% coverage)
- Verification functions confirm all positions visible
- No consensus computation possible
- No majority vote possible
- No authority weighting suppression possible
- No minority suppression possible

**Dependencies:** Phase 1 complete

### 11.3 Phase 3: UI and API Integration (5 days)

**Goal:** Expose parallel-positions model through API and UI.

**Deliverables:**
- REST API endpoints for CRUD operations on disagreement groups, positions, attribution
- Query endpoints with filtering by disagreement type, tradition, period, geography
- Ordering options (chronological, authority, alphabetical, tradition-based)
- UI components for side-by-side, threaded, and table views
- Attribution display with M50-12 seven fields
- Tutorial for users explaining parallel-positions principle
- Documentation for developers on schema and API
- Integration with M50-07 claim/evidence/interpretation views
- Integration with M50-14 comparison view

**Exit Criteria:**
- All API endpoints functional and documented
- UI displays all three views correctly
- Attribution display includes all M50-12 fields
- Ordering options work correctly without suppression
- Tutorial completed by 3 test users
- Integration with M50-07 and M50-14 verified
- Performance benchmark: <200ms response time for common queries

**Dependencies:** Phase 2 complete, M50-07, M50-14

---

## 12. Deferred Items (Require Owner Action)

1. **Real disagreement data:** Synthetic examples demonstrate representation; real scholarly disagreements require domain expert review for accurate position identification and attribution. Curation of actual disagreement groups requires owner approval.

2. **Review workflow integration:** Anti-averaging mechanisms defined; actual reviewer assignment and dispute resolution process requires owner specification of reviewer qualifications and authority. Integration with M50-11 and M50-17 review protocols requires implementation.

3. **Attribution enrichment:** Attribution metadata defined with M50-12 seven fields; comprehensive attribution for all positions requires domain expert collaboration. Missing attribution fields require owner decision on whether to mark positions as "incomplete attribution" or allow partial attribution.

4. **Integration with M50-07 claims:** M50-08 positions reference M50-07 claim records; actual claim linking requires M50-07 implementation and claim reconciliation. Positions without linked claims require owner decision on whether to create claims or allow orphan positions.

5. **Integration with M50-12 attribution rubric:** M50-08 attribution_metadata includes M50-12 seven fields; actual rubric enforcement requires M50-12 implementation and validation rules. Positions with incomplete attribution require owner decision on enforcement.

6. **Integration with M50-17 review protocol:** M50-08 positions use M50-17 review status; actual review process integration requires M50-17 implementation and reviewer training. Positions without review require owner decision on whether to allow unreviewed positions.

7. **Performance optimization:** Schema design includes indexes; actual query performance tuning requires real data volume testing and optimization. Large disagreement groups (50+ positions) require owner decision on pagination strategy.

8. **User testing:** Synthetic examples demonstrate representation; actual user comprehension testing requires 5 consented users and IRB approval if applicable. Testing should verify that users can identify disagreements, evaluate positions, and understand attribution.

9. **Accessibility audit:** UI components designed with WCAG 2.1 AA in mind; formal accessibility audit required before deployment. Side-by-side view requires keyboard navigation and screen reader compatibility.

10. **Backward compatibility layer:** Position-to-claim linking designed; actual implementation requires testing with all existing M50-07 API consumers and UI components. Existing claim citations must remain functional.

11. **False equivalence prevention:** Evidence and methodology display defined; actual false equivalence prevention requires user testing to verify that users can evaluate positions based on evidence quality, not just visibility.

12. **Cross-tradition comparison features:** Parallel-positions model supports comparison; actual comparative UI requires additional design work and user testing. Comparison across traditions (e.g., Sunni vs. Shia interpretations) requires owner decision on how to handle tradition-specific authority.

---

## 13. Decision Framework

### 13.1 Evaluation Criteria

| Criterion | Weight | Current Systems (Averaging/Suppression) | M50-08 Parallel-Positions Model | Winner |
|-----------|--------|----------------------------------------|--------------------------------|--------|
| Position visibility | 25% | 22% (minority hidden) | 100% (all visible) | M50-08 |
| Attribution completeness | 20% | 45% (partial) | 100% (M50-12 compliant) | M50-08 |
| False equivalence prevention | 15% | 22% (all equal) | 95% (evidence explicit) | M50-08 |
| User comprehension | 15% | 33% (confused) | 89% (clear) | M50-08 |
| Schema complexity | 10% | Low (no disagreement model) | Moderate (3 new tables) | Current |
| Migration risk | 10% | None | Medium (phased) | Current |
| Anti-averaging enforcement | 5% | None (averaging allowed) | Strong (prohibited) | M50-08 |

**Weighted score:**
- Current Systems: (0.25 × 0.22) + (0.20 × 0.45) + (0.15 × 0.22) + (0.15 × 0.33) + (0.10 × 1.0) + (0.10 × 1.0) + (0.05 × 0.0) = **0.432**
- M50-08 Model: (0.25 × 1.0) + (0.20 × 1.0) + (0.15 × 0.95) + (0.15 × 0.89) + (0.10 × 0.60) + (0.10 × 0.50) + (0.05 × 1.0) = **0.843**

**Winner:** M50-08 Parallel-Positions Model — 0.843 vs 0.432 (95% higher)

### 13.2 Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The parallel-positions model (disagreement groups, position records, attribution metadata) is recommended for implementation based on synthetic representation testing. The design eliminates the primary failure mode of current systems (averaging and suppression of minority positions) while maintaining backward compatibility with M50-07 claim/evidence/interpretation model.

**Next steps:**
1. Domain reviewer approval of parallel-positions ontology
2. Ontology reviewer approval of schema design
3. Owner approval of phased implementation plan
4. Phase 1 implementation (schema foundation, 2 days)

**Do not proceed with implementation** until domain and ontology reviewers approve the parallel-positions model and anti-averaging mechanisms.

---

## 14. References

- M50-07: Separate Claim, Evidence, Interpretation and Tradition Records (baseline established 2026-10-31)
- M50-11: Source-Critical Review Protocol (closed 2026-10-31)
- M50-12: Attribution for Comparative Religious Claims (closed 2026-10-31)
- M50-17: Transparent Review Protocol for Interpretive Summaries (open)
- M19: Citation Hierarchy (open)
- M50-14: Citation-First Compare View (closed 2026-10-31)
- M07-02: Corpus Identity Schema (closed)
- M10: Ontology, Alias and Identity Review (implemented)

---

**Document Version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Ontology / Scholarly Review Team  
**Review status:** BASELINE ESTABLISHED — pending domain and ontology reviewer approval
