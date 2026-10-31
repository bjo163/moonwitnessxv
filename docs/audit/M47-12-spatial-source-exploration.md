# M47-12 — Spatially Anchored Source Exploration

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Test a spatially anchored source exploration concept
**Priority:** P3 | Difficulty: D5 | Effort: XL (10–20 days)
**Dependencies:** None
**Owner:** research UX

---

## Objective

Explore whether spatial arrangement helps users understand relationships among a small synthetic set of sources.

---

## Scope (from specification)

- Define task
- Build mock
- Compare 2D/3D
- Test orientation
- Measure errors
- Stop if no advantage

---

## Acceptance Criteria

- Users complete a relation-finding task at least as accurately as 2D
- Otherwise record no-go

---

## Design: Spatial Source Exploration

### 1. Core Concept

**Spatial source exploration** arranges sources in a 2D or 3D space based on their relationships (e.g., citation networks, thematic similarity, temporal proximity). Users navigate the space to discover connections between sources.

**Key invariant:** Spatial arrangement is *exploratory*, not *authoritative*. It suggests relationships but does not assert them. Users must verify connections by reading source metadata.

---

### 2. Synthetic Source Set

**Task:** "Find all sources that cite QS 2:82"

**Source set (7 fictional sources):**

| ID | Title | Type | Cites | Year |
|----|-------|------|-------|------|
| S1 | "Salvation in the Quran" | Journal article | QS 2:82, QS 3:85 | 2020 |
| S2 | "Eternal Life in Islamic Theology" | Book chapter | QS 2:82 | 2018 |
| S3 | "Comparative Translation Study" | Thesis | QS 2:82 (Indonesian) | 2022 |
| S4 | "Quranic Vocabulary Analysis" | Database | QS 2:82, QS 4:57 | 2019 |
| S5 | "Tafsir al-Tabari Review" | Commentary | QS 2:82 (interpretation) | 2021 |
| S6 | "Manuscript Variants of Surah 2" | Codicology | QS 2:82 (variant) | 2023 |
| S7 | "Salvation Theology Overview" | Encyclopedia | QS 3:85 (not QS 2:82) | 2017 |

**Correct answer:** S1, S2, S3, S4, S5, S6 (6 sources cite QS 2:82; S7 does not)

---

### 3. 2D Spatial Layout

**Layout algorithm:** Force-directed graph (nodes = sources, edges = citation relationships)

**Visual representation:**
```
                    QS 2:82
                      ●
                     /|\
                    / | \
                   /  |  \
                  /   |   \
    S1 ●─────────●────●────●─────────● S2
       \         |    |    |         /
        \        |    |    |        /
         \       |    |    |       /
          ●──────●────●────●──────●
          S3     S4   S5   S6
          
    S7 ● (isolated, cites QS 3:85 not QS 2:82)
```

**Features:**
- **Zoom:** Scroll to zoom in/out
- **Pan:** Click and drag to move around
- **Hover:** Show source metadata tooltip
- **Click:** Open source detail panel
- **Highlight:** Click QS 2:82 node to highlight all citing sources

---

### 4. 3D Spatial Layout

**Layout algorithm:** 3D force-directed graph (same as 2D but with depth axis)

**Visual representation:**
```
         QS 2:82
            ●
           /|\
          / | \
         /  |  \
    S1 ●   |   ● S2
        \  |  /
         \ | /
          \|/
    S3 ●──●──● S4
        / | \
       /  |  \
      ●   |   ●
     S5   |   S6
          ●
         S7 (behind, cites QS 3:85)
```

**Features:**
- **Rotate:** Click and drag to rotate the scene
- **Zoom:** Scroll to zoom in/out
- **Pan:** Right-click and drag to pan
- **Hover:** Show source metadata tooltip
- **Click:** Open source detail panel
- **Depth cue:** Sources further away are faded

**3D advantages:**
- Can show more relationships (depth axis)
- More immersive experience
- Better for large source sets (>20 sources)

**3D disadvantages:**
- Harder to orient (users may get lost)
- Requires WebGL (not all browsers support)
- Motion sickness for some users

---

### 5. Relation-Finding Task

**Task instructions:**
"You are researching QS 2:82. Below is a spatial map of 7 sources. Find all sources that cite QS 2:82. Click on each source to mark it as 'cites QS 2:82' or 'does not cite QS 2:82'."

**User interface:**
```
┌─────────────────────────────────────────────────────────────┐
│  SOURCE EXPLORATION                                          │
│                                                              │
│  Task: Find all sources that cite QS 2:82                    │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  [2D or 3D spatial map here]                          │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Sources found: [0/6]                                        │
│                                                              │
│  [✓ S1 "Salvation in the Quran"]                            │
│  [✓ S2 "Eternal Life in Islamic Theology"]                  │
│  [ ] S3 "Comparative Translation Study"                     │
│  [ ] S4 "Quranic Vocabulary Analysis"                       │
│  [ ] S5 "Tafsir al-Tabari Review"                           │
│  [ ] S6 "Manuscript Variants of Surah 2"                    │
│  [✗ S7 "Salvation Theology Overview"]                       │
│                                                              │
│  [Submit answers]  [Reset]                                   │
└─────────────────────────────────────────────────────────────┘
```

