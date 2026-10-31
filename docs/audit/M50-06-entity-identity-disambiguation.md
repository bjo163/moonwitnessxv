# M50-06 — Neutral Entity Identity and Disambiguation Rules

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** MoonQL Ontology

## Objective

Specify how an entity is distinguished from aliases, homonyms, and interpretations, ensuring similar labels alone never auto-merge and every alias has source and reviewer/state.

## Scope

1. Inventory current types (what entities exist?)
2. Define candidate/accepted distinction (how do we decide identity?)
3. Create synthetic collisions (test cases for disambiguation)
4. Review merge/reversal (how do we handle mistakes?)

## Current entity types

### Entity categories

**1. Person entities**
- Scholars (Ibn Kathir, Al-Tabari, etc.)
- Narrators (Abu Hurairah, etc.)
- Modern researchers

**2. Text entities**
- Quranic verses (QS 2:82, etc.)
- Hadith collections
- Tafsir works
- Secondary sources

**3. Edition entities**
- Cairo 1924 Hafs edition
- Other printed editions
- Manuscript witnesses

**4. Concept entities**
- Theological concepts (salvation, punishment, etc.)
- Interpretive traditions
- Scholarly positions

**5. Location entities**
- Historical places
- Manuscript repositories

### Current identity model

```typescript
interface Entity {
  id: string; // UUID
  type: 'person' | 'text' | 'edition' | 'concept' | 'location';
  labels: {
    primary: string; // Canonical name
    aliases: string[]; // Alternative names
    languages: Record<string, string>; // Name in different languages
  };
  metadata: {
    created_at: string;
    created_by: string;
    reviewed_by?: string;
    review_state: 'CANDIDATE' | 'ACCEPTED' | 'DISPUTED';
  };
  disambiguation: {
    description: string; // Brief description to distinguish from homonyms
    birth_death?: string; // For persons
    location?: string; // For locations
    date?: string; // For texts/editions
  };
}
```

## Candidate vs accepted distinction

### Review states

**CANDIDATE:**
- Newly created entity
- Not yet reviewed by qualified reviewer
- Can be used in citations but marked as "unreviewed"
- Subject to merge/split based on review

**ACCEPTED:**
- Reviewed by qualified reviewer
- Stable identity (changes require formal process)
- Preferred for citations
- Has complete disambiguation metadata

**DISPUTED:**
- Identity is contested by qualified reviewers
- Multiple candidate entities may exist for same real-world entity
- Requires arbitration process
- Cannot be merged until dispute resolved

### Review process

**Step 1: Creation**
- Entity created with CANDIDATE state
- Must include: primary label, type, basic disambiguation
- Optional: aliases, metadata

**Step 2: Review**
- Qualified reviewer examines entity
- Checks: disambiguation sufficient? aliases complete? type correct?
- Reviewer signs with their credentials

**Step 3: Acceptance**
- If review passes: state → ACCEPTED
- If review fails: state remains CANDIDATE, reviewer provides feedback
- If dispute: state → DISPUTED, arbitration process begins

### Reviewer qualifications

**For person entities:**
- Scholar of Islamic studies or related field
- Ability to verify historical identity

**For text/edition entities:**
- Scholar of Quranic studies or textual criticism
- Ability to verify edition provenance

**For concept entities:**
- Scholar familiar with interpretive traditions
- Ability to distinguish concepts across traditions

**For location entities:**
- Historian or geographer familiar with region
- Ability to verify historical location identity

## Synthetic collision test cases

### Case 1: Alias collision

**Scenario:** Two entities with overlapping aliases

**Entity A:**
```json
{
  "id": "entity-001",
  "type": "person",
  "labels": {
    "primary": "Ibn Kathir",
    "aliases": ["Ibn Katheer", "Ibn Kathīr"],
    "languages": {
      "ar": "ابن كثير",
      "en": "Ibn Kathir"
    }
  },
  "disambiguation": {
    "description": "Quranic exegete, 14th century CE",
    "birth_death": "1300-1373 CE"
  }
}
```

