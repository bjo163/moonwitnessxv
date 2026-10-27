# M24-01 — Audit: historical A-L-L-A-H environmental provider code and terms

- **Task:** M24-01 (`TODO.md:561` at the task baseline, `:563` at current HEAD — authority for this task; **no packet file exists** at `docs/tasks/M24/M24-01.md`; milestone context `docs/milestones/M24.md`).
- **Baseline:** branch `dev`, task baseline `00b006443da8a1b9408226ed776e15090f0e640b`. Observed HEAD while auditing: `2ed24ac11ef52428e2e5385e0e77a2fdc9cf5154`; parallel sessions then advanced `dev` to `9a1bf85`/`b24bedd` (M28-14, M40-06 — unrelated audits/features). Every cited source path — including `apps/arsy/test/moonql-monitor.test.ts` and `apps/arsy/test/testing-cli.test.ts`, which sit beside two test files that did change later — is byte-identical between `00b0064` and current HEAD. Two cited metadata paths did change later — `.env.example` and `TODO.md` — so their cited facts were re-checked at current HEAD: `EGRESS_ENABLED=false` is still `:150` (baseline `:139`) and the M24 rows are still unchecked. Line numbers are at the task baseline unless noted.
- **Prerequisite:** M06-05 (closed; `docs/decisions/M06-05-historical-interfaces-map.md`, A-L-L-A-H → D00 "Disambiguated acronym taxonomy only").
- **Related prior audits:** `docs/audit/M20-01-hq-model-ui-route-guards-ops.md` (baseline `76ecdc5`: HQ World Monitor data is real, its radar map is hardcoded, `/monitor/overview` is hub-public). Re-confirmed here at `2ed24ac`; one change since then is that HQ now calls `guardEndpoint` for this route (`world-monitor/page.tsx:97-98`), which still resolves to the hub's `public` rule, so N4 stands.
- **Method:** read-only. No source, schema, manifest, TODO or git index was changed. Only file written: this artifact.
- **Scope counts:** 4 named environmental providers (USGS, GDACS, NOAA, Open-Meteo); **2 present only as non-functional tokens, 2 absent entirely**; 16 capability rows (C1–C16); 9 exposure rows (E1–E9); 7 rights/terms rows (R1–R7); 6 unsupported or stale documentation claims (D1–D6); 6 negative findings (N1–N6). Zero provider adapters and zero URLs for any of the four named providers; zero attribution/licence fields in the monitor schema.

---

## 1. Provider ledger — what the repository actually contains

