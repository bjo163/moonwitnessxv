# M25-01 — M-TIME / Antikythera claims and engineering dependencies (evidence)

- **Task:** M25-01 (EXECUTABLE LEAF, read-only audit)
- **Milestone:** [M25](../milestones/M25.md) · Time, Cosmos, Earth science and research horizons
- **Acceptance audited:** `UTC/celestial model and narrative time kept distinct`
- **Prerequisite:** M06-05 — verified closed at `TODO.md:217` (`[x]`), owner map at [docs/decisions/M06-05-historical-interfaces-map.md](../decisions/M06-05-historical-interfaces-map.md). M06-05 contains no time model; time is governed only by the vision constraint cited below.
- **baseline_sha:** `eb3b9f085da73e1e19d8686d467dab95c2b7d13e` (`dev`, commit date `2026-10-28 12:12:56 +0700`)
- **worker:** read-only audit agent
- **Audit date:** 2026-10-28 (baseline date)
- **Worktree:** 76 files were already modified by another session before this audit (`git status --porcelain` count). None were read for edits, reverted, staged or committed. The only file this audit created is this report.
- **Reviewer:** pending (integrator + human reviewer)
- **Rollback:** delete this file only.

## 1. Scope and method

In scope: every repository mention of M-TIME, MTS, Antikythera, Moonwitness Time System, celestial/astronomical time, cosmic time, narrative/prophetic chronology, and every runtime path that produces or stores a time value (Hub `apps/arsy`, monitor `packages/moonql-monitor`, schedule `packages/moonql-schedule`, base ORM `packages/moonql`, actor chronology `packages/moonql-actors`, Dock narrative timeline, MoonUI clock).

Method: tracked-file `git grep` sweeps (case-insensitive), full read of the only celestial-time component, read of ORM field descriptors and model timestamp fields, read of the HQ dashboard fixture, and a Node check of the clock's hard-coded epoch. No external source, ephemeris service or upstream `moonwitness-x` repository was fetched; all external/astronomical accuracy claims are marked **unverified**. No application script, typecheck, test suite, build or deployment was run — this leaf is an audit, and the worktree belongs to another session.

Out of scope by instruction: source edits, TODO edits, commits, pushes.

## 2. Claim ledger

State vocabulary: **Implemented** = executes at runtime; **Fixture** = static UI/demo data; **Dead type** = declared, never imported outside generated `dist`; **Doc-only** = prose/vision; **Absent** = no file or table exists.