**Entity B:**
```json
{
  "id": "entity-002",
  "type": "person",
  "labels": {
    "primary": "Ibn Kathir al-Dimashqi",
    "aliases": ["Ibn Kathir"],
    "languages": {
      "ar": "ابن كثير الدمشقي",
      "en": "Ibn Kathir al-Dimashqi"
    }
  },
  "disambiguation": {
    "description": "Hadith scholar, 14th century CE",
    "birth_death": "1301-1374 CE"
  }
}
```

**Collision:** Both use "Ibn Kathir" as alias

**Resolution:**
- Check disambiguation: different descriptions, slightly different dates
- Check aliases: Entity B has more specific primary label
- Decision: Keep separate entities, add cross-reference note
- Action: Add to Entity A: `"related": [{"entity": "entity-002", "relation": "NOT_SAME_PERSON"}]`

### Case 2: Homonym collision

**Scenario:** Two different persons with same name

**Entity A:**
```json
{
  "id": "entity-003",
  "type": "person",
  "labels": {
    "primary": "Al-Tabari",
    "aliases": ["Tabari"],
    "languages": {
      "ar": "الطبري",
      "en": "Al-Tabari"
    }
  },
  "disambiguation": {
    "description": "Quranic exegete and historian, 9th-10th century CE",
    "birth_death": "839-923 CE"
  }
}
```

**Entity B:**
```json
{
  "id": "entity-004",
  "type": "person",
  "labels": {
    "primary": "Al-Tabari (physician)",
    "aliases": ["Tabari"],
    "languages": {
      "ar": "الطبري (طبيب)",
      "en": "Al-Tabari (physician)"
    }
  },
  "disambiguation": {
    "description": "Physician and scholar, 9th century CE",
    "birth_death": "838-870 CE"
  }
}
```

**Collision:** Both use "Al-Tabari" and "Tabari" as aliases

**Resolution:**
- Check disambiguation: clearly different persons (different professions, different dates)
- Check labels: Entity B has more specific primary label
- Decision: Keep separate entities, require disambiguation in citations
- Action: Both entities marked ACCEPTED with note: `"disambiguation_required": true`

### Case 3: Interpretation collision

**Scenario:** Entity represents a concept, but label could be confused with a person

**Entity A:**
```json
{
  "id": "entity-005",
  "type": "concept",
  "labels": {
    "primary": "Salvation (Islamic)",
    "aliases": ["Salvation", "Najat"],
    "languages": {
      "ar": "النجاة",
      "en": "Salvation (Islamic)"
    }
  },
  "disambiguation": {
    "description": "Islamic theological concept of deliverance from sin"
  }
}
```

**Entity B:**
```json
{
  "id": "entity-006",
  "type": "concept",
  "labels": {
    "primary": "Salvation (Christian)",
    "aliases": ["Salvation"],
    "languages": {
      "en": "Salvation (Christian)"
    }
  },
  "disambiguation": {
    "description": "Christian theological concept of deliverance from sin"
  }
}
```

**Collision:** Both use "Salvation" as alias

**Resolution:**
- Check type: both concepts (correct)
- Check disambiguation: different traditions
- Decision: Keep separate entities, require tradition qualifier in citations
- Action: Both entities marked ACCEPTED with note: `"tradition_qualifier_required": true`

## Merge and reversal process

### Merge process

**When to merge:**
- Two entities determined to represent same real-world entity
- One entity is duplicate of another
- Reviewer determines disambiguation was incorrect

**Merge procedure:**
1. Identify source entity (to be merged) and target entity (to keep)
2. Review all citations of source entity
3. Create merge proposal with rationale
4. Qualified reviewer approves merge
5. System updates all citations: source → target
6. Source entity marked as MERGED with link to target
7. Target entity updated with source's aliases (if not already present)

**Merge record:**
```json
{
  "merge_id": "merge-001",
  "source_entity": "entity-001",
  "target_entity": "entity-002",
  "rationale": "Determined to be same person, different name conventions",
  "approved_by": "reviewer-001",
  "approved_at": "2026-10-31T10:00:00Z",
  "citations_updated": 15
}
```

### Reversal process

**When to reverse:**
- Merge determined to be incorrect
- Entity identity disputed after merge
- New evidence shows entities are distinct

**Reversal procedure:**
1. Create reversal proposal with rationale
2. Qualified reviewer approves reversal
3. System restores source entity
4. System updates citations back to source (where appropriate)
5. Source entity marked as ACCEPTED (or CANDIDATE if disputed)
6. Merge record marked as REVERSED

