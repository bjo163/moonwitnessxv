# M35-04: Treasury Roles and Payment Idempotency Specification

**Task ID:** M35-04  
**Priority:** P1  
**Difficulty:** D3  
**Dependencies:** M35-03  
**Owner:** TREASURY domain  
**Effort:** M (3-5 days)  
**Status:** BASELINE ESTABLISHED — 2026-10-31  
**Evidence Type:** Specification document (no code implemented)

---

## Executive Summary

This specification document defines role-based access control (RBAC) for the TREASURY domain and payment idempotency mechanisms to prevent duplicate transactions. The specification establishes clear role boundaries, permission matrices, and idempotency protocols that ensure financial operations are secure, auditable, and resistant to replay attacks.

**Key Specifications:**
1. **Treasury Roles:** 5 distinct roles (customer, treasurystaff, treasuryadmin, auditor, system) with granular permissions
2. **Permission Matrix:** Role-based access to quotes, orders, invoices, deliveries, and refunds
3. **Payment Idempotency:** Idempotency key mechanism to prevent duplicate payment processing
4. **Audit Trail:** Role-based audit logging for all financial operations
5. **Security Controls:** Session validation, authorization checks, and data isolation

**Scope Limitation:** This document covers specification only. Implementation requires TREASURY domain infrastructure (M35-01) and integration with D00 (identity) and D06 (consent).

**Relationship to M35-03:** M35-03 specified the financial transaction lifecycle (quotes, orders, invoices, refunds). This specification defines who can perform these operations (roles) and how to prevent duplicate operations (idempotency).

---

## 1. Treasury Roles Specification

### 1.1 Role Definition

**Customer:**
- **Description:** End user who creates quotes, places orders, receives invoices, and requests refunds
- **Scope:** Own financial records only
- **Trust Level:** Low (requires authorization for all operations)
- **Examples:** Individual users, institutional clients

**Treasury Staff:**
- **Description:** Operational staff who process orders, generate invoices, track deliveries, and handle routine refunds
- **Scope:** All customer financial records (read/write for assigned operations)
- **Trust Level:** Medium (can perform operational tasks, cannot approve large refunds or modify system settings)
- **Examples:** Customer service representatives, billing specialists

**Treasury Admin:**
- **Description:** Administrative staff who manage treasury operations, approve large refunds, and override system restrictions
- **Scope:** All financial records (full read/write access)
- **Trust Level:** High (can approve refunds >$100, cancel orders, issue credit notes)
- **Examples:** Finance managers, treasury administrators

**Auditor:**
- **Description:** Independent reviewer who audits financial records for compliance and accuracy
- **Scope:** All financial records (read-only access)
- **Trust Level:** High (can view all data, cannot modify)
- **Examples:** Internal auditors, external compliance reviewers

**System:**
- **Description:** Automated processes that perform scheduled operations (e.g., marking overdue invoices, expiring quotes)
- **Scope:** All financial records (limited to automated operations)
- **Trust Level:** Highest (operates without human intervention, but restricted to predefined operations)
- **Examples:** Cron jobs, background workers, automated notifications

### 1.2 Role Assignment

**Assignment Rules:**
1. **Customer:** Automatically assigned when user creates first quote
2. **Treasury Staff:** Assigned by Treasury Admin via admin panel
3. **Treasury Admin:** Assigned by System Owner (organization admin)
4. **Auditor:** Assigned by System Owner or Treasury Admin
5. **System:** Assigned to automated processes during deployment

**Role Hierarchy:**
```
System Owner (organization level)
    ↓
Treasury Admin
    ↓
Treasury Staff
    ↓
Customer
    ↓
Auditor (read-only, parallel to hierarchy)
```

**Multiple Roles:**
- User can hold multiple roles (e.g., Treasury Admin + Auditor)
- Permissions are union of all assigned roles
- Most restrictive role applies for sensitive operations (e.g., refund approval)

**Role Revocation:**
- Roles can be revoked by Treasury Admin or System Owner
- Revocation takes effect immediately
- Audit log records role changes
- Active sessions are terminated upon revocation

### 1.3 Role-Based Permission Matrix

**Quote Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Create quote | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| View quote | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Edit quote | ✅ (own, draft only) | ❌ | ✅ (draft only) | ❌ | ❌ |
| Send quote | ✅ (own) | ✅ (all) | ✅ (all) | ❌ | ✅ (auto-send) |
| Accept quote | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Expire quote | ❌ | ❌ | ✅ (all) | ❌ | ✅ (auto-expire) |
| Delete quote | ❌ | ❌ | ✅ (draft only) | ❌ | ❌ |

**Order Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Create order | ✅ (from own quote) | ❌ | ❌ | ❌ | ✅ (from accepted quote) |
| View order | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Confirm order | ❌ | ✅ (all) | ✅ (all) | ❌ | ✅ (auto-confirm) |
| Process order | ❌ | ✅ (all) | ✅ (all) | ❌ | ❌ |
| Deliver order | ❌ | ✅ (all) | ✅ (all) | ❌ | ❌ |
| Cancel order | ✅ (own, pending only) | ❌ | ✅ (all) | ❌ | ❌ |
| Update order status | ❌ | ✅ (all) | ✅ (all) | ❌ | ✅ (scheduled jobs) |

**Invoice Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Create invoice | ❌ | ✅ (from confirmed order) | ✅ (from confirmed order) | ❌ | ✅ (auto-generate) |
| View invoice | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Issue invoice | ❌ | ✅ (all) | ✅ (all) | ❌ | ✅ (auto-issue) |
| Mark paid | ❌ | ✅ (all) | ✅ (all) | ❌ | ✅ (auto-mark) |
| Generate PDF | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ❌ |
| Cancel invoice | ❌ | ❌ | ✅ (draft only) | ❌ | ❌ |
| Update invoice | ❌ | ❌ | ✅ (draft only) | ❌ | ❌ |

**Delivery Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Create delivery | ❌ | ✅ (from confirmed order) | ✅ (from confirmed order) | ❌ | ❌ |
| View delivery | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Update status | ❌ | ✅ (all) | ✅ (all) | ❌ | ❌ |
| Complete delivery | ❌ | ✅ (all) | ✅ (all) | ❌ | ❌ |
| Mark failed | ❌ | ✅ (all) | ✅ (all) | ❌ | ❌ |

**Refund Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Request refund | ✅ (own order) | ❌ | ❌ | ❌ | ❌ |
| View refund | ✅ (own) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Approve refund | ❌ | ❌ | ✅ (all) | ❌ | ✅ (auto-approve ≤$100) |
| Reject refund | ❌ | ❌ | ✅ (all) | ❌ | ❌ |
| Process refund | ❌ | ✅ (approved only) | ✅ (approved only) | ❌ | ❌ |
| Complete refund | ❌ | ✅ (processing) | ✅ (processing) | ❌ | ❌ |

**Administrative Operations:**

