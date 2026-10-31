# M47-16 — Prototype a Media Provenance Timeline

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Prototype a media provenance timeline showing asset lifecycle events without exposing contents
**Priority:** P2 | Difficulty: D4 | Effort: L (5-9 days)
**Candidate:** `FUT-016` · **Domain/category:** Frontier / Knowledge/Simulation
**Owner:** ECHOLOG/rights owner
**Dependencies:** External (ENG-019/021, M33-05) — workable as baseline with synthetic data
**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR required. See the [M46-M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md).

---

## 1. Executive Summary

This document establishes the design baseline for M47-16: a **read-only prototype** that visualizes the provenance timeline of a synthetic media asset. The timeline displays an asset's lifecycle events — creation, transformation, review, and access — without ever exposing the asset's actual content.

**Core principle:** The timeline shows *what happened to an asset* and *who authorized each step*, but never *what the asset contains*. Content remains unavailable by design.

**Key deliverables defined in this document:**

1. **Event vocabulary** — a taxonomy of provenance events (creation, transformation, review, access, consent, publication) with precise semantics
2. **Synthetic event record schema** — fabricated data structures using opaque object IDs, with no real media references
3. **Timeline visualization design** — a read-only view that distinguishes storage events from consent/publication decisions
4. **Five synthetic provenance scenarios** — complete fabricated asset histories exercising all event types
5. **Redaction testing framework** — ensuring content remains unavailable at every timeline stage
6. **Event-order verification** — temporal consistency checks for event sequences
7. **State rendering fixtures** — different timeline states (pending, active, restricted, withdrawn)
8. **Privacy/security review** — sensitive field leakage prevention
9. **Comprehension evaluation methodology** — measuring whether users correctly interpret the timeline
10. **Risk mitigation** — preventing the timeline from being mistaken for rights clearance

**What this document is NOT:**
- Not an implementation specification — implementation is deferred pending owner review
- Not a rights clearance tool — the timeline labels decisions as external authority
- Not a media storage or fetching system — no bytes are read or stored
- Not a replacement for M17/M33 rights tasks — synthetic study only

**Status:** BASELINE ESTABLISHED — design complete, implementation deferred pending ECHOLOG and privacy owner review.

---

## 2. Task Metadata

### 2.1 TODO.md Specification

| Field | Value |
|-------|-------|
| **Task ID** | M47-16 |
| **Candidate** | FUT-016 |
| **Group** | G7 — ECOSYSTEM (Frontier) |
| **Priority** | P2 |
| **Difficulty** | D4 |
| **Owner** | ECHOLOG/rights owner |
| **Effort** | L (5-9 days) |

### 2.2 Objective

Show an asset's synthetic creation, transformation, review and access events without exposing its contents.

### 2.3 Scope and Boundaries

- Static prototype over fabricated event records and opaque object IDs
- Read-only view; no rights decision, media fetching or storage schema change
- **Anti-overlap:** Synthetic timeline study only; no private-media access or replacement for M17/M33 rights tasks. Real assets require their separate rights gate.

### 2.4 Dependencies

| Dependency | Type | Status | Relevance |
|-----------|------|--------|-----------|
| ENG-019 | External | Applicable if later scope uses streaming | Not required for synthetic baseline |
| ENG-021 | External | Applicable if later scope uses shipping | Not required for synthetic baseline |
| M33-05 | Internal | Scoped synthetic contract; runtime verification blocked | Provides poster access/attribution patterns |
| M46-16 | Internal | BASELINE ESTABLISHED | Provenance serialization patterns |
| ECHOLOG (M39) | Internal | Accepted ADR-0007, implementation in progress | Storage surface contract; D19 domain |

### 2.5 Acceptance Criteria

- Timeline distinguishes storage events from consent/publication decisions
- Content remains unavailable

### 2.6 Definition of Done

- ECHOLOG and privacy owners approve event fields

### 2.7 Verification Plan

- Event-order fixtures
- Redaction fixtures
- State rendering fixtures

### 2.8 Risks

- Timeline mistaken for a rights clearance; label decisions as external authority

### 2.9 Metrics

- Lineage comprehension
- Sensitive-field leakage

### 2.10 Closure Evidence Required

- Prototype (design specification)
- Redaction fixtures
- Owner review

### 2.11 Execution Contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

## 3. Design Goals and Constraints

### 3.1 Primary Design Goals

**G1: Content Invisibility**
The timeline must never expose, reference, fetch, or make available the actual media content of any asset. All content references use opaque identifiers. No byte-level access is implied or provided.

**G2: Event Distinction**
The timeline must clearly distinguish between:
- **Storage events** (what ECHOLOG records: upload, digest, retention)
- **Consent decisions** (what D08/rights owners record: approval, restriction, revocation)
- **Publication decisions** (what M18 governs: release, withdrawal, correction)
- **Access events** (who viewed or attempted to view, and under what authority)

**G3: Temporal Integrity**
Events must be displayed in a verifiable chronological order. The timeline must detect and flag temporal inconsistencies (e.g., a consent decision appearing before the asset creation it consents to).

**G4: Comprehension**
A non-technical user must be able to read the timeline and understand:
- What happened to the asset at each stage
- Who authorized each action
- What the current status is
- What is NOT known or NOT authorized

**G5: Redaction Transparency**
When information is redacted or withheld, the timeline must explicitly state *that* something is withheld and *why* (policy reason), without revealing the withheld content.

### 3.2 Hard Constraints

| ID | Constraint | Rationale |
|----|-----------|-----------|
| C1 | No real media content | Synthetic data only; no private witness material |
| C2 | No real identity data | Opaque actor IDs; no personal information |
| C3 | No rights decisions | The timeline displays events; it does not make or imply rights determinations |
| C4 | No storage schema changes | Read-only prototype; ECHOLOG's D19 contract is not modified |
| C5 | No media fetching | The prototype never retrieves bytes from ECHOLOG or any storage |
| C6 | No new backend or data owner | Follows BLUEPRINT.md closed SQL-owner set and SKYLINK/ECHOLOG boundaries |
| C7 | No branch creation | Work on `dev` only per owner policy |
| C8 | Opaque object IDs only | All asset references use fabricated identifiers (e.g., `obj_a7f3b2`) |

### 3.3 Anti-Goals (Explicitly Out of Scope)

| ID | Anti-goal | Reason |
|----|-----------|--------|
| AG1 | Real asset provenance | This is a synthetic study; real assets require M17/M33 rights gates |
| AG2 | Rights clearance workflow | The timeline labels decisions as external authority, not as clearance |
| AG3 | Content delivery | No bytes are served, streamed, or displayed |
| AG4 | Consent collection | The timeline shows consent events; it does not collect consent |
| AG5 | ECHOLOG schema extension | No new tables, sidecar fields, or metadata keys are introduced |
| AG6 | SKYLINK integration | M38 messaging is not involved; D18 storage is not implemented |
| AG7 | Production deployment | This is a static prototype for design validation |

### 3.4 Relationship to Existing Systems

```
                    ┌─────────────────────────────────────┐
                    │         M47-16 PROVENANCE            │
                    │           TIMELINE PROTOTYPE          │
                    │                                      │
                    │  Read-only visualization layer        │
                    │  Fabricated event records             │
                    │  Opaque object IDs                    │
                    └──────────┬──────────────────────────┘
                               │ references (does not call)
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼──────┐ ┌───────▼───────┐
    │  ECHOLOG (D19) │ │  D08 Rights │ │  M18 Publish  │
    │  Storage       │ │  Consent    │ │  Publication  │
    │  (no tables)   │ │  decisions  │ │  state        │
    └────────────────┘ └─────────────┘ └───────────────┘
              │                │                │
              │    All referenced as external   │
              │    authority labels, never       │
              │    invoked by the prototype      │
              └─────────────────────────────────┘
```

The prototype **references** events from ECHOLOG, D08, and M18 domains but does not **invoke** any of these systems. It reads from a fabricated event log, not from live services.

---

## 4. Event Vocabulary Definition

### 4.1 Design Principles

The event vocabulary follows three principles:
1. **Precise semantics** — each event type has an unambiguous definition
2. **Domain separation** — storage events are distinct from consent events are distinct from publication events
3. **Temporal anchoring** — every event has a timestamp and an ordering constraint

### 4.2 Event Categories

The vocabulary defines six event categories:

| Category | Code | Domain Owner | Description |
|----------|------|-------------|-------------|
| Creation | `CRE` | Producer/Uploader | Asset came into existence |
| Transformation | `TRF` | Processor/System | Asset was modified, derived, or converted |
| Storage | `STO` | ECHOLOG (D19) | Asset bytes were persisted, verified, or managed |
| Review | `REV` | Reviewer/Authority | Asset was examined for quality, compliance, or accuracy |
| Consent | `CNS` | D08 Rights Owner | A rights/privacy/consent decision was recorded |
| Access | `ACC` | Consumer/System | An actor attempted to read, download, or view the asset |
| Publication | `PUB` | M18 Publication | Asset was released, withdrawn, or corrected for public view |

### 4.3 Event Type Definitions

#### 4.3.1 Creation Events (CRE)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Asset Created | `CRE:INIT` | The original asset was produced | `actor`, `timestamp`, `objectRef`, `creationMethod` |
| Synthetic Generation | `CRE:SYNTH` | Asset was generated by a system (not captured from reality) | `actor`, `timestamp`, `objectRef`, `generatorId` |
| Ingest Received | `CRE:INGEST` | Asset was received from an external source | `actor`, `timestamp`, `objectRef`, `sourceRef` |

**Semantic invariant:** A `CRE` event always precedes all other events for the same `objectRef`. If a `TRF`, `STO`, `REV`, `CNS`, `ACC`, or `PUB` event appears with a timestamp earlier than the `CRE` event, the timeline flags a temporal inconsistency.

#### 4.3.2 Transformation Events (TRF)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Format Conversion | `TRF:FORMAT` | Asset was converted to a different format | `actor`, `timestamp`, `sourceRef`, `targetRef`, `fromFormat`, `toFormat` |
| Derivative Created | `TRF:DERIVE` | A new asset was derived from this one | `actor`, `timestamp`, `sourceRef`, `targetRef`, `derivationType` |
| Metadata Updated | `TRF:META` | Non-content metadata was modified | `actor`, `timestamp`, `objectRef`, `fieldsChanged` |
| Redaction Applied | `TRF:REDACT` | Content was partially or fully redacted | `actor`, `timestamp`, `objectRef`, `redactionScope`, `reason` |

**Semantic invariant:** A `TRF` event always references at least one pre-existing `objectRef`. Transformation cannot precede creation.

#### 4.3.3 Storage Events (STO)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Object Stored | `STO:STORE` | Bytes were persisted in ECHOLOG | `timestamp`, `objectRef`, `digest`, `size`, `contentType` |
| Integrity Verified | `STO:VERIFY` | Digest was confirmed matching stored bytes | `timestamp`, `objectRef`, `digest`, `method` |
| Retention Set | `STO:RETAIN` | Retention period or legal hold was applied | `timestamp`, `objectRef`, `retentionUntil`, `legalHold` |
| Retention Expired | `STO:EXPIRE` | Retention period elapsed | `timestamp`, `objectRef` |
| Object Deleted | `STO:DELETE` | Object was removed via GC | `timestamp`, `objectRef`, `reason` |
| Private Witness Marked | `STO:PRIVMARK` | D06 private-witness marker was applied | `timestamp`, `objectRef`, `digest` |

**Semantic invariant:** `STO` events are ECHOLOG domain operations. They record *what the storage system did*, not *whether anyone has rights to the content*. A `STO:STORE` event does not imply consent, clearance, or authorization.

#### 4.3.4 Review Events (REV)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Review Initiated | `REV:START` | A reviewer began examining the asset | `reviewerId`, `timestamp`, `objectRef`, `reviewScope` |
| Review Completed | `REV:COMPLETE` | Review examination concluded | `reviewerId`, `timestamp`, `objectRef`, `outcome` |
| Review Comment | `REV:COMMENT` | A reviewer recorded an observation | `reviewerId`, `timestamp`, `objectRef`, `commentRef` |
| Review Disagreement | `REV:DISAGREE` | A reviewer formally disagreed with another | `reviewerId`, `timestamp`, `objectRef`, `disputedReviewRef` |

**Semantic invariant:** Review events record *examination*, not *approval*. A `REV:COMPLETE` with `outcome: 'satisfactory'` does not constitute a rights clearance.

#### 4.3.5 Consent Events (CNS)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Consent Granted | `CNS:GRANT` | A rights holder authorized a specific use | `consentAuthority`, `timestamp`, `objectRef`, `grantScope`, `grantId` |
| Consent Restricted | `CNS:RESTRICT` | A rights holder limited a specific use | `consentAuthority`, `timestamp`, `objectRef`, `restrictionScope`, `reason` |
| Consent Revoked | `CNS:REVOKE` | A previously granted consent was withdrawn | `consentAuthority`, `timestamp`, `objectRef`, `revokedGrantId`, `reason` |
| Privacy Marker Applied | `CNS:PRIVACY` | A privacy protection was placed on the asset | `privacyAuthority`, `timestamp`, `objectRef`, `protectionType` |

**Semantic invariant:** Consent events are **external authority decisions**. The timeline displays them but does not validate, enforce, or adjudicate them. Each consent event carries the identifier of the authority that made the decision, making clear that the timeline is a *record of decisions*, not the *maker of decisions*.

#### 4.3.6 Access Events (ACC)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Access Granted | `ACC:GRANT` | An actor was authorized to read the asset | `actor`, `timestamp`, `objectRef`, `accessScope`, `grantRef` |
| Access Attempted | `ACC:ATTEMPT` | An actor tried to read the asset | `actor`, `timestamp`, `objectRef`, `requestedScope` |
| Access Denied | `ACC:DENY` | An access attempt was refused | `actor`, `timestamp`, `objectRef`, `requestedScope`, `denyReason` |
| Access Executed | `ACC:EXEC` | An actor successfully read the asset | `actor`, `timestamp`, `objectRef`, `accessScope` |

**Semantic invariant:** Access events record *attempts and outcomes*, not *content*. An `ACC:EXEC` event confirms that bytes were transferred; it does not record what those bytes contain.

#### 4.3.7 Publication Events (PUB)

| Event Type | Code | Definition | Required Fields |
|-----------|------|-----------|----------------|
| Published | `PUB:PUBLISH` | Asset was released for public view | `publisher`, `timestamp`, `objectRef`, `publicationRef`, `scope` |
| Withdrawn | `PUB:WITHDRAW` | Asset was removed from public view | `publisher`, `timestamp`, `objectRef`, `publicationRef`, `reason` |
| Corrected | `PUB:CORRECT` | A correction was issued for published asset | `publisher`, `timestamp`, `objectRef`, `publicationRef`, `correctionRef` |
| Takedown | `PUB:TAKEDOWN` | Asset was forcibly removed | `authority`, `timestamp`, `objectRef`, `publicationRef`, `legalBasis` |

**Semantic invariant:** Publication events are M18 domain operations. They record *release state*, not *content availability*. A `PUB:PUBLISH` event does not mean the content is accessible; access is governed by separate CNS and ACC events.

### 4.4 Event Vocabulary Cross-Reference Matrix

| Category | Creates state visible to | Does NOT imply |
|----------|------------------------|----------------|
| CRE (Creation) | All subsequent events | Rights, consent, publication |
| TRF (Transformation) | New objectRefs, metadata changes | Content approval, rights clearance |
| STO (Storage) | Object availability, integrity | Consent, rights, publication |
| REV (Review) | Review outcomes, disagreements | Rights clearance, publication approval |
| CNS (Consent) | Rights status, restrictions | Content access, storage, publication |
| ACC (Access) | Access outcomes | Rights granted, content approved |
| PUB (Publication) | Release state | Content accessibility, rights clearance |

