# M05-13 — Dock required-label catalog gate

- **Task:** M05-13, verify required locale catalog keys.
- **Worker:** `/root/m05_13_catalog_gate`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Prerequisite:** M05-10 is checked at the captured baseline.
- **Actual task files:** `apps/dock/test/required-landing-ui-keys.mjs`, `apps/dock/test/landing-copy-required-keys.test.mjs`, this report.
- **Result SHA:** `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa` (integrated and rerun).

## Gate behavior

The maintained key manifest lists required Dock home interface labels independently of catalog contents, so deleting a key cannot silently shrink the expected set. The test checks the actual app-owned `landingCopy` through the public `@moonwitness/core` API `assertRequiredLocaleKeys`; it does not introduce a second locale catalog or import shared package internals. Optional long-form copy is not listed as required, and identical English text in the two locale entries does not fail the gate.

The existing `apps/dock` test script runs `test/*.test.mjs`; root `pnpm test` already includes the Dock package, and root `pnpm verify` already invokes `pnpm test`. Therefore CI runs this gate without an additional root script or package-manifest change.

## Verification

Commands executed on the shared working tree based on the baseline SHA above:

- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/landing-copy-required-keys.test.mjs` — exit 0; 3 tests passed.
- `pnpm --filter @moonwitness/dock test` — exit 0; 13 tests passed, 0 failed.
- `pnpm exec eslint apps/dock/test/required-landing-ui-keys.mjs apps/dock/test/landing-copy-required-keys.test.mjs` — exit 0.

The positive test checks required labels in both real locales. The negative test removes `stationMapAlt` from Indonesian and confirms failure identifies `id.stationMapAlt`. The optional-copy test uses untranslated English text for a non-required long-form entry and confirms no gate failure. Node emitted existing `MODULE_TYPELESS_PACKAGE_JSON` warnings for TypeScript files loaded by Dock's Node test runner; all tests passed.

## Privacy, rollback, and next work

The manifest contains UI key names only; no user data, source text, or credentials are added. The integrator reviewed the diff and reran `pnpm verify` at the result SHA above. Rollback removes the two test files and this report. No runtime behavior, locale decision, or package dependency changes. M05-14 is still gated on M28-05; after M05-17 is reviewed and closed, M05-18 is the next App Factory leaf.
