# M40-09 evidence — cross-app auth, deployment and extraction boundaries

**Task:** [M40-09](../tasks/M40/M40-09.md) · **Milestone:** [M40](../milestones/M40.md)
**Branch:** `dev`
**Baseline SHA (exact):** `39a7e2733509d88f5e9e56b13d85c4277d72edf9`
**Date:** 2026-10-27
**Toolchain as observed:** Node `v24.22.1`, `pnpm@10.33.4`

## 1. Worktree condition

The shared worktree carried 78 paths of other sessions' uncommitted work at baseline, including
`apps/orbit/src/lib/queues/operational-queues.ts`, `apps/orbit/test/orbit-queues-inspectors.test.mjs`
(their reopened M40-07 fix), `apps/arsy/src/app.ts`, `apps/arsy/src/fastify.d.ts`,
`apps/arsy/src/modules/channels/index.ts`, six `apps/dock` files, `apps/skylink/src/modules/routes.ts`
and `docs/audit/screens/*`. None of them was staged, edited or committed here. §3 was therefore
re-run in a clean checkout of the resulting commit (§6) so that the numbers below are attributable
to this change alone rather than to the mixed tree.

## 2. Claimed vs actual files

| Claimed | Actual | Δ |
| --- | --- | --- |
| new `apps/orbit/test/orbit-cross-app-boundaries.test.mjs` | present, 491 lines | +491 |
| new `apps/orbit/src/lib/server/review-surface.ts` | present, 60 lines | +60 |
| modified `apps/orbit/src/lib/handoff/approval-handoff.ts` | 100 lines, −58/+1 (config resolver removed) | as claimed |
| modified `apps/orbit/src/lib/server/arsy-runtime-client.ts` | +15/−2 (`redirect: 'manual'`, 3xx branch, import path) | as claimed |
| modified `apps/orbit/src/lib/projections/operational-projection.ts` | 1 line (import path) | as claimed |
| modified `apps/orbit/README.md` | +27 (env contract, deployment) | as claimed |
| modified `apps/orbit/test/orbit-approval-handoff.test.mjs` | +3/−1 (imports follow the split) | as claimed |
| modified `TODO.md` | one row (M40-09) only, verified by `git diff --cached` | as claimed |
| no other orbit file | `git status` after staging showed `queues/` and its test still unstaged | as claimed |

`find apps/orbit/src -name "*.ts" -o -name "*.tsx" | wc -l` → **27** source files, the population every
source-contract assertion in the suite walks (`.next` and `node_modules` excluded by construction).

## 3. Commands executed and output observed

### 3.1 Boundary suite

```
$ cd apps/orbit && node --test test/orbit-cross-app-boundaries.test.mjs
✔ M40-09: dependency ownership — no SQL driver, no second backend (0.9434ms)
✔ M40-09: no database, migration or identity artifact inside ORBIT (4.2314ms)
✔ M40-09: no import escapes the package except shared workspace packages (3.2511ms)
✔ M40-09: no browser-reachable import chain reaches the server directory (6.7516ms)
✔ M40-09: hub and review surface are resolved server-side only, without credentials (4.2053ms)
✔ M40-09: expired or unauthenticated hub session denies live state (34.5129ms)
✔ M40-09: outage, refusal and timeout all fail to an honest OFFLINE (131.4786ms)
✔ M40-09: a redirect away from the resolved hub is refused, not followed (5.3698ms)
✔ M40-09: conflicting hub configuration fails closed instead of picking a second hub (0.2577ms)
✔ M40-09: corrupt or unrecognised hub output degrades without throwing (7.8543ms)
✔ M40-09: a healthy hub is required before any LIVE claim (4.7105ms)
✔ M40-09: the BFF route is read-only, cache-free and maps denial to 401 (0.3465ms)
✔ M40-09: deployment contract — one registered port and shared config rules (1.72ms)
✔ M40-09: nothing logs, because a log line is a bundle-shaped leak (1.2906ms)
✔ M40-09: extraction boundary — ORBIT is described as a frontend everywhere it is named (0.3675ms)
✔ M40-09: built client bundle carries no credential (run with ORBIT_SCAN_BUNDLE=1 after a build) (7.6209ms)
ℹ tests 16  ℹ pass 16  ℹ fail 0
```

`--test-reporter=tap | grep -c "^ok"` → 16.

### 3.2 Denial behaviour is exercised against real sockets

The five HTTP tests bind a throwaway `node:http` server per case and pass its URL as `ARSY_API_URL`,
so the adapter sees an actual status, header and body rather than a stubbed promise:

| Stand-in hub answer | ORBIT state observed |
| --- | --- |
| `401 {"error":"SESSION_EXPIRED"}` | `UNAUTHORIZED`, zero rows, `SECURITY` trace, `freshness=UNKNOWN` |
| `403 {"error":"FORBIDDEN"}` | same, per-role denial path |
| `503` / `ECONNREFUSED` (port 1) / socket held open with `timeoutMs:120` | `OFFLINE`, `UNKNOWN`, zero rows |
| `302` to a decoy server that answers a healthy payload | `OFFLINE`, decoy request count **0**, reason matches `/redirect/i` |
| `ARSY_API_URL` and `RADIO_API_URL` disagreeing | `OFFLINE`, reason matches `/conflict/i`, zero rows |
| HTML body / wrong-typed fields / `connectionStatus:'MUSEUM'` | no throw, status and agent state stay inside the contract |
| `200 {"status":"ok","channels":3}` | `LIVE_CONNECTED`, `FRESH`, every row `provenance==='LIVE'` |
| same payload timestamped 11 minutes earlier | `freshness==='STALE'` |

### 3.3 The redirect defect was real before the fix

Observed with `node -e` against a 302-returning server, before `redirect: 'manual'` was added:

```
manual status 302 type basic ok false loc "http://127.0.0.1:58411/decoy"
follow status 200 type basic
```

Under the previous (default `follow`) behaviour the probe returned `200` from the redirect target, so
`fetchOrbitOperationalState` would have projected that payload as `LIVE_CONNECTED` / `FRESH`. With
`manual`, the 3xx is visible to the adapter and is mapped to `OFFLINE`.

### 3.4 Orbit suite, including the built-bundle scan

```
$ pnpm --filter @moonwitness/orbit build     # after the split
✓ Compiled successfully in 485ms
Route (app)
┌ ƒ /
├ ƒ /_not-found
└ ƒ /api/ops/state
ƒ  (Dynamic)  server-rendered on demand

$ cd apps/orbit && ORBIT_SCAN_BUNDLE=1 node --test test/*.test.mjs
ℹ tests 85  ℹ pass 85  ℹ fail 0  ℹ skipped 0
```

The scan walks `.next/static` `.{js,mjs,css,html}` chunks (< 8 MB each) twice: by secret *shape*
(private-key header, AWS key id, JWT pair, long `Bearer`, quoted `password|service_key|grant_secret|api_key`
assignment) and by *value*, against every non-`NEXT_PUBLIC_` entry of the local root `.env` whose value is
12 characters or longer. Failures name files and variable names only — no value is printed.

A shape-only grep was tried first and produced two false positives that are recorded here because they
explain the final design: `.next/static/chunks/0cz1d0mv5g_q7.js` contains the WHATWG URL parser
(`s.password=""`) and `.next/static/chunks/1ns1gammbaz7x.js` contains React DOM's input-type allowlist
(`password:!0`). Both are framework code, not leaks.

### 3.5 The value scan found one real boundary defect

With the value-based scan enabled, `31tupunvb43xx.js` matched the resolved review origin. The chunk
carried `n={dock:"http://localhost:3001",headquarters:"http://localhost:3002"}` because
`OrbitNodeInspector.tsx` and `OrbitOperationsWorkspace.tsx` (both `'use client'`) import
`buildApprovalHandoff` from `approval-handoff.ts`, which imported `FRONTEND_URLS` from
`@moonwitness/core` and declared `resolveReviewSurface(env = process.env)`. Not a credential, but it put
a configuration reader and the default 100CENTER origin inside browser code, contradicting the M40-08
claim that the browser never chooses a target.

Fix: `LOOPBACK_REVIEW_SURFACE`, `ABSENT_REVIEW_SURFACE`, `validateReviewOrigin` and `resolveReviewSurface`
moved to `src/lib/server/review-surface.ts`; `approval-handoff.ts` keeps only the display descriptor and
receives the surface as a parameter. `operational-projection.ts` and `arsy-runtime-client.ts` re-point at
the server module. Two assertions now pin this: the client-component import graph (BFS over value imports,
with extension resolution) reaches no file under `src/lib/server/`, and the bundle scan finds no origin.
The BFS is guarded against being vacuous — it asserts that
`src/components/OrbitNodeInspector.tsx` really resolves to `src/lib/handoff/approval-handoff.ts`.

