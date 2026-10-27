# M05-18 / M05-19 App Factory worktree evidence

**State:** implementation evidence in shared worktree; neither task is closed. The repository requires an exact integrated SHA and CI evidence before TODO closure. Baseline HEAD observed: `bb751262d9ae215620acc634998fb63ab6e4b887` (`dev`, equal to `origin/dev` at inspection). No result SHA exists yet.

**Revalidation:** branch HEAD and `origin/dev` later advanced together to `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec` through unrelated UI/Dock integration commits. App Factory changes remain uncommitted. At this current worktree state, `pnpm exec node --test test/app-factory/app-create.test.mjs` passed 19/19 and scoped ESLint passed; the Vite + Chromium smoke is also rerun successfully. GitHub returned no status checks or workflow runs for `2a3aaf16…`.

## M05-18 — collision-safe CLI

- Changed `scripts/app-create.mjs` to create every planned file exclusively (`wx`) after creating a new destination directory. If any creation fails, the factory removes only that newly created app directory, avoiding partial output and avoiding overwriting a concurrent file.
- Focused positive and negative evidence: `pnpm exec node --test test/app-factory/app-create.test.mjs` — 19 passed, 0 failed. Covers deterministic dry-run, a valid write, invalid/traversal/reserved/existing names, no-write behavior, worker behavior, and a simulated partial-write race. During the latter, the factory's own file was removed while a concurrently added `concurrent.txt` remained intact.
- Scoped lint: `pnpm exec eslint scripts/app-create.mjs test/app-factory/app-create.test.mjs scripts/diagnostics/app-factory-frontend-smoke.mjs` — passed.
- The failure path now records created file descriptors and only unlinks files whose filesystem identity still matches this factory run; it removes directories only when they are empty. This avoids recursive deletion of files another process adds to the new app tree.
- Reviewer residual: Node's portable path-based `unlink` leaves a narrow lstat/unlink race if another process replaces a just-created file in that interval; the injected concurrent-add case passes, but this API does not provide atomic unlink-by-inode. No recursive removal is used.
- **Integrated revalidation at `70b6b14b6630b21da4449df5ad7e2c247be7736f` (`dev`):** this follow-up only changes two test lookups in `test/app-factory/app-create.test.mjs`, normalizing `relPath` separators before matching generated worker files. It does not change the CLI, worker template/runtime, or M05-19 implementation. This evidence is limited to M05-18 plus that test portability repair; it does not establish M05-19 completion.
- Windows focused verification, run against the source content integrated at `70b6b14`: `pnpm exec node --test test/app-factory/app-create.test.mjs` — 19 passed, 0 failed; `pnpm exec eslint test/app-factory/app-create.test.mjs` — passed; `git diff --check` — passed. The full test includes the previously POSIX-failing M05-20 assertion; the normalized suffix matching handles both slash styles.
- Independent portability review (`m05_18_portability_review`): no blocker found; confirmed that the two normalizations accept Windows and POSIX separators and that remaining M05-20 assertions are unchanged. The reviewer did not rerun the Windows suite.
- Exact-SHA CI: [run 40461134347](https://github.com/bjo163/moonwitnessxv/actions/runs/40461134347) passed for `70b6b14b6630b21da4449df5ad7e2c247be7736f`, including full verification and promotion. This is CI evidence, not deployment evidence.
- The test-path repair and integration do not remove the previously noted narrow lstat/unlink race. The earlier shared worktree also contained M05-19 template work; this update does not review or close that dependent task. TODO status remains for the integrator.
- Rollback: revert the App Factory and its test changes as a reviewed set; no generated app was written into the repository.

## M05-19 — frontend skeleton

- Template inherits the shared `@moonwitness/core` locale contract and `@moonwitness/moonui`; emits id/en catalogs, selector, locale-prefixed route matching, navigation labels, accessibility state, and package scripts.
- Generated frontend manifest includes `test` (`tsx --test test/**/*.test.ts`) and the matching `tsx` dev dependency so route fixtures are runnable in the generated app.
- Corrected route buttons to update URL/history and respond to `popstate`; guarded persisted locale reads against storage exceptions; added a generated route test fixture outside `src`.
- Focused factory fixture check above runs `tsc --noEmit` on generated app TypeScript/TSX. This is a repository harness using installed workspace declarations, not a standalone install or Vite production build.
- `pnpm --filter @moonwitness/moonui build` — passed. `pnpm --filter @moonwitness/core build` — passed. `pnpm ui:check` — 112 files, 0 violations.
- `pnpm exec node scripts/diagnostics/app-factory-frontend-smoke.mjs` — output: `Generated Vite build and browser navigation/locale checks passed.`
- `scripts/diagnostics/app-factory-frontend-smoke.mjs` creates a temporary generated app, links already installed workspace/runtime packages, runs the real Vite production build, executes the generated route fixture, serves the output, and uses headless Chromium to exercise keyboard activation of `/en/about`, locale switch to `/id/about`, accessible navigation labels/`aria-current`, and browser back/forward. Back/forward assertions also confirm the selector, nav label, and current-page state resynchronize. Result: `Generated Vite build and browser navigation/locale checks passed.` The browser produced no page errors.
- **Not yet proved:** frozen installation from a clean workspace/lockfile and exact-SHA CI. Keep M05-19 open until integrated evidence passes. (Frozen installation belongs to downstream M05-21.)
- Rollback: remove only a generated temporary fixture; no app was generated into the repository.

### Integrated exact-SHA closure

- **Integrated SHA:** `ff7394d6e6d95e3469a0367bfec80f09da985087` on `dev`; exact-SHA CI [40499204784](https://github.com/bjo163/moonwitnessxv/actions/runs/40499204784) passed full monorepo verification and guarded promotion to `main`.
- On this exact source, the App Factory suite passed 19/19; the generated frontend type fixture and Vite production/browser smoke passed, including `id`/`en` navigation, keyboard activation, accessible labels, and back/forward synchronization. MoonUI/core builds passed and `pnpm ui:check` reported 132 files with 0 violations.
- Independent integrated review found no blocker and confirmed the implementation uses the shared `@moonwitness/core` locale contract and `@moonwitness/moonui` components. The smoke uses already-installed workspace dependencies; a clean frozen install remains assigned to M05-21.
- **Status:** M05-19 is closed at this integrated SHA. This does not close M05-21 or claim standalone workspace install/container integration.

## Shared changes touched for this work

`scripts/app-create.mjs`, `test/app-factory/app-create.test.mjs`, `scripts/diagnostics/app-factory-frontend-smoke.mjs`, and this evidence report. The worktree has unrelated changes from concurrent task work; no staging, commit, TODO closure, or destructive cleanup was performed.