**Scoring:**
- **True positive:** Correctly identified a source that cites QS 2:82
- **True negative:** Correctly identified a source that does NOT cite QS 2:82
- **False positive:** Incorrectly marked a non-citing source as citing
- **False negative:** Missed a citing source

**Accuracy formula:**
```
Accuracy = (True positives + True negatives) / Total sources
```

**Target accuracy:** ≥85% (5.95/7 correct)

---

### 6. Orientation Test

**How to test if users can orient themselves in the space:**

1. **Landmark identification:** "Click on the QS 2:82 node"
   - Expected: User clicks the central node
   - Success: Correct node selected

2. **Direction finding:** "Which source is to the left of S1?"
   - Expected: User identifies S3 (in 2D layout)
   - Success: Correct source identified

3. **Distance estimation:** "Which source is closest to QS 2:82?"
   - Expected: User identifies S1 or S2 (both directly connected)
   - Success: Correct source identified

4. **Path finding:** "Trace the path from S1 to S6"
   - Expected: User traces S1 → QS 2:82 → S6 (or similar)
   - Success: Correct path traced

**Orientation score:** 0–4 (number of successful tests)

**Target orientation score:** ≥3/4

---

### 7. Error Measurement

**Types of errors:**

| Error Type | Definition | Example |
|------------|------------|---------|
| **Missed citation** | Failed to identify a citing source | Did not click S3 |
| **False citation** | Incorrectly marked a non-citing source | Clicked S7 |
| **Orientation error** | Could not find landmarks or directions | Could not locate QS 2:82 node |
| **Navigation error** | Got lost in the space | Zoomed in too far, could not pan back |

**Error rate formula:**
```
Error rate = (Missed citations + False citations) / Total sources
```

**Target error rate:** ≤15% (≤1 error per 7 sources)

---

### 8. 2D vs 3D Comparison

**Hypothesis:** 3D spatial layout will improve relation-finding accuracy for large source sets (>20 sources) but not for small sets (7 sources).

**Test design:**
- **Group A:** 2D layout (n=15 participants)
- **Group B:** 3D layout (n=15 participants)
- **Task:** Find all sources that cite QS 2:82 (7 sources)
- **Metrics:** Accuracy, orientation score, error rate, time on task, satisfaction

**Expected results:**
- **Accuracy:** No significant difference (both ≥85%)
- **Orientation score:** 2D > 3D (2D easier to orient)
- **Error rate:** No significant difference (both ≤15%)
- **Time on task:** 2D < 3D (2D faster)
- **Satisfaction:** 3D > 2D (3D more engaging)

**Decision rule:**
- If 3D accuracy ≥ 2D accuracy → ADOPT 3D for large source sets
- If 3D accuracy < 2D accuracy → NO-GO (stick with 2D)

---

### 9. Implementation Plan (Deferred)

**Phase 1: Mockup (this task)**
- Define synthetic source set (Section 2)
- Design 2D layout (Section 3)
- Design 3D layout (Section 4)
- Define relation-finding task (Section 5)

**Phase 2: Prototype (if approved)**
- Build 2D spatial map (D3.js or similar)
- Build 3D spatial map (Three.js or similar)
- Implement task UI (Section 5)
- Add orientation tests (Section 6)

**Phase 3: User testing (if prototype is built)**
- Recruit 30 participants (15 per group)
- Conduct 2D vs 3D comparison (Section 8)
- Measure accuracy, orientation, errors, time, satisfaction
- Analyze results

**Phase 4: Decision (if testing succeeds)**
- If 3D advantage confirmed → implement for large source sets
- If no advantage → NO-GO (stick with 2D or flat list)

---

### 10. Verification

**How to verify this design meets acceptance criteria:**

1. **Users complete relation-finding task at least as accurately as 2D:** 2D vs 3D comparison test (Section 8) measures accuracy.
2. **Otherwise record no-go:** Decision rule in Section 8 specifies when to stop.

---

### 11. Risks & Rollback

**Risks:**
- **3D motion sickness:** Some users may feel dizzy in 3D. Mitigation: Provide 2D alternative; allow users to switch.
- **Orientation difficulty:** Users may get lost in 3D space. Mitigation: Add minimap; provide "reset view" button.
- **No advantage:** 3D may not improve accuracy. Mitigation: Stop if no advantage (decision rule in Section 8).

**Rollback:**
- Disable 3D view
- Revert to 2D view or flat list
- No data migration needed (spatial view is additive)

---

### 12. Metrics (If Implemented)

- **Accuracy:** % of correct answers (target: ≥85%)
- **Orientation score:** avg. successful orientation tests (target: ≥3/4)
- **Error rate:** % of errors (target: ≤15%)
- **Time on task:** avg. seconds to complete task (target: <120 seconds)
- **Satisfaction:** avg. satisfaction score (target: >4/5)
- **3D adoption:** % of users who prefer 3D over 2D (target: >50% for large source sets)

---

## Conclusion

**M47-12 is a design document that:**
- Defines synthetic source set (7 sources, 6 cite QS 2:82)
- Designs 2D and 3D spatial layouts
- Specifies relation-finding task with scoring
- Provides orientation tests and error measurement
- Plans 2D vs 3D comparison test (30 participants)
- Sets decision rule (adopt 3D if accuracy ≥ 2D; otherwise no-go)

**Deliverable:** This design document (no code implemented).

**Next step:** If spatial exploration is prioritized, build 2D/3D prototypes and conduct user testing.
