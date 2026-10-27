# UI visual harness (todo-ui.md UI-F18) — screenshots + measured geometry

Scope: the Playwright visual harness under `scripts/ui/` and the evidence it writes into
`docs/audit/screens/`. This is a **manual evidence command**, not part of the build.

- Design baseline validated against: `d54ad43` (ADR-0009 §2.6 breakpoints, `ui-asset-ledger` vocabulary).
- Code the run below was taken from: branch `dev`, `HEAD = bb75126` (recorded per-run into
  `geometry.json → baseline.runHead` by `git rev-parse --short HEAD`).
- Owner approval on record for this leaf: Playwright as a root devDependency and committing real
  PNG evidence files. This supersedes the "pixel screenshots environment-blocked" limitation in
  `docs/audit/ui-screens-evidence-38560d3.md`.

## How to run

Exact command (to be registered by the owner as an npm script — this agent did not edit
`package.json`):

```
pnpm exec playwright test --config scripts/ui/playwright.config.mjs
```

npm-script line: `"ui:visual": "playwright test --config scripts/ui/playwright.config.mjs"`

The command is self-contained: `scripts/ui/global-setup.mjs` spawns **its own** Dock dev server,
waits for it to answer, runs the passes, then kills the spawned process tree and verifies the port
is released. Nothing is left running; the user's own dev server is never required or reused.

Options:

| Env | Default | Effect |
| --- | --- | --- |
| `UI_PORT` | `3101` | Port the harness binds on `127.0.0.1`. Refuses to start below 3101, on 3000–3005, or on a busy port. |
| `UI_HUB_URL` | `http://127.0.0.1:65535/api/v1` | Hub URL injected as `RADIO_API_URL` into the spawned server. Default is a closed port → forces the hub-offline branch. |
| `UI_SCREENSHOT` | unset (`fullPage`) | Set `viewport` to capture the viewport box instead of the full document. |

Deliberate failure behaviour (requirement 3):

