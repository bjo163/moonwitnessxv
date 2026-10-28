# M23-04 — Empire taxonomy metadata index

- **Task:** M23-04 — Index nine Prime Code, 10 WINGS and GOD99 as separate metadata
- **Acceptance:** No programmatic angel/god identities
- **Branch / baseline:** `dev`, HEAD `eb3b9f085da73e1e19d8686d467dab95c2b7d13e`
- **Prerequisite:** M06-05 closed (source crosswalk inventory)
- **Status:** Ready to close at the baseline above; not committed by this task.

The worktree already contained another session's uncommitted changes. This task touched only the files listed below and did not revert or modify unrelated work.

## 1. What was implemented

A typed, read-only metadata index in `packages/moonql-unilex/src/data/empire-taxonomy.ts`:

- `EMPIRE_TAXONOMY_INDEX` — one index containing three separate `kind` values: `prime-code`, `wings`, `god99`.
- Every entry has a stable `id`, `ordinal`, localized `labels` (`en`, `id`), a repository source locator (`file`, `section`, `line`), optional corroborating locators/source note, and `authority: 'metadata-only'`.
- `validateEmpireTaxonomyIndex()` rejects invalid kinds, duplicate or cross-kind ids, per-entry authority other than `metadata-only`, forbidden role/permission/agent/identity/binding fields, and gap arithmetic that does not match the evidenced and expected counts.
- `EMPIRE_TAXONOMY_EXPECTED_COUNTS` / `EMPIRE_TAXONOMY_EVIDENCED_COUNTS` / the index's `gaps` keep expected totals, observed entries and missing members distinct.
- `src/index.ts` re-exports the index, counts, validator and types. Existing exports and values are unchanged.

The index is data only. It is not wired into a route, schema, permission check, session, agent registry, UI or runtime manifest.

## 2. Changed files

| File | Change |
|---|---|
| `packages/moonql-unilex/src/data/empire-taxonomy.ts` | New metadata index, validator and type guard |
| `packages/moonql-unilex/src/index.ts` | Re-export the new public index/types/validator |
| `packages/moonql-unilex/test/empire-taxonomy.test.mjs` | New focused positive/negative test (5 cases) |
| `packages/moonql-unilex/package.json` | Add the package `test` script (no dependency change) |
| `docs/audit/M23-04-empire-metadata-index.md` | This evidence record |

No migration, database row, seed-registry value, TODO row, UI or environment file was changed.

## 3. Exact commands and observed results

The package previously had no `test` script in `packages/moonql-unilex/package.json` (only `build`, `dev`, `typecheck`). This task adds the existing root/package convention as a scoped script: Node's test runner with type stripping. No dependency was added.

```text
$ pnpm --filter @moonwitness/moonql-unilex typecheck

> @moonwitness/moonql-unilex@1.0.0 typecheck Z:\project\moonradio\packages\moonql-unilex
> tsc --noEmit
exit 0 — no diagnostics
```

```text
$ pnpm --filter @moonwitness/moonql-unilex test

> @moonwitness/moonql-unilex@1.0.0 test Z:\project\moonradio\packages\moonql-unilex
> node --experimental-strip-types --test test/*.test.mjs

▶ M23-04 — Empire taxonomy metadata index
  ✔ keeps exactly three separate kinds and never merges an entry across kinds (1.4399ms)
  ✔ uses unique stable ids and unique ordinals inside each kind (0.1534ms)
  ✔ is metadata-only and carries no role, permission, agent or identity field (1.5248ms)
  ✔ counts only evidenced entries and documents the unevidenced slots as gaps (0.2167ms)
  ✔ rejects merged and privilege-bearing entries instead of indexing them (1.6755ms)
✔ M23-04 — Empire taxonomy metadata index (6.0201ms)
ℹ tests 5
ℹ suites 1
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 137.4749
exit 0
```

```text
$ pnpm exec eslint packages/moonql-unilex/src/data/empire-taxonomy.ts packages/moonql-unilex/src/index.ts packages/moonql-unilex/test/empire-taxonomy.test.mjs
exit 0 — no findings
```

