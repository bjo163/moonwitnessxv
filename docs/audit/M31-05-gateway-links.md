# M31-05 — Gateway links, permission boundary and offline fallback

**Executable leaf · test/evidence artifact · baseline `91a5ff7` · evidence HEAD `358853a`.** This audit records the M31-05 deliverable: one static link/permission-boundary/offline-fallback test for the LIGHTHOUSE gateway delivered inside Dock ([ADR-0011](../decisions/ADR-0011-lighthouse-dock-runtime.md)). It does not close M31-05 or the M31 milestone; the integrator checks the TODO leaf against reproducible evidence. No route, component, copy, locale key, CSS, schema, deployment, DNS or TODO file was changed.

## Required report

| Field | Value |
|---|---|
| `task_id` | M31-05 — Test correct links permissions and offline fallback |
| `baseline_sha` | `91a5ff7f2d9f94fa764115e4c875b6fb443bc453` (recorded at task start on `dev`) |
| `evidence_sha` | `358853a970aeaa78ef3704b14d692e39cb74149f` (HEAD when the final commands ran) |
| `worker` | Qoder coding agent, M31-05 leaf |
| `claimed_files` | `apps/dock/test/m31-05-gateway-links.test.mjs` (new), `docs/audit/M31-05-gateway-links.md` (new) |
| `actual_changed_files` | The same two new files. No existing file, `TODO.md`, staged path or another session's work was modified. |
| `positive_test_and_output` | 12 tests, 12 pass, 0 fail, exit 0 (verbatim in §5) |
| `negative_test_and_output` | 1/1 negative-fixture test passes, exit 0; the fixtures prove each detector rejects a synthetic violation (verbatim in §6) |
| `security_rights_privacy` | Read-only static analysis; no network, no server, no credentials, no secrets, no private witness/research data, no source text. Private-surface scan across `apps/dock/src` returned zero matches. No rights clearance or permission enforcement is claimed. |
| `reviewer` | Not assigned. This leaf does not self-approve; integrator/reviewer confirmation is pending. |
| `rollback` | Delete the two new files. No runtime, route, data, deployment or configuration rollback is required. |
| `result_sha` | Uncommitted working-tree artifacts on `358853a970aeaa78ef3704b14d692e39cb74149f`; no commit was created (task constraint). Test artifact SHA-256 `dcc864e795f3db67be7fd23902f7c169f95e429486d5865efd2f84ad2363ed2b`, 532 lines. |
| `limitations` | Static audit only: no browser, dev server, HTTP request, network fetch, DNS/TLS check, deployment or real permission system. See §8. |
| `next_eligible_task` | `M32-01` is the next open P1 leaf after M31-05. It is recorded **BLOCKED** in TODO because it needs a real first-member, privacy-approved interview/opt-in; M31 has no M31-06. |

### Baseline drift observed during the leaf

HEAD advanced from `91a5ff7` to `358853a` while this leaf was in progress. The intervening commits are documentation-only (`TODO.md`, M23/M24/M25/M26 audits and data). `git diff --name-only 91a5ff7..358853a -- apps/dock docs/design docs/decisions` reports **0 files**, so every source file this test reads is byte-identical at both SHAs. The final commands were rerun at `358853a`; the audit does not claim the artifacts are committed at that SHA.

## 1. Scope and authorities

- [M31-02 gateway journeys](../design/M31-02-gateway-journeys.md): 21 row matrix, 14 `AVAILABLE` with `file:line`, 7 `PLANNED`; §4 rules (PLANNED is not a link; availability is a route fact); §6 private-surface exclusion; §8 assigns link/permission/offline checks to M31-05.
- [ADR-0011](../decisions/ADR-0011-lighthouse-dock-runtime.md): Dock is the LIGHTHOUSE runtime; the gateway may remove surfaces but never widen; no HQ/Cockpit/ORBIT/SKYLINK/ECHOLOG/ARSY surface.
- [M31-03 reuse check](../../../scripts/check-m31-03-dock-reuse.mjs) and [M31-04 copy audit](M31-04-gateway-copy.md): the structural model this test follows (real files, passing run plus rejected invalid fixtures).
- [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) §2.2–2.5: `REAL`/`PLANNED`/`DEMO` in words, no `LIVE` badge, no decorative global search.

