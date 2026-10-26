# M28-11 audit — ARSY scripts, image, Compose and DNS

- **Task:** M28-11, P0 leaf; prerequisite M28-10 is closed.
- **Baseline:** `b5e2f46a9c1539ac13cb42b46fc64421658b1e43` (agent baseline; integrator completed on `13b8503a370ba4ea69e22b1e4f7f10111a89ed69`).
- **Result:** `2112622aaac679aeffac475781f168cec49a7ad7`.
- **Worker/reviewer:** ARSY/DevOps agent; integrator reviewed and ran final focused gates.
- **Changed paths:** root `package.json`, `pnpm-lock.yaml`, `Dockerfile`, `Dockerfile.web`, `docker-compose.yml`, `scripts/dev.mjs`, `scripts/free-ports.mjs`, `scripts/db-backup.sh`, ARSY package/test/config references, and WhatsApp package/image paths required by M38-09. No unrelated Cockpit changes were staged.
- **Positive evidence:** `pnpm install --frozen-lockfile --ignore-scripts` — lockfile up to date using pnpm 10.33.4; `pnpm --filter @moonwitness/arsy build` — passed; `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts test/compose-contract.test.ts test/dockerfile-contract.test.ts` — 24/24 passed; `docker compose config --quiet` — exit 0; `node --check scripts/dev.mjs` — passed.
- **Negative/compatibility evidence:** contract tests assert no duplicate `radio` service, preserve the `radio` DNS alias to the sole ARSY service, and verify root build coverage for ARSY plus runtime packages. All passed.
- **Security/rights/privacy:** no production secrets or live service access. Docker image build/deployment was not run. The Dockerfile contract is static evidence, not an image runtime claim.
- **Rollback:** revert this integration commit; restore prior package filters, paths, service naming, and lockfile together.
- **Limitations/next:** continue with M28-12; it owns the RADIO_*/ARSY_* config precedence work.
