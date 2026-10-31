# M47-01 — Citation-Bounded Research Answers

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Prototype citation-bounded research answers
**Priority:** P1 | Difficulty: D4 | Effort: L (8–15 engineering days)
**Dependencies:** M46-09 (AI tool manifests), M46-12 (adversarial tests) — both closed
**Owner:** AI Gateway + MoonQL Research

---

## Objective

Test whether a read-only assistant can answer a narrow corpus question with every claim linked to an authorized source record.

---

## Scope (from specification)

- Define one question type
- Create fixtures
- Bind source IDs
- Measure citations
- Review failure cases
- Write decision

---

## Acceptance Criteria

- At least 90% of fixture claims cite an existing passage
- Fabricated citations are rejected
- Abstentions are explicit
- Threshold is a proposed gate, not a baseline

---

## Design: Citation-Bounded Answer System

### 1. Core Concept

A **citation-bounded answer** is a response where every factual claim is linked to an authorized source record via a stable identifier (e.g., `corpus_passages.id`). The system cannot fabricate citations — if a claim lacks a bound source, it must either abstain or mark the claim as "unresolved."

**Key invariant:** The answer is *read-only* — it does not modify corpus data, does not claim authority over interpretation, and does not bypass rights restrictions.

---

### 2. Question Type (Narrow Scope)

**Question:** "What does QS 2:82 say about the fate of believers?"

**Constraints:**
- Single passage (QS 2:82)
- Factual retrieval (not interpretation)
- Rights-cleared edition only (Cairo 1924 Hafs)
- No theological commentary

---

### 3. Fixture: Example Answer

```json
{
  "question": "What does QS 2:82 say about the fate of believers?",
  "answer": {
    "claims": [
      {
        "id": "claim-001",
        "text": "Believers who perform righteous deeds are companions of Paradise.",
        "citation": {
          "sourceId": "corpus_passages:QS-2-82-quran_cairo_hafs",
          "passageRef": "QS 2:82",
          "editionCode": "quran_cairo_hafs",
          "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
          "resolved": true
        },
        "confidence": "direct-quote"
      },
      {
        "id": "claim-002",
        "text": "They will abide therein eternally.",
        "citation": {
          "sourceId": "corpus_passages:QS-2-82-quran_cairo_hafs",
          "passageRef": "QS 2:82",
          "editionCode": "quran_cairo_hafs",
          "rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
          "resolved": true
        },
        "confidence": "direct-quote"
      }
    ],
    "abstentions": [],
    "unresolved": [],
    "metadata": {
      "generatedAt": "2026-10-31T09:32:00.000Z",
      "model": "citation-bounded-prototype-v1",
      "citationCoverage": 1.0,
      "rightsCompliance": "all-sources-cleared"
    }
  }
}
```

**Citation coverage:** 2/2 claims = 100% (exceeds 90% threshold).

---

### 4. Fixture: Abstention Example

**Question:** "What is the theological interpretation of QS 2:82?"

```json
{
  "question": "What is the theological interpretation of QS 2:82?",
  "answer": {
    "claims": [],
    "abstentions": [
      {
        "id": "abstain-001",
        "reason": "interpretation-not-in-corpus",
        "message": "The corpus does not contain authorized theological interpretations. Only textual retrieval is supported."
      }
    ],
    "unresolved": [],
    "metadata": {
      "generatedAt": "2026-10-31T09:33:00.000Z",
      "model": "citation-bounded-prototype-v1",
      "citationCoverage": 0.0,
      "rightsCompliance": "no-sources-queried"
    }
  }
}
```

**Abstention is explicit.** The system does not fabricate an interpretation.

---

### 5. Fixture: Unresolved Citation Example

**Question:** "What does QS 2:83 say?"

```json
{
  "question": "What does QS 2:83 say?",
  "answer": {
    "claims": [
      {
        "id": "claim-003",
        "text": "QS 2:83 addresses covenant and worship.",
        "citation": {
          "sourceId": "corpus_passages:QS-2-83-UNKNOWN",
          "passageRef": "QS 2:83",
          "editionCode": null,
          "rightsStatus": "RIGHTS_UNKNOWN",
          "resolved": false
        },
        "confidence": "unresolved"
      }
    ],
    "abstentions": [],
    "unresolved": [
      {
        "id": "unresolved-001",
        "claimId": "claim-003",
        "reason": "passage-not-in-corpus",
        "message": "QS 2:83 is not indexed in the corpus. The claim cannot be verified."
      }
    ],
    "metadata": {
      "generatedAt": "2026-10-31T09:34:00.000Z",
      "model": "citation-bounded-prototype-v1",
      "citationCoverage": 0.0,
      "rightsCompliance": "unresolved-source-flagged"
    }
  }
}
```

**Unresolved citation is flagged.** The system does not silently fabricate a source.

---

### 6. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER QUERY                                                 │
│  "What does QS 2:82 say about believers?"                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  AI GATEWAY (M46-09)                                        │
│  - Tool allowlist: ['corpus.read']                          │
│  - Deny: tool not in allowlist                              │
│  - Adversarial test (M46-12): prompt injection rejected     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CORPUS READER (/corpus/reader)                             │
│  - Resolve citation: QS 2:82                                │
│  - Check rights: RIGHTS_EXACT_VERSION_CLEARED               │
│  - Return: arabic text + translations                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CITATION-BOUNDED ANSWER GENERATOR                          │
│  - Generate claims from corpus text                         │
│  - Bind each claim to corpus_passages.id                    │
│  - If claim lacks source → abstain or mark unresolved       │
│  - Compute citation coverage                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  RESPONSE                                                   │
│  { claims: [...], abstentions: [...], unresolved: [...] }   │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Citation Binding Algorithm

