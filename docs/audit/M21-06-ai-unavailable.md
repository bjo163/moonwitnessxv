# M21-06 — Source/research UI usable with AI unavailable

**Task:** M21-06 — "Prove source/research UI usable with AI unavailable" (acceptance: "No critical path depends on AI inference").
**Result:** READY-TO-CLOSE for the acceptance above. No production file was changed; no TODO status was edited.
**Worker:** agent session (read-only inventory + one new test file).
**Date of observation:** 2026-10-27 (local).

## Baseline and worktree

- Task-stated baseline `dev` HEAD: `a5f9b64` ("docs(todo): close M31-02, M25-03 and M26-01 at 4b0a872").
- Observed `dev` HEAD at start: `3b44d28d0abb0aa37fd5bde9a59a588ce3db2139` ("fix(dock): the DENPA deck stops claiming the hub reviews a transmission"). This is two commits ahead of the stated baseline; both commits (`15e4bc4`, `3b44d28`) are Dock UI work. The test was written and run against `3b44d28`.
- The worktree was already dirty on entry (cockpit, Dock patches page/CSS/`PatchesExplorer`, HQ admin/actions, `docs/audit/screens/*`, other untracked files). None of those files were opened for write or modified. The only paths added by this task are listed under **Changed files**.

## AI dependency inventory on the source/research path

| # | Surface | AI dependency observed | Evidence |
|---|---|---|---|
| 1 | Dock Reader route (`/reader`) | None. Awaits only the hub owner via `readPassage`/`readBrowse`; every read is wrapped by `readPanel` with a localized fallback. | `apps/dock/src/app/reader/page.tsx:47-60`; `apps/dock/src/data/queries/reader.ts:57-63` (`/corpus/reader`), `:124-130` (`/corpus/browse`) |
| 2 | Dock Comparative Reader (`/reader/compare`) | None. Renders only the M19-19 withholding notice. | `apps/dock/src/app/reader/compare/page.tsx:30` |
| 3 | Dock Research route (`/research`) | None. Renders only the M19-19 withholding notice; it imports no data reader and no AI field. | `apps/dock/src/app/research/page.tsx:28` |
| 4 | Dock UNILEX Terms routes (`/terms`, `/terms/[stableId]`) | None. Registry projections from the hub only. | `apps/dock/src/app/terms/page.tsx:84`; `apps/dock/src/app/terms/[stableId]/page.tsx:20`; `apps/dock/src/data/queries/terms.ts:179-194` |
| 5 | Dock data layer / environment | Only the hub URL is resolved. No AI gateway URL, key, model name or provider env is read on these routes. | `apps/dock/src/lib/env.ts:9`; `apps/dock/src/data/sdk.ts:10` |
| 6 | Reader "interpretation" row | Not inference: the corpus addon reports lane availability from the live model registry and labels the absence explicitly. | `packages/moonql-corpus/src/index.ts:108-136` (reason string), exposed at `:451` |
| 7 | AI Gateway | Not imported by the Dock at all; inference is off unless `AI_ENABLED === 'true'` (M21-01). | `apps/aigateway/src/router.ts:27`; M21-01 audit |
| 8 | `aiSummary` field | Exists only on `monitor_signals` and is rendered on the Dock **home** world-monitor card, which is outside the source/research path. | field: `packages/moonql-monitor/src/index.ts:359`, view select `:663`; render: `apps/dock/src/app/page.tsx:121-125` |
| 9 | `aiSummary` producer | Deterministic Sentinel driver strings persisted into the column, not a model call. | `apps/sentinel/src/index.ts:152`; `apps/sentinel/src/drivers/agent.ts:84` (and sibling drivers) |
| 10 | HQ world monitor | Same field, labelled there as `AI TRIAGE:` with an explicit "unreviewed claim, not a verified finding" note. | `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:409-419`; `apps/headquarters/src/lib/monitor-copy.ts:84` |

