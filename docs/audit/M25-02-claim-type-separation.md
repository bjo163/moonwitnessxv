# M25-02 — Claim type separation (evidence)

| Required report field | Value |
|---|---|
| `task_id` | M25-02 |
| `baseline_sha` | `18cca2f78a567774b407c33483e75d5619390b11` |
| `baseline_branch` | `dev` |
| `worker` | single-owner leaf worker (implementation + evidence) |
| `claimed_files` | `packages/moonui/src/claim-type.ts`; `packages/moonui/test/claim-type.test.ts`; `docs/design/M25-02-claim-type-separation.md`; `docs/audit/M25-02-claim-type-separation.md` |
| `actual_changed_files` | the four claimed files only, all new/untracked; no tracked file, manifest, TODO, tsconfig, lockfile or index barrel changed |
| `positive_test_and_output` | §4 P1 (5/5 pass) and P2 (18/18) |
| `negative_test_and_output` | §4 N1 (13/13 pass) |
| `result_sha` | none — nothing committed |
| `reviewer` | pending (integrator + human reviewer) |
| `rollback` | delete the four files; `dist/` is gitignored and regenerated |
| `next_eligible_task` | M25-04 (prereqs M25-02 and M25-03) |

**Scope source.** No packet exists for M25-02 (`docs/tasks/M25/` has only M25-01, M25-03, M25-04, M25-06, M25-07). The scope is the TODO row `TODO.md:581` — *"Separate physical readings, simulation, astronomy and story modes"*, acceptance *"UI ontology has explicit claim type and source"* — plus the delegated statement. Prerequisite M24-02 is closed.

## 1. Baseline and worktree

```text
$ git rev-parse HEAD
18cca2f78a567774b407c33483e75d5619390b11
$ git rev-parse --abbrev-ref HEAD
dev
$ git status --porcelain | wc -l
90
```

The worktree was already dirty in unrelated paths (`TODO.md`, cockpit UI, audit screenshots, empire-web assets, `next-env.d.ts` files). Nothing outside the four claimed files was read for edits, reverted, staged or committed. `TODO.md` has a large pre-existing working-tree diff owned by another session; its M25-02 row was read, not changed. The package build wrote only gitignored `packages/moonui/dist/` output:

```text
$ git check-ignore -v packages/moonui/dist/claim-type.js
.gitignore:11:dist/	packages/moonui/dist/claim-type.js
```

## 2. What was inspected before writing

- `docs/audit/M25-01-mtime-antikythera-audit.md` — UTC/narrative/celestial separation, the MTS clock finding, and the routed risks.
- `docs/audit/M25-03-heliogrid-questions.md` and `docs/design/M25-03-heliogrid-material-forge-questions.md` — measured ≠ simulated ≠ forecast ≠ fiction.
- `docs/audit/M25-05-cosmos-explorer-proposal.md`, `docs/design/M25-05-cosmos-time-explorer-sketch.md:48-69` — the four-type proposal and its owed decision D2.
- `docs/milestones/M25.md`, `docs/tasks/M25/M25-04.md`, `TODO.md:580-586`.
- `apps/dock/src` (routes, timeline, landing copy) and `packages/moonui` (clock, tests, tsconfig, package manifest).
- `packages/moonql-*` for source/claim metadata: `moonql-research` projection labels, `moonql-actors` source requirement and chronology, `moonql-monitor` source refs, `packages/core` tracing/time, `packages/types` telemetry.

## 3. Design decision: package and test location

`packages/moonui` exists, its `tsconfig.json` includes `src`, and `tsc -b` compiles a new additive `src/claim-type.ts` without any manifest, export-map or tsconfig change. It is therefore the chosen home. The module is **not** re-exported from `packages/moonui/src/index.ts` (confirmed: no `claim-type` match), so the package's public barrel and build contract are unchanged.

Tests follow the package's existing convention exactly: `test/*.test.ts` with `node:test`, importing the built file from `../dist/` (compare `test/tokens.test.ts:1-9`). The package's own script runs `tsc -b && node --experimental-strip-types --test test/**/*.test.ts`.

