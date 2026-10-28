# M25-05 — Cosmos/Time explorer proposal audit

**baseline_sha:** `dfc65564760eda4ced596f661bda3f84c2d755e5` (branch `dev`, short `dfc6556`).
**Task:** M25-05 — *Sketch optional Cosmos/Time explorer with proposal label*.
**Acceptance under test:** *"Not discoverable as shipped feature"*.
**State:** evidence complete; **not self-closed**. Only the integrator checks the TODO leaf. `TODO.md` was not modified by this task.
**Worker:** agent session. One design document, one validator and this audit were created; no application file was changed.

## 1. What was produced

| File | Kind | Purpose |
|---|---|---|
| `docs/design/M25-05-cosmos-time-explorer-sketch.md` | new | Proposal sketch: claim-type vocabulary, surface states, what data exists and what is absent, a11y/locale requirements, the non-discoverability mechanism, 13 owed decisions and the prerequisite table |
| `scripts/check-m25-05-proposal-boundary.mjs` | new | Dependency-free read-only tripwire (424 lines) that fails if the idea leaks into the shipped Dock surface or the document loses its proposal markers |
| `docs/audit/M25-05-cosmos-explorer-proposal.md` | new | This evidence record |

No route, page, component, navigation entry, sitemap entry, metadata record, search record, feature flag, copy string, dependency or environment value was added. No `docs/tasks/M25/M25-05.md` packet exists at this baseline (`ls docs/tasks/M25/` returns `M25-01.md`, `M25-03.md`, `M25-04.md`, `M25-06.md`, `M25-07.md`), so the TODO row and its acceptance sentence are the task statement.

## 2. Baseline facts re-observed for this audit

| Fact | Command / locator | Observed |
|---|---|---|
| Dock route count | `find apps/dock/src/app -name page.tsx \| wc -l` | 20 |
| No cosmos/astronomy/time route | `ls apps/dock/src/app` | `api constellation denpa embed error.tsx figures global-error.tsx globals.css layout.tsx loading.tsx manifest.ts missions not-found.tsx page.tsx patches prisms reader research schedule sitemap.ts stations studio terms timeline` — the only time-like path is the pre-existing eight-era narrative `timeline` |
| Navigation has 15 entries, none cosmos/time | `apps/dock/src/ui/components/shell.tsx:27-42` | `/`, `/stations`, `/reader`, `/terms`, `/figures`, `/constellation`, `/research`, `/prisms`, `/timeline`, `/patches`, `/denpa`, `/studio`, `/schedule`, `/#constellation`, `/#zine-poster` |
| Sitemap has 15 routes, none cosmos/time | `apps/dock/src/app/sitemap.ts:16-32` | same public routes, no sky or time explorer |
| Lunar clock is display-only | `packages/moonui/src/client/mts-clock.tsx:41-47` | mean-synodic fraction from a fixed epoch; renders `phasePercent`/`phaseName`/`lunarIcon`, stores nothing |
| Task packet absent | `ls docs/tasks/M25/` | no `M25-05.md` |

## 3. The gate

`node scripts/check-m25-05-proposal-boundary.mjs` checks six things: proposal markers (`PROPOSAL`, `NOT SHIPPED`, `NOT DISCOVERABLE`, prerequisites `P3`, `M25-01`, `M25-02`, `M25-04`) and the pinned `baseline_sha`; the absence of any implementation instruction or route literal in the sketch; that `apps/dock/src/app` has no cosmos/astronomy/time route other than the allowed narrative `timeline`; that `NAV_LINKS` has no cosmos/time destination; that `DOCK_SITEMAP_ROUTES` has no cosmos/time entry; and that `apps/dock/src` carries no cosmos/astronomy vocabulary.

Observed positive run:

```
$ node scripts/check-m25-05-proposal-boundary.mjs
PASS proposal markers present in docs/design/M25-05-cosmos-time-explorer-sketch.md
PASS no implementation instruction and no cosmos/time route literal in the sketch
PASS baseline dfc6556 pinned in the audit
PASS 33 Dock app paths scanned; no cosmos/astronomy/time route besides timeline
PASS NAV_LINKS entries=15; no cosmos/time destination
PASS DOCK_SITEMAP_ROUTES entries=15; no cosmos/time route
PASS 83 apps/dock/src source files scanned; no cosmos/astronomy vocabulary
NOTE absence is the mechanism: the explorer is a document, not a hidden feature
EXIT=0
```