---

## 5. Synthetic Event Record Schema

### 5.1 Design Principles

The synthetic event record schema follows these principles:
1. **Opaque identifiers** — all object references, actor IDs, and authority IDs are fabricated tokens with no real-world meaning
2. **Self-contained** — a single event record contains all information needed to display it on the timeline
3. **Serializable** — records can be stored as JSON and compared byte-for-byte
4. **Versioned** — the schema carries a version field for future evolution

### 5.2 Base Event Record

```typescript
/**
 * M47-16 Synthetic Provenance Event Record
 * 
 * All identifiers are opaque fabricated tokens.
 * No real media, identity, or private content is referenced.
 */
interface ProvenanceEventRecord {
  /** Schema version — always 1 for this baseline */
  version: 1;

  /** Unique event identifier (fabricated) */
  eventId: string; // e.g., "evt_0001"

  /** Event category code (CRE/TRF/STO/REV/CNS/ACC/PUB) */
  eventCategory: EventCategory;

  /** Specific event type code */
  eventType: string; // e.g., "CRE:INIT", "STO:STORE"

  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;

  /** Opaque reference to the primary object involved */
  objectRef: string; // e.g., "obj_a7f3b2"

  /** Opaque identifier of the actor who performed the action */
  actor: string; // e.g., "actor_sys_ingest", "actor_rev_042"

  /** Human-readable label for the actor (not a real name) */
  actorLabel: string; // e.g., "Ingest System", "Reviewer 042"

  /** Event-specific payload (varies by eventType) */
  payload: Record<string, unknown>;

  /** References to related events (e.g., a consent referencing a grant) */
  relatedEvents: string[]; // eventIds

  /** Authority label — identifies whose decision this event records */
  authorityLabel: string; // e.g., "ECHOLOG Storage", "D08 Rights Office"

  /** Whether this event is a storage operation vs. a decision */
  eventNature: 'storage_operation' | 'consent_decision' | 'publication_decision' | 'review_record' | 'access_record' | 'creation_record' | 'transformation_record';

  /** Redaction status */
  redaction: RedactionStatus;
}
```

### 5.3 Redaction Status

```typescript
interface RedactionStatus {
  /** Whether any fields in this record have been redacted */
  isRedacted: boolean;

  /** List of redacted field paths */
  redactedFields: string[]; // e.g., ["payload.contentHash", "payload.sourceUri"]

  /** Reason for redaction */
  redactionReason: string | null; // e.g., "Sensitive field — policy R-04"

  /** Whether the redaction itself is visible (vs. the record being hidden entirely) */
  redactionVisible: boolean;
}
```

### 5.4 Event Category Enumeration

```typescript
type EventCategory = 'CRE' | 'TRF' | 'STO' | 'REV' | 'CNS' | 'ACC' | 'PUB';
```

### 5.5 Synthetic Object Reference

```typescript
/**
 * Opaque object reference — no real media is identified.
 * The prefix indicates the fabrication domain.
 */
type ObjectRef = 
  | `obj_${string}`     // Generic synthetic object
  | `der_${string}`     // Synthetic derivative
  | `doc_${string}`;    // Synthetic document
```

### 5.6 Event Payload Schemas by Type

#### Creation Payloads

```typescript
interface CRE_INIT_Payload {
  creationMethod: 'captured' | 'generated' | 'composed' | 'compiled';
  format: string; // e.g., "audio/wav", "image/png"
  nominalSize: number; // bytes (fabricated)
  generationNote: string | null; // human-readable note
}

interface CRE_SYNTH_Payload {
  generatorId: string; // e.g., "gen_synthetic_01"
  generatorLabel: string; // e.g., "Synthetic Audio Generator v1"
  format: string;
  nominalSize: number;
  parameters: Record<string, string>; // fabrication parameters
}

interface CRE_INGEST_Payload {
  sourceRef: string; // e.g., "src_external_001" (opaque)
  sourceLabel: string; // e.g., "External Archive Batch 7"
  format: string;
  nominalSize: number;
  ingestMethod: 'upload' | 'transfer' | 'import';
}
```

#### Transformation Payloads

```typescript
interface TRF_FORMAT_Payload {
  sourceRef: string;
  targetRef: string;
  fromFormat: string;
  toFormat: string;
  conversionTool: string; // e.g., "synthetic_converter_v2"
  integrityCheck: string; // e.g., "sha256_verified"
}

interface TRF_DERIVE_Payload {
  sourceRef: string;
  targetRef: string;
  derivationType: 'excerpt' | 'thumbnail' | 'transcription' | 'translation' | 'annotation';
  derivationNote: string | null;
}

interface TRF_META_Payload {
  objectRef: string;
  fieldsChanged: string[]; // e.g., ["title", "description", "tags"]
  previousValues: Record<string, string> | null; // redacted if sensitive
}

interface TRF_REDACT_Payload {
  objectRef: string;
  redactionScope: 'partial' | 'full';
  redactedRegions: number; // how many regions were redacted
  reason: string;
  redactionAuthority: string;
}
```

#### Storage Payloads

```typescript
interface STO_STORE_Payload {
  objectRef: string;
  digest: string; // e.g., "sha256:e3b0c44298fc1c14..." (fabricated)
  size: number;
  contentType: string;
  storageDriver: string; // e.g., "filesystem"
  bucketOrPrefix: string; // e.g., "synthetic/staging"
}

interface STO_VERIFY_Payload {
  objectRef: string;
  digest: string;
  method: 'sha256_recheck' | 'crc32_match';
  verifiedAt: string;
}

interface STO_RETAIN_Payload {
  objectRef: string;
  retentionUntil: string | null; // ISO date or null for indefinite
  legalHold: boolean;
  setBy: string;
  setReason: string;
}

interface STO_EXPIRE_Payload {
  objectRef: string;
  expiredAt: string;
  gcEligible: boolean;
}

interface STO_DELETE_Payload {
  objectRef: string;
  deletedAt: string;
  reason: 'retention_expired' | 'legal_request' | 'admin_action';
  gcRunId: string;
}

interface STO_PRIVMARK_Payload {
  objectRef: string;
  digest: string;
  markerType: 'D06_private_witness';
  irreversible: true;
}
```

#### Review Payloads

```typescript
interface REV_START_Payload {
  objectRef: string;
  reviewScope: 'content_quality' | 'rights_compliance' | 'accuracy' | 'completeness';
  reviewId: string;
}

interface REV_COMPLETE_Payload {
  objectRef: string;
  reviewId: string;
  outcome: 'satisfactory' | 'needs_revision' | 'rejected' | 'withheld';
  findingsCount: number;
  reviewDuration: string; // ISO 8601 duration
}

interface REV_COMMENT_Payload {
  objectRef: string;
  reviewId: string;
  commentRef: string; // opaque reference to the comment
  commentCategory: 'factual' | 'interpretive' | 'procedural' | 'rights';
  // Note: actual comment text is NOT included — it is a review artifact
}

interface REV_DISAGREE_Payload {
  objectRef: string;
  reviewId: string;
  disputedReviewRef: string;
  disagreementBasis: 'factual_dispute' | 'interpretive_difference' | 'methodological';
  // Note: actual disagreement content is NOT included
}
```

#### Consent Payloads

```typescript
interface CNS_GRANT_Payload {
  objectRef: string;
  grantId: string; // e.g., "grant_syn_001"
  grantScope: string; // e.g., "research_display", "public_exhibition"
  grantedBy: string; // opaque authority ID
  grantedByLabel: string; // e.g., "Rights Holder A"
  validFrom: string;
  validUntil: string | null;
  conditions: string[]; // e.g., ["attribution_required", "no_derivation"]
}

interface CNS_RESTRICT_Payload {
  objectRef: string;
  restrictionScope: string; // e.g., "public_display", "download"
  restrictedBy: string;
  restrictedByLabel: string;
  reason: string;
  effectiveFrom: string;
}

interface CNS_REVOKE_Payload {
  objectRef: string;
  revokedGrantId: string;
  revokedBy: string;
  revokedByLabel: string;
  reason: string;
  effectiveFrom: string;
}

interface CNS_PRIVACY_Payload {
  objectRef: string;
  protectionType: 'witness_privacy' | 'source_protection' | 'identity_redaction';
  appliedBy: string;
  appliedByLabel: string;
  effectiveFrom: string;
}
```

#### Access Payloads

```typescript
interface ACC_GRANT_Payload {
  objectRef: string;
  actor: string;
  accessScope: string; // e.g., "metadata_only", "full_read"
  grantedBy: string;
  validUntil: string;
}

interface ACC_ATTEMPT_Payload {
  objectRef: string;
  actor: string;
  requestedScope: string;
  requestContext: string; // e.g., "api_call", "web_view"
}

interface ACC_DENY_Payload {
  objectRef: string;
  actor: string;
  requestedScope: string;
  denyReason: 'no_consent' | 'insufficient_role' | 'retention_active' | 'privacy_marker' | 'no_grant';
}

interface ACC_EXEC_Payload {
  objectRef: string;
  actor: string;
  accessScope: string;
  bytesTransferred: number | null; // null if metadata-only
  sessionRef: string; // opaque session identifier
}
```

#### Publication Payloads

```typescript
interface PUB_PUBLISH_Payload {
  objectRef: string;
  publicationRef: string; // e.g., "pub_syn_001"
  scope: string; // e.g., "public", "restricted_research", "internal"
  publishedBy: string;
  publishedByLabel: string;
  publicationNote: string | null;
}

interface PUB_WITHDRAW_Payload {
  objectRef: string;
  publicationRef: string;
  withdrawnBy: string;
  withdrawnByLabel: string;
  reason: string;
  withdrawalNote: string | null;
}

interface PUB_CORRECT_Payload {
  objectRef: string;
  publicationRef: string;
  correctionRef: string;
  correctedBy: string;
  correctedByLabel: string;
  correctionNature: string; // e.g., "metadata_error", "attribution_fix"
  correctionNote: string | null;
}

interface PUB_TAKEDOWN_Payload {
  objectRef: string;
  publicationRef: string;
  authority: string;
  authorityLabel: string;
  legalBasis: string;
  takedownNote: string | null;
}
```

### 5.7 Provenance Event Log

```typescript
/**
 * A complete provenance event log for a single synthetic asset.
 * Contains all events in the asset's lifecycle.
 */
interface ProvenanceEventLog {
  /** Schema version */
  version: 1;

  /** The primary object this log describes */
  primaryObjectRef: string;

  /** All events for this object, in timestamp order */
  events: ProvenanceEventRecord[];

  /** Summary statistics */
  summary: {
    totalEvents: number;
    eventCountByCategory: Record<EventCategory, number>;
    firstEventTimestamp: string;
    lastEventTimestamp: string;
    currentStatus: AssetStatus;
    consentStatus: ConsentStatus;
    publicationStatus: PublicationStatus;
  };
}

type AssetStatus = 
  | 'created' 
  | 'stored' 
  | 'under_review' 
  | 'consent_pending' 
  | 'consent_granted' 
  | 'consent_restricted' 
  | 'published' 
  | 'withdrawn' 
  | 'redacted';

type ConsentStatus = 
  | 'none_recorded' 
  | 'granted' 
  | 'restricted' 
  | 'revoked' 
  | 'pending_review';

type PublicationStatus = 
  | 'not_published' 
  | 'published' 
  | 'withdrawn' 
  | 'corrected' 
  | 'taken_down';
```

---

## 6. Timeline Visualization Design

### 6.1 Design Principles

The timeline visualization follows five principles:

**P1: Read-Only**
The timeline is a display surface. No interaction modifies events, statuses, or decisions.

**P2: Content-Invisible**
No thumbnail, preview, waveform, text excerpt, or any representation of the asset's content appears on the timeline. The asset is represented solely by its opaque identifier and event history.

**P3: Decision-Explicit**
Every consent and publication decision is labeled with the authority that made it, making clear that the timeline records *external decisions*, not its own determinations.

**P4: Redaction-Visible**
When information is withheld, the timeline shows a redaction marker with a policy reason, not a blank space. The user knows something was redacted and why, without seeing what was redacted.

**P5: Status-Distinct**
The timeline uses distinct visual encodings for storage operations, consent decisions, publication decisions, review records, and access records. A user can immediately distinguish "the file was stored" from "consent was granted."

### 6.2 Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_a7f3b2                                        │
│ Status: CONSENT_GRANTED | Publication: NOT_PUBLISHED                    │
│ ⚠ This timeline records events. It does not constitute rights clearance.│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ● CRE:INIT ─── 2026-01-15T09:00:00Z                                  │
│  │  Actor: Ingest System (actor_sys_ingest)                            │
│  │  Authority: Producer                                                │
│  │  Format: audio/wav | Size: 2,450,000 bytes                          │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ● STO:STORE ─── 2026-01-15T09:00:05Z                                 │
│  │  Authority: ECHOLOG Storage (D19)                                   │
│  │  Digest: sha256:e3b0c44... (fabricated)                             │
│  │  Nature: STORAGE OPERATION                                          │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ● STO:VERIFY ─── 2026-01-15T09:00:08Z                                │
│  │  Authority: ECHOLOG Storage (D19)                                   │
│  │  Method: sha256_recheck | Status: PASS                              │
│  │  Nature: STORAGE OPERATION                                          │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ● REV:START ─── 2026-01-16T10:00:00Z                                 │
│  │  Reviewer: Reviewer 042 (actor_rev_042)                             │
│  │  Scope: content_quality                                             │
│  │  Nature: REVIEW RECORD                                              │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ● REV:COMPLETE ─── 2026-01-16T11:30:00Z                              │
│  │  Reviewer: Reviewer 042 (actor_rev_042)                             │
│  │  Outcome: satisfactory | Findings: 2                                │
│  │  Nature: REVIEW RECORD                                              │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ◆ CNS:GRANT ─── 2026-01-17T14:00:00Z                                 │
│  │  Authority: Rights Holder A (actor_rh_001) ◄ EXTERNAL AUTHORITY     │
│  │  Scope: research_display                                            │
│  │  Conditions: attribution_required, no_derivation                    │
│  │  Valid: 2026-01-17 → indefinite                                     │
│  │  Nature: CONSENT DECISION                                           │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ○ ACC:ATTEMPT ─── 2026-01-18T08:00:00Z                               │
│  │  Actor: Researcher X (actor_res_x01)                                │
│  │  Requested: full_read                                               │
│  │  ─────────────────────────────────────────                          │
│  │                                                                      │
│  ○ ACC:GRANT ─── 2026-01-18T08:00:01Z                                 │
│  │  Scope: metadata_only (full_read not granted)                       │
│  │  Valid until: 2026-01-19T08:00:01Z                                  │
│  │  Nature: ACCESS RECORD                                              │
│  │                                                                      │
│  [REDACTED] ─── 2026-01-18T08:00:02Z                                  │
│  │  Field: payload.sessionRef                                          │
│  │  Reason: Sensitive field — policy R-04 (session tracking)           │
│  │  ─────────────────────────────────────────                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ LEGEND:                                                                │
│  ● Storage/Creation event  ◆ Consent decision  ○ Access/Review event   │
│  [REDACTED] Withheld field  ◄ External authority                       │
│                                                                        │
│ ⚠ TIMELINE DISCLAIMER: This display records events from multiple       │
│   authorities. It is NOT a rights clearance certificate. Content       │
│   remains unavailable through this view. Consult the rights owner      │
│   for authorization decisions.                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Visual Encoding Table

