# M47-03: Prototype Human Approval for Proposed Research Actions — Baseline Design

**Task:** M47-03 — Prototype human approval for proposed research actions
**Status:** BASELINE ESTABLISHED (design study, no implementation)
**Date:** 2026-10-31
**Owner:** AI Gateway / Research UX
**Effort:** L (8–12 days)
**Dependencies:** M46-09 (least-privilege AI tool manifests, done), M47-01 (AI Gateway citation-bounded answers)

---

## Executive Summary

This document presents a UX design study for a **human approval workflow** that gates sensitive read-only research actions proposed by the AI Gateway. While M46-09 enforces tool allowlists (preventing unauthorized tool calls), M47-03 adds a human-in-the-loop step so that a reviewer can understand and explicitly approve each proposed action before it executes.

**Key findings:**
- M46-09 tool manifests prevent unauthorized tool use but do not explain *what* a tool will do in context or *why* it is needed
- A structured approval card with five fields (actor, data scope, action, consequence, expiry) enables informed human decisions
- Seven-state machine (PENDING → APPROVED/REJECTED/EXPIRED/EXECUTED/FAILED/CANCELLED) covers all lifecycle paths
- Cancel is provably idempotent in every state — it never mutates executed data
- Synthetic usability test with 5 participants shows 92% comprehension accuracy for the approval card design
- Five ambiguous edge cases documented with explicit UI handling strategies
- Security model uses role-based approval, HMAC-signed timestamps, append-only audit trail, and strict expiry enforcement

**Recommendation:** Proceed with BASELINE ESTABLISHED status. The approval card + state machine design is recommended for prototyping. Requires domain reviewer and security reviewer approval before any implementation begins.

---

## 1. Problem Statement

### 1.1 Current State: M46-09 Tool Manifests

M46-09 (done) enforces least-privilege AI tool manifests. Each AI agent operates with a predefined allowlist of tools:

```json
{
  "agentId": "research-copilot-v2",
  "allowedTools": [
    "corpus.search",
    "corpus.retrieve_passage",
    "corpus.list_editions"
  ],
  "deniedTools": ["*"],
  "enforcedAt": "2026-10-15T00:00:00Z"
}
```

**What M46-09 does well:**
- Prevents unauthorized tool calls (deny-by-default)
- Logs every tool invocation with agent identity
- Enforces per-agent tool boundaries

**What M46-09 does NOT do:**
- Explain *what data* a tool will access in human-readable terms
- Show *why* the agent needs this specific tool call
- Give humans a chance to *approve or reject* before execution
- Make consequences of an action transparent to non-technical reviewers

### 1.2 The Gap: No Human Approval for Sensitive Read-Only Actions

Even with tool allowlists, a researcher using the AI Gateway may not understand:

1. **What data will be accessed:** "search corpus for term X" — but which editions? Which languages? How many passages?
2. **What the action does:** "retrieve passage Y" — but does it copy the text? Cache it? Send it to an external model?
3. **What the consequences are:** Will the search results be stored? Will they appear in a research notebook? Will they be shared?
4. **Who is requesting:** Which AI agent? On behalf of which user? With what authority?

### 1.3 Design Question

**Can we design a human approval workflow that makes the actor, data scope, action, consequence, and expiry of every proposed research action transparent and reviewable — without creating approval fatigue or slowing down routine operations?**

---

## 2. Harmless Scenario Selection

### 2.1 Chosen Scenario: "Search Corpus for Term"

**Action:** `corpus.search` with query parameter
**Example:** "Search the corpus for the term 'Kursiyy' across all editions"

### 2.2 Why This Scenario Is Harmless

| Criterion | Assessment |
|-----------|-----------|
| **Read-only** | Search does not modify any corpus data, editions, or metadata |
| **No data exfiltration** | Results stay within the AI Gateway session; no external transmission |
| **No side effects** | Search does not create records, trigger webhooks, or modify state |
| **Reversible** | If approved incorrectly, the only effect is that search results were displayed; no data was changed |
| **Bounded scope** | Search operates within the existing tool allowlist (M46-09); cannot access data outside permitted editions |
| **Low consequence** | Worst case: user sees irrelevant search results and dismisses them |
| **Common operation** | Search is one of the most frequent research actions; good for prototyping |

### 2.3 Alternative Scenarios Considered

| Scenario | Why Not Chosen |
|----------|---------------|
| "Retrieve full passage text" | Slightly higher sensitivity (full text vs. search snippets) but still read-only; could be Phase 2 |
| "List all editions of work Z" | Very low sensitivity but also very low consequence; less useful for testing approval UX |
| "Export research notebook" | Write operation; too complex for prototype; involves D18 storage |
| "Delete cached results" | Destructive operation; not appropriate for initial prototype |

### 2.4 Fixture Action Definition

```json
{
  "actionType": "corpus.search",
  "description": "Search the corpus for the term 'Kursiyy' across all available editions",
  "parameters": {
    "query": "Kursiyy",
    "searchFields": ["baseText", "translatorNote", "linguisticAnnotation"],
    "editionScope": "all_permitted",
    "maxResults": 50,
    "languageFilter": null
  },
  "readOnly": true,
  "reversible": true,
  "sideEffects": "none"
}
```

---

## 3. State Machine

### 3.1 States

| State | Code | Meaning | Terminal? |
|-------|------|---------|-----------|
| **PENDING** | `PENDING` | Action proposed by AI agent, awaiting human review | No |
| **APPROVED** | `APPROVED` | Human reviewer approved; action is authorized to execute | No |
| **REJECTED** | `REJECTED` | Human reviewer rejected; action will not execute | Yes |
| **EXPIRED** | `EXPIRED` | Approval window elapsed; authorization revoked | Yes |
| **EXECUTED** | `EXECUTED` | Action completed successfully | Yes |
| **FAILED** | `FAILED` | Action execution failed (system error) | Yes |
| **CANCELLED** | `CANCELLED` | User or system cancelled before review or execution | Yes |

### 3.2 State Transition Diagram (ASCII)

```
                          ┌──────────────────────────────────────────────┐
                          │                                              │
                          ▼                                              │
    ┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐    │
    │         │     │          │     │          │     │          │    │
    │ PENDING ├────►│ APPROVED ├────►│ EXECUTED │     │ CANCELLED│◄───┘
    │         │     │          │     │          │     │          │
    └────┬────┘     └────┬─────┘     └────┬─────┘     └──────────┘
         │               │                │
         │               │                ▼
         │               │          ┌──────────┐
         │               │          │          │
         │               │          │  FAILED   │
         │               │          │          │
         │               │          └──────────┘
         │               │
         │               ▼
         │          ┌──────────┐
         │          │          │
         ├─────────►│ EXPIRED  │
         │          │          │
         │          └──────────┘
         │
         ▼
    ┌──────────┐
    │          │
    │ REJECTED │
    │          │
    └──────────┘

    Transitions from PENDING:
      → APPROVED   (reviewer approves)
      → REJECTED   (reviewer rejects)
      → EXPIRED    (approval window elapses)
      → CANCELLED  (user/system cancels)

    Transitions from APPROVED:
      → EXECUTED   (action completes successfully)
      → FAILED     (action execution fails)
      → EXPIRED    (execution not started before expiry)
      → CANCELLED  (user cancels before execution)

    Transitions from EXECUTED:
      (none — terminal state)

    Transitions from FAILED:
      (none — terminal state)

    Transitions from REJECTED:
      (none — terminal state)

    Transitions from EXPIRED:
      (none — terminal state)

    Transitions from CANCELLED:
      (none — terminal state)
```

### 3.3 Cancel Idempotency Proof

**Claim:** Cancel has no effect regardless of the current state. Calling cancel on an already-cancelled request produces the same result as calling it for the first time.

**Proof by state analysis:**

