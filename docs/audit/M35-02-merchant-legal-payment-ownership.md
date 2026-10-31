# M35-02: Merchant Legal/Payment and D15/D16 Ownership Decision

**Task ID:** M35-02  
**Priority:** P1  
**Difficulty:** D2  
**Dependencies:** M35-01  
**Owner:** Merchant/legal  
**Effort:** S-M (2-4 days)  
**Status:** BASELINE ESTABLISHED — 2026-10-31  
**Evidence Type:** Decision document (no code implemented)

---

## Executive Summary

This decision document establishes ownership boundaries for the merchant legal/payment system (D15: Invoice & Payment Records) and D16 (Manual Payment Tracking) within the MoonWitness XV architecture. The decision clarifies which domain owns payment data, how it integrates with existing identity (D00) and consent (D06) systems, and what legal/compliance requirements must be met.

**Key Decisions:**
1. **D15/D16 Ownership:** Payment records are owned by the TREASURY domain (M35), not by ARSY (research) or EMPIRE (commercial surfaces)
2. **D00 Session Reuse:** Payment operations reuse D00 session authentication but maintain separate audit trails
3. **Legal Entity:** A legal merchant entity must be established before real payment processing
4. **Data Boundary:** Payment data is strictly isolated from research data (no cross-domain queries)
5. **Compliance:** PCI-DSS, GDPR, and local financial regulations apply to D15/D16

**Scope Limitation:** This document covers ownership decision only. Implementation requires legal entity formation, payment processor integration, and compliance audits, which are deferred to M35-03/M35-04/M35-05.

---

## 1. Problem Statement

### 1.1 Current Ambiguity

The MoonWitness XV architecture has multiple domains that could potentially own payment functionality:
- **ARSY (Research Hub):** Manages witness testimony, research data, and user identities
- **EMPIRE (Commercial Surfaces):** Manages public-facing applications (Dock, Headquarters, Cockpit)
- **TREASURY (Financial):** Not yet defined, but needed for payment processing

Without clear ownership:
- Payment data could be mixed with research data (privacy violation)
- Legal compliance responsibilities are unclear
- Audit trails may not meet financial regulations
- Session management could conflict between domains

### 1.2 Why This Decision Matters

**Legal Liability:**
- Payment processing requires legal entity with tax registration
- Financial records have retention requirements (7+ years in many jurisdictions)
- PCI-DSS compliance requires strict data isolation
- GDPR applies to payment data (right to deletion, data portability)

**Technical Architecture:**
- D15 (Invoice & Payment Records) must be immutable once created
- D16 (Manual Payment Tracking) requires audit trail for disputes
- Payment data cannot be mixed with research data (different consent models)
- Session management must support both research and payment workflows

**Business Model:**
- MoonWitness XV may accept donations or payments for services
- Revenue must be tracked separately from research activities
- Financial reporting requires clean separation of concerns

### 1.3 Constraints

- **No Real Payments Yet:** This decision is preparatory; no payment processor is integrated
- **Synthetic Data Only:** All examples use fictional data
- **Legal Entity Required:** Real implementation requires forming a legal merchant entity
- **Compliance Deferred:** PCI-DSS/GDPR audits are deferred to M35-05

---

## 2. Domain Ownership Decision

### 2.1 Option A: ARSY Owns Payment (Rejected)

**Proposal:** ARSY (Research Hub) owns D15/D16 because it already manages user identities (D00) and consent (D06).

**Pros:**
- Single source of truth for user identity
- Existing session management infrastructure
- Unified audit trail

**Cons:**
- Research data and payment data mixed (privacy violation)
- ARSY not designed for financial compliance
- Legal entity would need to be research-focused (may not support commercial activities)
- Consent models differ (research consent ≠ payment consent)

**Verdict:** **REJECTED** — violates data isolation principles and creates legal/compliance risk.

### 2.2 Option B: EMPIRE Owns Payment (Rejected)

**Proposal:** EMPIRE (Commercial Surfaces) owns D15/D16 because it manages public-facing applications.

**Pros:**
- EMPIRE already handles commercial logic
- User-facing payment flows fit EMPIRE's purpose
- Existing UI/UX infrastructure

**Cons:**
- EMPIRE is a presentation layer, not a data owner
- Payment data would be duplicated across EMPIRE apps
- Legal compliance responsibilities unclear
- No clear audit trail ownership

**Verdict:** **REJECTED** — EMPIRE is a consumer of payment data, not an owner.

### 2.3 Option C: TREASURY Domain Owns Payment (Accepted)

**Proposal:** Create a new TREASURY domain (M35) that owns D15/D16 exclusively.

**Pros:**
- Clean separation of concerns (research vs. commercial vs. financial)
- Legal compliance responsibilities clearly assigned
- Audit trail ownership is unambiguous
- Data isolation enforced by domain boundaries
- Scalable for future financial features (invoicing, refunds, subscriptions)

**Cons:**
- Requires new domain infrastructure (API, database, authentication)
- Integration complexity with D00 (session) and D06 (consent)
- Legal entity formation required before implementation

**Verdict:** **ACCEPTED** — TREASURY domain owns D15/D16 with strict boundaries.

### 2.4 TREASURY Domain Definition

**Domain Name:** TREASURY  
**Domain ID:** M35  
**Owner:** Merchant/legal team  
**Purpose:** Manage financial transactions, invoices, and payment records for MoonWitness XV

**Responsibilities:**
1. **D15: Invoice & Payment Records**
   - Generate invoices for services/donations
   - Record payment transactions (amount, date, method, status)
   - Maintain immutable audit trail
   - Support refunds and disputes

2. **D16: Manual Payment Tracking**
   - Track offline payments (bank transfers, checks)
   - Reconcile manual payments with invoices
   - Support payment verification workflows