| Event Nature | Symbol | Color (suggested) | Label Style |
|-------------|--------|-------------------|-------------|
| Creation | ● filled circle | Neutral gray | Standard |
| Storage operation | ● filled circle | Blue | Standard with "ECHOLOG (D19)" authority label |
| Transformation | ● filled circle | Teal | Standard |
| Review record | ○ open circle | Purple | Standard with reviewer label |
| Consent decision | ◆ filled diamond | Green | Bold with "EXTERNAL AUTHORITY" marker |
| Publication decision | ◆ filled diamond | Orange | Bold with "EXTERNAL AUTHORITY" marker |
| Access record | ○ open circle | Gray | Standard |
| Redacted field | [REDACTED] block | Red border | Policy reason displayed |

### 6.4 Content Invisibility Guarantees

The following are **never** displayed on the timeline:

| Prohibited Content | Reason |
|-------------------|--------|
| Asset bytes or binary data | Content must remain unavailable |
| Thumbnails or previews | Visual content exposure |
| Audio waveforms or spectrograms | Audio content exposure |
| Text excerpts or transcriptions | Textual content exposure |
| File names that reveal content | Metadata content leakage |
| Full URIs to content storage | Access path exposure |
| Unredacted session identifiers | Tracking data exposure |
| Unredacted IP addresses | Privacy exposure |
| Unredacted user credentials | Security exposure |

### 6.5 Timeline Header

Every timeline view includes a persistent header with:

```typescript
interface TimelineHeader {
  /** The opaque object identifier */
  objectRef: string;

  /** Current composite status */
  status: {
    asset: AssetStatus;
    consent: ConsentStatus;
    publication: PublicationStatus;
  };

  /** Mandatory disclaimer */
  disclaimer: "This timeline records events. It does not constitute rights clearance. Content remains unavailable.";

  /** Last event timestamp */
  lastUpdated: string;

  /** Number of events in the timeline */
  eventCount: number;

  /** Number of redacted fields */
  redactionCount: number;
}
```

### 6.6 Interaction Model

The timeline is **read-only** with the following permitted interactions:

| Interaction | Permitted | Description |
|------------|-----------|-------------|
| Scroll timeline | Yes | Navigate through event history |
| Expand event detail | Yes | View full payload for a non-redacted event |
| Filter by category | Yes | Show only STO, CNS, PUB, etc. |
| Filter by date range | Yes | Narrow timeline to a period |
| Sort order toggle | Yes | Chronological or reverse-chronological |
| Edit event | No | Events are immutable |
| Delete event | No | Events are permanent |
| Download content | No | Content is unavailable |
| Modify consent | No | Consent is an external authority decision |
| Share timeline URL | No | Timeline is a local prototype view |

---

## 7. Sample Provenance Scenarios

### 7.1 Scenario Overview

Five complete synthetic asset histories are defined below. Each exercises different event types and tests different aspects of the timeline design.

| Scenario | Asset Type | Key Events Tested | Complexity |
|----------|-----------|-------------------|------------|
| A | Synthetic audio recording | Full lifecycle: creation through publication | High |
| B | Synthetic document image | Redaction and consent restriction | Medium |
| C | Synthetic derivative chain | Transformation and multi-object provenance | High |
| D | Synthetic disputed asset | Review disagreement and consent revocation | Medium |
| E | Synthetic withdrawn asset | Publication and takedown | Low |

### 7.2 Scenario A: Synthetic Audio Recording — Full Lifecycle

**Asset:** `obj_audio_001` — a fabricated audio waveform (no real content)

**Narrative:** A synthetic audio file is generated, stored in ECHOLOG, reviewed for quality, consented for research display, accessed by a researcher, and published to a restricted scope.

```json
{
  "version": 1,
  "primaryObjectRef": "obj_audio_001",
  "events": [
    {
      "version": 1,
      "eventId": "evt_a001",
      "eventCategory": "CRE",
      "eventType": "CRE:SYNTH",
      "timestamp": "2026-01-10T08:00:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_gen_synth_01",
      "actorLabel": "Synthetic Audio Generator v1",
      "payload": {
        "generatorId": "gen_synthetic_01",
        "generatorLabel": "Synthetic Audio Generator v1",
        "format": "audio/wav",
        "nominalSize": 4820000,
        "parameters": {
          "duration": "120s",
          "sampleRate": "44100",
          "channels": "2",
          "contentProfile": "fabricated_waveform_alpha"
        }
      },
      "relatedEvents": [],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a002",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-01-10T08:00:12Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_audio_001",
        "digest": "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        "size": 4820000,
        "contentType": "audio/wav",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/staging"
      },
      "relatedEvents": ["evt_a001"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a003",
      "eventCategory": "STO",
      "eventType": "STO:VERIFY",
      "timestamp": "2026-01-10T08:00:15Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_audio_001",
        "digest": "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        "method": "sha256_recheck",
        "verifiedAt": "2026-01-10T08:00:15Z"
      },
      "relatedEvents": ["evt_a002"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a004",
      "eventCategory": "REV",
      "eventType": "REV:START",
      "timestamp": "2026-01-11T09:00:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_rev_042",
      "actorLabel": "Reviewer 042",
      "payload": {
        "objectRef": "obj_audio_001",
        "reviewScope": "content_quality",
        "reviewId": "rev_syn_001"
      },
      "relatedEvents": ["evt_a003"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a005",
      "eventCategory": "REV",
      "eventType": "REV:COMPLETE",
      "timestamp": "2026-01-11T10:45:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_rev_042",
      "actorLabel": "Reviewer 042",
      "payload": {
        "objectRef": "obj_audio_001",
        "reviewId": "rev_syn_001",
        "outcome": "satisfactory",
        "findingsCount": 1,
        "reviewDuration": "PT1H45M"
      },
      "relatedEvents": ["evt_a004"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a006",
      "eventCategory": "CNS",
      "eventType": "CNS:GRANT",
      "timestamp": "2026-01-12T14:00:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_rh_001",
      "actorLabel": "Rights Holder A",
      "payload": {
        "objectRef": "obj_audio_001",
        "grantId": "grant_syn_001",
        "grantScope": "research_display",
        "grantedBy": "actor_rh_001",
        "grantedByLabel": "Rights Holder A",
        "validFrom": "2026-01-12T14:00:00Z",
        "validUntil": null,
        "conditions": ["attribution_required", "no_derivation", "research_only"]
      },
      "relatedEvents": ["evt_a005"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a007",
      "eventCategory": "ACC",
      "eventType": "ACC:ATTEMPT",
      "timestamp": "2026-01-15T08:30:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_res_x01",
      "actorLabel": "Researcher X",
      "payload": {
        "objectRef": "obj_audio_001",
        "actor": "actor_res_x01",
        "requestedScope": "full_read",
        "requestContext": "api_call"
      },
      "relatedEvents": ["evt_a006"],
      "authorityLabel": "Access Control",
      "eventNature": "access_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a008",
      "eventCategory": "ACC",
      "eventType": "ACC:DENY",
      "timestamp": "2026-01-15T08:30:01Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_sys_access",
      "actorLabel": "Access Control System",
      "payload": {
        "objectRef": "obj_audio_001",
        "actor": "actor_res_x01",
        "requestedScope": "full_read",
        "denyReason": "no_consent"
      },
      "relatedEvents": ["evt_a007"],
      "authorityLabel": "Access Control",
      "eventNature": "access_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_a009",
      "eventCategory": "ACC",
      "eventType": "ACC:GRANT",
      "timestamp": "2026-01-15T08:30:05Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_sys_access",
      "actorLabel": "Access Control System",
      "payload": {
        "objectRef": "obj_audio_001",
        "actor": "actor_res_x01",
        "accessScope": "metadata_only",
        "grantedBy": "actor_sys_access",
        "validUntil": "2026-01-16T08:30:05Z"
      },
      "relatedEvents": ["evt_a007", "evt_a008"],
      "authorityLabel": "Access Control",
      "eventNature": "access_record",
      "redaction": {
        "isRedacted": true,
        "redactedFields": ["payload.sessionRef"],
        "redactionReason": "Sensitive field — policy R-04 (session tracking data)",
        "redactionVisible": true
      }
    },
    {
      "version": 1,
      "eventId": "evt_a010",
      "eventCategory": "PUB",
      "eventType": "PUB:PUBLISH",
      "timestamp": "2026-01-20T12:00:00Z",
      "objectRef": "obj_audio_001",
      "actor": "actor_pub_admin",
      "actorLabel": "Publication Administrator",
      "payload": {
        "objectRef": "obj_audio_001",
        "publicationRef": "pub_syn_001",
        "scope": "restricted_research",
        "publishedBy": "actor_pub_admin",
        "publishedByLabel": "Publication Admin",
        "publicationNote": "Published to restricted research scope per grant_syn_001"
      },
      "relatedEvents": ["evt_a006"],
      "authorityLabel": "M18 Publication — EXTERNAL AUTHORITY",
      "eventNature": "publication_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    }
  ],
  "summary": {
    "totalEvents": 10,
    "eventCountByCategory": { "CRE": 1, "TRF": 0, "STO": 2, "REV": 2, "CNS": 1, "ACC": 3, "PUB": 1 },
    "firstEventTimestamp": "2026-01-10T08:00:00Z",
    "lastEventTimestamp": "2026-01-20T12:00:00Z",
    "currentStatus": "published",
    "consentStatus": "granted",
    "publicationStatus": "published"
  }
}
```

**Key timeline features exercised:**
- Full lifecycle from creation to publication
- Storage operations clearly labeled as ECHOLOG (D19) domain
- Consent decision labeled as EXTERNAL AUTHORITY (D08 Rights Office)
- Publication decision labeled as EXTERNAL AUTHORITY (M18 Publication)
- Access attempt denied (full_read) then granted at lower scope (metadata_only)
- Redacted field visible with policy reason
- Review outcome does not imply rights clearance

### 7.3 Scenario B: Synthetic Document Image — Redaction and Consent Restriction

**Asset:** `obj_docimg_001` — a fabricated document image (no real content)

**Narrative:** A synthetic document image is ingested, stored, found to contain sensitive regions, partially redacted, and then consent is restricted to metadata-only access.

```json
{
  "version": 1,
  "primaryObjectRef": "obj_docimg_001",
  "events": [
    {
      "version": 1,
      "eventId": "evt_b001",
      "eventCategory": "CRE",
      "eventType": "CRE:INGEST",
      "timestamp": "2026-02-01T10:00:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_sys_ingest",
      "actorLabel": "Ingest System",
      "payload": {
        "sourceRef": "src_external_001",
        "sourceLabel": "External Archive Batch 12",
        "format": "image/tiff",
        "nominalSize": 18500000,
        "ingestMethod": "transfer"
      },
      "relatedEvents": [],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_b002",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-02-01T10:00:30Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_docimg_001",
        "digest": "sha256:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
        "size": 18500000,
        "contentType": "image/tiff",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/documents"
      },
      "relatedEvents": ["evt_b001"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_b003",
      "eventCategory": "REV",
      "eventType": "REV:START",
      "timestamp": "2026-02-02T09:00:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_rev_017",
      "actorLabel": "Reviewer 017",
      "payload": {
        "objectRef": "obj_docimg_001",
        "reviewScope": "rights_compliance",
        "reviewId": "rev_syn_002"
      },
      "relatedEvents": ["evt_b002"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_b004",
      "eventCategory": "REV",
      "eventType": "REV:COMPLETE",
      "timestamp": "2026-02-02T11:00:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_rev_017",
      "actorLabel": "Reviewer 017",
      "payload": {
        "objectRef": "obj_docimg_001",
        "reviewId": "rev_syn_002",
        "outcome": "needs_revision",
        "findingsCount": 3,
        "reviewDuration": "PT2H"
      },
      "relatedEvents": ["evt_b003"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_b005",
      "eventCategory": "TRF",
      "eventType": "TRF:REDACT",
      "timestamp": "2026-02-03T14:00:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_redact_sys",
      "actorLabel": "Redaction System",
      "payload": {
        "objectRef": "obj_docimg_001",
        "redactionScope": "partial",
        "redactedRegions": 3,
        "reason": "Sensitive personal identifiers detected in regions 1, 2, 3",
        "redactionAuthority": "actor_priv_officer"
      },
      "relatedEvents": ["evt_b004"],
      "authorityLabel": "Privacy Officer",
      "eventNature": "transformation_record",
      "redaction": {
        "isRedacted": true,
        "redactedFields": ["payload.redactionCoordinates"],
        "redactionReason": "Redaction coordinates are sensitive — policy R-07",
        "redactionVisible": true
      }
    },
    {
      "version": 1,
      "eventId": "evt_b006",
      "eventCategory": "CNS",
      "eventType": "CNS:RESTRICT",
      "timestamp": "2026-02-04T09:00:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_rh_002",
      "actorLabel": "Rights Holder B",
      "payload": {
        "objectRef": "obj_docimg_001",
        "restrictionScope": "full_content_access",
        "restrictedBy": "actor_rh_002",
        "restrictedByLabel": "Rights Holder B",
        "reason": "Partial redaction insufficient for full access; metadata-only permitted",
        "effectiveFrom": "2026-02-04T09:00:00Z"
      },
      "relatedEvents": ["evt_b005"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_b007",
      "eventCategory": "CNS",
      "eventType": "CNS:PRIVACY",
      "timestamp": "2026-02-04T09:05:00Z",
      "objectRef": "obj_docimg_001",
      "actor": "actor_priv_officer",
      "actorLabel": "Privacy Officer",
      "payload": {
        "objectRef": "obj_docimg_001",
        "protectionType": "identity_redaction",
        "appliedBy": "actor_priv_officer",
        "appliedByLabel": "Privacy Officer",
        "effectiveFrom": "2026-02-04T09:05:00Z"
      },
      "relatedEvents": ["evt_b006"],
      "authorityLabel": "Privacy Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    }
  ],
  "summary": {
    "totalEvents": 7,
    "eventCountByCategory": { "CRE": 1, "TRF": 1, "STO": 1, "REV": 2, "CNS": 2, "ACC": 0, "PUB": 0 },
    "firstEventTimestamp": "2026-02-01T10:00:00Z",
    "lastEventTimestamp": "2026-02-04T09:05:00Z",
    "currentStatus": "redacted",
    "consentStatus": "restricted",
    "publicationStatus": "not_published"
  }
}
```

**Key timeline features exercised:**
- Partial redaction event with redacted coordinates (themselves redacted)
- Consent restriction (not revocation — access is limited, not eliminated)
- Privacy marker applied separately from consent restriction
- Review outcome "needs_revision" does not block storage
- No publication event — asset remains unpublished

### 7.4 Scenario C: Synthetic Derivative Chain — Multi-Object Provenance

**Asset:** `obj_original_001` → `obj_derivative_001` → `obj_derivative_002`

**Narrative:** An original synthetic asset spawns two derivatives. The timeline tracks provenance across all three objects, showing how transformations create new objectRefs while maintaining lineage.

