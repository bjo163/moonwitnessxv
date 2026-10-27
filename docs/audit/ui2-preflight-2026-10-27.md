# UI-II Deep Audit — Preflight, Evidence and Parallel Ownership
**Repository:** [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv/tree/dev) · **Observed dev baseline:** `d54ad43aeff6855c6d2685ab14458f182d7a5a9d` · **Date:** 2026-10-27.
**Nature:** Source-and-CI evidence review; **not** a clean local checkout, browser acceptance, a release, or a replacement for [TODO.md](../../TODO.md).
**Continuation:** [todo-ui-2.md](../../todo-ui-2.md), [todo-ui.md](../../todo-ui.md), [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md).

## 1. Changes genuinely integrated since the 12 reference PNGs
Compared `8737fe4cb46504a013f649ce2aa3c4789a6d46db...dev`: 13 subsequent commits, latest `d54ad43aeff6855c6d2685ab14458f182d7a5a9d`; `main` observed at `13b8503a370ba4ea69e22b1e4f7f10111a89ed69`. These heads must be re-read by workers.
- `6968777`, `97eedf7`: Dock four-space entry (READ/EXPLORE/CREATE/SIGNAL) and Lighthouse presentation; no duplicate public rail and no fake global search.
- `5ece78d`: Reader provenance disclosure and explicit denial of withheld text. **Still incomplete**: full locale/RTL/source-rights and approved D08 publication projection.
- `38560d3`: keyboard-accessible term/UNILEX index alongside existing term detail/graph; no authorized unreviewed identity merges.
- `fa1e4b1`: recorded scoped evidence in `docs/audit/ui-screens-evidence-38560d3.md`: Dock 71/71 tests, Dock typecheck/build, scoped lint and `pnpm ui:check`; these are historical, not proof that latest `dev` passes `pnpm verify`.
- `a53fffe` / `d54ad43`: SKYLINK M38-11 REST/WebSocket with two auth modes, channel list/state, conversation/messages and send pathways; M38-12 ARSY client integration and M38-13 operator UI remain **unchecked**.
- `5ff7486` / `d54ad43`: ECHOLOG M39-10 bounded S3-compatible API; M39-11 consumer handoff/operator UI and M39-12 E2E remain **unchecked**.
- `7c29877`: release hooks/automation introduced; verify the actual CI before calling release ready.
- No 13–22 PNG files were found in tracked `docs/design/mockups-xv` at this HEAD. The second ten-screen chat export is **candidate design input**, not adopted repo source/approved product art.