3. **Legal Compliance**
   - Maintain financial records per legal requirements
   - Support tax reporting
   - Enforce PCI-DSS data isolation
   - Handle GDPR requests for payment data

**Boundaries:**
- TREASURY does NOT own user identities (D00 owns this)
- TREASURY does NOT own research data (ARSY owns this)
- TREASURY does NOT own UI/UX (EMPIRE owns this)
- TREASURY DOES own all payment-related data and logic

---

## 3. D00 Session Reuse Decision

### 3.1 Authentication Model

**Question:** Should TREASURY reuse D00 session authentication or implement separate auth?

**Option A: Reuse D00 Session (Accepted)**

TREASURY reuses D00 session tokens for authentication but maintains separate audit trails.

**Implementation:**
1. User authenticates via D00 (existing flow)
2. D00 issues session token (JWT or similar)
3. User initiates payment operation
4. TREASURY validates D00 session token
5. TREASURY logs operation in separate audit trail (includes D00 session ID for correlation)
6. TREASURY does NOT store D00 session data (only references it)

**Pros:**
- Single sign-on experience for users
- No duplicate authentication infrastructure
- Existing session management is battle-tested
- User identity is already verified by D00

**Cons:**
- TREASURY depends on D00 availability
- Session token format must be stable (breaking changes affect TREASURY)
- Audit trail correlation requires careful design

**Verdict:** **ACCEPTED** — TREASURY reuses D00 session with strict audit isolation.

**Option B: Separate TREASURY Auth (Rejected)**

TREASURY implements its own authentication system.

**Pros:**
- Complete independence from D00
- Can optimize for payment-specific workflows

**Cons:**
- Duplicate authentication infrastructure
- Poor user experience (multiple logins)
- Increased security surface area
- Maintenance burden

**Verdict:** **REJECTED** — unnecessary duplication and poor UX.

### 3.2 Session Data Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Login (email/password, OAuth, etc.)
       ▼
┌─────────────┐
│  D00 Auth   │
│  (Identity) │
└──────┬──────┘
       │
       │ 2. Issue session token
       │    JWT: { userId, sessionId, expiresAt, signature }
       ▼
┌─────────────┐
│    User     │
│  (Browser)  │
└──────┬──────┘
       │
       │ 3. Initiate payment
       │    POST /treasury/invoices
       │    Authorization: Bearer <session-token>
       ▼
┌─────────────┐
│  TREASURY   │
│  (M35)      │
└──────┬──────┘
       │
       │ 4. Validate session token
       │    - Verify signature
       │    - Check expiration
       │    - Extract userId, sessionId
       │
       │ 5. Check D06 consent (if required)
       │    - GET /consent/check?userId=X&purpose=payment
       │
       │ 6. Process payment operation
       │    - Create invoice
       │    - Record transaction
       │
       │ 7. Log audit trail
       │    {
       │      timestamp,
       │      sessionId (from D00),
       │      userId (from D00),
       │      operation,
       │      amount,
       │      result
       │    }
       │
       │ 8. Return response
       ▼
┌─────────────┐
│    User     │
│  (Browser)  │
└─────────────┘
```

### 3.3 Audit Trail Isolation

**D00 Audit Trail:**
- Tracks authentication events (login, logout, session refresh)
- Stores: userId, sessionId, timestamp, IP address, user agent
- Retention: 90 days (configurable)
- Purpose: Security, debugging

**TREASURY Audit Trail:**
- Tracks payment operations (invoice creation, payment recording, refunds)
- Stores: sessionId (reference only), userId (reference only), timestamp, operation, amount, result
- Retention: 7 years (legal requirement)
- Purpose: Financial compliance, dispute resolution

**Isolation Rules:**
1. TREASURY audit trail does NOT store D00 session data (only references sessionId)
2. D00 audit trail does NOT store payment data
3. Cross-domain queries require explicit authorization (D06 consent check)
4. Audit trails are stored in separate databases (physical isolation)

### 3.4 Session Token Format

**Current D00 Token Format (Example):**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "expiresAt": "2026-10-31T23:59:59Z",
  "signature": "..."
}
```

**TREASURY Token Validation:**
```javascript
function validateSessionToken(token) {
  // 1. Verify signature (using D00 public key)
  const verified = verifySignature(token, D00_PUBLIC_KEY);
  if (!verified) throw new Error('Invalid signature');
  
  // 2. Check expiration
  if (token.expiresAt < Date.now()) throw new Error('Token expired');
  
  // 3. Extract userId and sessionId (no other D00 data stored)
  return {
    userId: token.userId,
    sessionId: token.sessionId
  };
}
```

**TREASURY Audit Log Entry:**
```json
{
  "timestamp": "2026-10-31T14:28:00Z",
  "sessionId": "session-456",  // Reference only, not full token
  "userId": "user-123",         // Reference only
  "operation": "invoice.create",
  "invoiceId": "inv-789",
  "amount": 100.00,
  "currency": "USD",
  "result": "success"
}
```

---

## 4. Data Boundary Specification

### 4.1 Data Ownership Matrix

| Data Type | Owner Domain | Storage Location | Access Control | Retention |
|-----------|--------------|------------------|----------------|-----------|
| User identity (email, password hash) | D00 | D00 database | D00 admin only | Account lifetime + 30 days |
| User consent preferences | D06 | D06 database | D06 admin, user (read) | Consent lifetime + 7 years |
| Research testimony | ARSY | ARSY database | ARSY admin, researcher (with consent) | Per consent agreement |
| Invoice records | D15 (TREASURY) | TREASURY database | TREASURY admin, user (read own) | 7 years (legal) |
| Payment transactions | D15 (TREASURY) | TREASURY database | TREASURY admin, user (read own) | 7 years (legal) |
| Manual payment tracking | D16 (TREASURY) | TREASURY database | TREASURY admin only | 7 years (legal) |
| Audit logs (auth) | D00 | D00 audit database | D00 admin, security auditor | 90 days |
| Audit logs (payment) | TREASURY | TREASURY audit database | TREASURY admin, financial auditor | 7 years |

