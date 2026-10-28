# M24-01 — USGS / GDACS / NOAA / Open-Meteo provider audit (evidence)

- **Task:** M24-01 — Audit A-L-L-A-H USGS/GDACS/NOAA/Open-Meteo historical code and terms
- **Milestone:** [M24](../milestones/M24.md) · World Monitor and sourced external observations
- **Acceptance audited:** `Historical fixtures not mislabeled live production` ([TODO:563](../../TODO.md))
- **Prerequisite:** M06-05 — closed; A-L-L-A-H mapped to D00 as "Disambiguated acronym taxonomy only" ([docs/decisions/M06-05-historical-interfaces-map.md:18](../decisions/M06-05-historical-interfaces-map.md))
- **baseline_sha:** `659da2855f56c61ae9d21e2995be9649c77fc470` (`dev`; task baseline stated as `659da28`)
- **observed_head_sha:** `91a5ff7f2d9f94fa764115e4c875b6fb443bc453` — `dev` advanced 32 commits during the audit (unrelated M16/M21/M23/M25/M26/M31, HQ editor, witness lineage, AIGateway work, plus external commit `f86bede` that recorded these three audit files); `659da28` is an ancestor and HEAD kept moving while the concurrent session worked. Across every cited path the only changes are `.env.example` `API_VERSION` (`2.0.0` → `2.1.0`) and `apps/dock/src/lib/landing-copy.ts` `heroEyebrow` in both locales; the cited `EGRESS_ENABLED=false` line 150 and landing-copy lines 70/72 are unchanged, and all 73 ledger quotes were re-resolved (§9 P2)
- **worker:** read-only audit agent
- **Audit date:** 2026-10-28
- **Worktree:** 72 files were already modified by another session at audit start; the count was 76 at last check and fluctuated while that session edited and committed. Nothing foreign was reverted, staged, edited or committed by this audit. The only files this audit created are this report, its JSON ledger and its validator; the concurrent session subsequently included those three files in its external commit `f86bede`, which this audit did not create.
- **Packet:** `docs/tasks/M24/M24-01.md` **does not exist**. Scope was taken from `TODO.md:563` and `docs/milestones/M24.md`.
- **Reviewer:** pending (integrator + human reviewer)
- **Rollback:** delete the three new files listed in §8. No other state was touched.
- **result_sha:** `f86bede` — external commit by the concurrent session that contains the three deliverables. This audit created no commit, staged nothing and amended nothing; the working tree may hold later edits to these three files.

---

## 1. Scope and method

**In scope.** Every repository occurrence of USGS, GDACS, NOAA and Open-Meteo; the A-L-L-A-H historical interface and its source pin; HELIOGRID and Atmosphere OS code that could carry an environmental-provider claim; provider URLs, clients, fixtures, historical sample data, feature flags, user-visible "live" language, and any provider terms, licence, attribution or quota text.

**Method.** Read-only static audit: baseline-commit `git grep` sweeps, working-tree `grep` of source, full reads of the six cited source files and the four UI files, comparison of committed `HEAD` against the foreign working tree for the Headquarters page, and a dependency-free ledger validator (`scripts/check-m24-01-provider-audit.mjs`) that resolves every quote at its cited `file:line`.

No external source was fetched. No provider terms page, licence, quota table, API documentation or external A-L-L-A-H repository was read. No application script, test suite, typecheck, build, database query, browser render or deployment was run.

**Evidence classes used in the ledger.**

| Class | Meaning |
|---|---|
| `REPO_EVIDENCE` | The artifact exists in repository code, data or a decision record. |
| `FIXTURE_ONLY` | Static seeded or hardcoded data with no provider data path. |
| `DOC_ONLY_PLAN` | Prose, vision or plan text; no implementation. |
| `REPORTED_TERMS` | A provider terms/licence statement reported **in the repository**. Zero rows: no such text exists. |

**Live verdicts.** `LIVE_IMPLEMENTED`, `CONTROL_IMPLEMENTED`, `FIXTURE_ONLY_NOT_LIVE`, `FIXTURE_PRESENTED_AS_LIVE`, `TOKEN_ONLY_NOT_LIVE`, `DOC_ONLY_NOT_IMPLEMENTED`, `ABSENT`.

---

## 2. Baseline result

The machine ledger [docs/data/M24-01-provider-audit.json](../data/M24-01-provider-audit.json) contains **29 rows**, **6 subjects** and **73 quote checks**.