| # | Provider | Code locations (file:line) | State | Live / fixture / doc-only | Terms or attribution assumed by code |
|---|---|---|---|---|---|
| P1 | **USGS** (earthquake) | `packages/types/src/sentinel/signals.ts:11` (type union); `packages/testing/src/fixtures.ts:38-40` (mock signal, `platform: 'usgs'`, title "Seismic and environmental anomaly"); `packages/moonql-ops/src/empire.ts:112` (Atmosphere OS mapping text) | **Token + fixture + seed text only** | Fixture (`createMockSignal`, consumed only by `apps/arsy/test/testing-cli.test.ts:104`) and one static string. No URL, no `fetch`, no driver, no schema field. | **None.** No terms, no licence, no attribution, no rate limit, no user agent, no cache policy anywhere. External USGS terms were not read for this audit — see §8 limitation L2. |
| P2 | **GDACS** (disaster) | `packages/types/src/sentinel/signals.ts:11` (type union); `packages/moonql-ops/src/empire.ts:112` (mapping text) | **Token + seed text only** | Neither live nor fixture — no value of `'gdacs'` is ever constructed anywhere. | **None.** Same as P1. |
| P3 | **NOAA** (geomagnetic / space weather) | *No occurrence in any source file.* Only `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863`. | **Absent** | Doc-only claim. | n/a — no code. |
| P4 | **Open-Meteo** (weather / air quality) | *No occurrence in any source file.* Only `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863`. | **Absent** | Doc-only claim. | n/a — no code. |
| P5 | **YouTube Atom / generic RSS** | `packages/moonql-monitor/src/index.ts:193,206,284` (seed feed URLs); `apps/sentinel/src/drivers/youtube-rss.ts:110-142` | **Live code path, gated** | Live `fetch` only when `ctx.egressEnabled` (`youtube-rss.ts:113`); otherwise a synthetic row is returned (`:119-141`). | Code assumes only a descriptive UA (`youtube-rss.ts:115`). No platform ToS, attribution, rate limit, quota or robots handling is encoded. |
| P6 | **X / Instagram / TikTok / web pages** | `packages/moonql-monitor/src/index.ts:232,245,258,271` (seed targets); `apps/sentinel/src/drivers/playwright.ts:16-25`, `openclaw.ts:15-44` | **Live code path, gated** | Same gate; falls back to a fabricated signal (`playwright.ts:40-47`, `openclaw.ts:47-63`). | No ToS/robots/consent code. `docs/decisions/M02-07-historical-decisions-matrix.md:34` explicitly defers "rate-limit, moderasi platform, dan kepatuhan privasi" review to M24. |
| P7 | **LLM providers** (Gemini, Groq, OpenRouter, Ollama, heuristic) — adjacent, not environmental | `apps/aigateway/src/router.ts:15-25`; `apps/aigateway/src/providers/gemini.ts:9`, `groq.ts:9`, `openrouter.ts:12`, `ollama.ts:9`, `heuristic.ts:1-27` | **Implemented, live outbound** | Live `fetch` to provider URLs; heuristic is local/deterministic. | API keys from env only; no terms/attribution/retention text in code. Gateway routes are unauthenticated and CORS `origin: true` (`apps/aigateway/src/server.ts:18-26,75`) — review gate named in `docs/architecture/SECURITY.md:2` ("AI Gateway model egress"). |

**Verification of absence (executed):** `grep -rniE "usgs|gdacs|open-?meteo|noaa" packages/*/src apps/*/src --include=*.ts --include=*.tsx` returns exactly the three source hits above (P1/P2). `grep -rn "fetch(" packages/moonql-monitor/src/index.ts` returns **no matches (exit 1)** — the hub addon never performs egress; only the worker does.

---

## 2. Capability C-rows (state in code today)

