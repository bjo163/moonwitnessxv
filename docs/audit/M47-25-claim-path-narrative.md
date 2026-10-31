# M47-25 — Claim Path Narrative with Visible Provenance

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Explore a "claim path" narrative with provenance visible
**Priority:** P2 | Difficulty: D4 | Effort: L (6–12 days)
**Dependencies:** M47-14 (claim/evidence simulator) — closed
**Owner:** research UX

---

## Objective

Prototype a sequence view that follows how a claim is cited, interpreted, and revised.

---

## Scope (from specification)

- Draft case
- Model lanes
- Test category distinction
- Review with researcher
- Decide

---

## Acceptance Criteria

- Users correctly identify the origin/class of each card
- Transitions show source/version

---

## Design: Claim Path Narrative

### 1. Core Concept

A **claim path** is a chronological sequence of **claim cards** that shows how a scholarly claim evolves over time: who made it, what evidence they cited, how others interpreted it, and whether it was revised or rejected. Each card in the path is a discrete event in the claim's lifecycle.

**Key invariant:** The claim path is *descriptive*, not *prescriptive*. It shows what happened, not what should be believed. Provenance is visible — every card cites its source.

---

### 2. Draft Case: "The QS 2:82 Salvation Interpretation"

**Initial claim (2020):**
- **Claimant:** Dr. Ahmad Rahman
- **Claim:** "QS 2:82 teaches that salvation is guaranteed for believers who perform righteous deeds."
- **Evidence cited:** QS 2:82 (Cairo 1924 Hafs edition), Indonesian Kemenag translation
- **Interpretation:** Literal reading; "khalidun" (eternal) implies permanent salvation

**First revision (2022):**
- **Claimant:** Prof. Siti Nurhaliza
- **Claim:** "QS 2:82 describes the *promise* of salvation, not its *mechanism*. The verse does not address whether salvation can be lost."
- **Evidence cited:** QS 2:82, comparative analysis with QS 3:85 (which addresses disbelief)
- **Interpretation:** Contextual reading; salvation theology requires cross-referencing multiple verses

**Second revision (2024):**
- **Claimant:** Dr. Yusuf Abdullah
- **Claim:** "QS 2:82's 'khalidun' is ambiguous — it may mean 'eternal' or 'long-lasting'. The verse alone cannot settle the theological debate."
- **Evidence cited:** QS 2:82, classical Arabic lexicon (Lisan al-Arab), 3 manuscript variants
- **Interpretation:** Philological reading; textual ambiguity requires humility

**Current status (2026):**
- **Consensus:** No consensus. Three interpretations coexist.
- **Open questions:** Does "khalidun" imply permanence? Can salvation be lost? What do other verses say?

---

### 3. Claim Card Schema

```typescript
type ClaimCard = {
  id: string // stable identifier
  timestamp: string // ISO 8601
  claimant: {
    name: string
    affiliation: string | null
    role: 'scholar' | 'researcher' | 'community' | 'system'
  }
  claim: {
    text: string
    category: 'initial' | 'revision' | 'rejection' | 'synthesis' | 'question'
    confidence: 'high' | 'medium' | 'low' | 'disputed'
  }
  evidence: {
    citations: Citation[]
    methodology: string | null
  }
  interpretation: {
    approach: string // e.g. "literal", "contextual", "philological"
    notes: string | null
  }
  provenance: {
    source: string // e.g. "Journal of Quranic Studies, Vol. 15, p. 42"
    uri: string | null // link to source (if available)
    version: string | null // e.g. "v2.0" if revised
    retrievedAt: string | null // when the source was accessed
  }
  relations: {
    respondsTo: string | null // claim ID this card responds to
    supersedes: string | null // claim ID this card supersedes
    supportedBy: string[] // claim IDs that support this card
    contradictedBy: string[] // claim IDs that contradict this card
  }
}

type Citation = {
  passageRef: string // e.g. "QS 2:82"
  editionCode: string // e.g. "quran_cairo_hafs"
  textPreview: string | null // first 100 characters (if rights-cleared)
  rightsStatus: string // e.g. "RIGHTS_EXACT_VERSION_CLEARED"
}
```

---

### 4. Lane Model

**The claim path is organized into 4 lanes:**

| Lane | Purpose | Example |
|------|---------|---------|
| **Claim** | What is being asserted | "QS 2:82 teaches salvation is guaranteed" |
| **Evidence** | What sources support the claim | QS 2:82 (Cairo 1924 Hafs), Kemenag translation |
| **Interpretation** | How the evidence is read | Literal reading; "khalidun" = eternal |
| **Provenance** | Where the claim/evidence came from | Journal of Quranic Studies, Vol. 15, p. 42 |

**Visual layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  CLAIM PATH: QS 2:82 Salvation Interpretation               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2020 ────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CLAIM: "Salvation is guaranteed for believers..."   │   │
│  │ CLAIMANT: Dr. Ahmad Rahman                          │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ EVIDENCE: QS 2:82 (Cairo 1924 Hafs)                 │   │
│  │ EVIDENCE: Indonesian Kemenag translation             │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ INTERPRETATION: Literal reading                     │   │
│  │ "khalidun" = eternal                                │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PROVENANCE: Journal of Quranic Studies, Vol. 15     │   │
│  │ Retrieved: 2020-03-15                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  2022 ────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CLAIM: "QS 2:82 describes promise, not mechanism"   │   │
│  │ CLAIMANT: Prof. Siti Nurhaliza                      │   │
│  │ RESPONDS TO: Dr. Rahman (2020)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  [... evidence, interpretation, provenance ...]             │
│                                                             │
│  2024 ────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CLAIM: "khalidun is ambiguous"                      │   │
│  │ CLAIMANT: Dr. Yusuf Abdullah                        │   │
│  │ RESPONDS TO: Prof. Nurhaliza (2022)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  [... evidence, interpretation, provenance ...]             │
│                                                             │
│  2026 ────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STATUS: No consensus. Three interpretations coexist.│   │
│  │ OPEN QUESTIONS: Does "khalidun" imply permanence?   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Category Distinction Test