| Subject | Rows | Strongest artifact in the repository | Provider client | Provider URL | Fixture-only rows | Terms status |
|---|---:|---|---:|---:|---:|---|
| USGS | 5 | `createMockSignal` test fixture (`packages/testing/src/fixtures.ts:40`) | No | 0 | 1 | `NOT_IN_REPO` |
| GDACS | 3 | Type union member (`packages/types/src/sentinel/signals.ts:11`) and prose (`packages/moonql-ops/src/empire.ts:112`) | No | 0 | 0 | `NOT_IN_REPO` |
| NOAA | 1 | Vision sentence only (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:863`) | No | 0 | 0 | `NOT_IN_REPO` |
| Open-Meteo | 1 | Vision sentence only (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:863`) | No | 0 | 0 | `NOT_IN_REPO` |
| A-L-L-A-H | 15 | `TAXONOMY_ONLY` pin (`docs/audit/M06-01-source-repo-pins.md:21`); XV-native monitor seeds | No | 0 | 4 | `NOT_IN_REPO` |
| HELIOGRID | 4 | Static Empire row (`packages/moonql-ops/src/empire.ts:121`) and HQ badge | No | 0 | 1 | `NOT_IN_REPO` |

**Baseline conclusion.** No provider client, no provider URL, no provider-specific feature flag, no historical sample observation and no provider terms artefact exists for USGS, GDACS, NOAA or Open-Meteo. Two providers (NOAA, Open-Meteo) occur in **zero** source files. USGS and GDACS are **tokens only**; the single USGS fixture is consumed only by a CLI test. The A-L-L-A-H external interface is pinned as taxonomy in this repository, and HELIOGRID is static prose, a dead type token and a hardcoded status badge.

---

## 3. Findings per subject

### 3.1 USGS — token, one test fixture, one prose string

| Row | Artifact | Locator and quote | Verdict |
|---|---|---|---|
| `usgs-type-token` | Platform union | `packages/types/src/sentinel/signals.ts:11` — `platform: 'youtube' \| 'x' \| 'rss' \| 'gdacs' \| 'usgs' \| 'agent'` | `TOKEN_ONLY_NOT_LIVE` |
| `usgs-mock-fixture` | Fabricated signal | `packages/testing/src/fixtures.ts:40` — `platform: 'usgs',`; title at `:38`, summary at `:43` | `FIXTURE_ONLY_NOT_LIVE` |
| `usgs-fixture-consumer` | Test-only consumer | `apps/arsy/test/testing-cli.test.ts:104` — `const signal = createMockSignal({ urgencyScore: 92 })` | `FIXTURE_ONLY_NOT_LIVE` |
| `usgs-empire-prose` | Atmosphere OS mapping | `packages/moonql-ops/src/empire.ts:112` — `Sentinel OSINT radar clustering USGS and GDACS sensor events` | `TOKEN_ONLY_NOT_LIVE` |
| `usgs-vision-claim` | Vision attribution | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863` — `Fixtures/source adapters refer to **USGS earthquake**` | `DOC_ONLY_NOT_IMPLEMENTED` |

The fixture has no provider payload, measurement, geographic coordinate, provider timestamp or provider URL. Its URL is `https://sentinel.internal/signals/anomaly-01` (`packages/testing/src/fixtures.ts:39`), which is not a USGS endpoint. No live surface imports `createMockSignal` (§9 P6).

### 3.2 GDACS — token and prose only

