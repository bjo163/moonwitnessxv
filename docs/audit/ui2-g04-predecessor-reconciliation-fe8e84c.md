# UI2-G04 — `todo-ui.md` §2 predecessor reconciliation, scoped statuses at `fe8e84c`

Gate: `todo-ui-2.md:33` — verbatim:

> `| [ ] | **UI2-G04** | P1 | D2 | G01 | UI integrator | todo-ui.md; docs/audit/; ADR-0009 | Reconcile UI-F05/F06/F07, F08/F09, F10/F11 predecessor anomalies without rewriting checked history. **DoD:** scoped statuses/evidence; no retroactive completion inferred. |`

**Literal gate scope is `UI-F05`…`UI-F11`** (three predecessor/successor pairs). The assignment brief asked for all twelve unchecked §2 rows; those are answered below too, but rows `UI-F12`…`UI-F20` are **extended inventory, not this gate's authority** — this gate cannot tick them and no later row was edited on its strength.

Nothing here is ticked. No status column in `todo-ui.md` was touched.

---

## 0 · Baseline — branch, HEAD, commands actually run

| Item | Observed value |
| --- | --- |
| Branch | `dev` |
| HEAD | `fe8e84c0c4e52becff95ef859ebf7db1cc1d4e7f` (`docs(audit): measure QA token purity and close QA-03 at ddd58f4`) |
| Assigned baseline | matches HEAD exactly; the tree did not move before this gate started |
| File written by this gate | `docs/audit/ui2-g04-predecessor-reconciliation-fe8e84c.md` (one file; nothing else created, edited, staged or committed) |

Commands executed (all read-only, from `Z:\project\moonradio`):

```text
git rev-parse --abbrev-ref HEAD ; git rev-parse HEAD
git status --porcelain=v1
git diff -- todo-ui.md
git log --oneline -30 ; git log --oneline --all --grep="UI-F.."
git log -1 --format=... {02bd31b,fe21e6d,d66dc8f,7c6206a,7c739c6,1a7efee,2d223fc,278f26a,bb75126,44a8640,1a7efee}
git merge-base --is-ancestor <each of the above> HEAD
git show --stat --format="" <each commit>
git show HEAD:scripts/ui/paths.mjs ; git show HEAD:docs/audit/screens/geometry.json
git ls-files scripts/ui apps/arsy/test/public-projection-denial.test.ts
ls / find / grep  over apps/dock, apps/headquarters, apps/cockpit, packages/moonui, scripts, docs
Read (open-and-line-number) of every source and test file cited below
```

Not executed, by instruction: any build, test runner, dev server, `pnpm ui:check`, `pnpm lint`, the Playwright harness, and every write-side git command. **No verdict below rests on a command this gate ran that produces output or side effects; each rests on committed source, committed tests, committed artifacts, or a dated audit doc.**

### In-flight tree (handled as such)

`git status` at start showed foreign uncommitted work belonging to four concurrent sessions: `apps/arsy/src/**` (+ untracked `apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts`), `apps/skylink/src/modules/routes.ts`, `apps/orbit/src/app/layout.tsx`, `apps/orbit/test/orbit-locale-shell.test.mjs` (+ untracked `apps/orbit/src/middleware.ts`, `apps/orbit/src/lib/orbit-locale-header.ts`), `apps/dock/next-env.d.ts`, `TODO.md`, `todo-ui.md`, `docs/audit/qa-02-04-tokens-ddd58f4.md`, `scripts/ui/paths.mjs`, and the whole `docs/audit/screens/` artifact set.

Consequences honoured:

- `scripts/ui/**` and `docs/audit/screens/geometry.json` are cited **only** in their committed form via `git show HEAD:…`. The dirty `paths.mjs` and the dirty PNG/geometry set are **not** reported as shipped.
- `todo-ui.md` is dirty, but the diff touches only **§7 QA-04 at line ~207**, not §2. The twelve §2 rows quoted below are byte-identical between `HEAD:todo-ui.md` and the working tree, so the row text is safe to quote.
- No file under `apps/headquarters/**`, `apps/cockpit/**`, `packages/moonui/**` was dirty; those verdicts are read directly from the tree, which equals HEAD for those paths.

---

## 1 · The anomaly as observed

`todo-ui.md` §2 (lines 31–46) at `fe8e84c`:

| State | Rows | Cited evidence |
| --- | --- | --- |
| `[x]` checked | **F01, F02, F03, F04** | `docs/audit/ui-baseline-8737fe4.md` §1/§2/§3/§4 |
| `[ ]` unchecked | **F05** | none |
| `[x]` | **F06, F07, F09, F11** | `docs/audit/ui-screens-evidence-38560d3.md` → `#what-each-screen-actually-gained` (F06, F09, F11) and `#geometry-live-app-on-3001-en-and-id` (F07) |
| `[ ]` unchecked | **F08, F10, F12, F13, F14, F15, F16, F17, F18, F19, F20** | none |

The defect class was already written down, which this gate confirms rather than discovers: `docs/audit/ui2-preflight-2026-10-27.md:50` — "*UI-F06 and UI-F07 checked although UI-F05 remains unchecked. UI-F09 is checked with its dependency UI-F08 unchecked; UI-F11 is checked with UI-F10 unchecked… do not silently infer full predecessor completion.*"

**What the reconciliation actually found is bigger than a dependency inversion.** The unchecked rows are not stalled work — most of them shipped in dedicated commits that are ancestors of `fe8e84c` and carry their own contract tests, and the commit subjects name the leaf:

| SHA | Date | Subject | Leaf named | Ancestor of HEAD |
| --- | --- | --- | --- | --- |
| `63d5599` | 2026-10-27 | `docs(ui): baseline audit for the 12 design references` | UI-F01..F04 | yes |
| `02bd31b` | 10:45:17 | `feat(moonui): finish the shared shell primitives and ARIA contract` | **UI-F08, UI-F17** | yes |
| `fe21e6d` | 10:45:33 | `feat(headquarters): decide private-route access on the server` | **UI-F13** | yes |
| `d66dc8f` | 10:45:47 | `feat(dock): put every data-backed panel behind the 4-state contract` | **UI-F10** (+ F16 regression test) | yes |
| `7c6206a` | 10:45:58 | `feat(assets): gate shipped UI assets on naming, self-containment and rights` | **UI-F14**, QA-01 | yes |
| `7c739c6` | 11:36:40 | `feat(dock): make every internal link locale-preserving` | **UI-F12** | yes |
| `1a7efee` | 11:51:58 | `feat(dock): state provenance, rights and review in every public view` | **UI-F15** | yes |
| `2d223fc` | 13:47:30 | `fix(dock): keep the header cluster and landing rails inside the viewport` | measured from the **UI-F18** harness | yes |

So the anomaly has **two independent halves**, and only the first half was predicted:

1. *(predicted)* checked successors with unchecked predecessors — F06/F07 over F05, F09 over F08, F11 over F10.
2. *(new)* a set of rows whose deliverable is committed and test-guarded but whose checkbox was simply never reconciled — F08 (mostly), F10 (mostly), F12, F13, F14, F15, F16, F17.

And in the process, **three checked rows do not carry the evidence their own link claims** (§4). That is the part this gate exists to catch.

Rule applied throughout: a helper existing is not every panel using it; a script existing is not a gate being wired; a dated audit sentence is not current code.

---

## 2 · Row-by-row reconciliation

### 2.1 · UI-F05 — P1 · D2 · dep UI-F04 · **in gate scope**

**Deliverable (verbatim):** "Translate mockup hierarchy to responsive shell; reuse existing Dock public shell and HQ private shell."

**True at `fe8e84c`:**

- *Dock public shell is reused, and the reuse is enforced.* `apps/dock/src/layouts/site.tsx:13-26` defines `SiteLayout` = `div.dk-shell` + `SiteHeader` + `main.dk-main` + `SiteFooter`. It has exactly one consumer: `apps/dock/src/app/layout.tsx:7,20` (root). `apps/dock/test/landmarks.test.mjs:133` ("NO page component in apps/dock/src/app imports or wraps in SiteLayout"), `:168` ("RootLayout is the exclusive consumer"), `:185`, `:232`, `:252`, `:313` (negative duplication guard) make single-shell reuse a test contract, not a habit.
- *Responsive shell exists for Dock with one owner.* `apps/dock/src/app/globals.css:754` `@media (max-width: 1040px)` is the only desktop-nav↔drawer switch; `apps/dock/test/header-shell-no-clip-contract.test.mjs` (10 tests, added under UI2-G05 per `docs/audit/ui2-g05-shell-contract-47b89f4.md:110-183`) fails if that single owner, the `flex-wrap: wrap` band or the `NAV_LINKS`-only rule is reverted.
- *HQ private shell is reused.* `apps/headquarters/src/app/(admin)/layout.tsx:3,8` wraps every admin page in `VerticalLayout`; `apps/headquarters/src/layouts/vertical.tsx:46` (`div.m-shell`) + `:47` `aside.m-sidebar` + `:83` `header.m-navbar`; the unauthenticated surface uses the separate `apps/headquarters/src/layouts/auth.tsx`. Both consume MoonUI shell primitives, not a second frame.
- *"Mockup hierarchy" was translated, not copied.* `docs/audit/ui-baseline-8737fe4.md:104` records that the reference's 13-item rail is deliberately not shipped; the substitution is the four-space taxonomy in `apps/dock/src/ui/components/spaces.tsx:102` (`SpaceGrid`), authorized by ADR-0009 §2.2.