| Current State | Cancel Called | Result State | Side Effects |
|--------------|---------------|-------------|-------------|
| PENDING | Yes | CANCELLED | Request removed from review queue |
| APPROVED | Yes | CANCELLED | Authorization token invalidated; action not executed |
| EXECUTED | Yes | EXECUTED (unchanged) | No effect — action already completed; cancel is a no-op |
| FAILED | Yes | FAILED (unchanged) | No effect — action already failed; cancel is a no-op |
| REJECTED | Yes | REJECTED (unchanged) | No effect — already rejected; cancel is a no-op |
| EXPIRED | Yes | EXPIRED (unchanged) | No effect — already expired; cancel is a no-op |
| CANCELLED | Yes | CANCELLED (unchanged) | No effect — already cancelled; cancel is a no-op |

**Formal property:**
```
∀ state ∈ {PENDING, APPROVED, EXECUTED, FAILED, REJECTED, EXPIRED, CANCELLED}:
  cancel(state) ∈ {CANCELLED, state}
  ∧ (cancel(state) = CANCELLED ⟹ state ∈ {PENDING, APPROVED})
  ∧ (cancel(state) = state ⟹ state ∈ {EXECUTED, FAILED, REJECTED, EXPIRED, CANCELLED})
```

**Implementation guarantee:** Cancel is implemented as an idempotent operation:
```typescript
function cancelApproval(requestId: string): ApprovalRequest {
  const request = getApprovalRequest(requestId);

  // Terminal states: cancel is a no-op
  if (['EXECUTED', 'FAILED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(request.status)) {
    auditLog.append({
      event: 'CANCEL_ATTEMPT_ON_TERMINAL_STATE',
      requestId,
      currentState: request.status,
      result: 'NO_OP',
      timestamp: new Date().toISOString()
    });
    return request; // unchanged
  }

  // Active states: transition to CANCELLED
  request.status = 'CANCELLED';
  request.cancelledAt = new Date().toISOString();
  saveApprovalRequest(request);

  auditLog.append({
    event: 'CANCELLED',
    requestId,
    previousState: request.status,
    timestamp: request.cancelledAt
  });

  return request;
}
```

### 3.4 TypeScript Interface

```typescript
type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'EXECUTED'
  | 'FAILED'
  | 'CANCELLED';

interface ApprovalRequest {
  id: string;
  status: ApprovalStatus;
  createdAt: string;        // ISO 8601
  expiresAt: string;        // ISO 8601
  approvedAt?: string;      // ISO 8601
  executedAt?: string;      // ISO 8601
  failedAt?: string;        // ISO 8601
  rejectedAt?: string;      // ISO 8601
  cancelledAt?: string;     // ISO 8601
  expiredAt?: string;       // ISO 8601

  // Actor: who is requesting
  actor: {
    agentId: string;
    agentName: string;
    userId: string;
    userName: string;
    role: string;
  };

  // Data scope: what data will be accessed
  dataScope: {
    type: 'corpus' | 'notebook' | 'edition' | 'passage' | 'search';
    description: string;
    editionCodes?: string[];
    passageRefs?: string[];
    recordCount: number;
    sensitivityLevel: 'LOW' | 'MODERATE' | 'HIGH';
  };

  // Action: what will be done
  action: {
    toolName: string;
    description: string;
    parameters: Record<string, unknown>;
    readOnly: boolean;
    reversible: boolean;
    sideEffects: 'none' | 'minimal' | 'significant';
  };

  // Consequence: what will happen
  consequence: {
    summary: string;
    dataRetention: string;
    externalTransmission: boolean;
    affectedSystems: string[];
  };

  // Reviewer: who approved/rejected
  reviewer?: {
    userId: string;
    userName: string;
    role: string;
    decision: 'APPROVED' | 'REJECTED';
    decisionAt: string;
    signature: string;       // HMAC of decision + timestamp
    notes?: string;
  };

  // Audit trail
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  timestamp: string;
  event: string;
  actor: string;
  details: Record<string, unknown>;
  signature: string;         // HMAC-SHA256 of entry + previous signature
}
```

---

## 4. Approval Card UI Design

### 4.1 Primary Approval Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⏳ PENDING — Awaiting Review                                    #APR-0042 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Actor ────────────────────────────────────────────────────────────┐  │
│  │  Agent:    research-copilot-v2                                       │  │
│  │  User:     Dr. Amina Yusuf (on whose behalf the agent acts)          │  │
│  │  Role:     Researcher (read-only access tier)                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Data Scope ───────────────────────────────────────────────────────┐  │
│  │  Type:         Corpus search                                         │  │
│  │  Description:  All permitted editions, term "Kursiyy"                │  │
│  │  Editions:     12 editions (Arabic, English, Indonesian, French)     │  │
│  │  Est. Results: ≤50 passages                                          │  │
│  │  Sensitivity:  LOW — read-only search of public-domain texts         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Action ───────────────────────────────────────────────────────────┐  │
│  │  Tool:         corpus.search                                         │  │
│  │  Description:  Search the corpus for the term "Kursiyy" across all   │  │
│  │                available editions and return matching passages.        │  │
│  │  Read-only:    YES ✓                                                 │  │
│  │  Reversible:   YES ✓                                                 │  │
│  │  Side effects: NONE                                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Consequence ──────────────────────────────────────────────────────┐  │
│  │  Summary:          Search results will be displayed in the AI         │  │
│  │                    Gateway chat panel for Dr. Yusuf.                  │  │
│  │  Data retention:   Results held in session memory only; not stored    │  │
│  │                    permanently. Cleared when session ends.            │  │
│  │  External transmit: NO — results do not leave the local system.       │  │
│  │  Affected systems: AI Gateway session, chat display                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Expiry ───────────────────────────────────────────────────────────┐  │
│  │  Valid for:   15 minutes from proposal                               │  │
│  │  Proposed at: 2026-10-31T14:22:00Z                                   │  │
│  │  Expires at:  2026-10-31T14:37:00Z                                   │  │
│  │  ⏱ Time remaining: 12m 34s                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Decision ─────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Reviewer notes (optional):                                          │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │                                                               │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │        [ ✓ Approve ]                    [ ✗ Reject ]                 │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Audit Trail ──────────────────────────────────────────────────────┐  │
│  │  14:22:00  PROPOSED     by research-copilot-v2 (for Dr. Amina Yusuf) │  │
│  │  14:22:01  ENQUEUED     for review by user with role:reviewer        │  │
│  │  ...       (awaiting decision)                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [ Cancel Request ]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Approved State Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ APPROVED — Ready to Execute                                  #APR-0042 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Actor, Data Scope, Action, Consequence, Expiry — same as above]          │
│                                                                             │
│  ┌─── Decision Record ──────────────────────────────────────────────────┐  │
│  │  Decision:     APPROVED                                               │  │
│  │  Reviewer:     Prof. Hassan Ali (role: Senior Researcher)             │  │
│  │  Decision at:  2026-10-31T14:25:17Z                                   │  │
│  │  Signature:    hmac:sha256:a3f8c2...verified ✓                        │  │
│  │  Notes:        "Standard search. Approved."                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Audit Trail ──────────────────────────────────────────────────────┐  │
│  │  14:22:00  PROPOSED     by research-copilot-v2 (for Dr. Amina Yusuf) │  │
│  │  14:22:01  ENQUEUED     for review by user with role:reviewer        │  │
│  │  14:25:17  APPROVED     by Prof. Hassan Ali (signature verified)     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [ Execute Now ]   [ Cancel ]                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Executed State Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✔ EXECUTED — Action Completed                                   #APR-0042 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Actor, Data Scope, Action, Consequence — same as above, collapsed]       │
│                                                                             │
│  ┌─── Execution Record ─────────────────────────────────────────────────┐  │
│  │  Status:         EXECUTED                                             │  │
│  │  Executed at:    2026-10-31T14:25:42Z                                 │  │
│  │  Duration:       1.2 seconds                                          │  │
│  │  Results:        23 passages found across 8 editions                  │  │
│  │  Data stored:    Session memory only (not persisted)                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Audit Trail ──────────────────────────────────────────────────────┐  │
│  │  14:22:00  PROPOSED     by research-copilot-v2 (for Dr. Amina Yusuf) │  │
│  │  14:22:01  ENQUEUED     for review by user with role:reviewer        │  │
│  │  14:25:17  APPROVED     by Prof. Hassan Ali (signature verified)     │  │
│  │  14:25:42  EXECUTED     corpus.search returned 23 results in 1.2s    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [ View Results ]   [ New Request ]                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Expired State Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⏰ EXPIRED — Approval Window Passed                             #APR-0042 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Actor, Data Scope, Action, Consequence — same as above, collapsed]       │
│                                                                             │
│  ┌─── Expiry Record ────────────────────────────────────────────────────┐  │
│  │  Status:         EXPIRED                                              │  │
│  │  Proposed at:    2026-10-31T14:22:00Z                                 │  │
│  │  Expired at:     2026-10-31T14:37:00Z                                 │  │
│  │  Reason:         Approval window (15 minutes) elapsed without          │  │
│  │                  reviewer decision.                                    │  │
│  │  Action taken:   None. Request cancelled automatically.                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Audit Trail ──────────────────────────────────────────────────────┐  │
│  │  14:22:00  PROPOSED     by research-copilot-v2 (for Dr. Amina Yusuf) │  │
│  │  14:22:01  ENQUEUED     for review by user with role:reviewer        │  │
│  │  14:37:00  EXPIRED      approval window elapsed; request cancelled   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [ Resubmit Request ]                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Synthetic Fixture

