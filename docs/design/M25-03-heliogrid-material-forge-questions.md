# M25-03 — HELIOGRID and Material Forge falsifiable research-question register

**Design artifact · baseline `a54198bd04705ba191c79e0bd1b36584a885622a` (`dev`) · no device, pilot, measurement or hardware is claimed.**
Task: [M25-03](../tasks/M25/M25-03.md) · Milestone: [M25](../milestones/M25.md) · Prerequisite M06-05 closed ([TODO:217](../../TODO.md), [owner map](../decisions/M06-05-historical-interfaces-map.md)).
Evidence and command log: [docs/audit/M25-03-heliogrid-questions.md](../audit/M25-03-heliogrid-questions.md).

**Purpose.** Turn the two repository research horizons — HELIOGRID (energy) and Material Forge (materials) — into questions that a reviewer could *fail*. Nothing here specifies, authorises or predicts a device. A question that cannot be failed by an observation is not science and must not appear in product copy.

**Explicit non-goals.** This document does not: design a generator, a quantum device, a proton/beam tool, a fabrication process, a control system or an energy product; promise a pilot date; assign a data owner; replace [M25-04](../tasks/M25/M25-04.md), [M25-07](../tasks/M25/M25-07.md) or milestone [M36](../milestones/M36.md); or convert any fixture into evidence.

---

## 0. Status vocabulary and evidentiary rules

| Status | Meaning | Consequence |
|---|---|---|
| `TESTABLE-NOW` | The question can be answered from repository evidence alone, today | A negative answer is a finding, not a placeholder |
| `BLOCKED-INSTRUMENT` | The method, unit and falsification rule are complete, but no meter/site/lab/specimen exists in this repository, so no numeric tolerance may be fixed yet | Numeric tolerance is `U_?` and belongs to M36-02 (energy) or M25-07 (materials/hardware); no published number may be invented |
| `BLOCKED-SOURCE` | Requires a pinned external authoritative reference (almanac, standard, datasheet edition) that the repository does not contain | The claim that needs it stays unsupported until the reference is pinned with edition + digest |

**Register-wide NON-CLAIM (applies to all 11 questions):** no question here asserts a generator, a quantum chip, over-unity output or a built device, and none authorises physical actuation. Each question repeats the specific non-claim that applies to it.

Rules applied to every question below:

1. **Measured ≠ simulated ≠ forecast ≠ fiction.** A value is `MEASURED` only if it came from an identified instrument, with a calibration state and a UTC timestamp, and the raw export is retained. Simulation and forecast are labelled as such and are never displayed as generation or savings.
2. **No invented numbers.** Where the repository cannot support a tolerance, the register writes `U_?` and names the task that must supply it. A plausible-looking number would be a fabrication.
3. **Read-only.** HELIOGRID is an observation surface. The platform may never command breakers, inverters, batteries, relays or meters, and may not write to, or re-flash, an instrument.
4. **No actuation by "Forge".** Material Forge is a record of tests performed by qualified people; the word "forge" is not an instruction to fabricate, synthesise or energise anything.
5. **A negative result is success.** Failing to observe an effect is recorded and published as a null result, not hidden.
6. **Claim bar for extraordinary output.** Any claim of output exceeding measured input plus documented storage discharge is a measurement-error hypothesis first, and requires independent replication before it may be repeated in any surface.

### 0.1 Unit and instrument vocabulary (what a future measurement would have to use)

| Quantity | Unit | Instrument class | Mandatory provenance |
|---|---|---|---|
| AC energy (import/export) | kWh | revenue-grade utility meter, pulse/optical/Modbus register | meter serial, accuracy class, register start/end, UTC interval, invoice or export |
| Power | W / kW | meter or inverter log at declared sample interval | sample interval, timezone (UTC), device serial |
| Plane-of-array irradiance | W/m² (or MJ/m² integrated) | calibrated pyranometer or reference cell | calibration date/certificate id, tilt/azimuth |
| Temperature | °C | shielded sensor, declared placement | sensor id, placement, sample interval |
| Storage state / throughput | % SoC, kWh in/out | BMS or hybrid-inverter counter | device serial, counter reset history |
| Mass, length, force | g, mm, N | calibrated balance / calliper / load frame | calibration id, resolution, repeatability |
| Resistivity | Ω·m | four-point probe (method declared) | probe geometry, current source, temperature |
| Thermal conductivity | W·m⁻¹·K⁻¹ | guarded hot plate / transient method (declared) | method standard edition, specimen geometry |
| Time | ISO 8601 UTC | logger clock synchronized to UTC | clock source, drift evidence |

