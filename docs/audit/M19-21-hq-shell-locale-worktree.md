# M19-21 — Headquarters shell localization worktree evidence

**Task:** M19-21, Localize HQ shell, navigation and operational statuses.
**Worker:** `/root/m19_21_impl`.
**Baseline:** `dev` at `79135a40490baa2bbb0945a01692c32a5dd4e1ad`; existing worktree contained unrelated concurrent changes, which were preserved.
**Current implementation state:** worktree-only changes after the baseline; no implementation result SHA yet.

## Existing implementation inspected

- Headquarters shell copy already uses the shared typed `id`/`en` catalog and resolver, with persisted `mw_locale` preference before `Accept-Language` and deterministic English fallback.
- Mission Control navigation labels are localized while `mc:*` keys, hrefs and icons stay stable. Schema-generated model labels remain untranslated, within M19-22 ownership.
- `SideNav` wraps the navigation in the negotiated `lang` value.
- The status badge reads the actual Hub schema returned by `serverClient().schema()`; it reports `ops loaded` when the schema lists the `ops` addon, otherwise `Hub reachable`. Demo alerts are separately described as demo in both locales.

## Scoped correction

Reviewing the rendered shell showed the static alert count `3` was identified as demo only in `aria-label`, so sighted users saw an unlabeled count. The visible badge now reads `3 · DEMO`. New pure helper `demoAlertStatusLabel(locale, count)` includes the same count and localized demo explanation in the accessible name. The existing shell test asserts the helper output for both locales and checks that the layout uses it.

Changed files:

- `apps/headquarters/src/lib/shell-copy.ts`
- `apps/headquarters/src/layouts/vertical.tsx`
- `apps/headquarters/test/shell-locale.test.ts`

`apps/headquarters/src/ui/client/SideNav.tsx` was inspected and remains unchanged in this follow-up; it already marks the localized navigation subtree with `lang`.

## Verification

At the current worktree state:

- `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/shell-locale.test.ts` — 7 passed, 0 failed.
- `pnpm --filter @moonwitness/headquarters typecheck` — exit 0.
- `pnpm exec eslint apps/headquarters/src/ui/client/SideNav.tsx apps/headquarters/src/layouts/vertical.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/shell-locale.test.ts` — exit 0.
- `git diff --check -- apps/headquarters/src/layouts/vertical.tsx apps/headquarters/src/lib/shell-copy.ts apps/headquarters/test/shell-locale.test.ts` — no whitespace errors.

The repository's full exact-SHA CI [40500988952](https://github.com/bjo163/moonwitnessxv/actions/runs/40500988952) passed and promoted baseline `79135a4` to `main`; that run predates and does **not** include the three worktree changes above. Independent review of the final helper state is pending, followed by integration and exact-SHA CI.

## Boundaries and rollback

No user credentials, private source material or external service was accessed. No live Hub session was tested. The operational badge reports schema observations, not a full service-health probe. Rollback is limited to the three listed paths: remove `demoAlertStatusLabel`, restore the alert badge's prior contents/label expression, and remove the regression test.

## Integrated exact-SHA closure

- **Source SHA:** `701b629216ad9ef722c7c6571ca20eabff4b831a` on `dev`, promoted to `main`.
- **Exact-SHA CI:** [run 40501629888](https://github.com/bjo163/moonwitnessxv/actions/runs/40501629888) passed full repository verification and guarded promotion. This supersedes baseline-only CI run `40500988952` above.
- **Focused verification at the final source:** `shell-locale.test.ts` passed 7/7; Headquarters typecheck, scoped ESLint, and diff-check passed.
- **Independent review:** final review found no blocker and verified that the visible badge says `3 · DEMO` and the localized accessible name includes the number and explains that it is not live telemetry.
- **Closure and limits:** M19-21 is closed at this SHA. `ops loaded`/`Hub reachable` reflect schema discovery only, not comprehensive service health. No live Hub session or credentials were used.