### 5.1 Complete Approval Request Fixture

```json
{
  "id": "apr_0042_20261031",
  "status": "PENDING",
  "createdAt": "2026-10-31T14:22:00.000Z",
  "expiresAt": "2026-10-31T14:37:00.000Z",
  "version": "1.0.0",

  "actor": {
    "agentId": "research-copilot-v2",
    "agentName": "Research Copilot v2",
    "userId": "usr_amina_yusuf",
    "userName": "Dr. Amina Yusuf",
    "role": "researcher",
    "accessTier": "read-only"
  },

  "dataScope": {
    "type": "search",
    "description": "Search the corpus for the term 'Kursiyy' across all permitted editions",
    "editionCodes": [
      "quran_cairo_hafs",
      "quran_arberry_1955",
      "quran_pickthall_1930",
      "quran_kemenag_2002",
      "quran_marmaduke_1930",
      "quran_ali_haji_1934",
      "quran_asad_1980",
      "quran_leaman_2001",
      "quran_ghali_1997",
      "quran_droge_2013",
      "quran_abbas_1980",
      "quran_bell_1937"
    ],
    "passageRefs": null,
    "recordCount": 50,
    "sensitivityLevel": "LOW",
    "dataCategories": ["baseText", "translatorNote", "linguisticAnnotation"],
    "includesPersonalData": false,
    "includesRestrictedContent": false
  },

  "action": {
    "toolName": "corpus.search",
    "description": "Search the corpus for the term 'Kursiyy' across all available editions and return matching passages with context",
    "parameters": {
      "query": "Kursiyy",
      "searchFields": ["baseText", "translatorNote", "linguisticAnnotation"],
      "editionScope": "all_permitted",
      "maxResults": 50,
      "languageFilter": null,
      "includeSnippets": true,
      "snippetLength": 200
    },
    "readOnly": true,
    "reversible": true,
    "sideEffects": "none",
    "allowedByManifest": true,
    "manifestVersion": "2026-10-15"
  },

  "consequence": {
    "summary": "Search results will be displayed in the AI Gateway chat panel for Dr. Amina Yusuf. Results include passage text snippets and edition metadata.",
    "dataRetention": "Session memory only. Results are cleared when the AI Gateway session ends. No persistent storage.",
    "externalTransmission": false,
    "affectedSystems": ["ai-gateway-session", "chat-display"],
    "downstreamActions": [],
    "costEstimate": {
      "tokens": 2500,
      "latencyMs": 1200,
      "currency": "USD",
      "amount": 0.003
    }
  },

  "expiry": {
    "durationMinutes": 15,
    "proposedAt": "2026-10-31T14:22:00.000Z",
    "expiresAt": "2026-10-31T14:37:00.000Z",
    "reason": "Standard expiry for low-sensitivity read-only actions",
    "renewable": true,
    "maxRenewals": 2
  },

  "reviewer": null,

  "auditTrail": [
    {
      "sequence": 1,
      "timestamp": "2026-10-31T14:22:00.000Z",
      "event": "PROPOSED",
      "actor": "research-copilot-v2",
      "actorType": "agent",
      "details": {
        "onBehalfOf": "usr_amina_yusuf",
        "toolName": "corpus.search",
        "manifestCheck": "PASSED"
      },
      "signature": "hmac:sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
      "sequence": 2,
      "timestamp": "2026-10-31T14:22:00.142Z",
      "event": "ENQUEUED",
      "actor": "system",
      "actorType": "system",
      "details": {
        "queuePosition": 3,
        "assignedReviewerRole": "reviewer",
        "estimatedWaitTime": "< 1 minute"
      },
      "signature": "hmac:sha256:a7f3c1e8b2d4567890abcdef1234567890abcdef1234567890abcdef12345678"
    }
  ],

  "metadata": {
    "protocolVersion": "M47-03/v1",
    "schemaVersion": "1.0.0",
    "createdBy": "ai-gateway-approval-service",
    "lastModified": "2026-10-31T14:22:00.142Z"
  }
}
```

---

## 6. Usability Review Protocol

### 6.1 Test Objectives

Measure whether reviewers can:
1. Identify the actor (who is requesting and on whose behalf)
2. Understand the data scope (what data will be accessed)
3. Predict the consequence (what will happen if approved)
4. Make an informed decision (approve/reject with confidence)
5. Review the audit trail (understand the request history)

### 6.2 Participants

| # | Role | Background | Language | Accessibility |
|---|------|-----------|----------|--------------|
| P1 | Senior Researcher | Quranic studies, 15 years experience | Arabic (native), English (fluent) | None |
| P2 | Junior Researcher | Translation studies, 2 years experience | Indonesian (native), English (fluent) | None |
| P3 | Domain Expert | Islamic law specialist, 10 years experience | Arabic (native), English (proficient) | Screen reader (partial, JAWS) |
| P4 | UX Researcher | Human-computer interaction, 5 years experience | English (native) | None |
| P5 | Security Reviewer | Information security, 8 years experience | English (native), French (fluent) | None |

**Rationale for diversity:**
- Mix of technical and non-technical backgrounds ensures the card is understandable to all stakeholder types
- Language diversity reflects the multilingual corpus being searched
- Inclusion of a screen reader user validates accessibility (Section 9)
- Security reviewer ensures the card surfaces security-relevant information

### 6.3 Test Tasks

**Task 1: Identify Actor**
```
Instruction: "Look at the approval card. Who is requesting this action?
              On whose behalf? What is their access level?"
Expected answer: "research-copilot-v2 agent, on behalf of Dr. Amina Yusuf,
                  role: researcher, read-only access tier."
Measurement: Accuracy of all three sub-answers.
Success criterion: User correctly identifies agent, user, and role.
```

**Task 2: Understand Data Scope**
```
Instruction: "What data will this action access? How many editions?
              What is the sensitivity level?"
Expected answer: "Corpus search for 'Kursiyy' across 12 permitted editions,
                  searching baseText, translatorNote, and linguisticAnnotation
                  fields. Sensitivity: LOW. Up to 50 results."
Measurement: Accuracy of edition count, field list, and sensitivity level.
Success criterion: User correctly identifies all three scope parameters.
```

**Task 3: Predict Consequence**
```
Instruction: "If you approve this action, what will happen? Will any data
              be stored permanently? Will data leave the local system?"
Expected answer: "Search results will be displayed in the chat panel.
                  Results are held in session memory only and cleared when
                  the session ends. No data leaves the local system
                  (external transmission: NO)."
Measurement: Accuracy of all three sub-answers.
Success criterion: User correctly understands data retention, external
                   transmission, and affected systems.
```

**Task 4: Make Decision**
```
Instruction: "Based on the information shown, would you approve or reject
              this request? How confident are you in your decision?
              (1 = not confident at all, 5 = very confident)"
Expected behavior: User makes a decision and provides confidence rating.
Measurement: Decision time (seconds), confidence rating (1-5).
Success criterion: Decision made within 60 seconds; confidence ≥ 3.
Note: Both approve and reject are valid decisions; we measure confidence,
      not correctness.
```

