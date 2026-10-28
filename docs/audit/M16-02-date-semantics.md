# M16-02 — Date-slot semantics (contract, fixtures and validator evidence)

| Field | Evidence |
|---|---|
| `task_id` | M16-02 |
| `baseline_sha` | `dfc6556` (`dev`), verified at task start with `git rev-parse --short HEAD` → `dfc6556`. HEAD advanced to `e76df8b` during the task because a concurrent session committed M26-02 (`docs(todo): close M26-02 at the separation ledger`); that commit touched only `TODO.md` and M26-02 files, not this task's files. |
| `worker` | Leaf agent, M16 (specification + fixtures) |
| `claimed_files` | `docs/design/M16-02-date-semantics.md`, `docs/data/M16-02-date-semantics.json`, `scripts/check-m16-02-date-semantics.mjs`, `docs/audit/M16-02-date-semantics.md` |
| `actual_changed_files` | Exactly the four files above, all **new**. No existing file was modified or deleted. `packages/core/src/quad-time.ts` and the existing ARSY tests are untouched. |
| `result_sha` | Not applicable — no commit created (task instruction: no `git add`, no commit). Deliverables are untracked at the final observed HEAD `e76df8b`. |
| `reviewer` | Integrator (self-approval not claimed; TODO leaf unchecked) |
| `rollback` | Delete the four files in `claimed_files`. Purely additive documentation plus a standalone script and JSON fixtures; no schema, data, migration or code path depends on them. |
| `artifact type` | Contract + machine-readable fixtures + dependency-free validator. **No schema, table, package, migration, API route, UI component or Docker/CI change was made.** |
| `next_eligible_task` | M16-03 once the integrator accepts this leaf |

## Method

1. Read `AGENTS.md`, the M16-02 TODO row (`TODO.md:400`), the task packet `docs/tasks/M16/M16-02.md`, M16-01 (§2.3, which explicitly defers date semantics, precision, timezone and Tick-Tock corrected chronology to this task), ADR-0003, and M04-02.
2. Inspected the existing temporal code before writing the contract: `packages/core/src/quad-time.ts`, `packages/types/src/domain/quad-time.ts`, `apps/arsy/test/ecosystem-god-tier.test.ts`, and `packages/testing/src/epistemic.ts`.
3. Wrote the semantics contract, the valid/invalid fixture set, and the dependency-free validator. The validator uses inline predicates only and imports no application code.
4. Ran the positive and negative validator commands and recorded the observed output below. No application test, typecheck, Docker command or deployment was run, because no application code changed.

## What the semantics fix

Before this leaf, M16-01 fixed only the *shape*: four distinct, independently nullable slots (`occurredAt`, `observedAt`, `recordedAt`, `writtenAt`) and a prohibition on inference/defaulting/collapse, with semantics deferred. This leaf supplies the missing substance:

- **Slot meaning for testimony.** Occurrence is a witness claim, not a verified fact; observation, capture and authoring are separate moments. A note can legitimately be written before it is captured, so the telemetry ordering `occurred ≤ observed ≤ recorded ≤ written` is not imposed on testimony.
- **Precision.** `EXACT`, `APPROXIMATE`, `RANGE`, `UNKNOWN`; a date-only phrase is not `EXACT`, and an approximate or ranged value is never rendered as an instant or midpoint.
- **Timezone.** `EXACT` values carry a UTC instant, an IANA zone, the original offset and the original local wall time; `local + originalOffset` must reconstruct `utc`. A timestamp with no zone is not an instant.
- **Prohibitions are executable.** No defaulting, no inference, no collapse, no fabricated precision, no overwrite; the invalid fixtures fail for the declared reasons.
- **Tick-Tock corrected chronology.** A correction is an appended entry (sequence, target slot, corrected value, reason, who/when, `appended: true`, based-on revision). The original four values stay intact; the effective chronology is recomputed deterministically. Display must show corrected and original together. Immutability and lineage *persistence* remain M16-03.
- **Acceptance mapping.** Fixture `V4-corrected-chronology` has two appended corrections. The validator recomputes the declared effective UTC values (`occurredAt=2026-10-27T01:30:00.000Z`, `writtenAt=2026-10-27T04:00:00.000Z`) from the untouched originals and confirms the originals remain `02:00:00.000Z` and `03:30:00.000Z`. That is the executable form of *Tick-Tock corrected chronology remains exact* at contract level.

## Quad-time divergence (recorded, not hidden, not changed)

The generic telemetry type and the witness contract genuinely disagree. Exact locations:

