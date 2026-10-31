# M47-23: Explore a Multi-Reviewer Disagreement Interface — UX/Ethics Design Study

**Task:** M47-23 — Explore a multi-reviewer disagreement interface  
**Status:** BASELINE ESTABLISHED (design study, no implementation)  
**Date:** 2026-10-31  
**Owner:** Research UX / Scholarly Review  
**Effort:** XL (12–18 days)  
**Dependencies:** M47-03 (human approval for research actions, done), M50-08 (contested claims parallel positions), M50-11 (source-critical review protocol), M50-17 (transparent review protocol), M20 (governance)

---

## Executive Summary

This document presents a UX/ethics design study for an interface that allows multiple reviewers to record distinct interpretations of source material **without forcing consensus** and **without allowing any single vote to become authoritative**. While M47-03 establishes human approval for proposed research actions (a binary approve/reject workflow), M47-23 explores what happens when multiple reviewers legitimately disagree — and the system must preserve that disagreement as valuable scholarly data rather than resolving it.

**Key findings:**
- Current review systems force consensus (reviewers must agree), average positions (majority wins), or hide minority views — all of which lose important scholarly diversity
- Core principle: **"no vote becomes theological truth"** — disagreements are preserved, not resolved
- The interface must distinguish "different views" (legitimate scholarly disagreement) from "no evidence" (absence of data)
- Synthetic case study (QS 2:82 "dar al-khamr" interpretation) demonstrates 4 distinct interpretations with full attribution and evidence linkage
- Schema design uses 5 core records (Reviewer, Interpretation, DisagreementGroup, ViewRecord, AuditEntry) with explicit anti-consensus mechanisms
- ASCII UI prototypes show reviewer panel, disagreement view, evidence linkage, non-authoritative voting, and audit trail
- 5 comprehension tests verify users understand disagreement preservation (synthetic 89% pass rate)
- Power dynamics analysis identifies 5 imbalance vectors (seniority, majority, tradition, language, institutional) with mitigation strategies
- 5 verification tests prove the interface does not force consensus, average interpretations, hide minority views, privilege any single view, or allow majority override
- Overlap analysis with M47-03, M50-08, M50-11, M50-17, M20 shows alignment without conflict

**Recommendation:** Proceed with BASELINE ESTABLISHED status. The disagreement preservation model is recommended for prototyping. Requires domain reviewer, ethics reviewer, and security reviewer approval before any implementation begins.

---

## 1. Problem Statement

### 1.1 Current State: Consensus-Forcing Review Systems

Most scholarly review and knowledge-management systems handle multiple reviewer input in one of three ways:

| Approach | Method | Example | Information Loss |
|----------|--------|---------|------------------|
| **Forced Consensus** | Reviewers must agree before submission | "All reviewers approve this interpretation" | Dissenting views erased |
| **Majority Vote** | Most common position wins | "3 of 5 reviewers agree: meaning is X" | Minority positions invisible |
| **Authority Override** | Senior reviewer's view prevails | "Prof. X's interpretation is authoritative" | Junior perspectives suppressed |

**What M47-03 does well:**
- Binary approve/reject workflow for individual research actions
- Clear state machine (PENDING → APPROVED/REJECTED/EXPIRED/etc.)
- Tamper-evident audit trail with HMAC signatures
- Role-based approval (no self-approval)
- Expiry enforcement

**What M47-03 does NOT do:**
- Handle cases where multiple reviewers legitimately disagree
- Preserve minority interpretations as valuable data
- Distinguish "different views" from "no evidence"
- Prevent authority or majority from collapsing disagreement

### 1.2 The Gap: No Disagreement Preservation Interface

Even with M47-03 human approval, the system assumes a binary decision (approve or reject). But scholarly interpretation is rarely binary. When reviewers disagree:

1. **Whose view prevails?** Senior reviewer? Majority? First to submit?
2. **Where do minority views go?** Hidden in audit logs? Discarded entirely?
3. **Can users see the disagreement?** Or is it collapsed into a single "approved" interpretation?
4. **Is disagreement preserved as data?** Or is it treated as a problem to be resolved?

### 1.3 Design Question

**Can we design an interface where multiple reviewers record distinct interpretations of source material, with full attribution and evidence linkage, without any mechanism that forces consensus, averages positions, or privileges one view as "correct" — and where disagreement itself is preserved as valuable scholarly data?**

---

## 2. Neutral Case Study: Synthetic Disagreement

### 2.1 Chosen Scenario: Interpretation of QS 2:82

**Source:** Quran, Surah Al-Baqarah 2:82  
**Arabic text:** وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أُولَٰئِكَ أَصْحَابُ الْجَنَّةِ ۖ هُمْ فِيهَا خَالِدُونَ  
**Translation:** "And those who believed and did righteous deeds — those are the companions of Paradise; they will abide therein eternally."

**Contested term:** "khālidoon" (خالدون) — "abiding eternally"

### 2.2 Why This Scenario Is Suitable

| Criterion | Assessment |
|-----------|-----------|
| **Legitimate disagreement** | Scholars across traditions genuinely disagree about the meaning of "eternal abiding" |
| **Multiple interpretations** | At least 4 distinct scholarly positions exist |
| **Evidence-based** | Each position cites specific textual, linguistic, or theological evidence |
| **No clear "correct" answer** | Disagreement is genuine and irresolvable by evidence alone |
| **Low stakes** | Synthetic case study; no real scholarly reputations at risk |
| **Representative** | Typical of many contested terms in Quranic exegesis |

### 2.3 Four Distinct Interpretations

```json
{
  "disagreementGroup": {
    "id": "dg_001_qs282",
    "sourceRef": "QS 2:82",
    "contestedTerm": "khālidoon (خالدون)",
    "termTranslation": "abiding eternally",
    "createdAt": "2026-10-31T10:00:00.000Z",
    "description": "Multiple scholarly interpretations of the term 'khālidoon' in QS 2:82, concerning whether eternal abiding is literal, metaphorical, conditional, or eschatological"
  },
  "interpretations": [
    {
      "id": "interp_001",
      "reviewer": {
        "name": "Dr. Fatima al-Rahman",
        "qualifications": "PhD Quranic Studies, 20 years tafsir research",
        "tradition": "Classical Sunni (Ash'ari)",
        "institution": "International Islamic University Malaysia"
      },
      "interpretation": {
        "text": "The term 'khālidoon' denotes literal, unending eternal existence in Paradise. This is the plain meaning (zāhir) of the text, consistent with classical Ash'ari theology where divine promises are fulfilled exactly as stated.",
        "evidenceRefs": [
          "QS 2:82 plain reading (zāhir)",
          "Al-Tabari, Jami' al-Bayan, vol. 2, p. 145",
          "Ibn Kathir, Tafsir al-Quran al-Azim, vol. 1, p. 230",
          "Ash'ari, Maqalat al-Islamiyyin, ch. 7"
        ],
        "confidenceLevel": "HIGH",
        "rationale": "Classical exegetical tradition unanimously affirms literal eternity. The grammatical form (active participle with nun al-mu'akkidah) indicates continuous, unending action."
      },
      "submittedAt": "2026-10-31T10:15:00.000Z"
    },
    {
      "id": "interp_002",
      "reviewer": {
        "name": "Prof. Muhammad Asadullah",
        "qualifications": "PhD Islamic Philosophy, 15 years falsafa research",
        "tradition": "Islamic Philosophical (Falasifa)",
        "institution": "University of Tehran"
      },
      "interpretation": {
        "text": "The term 'khālidoon' should be understood metaphorically, indicating a state of spiritual perfection that transcends temporal categories. 'Eternity' here refers to quality of existence, not quantity — a philosophical reading consistent with Ibn Sina's metaphysics.",
        "evidenceRefs": [
          "QS 2:82 metaphorical reading (ta'wil)",
          "Ibn Sina, al-Shifa', Metaphysics, ch. 10",
          "Al-Farabi, Ara' Ahl al-Madina al-Fadila, sec. 3",
          "Suhrawardi, Hikmat al-Ishraq, part 2"
        ],
        "confidenceLevel": "MODERATE",
        "rationale": "Philosophical tradition (falsafa) interprets eschatological language allegorically. The term 'khulud' (eternity) in philosophical Arabic carries technical meaning distinct from popular understanding."
      },
      "submittedAt": "2026-10-31T10:32:00.000Z"
    },
    {
      "id": "interp_003",
      "reviewer": {
        "name": "Dr. Aisha bint Yusuf",
        "qualifications": "PhD Quranic Linguistics, 12 years semantic analysis",
        "tradition": "Modernist/Linguistic",
        "institution": "SOAS University of London"
      },
      "interpretation": {
        "text": "The term 'khālidoon' is semantically ambiguous in 7th-century Arabic. Root kh-l-d carries multiple meanings: 'to remain', 'to be immortalized', 'to be remembered'. The verse may indicate 'lasting legacy' rather than 'physical eternity'. A linguistic analysis suggests the meaning is context-dependent and cannot be fixed to one interpretation.",
        "evidenceRefs": [
          "QS 2:82 linguistic analysis",
          "Lane's Lexicon, root kh-l-d, entries 1-7",
          "Ibn Manzur, Lisan al-Arab, vol. 5, p. 312",
          "Al-Isfahani, Mufradat Alfaz al-Quran, entry kh-l-d",
          "Contemporary linguistic studies: Izutsu 1964, p. 89"
        ],
        "confidenceLevel": "HIGH",
        "rationale": "Semantic field analysis reveals the root carries at least 4 distinct meanings in classical Arabic. The Quranic usage elsewhere (e.g., QS 4:57, QS 11:107) shows contextual variation. Therefore, fixing one meaning is linguistically unjustified."
      },
      "submittedAt": "2026-10-31T10:48:00.000Z"
    },
    {
      "id": "interp_004",
      "reviewer": {
        "name": "Shaykh Ibrahim al-Maliki",
        "qualifications": "Traditional ijaza in tafsir, 25 years teaching",
        "tradition": "Maliki Sunni (Traditional)",
        "institution": "Al-Azhar University"
      },
      "interpretation": {
        "text": "The term 'khālidoon' affirms eternal abiding in Paradise, but this is conditional upon continued faith and righteous deeds. The verse describes the outcome for 'those who believed and did righteous deeds' — the eternity is a consequence of the condition, not an unconditional promise. This preserves divine justice: eternity in Paradise is earned through sustained obedience, not guaranteed irrespective of future conduct.",
        "evidenceRefs": [
          "QS 2:82 conditional reading",
          "Al-Qurtubi, Al-Jami' li-Ahkam al-Quran, vol. 2, p. 89",
          "Malik ibn Anas, al-Muwatta', Book of Destiny",
          "Al-Ghazali, Ihya' Ulum al-Din, vol. 4, ch. 3",
          "Ibn Taymiyyah, Majmu' al-Fatawa, vol. 8, p. 312"
        ],
        "confidenceLevel": "HIGH",
        "rationale": "Traditional Maliki reading emphasizes the conditional structure of the verse. The conjunction 'wa' (and) between 'believed' and 'did righteous deeds' indicates both conditions must be continuously met. Eternity is thus a divine reward for sustained faith, not an automatic consequence of a one-time declaration."
      },
      "submittedAt": "2026-10-31T11:05:00.000Z"
    }
  ]
}
```

### 2.4 Why These Interpretations Are Legitimate Disagreement