| Row | Artifact | Locator and quote | Verdict |
|---|---|---|---|
| `gdacs-type-token` | Platform union | `packages/types/src/sentinel/signals.ts:11` — same union line | `TOKEN_ONLY_NOT_LIVE` |
| `gdacs-empire-prose` | Atmosphere OS mapping | `packages/moonql-ops/src/empire.ts:112` — `Sentinel OSINT radar clustering USGS and GDACS sensor events` | `TOKEN_ONLY_NOT_LIVE` |
| `gdacs-vision-claim` | Vision attribution | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863` — `**GDACS disaster**` | `DOC_ONLY_NOT_IMPLEMENTED` |

No value `'gdacs'` is ever constructed. No disaster record, feed, URL or driver exists.

### 3.3 NOAA — absent from code

NOAA has **zero** source-code occurrences. The only occurrence in the repository is the vision sentence at `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863` (`**NOAA geomagnetic/space weather**`). The ledger records the provider as `ABSENT_FROM_CODE` with that line as the absence locator. There is no URL, key, adapter, model field, fixture or test.

### 3.4 Open-Meteo — absent from code

Open-Meteo has **zero** source-code occurrences. The only occurrence is the same vision sentence (`**Open-Meteo weather/air quality**`). The ledger records `ABSENT_FROM_CODE`. The monitor schema has no attribution, provider, freshness or units field to receive such data even if an adapter were added.

### 3.5 A-L-L-A-H — taxonomy pin, not imported code

| Finding | Locator and quote | State |
|---|---|---|
| Pinned external interface | `docs/audit/M06-01-source-repo-pins.md:21` — `github.com/bjo163/allah-hub`, `71a80c94dae0021b`, `core/manifest.json`, `TAXONOMY_ONLY` | Pin only; no adapter or schema |
| Ratified integration strategy | `docs/decisions/M06-05-historical-interfaces-map.md:18` — `Disambiguated acronym taxonomy only` | No bulk import |
| Vision claims external World Monitor code | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:861` — `World Monitor ingestion/scheduling/storage` | Unverified external claim |
| Conflicting vision pin | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:772` — `47bac90cade77ee2136cb66d546156b220fe8481` | Conflicts with M06-01's `71a80c94`; neither proves ingestion code |
| Decision still OPEN | `docs/decisions/M02-07-historical-decisions-matrix.md:34` — `Ditangguhkan ke G5` | Deferred to M24 pending rate-limit, moderation and privacy audit |
| Acronym/referent separation | `docs/decisions/M02-01-disambiguation-registry.md:22` — `A-L-L-A-H**: Akronim teknis proyek`, `DILARANG menggunakan relasi` | Positive control: no claim attaches to the religious referent |
| Local monitor is XV-native | `packages/moonql-monitor/src/index.ts:371` — `externalId: 'yt:narasi:civic-townhall-01',` | Fixture data, not imported A-L-L-A-H data |
| Local platform enum excludes providers | `packages/moonql-monitor/src/index.ts:28` — `const PLATFORMS = ['youtube', 'x', 'instagram', 'tiktok', 'rss', 'web'] as const` | USGS/GDACS cannot be stored even if produced |

The vision's external-code claim was not verified: the external repository was not cloned, and the two in-repo pins disagree. The repository's own A-L-L-A-H commitment is acronym taxonomy only.

### 3.6 HELIOGRID — static prose, dead type and a false status badge

| Row | Artifact | Locator and quote | Verdict |
|---|---|---|---|
| `heliogrid-empire-seed` | Empire taxonomy | `packages/moonql-ops/src/empire.ts:121` — `Falsifiable solar ephemeris and renewable energy telemetry tracking`; disallowed claim at `:122` | `TOKEN_ONLY_NOT_LIVE` |
| `heliogrid-type-token` | Dead telemetry union | `packages/types/src/sentinel/telemetry.ts:13` — `\| 'HELIOGRID'` | `TOKEN_ONLY_NOT_LIVE` |
| `heliogrid-hq-status` | Hardcoded UI status | worktree `apps/headquarters/src/app/(admin)/page.tsx:231`; committed `HEAD:…:109` — `name: 'HELIOGRID', …, status: 'NOMINAL'` | `FIXTURE_PRESENTED_AS_LIVE` |
| `heliogrid-blueprint-rule` | Repository rule | `BLUEPRINT.md:110` — `HELIOGRID pilot must start with verified read-only meters`; `simulations never masquerade as measured generation/savings` | `DOC_ONLY_NOT_IMPLEMENTED` |

There is no meter, inverter, PV, battery, irradiance model, Modbus reader, kWh column or HELIOGRID app. The Empire row itself disallows "Completed quantum energy generator".

---

## 4. Live / fixture mislabelling

### 4.1 Answer to the task question

**Yes, at least one user-visible surface currently presents fixture data as live.** The Headquarters 100CENTER panel hardcodes `Atmosphere OS → STREAMING`, `HELIOGRID → NOMINAL` and `14 / 14 SYNCHRONIZED` with no data binding. This is an explicit false-live-status claim, not a provider observation. It is session-gated, not anonymous.

**The named-provider fixture itself is not user-visible.** The only USGS fixture (`packages/testing/src/fixtures.ts:38-43`) is consumed only by `apps/arsy/test/testing-cli.test.ts:104`. It reaches no Dock, HQ or API surface.

**The public Dock World Monitor is an unlabelled fixture presentation.** It does not print the literal word `LIVE`, but it renders six committed seed signals as current OSINT monitoring with sentiment, urgency and AI summaries and no fixture, provider, fetch-time or stale label.

### 4.2 Exact locations and routing

| # | Surface | Worktree locator | Committed `659da28` locator | What it asserts | What exists | Risk |
|---|---|---|---|---|---|---|
| F1 | HQ Atmosphere OS | `apps/headquarters/src/app/(admin)/page.tsx:230` — `name: 'Atmosphere OS', domain: 'Environmental sensor & space weather grid', status: 'STREAMING'` | `HEAD:…:108` | An environmental sensor/space-weather grid is streaming | No provider, sensor, feed, table or cron (NOAA/Open-Meteo absent; USGS/GDACS tokens only) | **High** |
| F2 | HQ HELIOGRID | `apps/headquarters/src/app/(admin)/page.tsx:231` — `name: 'HELIOGRID', domain: 'Solar energy & physics telemetry tracker', status: 'NOMINAL'` | `HEAD:…:109` | A solar-energy telemetry system is nominal | No meter, sample or health source | **High** |
| F3 | HQ panel subtitle | `apps/headquarters/src/app/(admin)/page.tsx:445` — `telemetry, evidence, and research compute` | `HEAD:…:317` | The panel shows telemetry | Static literal list only | **High** |
| F4 | HQ sync badge | `apps/headquarters/src/app/(admin)/page.tsx:446` — `14 / 14 SYNCHRONIZED` | `HEAD:…:318` | All 14 systems are synchronized | No synchronization mechanism | **High** |
| F5 | Dock public World Monitor card | `apps/dock/src/app/page.tsx:74` (`<Card id="world-monitor">`), `:78` (`{copy.worldMonitor}`), `:82` (`{copy.liveFeedAiTriaged}`), `:107` (`{sig.platform}`); labels `apps/dock/src/lib/landing-copy.ts:70` `WORLD MONITOR · OSINT RADAR INTERCEPT` and `:72` `OSINT MONITORING` | same working tree; file unchanged from `659da28` | Six seed rows are current OSINT intelligence | 12 committed seed signals (`packages/moonql-monitor/src/index.ts:371-590`), placeholders including `https://example.org/osint/playwright-worker-pools` (`:553`), invented `viewsCount: 412000` (`:418`), pre-set `status: 'verified'` (`:385`) | **High** |

