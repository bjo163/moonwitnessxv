# M25-02 — Claim type separation for physical readings, simulation, astronomy and story

**Status: DESIGN CONTRACT DELIVERED — NOT WIRED INTO ANY PRODUCTION UI.**
Base: `18cca2f78a567774b407c33483e75d5619390b11` (`dev`), task **M25-02**, priority P3, difficulty D2.
Acceptance: *"UI ontology has explicit claim type and source"* ([TODO.md:581](../../TODO.md)).

**Scope source.** There is no packet file for M25-02 (`docs/tasks/M25/` contains only M25-01, M25-03, M25-04, M25-06 and M25-07). The scope of this artifact is therefore exactly the TODO row plus the delegated statement: define the four claim types, a pure fail-closed contract, tests and evidence; do not change production UI. Prerequisite M24-02 is closed.

**Deliverables.**

| File | Purpose |
|---|---|
| `packages/moonui/src/claim-type.ts` | Pure, zero-import contract: claim types, descriptor, evaluator, en/id display table |
| `packages/moonui/test/claim-type.test.ts` | `node:test` suite: 4 positive cases, 13 refusal cases, 1 vocabulary case, source-leak assertions |
| `docs/design/M25-02-claim-type-separation.md` | This specification |
| `docs/audit/M25-02-claim-type-separation.md` | Evidence report: commands, output, mapping, limits |

## 1. Problem

The repository renders values whose nature is not stated on the surface. The clearest case is the MoonUI header clock: its docstring calls a mean-synodic arithmetic fraction a "lunar phase ephemeris" and names the product "Moon Standard Time" (`packages/moonui/src/client/mts-clock.tsx:80-86`), while the value is a fixed-epoch division (`:21-23`, `:38-42`) rendered as `MTS {percent}%` (`:123-136`). M25-01 recorded that value as unpersisted, unordered and display-only, and routed the labelling risk here (`docs/audit/M25-01-mtime-antikythera-audit.md` §6).

The same hazard exists in three other forms:

- a model output could be shown where a sensor value is expected;
- a computed or published astronomy reference could be read as something MoonWitness measured;
- a narrative era or story label could be read as evidence or as a date.

Until now the repository has **no claim type for readouts**. Two adjacent vocabularies exist and neither fits: the BLUEPRINT §6 epistemic-nature axis used for corpus projections (`packages/moonql-research/src/projection-label.ts:54-64`, `:115`), which classifies *documents and projections*, and the test-only moderation axis in `apps/sentinel/test/moderation-review-contract.ts:23-27` (`PHYSICAL_OBSERVATION`, `SOCIAL_SIGNAL`, `THEOLOGICAL_UNCERTAINTY`, `THEOLOGICAL_CERTAINTY`), which classifies *moderation intents* and has no production importer. Neither carries instrument/model/algorithm provenance for a displayed value.

## 2. Scope and non-goals

In scope: the ontology and a pure decision function that can be adopted by any renderer, plus locale copy and tests.

Out of scope and deliberately not delivered: any component, route, page, navigation entry, sitemap entry, data fetch, meter, sensor, ephemeris library, calibration workflow, model runner, database table, API field, migration, or index export. No existing source file is modified. No physical or astronomical value is validated or asserted.

## 3. The four claim types

Every rendered reading must carry **exactly one** type. The type is supplied by the producer; a renderer may not derive it from the value, the route, the mode or the presence of metadata.

