# M25-05 — Cosmos/Time explorer proposal boundary (evidence)

- **Task:** M25-05 — Sketch optional Cosmos/Time explorer with proposal label (`TODO.md:584`, priority **P3**, difficulty D2)
- **Milestone:** [M25](../milestones/M25.md) · Time, Cosmos, Earth science and research horizons
- **Acceptance audited:** `Not discoverable as shipped feature` (`TODO.md:584`)
- **Prerequisite:** M25-01 — closed at `ed3561a` (`TODO.md:580`; [audit](M25-01-mtime-antikythera-audit.md))
- **baseline_sha:** `dfc65564760eda4ced596f661bda3f84c2d755e5` (`dev`, commit date `2026-10-28 16:32:39 +0700`)
- **worker:** design/audit agent (two documents and one standalone Node validator only)
- **Design artifact:** [docs/design/M25-05-cosmos-time-explorer-sketch.md](../design/M25-05-cosmos-time-explorer-sketch.md)
- **Boundary gate:** `scripts/check-m25-05-proposal-boundary.mjs`
- **Worktree:** a concurrent session advanced `dev` while this leaf was in progress. The pinned baseline is `dfc6556`; the latest HEAD observed was `91a5ff7`. At `6d1e436` that session committed the three paths this leaf created (`docs(m25): sketch the optional Cosmos/Time explorer as a proposal`). The design document and validator in the working tree are identical to that commit; this audit carries an uncommitted revision because the committed record was shorter. No commit, stage, checkout, reset or stash was performed by this leaf, and no foreign file was edited. Commits after the baseline changed TODO rows, HQ/ARSY/aigateway code and, at `3ac738b`, Dock bilingual gateway copy plus two Dock locale tests (P6); no Dock route, navigation array or sitemap entry changed.
- **Reviewer:** pending (integrator + human reviewer)
- **Rollback:** delete the design document, this audit and the validator (three files).
- **result_sha:** none — nothing committed.

| Required report field | Value |
|---|---|
| `task_id` | M25-05 |
| `baseline_sha` | `dfc65564760eda4ced596f661bda3f84c2d755e5` |
| `worker` | design/audit agent |
| `claimed_files` | `docs/design/M25-05-cosmos-time-explorer-sketch.md`, `docs/audit/M25-05-cosmos-explorer-proposal.md`, `scripts/check-m25-05-proposal-boundary.mjs` |
| `actual_changed_files` | the same three files, all new/untracked; no source, TODO, config, lockfile or app-test change |
| `positive_test_and_output` | §3 P1–P7 |
| `negative_test_and_output` | §4 N1–N10 |
| `security_rights_privacy` | no secrets, no external fetch, no user or site data, no schema/ACL change; the sketch forbids collecting observer coordinates without a privacy decision |
| `reviewer` | pending |
| `rollback` | delete the three new files |
| `result_sha` | none |
| `limitations` | §7 |
| `next_eligible_task` | M25-02 (claim type + source) and M25-04 (units/calibration/source metadata) before any implementation; integrator decides M25-05 status |

---

## 1. Scope and method

**In scope:** whether a Cosmos/Time explorer exists as a shipped Dock feature; whether the M25-05 design artifact is unmistakably a proposal; whether it is tied to real, open prerequisites; and whether a repeatable gate prevents accidental shipping.

**Method:** repository inspection at the pinned baseline and the current working tree; `git grep` sweeps for cosmos/astronomy vocabulary; route-directory inventory under `apps/dock/src/app`; full read of `NAV_LINKS` (`apps/dock/src/ui/components/shell.tsx:27-43`) and `DOCK_SITEMAP_ROUTES` (`apps/dock/src/app/sitemap.ts:16-32`); read of Dock metadata/copy paths and search affordances; read of the M25-01 and M25-03 evidence; a dependency-free Node validator with 13 negative and 3 positive self-test fixtures; `node --check` and ESLint on that script.

