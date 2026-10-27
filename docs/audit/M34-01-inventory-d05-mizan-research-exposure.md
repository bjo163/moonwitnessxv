# M34-01 — Inventory: D05 MIZAN capabilities and raw Research exposure

- **Task**: M34-01 (LEAF, milestone [M34 MOONLAB research workbench](../milestones/M34.md), packet [M34-01](../tasks/M34/M34-01.md))
- **Baseline SHA**: `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (branch `dev`)
- **Predecessor evidence (prereq M14-07, closed)**: [M14 review evidence](M14-mizan-review.md), [ADR M14-01](../decisions/M14-01-review-workflow.md)
- **Domain contract**: BLUEPRINT D05 (Research: case, frame, source-linked assertion, counterevidence, SRGBL stages, MIZAN method/run) and D08 (Publication/Governance: rights decision, reviewer/sign-off, release/withdraw/retract, consent policy — all public publishing gates)
- **Privacy contract**: [docs/architecture/SECURITY.md](../architecture/SECURITY.md) — "rights/consent (ADR-0003, D08) override public UI"; "`ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection"
- **Companion evidence note**: [M34-01-d05-mizan-research-exposure.md](M34-01-d05-mizan-research-exposure.md)
- **Scope note**: inventory only; no code changed. This artifact is the input for M34-04 (D08 released-research projection specification) and M19-19 (Dock audit).

Every row below was verified by reading the named file at the baseline SHA. `rest: true` + `acl: ADMIN_WRITE` reachability is derived from the live MoonQL core code (`packages/moonql/src/model.ts`, `acl.ts`, `rest.ts`), quoted per row.

---

## A. D05 MIZAN / Research capability inventory (state in code today)

### A.1 `@moonwitness/moonql-research` source modules (`packages/moonql-research/src/`)

| # | Capability | Files | State | What exists in code |
|---|---|---|---|---|
| C1 | Research domain addon + 7 REST models + validation hooks + 12 endpoints | `index.ts` (1268 lines) | **Implemented** | `defineAddon({name:'research'})` (index.ts:354) with models `research_cases` (359), `research_frames` (382), `research_claims` (408), `research_relations` (429), `research_witnesses` (451), `research_quality_runs` (489), `research_hypotheses` (514); each `rest: true, acl: ADMIN_WRITE`; beforeCreate/beforeUpdate/beforeDelete gates per model (548–646); register/validate endpoints (698–1209) all `requires: ADMIN_ONLY` |
| C2 | SRGBL v8 method constants + M13/M14 seeds | `seed.ts` (697 lines) | **Implemented** | Stage names/questions/limits, rights statuses, `QURAN_SHA256`, case/frame/claim/relation/witness/quality/hypothesis seeds, `COUNTEREVIDENCE_SEED` (2, `OPEN`), `MIZAN_METHOD_*` constants, `M14_POLICY` with `publicationAvailable: false` (623–644) |
| C3 | SRGBL stage evaluation + separated scoring + SWING/OFFSIDE engines | `gates.ts` (699 lines) | **Implemented** | `evaluateStages`, `scoreMaturity` (max 15), `scoreQuality` (max 40), `scoreWitness` (candidate support, max 100), `scoreDirection` (−2..2), `proposeSwing`/`proposeSwingChain` (depth ≤ 3), `diagnoseOffside` |
| C4 | Engineering-only read projections | `projection.ts` (476 lines) | **Implemented** (explicitly **not** a D08 projection) | `researchOverview`, `researchCase`→`caseDetail`, `researchMetrics`, `researchTrace`, `listHypotheses`; every view stamps `reviewState: 'ENGINEERING_ONLY'`, `humanReviewed: false`, `rawTextExposed: false` |
| C5 | Review state machine + release verdict + MIZAN scoring (pure library) | `review.ts` (234 lines) | **Implemented** | `REVIEW_TRANSITIONS` DRAFT→SUBMITTED→REVIEWED (+DISPUTED/REJECTED/RETRACTED) (15–22), `scoreMizan`/`parseMizanScores` (6 criteria × 0–4 = 24, fixed), `pilotStatus` (≥2 independent annotators, same exact SHA), `releaseVerdict` (178–214: 14 fail-closed blockers, `publicationAvailable: false` literal type), `withLock` |
| C6 | MIZAN review subsystem: 6 models + hooks + 15 endpoints | `review-subsystem.ts` (1238 lines) | **Implemented** | Models `research_reviews`, `research_review_events`, `research_counterevidence`, `mizan_methods`, `mizan_runs`, `research_pilot_annotations` — all `rest: false` (no generic REST read) (340–481); append-only/immutable hooks; endpoints 602–1238; every response hardcodes `publicationAvailable: false`; MIZAN method locked to single candidate version `MIZAN-EVIDENCE-RISK-CONSISTENCY` v1, status `CANDIDATE_NOT_RATIFIED`, SHA `9e6e…669c` |
| C7 | Shared helpers + named-human actor gate | `common.ts` (89 lines) | **Implemented** | `assertSha`, `findCase/findCode/rowById`, `humanActor` (forbids anonymous, nameless, guest or non-`admin`/`user` actors — "machines cannot review research") |
| C8 | M15 Jerusalem 70 CE interdisciplinary pilot (in-memory view + 5 endpoints) | `historical-pilot.ts` (385 lines) | **Implemented** | `buildJerusalemComparativeView()` — hardcoded fixture view (texts with Greek/English/Indonesian excerpts, events, persons, story frames, 3 ACKNOWLEDGED counterevidence entries, invariants); 2 public GET + 3 ADMIN_ONLY POST invariant-gates |