```text
$ pnpm --filter @moonwitness/moonql-unilex build

> @moonwitness/moonql-unilex@1.0.0 build Z:\project\moonradio\packages\moonql-unilex
> tsc -b
exit 0
```

A one-off scratch typecheck outside the repository confirmed the type surface rejects privilege and merged fields (`@ts-expect-error` directives were consumed, so `tsc` exited 0 only because both assignments are type errors):

```text
$ tsc --noEmit --strict --module nodenext --moduleResolution nodenext --target es2022 \
    --skipLibCheck --allowImportingTsExtensions <temp>/negative.ts
# const withRole: EmpireTaxonomyEntry = { ...base, role: 'angel' }        // rejected
# const mergedKind: EmpireTaxonomyEntry = { ...base, kind: 'prime-code+wings' } // rejected
exit 0 (both errors expected and consumed)
```

## 4. Positive evidence

- Exactly three kinds exist in `EMPIRE_TAXONOMY_INDEX.kinds`: `prime-code`, `wings`, `god99`.
- 22 evidenced entries: 9 Prime Code, 10 WINGS, 3 G.O.D. 99 slot references.
- All 22 ids are unique and namespaced by kind (`PC01`–`PC09`, `W01`–`W10`, `GOD-017`/`GOD-049`/`GOD-050`); no id appears under two kinds.
- Every entry and the index itself carry `authority: 'metadata-only'`.
- The recursive field scan and the per-entry allowed-key assertion find no `role`, `permission`, `agent`, `identity`, credential, office, scope, team, persona, department, unit or lead-slot binding field.
- Gap arithmetic is asserted: Prime Code 9/9/0, WINGS 10/10/0, G.O.D. 99 99/3/96; total unevidenced members = 96.
- Every entry has a document path, section and one-based baseline line number.

## 5. Source locator for every indexed entry

All locators are repository-relative paths at baseline `eb3b9f0`. `MASTER_VISION_NARRATIVE_XV` means `docs/vision/MASTER_VISION_NARRATIVE_XV.md`; ADR-0006/ADR-0007 mean the accepted decision files under `docs/decisions/`.

### Prime Code — `MASTER_VISION_NARRATIVE_XV` §12.1, lines 412–420

| ID | Label (en / id) | Line |
|---|---|---|
| PC01 | Source Integrity / Integritas Sumber | 412 |
| PC02 | Truth & Evidence / Kebenaran & Bukti | 413 |
| PC03 | Human Agency / Agensi Manusia | 414 |
| PC04 | Trust & Responsibility / Kepercayaan & Tanggung Jawab | 415 |
| PC05 | Consultation / Konsultasi | 416 |
| PC06 | Fairness & Justice / Kewajaran & Keadilan | 417 |
| PC07 | Compassion & Protection / Kasih Sayang & Perlindungan | 418 |
| PC08 | Restoration & Renewal / Restorasi & Pembaruan | 419 |
| PC09 | Continuity / Kesinambungan | 420 |

### WINGS — `MASTER_VISION_NARRATIVE_XV` §21A.6 “Ten WINGS names preserved from V10.1”

| ID | Label (en / id) | Primary source | Corroboration |
|---|---|---|---|
| W01 | SKYLINK / SKYLINK | line 900 | ADR-0006, Decision — Name, line 8 |
| W02 | RAINMAKERS / RAINMAKERS | line 898 (ordered list) | ADR-0007, Consequences, line 60 (`W02/GOD-017`) |
| W03 | LAST SIGNAL / LAST SIGNAL | line 898 | — (code positional only) |
| W04 | SOFT LANDING / SOFT LANDING | line 898 | — (code positional only) |
| W05 | QUESTION ZERO / QUESTION ZERO | line 898 | — (code positional only) |
| W06 | DOUBLE CHECK / DOUBLE CHECK | line 898 | — (code positional only) |
| W07 | ECHOLOG / ECHOLOG | line 902 | ADR-0007, Decision — Name, line 14 |
| W08 | LEDGER PUNK / LEDGER PUNK | line 898 | ADR-0007, line 60 (name only, no code) |
| W09 | FIREWALL / FIREWALL | line 898 | — (code positional only) |
| W10 | HAVEN / HAVEN | line 898 | ADR-0007, line 60 (name only, no code) |

