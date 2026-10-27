# M28-07 — ARSY migration operator handoff evidence

**Task:** M28-07 — Complete ARSY migration changelog, service map and operator handoff.
**Source/runtime evidence SHA:** `dbc5f01dad478fce74250fe253b801f98d1d5729`.
**Documentation integration baseline:** `ed92b1214703db85dbf847121985868b5b37f570` (M28-06 audit/status commit).
**Result SHA:** `8a105edead6f7afb616c89079ca5975108f85719`.
**Worker:** integrator. **Scope:** documentation only; no runtime source or deployment changed.

## Findings and documents reconciled

- Exact-source M28-06 record confirms one `apps/arsy` Hub and the tested Dock/Headquarters compatibility routes, while retaining the `radio` internal DNS alias for current consumers.
- The active exact-source search for `apps/radio` / `@moonwitness/radio` in code/build paths found only three deliberate negative assertions in `apps/arsy/test/workspace-topology.test.ts`; no active import was reported. The path/package migration is in place. The legacy DNS alias and `RADIO_*` variable names are compatibility interfaces, not a second Hub.
- On the detached exact-source tree, PowerShell inventory `$paths = @('apps','packages','scripts','package.json','pnpm-workspace.yaml','Dockerfile','Dockerfile.web','docker-compose.yml'); rg -n 'apps/radio|@moonwitness/radio' $paths` returned exactly those three expected assertions.
- Updated `README.md`, `BLUEPRINT.md`, `docs/architecture/APPS.md`, `docs/decisions/ADR-0001-arsy-is-xv-hub.md`, and `CHANGELOG.md` to cite source `dbc5f01`, describe exact-SHA rollback evidence, and retain the M28-15 live deployment gate.
- Added [operator handoff](../runbook-arsy-migration.md) with service map, config compatibility, rollback evidence pointer, known hydration warning and release handoff limits.
- Added [M28-07 task packet](../tasks/M28/M28-07.md) to define acceptance and review boundaries.

## Runtime evidence basis and limitations

The [M28-06 audit](M28-06-e2e-rollback-dbc5f01.md) records exact commands, image IDs, API/ACL checks, Dock playback, same-database previous-image rollback, data/sequence comparison and cleanup. It reports Dock hydration error `#418`, not resolved by this task. This evidence uses disposable local infrastructure; it does not establish that a production host runs the images or SHA.

## Review and status

Independent reviewer checked the final M28-07 documentation and found no remaining blocker; review confirmed the exact-source distinction between app path and compatibility aliases, the M28-15 deployment gate, and the disclosed hydration warning. `git diff --check` completed without whitespace errors. The read-only task-register/link validator scanned 360 task rows and reported 23 repository-wide diagnostics, with **zero diagnostics in the changed documents** (including README, ADR, Blueprint, changelog, packet, handoff, and audit). Exact-SHA GitHub Actions run [40492799312](https://github.com/bjo163/moonwitnessxv/actions/runs/40492799312) passed the dependency/secret gates and full `pnpm verify` workflow at result SHA `8a105edead6f7afb616c89079ca5975108f85719`; guarded promotion to `main` also passed, and both `dev` and `main` point to this SHA. M28-15 remains the next deployment-compatibility gate. No production operation or schema change was performed.