Any quantity not in this table needs a new reviewed row before it can appear in a HELIOGRID or Material Forge surface.

---

## 1. HELIOGRID question register

HELIOGRID is defined in the repository only as *"Falsifiable solar ephemeris and renewable energy telemetry tracking"* with the disallowed interpretation *"Completed quantum energy generator"* (`packages/moonql-ops/src/empire.ts:121-122`), and in the blueprint as a **conditional** app for read-only site/meter/PV/battery analytics after a measured pilot (`BLUEPRINT.md:101`, `:110`).

| ID | Question | Status | Threshold owner |
|---|---|---|---|
| H1 | Does the site meter reconcile with the utility invoice? | `BLOCKED-INSTRUMENT` | M36-01 site/meter, M36-02 class |
| H2 | Is PV yield explained by measured irradiance within uncertainty? | `BLOCKED-INSTRUMENT` | M36-02 (pyranometer cert) |
| H3 | Did a declared intervention change specific energy beyond baseline noise? | `BLOCKED-INSTRUMENT` | M36-02, M36-04 |
| H4 | Is every displayed HELIOGRID figure traceable to a timestamped raw sample? | `TESTABLE-NOW` | M25-02 / M25-04 |
| H5 | Does any computed solar ephemeris match a pinned authoritative almanac? | `BLOCKED-SOURCE` | M25-04 |
| H6 | Can any "generator" claim survive a closed two-meter energy balance? | `BLOCKED-INSTRUMENT` | M36-05, independent lab |

### H1 — Meter reconciliation (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** for an approved pilot site, the cumulative AC energy from the revenue meter equals the utility invoice for the same billing interval, within the combined declared uncertainty.
- **Measurable signal:** ΔkWh between register start and end, with both readings dated in UTC ISO 8601.
- **Instrument / source:** utility revenue meter (pulse/optical/Modbus) **and** the utility invoice or export; meter accuracy class from its datasheet.
- **Pass threshold:** `|E_meter − E_invoice| ≤ U_combined`, where `U_combined = f(accuracy class, invoice rounding)`. Numeric `U_combined` is `U_?` until M36-02 records the class; no tolerance may be guessed.
- **Falsification:** mismatch greater than `U_combined` on two consecutive intervals; a register reset; a timezone or DST offset between register and invoice; missing invoice.
- **Safety boundary:** read-only optical/pulse tap only; no current-transformer, breaker or panel work by anyone without the licensed technician named by M36-01; no writes to the meter; site address and account number never published.
- **NON-CLAIM:** reconciliation proves the *reading* is real. It is not evidence of generation, savings, efficiency, over-unity or any device. No physical actuation is performed or authorised by this question.

### H2 — PV yield versus measured irradiance (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** daily AC PV yield is explained by the measured plane-of-array irradiance integral times the declared array/inverter model, within combined uncertainty.
- **Measurable signal:** kWh/day (AC, meter or inverter log) versus kWh/m²/day (or MJ/m²) from the irradiance sensor, plus module temperature °C.
- **Instrument / source:** calibrated pyranometer/reference cell with certificate, inverter AC log, array nameplate from the datasheet in use.
- **Pass threshold:** residual inside the uncertainty band derived from sensor calibration, inverter measurement error and nameplate tolerance, with **no systematic bias** over a pre-registered observation period whose minimum length is fixed by M36-04. Band values and the period length are `U_?` until the certificates and the analysis plan are recorded (M36-02 / M36-04).
- **Falsification:** yield above the physical bound implied by measured irradiance, nameplate capacity and the declared band; or a bias that persists after temperature/soiling normalisation; or missing irradiance data while yield is still reported.
- **Safety boundary:** DC side is hazardous (arc flash); no DIY DC, no islanding-defeat, no grid-tie change outside licensed work; measurement only, no setpoints.
- **NON-CLAIM:** a PV array converts measured irradiance; matching a model does not demonstrate a new energy source, a generator, over-unity, or any quantum effect. No actuation.

