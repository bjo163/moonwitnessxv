# M19-03 — Public IA and responsive search flows: audit

**Task:** M19-03 (parent row `TODO.md:452`, acceptance *"Reader not buried under 30 equal nav labels"*).
**Baseline:** branch `dev`, HEAD `a54198bd04705ba191c79e0bd1b36584a885622a` (`a54198b`), read 2026-10-27.
**Prerequisites verified:** M08-02 checked at `TODO.md:248`; M19-02 closed at `ed3561a` (`TODO.md:451`).
**Artifacts:** [design](../design/M19-03-public-ia.md), this audit.
**Files changed:** `docs/design/M19-03-public-ia.md`, `docs/audit/M19-03-public-ia.md`. No application file, test, TODO row or config was touched.

---

## 1. Baseline and worktree state (recorded before reading)

```text
$ git rev-parse HEAD
a54198bd04705ba191c79e0bd1b36584a885622a
$ git branch --show-current
dev
$ git status --porcelain | wc -l
76
```

Another session is actively editing the tree, so the count moved from 69 to 76 during this leaf. Dock-owned dirty paths observed at read time:

```text
 M apps/dock/next-env.d.ts
 M apps/dock/src/app/globals.css
 M apps/dock/src/ui/components/constellation.tsx
 M apps/dock/src/ui/copy/constellation-copy.ts
 M apps/dock/test/responsive-accessibility.test.mjs
 M apps/dock/test/ui2-p15-graph-projection-inventory.test.mjs
```

`apps/dock/src/ui/components/shell.tsx`, `spaces.tsx`, `locale-switcher.tsx`, `src/layouts/site.tsx`, every `src/app/**/page.tsx` and `src/lib/landing-copy.ts` were **clean** at read time (the only dirty file under `src/app` is `globals.css`), so their line numbers are identical to `a54198b`. `globals.css` is dirty (+4 lines, hunks at worktree 1711 and 2300), so **every CSS citation in the design doc is resolved against the baseline blob**, not the worktree:

```text
$ git show a54198b:apps/dock/src/app/globals.css > /tmp/base.css
$ grep -n "max-width: 1040px\|^\.dk-space-grid {\|prefers-reduced-motion" /tmp/base.css
755:@media (max-width: 1040px) {
2285:.dk-space-grid {
2468:@media (prefers-reduced-motion: reduce) {
```

---

## 2. Commands executed (read-only) and observed output

No build, no test, no dev server, no browser. Only `git`, `find`, `ls`, `grep`, `sed`, `python` (string substitution inside the two docs) were used.

| # | Command | Observed output |
|---|---|---|
| 1 | `find apps/dock/src/app -name page.tsx \| wc -l` | `20` |
| 2 | `find apps/dock/src/app -name page.tsx \| sort` | 20 paths from `app/page.tsx` to `app/timeline/page.tsx` (listed in design §1.1) |
| 3 | `grep -c "label: '" apps/dock/src/ui/components/shell.tsx` | `15` |
| 4 | `grep -n "label: '" apps/dock/src/ui/components/shell.tsx` | 15 rows, lines 28–42: `HOME, SIGNALS, READER, TERMS, FIGURES, CONSTELLATION, RESEARCH, PRISMS, TIMELINE, PATCHES, DENPA, STUDIO, ARCHIVE, CREW, ABOUT` |
| 5 | `grep -c "NAV_LINKS.map(" apps/dock/src/ui/components/shell.tsx` | `2` (desktop `:199`, drawer `:293`) |
| 6 | `grep -c "<nav" apps/dock/src/ui/components/shell.tsx` | `2` (`nav.dk-nav` `:198`, drawer `nav.dk-mobile-nav` `:288`) + `LocaleSwitcher`'s own `nav` = 3 nav landmarks per document |
| 7 | `grep -rn "\.primary" apps/dock/src` | no match, exit 1 — the `primary` field is declared at `shell.tsx:24` and set on 6 rows but never dereferenced |
| 8 | `grep -c "label: 'READER'" apps/dock/src/ui/components/shell.tsx` | `1` |
| 9 | `grep -c "href: '/reader'" apps/dock/src/ui/components/shell.tsx` | `1` |
| 10 | `grep -c "<input" apps/dock/src/ui/components/shell.tsx` | `0` (no header search field) |
| 11 | `grep -rnE "href=[^>]*(headquarters\|cockpit\|skylink\|echolog\|3002\|5173\|/admin\|/hq)" apps/dock/src \| wc -l` | `0` |
| 12 | `grep -rniE "headquarters\|cockpit\|arsy\|skylink\|echolog\|orbit" apps/dock/src` | only decorative text: `.dk-moon-orbit-tag` (`globals.css`), `orbitWitnesses`/`archiveOrbitNote` copy, `sections.tsx:258-259,309`. No link, route or hostname |
| 13 | `grep -rn "role=\"search\"" apps/dock/src \| wc -l` | `4` — `missions/page.tsx:90`, `reader/page.tsx:94`, `terms/page.tsx:141`, `terms/page.tsx:211`; `stations/page.tsx:80` is a plain `<form>` |
| 14 | `grep -rn "skip" apps/dock/src \| wc -l` | `4`, all in `ui/client/Player.tsx` session-skip logic — **no skip link exists** |
| 15 | `grep -n "<main" apps/dock/src/layouts/site.tsx` | `22: <main className="dk-main">{children}</main>` — no `id`, no `tabIndex` |
| 16 | `grep -n "href: localizedDockHref" apps/dock/src/ui/components/spaces.tsx` | `/reader` `:113`, `/terms` `:123`, `/studio` `:133`, `/stations` `:144` |
| 17 | `grep -n "<SpaceGrid" apps/dock/src/app/page.tsx` | `50:` (offline branch), `58:` (live branch) |
| 18 | `grep -n "errorResearchUnavailable\|Alert tone" apps/dock/src/app/research/page.tsx` | `28: <Alert tone="hot">{copy.errorResearchUnavailable}</Alert>` — the whole page body |
| 19 | `for r in reader terms stations studio schedule figures missions constellation research prisms timeline patches denpa; do [ -f apps/dock/src/app/$r/page.tsx ] && echo "OK /$r"; done` | 13 `OK` lines — reproduced in §3.1 |
| 20 | `git diff -U0 a54198b -- apps/dock/src/app/globals.css` | 4 insertions: `@@ -1710,0 +1711,3 @@` (`max-height/overflow-y/overflow-wrap`) and `@@ -2296,0 +2300 @@` (`overflow-wrap`) |
| 21 | `ls apps/dock/src/app` | 7 route dirs with pages + `api` + framework files: `constellation denpa embed figures missions patches prisms reader research schedule stations studio terms timeline` + `page.tsx error.tsx global-error.tsx loading.tsx not-found.tsx layout.tsx manifest.ts sitemap.ts globals.css` |
| 22 | `ls docs/design` | 11 entries before this leaf, now including `M19-03-public-ia.md` |