| Claim type | Means | Minimum metadata before display | May be presented as | Must never be presented as | Exists in repository today? |
|---|---|---|---|---|---|
| `PHYSICAL_READING` | A value produced by an identified physical instrument or system | `sourceRef` + `instrumentRef` + `calibrationRef` + UTC `observedAt` | `MEASUREMENT` | astronomy, simulation, story, "ephemeris" | **No** readout. Source and UTC timestamp primitives exist; instrument/calibration fields do not (M25-04 owns them) |
| `SIMULATION` | Output of a named computational model over declared inputs | `sourceRef` + `modelRef` + at least one `modelInputRef` + visible `nonMeasurementNotice` | `SIMULATION` | measurement, observation, live, astronomy | **No** model registry or simulation record. The header clock is arithmetic, not a declared simulation |
| `ASTRONOMY` | A computed/ephemeris quantity or a pinned published reference | `sourceRef` + `algorithmRef` + at least one `algorithmInputRef` + `uncertainty` | `ASTRONOMY` | measurement by MoonWitness, instrument reading, live feed | **No** algorithm/input/uncertainty record. One docstring calls arithmetic an "ephemeris"; one taxonomy string names a "solar ephemeris" |
| `STORY` | Narrative or creative chronology owned by the story domain | `sourceRef` (story/edition reference) | `STORY` | measurement, evidence, calendar date, astronomical alignment | **Yes, as labels**: eight ordinal eras with no date field; actor `chronologyLabel` + confidence |

Minimum metadata is not a quality score. Passing the contract means "the declared claim can be shown with the provenance its type requires", not "the value is correct".

## 4. Contract surface

Module: `packages/moonui/src/claim-type.ts`. **Zero imports.** The module is compiled by the package `tsc -b` build but is intentionally **not re-exported from `packages/moonui/src/index.ts`**; adding a public barrel export is an API decision for the adopting task and would change the package's published surface. Tests import the built file directly (`../dist/claim-type.js`), matching the existing MoonUI test convention.

```ts
export const CLAIM_TYPES = ['PHYSICAL_READING', 'SIMULATION', 'ASTRONOMY', 'STORY'] as const
export type ClaimType = (typeof CLAIM_TYPES)[number]

export interface ClaimDescriptor {
  claimType?: ClaimType | string | null        // required at runtime
  sourceRef?: string | null                    // required at runtime
  sourceTrust?: ClaimSourceTrust | string | null
  instrumentRef?: string | null                // PHYSICAL_READING
  calibrationRef?: string | null               // PHYSICAL_READING
  observedAt?: string | null                   // PHYSICAL_READING, UTC ISO-8601 with Z
  modelRef?: string | null                     // SIMULATION
  modelInputRefs?: readonly string[] | null    // SIMULATION
  nonMeasurementNotice?: string | null         // SIMULATION
  algorithmRef?: string | null                 // ASTRONOMY
  algorithmInputRefs?: readonly string[] | null// ASTRONOMY
  uncertainty?: string | null                  // ASTRONOMY
  presentedAs?: ClaimPresentation | string | null
}

export interface ClaimEvaluation {
  readout: 'ALLOWED' | 'WITHHELD'
  claimType: ClaimType | null   // known declared type, else null
  sourceRef: string | null      // ALLOWED only; always null on WITHHELD
  reason: ClaimRefusalCode | null // null on ALLOWED; stable code on WITHHELD
}

export function evaluateClaimLabel(input: ClaimDescriptor | null | undefined): ClaimEvaluation
```

`presentedAs` is optional. If supplied it must equal the type's expected presentation (`PHYSICAL_READING`→`MEASUREMENT`, otherwise the type name); omission means "no separate presentation claim". A withheld result is frozen and structurally cannot carry a source string.

### Stable refusal codes

`CLAIM_DESCRIPTOR_INVALID`, `CLAIM_TYPE_MISSING`, `CLAIM_TYPE_UNKNOWN`, `SOURCE_MISSING`, `SOURCE_UNTRUSTED`, `PRESENTATION_UNKNOWN`, `STORY_PRESENTED_AS_MEASUREMENT`, `PRESENTATION_CLAIM_MISMATCH`, `PHYSICAL_READING_REQUIRES_INSTRUMENT`, `PHYSICAL_READING_REQUIRES_CALIBRATION`, `PHYSICAL_READING_REQUIRES_TIMESTAMP`, `SIMULATION_REQUIRES_MODEL`, `SIMULATION_REQUIRES_NON_MEASUREMENT_LABEL`, `ASTRONOMY_REQUIRES_ALGORITHM`, `ASTRONOMY_REQUIRES_UNCERTAINTY`.