| ID | Capability | File:line | State | Evidence / limitation |
|---|---|---|---|---|
| C1 | Sentinel signal type admits environmental platforms | `packages/types/src/sentinel/signals.ts:6-19` (union at `:11`) | **Implemented — dead type** | `SentinelSignal` is referenced only by `packages/testing/src/fixtures.ts:1,31` (grep over all `.ts/.tsx`). Neither the worker nor the hub uses it. |
| C2 | USGS mock signal fixture | `packages/testing/src/fixtures.ts:31-47` | **Fixture** | `platform:'usgs'` (`:40`), fabricated title/summary (`:38,43`), used only by `apps/arsy/test/testing-cli.test.ts:104-106`. |
| C3 | Hub platform vocabulary (radars/sources/signals) | `packages/moonql-monitor/src/index.ts:28` (PLATFORMS), `:173`, `:354`, `:406`; generated client `packages/moonql-client/src/generated.ts:354,406,428,446` | **Implemented — excludes all four providers** | `['youtube','x','instagram','tiktok','rss','web']`. Generated client mirrors it. A `usgs`/`gdacs` value is schema-invalid, so C1's union cannot reach a row. |
| C4 | Sentinel driver registry | `apps/sentinel/src/index.ts:24-30`; `apps/sentinel/src/types.ts:1` | **Implemented** | Five drivers: `rss, api, playwright, openclaw, agent`. No environmental driver exists. |
| C5 | Per-driver egress gate | `youtube-rss.ts:113`; `playwright.ts:16`; `openclaw.ts:15,35`; `agent.ts:15-18` | **Partial — agent bypasses the flag** | `agentDriver` builds and fetches the gateway URL with no `ctx.egressEnabled` check (see N3). |
| C6 | Synthetic signal fallback when egress is off or fetch fails | `youtube-rss.ts:119-141`; `playwright.ts:40-47`; `openclaw.ts:47-63`; `agent.ts:71-92` | **Implemented — fabrication risk** | Each returns a fully formed row with invented `viewsCount/likesCount/commentsCount` (e.g. `playwright.ts:42-44`) and prose asserting success ("DOM selector tree healthy", `:45`). |
| C7 | Ingest with dedupe and source health update | `packages/moonql-monitor/src/index.ts:875-975` | **Implemented** | `requires: ['admin','bot']` (`:878`); unique `[sourceRef, externalId]` (`:368`); writes `platform` **from the source row** (`:937`), so a driver cannot introduce a provider platform. |
| C8 | Scheduler cron | `packages/moonql-monitor/src/index.ts:973-990` | **Implemented, default off** | Skips unless `env.EGRESS_ENABLED === 'true'` (`:977-980`); default `false` (`docker-compose.yml:101`, `.env.example:139` at baseline; `:150` at current HEAD). |
| C9 | Anonymous 3-tier overview endpoint | `packages/moonql-monitor/src/index.ts:701-760` | **Implemented, public** | No `requires`; published as `public` (see E1). |
| C10 | Five monitor views | `packages/moonql-monitor/src/index.ts:608-694` | **Implemented, public** | `monitorHierarchy` (`:608`), `monitorActiveSources` (`:628`), `monitorSignalFeed` (`:652`), `monitorSignalsByPlatform` (`:680`), `monitorSignalsByRadar` (`:689`). No `acl` on any of them. |
| C11 | HQ World Monitor page (3-tier drilldown, filters, driver cards, task table) | `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:86-527` | **Implemented, read-only** | Reads `getMonitorOverview()` (`:108`), gated by `guardEndpoint(doc,'GET','/monitor/overview')` (`:97-98`). Headings claim "OSINT & Social/YouTube Telemetry" (`:163`), not environmental feeds. |
| C12 | HQ tactical radar map | `apps/headquarters/src/ui/client/ThreatRadarMap.tsx:18-25,191-229` | **Demo only** | Six hardcoded `DEFAULT_TARGETS` with fabricated signal/urgency counts; the page passes only `selectedRadarId` (`world-monitor/page.tsx:203`). No lat/lng, no provider. |
| C13 | Dock public World Monitor card | `apps/dock/src/app/page.tsx:72-135`; `apps/dock/src/data/queries/program.ts:106` | **Implemented, public** | Reads `view monitorSignalFeed` with `limit: 6` anonymously and renders title, sentiment, AI summary, urgency %, views (`page.tsx:105-133`). |
| C14 | AI Gateway provider routing | `apps/aigateway/src/router.ts:15-25,60-120` | **Implemented (LLM only)** | No environmental provider class; `HeuristicProvider` scores Indonesian disaster keywords (`providers/heuristic.ts:21-27`) but produces prose, not observations. |
| C15 | NOAA / Open-Meteo adapter | — | **Absent** | No file, symbol, URL or test. |
| C16 | Historical A-L-L-A-H World Monitor ingestion/scheduler/storage code | — | **Absent from this repository** | Claimed only in `docs/vision/MASTER_VISION_NARRATIVE_XV.md:861` about the external repository; not imported and not pinned beyond a manifest (D2). |

---

## 3. Exposure E-rows (can an anonymous caller see data?)

Reachability model, all read: endpoint guard `guard(ep.def.requires)` with `undefined|'public'` ⇒ no preHandler (`packages/moonql/src/rest.ts:120-126,430`); published endpoint ACL defaults to `public` (`packages/moonql/src/introspect.ts:142`); model `ADMIN_WRITE` contains only `create/update/remove` (`packages/moonql/src/model.ts:32-36`) so list/get are unguarded (`rest.ts:171,211`; `acl.ts:13-19,25-30`); view `aclSpec` undefined ⇒ no guard (`rest.ts:305`) and published as `public` (`introspect.ts:123`).