### 4.2 Cross-Domain Query Rules

**Rule 1: No Direct Cross-Domain Queries**
- TREASURY cannot query D00 database directly
- ARSY cannot query TREASURY database directly
- All cross-domain communication via API with explicit authorization

**Rule 2: API-Mediated Access**
```javascript
// ALLOWED: TREASURY checks user identity via D00 API
const userIdentity = await D00_API.getUserIdentity(sessionToken);

// PROHIBITED: TREASURY queries D00 database directly
const userIdentity = await D00_Database.query(`SELECT * FROM users WHERE id = ?`, userId);
```

**Rule 3: Consent Required for Cross-Domain Data Use**
```javascript
// TREASURY must check D06 consent before using user data
const consentCheck = await D06_API.checkConsent({
  userId,
  purpose: 'payment',
  dataType: 'identity'
});

if (!consentCheck.granted) {
  throw new Error('Consent not granted for payment data use');
}
```

**Rule 4: Data Minimization**
- TREASURY stores only userId and sessionId references (not full D00 data)
- ARSY stores only payment status (not full TREASURY data)
- Each domain stores only what it needs for its purpose

### 4.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MoonWitness XV                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│  │   D00    │      │   D06    │      │  TREASURY│         │
│  │(Identity)│      │ (Consent)│      │  (M35)   │         │
│  └────┬─────┘      └────┬─────┘      └────┬─────┘         │
│       │                 │                 │                │
│       │  ┌──────────┐   │                 │                │
│       └──┤  ARSY    ├───┘                 │                │
│          │(Research)│                     │                │
│          └──────────┘                     │                │
│               │                           │                │
│               │      ┌──────────┐         │                │
│               └──────┤  EMPIRE  ├─────────┘                │
│                      │(Commerce)│                          │
│                      └──────────┘                          │
│                                                             │
│  Data Boundaries:                                           │
│  - D00 owns identity data                                   │
│  - D06 owns consent data                                    │
│  - ARSY owns research data                                  │
│  - TREASURY owns payment data                               │
│  - EMPIRE owns no data (presentation layer only)            │
│                                                             │
│  Cross-Domain Communication:                                │
│  - API-mediated only                                        │
│  - Consent required (D06)                                   │
│  - Audit logged                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Legal Entity Requirements

### 5.1 Why Legal Entity is Required

**Payment Processing:**
- Payment processors (Stripe, PayPal, etc.) require a legal entity to open an account
- Legal entity must have tax registration (EIN in US, VAT in EU, etc.)
- Legal entity is liable for financial compliance (PCI-DSS, GDPR, local regulations)

**Invoice Generation:**
- Invoices must be issued by a legal entity
- Invoices must include legal entity name, address, tax ID
- Legal entity is responsible for tax collection and remittance

**Financial Records:**
- Legal entity must maintain financial records per legal requirements
- Legal entity is subject to audits by tax authorities
- Legal entity must file annual financial reports

### 5.2 Legal Entity Options

**Option A: Existing Non-Profit Entity (If Available)**
- If MoonWitness XV is already part of a non-profit organization, that entity can serve as merchant
- Pros: No new entity formation required
- Cons: Non-profit status may restrict commercial activities

**Option B: New Legal Entity (Recommended)**
- Form a new legal entity (LLC, corporation, or equivalent) specifically for MoonWitness XV
- Pros: Clear separation of liability, can engage in commercial activities
- Cons: Requires legal fees, ongoing compliance costs

**Option C: Fiscal Sponsorship**
- Partner with an existing organization that acts as fiscal sponsor
- Pros: No new entity formation, sponsor handles compliance
- Cons: Sponsor takes percentage of revenue, less control

**Recommended:** **Option B** — Form new legal entity for full control and liability separation.

### 5.3 Legal Entity Formation Steps

**Step 1: Choose Jurisdiction**
- Consider: Where are users located? Where is the team based? Tax implications?
- Example: US Delaware LLC (common for tech startups)

**Step 2: Register Entity**
- File articles of organization/incorporation
- Pay registration fees ($50-$500 depending on jurisdiction)
- Obtain EIN/tax ID from tax authority

**Step 3: Open Business Bank Account**
- Use legal entity documentation to open bank account
- Separate personal and business finances (legal requirement)

**Step 4: Register for Taxes**
- Register for sales tax/VAT if applicable
- Register for payroll tax if hiring employees

**Step 5: Obtain Licenses/Permits**
- Check if payment processing requires specific licenses
- Obtain any required business licenses

**Step 6: Draft Operating Agreement/Bylaws**
- Define ownership structure
- Define decision-making processes
- Define profit distribution

**Estimated Timeline:** 2-4 weeks  
**Estimated Cost:** $500-$2,000 (legal fees + registration fees)

### 5.4 Legal Compliance Requirements

**PCI-DSS (Payment Card Industry Data Security Standard):**
- Applies if processing credit/debit cards
- Requires: Data encryption, access controls, network security, regular audits
- Compliance levels depend on transaction volume
- Estimated cost: $5,000-$50,000/year for compliance

**GDPR (General Data Protection Regulation):**
- Applies if processing EU user data
- Requires: Consent management, data minimization, right to deletion, data portability
- Estimated cost: $10,000-$30,000/year for compliance

