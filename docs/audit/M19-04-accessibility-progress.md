# M19-04 accessibility progress

Status: partial. The canonical TODO checkbox remains open.

## Verified Dock and Headquarters slices

- Dock and Headquarters changes are included in `a44fa85`, `48ce6dd`, and `0ba5b2a9323e70799127cfda4392f68460658e09`.
- GitHub CI run `40791614307` completed successfully for exact HEAD `0ba5b2a9323e70799127cfda4392f68460658e09` (`CI Verify & Gate`). This run includes full repository build, lint, SDK check, tests, and web build.
- The Dock-focused checks and HQ-focused checks are recorded in the task execution notes and CI. The HQ browser-independent regression test passed 2/2; typecheck, build, scoped ESLint, and `pnpm ui:check` passed. Dock focused tests, typecheck, build, scoped ESLint, and `pnpm ui:check` passed at its implementation point; full clean CI at `48ce6dd315a9e082c8e1cd6ee5ebad00434c6940` passed after the Dock test expectation was updated.
- AI technical review was performed. It is not an independent human accessibility, rights, or privacy approval.

## Cockpit remaining work

- Cockpit modal edits add a shared focus helper for initial focus, Tab wrapping, and restoring focus after close.
- `pnpm --filter @moonwitness/cockpit exec tsx --test test/m19-04-modal-focus.test.mjs` passed 1/1 in Chromium. `pnpm --filter @moonwitness/cockpit typecheck` and scoped ESLint on the two modals/helper passed; `git diff --check` passed.
- The Cockpit test script now includes its existing browser `.mjs` tests; a full local run returned 46/47, including passing modal and locale browser tests. The failing `locale-usage.test.ts` reports 11 unused progress catalog keys in pre-existing dirty Cockpit App/sync/copy changes. Clean CI run `40793276698` passed at exact SHA `25a2dfbd2c2532718088d9d45495f600ebe757b1`, including both browser tests.
- Remaining Dock data routes and the full shared working tree still need audit before closing M19-04.

## Dock residual announcement slice (integrated CI verified)

- Added `role="alert"` to route/global error surfaces, Research/Compare unavailable notices and deprecated term notices. DENPA transmit failures and Player stream/beacon failures now use assertive alerts; positive/ordinary states stay polite.
- The Dock a11y focused static suite passed 5/5; Dock typecheck, scoped ESLint, and `git diff --check` passed. A separate AI reviewer found no blocker and noted the test is static, not a screen-reader browser test.
- These changes are committed at `752bbc1945e44800f61175cb6657229c066c69e1`; descendant exact-SHA CI run `40793276698` passed at `25a2dfbd2c2532718088d9d45495f600ebe757b1`.

## Rollback and limitations

The Cockpit modal slice is committed on `dev`; rollback should be a follow-up limited to those two modal files, `modal-focus.ts`, and the dedicated browser test, preserving concurrent unrelated edits. The task remains partial because other Dock surfaces, including the dirty Patches Explorer, still need owner-aware audit and review.
