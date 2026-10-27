# M40-10 — Release acceptance audit: runtime evidence, rollback rehearsal, extraction review

**Task:** [M40-10](../tasks/M40/M40-10.md) · **Milestone:** [M40](../milestones/M40.md)
**Baseline (exact SHA):** `fe8e84c0c4e52becff95ef859ebf7db1cc1d4e7f` (`dev`)
**Evidence window:** `fe8e84c` → `91352a4a6b700c35637c272fa220342c285bd131`
**Reviewer:** the accepting agent session; the repository owner (`bjo163`) is the approver of the TODO row. No second human reviewer is recorded.
**Date:** 2026-10-27

`git diff --stat fe8e84c 91352a4 -- apps/orbit packages/lumen apps/lumen-runtime` is empty: the
ORBIT and LUMEN sources under test did not change while the evidence was being collected, even
though two other sessions landed a QA audit closure (`948db67`) and a DOCK edition audit
(`91352a4`) in the same window.

## 1. Worktree condition

The shared worktree carried other sessions' work throughout, and it still does. Paths that were
modified or untracked and are **not** part of this task: `TODO.md` (a stale copy that un-ticks
M40-09 — see §7), `apps/arsy/src/{app.ts,fastify.d.ts,modules/channels/index.ts}`,
`apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts`,
`apps/skylink/src/modules/routes.ts`, `apps/dock/next-env.d.ts`,
`docs/audit/M38-12-arsy-skylink-client.md`, `docs/audit/qa-02-04-tokens-ddd58f4.md` and the
`docs/audit/screens/**` PNG set.

Nothing from that set was staged. The M40-10 commit contains exactly:

```
apps/orbit/README.md
apps/orbit/src/app/layout.tsx
apps/orbit/src/lib/orbit-locale-header.ts   (new)
apps/orbit/src/middleware.ts                (new)
apps/orbit/test/orbit-locale-shell.test.mjs
apps/orbit/test/orbit-runtime-smoke.test.mjs (new)
docs/audit/M40-10-release-acceptance.md      (new)
docs/tasks/M40/M40-10.md                     (new)
TODO.md (two rows: M40-07, M40-10)
```

## 2. Frozen install and gates at the recorded SHA

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | `Done in 1.6s using pnpm v10.33.4`, lockfile untouched |
| `pnpm --filter @moonwitness/orbit test` (with `ORBIT_SCAN_BUNDLE=1 ORBIT_RUNTIME_SMOKE=1`) | 88 tests, 88 pass, 0 fail, 0 skipped |
| `node --test apps/orbit/test/orbit-cross-app-boundaries.test.mjs` | 16/16 pass, bundle scan 10.5ms |
| `node --test apps/orbit/test/orbit-runtime-smoke.test.mjs` (`ORBIT_RUNTIME_SMOKE=1`) | pass in 12.25s, six scenarios, no listener left |
| `pnpm --filter @moonwitness/orbit typecheck` | `tsc --noEmit`, clean |
| `npx eslint apps/orbit --max-warnings 0` | clean (exit 0) |
| `pnpm --filter @moonwitness/orbit build` | `✓ Compiled successfully in 2.9s`, TypeScript 3.8s, routes `ƒ /`, `ƒ /_not-found`, `ƒ /api/ops/state`, plus `ƒ Proxy (Middleware)` |
| `pnpm ui:check` | `Files scanned: 132 \| Total Violations: 0` |
| `pnpm --filter @moonwitness/lumen test` | 29 pass / 0 fail (the script builds first) |
| `pnpm --filter @moonwitness/lumen-runtime test` | 2 pass / 0 fail |

LUMEN/M41 needed no implementation work in this milestone window: all twelve M41 rows were
already closed, and both suites were re-run here so the M40-10 statement "M40-01..09 accepted
with the sibling LUMEN surface green" rests on a run rather than on memory.

Test count moved 85 → 87 → 88: two locale-contract tests (§3) and the runtime gate (§4).

## 3. A defect the gate caught: the document language did not follow the locale

The browser walkthrough opened `http://127.0.0.1:3007/?locale=id&mode=simulated` on the
production build and read the DOM:

```json
{ "lang": "en",
  "footer": "Sumber Data: Local Deterministic Simulation Engine (ARSY offline) · Kesegaran: STALE …",
  "skipLink": "Lompat ke konten utama" }
```

The copy was Indonesian and `<html lang>` was English. Cause: `apps/orbit/src/app/layout.tsx`
called `getRequestLocale()` with no argument, because a root layout has no `searchParams`, while
`page.tsx` resolved `?locale=` for itself. A screen reader would have read Indonesian text with
an English voice profile, and the mismatch was invisible to every unit test because the locale
catalog and the page resolution were both correct.

Fix, following the pattern DOCK already uses (`apps/dock/src/middleware.ts`):

- `apps/orbit/src/middleware.ts` (new, 25 lines) rewrites `x-orbit-locale` on every HTML request
  from `request.nextUrl.searchParams`, keeping the value only when `isLocale` accepts it. It
  *sets* rather than *deletes* on rejection, so a hand-forged request header is always overridden
  instead of passing through. `/api/` and `_next/` are outside its matcher.
- `apps/orbit/src/lib/orbit-locale-header.ts` (new) holds the single header name both sides use.
- `layout.tsx` reads the forwarded value and passes it to the same `getRequestLocale` the page
  uses, mapping the empty string to `null` so cookie / `Accept-Language` precedence still applies.

Verified at three levels. Functionally, in `orbit-locale-shell.test.mjs`, by calling the
middleware directly through `NextRequest` and reading the header rewrite Next emits:

```
?id  → x-middleware-request-x-orbit-locale = "id"   override list = "x-orbit-locale"
?fr  → ""        (unsupported value is not forwarded)
/    → ""
spoofed x-orbit-locale: id with no query → override list still "x-orbit-locale", forwarded ""
```

In the delivered HTML, from the runtime gate: `/?locale=id` → `htmlLang: "id"`,
`/?locale=fr` → `htmlLang: "en"` with no Indonesian label, `/?locale=id&mode=simulated` →
`htmlLang: "id"`. And in the browser after the fix:

```json
{ "lang": "id", "htmlLangAttr": "id",
  "footer": "Sumber Data: … · Kesegaran: STALE · …",
  "skipLink": "Lompat ke konten utama" }
```

`apps/orbit/README.md` gained a short **Locale** section stating the precedence and why the edge
entry point exists.

## 4. Runtime acceptance, per flow

`apps/orbit/test/orbit-runtime-smoke.test.mjs` is opt-in for the same reason the credential scan
is: it needs a build artifact and binds a port (`3107`, not the dev port, so a developer's own
`pnpm dev` is never disturbed). Each scenario spawns `next start`, waits on the BFF, asserts, and
kills the child in `finally`; the run ended with `netstat` showing no listener on 3007 or 3107.

The equivalent manual harness produced these responses (verbatim JSON lines; ports are the
ephemeral stand-in hubs):

**Auth flow — hub answers 401.**

```
{"label":"bff","status":401,"cacheControl":"no-store, no-cache, must-revalidate",
 "connectionStatus":"UNAUTHORIZED","freshness":"UNKNOWN",
 "reviewSurface":{"available":true,"origin":"http://localhost:3002"},"rows":{"ws":0,"ag":0,"tq":0}}
{"label":"page","status":200,"bytes":21150,"hubDenialHint=present":true,
 "spatialContainer=present":true,"twoDGrid=present":true,
 "liveBadge=absent":true,"freshBadge=absent":true,"htmlLang":"en"}
```

`hubDenialHint` is the rendered `ARSY: 401/403` badge — a string that only appears if that branch
rendered, unlike a bare `UNAUTHORIZED` substring which can also arrive inside a serialized props
object. Zero rows, `UNKNOWN` freshness, no live badge, no freshness claim.

**Live + locale flows — hub answers healthy and current.**