| ID | Surface | File:line | Anonymous? | Content actually served | Rights/terms posture |
|---|---|---|---|---|---|
| **E1** | `GET /monitor/overview` | `packages/moonql-monitor/src/index.ts:701-705`; published ACL `introspect.ts:142`; test `apps/arsy/test/moonql-monitor.test.ts:37-38` | **Yes** | Up to 100 radars, 250 sources (incl. `targetUrl`, `externalTarget`), 100 signals (sliced to 40, incl. `aiSummary`, author, counts), 30 tasks (sliced to 15) | Provider-less social/web telemetry served with no freshness or fixture label. Committed test asserts `200` on a request built **without** an auth header (`test:37`), i.e. the anonymity is pinned by test, not inferred. |
| **E2** | `GET /monitorSignalFeed` (view) | `packages/moonql-monitor/src/index.ts:652-678` | **Yes** | 100 rows: `title,url,platform,author,summary,aiSummary,sentiment,urgencyScore,viewsCount,likesCount,commentsCount,status,publishedAt` + expanded source/radar | Seeded rows include unverified placeholder URLs and "verified"/"promoted" statuses (N1, §6). |
| **E3** | Raw REST `GET /monitor_radars`, `/monitor_sources`, `/monitor_signals` | `packages/moonql-monitor/src/index.ts:52-53,166-167,347-348`; `model.ts:32-36`; `rest.ts:171,211` | **Yes** | Full DB rows, filterable/expandable by any caller (`?where=`, `?expand=`) | Superset of E1/E2; `monitor_sources.targetUrl` is a scrape-target list readable by anyone. |
| **E4** | Dock public homepage `#world-monitor` card | `apps/dock/src/app/page.tsx:74,105-133`; `program.ts:106`; `apps/dock/src/middleware.ts:118-123` (locale only, no auth) | **Yes** | First 6 signals rendered as current OSINT telemetry under the label `WORLD MONITOR · OSINT RADAR INTERCEPT` (`landing-copy.ts:70`) and `OSINT MONITORING` (`:72`) | No provider, no fetch time, no stale/fixture badge. This is the consumer surface for N1. |
| **E5** | HQ `/world-monitor` | `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:93-108`; `apps/headquarters/src/app/(admin)/layout.tsx:5-7`; `apps/headquarters/src/lib/authz.ts:72-79,97-101` | **No for anonymous** (cookie + hub session); **yes for any authenticated role** | Same E1 payload, plus source `targetUrl` and signal URLs | HQ invents no role: `guardEndpoint` reuses the hub's published `public` rule, so HQ cannot be stricter than E1. |
| **E6** | HQ dashboard "Atmosphere OS — Environmental sensor & space weather grid — **STREAMING**" | `apps/headquarters/src/app/(admin)/page.tsx:108` | Session-gated, not anonymous | Static literal inside `EMPIRE_14_SYSTEMS` (`:97-112`); no data source exists (C15) | False live-status claim about an absent capability (N6). |
| **E7** | HQ `ThreatRadarMap` blips | `apps/headquarters/src/ui/client/ThreatRadarMap.tsx:18-25`; `world-monitor/page.tsx:203` | Session-gated, not anonymous | Fabricated regions/counts/urgency; `TARGETS: 6 ACTIVE` (`:97`) | Decorative demo presented next to real rows; M20-01 §1 already recorded this. |
| **E8** | `monitor_tasks` model | `packages/moonql-monitor/src/index.ts:590-605` | **No** | — | Negative control: `ADMIN_FULL` (`:593`) gates list/get/writes. |
| **E9** | `POST /monitor/enqueue`, `/monitor/claim`, `/monitor/ingest` | `packages/moonql-monitor/src/index.ts:765,803,878` | **No** | — | Negative control: `requires: ['admin','bot']`. Write-side of the monitor is genuinely gated; the gap is entirely read-side. |

Deployment caveat: anonymous reachability assumes the hub is reachable. `docker-compose.yml:55-60` publishes the hub as `3000:3000` with `HOST: 0.0.0.0`, unlike the loopback-only database (`:29-31`). This audit did not run a deployment, so internet exposure is a code-path conclusion, not an observed one.

---

## 4. Rights / terms risk register (no licence decision is made here)

