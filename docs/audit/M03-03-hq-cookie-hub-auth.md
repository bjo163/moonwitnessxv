# M03-03 — HQ cookie versus Hub authentication

## Scope and baseline

- **Task:** M03-03 (P0), forged/expired Headquarters cookie versus Hub auth.
- **Baseline SHA:** `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Working branch:** `codex/m05-08-locale-audit-387f784`.
- **Prerequisite:** M03-01 is checked in TODO and its denial tests were revalidated in the 2026-10-26 audit.
- **Changed paths:** `apps/headquarters/src/data/sdk.ts`, `apps/headquarters/src/data/server-sdk.mjs`, `apps/headquarters/src/data/queries/session.ts`, `apps/headquarters/src/lib/session-auth.mjs`, `apps/headquarters/test/session-auth.test.ts`.

## Behavior and tests

HQ's middleware is an early navigation gate and only checks whether `hq_token` exists. The admin layout calls `me()`, which sends the opaque cookie value as a bearer token to the Hub's `/auth/me`; only a Hub 401 becomes an anonymous session and triggers the existing login redirect. Other Hub errors remain visible. The Hub remains the authentication authority; no cookie/JWT verifier or alternate session owner was added.

The shared HQ server-client constructor and `resolveHqSession` keep the tested behavior in the production call path. Focused tests assert that a forged cookie can pass middleware but is forwarded to Hub auth and yields no user on 401; an expired-token 401 yields no user; a Hub-confirmed session returns the user; a 503 is not disguised as logout; and a request with no cookie is redirected to login.

Actual Hub denial evidence was also rerun from its own app suite: an unknown bearer token receives 401, while login-issued tokens work and logout revokes a warmed token. Those checks use the real in-memory Radio/Hub app and passed. No personal data or real credentials were used.

## Commands and observed results

- `pnpm --filter @moonwitness/radio exec tsx --test ../../apps/headquarters/test/session-auth.test.ts` — 5 passed, 0 failed. The HQ client uses a deterministic mocked Hub response for the forged/expired-cookie cases.
- `pnpm --filter @moonwitness/radio exec tsx --test test/moonql-identity-cache.test.ts` — 4 passed, 0 failed against the actual in-memory Hub app, including unknown-token 401 and logout revocation.
- `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- `pnpm exec eslint apps/headquarters/src/data/sdk.ts apps/headquarters/src/data/server-sdk.mjs apps/headquarters/src/lib/session-auth.mjs apps/headquarters/src/data/queries/session.ts apps/headquarters/test/session-auth.test.ts` — passed.
- `git diff --check -- apps/headquarters` — passed.

## Evidence limits, rollback, and status

The HQ test's Hub responses are injected; they do not run an end-to-end request from the HQ cookie reader into a live Hub instance. The actual Hub suite independently confirms rejection and revocation, but does not use HQ's cookie reader. A true elapsed-time/expiry database scenario is not claimed here and remains within M03-05. There was no browser deployment test. The root integrator must review whether this compositional evidence satisfies the task before updating TODO.

Rollback by reverting the five listed paths together. Runtime API, cookie name/options, Hub token format, and role rules are unchanged. No TODO status or commit was changed; result SHA is pending integration.