**Out of scope by instruction:** application code, routes, components, tests inside apps, copy, metadata, sitemap, TODO edits, commits, pushes, external fetches, astronomy data.

**Missing input:** the task brief points at `docs/tasks/M25/M25-05.md`; **that packet does not exist** at baseline. `ls docs/tasks/M25/` returns `M25-01.md`, `M25-03.md`, `M25-04.md`, `M25-06.md`, `M25-07.md`. The task statement used here is the canonical TODO row (`TODO.md:584`) plus its acceptance and the M25-01 audit's handoff note (`M25-01-mtime-antikythera-audit.md:230`). This is recorded as a limitation, not silently filled.

---

## 2. What the design proposes (summary)

The sketch is a **PROPOSAL**, explicitly **NOT SHIPPED** and **NOT DISCOVERABLE** (`docs/design/M25-05-cosmos-time-explorer-sketch.md:3`). It proposes, for discussion only:

1. A reader-facing list/detail surface that would show time/sky material **only** with an explicit claim type and source.
2. A four-value claim vocabulary — `PHYSICAL READING`, `SIMULATION`, `ASTRONOMY`, `STORY` — with a rule that one item carries exactly one type, provenance is mandatory, and no type is silently promoted to another.
3. Eleven proposed surface states, including `EMPTY_NO_SOURCE`, `BLOCKED_SOURCE`, `WITHHELD`, `STALE`/`OFFLINE`/`UNKNOWN`, and an explicit refusal of placeholders and "coming soon" badges.
4. A data-needs table showing that most required layers are **absent today**: ephemeris, observer coordinates/timezone, astronomy store, pinned almanac, claim-type field, units/calibration, and comparative-cosmos rights.
5. Accessibility, keyboard, reduced-motion and locale acceptance criteria built on existing MoonUI/Dock patterns.
6. Thirteen decisions still owed (authorisation, enum ownership, time scale, source pinning, privacy, IA placement, visual permission, owner, a11y evidence, logging, gate ownership).

The sketch is deliberately an argument **against building now**: at baseline it would have only narrative labels to show, and those already have a home on the existing timeline page (`apps/dock/src/app/timeline/page.tsx:12-20`).

---

## 3. Positive evidence

### P1 — The three deliverables exist; only this audit revision is uncommitted

```text
$ git status --porcelain -- docs/design/M25-05-cosmos-time-explorer-sketch.md docs/audit/M25-05-cosmos-explorer-proposal.md scripts/check-m25-05-proposal-boundary.mjs
 M docs/audit/M25-05-cosmos-explorer-proposal.md
$ git diff --stat HEAD -- docs/audit/M25-05-cosmos-explorer-proposal.md
 docs/audit/M25-05-cosmos-explorer-proposal.md | 381 +++++++++++++++++++++-----
 1 file changed, 317 insertions(+), 64 deletions(-)
```

A concurrent session committed all three paths at `6d1e436`; the design document and validator are clean against HEAD, and this audit is the expanded uncommitted revision. No tracked source, TODO, config or lockfile file is modified by this leaf. The concurrent session's other modified/untracked files were left untouched.

### P2 — The sketch is unmistakably a proposal

```text
$ grep -n "PROPOSAL STATUS\|NOT SHIPPED\|NOT DISCOVERABLE" docs/design/M25-05-cosmos-time-explorer-sketch.md
3:**PROPOSAL STATUS: PROPOSAL — NOT SHIPPED — NOT DISCOVERABLE.**
```

The gate also requires the markers `P3`, `M25-01`, `M25-02` and `M25-04` in the design document and `baseline_sha`, `dfc6556`, `PROPOSAL`, `P3`, `M25-02`, `M25-04`, `Rollback` in this audit. Removing any one is a self-test rejection (P5).

### P3 — The proposal is tied to real prerequisites and their actual status