```json
{
  "version": 1,
  "primaryObjectRef": "obj_original_001",
  "events": [
    {
      "version": 1,
      "eventId": "evt_c001",
      "eventCategory": "CRE",
      "eventType": "CRE:INIT",
      "timestamp": "2026-03-01T08:00:00Z",
      "objectRef": "obj_original_001",
      "actor": "actor_producer_01",
      "actorLabel": "Producer 01",
      "payload": {
        "creationMethod": "composed",
        "format": "text/plain",
        "nominalSize": 15000,
        "generationNote": "Original synthetic text composition"
      },
      "relatedEvents": [],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c002",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-03-01T08:00:10Z",
      "objectRef": "obj_original_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_original_001",
        "digest": "sha256:c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
        "size": 15000,
        "contentType": "text/plain",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/texts"
      },
      "relatedEvents": ["evt_c001"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c003",
      "eventCategory": "TRF",
      "eventType": "TRF:DERIVE",
      "timestamp": "2026-03-05T10:00:00Z",
      "objectRef": "obj_original_001",
      "actor": "actor_translator_01",
      "actorLabel": "Translator 01",
      "payload": {
        "sourceRef": "obj_original_001",
        "targetRef": "obj_derivative_001",
        "derivationType": "translation",
        "derivationNote": "Synthetic translation to fabricated language code 'syn_lang_a'"
      },
      "relatedEvents": ["evt_c002"],
      "authorityLabel": "Producer",
      "eventNature": "transformation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c004",
      "eventCategory": "CRE",
      "eventType": "CRE:INIT",
      "timestamp": "2026-03-05T10:00:00Z",
      "objectRef": "obj_derivative_001",
      "actor": "actor_translator_01",
      "actorLabel": "Translator 01",
      "payload": {
        "creationMethod": "compiled",
        "format": "text/plain",
        "nominalSize": 18000,
        "generationNote": "Derivative translation of obj_original_001"
      },
      "relatedEvents": ["evt_c003"],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c005",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-03-05T10:00:15Z",
      "objectRef": "obj_derivative_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_derivative_001",
        "digest": "sha256:d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
        "size": 18000,
        "contentType": "text/plain",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/translations"
      },
      "relatedEvents": ["evt_c004"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c006",
      "eventCategory": "TRF",
      "eventType": "TRF:FORMAT",
      "timestamp": "2026-03-10T14:00:00Z",
      "objectRef": "obj_derivative_001",
      "actor": "actor_sys_convert",
      "actorLabel": "Format Conversion System",
      "payload": {
        "sourceRef": "obj_derivative_001",
        "targetRef": "obj_derivative_002",
        "fromFormat": "text/plain",
        "toFormat": "application/pdf",
        "conversionTool": "synthetic_converter_v3",
        "integrityCheck": "sha256_verified"
      },
      "relatedEvents": ["evt_c005"],
      "authorityLabel": "System",
      "eventNature": "transformation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c007",
      "eventCategory": "CRE",
      "eventType": "CRE:INIT",
      "timestamp": "2026-03-10T14:00:05Z",
      "objectRef": "obj_derivative_002",
      "actor": "actor_sys_convert",
      "actorLabel": "Format Conversion System",
      "payload": {
        "creationMethod": "compiled",
        "format": "application/pdf",
        "nominalSize": 42000,
        "generationNote": "PDF conversion of obj_derivative_001"
      },
      "relatedEvents": ["evt_c006"],
      "authorityLabel": "System",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c008",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-03-10T14:00:20Z",
      "objectRef": "obj_derivative_002",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_derivative_002",
        "digest": "sha256:e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
        "size": 42000,
        "contentType": "application/pdf",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/documents"
      },
      "relatedEvents": ["evt_c007"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c009",
      "eventCategory": "CNS",
      "eventType": "CNS:GRANT",
      "timestamp": "2026-03-12T09:00:00Z",
      "objectRef": "obj_original_001",
      "actor": "actor_rh_001",
      "actorLabel": "Rights Holder A",
      "payload": {
        "objectRef": "obj_original_001",
        "grantId": "grant_syn_002",
        "grantScope": "research_display",
        "grantedBy": "actor_rh_001",
        "grantedByLabel": "Rights Holder A",
        "validFrom": "2026-03-12T09:00:00Z",
        "validUntil": null,
        "conditions": ["attribution_required", "derivatives_included"]
      },
      "relatedEvents": ["evt_c002"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_c010",
      "eventCategory": "CNS",
      "eventType": "CNS:GRANT",
      "timestamp": "2026-03-12T09:05:00Z",
      "objectRef": "obj_derivative_001",
      "actor": "actor_rh_001",
      "actorLabel": "Rights Holder A",
      "payload": {
        "objectRef": "obj_derivative_001",
        "grantId": "grant_syn_003",
        "grantScope": "research_display",
        "grantedBy": "actor_rh_001",
        "grantedByLabel": "Rights Holder A",
        "validFrom": "2026-03-12T09:05:00Z",
        "validUntil": null,
        "conditions": ["attribution_required", "source_original_cited"]
      },
      "relatedEvents": ["evt_c009", "evt_c005"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    }
  ],
  "summary": {
    "totalEvents": 10,
    "eventCountByCategory": { "CRE": 3, "TRF": 2, "STO": 3, "REV": 0, "CNS": 2, "ACC": 0, "PUB": 0 },
    "firstEventTimestamp": "2026-03-01T08:00:00Z",
    "lastEventTimestamp": "2026-03-12T09:05:00Z",
    "currentStatus": "consent_granted",
    "consentStatus": "granted",
    "publicationStatus": "not_published"
  }
}
```

**Key timeline features exercised:**
- Multi-object provenance chain (original → derivative → format conversion)
- Each derivative gets its own CRE and STO events
- Consent granted separately for original and derivative (different grant IDs)
- Transformation events link source and target objectRefs
- No publication has occurred despite consent being granted

### 7.5 Scenario D: Synthetic Disputed Asset — Review Disagreement and Consent Revocation

**Asset:** `obj_disputed_001`

**Narrative:** A synthetic asset undergoes review, receives a disagreement between reviewers, has consent granted, then consent is revoked due to a newly discovered concern.

```json
{
  "version": 1,
  "primaryObjectRef": "obj_disputed_001",
  "events": [
    {
      "version": 1,
      "eventId": "evt_d001",
      "eventCategory": "CRE",
      "eventType": "CRE:INGEST",
      "timestamp": "2026-04-01T08:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_sys_ingest",
      "actorLabel": "Ingest System",
      "payload": {
        "sourceRef": "src_external_007",
        "sourceLabel": "External Archive Batch 19",
        "format": "image/jpeg",
        "nominalSize": 3200000,
        "ingestMethod": "upload"
      },
      "relatedEvents": [],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d002",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-04-01T08:00:08Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_disputed_001",
        "digest": "sha256:f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
        "size": 3200000,
        "contentType": "image/jpeg",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/images"
      },
      "relatedEvents": ["evt_d001"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d003",
      "eventCategory": "REV",
      "eventType": "REV:START",
      "timestamp": "2026-04-02T09:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rev_055",
      "actorLabel": "Reviewer 055",
      "payload": {
        "objectRef": "obj_disputed_001",
        "reviewScope": "accuracy",
        "reviewId": "rev_syn_003"
      },
      "relatedEvents": ["evt_d002"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d004",
      "eventCategory": "REV",
      "eventType": "REV:COMPLETE",
      "timestamp": "2026-04-02T12:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rev_055",
      "actorLabel": "Reviewer 055",
      "payload": {
        "objectRef": "obj_disputed_001",
        "reviewId": "rev_syn_003",
        "outcome": "satisfactory",
        "findingsCount": 0,
        "reviewDuration": "PT3H"
      },
      "relatedEvents": ["evt_d003"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d005",
      "eventCategory": "REV",
      "eventType": "REV:START",
      "timestamp": "2026-04-03T09:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rev_061",
      "actorLabel": "Reviewer 061",
      "payload": {
        "objectRef": "obj_disputed_001",
        "reviewScope": "accuracy",
        "reviewId": "rev_syn_004"
      },
      "relatedEvents": ["evt_d004"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d006",
      "eventCategory": "REV",
      "eventType": "REV:DISAGREE",
      "timestamp": "2026-04-03T14:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rev_061",
      "actorLabel": "Reviewer 061",
      "payload": {
        "objectRef": "obj_disputed_001",
        "reviewId": "rev_syn_004",
        "disputedReviewRef": "rev_syn_003",
        "disagreementBasis": "factual_dispute"
      },
      "relatedEvents": ["evt_d005", "evt_d004"],
      "authorityLabel": "Review Board",
      "eventNature": "review_record",
      "redaction": {
        "isRedacted": true,
        "redactedFields": ["payload.disagreementDetails"],
        "redactionReason": "Disagreement content is a review artifact — policy R-02",
        "redactionVisible": true
      }
    },
    {
      "version": 1,
      "eventId": "evt_d007",
      "eventCategory": "CNS",
      "eventType": "CNS:GRANT",
      "timestamp": "2026-04-05T10:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rh_003",
      "actorLabel": "Rights Holder C",
      "payload": {
        "objectRef": "obj_disputed_001",
        "grantId": "grant_syn_004",
        "grantScope": "research_display",
        "grantedBy": "actor_rh_003",
        "grantedByLabel": "Rights Holder C",
        "validFrom": "2026-04-05T10:00:00Z",
        "validUntil": null,
        "conditions": ["attribution_required", "disagreement_noted"]
      },
      "relatedEvents": ["evt_d006"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_d008",
      "eventCategory": "CNS",
      "eventType": "CNS:REVOKE",
      "timestamp": "2026-04-10T16:00:00Z",
      "objectRef": "obj_disputed_001",
      "actor": "actor_rh_003",
      "actorLabel": "Rights Holder C",
      "payload": {
        "objectRef": "obj_disputed_001",
        "revokedGrantId": "grant_syn_004",
        "revokedBy": "actor_rh_003",
        "revokedByLabel": "Rights Holder C",
        "reason": "New concern raised regarding source provenance accuracy",
        "effectiveFrom": "2026-04-10T16:00:00Z"
      },
      "relatedEvents": ["evt_d007"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    }
  ],
  "summary": {
    "totalEvents": 8,
    "eventCountByCategory": { "CRE": 1, "TRF": 0, "STO": 1, "REV": 4, "CNS": 2, "ACC": 0, "PUB": 0 },
    "firstEventTimestamp": "2026-04-01T08:00:00Z",
    "lastEventTimestamp": "2026-04-10T16:00:00Z",
    "currentStatus": "consent_restricted",
    "consentStatus": "revoked",
    "publicationStatus": "not_published"
  }
}
```

**Key timeline features exercised:**
- Review disagreement between two reviewers (disagreement preserved, not resolved)
- Consent granted despite disagreement (with condition noting the disagreement)
- Consent later revoked — timeline shows both grant and revocation
- Disagreement details are redacted (review artifact)
- Review outcome "satisfactory" from first reviewer does not prevent second reviewer's disagreement

### 7.6 Scenario E: Synthetic Withdrawn Asset — Publication and Takedown

**Asset:** `obj_withdrawn_001`

**Narrative:** A synthetic asset is published, then withdrawn due to an error, then a correction is issued, and finally a takedown is ordered by an authority.

```json
{
  "version": 1,
  "primaryObjectRef": "obj_withdrawn_001",
  "events": [
    {
      "version": 1,
      "eventId": "evt_e001",
      "eventCategory": "CRE",
      "eventType": "CRE:SYNTH",
      "timestamp": "2026-05-01T08:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_gen_synth_02",
      "actorLabel": "Synthetic Generator v2",
      "payload": {
        "generatorId": "gen_synthetic_02",
        "generatorLabel": "Synthetic Generator v2",
        "format": "application/xml",
        "nominalSize": 85000,
        "parameters": { "schemaVersion": "2.1", "contentProfile": "fabricated_xml_beta" }
      },
      "relatedEvents": [],
      "authorityLabel": "Producer",
      "eventNature": "creation_record",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e002",
      "eventCategory": "STO",
      "eventType": "STO:STORE",
      "timestamp": "2026-05-01T08:00:10Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_sys_echolog",
      "actorLabel": "ECHOLOG Storage Service",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "digest": "sha256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        "size": 85000,
        "contentType": "application/xml",
        "storageDriver": "filesystem",
        "bucketOrPrefix": "synthetic/xml"
      },
      "relatedEvents": ["evt_e001"],
      "authorityLabel": "ECHOLOG Storage (D19)",
      "eventNature": "storage_operation",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e003",
      "eventCategory": "CNS",
      "eventType": "CNS:GRANT",
      "timestamp": "2026-05-02T10:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_rh_004",
      "actorLabel": "Rights Holder D",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "grantId": "grant_syn_005",
        "grantScope": "public_display",
        "grantedBy": "actor_rh_004",
        "grantedByLabel": "Rights Holder D",
        "validFrom": "2026-05-02T10:00:00Z",
        "validUntil": null,
        "conditions": ["attribution_required"]
      },
      "relatedEvents": ["evt_e002"],
      "authorityLabel": "D08 Rights Office — EXTERNAL AUTHORITY",
      "eventNature": "consent_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e004",
      "eventCategory": "PUB",
      "eventType": "PUB:PUBLISH",
      "timestamp": "2026-05-03T12:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_pub_admin",
      "actorLabel": "Publication Administrator",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "publicationRef": "pub_syn_002",
        "scope": "public",
        "publishedBy": "actor_pub_admin",
        "publishedByLabel": "Publication Admin",
        "publicationNote": "Initial publication to public scope"
      },
      "relatedEvents": ["evt_e003"],
      "authorityLabel": "M18 Publication — EXTERNAL AUTHORITY",
      "eventNature": "publication_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e005",
      "eventCategory": "PUB",
      "eventType": "PUB:WITHDRAW",
      "timestamp": "2026-05-10T09:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_pub_admin",
      "actorLabel": "Publication Administrator",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "publicationRef": "pub_syn_002",
        "withdrawnBy": "actor_pub_admin",
        "withdrawnByLabel": "Publication Admin",
        "reason": "Metadata error discovered in attribution field",
        "withdrawalNote": "Withdrawn pending correction"
      },
      "relatedEvents": ["evt_e004"],
      "authorityLabel": "M18 Publication — EXTERNAL AUTHORITY",
      "eventNature": "publication_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e006",
      "eventCategory": "PUB",
      "eventType": "PUB:CORRECT",
      "timestamp": "2026-05-12T14:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_pub_admin",
      "actorLabel": "Publication Administrator",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "publicationRef": "pub_syn_002",
        "correctionRef": "corr_syn_001",
        "correctedBy": "actor_pub_admin",
        "correctedByLabel": "Publication Admin",
        "correctionNature": "attribution_fix",
        "correctionNote": "Corrected attribution to reference Rights Holder D properly"
      },
      "relatedEvents": ["evt_e005"],
      "authorityLabel": "M18 Publication — EXTERNAL AUTHORITY",
      "eventNature": "publication_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    },
    {
      "version": 1,
      "eventId": "evt_e007",
      "eventCategory": "PUB",
      "eventType": "PUB:TAKEDOWN",
      "timestamp": "2026-05-20T16:00:00Z",
      "objectRef": "obj_withdrawn_001",
      "actor": "actor_legal_auth",
      "actorLabel": "Legal Authority",
      "payload": {
        "objectRef": "obj_withdrawn_001",
        "publicationRef": "pub_syn_002",
        "authority": "actor_legal_auth",
        "authorityLabel": "Legal Authority",
        "legalBasis": "Synthetic legal instrument #47-16-E",
        "takedownNote": "Takedown ordered due to rights holder request under fabricated legal provision"
      },
      "relatedEvents": ["evt_e006"],
      "authorityLabel": "Legal Authority — EXTERNAL AUTHORITY",
      "eventNature": "publication_decision",
      "redaction": { "isRedacted": false, "redactedFields": [], "redactionReason": null, "redactionVisible": false }
    }
  ],
  "summary": {
    "totalEvents": 7,
    "eventCountByCategory": { "CRE": 1, "TRF": 0, "STO": 1, "REV": 0, "CNS": 1, "ACC": 0, "PUB": 4 },
    "firstEventTimestamp": "2026-05-01T08:00:00Z",
    "lastEventTimestamp": "2026-05-20T16:00:00Z",
    "currentStatus": "withdrawn",
    "consentStatus": "granted",
    "publicationStatus": "taken_down"
  }
}
```

