# M36-02: Calibration Units and Timestamp Provenance Specification

**Task:** M36-02 — Specify calibration units and timestamp provenance
**Milestone:** [M36 — HELIOGRID measured read-only energy pilot](../milestones/M36.md) · [packet](../tasks/M36/M36-02.md)
**Role:** EXECUTABLE LEAF (specification artifact)
**Priority / Difficulty:** P3 / D2
**Prerequisite:** M36-01 — **open and BLOCKED** (see §1.1). This leaf is authored *despite* that,
because a units-and-provenance contract is exactly the artifact a real site visit needs before
hardware is chosen; it does not unblock M36-01 and claims no site evidence.
**Baseline:** `dev` HEAD `700dd27` (M32-05) at authoring
**Status:** BASELINE ESTABLISHED — specification and acceptance recipes only. No code was changed, no
meter exists, no measurement was taken, nothing was deployed.
**Data:** every device serial, certificate id, offset, drift figure, kWh value and technician is synthetic.

## 1. Problem Statement

### 1.1 Grounded starting state

| source | observed fact |
|---|---|
| [BLUEPRINT.md:101](../../BLUEPRINT.md) | HELIOGRID is "Conditional `apps/heliogrid` … Read-only energy site/meters, PV, battery/UPS/maintenance analytics … Proposed **only after** measured pilot; not an energy generator" |
| [BLUEPRINT.md:110](../../BLUEPRINT.md) | "HELIOGRID pilot must start with verified read-only meters, units, calibration and technician permission; **simulations never masquerade as measured generation/savings**." D17 physical Energy & Assets is **proposed, not globally accepted** |
| [TODO.md:774](../../TODO.md) M36-01 | **BLOCKED**: "no approved meter site, technician, hardware, calibration authority or installation consent exists; M25-03 established that HELIOGRID has no device, meter or kWh field" |
| `ls apps` at baseline | aigateway, arsy, dock, echolog, empire-web, headquarters, lumen-runtime, orbit, sentinel, skylink — **no `heliogrid`** |
| [packages/moonui/src/measurement-metadata.ts:66-75](../../packages/moonui/src/measurement-metadata.ts) | an implemented, tested canonical unit table exists: `CELSIUS, KELVIN, PERCENT, MILLIMETRE, METRE, SECOND, HERTZ, MAGNITUDE` |
| same, `:212-229` | 16 stable refusal reasons already exist, including `CALIBRATION_MISSING`, `INSTRUMENT_MISSING`, `TIMESTAMP_MISSING`, `TIMESTAMP_NOT_UTC`, `SIMULATED_VALUE_NOT_SENSOR_DATA`, `SOURCE_UNTRUSTED`, `UNCERTAINTY_MISSING` |
| same, `:237` | `UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/` — the accepted timestamp grammar |
| same, `:252-257` | `instrument`, `calibrationRef`, `observedAtUtc` are per-type fields; `calibrationRef` is documented as "a reference, not a certificate" |
| [M25-01 §3](M25-01-mtime-antikythera-audit.md) | four separated time vocabularies in shipped code (persistence UTC, schedule grid UTC-minutes, narrative labels, celestial derived display), "no local-time value is persisted" |
| [M25-04 §2](M25-04-measurement-metadata.md) | "there is **no instrument or calibration field anywhere**" before M25-04; the `confidenceCalibration` hits are a research-run score, not instrument calibration |

So the repository already has the right **shape** for a measured reading and already refuses a
physical reading without calibration, instrument, or UTC timestamp. What it does not have is any of the
three things an energy pilot needs: **energy units, a calibration record contract behind
`calibrationRef`, or a provenance model for which clock produced `observedAtUtc`.**

### 1.2 The three gaps this leaf closes on paper

| gap | why it matters for a read-only energy pilot |
|---|---|
| G-A units | the current table cannot express `kWh`, `W`, `V`, `A` — so a meter reading is either refused as `UNIT_UNKNOWN` or, worse, smuggled in as `PERCENT`/`SECOND` by an eager producer |
| G-B calibration | `calibrationRef` is an opaque producer string. "Verified meters" per BLUEPRINT:110 requires a record with authority, method, reference standard, dates and an uncertainty budget, and a defined consequence when that record is missing or expired |
| G-C provenance | `observedAtUtc` is one instant, but a telemetry chain has at least three clocks (instrument, gateway, ingest). Without stating which clock produced the value, and how far off it is, a "1 s sample" and a "4-minute-late backfill" look identical to the analytics layer |

### 1.3 Explicitly out of scope

