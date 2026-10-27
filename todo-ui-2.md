# MoonWitness XV — todo-ui-2.md
> **UI-II: Code-grounded implementation planning for screens 13–22** · Prepared 2026-10-27 against `dev` at `d54ad43aeff6855c6d2685ab14458f182d7a5a9d`.
> **Scope:** a *supplemental*, dependency-gated microtask/workstream plan; not a second completion ledger. Canonical state remains [TODO.md](TODO.md). The first 12 screens and their local microtasks remain [todo-ui.md](todo-ui.md). Decisions: [BLUEPRINT.md](BLUEPRINT.md), [MASTER_DESIGN.md](MASTER_DESIGN.md), [ADR-0008](docs/decisions/ADR-0008-cockpit-mission-supervisor.md), [ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md).
> **Mandatory preflight:** [UI-II evidence audit](docs/audit/ui2-preflight-2026-10-27.md). Historical baseline commits are *not* automatic proof of current release readiness. No new branches, duplicate route shells, new database owners or fake telemetry.

## Read this first — live facts and non-goals
- The 10 new concept screens **13–22 are produced in the chat handoff but have not been uploaded or adopted into GitHub at this preflight**. No design screenshot or sample data is a production implementation.
- Latest observed full-monorepo CI run on `d54ad43aef` **failed lint (10 errors, 56 warnings)** even though build, dependency audit, secret scan and MoonUI consistency passed. [CI run](https://github.com/bjo163/moonwitnessxv/actions/runs/40430593808). Fix gate **G01** before broad parallel UI implementation.
- [12-screen gallery](docs/design/mockups-xv/README.md) is reference-only under ADR-0009; do not extract raster backgrounds from it. Number **13–22** refers to the next *concept design set*, not a versioned route or shipped app.
- Dock already renders `/stations`, `/denpa`, `/constellation`, `/patches`, `/reader/compare`. Cockpit already renders six tabs, including media/preview/progress; HQ already renders the schema editor and World Monitor.
- SKYLINK M38-11 and ECHOLOG M39-10 **and M39-11** are closed at pinned SHAs (`a53fffe`, `21f3bc7`, `f0cdc3f`); **M38-12/13 and M39-12 are not done**. ECHOLOG already ships a MoonUI operator console (`apps/echolog/client`, closed under M39-11 with keyboard and 1440×1000 screenshot evidence); SKYLINK still has **no** UI — `apps/skylink` contains `src`, `test` and `dist` only, and M38-13 is the task that owns it. Their UI implementation stays in those canonical tasks, not duplicated under UI-II. [Superseding snapshot](docs/audit/ui2-g11-m38-m39-status.md).
- Work on **existing `dev`**. `main` is older and is governed by CI promotion. No force-push, no stale-head updates and no branch proliferation.

## Priority, difficulty, evidence semantics
`P0` security/CI/legal/release blocker; `P1` needed for the approved UI outcome; `P2` optional refinement. `D1` audit/test-only, `D2` isolated component, `D3` bounded few-file implementation, `D4` cross-domain/security or browser behavior. A checkbox here is a **candidate work unit**, not proof; integrator updates [TODO.md](TODO.md) only for canonical Mxx acceptance after exact-SHA tests and reviewer evidence.


## Critical live update — frozen install now fails before lint
**Observed at CI run [#40433978334](https://github.com/bjo163/moonwitnessxv/actions/runs/40433978334)**, following local commits up to `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3`: `pnpm install --frozen-lockfile` fails with `ERR_PNPM_OUTDATED_LOCKFILE` because `package.json` added `@playwright/test@^1.64.1` without updating `pnpm-lock.yaml`.

- [x] **UI2-G00 · P0 · D1/D2 · Tooling/lockfile integrator:** synchronize lockfile with the intentional Playwright dependency using the project's pinned Node 24 and pnpm 10.33.4. Commit only validated manifest/lockfile changes; test `pnpm install --frozen-lockfile` in a clean workspace, then rerun CI. **Do not** use `--no-frozen-lockfile` in CI or temporarily delete the dependency to hide the inconsistency. Also ensure root install/test scripts and Docker contracts remain consistent. **[evidence](docs/audit/ui2-g01-lint-25bd536.md)**
- [x] **UI2-G01 (existing row below):** after G00, revisit the 10 historical lint errors observed on `d54ad43`; rerun exact HEAD because they may have changed. **[evidence](docs/audit/ui2-g01-lint-25bd536.md)**
- [ ] **UI2-G07 (existing row below):** `@playwright/test` in package.json is not itself a working screenshot harness; ensure browser installation, breakpoints, baseline artifacts and CI runner evidence.

**Precedence:** G00 → G01 → G13. No cross-app UI release or merge-to-main before all applicable exact-SHA gates pass. See [audit addendum](docs/audit/ui2-preflight-2026-10-27.md#7-new-commits-discovered-during-publication--latest-ci-preflight-supersession).

## Wave zero — parallel prerequisites (Gxx microtasks)
| State | ID | Priority | Difficulty | Depends | Owner | Allowed initial file scope | Exact deliverable / DoD |
|---|---|---|---|---|---|---|---|
| [x] | **UI2-G01** | P0 | D2 | — | Tooling owner | `eslint config; relevant tsconfig; scripts/git-hooks; tests` | Fix 10 exact-SHA CI lint errors (project-service test membership x5, Node globals x2, git hook rules x3); do not disable lint. **DoD:** pnpm lint passes, exact error ledger resolved. **[evidence](docs/audit/ui2-g01-lint-25bd536.md)** |
| [ ] | **UI2-G02** | P0 | D3 | G01 | Source/rights owner | `apps/dock/src/app/reader/compare/page.tsx; tests; D08 packet` | Verify source rights gate, QS 2:82 edition grants and D08 public denial rules before expanding Reader or HQ publishing. **DoD:** rights-negative tests and rights ledger; M19-19 remains open until true D08 projection. |
| [ ] | **UI2-G03** | P1 | D2 | G01 | Operator security | `apps/cockpit/client/components/CockpitPreviewView.tsx; test/` | Audit local Cockpit iframe URL security/origin policy, shortcuts and kill/free-port confirmations. **DoD:** documented allowlist/user consent; negative URL and destructive-action tests. |
| [ ] | **UI2-G04** | P1 | D2 | G01 | UI integrator | `todo-ui.md; docs/audit/; ADR-0009` | Reconcile UI-F05/F06/F07, F08/F09, F10/F11 predecessor anomalies without rewriting checked history. **DoD:** scoped statuses/evidence; no retroactive completion inferred. |
| [ ] | **UI2-G05** | P1 | D3 | G01 | MoonUI integrator | `packages/moonui/; Dock globals.css; Cockpit layout CSS; HQ globals.css` | Establish per-app shell and token/no-clipping contract for Dock, Cockpit, HQ; allow distinct UX by role. **DoD:** ui:check zero; source of truth documented; no second nav. **Dock lane done** — [shell contract + measured no-clipping evidence](docs/audit/ui2-g05-shell-contract-47b89f4.md); Cockpit and HQ layout CSS have no contract yet, so the row stays open. |
| [ ] | **UI2-G06** | P1 | D2 | G05 | Dock/UI owner | `apps/dock/src/ui/components/states.tsx; route-specific files` | Make existing loading/empty/error/ready states consistent per route; prefer Dock PanelState and MoonUI feedback. **DoD:** negative state tests; truthful status labels. |
| [ ] | **UI2-G07** | P1 | D2 | G05 | QA owner | `QA scripts/fixtures (new, approval gated)` | Agree screenshot/DOM-geometry harness; do not claim pixel tests that cannot run in runner. **DoD:** 390/768/1440/1920 × id/en + reduced motion artifacts; host-proven runner. |
| [ ] | **UI2-G08** | P1 | D2 | G05 | Asset/design owner | `docs/design/ (docs-only)` | Plan and review batch-2 reference rights/hashes and naming for images 13–22; do not add screenshots to production assets. **DoD:** asset-origin ledger; only licensed original vector/CSS enters apps. |
| [ ] | **UI2-G09** | P1 | D3 | G01,G05 | HQ owner | `apps/headquarters/src/ui/widgets/RecordForm.tsx; fields/widgets.tsx` | Define HQ schema-driven form components and a11y/role tests separately from publishing approval state machine. **DoD:** existing CRUD preserved; security and id/en coverage. |
| [ ] | **UI2-G10** | P1 | D3 | G01,G05 | i18n owner | `apps/dock/src/lib; reader/terms/Denpa pages` | Audit Dock locale vs source lang/dir boundaries and catalog coverage outside homepage. **DoD:** id/en per UI, source script retains its own dir; missing-key tests. **[audit + parity tests](docs/audit/ui2-g10-locale-boundary-47b89f4.md)** — catalogue side closed (14 tests, 14 existing keys wired); source `lang`/`dir` for Denpa and the reader translation stays blocked on two hub projections, and G05 is still open, so the row stays open. |
| [x] | **UI2-G11** | P1 | D2 | G01 | Backend liaison | `docs/audit/ (superseding note only)` | Update superseding M38/M39 status snapshot; do not describe current APIs as mere skeletons. **DoD:** M38-11/M39-10 present; M38-12/13 and M39-11/12 open. **[evidence](docs/audit/ui2-g11-m38-m39-status.md)** — closed on the gate's actual wording; the DoD's own status list is superseded by M39-11 closing at `f0cdc3f`. |
| [ ] | **UI2-G12** | P1 | D3 | G01 | QA owner | `app tests + test harness` | Add viewport overflow, focus, keyboard, errors, offline and fixture-state E2E to QA matrix. **DoD:** positive and negative evidence pinned to SHA. |
| [ ] | **UI2-G13** | P0 | D3 | G01,G12 | CI integrator | `CI evidence log; no bypass` | Re-run full pnpm verify + workflow exact SHA; inspect tests/codegen/web build beyond lint. **DoD:** green exact-SHA CI before promoting main; otherwise flag BLOCKED. |
| [ ] | **UI2-G14** | P1 | D2 | G08,G12 | Design owner | `UI-II review ledger` | Review all ten mockups for nonexisting features; mark verified, candidate or rejected per page. **DoD:** No mockup becomes API/schema claim; link code route + ADR + status. |
| [ ] | **UI2-G15** | P0 | D3 | G02,G13 | Release owner | `M27-08 manifest only when eligible` | Prepare strict preview/release exclusions (no raw Research, unlicensed art, fake telemetry). **DoD:** No launch claim; M19-19/D08 release gate respected. |

**Gate policy:** G01 may run parallel with **read-only** G02/G03/G04/G08/G11 inventories. Implementation touching shared configs/layout/copy after G01 requires a completed handoff/lease. G13 (green verification) is a mandatory pre-release gate, not a promise all app ideas can ship.

## Real screens 13–22 — five microtasks each
Every screen row below denotes one **existing screen**, not a new application. Owner must map mockup → exact route and source data → state machine → accessible interaction → positive/negative test. Each screen's files are **starting scope**, not permission to edit a neighboring owner's paths.

### UI-II 13 — Dock · Signal Catalog + Station Detail
**Status:** NOT STARTED in UI-II · **Parent:** M19 / M22 · **Owner:** `apps/dock` · **Depends:** UI2-G05 · **Code scope:** `src/app/stations/page.tsx; src/app/stations/[id]/page.tsx; src/ui/client/Player.tsx`.
- [ ] **UI2-P13a** · P0 · D1: Record current station query/filter/pagination, stream rights and player behavior; reject any sample station not in repository.
- [ ] **UI2-P13b** · P1 · D2: Refine filter form, genre/country facets and loading/empty/error/denied behavior without invented station counts.
- [ ] **UI2-P13c** · P1 · D3: Detail page: preserve country, language, schedule, real status, metadata and player transport; never imply auto-play.
- [ ] **UI2-P13d** · P1 · D3: Unify per-station mobile layout and source/logo accessibility; RTL labels and long titles wrap.
- [ ] **UI2-P13e** · P1 · D3: Exercise real stream URL error/offline/unknown station, stale metadata and blocked autoplay; attach 390/768/1440/1920 evidence.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 14 — Dock · DENPA Transceiver
**Status:** NOT STARTED in UI-II · **Parent:** M22-03 / M19 · **Owner:** `apps/dock` · **Depends:** UI2-G05 · **Code scope:** `src/app/denpa/page.tsx; src/ui/client/DenpaTransceiver.tsx; src/app/api/denpa/transmit/route.ts`.
- [ ] **UI2-P14a** · P0 · D1: Pin current form/route: content, pseudonym, target station, transmission list; document permission/rate-limit contract.
- [ ] **UI2-P14b** · P1 · D2: Separate compose/transmit from inbound feed with explicit offline/rejected/sent/unknown UI text grounded in server state.
- [ ] **UI2-P14c** · P1 · D3: Apply character count, validation and accessible error/help; preserve privacy and do not print cleartext telemetry claims as fact.
- [ ] **UI2-P14d** · P1 · D3: Verify keyboard-only transmit, no duplicate submissions, appropriate errors, and no fake live count.
- [ ] **UI2-P14e** · P1 · D3: Run denied/rate-limit/empty feed/server down tests plus responsive screenshot/geometry checks.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 15 — Dock · Constellation + typed relation
**Status:** NOT STARTED in UI-II · **Parent:** M10 / M12 / M19 · **Owner:** `apps/dock` · **Depends:** UI2-G05 · **Code scope:** `src/app/constellation/page.tsx; src/ui/components/constellation.tsx; src/app/constellation/relations/[relationCode]/page.tsx`.
- [ ] **UI2-P15a** · P0 · D1: Inventory graph projection: nodes, typed edges, aliases, identity decisions, conflicts and provenance.
- [ ] **UI2-P15b** · P1 · D2: Implement a selected-node inspector without changing read-only status or asserting candidate=verified.
- [ ] **UI2-P15c** · P1 · D3: Preserve keyboard list alternative; focus return, scroll containment and long names across mobile.
- [ ] **UI2-P15d** · P1 · D3: Expose evidence/sense/perspective and reviewer decision state in words; no implicit merge actions.
- [ ] **UI2-P15e** · P1 · D3: Test orphan/unknown relation, candidate conflict, empty projection, keyboard and source/citation links.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 16 — Dock · World Patches Explorer
**Status:** NOT STARTED in UI-II · **Parent:** M23 / M19 · **Owner:** `apps/dock` · **Depends:** UI2-G05 · **Code scope:** `src/app/patches/page.tsx; src/ui/client/PatchesExplorer.tsx`.
- [ ] **UI2-P16a** · P0 · D1: Inventory 33 canonical slot records/categories and disputed dual-title identity; pin source owner.
- [ ] **UI2-P16b** · P1 · D2: Keep category chips, text filter and expandable patch context; avoid a fabricated interactive world map.
- [ ] **UI2-P16c** · P1 · D3: Preserve DISPUTED/CONFLICT status and source note instead of normalizing away differences.
- [ ] **UI2-P16d** · P1 · D3: Add stable anchors, filters that are keyboard usable and mobile stacked content.
- [ ] **UI2-P16e** · P1 · D3: Test filtered/unknown patch, dispute, zero results, long text and focus movement.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 17 — Dock · Comparative 1·6·3 Reader
**Status:** P17a DONE, P17b–P17e **BLOCKED on rights/data owners, not on UI effort** · **Parent:** M08 / M19-19 / M19-31 · **Owner:** `apps/dock` · **Depends:** UI2-G02,UI2-G05 · **Code scope:** `src/app/reader/compare/page.tsx; src/ui/components/reader.tsx; src/ui/client/CitationCopy.tsx`.
- [x] **UI2-P17a** · P0 · D1: Audit all six edition identities, licence assertions and citations for QS 2:82; do not assume rights-cleared literals are proof. **[audit](docs/audit/ui2-p17a-comparative-editions-948db67.md)** — at `948db67`: the six identities were one literal array deleted at `724fb15` and **five of six exist nowhere in the repo**; QS 2:82 has exactly 1 edition + 1 passage + 1 `id` translation (`moonql-corpus/src/index.ts:206-216`, `:241-252`, `:277-292`); the pinned `provenanceSha` is not the SHA-256 of the stored text under any encoding, the cited archive.org origin returns **404**, and `corpus_translations.rightsStatus` **defaults to cleared** (`:267`), so a new row is published without a reviewer decision. Also reported: M07-04 cites a non-existent `apps/radio` test path.
- [ ] **UI2-P17b** · P1 · D2: Implement legible six-edition comparison that never auto-translates source text and preserves edition metadata. **BLOCKED** — six panes would be invented content; M06-06 forbids `RIGHTS_UNKNOWN`/ungranted text on public endpoints and no D08 comparative projection exists (UI2-G02 is itself NO–BLOCKED). Honest achievable scope after the owners fix the grant evidence is a **two-layer** (cleared Arabic edition + cleared `id` translation) view from `/corpus/reader`, plus an explicit "no edition grant recorded" panel for the five identifiers.
- [ ] **UI2-P17c** · P1 · D3: Keep three analytical dimensions visibly interpretive, separate from primary quotations.
- [ ] **UI2-P17d** · P1 · D3: Test Arabic RTL, Greek/Hebrew examples if present, diacritics, id/en copy and bidirectional citation.
- [ ] **UI2-P17e** · P1 · D3: Negative rights denied/missing citation/metadata-only tests and screenshot/geometry matrix before public release.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 18 — Cockpit · Media Rack + IPTV + Analog Tuner
**Status:** NOT STARTED in UI-II · **Parent:** ADR-0008 / M19-30 · **Owner:** `apps/cockpit` · **Depends:** UI2-G05 · **Code scope:** `client/components/CockpitMediaView.tsx; CockpitTunerSection.tsx; client/hooks/*`.
- [ ] **UI2-P18a** · P0 · D1: Map BGM/radio/IPTV channel types and HLS/picture-in-picture lifecycle, no channel provider claims beyond code.
- [ ] **UI2-P18b** · P1 · D2: Design primary visualizer/player with playlist and optional analog tuner; show tuner frequencies as illustrative pseudo-frequency.
- [ ] **UI2-P18c** · P1 · D3: Preserve Space/M/[ ]/P transport shortcuts and top-bar mini rack, device mute/volume and active channel consistency.
- [ ] **UI2-P18d** · P1 · D3: Media errors, unsupported HLS, unavailable playback, autoplay rejection and stopped service states use honest labels.
- [ ] **UI2-P18e** · P1 · D3: Test audio/video resource teardown, channel change, keyboard, small viewport and reduced motion.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 19 — Cockpit · In-App Web Preview
**Status:** NOT STARTED in UI-II · **Parent:** ADR-0008 / M19-30 · **Owner:** `apps/cockpit` · **Depends:** UI2-G03,UI2-G05 · **Code scope:** `client/components/CockpitPreviewView.tsx; client/App.tsx integration-owner only`.
- [ ] **UI2-P19a** · P0 · D1: Inventory existing URL bar, Go/Reload, local shortcut endpoints and iframe behavior.
- [ ] **UI2-P19b** · P1 · D2: Define allowlist/user-initiated arbitrary URL policy and iframe error/blocked-origin/failure semantics; no silent fetch.
- [ ] **UI2-P19c** · P1 · D3: Keep browser-like split preview primary; do not duplicate the Dock public navigation inside iframe wrapper.
- [ ] **UI2-P19d** · P1 · D3: Add clear source/port context, frame title, keyboard open/refresh/external-window safety.
- [ ] **UI2-P19e** · P1 · D3: Test denied/disallowed URL, offline port, CSP/embed failure and viewport geometry.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 20 — Cockpit · Mission Progress + TODO register
**Status:** NOT STARTED in UI-II · **Parent:** ADR-0008 / M19-30 · **Owner:** `apps/cockpit` · **Depends:** UI2-G03,UI2-G05 · **Code scope:** `client/components/CockpitProgressView.tsx; client/hooks/useTodoProgress.ts; src/progressTracker.ts read-only contract`.
- [ ] **UI2-P20a** · P0 · D1: Trace read-only TODO.md parser and provenance of tasks, priority/groups/history and SSE delivery.
- [ ] **UI2-P20b** · P1 · D2: Keep actual source status with row filters, recent flips, reconnect vs poll status; no synthetic percentage.
- [ ] **UI2-P20c** · P1 · D3: Ensure long task titles, unknown groups, task count discrepancies and no data/error are understandable.
- [ ] **UI2-P20d** · P1 · D3: Preserve absolute flip counter, per-session re-sync and a single EventSource; no TODO modification from the UI.
- [ ] **UI2-P20e** · P1 · D3: Test reconnect/recovery, stale feed, zero tasks, mixed locale labels and keyboard navigation.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 21 — Headquarters · Schema-driven Record Editor
**Status:** NOT STARTED in UI-II · **Parent:** M19-21..24 / M20 · **Owner:** `apps/headquarters` · **Depends:** UI2-G02,UI2-G05 · **Code scope:** `src/app/(admin)/models/[model]/[id]/page.tsx; src/ui/widgets/RecordForm.tsx; src/ui/fields/widgets.tsx`.
- [ ] **UI2-P21a** · P0 · D1: Inventory existing _schema metadata, dynamic fields, validation and server-side role checks; never hardcode one model.
- [ ] **UI2-P21b** · P1 · D2: Design form/detail split with actual field types, dirty/save/validation states and raw payload behind explicit disclosure.
- [ ] **UI2-P21c** · P1 · D3: Maintain create/edit/delete permissions in server actions and confirmation for destructive mutations.
- [ ] **UI2-P21d** · P1 · D3: Implement id/en label/errors after accepted HQ catalog and session boundary; do not expose tokens or credentials.
- [ ] **UI2-P21e** · P1 · D3: Test invalid model/field/record, expired session, unauthorized write, long data and responsive form.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

### UI-II 22 — Headquarters · World Monitor + Sentinel Triage
**Status:** NOT STARTED in UI-II · **Parent:** M24 / M19-21..24 · **Owner:** `apps/headquarters` · **Depends:** UI2-G02,UI2-G05 · **Code scope:** `src/app/(admin)/world-monitor/page.tsx; src/ui/client/ThreatRadarMap.tsx; src/data/queries/monitor.ts`.
- [ ] **UI2-P22a** · P0 · D1: Inventory real radar→source→signal 3-tier filters plus driver/task queue; preserve source timestamps.
- [ ] **UI2-P22b** · P1 · D2: Make hierarchy clear: radar selection narrows sources, source narrows signals and task queue remains distinct.
- [ ] **UI2-P22c** · P1 · D3: Add freshness/unverified/unknown/collector failure language; no fabricated global map or real-time claims.
- [ ] **UI2-P22d** · P1 · D3: Preserve selection query parameters, focus, filter clear, and deny access outside HQ role.
- [ ] **UI2-P22e** · P1 · D3: Test zero radars, missing driver, stale source, bad query, role denial and responsive navigation.
**Exit gate:** existing route genuinely usable; id/en where appropriate; no invented service/data counts; actual permission/rights behavior; keyboard/reduced motion; 390/768/1440/1920 geometry + screenshots when runner approved; focused tests, result SHA, rollback. Closing a UI2-P task does **not** close its Mxx parent.

## Explicit non-duplicated follow-through for SKYLINK and ECHOLOG
- **SKYLINK M38-12 → M38-13 → M38-14:** integrate ARSY client under `SKYLINK_ENABLED` with flag-off nonregression, then build *authorized* MoonUI three-pane channel/conversation/message inbox, pairing and delivery history, and finally test inbound/outbound/WS end-to-end. Backend M38-11 is already checked; do not reimplement it. UI-II only tracks dependency/readiness.
- **ECHOLOG M39-11 → M39-12:** bounded object list + detail including digest, MIME, size, uploader, retention/legal hold and scan state, signed short-lived download grant (≤5m) and explicit 409 denial. Not a gallery and not a duplicate S3 backend. No UI claim until actual app and tests exist.
- **Neither backend is a dependency** of existing Dock 13–17, Cockpit 18–20, or HQ 21–22 unless a concrete data interface proves otherwise. Do not serialize independent work behind optional messaging/storage UI.

## Parallel work allocation — exclusive file leases
| Lane | Safe parallel assignment | Exclusive write boundaries | Shared dependency / review rule |
|---|---|---|---|
| A — CI/security | G01, G02 review, G03 preview audit | ESLint config, test tsconfigs, Git-hook scripts | G01 first; zero blanket disables; no concurrent CI file owner |
| B — Dock Public | P13/P14 after shared shell; P15/P16/P17 in distinct files | `apps/dock/src/app/globals.css`, Dock locale catalogs and shell owned by **one Dock integrator** | data/rights owner signs P17 and public withheld states |
| C — Cockpit | P18 Media, P19 Preview, P20 Progress each isolated components | `apps/cockpit/client/App.tsx`, TopBar, `cockpit-layout.css` owned by **one Cockpit integrator** | preview-origin security review before new URL behavior; log/port/tuner semantics unchanged |
| D — Headquarters | P21 schema editor, P22 World Monitor | HQ layout, auth session, `src/app/globals.css`, shared field registry assigned to **one HQ integrator** | never bypass session or change schema owner |
| E — Shared MoonUI/i18n | G05/G06/G10 | `packages/moonui/**`, shared tokens, cross-app catalogs only the **design-system integrator** | no same-file edits by B/C/D during lease |
| F — QA/design | G07/G08/G12/G14 | harness + evidence docs, no production files | findings submitted as patch proposals to app owner |
| G — Integrator/release | G04/G11/G13/G15 and canonical TODO review | `TODO.md`, `todo-ui.md`, `todo-ui-2.md`, ADRs, root package/lockfile, release docs | one integration/push owner, no force operations |

**Lock protocol:** 1) fetch latest `dev` HEAD; 2) claim one leaf + file lease in handoff notes; 3) work only leased files, ideally ≤3 primary files; 4) run focused positive+negative tests; 5) submit commit/diff and exact SHA; 6) integrator sequentially validates and updates `dev`; 7) release lease; 8) next eligible leaf. Independent *read-only* audits can be parallelized immediately; colliding writes cannot. If code changed meanwhile, re-fetch and reconcile, never clobber an unseen commit.