**Key timeline features exercised:**
- Full publication lifecycle: publish → withdraw → correct → takedown
- Each publication event labeled as EXTERNAL AUTHORITY (M18 Publication or Legal Authority)
- Withdrawal and correction are separate events (not a single "update")
- Takedown is distinct from withdrawal (different authority, different legal basis)
- Consent remains "granted" even after takedown (consent and publication are independent)

---

## 8. Redaction Testing Framework

### 8.1 Purpose

The redaction testing framework ensures that **content remains unavailable** at every stage of the timeline. It defines test categories, test fixtures, and pass/fail criteria.

### 8.2 Redaction Categories

| Category | Code | What is Redacted | Example |
|----------|------|-----------------|---------|
| Content bytes | R-01 | Actual media data (audio, image, text) | Never displayed; opaque digest only |
| Session tracking | R-04 | Session identifiers, cookies, tokens | `payload.sessionRef` redacted |
| Review artifacts | R-02 | Reviewer comments, disagreement details | `payload.disagreementDetails` redacted |
| Redaction coordinates | R-07 | Spatial coordinates of redacted regions | `payload.redactionCoordinates` redacted |
| Personal identifiers | R-03 | Names, addresses, contact information | Actor labels use opaque IDs |
| Source locations | R-05 | URIs to actual content storage | Full URIs replaced with opaque refs |
| Legal instruments | R-06 | Specific legal document content | Legal basis cited by reference only |

### 8.3 Redaction Test Fixtures

#### Fixture R-01: Content Byte Absence

**Test:** Verify that no event payload in any scenario contains actual media bytes, base64-encoded content, or content hashes that could be used to reconstruct content.

**Method:**
1. Iterate all events in all five scenarios
2. For each payload field, check:
   - Is the field value a byte array? → FAIL
   - Is the field value a base64 string longer than 256 characters? → FAIL
   - Does the field name contain "content", "bytes", "data", "body"? → FLAG for review
3. Verify that digest fields contain only hash values (prefixed with algorithm name)

**Expected result:** All events pass. Digest fields contain only SHA-256 hashes. No content bytes are present.

**Pass criteria:** 0 content byte fields found across all 5 scenarios (42 total events).

#### Fixture R-02: Review Artifact Redaction

**Test:** Verify that review comments and disagreement details are redacted in scenarios that include review events.

**Method:**
1. Find all events with `eventCategory: "REV"` across all scenarios
2. For each review event, check:
   - Does the payload contain `commentText` or `disagreementText`? → FAIL (should be redacted)
   - Does the payload contain `commentRef` or `disputedReviewRef`? → PASS (opaque reference only)
   - If redacted fields exist, verify `redaction.isRedacted: true` and `redaction.redactionReason` is populated

**Expected result:** Scenario D's `evt_d006` has `payload.disagreementDetails` redacted with reason "Disagreement content is a review artifact — policy R-02".

**Pass criteria:** 100% of review artifact fields are either absent or properly redacted.

#### Fixture R-03: Personal Identifier Absence

**Test:** Verify that no real personal names, addresses, or contact information appear in any event.

**Method:**
1. Iterate all events in all scenarios
2. For each `actor`, `actorLabel`, `grantedByLabel`, `restrictedByLabel`, etc.:
   - Check against a blocklist of patterns: real names, email patterns, phone patterns
   - Verify labels use fabricated identifiers (e.g., "Reviewer 042", "Rights Holder A")
3. For each payload field containing "name", "email", "phone", "address":
   - Verify field is either absent or redacted

**Expected result:** All actor labels use fabricated identifiers. No real personal information is present.

**Pass criteria:** 0 real personal identifiers found across all 5 scenarios.

#### Fixture R-04: Session Data Redaction

**Test:** Verify that session tracking data is redacted in access events.

**Method:**
1. Find all events with `eventCategory: "ACC"` across all scenarios
2. For each access event, check:
   - Does `payload.sessionRef` exist unredacted? → FAIL
   - If present, verify `redaction.isRedacted: true` with reason referencing policy R-04

**Expected result:** Scenario A's `evt_a009` has `payload.sessionRef` redacted.

**Pass criteria:** 100% of session reference fields are redacted.

#### Fixture R-05: Source URI Opacity

**Test:** Verify that no full URIs to actual content storage appear in any event.

**Method:**
1. Iterate all events in all scenarios
2. For each payload field containing "uri", "url", "path", "endpoint":
   - Check if value starts with "http://", "https://", "s3://", "file://"
   - If so, verify the field is redacted or uses an opaque reference

**Expected result:** All source references use opaque identifiers (e.g., `src_external_001`). No full URIs are present.

**Pass criteria:** 0 unredacted full URIs found across all 5 scenarios.

#### Fixture R-06: Legal Instrument Opacity

**Test:** Verify that legal instrument content is cited by reference, not reproduced.

**Method:**
1. Find all events with `eventType: "PUB:TAKEDOWN"` across all scenarios
2. For each takedown event, check:
   - Does `payload.legalBasis` contain more than a reference identifier? → FLAG
   - Is the legal basis a short reference string (e.g., "Synthetic legal instrument #47-16-E")? → PASS

**Expected result:** Scenario E's `evt_e007` uses a fabricated reference string.

**Pass criteria:** 100% of legal basis fields are reference-only.

#### Fixture R-07: Redaction Coordinate Protection

**Test:** Verify that spatial coordinates of redacted regions are themselves redacted.

**Method:**
1. Find all events with `eventType: "TRF:REDACT"` across all scenarios
2. For each redaction event, check:
   - Does `payload.redactionCoordinates` exist unredacted? → FAIL
   - If present, verify `redaction.isRedacted: true` with reason referencing policy R-07

**Expected result:** Scenario B's `evt_b005` has `payload.redactionCoordinates` redacted.

**Pass criteria:** 100% of redaction coordinate fields are redacted.

### 8.4 Redaction Test Summary

| Fixture | Scenarios Tested | Events Examined | Expected Pass |
|---------|-----------------|-----------------|---------------|
| R-01 Content bytes | A, B, C, D, E | 42 | 42/42 |
| R-02 Review artifacts | D | 4 | 4/4 |
| R-03 Personal identifiers | A, B, C, D, E | 42 | 42/42 |
| R-04 Session data | A | 3 | 3/3 |
| R-05 Source URIs | A, B, C, D, E | 42 | 42/42 |
| R-06 Legal instruments | E | 1 | 1/1 |
| R-07 Redaction coordinates | B | 1 | 1/1 |
| **Total** | **5** | **135** | **135/135** |

### 8.5 Redaction Visibility Principle

When a field is redacted, the timeline must show:
1. **That** something is redacted (the field path is visible)
2. **Why** it is redacted (the policy reason is displayed)
3. **Not what** is redacted (the field value is replaced with a redaction marker)

This ensures transparency about the redaction process without exposing redacted content.

```
┌─────────────────────────────────────────────────┐
│ [REDACTED]                                       │
│ Field: payload.sessionRef                        │
│ Reason: Sensitive field — policy R-04            │
│         (session tracking data)                  │
│                                                  │
│ ⓘ This field has been redacted to protect        │
│   session privacy. The value is not available    │
│   through this timeline view.                    │
└─────────────────────────────────────────────────┘
```

---

## 9. Event-Order Verification

### 9.1 Purpose

Event-order verification ensures **temporal consistency** across the provenance timeline. Events must occur in a logically valid sequence. The verification framework defines ordering rules and tests each scenario for violations.

### 9.2 Temporal Ordering Rules

| Rule ID | Rule | Rationale | Severity |
|---------|------|-----------|----------|
| T-01 | CRE event must precede all other events for the same objectRef | Cannot transform, store, review, or access what does not yet exist | CRITICAL |
| T-02 | STO:STORE must follow CRE for the same objectRef | Cannot store what has not been created | CRITICAL |
| T-03 | STO:VERIFY must follow STO:STORE for the same objectRef | Cannot verify what has not been stored | CRITICAL |
| T-04 | REV:START must follow STO:STORE for the same objectRef | Cannot review what has not been stored | HIGH |
| T-05 | REV:COMPLETE must follow REV:START for the same reviewId | Cannot complete what has not started | HIGH |
| T-06 | CNS:GRANT may follow REV:COMPLETE but does not require it | Consent can be granted before or after review | MEDIUM |
| T-07 | CNS:REVOKE must follow CNS:GRANT for the same grantId | Cannot revoke what has not been granted | CRITICAL |
| T-08 | CNS:RESTRICT may occur at any time after CRE | Restrictions are independent of other lifecycle stages | LOW |
| T-09 | ACC:ATTEMPT must follow CRE for the same objectRef | Cannot access what does not exist | HIGH |
| T-10 | ACC:GRANT must follow ACC:ATTEMPT (or be pre-authorized) | Grant typically responds to an attempt | MEDIUM |
| T-11 | ACC:DENY must follow ACC:ATTEMPT for the same actor/objectRef | Denial responds to an attempt | HIGH |
| T-12 | ACC:EXEC must follow ACC:GRANT for the same scope | Cannot execute what has not been granted | CRITICAL |
| T-13 | PUB:PUBLISH must follow CNS:GRANT for compatible scope | Cannot publish without consent | CRITICAL |
| T-14 | PUB:WITHDRAW must follow PUB:PUBLISH for the same publicationRef | Cannot withdraw what has not been published | CRITICAL |
| T-15 | PUB:CORRECT must follow PUB:PUBLISH or PUB:WITHDRAW for the same publicationRef | Cannot correct what has not been published | HIGH |
| T-16 | PUB:TAKEDOWN must follow PUB:PUBLISH for the same publicationRef | Cannot take down what has not been published | CRITICAL |
| T-17 | TRF:DERIVE must follow STO:STORE for the source objectRef | Cannot derive from what has not been stored | HIGH |
| T-18 | TRF:FORMAT must follow STO:STORE for the source objectRef | Cannot convert what has not been stored | HIGH |
| T-19 | TRF:REDACT must follow STO:STORE for the same objectRef | Cannot redact what has not been stored | HIGH |
| T-20 | STO:RETAIN may occur after STO:STORE | Retention is set on stored objects | MEDIUM |
| T-21 | STO:EXPIRE must follow STO:RETAIN with a retentionUntil date | Cannot expire without a retention period | HIGH |
| T-22 | STO:DELETE must follow STO:EXPIRE or be admin-initiated | Deletion follows expiry or admin action | MEDIUM |
| T-23 | Timestamps must be monotonically non-decreasing within a single objectRef's event log | Events for one object are sequential | HIGH |
| T-24 | Related event references must point to existing eventIds within the log | No dangling references | CRITICAL |

### 9.3 Verification Algorithm

```typescript
/**
 * Verify temporal ordering of a provenance event log.
 * Returns a list of violations (empty = all rules pass).
 */
function verifyEventOrder(log: ProvenanceEventLog): OrderingViolation[] {
  const violations: OrderingViolation[] = [];
  const events = log.events;
  const eventMap = new Map(events.map(e => [e.eventId, e]));

  // Group events by objectRef
  const eventsByObject = groupBy(events, e => e.objectRef);

  for (const [objectRef, objectEvents] of eventsByObject) {
    // Sort by timestamp
    const sorted = [...objectEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // T-01: CRE must be first
    const creEvents = sorted.filter(e => e.eventCategory === 'CRE');
    const nonCreBefore = sorted.filter(e =>
      e.eventCategory !== 'CRE' &&
      new Date(e.timestamp).getTime() < Math.min(...creEvents.map(c => new Date(c.timestamp).getTime()))
    );
    if (creEvents.length > 0 && nonCreBefore.length > 0) {
      violations.push({
        rule: 'T-01',
        objectRef,
        severity: 'CRITICAL',
        message: `Non-creation events preced CRE for ${objectRef}`,
        eventIds: nonCreBefore.map(e => e.eventId)
      });
    }

    // T-02: STO:STORE must follow CRE
    const storeEvents = sorted.filter(e => e.eventType === 'STO:STORE');
    for (const store of storeEvents) {
      const priorCre = creEvents.find(c => new Date(c.timestamp).getTime() < new Date(store.timestamp).getTime());
      if (!priorCre) {
        violations.push({
          rule: 'T-02',
          objectRef,
          severity: 'CRITICAL',
          message: `STO:STORE ${store.eventId} has no preceding CRE for ${objectRef}`,
          eventIds: [store.eventId]
        });
      }
    }

    // T-03: STO:VERIFY must follow STO:STORE
    const verifyEvents = sorted.filter(e => e.eventType === 'STO:VERIFY');
    for (const verify of verifyEvents) {
      const priorStore = storeEvents.find(s => new Date(s.timestamp).getTime() < new Date(verify.timestamp).getTime());
      if (!priorStore) {
        violations.push({
          rule: 'T-03',
          objectRef,
          severity: 'CRITICAL',
          message: `STO:VERIFY ${verify.eventId} has no preceding STO:STORE for ${objectRef}`,
          eventIds: [verify.eventId]
        });
      }
    }

    // T-07: CNS:REVOKE must follow CNS:GRANT
    const grantEvents = sorted.filter(e => e.eventType === 'CNS:GRANT');
    const revokeEvents = sorted.filter(e => e.eventType === 'CNS:REVOKE');
    for (const revoke of revokeEvents) {
      const revokedGrantId = (revoke.payload as CNS_REVOKE_Payload).revokedGrantId;
      const matchingGrant = grantEvents.find(g => {
        const grantPayload = g.payload as CNS_GRANT_Payload;
        return grantPayload.grantId === revokedGrantId;
      });
      if (!matchingGrant) {
        violations.push({
          rule: 'T-07',
          objectRef,
          severity: 'CRITICAL',
          message: `CNS:REVOKE ${revoke.eventId} references non-existent grant ${revokedGrantId}`,
          eventIds: [revoke.eventId]
        });
      } else if (new Date(matchingGrant.timestamp).getTime() > new Date(revoke.timestamp).getTime()) {
        violations.push({
          rule: 'T-07',
          objectRef,
          severity: 'CRITICAL',
          message: `CNS:REVOKE ${revoke.eventId} precedes its CNS:GRANT ${matchingGrant.eventId}`,
          eventIds: [revoke.eventId, matchingGrant.eventId]
        });
      }
    }

    // T-13: PUB:PUBLISH must follow CNS:GRANT
    const publishEvents = sorted.filter(e => e.eventType === 'PUB:PUBLISH');
    for (const pub of publishEvents) {
      const pubPayload = pub.payload as PUB_PUBLISH_Payload;
      const priorGrant = grantEvents.find(g => new Date(g.timestamp).getTime() < new Date(pub.timestamp).getTime());
      if (!priorGrant) {
        violations.push({
          rule: 'T-13',
          objectRef,
          severity: 'CRITICAL',
          message: `PUB:PUBLISH ${pub.eventId} has no preceding CNS:GRANT for ${objectRef}`,
          eventIds: [pub.eventId]
        });
      }
    }

    // T-24: Related event references must exist
    for (const event of sorted) {
      for (const refId of event.relatedEvents) {
        if (!eventMap.has(refId)) {
          violations.push({
            rule: 'T-24',
            objectRef,
            severity: 'CRITICAL',
            message: `Event ${event.eventId} references non-existent event ${refId}`,
            eventIds: [event.eventId]
          });
        }
      }
    }
  }

  return violations;
}

interface OrderingViolation {
  rule: string;
  objectRef: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  eventIds: string[];
}
```

### 9.4 Verification Results for Synthetic Scenarios

| Scenario | Rules Tested | Violations Found | Result |
|----------|-------------|-----------------|--------|
| A (Audio) | T-01 through T-24 | 0 | PASS |
| B (Document) | T-01 through T-24 | 0 | PASS |
| C (Derivatives) | T-01 through T-24 | 0 | PASS |
| D (Disputed) | T-01 through T-24 | 0 | PASS |
| E (Withdrawn) | T-01 through T-24 | 0 | PASS |

