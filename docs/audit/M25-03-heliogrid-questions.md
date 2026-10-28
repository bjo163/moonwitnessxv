# M25-03 — HELIOGRID / Material Forge research questions (evidence)

- **Task:** M25-03 — Design HELIOGRID/Material Forge falsifiable research questions (`EXECUTABLE LEAF, NOT VERIFIED` in the packet; this file is the design + evidence artifact)
- **Milestone:** [M25](../milestones/M25.md) · Time, Cosmos, Earth science and research horizons
- **Acceptance audited:** `No generator/quantum chip claimed built` ([TODO:582](../../TODO.md))
- **Prerequisite:** M06-05 — closed at `TODO.md:217` (`[x]`), owner map [docs/decisions/M06-05-historical-interfaces-map.md](../decisions/M06-05-historical-interfaces-map.md)
- **baseline_sha:** `a54198bd04705ba191c79e0bd1b36584a885622a` (`dev`, commit date `2026-10-28 12:45:07 +0700`)
- **worker:** read-only design/audit agent
- **Design artifact:** [docs/design/M25-03-heliogrid-material-forge-questions.md](../design/M25-03-heliogrid-material-forge-questions.md)
- **Worktree:** modified by another session before and during this audit (`git status --porcelain` count observed 72 → 75 → 78). Nothing was reverted, staged, committed or edited outside the two new files.
- **Reviewer:** pending (integrator + human reviewer)
- **Rollback:** delete the two new files only.
- **result_sha:** none — nothing committed.

| Required report field | Value |
|---|---|
| `task_id` | M25-03 |
| `baseline_sha` | `a54198bd04705ba191c79e0bd1b36584a885622a` |
| `worker` | read-only design/audit agent |
| `claimed_files` | `docs/design/M25-03-heliogrid-material-forge-questions.md`, `docs/audit/M25-03-heliogrid-questions.md` |
| `actual_changed_files` | the same two files, both new/untracked; no source, TODO, config or lockfile change |
| `positive_test_and_output` | see §4 (P1–P5) |
| `negative_test_and_output` | see §5 (N1–N8) |
| `security_rights_privacy` | no secrets, no site/account data, no external fetch, no schema or ACL change; register forbids publishing site identifiers |
| `reviewer` | pending |
| `rollback` | delete the two new files |
| `result_sha` | none |
| `limitations` | §7 |
| `next_eligible_task` | M25-02 (with the HQ false-status fixture as first input), then M25-04 |

---

## 1. Scope and method

**In scope:** every repository mention of HELIOGRID, HELIOGRID Tracker, Material Forge, and the adjacent energy/materials vocabulary through which a "built device" could be asserted (quantum, generator, over-unity, kWh, inverter, irradiance, battery, meter, lab, specimen, calibration). Surfaces inspected: `packages/moonql-ops/src/empire.ts`, the `empire_systems` model and view in `packages/moonql-ops/src/index.ts`, `packages/types/src/sentinel/telemetry.ts`, `apps/headquarters/src/app/(admin)/page.tsx`, `apps/dock/src/data/queries/journey.ts`, `apps/sentinel/src/index.ts`, the vision narrative, BLUEPRINT, MASTER_DESIGN, APPS, ADR-0004, DOMAIN_COVERAGE, and the M36 task packets.

**Method:** tracked-file `git grep` sweeps (case-insensitive, code-only and doc-only), full reads of the four code files that carry the vocabulary, comparison of committed `HEAD` against the foreign working tree for the HQ page, and a manual read of every produced document. No external source, datasheet, standard, almanac, invoice or measurement was fetched. No test, typecheck, build, database query or deployment was run; this is a documentation leaf and the worktree belongs to another session.

**Out of scope by instruction:** source edits, TODO edits, commits, pushes, hardware, measurement campaigns.

---

## 2. Claim ledger

State vocabulary: **Implemented** = executes at runtime; **Fixture / UI literal** = static seeded or hardcoded display data; **Declared, unused** = code with no consumer; **Dead type** = declared, no producer or consumer; **Generated** = build/SDK output; **Doc-only** = prose/decision text; **Test fixture** = exists only inside a test; **Absent** = no file, model or table.

