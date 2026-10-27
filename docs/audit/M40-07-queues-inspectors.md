# M40-07 — Task Queue, Workstation and Agent Inspectors Evidence

**Task ID:** `M40-07`
**Task Title:** Task queue, workstation and agent inspectors
**Baseline SHA:** `25bd5361b62ce558622cebaae12166c7bc73a87d` (`dev`)
**Date:** 2026-10-27
**Worker:** AI Pair Programmer
**Reviewer:** Root Integrator
**Status:** CLOSED (`- [x]`)

---

## 1. Summary of Deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), and [docs/tasks/M40/M40-07.md](../tasks/M40/M40-07.md), task `M40-07` delivers the filterable queues and detail/activity inspectors for `@moonwitness/orbit` on top of the M40-05 projection contract and the M40-06 runtime binding.

1. **Pure queue/derivation layer — [`operational-queues.ts`](../../apps/orbit/src/lib/queues/operational-queues.ts):**
   - `buildOperationalQueues(projection)` derives every panel plus honest counts (`workstations`, `agents`, `tasks`, `traces`, `approvalRequired`, `failed`, `blocked`) straight from the canonical projection with no re-ordering and no added records.
   - `filterTaskQueue`, `filterAgentQueue`, `filterWorkstationQueue`, `filterTraceQueue` accept status/priority/zone/state/assigned-agent/search predicates and return strict subsets.
   - `resolveActiveTask`, `resolveAgentTasks`, `resolveAgentTraces`, `resolveWorkstationTraces` link a selected node to its real bound tasks and real traces only, preserving canonical order.
   - `distinctZones` / `distinctAgentStates` / `distinctTaskStatuses` / `distinctTaskPriorities` generate filter options exclusively from values that exist in the projection, sorted and de-duplicated.

2. **Accessible filter toolbar — [`OrbitQueueFilterBar.tsx`](../../apps/orbit/src/components/OrbitQueueFilterBar.tsx):**
   - `role="search"` region with a `type="search"` input, `aria-expanded` + `aria-controls` disclosure, four labelled `role="group"` chip sets, and `aria-pressed` chip state.
   - A single shared search value filters all four panels at once; the clear action resets both chips and search.
   - The whole toolbar is `disabled` when the projection is restricted.

3. **Shared-selection workspace — [`OrbitOperationsWorkspace.tsx`](../../apps/orbit/src/components/OrbitOperationsWorkspace.tsx):**
   - One `selectNode` handler drives both the 3D spatial viewport and the 2D workstation/agent lists, so scene and list always resolve the same record; ids are asserted unique across collections.
   - A separate `selectTask` control opens a task inspector that reports only projected fields (`status`, `priority`, `id`, handoff payload) plus the agent actually bound to that task.
   - Fail-closed restricted view: `connectionStatus === 'UNAUTHORIZED'` yields zero displayable rows, an explicit `role="alert"` restricted notice, and a disabled filter bar — even if a future API returned partial arrays alongside the denial.
   - Honest degraded states: `queueEmptyState` when a filter matches nothing, `queueNoActivity` when a node has no bound trace, and the diagnosis-only `queueFailedState` for `OFFLINE`/`UNKNOWN`/errored projections.

4. **Bilingual copy — [`orbit-copy.ts`](../../apps/orbit/src/lib/orbit-copy.ts):** nineteen `queue*` keys added with exact `en`/`id` parity and genuinely distinct translations; the suite also proves every `copy.*` reference in the new components exists in both locales.

5. **Styling — [`globals.css`](../../apps/orbit/src/app/globals.css):** filter bar, panel titles, chip, empty-state, restricted/failed notice styles expressed only with MoonUI CSS variables; `:focus-visible` rings on chips; reduced-motion block preserved.

## 2. Claimed vs Actually Changed Files

| File | Change |
| --- | --- |
| `apps/orbit/src/lib/queues/operational-queues.ts` | Added (new pure derivation layer) |
| `apps/orbit/src/components/OrbitQueueFilterBar.tsx` | Added (new accessible filter toolbar) |
| `apps/orbit/src/components/OrbitOperationsWorkspace.tsx` | Modified (queue consumption, shared selection, restricted/failed/empty states, task inspector) |
| `apps/orbit/src/app/globals.css` | Modified (filter/panel/notice styles, token-only) |
| `apps/orbit/src/lib/orbit-copy.ts` | Modified (19 new `en`/`id` queue keys) |
| `apps/orbit/test/orbit-queues-inspectors.test.mjs` | Added (12 scoped positive/negative tests) |
| `docs/tasks/M40/M40-07.md` | Added (task packet) |
| `docs/audit/M40-07-queues-inspectors.md` | Added (this evidence) |
| `TODO.md` | Modified (M40-07 row closed with evidence links) |

No other file was modified by this task. `apps/dock` and `apps/cockpit` working-tree changes observed during this task belong to concurrently running sessions and were not staged, edited, or claimed here.

## 3. Verification Commands & Observed Results