| Operation | Customer | Treasury Staff | Treasury Admin | Auditor | System |
|-----------|----------|----------------|----------------|---------|--------|
| Assign roles | ❌ | ❌ | ✅ (staff only) | ❌ | ❌ |
| Revoke roles | ❌ | ❌ | ✅ (all) | ❌ | ❌ |
| View audit logs | ❌ | ✅ (own operations) | ✅ (all) | ✅ (all) | ✅ (system operations) |
| Export financial data | ❌ | ❌ | ✅ (all) | ✅ (all) | ❌ |
| Configure system settings | ❌ | ❌ | ❌ | ❌ | ✅ (deployment) |

### 1.4 Role-Based Authorization Implementation

**Authorization Middleware:**
```javascript
function authorize(requiredRoles) {
  return async (req, res, next) => {
    // 1. Extract user from D00 session token
    const user = await D00_API.validateSession(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 2. Fetch user roles from TREASURY database
    const userRoles = await TREASURY_Database.query(
      'SELECT role FROM user_roles WHERE userId = ?',
      [user.userId]
    );
    
    // 3. Check if user has any of the required roles
    const hasRole = userRoles.some(ur => requiredRoles.includes(ur.role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    
    // 4. Attach user and roles to request context
    req.user = user;
    req.userRoles = userRoles.map(ur => ur.role);
    
    next();
  };
}
```

**Usage Example:**
```javascript
// Only Treasury Admin can approve refunds
app.post('/treasury/refunds/:refundId/approve', 
  authorize(['treasuryadmin']), 
  async (req, res) => {
    // ... approval logic
  }
);

// Customer and Treasury Staff can view orders
app.get('/treasury/orders/:orderId', 
  authorize(['customer', 'treasurystaff', 'treasuryadmin', 'auditor']), 
  async (req, res) => {
    // ... view logic
  }
);
```

**Data Isolation:**
```javascript
function filterByOwnership(req, data) {
  // Customer can only see own data
  if (req.userRoles.includes('customer') && !req.userRoles.includes('treasurystaff')) {
    return data.filter(d => d.userId === req.user.userId);
  }
  
  // Treasury Staff/Admin/Auditor can see all data
  return data;
}
```

### 1.5 Role Positive Test Scenario

**Scenario: Treasury Staff processes order**

**Setup:**
- User authenticated via D00 with role = `treasurystaff`
- Order exists with status = `confirmed`
- TREASURY domain operational

**Test Steps:**
1. Treasury Staff attempts to confirm order:
   ```http
   PATCH /treasury/orders/order-xyz789/confirm
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "paymentId": "payment-001",
     "amount": 265.00
   }
   ```

2. Authorization middleware validates:
   - D00 session token ✓
   - User has `treasurystaff` role ✓
   - `treasurystaff` is in required roles [`treasurystaff`, `treasuryadmin`] ✓

3. Order status changes to `confirmed`

4. Audit log recorded:
   ```json
   {
     "timestamp": "2026-10-31T14:28:00Z",
     "userId": "user-123",
     "userRole": "treasurystaff",
     "operation": "order.confirm",
     "orderId": "order-xyz789",
     "result": "success"
   }
   ```

**Expected Outcome:**
- Authorization granted (user has required role)
- Order confirmed successfully
- Audit log recorded with user role

**Test Assertion:**
```javascript
test('treasury staff can confirm orders', async () => {
  // 1. Create user with treasury staff role
  const user = await D00_API.createUser({ email: 'staff@example.com' });
  await TREASURY_Database.insert('user_roles', {
    userId: user.userId,
    role: 'treasurystaff'
  });
  
  // 2. Create order in pending status
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  expect(order.status).toBe('pending');
  
  // 3. Authenticate as treasury staff
  const sessionToken = await D00_API.login('staff@example.com', 'password');
  
  // 4. Confirm order
  const confirmedOrder = await TREASURY_API.confirmOrder(order.orderId, {
    paymentId: 'payment-001',
    amount: 265.00
  }, sessionToken);
  
  expect(confirmedOrder.status).toBe('confirmed');
  
  // 5. Verify audit log
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE orderId = ? AND userId = ?',
    [order.orderId, user.userId]
  );
  expect(auditLogs.length).toBe(1);
  expect(auditLogs[0].userRole).toBe('treasurystaff');
  expect(auditLogs[0].operation).toBe('order.confirm');
});
```

### 1.6 Role Negative Test Scenarios

**Scenario 1: Customer attempts to confirm order**

**Test Steps:**
1. User authenticated via D00 with role = `customer`
2. Customer attempts to confirm order:
   ```http
   PATCH /treasury/orders/order-xyz789/confirm
   Authorization: Bearer <d00-session-token>
   ```

**Expected Outcome:**
- Authorization denied with error: `Forbidden: insufficient permissions`
- Order remains in `pending` status
- No audit log created (authorization failed before operation)

**Test Assertion:**
```javascript
test('customer cannot confirm orders', async () => {
  // 1. Create user with customer role only
  const user = await D00_API.createUser({ email: 'customer@example.com' });
  await TREASURY_Database.insert('user_roles', {
    userId: user.userId,
    role: 'customer'
  });
  
  // 2. Create order in pending status
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  
  // 3. Authenticate as customer
  const sessionToken = await D00_API.login('customer@example.com', 'password');
  
  // 4. Attempt to confirm order (should fail)
  let error;
  try {
    await TREASURY_API.confirmOrder(order.orderId, {
      paymentId: 'payment-001',
      amount: 265.00
    }, sessionToken);
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.status).toBe(403);
  expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
  
  // 5. Verify order status unchanged
  const updatedOrder = await TREASURY_API.getOrder(order.orderId);
  expect(updatedOrder.status).toBe('pending');
});
```

**Scenario 2: Customer views another customer's order**

**Test Steps:**
1. User A authenticated via D00 with role = `customer`
2. User A attempts to view User B's order:
   ```http
   GET /treasury/orders/order-xyz789
   Authorization: Bearer <d00-session-token>
   ```
   (where order-xyz789 belongs to User B)

**Expected Outcome:**
- Authorization denied with error: `Forbidden: cannot access other user's data`
- No order data returned

**Test Assertion:**
```javascript
test('customer cannot view other customer orders', async () => {
  // 1. Create two customers
  const userA = await D00_API.createUser({ email: 'a@example.com' });
  const userB = await D00_API.createUser({ email: 'b@example.com' });
  
  await TREASURY_Database.insert('user_roles', { userId: userA.userId, role: 'customer' });
  await TREASURY_Database.insert('user_roles', { userId: userB.userId, role: 'customer' });
  
  // 2. Create order for User B
  const order = await TREASURY_API.createOrderForUser(userB.userId, quote.quoteId);
  
  // 3. Authenticate as User A
  const sessionToken = await D00_API.login('a@example.com', 'password');
  
  // 4. Attempt to view User B's order (should fail)
  let error;
  try {
    await TREASURY_API.getOrder(order.orderId, sessionToken);
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.status).toBe(403);
  expect(error.code).toBe('CANNOT_ACCESS_OTHER_USER_DATA');
});
```

