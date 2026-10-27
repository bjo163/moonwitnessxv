# M05-21 — Generated app workspace integration worktree evidence

**State:** positive/negative integration evidence in the shared worktree; not closed. Baseline HEAD before this work: `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev`, equal to `origin/dev`. No result SHA exists. M05-19 and M05-20 are still open pending exact-SHA integration evidence.

**Revalidation:** current `HEAD`/`origin/dev` advanced to `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec` through unrelated integration commits. The disposable workspace smoke reran successfully against current App Factory worktree output; repo lock remains unchanged. No GitHub status/run exists for the current branch SHA.

## Scope and files

- Added `scripts/diagnostics/app-factory-workspace-smoke.mjs`, which creates a disposable minimal pnpm workspace, generates one frontend and one worker using the current App Factory, and removes only its uniquely created temporary workspace on exit.
- The smoke test derives `pnpm-lock.yaml` using pnpm's lockfile-only install from generated manifests, then performs a frozen install. It does not edit the repository lockfile or package manifests.
- No TODO checkbox was changed. No commit or push was made.

## Evidence observed

- `pnpm exec eslint scripts/diagnostics/app-factory-workspace-smoke.mjs` — passed with no output.
- `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs` — exit 0; output:
  `Generated frontend and worker resolved from workspace manifests; automatic lockfile generation, frozen install, typechecks, Vite build, route tests, lint and worker build passed.`
- Negative case in the same diagnostic rejects `../escape` and confirms the workspace `apps/` directory remains empty.
- Generated package metadata therefore resolves through the normal workspace graph without hand-editing individual generated manifests or the root lockfile. Package-manager auto-lock generation occurs in the disposable fixture; frozen installation then succeeds.

## Container boundary

`Dockerfile.web` is explicitly a Next.js image for the existing `dock` and `headquarters` apps: its build copies one selected `apps/${APP}`, runs that package's `build`, and runtime executes `next start`. The generated M05-19 frontend is a Vite internal skeleton, not a user-approved production app. No Vite container target or public route is justified by the current architecture, so this task adds no such route and makes no container-runtime claim. The workspace smoke verifies that generated app importers are included by the `apps/*` workspace glob; full clean Docker mapping remains unproved.

## Limitations / next gate

- The diagnostic is run against current shared-worktree output and already-built `packages/core/dist` and `packages/moonui/dist`; it is not evidence at a clean integrated SHA.
- No Docker image for the generated Vite app was built. Current `Dockerfile.web` would be the wrong runtime contract for it.
- Independent review, exact integration SHA, and CI remain required before closure. M05-22 remains ineligible until M05-21 is integrated and accepted.
- Rollback: delete this diagnostic and audit report; the test's temporary workspace is automatically removed. Repository `pnpm-lock.yaml` and generated app directories were not changed.
