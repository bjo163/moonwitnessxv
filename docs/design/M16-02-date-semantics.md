# M16-02 — Date-slot semantics for the private witness object

- **Milestone**: M16 — Private witness archive and consent lifecycle
- **Task**: M16-02
- **Status**: SPECIFICATION + EXECUTABLE FIXTURES DRAFTED at `dfc6556` — awaiting integrator review; the integrator, not this document, ratifies and checks the TODO leaf
- **Domain**: **D06 Witness** (the TODO row's `D3` is the difficulty column, not a domain ID — see [M16-01 §1.1](../decisions/M16-01-private-witness-object-spec.md))
- **Acceptance**: *Tick-Tock corrected chronology remains exact*
- **Prerequisite**: [M16-01 private witness object specification](../decisions/M16-01-private-witness-object-spec.md), especially §2.3, which declares the four slots and explicitly defers date semantics, precision, timezone and corrected chronology to this task
- **Reference**: [ADR-0003 source rights and consent](../decisions/ADR-0003-source-rights-and-consent.md), [M04-02 migration and rollback](../decisions/M04-02-migration-rollback-plan.md), [BLUEPRINT.md §6](../../BLUEPRINT.md), [TODO](../../TODO.md)
- **Artifact type**: contract + machine-readable fixtures + dependency-free validator. **No schema, table, package, migration, API or UI is created here.**

---

## 1. Scope and non-scope

This document fixes the **meaning, precision, timezone handling and correction semantics of the four date slots** on the private witness object. It is the executable contract that a future D06 implementation must satisfy; it is not that implementation.

**Delivered here:**

1. A definition of `occurredAt`, `observedAt`, `recordedAt` and `writtenAt` for testimony, including when each may be absent.
2. A precision model: `EXACT`, `APPROXIMATE`, `RANGE`, `UNKNOWN`.
3. Timezone rules: IANA zone, UTC normalisation, and retention of the original offset and local wall time.
4. Prohibitions on defaulting, inference, collapse and precision upgrades.
5. An **appended correction** model for the Tick-Tock corrected chronology, with display rules that keep the original visible.
6. Machine-readable valid/invalid fixtures in [docs/data/M16-02-date-semantics.json](../data/M16-02-date-semantics.json) and a validator at [scripts/check-m16-02-date-semantics.mjs](../../scripts/check-m16-02-date-semantics.mjs).

**Explicitly not delivered here** (sibling leaves own them):

| Deferred to | Work |
|---|---|
| **M16-03** | Original immutability at rest, append-only correction lineage persistence, revision chain, byte-overwrite rules, migration under M04-02 |
| M16-04 | Consent and ACL enforcement |
| M16-05 | Redacted public derivative |
| M16-06 | Withdrawal, retention, search/export purge |
| M16-07 | Rendering the corrected/original date presentation in public projections |
| Any table, addon, migration, route or component | none created by this task |

No SQL owner is introduced. The importer set stays `{packages/moonql, packages/skylink-store}` (ADR-0006 boundary); ECHOLOG owns bytes (ADR-0007); D00/ARSY owns identity (ADR-0001).

---

## 2. The four slots

Each witness record carries four **distinct, independently nullable** slots. The names match M16-01 §2.3; the names are a vocabulary contract, not a committed column set.

| Slot | Meaning for testimony | Normally present when | Must stay `UNKNOWN` when |
|---|---|---|---|
| `occurredAt` | The real-world moment at which the witness says the witnessed event happened. This is a **claim by the witness**, never a system-verified historical fact. | The witness states a time, or a document/recorder establishes it. | The witness cannot date the event ("some night in 2019"). |
| `observedAt` | The moment the witness perceived, or reports having perceived, the event. | The witness distinguishes perception from occurrence (e.g. a delayed sighting). | The witness only knows when they wrote or reported it. |
| `recordedAt` | The moment the capture system or a human recorder committed the account into the archive. | An intake or recording event exists. | Intake time is genuinely unknown (legacy paper record with no receipt stamp). |
| `writtenAt` | The moment the testimony text **as it stands** was authored or last transcribed. | The authoring/transcription time is known. | The text is undated and no transcription log exists. |

**Independence rules.**

- No slot is a function of another. `recordedAt` is not `observedAt`; `writtenAt` is not `recordedAt`.
- A record may know `recordedAt` and `writtenAt` while `occurredAt` and `observedAt` are `UNKNOWN`. That is the normal case for a testimony collected long after the event.
- `writtenAt` may legitimately precede `recordedAt`: a pre-existing written account can be captured into the archive later. No ordering is inferred, and this contract does **not** impose the telemetry ordering `occurred ≤ observed ≤ recorded ≤ written` (§8).
- A missing slot stays `UNKNOWN`; it is never filled to make a shape look complete.

---

## 3. Precision

Every slot value carries exactly one precision. A bare timestamp is not a valid slot value; precision is part of the value, not a UI hint.

| Precision | Meaning | Required representation | Forbidden representation |
|---|---|---|---|
| `EXACT` | The witness or capture system asserts a specific instant. | `utc` (RFC 3339 `Z`), `timezone` (IANA), `originalOffset`, `local` wall time. | A timestamp without a zone; a guessed instant. |
| `APPROXIMATE` | A qualified, non-instant description such as "late October 2026" or "the morning after". | A non-empty human `qualifier`. | A UTC instant pretending to be the approximate value; an unqualified guess. |
| `RANGE` | The value is bounded by an earliest and a latest instant. | `earliest` and `latest`, each with the `EXACT` field set; `earliest ≤ latest`. | A single midpoint presented as the value; an unbounded "sometime". |
| `UNKNOWN` | The witness genuinely does not know. | Only `{"precision":"UNKNOWN"}`. | Any timestamp, offset, zone or qualifier field. |

**Precision is never upgraded or downgraded silently.** Correcting an `APPROXIMATE` value to `EXACT` is a new appended correction (§6), not an edit of the original precision. A date-only phrase such as `2026-10-27` is not `EXACT`: a calendar date spans a 24-hour window across zones, so it is `APPROXIMATE` (with the phrase as qualifier) or `RANGE` (with bounds). This is the rule that makes a "timezone-less timestamp presented as exact" a violation.

---

## 4. Timezone rules

1. **IANA zone required for every instant.** `timezone` must be an IANA zone name such as `Asia/Jakarta`, not an abbreviation (`WIB`), a city name alone, or an offset alone. Abbreviations are ambiguous and offsets are not zones.
2. **UTC normalisation.** Every `EXACT` value carries `utc` as RFC 3339 in UTC with a `Z` suffix (`2026-10-27T02:00:00.000Z`). Ordering, interval arithmetic and deduplication use UTC only.
3. **Original offset retained.** `originalOffset` (`+07:00`) records the offset that was in force when the witness or recorder stated the time. It is retained, not discarded after normalisation.
4. **Original local wall time retained.** `local` (`2026-10-27T09:00:00`, no offset suffix) is the wall-clock reading as witnessed. `local` + `originalOffset` must equal `utc`; a mismatch is a violation (`OFFSET_UTC_MISMATCH`).
5. **No silent DST or tzdb rewrite.** The retained offset is evidence of what was witnessed. A future implementation may cross-check it against the IANA database, but it must not silently replace the witnessed offset. Historical tzdb reconciliation is out of scope for M16-02.
6. **A timestamp with no zone or offset is not an instant.** It may be stored only as `APPROXIMATE` (with its phrase as qualifier) or `UNKNOWN`. `EXACT` without a valid IANA zone and offset fails (`TIMEZONE_MISSING`).
7. Display may show local wall time to a human, but any machine comparison, export or search index must use `utc` and must not reinterpret `local` in the server's zone.

---

## 5. Prohibitions: no defaulting, no inference, no collapse

These are hard invariants. Each maps to a violation code in the fixtures.

- **No defaulting.** A missing slot is never filled with `now()`, with `occurredAt`, with a neighbouring slot, or with any plausible value. In particular, `observedAt` is not defaulted to `occurredAt`, `recordedAt` is not defaulted to `observedAt`, and `writtenAt` is not defaulted to `recordedAt`. This is the opposite of the generic `createQuadTime` behaviour documented in §8.
- **No inference.** A recorder who only knows the intake time must not derive `occurredAt` or `observedAt`. A slot value must not carry `inferredFrom` or an equivalent derivation marker; any such marker is a violation (`SLOT_INFERRED`).
- **No collapse.** The four slots are never merged into one `date`, one `singleDate`, one "timestamp" column, or a display that shows only one of them. A collapsed record fails (`CHRONOLOGY_COLLAPSED`).
- **No fabricated precision.** `UNKNOWN` never becomes `APPROXIMATE` merely because a UI needs something to show; `APPROXIMATE` never becomes `EXACT` because a time of day was guessed; a `RANGE` is never rendered as its midpoint.
- **No overwrite.** Corrections are appended (§6). The original four values are never mutated, and a correction is never applied "in place" (`CORRECTION_OVERWRITES_ORIGINAL`).

The fixture set in `docs/data/M16-02-date-semantics.json` contains one invalid example for each of these failure modes, so the prohibition is executable rather than aspirational.

---

## 6. Tick-Tock corrected chronology

"Tick-Tock" is the case where a witness first gives one time (tick) and then, after checking a clock, a document or memory, corrects it (tock). The corrected chronology must remain **exact** without destroying the original.

### 6.1 Append-only correction record

A correction is a new, appended entry. It never writes into the original slot.

| Field | Contract |
|---|---|
| `correctionId` | Stable identifier for the correction, unique within the record. |
| `sequence` | Strictly increasing positive integer, starting at 1. The order of corrections is the order of assertion; a later correction supersedes an earlier correction for the same slot. |
| `targetSlot` | Exactly one of `occurredAt`, `observedAt`, `recordedAt`, `writtenAt`. One correction changes one slot; a multi-slot revision is several appended entries. |
| `corrected` | A full date value with its own precision and timezone discipline (§3, §4). |
| `reason` | Non-empty human-readable reason for the correction. |
| `assertedBy` | Who asserts the correction (witness, recorder, reviewer). Never a fabricated system identity. |
| `assertedAt` | UTC timestamp of the assertion. |
| `appended` | Must be `true`. A correction is an append, not a mutation. |
| `basedOnRevision` | The record revision the correction was made against; lineage persistence is M16-03. |

The original four values are immutable **by contract**. M16-03 owns enforcing immutability at rest, the revision chain and the append-only storage mechanics; M16-02 owns the semantics that enforcement must preserve.

### 6.2 Effective chronology

The effective chronology is derived, never stored in place of the originals:

```
effective[slot] =
  corrected value of the highest-sequence appended correction targeting slot
  if such a correction exists
  else the original slot value
```

The derivation is deterministic and reproducible from the original plus the correction list. The original slot values and the full correction list remain available to every projection.

### 6.3 Tick-Tock example (illustrative, hypothetical)

Original `occurredAt`: `2026-10-27T09:00:00+07:00` = `2026-10-27T02:00:00.000Z`, `EXACT`, `Asia/Jakarta`, offset `+07:00`.
Appended correction 1: target `occurredAt`, corrected `2026-10-27T08:30:00+07:00` = `2026-10-27T01:30:00.000Z`, reason "witness checked a wall clock after the interview".

The corrected chronology is `01:30Z`; the original `02:00Z` is still present and still exact. The record does not hold a merged or averaged value. This is the fixture `V4-corrected-chronology`, whose `expectedEffective` values the validator recomputes from the original plus the appended corrections.

### 6.4 Correction rules

- A correction may target a slot that was `UNKNOWN`; the effective value then becomes known and the original stays `UNKNOWN`.
- A correction may change precision (for example `APPROXIMATE` → `EXACT`), but the corrected value must state its own precision and timezone.
- A correction cannot delete an earlier correction. To supersede it, append a correction with a higher `sequence` for the same slot. Persistence mechanics belong to M16-03.
- A correction cannot change the meaning of a slot or retarget it silently; retargeting requires a new correction naming the other slot.
- A correction must not contain a mutated copy of the original or an `appliedInPlace`/`mutatesOriginal`/`replacesOriginal` marker.

---

## 7. Displaying corrected against original

When a correction exists, every human-facing presentation shows **both** the effective value and the original:

- Effective value first, labelled as corrected, with the correction identifier, sequence and reason.
- Original value next, labelled as the value as originally recorded.
- If the original was `UNKNOWN`, show "originally unknown" rather than inventing an original instant.
- An `APPROXIMATE` value is always shown with its qualifier; a `RANGE` is shown as a range; neither is reduced to a single instant.
- A corrected `EXACT` value displays its local wall time and IANA zone, not a bare UTC string, unless the surface is explicitly a machine/debug view.
- Corrections are never hidden behind a "current value only" display. Hiding the original would make the corrected chronology unverifiable.

The visual and localised rendering of these labels is M16-07's work. This section fixes only what must remain distinguishable; it creates no component.

---

## 8. Divergence from the generic QuadTime telemetry contract

There is a real tension between the four witness slots and the existing generic telemetry type. It is documented here so it is visible rather than hidden.

### 8.1 Existing behaviour

- `packages/core/src/quad-time.ts:14` declares `QuadTime` with four **non-nullable** `string` fields.
- `packages/core/src/quad-time.ts:43` begins `createQuadTime`, and `packages/core/src/quad-time.ts:44`–`46` default missing slots to earlier ones: `observed_at = occurred_at`, `recorded_at = observed_at`, `written_at = recorded_at`.
- `packages/core/src/quad-time.ts:83`–`109` enforces causal ordering `occurred ≤ observed ≤ recorded ≤ written` with a 1-second skew tolerance.
- `packages/types/src/domain/quad-time.ts:4` repeats the non-nullable telemetry shape, describing `written_at` as a Merkle-sealed ledger timestamp.
- `apps/arsy/test/ecosystem-god-tier.test.ts:64` calls `createQuadTime` with only an occurrence time, and `:66` asserts that the serialized header begins `occ=…;obs=…` — i.e. the test **asserts the defaulting**.
- `packages/testing/src/epistemic.ts:6` (`assertQuadTimeMonotonic`) imports the `QuadTime` type and throws on non-monotonic telemetry coordinates (`:16`–`26`).

### 8.2 Which contract governs which object

| Object | Owner / use | Governing contract |
|---|---|---|
| Generic telemetry event / ecosystem ledger coordinate | ARSY ecosystem instrumentation; `createQuadTime`, `calculateTemporalDrift`, `assertQuadTimeMonotonic` | **Existing QuadTime contract**: all four slots present, missing slots defaulted to earlier ones, monotonic ordering enforced. |
| Private witness testimony (`witness_testimony`, D06) | M16 witness archive | **This M16-02 contract**: four independently nullable slots, no defaulting, no inference, no collapse, explicit precision and retained timezone, appended corrections. |

The two objects may share slot *names*, but they are not the same type and must not share a construction path. A witness record must not be passed through `createQuadTime`, and a testimony must not be made non-nullable merely to satisfy a telemetry helper. Conversely, telemetry must not inherit witness nullability or correction semantics without its own reviewed change.

### 8.3 Why this task does not "fix" quad-time.ts

Changing `createQuadTime` would break its documented telemetry semantics and the existing ARSY test that asserts defaulting. M16-02's authorization is a witness date contract, not a change to ecosystem telemetry. The divergence is therefore recorded, and the future D06 implementation must introduce a distinct witness date type rather than reuse `QuadTime`. If the repository ever wants one shared type, that requires an explicit ADR-level decision, not a silent edit here.

---

## 9. Boundary with M16-03 and sibling leaves

- **M16-03** owns *persistence* of immutability and lineage: how the original four values are stored so they cannot be overwritten, how appended corrections are stored and ordered, and the revision chain. M16-02 fixes the semantics those stores must preserve; it does not create the store.
- **M16-04** owns consent and ACL enforcement; date fields are private data and are not exposed by this contract.
- **M16-05** owns the redacted derivative; it may carry a corrected chronology but must still show the original/corrected distinction where the derivative is human-facing.
- **M16-06** owns withdrawal and purge; it may not rewrite the original dates while retaining an audit trail.
- **M16-07** owns localised rendering of the labels; this contract fixes only the semantic distinction.
- No schema, table, addon, migration, API route or UI component is introduced. Any future persistence change follows ADR-0002 and, if destructive, the M04-02 expand → switch → contract lifecycle with a `rollback.sql`.

---

## 10. Executable fixtures and verification

The contract is pinned by [docs/data/M16-02-date-semantics.json](../data/M16-02-date-semantics.json). All identifiers, dates and events in it are **hypothetical and illustrative**; nothing in it is real testimony or a real source.

- **Valid fixtures** cover: four full `EXACT` dates; a record with an `UNKNOWN` occurrence slot; a `RANGE` occurrence slot; an `APPROXIMATE` written slot; and a Tick-Tock corrected chronology with two appended corrections and declared `expectedEffective` values.
- **Invalid fixtures** cover: an inferred slot; a collapsed single date; a correction that overwrites the original; a timezone-less timestamp presented as exact; an offset/UTC mismatch; an approximate value without a qualifier; reversed range bounds; an `UNKNOWN` slot carrying a value; a non-increasing correction sequence; an invalid correction target; a missing slot; and a non-UTC assertion timestamp.
- Declared counts (`total`, `valid`, `invalid`, `by_expected`, `by_violation`) must equal the fixtures actually present.
- Every `INVALID` fixture must produce its declared violation code; every `VALID` fixture must produce none.

Run:

```
node scripts/check-m16-02-date-semantics.mjs
node scripts/check-m16-02-date-semantics.mjs --self-test
```

The validator is dependency-free and does not import application code. It also checks that this document contains the required headings and terms (precision, timezone, appended correction, no defaulting). `--self-test` re-runs mutated copies of the fixtures and must reject every tampered copy.

---

## 11. Limitations and non-claims

- This is a **contract plus fixtures**, not a shipped witness archive. No table, package, migration, API, UI or runtime behaviour exists.
- The fixtures are hypothetical. Passing them proves that the stated invariants are internally consistent and that the invalid examples fail for the declared reasons; it does not prove any D06 code path, because none exists.
- IANA zone validity is checked with the Node.js `Intl` database at run time. This task does not verify that a retained historical offset agrees with the tzdb version in force at the recorded instant; the witnessed offset is retained as evidence and is not silently rewritten.
- Immutability at rest, correction lineage storage and byte-overwrite protection are **M16-03**, not proved here.
- No deployment, service, browser or database evidence is claimed. Configuration and fixtures do not prove shipped behaviour.
- The integrator, not this document, checks the M16-02 TODO leaf.