F5 is fed by the anonymous `monitorSignalFeed` view (`apps/dock/src/data/queries/program.ts:106`) and renders `sig.aiSummary` and urgency (`apps/dock/src/app/page.tsx:121-133`). There is no `provider`, `fetchedAt`, `license`, `revision`, `lat/lng` or `units` field in `monitor_signals` (`packages/moonql-monitor/src/index.ts:350-366`), so the surface cannot distinguish fixture from observation.

The repository's own rules are violated or unsupported:

- `MASTER_DESIGN.md:22` — ``Forbidden on this surface: invented counters and `LIVE` badges`` (Dock).
- `BLUEPRINT.md:110` — `simulations never masquerade as measured generation/savings` (HELIOGRID).
- `docs/design/APPS.md:2` — `No fictional "LIVE" or "NOMINAL" statuses.`

**Routing.** No code was changed in this task. F1–F4 belong to **M24-05** (stale/fixture labelling) and the HQ claim ontology in **M25-02**. F5 belongs to **M24-05** and the provenance/freshness schema in **M24-02**. The USGS fixture row is already correctly test-only and needs no fix, though M24-04 must not turn it into a live adapter without terms and provenance.

---

## 5. Terms, quotas and attribution

**Status: `NOT_IN_REPO` for all four named providers and for A-L-L-A-H and HELIOGRID.**

- No provider URL exists: the URL sweep at `659da28` returned `NO_PROVIDER_URL_MATCHES` for `api.usgs`, `earthquake.usgs`, `gdacs.org`, `noaa.gov`, `swpc.noaa`, `open-meteo` and `openmeteo`.
- No terms, licence, attribution, quota, rate-limit or user-agent text exists in the three files that mention USGS/GDACS: `NO_TERMS_IN_PROVIDER_FILES`.
- The monitor addon performs no `fetch` (`grep -n "fetch(" packages/moonql-monitor/src/index.ts` → no matches), so there is no request path that could carry a user agent or attribution.
- `EGRESS_ENABLED=false` (`.env.example:152`) and `EGRESS_DENY_HOSTS` are global outbound controls, not provider quotas or provider-specific flags.
- `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` (`.env.example:75-76`) limit inbound entry points to this repository's own API; they are not provider rate limits.
- Line-number drift: `.env.example` carries another session's uncommitted two-line `ECHOLOG_URL` insertion above these entries, so the same lines sit at 150 and 73-74 at `659da28` and at 152 and 75-76 in this worktree. The quotes were re-resolved at the current tree; re-locate by key name if the file shifts again.