Codes are fixed ASCII tokens. They are never interpolated with input text, so the refusal path cannot leak a source URL, object key or raw value.

## 5. Rules

1. **One type, one source.** Every rendered reading carries exactly one claim type and one `sourceRef`. No mixed labels, no "unknown but probably" fallback.
2. **Producer-supplied, never render-inferred.** The type is declared in the data/descriptor. A renderer must not infer `ASTRONOMY` because a component is called "clock", or `PHYSICAL_READING` because a number has a unit.
3. **Fail closed.** Absent or unknown `claimType` ⇒ `WITHHELD`. There is no default type and no coercion. An unrecognized `presentedAs` value is also withheld.
4. **No locale-only relabel.** Machine tokens (`PHYSICAL_READING`, …) are stable ASCII. Locale copy may translate display text only; it may not change the type, the source, or the "not a measurement / not evidence" qualifier. A translator must not introduce a fifth label.
5. **No silent promotion.** A value never moves between types at render time. Promotion (simulation→physical, astronomy→physical) requires a new source record and human review; it is a content change, not a display toggle.
6. **Story is never evidence.** A `STORY` readout presented as `MEASUREMENT` is refused by name (`STORY_PRESENTED_AS_MEASUREMENT`). Any other presentation/type mismatch is refused (`PRESENTATION_CLAIM_MISMATCH`), including a physical reading presented as story or simulation.
7. **Simulation states it is not a measurement.** `SIMULATION` requires a visible `nonMeasurementNotice` in addition to model id and inputs. A model output without that notice is withheld.
8. **Astronomy states its computation.** `ASTRONOMY` requires an algorithm/reference id, declared inputs and a stated uncertainty. It never claims MoonWitness measured the sky.
9. **Physical readings state their provenance.** Instrument, calibration reference and a UTC observation instant are mandatory. A UTC timestamp of a bare date or a local time without `Z` is withheld.
10. **Source is a field, not a tooltip.** `sourceRef` travels with the readout into any export; it is not hover-only. On `WITHHELD`, `sourceRef` is `null` and no input text is echoed.
11. **Trust is explicit.** Only `sourceTrust: 'TRUSTED'` passes; `UNTRUSTED` and any unrecognized trust value are withheld (`SOURCE_UNTRUSTED`). Absence of the optional marker is not treated as trust for physical readings, but it also does not fabricate a refusal; the mandatory metadata still applies.
12. **No forecast type.** Forecasting is out of scope (M25-03: measured ≠ simulated ≠ forecast ≠ fiction). Nothing here creates a fifth category.

## 6. UI copy requirements (`en` and `id`)

`CLAIM_TYPE_DISPLAY` ships both locales, frozen. The type token stays untranslated beside the localized text.

| Type | `en` | `id` |
|---|---|---|
| `PHYSICAL_READING` | Physical reading — instrument measurement | Pembacaan fisik — pengukuran instrumen |
| `SIMULATION` | Simulation — model output, not a measurement | Simulasi — keluaran model, bukan pengukuran |
| `ASTRONOMY` | Astronomy — computed reference, not an instrument reading | Astronomi — rujukan terhitung, bukan pembacaan instrumen |
| `STORY` | Story — narrative, never evidence | Cerita — narasi, tidak pernah menjadi bukti |

Rendering requirements for any future surface:

- the claim type is **text**, adjacent to the value, not a colour or icon alone;
- the type is announced with the readout to assistive technology, not only in a tooltip;
- `CLAIM_TYPE_NOTICE` is shown where types are explained: *"The claim type states the category of a readout. It is not a truth verdict, a quality score, a calibration certificate or a publication approval."*;
- a withheld readout shows the reason code or a localized explanation of it, never the raw source;
- both locales carry the same four meanings; if a locale is missing, fall back to `en` and mark the fallback (the table does not silently machine-translate).

