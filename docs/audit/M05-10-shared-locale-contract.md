# M05-10 — Shared locale contract adapter

- **Task:** M05-10, implement shared i18n contract in the proven core adapter.
- **Owner:** platform/i18n.
- **Worker/integrator:** `/root`.
- **Baseline SHA:** `c1f828b69c81e6ab039a9606597f658d3a38a1f9`.
- **Result SHA:** pending integration commit; working-tree result is uncommitted.
- **Branch:** `codex/m05-08-locale-audit-387f784`.
- **Claimed/actual files:** `packages/core/src/locale.ts`, `packages/core/src/index.ts`, `packages/core/package.json`, `packages/core/test/locale.test.mjs`, `packages/core/test/locale-parity.test.mjs`, root `package.json` (test script wiring), this report.

## Package choice and behavior

The existing `@moonwitness/core` is a workspace-shared, browser-safe package with a public root export and no runtime dependencies. Its TypeScript build targets `src`; adding a separate `packages/i18n` would create another package and export surface for this small foundational contract. The Radio `addons` registry is the unrelated single wiring point for MoonQL addons and remains unchanged.

The adapter exports one canonical `id`/`en` registry, the accepted English default, a runtime guard and rejecting validator, a typed catalog shape, catalog key parity validation, and message lookup. Region-tag negotiation, preference resolution/persistence, ICU/Intl formatting, and actual app UI catalogs remain in their separately owned follow-up tasks. No app-specific resolver, data source, network lookup, or Node runtime dependency is introduced.

## Focused evidence

- Positive: `pnpm --filter @moonwitness/core test` — exit 0; 4 tests passed, 0 failed. Both supported locale values are accepted and return their respective catalog messages.
- Negative: the same package command also rejects unsupported values (`fr`, `id-ID`, empty, null, numeric) and catalogs with mismatched keys; 4 passed, 0 failed.
- Type safety: `pnpm --filter @moonwitness/core typecheck` — exit 0.
- Package output: `pnpm --filter @moonwitness/core build` — exit 0.
- Lint: `pnpm exec eslint packages/core/src/locale.ts packages/core/src/index.ts` — exit 0.
- Diff hygiene: `git diff --check` — exit 0, no whitespace diagnostics.

## M05-13 required-key gate

The shared adapter also exports `assertRequiredLocaleKeys` and `verifyRequiredLocaleCatalog`; tests hold a required UI label manifest and show that a missing `id`/`en` string fails, while a long-form key omitted from that manifest does not fail. The core test script is `pnpm --filter @moonwitness/core test` and is included in the root `pnpm test`, which `pnpm verify` already invokes in CI. Observed `pnpm test`: exit 0; Radio 314 total, 305 passed, 0 failed, 9 optional PostgreSQL tests skipped; the preceding core suite had 4 passed, 0 failed. An application-owned populated key manifest will grow with localized UI work; this gate does not pretend current applications already have bilingual catalogs.

## Security, rights, rollback, and limits

Locale input is validated as an exact canonical value before use; invalid values do not select a locale. No user content, source passage, stream, credential, or private data is introduced or transformed. The change is additive and can be rolled back by removing the adapter export, implementation, and focused test; no migrations or stored data are involved.

No independent reviewer has reviewed the integrated diff yet, and there is no result commit SHA. The root TODO checkbox must remain open until review and exact-SHA evidence are available. The test uses Node 24's built-in TypeScript stripping (`--experimental-strip-types`); this honors the repository's declared Node `>=24 <25` runtime without introducing a dependency. M05-13 required-key parity behavior is included in this worktree as well; its CI wiring is covered by root `pnpm test`.