| out of scope | why |
|---|---|
| Any **actuation** — switching loads, injecting, controlling an inverter, changing battery setpoints | HELIOGRID is read-only by BLUEPRINT mandate; this leaf does not design, hint at, or leave a door for control (§7.6) |
| Physical work: installing, wiring, CT-clamping, meter commissioning | M36-01, needs a real site, technician, consent, safety review |
| Choosing a calibration laboratory or standard | M36-01 lists "calibration authority" as missing; that is a human/commercial decision |
| D17 ownership and data boundary | M36-03 |
| Dashboard, cost model, failure UX | M36-04 |
| Safety/feasibility gate sign-off | M36-05 |
| Mains-quality compliance measurement (e.g. IEC 61000-4-30 class) | deferred; this spec measures *for analytics*, not for statutory reporting, and says so |
| Tariff/billing accuracy | deferred; billing requires legal-metrology status this pilot does not claim |

## 2. G-A: Calibration Units

### 2.1 Additive unit set (proposal, not applied)

The existing table's design rules are preserved verbatim: stable ASCII codes, canonical exact-case
symbols, whole-lowercase spelled words, **no conversion, no prefix parsing, no guessing**
([measurement-metadata.ts:162-169](../../packages/moonui/src/measurement-metadata.ts)).

| proposed code | symbol | quantity | `labelEn` | `labelId` | note |
|---|---|---|---|---|---|
| `WATT` | `W` | POWER | watt | watt | instantaneous |
| `KILOWATT` | `kW` | POWER | kilowatt | kilowatt | **see §2.2 — a prefixed symbol is a deliberate exception** |
| `VOLT` | `V` | ELECTRIC_POTENTIAL_DIFFERENCE | volt | volt | |
| `AMPERE` | `A` | ELECTRIC_CURRENT | ampere | ampere | |
| `WATT_HOUR` | `Wh` | ENERGY | watt hour | watt-jam | |
| `KILOWATT_HOUR` | `kWh` | ENERGY | kilowatt hour | kilowatt-jam | the pilot's primary quantity |
| `WATT_HOUR_PER_SQUARE_METRE` | `Wh/m²` | IRRADUATION_ENERGY | watt hour per square metre | watt-jam per meter persegi | PV irradiation; compound symbol matched exactly, never parsed |
| `DECIBEL` | `dB` | LEVEL | decibel | desibel | inverter/UPS acoustic or gain level, optional |
| `MINUTE` | `min` | TIME | minute | menit | UPS autonomy, maintenance intervals |
| `HOUR` | `h` | TIME | hour | jam | battery duration |
| `DAY` | `d` | TIME | day | hari | maintenance windows |

New quantity names: `POWER`, `ELECTRIC_POTENTIAL_DIFFERENCE`, `ELECTRIC_CURRENT`, `ENERGY`,
`IRRADUATION_ENERGY`, `LEVEL`.

### 2.2 Two rules that must be decided, not assumed

**Rule 1 — prefixes are enumerated, never parsed.**
The existing table refuses `kHz` and `MHz` because parsing prefixes would be a guess. Energy cannot
work that way: `kWh` is the canonical commercial unit, and `Wh`/`MWh` appear in real meter output. The
resolution is *enumeration*: `WATT_HOUR`, `KILOWATT_HOUR` are two distinct codes with two distinct
symbols, and `MWh` is **not** accepted at pilot scale — a producer sending `MWh` gets
`UNIT_UNKNOWN` and must send `kWh` with the value scaled by a human-authored, recorded conversion. This
keeps the "no arithmetic on units inside the label path" property while admitting the units the domain
actually uses. `kW` is accepted for the same reason; `MW` is not.

**Rule 2 — `%` stays dimensionless.**
State of charge, inverter efficiency and availability are all ratios, and `PERCENT` already exists. The
spec forbids using `PERCENT` for anything that is really an energy or power quantity, which is the most
likely way a battery dashboard gets a dimensionally wrong number.

### 2.3 Calibration record behind `calibrationRef`

`calibrationRef` remains an opaque reference in the label path (the module must stay dependency-free —
[design decision 2 in M25-04 §3](M25-04-measurement-metadata.md)). What this leaf adds is the contract
for whatever that reference points at:

```
CalibrationRecord {
  recordId            string     'cal_' + opaque, never derived from the serial
  instrumentId        string     matches the reading's `instrument`
  calibrationAuthority {
    organisation      string     e.g. 'accredited lab X' (synthetic)
    accreditationId   string | null   null ⇒ trustTier ≤ FIELD
    scopeReference    string     scope of the accreditation covering this quantity
  }
  method              enum { LABORATORY, FIELD_COMPARISON, MANUFACTURER_DECLARED, NONE }
  referenceStandard   string     the artefact or upstream standard used
  appliedAtUtc        string     UTC_INSTANT grammar
  dueAtUtc            string     UTC_INSTANT grammar; MUST be after appliedAtUtc
  tolerance           string     stated with unit, e.g. '±0.5 % of reading' (synthetic)
  uncertaintyBudget   [{ component, kind A|B, value, unit }]   ≥1 entry for LABORATORY
  asFoundValues       [{ setpoint, indicated, error, unit }]   ≥2 points for LABORATORY
  asLeftValues        [{ setpoint, indicated, error, unit }]   ≥2 points for LABORATORY
  technicianPseudonym string     never a real name in a surface or log (§6.3)
  certificateDigest   string     sha256 of the canonical record JSON, lowercase hex
  supersedes          string | null   previous recordId, forming a chain
}
```

