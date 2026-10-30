# API Compatibility and Deprecation Policy

**Status:** ACCEPTED · **Date:** 2026-10-30 · **HEAD:** bc79338 · **Owner:** ARSY API (M46-13)

This document defines how MoonWitness XV API route and schema changes are versioned, announced, and retired. It applies to all public and service-to-service REST APIs owned by ARSY, SKYLINK, ECHOLOG, AIGateway, and other XV services.

## Versioning scheme

**URL path versioning:** APIs use `/api/v<N>/` prefix where `<N>` is a positive integer.

**Current versions:**
- ARSY: `/api/v1/` (health, metrics, studio, channels, stations, models, research)
- SKYLINK: `/api/v1/` (send, broadcast, channels, conversations, webhooks)
- ECHOLOG: `/api/v1/` (objects, gc, health, witness)
- AIGateway: `/api/v1/` (inference, providers, models)

**Version increment rules:**
- **Major version bump** (`v1` → `v2`): breaking change to route path, request/response schema, or authentication contract
- **Minor version bump**: not used — XV APIs do not support backward-compatible schema evolution within a major version
- **Patch/breaking fix**: security or correctness fix that technically breaks contract but is necessary; documented in release notes with migration guidance

## Change classification

Every proposed API change must be classified as **ADDITIVE**, **BREAKING**, or **CORRECTIVE** before implementation.

### ADDITIVE (non-breaking)

**Definition:** New route, new optional request field, new response field, or new endpoint that does not alter existing behavior.

**Examples:**
- Adding `GET /api/v1/users/:id/preferences` (new route)
- Adding optional `timezone` field to `POST /api/v1/users` request (existing field still works)
- Adding `lastLogin` field to `GET /api/v1/users/:id` response (clients ignore unknown fields)
- Adding new enum value to existing field (clients handle unknown values gracefully)

**Requirements:**
- No version bump required
- Release note entry: "Added [feature] to [route]"
- Owner approval: route owner
- Migration window: none required

**Check:** Does the change work with existing clients without modification? If yes → ADDITIVE.

### BREAKING (requires major version bump)

**Definition:** Change that causes existing clients to fail, return incorrect data, or behave unexpectedly.

**Examples:**
- Removing a route (`DELETE /api/v1/legacy-endpoint`)
- Removing a request or response field
- Changing field type (string → number)
- Making optional field required
- Changing authentication mechanism
- Changing error response structure
- Renaming route path segment (`/api/v1/users` → `/api/v1/accounts`)

**Requirements:**
- Major version bump required (`v1` → `v2`)
- Old version maintained for **minimum 90 days** after new version release
- Migration guide published before new version release
- Release note entry: "BREAKING: [change] — migrate from [old] to [new] by [date]"
- Owner approval: route owner + API review (minimum 2 owners)
- Deprecation announcement: minimum 30 days before old version removal

**Check:** Would an existing client break if deployed without changes? If yes → BREAKING.

### CORRECTIVE (exceptional breaking change)

**Definition:** Security vulnerability or data corruption bug that requires immediate fix, even if it breaks contract.

**Examples:**
- Fixing SQL injection vulnerability that requires parameter format change
- Fixing data leak that requires response field removal
- Fixing authentication bypass that requires token format change

**Requirements:**
- Security review confirms necessity
- Release note entry: "SECURITY: [vulnerability] — corrective change, no migration window"
- Owner approval: security owner + route owner
- Migration window: **waived** for security reasons
- Post-release: publish migration guide within 7 days

**Check:** Is this a security or data-integrity fix that cannot wait for normal versioning? If yes → CORRECTIVE.

## Deprecation process

### Phase 1: Announcement (Day 0)

**Actions:**
- Mark route/field as `@deprecated` in OpenAPI schema and code comments
- Add deprecation header to responses: `Deprecation: true` and `Sunset: <date>` (RFC 8594)
- Publish migration guide in `docs/architecture/API_MIGRATIONS.md`
- Send notification to known consumers (internal teams, external partners)
- Release note entry: "DEPRECATED: [route/field] — use [replacement] by [date]"

**Minimum notice period:**
- ADDITIVE replacement available: 30 days
- BREAKING change (normal versioning): 90 days
- CORRECTIVE (security): 0 days (immediate)

### Phase 2: Migration window (Day 0 → Day N)

**Actions:**
- Old version remains fully functional
- Monitor usage metrics for deprecated routes
- Send reminder notifications at 50% and 75% of migration window
- Assist consumers with migration questions

**Metrics to track:**
- Request count per deprecated route
- Unique consumers still using deprecated route
- Error rate during migration (should be zero if additive replacement available)

### Phase 3: Removal (Day N)

**Actions:**
- Remove deprecated route/field from codebase
- Update OpenAPI schema
- Publish release note: "REMOVED: [route/field] — migration deadline passed"
- Update API documentation