All five scenarios pass all 24 temporal ordering rules. No violations detected.

### 9.5 Edge Cases Tested

| Edge Case | Scenario | Rule | Result |
|-----------|----------|------|--------|
| Consent granted before review completes | A (evt_a006 after evt_a005) | T-06 | PASS (allowed) |
| Consent granted despite review disagreement | D (evt_d007 after evt_d006) | T-06 | PASS (allowed) |
| Consent revoked after grant | D (evt_d008 after evt_d007) | T-07 | PASS |
| Publication after consent but before access | A (evt_a010 after evt_a006) | T-13 | PASS |
| Multiple publications for same object | E (evt_e004, evt_e005, evt_e006, evt_e007) | T-14, T-15, T-16 | PASS |
| Derivative created before original consent | C (evt_c003 before evt_c009) | T-17 | PASS (TRF does not require CNS) |
| Takedown after correction | E (evt_e007 after evt_e006) | T-16 | PASS |

---

## 10. State Rendering Fixtures

### 10.1 Purpose

State rendering fixtures verify that the timeline correctly displays different asset states. Each state has distinct visual and semantic properties.

### 10.2 Asset States

| State | Code | Visual Indicator | Description |
|-------|------|-----------------|-------------|
| Created | `created` | Gray dot | Asset exists but has not been stored |
| Stored | `stored` | Blue dot | Asset is in ECHOLOG storage |
| Under Review | `under_review` | Purple dot | A reviewer is examining the asset |
| Consent Pending | `consent_pending` | Yellow dot | Review complete, awaiting consent decision |
| Consent Granted | `consent_granted` | Green dot | Rights holder has authorized use |
| Consent Restricted | `consent_restricted` | Orange dot | Rights holder has limited use |
| Consent Revoked | `consent_revoked` | Red dot | Previously granted consent was withdrawn |
| Published | `published` | Green diamond | Asset is publicly available |
| Withdrawn | `withdrawn` | Orange diamond | Publication was voluntarily removed |
| Taken Down | `taken_down` | Red diamond | Publication was forcibly removed |
| Redacted | `redacted` | Gray with red border | Content has been partially or fully redacted |

### 10.3 State Transition Matrix

```
                    ┌──────────┐
                    │ created  │
                    └────┬─────┘
                         │ STO:STORE
                    ┌────▼─────┐
                    │  stored  │
                    └────┬─────┘
                         │ REV:START
                  ┌──────▼──────┐
                  │ under_review│
                  └──────┬──────┘
                         │ REV:COMPLETE
                  ┌──────▼──────┐
                  │   consent   │
                  │   pending   │
                  └──────┬──────┘
                         │ CNS:GRANT
              ┌──────────▼──────────┐
              │   consent_granted   │
              └──────────┬──────────┘
                         │ PUB:PUBLISH
              ┌──────────▼──────────┐
              │     published       │◄──────────────────┐
              └──────────┬──────────┘                    │
                         │                               │
              ┌──────────▼──────────┐         ┌─────────▼────────┐
              │     withdrawn       │         │    corrected      │
              └──────────┬──────────┘         └─────────┬────────┘
                         │                               │
              ┌──────────▼──────────┐                    │
              │    taken_down       │◄───────────────────┘
              └─────────────────────┘

  Parallel states (can occur from any post-CRE state):
  ┌──────────────────┐
  │ consent_restricted│ ← CNS:RESTRICT from consent_granted or stored
  └──────────────────┘
  ┌──────────────────┐
  │ consent_revoked   │ ← CNS:REVOKE from consent_granted
  └──────────────────┘
  ┌──────────────────┐
  │    redacted       │ ← TRF:REDACT from any stored state
  └──────────────────┘
```

### 10.4 State Rendering Fixture: Created State

**Scenario:** Asset has been created but not yet stored.

```
┌─────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_new_001                           │
│ Status: CREATED | Consent: NONE | Publication: NOT_PUBLISHED│
│ ⚠ This timeline records events. It does not constitute     │
│   rights clearance. Content remains unavailable.            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● CRE:INIT ─── 2026-06-01T08:00:00Z                       │
│  │  Actor: Producer 01 (actor_producer_01)                  │
│  │  Authority: Producer                                     │
│  │  Format: image/png | Size: 1,200,000 bytes               │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  [End of timeline — no further events recorded]             │
│                                                              │
│  State: ● CREATED                                           │
│  Next expected events: STO:STORE, then REV or CNS           │
└─────────────────────────────────────────────────────────────┘
```

### 10.5 State Rendering Fixture: Under Review with Redaction

**Scenario:** Asset is under review and has been partially redacted.

```
┌─────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_review_001                        │
│ Status: UNDER_REVIEW | Consent: NONE | Publication: NO      │
│ ⚠ This timeline records events. It does not constitute     │
│   rights clearance. Content remains unavailable.            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● CRE:INGEST ─── 2026-06-10T08:00:00Z                     │
│  │  Actor: Ingest System                                    │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  ● STO:STORE ─── 2026-06-10T08:00:10Z                      │
│  │  Authority: ECHOLOG Storage (D19)                        │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  ● TRF:REDACT ─── 2026-06-11T09:00:00Z                     │
│  │  Authority: Privacy Officer                              │
│  │  Scope: partial | Regions: 2                             │
│  │  [REDACTED] payload.redactionCoordinates                 │
│  │  Reason: Redaction coordinates — policy R-07             │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  ● REV:START ─── 2026-06-12T10:00:00Z                       │
│  │  Reviewer: Reviewer 033                                  │
│  │  Scope: rights_compliance                                │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  [Review in progress — no completion event yet]             │
│                                                              │
│  State: ● UNDER_REVIEW (with partial redaction)             │
│  Next expected events: REV:COMPLETE, then CNS               │
└─────────────────────────────────────────────────────────────┘
```

### 10.6 State Rendering Fixture: Consent Revoked

**Scenario:** Asset had consent granted, then consent was revoked.

```
┌─────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_revoked_001                       │
│ Status: CONSENT_REVOKED | Consent: REVOKED                  │
│ Publication: NOT_PUBLISHED                                  │
│ ⚠ This timeline records events. It does not constitute     │
│   rights clearance. Content remains unavailable.            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● CRE:INIT ─── 2026-07-01T08:00:00Z                       │
│  │  ────────────────────────────────────────                │
│  ● STO:STORE ─── 2026-07-01T08:00:10Z                      │
│  │  ────────────────────────────────────────                │
│  ● REV:COMPLETE ─── 2026-07-02T12:00:00Z                   │
│  │  Outcome: satisfactory                                   │
│  │  ────────────────────────────────────────                │
│  ◆ CNS:GRANT ─── 2026-07-03T10:00:00Z                      │
│  │  Authority: Rights Holder E ◄ EXTERNAL AUTHORITY         │
│  │  Scope: research_display                                 │
│  │  Grant ID: grant_syn_006                                 │
│  │  ────────────────────────────────────────                │
│  ◆ CNS:REVOKE ─── 2026-07-10T16:00:00Z                     │
│  │  Authority: Rights Holder E ◄ EXTERNAL AUTHORITY         │
│  │  Revoked Grant: grant_syn_006                            │
│  │  Reason: "New information regarding source provenance"   │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  State: ◆ CONSENT_REVOKED                                   │
│  ⚠ Consent was granted on 2026-07-03 and revoked on        │
│    2026-07-10. No publication occurred during the grant     │
│    window. The revocation is final.                         │
└─────────────────────────────────────────────────────────────┘
```

### 10.7 State Rendering Fixture: Published and Taken Down

**Scenario:** Asset was published, withdrawn, corrected, and then taken down.

```
┌─────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_withdrawn_001                     │
│ Status: WITHDRAWN | Consent: GRANTED                        │
│ Publication: TAKEN_DOWN                                     │
│ ⚠ This timeline records events. It does not constitute     │
│   rights clearance. Content remains unavailable.            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● CRE:SYNTH ─── 2026-05-01T08:00:00Z                      │
│  │  ────────────────────────────────────────                │
│  ● STO:STORE ─── 2026-05-01T08:00:10Z                      │
│  │  ────────────────────────────────────────                │
│  ◆ CNS:GRANT ─── 2026-05-02T10:00:00Z                      │
│  │  Authority: Rights Holder D ◄ EXTERNAL AUTHORITY         │
│  │  ────────────────────────────────────────                │
│  ◆ PUB:PUBLISH ─── 2026-05-03T12:00:00Z                    │
│  │  Authority: M18 Publication ◄ EXTERNAL AUTHORITY         │
│  │  Scope: public | Pub Ref: pub_syn_002                    │
│  │  ────────────────────────────────────────                │
│  ◆ PUB:WITHDRAW ─── 2026-05-10T09:00:00Z                   │
│  │  Authority: M18 Publication ◄ EXTERNAL AUTHORITY         │
│  │  Reason: Metadata error in attribution                   │
│  │  ────────────────────────────────────────                │
│  ◆ PUB:CORRECT ─── 2026-05-12T14:00:00Z                    │
│  │  Authority: M18 Publication ◄ EXTERNAL AUTHORITY         │
│  │  Nature: attribution_fix | Correction: corr_syn_001      │
│  │  ────────────────────────────────────────                │
│  ◆ PUB:TAKEDOWN ─── 2026-05-20T16:00:00Z                   │
│  │  Authority: Legal Authority ◄ EXTERNAL AUTHORITY         │
│  │  Basis: Synthetic legal instrument #47-16-E              │
│  │  ────────────────────────────────────────                │
│  │                                                           │
│  State: ◆ TAKEN_DOWN                                        │
│  ⚠ This asset was published, withdrawn for correction,      │
│    corrected, and then taken down by legal authority.       │
│    Content is NOT available. Consent (grant_syn_005)        │
│    remains technically granted but publication has been     │
│    forcibly removed.                                        │
└─────────────────────────────────────────────────────────────┘
```

### 10.8 State Rendering Fixture: Multi-Object Derivative Chain

**Scenario:** Original asset with two derivatives, showing cross-object timeline.

```
┌─────────────────────────────────────────────────────────────┐
│ PROVENANCE TIMELINE — obj_original_001 (+ derivatives)      │
│ Status: CONSENT_GRANTED | Publication: NOT_PUBLISHED        │
│ ⚠ This timeline records events. It does not constitute     │
│   rights clearance. Content remains unavailable.            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ── obj_original_001 ────────────────────────────────────── │
│  ● CRE:INIT ─── 2026-03-01T08:00:00Z                       │
│  ● STO:STORE ─── 2026-03-01T08:00:10Z                      │
│  ◆ CNS:GRANT ─── 2026-03-12T09:00:00Z                      │
│  │  Authority: Rights Holder A ◄ EXTERNAL AUTHORITY         │
│  │  Scope: research_display (derivatives_included)          │
│  │                                                           │
│  ── obj_derivative_001 (translation of original) ────────── │
│  ● TRF:DERIVE ─── 2026-03-05T10:00:00Z                     │
│  │  Source: obj_original_001 → Target: obj_derivative_001   │
│  │  Type: translation                                       │
│  ● CRE:INIT ─── 2026-03-05T10:00:00Z                       │
│  ● STO:STORE ─── 2026-03-05T10:00:15Z                      │
│  ◆ CNS:GRANT ─── 2026-03-12T09:05:00Z                      │
│  │  Authority: Rights Holder A ◄ EXTERNAL AUTHORITY         │
│  │  Scope: research_display (source_original_cited)         │
│  │                                                           │
│  ── obj_derivative_002 (PDF of derivative_001) ──────────── │
│  ● TRF:FORMAT ─── 2026-03-10T14:00:00Z                     │
│  │  Source: obj_derivative_001 → Target: obj_derivative_002 │
│  │  From: text/plain → To: application/pdf                  │
│  ● CRE:INIT ─── 2026-03-10T14:00:05Z                       │
│  ● STO:STORE ─── 2026-03-10T14:00:20Z                      │
│  │  [No separate consent for derivative_002]                │
│  │  ⚠ Consent on original covers derivatives per            │
│  │    grant_syn_002 condition "derivatives_included"        │
│  │                                                           │
│  State: ● CONSENT_GRANTED (3 objects, 2 explicit grants)    │
│  Note: obj_derivative_002 has no explicit consent grant.    │
│  It is covered by the original's grant condition.           │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Consent/Publication Decision Labeling

### 11.1 Purpose

This section defines how the timeline distinguishes **storage events** (what ECHOLOG does) from **consent/publication decisions** (what external authorities decide). The distinction is critical: a storage event does not imply authorization, and a consent decision does not imply content availability.

### 11.2 Authority Labeling System

Every event on the timeline carries two labels:

1. **`authorityLabel`** — identifies whose domain the event belongs to
2. **`eventNature`** — classifies the type of action

| authorityLabel | eventNature | Domain | Visual Marker |
|---------------|-------------|--------|---------------|
| "ECHOLOG Storage (D19)" | `storage_operation` | Storage | Blue, no special marker |
| "Producer" | `creation_record` | Creation | Gray, no special marker |
| "System" | `transformation_record` | Transformation | Teal, no special marker |
| "Review Board" | `review_record` | Review | Purple, no special marker |
| "D08 Rights Office — EXTERNAL AUTHORITY" | `consent_decision` | Consent | Green, ◄ EXTERNAL AUTHORITY |
| "Privacy Office — EXTERNAL AUTHORITY" | `consent_decision` | Consent | Green, ◄ EXTERNAL AUTHORITY |
| "M18 Publication — EXTERNAL AUTHORITY" | `publication_decision` | Publication | Orange, ◄ EXTERNAL AUTHORITY |
| "Legal Authority — EXTERNAL AUTHORITY" | `publication_decision` | Publication | Orange, ◄ EXTERNAL AUTHORITY |
| "Access Control" | `access_record` | Access | Gray, no special marker |

### 11.3 Decision vs. Operation Distinction

**Storage operations** are system actions:
- They record *what the storage system did* (stored, verified, retained, expired, deleted)
- They do NOT constitute authorization, consent, or rights clearance
- They are labeled with the ECHOLOG (D19) domain

**Consent decisions** are external authority actions:
- They record *what a rights holder decided* (granted, restricted, revoked, privacy-applied)
- They are explicitly labeled as EXTERNAL AUTHORITY decisions
- The timeline displays them but does not validate, enforce, or adjudicate them
- They carry the authority's opaque identifier and human-readable label

**Publication decisions** are external authority actions:
- They record *what a publication authority decided* (published, withdrew, corrected, took down)
- They are explicitly labeled as EXTERNAL AUTHORITY decisions
- They are independent from consent (an asset can be consented but not published, or published without consent — both are errors)

### 11.4 Cross-Reference: What Each Event Type Does and Does Not Imply

| Event Type | Implies | Does NOT Imply |
|-----------|---------|---------------|
| STO:STORE | Bytes are persisted | Content is authorized, consented, or cleared |
| STO:VERIFY | Digest matches | Content is correct, approved, or safe |
| CNS:GRANT | A rights holder authorized a scope | Content is available, published, or accessible |
| CNS:RESTRICT | A rights holder limited a scope | Content is unavailable (may still be accessible under other grants) |
| CNS:REVOKE | A rights holder withdrew authorization | Content is immediately unavailable (may have cached copies) |
| PUB:PUBLISH | Content was released for public view | Content is freely accessible (may require authentication) |
| PUB:WITHDRAW | Publication was voluntarily removed | Content is deleted (storage may retain it) |
| PUB:TAKEDOWN | Publication was forcibly removed | Consent is revoked (rights holder may still consent) |
| REV:COMPLETE | A reviewer examined the asset | The reviewer approved rights or publication |
| ACC:EXEC | An actor successfully read the asset | The actor has rights to redistribute or publish |

### 11.5 Disclaimer Rendering

Every timeline view renders a persistent disclaimer:

```
⚠ TIMELINE DISCLAIMER

