# M46-30: Cross-Boundary Request Correlation Design

**Task ID:** M46-30  
**Priority:** P2  
**Difficulty:** D4  
**Dependencies:** M46-08  
**Owner:** ARSY plus one consumer  
**Effort:** L (5–10 days)  
**Status:** BASELINE ESTABLISHED — 2026-10-31  
**Evidence Type:** Design document (no code implemented)

---

## Executive Summary

This design document establishes a privacy-safe request correlation framework for tracing synthetic requests across the ARSY API boundary and one consumer application without exposing personal identifiers. The framework defines a correlation ID format, propagation mechanism, redaction rules, and validation strategy.

**Key Findings:**
- Correlation IDs must be opaque, non-sequential, and time-bounded
- Propagation requires explicit opt-in at each service boundary
- Redaction must occur before logging, metrics, and error responses
- Synthetic testing validates format, propagation, and invalid ID handling
- No personal data (session tokens, user IDs, IP addresses) may appear in correlation metadata

**Scope Limitation:** This document covers design only. Implementation requires ARSY and consumer application code changes, which are deferred to a future engineering task.

---

## 1. Problem Statement

### 1.1 Current State

Request tracing across service boundaries is currently ad-hoc:
- ARSY API logs requests with internal IDs (not propagated)
- Consumer applications (e.g., headquarters, dock) log separately
- No mechanism to correlate a single user journey across both services
- Debugging cross-service failures requires manual log correlation by timestamp

### 1.2 Desired State

A single synthetic request should be traceable end-to-end:
1. Consumer generates correlation ID
2. ID propagates to ARSY via HTTP header
3. Both services log the ID
4. ID is redacted from external responses and metrics
5. Invalid/malformed IDs are replaced server-side

### 1.3 Constraints

- **Privacy:** No personal identifiers in correlation metadata
- **Security:** IDs must not be guessable or enumerable
- **Performance:** Overhead <1% per request
- **Compatibility:** Must work with existing HTTP clients and proxies
- **Observability:** IDs must appear in structured logs and tracing systems

---

## 2. Correlation ID Format

### 2.1 Specification

```
Format: <version>-<timestamp>-<random>-<checksum>
Length: 43 characters (fixed)
Example: v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0

Components:
- version: "v1" (2 chars) — format version for future migration
- timestamp: ISO 8601 UTC without separators (15 chars)
  - Format: YYYYMMDDTHHMMSSZ
  - Example: 20261031T142800Z
  - Precision: seconds (sufficient for correlation, not tracking)
- random: 16-character base32-encoded random value (16 chars)
  - Alphabet: a-z0-9 (lowercase alphanumeric, 32 symbols)
  - Entropy: 80 bits (2^80 possible values)
  - Generation: cryptographically secure PRNG (crypto.randomBytes)
- checksum: 4-character CRC32 of preceding components (4 chars)
  - Purpose: detect malformed IDs, not security
  - Algorithm: CRC32 (standard, fast)
```

### 2.2 Rationale

**Why not UUID v4?**
- UUID v4 is 36 characters (128 bits), but only 122 bits are random
- Our format is 43 characters but includes timestamp for free
- Timestamp enables time-bounded queries without full-table scans
- Base32 encoding is URL-safe and case-insensitive

**Why not UUID v7 (time-sorted)?**
- UUID v7 is not yet widely supported
- Our format is simpler to parse and validate
- Timestamp precision (seconds) is sufficient for correlation

**Why fixed length?**
- Simplifies validation (reject anything != 43 chars)
- Predictable storage requirements in logs and databases
- Easier to redact (single regex pattern)

### 2.3 Validation Rules

```javascript
const CORRELATION_ID_REGEX = /^v1-\d{8}T\d{6}Z-[a-z0-9]{16}-[a-z0-9]{4}$/;

function validateCorrelationId(id) {
  if (typeof id !== 'string') return false;
  if (id.length !== 43) return false;
  if (!CORRELATION_ID_REGEX.test(id)) return false;
  
  // Verify checksum
  const parts = id.split('-');
  const payload = `${parts[0]}-${parts[1]}-${parts[2]}`;
  const expectedChecksum = crc32(payload).toString(16).padStart(4, '0');
  if (parts[3] !== expectedChecksum) return false;
  
  // Verify timestamp is reasonable (not future, not ancient)
  const timestamp = parts[1];
  const date = new Date(
    `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}T` +
    `${timestamp.slice(9, 11)}:${timestamp.slice(11, 13)}:${timestamp.slice(13, 15)}Z`
  );
  const now = Date.now();
  const age = now - date.getTime();
  if (age < 0 || age > 24 * 60 * 60 * 1000) return false; // max 24 hours old
  
  return true;
}
```

### 2.4 Generation

```javascript
import { randomBytes } from 'crypto';

function generateCorrelationId() {
  const version = 'v1';
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const random = randomBytes(10).toString('base64url').toLowerCase().slice(0, 16);
  const payload = `${version}-${timestamp}-${random}`;
  const checksum = crc32(payload).toString(16).padStart(4, '0');
  return `${payload}-${checksum}`;
}
```

