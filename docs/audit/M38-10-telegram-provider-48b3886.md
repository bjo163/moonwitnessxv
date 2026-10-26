# M38-10 audit — Telegram adapter and webhook verification

- **Task:** M38-10, P1 leaf; M38-09 is closed at `2112622aaac679aeffac475781f168cec49a7ad7`.
- **Baseline:** `f5422c0612aab0b2957f33c21320fab554d3bdee`.
- **Result:** `48b388644fe4d1854e16d457843575b5799727f5`.
- **Worker/reviewer:** Telegram provider agent; integrator reran package build, typecheck, and local database tests.
- **Changed files:** `packages/skylink-telegram/*`, `packages/skylink-core/src/verify.ts`, D18 lookup helpers in `packages/skylink-store/src/repositories.ts`, required package dependencies/lockfile, and the SKYLINK credential/raw-message section in `docs/architecture/SECURITY.md`.
- **Positive evidence:** `pnpm --filter @moonwitness/skylink-core build`; `pnpm --filter @moonwitness/skylink-store build`; `pnpm --filter @moonwitness/skylink-telegram build`; `pnpm --filter @moonwitness/skylink-telegram typecheck`; all passed. From `packages/skylink-telegram`, `node --env-file-if-exists=../../.env --import tsx --test test/*.test.ts` passed 2/2 against local Postgres. The fixture stored one normalized message in the real D18 `messages` table; outbound send returns accepted/provider id and lifecycle status is covered.
- **Negative evidence:** missing/wrong secret returns 401 before malformed JSON is parsed; replay returns 409 via the D18 unique external update id. Tests use synthetic token and message only.
- **Security/rights/privacy:** Telegram header is documented correctly as a secret token, not a body signature. The verifier uses constant-time comparison. Bot token is not persisted; only `auth_ref` is. Raw request payload retention is zero because D18 has no `messages.raw` column.
- **Limitations/next:** the package exposes the verified raw-body handler and directly tests it against D18; the SKYLINK HTTP REST/WS surface remains owned by M38-11 and is not published by this leaf. M38-11 is now eligible. No live Telegram account or token was used.
- **Rollback:** revert the Telegram package, verifier, store helpers and security text; no migration was added.