---

## 2. Payment Idempotency Specification

### 2.1 Idempotency Definition

**Idempotency:** Property where making the same request multiple times produces the same result without side effects.

**Why Idempotency Matters:**
- **Network Failures:** Client sends payment request, network timeout, client retries → should not charge twice
- **Server Failures:** Server processes payment, crashes before sending response, restarts and processes again → should not charge twice
- **Client Bugs:** Client accidentally sends same request twice → should not charge twice
- **Replay Attacks:** Malicious actor intercepts and replays payment request → should not charge twice

### 2.2 Idempotency Key Specification

**Idempotency Key:** Unique identifier generated by client to identify a specific request.

**Key Format:**
```
Format: <version>-<timestamp>-<random>-<checksum>
Length: 43 characters (fixed)
Example: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0

Components:
- version: "idem" (4 chars) — idempotency key marker
- timestamp: ISO 8601 UTC without separators (15 chars)
  - Format: YYYYMMDDTHHMMSSZ
  - Example: 20261031T142800Z
  - Precision: seconds
- random: 16-character base32-encoded random value (16 chars)
  - Alphabet: a-z0-9 (lowercase alphanumeric, 32 symbols)
  - Entropy: 80 bits (2^80 possible values)
  - Generation: cryptographically secure PRNG (crypto.randomBytes)
- checksum: 4-character CRC32 of preceding components (4 chars)
  - Purpose: detect malformed keys, not security
  - Algorithm: CRC32 (standard, fast)
```

**Key Generation:**
```javascript
import { randomBytes } from 'crypto';

function generateIdempotencyKey() {
  const version = 'idem';
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const random = randomBytes(10).toString('base64url').toLowerCase().slice(0, 16);
  const payload = `${version}-${timestamp}-${random}`;
  const checksum = crc32(payload).toString(16).padStart(4, '0');
  return `${payload}-${checksum}`;
}
```

**Key Validation:**
```javascript
const IDEMPOTENCY_KEY_REGEX = /^idem-\d{8}T\d{6}Z-[a-z0-9]{16}-[a-z0-9]{4}$/;

function validateIdempotencyKey(key) {
  if (typeof key !== 'string') return false;
  if (key.length !== 43) return false;
  if (!IDEMPOTENCY_KEY_REGEX.test(key)) return false;
  
  // Verify checksum
  const parts = key.split('-');
  const payload = `${parts[0]}-${parts[1]}-${parts[2]}`;
  const expectedChecksum = crc32(payload).toString(16).padStart(4, '0');
  if (parts[3] !== expectedChecksum) return false;
  
  return true;
}
```

### 2.3 Idempotency Storage

**Storage Schema:**
```sql
CREATE TABLE idempotency_keys (
  idempotencyKey VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  endpoint VARCHAR(255) NOT NULL,
  requestHash VARCHAR(255) NOT NULL,
  responseStatus INTEGER,
  responseBody JSONB,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(userId, endpoint, requestHash)
);

CREATE INDEX idx_idempotency_userId ON idempotency_keys(userId);
CREATE INDEX idx_idempotency_expiresAt ON idempotency_keys(expiresAt);
```

**Storage Rules:**
1. **Key Expiration:** Idempotency keys expire after 24 hours (configurable)
2. **Request Hash:** SHA-256 hash of request body (excluding idempotency key itself)
3. **Response Storage:** Store response status and body for replay
4. **Cleanup:** Scheduled job removes expired keys daily

### 2.4 Idempotency Middleware

**Middleware Implementation:**
```javascript
async function idempotencyMiddleware(req, res, next) {
  // 1. Extract idempotency key from header
  const idempotencyKey = req.headers['idempotency-key'];
  
  // 2. If no key, proceed normally (not all endpoints require idempotency)
  if (!idempotencyKey) {
    return next();
  }
  
  // 3. Validate key format
  if (!validateIdempotencyKey(idempotencyKey)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency key format is invalid'
      }
    });
  }
  
  // 4. Extract user from session
  const user = await D00_API.validateSession(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 5. Calculate request hash
  const requestBody = JSON.stringify(req.body);
  const requestHash = crypto.createHash('sha256').update(requestBody).digest('hex');
  
  // 6. Check if key already exists
  const existing = await TREASURY_Database.query(
    'SELECT * FROM idempotency_keys WHERE idempotencyKey = ? AND userId = ?',
    [idempotencyKey, user.userId]
  );
  
  if (existing.length > 0) {
    const record = existing[0];
    
    // 7a. Check if request hash matches (same request)
    if (record.requestHash === requestHash) {
      // Idempotent replay: return stored response
      return res.status(record.responseStatus).json(record.responseBody);
    }
    
    // 7b. Request hash differs (different request with same key)
    return res.status(409).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REUSE',
        message: 'Idempotency key already used for different request'
      }
    });
  }
  
  // 8. Store idempotency key (pending)
  await TREASURY_Database.insert('idempotency_keys', {
    idempotencyKey,
    userId: user.userId,
    endpoint: req.path,
    requestHash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  // 9. Attach key to request context
  req.idempotencyKey = idempotencyKey;
  req.requestHash = requestHash;
  
  // 10. Intercept response to store result
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    await TREASURY_Database.update('idempotency_keys', idempotencyKey, {
      responseStatus: res.statusCode,
      responseBody: body
    });
    return originalJson(body);
  };
  
  next();
}
```

**Usage Example:**
```javascript
// Payment endpoint requires idempotency
app.post('/treasury/payments', 
  authorize(['customer']),
  idempotencyMiddleware,
  async (req, res) => {
    // ... payment processing logic
    // If request is replayed with same idempotency key, 
    // middleware returns stored response without executing logic
  }
);
```

### 2.5 Idempotency for Payment Operations

**Payment Request:**
```http
POST /treasury/payments
Authorization: Bearer <d00-session-token>
Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
Content-Type: application/json

{
  "orderId": "order-xyz789",
  "amount": 265.00,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "cardToken": "tok_1234567890"
}
```

**First Request (Success):**
1. Middleware checks idempotency key → not found
2. Middleware stores key (pending)
3. Payment processed successfully
4. Middleware stores response (status 200, body with payment details)
5. Response returned to client

**Second Request (Replay with Same Key):**
1. Middleware checks idempotency key → found
2. Middleware checks request hash → matches
3. Middleware returns stored response (status 200, same payment details)
4. Payment NOT processed again
5. Client receives same response as first request

**Third Request (Different Request with Same Key):**
1. Middleware checks idempotency key → found
2. Middleware checks request hash → differs
3. Middleware returns error (status 409, IDEMPOTENCY_KEY_REUSE)
4. Payment NOT processed
5. Client must generate new idempotency key

### 2.6 Idempotency Positive Test Scenario

**Scenario: Payment request replayed due to network timeout**