## UI acceptance matrix
| Gate | Required | Proof that counts |
|---|---|---|
| U2-Q01 | Repo baseline/head | exact SHA and `git diff --check`; no stale branch |
| U2-Q02 | CI | `pnpm verify` success at exact SHA and GitHub Actions run success; green `pnpm ui:check` alone insufficient |
| U2-Q03 | Component consistency | `pnpm --filter @moonwitness/moonui test`, `pnpm ui:check`, no arbitrary hex or duplicate shell |
| U2-Q04 | App regression | Dock tests/typecheck/build; Cockpit tests/build; HQ session/locale plus build |
| U2-Q05 | Keyboard & reduced motion | tab order, focus outline/return, Escape, screen-reader labels and high contrast; no autostart sound |
| U2-Q06 | RTL + source | original text direction per edition, diacritics and copy citation; UI id/en independent |
| U2-Q07 | Data integrity | stale/empty/error/denied/unknown states; no invented `LIVE`, metrics, credits or rights-cleared label |
| U2-Q08 | Permission / legal | wrong-role and no-rights negative cases; preview origin guard; original art/asset ledger |
| U2-Q09 | Visual fidelity | screenshot + geometry at 390/768/1440/1920 across id/en, both online/offline where applicable; missing runner marked **BLOCKED** |
| U2-Q10 | No duplicate implementation | route/sidebar/shell/renderer/DB owner inventory and diff review |
| U2-Q11 | Backend isolation | Cockpit/Dock UI changes do not change SKYLINK/ECHOLOG/ARSY data contracts without approved contract handoff |
| U2-Q12 | Release decision | `main` promotion only after verified CI and canonical gates; no auto-close from mockup |

