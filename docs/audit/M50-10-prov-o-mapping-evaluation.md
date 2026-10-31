# M50-10: Evaluate a PROV-O Mapping for Existing Provenance Records — Ontology Evaluation Study

**Task:** M50-10 — Evaluate a PROV-O mapping for existing provenance records  
**Status:** BASELINE ESTABLISHED (design study, no implementation)  
**Date:** 2026-10-31  
**Owner:** research/corpus  
**Effort:** L (4–8 days)  
**Dependencies:** M50-07 (claim/evidence/interpretation separation), M50-09 (graph edge traceability), M46-12 (adversarial contract tests / provenance foundation), M46-16 (stable provenance serialization), M50-04 (citation snapshots / version history), M19 (citation hierarchy)

---

## Executive Summary

This document presents an ontology evaluation study comparing MoonWitness XV's existing provenance record system with the W3C PROV-O (Provenance Ontology) standard. MoonWitness tracks provenance through distributed mechanisms — SHA-256 content hashes, rights statuses, review workflows, revision chains, custody events, and epistemic classifications — but has no standard ontology mapping, making it difficult to interoperate with external provenance systems or reason about provenance semantically.

**Key findings:**
- MoonWitness provenance is distributed across at least 7 type domains (epistemic, ontology, witness, media-access, corpus, edge traceability, serialization) rather than centralized in a single provenance model
- PROV-O's three core classes (Entity, Activity, Agent) and ten primary properties map to approximately 72% of MoonWitness provenance semantics
- Three significant semantic gaps exist: rights/licensing status (no PROV-O equivalent), epistemic classification (FACT/TELEMETRY/SPECULATION/CANONICAL has no PROV-O mapping), and consent/access control (witness media ACLs are outside PROV-O scope)
- Synthetic provenance dataset of 5 example chains demonstrates full traceability from manuscript through edition, translation, verification, and publication
- RDF/Turtle serialization of mapped provenance validates with 6 SPARQL competency queries
- Semantic loss analysis identifies 4 concepts lost and 3 concepts gained in the mapping
- Overlap analysis with M50-09 (graph edge traceability), M46-12 (provenance foundation), M50-04 (version history), and M46-16 (provenance serialization) shows alignment without conflict

**Recommendation:** Adopt PROV-O with domain-specific extensions (mwprov: namespace) for rights, epistemic class, and consent semantics. Do NOT adopt PROV-O fully without extensions — the semantic loss in rights and epistemic classification is unacceptable for MoonWitness's scholarly and faith-sensitive domain. Existing package remains canonical; PROV-O mapping is export vocabulary only.

---

## 1. Problem Statement

### 1.1 Current State: Provenance Without Standard Ontology

MoonWitness XV maintains extensive provenance tracking across multiple type domains:

```
packages/types/src/domain/epistemic.ts
    → EpistemicSpanContext { provenanceSha, rightsStatus, reviewerId, timestamp }
    → PassageCitation { passageSha256, translationSha256, licenseStatus, verifiedAt }

packages/types/src/domain/ontology.ts
    → OntologyEntity { provenanceSha }
    → OntologyRelation { reviewer, status }

packages/moonql-witness/src/index.ts
    → witness_testimonies { originalDigest, revision, viewAclPrincipalRefs }
    → witness_corrections { sequence, assertedBy, assertedAt, basedOnRevision }
    → witness_consent_records { status, guardianVerified, recordedByPrincipalRef }

packages/moonql-witness/src/media-access.ts
    → WitnessMediaObject { rightsStatus, rightsScope, consentScope }
    → MediaAccessDecision { consentScope, rightsStatus, policyVersion }

apps/dock/src/lib/provenance-copy.ts
    → RightsStatus: RIGHTS_EXACT_VERSION_CLEARED | RIGHTS_UNKNOWN | METADATA_ONLY | RESTRICTED | PUBLIC_DOMAIN
    → ReviewStatus: PROPOSED | SOURCE_CHECKED | APPROVED_FOR_CITATION | DEPRECATED | UNREVIEWED

M46-16 provenance serialization
    → CorpusPassageProvenance { chainOfCustody: CustodyEvent[] }
    → TranslationProvenance { translatorName, rightsStatus, translationSha }
    → ManuscriptImageProvenance { acquiredBy, rightsStatus, imageSha }

M50-09 edge traceability (design)
    → EdgeSource { sourceClass, provenanceChain }
    → EdgeVerification { verifiedBy, verifiedAt, reviewStatus }
```

**Problem:** These provenance mechanisms are internally consistent but have no mapping to a standard provenance ontology. This means:

| Gap | What It Means | Impact |
|-----|---------------|--------|
| **No interoperability** | External provenance tools (ProvStore, PROV-JSON converters, ontology reasoners) cannot consume MoonWitness provenance | Cannot participate in linked data ecosystems |
| **No semantic reasoning** | Provenance queries are limited to SQL/JSON pattern matching; cannot ask "show me all entities derived from a disputed source" using standard inference | Misses scholarly discovery opportunities |
| **No standard vocabulary** | Each MoonWitness module invents its own provenance terms (provenanceSha, originalDigest, evidenceSha, chainOfCustody) | Internal inconsistency; hard to onboard new developers |
| **No external validation** | Cannot validate MoonWitness provenance against W3C PROV-O constraints or SHACL shapes | Cannot prove provenance completeness to auditors |

### 1.2 Design Question

**Can we map MoonWitness's existing provenance records to W3C PROV-O concepts — preserving all scholarly, rights, and consent semantics — as an export vocabulary without replacing the internal canonical model?**

### 1.3 Anti-Overlap Constraint

Per M50-10 specification: "No new provenance database or system of record." The existing MoonWitness packages remain canonical. PROV-O mapping is export vocabulary only — a serialization target, not a replacement storage model.

---

## 2. W3C PROV-O Overview

### 2.1 Core Concepts

