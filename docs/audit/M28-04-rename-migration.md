# M28-04 audit — rename migration evidence (lock, filters, images, Compose, runners)

- **task_id:** M28-04 — Migrate package filters, pnpm lock, Dockerfiles, Compose and runners.
- **baseline_sha:** `bf9d4581e1b85c6e79ca545dcc815fe22d5cfbc9` (assigned baseline, branch `dev`).
- **Observed HEAD during the session:** `bf9d458` → `00b0064` → `9a1bf85` → `b24bedd`, committed concurrently by other owners. `git diff --stat bf9d458 -- docker-compose.yml Dockerfile Dockerfile.web scripts/dev.mjs scripts/free-ports.mjs package.json .github/workflows/` is empty and those paths are clean in the working tree, so the evidence below still describes the exact scoped files at the current tree. This audit makes no claim about the other owners' files.
- **Worker:** M28-04 owner (DevOps verification; no product change required).
- **Prior evidence:** [M28-04 filters/lock/Dockerfiles/Compose/runners](M28-04-filters-lock-docker-compose-runners.md) (Dockerfile `prepare`-hook fix), [M28-11](M28-11-arsy-docker-dns-2112622.md) (migration), [M28-13 matrix](M28-13-matrix-6b439b3.md) (verified at `70b6b14b6630b21da4449df5ad7e2c247be7736f`, CI `40461134347`). This report revalidates the parent DoD and preserves the initial stale-test failure as historical evidence; it does not claim a deployment.

## actual_changed_files

- `docs/audit/M28-04-rename-migration.md` (this report, new).
- **No product/configuration file changed.** No concrete defect was found in `docker-compose.yml`, `Dockerfile`, `Dockerfile.web`, `scripts/dev.mjs`, `scripts/free-ports.mjs`, root `package.json` or `.github/workflows/**`, so the read-only result is preserved.

## positive_test_and_output

1. **Lockfile consistency.** `pnpm install --frozen-lockfile` (Node `v24.22.1`, pnpm `10.33.4`):

   ```
   Scope: all 43 workspace projects
   Lockfile is up to date, resolution step is skipped
   Already up to date
   . prepare: Done
   Done in 1.6s using pnpm v10.33.4
   ```

   `grep -n radio pnpm-workspace.yaml pnpm-lock.yaml` → no matches (exit 1); no `apps/radio` importer and no `@moonwitness/radio` in the lock.
2. **Compose validity and DNS/transition mapping.** `docker compose config --quiet` → exit 0. Extracted fields from `docker compose config --format json` (secrets excluded):

   ```
   arsy.image= moonwitness
   arsy.build= Z:\project\moonradio Dockerfile
   arsy.aliases= {"default":{"aliases":["radio"]}}
   dock RADIO_API_URL= http://radio:3000/api/v1  ARSY_API_URL= undefined
   headquarters RADIO_API_URL= http://radio:3000/api/v1  ARSY_API_URL= undefined
   ports arsy=3000 dock=3001 hq=3002
   ```

   One `arsy` service carries the deprecated `radio` network alias; Dock and HQ keep the explicit mapping `RADIO_API_URL=http://radio:3000${API_PREFIX}`. No second `radio` service exists.
3. **Live Docker DNS resolution (real runtime, not config reading).** Ephemeral network `m2804-dns`, a container with `--network-alias radio` (the mechanism Compose emits for `arsy`), resolved from another container:

   ```
   docker run --rm --network m2804-dns alpine getent hosts radio
   172.22.0.2        radio  radio      # exit 0
   ```

4. **Runner transition alias, executed.** `node --input-type=module -e "import {ALIASES,appByTag,PORTED} ..."`:

   ```
   ALIASES= {"radio":"arsy"}
   radio -> arsy @moonwitness/arsy port 3000
   ports= arsy:3000 dock:3001 hq:3002 ai:3003 cockpit:3004 skylink:3005 echolog:3006 orbit:3007
   ```

   `node scripts/dev.mjs radio,nope` → `unknown app tag(s): nope` — `radio` is accepted and mapped, `nope` rejected; no server spawned.