## 2. Files delivered

| File | Purpose |
|---|---|
| `apps/dock/test/m31-05-gateway-links.test.mjs` | New test file, 12 tests: journey-to-route mapping, PLANNED non-navigation, private-surface exclusion, same-origin hrefs, locale contract, root negotiation, offline fallback |
| `docs/audit/M31-05-gateway-links.md` | This evidence record |

Untouched: all modified/untracked paths reported at baseline, including `apps/dock/src/app/globals.css`, `apps/dock/src/app/patches/page.tsx`, `apps/dock/src/ui/client/PatchesExplorer.tsx`, `apps/dock/test/responsive-accessibility.test.mjs`, `apps/dock/next-env.d.ts`, `apps/cockpit/*`, `apps/headquarters/*`, `docs/audit/screens/*`, `TODO.md`.

## 3. What the test reads

No mocks and no fixture copies of product source. The test reads:

| Input | Use |
|---|---|
| `docs/design/M31-02-gateway-journeys.md` | Parses the 21-row matrix and classifies each state; asserts 14 `AVAILABLE` / 7 `PLANNED` and the exact ID sets |
| `apps/dock/src/app/**/page.tsx` | Discovers the real route inventory (20 routes) and dynamic segments such as `/terms/[stableId]` |
| `apps/dock/src/ui/components/shell.tsx` | 15 `NAV_LINKS` hrefs, header/footer literal hrefs |
| `apps/dock/src/app/sitemap.ts` | 15 `DOCK_SITEMAP_ROUTES` |
| `apps/dock/src/app/page.tsx` | `OfflineLanding` branch and its copy keys |
| `apps/dock/src/middleware.ts` | Root 307 negotiation, localized rewrite, unsupported-locale 404 (also imported and executed as a unit) |
| `apps/dock/src/lib/landing-copy.ts` | Exact `id`/`en` outage sentences (imported, not duplicated) |
| `apps/dock/src/lib/locale-context.mjs` | `localizedDockHref` is imported and called for every nav link in both locales |
| `packages/core/src/locale.ts` | `SUPPORTED_LOCALES = ['id', 'en']` |
| `apps/dock/src/ui/components/locale-switcher.tsx` | Exactly two locale options, `id` and `en` |
| `apps/dock/src/app/manifest.ts` | J20 evidence: installability only, service worker deliberately absent |
| `apps/dock/src/app/research/page.tsx` + `src/ui/client/ResearchExplorer.tsx` | J11 evidence: explorer exists but is not imported by the route |
| Every `apps/dock/src/**/*.{ts,tsx,mjs}` | Private-surface token scan (`headquarters`, `cockpit`, `arsy`, `skylink`, `echolog`, `/admin`) |

## 4. What the test proves