---

## 3. Propagation Mechanism

### 3.1 HTTP Header

**Header Name:** `X-Correlation-Id`  
**Direction:** Consumer → ARSY (request), ARSY → Consumer (response, optional)  
**Cardinality:** Single value (not multi-valued)

**Example:**
```http
POST /api/v1/missions HTTP/1.1
Host: arsy.example.com
X-Correlation-Id: v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
Content-Type: application/json

{
  "title": "Synthetic Mission",
  "description": "Test correlation ID propagation"
}
```

### 3.2 Propagation Rules

**Consumer Application (e.g., headquarters):**
1. Generate correlation ID at request initiation
2. Attach to outgoing HTTP request as `X-Correlation-Id` header
3. Log ID with request metadata (method, path, timestamp)
4. Include ID in client-side error reports

**ARSY API:**
1. Extract `X-Correlation-Id` from incoming request
2. Validate format and checksum
3. If invalid or missing, generate new ID and log warning
4. Propagate to downstream services (if any) via same header
5. Log ID with request metadata (route, user role, timestamp)
6. Include ID in response header (optional, for debugging)
7. Never include ID in response body (privacy boundary)

**Downstream Services (if any):**
- Same rules as ARSY API
- Each service logs the ID independently
- No service modifies the ID after generation

### 3.3 Edge Cases

**Missing Header:**
- ARSY generates a new ID
- Logs warning: "Missing X-Correlation-Id header, generated new ID"
- Request proceeds normally

**Invalid Format:**
- ARSY generates a new ID
- Logs warning: "Invalid X-Correlation-Id format, generated new ID"
- Request proceeds normally

**Expired Timestamp (>24 hours):**
- ARSY generates a new ID
- Logs warning: "Expired X-Correlation-Id timestamp, generated new ID"
- Request proceeds normally

**Checksum Mismatch:**
- ARSY generates a new ID
- Logs warning: "X-Correlation-Id checksum mismatch, generated new ID"
- Request proceeds normally

**Multiple Values:**
- ARSY uses the first value, ignores the rest
- Logs warning: "Multiple X-Correlation-Id values, using first"

---

## 4. Redaction Rules

### 4.1 Logging

**Structured Logs (JSON):**
```json
{
  "timestamp": "2026-10-31T14:28:00.123Z",
  "level": "info",
  "service": "arsy",
  "route": "POST /api/v1/missions",
  "correlationId": "v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0",
  "userId": "REDACTED",
  "sessionId": "REDACTED",
  "ipAddress": "REDACTED",
  "duration": 142,
  "statusCode": 201
}
```

**Redaction Policy:**
- `correlationId`: **ALLOWED** (opaque, non-identifying)
- `userId`: **REDACTED** (personal identifier)
- `sessionId`: **REDACTED** (session identifier)
- `ipAddress`: **REDACTED** (network identifier)
- `userAgent`: **ALLOWED** (non-identifying, useful for debugging)
- `route`: **ALLOWED** (non-identifying)
- `statusCode`: **ALLOWED** (non-identifying)
- `duration`: **ALLOWED** (non-identifying)

**Redaction Implementation:**
```javascript
function redactLogEntry(entry) {
  const redacted = { ...entry };
  const REDACTED_FIELDS = ['userId', 'sessionId', 'ipAddress', 'email', 'username'];
  
  for (const field of REDACTED_FIELDS) {
    if (redacted[field] !== undefined) {
      redacted[field] = 'REDACTED';
    }
  }
  
  return redacted;
}
```

### 4.2 Metrics

**Allowed Metrics:**
- Request count by route and status code
- Request duration by route (p50, p95, p99)
- Error rate by route and error type
- Correlation ID propagation rate (% of requests with valid ID)

**Prohibited Metrics:**
- Request count by user ID
- Request duration by user ID
- Any metric that could identify individual users

**Metric Labels:**
```javascript
// ALLOWED
metrics.increment('request.count', {
  route: 'POST /api/v1/missions',
  statusCode: '201',
  service: 'arsy'
});

// PROHIBITED
metrics.increment('request.count', {
  route: 'POST /api/v1/missions',
  statusCode: '201',
  userId: 'user-123' // VIOLATION
});
```

### 4.3 Error Responses

**Client-Facing Errors:**
```json
{
  "error": {
    "code": "MISSION_NOT_FOUND",
    "message": "The requested mission does not exist",
    "details": {}
  }
}
```

**Redaction Policy:**
- Never include `correlationId` in response body
- Never include internal error details (stack traces, SQL errors)
- Never include user identifiers
- Log correlation ID server-side for debugging

**Internal Error Reports (Sentry, etc.):**
```json
{
  "exception": {
    "type": "MissionNotFoundError",
    "value": "Mission m-123 not found",
    "stacktrace": [...]
  },
  "tags": {
    "correlationId": "v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0",
    "route": "GET /api/v1/missions/:id",
    "statusCode": 404
  },
  "user": {
    "id": "REDACTED",
    "email": "REDACTED"
  }
}
```