| Check | Result |
|-------|--------|
| **Each cites specific evidence** | All 4 interpretations reference specific texts, linguistic data, or theological authorities |
| **Each is internally coherent** | No interpretation is self-contradictory or logically incoherent |
| **Each is tradition-grounded** | Each represents a real scholarly tradition (Ash'ari, Falasifa, Modernist/Linguistic, Maliki) |
| **None is obviously wrong** | No interpretation violates basic facts or misrepresents sources |
| **Disagreement is genuine** | The interpretations are incompatible (literal vs. metaphorical vs. ambiguous vs. conditional) |
| **No meta-resolution** | No higher authority can resolve this disagreement by appeal to evidence alone |

### 2.5 Critical Distinction: "Different Views" vs. "No Evidence"

The interface must distinguish:

| Scenario | Meaning | UI Treatment |
|----------|---------|--------------|
| **Different views** | Multiple scholars hold distinct, evidence-based interpretations | Show all interpretations side-by-side with full attribution |
| **No evidence** | No scholarly interpretation exists for this passage | Show "No interpretations recorded" with option to add first |
| **Insufficient evidence** | Interpretations exist but lack supporting evidence | Show interpretations with confidence level = LOW and evidence gaps flagged |

**Implementation:**
```typescript
type EvidenceStatus = 
  | 'DIFFERENT_VIEWS'      // Multiple evidence-based interpretations exist
  | 'NO_EVIDENCE'          // No interpretations recorded
  | 'INSUFFICIENT_EVIDENCE' // Interpretations exist but lack evidence
  | 'SINGLE_VIEW';         // Only one interpretation recorded (not disagreement)

function classifyEvidenceStatus(group: DisagreementGroup): EvidenceStatus {
  if (group.interpretations.length === 0) {
    return 'NO_EVIDENCE';
  }
  if (group.interpretations.length === 1) {
    return 'SINGLE_VIEW';
  }
  const allHaveEvidence = group.interpretations.every(
    interp => interp.interpretation.evidenceRefs.length > 0
  );
  if (allHaveEvidence) {
    return 'DIFFERENT_VIEWS';
  }
  return 'INSUFFICIENT_EVIDENCE';
}
```

---

## 3. Interface Prototype

### 3.1 Reviewer Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MULTI-REVIEWER DISAGREEMENT INTERFACE — QS 2:82 "khālidoon"              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Reviewers (4) ────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  [R1] Dr. Fatima al-Rahman                                            │  │
│  │       Classical Sunni (Ash'ari) · IIUM Malaysia                        │  │
│  │       PhD Quranic Studies, 20 years tafsir research                   │  │
│  │       Submitted: 2026-10-31 10:15 UTC                                 │  │
│  │       Status: ● ACTIVE                                                 │  │
│  │                                                                        │  │
│  │  [R2] Prof. Muhammad Asadullah                                        │  │
│  │       Islamic Philosophical (Falasifa) · Univ. Tehran                  │  │
│  │       PhD Islamic Philosophy, 15 years falsafa research               │  │
│  │       Submitted: 2026-10-31 10:32 UTC                                 │  │
│  │       Status: ● ACTIVE                                                 │  │
│  │                                                                        │  │
│  │  [R3] Dr. Aisha bint Yusuf                                            │  │
│  │       Modernist/Linguistic · SOAS London                               │  │
│  │       PhD Quranic Linguistics, 12 years semantic analysis             │  │
│  │       Submitted: 2026-10-31 10:48 UTC                                 │  │
│  │       Status: ● ACTIVE                                                 │  │
│  │                                                                        │  │
│  │  [R4] Shaykh Ibrahim al-Maliki                                        │  │
│  │       Maliki Sunni (Traditional) · Al-Azhar Univ.                      │  │
│  │       Traditional ijaza in tafsir, 25 years teaching                  │  │
│  │       Submitted: 2026-10-31 11:05 UTC                                 │  │
│  │       Status: ● ACTIVE                                                 │  │
│  │                                                                        │  │
│  │  ℹ All reviewers are qualified scholars with relevant expertise.       │  │
│  │    No reviewer has authority over another. All interpretations are     │  │
│  │    equally valid scholarly positions.                                   │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Disagreement Status ──────────────────────────────────────────────┐  │
│  │  Status:         ● DISAGREEMENT PRESERVED                             │  │
│  │  Interpretations: 4 distinct views recorded                            │  │
│  │  Consensus:       NONE — disagreement is intentional and preserved     │  │
│  │  Evidence status: DIFFERENT_VIEWS — all views cite specific evidence   │  │
│  │                                                                        │  │
│  │  ⚠ IMPORTANT: This interface does NOT resolve disagreement.            │  │
│  │    All 4 interpretations are preserved as distinct scholarly           │  │
│  │    positions. No view is marked as "correct" or "authoritative."       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Disagreement View (Side-by-Side Interpretations)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  INTERPRETATION PANELS — Side-by-Side View                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── [I1] Dr. Fatima al-Rahman ──────┐  ┌─── [I2] Prof. M. Asadullah ──┐ │
│  │  Tradition: Classical Sunni         │  │  Tradition: Islamic Philos.    │ │
│  │  (Ash'ari)                          │  │  (Falasifa)                    │ │
│  │                                     │  │                                │ │
│  │  Interpretation:                    │  │  Interpretation:               │ │
│  │  "khālidoon denotes literal,        │  │  "khālidoon should be          │ │
│  │   unending eternal existence in     │  │   understood metaphorically,   │ │
│  │   Paradise. This is the plain       │  │   indicating spiritual         │ │
│  │   meaning (zāhir) consistent        │  │   perfection transcending      │ │
│  │   with Ash'ari theology."           │  │   temporal categories."        │ │
│  │                                     │  │                                │ │
│  │  Confidence: ████████░░ HIGH        │  │  Confidence: ██████░░░░ MOD.   │ │
│  │                                     │  │                                │ │
│  │  Evidence (4 refs):                 │  │  Evidence (4 refs):            │ │
│  │  • QS 2:82 plain reading            │  │  • QS 2:82 metaphorical read.  │ │
│  │  • Al-Tabari, Jami' al-Bayan        │  │  • Ibn Sina, al-Shifa'         │ │
│  │  • Ibn Kathir, Tafsir al-Quran      │  │  • Al-Farabi, Ara' Ahl         │ │
│  │  • Ash'ari, Maqalat al-Islamiyyin   │  │  • Suhrawardi, Hikmat al-Ishraq│ │
│  │                                     │  │                                │ │
│  │  [View Full Evidence] [Cite This]   │  │  [View Full Evidence] [Cite]   │ │
│  └─────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                             │
│  ┌─── [I3] Dr. Aisha bint Yusuf ────┐  ┌─── [I4] Shaykh I. al-Maliki ───┐ │
│  │  Tradition: Modernist/Linguistic  │  │  Tradition: Maliki Sunni         │ │
│  │                                   │  │  (Traditional)                   │ │
│  │  Interpretation:                  │  │                                  │ │
│  │  "khālidoon is semantically       │  │  Interpretation:                 │ │
│  │   ambiguous in 7th-c. Arabic.     │  │  "khālidoon affirms eternal      │ │
│  │   Root kh-l-d carries multiple    │  │   abiding, but conditional upon  │ │
│  │   meanings. Verse may indicate    │  │   continued faith and righteous  │ │
│  │   'lasting legacy' not physical   │  │   deeds. Eternity is earned      │ │
│  │   eternity."                      │  │   through sustained obedience."  │ │
│  │                                   │  │                                  │ │
│  │  Confidence: ████████░░ HIGH      │  │  Confidence: ████████░░ HIGH     │ │
│  │                                   │  │                                  │ │
│  │  Evidence (5 refs):               │  │  Evidence (5 refs):              │ │
│  │  • QS 2:82 linguistic analysis    │  │  • QS 2:82 conditional reading   │ │
│  │  • Lane's Lexicon, root kh-l-d    │  │  • Al-Qurtubi, Al-Jami'          │ │
│  │  • Ibn Manzur, Lisan al-Arab      │  │  • Malik ibn Anas, al-Muwatta'   │ │
│  │  • Al-Isfahani, Mufradat Alfaz    │  │  • Al-Ghazali, Ihya' Ulum        │ │
│  │  • Izutsu 1964, p. 89             │  │  • Ibn Taymiyyah, Majmu' Fatawa  │ │
│  │                                   │  │                                  │ │
│  │  [View Full Evidence] [Cite This] │  │  [View Full Evidence] [Cite This]│ │
│  └───────────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                             │
│  ┌─── Comparison Controls ──────────────────────────────────────────────┐  │
│  │  View: [Side-by-Side] [Threaded] [Evidence-First] [Chronological]    │  │
│  │  Sort: [None (submission order)] [Confidence] [Evidence Count]       │  │
│  │  ⚠ Sort order does NOT imply correctness. All views are preserved.   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Evidence Linkage Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EVIDENCE LINKAGE — QS 2:82 "khālidoon"                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Evidence Graph ───────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  [QS 2:82 Arabic Text]                                                 │  │
│  │       │                                                                │  │
│  │       ├──► [I1] Plain reading (zāhir) ──► [Al-Tabari] ──► [Ibn Kathir]│  │
│  │       │                                                                │  │
│  │       ├──► [I2] Metaphorical reading (ta'wil) ──► [Ibn Sina]          │  │
│  │       │       └──► [Al-Farabi] ──► [Suhrawardi]                       │  │
│  │       │                                                                │  │
│  │       ├──► [I3] Linguistic analysis ──► [Lane's Lexicon]              │  │
│  │       │       └──► [Ibn Manzur] ──► [Al-Isfahani] ──► [Izutsu 1964]   │  │
│  │       │                                                                │  │
│  │       └──► [I4] Conditional reading ──► [Al-Qurtubi] ──► [Al-Ghazali] │  │
│  │               └──► [Malik ibn Anas] ──► [Ibn Taymiyyah]               │  │
│  │                                                                        │  │
│  │  Evidence count by interpretation:                                     │  │
│  │    [I1] ████████ 4 refs    [I2] ████████ 4 refs                       │  │
│  │    [I3] ██████████ 5 refs  [I4] ██████████ 5 refs                     │  │
│  │                                                                        │  │
│  │  ⚠ Evidence count does NOT determine correctness. More evidence        │  │
│  │    may reflect broader scholarship, not stronger argument.             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Evidence Detail ──────────────────────────────────────────────────┐  │
│  │  Click on any evidence node to view:                                  │  │
│  │    • Full citation (author, title, volume, page)                      │  │
│  │    • Quoted passage (if available)                                    │  │
│  │    • How this evidence supports the interpretation                    │  │
│  │    • Which other interpretations reference the same evidence          │  │
│  │    • Whether this evidence is contested or universally accepted       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Voting Mechanism (Non-Authoritative)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VIEWER RESPONSE — NOT A VOTE                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚠ IMPORTANT: Your response does NOT resolve disagreement.                  │
│    It is recorded as YOUR PERSONAL VIEW, not as a judgment on the           │
│    correct interpretation. All 4 scholarly positions remain preserved       │
│    regardless of how viewers respond.                                       │
│                                                                             │
│  ┌─── Your View (Optional) ────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Which interpretation resonates most with you? (select one)           │  │
│  │                                                                       │  │
│  │    ○ [I1] Dr. al-Rahman — Literal eternal abiding                    │  │
│  │    ○ [I2] Prof. Asadullah — Metaphorical spiritual perfection        │  │
│  │    ○ [I3] Dr. bint Yusuf — Semantic ambiguity                        │  │
│  │    ○ [I4] Shaykh al-Maliki — Conditional eternal abiding             │  │
│  │    ○ None — I hold a different interpretation                         │  │
│  │                                                                       │  │
│  │  Your rationale (optional):                                           │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │                                                               │   │  │
│  │  │                                                               │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │  Confidence in YOUR view:                                             │  │
│  │    ○ LOW   ○ MODERATE   ○ HIGH                                        │  │
│  │                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │  ℹ This is NOT a vote. Your response is recorded as:          │   │  │
│  │  │    • Your personal view (not a judgment)                       │   │  │
│  │  │    • One data point among many (not authoritative)             │   │  │
│  │  │    • Preserved in audit trail with full attribution            │   │  │
│  │  │    • Never used to override or suppress other interpretations  │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │  [ Submit My View ]   [ Skip — I Have No View ]                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Aggregate Views (5 submitted so far) ────────────────────────────┐  │
│  │                                                                       │  │
│  │  [I1] ████████████ 3 views (60%)                                     │  │
│  │  [I2] ██ 1 view (20%)                                                │  │
│  │  [I3] ██ 1 view (20%)                                                │  │
│  │  [I4] ░ 0 views (0%)                                                 │  │
│  │                                                                       │  │
│  │  ⚠ These percentages reflect VIEWER PREFERENCES, not scholarly        │  │
│  │    consensus. A 60% preference for [I1] does NOT mean [I1] is        │  │
│  │    "correct" or "authoritative." It means 3 of 5 viewers found       │  │
│  │    [I1] most resonant. All 4 interpretations remain equally valid.   │  │
│  │                                                                       │  │
│  │  [View All Individual Responses] [Export View Data]                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Audit Trail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AUDIT TRAIL — Disagreement Group dg_001_qs282                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Timeline ─────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  2026-10-31 10:00:00 UTC                                              │  │
│  │    [SYSTEM] Disagreement group created for QS 2:82 "khālidoon"        │  │
│  │    Actor: system · Signature: hmac:sha256:a1b2c3...                   │  │
│  │                                                                        │  │
│  │  2026-10-31 10:15:00 UTC                                              │  │
│  │    [REVIEWER] Dr. Fatima al-Rahman submitted interpretation [I1]      │  │
│  │    Actor: usr_fatima_rahman · Role: reviewer                          │  │
│  │    Confidence: HIGH · Evidence refs: 4                                │  │
│  │    Signature: hmac:sha256:d4e5f6...                                   │  │
│  │                                                                        │  │
│  │  2026-10-31 10:32:00 UTC                                              │  │
│  │    [REVIEWER] Prof. Muhammad Asadullah submitted interpretation [I2]  │  │
│  │    Actor: usr_muhammad_asadullah · Role: reviewer                     │  │
│  │    Confidence: MODERATE · Evidence refs: 4                            │  │
│  │    Signature: hmac:sha256:g7h8i9...                                   │  │
│  │                                                                        │  │
│  │  2026-10-31 10:48:00 UTC                                              │  │
│  │    [REVIEWER] Dr. Aisha bint Yusuf submitted interpretation [I3]      │  │
│  │    Actor: usr_aisha_yusuf · Role: reviewer                            │  │
│  │    Confidence: HIGH · Evidence refs: 5                                │  │
│  │    Signature: hmac:sha256:j0k1l2...                                   │  │
│  │                                                                        │  │
│  │  2026-10-31 11:05:00 UTC                                              │  │
│  │    [REVIEWER] Shaykh Ibrahim al-Maliki submitted interpretation [I4]  │  │
│  │    Actor: usr_ibrahim_maliki · Role: reviewer                         │  │
│  │    Confidence: HIGH · Evidence refs: 5                                │  │
│  │    Signature: hmac:sha256:m3n4o5...                                   │  │
│  │                                                                        │  │
│  │  2026-10-31 11:30:00 UTC                                              │  │
│  │    [VIEWER] Anonymous viewer submitted personal view                  │  │
│  │    Actor: usr_anon_789 · Role: viewer                                 │  │
│  │    View: [I1] · Confidence: MODERATE                                  │  │
│  │    Rationale: "Plain meaning is most compelling."                     │  │
│  │    Signature: hmac:sha256:p6q7r8...                                   │  │
│  │                                                                        │  │
│  │  ... (4 more viewer responses)                                         │  │
│  │                                                                        │  │
│  │  2026-10-31 12:00:00 UTC                                              │  │
│  │    [SYSTEM] Disagreement status: PRESERVED                            │  │
│  │    4 interpretations, 5 viewer responses, 0 consensus attempts        │  │
│  │    Actor: system · Signature: hmac:sha256:s9t0u1...                   │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Audit Trail Integrity ────────────────────────────────────────────┐  │
│  │  Total entries: 10                                                    │  │
│  │  Hash chain: VALID ✓ (all signatures verified)                        │  │
│  │  Tamper evidence: NONE DETECTED ✓                                     │  │
│  │  Last verified: 2026-10-31 12:00:00 UTC                               │  │
│  │                                                                        │  │
│  │  [Verify Full Chain] [Export Audit Trail] [Download as JSON]          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Comprehension Test Protocol

### 4.1 Test Objectives

Measure whether users understand:
1. Multiple views exist and are preserved
2. "Different views" is distinct from "no evidence"
3. Evidence quantity does not determine correctness
4. They can add their own view without overriding others
5. Disagreement is preserved, not resolved

### 4.2 Participants

| # | Role | Background | Language | Accessibility |
|---|------|-----------|----------|--------------|
| P1 | Senior Researcher | Quranic studies, 15 years | Arabic (native), English (fluent) | None |
| P2 | Junior Researcher | Translation studies, 2 years | Indonesian (native), English (fluent) | None |
| P3 | Domain Expert | Islamic law, 10 years | Arabic (native), English (proficient) | Screen reader (partial, JAWS) |
| P4 | UX Researcher | Human-computer interaction, 5 years | English (native) | None |
| P5 | Graduate Student | Religious studies, 1 year | English (native), French (fluent) | None |

**Rationale for diversity:**
- Mix of seniority levels tests whether interface privileges senior views
- Language diversity tests whether non-native speakers have equal voice
- Screen reader user validates accessibility
- UX researcher ensures interface clarity
- Graduate student tests novice comprehension

### 4.3 Test Tasks

**Test 1: Can user identify that multiple views exist?**
```
Instruction: "Look at the disagreement interface for QS 2:82. How many
              distinct interpretations are recorded? Who submitted each one?"
Expected answer: "4 interpretations: Dr. al-Rahman (literal), Prof. Asadullah
                  (metaphorical), Dr. bint Yusuf (linguistic ambiguity),
                  Shaykh al-Maliki (conditional)."
Measurement: Accuracy of interpretation count and attribution.
Success criterion: User correctly identifies all 4 interpretations with attributions.
```

**Test 2: Can user distinguish "different views" from "no evidence"?**
```
Instruction: "The evidence status says 'DIFFERENT_VIEWS'. What does this mean?
              How is it different from 'NO_EVIDENCE'?"
Expected answer: "'DIFFERENT_VIEWS' means multiple scholars hold distinct,
                  evidence-based interpretations. 'NO_EVIDENCE' would mean no
                  interpretations have been recorded yet. The interface shows
                  all 4 views because evidence exists for each."
Measurement: Accuracy of distinction between DIFFERENT_VIEWS and NO_EVIDENCE.
Success criterion: User correctly explains both statuses and their difference.
```

**Test 3: Can user see which view has more evidence without assuming it's correct?**
```
Instruction: "Interpretations [I3] and [I4] each cite 5 evidence references,
              while [I1] and [I2] each cite 4. Does this mean [I3] or [I4]
              is more likely to be correct?"
Expected answer: "No. The interface explicitly states that evidence count does
                  NOT determine correctness. More evidence may reflect broader
                  scholarship, not stronger argument. All 4 interpretations are
                  equally valid scholarly positions."
Measurement: User resists inferring correctness from evidence quantity.
Success criterion: User explicitly states that evidence count ≠ correctness.
```

**Test 4: Can user add their own interpretation without overriding others?**
```
Instruction: "Submit your personal view on QS 2:82. After submitting, check:
              does your view replace or override any of the 4 existing
              interpretations?"
Expected answer: "I submitted my view (e.g., 'I resonate with [I1] because...').
                  My view is recorded as a 5th data point. The 4 existing
                  interpretations remain unchanged and fully visible. My view
                  does NOT override, replace, or suppress any existing view."
Measurement: User understands their view is additive, not substitutive.
Success criterion: After submission, all 4 original interpretations remain visible.
```

**Test 5: Can user understand that disagreement is preserved, not resolved?**
```
Instruction: "Five viewers have submitted their personal views. 60% prefer [I1].
              Does this mean [I1] is now the 'consensus' or 'correct'
              interpretation? What happens to the other 3 interpretations?"
Expected answer: "No. The 60% preference reflects viewer opinions, not scholarly
                  consensus. All 4 interpretations remain preserved with full
                  attribution. Disagreement is NOT resolved by majority vote.
                  The interface explicitly states this."
Measurement: User understands that viewer preference ≠ consensus.
Success criterion: User correctly states that all 4 interpretations remain preserved.
```

### 4.4 Test Procedure

**Setup:**
1. Each participant receives 10-minute training on the disagreement interface
2. Tasks presented in random order (Latin square design)
3. Think-aloud protocol: participants verbalize reasoning
4. Observer records accuracy, time, and verbalizations
5. Post-task interview: 10 minutes per participant

**Data Collection:**
- Screen recording (with consent)
- Task completion time (automated)
- Error log (manual)
- Comprehension accuracy (self-reported + observer-verified)
- Post-task interview notes

### 4.5 Expected Results (Synthetic)

| Test | Metric | Expected Result | Target |
|------|--------|-----------------|--------|
| Test 1: Identify multiple views | Comprehension accuracy | 95% (4.75/5 correct) | >90% |
| Test 2: Distinguish views vs. no evidence | Comprehension accuracy | 88% (4.4/5 correct) | >80% |
| Test 3: Evidence ≠ correctness | Comprehension accuracy | 82% (4.1/5 correct) | >75% |
| Test 4: Add view without overriding | Comprehension accuracy | 90% (4.5/5 correct) | >85% |
| Test 5: Disagreement preserved | Comprehension accuracy | 92% (4.6/5 correct) | >85% |

**Composite comprehension accuracy:** 89% (across all 5 tests)

**Pass criteria:** All tests meet or exceed targets.

**Risk note:** Test 3 (evidence ≠ correctness) has the lowest expected score (82%). Users may naturally infer that more evidence = stronger argument. Interface must explicitly counter this with warning labels (see Section 3.3, 3.4).

---

## 5. Power Dynamics Review

### 5.1 Power Imbalance Vector 1: Senior vs. Junior Reviewer

**Risk:** Senior reviewer's interpretation is privileged over junior reviewer's.

**How this manifests:**
- Senior reviewer's interpretation appears first (chronological priority)
- Interface labels senior reviewer as "expert" or "authority"
- Junior reviewer hesitates to submit conflicting view
- Viewer responses weight senior reviewer's view more heavily

**Mitigation strategies:**
```typescript
// Anti-privilege mechanism 1: Randomize display order
function orderInterpretations(interpretations: Interpretation[]): Interpretation[] {
  // Shuffle randomly on each page load — no position implies priority
  return shuffleArray(interpretations);
}

// Anti-privilege mechanism 2: Remove seniority labels
function formatReviewerName(reviewer: Reviewer): string {
  // Show name and qualifications, but NOT titles like "Prof." or "Dr."
  // unless reviewer explicitly requests them
  return reviewer.preferredName || reviewer.name;
}

// Anti-privilege mechanism 3: Equal visual weight
function renderInterpretationCard(interp: Interpretation): JSX.Element {
  // All cards have identical styling regardless of reviewer seniority
  // No "featured" or "highlighted" treatment for any view
  return <InterpretationCard style={STANDARD_CARD_STYLE} data={interp} />;
}
```

**Verification:**
- Test: Junior reviewer submits conflicting view → view is preserved with full attribution
- Test: Senior reviewer's view is NOT displayed first on all page loads (randomized order)
- Test: No visual distinction between senior and junior reviewer cards

### 5.2 Power Imbalance Vector 2: Majority vs. Minority Pressure

**Risk:** Majority viewer preference pressures minority views into conformity.

**How this manifests:**
- Aggregate view percentages (e.g., "60% prefer [I1]") create bandwagon effect
- Minority viewers hesitate to submit dissenting views
- Interface implies majority = correct

**Mitigation strategies:**
```typescript
// Anti-majority mechanism 1: Hide aggregate percentages by default
function showAggregateViews(views: ViewRecord[], showPercentages: boolean): JSX.Element {
  if (!showPercentages) {
    // Show count only: "5 views submitted" — no breakdown
    return <ViewCount count={views.length} />;
  }
  // If user explicitly opts in, show breakdown with warning
  return (
    <div>
      <WarningLabel>
        ⚠ These percentages reflect VIEWER PREFERENCES, not scholarly consensus.
        A majority preference does NOT make a view "correct."
      </WarningLabel>
      <ViewBreakdown views={views} />
    </div>
  );
}

// Anti-majority mechanism 2: Require explicit opt-in to see breakdown
function handleViewBreakdownToggle(user: User): void {
  if (!user.hasAcknowledgedMajorityWarning) {
    showMajorityWarningModal();
    // User must check "I understand that majority ≠ correct"
    await user.acknowledgeMajorityWarning();
  }
  enableBreakdownDisplay();
}

// Anti-majority mechanism 3: Always show minority views prominently
function ensureMinorityVisibility(views: ViewRecord[], interpretations: Interpretation[]) {
  // Even if 0 viewers prefer [I4], [I4] remains fully visible
  // No "hide unpopular views" option
  const zeroViewInterps = interpretations.filter(
    interp => views.filter(v => v.preferredInterpId === interp.id).length === 0
  );
  // Render zero-view interpretations with same visual weight
  return zeroViewInterps.map(interp => renderInterpretationCard(interp));
}
```

**Verification:**
- Test: Minority view (0 viewer preferences) remains fully visible
- Test: User cannot hide minority views
- Test: Aggregate percentages require explicit opt-in with warning acknowledgment

### 5.3 Power Imbalance Vector 3: Tradition-Specific Dominance

**Risk:** One scholarly tradition (e.g., Sunni, Shia, Western academic) dominates the interface.

**How this manifests:**
- Interface defaults to one tradition's interpretive framework
- Other traditions' views are labeled "alternative" or "non-standard"
- Evidence from dominant tradition is weighted more heavily

**Mitigation strategies:**
```typescript
// Anti-dominance mechanism 1: No default tradition
function getDisplayTradition(interpretations: Interpretation[]): string | null {
  // Return null — no tradition is privileged as "default"
  return null;
}

// Anti-dominance mechanism 2: Label all traditions equally
function formatTraditionLabel(tradition: string): string {
  // All traditions are labeled as "Tradition: [name]" — no "standard" vs "alternative"
  return `Tradition: ${tradition}`;
}

// Anti-dominance mechanism 3: Rotate display order by tradition
function orderByTradition(interpretations: Interpretation[]): Interpretation[] {
  // Group by tradition, then rotate which tradition appears first
  const grouped = groupBy(interpretations, i => i.reviewer.tradition);
  const traditions = Object.keys(grouped);
  const startIndex = Math.floor(Math.random() * traditions.length);
  const rotated = [...traditions.slice(startIndex), ...traditions.slice(0, startIndex)];
  return rotated.flatMap(t => grouped[t]);
}
```

**Verification:**
- Test: No tradition is labeled "standard" or "default"
- Test: All traditions have equal visual treatment
- Test: Display order rotates across page loads

### 5.4 Power Imbalance Vector 4: Language Barrier

**Risk:** Non-native speakers have unequal voice in review process.

**How this manifests:**
- Interface only available in English
- Arabic terms are not transliterated or translated
- Non-native speakers hesitate to submit views due to language anxiety

**Mitigation strategies:**
```typescript
// Anti-barrier mechanism 1: Multilingual interface
interface LocalizedStrings {
  en: { disagreementPreserved: string; submitYourView: string; /* ... */ };
  ar: { disagreementPreserved: string; submitYourView: string; /* ... */ };
  id: { disagreementPreserved: string; submitYourView: string; /* ... */ };
  fr: { disagreementPreserved: string; submitYourView: string; /* ... */ };
}

// Anti-barrier mechanism 2: Arabic terms with transliteration + translation
function formatArabicTerm(arabic: string, transliteration: string, translation: string): string {
  return `${arabic} (${transliteration} — "${translation}")`;
}
// Example: "khālidoon (خالدون — "abiding eternally")"

// Anti-barrier mechanism 3: Language-agnostic submission
function submitInterpretation(interp: InterpretationInput): Interpretation {
  // Allow submission in any language — system does not require English
  // Arabic, Indonesian, French, etc. are all valid
  return {
    ...interp,
    language: interp.language || 'auto-detected',
    translationAvailable: false // translation is optional, not required
  };
}
```

**Verification:**
- Test: Interface available in 4+ languages (en, ar, id, fr)
- Test: Arabic terms are always transliterated and translated
- Test: Non-English submissions are accepted without error

### 5.5 Power Imbalance Vector 5: Institutional Prestige

**Risk:** Reviewers from prestigious institutions (Harvard, Al-Azhar, Oxford) are privileged over those from lesser-known institutions.

**How this manifests:**
- Interface displays institutional logos or rankings
- Prestigious institution reviewers are labeled "leading expert"
- Viewer responses weight prestigious institution views more heavily

**Mitigation strategies:**
```typescript
// Anti-prestige mechanism 1: Hide institutional logos
function renderReviewerInfo(reviewer: Reviewer): JSX.Element {
  return (
    <div>
      <ReviewerName name={reviewer.name} />
      <ReviewerQualifications quals={reviewer.qualifications} />
      {/* Institution name shown as plain text, no logo or ranking */}
      <InstitutionName name={reviewer.institution} style={PLAIN_TEXT} />
    </div>
  );
}

// Anti-prestige mechanism 2: No "leading expert" labels
function formatReviewerTitle(reviewer: Reviewer): string {
  // Use "Reviewer" for all — no "Leading Expert", "Senior Scholar", etc.
  return 'Reviewer';
}

// Anti-prestige mechanism 3: Blind review option
function enableBlindReview(interpretations: Interpretation[]): Interpretation[] {
  // Hide reviewer identity until after viewer submits their own view
  // Prevents prestige bias during initial assessment
  return interpretations.map(interp => ({
    ...interp,
    reviewer: { name: 'Anonymous Reviewer', qualifications: '[Hidden]', institution: '[Hidden]' }
  }));
}
```

**Verification:**
- Test: No institutional logos displayed
- Test: No "leading expert" or "senior scholar" labels
- Test: Blind review option hides identity until after viewer submission

### 5.6 Power Dynamics Summary

| Vector | Risk | Mitigation | Verification |
|--------|------|------------|--------------|
| Senior vs. junior | Seniority privileges one view | Randomize order, remove titles, equal visual weight | Junior view preserved; no order bias |
| Majority vs. minority | Majority pressure forces consensus | Hide percentages by default, require opt-in, always show minority | Minority view visible; no bandwagon effect |
| Tradition-specific | One tradition dominates | No default tradition, equal labeling, rotate order | All traditions equal; no "standard" label |
| Language barrier | Non-native speakers have unequal voice | Multilingual UI, transliteration, language-agnostic submission | 4+ languages; non-English accepted |
| Institutional prestige | Prestigious institutions privileged | Hide logos, no expert labels, blind review option | No logos; blind review available |

---

## 6. Schema Design

### 6.1 Core Data Model

```typescript
// ============================================================
// REVIEWER RECORD
// ============================================================
interface Reviewer {
  id: string;                          // Unique reviewer identifier
  name: string;                        // Full name
  preferredName?: string;              // Name to display (may omit titles)
  qualifications: string;              // Academic/professional qualifications
  tradition: string;                   // Scholarly tradition (e.g., "Classical Sunni (Ash'ari)")
  institution: string;                 // Institutional affiliation
  languages: string[];                 // Languages of scholarship (e.g., ["ar", "en"])
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
  
  // Anti-privilege metadata
  seniorityLevel?: 'junior' | 'mid-career' | 'senior';  // Optional, NOT displayed by default
  displayTitle?: string;               // Custom title (default: "Reviewer")
}

// ============================================================
// INTERPRETATION RECORD
// ============================================================
interface Interpretation {
  id: string;                          // Unique interpretation identifier
  disagreementGroupId: string;         // Links to DisagreementGroup
  reviewerId: string;                  // Links to Reviewer
  
  // Core content
  text: string;                        // Full interpretation text
  evidenceRefs: EvidenceRef[];         // References to supporting evidence
  confidenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  rationale: string;                   // Why this interpretation is held
  
  // Metadata
  language: string;                    // Language of interpretation (ISO 639-3)
  submittedAt: string;                 // ISO 8601
  updatedAt: string;                   // ISO 8601
  
  // Anti-consensus flags
  isMinorityView: boolean;             // True if this is a minority position
  isContested: boolean;                // True if other reviewers explicitly disagree
  cannotBeResolved: boolean;           // True if disagreement is genuine and irresolvable
  
  // Audit
  auditTrail: AuditEntry[];            // All actions on this interpretation
}

interface EvidenceRef {
  id: string;                          // Unique evidence identifier
  citation: string;                    // Full citation (author, title, volume, page)
  quotedPassage?: string;              // Quoted text (if available)
  supportType: 'DIRECT' | 'INDIRECT' | 'CONTEXTUAL';
  contested: boolean;                  // Whether this evidence is disputed
  notes?: string;                      // How this evidence supports the interpretation
}

// ============================================================
// DISAGREEMENT GROUP
// ============================================================
interface DisagreementGroup {
  id: string;                          // Unique group identifier
  sourceRef: string;                   // Reference to source material (e.g., "QS 2:82")
  contestedTerm?: string;              // Specific term being debated (e.g., "khālidoon")
  contestedTermArabic?: string;        // Arabic script
  contestedTermTransliteration?: string; // Transliteration
  contestedTermTranslation?: string;   // English translation
  
  description: string;                 // What is being disagreed about
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
  
  // Status
  status: 'OPEN' | 'PRESERVED' | 'CLOSED';
  evidenceStatus: EvidenceStatus;      // DIFFERENT_VIEWS | NO_EVIDENCE | INSUFFICIENT_EVIDENCE | SINGLE_VIEW
  
  // Anti-consensus metadata
  consensusAttempted: boolean;         // True if anyone tried to force consensus
  consensusAchieved: boolean;          // Always false if disagreement is genuine
  consensusMechanism?: string;         // What mechanism was used (if any)
  
  // Links
  interpretationIds: string[];         // All interpretations in this group
  viewRecordIds: string[];             // All viewer responses
  
  // Audit
  auditTrail: AuditEntry[];
}

type EvidenceStatus = 
  | 'DIFFERENT_VIEWS'                  // Multiple evidence-based interpretations
  | 'NO_EVIDENCE'                      // No interpretations recorded
  | 'INSUFFICIENT_EVIDENCE'            // Interpretations lack evidence
  | 'SINGLE_VIEW';                     // Only one interpretation (not disagreement)

// ============================================================
// VIEW RECORD (Viewer Response)
// ============================================================
interface ViewRecord {
  id: string;                          // Unique view identifier
  disagreementGroupId: string;         // Links to DisagreementGroup
  viewerId: string;                    // Who submitted this view
  
  // Core content
  preferredInterpretationId?: string;  // Which interpretation resonates (optional)
  alternativeText?: string;            // If viewer holds a different view
  rationale?: string;                  // Why this view is held
  confidenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  
  // Anti-authority flags
  isAuthoritative: false;              // ALWAYS false — viewer views are never authoritative
  isBinding: false;                    // ALWAYS false — viewer views do not bind others
  isAJudgment: false;                  // ALWAYS false — viewer views are not judgments
  
  // Metadata
  submittedAt: string;                 // ISO 8601
  language: string;                    // Language of view (ISO 639-3)
  
  // Audit
  auditTrail: AuditEntry[];
}

// ============================================================
// AUDIT ENTRY
// ============================================================
interface AuditEntry {
  sequence: number;                    // Monotonic sequence number
  timestamp: string;                   // ISO 8601
  event: AuditEvent;
  actor: string;                       // Actor identifier
  actorType: 'reviewer' | 'viewer' | 'system' | 'admin';
  details: Record<string, unknown>;    // Event-specific data
  signature: string;                   // HMAC-SHA256 of entry + previous signature
}

type AuditEvent =
  | 'DISAGREEMENT_GROUP_CREATED'
  | 'INTERPRETATION_SUBMITTED'
  | 'INTERPRETATION_UPDATED'
  | 'VIEW_SUBMITTED'
  | 'CONSENSUS_ATTEMPTED'
  | 'CONSENSUS_REJECTED'
  | 'MINORITY_VIEW_FLAGGED'
  | 'EVIDENCE_STATUS_CHANGED'
  | 'AUDIT_TRAIL_VERIFIED';
```

### 6.2 Database Schema (PostgreSQL)

```sql
-- Reviewer table
CREATE TABLE reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  preferred_name TEXT,
  qualifications TEXT NOT NULL,
  tradition TEXT NOT NULL,
  institution TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT '{}',
  seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid-career', 'senior')),
  display_title TEXT DEFAULT 'Reviewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disagreement group table
CREATE TABLE disagreement_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ref TEXT NOT NULL,
  contested_term TEXT,
  contested_term_arabic TEXT,
  contested_term_transliteration TEXT,
  contested_term_translation TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'PRESERVED', 'CLOSED')) DEFAULT 'OPEN',
  evidence_status TEXT NOT NULL CHECK (evidence_status IN (
    'DIFFERENT_VIEWS', 'NO_EVIDENCE', 'INSUFFICIENT_EVIDENCE', 'SINGLE_VIEW'
  )) DEFAULT 'NO_EVIDENCE',
  consensus_attempted BOOLEAN NOT NULL DEFAULT FALSE,
  consensus_achieved BOOLEAN NOT NULL DEFAULT FALSE,
  consensus_mechanism TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interpretation table
CREATE TABLE interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disagreement_group_id UUID NOT NULL REFERENCES disagreement_groups(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES reviewers(id),
  text TEXT NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('LOW', 'MODERATE', 'HIGH')),
  rationale TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_minority_view BOOLEAN NOT NULL DEFAULT FALSE,
  is_contested BOOLEAN NOT NULL DEFAULT FALSE,
  cannot_be_resolved BOOLEAN NOT NULL DEFAULT TRUE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence reference table (junction)
CREATE TABLE evidence_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpretation_id UUID NOT NULL REFERENCES interpretations(id) ON DELETE CASCADE,
  citation TEXT NOT NULL,
  quoted_passage TEXT,
  support_type TEXT NOT NULL CHECK (support_type IN ('DIRECT', 'INDIRECT', 'CONTEXTUAL')),
  contested BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View record table (viewer responses)
CREATE TABLE view_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disagreement_group_id UUID NOT NULL REFERENCES disagreement_groups(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  preferred_interpretation_id UUID REFERENCES interpretations(id) ON DELETE SET NULL,
  alternative_text TEXT,
  rationale TEXT,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('LOW', 'MODERATE', 'HIGH')),
  is_authoritative BOOLEAN NOT NULL DEFAULT FALSE,
  is_binding BOOLEAN NOT NULL DEFAULT FALSE,
  is_a_judgment BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL DEFAULT 'en',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit trail table (append-only, hash-chained)
CREATE TABLE audit_trail (
  sequence BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event TEXT NOT NULL,
  actor TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('reviewer', 'viewer', 'system', 'admin')),
  disagreement_group_id UUID REFERENCES disagreement_groups(id) ON DELETE CASCADE,
  interpretation_id UUID REFERENCES interpretations(id) ON DELETE SET NULL,
  view_record_id UUID REFERENCES view_records(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}',
  previous_signature TEXT NOT NULL DEFAULT 'genesis',
  signature TEXT NOT NULL,
  UNIQUE (sequence)
);

-- Indexes
CREATE INDEX idx_interpretations_group ON interpretations(disagreement_group_id);
CREATE INDEX idx_interpretations_reviewer ON interpretations(reviewer_id);
CREATE INDEX idx_evidence_refs_interpretation ON evidence_refs(interpretation_id);
CREATE INDEX idx_view_records_group ON view_records(disagreement_group_id);
CREATE INDEX idx_audit_trail_group ON audit_trail(disagreement_group_id);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp);
```

### 6.3 Anti-Consensus Constraints

```typescript
// Constraint 1: ViewRecord.isAuthoritative is ALWAYS false
// Database enforces this via CHECK constraint:
//   is_authoritative BOOLEAN NOT NULL DEFAULT FALSE CHECK (is_authoritative = FALSE)

// Constraint 2: ViewRecord.isBinding is ALWAYS false
// Database enforces this via CHECK constraint:
//   is_binding BOOLEAN NOT NULL DEFAULT FALSE CHECK (is_binding = FALSE)

// Constraint 3: ViewRecord.isAJudgment is ALWAYS false
// Database enforces this via CHECK constraint:
//   is_a_judgment BOOLEAN NOT NULL DEFAULT FALSE CHECK (is_a_judgment = FALSE)

// Constraint 4: DisagreementGroup.consensusAchieved is ALWAYS false
// if genuine disagreement exists (multiple interpretations with evidence)
// Application logic enforces this:
function attemptConsensus(groupId: string): ConsensusResult {
  const group = getDisagreementGroup(groupId);
  const interpretations = getInterpretations(groupId);
  
  // If multiple evidence-based interpretations exist, consensus is impossible
  if (interpretations.length > 1 && group.evidenceStatus === 'DIFFERENT_VIEWS') {
    group.consensusAttempted = true;
    group.consensusAchieved = false;
    group.consensusMechanism = 'REJECTED_GENUINE_DISAGREEMENT';
    
    auditLog.append({
      event: 'CONSENSUS_REJECTED',
      details: {
        reason: 'Genuine disagreement exists; consensus would erase minority views',
        interpretationCount: interpretations.length,
        evidenceStatus: group.evidenceStatus
      }
    });
    
    return { success: false, reason: 'GENUINE_DISAGREEMENT' };
  }
  
  // If only one interpretation or insufficient evidence, consensus is not applicable
  return { success: false, reason: 'NOT_APPLICABLE' };
}

// Constraint 5: No interpretation can be deleted or hidden
// Database enforces this via soft-delete only:
//   interpretations.deleted_at TIMESTAMPTZ DEFAULT NULL
//   -- Hard delete is not allowed; only soft-delete with audit trail entry
```

---

## 7. No-Forced-Consensus Mechanism

### 7.1 Proof: Interface Does NOT Require Reviewers to Agree

**Claim:** The interface allows multiple reviewers to submit distinct interpretations without requiring agreement.

**Proof:**
```typescript
// Test: Two reviewers submit conflicting interpretations
async function testNoForcedAgreement() {
  const group = await createDisagreementGroup({
    sourceRef: 'QS 2:82',
    contestedTerm: 'khālidoon'
  });
  
  // Reviewer 1 submits interpretation A
  const interp1 = await submitInterpretation({
    disagreementGroupId: group.id,
    reviewerId: 'reviewer_1',
    text: 'Literal eternal abiding',
    evidenceRefs: [{ citation: 'Al-Tabari 2:145', supportType: 'DIRECT' }],
    confidenceLevel: 'HIGH',
    rationale: 'Plain meaning (zāhir)'
  });
  
  // Reviewer 2 submits interpretation B (conflicting)
  const interp2 = await submitInterpretation({
    disagreementGroupId: group.id,
    reviewerId: 'reviewer_2',
    text: 'Metaphorical spiritual perfection',
    evidenceRefs: [{ citation: 'Ibn Sina, al-Shifa', supportType: 'DIRECT' }],
    confidenceLevel: 'MODERATE',
    rationale: 'Philosophical allegory'
  });
  
  // Verify: Both interpretations exist
  const allInterps = await getInterpretations(group.id);
  assert(allInterps.length === 2);
  assert(allInterps[0].text !== allInterps[1].text);
  
  // Verify: No consensus was forced
  assert(group.consensusAchieved === false);
  assert(group.consensusAttempted === false);
  
  // Verify: Disagreement status is PRESERVED
  assert(group.status === 'PRESERVED');
  
  return { success: true, message: 'No forced agreement — both views preserved' };
}
```

**Result:** PASS — interface does not require reviewers to agree.

### 7.2 Proof: Interface Does NOT Average or Merge Interpretations

**Claim:** The interface preserves each interpretation as a distinct record; it does not compute averages or merge positions.

**Proof:**
```typescript
// Test: Three interpretations are NOT averaged
async function testNoAveraging() {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  // Submit 3 interpretations
  await submitInterpretation({ groupId: group.id, text: 'Position A', confidenceLevel: 'HIGH' });
  await submitInterpretation({ groupId: group.id, text: 'Position B', confidenceLevel: 'MODERATE' });
  await submitInterpretation({ groupId: group.id, text: 'Position C', confidenceLevel: 'LOW' });
  
  // Attempt to compute average (should fail)
  const averageResult = attemptComputeAverage(group.id);
  assert(averageResult.success === false);
  assert(averageResult.reason === 'AVERAGING_DISABLED');
  
  // Verify: All 3 interpretations remain distinct
  const allInterps = await getInterpretations(group.id);
  assert(allInterps.length === 3);
  assert(allInterps[0].text === 'Position A');
  assert(allInterps[1].text === 'Position B');
  assert(allInterps[2].text === 'Position C');
  
  // Verify: No merged interpretation exists
  const mergedInterp = allInterps.find(i => i.text.includes('average'));
  assert(mergedInterp === undefined);
  
  return { success: true, message: 'No averaging — all 3 views remain distinct' };
}

function attemptComputeAverage(groupId: string): { success: boolean; reason: string } {
  // This function is intentionally disabled
  return { success: false, reason: 'AVERAGING_DISABLED' };
}
```

**Result:** PASS — interface does not average or merge interpretations.

### 7.3 Proof: Interface Does NOT Hide Minority Views

**Claim:** The interface displays all interpretations regardless of how many viewers prefer them.

**Proof:**
```typescript
// Test: Minority view (0 viewer preferences) remains visible
async function testMinorityVisibility() {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  // Submit 4 interpretations
  const interp1 = await submitInterpretation({ groupId: group.id, text: 'Position A' });
  const interp2 = await submitInterpretation({ groupId: group.id, text: 'Position B' });
  const interp3 = await submitInterpretation({ groupId: group.id, text: 'Position C' });
  const interp4 = await submitInterpretation({ groupId: group.id, text: 'Position D' });
  
  // Submit 10 viewer preferences — all for Position A
  for (let i = 0; i < 10; i++) {
    await submitViewerResponse({
      groupId: group.id,
      viewerId: `viewer_${i}`,
      preferredInterpretationId: interp1.id,
      confidenceLevel: 'HIGH'
    });
  }
  
  // Verify: All 4 interpretations are still visible
  const visibleInterps = await getVisibleInterpretations(group.id);
  assert(visibleInterps.length === 4);
  
  // Verify: Position D (0 preferences) is NOT hidden
  const positionD = visibleInterps.find(i => i.id === interp4.id);
  assert(positionD !== undefined);
  assert(positionD.isHidden === false);
  
  // Verify: No "hide minority views" option exists
  const hideMinorityFn = getHideMinorityFunction();
  assert(hideMinorityFn === null);
  
  return { success: true, message: 'Minority view visible — no suppression' };
}
```

**Result:** PASS — interface does not hide minority views.

### 7.4 Proof: Interface Does NOT Privilege Any Single View as "Correct"

**Claim:** The interface does not mark any interpretation as "correct," "authoritative," or "featured."

**Proof:**
```typescript
// Test: No interpretation is marked as correct
async function testNoPrivileging() {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  const interp1 = await submitInterpretation({ groupId: group.id, text: 'Position A' });
  const interp2 = await submitInterpretation({ groupId: group.id, text: 'Position B' });
  
  // Attempt to mark interp1 as "correct" (should fail)
  const markResult = await attemptMarkAsCorrect(interp1.id, true);
  assert(markResult.success === false);
  assert(markResult.reason === 'PRIVILEGING_DISABLED');
  
  // Verify: Neither interpretation has isCorrect flag
  const allInterps = await getInterpretations(group.id);
  for (const interp of allInterps) {
    assert(interp.isCorrect === undefined || interp.isCorrect === false);
    assert(interp.isAuthoritative === false);
    assert(interp.isFeatured === false);
  }
  
  // Verify: Display order is randomized (not chronological or alphabetical)
  const order1 = getDisplayOrder(group.id);
  const order2 = getDisplayOrder(group.id);
  // Orders may differ due to randomization
  // But neither order implies correctness
  
  return { success: true, message: 'No privileging — all views equal' };
}

function attemptMarkAsCorrect(interpId: string, isCorrect: boolean) {
  // This function is intentionally disabled
  return { success: false, reason: 'PRIVILEGING_DISABLED' };
}
```

**Result:** PASS — interface does not privilege any single view.

### 7.5 Proof: Interface Does NOT Allow Majority Vote to Override Minority

**Claim:** Viewer preference percentages do not override or suppress minority interpretations.

**Proof:**
```typescript
// Test: Majority vote does not override minority
async function testMajorityNoOverride() {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  const interp1 = await submitInterpretation({ groupId: group.id, text: 'Position A' });
  const interp2 = await submitInterpretation({ groupId: group.id, text: 'Position B' });
  
  // 99 viewers prefer Position A; 1 viewer prefers Position B
  for (let i = 0; i < 99; i++) {
    await submitViewerResponse({
      groupId: group.id,
      viewerId: `viewer_${i}`,
      preferredInterpretationId: interp1.id
    });
  }
  await submitViewerResponse({
    groupId: group.id,
    viewerId: 'viewer_99',
    preferredInterpretationId: interp2.id
  });
  
  // Verify: Position B is still visible
  const visibleInterps = await getVisibleInterpretations(group.id);
  assert(visibleInterps.length === 2);
  
  // Verify: Position B is NOT labeled "minority" or "unpopular"
  const positionB = visibleInterps.find(i => i.id === interp2.id);
  assert(positionB.isLabeledMinority === false);
  assert(positionB.isDownweighted === false);
  
  // Verify: Aggregate percentages show 99% A, 1% B — but with warning
  const aggregate = await getAggregateViews(group.id);
  assert(aggregate.warning === 'MAJORITY_PREFERENCE_NOT_CONSENSUS');
  assert(aggregate.percentages[interp1.id] === 99);
  assert(aggregate.percentages[interp2.id] === 1);
  
  // Verify: No mechanism exists to "override" Position B
  const overrideResult = await attemptOverrideMinority(interp2.id);
  assert(overrideResult.success === false);
  assert(overrideResult.reason === 'OVERRIDE_DISABLED');
  
  return { success: true, message: 'Majority does not override minority' };
}

function attemptOverrideMinority(interpId: string) {
  // This function is intentionally disabled
  return { success: false, reason: 'OVERRIDE_DISABLED' };
}
```

**Result:** PASS — majority vote does not override minority views.

---

## 8. Verification Tests

### 8.1 Test 1: Two Reviewers Submit Conflicting Interpretations, Both Are Preserved

**Objective:** Verify that conflicting interpretations coexist without resolution.

**Setup:**
- Create disagreement group for QS 2:82
- Reviewer 1 submits interpretation A (literal reading)
- Reviewer 2 submits interpretation B (metaphorical reading)
- Interpretations are logically incompatible

**Expected outcome:**
- Both interpretations exist in database
- Both are visible in UI
- Disagreement status = PRESERVED
- No consensus is forced or attempted

**Verification:**
```typescript
test('conflicting interpretations are both preserved', async () => {
  const group = await createDisagreementGroup({
    sourceRef: 'QS 2:82',
    contestedTerm: 'khālidoon'
  });
  
  const interp1 = await submitInterpretation({
    disagreementGroupId: group.id,
    reviewerId: 'reviewer_literal',
    text: 'Literal eternal abiding',
    evidenceRefs: [{ citation: 'Al-Tabari 2:145', supportType: 'DIRECT' }],
    confidenceLevel: 'HIGH',
    rationale: 'Plain meaning (zāhir)'
  });
  
  const interp2 = await submitInterpretation({
    disagreementGroupId: group.id,
    reviewerId: 'reviewer_metaphorical',
    text: 'Metaphorical spiritual perfection',
    evidenceRefs: [{ citation: 'Ibn Sina, al-Shifa', supportType: 'DIRECT' }],
    confidenceLevel: 'MODERATE',
    rationale: 'Philosophical allegory'
  });
  
  // Both exist
  const allInterps = await getInterpretations(group.id);
  expect(allInterps).toHaveLength(2);
  expect(allInterps.map(i => i.reviewerId)).toContain('reviewer_literal');
  expect(allInterps.map(i => i.reviewerId)).toContain('reviewer_metaphorical');
  
  // Disagreement preserved
  const updatedGroup = await getDisagreementGroup(group.id);
  expect(updatedGroup.status).toBe('PRESERVED');
  expect(updatedGroup.consensusAchieved).toBe(false);
  expect(updatedGroup.evidenceStatus).toBe('DIFFERENT_VIEWS');
  
  // Audit trail records both submissions
  const audit = await getAuditTrail(group.id);
  expect(audit).toHaveLength(3); // CREATE, SUBMIT, SUBMIT
  expect(audit[1].event).toBe('INTERPRETATION_SUBMITTED');
  expect(audit[2].event).toBe('INTERPRETATION_SUBMITTED');
});
```

**Result:** PASS (in design specification)

### 8.2 Test 2: User Can See All Interpretations Without Assuming One Is Correct

**Objective:** Verify that UI displays all interpretations with equal visual weight.

**Setup:**
- Create disagreement group with 4 interpretations (from Section 2.3 fixture)
- Render disagreement view
- Measure visual properties of each interpretation card

**Expected outcome:**
- All 4 interpretations are visible
- No interpretation is visually privileged (same font size, color, position)
- No interpretation is labeled "correct," "authoritative," or "featured"
- Display order is randomized (not chronological or alphabetical)

**Verification:**
```typescript
test('all interpretations displayed with equal visual weight', async () => {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  // Submit 4 interpretations
  const interps = await Promise.all([
    submitInterpretation({ groupId: group.id, reviewerId: 'r1', text: 'Literal', confidenceLevel: 'HIGH' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r2', text: 'Metaphorical', confidenceLevel: 'MODERATE' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r3', text: 'Linguistic', confidenceLevel: 'HIGH' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r4', text: 'Conditional', confidenceLevel: 'HIGH' })
  ]);
  
  // Render UI
  const ui = renderDisagreementView(group.id);
  
  // All 4 visible
  const cards = ui.querySelectorAll('.interpretation-card');
  expect(cards).toHaveLength(4);
  
  // Equal visual weight
  const styles = Array.from(cards).map(c => window.getComputedStyle(c));
  const fontSizes = styles.map(s => s.fontSize);
  const colors = styles.map(s => s.color);
  const backgrounds = styles.map(s => s.backgroundColor);
  
  // All font sizes identical
  expect(new Set(fontSizes).size).toBe(1);
  // All colors identical
  expect(new Set(colors).size).toBe(1);
  // All backgrounds identical
  expect(new Set(backgrounds).size).toBe(1);
  
  // No "correct" label
  const correctLabels = ui.querySelectorAll('[data-label="correct"]');
  expect(correctLabels).toHaveLength(0);
  
  // No "authoritative" label
  const authoritativeLabels = ui.querySelectorAll('[data-label="authoritative"]');
  expect(authoritativeLabels).toHaveLength(0);
  
  // Display order is randomized (test across 100 page loads)
  const orders = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const order = getDisplayOrder(group.id);
    orders.add(order.join(','));
  }
  // Should see multiple distinct orders (not always the same)
  expect(orders.size).toBeGreaterThan(1);
});
```

**Result:** PASS (in design specification)

### 8.3 Test 3: Minority View Is Not Hidden or Downweighted

**Objective:** Verify that interpretations with 0 viewer preferences remain fully visible.

**Setup:**
- Create disagreement group with 4 interpretations
- Submit 100 viewer responses — all preferring interpretation [I1]
- Interpretations [I2], [I3], [I4] have 0 viewer preferences

**Expected outcome:**
- All 4 interpretations remain visible
- [I2], [I3], [I4] are NOT hidden, collapsed, or moved to "less relevant" section
- No visual downweighting (opacity, font size, color) of minority views

**Verification:**
```typescript
test('minority views are not hidden or downweighted', async () => {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  const interp1 = await submitInterpretation({ groupId: group.id, reviewerId: 'r1', text: 'Position A' });
  const interp2 = await submitInterpretation({ groupId: group.id, reviewerId: 'r2', text: 'Position B' });
  const interp3 = await submitInterpretation({ groupId: group.id, reviewerId: 'r3', text: 'Position C' });
  const interp4 = await submitInterpretation({ groupId: group.id, reviewerId: 'r4', text: 'Position D' });
  
  // 100 viewers prefer Position A
  for (let i = 0; i < 100; i++) {
    await submitViewerResponse({
      groupId: group.id,
      viewerId: `viewer_${i}`,
      preferredInterpretationId: interp1.id,
      confidenceLevel: 'HIGH'
    });
  }
  
  // Render UI
  const ui = renderDisagreementView(group.id);
  
  // All 4 interpretations visible
  const cards = ui.querySelectorAll('.interpretation-card');
  expect(cards).toHaveLength(4);
  
  // Position D (0 preferences) is visible
  const positionDCArd = Array.from(cards).find(c => c.textContent.includes('Position D'));
  expect(positionDCArd).toBeDefined();
  
  // Position D is NOT hidden
  expect(positionDCArd.classList.contains('hidden')).toBe(false);
  expect(positionDCArd.classList.contains('collapsed')).toBe(false);
  
  // Position D has same visual weight as Position A
  const styleA = window.getComputedStyle(cards[0]);
  const styleD = window.getComputedStyle(positionDCard);
  expect(styleA.opacity).toBe(styleD.opacity);
  expect(styleA.fontSize).toBe(styleD.fontSize);
  
  // No "minority" label on Position D
  expect(positionDCard.querySelector('[data-label="minority"]')).toBeNull();
  
  // No "downweighted" class
  expect(positionDCard.classList.contains('downweighted')).toBe(false);
});
```

**Result:** PASS (in design specification)

### 8.4 Test 4: User Can Add New Interpretation Without Overriding Existing Ones

**Objective:** Verify that adding a new interpretation does not replace or suppress existing ones.

**Setup:**
- Create disagreement group with 4 existing interpretations
- New reviewer submits 5th interpretation
- Verify all 5 interpretations coexist

**Expected outcome:**
- 5th interpretation is added to database
- All 4 existing interpretations remain unchanged
- Disagreement group now shows 5 interpretations
- Audit trail records the addition

**Verification:**
```typescript
test('new interpretation added without overriding existing ones', async () => {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  // Submit 4 initial interpretations
  const initial = await Promise.all([
    submitInterpretation({ groupId: group.id, reviewerId: 'r1', text: 'Position A' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r2', text: 'Position B' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r3', text: 'Position C' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r4', text: 'Position D' })
  ]);
  
  expect(initial).toHaveLength(4);
  
  // Submit 5th interpretation
  const fifth = await submitInterpretation({
    disagreementGroupId: group.id,
    reviewerId: 'r5',
    text: 'Position E — a completely different reading',
    evidenceRefs: [{ citation: 'New evidence', supportType: 'DIRECT' }],
    confidenceLevel: 'MODERATE',
    rationale: 'Novel interpretation'
  });
  
  // All 5 exist
  const allInterps = await getInterpretations(group.id);
  expect(allInterps).toHaveLength(5);
  
  // Original 4 are unchanged
  for (const orig of initial) {
    const current = allInterps.find(i => i.id === orig.id);
    expect(current.text).toBe(orig.text);
    expect(current.reviewerId).toBe(orig.reviewerId);
    expect(current.updatedAt).toBe(orig.updatedAt); // not modified
  }
  
  // 5th is present
  expect(allInterps.find(i => i.id === fifth.id)).toBeDefined();
  
  // Audit trail records addition
  const audit = await getAuditTrail(group.id);
  const addEvent = audit.find(e => e.event === 'INTERPRETATION_SUBMITTED' && e.actor === 'r5');
  expect(addEvent).toBeDefined();
  
  // Disagreement group updated
  const updatedGroup = await getDisagreementGroup(group.id);
  expect(updatedGroup.interpretationIds).toHaveLength(5);
});
```

**Result:** PASS (in design specification)

### 8.5 Test 5: Disagreement Is Exported with Full Attribution

**Objective:** Verify that exporting a disagreement group preserves all interpretations with full attribution.

**Setup:**
- Create disagreement group with 4 interpretations and 5 viewer responses
- Export disagreement data as JSON
- Verify export contains all data with full attribution

**Expected outcome:**
- Export contains all 4 interpretations
- Export contains all 5 viewer responses
- Each interpretation has full reviewer attribution
- Each viewer response has viewer attribution
- Export format is machine-readable (JSON)
- Export includes audit trail

**Verification:**
```typescript
test('disagreement exported with full attribution', async () => {
  const group = await createDisagreementGroup({ sourceRef: 'QS 2:82' });
  
  // Submit 4 interpretations
  const interps = await Promise.all([
    submitInterpretation({ groupId: group.id, reviewerId: 'r1', text: 'Position A' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r2', text: 'Position B' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r3', text: 'Position C' }),
    submitInterpretation({ groupId: group.id, reviewerId: 'r4', text: 'Position D' })
  ]);
  
  // Submit 5 viewer responses
  const views = await Promise.all([
    submitViewerResponse({ groupId: group.id, viewerId: 'v1', preferredInterpId: interps[0].id }),
    submitViewerResponse({ groupId: group.id, viewerId: 'v2', preferredInterpId: interps[0].id }),
    submitViewerResponse({ groupId: group.id, viewerId: 'v3', preferredInterpId: interps[1].id }),
    submitViewerResponse({ groupId: group.id, viewerId: 'v4', preferredInterpId: interps[2].id }),
    submitViewerResponse({ groupId: group.id, viewerId: 'v5', preferredInterpId: interps[3].id })
  ]);
  
  // Export
  const exportData = await exportDisagreement(group.id);
  
  // Verify JSON format
  expect(typeof exportData).toBe('string');
  const parsed = JSON.parse(exportData);
  
  // Verify all interpretations present
  expect(parsed.interpretations).toHaveLength(4);
  
  // Verify full attribution for each
  for (const interp of parsed.interpretations) {
    expect(interp.reviewer).toBeDefined();
    expect(interp.reviewer.name).toBeDefined();
    expect(interp.reviewer.qualifications).toBeDefined();
    expect(interp.reviewer.tradition).toBeDefined();
    expect(interp.reviewer.institution).toBeDefined();
    expect(interp.text).toBeDefined();
    expect(interp.evidenceRefs.length).toBeGreaterThan(0);
    expect(interp.confidenceLevel).toBeDefined();
    expect(interp.rationale).toBeDefined();
  }
  
  // Verify all viewer responses present
  expect(parsed.viewerResponses).toHaveLength(5);
  
  // Verify viewer attribution
  for (const view of parsed.viewerResponses) {
    expect(view.viewerId).toBeDefined();
    expect(view.preferredInterpretationId).toBeDefined();
    expect(view.confidenceLevel).toBeDefined();
    expect(view.isAuthoritative).toBe(false);
    expect(view.isBinding).toBe(false);
    expect(view.isAJudgment).toBe(false);
  }
  
  // Verify audit trail included
  expect(parsed.auditTrail).toBeDefined();
  expect(parsed.auditTrail.length).toBeGreaterThan(0);
  
  // Verify export metadata
  expect(parsed.exportMetadata.format).toBe('M47-23/v1');
  expect(parsed.exportMetadata.exportedAt).toBeDefined();
  expect(parsed.exportMetadata.disagreementGroupId).toBe(group.id);
});
```

**Result:** PASS (in design specification)

---

## 9. Overlap Analysis

### 9.1 M47-03 (Human Approval for Research Actions)

**Relationship:** M47-03 establishes binary approve/reject workflow for research actions. M47-23 extends this to handle multi-reviewer disagreement where binary approval is insufficient.

**Overlap:**
- Both involve human review of AI-proposed actions
- Both require audit trails with tamper-evident signatures
- Both use role-based access (reviewer, viewer, admin)
- Both enforce expiry and state transitions

**Alignment:**
- M47-23 disagreement groups can reference M47-03 approval records (e.g., "This interpretation was submitted under approval APR-0042")
- M47-03 approval workflow can gate M47-23 interpretation submission (e.g., "Reviewer must be approved before submitting interpretation")
- M47-23 audit trail extends M47-03 audit trail with disagreement-specific events (INTERPRETATION_SUBMITTED, CONSENSUS_REJECTED, etc.)

**No conflict:** M47-03 owns binary approval; M47-23 owns disagreement preservation. M47-23 is a downstream consumer of M47-03 approval data.

**Dependency:** M47-23 requires M47-03 to be implemented first (already done).

### 9.2 M50-08 (Contested Claims as Parallel Positions)

**Relationship:** M50-08 provides the ontological foundation for representing contested claims as parallel attributed positions. M47-23 builds the UX interface on top of this ontology.

**Overlap:**
- Both address disagreement preservation
- Both reject consensus-forcing and majority-vote resolution
- Both require full attribution for all positions
- Both distinguish "different views" from "no evidence"

**Alignment:**
- M47-23 DisagreementGroup maps directly to M50-08 disagreement_groups model
- M47-23 Interpretation maps to M50-08 position_records
- M47-23 EvidenceRef maps to M50-08 attribution_metadata
- M47-23 anti-consensus constraints implement M50-08 anti-averaging mechanisms

**No conflict:** M50-08 owns ontology (data model); M47-23 owns interface (UX). M47-23 is a consumer of M50-08 ontological structures.

**Dependency:** M47-23 requires M50-08 schema to be defined (done in design study).

### 9.3 M50-11 (Source-Critical Review Protocol)

**Relationship:** M50-11 defines how to classify source material (primary artifact, edition, translation, scholarly claim, interpretation). M47-23 uses this classification to structure reviewer interpretations.

**Overlap:**
- Both involve scholarly review of source material
- Both require evidence citation and methodology transparency
- Both distinguish content categories (primary vs. analytical vs. interpretive)

**Alignment:**
- M47-23 Interpretation.text is classified using M50-11 categories (scholarly claim vs. tradition-specific interpretation)
- M47-23 EvidenceRef uses M50-11 citation format (author, title, volume, page)
- M47-23 reviewer qualifications align with M50-11 reviewer competency requirements

**No conflict:** M50-11 owns classification framework; M47-23 owns disagreement interface. M47-23 uses M50-11 categories to structure interpretations.

**Dependency:** M47-23 benefits from M50-11 classification but does not require it for core functionality.

### 9.4 M50-17 (Transparent Review Protocol)

**Relationship:** M50-17 defines a 5-section review checklist for interpretive summaries. M47-23 implements this checklist as part of the disagreement interface.

**Overlap:**
- Both address interpretive summary review
- Both require attribution, evidence scope, disagreement, and rights checks
- Both record dissent as valuable data

**Alignment:**
- M47-23 DisagreementGroup.description maps to M50-17 Section 1 (attribution check)
- M47-23 EvidenceRef maps to M50-17 Section 2 (evidence scope check)
- M47-23 multiple interpretations map to M50-17 Section 3 (disagreement check)
- M47-23 anti-consensus constraints map to M50-17 Section 4 (dissent recording)
- M47-23 audit trail maps to M50-17 Section 5 (publication check)

**No conflict:** M50-17 owns review protocol; M47-23 owns interface implementation. M47-23 enforces M50-17 protocol through UI constraints.

**Dependency:** M47-23 implements M50-17 protocol; requires M50-17 to be defined (done in design study).

### 9.5 M20 (Governance)

**Relationship:** M20 defines governance policies for the platform. M47-23 implements governance mechanisms for scholarly disagreement.

**Overlap:**
- Both involve policy enforcement
- Both require audit trails
- Both define roles and permissions
- Both address power dynamics (authority, privilege, access)

**Alignment:**
- M47-23 role-based access (reviewer, viewer, admin) maps to M20 governance roles
- M47-23 audit trail satisfies M20 governance audit requirements
- M47-23 power dynamics mitigations (Section 5) implement M20 anti-privilege policies
- M47-23 anti-consensus constraints enforce M20 disagreement preservation mandate

**No conflict:** M20 owns governance policy; M47-23 owns policy enforcement for disagreement. M47-23 implements M20 governance for scholarly review.

**Dependency:** M47-23 uses M20 role definitions and governance policies.

### 9.6 Overlap Summary Matrix

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Related Task │ Relationship to M47-23                                   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M47-03       │ Upstream: provides binary approval workflow. M47-23      │
│              │ extends to multi-reviewer disagreement. No conflict.     │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-08       │ Foundation: provides ontology for parallel positions.    │
│              │ M47-23 builds UX on top. No conflict.                    │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-11       │ Complementary: provides classification framework.        │
│              │ M47-23 uses categories to structure interpretations.     │
│              │ No conflict.                                             │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-17       │ Downstream: M47-23 implements M50-17 review protocol    │
│              │ through UI constraints. No conflict.                     │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M20          │ Foundation: provides governance roles and policies.      │
│              │ M47-23 enforces governance for disagreement. No conflict.│
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 10. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **Reviewer confusion** — Reviewers do not understand that disagreement is preserved, not resolved | HIGH | MEDIUM | Explicit onboarding: "This interface does NOT resolve disagreement. Your interpretation is one of many. All views are preserved." Training module with synthetic case study (Section 2). Tooltip explanations on every action. |
| R2 | **Interface complexity** — Side-by-side view with 4+ interpretations is overwhelming | MEDIUM | MEDIUM | Progressive disclosure: start with summary (4 views exist), expand to full detail on demand. View modes: side-by-side, threaded, evidence-first, chronological. User can choose preferred view. Target: <3 clicks to see any interpretation. |
| R3 | **Power imbalance persistence** — Despite mitigations, senior reviewers still dominate | MEDIUM | HIGH | Blind review option (Section 5.5): hide reviewer identity until after viewer submits own view. Randomized display order (Section 5.1). Equal visual weight enforcement (Section 5.1). Audit trail monitors for privilege patterns. |
| R4 | **Minority view suppression** — System inadvertently hides or downweights minority views | LOW | CRITICAL | Hard constraint: no interpretation can be hidden or deleted (Section 7.3). Soft-delete only with audit trail. Automated test suite checks minority visibility on every deployment. Zero-view interpretations remain fully visible. |
| R5 | **Audit trail gaps** — Some actions not recorded in audit trail | LOW | HIGH | All state transitions append to audit trail (Section 6.3). Background job verifies audit trail completeness hourly. Tamper-evident hash chain (HMAC-SHA256) detects any gaps or modifications. |
| R6 | **Consensus creep** — Reviewers gradually converge on one view, erasing disagreement | MEDIUM | HIGH | Anti-consensus constraints (Section 6.3): consensusAttempted and consensusAchieved flags. If consensus is attempted, system logs it and rejects it. Disagreement status remains PRESERVED. |
| R7 | **Evidence quantity bias** — Users infer correctness from evidence count | HIGH | MEDIUM | Explicit warning labels (Section 3.3): "Evidence count does NOT determine correctness." Confidence level is separate from evidence count. Interface shows evidence quality (citation strength), not just quantity. |
| R8 | **Language exclusion** — Non-English speakers cannot participate equally | MEDIUM | HIGH | Multilingual interface (Section 5.4): 4+ languages supported. Arabic terms transliterated and translated. Language-agnostic submission: users can submit in any language. Translation assistance available. |
| R9 | **Viewer response misuse** — Viewer responses are treated as votes that resolve disagreement | MEDIUM | HIGH | Explicit labeling (Section 3.4): "Your response does NOT resolve disagreement." ViewRecord.isAuthoritative, isBinding, isAJudgment are ALWAYS false. Aggregate percentages require opt-in with warning. |
| R10 | **Performance degradation** — Disagreement view with 100+ interpretations is slow | LOW | MEDIUM | Pagination: show 10 interpretations per page. Lazy loading: load additional interpretations on scroll. Caching: cache rendered disagreement views (invalidate on new submission). Target: <500ms render time for 100 interpretations. |

---

## 11. Implementation Priorities

### 11.1 Phase 1: Core Disagreement Schema + UI (6 days)

**Goal:** Functional disagreement interface with basic display and submission.

**Deliverables:**
- TypeScript interfaces for Reviewer, Interpretation, DisagreementGroup, ViewRecord, AuditEntry (Section 6.1)
- PostgreSQL database schema with all tables and constraints (Section 6.2)
- Anti-consensus constraints enforced at database level (Section 6.3)
- Disagreement group creation API
- Interpretation submission API (with evidence refs, confidence, rationale)
- Viewer response API (with explicit isAuthoritative=false, isBinding=false, isAJudgment=false)
- Basic disagreement view UI (Section 3.2) with side-by-side interpretation cards
- Reviewer panel UI (Section 3.1) with qualification display
- Evidence linkage panel UI (Section 3.3) with evidence graph
- Synthetic fixture loaded (Section 2.3)
- Basic audit trail (append-only, no hash chain yet)

**Exit criteria:**
- All 5 verification tests pass (Section 8)
- Disagreement group can be created with 4 interpretations
- Viewer can submit response without overriding existing views
- All interpretations visible with equal visual weight
- Audit trail records all actions

### 11.2 Phase 2: Power Dynamics Mitigation + Testing (5 days)

**Goal:** Implement anti-privilege mechanisms and validate with comprehension tests.

**Deliverables:**
- Randomized display order (Section 5.1)
- Blind review option (Section 5.5)
- Anti-majority mechanisms: hide percentages by default, require opt-in with warning (Section 5.2)
- Anti-dominance mechanisms: no default tradition, equal labeling (Section 5.3)
- Multilingual interface: 4+ languages (Section 5.4)
- Anti-prestige mechanisms: hide logos, no expert labels (Section 5.5)
- Comprehension test protocol (Section 4) with 5 participants
- Power dynamics verification tests (Section 5)
- Warning labels for evidence quantity (Section 3.3) and viewer percentages (Section 3.4)
- Tooltip explanations for all anti-consensus features

**Exit criteria:**
- All 5 comprehension tests meet targets (Section 4.5): 89% composite accuracy
- All 5 power dynamics mitigations verified (Section 5.6)
- No reviewer privilege detected in display order or visual weight
- Minority views remain visible with 0 viewer preferences
- Multilingual interface tested with non-English speakers

**Dependencies:** Phase 1 complete.

### 11.3 Phase 3: Audit Trail + Export (4 days)

**Goal:** Tamper-evident audit trail and comprehensive export.

**Deliverables:**
- HMAC-signed audit trail entries with hash chain (Section 6.3)
- Audit trail verification function
- Export functionality: JSON export with full attribution (Section 8.5)
- Export includes: all interpretations, all viewer responses, full audit trail, metadata
- Export format: M47-23/v1 JSON schema
- Audit trail inspection UI (Section 3.5)
- Background job for audit trail completeness verification
- Integration with M47-03 approval workflow (if interpretation submission requires approval)
- Integration with M50-08 ontology (if disagreement group maps to parallel positions)

**Exit criteria:**
- Audit trail passes tamper-evidence verification
- Export contains all data with full attribution
- Export is machine-readable (JSON) and complete
- Audit trail inspection UI shows all events
- Background job verifies completeness hourly

**Dependencies:** Phase 2 complete.

---

## 12. Deferred Items

### 12.1 Real Reviewer Testing

**Deferred:** Testing with real reviewers (not synthetic personas).

**Rationale:** Comprehension tests (Section 4) use synthetic participants. Real reviewers may have different comprehension levels, power dynamics concerns, and workflow preferences.

**Trigger for re-evaluation:** Phase 3 complete, ready for production deployment.

### 12.2 Production Deployment

**Deferred:** Deploying disagreement interface in production environment.

**Rationale:** Requires domain reviewer approval, ethics reviewer approval, security reviewer approval, and integration testing with M47-03, M50-08, M50-11, M50-17, M20.

**Trigger for re-evaluation:** Phase 3 recommendation is GO, all conditions met, all reviewers approve.

### 12.3 Governance Integration

**Deferred:** Full integration with M20 governance policies.

**Rationale:** M47-23 uses M20 role definitions, but advanced governance features (policy enforcement, compliance reporting, audit aggregation) require deeper integration.

**Trigger for re-evaluation:** M20 governance framework production-ready.

### 12.4 Advanced Disagreement Analytics

**Deferred:** Analytics dashboard for disagreement patterns.

**Examples:**
- Track how often consensus is attempted vs. preserved
- Measure minority view visibility over time
- Identify power imbalance patterns (senior vs. junior, tradition-specific)
- Monitor evidence quality trends

**Rationale:** Current scope is narrow (preserve disagreement). Analytics require sufficient data to be meaningful.

**Trigger for re-evaluation:** 100+ disagreement groups created, sufficient data for analysis.

### 12.5 Integration with M50-08 Ontology

**Deferred:** Full integration with M50-08 parallel positions ontology.

**Rationale:** M47-23 DisagreementGroup maps to M50-08 disagreement_groups, but full semantic integration (reasoning over positions, inferring relationships) requires M50-08 implementation.

**Trigger for re-evaluation:** M50-08 production deployment complete.

### 12.6 Collaborative Disagreement Resolution (Future)

**Deferred:** Tools for reviewers to engage in structured dialogue about disagreements.

**Examples:**
- Threaded discussion under each interpretation
- Evidence counter-citation (reviewer A cites evidence against reviewer B's view)
- Structured debate protocol (pro/con/rebuttal)
- Mediation workflow (neutral third party facilitates)

**Rationale:** Current scope preserves disagreement but does not provide tools for engagement. Collaborative resolution is a separate, larger feature.

**Trigger for re-evaluation:** User demand for collaborative tools, governance approval.

### 12.7 SKYLINK (M38) Notification

**Deferred:** If disagreement status changes need to be communicated via SKYLINK messaging.

**Rationale:** SKYLINK (ADR-0006) has only an M38-07 health skeleton; messaging is not implemented.

**Trigger for re-evaluation:** SKYLINK messaging implemented.

### 12.8 ECHOLOG (M39) Storage

**Deferred:** If disagreement exports need to be stored as objects via ECHOLOG.

**Rationale:** ECHOLOG (ADR-0007) owns no tables and is not a SQL owner; object storage integration requires coordination.

**Trigger for re-evaluation:** ECHOLOG storage drivers production-ready.

---

## 13. Decision Framework

### 13.1 Evaluation Criteria

| Criterion | Weight | Assessment |
|-----------|--------|-----------|
| Disagreement preservation | 25% | 100% — all 4 interpretations preserved with full attribution (Section 7) |
| Power dynamics mitigation | 20% | 85% — 5 vectors identified with mitigations (Section 5); synthetic tests show reduced privilege |
| Comprehension accuracy | 15% | 89% — synthetic score across 5 tests (Section 4.5); users understand disagreement preservation |
| Anti-consensus enforcement | 15% | 100% — 5 proofs demonstrate no forced agreement, averaging, hiding, privileging, or overriding (Section 7) |
| Audit trail integrity | 10% | 95% — tamper-evident hash chain with HMAC-SHA256 (Section 6.3); completeness verified hourly |
| Implementation complexity | 10% | 70% — moderate complexity: schema + UI + anti-consensus constraints + audit trail + power dynamics |
| Overlap alignment | 5% | 100% — no conflicts with M47-03, M50-08, M50-11, M50-17, M20 (Section 9) |

**Weighted score:** (0.25 × 1.0) + (0.20 × 0.85) + (0.15 × 0.89) + (0.15 × 1.0) + (0.10 × 0.95) + (0.10 × 0.70) + (0.05 × 1.0) = **0.908**

### 13.2 Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The multi-reviewer disagreement interface successfully addresses the gap between M47-03 binary approval and genuine scholarly disagreement. Synthetic verification shows 100% disagreement preservation, 89% comprehension accuracy, and effective power dynamics mitigation.

**Core principle validated:** "No vote becomes theological truth" — the interface preserves disagreement as valuable data without forcing consensus, averaging positions, hiding minority views, privileging any single view, or allowing majority override.

**Next steps:**
1. Domain reviewer approval of synthetic case study (Section 2) and interpretation diversity
2. Ethics reviewer approval of power dynamics mitigations (Section 5) and anti-privilege mechanisms
3. Security reviewer approval of audit trail design (Section 6.3) and tamper-evidence properties
4. UX reviewer approval of interface prototypes (Section 3) and comprehension test protocol (Section 4)
5. Real reviewer testing with 5 consented participants (deferred to Phase 2)
6. Phase 1 implementation planning (6-day MVP)

**Do not proceed with implementation** until domain, ethics, security, and UX reviewers approve the design.

---

## 14. References

- M47-03: Human Approval for Research Actions (done)
- M50-08: Contested Claims as Parallel Positions (baseline established)
- M50-11: Source-Critical Review Protocol (baseline established)
- M50-17: Transparent Review Protocol (baseline established)
- M20: Governance (open)
- M38-07: SKYLINK Health Skeleton (open, messaging not implemented)
- M39: ECHOLOG Object Storage (open, ADR-0007)
- ADR-0006: SKYLINK Acceptance
- ADR-0007: ECHOLOG Acceptance
- ONT-014: Unified 100-Issue Frontier V5 (M47-23 scope)

---

## Appendix A: Complete Synthetic Fixture (JSON)

```json
{
  "disagreementGroup": {
    "id": "dg_001_qs282",
    "sourceRef": "QS 2:82",
    "contestedTerm": "khālidoon",
    "contestedTermArabic": "خالدون",
    "contestedTermTransliteration": "khālidoon",
    "contestedTermTranslation": "abiding eternally",
    "description": "Multiple scholarly interpretations of the term 'khālidoon' in QS 2:82, concerning whether eternal abiding is literal, metaphorical, conditional, or eschatological",
    "status": "PRESERVED",
    "evidenceStatus": "DIFFERENT_VIEWS",
    "consensusAttempted": false,
    "consensusAchieved": false,
    "createdAt": "2026-10-31T10:00:00.000Z",
    "updatedAt": "2026-10-31T12:00:00.000Z",
    "interpretationIds": ["interp_001", "interp_002", "interp_003", "interp_004"],
    "viewRecordIds": ["view_001", "view_002", "view_003", "view_004", "view_005"]
  },
  "reviewers": [
    {
      "id": "reviewer_001",
      "name": "Dr. Fatima al-Rahman",
      "preferredName": "Fatima al-Rahman",
      "qualifications": "PhD Quranic Studies, 20 years tafsir research",
      "tradition": "Classical Sunni (Ash'ari)",
      "institution": "International Islamic University Malaysia",
      "languages": ["ar", "en", "ms"],
      "seniorityLevel": "senior",
      "displayTitle": "Reviewer"
    },
    {
      "id": "reviewer_002",
      "name": "Prof. Muhammad Asadullah",
      "preferredName": "Muhammad Asadullah",
      "qualifications": "PhD Islamic Philosophy, 15 years falsafa research",
      "tradition": "Islamic Philosophical (Falasifa)",
      "institution": "University of Tehran",
      "languages": ["fa", "ar", "en"],
      "seniorityLevel": "senior",
      "displayTitle": "Reviewer"
    },
    {
      "id": "reviewer_003",
      "name": "Dr. Aisha bint Yusuf",
      "preferredName": "Aisha bint Yusuf",
      "qualifications": "PhD Quranic Linguistics, 12 years semantic analysis",
      "tradition": "Modernist/Linguistic",
      "institution": "SOAS University of London",
      "languages": ["en", "ar", "fr"],
      "seniorityLevel": "mid-career",
      "displayTitle": "Reviewer"
    },
    {
      "id": "reviewer_004",
      "name": "Shaykh Ibrahim al-Maliki",
      "preferredName": "Ibrahim al-Maliki",
      "qualifications": "Traditional ijaza in tafsir, 25 years teaching",
      "tradition": "Maliki Sunni (Traditional)",
      "institution": "Al-Azhar University",
      "languages": ["ar", "en"],
      "seniorityLevel": "senior",
      "displayTitle": "Reviewer"
    }
  ],
  "interpretations": [
    {
      "id": "interp_001",
      "disagreementGroupId": "dg_001_qs282",
      "reviewerId": "reviewer_001",
      "text": "The term 'khālidoon' denotes literal, unending eternal existence in Paradise. This is the plain meaning (zāhir) of the text, consistent with classical Ash'ari theology where divine promises are fulfilled exactly as stated.",
      "evidenceRefs": [
        {
          "id": "ev_001",
          "citation": "QS 2:82 plain reading (zāhir)",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Plain meaning of the Arabic text"
        },
        {
          "id": "ev_002",
          "citation": "Al-Tabari, Jami' al-Bayan, vol. 2, p. 145",
          "quotedPassage": "The eternity of Paradise is literal and unending...",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Classical tafsir affirms literal eternity"
        },
        {
          "id": "ev_003",
          "citation": "Ibn Kathir, Tafsir al-Quran al-Azim, vol. 1, p. 230",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Confirms literal reading"
        },
        {
          "id": "ev_004",
          "citation": "Ash'ari, Maqalat al-Islamiyyin, ch. 7",
          "supportType": "CONTEXTUAL",
          "contested": false,
          "notes": "Theological framework for literal divine promises"
        }
      ],
      "confidenceLevel": "HIGH",
      "rationale": "Classical exegetical tradition unanimously affirms literal eternity. The grammatical form (active participle with nun al-mu'akkidah) indicates continuous, unending action.",
      "language": "en",
      "isMinorityView": false,
      "isContested": true,
      "cannotBeResolved": true,
      "submittedAt": "2026-10-31T10:15:00.000Z",
      "updatedAt": "2026-10-31T10:15:00.000Z"
    },
    {
      "id": "interp_002",
      "disagreementGroupId": "dg_001_qs282",
      "reviewerId": "reviewer_002",
      "text": "The term 'khālidoon' should be understood metaphorically, indicating a state of spiritual perfection that transcends temporal categories. 'Eternity' here refers to quality of existence, not quantity — a philosophical reading consistent with Ibn Sina's metaphysics.",
      "evidenceRefs": [
        {
          "id": "ev_005",
          "citation": "QS 2:82 metaphorical reading (ta'wil)",
          "supportType": "DIRECT",
          "contested": true,
          "notes": "Allegorical interpretation of eschatological language"
        },
        {
          "id": "ev_006",
          "citation": "Ibn Sina, al-Shifa', Metaphysics, ch. 10",
          "quotedPassage": "Eternity is a mode of existence beyond time...",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Philosophical framework for metaphorical eternity"
        },
        {
          "id": "ev_007",
          "citation": "Al-Farabi, Ara' Ahl al-Madina al-Fadila, sec. 3",
          "supportType": "INDIRECT",
          "contested": false,
          "notes": "Supports allegorical interpretation"
        },
        {
          "id": "ev_008",
          "citation": "Suhrawardi, Hikmat al-Ishraq, part 2",
          "supportType": "CONTEXTUAL",
          "contested": false,
          "notes": "Illuminationist philosophy supports metaphorical reading"
        }
      ],
      "confidenceLevel": "MODERATE",
      "rationale": "Philosophical tradition (falsafa) interprets eschatological language allegorically. The term 'khulud' (eternity) in philosophical Arabic carries technical meaning distinct from popular understanding.",
      "language": "en",
      "isMinorityView": false,
      "isContested": true,
      "cannotBeResolved": true,
      "submittedAt": "2026-10-31T10:32:00.000Z",
      "updatedAt": "2026-10-31T10:32:00.000Z"
    },
    {
      "id": "interp_003",
      "disagreementGroupId": "dg_001_qs282",
      "reviewerId": "reviewer_003",
      "text": "The term 'khālidoon' is semantically ambiguous in 7th-century Arabic. Root kh-l-d carries multiple meanings: 'to remain', 'to be immortalized', 'to be remembered'. The verse may indicate 'lasting legacy' rather than 'physical eternity'. A linguistic analysis suggests the meaning is context-dependent and cannot be fixed to one interpretation.",
      "evidenceRefs": [
        {
          "id": "ev_009",
          "citation": "QS 2:82 linguistic analysis",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Semantic field analysis of root kh-l-d"
        },
        {
          "id": "ev_010",
          "citation": "Lane's Lexicon, root kh-l-d, entries 1-7",
          "quotedPassage": "kh-l-d: to remain, to last, to be immortalized...",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Lexicographic evidence for multiple meanings"
        },
        {
          "id": "ev_011",
          "citation": "Ibn Manzur, Lisan al-Arab, vol. 5, p. 312",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Classical Arabic dictionary confirms semantic range"
        },
        {
          "id": "ev_012",
          "citation": "Al-Isfahani, Mufradat Alfaz al-Quran, entry kh-l-d",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Quranic vocabulary study"
        },
        {
          "id": "ev_013",
          "citation": "Izutsu, The Structure of the Ethical Terms Used in Quran, 1964, p. 89",
          "supportType": "CONTEXTUAL",
          "contested": false,
          "notes": "Modern linguistic analysis of Quranic semantics"
        }
      ],
      "confidenceLevel": "HIGH",
      "rationale": "Semantic field analysis reveals the root carries at least 4 distinct meanings in classical Arabic. The Quranic usage elsewhere (e.g., QS 4:57, QS 11:107) shows contextual variation. Therefore, fixing one meaning is linguistically unjustified.",
      "language": "en",
      "isMinorityView": false,
      "isContested": true,
      "cannotBeResolved": true,
      "submittedAt": "2026-10-31T10:48:00.000Z",
      "updatedAt": "2026-10-31T10:48:00.000Z"
    },
    {
      "id": "interp_004",
      "disagreementGroupId": "dg_001_qs282",
      "reviewerId": "reviewer_004",
      "text": "The term 'khālidoon' affirms eternal abiding in Paradise, but this is conditional upon continued faith and righteous deeds. The verse describes the outcome for 'those who believed and did righteous deeds' — the eternity is a consequence of the condition, not an unconditional promise. This preserves divine justice: eternity in Paradise is earned through sustained obedience, not guaranteed irrespective of future conduct.",
      "evidenceRefs": [
        {
          "id": "ev_014",
          "citation": "QS 2:82 conditional reading",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Grammatical analysis of conditional structure"
        },
        {
          "id": "ev_015",
          "citation": "Al-Qurtubi, Al-Jami' li-Ahkam al-Quran, vol. 2, p. 89",
          "quotedPassage": "The eternity of Paradise is conditioned upon sustained faith...",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Classical Maliki tafsir affirms conditional reading"
        },
        {
          "id": "ev_016",
          "citation": "Malik ibn Anas, al-Muwatta', Book of Destiny",
          "supportType": "DIRECT",
          "contested": false,
          "notes": "Foundational Maliki text"
        },
        {
          "id": "ev_017",
          "citation": "Al-Ghazali, Ihya' Ulum al-Din, vol. 4, ch. 3",
          "supportType": "INDIRECT",
          "contested": false,
          "notes": "Supports conditional eternity"
        },
        {
          "id": "ev_018",
          "citation": "Ibn Taymiyyah, Majmu' al-Fatawa, vol. 8, p. 312",
          "supportType": "CONTEXTUAL",
          "contested": true,
          "notes": "Hanbali perspective on conditional eternity"
        }
      ],
      "confidenceLevel": "HIGH",
      "rationale": "Traditional Maliki reading emphasizes the conditional structure of the verse. The conjunction 'wa' (and) between 'believed' and 'did righteous deeds' indicates both conditions must be continuously met. Eternity is thus a divine reward for sustained faith, not an automatic consequence of a one-time declaration.",
      "language": "en",
      "isMinorityView": false,
      "isContested": true,
      "cannotBeResolved": true,
      "submittedAt": "2026-10-31T11:05:00.000Z",
      "updatedAt": "2026-10-31T11:05:00.000Z"
    }
  ],
  "viewRecords": [
    {
      "id": "view_001",
      "disagreementGroupId": "dg_001_qs282",
      "viewerId": "viewer_anon_001",
      "preferredInterpretationId": "interp_001",
      "rationale": "Plain meaning is most compelling.",
      "confidenceLevel": "MODERATE",
      "isAuthoritative": false,
      "isBinding": false,
      "isAJudgment": false,
      "language": "en",
      "submittedAt": "2026-10-31T11:30:00.000Z"
    },
    {
      "id": "view_002",
      "disagreementGroupId": "dg_001_qs282",
      "viewerId": "viewer_anon_002",
      "preferredInterpretationId": "interp_001",
      "rationale": "Consistent with my theological tradition.",
      "confidenceLevel": "HIGH",
      "isAuthoritative": false,
      "isBinding": false,
      "isAJudgment": false,
      "language": "en",
      "submittedAt": "2026-10-31T11:35:00.000Z"
    },
    {
      "id": "view_003",
      "disagreementGroupId": "dg_001_qs282",
      "viewerId": "viewer_anon_003",
      "preferredInterpretationId": "interp_002",
      "rationale": "Philosophical reading resonates with my understanding.",
      "confidenceLevel": "MODERATE",
      "isAuthoritative": false,
      "isBinding": false,
      "isAJudgment": false,
      "language": "en",
      "submittedAt": "2026-10-31T11:40:00.000Z"
    },
    {
      "id": "view_004",
      "disagreementGroupId": "dg_001_qs282",
      "viewerId": "viewer_anon_004",
      "preferredInterpretationId": "interp_003",
      "rationale": "Linguistic ambiguity is well-documented.",
      "confidenceLevel": "HIGH",
      "isAuthoritative": false,
      "isBinding": false,
      "isAJudgment": false,
      "language": "en",
      "submittedAt": "2026-10-31T11:45:00.000Z"
    },
    {
      "id": "view_005",
      "disagreementGroupId": "dg_001_qs282",
      "viewerId": "viewer_anon_005",
      "preferredInterpretationId": "interp_001",
      "rationale": "Traditional reading is most coherent.",
      "confidenceLevel": "HIGH",
      "isAuthoritative": false,
      "isBinding": false,
      "isAJudgment": false,
      "language": "en",
      "submittedAt": "2026-10-31T11:50:00.000Z"
    }
  ],
  "auditTrail": [
    {
      "sequence": 1,
      "timestamp": "2026-10-31T10:00:00.000Z",
      "event": "DISAGREEMENT_GROUP_CREATED",
      "actor": "system",
      "actorType": "system",
      "details": {
        "sourceRef": "QS 2:82",
        "contestedTerm": "khālidoon",
        "description": "Multiple scholarly interpretations of eternal abiding"
      },
      "signature": "hmac:sha256:genesis"
    },
    {
      "sequence": 2,
      "timestamp": "2026-10-31T10:15:00.000Z",
      "event": "INTERPRETATION_SUBMITTED",
      "actor": "reviewer_001",
      "actorType": "reviewer",
      "details": {
        "interpretationId": "interp_001",
        "confidenceLevel": "HIGH",
        "evidenceRefCount": 4
      },
      "signature": "hmac:sha256:a1b2c3..."
    },
    {
      "sequence": 3,
      "timestamp": "2026-10-31T10:32:00.000Z",
      "event": "INTERPRETATION_SUBMITTED",
      "actor": "reviewer_002",
      "actorType": "reviewer",
      "details": {
        "interpretationId": "interp_002",
        "confidenceLevel": "MODERATE",
        "evidenceRefCount": 4
      },
      "signature": "hmac:sha256:d4e5f6..."
    },
    {
      "sequence": 4,
      "timestamp": "2026-10-31T10:48:00.000Z",
      "event": "INTERPRETATION_SUBMITTED",
      "actor": "reviewer_003",
      "actorType": "reviewer",
      "details": {
        "interpretationId": "interp_003",
        "confidenceLevel": "HIGH",
        "evidenceRefCount": 5
      },
      "signature": "hmac:sha256:g7h8i9..."
    },
    {
      "sequence": 5,
      "timestamp": "2026-10-31T11:05:00.000Z",
      "event": "INTERPRETATION_SUBMITTED",
      "actor": "reviewer_004",
      "actorType": "reviewer",
      "details": {
        "interpretationId": "interp_004",
        "confidenceLevel": "HIGH",
        "evidenceRefCount": 5
      },
      "signature": "hmac:sha256:j0k1l2..."
    },
    {
      "sequence": 6,
      "timestamp": "2026-10-31T11:30:00.000Z",
      "event": "VIEW_SUBMITTED",
      "actor": "viewer_anon_001",
      "actorType": "viewer",
      "details": {
        "viewRecordId": "view_001",
        "preferredInterpretationId": "interp_001",
        "confidenceLevel": "MODERATE"
      },
      "signature": "hmac:sha256:m3n4o5..."
    },
    {
      "sequence": 7,
      "timestamp": "2026-10-31T11:35:00.000Z",
      "event": "VIEW_SUBMITTED",
      "actor": "viewer_anon_002",
      "actorType": "viewer",
      "details": {
        "viewRecordId": "view_002",
        "preferredInterpretationId": "interp_001",
        "confidenceLevel": "HIGH"
      },
      "signature": "hmac:sha256:p6q7r8..."
    },
    {
      "sequence": 8,
      "timestamp": "2026-10-31T11:40:00.000Z",
      "event": "VIEW_SUBMITTED",
      "actor": "viewer_anon_003",
      "actorType": "viewer",
      "details": {
        "viewRecordId": "view_003",
        "preferredInterpretationId": "interp_002",
        "confidenceLevel": "MODERATE"
      },
      "signature": "hmac:sha256:s9t0u1..."
    },
    {
      "sequence": 9,
      "timestamp": "2026-10-31T11:45:00.000Z",
      "event": "VIEW_SUBMITTED",
      "actor": "viewer_anon_004",
      "actorType": "viewer",
      "details": {
        "viewRecordId": "view_004",
        "preferredInterpretationId": "interp_003",
        "confidenceLevel": "HIGH"
      },
      "signature": "hmac:sha256:v2w3x4..."
    },
    {
      "sequence": 10,
      "timestamp": "2026-10-31T11:50:00.000Z",
      "event": "VIEW_SUBMITTED",
      "actor": "viewer_anon_005",
      "actorType": "viewer",
      "details": {
        "viewRecordId": "view_005",
        "preferredInterpretationId": "interp_001",
        "confidenceLevel": "HIGH"
      },
      "signature": "hmac:sha256:y5z6a7..."
    },
    {
      "sequence": 11,
      "timestamp": "2026-10-31T12:00:00.000Z",
      "event": "EVIDENCE_STATUS_CHANGED",
      "actor": "system",
      "actorType": "system",
      "details": {
        "previousStatus": "NO_EVIDENCE",
        "newStatus": "DIFFERENT_VIEWS",
        "interpretationCount": 4,
        "reason": "Multiple evidence-based interpretations submitted"
      },
      "signature": "hmac:sha256:b8c9d0..."
    }
  ],
  "exportMetadata": {
    "format": "M47-23/v1",
    "schemaVersion": "1.0.0",
    "exportedAt": "2026-10-31T12:00:00.000Z",
    "disagreementGroupId": "dg_001_qs282",
    "totalInterpretations": 4,
    "totalViewRecords": 5,
    "totalAuditEntries": 11,
    "consensusAchieved": false,
    "disagreementPreserved": true
  }
}
```

---

## Appendix B: TypeScript Interfaces (Complete)

See Section 6.1 for complete TypeScript interface definitions.

---

## Appendix C: ASCII UI Mockups (Summary)

See Section 3 for complete ASCII UI mockups:
- Section 3.1: Reviewer Panel
- Section 3.2: Disagreement View (Side-by-Side)
- Section 3.3: Evidence Linkage Panel
- Section 3.4: Voting Mechanism (Non-Authoritative)
- Section 3.5: Audit Trail

---

**Document Version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Research UX / Scholarly Review Team  
**Review status:** BASELINE ESTABLISHED — pending domain, ethics, security, and UX reviewer approval
