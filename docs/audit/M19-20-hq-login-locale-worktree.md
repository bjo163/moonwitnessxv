# M19-20 — Headquarters login localization worktree evidence

**State:** worktree-only follow-up; TODO remains open. Before editing, branch was `dev`, `HEAD` and `origin/dev` were both `bb751262d9ae215620acc634998fb63ab6e4b887`. The M19-20 packet linked by TODO is absent (`docs/tasks/M19/M19-20.md` does not exist); acceptance was taken from the TODO row. No integrated result SHA is available.

## Change

The existing login catalog and error mapping already covered English/Indonesian fields, recoverable login errors, and redaction of upstream credential-like messages. Review found one visible English tagline in the login layout. Added it as a parity-checked `leftTagline` catalog entry and rendered it through the selected locale. Changed paths:

- `apps/headquarters/src/lib/login-copy.ts`
- `apps/headquarters/src/layouts/auth.tsx`
- `apps/headquarters/test/login-locale.test.ts`
- `docs/audit/M19-20-hq-login-locale-worktree.md`

## Verification

- `pnpm exec eslint apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/lib/login-copy.ts apps/headquarters/test/login-locale.test.ts` — passed with no output.
- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/session-auth.test.ts` — 9 passed, 0 failed. Covers catalog parity, localized tagline/error text, unknown/raw-error rejection, expired Hub session handling, Hub outage handling, and anonymous redirect behavior.
- `pnpm --filter @moonwitness/arsy exec tsx --test --test-name-pattern="anonymous request is redirected to the login screen" ../../apps/headquarters/test/hq-authz-guard.test.ts` — 1 passed. The anonymous/expired-session path redirects to the localized login route using the stable `expired` code.
- Initial `pnpm --filter @moonwitness/headquarters typecheck` failed on `request-locale.ts(15,46)`: the unsupported-url-locale union member has no `locale`. The helper now narrows with `'locale' in resolution` and returns `DEFAULT_LOCALE` for the unsupported branch. After that scoped fix, `pnpm exec eslint apps/headquarters/src/lib/request-locale.ts` passed and `pnpm --filter @moonwitness/headquarters typecheck` passed. The helper fix is separate from M19-20's login-copy change.

## Limits and next step

The tests prove copy selection/error sanitization and the expired-session redirect contract, but not a browser-rendered login submission against a running Hub. The repository head has no exact-SHA CI status/run available, and this change has no result SHA; TODO closure is not justified. Independent integration review is still needed. No credentials, source material, staging, commit, or TODO status change were made.

## Revalidation after shared branch advanced

- Current `HEAD`/`origin/dev`: `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; GitHub returned no status checks or workflow runs for that SHA.
- Combined HQ session/login/shell fixtures: `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/session-auth.test.ts ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts` — 15/15 passed (covers M19-20 and M19-21 worktree tests).
- `pnpm exec eslint apps/headquarters/src/lib/request-locale.ts apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/lib/login-copy.ts apps/headquarters/src/ui/client/SideNav.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/login-locale.test.ts apps/headquarters/test/shell-locale.test.ts` — passed; `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- Login form-to-live-Hub browser behavior and exact-SHA CI remain unverified.