**Verdict: PARTIAL.** What is met: one public shell, one private shell, both reused, both single-writer, Dock's responsive switch owned by one media query with a regression test. What is not met: the row's *shell/token/no-clipping* promise holds for **Dock only**. `docs/audit/ui2-g05-shell-contract-47b89f4.md:73-109` states the contract numerically for Dock and inventories Cockpit and HQ without one; the UI2-G05 row itself (`todo-ui-2.md:34`) says "**Dock lane done** … Cockpit and HQ layout CSS have no contract yet, so the row stays open." `apps/headquarters/src/app/globals.css:281` and `apps/cockpit/client/cockpit-layout.css:123` each have a single media query but no test that would fail if it were duplicated or if a shell control clipped.

**Can it honestly be ticked? No.** Smallest remaining deliverable: the Cockpit and HQ halves of UI2-G05 — a stated no-clipping contract and a source-contract test per app, matching the Dock lane. **Later gate that still owns it: UI2-G05** (and UI2-G06 for per-route state consistency inside that shell). Marking F05 done now would double-count G05's unfinished scope as two closed items.

---

### 2.2 · UI-F06 — P1 · D2 · dep UI-F05 · **checked** · in gate scope

**Deliverable (verbatim):** "Establish typography scale for display, titles, body, captions and monospaced status."

**True at `fe8e84c`:** the *families* are single-sourced — `packages/moonui/moon.css:42-45` (`--font-sans`, `--font-display`, `--font-zine`, `--font-mono`) typed as `MOON_FONTS` in `packages/moonui/src/tokens.ts:31-36`, consumed via `var(--font-display)` / `var(--font-mono)` throughout `apps/dock/src/app/globals.css` (e.g. `:57`, `:93`, `:187`, `:240`). But **no scale exists**: `moon.css` and `tokens.ts` declare no size ramp, and Dock sets sizes ad hoc — `:188` `clamp(44px, 6.2vw, 76px)`, `:199` `clamp(1.75rem, 3.4vw, 2.75rem)`, `:275` `clamp(26px, 2.7vw, 38px)`, `:507` `clamp(30px, 3.8vw, 52px)`, `:664` `clamp(34px, 4.5vw, 56px)`, `:842` `clamp(28px, 4vw, 42px)`, `:890` `clamp(24px, 3.4vw, 36px)`, plus fixed `9/10/11/12/13/14/15/18/19/20/22px` rules (`:94`, `:404`, `:291`, `:225`, `:210`, `:533`, `:554`, `:737`, `:559`, `:400`, `:321`).

**Cited evidence:** `docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained` says only "*a mono eyebrow, a two-tone display motto*". That is *usage of two families on one band*, not a five-step scale. The link resolves (§4) but does not carry the claim.

**Verdict on the row as an outside observer: the checked status is **over-stated relative to its own link**; the deliverable as written ("establish a scale") is not met.** This is reported, not re-opened — the row stays checked; see §5 for what G04 may claim.

**Later gate that still owns the substance: UI2-G05** (token contract) and **UI2-G06**; a typography scale is a shell/token deliverable. If G05 is later ticked on the strength of "tokens are single-sourced", the size-ramp gap must be named, not absorbed.

---

### 2.3 · UI-F07 — P1 · D2 · dep UI-F05 · **checked** · in gate scope

**Deliverable (verbatim):** "Define responsive 360/390/768/1024/1440/1920 width behavior and avoid horizontal page overflow."

**True at `fe8e84c`:** overflow containment is real and tested — `apps/dock/test/responsive-accessibility.test.mjs:122` ("responsive layout safeguards and horizontal overflow containment"), the measured fix `2d223fc` (`apps/dock/src/app/globals.css:22` lines of `.dk-header` wrap / `.dk-nav` order+flex-wrap), and the harness at `scripts/ui/visual.spec.mjs:46-48` which measures `documentScrollWidth` vs `clientWidth`, `horizontalOverflowPx` and `elementsOutsideViewport` per record.

**Cited evidence, read in full:** `docs/audit/ui-screens-evidence-38560d3.md:29-40` exists and does report `pageOverflow = 0` at every tested width — **but only at 390, 768, 1440, 1920**, on the **home page's `SpaceGrid` only**, and its own §"Known limitations" item 2 states "*Geometry measured on the hub-offline branch — the hero block above it differs and was verified by typecheck/build, not by measurement.*"

**Verdict: the checked row's link is sound as far as it goes and narrower than the row text.** Two of the six named widths (360, 1024) have never been measured or asserted anywhere: the committed harness breakpoints are `[390, 768, 1440, 1920]` (`git show HEAD:docs/audit/screens/geometry.json → breakpoints`), and `scripts/ui/visual.spec.mjs:46-48` pairs 768 with height 1024, so "1024" in the row is a **height** in every artifact, not a width. Note also that the row and the governing rule disagree: ADR-0009 §2.6 prescribes "DOM geometry at 390 / 768 / 1440 / 1920 px", i.e. four widths, so F07's six-width text was never the adopted contract.

**Reported, not re-opened.** Smallest remaining deliverable if the owner wants the literal text satisfied: measure/emit 360 and 1024 **widths**, or amend the row to ADR-0009's four-width contract. **Later gate: UI2-G07** (breakpoint set is its DoD: "390/768/1440/1920 × id/en + reduced motion").

---

### 2.4 · UI-F08 — P1 · D2 · dep UI-F04 · **unchecked** · in gate scope · *predecessor of checked F09*

**Deliverable (verbatim):** "Build/verify one common Crown/Logo/DistressedBorder pattern using semantic tokens and original SVG."

**True at `fe8e84c`:**

- One implementation of each, in the design-system owner: `packages/moonui/src/zine.tsx:18` `Crown` (tones `gold|cyan|pink`, sizes `sm|md|lg`, `:7`), `:122` `DistressedBorder`, `:138` `BrandLogo` — and `BrandLogo` **composes** `Crown` rather than redrawing it (`zine.tsx:16` comment, `:152`, `:193`). All three are exported from the package index: `packages/moonui/src/index.ts:76-77,82-84`.
- Tokens, not raw colour: `packages/moonui/moon.css:83-93` (`.m-crown-svg`, `[data-tone="cyan"]`, `[data-tone="pink"]`) and `:213-257` (`.m-distressed`, `.m-distressed-edge`, tone and edge variants). `02bd31b`'s message records the point: DistressedBorder "becomes one reusable torn-edge primitive instead of four scattered clip-path rules."
- Original SVG, in-source, no external script: `packages/moonui/src/icons/index.tsx` + the inline crown SVG; `docs/audit/ui-asset-ledger-d54ad43.md:87-101` explicitly classifies MoonUI crown/seal/icons as "inline JSX is source code, not a binary asset", and `scripts/check-ui-assets.mjs` check 2 (self-containment) passed 3/3 with zero violations.
- Real cross-app consumers of Crown/Logo: `apps/dock/src/ui/components/shell.tsx:238,362,389` (+ `BrandLogo` `:10`), `apps/dock/src/app/prisms/page.tsx:33`, `apps/dock/src/app/timeline/page.tsx:28`, `apps/dock/src/ui/components/sections.tsx:142,308,341`, `apps/headquarters/src/app/login/page.tsx:27,78`, `apps/headquarters/src/app/(admin)/page.tsx:136,249`, `(admin)/world-monitor/page.tsx:159`, `apps/headquarters/src/layouts/auth.tsx:2`, `apps/headquarters/src/layouts/vertical.tsx:2,48`.
- Asserted, not assumed: `packages/moonui/test/components.test.ts` covers Crown/DistressedBorder/BrandLogo (suite 26/26 recorded at `ddd58f4`, `docs/audit/qa-02-04-tokens-ddd58f4.md:16-30`).
- **The one gap:** `DistressedBorder` has **zero consumers outside the package.** A repo-wide grep for `DistressedBorder` in `apps/**` returns nothing; hits are confined to `packages/moonui/{src/zine.tsx,src/index.ts,moon.css,test/components.test.ts,dist/*}`.

**Verdict: PARTIAL.** Crown/Logo are genuinely "one common pattern … using semantic tokens and original SVG", built and adopted in Dock and HQ. DistressedBorder is built, exported, styled from tokens and unit-tested but **adopted by no app**, so the "one common … pattern" claim holds for two of three named members.

**Can it honestly be ticked? No — not while its own noun list is 2/3 shipped.** Smallest remaining deliverable: one real app use of `DistressedBorder` (a Dock section or HQ panel frame), **or** an owner decision that the primitive is library-only, in which case the row text should be amended rather than the code padded. **Later gates that still have unfinished scope against this row: UI2-G08** (asset-origin ledger for what the pattern may embed) and **UI2-G05** (token source-of-truth for the remaining apps). Checked F09 must not be read as proof that F08 finished — F09's link does not mention any of these three primitives (§4).

---

### 2.5 · UI-F09 — P1 · D2 · dep UI-F08 · **checked** · in gate scope

**Deliverable (verbatim):** "Implement reusable NavActive, AppTile, ProgressPanel, StatusLine and ContentCard where missing."