**Local Financial Regulations:**
- Varies by jurisdiction
- May require: Financial reporting, tax collection, consumer protection
- Estimated cost: $2,000-$10,000/year for compliance

**Total Estimated Compliance Cost:** $17,000-$90,000/year

---

## 6. Positive Test Scenario

### 6.1 Scenario: User Creates Invoice via TREASURY API

**Setup:**
- User is authenticated via D00 (has valid session token)
- User has granted consent for payment operations (D06)
- TREASURY domain is operational

**Test Steps:**
1. User sends POST request to TREASURY API:
   ```http
   POST /treasury/invoices HTTP/1.1
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "amount": 100.00,
     "currency": "USD",
     "description": "Donation to MoonWitness XV"
   }
   ```

2. TREASURY validates D00 session token:
   - Verifies signature using D00 public key
   - Checks expiration
   - Extracts userId and sessionId

3. TREASURY checks D06 consent:
   ```javascript
   const consentCheck = await D06_API.checkConsent({
     userId: 'user-123',
     purpose: 'payment',
     dataType: 'invoice'
   });
   // Returns: { granted: true, expiresAt: '2027-10-31T00:00:00Z' }
   ```

4. TREASURY creates invoice:
   ```javascript
   const invoice = {
     invoiceId: 'inv-789',
     userId: 'user-123',
     amount: 100.00,
     currency: 'USD',
     description: 'Donation to MoonWitness XV',
     status: 'pending',
     createdAt: '2026-10-31T14:28:00Z'
   };
   await TREASURY_Database.insert('invoices', invoice);
   ```

5. TREASURY logs audit trail:
   ```javascript
   const auditLog = {
     timestamp: '2026-10-31T14:28:00Z',
     sessionId: 'session-456',  // Reference only
     userId: 'user-123',         // Reference only
     operation: 'invoice.create',
     invoiceId: 'inv-789',
     amount: 100.00,
     currency: 'USD',
     result: 'success'
   };
   await TREASURY_AuditDatabase.insert('logs', auditLog);
   ```

6. TREASURY returns response:
   ```http
   HTTP/1.1 201 Created
   Content-Type: application/json
   
   {
     "invoiceId": "inv-789",
     "status": "pending",
     "amount": 100.00,
     "currency": "USD"
   }
   ```

**Expected Outcome:**
- Invoice created successfully in TREASURY database
- Audit log recorded in TREASURY audit database
- D00 session token validated but not stored
- D06 consent checked and recorded
- Response returned to user with invoice details
- No cross-domain data leakage

**Test Assertion:**
```javascript
test('user can create invoice via TREASURY API with valid D00 session and D06 consent', async () => {
  // 1. Authenticate user via D00
  const sessionToken = await D00_API.login('user@example.com', 'password');
  
  // 2. Grant consent via D06
  await D06_API.grantConsent({
    userId: 'user-123',
    purpose: 'payment',
    dataType: 'invoice',
    expiresAt: '2027-10-31T00:00:00Z'
  });
  
  // 3. Create invoice via TREASURY
  const response = await TREASURY_API.createInvoice({
    sessionToken,
    amount: 100.00,
    currency: 'USD',
    description: 'Donation to MoonWitness XV'
  });
  
  // 4. Assert invoice created
  expect(response.status).toBe(201);
  expect(response.invoiceId).toMatch(/^inv-/);
  expect(response.amount).toBe(100.00);
  expect(response.currency).toBe('USD');
  
  // 5. Assert audit log recorded
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE invoiceId = ?',
    [response.invoiceId]
  );
  expect(auditLogs.length).toBe(1);
  expect(auditLogs[0].operation).toBe('invoice.create');
  expect(auditLogs[0].result).toBe('success');
  
  // 6. Assert D00 session not stored in TREASURY
  const treasuryRecords = await TREASURY_Database.query(
    'SELECT * FROM sessions WHERE sessionId = ?',
    [sessionToken.sessionId]
  );
  expect(treasuryRecords.length).toBe(0);
});
```

---

## 7. Negative Test Scenario

### 7.1 Scenario: User Attempts Invoice Creation Without Consent

**Setup:**
- User is authenticated via D00 (has valid session token)
- User has NOT granted consent for payment operations (D06)
- TREASURY domain is operational

**Test Steps:**
1. User sends POST request to TREASURY API:
   ```http
   POST /treasury/invoices HTTP/1.1
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "amount": 100.00,
     "currency": "USD",
     "description": "Donation to MoonWitness XV"
   }
   ```

2. TREASURY validates D00 session token:
   - Verifies signature using D00 public key ✓
   - Checks expiration ✓
   - Extracts userId and sessionId ✓

3. TREASURY checks D06 consent:
   ```javascript
   const consentCheck = await D06_API.checkConsent({
     userId: 'user-123',
     purpose: 'payment',
     dataType: 'invoice'
   });
   // Returns: { granted: false, reason: 'No consent record found' }
   ```

4. TREASURY denies request:
   ```javascript
   if (!consentCheck.granted) {
     throw new ConsentError('Consent not granted for payment data use');
   }
   ```

5. TREASURY logs audit trail:
   ```javascript
   const auditLog = {
     timestamp: '2026-10-31T14:28:00Z',
     sessionId: 'session-456',
     userId: 'user-123',
     operation: 'invoice.create',
     amount: 100.00,
     currency: 'USD',
     result: 'denied',
     reason: 'consent_not_granted'
   };
   await TREASURY_AuditDatabase.insert('logs', auditLog);
   ```

6. TREASURY returns error response:
   ```http
   HTTP/1.1 403 Forbidden
   Content-Type: application/json
   
   {
     "error": {
       "code": "CONSENT_NOT_GRANTED",
       "message": "You must grant consent for payment operations before creating invoices"
     }
   }
   ```