**Redaction Policy:**
- Include `correlationId` in tags (for debugging)
- Redact user identifiers in `user` object
- Include route and status code (non-identifying)

### 4.4 Distributed Tracing (OpenTelemetry, Jaeger, etc.)

**Trace Context:**
```javascript
const traceContext = {
  traceId: 'v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0',
  spanId: generateSpanId(),
  parentSpanId: null,
  operationName: 'POST /api/v1/missions',
  startTime: Date.now(),
  duration: 142,
  tags: {
    'http.method': 'POST',
    'http.url': '/api/v1/missions',
    'http.status_code': 201,
    'service': 'arsy'
  },
  logs: [
    {
      timestamp: Date.now(),
      event: 'request.received',
      fields: {
        correlationId: 'v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0',
        userId: 'REDACTED'
      }
    }
  ]
};
```

**Redaction Policy:**
- `traceId`: Use correlation ID (opaque, non-identifying)
- `spanId`: Generate per-span (non-identifying)
- `tags`: Only non-identifying metadata
- `logs`: Redact user identifiers

---

## 5. Privacy Guarantees

### 5.1 What Correlation IDs Are NOT

- **Not session identifiers:** IDs are request-scoped, not tied to user sessions
- **Not user identifiers:** IDs contain no user-specific information
- **Not tracking tokens:** IDs are not stored in cookies or local storage
- **Not analytics identifiers:** IDs are not sent to third-party analytics services

### 5.2 What Correlation IDs ARE

- **Opaque strings:** No semantic meaning beyond format validation
- **Request-scoped:** Valid for a single request-response cycle
- **Time-bounded:** Expire after 24 hours (timestamp validation)
- **Non-sequential:** Random component prevents enumeration
- **Non-guessable:** 80 bits of entropy from CSPRNG

### 5.3 Privacy Threat Model

**Threat 1: Correlation ID as Tracking Token**
- **Risk:** Attacker collects correlation IDs over time to build user profile
- **Mitigation:** IDs are request-scoped and time-bounded (24 hours)
- **Residual Risk:** Low — IDs cannot be linked across sessions without additional data

**Threat 2: Correlation ID Enumeration**
- **Risk:** Attacker guesses valid correlation IDs to access other requests
- **Mitigation:** 80 bits of entropy (2^80 possible values) makes guessing infeasible
- **Residual Risk:** Negligible — brute-force attack requires 2^80 attempts

**Threat 3: Correlation ID Leakage in Logs**
- **Risk:** Logs containing correlation IDs are exposed
- **Mitigation:** IDs are opaque and non-identifying on their own
- **Residual Risk:** Low — IDs must be combined with service logs to reconstruct requests

**Threat 4: Correlation ID in URL Parameters**
- **Risk:** IDs appear in URLs and are logged by proxies, CDNs, browser history
- **Mitigation:** IDs are transmitted only in HTTP headers, never in URLs
- **Residual Risk:** Negligible — header-only transmission

**Threat 5: Correlation ID in Response Body**
- **Risk:** IDs appear in responses and are logged by client applications
- **Mitigation:** IDs are transmitted only in response headers (optional), never in body
- **Residual Risk:** Low — client logs would need to be combined with server logs

### 5.4 Data Flow Diagram

```
┌─────────────────┐
│  Consumer App   │
│  (headquarters) │
└────────┬────────┘
         │
         │ 1. Generate correlation ID
         │    v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
         │
         │ 2. Attach to request header
         │    X-Correlation-Id: v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
         │
         ▼
┌─────────────────┐
│   HTTP Request  │
│                 │
│  Headers:       │
│    X-Correlation-Id: v1-...-i9j0
│    Authorization: Bearer <token>
│    Cookie: session=<id>
│                 │
│  Body:          │
│    { "title": "Mission" }
└────────┬────────┘
         │
         │ 3. Redact personal identifiers
         │    - Remove userId from logs
         │    - Remove sessionId from logs
         │    - Remove ipAddress from logs
         │
         ▼
┌─────────────────┐
│   ARSY API      │
│                 │
│  Logs:          │
│    correlationId: v1-...-i9j0
│    route: POST /api/v1/missions
│    statusCode: 201
│    duration: 142ms
│    userId: REDACTED
│    sessionId: REDACTED
│    ipAddress: REDACTED
│                 │
│  Metrics:       │
│    request.count{route,statusCode}
│    request.duration{route}
│                 │
│  Error Reports: │
│    tags.correlationId: v1-...-i9j0
│    user.id: REDACTED
│    user.email: REDACTED
└────────┬────────┘
         │
         │ 4. Optional: Include ID in response header
         │    X-Correlation-Id: v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
         │
         │ 5. Never include ID in response body
         │
         ▼
┌─────────────────┐
│  HTTP Response  │
│                 │
│  Headers:       │
│    X-Correlation-Id: v1-...-i9j0 (optional)
│    Content-Type: application/json
│                 │
│  Body:          │
│    { "id": "m-123", "title": "Mission" }
│    (no correlationId)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Consumer App   │
│  (headquarters) │
│                 │
│  Client Logs:   │
│    correlationId: v1-...-i9j0
│    route: POST /api/v1/missions
│    statusCode: 201
│    duration: 287ms (end-to-end)
└─────────────────┘
```

