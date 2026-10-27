# M19-20 — Headquarters login localization worktree evidence

**State:** Reopened by integrator on 2026-10-27 after production-image `/login` returned HTTP 500; the historical closure below is superseded pending exact-SHA CI for the corrective change. The task packet `docs/tasks/M19/M19-20.md` is absent, so acceptance is taken from the canonical TODO row. Historical evidence is retained below.

## Corrective runtime follow-up (worktree based on `7d2e9d8877407f6409ee9663d1222620e1628578`)

- `packages/moonui/src/form.tsx`: `Toggle` now omits `onChange` when haptics are disabled and no caller handler exists, avoiding event-handler serialization from a Server Component.
- `apps/headquarters/src/app/login/page.tsx`: the server-rendered `remember` checkbox sets `haptic={false}` while retaining native `name`, `defaultChecked`, and the existing POST form action.
- `apps/headquarters/test/login-locale.test.ts`: added a regression assertion for the native form and haptic opt-out.
- On the `dev` worktree based on `7d2e9d8`, the focused login test passed 5/5; HQ and MoonUI typechecks, scoped ESLint, and `git diff --check` passed.
- `docker build -f Dockerfile.web --build-arg APP=headquarters -t moonradio-m19-20-7d2e9d-hq:latest .` succeeded. The image ran in the isolated `m28-06-49ec-net` network as `m19-20-7d2e9d-hq-smoke`; `GET /login` returned HTTP 200 and rendered the remember field. Container startup logs showed Next.js ready and no RSC event-handler error.
- Image manifest digest: `4f86568687cb3282b549ff21b13d01a7b2b2d48376bf576913076c2d5429ea1c`. This is a local working-tree build, not an exact committed SHA or deployment. No credentials, valid login submission, or live Hub session was used. Exact-SHA CI and independent review remain pending; keep TODO unchecked until those are complete.
- Rollback: revert only the Toggle handler behavior, HQ `haptic={false}` prop, and focused regression assertion.

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

## Original limitations and next step (historical worktree state)

At the original worktree snapshot, the tests proved copy selection/error sanitization and the expired-session redirect contract, but not a browser-rendered login submission against a running Hub. No exact-SHA integration result existed then, so TODO closure was not justified at that point. The current closure and its remaining limitations are recorded below. No credentials or source material were used.

## Intermediate revalidation at 2a3aaf1 (historical)

- Current `HEAD`/`origin/dev`: `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; GitHub returned no status checks or workflow runs for that SHA.
- Combined HQ session/login/shell fixtures: `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/session-auth.test.ts ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts` — 15/15 passed (covers M19-20 and M19-21 worktree tests).
- `pnpm exec eslint apps/headquarters/src/lib/request-locale.ts apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/lib/login-copy.ts apps/headquarters/src/ui/client/SideNav.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/login-locale.test.ts apps/headquarters/test/shell-locale.test.ts` — passed; `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- Login form-to-live-Hub browser behavior and exact-SHA CI remain unverified.

## Revalidation at source SHA 2d223fc (intermediate)

- `dev` source SHA: `2d223fc998df22d57c714f996541fb8312931db6`. The task files `apps/headquarters/src/lib/login-copy.ts`, `apps/headquarters/src/layouts/auth.tsx`, and `apps/headquarters/test/login-locale.test.ts` match this committed tree. The separate `request-locale.ts` helper fix is not counted as M19-20 work.
- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/session-auth.test.ts` — 9 passed, 0 failed.
- `pnpm --filter @moonwitness/arsy exec tsx --test --test-name-pattern="anonymous request is redirected to the login screen" ../../apps/headquarters/test/hq-authz-guard.test.ts` — 1 passed, 0 failed.
- `pnpm exec eslint apps/headquarters/src/lib/request-locale.ts apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/lib/login-copy.ts apps/headquarters/test/login-locale.test.ts` — passed with no output. `pnpm --filter @moonwitness/headquarters typecheck` — passed.
- Independent read-only review at `2d223fc` found no blocker in the localized tagline or stable error-code mapping. M05-10 is checked in TODO.
- CI run `40462930335` covers predecessor SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b` and was still in progress when checked; no run for `2d223fc` was listed. Exact-SHA CI remains pending, so TODO stays open.
- **Limitations:** no browser submission against a live Hub was verified. The M19-20 packet is missing and should be restored or explicitly accounted for as follow-up documentation.
- **Rollback:** revert only the `leftTagline` catalog/rendering and its focused test in the three M19-20 task files. Keep the independent request-locale helper change intact.

## Closure record

- **Source SHA:** `35b26e8171b555b4b2cddfd931832ad18e417009` on `dev`. All three M19-20 code/test files match the committed tree; the commit since the prior review (`2d223fc`) adds only the independent M24-01 audit.
- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/session-auth.test.ts` — 9 passed, 0 failed, 0 skipped at `35b26e8`.
- `pnpm --filter @moonwitness/arsy exec tsx --test --test-name-pattern="anonymous request is redirected to the login screen" ../../apps/headquarters/test/hq-authz-guard.test.ts` — 1 passed, 0 failed, 0 skipped at `35b26e8`.
- `pnpm exec eslint apps/headquarters/src/layouts/auth.tsx apps/headquarters/src/lib/login-copy.ts apps/headquarters/test/login-locale.test.ts` — passed with no output at `35b26e8`.
- `pnpm --filter @moonwitness/headquarters typecheck` passed at `2d223fc`; the M19-20 source paths are byte-identical at `35b26e8`.
- Independent read-only review at `35b26e8` found no blocker. M05-10 is checked.
- No CI run exists for `35b26e8`. The latest observed run, `40467618850` at predecessor `2559b42`, failed repository-wide lint in unrelated Orbit and UI-harness files; it does not certify this task or the full branch. No live-Hub browser submission was run.
- **Task decision:** localized login copy, safe known-code mapping, and anonymous/expired-session coverage satisfy the stated TODO acceptance. The missing packet and absent browser/CI evidence remain explicit limitations; neither is stated as an M19-20 blocking acceptance condition in the TODO row.
