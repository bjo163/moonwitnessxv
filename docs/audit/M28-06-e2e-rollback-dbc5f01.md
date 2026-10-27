# M28-06 exact-SHA end-to-end and rollback record

**Task:** M28-06 — full ARSY rename regression and rollback drill.
**Source SHA:** `dbc5f01dad478fce74250fe253b801f98d1d5729` (`dev` and `main`).
**Worker:** integrator. **Scope:** clean detached validation checkout; no application source changed.

## Exact-SHA verification and images

- Environment: Node `v24.22.1`, pnpm `10.33.4`.
- `pnpm install --frozen-lockfile` — passed; 43 workspace projects, lockfile current.
- Exact-SHA GitHub Actions run [40487375673](https://github.com/bjo163/moonwitnessxv/actions/runs/40487375673) — completed successfully at `dbc5f01`. The verification job passed dependency/secret gates and `pnpm verify` (build, lint, SDK drift, tests and web builds); guarded promotion to `main` also passed. `git ls-remote` confirmed both `dev` and `main` at this SHA.
- Local exact-source Docker builds passed:
  - ARSY: `docker build -f Dockerfile -t moonradio-m28-06-dbc5-arsy:latest .` — image ID `sha256:9644ee02d1ed47849ef985ff2cc2de7a4f7b9a24e01612221a6ddcd3e9146f1d`.
  - Dock: `docker build -f Dockerfile.web --build-arg APP=dock --build-arg APP_PORT=3001 -t moonradio-m28-06-dbc5-dock:latest .` — image ID `sha256:6da0b82426532c0e9f1274c338af0a303ac00962ab349ec5304b8d55bc7793ed`.
  - Headquarters: `docker build -f Dockerfile.web --build-arg APP=headquarters -t moonradio-m28-06-dbc5-hq:latest .` — image ID `sha256:2d5560af75cd332ab68d343037adaddf58acfd9e166b7578b0e58295a041acba` (`APP_PORT` defaults to its Compose value, `3002`).
- Focused provider-neutral channel and webhook suite: after `pnpm build:libs`, `pnpm --filter @moonwitness/arsy exec tsx --test test/channels.test.ts test/denpa.test.ts` — **9 passed, 0 failed**. This covers a registered fake channel, admin-only operations, malformed/unknown requests, token-gated webhook behavior, disabled configuration and fail-closed missing-token behavior.

## Disposable PostgreSQL and runtime checks

The three exact-SHA images ran on a private Docker network with an isolated `postgres:17-alpine` database (`m28fe8`). Random test credentials were stored in a temporary local file and were not included in output or Git. No live service, WhatsApp account or public stream was contacted.

- ARSY `GET /api/v1/health/ready` — `200`, engine `pg`.
- Admin login — `200`; admin channel list — `200` with zero channels because WhatsApp was deliberately disabled. Anonymous channel listing — `401`.
- Public station listing — `200`, 36 seeded stations. Anonymous station creation — `401`.
- DENPA webhook with an invalid test token — `401`; the valid random test token — `202`.
- Dock `/` and a seeded station detail route — `200`; Headquarters `/login` — `200`. Both web containers were configured to reach the single ARSY container via the legacy `radio` DNS alias and `/api/v1`.
- Browser playback on the exact Dock image used a generated synthetic WAV intercepted in Playwright; it made one media request and reported `paused:false`, `readyState:4`, `currentTime > 0.8s`, and `error:null`. No third-party radio stream was requested.

## Rollback and data integrity

After capturing a data-only PostgreSQL dump, the `dbc5f01` ARSY/Dock/Headquarters containers were stopped. The earlier `fe8e84c` ARSY (`sha256:2ef73615f7fbf9e4245807b2d03eb64fb80202b30cc586321eaca2696a456f76`), Dock (`sha256:c9f00c5c9cc71544bbdce38bb579175369b7092eaed018abb46f57529d503be6`) and Headquarters (`sha256:5e2d598add96d207c14d3872dc505bfd6d580ccde24e1d73790a06e36f3c38a2`) images were started against the **same** disposable database. The previous ARSY image reported readiness with engine `pg`; anonymous channels remained `401`; the station list remained at 36; Dock root/detail and Headquarters login returned `200`.

Before and after the prior-image run, `pg_dump --data-only --column-inserts` contained 1,189 `INSERT` statements. SHA-256 over the complete ordered `INSERT` lines was identical: `B54A0024C6FF0AEBC332D597FE2751E6CB0B48FE5FB43A658D67D48B638C3765`; PostgreSQL sequence-state lines also matched exactly. The whole dump-file hash differed only in randomized `\restrict` / `\unrestrict` psql directives; neither row data nor sequence state differed. After the previous images were stopped, the exact `dbc5f01` stack was restarted and returned ARSY `pg` readiness, Dock `200`, and Headquarters `200`; the same 1,189-row statement count, data hash and sequence state still matched. This demonstrates image rollback and restoration without schema rollback or production deployment.

The later repeat of the synthetic playback, after the rollback comparison had completed, wrote one synthetic playlog row to the disposable database. That row was outside the before/after rollback comparison; the disposable database was removed during cleanup.

## Limitations and safety

- The browser reported React hydration error `#418` on the station detail page. A previous Dock visual audit also recorded hydration-related console errors. The exact cause was not isolated here; audio playback still passed, and M28-06 does not claim the warning is fixed.
- The real runtime channel registry was empty because no provider credentials were supplied. Provider-neutral channel operations and negative authorization cases passed in the focused test suite; no live provider delivery is claimed.
- This is exact-source image/runtime evidence on disposable local infrastructure. It does not prove a public deployment or production recovery.
- Rollback is reversible: stop the disposable containers and remove the isolated network/database. No source, schema migration, shared database or production service was changed.
- Cleanup completed: all `m28-06-dbc5-*` and `m28-06-rollback-*` containers plus `m28-06-dbc5-net` were removed; the temporary credential file and data dumps were deleted. The three exact-SHA image tags were retained locally for reproducibility.

**Review:** Independent review completed after the audit corrections; no blocker remained. **Result:** M28-06 acceptance evidence collected at exact source SHA `dbc5f01dad478fce74250fe253b801f98d1d5729`; the integrator recorded closure in TODO at commit `ed92b12`.