**How to verify users can distinguish claim categories:**

| Category | Visual Indicator | Example |
|----------|------------------|---------|
| **Initial** | Blue border | First claim in the path |
| **Revision** | Yellow border | Modifies or refines a previous claim |
| **Rejection** | Red border | Explicitly rejects a previous claim |
| **Synthesis** | Green border | Combines multiple claims into a new claim |
| **Question** | Gray border | Raises an open question (no claim) |

**Test scenario:**
1. Show user a claim path with 5 cards (mixed categories)
2. Ask: "Which card is a revision?"
3. Expected: User identifies the yellow-bordered card
4. Ask: "Which card raises a question?"
5. Expected: User identifies the gray-bordered card

**Success criteria:** >80% of users correctly identify all categories.

---

### 6. Provenance Visibility

**Every claim card shows:**
- **Source:** Where the claim/evidence came from (journal, book, website)
- **URI:** Link to source (if available and rights-cleared)
- **Version:** If the source has multiple versions (e.g., "v2.0 revised edition")
- **Retrieved at:** When the source was accessed (important for time-sensitive claims)

**Provenance badge:**
```
┌─────────────────────────────────────────┐
│ 📚 Journal of Quranic Studies, Vol. 15  │
│ 🔗 https://example.com/article (v2.0)   │
│ 📅 Retrieved: 2020-03-15                │
└─────────────────────────────────────────┘
```

**Rights compliance:**
- If source is rights-cleared: show full URI and text preview
- If source is rights-blocked: show metadata only (title, author, date)
- If source is unknown: show "Source not recorded"

---

### 7. Transition Mechanics

**How cards relate to each other:**

| Relation | Meaning | Visual |
|----------|---------|--------|
| **Responds to** | Card addresses a previous claim | Arrow from new card to old card |
| **Supersedes** | Card replaces a previous claim | Strikethrough on old card |
| **Supported by** | Card cites another card as evidence | Green checkmark |
| **Contradicted by** | Card conflicts with another card | Red X |

**Example:**
```
Card A (2020): "Salvation is guaranteed"
   ↓ responds to
Card B (2022): "Salvation is a promise, not a mechanism"
   ↓ supersedes
Card A (2020): ~~"Salvation is guaranteed"~~
   ↓ supported by
Card C (2024): "khalidun is ambiguous"
```

---

### 8. Researcher Review Protocol

**How to review the claim path with a researcher:**

1. **Present the path:** Show the full claim path (all cards, all lanes)
2. **Ask comprehension questions:**
   - "What is the current status of this claim?"
   - "Which card introduced the idea that 'khalidun' is ambiguous?"
   - "What evidence does Prof. Nurhaliza cite?"
3. **Ask evaluation questions:**
   - "Is the provenance clear for each card?"
   - "Can you tell which claims are revisions vs. rejections?"
   - "Are there any missing cards (gaps in the path)?"
4. **Record feedback:**
   - Comprehension score (0–100%)
   - Provenance clarity (1–5 Likert scale)
   - Category distinction accuracy (0–100%)
   - Missing cards (list)

**Success criteria:**
- Comprehension >80%
- Provenance clarity >4/5
- Category distinction >80%
- Missing cards <2 per path

---

### 9. Decision Framework

**When to adopt the claim path model:**

| Criterion | Threshold | Status |
|-----------|-----------|--------|
| User comprehension | >80% | Pending test |
| Provenance clarity | >4/5 | Pending test |
| Category distinction | >80% | Pending test |
| Missing cards | <2 per path | Pending test |
| Implementation cost | <10 engineering days | ✓ Met |
| Maintenance cost | <2 hours/week | ✓ Met |

**Decision:** ADOPT if all criteria met. DEFER if any criterion fails.

---

### 10. Risks & Rollback

**Risks:**
- **Complexity:** Claim paths with many cards may overwhelm users. Mitigation: Limit path to 10 cards; paginate if longer.
- **Provenance gaps:** Sources may be unknown or unrecorded. Mitigation: Show "Source not recorded" badge; prompt user to add source.
- **Category confusion:** Users may not understand category distinctions. Mitigation: Provide legend; use color coding; test comprehension.

**Rollback:**
- Disable claim path view
- Revert to flat claim list (no provenance, no categories)
- No data migration needed (claim paths are additive)

---

### 11. Metrics (If Implemented)

- **Adoption:** % of researchers who use claim path view (target: >50%)
- **Comprehension:** avg. comprehension score (target: >80%)
- **Provenance clarity:** avg. clarity rating (target: >4/5)
- **Category accuracy:** % of users who correctly identify categories (target: >80%)
- **Path length:** avg. number of cards per path (target: 3–7 cards)

---

## Conclusion

**M47-25 is a design document that:**
- Drafts a claim path case study (QS 2:82 salvation interpretation, 2020–2026)
- Models 4 lanes (claim, evidence, interpretation, provenance)
- Tests category distinction (5 categories with visual indicators)
- Specifies provenance visibility (source, URI, version, retrieval date)
- Provides researcher review protocol and decision framework

**Deliverable:** This design document (no code implemented).

**Next step:** User testing with 3–5 researchers to validate comprehension, provenance clarity, and category distinction.
