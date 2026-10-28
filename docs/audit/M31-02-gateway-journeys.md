# M31-02 — Gateway journeys: evidence record

**Task:** M31-02 — Design gateway journeys and available/planned states ([packet](../tasks/M31/M31-02.md)).
**Deliverable:** [design specification](../design/M31-02-gateway-journeys.md).
**baseline_sha:** `a54198bd04705ba191c79e0bd1b36584a885622a` (`dev`, verified with `git rev-parse HEAD`).
**worker:** implementation agent (single leaf session).
**claimed_files:** `docs/design/M31-02-gateway-journeys.md`, `docs/audit/M31-02-gateway-journeys.md`.
**actual_changed_files:** the same two files, both newly created. No application, test, TODO, decision or milestone file was touched.
**result:** READY-TO-CLOSE pending integrator review — design artifact complete with positive and negative static evidence; no code, browser or deployment claim.

`TODO.md` is the only task/status register. Nothing below closes M31 or its sibling leaves, and the parent milestone is not implemented by this artifact.

## 1. Working-tree state preserved

The worktree already held another session's uncommitted work before this task started: `git status --short | wc -l` observed 75 entries at task start, including modified `apps/dock/src/app/globals.css`, `apps/dock/src/ui/components/constellation.tsx`, `apps/dock/test/responsive-accessibility.test.mjs` and untracked Dock/Cockpit/HQ files. A concurrent session continued adding untracked documentation while this task ran, so that count is not stable; none of the concurrent changes belong to this task. None of it was edited, reverted, staged or committed by this task.

Consequence for citation hygiene: line numbers in this record are pinned to `a54198b` via `git show`/`git ls-tree`/`git grep` wherever the file is dirty in the worktree (`globals.css` reduced-motion block sits at `:2468` at baseline and `:2472` in the dirty worktree). Clean files were read directly and match baseline; the route inventory was taken from the baseline tree, not from the working directory.

## 2. Commands executed and observed output

All commands were read-only Git and ripgrep queries run from `Z:\project\moonradio`. No application script, package script, test runner, dev server, build, browser or deployment command was executed.

### E1 — baseline identity

```
$ git rev-parse HEAD
a54198bd04705ba191c79e0bd1b36584a885622a
$ git branch --show-current
dev
$ git status --short | wc -l
75
```

The 75 entries observed at task start are another session's uncommitted work (modified application, test and screenshot files, untracked files under `apps/` and `docs/`); `docs/design/M31-02-gateway-journeys.md` and `docs/audit/M31-02-gateway-journeys.md` are this task's only additions.

### E2 — every page route at baseline (positive inventory)

```
$ git ls-tree -r --name-only a54198b -- apps/dock/src/app | rg 'page\.tsx$'
apps/dock/src/app/constellation/page.tsx
apps/dock/src/app/constellation/relations/[relationCode]/page.tsx
apps/dock/src/app/denpa/page.tsx
apps/dock/src/app/embed/[id]/page.tsx
apps/dock/src/app/figures/[figureCode]/page.tsx
apps/dock/src/app/figures/page.tsx
apps/dock/src/app/missions/page.tsx
apps/dock/src/app/page.tsx
apps/dock/src/app/patches/page.tsx
apps/dock/src/app/prisms/page.tsx
apps/dock/src/app/reader/compare/page.tsx
apps/dock/src/app/reader/page.tsx
apps/dock/src/app/research/page.tsx
apps/dock/src/app/schedule/page.tsx
apps/dock/src/app/stations/[id]/page.tsx
apps/dock/src/app/stations/page.tsx
apps/dock/src/app/studio/page.tsx
apps/dock/src/app/terms/[stableId]/page.tsx
apps/dock/src/app/terms/page.tsx
apps/dock/src/app/timeline/page.tsx
$ git ls-tree -r --name-only a54198b -- apps/dock/src/app | rg -c 'page\.tsx$'
20
$ git ls-tree -r --name-only a54198b -- apps/dock/src/app | rg 'layout\.tsx$'
apps/dock/src/app/layout.tsx
```

Observed: **20 `page.tsx` routes plus one root `layout.tsx`**. No route was invented in the design document.

### E3 — nav items at baseline