### G.O.D. 99 — only evidenced slot references

| ID | Label (en / id) | Primary source | Corroboration |
|---|---|---|---|
| GOD-017 | GOD-017 / GOD-017 | ADR-0007, Consequences, line 60 | — |
| GOD-049 | GOD-049 / GOD-049 | `MASTER_VISION_NARRATIVE_XV` line 900 | ADR-0006, Decision — Name, line 8 |
| GOD-050 | FIELD WITNESS / SAKSI LAPANGAN | `MASTER_VISION_NARRATIVE_XV` line 902 | ADR-0007, Decision — Name, line 14 |

`labels.id` for the English Prime Code table is a display translation, not a source quotation. WINGS and G.O.D. 99 proper names/slot ids are kept as found, except `FIELD WITNESS`, whose Indonesian label is also a display translation.

## 6. Negative evidence

The focused test proves the validator/index type rejects:

1. A `wings` id reused by a `prime-code` entry → `merged across kinds`.
2. A combined discriminator `prime-code+wings` → invalid kind.
3. An entry with `role: 'angel'` → forbidden privilege/agent field.
4. An entry with an unlisted `powers: 'flight'` field → unexpected field.
5. An entry with `proposedLeadPersonaSlot` → forbidden binding field.
6. Per-entry `authority: 'operational'` → not `metadata-only`.
7. A duplicated id inside one kind → duplicate id.
8. A falsified gap (`missing: 0` for GOD99) → gap arithmetic mismatch.
9. An invented 10th Prime Code entry → count mismatch (`9` evidenced required).
10. At type level, `role` and a combined kind are not assignable to `EmpireTaxonomyEntry`.

No test or validator path accepts a merged or privilege-bearing entry.

## 7. Gaps (recorded, not invented)

| Gap | Count | Evidence |
|---|---|---|
| G.O.D. 99 slots other than GOD-017, GOD-049, GOD-050 | 96 | No 99-slot roster is present in this repository. M02-01 describes G.O.D.99 conceptually; the vision document names GOD-049/GOD-050 as WINGS lead slots and ADR-0007 names GOD-017. |
| WINGS unit codes with no individual attestation (W03–W06, W08–W10) | 7 | Only W01, W02 and W07 appear with codes. The other seven codes derive from the ordered V10.1 name list; labels are evidenced, codes are positional. |
| G.O.D. 99 persona labels for GOD-017 and GOD-049 | 2 | Sources give only the slot ids; no persona name is evidenced. GOD-050 has the source label `FIELD WITNESS`. |
| `data/organization/wings10.json` source file | 1 | The sibling Empire repository file is cited by the vision document and ADRs but is not present in this worktree; only those cross-references were used. |

WINGS has no missing member (all ten labels are named). Prime Code has no missing member (all nine principles are named). The index does not pad any taxonomy to its nominal number.

## 8. Rollback

Delete `packages/moonql-unilex/src/data/empire-taxonomy.ts`, delete `packages/moonql-unilex/test/empire-taxonomy.test.mjs`, remove the `empire-taxonomy` re-export block from `packages/moonql-unilex/src/index.ts`, and remove the added `test` script from `packages/moonql-unilex/package.json`. No migration, database row, seed value, TODO state or runtime configuration needs reversal. Rebuild the package if a stale `dist` artifact matters. Preserve all unrelated worktree changes.

## 9. Limitations

- **Metadata only.** The index grants no authority, office, role, permission, agent identity, session or mandate, and creates no programmatic angel/god identity. G.O.D. 99 entries are slot identifiers, not persons or deities.
- **No UI, API, database or permissions integration.** Nothing imports this index for authorization; the re-export is the only package-level surface.
- **Not a complete G.O.D. 99 roster.** 96 slots are a documented gap. Do not treat the indexed three as a representative sample or a canonical subset.
- **WINGS codes are partly inferred** from the ordered list; W01, W02 and W07 are the only individually attested codes.
- **Line numbers are baseline-specific.** Re-locate by section heading after documentation edits.
- **Translations are display labels**, not source-attested terminology.
- The worktree was not clean at baseline; this evidence covers only the files listed above.
