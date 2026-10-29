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
- `pnpm --filter @moonwitness/cockpit test` returned 43/44. The failing `locale-usage.test.ts` reports 11 unused progress catalog keys. Those files also have pre-existing local Cockpit edits, so this result is not attributed to the modal change.
- A focused Playwright harness attempt failed to render/import the dialog and was removed. No successful browser interaction result is claimed.
- Remaining Dock data routes also need audit. Review the full shared working tree and verify Cockpit browser behavior before closing M19-04.

## Rollback and limitations

The uncommitted Cockpit slice can be reverted by restoring only `apps/cockpit/client/components/CockpitHelpModal.tsx`, `apps/cockpit/client/components/CockpitConfirmModal.tsx`, and deleting the new `apps/cockpit/client/components/modal-focus.ts`; preserve all other local changes. The task remains partial, and the CI SHA does not include these uncommitted modal changes.