```
$ git show a54198b:apps/dock/src/ui/components/shell.tsx | rg -n "href: '"
28:  { href: '/', label: 'HOME', primary: true },
29:  { href: '/stations', label: 'SIGNALS', primary: true },
30:  { href: '/reader', label: 'READER', primary: true },
31:  { href: '/terms', label: 'TERMS', primary: true },
32:  { href: '/figures', label: 'FIGURES' },
33:  { href: '/constellation', label: 'CONSTELLATION' },
34:  { href: '/research', label: 'RESEARCH', primary: true },
35:  { href: '/prisms', label: 'PRISMS' },
36:  { href: '/timeline', label: 'TIMELINE' },
37:  { href: '/patches', label: 'PATCHES' },
38:  { href: '/denpa', label: 'DENPA' },
39:  { href: '/studio', label: 'STUDIO' },
40:  { href: '/schedule', label: 'ARCHIVE', primary: true },
41:  { href: '/#constellation', label: 'CREW' },
42:  { href: '/#zine-poster', label: 'ABOUT' },
$ git show a54198b:apps/dock/src/ui/components/shell.tsx | rg -c "href: '"
15
```

Observed: 15 nav entries = 13 Dock-relative routes + 2 home anchors. `/missions`, `/reader/compare` and `/embed/[id]` exist as routes but are **not** in the nav, which matches the design's "secondary surface" labelling.

### E4 — all href expressions in the public shell

```
$ git grep -n "href=" a54198b -- apps/dock/src/ui/components/shell.tsx
a54198b:apps/dock/src/ui/components/shell.tsx:19:// Canonical destination routes preserved for verify drills: href="/terms", href="/constellation", href="/reader", href="/stations"
a54198b:apps/dock/src/ui/components/shell.tsx:195:      <BrandLogo href={localizedDockHref('/', '', '', initialLocale)} size="md" />
a54198b:apps/dock/src/ui/components/shell.tsx:205:              href={href}
a54198b:apps/dock/src/ui/components/shell.tsx:220:          href={localizedDockHref('/stations', '', '', initialLocale)}
a54198b:apps/dock/src/ui/components/shell.tsx:228:          href={localizedDockHref('/', '', '#constellation', initialLocale)}
a54198b:apps/dock/src/ui/components/shell.tsx:235:        <LinkButton href="#join-crew" variant="paper" size="sm">
a54198b:apps/dock/src/ui/components/shell.tsx:277:          <BrandLogo href={localizedDockHref('/', '', '', initialLocale)} size="md" />
a54198b:apps/dock/src/ui/components/shell.tsx:299:                href={href}
a54198b:apps/dock/src/ui/components/shell.tsx:312:          <LinkButton href="#join-crew" variant="paper" size="sm" onClick={closeMenu}>
a54198b:apps/dock/src/ui/components/shell.tsx:347:          <LinkButton href={localizedDockHref('/stations', '', '', initialLocale)} variant="paper" size="md">
a54198b:apps/dock/src/ui/components/shell.tsx:411:            <LinkButton href={localizedDockHref('/stations', '', '', locale)} variant="primary" size="md">
a54198b:apps/dock/src/ui/components/shell.tsx:415:            <LinkButton href={localizedDockHref('/reader', '', '', locale)} variant="paper" size="md">
```

Observed: every shell destination is a locale-built Dock-relative path or a same-page anchor (`#join-crew`); there is no absolute URL, protocol-relative URL or cross-app host in the public chrome.

### E5 — space statuses actually rendered on the home grid

```
$ git show a54198b:apps/dock/src/ui/components/spaces.tsx | rg -n "status: '"
110:      status: 'REAL',
120:      status: 'REAL',
130:      status: 'DEMO',
141:      status: 'REAL',
```

Observed: four cards, `REAL`/`REAL`/`DEMO`/`REAL`. The `PLANNED` word exists in both copy catalogs (`apps/dock/src/lib/landing-copy.ts:95,205`) but **no card exercises it**; the design document records that gap instead of implying planned cards already ship.

### E6 — negative: no private-surface reference inside Dock

```
$ git grep -n -i -E "headquarters|cockpit|/admin|arsy|skylink|echolog" a54198b -- apps/dock/src
exit=1
```

Observed: **no matches (exit 1)** across the whole Dock source tree. Outside `src`, the only Headquarters mention in the Dock app is the build-time comment `apps/dock/next.config.mjs:6` describing shared header vocabulary with `@moonwitness/web-config`; it is a comment, not a route, link or rewrite.

### E7 — negative: no login/account/newsletter surface in Dock

```
$ git grep -n -i -E "sign ?in|log ?in|/account|newsletter|subscribe|password|cookie" a54198b -- apps/dock/src
apps/dock/src/lib/locale-context.mjs:51…85   (locale preference helpers)
apps/dock/src/middleware.ts:31,39,41,65,73,75 (reads mw_locale cookie to negotiate locale)
apps/dock/src/ui/components/locale-switcher.tsx:35
apps/dock/src/lib/provenance-copy.ts:250     (Indonesian sentence containing "tersimpan")
```