| ID | Subject | Evidence | Risk statement | Owner task |
|---|---|---|---|---|
| **R1** | USGS | P1; no URL/fetch/attribution anywhere | No terms artefact exists in the repo, so no claim about USGS reuse, rate limits or attribution is supported. Must be verified against the provider before M24-04. | M24-03/M24-04 |
| **R2** | GDACS | P2 | Same as R1; there is no EU/JRC attribution string in code. Whether GDACS requires attribution or restricts automated polling was **not verified** and is not asserted here. | M24-03/M24-04 |
| **R3** | NOAA | P3 absent | Nothing to assess; any future use needs its own terms review. | M24-04 |
| **R4** | Open-Meteo | P4 absent | Nothing to assess; no attribution slot exists in the schema even if an adapter were added (N4). | M24-02/M24-04 |
| **R5** | YouTube/RSS fetch | `youtube-rss.ts:113-117` | Outbound GET with a project UA and no ToS/robots/quota handling; platform terms unverified. | M24-03 |
| **R6** | Social scraping (Playwright/OpenClaw) | `playwright.ts:16-25`, `openclaw.ts:15-44`; `M02-07:34` | Automated collection against X/Instagram/TikTok targets whose terms the repo has not recorded; M02-07 keeps this OPEN pending a rate-limit/moderation/privacy audit. | M24-03/M24-06 |
| **R7** | LLM egress | `apps/aigateway/src/server.ts:23-26,75`; `docs/architecture/SECURITY.md:2` | Unauthenticated, wildcard-CORS chat/embeddings proxy to free-tier providers; credentials only in env, no terms/retention statement. Already a named review gate. | M05-15/M24-03 |

No credentials, tokens or private witness material appear in this artifact. `.env` was not read; the egress default is cited from `docker-compose.yml:101` and `.env.example:139` (baseline).

---

## 5. Documentation claims that the code does not support

