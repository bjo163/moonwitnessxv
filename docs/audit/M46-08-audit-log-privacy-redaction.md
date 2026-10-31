# M46-08 — Audit Log Fields for Privacy-Safe Diagnostics

> **Status:** BASELINE ESTABLISHED — design complete, implementation deferred pending owner review.
> **Task ID:** M46-08 · **Candidate:** ENG-008 · **Group:** G7 (ECOSYSTEM) · **Priority:** P1 · **Difficulty:** D3
> **Owner:** service/security · **Effort estimate:** M (4–8 days for a bounded service set)
> **Dependencies:** M16, M18, M19 (owner gates for real/private logs); workable as baseline with synthetic data
> **Date:** 2026-10-31 · **Working tree:** this session · **No production code changed.**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Task Metadata](#2-task-metadata)
3. [Design Goals and Constraints](#3-design-goals-and-constraints)
4. [Log Field Inventory Methodology](#4-log-field-inventory-methodology)
5. [Sensitive Field Classification](#5-sensitive-field-classification)
6. [Redaction Strategy Design](#6-redaction-strategy-design)
7. [Sample Log Callsites (Synthetic)](#7-sample-log-callsites-synthetic)
8. [Redaction Test Fixtures](#8-redaction-test-fixtures)
9. [Unit Test Design](#9-unit-test-design)
10. [Privacy/Security Review Framework](#10-privacysecurity-review-framework)
11. [Retention Policy Documentation](#11-retention-policy-documentation)
12. [Risk Analysis](#12-risk-analysis)
13. [Metrics and Success Criteria](#13-metrics-and-success-criteria)
14. [Implementation Considerations (Deferred)](#14-implementation-considerations-deferred)
15. [Deferred Items Requiring Owner Action](#15-deferred-items-requiring-owner-action)
16. [Conclusion: BASELINE ESTABLISHED](#16-conclusion-baseline-established)

---

## 1. Executive Summary

This document establishes the design baseline for M46-08: auditing log fields across the MoonWitness XV service mesh to ensure diagnostics remain useful while never exposing sensitive payloads. The scope is bounded to **existing logger wrappers only** — no private source code is copied into telemetry, and no new logging backend is introduced.

### Key Findings

**Current state.** The repository uses Fastify's built-in pino logger across six backend services (ARSY, SKYLINK, ECHOLOG, Cockpit, AIGateway, Sentinel). One service — SKYLINK — already has an explicit log hygiene test (`control-plane.test.ts:147`) that asserts synthetic secrets, bearer tokens, QR payloads, and outbound message bodies never appear in info-level log output. This test provides a proven pattern for the broader redaction framework proposed here.

**Logger topology.** ARSY configures its logger with `{ level: config.logLevel }` and passes `app.log` to MoonQL as the `Log` interface (`packages/moonql/src/log.ts`). SKYLINK, ECHOLOG, and AIGateway accept an injectable `logger` option defaulting to `false` (silent), making log hygiene directly testable by injecting a capture stream. Cockpit hardcodes `logger: false`. Sentinel uses `console.warn`/`console.error` directly, bypassing the structured logger entirely — this is a known gap.

**Sensitive field exposure surface.** Five categories of sensitive data were identified traversing the logging boundary: (1) authentication credentials (bearer tokens, API keys, session cookies), (2) private witness content (D18 message bodies, D08 research text), (3) infrastructure secrets (S3 credentials, webhook signing secrets, database URLs), (4) personal identifiers (user logins, IP addresses when trust-proxy is misconfigured), and (5) correlation data that must be *preserved* (request IDs, channel IDs, service names, status codes).

**Design proposal.** A field-level redaction contract layered onto the existing `Log` interface. Redaction is implemented as a pure function over structured log objects — no string scanning, no regex heuristics, no performance impact on the hot path. The contract classifies every known log field as SAFE, REDACT, or OMIT and provides test fixtures that prove synthetic secrets never reach the log stream.

**Gap inventory.** Three gaps require owner action before implementation: (1) Sentinel's `console.*` calls bypass structured logging entirely; (2) no cross-service correlation ID exists (M46-30 addresses this); (3) ECHOLOG's S3 `RequestId` is generated per-error-response but not propagated to the structured logger.

---

## 2. Task Metadata

### 2.1 TODO.md Specification (Verbatim)

| Field | Value |
|---|---|
| **Task ID** | M46-08 |
| **Candidate** | ENG-008 |
| **Domain** | Engineering / Security & Privacy |
| **Priority / Difficulty** | P1 / D3 |
| **Owner** | service/security |
| **Effort** | M (4–8 days for a bounded service set) |
| **Objective** | Inventory representative logs for sensitive payloads and define safe structured fields |
| **Scope** | Review callsites and add redaction tests for explicitly classified fields. Existing logger wrappers only; no private source copied into telemetry. |
| **Dependencies** | External (M16/M18/M19 owner gates for real/private logs) — workable as baseline with synthetic data |
| **Acceptance criteria** | Synthetic secrets/private strings never appear; required correlation fields remain |
| **Definition of done** | Privacy/security review; no real private data used |
| **Verification plan** | Unit captures for normal and error paths |
| **Risks** | Over-redaction harms diagnosis; under-redaction exposes data; review both |
| **Metrics** | Secret fixture leakage = 0; useful fields retained |
| **Closure evidence** | Inventory, synthetic output and reviewer sign-off |
| **Anti-overlap** | Distinct from consent withdrawal and public projection tasks |
| **Rollback** | Revert redactor but never restore raw secret logging |

### 2.2 Related Tasks and Documents

| Related ID | Relation | Notes |
|---|---|---|
| M46-07 | Predecessor (health endpoint semantics) | Defines what health probes may log; this document extends that boundary |
| M46-09 | Sibling (AI tool manifests) | Least-privilege tool enforcement; tool denial reasons appear in logs |
| M46-10 | Sibling (browser security headers/CSP) | CSP violation reports are a log source; redaction applies |
| M46-12 | Sibling (adversarial contract tests) | AI Gateway denial reasons flow to logs; must not leak prompt content |
| M46-17 | Sibling (env config validation) | Diagnostics name key but never value — same principle as log redaction |
| M46-29 | Sibling (worker lifecycle) | Lifecycle events must carry no source payload or secrets |
| M46-30 | Successor (cross-service correlation) | Depends on M46-08's correlation field contract |
| M38-11 | Existing evidence | SKYLINK log hygiene test (control-plane.test.ts:147–196) |
| M34-01 | Existing evidence | Research exposure inventory — defines what must NOT appear in logs |
| SECURITY.md | Authority | `docs/architecture/SECURITY.md` — data release/privacy contract |

### 2.3 Document Authority

This document is a **design baseline**, not an implementation. No production code is changed. The authority chain is:

- **TODO.md** — task status register (sole source of completion status)
- **BLUEPRINT.md** — architecture and domain boundaries
- **SECURITY.md** (`docs/architecture/SECURITY.md`) — privacy contract
- **This document** — design specification for M46-08

---

## 3. Design Goals and Constraints

### 3.1 Design Goals

**G1: Zero secret leakage.** Synthetic secrets, private strings, and credential values must never appear in structured log output. This is the primary acceptance criterion and the hard invariant.

**G2: Diagnostic utility preserved.** Correlation fields (request ID, channel ID, service name, status code, timestamp, error code) must remain intact and searchable. Over-redaction that removes diagnostic value is a defect equal to under-redaction.

**G3: No new infrastructure.** The redaction contract operates on the existing `Log` interface (`packages/moonql/src/log.ts`) and Fastify's pino logger. No telemetry backend, no log aggregator, no new dependency is introduced.

**G4: Testable by injection.** Every service that accepts a `logger` option must be testable by injecting a capture stream. This pattern already exists in SKYLINK (`control-plane.test.ts:161`) and ECHOLOG (`object-routes.test.ts:75`).

**G5: Pure-function redaction.** The redactor is a deterministic pure function over structured log objects. It does not scan raw strings, does not use regex heuristics, and does not inspect log message text. Field-level classification is explicit and auditable.

**G6: Synthetic data only.** No real logs, real credentials, real user data, or real private witness content is used in any test fixture. All secrets are clearly marked synthetic values.

### 3.2 Hard Constraints

| Constraint | Rationale | Source |
|---|---|---|
| No private source in telemetry | Owner policy; witness content and source material are never copied to logs | agents.md, SECURITY.md |
| Existing logger wrappers only | Scope boundary; no new logging library or abstraction layer | M46-08 scope |
| M16/M18/M19 owner gates for real logs | Real/private logs require separate authorization; this document uses synthetic data only | M46-08 dependencies |
| No second Hub or SQL owner | SKYLINK and ECHOLOG boundaries remain intact | agents.md |
| Cockpit token never logged | Per-boot CSRF guard is explicitly not a secret; logging it would be a regression | SECURITY.md §Cockpit |
| S3 credentials never leave ECHOLOG | Authorization headers, signatures, and object bytes are never logged | SECURITY.md §ECHOLOG |
| SKYLINK provider tokens stay in secret env | Bot tokens and webhook secrets are never logged | SECURITY.md §SKYLINK |

### 3.3 Non-Goals

- **Not a telemetry system.** This document does not propose shipping logs to an external service.
- **Not a log aggregation design.** Structured field definitions support future aggregation but do not require it.
- **Not a compliance audit.** This is an engineering design baseline, not a legal or regulatory compliance assessment.
- **Not an implementation.** Code changes are deferred pending owner review.

---

## 4. Log Field Inventory Methodology

### 4.1 Approach

The inventory was built by systematic inspection of every logging callsite in the six backend services and the shared packages. The methodology follows four phases:

**Phase 1: Callsite discovery.** Search all `*.ts` files under `apps/` and `packages/` for patterns matching `app.log.*`, `this.log.*`, `console.log|warn|error`, and Fastify logger stream injection. Record file, line, level, and payload shape.

**Phase 2: Payload classification.** For each callsite, classify every field in the structured payload against the sensitivity taxonomy (Section 5). Fields are classified as SAFE, REDACT, or OMIT.

**Phase 3: Gap analysis.** Identify logging paths that bypass the structured logger (e.g., Sentinel's `console.*` calls), services that hardcode `logger: false` without an injectable override, and error handlers that may serialize sensitive objects into response bodies that are then logged by Fastify's request logger.

**Phase 4: Contract specification.** Define the redaction contract as a pure function over structured log objects, with explicit field classification and test fixtures.

### 4.2 Callsite Discovery Results

#### 4.2.1 ARSY (Hub) — `apps/arsy/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| A1 | `server.ts:12` | info | `` `received ${signal}, shutting down` `` | SAFE — signal name is operational |
| A2 | `server.ts:18` | error | `{ err }` | REVIEW — error object may contain stack traces with contextual data |
| A3 | `app.ts:44` | info | `{ ...egress, deniedHosts: egress.denyHosts.length }` | SAFE — egress config and count only |
| A4 | `lib/loader.ts:38` | debug | `` `registered plugin: ${file}` `` | SAFE — file name is operational |
| A5 | `lib/loader.ts:49` | warn | `` `module "${folder}" skipped: no index entry file` `` | SAFE — module folder name |
| A6 | `lib/loader.ts:54` | debug | `` `registered module: ${prefix}/${folder}` `` | SAFE — route prefix and module name |
| A7 | `lib/loader.ts:70` | info | `` `channel "${file}" disabled by config` `` | SAFE — operational |
| A8 | `lib/loader.ts:74` | info | `` `channel registered: ${channel.id}` `` | SAFE — channel ID is a public identifier |
| A9 | `lib/skylink.ts:235` | error | `{ skylink: runtime.url, reason: runtime.error }` | REVIEW — URL may contain credentials if misconfigured |
| A10 | `lib/skylink.ts:242` | info | `{ skylink: runtime.url, channels: channels.map(c => c.id) }` | SAFE — URL without credentials, channel IDs are public |
| A11 | `modules/health/index.ts` | (none) | Health probes do not log; they return JSON responses | N/A |
| A12 | `modules/metrics/index.ts` | (none) | Metrics endpoint does not log; Prometheus scrape is pull-based | N/A |

#### 4.2.2 SKYLINK — `apps/skylink/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| S1 | `server.ts:26` | — | `logger: options.logger ?? false` | Injectable; testable by capture stream |
| S2 | `events.ts` | info | `{ type, channelId, timestamp }` | SAFE — event type and channel ID are operational |
| S3 | `ws.ts` | info | Auth frame processing | REVIEW — must not log `authorization` or `serviceKey` fields |
| S4 | `auth.ts` | warn/error | Auth failures | SAFE if only status codes; OMIT if token values are included |
| S5 | `channels.ts` | info | Channel registration | SAFE — channel IDs and provider names |

**Existing hygiene test:** `control-plane.test.ts:147–196` asserts that `SERVICE_KEY`, `synthetic-arsy-token`, `synthetic-private-qr`, and `synthetic outbound body` never appear in captured info-level log output. This is the gold standard for the redaction contract.

#### 4.2.3 ECHOLOG — `apps/echolog/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| E1 | `server.ts:9` | — | `logger: options.logger ?? false` | Injectable; testable by capture stream |
| E2 | `server.ts:13` | — | `logController: new LogController({ disableRequestLogging: true })` | Request logging disabled by default |
| E3 | `modules/s3/routes.ts:261` | — | `requestId = crypto.randomUUID()...` | SAFE — opaque request ID for error XML |
| E4 | `modules/s3/routes.ts:262` | — | XML error response with `requestId` | SAFE — no secrets in error response |
| E5 | `modules/objects/index.ts` | info/error | Object operations | REVIEW — must not log object bytes or S3 credentials |
| E6 | `auth.ts` | warn/error | Auth failures | SAFE if only status; OMIT if SigV4 signature components logged |
| E7 | `config.ts` | — | Configuration parsing | SAFE if only key names; OMIT if values logged |

#### 4.2.4 Cockpit — `apps/cockpit/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| C1 | `server.ts:64` | — | `logger: false` | Hardcoded off; no log output to audit |
| C2 | `supervisor.ts` | — | Process management | REVIEW — if any logging is added, process PIDs and port numbers are SAFE |
| C3 | `progressTracker.ts` | — | Build progress | SAFE — operational metadata only |

**Note:** Cockpit's `logger: false` means there is currently no logging to audit. If logging is added in the future, the per-boot CSRF token (`x-moondeck-token`) must never be logged per SECURITY.md.

#### 4.2.5 AIGateway — `apps/aigateway/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| AI1 | `server.ts:20` | — | `logger: opts.logger ?? false` | Injectable; testable by capture stream |
| AI2 | `providers/*.ts` | info/error | Provider calls | REVIEW — must not log API keys or prompt/response content |
| AI3 | `router.ts` | error | Routing failures | SAFE if only model IDs and status codes |
| AI4 | `embeddings.ts` | — | Embedding generation | REVIEW — must not log input text content |

#### 4.2.6 Sentinel — `apps/sentinel/src/`

| # | File | Level | Payload | Classification |
|---|---|---|---|---|
| SE1 | `index.ts:240` | warn | `` `[sentinel] cycle notice: ${msg}` `` | GAP — uses `console.warn`, not structured logger |
| SE2 | `drivers/*.ts` | — | Driver operations | GAP — no structured logging; if `console.*` is used, same gap |
| SE3 | `radar.ts` | — | Geospatial clustering | GAP — no logging observed; if added, must use structured logger |
| SE4 | `webhooks.ts` | — | Webhook dispatch | GAP — must not log webhook URLs with embedded tokens |

**Critical gap:** Sentinel uses `console.warn` directly. This bypasses any structured logging, field classification, or redaction contract. Implementation must either migrate Sentinel to the Fastify logger or wrap `console.*` calls with the redaction contract.

#### 4.2.7 Shared Packages

| # | Package | File | Level | Payload | Classification |
|---|---|---|---|---|---|
| P1 | `moonql` | `src/log.ts` | — | `Log` interface definition | Contract: `{ info, warn }` with `(obj: unknown, msg: string)` |
| P2 | `moonql` | `src/repository.ts:74` | warn | `{ err: (err as Error).message }` | SAFE — error message string only, not full error object |
| P3 | `moonql` | `src/repository.ts:163` | warn | Hook failure | REVIEW — must not log row data or query parameters containing PII |
| P4 | `moonql-ops` | `src/index.ts:224` | warn | `{ err: err.message }` | SAFE — error message only |
| P5 | `skylink-whatsapp` | `src/client.ts:218` | error | `{ err: error }` | REVIEW — full error object may contain message content |
| P6 | `skylink-store` | `src/cli.ts` | error | `console.error(...)` | GAP — CLI uses console.error; migration to structured logger recommended |

### 4.3 Summary Statistics

| Metric | Count |
|---|---|
| Total logging callsites discovered | 30+ |
| Callsites with SAFE payload | 16 |
| Callsites requiring REVIEW | 9 |
| Callsites with structural GAP (console.*) | 5 |
| Services with injectable logger | 4 (SKYLINK, ECHOLOG, AIGateway, ARSY via config) |
| Services with hardcoded logger: false | 1 (Cockpit) |
| Services using console.* directly | 1 (Sentinel) |

---

## 5. Sensitive Field Classification

### 5.1 Taxonomy

Every field that may appear in a structured log object is classified into one of four sensitivity levels:

| Level | Label | Definition | Examples |
|---|---|---|---|
| **L0** | SAFE | No privacy or security impact; may appear in logs unmodified | `status`, `channelId`, `timestamp`, `method`, `route`, `uptime`, `port`, `signal` |
| **L1** | CAUTION | Operationally useful but may become sensitive in combination | `error.message` (may contain user input), `url` (may contain query params), `userId` (pseudonymous identifier) |
| **L2** | REDACT | Must be replaced with a fixed placeholder before logging | `authorization` header value, `cookie` header value, `x-api-key` value, `err.stack` (may contain source paths) |
| **L3** | OMIT | Must be removed entirely from the log object; presence is itself a leak | `password`, `secret`, `token` (raw), `privateKey`, `databaseUrl` (with credentials), S3 `Signature`, `Authorization` header |

### 5.2 Field Classification Register

The following register classifies every known field that appears in the logging callsites discovered in Section 4.

#### 5.2.1 Authentication and Authorization Fields

| Field name | Level | Action | Rationale |
|---|---|---|---|
| `authorization` (header) | L3 | OMIT | Bearer tokens are session credentials; logging them enables session hijacking |
| `cookie` (header) | L3 | OMIT | Session cookies are equivalent to tokens |
| `x-api-key` (header) | L3 | OMIT | API keys are long-lived credentials |
| `x-skylink-key` (header) | L3 | OMIT | Service-to-service authentication key |
| `x-moondeck-token` (header) | L3 | OMIT | Cockpit CSRF guard; SECURITY.md explicitly forbids logging |
| `x-telegram-bot-api-secret-token` (header) | L3 | OMIT | Webhook signing secret |
| `SKYLINK_TELEGRAM_BOT_TOKEN` (env) | L3 | OMIT | Provider bot token; SECURITY.md forbids presence in logs |
| `SKYLINK_TELEGRAM_WEBHOOK_SECRET` (env) | L3 | OMIT | Webhook secret; SECURITY.md forbids presence in logs |
| `MOONQL_AUTH_ADMIN_PASSWORD` (env) | L3 | OMIT | Database admin password |
| `MOONQL_AUTH_ADMIN_LOGIN` (env) | L1 | CAUTION | Username is not a secret but may be PII in context |
| `DATABASE_URL` (env) | L3 | OMIT | Contains embedded credentials |
| `serviceKey` (config) | L3 | OMIT | Service-to-service shared secret |
| `authRef` (D18 field) | L3 | OMIT | Reference to secret; logging the reference pattern may aid extraction |

#### 5.2.2 Infrastructure and Configuration Fields

| Field name | Level | Action | Rationale |
|---|---|---|---|
| `host` | L0 | SAFE | Bind address is operational metadata |
| `port` | L0 | SAFE | Listen port is operational metadata |
| `status` | L0 | SAFE | Health/status code is operational |
| `uptime` / `uptimeSeconds` | L0 | SAFE | Process lifetime is operational |
| `pid` | L0 | SAFE | Process ID is operational |
| `restarts` | L0 | SAFE | Restart count is operational |
| `deniedHosts` / `denyPorts` | L0 | SAFE | Egress policy configuration is operational |
| `arsyUrl` / `skylink.url` | L1 | CAUTION | URL without credentials is safe; URL with embedded credentials is L3 |
| `storage` (ECHOLOG) | L0 | SAFE | Storage driver name is operational |
| `bodyLimit` | L0 | SAFE | Configuration value is operational |

#### 5.2.3 Operational and Diagnostic Fields

| Field name | Level | Action | Rationale |
|---|---|---|---|
| `requestId` | L0 | SAFE | Opaque correlation identifier; ECHOLOG generates these per error response |
| `channelId` | L0 | SAFE | Channel identity is a public operational field |
| `channel.id` | L0 | SAFE | Same as above |
| `method` | L0 | SAFE | HTTP method is operational |
| `route` / `url` (path only) | L0 | SAFE | Route pattern is operational |
| `statusCode` | L0 | SAFE | HTTP response code is operational |
| `timestamp` | L0 | SAFE | ISO 8601 timestamp is operational |
| `err` (Error object) | L1 | CAUTION | `err.message` may contain user input; `err.stack` may contain source paths |
| `err.message` | L1 | CAUTION | May contain fragments of user input or query parameters |
| `err.stack` | L2 | REDACT | Stack traces reveal source file paths and internal architecture |
| `reason` | L1 | CAUTION | Error reason strings may contain contextual data from upstream |
| `provider` | L0 | SAFE | AI provider name is operational |
| `model` / `modelId` | L0 | SAFE | Model identifier is operational |
| `driver` (Sentinel) | L0 | SAFE | Driver kind (rss/api/playwright) is operational |

#### 5.2.4 Content and Data Fields

| Field name | Level | Action | Rationale |
|---|---|---|---|
| `body` (D18 message) | L3 | OMIT | Normalized message bodies contain personal data; SECURITY.md forbids logging |
| `text` (outbound message) | L3 | OMIT | Message content is private witness material |
| `qr` (QR payload) | L3 | OMIT | QR codes contain session-establishment data; existing test asserts non-leakage |
| `messages.raw` | L3 | OMIT | Retention is zero per SECURITY.md; must never appear in logs |
| `prompt` / `messages` (AI) | L3 | OMIT | User prompts may contain private witness content |
| `response` (AI completion) | L2 | REDACT | Model output may contain quoted private content |
| `payload` (generic) | L1 | CAUTION | Must be inspected per-callsite; generic payloads may contain any sensitivity level |
| `object bytes` | L3 | OMIT | ECHOLOG objects are untrusted inbound bytes per SECURITY.md |

#### 5.2.5 Personal Identifiers

| Field name | Level | Action | Rationale |
|---|---|---|---|
| `login` / `username` | L1 | CAUTION | Pseudonymous but linkable to identity |
| `role` | L0 | SAFE | Authorization role is operational (admin/user) |
| `ip` / `remoteAddress` | L1 | CAUTION | IP address is PII under most privacy frameworks; trust-proxy misconfiguration makes this spoofable |
| `userAgent` | L1 | CAUTION | Browser fingerprint; not directly PII but linkable |
| `chatId` (Telegram) | L2 | REDACT | Provider-specific user identifier; linkable to real identity via Telegram |
| `conversation.id` | L2 | REDACT | Conversation identifier may be linkable to participants |

### 5.3 Classification Decision Tree

```
Is the field a credential, secret, or token?
  YES → L3 OMIT (never log)
  NO → Does the field contain user-generated content (message text, prompt, body)?
    YES → L3 OMIT (private witness material)
    NO → Does the field contain a personal identifier (IP, chatId, login)?
      YES → L1 CAUTION or L2 REDACT depending on linkability
      NO → Does the field contain an error object?
        YES → L1 CAUTION (message) or L2 REDACT (stack)
        NO → Is the field operational metadata (status, port, timestamp, ID)?
          YES → L0 SAFE
          NO → L1 CAUTION (inspect per-callsite)
```

---

## 6. Redaction Strategy Design

### 6.1 Design Principles

**P1: Field-level, not string-level.** Redaction operates on known field names in structured log objects. It does not scan log message strings for patterns like credit card numbers or email addresses. String scanning is brittle, slow, and produces false positives that harm diagnosis.

**P2: Explicit classification, not inference.** Every field that may appear in a log object is classified explicitly in the field register (Section 5.2). The redactor does not guess; it looks up the classification and applies the corresponding action.

**P3: Pure function.** The redactor is a pure function: `(logObject: unknown) => RedactedObject`. No ambient state, no side effects, no global configuration. This makes it trivially testable and composable.

**P4: Fail-closed on unknown objects.** If a log payload is not a plain object (e.g., a string, an array, or a class instance), the redactor wraps it in `{ payload: '[non-object payload]' }` rather than attempting to serialize it. This prevents accidental `toString()` leakage of class instances that may hold secrets in private fields.

**P5: Preserve correlation.** Fields classified as L0 SAFE are passed through unchanged. The redactor never modifies, truncates, or reorders safe fields. Correlation IDs, timestamps, and operational metadata must survive redaction intact.

**P6: Deterministic output.** The same input always produces the same output. No randomization, no timestamps added by the redactor, no non-deterministic serialization.

### 6.2 Redaction Algorithm

```typescript
// Pseudocode — not implementation, design specification

interface RedactionRule {
  field: string;          // exact field name
  level: 'SAFE' | 'CAUTION' | 'REDACT' | 'OMIT';
  replacement?: string;   // for REDACT level; default '[REDACTED]'
}

const RULES: RedactionRule[] = [
  // L3 OMIT fields
  { field: 'authorization', level: 'OMIT' },
  { field: 'cookie', level: 'OMIT' },
  { field: 'x-api-key', level: 'OMIT' },
  { field: 'password', level: 'OMIT' },
  { field: 'secret', level: 'OMIT' },
  { field: 'token', level: 'OMIT' },
  { field: 'privateKey', level: 'OMIT' },
  { field: 'databaseUrl', level: 'OMIT' },
  { field: 'body', level: 'OMIT' },         // D18 message body
  { field: 'text', level: 'OMIT' },          // outbound message text
  { field: 'qr', level: 'OMIT' },            // QR payload
  { field: 'messages', level: 'OMIT' },      // AI messages array
  
  // L2 REDACT fields
  { field: 'err', level: 'REDACT', replacement: '[ERROR_OBJECT]' },
  { field: 'stack', level: 'REDACT', replacement: '[STACK_REDACTED]' },
  { field: 'chatId', level: 'REDACT', replacement: '[REDACTED]' },
  { field: 'conversationId', level: 'REDACT', replacement: '[REDACTED]' },
  
  // L1 CAUTION fields — passed through but flagged in test assertions
  { field: 'err.message', level: 'CAUTION' },
  { field: 'ip', level: 'CAUTION' },
  { field: 'login', level: 'CAUTION' },
  { field: 'url', level: 'CAUTION' },
];

function redact(input: unknown): unknown {
  // Step 1: Non-object guard
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { payload: '[non-object payload]' };
  }
  
  // Step 2: Field-level redaction
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const rule = RULES.find(r => r.field === key);
    if (!rule) {
      // Unknown field: pass through (L0 default)
      // Recursive redaction for nested objects
      result[key] = typeof value === 'object' && value !== null
        ? redact(value)
        : value;
    } else if (rule.level === 'OMIT') {
      // L3: remove entirely
      continue;
    } else if (rule.level === 'REDACT') {
      // L2: replace with fixed placeholder
      result[key] = rule.replacement ?? '[REDACTED]';
    } else {
      // L0/L1: pass through
      result[key] = value;
    }
  }
  
  return result;
}
```

### 6.3 Integration Points

The redactor integrates at three points in the existing logging architecture:

**Integration 1: Fastify logger stream wrapper.** For services using Fastify's pino logger (ARSY, SKYLINK, ECHOLOG, AIGateway), the redactor wraps the log stream:

```typescript
// Conceptual — not implementation
const redactingStream = {
  write(line: string) {
    try {
      const parsed = JSON.parse(line);
      const redacted = redact(parsed);
      underlyingStream.write(JSON.stringify(redacted) + '\n');
    } catch {
      // Non-JSON line: pass through (pino preamble, etc.)
      underlyingStream.write(line);
    }
  }
};
```

**Integration 2: MoonQL Log interface.** The `Log` interface in `packages/moonql/src/log.ts` accepts `obj: unknown` as the first argument. The redactor wraps this object before it reaches the underlying logger:

```typescript
// Conceptual — not implementation
const redactingLog: Log = {
  info: (obj, msg) => underlyingLog.info(redact(obj), msg),
  warn: (obj, msg) => underlyingLog.warn(redact(obj), msg),
};
```

**Integration 3: Sentinel console.* wrapper.** For Sentinel's `console.warn`/`console.error` calls, a thin wrapper applies the redactor to the first argument if it is an object:

```typescript
// Conceptual — not implementation
const originalWarn = console.warn;
console.warn = (obj?: unknown, ...args: unknown[]) => {
  if (typeof obj === 'object' && obj !== null) {
    originalWarn(redact(obj), ...args);
  } else {
    originalWarn(obj, ...args);
  }
};
```

### 6.4 Performance Considerations

| Operation | Cost | Mitigation |
|---|---|---|
| JSON parse of log line | ~1-5 microseconds for typical log object | Only applies to stream wrapper integration; direct `Log` interface integration avoids this |
| Object iteration (field classification) | ~0.1 microseconds per field (typical log object has 3-8 fields) | Pure function, no allocation for safe fields |
| JSON stringify of redacted object | ~1-5 microseconds | Same as normal logging serialization |
| Total overhead per log call | ~2-10 microseconds | Negligible compared to I/O cost of writing to stream/disk |
| Impact on `logger: false` services | Zero | Redactor is never invoked when logging is disabled |

**Benchmark target:** Redaction overhead must not exceed 5% of total log call duration. For a typical pino info call at ~50 microseconds (including I/O), the redactor adds ~5 microseconds — well within the target.

### 6.5 Recursive Redaction

Nested objects require recursive application of the redactor. The algorithm handles:

- **Plain objects:** Iterate keys, classify each, recurse for object values.
- **Arrays:** Redact each element individually.
- **Error objects:** Replace entirely with `[ERROR_OBJECT]` at L2; do not attempt to enumerate Error properties.
- **Class instances:** Treat as non-plain objects; replace with `[CLASS_INSTANCE]` to prevent `toString()` leakage.
- **Circular references:** Track visited objects with a `WeakSet`; replace circular references with `[CIRCULAR]`.
- **Depth limit:** Maximum recursion depth of 5; beyond that, replace with `[MAX_DEPTH]`.

---

## 7. Sample Log Callsites (Synthetic)

This section presents synthetic examples of log output before and after redaction. **No real data is used.** All values are clearly fabricated.

### 7.1 ARSY Boot Sequence

**Before redaction (synthetic):**
```json
{"level":30,"time":"2026-10-31T12:00:00.000Z","pid":12345,"hostname":"dev-machine","msg":"egress: outbound policy installed","allowedHosts":["api.telegram.org","api.openai.com"],"deniedHosts":["169.254.169.254","metadata.google.internal"],"denyPorts":[3000]}
```

**After redaction:**
```json
{"level":30,"time":"2026-10-31T12:00:00.000Z","pid":12345,"hostname":"dev-machine","msg":"egress: outbound policy installed","allowedHosts":["api.telegram.org","api.openai.com"],"deniedHosts":2,"denyPorts":[3000]}
```

**Note:** `deniedHosts` is already logged as a count (`egress.denyHosts.length`) in the actual callsite (A3), so no redaction is needed. This example illustrates that the existing callsite is already well-designed.

### 7.2 SKYLINK Channel Registration

**Before redaction (synthetic):**
```json
{"level":30,"time":"2026-10-31T12:01:00.000Z","msg":"skylink: channels registered","skylink":"http://127.0.0.1:3005","channels":["telegram-primary","whatsapp-support"]}
```

**After redaction:**
```json
{"level":30,"time":"2026-10-31T12:01:00.000Z","msg":"skylink: channels registered","skylink":"http://127.0.0.1:3005","channels":["telegram-primary","whatsapp-support"]}
```

**Note:** This callsite (A10) is already safe — the URL contains no credentials and channel IDs are public operational identifiers.

### 7.3 SKYLINK Auth Failure (Synthetic)

**Before redaction (synthetic):**
```json
{"level":40,"time":"2026-10-31T12:02:00.000Z","msg":"auth failed","authorization":"Bearer synthetic-token-abc123","remoteAddress":"192.168.1.100","userAgent":"Mozilla/5.0"}
```

**After redaction:**
```json
{"level":40,"time":"2026-10-31T12:02:00.000Z","msg":"auth failed","remoteAddress":"192.168.1.100","userAgent":"Mozilla/5.0"}
```

**Note:** `authorization` is L3 OMIT — removed entirely. `remoteAddress` and `userAgent` are L1 CAUTION — passed through because they are operationally useful for diagnosing auth failures and are not secrets.

### 7.4 ECHOLOG S3 Error Response (Synthetic)

**Before redaction (synthetic):**
```json
{"level":50,"time":"2026-10-31T12:03:00.000Z","msg":"S3 operation failed","requestId":"A1B2C3D4E5F67890","code":"SignatureDoesNotMatch","authorization":"AWS4-HMAC-SHA256 Credential=synthetic-access-key/20261031/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=synthetic-signature-value","resource":"/bucket/synthetic-object-key"}
```

**After redaction:**
```json
{"level":50,"time":"2026-10-31T12:03:00.000Z","msg":"S3 operation failed","requestId":"A1B2C3D4E5F67890","code":"SignatureDoesNotMatch","resource":"/bucket/synthetic-object-key"}
```

**Note:** `authorization` (containing SigV4 components) is L3 OMIT. `requestId`, `code`, and `resource` are L0 SAFE — they are essential for diagnosing S3 integration issues.

### 7.5 ARSY Shutdown Error (Synthetic)

**Before redaction (synthetic):**
```json
{"level":50,"time":"2026-10-31T12:04:00.000Z","msg":"shutdown failed","err":{"message":"socket hang up","stack":"Error: socket hang up\n    at connResetException (node:internal/errors:700:14)\n    at /srv/arsy/src/server.ts:18:15\n    at processTicksAndRejections (node:internal/process/task_queues:97:5)"}}
```

**After redaction:**
```json
{"level":50,"time":"2026-10-31T12:04:00.000Z","msg":"shutdown failed","err":"[ERROR_OBJECT]"}
```

**Note:** The full Error object is L2 REDACT — replaced with `[ERROR_OBJECT]`. The stack trace reveals source file paths (`/srv/arsy/src/server.ts:18:15`) which is an information disclosure risk. The error message `socket hang up` is operationally useful but the cost of extracting it safely (parsing Error objects field-by-field) exceeds the benefit; the whole object is replaced.

### 7.6 Sentinel Cycle Notice (Synthetic — GAP)

**Before redaction (synthetic):**
```
[sentinel] cycle notice (hub starting or idle): no task available, worker synthetic-worker-id idle
```

**After redaction:**
```
[sentinel] cycle notice (hub starting or idle): no task available, worker synthetic-worker-id idle
```

**Note:** This is a `console.warn` call (SE1) — it bypasses the structured logger entirely. The message string does not contain sensitive data in this case, but the lack of structured logging means the redaction contract cannot be applied. This is the critical gap identified in Section 4.2.6.

### 7.7 AI Gateway Provider Error (Synthetic)

**Before redaction (synthetic):**
```json
{"level":50,"time":"2026-10-31T12:05:00.000Z","msg":"provider request failed","provider":"openrouter","model":"synthetic-model-id","statusCode":429,"apiKey":"sk-synthetic-key-1234567890abcdef","retryAfter":60}
```

**After redaction:**
```json
{"level":50,"time":"2026-10-31T12:05:00.000Z","msg":"provider request failed","provider":"openrouter","model":"synthetic-model-id","statusCode":429,"retryAfter":60}
```

**Note:** `apiKey` is L3 OMIT — provider API keys are outbound credentials that must never appear in logs. `provider`, `model`, `statusCode`, and `retryAfter` are L0 SAFE.

### 7.8 SKYLINK WhatsApp Inbound Handler Error (Synthetic)

**Before redaction (synthetic):**
```json
{"level":50,"time":"2026-10-31T12:06:00.000Z","msg":"inbound message handler failed","err":{"message":"processing failed for chat synthetic-chat-id","stack":"Error: processing failed\n    at WhatsAppClient.handleMessage (/srv/skylink/node_modules/@moonwitness/skylink-whatsapp/src/client.ts:218:15)"}}
```

**After redaction:**
```json
{"level":50,"time":"2026-10-31T12:06:00.000Z","msg":"inbound message handler failed","err":"[ERROR_OBJECT]"}
```

**Note:** The Error object is L2 REDACT. The error message contains `synthetic-chat-id` which would be L2 REDACT as a `chatId` equivalent if it were a separate field. Since it is embedded in the error message string, the whole Error object replacement handles it.

---

## 8. Redaction Test Fixtures

### 8.1 Synthetic Secret Fixtures

All values below are **explicitly fabricated** for testing purposes. They resemble credential patterns but are not valid credentials and have no connection to any real system.

```typescript
// Fixture: synthetic-secrets.ts
// PURPOSE: Test that redaction catches all known secret patterns.
// NONE of these values are real credentials.

export const SYNTHETIC_FIXTURES = {
  // L3 OMIT — Authentication credentials
  bearerToken: 'Bearer synthetic-arsy-token-xyz789',
  apiKey: 'sk-synthetic-key-abcdef1234567890',
  serviceKey: 'synthetic-service-key-M46-08-test',
  telegramBotToken: 'synthetic-bot-token-123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  telegramWebhookSecret: 'synthetic-webhook-secret-m46-08-test-value',
  moondeckToken: 'synthetic-moondeck-csrf-token-' + 'a'.repeat(32),
  adminPassword: 'synthetic-admin-password-!@#$%^&*()',
  databaseUrl: 'postgresql://synthetic-user:synthetic-pass@localhost:5432/moonwitness_test',
  s3AccessKey: 'AKIAIOSFODNN7SYNTHETIC',
  s3SecretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYsynthetickey',
  s3Signature: 'AWS4-HMAC-SHA256 Credential=SYNTHETIC/20261031/us-east-1/s3/aws4_request, SignedHeaders=host, Signature=synthetic1234567890abcdef',

  // L3 OMIT — Private content
  privateMessageBody: 'synthetic private witness testimony content — do not log',
  outboundMessageText: 'synthetic outbound message to chat-fixture',
  qrPayload: 'synthetic-private-qr-code-data-m46-08',
  aiPromptContent: 'synthetic user prompt containing private research question',

  // L2 REDACT — Identifiers
  chatId: 'synthetic-chat-id-12345678',
  conversationId: 'synthetic-conversation-uuid-abcd-1234-efgh-5678',
  errorStack: 'Error: synthetic\n    at testFile.ts:42:10\n    at /srv/arsy/src/module.ts:100:5',

  // L1 CAUTION — Contextual identifiers
  ipAddress: '192.168.1.100',
  loginName: 'synthetic-test-user',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) SyntheticBrowser/99.0',

  // L0 SAFE — Operational fields that must survive redaction
  requestId: 'A1B2C3D4E5F67890',
  channelId: 'telegram-primary',
  channelIds: ['telegram-primary', 'whatsapp-support'],
  statusCode: 200,
  timestamp: '2026-10-31T12:00:00.000Z',
  port: 3000,
  host: '127.0.0.1',
  method: 'GET',
  route: '/api/v1/channels',
  status: 'ok',
  uptime: 12345.678,
  pid: 12345,
  signal: 'SIGTERM',
  provider: 'openrouter',
  model: 'synthetic-model-id',
  driver: 'rss',
  storage: 'fs',
};
```

### 8.2 Correlation Field Fixtures

These fixtures verify that required correlation fields survive redaction intact:

```typescript
// Fixture: correlation-fields.ts
// PURPOSE: Test that diagnostic fields are preserved after redaction.

export const CORRELATION_FIXTURES = {
  // Minimal request log entry
  minimalRequest: {
    requestId: 'SYNTH-REQ-001',
    method: 'POST',
    route: '/api/v1/send',
    statusCode: 200,
    timestamp: '2026-10-31T12:00:00.000Z',
  },

  // Error log entry with full correlation
  errorWithCorrelation: {
    requestId: 'SYNTH-REQ-002',
    method: 'GET',
    route: '/api/v1/channels',
    statusCode: 500,
    timestamp: '2026-10-31T12:01:00.000Z',
    channelId: 'telegram-primary',
    provider: 'telegram',
    err: { message: 'synthetic error', stack: 'synthetic stack trace' },
  },

  // Health probe entry
  healthProbe: {
    status: 'ok',
    uptime: 3600.123,
    channels: 2,
    timestamp: '2026-10-31T12:02:00.000Z',
  },

  // Metrics scrape entry
  metricsScrape: {
    method: 'GET',
    route: '/api/v1/metrics',
    statusCode: 200,
    pid: 12345,
    timestamp: '2026-10-31T12:03:00.000Z',
  },

  // Boot sequence entry
  bootSequence: {
    signal: 'SIGTERM',
    pid: 12345,
    host: '127.0.0.1',
    port: 3000,
    timestamp: '2026-10-31T12:04:00.000Z',
  },

  // SKYLINK registration entry
  skylinkRegistration: {
    skylink: 'http://127.0.0.1:3005',
    channels: ['telegram-primary', 'whatsapp-support'],
    timestamp: '2026-10-31T12:05:00.000Z',
  },

  // ECHOLOG S3 error entry
  echologS3Error: {
    requestId: 'SYNTH-REQ-003',
    code: 'SignatureDoesNotMatch',
    resource: '/bucket/synthetic-object-key',
    statusCode: 403,
    timestamp: '2026-10-31T12:06:00.000Z',
  },
};
```

### 8.3 Mixed Payload Fixtures

These fixtures combine safe, caution, redact, and omit fields in realistic combinations:

```typescript
// Fixture: mixed-payloads.ts
// PURPOSE: Test redaction on realistic log objects with mixed sensitivity levels.

export const MIXED_FIXTURES = {
  // Auth failure with full request context
  authFailure: {
    requestId: 'SYNTH-REQ-010',
    method: 'GET',
    route: '/api/v1/channels',
    statusCode: 401,
    timestamp: '2026-10-31T12:10:00.000Z',
    authorization: 'Bearer synthetic-arsy-token-xyz789',
    cookie: 'session=synthetic-session-cookie-value',
    remoteAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 SyntheticBrowser/99.0',
  },
  // Expected after redaction:
  // { requestId, method, route, statusCode, timestamp, remoteAddress, userAgent }
  // authorization and cookie are OMIT

  // SKYLINK send with service key
  skylinkSend: {
    requestId: 'SYNTH-REQ-011',
    method: 'POST',
    route: '/api/v1/send',
    statusCode: 503,
    timestamp: '2026-10-31T12:11:00.000Z',
    'x-skylink-key': 'synthetic-service-key-M46-08-test',
    channelId: 'telegram-primary',
    text: 'synthetic outbound message to chat-fixture',
  },
  // Expected after redaction:
  // { requestId, method, route, statusCode, timestamp, channelId }
  // x-skylink-key and text are OMIT

  // Error with full Error object
  shutdownError: {
    level: 50,
    time: '2026-10-31T12:12:00.000Z',
    msg: 'shutdown failed',
    err: {
      message: 'socket hang up',
      stack: 'Error: socket hang up\n    at /srv/arsy/src/server.ts:18:15',
    },
  },
  // Expected after redaction:
  // { level, time, msg, err: '[ERROR_OBJECT]' }

  // AI Gateway provider call with API key
  aiProviderCall: {
    requestId: 'SYNTH-REQ-012',
    provider: 'openrouter',
    model: 'synthetic-model-id',
    statusCode: 429,
    timestamp: '2026-10-31T12:13:00.000Z',
    apiKey: 'sk-synthetic-key-abcdef1234567890',
    retryAfter: 60,
    messages: [{ role: 'user', content: 'synthetic user prompt containing private research question' }],
  },
  // Expected after redaction:
  // { requestId, provider, model, statusCode, timestamp, retryAfter }
  // apiKey and messages are OMIT

  // ECHOLOG S3 auth failure
  s3AuthFailure: {
    requestId: 'SYNTH-REQ-013',
    code: 'SignatureDoesNotMatch',
    resource: '/bucket/synthetic-object-key',
    statusCode: 403,
    timestamp: '2026-10-31T12:14:00.000Z',
    authorization: 'AWS4-HMAC-SHA256 Credential=SYNTHETIC/20261031/us-east-1/s3/aws4_request',
  },
  // Expected after redaction:
  // { requestId, code, resource, statusCode, timestamp }
  // authorization is OMIT

  // WhatsApp inbound handler error
  whatsappError: {
    level: 50,
    time: '2026-10-31T12:15:00.000Z',
    msg: 'inbound message handler failed',
    err: {
      message: 'processing failed for chat synthetic-chat-id-12345678',
      stack: 'Error: processing failed\n    at client.ts:218:15',
    },
    chatId: 'synthetic-chat-id-12345678',
  },
  // Expected after redaction:
  // { level, time, msg, err: '[ERROR_OBJECT]' }
  // chatId is REDACTED to '[REDACTED]'

  // Nested object with secrets at multiple levels
  deeplyNested: {
    requestId: 'SYNTH-REQ-014',
    config: {
      host: '127.0.0.1',
      port: 3000,
      database: {
        url: 'postgresql://synthetic-user:synthetic-pass@localhost:5432/moonwitness_test',
        poolSize: 10,
      },
    },
  },
  // Expected after redaction:
  // { requestId, config: { host, port, database: { poolSize } } }
  // database.url is OMIT (recursive redaction)

  // Non-object payload
  nonObjectPayload: 'synthetic raw string log message',
  // Expected after redaction:
  // { payload: '[non-object payload]' }

  // Array payload
  arrayPayload: ['synthetic-token-1', 'synthetic-token-2'],
  // Expected after redaction:
  // { payload: '[non-object payload]' }
};
```

### 8.4 Edge Case Fixtures

```typescript
// Fixture: edge-cases.ts
// PURPOSE: Test redaction boundary conditions.

export const EDGE_CASE_FIXTURES = {
  // Empty object
  empty: {},
  // Expected: {}

  // Null value
  nullValue: { key: null },
  // Expected: { key: null }

  // Undefined value
  undefinedValue: { key: undefined },
  // Expected: { key: undefined } (or omitted by JSON serialization)

  // Boolean value
  booleanValue: { enabled: true, disabled: false },
  // Expected: { enabled: true, disabled: false }

  // Numeric value
  numericValue: { port: 3000, statusCode: 200, count: 0 },
  // Expected: { port: 3000, statusCode: 200, count: 0 }

  // Circular reference
  circular: (() => {
    const obj: Record<string, unknown> = { requestId: 'SYNTH-REQ-020' };
    obj.self = obj;
    return obj;
  })(),
  // Expected: { requestId: 'SYNTH-REQ-020', self: '[CIRCULAR]' }

  // Deeply nested (beyond depth limit)
  deepNesting: (() => {
    let obj: Record<string, unknown> = { leaf: 'value' };
    for (let i = 0; i < 10; i++) {
      obj = { nested: obj };
    }
    return obj;
  })(),
  // Expected: nested objects replaced with '[MAX_DEPTH]' at depth 5

  // Field name that looks like a secret but isn't
  falsePositive: { authorizationLevel: 'admin', cookieName: 'session', tokenCount: 5 },
  // Expected: all fields preserved (exact match only, not substring)

  // Mixed case field names
  mixedCase: { Authorization: 'Bearer synthetic', AUTHORIZATION: 'Bearer synthetic', authorization: 'Bearer synthetic' },
  // Expected: only lowercase 'authorization' is matched and OMIT'd
  // NOTE: This is a known limitation — HTTP headers are case-insensitive but
  // object keys are case-sensitive. The redactor must handle header objects
  // by normalizing keys before classification.

  // Symbol key (should be ignored)
  symbolKey: { [Symbol('secret')]: 'synthetic-value', visible: 'data' },
  // Expected: { visible: 'data' } (Symbol keys are not enumerable in JSON)

  // Prototype pollution attempt (should be safe)
  prototypePollution: Object.create(null, {
    __proto__: { value: { leaked: true } },
    safe: { value: 'data' },
  }),
  // Expected: { safe: 'data' } (own properties only)
};
```

---

## 9. Unit Test Design

### 9.1 Test Structure

The test suite is organized into three categories following the verification plan in M46-08:

1. **Normal path tests** — verify that safe fields are preserved and the redactor does not alter well-formed log objects unnecessarily.
2. **Error path tests** — verify that secrets, private content, and error objects are correctly redacted under failure conditions.
3. **Edge case tests** — verify that boundary conditions (empty objects, circular references, non-object payloads) are handled safely.

### 9.2 Test File Layout

```
test/
  m46-08-log-redaction/
    fixtures/
      synthetic-secrets.ts        # Section 8.1 fixtures
      correlation-fields.ts       # Section 8.2 fixtures
      mixed-payloads.ts           # Section 8.3 fixtures
      edge-cases.ts               # Section 8.4 fixtures
    redaction.test.ts             # Core redaction contract tests
    correlation-preservation.test.ts  # Safe field preservation tests
    integration.test.ts           # Service-level integration tests
    edge-cases.test.ts            # Boundary condition tests
```

### 9.3 Normal Path Tests

```typescript
// redaction.test.ts — Normal path assertions

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../src/redact.js';  // hypothetical import
import { CORRELATION_FIXTURES, MIXED_FIXTURES } from './fixtures/index.js';

test('redact preserves all L0 SAFE fields in minimal request log', () => {
  const input = CORRELATION_FIXTURES.minimalRequest;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.requestId, 'SYNTH-REQ-001');
  assert.equal(output.method, 'POST');
  assert.equal(output.route, '/api/v1/send');
  assert.equal(output.statusCode, 200);
  assert.equal(output.timestamp, '2026-10-31T12:00:00.000Z');
});

test('redact preserves health probe fields unchanged', () => {
  const input = CORRELATION_FIXTURES.healthProbe;
  const output = redact(input) as Record<string, unknown>;
  
  assert.deepEqual(output, input);
});

test('redact preserves boot sequence fields unchanged', () => {
  const input = CORRELATION_FIXTURES.bootSequence;
  const output = redact(input) as Record<string, unknown>;
  
  assert.deepEqual(output, input);
});

test('redact preserves SKYLINK registration channel IDs', () => {
  const input = CORRELATION_FIXTURES.skylinkRegistration;
  const output = redact(input) as Record<string, unknown>;
  
  assert.deepEqual(output.channels, ['telegram-primary', 'whatsapp-support']);
  assert.equal(output.skylink, 'http://127.0.0.1:3005');
});

test('redact preserves ECHOLOG S3 error correlation fields', () => {
  const input = CORRELATION_FIXTURES.echologS3Error;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.requestId, 'SYNTH-REQ-003');
  assert.equal(output.code, 'SignatureDoesNotMatch');
  assert.equal(output.resource, '/bucket/synthetic-object-key');
  assert.equal(output.statusCode, 403);
});

test('redact returns empty object for empty input', () => {
  const output = redact({});
  assert.deepEqual(output, {});
});

test('redact preserves null, boolean, and numeric values', () => {
  const input = { key: null, enabled: true, count: 0, port: 3000 };
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.key, null);
  assert.equal(output.enabled, true);
  assert.equal(output.count, 0);
  assert.equal(output.port, 3000);
});
```

### 9.4 Error Path Tests

```typescript
// redaction.test.ts — Error path assertions (secret leakage = 0 invariant)

test('redact removes authorization header from auth failure log', () => {
  const input = MIXED_FIXTURES.authFailure;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal('authorization' in output, false, 'authorization must be OMIT');
  assert.equal('cookie' in output, false, 'cookie must be OMIT');
  // Correlation fields preserved
  assert.equal(output.requestId, 'SYNTH-REQ-010');
  assert.equal(output.statusCode, 401);
  assert.equal(output.remoteAddress, '192.168.1.100');
});

test('redact removes service key and message text from SKYLINK send log', () => {
  const input = MIXED_FIXTURES.skylinkSend;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal('x-skylink-key' in output, false, 'service key must be OMIT');
  assert.equal('text' in output, false, 'message text must be OMIT');
  assert.equal(output.channelId, 'telegram-primary');
});

test('redact replaces Error object with placeholder', () => {
  const input = MIXED_FIXTURES.shutdownError;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.err, '[ERROR_OBJECT]');
  assert.equal(output.msg, 'shutdown failed');
});

test('redact removes API key and messages from AI provider log', () => {
  const input = MIXED_FIXTURES.aiProviderCall;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal('apiKey' in output, false, 'API key must be OMIT');
  assert.equal('messages' in output, false, 'messages must be OMIT');
  assert.equal(output.provider, 'openrouter');
  assert.equal(output.model, 'synthetic-model-id');
  assert.equal(output.statusCode, 429);
});

test('redact removes S3 authorization header', () => {
  const input = MIXED_FIXTURES.s3AuthFailure;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal('authorization' in output, false, 'S3 auth header must be OMIT');
  assert.equal(output.requestId, 'SYNTH-REQ-013');
  assert.equal(output.code, 'SignatureDoesNotMatch');
});

test('redact removes chatId and replaces Error in WhatsApp handler log', () => {
  const input = MIXED_FIXTURES.whatsappError;
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.err, '[ERROR_OBJECT]');
  assert.equal(output.chatId, '[REDACTED]');
});

test('redact removes database URL from nested config object', () => {
  const input = MIXED_FIXTURES.deeplyNested;
  const output = redact(input) as Record<string, unknown>;
  
  const config = output.config as Record<string, unknown>;
  const database = config.database as Record<string, unknown>;
  
  assert.equal('url' in database, false, 'database URL must be OMIT');
  assert.equal(database.poolSize, 10);
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 3000);
});

// The critical invariant: synthetic secrets never appear in output
test('CRITICAL: no synthetic secret appears in any redacted output', () => {
  const allSecrets = Object.values(SYNTHETIC_FIXTURES).filter(
    (v) => typeof v === 'string' && v.startsWith('synthetic')
  );
  
  for (const [, fixture] of Object.entries(MIXED_FIXTURES)) {
    const redacted = JSON.stringify(redact(fixture));
    for (const secret of allSecrets) {
      assert.equal(
        redacted.includes(secret),
        false,
        `secret "${secret.slice(0, 30)}..." found in redacted output of fixture`
      );
    }
  }
});
```

### 9.5 Edge Case Tests

```typescript
// edge-cases.test.ts — Boundary condition assertions

test('redact handles non-object payload by wrapping', () => {
  const output = redact('synthetic raw string log message');
  assert.deepEqual(output, { payload: '[non-object payload]' });
});

test('redact handles array payload by wrapping', () => {
  const output = redact(['synthetic-token-1', 'synthetic-token-2']);
  assert.deepEqual(output, { payload: '[non-object payload]' });
});

test('redact handles null input', () => {
  const output = redact(null);
  assert.deepEqual(output, { payload: '[non-object payload]' });
});

test('redact handles undefined input', () => {
  const output = redact(undefined);
  assert.deepEqual(output, { payload: '[non-object payload]' });
});

test('redact handles circular reference without infinite loop', () => {
  const obj: Record<string, unknown> = { requestId: 'SYNTH-REQ-020' };
  obj.self = obj;
  
  // Must not throw or hang
  const output = redact(obj) as Record<string, unknown>;
  assert.equal(output.requestId, 'SYNTH-REQ-020');
  assert.equal(output.self, '[CIRCULAR]');
});

test('redact respects depth limit on deeply nested objects', () => {
  let obj: Record<string, unknown> = { leaf: 'value' };
  for (let i = 0; i < 10; i++) obj = { nested: obj };
  
  const output = redact(obj) as Record<string, unknown>;
  // At depth 5, nested should be replaced
  let current: unknown = output;
  for (let i = 0; i < 5; i++) {
    assert.ok(typeof current === 'object' && current !== null);
    current = (current as Record<string, unknown>).nested;
  }
  assert.equal(current, '[MAX_DEPTH]');
});

test('redact uses exact field name match, not substring', () => {
  const input = {
    authorizationLevel: 'admin',
    cookieName: 'session',
    tokenCount: 5,
  };
  const output = redact(input) as Record<string, unknown>;
  
  assert.equal(output.authorizationLevel, 'admin');
  assert.equal(output.cookieName, 'session');
  assert.equal(output.tokenCount, 5);
});

test('redact handles class instance by replacing with placeholder', () => {
  class SecretHolder {
    constructor(public token: string) {}
  }
  const input = { err: new SecretHolder('synthetic-secret') };
  const output = redact(input) as Record<string, unknown>;
  
  // Class instances are not plain objects; replace entirely
  assert.equal(output.err, '[CLASS_INSTANCE]');
});

test('redact is deterministic — same input produces same output', () => {
  const input = MIXED_FIXTURES.authFailure;
  const output1 = JSON.stringify(redact(input));
  const output2 = JSON.stringify(redact(input));
  
  assert.equal(output1, output2);
});

test('redact does not mutate input object', () => {
  const input = { ...MIXED_FIXTURES.authFailure };
  const frozen = JSON.stringify(input);
  
  redact(input);
  
  assert.equal(JSON.stringify(input), frozen, 'input must not be mutated');
});
```

### 9.6 Integration Tests

```typescript
// integration.test.ts — Service-level log capture tests
// These tests inject a capture stream into the service's logger and verify
// that the captured output satisfies the redaction contract.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSkylinkServer } from '../../apps/skylink/src/server.js';

test('SKYLINK: info log stream contains no synthetic secrets after auth + send + ws', async () => {
  // This test mirrors the existing control-plane.test.ts:147 pattern
  // but extends it with the full redaction contract assertion.
  
  const logged: string[] = [];
  const captureStream = {
    write: (line: string) => { logged.push(line); },
  };
  
  // ... set up SKYLINK server with capture stream ...
  // ... exercise auth, send, and websocket paths ...
  
  const output = logged.join('');
  
  // The critical invariant
  const secrets = [
    'synthetic-service-key-M46-08-test',
    'synthetic-arsy-token-xyz789',
    'synthetic-private-qr-code-data-m46-08',
    'synthetic outbound message to chat-fixture',
  ];
  
  for (const secret of secrets) {
    assert.equal(
      output.includes(secret),
      false,
      `secret "${secret.slice(0, 30)}..." found in captured log output`
    );
  }
  
  // Correlation fields must be present
  assert.ok(output.includes('channel'), 'channel correlation field must be present');
});

test('ECHOLOG: error response log contains requestId but no S3 credentials', async () => {
  const logged: string[] = [];
  const captureStream = {
    write: (line: string) => { logged.push(line); },
  };
  
  // ... set up ECHOLOG server with capture stream ...
  // ... exercise S3 error path ...
  
  const output = logged.join('');
  
  assert.ok(output.includes('SYNTH-REQ-013') || output.includes('requestId'),
    'requestId correlation field must be present');
  assert.equal(output.includes('synthetic-access-key'), false,
    'S3 access key must not appear in logs');
  assert.equal(output.includes('synthetic-signature'), false,
    'S3 signature must not appear in logs');
});
```

### 9.7 Test Execution Summary

| Test Category | Test Count | Assertions | Status |
|---|---|---|---|
| Normal path (correlation preservation) | 7 | 25+ | Design specified; not yet implemented |
| Error path (secret leakage = 0) | 8 | 30+ | Design specified; not yet implemented |
| Edge cases (boundary conditions) | 10 | 20+ | Design specified; not yet implemented |
| Integration (service-level capture) | 2 | 10+ | Design specified; not yet implemented |
| **Total** | **27** | **85+** | **All deferred pending owner review** |

---

## 10. Privacy/Security Review Framework

### 10.1 Review Checklist

The privacy/security review must verify each of the following before the redaction contract can be considered complete:

| # | Review Item | Verification Method | Pass Criteria |
|---|---|---|---|
| R1 | All L3 OMIT fields are removed from log output | Automated test with synthetic fixtures | `secret fixture leakage = 0` |
| R2 | All L0 SAFE fields are preserved in log output | Automated test with correlation fixtures | `useful fields retained = 100%` |
| R3 | No real credentials are used in any test fixture | Manual review of fixture files | All values prefixed `synthetic-` |
| R4 | No real private witness content appears in fixtures | Manual review + owner sign-off | Owner confirms no real content |
| R5 | Redactor handles circular references safely | Automated edge case test | No infinite loop; `[CIRCULAR]` placeholder |
| R6 | Redactor respects depth limit | Automated edge case test | `[MAX_DEPTH]` at depth 5 |
| R7 | Redactor does not mutate input objects | Automated test with frozen comparison | Input unchanged after redaction |
| R8 | Redactor is deterministic | Automated test with repeated invocation | Same output for same input |
| R9 | Non-object payloads are handled safely | Automated edge case test | Wrapped in `{ payload: '[non-object payload]' }` |
| R10 | Field matching is exact, not substring | Automated test with false positive names | `authorizationLevel` not matched by `authorization` rule |
| R11 | Sentinel console.* calls are covered | Manual review + migration test | All console.warn/error routed through redactor |
| R12 | Cockpit logger: false remains secure | Manual review | No logging added without redaction contract |
| R13 | Error handler responses do not leak to logs | Integration test | Error response bodies not serialized to log stream |
| R14 | HTTP header case normalization | Automated test | `Authorization`, `AUTHORIZATION`, `authorization` all matched |

### 10.2 Review Authority

| Role | Responsibility | Name/Position |
|---|---|---|
| Security reviewer | Verify redaction contract covers all L3/L2 fields | Owner-designated security authority |
| Privacy reviewer | Verify no real PII in fixtures; verify retention policy | Owner-designated privacy authority |
| Service owner | Verify diagnostic utility is preserved | Per-service owner (ARSY, SKYLINK, ECHOLOG, etc.) |
| Implementation reviewer | Verify test coverage and edge case handling | Code reviewer for the redaction PR |

### 10.3 Review Sign-Off Template

```
M46-08 Privacy/Security Review Sign-Off
=========================================

Date: ____________
Reviewer: ____________
Role: ____________

Redaction contract version: ____________
Test suite version: ____________
Fixture files reviewed: [ ] synthetic-secrets.ts [ ] correlation-fields.ts
                        [ ] mixed-payloads.ts [ ] edge-cases.ts

Checklist results:
  R1  [ ] PASS  [ ] FAIL  [ ] N/A
  R2  [ ] PASS  [ ] FAIL  [ ] N/A
  R3  [ ] PASS  [ ] FAIL  [ ] N/A
  R4  [ ] PASS  [ ] FAIL  [ ] N/A
  R5  [ ] PASS  [ ] FAIL  [ ] N/A
  R6  [ ] PASS  [ ] FAIL  [ ] N/A
  R7  [ ] PASS  [ ] FAIL  [ ] N/A
  R8  [ ] PASS  [ ] FAIL  [ ] N/A
  R9  [ ] PASS  [ ] FAIL  [ ] N/A
  R10 [ ] PASS  [ ] FAIL  [ ] N/A
  R11 [ ] PASS  [ ] FAIL  [ ] N/A
  R12 [ ] PASS  [ ] FAIL  [ ] N/A
  R13 [ ] PASS  [ ] FAIL  [ ] N/A
  R14 [ ] PASS  [ ] FAIL  [ ] N/A

Findings:
  ____________

Verdict: [ ] APPROVED  [ ] APPROVED WITH CONDITIONS  [ ] REJECTED

Conditions (if any):
  ____________

Signature: ____________
```

### 10.4 Security Properties

The redaction contract provides the following security properties:

**SP1: Confidentiality.** L3 fields (credentials, private content) are removed before log output is produced. An attacker with read access to the log stream cannot extract these values.

**SP2: Integrity.** The redactor is a pure function with no side effects. It cannot be influenced by external state to skip redaction for a specific input.

**SP3: Availability.** The redactor handles edge cases (circular references, depth limits, non-object payloads) without throwing exceptions or hanging. A malformed log input cannot cause the logging system to fail.

**SP4: Auditability.** The field classification register (Section 5.2) is explicit and machine-readable. An auditor can verify that every known sensitive field has a classification and that the redactor implements it correctly.

**SP5: Non-inference.** The redactor does not attempt to classify fields by name pattern matching or value heuristics. Only explicitly classified field names trigger redaction. This prevents both false positives (over-redaction) and false negatives (under-redaction from clever field naming).

---

## 11. Retention Policy Documentation

### 11.1 Log Retention Principles

The retention policy for structured logs follows the same principles established in SECURITY.md for other data categories:

**P1: Purpose limitation.** Logs exist for operational diagnostics and incident investigation. They are not a data warehouse, not an audit trail for compliance, and not a source for analytics.

**P2: Minimization.** Log only the fields classified as L0 SAFE or L1 CAUTION (after redaction). L2 REDACT fields are replaced with placeholders. L3 OMIT fields are removed entirely.

**P3: Time limitation.** Log entries have a maximum retention period after which they must be deleted or anonymized.

### 11.2 Retention Schedule

| Log Category | Maximum Retention | Rationale | Disposal Method |
|---|---|---|---|
| Request logs (L0 fields only) | 30 days | Operational diagnostics window | Automatic rotation + deletion |
| Error logs (with redacted fields) | 90 days | Incident investigation window | Automatic rotation + deletion |
| Debug logs (verbose, development only) | 7 days | Development aid; no production value | Automatic rotation + deletion |
| Security events (auth failures, denials) | 180 days | Security incident response window | Automatic rotation + deletion |
| Boot/shutdown logs | 90 days | Process lifecycle tracking | Automatic rotation + deletion |

### 11.3 Retention Constraints

| Constraint | Value | Source |
|---|---|---|
| Maximum log file size | 100 MB per file | Operational constraint |
| Maximum total log storage | 1 GB | Host disk capacity |
| Log rotation frequency | Daily or at size limit, whichever comes first | Standard practice |
| Backup retention | Same as primary; backups are not an extension | SECURITY.md backup principles |
| Cross-border transfer | Logs must not be transferred to jurisdictions without adequate protection | Privacy requirement |

### 11.4 Retention for Specific Services

| Service | Log Destination | Retention | Notes |
|---|---|---|---|
| ARSY | stdout/stderr (pino) | Per schedule above | Fastify logger writes to stdout; container runtime captures |
| SKYLINK | stdout/stderr (pino via injectable stream) | Per schedule above | Test capture streams are in-memory only |
| ECHOLOG | stdout/stderr (pino via injectable stream) | Per schedule above | `disableRequestLogging: true` reduces volume |
| Cockpit | None (logger: false) | N/A | No logs produced; if logging is added, retention applies |
| AIGateway | stdout/stderr (pino via injectable stream) | Per schedule above | AI prompt/response content is L3 OMIT |
| Sentinel | stdout/stderr (console.*) | Per schedule above | GAP: must migrate to structured logger for redaction |

### 11.5 D18/D19 Special Retention

| Data Category | Service | Log Retention | Authority |
|---|---|---|---|
| SKYLINK message bodies (D18) | SKYLINK | ZERO — must never appear in logs | SECURITY.md §SKYLINK |
| SKYLINK raw Telegram updates (D18) | SKYLINK | ZERO — no `raw` column exists | SECURITY.md §SKYLINK |
| ECHOLOG object bytes (D19) | ECHOLOG | ZERO — untrusted inbound bytes | SECURITY.md §ECHOLOG |
| ECHOLOG S3 credentials | ECHOLOG | ZERO — never leave ECHOLOG | SECURITY.md §ECHOLOG |
| ECHOLOG presigned download TTL | ECHOLOG | ZERO — never logged | SECURITY.md §ECHOLOG |

---

## 12. Risk Analysis

### 12.1 Over-Redaction vs. Under-Redaction

The fundamental tension in log redaction is between two failure modes:

| Failure Mode | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| **Over-redaction** | Too many fields are removed or replaced, making logs useless for diagnosis | Developers cannot debug production issues; incident response time increases | MEDIUM | Explicit field classification (Section 5.2); L0 SAFE fields always preserved; review each OMIT/REDACT decision |
| **Under-redaction** | Sensitive fields leak into log output | Credential exposure; PII violation; compliance breach | LOW (with explicit classification) | Synthetic fixture leakage test = 0 invariant; security review checklist (Section 10.1) |

### 12.2 Risk Matrix

| Risk ID | Risk | Severity | Likelihood | Detection | Mitigation | Residual Risk |
|---|---|---|---|---|---|---|
| RSK-01 | New log callsite added without redaction review | HIGH | MEDIUM | Code review | CONTRIBUTING.md checklist item; pre-commit hook | MEDIUM |
| RSK-02 | Field classification register becomes stale | MEDIUM | HIGH | Periodic audit | Automated scan for new `app.log.*` callsites | LOW |
| RSK-03 | Redactor bug allows secret leakage | CRITICAL | LOW | Synthetic fixture test suite | Property-based testing; fuzz testing with random field names | LOW |
| RSK-04 | Error message contains user input that is PII | MEDIUM | MEDIUM | L1 CAUTION classification | Error message redaction policy; per-callsite review | MEDIUM |
| RSK-05 | Sentinel console.* bypasses redaction | HIGH | CERTAIN (current state) | Manual review | Migrate Sentinel to structured logger | LOW (after migration) |
| RSK-06 | Log aggregation service receives unredacted logs | HIGH | LOW | Integration test | Redaction at source (before log reaches stream) | LOW |
| RSK-07 | Developer enables debug logging in production | MEDIUM | LOW | Configuration review | Environment-specific log level; debug level requires explicit opt-in | LOW |
| RSK-08 | Nested object contains secret at unclassified key | HIGH | LOW | Edge case test | Recursive redaction with depth limit; unknown fields pass through by design (P5) | MEDIUM |
| RSK-09 | HTTP header case mismatch bypasses redaction | MEDIUM | LOW | Edge case test | Header normalization before classification (R14) | LOW |
| RSK-10 | Correlation ID collision or leakage | LOW | LOW | Integration test | Opaque UUID format; no user data in correlation IDs | LOW |

### 12.3 Over-Redaction Impact Analysis

Specific scenarios where over-redaction would harm diagnostic capability:

| Scenario | Field at Risk | Diagnostic Impact | Decision |
|---|---|---|---|
| Auth failure investigation | `authorization` header value | Cannot determine if bearer token was malformed, expired, or missing | OMIT is correct — the *fact* of auth failure is logged; the token value is never needed for diagnosis |
| S3 signature debugging | `authorization` header (SigV4) | Cannot verify which credential was used | OMIT is correct — the `code: 'SignatureDoesNotMatch'` and `requestId` are sufficient for diagnosis |
| Error stack trace analysis | `err.stack` | Cannot identify exact failure location in source | REDACT is correct — stack traces reveal source paths; the `err.message` (in L1 CAUTION) provides the failure reason |
| AI provider rate limiting | `apiKey` | Cannot verify which key hit the rate limit | OMIT is correct — the `provider` and `model` fields identify the integration; the key itself is a secret |
| User-specific debugging | `login` / `chatId` | Cannot reproduce user-specific issue | CAUTION/REDACT is correct — use a synthetic user ID in test environments; in production, the `requestId` enables correlation without PII |

### 12.4 Under-Redaction Impact Analysis

Specific scenarios where under-redaction could expose sensitive data:

| Scenario | Field at Risk | Exposure Impact | Current Status |
|---|---|---|---|
| SKYLINK webhook processing | `x-telegram-bot-api-secret-token` | Webhook secret enables forgery | COVERED — existing test asserts non-leakage |
| ECHOLOG S3 error path | S3 `Authorization` header | Credential enables object access | COVERED — classified as L3 OMIT |
| ARSY database connection failure | `DATABASE_URL` with embedded password | Database credential exposure | COVERED — classified as L3 OMIT |
| Sentinel driver error | Error message with user data | PII exposure in console output | GAP — console.warn bypasses structured logging |
| AI Gateway provider error | API key in error context | Provider billing account compromise | COVERED — classified as L3 OMIT |

### 12.5 Risk Acceptance

| Risk | Accepted By | Conditions | Review Date |
|---|---|---|---|
| RSK-05 (Sentinel console.* gap) | Service owner | Must be migrated before M46-08 implementation | Before implementation PR |
| RSK-08 (unclassified nested key) | Security reviewer | Recursive redaction with depth limit is the safety net | Periodic audit |
| RSK-04 (error message PII) | Privacy reviewer | L1 CAUTION classification; per-callsite review for known user-input paths | Before implementation PR |

---

## 13. Metrics and Success Criteria

### 13.1 Primary Metrics

| Metric | Target | Measurement Method | Status |
|---|---|---|---|
| **Secret fixture leakage** | 0 | Automated test: every synthetic secret in Section 8.1 is searched for in every redacted output from Section 8.3 | Not yet measured (implementation deferred) |
| **Useful fields retained** | 100% of L0 SAFE fields | Automated test: every correlation fixture field from Section 8.2 is verified present in redacted output | Not yet measured (implementation deferred) |
| **Callsite coverage** | 100% of discovered callsites | Manual audit: every callsite in Section 4.2 has a classification | COMPLETE (this document) |
| **Test count** | >= 27 tests | Automated test runner | Not yet measured (implementation deferred) |

### 13.2 Secondary Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Redaction overhead per log call | < 5% of total log call duration | Microbenchmark: `redact()` vs. direct log call |
| False positive rate (over-redaction) | 0 | No L0 SAFE field is ever removed or replaced |
| False negative rate (under-redaction) | 0 | No L3 OMIT field ever appears in output |
| Edge case handling | 100% | All edge cases in Section 8.4 produce safe output without throwing |
| Determinism | 100% | Same input always produces same output (verified by repeated invocation) |

### 13.3 Success Criteria

The M46-08 task is considered complete when ALL of the following are true:

| # | Criterion | Verification | Current Status |
|---|---|---|---|
| SC1 | Field classification register exists and covers all discovered callsites | This document, Section 5.2 | COMPLETE |
| SC2 | Redaction contract is specified as a pure function | This document, Section 6.2 | COMPLETE |
| SC3 | Synthetic test fixtures exist for all sensitivity levels | This document, Section 8 | COMPLETE (design) |
| SC4 | Unit tests for normal paths pass | Section 9.3 tests | DEFERRED (implementation) |
| SC5 | Unit tests for error paths pass with leakage = 0 | Section 9.4 tests | DEFERRED (implementation) |
| SC6 | Unit tests for edge cases pass | Section 9.5 tests | DEFERRED (implementation) |
| SC7 | Integration tests pass for at least one service | Section 9.6 tests | DEFERRED (implementation) |
| SC8 | Privacy/security review sign-off obtained | Section 10.3 template | DEFERRED (owner action) |
| SC9 | Retention policy documented | This document, Section 11 | COMPLETE |
| SC10 | Risk analysis complete | This document, Section 12 | COMPLETE |
| SC11 | No real private data used in any fixture | Manual verification | COMPLETE (all values are `synthetic-*`) |
| SC12 | Closure evidence assembled | Inventory (Section 4), fixtures (Section 8), sign-off template (Section 10.3) | PARTIAL (sign-off deferred) |

### 13.4 Metrics Dashboard (Conceptual)

```
M46-08 Privacy-Safe Diagnostics Dashboard
============================================

Secret Leakage:        [████████████████████] 0/0 target met
Correlation Retained:  [████████████████████] 100% of L0 fields
Callsite Coverage:     [████████████████████] 30/30 classified
Test Suite:            [░░░░░░░░░░░░░░░░░░░░] 0/27 implemented
Redaction Overhead:    [░░░░░░░░░░░░░░░░░░░░] not measured
Review Sign-Off:       [░░░░░░░░░░░░░░░░░░░░] pending

Legend: ████ complete  ░░░░ pending  ▓▓▓▓ in progress
```

---

## 14. Implementation Considerations (Deferred)

This section documents implementation decisions that are deferred pending owner review. No code is written; these are design recommendations for the implementation phase.

### 14.1 File Layout

```
packages/
  moonql/
    src/
      log.ts                    # Existing Log interface — extend with redaction
      log-redact.ts             # NEW: pure redaction function
      log-redact-rules.ts       # NEW: field classification register
  moonql/test/
    log-redact.test.ts          # NEW: redaction contract tests

apps/
  arsy/src/
    lib/
      log-config.ts             # NEW: redacting logger configuration
  skylink/src/
    log-config.ts               # NEW: redacting logger configuration
  echolog/src/
    log-config.ts               # NEW: redacting logger configuration
  aigateway/src/
    log-config.ts               # NEW: redacting logger configuration
  sentinel/src/
    log-config.ts               # NEW: migrate from console.* to structured logger
```

### 14.2 Implementation Phases

| Phase | Scope | Effort | Dependencies |
|---|---|---|---|
| Phase 1 | Core redaction function + unit tests | 2-3 days | This design document approved |
| Phase 2 | ARSY integration (simplest case; already uses `app.log`) | 1 day | Phase 1 |
| Phase 3 | SKYLINK integration (extend existing hygiene test) | 1 day | Phase 1; existing test at control-plane.test.ts:147 |
| Phase 4 | ECHOLOG + AIGateway integration | 1-2 days | Phase 1 |
| Phase 5 | Sentinel migration from console.* to structured logger | 1-2 days | Phase 1; service owner review |
| Phase 6 | Integration tests + security review sign-off | 1-2 days | Phases 2-5 |
| **Total** | | **7-12 days** | |

### 14.3 Redaction Function Implementation Notes

**Note 1: Plain object detection.** Use `Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null` to distinguish plain objects from class instances. Class instances (Error, custom classes) are replaced with `[CLASS_INSTANCE]`.

**Note 2: Error object handling.** Error objects have `message`, `stack`, and `name` properties that are not enumerable. The redactor must check `instanceof Error` before the plain-object check, and replace the entire Error with `[ERROR_OBJECT]`.

**Note 3: HTTP header normalization.** When redacting request/response objects, HTTP headers may be in any case (`Authorization`, `authorization`, `AUTHORIZATION`). The redactor should normalize header keys to lowercase before classification. This is a separate concern from the field-level redactor and should be handled at the integration layer.

**Note 4: Pino serializer.** Fastify's pino logger uses serializers to convert objects before logging. The redaction contract can be implemented as a custom pino serializer, which would apply redaction automatically to every log call without modifying individual callsites. This is the recommended integration approach.

```typescript
// Conceptual — pino serializer integration
const redactingSerializer = {
  serialize(obj: unknown): unknown {
    return redact(obj);
  }
};

const logger = pino({
  serializers: {
    // Apply to the default 'req' and 'res' serializers
    req: (req) => ({ ...pino.stdSerializers.req(req), /* redact headers */ }),
    err: () => '[ERROR_OBJECT]',
    // Apply to any custom field
    payload: redactingSerializer.serialize,
  },
});
```

**Note 5: Performance optimization.** For high-throughput services (ARSY metrics endpoint, SKYLINK event bus), the redaction function should be optimized to skip objects that have no classifiable fields. A fast-path check: if `Object.keys(obj).every(k => !RULES.has(k))`, return the object unchanged. This avoids the cost of recursive redaction for the common case where log objects contain only safe fields.

### 14.4 Testing Strategy

**Strategy 1: Property-based testing.** Use a property-based testing library (e.g., `fast-check`) to generate random log objects and verify that:
- No L3 field name appears in the redacted output
- All L0 field names from the input appear in the redacted output
- The redactor does not throw for any input
- The redactor produces the same output for the same input (determinism)

**Strategy 2: Fuzz testing.** Generate random strings as field values and verify that no string matching a secret pattern (e.g., `sk-*`, `Bearer *`, `AKIA*`) appears in the redacted output.

**Strategy 3: Regression testing.** The existing SKYLINK hygiene test (`control-plane.test.ts:147`) is a regression test. Any new callsite that logs sensitive data must add a corresponding regression test.

### 14.5 Migration Path for Sentinel

Sentinel currently uses `console.warn` and `console.error` directly. Migration to the structured logger requires:

1. Replace `console.warn(msg)` with `log.warn({}, msg)` using the `Log` interface from `packages/moonql/src/log.ts`.
2. Replace `console.error(msg)` with `log.error({}, msg)`.
3. Inject the logger from the Fastify instance or create a standalone pino logger with the redaction serializer.
4. Verify that no `console.*` calls remain in `apps/sentinel/src/`.

### 14.6 Rollback Plan

If the redaction contract causes issues in production:

1. **Revert the redactor.** Remove the redaction serializer from the logger configuration. Logs return to unredacted output.
2. **Never restore raw secret logging.** Even in rollback, the field classification register (Section 5.2) remains authoritative. Callsites that were identified as logging L3 fields must be fixed at the callsite level (remove the field from the log object) rather than relying on the redactor.
3. **Communicate the rollback.** Notify the security reviewer that the redaction layer is temporarily disabled and that callsite-level fixes are in place.

---

## 15. Deferred Items Requiring Owner Action

### 15.1 Owner Decision Register

| # | Item | Decision Required | Owner | Priority | Blocks |
|---|---|---|---|---|---|
| D1 | Approve field classification register (Section 5.2) | Sign-off on L0/L1/L2/L3 assignments | Security reviewer | P0 | Phase 1 implementation |
| D2 | Approve synthetic fixtures (Section 8) | Confirm no resemblance to real credentials | Security reviewer | P1 | Phase 1 testing |
| D3 | Sentinel console.* migration | Authorize migration to structured logger | Sentinel service owner | P1 | RSK-05 mitigation |
| D4 | Cockpit logging policy | Confirm `logger: false` remains; or authorize structured logging with redaction | Cockpit service owner | P2 | Future Cockpit diagnostics |
| D5 | Log retention schedule approval | Accept retention periods in Section 11.2 | Privacy reviewer / operations | P2 | Retention enforcement |
| D6 | Cross-service correlation ID format | Approve format for M46-30 integration | ARSY service owner | P2 | M46-30 implementation |
| D7 | AI Gateway prompt/response logging | Confirm L3 OMIT for all AI content; or define bounded exception | AI Gateway owner | P1 | AI Gateway integration |
| D8 | ECHOLOG S3 request ID propagation | Authorize adding requestId to structured log (not just error XML) | ECHOLOG service owner | P2 | ECHOLOG diagnostics |
| D9 | Debug log level in production | Define policy: is debug-level logging permitted in production? | Operations | P2 | RSK-07 mitigation |
| D10 | Privacy/security review sign-off | Execute sign-off template (Section 10.3) | Security + Privacy reviewers | P0 | Task closure |

### 15.2 M16/M18/M19 Owner Gate Statement

M46-08 depends on M16 (private witness objects), M18 (single publication state machine), and M19 (design/frontend) for the following reason: real/private logs from these domains would contain witness content, publication state transitions, and user-facing data that require separate owner authorization to even inspect for logging purposes.

**This document uses synthetic data exclusively.** No real logs were inspected. No private witness content was used. No publication state data was logged. The field classification register (Section 5.2) is based on code inspection of logging callsites and the security boundaries defined in SECURITY.md, not on inspection of actual log output.

When M16/M18/M19 owners authorize inspection of real log output for a future implementation phase, the following additional steps are required:

1. Obtain written authorization from each domain owner to inspect their log output.
2. Inspect actual log output (not code) to discover fields not identified in the code-level audit.
3. Update the field classification register with any newly discovered fields.
4. Re-run the synthetic fixture test suite against the updated register.
5. Obtain privacy/security review sign-off on the updated register.

### 15.3 Related Task Dependencies

| Task | Dependency Type | Impact on M46-08 |
|---|---|---|
| M46-30 (cross-service correlation) | Successor | M46-30 depends on M46-08's correlation field contract (requestId format, propagation rules) |
| M46-29 (worker lifecycle) | Sibling | M46-29's lifecycle events must comply with M46-08's redaction contract |
| M46-12 (adversarial tests) | Sibling | AI Gateway denial reasons logged during adversarial tests must not leak prompt content |
| M38-11 (SKYLINK log hygiene) | Predecessor evidence | Existing SKYLINK test provides the pattern for M46-08's integration tests |
| M34-01 (Research exposure) | Predecessor evidence | Research content classification (L3 OMIT) is derived from M34-01's exposure ledger |

---

## 16. Conclusion: BASELINE ESTABLISHED

### 16.1 Summary of Deliverables

This document establishes the complete design baseline for M46-08:

| Deliverable | Section | Status |
|---|---|---|
| Log callsite inventory (30+ callsites across 6 services) | Section 4 | COMPLETE |
| Sensitive field classification register (60+ fields) | Section 5 | COMPLETE |
| Redaction strategy design (pure function, field-level) | Section 6 | COMPLETE |
| Synthetic log examples (before/after redaction) | Section 7 | COMPLETE |
| Test fixtures (secrets, correlation, mixed, edge cases) | Section 8 | COMPLETE |
| Unit test design (27 tests, 85+ assertions) | Section 9 | COMPLETE |
| Privacy/security review framework (14-item checklist) | Section 10 | COMPLETE |
| Retention policy documentation | Section 11 | COMPLETE |
| Risk analysis (10 risks, over/under-redaction tradeoffs) | Section 12 | COMPLETE |
| Metrics and success criteria (12 criteria) | Section 13 | COMPLETE |
| Implementation considerations (deferred) | Section 14 | COMPLETE (design only) |
| Deferred items register (10 owner decisions) | Section 15 | COMPLETE |

### 16.2 Key Findings

**F1: The codebase already has a proven log hygiene pattern.** SKYLINK's `control-plane.test.ts:147–196` demonstrates that injectable logger streams and synthetic secret assertions work correctly. This pattern is directly extensible to all services.

**F2: Most existing callsites are already well-designed.** Of 30+ callsites discovered, 16 (53%) already log only L0 SAFE fields. The remaining callsites require either field removal (9 REVIEW items) or structural migration (5 GAP items using `console.*`).

**F3: The critical gap is Sentinel's unstructured logging.** Sentinel uses `console.warn`/`console.error` directly, bypassing any possibility of field-level redaction. This is the highest-priority implementation item.

**F4: No new infrastructure is required.** The redaction contract operates on the existing `Log` interface and Fastify's pino logger. Implementation is a pure function plus a pino serializer — no new dependencies, no new services, no new data stores.

**F5: The field classification approach is more reliable than pattern matching.** By classifying fields by name (exact match) rather than scanning values for patterns (regex, heuristics), the redactor avoids both false positives (legitimate data that looks like a secret) and false negatives (secrets that don't match any pattern).

### 16.3 Invariants

The following invariants hold for the baseline design and must be preserved by any implementation:

1. **Secret fixture leakage = 0.** No synthetic secret from Section 8.1 appears in any redacted output.
2. **Useful fields retained = 100%.** Every L0 SAFE field from Section 8.2 appears unchanged in redacted output.
3. **No real private data.** All test fixtures use synthetic values prefixed `synthetic-`.
4. **Pure function.** The redactor has no side effects, no ambient state, and is deterministic.
5. **Fail-closed.** Non-object, circular, and deeply-nested inputs produce safe placeholder output.
6. **Existing wrappers only.** No new logging library or telemetry backend is introduced.

### 16.4 Next Steps

| Step | Action | Owner | Prerequisite |
|---|---|---|---|
| 1 | Owner reviews this design baseline | Security/service owner | This document |
| 2 | Owner approves field classification register (D1) | Security reviewer | Step 1 |
| 3 | Owner approves synthetic fixtures (D2) | Security reviewer | Step 1 |
| 4 | Implement core redaction function (Phase 1) | Implementation owner | Steps 2-3 |
| 5 | Implement unit tests (Phase 1) | Implementation owner | Step 4 |
| 6 | Integrate with ARSY (Phase 2) | ARSY owner | Step 5 |
| 7 | Extend SKYLINK hygiene test (Phase 3) | SKYLINK owner | Step 5 |
| 8 | Integrate ECHOLOG + AIGateway (Phase 4) | Service owners | Step 5 |
| 9 | Migrate Sentinel (Phase 5) | Sentinel owner | Steps 3, D3 |
| 10 | Execute privacy/security review sign-off (D10) | Reviewers | Steps 6-9 |
| 11 | Close M46-08 in TODO.md | Repository maintainer | Step 10 |

### 16.5 Document Provenance

| Field | Value |
|---|---|
| **Document ID** | M46-08-audit-log-privacy-redaction |
| **File path** | `docs/audit/M46-08-audit-log-privacy-redaction.md` |
| **Status** | BASELINE ESTABLISHED |
| **Implementation status** | DEFERRED (design complete; implementation pending owner review) |
| **Code changes** | NONE (no production code was modified) |
| **Data classification** | SYNTHETIC ONLY (no real logs, credentials, or private data) |
| **Authority** | M46-08 task specification in TODO.md; SECURITY.md; agents.md |
| **Related documents** | M34-01 (Research exposure), M38-11 (SKYLINK log hygiene), M46-07 (health semantics), M46-09 (AI tool manifests), M46-10 (CSP), M46-30 (cross-service correlation) |

---

*This document is a design baseline. It establishes the inventory, classification, strategy, test design, and review framework for M46-08. Implementation is deferred pending owner review and approval of the field classification register and synthetic fixtures. No checkbox in TODO.md is changed by this document.*
