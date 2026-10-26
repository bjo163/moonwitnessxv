# M05-23 — Shared developer/operator CLI localization

- **Task:** M05-23, localize shared human-facing CLI output.
- **Owner:** platform/cli; user clarification includes `packages/cli` and assigns this owner.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `dc82e7920d3dc61e9ae4a41b137f05d2516f9dab`.
- **Prerequisites:** M05-08, M05-10 are checked in TODO. ADR-0005 assigns locale selection for the shared CLI to this task.
- **Working-tree baseline:** root had unrelated CI accessibility repair and M01-07 ledger changes; a separate agent also had Headquarters login work in progress. This worker did not edit those paths.
- **Claimed and actual paths:** `packages/cli/src/index.ts`, new `packages/cli/src/locale.ts`, `apps/radio/src/tools/gen-sdk.ts`, new `apps/radio/test/m05-23-cli-locale.test.ts`, this report. No package/root script or generated SDK/snapshot/history file changed.
- **Integrated result SHA/reviewer:** `118dcb576d1cc3b791f6a7a85b208b7f4a5f83cc`; reviewed by root integrator. All commands below were run on the shared working tree with the source content committed at this SHA.

## Behavior

- Human-facing `moon` help, status, port-release, verify-start, invalid-locale, and unknown-command text now use an `id`/`en` catalog checked by `@moonwitness/core`'s shared `defineLocaleCatalog` contract and looked up through `getLocaleMessage`. No new locale resolver or dependency was introduced.
- Locale selection is `--locale id|en` (also accepts `--locale=id|en`), then valid `MW_LOCALE`, then shared default `en`. Invalid `MW_LOCALE` is ignored; an invalid explicit argument fails with exit code 1 and a message in the available environment/default locale.
- Existing command names, existing behavior, ports, paths, URLs, service status tokens (`ONLINE`/`OFFLINE`), and the `BREAKING` schema-detail lines stay unchanged. Status service labels and surrounding human copy are translated. The `--locale` option is additive.
- `gen-sdk.ts` uses the same CLI catalog for actionable check/write output. Its path values, `pnpm gen:sdk` instruction, `API_VERSION`, `--allow-breaking`, `--force`, schema identifiers, and generated source/snapshot/history content remain unchanged. SDK generation was not run in write mode.

## Evidence

- `pnpm --filter @moonwitness/cli build` — exit 0.
- `pnpm --filter @moonwitness/cli typecheck` — exit 0.
- `pnpm --filter @moonwitness/cli exec eslint src/index.ts src/locale.ts` — exit 0.
- `pnpm --filter @moonwitness/radio build` — exit 0; generator source compiled with the CLI package.
- `pnpm --filter @moonwitness/radio exec eslint src/tools/gen-sdk.ts test/m05-23-cli-locale.test.ts` — exit 0.
- `pnpm --filter @moonwitness/radio exec tsx --test test/m05-23-cli-locale.test.ts test/gen-sdk-gate.test.ts` — 12 passed, 0 failed. Coverage includes both locale outputs, env/argument/default/invalid locale selection, preserved command/option/port/status/path contracts, and both accepted/refused breaking-change instructions.
- `$env:MW_LOCALE='id'; pnpm gen:sdk:check` — exit 0; printed `moonql: SDK yang dihasilkan sudah sesuai`.
- `$env:MW_LOCALE='en'; pnpm gen:sdk:check` — exit 0; printed `moonql: generated SDK is up to date`.
- `node packages/cli/bin/moon.js --locale id help` and the corresponding `en` invocation — both exited 0 and showed localized copy with unchanged command names, port list, and option identifier.
- `git diff --check` — exit 0.
- `pnpm --filter @moonwitness/radio typecheck` — exit 2 from existing unrelated diagnostics, including AIGateway imports outside Radio `rootDir` and multiple existing Radio test diagnostics. A focused search of that output found no diagnostics in `src/tools/gen-sdk.ts` or `test/m05-23-cli-locale.test.ts`; production `radio build` passed.

## Safety, rollback, and limits

No API, generated SDK, schema snapshot, history, source content, credential, role, or exit-code contract changed. Rollback reverts the CLI locale catalog/adapter, its focused test, and the `gen-sdk.ts` message adapter. The CLI catalog contains only human-authored operator instructions; schema identifiers and raw structured diff lines remain verbatim. No deployment is claimed.

The generator's successful checks prove the committed SDK is currently up to date, not a write-mode generation.