## 2. P0 current exact-SHA CI blocker — observed, not inferred
[Latest verified GitHub Actions run](https://github.com/bjo163/moonwitnessxv/actions/runs/40430593808) for `d54ad43aeff6855c6d2685ab14458f182d7a5a9d` is **failure**.
`Install dependencies`, dependency audit, secret scan and build completed; `pnpm ui:check` reported **102 files scanned / 0 violations**. `pnpm lint` stopped `pnpm verify` with **10 errors, 56 warnings**; promotion to `main` was skipped. The warnings are not being mislabeled as failing errors. Exact failing surfaces in CI log:
1. Project-service parser cannot find `apps/aigateway/test/presentation.test.ts` (1).
2. Project-service parser cannot find `packages/moonui/test/{accessibility,components,tokens}.test.ts` (3).
3. `packages/skylink-whatsapp/test/transport.test.ts` not found by project service (1).
4. `packages/skylink-store/test/store-pg.test.mjs`: `process` and `URL` reported as undefined (2).
5. `scripts/git-hooks/commit-msg.mjs`: two `no-useless-escape` errors (2).
6. `scripts/git-hooks/pre-commit.mjs`: unused `err` (1).
**Total 10 errors.** Fix all with targeted ESLint/tsconfig and code changes; do not silence via blanket rule disable, exclude tests to fake success, or bypass `pnpm verify`.
After lint is repaired, **remaining downstream tests/codegen/build:web have not been proven on this SHA**. A green scoped UI test is not a green monorepo release.

## 3. Current application boundaries, derived from code
| App/area | Actual source | Correct UI role | Forbidden design shortcut |
|---|---|---|---|
| Public Dock | `apps/dock/src/app/{stations,denpa,constellation,patches,reader,terms}`, `apps/dock/src/ui/` | Stations + Player, DENPA, typed graph, patch registry, 1·6·3 Reader, provenance | Fake Mission Control dashboard, sidebar rail, decorative search/telemetry |
| Cockpit | `apps/cockpit/client/{App.tsx,components/*}` | Local supervisor: logs, iframe preview, media/tuner, ledger, ports, TODO progress | Public empire dashboard, fake shell command stream, invented system metrics |
| Headquarters | `apps/headquarters/src/app/(admin)/`, `src/ui/widgets/RecordForm.tsx` | Authenticated model CRUD/schema, three-tier radar/source/signal triage | Bypass session in frontend; pretend generic CRUD is approval workflow |
| SKYLINK | `apps/skylink/src/modules/routes.ts`, `src/ws.ts` | Authenticated messaging control plane; operator UI not yet built | Claim M38-13 completed because API exists |
| ECHOLOG | `apps/echolog/src/modules/objects/index.ts`, `modules/s3` | Object metadata/grants/storage; operator UI not yet built | Show permanent object URL or present unscanned object as cleared |
| MoonUI | `packages/moonui/src`, `moon.css` | Shared semantic tokens/behavior primitives | Duplicated components, unlicensed screenshot crops, invented badges |

**Important specifics:**
- Cockpit's **six real tabs** are `logs`, `preview`, `media`, `ledger`, `ports`, `progress`; the user-requested next mockups cover **media, preview, progress** specifically. The service supervisor sidebar persists separately. AnalogTuner in `CockpitTunerSection.tsx` derives approximate channel frequencies via hashing, **not a physical radio tuning/frequency measurement**.
- Cockpit Preview currently has a URL text input, iframe, local shortcut hosts and external-window action. Review allowed origins, iframe constraints and network safety before expanding controls; no production unrestricted URL fetch or security claim.
- Cockpit Progress reads a projection of `TODO.md`; never invent task completion and never mutate TODO from a UI concept. Existing SSE/trend issues were patched in earlier commits; preserve absolute flip and reconnect semantics.
- Dock `/reader/compare` has a fixed six-edition QS 2:82 presentation with `RIGHTS_CLEARED` literals; **the UI label is not evidence of a rights grant**. Validate per-edition provenance/rights and source language before expanding public copy.
- Dock `/constellation` is **read-only** typed edges/aliases and reviewer decisions; candidate relations are not verified merges.
- Dock `/patches` exposes 33 patch slots, including dispute/dual-title states; preserve conflict labels, never silently coalesce.
- HQ World Monitor is a **three-tier radar→source→signal** workflow with driver/task queue, not a fabricated interactive worldwide map.
- Existing `SiteHeader` and the 4-space Dock entry are *implemented*. A second search box/rail/global shell is explicitly forbidden by [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md).

## 4. Reconciliation defects in older UI register
- `todo-ui.md` declares **UI-F06** and **UI-F07** checked although **UI-F05** remains unchecked. **UI-F09** is checked with its dependency **UI-F08** unchecked; **UI-F11** is checked with **UI-F10** unchecked. This can be legitimate *scoped* implementation only if dependencies are reclassified and explicit evidence is recorded; do not silently infer full predecessor completion. The canonical Mxx task rows remain unchanged.
- `docs/audit/ui-blocked-screens-8737fe4.md` and the 12-image gallery README still describe SKYLINK as a skeleton/incomplete messaging API. These are historically pinned to `8737fe4`; as of `d54ad43aef`, M38-11 is checked and M38-12/13 remain open. Add a superseding status note; preserve history rather than rewriting dated evidence.
- `todo-ui.md` still names original audit anchor `13b8503`, which is intentionally a planning-time anchor; future agents must use latest HEAD instead.
- Original 12 PNGs were committed as **reference-only**; unresolved authorship/usage rights persist. Batch 2 images do not automatically inherit usage authorization from batch 1.
- 390/768/1440/1920 **DOM geometry** evidence for 01 on hub-offline branch is recorded; pixel-perfect screenshot baselines are still unavailable/unverified, so M19-06/M19-35 remain open.
- M19-19 remains open: public Research is fail-closed and no approved D08 public projection is demonstrated. Avoid unlocking routes on the strength of a UI mockup.

## 5. Risk and recommended prioritization
| Severity | Finding | Risk | Remedy / owner |
|---|---|---|---|
| P0 | Latest CI red (10 lint errors) | All subsequent release evidence blocked | Dedicated CI/tooling owner, fix exact errors; verify full `pnpm verify` |
| P0 | Reader rights and D08 gate incomplete | Leakage/copyright/false cleared metadata | Dock + D08 owner, deny unsupported text, per-edition rights evidence |
| P0 | Shared-file parallel collision | Lost changes to `globals.css`, `App.tsx`, `TODO.md`, catalogs, config | Exclusive integrator ownership, lease matrix in UI-II plan |
| P1 | Stale UI and SKYLINK status docs | AI builds wrong/duplicate features | Superseding audit note; no retroactive task closure |
| P1 | No pixel screenshot evidence | Mockup parity unverifiable | QA owner, approved harness + screenshot artifact comparisons |
| P1 | Cross-locale/RTL seams | Broken source text and accessibility | Dedicated i18n/sourcing owner, id/en + ar/he/el test corpus |
| P1 | Cockpit Preview open URL inputs | Unsafe UX/origin ambiguity | Operator security owner, validate allowlist/intent and iframe limitations |
| P1 | Mockup art provenance not approved | Redistribution of unidentified art | Art/licensing owner, reference-only until grants |
| P2 | SKYLINK/ECHOLOG backend moves without UI | Overclaim in mockups | M38-12→13 and M39-11, bounded operator prototypes only |

## 6. Evidence and limitations
- Source: live GitHub branch/tree, commit diff `8737fe4...dev`, current `TODO.md`, code files, M19/M38/M39 audit packets and CI job log for `40430593808`.
- **Did not** run checkout-local `pnpm verify`, PostgreSQL tests, image similarity, Vercel deployment, manual browser navigation or CI re-run in this planning pass.
- **Do not** modify `TODO.md` completion rows on a documentation-only commit.
- `main` is older than `dev`; do not force sync/push while CI failing. The verified promotion pipeline owns the transition.


## 7. New commits discovered during publication — latest CI preflight supersession
While this review was being recorded, local AI pushed 3 more commits through `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3`, including `scripts/app-create.mjs` and a new root `@playwright/test@^1.64.1` dependency in `package.json`. They did **not** touch the UI-II scope docs, but they changed the actual CI first-failure mode.

- [GitHub Actions run #40433978334](https://github.com/bjo163/moonwitnessxv/actions/runs/40433978334) on plan-publication SHA `4648a0efcc4c96f2b8bba587714323a94cbc70a2` failed **at `pnpm install --frozen-lockfile`**, before build/lint/test.
- The log explicitly reports `ERR_PNPM_OUTDATED_LOCKFILE`: root `package.json` specifies `@playwright/test@^1.64.1` and the checked-in `pnpm-lock.yaml` does not. Do not bypass `--frozen-lockfile`; under **UI2-G00** synchronize the lockfile in a deliberate package/tooling-owner commit, verify frozen install, then rerun full CI.
- After frozen install succeeds, earlier `pnpm lint` failures from run #40430593808 remain **historical known risks**, not a claim they are still reproducible on the new HEAD. Diagnose/fix against actual newest SHA.
- Playwright is now a dependency **declaration**, not evidence that screenshots/browser tests are running. `UI2-G07` still requires runner/browser setup, screenshot fixture storage, breakpoints and results.
- No app/QA/task is marked completed by this documentation addendum. Updated finding takes precedence over the earlier P0-lint-first summary where the two conflict.

**Canonical execution order is now: UI2-G00 frozen-lockfile → UI2-G01 lint → UI2-G13 full verification.** Independent read-only audit tasks can proceed in parallel.