5. **Image builds at this tree** (`docker build`, all DONE, no errors):

   ```
   docker build -t moonwitness-m2804-hub .                                  # DONE 60.3s
   docker build -f Dockerfile.web --build-arg APP=dock --build-arg APP_PORT=3001 -t moonwitness-m2804-dock .          # DONE 55.4s
   docker build -f Dockerfile.web --build-arg APP=headquarters --build-arg APP_PORT=3002 -t moonwitness-m2804-hq .   # DONE 57.5s
   ```

6. **Contract suites at the assigned baseline** (`cd apps/arsy && pnpm exec tsx --test test/compose-contract.test.ts test/dockerfile-contract.test.ts test/env-contract.test.ts`): **28 tests, 27 pass, 1 fail.** All DNS/Compose/Dockerfile/env assertions pass, including “compose: the legacy radio DNS name aliases the one ARSY Hub service”, “compose: a probe never glues a slash…”, “docker: the hub image ships the dist of every dependency it declares”, and “the dev registry agrees with the shared port contract”. The sole failure was a stale textual assertion after the registry moved to `scripts/apps.registry.mjs`; it was outside the original worker's scoped files and was later corrected in commit `5562f9b`.
7. **No legacy path import.** `grep -rniE radio` over active code/config (excluding `docs/`, `.agents/`, `node_modules`, `dist`, `TODO.md`) returns only: `RADIO_*` environment aliases in `apps/arsy/src/config.ts` + `.env.example` (owned by M28-05/M28-12, intentional), the `dev:radio` transition script, display/brand strings (“Radio Dock”, “Radio/SIGNAL Core”), and the compose alias/`RADIO_API_URL` mapping. There is no `apps/radio` directory and no `@moonwitness/radio` package reference.

## negative_test_and_output

1. **Negative DNS proof.** Without the alias on a network, the same name does not resolve:

   ```
   docker run --rm alpine getent hosts radio      # exit 2, no output
   ```

   The alias is explicit, not ambient.
2. **Historical failing contract test (superseded).**

   ```
   ✖ root workflows and dev runner select ARSY and retain the radio transition alias (2.5455ms)
     expected: /tag: 'arsy',[\s\S]*?pkg: '@moonwitness\/arsy'/
     at apps/arsy/test/compose-contract.test.ts:107
   ℹ tests 28  ℹ pass 27  ℹ fail 1
   ```

   Cause proven by `git blame`: commit `2112622` (M28-11) wrote assertions 107–108 against the then-inline registry in `scripts/dev.mjs`; commit `228f0a5` (“cover every app from one registry”) moved the inventory to `scripts/apps.registry.mjs` and left the literal assertions stale. Commit `5562f9b` corrected the test to assert the registry source of truth. This failure is historical and is not the current result.
3. **CI at the assigned baseline is red for an unrelated owner's file.** `gh run list --branch dev --limit 10` inspected:

   - `40463922886` at `bf9d458` — failure. `gh run view --log-failed`: `src/server.ts(3,28): error TS2307: Cannot find module '@moonwitness/moonql-client'` in the Cockpit build; fixed afterwards by concurrent commit `00b0064`.
   - `40463463624` at `f6d8a55` — failure, same Cockpit `TS2307`.
   - `40462334425` at `43cff7c` — success (historical full `pnpm verify`).
   - `40461134347` at `70b6b14` — success.
   - `40464880537` at `2ed24ac` — failure at lint, `scripts/ui/ephemeral-hub.mjs 42:44 Parsing error: Unexpected token as`; another owner's file, M28-04 files untouched.

   **No CI workflow builds Docker images.** `.github/workflows/ci.yml` has exactly `pnpm install --frozen-lockfile`, audit, gitleaks and `pnpm verify`; there is no image-build job, so no CI image evidence exists for any SHA. The three image builds above are **local proof at this tree**, not CI proof.

## security_rights_privacy

- No secret, `.env` value, credential or private witness material was printed. `docker compose config` output was filtered to image/build/alias/port/API-URL fields only; no database URLs or passwords were emitted.
- No deployment, Coolify, release, push or `git add`/commit. No production service contacted.
- Docker use was local only: three throwaway image tags plus one ephemeral network/container (alpine, alias `radio`), all removed. Nothing long-lived was started; no dev server was run (`node scripts/dev.mjs radio,nope` exits at argument validation before spawning).
- `.env` was not read into output or modified.