| # | Claim | Source (file:line) | State | Risk |
|---|---|---|---|---|
| 1 | M-TIME, Antikythera / Moonwitness Time System is a historical proposal, not shipped | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:491` | Doc-only | Low — correctly framed as proposal |
| 2 | MTS/Antikythera "must not replace standard civil/UTC time in the XV runtime without a separate compatibility, mathematics and operational audit" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:496` | Doc-only constraint (vision, not an accepted ADR) | Medium — no ADR/decision file records this rule; only vision prose |
| 3 | Sibling repo `bjo163/moonwitness-x` is MTS/Antikythera design, "audit claims" | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:637` | Doc-only | Low — no code or dependency imported |
| 4 | M-TIME is `researches` an "astronomical time model" requiring independent verification | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:692` | Doc-only | Low |
| 5 | "M-TIME & Antikythera" is research horizon 67 | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:736`, `:1217` | Doc-only | Low |
| 6 | "MTS (Moon Standard Time) & Celestial Telemetry Clock" with "UTC broadcast synchronization, lunar phase ephemeris, and orbital cycle" | `packages/moonui/src/client/mts-clock.tsx:83-86` | Implemented UI component | **Medium** — names an undefined "Moon Standard Time" and calls a mean-synodic approximation an "ephemeris"; vision defines MTS as the *Moonwitness Time System* sibling project (`:491`, `:637`) |
| 7 | Lunar phase is mean synodic-month arithmetic from a fixed new-moon epoch, no observer/latitude/timezone/true-anomaly terms | `packages/moonui/src/client/mts-clock.tsx:20-23`, `:38-42` | Implemented approximation | Medium — presentational accuracy only; not a time coordinate |
| 8 | Clock shows UTC by default, local time labelled `LOC`, phase rendered as a separate field after a divider | `packages/moonui/src/client/mts-clock.tsx:28-36`, `:96`, `:111-136` | Implemented | Low — UTC/celestial separation is explicit in code |
| 9 | `MtsTelemetryData` with `utc`, `lunarDay`, `lunarPhase`, `moonAgeFraction`, `illuminationPct`, `siderealHours` | `packages/types/src/sentinel/telemetry.ts:27-34` | **Dead type** — declared only; no importer outside `dist` | Low–Medium — an `illuminationPct`/`siderealHours` contract that nothing computes could be mistaken for a built telemetry feed |
| 10 | "Antikythera Seal" avatar preset (`seed: 'mts-antikythera-14'`) | `apps/dock/src/ui/client/GeneratorStudio.tsx:58` | Fixture (decorative avatar seed) | Low — brand naming only; no device or time computation |
| 11 | HELIOGRID `xvMapping: 'Falsifiable solar ephemeris and renewable energy telemetry tracking'` in the Empire registry | `packages/moonql-ops/src/empire.ts:121` | Fixture string in taxonomy data; no HELIOGRID implementation | Medium — describes a capability that does not exist (adjacent, not M-TIME) |
| 12 | 14-system HQ card hardcodes `HELIOGRID` → `NOMINAL`, `Atmosphere OS` → `STREAMING`, and `14 / 14 SYNCHRONIZED` | `apps/headquarters/src/app/(admin)/page.tsx:219-234`, `:444-446` | Fixture presented as live status; no data binding | **High** — false capability claim in shipped UI; violates Master Design's "no fictional `LIVE` or `NOMINAL` badges" rule (`MASTER_DESIGN.md:16`). Not an M-TIME/Antikythera or time-model claim |
| 13 | D10 World/Science owns `earth_observations`, `astronomy_time_records`, `experiment_runs`, `@moonwitness/world` | `docs/decisions/M02-02-domain-assignments.md:29` | Absent — `packages/world` does not exist; no such model in any package | Low — planned G5, labelled Planned |
| 14 | Narrative eras are eight ordinal labels, no dates | `apps/dock/src/app/timeline/page.tsx:4-21`; Hub chat reply `apps/arsy/src/channels/whatsapp.ts:87` | Implemented narrative labels | Low — ordinal `eraNum` only |
| 15 | Historical event chronology is a text label plus confidence enum, never an invented date | `packages/moonql-actors/src/index.ts:317-318`, `:461-462`; `packages/moonql-actors/src/seed.ts:24` | Implemented | Low — positive separation |
| 16 | All MoonQL audit columns are `timestamptz`; `ts()` maps to `timestamp(..., { withTimezone: true })` | `packages/moonql/src/schema.ts:14-15`; `packages/moonql/src/table.ts:80`, `:105-106` | Implemented | Low |
| 17 | Monitor signal times `publishedAt` / `lastCheckedAt` are `ts()` fields written as ISO-8601 Z strings | `packages/moonql-monitor/src/index.ts:180`, `:366`, `:947`, `:952` | Implemented | Low |
| 18 | Schedule stores `weekday` + `startMin`/`endMin` as minutes since UTC midnight | `packages/core/src/time.ts:1-19`; `packages/moonql-schedule/src/index.ts:25-51`; `apps/dock/src/app/schedule/page.tsx:56-57` | Implemented | Low |
| 19 | Hub health/envelope timestamps are ISO-8601 Z strings | `apps/arsy/src/modules/health/index.ts:47`, `:82`; `apps/arsy/src/plugins/envelope.ts:31`, `:49` | Implemented | Low |
| 20 | The MTS clock mounts (`compact`) in Dock, Cockpit and HQ shells | `apps/dock/src/ui/components/shell.tsx:218`; `apps/cockpit/client/components/CockpitTopBar.tsx:74`; `apps/headquarters/src/layouts/vertical.tsx:115` | Implemented | Low — but reaches every operator surface |

`mtime` hits (`apps/cockpit/src/progressTracker.ts:141`, `:198`; assertions `apps/cockpit/test/cockpit.test.ts:281`, `apps/cockpit/test/progress.test.ts:343`) are filesystem modification time for the TODO register, unrelated to M-TIME; recorded here as excluded false positives.

## 3. Time-model finding

Four time vocabularies exist, and they are separated in the shipped code:

1. **Persistence / transport — UTC.** PostgreSQL `timestamp with time zone` (`packages/moonql/src/schema.ts:14-15`; `packages/moonql/src/table.ts:80,105-106`), JSON Schema `format: date-time` (`packages/moonql/src/jsonschema.ts:64-66`), and ISO-8601 `Z` strings from `new Date().toISOString()` (`apps/arsy/src/modules/health/index.ts:47`; `packages/moonql-monitor/src/index.ts:947`). No local-time value is persisted.
2. **Schedule grid — UTC.** Weekday code + minutes since UTC midnight, defined once in `packages/core/src/time.ts` and consumed by `packages/moonql-schedule/src/index.ts`. No DST or timezone conversion code exists.
3. **Narrative / historical time — labels, not timestamps.** Eight ordinal eras (`apps/dock/src/app/timeline/page.tsx:4-21`), and actor-event `chronologyLabel` + `chronologyConfidence` in `{UNDATED, REPORTED_DATE, DISPUTED_DATE, ATTESTED_DATE}` (`packages/moonql-actors/src/seed.ts:24`; `packages/moonql-actors/src/index.ts:317-318`). The model rejects a blank chronology and instructs "Not dated by the source" (`:461-462`).
4. **Celestial model — derived display only.** `packages/moonui/src/client/mts-clock.tsx` derives a lunar phase fraction from the browser `Date` UTC epoch using a fixed mean synodic month (`29.53058867` days) and a fixed new-moon epoch (`1704974220000`), returned as separate fields (`utcStr`, `localStr`, `phasePercent`, `phaseName`) and rendered after a divider. The phase is never stored, sorted, filtered, compared or sent to the Hub.

**Is UTC conflated with narrative or celestial time?** No. The `utcStr` and `phasePercent` fields are distinct derivations of the same `Date`; only `utcStr`/`localStr` are clock readings, and the default view is UTC (`mts-clock.tsx:96`, `:111`). No model, API payload, DB column, index or sort key uses a lunar/MTS value (negative check N3/N4). No narrative label is used as a timestamp (negative check N2).

**Capability accuracy, not conflation.** The component comment claims a "lunar phase ephemeris" (`:86`), but the calculation is an unvalidated mean-synodic approximation: it ignores true anomaly/evection, observer location, illumination fraction and time zone, and there is no test for it (the MoonUI suite has no clock coverage). The visible non-compact label is `MTS {percent}% ({phase})`; the compact label used in all three app shells is only `{percent}%` (`:129-136`). "MTS" is nowhere defined as a standard: the vision's MTS is the *Moonwitness Time System* sibling project (vision `:491`, `:637`), while the code docstring redefines MTS as "Moon Standard Time" (`:83`). This is a terminology/capability-label risk on the UI surface, not a time-base conflation and not a claim that an Antikythera mechanism is built.

## 4. Positive evidence (commands and observed output)

All commands run from `Z:\project\moonradio` at `eb3b9f0`.

```text
$ git rev-parse --abbrev-ref HEAD && git rev-parse HEAD
dev
eb3b9f085da73e1e19d8686d467dab95c2b7d13e