**Cited evidence:** `docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained` — read in full; it describes the Lighthouse four-space band, the Reader provenance strip and the UNILEX `details/summary` index. **It does not name NavActive, AppTile, ProgressPanel, StatusLine or ContentCard anywhere, and no test in the repository names them.**

**True at `fe8e84c`:** a repo-wide search across `apps/**` and `packages/**` finds **no component with any of those five names.** The only `StatusLine` hits are `packages/cli/src/index.ts`, `packages/cli/dist/index.d.ts` and `apps/arsy/test/m05-23-cli-locale.test.ts` — a CLI terminal affordance in a different domain, not a UI primitive. Functional analogues exist under different names: `apps/dock/src/ui/components/spaces.tsx:70` `SpaceCard` (tile), `apps/dock/src/ui/components/sections.tsx:470` `StationCard` / `:436` `NowPlayingCard` (content cards), `apps/dock/src/ui/components/shell.tsx:199-215` + `:293` nav-active marking (`aria-current` + `dk-nav-active`, pinned by `apps/dock/test/header-navigation-semantics.test.mjs` and `mobile-drawer-contract.test.mjs:178-185`).

**Verdict: this is a checked row whose link does not carry its claim.** Reported per the gate's instruction. It is *not* the same defect as "the work is missing" — the *capabilities* (active-route marking, tile, content card, status line) do ship, in `spaces.tsx`, `sections.tsx` and `shell.tsx`. The deliverable is satisfied by function under other names and unsatisfied by name. That is a legitimate scoped-implementation case only if it is recorded; it was not.

**Can it be ticked (it already is)?** G04 will not un-tick it. Recommended owner action, if any: append a one-line note to the row naming `SpaceCard`/`StationCard`/`NowPlayingCard`/`aria-current`+`dk-nav-active` as the adopted equivalents, so the five nouns stop reading as unbuilt components. **Later gate touching the same ground: UI2-G05** (shell primitives).

---

### 2.6 · UI-F10 — P1 · D2 · dep UI-F09 · **unchecked** · in gate scope · *predecessor of checked F11*

**Deliverable (verbatim):** "Add consistent 4-state data model: loading / empty / error / ready for every data-backed panel."

**True at `fe8e84c`:**

- The model is one shared contract: `apps/dock/src/ui/components/states.tsx:9` `PanelStateKind = 'loading'|'empty'|'error'|'ready'`, `:26` `PanelState` (loading → `role="status"` + `aria-live="polite"` + `Spinner`; error → `role="alert"` + `Alert tone="hot"`; empty → `EmptyState`; ready → children), `:81` `PanelOutcome<T>`, `:92` `OutcomePanel`, `:127` `readPanel` (a rejected read is an **error**, never an empty array — `:140`), `:161` `DataPanel` (streamed `Suspense` boundary so the panel itself owns the loading state).
- Which routes actually consume it, and which do not. `apps/dock/test/panel-state-contract.test.mjs:26-112` enumerates the covered set and asserts it per file: `constellation/page.tsx`, `patches/page.tsx`, `stations/page.tsx`, `schedule/page.tsx`, `denpa/page.tsx`, `reader/page.tsx`, `ui/components/reader.tsx` (`PanelState` `:101`), `stations/[id]/page.tsx`, `terms/page.tsx`, `figures/page.tsx` (`DataPanel` `:38`), `missions/page.tsx`. Grep confirms imports at `patches/page.tsx:6`, `figures/page.tsx:5`, `terms/page.tsx:10`, `missions/page.tsx:5`, `stations/page.tsx:16`, `reader.tsx:7`.
- Not only declared — driven. `apps/dock/test/panel-state-unavailable.test.mjs` (355 lines) compiles `states.tsx` and renders real markup against unavailable data, asserting outage ≠ empty. The regression that motivated it is pinned: `panel-state-contract.test.mjs:216-222` fails if `src/data/queries/denpa.ts` ever laundera a failure back into `[]`.
- Negative guards are explicit, and they name their own exclusions honestly: `:188-214` (no bare `<Alert>` panel error, no local `catch`), `:237-258` static routes (`timeline`, `prisms`, `studio`) must stay out of the panel API, `:260-300` withheld route (`research`) keeps a denial, `:295-311` detail routes (`terms/[stableId]`, `figures/[figureCode]`, `constellation/relations/[relationCode]`, `embed/[id]`) must return a real `notFound()`. Copy side: `apps/dock/src/lib/states-copy.ts` with 127 keys at 1:1 id/en parity, enforced by `apps/dock/test/states-copy-parity.test.mjs:11-14`.
- **The gap, precisely:** `apps/dock/src/app/page.tsx` — the home page, Dock's flagship data-backed route — is **not** in the covered set and contains **no** panel symbol (grep for `PanelState|readPanel|DataPanel|OutcomePanel` in that file → 0 hits) while it does read the hub (`:4 import { homePayload } from '@/data/queries/program'`). Its states are coarser than the contract: `:49-51` swaps the entire live page for `OfflineLanding` when `!payload.liveDataAvailable`, and `:73` renders `#world-monitor` only `{payload.signals?.length ? …}` — so an empty signals feed renders **no panel and no empty sentence**, and there is no loading or per-panel error branch. `docs/audit/ui-screen-audits-d54ad43.md:99` identified exactly this ("absence of per-panel loading/empty/error on `#world-monitor` and `#signals` … unblocks UI-F10"), and `ui-screens-evidence-38560d3.md` limitation 5 said "*`PanelState` is available but not yet adopted by existing pages*". `d66dc8f` then adopted it across 11 panels — and left the home page out.

**Verdict: PARTIAL, strongly met.** The 4-state model exists, is shared, is behaviourally tested, and covers every hub-reading route **except the home page's per-section panels**.

**Can it honestly be ticked? No** — the row says "every data-backed panel", and one public data-backed page is outside the contract. Smallest remaining deliverable: put `#world-monitor` and `#signals` on the home into `OutcomePanel`/`PanelState` with `states-copy` keys, and add `src/app/page.tsx` to `DATA_BACKED` in `panel-state-contract.test.mjs`. **Later gate that already owns exactly this: UI2-G06** (`todo-ui-2.md:35`, "Make existing loading/empty/error/ready states consistent per route; prefer Dock PanelState"; still `[ ]`). F10 must not be ticked and G06 left open as two tickets for one job.

---

### 2.7 · UI-F11 — P0 · D2 · dep UI-F10 · **checked** · in gate scope

**Deliverable (verbatim):** "Add explicit DEMO/PLACEHOLDER/PLANNED labels; never use fake live counters or false delivery stats."

**Cited evidence, read:** `docs/audit/ui-screens-evidence-38560d3.md#what-each-screen-actually-gained` — "*`CREATE` is `DEMO` and names M33*", plus the mockup chrome withheld ("the `01/12` index counter, a decorative search field, the footer strip, and the 13-item rail"), and the geometry table's status-word columns (`REAL, REAL, DEMO, REAL` / `NYATA, NYATA, DEMO, NYATA`).

**True at `fe8e84c`:** the vocabulary is a typed enum, not a styling choice — `apps/dock/src/ui/components/spaces.tsx:19` `SpaceStatus = 'REAL' | 'PLANNED' | 'DEMO'`, `:32-36` `statusLabel()` reading the catalogue, `:130-131` CREATE marked DEMO; wording is locale-paired in `apps/dock/src/lib/landing-copy.ts:95-96` (en) and the id block (`:206`). ADR-0009 §2.5 is the governing honesty rule. Counter-honesty holds in the places the row fears: `apps/dock/src/app/page.tsx:56` feeds `Hero` only `payload.counts.stations` / `payload.counts.countries`, i.e. real hub counts. The harness re-reads the same vocabulary from the app instead of hard-coding it (`git show HEAD:scripts/ui/paths.mjs:36-54`), so a copy change moves the assertion rather than breaking it silently.

**Verdict: the checked row is supported, with one naming caveat and one scope caveat.** (a) **`PLACEHOLDER` does not exist as a label anywhere in the repo** — only `REAL/PLANNED/DEMO`, matching ADR-0009 §2.5, which itself lists three words and no fourth; so the row's third noun is unused rather than violated. (b) The cited section evidences the **home page**; honesty on other public views is carried by *different* mechanisms (F15's rights/review vocabulary and the `research` fail-closed denial), which the link does not mention.

**Not re-opened.** If the owner wants the row and the ADR to agree, the fix is the row text (`PLACEHOLDER` is not part of the adopted honesty rule), not the code. **Later gate: UI2-G14** (mockup→route→status ledger) is where per-surface honesty claims get verified beyond the home page.

---

### 2.8 · UI-F12 — P1 · D3 · dep UI-F05 · **unchecked** · extended inventory (outside the literal G04 row)

**Deliverable (verbatim):** "Ensure bilingual id/en UI keys and locale-preserving links; keep source-language direction independent."

**True at `fe8e84c`:**