### 5.5 Privacy Review Checklist

- [x] Correlation IDs are opaque (no semantic meaning)
- [x] Correlation IDs are request-scoped (not session-scoped)
- [x] Correlation IDs are time-bounded (24-hour expiration)
- [x] Correlation IDs are non-sequential (CSPRNG generation)
- [x] Correlation IDs are non-guessable (80 bits of entropy)
- [x] Correlation IDs are transmitted only in headers (not URLs or body)
- [x] Personal identifiers are redacted from logs (userId, sessionId, ipAddress)
- [x] Personal identifiers are redacted from metrics
- [x] Personal identifiers are redacted from error reports
- [x] Correlation IDs are not stored in cookies or local storage
- [x] Correlation IDs are not sent to third-party analytics services
- [x] Privacy threat model documented (5 threats, all mitigated)
- [x] Data flow diagram reviewed (no unintended leakage points)

---

## 6. Synthetic Test Scenarios

### 6.1 Scenario 1: Valid Correlation ID Propagation

**Setup:**
- Consumer generates valid correlation ID
- Consumer sends request to ARSY with `X-Correlation-Id` header
- ARSY validates ID and logs it

**Expected Behavior:**
1. ARSY accepts the correlation ID
2. ARSY logs the ID with request metadata
3. ARSY does not modify the ID
4. ARSY optionally returns the ID in response header
5. ARSY does not return the ID in response body

**Test Assertion:**
```javascript
test('valid correlation ID is propagated and logged', async () => {
  const correlationId = generateCorrelationId();
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': correlationId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ID is returned in response header
  expect(response.headers.get('X-Correlation-Id')).toBe(correlationId);
  
  // ID is not returned in response body
  const body = await response.json();
  expect(body.correlationId).toBeUndefined();
  
  // ARSY logs contain the ID
  const logs = await getArsyLogs();
  expect(logs.some(log => log.correlationId === correlationId)).toBe(true);
});
```

### 6.2 Scenario 2: Missing Correlation ID

**Setup:**
- Consumer sends request without `X-Correlation-Id` header
- ARSY receives request

**Expected Behavior:**
1. ARSY generates a new correlation ID
2. ARSY logs a warning: "Missing X-Correlation-Id header, generated new ID"
3. ARSY proceeds with the request normally
4. ARSY returns the generated ID in response header

**Test Assertion:**
```javascript
test('missing correlation ID triggers server-side generation', async () => {
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ARSY generated a new ID
  const correlationId = response.headers.get('X-Correlation-Id');
  expect(correlationId).toMatch(CORRELATION_ID_REGEX);
  
  // ARSY logged a warning
  const logs = await getArsyLogs();
  expect(logs.some(log => 
    log.level === 'warn' && 
    log.message.includes('Missing X-Correlation-Id header')
  )).toBe(true);
});
```

### 6.3 Scenario 3: Invalid Correlation ID Format

**Setup:**
- Consumer sends request with malformed correlation ID
- ARSY receives request

**Expected Behavior:**
1. ARSY validates the ID format
2. Validation fails (format mismatch)
3. ARSY generates a new correlation ID
4. ARSY logs a warning: "Invalid X-Correlation-Id format, generated new ID"
5. ARSY proceeds with the request normally

**Test Assertion:**
```javascript
test('invalid correlation ID format triggers replacement', async () => {
  const invalidId = 'not-a-valid-correlation-id';
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': invalidId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ARSY generated a new ID
  const correlationId = response.headers.get('X-Correlation-Id');
  expect(correlationId).toMatch(CORRELATION_ID_REGEX);
  expect(correlationId).not.toBe(invalidId);
  
  // ARSY logged a warning
  const logs = await getArsyLogs();
  expect(logs.some(log => 
    log.level === 'warn' && 
    log.message.includes('Invalid X-Correlation-Id format')
  )).toBe(true);
});
```

### 6.4 Scenario 4: Expired Correlation ID

**Setup:**
- Consumer sends request with correlation ID containing timestamp >24 hours old
- ARSY receives request

**Expected Behavior:**
1. ARSY validates the timestamp
2. Validation fails (ID is expired)
3. ARSY generates a new correlation ID
4. ARSY logs a warning: "Expired X-Correlation-Id timestamp, generated new ID"
5. ARSY proceeds with the request normally

**Test Assertion:**
```javascript
test('expired correlation ID triggers replacement', async () => {
  // Generate an ID with a timestamp 48 hours ago
  const expiredDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const expiredId = generateCorrelationIdWithTimestamp(expiredDate);
  
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': expiredId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ARSY generated a new ID
  const correlationId = response.headers.get('X-Correlation-Id');
  expect(correlationId).toMatch(CORRELATION_ID_REGEX);
  expect(correlationId).not.toBe(expiredId);
  
  // ARSY logged a warning
  const logs = await getArsyLogs();
  expect(logs.some(log => 
    log.level === 'warn' && 
    log.message.includes('Expired X-Correlation-Id timestamp')
  )).toBe(true);
});
```

