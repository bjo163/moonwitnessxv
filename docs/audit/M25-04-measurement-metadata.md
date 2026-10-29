# M25-04 — Measurement metadata (evidence)

| Required report field | Value |
|---|---|
| `task_id` | M25-04 |
| `baseline_sha` | `cea723cade43e3460e885c37802a1bcbdf080be5` |
| `baseline_branch` | `dev` |
| `worker` | single-owner leaf worker (implementation + evidence) |
| `claimed_files` | `packages/moonui/src/measurement-metadata.ts`; `packages/moonui/test/measurement-metadata.test.ts`; `docs/design/M25-04-measurement-metadata.md`; `docs/audit/M25-04-measurement-metadata.md` |
| `actual_changed_files` | the four claimed files only, all new/untracked; no tracked file, manifest, TODO, tsconfig, lockfile or `src/index.ts` change |
| `positive_test_and_output` | §4 P1 (full package) and P3 (focused positive, 10/10) |
| `negative_test_and_output` | §4 P4 (focused negative/withhold, 18/18) |
| `result_sha` | none — nothing committed |
| `reviewer` | pending (integrator + human reviewer) |
| `rollback` | delete the four files; `dist/` is gitignored and regenerated |
| `next_eligible_task` | M25-06 (prereqs M25-02 and M07-05) |

**Scope source.** [Task packet](../tasks/M25/M25-04.md) plus the delegated
statement; acceptance *"No simulated values presented as sensor data"*
([TODO.md:583](../../TODO.md)). Prerequisites: M25-02 contract committed at
`f35f0fb` (`packages/moonui/src/claim-type.ts`) and M25-03 closed at `4b0a872`.
`TODO.md` was read to confirm the row; it was **not** edited.

## 1. Baseline and worktree

```text
$ git rev-parse HEAD
cea723cade43e3460e885c37802a1bcbdf080be5
$ git rev-parse --abbrev-ref HEAD
dev
$ git status --porcelain | wc -l
85
```

Before writing, the package test baseline was recorded:

```text
$ cd packages/moonui && pnpm test
ℹ tests 58
ℹ suites 9
ℹ pass 58
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The worktree was already dirty in unrelated paths (`TODO.md`, cockpit UI, audit
screenshots, empire-web assets, `next-env.d.ts` files). It grew from 85 to 92
entries while this leaf ran; four of those entries are this leaf's new files and
the remainder belong to other sessions. Nothing outside the four claimed files
was read for edits, reverted, staged, stashed, committed or pushed.
The package build wrote only gitignored `dist/` output:

```text
$ git check-ignore -v packages/moonui/dist/measurement-metadata.js
.gitignore:11:dist/	packages/moonui/dist/measurement-metadata.js
```

## 2. What was inspected before writing

- `docs/tasks/M25/M25-04.md` — scope, boundaries, required report.
- `packages/moonui/src/claim-type.ts` (read in full) — the four claim types,
  `evaluateClaimLabel`, the UTC rule at `:190`, `:204-207`, `ASTRONOMY`
  uncertainty at `:298-300`, frozen `CLAIM_TYPE_DISPLAY` at `:68-86`.
- `packages/moonui/test/claim-type.test.ts` and `docs/design/M25-02-claim-type-separation.md`,
  `docs/audit/M25-02-claim-type-separation.md` — test style, fixture policy,
  evidence-report format.
- `docs/audit/M25-01-mtime-antikythera-audit.md` (§3 time model, §6 routed gaps),
  `docs/audit/M25-03-heliogrid-questions.md` (measured ≠ simulated ≠ forecast ≠
  fiction; unit/calibration rules from `BLUEPRINT.md:110`).
- Real unit/calibration/uncertainty vocabulary searches. Commands below exclude
  this leaf's own new module so the output describes the pre-existing repository.

```text
$ grep -rn -iE "calibrat" packages/*/src apps/*/src 2>/dev/null | grep -v '/dist/' | grep -v 'generated.ts' | grep -v 'schema-snapshot.json' | grep -v 'moonui/src/measurement-metadata.ts' | head -8
packages/moonql-research/src/index.ts:197:  confidenceCalibration: run.confidenceCalibration,
packages/moonql-research/src/index.ts:507:        confidenceCalibration: int(),
packages/moonql-research/src/index.ts:977:        confidenceCalibration: int(),
packages/moonql-research/src/seed.ts:116:  'confidenceCalibration',
packages/moonql-research/src/seed.ts:502:    confidenceCalibration: 2,
packages/moonui/src/claim-type.ts:36: *  - a physical reading without instrument, calibration or a UTC observation
packages/moonui/src/claim-type.ts:48: * A label is a category, not a truth verdict, a quality score, a calibration
packages/moonui/src/claim-type.ts:90:  'The claim type states the category of a readout. It is not a truth verdict, a quality score, a calibration certificate or a publication approval.'
```

The `confidenceCalibration` hits are a research-run quality score in a model
field, not an instrument calibration. `s-meter.tsx:27`, `:47` describes a
cosmetic galvanometer tick scale ("calibrated from S1-S9"); it is a UI drawing,
not a calibration record.

```text
$ grep -rn -iE "uncertaint" packages/*/src apps/*/src 2>/dev/null | grep -v '/dist/' | grep -v 'moonui/src/measurement-metadata.ts' | head -8
packages/moonql-research/src/historical-pilot.ts:118:  epistemicUncertainties: string[]
packages/moonql-research/src/historical-pilot.ts:250:    epistemicUncertainties: [
packages/moonql-research/src/historical-pilot.ts:251:      'Exact composition year of Mark (68-72 CE) remains an open historical uncertainty without pre-70 manuscript witnesses.',
packages/moonui/src/claim-type.ts:20: *                      inputs and uncertainty (or a pinned published reference).
packages/moonui/src/claim-type.ts:40: *  - astronomy without an algorithm and inputs, or without uncertainty, is
packages/moonui/src/claim-type.ts:115:  'ASTRONOMY_REQUIRES_UNCERTAINTY',
packages/moonui/src/claim-type.ts:169:  /** ASTRONOMY: stated uncertainty with unit. */
packages/moonui/src/claim-type.ts:170:  readonly uncertainty?: string | null
```

```text
$ grep -rn "unit: string" packages/*/src apps/*/src 2>/dev/null | grep -v '/dist/'
packages/moonui/src/client/analog-tuner.tsx:14:  unit: string
packages/types/src/domain/patches.ts:10:  unit: string
```

```text
$ grep -rn -iE "\b(unit|celsius|kelvin|hertz|magnitude|millimetre)\b" packages/*/src apps/*/src 2>/dev/null | grep -v '/dist/' | grep -v 'measurement-metadata.ts' | head -10
packages/core/src/time.ts:18:/** minutes since UTC midnight — the unit the schedule stores */
packages/moonql-research/src/projection-label.ts:210:  /** Code-unit sorted, so the label is deterministic regardless of input order. */
packages/moonql-unilex/src/data/empire-taxonomy.ts:178:    // W02 and W07 unit codes are individually attested; the other codes are
packages/moonql-unilex/src/data/empire-taxonomy.ts:383:  'unit',
packages/moonql-unilex/src/data/registry.ts:1102:        "id": "Unit pekerjaan berjangka, memiliki tujuan, pelaksana dan bukti hasil."
packages/moonql-unilex/src/data/registry.ts:1129:        "id": "Departemen / Unit Kerja"
packages/moonql-unilex/src/vector.ts:92: * Computes cosine similarity between two unit vectors.
packages/moonql/src/view.ts:4: * Read-only projection over one model — the "view-driven" unit.
packages/moonui/src/claim-type.ts:169:  /** ASTRONOMY: stated uncertainty with unit. */
packages/moonui/src/client/analog-tuner.tsx:14:  unit: string
```

Conclusion: there is **no instrument or calibration field anywhere**, one
declared-but-unused free-text `unit` field, kHz/MHz UI constants, a cosmetic
S-meter scale and string-only uncertainty vocabulary. The contract therefore
defines the missing shape rather than contradicting an existing one. Full
mapping: [design §9](../design/M25-04-measurement-metadata.md).

## 3. Design decisions

1. **Home: `packages/moonui`.** Its `tsconfig.json` includes `src`, so `tsc -b`
   compiles the additive module without a manifest, export-map or tsconfig
   change. Tests follow the package convention: `node:test`, importing the built
   file from `../dist/`, exactly like `test/claim-type.test.ts:3`.
2. **Composition, not duplication.** The module imports `evaluateClaimLabel`,
   `isClaimType` and `CLAIM_TYPE_DISPLAY` from `./claim-type.js`. That sibling
   import is its only import; there is no I/O, clock, environment or third-party
   dependency. "Zero-import" is honoured in the sense that matters: no external
   contract, data owner or runtime dependency is added, and no claim-type
   vocabulary is redefined.
3. **Simulation first.** `SIMULATION` is refused before unit/value/calibration
   checks, so complete-looking metadata can never promote model output to sensor
   data (`SIMULATED_VALUE_NOT_SENSOR_DATA`). `STORY` follows
   (`CLAIM_TYPE_NOT_PHYSICAL`).
4. **Astronomy is accepted but never `sensorMeasurement`.** It requires
   algorithm + inputs + uncertainty and is labelled with the M25-02 "not an
   instrument reading" copy.
5. **Lexical units only.** Eight canonical codes; exact symbols (case-sensitive)
   plus whole lowercase words. No conversion, no prefix parsing, no guessing;
   `M`, `MM`, `k`, `c`, `S`, `hz`, `HZ`, `m/s`, `°F`, `kHz`, `MHz` are refused.
6. **Labels are revalidated.** `formatMeasurementLabel` re-derives the unit from
   its `code`, re-checks every field, then calls `evaluateClaimLabel`. A forged
   `accepted: true` record is withheld, and no value/unit/source/timestamp is
   echoed on any withheld path.

## 4. Command log (verbatim observed output)

All commands run from `Z:\project\moonradio\packages\moonui` unless noted.

### P1 — full package test script (`tsc -b` + all tests; tail)

```text
$ pnpm test
...
✔ MoonUI Design Tokens (Single Source of Truth) (4.1807ms)
ℹ tests 86
ℹ suites 13
ℹ pass 86
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 272.7183
```

86 = the 58 baseline cases plus 28 new cases (4 new suites). No pre-existing
test regressed.

### P2 — the new suite on its own (summary lines)

```text
$ pnpm exec node --experimental-strip-types --test test/measurement-metadata.test.ts
...
✔ M25-04 rendered label (0.9964ms)
ℹ tests 28
ℹ suites 4
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 104.6049
```

### P3 — focused positive cases

```text
$ pnpm exec node --experimental-strip-types --test --test-name-pattern "normalizes|trims|exports a stable|accepts|keeps the raw|renders" test/measurement-metadata.test.ts
▶ M25-04 unit normalization
  ✔ normalizes canonical symbols and spelled-out names without inventing a scale (0.7109ms)
  ✔ trims surrounding whitespace and ships both id and en unit labels (0.1231ms)
  ✔ exports a stable eight-unit vocabulary (0.5645ms)
✔ M25-04 unit normalization (2.3492ms)
▶ M25-04 measurement and calibration acceptance
  ✔ accepts a calibrated Celsius reading with UTC time, source and uncertainty (0.4091ms)
  ✔ accepts kelvin, percent, millimetre, metre, second, hertz and magnitude readings (0.2101ms)
  ✔ accepts an astronomy computed reference only with algorithm inputs and uncertainty (0.1458ms)
  ✔ keeps the raw unit string out of the normalized record (0.117ms)
✔ M25-04 measurement and calibration acceptance (1.1493ms)
▶ M25-04 rendered label
  ✔ renders claim type, source and unit for an accepted physical reading (0.5344ms)
  ✔ renders id copy and falls back to en for an unsupported locale (0.146ms)
  ✔ renders an astronomy reference as computed, never as a sensor reading (0.1819ms)
✔ M25-04 rendered label (1.0829ms)
ℹ tests 10
ℹ suites 3
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 98.6272
```

### P4 — focused negative/withhold cases

```text
$ pnpm exec node --experimental-strip-types --test --test-name-pattern "refuses|withholds|does not infer|exports the required" test/measurement-metadata.test.ts
▶ M25-04 unit normalization
  ✔ refuses empty units with UNIT_EMPTY (0.5609ms)
  ✔ refuses unknown and ambiguous units instead of guessing (0.1822ms)
✔ M25-04 unit normalization (1.5102ms)
▶ M25-04 measurement and calibration acceptance
  ✔ does not infer a reading from a value and a unit alone (0.2851ms)
✔ M25-04 measurement and calibration acceptance (0.4557ms)
▶ M25-04 refusals are fail closed
  ✔ refuses a simulation even when full calibration metadata is supplied (0.186ms)
  ✔ refuses a story readout as non-physical (0.0775ms)
  ✔ refuses an unknown or missing claim type without inferring one (0.1017ms)
  ✔ refuses an empty or unknown unit (0.12ms)
  ✔ refuses a non-finite or non-numeric value (0.1369ms)
  ✔ refuses a missing source and an untrusted source (0.0984ms)
  ✔ refuses a physical reading without an instrument or calibration reference (0.2027ms)
  ✔ refuses a missing, local or date-only observation timestamp (0.122ms)
  ✔ refuses a reading without stated uncertainty (0.0747ms)
  ✔ refuses astronomy without an algorithm reference or declared inputs (0.0943ms)
  ✔ refuses a malformed descriptor (0.0712ms)
  ✔ exports the required stable reason codes (0.0571ms)
✔ M25-04 refusals are fail closed (1.6639ms)
▶ M25-04 rendered label
  ✔ withholds a simulated value instead of rendering it as sensor data (0.2633ms)
  ✔ withholds a malformed, forged or unknown evaluation without echoing anything (0.1313ms)
  ✔ withholds a forged evaluation whose claim type or value is not renderable (0.0866ms)
✔ M25-04 rendered label (0.5981ms)
ℹ tests 18
ℹ suites 4
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96.7595
```

### P5 — ESLint

```text
$ cd Z:\project\moonradio && pnpm exec eslint packages/moonui/src/measurement-metadata.ts packages/moonui/test/measurement-metadata.test.ts
ESLINT_EXIT=0
```

No diagnostics were emitted.

### P6 — typecheck

```text
$ pnpm --filter @moonwitness/moonui typecheck
> @moonwitness/moonui@1.0.0 typecheck Z:\project\moonradio\packages\moonui
> tsc --noEmit

PKG_TYPECHECK_EXIT=0
```

The `pnpm test` script also ran `tsc -b` (`TSC_BUILD_EXIT=0`).

### P7 — barrel and file scope

```text
$ git status --porcelain -- packages/moonui/src/measurement-metadata.ts packages/moonui/test/measurement-metadata.test.ts docs/design/M25-04-measurement-metadata.md docs/audit/M25-04-measurement-metadata.md
?? docs/audit/M25-04-measurement-metadata.md
?? docs/design/M25-04-measurement-metadata.md
?? packages/moonui/src/measurement-metadata.ts
?? packages/moonui/test/measurement-metadata.test.ts

$ git diff --name-only -- packages/moonui/src packages/moonui/test
(no output)

$ grep -n "measurement-metadata" packages/moonui/src/index.ts
INDEX_GREP_EXIT=1
```

Four untracked files, zero tracked modifications in the claimed scope, and no
barrel export. The worktree reported 92 entries at write time (85 at baseline;
four are this leaf's files, the rest belong to other sessions).

## 5. Reason-code matrix

Every refusal is asserted for the exact code, `accepted: false`,
`normalized: null`, a frozen result and the absence of the hostile source, hostile
unit, local timestamp and raw value strings. Withheld labels additionally assert
`text`, `claimType`, `claimLabel`, `sourceRef` and `unitSymbol` are all `null`.

| Code | Trigger (synthetic fixture) | Positive/negative owner | Echo check |
|---|---|---|---|
| `MEASUREMENT_DESCRIPTOR_INVALID` | `null`, `undefined`, string, number, array input; forged evaluation without a reason | P4 | no input text in result |
| `CLAIM_TYPE_MISSING` | value + unit + source, no `claimType` | P4 | no source |
| `CLAIM_TYPE_UNKNOWN` | `claimType: 'OBSERVATION'` | P4 | no source |
| `SIMULATED_VALUE_NOT_SENSOR_DATA` | `claimType: 'SIMULATION'` with instrument, calibration, UTC time, source, uncertainty | P4 | no value, unit, source, timestamp |
| `CLAIM_TYPE_NOT_PHYSICAL` | `claimType: 'STORY'`; forged normalized `claimType: 'SIMULATION'` | P4 | no source |
| `UNIT_EMPTY` | `undefined`, `null`, `''`, `'   '` | P4 | n/a |
| `UNIT_UNKNOWN` | `'°F'`, `'fahrenheit'`, `'M'`, `'MM'`, `'kHz'`, `'MHz'`, `'k'`, `'c'`, `'S'`, `'hz'`, `'HZ'`, `'m/s'`, `'degC'`, `'derajat Celsius'`, hostile unit, `42`, `{}` | P4 | raw unit never returned |
| `VALUE_NOT_FINITE` | `NaN`, `±Infinity`, `'21.4'` (string), `null`; forged normalized string value | P4 | no raw value |
| `SOURCE_MISSING` | `source: '   '`; forged normalized with no source | P4 | no timestamp/value |
| `SOURCE_UNTRUSTED` | `sourceTrust: 'UNTRUSTED'` with hostile source | P4 | no source |
| `INSTRUMENT_MISSING` | `instrument: ''`; forged normalized with empty instrument | P4 | no source, no forged unit symbol |
| `CALIBRATION_MISSING` | `calibrationRef: '  '` | P4 | no source |
| `TIMESTAMP_MISSING` | `observedAtUtc: undefined` / `''` | P4 | no source |
| `TIMESTAMP_NOT_UTC` | local `+07:00` instant, bare date, malformed offset, forged local instant | P4 | no local timestamp |
| `UNCERTAINTY_MISSING` | `uncertainty: '   '` | P4 | no source |
| `ASTRONOMY_ALGORITHM_MISSING` | astronomy without `algorithmRef`, or with `algorithmInputRefs: []` | P4 | no source |

Accepted paths in contrast: `°C`, `K`, `%`, `mm`, `m`, `s`, `Hz`, `mag` with
instrument, calibration reference, UTC instant, source, `TRUSTED` and
uncertainty; astronomy with algorithm + inputs + uncertainty and
`sensorMeasurement: false`.

## 6. Security, privacy and rights

- **No network, no real data, no credentials.** All fixtures are synthetic; the
  hostile source uses the reserved `secret.invalid` host. No instrument, sensor,
  site, utility, account, witness or media content is read or written.
- **The refusal path is structurally leak-free.** Refusals and withheld labels
  carry only fixed ASCII codes; the module never interpolates input into a
  reason or a label. Tests assert this against a hostile source, a hostile unit,
  a local timestamp and a raw value.
- **The rendered path cannot be forged into echoing input text.** The unit symbol
  is re-derived from the frozen table by `code`; the source is revalidated by
  `evaluateClaimLabel`; the value must be a finite number. A forged
  `accepted: true` object is withheld.
- **No secrets, private witness material, tokens, environment values or site
  identifiers** are introduced, and none were read. The new files are safe to
  publish.
- **No schema, ACL, rights or consent decision changes.** No table, route, page,
  API field, migration, navigation entry or public-read behavior is added. No
  data owner is created; the module holds no data.
- **No dependency or lockfile change**, no manifest change, no `src/index.ts`
  export.

## 7. Rollback

Delete:

- `packages/moonui/src/measurement-metadata.ts`
- `packages/moonui/test/measurement-metadata.test.ts`
- `docs/design/M25-04-measurement-metadata.md`
- `docs/audit/M25-04-measurement-metadata.md`

`packages/moonui/dist/measurement-metadata.js` / `.d.ts` are gitignored build
output and are regenerated or removed by the next build/clean. Nothing imports
the module, so no consumer breaks; no TODO, manifest, tsconfig, route, schema or
existing source file changes.

## 8. Limitations

- **Contract only, no adoption.** No component, route, page, producer, API or
  database column uses this module. The HQ honest copy ("no measured feed is
  configured", "No live telemetry … are reported") is unchanged and remains the
  only measurement-adjacent surface text.
- **Eight units only.** `kHz`, `MHz`, `°F`, compound units and prefixed forms are
  refused by design rather than converted. The real MoonUI radio `kHz`/`MHz`
  constants (`packages/moonui/src/client/analog-tuner.tsx:14`, `:25`, `:34`) are
  UI labels and are not measurement metadata; adopting this contract there would
  require a deliberate vocabulary addition, not a guess.
- **Lexical normalization, not conversion or validation.** No °C↔K conversion,
  no kHz→Hz scaling, no compound-unit algebra, no range check, no significant
  figures, no uncertainty propagation. `C` is accepted as degree Celsius per the
  delegated list; it is not accepted as coulomb.
- **Calibration and uncertainty are opaque strings.** A supplied
  `calibrationRef` is not verified, dated, signed or proven; uncertainty is
  never computed. Passing means "a reference was supplied", nothing more.
- **Uncertainty is required for `PHYSICAL_READING` here**, which is stricter than
  M25-02 (where uncertainty is required only for `ASTRONOMY`). That is a stated
  design choice of this task, not a field observed in the repository.
- **No producer or real instrument exists.** The tests prove contract behaviour
  on synthetic fixtures only; they cannot prove any producer will populate the
  fields, and they assert no physical or astronomical value.
- **The package test `tsconfig.json` is lint-only.** A standalone
  `tsc --noEmit -p test/tsconfig.json` reports `TS2688: Cannot find type
  definition file for 'node'` because `@types/node` is not linked into this
  package. This is a pre-existing configuration condition (it affects the
  committed `claim-type.test.ts` equally); `pnpm test` and the package
  `typecheck` do not use that project, and ESLint's projectService resolves the
  files without diagnostics.
- **Shared dirty worktree.** 85 → 92 entries during the task; unrelated edits by
  other sessions were not reviewed. `TODO.md` was not edited; closure and status
  remain the integrator's decision.

## 9. Verdict and handoff

The acceptance *"No simulated values presented as sensor data"* is met at the
contract level:

- `evaluateMeasurementMetadata` refuses a `SIMULATION` before any metadata is
  considered (`SIMULATED_VALUE_NOT_SENSOR_DATA`), and `formatMeasurementLabel`
  withholds it with no value, unit, source or timestamp;
- a bare number with a unit is refused (`CLAIM_TYPE_MISSING`), so sensor data is
  never inferred from appearance;
- `ASTRONOMY` is accepted only with algorithm + inputs + uncertainty and is
  marked `sensorMeasurement: false`;
- units are named or refused, never guessed, and no raw unit string is echoed;
- every positive case carries calibration reference, UTC instant, source, trust
  and uncertainty; every negative case asserts its exact code and a leak-free
  result.

This is not evidence of any instrument, calibration, sensor value or shipped UI.

**Next eligible task:** M25-06 — *Research source context of comparative cosmos
in sacred traditions* (prerequisites M25-02 and M07-05; M25-02 is delivered here
for integrator review). M25-07 depends on M25-04 and M25-06.