**Expected Outcome:**
- Invoice NOT created in TREASURY database
- Audit log recorded with result='denied'
- D00 session token validated but not stored
- D06 consent check failed, request denied
- Error response returned to user with clear message
- No data leakage

**Test Assertion:**
```javascript
test('user cannot create invoice without D06 consent', async () => {
  // 1. Authenticate user via D00
  const sessionToken = await D00_API.login('user@example.com', 'password');
  
  // 2. Do NOT grant consent via D06 (simulate missing consent)
  
  // 3. Attempt to create invoice via TREASURY
  let error;
  try {
    await TREASURY_API.createInvoice({
      sessionToken,
      amount: 100.00,
      currency: 'USD',
      description: 'Donation to MoonWitness XV'
    });
  } catch (e) {
    error = e;
  }
  
  // 4. Assert request denied
  expect(error).toBeDefined();
  expect(error.status).toBe(403);
  expect(error.code).toBe('CONSENT_NOT_GRANTED');
  
  // 5. Assert invoice NOT created
  const invoices = await TREASURY_Database.query(
    'SELECT * FROM invoices WHERE userId = ?',
    ['user-123']
  );
  expect(invoices.length).toBe(0);
  
  // 6. Assert audit log recorded with denial
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE userId = ? AND operation = ?',
    ['user-123', 'invoice.create']
  );
  expect(auditLogs.length).toBe(1);
  expect(auditLogs[0].result).toBe('denied');
  expect(auditLogs[0].reason).toBe('consent_not_granted');
});
```

### 7.2 Scenario: User Attempts Invoice Creation with Expired Session

**Setup:**
- User has expired D00 session token
- User has granted consent for payment operations (D06)
- TREASURY domain is operational

**Test Steps:**
1. User sends POST request to TREASURY API with expired token:
   ```http
   POST /treasury/invoices HTTP/1.1
   Authorization: Bearer <expired-d00-session-token>
   Content-Type: application/json
   
   {
     "amount": 100.00,
     "currency": "USD",
     "description": "Donation to MoonWitness XV"
   }
   ```

2. TREASURY validates D00 session token:
   - Verifies signature using D00 public key ✓
   - Checks expiration ✗ (token expired)
   - Throws error

3. TREASURY denies request:
   ```javascript
   if (token.expiresAt < Date.now()) {
     throw new AuthenticationError('Session token expired');
   }
   ```

4. TREASURY logs audit trail:
   ```javascript
   const auditLog = {
     timestamp: '2026-10-31T14:28:00Z',
     sessionId: 'session-456',
     userId: 'user-123',
     operation: 'invoice.create',
     amount: 100.00,
     currency: 'USD',
     result: 'denied',
     reason: 'session_expired'
   };
   ```

5. TREASURY returns error response:
   ```http
   HTTP/1.1 401 Unauthorized
   Content-Type: application/json
   
   {
     "error": {
       "code": "SESSION_EXPIRED",
       "message": "Your session has expired. Please log in again."
     }
   }
   ```

**Expected Outcome:**
- Invoice NOT created
- Audit log recorded with result='denied', reason='session_expired'
- Error response returned to user
- User must re-authenticate via D00

**Test Assertion:**
```javascript
test('user cannot create invoice with expired D00 session', async () => {
  // 1. Create expired session token
  const expiredToken = await D00_API.createExpiredToken('user-123');
  
  // 2. Grant consent via D06
  await D06_API.grantConsent({
    userId: 'user-123',
    purpose: 'payment',
    dataType: 'invoice'
  });
  
  // 3. Attempt to create invoice with expired token
  let error;
  try {
    await TREASURY_API.createInvoice({
      sessionToken: expiredToken,
      amount: 100.00,
      currency: 'USD'
    });
  } catch (e) {
    error = e;
  }
  
  // 4. Assert request denied
  expect(error).toBeDefined();
  expect(error.status).toBe(401);
  expect(error.code).toBe('SESSION_EXPIRED');
  
  // 5. Assert invoice NOT created
  const invoices = await TREASURY_Database.query(
    'SELECT * FROM invoices WHERE userId = ?',
    ['user-123']
  );
  expect(invoices.length).toBe(0);
  
  // 6. Assert audit log recorded with denial
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE userId = ? AND result = ?',
    ['user-123', 'denied']
  );
  expect(auditLogs.some(log => log.reason === 'session_expired')).toBe(true);
});
```

---

## 8. Risk Assessment

### 8.1 Technical Risks

**Risk 1: D00 Session Token Format Change**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** TREASURY validates token using D00 public key (cryptographic verification), not format parsing. If D00 changes token format, TREASURY validation still works as long as signature scheme is stable.
- **Contingency:** If D00 changes signature scheme, TREASURY must update validation logic (estimated 1-2 days).

**Risk 2: D06 Consent Check Latency**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Cache consent checks for short duration (5 minutes) to reduce latency. Cache key: userId + purpose + dataType.
- **Contingency:** If D06 is unavailable, deny all payment operations (fail closed).

**Risk 3: Cross-Domain API Failures**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Implement retry logic with exponential backoff for D00/D06 API calls. Log all failures for monitoring.
- **Contingency:** If D00 or D06 is unavailable for >5 minutes, suspend TREASURY operations and notify users.

**Risk 4: Audit Trail Data Loss**
- **Likelihood:** Low
- **Impact:** Critical
- **Mitigation:** Write audit logs synchronously (not async) to ensure durability. Replicate audit database to secondary location.
- **Contingency:** If audit database is corrupted, restore from backup and reconcile with main database.

### 8.2 Legal Risks