| ID | Claim | Location | Finding |
|---|---|---|---|
| **D1** | "Fixtures/source adapters refer to **USGS earthquake**, **GDACS disaster**, **NOAA geomagnetic/space weather**, and **Open-Meteo weather/air quality** types." | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:863` | **Overstated for XV.** Exactly one fixture mentions USGS (`fixtures.ts:40`); GDACS exists only as a union member (`signals.ts:11`) plus one prose string (`empire.ts:112`); NOAA and Open-Meteo occur in **zero** source files. There are no "source adapters". The paragraph's own hedge ("establishes code and fixture presence, not live feed freshness") does not cover the two absent providers. |
| **D2** | Historical `A-L-L-A-H/dev` includes "World Monitor ingestion/scheduling/storage" and a `WorldMonitorView`, pinned at `47bac90cade77e2136cb66d546156b220fe8481` | `MASTER_VISION_NARRATIVE_XV.md:772,861` | **Unverifiable here and internally inconsistent.** M06-01 pins A-L-L-A-H as `71a80c94dae0021b`, path `core/manifest.json`, classification `TAXONOMY_ONLY` (`docs/audit/M06-01-source-repo-pins.md:21`); M06-07 repeats "1 System Manifest" (`docs/audit/M06-07-source-crosswalk-queue.md:18`). Two different SHAs and a manifest-only pin cannot evidence ingestion code. The external repository was not fetched for this audit (L2). |
| **D3** | Atmosphere OS maps to "Sentinel OSINT radar clustering **USGS and GDACS sensor events**" | `packages/moonql-ops/src/empire.ts:109-116` (`:112`) | **False as implemented.** The Sentinel registry has no such driver (`apps/sentinel/src/index.ts:24-30`), the hub platform enum forbids both values (`moonql-monitor/src/index.ts:28`), and clustering is generic haversine over captured signals (`apps/sentinel/src/radar.ts:35-71`) with no sensor input. |
| **D4** | "Atmosphere OS — Environmental sensor & space weather grid" shown as **STREAMING** | `apps/headquarters/src/app/(admin)/page.tsx:108` | **False live status.** A static array literal; no provider, table, cron or endpoint backs it. |
| **D5** | World Monitor decision is **OPEN**, deferred to M24 "sebelum kode dijalankan" (before the code is run) | `docs/decisions/M02-07-historical-decisions-matrix.md:34` | **Status drift.** A monitor control plane already exists and is reachable — a 10-minute scheduler that skips only when `EGRESS_ENABLED` is false (`moonql-monitor/src/index.ts:973-990`), ingest endpoints, a HQ console and a public Dock card. M24-01..07 remain unchecked (`TODO.md:561-567` at baseline; `:563-569` at current HEAD). Nothing here proves the external code ran; it shows XV's own monitor runs while the decision still reads OPEN. |
| **D6** | Data-owner table names the Dock card's view as `worldSignals`; public-exposure matrix enumerates routes without any `monitor_*` entry | `docs/audit/ui-screen-audits-d54ad43.md:80`; `docs/audit/M03-01-public-exposure-audit.md:20-31` | **Stale/omissive.** The view is `monitorSignalFeed` (`moonql-monitor/src/index.ts:652`); `GET /monitor/overview`, the five monitor views and all four monitor models are absent from the exposure matrix, so its "audit cakupan" is incomplete against current routes. |

Positive documentation controls worth preserving: the disambiguation of ALLAH (referent) from A-L-L-A-H (acronym) is enforced in data and tests (`packages/moonql-ontology/src/seed.ts:169-176,366-372`; `packages/moonql-unilex/src/index.ts:273-276`; test `apps/arsy/test/unilex.test.ts:265`). No provider claim attaches to the theological referent.

---

## 6. Negative findings (strongest first)

**N1 — Historical fixtures are already presented as live production on the public Dock.** The hub seeds 12 monitor signals (`packages/moonql-monitor/src/index.ts:368-590`) whose URLs cannot be verified as real content and include obvious placeholders (e.g. `watch?v=civicTownhall01` at `:373`, `watch?v=skaFeastLive02` at `:391`, `example.org/osint/...` at `:553`), with invented engagement (`viewsCount: 412000` at `:418`), pre-set editorial statuses (`'verified'`, `'promoted'`, `'flagged'`, `:385,403,421,439`), and an AI summary asserting "Urgent field telemetry **verified** across 3 citizen videos. Recommended for on-air weather bulletin." (`:415`). The public Dock homepage renders the first six rows with sentiment badges, urgency percentages and those AI summaries under "WORLD MONITOR · OSINT RADAR INTERCEPT" / "OSINT MONITORING" (`apps/dock/src/app/page.tsx:74,105-133`; `program.ts:106`; `landing-copy.ts:70-72`). There is no fixture label, provider, fetch timestamp or staleness indicator anywhere on the card. **This is exactly the M24 exit-gate failure "Historical fixtures not mislabeled live production".**

**N2 — The collector manufactures evidence when it cannot collect.** With egress disabled or a fetch failure, every driver returns a fully formed signal claiming success: RSS "verified feed endpoint" (`youtube-rss.ts:119-141`), Playwright "DOM selector tree healthy" (`playwright.ts:40-47`), OpenClaw "extracted clean markdown & engagement metadata" (`openclaw.ts:47-63`), Agent "Verified via heuristic intelligence" (`agent.ts:71-92`). All carry invented `viewsCount/likesCount/commentsCount`. Ingest stores them with `status:'new'` (`moonql-monitor/src/index.ts:946`) and there is no `synthetic`/`fixture` column to distinguish them (`:348-367`).

**N3 — The agent driver ignores the egress kill switch.** `apps/sentinel/src/drivers/agent.ts:15-18` calls the AI gateway unconditionally; `grep -n egressEnabled apps/sentinel/src/drivers/agent.ts` returns **no matches (exit 1)**, unlike `youtube-rss.ts:113`, `playwright.ts:16`, `openclaw.ts:15,35`. The shipped default is `EGRESS_ENABLED=false` (`docker-compose.yml:101`), and the shipped worker driver list includes `agent` (`apps/sentinel/src/index.ts:175`), so a worker that claims any task still performs outbound model calls while the flag says off — a direct gap for M24-03's "no uncontrolled … external fetch".

**N4 — No provenance, freshness or attribution field exists to link an observation to a provider.** `monitor_signals` declares `externalId,title,url,sourceRef,radarRef,platform,author,summary,aiSummary,sentiment,urgencyScore,viewsCount,likesCount,commentsCount,status,publishedAt` (`moonql-monitor/src/index.ts:348-367`) — no `provider`, `providerItemId`, `license`/`attribution`, `fetchedAt`, `revision`, `lat/lng`, `units` or `geoPrecision`. M24-02 cannot satisfy "every observation linked to provider and timestamp" without a schema change; today only `sourceRef` (an internal row) and an optional `publishedAt` exist.

**N5 — The named providers cannot be stored even if a driver produced them.** The worker takes `platform` from the source row (`moonql-monitor/src/index.ts:937`) and the enum is `['youtube','x','instagram','tiktok','rss','web']` (`:28`), while the dead type union allows `'gdacs'|'usgs'` (`packages/types/src/sentinel/signals.ts:11`). Adding a USGS driver would fail validation at ingest. NOAA/Open-Meteo have no token at all.

**N6 — Two surfaces assert live environmental capability that does not exist.** HQ shows Atmosphere OS as `STREAMING` (`apps/headquarters/src/app/(admin)/page.tsx:108`), and the ops seed claims Sentinel clusters "USGS and GDACS sensor events" (`packages/moonql-ops/src/empire.ts:112`). Both are literals; no environmental sensor, feed, table or cron exists (C15).

---

## 7. Verification log (commands actually executed, output observed)

All commands were run from `Z:\project\moonradio` on branch `dev`; none writes, fetches or executes application code.

```
$ git rev-parse --abbrev-ref HEAD ; git rev-parse HEAD
dev
2ed24ac11ef52428e2e5385e0e77a2fdc9cf5154

