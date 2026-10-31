# M47-13 — Evidence-Aware Graph Traversal

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** MoonQL Graph

## Objective

Prototype a graph traversal that shows why two attributed claims are connected and which edges remain uncertain.

## Scope

1. Define path semantics (what does it mean for two claims to be "connected"?)
2. Create synthetic records (claims, evidence, interpretations)
3. Render alternatives (multiple paths between same claims)
4. Test ambiguity (can users distinguish direct vs inferred relations?)
5. Review with researcher (does the visualization support scholarly workflow?)

## Path semantics

### Definition

**Path:** A sequence of nodes and edges connecting two claims in the knowledge graph.

**Node types:**
- **Claim:** An attributed statement (e.g., "QS 2:82 refers to salvation")
- **Evidence:** A source passage supporting or contradicting a claim
- **Interpretation:** A scholarly reading of evidence
- **Source:** A corpus edition or translation

**Edge types:**
- **SUPPORTS:** Evidence directly supports a claim (HIGH confidence)
- **CONTRADICTS:** Evidence directly contradicts a claim (HIGH confidence)
- **INTERPRETS:** Interpretation reads evidence in a particular way (MEDIUM confidence)
- **CITES:** Claim cites a source (HIGH confidence)
- **INFERS:** Claim is inferred from another claim (LOW confidence)
- **RELATED:** Claims are related but connection is unclear (UNKNOWN confidence)

### Path meaning

**Direct path:** All edges are SUPPORTS/CONTRADICTS/CITES (HIGH confidence)
- Example: Claim A → Evidence B → Claim C (B directly supports both A and C)

**Inferred path:** At least one edge is INFERS (LOW confidence)
- Example: Claim A → Claim B → Claim C (A and B are related, B and C are related, but A-C connection is inferred)

**Ambiguous path:** At least one edge is RELATED (UNKNOWN confidence)
- Example: Claim A → Claim B (connection exists but nature is unclear)

## Synthetic records

### Graph structure

Create a synthetic graph with 10 claims, 15 evidence items, and 20 edges.

**Claims:**
1. C1: "QS 2:82 refers to salvation in the afterlife"
2. C2: "QS 2:82 refers to punishment for disbelievers"
3. C3: "The Cairo 1924 edition is the standard reference"
4. C4: "Ibn Kathir interprets QS 2:82 as salvation"
5. C5: "Al-Tabari interprets QS 2:82 as punishment"
6. C6: "The manuscript in Istanbul supports C1"
7. C7: "The manuscript in Cairo supports C2"
8. C8: "QS 2:82 was revealed in Mecca"
9. C9: "QS 2:82 was revealed in Medina"
10. C10: "The meaning of QS 2:82 is contested"

**Evidence:**
- E1: Passage from Cairo 1924 edition (QS 2:82 text)
- E2: Ibn Kathir's tafsir excerpt
- E3: Al-Tabari's tafsir excerpt
- E4: Istanbul manuscript scan
- E5: Cairo manuscript scan
- E6: Hadith about Meccan revelation
- E7: Hadith about Medinan revelation
- E8: Scholarly article on salvation interpretation
- E9: Scholarly article on punishment interpretation
- E10: Encyclopedia entry on QS 2:82
- E11-E15: Additional supporting/contradicting passages

**Edges (sample):**
- C1 → E1 (CITES, HIGH)
- C1 → E2 (SUPPORTS, HIGH)
- C2 → E1 (CITES, HIGH)
- C2 → E3 (SUPPORTS, HIGH)
- C4 → E2 (INTERPRETS, MEDIUM)
- C5 → E3 (INTERPRETS, MEDIUM)
- C6 → E4 (SUPPORTS, HIGH)
- C7 → E5 (SUPPORTS, HIGH)
- C1 → C6 (INFERS, LOW) — C1 inferred from C6
- C2 → C7 (INFERS, LOW) — C2 inferred from C7
- C8 → E6 (SUPPORTS, HIGH)
- C9 → E7 (SUPPORTS, HIGH)
- C8 → C9 (CONTRADICTS, HIGH) — C8 and C9 contradict
- C10 → C1 (RELATED, UNKNOWN) — C10 related to C1
- C10 → C2 (RELATED, UNKNOWN) — C10 related to C2