```text
$ grep -n "M25-01\|M25-02\|M25-04\|M25-05" TODO.md | head -4
580:| - [x] | **M25-01** — Audit M-TIME/Antikythera claims and engineering dependencies | ... Closed at exact SHA `ed3561a` ...
581:| - [ ] | **M25-02** — Separate physical readings, simulation, astronomy and story modes | P3 | D2 | M24-02 | UI ontology has explicit claim type and source |
583:| - [ ] | **M25-04** — Define unit normalization, measurement/calibration and source metadata | P3 | D3 | M25-02,M25-03 | No simulated values presented as sensor data ; [packet](docs/tasks/M25/M25-04.md) |
584:| - [ ] | **M25-05** — Sketch optional Cosmos/Time explorer with proposal label | P3 | D2 | M25-01 | Not discoverable as shipped feature |
```

The sketch states that **P3 is optional**, that M25-02 and M25-04 remain **open** prerequisites for any implementation, and that M25-06 remains open for comparative material. It does not claim closure.

### P4 — Boundary gate passes

```text
$ node scripts/check-m25-05-proposal-boundary.mjs
PASS proposal markers present in docs/design/M25-05-cosmos-time-explorer-sketch.md
PASS no implementation instruction and no cosmos/time route literal in the sketch
PASS baseline dfc6556 pinned in the audit
PASS 33 Dock app paths scanned; no cosmos/astronomy/time route besides timeline
PASS NAV_LINKS entries=15; no cosmos/time destination
PASS DOCK_SITEMAP_ROUTES entries=15; no cosmos/time route
PASS 83 apps/dock/src source files scanned; no cosmos/astronomy vocabulary
NOTE absence is the mechanism: the explorer is a document, not a hidden feature
exit=0
```

### P5 — Gate self-test: 13 negative fixtures rejected, 3 positive controls accepted

```text
$ node scripts/check-m25-05-proposal-boundary.mjs --self-test
PASS  negative: design document without the NOT SHIPPED marker is rejected
      first error: design document lost marker "NOT SHIPPED"
PASS  negative: design document without the M25-02 prerequisite is rejected
      first error: design document lost marker "M25-02"
PASS  negative: design document that instructs adding a route is rejected
      first error: design document reads as an implementation instruction: "Add a cosmos route to the public header before release."
PASS  negative: design document that instructs registering a sitemap page is rejected
      first error: design document reads as an implementation instruction: "Register the page in the sitemap after M25-04."
PASS  negative: design document naming a cosmos route literal is rejected
      first error: design document names a cosmos/time route literal "`/cosmos"
PASS  negative: audit without the baseline_sha marker is rejected
      first error: audit lost marker "baseline_sha"
PASS  negative: a cosmos NAV_LINKS entry is rejected
      first error: NAV_LINKS contains a cosmos/time entry "/cosmos"
PASS  negative: a bare time NAV_LINKS entry is rejected
      first error: NAV_LINKS contains a cosmos/time entry "/time"
PASS  negative: a cosmos sitemap entry is rejected
      first error: DOCK_SITEMAP_ROUTES contains a cosmos/time entry "/cosmos"
PASS  negative: an astronomy sitemap entry is rejected
      first error: DOCK_SITEMAP_ROUTES contains a cosmos/time entry "/astronomy"
PASS  negative: a cosmos route directory is rejected
      first error: shipped Dock route path "cosmos/page.tsx" contains forbidden segment "cosmos"
PASS  negative: a bare time route directory is rejected
      first error: shipped Dock route path "(public)/time/page.tsx" contains forbidden segment "time"
PASS  negative: cosmos vocabulary inside apps/dock/src is rejected
      first error: apps/dock/src still contains cosmos/astronomy vocabulary at apps/dock/src/ui/fixture.ts:1