**Risk 5: Payment Processing Without Legal Entity**
- **Likelihood:** High (if implementation proceeds without entity formation)
- **Impact:** Critical
- **Mitigation:** Do not integrate payment processor until legal entity is formed. This decision document explicitly defers implementation to M35-03/M35-04/M35-05.
- **Contingency:** If payment processing is needed before entity formation, use fiscal sponsorship (Option C in Section 5.2).

**Risk 6: PCI-DSS Non-Compliance**
- **Likelihood:** Medium
- **Impact:** Critical
- **Mitigation:** Engage PCI-DSS compliance consultant before implementing payment processing. Budget $5,000-$50,000/year for compliance.
- **Contingency:** If PCI-DSS compliance is too costly, use third-party payment processor that handles compliance (e.g., Stripe, PayPal).

**Risk 7: GDPR Non-Compliance**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Implement GDPR-compliant consent management (D06). Budget $10,000-$30,000/year for compliance.
- **Contingency:** If GDPR compliance is too complex, restrict payment processing to non-EU users only.

**Risk 8: Tax Reporting Failures**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Engage accountant to set up tax reporting system before processing payments. Automate tax calculation and remittance.
- **Contingency:** If tax reporting is too complex, use third-party service that handles tax compliance.

### 8.3 Business Risks

**Risk 9: Payment Processor Rejection**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Research payment processor requirements before applying. Ensure legal entity meets all requirements (business plan, financial projections, etc.).
- **Contingency:** If primary processor rejects application, apply to alternative processors.

**Risk 10: Insufficient Revenue to Cover Compliance Costs**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Estimate compliance costs ($17,000-$90,000/year) and ensure projected revenue exceeds costs. Start with low-cost compliance options (e.g., third-party processor).
- **Contingency:** If revenue is insufficient, suspend payment processing and focus on donation-based funding.

**Risk 11: User Resistance to Consent Requirements**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Design consent flow to be user-friendly and transparent. Explain why consent is required (legal compliance, data protection).
- **Contingency:** If consent requirements reduce conversion rate, explore alternative consent models (e.g., implicit consent for low-risk operations).

---

## 9. Overlap Analysis

### 9.1 Overlap with M35-01 (TREASURY Domain Foundation)

**M35-01 Scope:** Establish TREASURY domain infrastructure (database, API, authentication).  
**M35-02 Scope:** Decide ownership boundaries and D00 session reuse.

**Overlap:**
- Both tasks address TREASURY domain setup
- M35-01 provides infrastructure, M35-02 provides design decisions

**Coordination:**
- M35-02 decisions guide M35-01 implementation
- M35-01 must implement M35-02 decisions (data boundaries, session reuse, audit isolation)

### 9.2 Overlap with M35-03 (Invoice Delivery Specification)

**M35-03 Scope:** Specify invoice generation, delivery, and formatting.  
**M35-02 Scope:** Decide ownership of invoice data (D15).

**Overlap:**
- Both tasks address invoice functionality
- M35-02 decides ownership, M35-03 specifies implementation

**Coordination:**
- M35-02 decisions constrain M35-03 design (invoices must be owned by TREASURY, not ARSY or EMPIRE)
- M35-03 must comply with M35-02 data boundaries

### 9.3 Overlap with M35-04 (Treasury Roles and Payment Idempotency)

**M35-04 Scope:** Define roles (admin, user, auditor) and idempotency for payment operations.  
**M35-02 Scope:** Decide D00 session reuse and audit trail isolation.

**Overlap:**
- Both tasks address access control and audit trails
- M35-02 decides session reuse, M35-04 specifies role-based access

**Coordination:**
- M35-02 decisions guide M35-04 role design (roles must work with D00 session tokens)
- M35-04 must implement M35-02 audit isolation (separate audit trails for D00 and TREASURY)

### 9.4 Overlap with M35-05 (Sandbox-to-Real Evidence and Unit Economics)

**M35-05 Scope:** Test payment processing with synthetic data, estimate unit economics.  
**M35-02 Scope:** Decide legal entity requirements and compliance costs.

**Overlap:**
- Both tasks address legal/compliance requirements
- M35-02 estimates compliance costs, M35-05 validates unit economics

**Coordination:**
- M35-02 decisions constrain M35-05 testing (must use legal entity, must comply with regulations)
- M35-05 must validate M35-02 cost estimates (unit economics must cover compliance costs)

---

## 10. Deferred Items

The following items are explicitly deferred to future work:

1. **Legal Entity Formation:** This document recommends forming a legal entity but does not actually form one. Formation is deferred to M35-03 or later.

2. **Payment Processor Integration:** This document does not integrate any payment processor (Stripe, PayPal, etc.). Integration is deferred to M35-03 or later.

3. **PCI-DSS Compliance Audit:** This document identifies PCI-DSS as a requirement but does not conduct an audit. Audit is deferred to M35-05.

4. **GDPR Compliance Audit:** This document identifies GDPR as a requirement but does not conduct an audit. Audit is deferred to M35-05.

5. **Tax Reporting Setup:** This document identifies tax reporting as a requirement but does not set up reporting system. Setup is deferred to M35-04.

6. **D00 Session Token Format Specification:** This document assumes D00 session tokens exist but does not specify their format. Format specification is deferred to D00 domain.

7. **D06 Consent Check API Specification:** This document assumes D06 consent check API exists but does not specify its interface. API specification is deferred to D06 domain.

8. **TREASURY Database Schema:** This document specifies data ownership but does not define database schema. Schema design is deferred to M35-01.

9. **TREASURY API Endpoints:** This document specifies API-mediated access but does not define specific endpoints. Endpoint design is deferred to M35-01.