$ git status --porcelain | wc -l
76
```

P1 — every M-TIME / Antikythera mention:

```text
$ git grep -n -i -E "m-time|antikythera" -- '*.md' '*.ts' '*.tsx' '*.json' '*.mjs'
TODO.md:580 (packet row)
apps/dock/src/ui/client/GeneratorStudio.tsx:58:{ label: 'Antikythera Seal', seed: 'mts-antikythera-14', variant: 'emblem' as const },
docs/tasks/M25/M25-01.md:1,6
docs/vision/MASTER_VISION_NARRATIVE_XV.md:491,496,637,692,736,1217
```

P2 — celestial vocabulary (`celestial|ephemeris|sidereal|julian|astronom`) in code:

```text
$ git grep -n -i -E "celestial|ephemeris|sidereal|julian|astronom" -- '*.md' '*.ts' '*.tsx'
packages/moonql-ops/src/empire.ts:121    xvMapping: 'Falsifiable solar ephemeris ...'
packages/moonui/src/client/mts-clock.tsx:83,85,86
packages/types/src/sentinel/telemetry.ts:2,33
(docs rows omitted here; see ledger)
```

P3 — UTC persistence type:

```text
$ git grep -n "withTimezone" -- packages/moonql/src/schema.ts packages/moonql/src/table.ts
packages/moonql/src/schema.ts:14:  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
packages/moonql/src/schema.ts:15:  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
packages/moonql/src/table.ts:80:      col = timestamp(name, { withTimezone: true, mode: 'string' })
packages/moonql/src/table.ts:105:    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
packages/moonql/src/table.ts:106:    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
```

P4 — UTC ISO strings in Hub and monitor:

```text
$ git grep -n "toISOString" -- apps/arsy/src
apps/arsy/src/modules/announcer/tts.ts:32
apps/arsy/src/modules/denpa/index.ts:91,132
apps/arsy/src/modules/health/index.ts:47,82
apps/arsy/src/plugins/envelope.ts:31,49
apps/arsy/src/tools/gen-sdk.ts:231

