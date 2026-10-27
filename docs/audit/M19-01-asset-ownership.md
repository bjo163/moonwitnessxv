# M19-01 — MoonUI vs Moonframe vs Rocksoul: asset ownership audit

- **Task:** M19-01 — Audit MoonUI vs Moonframe vs Rocksoul asset ownership (P1 · D2 · depends M05-07)
- **Baseline:** branch `dev`, HEAD `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (local == `origin/dev` after `git fetch origin dev` at audit time; no pull/merge performed).
- **Audit date:** 2026-10-27 (Asia/Jakarta).
- **Prerequisite check:** M05-07 is closed — TODO.md row: `[x] **M05-07** … suite checkout bersih dan CI fa0f1b5 lulus 197 pass/2 skipped/0 fail`. Not blocked.
- **Packet note:** no `docs/tasks/M19/M19-01.md` packet exists (the M19 dir contains M19-02..M19-35 packets), so the TODO-designated audit path `docs/audit/` is used.
- **Method:** READ-only. **No code was changed by this audit**; the only file written is this artifact. No `TODO.md` edit, no git commit.
- **Working-tree caveat:** at audit time the tree carries another live session's WIP (`apps/echolog/*`, `scripts/check-ui-consistency.mjs` +3 lines adding echolog surfaces, eslint config, hooks). Every file:line below was read from that working tree; the ui:check run recorded here reflects that state.

## 1. What each name actually is in THIS repo today

### 1.1 MoonUI — the only one that exists as code

- **Real package:** `packages/moonui` → `@moonwitness/moonui` v1.0.0, `"private": true` (`packages/moonui/package.json`). ESM, React 19 peer dep, dep `@moonwitness/core`.
- **Exports (package.json `exports`):** `.`, `./client`, `./avatar`, `./icons`, `./tokens`, `./preset` (`tailwind.preset.js`), `./moon.css`.
- **Sources:** `packages/moonui/src/` — `index.ts`, `tokens.ts`, `moon.css` (root at package level), modules `feedback.tsx`, `form.tsx`, `nav.tsx`, `layout.tsx`, `media.tsx`, `fields.tsx`, `pills.tsx`, `seal.tsx`, `terminal.tsx`, `glyph.tsx`, `zine.tsx`, `crt.tsx`, `data.tsx`, `cn.ts`, plus `src/client/` (16 files incl. `modal.tsx`, `toast.tsx`, `haptics.ts`, `sound.ts`, `audio-spectrum.tsx`), `src/icons/index.tsx` (32 hand-authored stroke SVG icons), `src/avatar/` (procedural generator, no third-party art).
- **Tests:** `packages/moonui/test/{accessibility,components,tokens}.test.ts`.
- **Design authority:** `MASTER_DESIGN.md:2,10` — "`@moonwitness/moonui` is the sole certified design system across all MoonWitness XV surfaces"; `docs/design/COMPONENTS.md:3-4` — "Single Source of Truth: `packages/moonui/moon.css`, `packages/moonui/src/`, and `packages/moonui/src/client/`."
- **Ownership:** first-party, this repository. **No license file inside `packages/moonui/` and no root `LICENSE` in the repo** (checked: `ls LICENSE* packages/moonui/LICENSE*` → none; `"license"` field absent from every root/package/app `package.json`). See risk row R-1.

### 1.2 Moonframe — documentation-only external reference; NOT code

- Repo-wide case-insensitive grep for "Moonframe" matches exactly **3 files, all documentation**: `TODO.md:448` (this task row), `BLUEPRINT.md:256`, `docs/vision/MASTER_VISION_NARRATIVE_XV.md`.
- **Zero code references:** grep for `moonframe|rocksoul` across `apps/ packages/ scripts/` in `*.ts *.tsx *.js *.mjs *.css *.json` → **0 matches**. No vendored copy, no dependency, no import anywhere.
- **Documented claims:** `MASTER_VISION_NARRATIVE_XV.md:390` ("provides a potential shared *behavioral* component foundation with 15 skins / 30 appearances. Consumer adoption is a **decision**, not completed integration"), `:647` and `:772` (external repo `bjo163/moonframe`, pinned `main@00c9bd65f4068e0e858f36ba637151815c350983`, "Optional bounded XV adoption"), `BLUEPRINT.md:256` ("Moonframe/Rocksoul Assets only after UI behavior/a11y and permission audit"), `MASTER_VISION_NARRATIVE_XV.md:560` ("candidates for reviewed adoption, not pre-committed dependencies").
- **External rights — CHECKED 2026-10-27 via authenticated `gh api repos/bjo163/moonframe`:** public, not archived, **license SPDX = MIT** (GitHub license object `MDc6TGljZW5zZTEz`). Pinned commit verified to exist (`gh api …/commits/00c9bd65…` → 2026-10-25T23:35:08Z). So if Moonframe components are ever adopted, the license gate is already satisfied; the open gates are the BLUEPRINT §7 item-5 a11y/permission audit and actual adoption decisions, neither of which M19-01 makes.

### 1.3 Rocksoul — a family of external historical repos; NOT code, NOT assets in this repo

- Grep matches **15 files, all documentation/config plus one mockup SVG**: `TODO.md`, `BLUEPRINT.md`, `README.md`, `docs/vision/MASTER_VISION_NARRATIVE_XV.md`, `docs/decisions/ADR-0003`, `ADR-0007`, `M12-01-rocksoul-boundaries.md`, `M02-05`, `M02-07`, `M06-05`, `docs/audit/M06-01`, `M06-07`, `M12-typed-correlation-graph.md`, `docs/tasks/M26/M26-02.md`, and `docs/design/mockups-xv/02_project_universe.svg:18` (the word appears as *label text inside the rights-pending concept mockup*).
- **What the docs say it is:** not a component library in XV. Rocksoul is a set of separate legacy GitHub repos: `rocksoul-assets` (brand/cinematic/Penpot assets), `rocksoul-ui` ("Previous component/UI approach — Historic/reference", `MASTER_VISION_NARRATIVE_XV.md:644`), `rocksoul-runtime`, `rocksoul-omen`, `rocksoul-correlation` (pinned `main@380ac810…`, `:773`), `rocksoul-platform` (pinned `5d820b17fa11c039` as legacy source in `docs/decisions/M12-01-rocksoul-boundaries.md:8`). Domain roles are governed by **M12-01 (RATIFIED)**: XV "references … by stable identifier and provenance digest. It **never** re-implements a Rocksoul owner, bulk-copies its rows, or runs it as a live runtime dependency." Rocksoul Assets/Creative/UI are assigned as "visual sources" to **D13 Design + D07 media manifests** — "Releases cite a source code and SHA; no binaries or thumbnails are embedded."
- **External rights — CHECKED 2026-10-27 via `gh api`:** `bjo163/rocksoul-ui`, `bjo163/rocksoul-assets`, `bjo163/rocksoul-correlation`, `bjo163/rocksoul-platform` → **`license: null` on every one — NO LICENSE FOUND** (risk row R-2). Not archived.

## 2. Ownership matrix — 3 owners × asset classes

| Asset class | MoonUI (`packages/moonui`) | Moonframe | Rocksoul family |
|---|---|---|---|
| React/TS components | **SOLE owner, in-repo code** (`src/*.tsx`, `src/client/*`); apps consume via `@moonwitness/moonui` (87 consuming files across dock/HQ/cockpit/echolog) | External repo (MIT-checked), **zero adoption in this repo**; adoption = future decision, not status quo | `rocksoul-ui` historic/reference only; **no code in this repo** |
| CSS / tokens | **Sole source**: `packages/moonui/moon.css` (`--ink … --font-mono`, lines 8–45) + `src/tokens.ts`; app stylesheets hold layout only; enforced by `pnpm ui:check` CHECK 2/4 | Its "15 skins/30 appearances" would be a *visual recipe* substitution; MASTER_DESIGN.md:6 already fixes the invariant: skin never changes keyboard/ARIA/form meaning | n/a — no Rocksoul CSS exists here |
| Icons / vector | **Sole product icon source**: `src/icons/index.tsx` (32 original stroke SVGs, `aria-hidden`); one-off first-party `apps/dock/public/icon.svg`, `apps/cockpit/client/public/favicon.svg` | not consumed | **12 concept SVGs + 12 PNGs** live in `docs/design/mockups-xv/` (repo-owned *reference*, not product art; ADR-0009 §2.1) |
| Raster art (PNG/JPG) | none shipped by the package | none | two distinct classes, see §4: **mockup PNGs** (reference-only, rights review pending) and **legacy `public/art` JPGs** (shipped product art, NO rights ledger) |
| Audio | synthesized Web Audio only (`src/client/sound.ts` — "zero-byte oscillator clicks", no samples) | none | **`apps/cockpit/client/public/bgm.mp3`** shipped — see risk R-3 |
| Fonts | **Reference-only, nothing bundled**: token stacks at `moon.css:42-45` name system/legacy faces (Inter, Impact, Anton, Segoe Print, JetBrains Mono…). Repo-wide `find` for `*.woff* *.ttf *.otf` (excl. node_modules) → **0 files**; no `next/font`, no fontsource | — | — |

## 3. The ONE UI component contract (forward-looking)

1. **`@moonwitness/moonui` is the sole component and token source** for every XV surface (MASTER_DESIGN.md:10; COMPONENTS.md:4). All product primitives — Button/LinkButton/Tabs/Modal/AlertDialog/Field/Inputs/Card/Badge/Pill/Tooltip/Skeleton/Tape/Pagination/LiveDot/etc. — come from `.` or `./client` exports.
2. **App-local composition is allowed; app-local *primitives* are not.** Per ADR-0009 §2.4 and COMPONENTS.md §"Dock Space Entry", app-specific *layout/composition* (`SpaceCard`, `SpaceGrid`, `PanelState`, `StatusTag` in `apps/dock/src/ui/components/`) is deliberately per-app until a **second consuming app** exists, which is the promotion trigger into MoonUI. This audit endorses that rule as part of the contract.
3. **Skins never change semantics.** MASTER_DESIGN.md:6: any future skin (incl. a reviewed Moonframe adoption) may change the visual recipe only, never keyboard handling, ARIA, form meaning, permissions, source identity or API.
4. **External component/asset repos (Moonframe, rocksoul-ui, rocksoul-assets) are adoption candidates, never implicit dependencies.** Nothing may be copied in without: license status recorded (Moonframe=MIT ✔ checked; rocksoul-*=NO LICENSE ✘), BLUEPRINT §7 item-5 a11y/permission audit, and a rights ledger entry (M12-01 non-duplication rule).
5. **Mockup reference assets are not product assets** (ADR-0009 §2.1): `docs/design/mockups-xv/` may never be embedded, cropped, used as favicon/OG. Checked today: `git grep -c "mockups-xv/png" -- apps/` → **no matches (rc=1)**.
6. **Enforcement gates verified running:** root `package.json:49` `ui:check` → `node scripts/check-ui-consistency.mjs`, wired into `pnpm verify` (`package.json:50`). Observed execution at this baseline+WIP: **PASSED, 111 files scanned, 0 violations** (CHECK1 moonui imports on 16 mandatory surfaces, CHECK2 hex drift, CHECK3 duplicate component classes, CHECK4 font tokens).

## 4. Findings

### Positive (every claim backed by a real path)

- MoonUI is a real, consumed, tested, private first-party package (§1.1; 87 consuming files; `pnpm ui:check` pass observed).
- Moonframe and Rocksoul have **zero code/asset presence** in this repo (0 grep hits in apps/packages/scripts code; only docs + 1 mockup SVG label).
- Moonframe external rights are **checked: MIT** (gh api, 2026-10-27, pinned commit `00c9bd65` exists).
- The 12 uploaded design refs (commit `8737fe4`, `docs/design/mockups-xv/png/01..12_*.png` + 12 SVG companions) are governed: manifest `licenseReviewRequired: true`, SHA-256 ledger + explicit "no per-asset rights record exists" in `docs/audit/ui-baseline-8737fe4.md` §3, adoption rules in ADR-0009, and no app references them today (verified).
- Fonts: no font binaries anywhere in the repo; only `font-family` token references (`moon.css:42-45`) — no redistribution right is exercised.

### Negative — honest findings (required by acceptance)

- **R-1 NO LICENSE FOUND (own code):** no root `LICENSE`, no `packages/moonui/LICENSE`, no `license` field in any workspace `package.json` (checked `grep '"license"'`). Harmless while everything stays private/unreleased, but it is an unresolved rights state for a "one UI component contract with checked external rights"; a release (M27-05) needs an owner decision.
- **R-2 NO LICENSE FOUND (external, Rocksoul family):** `bjo163/rocksoul-ui`, `rocksoul-assets`, `rocksoul-correlation`, `rocksoul-platform` all report `license: null` via GitHub API (2026-10-27). Any future adoption of Rocksoul *assets* (e.g., the visual sources D13 mentions) is blocked until explicit grants are recorded; M12-01/BLUEPRINT §7 item 5 already route this through rights review. Moonframe differs: MIT checked.
- **R-3 Shipped raster art & audio with no rights ledger — the real gap.** Distinct from the mockup set, these **are** product-served and were added before ADR-0009: `apps/dock/public/art/` (**18 JPGs**, incl. `hero-girl-moon.jpg`, portraits/city/poster art), `apps/headquarters/public/art/` (**10 JPGs**), both added by commit `787210b` and referenced from first-party layout code (`apps/dock/src/ui/components/sections.tsx`, `apps/headquarters/src/layouts/auth.tsx:…`, `apps/headquarters/src/app/(admin)/page.tsx`, `…/world-monitor/page.tsx`). `poster-ska.jpg` is **byte-duplicated across two apps** (duplicate ownership). `apps/cockpit/client/public/bgm.mp3` (plus copies at `apps/cockpit/public/bgm.mp3` and built `apps/cockpit/dist/client/bgm.mp3`, added by `3178a4c`) is **background music served to users**, while `docs/design/ASSETS.md:2` says "Do not redistribute fonts or unlicensed music/lyrics" and requires preserving "asset author, license, digest/source and consent". No author/license/consent record exists for any of these (repo grep for a ledger finds only the mockup-set ledger and QA-01/M17-06 follow-ups). This is the audit's primary unresolved-rights finding.
- **R-4 Primitive-level UI outside MoonUI (duplicate-component negative evidence).** `pnpm ui:check` passes because its CHECK3 forbids only 14 named CSS classes and CHECK1 only asserts imports on 16 listed files; raw interactive primitives elsewhere slip through. Observed outside MoonUI: `apps/dock/src/ui/components/shell.tsx:236` and `:275` (custom `dk-icon-btn` toggle/close `<button>`; class defined app-local at `apps/dock/src/app/globals.css:64`), `apps/dock/src/ui/client/TimeShiftPlayer.tsx:70`, `apps/dock/src/ui/client/GeneratorStudio.tsx:368`, `apps/dock/src/app/global-error.tsx:45`, `apps/cockpit/client/components/CockpitTopBar.tsx:234` and `:254` (inline-styled locale toggle buttons), `apps/cockpit/client/components/CockpitFooter.tsx:41`, `apps/echolog/client/components/EchologUploadPanel.tsx:109` (WIP surface of another session). Excluded as legitimate: hidden form inputs (`apps/headquarters/src/app/login/page.tsx:39`, `…/layouts/vertical.tsx:112`, `apps/dock/src/app/terms/page.tsx:201-203`), native `<input type=range|file|select>` inside app-specific media controls (Player/TimeShift/IPTV are functional widgets, not design-primitive clones), and the ADR-0009-approved app-local composition components (§3 rule 2). None of these reimplements token colors (they reference `var(--…)`), so they are **contract soft-violations** (Button-family affordances outside MoonUI), not drift violations.
- **R-5 Gate coverage gap (contract durability):** `MANDATORY_MOONUI_SURFACES` in `scripts/check-ui-consistency.mjs:79-96` is a fixed 16-path list (echolog just added by WIP commit-in-progress); new pages/apps are not auto-covered, and CHECK3's class list doesn't include `dk-icon-btn`-style app-local primitives from R-4.

## 5. Verdict

**READY-TO-CLOSE** for M19-01's stated acceptance ("One UI component contract with checked external rights"): the contract is defined in §3 with a passing enforcement gate observed at this baseline, Moonframe rights are checked (MIT) and Moonframe/Rocksoul have provably zero current consumption, and the Rocksoul NO-LICENSE status is recorded honestly rather than assumed.

Residual risks are recorded as owned follow-ups, not silent gaps: QA-01 (mockup PNG rights ledger — ADR-0009), **M17-06** ("Track original poster/music/derived media license… No unlicensed lyrics or external artwork" — the natural owner of R-3 `public/art` + `bgm.mp3`), R-4/R-5 to be raised to the MoonUI gate owner (extend ui:check or promote/replace the listed primitives), and R-1 to the release gate (M27-05).

## 6. Evidence log (commands actually run)

- `git rev-parse HEAD` → `76ecdc5…`; `git status --porcelain` → 8 modified + 8 untracked WIP paths (other sessions), preserved untouched.
- `git fetch origin dev` → tip `76ecdc5…` (local == remote; no pull/merge).
- `gh api repos/bjo163/{moonframe,rocksoul-ui,rocksoul-assets,rocksoul-correlation,rocksoul-platform}` and `gh api repos/bjo163/moonframe/commits/00c9bd65…` — license + pin checks, 2026-10-27.
- `node scripts/check-ui-consistency.mjs` (read-only) → PASSED, 111 files, 0 violations.
- `git grep -c "mockups-xv/png" -- apps/` → no matches (rc=1).
- Greps: `Moonframe` → 3 doc files; `Rocksoul` → 15 files; code-file grep `moonframe|rocksoul` in apps/packages/scripts → 0; `find` font binaries → 0; raw `<button|input|select>` scan under `apps/**/*.{tsx,jsx}`.
- `git show 8737fe4 --stat`, `git log --diff-filter=A` for `public/art` (`787210b`) and `bgm.mp3` (`3178a4c`).
- Reads: `TODO.md` (M05-07, M19-01..07, M30 rows), `MASTER_DESIGN.md`, `BLUEPRINT.md` §7, `packages/moonui/*`, `scripts/check-ui-consistency.mjs`, `docs/design/{COMPONENTS,ASSETS}.md`, `docs/design/mockups-xv/{README.md,manifest.json}`, `docs/audit/ui-baseline-8737fe4.md`, `docs/decisions/{ADR-0009,M12-01}*.md`.

**No code changed. No TODO.md edit. No commit created. This file is the only write.**
