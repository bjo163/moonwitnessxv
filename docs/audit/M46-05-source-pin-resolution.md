# M46-05 — Resolve Source Pins to Immutable Full References

**Task:** [M46-05](../../TODO.md#m46-05) · **Candidate:** ENG-005 · **Priority:** P1/D3  
**Owner:** corpus/provenance · **Effort:** M (2–6 days plus external access)  
**Status:** BASELINE ESTABLISHED — one source pin audited, unresolved  
**Date:** 2026-10-31

---

## Objective

Verify and normalize historical source pins to full immutable references without importing content.

## Scope

- Retry exact refs: attempt to resolve sourceUri
- Capture SHA: verify provenanceSha against source
- Compare tree identity: check if source matches recorded identity
- Record unresolved entries: document pins that cannot be resolved
- Require rights review before use: flag unresolved pins for rights review

## Findings

### Source Pin Inventory

**Location:** `packages/moonql-corpus/src/index.ts` (synthetic fixture in schema definition)

**Pin Details:**
```typescript
{
  workRef: '@corpus_works:quran',
  name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
  editorOrPublisher: 'Al-Azhar / Egyptian Royal Survey',
  rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
  licenseName: 'Public Domain / Verified Recitation Transmission',
  sourceUri: 'https://archive.org/details/cairo-quran-1924',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
}
```

### Resolution Attempt

**sourceUri:** https://archive.org/details/cairo-quran-1924  
**HTTP Status:** 404 Not Found  
**Resolution:** UNRESOLVED

**provenanceSha:** c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912  
**Verification:** CANNOT VERIFY (source unreachable)

### Analysis

1. **Source pin exists:** The corpus schema includes one fully-specified source pin with sourceUri and provenanceSha.

2. **Source unreachable:** The sourceUri returns HTTP 404. The Internet Archive page either:
   - Never existed (synthetic fixture URL)
   - Was removed or relocated
   - Is temporarily unavailable

3. **SHA unverifiable:** Without access to the source, the provenanceSha cannot be verified against the actual content.

4. **Rights status claimed:** The pin asserts `RIGHTS_EXACT_VERSION_CLEARED` and `Public Domain / Verified Recitation Transmission`, but this cannot be independently verified without the source.

5. **Synthetic context:** This pin appears in a schema definition file as part of a synthetic fixture, not as an imported or user-facing source. It may be a placeholder for testing rather than a real source pin.

## Acceptance Criteria

- [x] Resolved pins have full SHA/evidence (N/A — pin unresolved)
- [x] Unresolved pins say UNKNOWN (documented below)
- [x] No content imported (no bytes downloaded or stored)
- [ ] Rights review completed (deferred — requires owner decision)

## Unresolved Entries

| Work | Edition | sourceUri | provenanceSha | Status |
|------|---------|-----------|---------------|--------|
| @corpus_works:quran | Amiri Press Cairo Edition 1924 | https://archive.org/details/cairo-quran-1924 | c0a8f1e7... | **UNRESOLVED** (404) |

## Recommended Action

**Mark as UNKNOWN:**
```typescript
{
  workRef: '@corpus_works:quran',
  name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
  editorOrPublisher: 'Al-Azhar / Egyptian Royal Survey',
  rightsStatus: 'RIGHTS_UNKNOWN',  // downgraded from RIGHTS_EXACT_VERSION_CLEARED
  licenseName: 'UNKNOWN',  // downgraded from 'Public Domain / Verified Recitation Transmission'
  sourceUri: 'https://archive.org/details/cairo-quran-1924',
  sourceUriStatus: 'UNRESOLVED_404',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  provenanceShaStatus: 'UNVERIFIABLE',
}
```

**Owner decision required:**
1. Is this a synthetic fixture (test data) or a real source pin?
2. If real: locate alternative source or mark as permanently unresolved.
3. If synthetic: document as test fixture, not a real source pin.
4. Rights review: cannot confirm `RIGHTS_EXACT_VERSION_CLEARED` without verifiable source.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Unresolved pin used as authoritative source | Mark rightsStatus as RIGHTS_UNKNOWN until resolved |
| SHA mismatch if source is found later | Re-verify provenanceSha against resolved source |
| Synthetic fixture mistaken for real pin | Add comment clarifying test-only status |

## Rollback

No rollback required — this is a read-only audit with no code changes.

## Metrics

- **Source pins found:** 1
- **Pins resolved:** 0 (0%)
- **Pins unresolved:** 1 (100%)
- **SHA verifiable:** 0 (0%)
- **Rights status confirmed:** 0 (0%)

## Next Steps

1. **Owner decision:** Determine if this is a synthetic fixture or real source pin.
2. **If real:** Search for alternative source URI or archive snapshot.
3. **If synthetic:** Add clarifying comment to schema definition.
4. **Update rights status:** Downgrade to RIGHTS_UNKNOWN until source is verified.
5. **Document resolution:** Record final status in corpus provenance register.

## Conclusion

**BASELINE ESTABLISHED.** One source pin identified in corpus schema. Source URI returns 404 (unresolved). Provenance SHA cannot be verified. Rights status claimed but unconfirmed. Owner decision required on next steps.

**Key finding:** The source pin is either:
- A synthetic fixture for testing (not a real source)
- A real source pin with an outdated/broken URI

Without owner clarification, the pin must be treated as UNRESOLVED with RIGHTS_UNKNOWN status.

---

**Closure evidence:** Source pin inventory completed, resolution attempted (404), unresolved entry documented, owner decision required.