Trust tiers, derived mechanically from the record rather than asserted by the producer:

| tier | condition | may render as | may feed analytics |
|---|---|---|---|
| `METROLOGY` | `method = LABORATORY`, accreditation present, `asFound` ≥ 2 points, uncertainty budget present, not expired | "calibrated measurement (laboratory)" | yes |
| `CALIBRATED` | `method = FIELD_COMPARISON` or manufacturer-declared with reference standard, not expired | "calibrated measurement (field)" | yes |
| `FIELD` | no accredited authority, self-declared tolerance, not expired | "in-field indication, uncalibrated" | yes, flagged |
| `UNCALIBRATED` | no record, or record expired | **withheld** from any measured-claim surface | no |
| `SIMULATED` | claim type is `SIMULATION` | never presented as measured; distinct label | separately, clearly |

`UNCALIBRATED` maps directly onto the already-existing `CALIBRATION_MISSING` refusal, so the tiering is
an extension of current behaviour, not a new vocabulary.

**Expiry is mechanical.** `dueAtUtc < now()` ⇒ the record is `UNCALIBRATED` from that instant onward
for *new* readings. Historical readings keep the tier they had when accepted, recorded as
`tierAtAccept`; silently re-grading old data is how a fleet looks suddenly worse for no physical
reason.

### 2.4 Uncertainty propagation (bounded, not aspirational)

Analytical surfaces may show at most this much arithmetic on uncertainty, and only these forms:

| case | rule |
|---|---|
| sum of two readings of the same quantity, both `METROLOGY` | `u_total = sqrt(u1² + u2²)`; displayed as one value with its combined bound |
| difference (e.g. generation minus export) | same root-sum-square; **never** presented as a "saving" without the combined bound |
| mean of N samples | bound = the instrument tolerance; sample scatter may be shown as a separate statistic, not folded into the instrument bound |
| any product of a `FIELD` reading and a constant | result is `FIELD` at best, and the label must say the result is derived |
| mixing `METROLOGY` and `FIELD` | result takes the **weaker** tier; the stronger tier never propagates by proximity |
| anything else | no derived figure is rendered; show the raw inputs |

The weaker-tier-wins rule is the one that prevents an aggregate of mostly-uncalibrated plug loads from
being captioned as a calibrated measurement because it was summed with one good meter.

## 3. G-B: Reading Acceptance Rules

Built on the existing reasons, with the energy-specific decisions named rather than buried:

| # | rule | existing reason reused | new? |
|---|---|---|---|
| R-1 | `SIMULATION` is refused before unit/value/calibration checks, so complete-looking metadata cannot promote model output to sensor data | `SIMULATED_VALUE_NOT_SENSOR_DATA` | reused, order preserved |
| R-2 | a physical reading with no `instrument` is refused | `INSTRUMENT_MISSING` | reused |
| R-3 | a physical reading whose `calibrationRef` resolves to no record, or to an expired one, is refused for measured surfaces | `CALIBRATION_MISSING` | reused, tier rule new |
| R-4 | `observedAtUtc` must match `UTC_INSTANT`; any offset form (`+07:00`) is refused, not converted | `TIMESTAMP_NOT_UTC` | reused |
| R-5 | a missing timestamp is refused | `TIMESTAMP_MISSING` | reused |
| R-6 | non-finite values are refused (no coercion of numeric strings) | `VALUE_NOT_FINITE` | reused |
| R-7 | a unit outside the enumerated table is refused, never guessed | `UNIT_UNKNOWN` | reused |
| R-8 | an unknown/prefixed-but-unenumerated unit such as `MWh`, `µs`, `°F` is refused | `UNIT_UNKNOWN` | new instances of the same code |
| R-9 | a `PERCENT` reading for a quantity that is dimensionally energy or power is refused | — | new reason `QUANTITY_DIMENSION_MISMATCH` |
| R-10 | a reading whose provenance (§4) cannot name which clock produced it is refused for measured surfaces | — | new reason `PROVENANCE_MISSING` |
| R-11 | a reading with `sourceTrust ≠ TRUSTED` is withheld | `SOURCE_UNTRUSTED` | reused |
| R-12 | no withheld path echoes value, unit, source or timestamp | documented module behaviour | reused |

R-9 and R-10 are the only two additions. Every refusal stays a stable ASCII code that is never
interpolated with input text, which is what keeps refusals from leaking data.

## 4. G-C: Timestamp Provenance

### 4.1 The three-clock problem

```
instrument clock        gateway/collector clock        ingest (server) clock
  │ t_instr                 │ t_collect                  │ t_ingest
  ├ sample every 1 s        ├ batch every 30 s           ├ append to store
  └────────────────────────>└───────────────────────────>└
   offset δ1 (est.)          offset δ2 (est.)             NTP-served, stratum 2 (synthetic)
```