$ git grep -n "toISOString" -- packages/moonql-monitor/src
packages/moonql-monitor/src/index.ts:947,952
```

P5 — UTC schedule convention:

```text
$ git grep -n -E "weekday|startMin|endMin" -- packages/moonql-schedule/src
packages/moonql-schedule/src/index.ts:25 weekday: sel(DAYS)
packages/moonql-schedule/src/index.ts:31 startMin: int({...})
packages/moonql-schedule/src/index.ts:39 endMin: int({...})
packages/moonql-schedule/src/index.ts:51 unique: [['weekday', 'stationRef', 'startMin']]
$ sed -n '1,22p' packages/core/src/time.ts
 * ... slot times are minutes since UTC midnight ...
export const WEEKDAYS = ['sun','mon','tue','wed','thu','fri','sat'] as const
export const minutesOf = (now: Date): number => now.getUTCHours() * 60 + now.getUTCMinutes()
```

P6 — narrative chronology kept as labels, not timestamps:

```text
$ git grep -n "chronologyLabel\|CHRONOLOGY_CONFIDENCES" -- packages/moonql-actors/src
packages/moonql-actors/src/index.ts:317 chronologyLabel: str({ maxLength: 160, minLength: 1 }),
packages/moonql-actors/src/index.ts:318 chronologyConfidence: sel(CHRONOLOGY_CONFIDENCES, { default: 'UNDATED', index: true }),
packages/moonql-actors/src/index.ts:461-462  throw badRequest('... use "Not dated by the source" instead of a blank')
packages/moonql-actors/src/seed.ts:24 export const CHRONOLOGY_CONFIDENCES = ['UNDATED','REPORTED_DATE','DISPUTED_DATE','ATTESTED_DATE'] as const
```

P7 — narrative eras carry no date field:

```text
$ sed -n '4,21p' apps/dock/src/app/timeline/page.tsx
interface NarrativeEra { eraNum: number; title: string; subtitle: string; tone: ...; description: string }
const ERAS: NarrativeEra[] = [ { eraNum: 1, title: 'BEFORE LIGHT', ... }, ... ]
```

P8 — the clock's fixed epoch resolves as stated, and the phase is a pure fraction of the cycle:

```text
$ node -e "console.log('NEW_MOON_EPOCH ->', new Date(1704974220000).toISOString())"
NEW_MOON_EPOCH -> 2024-01-11T11:57:00.000Z