## reviewer

Independent reviewer: final read-only review accepted the technical evidence for the M28-04 parent DoD, subject to exact-SHA integration and CI. The integrator retains responsibility for TODO status; no production deployment or CI Docker-image build is claimed.

## rollback

- No product/configuration change to revert. Delete this report (`docs/audit/M28-04-rename-migration.md`) to restore the exact baseline for every scoped file.
- Local artifacts were already removed: `docker rm -f m2804-alias`, `docker network rm m2804-dns`, `docker rmi moonwitness-m2804-hub moonwitness-m2804-dock moonwitness-m2804-hq`; follow-up checks returned no `m2804` container, image or network.
- `pnpm install --frozen-lockfile` only linked existing workspace state (no lock rewrite); its `prepare` hook re-applied the repo-local `core.hooksPath=.githooks` already configured by the repo.

## result_sha

**Pending integration.** This report and the `TODO.md` M28-04 checkbox have not been committed. The exact current source/review evidence above is available, but the audit itself still requires independent approval and an integrated commit/CI check.

## limitations

1. **Historical stale assertion is fixed.** The assigned-baseline suite was 27/28; after commit `5562f9b`, the exact same 28-test command passed 28/28 at local HEAD `97f1d6a` (the focused compose-contract portion passed 12/12). This supersedes the earlier failure. The current remote `dev`/`main` SHA `cbaec2db5af416e58b71b57a16127267d3c7007f` is later than `5562f9b`; CI run `40474864810` completed full verification and guarded promotion successfully at that exact SHA.
2. **CI cannot evidence images.** No workflow builds Docker images; the requested “CI run history for docker image builds” is structurally absent. Local builds at this tree are the only image proof.
3. **No hub runtime boot at this exact SHA.** Image build and DNS alias resolution were proven; booting the hub against PostgreSQL was proven at earlier SHAs in the M28-13 matrix, not repeated here.
4. **Concurrent tree drift and current lock.** Other owners committed `00b0064`, `9a1bf85` and `b24bedd` and have uncommitted `apps/arsy/src` SKYLINK wiring during this session. Commit `00b0064` adds Cockpit's `@moonwitness/moonql-client` workspace importer; the current lock has a small corresponding delta from the assigned baseline. CI at `cbaec2d` passed the frozen-lock install and full verification with that importer. The current local `dev` HEAD is `97f1d6a`; the worktree has unrelated uncommitted changes that are not included in HEAD or attributed to M28-04.
5. **DNS proof is mechanism-level.** The alias was reproduced with an equivalent `--network-alias radio` container and confirmed by `docker compose config`; the full compose stack was not booted (avoids host ports and `.env` secrets).

## Integrator revalidation (2026-10-27)

- **Test source:** local `dev` HEAD `97f1d6a854b657a41349013e078b71e2bde72282`; `apps/arsy/test/compose-contract.test.ts`, `scripts/apps.registry.mjs`, and the M28-04 Docker/Compose/runner files were clean. `git log` confirms the registry assertion fix is committed as `5562f9b` and is an ancestor of remote `dev` `cbaec2d`.
- **Focused command:** `pnpm --filter @moonwitness/arsy exec tsx --test test/compose-contract.test.ts test/dockerfile-contract.test.ts test/env-contract.test.ts` → **28 tests, 28 passed, 0 failed, 0 skipped**. This replaces the baseline 27/28 result above.
- **Runtime config check:** `docker compose config --quiet` → exit 0 at the local test tree; no rendered configuration or secret values were printed.
- **Current remote integration:** GitHub Actions run [`40474864810`](https://github.com/bjo163/moonwitnessxv/actions/runs/40474864810) at exact `cbaec2db5af416e58b71b57a16127267d3c7007f` completed success for Monorepo Verification & Safety Gates and the guarded promotion job. The run includes current lockfile installation after the Cockpit workspace importer was added. Both remote `dev` and `main` now point to `cbaec2d`.
- **Independent review:** final read-only review found the technical parent DoD supported by the combined child-task, test, build, and CI evidence; it required only the worktree wording clarification above. No TODO status change is claimed until this audit is integrated and CI passes on that exact SHA.