For a read-only pilot, the *displayed* instant is `observedAtUtc` and must be defined exactly once:

> **P-1.** `observedAtUtc` is the instrument-side sample instant, expressed in UTC, as *corrected to
> the reference clock using the offset estimate that was current at collection time*. It is not the
> gateway time and never the ingest time.

Consequences: the analytics layer can difference two samples meaningfully; a 4-minute backfill is
obviously a backfill because its *ingest* fields differ while its `observedAtUtc` is honest; and no
surface can accidentally present "when we received it" as "when it happened".

### 4.2 Provenance record

```
ReadingProvenance {
  readingId           string
  clockSource         enum { INSTRUMENT, GATEWAY, INGEST }     required; INSTRUMENT for measured
  instrumentClockKind enum { GPS Disciplined, NTP, LOCAL_RTC, UNKNOWN }
  referenceSource     string        e.g. 'gps:pps', 'ntp:pool.example (synthetic)', 'none'
  stratum             integer | null
  offsetEstimateMs    number        signed estimate at collection time
  offsetUncertaintyMs number ≥ 0    1-sigma style bound, never presented as an error bar it cannot support
  driftRatePpm        number | null last-measured drift, with its own measurement date
  lastSyncAtUtc       string | null UTC_INSTANT
  collectedAtUtc      string        UTC_INSTANT
  ingestedAtUtc       string        UTC_INSTANT
  monotonicSeq        integer       per-instrument, strictly increasing, gaps detectable
  backfill            boolean       true when ingestedAtUtc − collectedAtUtc > 120 s
  gapBeforeMs         number | null expected interval minus observed interval
  integrityDigest     string        sha256 over (instrumentId, monotonicSeq, observedAtUtc, value, unit)
}
```

### 4.3 Clock quality ladder

| kind | `offsetUncertaintyMs` expectation | may support | may not support |
|---|---|---|---|
| `GPS Disciplined` | ≤ 10 ms (synthetic target) | 1 s interval analytics, event correlation, demand coincidence | sub-10 ms claims |
| `NTP` | ≤ 100 ms | 1 s analytics with stated bound, 30 s rollups | per-second accuracy claims; grid-sync event ordering |
| `LOCAL_RTC` | unbounded; drift typically minutes/month (synthetic) | 60 s rollups with explicit caveat, daily totals | any sub-minute claim, any correlation with another site |
| `UNKNOWN` | — | nothing; reading is refused for measured surfaces | everything |

The ladder is the reason `PROVENANCE_MISSING` exists: an interval-based claim (demand peak, coincidence
factor, self-consumption per second) inherits the *worst* clock in its inputs, exactly as uncertainty
inherits the weaker tier in §2.4.

### 4.4 Sequence, gaps, and replay

| signal | detection | required surface behaviour |
|---|---|---|
| gap | `gapBeforeMs > 1.5 × nominal interval` | chart shows an explicit break, not an interpolation; the gap is a counted state (M36-04) |
| duplicate | `integrityDigest` already seen for `(instrumentId, monotonicSeq)` | idempotent append; the replay returns the original id, no double count |
| out-of-order | `monotonicSeq` decreasing for the same instrument | accepted with a flag if `observedAtUtc` is honest; never silently reordered |
| clock step | `|offsetEstimateMs|` jumps > 10× prior estimate | reading re-labelled with the post-step bound; the step itself is an event |
| time travelling backwards | `observedAtUtc` earlier than the previous accepted sample by more than the step tolerance | refuse; `TIMESTAMP_NOT_UTC` is *not* reused here — new reason `PROVENANCE_NON_MONOTONIC` |
| future stamp | `observedAtUtc > ingestedAtUtc + 2 s` | refuse `PROVENANCE_FUTURE_STAMP` (prevents a wrong instrument clock from inventing data) |

Replay protection matters for the pilot's credibility: a gateway that resends a batch after a network
outage is the single most common way a naive energy dashboard double-counts a day.

## 5. Interface Contract (no code written)

The shape below is what a future `heliogrid` producer must satisfy. It intentionally keeps the existing
module's dependency-free property — resolution of `calibrationRef` and provenance happen **outside**
`packages/moonui`, and the label path receives already-resolved tier and bound values.

```
MeasuredReadingInput {
  claimType        'PHYSICAL_READING' | 'SIMULATION'    required
  value            finite number                        required
  unit             enumerated symbol or whole word      required
  instrument       opaque instrumentId                  required for PHYSICAL_READING
  calibrationRef   opaque recordId                      required for PHYSICAL_READING
  observedAtUtc    UTC_INSTANT                          required for PHYSICAL_READING
  source           opaque sourceRef                     required
  sourceTrust      'TRUSTED' | anything-else            required
  uncertainty      stated with unit                     required (existing rule)
  provenance       ReadingProvenance (§4.2)             required for PHYSICAL_READING
}

ResolvedEvaluation {                       # produced by the resolver, consumed by the label path
  accepted            boolean
  reason              stable ASCII code | null
  calibrationTier     METROLOGY|CALIBRATED|FIELD|UNCALIBRATED|SIMULATED|NONE
  clockQuality        GPS_DISCIPLINED|NTP|LOCAL_RTC|UNKNOWN|NONE
  combinedBoundMs     number | null
  presentationClass   'MEASURED' | 'SIMULATED' | 'DERIVED' | 'WITHHELD'
}
```