**Post-removal:**
- Old version route returns `410 Gone` with migration guide link
- Monitor error logs for unexpected consumers (should be zero)

## Sample change classifications

### Example 1: Adding a new response field

**Proposed change:** Add `createdAt` field to `GET /api/v1/users/:id` response.

**Classification:** ADDITIVE

**Rationale:** Existing clients ignore unknown fields. No behavior change for current consumers.

**Action:** Implement without version bump. Add release note.

### Example 2: Changing field type

**Proposed change:** Change `user.age` from `string` to `number` in `GET /api/v1/users/:id`.

**Classification:** BREAKING

**Rationale:** Clients expecting string will fail to parse number. Existing integrations break.

**Action:** Bump to `/api/v2/users`. Maintain `/api/v1/users` for 90 days. Publish migration guide.

### Example 3: Fixing authentication bypass

**Proposed change:** Remove support for unauthenticated `GET /api/v1/admin/users` (should have required admin role).

**Classification:** CORRECTIVE

**Rationale:** Security vulnerability. Unauthenticated access to admin data is unacceptable.

**Action:** Immediate fix. No migration window. Publish security advisory. Add authentication requirement.

## Consumer review requirements

Before any BREAKING change:

1. **Inventory consumers:** Search codebase for route usage (internal services, frontend apps, test files)
2. **Contact external consumers:** If API is exposed to partners or public, notify 90 days in advance
3. **Verify migration path:** Ensure replacement route/field is available and tested
4. **Review with API owners:** Minimum 2 owners approve the breaking change
5. **Document migration:** Write step-by-step guide in `docs/architecture/API_MIGRATIONS.md`

## Documentation requirements

Every API route must document:

- **Version:** `/api/v<N>/` prefix
- **Deprecation status:** `@deprecated` tag if applicable
- **Sunset date:** RFC 8594 `Sunset` header if deprecated
- **Migration guide:** Link to `docs/architecture/API_MIGRATIONS.md` if deprecated
- **Breaking change history:** Release notes entry for each major version

## Tooling and checks

### OpenAPI schema validation

- All routes must have OpenAPI 3.0 schema in `apps/<service>/src/api/schema.ts`
- Schema must include `@deprecated` tags for deprecated routes
- CI check: schema validation runs on every PR

### Deprecation header enforcement

- Fastify middleware adds `Deprecation: true` and `Sunset: <date>` headers to deprecated routes
- CI check: deprecated routes must have sunset date within 90 days

### Breaking change detection

- Pre-commit hook compares OpenAPI schema before/after changes
- If breaking change detected without version bump, hook warns and requires owner override
- Override requires written justification in PR description

## Owner responsibilities

**Route owner:**
- Classify changes (ADDITIVE, BREAKING, CORRECTIVE)
- Approve ADDITIVE and CORRECTIVE changes
- Initiate deprecation process
- Monitor usage metrics during migration window

**API review board (2+ owners):**
- Approve BREAKING changes
- Review migration guides
- Verify consumer notification
- Approve early removal if justified

**Security owner:**
- Approve CORRECTIVE classification
- Verify security necessity
- Approve migration window waiver

## Rollback and fallback

**If breaking change causes unexpected failures:**
1. Revert to previous version immediately
2. Publish incident report
3. Re-classify change with correct migration window
4. Re-deploy with proper version bump

**If deprecation removal breaks consumer:**
1. Re-add route with `@deprecated` tag
2. Extend sunset date by 90 days
3. Contact consumer directly
4. Publish post-mortem

## Metrics and success criteria

**Track:**
- Number of ADDITIVE vs BREAKING vs CORRECTIVE changes per quarter
- Average migration window compliance (do consumers migrate before deadline?)
- Number of rollback incidents due to misclassified changes
- Number of deprecated routes still in use after sunset date

**Targets:**
- >80% of changes are ADDITIVE (healthy API evolution)
- <5% rollback rate for breaking changes
- 0 deprecated routes in use after sunset date

## Evidence links

- ARSY API routes: `apps/arsy/src/modules/*/index.ts`
- SKYLINK API routes: `apps/skylink/src/server.ts`
- ECHOLOG API routes: `apps/echolog/src/server.ts`
- AIGateway API routes: `apps/aigateway/src/server.ts`
- OpenAPI schemas: `apps/*/src/api/schema.ts` (when implemented)

## Unresolved items

1. **OpenAPI schema generation:** Current routes use Fastify schema but not full OpenAPI 3.0. Migration to OpenAPI is planned but not scheduled.
2. **Automated deprecation headers:** Middleware implementation is proposed but not yet built.
3. **Consumer inventory tooling:** No automated way to discover all API consumers. Manual search required.
4. **API changelog:** No centralized changelog for API changes. Release notes are the source of truth.

## Approval record

**Policy owner:** ARSY API team  
**Reviewed by:** Owner authority (M46-13 task)  
**Approved:** 2026-10-30  
**Next review:** 2027-01-30 (quarterly)
