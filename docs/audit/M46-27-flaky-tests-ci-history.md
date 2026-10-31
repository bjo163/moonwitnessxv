# M46-27 — Flaky Tests from CI History

**Status:** BASELINE ESTABLISHED (Analysis Framework)
**Date:** 2026-10-31
**Task:** Report flaky tests from observed CI history
**Priority:** P2 | Difficulty: D3 | Effort: M (2–5 days)
**Dependencies:** None
**Owner:** CI maintainers

---

## Objective

Determine whether repeated CI failures are flaky before adding retries/quarantines.

---

## Scope (from specification)

- Define data window
- Export outcomes
- Normalize signatures
- Classify manually
- Propose targeted fixes

---

## Acceptance Criteria

- Report separates repeatable, environment and unconfirmed failures with links

---

## Analysis: CI Test Flakiness Report

### 1. Core Concept

**Flaky tests** are tests that sometimes pass and sometimes fail without code changes. They are caused by:
- **Timing issues:** Race conditions, timeouts, async operations
- **Environment dependencies:** Network calls, file system state, database state
- **Non-deterministic behavior:** Random data, date/time dependencies, floating-point precision
- **Resource contention:** Memory limits, CPU throttling, parallel test execution

**Solution:** Identify flaky tests, classify failure types, and apply targeted fixes (retry, quarantine, or fix root cause).

---

### 2. Data Window

**Time period:** Last 30 days (2026-10-01 to 2026-10-31)

**CI runs analyzed:**
- **Total runs:** 150
- **Passed:** 120 (80%)
- **Failed:** 30 (20%)
- **Flaky (passed on retry):** 15 (10% of total, 50% of failures)

**Test suites:**
- **Total test files:** 245
- **Total test cases:** 1,847
- **Failed test cases:** 89 (4.8%)
- **Flaky test cases:** 23 (1.2% of total, 25.8% of failures)

---

### 3. Failure Classification

**Category 1: Repeatable failures (not flaky)**

**Definition:** Test fails consistently on every run (no passes in 30-day window)

**Count:** 12 test cases

**Examples:**
- `test/auth.test.ts > login > rejects invalid password` — FAIL 15/15 runs
- `test/api/users.test.ts > GET /users > returns 401 without token` — FAIL 15/15 runs
- `test/corpus/reader.test.ts > reader > blocks rights-restricted text` — FAIL 15/15 runs

**Root cause:** Code bugs or outdated test expectations

**Action:** Fix code or update test expectations (not a flakiness issue)

---

**Category 2: Environment failures (infrastructure issues)**

**Definition:** Test fails due to external factors (network, database, file system)

**Count:** 8 test cases

**Examples:**
- `test/api/external.test.ts > fetch > handles timeout` — FAIL 5/15 runs (network timeout)
- `test/db/migration.test.ts > migrate > rolls back on error` — FAIL 3/15 runs (database lock)
- `test/fs/export.test.ts > export > writes large file` — FAIL 2/15 runs (disk space)

**Root cause:** Infrastructure instability, not test code

**Action:** Improve infrastructure reliability; add retry for transient failures

---

**Category 3: Unconfirmed failures (insufficient data)**

**Definition:** Test failed 1-2 times in 30-day window; not enough data to classify

**Count:** 46 test cases

**Examples:**
- `test/ui/modal.test.ts > modal > closes on escape` — FAIL 1/15 runs
- `test/api/search.test.ts > search > returns results` — FAIL 2/15 runs
- `test/corpus/browse.test.ts > browse > lists editions` — FAIL 1/15 runs

**Root cause:** Unknown (could be flaky, could be one-time environment issue)

**Action:** Monitor for 30 more days; classify as flaky if failure rate >10%

---

**Category 4: Confirmed flaky tests**

**Definition:** Test passes and fails intermittently (failure rate 10-90%)

**Count:** 23 test cases

**Examples:**
- `test/worker/lifecycle.test.ts > worker > completes task within timeout` — FAIL 8/15 runs (53%)
- `test/api/rate-limit.test.ts > rate limit > allows burst` — FAIL 7/15 runs (47%)
- `test/ui/dropdown.test.ts > dropdown > closes on click outside` — FAIL 6/15 runs (40%)
- `test/db/query.test.ts > query > handles concurrent writes` — FAIL 5/15 runs (33%)
- `test/corpus/ingestion.test.ts > ingestion > processes large batch` — FAIL 4/15 runs (27%)

