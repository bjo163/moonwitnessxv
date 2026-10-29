# M25-04 — Unit normalization, measurement/calibration and source metadata

**Status: DESIGN CONTRACT DELIVERED — NOT WIRED INTO ANY PRODUCTION UI.**
Base: `cea723cade43e3460e885c37802a1bcbdf080be5` (`dev`), task **M25-04**, priority P3, difficulty D3.
Acceptance: *"No simulated values presented as sensor data"* ([TODO.md:583](../../TODO.md)).
Prerequisites: M25-02 (`packages/moonui/src/claim-type.ts`, committed at `f35f0fb`) and M25-03 (closed at `4b0a872`).
Scope source: [task packet](../tasks/M25/M25-04.md) plus the delegated statement; there is no other packet content.

**Deliverables.**

| File | Purpose |
|---|---|
| `packages/moonui/src/measurement-metadata.ts` | Pure contract: unit table + `normalizeUnit`, `evaluateMeasurementMetadata`, `formatMeasurementLabel`, reason codes, en/id unit labels |
| `packages/moonui/test/measurement-metadata.test.ts` | `node:test` suite: 28 cases (10 positive, 18 refusal/label-withhold) with leak assertions |
| `docs/design/M25-04-measurement-metadata.md` | This specification |
| `docs/audit/M25-04-measurement-metadata.md` | Evidence report: commands, output, reason-code matrix, limits |

## 1. Problem

M25-02 made the claim type explicit for a readout but deliberately left the
fields behind it as opaque strings: `instrumentRef`, `calibrationRef` and
`uncertainty` were *references*, not a measurement schema
([M25-02 §9](M25-02-claim-type-separation.md)). Three gaps remained:

1. **No unit vocabulary.** Any string could sit beside a number. The repository's
   only declared `unit` field is free text with no importer
   (`packages/types/src/domain/patches.ts:10`), and the MoonUI radio display uses
   UI band constants (`kHz`/`MHz`) that are not measurement metadata
   (`packages/moonui/src/client/analog-tuner.tsx:14`, `:25`, `:34`). Nothing
   normalized `°C`, `C`, `celsius` or rejected `M`, `MM`, `hz` or `m/s`.
2. **No calibration or uncertainty requirement.** A value could be claimed as
   physical while stating neither a calibration reference nor an uncertainty —
   the two facts that make a number an instrument reading rather than a bare
   number. No instrument or calibration field exists anywhere in the repository.
3. **No guard between model output and sensor display.** M25-02 refuses a
   `SIMULATION` presented as `MEASUREMENT`, but a producer could still hand a
   simulation value into a measurement-shaped surface that only checks "value +
   unit + time". The acceptance for this task is precisely that gap: a simulated
   value must never be presentable as sensor data.

## 2. Scope and non-goals

In scope: the lexical unit table and normalizer, the measurement acceptance
decision, the rendered label composition with M25-02, en/id display text, tests
and evidence.

Out of scope and deliberately not delivered: any component, route, page,
navigation entry, data fetch, meter, sensor, instrument registry, calibration
workflow or certificate, unit conversion, significant-figure or rounding policy,
uncertainty propagation, database table, API field, migration, manifest change,
`src/index.ts` export, or edit to `claim-type.ts`. No existing source file is
modified. No physical or astronomical value is asserted.

## 3. Unit table

`MEASUREMENT_UNITS` is the complete accepted vocabulary. It is a *lexical*
table: it names a unit, it never converts a value.

| Code (stable ASCII) | Symbol | Accepted input aliases | Quantity | `labelEn` | `labelId` |
|---|---|---|---|---|---|
| `CELSIUS` | `°C` | `°C`, `C`, `celsius` (case-insensitive word) | `TEMPERATURE` | degree Celsius | derajat Celsius |
| `KELVIN` | `K` | `K`, `kelvin` | `TEMPERATURE` | kelvin | kelvin |
| `PERCENT` | `%` | `%`, `percent` | `RATIO` | percent | persen |
| `MILLIMETRE` | `mm` | `mm`, `millimetre`, `millimeter` | `LENGTH` | millimetre | milimeter |
| `METRE` | `m` | `m`, `metre`, `meter` | `LENGTH` | metre | meter |
| `SECOND` | `s` | `s`, `second` | `TIME` | second | detik |
| `HERTZ` | `Hz` | `Hz`, `hertz` | `FREQUENCY` | hertz | hertz |
| `MAGNITUDE` | `mag` | `mag`, `magnitude` | `APPARENT_MAGNITUDE` | astronomical magnitude | magnitudo astronomi |