### H3 — Intervention effect versus baseline noise (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** a declared intervention changes specific energy consumption (kWh per defined unit of service) by more than the measured baseline variability.
- **Measurable signal:** kWh per service unit, baseline period versus post period, same meter and same service-unit definition.
- **Instrument / source:** the H1 meter plus a service counter defined per site (for example occupied hours) and recorded by the site operator.
- **Pass threshold:** effect size greater than `max(2σ_baseline, instrument resolution × k)`, with the analysis pre-registered before the intervention. `σ_baseline` and `k` are computed from measured baseline data, not chosen after seeing the result; a minimum baseline length is fixed in advance by M36-04.
- **Falsification:** effect inside the noise band (reported as "no measurable effect"); confound by weather/occupancy that cannot be normalised; baseline shorter than pre-registered; change of meter or tariff mid-period.
- **Safety boundary:** the platform does not perform the intervention; qualified personnel do, under the site's own safety rules; measurement resumes read-only afterwards.
- **NON-CLAIM:** a measured efficiency delta is a site observation, not a generation claim, not over-unity, not a product performance guarantee. No actuation by XV.

### H4 — Provenance of every displayed figure (`TESTABLE-NOW`)

- **Hypothesis:** no HELIOGRID value is displayed unless it is reproducible from a stored raw sample carrying instrument id, UTC timestamp, sample interval and calibration state; gaps are shown, never silently filled.
- **Measurable signal:** count of displayed energy/status values that resolve to a raw sample; count of aggregates published with undisclosed missing intervals.
- **Instrument / source:** the Hub's stored samples and the UI projection; today, a repository grep of every surface that renders HELIOGRID.
- **Pass threshold:** 100% of displayed figures traceable; any gap disclosed next to the figure; simulated values labelled `SIMULATED`.
- **Falsification:** one displayed figure without raw provenance; one simulated value presented as measured; one status badge with no source check (this is exactly the observed HQ defect, see §3).
- **Safety boundary:** raw exports may contain site-identifying data; publish only aggregates with declared geo precision (M24-02), never account numbers or credentials.
- **NON-CLAIM:** provenance proves traceability, not instrument accuracy, not generation, not a working device. No actuation.
- **Current answer (decisive today):** **FAIL.** The only HELIOGRID surface in the repository is the HQ status literal `NOMINAL` with no data binding (`apps/headquarters/src/app/(admin)/page.tsx:231`, committed at `HEAD:...:109`). No energy figure is published anywhere, so no figure is falsely measured — but the status is unsupported.

### H5 — Solar ephemeris claim (`BLOCKED-SOURCE`)

- **Hypothesis:** any solar-position or solar-noon computation for the site agrees with a pinned authoritative almanac for the same coordinates, date and time scale.
- **Measurable signal:** difference in minutes between computed and almanac sunrise/solar-noon; site latitude/longitude at declared precision; UTC date.
- **Instrument / source:** the computation, plus a pinned almanac edition (publisher, edition, digest) — **not present in this repository**; the [M25-01 audit](../audit/M25-01-mtime-antikythera-audit.md) found no ephemeris implementation.
- **Pass threshold:** `|Δ| ≤` the tolerance implied by the almanac's own stated rounding. `U_?` until an edition is pinned; do not invent a tolerance.
- **Falsification:** systematic offset beyond that tolerance; disagreement that changes with latitude; or the absence of any pinned reference, in which case the `empire.ts:121` phrase "solar ephemeris" is marketing text and must be removed from any surface.
- **Safety boundary:** precise site coordinates are sensitive; publish rounded to the precision declared by M24-02. Ephemeris is geometry only.
- **NON-CLAIM:** an ephemeris predicts where the sun is; it does not generate, store or forecast measured energy, and cannot support an over-unity or generator claim. No actuation.

### H6 — Closed energy balance against a "generator" claim (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** no HELIOGRID configuration yields more useful energy than its measured inputs plus documented storage discharge.
- **Measurable signal:** interval energy balance in kWh across two independent, separately calibrated channels (input/import, output/export) plus a storage counter and state of charge.
- **Instrument / source:** two revenue-grade meters on distinct channels (independent devices, independent calibration certificates) plus BMS/inverter counters.
- **Pass threshold:** `E_out ≤ E_in + E_storage_discharge + E_documented_sources + U_combined` for every interval. `U_combined` is `U_?` until both certificates are recorded.
- **Falsification:** `E_out` above that bound beyond uncertainty, repeatable across intervals — and even then the first conclusion must be instrument error; only independent third-party replication could overturn it.
- **Safety boundary:** no grid back-feed experiments, no protection-relay defeat, no unapproved interconnection, no working on energised equipment; the utility's interconnection rules and the site's licensed electrician control any change.
- **NON-CLAIM:** this question does **not** assert a generator exists, is possible, or is planned. It defines the only evidential bar at which such a claim could be discussed at all, and states that the repository currently meets none of it. No physical actuation is performed by XV.