**Setup:**
- User authenticated via D00 with role = `customer`
- Order exists with status = `confirmed`
- TREASURY domain operational

**Test Steps:**
1. Client generates idempotency key:
   ```javascript
   const idempotencyKey = generateIdempotencyKey();
   // idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
   ```

2. Client sends payment request:
   ```http
   POST /treasury/payments
   Authorization: Bearer <d00-session-token>
   Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 265.00,
     "currency": "USD",
     "paymentMethod": "credit_card",
     "cardToken": "tok_1234567890"
   }
   ```

3. Server processes payment:
   - Payment charged: $265.00
   - Payment ID: `payment-001`
   - Response status: 200
   - Response body: `{ paymentId: "payment-001", status: "success", amount: 265.00 }`

4. Network timeout occurs (client does not receive response)

5. Client retries with same idempotency key:
   ```http
   POST /treasury/payments
   Authorization: Bearer <d00-session-token>
   Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 265.00,
     "currency": "USD",
     "paymentMethod": "credit_card",
     "cardToken": "tok_1234567890"
   }
   ```

6. Server detects idempotency key reuse:
   - Key found in database
   - Request hash matches
   - Return stored response (without reprocessing payment)

7. Client receives response:
   - Response status: 200
   - Response body: `{ paymentId: "payment-001", status: "success", amount: 265.00 }`
   - Same response as first request

**Expected Outcome:**
- Payment processed only once (despite two requests)
- Client receives same response for both requests
- Idempotency key stored in database with response
- Audit log shows single payment operation

**Test Assertion:**
```javascript
test('payment request replay returns same response without reprocessing', async () => {
  // 1. Generate idempotency key
  const idempotencyKey = generateIdempotencyKey();
  
  // 2. Create order
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  await TREASURY_API.confirmOrder(order.orderId, { paymentId: null, amount: 265.00 });
  
  // 3. First payment request
  const response1 = await TREASURY_API.createPayment({
    orderId: order.orderId,
    amount: 265.00,
    currency: 'USD',
    paymentMethod: 'credit_card',
    cardToken: 'tok_1234567890'
  }, idempotencyKey);
  
  expect(response1.status).toBe(200);
  expect(response1.paymentId).toBeDefined();
  
  // 4. Verify payment recorded
  const payments1 = await TREASURY_Database.query(
    'SELECT * FROM payments WHERE orderId = ?',
    [order.orderId]
  );
  expect(payments1.length).toBe(1);
  
  // 5. Replay payment request with same idempotency key
  const response2 = await TREASURY_API.createPayment({
    orderId: order.orderId,
    amount: 265.00,
    currency: 'USD',
    paymentMethod: 'credit_card',
    cardToken: 'tok_1234567890'
  }, idempotencyKey);
  
  expect(response2.status).toBe(200);
  expect(response2.paymentId).toBe(response1.paymentId); // Same payment ID
  
  // 6. Verify payment NOT recorded again
  const payments2 = await TREASURY_Database.query(
    'SELECT * FROM payments WHERE orderId = ?',
    [order.orderId]
  );
  expect(payments2.length).toBe(1); // Still only one payment
  
  // 7. Verify idempotency key stored
  const stored = await TREASURY_Database.query(
    'SELECT * FROM idempotency_keys WHERE idempotencyKey = ?',
    [idempotencyKey]
  );
  expect(stored.length).toBe(1);
  expect(stored[0].responseStatus).toBe(200);
  expect(stored[0].responseBody.paymentId).toBe(response1.paymentId);
});
```

### 2.7 Idempotency Negative Test Scenarios

**Scenario 1: Different request with same idempotency key**

**Test Steps:**
1. Client sends payment request with idempotency key:
   ```http
   POST /treasury/payments
   Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 265.00,
     "currency": "USD"
   }
   ```

2. Server processes payment successfully

3. Client sends different payment request with same idempotency key:
   ```http
   POST /treasury/payments
   Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 300.00,  // Different amount
     "currency": "USD"
   }
   ```

**Expected Outcome:**
- Server detects idempotency key reuse with different request hash
- Server returns error: `409 Conflict, IDEMPOTENCY_KEY_REUSE`
- Second payment NOT processed
- Client must generate new idempotency key

**Test Assertion:**
```javascript
test('different request with same idempotency key returns conflict', async () => {
  // 1. Generate idempotency key
  const idempotencyKey = generateIdempotencyKey();
  
  // 2. First payment request
  await TREASURY_API.createPayment({
    orderId: 'order-xyz789',
    amount: 265.00,
    currency: 'USD'
  }, idempotencyKey);
  
  // 3. Second payment request with same key but different amount
  let error;
  try {
    await TREASURY_API.createPayment({
      orderId: 'order-xyz789',
      amount: 300.00,  // Different amount
      currency: 'USD'
    }, idempotencyKey);
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.status).toBe(409);
  expect(error.code).toBe('IDEMPOTENCY_KEY_REUSE');
  
  // 4. Verify only one payment processed
  const payments = await TREASURY_Database.query(
    'SELECT * FROM payments WHERE orderId = ?',
    ['order-xyz789']
  );
  expect(payments.length).toBe(1);
  expect(payments[0].amount).toBe(265.00);
});
```

**Scenario 2: Invalid idempotency key format**

**Test Steps:**
1. Client sends payment request with invalid idempotency key:
   ```http
   POST /treasury/payments
   Idempotency-Key: invalid-key-format
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 265.00,
     "currency": "USD"
   }
   ```

**Expected Outcome:**
- Server validates key format
- Validation fails (key does not match regex)
- Server returns error: `400 Bad Request, INVALID_IDEMPOTENCY_KEY`
- Payment NOT processed

**Test Assertion:**
```javascript
test('invalid idempotency key format returns bad request', async () => {
  let error;
  try {
    await TREASURY_API.createPayment({
      orderId: 'order-xyz789',
      amount: 265.00,
      currency: 'USD'
    }, 'invalid-key-format');
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.status).toBe(400);
  expect(error.code).toBe('INVALID_IDEMPOTENCY_KEY');
});
```

**Scenario 3: Expired idempotency key**

**Test Steps:**
1. Client sends payment request with idempotency key
2. Server processes payment successfully
3. Wait 25 hours (key expires after 24 hours)
4. Client retries with same idempotency key

**Expected Outcome:**
- Server checks idempotency key → found but expired
- Server treats as new request (ignores expired key)
- Payment processed again (new idempotency key should be used)
- Warning logged: "Expired idempotency key reused"