### A.2 Wiring, clients and adjacent surfaces

| # | Capability | Files | State | Notes |
|---|---|---|---|---|
| C9 | Single-hub mount | `apps/arsy/src/addons.ts:15,39`; `apps/arsy/src/app.ts:69` | **Implemented** | research addon mounted in ARSY (THE single hub); moonql REST registered under `config.api.prefix`; compose maps `arsy` `3000:3000` on `HOST: 0.0.0.0` (docker-compose.yml:44–60) — not loopback-bound like the db |
| C10 | Generated client SDK research types | `packages/moonql-client/src/generated.ts:4,1635+` | **Implemented** | 7 `rest: true` research models appear in `ModelName` and row types (route + payload contract is public by construction); the 6 review/MIZAN models (`rest: false`) correctly do **not** appear |
| C11 | Dock public Research page | `apps/dock/src/app/research/page.tsx` | **Implemented, fail-closed** | Renders only an Alert: "The research ledger is withheld until an approved D08 public projection is available" (`apps/dock/src/lib/states-copy.ts:96`); no data fetched; linked from shell nav (`ui/components/shell.tsx:33`) and `app/sitemap.ts:26` |
| C12 | Dock ResearchExplorer UI component | `apps/dock/src/ui/client/ResearchExplorer.tsx` (459 lines) | **Skeleton — built but unwired** | Zero importers in `apps/dock/src` (verified by grep); accepts `ResearchCasesRow/WitnessesRow/HypothesesRow[]` props; if ever wired to the public endpoints it would render CANDIDATE hypotheses and unreviewed conclusions — must be covered by the M34-04 approved-projection rule |
| C13 | Dock compare page (hardcoded comparative research text) | `apps/dock/src/app/reader/compare/page.tsx` | **Implemented, unconditional public** | See exposure E7 |
| C14 | HQ research visibility | `apps/headquarters/src/app/(admin)/page.tsx:98,197`, `src/layouts/vertical.tsx:28` | **Skeleton / decorative** | Static "MIZAN Review NOMINAL" badge and "Research Lab" tile; the `research-lab` menu link points at `/models/models/monitor_radars` (telemetry), not at any review workflow; no MIZAN reviewer desk exists in HQ today |
| C15 | MOONLAB app (`apps/moonlab`) | — | **Planned only** | BLUEPRINT §Apps: "Proposed \`apps/moonlab\`… D05 data, HQ review remains independent"; no directory exists (`ls apps/`) |
| C16 | D08 released-research projection | — | **Absent (the gap)** | No code path turns a REVIEWED/APPROVED review into any public output; `releaseVerdict` exists but every endpoint keeps `publicationAvailable: false` (M14-07 closed intentionally). M34-04 specifies the projection; M19-19/M27-05/M27-08 depend on it (TODO rows 466, 616, 619) |