**Reversal record:**
```json
{
  "reversal_id": "reversal-001",
  "original_merge": "merge-001",
  "rationale": "New evidence shows entities are distinct persons",
  "approved_by": "reviewer-002",
  "approved_at": "2026-10-31T11:00:00Z",
  "citations_restored": 10
}
```

## Auto-merge prevention

### Rule: Similar labels alone never auto-merge

**Implementation:**
- System checks for label similarity (edit distance, phonetic similarity)
- If similarity > threshold (e.g., 0.8), flag for human review
- Never automatically merge based on label similarity alone
- Require reviewer to check disambiguation metadata

**Flagging logic:**
```typescript
function checkMergeCandidate(newEntity: Entity, existingEntities: Entity[]): {
  candidates: Entity[];
  requires_review: boolean;
} {
  const candidates = existingEntities.filter(e => 
    similarity(newEntity.labels.primary, e.labels.primary) > 0.8 ||
    newEntity.labels.aliases.some(a => e.labels.aliases.includes(a))
  );
  
  return {
    candidates,
    requires_review: candidates.length > 0
  };
}
```

### Rule: Every alias has source and reviewer/state

**Implementation:**
- Each alias must have:
  - `source`: Where the alias comes from (bibliographic reference)
  - `attested_by`: Reviewer who verified the alias
  - `state`: CANDIDATE or ACCEPTED

**Alias schema:**
```typescript
interface Alias {
  label: string;
  source: string; // Bibliographic reference
  attested_by: string; // Reviewer ID
  state: 'CANDIDATE' | 'ACCEPTED';
  attested_at: string; // Timestamp
}
```

## Overlap analysis

- **M46-15** (package ownership): M46-15 defines workspace ownership; this task defines entity identity. Complementary.
- **M47-15** (TEI corpus comparison): M47-15 maps TEI to MoonQL; this task defines MoonQL entity model. Complementary.
- **M50-05** (corpus inventory): M50-05 inventories corpus; this task defines entity identity rules. Complementary.

## Gaps and deferrals

1. **Real implementation:** This baseline uses simulated collisions. Implementation of disambiguation system is deferred.
2. **Reviewer recruitment:** Qualified reviewers for each entity type are not yet recruited.
3. **Arbitration process:** Formal process for resolving DISPUTED entities is not defined.
4. **Scalability:** Testing with large entity sets (10,000+ entities) is deferred.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Incorrect merge | Medium | High | Reviewer approval required |
| Homonym confusion | High | Medium | Disambiguation metadata required |
| Reviewer bias | Low | High | Multiple reviewers for disputed cases |
| Scalability issues | Medium | Medium | Batch review processes |

## Rollback plan

If disambiguation fails:
1. Revert to manual identity management
2. Simplify entity model
3. Add more reviewer training
4. If still failing, mark as NO-GO

## Metrics

**Track:**
- Entity count by type and state
- Merge/reversal rate
- Reviewer workload
- Collision detection rate

**Targets:**
- Merge error rate < 1%
- Reversal rate < 5%
- Review completion time < 7 days

## Success criteria

- [x] Current entity types inventoried (5 categories)
- [x] Candidate/accepted distinction defined (3 states)
- [x] Review process specified (3 steps)
- [x] Synthetic collisions created (3 test cases)
- [x] Merge/reversal process defined
- [x] Auto-merge prevention rules specified
- [x] Alias source/reviewer requirement defined
- [ ] Real implementation (deferred)
- [ ] Reviewer recruitment (deferred)
- [ ] Arbitration process (deferred)

## Evidence

- M46-15 package ownership: `docs/audit/M46-15-package-ownership.md`
- M47-15 TEI corpus comparison: `docs/audit/M47-15-tei-corpus-comparison.md`
- M50-05 corpus inventory: `docs/audit/M50-05-corpus-inventory-completeness.md`
- Entity model: design document only (no implementation)
- Collision test cases: synthetic (no real collisions tested)

## Approval

**Document owner:** MoonQL Ontology team  
**Reviewed by:** Owner authority (M50-06 task)  
**Approved:** 2026-10-31  
**Next review:** After real implementation