## 7. Mapping to observed repository fields

| Contract concept | Real observed field or vocabulary | Location | State |
|---|---|---|---|
| `PHYSICAL_READING` source requirement | Mandatory `sourceRef` on actor records, rejected when blank | `packages/moonql-actors/src/index.ts:82-84` | Implemented for actors, not for readouts |
| `PHYSICAL_READING` time base | `timestamp(..., { withTimezone: true })`; UTC minutes for schedules | `packages/moonql/src/schema.ts:14-15`; `packages/core/src/time.ts:1-19` | Implemented |
| `PHYSICAL_READING` instrument/calibration | No instrument or calibration field exists in any package | — | Absent; M25-04 owns it |
| `PHYSICAL_READING` epistemic analogue | `SCIENTIFIC_OBSERVATION` class and `d10.scientific_observation` kind | `packages/moonql-research/src/projection-label.ts:58`, `:115` | Implemented for projections only |
| `SIMULATION` | `MtsTelemetryData` declares `illuminationPct`/`siderealHours` but nothing produces it | `packages/types/src/sentinel/telemetry.ts:27-34` | Dead type |
| `SIMULATION` arithmetic today | Fixed synodic month and new-moon epoch; phase fraction | `packages/moonui/src/client/mts-clock.tsx:21-23`, `:38-42` | Display approximation, not a simulation record |
| `ASTRONOMY` mislabel today | Docstring calls the arithmetic a "lunar phase ephemeris" and "Moon Standard Time" | `packages/moonui/src/client/mts-clock.tsx:80-86` | Unmodified; must not be promoted |
| `ASTRONOMY` taxonomy prose | HELIOGRID described as "Falsifiable solar ephemeris" | `packages/moonql-ops/src/empire.ts:121` | Taxonomy string only |
| `STORY` labels | Eight ordinal eras, no date field | `apps/dock/src/app/timeline/page.tsx:4-21` | Implemented |
| `STORY` chronology | `chronologyLabel` + `CHRONOLOGY_CONFIDENCES` (`UNDATED`, `REPORTED_DATE`, `DISPUTED_DATE`, `ATTESTED_DATE`) | `packages/moonql-actors/src/index.ts:317-318`; `packages/moonql-actors/src/seed.ts:24` | Implemented |
| Source-trust analogue | `epistemicStatus` (`UNKNOWN`, `DISPUTED`, `ASSERTED`, `VERIFIED`) | `packages/moonql-actors/src/index.ts:272`; `packages/moonql-actors/src/seed.ts:20` | Implemented for actors, not readouts |
| Distinct epistemic axes | `EpistemicClass = FACT \| TELEMETRY \| SPECULATION \| CANONICAL` | `packages/core/src/tracing.ts:13` | Implemented for tracing |
| Withholding precedent | Sample signals withheld until source, observation time and freshness can be shown | `apps/dock/src/lib/landing-copy.ts:70-72` (`en`), `:191-193` (`id`) | Implemented UI copy |
| Honest capability copy | HELIOGRID "no measured feed is configured"; 14-system catalogue "No live telemetry, synchronization, or physical measurements are reported" | `apps/headquarters/src/app/(admin)/page.tsx:231`, `:447-449` | Present at this baseline |
| `en`/`id` display pairs | Frozen class display table with both locales | `packages/moonql-research/src/projection-label.ts:128-160` | Implemented precedent |
| Pre-existing `ClaimType` vocabulary | Test-only moderation axis: `PHYSICAL_OBSERVATION`, `SOCIAL_SIGNAL`, `THEOLOGICAL_UNCERTAINTY`, `THEOLOGICAL_CERTAINTY`; unknown values refused with `UNKNOWN_CLAIM_TYPE` | `apps/sentinel/test/moderation-review-contract.ts:23-27`, `:56-60`, `:76-78` | Test-only; no production import |

