# M37-02 — SSO session and safe redirect boundary

**Design specification · source SHA `e3301e53f0bba2ed31b6ec5b83b8bb070edde7fa` · no SSO implementation or deployment approval.** This leaf defines how future cross-app SSO may reuse existing identity without creating another identity authority. It records current Headquarters behavior separately from proposed cross-app behavior.

## Existing Headquarters evidence

At the source SHA, `apps/headquarters/src/lib/session.ts` names an opaque `hq_token` cookie, sets `httpOnly`, `sameSite: 'lax'`, `/` path and the shared session TTL, and enables `secure` in production unless `HQ_COOKIE_SECURE=false` is explicitly selected for plain-HTTP Compose. `apps/headquarters/src/middleware.ts` allows `/login` and `/api/session` without a cookie, and uses cookie presence only to route to the app; it does not validate the token. The protected server layout calls ARSY `/auth/me` through the server SDK, where Hub 401 becomes anonymous and non-401 errors remain errors. `apps/headquarters/src/app/api/session/route.ts` sets or deletes the cookie and uses `safeNext` for login success.

Current `safeNext` accepts a value only when it starts with `/` and does not start with `//` or `/\\`; otherwise it falls back to `/`. The route returns a relative `Location`, avoiding a host derived from forwarded/request URLs. The existing tests prove a local session path, forged/expired rejection by Hub and redirect on no cookie, but `apps/headquarters/test/session-auth.test.ts` does not directly test `safeNext` boundary inputs. None of this proves an SSO broker or production TLS deployment exists.

## Proposed cross-app session contract

1. **One identity authority.** ARSY/D00 remains the canonical login, session validation, role and revocation authority. Dock, Headquarters, Cockpit, ORBIT and other consumers must not mint independent identity, role, or refresh state. A consumer may establish a local presentation/session handle only under a separately reviewed ADR and threat model; it may never convert cookie presence into authorization.
2. **Server-only credentials.** Opaque bearer/session values are held in `HttpOnly` cookies and sent only by server-side calls to the existing authority. Never return them in HTML/JSON, browser storage, URLs, analytics, logs, or cross-app links. `Secure` is mandatory for any public HTTPS deployment; `SameSite` and cookie domain/path scope require a specific reviewed topology. Do not broaden cookie `Domain` to a parent domain by default.
3. **No token-bearing redirect.** Cross-app navigation carries only a validated local route or an opaque, short-lived, single-use authorization code handled by an explicitly accepted future SSO flow. Never place access tokens, session cookies, secrets, role claims, or personal data in query strings, fragments, referrers, or return URLs. No such code exchange or broker is authorized by this specification.
4. **Same-origin return paths.** A `next` value is a path, not a URL: require exactly one leading `/`; reject `//`, `/\\`, schemes, hostnames, control characters, encoded separators/dot segments, backslash after decoding, and parser-normalized paths that escape the allowed app route. Normalize and validate once, then emit a relative `Location`. Invalid or missing values fall back to the fixed safe app root. Preserve allowed locale prefixes only after validating against the app's known route/locale contract.
5. **Authorization is independent.** Every protected page, server action, API and data read/write validates the current session/role/scope with ARSY or its approved typed contract. Expired, revoked, forged, malformed or unverifiable sessions fail closed; infrastructure failure is an explicit unavailable/error state, never anonymous success or cached authorization. Direct URL and API access receive the same server-side guard.
6. **Logout and revocation.** Logout clears the local cookie and revokes through the authority. Do not promise global logout until every session is revocable/checked centrally. Test concurrent requests, expiration and revocation across every participating app before claiming cross-app SSO.

## Acceptance matrix for a future implementation

| Case | Required behavior |
|---|---|
| Valid path `/settings?tab=profile` | Return to the same app path with relative `Location`; authorize destination independently |
| `//attacker.example`, `/\\attacker.example`, absolute URL, encoded CR/LF, encoded slash/backslash, dot-segment escape, malformed encoding | Reject and use fixed local root; no external `Location` and no token leakage |
| Missing, forged, expired or revoked cookie | Hub denies; protected page/API does not render or mutate; cookie is cleared where appropriate |
| Hub timeout/5xx | Surface unavailable state; do not treat as valid, silently anonymous, or rely on stale positive cache |
| Role/scope mismatch or direct API request | Server denies even if a browser cookie exists or a UI control is hidden |
| HTTPS deployment | `Secure` cookie, reviewed TLS termination, trusted-proxy/host handling, no credentials in redirect/referrer/logs |
| Logout | Local handle cleared and authority revocation confirmed; global effect claimed only after all-app tests |

## Exact-source checks and limitations

Positive evidence at `e3301e53f0bba2ed31b6ec5b83b8bb070edde7fa`: inspected the existing HQ middleware, session cookie options, login/logout route, server SDK/session resolver, and `apps/headquarters/test/session-auth.test.ts`. The sources demonstrate server-side Hub validation and same-origin relative redirect behavior for existing paths. Existing test source includes forged/expired cookie denial, missing-cookie redirect and Hub 503 propagation, but it was not executed here. `pnpm --filter @moonwitness/headquarters test` exits 1 because no `test` script is declared; direct `node --test apps/headquarters/test/session-auth.test.ts` exits before assertions because the Next.js `next/server` import needs the project TSX loader. `pnpm --filter @moonwitness/headquarters typecheck` also exits 1 without reported diagnostics. Thus there is no passing test or typecheck evidence at this baseline; the claims above are source inspection only. No new test command or SSO exchange was run as part of this design-only artifact.

Independent read-only review found no blocker for a design-only artifact and confirmed the current-code claims. It noted that encoded CR/LF and dot-segment `safeNext` cases in the proposed matrix have no direct test today; this is preserved as an unresolved verification task, not a proven runtime guarantee.

Unresolved before implementation: choose an approved SSO topology and participant apps; define code exchange, CSRF/state, audience, redirect allow-list, cookie scope, revocation propagation, rate limits, and TLS/proxy trust. Add direct adversarial `safeNext` tests for encoded and parser-normalized paths. Do not claim cross-app SSO, public security certification, or deployment from this document.

## Rollback

One additive specification file; rollback by deleting this file only after checking references. No session behavior, cookie, endpoint, identity owner, or deployment setting is changed.