- *Links are locale-preserving and the rule is a two-direction test.* `apps/dock/src/lib/locale-context.mjs:18` `localizedDockHref()` (the only place a `/id`/`/en` prefix is produced, incl. unsupported-locale collapse `:27-29` and query/hash preservation `:34-36`), `:46` `dockHrefFor(locale)`, `:52` `currentDockLocale`, `:72` `clientDockLocale`, `:82` cookie persistence. `apps/dock/src/middleware.ts:44-59` resolves the prefix, 404s a foreign two-letter segment, refuses a locale-prefixed `/api`, and rewrites to the bare route forwarding `x-mw-locale` / `x-mw-route-path` / `x-mw-route-search` (`:6-9`, `:58`). Adopted in **20 files** (`grep -rl dockHrefFor|localizedDockHref apps/dock/src` → every page under `src/app`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `layout.tsx`, `spaces.tsx:12`).
- *The negative half is enforced.* `apps/dock/test/locale-href-contract.test.mjs` scans all of `src`, extracts every `href`/`action`/`href:` target (`:71-80`), permits only **four** documented bypasses (`:29-50`) and fails both ways: an unlisted bypass, and a listed exception whose lines are gone ("so exceptions cannot quietly accumulate", `:26-27`). `docs/audit/ui2-g10-locale-boundary-47b89f4.md:115-133` clause 10 re-pins the same rule independently so this gate does not depend on another's suite. The one deliberate escape is honest and self-marking: `reader/compare/page.tsx` is bypassed "*carried as a follow-up in the UI-F12 evidence note*" (`:45-49`).
- *Source direction independence is the unfinished half.* `docs/audit/ui2-g10-locale-boundary-47b89f4.md:57-68` records `GAP-DENPA-UNATTRIBUTED` (the projected transmission row carries no `language`/`direction` field at all) and `GAP-READER-TRANSLATION-DIR` (`/corpus/reader` translation rows carry `languageCode` but no `direction`, so Dock infers `rtl` from one Arabic literal at exactly one site). Both are **blocked on hub projections owned outside Dock**, and clause 9 of the coverage test keeps the gap from being "fixed" by a silent detector.

**Verdict: PARTIAL.** The links clause is DONE-VERIFIED to the standard the row states (with a named, test-listed follow-up on `/reader/compare`). The source-language-direction clause is **not met and cannot be met inside Dock**.

**Can it honestly be ticked? No.** Smallest remaining deliverable: (i) route `reader/compare` links through `dockHrefFor` and delete its bypass entry, (ii) two hub projection fields (`direction` on corpus translations; `language`+`direction` on Denpa transmissions), tracked as ARSY/M06 work, not UI work. **Later gate that still owns this: UI2-G10** — whose row (`todo-ui-2.md:39`) is explicitly `[ ]` for the same two reasons. Ticking F12 while G10 stays open double-counts.

---

### 2.9 · UI-F13 — P0 · D2 · dep UI-F05 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Define server-side auth/role checks for HQ/private routes; preserve BFF/httpOnly and D00 rules."

**True at `fe8e84c`:**

- Server-side **role** checks exist and are not client-side decoration: `apps/headquarters/src/lib/authz.ts:19` `DenialCode = 'forbidden'|'unavailable'`, `:50` `decideAccess`, `:82` `guardModel`, `:87` `guardView`, `:97` `guardEndpoint`, delegating to the hub's `/auth/me` and the published `_schema` ACL (`:11` comment) — so HQ gains no local role table, which is the D00 (single identity/authorization authority, `BLUEPRINT.md:21`) requirement.
- Guards run **before any record read** on 7 surfaces: `(admin)/models/[model]/new/page.tsx:29`, `.../[model]/[id]/page.tsx:31`, `.../[model]/page.tsx:38`, `(admin)/page.tsx:119`, `(admin)/system/page.tsx:17`, `(admin)/views/[view]/page.tsx:25`, `(admin)/world-monitor/page.tsx:97`. Denials render a data-free localized widget (`apps/headquarters/src/ui/widgets/AccessDenied.tsx`, `apps/headquarters/src/lib/denial-copy.ts`), and a hub outage denies as `unavailable`, never as logged-out (`authz.ts:47-58`).
- BFF/httpOnly preserved: `apps/headquarters/src/lib/session.ts:8` single `hq_token`, `:13-17` `httpOnly: true`, `sameSite: 'lax'`, `secure` **true by default in production** and only downgraded by an explicit `HQ_COOKIE_SECURE=false`; `readToken()` server-only. `apps/headquarters/src/middleware.ts:4-16` keeps only `/login` and `/api/session` public and redirects everything else.
- Tested: `apps/headquarters/test/hq-authz-guard.test.ts` (~621 lines, 23 cases per `fe21e6d`, covering allow/forbidden/anonymous/outage/rule-delegation; the pre-refusal, op-passthrough and no-credential-leak clauses are the last three cases at `:568`, `:584`, `:600`), wired into the root suite by `8543b83` and run by `package.json:40`.
- **The gap:** two private HQ routes are **not** guarded — `apps/headquarters/src/app/(admin)/models/page.tsx` and `apps/headquarters/src/app/(admin)/views/page.tsx`. Both call `getSchema()` and render the **entire registry** to any holder of a valid session cookie with no role decision: `models/page.tsx:7-17` emits every model name, owning addon, `dataTier`, delete policy and the list of declared operations; `views/page.tsx:6-15` emits every view key, its `from` model, addon and limit. The `(admin)/layout.tsx:5-8` check proves only that a session is alive — which is exactly the shape `fe21e6d`'s own message describes as "the affordance was the lie". `docs/audit/M20-02-review-queue-evidence.md:46-55` independently confirms the action-level half of the original finding is still open (`apps/headquarters/src/data/actions.ts:44-79` redirects the hub's `errorMessage` into a query parameter).

**Verdict: PARTIAL, with a substantive residual.** The pattern, the guards, the denial UX, the cookie posture and the tests are all real. The coverage claim ("HQ/private routes") is 7/9 pages, and the two unguarded ones are an information-exposure surface (schema/ACL topology) rather than a privilege-escalation one.

**Can it honestly be ticked? No — it is a P0 row and the smallest deliverable is small:** apply `guardEndpoint`/`guardView`/`guardModel`-equivalent decisions (or an explicit documented "registry read is any-operator" rule with a test) to `(admin)/models/page.tsx` and `(admin)/views/page.tsx`, plus the `actions.ts` denial-UX item. **Later gates touching the same ground: UI2-G09** (HQ form components + a11y/role tests, still `[ ]`) and **UI2-G12** (negative/error E2E matrix).

---

### 2.10 · UI-F14 — P1 · D3 · dep UI-F08 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Create icon vector pipeline: title/ARIA, no external scripts, license and content hash."

**True at `fe8e84c`:** the pipeline exists as code, and it is the gate that finds the real defects, not the one that launders them.

- `scripts/check-ui-assets.mjs` (379 lines, committed in `7c6206a`) enforces four checks: SVG accessible name (`<title>` / `role="img"`+`aria-label` / `aria-hidden`), self-containment (no `<script>`, no `@import`, no remote `href`/`xlink:href`, no remote `<image>`, no base64 payload), a ledger row per served asset carrying origin/author/SPDX/consent **and the full SHA-256**, and reference-media containment (no app may reach `docs/design/mockups-xv/**`).
- The ledger is real data, not a template: `docs/audit/ui-asset-ledger-d54ad43.md:31-73` is 33 rows with digests, byte sizes, authoring commits and SPDX values; `:130-142` records the run: **32 violations → exit 1** (2 unnamed SVGs, 30 `RIGHTS_UNKNOWN` assets served from app `public/` dirs, 0 self-containment violations, 0 reference hits). `:144-160` proves the gate both ways (a conforming fixture passes; a single flipped hex char in a digest fails; each hazard fails separately). `docs/design/ASSETS.md` gained 9 lines of the naming rule in the same commit.
- **Three residuals.** (a) **Not wired to anything.** `grep ui:assets package.json` → nothing; the root manifest defines only `ui:check` (`package.json:51`), and `.github/workflows/ci.yml:52` runs `pnpm verify` alone. `docs/audit/ui-asset-ledger-d54ad43.md:6` describes the enforcer as "`node scripts/check-ui-assets.mjs` (`pnpm ui:assets`)" — **that script does not exist at this SHA**, and `docs/audit/qa-02-04-tokens-ddd58f4.md:99` records the same finding independently ("wired to **no** package script, hook or CI lane, so a served asset with `RIGHTS_UNKNOWN` cannot fail anything"). (b) **The pipeline is red by design and nothing has closed its own findings**: 30 unresolved rights rows, `apps/cockpit/**/favicon.svg` unnamed, `packages/moonui/src/client/s-meter.tsx:82` undecided (`ui-asset-ledger-d54ad43.md:101`). (c) `todo-ui.md` QA-01 — the acceptance gate this row feeds — is still `[ ]`.

**Verdict: PARTIAL.** The four named deliverables (title/ARIA check, no-external-script check, licence ledger, content hash) are built, documented, and proven to bite. The pipeline is a **command a human runs**, its first verdict is unresolved, and one claim in its own audit doc (the `pnpm ui:assets` registration) is false at HEAD.

**Can it honestly be ticked? No** — a check that nothing runs is not a pipeline. Smallest remaining deliverable: register it as `ui:assets` and give it a CI lane (or a deliberate, recorded decision to keep it manual), then clear the two unnamed SVGs. The 30 rights rows are **not** this row's to close. **Later gates: UI2-G08** (batch-2 asset-origin ledger, `[ ]`) and **UI2-G13** (CI green at exact SHA).

---

