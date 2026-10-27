# M05-21 — Generated app workspace integration worktree evidence

**State:** Closed at integrated SHA `0be66b6ae1240fa97511308421784b84861016ca`. Exact-SHA CI run [40538469832](https://github.com/bjo163/moonwitnessxv/actions/runs/40538469832) passed verification and guarded promotion to `main`. Original baseline HEAD: `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev`.

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

## Revalidation after M05-19/M05-20 integration

- **Observed SHA:** `664cb082bafcfc52bf9e333911449af240a7813c` on `dev` and `origin/dev`; M05-19 and M05-20 are checked in TODO at this revision.
- `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs` — exit 0. The fresh disposable frontend and worker resolved from workspace manifests; lockfile-only resolution, frozen install, typechecks, Vite build, route tests, lint, and worker build passed. The traversal negative case was rejected and left `apps/` empty. The repository lockfile remained unchanged.
- `pnpm exec eslint scripts/diagnostics/app-factory-workspace-smoke.mjs` — exit 0.
- The packet's `apps/radio/src/addons.ts` path is obsolete after the app rename; the current addon registry is `apps/arsy/src/addons.ts`. `Dockerfile.web` and `pnpm verify:docker` map only the existing Next.js apps Dock and Headquarters. Generated frontend output is Vite-based; no production app/route or Vite container contract has been approved. No Docker image was built and no unsupported Vite target was introduced.
- Exact-SHA CI [40500018547](https://github.com/bjo163/moonwitnessxv/actions/runs/40500018547) completed successfully for `664cb082bafcfc52bf9e333911449af240a7813c` and promoted the same SHA to `main`. CI verifies the repository's standard gates; it does not execute the M05-21 disposable workspace smoke.
- Independent integrated review found the workspace positive/negative evidence and the no-Vite-container boundary consistent with current contracts. The review also confirms the smoke reuses already-built core/MoonUI `dist`, so it does not prove those libraries rebuild from source inside the generated fixture.
- **Historical status at the preceding review:** the evidence proved generated workspace behavior and that no current production container contract justified a Vite target; the production-image acceptance had not yet been checked against supported `Dockerfile.web` consumers. No Docker image for generated Vite output was built.

## Container mapping verification at `deb1fa74a7d6c37059bcf9f6219ca05b28dfce06`

- Added `test/app-factory/container-mapping.test.mjs`, a deterministic contract test of the App Factory template and `Dockerfile.web`.
- At integrated source SHA `a0f2c73f3825adbbb8043f5bb844cb1e71acb7d7`, `pnpm exec node --test test/app-factory/container-mapping.test.mjs` — 3/3 passed: generated frontend is Vite with no Next artifacts; Dock and Headquarters manifests match `Dockerfile.web`'s Next build/runtime; generated Vite is rejected by that Next-only contract.
- At the same source SHA, `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs` — exit 0; frontend and worker lockfile generation/frozen install, typechecks, Vite build, route tests, lint, worker build passed; traversal slug rejected without writing an app.
- Built Dock from a clean `git archive` snapshot at `deb1fa74a7d6c37059bcf9f6219ca05b28dfce06` using `docker build -f Dockerfile.web --build-arg APP=dock --build-arg APP_PORT=3001`; image `moonwitnessx:m05-21-dock-deb1fa7` built successfully (image config digest `sha256:c7866d135e11cb0cb427a117ebe1577f7dfc06004d22012a3dd4b98be3d33577`).
- Built Headquarters from the same clean snapshot using `docker build -f Dockerfile.web --build-arg APP=headquarters --build-arg APP_PORT=3002`; image `moonwitnessx:m05-21-hq-deb1fa7` built successfully (image config digest `sha256:67235978a92a4e046432b9f39b709ada76c751c848b649e458f2040c45c87198`). Next.js reported its existing middleware deprecation warning; builds completed successfully.
- No Vite container target or production route was justified or created. The positive container mapping applies to the two existing Next applications; the negative contract test prevents treating the Vite starter as a valid `Dockerfile.web` target. No generated-Vite image or deployment is claimed.
- Independent read-only review found the mapping test accurate and consistent with the packet. The packet allows a production route only if justified; no Vite production app or route has been approved. Successful clean-snapshot Dock/HQ builds provide positive container-mapping evidence, while the committed negative contract prevents an unsupported Vite-to-Next mapping. CI run `40538091306` exposed only an ESLint `URL` global issue in the new test; adding the explicit `node:url` import fixed it. Exact-SHA CI run `40538469832` then passed, including the repository lint/test/build gates and guarded promotion to `main`.
- At exact `0be66b6`, reran `pnpm exec eslint test/app-factory/container-mapping.test.mjs` (exit 0) and `pnpm exec node --test test/app-factory/container-mapping.test.mjs` (3/3 passed). The workspace smoke also passed at `0be66b6`. `Dockerfile.web` and Dock/HQ package manifests are unchanged from the successful clean-snapshot image builds at `deb1fa7`.
- M05-21 is closed. M05-22 becomes eligible at this integrated result SHA.

## M05-22 adoption and rollback contract

**Baseline reviewed:** `0518f31d510c3fa7b12922eac4f33e6a8f3d1076` on `dev`; M05-21 is checked in TODO at this baseline. This section documents the current operating boundary and validation entry point; it does not change TODO status or claim a live deployment.

- `pnpm app:create <slug> [--variant worker|frontend] [--dry-run] [--locale id|en]` is the supported interface. `pnpm app:create --help` reports current options. Dry-run must be used to review the output file list before choosing to write.
- The generated package belongs under `apps/<slug>/`. The worker template is private and has no UI, public port, or database. The frontend template is Vite/React, uses the shared `@moonwitness/core` locale contract and MoonUI, and is not compatible with the Next-only `Dockerfile.web` image. A scaffold adds no app/domain owner, database, runtime supervision, Docker/Compose mapping, public domain, or deployment claim. Existing app/domain ownership must remain the owner unless an accepted architecture decision explicitly changes it.
- Reproducible disposable validation: `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs`. The script generates one worker and frontend in a temporary workspace, resolves a lockfile from generated manifests, requires frozen install, typechecks/builds/tests/lints the generated packages, and rejects a traversal slug without creating an app. Its `finally` cleanup removes only the unique temporary fixture. Contract coverage can be rerun with `pnpm exec node --test test/app-factory/app-create.test.mjs test/app-factory/container-mapping.test.mjs test/app-factory/registry-coverage.test.mjs`.
- Safe removal of an uncommitted scaffold requires reviewing `git diff -- apps/<slug>` and `git status --short -- apps/<slug>` first and confirming no later work or user data lives there; then remove only `apps/<slug>/`. Do not remove the root lockfile, shared packages, app registry, or another app as part of rollback. If the generated directory has follow-on edits, stop and resolve ownership. For committed integration, revert only the reviewed task changes after checking dependents; never use broad reset/clean.

## M05-22 focused worktree validation

Observed on a dirty working tree based on `0518f31d510c3fa7b12922eac4f33e6a8f3d1076` (`dev`); these documentation edits were uncommitted and other unrelated local edits remained present:

- `pnpm exec node --test test/app-factory/app-create.test.mjs test/app-factory/container-mapping.test.mjs test/app-factory/registry-coverage.test.mjs` — 28 passed, 0 failed. Coverage includes dry-run/no-write and successful generation, invalid/reserved/occupied slug rejection, write cleanup on generation failure, template exclusion of port/database/Hub/Docker/runner wiring, Next/Vite container boundary, workspace registry coverage, and unique registered ports.
- `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs` — exit 0. Generated frontend/worker passed lock resolution, frozen install, typechecks, Vite build, route tests, lint, and worker build; traversal was rejected. The script's unique temporary fixture was absent after exit.
- `pnpm app:create --help` — exit 0 and printed the current variants/options. `pnpm app:create factory-docs-check --variant frontend --dry-run` — exit 0, listed the generated files under `apps/factory-docs-check/`; `Test-Path apps/factory-docs-check` returned `False`.
- `git diff --check -- README.md BLUEPRINT.md docs/audit/M05-21-app-factory-workspace-worktree.md` — no whitespace errors in leased paths (Git emitted only the existing line-ending normalization notice for this audit file).

The generator's file plan is confined to `apps/<slug>/`; current negative tests reject existing/reserved app names and check that scaffold templates do not add a Hub, database, public port, Docker/Compose, or supervisor wiring. The registry tests check that existing runnable apps have unique ports. This is not public-domain uniqueness or deployment evidence: the factory creates no domain/DNS records and no production route.

## M05-22 integrated exact-SHA verification

Implementation/documentation SHA: `feb5d224ef3e2ce1b93d02a52f7424b761231fe9` on `dev`. The implementation commit changed only `README.md`, `BLUEPRINT.md`, and this audit. At that exact SHA:

- The focused App Factory test command passed 28/28, including positive generation/dry-run and negative traversal, collision, reserved-name, and unsupported container mapping cases.
- `pnpm exec node scripts/diagnostics/app-factory-workspace-smoke.mjs` exited 0; generated frontend and worker passed frozen install, typecheck/build/tests/lint, traversal was refused, and the unique temporary fixture was removed.
- `pnpm app:create --help` exited 0; `pnpm app:create factory-docs-check --variant frontend --dry-run` exited 0 and listed the plan without creating `apps/factory-docs-check/`.
- `git diff --check HEAD^ HEAD` reported no whitespace errors.
- GitHub Actions run [40540433419](https://github.com/bjo163/moonwitnessxv/actions/runs/40540433419) completed successfully for this exact SHA; monorepo verification and guarded promotion passed. Remote `dev` and `main` both resolve to `feb5d224ef3e2ce1b93d02a52f7424b761231fe9`.

The evidence establishes App Factory workspace ownership and a safe removal procedure; it does not claim public-domain/DNS uniqueness or a production deployment. No generated workspace was retained.