1. **Journey states are still the accepted design.** 21 rows, 14 `AVAILABLE` (`J1,J2,J4,J5,J7,J8,J9,J10,J12,J13,J15,J18,J19,J21`), 7 `PLANNED` (`J3,J6,J11,J14,J16,J17,J20`); every row keeps evidence text.
2. **Every AVAILABLE journey maps to a real route file.** All 20 `page.tsx` routes are inventoried; J8→`/reader`, J9→six term/figure/constellation routes, J10→`/research`, J12→`/reader/compare`, J13→`/stations,/terms,/missions,/reader`; chrome journeys (J4/J5/J7/J15/J18) are anchored on `/` and the nav test separately resolves all 13 nav route links. J19's `loading.tsx`, `error.tsx`, `not-found.tsx`, `states.tsx` and J21's `not-found.tsx` + `middleware.ts` exist.
3. **Every PLANNED journey has no route and no navigation entry.** For each PLANNED surface's plausible route (`/lighthouse`, `/gateway`, `/research/cases`, `/search`, `/harbor`, account/newsletter paths, etc.) the test asserts no exact or child page route exists and no nav/sitemap href resolves to it. J11's `ResearchExplorer` source exists but `/research` does not import it. J20: no service worker file exists under `src/` or `public/`, and the manifest states the omission is deliberate.
4. **Navigation is 15 same-origin links.** 13 route links plus `/#constellation`, `/#zine-poster`; every route link has a `page.tsx` and appears in the sitemap; no link is absolute, protocol-relative or external.
5. **The sitemap is 15 unique real public routes.** No duplicate, no origin embedded in a route fragment, no dead route, no private surface.
6. **No private surface appears anywhere in Dock source.** Nav, sitemap, journey table and every `src` file are clean for HQ/Cockpit/ARSY/SKYLINK/ECHOLOG/`/admin` at the evidence SHA.
7. **All internal hrefs are same-origin paths.** Nav, sitemap, journey and literal header hrefs contain no scheme or `//` origin; the header block contains no `http(s)://`.
8. **Locale prefixes stay in `id`/`en`.** Core authority is exactly `['id','en']`; the switcher offers exactly those two; every nav link through `localizedDockHref` yields `/<id|en>…` in both locales; `fr` falls back to `/en`; `//outside.example` is discarded to `/id`; middleware 404s unsupported segments; the sitemap emits only `/id` and `/en`.
9. **Entry behavior is id/en only.** Middleware unit calls: `/` + `id-ID` → 307 `/id` with `Vary: Accept-Language`; `/` + `en-GB` → 307 `/en`; `/id/reader` → rewrite `/reader`; `/fr`, `/fr/reader`, `/id-ID/reader` → 404 (never remapped).
10. **Offline fallback exists and stays honest.** `OfflineLanding` renders the localized `heroEyebrow`, an `h1` `MOONWITNESS`, mission copy and `{copy.liveDataUnavailable}` in `role="status"`; no `<LiveDot>`; both exact locale sentences are asserted and differ; no `LIVE` badge, `deployed`, `production`, `now live` or `is live` claim in the offline copy or block.
11. **The offline fallback does not fake counts.** It reads no `payload` fields, renders no `counts`, and contains no hardcoded zero; the branch still renders `<SpaceGrid>` (the four spaces survive the outage).
12. **Detectors are not vacuous.** See §6.

## 5. Positive evidence — commands and verbatim output

All commands run from `apps/dock`.

### Focused test

```
node --experimental-strip-types --test test/m31-05-gateway-links.test.mjs
```

Observed, exit **0**:

```
(node:29748) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Z:/project/moonradio/apps/dock/src/middleware.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to \\?\Z:\project\moonradio\apps\dock\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ M31-02 fixes 21 journeys: 14 AVAILABLE and 7 PLANNED (1.9688ms)
✔ every AVAILABLE journey maps to a real Dock page route (1.6026ms)
✔ every PLANNED journey has no route file and is absent from nav and sitemap (20.3485ms)
✔ navigation exposes 15 same-origin links and every route link resolves (0.9798ms)
✔ sitemap lists 15 real public routes and none is a private destination (0.3378ms)
✔ no navigation, sitemap, journey or Dock source names a private surface (0.1831ms)
✔ every internal navigation href is a same-origin path (0.4013ms)
✔ locale-prefixed gateway links stay inside the id/en contract (0.7666ms)
✔ the root negotiates id/en and an unsupported locale segment never remaps (19.3695ms)
✔ offline landing branch renders localized copy without a live or deployment claim (0.6917ms)
✔ the offline fallback keeps the four spaces but never shows live counts as zero (0.2405ms)
✔ negative fixtures prove private, external, planned-route and live-claim checks can fail (0.2452ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 566.1541
EXIT:0
```

The `MODULE_TYPELESS_PACKAGE_JSON` warning is the pre-existing Node warning for stripping types from `src/*.ts`; M31-04 recorded the same warning. It is not introduced by this test and does not fail the run.

### Lint

```
pnpm exec eslint test/m31-05-gateway-links.test.mjs
```

Observed: no output, exit **0**.

## 6. Negative evidence — rejected hypothetical violations

Command:

```
node --experimental-strip-types --test --test-name-pattern="negative fixtures" test/m31-05-gateway-links.test.mjs
```