| Location | Observed behaviour | Consequence |
|---|---|---|
| `packages/core/src/quad-time.ts:14`–`19` | `QuadTime` declares four **non-nullable** `string` fields. | Cannot represent an unknown witness slot. |
| `packages/core/src/quad-time.ts:43`–`46` | `createQuadTime` defaults missing slots to earlier ones: `observed_at = occurred_at`, `recorded_at = observed_at`, `written_at = recorded_at`. Line 44 is `const obs = observedAt ? toIsoString(observedAt) : occ`; line 45 does the same for `rec`, line 46 for `wri`. | Directly violates M16-01 §2.3 and this contract's no-defaulting rule. |
| `packages/core/src/quad-time.ts:83`–`109` | `validateQuadTimeMonotonicity` enforces `occurred ≤ observed ≤ recorded ≤ written` with 1 s skew. | A testimony written before it was captured would be rejected. |
| `packages/types/src/domain/quad-time.ts:4`–`13` | A second non-nullable `QuadTime`, describing `written_at` as a Merkle-sealed ledger timestamp. | Reinforces that the type is telemetry/ledger, not testimony. |
| `apps/arsy/test/ecosystem-god-tier.test.ts:64`–`66` | Calls `createQuadTime` with only an occurrence time and asserts the serialized header begins `occ=…;obs=…`. | The existing test **asserts the defaulting**, so changing it would break ARSY telemetry semantics. |
| `packages/testing/src/epistemic.ts:1`, `:6`, `:16`–`26` | Imports the telemetry `QuadTime` type and throws on non-monotonic coordinates. | Test helper inherits the telemetry assumptions. |

**Which contract governs which object:**

- **Generic telemetry event / ARSY ecosystem ledger coordinate** → existing `QuadTime` contract: all slots present, defaults to earlier slots, monotonic ordering enforced.
- **Private witness testimony (D06 `witness_testimony`)** → this M16-02 contract: four independently nullable slots, no defaulting/inference/collapse, explicit precision and retained timezone, append-only corrections.

A witness record must not be passed through `createQuadTime`, and telemetry must not inherit witness nullability or correction semantics without its own reviewed change. If the repository ever wants one shared type, that needs an explicit ADR-level decision. M16-02 did **not** edit `quad-time.ts` or the ARSY tests; the divergence is stated in the spec (§8) so it is visible.

## Positive evidence — TODO acceptance *Tick-Tock corrected chronology remains exact*

Contract-level evidence, since no witness archive exists to run against:

```text
$ node scripts/check-m16-02-date-semantics.mjs
PASS fixtures total=17 valid=5 invalid=12
PASS 5 VALID fixtures produced zero violation codes
PASS 12 INVALID fixtures produced their declared violation codes
PASS declared counts and by_violation tallies match the fixtures
PASS Tick-Tock corrected chronology: originals retained, 7 appended corrections, effective occurredAt=2026-10-27T01:30:00.000Z writtenAt=2026-10-27T04:00:00.000Z
PASS spec headings and terms present (precision, timezone, appended correction, no defaulting)
NOTE contract and fixtures only: no witness archive schema, table, API or UI is implemented; M16-03 owns immutable lineage persistence
EXIT=0
```

The fixture set contains 5 valid examples (full dates; unknown slot; range; approximate slot; corrected chronology) and 12 invalid examples (inferred slot, collapsed date, correction overwriting the original, timezone-less exact timestamp, offset/UTC mismatch, missing qualifier, reversed range, unknown-with-value, non-increasing sequence, invalid target, missing slot, non-UTC assertion). Counts are declared and checked.

## Negative evidence — tampered fixtures are rejected

```text
$ node scripts/check-m16-02-date-semantics.mjs --self-test
PASS  tampered: a valid fixture relabelled INVALID is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V1-four-full-exact-dates expected SLOT_INFERRED but produced none
PASS  tampered: an invalid fixture with no expected violation code is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture I1-inferred-observed-slot is INVALID without expected_violation
PASS  tampered: an invalid fixture declaring the wrong violation code is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture I2-collapsed-single-date expected SLOT_INFERRED but produced CHRONOLOGY_COLLAPSED
PASS  tampered: an exact slot with its IANA zone removed is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V1-four-full-exact-dates expected VALID but produced TIMEZONE_MISSING
PASS  tampered: four slots collapsed to one date are rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V1-four-full-exact-dates expected VALID but produced CHRONOLOGY_COLLAPSED,EFFECTIVE_CHRONOLOGY_MISMATCH
PASS  tampered: a slot marked as inferred from another is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V2-unknown-occurrence-slot expected VALID but produced SLOT_INFERRED
PASS  tampered: a correction applied in place is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V4-corrected-chronology expected VALID but produced CORRECTION_OVERWRITES_ORIGINAL
PASS  tampered: a misdeclared fixture total is rejected
      first violation: DECLARED_COUNT_MISMATCH: declared total 18 !== fixtures 17
PASS  tampered: a wrong declared effective chronology is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V4-corrected-chronology expected VALID but produced EFFECTIVE_CHRONOLOGY_MISMATCH
PASS  tampered: a timezone-less exact timestamp is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V1-four-full-exact-dates expected VALID but produced TIMEZONE_MISSING,EFFECTIVE_CHRONOLOGY_MISMATCH
PASS  tampered: reversed range bounds are rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V3-range-occurrence-slot expected VALID but produced RANGE_BOUNDS_INVALID
PASS  tampered: an approximate slot with an empty qualifier is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture V5-approximate-written-slot expected VALID but produced APPROXIMATE_QUALIFIER_MISSING
PASS  tampered: an invalid fixture relabelled VALID is rejected
      first violation: FIXTURE_CONTRACT_INVALID: fixture I2-collapsed-single-date is VALID but declares expected_violation
PASS  tampered: a duplicate fixture id is rejected
      first violation: FIXTURE_CONTRACT_INVALID: duplicate fixture id V1-four-full-exact-dates
PASS  tampered: a missing violation tally entry is rejected
      first violation: DECLARED_COUNT_MISMATCH: by_violation.SLOT_INFERRED undefined !== 1
SELF-TEST PASS: all 15 tampered fixture sets rejected (minimum required: 8)
EXIT=0
```