**Package-level test coverage** (not in the research package — `packages/moonql-research` has no `test/` dir): `apps/arsy/test/research.test.ts` (M13, 8 tests, re-run at baseline — see evidence note), `research-pg.test.ts`, `mizan.test.ts` / `mizan-pg.test.ts` (M14), `m15-historical-pilot.test.ts` (M15).

---

## B. Reachability model (why "public" here means anonymous-readable)

1. **Addon endpoints**: `moonqlRest` guards each endpoint with `guard(ep.def.requires)` (`packages/moonql/src/rest.ts:355,430`); `guard()` returns no preHandler when the rule is `undefined` or `'public'` (rest.ts:120–126). The five GET projection endpoints + 2 comparative GET endpoints declare `requires: 'public'` → **anonymous callers get full JSON bodies**.
2. **Raw model REST**: models declare `rest: true` + `acl: ADMIN_WRITE`. `ADMIN_WRITE` = `{create,update,remove: ADMIN_ONLY}` with **no `list`/`get` entries** (`packages/moonql/src/model.ts:31–36`); model.ts:128 states "Per-operation access rules; default 'public'". `resolveAcl(undefined)` → `roleRule: undefined` → no guard (`acl.ts:13–19,25–30`); list/get routes take `model.acl.list` / `model.acl.get` (rest.ts:162–198). Result: `GET /<prefix>/research_cases`, `/research_frames`, `/research_claims`, `/research_relations`, `/research_witnesses`, `/research_quality_runs`, `/research_hypotheses` are **anonymous-readable with full rows**, exactly the hazard SECURITY.md line 2 names.
3. **Review/MIZAN side is gated**: `research_reviews`, `mizan_runs` etc. are `rest: false`; `GET /research/reviews*`, `/research/pilot`, `/research/reviews/:code/release` are `ADMIN_ONLY`; mutations are `'auth'` + `humanActor` (rejects guest/anon/nameless) + four-eyes guard. This is the working negative-control half of the domain.

---

## C. Raw / unreviewed Research exposure ledger

Rights/consent posture per row keyed to the D08 question: *could unreviewed or rights-unknown information reach a public reader?* Today, for these rows, yes (or the surface is already retired). "Gate" = closest thing preventing it.

