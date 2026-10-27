# M19-23 — HQ language selection, cookie and cross-app links

**Task:** M19-23 (P1, LEAF)  
**Baseline:** `1235e9e0b009d4b6358c3690aef4f74801016905` (`dev`)  
**Verified result SHA:** `cb719d9253949e3e021aaa1e7903abc5b4bac667`  
**Owner / integrator review:** Headquarters task worker `/root/m19_23_locale_selector`; integrated and reviewed by `/root`.

## Delivered scope

- Added an `id`/`en` selector in both the authenticated HQ shell and the auth/login shell. It writes only the non-sensitive `mw_locale` cookie and reloads the existing relative path, query, and hash.
- Resolved the document `lang` from the same persisted preference, `Accept-Language`, and default locale path used by HQ request localization.
- Added credential-free HTTP(S)-validated `DOCK_URL` links where configured; malformed or credential-bearing URLs are omitted. The existing default is `http://localhost:3001` in the compose configuration.
- Kept the Hub-owned `hq_token`, role checks, and API/session behavior unchanged. Existing expired-session coverage confirms the Hub rejects an expired opaque cookie.

## Changed implementation paths

- `apps/headquarters/src/app/layout.tsx`
- `apps/headquarters/src/layouts/vertical.tsx`
- `apps/headquarters/src/layouts/auth.tsx`
- `apps/headquarters/src/lib/env.ts`
- `apps/headquarters/src/lib/locale-preference.ts`
- `apps/headquarters/src/ui/client/LocaleSelector.tsx`
- `apps/headquarters/test/locale-preference.test.ts`

## Evidence

At the integrated source state corresponding to `cb719d9`:

- `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- `pnpm exec eslint apps/headquarters/src/layouts/auth.tsx` — passed with no diagnostics.
- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/locale-preference.test.ts` — 5/5 passed. Positive cases cover supported locale selection, preservation of path/query/hash, isolated preference cookie, and accepted Dock URL. Negative cases cover invalid locale, protocol-relative path, malformed/non-HTTP/credential-bearing Dock URL, and checks that selector code does not alter session/role APIs.
- `git diff --check` scoped to the M19-23 paths — passed; Git emitted only its CRLF conversion advisory for `vertical.tsx`.
- GitHub Actions run [40544569260](https://github.com/bjo163/moonwitnessxv/actions/runs/40544569260) — successful at exact head `cb719d9`; monorepo build, lint, SDK check, tests, web build, and safety gates passed, then the verified commit was promoted to `main`.
- After fetching, `dev`, `main`, and local `HEAD` all resolved to `cb719d9253949e3e021aaa1e7903abc5b4bac667`.

## Security, limits and rollback

Locale selection does not grant identity or authorization. It cannot write the `HttpOnly` session cookie, and locale values are narrowed to canonical `id`/`en`. The existing session suite is included in the exact-SHA monorepo test gate; no browser-driven E2E or live external Dock deployment was run. The Dock target remains environment/configuration dependent. Roll back only the M19-23 implementation commits `3020597fd6aa6fbdda3eb1e04c69d4df78002c1d` and `cb719d9253949e3e021aaa1e7903abc5b4bac667` after checking later dependencies; do not revert unrelated workspace files.

**Next eligible task:** M19-24 (HQ id/en visible UI regression and E2E), depending on this completion.
