# MoonWitness XV — todo-ui.md
> **UI realization playbook · 27 October 2026 · scope: 12 visual references · target branch: `dev`.**
> **IMPORTANT:** This document is a **micro-execution checklist**, *not* a second canonical task/status register. [TODO.md](TODO.md) owns milestone completion and checked status; [MASTER_DESIGN.md](MASTER_DESIGN.md) owns visual/behavior semantics; [BLUEPRINT.md](BLUEPRINT.md) owns domain boundaries. Tick these `UI-*` steps only as local implementation notes; close linked `Mxx-yy` in canonical TODO **only after exact-SHA evidence**.
> All 12 screens are conceptual UI references. A screenshot never proves that its feature, API, data, integration, deployment, or user permission exists.
>
> **Execution waves (docs-first, revised 2026-10-27).** Normative layer first: [ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md) · [MASTER_DESIGN dock semantics](MASTER_DESIGN.md) · [Component Bible §Dock Space Entry](docs/design/COMPONENTS.md) · [App surfaces](docs/design/APPS.md) · [mockup implementation status](docs/design/mockups-xv/README.md) · packets [M19-02](docs/tasks/M19/M19-02.md), [M19-03](docs/tasks/M19/M19-03.md), [M19-04](docs/tasks/M19/M19-04.md) · [blockers register](docs/audit/ui-blocked-screens-8737fe4.md). Wave order: **D** docs/ADR → **1** shared primitives → **2** screen 01 → **3** screen 05 → **4** screen 06 → **5** evidence. A leaf is ticked only in the wave that produced its test and geometry evidence.

## 0. Source of truth and branch contract
- **Repo:** `bjo163/moonwitnessxv`; work on **existing `dev` only**; no feature branch and no new Hub, database, ORM or second renderer.
- **Evidence anchor at this planning pass:** `dev` HEAD `13b8503a370ba4ea69e22b1e4f7f10111a89ed69` (must be rechecked before implementation).
- **Canonical reference images:** [SVG design gallery](docs/design/mockups-xv/README.md). Full-size PNG/HTML preview bundle from design handoff is **not silently treated as licensed production media**; original photo/character/art rights need explicit review before Git import.
- **Reality:** existing Dock/HQ/Cockpit and certified `@moonwitness/moonui` are implementation sources. LIGHTHOUSE is reuse-of-Dock proposal; Harbor/SHADOW/MoonLab/WORKS are proposals; SKYLINK service scaffolding exists but does not equal a shipped messaging UI. ECHOLOG is a separate utility contract and not one of these 12 visual examples.
- **Visual tokens:** `--ink #07060b`, `--surface #13101d`, `--surface2 #1b172a` (actual CSS variable `--surface-2`), `--fg #f7f4ec`, `--accent #ffd400`, `--pink #ff007a`, `--cyan #00d4ff`, `--ok #00e676`, `--moon #9d4edd`; prefer `packages/moonui/moon.css` variable names and `tokens.ts`, never paste new raw hex into app CSS.
- **Behavior:** forms, labels, errors, focus, tabs, dialogs, id/en, source RTL and reduced motion must comply with [Component Bible](docs/design/COMPONENTS.md).

## 1. What should happen first?
1. **Do not rewrite the app.** Freeze the chosen 12 reference layouts and audit real routes/ownership.
2. **Ship one truthful, bilingual public home** in existing Dock (M19, M31), not 12 fake live UIs at once.
3. Reuse the certified MoonUI primitives and semantic tokens; implement shell and page templates, then make Reader and Source search actually navigable.
4. Prioritize accurate source rights (M19-19) and role boundaries; staging screens may show sample data only when labelled **DEMO**.
5. Implement Story/Poster/Research as authorized workspaces in the existing HQ first; split into SHADOW/MoonLab/Harbor/WORKS only after their accepted milestone/ADR decisions.
6. Finish responsive/accessibility, positive and negative tests, screenshot baselines, Docker/release approval before calling anything production-ready.

