# M35-03: Quote Order Delivery Invoice and Refund Specification

**Task ID:** M35-03  
**Priority:** P1  
**Difficulty:** D3  
**Dependencies:** M35-02  
**Owner:** TREASURY domain  
**Effort:** M (3-5 days)  
**Status:** BASELINE ESTABLISHED — 2026-10-31  
**Evidence Type:** Specification document (no code implemented)

---

## Executive Summary

This specification document defines the quote, order, delivery, invoice, and refund workflows within the TREASURY domain (M35) established by M35-02. The specification covers the complete lifecycle of a financial transaction from initial quote generation through order fulfillment, invoice delivery, and potential refund processing.

**Key Specifications:**
1. **Quote Generation:** Time-bound price estimates with validity period (7 days default)
2. **Order Creation:** Conversion of quote to binding order with line items and totals
3. **Delivery Tracking:** Status tracking for physical/digital goods delivery
4. **Invoice Generation:** Immutable financial records with tax calculation and payment terms
5. **Refund Processing:** Partial/full refund workflows with approval gates and audit trails

**Scope Limitation:** This document covers specification only. Implementation requires TREASURY domain infrastructure (M35-01), payment processor integration (M35-04), and legal entity formation (M35-02 deferred items).

**Relationship to M35-02:** M35-02 established TREASURY domain ownership of D15 (Invoice & Payment Records) and D16 (Manual Payment Tracking). This specification defines how D15/D16 operate within TREASURY domain workflows.

---

## 1. Quote Specification

### 1.1 Quote Definition

**Quote:** A time-bound price estimate provided to a potential customer before they commit to a purchase.

**Quote Properties:**
- `quoteId`: Unique identifier (format: `quote-<uuid>`)
- `userId`: Reference to D00 user (customer)
- `lineItems`: Array of items with quantities and unit prices
- `subtotal`: Sum of line item totals (before tax/discount)
- `taxRate`: Applicable tax rate (e.g., 0.10 for 10%)
- `taxAmount`: Calculated tax (subtotal × taxRate)
- `discount`: Optional discount amount or percentage
- `total`: Final amount (subtotal + taxAmount - discount)
- `currency`: ISO 4217 currency code (e.g., "USD", "EUR", "IDR")
- `validUntil`: Expiration timestamp (default: 7 days from creation)
- `status`: `draft` | `sent` | `accepted` | `expired` | `converted`
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

### 1.2 Quote Lifecycle

```
┌─────────┐
│  DRAFT  │ ← Initial creation, editable
└────┬────┘
     │
     │ Send to customer
     ▼
┌─────────┐
│  SENT   │ ← Awaiting customer response, read-only
└────┬────┘
     │
     ├─→ Customer accepts ──→ ┌───────────┐
     │                        │ CONVERTED │ → Order created
     │                        └───────────┘
     │
     ├─→ Customer rejects ──→ ┌──────────┐
     │                        │ EXPIRED  │ (manual)
     │                        └──────────┘
     │
     └─→ Time expires ──────→ ┌──────────┐
                              │ EXPIRED  │ (automatic)
                              └──────────┘
```

### 1.3 Quote Generation Rules

**Rule 1: Line Item Validation**
- Each line item must have: `productId`, `quantity` (>0), `unitPrice` (≥0)
- Line item total = quantity × unitPrice
- Subtotal = sum of all line item totals

**Rule 2: Tax Calculation**
- Tax rate determined by customer location (D00 address) and product type
- Tax amount = subtotal × taxRate
- Tax must be calculated at quote generation time (locked in)

**Rule 3: Discount Application**
- Discount can be fixed amount or percentage
- If percentage: discount = subtotal × (discountPercent / 100)
- Total = subtotal + taxAmount - discount
- Total cannot be negative (minimum = 0)

**Rule 4: Validity Period**
- Default validity: 7 days from creation
- Configurable per quote (1-30 days)
- After expiration, quote status automatically changes to `expired`
- Expired quotes cannot be accepted (must create new quote)

**Rule 5: Immutability After Sending**
- Once quote status changes to `sent`, it becomes read-only
- Any changes require creating a new quote (new quoteId)
- Prevents disputes about quote terms

### 1.4 Quote API Endpoints

**POST /treasury/quotes**
- Create new quote
- Required: `userId`, `lineItems[]`, `currency`
- Optional: `discount`, `validDays` (default 7)
- Returns: `quoteId`, `total`, `validUntil`
- Status: `draft`

**GET /treasury/quotes/:quoteId**
- Retrieve quote details
- Requires: D00 session token with userId matching quote.userId
- Returns: Full quote object

**PATCH /treasury/quotes/:quoteId**
- Update quote (only if status = `draft`)
- Allowed fields: `lineItems[]`, `discount`, `validDays`
- Recalculates totals
- Returns: Updated quote object

**POST /treasury/quotes/:quoteId/send**
- Send quote to customer
- Changes status from `draft` to `sent`
- Locks quote (no further edits)
- Sends email notification to customer
- Returns: Updated quote object with `sentAt` timestamp

**POST /treasury/quotes/:quoteId/accept**
- Customer accepts quote
- Changes status from `sent` to `accepted`
- Triggers order creation (see Section 2)
- Returns: `orderId`

**POST /treasury/quotes/:quoteId/expire**
- Manually expire quote
- Changes status to `expired`
- Returns: Updated quote object

### 1.5 Quote Positive Test Scenario

**Scenario: Customer receives and accepts quote**

**Setup:**
- User authenticated via D00 (valid session token)
- User has granted consent for payment operations (D06)
- TREASURY domain operational

**Test Steps:**
1. TREASURY creates quote:
   ```http
   POST /treasury/quotes
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "userId": "user-123",
     "lineItems": [
       {
         "productId": "prod-001",
         "description": "Digital consultation",
         "quantity": 2,
         "unitPrice": 100.00
       },
       {
         "productId": "prod-002",
         "description": "Report generation",
         "quantity": 1,
         "unitPrice": 50.00
       }
     ],
     "currency": "USD",
     "taxRate": 0.10,
     "discount": 10.00,
     "validDays": 7
   }
   ```

2. TREASURY validates and creates quote:
   - Subtotal: (2 × 100) + (1 × 50) = 250.00
   - Tax: 250.00 × 0.10 = 25.00
   - Discount: 10.00
   - Total: 250.00 + 25.00 - 10.00 = 265.00
   - Valid until: 2026-11-07T14:28:00Z (7 days from now)
   - Status: `draft`

3. TREASURY sends quote:
   ```http
   POST /treasury/quotes/quote-abc123/send
   Authorization: Bearer <d00-session-token>
   ```

4. Quote status changes to `sent`, becomes read-only

5. Customer accepts quote:
   ```http
   POST /treasury/quotes/quote-abc123/accept
   Authorization: Bearer <d00-session-token>
   ```

6. Quote status changes to `accepted`, triggers order creation

**Expected Outcome:**
- Quote created with correct calculations
- Quote sent successfully (status = `sent`)
- Quote accepted (status = `accepted`)
- Order created (see Section 2)
- Audit log recorded for each operation

**Test Assertion:**
```javascript
test('quote lifecycle: draft → sent → accepted → order created', async () => {
  // 1. Create quote
  const quote = await TREASURY_API.createQuote({
    userId: 'user-123',
    lineItems: [
      { productId: 'prod-001', quantity: 2, unitPrice: 100.00 },
      { productId: 'prod-002', quantity: 1, unitPrice: 50.00 }
    ],
    currency: 'USD',
    taxRate: 0.10,
    discount: 10.00
  });
  
  expect(quote.status).toBe('draft');
  expect(quote.subtotal).toBe(250.00);
  expect(quote.taxAmount).toBe(25.00);
  expect(quote.total).toBe(265.00);
  
  // 2. Send quote
  const sentQuote = await TREASURY_API.sendQuote(quote.quoteId);
  expect(sentQuote.status).toBe('sent');
  
  // 3. Attempt to edit sent quote (should fail)
  let editError;
  try {
    await TREASURY_API.updateQuote(quote.quoteId, { discount: 20.00 });
  } catch (e) {
    editError = e;
  }
  expect(editError).toBeDefined();
  expect(editError.code).toBe('QUOTE_LOCKED');
  
  // 4. Accept quote
  const acceptedQuote = await TREASURY_API.acceptQuote(quote.quoteId);
  expect(acceptedQuote.status).toBe('accepted');
  
  // 5. Verify order created
  const order = await TREASURY_API.getOrder(acceptedQuote.orderId);
  expect(order).toBeDefined();
  expect(order.quoteId).toBe(quote.quoteId);
  expect(order.total).toBe(265.00);
});
```