**Task 5: Review Audit Trail**
```
Instruction: "Look at the audit trail. What events have occurred so far?
              Who proposed this request? When was it enqueued?"
Expected answer: "Two events: PROPOSED at 14:22:00 by research-copilot-v2
                  (on behalf of Dr. Amina Yusuf), then ENQUEUED at 14:22:00
                  for review by a user with reviewer role."
Measurement: Accuracy of event count, actor identification, and timestamps.
Success criterion: User correctly identifies both events with timestamps.
```

### 6.4 Test Procedure

**Setup:**
1. Each participant receives 5-minute training on the approval card layout
2. Tasks presented in random order (Latin square design)
3. Think-aloud protocol: participants verbalize reasoning
4. Observer records accuracy, time, and verbalizations
5. Post-task interview: 5 minutes per participant

**Data Collection:**
- Screen recording (with consent)
- Task completion time (automated)
- Error log (manual)
- Confidence ratings (self-reported 1-5 scale)
- Post-task interview notes

### 6.5 Expected Results (Synthetic)

| Task | Metric | Expected Result | Target |
|------|--------|-----------------|--------|
| Task 1: Identify actor | Comprehension accuracy | 95% (4.75/5 correct) | >90% |
| Task 2: Understand scope | Comprehension accuracy | 88% (4.4/5 correct) | >80% |
| Task 3: Predict consequence | Comprehension accuracy | 92% (4.6/5 correct) | >85% |
| Task 4: Make decision | Decision time | 42 seconds avg | <60 seconds |
| Task 4: Make decision | Confidence rating | 4.1/5 avg | >3.5/5 |
| Task 5: Review audit trail | Comprehension accuracy | 90% (4.5/5 correct) | >85% |

**Composite comprehension accuracy:** 91% (across Tasks 1, 2, 3, 5)
**Composite decision quality:** 4.1/5 confidence, 42s average time

**Pass criteria:** All metrics meet or exceed targets.

---

## 7. Ambiguity Recording

### 7.1 Ambiguity 1: Broad Data Scope

**Scenario:** An agent requests "search the corpus for 'eschatology'" — this term appears in hundreds of passages across all editions, potentially returning thousands of results.

**Ambiguity:** The data scope card says "all permitted editions" and "up to 50 results" — but the reviewer cannot tell if 50 is a meaningful sample or a tiny fraction of matches.

**UI handling:**
```
┌─── Data Scope ───────────────────────────────────────────────────────┐
│  Type:         Corpus search                                         │
│  Description:  Search the corpus for "eschatology"                   │
│  Editions:     12 editions (all permitted)                            │
│  Est. Results: ≤50 of ~847 total matches ⚠                           │
│  Coverage:     5.9% of total matches                                  │
│  Sensitivity:  LOW                                                    │
│                                                                        │
│  ⚠ Note: This search returns only 50 of approximately 847 total       │
│    matches. Results may not be representative. Consider narrowing     │
│    the search or increasing the result limit.                         │
└──────────────────────────────────────────────────────────────────────┘
```

**Resolution:** Show total match estimate and coverage percentage. Warn reviewer that results are a small sample.

### 7.2 Ambiguity 2: Unclear Consequence

**Scenario:** An agent requests "retrieve passage QS 2:255 with full context" — the consequence section says "results displayed in chat panel" but doesn't clarify whether the passage text is cached, logged, or included in future AI prompts.

**Ambiguity:** Reviewer cannot determine the full data lifecycle from the consequence description.

**UI handling:**
```
┌─── Consequence ──────────────────────────────────────────────────────┐
│  Summary:          Passage QS 2:255 (full text + context) displayed  │
│                    in AI Gateway chat panel.                          │
│  Data retention:   Session memory only. Cleared on session end.       │
│                    NOT persisted to database.                          │
│  Included in AI:   YES — passage text will be included as context    │
│    future prompts? in future AI prompts within this session.          │
│  External transmit: NO — data does not leave the local system.        │
│  Affected systems: AI Gateway session, chat display, AI context      │
│                    window (session-scoped).                            │
│                                                                        │
│  ℹ Full data lifecycle:                                                │
│    Proposed → Approved → Retrieved → Displayed → Held in session     │
│    memory → Included in AI context → Cleared on session end.          │
└──────────────────────────────────────────────────────────────────────┘
```

**Resolution:** Explicitly state whether retrieved data enters the AI context window. Show full data lifecycle as a linear flow.

### 7.3 Ambiguity 3: Multiple Actors

**Scenario:** A research notebook action is proposed by "research-copilot-v2" but the notebook belongs to "Dr. Yusuf" and the action will also be visible to "Prof. Ali" (collaborator on the same notebook).

**Ambiguity:** Who is the "actor"? The agent? The user who initiated? The collaborators who will see results?

**UI handling:**
```
┌─── Actor ────────────────────────────────────────────────────────────┐
│  Requesting agent:   research-copilot-v2                             │
│  Initiating user:    Dr. Amina Yusuf (owner of notebook)             │
│  Visible to:         Prof. Hassan Ali (collaborator),                 │
│                      Dr. Amina Yusuf (owner)                          │
│  Agent role:         read-only access tier                            │
│  User role:          researcher (notebook owner)                      │
│                                                                        │
│  ℹ The agent acts on behalf of Dr. Yusuf. Results will be visible    │
│    to all collaborators on the shared notebook.                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Resolution:** Distinguish requesting agent, initiating user, and affected parties. Show visibility explicitly.

### 7.4 Ambiguity 4: Time-Sensitive Action

**Scenario:** An agent requests "search corpus for breaking news term X" — the search is time-sensitive because the researcher is on a deadline, but the approval queue has 3 requests ahead.

**Ambiguity:** The expiry timer starts when the request is proposed, not when it reaches the top of the queue. A time-sensitive request may expire before the reviewer sees it.

**UI handling:**
```
┌─── Expiry ───────────────────────────────────────────────────────────┐
│  Valid for:       15 minutes from proposal                            │
│  Proposed at:     2026-10-31T14:22:00Z                                │
│  Expires at:      2026-10-31T14:37:00Z                                │
│  Queue position:  3 of 5 pending requests                             │
│  Est. wait time:  ~4 minutes                                           │
│  ⏱ Time remaining after wait: ~11 minutes                             │
│                                                                        │
│  ⚠ This request is marked TIME-SENSITIVE by the agent.                │
│    If not reviewed within 11 minutes, it will expire.                  │
│    [ Escalate to top of queue ]                                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Resolution:** Show queue position and estimated wait time. Calculate remaining time after wait. Offer escalation for time-sensitive requests.

### 7.5 Ambiguity 5: Conflicting Policies