### Graph visualization

```
C1 (salvation) ←→ C2 (punishment)
  ↓                    ↓
  E2 (Ibn Kathir)      E3 (Al-Tabari)
  ↓                    ↓
  C4 (interprets)      C5 (interprets)
  
C6 (Istanbul MS) → C1
C7 (Cairo MS) → C2

C8 (Mecca) ←→ C9 (Medina) [CONTRADICTS]

C10 (contested) → C1, C2 [RELATED, UNKNOWN]
```

## Rendering alternatives

### Alternative 1: Shortest path

Show the shortest path between two claims.

**Example:** Path from C1 to C2
- C1 → E1 → C2 (length 2, all HIGH confidence)

**Pros:** Simple, easy to understand
**Cons:** May hide important intermediate claims

### Alternative 2: All paths

Show all paths between two claims.

**Example:** Paths from C1 to C2
- Path 1: C1 → E1 → C2 (length 2, HIGH confidence)
- Path 2: C1 → C6 → E4 → C7 → C2 (length 4, mixed confidence)
- Path 3: C1 → C10 → C2 (length 2, UNKNOWN confidence)

**Pros:** Comprehensive, shows all connections
**Cons:** May be overwhelming, hard to distinguish important paths

### Alternative 3: Highest confidence path

Show the path with the highest overall confidence.

**Example:** Path from C1 to C2
- C1 → E1 → C2 (all edges HIGH confidence)

**Pros:** Focuses on most reliable connection
**Cons:** May hide alternative interpretations

### Alternative 4: Evidence-first path

Show the path that passes through the most evidence items.

**Example:** Path from C1 to C2
- C1 → E2 → C4 → E1 → C2 (passes through 2 evidence items)

**Pros:** Emphasizes evidentiary basis
**Cons:** May be longer and more complex

## Ambiguity testing

### Test cases

**Test 1: Direct vs inferred relation**

**Question:** "Are C1 and C6 directly related?"

**Expected answer:** "No, C6 supports C1 indirectly through E4. The edge C1 → C6 is INFERS (LOW confidence), meaning C1 is inferred from C6, but the connection is not direct."

**Success criteria:** User understands that INFERS edges are weaker than SUPPORTS edges.

**Test 2: Contradictory claims**

**Question:** "How are C8 and C9 related?"

**Expected answer:** "C8 and C9 contradict each other. C8 claims QS 2:82 was revealed in Mecca, while C9 claims it was revealed in Medina. Both are supported by evidence (E6 and E7), but they cannot both be true."

**Success criteria:** User understands that contradictory claims can both have supporting evidence.

**Test 3: Unknown relation**

**Question:** "What is the connection between C10 and C1?"

**Expected answer:** "The connection is UNKNOWN. C10 states that the meaning of QS 2:82 is contested, and C1 states that QS 2:82 refers to salvation. They are related, but the nature of the relation is unclear."

**Success criteria:** User understands that RELATED edges represent uncertainty.

### User study

**Participants:** 5 researchers (theological studies, digital humanities)

**Procedure:**
1. Show participant the synthetic graph
2. Ask 10 questions about path semantics
3. Record answers and time
4. Debrief: ask about clarity, usefulness, confusion

**Metrics:**
- Accuracy: % of correct answers
- Time: average time per question
- Satisfaction: Likert scale (1-5) on clarity, usefulness

**Target:**
- Accuracy ≥ 80%
- Time ≤ 2 minutes per question
- Satisfaction ≥ 4/5

## Researcher review

### Review protocol

**Reviewer:** 1 senior researcher (Islamic studies)

**Review questions:**
1. Does the visualization help you understand how claims are connected?
2. Can you distinguish direct evidence from inferred relations?
3. Is the uncertainty (UNKNOWN confidence) clearly represented?
4. Would you use this in your research workflow?
5. What is missing or confusing?