### 2.11 · UI-F15 — P1 · D3 · dep UI-F11 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Protect provenance, cited passage, editions, rights and review labels in every public view."

**True at `fe8e84c`:**

- One shared block replaces four drifting copies: `apps/dock/src/ui/components/provenance.tsx:16` `SourceEvidenceRecord`, `:35` `SourceEvidence`, consumed by `ui/components/actors.tsx:160,262,307,385,468,503,542` (figures, roles, events, avatars), `ui/components/constellation.tsx:70,121,153,349` (aliases, nodes, edges, conflicts), `ui/components/graph-relation.tsx:222,332` (relation + claim) and `ui/components/terms.tsx:86` — all verified by opening the files.
- The label catalogues are bilingual and enum-keyed: `apps/dock/src/lib/provenance-copy.ts:18` `provenanceCopy` (a `defineLocaleCatalog`), `:291` `getProvenanceCopy`, `:318` `rightsLabel`, `:327` `reviewLabel`; `:152`/`:160` in `ui/components/reader.tsx` route the Reader's rights state through `rightsLabel`.
- Tested as a contract, including the failure modes the row is about: `apps/dock/test/provenance-evidence.test.mjs` — "no public view keeps a private rights or review label map" (`:55`), "the provenance catalogue carries identical en and id key sets" (`:74`), "every rights and review status in the projections has a label in both locales" (`:96`), "an unknown status renders the raw code, never an empty string" (`:121`), "the shared block never renders a value-less row" (`:129`), "stays a server component" (`:152`), "a relation detail page hands its rendered locale to the view that names provenance" (`:164`), "views use only the class names their own stylesheet already defines" (`:169`). Reader-side denial is separately pinned by `apps/dock/test/reader-rights.test.mjs`, and the withheld-projection rule by `apps/dock/test/research-public-withholding.test.mjs`.
- **Residual:** `ui/components/reader.tsx` still prints English literals on a public, locale-rendered view — `:160` `{cleared ? 'RIGHTS CLEARED' : rightsLabel(…)}` (the cleared state bypasses the catalogue entirely), `:170` `Source identity`, `:177` `<summary>Full provenance, licence and retrieval record</summary>`; and `ui/components/terms.tsx:97-98` prints raw `review.classification` / `review.decision` next to a catalogue-labelled sibling. These are **known and deliberately deferred**: `docs/audit/ui2-g10-locale-boundary-47b89f4.md:103-113` lists "the residual literals … (Reader source-identity `<dt>` set, terms column labels and headings, Denpa panel titles, constellation/actors vocabulary)" as needing new copy for two locales — "a task of its own, not a missed key".

**Verdict: PARTIAL.** The protection mechanism (one shared block + one bilingual enum catalogue + eight contract tests) is DONE-VERIFIED; "in every public view" is met structurally and not yet fully linguistically, and the exception list is already written down and test-pinned so it cannot grow silently.

**Can it honestly be ticked? Only if the owner accepts that the deferred literals belong to UI2-G10, not to F15.** Defensible smallest deliverable: catalogue the three Reader strings (incl. the `RIGHTS CLEARED` branch) and the two terms badges, and extend `locale-boundary-coverage.test.mjs` clause 14 to those surfaces. **Later gate that still owns unfinished scope here: UI2-G10** (`[ ]`).

---

### 2.12 · UI-F16 — P1 · D2 · dep UI-F09 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Implement mobile drawer with Escape/focus restoration and route-active navigation."

**True at `fe8e84c`:**

- Implemented in one place: `apps/dock/src/ui/components/shell.tsx` — refs for trigger, dialog and previously-focused element (`:124` comment block; refs bound in the drawer body), `:140` `if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return }`, Tab trap walking a focusable list in both directions, focus moved on open and restored on close, `:242-244` trigger declaring `aria-controls="dk-mobile-menu"`, `:254-257` `div#dk-mobile-menu` as `role="dialog"` + `aria-modal="true"`, `:288` a second `nav.dk-mobile-nav` mapped from the same `NAV_LINKS:27`, `:293`/`:199` route-active `aria-current={active ? 'page' : undefined}` in desktop nav **and** drawer. CSS hides it at rest; the single breakpoint owner is `apps/dock/src/app/globals.css:754`.
- Pinned by a dedicated regression contract added in `d66dc8f`: `apps/dock/test/mobile-drawer-contract.test.mjs` — 14 `UI-F16` tests: refs (`:70`), Escape order and `preventDefault` (`:82`), two-way Tab trap (`:90-107`), the trap selector must be **identical** to the move-focus selector (`:109-116`, the classic bug where `hidden` makes the dialog escapable by Tab), capture-on-open/restore-on-close including ref clearing (`:121-131`), handler bound only while open (`:135`), trigger/dialog ARIA relationship (`:147`), hidden-not-styled-away (`:153`), localized accessible names for both close affordances (`:164`), route-active in **both** navs (`:178-185`), rendered closed state (`:191`), and rendered active-row marking (`:203-210`).
- Independently observed in a browser: the harness keyboard pass (`docs/audit/ui-visual-harness-d54ad43.md:127-140`) records `escapeClosesDrawer: true`, `focusRestoredToTrigger: true`, drawer `role=dialog`/`aria-modal=true`, `aria-current="page"` on exactly one link (`desktopActiveLinkCount: 1`), plus `drawer-en-390-open.png`.
- Not duplicated as a second navigation: `docs/audit/ui2-g05-shell-contract-47b89f4.md:206-216` verifies the drawer maps the same `NAV_LINKS` source, and `apps/dock/test/landmarks.test.mjs:252,313` fails on landmark duplication.

**Verdict: DONE-VERIFIED.** All three nouns — Escape, focus restoration, route-active navigation — are implemented, unit-contracted, and browser-observed.

**Can it honestly be ticked? Yes**, on `d66dc8f` (added the test) + `apps/dock/test/mobile-drawer-contract.test.mjs` + the recorded Dock suite at `ddd58f4` (208 pass / 0 fail, `docs/audit/qa-02-04-tokens-ddd58f4.md:74`), noting `docs/audit/ui-baseline-8737fe4.md:105` had already declared the implementation closed under M19-13/M19-18 with "remaining work is regression coverage", which is exactly what shipped. **Later gate that still has unfinished scope, so do not read F16 as "drawer testing is finished": UI2-G12** — the drawer's Escape/trap/restoration is asserted by a static+render contract and one manual harness pass, not by a CI-run E2E matrix; nothing in `.github/workflows/ci.yml` invokes `scripts/ui/`.

---

### 2.13 · UI-F17 — P1 · D2 · dep UI-F09 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Keep forms Field labels/error/help/focus; tabs roving arrow/Home/End; confirmation dialogs guarded."

**True at `fe8e84c`:**

- **Field**: `packages/moonui/src/form.tsx` (96 lines changed in `02bd31b`) wires `aria-describedby`/`aria-invalid` through `cloneElement` so no call site had to change; asserted at `packages/moonui/test/accessibility.test.ts:80-82` (hint described, valid field **not** marked invalid), `:85-100` (`aria-invalid="true"` + error-only description), `:113`, `:123`, `:129-134` (an explicit consumer attribute wins per-attribute), `:146-148` (a hidden FormData seed is not treated as a control). Used for real: 55 `<Field>`/`<TextInput>`/`<SelectInput>` usages across Dock and HQ, in `apps/dock/src/app/{missions,reader,stations,terms}/page.tsx`, `apps/dock/src/ui/client/{DenpaTransceiver,PatchesExplorer,ResearchExplorer}.tsx`, `apps/headquarters/src/app/login/page.tsx:1`, `apps/headquarters/src/ui/widgets/RecordForm.tsx`.
- **Tabs**: `packages/moonui/src/nav.tsx:80-86` implements ArrowRight/ArrowDown, ArrowLeft/ArrowUp, **Home**, **End**; `:111` `tabIndex={isActive ? 0 : -1}` (roving), `:116` `onKeyDown`; asserted by `accessibility.test.ts:25` ("WAI-ARIA tablist pattern and roving tabindexes"). Consumed in production by Cockpit (`apps/cockpit/client/App.tsx:587`, six tabs).
- **Focus**: `apps/dock/test/responsive-accessibility.test.mjs:80` pins `:focus-visible` outline rules for nav links and buttons in `globals.css`; reduced-motion is pinned at `:28`.
- **Dialogs**: the shared primitive was added in `02bd31b` — `packages/moonui/src/client/modal.tsx` (`Modal` exported at `src/client/index.ts:38`), labelled by its title, and `AlertDialog` interrupting as `role="alertdialog"` (`test/accessibility.test.ts:211-215`). Same commit fixed a crash class that was live in production: `Button`/`LinkButton` attaching an unconditional `onClick` made every server-rendered use throw "Event handlers cannot be passed to Client Component props", which is what `/terms` and `/reader` were doing.
- **Two residuals.** (a) *"confirmation dialogs guarded"* is satisfied at the **library** level and not at any **application** level: a repo-wide search finds **zero** consumers of MoonUI `Modal`/`AlertDialog`. The only confirmation dialog in production is still Cockpit's local `CockpitConfirmModal` (`apps/cockpit/client/App.tsx:14,710-721`), which predates the shared primitive — the same gap `docs/audit/ui-baseline-8737fe4.md:96` named as inventory gap 1. `docs/audit/ui2-g03-cockpit-preview-49ec20e.md` (UI2-G03, still `[ ]`) is the row that audits its destructive-action confirmations. (b) Six Dock range controls have **no accessible name**: `apps/dock/src/ui/client/GeneratorStudio.tsx:190,303,403,417`, `apps/dock/src/ui/client/Player.tsx:429`, `apps/dock/src/ui/client/TimeShiftPlayer.tsx:109` — none carries `id`/`htmlFor`/`aria-label` (verified by an 8-line context grep that returned nothing), and their captions are `<span className="m-label">` or bare `<span>`, which do not name a form control.

