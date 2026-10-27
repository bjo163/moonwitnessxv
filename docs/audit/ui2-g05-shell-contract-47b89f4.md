# UI2-G05 — per-app shell + token/no-clipping contract (Dock · Cockpit · HQ)

Gate row being served (`todo-ui-2.md`, UI2-G05): "Establish per-app shell and
token/no-clipping contract for Dock, Cockpit, HQ; allow distinct UX by role.
DoD: `ui:check` zero; source of truth documented; no second nav."

Written by the UI2-G05 session. Scope of writes: `apps/dock/src/app/globals.css`,
`apps/dock/src/ui/components/shell.tsx`, one new Dock test, and this file.
Cockpit and HQ were read, not modified (they were declared read-only for this
session — see §6). Nothing in `docs/audit/screens/**` and no `scripts/ui/*`
harness was touched.

---

## §0 Baseline — what was actually run, with its real result

| Item | Value |
| --- | --- |
| Branch | `dev` (worked directly on it, per Owner Policy) |
| HEAD when the session started | `7d2e9d8 feat(orbit): gate approval handoff on a server-validated 100CENTER surface (M40-08)` |
| HEAD when the final gate runs were executed | `93985d5 feat(orbit): pin cross-app auth, deployment and extraction boundaries (M40-09)` |
| HEAD named in the task brief | `47b89f4 docs(audit): record packet-1 rights, preview-security and asset-origin audits` — three commits behind the start HEAD; the commits between it and `7d2e9d8`/`93985d5` touch `apps/orbit`, `apps/headquarters/src/app/login/page.tsx`, `packages/moonui/src/form.tsx`, `TODO.md` and docs. None touch Dock's shell, header, or `globals.css`. The filename of this document keeps `47b89f4` as instructed; the real HEAD is above. |
| Other sessions' uncommitted Dock files present during this work | `apps/dock/next-env.d.ts`, `apps/dock/src/app/reader/page.tsx`, `apps/dock/src/ui/components/reader.tsx`, `apps/dock/src/ui/components/terms.tsx` — read only, never edited |

Commands run, and their literal result:

| Command (run from where it says) | Result |
| --- | --- |
| `node --experimental-strip-types --test test/header-shell-no-clip-contract.test.mjs` (`apps/dock`) | `tests 10 / pass 10 / fail 0` |
| `node --experimental-strip-types --test test/header-shell-no-clip-contract.test.mjs test/mobile-drawer-contract.test.mjs test/responsive-accessibility.test.mjs` (`apps/dock`) | `tests 27 / pass 27 / fail 0` |
| `node --experimental-strip-types --test $(ls test/*.test.mjs \| grep -v home-offline)` (`apps/dock`, 24 files) | `tests 208 / pass 208 / fail 0 / duration_ms 1005.5` |
| earlier run of the same 24-file set, at HEAD `7d2e9d8` | `tests 205 / pass 204 / fail 1` — the one failure was `test/locale-boundary-coverage.test.mjs` (another session's UI2-G10 file, asking for an audit note beside it). It passes at `93985d5`; that session fixed it, not me. |
| `pnpm ui:check` (repo root) | `Files scanned: 132 \| Total Violations: 0` + `✨ Monorepo UI consistency check PASSED!` — full output in §4 |
| `pnpm eslint apps/dock/src/ui/components/shell.tsx apps/dock/test/header-shell-no-clip-contract.test.mjs` (root) | no output, exit 0 |
| `pnpm eslint apps/dock/src/app/globals.css` (root) | `warning File ignored because no matching configuration was supplied` — ESLint has no CSS rule in this repo; the identical warning appears for untouched `apps/headquarters/src/app/globals.css`, so it is pre-existing tooling behaviour, not a defect in this change |
| `pnpm exec tsc --noEmit` (`apps/dock`) | clean (run at `7d2e9d8`; the later commits add no Dock TS source) |
| revert-detection check | deleting `flex-wrap: wrap` from `.dk-header` makes test 1 fail; the line was restored and 10/10 passed again |
| Playwright measurement | Dock dev server started by me on port **3111**, scripts kept outside the repo (`Z:\tmp\ui2g05\measure.mjs`, `sweep.mjs`, `counterfactual.mjs`, `focus.mjs`); PNGs in `Z:\tmp\ui2g05\`. Nothing written inside the repo by these scripts. Server shut down after the last run. |

Explicitly **not** run:

- `apps/dock/test/home-offline.test.mjs` — excluded by instruction: it needs a
  Dock server on port 3001, which the operator's own dev server holds. Untouched.
- `pnpm lint` / `pnpm test` / `pnpm verify` repo-wide; `next build` for any app.
- Any `scripts/ui/*` harness, and any write to `docs/audit/screens/**`.
- Any Cockpit, HQ, orbit, arsy or skylink test suite (read-only scope for me).
- Any write-side git command (`add`, `commit`, `push`, `stash`, `checkout`,
  `restore`, `clean`, `reset`). Only `git log`, `git show`, `git diff`,
  `git status`, `git rev-parse`, `git merge-base` were used.
- Nothing was killed except my own port-3111 server. Port 3001 was never touched.

---

## §1 Per-app shell inventory — as it actually is

| | Dock (public zine) | Cockpit (operator console) | HQ (internal command) |
| --- | --- | --- | --- |
| Shell owner (DOM root) | `div.dk-shell` — `apps/dock/src/layouts/site.tsx:16` | `div.cockpit-shell` — `apps/cockpit/client/App.tsx:542` | `div.m-shell` — `apps/headquarters/src/layouts/vertical.tsx:46` |
| Shell composition | `SiteHeader` + `main.dk-main` + `SiteFooter` (all in `apps/dock/src/ui/components/shell.tsx`) | `CockpitTopBar` (`client/components/CockpitTopBar.tsx:63`, `header.cockpit-topbar`) + `div.cockpit-body` (`App.tsx:575`) = `CockpitSidebar` (`components/CockpitSidebar.tsx:24`, `aside.cockpit-sidebar`) + `main.cockpit-main` | `aside.m-sidebar` (`vertical.tsx:47`: `BrandLogo:48`, `SideNav:58`, a `ZineNote` band) + `div.m-main:82` with `header.m-navbar:83` (breadcrumbs/command bar) |
| Shell grid owner | `apps/dock/src/app/globals.css:12` (`.dk-shell`, flex column, `overflow-x: clip`) | `apps/cockpit/client/cockpit-layout.css:14` (`.cockpit-shell`, app-frame, `overflow: hidden` at :19) | `packages/moonui/moon.css:262` (`.m-shell { grid-template-columns: 216px 1fr }`), collapsed to one column by `apps/headquarters/src/app/globals.css:291` |
| Nav rendered (one source) | `nav.dk-nav` — `shell.tsx:198`, `aria-label={copy.navMainLabel}`, mapped from `NAV_LINKS` (`shell.tsx:27`, **15** items) | MoonUI `Tabs` — `App.tsx:587` inside `div.cockpit-tabs-bar`; rendered as `div.m-tabs[role=tablist]` (`packages/moonui/src/nav.tsx:103`), mapped from `cockpitTabs` (`App.tsx:522`) | MoonUI `Nav` via `SideNav` — `apps/headquarters/src/ui/client/SideNav.tsx` → `nav.m-stack[aria-label="Primary"]` (`packages/moonui/src/nav.tsx:22`), fed by the `groups` built in `vertical.tsx` |
| Second surface | `nav.dk-mobile-nav` at `shell.tsx:288`, only inside `div#dk-mobile-menu[role=dialog][aria-modal]` (`shell.tsx:254`), which is `hidden` at rest and maps the same `NAV_LINKS` (`shell.tsx:293`) | none — the sidebar is a `aside` of service-state rows and racks, it contains no `nav` and no link list | none — `header.m-navbar` carries breadcrumbs/search/user, not a link list |
| Breakpoint owner | `apps/dock/src/app/globals.css:754` `@media (max-width: 1040px)` — the only rule that switches desktop nav ↔ drawer (`:766 .dk-nav{display:none}`, `:779 .dk-mobile-menu-toggle{display:grid}`) | `apps/cockpit/client/cockpit-layout.css:123` `@media (max-width: 700px)` — the file's only media query | `apps/headquarters/src/app/globals.css:281` `@media (max-width: 1120px)` — the file's only media query |
| Tokens consumed | `moon.css` imported first (`apps/dock/src/app/layout.tsx:4`), then `globals.css` (:5). The header band uses `var(--ink)`, `var(--paper)`, `var(--fg)`, `var(--border)`, `var(--accent)`, `var(--font-display)`, `var(--font-mono)` and the `--s1…--s5` scale; 264 `var(--)` uses vs 31 literal hex values in the whole Dock file, none of them in `.dk-header`/`.dk-nav` | MoonUI components (`Tabs`, `Panel`, `Badge`, `LiveDot`, …) + `cockpit-layout.css` (20 `var(--)` uses, **1** literal `#ffffff` at :225, pre-existing, inside a log-frame rule, not in the shell row) | MoonUI shell classes and primitives; `hq globals.css` 18 `var(--)` uses vs 5 literal hex values (all pre-existing `text-shadow`/panel fills at :68/:77/:113/:156/:278), none in the nav |
| Distinct UX by role (allowed by the gate) | Public editorial: full 15-link nav, drawer under 1041px, no app frame | Fixed app frame, no scrolling page, tablist as the only navigation, tabs scroll horizontally instead of wrapping | Pinned sidebar nav for depth, thin command bar on top, sidebar folds above content at 1120px |

`pnpm ui:check` (root) is the enforcement that keeps this token story honest: it
scans 132 files for rogue hex colours, token drift and duplicate component class
definitions, and reports 0 violations (§4).

---

## §2 The no-clipping contract (stated so it can be tested)

Scope: the Desktop shell band of each app — Dock `.dk-header`/`.dk-nav`, Cockpit
`.cockpit-topbar`/`.cockpit-tabs-bar`, HQ `.m-shell`/`.m-sidebar`/`.m-navbar`.

1. **R1 — no clipped focusable.** Between the app's desktop breakpoint and 1920px
   inclusive, every rendered (non-`display:none`, non-zero-area) focusable element
   of the shell band must satisfy `rect.right <= documentElement.clientWidth` and
   `rect.left >= 0`.
2. **R2 — focus is reachable.** Keyboard `Tab` from the top of the document must
   land on every shell focusable named by R1 while the focus stays inside the
   viewport.
3. **R3 — achieved by wrapping, not by clipping.** A band that cannot shrink to
   fit must resolve by `flex-wrap: wrap` (Dock's answer) or by an explicitly
   scrollable row (Cockpit's `.cockpit-tabs-bar .m-tabs{flex-wrap:nowrap;
   overflow-x:auto}`, `cockpit-layout.css:178-181`). The shell band itself must
   not own an `overflow-x: hidden|clip|auto|scroll` rule: in Dock,
   `html, body { overflow-x: hidden }` (`globals.css:6-10`) makes
   `documentScrollWidth == clientWidth`, so the overflow figures **hide** the
   defect rather than reveal it. That is why R1 is measured on element rects.
4. **R4 — one breakpoint, one owner.** The desktop↔drawer decision lives in exactly
   one `@media (max-width: 1040px)` block in `apps/dock/src/app/globals.css`. No
   component may re-declare it (the header's inline `<style>` did, with
   `!important`; it is gone).
5. **R5 — one nav source, tokens only.** `NAV_LINKS` is the single source for both
   Dock nav surfaces; the shell band declares no colour literal and no second
   hook name.

Enforcement: `apps/dock/test/header-shell-no-clip-contract.test.mjs` (10 tests,
R1/R2 numerically via the recorded band, R3–R5 as source/CSS contracts; it fails
if `flex-wrap: wrap`, the `order: 3` band, the single 1040px owner or the
`NAV_LINKS`-only rule is reverted), plus the pre-existing
`responsive-accessibility.test.mjs` / `mobile-drawer-contract.test.mjs`, plus
`pnpm ui:check` for tokens.

---

## §3 Defect A — before/after, with measured numbers

Defect A as recorded by the visual harness session
(`docs/audit/ui-visual-harness-d54ad43.md`, "Defects captured"): at 1440px the
Dock header nav overflowed, `documentScrollWidth == viewportClientWidth == 1440`
because `overflow-x: hidden` cut the header, while 8 interactive header elements
were laid out past the right edge (`CREW 1416→1464`, `ABOUT 1487→1541`,
`SRC 1555→1589`, `NET 1595→1629`, `JOIN THE CREW 1555→1629`, `a.m-btn 1555→1629`).

**Cause.** `.dk-header` was a non-wrapping flex row and `.dk-nav` sat in it with
`order: 0`, `flex-wrap: nowrap`, `min-width: auto`. The 15 single-word labels
form a 1296px non-shrinkable min-content line, so everything after the nav was
placed beyond the viewport edge — and `overflow-x: hidden` made the page report a
clean 1440px `scrollWidth`.

**After (measured on the running app, port 3111, Chromium at
`--force-device-scale-factor=1`, `/en` and `/id`, fonts settled).**
`headerCut`/`pageCut` count focusable shell elements whose rect leaves the
viewport; `maxRight` is the widest header focusable's right edge:

| vw | docSW | headerCut | pageCut | maxRight | header height | `.dk-nav` | drawer toggle |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1024 | 1024 | 0 | 0 | 1008 | 57 | `none` | `grid` |
| 1041 | 1041 | 0 | 0 | 1004 | 143 | `flex` | `none` |
| 1120 | 1120 | 0 | 0 | 1086 | 143 | `flex` | `none` |
| 1200 | 1200 | 0 | 0 | 1138 | 143 | `flex` | `none` |
| 1280 | 1280 | 0 | 0 | 1248 | 143 | `flex` | `none` |
| 1366 | 1366 | 0 | 0 | 1325 | 106 | `flex` | `none` |
| 1440 | 1440 | 0 | 0 | 1378 | 106 | `flex` | `none` |
| 1600 | 1600 | 0 | 0 | 1538 | 106 | `flex` | `none` |
| 1920 | 1920 | 0 | 0 | 1858 | 106 | `flex` | `none` |

The same table holds unchanged for `/id` (the dense sweep covered
1024/1041/1060/1080/1100/1120/1160/1200/1280/1366/1440/1512/1600/1680/1920 × en+id
= 30 runs, all `headerCut=0`, `pageCut=0`). The nav band is `28 → 1324` from
1366px up, i.e. 1296px wide, and wraps to two rows below that.

**Focus reachability (R2), same server:** `Tab` walks 22 header focusables at
1041, 1200, 1440 and 1920 with `outsideViewport=0` at each width.

**Counterfactual — Defect A reproduced without touching any repo file** (the
pre-`724fb15` rules injected at runtime into the live page:
`.dk-header{flex-wrap:nowrap!important}.dk-nav{order:0!important;
flex-wrap:nowrap!important;min-width:auto!important;gap:26px!important}`):

| vw | as shipped (clipped / visible=22) | pre-fix rules (clipped) | pre-fix samples |
| --- | --- | --- | --- |
| 1041 | 0 | 13 | `TIMELINE 981→1053`, `PATCHES 1076→1145`, `DENPA 1168→1219`, `STUDIO 1242→1302`, `ARCHIVE 1325→1393`, `CREW 1416→1464`, `ABOUT 1487→1541`, `ID 1555→1589` |
| 1200 | 0 | 11 | `DENPA 1168→1219` … `CREW 1416→1464`, `ABOUT 1487→1541`, `ID 1555→1589`, `EN 1595→1629`, CTA `1555→1629` |
| 1440 | 0 | **8** | `CREW 1416→1464`, `ABOUT 1487→1541`, `ID 1555→1589`, `EN 1595→1629`, CTA `1555→1629`, `SRC 1555→1589`, `NET 1555→1589`, `a.m-btn JOIN THE CREW 1555→1629` — element-for-element the set the harness documented |
| 1920 | 0 | 0 | the nowrap row only overflows below ~1620px |

In every reverted case `docSW` still read exactly `vw`, which is the masking
effect R1/R3 name: rect measurement, not `scrollWidth`, is the evidence.

**Attribution (honest).** The wrapping fix itself is already in HEAD: it came
from `2d223fc` (an ancestor of the brief's `47b89f4`) whose `.dk-header`/`.dk-nav`
hunks were swept into `724fb15`. Independently corroborated by the other session's
live-hub run recorded in `docs/audit/screens/geometry.json`
(`maxInteractiveElementsOutsideViewport: 0`). So Defect A was closed before this
session began; my change does not re-fix it, it **documents and pins** it:

- `.dk-header` and `.dk-nav` comments now carry the measured band (§3 numbers)
  and the "header owns no `overflow-x` rule" clause (`globals.css:20-56`);
- the duplicate 1040px breakpoint in `shell.tsx`'s inline `<style>` (with four
  `!important`s) is deleted; `.dk-mobile-menu-toggle{display:none}` moved to
  `globals.css:713` as the base rule and `display:grid` into the single 1040px
  block at `:779` — one breakpoint, one owner, no `!important` (R4);
- the comment's "16 labels" figure from the harness doc is corrected to 15 (§6);
- `header-shell-no-clip-contract.test.mjs` fails if any of the above regresses.

---

## §4 `pnpm ui:check` after the change

Literal output of the last four checks plus the summary line (root):

```
🧩 CHECK 3: Duplicate Component Classes in App Stylesheets
  ✔ PASS: No duplicate component classes detected in local app stylesheets.

🔤 CHECK 4: Font & Typography Consistency
  ✔ PASS: All typography uses standardized font design tokens.

═══════════════════════════════════════════════════════════════════════
Files scanned: 132 | Total Violations: 0
═══════════════════════════════════════════════════════════════════════

✨ Monorepo UI consistency check PASSED! All apps are 100% unified with @moonwitness/moonui.
```

Checks 1 and 2 (rogue hex colours / token drift) also reported `✔ PASS` in the
same run. DoD "`ui:check` zero" is met: **132 files, 0 violations**.

---

## §5 "No second nav" verification

| App | `nav`-bearing elements in the shell, counted from the rendered DOM/source | Verdict |
| --- | --- | --- |
| Dock | `nav.dk-nav` (`shell.tsx:198`) + `nav.dk-mobile-nav` (`shell.tsx:288`) — the second lives inside `div#dk-mobile-menu[role="dialog"][aria-modal="true"]` (`shell.tsx:254`) and is `hidden` until the trigger opens it. Both `NAV_LINKS.map(...)` (`shell.tsx:199` and `:293`, exactly two occurrences of that call), so both project one source, and the test asserts `NAV_LINKS.length === 15` and anchor parity with it | One nav, one data source. The drawer is the same nav in a dialog at a different viewport — not a second navigation surface |
| Cockpit | No `nav` element at all in the shell; navigation is `div.m-tabs[role="tablist"]` from MoonUI (`nav.tsx:103`), built once from `cockpitTabs` (`App.tsx:522`); `aside.cockpit-sidebar` (`CockpitSidebar.tsx:24`) holds service state/rack controls, not links | One navigation surface |
| HQ | `nav.m-stack[aria-label="Primary"]` (`moonui/src/nav.tsx:22`) via `SideNav` (`vertical.tsx:58`) is the only nav; `header.m-navbar` (`vertical.tsx:83`) is breadcrumbs + user/search chrome | One navigation surface |
| Cross-app | No app renders another app's nav; Dock's 15 links are public-surface only, Cockpit's tabs are operator panes, HQ's sidebar is the internal route tree — the "distinct UX by role" the gate allows | Roles stay distinct; nothing was merged or duplicated |

---

## §6 Honest limits

- **Measurement vs source reading.** Dock's contract (R1, R2) is measured on the
  running app (`/en`, `/id`, 30 viewport/locale runs + the counterfactual).
  Cockpit and HQ in §1/§5 are **read from source only**: I did not boot them, so
  their no-clipping posture is not evidenced by rect measurement in this file.
  Cockpit's app frame uses `overflow: hidden` at the shell
  (`cockpit-layout.css:19`) with wrapping clusters and a scrollable tab row —
  a different, deliberate answer to the same contract; HQ declares no
  `overflow-x` rule on the shell at all. If the Owner wants measured proof for
  those two, that is a follow-up run, not this one.
- **15, not 16.** The harness doc and my earlier notes say the Dock nav has 16
  single-word labels. It has **15** (`NAV_LINKS`, `shell.tsx:27`; also 15 at the
  harness baseline `bb75126`), verified by the rendered anchor count. The 1296px
  band and the clipping arithmetic are unaffected — the geometry is measured, not
  derived from the count — but the number in `ui-visual-harness-d54ad43.md` is
  off by one and I did not edit that file (not in my write scope).
- **Measured range.** 1024–1920 only. Above 1920 and between 900–1040 (drawer
  territory, `@media (max-width: 1040px)`) the contract is not claimed by
  measurement; below 1041px the desktop nav is `display: none` by design, which
  is why R1 starts at 1041.
- **Masking caveat.** Because `html, body { overflow-x: hidden }` is pinned by a
  pre-existing test (`responsive-accessibility.test.mjs`), a future regression
  will still show `docSW == vw`. Only the rect-based assertion in
  `header-shell-no-clip-contract.test.mjs` and the live harness geometry capture
  it; `ui:check` does not measure layout at all.
- **Webfont timing.** Each run waited 1.2–1.8s after `load` for the display font.
  Measurements describe the fonts-settled state; a font-loading failure would
  change label widths and is not covered.
- **`home-offline.test.mjs` not run** (port 3001 belongs to the operator);
  no repo-wide `pnpm lint`/`pnpm test`/`pnpm verify`/`next build`; no
  `scripts/ui/*` harness; `docs/audit/screens/**` untouched, including
  `docs/audit/screens/geometry.json`, which I read as corroboration only.
- **HEAD moved** from `7d2e9d8` to `93985d5` while I worked (other sessions
  committed orbit + HQ login). The final Dock runs above are at `93985d5`;
  the `tsc --noEmit` run and the 205-test suite run are at `7d2e9d8`.
- **I did not tick the gate.** `todo-ui-2.md`, `todo-ui-2`'s neighbours and
  `TODO.md` were not edited by me; UI2-G05's DoD is for the Owner to verify
  against this evidence.