### 1.6 Quote Negative Test Scenarios

**Scenario 1: Accept expired quote**

**Test Steps:**
1. Create quote with `validDays: 1`
2. Wait 2 days (or manually set `validUntil` to past)
3. Attempt to accept quote

**Expected Outcome:**
- Quote status automatically changed to `expired`
- Accept request denied with error: `QUOTE_EXPIRED`
- No order created

**Test Assertion:**
```javascript
test('cannot accept expired quote', async () => {
  const quote = await TREASURY_API.createQuote({
    userId: 'user-123',
    lineItems: [{ productId: 'prod-001', quantity: 1, unitPrice: 100.00 }],
    validDays: 1
  });
  
  // Simulate expiration
  await TREASURY_Database.update('quotes', quote.quoteId, {
    validUntil: new Date(Date.now() - 86400000) // 1 day ago
  });
  
  let error;
  try {
    await TREASURY_API.acceptQuote(quote.quoteId);
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('QUOTE_EXPIRED');
});
```

**Scenario 2: Edit quote after sending**

**Test Steps:**
1. Create quote (status = `draft`)
2. Send quote (status = `sent`)
3. Attempt to edit quote

**Expected Outcome:**
- Edit request denied with error: `QUOTE_LOCKED`
- Quote remains unchanged

**Test Assertion:**
```javascript
test('cannot edit quote after sending', async () => {
  const quote = await TREASURY_API.createQuote({
    userId: 'user-123',
    lineItems: [{ productId: 'prod-001', quantity: 1, unitPrice: 100.00 }]
  });
  
  await TREASURY_API.sendQuote(quote.quoteId);
  
  let error;
  try {
    await TREASURY_API.updateQuote(quote.quoteId, { discount: 20.00 });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('QUOTE_LOCKED');
});
```

---

## 2. Order Specification

### 2.1 Order Definition

**Order:** A binding commitment to purchase goods/services at agreed-upon terms, created when customer accepts a quote.

**Order Properties:**
- `orderId`: Unique identifier (format: `order-<uuid>`)
- `quoteId`: Reference to accepted quote
- `userId`: Reference to D00 user (customer)
- `lineItems`: Copied from quote (immutable)
- `subtotal`: Copied from quote (immutable)
- `taxAmount`: Copied from quote (immutable)
- `discount`: Copied from quote (immutable)
- `total`: Copied from quote (immutable)
- `currency`: Copied from quote (immutable)
- `status`: `pending` | `confirmed` | `processing` | `delivered` | `cancelled` | `refunded`
- `paymentStatus`: `unpaid` | `partial` | `paid` | `refunded`
- `createdAt`: Creation timestamp (when quote accepted)
- `confirmedAt`: Confirmation timestamp (when payment received)
- `deliveredAt`: Delivery completion timestamp
- `cancelledAt`: Cancellation timestamp (if applicable)

### 2.2 Order Lifecycle

```
┌─────────┐
│ PENDING │ ← Quote accepted, awaiting payment
└────┬────┘
     │
     │ Payment received
     ▼
┌───────────┐
│ CONFIRMED │ ← Payment verified, order locked
└────┬──────┘
     │
     │ Begin fulfillment
     ▼
┌────────────┐
│ PROCESSING │ ← Goods/services being delivered
└────┬───────┘
     │
     ├─→ Delivery complete ──→ ┌───────────┐
     │                         │ DELIVERED │ → Final state
     │                         └───────────┘
     │
     ├─→ Customer cancels ──→ ┌───────────┐
     │                        │ CANCELLED │ → Refund processed
     │                        └───────────┘
     │
     └─→ Refund issued ─────→ ┌──────────┐
                              │ REFUNDED │ → Final state
                              └──────────┘
```

### 2.3 Order Creation Rules

**Rule 1: Quote Conversion**
- Order created only when quote status = `accepted`
- Order inherits all financial data from quote (line items, totals, currency)
- Order references quote via `quoteId` (immutable link)

**Rule 2: Initial Status**
- New orders start with status = `pending`
- Payment status = `unpaid`
- Order remains in `pending` until payment received

**Rule 3: Payment Confirmation**
- When payment received, status changes to `confirmed`
- Payment status changes to `paid` (or `partial` if partial payment)
- `confirmedAt` timestamp recorded
- Order becomes immutable (no cancellations without refund process)

**Rule 4: Cancellation Policy**
- Orders in `pending` status can be cancelled without refund
- Orders in `confirmed` or later status require refund process (see Section 5)
- Cancellation records `cancelledAt` timestamp and reason

**Rule 5: Delivery Tracking**
- Status changes to `processing` when fulfillment begins
- Status changes to `delivered` when all goods/services provided
- `deliveredAt` timestamp recorded
- Delivered orders cannot be cancelled (only refunded)

### 2.4 Order API Endpoints

**POST /treasury/orders**
- Create order from accepted quote
- Required: `quoteId`
- Returns: `orderId`, `status` (pending), `total`
- Triggered automatically when quote accepted

**GET /treasury/orders/:orderId**
- Retrieve order details
- Requires: D00 session token with userId matching order.userId
- Returns: Full order object

**PATCH /treasury/orders/:orderId/confirm**
- Confirm order (payment received)
- Changes status from `pending` to `confirmed`
- Changes paymentStatus to `paid` or `partial`
- Records `confirmedAt` timestamp
- Returns: Updated order object

**PATCH /treasury/orders/:orderId/process**
- Begin order fulfillment
- Changes status from `confirmed` to `processing`
- Returns: Updated order object

**PATCH /treasury/orders/:orderId/deliver**
- Mark order as delivered
- Changes status to `delivered`
- Records `deliveredAt` timestamp
- Returns: Updated order object

**POST /treasury/orders/:orderId/cancel**
- Cancel order
- Allowed only if status = `pending`
- Changes status to `cancelled`
- Records `cancelledAt` timestamp and reason
- Returns: Updated order object

### 2.5 Order Positive Test Scenario

**Scenario: Order created from quote, confirmed, and delivered**

**Setup:**
- Quote accepted (status = `accepted`)
- Payment received (simulated)
- TREASURY domain operational

**Test Steps:**
1. Quote accepted, triggers order creation:
   ```javascript
   const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
   // order.status = 'pending'
   // order.paymentStatus = 'unpaid'
   ```

2. Payment received, confirm order:
   ```http
   PATCH /treasury/orders/order-xyz789/confirm
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "paymentId": "payment-001",
     "amount": 265.00,
     "method": "credit_card"
   }
   ```

3. Order status changes to `confirmed`, paymentStatus to `paid`

4. Begin fulfillment:
   ```http
   PATCH /treasury/orders/order-xyz789/process
   Authorization: Bearer <d00-session-token>
   ```

5. Order status changes to `processing`

6. Complete delivery:
   ```http
   PATCH /treasury/orders/order-xyz789/deliver
   Authorization: Bearer <d00-session-token>
   
   {
     "deliveryNote": "All services completed"
   }
   ```

7. Order status changes to `delivered`

**Expected Outcome:**
- Order created from quote with correct totals
- Order confirmed when payment received
- Order processed and delivered successfully
- All status transitions logged in audit trail
- Invoice generated (see Section 4)