Observed (abridged: repeated locale-cookie hits on adjacent lines are summarized): every hit is locale-preference plumbing for `mw_locale` (`Path=/; Max-Age=31536000; SameSite=Lax`, `locale-context.mjs:85`) or an unrelated Indonesian word. There is **no** sign-in, account, password, newsletter or subscription surface. This grounds journey J16 as PLANNED.

### E8 — sitemap route list (what the app itself declares public)

```
$ git show a54198b:apps/dock/src/app/sitemap.ts | rg -n "^  '/"
18:  '/stations',
19:  '/schedule',
20:  '/missions',
21:  '/reader',
22:  '/reader/compare',
23:  '/terms',
24:  '/figures',
25:  '/constellation',
26:  '/research',
27:  '/prisms',
28:  '/timeline',
29:  '/patches',
30:  '/denpa',
31:  '/studio',
```

Observed: 14 non-root routes (`/stations`, `/schedule`, `/missions`, `/reader`, `/reader/compare`, `/terms`, `/figures`, `/constellation`, `/research`, `/prisms`, `/timeline`, `/patches`, `/denpa`, `/studio`). `/embed/*` and dynamic detail routes are absent. The design does not treat the sitemap as a privacy guarantee; `/research` is listed although it renders only a withholding notice.

### E9 — negative: no service worker / offline cache

```
$ git grep -n -E "serviceWorker|service worker" a54198b -- apps/dock/src
apps/dock/src/app/manifest.ts:11: * This is installability only. Offline catalog browsing would need a service worker,
```

Observed: the only occurrence is the comment stating that offline catalog browsing is deliberately not implemented. Journey J20 is therefore PLANNED (and marked "not planned") rather than described as an offline mode.

### E10 — what owns the header's responsive switch (for the search-flow table)

```
$ git show a54198b:apps/dock/src/app/globals.css | rg -n "dk-icon-btn|dk-locale-switcher"
84:.dk-icon-btn {
100:.dk-locale-switcher {
105:.dk-locale-switcher a[aria-current='true'] {
109:.dk-locale-switcher a:focus-visible {
115:.dk-icon-btn:focus-visible,
711:   two owners for one breakpoint. Declared after `.dk-icon-btn` (which also sets
$ git show a54198b:apps/dock/src/app/globals.css | sed -n '755,784p'   # abridged below: only the selector lines of interest
755:@media (max-width: 1040px) {
767:  .dk-nav {
768:    display: none;
769:  }
780:  .dk-mobile-menu-toggle {
781:    display: grid;
782:  }
784:  .dk-mobile-drawer .dk-nav,
```

Observed: the 1040 px block hides `.dk-nav` and reveals `.dk-mobile-menu-toggle`; it contains no `display` rule for `.dk-icon-btn` or `.dk-locale-switcher`. The `SRC` link therefore stays in the DOM at narrow widths, but whether the utility row fits without clipping at 320–390 px was **not measured**, and the design document says so.

## 3. Positive evidence — every AVAILABLE journey maps to a real line

| Journey rows (design §3) | Grounding at `a54198b` |
|---|---|
| J1 entry negotiation | `apps/dock/src/middleware.ts:29-43` |
| J2 localized rewrite + `<html lang>` | `apps/dock/src/middleware.ts:44-58`, `apps/dock/src/app/layout.tsx:22-32` |
| J4 header brand, nav, locale switch | `apps/dock/src/ui/components/shell.tsx:194-217`, `apps/dock/src/ui/components/locale-switcher.tsx:24-84` |
| J5 four spaces | `apps/dock/src/ui/components/spaces.tsx:19-38,102-146` |
| J7 mobile drawer | `apps/dock/src/ui/components/shell.tsx:124-181,239-316`; `apps/dock/src/app/globals.css:755-784` |
| J8 reader | `apps/dock/src/app/reader/page.tsx:18,94-105`; `apps/dock/src/ui/components/reader.tsx:142-166,194-196` |
| J9 discovery surfaces | `apps/dock/src/app/terms/page.tsx:47,141-143`; `terms/[stableId]/page.tsx:15`; `figures/page.tsx:17`; `constellation/page.tsx:25`; `ui/components/states.tsx:26-68` |
| J10 research denial notice | `apps/dock/src/app/research/page.tsx:14,28` |
| J12 comparative reader denial | `apps/dock/src/app/reader/compare/page.tsx:14,30` |
| J13 per-surface search | `stations/page.tsx:27,80-101`; `terms/page.tsx:141-143`; `missions/page.tsx:90-92`; `reader/page.tsx:94-105` |
| J15 join banner | `apps/dock/src/ui/components/shell.tsx:235,312,328-350` |
| J18 degraded home | `apps/dock/src/app/page.tsx:25-41,49-50`; `landing-copy.ts:11,121` |
| J19 route-level states | `apps/dock/src/app/loading.tsx:9`; `error.tsx:9-30`; `not-found.tsx:8-30`; `ui/components/states.tsx:26-68` |
| J21 bad URL / locale segment | `middleware.ts:34,47`; `not-found.tsx:8` |

