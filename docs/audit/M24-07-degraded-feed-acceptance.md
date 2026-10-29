# M24-07 — Degraded-feed acceptance: evidence

**Task:** M24-07 — "Test invalid/late/offline feed, timezone, geographic ambiguity" (P2/D4).
**Acceptance under verification:** "Degraded provider displays uncertainty and source state".
**State:** a pure, zero-import classification contract plus deterministic `node:test` cases. It is **not wired** into `apps/sentinel/src/index.ts`, the Hub `/monitor/ingest` handler, the `/monitor/overview` response or the Headquarters World Monitor page. No live provider, feed, network call, credential, rights approval or deployment was exercised. The integrator verifies; AI review is not rights/privacy approval.

**Baseline `dev` HEAD:** `79da153a599292b0ab17897215287c7fbfb7da93` (recorded before writing). Prerequisites are ancestors of this HEAD:

```
git merge-base --is-ancestor 2b28d8c HEAD  -> exit 0
git merge-base --is-ancestor 07d3d7d HEAD  -> exit 0
2b28d8c6783ff5c8b06bf7488254ff3ae1e53853 feat(moonui): classify observation freshness so stale fixtures are never rendered live
07d3d7db47c81008996953fe04eca34f559c4384 feat(sentinel): encode moderation authority review with a punitive-action denial contract
```

The shared worktree already contained other sessions' modified/untracked files (cockpit client, `docs/audit/screens/*`, HQ/cockpit web assets, `next-env.d.ts` files, among others). This worker touched only the files listed below and never staged, committed, stashed, checked out, rebased or pushed.

## Delivered files

| File | Change | Purpose |
|---|---|---|
| `apps/sentinel/test/degraded-feed-contract.ts` | new, 346 lines | Pure `evaluateFeedOutcome(input, context)` contract; no imports, no clock, frozen results, no input echo. |
| `apps/sentinel/test/degraded-feed-contract.test.ts` | new, 318 lines | 25 `node:test` cases: positive controls, every reason code, no-echo and no-clock checks. |
| `apps/sentinel/package.json` | one-line edit (`scripts.test`) | Adds the new test file to the package test run; nothing else changed. |
| `docs/audit/M24-07-degraded-feed-acceptance.md` | new | This evidence record. |

No `TODO.md`, `apps/sentinel/src/**`, Headquarters file, manifest beyond that one line, CI or unrelated document was edited. `apps/sentinel/dist/**` is ignored, so the build produced no tracked artifact.

## The real code lines behind the three defects

The M24-05 audit recorded the defects; these are the current lines that the contract is written against:

1. **Missing publish time is replaced by the wall clock, twice.**
   - `apps/sentinel/src/index.ts:158` — the worker sends `publishedAt: sig.publishedAt ?? new Date().toISOString()` to `/monitor/ingest`.
   - `packages/moonql-monitor/src/index.ts:947` — the Hub repeats the fallback: `publishedAt: body.publishedAt ? String(body.publishedAt) : new Date().toISOString()`.
2. **`lastCheckedAt` is a fetch stamp, not an observation time.**
   - `packages/moonql-monitor/src/index.ts:952` — ingest writes `lastCheckedAt: new Date().toISOString()` with `healthStatus: 'healthy'`; `monitor_sources.lastCheckedAt` is declared at `:180` and the source seeds omit it.
3. **The HQ page has no source-state/uncertainty label.**
   - `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:345` — `<LiveDot on={src.healthStatus === 'healthy'} />` renders the pulsing live dot from a stored enum, not from freshness or a source state.

The contract therefore (a) never substitutes `fetchedAtUtc` for a missing `publishedAt`, (b) carries the fetch instant in a separate `fetchedAtUtc` field with the invariant `fetchedAtIsObservationTime: false`, and (c) makes `sourceState` and uncertainty codes part of every result.

## Contract shape and rules

`evaluateFeedOutcome(input, context)` takes the exact feed fields plus an explicit evaluation context:

- Input: `{ sourceState, fetchedAtUtc, publishedAt: string | null, timezone: string | null, geoPrecision, observedValue: number | null }`.
- Context: `{ evaluatedAtUtc, ttlSeconds }` — both mandatory. There is no default `now` and no default TTL; omitting either withholds the result.

It returns `{ display, reason, uncertainty, sourceState }` (frozen). `uncertainty` carries `codes`, the normalized `fetchedAtUtc`/`observedAtUtc` in UTC ISO-Z, `observedAgeSeconds`, `ttlSeconds`, `timezoneRecognized`, `geoPrecision`, `geoIsExact`, `valuePresent` and `fetchedAtIsObservationTime: false`. The model imports nothing, reads no clock/environment/network, and includes no input text in its result.