| ID | Surface | File:line | Anonymous? | Content actually served | Rights/consent posture | D08 verdict for M34-04 |
|---|---|---|---|---|---|---|
| **E1** | `GET /research/hypotheses` (`requires:'public'`) | `packages/moonql-research/src/index.ts:691–696` → `projection.ts:452–474` | **Yes** | **Every hypothesis row**, all statuses including `CANDIDATE`: full `question` text, `evidenceSpan`, `evidenceSha`, lens, `counterReadings`, `mismatchNote`, `proposedBy` ("M13 engineering seed") | Unreviewed AI/engineering candidates served with no review-state filter; labels only (`reviewState:'ENGINEERING_ONLY'`, `notice`) — labels are disclaimers, not a gate | **VIOLATION — strongest negative.** No D08 decision of any kind sits between seed and public reader. Pinned as correct-by-test: `apps/arsy/test/research.test.ts:930–943` asserts anonymous `200` with `total 3`, all `status === 'CANDIDATE'` |
| E2 | `GET /research/case?code=…` | `index.ts:658–667` → `projection.ts:383–386` (`caseDetail` 226–291) | **Yes** | Full case detail: claims (incl. `status:'UNKNOWN'` inferred claims), relations, witness `conclusion`/`limits`, frames, hypotheses, metrics | Includes case `RC-QS-037-030-AR` with `rightsSnapshot: 'RIGHTS_UNKNOWN'` and `evidenceSha: null` (seed.ts:273–286) — **rights-unknown case content is publicly enumerable** | **VIOLATION.** D08 requires rights decision before public service; case list itself must not be a public oracle for rights-unknown material |
| E3 | `GET /research/trace?code=…` | `index.ts:680–689` → `projection.ts:412–450` | **Yes** | Claim statuses/spans/SHAs, relation views, witness conclusions + citations, frame, metrics | Same unreviewed content as E2, structured as a "verified-looking" trace | **VIOLATION (derivative of E2)** |
| E4 | `GET /research/metrics` / `GET /research/overview` | `index.ts:669–678, 649–656`; overview body `projection.ts:293–374` | **Yes** | Separated scores (maturity/quality/witness/direction), stage results, per-case rights snapshot + edition/translation rights codes, issue register, policy | Scores over unreviewed data; overview exposes `RIGHTS_UNKNOWN` per-case without content text — lower severity, still a public exposure of governance state | **CONDITIONAL.** Overview may be whitelisted by M34-04 as metadata-only; metrics over unreviewed cases must move behind the released projection |
| E5 | Raw model REST `GET /research_cases`, `_frames`, `_claims`, `_relations`, `_witnesses`, `_quality_runs`, `_hypotheses` | `index.ts:359–544` (`rest:true, acl:ADMIN_WRITE`) + `packages/moonql/src/model.ts:31–36,128–129`, `acl.ts:25–30`, `rest.ts:162–198` | **Yes** | **Complete DB rows**, all fields (audit ids included), `?where=`/`?expand=` filtering by any caller — superset of E1–E4 | No review state, no rights check, no field subset; SECURITY.md:2 names this exact pattern; also amplifies via public SDK types (C10) | **VIOLATION — must be flipped** to `ADMIN_FULL`-style or an approved D08 view. Note `?expand=caseRefRecord` exposes case rights snapshots per row |
| E6 | `GET /research/comparative-case` (+ `/jerusalem-70ce`) | `historical-pilot.ts:258–271`, view 121–256 | **Yes** | Hardcoded excerpts: Mark 13:2 Greek + English, Josephus tr. Thackeray, **QS 17:4–7 English translation**, archaeology; per-source rights flags; `reviewState: 'REVIEWED_DISTINCT_DOMAINS'` | Rights flags are **asserted in code** (`PUBLIC_DOMAIN`, `RIGHTS_EXACT_VERSION_CLEARED` from the M13 cleared digest) with no D08 record; the review state is a self-declared constant with **no review, counterevidence-resolution, MIZAN or pilot trail behind it** | **VIOLATION of form (self-declared reviewed state), possibly of content.** Approved as a public explanatory view by TODO M15-06, but that predates D08; M34-04 must either re-ratify it as a D08 fixture with a real sign-off or move it into the released projection. QS 17:4–7 translation excerpt relies on the same Cairo-Hafs clearance story as D05 seeds — not a D08 rights decision artifact |
| E7 | Dock `GET /reader/compare` (public web page) | `apps/dock/src/app/reader/compare/page.tsx:15–70,85–95,151–152` | **Yes** (page is public) | Six hardcoded parallel texts of QS 2:82: Cairo Hafs Arabic, **Warsh Medina Arabic**, **Kemenag Indonesian**, **Sahih International English**, morphology gloss, and an **"Editorial Linguistic Note" reviewer commentary**; each `licenseStatus:'RIGHTS_CLEARED'`, page badge "RIGHTS CLEARED" | Every flag is a hardcoded string — **no D08 lookup at all** (SECURITY.md:2 explicitly lists "hardcoded RIGHTS_CLEARED" as a test target). Warsh and Sahih International editions have **no rights record** anywhere in the repo seeds at this baseline; the commentary note is an unreviewed interpretive claim published as analysis; citations minted from the same unverified payloads | **VIOLATION — the concrete public-site leak M19-19 targets** ("remove direct unrestricted candidate publication … no unreviewed or rights-unknown information leaked to public"). Not fixed here (that is M19-19/M34-04 work) |
| E8 | ResearchExplorer wired to any of E1–E5 | `apps/dock/src/ui/client/ResearchExplorer.tsx:24–29,363–411` | Currently n/a (unwired) | Would render hypotheses tab with CANDIDATE questions from raw rows | Latent; the component already ships in the public bundle surface | **WATCH for M34-04:** whitelist rule "Dock may bind research UI only to the released projection type, never `ResearchHypothesesRow[]`" |
| E9 | Dock `/research` page | `apps/dock/src/app/research/page.tsx:27` | Yes | Withhold notice only | Fail-closed pending D08 — this is the intended posture | **COMPLIANT (negative control)** |
| E10 | `/_schema` introspection | `packages/moonql/src/rest.ts:440` (`introspectionAcl ?? 'auth'`); `apps/arsy/src/app.ts:69` passes no override | No (auth) | Full contract incl. research route list | Route *shape* leaks to anonymous only via client SDK statics (C10), not runtime schema | Low risk; mention in M34-04 as contract surface |