**Non-claims.** `NOT_IN_REPO` means only that no provider terms text is present in this repository. It is **not** a statement that a provider permits or forbids reuse, that a quota exists or does not exist, or that attribution is unnecessary. No external terms page was fetched. Any future adapter (M24-04) must obtain and record the provider's actual terms before use.

---

## 6. Non-claims made by this audit

- This audit does **not** assert that the external `bjo163/A-L-L-A-H` repository lacks World Monitor code. It asserts only that the code is not imported here and that the two in-repo pins conflict (`71a80c94` vs `47bac90c`).
- This audit does **not** assert that NOAA or Open-Meteo data is unavailable, unlicensed or unsuitable. It asserts only that neither provider occurs in this repository's code.
- This audit does **not** decide any licence, attribution, quota or redistribution right. All rights questions remain open for M24-03/M24-04.
- This audit does **not** verify freshness, correctness, geographic precision, units or revision state of any observation; no observation exists.
- This audit does **not** close M24-01. The acceptance assessment in §10 is evidence for a human/integrator decision, not a self-approval.

---

## 7. Limitations

- **L1 — Static only.** No hub, worker, Docker stack, browser or test run. "Anonymous sees X" is a code-path plus committed-query conclusion.
- **L2 — External terms not fetched.** USGS, GDACS, NOAA, Open-Meteo, A-L-L-A-H and HELIOGRID terms, quotas and licences are `NOT_IN_REPO`, not "verified absent from the world".
- **L3 — External A-L-L-A-H repository not cloned.** The vision's ingestion/`WorldMonitorView` claim and its SHA are unverified. The conflicting pins are recorded as a documentation defect, not resolved.
- **L4 — Foreign worktree.** Another session continued editing and committing during the audit (72 changed paths at start, 76 at last check; the count fluctuated). The only cited file with working-tree drift is `apps/headquarters/src/app/(admin)/page.tsx` (+131 lines above the status array); both the worktree (`:230`, `:231`, `:445`, `:446`) and committed (`:108`, `:109`, `:317`, `:318`) locations are recorded. Across cited paths, only `.env.example` (`API_VERSION`) and `apps/dock/src/lib/landing-copy.ts` (`heroEyebrow`, uncited lines) changed between `659da28` and `91a5ff7`; the cited `EGRESS_ENABLED` and landing-copy lines were rechecked (§9 P2). The concurrent session committed the three deliverables in `f86bede`; this audit did not stage or commit them.
- **L5 — Binary false positives.** The provider-name sweep matches raw bytes in `docs/audit/screens/home-en-reduce-390.png` and `docs/design/mockups-xv/png/02_project_universe.png`; they contain no readable provider claim.
- **L6 — Missing packet.** `docs/tasks/M24/M24-01.md` does not exist; scope is from `TODO.md:563` and `docs/milestones/M24.md`.
- **L7 — Generated output.** `packages/*/dist` and `apps/*/.next` mirror source strings and are git-ignored; they were not treated as independent evidence.

---

## 8. Rollback

Delete exactly these three new files:

```text
docs/data/M24-01-provider-audit.json
scripts/check-m24-01-provider-audit.mjs
docs/audit/M24-01-provider-audit.md
```

No existing file, `TODO.md`, source, test, schema, manifest, lockfile, environment file or git index was changed by this audit, and no `git add`, `commit`, `stash`, `checkout` or `reset` was run by it. The concurrent session has already committed the three files in `f86bede`, so a plain delete now leaves the repository dirty; rollback therefore needs the delete plus a reviewed commit (or a reviewed revert of `f86bede`) under normal branch discipline.

---

## 9. Commands actually executed and observed output

All commands were run from `Z:\project\moonradio`; read-only unless noted. `659da28` is used as the revision argument where a stable baseline sweep is required.

**P1 — baseline and moving HEAD**

```text
$ git rev-parse --abbrev-ref HEAD; git rev-parse HEAD
dev
659da2855f56c61ae9d21e2995be9649c77fc470          # task baseline

$ git rev-parse HEAD
91a5ff7f2d9f94fa764115e4c875b6fb443bc453          # last observed; dev advanced 32 commits

$ git status --porcelain | wc -l
72                                                 # foreign changes at audit start
76                                                 # at last check; count fluctuated
```

