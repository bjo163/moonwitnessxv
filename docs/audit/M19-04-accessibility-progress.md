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

## Patches Explorer public mandate withholding (committed to dev; CI status unavailable)

- Read-only review found the expanded-record button's `aria-controls` referenced an element that was absent until expansion. The working tree now keeps the controlled region in the DOM with `hidden={!expanded}`; its Patches test asserts the target exists before activation.
- The dirty Patches test also contained an invalid assumption that the server route must use more than 30 strings from its specialized copy catalog. The route uses eight specialized labels and reads shared empty/error wording through `getStatesCopy`; the test now asserts appropriate thresholds and explicit shared-catalog binding.
- At exact source SHA `cee2cdad3588be6c3432e3d92635c46e395b6432`, pushed to `origin/dev`, the Dock route no longer asks for, counts, serializes, or renders raw `journey_mandates` rows. Its server read now uses only the existing `journeyPatchesOverview` public view, and a negative regression assertion pins that boundary. This avoids publishing mandate rows in Dock until M23 defines consent/scope and a reviewed D08 projection exists.
- Local validation of the Dock changes at source commit `cee2cdad3588be6c3432e3d92635c46e395b6432`: `pnpm --filter @moonwitness/dock test` passed 311/311; Dock typecheck, production build, scoped ESLint, and `pnpm ui:check` (140 files, 0 violations) passed. The independent AI code reviewer found no blocker in the Dock withholding diff. The commit is pushed to `origin/dev`. GitHub combined status returned no checks for this SHA, so CI remains unverified.
- The Hub boundary is still open: `journey_mandates` uses `rest: true` plus `ADMIN_WRITE` (which leaves list/get public), and `activeMandates` has no ACL. `apps/arsy/test/journey-patches.test.ts` asserts unauthenticated `GET /orm/activeMandates` returns a created mandate. The Dock mitigation does not close direct Hub access or M27-16; do not describe this as a confirmed exploitation. M23-02/M23-03 and the released-public-projection gate remain open.

## Rollback and limitations

The Cockpit modal slice is committed on `dev`; rollback should be a follow-up limited to those two modal files, `modal-focus.ts`, and the dedicated browser test, preserving concurrent unrelated edits. The Patches Dock withholding slice is committed at `cee2cdad3588be6c3432e3d92635c46e395b6432` and pushed to `origin/dev`; GitHub returned no checks for that SHA. M19-04 stays partial because the broader Patches Explorer refactor and dirty Cockpit locale changes still need integrated-SHA review; the separate Hub ACL/released-projection gap remains tracked under M27-16.