Observed negative run:

```
$ node scripts/check-m25-05-proposal-boundary.mjs --self-test
...
SELF-TEST PASS: all 13 invalid fixtures rejected and all 3 valid fixtures accepted
EXIT=0
```

The 13 rejected fixtures cover: a document that loses `NOT SHIPPED`; a document that loses the `M25-02` prerequisite; a document that instructs "Add a cosmos route to the public header before release."; a document that instructs "Register the page in the sitemap after M25-04."; a document naming the literal `` `/cosmos ``; an audit without `baseline_sha`; a `NAV_LINKS` entry `/cosmos`; a `NAV_LINKS` entry `/time`; a sitemap entry `/cosmos`; a sitemap entry `/astronomy`; a route directory `cosmos/page.tsx`; a route directory `(public)/time/page.tsx`; and cosmos vocabulary inside `apps/dock/src`. The three accepted fixtures confirm the pre-existing narrative `timeline` route, a negated route sentence, and an allowed timeline archive path are not false positives.

`node --check scripts/check-m25-05-proposal-boundary.mjs` and `pnpm exec eslint scripts/check-m25-05-proposal-boundary.mjs` were run; both exited 0 with no diagnostics. `pnpm verify`, `pnpm typecheck` and application suites were not run: the change is two documentation artifacts plus one read-only script, with no TypeScript, runtime or application code change.

## 4. What the design does and does not claim

- **Claims:** the repository holds three unrelated time-like things (UTC persistence/transport, a display-only lunar-phase approximation, ordinal narrative eras), and a future explorer would need a claim type, source, unit and observer before it could honestly display anything.
- **Records as absent:** ephemeris, observer coordinates/timezone, an astronomy observation store (`astronomy_time_records` is a planned D10 table with no package), a pinned almanac edition, the claim-type field (M25-02 open), unit/calibration metadata (M25-04 open) and comparative-cosmos sources (M25-06 open).
- **Does not claim:** approval, a route, a label, a milestone slice, a data set, an owner, a release date, or that any astronomy value is known.

## 5. Limitations

1. **Design-only.** The acceptance is met negatively — nothing is shipped — and the gate keeps it so; no runtime behaviour was exercised because none exists.
2. **Tripwire scope.** The validator scans `apps/dock` and the two documents only. A future mention in another app, in HQ copy, or in an external index would not be caught.
3. **Vocabulary boundaries.** The forbidden segment list is a curated set (cosmos, astronomy, sky, time as a bare segment); a synonym outside the list would pass. The gate is a shipping tripwire, not a semantic parser or an access control.
4. **Line numbers are baseline-specific.** Re-locate by heading after documentation edits.
5. **No human review yet.** The integrator, not this worker, decides whether the sketch's cost/benefit is worth keeping.

## 6. Rollback

Delete exactly the three new files:

```text
docs/design/M25-05-cosmos-time-explorer-sketch.md
scripts/check-m25-05-proposal-boundary.mjs
docs/audit/M25-05-cosmos-explorer-proposal.md
```

Nothing imports them; no schema, route, runtime state, environment value or TODO status requires reversal. Preserve all unrelated worktree changes.

## 7. Required report fields

| Field | Value |
|---|---|
| `task_id` | M25-05 |
| `baseline_sha` | `dfc65564760eda4ced596f661bda3f84c2d755e5` |
| `worker` | agent session |
| `claimed_files` | the three new files in §1 |
| `actual_changed_files` | the same three; no existing file modified |
| `positive_test_and_output` | `node scripts/check-m25-05-proposal-boundary.mjs` → exit 0, six PASS lines, §3 |
| `negative_test_and_output` | `--self-test` → exit 0, 13/13 invalid fixtures rejected, 3/3 valid accepted, §3 |
| `security_rights_privacy` | No secret, environment value, private witness material or external content used. The sketch proposes no location collection and records observer coordinates as an open privacy decision. No rights or publication claim. |
| `reviewer` | unassigned |
| `rollback` | delete the three files listed in §6 |
| `result_sha` | commit recorded in the TODO row; worktree HEAD at final observation is the integration commit |
| `limitations` | §5 |
| `next_eligible_task` | Not selected here; `TODO.md` remains canonical |