## 2. Shared microtasks (execution sequence)
| Done | ID | Priority | Difficulty | Dependency | Exact deliverable / acceptance |
|---|---|---|---|---|---|
| [x] | UI-F01 | P0 | D1 | — | Audit current dev HEAD, inventory Dock/HQ/Cockpit/MoonUI/routes; archive SHA and code evidence. **[evidence](docs/audit/ui-baseline-8737fe4.md#1-inventory-ui-f01)** |
| [x] | UI-F02 | P0 | D2 | UI-F01 | Map each mockup panel to one actual code owner and one canonical Mxx task; proposed ≠ shipped. **[map](docs/audit/ui-baseline-8737fe4.md#2-reference--owner--reality-map-ui-f02)** |
| [x] | UI-F03 | P0 | D2 | UI-F01 | Inspect rights, licences, consent and origin of PNG screenshots, textured images and fonts before import. **[ledger](docs/audit/ui-baseline-8737fe4.md#3-rights--licence-review-of-the-reference-assets-ui-f03)** |
| [x] | UI-F04 | P0 | D1 | UI-F02 | Identify existing MoonUI primitives (Card, Panel, Nav, Tabs, DataTable, Tooltip, Modal, Skeleton). **[inventory](docs/audit/ui-baseline-8737fe4.md#4-moonui-primitive-inventory-ui-f04)** |
| [ ] | UI-F05 | P1 | D2 | UI-F04 | Translate mockup hierarchy to responsive shell; reuse existing Dock public shell and HQ private shell. |
| [x] | UI-F06 | P1 | D2 | UI-F05 | Establish typography scale for display, titles, body, captions and monospaced status. **[evidence](docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained)** |
| [x] | UI-F07 | P1 | D2 | UI-F05 | Define responsive 360/390/768/1024/1440/1920 width behavior and avoid horizontal page overflow. **[geometry](docs/audit/ui-screens-evidence-38560d3.md#geometry-live-app-on-3001-en-and-id)** |
| [ ] | UI-F08 | P1 | D2 | UI-F04 | Build/verify one common Crown/Logo/DistressedBorder pattern using semantic tokens and original SVG. |
| [x] | UI-F09 | P1 | D2 | UI-F08 | Implement reusable NavActive, AppTile, ProgressPanel, StatusLine and ContentCard where missing. **[evidence](docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained)** |
| [ ] | UI-F10 | P1 | D2 | UI-F09 | Add consistent 4-state data model: loading / empty / error / ready for every data-backed panel. |
| [x] | UI-F11 | P0 | D2 | UI-F10 | Add explicit DEMO/PLACEHOLDER/PLANNED labels; never use fake live counters or false delivery stats. **[evidence](docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained)** |
| [ ] | UI-F12 | P1 | D3 | UI-F05 | Ensure bilingual id/en UI keys and locale-preserving links; keep source-language direction independent. |
| [ ] | UI-F13 | P0 | D2 | UI-F05 | Define server-side auth/role checks for HQ/private routes; preserve BFF/httpOnly and D00 rules. |
| [ ] | UI-F14 | P1 | D3 | UI-F08 | Create icon vector pipeline: title/ARIA, no external scripts, license and content hash. |
| [ ] | UI-F15 | P1 | D3 | UI-F11 | Protect provenance, cited passage, editions, rights and review labels in every public view. |
| [ ] | UI-F16 | P1 | D2 | UI-F09 | Implement mobile drawer with Escape/focus restoration and route-active navigation. |
| [ ] | UI-F17 | P1 | D2 | UI-F09 | Keep forms Field labels/error/help/focus; tabs roving arrow/Home/End; confirmation dialogs guarded. |
| [ ] | UI-F18 | P1 | D3 | UI-F10 | Build visual test harness with screenshots at agreed breakpoints, id/en, reduced-motion. |
| [ ] | UI-F19 | P0 | D3 | UI-F12,UI-F18 | Run ui:check, lint, relevant test/typecheck/build; record exact command, output and SHA. |
| [ ] | UI-F20 | P0 | D4 | UI-F13,UI-F15,UI-F19 | Audit public negative authorization/rights tests and approved release/no-go with rollback. |

## 3. Twelve screens — leaf microtasks

**Definition of Done per screen:** functional route in its approved existing app, correct data boundary, no deceptive mock telemetry, id/en labels, keyboard navigation, 360–1920 responsive snapshots, negative permissions/rights where relevant, focused tests and exact SHA. A checked visual reference task **does not** complete its parent `Mxx` milestone.

**Blocked screens (no fake surfaces).** Per [ADR-0009](docs/decisions/ADR-0009-public-ui-reference-adoption.md) §2.5, these screens stay `[ ]` until their owner decision exists; the unblock action per screen is recorded in the [blockers register](docs/audit/ui-blocked-screens-8737fe4.md).

| Screen | Owner blocking it | Unblock action |
|---|---|---|
| UI-P02 Project Universe | M17 | route + data-owner decision |
| UI-P03 Story Forge | M33 | SHADOW scope acceptance |
| UI-P04 Poster Lab | M18/M33 | export approval + asset consent |
| UI-P07 MoonLab | M34 | private case workspace scope |
| UI-P08 World Monitor | M24 | freshness/uncertainty model |
| UI-P09 Publishing Hub | M18/M20 | publishing state machine |
| UI-P10 Harbor Commons | M32/M37 | ADR authorizing the app |
| UI-P11 WORKS Economy | M35/M37 | ADR + D15/D16 review |
| UI-P12 SKYLINK Messaging | M38 | M38 code phase + UI authorization |

Executable this cycle: **UI-P01**, **UI-P05**, **UI-P06**.

### UI-P01 — DOCK & LIGHTHOUSE (P0)
Reference: [`01_dock_lighthouse.svg`](docs/design/mockups-xv/01_dock_lighthouse.svg) · Canonical task owner: **M19-09..19 / M31** · Code owner: `apps/dock` · route: `/id, /en`.

- [ ] **UI-P01a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [x] **UI-P01b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims). **[evidence](docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained)**
- [x] **UI-P01c · D3:** Public source-first hero with bilingual /id /en and unambiguous REAL vs PLANNED.
- [x] **UI-P01d · D3:** Card links to Reader, Stories and RADIO without broken routes.
- [x] **UI-P01e · D3:** Hub-offline honest fallback, metadata, keyboard and responsive smoke.
- [ ] **UI-P01f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P02 — PROJECT UNIVERSE (P1)
Reference: [`02_project_universe.svg`](docs/design/mockups-xv/02_project_universe.svg) · Canonical task owner: **M17 / M19** · Code owner: `Dock projection + HQ editor` · route: `/projects (proposed)`.

- [ ] **UI-P02a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P02b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P02c · D3:** List only approved public projects and label original fiction.
- [ ] **UI-P02d · D3:** Filters, search, empty/no-rights states and image alt.
- [ ] **UI-P02e · D3:** Card → stable canon IDs and user-safe detail route.
- [ ] **UI-P02f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P03 — STORY FORGE (P1)
Reference: [`03_story_forge.svg`](docs/design/mockups-xv/03_story_forge.svg) · Canonical task owner: **M17 / M33** · Code owner: `HQ initially; separate SHADOW only if approved` · route: `private draft route TBD`.

- [ ] **UI-P03a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P03b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P03c · D3:** Scene outline, character references, version save with real authorization.
- [ ] **UI-P03d · D3:** Narrative fiction vs witness vs citation visibly separated.
- [ ] **UI-P03e · D3:** Edit/undo/export, rights review and project owner tests.
- [ ] **UI-P03f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P04 — POSTER LAB (P1)
Reference: [`04_poster_lab.svg`](docs/design/mockups-xv/04_poster_lab.svg) · Canonical task owner: **M18 / M33** · Code owner: `Existing GeneratorStudio before new renderer` · route: `private studio route TBD`.

- [ ] **UI-P04a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P04b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P04c · D3:** Canvas, layers, selected object and keyboard editing baseline.
- [ ] **UI-P04d · D3:** Asset attribution, consent and license checks before export.
- [ ] **UI-P04e · D3:** Export preview, publish approval gate and negative-role test.
- [ ] **UI-P04f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P05 — CORPUS READER (P0)
Reference: [`05_corpus_reader.svg`](docs/design/mockups-xv/05_corpus_reader.svg) · Canonical task owner: **M08 / M19-19 / M19-31** · Code owner: `apps/dock` · route: `existing reader paths`.

- [ ] **UI-P05a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [x] **UI-P05b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims). **[evidence](docs/audit/ui-reader-rail-ab44093.md)**
- [x] **UI-P05c · D3:** Exact edition, original passage, translated wording and direction metadata.
- [x] **UI-P05d · D3:** Provenance drawer, copy/share citation and term navigation.
- [ ] **UI-P05e · D3:** Unapproved D08 projection denied even when UI link guessed.
- [ ] **UI-P05f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P06 — UNILEX EXPLORER (P1)
Reference: [`06_unilex_explorer.svg`](docs/design/mockups-xv/06_unilex_explorer.svg) · Canonical task owner: **M10 / M12 / M19** · Code owner: `Existing lexicon/ontology owners + Dock projection` · route: `lexicon/ontology paths`.

- [ ] **UI-P06a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P06b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P06c · D3:** Typed alias, figure, event and source relation inspector.
- [ ] **UI-P06d · D3:** Relation provenance, alternatives and uncertainty, not invented synonymy.
- [x] **UI-P06e · D3:** Accessible list alternative to graph for keyboard and mobile.
- [ ] **UI-P06f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P07 — MOONLAB RESEARCH (P1)
Reference: [`07_moonlab_research.svg`](docs/design/mockups-xv/07_moonlab_research.svg) · Canonical task owner: **M14 / M34** · Code owner: `HQ research desk until scope approved` · route: `private research route TBD`.

- [ ] **UI-P07a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P07b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P07c · D3:** Case workspace evidence / counterevidence / hypothesis views.
- [ ] **UI-P07d · D3:** Reviewer separation, decisions, correction or retraction controls.
- [ ] **UI-P07e · D3:** Only approved D08 projections can reach public UI.
- [ ] **UI-P07f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P08 — WORLD MONITOR (P2)
Reference: [`08_world_monitor.svg`](docs/design/mockups-xv/08_world_monitor.svg) · Canonical task owner: **M24** · Code owner: `Proposed source-backed WORLD projection` · route: `world route TBD`.

- [ ] **UI-P08a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P08b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P08c · D3:** Grounded source/time/region filters, no invented live-map feed.
- [ ] **UI-P08d · D3:** Observation details include freshness and uncertainties.
- [ ] **UI-P08e · D3:** Missing/late/revoked source states do not look NOMINAL.
- [ ] **UI-P08f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P09 — PUBLISHING HUB (P1)
Reference: [`09_publishing_hub.svg`](docs/design/mockups-xv/09_publishing_hub.svg) · Canonical task owner: **M18 / M20** · Code owner: `apps/headquarters` · route: `private publishing route TBD`.

- [ ] **UI-P09a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P09b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P09c · D3:** Draft → rights check → reviewer → released state mapping.
- [ ] **UI-P09d · D3:** Human approval/attribution/withdrawal audit trail.
- [ ] **UI-P09e · D3:** Denied publish, revoked rights and failed export UX.
- [ ] **UI-P09f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P10 — HARBOR COMMONS (P2)
Reference: [`10_harbor_commons.svg`](docs/design/mockups-xv/10_harbor_commons.svg) · Canonical task owner: **M32 / M37** · Code owner: `Proposed app, no independent auth` · route: `private community route TBD`.

- [ ] **UI-P10a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P10b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P10c · D3:** Voluntary member library, visibility and privacy controls.
- [ ] **UI-P10d · D3:** Consent/report/appeal and user deletion/export journeys.
- [ ] **UI-P10e · D3:** Role/access negative tests; do not expose private witness data.
- [ ] **UI-P10f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P11 — WORKS ECONOMY (P2)
Reference: [`11_works_economy.svg`](docs/design/mockups-xv/11_works_economy.svg) · Canonical task owner: **M35 / M37** · Code owner: `Proposed app, D15/D16 source-of-truth reviewed` · route: `private works route TBD`.

- [ ] **UI-P11a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P11b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P11c · D3:** Actual offers / quotes / orders / invoices and current owner.
- [ ] **UI-P11d · D3:** No fake sales or payment provider before integration approval.
- [ ] **UI-P11e · D3:** Idempotency, refund, receipts and customer access verified.
- [ ] **UI-P11f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

### UI-P12 — SKYLINK MESSAGING (P1)
Reference: [`12_skylink_messaging.svg`](docs/design/mockups-xv/12_skylink_messaging.svg) · Canonical task owner: **M38 / M19** · Code owner: `apps/skylink, bounded D18 owner` · route: `operator inbox proposed`.

- [ ] **UI-P12a · D1:** Audit actual route, permissions, reusable components and data owner; list differences from reference.
- [ ] **UI-P12b · D2:** Build accessible static structure using existing MoonUI shell/tokens (no fake operational claims).
- [ ] **UI-P12c · D3:** Three panes, statuses disconnected/connecting/open/logged-out.
- [ ] **UI-P12d · D3:** Pairing QR only during pairing, no logs or leaked credential.
- [ ] **UI-P12e · D3:** Delivery attempts, timestamps, retry, long wrap and right-to-left text.
- [ ] **UI-P12f · D2:** Save 390px/768px/1440px/1920px id/en screenshots and run keyboard/empty/error/reduced-motion checks.

## 4. Component contract and visual rules
| Area | Required visual treatment | Behavior invariant |
|---|---|---|
| Shell | Header, crown, navigation, panel frames, action strip; public vs admin shell separate | One canonical landmark/navigation owner per route; active link and clear breadcrumb |
| Typography | Display condensed, mono metadata, readable prose; zine scribble only as accent | Text selectable/readable; no image-only meaning; avoid cut/clipped titles |
| Palette | Semantic `@moonwitness/moonui` ink/pink/cyan/accent/ok/moon | Accessible contrast, focus-visible, high contrast errors |
| Art | Crown, geometric moon and original licensed texture/illustration | No copied third-party art; author, hash, license, consent ledger |
| Data | Visually distinguish sources, fictional narratives, review draft, approved result | Real loading/empty/error/denied; no invented `LIVE` metrics |
| Inputs | Cyber frame, true field label, visible inline help/errors | WAI-ARIA, keyboard, no hover-only access |
| Research | Source edition, provenance, uncertainty, contra-evidence | Reviewer-author separation; denied unapproved projections |
| Interactions | Optional glow/feedback, purposeful hover/keyboard states | `prefers-reduced-motion`, no auto audio or keyboard trap |
| Responsive | 1920 desktop inspiration but practical 390 mobile information hierarchy | No horizontal overflow; source script and long titles wrap |
| Localization | id/en UI labels independent of original religious/historical texts | Source-specific `lang` and `dir`, no silent reinterpretation |
| Security | Private HQ panels visually and technically separated | BFF/httpOnly; no admin token browser; source rights and consent checked server-side |

## 5. Acceptance matrix and release gates
- [ ] **QA-01 · P0:** Source/license ledger for every production asset: original, author, SPDX/license/consent, hash, usage permitted; unresolved assets excluded.
- [ ] **QA-02 · P0:** `pnpm ui:check` passes with no token drift; inspect **actual CSS custom-property names** rather than copying this reference.
- [ ] **QA-03 · P1:** `pnpm --filter @moonwitness/moonui test` passes; no regression to Dialog/Tab/Field contracts.
- [ ] **QA-04 · P1:** `pnpm lint`, focused app tests, app typecheck and app build pass on exact SHA.
- [ ] **QA-05 · P1:** Browser screenshots: 390/768/1440/1920; id/en, long copy, empty/loading/offline, dark + reduced motion where applicable.
- [ ] **QA-06 · P0:** 401/403 denied roles; publication & rights-negative tests; no private source, witness or channel leaked by public mock screen.
- [ ] **QA-07 · P1:** Real user journeys: Dock → Reader → provenance; Dock → story with fiction label; HQ reviewer → publication decision; existing RADIO unaffected.
- [ ] **QA-08 · P0:** `pnpm verify` and real container smoke/recovery/release gates scoped to selected deliverable. CI green ≠ public deployment.
- [ ] **QA-09 · P0:** Record exact commit, test commands, output, screenshot diffs, source/rights reviewer and rollback in canonical task packet; only then update [TODO.md](TODO.md).

## 6. AI local execution contract
> Continue directly on `dev`, never create a branch or rebase away another agent's work. Start by fetching and inspecting HEAD, TODO and affected files. Claim only one leaf scope at a time. Use `@moonwitness/moonui`; do not duplicate routes, API owners, CSS tokens, auth, DB or the media renderer. Implement smallest safe changes, run positive/negative tests, commit and push to `dev`, record exact evidence. Continue to next eligible leaf without confirmation when not blocked; on blockers report exact reason, preserve user files, move to independent task. Never mark an entire screen complete based on SVG resemblance. Treat unapproved source/media as blocked.

**Recommended first three task packets:** `UI-F01..F04` (audit) → `UI-F05..F11` (reused shell + honest states) → `UI-P01a..f` (Dock/Lighthouse) **without bypassing** `M19-19` public rights gate. Next: `UI-P05` Reader, `UI-P02` Universe, `UI-P03/04` private creativity. Other planned apps only after their canonical owners' approvals.

## 7. Definition of “terwujud”
12 visuals become an **implemented MoonUI ecosystem** only when each agreed screen is navigable and supported by real (or explicitly demo) bounded data; route/auth/rights/consent and source provenance are enforceable; responsive/keyboard/id-en tests pass; screenshots are reviewed against the reference; and deployment & rollback evidence exist for the shipped subset. **A reference is never a deployment certification.**
