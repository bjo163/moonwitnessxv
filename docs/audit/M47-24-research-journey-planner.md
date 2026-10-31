# M47-24 — Research Journey Planner (Without Spiritual Ranking)

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Prototype a "research journey" planner without spiritual ranking
**Priority:** P3 | Difficulty: D5 | Effort: XL (5–10 days)
**Dependencies:** M23 (Research Notebook) — all closed
**Owner:** research UX

---

## Objective

Test whether optional checkpoints help a user organize a research question without ranking beliefs or claiming spiritual direction.

---

## Scope (from specification)

- Define secular research example
- Prototype checkpoint-based journey planner
- Test coercion/accessibility
- Assess overlap with M23 (Research Notebook)
- Stop if duplicated

---

## Acceptance Criteria

- User can reorder/delete steps
- No ranking, supernatural claim or default enrollment
- Static mock only; no account state, mandate, recommendations or spiritual score

---

## Design: Research Journey Planner

### 1. Core Concept

A **Research Journey** is a user-organized sequence of **checkpoints** that structure inquiry into a question. Each checkpoint represents a research activity (e.g., "read primary source," "compare translations," "note alternative interpretations").

**Key invariant:** The journey is a *tool for organizing work*, not a *map of spiritual progress*. It has no score, no ranking, no completion mandate, and no supernatural claim.

---

### 2. Secular Research Example

**Question:** "How did the transmission of Qur'anic verse QS 2:82 vary across early manuscript traditions?"

**Journey checkpoints:**

1. **Locate canonical text** — Retrieve QS 2:82 from `corpus_passages` via `/corpus/reader?citation=QS%202:82`. Record edition metadata (Cairo 1924 Hafs).
2. **Survey translations** — List available translations from `/corpus/browse`. Note Indonesian Kemenag translation rights status.
3. **Identify variant readings** — Search secondary literature for qira'at discussions of QS 2:82. Record citations (no text export unless rights-cleared).
4. **Compare manuscript evidence** — If codex images are available, note folio references. Do not transcribe unless rights-cleared.
5. **Synthesize findings** — Draft a summary distinguishing canonical transmission from variant readings. Cite all sources.

**User actions:**
- Reorder checkpoints (drag-and-drop)
- Delete checkpoints (trash icon, confirmation dialog)
- Add new checkpoints (plus button, free-text label)
- Mark checkpoint as "visited" (checkbox, no score)
- Export journey as Markdown (no account state, no mandate)

---

### 3. Checkpoint Schema

```typescript
type Checkpoint = {
  id: string // stable across reorders
  label: string // user-supplied, e.g. "Locate canonical text"
  description?: string // optional notes
  citationKey?: string // optional link to corpus_passages
  visited: boolean // no score, no rank
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

type ResearchJourney = {
  id: string
  question: string // the research question
  checkpoints: Checkpoint[] // ordered, user-reorderable
  createdAt: string
  updatedAt: string
}
```

**Storage:** localStorage (aligned with M23 Research Notebook). No account state, no server sync.

---

### 4. UI Mockup (Static)