Conclusion of the inventory: the reader, research and terms surfaces have no AI inference point to fail. The only AI-named value in the Dock (`aiSummary`) is on the home page, is deterministic driver text, and is not read by any source/research route or view (asserted by the test's source scan).

## Exact commands and observed output

Command 1 (package's own test command, narrowed to the one new file), run in `Z:\project\moonradio\apps\dock`:

```
node --experimental-strip-types --test test/research-ai-unavailable.test.mjs
```

Observed:

```
✔ M21-06 positive: Reader returns deterministic, rights-gated source content with AI absent (24.9986ms)
✔ M21-06 positive: the Reader contents rail browses the catalog and states the missing lane in words (3.1094ms)
✔ M21-06 positive: UNILEX Terms and a term detail render from the registry with AI absent (4.1403ms)
✔ M21-06 positive: every request the source/research path made went to the hub owner, none to AI (0.8097ms)
✔ M21-06 negative: an unreachable AI gateway cannot block or alter a Reader read (1.6399ms)
✔ M21-06 negative: a hub 503 surfaces as the hub message, not as an AI claim (3.4706ms)
✔ M21-06 negative: a closed hub rejects inside a bounded window and falls back to the localized notice (7.0102ms)
✔ M21-06: no source/research route or view reads an AI field or names the AI gateway (1.4551ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 211.4513
```

The Node warning `MODULE_TYPELESS_PACKAGE_JSON` for `src/lib/states-copy.ts` is pre-existing (`apps/dock/package.json` has no `"type": "module"`) and non-fatal; it also appears when existing Dock tests import that file.

Command 2 (same file through the workspace package filter):

```
pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-ai-unavailable.test.mjs
```

Observed: identical 8 assertions, `pass 8`, `fail 0`, `duration_ms 182.0056` (first run) and `duration_ms 211.4513` (final run). Exit code 0 both times.

Command 3 (lint of the new file only):

```
pnpm exec eslint apps/dock/test/research-ai-unavailable.test.mjs
```

Observed: no output, exit code 0.

The whole Dock suite was deliberately **not** run: the worktree is being modified concurrently in `apps/dock` (patches page, explorer, CSS, responsive test), so a suite-wide result would not isolate this change.

## What the test actually exercises

The test starts a real loopback HTTP hub (ephemeral port) and points `RADIO_API_URL` at it, deletes `AI_ENABLED`, `AI_GATEWAY_URL` and `ARSY_API_URL`, then imports the real query modules (`src/data/queries/reader.ts`, `src/data/queries/terms.ts`) through a `node:module` resolve hook that maps the Dock's `@/` alias into `apps/dock/src`. All reads therefore take the same `serverClient()` → `fetch` → hub envelope path the pages take.

### Positive results

- `readPassage('QS 2:82')` returns `state: 'available'`, the fixture Arabic bytes, the licensed translation, the exact edition code and the 64-hex provenance SHA. Deterministic content is present; the result carries no `aiSummary` key and never contains the fabricated AI string.
- `readBrowse('QS 2:82')` returns the resolved work, cleared edition, passage address and translation row, and states the absent interpretation lane in words (`INTERPRETATION: LABELED ...`), plus an explicit `textExportAllowed: false` reason.
- `readTerms` and `readTerm` return the pinned registry and one term; a missing term resolves to `null` (the route's `notFound()`), not a fabricated record.
- All outbound paths recorded by the fake hub are `/api/v1/corpus/*` or `/api/v1/unilex/*`. The AI-shaped routes (`/v1/*`) recorded zero requests.

### Negative results

- With `globalThis.fetch` patched to reject any AI gateway / `:3003` / `chat/completions` request, a Reader read still returns the same deterministic passage and `aiAttempts === 0`.
- A hub `503` produces a `MoonApiError` (status 503); `panelErrorMessage` returns the hub's own sentence, not an AI claim or a fabricated summary.
- A hub that has been closed rejects in ~7 ms (bounded by a 3 s race guard, proving no hang for a refused connection) and maps to the localized `errorReaderUnavailable` fallback with no summary text; `readTerms` behaves the same.
- Source scan of `app/reader/page.tsx`, `app/reader/compare/page.tsx`, `app/research/page.tsx`, `app/terms/page.tsx`, `app/terms/[stableId]/page.tsx`, `data/queries/reader.ts`, `data/queries/terms.ts`, `ui/components/reader.tsx`, `ui/components/reader-rail.tsx`, `ui/components/terms.tsx`, `lib/env.ts`: none matches `aigateway`, `AI_ENABLED`, `chat/completions`, `aiSummary`, `OPENAI`, `OLLAMA` or `:3003`. The Research route still renders the withholding alert and imports no reader. Both list routes keep `readPanel` + `panelErrorMessage` error boundaries.

## Changed files

- `apps/dock/test/research-ai-unavailable.test.mjs` (new, 8 tests).
- `docs/audit/M21-06-ai-unavailable.md` (this report, new).

No production file, config, migration, TODO entry or shared test was modified.

## Rollback

Delete the two files above. There is no runtime, schema, environment or dependency change to revert.

## Limitations and missing evidence

- **No browser or visual proof.** The test proves the data layer and the source contracts, not a painted Next route; no `next build`/`next start` or Playwright run was performed because the Dock worktree is concurrently modified.
- **Fixtures, not the live hub.** The fake hub serves hand-authored payloads; it does not prove the live ARSY/Postgres projection's content or rights filtering. Existing ARSY corpus/unilex tests remain the owner-side evidence.
- **No live AI Gateway was contacted**, as intended; the M21-01 disable switch is relied on as accepted evidence, not re-tested here.
- **"No hang" is proven only for a refused/closed TCP endpoint.** The Dock's SDK has no request timeout (`packages/moonql-client/src/client.ts`), so a black-holed host could still stall; that is a shared transport property, not an AI dependency, and was not exercised.
- **The Research route renders a withholding notice, not a research ledger.** That is the earlier M19-19/D08 rights decision, independent of AI; this task proves the route does not depend on inference, not that a public research projection is approved.
- **Adjacent observation, out of scope:** the Dock home world-monitor card renders `aiSummary` under an "OSINT MONITORING" label without naming it as an unreviewed AI-named field, whereas HQ labels the same value `AI TRIAGE:` and adds a caveat. The producer is deterministic Sentinel driver text (no model call), so this is a labelling/wording question for the home surface, not an inference dependency on the source/research path; it was not changed here.
- `a5f9b64` was not independently re-tested; results are at the observed HEAD `3b44d28`.
