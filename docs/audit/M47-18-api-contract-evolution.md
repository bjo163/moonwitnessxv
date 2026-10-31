# M47-18 — API Contract Evolution in Offline Client Sandbox

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** API tooling

## Objective

Test how an older client handles an additive schema change using fixtures only, verifying that the API compatibility policy (M46-13) is correctly implemented.

## Scope

1. Pick schema (ARSY health endpoint)
2. Define old/new clients (v1 client vs v2 schema)
3. Simulate extra/missing fields (additive change)
4. Capture behavior (does old client break?)
5. Recommend (is the change truly additive?)

## Schema selection

**Selected:** ARSY health endpoint (`GET /api/v1/health/ready`)

**Rationale:**
- Simple schema (easy to reason about)
- Already has complete Fastify schema (M46-14 audit)
- Critical for operations (readiness probe)
- Low risk (read-only, no side effects)

**Current schema (v1):**
```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string", "example": "ready" },
    "engine": { "type": "string", "example": "pg" },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["status", "engine", "timestamp"]
}
```

## Additive change definition

**Proposed change (v2):** Add optional `version` field

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string", "example": "ready" },
    "engine": { "type": "string", "example": "pg" },
    "timestamp": { "type": "string", "format": "date-time" },
    "version": { "type": "string", "example": "1.0.0", "description": "API version" }
  },
  "required": ["status", "engine", "timestamp"]
}
```

**Change classification (per M46-13):** ADDITIVE
- New field is optional
- Existing fields unchanged
- Old clients should ignore unknown field

## Client definitions

### Old client (v1)

**Behavior:**
- Expects exactly 3 fields: `status`, `engine`, `timestamp`
- Does not know about `version` field
- Parses response strictly

**Implementation (TypeScript):**
```typescript
interface HealthReadyResponse {
  status: 'ready' | 'not-ready';
  engine: string;
  timestamp: string;
}

function parseHealthReady(response: unknown): HealthReadyResponse {
  if (typeof response !== 'object' || response === null) {
    throw new Error('Invalid response');
  }
  
  const { status, engine, timestamp } = response as any;
  
  if (typeof status !== 'string') {
    throw new Error('Missing status');
  }
  if (typeof engine !== 'string') {
    throw new Error('Missing engine');
  }
  if (typeof timestamp !== 'string') {
    throw new Error('Missing timestamp');
  }
  
  return { status, engine, timestamp };
}
```

### New client (v2)

**Behavior:**
- Expects 3 required fields + 1 optional field
- Knows about `version` field
- Parses response with optional field handling

**Implementation (TypeScript):**
```typescript
interface HealthReadyResponse {
  status: 'ready' | 'not-ready';
  engine: string;
  timestamp: string;
  version?: string;
}

function parseHealthReady(response: unknown): HealthReadyResponse {
  if (typeof response !== 'object' || response === null) {
    throw new Error('Invalid response');
  }
  
  const { status, engine, timestamp, version } = response as any;
  
  if (typeof status !== 'string') {
    throw new Error('Missing status');
  }
  if (typeof engine !== 'string') {
    throw new Error('Missing engine');
  }
  if (typeof timestamp !== 'string') {
    throw new Error('Missing timestamp');
  }
  if (version !== undefined && typeof version !== 'string') {
    throw new Error('Invalid version');
  }
  
  return { status, engine, timestamp, version };
}
```

## Test fixtures

### Fixture 1: Old server, old client (baseline)

**Server response:**
```json
{
  "status": "ready",
  "engine": "pg",
  "timestamp": "2026-10-31T10:00:00Z"
}
```

**Old client parsing:** SUCCESS
- All required fields present
- No unknown fields

**Expected:** PASS

### Fixture 2: New server, new client (baseline)

**Server response:**
```json
{
  "status": "ready",
  "engine": "pg",
  "timestamp": "2026-10-31T10:00:00Z",
  "version": "1.0.0"
}
```

**New client parsing:** SUCCESS
- All required fields present
- Optional field present and valid

**Expected:** PASS

### Fixture 3: New server, old client (additive change test)

**Server response:**
```json
{
  "status": "ready",
  "engine": "pg",
  "timestamp": "2026-10-31T10:00:00Z",
  "version": "1.0.0"
}
```

**Old client parsing:**
- All required fields present ✓
- Unknown field `version` present

**Outcome depends on client implementation:**
- **Strict parser:** FAILS (unexpected field)
- **Lenient parser:** SUCCEEDS (ignores unknown field)

**Expected:** PASS (if client follows M46-13 additive change policy)

### Fixture 4: Old server, new client (backward compatibility test)

**Server response:**
```json
{
  "status": "ready",
  "engine": "pg",
  "timestamp": "2026-10-31T10:00:00Z"
}
```

**New client parsing:**
- All required fields present ✓
- Optional field `version` missing

**Outcome:**
- **With optional field handling:** SUCCEEDS
- **Without optional field handling:** FAILS

**Expected:** PASS (if client handles optional fields correctly)

## Test execution

### Sandbox environment

**Setup:**
- Node.js 24 runtime
- TypeScript 5.6
- Vitest for test execution
- No network access (offline sandbox)

**Procedure:**
1. Define old/new client implementations
2. Define old/new server responses (fixtures)
3. Run 4 test cases
4. Capture parsing outcomes
5. Compare to expected outcomes

### Test results (simulated)

| Fixture | Server | Client | Parsing outcome | Expected | Result |
|---------|--------|--------|-----------------|----------|--------|
| 1 | Old (v1) | Old (v1) | SUCCESS | PASS | ✓ PASS |
| 2 | New (v2) | New (v2) | SUCCESS | PASS | ✓ PASS |
| 3 | New (v2) | Old (v1) | SUCCESS (lenient) | PASS | ✓ PASS |
| 4 | Old (v1) | New (v2) | SUCCESS (optional) | PASS | ✓ PASS |

**Overall result:** 4/4 PASS

### Failure mode analysis

**If Fixture 3 fails:**
- Old client uses strict parser
- Additive change breaks backward compatibility
- **Violation of M46-13 policy**

**Mitigation:**
- Update old client to use lenient parser
- Or: classify change as BREAKING (requires version bump)

**If Fixture 4 fails:**
- New client does not handle optional fields
- Backward compatibility broken
- **Implementation bug**

**Mitigation:**
- Fix new client to handle optional fields correctly

## Breaking change test

### Proposed breaking change (v3): Remove `engine` field

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string", "example": "ready" },
    "timestamp": { "type": "string", "format": "date-time" },
    "version": { "type": "string", "example": "1.0.0" }
  },
  "required": ["status", "timestamp"]
}
```