`presentationClass` is the load-bearing field. A surface that renders `SIMULATED` with the same
typography and caption as `MEASURED` violates BLUEPRINT:110 regardless of what the resolver said.

## 6. Safety, Rights and Privacy

### 6.1 Read-only is a hard property, not a phase

| allowed | not allowed, ever, in this milestone chain |
|---|---|
| passive CT clamp on a service conductor | any connection to a control circuit |
| Modbus/TCP or vendor API **reads** | any write/register command, `COIL WRITE`, setpoint change |
| manufacturer registers read-only mapped by an allowlist | arbitrary register writes, firmware push |
| local buffering for backfill | remote actuation via any path |

Every one of those "not allowed" entries must be enforced by construction, not by convention: the
future collector exposes **no write method at all**, so a bug cannot cause actuation. M36-05 is the
gate that verifies this claim rather than repeating it (see §9).

### 6.2 Electrical safety preconditions (belong to M36-01, restated because they constrain units)

Working on or near a service panel to install a CT is qualified-technician work. Nothing in this
specification authorises it, and no reading plan may be executed on a site without M36-01's site
approval, technician permission and safety review. The only reason this appears in a units document is
that "which measurement category / installation category the meter is" determines which accuracy class
and therefore which tolerance statement is honest.

### 6.3 Personnel and site privacy

- `technicianPseudonym` only, never a name, in records, logs, and surfaces.
- Site identifiers are opaque; a surface may show a human label chosen by the site owner, never a
  postal address.
- Consumption data at 1-second resolution is reconstructable into appliance-level behaviour. Retention
  therefore keeps full-resolution data for a short window (synthetic proposal: 7 days) and
  down-sampled aggregates (1-minute, then 15-minute, then hourly) for longer horizons. This is stated
  now because M36-04's cost dashboard otherwise has an incentive to keep everything.
- No personal data of household members is collected; the pilot measures conductors, not people.

## 7. Risk Assessment

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | unit table extension breaks the closed-set expectations of existing tests | medium | medium | additive change with a reviewed diff; §8 lists the exact existing suites to re-run; this leaf writes no code |
| R-2 | `kWh` accepted but `MWh` refused looks arbitrary | medium | low | §2.2 rule 1 states the enumeration rationale and the human-authored scaled conversion |
| R-3 | an expired calibration silently re-grades historical data | medium | high | `tierAtAccept` frozen per §2.3 |
| R-4 | gateway time used as sample time, corrupting intervals | high | high | P-1 definition + `PROVENANCE_MISSING` refusal + §4.2 three explicit clock fields |
| R-5 | replayed batch double-counts energy | high | medium | `integrityDigest` + `monotonicSeq` idempotency (§4.4, N-9) |
| R-6 | a `FIELD` aggregate captioned as calibrated | medium | high | weaker-tier-wins (§2.4) + `presentationClass` |
| R-7 | simulation rendered as measurement | medium | severe | R-1 order preserved; `presentationClass='SIMULATED'` with distinct copy; M36-05 gate |
| R-8 | 1-second retention becomes surveillance-grade detail | medium | high | §6.3 down-sampling schedule |
| R-9 | write-capable collector shipped "just for diagnostics" | low | severe | no-write-by-construction (§6.1), verified not asserted at M36-05 |
| R-10 | sub-second claims from an NTP-class clock | medium | medium | clock quality ladder forbids claims above its row |
| R-11 | this spec read as M36-01 being unblocked | medium | medium | §1.1 states M36-01 is BLOCKED; nothing here supplies a site, technician, authority or consent |
| R-12 | D17 rename invalidates ids | low | low | rules are expressed against behaviours and the existing module, not against D17 |

## 8. Acceptance Criteria

### 8.1 Positive test — a calibrated measured reading accepted and correctly labelled

Runnable only once the module is extended and a collector exists; **not executed at baseline**.

```bash
# synthetic instrument/certificate; would live in the moonui suite once extended
pnpm --filter @moonwitness/moonui test
```