Observed, exit **0**:

```
✔ negative fixtures prove private, external, planned-route and live-claim checks can fail (2.4389ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 234.2659
EXIT:0
```

The fixtures assert these detectors report the violations, not merely pass on clean input:

- `privateSurfaceHits(['/admin/queues', '/id/cockpit', 'https://headquarters.example/review', '/skylink/health', '/echolog/attachments'])` returns all five; benign `/reader`, `/id/stations`, `/research` return none.
- `absoluteHrefHits(['https://example.com/stations', '//cdn.example.org/x', 'mailto:press@example.com'])` returns all three; `/stations`, `#join-crew`, `/id#zine-poster` return none.
- `plannedRouteViolations(['/harbor'], [...pageRoutes, '/harbor'])` and the same for `/research/cases` return the injected route; the real inventory returns none (so a PLANNED journey that gained a page would fail).
- `isServiceWorkerFile('sw.js')` / `service-worker.js` are true; `icon.svg` is false (so J20 gaining a worker would fail).
- `liveClaimHits(['DEPLOYED', 'LIVE STATUS', 'now live in production'])` returns all three; the real lowercase "Live station … unavailable" sentence returns none.
- `gatewayLocaleOf('/fr/reader')` and `/id-ID/reader` return `null`; `/id/reader` and `/en` return their locale.

## 7. Defects and blockers

**No broken link or private-surface leak was found at the evidence SHA.** No defect is fixed here, because M31-05 is a test/evidence leaf.

One class of link is explicitly **not** provable by this static test, exactly as [M31-02 §6](../design/M31-02-gateway-journeys.md) warns:

- `apps/dock/src/app/page.tsx:112-119` renders a Hub-provided `sig.url` with `target="_blank"` and `rel="noopener noreferrer"`.
- `apps/dock/src/app/page.tsx:178-184` passes a Hub-provided `streamUrl` to `Player`.

Both values arrive at request time and are not literals, so no static read can declare them same-origin or safe. They are not counted as defects, but they remain a scoped-gateway requirement: a preview must allow-list or omit Hub-sourced outbound links. This test does not satisfy that requirement, and this audit does not claim the gateway is safe against malicious Hub data.

## 8. What this test does not prove

- **No browser.** No rendering, DOM, focus order, keyboard trap, responsive layout, screenshot or screen-reader result. The offline branch is asserted in source, not rendered.
- **No server or network.** The test starts no dev/prod server and fetches no URL. Middleware is called as a unit, not over HTTP. No Hub, DNS, TLS, certificate or redirect at a real host is exercised.
- **No deployment.** No build, container, Compose, release or `a-l-l-a-h.com` reachability claim.
- **No real permission system.** Dock has no login or role model; the "permission boundary" here is a static exclusion of private-surface names/links and a public-route inventory, not an authorization decision.
- **No runtime data.** Hub-sourced outbound links are unresolved (§7). No live count, schedule or station data is read.
- **No full-suite result.** Only the focused M31-05 file and its ESLint run were executed. Root `pnpm verify`, `pnpm test` for all of Dock, and `pnpm typecheck` were not run; no TypeScript source changed.
- **No claim that J19/J21 render correctly at runtime.** Their framework files are asserted to exist; route-level error/loading/404 behavior is owned by existing tests (not executed here).
- **No claim about other sessions' changes.** Pre-existing modified/untracked files were read-only at most and never staged, edited or reviewed as part of this leaf.

## 9. Rollback

Delete:

- `apps/dock/test/m31-05-gateway-links.test.mjs`
- `docs/audit/M31-05-gateway-links.md`

No route, component, copy, locale key, CSS, data, schema, Compose service, DNS record or deployment artifact is involved, so no runtime rollback exists. No commit was created; if an integrator later commits these files, rollback is a normal revert of that commit.

## 10. Next eligible task

`M32-01 — Validate first-member need and opt-in journey` is the next open P1 leaf in TODO after M31-05. It is recorded **BLOCKED**: acceptance depends on a real first member and a privacy-approved interview/opt-in, none of which exists in this repository. M31 ends at M31-05; no M31-06 is defined.