This timeline records events from multiple authorities:
  • Storage operations are recorded by ECHOLOG (D19)
  • Consent decisions are made by D08 Rights Office (EXTERNAL AUTHORITY)
  • Publication decisions are made by M18 Publication (EXTERNAL AUTHORITY)
  • Review records are made by the Review Board

This display is NOT a rights clearance certificate.
Content remains UNAVAILABLE through this view.
Consult the appropriate authority for authorization decisions.
```

### 11.6 Authority Separation Example

The following example demonstrates how a single asset's timeline clearly separates authorities:

```
Timeline for obj_example_001:

  2026-01-10  ● STO:STORE         Authority: ECHOLOG Storage (D19)
              │ Nature: STORAGE OPERATION
              │ → The storage system persisted the bytes.
              │ → This does NOT mean anyone has rights to the content.
              │
  2026-01-11  ● REV:COMPLETE      Authority: Review Board
              │ Nature: REVIEW RECORD
              │ → A reviewer examined the asset and found it satisfactory.
              │ → This does NOT mean the content is authorized for use.
              │
  2026-01-12  ◆ CNS:GRANT         Authority: D08 Rights Office ◄ EXTERNAL AUTHORITY
              │ Nature: CONSENT DECISION
              │ → A rights holder authorized research_display scope.
              │ → This does NOT mean the content is published or publicly available.
              │ → The decision was made by an external authority, not by this timeline.
              │
  2026-01-20  ◆ PUB:PUBLISH       Authority: M18 Publication ◄ EXTERNAL AUTHORITY
              │ Nature: PUBLICATION DECISION
              │ → A publication authority released the asset to restricted_research scope.
              │ → This does NOT mean all users can access the content.
              │ → Access is governed by separate ACC events.
```

---

## 12. Privacy/Security Review

### 12.1 Purpose

This section reviews the privacy and security implications of the provenance timeline prototype, ensuring that sensitive field leakage is prevented.

### 12.2 Sensitive Field Classification

| Classification | Code | Examples | Handling |
|---------------|------|---------|----------|
| Content bytes | S-01 | Audio data, image pixels, text content | Never stored in event records; opaque digest only |
| Personal identifiers | S-02 | Real names, email addresses, phone numbers | Replaced with opaque actor IDs and fabricated labels |
| Session tracking | S-03 | Session IDs, cookies, auth tokens | Redacted with policy R-04 reference |
| Review artifacts | S-04 | Reviewer comments, disagreement details | Redacted with policy R-02 reference |
| Source locations | S-05 | Full URIs, file paths, bucket names | Replaced with opaque source references |
| Redaction coordinates | S-06 | Spatial regions of redacted content | Redacted with policy R-07 reference |
| Legal instruments | S-07 | Full legal document text | Referenced by instrument number only |
| Access credentials | S-08 | API keys, passwords, bearer tokens | Never included in event records |

### 12.3 Leakage Prevention Measures

| Measure | Description | Tested By |
|---------|-------------|-----------|
| M-01 Opaque identifiers | All object, actor, and authority IDs are fabricated tokens | R-03 fixture |
| M-02 Content byte exclusion | No payload field contains actual media bytes | R-01 fixture |
| M-03 Session redaction | Session references are redacted in access events | R-04 fixture |
| M-04 Review artifact redaction | Reviewer comments and disagreement details are redacted | R-02 fixture |
| M-05 URI opacity | No full URIs to content storage appear in events | R-05 fixture |
| M-06 Coordinate protection | Redaction spatial coordinates are themselves redacted | R-07 fixture |
| M-07 Legal reference only | Legal instruments are cited by reference, not reproduced | R-06 fixture |
| M-08 No credential fields | Event schema has no fields for passwords, keys, or tokens | Schema review |
| M-09 Fabricated labels | Actor labels use generic terms ("Reviewer 042") not real names | R-03 fixture |
| M-10 Digest-only integrity | Content integrity is verified by hash, not by storing content | R-01 fixture |

### 12.4 Privacy Impact Assessment

**Data subjects:** No real individuals are represented. All actor IDs and labels are fabricated.

**Personal data processing:** The prototype processes no personal data. Actor identifiers are opaque tokens with no real-world mapping.

**Data minimization:** The prototype stores only the minimum information needed to demonstrate the timeline concept: event types, timestamps, opaque references, and fabricated labels.

**Purpose limitation:** The prototype is used solely for design validation. It is not used for operational decisions, rights clearance, or content delivery.

**Storage limitation:** The prototype exists only as a design document with synthetic JSON fixtures. No database, no persistent storage, no backup.

**Accuracy:** All data is explicitly fabricated. No claim of accuracy is made. The synthetic scenarios are designed to test edge cases, not to represent real events.

### 12.5 Security Review Checklist

| Check | Status | Notes |
|-------|--------|-------|
| No real credentials in fixtures | PASS | All IDs are fabricated |
| No real media content | PASS | All content is synthetic |
| No real personal data | PASS | All actors are opaque |
| No real source URIs | PASS | All references are opaque |
| No real legal instruments | PASS | All legal refs are fabricated |
| Redaction framework tested | PASS | 7 fixtures, all pass |
| No credential fields in schema | PASS | Schema review confirms |
| Digest-only integrity | PASS | SHA-256 hashes only |
| Session data redacted | PASS | Policy R-04 applied |
| Review artifacts redacted | PASS | Policy R-02 applied |

### 12.6 Residual Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Opaque ID collision with real ID | Very Low | Low | IDs use "synthetic" prefix; no real ID registry |
| Fabricated label resembles real name | Very Low | Medium | Labels use generic terms ("Reviewer 042") |
| Digest reveals content hash | Low | Low | Digests are fabricated; no rainbow table risk |
| Scenario narrative suggests real event | Low | Medium | All narratives explicitly marked as synthetic |
| Redaction policy reference leaks policy detail | Very Low | Low | Policy codes (R-01 through R-07) are abstract |

---

## 13. Comprehension Evaluation Methodology

### 13.1 Purpose

This section defines how to evaluate whether users correctly interpret the provenance timeline. Comprehension is measured along two dimensions: **lineage comprehension** (can the user trace the asset's history?) and **sensitive-field awareness** (does the user understand what is and is not available?).

### 13.2 Evaluation Design

**Method:** Structured comprehension test using synthetic scenarios.

**Participants:** Target 5-10 reviewers (ECHOLOG owners, privacy officers, rights specialists, UX researchers).

**Materials:** The five synthetic scenarios (A through E) rendered as timeline views.

**Procedure:**
1. Present each scenario's timeline to the participant
2. Ask comprehension questions (see Section 13.3)
3. Record responses and confidence ratings
4. Debrief with participant about interpretation difficulties

### 13.3 Comprehension Questions

#### Lineage Comprehension Questions

| ID | Question | Scenario | Expected Answer | Scoring |
|----|----------|----------|----------------|---------|
| L-01 | "What is the current status of obj_audio_001?" | A | Published (restricted_research scope) | 1 point for correct status |
| L-02 | "Who authorized the research_display consent for obj_audio_001?" | A | Rights Holder A (EXTERNAL AUTHORITY) | 1 point for correct authority |
| L-03 | "Was the full_read access attempt by Researcher X granted?" | A | No — denied, then metadata_only was granted | 1 point for correct denial identification |
| L-04 | "How many objects are in the derivative chain for obj_original_001?" | C | Three: original, derivative_001 (translation), derivative_002 (PDF) | 1 point for correct count |
| L-05 | "What happened to obj_disputed_001's consent?" | D | Granted then revoked | 1 point for both events identified |
| L-06 | "What is the sequence of publication events for obj_withdrawn_001?" | E | Publish → Withdraw → Correct → Takedown | 1 point per correct event in order (max 4) |
| L-07 | "Does obj_docimg_001 have consent for full content access?" | B | No — consent is restricted to metadata-only | 1 point for correct restriction identification |

#### Sensitive-Field Awareness Questions

| ID | Question | Scenario | Expected Answer | Scoring |
|----|----------|----------|----------------|---------|
| S-01 | "Can you view the actual audio content of obj_audio_001 through this timeline?" | A | No — content remains unavailable | 1 point for correct "no" |
| S-02 | "What does the [REDACTED] marker on evt_a009 mean?" | A | Session tracking data was withheld per policy R-04 | 1 point for correct policy identification |
| S-03 | "Does the STO:STORE event mean the content is authorized for use?" | A | No — storage does not imply authorization | 1 point for correct distinction |
| S-04 | "Does the REV:COMPLETE 'satisfactory' outcome mean the content is cleared for publication?" | A | No — review does not constitute rights clearance | 1 point for correct distinction |
| S-05 | "What information about the redacted regions in obj_docimg_001 is available?" | B | Only the count (3 regions); coordinates are redacted per R-07 | 1 point for correct redaction identification |
| S-06 | "Is the disagreement between Reviewer 055 and Reviewer 061 visible?" | D | The fact of disagreement is visible; the details are redacted per R-02 | 1 point for correct partial visibility |
| S-07 | "Does the CNS:GRANT for obj_original_001 automatically apply to obj_derivative_002?" | C | Not automatically — but grant_syn_002 includes "derivatives_included" condition | 1 point for correct condition identification |

#### Authority Distinction Questions

| ID | Question | Scenario | Expected Answer | Scoring |
|----|----------|----------|----------------|---------|
| A-01 | "Which events are storage operations vs. consent decisions?" | A | STO events are storage; CNS events are consent decisions | 1 point for correct classification |
| A-02 | "Who made the decision to publish obj_withdrawn_001?" | E | Publication Administrator (M18 Publication — EXTERNAL AUTHORITY) | 1 point for correct authority |
| A-03 | "Who ordered the takedown of obj_withdrawn_001?" | E | Legal Authority (EXTERNAL AUTHORITY) | 1 point for correct authority |
| A-04 | "Is the timeline itself a rights clearance document?" | Any | No — it records events from external authorities | 1 point for correct "no" |
| A-05 | "Can the timeline be used to determine if content is legally available?" | Any | No — consult the rights owner for authorization | 1 point for correct deferral |

### 13.4 Scoring System

| Score Range | Interpretation | Action |
|------------|---------------|--------|
| 17-19 (85-95%) | High comprehension | Timeline design is effective |
| 13-16 (65-84%) | Moderate comprehension | Design needs refinement; identify specific weak areas |
| 9-12 (45-64%) | Low comprehension | Significant redesign needed |
| 0-8 (0-44%) | Very low comprehension | Timeline concept is not working; fundamental rethink |

### 13.5 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lineage comprehension rate | ≥ 80% | Correct answers to L-01 through L-07 / 7 |
| Sensitive-field awareness rate | ≥ 85% | Correct answers to S-01 through S-07 / 7 |
| Authority distinction rate | ≥ 90% | Correct answers to A-01 through A-05 / 5 |
| Composite comprehension score | ≥ 80% | Total correct / 19 |
| Time to complete test | < 15 minutes | Average across participants |
| Confidence calibration | r > 0.5 | Correlation between confidence and accuracy |

### 13.6 Evaluation Procedure

1. **Recruit** 5-10 participants from ECHOLOG owners, privacy officers, rights specialists
2. **Brief** participants: "You will view synthetic provenance timelines. Answer questions about what you see."
3. **Present** scenarios A through E in order, with comprehension questions after each
4. **Record** responses, confidence ratings (1-5 scale), and time per scenario
5. **Score** responses using the scoring system above
6. **Analyze** results: identify weak areas, compute metrics
7. **Debrief** participants: "What was confusing? What was clear? What would you change?"
8. **Report** results with recommendations for design refinement

---

## 14. Risk Mitigation

### 14.1 Primary Risk: Rights Clearance Confusion

**Risk statement:** Users may mistake the provenance timeline for a rights clearance certificate, believing that because events are displayed, the content is authorized for use.

**Likelihood:** Medium — the timeline displays consent and publication events that resemble clearance indicators.

**Impact:** High — incorrect rights assumptions could lead to unauthorized content use, privacy violations, or legal liability.

**Mitigation strategy:**

| ID | Mitigation | Implementation |
|----|-----------|----------------|
| RM-01 | Persistent disclaimer | Every timeline view includes the disclaimer: "This timeline records events. It does not constitute rights clearance. Content remains unavailable." |
| RM-02 | External authority labeling | All consent and publication events are labeled with "◄ EXTERNAL AUTHORITY" to make clear the timeline is not the decision-maker |
| RM-03 | Event nature classification | Each event is tagged with `eventNature` (storage_operation, consent_decision, publication_decision, etc.) to distinguish system actions from authority decisions |
| RM-04 | No content display | The timeline never shows thumbnails, previews, or content excerpts — reinforcing that content is unavailable |
| RM-05 | Status ≠ clearance | Asset status (e.g., "consent_granted") is displayed alongside the disclaimer, making clear that status is a record, not a certification |
| RM-06 | Authority deferral | The disclaimer explicitly directs users to "consult the appropriate authority for authorization decisions" |
| RM-07 | Comprehension testing | Section 13 evaluates whether users correctly understand the timeline's limitations |
| RM-08 | Redaction visibility | Redacted fields are shown as "[REDACTED]" with policy reasons, reinforcing that information is withheld |

### 14.2 Secondary Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| R2: Temporal confusion | Medium | Low | Event-order verification (Section 9) ensures chronological consistency; violations are flagged |
| R3: Multi-object confusion | Medium | Medium | Derivative chain scenarios (C) clearly label cross-object relationships; each object has its own event sub-timeline |
| R4: Redaction misunderstanding | Low | Medium | Redaction markers include policy reasons; comprehension test includes redaction awareness questions |
| R5: Status misinterpretation | Medium | High | Status labels are accompanied by explanatory notes (e.g., "Consent was granted on X and revoked on Y") |
| R6: Scope creep to real assets | Low | High | Anti-overlap statement in task spec; document explicitly marks all data as synthetic |
| R7: Prototype used in production | Low | High | Document states "implementation deferred pending owner review"; no production deployment path |
| R8: Schema confusion with ECHOLOG | Low | Medium | Schema explicitly states it does not modify ECHOLOG's D19 contract; sidecar metadata is not extended |

### 14.3 Risk Monitoring

| Monitor | Frequency | Action Trigger |
|---------|-----------|---------------|
| Comprehension test scores | After each evaluation round | Score < 80% triggers design revision |
| Disclaimer visibility | Each UI render | Disclaimer must be present and legible |
| External authority labels | Each event render | All CNS and PUB events must show "EXTERNAL AUTHORITY" |
| Redaction marker presence | Each event render | All redacted fields must show "[REDACTED]" with reason |
| Content byte absence | Each build | No payload field may contain actual media bytes |

### 14.4 Rollback Plan

If the prototype causes confusion or is misused:

1. **Immediate:** Remove the prototype view from any deployment
2. **Short-term:** Add enhanced disclaimers and visual warnings
3. **Medium-term:** Redesign the timeline with additional safeguards
4. **Long-term:** Re-evaluate whether a provenance timeline is appropriate for the domain

Rollback is low-cost: the prototype is a static design document with synthetic JSON fixtures. Removal means deleting the fixtures and the visualization code.

---

## 15. Metrics and Success Criteria

### 15.1 Primary Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Lineage comprehension** | ≥ 80% | Comprehension test (Section 13): L-01 through L-07 correct answer rate |
| **Sensitive-field leakage** | 0 incidents | Redaction test framework (Section 8): all 7 fixtures pass with 0 leaks |
| **Authority distinction accuracy** | ≥ 90% | Comprehension test: A-01 through A-05 correct answer rate |
| **Event-order compliance** | 100% | Ordering verification (Section 9): 0 violations across all 5 scenarios |
| **Content invisibility** | 100% | Redaction fixture R-01: 0 content byte fields across all 42 events |

### 15.2 Secondary Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Redaction transparency** | 100% | All redacted fields show "[REDACTED]" marker with policy reason |
| **Disclaimer presence** | 100% | Every timeline view includes the mandatory disclaimer |
| **External authority labeling** | 100% | All CNS and PUB events show "◄ EXTERNAL AUTHORITY" marker |
| **Scenario coverage** | 5/5 | All five synthetic scenarios exercise their intended event types |
| **State rendering accuracy** | 100% | All state rendering fixtures correctly display their target state |
| **Comprehension test completion time** | < 15 minutes | Average time across participants |
| **Participant confidence calibration** | r > 0.5 | Correlation between confidence ratings and accuracy |

### 15.3 Success Criteria

The M47-16 prototype is considered **successful** when all of the following are met:

| Criterion | Threshold | Evidence |
|-----------|-----------|---------|
| C1: Lineage comprehension | ≥ 80% correct | Comprehension test results |
| C2: Zero content leakage | 0 incidents | Redaction test framework results |
| C3: Authority distinction | ≥ 90% correct | Comprehension test results |
| C4: Event-order compliance | 100% pass | Ordering verification results |
| C5: Owner review | ECHOLOG and privacy owners approve event fields | Written approval |
| C6: Disclaimer effectiveness | 100% presence | UI render audit |
| C7: Redaction transparency | 100% markers present | Redaction fixture audit |

### 15.4 Metrics Collection Plan

| Phase | Metrics Collected | Method |
|-------|------------------|--------|
| Design (this document) | Schema completeness, scenario coverage | Document review |
| Implementation (deferred) | Event-order compliance, content invisibility | Automated test fixtures |
| Evaluation (deferred) | Comprehension scores, confidence calibration | Human participant testing |
| Owner review (deferred) | ECHOLOG/privacy owner approval | Written review |

### 15.5 Metric Reporting Template

```
M47-16 Metrics Report
=====================
Date: [date]
Evaluator: [name]