| # | assertion |
|---|---|
| P-1 | `unit='kWh'` normalizes to `KILOWATT_HOUR`, symbol `kWh`, quantity `ENERGY`; `unit='kilowatt hour'` maps to the same code |
| P-2 | a `PHYSICAL_READING` with a non-expired `LABORATORY` record (accreditation + 2 `asFound` points + uncertainty budget) resolves to tier `METROLOGY`, `presentationClass='MEASURED'`, `sensorMeasurement=true` |
| P-3 | `observedAtUtc='2026-10-31T04:15:00Z'` with `clockSource='INSTRUMENT'`, `GPS Disciplined`, `offsetUncertaintyMs=8` is accepted and `combinedBoundMs` reported as 8 |
| P-4 | the rendered label states the calibration tier and the bound; it does not claim accuracy better than the tier allows |
| P-5 | `monotonicSeq` gap of 4× nominal interval produces `gapBeforeMs` and a break marker rather than an interpolated line |
| P-6 | a reading with identical `(instrumentId, monotonicSeq, integrityDigest)` replayed returns the original id and stores one row |

Observed result at authoring: **not run against new assertions** — the proposed unit codes do not exist
in the table yet ([measurement-metadata.ts:66-75](../../packages/moonui/src/measurement-metadata.ts)).
The existing suites were not re-executed by this leaf because it changed no source file.

### 8.2 Negative tests — the HELIOGRID pair the packet demands

The packet requires "calibrated-measurement versus simulation and no physical actuation". Both are
covered, and each refusal is asserted to leak nothing.

| # | scenario | expected safe failure |
|---|---|---|
| N-1 | `claimType='SIMULATION'` with full units, instrument, calibration, UTC stamp and a 30-day synthetic "saving" claim | refused `SIMULATED_VALUE_NOT_SENSOR_DATA` **before** any other check; no value/unit/source/timestamp echoed; `presentationClass='SIMULATED'` if surfaced at all — this is the "simulation never masquerades as measured generation/savings" rule of BLUEPRINT:110 |
| N-2 | `PHYSICAL_READING` with `calibrationRef` pointing at no record | refused `CALIBRATION_MISSING`; withheld from measured surfaces |
| N-3 | record exists but `dueAtUtc` was yesterday | refused for new readings; historical readings keep `tierAtAccept` |
| N-4 | `unit='MWh'` | refused `UNIT_UNKNOWN` (not enumerated); no implicit scaling happens |
| N-5 | `unit='°F'`, `'kW '` (trailing space), `'KWH'` | refused `UNIT_UNKNOWN`; case and exactness preserved |
| N-6 | `unit='%'` on a quantity that is energy | refused `QUANTITY_DIMENSION_MISMATCH` (R-9) |
| N-7 | `observedAtUtc='2026-10-31T11:15:00+07:00'` | refused `TIMESTAMP_NOT_UTC`, never auto-converted |
| N-8 | missing provenance on a physical reading | refused `PROVENANCE_MISSING` (R-10) |
| N-9 | gateway resends a whole batch after an outage | one row per sample; duplicates counted, never summed into energy totals |
| N-10 | instrument clock stepped 3 minutes during capture | step recorded as an event; affected readings re-labelled with the post-step bound; the pre-step period is not silently smoothed |
| N-11 | `observedAtUtc` 10 minutes in the future relative to ingest | refused `PROVENANCE_FUTURE_STAMP` |
| N-12 | `LOCAL_RTC` clock with 2-minute estimated offset used for a per-second demand peak | refused: the claim exceeds what the row in §4.3 permits |
| N-13 | aggregate of one `METROLOGY` meter and twelve `FIELD` plugs captioned "calibrated measurement" | refused; weaker tier wins (§2.4) |
| N-14 | any collector API method that writes a register, sets a threshold, or commands an inverter | **must not exist** in the interface; presence is a build-time failure, not a runtime error (§6.1) |
| N-15 | `sourceTrust='SELF_REPORTED'` | refused `SOURCE_UNTRUSTED` |
| N-16 | technician name present in a record surfaced to a UI | refused by §6.3; surfaces render `technicianPseudonym` only |

N-1 and N-14 are the two that decide whether this milestone chain is trustworthy: N-1 protects the
claim about the numbers, N-14 protects the people and equipment around the meter.

### 8.3 Commands actually executed while authoring

```
$ git rev-parse --abbrev-ref HEAD
dev
$ git log --oneline -1
700dd27 docs(audit): M32-05 privacy-first community MVP verification gate — baseline established (not verified)
$ ls apps
aigateway  arsy  dock  echolog  empire-web  headquarters  lumen-runtime  orbit  sentinel  skylink
```

No test suite was run (no source change to exercise), no migration, no deployment, and no measurement.
`pnpm verify` is a broad integration check and would prove nothing about a units table that does not
yet exist.

## 9. Overlap Analysis