## Negative evidence — no witness implementation was created

Commands actually run, with observed output at the final tree state:

```text
git rev-parse --abbrev-ref HEAD                              -> dev
git rev-parse --short HEAD (start)                           -> dfc6556
git rev-parse --short HEAD (final)                           -> e76df8b
ls packages | grep -i witness                                -> (no match)
grep -rn "witness_testimonies" --include=*.ts packages apps   -> (no match)
grep -rEn "from '@moonwitness/(moonql-)?witness'" apps packages -> (no match)
grep -c "moonql-witness" apps/arsy/src/addons.ts             -> 0
git status --porcelain -- <the four claimed files>           -> ?? on the three files created before the audit; the audit itself is new and untracked
```

These confirm that the witness archive schema is **not yet implemented**: no D06 package, no model/table, no `wt_` issuance, no addon registration. This task created none. It is therefore a **contract + fixtures**, not a working archive.

## Non-claims

- **No schema, table, API or UI.** The witness archive schema is not implemented; nothing here stores, exposes or renders a witness record. M16-03 owns immutable original enforcement and appended correction lineage persistence.
- **No migration.** No SQL file, drizzle model, `autoSync` change or M04-02 expand/switch/contract step was produced.
- **No package or SQL owner.** The importer set remains `{packages/moonql, packages/skylink-store}`; D06 did not gain a package and SKYLINK/ECHOLOG boundaries were untouched.
- **No runtime or deployment proof.** No service, database, browser or Docker run was performed. Configuration and fixtures do not prove shipped behaviour.
- **No real data.** Every identifier, date and reason in the fixtures is hypothetical and labelled illustrative. No witness testimony, personal data, secret, object key or external source was introduced.
- **No closure.** The integrator checks the M16-02 TODO leaf; this document does not.

## Security, rights and privacy

The deliverables contain no personal data, no testimony text, no credentials, no object keys and no provider material. The fixtures use invented dates and `wt_illustrative_*` identifiers under an explicit hypothetical notice. The contract *constrains* future handling (private slots, no invented instants, retained original values) and references ADR-0003 and M16-01 rather than restating or weakening them. No external fetch was performed.

## Limitations

- IANA zone validity is checked with the Node.js `Intl` database at run time. Historical offset agreement with the tzdb version in force at the recorded instant is not verified; the witnessed offset is retained as evidence and is not silently rewritten.
- The "correction overwrites the original" fixture is detected through explicit contract markers (`appended`, `mutatesOriginal`, `appliedInPlace`, `replacesOriginal`). Enforcing immutability at the storage layer is M16-03, not this validator.
- Effective chronology is recomputed from fixture data, not from a stored witness record; no D06 storage exists.
- The validator checks the four required date-slot invariants and their fixtures. It does not prove consent, ACL, withdrawal, derivative or rendering behaviour — those are M16-04…M16-07.
- Concurrent sessions left unrelated WIP under `apps/cockpit`, `apps/dock`, `apps/headquarters` and `docs/audit/screens`; those files were left untouched. HEAD moved from `dfc6556` to `e76df8b` during the task via the M26-02 commit, which did not touch this task's file set or M16-01.

## Commands and results

| Command | Result |
|---|---|
| `git rev-parse --abbrev-ref HEAD` | `dev` |
| `git rev-parse --short HEAD` (start / final) | `dfc6556` / `e76df8b` |
| `node scripts/check-m16-02-date-semantics.mjs` | exit 0; output above |
| `node scripts/check-m16-02-date-semantics.mjs --self-test` | exit 0; 15/15 tampered sets rejected |
| `ls packages \| grep -i witness` | no match |
| `grep -rn "witness_testimonies" --include=*.ts packages apps` | no match |
| `grep -rEn "from '@moonwitness/(moonql-)?witness'" apps packages` | no match |
| `grep -c "moonql-witness" apps/arsy/src/addons.ts` | `0` |

No `git add`, `git commit`, `git stash`, `git checkout` or `git reset` was run. `TODO.md` was not modified by this task.

## Rollback

Delete the four files listed in `claimed_files`. No table, row, migration, route, component or package was created, so rollback cannot strand data. No other document or code references these files.
