# M28-04 audit — package filters, pnpm lock, Dockerfiles, Compose and runners

- **Task:** M28-04 (umbrella, P0 D4), prerequisite M28-03 (closed via M28-10).
- **Baseline:** branch `dev`, HEAD `d54ad43` (`docs(todo): close M38-11 and M39-10 at their exact implementation SHAs`); working tree clean at start apart from other agents' untracked WIP noted below.
- **Worker:** DevOps verification agent (read-mostly; two Dockerfile stages fixed).

## What was already true (proven by closed tasks)

- **Workspace move/filters.** M28-10 (`978cd077`) moved `apps/radio` to `apps/arsy` in place with package identity `@moonwitness/arsy`; `pnpm-workspace.yaml` is glob-derived (`apps/*`, `packages/*`).
- **Lock, scripts, images, DNS.** M28-11 (`2112622`) migrated root `package.json` filters, `pnpm-lock.yaml`, `Dockerfile`, `Dockerfile.web`, `docker-compose.yml`, `scripts/dev.mjs`, `scripts/free-ports.mjs`; the single `arsy` compose service carries the deprecated `radio` network alias and Dock/HQ dial `RADIO_API_URL: http://radio:3000${API_PREFIX}` through it. See [M28-11 evidence](M28-11-arsy-docker-dns-2112622.md).
- **Env alias layer.** M28-12 (`8ce4ff8`) made `ARSY_*` → `RADIO_*` precedence fail-closed; `.env.example` documents `ARSY_API_URL` preferred with `RADIO_API_URL` as compatible alias. See [M28-12 evidence](M28-12-arsy-env-aliases-8ce4ff8.md).

Re-confirmed on the current tree (grep over the scoped paths): no leftover `apps/radio` path and no `@moonwitness/radio` reference in root `package.json`, `scripts/`, both Dockerfiles, either compose file, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.env.example`. The remaining `dev:radio` root script and the `radio → arsy` mapping in `scripts/dev.mjs` are deliberate transition aliases pointing at `@moonwitness/arsy`, not legacy paths. `pnpm-lock.yaml` importers list `apps/arsy`, `apps/dock`, `apps/headquarters`, `apps/echolog`, `apps/skylink` — no `radio` importer.

## Gap found and fixed (this task's change)

After M28-11 closed, commit `7c29877` added the root lifecycle `"prepare": "node scripts/setup-git-hooks.mjs"`. The Dockerfiles deliberately copy only manifests into the `deps`/`prod-deps` stages (no `scripts/`), so every image build died with `MODULE_NOT_FOUND` inside the prepare hook: `pnpm install --frozen-lockfile` failed in-image even though the host install passed. First observed here on the `prod-deps` stage of `docker build -t moonwitness .` at `d54ad43`.

**Fix (2 files):** `COPY scripts/setup-git-hooks.mjs ./scripts/` added to the `deps` and `prod-deps` stages of `Dockerfile` and `Dockerfile.web` (four stages). The script itself is fail-safe outside a Git work tree (`not a Git work tree; exit 0`), so the hook is a no-op in-image; runtime layouts are otherwise unchanged.

- `Dockerfile` — changed (deps + prod-deps COPY lines)
- `Dockerfile.web` — changed (deps + prod-deps COPY lines)

## Commands executed and real outputs

1. `git rev-parse --short HEAD` → `d54ad43`; `git branch --show-current` → `dev`; `git status --porcelain` → empty at start.
2. `node --version` → `v24.22.1`; `pnpm --version` → `10.33.4`.
3. `pnpm install --frozen-lockfile` → "Lockfile is up to date, resolution step is skipped / Already up to date / Done in 922ms" (40 workspace projects).
4. `cd apps/arsy && pnpm exec tsx --test test/compose-contract.test.ts test/env-contract.test.ts` → 21/21 pass (includes "legacy consumers continue through the radio alias", port-contract, SKYLINK 3005 / ECHOLOG 3006 contracts).
5. `pnpm exec tsx --test test/workspace-topology.test.ts test/dockerfile-contract.test.ts` → 14/14 pass (no duplicate `radio` hub; derived root build scripts).
6. `docker compose config --quiet` → exit 0.
7. **Before fix:** `docker build -t moonwitness-m2804-verify .` → FAILED at `prod-deps`: `MODULE_NOT_FOUND` from the `prepare` hook. **After fix:** hub image build → exported `naming to docker.io/library/moonwitness-m2804-verify:latest ... DONE 27.5s`.
8. Clean-tree build matrix (temporary `git worktree` detached at exact `d54ad43` containing only the two Dockerfile edits, so the concurrent ECHOLOG WIP described below could not contaminate it): `docker build -t moonwitness-m2804-hub-clean .` → DONE 31.2s; `docker build -f Dockerfile.web --build-arg APP=dock --build-arg APP_PORT=3001` → DONE; `--build-arg APP=headquarters --build-arg APP_PORT=3002` → DONE. All three images build.
9. Runtime smoke of the built hub image on a throwaway `postgres:17-alpine` (ephemeral local-only credentials, not recorded): `/api/v1/health` → 200, `/api/v1/health/ready` → 200 `{"status":"ready","engine":"pg"}`. Confirms the `apps/arsy/dist/server.js` CMD path end to end. Production fail-closed behavior observed as designed first: without `DATABASE_URL` the container refuses to boot (M04-01), and `MOONQL_AUTH_ADMIN_PASSWORD` is required in production.
10. Live `radio` DNS compatibility: a hub container attached to the smoke network with `--network-alias radio` (exactly what compose's `networks.default.aliases: [radio]` produces) resolved from another container as `http://radio:3000/api/v1/health` → `{"ok":true,...,"status":"ok"...}`.
11. Post-fix regression: `pnpm exec tsx --test test/dockerfile-contract.test.ts test/compose-contract.test.ts test/env-contract.test.ts` → 28/28 pass.
12. Cleanup verified: smoke containers/network/images removed, `git worktree remove` done, `docker ps -a | grep m2804` → empty; the only remaining worktree is the pre-existing `moonradio-m28-13`. No commits, staging, or pushes made.

## Concurrent tree observation (not M28-04)

Mid-session, image builds on the live (dirty) tree began failing with `ERR_PNPM_OUTDATED_LOCKFILE` for `apps/echolog/package.json`: another agent's uncommitted M39 WIP adds `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `@moonwitness/moonui` (and `apps/echolog/client/`, `vite.config.mjs`) without a regenerated lockfile. This is transient WIP drift owned by the M39 track — its lock regeneration must land with those files. The clean-worktree matrix (item 8) isolates M28-04's verdict from it.

## Scope notes

- SKYLINK and ECHOLOG are intentionally absent from `docker-compose.yml`; their production compose entries are owned by open task M38-14 (compose service + supervision + rollback). They are present and contract-tested in the dev runners (`scripts/dev.mjs`, `scripts/free-ports.mjs`, ports 3005/3006).
- `apps/arsy/test/**` was not edited (owned by another agent); no test change is required for this fix — the existing Dockerfile contract tests still pass and could later be extended to assert the prepare-hook COPY line by that owner.

## Verdict

**M28-04 is satisfied on the current tree** once the two-file Dockerfile fix is committed: filters/lock/Dockerfiles/Compose/runners are radio-free, `radio` internal DNS compatibility is preserved and now proven live (contract tests + runtime resolution), all three images build and the hub boots against real Postgres. No blockers remain for closing M28-04 itself; the M28-13 matrix remains separately open (lint, PG parity, rollback).
