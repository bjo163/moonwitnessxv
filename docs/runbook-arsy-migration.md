# ARSY migration operator handoff

**Current verified source:** `dbc5f01dad478fce74250fe253b801f98d1d5729` (M28-06 runtime and rollback rehearsal). This runbook records the in-place service migration and local operating contract; it is not a production deployment record. Deployment compatibility evidence remains open under M28-15.

## Service map

- **Canonical Hub:** `apps/arsy`, package `@moonwitness/arsy`, one Fastify + MoonQL service and the sole Hub/database authority.
- **HTTP contract:** port `3000`, API prefix `/api/v1`, readiness route `/api/v1/health/ready`.
- **Compose service:** `arsy`; the same container retains the internal DNS alias `radio` during the compatibility window because Dock and Headquarters currently use `RADIO_API_URL` and `http://radio:3000`.
- **Web apps:** Dock on `3001` and Headquarters on `3002`; their Compose health checks and station routes were exercised against the single Hub in the M28-06 rehearsal.
- **Domain naming:** Radio stations, schedule and listening remain the SIGNAL/RADIO domain served by ARSY. They do not constitute a second service.

## Configuration and compatibility

Use `ARSY_PORT`, `ARSY_PREFIX` and `ARSY_TITLE` for new Hub configuration. The service still accepts `RADIO_*` aliases and generic `PORT`, `API_PREFIX` and `API_TITLE` for compatibility. If multiple spellings are provided with different values, configuration validation fails closed; remove the conflict or make values agree before restart. Frontend API URL configuration prefers `ARSY_API_URL`, while `RADIO_API_URL` remains supported. Do not remove the `radio` Compose alias or old variables until consumers have been migrated and a separately reviewed deprecation task has verified them.

Keep deployment secrets in the approved environment/secret store and out of this document and Git. Follow the repository's [security guidance](../SECURITY.md), [restore runbook](runbook-restore.md), and the existing backup process. Use the normal reviewed release process for an environment; this handoff does not prescribe or authorize a production rollout.

## Verified behavior and rollback evidence

The exact-source M28-06 rehearsal built ARSY, Dock and Headquarters images from `dbc5f01`, ran them with an isolated PostgreSQL 17 database, and confirmed ARSY readiness, authenticated/anonymous API behavior, public station listing, Dock playback using a synthetic WAV, and the Headquarters login route. It then ran the prior `fe8e84c` images against the same disposable database and compared 1,189 ordered data statements plus PostgreSQL sequence state; both matched. The exact `dbc5f01` stack was restarted and verified afterward. Full command output, image digests, data hash, cleanup and limitations are in the [M28-06 evidence record](audit/M28-06-e2e-rollback-dbc5f01.md).

That rehearsal used disposable local resources and did not contact a live provider or public stream. It is not evidence that a production host runs this revision. The Dock station detail browser reported React hydration error `#418`; playback succeeded, but the cause was not isolated or fixed by that rehearsal.

## Release handoff

Before a production readiness or deployment claim, complete M28-15 on the actual target environment: record the deployed source/image identity, verify ARSY and both web consumers resolve the intended service and API prefix, exercise authorized and denied station/channel paths, capture health and route evidence, and record the reviewed rollback outcome. Until then, report the `dbc5f01` result only as local exact-SHA compatibility and rollback evidence. TODO.md is the sole status register.