**P2 — cited paths between baseline and observed HEAD**

```text
$ git diff --name-only 659da28..HEAD -- packages/types/src/sentinel packages/testing/src \
    packages/moonql-ops/src/empire.ts packages/moonql-monitor/src/index.ts \
    apps/dock/src/app/page.tsx apps/dock/src/lib/landing-copy.ts \
    'apps/headquarters/src/app/(admin)/page.tsx' \
    docs/vision/MASTER_VISION_NARRATIVE_XV.md docs/audit/M06-01-source-repo-pins.md \
    docs/decisions/M02-07-historical-decisions-matrix.md \
    docs/decisions/M06-05-historical-interfaces-map.md .env.example
.env.example
apps/dock/src/lib/landing-copy.ts

$ git diff 659da28..HEAD -- .env.example
-API_VERSION=2.0.0
+API_VERSION=2.1.0

$ git diff 659da28..HEAD -- apps/dock/src/lib/landing-copy.ts
-heroEyebrow: 'PEOPLE. PLACES. STORIES. ANOTHER SIDE OF REALITY.'
+heroEyebrow: 'LIGHTHOUSE · PUBLIC GATEWAY OF MOONWITNESS XV'
...
-heroEyebrow: 'ORANG. TEMPAT. KISAH. SISI LAIN DARI REALITAS.'
+heroEyebrow: 'LIGHTHOUSE · GERBANG PUBLIK MOONWITNESS XV'

$ grep -n "EGRESS_ENABLED" .env.example
150:EGRESS_ENABLED=false
```

The only cited-path changes are an unrelated `API_VERSION` bump and the uncited `heroEyebrow` copy in both locales; the cited `EGRESS_ENABLED` line 150 and landing-copy lines 70/72 are unchanged. Every other cited path is byte-identical, and all ledger quotes re-resolved.

**P3 — provider tokens in source**

```text
$ grep -rniE "usgs|gdacs|open-?meteo|noaa" packages/*/src apps/*/src --include=*.ts --include=*.tsx
packages/moonql-ops/src/empire.ts:112:    xvMapping: 'Sentinel OSINT radar clustering USGS and GDACS sensor events',
packages/testing/src/fixtures.ts:40:    platform: 'usgs',
packages/types/src/sentinel/signals.ts:11:  platform: 'youtube' | 'x' | 'rss' | 'gdacs' | 'usgs' | 'agent'
```

Three source lines; NOAA and Open-Meteo have none.

**P4 — no provider URL at baseline**

```text
$ git grep -n -i -E "api\.usgs|earthquake\.usgs|gdacs\.org|noaa\.gov|swpc\.noaa|open-meteo|openmeteo" \
    659da28 -- packages apps scripts .env.example docker-compose.yml || echo NO_PROVIDER_URL_MATCHES
NO_PROVIDER_URL_MATCHES
```

**P5 — no provider terms vocabulary in the three provider-mentioning files**

```text
$ git grep -n -i -E "terms|licen[cs]e|attribution|quota|rate.?limit|user.?agent" 659da28 -- \
    packages/types/src/sentinel/signals.ts packages/testing/src/fixtures.ts \
    packages/moonql-ops/src/empire.ts || echo NO_TERMS_IN_PROVIDER_FILES
NO_TERMS_IN_PROVIDER_FILES
```

**P6 — the USGS fixture is test-only**

```text
$ git grep -n "createMockSignal" 659da28 -- apps packages
659da28:apps/arsy/test/testing-cli.test.ts:9:  createMockSignal,
659da28:apps/arsy/test/testing-cli.test.ts:104:    const signal = createMockSignal({ urgencyScore: 92 })
659da28:packages/testing/src/fixtures.ts:31:export function createMockSignal(overrides: Partial<SentinelSignal> = {}): SentinelSignal {

$ git grep -n "SentinelSignal" 659da28 -- apps packages | grep -v '/dist/'
659da28:packages/testing/src/fixtures.ts:1:import type { StationChannel, SentinelSignal } from '@moonwitness/types'
659da28:packages/testing/src/fixtures.ts:31:export function createMockSignal(overrides: Partial<SentinelSignal> = {}): SentinelSignal {
659da28:packages/types/src/sentinel/signals.ts:6:export interface SentinelSignal {
```