## 4. Command log (verbatim observed output)

### P1 — focused positive cases

```text
$ node --experimental-strip-types --test --test-name-pattern "exports|allows" test/claim-type.test.ts
▶ M25-02 claim type separation contract
  ✔ exports the four claim types in stable order (1.0088ms)
  ✔ allows a physical reading with instrument, calibration, UTC time and source (0.256ms)
  ✔ allows a simulation with model, inputs and an explicit non-measurement notice (0.1308ms)
  ✔ allows astronomy with algorithm, inputs and uncertainty (0.0913ms)
  ✔ allows a story with a story source (0.083ms)
✔ M25-02 claim type separation contract (2.9968ms)
ℹ tests 5
ℹ suites 1
ℹ pass 5
ℹ fail 0
```

### N1 — focused negative/refusal cases

```text
$ node --experimental-strip-types --test --test-name-pattern "withholds|refuses" test/claim-type.test.ts
▶ M25-02 claim type separation contract
  ✔ withholds a readout with no claim type instead of inferring one (0.8483ms)
  ✔ withholds an unknown claim type and echoes no type (0.57ms)
  ✔ withholds a simulation without a model or inputs (0.1246ms)
  ✔ withholds a simulation without an explicit non-measurement notice (0.1211ms)
  ✔ withholds astronomy without an algorithm or inputs (0.1006ms)
  ✔ withholds astronomy without stated uncertainty (0.0998ms)
  ✔ withholds a physical reading without an instrument (0.0761ms)
  ✔ withholds a physical reading without calibration or a UTC timestamp (0.1469ms)
  ✔ refuses a story labelled as a measurement (0.1158ms)
  ✔ refuses a simulation or a physical reading presented in the wrong mode (0.1444ms)
  ✔ withholds an untrusted source (0.1025ms)
  ✔ withholds a readout with no source (0.0617ms)
  ✔ withholds an unrecognized presentation mode (0.0741ms)
✔ M25-02 claim type separation contract (3.7407ms)
ℹ tests 13
ℹ suites 1
ℹ pass 13
ℹ fail 0
```

Every refusal case uses a hostile source string and asserts `sourceRef === null`, the exact reason code, and that neither `JSON.stringify(result)` nor any property value contains the source text. The contract itself never interpolates input into a reason.

### P2 — full focused suite (before packaging)

```text
$ node --experimental-strip-types --test test/claim-type.test.ts
ℹ tests 18
ℹ suites 1
ℹ pass 18
ℹ fail 0
```

### P3 — package build and its own test filter

```text
$ pnpm --filter @moonwitness/moonui build
> @moonwitness/moonui@1.0.0 build Z:\project\moonradio\packages\moonui
> tsc -b

$ pnpm --filter @moonwitness/moonui test
...
ℹ tests 58
ℹ suites 9
ℹ pass 58
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The 58 include the 18 new cases plus the existing accessibility, components, experience-token and token suites; no pre-existing test regressed.

### P4 — typecheck and lint

```text
$ pnpm --filter @moonwitness/moonui typecheck
> @moonwitness/moonui@1.0.0 typecheck Z:\project\moonradio\packages\moonui
> tsc --noEmit

TYPECHECK_EXIT=0