Reason-code matrix (observed by assertions):

| Condition | `display` | `reason` | Observation instant |
|---|---|---|---|
| Online, valid distinct publish time, age ≤ TTL, IANA zone, EXACT/CITY geo, finite value | `LIVE` | `null` | publish, normalized to UTC Z |
| Source declares `DEGRADED`, within TTL | `DEGRADED` | `FEED_DEGRADED` | publish |
| Age > declared TTL | `STALE` | `FEED_STALE` | publish, age > TTL |
| Source `OFFLINE` | `OFFLINE` | `FEED_OFFLINE` | `null` |
| Source `UNKNOWN`, missing or unrecognized | `WITHHELD` | `FEED_UNKNOWN_STATE` | `null` |
| `publishedAt` missing | `DEGRADED` | `PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION` | `null` |
| `publishedAt` naive/date-only/unparseable | `WITHHELD` | `PUBLISH_TIME_INVALID` | `null` |
| `publishedAt` later than `evaluatedAtUtc` | `WITHHELD` | `PUBLISH_TIME_IN_FUTURE` | `null` |
| `publishedAt` identical to `fetchedAtUtc` (substitution cannot be ruled out) | `DEGRADED` | `FETCH_TIME_IS_NOT_OBSERVATION_TIME` | `null` |
| `fetchedAtUtc` missing | `WITHHELD` | `FETCH_TIME_MISSING` | `null` |
| `fetchedAtUtc` not UTC ISO-Z | `WITHHELD` | `FETCH_TIME_INVALID` | `null` |
| `timezone` absent | `DEGRADED` | `TIMEZONE_MISSING` | publish |
| `timezone` is `+07:00`, `WIB`, empty or unknown | `DEGRADED` | `TIMEZONE_INVALID` | publish |
| `geoPrecision` `UNKNOWN`/null/absent | `DEGRADED` | `GEO_PRECISION_UNKNOWN` | publish; `geoIsExact: false` |
| `geoPrecision` `REGION`/`COUNTRY` | `DEGRADED` | `GEO_PRECISION_TOO_COARSE` | publish; precision shown, `geoIsExact: false` |
| `observedValue` null/NaN | `DEGRADED` | `VALUE_MISSING` | publish |
| `evaluatedAtUtc` absent/invalid | `WITHHELD` | `EVALUATED_AT_MISSING` / `EVALUATED_AT_INVALID` | `null` |
| `ttlSeconds` absent/≤0/non-number | `WITHHELD` | `TTL_MISSING` / `TTL_INVALID` | `null` |
| Input not an object | `WITHHELD` | `INPUT_INVALID` | `null` |

Codes are de-duplicated and emitted in a fixed priority order, so equal inputs serialize equally. Exactly-at-TTL is inside the window; TTL+1 s is stale. `CITY` remains displayable but `geoIsExact` is `false`; `EXACT` is the only precision that sets it true.

## Positive evidence

Working directory `apps/sentinel`, exit 0:

```
pnpm exec tsx --test --test-name-pattern="keeps a fresh|labels an in-TTL|normalizes an offset|keeps city|exactly at its declared TTL" test/degraded-feed-contract.test.ts
✔ M24-07 keeps a fresh online feed with exact geography and an IANA zone live while showing source state (14.1113ms)
✔ M24-07 labels an in-TTL degraded provider DEGRADED with a visible code and source state (0.3828ms)
✔ M24-07 normalizes an offset publish time to UTC ISO-Z derived from the input (0.3116ms)
✔ M24-07 keeps city precision and a zero reading visible without claiming an exact location (0.3123ms)
✔ M24-07 treats a record exactly at its declared TTL as inside the window (0.3286ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 123.2192
```

The first case is the acceptance in executable form: `sourceState: 'ONLINE'`, publish `2026-02-03T04:00:00.000Z`, fetch `2026-02-03T04:05:06.000Z`, `Asia/Jakarta`, `EXACT`, value `42.5`, evaluated `04:05:10Z`, TTL 600 s returns `LIVE`, `reason: null`, `sourceState: 'ONLINE'`, empty codes, 310 s age and distinct fetch/observation instants. The second returns `DEGRADED` / `FEED_DEGRADED` / `sourceState: 'DEGRADED'` while still inside the TTL.

## Negative evidence

Working directory `apps/sentinel`, exit 0:

```
pnpm exec tsx --test --test-name-pattern="reports a missing|refuses a publish|withholds|rejects|marks a feed older|degrades|displays coarse|echo no" test/degraded-feed-contract.test.ts
✔ M24-07 reports a missing publish time instead of substituting the fetch instant (19.6398ms)
✔ M24-07 refuses a publish time identical to the fetch time as a possible substitution (0.4204ms)
✔ M24-07 withholds instead of reading a clock when the evaluation instant is missing (0.8298ms)
✔ M24-07 rejects an evaluation instant that is not UTC ISO-Z (0.2292ms)
✔ M24-07 withholds a naive, date-only or unparseable publish time (0.6158ms)
✔ M24-07 withholds a future-dated publish time instead of treating it as fresh (0.2876ms)
✔ M24-07 marks a feed older than its declared TTL as STALE, never LIVE (0.2625ms)
✔ M24-07 degrades a feed whose timezone is absent (0.1126ms)
✔ M24-07 rejects offsets, abbreviations, blank and unknown timezones (0.3663ms)
✔ M24-07 degrades unknown geography and never marks it exact (0.481ms)
✔ M24-07 displays coarse geography with its precision and does not call it exact (0.3654ms)
✔ M24-07 degrades a feed with a missing or non-finite value (0.3558ms)
✔ M24-07 withholds a malformed input payload (0.0815ms)
✔ M24-07 withholds a missing or unusable TTL (0.3302ms)
✔ M24-07 withholds a feed whose source state is unknown or unrecognized (0.4143ms)
✔ M24-07 withholds a feed without a usable fetch instant (0.3709ms)
✔ M24-07 results echo no payload text, hostname, coordinate, timezone or value (0.3381ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 136.6149
```

Key assertions: a null publish time returns `PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION` with `observedAtUtc: null`, `observedAgeSeconds: null` and `fetchedAtUtc` still shown, so the fetch instant is never promoted; a publish time equal to the fetch time returns `FETCH_TIME_IS_NOT_OBSERVATION_TIME` with `observedAtUtc: null`; omitting `evaluatedAtUtc` returns `EVALUATED_AT_MISSING` and two calls are byte-identical (no clock default). `+07:00`, `WIB`, empty and `Not/AZone` are all `TIMEZONE_INVALID`; `REGION`/`COUNTRY`/`UNKNOWN` keep their precision with `geoIsExact: false`.

Focused full run, exit 0:

```
pnpm exec tsx --test test/degraded-feed-contract.test.ts
✔ M24-07 keeps a fresh online feed with exact geography and an IANA zone live while showing source state (14.7279ms)
✔ M24-07 labels an in-TTL degraded provider DEGRADED with a visible code and source state (0.4008ms)
✔ M24-07 normalizes an offset publish time to UTC ISO-Z derived from the input (0.3177ms)
✔ M24-07 keeps city precision and a zero reading visible without claiming an exact location (0.3039ms)
✔ M24-07 treats a record exactly at its declared TTL as inside the window (0.3294ms)
✔ M24-07 reports a missing publish time instead of substituting the fetch instant (0.301ms)
✔ M24-07 refuses a publish time identical to the fetch time as a possible substitution (0.3042ms)
✔ M24-07 withholds instead of reading a clock when the evaluation instant is missing (0.4362ms)
✔ M24-07 rejects an evaluation instant that is not UTC ISO-Z (0.2392ms)
✔ M24-07 withholds a naive, date-only or unparseable publish time (0.6465ms)
✔ M24-07 withholds a future-dated publish time instead of treating it as fresh (0.322ms)
✔ M24-07 marks a feed older than its declared TTL as STALE, never LIVE (0.2482ms)
✔ M24-07 degrades a feed whose timezone is absent (0.1165ms)
✔ M24-07 rejects offsets, abbreviations, blank and unknown timezones (0.2768ms)
✔ M24-07 degrades unknown geography and never marks it exact (0.4144ms)
✔ M24-07 displays coarse geography with its precision and does not call it exact (0.4419ms)
✔ M24-07 degrades a feed with a missing or non-finite value (0.3257ms)
✔ M24-07 withholds a malformed input payload (0.0844ms)
✔ M24-07 withholds a missing or unusable TTL (0.4013ms)
✔ M24-07 reports an offline feed as OFFLINE with its source state (0.1582ms)
✔ M24-07 withholds a feed whose source state is unknown or unrecognized (0.3634ms)
✔ M24-07 withholds a feed without a usable fetch instant (0.4183ms)
✔ M24-07 results echo no payload text, hostname, coordinate, timezone or value (0.2912ms)
✔ M24-07 evaluates without reading the wall clock (0.2217ms)
✔ M24-07 model source contains no ambient clock call (0.2972ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 153.8984
```