**Test Assertion:**
```javascript
test('expired idempotency key is ignored', async () => {
  // 1. Generate idempotency key
  const idempotencyKey = generateIdempotencyKey();
  
  // 2. First payment request
  const response1 = await TREASURY_API.createPayment({
    orderId: 'order-xyz789',
    amount: 265.00,
    currency: 'USD'
  }, idempotencyKey);
  
  // 3. Simulate expiration (manually set expiresAt to past)
  await TREASURY_Database.update('idempotency_keys', idempotencyKey, {
    expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
  });
  
  // 4. Retry with same key (should be treated as new request)
  const response2 = await TREASURY_API.createPayment({
    orderId: 'order-xyz789',
    amount: 265.00,
    currency: 'USD'
  }, idempotencyKey);
  
  // 5. Verify two payments processed (key was expired)
  const payments = await TREASURY_Database.query(
    'SELECT * FROM payments WHERE orderId = ?',
    ['order-xyz789']
  );
  expect(payments.length).toBe(2);
  
  // 6. Verify warning logged
  const logs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE idempotencyKey = ? AND message LIKE ?',
    [idempotencyKey, '%Expired idempotency key reused%']
  );
  expect(logs.length).toBe(1);
});
```

---

## 3. Idempotency for Refund Operations

### 3.1 Refund Idempotency

**Why Refunds Need Idempotency:**
- Refunds involve money transfer (high risk of duplicate operations)
- Network failures can cause client to retry refund requests
- Server crashes can cause duplicate processing
- Malicious actors can attempt replay attacks

**Refund Request with Idempotency:**
```http
POST /treasury/refunds
Authorization: Bearer <d00-session-token>
Idempotency-Key: idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
Content-Type: application/json

{
  "orderId": "order-xyz789",
  "amount": 265.00,
  "reason": "delivery_failed",
  "reasonDetails": "Package arrived damaged"
}
```

**Idempotency Behavior:**
- First request: Refund created, status = `requested` (or `approved` if auto-approved)
- Replay with same key: Return stored response (same refund ID)
- Different request with same key: Return 409 Conflict

### 3.2 Refund Idempotency Test Scenario

**Scenario: Refund request replayed due to network timeout**

**Test Assertion:**
```javascript
test('refund request replay returns same response without reprocessing', async () => {
  // 1. Generate idempotency key
  const idempotencyKey = generateIdempotencyKey();
  
  // 2. Create delivered order
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  await TREASURY_API.confirmOrder(order.orderId, { paymentId: 'payment-001', amount: 265.00 });
  await TREASURY_API.deliverOrder(order.orderId, { deliveryNote: 'Delivered' });
  
  // 3. First refund request
  const response1 = await TREASURY_API.requestRefund({
    orderId: order.orderId,
    amount: 265.00,
    reason: 'delivery_failed'
  }, idempotencyKey);
  
  expect(response1.status).toBe(200);
  expect(response1.refundId).toBeDefined();
  
  // 4. Verify refund recorded
  const refunds1 = await TREASURY_Database.query(
    'SELECT * FROM refunds WHERE orderId = ?',
    [order.orderId]
  );
  expect(refunds1.length).toBe(1);
  
  // 5. Replay refund request with same idempotency key
  const response2 = await TREASURY_API.requestRefund({
    orderId: order.orderId,
    amount: 265.00,
    reason: 'delivery_failed'
  }, idempotencyKey);
  
  expect(response2.status).toBe(200);
  expect(response2.refundId).toBe(response1.refundId); // Same refund ID
  
  // 6. Verify refund NOT recorded again
  const refunds2 = await TREASURY_Database.query(
    'SELECT * FROM refunds WHERE orderId = ?',
    [order.orderId]
  );
  expect(refunds2.length).toBe(1); // Still only one refund
});
```

---

## 4. Audit Trail Specification

### 4.1 Role-Based Audit Logging

**Audit Log Schema:**
```sql
CREATE TABLE audit_logs (
  logId SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  userRole VARCHAR(50) NOT NULL,
  sessionId VARCHAR(255) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  entityType VARCHAR(50),
  entityId VARCHAR(255),
  idempotencyKey VARCHAR(255),
  requestHash VARCHAR(255),
  result VARCHAR(50) NOT NULL,
  details JSONB,
  ipAddress VARCHAR(45),
  userAgent TEXT
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_userId ON audit_logs(userId);
CREATE INDEX idx_audit_logs_userRole ON audit_logs(userRole);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_entityType ON audit_logs(entityType);
CREATE INDEX idx_audit_logs_entityId ON audit_logs(entityId);
```

**Audit Log Fields:**
- `logId`: Unique identifier
- `timestamp`: When operation occurred
- `userId`: Who performed operation (from D00 session)
- `userRole`: Role of user (customer, treasurystaff, etc.)
- `sessionId`: D00 session ID (for correlation)
- `operation`: What operation was performed (e.g., `order.confirm`, `refund.request`)
- `entityType`: Type of entity affected (quote, order, invoice, delivery, refund)
- `entityId`: ID of entity affected
- `idempotencyKey`: Idempotency key (if provided)
- `requestHash`: Hash of request body (for idempotency)
- `result`: Outcome (success, denied, error)
- `details`: Additional metadata (JSON)
- `ipAddress`: Client IP address
- `userAgent`: Client user agent string