$ pnpm exec eslint packages/moonui/src/claim-type.ts packages/moonui/test/claim-type.test.ts
ESLINT_EXIT=0
```

No ESLint diagnostics were emitted.

### P5 — barrel and vocabulary checks

```text
$ grep -n "claim-type" packages/moonui/src/index.ts
INDEX_GREP_EXIT=1
```

No export was added. The only other `claimType` vocabulary at this baseline (the two new files filtered out) is a test-only Sentinel contract:

```text
$ grep -rn -E "claimType|claim_type" --include=*.ts --include=*.tsx packages apps | grep -v node_modules | grep -v '/dist/' | grep -v 'moonui/src/claim-type.ts' | grep -v 'moonui/test/claim-type.test.ts'
apps/sentinel/test/moderation-review-contract.test.ts:11:    claimType: 'SOCIAL_SIGNAL',
apps/sentinel/test/moderation-review-contract.test.ts:28:    claimType: 'PHYSICAL_OBSERVATION',
apps/sentinel/test/moderation-review-contract.ts:34:  claimType: ClaimType | string
apps/sentinel/test/moderation-review-contract.ts:76:  if (!CLAIM_TYPES.has(intent.claimType as ClaimType)) {
...
```

Its `ClaimType = PHYSICAL_OBSERVATION | SOCIAL_SIGNAL | THEOLOGICAL_UNCERTAINTY | THEOLOGICAL_CERTAINTY` (`apps/sentinel/test/moderation-review-contract.ts:23-27`) is a moderation-policy axis, test-only, with no production importer. It is neither a readout provenance contract nor a duplicate of M25-02; the design doc records the boundary.

### P6 — HQ false-live literals (M25-01's routed finding)
```text
$ grep -n -E "NOMINAL|STREAMING|SYNCHRONIZED" 'apps/headquarters/src/app/(admin)/page.tsx'
GREP_EXIT=1
```

At this baseline the hardcoded `HELIOGRID: NOMINAL`, `Atmosphere OS: STREAMING`, `14 / 14 SYNCHRONIZED` literals reported by M25-01 at `eb3b9f0` are **absent from the tracked file**. The current copy is honest reference-catalogue text: HELIOGRID is a concept with "no measured feed is configured" (`:231`) and the panel states "No live telemetry, synchronization, or physical measurements are reported" (`:447-449`). This is an observed baseline change, not a change made by this leaf.

### P7 — final changed-file verification

```text
$ git status --porcelain -- packages/moonui/src/claim-type.ts packages/moonui/test/claim-type.test.ts docs/design/M25-02-claim-type-separation.md docs/audit/M25-02-claim-type-separation.md
?? docs/audit/M25-02-claim-type-separation.md
?? docs/design/M25-02-claim-type-separation.md
?? packages/moonui/src/claim-type.ts
?? packages/moonui/test/claim-type.test.ts

$ git diff --name-only -- packages/moonui docs/design/M25-02-claim-type-separation.md docs/audit/M25-02-claim-type-separation.md
(no output)
```

Four untracked files, zero tracked modifications in the claimed scope. The worktree reported 30 untracked entries in total (26 unrelated to this leaf and owned by other sessions).

## 5. Claim type to observed field mapping

| Claim type | Real observed field/vocabulary | file:line | State |
|---|---|---|---|
| `PHYSICAL_READING` | Mandatory actor `sourceRef`, rejected when blank | `packages/moonql-actors/src/index.ts:82-84` | Source exists; instrument/calibration/readout time do not |
| `PHYSICAL_READING` | UTC persistence `timestamp with time zone` | `packages/moonql/src/schema.ts:14-15` | Implemented |
| `PHYSICAL_READING` | UTC minutes-since-midnight schedule helper | `packages/core/src/time.ts:1-19` | Implemented |
| `PHYSICAL_READING` | `SCIENTIFIC_OBSERVATION` class, `d10.scientific_observation` kind | `packages/moonql-research/src/projection-label.ts:58`, `:115` | Projection-only analogue |
| `SIMULATION` | Dead `MtsTelemetryData` (`illuminationPct`, `siderealHours`) | `packages/types/src/sentinel/telemetry.ts:27-34` | Declared, never produced or imported outside `dist` |
| `SIMULATION` | Mean-synodic fraction, fixed epoch | `packages/moonui/src/client/mts-clock.tsx:21-23`, `:38-42` | Arithmetic display, no model/inputs/notice |
| `ASTRONOMY` | Docstring calls the arithmetic a "lunar phase ephemeris", "Moon Standard Time" | `packages/moonui/src/client/mts-clock.tsx:80-86` | Present, unmodified, must not be promoted |
| `ASTRONOMY` | HELIOGRID taxonomy "Falsifiable solar ephemeris" | `packages/moonql-ops/src/empire.ts:121` | Taxonomy prose only |
| `STORY` | Eight ordinal eras, no date field | `apps/dock/src/app/timeline/page.tsx:4-21` | Implemented labels |
| `STORY` | `chronologyLabel` + `CHRONOLOGY_CONFIDENCES` | `packages/moonql-actors/src/index.ts:317-318`; `packages/moonql-actors/src/seed.ts:24` | Implemented |
| Source trust analogue | `epistemicStatus` enum | `packages/moonql-actors/src/index.ts:272`; `packages/moonql-actors/src/seed.ts:20` | Actor-only; no readout `sourceTrust` |
| Withholding precedent | Sample signals withheld until source/time/freshness exist | `apps/dock/src/lib/landing-copy.ts:70-72`, `:191-193` | Implemented UI copy, both locales |
| Locale display precedent | Frozen en/id epistemic display table | `packages/moonql-research/src/projection-label.ts:128-160` | Implemented |
| Moderation claim axis | Test-only `ClaimType` (four values) | `apps/sentinel/test/moderation-review-contract.ts:23-27` | Test-only, no production import |

## 6. Security, privacy and rights

- No network access, no external ephemeris, almanac or observation data, no site identifiers, no account data and no secrets. All fixtures are synthetic and use `secret.invalid` hostnames.
- The refusal path is structurally leak-free: `WITHHELD` returns `sourceRef: null`, fixed ASCII reason codes and no input text. Tests assert this against a hostile source string.
- The contract carries references (`instrumentRef`, `modelRef`, `algorithmRef`, `sourceRef`), not raw measured values, so it does not become a second store of witness or media content.
- No rights, consent, ACL, schema or public-read behavior is changed; no route, page, sitemap or navigation entry is added.
- The new files contain no private material and are safe to publish in the repository.

## 7. Rollback

Delete:

- `packages/moonui/src/claim-type.ts`
- `packages/moonui/test/claim-type.test.ts`
- `docs/design/M25-02-claim-type-separation.md`
- `docs/audit/M25-02-claim-type-separation.md`

`dist/claim-type.js` and `.d.ts` are gitignored build output and are removed by the repository clean or regenerated on the next build. Nothing imports the module; no TODO, manifest, tsconfig, route, schema or existing source file changes.

## 8. Limitations

- No packet exists for M25-02; scope was derived from the TODO row and delegated statement, as stated here and in the design doc.
- This is a contract and test deliverable, not a production UI change. No component, route or renderer consumes it, and the MTS header clock still carries its old "ephemeris" docstring and `MTS {percent}%` label (`packages/moonui/src/client/mts-clock.tsx:80-86`, `:123-136`). The contract makes the correct framing possible; it does not apply it.
- The module is not exported from the MoonUI barrel, so it is reachable only by deep path inside the monorepo until an adopting task decides the public surface.
- `instrumentRef`, `calibrationRef` and `uncertainty` are string references. No unit normalization, calibration model or uncertainty computation exists here; M25-04 owns those.
- The tests prove contract behavior on synthetic fixtures only. They do not prove that any real producer will populate the fields, and they do not validate any physical or astronomical value.
- The working tree was shared and dirty (90 entries observed). Results describe the four new files at `18cca2f`; unrelated edits by other sessions were not reviewed.
- `TODO.md` was not edited; M25-02 closure and status remain the integrator's decision.

## 9. Verdict and handoff

The acceptance *"UI ontology has explicit claim type and source"* is met at the contract level: four explicit claim types, one source per readout, producer-supplied type, fail-closed withholding, stable refusal codes, en/id copy, and tests proving both positive and negative paths. It is **not** evidence of a shipped UI, a meter, a model or an ephemeris.

**Next eligible task:** M25-04 — *Define unit normalization, measurement/calibration and source metadata* (prerequisites M25-02 and M25-03; M25-03 is closed, and this delivery supplies M25-02's contract for integrator review). M25-06 also depends on M25-02 but additionally on M07-05.