```
┌─────────────────────────────────────────────────────────────┐
│  RESEARCH JOURNEY                                           │
│                                                             │
│  Question: How did the transmission of QS 2:82 vary...?    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☐ 1. Locate canonical text                            │ │
│  │    [Edit] [Delete] [↑] [↓]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☑ 2. Survey translations                              │ │
│  │    [Edit] [Delete] [↑] [↓]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☐ 3. Identify variant readings                        │ │
│  │    [Edit] [Delete] [↑] [↓]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Add checkpoint]                                         │
│                                                             │
│  [Export as Markdown]  [Delete journey]                     │
│                                                             │
│  No score. No rank. No mandate. Your journey, your order.  │
└─────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click checkbox → toggle `visited` (no score change)
- Drag checkpoint → reorder (updates `checkpoints[]` array index)
- Click [Delete] → remove checkpoint (confirmation dialog)
- Click [Export] → download `research-journey-{id}.md`

---

### 5. Anti-Patterns (What This Is NOT)

| Anti-Pattern | Why Rejected |
|--------------|--------------|
| "You've completed 3/5 checkpoints — 60% done!" | Imposes a completion mandate; research is open-ended |
| "Your spiritual insight score: 8.5/10" | Ranks belief; violates neutrality |
| "Recommended next step: read tafsir al-Tabari" | Claims authority over the user's inquiry |
| "You must visit checkpoint 4 before checkpoint 5" | Removes user agency; imposes orthodoxy |
| "Your journey is 2 weeks overdue" | Shames the user; research has no deadline |

---

### 6. Coercion & Accessibility Assessment

**Coercion risks:**
- **Mandate:** A journey must never become a requirement. Mitigation: "Delete journey" button always visible; no account-level enforcement.
- **Ranking:** Checkpoints must not be scored. Mitigation: `visited: boolean` only; no numeric field.
- **Supernatural claim:** Journey must not claim spiritual direction. Mitigation: UI copy uses secular language ("research," "inquiry," "question").

**Accessibility:**
- **Keyboard navigation:** All interactions (reorder, delete, export) accessible via keyboard (Tab, Space, Enter, Delete).
- **Screen reader:** Checkpoints announced as "Checkpoint 1: Locate canonical text, not visited, editable."
- **Motor impairment:** Drag-and-drop has a keyboard alternative (arrow buttons to reorder).
- **Cognitive load:** No score, no rank, no deadline. User controls pace.

---

### 7. Overlap with M23 (Research Notebook)

**M23 scope:** Offline research notebook — note-taking, citation capture, export.

**M47-24 scope:** Journey planner — checkpoint organization, reordering, progress tracking (visited/not visited).

**Overlap:**
- Both use localStorage
- Both support citation capture (M23: free-form notes; M47-24: optional `citationKey` field)
- Both export to Markdown

**Distinction:**
- M23 is a *collection of notes* (unordered or user-ordered)
- M47-24 is a *sequence of checkpoints* (ordered, reorderable, with visited state)

**Recommendation:** M47-24 can be implemented as a **specialized view** on top of M23's note schema, or as a **separate localStorage key** (`research-journeys`) with a migration path to merge later. Stop if M23 already provides checkpoint reordering — do not duplicate.

---

### 8. Implementation Plan (Deferred)

**Phase 1: Static mock (this task)**
- Design document (this file)
- UI mockup (ASCII above)
- Coercion/accessibility assessment (Section 6)

**Phase 2: Prototype (if approved)**
- Implement `ResearchJourney` schema in localStorage
- Build checkpoint list UI (reorder, delete, visited toggle)
- Export to Markdown
- User testing (3–5 participants, secular research questions)

**Phase 3: Integration (if prototype succeeds)**
- Link checkpoints to `corpus_passages` via `citationKey`
- Import/export compatibility with M23 Research Notebook
- Decide: merge into M23 or keep separate

---

### 9. Verification

**How to verify this design meets acceptance criteria:**

1. **User can reorder/delete steps:** Prototype must support drag-and-drop reorder and delete with confirmation.
2. **No ranking:** No numeric score, no percentile, no star rating.
3. **No supernatural claim:** UI copy uses secular language only.
4. **No default enrollment:** User must explicitly create a journey; no pre-populated journeys.
5. **Static mock only:** This design document is the deliverable; no code written yet.

---

### 10. Risks & Rollback

**Risks:**
- **Scope creep:** Journey planner becomes a project management tool (deadlines, assignments). Mitigation: No date fields beyond `createdAt`/`updatedAt`.
- **Duplication:** M23 already provides checkpoint-like functionality. Mitigation: Assess M23 overlap before implementing (Section 7).
- **Coercion:** Users feel pressured to complete journeys. Mitigation: No account-level enforcement; "Delete journey" always visible.

**Rollback:**
- Delete `research-journeys` localStorage key
- Remove UI route `/research/journeys`
- No data migration needed (localStorage only, no server sync)

---

### 11. Metrics (If Prototype Is Built)

- **Adoption:** % of users who create at least one journey (target: >20% of active researchers)
- **Retention:** % of journeys with >1 checkpoint after 7 days (target: >50%)
- **Reordering:** avg. reorders per journey (target: >0, indicates user agency)
- **Deletion:** % of journeys deleted before completion (target: <30%, indicates low coercion)
- **Export:** % of journeys exported as Markdown (target: >10%, indicates utility)

---

### 12. Fictional Case Studies

**Case 1: The Comparative Translation Study**

*User:* Aisha, a graduate student in comparative religion.
*Question:* "How do Indonesian and English translations of QS 2:82 differ in theological emphasis?"
*Journey:*
1. Retrieve QS 2:82 from corpus (Indonesian Kemenag)
2. Retrieve QS 2:82 from corpus (English Arberry, if rights-cleared)
3. Compare lexical choices (note: "khalidun" → "kekal" vs. "eternal")
4. Survey secondary literature on translation methodology
5. Draft comparative analysis

*Outcome:* Aisha reorders checkpoints 3 and 4 after realizing she needs methodological context before lexical analysis. She deletes checkpoint 2 because Arberry is not rights-cleared. She exports the journey as Markdown and includes it in her thesis appendix.

*No score. No rank. No mandate.*

---

**Case 2: The Manuscript Tradition Inquiry**

*User:* Yusuf, an independent researcher.
*Question:* "What manuscript evidence exists for variant readings of QS 2:82?"
*Journey:*
1. Locate canonical text (Cairo 1924 Hafs)
2. Survey codex images (if available)
3. Consult qira'at literature
4. Note folio references
5. Synthesize findings

*Outcome:* Yusuf adds checkpoint 6: "Interview a codicologist." He marks checkpoint 1 as visited. He does not complete the journey — research is open-ended.

*No deadline. No completion mandate. No spiritual progress.*

---

**Case 3: The Abandoned Journey**

*User:* Fatima, a curious layperson.
*Question:* "Is the Qur'an historically reliable?"
*Journey:*
1. Read introductory survey
2. Consult primary sources
3. Evaluate archaeological evidence
4. Synthesize findings

*Outcome:* Fatima deletes the journey after checkpoint 2 because she feels overwhelmed. She creates a new journey with a narrower question: "What does QS 2:82 say about salvation?"

*No shame. No overdue notice. No coercion.*

---

## Conclusion

**M47-24 is a design document for a research journey planner that:**
- Organizes inquiry into user-reorderable checkpoints
- Imposes no score, rank, mandate, or supernatural claim
- Respects user agency (reorder, delete, export)
- Avoids duplication with M23 (Research Notebook)
- Provides a static mock for user testing before implementation

**Deliverable:** This design document (static mock only; no code).

**Next step:** User testing with 3–5 participants using secular research questions. If prototype is approved, implement in Phase 2.