---

## 2. Material Forge question register

Material Forge exists in the repository only as a taxonomy row, *"Materials science research tracker and experimental log"* → *"Empirically tested materials and open hardware component archive"*, status `HISTORICAL_CONCEPT`, disallowed interpretation *"Proven quantum manufacturing hardware"* (`packages/moonql-ops/src/empire.ts:136-142`). The vision keeps it as the horizon "Photon, Proton, Quantum & Material Forge" (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:736`) and forbids the interpretation "Proven quantum/proton manufacturing hardware" (`:892`).

| ID | Question | Status | Threshold owner |
|---|---|---|---|
| F1 | Does any materials protocol, specimen, instrument or lab record exist? | `TESTABLE-NOW` | M25-07 |
| F2 | Can a material property be reported only with method, n, and uncertainty? | `BLOCKED-INSTRUMENT` | M25-07 |
| F3 | Does an independent lab reproduce the claimed property? | `BLOCKED-INSTRUMENT` | M25-07 |
| F4 | Is there any fabricated quantum/proton device artifact? | `TESTABLE-NOW` | M25-07, M24-05 copy |
| F5 | Does the "open hardware component archive" carry licence and safety data? | `TESTABLE-NOW` | M25-07 |

### F1 — Existence of a test record (`TESTABLE-NOW`)

- **Hypothesis:** Material Forge is a name, not a tracker: the repository contains no specimen register, test protocol, instrument calibration record or lab access record.
- **Measurable signal:** count of files, models, tables or rows containing a specimen id, protocol, instrument id or lab reference.
- **Instrument / source:** repository inventory (grep + model registry); no physical instrument needed to answer.
- **Pass threshold:** zero records → hypothesis stands and the horizon is correctly labelled as untested. Any record found must carry every field in F2 or is not a record.
- **Falsification:** a protocol/specimen/lab record with the required metadata would refute "no test record exists" — and would also make F2 executable.
- **Safety boundary:** no physical work is authorised by this question; starting any materials work requires the M25-07 cost/safety/hardware review first.
- **NON-CLAIM:** absence of a test is not evidence that a material is impossible; it is evidence that nothing was tested. No fabrication, no quantum chip, no over-unity, no actuation.
- **Current answer:** **zero** (see audit §5). The only occurrences are the taxonomy string and a UI literal.

### F2 — Property-claim protocol (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** any claimed material property is reportable only as mean ± expanded uncertainty from a pre-declared number of specimens, on a calibrated instrument, using a cited method edition.
- **Measurable signal:** property value in SI units (e.g. Ω·m, W·m⁻¹·K⁻¹, N, g), specimen count `n`, uncertainty, instrument id, calibration date, raw-data digest.
- **Instrument / source:** the calibrated instrument appropriate to the property (four-point probe, guarded hot plate, load frame, balance), its calibration certificate, and the method standard edition actually used.
- **Pass threshold:** all fields present, `n` at or above the pre-registered minimum, calibration valid, and the claimed effect above the **minimum detectable effect** computed *before* testing from instrument resolution, repeatability and specimen variance. `n` and the MDE rule are `U_?` until M25-07 fixes them.
- **Falsification:** any missing field; `n` below pre-registration; effect below MDE; expired calibration; method edition cited but not held under licence.
- **Safety boundary:** dust, fumes, solvents, high temperature, high voltage and pressure each require a lab safety review, PPE and a competent supervisor; no home synthesis, no unlicensed radiation or beam equipment.
- **NON-CLAIM:** a measured property is not a device, not a quantum chip, not a superconductor claim, not manufacturing capability, and not over-unity. No actuation by XV.

### F3 — Independent replication (`BLOCKED-INSTRUMENT`)

- **Hypothesis:** any property claim that would change an engineering decision is reproducible at a second, independent laboratory within combined uncertainty.
- **Measurable signal:** second-lab value ± expanded uncertainty, with the identical protocol digest and specimen provenance.
- **Instrument / source:** a second lab's calibrated instrument and certificate; specimen chain-of-custody record.
- **Pass threshold:** the two expanded uncertainty intervals overlap (or the difference is within combined `k=2` uncertainty). `U_?` until certificates exist.
- **Falsification:** non-overlapping intervals on two independent runs; different protocol digest; specimen provenance broken.
- **Safety boundary:** specimen shipping and publication require rights/consent and hazard labelling; no site-identifying data in public records.
- **NON-CLAIM:** replication is not certification, not production readiness, not a quantum result, not a generator. No actuation.

### F4 — Fabricated-device documentary gate (`TESTABLE-NOW`)

- **Hypothesis:** no repository artifact describes a fabricated quantum device (die/fab id, qubit count, coherence or error metrics, cryostat) or proton-beam manufacturing hardware (beam energy/current, target, shielding).
- **Measurable signal:** count of artifacts containing a device serial, fab/die id, measured device metrics, or beam parameters.
- **Instrument / source:** repository inventory; any future evidence would require an accredited lab's measurement report, not a rendering.
- **Pass threshold:** zero artifacts → the "quantum manufacturing hardware" interpretation is correctly recorded as *disallowed*, and no capability exists to market. One artifact missing metrics still fails.
- **Falsification:** a claim of a built chip with no device id, no measured metric and no independent report is **false**, not "pending".
- **Safety boundary:** radiation-generating equipment is regulated and is out of scope for this project; no beam, no cryogen, no high-voltage work.
- **NON-CLAIM:** no quantum chip, no proton hardware, no fabrication capability, no over-unity, no physical actuation.
- **Current answer:** **zero** (audit §5). Only the negation strings `empire.ts:122`, `:140` exist.

### F5 — Archive provenance (`TESTABLE-NOW`)

- **Hypothesis:** every archived component/material record carries source, licence, version/digest and a safety-data reference before publication.
- **Measurable signal:** count of archive rows missing licence, digest or safety data.
- **Instrument / source:** the (currently absent) archive model/registry; D01/D08 rules for rights and publication.
- **Pass threshold:** 100% of published records carry source + licence + digest; anything missing is withheld, not shown with a placeholder.
- **Falsification:** one published record without licence or digest; one hazardous procedure published without dual-use review.
- **Safety boundary:** no synthesis instructions for hazardous materials; export-control and dual-use review before publication.
- **NON-CLAIM:** an archive entry is not a validated performance claim and is not a product. No fabrication, no actuation.
- **Current answer:** **no archive model exists**; the `xvMapping` string is aspirational.

---

## 3. What the repository currently proves

Classification: **Implemented** (executes) · **Fixture** (static seeded/UI/copy data) · **Declared, unused** (code with no consumer) · **Dead type** (no producer or consumer) · **Doc-only** (prose) · **Absent** (no file, model or table).

| # | Assertion in the repository | Evidence | Class | Proves | Does **not** prove |
|---|---|---|---|---|---|
| 1 | HELIOGRID is an Empire taxonomy row, status `BOUNDED`, with `disallowedInterpretation: 'Completed quantum energy generator'` | `packages/moonql-ops/src/empire.ts:117-125` | Fixture (seeded metadata) | A vocabulary entry and an explicit prohibition exist | Any meter, model, app, ephemeris or device |
| 2 | Material Forge is a taxonomy row, status `HISTORICAL_CONCEPT`, with `disallowedInterpretation: 'Proven quantum manufacturing hardware'` | `packages/moonql-ops/src/empire.ts:135-143` | Fixture (seeded metadata) | Same | Any lab, specimen, archive, chip or hardware |
| 3 | `empire_systems` is a MoonQL model, seeded once, publicly readable, admin-writable | `packages/moonql-ops/src/index.ts:96-113`; ACL default public read (`packages/moonql/src/model.ts:128`) | Implemented | The taxonomy is queryable through REST | Any telemetry, health or energy data — the fields are prose only |
| 4 | `EmpireSystemStatus` / `EmpireSystemCode` declare `HEALTHY/DEGRADED/STANDBY/CRITICAL` | `packages/types/src/sentinel/telemetry.ts:4-25` | Dead type | A status contract was sketched | A producer or consumer; nothing imports it (evidence N7) |
| 5 | HQ renders 14 systems with hardcoded statuses incl. `HELIOGRID → NOMINAL`, `Atmosphere OS → STREAMING`, `Material Forge → STANDBY`, and a `14 / 14 SYNCHRONIZED` badge | worktree `apps/headquarters/src/app/(admin)/page.tsx:219-234`, `:446`; committed `HEAD:…:108-111`, `:318` | Fixture presented as live status | Literal strings exist | Any synchronization, health, telemetry or measurement — **false-live-status defect** |
| 6 | Dock declares `readEmpireOverview()` reading `empireSystemsOverview` | `apps/dock/src/data/queries/journey.ts:42-45` | Declared, unused | A reader was drafted | Any rendered HELIOGRID surface (no consumer found) |
| 7 | HELIOGRID is a *conditional* app for read-only site/meters/PV/battery analytics, "not an energy generator" | `BLUEPRINT.md:101` | Doc-only | Architectural boundary | Existence of the app (`apps/heliogrid` absent) |
| 8 | The pilot "must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation/savings" | `BLUEPRINT.md:110` | Doc-only | The rule this register operationalises | Any pilot, site or meter |
| 9 | HELIOGRID "cannot acquire independent data or IAM owners by default" | `BLUEPRINT.md:157`; `docs/decisions/ADR-0004-empire-surfaces.md:12` | Doc-only (ADR accepted) | Ownership boundary (conditional D17) | D17 acceptance, schema or deployment |
| 10 | No fictional `LIVE`/`NOMINAL` badge is allowed on XV surfaces | `MASTER_DESIGN.md:16`, `:18`; `docs/design/APPS.md:2` | Doc-only contract | The UI rule violated by row 5 | Enforcement — there is no automated check |
| 11 | Strict separation of observation/simulation/hypothesis/fiction; no claim of installed quantum hardware or generators without independent evidence | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:491-497` | Doc-only | The epistemic rule | Any measurement |
| 12 | HELIOGRID's disallowed interpretation is "Completed energy generator"; Material Forge's is "Proven quantum/proton manufacturing hardware" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:890`, `:892` | Doc-only | Normative prohibition | Capability |
| 13 | Closing the readiness gap requires "experiment plans, measurements, licensing and independent verification" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1131` | Doc-only | The required evidence form (this register is one part) | The measurements |
| 14 | Both remain research horizons only | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1217`; `docs/vision/chapters/EMPIRE.md:2` | Doc-only | Horizon status | Implementation |
| 15 | Measured energy is `UNKNOWN`; D17 is only *proposed* | `docs/planning/DOMAIN_COVERAGE.md:4` | Doc-only | Unmeasured and unowned | Any data or owner |
| 16 | M36 is "PLANNED, no implementation implied"; all five leaves are open | `TODO.md:764-772`; `docs/milestones/M36.md:2` | Doc-only | No pilot task has started | Any site, meter or technician |
| 17 | HELIOGRID is described as a "conditional … read-only energy operations app after calibrated pilot" | `README.md:19`; `docs/design/APPS.md:2` | Doc-only | Correct public framing | Deployment |
| 18 | The Sentinel signal type lists `usgs`/`gdacs` platforms; the worker declares only generic drivers | `packages/types/src/sentinel/signals.ts:11`; `apps/sentinel/src/index.ts:26-32` | Type (text platforms) + Implemented OSINT worker | Generic text/feed ingestion exists | Any energy sensor or measurement; no USGS/GDACS driver exists |
| 19 | A test creates a mandate titled "Establish Solar Grid Telemetry" | `apps/arsy/test/journey-patches.test.ts:86`, `:98` | Test fixture | A string exists in a test | Any solar device or telemetry |
| 20 | Creative/copy uses of "energy": `BREATH ELECTRIC` purpose text; "clean energy" journey patch; "Minerals & Energy" radar fixture; mock `platform:'usgs'` signal | `apps/dock/src/app/prisms/page.tsx:17`; `packages/moonql-journey/src/seed.ts:291`; `apps/headquarters/src/ui/client/ThreatRadarMap.tsx:24`; `packages/testing/src/fixtures.ts:40` | Fixture / creative copy | Nothing about HELIOGRID | Any device, meter or measurement (false positives, excluded) |

**Net proof.** The repository proves a *named, bounded research horizon with an explicit prohibition on the two dangerous misreadings*. It does not prove a generator, a chip, a meter, an ephemeris, a lab, an archive, a pilot, a site, an app directory, a data model or a single measured value.

---

## 4. Must-not-ship list (marketing, UI, copy)

These are release-blocking in any surface (Dock, HQ, Cockpit, README, deck, store listing). Owners are the tasks that must remove or re-label them.

| # | Forbidden | Why | Owner |
|---|---|---|---|
| 1 | `HELIOGRID: NOMINAL/ONLINE/ACTIVE` badge without a source check and timestamp (incl. `HELIOGRID → NOMINAL`) | False live status; violates `MASTER_DESIGN.md:16` | **M25-02** (claim type + source); copy defect at `apps/headquarters/src/app/(admin)/page.tsx:231` |
| 2 | `14 / 14 SYNCHRONIZED` | No synchronization mechanism exists | **M25-02** |
| 3 | `Atmosphere OS: STREAMING` | No stream, no sensor ingest is bound to that card (adjacent defect) | **M25-02** / **M24-05** |
| 4 | "Solar ephemeris" as a shipped capability while no ephemeris code or pinned almanac exists | Unbacked capability string (`empire.ts:121`) | **M25-04**, then H5 |
| 5 | Energy output, savings, ROI or "efficiency" numbers from a simulation, fixture or model | Simulated-as-measured | **M25-04** (units/calibration), **M36-04** |
| 6 | "Free energy", "over-unity", "zero-point", "quantum generator", "completed generator" | Explicitly disallowed (`empire.ts:122`, vision `:890`) | **M25-02**; any appearance is a defect, not a pending feature |
| 7 | "Quantum chip", "proton manufacturing", "quantum manufacturing hardware" | Explicitly disallowed (`empire.ts:140`, vision `:892`) | **M25-02** |
| 8 | Material property values without method, `n`, uncertainty and instrument id | Unfalsifiable claim | **M25-07** |
| 9 | Hardware photography or renders labelled as MoonWitness-built or MoonWitness-tested | No device exists | **M25-02**; assets per `ADR-0009` |
| 10 | A live meter dashboard before M36-01 (site/technician), M36-02 (calibration/units) and M36-03 (D17 read-only boundary) | Bypasses the pilot gates | **M36**; UI gate **M25-04** |
| 11 | Any control affordance over energy equipment (breaker, inverter, battery, relay) | Read-only boundary (`BLUEPRINT.md:110`) | **M36-03** |
| 12 | Reproduced standard text (IEC/IEEE/etc.) without a licence; clause numbers presented as held evidence | Rights | **M25-04** / rights gate |
| 13 | Site address, utility account number, meter serial or exact coordinates in public data | Privacy | **M25-04**, **M24-02** |

A surface may describe the horizon. It may not describe an outcome.

---

## 5. Handoffs and boundaries

| Downstream task | What it inherits from this register | What it must not inherit |
|---|---|---|
| **M25-02** Separate physical readings, simulation, astronomy and story modes | H4's provenance rule; the false `NOMINAL`/`SYNCHRONIZED` literals as first input | Any implication that a HELIOGRID reading exists |
| **M25-04** Unit normalisation, calibration, source metadata | §0.1 unit/instrument table; `U_?` placeholders for H1/H2/H6 | Guessed tolerances |
| **M25-07** Cost/safety/hardware feasibility | F1–F3 and the F2 MDE rule; safety boundaries | Authorisation to buy or build hardware |
| **M36-01..05** Measured read-only pilot | H1, H2, H3, H6 as the pilot's acceptance questions | A control channel; a generator |
| **M24-05** Source-backed World Monitor | The `usgs`/`gdacs` distinction (signal label ≠ instrument) | Any claim that Sentinel measures energy |

**Ownership.** No new domain owner, schema, table, package or endpoint is created by this document. If a pilot is ever authorised, D17 remains *proposed* until M36-03 accepts an owner; ARSY/MoonQL stays the only SQL owner for that data.

---

## 6. Acceptance map and rollback

- **M25-03 acceptance "No generator/quantum chip claimed built":** satisfied by evidence — no generator, chip, fabrication or device artifact exists in code, dependencies or lockfile; the only related strings are explicit *disallowed interpretations* (`empire.ts:122`, `:140`) and doc-level prohibitions. The HQ `NOMINAL` badge is a false **status**, not a device, and is routed to M25-02/M24-05 rather than counted as evidence of a build.
- **Falsifiability test of this artifact:** each of the 11 questions names a signal, an instrument class, a threshold rule (or an explicit `U_?` block), a falsification condition and a non-claim; none can be satisfied by prose, a fixture or a rendering.
- **Rollback:** delete this file. Nothing imports it, no schema, route, runtime, TODO status or build configuration references it.

**This document is a question register, not a device specification. It authorises no construction, no purchase, no measurement campaign and no physical action.**