## Suggested ready-to-execute packets
1. **Now:** UI2-G01 (CI lint errors), with independent read-only G02/G03/G08/G11. Keep application writes isolated until contracts settled. G08 is *not* independent of G05 — the intake plan it produces is evidence, but the gate closes only after the token/no-clipping contract lands.
2. **After gate:** G05/G07/G10 and P13a/P14a/P15a/P16a/P17a, P18a/P19a/P20a, P21a/P22a in parallel read-only, each app owner controlling shared files.
3. **Implementation:** Dock P13/P14, graph+patch P15/P16, rights-gated Reader P17; Cockpit P18 and P20; HQ P21. P19 requires security policy signoff; P22 requires freshness model/no fictional map.
4. **Integration:** file ownership reconciled → focused tests → UI2-G12/G13 → screenshots → canonical review. If full CI remains red, do not claim release.

### Packet 1 outcome at `49ec20e`

| Gate | Closed? | Blocking evidence |
| --- | --- | --- |
| UI2-G02 | **NO — BLOCKED** | [rights-gate audit](docs/audit/ui2-g02-rights-gate-49ec20e.md). The `/reader/compare` `RIGHTS_CLEARED` hardcoding is refuted at HEAD (the page now renders only the localized D08 withholding alert; the literals were removed in `724fb15`), and `/corpus/reader` is a sound single text exit. But D08 has no implementation at all, its denial test is `test.skip`, and "six editions cleared" for QS 2:82 has no data owner — one cleared edition and one cleared translation. M19-19 therefore stays open, and the gate's own DoD says so. The audit also confirms a live licensed-text leak through `/orm/research/case` and `/trace` while those endpoints self-report `rawTextExposed: false`. |
| UI2-G03 | **NO** | [preview-security audit](docs/audit/ui2-g03-cockpit-preview-49ec20e.md). Neither DoD clause holds: one never-validated free-text URL reaches five navigation sinks (four imperative `.src`, `window.open` without `noopener`, a declarative `src`) with no scheme/host/port check and no `sandbox`/`referrerPolicy`; there are zero negative URL or confirmation tests. `freePortsDesc` promises "ports 3000-3004" while `scripts/free-ports.mjs` sweeps the whole `PORTED` registry, the Cockpit's own 3004 included. |
| UI2-G08 | **NO — dependency open** | [asset-origin audit](docs/audit/ui2-g08-asset-origin-49ec20e.md). Batch 2 (images 13–22) does not exist yet; all 24 gallery assets carry UNKNOWN rights under ADR-0009 §1; no mockup raster enters a served directory. But `node scripts/check-ui-assets.mjs` reports 32 production violations (30 `RIGHTS_UNKNOWN` served assets, 4 byte-identical duplicates) and that script has no alias, hook or CI lane, so "only licensed original vector/CSS enters apps" is unenforced. G05 stays open; the clipping counter-evidence this audit quoted is **superseded** — defect A was recorded against the stale `d54ad43` harness baseline and `2d223fc` already fixed it, as re-measured in the G05 evidence below. |

