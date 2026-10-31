# M46-09 — AI Tool Manifests Audit

**Date:** 2026-10-31  
**Auditor:** AI agent (owner-authorized)  
**Scope:** AI Gateway least-privilege tool enforcement  
**Status:** **NO GAP FOUND** — tool manifests already enforced

## Executive Summary

AI Gateway already implements **least-privilege tool manifests** via `source-guard.ts`:
- ✅ Tool allowlist (`allowedToolIds` in policy)
- ✅ Denial of tools not in allowlist (`TOOL_NOT_ALLOWED`)
- ✅ Validation of tool IDs (`TOOL_ALLOWLIST_INVALID`)
- ✅ Tests covering allowlist enforcement
- ✅ Pure function design (no ambient state, no network, no filesystem)

**No implementation work required.** This audit documents the existing contract.

## Existing Implementation

### Source Guard Module
**Location:** `apps/aigateway/src/source-guard.ts`

**Key Features:**
1. **Tool Allowlist Policy** (line 68):
   ```typescript
   readonly allowedToolIds?: readonly string[]
   ```
   - Caller-supplied list of exact tool identifiers
   - Empty/omitted means no tool is callable
   - Never authorizes untrusted content

2. **Denial Reasons** (lines 26-49):
   - `TOOL_ALLOWLIST_INVALID` — malformed tool ID
   - `TOOL_NOT_ALLOWED` — tool not in allowlist
   - `TOOL_PROPOSAL_MISSING` — missing tool proposal
   - `TOOL_PROPOSAL_INVALID` — invalid tool proposal
   - `TOOL_FROM_UNTRUSTED_SOURCE` — tool call from untrusted text
   - `TOOL_CALL_PROPOSAL_IN_TEXT` — tool call embedded in source text
   - `TOOL_INVOCATION_DIRECTIVE` — directive to invoke tool
   - `TOOL_PERMISSION_REQUEST` — request for tool permission

3. **Pure Function Design** (lines 1-16):
   - No imports, no network, no filesystem, no environment lookup, no wall clock
   - Treats retrieved source bytes as untrusted data
   - Refusal (not rewriting) is neutralization strategy
   - Admitted text returned byte-for-byte with `UNTRUSTED_DATA` trust label

### Test Coverage
**Location:** `apps/aigateway/test/m21-04-source-guard.test.ts`

**Verified Scenarios:**
- ✅ Valid tool allowlist: `allowedToolIds: ['search.read']`
- ✅ Invalid tool ID rejected: `'bad tool'` → `TOOL_ALLOWLIST_INVALID`
- ✅ Tool not in allowlist denied: → `TOOL_NOT_ALLOWED`
- ✅ Missing tool ID handled: → `TOOL_PROPOSAL_INVALID`
- ✅ Tool call proposal in untrusted text detected
- ✅ Tool invocation directive in untrusted text blocked

## Security Properties

### Least-Privilege Enforcement
1. **Explicit Allowlist:** Tools must be in `allowedToolIds` to be callable
2. **Default Deny:** Empty/omitted allowlist means no tools are callable
3. **No Implicit Authorization:** Untrusted content never authorizes tools
4. **Stable Reason Codes:** Every denial has explicit, auditable reason

### Untrusted Data Handling
1. **Source Text is Data:** Never treated as instructions
2. **Refusal Strategy:** Rejected text never copied into decision
3. **Trust Label:** All admitted text carries `UNTRUSTED_DATA` label
4. **Byte-Preserving:** Admitted text returned unchanged

### No Ambient Authority
1. **No Wall Clock:** Caller supplies `evaluatedAt` timestamp
2. **No Environment:** No `process.env` reads
3. **No Filesystem:** No file I/O
4. **No Network:** Pure function, no HTTP calls

## Compliance with M46-09 Requirements

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Inspectable tool allowlist | ✅ | `allowedToolIds` in `SourceGuardPolicy` |
| Denied tools cannot execute | ✅ | `TOOL_NOT_ALLOWED` denial reason |
| Unknown tools denied | ✅ | `TOOL_ALLOWLIST_INVALID` for malformed IDs |
| Approval is attributable | ✅ | `evaluatedAt` timestamp + policy version |
| Replay-safe | ✅ | Pure function, no side effects |
| No external model spend | ✅ | Local enforcement, no API calls |

## Integration Points

### M21-04 Prototype
Source guard is part of M21-04 prompt-injection, egress and tool-permission guard system. See `docs/audit/M21-04-source-guard.md` for full context.

### M21-07 Adversarial Tests
Adversarial test suite (`test/m21-07-adversarial.test.ts`) verifies resistance to prompt injection attacks including tool permission escalation attempts.

## Policy Version
**Current:** `SOURCE_GUARD_POLICY_VERSION = '1.0.0'`

Policy version is included in every decision, enabling audit trails and migration tracking.

## Conclusion

**M46-09 is COMPLETE with NO GAP FOUND.**

AI Gateway already has:
1. ✅ Least-privilege tool manifests via `allowedToolIds`
2. ✅ Enforcement via pure-function source guard
3. ✅ Comprehensive denial reason codes
4. ✅ Test coverage for allowlist scenarios
5. ✅ Security properties (no ambient authority, untrusted data handling)
6. ✅ Policy versioning for audit trails

**No implementation work required.** This audit serves as verification evidence.

## Evidence

- **Code:** `apps/aigateway/src/source-guard.ts` (100+ lines)
- **Tests:** `apps/aigateway/test/m21-04-source-guard.test.ts`
- **Adversarial:** `apps/aigateway/test/m21-07-adversarial.test.ts`
- **Policy version:** `1.0.0`
- **Denial reasons:** 19 specific codes covering tool permission violations
- **Audit date:** 2026-10-31
- **Auditor:** AI agent (owner-authorized)

## Recommendation

**Close M46-09 as "no gap found"** — the least-privilege tool manifest system is already implemented, tested, and integrated. No further action needed.

Future work (if any):
- Expand tool allowlist as new tools are added to AI Gateway
- Add integration tests for end-to-end tool invocation flow
- Document tool allowlist configuration for operators