$ node -e "const S=29.53058867,E=1704974220000; const days=(Date.parse(process.argv[1])-E)/86400000; const f=((days%S)+S)%S/S; console.log('fraction', f.toFixed(4), 'percent', Math.round(f*100))" 2026-10-26T00:00:00Z
fraction 0.4897 percent 49
```

## 5. Negative evidence (commands and observed output)

N1 — no Antikythera device/mechanism in any runtime source, test or manifest; the only code hit is a decorative avatar label:

```text
$ git grep -n -i "antikythera" -- .
TODO.md:580
apps/dock/src/ui/client/GeneratorStudio.tsx:58
docs/tasks/M25/M25-01.md:1,6
docs/vision/MASTER_VISION_NARRATIVE_XV.md:491,496,637,736
```

N2 — no lunar/MTS value is a data-model field, and no narrative label is stored as a timestamp:

```text
$ git grep -n -i -E "lunar|sidereal|ephemeris|\bmts\b" -- . | grep -vE "^docs/|^TODO|/dist/|node_modules"
apps/dock/src/ui/client/GeneratorStudio.tsx:58  (seed string only)
packages/moonql-ops/src/empire.ts:121           (taxonomy prose)
packages/moonui/src/client/index.ts:24          (export path)
packages/moonui/src/client/mts-clock.tsx:9,12,17,25,45,49,52,55,58,... (clock only)
packages/types/src/sentinel/telemetry.ts:2,27-33 (unused type)
```

N3 — the celestial fields exist only inside the clock file (never persisted, compared or ordered):

```text
$ git grep -n -E "phasePercent|phaseName|lunarIcon|calculateLunarTelemetry" -- apps packages | grep -v '/dist/'
packages/moonui/src/client/mts-clock.tsx:15,16,17,25,42,44,45,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,76,77,78,94,100,126,129,134
```

N4 — the declared MTS telemetry type has no consumer and no producer:

```text
$ git grep -n "MtsTelemetryData" -- apps packages | grep -v '/dist/'
packages/types/src/sentinel/telemetry.ts:27:export interface MtsTelemetryData {
```

N5 — no MTS/Antikythera package dependency or lockfile entry:

```text
$ git grep -n -i -E "antikythera|\bmts\b" -- '**/package.json' 'pnpm-lock.yaml'
(no output, exit 1)
```

N6 — no D10 world/astronomy tables or package:

```text
$ git grep -n -i -E "astronomy_time_records|earth_observations|experiment_runs" -- packages apps test scripts
(no output)
$ ls packages/world
ls: cannot access 'packages/world': No such file or directory
```

N7 — the MTS clock is untested (no test references it):

```text
$ git grep -n -i "clock\|lunar" -- packages/moonui/test
(no output)
```

Interpretation: the repository does not assert that an Antikythera mechanism, an MTS time standard, an ephemeris service, a sidereal clock or an astronomy data store is implemented. The "MTS" strings are a UI label, a dead type name and taxonomy prose.

## 6. Risks and assigned gaps

| Finding | Severity | Why it is not an M25-01 acceptance failure | Follow-up owner |
|---|---|---|---|
| `mts-clock.tsx:83-86` calls a mean-synodic phase a "lunar phase ephemeris" and names it "Moon Standard Time" (undefined; collides with the vision's Moonwitness Time System) | Medium | The displayed clock value is UTC/local; the phase is separate, unpersisted, unordered. No UTC replacement occurs | **M25-02** (explicit claim type + source in the UI ontology) and **M25-05** (Cosmos/Time explorer must be labelled proposal, "not discoverable as shipped feature") |
| `MtsTelemetryData` (`packages/types/src/sentinel/telemetry.ts:27-34`) advertises `illuminationPct`/`siderealHours` that nothing computes | Low–Medium | Dead declaration; no runtime or API surface uses it | **M25-02**; delete or implement with M25-04 normalization |
| HQ hardcodes HELIOGRID `NOMINAL`, Atmosphere `STREAMING`, `14 / 14 SYNCHRONIZED` (`apps/headquarters/src/app/(admin)/page.tsx:219-234`, `:444-446`) | High (capability), not a time defect | Not M-TIME/Antikythera and not a time-base conflation; no time value is affected | **M25-02** (claim type/source), **M25-03** (no unbuilt HELIOGRID capability), **M25-04** (no simulated value as sensor data) |
| `empire.ts:121` describes HELIOGRID as tracking a "solar ephemeris" | Medium | Taxonomy string, not a time model | **M25-03**, then **M36** |
| No test covers the clock or its phase arithmetic | Medium (evidence gap) | Presentational component; acceptance is about separation, which is visible in code and greps | **M25-02** |
| MTS/UTC compatibility rule lives only in vision prose (`:496`), not in an accepted ADR | Medium (governance) | No code violates it today | Milestone owner / future ADR if any MTS runtime work is authorized |

## 7. Limitations

- Read-only static audit. No browser render, no wall-clock observation, no timezone-matrix check, no test execution, no typecheck, no build, no deployment. Configuration and green CI would not prove deployment in any case.
- The lunar phase approximation was not compared against an authoritative ephemeris; per task instruction no external source was fetched, so its numerical accuracy is **unverified**. Only the code's structure and constants were verified.
- The 76-file foreign worktree change set was not reviewed for time-related edits; findings describe the committed tree at `eb3b9f0` plus the new file. `git grep` reads the working tree, so a foreign edit could have influenced a match; no modified file is among the time-model files cited except `apps/headquarters/src/app/(admin)/page.tsx` and `apps/dock/src/ui/components/shell.tsx` (listed as modified by the other session). Their cited lines are status/label constants, not time handling; the audit did not revert or alter them.
- External claims about `bjo163/moonwitness-x` (ADR-level mathematics, Rust/Go/Python/TS design) are **unverified** and were not used.
- "Narrative time" has no formal schema in the repository; the audit treats ordinal eras and `chronologyLabel`/`chronologyConfidence` as its only shipped representations.

## 8. Verdict

**READY-TO-CLOSE for the M25-01 acceptance `UTC/celestial model and narrative time kept distinct`.**

- UTC is the only persisted/transported time base (`timestamptz`, ISO-8601 `Z`, UTC-minute schedule). Implemented and evidenced.
- Narrative/historical time is ordinal labels and text chronology with a confidence enum; it is never a timestamp. Implemented and evidenced.
- The celestial value is a derived, unpersisted phase fraction rendered separately from the UTC reading; no code treats it as a time coordinate. Implemented and evidenced.
- No runtime code claims an Antikythera mechanism, MTS time standard, ephemeris service or astronomy store is built (N1–N6).

Conditional note for the integrator: this audit did find an adjacent **false capability claim** in shipped UI — hardcoded `HELIOGRID: NOMINAL`, `Atmosphere OS: STREAMING` and `14 / 14 SYNCHRONIZED` at `apps/headquarters/src/app/(admin)/page.tsx:219-234,444-446`. It is not an M-TIME/Antikythera claim and does not affect the UTC/narrative acceptance, so it does not block this leaf. If the integrator applies the stricter rule that no false capability claim anywhere in the M25 family may coexist with a closed M25-01, then M25-01 is **NOT-CLOSABLE** with that file:line as the blocker until M25-02 owns it. Recommended: close M25-01 on its stated acceptance and carry the finding into M25-02/M25-03.

**Next eligible task:** M25-02 (UI claim type + source) with the HQ status fixture as first input; M25-05 depends on this leaf.