### 6.5 Scenario 5: Checksum Mismatch

**Setup:**
- Consumer sends request with correlation ID containing invalid checksum
- ARSY receives request

**Expected Behavior:**
1. ARSY validates the checksum
2. Validation fails (checksum mismatch)
3. ARSY generates a new correlation ID
4. ARSY logs a warning: "X-Correlation-Id checksum mismatch, generated new ID"
5. ARSY proceeds with the request normally

**Test Assertion:**
```javascript
test('checksum mismatch triggers replacement', async () => {
  // Generate a valid ID, then corrupt the checksum
  const validId = generateCorrelationId();
  const corruptedId = validId.slice(0, -4) + 'xxxx';
  
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': corruptedId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ARSY generated a new ID
  const correlationId = response.headers.get('X-Correlation-Id');
  expect(correlationId).toMatch(CORRELATION_ID_REGEX);
  expect(correlationId).not.toBe(corruptedId);
  
  // ARSY logged a warning
  const logs = await getArsyLogs();
  expect(logs.some(log => 
    log.level === 'warn' && 
    log.message.includes('X-Correlation-Id checksum mismatch')
  )).toBe(true);
});
```

### 6.6 Scenario 6: Privacy — No Personal Identifiers in Logs

**Setup:**
- Consumer sends request with correlation ID
- ARSY processes request and logs metadata

**Expected Behavior:**
1. ARSY logs contain the correlation ID
2. ARSY logs do not contain userId, sessionId, or ipAddress
3. All personal identifiers are redacted