**Verdict: PARTIAL.** Field label/error/help/focus: met and tested. Tabs roving arrow/Home/End: met and tested. Confirmation dialogs guarded: built, exported, tested — **unadopted**. Accessible naming on Dock sliders: not met.

**Can it honestly be ticked? No.** Smallest remaining deliverable: give the six `type="range"` inputs an accessible name, and either migrate `CockpitConfirmModal` onto `AlertDialog` or record an explicit owner decision that the operator console keeps its own guarded dialog. **Later gates that still own scope here: UI2-G03** (Cockpit destructive-action confirmations, `[ ]`), **UI2-G09** (HQ form components + a11y/role tests, `[ ]`), **UI2-G12** (focus/keyboard E2E).

---

### 2.14 · UI-F18 — P1 · D3 · dep UI-F10 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Build visual test harness with screenshots at agreed breakpoints, id/en, reduced-motion."

**True at `fe8e84c`** (committed forms only; `scripts/ui/paths.mjs` and every PNG are dirty from concurrent sessions, so `paths.mjs` is cited via `git show HEAD:scripts/ui/paths.mjs`):

- The harness exists and is complete as a design: `git ls-files scripts/ui` → `ephemeral-hub.mjs`, `global-setup.mjs`, `paths.mjs`, `playwright.config.mjs`, `visual.spec.mjs`. Breakpoints `scripts/ui/visual.spec.mjs:46-48` = 390×844, 768×1024, 1440×900, 1920×1080 — **the set ADR-0009 §2.6 agrees to**; locales en/id; `:514-519` a reduced-motion pass (`motion: 'reduce'`, contract read from computed style at `:174-218`, including `.m-spinner { animation: none }` and `getAnimations()`); `:602` a keyboard pass. Screenshots are real files in Git (`git show HEAD:docs/audit/screens/geometry.json` names them with byte counts).
- It fails loudly rather than silently: unreachable spawned server → `beforeAll` preflight throws; a page still on `app/loading.tsx` is a failure, not a screenshot; a legitimately unrenderable screen is an **explicit skip with reason**, persisted to `geometry.json → skips[]` and "never converted into a green tile" (`docs/audit/ui-visual-harness-d54ad43.md:37-43`). Evidence is appended to a tmpdir JSONL before assertions so a hard failure still lands (`git show HEAD:scripts/ui/paths.mjs:62-79`). It binds only `127.0.0.1:3101`+ and refuses 3000–3005; the spawned process tree is killed and the port re-checked.
- It has already earned its keep: `docs/audit/ui-visual-harness-d54ad43.md:148-166` captured two measurable defects, and `2d223fc` fixed the header-clipping and rail-clipping ones using those numbers.

**Four residuals.** (a) **Not wired.** `package.json` has no `ui:visual` (only `ui:check`, `:51`), and `.github/workflows/ci.yml` contains no reference to Playwright, `scripts/ui` or the visual spec — `ci.yml:52` runs `pnpm verify` and nothing else. The harness's own doc says so (`:245-248`: "Not wired into `pnpm verify`, `pnpm ui:check` or CI … Nothing else invokes `scripts/ui/`") and `todo-ui-2.md:36` UI2-G07 is still `[ ]` for exactly this reason. (b) **The committed evidence run at HEAD is not green.** `git show HEAD:docs/audit/screens/geometry.json` → `baseline.runHead "278f26a"`, `totals.recordsWithFailures: 20`, `totals.maxElementsOutsideViewport: 68`, `hubMode: "offline-forced"`. Independently: `results[]` holds 35 records (32 `matrix` + 3 `term-detail`), of which 15 carry a non-empty `failures` array — e.g. "*8 interactive element(s) sit outside the viewport and are clipped*" with `a.dk-icon-btn` at `left: 1555 → 1629` on a 1440 viewport. The 20-vs-15 difference is not explainable from the artifact alone and should be re-checked by whoever re-runs. Note the run is at `278f26a`, which **predates** `2d223fc` and `bb1c98e` (verified by `git merge-base --is-ancestor 2d223fc 278f26a` → false), so the clipping it records may already be fixed; that inference is **not** evidence, and the dirty working-tree artifacts are not this SHA's evidence either. (c) **The live-data branch has never been measured**: `"Because the hub URL points at a closed port, every data-backed screen … was measured on the hub-offline branch — the live branch is NOT covered by these numbers."` (b) **Drift between the harness's own doc and the committed artifact**: `ui-visual-harness-d54ad43.md:79-105` reports the run at `bb75126` with `matrixRecords 32`, `skips 1`, 41 PNGs; the committed `geometry.json` at HEAD says `278f26a`, 35 records, `skips 0`, and `totals.reducedMotionRecords: 8` while `results[]` contains no `kind: "motion"` record (motion records are appended with kind `motion`, `visual.spec.mjs:397`, so they are counted but not individually reproducible from the committed JSON). The doc's §"What a screenshot does NOT prove" `:245-275` already anticipates this and asks for a final run after concurrent edits.

**Verdict: PARTIAL.** Built, covering all four nouns (screenshots, agreed breakpoints, id/en, reduced-motion), with honest failure behaviour — and **not wired to any script or CI lane, with its committed evidence run showing 20 failing records and zero live-hub coverage.**

**Can it honestly be ticked? No.** Smallest remaining deliverable: register `ui:visual` and give the owner a decision on CI membership, then re-run on a clean `fe8e84c` tree with a running hub so `geometry.json → baseline.runHead` equals the evidence SHA and the reduced-motion and live-branch records are reproducible. **Later gate that owns this outright: UI2-G07** (`[ ]`, "host-proven runner"). F18 ticked + G07 open would double-count the same harness twice.

---

### 2.15 · UI-F19 — P0 · D3 · deps UI-F12, UI-F18 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Run ui:check, lint, relevant test/typecheck/build; record exact command, output and SHA."

**True at `fe8e84c`:**

- Every category has been run and recorded **somewhere**, at an exact SHA, in a dated doc: `docs/audit/qa-02-04-tokens-ddd58f4.md:68-92` records at `ddd58f4` — `pnpm ui:check` 132 files / 0 violations, `npx eslint` 0 problems, Dock 208/208, MoonUI 26/26, `npx tsc --noEmit` exit 0, and CI run `40485038395` "Monorepo Verification & Safety Gates" **success** on a clean checkout of that SHA (the companion promotion job failed only because `dev` had moved to `fe8e84c` mid-run, which is the guard working). `docs/audit/ui2-g01-lint-25bd536.md` records the lint ledger at `25bd536`. `docs/audit/ui-visual-harness-d54ad43.md:245-275` and `docs/audit/ui-asset-ledger-d54ad43.md:144-160` record their own commands, outputs and baselines with the SHA each was taken at.
- **Three precise gaps.** (a) **No record ties the F-row set to a run.** The implementations landed 2026-10-27 between `02bd31b` (10:45) and `2d223fc` (13:47); their commit messages carry partial ledgers (`d66dc8f`: "Dock suite 71 -> 137 tests, typecheck clean, ui:check 0 violations") but no `docs/audit/` file records the full five-category run at one of those SHAs, and the surviving records (`ddd58f4`, `25bd536`) postdate the set and live under QA-02/03/04 and UI2-G01, not under UI-F19. (b) **`typecheck` is not in any gate.** `package.json:52` defines `verify = build && ui:check && lint && gen:sdk:check && test && build:web` — **no typecheck**; `package.json:48` defines a separate `pnpm -r typecheck` and `.github/workflows/ci.yml:52` never calls it. So the only typecheck proven at `ddd58f4` is Dock's, run locally; the monorepo-wide `pnpm -r typecheck` is unrecorded at every SHA in Git. (c) **Two of this set's own gates are outside every recorded run**: `scripts/check-ui-assets.mjs` (UI-F14) and `scripts/ui/visual.spec.mjs` (UI-F18) are in no script, no hook and no CI lane — see §2.10, §2.14.
- Also relevant: `docs/audit/qa-02-04-tokens-ddd58f4.md:31-67` shows `ui:check` is not the clean bill it looks like — the drift rule is a 26-entry **blocklist**, under which "13 off-token colour literals remain in Dock and HQ stylesheets" and the checker itself "claims three token values that `moon.css` no longer has". `pnpm ui:check` returning 0 is therefore a weaker signal than UI-F19's wording implies, and `docs/audit/ui2-g05-shell-contract-47b89f4.md:183-205` measures the same.

**Verdict: PARTIAL.** The runs happened and are recorded with commands, output and SHA — but as several dated, per-gate records, not as one UI-F19 record at a SHA where the F set was complete, and with two named categories (`-r typecheck`, the asset and visual gates) never included in any enforced run.