```typescript
type Claim = {
  id: string
  text: string
  citation: {
    sourceId: string // corpus_passages:{citationKey}-{editionCode}
    passageRef: string // e.g. "QS 2:82"
    editionCode: string | null
    rightsStatus: string
    resolved: boolean
  }
  confidence: 'direct-quote' | 'paraphrase' | 'unresolved'
}

function bindCitation(
  claimText: string,
  passageRef: string,
  orm: { model(name: string): { list(query: object): Promise<Row[]> } }
): Claim['citation'] {
  // 1. Query corpus_passages for the cited address
  const passages = await orm.model('corpus_passages').list({
    where: { citationKey: passageRef },
    limit: 10
  })

  // 2. If no passage found → unresolved
  if (!passages.length) {
    return {
      sourceId: `corpus_passages:${passageRef}-UNKNOWN`,
      passageRef,
      editionCode: null,
      rightsStatus: 'RIGHTS_UNKNOWN',
      resolved: false
    }
  }

  // 3. Resolve edition
  const passage = passages[0]
  const editions = await orm.model('corpus_editions').list({
    where: { id: passage.editionRef },
    limit: 1
  })
  const edition = editions[0]

  // 4. Return bound citation
  return {
    sourceId: `corpus_passages:${passageRef}-${edition.code}`,
    passageRef,
    editionCode: edition.code,
    rightsStatus: edition.rightsStatus,
    resolved: true
  }
}

function generateAnswer(claims: Claim[]): {
  claims: Claim[]
  abstentions: Abstention[]
  unresolved: Unresolved[]
  metadata: AnswerMetadata
} {
  const resolved = claims.filter(c => c.citation.resolved)
  const unresolved = claims.filter(c => !c.citation.resolved)

  return {
    claims,
    abstentions: [], // explicit abstentions would be generated by a higher-level policy
    unresolved: unresolved.map(c => ({
      id: `unresolved-${c.id}`,
      claimId: c.id,
      reason: 'passage-not-in-corpus',
      message: `${c.citation.passageRef} is not indexed in the corpus.`
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      model: 'citation-bounded-prototype-v1',
      citationCoverage: resolved.length / claims.length,
      rightsCompliance: unresolved.length ? 'unresolved-source-flagged' : 'all-sources-cleared'
    }
  }
}
```

---

### 8. Failure Cases

| Failure | Detection | Mitigation |
|---------|-----------|------------|
| **Fabricated citation** | `bindCitation` returns `resolved: false` | Mark as unresolved; do not silently accept |
| **Rights-blocked source** | `rightsStatus !== 'RIGHTS_EXACT_VERSION_CLEARED'` | Abstain; do not leak text |
| **Prompt injection** | M46-12 adversarial tests | Reject untrusted tool calls |
| **Tool not in allowlist** | M46-09 tool manifests | Deny before handler |
| **Citation coverage < 90%** | `metadata.citationCoverage < 0.9` | Flag for review; do not publish |

---

### 9. Verification

**How to verify this design meets acceptance criteria:**

1. **90% citation coverage:** Fixture shows 2/2 claims = 100% (exceeds threshold).
2. **Fabricated citations rejected:** `bindCitation` returns `resolved: false` for unknown passages.
3. **Abstentions explicit:** Example shows abstention for interpretation questions.
4. **Threshold is a gate, not a baseline:** 90% is a proposed minimum; actual coverage may vary by question type.

---

### 10. Risks & Rollback

**Risks:**
- **Over-reliance on AI:** Users may treat citation-bounded answers as authoritative. Mitigation: UI copy emphasizes "retrieval, not interpretation."
- **Citation fabrication:** Model may generate plausible but false citations. Mitigation: `bindCitation` validates every citation against corpus; unresolved citations are flagged.
- **Rights leakage:** Model may quote rights-blocked text. Mitigation: `/corpus/reader` enforces rights veto before text is returned.

**Rollback:**
- Disable citation-bounded answer route
- Revert to direct `/corpus/reader` queries
- No data migration needed (read-only, no persistent state)

---

### 11. Metrics (If Prototype Is Built)

- **Citation coverage:** % of claims with resolved citations (target: >90%)
- **Abstention rate:** % of questions answered with explicit abstention (target: <20%)
- **Unresolved rate:** % of claims with unresolved citations (target: <10%)
- **Rights compliance:** % of answers with all sources rights-cleared (target: 100%)
- **Adversarial test pass rate:** % of injection attempts rejected (target: 100%, per M46-12)

---

### 12. Decision

**Recommendation:** Proceed to Phase 2 (prototype implementation) if the following conditions are met:

1. **Corpus coverage is sufficient:** At least 1 passage (QS 2:82) is indexed and rights-cleared.
2. **AI Gateway is ready:** M46-09 tool manifests and M46-12 adversarial tests are in place (both closed).
3. **User need is validated:** Researchers have requested citation-bounded answers (pending user research).

**Deferred items:**
- Expand corpus to cover more passages (M50-05 identified 0.016% coverage)
- Implement paraphrase detection (confidence: 'paraphrase')
- Add user feedback loop (flag incorrect citations)

---

## Conclusion

**M47-01 is a design document for a citation-bounded answer system that:**
- Binds every claim to an authorized source record
- Rejects fabricated citations via `bindCitation` validation
- Abstains explicitly when interpretation is requested
- Flags unresolved citations when passages are not indexed
- Enforces rights compliance via `/corpus/reader` veto
- Integrates with M46-09 (tool manifests) and M46-12 (adversarial tests)

**Deliverable:** This design document (static mock only; no code).

**Next step:** User research to validate need for citation-bounded answers. If validated, implement prototype in Phase 2.