| neighbour | relationship | boundary |
|---|---|---|
| M25-03 | supplies the falsifiable questions the units must answer | this leaf supplies vocabulary, not hypotheses |
| M25-04 | supplies the implemented unit/reason table this extends | extension is additive; the module's dependency-free and no-conversion rules are preserved |
| M25-01 | supplies the four separated time vocabularies | this leaf adds a fifth, explicitly for instrument telemetry, and never merges it with narrative or celestial time |
| M25-07 | hardware feasibility decision | informs which accuracy classes are attainable; no hardware is chosen here |
| M36-01 | **blocking prerequisite** — site, technician, calibration authority, consent | this leaf depends on it for any real evidence; authoring here does not satisfy it |
| M36-03 | next: D17 owner and read-only data boundary | this leaf defines what a valid reading is, not who stores it |
| M36-04 | next: telemetry cost dashboard and failure states | consumes `presentationClass`, gap/duplicate signals as first-class states |
| M36-05 | next: safety and post-pilot feasibility gate | is where read-only-by-construction (§6.1) is *verified* rather than specified |
| ADR-0007 / ECHOLOG | bytes retention for raw capture files | readings are rows, not blobs; ECHOLOG stores exports |
| ADR-0004 | Empire surfaces | HELIOGRID UI must not create a second Hub, login, or SQL owner |

## 10. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | implement the additive unit codes and reason codes | implementation task with a reviewed diff + P/N suites |
| 2 | calibration record storage and schema | M36-03 boundary decision, then implementation |
| 3 | choosing a calibration authority and standard | M36-01 (human/commercial) |
| 4 | accuracy class / measurement category of the installed meter | M36-01 site survey |
| 5 | IEC 61000-4-30 style power-quality classes | out of pilot scope; separate decision |
| 6 | legal-metrology status for billing | out of scope; a billed figure needs a status this pilot does not claim |
| 7 | MPPVT/maximum-demand instrument rules | post-pilot |
| 8 | NTP/PTP infrastructure choice at the site | M36-01 + ops |
| 9 | retention schedule numeric values | post-pilot calibration; §6.3 values are synthetic |
| 10 | tariff and cost model | M36-04 |
| 11 | dashboard failure-state UX, locale copy, keyboard paths | M36-04 + MASTER_DESIGN |
| 12 | site privacy notice and installer consent wording | M36-01 + legal owner |
| 13 | appliance-disaggregation prevention policy | security owner; §6.3 acknowledges the risk |
| 14 | cross-site clock correlation limits | post-pilot |
| 15 | sensor fusion for two meters on one circuit | post-pilot |
| 16 | uncertainty budget tooling for laboratories | deferred |
| 17 | firmware-level timestamping | vendor-dependent |
| 18 | UTC leap-second handling in long-horizon aggregates | implementation, with a test |
| 19 | battery round-trip efficiency measurement method | post-pilot |
| 20 | independent verification of this spec's tier maths | reviewer, at the SHA where it is implemented |

## 11. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. no code, migration, or hardware exists to unwind — this leaf changed two documentation files only;
3. if a later implementation extends the unit table, the three properties that must survive are:
   **enumerated units with no parsing or conversion** (§2.2), **weaker-tier-wins for both tier and clock
   quality** (§2.4, §4.3), and **`SIMULATION` refused before every other check** (§3 R-1). Dropping any
   of the three converts this from a measurement system into a number generator.

## 12. Report

| field | value |
|---|---|
| `task_id` | M36-02 |
| `baseline_sha` | `700dd27` (dev, M32-05) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M36-02-calibration-units-timestamp-provenance.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files; `packages/moonui/src/measurement-metadata.ts` was read, not modified |
| `positive_test_and_output` | §8.1 defines P-1…P-6; **not executed** — the proposed unit codes and provenance fields do not exist in the table yet |
| `negative_test_and_output` | §8.2 defines N-1…N-16 including the mandated simulation-versus-calibrated-measurement pair and the no-actuation construction check; **not executed** |
| `security_rights_privacy` | read-only by construction with no write method exposed; electrical safety preconditions restated as M36-01's to own; technician pseudonyms only; 1-second retention bounded by a down-sampling schedule; refusals are stable codes that never echo value/unit/source/timestamp |
| `reviewer` | integrator; calibration-authority competence is a human decision this leaf cannot make |
| `rollback` | §11 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | specification only; M36-01 remains open and BLOCKED so no site, instrument, technician, calibration authority or consent exists; every tolerance, offset, drift, retention and bound figure is a synthetic proposal; no code changed so no suite was re-run; D17 is not an accepted domain contract; the tier and uncertainty rules are arithmetically simple by design and are not a metrology-grade uncertainty analysis |
| `next_eligible_task` | M36-03 — Decide D17 owner and read-only data boundary |

## 13. Conclusion

HELIOGRID's whole credibility rests on one sentence in the blueprint: simulations never masquerade as
measured generation or savings. That sentence is only enforceable if three boring things are decided
first — which units exist and which are deliberately refused, what a calibration record has to contain
before a reading may be called measured, and which of the three clocks produced a timestamp. This
document decides all three on paper, extends the unit table by enumeration rather than parsing so the
existing no-guessing rule survives, and puts the simulation check ahead of every other check exactly as
the shipped module already does. It also states plainly that none of this is evidence: there is no
meter, no site, no technician and no calibration authority yet, so the sixteen negative cases are
recipes waiting for a system to point at, which is precisely what M36-01 must supply before M36-05 can
verify anything.

