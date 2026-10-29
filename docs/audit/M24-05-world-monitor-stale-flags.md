# M24-05 — Source-backed public World Monitor with stale flags: evidence

**Task:** M24-05 — "Build source-backed public World Monitor with stale flags" (P2/D3).
**Acceptance under verification:** "Not showing stale fixtures as live observations".
**State:** a pure classification contract plus tests. It is **not wired** into `@moonwitness/moonql-monitor`, the Hub's `/monitor/overview` response, or the Headquarters page. No live provider, network call, credential, rights approval or deployment was exercised. The integrator verifies; AI review is not rights/privacy approval.

**Baseline `dev` HEAD:** `3e5e913eae5365855fca6ff71c051950889e79b5` (recorded before writing). Prerequisite M24-04 (`db1f232f9ae5c773eadbae6c7f1a917ab89a0b07`) is an ancestor of this HEAD (`git merge-base --is-ancestor db1f232 HEAD` exited 0). The shared worktree already contained other sessions' changes (cockpit client files, `docs/audit/screens/*`, `docs/audit/M19-04-accessibility-progress.md`, `apps/headquarters/next-env.d.ts`, and untracked `apps/headquarters/src/lib/monitor-copy.ts`). This worker touched only the three files listed below and never staged, committed, stashed, checked out, rebased or pushed.

## Package choice (reported as required)

`packages/moonql-monitor` is a `tsc -b` src-only project (`rootDir: ./src`) with **no `test/` directory, no test file style and no `test` script**. A focused test there would require adding a new `scripts.test` entry and a test harness to a manifest, which the task's manifest exception does not cover ("except adding your test to the owning package's test script if that script enumerates files" — there is no such script). `packages/moonui` is the established home for pure display-claim contracts (`src/claim-type.ts` from M25-02, `src/measurement-metadata.ts` from M25-04), has an existing `test/**/*.test.ts` glob runner that picks up a new file with zero manifest edits, and its tests import the built `../dist/*.js`. The module therefore lives in `packages/moonui/src/observation-freshness.ts`, and — matching `claim-type.ts` — it is **not** re-exported from `src/index.ts`; exporting it is an API decision for the wiring task.

## Delivered files

| File | Change | Purpose |
|---|---|---|
| `packages/moonui/src/observation-freshness.ts` | new, 369 lines | Pure `classifyObservationFreshness(input)` contract; no imports, no clock, frozen results, no input echo. |
| `packages/moonui/test/observation-freshness.test.ts` | new, 301 lines | 19 `node:test` cases (4 suites) in the package's `../dist/*.js` style. |
| `docs/audit/M24-05-world-monitor-stale-flags.md` | new | This evidence record. |

No manifest, CI, TODO, page, view or model file was edited. `packages/moonui/dist/**` is ignored (`.gitignore:11` records `dist/`), so the build produced no tracked artifact.

## Observed surfaces and the actual defect

The World Monitor data path is Hub → SDK → page, and nothing on it carries provenance or freshness:

- `packages/moonql-monitor/src/index.ts:70`, `:185`, `:369` — `monitor_radars`, `monitor_sources` and `monitor_signals` each ship an addon `seed:` block. These are demonstration rows, not observations.
- `packages/moonql-monitor/src/index.ts:180` declares `lastCheckedAt: ts({ null: true })`; the source seeds at `:185`–`:342` omit it, yet seed `healthStatus` as `'healthy'` (e.g. `:197`). A stored enum is not a freshness proof.
- `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:345` renders `<LiveDot on={src.healthStatus === 'healthy'} />`. A never-checked seed row therefore renders with the pulsing "live" dot. This is the acceptance's concrete violation.
- `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:165`–`:181` hardcodes "Telemetry Control Plane" and "SENTINEL 3-TIER ENGINE" above that snapshot.
- `packages/moonql-monitor/src/index.ts:705`–`:758` (`/monitor/overview`) returns rows unlabelled and spreads them whole (`...r` at `:748`, `...s` at `:753`), then truncates to 40 signals at `:756`. The HQ types in `apps/headquarters/src/data/queries/monitor.ts` therefore expose no `sourceKind`, `rightsRef`, `observedAt` or TTL.
- `packages/moonql-monitor/src/index.ts:947` — `/monitor/ingest` stores `new Date().toISOString()` when the worker omits `publishedAt`. That is a wall-clock value promoted to a source publication time and would defeat any freshness check that trusts it.
- `packages/moonql-monitor/src/index.ts:952` — the same handler stamps `lastCheckedAt` at ingest. That is the fetch instant, not a source observation instant (the M24-03 design already forbids treating a fetch time as observation time).
- `apps/headquarters/src/data/queries/monitor.ts:53`–`:54` — every transport or authorization failure collapses into `EMPTY_OVERVIEW`, so "the hub could not be reached" renders as zero counts.
- `apps/sentinel/src/provider-adapter.ts:252`–`:266` is the only code today that produces a payload `observedAt` from a source; M24-04 records that it is not wired into the worker cycle.
- Untracked `apps/headquarters/src/lib/monitor-copy.ts` (another session, UI2-P22c) already prepares honest copy ("never checked — freshness unknown", "no health recorded"). It was read for context and **not modified**; being uncommitted, it carries no line claim here.