$ git diff --name-only 00b006443da8a1b9408226ed776e15090f0e640b..HEAD -- \
    packages/moonql-monitor packages/types/src/sentinel packages/testing/src apps/sentinel \
    apps/aigateway apps/dock/src apps/headquarters/src packages/moonql/src \
    docs/vision/MASTER_VISION_NARRATIVE_XV.md docs/decisions/M02-07-historical-decisions-matrix.md \
    docs/decisions/M06-05-historical-interfaces-map.md docs/audit/M06-01-source-repo-pins.md \
    docs/audit/M06-07-source-crosswalk-queue.md docs/audit/M20-01-hq-model-ui-route-guards-ops.md
(no output; exit 0 — every source/doc path named in this command is identical at task baseline and observed HEAD; `.env.example` and `TODO.md` are not in this set — re-checked below)

$ git rev-parse --short HEAD              # dev advanced during the audit (parallel sessions)
b24bedd
$ git log --oneline -3
b24bedd feat(orbit): bind UI to verified ARSY runtime state (M40-06)
9a1bf85 docs(audit): revalidate all six app integration contracts (M28-14)
2ed24ac docs(m34-02): add the ratified decision record and its falsifiable-criteria evidence
$ git diff --name-only 00b0064..HEAD -- packages/moonql-monitor packages/moonql packages/moonql-ops packages/types packages/testing apps/sentinel apps/aigateway apps/dock apps/headquarters apps/arsy/test docs/vision docs/audit/M06-01-source-repo-pins.md docs/audit/M06-07-source-crosswalk-queue.md docs/decisions/M02-07-historical-decisions-matrix.md docs/architecture/SECURITY.md docker-compose.yml .env.example TODO.md docs/milestones/M24.md
.env.example
TODO.md
apps/arsy/test/arsy-env-compat.test.ts
apps/arsy/test/compose-contract.test.ts
(four later changes; neither cited arsy test — `moonql-monitor.test.ts`, `testing-cli.test.ts` — is among them; the `.env.example`/`TODO.md` cited lines are re-checked next)
$ git show HEAD:.env.example | grep -n EGRESS_ENABLED
150:EGRESS_ENABLED=false
$ git show HEAD:TODO.md | sed -n '563,569p'
(seven rows M24-01..M24-07, all `- [ ]` — unchanged in substance; rows were at `:561-567` at baseline)

$ grep -rniE "usgs|gdacs|open-?meteo|noaa" packages/*/src apps/*/src --include=*.ts --include=*.tsx
packages/moonql-ops/src/empire.ts:112:    xvMapping: 'Sentinel OSINT radar clustering USGS and GDACS sensor events',
packages/testing/src/fixtures.ts:40:    platform: 'usgs',
packages/types/src/sentinel/signals.ts:11:  platform: 'youtube' | 'x' | 'rss' | 'gdacs' | 'usgs' | 'agent'