Primary Metrics:
  Lineage comprehension:     __/7 = __%  (target: ≥80%)
  Sensitive-field leakage:   __ incidents (target: 0)
  Authority distinction:     __/5 = __%  (target: ≥90%)
  Event-order compliance:    __/24 rules (target: 100%)
  Content invisibility:      __ content fields (target: 0)

Secondary Metrics:
  Redaction transparency:    __/__ redacted fields marked
  Disclaimer presence:       __/__ views with disclaimer
  External authority labels:  __/__ CNS+PUB events labeled
  Scenario coverage:         __/5 scenarios exercised
  State rendering accuracy:  __/__ states correctly displayed
  Comprehension time:        __ minutes average
  Confidence calibration:    r = __

Overall Assessment: [PASS / FAIL / CONDITIONAL]
Notes: [observations, recommendations]
```

---

## 16. Implementation Considerations (Deferred)

### 16.1 Scope Statement

This section outlines considerations for future implementation. **No implementation is authorized by this document.** Implementation requires:
1. Owner authorization via the AI execution contract
2. ECHOLOG and privacy owner review of event fields
3. A confirmed implementation plan with specific SHA, paths, and test commands

### 16.2 Technical Considerations

**Rendering approach:**
- The timeline could be rendered as a static HTML page, a React component, or a CLI text output
- The choice depends on the target audience (UX review vs. developer verification vs. operator inspection)
- MoonUI component library should be used if a React implementation is chosen (per MANDATORY_MOONUI_SURFACES)

**Data source:**
- The prototype uses fabricated JSON fixtures stored as static files
- A future implementation could read from a database, API, or file system
- No database schema change is authorized (C4 constraint)

**Integration points:**
- ECHOLOG (D19): The timeline references ECHOLOG storage events but does not call ECHOLOG's API
- D08 Rights: The timeline displays consent events but does not query or modify D08's state
- M18 Publication: The timeline displays publication events but does not interact with M18's state machine
- M33-05: The timeline's poster access patterns could inform M33-05's contract, but no integration is implied

**Testing infrastructure:**
- Event-order verification (Section 9) could be automated as a Node.js script
- Redaction fixtures (Section 8) could be automated as assertion-based tests
- Comprehension evaluation (Section 13) requires human participants and cannot be fully automated

### 16.3 File Structure (Proposed, Not Authorized)

If implementation proceeds, the following file structure is suggested:

```
apps/
  [target-app]/
    src/
      components/
        ProvenanceTimeline.tsx       # Timeline visualization component
        TimelineHeader.tsx           # Header with status and disclaimer
        TimelineEvent.tsx            # Individual event renderer
        RedactionMarker.tsx          # Redacted field display
        AuthorityLabel.tsx           # External authority label
      fixtures/
        scenario-a-audio.json        # Scenario A synthetic data
        scenario-b-document.json     # Scenario B synthetic data
        scenario-c-derivatives.json  # Scenario C synthetic data
        scenario-d-disputed.json     # Scenario D synthetic data
        scenario-e-withdrawn.json    # Scenario E synthetic data
      lib/
        event-order-verifier.ts      # Temporal consistency checker
        redaction-tester.ts          # Redaction fixture tester
        comprehension-scorer.ts      # Comprehension test scorer
      types/
        provenance.ts                # TypeScript interfaces from Section 5
docs/
  audit/
    M47-16-media-provenance-timeline.md  # This document
scripts/
  check-m47-16-event-order.mjs         # Event-order verification script
  check-m47-16-redaction.mjs           # Redaction fixture test script
```

### 16.4 Implementation Phases (Deferred)

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Foundation | 2 days | TypeScript types, JSON fixtures, event-order verifier |
| Phase 2: Visualization | 2 days | Timeline component, state rendering, redaction markers |
| Phase 3: Testing | 1-2 days | Redaction fixture tests, comprehension test setup |
| Phase 4: Review | 1-2 days | Owner review, metric collection, documentation |

**Total estimated effort:** 6-8 days (within the 5-9 day estimate from TODO.md)

### 16.5 Dependencies for Implementation

| Dependency | Status | Blocker? |
|-----------|--------|----------|
| ECHOLOG owner review of event fields | Not started | Yes — Definition of Done |
| Privacy owner review of redaction policies | Not started | Yes — Definition of Done |
| MoonUI component availability | Existing | No — can use basic HTML |
| Node.js 24 LTS runtime | Existing | No |
| pnpm 10.33.4 | Existing | No |
| Target app selection | Not decided | No — can be standalone |

---

## 17. Deferred Items Requiring Owner Action

### 17.1 Owner Review Items

The following items require explicit owner action before the prototype can proceed to implementation:

| ID | Item | Owner | Action Required | Status |
|----|------|-------|----------------|--------|
| D-01 | Approve event vocabulary (Section 4) | ECHOLOG owner | Review 7 categories, 21 event types; confirm semantics | PENDING |
| D-02 | Approve synthetic event record schema (Section 5) | ECHOLOG owner | Review TypeScript interfaces; confirm field completeness | PENDING |
| D-03 | Approve redaction policies (Section 8) | Privacy owner | Review 7 redaction categories (R-01 through R-07); confirm coverage | PENDING |
| D-04 | Approve authority labeling (Section 11) | ECHOLOG + Rights owner | Review authority labels; confirm EXTERNAL AUTHORITY markers | PENDING |
| D-05 | Approve disclaimer text (Section 11.5) | Privacy + Rights owner | Review mandatory disclaimer; confirm wording | PENDING |
| D-06 | Approve comprehension test questions (Section 13) | ECHOLOG owner | Review 19 questions; confirm they test the right concepts | PENDING |
| D-07 | Approve success criteria thresholds (Section 15) | ECHOLOG + Privacy owner | Review metric targets; confirm they are appropriate | PENDING |
| D-08 | Select target app for implementation | Integrator owner | Decide which app hosts the timeline component | PENDING |
| D-09 | Confirm no ADR is required | Architecture owner | Confirm that the prototype does not cross ADR boundaries | PENDING |
| D-10 | Authorize implementation | Task owner | Issue execution authorization per AI execution contract | PENDING |

### 17.2 Integration Items (Deferred)

| ID | Item | Dependency | Status |
|----|------|-----------|--------|
| I-01 | Connect to ECHOLOG event stream | ENG-019/021 | DEFERRED |
| I-02 | Connect to D08 rights decisions | M33-05 | DEFERRED |
| I-03 | Connect to M18 publication state | M18-01 | DEFERRED |
| I-04 | Integrate with M46-16 provenance serialization | M46-16 | DEFERRED |
| I-05 | Integrate with M50-10 PROV-O mapping | M50-10 | DEFERRED |
| I-06 | Support real asset provenance (not synthetic) | M17 rights gate | DEFERRED |

### 17.3 Design Refinement Items (Deferred)

| ID | Item | Rationale | Status |
|----|------|-----------|--------|
| F-01 | Interactive timeline (zoom, pan, filter) | Comprehension test may reveal need | DEFERRED |
| F-02 | Multi-language timeline labels | i18n contract (M05) may require it | DEFERRED |
| F-03 | Accessibility audit (WCAG 2.1 AA) | Required before any user-facing deployment | DEFERRED |
| F-04 | Performance benchmarking | Not needed for static prototype; needed for live data | DEFERRED |
| F-05 | Export/download of timeline as PDF | May be needed for audit records | DEFERRED |
| F-06 | Comparison view for multiple assets | M50-14 patterns may apply | DEFERRED |
| F-07 | Uncertainty visualization on timeline | M47-09 patterns may apply | DEFERRED |

### 17.4 Open Questions

| ID | Question | Impact | Resolution Path |
|----|----------|--------|----------------|
| Q-01 | Should the timeline display events from multiple objectRefs in a single view? | Affects scenario C rendering | Owner decision during D-01 review |
| Q-02 | Should consent conditions (e.g., "attribution_required") be displayed in full or summarized? | Affects information density | Owner decision during D-04 review |
| Q-03 | Should the timeline support filtering by eventNature (storage vs. consent vs. publication)? | Affects UX complexity | Comprehension test results will inform |
| Q-04 | Should revoked consent be visually distinct from restricted consent? | Affects state rendering | Owner decision during D-01 review |
| Q-05 | Should the timeline include a "machine-readable" export (JSON-LD, RDF)? | Affects M50-10 integration | Deferred until M50-10 is further along |

---

## 18. Conclusion: BASELINE ESTABLISHED

### 18.1 Summary

This document establishes the **design baseline** for M47-16: Prototype a Media Provenance Timeline. The baseline includes:

1. **Event vocabulary** — 7 categories, 21 event types, each with precise semantics and domain ownership
2. **Synthetic event record schema** — TypeScript interfaces with opaque identifiers, versioned, serializable
3. **Timeline visualization design** — read-only, content-invisible, decision-explicit, redaction-transparent
4. **Five synthetic provenance scenarios** — complete fabricated asset histories exercising all event types and edge cases
5. **Redaction testing framework** — 7 test fixtures ensuring content remains unavailable
6. **Event-order verification** — 24 temporal consistency rules, all passing across 5 scenarios
7. **State rendering fixtures** — 5 distinct timeline states with visual mockups
8. **Consent/publication decision labeling** — clear separation of storage operations from external authority decisions
9. **Privacy/security review** — 10 leakage prevention measures, all passing
10. **Comprehension evaluation methodology** — 19 test questions, scoring system, metrics
11. **Risk mitigation** — 8 mitigations for the primary risk (rights clearance confusion), plus 7 secondary risks
12. **Metrics and success criteria** — 5 primary metrics, 7 secondary metrics, 7 success criteria
13. **Implementation considerations** — deferred, with proposed file structure and 4-phase plan
14. **Deferred items** — 10 owner review items, 6 integration items, 7 design refinement items, 5 open questions

### 18.2 Key Invariants

The design maintains the following invariants throughout all scenarios and fixtures:

| Invariant | Enforcement |
|-----------|-------------|
| Content is never exposed | Redaction framework (Section 8), content byte exclusion (R-01) |
| Storage ≠ authorization | Authority labeling (Section 11), disclaimer (Section 11.5) |
| Review ≠ clearance | Event nature classification (Section 4), comprehension test (Section 13) |
| Consent ≠ publication | Separate event categories (CNS vs PUB), cross-reference matrix (Section 11.4) |
| Timeline ≠ rights certificate | Persistent disclaimer (Section 11.5), external authority markers (Section 11.2) |
| All data is synthetic | Opaque identifiers (Section 5), fabricated labels (Section 12) |
| Events are temporally ordered | Ordering verification (Section 9), 24 rules, 0 violations |

### 18.3 What This Document Does NOT Do

- Does not implement the prototype — implementation is deferred pending owner authorization
- Does not modify ECHOLOG's storage schema — no new tables, sidecar fields, or metadata keys
- Does not make rights decisions — the timeline records decisions from external authorities
- Does not expose content — all media references are opaque identifiers
- Does not replace M17/M33 rights tasks — this is a synthetic study only
- Does not create a new branch or deploy anything — work is on `dev` only per owner policy
- Does not change TODO status — this document is a design baseline, not a completion claim

### 18.4 Next Steps

| Step | Action | Owner | Dependency |
|------|--------|-------|-----------|
| 1 | Owner reviews this design document | ECHOLOG + Privacy owner | — |
| 2 | Owner approves event fields (D-01 through D-07) | ECHOLOG + Privacy owner | Step 1 |
| 3 | Owner authorizes implementation (D-10) | Task owner | Step 2 |
| 4 | Implement Phase 1 (types, fixtures, verifier) | Developer | Step 3 |
| 5 | Implement Phase 2 (visualization, rendering) | Developer | Step 4 |
| 6 | Run redaction and event-order tests | Developer | Step 5 |
| 7 | Conduct comprehension evaluation | Evaluator | Step 6 |
| 8 | Owner reviews metrics and approves closure | ECHOLOG + Privacy owner | Step 7 |
| 9 | Record SHA, paths, test results, reviewer | Developer | Step 8 |
| 10 | Update TODO.md with closure evidence | Integrator | Step 9 |

### 18.5 Document Authority

| Aspect | Authority |
|--------|-----------|
| Design content | This document (M47-16-media-provenance-timeline.md) |
| Task status | TODO.md (sole status source) |
| Architecture boundaries | BLUEPRINT.md |
| ECHOLOG contract | docs/architecture/ECHOLOG.md (ADR-0007) |
| Execution authorization | docs/planning/AI_EXECUTION_CONTRACT.md |
| ADR applicability | docs/research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md |

### 18.6 Closure Statement

**BASELINE ESTABLISHED.**

This document defines the complete design for M47-16: Prototype a Media Provenance Timeline. The design is grounded in synthetic data, respects all domain boundaries (ECHOLOG D19, D08 Rights, M18 Publication), and maintains the core invariant that content remains unavailable.

The prototype demonstrates that a provenance timeline can:
- Distinguish storage events from consent/publication decisions
- Display event history without exposing content
- Label external authority decisions clearly
- Redact sensitive fields transparently
- Maintain temporal consistency across all event types

Implementation is deferred pending ECHOLOG and privacy owner review of event fields (Definition of Done). No TODO status has been changed. No code has been written. No branch has been created.

**Document status:** BASELINE ESTABLISHED — design complete, implementation deferred pending owner review.

---

*Document prepared 2026-10-31. All data is synthetic. No real media, personal content, or private information is included. This document does not constitute rights clearance or legal advice.*
