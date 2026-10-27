# M19-21 — Headquarters shell localization worktree evidence

**State:** implementation evidence in the shared worktree; not closed. Baseline observed before this task: branch `dev`, `HEAD` = `origin/dev` = `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`. The checkout already contained parallel task changes. No result SHA or CI run exists for this worktree.

## Scope

- Added a parity-checked id/en catalog for HQ shell chrome, Mission Control navigation labels, search, breadcrumbs, logout, and status labels.
- Localized the shell-owned navigation while preserving its route keys, hrefs, and icons. Schema-derived model menu labels remain with M19-22.
- Added a `lang={locale}` marker to the authenticated shell and navigation subtree for assistive technology.
- Operational status keys use a discriminated `live` / `demo` source. The static alert count is explicitly called a demo preview in both languages. The Hub badge now says `Hub reachable` when schema discovery succeeds without the ops addon, or `ops loaded` when the live schema reports it registered; it does not claim service health beyond those observations.
- Registered `shell-locale.test.ts` in the existing root test chain while preserving the concurrent Sentinel, App Factory, and ECHOLOG test entries.

Changed paths associated with M19-21:

- `apps/headquarters/src/layouts/vertical.tsx`
- `apps/headquarters/src/ui/client/SideNav.tsx`
- `apps/headquarters/src/lib/shell-copy.ts`
- `apps/headquarters/test/shell-locale.test.ts`
- `package.json` (one additional test fixture path on the existing HQ test invocation; other command additions belong to parallel task work)
- `docs/audit/M19-21-hq-shell-locale-worktree.md`

## Verification

- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/session-auth.test.ts ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts` — **15 passed, 0 failed** (9 login/session and 6 shell tests).
- `pnpm exec eslint apps/headquarters/src/layouts/vertical.tsx apps/headquarters/src/ui/client/SideNav.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/shell-locale.test.ts` — passed with no output.
- `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- `node -e "JSON.parse(require('node:fs').readFileSync('package.json','utf8'))"` — passed.
- `git diff --check -- package.json apps/headquarters/src/layouts/vertical.tsx apps/headquarters/src/ui/client/SideNav.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/shell-locale.test.ts` — passed.

The shell tests prove catalog key parity, localized labels, stable route metadata, locale fallback for unsupported preferences, and separation of demo labels from live labels. No browser-rendered authenticated HQ shell or live Hub session was exercised. No credentials, private source content, auth/session behavior, route permissions, or API identifiers were changed. Schema-derived model labels are intentionally outside this task.

## Rollback and limitations

Rollback the M19-21 shell/catalog/test changes and remove this report; retain concurrent edits from other tasks. The root `package.json` test line contains other parallel changes and must be reviewed as a combined diff before any rollback. TODO remains unchecked pending independent review, exact integrated SHA, and CI evidence.