PASS  positive: the pre-existing narrative timeline route is allowed
PASS  positive: a negated route sentence is not an instruction
PASS  positive: an allowed timeline archive path is not a forbidden segment
SELF-TEST PASS: all 13 invalid fixtures rejected and all 3 valid fixtures accepted
exit=0
```

### P6 — Baseline anchoring under concurrent HEAD movement

`dev` advanced from `dfc6556` during this leaf. The diff observed for the cited code paths was:

```text
$ git rev-parse --short HEAD
3ac738b
$ git diff --stat dfc6556..3ac738b -- apps/dock/src apps/dock/test packages/moonui/src/client/mts-clock.tsx packages/core/src/time.ts packages/moonql/src/schema.ts packages/types/src/sentinel/telemetry.ts docs/decisions/ADR-0009-public-ui-reference-adoption.md docs/design/M19-03-public-ia.md docs/design/M25-03-heliogrid-material-forge-questions.md MASTER_DESIGN.md BLUEPRINT.md
 apps/dock/src/lib/landing-copy.ts    |  4 ++--
 apps/dock/src/lib/metadata.ts        |  4 ++--
 apps/dock/test/landing-copy.test.mjs | 42 ++++++++++++++++++++++++++++++++++++
 apps/dock/test/metadata.test.mjs     | 29 ++++++++++++++++++++++----
 4 files changed, 71 insertions(+), 8 deletions(-)