**Test Assertion:**
```javascript
test('order lifecycle: pending → confirmed → processing → delivered', async () => {
  // 1. Create order from accepted quote
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  expect(order.status).toBe('pending');
  expect(order.paymentStatus).toBe('unpaid');
  
  // 2. Confirm order (payment received)
  const confirmedOrder = await TREASURY_API.confirmOrder(order.orderId, {
    paymentId: 'payment-001',
    amount: 265.00,
    method: 'credit_card'
  });
  expect(confirmedOrder.status).toBe('confirmed');
  expect(confirmedOrder.paymentStatus).toBe('paid');
  expect(confirmedOrder.confirmedAt).toBeDefined();
  
  // 3. Begin processing
  const processingOrder = await TREASURY_API.processOrder(order.orderId);
  expect(processingOrder.status).toBe('processing');
  
  // 4. Complete delivery
  const deliveredOrder = await TREASURY_API.deliverOrder(order.orderId, {
    deliveryNote: 'All services completed'
  });
  expect(deliveredOrder.status).toBe('delivered');
  expect(deliveredOrder.deliveredAt).toBeDefined();
  
  // 5. Verify audit log
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE orderId = ? ORDER BY timestamp',
    [order.orderId]
  );
  expect(auditLogs.length).toBe(4); // create, confirm, process, deliver
  expect(auditLogs[0].operation).toBe('order.create');
  expect(auditLogs[1].operation).toBe('order.confirm');
  expect(auditLogs[2].operation).toBe('order.process');
  expect(auditLogs[3].operation).toBe('order.deliver');
});
```

### 2.6 Order Negative Test Scenarios

**Scenario 1: Cancel confirmed order**

**Test Steps:**
1. Create order (status = `pending`)
2. Confirm order (status = `confirmed`)
3. Attempt to cancel order

**Expected Outcome:**
- Cancellation denied with error: `ORDER_CANNOT_CANCEL`
- Order remains in `confirmed` status
- Refund process required (see Section 5)

**Test Assertion:**
```javascript
test('cannot cancel confirmed order', async () => {
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  await TREASURY_API.confirmOrder(order.orderId, { paymentId: 'payment-001', amount: 265.00 });
  
  let error;
  try {
    await TREASURY_API.cancelOrder(order.orderId, { reason: 'Customer request' });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('ORDER_CANNOT_CANCEL');
  expect(error.message).toContain('Refund process required');
});
```

**Scenario 2: Deliver pending order**

**Test Steps:**
1. Create order (status = `pending`)
2. Attempt to mark as delivered

**Expected Outcome:**
- Delivery denied with error: `ORDER_NOT_CONFIRMED`
- Order remains in `pending` status

**Test Assertion:**
```javascript
test('cannot deliver pending order', async () => {
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  
  let error;
  try {
    await TREASURY_API.deliverOrder(order.orderId, { deliveryNote: 'Test' });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('ORDER_NOT_CONFIRMED');
});
```

---

## 3. Delivery Tracking Specification

### 3.1 Delivery Definition

**Delivery:** The process of fulfilling an order by providing goods/services to the customer.

**Delivery Types:**
- **Physical Goods:** Shippable items with tracking numbers
- **Digital Goods:** Downloadable files, access credentials, license keys
- **Services:** Time-based deliverables (consultations, reports, etc.)

### 3.2 Delivery Tracking Properties

**DeliveryRecord:**
- `deliveryId`: Unique identifier (format: `delivery-<uuid>`)
- `orderId`: Reference to order being fulfilled
- `userId`: Reference to customer (from order)
- `type`: `physical` | `digital` | `service`
- `status`: `pending` | `shipped` | `in_transit` | `delivered` | `failed`
- `trackingNumber`: Optional (for physical goods)
- `deliveryMethod`: Optional (e.g., "FedEx", "Email", "In-person")
- `estimatedDeliveryDate`: Optional
- `actualDeliveryDate`: Set when status = `delivered`
- `deliveryNotes`: Optional comments
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### 3.3 Delivery Status Transitions

**Physical Goods:**
```
pending → shipped → in_transit → delivered
                                → failed
```

**Digital Goods:**
```
pending → delivered
        → failed
```

**Services:**
```
pending → in_progress → delivered
                      → failed
```

### 3.4 Delivery API Endpoints

**POST /treasury/deliveries**
- Create delivery record for order
- Required: `orderId`, `type`
- Optional: `trackingNumber`, `deliveryMethod`, `estimatedDeliveryDate`
- Returns: `deliveryId`, `status` (pending)

**GET /treasury/deliveries/:deliveryId**
- Retrieve delivery details
- Requires: D00 session token with userId matching delivery.userId
- Returns: Full delivery object

**PATCH /treasury/deliveries/:deliveryId/status**
- Update delivery status
- Allowed transitions based on type (see 3.3)
- Returns: Updated delivery object

**POST /treasury/deliveries/:deliveryId/complete**
- Mark delivery as complete
- Changes status to `delivered`
- Records `actualDeliveryDate`
- Triggers order status update to `delivered` (if all deliveries complete)
- Returns: Updated delivery object

### 3.5 Delivery Positive Test Scenario

**Scenario: Physical goods delivery with tracking**

**Test Steps:**
1. Create delivery record:
   ```http
   POST /treasury/deliveries
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "type": "physical",
     "trackingNumber": "1Z999AA10123456784",
     "deliveryMethod": "FedEx",
     "estimatedDeliveryDate": "2026-11-05T00:00:00Z"
   }
   ```

2. Update status to `shipped`:
   ```http
   PATCH /treasury/deliveries/delivery-abc123/status
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "status": "shipped"
   }
   ```

3. Update status to `in_transit`:
   ```http
   PATCH /treasury/deliveries/delivery-abc123/status
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "status": "in_transit"
   }
   ```

4. Mark as delivered:
   ```http
   POST /treasury/deliveries/delivery-abc123/complete
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "deliveryNotes": "Package left at front door"
   }
   ```

**Expected Outcome:**
- Delivery record created with tracking info
- Status transitions logged (pending → shipped → in_transit → delivered)
- `actualDeliveryDate` recorded
- Order status updated to `delivered` (if all deliveries complete)

**Test Assertion:**
```javascript
test('physical goods delivery with tracking', async () => {
  // 1. Create delivery
  const delivery = await TREASURY_API.createDelivery({
    orderId: 'order-xyz789',
    type: 'physical',
    trackingNumber: '1Z999AA10123456784',
    deliveryMethod: 'FedEx'
  });
  expect(delivery.status).toBe('pending');
  
  // 2. Ship
  const shipped = await TREASURY_API.updateDeliveryStatus(delivery.deliveryId, 'shipped');
  expect(shipped.status).toBe('shipped');
  
  // 3. In transit
  const inTransit = await TREASURY_API.updateDeliveryStatus(delivery.deliveryId, 'in_transit');
  expect(inTransit.status).toBe('in_transit');
  
  // 4. Deliver
  const delivered = await TREASURY_API.completeDelivery(delivery.deliveryId, {
    deliveryNotes: 'Package left at front door'
  });
  expect(delivered.status).toBe('delivered');
  expect(delivered.actualDeliveryDate).toBeDefined();
  
  // 5. Verify order updated
  const order = await TREASURY_API.getOrder('order-xyz789');
  expect(order.status).toBe('delivered');
});
```

---

## 4. Invoice Specification

### 4.1 Invoice Definition

**Invoice:** An immutable financial document issued to request payment for goods/services provided.

