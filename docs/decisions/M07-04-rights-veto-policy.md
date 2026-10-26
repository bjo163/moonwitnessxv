# M07-04 — Rights Veto Policy for Text Publication

- **Milestone**: M07 Corpus source rights and ingestion pilot
- **Task**: M07-04
- **Status**: RATIFIED & VERIFIED
- **Auditor**: MoonWitness XV Legal & Security Group

---

## 1. Automated Rights Gate

Before any scripture text or vernacular translation is serialized by MoonQL REST or rendered in Dock Reader:
1. The parent Edition's `rightsStatus` is evaluated.
2. If `rightsStatus !== 'RIGHTS_EXACT_VERSION_CLEARED'`, raw textual bytes are **vetoed and stripped**.
3. The response serializes only safe metadata (`code`, `name`, `editorOrPublisher`, `rightsStatus: 'RIGHTS_UNKNOWN'`), with the content field returning `null` or a descriptive placeholder `[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]`.

---

## 2. Automated Test Verification
Verified in `apps/radio/test/corpus-ingestion.test.ts`: Unverified editions with `RIGHTS_UNKNOWN` are prevented from publishing unvetted text.