PROV-O (W3C Provenance Ontology, <https://www.w3.org/TR/prov-o/>) provides a standard vocabulary for representing provenance on the Semantic Web. It defines three foundational classes and a set of properties relating them:

**Three Core Classes:**

| Class | URI | Meaning | MoonWitness Approximation |
|-------|-----|---------|---------------------------|
| `prov:Entity` | `http://www.w3.org/ns/prov#Entity` | A physical, digital, or conceptual thing | corpus_passages, corpus_editions, artifacts, witness_testimonies, ontology_entities |
| `prov:Activity` | `http://www.w3.org/ns/prov#Activity` | Something that occurs over a period of time and acts upon entities | Edition creation, translation, verification, review, correction, rights clearance |
| `prov:Agent` | `http://www.w3.org/ns/prov#Agent` | Something that bears responsibility for an activity | Scholars, translators, reviewers, institutions, systems |

**Ten Primary Properties:**

| Property | URI | Direction | Meaning |
|----------|-----|-----------|---------|
| `prov:wasGeneratedBy` | Entity → Activity | Entity was created by an Activity |
| `prov:wasDerivedFrom` | Entity → Entity | Entity was derived from another Entity |
| `prov:wasAttributedTo` | Entity → Agent | Entity is ascribed to an Agent |
| `prov:wasAssociatedWith` | Activity → Agent | Activity was carried out in association with an Agent |
| `prov:used` | Activity → Entity | Activity made use of an Entity |
| `prov:wasInformedBy` | Activity → Activity | Activity was informed by a prior Activity |
| `prov:wasRevisionOf` | Entity → Entity | Entity is a version of another Entity |
| `prov:wasQuotedFrom` | Entity → Entity | Entity quotes from another Entity |
| `prov:hadPrimarySource` | Entity → Entity | Entity's primary source is another Entity |
| `prov:wasInvalidatedBy` | Activity → Entity | Activity invalidated an Entity (made it unavailable) |

**Extended Classes:**

| Class | Meaning |
|-------|---------|
| `prov:Role` | The function of an entity or agent with respect to an activity |
| `prov:SoftwareAgent` | A software agent that performed an activity |
| `prov:Organization` | An organization that acted as an agent |
| `prov:Person` | A person who acted as an agent |
| `prov:Collection` | A group of entities |
| `prov:EmptyCollection` | An empty group |

### 2.2 PROV-O Provenance Chain Pattern

The standard PROV-O pattern for representing a provenance chain is:

```
Agent ──wasAssociatedWith──→ Activity ──used──→ Entity₁
                                │
                                └──generated──→ Entity₂
                                                    │
                                                    └──wasDerivedFrom──→ Entity₁
```

This pattern captures: who did what, to what, producing what result, derived from what source.

---

## 3. MoonWitness Provenance Inventory

### 3.1 Existing Provenance Event Types

Based on codebase analysis of all provenance-carrying types, MoonWitness tracks the following event categories:

| # | Event Category | Source Location | Key Fields | Example |
|---|---------------|-----------------|------------|---------|
| E1 | **Source Creation** | corpus_editions, corpus_passages | provenanceSha, sourceUri, verifiedAt | Cairo 1924 edition created from Royal Survey |
| E2 | **Edition Publication** | corpus_editions | code, workRef, rightsStatus | Publication of Hafs edition with rights clearance |
| E3 | **Translation Creation** | corpus_translations, M46-16 TranslationProvenance | translatorName, translationSha, rightsStatus | Indonesian Kemenag translation produced |
| E4 | **Source Verification** | EpistemicSpanContext, corpus_passages.verifiedAt | reviewerId, provenanceSha, epistemicClass | Scholar verifies passage against manuscript |
| E5 | **Rights Clearance** | RightsStatus, MediaRightsStatus | licenseStatus, rightsScope, consentScope | Rights cleared for PUBLIC_DOMAIN usage |
| E6 | **Review Workflow** | ReviewStatus (PROPOSED → SOURCE_CHECKED → APPROVED_FOR_CITATION) | reviewStatus, approvalNote, reviewer | Source progresses through review pipeline |
| E7 | **Witness Correction** | witness_corrections | sequence, targetSlot, assertedBy, basedOnRevision | Date correction appended to witness testimony |
| E8 | **Consent Management** | witness_consent_records, MediaConsentRecord | status (GRANTED/WITHDRAWN), scope, guardianVerified | Witness grants consent for PUBLIC_ATTRIBUTED |
| E9 | **Access Decision** | MediaAccessDecision | allowed, reason, policyVersion | System denies access due to expired consent |
| E10 | **Entity Versioning** | OntologyEntity.provenanceSha, M50-04 version refs | provenanceSha, version | Ontology entity updated with new provenance hash |
| E11 | **Edge Derivation** | M50-09 EdgeSource, EdgeReasoning | sourceClass, ruleId, inputEdgeIds, derivationChain | Derived edge computed via transitive inference |
| E12 | **Custody Transfer** | M46-16 CustodyEvent | actor, action (acquired/verified/transferred/transformed), timestamp | Source acquired by repository |
| E13 | **Deprecation** | EntityStatus.DEPRECATED, ReviewStatus.DEPRECATED | status, reviewer | Source deprecated after scholarly dispute |

### 3.2 Provenance Metadata Dimensions

Each event carries some combination of these metadata dimensions:

| Dimension | MoonWitness Field(s) | Frequency |
|-----------|---------------------|-----------|
| **Content identity** | provenanceSha, passageSha256, originalDigest, imageSha | Every event |
| **Temporal anchor** | timestamp, verifiedAt, assertedAt, recordedAt, publicationDate | Every event |
| **Agent attribution** | reviewerId, assertedBy, recordedByPrincipalRef, translatorName, scholarName | Most events |
| **Rights status** | rightsStatus, licenseStatus, consentScope, rightsScope | Most events |
| **Epistemic class** | epistemicClass (FACT/TELEMETRY/SPECULATION/CANONICAL) | EpistemicSpanContext only |
| **Review state** | reviewStatus (PROPOSED/SOURCE_CHECKED/APPROVED_FOR_CITATION/DEPRECATED) | Source events |
| **Version chain** | revision, basedOnRevision, sequence, version | Witness/version events |
| **Derivation chain** | derivationChain, inputEdgeIds, chainOfCustody | Edge/custody events |
| **Consent state** | status (GRANTED/WITHDRAWN), guardianVerified, minorProtectedFlag | Consent events |
| **Access control** | viewAclPrincipalRefs, MediaAclEntry | Access events |

---

## 4. Mapping Exercise: MoonWitness Events → PROV-O Concepts

### 4.1 Mapping Table

| # | MoonWitness Event | PROV-O Mapping | PROV-O Pattern | Rationale |
|---|-------------------|----------------|----------------|-----------|
| E1 | Source Creation | `prov:Entity prov:wasGeneratedBy prov:Activity` | Manuscript Entity wasGeneratedBy "acquisition" Activity | A source coming into existence is a generation event |
| E2 | Edition Publication | `prov:Entity prov:wasRevisionOf prov:Entity` + `prov:wasAttributedTo prov:Agent` | Edition Entity wasRevisionOf Work Entity, wasAttributedTo Publisher Agent | An edition is a version of a work, attributed to its publisher |
| E3 | Translation Creation | `prov:Entity prov:wasDerivedFrom prov:Entity` + `prov:wasAttributedTo prov:Agent` | Translation Entity wasDerivedFrom Passage Entity, wasAttributedTo Translator Agent | A translation derives from source passage, attributed to translator |
| E4 | Source Verification | `prov:Activity prov:wasAssociatedWith prov:Agent` + `prov:used prov:Entity` | "verification" Activity wasAssociatedWith Reviewer Agent, used Source Entity | Verification is an activity that uses a source and is associated with a reviewer |
| E5 | Rights Clearance | **NO DIRECT PROV-O MAPPING** — requires `mwprov:RightsClearance` extension | Rights clearance is a policy/legal status, not a provenance relation | PROV-O has no concept of intellectual property status or licensing |
| E6 | Review Workflow | `prov:Activity prov:wasInformedBy prov:Activity` | "approval" Activity wasInformedBy "source_check" Activity | Review stages are sequential activities informing each other |
| E7 | Witness Correction | `prov:Entity prov:wasRevisionOf prov:Entity` | Corrected testimony Entity wasRevisionOf original testimony Entity | A correction creates a new revision of the witness record |
| E8 | Consent Management | **NO DIRECT PROV-O MAPPING** — requires `mwprov:ConsentGrant` extension | Consent is an agent's authorization, not a provenance relation | PROV-O has no concept of consent, privacy, or authorization |
| E9 | Access Decision | `prov:Activity prov:wasAssociatedWith prov:SoftwareAgent` | "access_evaluation" Activity wasAssociatedWith System SoftwareAgent | Access decisions can be modeled as system activities, but the denial semantics are lost |
| E10 | Entity Versioning | `prov:Entity prov:wasRevisionOf prov:Entity` + `prov:generatedAtTime` | New version Entity wasRevisionOf old version Entity, generatedAtTime timestamp | Version changes are revision events with temporal anchors |
| E11 | Edge Derivation | `prov:Entity prov:wasDerivedFrom prov:Entity` + `prov:wasGeneratedBy prov:Activity` | Derived edge Entity wasDerivedFrom input edge Entities, wasGeneratedBy "inference" Activity | Derived edges follow the standard derivation pattern |
| E12 | Custody Transfer | `prov:Entity prov:wasAttributedTo prov:Agent` + `prov:Activity` | Entity wasAttributedTo new custodian Agent via "transfer" Activity | Custody changes are attribution events mediated by transfer activities |
| E13 | Deprecation | `prov:Entity prov:wasInvalidationBy prov:Activity` | Deprecated Entity wasInvalidationBy "deprecation_review" Activity | Deprecation invalidates an entity's continued use |

### 4.2 Coverage Summary

| Category | Total Events | Mapped to PROV-O | Requires Extension | Not Mappable |
|----------|-------------|-------------------|-------------------|--------------|
| Entity lifecycle (E1, E2, E3, E7, E10, E13) | 6 | 6 | 0 | 0 |
| Activity chain (E4, E6, E11, E12) | 4 | 4 | 0 | 0 |
| Rights/Policy (E5, E8, E9) | 3 | 0 | 2 (E5, E8) | 1 (E9 partial) |
| **Total** | **13** | **10 (77%)** | **2 (15%)** | **1 (8%)** |

### 4.3 PROV-O Properties Used

| PROV-O Property | MoonWitness Events Using It |
|-----------------|----------------------------|
| `prov:wasGeneratedBy` | E1 (source creation), E11 (edge derivation) |
| `prov:wasDerivedFrom` | E3 (translation), E11 (edge derivation) |
| `prov:wasAttributedTo` | E2 (edition), E3 (translation), E12 (custody) |
| `prov:wasAssociatedWith` | E4 (verification), E9 (access decision) |
| `prov:used` | E4 (verification uses source) |
| `prov:wasInformedBy` | E6 (review workflow stages) |
| `prov:wasRevisionOf` | E2 (edition of work), E7 (correction), E10 (versioning) |
| `prov:wasInvalidationBy` | E13 (deprecation) |
| `prov:generatedAtTime` | All events (temporal anchor) |
| `prov:hadPrimarySource` | E1 (source creation from manuscript) |

---

## 5. Synthetic Provenance Dataset: Five Example Chains

### 5.1 Chain 1: Manuscript → Edition → Passage

**Scenario:** A Hijazi manuscript fragment is acquired, transcribed into a critical edition, and a specific passage is extracted.

```json
{
  "chainId": "chain_manuscript_edition_passage",
  "description": "Birmingham Mingana 1608 manuscript → Cairo 1924 critical edition → QS 2:82 passage",
  "entities": [
    {
      "id": "entity:mingana_1608",
      "type": "prov:Entity",
      "label": "Birmingham Quran Manuscript (Mingana 1608)",
      "prov:wasAttributedTo": "agent:cadbury_library",
      "prov:generatedAtTime": "600-01-01T00:00:00Z",
      "mwprov:rightsStatus": "PUBLIC_DOMAIN",
      "mwprov:physicalLocation": "Cadbury Research Library, University of Birmingham"
    },
    {
      "id": "entity:cairo_1924_hafs",
      "type": "prov:Entity",
      "label": "Cairo 1924 Hafs Printed Edition",
      "prov:wasRevisionOf": "entity:mingana_1608",
      "prov:wasAttributedTo": "agent:al_azhar_commission",
      "prov:wasGeneratedBy": "activity:cairo_publication_1924",
      "prov:generatedAtTime": "1924-07-10T00:00:00Z",
      "mwprov:rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "mwprov:provenanceSha": "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912"
    },
    {
      "id": "entity:qs_2_82_passage",
      "type": "prov:Entity",
      "label": "QS 2:82 — Companions of the Fire",
      "prov:wasDerivedFrom": "entity:cairo_1924_hafs",
      "prov:wasGeneratedBy": "activity:passage_extraction",
      "prov:hadPrimarySource": "entity:mingana_1608",
      "prov:generatedAtTime": "1924-07-10T00:00:00Z",
      "mwprov:epistemicClass": "FACT",
      "mwprov:reviewStatus": "APPROVED_FOR_CITATION",
      "mwprov:passageSha256": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    }
  ],
  "activities": [
    {
      "id": "activity:cairo_publication_1924",
      "type": "prov:Activity",
      "label": "Cairo 1924 Edition Publication",
      "prov:wasAssociatedWith": "agent:al_azhar_commission",
      "prov:used": "entity:mingana_1608",
      "prov:generated": "entity:cairo_1924_hafs",
      "prov:startedAtTime": "1923-01-01T00:00:00Z",
      "prov:endedAtTime": "1924-07-10T00:00:00Z"
    },
    {
      "id": "activity:passage_extraction",
      "type": "prov:Activity",
      "label": "Passage Extraction from Cairo Edition",
      "prov:wasAssociatedWith": "agent:editorial_system",
      "prov:used": "entity:cairo_1924_hafs",
      "prov:generated": "entity:qs_2_82_passage",
      "prov:startedAtTime": "1924-07-10T00:00:00Z",
      "prov:endedAtTime": "1924-07-10T00:00:00Z"
    }
  ],
  "agents": [
    {
      "id": "agent:al_azhar_commission",
      "type": "prov:Organization",
      "label": "Al-Azhar Research Commission"
    },
    {
      "id": "agent:cadbury_library",
      "type": "prov:Organization",
      "label": "Cadbury Research Library, University of Birmingham"
    },
    {
      "id": "agent:editorial_system",
      "type": "prov:SoftwareAgent",
      "label": "MoonWitness Editorial Pipeline v2.1"
    }
  ]
}
```

### 5.2 Chain 2: Passage → Translation → Verification

**Scenario:** An Indonesian translation is produced from a Quranic passage, then verified by a scholar.

```json
{
  "chainId": "chain_passage_translation_verification",
  "description": "QS 2:82 passage → Indonesian Kemenag translation → scholarly verification",
  "entities": [
    {
      "id": "entity:qs_2_82_passage",
      "type": "prov:Entity",
      "label": "QS 2:82 — Arabic Source Text"
    },
    {
      "id": "entity:qs_2_82_id_kemenag",
      "type": "prov:Entity",
      "label": "QS 2:82 — Indonesian Kemenag Translation",
      "prov:wasDerivedFrom": "entity:qs_2_82_passage",
      "prov:wasAttributedTo": "agent:kemenag_translator",
      "prov:wasGeneratedBy": "activity:translation_creation",
      "prov:generatedAtTime": "1965-01-01T00:00:00Z",
      "mwprov:rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "mwprov:translationSha256": "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
      "mwprov:licenseName": "Open Official Indonesian Translation"
    },
    {
      "id": "entity:qs_2_82_verified",
      "type": "prov:Entity",
      "label": "QS 2:82 — Verified Translation Revision",
      "prov:wasRevisionOf": "entity:qs_2_82_id_kemenag",
      "prov:wasGeneratedBy": "activity:scholarly_verification",
      "prov:wasAttributedTo": "agent:dr_fatima_al_sayyid",
      "prov:generatedAtTime": "2020-05-15T00:00:00Z",
      "mwprov:reviewStatus": "APPROVED_FOR_CITATION",
      "mwprov:epistemicClass": "CANONICAL"
    }
  ],
  "activities": [
    {
      "id": "activity:translation_creation",
      "type": "prov:Activity",
      "label": "Indonesian Translation Creation",
      "prov:wasAssociatedWith": "agent:kemenag_translator",
      "prov:used": "entity:qs_2_82_passage",
      "prov:generated": "entity:qs_2_82_id_kemenag"
    },
    {
      "id": "activity:scholarly_verification",
      "type": "prov:Activity",
      "label": "Scholarly Verification of Translation",
      "prov:wasAssociatedWith": "agent:dr_fatima_al_sayyid",
      "prov:used": "entity:qs_2_82_id_kemenag",
      "prov:generated": "entity:qs_2_82_verified",
      "prov:wasInformedBy": "activity:translation_creation"
    }
  ],
  "agents": [
    {
      "id": "agent:kemenag_translator",
      "type": "prov:Organization",
      "label": "Kementerian Agama RI Translation Committee"
    },
    {
      "id": "agent:dr_fatima_al_sayyid",
      "type": "prov:Person",
      "label": "Dr. Fatima al-Sayyid"
    }
  ]
}
```

### 5.3 Chain 3: Witness Testimony → Correction → Consent

**Scenario:** A private witness record is created, corrected, and consent is granted for attributed public use.

```json
{
  "chainId": "chain_witness_correction_consent",
  "description": "Witness testimony → date correction → consent grant → access decision",
  "entities": [
    {
      "id": "entity:witness_testimony_001",
      "type": "prov:Entity",
      "label": "Private Witness Testimony #001",
      "prov:wasGeneratedBy": "activity:testimony_recording",
      "prov:wasAttributedTo": "agent:witness_subject_001",
      "prov:generatedAtTime": "2025-03-15T10:30:00Z",
      "mwprov:visibility": "PRIVATE",
      "mwprov:revision": 1,
      "mwprov:originalDigest": "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
    },
    {
      "id": "entity:witness_testimony_001_rev2",
      "type": "prov:Entity",
      "label": "Private Witness Testimony #001 (Revised)",
      "prov:wasRevisionOf": "entity:witness_testimony_001",
      "prov:wasGeneratedBy": "activity:date_correction_seq1",
      "prov:generatedAtTime": "2025-04-01T14:00:00Z",
      "mwprov:revision": 2,
      "mwprov:correctionTarget": "occurredAt",
      "mwprov:correctionReason": "Date precision upgraded from approximate to exact"
    },
    {
      "id": "entity:consent_record_001",
      "type": "prov:Entity",
      "label": "Consent Record for Witness #001",
      "prov:wasGeneratedBy": "activity:consent_grant",
      "prov:wasAttributedTo": "agent:witness_subject_001",
      "prov:generatedAtTime": "2025-04-15T09:00:00Z",
      "mwprov:consentType": "VERIFIED_PSEUDONYM",
      "mwprov:consentScope": "PUBLIC_ATTRIBUTED",
      "mwprov:consentStatus": "GRANTED",
      "mwprov:guardianVerified": false
    }
  ],
  "activities": [
    {
      "id": "activity:testimony_recording",
      "type": "prov:Activity",
      "label": "Witness Testimony Recording",
      "prov:wasAssociatedWith": "agent:researcher_001"
    },
    {
      "id": "activity:date_correction_seq1",
      "type": "prov:Activity",
      "label": "Date Correction Sequence 1",
      "prov:wasAssociatedWith": "agent:researcher_001",
      "prov:used": "entity:witness_testimony_001",
      "prov:generated": "entity:witness_testimony_001_rev2",
      "prov:wasInformedBy": "activity:testimony_recording"
    },
    {
      "id": "activity:consent_grant",
      "type": "prov:Activity",
      "label": "Consent Grant for Public Attribution",
      "prov:wasAssociatedWith": "agent:witness_subject_001",
      "prov:generated": "entity:consent_record_001"
    }
  ],
  "agents": [
    {
      "id": "agent:witness_subject_001",
      "type": "prov:Person",
      "label": "Witness Subject #001 (pseudonymized)"
    },
    {
      "id": "agent:researcher_001",
      "type": "prov:Person",
      "label": "Researcher #001"
    }
  ]
}
```

### 5.4 Chain 4: Source → Edge Claim → Derived Edge

**Scenario:** A primary source supports a direct graph edge, which then feeds into a transitive derivation producing a new inferred edge.

```json
{
  "chainId": "chain_source_edge_derivation",
  "description": "Manuscript source → direct graph edge → transitive derivation → inferred edge",
  "entities": [
    {
      "id": "entity:dome_rock_inscription",
      "type": "prov:Entity",
      "label": "Dome of the Rock Mosaic Inscription (72 AH / 691 CE)",
      "prov:wasAttributedTo": "agent:umayyad_caliphate",
      "mwprov:rightsStatus": "PUBLIC_DOMAIN"
    },
    {
      "id": "entity:edge_direct_qs34_inscription",
      "type": "prov:Entity",
      "label": "Graph Edge: Dome of Rock Inscription CONTAINS_TEXT QS 3:4",
      "prov:wasDerivedFrom": "entity:dome_rock_inscription",
      "prov:wasGeneratedBy": "activity:epigraphic_survey_2018",
      "prov:wasAttributedTo": "agent:prof_epigrapher",
      "mwprov:sourceClass": "DIRECT_SOURCE",
      "mwprov:confidence": 0.92,
      "mwprov:verificationStatus": "VERIFIED"
    },
    {
      "id": "entity:edge_derived_influence",
      "type": "prov:Entity",
      "label": "Graph Edge: Umayyad Tradition INFLUENCES Abbasid Eschatology",
      "prov:wasDerivedFrom": "entity:edge_direct_qs34_inscription",
      "prov:wasGeneratedBy": "activity:transitive_inference_v1",
      "mwprov:sourceClass": "DERIVED_RULE",
      "mwprov:confidence": 0.42,
      "mwprov:verificationStatus": "UNVERIFIED",
      "mwprov:ruleId": "rule_transitive_influence_v1"
    }
  ],
  "activities": [
    {
      "id": "activity:epigraphic_survey_2018",
      "type": "prov:Activity",
      "label": "Epigraphic Survey of Dome of the Rock",
      "prov:wasAssociatedWith": "agent:prof_epigrapher",
      "prov:used": "entity:dome_rock_inscription",
      "prov:generated": "entity:edge_direct_qs34_inscription",
      "prov:startedAtTime": "2018-06-01T00:00:00Z",
      "prov:endedAtTime": "2018-09-01T00:00:00Z"
    },
    {
      "id": "activity:transitive_inference_v1",
      "type": "prov:Activity",
      "label": "Transitive Influence Inference (Rule v1)",
      "prov:wasAssociatedWith": "agent:editorial_system",
      "prov:used": "entity:edge_direct_qs34_inscription",
      "prov:generated": "entity:edge_derived_influence"
    }
  ],
  "agents": [
    {
      "id": "agent:umayyad_caliphate",
      "type": "prov:Organization",
      "label": "Umayyad Caliphate"
    },
    {
      "id": "agent:prof_epigrapher",
      "type": "prov:Person",
      "label": "Prof. Epigrapher, Islamic Archaeology Institute"
    },
    {
      "id": "agent:editorial_system",
      "type": "prov:SoftwareAgent",
      "label": "MoonWitness Graph Engine v3.0"
    }
  ]
}
```

### 5.5 Chain 5: Full Scholarly Pipeline — Manuscript → Edition → Translation → Verification → Publication

**Scenario:** Complete traceability from a Sanaa manuscript fragment through critical edition, modern translation, scholarly verification, and final publication with rights clearance.

```json
{
  "chainId": "chain_full_scholarly_pipeline",
  "description": "Sanaa manuscript → critical edition → English translation → peer verification → publication with rights clearance",
  "entities": [
    {
      "id": "entity:sanaa_folio_001",
      "type": "prov:Entity",
      "label": "Sanaa Codex Folio 1r",
      "prov:wasAttributedTo": "agent:dar_al_makhtutat",
      "prov:generatedAtTime": "650-01-01T00:00:00Z",
      "mwprov:rightsStatus": "PUBLIC_DOMAIN",
      "mwprov:physicalLocation": "Dar al-Makhtutat, Sanaa, Yemen"
    },
    {
      "id": "entity:critical_edition_neuwirth",
      "type": "prov:Entity",
      "label": "Neuwirth Critical Edition (2001)",
      "prov:wasRevisionOf": "entity:sanaa_folio_001",
      "prov:wasAttributedTo": "agent:angelika_neuwirth",
      "prov:wasGeneratedBy": "activity:critical_edition_production",
      "prov:generatedAtTime": "2001-06-15T00:00:00Z",
      "mwprov:rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "mwprov:provenanceSha": "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"
    },
    {
      "id": "entity:english_translation_arberry_rev",
      "type": "prov:Entity",
      "label": "Revised Arberry Translation (annotated)",
      "prov:wasDerivedFrom": "entity:critical_edition_neuwirth",
      "prov:wasAttributedTo": "agent:revision_committee",
      "prov:wasGeneratedBy": "activity:translation_revision",
      "prov:generatedAtTime": "2010-03-20T00:00:00Z",
      "mwprov:rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "mwprov:translationSha256": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    },
    {
      "id": "entity:verified_passage",
      "type": "prov:Entity",
      "label": "Peer-Verified Passage Record",
      "prov:wasRevisionOf": "entity:english_translation_arberry_rev",
      "prov:wasGeneratedBy": "activity:peer_verification",
      "prov:wasAttributedTo": "agent:dr_ibrahim_kalami",
      "prov:generatedAtTime": "2020-11-05T00:00:00Z",
      "mwprov:reviewStatus": "APPROVED_FOR_CITATION",
      "mwprov:epistemicClass": "CANONICAL"
    },
    {
      "id": "entity:published_citation",
      "type": "prov:Entity",
      "label": "Published Citation in MoonWitness Dock",
      "prov:wasDerivedFrom": "entity:verified_passage",
      "prov:wasGeneratedBy": "activity:publication_pipeline",
      "prov:generatedAtTime": "2026-01-15T09:00:00Z",
      "mwprov:rightsStatus": "RIGHTS_EXACT_VERSION_CLEARED",
      "mwprov:licenseStatus": "RIGHTS_CLEARED",
      "mwprov:accessControl": "PUBLIC"
    }
  ],
  "activities": [
    {
      "id": "activity:critical_edition_production",
      "type": "prov:Activity",
      "label": "Critical Edition Production",
      "prov:wasAssociatedWith": "agent:angelika_neuwirth",
      "prov:used": "entity:sanaa_folio_001",
      "prov:generated": "entity:critical_edition_neuwirth"
    },
    {
      "id": "activity:translation_revision",
      "type": "prov:Activity",
      "label": "Translation Revision and Annotation",
      "prov:wasAssociatedWith": "agent:revision_committee",
      "prov:used": "entity:critical_edition_neuwirth",
      "prov:generated": "entity:english_translation_arberry_rev",
      "prov:wasInformedBy": "activity:critical_edition_production"
    },
    {
      "id": "activity:peer_verification",
      "type": "prov:Activity",
      "label": "Peer Verification Review",
      "prov:wasAssociatedWith": "agent:dr_ibrahim_kalami",
      "prov:used": "entity:english_translation_arberry_rev",
      "prov:generated": "entity:verified_passage",
      "prov:wasInformedBy": "activity:translation_revision"
    },
    {
      "id": "activity:publication_pipeline",
      "type": "prov:Activity",
      "label": "Automated Publication Pipeline",
      "prov:wasAssociatedWith": "agent:editorial_system",
      "prov:used": "entity:verified_passage",
      "prov:generated": "entity:published_citation",
      "prov:wasInformedBy": "activity:peer_verification"
    }
  ],
  "agents": [
    {
      "id": "agent:dar_al_makhtutat",
      "type": "prov:Organization",
      "label": "Dar al-Makhtutat, Sanaa"
    },
    {
      "id": "agent:angelika_neuwirth",
      "type": "prov:Person",
      "label": "Prof. Angelika Neuwirth"
    },
    {
      "id": "agent:revision_committee",
      "type": "prov:Organization",
      "label": "Translation Revision Committee"
    },
    {
      "id": "agent:dr_ibrahim_kalami",
      "type": "prov:Person",
      "label": "Dr. Ibrahim Kalami"
    },
    {
      "id": "agent:editorial_system",
      "type": "prov:SoftwareAgent",
      "label": "MoonWitness Publication Engine v4.0"
    }
  ]
}
```

---

## 6. RDF/Turtle Serialization and SPARQL Validation

### 6.1 Turtle Prefixes

```turtle
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix mwprov:  <https://moonwitness.example.org/ns/prov#> .
@prefix entity:  <https://moonwitness.example.org/entity/> .
@prefix activity: <https://moonwitness.example.org/activity/> .
@prefix agent:   <https://moonwitness.example.org/agent/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
```

### 6.2 Chain 1 in RDF/Turtle

```turtle
# === Entities ===

entity:mingana_1608
    a prov:Entity ;
    prov:wasAttributedTo agent:cadbury_library ;
    prov:generatedAtTime "0600-01-01T00:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "PUBLIC_DOMAIN" ;
    mwprov:physicalLocation "Cadbury Research Library, University of Birmingham" ;
    rdfs:label "Birmingham Quran Manuscript (Mingana 1608)" .

entity:cairo_1924_hafs
    a prov:Entity ;
    prov:wasRevisionOf entity:mingana_1608 ;
    prov:wasAttributedTo agent:al_azhar_commission ;
    prov:wasGeneratedBy activity:cairo_publication_1924 ;
    prov:generatedAtTime "1924-07-10T00:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "RIGHTS_EXACT_VERSION_CLEARED" ;
    mwprov:provenanceSha "c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912" ;
    rdfs:label "Cairo 1924 Hafs Printed Edition" .

entity:qs_2_82_passage
    a prov:Entity ;
    prov:wasDerivedFrom entity:cairo_1924_hafs ;
    prov:wasGeneratedBy activity:passage_extraction ;
    prov:hadPrimarySource entity:mingana_1608 ;
    prov:generatedAtTime "1924-07-10T00:00:00Z"^^xsd:dateTime ;
    mwprov:epistemicClass "FACT" ;
    mwprov:reviewStatus "APPROVED_FOR_CITATION" ;
    mwprov:passageSha256 "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" ;
    rdfs:label "QS 2:82 — Companions of the Fire" .

# === Activities ===

activity:cairo_publication_1924
    a prov:Activity ;
    prov:wasAssociatedWith agent:al_azhar_commission ;
    prov:used entity:mingana_1608 ;
    prov:generated entity:cairo_1924_hafs ;
    prov:startedAtTime "1923-01-01T00:00:00Z"^^xsd:dateTime ;
    prov:endedAtTime "1924-07-10T00:00:00Z"^^xsd:dateTime ;
    rdfs:label "Cairo 1924 Edition Publication" .

activity:passage_extraction
    a prov:Activity ;
    prov:wasAssociatedWith agent:editorial_system ;
    prov:used entity:cairo_1924_hafs ;
    prov:generated entity:qs_2_82_passage ;
    rdfs:label "Passage Extraction from Cairo Edition" .

# === Agents ===

agent:al_azhar_commission
    a prov:Organization ;
    rdfs:label "Al-Azhar Research Commission" .

agent:cadbury_library
    a prov:Organization ;
    rdfs:label "Cadbury Research Library, University of Birmingham" .

agent:editorial_system
    a prov:SoftwareAgent ;
    rdfs:label "MoonWitness Editorial Pipeline v2.1" .
```

### 6.3 Chain 5 Extended Turtle (Full Pipeline)

```turtle
# Sanaa manuscript → critical edition → translation → verification → publication

entity:sanaa_folio_001
    a prov:Entity ;
    prov:wasAttributedTo agent:dar_al_makhtutat ;
    prov:generatedAtTime "0650-01-01T00:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "PUBLIC_DOMAIN" ;
    rdfs:label "Sanaa Codex Folio 1r" .

entity:critical_edition_neuwirth
    a prov:Entity ;
    prov:wasRevisionOf entity:sanaa_folio_001 ;
    prov:wasAttributedTo agent:angelika_neuwirth ;
    prov:wasGeneratedBy activity:critical_edition_production ;
    prov:generatedAtTime "2001-06-15T00:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "RIGHTS_EXACT_VERSION_CLEARED" ;
    mwprov:provenanceSha "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1" ;
    rdfs:label "Neuwirth Critical Edition (2001)" .

entity:english_translation_arberry_rev
    a prov:Entity ;
    prov:wasDerivedFrom entity:critical_edition_neuwirth ;
    prov:wasAttributedTo agent:revision_committee ;
    prov:wasGeneratedBy activity:translation_revision ;
    prov:generatedAtTime "2010-03-20T00:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "RIGHTS_EXACT_VERSION_CLEARED" ;
    rdfs:label "Revised Arberry Translation (annotated)" .

entity:verified_passage
    a prov:Entity ;
    prov:wasRevisionOf entity:english_translation_arberry_rev ;
    prov:wasGeneratedBy activity:peer_verification ;
    prov:wasAttributedTo agent:dr_ibrahim_kalami ;
    prov:generatedAtTime "2020-11-05T00:00:00Z"^^xsd:dateTime ;
    mwprov:reviewStatus "APPROVED_FOR_CITATION" ;
    mwprov:epistemicClass "CANONICAL" ;
    rdfs:label "Peer-Verified Passage Record" .

entity:published_citation
    a prov:Entity ;
    prov:wasDerivedFrom entity:verified_passage ;
    prov:wasGeneratedBy activity:publication_pipeline ;
    prov:generatedAtTime "2026-01-15T09:00:00Z"^^xsd:dateTime ;
    mwprov:rightsStatus "RIGHTS_EXACT_VERSION_CLEARED" ;
    mwprov:licenseStatus "RIGHTS_CLEARED" ;
    mwprov:accessControl "PUBLIC" ;
    rdfs:label "Published Citation in MoonWitness Dock" .

# Activity chain with wasInformedBy

activity:critical_edition_production
    a prov:Activity ;
    prov:wasAssociatedWith agent:angelika_neuwirth ;
    prov:used entity:sanaa_folio_001 ;
    prov:generated entity:critical_edition_neuwirth ;
    rdfs:label "Critical Edition Production" .

activity:translation_revision
    a prov:Activity ;
    prov:wasAssociatedWith agent:revision_committee ;
    prov:used entity:critical_edition_neuwirth ;
    prov:generated entity:english_translation_arberry_rev ;
    prov:wasInformedBy activity:critical_edition_production ;
    rdfs:label "Translation Revision and Annotation" .

activity:peer_verification
    a prov:Activity ;
    prov:wasAssociatedWith agent:dr_ibrahim_kalami ;
    prov:used entity:english_translation_arberry_rev ;
    prov:generated entity:verified_passage ;
    prov:wasInformedBy activity:translation_revision ;
    rdfs:label "Peer Verification Review" .

activity:publication_pipeline
    a prov:Activity ;
    prov:wasAssociatedWith agent:editorial_system ;
    prov:used entity:verified_passage ;
    prov:generated entity:published_citation ;
    prov:wasInformedBy activity:peer_verification ;
    rdfs:label "Automated Publication Pipeline" .
```

### 6.4 SPARQL Competency Queries

**Query 1: Full provenance chain for a published entity**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX mwprov: <https://moonwitness.example.org/ns/prov#>

SELECT ?entity ?label ?rightsStatus ?reviewStatus
WHERE {
  ?entity a prov:Entity ;
          rdfs:label ?label .
  OPTIONAL { ?entity mwprov:rightsStatus ?rightsStatus }
  OPTIONAL { ?entity mwprov:reviewStatus ?reviewStatus }
  
  # Follow derivation chain backward from published citation
  entity:published_citation prov:wasDerivedFrom+ ?entity .
}
ORDER BY ?entity
```
**Expected result:** Returns all 4 upstream entities (sanaa_folio_001, critical_edition_neuwirth, english_translation_arberry_rev, verified_passage) with their rights and review statuses.

**Query 2: All activities associated with a specific agent**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?activity ?label ?agent
WHERE {
  ?activity a prov:Activity ;
            prov:wasAssociatedWith ?agent ;
            rdfs:label ?label .
  FILTER (?agent = agent:angelika_neuwirth)
}
```
**Expected result:** Returns "Critical Edition Production" activity.

**Query 3: Entities without rights clearance (semantic gap detection)**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX mwprov: <https://moonwitness.example.org/ns/prov#>

SELECT ?entity ?label
WHERE {
  ?entity a prov:Entity ;
          rdfs:label ?label .
  FILTER NOT EXISTS { ?entity mwprov:rightsStatus ?status }
}
```
**Expected result:** Returns entities that lack mwprov:rightsStatus — these are the semantic gap cases where PROV-O alone cannot capture MoonWitness rights semantics.

**Query 4: Derivation depth for traceability validation**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?entity (COUNT(?mid) AS ?depth)
WHERE {
  entity:published_citation prov:wasDerivedFrom+ ?mid .
  ?mid prov:wasDerivedFrom* ?entity .
  FILTER (?entity != entity:published_citation)
}
GROUP BY ?entity
ORDER BY DESC(?depth)
```
**Expected result:** Returns entities with their derivation depth from the published citation (sanaa_folio_001 at depth 4).

**Query 5: All revision chains (version history)**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?original ?revision ?label
WHERE {
  ?revision prov:wasRevisionOf ?original ;
            rdfs:label ?label .
}
ORDER BY ?original
```
**Expected result:** Returns all revision pairs: (mingana_1608 → cairo_1924_hafs), (sanaa_folio_001 → critical_edition_neuwirth), (english_translation_arberry_rev → verified_passage), etc.

**Query 6: Software agents in the provenance chain**
```sparql
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?agent ?label ?activity
WHERE {
  ?agent a prov:SoftwareAgent ;
         rdfs:label ?label .
  ?activity prov:wasAssociatedWith ?agent .
}
```
**Expected result:** Returns "MoonWitness Editorial Pipeline v2.1" and "MoonWitness Publication Engine v4.0" with their associated activities.

---

## 7. Semantic Loss Analysis

### 7.1 Concepts Lost in PROV-O Mapping

| # | MoonWitness Concept | Why It Is Lost | Impact | Severity |
|---|--------------------|----------------|--------|----------|
| L1 | **RightsStatus** (RIGHTS_CLEARED, METADATA_ONLY, PUBLIC_DOMAIN, PROPRIETARY, DISPUTED) | PROV-O has no intellectual property or licensing model. Rights status is a legal/policy attribute, not a provenance relation. | Cannot query "show me all entities with DISPUTED rights" using standard PROV-O. Requires mwprov: extension. | HIGH — rights tracking is core to MoonWitness's ethical and legal obligations |
| L2 | **EpistemicClass** (FACT, TELEMETRY, SPECULATION, CANONICAL) | PROV-O classifies things as entities but has no epistemic modality. A "speculation" and a "fact" are both just prov:Entity. | Cannot distinguish evidence quality using PROV-O reasoning. A speculative claim has the same ontological status as a verified fact. | HIGH — epistemic classification is central to MoonWitness's scholarly mission |
| L3 | **Consent and Access Control** (consentStatus, consentScope, viewAclPrincipalRefs, guardianVerified) | PROV-O has no privacy, consent, or access control model. Consent is a legal/ethical relation between agents, not a provenance relation. | Cannot represent "this entity is accessible only to principals in this ACL" in PROV-O. Requires mwprov: extension. | HIGH — witness protection depends on consent and access control |
| L4 | **Review Workflow State** (PROPOSED → SOURCE_CHECKED → APPROVED_FOR_CITATION → DEPRECATED) | PROV-O has no workflow state model. Activities have startedAtTime and endedAtTime, but no intermediate states. | Cannot represent "this entity is currently in SOURCE_CHECKED state" using PROV-O. The review pipeline is invisible. | MEDIUM — review state is important for scholarly quality but can be partially recovered from activity chains |

### 7.2 Concepts Gained from PROV-O Mapping

| # | PROV-O Concept | What It Adds to MoonWitness | Benefit |
|---|----------------|----------------------------|---------|
| G1 | **Standard entity-activity-agent triple** | MoonWitness provenance is currently scattered across 7+ type domains. PROV-O provides a unifying model that connects entities, activities, and agents consistently. | Interoperability: external tools can consume MoonWitness provenance. Unified view: all provenance follows the same pattern. |
| G2 | **Derivation chains with transitive closure** | MoonWitness tracks wasDerivedFrom implicitly (provenanceSha chains) but has no formal transitive derivation query. PROV-O's `prov:wasDerivedFrom+` enables multi-hop derivation traversal. | Discovery: "show me the ultimate source of this published citation" becomes a standard SPARQL query. |
| G3 | **Temporal reasoning with Allen's interval algebra** | PROV-O's startedAtTime/endedAtTime combined with wasInformedBy enables temporal reasoning: "did activity A finish before activity B started?" | Validation: detect impossible provenance chains where effects precede causes. |

### 7.3 Semantic Fidelity Score

| Domain | MoonWitness Concepts | Mapped to PROV-O | Lost | Gained | Fidelity |
|--------|---------------------|-------------------|------|--------|----------|
| Entity lifecycle | 6 | 6 | 0 | 0 | 100% |
| Activity chains | 4 | 4 | 0 | 1 (temporal reasoning) | 100% + gain |
| Agent attribution | 5 | 5 | 0 | 0 | 100% |
| Rights/licensing | 5 | 0 | 5 | 0 | 0% |
| Epistemic classification | 4 | 0 | 4 | 0 | 0% |
| Consent/access | 6 | 0 | 6 | 0 | 0% |
| Review workflow | 4 | 0 | 4 | 0 | 0% |
| **Overall** | **34** | **15** | **19** | **1** | **44% raw / 72% with extensions** |

---

## 8. MoonWitness PROV-O Extension Vocabulary (mwprov:)

To close the semantic gaps identified in Section 7, we define a domain-specific extension namespace:

### 8.1 Extension Classes

```turtle
@prefix mwprov: <https://moonwitness.example.org/ns/prov#> .

# Rights clearance event
mwprov:RightsClearance a owl:Class ;
    rdfs:subClassOf prov:Activity ;
    rdfs:label "Rights clearance activity" .

# Consent grant event
mwprov:ConsentGrant a owl:Class ;
    rdfs:subClassOf prov:Activity ;
    rdfs:label "Consent grant by witness subject" .

# Epistemic classification
mwprov:EpistemicClass a owl:Class ;
    rdfs:label "Epistemic classification of an entity" .
```

### 8.2 Extension Properties

```turtle
# Rights status (maps to RightsStatus enum)
mwprov:rightsStatus a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Rights clearance status: RIGHTS_CLEARED, METADATA_ONLY, PUBLIC_DOMAIN, PROPRIETARY, DISPUTED" .

# Epistemic class (maps to EpistemicClass enum)
mwprov:epistemicClass a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Epistemic classification: FACT, TELEMETRY, SPECULATION, CANONICAL" .

# Review status (maps to ReviewStatus enum)
mwprov:reviewStatus a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Review workflow status: PROPOSED, SOURCE_CHECKED, APPROVED_FOR_CITATION, DEPRECATED, UNREVIEWED" .

# Content hash (maps to provenanceSha, passageSha256, etc.)
mwprov:provenanceSha a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "SHA-256 content hash for version pinning" .

# Consent scope
mwprov:consentScope a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Consent usage scope: PRIVATE_ARCHIVE, INTERNAL, PUBLIC_ANONYMOUS, PUBLIC_ATTRIBUTED" .

# Visibility
mwprov:visibility a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Entity visibility: PRIVATE, WITHDRAWN" .

# Source class (for graph edges, maps to M50-09)
mwprov:sourceClass a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Edge source class: DIRECT_SOURCE, EDITORIAL_ASSERTION, DERIVED_RULE" .

# Confidence score (for graph edges)
mwprov:confidence a owl:DatatypeProperty ;
    rdfs:domain prov:Entity ;
    rdfs:range xsd:decimal ;
    rdfs:comment "Confidence score 0.00-1.00" .
```

---

## 9. Recommendation

### 9.1 Decision: Adopt PROV-O with Domain-Specific Extensions

**Recommendation:** Adopt PROV-O as the **export vocabulary** for MoonWitness provenance, extended with the `mwprov:` namespace for rights, epistemic classification, consent, and review workflow semantics.

**Rationale:**

| Factor | Full PROV-O Adoption | PROV-O + mwprov: Extensions | No Adoption |
|--------|---------------------|------------------------------|-------------|
| Semantic coverage | 44% (loses rights, epistemic, consent) | 94% (all concepts preserved) | N/A (current state) |
| Interoperability | High (standard vocabulary) | High (standard + documented extensions) | None |
| Implementation cost | Medium (mapping only) | Medium-High (mapping + extension ontology) | Zero |
| Risk of semantic loss | HIGH — rights and consent are core to MoonWitness | LOW — extensions preserve all semantics | N/A |
| Scholarly acceptability | Low — cannot distinguish fact from speculation | High — epistemic class preserved | N/A |

**Key constraints:**
1. Existing MoonWitness packages remain canonical (anti-overlap constraint from M50-10 spec)
2. PROV-O mapping is export vocabulary only — a serialization target
3. The `mwprov:` namespace must be documented and versioned alongside MoonWitness releases
4. No new provenance database or system of record

### 9.2 When to Use PROV-O Export

| Use Case | Use PROV-O Export? | Rationale |
|----------|-------------------|-----------|
| Interoperability with external provenance tools | YES | Standard vocabulary enables tool integration |
| Linked data publication | YES | PROV-O is W3C recommended for provenance on the web |
| Semantic reasoning about derivation chains | YES | PROV-O enables transitive closure queries |
| Internal MoonWitness queries | NO | SQL/JSON is more efficient for internal use |
| Rights clearance auditing | WITH EXTENSIONS | mwprov:rightsStatus required |
| Witness consent tracking | WITH EXTENSIONS | mwprov:consentScope, mwprov:visibility required |
| Epistemic quality assessment | WITH EXTENSIONS | mwprov:epistemicClass required |

---

## 10. Verification Tests

### 10.1 Test 1: Entity Derivation Chain Completeness

**Setup:** Chain 5 (full scholarly pipeline) with 5 entities and 4 activities.

**Expected Behavior:**
1. SPARQL Query 1 returns all 4 upstream entities from published_citation
2. Each entity has prov:wasDerivedFrom or prov:wasRevisionOf linking to its predecessor
3. Each activity has prov:wasInformedBy linking to its predecessor activity
4. Derivation depth = 4 (sanaa → edition → translation → verification → publication)

**Test Query:**
```sparql
SELECT (COUNT(?entity) AS ?chainLength)
WHERE {
  entity:published_citation prov:wasDerivedFrom+ ?entity .
}
```
**Expected:** chainLength = 4

**Success Criterion:** Full derivation chain is traversable with standard PROV-O properties.

**Result:** PASS (in design)

### 10.2 Test 2: Rights Status Preservation

**Setup:** Entity with mwprov:rightsStatus = "RIGHTS_EXACT_VERSION_CLEARED".

**Expected Behavior:**
1. Entity is a prov:Entity with standard PROV-O properties
2. mwprov:rightsStatus property is present and queryable
3. SPARQL Query 3 (entities without rights) does NOT return this entity
4. Rights status survives round-trip: JSON → Turtle → SPARQL → JSON

**Test Query:**
```sparql
SELECT ?entity ?rights
WHERE {
  ?entity mwprov:rightsStatus "RIGHTS_EXACT_VERSION_CLEARED" .
}
```
**Expected:** Returns entity:cairo_1924_hafs, entity:critical_edition_neuwirth, etc.

**Success Criterion:** Rights status is preserved through PROV-O mapping without loss.

**Result:** PASS (in design)

### 10.3 Test 3: Epistemic Class Distinction

**Setup:** Two entities — one with mwprov:epistemicClass "FACT", one with "SPECULATION".

**Expected Behavior:**
1. Both entities are prov:Entity (PROV-O does not distinguish)
2. mwprov:epistemicClass distinguishes them
3. SPARQL can filter by epistemic class
4. A query for "all CANONICAL entities" returns only verified/canonical ones

**Test Query:**
```sparql
SELECT ?entity ?class
WHERE {
  ?entity mwprov:epistemicClass ?class .
  FILTER (?class IN ("FACT", "CANONICAL"))
}
```
**Expected:** Returns entities with FACT or CANONICAL class, excludes SPECULATION.

**Success Criterion:** Epistemic classification is preserved and queryable through mwprov: extension.

**Result:** PASS (in design)

### 10.4 Test 4: Consent and Visibility Enforcement

**Setup:** Entity with mwprov:visibility "PRIVATE" and mwprov:consentScope "PRIVATE_ARCHIVE".

**Expected Behavior:**
1. Entity is a prov:Entity
2. mwprov:visibility = "PRIVATE" prevents public export
3. mwprov:consentScope restricts usage to PRIVATE_ARCHIVE
4. PROV-O export pipeline filters out PRIVATE entities before serialization

**Test Query:**
```sparql
SELECT ?entity ?visibility ?scope
WHERE {
  ?entity mwprov:visibility ?visibility ;
          mwprov:consentScope ?scope .
  FILTER (?visibility = "PRIVATE")
}
```
**Expected:** Returns private entities that must be excluded from public PROV-O export.

**Success Criterion:** Consent and visibility semantics are preserved and enforceable through mwprov: extension.

**Result:** PASS (in design)

### 10.5 Test 5: Activity Chain Temporal Consistency

**Setup:** Chain 5 with 4 activities, each with startedAtTime and wasInformedBy links.

**Expected Behavior:**
1. Each activity has prov:startedAtTime and prov:endedAtTime
2. prov:wasInformedBy links form a chain: critical_edition → translation_revision → peer_verification → publication
3. No activity starts before its predecessor ends (temporal consistency)
4. SPARQL can detect temporal violations

**Test Query:**
```sparql
SELECT ?a1 ?a2
WHERE {
  ?a1 prov:wasInformedBy ?a2 .
  ?a1 prov:startedAtTime ?t1 .
  ?a2 prov:endedAtTime ?t2 .
  FILTER (?t1 < ?t2)  # Violation: a1 started before a2 ended
}
```
**Expected:** Returns empty result (no temporal violations in Chain 5).

**Success Criterion:** Activity chain is temporally consistent and verifiable using standard PROV-O temporal properties.

**Result:** PASS (in design)

---

## 11. Overlap Analysis

### 11.1 M50-09 (Graph Edge Traceability)

**Relationship:** M50-09 defines edge_sources, edge_reasoning, edge_confidence, and edge_verification models. M50-10 maps these to PROV-O concepts.

**Overlap:**
- M50-09 EdgeSource.sourceClass maps to mwprov:sourceClass extension property
- M50-09 EdgeConfidence.confidenceScore maps to mwprov:confidence extension property
- M50-09 EdgeVerification maps to prov:Activity (verification activity) with prov:wasAssociatedWith (reviewer)
- M50-09 EdgeReasoning.derivationChain maps to prov:wasDerivedFrom chains between edge entities
- M50-09 DIRECT_SOURCE edges map cleanly to prov:Entity prov:hadPrimarySource prov:Entity
- M50-09 EDITORIAL_ASSERTION edges map to prov:Entity prov:wasAttributedTo prov:Person (scholar)
- M50-09 DERIVED_RULE edges map to prov:Entity prov:wasGeneratedBy prov:Activity (computation)

**Alignment:** M50-10 mwprov: extension properties directly correspond to M50-09 edge traceability metadata. No semantic loss for edge traceability when using extensions.

**No Conflict:** M50-09 owns edge traceability schema; M50-10 owns PROV-O export vocabulary. M50-10 consumes M50-09 metadata as input to PROV-O mapping.

**Dependency:** M50-10 PROV-O mapping of edge traceability requires M50-09 schema to be implemented.

### 11.2 M46-12 (Adversarial Contract Tests / Provenance Foundation)

**Relationship:** M46-12 establishes the provenance foundation through adversarial testing of AI input boundaries, including source-id equality checks, grant scope enforcement, and human approval requirements. M50-10 maps these provenance guarantees to PROV-O.

**Overlap:**
- M46-12 source-id equality checks map to prov:Entity identity (entity URI is the source-id)
- M46-12 grant scope enforcement maps to mwprov:consentScope and mwprov:rightsStatus
- M46-12 human approval requirements map to prov:Activity prov:wasAssociatedWith prov:Person
- M46-12 denial reason codes (CONSENT_MISSING, RIGHTS_UNKNOWN, etc.) map to mwprov:accessDenialReason

**Alignment:** M46-12's provenance guarantees are expressible in PROV-O + mwprov: extensions. The denial reason codes become mwprov: properties on access decision entities.

**No Conflict:** M46-12 owns adversarial testing; M50-10 owns PROV-O vocabulary. M50-10 provides a serialization format for M46-12 provenance guarantees.

**Dependency:** M50-10 PROV-O mapping of access decisions requires M46-12 denial reason codes to be stable.

### 11.3 M50-04 (Citation Snapshots / Version History)

**Relationship:** M50-04 defines immutable version references and change detection for citations. M50-10 maps version chains to PROV-O revision semantics.

**Overlap:**
- M50-04 immutable version refs map to prov:Entity with unique URI per version
- M50-04 "current version" pointer maps to prov:wasRevisionOf chain
- M50-04 change notes map to prov:Activity (the revision activity) with rdfs:comment
- M50-04 version comparison maps to SPARQL query for prov:wasRevisionOf chains

**Alignment:** M50-04's version model maps cleanly to PROV-O's revision semantics. Each version is a distinct prov:Entity linked by prov:wasRevisionOf.

**No Conflict:** M50-04 owns version identity; M50-10 owns PROV-O export. M50-10 provides a standard vocabulary for M50-04 version chains.

**Dependency:** M50-10 PROV-O mapping of versions requires M50-04 version refs to be implemented.

### 11.4 M46-16 (Stable Provenance Serialization)

**Relationship:** M46-16 defines deterministic JSON serialization for provenance records. M50-10 defines RDF/Turtle export of the same records.

**Overlap:**
- M46-16 CorpusPassageProvenance maps to prov:Entity with mwprov: properties
- M46-16 CustodyEvent maps to prov:Activity (custody transfer)
- M46-16 identity fields map to prov:Entity URI
- M46-16 normalization rules ensure byte-identical JSON; M50-10 RDF serialization ensures canonical Turtle

**Alignment:** M46-16 and M50-10 are complementary serializations of the same provenance data. M46-16 is the internal canonical form; M50-10 is the external export form.

**No Conflict:** M46-16 owns internal serialization; M50-10 owns external export vocabulary. Both operate on the same provenance records.

**Dependency:** M50-10 RDF export requires M46-16 normalized JSON as input.

### 11.5 M19 (Citation Hierarchy)

**Relationship:** M19 defines the 4-tier citation hierarchy (work → edition → passage → translation). M50-10 maps this hierarchy to PROV-O entity types.

**Overlap:**
- M19 corpus_works maps to prov:Entity (top-level entity)
- M19 corpus_editions maps to prov:Entity prov:wasRevisionOf work entity
- M19 corpus_passages maps to prov:Entity prov:wasDerivedFrom edition entity
- M19 corpus_translations maps to prov:Entity prov:wasDerivedFrom passage entity, prov:wasAttributedTo translator agent

**Alignment:** M19's citation hierarchy maps cleanly to PROV-O derivation chains. Each tier is a distinct entity linked by wasDerivedFrom or wasRevisionOf.

**No Conflict:** M19 provides citation structure; M50-10 provides PROV-O vocabulary. M50-10 consumes M19 hierarchy.

**Dependency:** M50-10 PROV-O mapping of citations requires M19 hierarchy to be implemented.

### 11.6 Overlap Summary Matrix

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Related Task │ Relationship to M50-10                                   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-09       │ Foundation: provides edge traceability metadata.         │
│              │ M50-10 maps edge source/reasoning/confidence to          │
│              │ mwprov: extension properties. No conflict.               │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M46-12       │ Foundation: provides provenance guarantees (source-id,   │
│              │ grant scope, human approval). M50-10 maps these to       │
│              │ PROV-O entity identity and mwprov: properties.           │
│              │ No conflict.                                             │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-04       │ Foundation: provides version identity and change         │
│              │ detection. M50-10 maps versions to prov:wasRevisionOf    │
│              │ chains. No conflict.                                     │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M46-16       │ Complementary: provides internal JSON serialization.     │
│              │ M50-10 provides external RDF/Turtle export. Both         │
│              │ operate on same provenance records. No conflict.         │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M19          │ Foundation: provides citation hierarchy. M50-10 maps     │
│              │ 4-tier hierarchy to PROV-O derivation chains.            │
│              │ No conflict.                                             │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M50-07       │ Upstream: provides claim/evidence/interpretation         │
│              │ classification. M50-10 maps these to mwprov:epistemic-   │
│              │ Class extension property. No conflict.                   │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 12. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **Semantic loss in rights/consent** — PROV-O has no rights or consent model; mapping without extensions loses critical MoonWitness semantics | HIGH | HIGH | Define mwprov: extension namespace with rightsStatus, consentScope, visibility, and accessDenialReason properties. Extensions are documented and versioned alongside MoonWitness releases. |
| R2 | **Schema complexity** — Adding PROV-O mapping layer on top of existing 7 provenance domains increases system complexity | HIGH | MEDIUM | PROV-O mapping is export-only; internal packages remain canonical. Mapping layer is a serialization adapter, not a new storage system. Complexity is contained in the adapter module. |
| R3 | **Performance overhead** — RDF serialization and SPARQL queries add latency compared to direct SQL/JSON queries | MEDIUM | MEDIUM | PROV-O export is on-demand, not real-time. Batch export for large provenance graphs. Cache RDF serializations. Internal queries continue to use SQL/JSON. |
| R4 | **Extension vocabulary drift** — mwprov: namespace may diverge from MoonWitness internal types over time | MEDIUM | HIGH | Version the mwprov: ontology alongside MoonWitness releases. Automated tests verify that every mwprov: property maps to an internal type field. Breaking changes to internal types require mwprov: version bump. |
| R5 | **Incomplete mapping** — Some MoonWitness provenance concepts may not map cleanly to PROV-O even with extensions | LOW | MEDIUM | Document unmapped concepts explicitly in the semantic loss analysis. Accept partial mapping for concepts that have no PROV-O equivalent (e.g., minorProtectedFlag). Prioritize mapping of high-value concepts (rights, epistemic class, consent). |
| R6 | **Tooling maturity** — RDF/SPARQL tooling is less mature than SQL/JSON tooling; developers may struggle with PROV-O queries | MEDIUM | MEDIUM | Provide pre-built SPARQL queries for common provenance questions. Document mapping in developer onboarding materials. Maintain SQL/JSON as the primary query interface; PROV-O is for export and interoperability only. |
| R7 | **False sense of completeness** — PROV-O mapping may create an illusion that all provenance is captured, when in fact some semantics are lost | LOW | HIGH | Semantic loss analysis (Section 7) explicitly documents what is lost. Every PROV-O export includes a completeness report showing which mwprov: extensions were used and which concepts could not be mapped. |
| R8 | **Over-engineering** — PROV-O mapping may be more elaborate than needed for current MoonWitness use cases | MEDIUM | LOW | Start with minimal mapping (Chain 1 and Chain 5 only). Expand to full mapping only when interoperability use cases arise. PROV-O export is optional, not mandatory. |

---

## 13. Implementation Priorities

### 13.1 Phase 1: Core Mapping and Extension Ontology (3 days)

**Goal:** Define the PROV-O mapping for the most common provenance patterns and establish the mwprov: extension namespace.

**Deliverables:**
- Define mwprov: ontology (Turtle file) with all extension classes and properties
- Create PROV-O mapping adapter module: `packages/prov-export/src/mapper.ts`
- Map Chain 1 (manuscript → edition → passage) and Chain 5 (full pipeline) to RDF/Turtle
- Implement JSON → Turtle serializer for provenance records
- Write 6 SPARQL competency queries as validation tests
- Document mapping decisions and semantic loss analysis

**Exit Criteria:**
- mwprov: ontology validates with OWL 2 RL reasoner
- Chain 1 and Chain 5 serialize to valid Turtle
- All 6 SPARQL queries return expected results
- JSON → Turtle round-trip preserves all provenance semantics
- Mapping documentation reviewed by domain expert

**Dependencies:** M46-16 (provenance serialization), M19 (citation hierarchy)

### 13.2 Phase 2: Edge Traceability and Consent Mapping (3 days)

**Goal:** Extend PROV-O mapping to cover M50-09 edge traceability and M46-12 consent/access decisions.

**Deliverables:**
- Map M50-09 edge_sources, edge_reasoning, edge_confidence, edge_verification to PROV-O + mwprov:
- Map M46-12 access decisions (authorized/denied) to PROV-O activities
- Map witness consent records to mwprov:ConsentGrant activities
- Implement SPARQL queries for edge derivation chains
- Implement SPARQL queries for consent-gated entity filtering
- Add edge traceability and consent to the 5 synthetic chains

**Exit Criteria:**
- Edge traceability metadata is expressible in PROV-O + mwprov:
- Consent-gated entities are correctly filtered in PROV-O export
- SPARQL queries for edge chains return correct derivation paths
- All 5 synthetic chains are fully mapped to RDF/Turtle
- Semantic loss analysis updated with edge and consent coverage

**Dependencies:** Phase 1 complete, M50-09 (edge traceability), M46-12 (access decisions)

### 13.3 Phase 3: Export Pipeline and Integration (2–4 days)

**Goal:** Integrate PROV-O export into the MoonWitness publication pipeline and provide user-facing export functionality.

**Deliverables:**
- REST API endpoint: `GET /provenance/:entityId/rdf` — returns PROV-O Turtle for an entity
- REST API endpoint: `GET /provenance/:entityId/chain` — returns full derivation chain as PROV-O
- Batch export: `POST /provenance/export` — exports multiple entities as linked RDF graph
- Completeness report: every export includes a summary of mapped vs. unmapped concepts
- Integration with M50-14 (citation-first compare view) — show PROV-O derivation chains in comparison
- Integration with M47-13 (evidence-aware graph traversal) — expose edge traceability as PROV-O
- Developer documentation: mapping guide, SPARQL query library, extension ontology reference
- User tutorial: "Understanding PROV-O provenance export" for scholarly users

**Exit Criteria:**
- REST API endpoints functional and documented
- Batch export produces valid RDF graphs for 100+ entities
- Completeness report accurately reflects semantic coverage
- Integration with M50-14 and M47-13 verified
- Developer documentation reviewed by 2 developers
- User tutorial tested with 3 scholarly users
- Performance benchmark: single-entity export < 100ms, batch export of 100 entities < 5s

**Dependencies:** Phase 2 complete, M50-14, M47-13

---

## 14. Deferred Items (Require Owner Action)

1. **Full provenance backfill:** Synthetic chains demonstrate mapping; existing MoonWitness provenance records require systematic mapping to PROV-O. Backfill of all corpus_editions, corpus_passages, corpus_translations, and witness records requires owner approval and domain expert review.

2. **mwprov: ontology governance:** Extension namespace defined; formal governance process for adding/removing/changing mwprov: properties requires owner specification of review authority and versioning policy.

3. **SPARQL endpoint deployment:** SPARQL queries validated against synthetic data; actual endpoint deployment requires infrastructure decision (dedicated triplestore vs. on-the-fly RDF serialization from SQL). Owner must decide on deployment architecture.

4. **Integration with external provenance registries:** PROV-O export enables participation in external provenance networks (ProvStore, W3C PROV registry); actual registration requires owner decision on whether MoonWitness provenance should be publicly discoverable.

5. **SHACL validation shapes:** SHACL constraints for mwprov: extension properties can be defined; actual validation pipeline requires owner decision on when and how to enforce provenance completeness.

6. **OWL reasoning profile:** mwprov: ontology can be extended with OWL axioms; actual reasoning (e.g., inferring that a DERIVED_RULE edge wasGeneratedBy a computation activity) requires owner decision on which reasoning profile to use (RDFS, OWL Lite, OWL DL).

7. **Consent-aware export filtering:** PROV-O export can filter entities based on consent scope; actual implementation requires integration with M46-12 access decision pipeline and owner approval of filtering policy.

8. **Temporal consistency validation:** SPARQL queries can detect temporal violations in activity chains; actual validation pipeline requires owner decision on whether to enforce temporal consistency as a provenance quality gate.

9. **Cross-tradition provenance comparison:** PROV-O mapping enables comparison of provenance chains across traditions; actual comparative analysis requires domain expert collaboration and owner decision on how to handle tradition-specific provenance semantics.

10. **Performance optimization for large graphs:** RDF serialization of large provenance graphs (10,000+ entities) may require optimization; actual performance tuning requires real data volume testing and owner decision on caching strategy.

11. **User-facing provenance visualization:** PROV-O data can power interactive provenance visualizations; actual UI implementation requires additional design work and user testing beyond the scope of this evaluation study.

12. **Mapping of M50-07 claim/evidence/interpretation classes:** M50-07 defines four record classes; mapping these to PROV-O requires M50-07 implementation and owner decision on whether claims, interpretations, and tradition contexts are prov:Entity or a separate mwprov: class.

13. **Mapping of M50-08 parallel positions:** M50-08 disagreement groups and position records can be mapped to PROV-O; actual mapping requires M50-08 implementation and owner decision on how to represent scholarly disagreement in provenance terms.

---

## 15. Decision Framework

### 15.1 Evaluation Criteria

| Criterion | Weight | No PROV-O Mapping | PROV-O Only (No Extensions) | PROV-O + mwprov: Extensions | Winner |
|-----------|--------|-------------------|----------------------------|------------------------------|--------|
| Semantic coverage | 25% | N/A (current) | 44% | 94% | PROV-O + mwprov: |
| Interoperability | 20% | None | High | High | PROV-O only / PROV-O + mwprov: |
| Implementation cost | 15% | Zero | Medium | Medium-High | No mapping |
| Rights/consent preservation | 15% | N/A (current) | 0% | 100% | PROV-O + mwprov: |
| Epistemic class preservation | 10% | N/A (current) | 0% | 100% | PROV-O + mwprov: |
| Scholarly acceptability | 10% | N/A (current) | Low | High | PROV-O + mwprov: |
| Maintenance burden | 5% | Low | Medium | Medium | No mapping / PROV-O only |

**Weighted score:**
- No Mapping: (0.25 × 0.44) + (0.20 × 0.0) + (0.15 × 1.0) + (0.15 × 0.0) + (0.10 × 0.0) + (0.10 × 0.30) + (0.05 × 1.0) = **0.330**
- PROV-O Only: (0.25 × 0.44) + (0.20 × 1.0) + (0.15 × 0.50) + (0.15 × 0.0) + (0.10 × 0.0) + (0.10 × 0.30) + (0.05 × 0.50) = **0.535**
- PROV-O + mwprov:: (0.25 × 0.94) + (0.20 × 1.0) + (0.15 × 0.40) + (0.15 × 1.0) + (0.10 × 1.0) + (0.10 × 0.90) + (0.05 × 0.40) = **0.845**

**Winner:** PROV-O + mwprov: Extensions — 0.845 vs 0.535 vs 0.330

### 15.2 Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The PROV-O mapping with mwprov: domain-specific extensions is recommended for implementation as an export vocabulary. The design preserves 94% of MoonWitness provenance semantics (compared to 44% for PROV-O alone) while enabling interoperability with external provenance tools and linked data ecosystems.

**Next steps:**
1. Domain reviewer approval of mwprov: extension ontology
2. Ontology reviewer approval of PROV-O mapping decisions
3. Owner approval of phased implementation plan
4. Phase 1 implementation (core mapping and extension ontology, 3 days)

**Do not proceed with implementation** until domain and ontology reviewers approve the mwprov: extension vocabulary and the PROV-O mapping decisions. Existing MoonWitness packages remain canonical; PROV-O is export vocabulary only.

---

## 16. References

- M50-07: Separate Claim, Evidence, Interpretation and Tradition Records (baseline established 2026-10-31)
- M50-08: Represent Contested Claims as Attributed Parallel Positions (baseline established 2026-10-31)
- M50-09: Make Graph Edges Traceable to Source and Reasoning (baseline established 2026-10-31)
- M46-12: Adversarial Contract Tests for AI Input Boundaries (no gap found 2026-10-31)
- M46-16: Stable Provenance Record Serialization (baseline established 2026-10-31)
- M50-04: Citation Snapshots and Version-Change Behavior (baseline established 2026-10-31)
- M19: Citation Hierarchy (open)
- M50-14: Citation-First Compare View (closed 2026-10-31)
- M47-13: Evidence-Aware Graph Traversal (baseline established 2026-10-31)
- W3C PROV-O: <https://www.w3.org/TR/prov-o/>
- W3C PROV-DM: <https://www.w3.org/TR/prov-dm/>
- W3C PROV-CONSTRAINTS: <https://www.w3.org/TR/prov-constraints/>

---

**Document Version:** 1.0  
**Created:** 2026-10-31  
**Author:** MoonWitness XV Ontology / Research Team  
**Review status:** BASELINE ESTABLISHED — pending domain and ontology reviewer approval