`magnitude` is the astronomical (apparent) magnitude vocabulary, not a generic
"size". No photometric calibration, passband or zero point is claimed.

### Normalization rules

1. **Trim, then exact symbol, then whole lowercase word.** `  °C  ` normalizes;
   ` Celsius ` normalizes; nothing is substring-matched.
2. **Symbols are case-sensitive.** `K`, `C`, `m`, `s`, `Hz`, `mag`, `°C`, `%`
   and `mm` pass. `k`, `c`, `M`, `S`, `HZ`, `hz` and `MM` do **not**: case-folding
   them would be a guess, because `M` is an SI prefix and `MM`/`mK`/`ms` are
   prefixed or compound forms this contract does not parse.
3. **`C` is accepted as degree Celsius** because the delegated vocabulary lists
   it; it is not accepted as coulomb, and no other one-letter context is
   invented. Where case or prefix makes the reading ambiguous, the unit is
   refused rather than guessed.
4. **No conversion, no prefix arithmetic, no compound units.** `fahrenheit`,
   `°F`, `m/s`, `degC`, `kHz`, `MHz`, `derajat Celsius` and
   `furlong-per-fortnight` are `UNIT_UNKNOWN`. A °C value is **never** converted
   to K here, and a kHz constant is **not** silently relabelled Hz.
5. **Empty means empty.** `undefined`, `null`, `''` and whitespace-only input are
   `UNIT_EMPTY`. A non-string (number, object) is `UNIT_UNKNOWN`.
6. **No echo.** The raw unit string is never returned. A normalized unit is the
   frozen table entry; a refused unit result carries `unit: null` and one code.

## 4. Contract surface

Module: `packages/moonui/src/measurement-metadata.ts`. It imports the M25-02
contract (`evaluateClaimLabel`, `isClaimType`, `CLAIM_TYPE_DISPLAY` and types)
from `./claim-type.js`; that sibling import is its **only** import. There is no
I/O, clock, environment, locale detection or third-party dependency. The module
is **not** re-exported from `packages/moonui/src/index.ts`; the package's public
barrel is unchanged.

```ts
export function normalizeUnit(input: unknown): {
  unit: NormalizedUnit | null
  reason: 'UNIT_EMPTY' | 'UNIT_UNKNOWN' | null
}

export interface MeasurementMetadataInput {
  claimType?: ClaimType | string | null
  value?: number | null
  unit?: string | null
  instrument?: string | null
  calibrationRef?: string | null
  observedAtUtc?: string | null
  source?: string | null
  sourceTrust?: string | null
  uncertainty?: string | null
  algorithmRef?: string | null            // ASTRONOMY
  algorithmInputRefs?: readonly string[] | null // ASTRONOMY
}

export function evaluateMeasurementMetadata(
  input: MeasurementMetadataInput | null | undefined,
): {
  accepted: boolean
  reason: MeasurementReason | null
  normalized: NormalizedMeasurement | null
}

export function formatMeasurementLabel(
  accepted: MeasurementEvaluation | null | undefined,
  locale?: string | null,
): MeasurementLabel
```

`algorithmRef`/`algorithmInputRefs` are optional per-type additions mirroring
the fields M25-02 already requires for `ASTRONOMY`; no new schema is invented.

### Evaluation order and reason codes

The first failing check wins, so a code is deterministic. Reasoning and code:

| # | Check | Code |
|---|---|---|
| 1 | Input is an object | `MEASUREMENT_DESCRIPTOR_INVALID` |
| 2 | `claimType` present | `CLAIM_TYPE_MISSING` |
| 3 | `claimType` one of the four M25-02 types | `CLAIM_TYPE_UNKNOWN` |
| 4 | Claim type is not `SIMULATION` | **`SIMULATED_VALUE_NOT_SENSOR_DATA`** |
| 5 | Claim type is not `STORY` | `CLAIM_TYPE_NOT_PHYSICAL` |
| 6 | Unit present | `UNIT_EMPTY` |
| 7 | Unit in the table | `UNIT_UNKNOWN` |
| 8 | Value is a finite `number` (no string coercion) | `VALUE_NOT_FINITE` |
| 9 | `source` non-empty | `SOURCE_MISSING` |
| 10 | `sourceTrust` absent or exactly `TRUSTED` | `SOURCE_UNTRUSTED` |
| 11 | `PHYSICAL_READING`: `observedAtUtc` present | `TIMESTAMP_MISSING` |
| 12 | Any supplied `observedAtUtc` is a UTC instant | `TIMESTAMP_NOT_UTC` |
| 13 | `PHYSICAL_READING`: `instrument` non-empty | `INSTRUMENT_MISSING` |
| 14 | `PHYSICAL_READING`: `calibrationRef` non-empty | `CALIBRATION_MISSING` |
| 15 | `ASTRONOMY`: `algorithmRef` + at least one input ref | `ASTRONOMY_ALGORITHM_MISSING` |
| 16 | `uncertainty` non-empty | `UNCERTAINTY_MISSING` |
| — | All pass | accepted, `reason: null` |