| # | Claim | Source (file:line) | State | Risk |
|---|---|---|---|---|
| 1 | HELIOGRID Tracker is an Empire row: "Energy and physics research telemetry" → "Falsifiable solar ephemeris and renewable energy telemetry tracking", category `RESEARCH`, status `BOUNDED` | `packages/moonql-ops/src/empire.ts:117-125` | Fixture (seeded taxonomy row) | Medium — the `xvMapping` string reads like a shipped capability; no ephemeris or telemetry code exists |
| 2 | The same row records `disallowedInterpretation: 'Completed quantum energy generator'` | `packages/moonql-ops/src/empire.ts:122` | Fixture (normative negation) | Low — this is the positive guardrail |
| 3 | Material Forge is an Empire row: "Materials science research tracker and experimental log" → "Empirically tested materials and open hardware component archive", status `HISTORICAL_CONCEPT` | `packages/moonql-ops/src/empire.ts:135-143` | Fixture (seeded taxonomy row) | Medium — "empirically tested" and "archive" describe absent artifacts |
| 4 | The same row records `disallowedInterpretation: 'Proven quantum manufacturing hardware'` | `packages/moonql-ops/src/empire.ts:140` | Fixture (normative negation) | Low |
| 5 | `empire_systems` model: fields are seven prose/`sel` columns, `unique: [['code']]`, `acl: ADMIN_WRITE`, seeded once from `EMPIRE_SYSTEMS_SEED` | `packages/moonql-ops/src/index.ts:96-113` | Implemented metadata model | Low — public read, admin write; contains no measurement, health or energy field |
| 6 | Reads default to `public`; `ADMIN_WRITE` constrains only create/update/remove | `packages/moonql/src/model.ts:31-38`, `:128` | Implemented | Low–Medium — the HELIOGRID/Material Forge prose rows are publicly readable through REST |
| 7 | `empireSystemsOverview` view exposes the rows | `packages/moonql-ops/src/index.ts:116-122` | Implemented view | Low |
| 8 | Dock declares `readEmpireOverview()` against that view | `apps/dock/src/data/queries/journey.ts:42-45` | Declared, **no consumer** | Low — dead reader; nothing renders HELIOGRID |
| 9 | Generated SDK contains `empireSystemsOverview` in `ViewName`/`VIEW_NAMES` | `packages/moonql-client/src/generated.ts:5`, `:2548`, `:2560` | Generated artifact | Low |
| 10 | `EmpireSystemCode` union lists 12 codes incl. `HELIOGRID`, `MATERIAL FORGE`, `OBSERVATORY`; `EmpireSystemStatus` declares `HEALTHY/DEGRADED/STANDBY/CRITICAL` | `packages/types/src/sentinel/telemetry.ts:4-25` | **Dead type** — no importer outside this file (N7) | Medium — a health contract with no producer and no consumer; disagrees with the 14-row seed |
| 11 | HQ hardcodes `HELIOGRID → NOMINAL`, `Atmosphere OS → STREAMING`, `Material Forge → STANDBY` in a 14-item literal list | worktree `apps/headquarters/src/app/(admin)/page.tsx:219-234`; committed `HEAD:apps/headquarters/src/app/(admin)/page.tsx:108-111` | Fixture rendered as live status | **High — false-live-status defect** (not device evidence) |
| 12 | HQ panel header carries `14 / 14 SYNCHRONIZED` | worktree `apps/headquarters/src/app/(admin)/page.tsx:446`; committed `HEAD:…:318` | Fixture literal | **High** — asserts a synchronization that does not exist |
| 13 | The HQ panel subtitle says the systems are shown with "telemetry, evidence, and research compute" | worktree `apps/headquarters/src/app/(admin)/page.tsx:445`; committed `HEAD:…:317` | UI literal | High — implies telemetry binding that does not exist |
| 14 | HELIOGRID is a **conditional** app for read-only site/meters/PV/battery analytics, "not an energy generator" | `BLUEPRINT.md:101` | Doc-only (target) | Low — correct boundary; `apps/heliogrid` does not exist (N6) |
| 15 | "HELIOGRID pilot must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation/savings" | `BLUEPRINT.md:110` | Doc-only (rule) | Low — the rule the register operationalises |
| 16 | HELIOGRID cannot acquire independent data/IAM owners by default; conditional D17 | `BLUEPRINT.md:157`; `docs/decisions/ADR-0004-empire-surfaces.md:12` | Doc-only (accepted ADR boundary) | Low |
| 17 | No fictional `LIVE`/`NOMINAL` badge on XV surfaces | `MASTER_DESIGN.md:16`, `:18`; `docs/design/APPS.md:2` | Doc-only contract | Medium — row 11 violates it and nothing enforces it |
| 18 | HELIOGRID's disallowed interpretation is "Completed energy generator"; Material Forge's is "Proven quantum/proton manufacturing hardware"; strict category separation; "no claim of installed quantum hardware, generators, revolutionary energy devices" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:491-497`, `:890`, `:892` | Doc-only | Low — explicit prohibition |
| 19 | The readiness gap requires "experiment plans, measurements, licensing and independent verification" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1131` | Doc-only | Low — names the evidence form used here |
| 20 | Both are retained research horizons only | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1217`; `docs/vision/chapters/EMPIRE.md:2` | Doc-only | Low |
| 21 | Measured energy is `UNKNOWN`; D17 is only *proposed* | `docs/planning/DOMAIN_COVERAGE.md:4` | Doc-only | Low |
| 22 | M36 is "PLANNED, no implementation implied"; M36-01..05 all open | `TODO.md:764-772`; `docs/milestones/M36.md:2` | Doc-only | Low |
| 23 | HELIOGRID is a "conditional … read-only energy operations app after calibrated pilot" | `README.md:19`; `docs/design/APPS.md:2` | Doc-only | Low |
| 24 | A journey test creates a mandate titled "Establish Solar Grid Telemetry" | `apps/arsy/test/journey-patches.test.ts:86`, `:98` | Test fixture | Low |
| 25 | Creative/copy "energy" occurrences: `BREATH ELECTRIC`; "clean energy" journey patch; "Minerals & Energy" radar fixture; mock `platform:'usgs'` signal | `apps/dock/src/app/prisms/page.tsx:17`; `packages/moonql-journey/src/seed.ts:291`; `apps/headquarters/src/ui/client/ThreatRadarMap.tsx:24`; `packages/testing/src/fixtures.ts:40` | Creative copy / test fixture | Low — false positives, excluded |
| 26 | Sentinel signal type allows `platform: 'usgs' \| 'gdacs'`; the worker registry has only `rss`, `api`, `playwright`, `openclaw`, `agent` | `packages/types/src/sentinel/signals.ts:11`; `apps/sentinel/src/index.ts:26-32` | Type + OSINT worker | Low — no environmental sensor or energy provider adapter exists |
| 27 | 144 task-packet files mention HELIOGRID; in all 144 the mention is the negative-test boilerplate "for HELIOGRID include calibrated-measurement versus simulation and no physical actuation" | `docs/tasks/**` | Doc-only template text | Low — not a claim about HELIOGRID |
| 28 | `packages/moonql-ops/dist/empire.js` and `packages/types/dist/...` mirror the strings | untracked build output (`git check-ignore` → `.gitignore:11 dist/`) | Generated, untracked | Low — not evidence either way |

**Summary.** No row is an implementation of a generator, a quantum chip, a meter, an ephemeris, a lab, a specimen, an archive or a pilot. The only *positive* capability-looking statements are taxonomy prose (rows 1, 3) and HQ status literals (rows 11–13). The only *negations* are rows 2, 4, 18.

---

## 3. The register (what the design artifact delivers)

[Design artifact](../design/M25-03-heliogrid-material-forge-questions.md): **11 questions — 6 HELIOGRID (H1–H6), 5 Material Forge (F1–F5)**. Every question carries all seven required elements: hypothesis, measurable signal, instrument/source, pass threshold, falsification condition, safety boundary, NON-CLAIM.

| Status | Count | Questions |
|---|---|---|
| `TESTABLE-NOW` | 4 | H4, F1, F4, F5 |
| `BLOCKED-INSTRUMENT` | 6 | H1, H2, H3, H6, F2, F3 |
| `BLOCKED-SOURCE` | 1 | H5 |

Supporting sections of the design artifact: a 9-row unit/instrument vocabulary (design §0.1), a 20-row "what the repository currently proves" table (design §3), a 13-item must-not-ship list (design §4), and a handoff table (design §5).

**Why the BLOCKED markers are the honest result.** The repository contains no meter, site, technician, pyranometer, inverter, battery, lab, specimen, calibrated instrument, standard edition or almanac. Any numeric tolerance written today would be invented, so the register writes `U_?` and names the task that must supply it (M36-02 for energy, M25-07 for materials). The *method* is complete and falsifiable; only the constant is blocked.

**Question-level decisions already taken today (positive evidence of testability):**

- **H4 (provenance of displayed figures) → FAIL.** The only HELIOGRID surface is a `NOMINAL` badge with no data binding. This is the decisive negative result produced by the register, and it is routed in §6.
- **F1 (any materials protocol/specimen/instrument/lab record?) → zero.** Only the taxonomy string exists.
- **F4 (any fabricated quantum/proton device artifact?) → zero.** Only the two negation strings exist.
- **F5 (archive with licence/digest/safety data?) → no archive model exists.** The `xvMapping` string is aspirational.

---

## 4. Positive evidence (commands and observed output)

All commands run from `Z:\project\moonradio`. `git grep` reads the tracked working tree.

**P1 — baseline identity**

```text
$ git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git status --porcelain | wc -l
dev
a54198bd04705ba191c79e0bd1b36584a885622a
75
```

(The foreign worktree count was 72 before the audit, 75 at this point and 78 at write time; another session is actively editing. None of its files were touched.)

**P2 — every HELIOGRID token in code**

```text
$ git grep -n -i "heliogrid" -- '*.ts' '*.tsx' '*.mjs' '*.json'
apps/headquarters/src/app/(admin)/page.tsx:231:  { code: 'SYS-12', name: 'HELIOGRID', domain: 'Solar energy & physics telemetry tracker', status: 'NOMINAL', tone: 'ok' as const },
packages/moonql-ops/src/empire.ts:118:    code: 'sys_heliogrid',
packages/moonql-ops/src/empire.ts:119:    name: 'HELIOGRID Tracker',
packages/types/src/sentinel/telemetry.ts:13:  | 'HELIOGRID'
```

**P3 — every Material Forge token in code**

```text
$ git grep -n -i "material forge" -- '*.ts' '*.tsx' '*.mjs' '*.json'
apps/headquarters/src/app/(admin)/page.tsx:233:  { code: 'SYS-14', name: 'Material Forge', domain: 'Materials science & physical artifact ledger', status: 'STANDBY', tone: 'night' as const },
packages/moonql-ops/src/empire.ts:137:    name: 'Material Forge',
packages/types/src/sentinel/telemetry.ts:15:  | 'MATERIAL FORGE'
```

**P4 — doc-level provenance of the two horizons (the register's factual base; abridged excerpt, `…` marks elided text)**

```text
$ git grep -n -i "heliogrid\|material forge" -- docs/vision/MASTER_VISION_NARRATIVE_XV.md docs/vision/chapters/EMPIRE.md
docs/vision/...:491 … proton/photon research, optional quantum benchmarking, **Material Forge** …
docs/vision/...:736 63 Earth Command Center · … · 68 HELIOGRID · 69 Photon, Proton, Quantum & Material Forge.
docs/vision/...:890 | HELIOGRID | Energy/physics research tracker | Completed energy generator |
docs/vision/...:892 | Material Forge | Materials science research and experiments | Proven quantum/proton manufacturing hardware |
docs/vision/...:1090 … HELIOGRID proposals | Source integration pilot; no hardware/online claims without tests |
docs/vision/...:1131 | **P2** | Cosmos/HELIOGRID/MTS readiness ambiguity | … | Experiment plans, measurements, licensing and independent verification |
docs/vision/...:1217 - [x] Earth/Atmosphere/Cosmos/HELIOGRID/M-TIME/Material Forge retained as research horizons.
docs/vision/chapters/EMPIRE.md:2 … WORKS and HELIOGRID are proposed horizons, not existing revenue, generation or physical operation.
```

**P5 — the pilot precondition and the boundary rule exist in prose (abridged excerpt)**

```text
$ git grep -n -i "heliogrid\|D17\|energy generator" -- BLUEPRINT.md docs/design/APPS.md README.md docs/decisions/ADR-0004-empire-surfaces.md docs/planning/DOMAIN_COVERAGE.md
BLUEPRINT.md:101 | HELIOGRID | Conditional `apps/heliogrid` | Read-only energy site/meters, PV, battery/UPS/maintenance analytics | Proposed **only after** measured pilot; not an energy generator |
BLUEPRINT.md:110 … HELIOGRID pilot must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation/savings …
BLUEPRINT.md:157 … HELIOGRID cannot acquire independent data or IAM owners by default.
docs/design/APPS.md:2 … HELIOGRID conditional = measured telemetry/units. … No fictional "LIVE" or "NOMINAL" statuses.
README.md:19 … a conditional HELIOGRID read-only energy operations app after calibrated pilot …
docs/decisions/ADR-0004-empire-surfaces.md:12 … HELIOGRID (conditional D17) do not get independent ownership, schemas, or deployments …
docs/planning/DOMAIN_COVERAGE.md:4 … proposed D17 HELIOGRID M36; … measured energy remain UNKNOWN.
```

Interpretation: the register's rules (read-only, units, calibration, technician permission, simulated ≠ measured, no independent data owner) are already the project's own stated rules. The artifact adds the missing part — **how each claim would be falsified, and what would have to be measured**.

---

## 5. Negative evidence (commands and observed output)

**N1 — no quantum implementation, only negations and a UI test label**

```text
$ git grep -n -i "quantum" -- apps packages scripts test
packages/moonql-ops/src/empire.ts:122:    disallowedInterpretation: 'Completed quantum energy generator',
packages/moonql-ops/src/empire.ts:140:    disallowedInterpretation: 'Proven quantum manufacturing hardware',
packages/moonui/test/accessibility.test.ts:171:          title: 'Quantum Diagnostics',
packages/moonui/test/accessibility.test.ts:178:    assert.ok(html.includes('Quantum Diagnostics'))
packages/moonui/test/accessibility.test.ts:182:    assertResolves(html, 'aria-labelledby', 'Quantum Diagnostics')
```

The MoonUI hits are an accessibility-test fixture heading, not a device.

**N2 — no over-unity vocabulary anywhere**

```text
$ git grep -n -i -E "over.unity|perpetual motion|free energy|zero.point|cold fusion|superconduct|electrolys" -- .
(no output; exit 1)
```

**N3 — no energy measurement vocabulary or instrument in code**

```text
$ git grep -n -i -E "\bkwh\b|\bmwh\b|pyranometer|photovoltaic|inverter|irradiance|modbus|smart.?meter|revenue.?meter" -- apps packages scripts test | grep -v generated.ts
Binary file apps/dock/public/art/band-hero.jpg matches
Binary file apps/dock/public/art/poster-ska.jpg matches
Binary file apps/headquarters/public/art/poster-ska.jpg matches
```

The only matches are **binary JPEG byte coincidences** in decorative art; no text assertion, no unit, no instrument, no code path. There is no kWh column, no inverter client, no irradiance model, no meter adapter and no Modbus/optical reader in the repository.

**N4 — the battery vocabulary is creative content only**

```text
$ git grep -n -i "battery" -- apps packages scripts | grep -v generated.ts | grep -v '/dist/'
apps/dock/src/ui/components/sections.tsx:358:                  THE BATTERY
packages/moonql-graph/src/seed.ts:92:      'Fictional ensemble: **THE BATTERIES** …'
packages/moonql-ontology/src/seed.ts:335:    alias: 'The Battery',
```

These are the fictional ensemble, not an energy store (`BLUEPRINT.md:220` already requires `THE BATTERIES ≠ ALLAH`).

**N5 — no materials laboratory artifacts**

```text
$ git grep -n -i -E "specimen|calibration certificate|lab.?protocol" -- apps packages scripts test | grep -v generated.ts | grep -v '/dist/'
apps/sentinel/test/worker-log-contract.test.ts:395:      .map((specimen) => specimen.trim())
apps/sentinel/test/worker-log-contract.test.ts:396:      .filter((specimen) => specimen.length > 0),
```

`specimen` is a local variable in a log-parsing test. `confidenceCalibration` (research quality runs) is a scoring field, not an instrument calibration. No specimen register, protocol, method edition, instrument certificate or lab access record exists.

**N6 — no HELIOGRID app, package, model, table or dependency**

```text
$ ls -d apps/heliogrid 2>/dev/null || echo NO_HELIOGRID_APP
NO_HELIOGRID_APP
$ git grep -n -i -E "heliogrid|quantum|material.forge" -- '**/package.json' pnpm-lock.yaml || echo NO_MATCH
NO_MATCH
```

No package workspace, no manifest dependency, no lockfile entry, no schema/migration, no route, no env var.

**N7 — the declared telemetry contract has no producer or consumer**

```text
$ git grep -n "EmpireSystemStatus\|EmpireSystemCode" -- apps packages | grep -v '/dist/'
packages/types/src/sentinel/telemetry.ts:4:export type EmpireSystemCode =
packages/types/src/sentinel/telemetry.ts:18:export interface EmpireSystemStatus {
packages/types/src/sentinel/telemetry.ts:19:  code: EmpireSystemCode
```

**N8 — the Dock reader is dead code**

```text
$ git grep -n "readEmpireOverview" -- apps packages | grep -v '/dist/'
apps/dock/src/data/queries/journey.ts:42:export async function readEmpireOverview(): Promise<EmpireSystemsOverviewOutput[]> {
```

No import, no page, no component. `empireSystemsOverview` appears only in the generated SDK view list, a Hub test and that function.

**Interpretation.** The repository does not assert, implement or depend on a generator, a quantum chip, a proton device, an over-unity machine, a meter, an inverter, an irradiance sensor, a lab, a specimen, an archive or a pilot. The two research horizons exist as vocabulary and as explicit prohibitions.

---

## 6. FALSE UI literals — defect record and routing

The known HQ finding is **confirmed as a false-live-status defect**, not evidence of a built device.

| Element | Committed location (`HEAD`) | Working-tree location (foreign edit, +122 lines) | What it asserts | What actually exists |
|---|---|---|---|---|
| `HELIOGRID` / `Solar energy & physics telemetry tracker` / `NOMINAL` / tone `ok` | `HEAD:apps/headquarters/src/app/(admin)/page.tsx:109` | `apps/headquarters/src/app/(admin)/page.tsx:231` | that HELIOGRID is nominal and healthy | no meter, no sample, no health source |
| `Material Forge` / `Materials science & physical artifact ledger` / `STANDBY` | `HEAD:…:111` | `:233` | that a materials system is on standby | no lab, no specimen, no archive |
| `14 / 14 SYNCHRONIZED` badge | `HEAD:…:318` | `:446` | that all 14 systems are synchronized | no synchronization mechanism |
| Panel subtitle "telemetry, evidence, and research compute" | `HEAD:…:317` | `:445` | that the panel shows telemetry | static literal list only |

`Atmosphere OS: STREAMING` (`HEAD:…:108`, worktree `:230`) is in the same block and is recorded here as the same class of defect.

**Why this is not M25-03 evidence of a device.** The strings are constants in an array (`EMPIRE_14_SYSTEMS`, `headquarters…page.tsx:219-234`) rendered through `<Badge tone={sys.tone}>{sys.status}</Badge>` (`:466`). No fetch, no model, no timestamp and no per-card status source exists; `EmpireSystemStatus` has no producer (N7). A status badge is a *health* claim, not a *construction* claim.

**Routing (owner discipline):**

- **M25-02** — "Separate physical readings, simulation, astronomy and story modes / UI ontology has explicit claim type and source" ([TODO:581](../../TODO.md)): owns removing or re-typing these badges. The claim ontology must be able to express "no reading", which is exactly what these rows lack.
- **M24-05** — "Build source-backed public World Monitor with stale flags / Not showing stale fixtures as live observations" ([TODO:567](../../TODO.md)): owns the `Atmosphere OS: STREAMING` and environmental-sensor wording, which belongs to the World Monitor surface, not HELIOGRID.
- **M25-04** — unit/calibration/provenance, so that if a HELIOGRID reading ever appears it must carry source, unit and UTC timestamp.
- **M36-01..05** — any future real status; nothing may be shown before the site/calibration/read-only boundary exists.

M25-03 does not edit the page (out of scope, and the file is owned by another session's uncommitted work).

---

## 7. Limitations

- **No measurement, no hardware, no external literature.** No datasheet, standard, almanac, utility invoice or device was consulted, so every numeric tolerance is `U_?` by design. This is a documentary conclusion about *this repository*, not a statement about what a future pilot could show.
- **No test, typecheck, build or deployment was run.** There is no TypeScript change, and the worktree is owned by another session. A green build would not have proven any measurement anyway.
- **`git grep` reads the working tree.** The HQ lines cited have both a committed and a foreign-working-tree location because the other session inserted 122 lines above them; both are recorded. Other foreign edits were not reviewed.
- **Binary false positives.** Three JPEG art files match the energy regex on raw bytes; they contain no readable claim and were not inspected further.
- **Generated and ignored paths.** `packages/moonql-ops/dist`, `packages/types/dist`, `packages/moonql-client/src/generated.ts` and `apps/*/.next` mirror the same strings; `dist/` is git-ignored (`.gitignore:11`) and untracked, so it is not evidence of a distinct implementation.
- **Scope of "absent".** "Absent" means absent from this repository, not impossible or forbidden elsewhere. No sibling/legacy repository was fetched.
- **Register status is not task status.** The 11 questions are design content; their `BLOCKED-*` markers do not close or open M25-04, M25-07 or M36.

---

## 8. Verdict

**READY-TO-CLOSE for the M25-03 acceptance `No generator/quantum chip claimed built`.**

- The repository contains **no** generator, quantum chip, proton/beam hardware, fabrication process, over-unity device, meter, inverter, irradiance sensor, laboratory, specimen or archive — in code, dependencies, lockfile, schema or route (N1–N8).
- The only occurrences of the dangerous vocabulary are **explicit disallowed interpretations** (`packages/moonql-ops/src/empire.ts:122`, `:140`) and doc-level prohibitions (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:890`, `:892`), i.e. the opposite of a build claim.
- The design artifact delivers a **falsifiable** register: 11 questions, seven required fields each, a unit/instrument vocabulary, an explicit "what the repository currently proves" table, and a 13-item must-not-ship list. Four questions are decidable today and all four return decisive answers (H4 provenance FAIL — the HQ `NOMINAL` badge; F1/F4/F5 absent or zero).
- Where a threshold cannot be derived from repository evidence, the register **marks the question BLOCKED** (`BLOCKED-INSTRUMENT` ×6, `BLOCKED-SOURCE` ×1) instead of inventing a number.

**Conditional note for the integrator.** The acceptance is met literally, but the repository still ships a **false live status** for this exact domain: `HELIOGRID: NOMINAL`, `Material Forge: STANDBY`, `14 / 14 SYNCHRONIZED` (`apps/headquarters/src/app/(admin)/page.tsx:231`, `:233`, `:446`; committed at `HEAD:…:109`, `:111`, `:318`). That is a status/claim-ontology defect, not a device claim, and it is routed to M25-02 and M24-05. If the integrator applies the stricter rule that no false capability status may coexist with a closed M25-03, then the leaf is **NOT-CLOSABLE** with that file:line set as the single blocker until M25-02 lands. Recommended: close on the stated acceptance and carry the finding to M25-02/M24-05, as M25-01 already did.

**Next eligible task:** M25-02 (UI claim type + source, with this fixture as first input); M25-04 follows once M25-02 and M25-03 are integrated.
