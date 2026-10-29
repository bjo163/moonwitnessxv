# M19-04 Cockpit reduced-motion slice

Status: partial evidence only; the M19-04 TODO checkbox remains open.

## Task report

- `task_id`: M19-04.
- `baseline_sha`: `697dc1c5c475466fad35722349d10f324ac19eee`.
- `result_sha`: `8f1a239894d64510e5301afd86548456d1332fa3`.
- `worker`: Codex primary agent; one owner for this task slice.
- `actual_changed_files`: `apps/cockpit/client/cockpit-layout.css` and `apps/cockpit/test/m19-04-modal-focus.test.mjs`.
- `behavior`: the active Cockpit stylesheet honors `prefers-reduced-motion: reduce` by limiting animation and transition durations and disabling smooth scrolling.
- `positive_test_and_output`: in a clean detached checkout at exact SHA `8f1a239894d64510e5301afd86548456d1332fa3`, `pnpm --filter @moonwitness/cockpit exec tsx --test test/m19-04-modal-focus.test.mjs` passed 2/2. The reduced-motion browser case injects a probe with inline two-second animation and transition durations, then asserts the reduced-motion overrides and document scroll behavior.
- `other_checks`: in the shared worktree, `pnpm --filter @moonwitness/cockpit typecheck` passed; `pnpm exec eslint apps/cockpit/test/m19-04-modal-focus.test.mjs` passed; `git diff --check -- apps/cockpit/client/cockpit-layout.css apps/cockpit/test/m19-04-modal-focus.test.mjs` passed. The commit pre-hook `pnpm ui:check` passed for 140 files with zero violations. In the clean exact-SHA checkout, `pnpm --filter @moonwitness/cockpit build:client` passed and scoped ESLint reported zero errors plus one existing `max-lines-per-function` warning. The full package suite passed 47/48; its sole failure was the unrelated server assertion `the ledger must read the file the supervisor writes` in `test/cockpit.test.ts`.
- `exact_sha_evidence`: CI run [40805510041](https://github.com/bjo163/moonwitnessxv/actions/runs/40805510041) passed monorepo build, lint, SDK check, tests, and web builds on exact SHA `8f1a239894d64510e5301afd86548456d1332fa3`. The promotion job fast-forwarded `main` to that same SHA and completed release publication successfully.
- `reviewer`: an independent AI read-only review confirmed that `cockpit-layout.css` is imported by the live Cockpit entry point and that the injected probe catches missing reduced-motion overrides. This is a technical code review, not a human accessibility audit.
- `security_rights_privacy`: no data access, identity, private source material, or rights-bearing content was involved.
- `rollback`: revert commit `8f1a239894d64510e5301afd86548456d1332fa3`; it contains only the stylesheet and focused browser-test changes.

## Limitations and next work

This slice does not complete M19-04. The parent still requires integrated evidence and review across the full Dock, Headquarters, and Cockpit task scope. A parallel Dock route audit found no additional concrete live focus failure; browser coverage for every route is not a stated packet requirement. The shared worktree also contains unrelated uncommitted Cockpit media/progress changes; their locale test currently reports 11 unmatched progress keys, so they were deliberately excluded from this commit and from the exact-SHA CI claim.

No TODO checkbox was changed by this slice. Continue M19-04 by finishing integrated review of the checked-in cross-app slices and maintaining a clear boundary from unrelated Cockpit work unless its owner maps that work to an authorized task.