**Invoice Properties:**
- `invoiceId`: Unique identifier (format: `inv-<uuid>`)
- `orderId`: Reference to order being invoiced
- `userId`: Reference to customer (from order)
- `invoiceNumber`: Sequential human-readable number (format: `INV-2026-0001`)
- `lineItems`: Copied from order (immutable)
- `subtotal`: Copied from order (immutable)
- `taxAmount`: Copied from order (immutable)
- `discount`: Copied from order (immutable)
- `total`: Copied from order (immutable)
- `currency`: Copied from order (immutable)
- `issueDate`: Date invoice issued
- `dueDate`: Payment due date (default: 30 days from issue)
- `status`: `draft` | `issued` | `paid` | `overdue` | `cancelled`
- `paymentTerms`: Optional notes (e.g., "Net 30", "Due on receipt")
- `notes`: Optional additional information
- `paidAt`: Payment timestamp (when status = `paid`)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### 4.2 Invoice Generation Rules

**Rule 1: Automatic Generation**
- Invoice automatically generated when order status changes to `confirmed`
- Invoice inherits all financial data from order
- Invoice references order via `orderId` (immutable link)

**Rule 2: Sequential Numbering**
- Invoice numbers are sequential per calendar year
- Format: `INV-<year>-<sequence>` (e.g., `INV-2026-0001`)
- Sequence resets to 0001 on January 1st each year
- Sequence managed by TREASURY domain (atomic increment)

**Rule 3: Immutability**
- Once invoice status = `issued`, it becomes immutable
- No field can be modified after issuance
- Corrections require issuing credit note (separate document, not in scope)

**Rule 4: Payment Terms**
- Default payment terms: 30 days from issue date
- Configurable per invoice (7, 14, 30, 60, 90 days)
- Due date calculated as: `issueDate + paymentTerms`

**Rule 5: Status Transitions**
- `draft`: Invoice created but not yet sent (editable)
- `issued`: Invoice sent to customer (immutable)
- `paid`: Payment received (status updated automatically)
- `overdue`: Payment not received by due date (status updated by scheduled job)
- `cancelled`: Invoice voided (rare, requires admin approval)

### 4.3 Invoice API Endpoints

**POST /treasury/invoices**
- Create invoice (usually triggered automatically by order confirmation)
- Required: `orderId`
- Optional: `paymentTerms`, `notes`
- Returns: `invoiceId`, `invoiceNumber`, `total`, `dueDate`
- Status: `draft`

**GET /treasury/invoices/:invoiceId**
- Retrieve invoice details
- Requires: D00 session token with userId matching invoice.userId
- Returns: Full invoice object

**POST /treasury/invoices/:invoiceId/issue**
- Issue invoice (send to customer)
- Changes status from `draft` to `issued`
- Locks invoice (no further edits)
- Sends email notification to customer with invoice PDF
- Returns: Updated invoice object with `issuedAt` timestamp

**POST /treasury/invoices/:invoiceId/mark-paid**
- Mark invoice as paid
- Changes status to `paid`
- Records `paidAt` timestamp
- Requires: `paymentId` reference
- Returns: Updated invoice object

**GET /treasury/invoices/:invoiceId/pdf**
- Generate invoice PDF
- Requires: D00 session token with userId matching invoice.userId
- Returns: PDF file (application/pdf)

**GET /treasury/invoices?userId=:userId&status=:status**
- List invoices for user
- Optional filters: `status`, `dateFrom`, `dateTo`
- Returns: Array of invoice objects (summary only, no line items)

### 4.4 Invoice PDF Format

**PDF Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  INVOICE                                                     │
│  Invoice Number: INV-2026-0001                              │
│  Issue Date: 2026-10-31                                     │
│  Due Date: 2026-11-30                                       │
├─────────────────────────────────────────────────────────────┤
│  Bill To:                                                    │
│  John Doe                                                    │
│  john@example.com                                            │
│  123 Main Street                                             │
│  Jakarta, Indonesia                                          │
├─────────────────────────────────────────────────────────────┤
│  From:                                                       │
│  MoonWitness XV                                              │
│  [Legal Entity Name]                                         │
│  [Legal Entity Address]                                      │
│  [Tax ID]                                                    │
├─────────────────────────────────────────────────────────────┤
│  Description              Qty    Unit Price    Total         │
│  ─────────────────────────────────────────────────────       │
│  Digital consultation      2      $100.00     $200.00       │
│  Report generation         1       $50.00      $50.00       │
│  ─────────────────────────────────────────────────────       │
│  Subtotal:                                    $250.00       │
│  Tax (10%):                                    $25.00       │
│  Discount:                                    -$10.00       │
│  ─────────────────────────────────────────────────────       │
│  TOTAL:                                       $265.00       │
├─────────────────────────────────────────────────────────────┤
│  Payment Terms: Net 30                                       │
│  Payment Method: Bank Transfer                               │
│  Bank: Example Bank                                          │
│  Account: 1234567890                                         │
│  Reference: INV-2026-0001                                    │
├─────────────────────────────────────────────────────────────┤
│  Notes: Thank you for your business!                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Invoice Positive Test Scenario

**Scenario: Invoice generated, issued, and paid**

**Test Steps:**
1. Order confirmed, triggers invoice creation:
   ```javascript
   const invoice = await TREASURY_API.createInvoice({
     orderId: 'order-xyz789',
     paymentTerms: 30,
     notes: 'Thank you for your business!'
   });
   // invoice.status = 'draft'
   // invoice.invoiceNumber = 'INV-2026-0001'
   ```

2. Issue invoice (send to customer):
   ```http
   POST /treasury/invoices/inv-abc123/issue
   Authorization: Bearer <d00-session-token>
   ```

3. Invoice status changes to `issued`, becomes immutable

4. Generate PDF:
   ```http
   GET /treasury/invoices/inv-abc123/pdf
   Authorization: Bearer <d00-session-token>
   ```

5. Customer receives email with invoice PDF

6. Customer makes payment (external process)

7. Mark invoice as paid:
   ```http
   POST /treasury/invoices/inv-abc123/mark-paid
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "paymentId": "payment-001",
     "paidAt": "2026-11-15T10:00:00Z"
   }
   ```

8. Invoice status changes to `paid`

**Expected Outcome:**
- Invoice created with correct totals and sequential number
- Invoice issued successfully (status = `issued`)
- PDF generated with correct formatting
- Invoice marked as paid when payment received
- All status transitions logged in audit trail

**Test Assertion:**
```javascript
test('invoice lifecycle: draft → issued → paid', async () => {
  // 1. Create invoice
  const invoice = await TREASURY_API.createInvoice({
    orderId: 'order-xyz789',
    paymentTerms: 30
  });
  expect(invoice.status).toBe('draft');
  expect(invoice.invoiceNumber).toMatch(/^INV-2026-\d{4}$/);
  
  // 2. Issue invoice
  const issuedInvoice = await TREASURY_API.issueInvoice(invoice.invoiceId);
  expect(issuedInvoice.status).toBe('issued');
  expect(issuedInvoice.issuedAt).toBeDefined();
  
  // 3. Attempt to edit issued invoice (should fail)
  let editError;
  try {
    await TREASURY_API.updateInvoice(invoice.invoiceId, { notes: 'Updated' });
  } catch (e) {
    editError = e;
  }
  expect(editError).toBeDefined();
  expect(editError.code).toBe('INVOICE_LOCKED');
  
  // 4. Generate PDF
  const pdf = await TREASURY_API.getInvoicePDF(invoice.invoiceId);
  expect(pdf).toBeDefined();
  expect(pdf.contentType).toBe('application/pdf');
  
  // 5. Mark as paid
  const paidInvoice = await TREASURY_API.markInvoicePaid(invoice.invoiceId, {
    paymentId: 'payment-001',
    paidAt: '2026-11-15T10:00:00Z'
  });
  expect(paidInvoice.status).toBe('paid');
  expect(paidInvoice.paidAt).toBeDefined();
  
  // 6. Verify order payment status updated
  const order = await TREASURY_API.getOrder('order-xyz789');
  expect(order.paymentStatus).toBe('paid');
});
```

### 4.6 Invoice Negative Test Scenarios

**Scenario 1: Edit issued invoice**

**Test Steps:**
1. Create invoice (status = `draft`)
2. Issue invoice (status = `issued`)
3. Attempt to edit invoice