### Packet 2 outcome at `47b89f4`

| Gate | Closed? | Evidence |
| --- | --- | --- |
| UI2-G05 | **NO — Dock lane only** | [shell contract](docs/audit/ui2-g05-shell-contract-47b89f4.md). The no-clipping rule is established, measured and pinned for the Dock: 30 runs (en+id, 1024–1920) with 0 clipped header focusables, the widest focusable element ending at 1004@1041 / 1138@1200 / 1378@1440 / 1858@1920, and reverting the wrapping re-clips exactly 8 elements at 1440 — the numbers in defect A were a stale `d54ad43` reading, already fixed by `2d223fc`. One breakpoint now has one owner: the duplicated inline `<style>`/`!important` shell switch was removed and `globals.css` owns it, pinned by `apps/dock/test/header-shell-no-clip-contract.test.mjs` (10 tests). **The gate is not closed:** its scope names Cockpit and HQ layout CSS too, and neither has a shell/token contract; `ui:check` 132/0 and "no second nav" hold for the Dock alone. |
| UI2-G10 | **NO — two hub contracts missing** | [locale boundary](docs/audit/ui2-g10-locale-boundary-47b89f4.md). Catalogue parity and the "no raw `/id`/`/en` href" rule are pinned by `apps/dock/test/locale-boundary-coverage.test.mjs` (14 tests); 14 already-existing label keys were wired into the Reader form, reader source identity and term list/detail. Source-language attribution is genuinely blocked, not guessed: `GAP-DENPA-UNATTRIBUTED` (the Denpa projection carries no language or direction field) and `GAP-READER-TRANSLATION-DIR` (only one hardcoded `=== 'ar'` site). Both need a hub projection change, so no detector was invented in the Dock. Residual wholesale English (20 dead catalogue keys, several `<dt>` labels) is reported per scope, not mass-translated. |
| UI2-G11 | yes | [superseding snapshot](docs/audit/ui2-g11-m38-m39-status.md) |

## Definition of Done for UI-II
Not “all ten screenshots look similar.” Rather: each scoped, permitted existing screen improves real user tasks while respecting truth, source identity, rights, auth, keyboard/mobile, id/en and the distinct Dock/Cockpit/HQ roles, with evidence pinned to a specific SHA. A plan commit only establishes documentation and cannot itself mark any leaf complete.