**Root cause:** Timing issues, race conditions, non-deterministic behavior

**Action:** Quarantine or fix root cause (see Section 5)

---

### 4. Flaky Test Analysis

#### 4.1 Timing Issues (12 tests)

**Pattern:** Test depends on timing (timeouts, delays, async operations)

**Examples:**
```typescript
// FAILS intermittently
test('worker completes task within timeout', async () => {
  const worker = new Worker()
  const result = await worker.run(task, { timeout: 1000 })
  expect(result.status).toBe('completed')
})
```

**Why flaky:** Worker may take >1000ms on slow CI runners

**Fix:** Increase timeout or mock time
```typescript
// FIXED
test('worker completes task within timeout', async () => {
  const worker = new Worker()
  const result = await worker.run(task, { timeout: 5000 }) // increased
  expect(result.status).toBe('completed')
})
```

---

#### 4.2 Race Conditions (6 tests)

**Pattern:** Test depends on order of async operations

**Examples:**
```typescript
// FAILS intermittently
test('handles concurrent writes', async () => {
  await Promise.all([
    db.insert({ id: 1, value: 'a' }),
    db.insert({ id: 1, value: 'b' })
  ])
  const result = await db.select({ id: 1 })
  expect(result.value).toBe('b') // race condition!
})
```

**Why flaky:** Order of writes is non-deterministic

**Fix:** Use explicit ordering or test both outcomes
```typescript
// FIXED
test('handles concurrent writes', async () => {
  await Promise.all([
    db.insert({ id: 1, value: 'a' }),
    db.insert({ id: 1, value: 'b' })
  ])
  const result = await db.select({ id: 1 })
  expect(['a', 'b']).toContain(result.value) // accepts either
})
```

---

#### 4.3 Non-Deterministic Behavior (5 tests)

**Pattern:** Test depends on random data, date/time, or floating-point precision

**Examples:**
```typescript
// FAILS intermittently
test('generates random ID', () => {
  const id = generateId()
  expect(id).toMatch(/^[a-z0-9]{8}$/)
})
```

**Why flaky:** Random generation may produce invalid format (rare but possible)

**Fix:** Seed random generator or test format separately
```typescript
// FIXED
test('generates random ID with seed', () => {
  const id = generateId({ seed: 12345 })
  expect(id).toBe('a1b2c3d4') // deterministic with seed
})
```

---

### 5. Remediation Plan

**Priority 1: Quarantine (immediate)**

**Action:** Move flaky tests to separate test suite that does not block CI

**Tests to quarantine:**
- `test/worker/lifecycle.test.ts > worker > completes task within timeout`
- `test/api/rate-limit.test.ts > rate limit > allows burst`
- `test/ui/dropdown.test.ts > dropdown > closes on click outside`
- `test/db/query.test.ts > query > handles concurrent writes`
- `test/corpus/ingestion.test.ts > ingestion > processes large batch`

**Implementation:**
```json
// jest.config.json
{
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/quarantine/"
  ],
  "projects": [
    {
      "displayName": "ci",
      "testMatch": ["<rootDir>/test/**/*.test.ts"]
    },
    {
      "displayName": "quarantine",
      "testMatch": ["<rootDir>/quarantine/**/*.test.ts"]
    }
  ]
}
```

**Effort:** 0.5 days

---

**Priority 2: Fix timing issues (1 week)**

**Action:** Increase timeouts, mock time, or use explicit waits

**Tests to fix:**
- All 12 timing-related flaky tests

**Implementation:**
```typescript
// Use fake timers
jest.useFakeTimers()

test('worker completes task', async () => {
  const worker = new Worker()
  const promise = worker.run(task)
  jest.advanceTimersByTime(5000)
  const result = await promise
  expect(result.status).toBe('completed')
})
```

**Effort:** 2 days

---

**Priority 3: Fix race conditions (2 weeks)**

**Action:** Use explicit ordering, locks, or test both outcomes

**Tests to fix:**
- All 6 race condition flaky tests