**Can it honestly be ticked? No** — this is a P0 "record the run" row, and the record it asks for (all five categories, one SHA, the whole set) does not exist. Smallest remaining deliverable: one `docs/audit/` entry at the SHA the owner chooses, running `pnpm ui:check && pnpm lint && pnpm -r typecheck && pnpm test && pnpm build:web` and recording each output; plus the `ui:assets` / `ui:visual` decision above. **Later gate that owns the CI half: UI2-G13** (`[ ]`, "Re-run full pnpm verify + workflow exact SHA … otherwise flag BLOCKED").

---

### 2.16 · UI-F20 — P0 · D4 · deps UI-F13, UI-F15, UI-F19 · **unchecked** · extended inventory

**Deliverable (verbatim):** "Audit public negative authorization/rights tests and approved release/no-go with rollback."

**True at `fe8e84c`:**

- *The test-audit half has substance.* `apps/arsy/test/public-projection-denial.test.ts` (1270 lines, tracked since `44a8640`) is exactly the named artefact: an honest negative matrix against a **real in-process hub**, no mocks, every claim labelled `DENIED` / `LABELLED-PERMISSIVE` / `PERMISSIVE-TODAY`, all fixture data synthetic and `SYNTH-`prefixed, and D08's absence proven from the live model registry rather than asserted (`:17-40`). It carries rows named for this leaf: `:876` "UI-F20 (PERMISSIVE-TODAY): ADMIN_WRITE leaves raw REST reads public on the projection source tables" enumerating 15+ `/orm/*` endpoints, and `:1015` "UI-F20 **LEAK (CONFIRMED)**: research routes publish licensed translation text that `corpus_translations` withholds". `docs/audit/qa-02-04-tokens-ddd58f4.md:102` keeps the second finding live and open. Companion negatives: `apps/headquarters/test/hq-authz-guard.test.ts` (401/403/anonymous/outage), `apps/dock/test/research-public-withholding.test.mjs`, `apps/dock/test/reader-rights.test.mjs`, `docs/audit/ui2-g02-rights-gate-49ec20e.md:198-243` (rights-negative evidence + verdict, UI2-G02 still `[ ]`).
- *The release/no-go half is not this row's to infer, and is documented as undecided.* `docs/audit/M27-08-readiness-blocker-2026-10-27.md:7-11`: "M27-08 remains **blocked by M19-19** … Do not freeze a preview manifest until this predecessor is satisfied"; the candidate tree "is also not a frozen release SHA"; no `docs/tasks/M27/M27-08.md` packet and no preview manifest/runbook existed at that check. `todo-ui-2.md:44` UI2-G15 (the strict preview/release exclusion manifest) is `[ ]`. No rollback runbook was produced by any UI row; `docs/architecture/RELEASE.md` defines evidence *states* only.
- *The gate dependency is itself unfinished:* F20 depends on F13 (PARTIAL, two unguarded HQ pages), F15 (PARTIAL, deferred literals) and F19 (PARTIAL, no unified run record). And two confirmed exposures sit inside its own subject matter: `RIGHTS_UNKNOWN` media served in production (`ui-asset-ledger-d54ad43.md:16`, 30 rows) and the translation-text leak at `public-projection-denial.test.ts:1015`.

**Verdict: PARTIAL, weighted NOT DONE.** A high-quality negative authorization/rights matrix exists and is committed; "approved release/no-go with rollback" does not, because the release gate is formally blocked by M19-19 and no decision or rollback artefact has been authored.

