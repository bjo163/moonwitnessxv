# M30-05 screenshot baseline blocker — 2026-10-28

## Finding

M30-05 remains open. This assessment was made against `dev`/`origin/dev` at `b2cac4a526c688a843f9df1d66a5cd880c823e89`. The current pushed `dev` is `3862f9b1d7df91c0b2d3960f3c7792ec4009046c`; the intervening commit changed only `TODO.md` and added the M18-05 blocker audit, so the screenshot/source observations below remain applicable. The checked M30-04 prerequisite is a design specification; it does not itself certify current runtime behavior. The available screenshot report is stale relative to the reviewed source state and incomplete, so it cannot support M30-05 closure.

## Observed evidence and limits

- `docs/audit/screens/geometry.json` records `baseline.runHead: 43cff7c`, not current `dev` HEAD `b2cac4a`.
- It reports 29 matrix records and 6 reduced-motion records; expected coverage in the harness is 32 matrix records (4 screens × 2 locales × 4 widths) and 8 reduced-motion records (4 screens × 2 widths). The available report is therefore incomplete.
- The report summary says zero assertion failures and zero horizontal overflow, but this is not a clean runtime result: recorded page errors include a React hydration mismatch, and some records report that they saw the loading fallback. A zero assertion-failure count does not erase those runtime signals or establish behavior on the current baseline.
- Many deterministic targets under `docs/audit/screens/` are already modified or untracked, including the PNG captures and `geometry.json`. The worktree also has modified Dock/Cockpit/Headquarters UI files. A rerun that writes the default screenshot location would overwrite shared, in-progress evidence. No such rerun was performed.
- The harness supports `UI_SCREENS_DIR` for scratch output (`scripts/ui/paths.mjs`), but it still starts Dock against the app's shared `.next` cache. Existing harness documentation warns that concurrent Dock dev use can contend with that cache. Runtime evidence should be collected only after the active UI edits/server use are quiescent or in an explicitly isolated app checkout/cache.

## Exact evidence needed next

1. Preserve the current dirty screenshot artifacts; do not use the default `docs/audit/screens/` output path until their owner confirms they are disposable or incorporated.
2. After the relevant UI changes are settled, run the browser harness against the exact source state under review and record that state’s full `git rev-parse HEAD` plus whether the tree was clean. If the run is meant to test a committed baseline, use that exact commit; do not label a dirty worktree run as SHA-only evidence.
3. Capture all 32 matrix and 8 reduced-motion cases, the keyboard pass and term-detail discovery; explain any intentional skips. Resolve hydration errors and loading-fallback captures, or document why each is expected and ensure it does not undermine the asserted behavior.
4. Retain browser/runtime output and screenshots in a non-overlapping destination first. Before promoting any captures into repository evidence, coordinate with the owner of the currently dirty `docs/audit/screens/` files.
5. Obtain an independent reviewer for the exact run and artifact set. M30-04’s design-spec review is not a review of M30-05 runtime/screenshot evidence.

## Inspection record

Inspected at `Z:\project\moonradio`, branch `dev`: `git status --short --branch`, `git rev-parse HEAD`, `git ls-remote origin refs/heads/dev`, `git log -5 --oneline`, `TODO.md`, M30-04 and M30-05 task packets, `docs/design/M30-04-bilingual-skin-rtl-media.md`, `MASTER_DESIGN.md`, `scripts/ui/paths.mjs`, relevant portions of `scripts/ui/visual.spec.mjs`, `docs/audit/ui-visual-harness-d54ad43.md`, and the current `docs/audit/screens/geometry.json` report. No test, build, or browser run was executed; no source, TODO, or screenshot file was changed. This blocker note is the only file created for this follow-up; no commit or push was made.