$ grep -rn "fetch(" packages/moonql-monitor/src/index.ts
(no matches; exit 1 — the hub addon performs no egress; only seed URL literals exist)

$ grep -n "egressEnabled" apps/sentinel/src/drivers/agent.ts
(no matches; exit 1)

$ sed -n '368,590p' packages/moonql-monitor/src/index.ts | grep -c "externalId:"
12

$ sed -n '348,367p' packages/moonql-monitor/src/index.ts \
    | grep -nE "\b(provider|license|licence|attribution|fetchedAt|revision|lat|lng|geo)\b"
(no matches; exit 1 — monitor_signals declares no provenance/freshness/geo field)
```

Not executed (read-only brief): no `node --test`, `pnpm` script, hub boot, Docker stack, browser or outbound request. The anonymous-`200` claim for `GET /monitor/overview` is therefore cited from the committed test source `apps/arsy/test/moonql-monitor.test.ts:37-38`, not from a run in this task.

---

## 8. Packet report

- **task_id:** M24-01
- **baseline_sha:** `00b006443da8a1b9408226ed776e15090f0e640b` (task baseline; observed HEAD `2ed24ac11ef52428e2e5385e0e77a2fdc9cf5154`, later `b24bedd` — all cited source paths unchanged; see §7).
- **actual_changed_files:** `docs/audit/M24-01-historical-provider-inventory.md` (1 file). No source, schema, `package.json`, `TODO.md`, test or git index change; no `git add`/`commit`.
- **positive_test_and_output:** static inventory checks in §7 — 3 source lines referencing the named providers, 12 seeded signals counted, 16 capability rows and 9 exposure rows each backed by a read `file:line`; the anonymous exposure E1 is corroborated by the committed test that asserts `200` without an auth header.
- **negative_test_and_output:** four absences verified by commands returning no matches (§7): no `fetch` in the monitor addon, no `egressEnabled` reference in the agent driver, no NOAA/Open-Meteo line in the provider grep, no provider/freshness/attribution field inside the `monitor_signals` schema block. `git diff` over all cited source paths returned empty at both `2ed24ac` and `b24bedd`, so no finding depends on a parallel session's edit (the only later changes among cited files were unrelated lines in `.env.example` and `TODO.md`, re-checked in §7).
- **security_rights_privacy:** records public reachability of monitor rows (E1–E4) and fabricated telemetry (N1/N2) without exercising them; no secret, token, `.env` value, PII or private witness material is reproduced; no licence conclusion is asserted for any provider (R1–R7 mark the terms as unverified). No outbound egress was performed.
- **reviewer:** **unassigned** — requires integrator plus a named human reviewer; this artifact does not self-approve and does not tick the TODO row.
- **rollback:** delete `docs/audit/M24-01-historical-provider-inventory.md`; no other state was touched.
- **result_sha:** `uncommitted`.
- **limitations:**
  - **L1** Static analysis only: no hub, worker, Docker stack, browser or test run in this task; "anonymous sees X" is a code-path plus committed-test conclusion.
  - **L2** External provider terms (USGS, GDACS, NOAA, Open-Meteo, YouTube, X/Instagram/TikTok, LLM free tiers) were **not fetched or read**; every rights row says "unverified" rather than guessing a licence.
  - **L3** The historical A-L-L-A-H repository was not cloned; D2 rests on the two conflicting pins already in this repo.
  - **L4** Per the task boundary, `apps/arsy/src` was not inspected, so production addon registration of `moonql-monitor` is inferred from the committed test harness (`apps/arsy/test/moonql-monitor.test.ts:10`) and the existing HQ/Dock consumers, not from the hub bootstrap file.
  - **L5** No packet exists for M24-01; scope was taken from `TODO.md:561` (baseline) and `docs/milestones/M24.md`.

*Inventory artifact only; `TODO.md` owns task status. Findings feed M24-02 (provenance/freshness schema), M24-03 (egress control and N3), M24-04 (one adapter + terms gate), M24-05 (stale/fixture labelling and N1) and M24-06 (platform moderation).*