The type has no hub, worker or route consumer, and the fixture has no user-visible consumer.

**P7 — monitor egress and seeded fixture count**

```text
$ grep -n "fetch(" packages/moonql-monitor/src/index.ts
(no matches; exit 1)

$ sed -n '368,590p' packages/moonql-monitor/src/index.ts | grep -c "externalId:"
12

$ sed -n '28p' packages/moonql-monitor/src/index.ts
const PLATFORMS = ['youtube', 'x', 'instagram', 'tiktok', 'rss', 'web'] as const
```

**P8 — HELIOGRID code hits at baseline**

```text
$ git grep -n "HELIOGRID" 659da28 -- '*.ts' '*.tsx'
659da28:apps/headquarters/src/app/(admin)/page.tsx:109:  { code: 'SYS-12', name: 'HELIOGRID', domain: 'Solar energy & physics telemetry tracker', status: 'NOMINAL', tone: 'ok' as const },
659da28:packages/moonql-ops/src/empire.ts:119:    name: 'HELIOGRID Tracker',
659da28:packages/types/src/sentinel/telemetry.ts:13:  | 'HELIOGRID'
```

**P9 — committed vs foreign-worktree HQ status locations**

```text
$ git show 659da28:'apps/headquarters/src/app/(admin)/page.tsx' | grep -n \
    "Atmosphere OS\|HELIOGRID\|SYNCHRONIZED\|telemetry, evidence"
108:  { code: 'SYS-11', name: 'Atmosphere OS', …, status: 'STREAMING', … },
109:  { code: 'SYS-12', name: 'HELIOGRID', …, status: 'NOMINAL', … },
317:        subtitle="Bounded logical systems restored from Section 21A.6 — telemetry, evidence, and research compute."
318:        actions={<Badge tone="ok">14 / 14 SYNCHRONIZED</Badge>}

$ grep -n "Atmosphere OS\|name: 'HELIOGRID'\|SYNCHRONIZED\|telemetry, evidence" \
    "apps/headquarters/src/app/(admin)/page.tsx"
230:  { code: 'SYS-11', name: 'Atmosphere OS', …, status: 'STREAMING', … },
231:  { code: 'SYS-12', name: 'HELIOGRID', …, status: 'NOMINAL', … },
445:        subtitle="Bounded logical systems restored from Section 21A.6 — telemetry, evidence, and research compute."
446:        actions={<Badge tone="ok">14 / 14 SYNCHRONIZED</Badge>}
```

(The `…` above abbreviates unchanged text inside the echoed lines; the exact full lines are the ledger quotes, and the validator resolves them.)

**P10 — validator, clean run**

```text
$ node scripts/check-m24-01-provider-audit.mjs
PASS rows=29 unique ids=29
PASS evidence REPO_EVIDENCE=15 FIXTURE_ONLY=6 DOC_ONLY_PLAN=8 REPORTED_TERMS=0
PASS verdicts LIVE_IMPLEMENTED=0 CONTROL_IMPLEMENTED=2 FIXTURE_ONLY_NOT_LIVE=3 FIXTURE_PRESENTED_AS_LIVE=5 TOKEN_ONLY_NOT_LIVE=7 DOC_ONLY_NOT_IMPLEMENTED=12
PASS subjects USGS=5 GDACS=3 NOAA=1 OPEN_METEO=1 ALLAH=15 HELIOGRID=4
PASS 73 locator quotes resolved at the cited file:line
PASS zero FIXTURE_ONLY rows labelled LIVE_IMPLEMENTED
PASS zero terms claims without an in-repo locator (NOT_IN_REPO rows=29)
PASS all four named providers represented; NOAA and OPEN_METEO explicitly recorded absent from code
PASS declared counts, URL inventory, provider records and fixture counts match rows
NOTE the ledger records absence: no provider client, URL, quota or terms text exists in the repository
$ echo $?
0
```

**P11 — validator self-test**

