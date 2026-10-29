# M30-05 certification at dev `c47f741` — 2026-10-29

## Run identity

- `task_id`: M30-05, `Certify behavior and screenshot tests`.
- `baseline_sha` / `result_sha`: `c47f741f0e1cf3bbddb54508eeb88b6feb9c0910` on `dev`; geometry records design baseline `d54ad43`.
- Worker: Qoder agent, acting as owner-delegated reviewer and integrator for this leaf.
- The run used a clean detached worktree at `Z:\project\moonradio-m30-clean` pinned to `c47f741`. The main checkout carried unrelated parallel-session changes and was not used for capture.
- Hub: ephemeral, in-memory, seeded ARSY at `http://127.0.0.1:3112/api/v1`, cron disabled. A random throwaway admin password was generated inside the process environment and was never printed or stored. Dock ran on `http://127.0.0.1:3111`; the harness spawned and stopped it itself.
- Evidence commit: `ffbcfdcd8013cc9a4459a0d35094ed637deb50ec`; captures and machine-readable records are in [M30-05-c47f741/geometry.json](M30-05-c47f741/geometry.json).

## Review authority

On 2026-10-29 the repository owner explicitly instructed the agent to take over the outstanding
human-review gate for this task and to finish it ("kamu saja menggantikan manusia tersebut tidak
apa2, tolong kerjakan ya sampai selesai"). This audit therefore records an **owner-delegated review
performed by the AI agent**. It is not a human signature and must not be cited as one. The
term-detail limitation below remains explicit; closing M30-05 does not certify that screen.

## Commands and observed results

| Command (clean worktree, `c47f741`) | Observed |
|---|---|
| `pnpm install --frozen-lockfile --prefer-offline` | Done in 6.4s, no lockfile change. |
| `pnpm build:libs` | All workspace packages built. |
| `pnpm --filter @moonwitness/moonui build` | `tsc -b` passed. |
| `pnpm --filter @moonwitness/moonui test` | 105 passed, 0 failed, 0 skipped. |
| `UI_PORT=3111 UI_HUB_URL=http://127.0.0.1:3112/api/v1 UI_SCREENSHOT=viewport UI_SCREENS_DIR=docs/audit/M30-05-c47f741 pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs` | 44 passed, 0 failed, 1 skipped (1.2m). |

Geometry (`geometry.json`, `hubMode: live-hub`, `screenshotMode: viewport`):

- 32 viewport/locale records plus 8 reduced-motion records.
- `recordsWithFailures: 0`, `maxHorizontalOverflowPx: 0`, `maxInteractiveElementsOutsideViewport: 0`, `maxElementsOutsideViewport: 0`.
- Aggregated over all records: 0 console errors, 0 failed requests, 0 hydration failures, 0 records still loading, all HTTP 200, `htmlLang` limited to `en`/`id`.
- 41 PNG captures in the evidence directory.

## Positive check

The covered matrix (home, reader, terms index, constellation × en/id × four widths, plus
reduced-motion and the telemetry-clock and keyboard checks) rendered and settled against a live
seeded Hub with no overflow, clipped or off-viewport interactive elements, console errors, failed
requests, or hydration errors. Member reads in the captures show the bilingual UI, the live
schedule/signal data, and the reader's rights/edition panels; the terms index shows its explicit
withholding state. MoonUI's own suite passed 105/105 at the same SHA.

## Negative check

`/en/terms` was opened against the live ephemeral Hub. The index rendered its `error` branch with
the visible notice `UNILEX terms are withheld until an approved D08 public projection is
available.`, exposed no term link, and the harness recorded the term-detail matrix as a skip with
that reason rather than a pass. This is the intended fail-closed behaviour of the M19-19
containment: no term id, private bytes, or unreviewed projection was exposed. The harness also
fails any covered screen that logs a hydration mismatch, and none occurred.

## Remaining limitation (not a pass)

The positive term-detail screen is **not certified**. A real `/terms/<stableId>` render requires an
approved D08 public projection, which does not exist; M19-19 remains open for that reason. This
closure certifies the 44 reachable cases and the withholding behaviour, and it carries the
term-detail gap as a documented limitation owned by M19-19, not as a UI pass. The run also used an
ephemeral in-memory Hub rather than a deployment, captured viewport screenshots only, and Next
rewrote generated `apps/dock/next-env.d.ts` during capture; that file was restored, so the evidence
is source-SHA-pinned rather than clean-tree-pinned during the run.

## Security, rights, privacy, rollback

- Data: seeded in-memory Hub only; no live database, deployment, private witness content, or
  persistent credential. The throwaway admin password was never recorded.
- Product source changes: none. The evidence commit contains only `geometry.json` and PNG captures.
- Rollback: remove the evidence commit and revert the TODO/milestone edits; no product code rollback
  applies.
- Reviewer: owner-delegated AI review as described above. No human reviewer signature exists.
- Disposition: M30-05 is closed at `c47f741` and this certification completes the five M30 leaves.
  It must not be used to claim D08 publication approval, a deployed environment, or a term-detail
  pass. Next eligible work remains M19-19/D08 public projection and the M27 release gates.