No monitor model has a provenance or rights field, so **no current Hub row can be classified `PROVIDER`**. Every existing row is at best `SEED` provenance.

## Classification contract

`classifyObservationFreshness(input)` returns exactly `{ display, reason, liveReading, label, locale, localeFallback, ageSeconds }`. Gates run in a fixed order:

| Gate | Result |
|---|---|
| descriptor not an object | `WITHHELD` / `OBSERVATION_DESCRIPTOR_INVALID` |
| `sourceKind` absent | `WITHHELD` / `SOURCE_KIND_MISSING` |
| `sourceKind` not exactly `PROVIDER`/`SEED`/`FIXTURE`/`SYNTHETIC` | `WITHHELD` / `SOURCE_KIND_UNKNOWN` |
| `sourceRef` absent/blank | `WITHHELD` / `SOURCE_REFERENCE_MISSING` |
| `rightsRef` absent/blank | `WITHHELD` / `RIGHTS_REFERENCE_MISSING` |
| `SEED` / `FIXTURE` / `SYNTHETIC` and `liveOnly: true` | `WITHHELD` / `NON_OBSERVATION_WITHHELD_ON_LIVE_SURFACE` |
| `SEED` / `FIXTURE` / `SYNTHETIC` | `SYNTHETIC` / `SEED_RECORD_NOT_LIVE` \| `FIXTURE_RECORD_NOT_LIVE` \| `SYNTHETIC_RECORD_NOT_LIVE` |
| `observedAt` absent/blank | `WITHHELD` / `OBSERVED_AT_MISSING` |
| `observedAt` not `…Z` ISO-8601 | `WITHHELD` / `OBSERVED_AT_NOT_UTC` |
| TTL absent | `WITHHELD` / `TTL_MISSING` |
| TTL not a finite number > 0 | `WITHHELD` / `TTL_INVALID` |
| `now` absent / not `…Z` | `WITHHELD` / `NOW_MISSING` \| `NOW_NOT_UTC` |
| `sourceState` not `HEALTHY`/`DEGRADED` | `WITHHELD` / `SOURCE_STATE_UNKNOWN` |
| `now < observedAt` | `WITHHELD` / `OBSERVATION_IN_FUTURE` |
| age > TTL | `STALE` / `OBSERVATION_STALE` |
| age ≤ TTL and `sourceState: DEGRADED` | `DEGRADED` / `SOURCE_DEGRADED` |
| age ≤ TTL, no degradation | `LIVE_OBSERVATION` / `reason: null` |

`liveReading` is `true` only for `LIVE_OBSERVATION`; `label` is `null` only for `WITHHELD`; `ageSeconds` is `null` whenever an instant is missing or refused. A seed/fixture/synthetic record is `SYNTHETIC` even when it carries a fresh timestamp, because the kind gate runs before any timestamp gate.

## Positive evidence

Working directory `packages/moonui` after `pnpm build`, exit 0:

```
node --experimental-strip-types --test --test-name-pattern="live observations|labels non-observations" test/observation-freshness.test.ts
▶ M24-05 live observations
  ✔ classifies a fresh, source-backed, rights-referenced observation as live (1.1313ms)
  ✔ keeps a record exactly at its declared TTL inside the window (0.1181ms)
  ✔ labels an in-TTL observation as degraded when the source declares a degraded state (0.1036ms)
  ✔ labels an observation one second past its TTL as stale, never live (0.0987ms)
  ✔ renders the id label and falls back to en for an unsupported locale (0.109ms)
✔ M24-05 live observations (2.4931ms)
▶ M24-05 labels non-observations instead of rendering them live
  ✔ labels a seeded record SYNTHETIC even when it carries a fresh timestamp (0.1409ms)
  ✔ labels fixture and synthetic records SYNTHETIC with their own reason codes (0.0985ms)
  ✔ withholds a non-observation on a live-only surface instead of labelling it (0.1376ms)
✔ M24-05 labels non-observations instead of rendering them live (0.5335ms)
ℹ tests 8
ℹ suites 2
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113.3154
```

The seed case is the acceptance in executable form: `{ sourceKind: 'SEED', observedAt: <120 s old>, ttlSeconds: 600, now: <fresh> }` returns `SYNTHETIC`, `liveReading: false`, and a non-empty label, never `LIVE_OBSERVATION`.

## Negative evidence

Working directory `packages/moonui`, exit 0:

```
node --experimental-strip-types --test --test-name-pattern="refusals are fail closed" test/observation-freshness.test.ts
▶ M24-05 refusals are fail closed
  ✔ withholds a record without an observation timestamp (1.0404ms)
  ✔ withholds a local, offset or date-only observation timestamp (0.1739ms)
  ✔ withholds a missing, lowercase or unrecognized source kind (0.1168ms)
  ✔ withholds a record without a source reference or a rights reference (0.1072ms)
  ✔ withholds a record without a usable TTL (0.1404ms)
  ✔ withholds a record without a caller-supplied UTC evaluation instant (0.0993ms)
  ✔ withholds a future-dated observation instead of treating it as fresh (0.0902ms)
  ✔ withholds an unrecognized source state (0.0969ms)
  ✔ withholds a malformed descriptor (0.1068ms)
✔ M24-05 refusals are fail closed (3.1187ms)
ℹ tests 9
ℹ suites 1
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 90.2635
```

Every withheld case asserts `label: null`, `ageSeconds: null`, `liveReading: false` and a frozen result. `assertNoEcho` serializes the result and asserts it contains none of the fixture title, URL, summary, source reference, rights reference or observation timestamp, so a refusal cannot become a leak path and a label never repeats the record.

## Full package and static checks

From the repository root:

```
pnpm --filter @moonwitness/moonui test
ℹ tests 105
ℹ suites 17
ℹ pass 105
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 278.254
package test exit=0
```

Baseline before this task was 86 tests / 13 suites (observed by running the same command first); the 19 new cases in 4 suites account for the difference and nothing else changed.

```
pnpm --filter @moonwitness/moonui typecheck
> @moonwitness/moonui@1.0.0 typecheck Z:\project\moonradio\packages\moonui
> tsc --noEmit

typecheck exit=0
```

```
pnpm exec eslint packages/moonui/src/observation-freshness.ts packages/moonui/test/observation-freshness.test.ts
eslint exit=0
```

The Headquarters suite was **not** run because no Headquarters file was changed.

## What is not yet wired

1. `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:345` still derives the live dot from the stored `healthStatus` enum, so seeded, never-checked sources still render as live.
2. `/monitor/overview` (`packages/moonql-monitor/src/index.ts:705`–`:758`) exposes no `sourceKind`, `rightsRef`, `observedAt` or TTL, so the contract has no server-side input today.
3. `monitor_sources.lastCheckedAt` (`:180`) is a fetch stamp set by `/monitor/ingest` (`:952`), not an observation time; using it as `observedAt` would be wrong.
4. `/monitor/ingest` substitutes the wall clock for a missing `publishedAt` (`:947`). The contract cannot detect a substituted time; this must be fixed at ingest.
5. `apps/headquarters/src/data/queries/monitor.ts:53`–`:54` still collapses "unavailable" into an empty overview.
6. The module is not exported from `packages/moonui/src/index.ts` (deliberately, matching `claim-type.ts`), so no consumer can import it yet.
7. `DEGRADED` has no producer: no collector currently reports a source state, and M24-07 owns "degraded provider displays uncertainty and source state".

## Rights and privacy

No network, provider, credential, secret or live observation was used. All fixtures use reserved `.invalid`/example references and caller-supplied constant timestamps; the module reads no clock, environment, locale or store. Results are frozen and echo no input text, so a public surface cannot leak a source reference or payload through a label or refusal. A `rightsRef` is a producer-declared pointer, **not** proof of clearance; the M24-03 egress gate and M24-04 adapter remain the authorities. Label copy is en/id and has not had a native review.

## Rollback

Delete the three files above. There is no manifest, runtime, CI, generated-code or data change, and `dist/` is ignored, so rollback restores the baseline exactly.

## Limitations

- The evidence proves the classification contract only. It does not prove the Headquarters page, a Hub response, a collector run or a deployment.
- Classification is only as honest as the producer-declared `sourceKind`. The wiring task must set it from an immutable record origin (addon seed vs. adapter ingest), never from request input; a caller that labels seeded data `PROVIDER` defeats the contract by construction.
- The exactly-at-TTL boundary is defined as live and TTL+1 s as stale; that is a truth-table choice, not a physical guarantee.
- `ageSeconds` may be fractional when the instants carry sub-second precision.
- The absence of `sourceState` means "no degradation declared", not "health confirmed"; the contract makes no health claim.
- No test proves that a wall-clock value was substituted at ingest (`packages/moonql-monitor/src/index.ts:947`); the contract can only reject a timestamp it is given.

## Next task

**M24-07** — "Test invalid/late/offline feed, timezone, geographic ambiguity" (depends M24-05 and M24-06): consume `DEGRADED`/`STALE` on a surface that also shows source state and uncertainty, and add the ingest-side rule that a substituted clock time is never an observation time.

**Report fields:** `task_id` M24-05 · `baseline_sha` `3e5e913eae5365855fca6ff71c051950889e79b5` · `worker` single-owner leaf · `claimed_files` the three files above · `actual_changed_files` the three files above · `result_sha` none (no commit; shared worktree) · `reviewer` unassigned · `rollback` delete the three files.