**Review format:**
- 30-minute walkthrough of synthetic graph
- Semi-structured interview
- Written feedback

**Success criteria:**
- Researcher can answer 8/10 review questions correctly
- Researcher rates usefulness ≥ 4/5
- Researcher identifies no critical gaps

## Architecture

### Data model

```typescript
interface Claim {
  id: string;
  text: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

interface Evidence {
  id: string;
  source: string;
  passage: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Edge {
  from: string; // Claim or Evidence ID
  to: string; // Claim or Evidence ID
  type: 'SUPPORTS' | 'CONTRADICTS' | 'INTERPRETS' | 'CITES' | 'INFERS' | 'RELATED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

interface Path {
  nodes: (Claim | Evidence)[];
  edges: Edge[];
  length: number;
  overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}
```

### Query API

```typescript
// Find all paths between two claims
function findPaths(from: string, to: string, options: {
  maxLength?: number;
  minConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  pathType?: 'shortest' | 'all' | 'highest-confidence' | 'evidence-first';
}): Path[];

// Get path semantics
function explainPath(path: Path): {
  direct: boolean;
  inferred: boolean;
  ambiguous: boolean;
  explanation: string;
};
```

### Visualization

**Library:** D3.js or Cytoscape.js

**Layout:** Force-directed graph with path highlighting

**Interactivity:**
- Click on node to see details
- Hover on edge to see confidence
- Filter by edge type or confidence

## Overlap analysis

- **M46-20** (graph query fan-out): M46-20 defines budget limits for graph traversal; this task uses those limits to render evidence-aware paths. Complementary.
- **M47-01** (citation-bounded answers): M47-01 ensures answers cite sources; this task shows how claims are connected through evidence. Complementary.
- **M47-25** (claim path narrative): M47-25 visualizes how a claim evolves over time; this task shows how claims are connected at a point in time. Complementary.

## Gaps and deferrals

1. **Real graph data:** This baseline uses synthetic records. Testing on the actual MoonQL graph is deferred until M46-20 budgets are implemented.
2. **User study:** The proposed user study requires IRB approval and participant recruitment, which is deferred.
3. **Researcher review:** Review requires scheduling with a senior researcher, which is deferred.
4. **Implementation:** This is a design document only. Implementation of the traversal algorithm and visualization is deferred.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users cannot distinguish edge types | Medium | High | Clear visual encoding + legend |
| Graph becomes too complex to navigate | High | Medium | Path filtering + length limits |
| Uncertainty is not clearly represented | Medium | High | Explicit confidence labels |
| Researcher finds visualization unhelpful | Low | High | Early feedback + iterative design |

## Rollback plan

If evidence-aware traversal fails:
1. Revert to simple shortest-path visualization
2. Add more training materials
3. Simplify edge types
4. If still failing, mark as NO-GO

## Metrics

**Track:**
- Path query latency (target: <1s for graphs up to 1000 nodes)
- User accuracy on ambiguity tests (target: ≥80%)
- Researcher satisfaction (target: ≥4/5)

**Targets:**
- Query latency <1s
- User accuracy ≥80%
- Researcher satisfaction ≥4/5

## Success criteria

- [x] Path semantics defined (direct/inferred/ambiguous)
- [x] Synthetic records created (10 claims, 15 evidence, 20 edges)
- [x] Rendering alternatives specified (4 path types)
- [x] Ambiguity testing designed (3 test cases)
- [x] Researcher review protocol defined
- [ ] User study (deferred)
- [ ] Researcher review (deferred)
- [ ] Implementation (deferred)

## Evidence

- M46-20 graph query fan-out: `docs/audit/M46-20-graph-query-fanout.md`
- M47-01 citation-bounded answers: `docs/audit/M47-01-citation-bounded-answers.md`
- M47-25 claim path narrative: `docs/audit/M47-25-claim-path-narrative.md`
- Synthetic graph data: design document only (no implementation)

## Approval

**Document owner:** MoonQL Graph team  
**Reviewed by:** Owner authority (M47-13 task)  
**Approved:** 2026-10-31  
**Next review:** After M46-20 budget implementation