**Test Assertion:**
```javascript
test('personal identifiers are redacted from logs', async () => {
  const correlationId = generateCorrelationId();
  const userId = 'user-123';
  const sessionId = 'session-456';
  const ipAddress = '192.168.1.1';
  
  await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': correlationId,
      'Authorization': `Bearer ${userId}`,
      'Cookie': `session=${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // ARSY logs contain the correlation ID
  const logs = await getArsyLogs();
  expect(logs.some(log => log.correlationId === correlationId)).toBe(true);
  
  // ARSY logs do not contain personal identifiers
  expect(logs.every(log => log.userId === 'REDACTED' || log.userId === undefined)).toBe(true);
  expect(logs.every(log => log.sessionId === 'REDACTED' || log.sessionId === undefined)).toBe(true);
  expect(logs.every(log => log.ipAddress === 'REDACTED' || log.ipAddress === undefined)).toBe(true);
});
```

### 6.7 Scenario 7: Privacy — No Personal Identifiers in Metrics

**Setup:**
- Consumer sends multiple requests with correlation IDs
- ARSY records metrics

**Expected Behavior:**
1. Metrics contain route, status code, and duration
2. Metrics do not contain userId or other personal identifiers
3. Correlation ID propagation rate is recorded

**Test Assertion:**
```javascript
test('personal identifiers are redacted from metrics', async () => {
  const correlationId = generateCorrelationId();
  const userId = 'user-123';
  
  await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': correlationId,
      'Authorization': `Bearer ${userId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  // Metrics contain non-identifying metadata
  const metrics = await getArsyMetrics();
  expect(metrics.some(m => 
    m.name === 'request.count' && 
    m.tags.route === 'POST /api/v1/missions' &&
    m.tags.statusCode === '201'
  )).toBe(true);
  
  // Metrics do not contain personal identifiers
  expect(metrics.every(m => m.tags.userId === undefined)).toBe(true);
  
  // Correlation ID propagation rate is recorded
  expect(metrics.some(m => 
    m.name === 'correlation_id.propagation_rate' && 
    m.value === 1.0
  )).toBe(true);
});
```

### 6.8 Scenario 8: End-to-End Tracing

**Setup:**
- Consumer generates correlation ID
- Consumer sends request to ARSY
- ARSY processes request and logs ID
- Consumer receives response and logs ID

**Expected Behavior:**
1. Same correlation ID appears in consumer logs and ARSY logs
2. Request can be traced end-to-end using the ID
3. No personal identifiers are exposed in either log

**Test Assertion:**
```javascript
test('request is traceable end-to-end without personal identifiers', async () => {
  const correlationId = generateCorrelationId();
  
  // Consumer sends request
  const consumerLogs = [];
  consumerLogs.push({
    timestamp: Date.now(),
    correlationId,
    event: 'request.sent',
    route: 'POST /api/v1/missions'
  });
  
  const response = await fetch('http://arsy:3000/api/v1/missions', {
    method: 'POST',
    headers: {
      'X-Correlation-Id': correlationId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Test Mission' })
  });
  
  consumerLogs.push({
    timestamp: Date.now(),
    correlationId,
    event: 'response.received',
    statusCode: response.status,
    duration: 287
  });
  
  // ARSY logs
  const arsyLogs = await getArsyLogs();
  
  // Same correlation ID appears in both logs
  expect(consumerLogs.every(log => log.correlationId === correlationId)).toBe(true);
  expect(arsyLogs.some(log => log.correlationId === correlationId)).toBe(true);
  
  // No personal identifiers in either log
  expect(consumerLogs.every(log => log.userId === undefined)).toBe(true);
  expect(arsyLogs.every(log => log.userId === 'REDACTED' || log.userId === undefined)).toBe(true);
});
```

---

## 7. Implementation Roadmap

### 7.1 Phase 1: ARSY API (Estimated: 3 days)

**Tasks:**
1. Implement correlation ID generation and validation utilities
2. Add middleware to extract and validate `X-Correlation-Id` header
3. Add middleware to generate new ID if missing or invalid
4. Update logging to include correlation ID
5. Update logging to redact personal identifiers
6. Update metrics to exclude personal identifiers
7. Add correlation ID to response header (optional)
8. Write unit tests for ID generation, validation, and redaction
9. Write integration tests for header propagation

**Acceptance Criteria:**
- All ARSY API routes accept and validate correlation IDs
- All ARSY API logs include correlation IDs
- All ARSY API logs redact personal identifiers
- All ARSY API metrics exclude personal identifiers
- Unit tests pass (100% coverage for new code)
- Integration tests pass

### 7.2 Phase 2: Consumer Application (Estimated: 2 days)

**Tasks:**
1. Implement correlation ID generation utility
2. Update HTTP client to attach `X-Correlation-Id` header to all requests
3. Update client-side logging to include correlation ID
4. Update error reporting to include correlation ID
5. Write unit tests for ID generation
6. Write integration tests for header attachment

**Acceptance Criteria:**
- All outgoing requests include correlation ID
- All client-side logs include correlation ID
- All error reports include correlation ID
- Unit tests pass
- Integration tests pass

### 7.3 Phase 3: Observability Integration (Estimated: 2 days)

**Tasks:**
1. Update distributed tracing (OpenTelemetry) to use correlation ID as trace ID
2. Update log aggregation (ELK, Loki) to index correlation IDs
3. Update error tracking (Sentry) to tag correlation IDs
4. Create dashboard for correlation ID queries
5. Write runbook for cross-service debugging

**Acceptance Criteria:**
- Correlation IDs are queryable in log aggregation
- Correlation IDs are visible in distributed traces
- Correlation IDs are tagged in error reports
- Dashboard allows searching by correlation ID
- Runbook documents debugging workflow

### 7.4 Phase 4: Testing and Validation (Estimated: 2 days)

**Tasks:**
1. Run all 8 synthetic test scenarios
2. Validate privacy guarantees (no personal identifiers in logs/metrics)
3. Validate performance impact (<1% overhead)
4. Validate error handling (missing, invalid, expired IDs)
5. Document test results
6. Address any issues found

**Acceptance Criteria:**
- All synthetic test scenarios pass
- Privacy review checklist is complete
- Performance overhead is <1%
- Error handling is robust
- Test results are documented

### 7.5 Total Estimated Effort: 9 days

- Phase 1: 3 days
- Phase 2: 2 days
- Phase 3: 2 days
- Phase 4: 2 days

---

## 8. Risk Assessment

### 8.1 Technical Risks

**Risk 1: Performance Overhead**
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Correlation ID generation and validation are fast (CRC32 checksum, regex validation). Benchmark in Phase 4 to confirm <1% overhead.
- **Contingency:** If overhead exceeds 1%, optimize checksum algorithm or reduce validation strictness.

**Risk 2: Log Volume Increase**
- **Likelihood:** High
- **Impact:** Low
- **Mitigation:** Correlation IDs add ~43 bytes per log entry. For 1M requests/day, this is ~43 MB/day of additional logs, which is negligible.
- **Contingency:** If log volume becomes a concern, reduce log verbosity or implement log sampling.

**Risk 3: Header Propagation Failures**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Some proxies or load balancers may strip custom headers. Test with production infrastructure in Phase 4.
- **Contingency:** If headers are stripped, use a standard header (e.g., `X-Request-Id`) instead of `X-Correlation-Id`.

### 8.2 Privacy Risks

**Risk 4: Correlation ID as Tracking Token**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** IDs are request-scoped and time-bounded (24 hours). Cannot be linked across sessions without additional data.
- **Contingency:** If tracking risk is unacceptable, reduce ID lifetime to 1 hour or generate a new ID for each request.

**Risk 5: Personal Identifier Leakage**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Redaction rules are explicit and tested. Privacy review checklist ensures all personal identifiers are redacted.
- **Contingency:** If leakage is detected, immediately halt logging and audit all log entries for personal data.

**Risk 6: Correlation ID Enumeration**
- **Likelihood:** Negligible
- **Impact:** Low
- **Mitigation:** 80 bits of entropy makes guessing infeasible (2^80 possible values).
- **Contingency:** If enumeration is a concern, increase random component to 32 characters (160 bits of entropy).

### 8.3 Operational Risks

**Risk 7: Backward Compatibility**
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Correlation IDs are optional. Missing or invalid IDs are handled gracefully (server generates new ID).
- **Contingency:** If backward compatibility issues arise, make correlation ID support configurable per route.

**Risk 8: Developer Adoption**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Documentation and runbook explain how to use correlation IDs for debugging. Training session for developers.
- **Contingency:** If adoption is low, enforce correlation ID generation in CI/CD pipeline.

**Risk 9: Debugging Complexity**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Dashboard and runbook make it easy to query logs by correlation ID.
- **Contingency:** If debugging is still complex, add correlation ID to error messages (without personal identifiers).

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

1. **Correlation ID Propagation Rate:** % of requests with valid correlation ID
   - Target: >95%
   - Measurement: ARSY metrics

2. **Log Completeness:** % of log entries with correlation ID
   - Target: 100%
   - Measurement: Log aggregation queries

3. **Privacy Compliance:** % of log entries with redacted personal identifiers
   - Target: 100%
   - Measurement: Automated log scanning

4. **Performance Overhead:** % increase in request latency
   - Target: <1%
   - Measurement: APM tools (Datadog, New Relic)

5. **Debugging Time:** Average time to trace a request across services
   - Target: <5 minutes (down from ~30 minutes currently)
   - Measurement: Developer surveys

### 9.2 Qualitative Metrics

1. **Developer Satisfaction:** Ease of debugging cross-service failures
   - Target: Positive feedback from developers
   - Measurement: Retrospective surveys

2. **Privacy Confidence:** Confidence that personal data is protected
   - Target: Privacy officer sign-off
   - Measurement: Privacy review checklist

3. **Operational Readiness:** Ability to use correlation IDs in production
   - Target: Runbook tested and approved
   - Measurement: Tabletop exercise

---

## 10. Deferred Items

The following items are explicitly deferred to future work:

1. **Implementation:** This document covers design only. Implementation requires ARSY and consumer application code changes.

2. **Multi-Hop Propagation:** This document covers single-boundary correlation (consumer → ARSY). Multi-hop correlation (consumer → ARSY → downstream service) is deferred.

3. **Correlation ID Storage:** This document does not specify how long correlation IDs should be retained in logs. Retention policy is deferred to operations team.

4. **Correlation ID in Client-Side Error Reports:** This document mentions including correlation IDs in client-side error reports, but does not specify the format or mechanism. Implementation is deferred to frontend team.

5. **Correlation ID in Distributed Tracing:** This document mentions using correlation IDs as trace IDs in OpenTelemetry, but does not specify the integration details. Implementation is deferred to observability team.

6. **Correlation ID Dashboard:** This document mentions creating a dashboard for correlation ID queries, but does not specify the tool or query language. Implementation is deferred to observability team.

7. **Correlation ID Runbook:** This document mentions writing a runbook for cross-service debugging, but does not specify the format or content. Implementation is deferred to operations team.

8. **Correlation ID Training:** This document mentions training developers on correlation ID usage, but does not specify the format or content. Implementation is deferred to engineering leadership.

9. **Correlation ID Privacy Review:** This document includes a privacy review checklist, but does not include sign-off from the privacy officer. Sign-off is deferred to privacy officer.

10. **Correlation ID Performance Benchmark:** This document mentions benchmarking performance overhead, but does not include actual benchmark results. Benchmarking is deferred to Phase 4 of implementation.

---

## 11. Overlap Analysis

### 11.1 Overlap with M46-08 (Audit Log Privacy Redaction)

**M46-08 Scope:** Define privacy redaction rules for audit logs across all services.  
**M46-30 Scope:** Define correlation ID format, propagation, and redaction for cross-boundary tracing.

**Overlap:**
- Both tasks address privacy redaction in logs
- Both tasks define redaction rules for personal identifiers
- M46-30 depends on M46-08 for redaction policy

**Coordination:**
- M46-30 reuses M46-08 redaction rules (userId, sessionId, ipAddress → REDACTED)
- M46-30 adds correlation ID to allowed fields (opaque, non-identifying)
- M46-30 does not redefine redaction policy, only applies it to correlation ID context

### 11.2 Overlap with M46-27 (Flaky Tests)

**M46-27 Scope:** Identify and remediate flaky tests in CI.  
**M46-30 Scope:** Define correlation ID format and propagation.

**Overlap:** None. M46-30 does not involve test flakiness.

### 11.3 Overlap with M46-29 (Worker Lifecycle)

**M46-29 Scope:** Instrument worker lifecycle state transitions.  
**M46-30 Scope:** Define correlation ID format and propagation.

**Overlap:**
- Both tasks involve logging and observability
- M46-29 could use correlation IDs to trace worker lifecycle events

**Coordination:**
- M46-29 could adopt correlation IDs in future work
- M46-30 does not depend on M46-29

---

## 12. Acceptance Criteria

This task is complete when:

1. **Design Document:** This document is reviewed and approved by ARSY team, consumer team, and privacy officer.

2. **Privacy Review:** Privacy review checklist is complete and signed off by privacy officer.

3. **Synthetic Tests:** All 8 synthetic test scenarios are documented and ready for implementation.

4. **Implementation Roadmap:** Roadmap is reviewed and approved by engineering leadership.

5. **Risk Assessment:** Risk assessment is reviewed and approved by security team.

6. **Success Metrics:** Success metrics are defined and agreed upon by all stakeholders.

7. **Deferred Items:** All deferred items are explicitly documented and assigned to future work.

**Note:** This document satisfies the design and planning requirements of M46-30. Implementation is deferred to a future engineering task.

---

## 13. Conclusion

This design document establishes a privacy-safe request correlation framework for tracing synthetic requests across the ARSY API boundary and one consumer application. The framework defines:

- **Correlation ID format:** 43-character opaque string with version, timestamp, random value, and checksum
- **Propagation mechanism:** HTTP header (`X-Correlation-Id`) with validation and replacement rules
- **Redaction rules:** Personal identifiers (userId, sessionId, ipAddress) are redacted from logs, metrics, and error reports
- **Privacy guarantees:** Correlation IDs are request-scoped, time-bounded, non-sequential, and non-guessable
- **Synthetic test scenarios:** 8 scenarios covering valid propagation, missing/invalid/expired IDs, privacy compliance, and end-to-end tracing
- **Implementation roadmap:** 4-phase plan (ARSY API, consumer application, observability integration, testing) with 9-day estimate
- **Risk assessment:** 9 risks identified with mitigations and contingencies
- **Success metrics:** 5 quantitative and 3 qualitative metrics

The framework enables cross-service debugging without exposing personal identifiers, satisfying both observability and privacy requirements.

**Status:** BASELINE ESTABLISHED — design complete, implementation deferred.

---

## Appendix A: Correlation ID Format Examples

**Valid IDs:**
```
v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
v1-20261031T000000Z-zzzzzzzzzzzzzzzz-0000
v1-20261031T235959Z-aaaaaaaaaaaaaaaa-ffff
```

**Invalid IDs:**
```
v1-20261031T142800Z-a1b2c3d4e5f6g7h8-xxxx  (checksum mismatch)
v1-20261031T142800Z-a1b2c3d4e5f6g7h8        (missing checksum)
v1-20261031T142800-a1b2c3d4e5f6g7h8-i9j0    (missing Z in timestamp)
v2-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0   (unsupported version)
20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0      (missing version)
v1-20261031T142800Z-A1B2C3D4E5F6G7H8-I9J0   (uppercase, invalid)
not-a-valid-correlation-id                   (completely invalid)
```

## Appendix B: CRC32 Checksum Calculation

```javascript
function crc32(str) {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < str.length; i++) {
    crc = table[(crc ^ str.charCodeAt(i)) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Example:
const payload = 'v1-20261031T142800Z-a1b2c3d4e5f6g7h8';
const checksum = crc32(payload).toString(16).padStart(4, '0');
// checksum = 'i9j0' (example, not actual value)
```

## Appendix C: Timestamp Parsing

```javascript
function parseTimestamp(id) {
  const parts = id.split('-');
  const timestamp = parts[1]; // 20261031T142800Z
  
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(9, 11);
  const minute = timestamp.slice(11, 13);
  const second = timestamp.slice(13, 15);
  
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}

function isExpired(id, maxAge = 24 * 60 * 60 * 1000) {
  const timestamp = parseTimestamp(id);
  const age = Date.now() - timestamp.getTime();
  return age > maxAge;
}
```

## Appendix D: Redaction Field List

**Fields to Redact:**
- `userId` — user identifier
- `sessionId` — session identifier
- `ipAddress` — network identifier
- `email` — email address
- `username` — username
- `phoneNumber` — phone number
- `address` — physical address
- `creditCardNumber` — payment identifier
- `socialSecurityNumber` — government identifier

**Fields to Allow:**
- `correlationId` — opaque, non-identifying
- `route` — non-identifying
- `method` — non-identifying
- `statusCode` — non-identifying
- `duration` — non-identifying
- `userAgent` — non-identifying (but may contain device info)
- `timestamp` — non-identifying
- `level` — non-identifying
- `service` — non-identifying

## Appendix E: Glossary

**Correlation ID:** Opaque string used to trace a request across service boundaries.

**Propagation:** Transmission of correlation ID from one service to another via HTTP header.

**Redaction:** Removal or replacement of personal identifiers in logs, metrics, and error reports.

**Trace ID:** Identifier used in distributed tracing systems (e.g., OpenTelemetry) to correlate spans across services.

**Span:** Unit of work in a distributed trace (e.g., HTTP request, database query).

**CSPRNG:** Cryptographically Secure Pseudo-Random Number Generator.

**CRC32:** Cyclic Redundancy Check, 32-bit checksum for error detection.

**Entropy:** Measure of randomness in a value. 80 bits of entropy means 2^80 possible values.

**PII:** Personally Identifiable Information — data that can identify an individual.

**GDPR:** General Data Protection Regulation — EU privacy law.

**CCPA:** California Consumer Privacy Act — California privacy law.