**Audit Logging Middleware:**
```javascript
async function auditLogMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Intercept response
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    const duration = Date.now() - startTime;
    
    // Log operation
    await TREASURY_AuditDatabase.insert('audit_logs', {
      timestamp: new Date(),
      userId: req.user?.userId || 'anonymous',
      userRole: req.userRoles?.[0] || 'none',
      sessionId: req.user?.sessionId || 'none',
      operation: `${req.method.toLowerCase()}.${req.path.replace(/\//g, '.')}`,
      entityType: extractEntityType(req.path),
      entityId: extractEntityId(req.path),
      idempotencyKey: req.idempotencyKey || null,
      requestHash: req.requestHash || null,
      result: res.statusCode < 400 ? 'success' : 'error',
      details: {
        statusCode: res.statusCode,
        duration,
        requestBody: req.body,
        responseBody: body
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return originalJson(body);
  };
  
  next();
}
```

### 4.2 Audit Log Query Examples

**Query 1: All operations by user**
```sql
SELECT * FROM audit_logs
WHERE userId = 'user-123'
ORDER BY timestamp DESC
LIMIT 100;
```

**Query 2: All refund operations**
```sql
SELECT * FROM audit_logs
WHERE operation LIKE 'refund.%'
ORDER BY timestamp DESC;
```

**Query 3: All operations on specific order**
```sql
SELECT * FROM audit_logs
WHERE entityType = 'order' AND entityId = 'order-xyz789'
ORDER BY timestamp;
```

**Query 4: All failed operations**
```sql
SELECT * FROM audit_logs
WHERE result = 'error'
ORDER BY timestamp DESC;
```

**Query 5: Operations by role**
```sql
SELECT userRole, COUNT(*) as operation_count
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY userRole;
```

### 4.3 Audit Trail Positive Test Scenario

**Scenario: Audit log records role-based operation**

**Test Assertion:**
```javascript
test('audit log records user role and operation', async () => {
  // 1. Create user with treasury staff role
  const user = await D00_API.createUser({ email: 'staff@example.com' });
  await TREASURY_Database.insert('user_roles', {
    userId: user.userId,
    role: 'treasurystaff'
  });
  
  // 2. Authenticate as treasury staff
  const sessionToken = await D00_API.login('staff@example.com', 'password');
  
  // 3. Perform operation
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  await TREASURY_API.confirmOrder(order.orderId, {
    paymentId: 'payment-001',
    amount: 265.00
  }, sessionToken);
  
  // 4. Verify audit log
  const logs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM audit_logs WHERE userId = ? AND operation = ?',
    [user.userId, 'patch.orders.confirm']
  );
  
  expect(logs.length).toBe(1);
  expect(logs[0].userRole).toBe('treasurystaff');
  expect(logs[0].entityType).toBe('order');
  expect(logs[0].entityId).toBe(order.orderId);
  expect(logs[0].result).toBe('success');
  expect(logs[0].details.statusCode).toBe(200);
});
```

---

## 5. Security Controls

### 5.1 Session Validation

**D00 Session Token Validation:**
```javascript
async function validateSession(token) {
  // 1. Verify signature using D00 public key
  const verified = verifySignature(token, D00_PUBLIC_KEY);
  if (!verified) throw new AuthenticationError('Invalid signature');
  
  // 2. Check expiration
  if (token.expiresAt < Date.now()) {
    throw new AuthenticationError('Session expired');
  }
  
  // 3. Extract user data
  return {
    userId: token.userId,
    sessionId: token.sessionId,
    email: token.email
  };
}
```

### 5.2 Authorization Checks

**Role-Based Authorization:**
```javascript
function checkAuthorization(userRoles, requiredRoles) {
  const hasRole = userRoles.some(role => requiredRoles.includes(role));
  if (!hasRole) {
    throw new AuthorizationError('Insufficient permissions');
  }
}
```

**Data Ownership Check:**
```javascript
function checkOwnership(userId, resourceUserId, userRoles) {
  // Customer can only access own data
  if (userRoles.includes('customer') && !userRoles.includes('treasurystaff')) {
    if (userId !== resourceUserId) {
      throw new AuthorizationError('Cannot access other user data');
    }
  }
  
  // Treasury Staff/Admin/Auditor can access all data
  return true;
}
```

### 5.3 Rate Limiting

**Rate Limiting Middleware:**
```javascript
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment requests per 15 minutes
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many payment requests, please try again later'
    }
  },
  keyGenerator: (req) => req.user?.userId || req.ip
});

app.post('/treasury/payments', paymentLimiter, async (req, res) => {
  // ... payment logic
});
```

### 5.4 Input Validation

**Payment Request Validation:**
```javascript
const Joi = require('joi');