```
{"label":"bff","status":200,"connectionStatus":"LIVE_CONNECTED","freshness":"FRESH",
 "dataSource":"http://127.0.0.1:57582/api/v1 (ARSY Hub Verified)","rows":{"ws":1,"ag":1,"tq":1}}
{"label":"page-en","bytes":24171,"connectionBadge=present":true,"freshness=present":true,
 "dataSource=present":true,"localeSwitch=present":true,"offlineBanner=absent":true,
 "simulatedMarker=absent":true,"htmlLang":"en"}
{"label":"page-id","bytes":24359,"indonesianLabel=present":true,"indonesianFreshness=present":true,
 "englishLabel=absent":true,"englishFreshness=absent":true,"htmlLang":"id"}
{"label":"page-unsupported-locale","bytes":24191,"dataSourceLabelEn=present":true,
 "indonesianLabel=absent":true,"htmlLang":"en"}
{"label":"page-simulated","bytes":31708,"handoffInline=present":true,"simulatedMarker=present":true,
 "htmlLang":"en"}
```

**Stale flow — hub answers with an 11-minute-old timestamp.**

```
{"label":"bff","connectionStatus":"LIVE_CONNECTED","freshness":"STALE","rows":{"ws":1,"ag":1,"tq":1}}
{"label":"page","staleBadge=present":true,"connectionBadge=present":true,"freshBadge=absent":true}
```

**Offline, conflict and redirect flows.**

```
D refused socket     → OFFLINE, "…(Unreachable)", role="alert" rendered, no LIVE, no FRESH
E conflicting URLs   → OFFLINE, dataSource "UNKNOWN_HUB (Unreachable)", no origin claimed
F hub replies 302    → OFFLINE, "(Unreachable)", {"label":"decoy","requestsReceived":0}
```

Scenario F is the runtime confirmation of the defect M40-09 found: the decoy that would have
answered with a healthy payload received **zero** requests, so a hub redirect cannot launder
another origin into `LIVE_CONNECTED`.

**Approval, keyboard and 3D/2D flows (browser, production build, simulated fixture).**

Selecting `task-sec-401` with the keyboard (`focus()` + `Enter`) produced:

```json
{ "pressed": "true",
  "href": "http://localhost:3002/review?task=task-sec-401&role=SECURITY_AUDITOR",
  "linkRel": "noopener noreferrer", "linkTarget": "_blank",
  "boundary": "ORBIT hanya mengamati. ORBIT tidak dapat menyetujui, menolak, atau menerbitkan — …",
  "simulatedNotice": "PROVENANCE: SIMULATED No live review queue is connected; this record is a simulated fixture.",
  "mutatingControls": 0 }
```

Then `Escape` → `{ "pressed": "false", "detail": false, "inspectorPresent": false }`, and
`performance.getEntriesByType('resource')` filtered on `/review|approve|publish/` returned `[]`:
ORBIT made no request that could decide anything; it produced one outbound link whose origin is
the server-validated surface and whose identifiers are URL-encoded.

The 3D and 2D surfaces were confirmed in the same document (`orbit-spatial-container` present,
`canvas` present after hydration, `orbit-2d-grid` present), and clicking the spatial header
control `Beralih ke Tampilan 2D` produced
`{ canvasPresent: false, fallbackText: "Cadangan 2D Aksesibel Aktif…" }` — the accessible
fallback replaces the canvas rather than sitting beside it.

The SSR HTML alone cannot show the handoff link: the inline row notice is server-rendered
(`handoffInline=present`), the link only exists once a task is selected, which is why the
walkthrough is part of this gate rather than a curiosity.

## 5. Rollback rehearsal

A disposable worktree was created at the recorded baseline and every ORBIT milestone commit was
reverted in reverse order, `--no-commit`:

```
git worktree add --detach …/mw-rollback-rehearsal fe8e84c
git revert --no-commit d1a311d   # M40-07 follow-up (another session)
git revert --no-commit ce99dfc   # M40-09 test portability
git revert --no-commit 93985d5   # M40-09 boundaries
git revert --no-commit 7d2e9d8   # M40-08 approval handoff
git revert --no-commit a5352e0   # M40-07 queues and inspectors
```

All five applied with no conflict. `git diff --name-only --diff-filter=U` was empty. The 25
resulting paths are:

```
TODO.md
apps/orbit/README.md
apps/orbit/src/app/{globals.css,page.tsx}
apps/orbit/src/components/{OrbitNodeInspector,OrbitOperationsWorkspace,OrbitQueueFilterBar,OrbitShellHeader}.tsx
apps/orbit/src/lib/{orbit-copy.ts,handoff/approval-handoff.ts,projections/{operational-projection.ts,types.ts},
                   queues/operational-queues.ts,server/{arsy-runtime-client.ts,review-surface.ts}}
apps/orbit/test/{orbit-approval-handoff,orbit-cross-app-boundaries,orbit-queues-inspectors,orbit-spatial-scene}.test.mjs
docs/{audit,tasks}/M40/M40-{07,08,09}*
```

Restricted to the paths the DoD names:

```
git diff --cached --name-only HEAD -- apps/arsy apps/headquarters apps/dock apps/skylink \
  apps/lumen-runtime packages scripts   →   (empty)
git diff --cached --name-only HEAD | grep -Ei "\.sql|\.prisma|migration|auth|session"  →   (none)
```

So rolling ORBIT back is an ORBIT-and-docs-only operation: it changes no ARSY, 100CENTER or DOCK
file, opens no table, runs no migration. The claim in `apps/orbit/README.md` ("Removing or
rolling back ORBIT changes nothing in ARSY, 100CENTER or DOCK data") is now backed by a rehearsal
instead of by assertion. The worktree was removed afterwards; `git worktree list` shows only this
session's main worktree plus other sessions' pre-existing ones, untouched.

## 6. Extraction review

Each M40 claim was re-read against output that exists in the repository:

| Claim | Supporting output |
| --- | --- |
| One hub, conflict fails closed | runtime scenario E: `UNKNOWN_HUB (Unreachable)`, no `Verified` in `dataSource` |
| Denials are stated, not hidden | scenario A: HTTP 401, `SECURITY`-traced projection (boundary suite), rendered `ARSY: 401/403` |
| `LIVE` only from a verified hub | scenarios B/C: `ARSY Hub Verified` in `dataSource`, `STALE` at 11 minutes |
| Outage is an outage | scenario D: `role="alert"`, `(Unreachable)`, zero live badges |
| No approval engine in ORBIT | browser: `mutatingControls: 0`, `requestsAfterInteraction: []`, boundary suite's absence checks |
| Review destination is ORBIT-owned | browser: href origin `http://localhost:3002` + fixed `/review` + encoded `task`/`role`, `rel="noopener noreferrer"` |
| Simulated data says so | `PROVENANCE: SIMULATED` notice and `SIMULATED` marker in the delivered HTML |
| Locale is a real flow, not a label map | §3: `htmlLang` per URL value, plus the browser `lang="id"` reading |
| 2D fallback is operable | browser: canvas removed by the toggle, fallback text rendered, skip link localized |
| Independent frontend build | `pnpm --filter @moonwitness/orbit build` alone produced the 3 routes + middleware |
| No credential in a client chunk | `ORBIT_SCAN_BUNDLE=1` scan, value-based against this machine's `.env` |
| ORBIT is a frontend, not a domain | boundary suite's extraction wording test, `BLUEPRINT.md` has no `D20.` |

**Not claimed, and still open:**

- HQ-side decision denial, four-eyes enforcement and role re-check: M20-06, M20-07, M37-05.
- Any production deployment or user-facing application release. The verified source was promoted
  from `dev` to `main` by CI, but no application deployment or production release occurred.
- A live 100CENTER review queue was never contacted; the link target was validated against the
  server-resolved surface, which in this environment is the loopback default.
- An ARSY regression lane: no path outside `apps/orbit` and `docs` changed here, and `apps/arsy`
  carried another session's unfinished Skylink client work, so a run would have measured their
  tree rather than this change. Reported as not-run rather than inferred as safe.
- Screen-reader and reduced-motion verification remains what the automated a11y contracts assert
  (landmarks, focus-visible, `prefers-reduced-motion`, `aria-live`, Escape handling); no
  assistive-technology pass with a human operator was recorded in this window.

## 7. Working-tree hazard observed, not touched

At the time of the original evidence window, the shared worktree's `TODO.md` carried a stale
single-line edit that un-ticked **M40-09**. That discrepancy was later reconciled in the
integrated TODO at `49180c9`; M40-09 is checked there with its exact-SHA evidence. This paragraph
records the historical worktree condition and is no longer a current hazard.

## 8. Rollback of this task

Revert the M40-10 commit. It touches `apps/orbit/**` (the locale edge entry point and layout),
two test files, `apps/orbit/README.md`, this audit, the packet and two TODO rows. `apps/orbit`
owns no table, no migration and no deployment, so reverting it returns the previous build
behaviour with no data step; the only functional consequence is that `<html lang>` stops
following `?locale=` again, which §3 documents as the pre-existing defect.

## 9. Exact-source revalidation and rollback at the integrated SHA

**Source SHA:** `f0dc50601db43fd86a897021c794477c986d9445` (`dev` and `main`). ORBIT and LUMEN
source files at this SHA are byte-identical to the M40-10 source under review; the only ORBIT
source delta after the earlier evidence window is the M40-10 locale/runtime gate introduced by
`dbc5f01`. No ORBIT source changed after `f0dc506` during this evidence update. Exact GitHub Actions
run [40531091097](https://github.com/bjo163/moonwitnessxv/actions/runs/40531091097) completed
successfully and promoted this SHA to `main`.

At this source SHA, a fresh production build completed and generated `/`, `/_not-found`,
`/api/ops/state` and the proxy middleware entry. Next.js 16.4.3 emitted its middleware-convention
deprecation notice; the build exited 0. With `ORBIT_SCAN_BUNDLE=1` and
`ORBIT_RUNTIME_SMOKE=1`, `pnpm --filter @moonwitness/orbit test` passed **88/88** including the
client-bundle credential scan and six production-runtime scenarios (denial, healthy/stale state,
unreachable hub, conflicting hub URLs and redirect refusal). `pnpm --filter @moonwitness/orbit
typecheck` and `pnpm exec eslint apps/orbit --max-warnings 0` both exited 0.

A Chrome production-browser walkthrough against the fresh build observed:

- `/?mode=simulated` rendered `lang="en"`, a WebGL canvas, the accessible 2D grid and an explicit
  `PROVENANCE: SIMULATED` marker.
- Enter on the approval-required task selected the row and produced only the server-validated
  100CENTER link `http://localhost:3002/review?task=task-sec-401&role=SECURITY_AUDITOR` with
  `rel="noopener noreferrer"` and `target="_blank"`. There were zero mutating controls and zero
  requests matching review/approve/publish. Escape cleared selection.
- In a separate page, the view switch changed from one WebGL canvas to no canvas, while the 2D grid
  and accessible fallback text remained. `/?locale=id&mode=simulated` rendered `lang="id"` and
  localized copy.

The full exact-SHA rollback rehearsal used a disposable detached worktree at `f0dc506`. I applied
the inverse `apps/orbit` patch for every M40 source commit, in reverse order: `dbc5f01` (M40-10),
`d1a311d`, `ce99dfc`, `93985d5`, `7d2e9d8`, `a5352e0`, `3e89805`, `b24bedd`, `bf9d458`,
`007b7ac`, `fbf176e` and `724fb15` (the initial M40-01/02 scaffold). The last commit also contains
LUMEN; only its `apps/orbit` paths were reversed, preserving the separate LUMEN implementation.
`git diff --quiet 724fb15^ -- apps/orbit` returned 0: the rollback restored ORBIT byte-for-byte
to the pre-scaffold tree. The staged rollback contained 46 paths, all under `apps/orbit`; checks
under `apps/arsy`, `apps/headquarters`, `apps/dock`, `packages/lumen` and `apps/lumen-runtime`
returned empty. `git diff --cached --check` passed, no conflict remained, and the temporary
worktree was removed. This full path-scoped rehearsal supersedes the earlier five-commit rehearsal
in §5 and demonstrates that removing ORBIT leaves ARSY/HQ/Dock and the independently owned LUMEN
code untouched.

The extraction review in §6 remains in force: ORBIT has no database, identity or approval owner;
HQ-side decisions, deployment, a live 100CENTER queue and ARSY production certification are not
claimed. Exact CI at this source SHA also covers the current LUMEN workspace tests. An independent
read-only review of the updated packet and this evidence found no remaining M40-10 blocker.