**Can it honestly be ticked? No, and it should not be.** It is P0/D4 whose own DoD is an approval, which an audit pass cannot grant. Smallest remaining deliverable: close the two named exposures (or record them as accepted), then have the owner produce the M27-08 preview manifest with candidate SHA, included/excluded routes, positive+negative checks and rollback steps. **Later gates: UI2-G02** (rights), **UI2-G13** (green CI), **UI2-G15** (release manifest, `[ ]`), plus the canonical **M19-19**/**M27-08** rows in `TODO.md`.

---

## 3 · Summary table

| Row | Gate scope | Verdict at `fe8e84c` | Core evidence (file:line) | Honestly tickable? | Later gate still owning unfinished scope |
|---|---|---|---|---|---|
| UI-F05 | **yes** | PARTIAL | `dock/src/layouts/site.tsx:13-26` · `app/layout.tsx:7` · `landmarks.test.mjs:133,168` · `hq/(admin)/layout.tsx:5-8` · `ui2-g05-shell-contract-47b89f4.md:54-109` | No — Cockpit/HQ shell contract absent | **UI2-G05**, UI2-G06 |
| UI-F06 | **yes** (checked) | Link under-supported → §4 | `moon.css:42-45` families only; `dock/globals.css:188,199,275,507,664,842,890` ad-hoc `clamp()`; no size ramp | (already ticked; not re-opened) | UI2-G05 |
| UI-F07 | **yes** (checked) | Link narrower than claim → §4 | `ui-screens-evidence-38560d3.md:29-40` = 4 widths, home only, offline branch; `ADR-0009 §2.6` | (already ticked) | UI2-G07 |
| UI-F08 | **yes** | PARTIAL (2 of 3 nouns adopted) | `moonui/src/zine.tsx:18,122,138` · `index.ts:76-84` · `moon.css:83-93,213-257` · consumers `dock/shell.tsx:238,362,389`, `hq/login/page.tsx:27,78` · **`DistressedBorder`: 0 app uses** | No — one primitive unadopted | UI2-G08, UI2-G05 |
| UI-F09 | **yes** (checked) | Link does not carry claim → §4 | five named components absent repo-wide; analogues `spaces.tsx:70`, `sections.tsx:436,470`, `shell.tsx:199,293` | (already ticked; needs a note, not an un-tick) | UI2-G05 |
| UI-F10 | **yes** | PARTIAL, strong | `states.tsx:9,26,81,92,127,161` · `panel-state-contract.test.mjs:26-112,188-214,216-222,295-311` · `panel-state-unavailable.test.mjs` · **gap `dock/src/app/page.tsx:49-51,73`** | No — home panels outside contract | **UI2-G06** |
| UI-F11 | **yes** (checked) | Supported, with caveats → §4 | `spaces.tsx:19,32-36,130-131` · `landing-copy.ts:95-96` · `page.tsx:56` real counts · ADR-0009 §2.5 | (already ticked) | UI2-G14 |
| UI-F12 | extended | PARTIAL | `locale-context.mjs:18,46,52,72,82` · `middleware.ts:6-9,44-59` · `locale-href-contract.test.mjs:20-50,71-80` · G10 `:57-68` two blocked gaps | No — `/reader/compare` bypass + source `dir` | **UI2-G10** |
| UI-F13 | extended | PARTIAL | `hq/lib/authz.ts:19,50,82,87,97` · 7 guarded pages · `session.ts:8,13-17` · `hq-authz-guard.test.ts:568,584,600` · **unguarded `(admin)/models/page.tsx:7-17`, `(admin)/views/page.tsx:6-15`** | No (P0) | UI2-G09, UI2-G12 |
| UI-F14 | extended | PARTIAL | `scripts/check-ui-assets.mjs` (379 ln) · `ui-asset-ledger-d54ad43.md:31-73,130-160` · **no `ui:assets` in `package.json`; `ci.yml:52` = `pnpm verify` only** | No — unwired and red | UI2-G08, UI2-G13 |
| UI-F15 | extended | PARTIAL | `provenance.tsx:16,35` · 14 consumer sites · `provenance-copy.ts:18,291,318,327` · `provenance-evidence.test.mjs:55,74,96,121,129,152,164,169` · literals `reader.tsx:160,170,177`, `terms.tsx:97-98` | Only if literals are assigned to G10 | **UI2-G10** |
| UI-F16 | extended | **DONE-VERIFIED** | `shell.tsx:124,140,242-244,254-257,288,293` · `mobile-drawer-contract.test.mjs:70,82,90,109,121,135,147,153,164,178,191,203` · harness keyboard pass | **Yes** | UI2-G12 (no CI E2E yet) |
| UI-F17 | extended | PARTIAL | `form.tsx`+`accessibility.test.ts:80-134` · `nav.tsx:80-86,111,116` · `modal.tsx` `role="alertdialog"` `:211-215` · **0 app users of `Modal`/`AlertDialog`**; 6 unnamed `type="range"` | No | UI2-G03, UI2-G09, UI2-G12 |
| UI-F18 | extended | PARTIAL | `scripts/ui/{paths,visual.spec,global-setup,playwright.config}.mjs` · `visual.spec.mjs:46-48,514-519` · `git show HEAD:…/geometry.json` `runHead 278f26a`, `recordsWithFailures 20` | No — unwired, red, offline-only | **UI2-G07** |
| UI-F19 | extended | PARTIAL | `qa-02-04-tokens-ddd58f4.md:68-92` · `package.json:48,52` (`verify` has **no typecheck**) · `ci.yml:52` | No — no unified record; `-r typecheck` never run | **UI2-G13** |
| UI-F20 | extended | PARTIAL → NOT DONE | `apps/arsy/test/public-projection-denial.test.ts:17-40,876,1015` · `M27-08-readiness-blocker:7-11` (blocked by M19-19) | No — release/no-go is an owner approval | UI2-G02, G13, G15; **M19-19/M27-08** |

Net: **one** of the twelve unchecked rows (UI-F16) is DONE-VERIFIED; **ten** are PARTIAL with named remainders; **one** (UI-F20) is PARTIAL weighted NOT DONE. **No row is NOT DONE outright** — which is itself the headline: the anomaly is a ledger-reconciliation failure, not a stalled workstream.

---

## 4 · Checked-row integrity check (F01–F04, F06, F07, F09, F11)

Method: each link was fetched and the **named section** read in full; the claim was then re-tested against code, not against the doc. Anchors were checked against the real headings.

### 4.1 · `docs/audit/ui-baseline-8737fe4.md` — F01, F02, F03, F04

| Row | Anchor | Section exists | Heading found | Claim carried |
|---|---|---|---|---|
| UI-F01 | `#1-inventory-ui-f01` | yes | `:8` "## 1. Inventory (UI-F01)" | yes — apps/ports/surface table `:10-18`, 20 Dock routes `:22`, HQ routes `:27`, existing test contracts `:31-35` |
| UI-F02 | `#2-reference--owner--reality-map-ui-f02` | yes | `:37` "## 2. Reference → owner → reality map (UI-F02)" | yes — all 12 references mapped to owning code + reality + gap + status, with the honest result "one screen is fully shippable today" `:54` |
| UI-F03 | `#3-rights--licence-review-of-the-reference-assets-ui-f03` | yes | `:56` "## 3. Rights / licence review … (UI-F03)" | yes — 12-file table with byte sizes and SHA-256 prefixes `:60-73`, findings `:75-81` (no author, no SPDX, reference-only) |
| UI-F04 | `#4-moonui-primitive-inventory-ui-f04` | yes | `:82` "## 4. MoonUI primitive inventory (UI-F04)" | yes — primitives by category `:84-92`, plus five named gaps `:94-99` |

All four links resolve and carry what their rows claim. **No defect.** Expected staleness, not a defect: §4's gaps 1 ("No modal/dialog primitive is exported") and 4 ("No shared 4-state data component") were closed after the audit by `02bd31b` and `d66dc8f`; §1's route list and `:35`'s "These already cover parts of UI-F10 … UI-F19" are dated snapshots. Per the preflight rule (":50 … preserve history rather than rewriting dated evidence"), these stay as written and are cited as `8737fe4`-era facts.

One cross-check done against code rather than accepted from the doc: `:22`'s Dock route list vs `find apps/dock/src/app -name page.tsx` at HEAD — 20 page files, all present in the §1 enumeration. Consistent.

### 4.2 · `docs/audit/ui-screens-evidence-38560d3.md` — F06, F07, F09, F11

Both anchors resolve: `:29` "## Geometry (live app on :3001, `/en` and `/id`)" and `:42` "## What each screen actually gained". The link *structure* is sound; the *content coverage* is not equal across the four rows.

**Finding 1 — UI-F09's link does not carry its claim.** The cited section names none of the five required components, and no component with any of those names exists in the repository (§2.5). This is the clearest broken claim among the checked rows. It is not evidence of a missing capability (equivalents ship) but it **is** evidence that the tick was recorded against text that never mentions the deliverable.

**Finding 2 — UI-F06's claim is supported only as font-family usage.** The cited sentence is "*a mono eyebrow, a two-tone display motto*" (§2.2). The row's word is **scale**; no scale exists in `moon.css`/`tokens.ts` (§2.2). Over-stated link.

**Finding 3 — UI-F07's cited geometry covers 4 of the 6 named widths, 1 route, 1 branch.** The doc itself states the offline-branch limitation at `:52` (§2.3). Defensible as *scoped* evidence; not a complete satisfaction of the row text.

**Finding 4 (minor) — UI-F11's link supports `DEMO`/`PLANNED`/`REAL` but not `PLACEHOLDER`.** §2.7. Row and ADR-0009 §2.5 disagree; the code follows the ADR.

**Finding 5 — the doc's own limitation 5 predicts the F10 gap and is still true.** `:56`: "*`PanelState` is available but not yet adopted by existing pages*; adopting it across Dock is a separate refactor." `d66dc8f` then did that adoption for 11 panels; the home page remains outside it (§2.6). Citing this doc as F11 evidence while F10 stayed `[ ]` was therefore *correct* at `38560d3` — the anomaly is not that the successors were ticked wrongly then, but that the predecessors were never reconciled after.

**Finding 6 — F06/F07/F09/F11's gate results predate every F-row implementation.** `:16-27` records 71 tests / typecheck 0 / build green / `ui:check` 0 at `38560d3`. The Dock suite is now 208 (§2.15), so those numbers are historical and must not be re-used as current proof — consistent with the instruction that claims resting on pre-`fe8e84c` evidence be re-verified in code. This gate re-verified each claim against source, not against the ledger.

### 4.3 · The `d54ad43`-era docs, used only as leads

As instructed, `ui-screen-audits-d54ad43.md`, `ui-visual-harness-d54ad43.md` and `ui-asset-ledger-d54ad43.md` were treated as audits against the older baseline, so nothing in §2 rests on their prose alone:

- `ui-screen-audits-d54ad43.md:99` (raw hrefs, locale-less footer, missing per-panel states) → re-checked: every href it flags is now catalogue-bound and test-pinned (§2.8); the per-panel state item is re-checked and **still true** for `page.tsx:73` (§2.6). Its `:263` "pixel screenshots remain environment-blocked" is **superseded** by `scripts/ui/` + owner approval (`ui-visual-harness:11`).
- `ui-visual-harness-d54ad43.md` claims (41 PNGs, 32 records, 1 skip, 17 pass/26 fail at `bb75126`) → re-checked only against `git show HEAD:docs/audit/screens/geometry.json`, which disagrees (§2.14 residual d). No claim in §2 rests on this doc without a code or artifact confirmation.
- `ui-asset-ledger-d54ad43.md:6`'s "`pnpm ui:assets`" → **falsified at HEAD** by reading `package.json` (§2.10). Its 33-row ledger and its both-directions proof are cited only as what was *built*, not as a current green gate.

---

## 5 · What UI2-G04 can and cannot claim here

**Can claim, on the evidence above:**

1. The reconciliation is complete and per-row. For all twelve unchecked §2 rows: the deliverable is quoted verbatim, the true-at-`fe8e84c` state is named with opened-file line citations, exactly one verdict is assigned, and the smallest remaining deliverable is stated.
2. The §2 anomaly is **not** a stalled workstream. Eight of the twelve rows have dedicated implementation commits that are verified ancestors of `fe8e84c` (`git merge-base --is-ancestor`, each re-run here), and most carry their own contract tests. One row (UI-F16) is DONE-VERIFIED outright.
3. Three checked rows carry evidence links that do not support their own wording: **UI-F09** (names five components that exist nowhere, and its cited section never mentions them), **UI-F06** (font families are single-sourced; no *scale* exists), **UI-F07** (4 of 6 widths, 1 route, offline branch only). Reporting these is inside the gate's remit and is not "rewriting checked history": no tick was changed.
4. Two factual corrections to audit prose, each verified against the tree: `ui-asset-ledger-d54ad43.md:6`'s `pnpm ui:assets` does not exist at this SHA, and `ui-visual-harness-d54ad43.md`'s run numbers do not match the committed `geometry.json` at this SHA.
5. No retroactive completion was inferred anywhere: every PARTIAL names the missing noun, and the DONE-VERIFIED row (F16) is backed by a rendered-state contract test plus an observed browser pass.

**Cannot claim:**

1. **Any tick.** Nothing in `todo-ui.md` §2, `todo-ui-2.md` or `TODO.md` was edited. Verdicts here are *statuses for the owner to apply*, not applied statuses. G04 also cannot tick F10, F12, F13, F14, F15, F17, F18, F19 or F20 on this evidence — each has a named remainder.
2. **That anything passes.** No test, build, lint, `ui:check`, typecheck or the Playwright harness was run by this gate. Every pass/fail statement is quoted from a dated record with its own SHA and is labelled as such. The green CI at `ddd58f4` verifies a commit, not a deployment, and is not `fe8e84c`.
3. **That the working tree equals these verdicts.** Four concurrent sessions hold uncommitted edits in `apps/arsy/**`, `apps/skylink/**`, `apps/orbit/**`, `docs/audit/screens/**`, `scripts/ui/paths.mjs`, `todo-ui.md`, `TODO.md`. Anything those sessions ship can move a verdict; this doc is pinned to `fe8e84c` and any of its rows should be re-read against a later SHA before ticking.
4. **Scope beyond the literal row for F12–F20.** `todo-ui-2.md:33` names only `UI-F05/F06/F07, F08/F09, F10/F11`. §2.8–§2.16 were produced because the assignment asked for twelve rows, and they are labelled extended inventory. Closing G04 on them, or letting them imply anything about UI2-G05/G06/G07/G10/G12/G13/G15 status, would be an over-claim; those gates keep their own rows open on their own evidence.
5. **That a PARTIAL is a defect.** Several remainders are *correct* behaviour: the `reader/compare` bypass is a listed, reasoned exception; `research`'s denial and the detail routes' `404`s are deliberate non-states; the 30 `RIGHTS_UNKNOWN` assets are rights evidence the repository does not contain and this row must not invent.
6. **Ownership of the release decision.** UI-F20's second clause is an approval that an audit cannot grant; M19-19 → M27-08 remains the canonical ordering and is untouched here.
