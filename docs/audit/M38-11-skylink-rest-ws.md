# M38-11 — SKYLINK REST/WS surfaces, two auth modes, duplicate-channel guard: evidence

- task_id: M38-11
- baseline_sha: `e8efe213ea93f504d56ae4b01d1e2ed9ecdcf61c` (branch `dev`)
- scope authority: [packet](../tasks/M38/M38-11.md), ADR-0006 (SKYLINK owns D18 only)

## actual_changed_files
- `apps/skylink/src/modules/routes.ts` + `webhooks.ts` — contract routes with the XV envelope and per-route auth: `x-skylink-key` (service) or `Authorization: Bearer` (ARSY session validated upstream, cached ≤15s with event-driven invalidation).
- `apps/skylink/src/auth.ts` — upstream ARSY session resolution; opaque tokens, no local JWT, no cookies, no login endpoint.
- `apps/skylink/src/ws.ts` — `/ws` with first-frame auth and the documented events incl. `channel.state`.
- `apps/skylink/src/channels.ts` / `events.ts` / `config.ts` / `index.ts` / `server.ts` — channel registry, event bus, env, and an injectable logger seam (`options.logger ?? false`; production behavior unchanged).
- `packages/skylink-store/src/repositories.ts`, `packages/skylink-telegram/src/index.ts` — D18 store and provider wiring for the control plane.
- `apps/arsy/src/lib/channels.ts` + `apps/arsy/test/channel-manager.test.ts` — duplicate channel id is a boot-time named error (verified load-bearing: removing the guard fails the test).
- `apps/arsy/test/{channel-manager,control-plane} tests` in `apps/skylink/test/control-plane.test.ts` — positive/negative evidence incl. a runtime log-hygiene test.
- `apps/skylink/package.json` — test script loads `.env` (`node --env-file-if-exists`), which is why the earlier run reported green while the DB+WS assertions had been silently skipped.
- `apps/skylink/tsconfig.json`, `apps/aigateway/tsconfig.json` — missing `tsc -b` project references added (pre-existing `workspace-topology` failure at baseline, surfaced by this work).

## root cause of the prior "WS hang"
`@fastify/websocket` was registered as a deferred plugin on the root instance while `/ws` was registered on that same instance — the upgrade never completed and `waitForOpen` stalled. Fix: register the WS route inside `await scope.register(websocket)` an encapsulated scope. Proven empirically by reverting (3 WS tests fail with `WebSocket failed to open`) and restoring (pass).

## positive_test_and_output (executed against a real local PostgreSQL)
- `pnpm exec tsx --test test/control-plane.test.ts` → 5/5 pass, 0 skipped (DB-backed send + WS `channel.state` with `channelId:'fixture'`, `state:'open'` delivered after first-frame auth).
- `pnpm --filter @moonwitness/skylink test` → `tests 10 / pass 10 / fail 0 / skipped 0`, exit 0, ~1.7s, stable across 3 runs.
- `apps/arsy` focused: `tsx --test test/channel-manager.test.ts` → 2/2 pass; `test/channels.test.ts` (real ARSY boot) → 3/3 pass.
- `apps/arsy` `workspace-topology.test.ts` → 7/7 pass after the tsconfig reference fix.
- Scoped eslint over all touched dirs → exit 0.

## negative_test_and_output
- 401 unauthenticated, 401 cookie-only, 401 expired ARSY session; 403 service-key on control-plane reads and non-admin sessions.
- Duplicate channel id fails boot with the named error; removing the guard flips both ARSY tests to fail (then restored).
- Log hygiene: an injected info-level leak of a synthetic ARSY token fails the new test; asserts no service key, bearer token, QR, or message body at info level; QR absent from anonymous and admin `/channels` payloads; `channel.qr` reaches only the authenticated admin socket.

## security_rights_privacy
No cookies or login surface; session tokens are validated upstream and cached briefly; QR payloads never logged nor returned to unauthenticated callers; D18 remains SKYLINK's only SQL domain (closed owner set guard passes).

## rollback
Revert routes/WS module; store and providers remain; no schema change.

## reviewer / result_sha / limitations
- Reviewer: integration by the session owner; result SHA recorded in the closing TODO commit.
- Limitation: the DB+WS test requires `DATABASE_URL`; CI has no Postgres service, so on CI it skips with an explicit reason rather than passing silently — local exact-tree evidence above is the load-bearing run.
- Pre-existing, out of scope: `pnpm --filter @moonwitness/arsy typecheck` fails on 19 errors in 8 unrelated test files; `channel-manager.test.ts` and ARSY `src` are clean.