## 8. Relationship to the M16-07 epistemic axis

This contract does **not** create a second epistemic-nature enum. `packages/moonql-research/src/projection-label.ts` keeps the BLUEPRINT §6 classes for projections and refuses mixed labels. M25-02 is a narrower *display/readout* contract:

| M25-02 type | BLUEPRINT §6 mapping |
|---|---|
| `PHYSICAL_READING` | `SCIENTIFIC_OBSERVATION`, and only when instrument, calibration and UTC time are present |
| `SIMULATION` | No §6 class today; output of a model is not `SCIENTIFIC_OBSERVATION` and must not be labelled as one |
| `ASTRONOMY` | No §6 class today; a computed/published reference is not a measurement |
| `STORY` | `FICTION` for creative work, `INTERPRETATION` for a reading; never `HISTORICAL_EVIDENCE` |

A future adoption must state which axis a surface is using. Neither module may be used to relabel the other's records.

There is also a **test-only moderation `ClaimType`** in `apps/sentinel/test/moderation-review-contract.ts:23-27` with four different values. It is a review-policy input, not a provenance contract, and `apps/sentinel/src` does not import it. The shared TypeScript name `ClaimType` is exported from two unrelated modules (`@moonwitness/moonui` deep path and a Sentinel test helper); consumers must import it by module path and must not merge the two universes. If both ever need the same surface, the moderation axis and the readout axis must stay separate fields; this contract's four types do not classify moderation intents, and the Sentinel types do not classify readouts.

## 9. Adoption path and boundaries

- **No renderer is wired.** This leaf proves the decision function and its refusals only.
- A future component imports `evaluateClaimLabel` and renders only on `ALLOWED`; any `WITHHELD` path shows the reason without the source. Whether to expose the module through the MoonUI barrel is the adopting task's decision.
- **M25-04** owns unit normalization, measurement/calibration and source metadata. `instrumentRef`, `calibrationRef` and `uncertainty` are references here, not a metadata schema.
- **M25-05** (closed proposal) already proposes the same four types for a Cosmos/Time explorer (`docs/design/M25-05-cosmos-time-explorer-sketch.md:48-69`); its decision D2 is answered by this contract. The explorer remains unbuilt and non-discoverable.
- **M25-06** owns comparative historical/scripture separation; those claims must not be forced into `ASTRONOMY` or `STORY`.
- The MTS header clock (`mts-clock.tsx`) is **not** changed by this leaf. Any future adoption must label its phase as `SIMULATION` (arithmetic) or `ASTRONOMY` only when algorithm, inputs and uncertainty exist; calling it a physical reading is forbidden.

## 10. Explicit non-claims

This document and module do **not** claim that:

- any physical instrument, meter, sensor or calibrated feed exists;
- any astronomical ephemeris, almanac, coordinate or observation was computed or verified;
- any simulation model or its output exists;
- the MTS clock's phase is accurate, an ephemeris, or a time standard;
- `PHYSICAL_READING` metadata proves calibration quality — it proves a reference was supplied;
- `ALLOWED` is a truth verdict, a review approval or a publication decision;
- the claim types cover scripture, historical interpretation or forecasting;
- the contract is integrated into any shipped UI.

## 11. Verification and rollback

Tests: `packages/moonui/test/claim-type.test.ts` (18 cases: 4 positive, 13 refusal, 1 vocabulary; withheld results asserted to carry `sourceRef: null` and no hostile source text). Commands and verbatim output are in `docs/audit/M25-02-claim-type-separation.md` §4.

Rollback: delete the two code files and the two M25-02 documents. The package build regenerates `dist/` artifacts, which are gitignored (`.gitignore:11`). No manifest, TODO, schema, route or existing source file is touched.