- Unreachable spawned server → `test.beforeAll` preflight **throws** ("Preflight failed: the Dock
  server this harness spawned is not reachable…"). The harness cannot silently pass. Same for a
  server that never becomes ready (180 s abort, output tail printed, process tree killed) and for a
  port that is still bound after teardown.
- A screen that legitimately cannot render → explicit **skip with reason**, also persisted in
  `geometry.json → skips[]`, never converted into a green tile.

## What it covers

Matrix pass — 4 screens × 2 locales × 4 widths = 32 records:

| Key | Screen | Route |
| --- | --- | --- |
| `home` | Lighthouse / Dock home (UI-P01) | `/{locale}` |
| `reader` | Corpus Reader (UI-P05) | `/{locale}/reader` |
| `terms` | UNILEX terms index (UI-P06) | `/{locale}/terms` |
| `constellation` | Constellation ontology (UI-P06) | `/{locale}/constellation` |

Widths are the ADR-0009 §2.6 breakpoints 390×844, 768×1024, 1440×900, 1920×1080. Locales `en`/`id`
are driven by `apps/dock/src/middleware.ts` (`/` → 307 to a locale prefix; locale-prefixed paths are
rewritten to bare routes with `x-mw-locale`), so each case navigates `/{locale}/...`.

Additional passes: term-detail discovery (UI-P06), reduced-motion (8 records: 4 screens ×
390/1440, `contextOptions.reducedMotion = 'reduce'`), and one keyboard pass.

Each case: navigate → wait for a *settled* DOM (poll document height / node count / active spinner
count until 3 consecutive stable samples with zero spinners, ≤ 60 s; a page still on the
`app/loading.tsx` fallback is a failure, not a screenshot) → hide the Next dev overlay
(`<nextjs-portal>`) so it cannot paint into evidence → measure geometry in-page → screenshot →
assert. Evidence is appended to a durable JSONL scratch file in `os.tmpdir()` *before* the
assertions, so a hard failure still lands in the report.

Artifact names are deterministic and timestamp-free, so a later re-run simply overwrites:

```
docs/audit/screens/<screen>-<locale>-<width>.png          matrix
docs/audit/screens/<screen>-en-reduce-<width>.png         reduced-motion
docs/audit/screens/drawer-en-390-open.png                 keyboard (drawer open)
docs/audit/screens/geometry.json                          single report
```

## Measured geometry (run at bb75126)

`geometry.json` per record holds: `documentScrollWidth` vs `viewportClientWidth`,
`horizontalOverflowPx`, `elementsOutsideViewport`, `interactiveElementsOutsideViewport` (+ up to 8
bounding-box samples each), the computed `.dk-space-grid` column count / grid width / card count,
the visible status words, `stateBranch` (`offline | error-boundary | error | empty | loading |
ready`), the landmark counts, `aria-current` links, `settleMs`, console errors, failed requests,
screenshot path/bytes and the failure list.

| Screen | Locale | 390 | 768 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| space-grid columns (home) | en | 1 | 2 | 4 | 4 |
| space-grid columns (home) | id | 1 | 2 | 4 | 4 |
| grid width px (home) | en/id | 362 | 740 | 1332 | 1332 |
| space cards (home) | en/id | 4 | 4 | 4 | 4 |
| horizontal overflow px (all screens) | en/id | 0 | 0 | 0 | 0 |
| elements outside viewport (all screens) | en/id | 0 | 0 | **20** | 0 |
| interactive elements outside viewport (all) | en/id | 0 | 0 | **8** | 0 |
| status words (home) | en | `REAL,REAL,DEMO,REAL` | same | same | same |
| status words (home) | id | `NYATA,NYATA,DEMO,NYATA` | same | same | same |

Totals: `matrixRecords 32`, `reducedMotionRecords 8`, `skips 1`, `recordsWithFailures 26`,
`maxHorizontalOverflowPx 0`, `maxElementsOutsideViewport 20`, `maxInteractiveElementsOutsideViewport 8`.
Runner outcome: **17 passed / 26 failed / 1 skipped**, wall time **2 m 25 s**; 41 PNGs, 19.89 MB
(avg 497 KB). `maxHorizontalOverflowPx` is 0 everywhere *only because* `html, body` are
`overflow-x: hidden` — see defect A; that is exactly why the harness counts outside-viewport
elements separately instead of trusting the overflow figure.

State branches actually rendered (8 records each, en+id × 4 widths):

- `home` → `offline` (8/8): the hub-offline branch with heading "Live station and schedule data is
  temporarily unavailable". All home/geometry numbers in this doc are offline-branch numbers.
- `constellation` → `error` (8/8): page shell + `h1 "Constellation"` renders, both panels show
  `[role=alert]` unavailable text.
- `reader`, `terms` → `error-boundary` (8/8 each): `app/error.tsx` ("Transmission Interrupted"),
  `h1: 0` — defect B below. Screenshots of these broken states are kept on purpose.

## Reduced-motion pass

Contract asserted against `apps/dock/src/app/globals.css` `@media (prefers-reduced-motion: reduce)`:
no computed `animation-duration`, `animation-iteration-count` or `transition-duration` may exceed
0.05 ms; `document.getAnimations()` must report no running animation and none running longer than
the limit; `.m-spinner` must be `animation: none`.

Result: 8/8 records `matchedReducedMotionQuery: true`, `violationCount: 0`, `runningAnimations: 0`,
`runningLongerThanLimit: 0`, `spinnerCount: 0`, over 124–179 elements scanned per page. The only
failures attached to motion records are the 1440 px clipping (defect A), not motion itself.

## Keyboard pass

Route `/en`, drawer at 390×844, active-link semantics at 1440×900 (deliberately not `/en/reader`,
which is currently broken by defect B):

- Tab reached the nav/drawer trigger in 8 stops (`.dk-mobile-menu-toggle`), with up to 4 hydration
  retries for Enter activation (this run: 1 attempt).
- `Enter` opened the drawer → `role="dialog"`, `aria-modal="true"`, focus moved inside.
- `Space` re-opened it; `Escape` closed it and focus returned to the trigger
  (`escapeClosesDrawer: true`, `focusRestoredToTrigger: true`).
- Active route link inside the drawer and in the desktop `nav.dk-nav`:
  `{ text: "HOME", href: "/en" }` with `aria-current="page"`, `desktopActiveLinkCount: 1`.
- Screenshot of the open drawer: `drawer-en-390-open.png`.

## Skips with reason (1)

`term-detail` (UI-P06, both locales, all widths) was skipped: `/en/terms` rendered the
error-boundary branch and exposed **no term id**, so `/terms/<stableId>` is unreachable
(`termDetailDiscovery: { stateBranch: "error-boundary", href: null }`). A real detail screenshot
needs a running hub or a seeded fixture; no data was stubbed to make the tile look populated.

## Defects captured (evidence only — not modified by this agent)

**A. 1440 px header clipping (12 records: 8 matrix + 4 motion, both locales, all 4 screens).**
`documentScrollWidth == viewportClientWidth == 1440` (so overflow reads 0), yet 8 interactive
header elements are laid out past the right edge and are silently cut by `overflow-x: hidden`.
Samples: `a` 1416→1464 (`CREW`), `a` 1487→1541 (`ABOUT`), `a.dk-icon-btn` 1555→1589 (`SRC`),
`a.dk-icon-btn` 1595→1629 (`NET`), `button.inline-flex.items-center` 1555→1629 (`JOIN THE CREW`),
`a.m-btn` 1555→1629. At 1920 they fit; 390/768 wrap. Real content loss for keyboard and sighted
users at the most common laptop width.

**B. `/reader` and `/terms` render `app/error.tsx` (20 records).** Alert text: *"Event handlers
cannot be passed to Client Component props. `<a className="m-btn" … onClick={function onClick} …>`
… consider converting part of this to a Client Component."* (`/terms` also has the `<button …
onClick>` variant.) `h1: 0`, so both landmark invariants fail as a consequence. Present in the
working tree at `bb75126` while other agents were concurrently editing `apps/dock/src/**` and
`packages/moonui/**`; this harness only records it.

Also recorded, unattributed: 8 `home`/`keyboard` console page errors — *"Hydration failed because
the server rendered text didn't match the client"*.

## Screenshot inventory (41 files, SHA-256)

These PNGs are **evidence artifacts**. They are not shipped media: they live in `docs/audit/screens/`
and are referenced by nothing in app code (`apps/dock/src/**` or `apps/*/public`). They sit outside
the `apps/*/public` universe that `scripts/check-ui-assets.mjs` scans, so they cannot trip the asset
ledger gate, and `scripts/check-ui-consistency.mjs` only reads `.tsx`/`.css` under app `src`, so the
`.mjs` harness is not scanned either. Duplicate hashes are expected and meaningful: identical pixels
mean the reduced-motion capture is byte-identical to its matrix twin at 1440 px.

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `home-en-390.png` | 437911 | `08f83f6dce1b6a31c41c98d8a46eb5a79ed8464cb5633acda615e76f68fe7872` |
| `home-en-768.png` | 654511 | `11efed4bcee8c043be08871c035b4dc40ac0cc743a8b1604b99b627ab0d379db` |
| `home-en-1440.png` | 1106280 | `ee14fb8bd4194cf07aa223f4b2e793000547b877b440e7c363649201ae9f261f` |
| `home-en-1920.png` | 1222120 | `0355076af593dd257237d3002c19d008be1be7d24498deea8a96009797878109` |
| `home-id-390.png` | 438147 | `b57e128b4e7bdaa1c2475cc52626a5bec5c7e3f1d40088b84780b75b2f42a977` |
| `home-id-768.png` | 655950 | `acfeb8ee85acde0491fec418308c796b085b03711e5c79ccccdd07d84c96eed4` |
| `home-id-1440.png` | 1108460 | `8c2e7711b9641ddbac14b1dba28f1e92987ff64c8a0a1ae7e190bc2831a35d90` |
| `home-id-1920.png` | 1224477 | `f05a23f6438b1411e334bb1acc290069914bb7a2f38d37b4fb864d15c9c8ecbb` |
| `reader-en-390.png` | 248176 | `25f8b0b2703ae65ecb50e57e9c6b600ff82838c6b742ce2ee3d0c3bcb5815fa9` |
| `reader-en-768.png` | 386495 | `3a481f0e4713d4220a8921bd0f8e105468d62b6a3013c1735fbc6a501b05ce47` |
| `reader-en-1440.png` | 464047 | `d343aa8b57e7bdb70639fb19e7adcd08ebd5fb72baf5c7a8d8a74b2dffa977a9` |
| `reader-en-1920.png` | 651636 | `8ee5f5a8d22e3e19365d0ebc3e56e74931f40fdbc982e1098ae47ea99dd5c381` |
| `reader-id-390.png` | 248804 | `cf71d69f8bc63b3623278ef2e9456fa4dbd980d8fb3a2966a857c9de7a39b081` |
| `reader-id-768.png` | 386954 | `bd9ef6af7ab50c018ad00f8130d77db08844f8b51b8970a88b19cea798ad470a` |
| `reader-id-1440.png` | 464799 | `ef33596ca0279c621e2c3c61b26cafa3988539e71ad8653ab2f33e856b906527` |
| `reader-id-1920.png` | 652710 | `7ca872ccbe3e381b119cd38855de44265ef1daa13ff0240fecd1995f52324b0a` |
| `terms-en-390.png` | 250950 | `9ab55c75aa82799bc12b2e0a6472a213a9b7fdf7cd8d7daee1bab4e060126b25` |
| `terms-en-768.png` | 388759 | `992186c0c8d1c6c39b205cb16620193df82927b84bedebde337e5e7198b6eede` |
| `terms-en-1440.png` | 466497 | `652afffcf45a9359036651574b19500b1b0592257b5f0ac648abe36254df8530` |
| `terms-en-1920.png` | 655975 | `a4f03c862aa8cda88572dc288d7ec51a57bb7e4d400d25f7bcca7c8af83f7165` |
| `terms-id-390.png` | 251677 | `6a01ebd15592aefb18e13177cf8a9d183bf2e2a59934c937899ffe83dc7dbea4` |
| `terms-id-768.png` | 389198 | `92074898fffaab4e8350bf58e3029be5f981c82762b05c045d3f6ba52e9efd8a` |
| `terms-id-1440.png` | 467165 | `d5a4090e52b1d954f1468e162ce7fcf4412cfae38ff17c43d3ba799a0c5c15e8` |
| `terms-id-1920.png` | 656950 | `9c0055948fd687100f5f7fb9647f2d812b570b7d20d52bde14b3974063e62448` |
| `constellation-en-390.png` | 211006 | `cf68d07369dd4f6f800b8f64319020525f478df18a84a9402937cc9fcd290d15` |
| `constellation-en-768.png` | 365432 | `15d75b590532973d6d181ca5bdedded9406781c95135555cbb5bf80ee743e001` |
| `constellation-en-1440.png` | 443066 | `75700d76614a4e5343d001d2d2b88d9a05502d181566584a33ce6af227c49aeb` |
| `constellation-en-1920.png` | 629968 | `23ff355cf4b455d731fe41eb8535650ae4b35878836682d4c9f38d42f9ff1431` |
| `constellation-id-390.png` | 210159 | `cf3edf329ed1f738ba5e9b3b330d8b6d03bb1050d377397e6ba6468983d398f6` |
| `constellation-id-768.png` | 364427 | `27f4bf46b3289e293e676c7c4d3af9a5432528e97887d3dd3f18abda7a676bd6` |
| `constellation-id-1440.png` | 442244 | `9678aaffa4c2b0e696ebc90021e532c2858f29b9760c6fabe810d5782b4385eb` |
| `constellation-id-1920.png` | 628952 | `ab0780b62936f9a2c96c918b8c5375300877df0d00cd7a229c6382444294b5f8` |
| `home-en-reduce-390.png` | 437867 | `7faa1567f96d1c3cc54317d414b9c73106a11614de1e89931685c1f5ae2c4da9` |
| `home-en-reduce-1440.png` | 1106280 | `ee14fb8bd4194cf07aa223f4b2e793000547b877b440e7c363649201ae9f261f` |
| `reader-en-reduce-390.png` | 248132 | `1b87b115b22db10e74aa06b8dbda62ad99c46376c498b4ed4536a0303613f294` |
| `reader-en-reduce-1440.png` | 464047 | `d343aa8b57e7bdb70639fb19e7adcd08ebd5fb72baf5c7a8d8a74b2dffa977a9` |
| `terms-en-reduce-390.png` | 250853 | `1f4b8b57f997c29666fa61887ede869258e6ae82202d1ca73c55eba6e485574a` |
| `terms-en-reduce-1440.png` | 466497 | `652afffcf45a9359036651574b19500b1b0592257b5f0ac648abe36254df8530` |
| `constellation-en-reduce-390.png` | 211001 | `0f3c0e8ebea4eae89adc6291fc3724b929e4472157ddbe5d04d8bb34f44b26d4` |
| `constellation-en-reduce-1440.png` | 443066 | `75700d76614a4e5343d001d2d2b88d9a05502d181566584a33ce6af227c49aeb` |
| `drawer-en-390-open.png` | 54097 | `0776034c5bd75370ce550652c31c40276f5bf477a425022e367dc1aa79a96775` |

## What a screenshot does NOT prove

`todo-ui.md:4`: *"A screenshot never proves that its feature, API, data, integration, deployment,
or user permission exists."* Concretely, for this harness a PNG does **not** prove:

- that any data is *correct* — the pixel shows what the code printed, not whether the hub, corpus
  or station record behind it is true. Every number here comes from the **hub-offline branch**; the
  live-data branch is unverified.
- that the state shown is the state a user gets. `settlePage()` deliberately waits for the settled
  branch; loading/empty/error tiles are labeled by `stateBranch`, and a screenshot of one is only
  evidence *for that branch*.
- functionality: no click, no network result, no audio, no radio playback, no persistence.
  Interaction is covered only by the narrow keyboard pass above.
- permission or deployment: nothing here shows a private surface is actually guarded server-side,
  and the pixels come from a dev-mode server, not from the bundle that would ship.
- accessibility. Geometry + a few ARIA attributes were read (`aria-current`, `role`, `aria-modal`);
  contrast, focus-visible styling, reading order, screen-reader announcements, `lang` on dynamic
  content and touch-target sizes were not measured.
- cross-browser or cross-DPI truth: Chromium only, `--force-device-scale-factor=1`, dev-mode
  server, no production bundle (`next build` was not run).
- performance on real hardware, font-load-dependent reflow on a machine without these fonts, or
  the exact copy of a future commit — the tree moves under this harness (see provenance).
- that a defect is fixed: an all-green re-run means "no assertion tripped", nothing more.

## Provenance, limits and operational notes

- **Not wired into `pnpm verify`, `pnpm ui:check` or CI.** The owner keeps CI thin; this is a manual
  evidence command a human runs on purpose. Nothing else invokes `scripts/ui/`.
- **Concurrent edits.** Other agents were editing `apps/dock/src/**` and `packages/moonui/**` during
  these runs. Treat the committed PNGs as harness validation; the **final evidence run happens after
  those edits land** — same deterministic filenames, so it overwrites this batch. Re-hash the
  inventory above (or regenerate it) after that run.
- **`.next` contention.** The harness runs `next dev` against `apps/dock`, so it shares the
  `.next` directory with a user's dev server on the *same* project. Running the harness while your
  own `pnpm dev` for Dock is up can thrash that cache. Avoiding this would need a separate
  `distDir`, and `next.config.mjs` is owned by the app, not by this harness — noted, not changed.
- **Ports / processes.** Only `127.0.0.1:3101` (or `UI_PORT ≥ 3101`) is bound. Ports 3000–3005
  belong to a different local project and are never bound, probed or killed by this harness; the
  free-port check is scoped to the single port it intends to use. The spawned server is detached
  and killed as a process tree (`taskkill /T /F` on Windows, negative-PID `SIGKILL` on POSIX), then
  the port is re-checked for 15 s — a still-bound port fails the run. Verified released after the
  documented run.
- **Hub forced offline** (`RADIO_API_URL=http://127.0.0.1:65535/api/v1`) so the app can never reach
  the other project's server. Consequence: every screen was measured on the offline/error branches;
  `REAL`/`NYATA` status words were counted from the DOM but no live-backed `REAL` card was ever
  observed, and `/terms/<stableId>` could not be reached at all.
- **Dev-overlay suppression** is a `nextjs-portal { display: none }` style tag added per page. It
  hides the Next badge from the pixels only; the overlay's underlying problems are captured as
  `consoleErrors` instead (the hydration error and the Client-Component-prop error above).
- `pnpm exec eslint scripts/ui` passes. Only `scripts/ui/`, `docs/audit/screens/` and this doc were
  written by this task; no app source, `packages/moonui`, `apps/headquarters`,
  `docs/audit/ui-asset-ledger-d54ad43.md` or `scripts/check-ui-assets.mjs` was modified, and no
  dependency or root `package.json` field was added.