Existing automated checks that already encode related rules (read, **not executed** here): `apps/dock/test/space-grid.test.mjs` (status enum + route existence), `home-spaces.test.mjs`, `landmarks.test.mjs`, `header-navigation-semantics.test.mjs`, `mobile-drawer-contract.test.mjs`, `header-shell-no-clip-contract.test.mjs`, `research-public-withholding.test.mjs`, `reader-rights.test.mjs`, `home-offline.test.mjs`, `responsive-accessibility.test.mjs` (this last file is dirty in the worktree; only its committed form at `a54198b` was inspected).

## 4. Negative evidence summary

1. **No private-surface link in the public chrome.** E6 returned zero matches for Headquarters, Cockpit, `/admin`, ARSY, SKYLINK and ECHOLOG across `apps/dock/src`; E4 shows the shell only emits locale-built Dock paths and one same-page anchor.
2. **No identity, account or newsletter affordance.** E7 returned only locale-preference cookie plumbing; journey J16 is PLANNED.
3. **No offline catalog.** E9 shows the deliberate absence of a service worker; journey J20 is PLANNED.
4. **No global search.** `ADR-0009` §2.3 rejects a decorative global field; the header `SRC` control is a link to `/stations` (`shell.tsx:219-226`), and no cross-surface query endpoint exists; journey J14 is PLANNED.
5. **No domain or deployment claim.** Canonical origin resolves from environment/`FRONTEND_URLS.dock` (`apps/dock/src/app/sitemap.ts:7-12`, `apps/dock/src/lib/metadata.ts:13,48`); journey J3 is PLANNED.
6. **Withheld content stays withheld.** `research/page.tsx:28` and `reader/compare/page.tsx:30` render the localized denial notice (`states-copy.ts:113,271`); the reader never renders rights-blocked text (`reader.tsx:144-166,194-196`).

**Dynamic and server-gated links.** The static check above covers routes, nav, footer and page chrome. It cannot cover Hub-sourced outbound URLs: the home world-monitor renders `sig.url` (`apps/dock/src/app/page.tsx:112-119`) and the player receives a Hub-provided `streamUrl` (`page.tsx:178-184`). Those values were not fetched or dereferenced, so this record makes no claim about their targets; the design document requires a gateway preview to allow-list or omit them and assigns the executable check to M31-05. No server-gated page in `apps/dock` was found to hide private data behind a missing route: `/research` and `/reader/compare` are public but return denial notices, not records.

## 5. Security, rights and privacy

- No secret, credential, token or environment value appears in either artifact; no `.env` file was read.
- No private witness material, unreviewed research row or rights-uncertain source text is quoted. The only quoted strings are UI copy already public in the repository (status words, outage and withholding sentences).
- The design forbids Headquarters, ARSY/D00 identity endpoints, Cockpit, ORBIT, SKYLINK, ECHOLOG and unreviewed research from the public gateway, and gives each exclusion a citation.
- No new data owner, schema, API, cookie or consent flow is proposed. The only cookie the design mentions is the existing locale preference, which is presentation state (ADR-0005 / [M37-04](../design/M37-04-locale-link-event-ownership.md)).

## 6. Review, rollback and limitations

- **reviewed-by:** integrator — **PENDING**. This worker does not self-approve the leaf; the artifact is submitted for integrator review at `a54198b` plus the two new files.
- **rollback:** documentation only. `git rm -r --cached` is unnecessary in a dirty tree; delete the two new untracked files (`docs/design/M31-02-gateway-journeys.md`, `docs/audit/M31-02-gateway-journeys.md`) and no application state, route, copy, test or build output changes. No migration, cache or deployment step exists to reverse.
- **limitations:**
  - Design and static inspection only. No code was written and no route, copy string or test was changed.
  - No browser, viewport, screenshot, screen-reader or Lighthouse run; no accessibility conformance claim beyond what existing tests are written to assert (and those tests were not executed here).
  - No dev server, build, `pnpm verify`, Docker or deployment command was run; configuration and CI are not deployment proof.
  - Responsive claims record which CSS/test artifact owns a behaviour, not measured rendering. `globals.css` is dirty in the worktree, so its baseline line numbers differ from the working copy.
  - Hub-sourced outbound links were not dereferenced (see §4), so outbound target safety is unproven.
  - Localized copy quality (`id`/`en`) was not reviewed; that is M31-04.
- **next_eligible_task:** M31-03 — Decide reuse Dock vs extra frontend (blocked only by integrator acceptance of this leaf).