## Package and static checks

From the repository root, exit 0:

```
pnpm --filter @moonwitness/sentinel test
ℹ tests 69
ℹ suites 0
ℹ pass 69
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3335.3502
```

The same command run against the five previously enumerated test files (without the new file) reported `tests 44`, `pass 44`; the 25 new cases account for the difference and no other test file changed.

```
pnpm --filter @moonwitness/sentinel build       # exit 0
pnpm --filter @moonwitness/sentinel typecheck   # exit 0
> tsc --noEmit && tsc --noEmit -p test/tsconfig.json
```

The test project references `../tsconfig.json`, so typecheck requires the build first (same project-reference order already recorded in M24-04).

```
pnpm exec eslint apps/sentinel/test/degraded-feed-contract.ts apps/sentinel/test/degraded-feed-contract.test.ts
eslint exit=0
```

## Security, rights and privacy

- No network, provider, credential, token, environment value or live observation is used. Fixtures use the reserved `feed.example.test` hostname, fictional coordinates `-6.2, 106.8`, constant timestamps and no real location or event.
- The model reads no ambient clock. A test replaces `Date.now` with a throwing stub for the duration of one evaluation, and another asserts the source contains no `Date.now(` or zero-argument `new Date()` call.
- Results are frozen and echo no payload text, URL, hostname, coordinate, timezone string or observed value; the no-echo test serializes a result containing extra payload markers and asserts each is absent. The fetch and observation instants are the only echoed time values, and both are normalized UTC ISO-Z derived from validated input.
- No log line, UI copy or locale catalog is added, so there is no new public text to review and no localization claim.
- A `DEGRADED` or `LIVE` result is a display classification only. It proves neither source accuracy nor rights clearance; the M24-03 egress gate and M24-04 adapter remain the authorities.

## Rollback

Delete `apps/sentinel/test/degraded-feed-contract.ts`, `apps/sentinel/test/degraded-feed-contract.test.ts` and this audit; revert the single `test/...` addition in `apps/sentinel/package.json`'s `scripts.test` line. Remove generated output with `rm -rf apps/sentinel/dist` if desired (it is ignored). No runtime path imports the model, so rollback restores the baseline exactly.

## Limitations

- **Contract only.** `apps/sentinel/src/index.ts:158` and `packages/moonql-monitor/src/index.ts:947` still substitute the wall clock at ingest, and `:952` still stamps `lastCheckedAt` as a fetch time. This task proves the classification, not the fix; a substituted value that arrives looking like a valid past publish time is indistinguishable from a real one.
- `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:345` still derives its live dot from `healthStatus`. No UI is wired and no label copy exists.
- No producer currently emits `DEGRADED`, a TTL, a timezone or a geography precision; the wiring task must supply those from the source record, never from request input.
- A publish time exactly equal to the fetch time is conservatively degraded because substitution cannot be ruled out; a legitimate source publishing within the same instant is therefore also degraded.
- `CITY` precision remains displayable while `EXACT` is the only precision reported as exact; that is a product choice, not a claim that city-level data is exact.
- IANA recognition uses the Node/ICU zone database; `+07:00` is rejected by shape even where the engine accepts offset zone identifiers. A future ICU rename could change recognition for a zone name.
- `publishedAt` accepts any explicit RFC 3339 offset and normalizes it; the separate `timezone` field is still required and is not used to reinterpret a naive publish time.
- Multi-code results expose one primary `reason` plus the full ordered `codes` list; consumers must display the list to show all uncertainty.
- No test proves a wall-clock substitution happened at ingest; it only proves the contract refuses to invent an observation time when one is absent.

## Next task

M24-07 is the last leaf in the M24 milestone table. The integrator verifies this evidence and updates `TODO.md`; ingest-side removal of the two clock fallbacks, a `DEGRADED` producer, and HQ source-state/uncertainty rendering remain separately authorized follow-up work. No further M24 leaf is eligible.

**Report fields:** `task_id` M24-07 · `baseline_sha` `79da153a599292b0ab17897215287c7fbfb7da93` · `worker` single-owner leaf · `claimed_files` the four files above · `actual_changed_files` the four files above · `result_sha` none (no commit; shared worktree) · `reviewer` unassigned · `rollback` delete the three files and revert the one `scripts.test` line.