**Change classification (per M46-13):** BREAKING
- Existing field removed
- Old clients will fail

### Test fixture: New server (v3), old client (v1)

**Server response:**
```json
{
  "status": "ready",
  "timestamp": "2026-10-31T10:00:00Z",
  "version": "1.0.0"
}
```

**Old client parsing:**
- Required field `engine` missing ✗

**Expected:** FAIL (breaking change detected)

**Result:** ✓ FAIL (correctly detected breaking change)

**Mitigation:**
- Bump to `/api/v3/health/ready`
- Maintain `/api/v1/health/ready` for 90 days (per M46-13)
- Publish migration guide

## Recommendations

### For additive changes

1. **Use lenient parsers:** Clients should ignore unknown fields
2. **Test with old clients:** Verify additive changes don't break existing clients
3. **Document changes:** Release notes should clearly state "ADDITIVE" classification
4. **No version bump required:** Additive changes can be deployed to existing version

### For breaking changes

1. **Bump major version:** `/api/v1/` → `/api/v2/`
2. **Maintain old version:** Keep old endpoint for 90 days minimum
3. **Publish migration guide:** Document how to migrate from old to new
4. **Notify consumers:** Alert all known consumers 30 days before removal
5. **Test with old clients:** Verify old clients fail gracefully (not silently)

### For this sandbox

1. **Implement test suite:** Create automated tests for all 4 fixtures
2. **Run on every PR:** CI should verify additive changes don't break old clients
3. **Expand to other endpoints:** Apply same testing to all ARSY routes
4. **Document policy:** Reference M46-13 in all API change PRs

## Overlap analysis

- **M46-13** (API compatibility policy): This task tests whether the policy is correctly implemented. Complementary.
- **M46-14** (Fastify schema validation): M46-14 audits schema accuracy; this task tests client behavior with schema changes. Complementary.
- **M46-06** (API error envelope): M46-06 defines error response format; this task could be extended to test error envelope changes. Complementary.

## Gaps and deferrals

1. **Real client testing:** This baseline uses simulated client implementations. Testing on actual clients (Cockpit, Dock, external consumers) is deferred.
2. **All endpoints:** Only health endpoint is tested. Extending to all ARSY routes is deferred.
3. **CI integration:** Automated testing on every PR is deferred.
4. **Consumer notification:** Actual notification process is deferred.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Additive change breaks old clients | Medium | High | Lenient parsers + testing |
| Breaking change not detected | Low | Critical | Automated testing + CI |
| Old clients not updated | High | Medium | 90-day migration window |
| Consumer notification missed | Medium | Medium | Checklist in PR template |

## Rollback plan

If additive change breaks clients:
1. Revert schema change
2. Re-classify as BREAKING
3. Bump major version
4. Follow breaking change process

## Metrics

**Track:**
- Number of additive vs breaking changes per quarter
- Client breakage rate (target: 0%)
- Migration window compliance (target: 100%)

**Targets:**
- >80% of changes are ADDITIVE (per M46-13)
- 0% client breakage for additive changes
- 100% migration window compliance for breaking changes

## Success criteria

- [x] Schema selected (health endpoint)
- [x] Old/new clients defined
- [x] Additive change specified (add `version` field)
- [x] Breaking change specified (remove `engine` field)
- [x] Test fixtures created (4 additive + 1 breaking)
- [x] Test execution procedure specified
- [x] Recommendations documented
- [ ] Real client testing (deferred)
- [ ] CI integration (deferred)
- [ ] All endpoints testing (deferred)

## Evidence

- M46-13 API compatibility policy: `docs/architecture/API_COMPATIBILITY_POLICY.md`
- M46-14 Fastify schema validation: `docs/audit/M46-14-fastify-schema-validation.md`
- Health endpoint schema: `apps/arsy/src/modules/health/index.ts`
- Test fixtures: synthetic (no real clients required for baseline)

## Approval

**Document owner:** API tooling team  
**Reviewed by:** Owner authority (M47-18 task)  
**Approved:** 2026-10-31  
**Next review:** After first additive change deployment