```

The four changed files belong to the concurrent M31-04 LIGHTHOUSE gateway copy work: two bilingual description strings and locale-test assertions. They add no cosmos/time vocabulary, route, `NAV_LINKS` entry or sitemap route, and the gate re-run after those commits still passes (P4). The design document's line citations are anchored at the pinned baseline `dfc6556`, as its Section 5 states; a reviewer reading the moving worktree should expect the `landing-copy` test body to sit at a later line than the baseline citation.

HEAD advanced again after that diff:

```text
$ git log --oneline 3ac738b..HEAD
1b937da docs(todo): close M21-03 at the verified permission gate
1d6572d feat(aigateway): gate retrieval on explicit source permission
$ git diff --stat 3ac738b..1b937da -- apps/dock/src apps/dock/test apps/dock/src/app/sitemap.ts apps/dock/src/ui/components/shell.tsx
(no output)
```

The final gate run quoted in P4–P5 was executed at that point and still passed.

### P7 — The validator parses and lints

```text
$ node --check scripts/check-m25-05-proposal-boundary.mjs
exit=0
$ pnpm exec eslint scripts/check-m25-05-proposal-boundary.mjs
exit=0
```

No third-party dependency was added; both tools are already root dev dependencies. `pnpm verify`, `pnpm typecheck` and application suites were not run: the change is two documentation artifacts plus one standalone read-only script, with no TypeScript, runtime, route or application code change.

---

## 4. Negative evidence — no shipped Cosmos/Time explorer

### N1 — Dock route inventory has no cosmos/time explorer

```text
$ find apps/dock/src/app -name page.tsx | wc -l
20
$ find apps/dock/src/app -type d \( -iname '*cosmos*' -o -iname '*cosmic*' -o -iname '*astronom*' -o -iname '*astro*' -o -iname 'time' -o -iname '*explorer*' -o -iname '*observatory*' \) -print
(no output, exit 0)
```

The 20 pages are the pre-existing routes documented in M19-03 §1.1; `timeline` is the eight-era narrative page, not a sky or time explorer.

### N2 — No cosmos/astronomy vocabulary in Dock

```text
$ git grep -n -i -E "cosmos|cosmic" -- apps/dock
(no output, exit 1)
$ git grep -n -i -E "astronom|ephemeris|celestial|sidereal" -- apps/dock
(no output, exit 1)
```

### N3 — `NAV_LINKS` has no cosmos/time destination (15 entries)

```text
$ grep -n -A 17 "export const NAV_LINKS" apps/dock/src/ui/components/shell.tsx
27:export const NAV_LINKS: readonly NavItem[] = [
28-  { href: '/', label: 'HOME', primary: true },
29-  { href: '/stations', label: 'SIGNALS', primary: true },
30-  { href: '/reader', label: 'READER', primary: true },
31-  { href: '/terms', label: 'TERMS', primary: true },
32-  { href: '/figures', label: 'FIGURES' },
33-  { href: '/constellation', label: 'CONSTELLATION' },
34-  { href: '/research', label: 'RESEARCH', primary: true },
35-  { href: '/prisms', label: 'PRISMS' },
36-  { href: '/timeline', label: 'TIMELINE' },
37-  { href: '/patches', label: 'PATCHES' },
38-  { href: '/denpa', label: 'DENPA' },
39-  { href: '/studio', label: 'STUDIO' },
40-  { href: '/schedule', label: 'ARCHIVE', primary: true },
41-  { href: '/#constellation', label: 'CREW' },
42-  { href: '/#zine-poster', label: 'ABOUT' },
43-] as const
```

### N4 — Sitemap has no cosmos/time route (15 routes, emitted twice for `/id` and `/en`)

```text
$ sed -n '16,32p' apps/dock/src/app/sitemap.ts
export const DOCK_SITEMAP_ROUTES = [
  '',
  '/stations',
  '/schedule',
  '/missions',
  '/reader',
  '/reader/compare',
  '/terms',
  '/figures',
  '/constellation',
  '/research',
  '/prisms',
  '/timeline',
  '/patches',
  '/denpa',
  '/studio',
] as const
```

### N5 — No cosmos metadata or copy

```text
$ git grep -n -i -E "cosmos|cosmic|astronom|ephemeris|celestial|sidereal" -- apps/dock/src/lib apps/dock/src/ui
(no output, exit 1)
```

Dock metadata is the bilingual site catalog (`apps/dock/src/lib/metadata.ts:21-35`), with no cosmos/time entry.

### N6 — No claim-type field exists (M25-02 is open)

```text
$ git grep -n -E "claimType|claim_type|CLAIM_TYPE" -- apps packages docs
(no output, exit 1)
```

The four claim types are therefore a **proposal for M25-02**, not a description of an existing enum.

### N7 — No astronomy data store or world package

```text
$ git grep -n "astronomy_time_records" -- apps packages docs/decisions
docs/decisions/M02-02-domain-assignments.md:29:| **D10** | **World / Science** *(Optional)* | `@moonwitness/world` *(Planned G5)* | `earth_observations`, `astronomy_time_records`, `experiment_runs` | ...
$ ls packages/world
ls: cannot access 'packages/world': No such file or directory
```

`astronomy_time_records` exists only as a planned table name in a decision document. The only sidereal/illumination contract is a dead type with no producer or consumer:

```text
$ git grep -n "MtsTelemetryData" -- apps packages
packages/types/src/sentinel/telemetry.ts:27:export interface MtsTelemetryData {
```

### N8 — No global search entry can return the explorer

```text
$ grep -rn 'role="search"' apps/dock/src
apps/dock/src/app/missions/page.tsx:90:  ... role="search">
apps/dock/src/app/reader/page.tsx:94:  ... role="search">
apps/dock/src/app/terms/page.tsx:141:  ... role="search">
apps/dock/src/app/terms/page.tsx:211:  ... role="search">
```

Search is per-surface and form-based; there is deliberately no global/cross-surface search (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:40`). No index can surface a page that does not exist.

### N9 — No cosmos route directory anywhere in `apps/`

```text
$ find apps -type d \( -iname 'cosmos' -o -iname 'cosmic' -o -iname 'astronomy' -o -iname 'astronomia' -o -iname 'time' -o -iname 'observatory' \) -print
(no output, exit 0)
$ git grep -n -i -E "cosmos|cosmic" -- apps
(no output, exit 1)
```

### N10 — No app-wide claim of a cosmos feature