10. **Audit Trail Storage Implementation:** This document specifies audit trail isolation but does not implement storage. Implementation is deferred to M35-01.

11. **Cross-Domain Query Enforcement:** This document specifies no direct cross-domain queries but does not implement enforcement. Enforcement is deferred to M35-01.

12. **Consent Caching Implementation:** This document mentions caching consent checks but does not implement caching. Implementation is deferred to M35-01.

13. **Retry Logic for Cross-Domain API Calls:** This document mentions retry logic but does not implement it. Implementation is deferred to M35-01.

14. **Unit Economics Validation:** This document estimates compliance costs but does not validate unit economics. Validation is deferred to M35-05.

15. **User Consent Flow Design:** This document mentions user-friendly consent flow but does not design it. Design is deferred to EMPIRE domain.

16. **Invoice Formatting and Delivery:** This document specifies invoice ownership but does not specify formatting or delivery. Specification is deferred to M35-03.

17. **Role-Based Access Control Implementation:** This document mentions roles but does not implement RBAC. Implementation is deferred to M35-04.

18. **Idempotency Key Generation:** This document mentions payment idempotency but does not specify key generation. Specification is deferred to M35-04.

19. **Refund and Dispute Workflows:** This document mentions refunds and disputes but does not specify workflows. Specification is deferred to M35-03.

20. **Financial Reporting Automation:** This document mentions financial reporting but does not automate it. Automation is deferred to M35-04.

---

## 11. Acceptance Criteria

This task is complete when:

1. **Decision Document:** This document is reviewed and approved by TREASURY domain owner, D00 owner, D06 owner, and legal advisor.

2. **Ownership Decision:** TREASURY domain ownership of D15/D16 is documented and accepted.

3. **Session Reuse Decision:** D00 session token reuse by TREASURY is documented and accepted.

4. **Data Boundary Specification:** Cross-domain data boundaries are specified and accepted.

5. **Legal Entity Requirements:** Legal entity formation requirements are documented.

6. **Positive Test Scenario:** Synthetic test scenario demonstrates successful invoice creation with valid D00 session and D06 consent.

7. **Negative Test Scenarios:** Synthetic test scenarios demonstrate denial of invoice creation without consent or with expired session.

8. **Risk Assessment:** Technical, legal, and business risks are identified with mitigations and contingencies.

9. **Overlap Analysis:** Overlaps with M35-01/M35-03/M35-04/M35-05 are documented.

10. **Deferred Items:** All deferred items are explicitly documented and assigned to future work.

**Note:** This document satisfies the decision and planning requirements of M35-02. Implementation is deferred to M35-01/M35-03/M35-04/M35-05.

---

## 12. Conclusion

This decision document establishes ownership boundaries for the merchant legal/payment system (D15: Invoice & Payment Records) and D16 (Manual Payment Tracking) within the MoonWitness XV architecture. The document defines:

- **TREASURY Domain Ownership:** D15/D16 are owned by TREASURY domain (M35), not ARSY or EMPIRE
- **D00 Session Reuse:** TREASURY reuses D00 session tokens for authentication with strict audit isolation
- **Data Boundaries:** Cross-domain queries are API-mediated, consent-required, and audit-logged
- **Legal Entity Requirements:** Legal entity must be formed before payment processing implementation
- **Compliance Requirements:** PCI-DSS, GDPR, and local financial regulations apply
- **Positive Test Scenario:** User creates invoice with valid D00 session and D06 consent
- **Negative Test Scenarios:** User denied invoice creation without consent or with expired session
- **Risk Assessment:** 11 risks identified (4 technical, 4 legal, 3 business) with mitigations and contingencies
- **Overlap Analysis:** Coordination with M35-01/M35-03/M35-04/M35-05 documented
- **Deferred Items:** 20 items explicitly deferred to future work

The decision satisfies the requirements of M35-02: it establishes ownership boundaries, specifies D00 session reuse, and provides synthetic test evidence (positive and negative scenarios).

**Status:** BASELINE ESTABLISHED — decision complete, implementation deferred.

---

## Appendix A: TREASURY Domain Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TREASURY Domain (M35)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TREASURY API Layer                       │  │
│  │  - POST /treasury/invoices                           │  │
│  │  - GET /treasury/invoices/:id                        │  │
│  │  - POST /treasury/payments                           │  │
│  │  - GET /treasury/payments/:id                        │  │
│  │  - POST /treasury/refunds                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           TREASURY Business Logic Layer               │  │
│  │  - Invoice generation                                │  │
│  │  - Payment recording                                 │  │
│  │  - Refund processing                                 │  │
│  │  - Audit logging                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TREASURY Data Layer                      │  │
│  │  - TREASURY Database (invoices, payments, refunds)   │  │
│  │  - TREASURY Audit Database (audit logs)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  External Dependencies:                                     │
│  - D00 API (session validation)                            │
│  - D06 API (consent checking)                              │
│  - Payment Processor API (Stripe, PayPal, etc.)            │
│                                                             │
│  Data Ownership:                                            │
│  - D15: Invoice & Payment Records                          │
│  - D16: Manual Payment Tracking                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Appendix B: D00 Session Token Validation Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Login to D00
     │    POST /d00/login { email, password }
     ▼
┌──────────┐
│   D00    │
│  (Auth)  │
└────┬─────┘
     │
     │ 2. Validate credentials
     │    - Check email exists
     │    - Verify password hash
     │    - Check account status
     ▼
┌──────────┐
│   D00    │
│  (Auth)  │
└────┬─────┘
     │
     │ 3. Generate session token
     │    JWT: {
     │      userId: "user-123",
     │      sessionId: "session-456",
     │      expiresAt: "2026-10-31T23:59:59Z",
     │      signature: HMAC-SHA256(payload, secret)
     │    }
     ▼