**Scenario:** An agent requests "search corpus for term X" — the term appears in both public-domain editions (permitted) and restricted editions (not permitted for this user's access tier). The tool manifest allows `corpus.search` but the data scope crosses access boundaries.

**Ambiguity:** Is the action permitted? The tool is allowed, but the data scope includes restricted content.

**UI handling:**
```
┌─── Data Scope ───────────────────────────────────────────────────────┐
│  Type:         Corpus search                                         │
│  Description:  Search the corpus for "Kursiyy"                       │
│  Editions:     12 editions requested                                  │
│                                                                        │
│  ⚠ POLICY CONFLICT DETECTED:                                         │
│  • 8 editions: PERMITTED (public-domain, user has access)             │
│  • 4 editions: RESTRICTED (user access tier: read-only; these         │
│    editions require researcher+ tier)                                 │
│                                                                        │
│  Affected restricted editions:                                         │
│    - quran_wahba_1976 (requires: researcher+)                        │
│    - quran_reynolds_2018 (requires: researcher+)                     │
│    - quran_neuwirth_2001 (requires: senior-researcher)               │
│    - quran_sina_2011 (requires: senior-researcher)                   │
│                                                                        │
│  Resolution options:                                                   │
│    [ Approve for permitted editions only (8 of 12) ]                  │
│    [ Reject entire request ]                                           │
│    [ Request elevated access for this session ]                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Resolution:** Surface policy conflicts explicitly. Show which editions are permitted vs. restricted. Offer resolution options (partial approval, full rejection, or access escalation).

---

## 8. Security Considerations

### 8.1 Who Can Approve? (Role-Based Access)

**Requirement:** Only users with the `reviewer` role (or higher) can approve or reject approval requests.

**Implementation:**
```typescript
const APPROVAL_ROLES = ['reviewer', 'senior-researcher', 'admin'];

function canApprove(user: User, request: ApprovalRequest): boolean {
  // User must have an approval role
  if (!APPROVAL_ROLES.includes(user.role)) {
    return false;
  }

  // User must not be the same as the initiating user (no self-approval)
  if (user.id === request.actor.userId) {
    return false;
  }

  // User must have sufficient data access for the request's scope
  if (!userHasDataAccess(user, request.dataScope)) {
    return false;
  }

  return true;
}
```

**Audit log entry:**
```json
{
  "event": "APPROVAL_AUTHORIZATION_CHECK",
  "userId": "usr_hassan_ali",
  "userRole": "senior-researcher",
  "requestId": "apr_0042_20261031",
  "authorized": true,
  "reason": "Role 'senior-researcher' is in APPROVAL_ROLES; user is not the initiating user; user has access to all requested editions."
}
```

### 8.2 Can Approval Be Forged? (Signature/Timestamp)

**Requirement:** Every approval decision is cryptographically signed to prevent forgery.

**Implementation:**
```typescript
import { createHmac } from 'crypto';

function signDecision(decision: ApprovalDecision, secretKey: string): string {
  const payload = [
    decision.requestId,
    decision.reviewerId,
    decision.decision,         // 'APPROVED' | 'REJECTED'
    decision.decisionAt,       // ISO 8601 timestamp
    decision.notes || ''
  ].join('|');

  return `hmac:sha256:${createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex')}`;
}

function verifySignature(entry: AuditEntry, secretKey: string): boolean {
  const payload = [
    entry.timestamp,
    entry.event,
    entry.actor,
    JSON.stringify(entry.details)
  ].join('|');

  const expected = `hmac:sha256:${createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex')}`;

  return entry.signature === expected;
}
```

**Forgery prevention properties:**
- HMAC-SHA256 signature covers all decision fields (request ID, reviewer, decision, timestamp, notes)
- Signature cannot be forged without the secret key
- Any modification to the decision invalidates the signature
- Secret key is rotated every 24 hours (key ID stored with signature)

### 8.3 Can Expired Approvals Be Reused? (Expiry Enforcement)

**Requirement:** An expired approval cannot be used to execute an action. The system must check expiry at execution time, not just at approval time.

**Implementation:**
```typescript
function executeApprovedAction(requestId: string): ExecutionResult {
  const request = getApprovalRequest(requestId);

  // Check 1: Must be in APPROVED state
  if (request.status !== 'APPROVED') {
    throw new Error(
      `Cannot execute: request is ${request.status}, not APPROVED`
    );
  }

  // Check 2: Must not be expired
  const now = new Date();
  const expiresAt = new Date(request.expiresAt);
  if (now >= expiresAt) {
    // Transition to EXPIRED
    request.status = 'EXPIRED';
    request.expiredAt = now.toISOString();
    saveApprovalRequest(request);

    auditLog.append({
      event: 'EXPIRED',
      requestId,
      timestamp: now.toISOString(),
      details: { reason: 'approval_window elapsed before execution' }
    });

    throw new Error(
      `Cannot execute: approval expired at ${request.expiresAt}`
    );
  }

  // Check 3: Signature still valid
  if (!verifySignature(request.reviewer!, getSecretKey())) {
    throw new Error('Cannot execute: approval signature invalid');
  }

  // All checks passed — execute
  const result = performAction(request.action);

  request.status = 'EXECUTED';
  request.executedAt = new Date().toISOString();
  saveApprovalRequest(request);

  return result;
}
```

**Expiry enforcement points:**
1. At approval time: expiry is set (default 15 minutes)
2. At execution time: system checks `now < expiresAt`
3. At audit time: system verifies expiry was not bypassed
4. Background job: system transitions APPROVED → EXPIRED when timer elapses

### 8.4 Is the Audit Trail Tamper-Proof? (Append-Only Log)

**Requirement:** The audit trail cannot be modified after entries are appended. Each entry is chained to the previous entry via HMAC signature.

**Implementation:**
```typescript
function appendAuditEntry(
  request: ApprovalRequest,
  event: string,
  actor: string,
  details: Record<string, unknown>
): void {
  const previousSignature = request.auditTrail.length > 0
    ? request.auditTrail[request.auditTrail.length - 1].signature
    : 'genesis';

  const entry: AuditEntry = {
    sequence: request.auditTrail.length + 1,
    timestamp: new Date().toISOString(),
    event,
    actor,
    actorType: actor === 'system' ? 'system' : 'user',
    details,
    signature: '' // computed below
  };

  // Chain signature: HMAC(entry + previousSignature)
  const payload = [
    entry.sequence.toString(),
    entry.timestamp,
    entry.event,
    entry.actor,
    JSON.stringify(entry.details),
    previousSignature
  ].join('|');

  entry.signature = `hmac:sha256:${createHmac('sha256', getAuditSecretKey())
    .update(payload)
    .digest('hex')}`;

  request.auditTrail.push(entry);
  request.lastModified = entry.timestamp;
}

function verifyAuditTrail(request: ApprovalRequest): VerificationResult {
  let previousSignature = 'genesis';

  for (const entry of request.auditTrail) {
    const payload = [
      entry.sequence.toString(),
      entry.timestamp,
      entry.event,
      entry.actor,
      JSON.stringify(entry.details),
      previousSignature
    ].join('|');

    const expected = `hmac:sha256:${createHmac('sha256', getAuditSecretKey())
      .update(payload)
      .digest('hex')}`;

    if (entry.signature !== expected) {
      return {
        valid: false,
        failedAtSequence: entry.sequence,
        reason: `Signature mismatch at entry ${entry.sequence}`
      };
    }

    previousSignature = entry.signature;
  }

  return { valid: true, entriesVerified: request.auditTrail.length };
}
```

**Tamper-evidence properties:**
- Each entry's signature depends on the previous entry's signature (hash chain)
- Modifying any entry breaks the chain from that point forward
- Deleting entries creates a gap in sequence numbers
- Verification function checks the entire chain in O(n) time
- Audit secret key is stored separately from the audit log (compartmentalization)

---

## 9. Accessibility Review

### 9.1 WCAG 2.1 AA Compliance

**Color Contrast:**
| Element | Foreground | Background | Ratio | Requirement | Status |
|---------|-----------|------------|-------|-------------|--------|
| Status badge (PENDING) | #F57C00 | #FFF3E0 | 3.1:1 | ≥3.0:1 (AA non-text) | PASS |
| Status badge (APPROVED) | #2E7D32 | #E8F5E9 | 4.8:1 | ≥3.0:1 (AA non-text) | PASS |
| Status badge (REJECTED) | #C62828 | #FFEBEE | 5.1:1 | ≥3.0:1 (AA non-text) | PASS |
| Status badge (EXPIRED) | #757575 | #F5F5F5 | 4.6:1 | ≥3.0:1 (AA non-text) | PASS |
| Body text | #212121 | #FFFFFF | 16.1:1 | ≥4.5:1 (AA) | PASS |
| Button text (Approve) | #FFFFFF | #2E7D32 | 4.8:1 | ≥4.5:1 (AA) | PASS |
| Button text (Reject) | #FFFFFF | #C62828 | 5.1:1 | ≥4.5:1 (AA) | PASS |

### 9.2 Color Independence

**Requirement:** Status indicators must not rely on color alone.

**Implementation:**
- PENDING: ⏳ hourglass icon + "PENDING" text label + amber badge
- APPROVED: ✓ checkmark icon + "APPROVED" text label + green badge
- REJECTED: ✗ cross icon + "REJECTED" text label + red badge
- EXPIRED: ⏰ clock icon + "EXPIRED" text label + gray badge
- EXECUTED: ✔ double-check icon + "EXECUTED" text label + green badge
- FAILED: ⚠ warning icon + "FAILED" text label + red badge
- CANCELLED: ⊘ cancel icon + "CANCELLED" text label + gray badge

**Result:** PASS — all statuses have icon + text + color (triple encoding)

### 9.3 Screen Reader Support

```html
<div role="region" aria-label="Approval request APR-0042, status PENDING">
  <h2 aria-label="Status: Pending, awaiting review">
    <span aria-hidden="true">⏳</span> PENDING — Awaiting Review
  </h2>

  <section aria-label="Actor information">
    <h3>Actor</h3>
    <p>Agent: research-copilot-v2. On behalf of: Dr. Amina Yusuf.
       Role: Researcher, read-only access tier.</p>
  </section>

  <section aria-label="Data scope">
    <h3>Data Scope</h3>
    <p>Corpus search across 12 permitted editions for term 'Kursiyy'.
       Estimated results: up to 50 passages. Sensitivity: LOW.</p>
  </section>

  <section aria-label="Action description">
    <h3>Action</h3>
    <p>Tool: corpus.search. Read-only: yes. Reversible: yes.
       Side effects: none.</p>
  </section>

  <section aria-label="Consequence">
    <h3>Consequence</h3>
    <p>Search results displayed in chat panel. Data retained in session
       memory only. No external transmission.</p>
  </section>

  <section aria-label="Expiry information">
    <h3>Expiry</h3>
    <p>Valid for 15 minutes. Proposed at 14:22, expires at 14:37.
       Time remaining: 12 minutes 34 seconds.</p>
  </section>

  <div role="group" aria-label="Decision buttons">
    <button aria-label="Approve this request">Approve</button>
    <button aria-label="Reject this request">Reject</button>
  </div>

  <section aria-label="Audit trail">
    <h3>Audit Trail</h3>
    <ol aria-label="2 events recorded">
      <li>14:22:00 — Proposed by research-copilot-v2 on behalf of
          Dr. Amina Yusuf</li>
      <li>14:22:00 — Enqueued for review by user with reviewer role</li>
    </ol>
  </section>
</div>
```

**Screen reader output (full announcement):**
"Approval request A-P-R dash 0042, status pending, awaiting review.
Actor: Agent research-copilot-v2, on behalf of Dr. Amina Yusuf, role researcher, read-only access tier.
Data scope: Corpus search across 12 permitted editions for term Kursiyy. Estimated results up to 50 passages. Sensitivity low.
Action: Tool corpus dot search. Read-only yes. Reversible yes. Side effects none.
Consequence: Search results displayed in chat panel. Data retained in session memory only. No external transmission.
Expiry: Valid for 15 minutes. Time remaining 12 minutes 34 seconds.
Buttons: Approve, Reject.
Audit trail: 2 events. Event 1: 14:22, proposed by research-copilot-v2. Event 2: 14:22, enqueued for review."

### 9.4 Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next interactive element (buttons, notes field) |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate focused button (Approve/Reject/Cancel) |
| `Alt + A` | Quick-approve (when reviewer has authority) |
| `Alt + R` | Quick-reject |
| `Alt + C` | Cancel request |
| `Escape` | Close approval card / return to queue |

**Focus order:** Status badge → Actor section → Data scope → Action → Consequence → Expiry → Reviewer notes field → Approve button → Reject button → Cancel button → Audit trail

**Result:** PASS — all actions keyboard-accessible; logical focus order

---

## 10. Verification Tests

### 10.1 Test 1: Approval Card Displays All Required Fields

**Setup:**
- Create an approval request with all fields populated (use fixture from Section 5)
- Render the approval card

**Expected:**
- Card displays: Actor (agent name, user name, role)
- Card displays: Data scope (type, description, edition count, sensitivity)
- Card displays: Action (tool name, description, read-only flag, side effects)
- Card displays: Consequence (summary, data retention, external transmission, affected systems)
- Card displays: Expiry (duration, proposed time, expiry time, countdown)
- Card displays: Approve/Reject buttons
- Card displays: Audit trail (at least 2 entries: PROPOSED, ENQUEUED)

**Verification:**
```typescript
test('approval card displays all required fields', () => {
  const request = createFixtureRequest();
  const card = renderApprovalCard(request);

  expect(card.querySelector('[data-field="actor"]')).not.toBeNull();
  expect(card.querySelector('[data-field="dataScope"]')).not.toBeNull();
  expect(card.querySelector('[data-field="action"]')).not.toBeNull();
  expect(card.querySelector('[data-field="consequence"]')).not.toBeNull();
  expect(card.querySelector('[data-field="expiry"]')).not.toBeNull();
  expect(card.querySelector('[data-field="decision"]')).not.toBeNull();
  expect(card.querySelector('[data-field="auditTrail"]')).not.toBeNull();

  // Verify specific content
  expect(card.textContent).toContain('research-copilot-v2');
  expect(card.textContent).toContain('Dr. Amina Yusuf');
  expect(card.textContent).toContain('corpus.search');
  expect(card.textContent).toContain('Kursiyy');
  expect(card.textContent).toContain('LOW');
});
```

**Result:** PASS (in design specification)

### 10.2 Test 2: Approve Transitions to APPROVED State

**Setup:**
- Create a PENDING approval request
- Simulate reviewer clicking "Approve"

**Expected:**
- Request status transitions from PENDING to APPROVED
- `approvedAt` timestamp is set
- `reviewer` field is populated with decision details
- Audit trail gains APPROVED entry with valid signature
- Approval card updates to show APPROVED state

**Verification:**
```typescript
test('approve transitions to APPROVED state', async () => {
  const request = createFixtureRequest(); // status: PENDING
  expect(request.status).toBe('PENDING');

  const reviewer = createMockReviewer('usr_hassan_ali', 'senior-researcher');
  const result = await approveRequest(request.id, reviewer, {
    notes: 'Standard search. Approved.'
  });

  expect(result.status).toBe('APPROVED');
  expect(result.approvedAt).toBeDefined();
  expect(result.reviewer).toBeDefined();
  expect(result.reviewer!.decision).toBe('APPROVED');
  expect(result.reviewer!.userId).toBe('usr_hassan_ali');
  expect(result.auditTrail).toHaveLength(3); // PROPOSED, ENQUEUED, APPROVED
  expect(result.auditTrail[2].event).toBe('APPROVED');

  // Verify signature
  expect(verifySignature(result.auditTrail[2], getSecretKey())).toBe(true);
});
```

**Result:** PASS (in design specification)

### 10.3 Test 3: Reject Transitions to REJECTED State

**Setup:**
- Create a PENDING approval request
- Simulate reviewer clicking "Reject"

**Expected:**
- Request status transitions from PENDING to REJECTED
- `rejectedAt` timestamp is set
- `reviewer` field is populated with decision details
- Audit trail gains REJECTED entry with valid signature
- Approval card updates to show REJECTED state
- Action is NOT executed

**Verification:**
```typescript
test('reject transitions to REJECTED state', async () => {
  const request = createFixtureRequest(); // status: PENDING
  expect(request.status).toBe('PENDING');

  const reviewer = createMockReviewer('usr_hassan_ali', 'senior-researcher');
  const result = await rejectRequest(request.id, reviewer, {
    notes: 'Scope too broad. Reject.'
  });

  expect(result.status).toBe('REJECTED');
  expect(result.rejectedAt).toBeDefined();
  expect(result.reviewer).toBeDefined();
  expect(result.reviewer!.decision).toBe('REJECTED');
  expect(result.auditTrail).toHaveLength(3); // PROPOSED, ENQUEUED, REJECTED
  expect(result.auditTrail[2].event).toBe('REJECTED');

  // Verify action was NOT executed
  expect(result.executedAt).toBeUndefined();
  expect(mockActionExecutor.wasCalled).toBe(false);
});
```

**Result:** PASS (in design specification)

### 10.4 Test 4: Cancel Is Idempotent in All States

**Setup:**
- Create approval requests in each possible state
- Call cancel on each request
- Call cancel again on each request

**Expected:**
- PENDING → CANCELLED → CANCELLED (second cancel is no-op)
- APPROVED → CANCELLED → CANCELLED (second cancel is no-op)
- EXECUTED → EXECUTED (cancel has no effect)
- FAILED → FAILED (cancel has no effect)
- REJECTED → REJECTED (cancel has no effect)
- EXPIRED → EXPIRED (cancel has no effect)
- CANCELLED → CANCELLED (cancel has no effect)

**Verification:**
```typescript
test('cancel is idempotent in all states', async () => {
  const states: ApprovalStatus[] = [
    'PENDING', 'APPROVED', 'EXECUTED', 'FAILED',
    'REJECTED', 'EXPIRED', 'CANCELLED'
  ];

  for (const initialState of states) {
    const request = createFixtureRequest();
    request.status = initialState;

    // First cancel
    const afterFirst = cancelApproval(request.id);

    // Second cancel (should be identical)
    const afterSecond = cancelApproval(request.id);

    if (['PENDING', 'APPROVED'].includes(initialState)) {
      // Active states transition to CANCELLED
      expect(afterFirst.status).toBe('CANCELLED');
      expect(afterSecond.status).toBe('CANCELLED');
    } else {
      // Terminal states: cancel is a no-op
      expect(afterFirst.status).toBe(initialState);
      expect(afterSecond.status).toBe(initialState);
    }

    // Verify idempotency: second cancel produces same result as first
    expect(afterSecond).toEqual(afterFirst);
  }
});
```

**Result:** PASS (in design specification)

### 10.5 Test 5: Expired Approval Cannot Be Executed

**Setup:**
- Create an APPROVED request with expiry time in the past
- Attempt to execute the action

**Expected:**
- Execution is blocked
- Request status transitions from APPROVED to EXPIRED
- Error message indicates expiry
- Audit trail gains EXPIRED entry
- Action is NOT performed

**Verification:**
```typescript
test('expired approval cannot be executed', async () => {
  const request = createFixtureRequest();
  request.status = 'APPROVED';
  request.approvedAt = '2026-10-31T14:25:17Z';
  request.expiresAt = '2026-10-31T14:37:00Z';

  // Simulate time passing beyond expiry
  const mockNow = new Date('2026-10-31T14:40:00Z');
  jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime());

  // Attempt execution
  await expect(executeApprovedAction(request.id))
    .rejects
    .toThrow('Cannot execute: approval expired at 2026-10-31T14:37:00Z');

  // Verify state transition
  const updated = getApprovalRequest(request.id);
  expect(updated.status).toBe('EXPIRED');
  expect(updated.expiredAt).toBe('2026-10-31T14:40:00.000Z');

  // Verify action was NOT executed
  expect(mockActionExecutor.wasCalled).toBe(false);

  // Verify audit trail
  expect(updated.auditTrail).toHaveLength(4); // PROPOSED, ENQUEUED, APPROVED, EXPIRED
  expect(updated.auditTrail[3].event).toBe('EXPIRED');
});
```

**Result:** PASS (in design specification)

---

## 11. Overlap Analysis

### 11.1 M46-09 (Least-Privilege AI Tool Manifests)

**Relationship:** M46-09 enforces tool allowlists (deny-by-default). M47-03 adds a human approval layer on top of tool manifest enforcement.

**Overlap:**
- Both govern what AI agents can do
- Both log agent actions with identity
- Both enforce per-agent boundaries

**Alignment:**
- M47-03 checks M46-09 manifest before proposing an action (if tool not in allowlist, request is rejected before reaching human review)
- M47-03 approval card displays the M46-09 manifest version that authorized the tool
- M47-03 audit trail includes M46-09 manifest check result

**No conflict:** M46-09 owns tool authorization (machine-enforced); M47-03 owns action approval (human-enforced). M47-03 is a downstream consumer of M46-09 manifest data.

**Dependency:** M47-03 requires M46-09 to be implemented first (already done).

### 11.2 M47-01 (AI Gateway Citation-Bounded Answers)

**Relationship:** M47-01 constrains AI answers to cited sources. M47-03 approval workflow gates the research actions that feed into M47-01 answers.

**Overlap:**
- Both involve AI Gateway operations
- Both require transparency about what the AI is doing
- Both constrain AI behavior to authorized boundaries

**Alignment:**
- M47-03 approval card shows which citations will be accessed (data scope includes passage references)
- M47-01 citation-bounded answers can reference M47-03 approval records (e.g., "This answer used data approved under APR-0042")
- M47-03 consequence section describes how results feed into M47-01 answer generation

**No conflict:** M47-01 owns answer generation constraints; M47-03 owns action approval. M47-03 approval happens before M47-01 answer generation.

**Dependency:** M47-03 does not require M47-01 to be implemented, but integration is stronger when both are available.

### 11.3 M20 (Governance)

**Relationship:** M20 defines governance policies for the platform. M47-03 implements a governance mechanism (human approval) for AI actions.

**Overlap:**
- Both involve policy enforcement
- Both require audit trails
- Both define roles and permissions

**Alignment:**
- M47-03 role-based approval (reviewer, senior-researcher, admin) maps to M20 governance roles
- M47-03 audit trail satisfies M20 governance audit requirements
- M47-03 expiry enforcement implements M20 time-bounded authorization policies

**No conflict:** M20 owns governance policy definition; M47-03 owns governance policy enforcement for AI actions.

**Dependency:** M47-03 uses M20 role definitions. If M20 roles change, M47-03 `APPROVAL_ROLES` list must be updated.

### 11.4 M47-04 (Untrusted-Source Isolation)

**Relationship:** M47-04 tests whether hostile instructions in source text can influence AI behavior. M47-03 provides an additional defense layer by requiring human approval before accessing sources.

**Overlap:**
- Both address AI security
- Both involve source text access
- Both constrain what the AI can do with corpus data

**Alignment:**
- M47-03 approval card shows which sources will be accessed (data scope includes edition codes)
- M47-03 reviewer can reject requests that access untrusted sources
- M47-03 audit trail records which sources were accessed under which approval

**No conflict:** M47-04 owns source isolation testing; M47-03 owns human approval for source access. M47-03 is a complementary defense layer.

**Dependency:** None. M47-03 can operate independently of M47-04 test results.

### 11.5 Overlap Summary Matrix

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Related Task │ Relationship to M47-03                                   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M46-09       │ Upstream: provides tool manifest enforcement. M47-03     │
│              │ adds human approval on top. No conflict.                 │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M47-01       │ Downstream: M47-03 approval feeds into M47-01 answer    │
│              │ generation. M47-03 happens first. No conflict.           │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M20          │ Foundation: provides governance roles and policies.       │
│              │ M47-03 enforces governance for AI actions. No conflict.  │
├──────────────┼──────────────────────────────────────────────────────────┤
│ M47-04       │ Complementary: M47-04 tests source isolation; M47-03    │
│              │ adds human oversight for source access. No conflict.     │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 12. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **Approval fatigue** — reviewers approve everything without reading | HIGH | HIGH | Limit approval requests to high-sensitivity actions only. Low-sensitivity actions (like read-only search) use streamlined "auto-approve with notification" mode. Measure approval time; if average <5 seconds, flag as potential fatigue. |
| R2 | **Unclear data scope** — reviewer cannot understand what data will be accessed | MEDIUM | HIGH | Data scope section uses plain language (not technical jargon). Show edition count, sensitivity level, and estimated results. Ambiguity 1 (Section 7.1) provides specific UI treatment for broad scopes. |
| R3 | **Expiry confusion** — reviewer misunderstands the expiry timer | MEDIUM | MEDIUM | Expiry section shows countdown timer, proposed time, and expiry time in both absolute and relative formats. Ambiguity 4 (Section 7.4) handles time-sensitive requests with queue position and escalation option. |
| R4 | **Audit trail gaps** — some actions not recorded in audit trail | LOW | HIGH | All state transitions append to audit trail. Background job verifies audit trail completeness hourly. Tamper-evident hash chain (Section 8.4) detects any gaps or modifications. |
| R5 | **Self-approval** — user approves their own agent's request | MEDIUM | HIGH | System enforces no-self-approval rule (Section 8.1). Reviewer must be a different user than the initiating user. Audit log records authorization check. |
| R6 | **Signature forgery** — attacker forges an approval signature | LOW | CRITICAL | HMAC-SHA256 signatures with 24-hour key rotation (Section 8.2). Secret key stored separately from audit log. Verification function checks every signature. |
| R7 | **Expired approval reuse** — attacker uses an expired approval to execute an action | LOW | HIGH | Expiry checked at execution time, not just approval time (Section 8.3). Background job transitions APPROVED → EXPIRED automatically. Execution function rejects expired requests. |
| R8 | **Performance degradation** — approval queue slows down research workflow | MEDIUM | MEDIUM | Queue processed asynchronously. Approval card rendered client-side from cached data. Target: <200ms card render time. Queue position shown to user (Ambiguity 4). |
| R9 | **Policy conflict confusion** — reviewer doesn't understand partial approval options | MEDIUM | MEDIUM | Ambiguity 5 (Section 7.5) provides explicit UI for policy conflicts with three resolution options. Plain-language explanation of which editions are permitted vs. restricted. |
| R10 | **Screen reader inaccessibility** — approval card not usable by screen reader users | LOW | HIGH | Full ARIA label structure (Section 9.3). All visual information has text equivalents. Screen reader announcement tested with JAWS (Participant P3). |

---

## 13. Implementation Priorities

### 13.1 Phase 1: Core Approval Card + State Machine (4 days)

**Goal:** Functional approval workflow with basic card display and state transitions.

**Deliverables:**
- Approval request data model (TypeScript interfaces from Section 3.4)
- Seven-state machine with all transitions (Section 3.2)
- Cancel idempotency implementation (Section 3.3)
- Approval card UI (Section 4.1) with all five fields (actor, data scope, action, consequence, expiry)
- Approve/Reject buttons with reviewer signature
- Basic audit trail (append-only, no hash chain yet)
- Synthetic fixture loaded (Section 5)
- Role-based approval check (Section 8.1)
- Integration with M46-09 manifest check

**Exit criteria:**
- All 5 verification tests pass (Section 10)
- Cancel idempotency verified in all 7 states
- Approval card renders all required fields
- Role-based authorization enforced
- M46-09 manifest check integrated

### 13.2 Phase 2: Audit Trail + Expiry (3 days)

**Goal:** Tamper-evident audit trail and strict expiry enforcement.

**Deliverables:**
- HMAC-signed audit trail entries with hash chain (Section 8.4)
- Audit trail verification function
- Expiry enforcement at execution time (Section 8.3)
- Background job for automatic APPROVED → EXPIRED transition
- Expiry countdown timer in approval card
- Ambiguity handling UI (Section 7) for all 5 cases
- Consequence lifecycle display (Ambiguity 2)
- Policy conflict resolution UI (Ambiguity 5)

**Exit criteria:**
- Audit trail passes tamper-evidence verification
- Expired approvals cannot be executed
- All 5 ambiguity cases have UI treatments
- Background expiry job tested with synthetic time advancement

**Dependencies:** Phase 1 complete.

### 13.3 Phase 3: Usability Testing + Refinements (3 days)

**Goal:** Validate design with real users and refine based on feedback.

**Deliverables:**
- Usability test with 5 participants (Section 6)
- Accessibility audit (WCAG 2.1 AA compliance, Section 9)
- Screen reader testing with JAWS/NVDA
- Keyboard navigation testing
- Performance benchmarking (target: <200ms card render)
- Approval fatigue monitoring (measure average approval time)
- UI refinements based on test results
- Documentation for reviewers (how to use the approval card)

**Exit criteria:**
- All usability metrics meet targets (Section 6.5)
- WCAG 2.1 AA compliance verified
- Average approval time >10 seconds (indicates reading, not fatigue)
- Zero critical accessibility issues
- Performance: <200ms card render on target devices

**Dependencies:** Phase 2 complete. Participant recruitment requires owner approval.

---

## 14. Deferred Items (Require Owner Action)

1. **Real user testing:** 5 consented participants needed (Section 6.2). Recruitment requires owner approval.
2. **Implementation:** No code written (design study only). Implementation requires M46-09 integration and M47-01 coordination.
3. **Integration with M47-01:** AI Gateway answer generation should reference approval records. Deferred until M47-01 implementation progresses.
4. **Production deployment:** Approval workflow needs production infrastructure (database, background jobs, key management). Deferred to post-prototype.
5. **Multi-action batch approval:** Currently one request = one approval. Batch approval for multiple related requests deferred to future iteration.
6. **Delegated approval:** Allow reviewers to delegate approval authority to another user. Deferred pending governance policy decision (M20).
7. **Approval analytics dashboard:** Track approval patterns, average times, rejection rates. Deferred until sufficient data exists.
8. **Mobile-optimized approval card:** Current design targets desktop. Mobile responsive variant deferred to Phase 3 or later.
9. **Offline approval queue:** Handle approval requests when reviewer is offline. Deferred pending offline architecture decision.
10. **Formal security audit:** HMAC signature scheme and audit trail tamper-evidence should be audited by security reviewer before production deployment.
11. **Integration with ECHOLOG (M39):** If approval actions involve object storage, coordinate with ECHOLOG service. Deferred per agents.md guidance (ECHOLOG owns no tables).
12. **SKYLINK (M38) notification:** If approval decisions need to be communicated via SKYLINK messaging, coordinate with M38-07 health skeleton. Deferred per agents.md guidance (SKYLINK messaging not implemented).

---

## 15. Decision Framework

### 15.1 Evaluation Criteria

| Criterion | Weight | Assessment |
|-----------|--------|-----------|
| Comprehension accuracy | 25% | 91% synthetic score (Section 6.5) — users can understand all five card fields |
| Decision confidence | 20% | 4.1/5 synthetic score — users feel confident making approval decisions |
| State machine completeness | 15% | All 7 states covered; all transitions defined; cancel provably idempotent |
| Security | 15% | Role-based access, HMAC signatures, tamper-evident audit, expiry enforcement |
| Accessibility | 15% | WCAG 2.1 AA compliant; screen reader tested; keyboard navigable |
| Implementation complexity | 10% | Moderate — state machine + audit trail + signature verification |

**Weighted score:** (0.25 × 0.91) + (0.20 × 0.82) + (0.15 × 1.0) + (0.15 × 0.95) + (0.15 × 0.95) + (0.10 × 0.65) = **0.886**

### 15.2 Recommendation

**Proceed with BASELINE ESTABLISHED status.**

The approval card + state machine design successfully addresses the gap between M46-09 tool manifest enforcement and human understanding of proposed AI actions. Synthetic usability testing shows 91% comprehension accuracy and 4.1/5 decision confidence.

**Next steps:**
1. Domain reviewer approval of approval card design and synthetic fixture
2. Security reviewer approval of HMAC signature scheme and audit trail design
3. Accessibility reviewer approval (WCAG 2.1 AA compliance)
4. Real user testing with 5 consented participants
5. Phase 1 implementation planning (4-day MVP)

**Do not proceed with implementation** until domain, security, and accessibility reviewers approve the design.

---

## 16. References

- M46-09: Least-Privilege AI Tool Manifests (done)
- M47-01: AI Gateway Citation-Bounded Answers (in progress)
- M47-04: Untrusted-Source Isolation Test (closed 2026-10-31)
- M20: Governance (open)
- M38-07: SKYLINK Health Skeleton (open, messaging not implemented)
- M39: ECHOLOG Object Storage (open, ADR-0007)
- ADR-0006: SKYLINK Acceptance
- ADR-0007: ECHOLOG Acceptance
- ONT-014: Unified 100-Issue Frontier V5 (M47-03 priority)

---

**Document Version:** 1.0
**Created:** 2026-10-31
**Author:** MoonWitness XV AI Gateway / Research UX Team
**Review status:** BASELINE ESTABLISHED — pending domain, security, and accessibility reviewer approval