The only "cosmic" occurrence in the monorepo outside `docs`/`TODO.md` is unrelated prose in a lexicon seed:

```text
$ git grep -n -i -E "cosmos|cosmic" -- ':!docs' ':!TODO.md'
packages/moonql-unilex/src/triangulate.ts:37:        semanticScope: 'Wholeness, safety, divine salutation, submission to cosmic order.',
```

---

## 5. Non-claims

This leaf does **not** claim:

- that a Cosmos/Time explorer is approved, wanted, scheduled, designed to implementation quality, or safe to build;
- that any measurement, observation, ephemeris, almanac fact, observer coordinate, simulation or astronomy record exists;
- that the MTS header clock is astronomy or an ephemeris — it is a mean-synodic display approximation whose own label M25-01 found inaccurate;
- that the four claim types are the final ontology — M25-02 owns that decision and remains open;
- that the validator proves security, privacy, accessibility or the absence of the idea elsewhere;
- that M25-05 is closed. Closure belongs to the integrator and a human reviewer;
- that any application build, typecheck, app test, browser render or deployment passed. None was run.

---

## 6. Limitations

1. **Missing packet.** `docs/tasks/M25/M25-05.md` does not exist; the task scope came from `TODO.md:584`, the M25 milestone file and the M25-01 audit handoff. A reviewer should confirm no packet was intended elsewhere.
2. **Concurrent HEAD movement.** `dev` advanced from `dfc6556` to at least `1b937da` during this work. The pinned baseline remains `dfc6556`; the post-baseline commits include an M31-04 Dock copy/locale change (P6) that shifts the `landing-copy` test body but adds no cosmos/time route, nav or sitemap entry. The M25 TODO rows are unchanged. If a later commit changes Dock routes, nav or sitemap, the gate must be rerun.
3. **Working-tree scan.** The validator reads the current working tree, including a foreign session's WIP. It found no cosmos/astronomy vocabulary in `apps/dock/src`; a future WIP could change that. The gate is intentionally strict about the word "cosmic" and could false-positive on unrelated creative copy.
4. **Heuristic, not proof.** The "no implementation instruction" check is a sentence-level action/target heuristic with a negation allowance. It catches the obvious cases exercised by the self-test; a sufficiently oblique instruction could evade it. Human review remains required.
5. **No visual or runtime evidence.** No browser, screenshot, keyboard walkthrough, screen reader, reduced-motion observation, locale switch, build, typecheck or application test was executed. This is a docs leaf; nothing was shipped to observe.
6. **No external source.** No almanac, ephemeris, standard, licence or astronomy dataset was fetched or validated. All astronomy gaps are recorded as absent/unpinned, not as negative scientific findings.
7. **Scope of absence.** N1–N10 prove absence in this repository's app tree, not that no person has designed such a surface elsewhere.

---

## 7. Rollback and acceptance trace

- **Rollback:** delete `docs/design/M25-05-cosmos-time-explorer-sketch.md`, this audit and `scripts/check-m25-05-proposal-boundary.mjs`. Nothing imports them; no route, schema, runtime, build or TODO status references them.
- **Acceptance `"Not discoverable as shipped feature"`:** supported at baseline by N1–N10 (no route, nav, sitemap, metadata, copy, search or component) and protected going forward by P4–P5 (the gate fails if one appears, and its own fixtures prove the failure paths).
- **Proposal label:** P2 plus the gate's marker requirement.
- **Prerequisite honesty:** P3 shows M25-01 closed and M25-02/M25-04 open; the sketch repeats that P3 is optional and that no implementation is authorised.

**Verdict for the integrator:** the leaf's two acceptance conditions are evidenced — the explorer is sketched *as a proposal* and is *not discoverable as a shipped feature*. M25-05 closure is **not** claimed here; M25-02 and M25-04 remain open prerequisites for any implementation, and M25-06 for any comparative-cosmos content.