After the fix: `ℹ pass 85 ℹ fail 0` with `ORBIT_SCAN_BUNDLE=1`, and the origin assertion is green.

### 3.6 Gates

```
$ pnpm --filter @moonwitness/orbit typecheck   → exit 0 (tsc --noEmit, no diagnostics)
$ npx eslint apps/orbit --max-warnings 0       → exit 0 (no errors, no warnings)
$ pnpm ui:check                               → Files scanned: 132 | Total Violations: 0
                                                 "Monorepo UI consistency check PASSED"
$ pnpm --filter @moonwitness/arsy test         → tests 377 | pass 366 | fail 0 | skipped 11 | 90.87s
```

The ARSY run includes the topology assertions that keep one hub identity, confine SQL drivers to MoonQL
and the SKYLINK store, and derive the root build scripts; ORBIT's change touches no hub code, and the hub
suite stayed green. Its 11 skipped tests are pre-existing skips, not caused here.

### 3.7 Combined artifact not re-run — limitation

`pnpm build:web` was not executed. Another session's uncommitted `apps/dock/src/ui/components/*` work is
present in the shared worktree and breaks the combined artifact, so a failure there would not be
attributable to ORBIT. ORBIT's independent buildability — which is the actual M40-09 requirement — is
proven in §3.4 by the standalone `pnpm --filter @moonwitness/orbit build`.

## 4. DoD matrix

| Definition of done | Evidence | Claim status |
| --- | --- | --- |
| Unauthorized/expired calls denied | §3.1 + §3.2: 401/403 → `UNAUTHORIZED`, zero rows, `SECURITY` trace, `UNKNOWN` freshness; BFF maps it to HTTP 401 | verified at baseline SHA |
| Redirects cannot launder a live claim | §3.3: `redirect:'manual'`, decoy request count 0 | verified at baseline SHA |
| No service key in browser bundle / config / logs | §3.4 value+shape scan, §3.5 fix, no `console.*` in 27 source files, no credential-shaped env read | verified at baseline SHA |
| Independent frontend build | §3.4 standalone build, 3 routes, single API route dir `['route.ts']` | verified at baseline SHA |
| No DB / identity owner | `package.json` allowlist, no SQL driver, no `.sql/.prisma/ddl/migration` artifact, no `auth_users|createSession|issueToken|verifyPassword`, no `migrate` script | verified at baseline SHA |
| No private HQ/100CENTER import | import scan: only `@moonwitness/{core,moonql-client,moonui,web-config}` + next/react/three; the `@/` alias resolves inside `src` and is used only by the BFF route | verified at baseline SHA |
| Env contract closed and written down | allowlist of four variables equals the README table; only `src/lib/server/*` reads `process.env` | verified at baseline SHA |
| Role/expiry denial *at 100CENTER* | — | **not claimed**: HQ-side decision denial remains M20-06, M20-07, M37-05 |
| Live browser walkthrough of the handoff | — | **not claimed**: no server was started; no screenshot evidence for this task |
| Deployment/promotion | — | **not claimed**: nothing deployed, no container, no Coolify action |

## 5. Security and rights notes

- No secret, environment value or private witness material was read into a test fixture; the `.env`
  scan compares in memory and prints variable names only.
- The scan is opt-in (`ORBIT_SCAN_BUNDLE=1`) so a missing artifact cannot be reported as a pass and an
  absent `.env` cannot be reported as a leak.
- The bundle scan is a point-in-time check of this machine's build; a `.env` on another host can only be
  proven absent by re-running the scan there.

## 6. Rollback

Reverting this commit removes the boundary suite, `src/lib/server/review-surface.ts`, the README
env-contract/deployment sections and the `redirect: 'manual'` hardening, restoring M40-08's file layout
(`approval-handoff.ts` self-contained with its own resolver). No data, schema, identity or hub behaviour
is involved; ORBIT keeps rendering because `reviewSurface` was already threaded as data. Rollback
re-exposes the redirect-following probe and the in-bundle origin constant, so it should not be taken to
ship a release.

Verification re-run in a clean worktree of the resulting commit:

```
$ git worktree add <temp> <commit> && cd <temp>/apps/orbit
$ pnpm --filter @moonwitness/orbit build && ORBIT_SCAN_BUNDLE=1 node --test test/*.test.mjs
```

## 7. Next eligible task

M40-10 — exact-SHA release acceptance, rollback rehearsal and extraction review for M40-01..10, with
LUMEN/M41 confirmed closed by its own suite rather than by a TODO row.