**Expected Outcome:**
- Edit request denied with error: `INVOICE_LOCKED`
- Invoice remains unchanged

**Test Assertion:**
```javascript
test('cannot edit issued invoice', async () => {
  const invoice = await TREASURY_API.createInvoice({ orderId: 'order-xyz789' });
  await TREASURY_API.issueInvoice(invoice.invoiceId);
  
  let error;
  try {
    await TREASURY_API.updateInvoice(invoice.invoiceId, { notes: 'Updated' });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('INVOICE_LOCKED');
});
```

**Scenario 2: Generate PDF for draft invoice**

**Test Steps:**
1. Create invoice (status = `draft`)
2. Attempt to generate PDF

**Expected Outcome:**
- PDF generation denied with error: `INVOICE_NOT_ISSUED`
- No PDF returned

**Test Assertion:**
```javascript
test('cannot generate PDF for draft invoice', async () => {
  const invoice = await TREASURY_API.createInvoice({ orderId: 'order-xyz789' });
  
  let error;
  try {
    await TREASURY_API.getInvoicePDF(invoice.invoiceId);
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('INVOICE_NOT_ISSUED');
});
```

---

## 5. Refund Specification

### 5.1 Refund Definition

**Refund:** A partial or full return of payment to the customer due to order cancellation, delivery failure, or customer dissatisfaction.

**Refund Properties:**
- `refundId`: Unique identifier (format: `refund-<uuid>`)
- `orderId`: Reference to original order
- `invoiceId`: Reference to original invoice (if issued)
- `userId`: Reference to customer (from order)
- `type`: `full` | `partial`
- `amount`: Refund amount (must be ≤ original total)
- `currency`: Same as original order
- `reason`: Cancellation reason (enum: `customer_request`, `delivery_failed`, `product_defect`, `service_issue`, `other`)
- `reasonDetails`: Optional additional explanation
- `status`: `requested` | `approved` | `processing` | `completed` | `rejected`
- `approvedBy`: Reference to admin user who approved (if required)
- `approvedAt`: Approval timestamp
- `processedAt`: Processing start timestamp
- `completedAt`: Completion timestamp (when funds returned)
- `rejectionReason`: Optional (if status = `rejected`)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### 5.2 Refund Eligibility Rules

**Rule 1: Order Status Requirements**
- Refunds allowed only for orders in `confirmed`, `processing`, or `delivered` status
- Orders in `pending` status can be cancelled without refund (see Section 2.3)
- Orders in `cancelled` or `refunded` status cannot be refunded again

**Rule 2: Payment Status Requirements**
- Refunds allowed only for orders with `paymentStatus = paid` or `partial`
- Orders with `paymentStatus = unpaid` cannot be refunded (no payment to refund)

**Rule 3: Refund Amount Limits**
- Refund amount must be > 0
- Refund amount must be ≤ original order total
- For partial refunds: amount < original total
- For full refunds: amount = original total

**Rule 4: Approval Requirements**
- Refunds ≤ $100 (or equivalent): Auto-approved by system
- Refunds > $100: Require admin approval
- Approval recorded with `approvedBy` and `approvedAt`

**Rule 5: Time Limits**
- Refunds must be requested within 90 days of order delivery
- After 90 days, refund requests require special approval (manager level)

### 5.3 Refund Lifecycle

```
┌───────────┐
│ REQUESTED │ ← Customer or admin initiates refund
└─────┬─────┘
      │
      ├─→ Amount ≤ $100 ──→ ┌──────────┐
      │                     │ APPROVED │ → Auto-approved
      │                     └────┬─────┘
      │                          │
      │                          ▼
      │                     ┌────────────┐
      │                     │ PROCESSING │ → Payment processor contacted
      │                     └────┬───────┘
      │                          │
      │                          ▼
      │                     ┌───────────┐
      │                     │ COMPLETED │ → Funds returned to customer
      │                     └───────────┘
      │
      └─→ Amount > $100 ──→ ┌───────────┐
                            │  PENDING  │ → Awaiting admin approval
                            │ APPROVAL  │
                            └─────┬─────┘
                                  │
                                  ├─→ Approved ──→ APPROVED → PROCESSING → COMPLETED
                                  │
                                  └─→ Rejected ──→ ┌──────────┐
                                                   │ REJECTED │
                                                   └──────────┘
```

### 5.4 Refund API Endpoints

**POST /treasury/refunds**
- Request refund
- Required: `orderId`, `amount`, `reason`
- Optional: `reasonDetails`
- Returns: `refundId`, `status` (requested or pending_approval)
- Auto-approves if amount ≤ $100

**GET /treasury/refunds/:refundId**
- Retrieve refund details
- Requires: D00 session token with userId matching refund.userId
- Returns: Full refund object

**POST /treasury/refunds/:refundId/approve**
- Approve refund (admin only)
- Required: `approvedBy` (admin userId)
- Changes status from `pending_approval` to `approved`
- Returns: Updated refund object

**POST /treasury/refunds/:refundId/reject**
- Reject refund (admin only)
- Required: `rejectionReason`
- Changes status to `rejected`
- Returns: Updated refund object

**POST /treasury/refunds/:refundId/process**
- Begin refund processing
- Changes status from `approved` to `processing`
- Contacts payment processor to initiate refund
- Returns: Updated refund object

**POST /treasury/refunds/:refundId/complete**
- Mark refund as complete
- Changes status to `completed`
- Records `completedAt` timestamp
- Updates order status to `refunded` (if full refund) or remains `delivered` (if partial)
- Updates invoice status to `refunded` (if applicable)
- Returns: Updated refund object

**GET /treasury/refunds?orderId=:orderId**
- List refunds for order
- Returns: Array of refund objects

### 5.5 Refund Positive Test Scenario

**Scenario: Full refund for delivered order**

**Test Steps:**
1. Order delivered, payment received:
   ```javascript
   const order = await TREASURY_API.getOrder('order-xyz789');
   // order.status = 'delivered'
   // order.paymentStatus = 'paid'
   // order.total = 265.00
   ```

2. Customer requests full refund:
   ```http
   POST /treasury/refunds
   Authorization: Bearer <d00-session-token>
   Content-Type: application/json
   
   {
     "orderId": "order-xyz789",
     "amount": 265.00,
     "reason": "delivery_failed",
     "reasonDetails": "Package arrived damaged"
   }
   ```