Codes are fixed ASCII tokens and are never interpolated with input text. A
refused evaluation is frozen with `accepted: false`, `normalized: null` and no
input echo.

**Why `SIMULATED_VALUE_NOT_SENSOR_DATA` precedes the metadata checks.** If a
producer marks a value `SIMULATION` and also supplies a perfect-looking
calibration record, clock, source and uncertainty, the refusal must be about the
*claim*, not about a missing field. Ordering the type refusal first makes a
simulation unpromotable by data completeness. `STORY` is next for the same
reason. The remaining checks then run only for `PHYSICAL_READING` and
`ASTRONOMY`.

**Why an astronomy value can be accepted at all.** The contract is about
measurement metadata, and a computed reference is a legitimate readout when it
carries algorithm, inputs and uncertainty. Acceptance sets
`sensorMeasurement: false`; the label composes the M25-02 astronomy copy ("not an
instrument reading") so an accepted astronomy value is never a physical reading.

## 5. Calibration and uncertainty rules

- **A calibration reference is a reference, not a certificate.** `calibrationRef`
  must be a non-empty opaque string chosen by the producer. This module does not
  verify, date, expire, sign or validate it, and does not model a calibration
  procedure. `CALIBRATION_MISSING` means "no reference was supplied", nothing
  more.
- **Uncertainty is mandatory for both accepted types** and is a string reference
  with a unit, matching the existing `ASTRONOMY_REQUIRES_UNCERTAINTY` rule in
  `claim-type.ts:298-300` and the research vocabulary
  (`packages/moonql-research/src/historical-pilot.ts:118`,
  `epistemicUncertainties: string[]`). This module never computes, propagates or
  rounds an uncertainty; a missing/blank string is `UNCERTAINTY_MISSING`.
- **No tolerance is invented.** No numeric threshold, accuracy class, confidence
  level or significant-figure rule is asserted. Those require a real instrument
  and a real calibration record, neither of which exists in the repository.
- **No range validation.** `PERCENT` does not clamp to 0–100, temperature is not
  range-checked, and magnitude is not range-checked, because a valid range is a
  property of the instrument and quantity, not of the unit token.

## 6. Source metadata requirements

- `source` is mandatory for both accepted types (`SOURCE_MISSING`).
- `sourceTrust` is optional but fail-closed: absent is not treated as trust for
  a physical reading (the other mandatory fields still apply), while any value
  other than `TRUSTED` — including `UNTRUSTED`, an unknown token, or a blank
  string — is `SOURCE_UNTRUSTED` when non-empty. This mirrors M25-02's
  `SOURCE_UNTRUSTED` rule and reuses its vocabulary rather than defining a
  second trust scale.
- The accepted normalized record carries the trimmed `sourceRef` so it travels
  with any export; a refused record carries none.
- `formatMeasurementLabel` re-runs `evaluateClaimLabel` with
  `sourceTrust: 'TRUSTED'` on the normalized references. If that revalidation
  ever fails, the label is withheld with the M25-02 code — the measurement
  contract cannot widen the claim contract.

## 7. Timestamps: UTC only

- A `PHYSICAL_READING` requires `observedAtUtc` (`TIMESTAMP_MISSING`) and it must
  be an ISO-8601 instant with a `Z` suffix (`TIMESTAMP_NOT_UTC`). The pattern is
  the M25-02 UTC rule (`claim-type.ts:190`, `:204-207`), itself consistent with
  `packages/moonql-witness/src/index.ts:21-23`: a local time with a numeric
  offset, a bare date, a date-only string, or a non-string is refused.
- An `ASTRONOMY` reference may omit the observation instant (a computed value is
  not observed), but any instant that is supplied must still be UTC.
- **No wall clock.** The module never calls `Date.now()`, `new Date()` with no
  argument, or any time-zone API. Timestamps are caller-supplied strings and are
  only pattern-checked and passed through. This keeps tests deterministic and
  prevents a "current time" default from manufacturing an observation instant.

## 8. Rendered label (`en`/`id`)

`formatMeasurementLabel(accepted, locale?)` returns the only shape a surface may
render:

```ts
{
  readout: 'RENDERED' | 'WITHHELD'
  text: string | null
  locale: 'en' | 'id'
  localeFallback: boolean
  claimType: ClaimType | null
  claimLabel: string | null
  sourceRef: string | null
  unitSymbol: string | null
  reason: MeasurementReason | ClaimRefusalCode | null
}
```

A rendered label is composed as:

```text
<CLAIM_TYPE> · <localized claim-type text> · <value> <canonical symbol> · <source word> <sourceRef>
```

Example (synthetic fixture): `PHYSICAL_READING · Physical reading — instrument
measurement · 21.4 °C · source instrument:weather-lab-01`.

Rules:

1. **Claim type is text, not colour.** The stable ASCII token is always present;
   the localized copy comes from `CLAIM_TYPE_DISPLAY` (M25-02), so a label can
   never drop "not an instrument reading" for astronomy or "model output" for a
   simulation.
2. **Source and unit always appear on a rendered label.** The unit symbol comes
   from the frozen table, never from the caller's string; a forged `unit.symbol`
   is ignored (the unit is re-derived from its `code`).
3. **The value is formatted with `String(value)`** — no locale number formatting,
   no rounding, no thousands separators, so output is deterministic and not
   locale-dependent. Display rounding is a surface decision, not a contract one.
4. **`id` and `en` only**, per ADR-0005. The canonical stored locale values are
   `en`/`id`; an omitted locale means `en`, and any other value falls back to
   `en` with `localeFallback: true`. No machine translation, no locale inferred
   from IP, header or clock. The source word is localized (`source`/`sumber`);
   unit names ship both labels (`labelEn`/`labelId`).
5. **Withheld labels echo nothing.** When the evaluation is refused, malformed or
   forged, or when claim revalidation fails, `text`, `claimType`, `claimLabel`,
   `sourceRef` and `unitSymbol` are all `null`, and only the stable reason code
   remains. A surface may localize the code's explanation itself; it cannot
   recover the raw value, unit string, source or timestamp from the label.
6. **Forgeries fail closed.** `formatMeasurementLabel` does not trust an
   `accepted: true` object: it re-checks claim type, finite value, unit code,
   source, uncertainty, instrument/calibration/algorithm and timestamp, then
   re-runs `evaluateClaimLabel`. Any deviation becomes `WITHHELD`.

## 9. Mapping to observed repository fields

Searches performed before writing (unit, calibration and uncertainty vocabulary
across `packages/*/src` and `apps/*/src`, `dist/` excluded) are recorded as an
abridged excerpt in [the audit §2](../audit/M25-04-measurement-metadata.md).

| Contract concept | Real observed field or vocabulary | Location | State |
|---|---|---|---|
| `unit` string | `WorldPatchMetric.unit: string`, free text, never normalized | `packages/types/src/domain/patches.ts:10` (interface `:6-11`) | **Declared, unused** — no importer of `WorldPatchMetric` outside its own file |
| UI unit constants | Radio band `unit: 'kHz' \| 'MHz'` display labels | `packages/moonui/src/client/analog-tuner.tsx:14`, `:25`, `:34` | UI constant, not measurement metadata; `kHz`/`MHz` are refused by this table |
| Derived percent | `RateMetric.percent` with `status: 'MEASURED' \| 'NOT_APPLICABLE'` | `packages/moonql-journey/src/real-world-action-metrics.ts:28-31`, `:60-65` | Derived arithmetic ratio; `MEASURED` there means "denominator ≠ 0", **not** a sensor reading |
| Percent/time fields | `illuminationPct`, `siderealHours`, `latencyMs` | `packages/types/src/sentinel/telemetry.ts:27-34`, `:18-25`, `:22` | Dead type; no producer or consumer |
| Minutes / percent helpers | Minutes since UTC midnight; slot percent 0–100 | `packages/core/src/time.ts:18`, `:44` | Implemented schedule helper, not a measurement |
| Sensor observation time | `observed_at: string` (sensor telemetry/ingestion) and `createQuadTime` ISO normalization | `packages/core/src/quad-time.ts:9`, `:16`, `:37-54` | Implemented timestamp normalization; no sensor producer |
| UTC-only rules | `UTC_INSTANT_RE`, `LOCAL_INSTANT_RE`, `OFFSET_RE`, exact-date validation | `packages/moonql-witness/src/index.ts:21-23`, `:45-60` | Implemented for witness dates; this contract mirrors the UTC rule |
| Uncertainty vocabulary | `uncertainty?: string` (astronomy requirement); `epistemicUncertainties: string[]`; uncertainty UI copy en/id | `packages/moonui/src/claim-type.ts:169-170`; `packages/moonql-research/src/historical-pilot.ts:118`, `:250`; `apps/dock/src/lib/provenance-copy.ts:49`, `:183` | String references / prose; no numeric uncertainty model |
| Calibration vocabulary | `confidenceCalibration: int()` research-run quality score; cosmetic S-meter galvanometer ticks "calibrated from S1-S9" | `packages/moonql-research/src/index.ts:507`, `:977`; `packages/moonui/src/client/s-meter.tsx:27`, `:47` | Quality score / UI drawing, **not** an instrument calibration |
| `instrumentRef` / `calibrationRef` | No field anywhere | — | **Absent**; this contract requires a reference string only |
| Source reference | Mandatory actor `sourceRef`, rejected when blank | `packages/moonql-actors/src/index.ts:82-84` | Implemented for actors, not for readouts |
| `en`/`id` display precedent | Frozen epistemic class table; frozen claim-type table | `packages/moonql-research/src/projection-label.ts:128-160`; `packages/moonui/src/claim-type.ts:68-86` | Implemented |
| Honest capability copy | "no measured feed is configured"; "No live telemetry, synchronization, or physical measurements are reported" | `apps/headquarters/src/app/(admin)/page.tsx:231`, `:448` | Present at this baseline |
| Claim-type contract | Four claim types, `evaluateClaimLabel`, refusal codes | `packages/moonui/src/claim-type.ts:53-308` | Implemented at `f35f0fb`; imported, never redefined |

No row supplies an instrument, calibration record, uncertainty value or a
normalized unit today. The contract therefore defines the shape those fields
must take and refuses anything else; it does not retrofit the existing dead
types or UI constants.

## 10. Relationship to M25-02

| M25-02 | M25-04 |
|---|---|
| Four claim types, one source per readout | Adds unit, value, calibration, UTC time and uncertainty requirements |
| `PHYSICAL_READING_REQUIRES_CALIBRATION` / `..._TIMESTAMP` | Adds `CALIBRATION_MISSING` / `TIMESTAMP_MISSING` / `TIMESTAMP_NOT_UTC` at the measurement layer |
| `ASTRONOMY_REQUIRES_ALGORITHM` / `..._UNCERTAINTY` | Adds `ASTRONOMY_ALGORITHM_MISSING` / `UNCERTAINTY_MISSING` and `sensorMeasurement: false` |
| `SIMULATION_REQUIRES_NON_MEASUREMENT_LABEL` | Adds `SIMULATED_VALUE_NOT_SENSOR_DATA`: a simulation is refused as sensor data before metadata |
| `STORY_PRESENTED_AS_MEASUREMENT` | Adds `CLAIM_TYPE_NOT_PHYSICAL` for a story value entering a measurement surface |
| `sourceRef` + `sourceTrust` | Required again, with `SOURCE_MISSING` / `SOURCE_UNTRUSTED` |
| `evaluateClaimLabel` | Imported and re-run inside `formatMeasurementLabel`; never duplicated |

The two modules are layers, not alternatives: M25-04 decides whether a value may
be a measurement at all; M25-02 decides how a readout is claimed. Neither may be
used to relabel the other's records. This module defines no claim type and no
fifth category.

## 11. Explicit non-claims

This document and module do **not** claim that:

- any instrument, sensor, meter, calibration record or calibration certificate
  exists, is valid, is current, or was performed;
- any physical or astronomical value, uncertainty, tolerance, accuracy class or
  significant-figure rule is correct, verified, or derived from a real source;
- unit normalization is unit conversion (no °C↔K conversion, no kHz→Hz scaling,
  no compound-unit algebra);
- `PERCENT` or `MAGNITUDE` values are range-valid or photometrically calibrated;
- an `ASTRONOMY` value is an ephemeris, observation or prediction validated here;
- `accepted: true` is a truth verdict, a quality score, a review approval or a
  publication decision;
- the contract is integrated into any shipped UI, route, API or database schema;
- the eight-unit table covers every unit the project may ever need.

## 12. Verification and rollback

Tests: `packages/moonui/test/measurement-metadata.test.ts` (28 cases: 10
positive, 18 refusal/label-withhold). Commands and verbatim output are in
`docs/audit/M25-04-measurement-metadata.md` §4.

Rollback: delete the two code files and the two M25-04 documents. `dist/`
artifacts are gitignored (`.gitignore:11`) and regenerated by `tsc -b`. No
manifest, TODO, tsconfig, barrel, route, schema or existing source file is
touched.