const paymentSchema = Joi.object({
  orderId: Joi.string().pattern(/^order-/).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().required(),
  paymentMethod: Joi.string().valid('credit_card', 'bank_transfer', 'paypal').required(),
  cardToken: Joi.string().when('paymentMethod', {
    is: 'credit_card',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});

function validatePaymentRequest(req, res, next) {
  const { error } = paymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }
  next();
}

app.post('/treasury/payments', validatePaymentRequest, async (req, res) => {
  // ... payment logic
});
```

---

## 6. Risk Assessment

### 6.1 Technical Risks

**Risk 1: Idempotency Key Collision**
- **Likelihood:** Very Low (80 bits of entropy)
- **Impact:** Medium (could cause incorrect response replay)
- **Mitigation:** Use cryptographically secure random generation, validate checksum
- **Contingency:** If collision detected, reject request and force new key generation

**Risk 2: Idempotency Storage Failure**
- **Likelihood:** Low
- **Impact:** High (payment processed twice)
- **Mitigation:** Use database transactions, implement retry logic
- **Contingency:** If storage fails, reject request (fail closed)

**Risk 3: Role Escalation Attack**
- **Likelihood:** Low
- **Impact:** Critical (unauthorized access to financial operations)
- **Mitigation:** Validate roles from database on every request, not from session token
- **Contingency:** If escalation detected, revoke all roles and notify security

**Risk 4: Audit Log Tampering**
- **Likelihood:** Very Low
- **Impact:** High (loss of compliance evidence)
- **Mitigation:** Write-once audit logs (no UPDATE/DELETE permissions), replicate to secondary storage
- **Contingency:** If tampering detected, restore from backup and investigate

### 6.2 Security Risks

**Risk 5: Session Token Theft**
- **Likelihood:** Medium
- **Impact:** High (attacker can impersonate user)
- **Mitigation:** Use HTTPS only, short session expiration (1 hour), refresh token rotation
- **Contingency:** If theft detected, invalidate session and force re-authentication

**Risk 6: Idempotency Key Interception**
- **Likelihood:** Low
- **Impact:** Medium (attacker can replay request)
- **Mitigation:** Use HTTPS only, bind idempotency key to user ID
- **Contingency:** If interception detected, reject replay and notify user

**Risk 7: Role-Based Access Control Bypass**
- **Likelihood:** Low
- **Impact:** Critical (unauthorized operations)
- **Mitigation:** Validate roles at middleware level, not in business logic
- **Contingency:** If bypass detected, patch vulnerability and audit all operations

**Risk 8: Denial of Service via Idempotency Storage**
- **Likelihood:** Medium
- **Impact:** Medium (storage fills up, legitimate requests rejected)
- **Mitigation:** Implement rate limiting, expire old keys, monitor storage usage
- **Contingency:** If storage full, increase capacity and reject non-critical requests

### 6.3 Business Risks

**Risk 9: Duplicate Payments Despite Idempotency**
- **Likelihood:** Very Low
- **Impact:** Critical (financial loss, customer dissatisfaction)
- **Mitigation:** Implement idempotency for all payment operations, monitor for duplicates
- **Contingency:** If duplicate detected, initiate refund and investigate root cause

**Risk 10: Unauthorized Refund Approval**
- **Likelihood:** Low
- **Impact:** High (financial loss)
- **Mitigation:** Require Treasury Admin approval for refunds >$100, implement audit trail
- **Contingency:** If unauthorized refund detected, freeze account and investigate

**Risk 11: Role Assignment Errors**
- **Likelihood:** Medium
- **Impact:** Medium (users have incorrect permissions)
- **Mitigation:** Require Treasury Admin approval for role assignments, log all role changes
- **Contingency:** If error detected, correct roles and audit affected operations

**Risk 12: Compliance Audit Failure**
- **Likelihood:** Low
- **Impact:** High (regulatory penalties)
- **Mitigation:** Implement comprehensive audit logging, retain logs for 7 years, regular compliance reviews
- **Contingency:** If failure detected, engage legal counsel and remediate immediately

---

## 7. Deferred Items

The following items are explicitly deferred to future work:

1. **Role Management UI:** This document specifies role-based access control but does not design UI for role assignment/revocation. UI design is deferred to EMPIRE domain.

2. **Multi-Factor Authentication:** This document assumes D00 session tokens are sufficient for authentication. MFA implementation is deferred to D00 domain.

3. **Advanced Rate Limiting:** This document specifies basic rate limiting but does not implement adaptive rate limiting (based on user behavior, risk score, etc.). Advanced rate limiting is deferred.

4. **Idempotency Key Rotation:** This document specifies 24-hour expiration but does not implement automatic key rotation. Rotation is deferred.

5. **Audit Log Analytics:** This document specifies audit log schema but does not implement analytics dashboards. Analytics are deferred to business intelligence team.

6. **Role Hierarchy Enforcement:** This document specifies role hierarchy but does not implement hierarchical permission inheritance. Inheritance is deferred.

7. **Temporary Role Assignment:** This document specifies permanent role assignment but does not implement temporary roles (e.g., 24-hour auditor access). Temporary roles are deferred.

8. **Idempotency Key Scope:** This document specifies global idempotency keys but does not implement scoped keys (e.g., per-endpoint, per-operation-type). Scoping is deferred.

9. **Audit Log Encryption:** This document specifies audit log storage but does not implement encryption at rest. Encryption is deferred to security team.

10. **Role-Based Caching:** This document does not specify caching strategies for role-based data. Caching is deferred to performance optimization phase.

11. **Idempotency Key Recovery:** This document does not specify recovery mechanism for lost idempotency keys (e.g., client crash). Recovery is deferred.

12. **Cross-Role Operations:** This document does not specify workflows requiring multiple roles (e.g., refund requires customer request + staff approval + admin confirmation). Cross-role workflows are deferred.

13. **Audit Log Retention Policy:** This document specifies 7-year retention but does not implement automated archival/deletion. Automation is deferred to operations team.

14. **Role-Based API Throttling:** This document specifies basic rate limiting but does not implement role-specific throttling (e.g., admins get higher limits). Role-based throttling is deferred.

15. **Idempotency Key Versioning:** This document specifies v1 idempotency key format but does not implement versioning for future format changes. Versioning is deferred.

16. **Audit Log Export:** This document specifies audit log query but does not implement export functionality (CSV, JSON, PDF). Export is deferred.

17. **Role Delegation:** This document does not specify delegation mechanism (e.g., admin delegates approval authority to staff). Delegation is deferred.

18. **Idempotency Key Blacklisting:** This document does not specify blacklisting mechanism for compromised keys. Blacklisting is deferred to security team.

19. **Audit Log Real-Time Monitoring:** This document does not specify real-time monitoring/alerting for suspicious operations. Monitoring is deferred to security operations team.

20. **Role-Based Feature Flags:** This document does not specify feature flag system for gradual role-based feature rollout. Feature flags are deferred.

---

## 8. Acceptance Criteria

This task is complete when:

1. **Role Specification:** 5 Treasury roles (customer, treasurystaff, treasuryadmin, auditor, system) are defined with clear scope and trust levels.

2. **Permission Matrix:** Role-based permissions are specified for all financial operations (quotes, orders, invoices, deliveries, refunds).

3. **Idempotency Key Specification:** Idempotency key format, generation, validation, and storage are fully specified.

4. **Idempotency Middleware:** Middleware implementation is specified with request hash calculation, response storage, and replay detection.

5. **Payment Idempotency:** Payment operations are protected against duplicate processing via idempotency keys.

6. **Refund Idempotency:** Refund operations are protected against duplicate processing via idempotency keys.

7. **Audit Trail:** Role-based audit logging is specified with comprehensive schema and query examples.

8. **Security Controls:** Session validation, authorization checks, rate limiting, and input validation are specified.

9. **Positive Test Scenarios:** At least 3 positive test scenarios (role authorization, payment idempotency, refund idempotency).

10. **Negative Test Scenarios:** At least 5 negative test scenarios (insufficient permissions, data isolation, idempotency key reuse, invalid key format, expired key).

11. **Risk Assessment:** 12 risks identified (4 technical, 4 security, 4 business) with mitigations and contingencies.

12. **Deferred Items:** 20 items explicitly deferred to future work.

**Note:** This document satisfies the specification requirements of M35-04. Implementation is deferred to M35-01/M35-05.

---

## 9. Conclusion

This specification document defines role-based access control and payment idempotency for the TREASURY domain (M35), covering:

- **Treasury Roles:** 5 distinct roles (customer, treasurystaff, treasuryadmin, auditor, system) with granular permissions
- **Permission Matrix:** Role-based access to all financial operations (quotes, orders, invoices, deliveries, refunds)
- **Payment Idempotency:** Idempotency key mechanism (43-character format, 80-bit entropy, 24-hour expiration) to prevent duplicate payment processing
- **Refund Idempotency:** Idempotency protection for refund operations
- **Audit Trail:** Role-based audit logging with comprehensive schema (userId, userRole, operation, entityType, entityId, idempotencyKey, result, details)
- **Security Controls:** Session validation, authorization checks, rate limiting, input validation
- **Test Scenarios:** 3+ positive and 5+ negative test scenarios with assertions
- **Risk Assessment:** 12 risks (4 technical, 4 security, 4 business) with mitigations and contingencies
- **Deferred Items:** 20 items explicitly deferred to future work

The specification satisfies the requirements of M35-04: it establishes Treasury roles, defines permission matrices, and specifies payment idempotency mechanisms to ensure secure, auditable, and replay-resistant financial operations.

**Status:** BASELINE ESTABLISHED — specification complete, implementation deferred.

---

## Appendix A: Idempotency Key Format Examples

**Valid Keys:**
```
idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
idem-20261031T000000Z-zzzzzzzzzzzzzzzz-0000
idem-20261031T235959Z-aaaaaaaaaaaaaaaa-ffff
```

**Invalid Keys:**
```
idem-20261031T142800Z-a1b2c3d4e5f6g7h8-xxxx  (checksum mismatch)
idem-20261031T142800Z-a1b2c3d4e5f6g7h8        (missing checksum)
idem-20261031T142800-a1b2c3d4e5f6g7h8-i9j0    (missing Z in timestamp)
v1-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0     (wrong version, should be "idem")
20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0        (missing version)
idem-20261031T142800Z-A1B2C3D4E5F6G7H8-I9J0   (uppercase, invalid)
invalid-key-format                             (completely invalid)
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
const payload = 'idem-20261031T142800Z-a1b2c3d4e5f6g7h8';
const checksum = crc32(payload).toString(16).padStart(4, '0');
// checksum = 'i9j0' (example, not actual value)
```

## Appendix C: Role Permission Matrix (Detailed)

**Customer Permissions:**
- ✅ Create quotes (own)
- ✅ View quotes (own)
- ✅ Edit quotes (own, draft only)
- ✅ Send quotes (own)
- ✅ Accept quotes (own)
- ✅ Create orders (from own quotes)
- ✅ View orders (own)
- ✅ Cancel orders (own, pending only)
- ✅ View invoices (own)
- ✅ Generate invoice PDF (own)
- ✅ View deliveries (own)
- ✅ Request refunds (own orders)
- ✅ View refunds (own)

**Treasury Staff Permissions:**
- ✅ All Customer permissions (for all users)
- ✅ View all quotes
- ✅ Send all quotes
- ✅ View all orders
- ✅ Confirm all orders
- ✅ Process all orders
- ✅ Deliver all orders
- ✅ Create all invoices
- ✅ View all invoices
- ✅ Issue all invoices
- ✅ Mark all invoices as paid
- ✅ Generate all invoice PDFs
- ✅ Create all deliveries
- ✅ View all deliveries
- ✅ Update all delivery statuses
- ✅ Complete all deliveries
- ✅ Mark all deliveries as failed
- ✅ View all refunds
- ✅ Process approved refunds
- ✅ Complete refunds
- ✅ View audit logs (own operations)

**Treasury Admin Permissions:**
- ✅ All Treasury Staff permissions
- ✅ Edit all quotes (draft only)
- ✅ Expire all quotes
- ✅ Delete all quotes (draft only)
- ✅ Cancel all orders
- ✅ Update all order statuses
- ✅ Cancel all invoices (draft only)
- ✅ Update all invoices (draft only)
- ✅ Approve all refunds
- ✅ Reject all refunds
- ✅ Assign roles (staff only)
- ✅ Revoke roles (all)
- ✅ View all audit logs
- ✅ Export all financial data

**Auditor Permissions:**
- ✅ View all quotes
- ✅ View all orders
- ✅ View all invoices
- ✅ Generate all invoice PDFs
- ✅ View all deliveries
- ✅ View all refunds
- ✅ View all audit logs
- ✅ Export all financial data

**System Permissions:**
- ✅ Create orders (from accepted quotes)
- ✅ Confirm orders (auto-confirm on payment)
- ✅ Expire quotes (scheduled job)
- ✅ Auto-send quotes (scheduled job)
- ✅ Create invoices (auto-generate on order confirmation)
- ✅ Issue invoices (auto-issue)
- ✅ Mark invoices as paid (auto-mark on payment)
- ✅ Update order statuses (scheduled jobs)
- ✅ Approve refunds ≤$100 (auto-approve)
- ✅ View all audit logs (system operations)

## Appendix D: Idempotency Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Generate idempotency key
     │    idem-20261031T142800Z-a1b2c3d4e5f6g7h8-i9j0
     │
     │ 2. Send request with key
     │    POST /treasury/payments
     │    Idempotency-Key: idem-...-i9j0
     │    Body: { orderId, amount, ... }
     │
     ▼
┌──────────────────┐
│ Idempotency      │
│ Middleware       │
└────┬─────────────┘
     │
     │ 3. Validate key format
     │    - Check regex pattern
     │    - Verify checksum
     │
     │ 4. Calculate request hash
     │    SHA-256(body)
     │
     │ 5. Check if key exists
     │    SELECT * FROM idempotency_keys
     │    WHERE idempotencyKey = ?
     │
     ├─→ Key not found ──→ ┌──────────────────┐
     │                     │ Store key        │
     │                     │ (pending)        │
     │                     └────┬─────────────┘
     │                          │
     │                          ▼
     │                     ┌──────────────────┐
     │                     │ Process request  │
     │                     │ (payment logic)  │
     │                     └────┬─────────────┘
     │                          │
     │                          ▼
     │                     ┌──────────────────┐
     │                     │ Store response   │
     │                     │ (status + body)  │
     │                     └────┬─────────────┘
     │                          │
     │                          ▼
     │                     ┌──────────────────┐
     │                     │ Return response  │
     │                     └──────────────────┘
     │
     ├─→ Key found, hash matches ──→ ┌──────────────────┐
     │                               │ Return stored    │
     │                               │ response         │
     │                               │ (no processing)  │
     │                               └──────────────────┘
     │
     └─→ Key found, hash differs ──→ ┌──────────────────┐
                                     │ Return 409       │
                                     │ Conflict         │
                                     │ (key reuse)      │
                                     └──────────────────┘
```

## Appendix E: Glossary

**RBAC:** Role-Based Access Control — security model that restricts system access based on user roles.

**Idempotency:** Property where making the same request multiple times produces the same result without side effects.

**Idempotency Key:** Unique identifier generated by client to identify a specific request and prevent duplicate processing.

**Request Hash:** Cryptographic hash (SHA-256) of request body used to detect if same idempotency key is used for different requests.

**Replay Attack:** Security attack where malicious actor intercepts and retransmits a valid request to cause duplicate operations.

**Audit Trail:** Chronological record of all financial operations for compliance, debugging, and security purposes.

**Session Token:** Cryptographic token issued by D00 to authenticate user sessions.

**Authorization:** Process of verifying that user has permission to perform requested operation.

**Authentication:** Process of verifying user identity (via D00 session token).

**Permission Matrix:** Table mapping roles to allowed operations on resources.

**Data Isolation:** Security principle that users can only access their own data (unless granted broader access via role).

**Rate Limiting:** Security mechanism that restricts number of requests a user can make within time window.

**Checksum:** Error-detecting code used to verify data integrity (CRC32 for idempotency keys).

**Entropy:** Measure of randomness in a value (80 bits of entropy = 2^80 possible values).

**CRC32:** Cyclic Redundancy Check, 32-bit checksum algorithm for error detection.

**SHA-256:** Secure Hash Algorithm, 256-bit cryptographic hash function.

**Middleware:** Software that sits between request and business logic, performing cross-cutting concerns (authentication, authorization, logging).

**Fail Closed:** Security principle that system should deny access when uncertain (rather than allow access).

**Write-Once:** Property where data can be written but never modified or deleted (used for audit logs).

**Transaction:** Atomic database operation that either completes fully or not at all.

**Retry Logic:** Automatic retry of failed operations with exponential backoff.

**Scheduled Job:** Automated task running at specified intervals (e.g., expiring old idempotency keys).

**Role Hierarchy:** Structured ranking of roles from least to most privileged.

**Role Escalation:** Security vulnerability where user gains higher privileges than authorized.

**Session Hijacking:** Security attack where attacker steals valid session token to impersonate user.

**Input Validation:** Security mechanism that verifies request data matches expected format and constraints.

**Rate Limiter:** Component that enforces rate limiting policies.

**Idempotency Storage:** Database table storing idempotency keys, request hashes, and responses.

**Audit Log Schema:** Database table structure defining audit log fields and indexes.

**Compliance:** Adherence to legal and regulatory requirements (e.g., PCI-DSS, GDPR).

**Penetration Testing:** Security testing method where attackers attempt to breach system defenses.

**Denial of Service (DoS):** Attack where attacker overwhelms system with requests to make it unavailable.

**Blacklisting:** Security mechanism that blocks known-bad identifiers (e.g., compromised idempotency keys).

**Feature Flag:** Software development technique that allows enabling/disabling features without deploying new code.