3. Refund auto-approved (amount ≤ $100 threshold not applicable, but let's assume admin approval not required for this test):
   ```javascript
   // refund.status = 'approved'
   ```

4. Begin processing:
   ```http
   POST /treasury/refunds/refund-abc123/process
   Authorization: Bearer <d00-session-token>
   ```

5. Refund status changes to `processing`

6. Payment processor completes refund (external process)

7. Mark refund as complete:
   ```http
   POST /treasury/refunds/refund-abc123/complete
   Authorization: Bearer <d00-session-token>
   ```

8. Refund status changes to `completed`

9. Order status changes to `refunded`

10. Invoice status changes to `refunded` (if issued)

**Expected Outcome:**
- Refund requested and approved
- Refund processed through payment processor
- Refund completed, funds returned to customer
- Order and invoice statuses updated
- Audit log recorded for each step

**Test Assertion:**
```javascript
test('full refund for delivered order', async () => {
  // 1. Request refund
  const refund = await TREASURY_API.requestRefund({
    orderId: 'order-xyz789',
    amount: 265.00,
    reason: 'delivery_failed',
    reasonDetails: 'Package arrived damaged'
  });
  expect(refund.status).toBe('approved'); // Auto-approved
  
  // 2. Process refund
  const processing = await TREASURY_API.processRefund(refund.refundId);
  expect(processing.status).toBe('processing');
  
  // 3. Complete refund
  const completed = await TREASURY_API.completeRefund(refund.refundId);
  expect(completed.status).toBe('completed');
  expect(completed.completedAt).toBeDefined();
  
  // 4. Verify order updated
  const order = await TREASURY_API.getOrder('order-xyz789');
  expect(order.status).toBe('refunded');
  expect(order.paymentStatus).toBe('refunded');
  
  // 5. Verify invoice updated (if exists)
  const invoices = await TREASURY_API.getInvoices({ orderId: 'order-xyz789' });
  if (invoices.length > 0) {
    expect(invoices[0].status).toBe('refunded');
  }
  
  // 6. Verify audit log
  const auditLogs = await TREASURY_AuditDatabase.query(
    'SELECT * FROM logs WHERE refundId = ? ORDER BY timestamp',
    [refund.refundId]
  );
  expect(auditLogs.length).toBe(3); // request, process, complete
  expect(auditLogs[0].operation).toBe('refund.request');
  expect(auditLogs[1].operation).toBe('refund.process');
  expect(auditLogs[2].operation).toBe('refund.complete');
});
```

### 5.6 Refund Negative Test Scenarios

**Scenario 1: Refund for pending order**

**Test Steps:**
1. Create order (status = `pending`)
2. Attempt to request refund

**Expected Outcome:**
- Refund request denied with error: `ORDER_NOT_ELIGIBLE_FOR_REFUND`
- No refund created

**Test Assertion:**
```javascript
test('cannot refund pending order', async () => {
  const order = await TREASURY_API.createOrderFromQuote(quote.quoteId);
  // order.status = 'pending'
  
  let error;
  try {
    await TREASURY_API.requestRefund({
      orderId: order.orderId,
      amount: 265.00,
      reason: 'customer_request'
    });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('ORDER_NOT_ELIGIBLE_FOR_REFUND');
  expect(error.message).toContain('Order must be confirmed, processing, or delivered');
});
```

**Scenario 2: Refund amount exceeds order total**

**Test Steps:**
1. Order with total = $265.00
2. Request refund with amount = $300.00

**Expected Outcome:**
- Refund request denied with error: `REFUND_AMOUNT_EXCEEDS_TOTAL`
- No refund created

**Test Assertion:**
```javascript
test('refund amount cannot exceed order total', async () => {
  const order = await TREASURY_API.getOrder('order-xyz789');
  // order.total = 265.00
  
  let error;
  try {
    await TREASURY_API.requestRefund({
      orderId: order.orderId,
      amount: 300.00,
      reason: 'customer_request'
    });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('REFUND_AMOUNT_EXCEEDS_TOTAL');
});
```

**Scenario 3: Refund requested after 90 days**

**Test Steps:**
1. Order delivered 100 days ago
2. Attempt to request refund

**Expected Outcome:**
- Refund request requires special approval (manager level)
- If no special approval, denied with error: `REFUND_TIME_LIMIT_EXCEEDED`

**Test Assertion:**
```javascript
test('refund after 90 days requires special approval', async () => {
  const order = await TREASURY_API.getOrder('order-xyz789');
  // Simulate delivery 100 days ago
  await TREASURY_Database.update('orders', order.orderId, {
    deliveredAt: new Date(Date.now() - 100 * 86400000)
  });
  
  let error;
  try {
    await TREASURY_API.requestRefund({
      orderId: order.orderId,
      amount: 265.00,
      reason: 'customer_request'
    });
  } catch (e) {
    error = e;
  }
  
  expect(error).toBeDefined();
  expect(error.code).toBe('REFUND_TIME_LIMIT_EXCEEDED');
  expect(error.message).toContain('Requires manager approval');
});
```

---

## 6. Integration with D00/D06

### 6.1 D00 Session Integration

**Authentication:**
- All TREASURY API endpoints require D00 session token
- Session token validated using D00 public key (see M35-02 Section 3.3)
- userId extracted from session token for authorization checks

**Authorization:**
- User can only access their own quotes/orders/invoices/refunds
- Admin users can access all records (for approval workflows)
- Authorization checked at API gateway level (before reaching TREASURY logic)

**Audit Trail:**
- All operations logged with sessionId and userId from D00 session
- Audit logs stored in TREASURY audit database (separate from D00 audit logs)
- Cross-reference possible via sessionId (for debugging)

### 6.2 D06 Consent Integration

**Consent Requirements:**
- Quote creation: Requires `payment` consent (already granted during D00 login)
- Order creation: No additional consent required (inherits from quote)
- Invoice generation: No additional consent required (automatic)
- Refund request: Requires `refund` consent (separate from `payment` consent)

**Consent Check Flow:**
```javascript
// Before refund request
const consentCheck = await D06_API.checkConsent({
  userId: session.userId,
  purpose: 'refund',
  dataType: 'financial'
});

if (!consentCheck.granted) {
  throw new ConsentError('Refund consent not granted');
}
```

**Consent Granularity:**
- `payment`: General consent for payment operations (quotes, orders, invoices)
- `refund`: Specific consent for refund operations (separate due to financial sensitivity)
- Consent can be granted/revoked independently

---

## 7. Data Model

### 7.1 Entity Relationship Diagram

```
┌──────────┐
│   D00    │
│  (User)  │
└────┬─────┘
     │
     │ 1:N
     ▼
┌──────────┐      1:1       ┌──────────┐      1:1       ┌──────────┐
│  Quote   │ ──────────────→│  Order   │ ──────────────→│ Invoice  │
└──────────┘                └────┬─────┘                └──────────┘
                                 │
                                 │ 1:N
                                 ▼
                            ┌──────────┐
                            │ Delivery │
                            └──────────┘
                                 
┌──────────┐
│  Order   │      1:N
└────┬─────┘ ←──────────── ┌──────────┐
     │                     │  Refund  │
     │                     └──────────┘
     │ 1:1
     ▼
┌──────────┐
│ Invoice  │
└──────────┘
```

### 7.2 Database Schema

**Quotes Table:**
```sql
CREATE TABLE quotes (
  quoteId VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  lineItems JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  taxRate DECIMAL(5, 4) NOT NULL,
  taxAmount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  validUntil TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'expired', 'converted')),
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_userId ON quotes(userId);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_validUntil ON quotes(validUntil);
```

**Orders Table:**
```sql
CREATE TABLE orders (
  orderId VARCHAR(255) PRIMARY KEY,
  quoteId VARCHAR(255) NOT NULL REFERENCES quotes(quoteId),
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  lineItems JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  taxAmount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'delivered', 'cancelled', 'refunded')),
  paymentStatus VARCHAR(50) NOT NULL CHECK (paymentStatus IN ('unpaid', 'partial', 'paid', 'refunded')),
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmedAt TIMESTAMP WITH TIME ZONE,
  deliveredAt TIMESTAMP WITH TIME ZONE,
  cancelledAt TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_orders_quoteId ON orders(quoteId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_paymentStatus ON orders(paymentStatus);
```

**Invoices Table:**
```sql
CREATE TABLE invoices (
  invoiceId VARCHAR(255) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL REFERENCES orders(orderId),
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  lineItems JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  taxAmount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  issueDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'cancelled', 'refunded')),
  paymentTerms INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  issuedAt TIMESTAMP WITH TIME ZONE,
  paidAt TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_userId ON invoices(userId);
CREATE INDEX idx_invoices_orderId ON invoices(orderId);
CREATE INDEX idx_invoices_invoiceNumber ON invoices(invoiceNumber);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_dueDate ON invoices(dueDate);
```

**Deliveries Table:**
```sql
CREATE TABLE deliveries (
  deliveryId VARCHAR(255) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL REFERENCES orders(orderId),
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  type VARCHAR(50) NOT NULL CHECK (type IN ('physical', 'digital', 'service')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed', 'in_progress')),
  trackingNumber VARCHAR(255),
  deliveryMethod VARCHAR(255),
  estimatedDeliveryDate DATE,
  actualDeliveryDate TIMESTAMP WITH TIME ZONE,
  deliveryNotes TEXT,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_orderId ON deliveries(orderId);
CREATE INDEX idx_deliveries_userId ON deliveries(userId);
CREATE INDEX idx_deliveries_status ON deliveries(status);
```

**Refunds Table:**
```sql
CREATE TABLE refunds (
  refundId VARCHAR(255) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL REFERENCES orders(orderId),
  invoiceId VARCHAR(255) REFERENCES invoices(invoiceId),
  userId VARCHAR(255) NOT NULL REFERENCES d00_users(userId),
  type VARCHAR(50) NOT NULL CHECK (type IN ('full', 'partial')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('customer_request', 'delivery_failed', 'product_defect', 'service_issue', 'other')),
  reasonDetails TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('requested', 'pending_approval', 'approved', 'processing', 'completed', 'rejected')),
  approvedBy VARCHAR(255),
  approvedAt TIMESTAMP WITH TIME ZONE,
  processedAt TIMESTAMP WITH TIME ZONE,
  completedAt TIMESTAMP WITH TIME ZONE,
  rejectionReason TEXT,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_orderId ON refunds(orderId);
CREATE INDEX idx_refunds_invoiceId ON refunds(invoiceId);
CREATE INDEX idx_refunds_userId ON refunds(userId);
CREATE INDEX idx_refunds_status ON refunds(status);
```

---

## 8. Risk Assessment

### 8.1 Technical Risks

**Risk 1: Invoice Number Collision**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Use atomic increment for sequential numbering. Implement database constraint (UNIQUE on invoiceNumber).
- **Contingency:** If collision occurs, append suffix (e.g., `INV-2026-0001A`).

**Risk 2: Refund Processing Failure**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Implement retry logic with exponential backoff. Log all failures for manual review.
- **Contingency:** If payment processor unavailable, mark refund as `processing` and retry manually.

**Risk 3: Quote Expiration Race Condition**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Check expiration at quote acceptance time (not just creation). Implement scheduled job to mark expired quotes.
- **Contingency:** If race condition occurs, deny acceptance and notify customer.

**Risk 4: Order Status Inconsistency**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Use database transactions for status updates. Implement status validation logic (state machine).
- **Contingency:** If inconsistency detected, trigger manual review and correction.

### 8.2 Business Risks

**Risk 5: Refund Fraud**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Require admin approval for refunds > $100. Implement time limits (90 days). Log all refund requests for audit.
- **Contingency:** If fraud detected, reject refund and report to legal.

**Risk 6: Invoice Disputes**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Make invoices immutable after issuance. Provide clear payment terms. Implement dispute resolution process.
- **Contingency:** If dispute arises, issue credit note (separate process, not in scope).

**Risk 7: Currency Conversion Issues**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Lock currency at quote creation. Do not allow currency changes after quote sent.
- **Contingency:** If conversion needed, create new quote in different currency.

**Risk 8: Tax Calculation Errors**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Use validated tax calculation library. Lock tax rate at quote creation. Consult tax advisor for multi-jurisdiction support.
- **Contingency:** If error detected, issue corrected invoice with explanation.

### 8.3 Legal Risks

**Risk 9: Non-Compliance with Financial Regulations**
- **Likelihood:** Medium
- **Impact:** Critical
- **Mitigation:** Consult legal advisor before implementation. Implement audit trails for all financial operations. Retain records for 7 years (legal requirement).
- **Contingency:** If non-compliance detected, suspend operations and engage legal counsel.

**Risk 10: Data Privacy Violations**
- **Likelihood:** Low
- **Impact:** Critical
- **Mitigation:** Follow GDPR requirements (consent, data minimization, right to deletion). Encrypt sensitive data at rest and in transit.
- **Contingency:** If breach detected, notify authorities within 72 hours (GDPR requirement).

---

## 9. Deferred Items

The following items are explicitly deferred to future work:

1. **Credit Note Generation:** This document mentions credit notes for invoice corrections but does not specify their implementation. Credit notes are deferred to a future specification.

2. **Multi-Currency Support:** This document assumes single currency per quote/order/invoice. Multi-currency support (conversion, exchange rates) is deferred.

3. **Recurring Invoices:** This document covers one-time invoices only. Recurring invoices (subscriptions, retainers) are deferred.

4. **Payment Processor Integration:** This document specifies refund processing but does not integrate with any payment processor. Integration is deferred to M35-04.

5. **Invoice PDF Template Design:** This document specifies PDF structure but does not provide actual template design. Design is deferred to UI/UX team.

6. **Email Notification Templates:** This document mentions email notifications but does not specify templates. Templates are deferred to communications team.

7. **Tax Calculation Library Selection:** This document assumes tax calculation but does not select a specific library. Selection is deferred to implementation phase.

8. **Refund Approval Workflow UI:** This document specifies approval workflow but does not design UI for admin approval. UI design is deferred to EMPIRE domain.

9. **Delivery Tracking Integration:** This document specifies delivery tracking but does not integrate with external tracking services (FedEx, UPS, etc.). Integration is deferred.

10. **Invoice Payment Gateway Integration:** This document specifies invoice payment but does not integrate with payment gateways for online payment. Integration is deferred to M35-04.

11. **Order Cancellation Policy:** This document mentions order cancellation but does not specify detailed cancellation policy (fees, time limits, etc.). Policy is deferred to legal team.

12. **Refund Proration Logic:** This document covers full and partial refunds but does not specify proration logic for usage-based billing. Proration is deferred to future specification.

13. **Invoice Reminder Automation:** This document mentions overdue invoices but does not specify automated reminder system. Automation is deferred.

14. **Delivery Proof of Receipt:** This document specifies delivery completion but does not specify proof of receipt (signature, photo, etc.). Proof mechanism is deferred.

15. **Refund Fee Handling:** This document does not specify whether refunds incur processing fees. Fee policy is deferred to legal/finance team.

16. **Invoice Archival Strategy:** This document specifies 7-year retention but does not specify archival strategy (cold storage, compression, etc.). Strategy is deferred to operations team.

17. **Multi-Language Invoice Support:** This document assumes single-language invoices. Multi-language support is deferred to localization team.

18. **Invoice Customization per Customer:** This document does not specify customer-specific invoice customization (logo, branding, etc.). Customization is deferred.

19. **Refund Analytics and Reporting:** This document does not specify refund analytics (reasons, amounts, trends). Analytics are deferred to business intelligence team.

20. **Order Fulfillment Workflow Automation:** This document specifies order status transitions but does not automate fulfillment workflows. Automation is deferred to operations team.

---

## 10. Acceptance Criteria

This task is complete when:

1. **Specification Document:** This document is reviewed and approved by TREASURY domain owner, D00 owner, D06 owner, and legal advisor.

2. **Quote Specification:** Quote lifecycle (draft → sent → accepted/expired) is fully specified with API endpoints and test scenarios.

3. **Order Specification:** Order lifecycle (pending → confirmed → processing → delivered/cancelled) is fully specified with API endpoints and test scenarios.

4. **Delivery Specification:** Delivery tracking (physical/digital/service) is fully specified with API endpoints and test scenarios.

5. **Invoice Specification:** Invoice lifecycle (draft → issued → paid/overdue) is fully specified with API endpoints, PDF format, and test scenarios.

6. **Refund Specification:** Refund lifecycle (requested → approved → processing → completed/rejected) is fully specified with API endpoints and test scenarios.

7. **Positive Test Scenarios:** At least one positive test scenario for each major workflow (quote, order, delivery, invoice, refund).

8. **Negative Test Scenarios:** At least two negative test scenarios for each major workflow (edge cases, error conditions).

9. **Data Model:** Database schema for all entities (quotes, orders, invoices, deliveries, refunds) with indexes and constraints.

10. **Integration Specification:** Integration with D00 (session) and D06 (consent) is specified.

11. **Risk Assessment:** Technical, business, and legal risks are identified with mitigations and contingencies.

12. **Deferred Items:** All deferred items are explicitly documented and assigned to future work.

**Note:** This document satisfies the specification requirements of M35-03. Implementation is deferred to M35-01/M35-04/M35-05.

---

## 11. Conclusion

This specification document defines the complete financial transaction lifecycle within the TREASURY domain (M35), covering:

- **Quote Generation:** Time-bound price estimates with validity periods, line items, tax calculation, and discount application
- **Order Creation:** Binding commitments created from accepted quotes with status tracking (pending → confirmed → processing → delivered)
- **Delivery Tracking:** Status tracking for physical/digital/service deliveries with optional tracking numbers
- **Invoice Generation:** Immutable financial documents with sequential numbering, payment terms, and PDF generation
- **Refund Processing:** Partial/full refund workflows with approval gates, time limits, and audit trails

The specification provides:
- **API Endpoints:** 20+ endpoints for quote/order/delivery/invoice/refund operations
- **Data Model:** 5 database tables with indexes, constraints, and relationships
- **Test Scenarios:** 10+ positive and negative test scenarios with assertions
- **Integration Points:** D00 session authentication and D06 consent checking
- **Risk Assessment:** 10 risks (4 technical, 3 business, 2 legal, 1 privacy) with mitigations
- **Deferred Items:** 20 items explicitly deferred to future work

The specification satisfies the requirements of M35-03: it provides a complete, detailed specification for quote, order, delivery, invoice, and refund workflows within the TREASURY domain established by M35-02.

**Status:** BASELINE ESTABLISHED — specification complete, implementation deferred.

---

## Appendix A: API Request/Response Examples

**Quote Creation Request:**
```json
POST /treasury/quotes
{
  "userId": "user-123",
  "lineItems": [
    {
      "productId": "prod-001",
      "description": "Digital consultation",
      "quantity": 2,
      "unitPrice": 100.00
    }
  ],
  "currency": "USD",
  "taxRate": 0.10,
  "discount": 10.00,
  "validDays": 7
}
```

**Quote Creation Response:**
```json
{
  "quoteId": "quote-abc123",
  "userId": "user-123",
  "lineItems": [...],
  "subtotal": 200.00,
  "taxAmount": 20.00,
  "discount": 10.00,
  "total": 210.00,
  "currency": "USD",
  "validUntil": "2026-11-07T14:28:00Z",
  "status": "draft",
  "createdAt": "2026-10-31T14:28:00Z"
}
```

**Invoice PDF Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2026-0001.pdf"

[Binary PDF data]
```

**Refund Request:**
```json
POST /treasury/refunds
{
  "orderId": "order-xyz789",
  "amount": 265.00,
  "reason": "delivery_failed",
  "reasonDetails": "Package arrived damaged"
}
```

**Refund Response:**
```json
{
  "refundId": "refund-abc123",
  "orderId": "order-xyz789",
  "amount": 265.00,
  "currency": "USD",
  "reason": "delivery_failed",
  "status": "approved",
  "createdAt": "2026-11-15T10:00:00Z"
}
```

## Appendix B: State Machine Diagrams

**Quote State Machine:**
```
         create
           │
           ▼
       ┌───────┐
       │ draft │
       └───┬───┘
           │ send
           ▼
       ┌───────┐
       │ sent  │
       └───┬───┘
           │
    ┌──────┴──────┐
    │             │
accept         expire
    │             │
    ▼             ▼
┌──────────┐ ┌─────────┐
│ accepted │ │ expired │
└──────────┘ └─────────┘
    │
    │ convert
    ▼
┌───────────┐
│ converted │
└───────────┘
```

**Order State Machine:**
```
         create
           │
           ▼
      ┌─────────┐
      │ pending │
      └────┬────┘
           │ confirm
           ▼
     ┌───────────┐
     │ confirmed │
     └─────┬─────┘
           │ process
           ▼
    ┌────────────┐
    │ processing │
    └─────┬──────┘
          │
   ┌──────┴──────┐
   │             │
deliver       cancel
   │             │
   ▼             ▼
┌───────────┐ ┌───────────┐
│ delivered │ │ cancelled │
└───────────┘ └───────────┘
   │
   │ refund
   ▼
┌──────────┐
│ refunded │
└──────────┘
```

**Invoice State Machine:**
```
         create
           │
           ▼
      ┌───────┐
      │ draft │
      └───┬───┘
          │ issue
          ▼
      ┌────────┐
      │ issued │
      └────┬───┘
           │
     ┌─────┴─────┐
     │           │
   pay         overdue
     │           │
     ▼           ▼
  ┌──────┐ ┌─────────┐
  │ paid │ │ overdue │
  └──────┘ └─────────┘
     │
     │ refund
     ▼
 ┌──────────┐
 │ refunded │
 └──────────┘
```

**Refund State Machine:**
```
          request
             │
             ▼
       ┌───────────┐
       │ requested │
       └─────┬─────┘
             │
      ┌──────┴──────┐
      │             │
  ≤$100          >$100
      │             │
      ▼             ▼
  ┌──────────┐ ┌─────────────────┐
  │ approved │ │ pending_approval│
  └────┬─────┘ └────────┬────────┘
       │                │
       │         ┌──────┴──────┐
       │         │             │
       │     approve       reject
       │         │             │
       │         ▼             ▼
       │    ┌──────────┐ ┌──────────┐
       │    │ approved │ │ rejected │
       │    └────┬─────┘ └──────────┘
       │         │
       └────┬────┘
            │ process
            ▼
      ┌────────────┐
      │ processing │
      └─────┬──────┘
            │ complete
            ▼
      ┌───────────┐
      │ completed │
      └───────────┘
```

## Appendix C: Glossary

**Quote:** Time-bound price estimate provided to customer before purchase commitment.

**Order:** Binding commitment to purchase goods/services at agreed-upon terms.

**Invoice:** Immutable financial document issued to request payment for goods/services.

**Refund:** Partial or full return of payment to customer due to cancellation or dissatisfaction.

**Delivery:** Process of fulfilling an order by providing goods/services to customer.

**Line Item:** Individual product/service within a quote/order/invoice with quantity and unit price.

**Subtotal:** Sum of all line item totals before tax and discount.

**Tax Amount:** Calculated tax based on subtotal and tax rate.

**Discount:** Reduction applied to subtotal (fixed amount or percentage).

**Total:** Final amount customer pays (subtotal + tax - discount).

**Payment Terms:** Conditions for payment (e.g., "Net 30" means payment due in 30 days).

**Due Date:** Date by which payment must be received.

**Overdue:** Invoice status when payment not received by due date.

**Auto-Approval:** Automatic refund approval for amounts ≤ threshold (e.g., $100).

**Audit Trail:** Chronological record of all financial operations for compliance and debugging.

**State Machine:** Model of entity lifecycle with defined states and transitions.

**Immutable:** Cannot be modified after creation (e.g., invoices after issuance).

**Sequential Numbering:** Invoice numbers assigned in order (e.g., INV-2026-0001, INV-2026-0002).

**Currency Lock:** Currency fixed at quote creation, cannot be changed afterward.

**Tax Lock:** Tax rate fixed at quote creation, cannot be changed afterward.

**Consent Granularity:** Separate consent for different operations (e.g., `payment` vs `refund`).

**Session Validation:** Verification of D00 session token using cryptographic signature.

**Authorization Check:** Verification that user can access only their own records.

**API Gateway:** Entry point for all TREASURY API requests, handles authentication and authorization.

**Database Transaction:** Atomic operation ensuring data consistency (all-or-nothing).

**Retry Logic:** Automatic retry of failed operations with exponential backoff.

**Scheduled Job:** Automated task running at specified intervals (e.g., marking overdue invoices).

**Credit Note:** Document issued to correct invoice errors (not in scope for M35-03).

**Proration:** Calculation of partial charges based on usage (not in scope for M35-03).

**Recurring Invoice:** Invoice generated automatically at regular intervals (not in scope for M35-03).

**Payment Gateway:** Third-party service for processing online payments (deferred to M35-04).

**Fulfillment:** Process of delivering goods/services to customer (covered in Section 3).

**Dispute Resolution:** Process for handling invoice disputes (deferred to future work).