---

## 3. Positive evidence

### 3.1 Every route named in the target hierarchy exists today

```text
OK  /reader -> apps/dock/src/app/reader/page.tsx
OK  /terms -> apps/dock/src/app/terms/page.tsx
OK  /stations -> apps/dock/src/app/stations/page.tsx
OK  /studio -> apps/dock/src/app/studio/page.tsx
OK  /schedule -> apps/dock/src/app/schedule/page.tsx
OK  /figures -> apps/dock/src/app/figures/page.tsx
OK  /missions -> apps/dock/src/app/missions/page.tsx
OK  /constellation -> apps/dock/src/app/constellation/page.tsx
OK  /research -> apps/dock/src/app/research/page.tsx
OK  /prisms -> apps/dock/src/app/prisms/page.tsx
OK  /timeline -> apps/dock/src/app/timeline/page.tsx
OK  /patches -> apps/dock/src/app/patches/page.tsx
OK  /denpa -> apps/dock/src/app/denpa/page.tsx
```

The target's four primary labels (`READ`, `EXPLORE`, `SIGNAL`, `CREATE`) and all nine secondary entries map onto these 13 existing pages plus depth routes already in the tree (`/reader/compare`, `/terms/[stableId]`, `/stations/[id]`, `/figures/[figureCode]`, `/constellation/relations/[relationCode]`). **No invented page appears in the design.** `/embed/[id]` is excluded by design (`noindex`, framing-only). The four primaries are exactly the four spaces of [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) §2.2 and the existing `SpaceGrid` copy (`spaces.tsx:104-149`, `landing-copy.ts:84-91`), so header and home entry agree.

### 3.2 The "30 labels" number is measured, not rhetorical

- 15 labels × 2 mapping surfaces = **30 equal-weight nav anchors** in one document (`grep` rows 3–6; the duplication is asserted by `apps/dock/test/header-shell-no-clip-contract.test.mjs:231`, and `NAV_LINKS.length === 15` at `:233` and `header-navigation-semantics.test.mjs:270`).
- Equal weight is structural, not stylistic: `primary` is never read (row 7), and `.dk-nav a` applies one rule to all rows (`globals.css:62-77`).
- Target: **4 primary destination labels per surface = 8 anchors**, everything else inside one grouped disclosure. The design states the rule as "no more than four equal-weight primary destination labels; a fifth control may only be a disclosure".

### 3.3 Reader is genuinely first-class in the target

`READ` is first in the nav, first in the home grid (`spaces.tsx:104-119`, tone `accent`), and the hero's second CTA already points at `/reader` (`shell.tsx:415`). The design does not introduce a ranking by colour or size — it shrinks the competing list from 15 to 4 and puts Reader first in each.

### 3.4 Existing guards the target must keep green (not run — see §6)

`landmarks.test.mjs` (one `nav`/`h1` per composed page, no nested `SiteLayout`), `header-navigation-semantics.test.mjs` (`aria-current="page"` on exactly one link, locale-prefixed hrefs, drawer ARIA), `header-shell-no-clip-contract.test.mjs` (one `NAV_LINKS` source, no colour literals in `.dk-nav`), `home-spaces.test.mjs` (no header `<input>`, no `01/12` counter, `SpaceGrid` on both home branches), `space-grid.test.mjs` (every card href → real page, `REAL|PLANNED|DEMO` only), `responsive-accessibility.test.mjs` (reduced motion + overflow).