```text
$ node scripts/check-m24-01-provider-audit.mjs --self-test
PASS  negative: duplicate row id is rejected
      first error: duplicate id usgs-type-token
PASS  negative: FIXTURE_ONLY row labelled LIVE_IMPLEMENTED is rejected
      first error: row usgs-mock-fixture is FIXTURE_ONLY but labelled LIVE_IMPLEMENTED
PASS  negative: fixture artifact kind labelled LIVE_IMPLEMENTED is rejected
      first error: row usgs-mock-fixture artifact_kind fixture cannot be LIVE_IMPLEMENTED
PASS  negative: doc_claim labelled LIVE_IMPLEMENTED is rejected
      first error: row noaa-vision-claim is a doc_claim and cannot be LIVE_IMPLEMENTED
PASS  negative: terms IN_REPO without a locator is rejected
      first error: row usgs-mock-fixture claims terms IN_REPO without terms_locator+terms_quote
PASS  negative: terms IN_REPO with a quote absent from the cited line is rejected
      first error: row usgs-mock-fixture terms quote "USGS public domain, no attribution required" not found at packages/types/src/sentinel/signals.ts:11
PASS  negative: REPORTED_TERMS row with NOT_IN_REPO terms is rejected
      first error: row usgs-vision-claim is REPORTED_TERMS but terms_status is "NOT_IN_REPO"
PASS  negative: a quote absent from the cited line is rejected
      first error: row usgs-type-token quote "live USGS earthquake feed" not found at packages/types/src/sentinel/signals.ts:11
PASS  negative: a locator line outside the file is rejected
      first error: row usgs-type-token locator line 99999 is outside packages/types/src/sentinel/signals.ts lines 1-30
PASS  negative: an unknown provider is rejected
      first error: row usgs-type-token provider "ECMWF" is not in USGS|GDACS|NOAA|OPEN_METEO|ALLAH|HELIOGRID
PASS  negative: an unknown live verdict is rejected
      first error: row usgs-type-token live_verdict "LIVE" is not in the ledger vocabulary
PASS  negative: a missing provider record is rejected
      first error: provider_records is missing subject NOAA
PASS  negative: a record claiming code_present without a code row is rejected
      first error: provider_records.NOAA says code_present but no non-doc row exists
PASS  negative: a record claiming a live client without a live row is rejected
      first error: provider_records.USGS claims a live client but no LIVE_IMPLEMENTED row exists
PASS  negative: misdeclared total is rejected
      first error: declared total 30 !== rows 29
PASS  negative: misdeclared evidence-class tally is rejected
      first error: declared by_evidence_class.FIXTURE_ONLY=7 !== rows 6
PASS  negative: misdeclared provider tally is rejected
      first error: declared by_provider.USGS=4 !== rows 5
PASS  negative: a non-empty provider URL inventory is rejected
      first error: url_inventory.USGS lists 1 provider URL(s); a URL must be a row with a locator
PASS  negative: terms_register IN_REPO without a locator is rejected
      first error: terms_register.USGS claims IN_REPO without locator+quote
PASS  negative: a wrong baseline SHA is rejected
      first error: baseline_sha "0000000000000000000000000000000000000000" is not the M24-01 baseline 659da28...
PASS  negative: provider_records.row_ids omitting a row is rejected
      first error: provider_records.USGS.row_ids does not list every USGS row
PASS  negative: an unknown artifact kind is rejected
      first error: row usgs-type-token artifact_kind "rss_feed" is not in the ledger vocabulary
SELF-TEST PASS: all 22 invalid datasets rejected
$ echo $?
0
```

---

## 10. Acceptance assessment (not a closure claim)

- **Named-provider fixtures are not mislabelled as live.** USGS is a test-only fixture with no user-visible consumer; GDACS has no fixture at all; NOAA and Open-Meteo are absent from code. No provider URL, client, flag or terms artefact exists.
- **But the repository still ships false live/current status around this domain.** HQ hardcodes `Atmosphere OS: STREAMING`, `HELIOGRID: NOMINAL` and `14 / 14 SYNCHRONIZED` (`apps/headquarters/src/app/(admin)/page.tsx:230-231,445-446`; committed `:108-109,317-318`). Dock renders 12 seeded monitor signals as current OSINT monitoring with no fixture or freshness label (`apps/dock/src/app/page.tsx:74-133`; `packages/moonql-monitor/src/index.ts:371-590`).
- If M24-01 is read narrowly as "the four named provider fixtures are not labelled live", the evidence supports the acceptance. If it is read repository-wide as "no historical fixture is presented as live production", the two findings above keep the acceptance **open** until M24-05 (and M25-02 for the HQ status ontology) lands.
- **This audit does not close M24-01 and does not tick the TODO row.** The integrator and a human reviewer must decide the reading and route the findings.
- **Next eligible work:** M24-02 (provider/timestamp model), M24-03 (egress/quota/terms gate), M24-05 (stale/fixture labelling, beginning with F1–F5), then M24-04.