### Whitelist determination (what M34-04 must decide per row)

- **Must be gated or retired before any public preview**: E1, E2, E3, E5, E7 (and E6 unless re-ratified). M27-08 is explicitly BLOCKED by M19-19 until an approved D08 public projection exists (TODO row 619).
- **Candidates for an explicit reviewed whitelist with recorded D08 sign-off**: E4-overview (metadata-only slice), E6 (if given a real rights/review record), E9/E10 already compliant.
- **Positive controls the inventory confirms exist** (so the gap is read-side only, not governance-side): review/MIZAN write paths (C5–C7), `publicationAvailable: false` hardcode in every review response (`review-subsystem.ts:211,625,631,696,804,863,898,938,1148,1198,1216`; `review.ts:205`), Dock `/research` withhold (E9), raw review models `rest:false`.

**Counts**: D05 MIZAN/Research capabilities inventoried: **16** (C1–C16). Raw/unreviewed research exposures catalogued: **10 ledger rows** (E1–E10): **6 active violations/conditional violations** (E1, E2, E3, E5, E6, E7) + 1 conditional (E4) + 1 latent (E8) + 2 compliant/negative controls (E9, E10).

---

## D. Spot-check verification (each claimed path was read at baseline; re-run these)

```
git rev-parse HEAD                                   # expect 76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3
git status --porcelain -- packages/moonql-research apps/dock apps/arsy/test   # empty = inventoried files untouched
ls packages/moonql-research/src                       # common gates historical-pilot index projection review review-subsystem seed
sed -n '691,696p' packages/moonql-research/src/index.ts        # hypotheses endpoint, requires:'public'
sed -n '452,474p' packages/moonql-research/src/projection.ts   # listHypotheses, no review-state filter
sed -n '31,36p;128,129p' packages/moonql/src/model.ts          # ADMIN_WRITE lacks list/get; acl default 'public'
sed -n '25,30p' packages/moonql/src/acl.ts                     # undefined/public rule passes for anonymous
sed -n '162,171p' packages/moonql/src/rest.ts                  # list route guards model.acl.list (undefined => none)
sed -n '15,70p;95p' apps/dock/src/app/reader/compare/page.tsx  # hardcoded editions + RIGHTS_CLEARED
sed -n '27p' apps/dock/src/app/research/page.tsx               # fail-closed withhold
sed -n '930,943p' apps/arsy/test/research.test.ts              # anonymous GET /orm/research/hypotheses expects 200 + CANDIDATE items
sed -n '258,271p' packages/moonql-research/src/historical-pilot.ts  # public comparative-case GET
grep -rn "ResearchExplorer" apps/dock/src --include=*.tsx | grep -v ui/client/ResearchExplorer  # no importers (E8 latent only)
pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts   # 8/8 pass at baseline (see evidence note)
```

*This is a reviewed inventory artifact, not a status tracker; TODO ownership stays in [TODO.md](../../TODO.md).*