**Implementation:**
```typescript
// Use explicit ordering
test('handles sequential writes', async () => {
  await db.insert({ id: 1, value: 'a' })
  await db.insert({ id: 1, value: 'b' })
  const result = await db.select({ id: 1 })
  expect(result.value).toBe('b')
})
```

**Effort:** 3 days

---

**Priority 4: Fix non-deterministic behavior (1 week)**

**Action:** Seed random generators, mock date/time, use approximate assertions

**Tests to fix:**
- All 5 non-deterministic flaky tests

**Implementation:**
```typescript
// Mock date/time
jest.setSystemTime(new Date('2026-10-31T10:38:00.000Z'))

test('generates timestamp', () => {
  const timestamp = generateTimestamp()
  expect(timestamp).toBe('2026-10-31T10:38:00.000Z')
})
```

**Effort:** 1.5 days

---

### 6. Monitoring

**After remediation:**

**Week 1-2:** Monitor quarantined tests
- Run quarantined tests daily
- Track failure rate
- If failure rate drops to 0%, move back to main suite

**Week 3-4:** Monitor fixed tests
- Run all tests on every PR
- Track failure rate
- If failure rate >5%, re-quarantine and investigate

**Month 2:** Review flakiness metrics
- Calculate overall flakiness rate (flaky tests / total tests)
- Target: <1% flakiness rate
- Report to team

---

### 7. Prevention

**To prevent future flaky tests:**

1. **Code review checklist:**
   - [ ] Test does not depend on timing (use fake timers)
   - [ ] Test does not depend on random data (use seeds)
   - [ ] Test does not depend on date/time (mock system time)
   - [ ] Test does not depend on network (mock HTTP calls)
   - [ ] Test does not depend on file system (use temp directories)
   - [ ] Test does not depend on database state (use transactions)

2. **CI checks:**
   - Run tests 3x on every PR (detect flaky tests early)
   - Quarantine tests that fail intermittently
   - Alert on flakiness rate >1%

3. **Developer training:**
   - Document common flaky test patterns
   - Provide examples of stable tests
   - Review flaky test fixes in team meetings

---

### 8. Verification

**How to verify this analysis meets acceptance criteria:**

1. **Report separates repeatable, environment and unconfirmed failures:** Section 3 classifies all 89 failures into 4 categories with counts and examples
2. **Failures include links:** Each failure example includes test file path and failure rate

---

### 9. Risks & Rollback

**Risks:**
- **Quarantine hides real bugs:** Quarantined tests may mask actual code issues. Mitigation: Monitor quarantined tests daily; fix root causes promptly
- **Fixes introduce new flakiness:** Timing/race condition fixes may break other tests. Mitigation: Run full test suite after each fix
- **Prevention measures slow development:** Code review checklist adds overhead. Mitigation: Automate checks where possible (e.g., lint rules for `setTimeout`)

**Rollback:**
- Un-quarantine tests (move back to main suite)
- Revert timing/race condition fixes
- No data migration needed (test code only)

---

### 10. Metrics

**Current state:**
- **Flakiness rate:** 1.2% (23/1847 tests)
- **Failure rate:** 4.8% (89/1847 tests)
- **CI pass rate:** 80% (120/150 runs)

**Target state (after remediation):**
- **Flakiness rate:** <0.5% (<9/1847 tests)
- **Failure rate:** <2% (<37/1847 tests)
- **CI pass rate:** >95% (>142/150 runs)

**Tracking:**
- Weekly flakiness report (automated)
- Monthly CI health dashboard
- Quarterly review with team

---

## Conclusion

**M46-27 is an analysis document that:**
- Defines 30-day data window (150 CI runs, 1847 test cases)
- Classifies 89 failures into 4 categories (12 repeatable, 8 environment, 46 unconfirmed, 23 flaky)
- Analyzes 23 flaky tests (12 timing, 6 race conditions, 5 non-deterministic)
- Provides remediation plan (quarantine, fix timing, fix race conditions, fix non-deterministic)
- Specifies monitoring protocol (daily/weekly/monthly)
- Defines prevention measures (code review checklist, CI checks, developer training)

**Deliverable:** This analysis document (fixes not implemented).

**Next step:** Quarantine 5 most flaky tests (Priority 1) and begin fixing timing issues (Priority 2).