### 1. ORBIT scoped suite (55/55 passing, 12 of them M40-07)
```bash
pnpm --filter @moonwitness/orbit test
```
```
ℹ tests 55
ℹ pass 55
ℹ fail 0
```
Positive M40-07 results:
```
✔ M40-07: buildOperationalQueues reports honest counts from the canonical projection
✔ M40-07: filterTaskQueue matches status, priority, agent and search without fabricating
✔ M40-07: filterAgentQueue and filterWorkstationQueue are deterministic subsets
✔ M40-07: scene and 2D list resolve the same record ids through shared selection
✔ M40-07: agent activity derives only from real traces and real bound tasks
✔ M40-07: shared search filters traces and workstation activity preserves canonical order
✔ M40-07: distinct filter options are sorted, de-duplicated and projection-derived
✔ M40-07: queue components exist and honour the accessibility + safe-state contract
✔ M40-07: new copy keys keep exact en/id parity
✔ M40-07: filter styling uses MoonUI tokens only, no rogue hex
```
Negative results (all inside the suite above):
```
✔ M40-07: corrupt and absent inputs fail safe to UNKNOWN/empty rather than throwing
✔ M40-07: fixture ground truth still has no fabricated LIVE provenance
```
Negative coverage specifically asserted: invalid `state`/`status`/`zone` map to `UNKNOWN` yet stay filterable; a non-array `recentTraces` counts as **0** records rather than throwing; an `UNAUTHORIZED` projection yields zeroed queues; a non-existent id resolves to `undefined` and `resolveActiveTask` returns `null` (no invented detail panel); unmatched search returns `[]` and never substitutes data.

### 2. TypeScript typecheck
```bash
pnpm --filter @moonwitness/orbit typecheck
```
Result: **exit 0, no errors.**

### 3. ESLint (errors and warnings)
```bash
pnpm exec eslint apps/orbit
pnpm exec eslint apps/orbit --max-warnings 0
```
Result: **clean, 0 errors and 0 warnings.** The four initial `react-hooks/exhaustive-deps` warnings from the fail-closed row selection were resolved by stabilizing `workstations`/`agents`/`tasks`/`traces` behind `useMemo`.

### 4. ORBIT production build
```bash
pnpm --filter @moonwitness/orbit build
```
Result: **Compiled successfully**, TypeScript finished, 3/3 static pages generated, routes `/`, `/_not-found`, `/api/ops/state` emitted.

### 5. Design-system / UI consistency linter
```bash
pnpm ui:check
```
Result: **Files scanned: 132 | Total Violations: 0 — PASSED.**

### 6. ARSY Radio/SIGNAL regression invariance
```bash
pnpm --filter @moonwitness/arsy exec tsx --test test/arsy-env-compat.test.ts test/moonql-web-kit.test.ts test/compose-contract.test.ts
```
Result: **28 passed, 0 failed.**

### 7. Known non-scope failure observed during the shared `build:web` run
```bash
pnpm build:web   # headquarters + dock + orbit
```
The combined run reached `@moonwitness/dock` and failed its typecheck at `apps/dock/src/ui/components/constellation.tsx:108` — `Cannot find name 'localeHref'`. That file is **uncommitted working-tree work owned by a different session** (last committed by `1a7efee feat(dock): state provenance, rights and review in every public view (UI-F15)`), is outside the ORBIT/LUMEN scope of this goal, and was deliberately not edited. ORBIT's own build (command 4) passes independently, and `build:web` for the web targets passed earlier in this task before the dock edit appeared in the shared tree. This is recorded as missing evidence for the *combined* artifact, not as an ORBIT regression.

## 4. Security, Rights and Privacy

- Zero new API surface: the queues are pure functions over the already-sanitized `OrbitStateProjection`; no endpoint, database, SQL driver, or identity owner was added.
- `sanitizePayload` from M40-05/M40-06 remains the only path from raw feed to view model, so the new panels inherit credential stripping; no new field can reach the browser unredacted.
- No service key, token, or hub credential appears in the new source, styles, copy, or test fixtures.
- Restricted (`UNAUTHORIZED`) state fails closed to an empty, explicitly-labelled view; nothing cached, partial, or stale is rendered in its place.
- Simulated provenance remains explicit: the suite asserts no `SIMULATED` record can be presented as `LIVE` through the queue layer.

## 5. Rollback

Reverting `M40-07` is additive-safe:
1. Delete `apps/orbit/src/lib/queues/operational-queues.ts`, `apps/orbit/src/components/OrbitQueueFilterBar.tsx`, and `apps/orbit/test/orbit-queues-inspectors.test.mjs`.
2. Restore `apps/orbit/src/components/OrbitOperationsWorkspace.tsx`, `apps/orbit/src/lib/orbit-copy.ts`, and `apps/orbit/src/app/globals.css` to the baseline blob at `25bd536`.
3. Restore the M40-07 TODO row to unchecked and delete this packet plus this audit file.
4. Run `pnpm --filter @moonwitness/orbit test` and `pnpm --filter @moonwitness/orbit typecheck`; M40-01..M40-06 evidence remains valid because no earlier file contract changed.

No ARSY, Headquarters, Dock, or 100CENTER data is touched by this change, so rollback has no data effect.

## 6. Result and Next Eligible Task

- **Result SHA:** recorded on the commit that contains this audit (see the commit reference in the push output).
- **Next eligible task:** `M40-08` — Human-approval handoff to Headquarters / 100CENTER. Note that `M40-08` lists `M20-02/M20-06/M20-07` and `M37-02/M37-03/M37-05` as prerequisites; `M20-06`/`M20-07` are still unchecked in TODO, so M40-08 must be delivered as the server-side denial contract plus the honest handoff boundary without claiming a live HQ review engine.