---

## 4. Negative evidence

1. **No private surface is reachable from public nav.** Command row 11 returns `0` matches for `headquarters|cockpit|skylink|echolog|3002|5173|/admin|/hq` in any `href`. Row 12 finds only the decorative word "orbit" in zine copy and a CSS class, never a route or host. There is no session, account, billing or reviewer link in `shell.tsx`; the only external origin in Dock source is `Player`'s ambient stream (`ui/client/Player.tsx:24`), which is audio, not navigation. The design restates this as a hard boundary.
2. **No duplicate equal-weight Reader entry.** `label: 'READER'` occurs once (row 8) and `href: '/reader'` once inside `NAV_LINKS` (row 9); the second `/reader` references are the hero CTA (`shell.tsx:415`) and the home `READ` card (`spaces.tsx:113`), which are a CTA and an entry card, not nav labels. The target keeps exactly one `READ` label per surface.
3. **No dead search affordance is introduced.** The header still has zero `<input>` (row 10) and the design forbids a global field (ADR-0009 §2.3). Conversely the audit records an existing mislabel: the `SRC` anchor at `shell.tsx:221` uses `copy.navSearchLabel` (*"Search signals"* / *"Cari sinyal"*, `landing-copy.ts:98,208`) as an accessible name for a navigation link. That is flagged as PLANNED work, not as a feature.
4. **No second navigation landmark is proposed.** The target replaces rows inside the existing `NAV_LINKS` and adds one disclosure; it does not add a rail, mega-menu or extra `<nav>` (`shell.tsx` currently renders 2 `<nav>` elements plus the switcher's, and `landmarks.test.mjs` fails on duplication).
5. **The design makes no claim that a planned surface is live.** `RESEARCH` is demoted because its page body is one withholding `Alert` (row 18) while M19-19/M34-04 remain open; `CREATE` carries `DEMO` in words, matching `space-grid.test.mjs` ("CREATE is the only DEMO space and names its blocker").

---

## 5. Still PLANNED (no code in this leaf)

- 4-label `NAV_LINKS` + grouped `INDEX` disclosure replacing 15 labels — needs an authorized implementation leaf (M19-13 follow-up); `shell.tsx` was left untouched.
- Skip link and `<main id="main" tabIndex={-1}>` — M19-04.
- `role="search"` on the `/stations` filter form for parity with reader/terms/missions — M19-04.
- Renaming the `SRC` anchor's accessible name away from "Search signals" — M19-13 follow-up.
- Breadcrumbs on `/prisms`, `/timeline` and a page header on `/studio` — M19-13 follow-up.
- Consuming `MOON_EXPERIENCES.reader`/`.research` at a layout boundary (M19-02 tokens are defined, not adopted).
- Geometry and screenshot evidence at 390/768/1440/1920 in `id` and `en` — M19-06; screenshots remain environment-blocked per ADR-0009 §2.6.

---

## 6. Limitations and what was deliberately not done

- **No application build or test was run.** The worktree is concurrently modified by another session (Dock `globals.css`, `constellation.tsx`, `constellation-copy.ts` and two Dock test files are dirty), so any green result would not be attributable to this leaf. Every finding above is static, read-only inspection at `a54198b` plus the observed worktree.
- **No browser, no rendered DOM, no screenshot, no accessibility certification.** The 30-label count is derived from the two `NAV_LINKS.map` call sites and the test that asserts 15 rows; it was not counted in a live DOM.
- **Static markup vs runtime:** `apps/dock/test/header-navigation-semantics.test.mjs` renders `SiteHeader` through `ts.transpileModule`, and the drawer is `hidden` at rest; a runtime-only defect (e.g. sticky-header overlap at an intermediate width) would not appear here.
- **Dock files are owned by another active session**, so no code, test or CSS was changed even where the design proposes a change.
- **`TODO.md` was not edited by this leaf** (`TODO.md` was already dirty at read time from the other session); the M19-03 row remains unchecked, and this leaf does not close the parent. Acceptance still needs the header change plus M19-04 keyboard evidence and M19-06 geometry.
- Line numbers for `globals.css` are baseline-resolved (§1); line numbers for dirty Dock files would drift with the other session's edits.

---

## 7. Rollback

Documentation-only change:

```bash
git rm docs/design/M19-03-public-ia.md docs/audit/M19-03-public-ia.md
```

No runtime artefact, migration, flag or schema exists to revert, and no application file was modified.

---

## 8. Verdict

**READY-TO-CLOSE for the design/audit leaf; parent row stays open.** The leaf delivers the public IA map, the measured label count (30 anchors from 15 labels × 2 surfaces), the target four-label hierarchy grounded entirely in existing routes, the responsive/keyboard/reduced-motion/offline flow, and the private-surface boundary. Closing the parent acceptance requires the authorized header change plus M19-04 and M19-06 evidence.
