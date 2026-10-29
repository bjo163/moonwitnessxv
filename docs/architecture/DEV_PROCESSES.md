# Dev processes — the single inventory

**Status:** authoritative for *how the tree runs locally*. Port values are mirrored in `packages/core/src/workspace.ts` (`PORTS`) and enforced by `apps/arsy/test/env-contract.test.ts`; the runner side lives in [`scripts/apps.registry.mjs`](../../scripts/apps.registry.mjs).

`pnpm apps` prints this table from the registry. `pnpm dev` spawns every entry with `dev: true`. `pnpm ports:free` frees every port in the registry. The Cockpit supervises every entry with `supervised: true` (it never supervises itself).

| Tag | Port | Kind | Dev server | Cockpit | Health path | Notes |
|---|---|---|---|---|---|---|
| `arsy` | 3000 | service | yes | yes | `/api/v1/health` | Single Fastify + MoonQL hub; `PORT` alias chain respected |
| `dock` | 3001 | web | yes | yes | `/` | Public Next.js surface |
| `hq` | 3002 | web | yes | yes | `/` | Privileged Next.js surface (session-gated) |
| `ai` | 3003 | service | yes | yes | `/health` | Internal inference adapter |
| `cockpit` | 3004 | web | yes | — | `/` | Operator GUI; must not supervise itself |
| `skylink` | 3005 | service | yes | yes | `/health` | Bounded D18 service |
| `echolog` | 3006 | service | yes | yes | `/health` | Bounded D19 storage; ignores the Radio `PORT` |
| `orbit` | 3007 | web | yes | yes | `/` | M40 spatial frontend; fixtures only |
| `empire-web` | 3010 | web | yes | — | `/` | Isolated bilingual static pilot; not the canonical LIGHTHOUSE runtime |
| `sentinel` | — | worker | yes | yes | — | Daemon, no HTTP surface |
| `lumen-runtime` | — | scaffold | **no** | — | — | M41 plan; listed so absence is explicit |

## Rules

1. **One supervisor at a time.** Do not run `pnpm dev` and Cockpit "Start All" for the same app. Two spawns on one port end in `EADDRINUSE`; the Cockpit probes by connecting to `127.0.0.1`, `::1`, and up to two declared LAN addresses (so wildcard `0.0.0.0` and pinned-LAN listeners count too) and refuses to start a tag whose port answers, naming `pnpm dev` as the likely cause. A connect error that proves *no listener* on a family (`ECONNREFUSED`, or `EADDRNOTAVAIL`/`ENETUNREACH`/`EHOSTUNREACH`/`EAFNOSUPPORT` when IPv6 is disabled) reads as free, so an IPv6-less host is not refused wholesale. The probe checks the port the child will actually bind: `apps/cockpit/src/config.ts` declares each service's env port spellings (`envPortKeys`) and the key the supervisor pins (`portPinKey`), so an `ARSY_PORT`/`ECHOLOG_PORT` override or a shared generic `PORT` cannot make the guard probe one port while the app binds another. A per-tag in-flight lock closes the check-to-spawn window, the `exit` handler is identity-guarded so a superseded child cannot clobber a restarted one, and a spawn `error` (missing `pnpm`, `shell:` failure) is reported instead of crashing the cockpit or answering a false success.
2. **No port without a contract.** Adding an app with a port requires the value in `PORTS`, in the registry, and (if supervised) in `apps/cockpit/src/config.ts`. The coverage test fails otherwise.
3. **`dev: false` means honest absence.** A scaffold is listed and printed as such; it is never spawned with a placeholder command.
4. **The registry is plain ESM on purpose.** `pnpm ports:free` must work on a clean checkout before `build:libs`, so no `@moonwitness/core` import is allowed there.
5. **Workers have no port.** `sentinel` and `lumen-runtime` never claim one; `free-ports` must not invent one for them.