## Appendix A: Unit Resolution Order (specified, not implemented)

```
resolveUnit(raw):
  if raw is not a string:            refuse UNIT_EMPTY
  if raw is '' or whitespace-only:   refuse UNIT_EMPTY
  if exact symbol match in table:    accept          # case-sensitive, 'kWh' ≠ 'KWH'
  if whole lowercase word match:     accept          # 'kilowatt hour', not 'kilowatt'+'hour' parsed
  if match after trimming inner text but needs prefix arithmetic:
                                     refuse UNIT_UNKNOWN   # MWh, mg, µs, GHz are never scaled here
  otherwise:                         refuse UNIT_UNKNOWN
  # note: no conversion is performed anywhere in this function; a producer that
  # wants a different unit must send a human-authored, recorded value in it.

resolveTier(reading, record, now):
  if reading.claimType = 'SIMULATION':  return SIMULATED        # first, always
  if record is null:                    return UNCALIBRATED
  if record.dueAtUtc < now:             return UNCALIBRATED     # new readings only
  if record.method = 'LABORATORY'
     and record.accreditationId != null
     and count(record.asFoundValues) >= 2
     and count(record.uncertaintyBudget) >= 1:  return METROLOGY
  if record.method in ('FIELD_COMPARISON','MANUFACTURER_DECLARED')
     and record.referenceStandard != null:      return CALIBRATED
  return FIELD

combineTier(a, b):   the weaker of a, b            # METROLOGY never propagates by proximity
combineClock(a, b):  the worse of a, b              # per-second claims inherit the worst clock
```

## Appendix B: Why Three Timestamps, Not One

| only-one-timestamp world | three-timestamp world (this spec) |
|---|---|
| a gateway offline for 4 minutes looks like the site consumed nothing for 4 minutes | the 240 samples arrive with honest `observedAtUtc`, `backfill=true`, and one gap counted once |
| an instrument whose RTC drifted 90 s produces a demand peak 90 s off, undetectable | `offsetEstimateMs` and `driftRatePpm` bound the claim; §4.3 forbids sub-minute assertions on a `LOCAL_RTC` source |
| a resended batch doubles the day's kWh | `integrityDigest` + `monotonicSeq` make the resend idempotent |
| "data freshness" on a dashboard means "when we wrote it" | freshness uses `ingestedAtUtc`, analytics uses `observedAtUtc`, and neither is ambiguous |

## Appendix C: Provenance Record (synthetic example)

```json
{
  "readingId": "rd_7fq3n2xk5v8m1t9w0c4e6b",
  "clockSource": "INSTRUMENT",
  "instrumentClockKind": "NTP",
  "referenceSource": "ntp:pool.internal.example (synthetic)",
  "stratum": 3,
  "offsetEstimateMs": -14.2,
  "offsetUncertaintyMs": 45,
  "driftRatePpm": 12.5,
  "lastSyncAtUtc": "2026-10-31T03:58:00Z",
  "collectedAtUtc": "2026-10-31T04:15:30Z",
  "ingestedAtUtc": "2026-10-31T04:15:31Z",
  "monotonicSeq": 918442,
  "backfill": false,
  "gapBeforeMs": 0,
  "integrityDigest": "3f1c…e9a2 (truncated, synthetic)"
}
```

Reading: an NTP-class clock (so no sub-minute correlation claims), a 45 ms bound, one second from
collection to ingest, no gap. The same sample from a `LOCAL_RTC` instrument would still be storable,
but every surface caption must drop to minute resolution and the 1-second demand peak would be refused
as a claim (N-12).

## Appendix D: Glossary (selected)

| term | definition used here |
|---|---|
| calibration tier | the mechanically derived trust level of a reading's calibration record, never producer-asserted |
| as-found / as-left | measurements before and after adjustment; both required for a laboratory tier |
| uncertainty budget | the list of components contributing to a stated bound, each typed A or B |
| weaker-tier-wins | aggregates take the least trustworthy input's tier |
| clock source | which of instrument, gateway or ingest produced a timestamp |
| offset estimate | signed difference between a clock and its reference at collection time |
| drift rate | rate at which that offset changes, in ppm, with its own measurement date |
| monotonic sequence | a strictly increasing per-instrument counter that makes gaps and duplicates detectable |
| integrity digest | hash over the identifying tuple of a sample, used for idempotent ingest |
| backfill | ingest arriving more than 120 s after collection |
| presentation class | `MEASURED`, `SIMULATED`, `DERIVED` or `WITHHELD`; the caption contract |
| read-only by construction | the collector exposes no write method, so actuation is unrepresentable rather than forbidden |
| enumerated unit | a unit admitted by exact table entry, never by parsing a prefix or converting a value |
| tierAtAccept | the calibration tier frozen at the moment a historical reading was accepted |