┌──────────┐
│   D00    │
│  (Auth)  │
└────┬─────┘
     │
     │ 4. Return session token
     │    Response: { token: "eyJ..." }
     ▼
┌──────────┐
│  User    │
│(Browser) │
└────┬─────┘
     │
     │ 5. Use session token for TREASURY API
     │    POST /treasury/invoices
     │    Authorization: Bearer eyJ...
     ▼
┌──────────┐
│TREASURY  │
│  (M35)   │
└────┬─────┘
     │
     │ 6. Validate session token
     │    - Verify signature using D00 public key
     │    - Check expiration
     │    - Extract userId, sessionId
     ▼
┌──────────┐
│TREASURY  │
│  (M35)   │
└────┬─────┘
     │
     │ 7. Proceed with payment operation
     │    (if token is valid)
     ▼
┌──────────┐
│TREASURY  │
│  (M35)   │
└──────────┘
```

## Appendix C: D06 Consent Check Flow

```
┌──────────┐
│TREASURY  │
│  (M35)   │
└────┬─────┘
     │
     │ 1. Check consent before payment operation
     │    GET /d06/consent/check?userId=user-123&purpose=payment&dataType=invoice
     ▼
┌──────────┐
│   D06    │
│(Consent) │
└────┬─────┘
     │
     │ 2. Query consent database
     │    SELECT * FROM consents
     │    WHERE userId = 'user-123'
     │    AND purpose = 'payment'
     │    AND dataType = 'invoice'
     │    AND expiresAt > NOW()
     ▼
┌──────────┐
│   D06    │
│(Consent) │
└────┬─────┘
     │
     │ 3. Return consent status
     │    Response: {
     │      granted: true/false,
     │      expiresAt: "2027-10-31T00:00:00Z",
     │      reason: "Consent record found" / "No consent record"
     │    }
     ▼
┌──────────┐
│TREASURY  │
│  (M35)   │
└────┬─────┘
     │
     │ 4. Proceed or deny based on consent
     │    if (consent.granted) {
     │      // proceed with payment operation
     │    } else {
     │      // deny request
     │      throw new ConsentError('Consent not granted');
     │    }
     ▼
┌──────────┐
│TREASURY  │
│  (M35)   │
└──────────┘
```

## Appendix D: Audit Trail Schema

**TREASURY Audit Log Table:**
```sql
CREATE TABLE treasury_audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  sessionId VARCHAR(255) NOT NULL,  -- Reference to D00 session, not full token
  userId VARCHAR(255) NOT NULL,      -- Reference to D00 user
  operation VARCHAR(100) NOT NULL,   -- e.g., 'invoice.create', 'payment.record'
  invoiceId VARCHAR(255),            -- Optional, if operation involves invoice
  paymentId VARCHAR(255),            -- Optional, if operation involves payment
  amount DECIMAL(10, 2),             -- Optional, if operation involves amount
  currency VARCHAR(3),               -- Optional, e.g., 'USD', 'EUR'
  result VARCHAR(50) NOT NULL,       -- 'success' or 'denied'
  reason VARCHAR(255),               -- Optional, if result is 'denied'
  ipAddress VARCHAR(45),             -- Optional, for security auditing
  userAgent TEXT                     -- Optional, for security auditing
);

CREATE INDEX idx_audit_logs_timestamp ON treasury_audit_logs(timestamp);
CREATE INDEX idx_audit_logs_userId ON treasury_audit_logs(userId);
CREATE INDEX idx_audit_logs_sessionId ON treasury_audit_logs(sessionId);
CREATE INDEX idx_audit_logs_operation ON treasury_audit_logs(operation);
CREATE INDEX idx_audit_logs_result ON treasury_audit_logs(result);
```

**Retention Policy:**
- Audit logs retained for 7 years (legal requirement)
- Logs archived after 1 year (move to cold storage)
- Logs deleted after 7 years (automated cleanup)

## Appendix E: Glossary

**D15:** Invoice & Payment Records — domain data type for tracking invoices and payment transactions.

**D16:** Manual Payment Tracking — domain data type for tracking offline payments (bank transfers, checks).

**D00:** Identity domain — manages user authentication, session tokens, and identity data.

**D06:** Consent domain — manages user consent for data processing purposes.

**TREASURY:** Financial domain (M35) — owns D15/D16 data and payment processing logic.

**ARSY:** Research domain — manages witness testimony and research data.

**EMPIRE:** Commercial domain — manages public-facing applications (Dock, Headquarters, Cockpit).

**PCI-DSS:** Payment Card Industry Data Security Standard — compliance requirement for processing credit/debit cards.

**GDPR:** General Data Protection Regulation — EU privacy law governing personal data processing.

**JWT:** JSON Web Token — standard format for session tokens (RFC 7519).

**HMAC-SHA256:** Hash-based Message Authentication Code using SHA-256 — cryptographic signature algorithm.

**Idempotency:** Property where repeating the same operation produces the same result without side effects.

**Audit Trail:** Chronological record of operations for compliance, debugging, and security purposes.

**Data Boundary:** Logical separation between domains to enforce data isolation and access control.

**Cross-Domain Query:** Query that accesses data from multiple domains (must be API-mediated and consent-required).

**Session Token:** Cryptographic token issued by D00 to authenticate user sessions.

**Consent Check:** Verification that user has granted consent for a specific data processing purpose.

**Legal Entity:** Organization recognized by law (e.g., LLC, corporation) that can enter contracts and process payments.

**Fiscal Sponsorship:** Arrangement where existing organization handles financial compliance on behalf of another entity.

**Unit Economics:** Financial metrics per unit of product/service (e.g., cost per transaction, revenue per user).
