# M05-12 — Explicit Intl formatting helpers

- **Task:** M05-12, format dates/numbers/currency without translating source artifacts.
- **Owner/worker:** platform/i18n; `/root/m05_12_intl_format`.
- **Baseline SHA:** `0b3aedf5c6c290b9f0b312a591739a3177d0ccfa`.
- **Branch:** `codex/m05-08-locale-audit-387f784`.
- **Result SHA:** `d06d581df2cf588804be3801bd6d4cec93dbd5d9`.
- **Claimed/actual paths:** `packages/core/src/locale-format.ts`, `packages/core/src/index.ts`, `packages/core/test/locale-format.test.mjs`, this report.

## Behavior and boundaries

The shared core package exports numeric, currency, and date formatters using the canonical `id`/`en` locale. Currency formatting requires an explicit currency code; date formatting requires an explicit time zone. Locale selection never supplies or infers a currency, time zone, or country. The helpers accept only numeric/date inputs, so source quotes and identifiers are not converted into localized display values. No application, source-content, API, or persistence code was changed.

## Evidence

- `pnpm --filter @moonwitness/core test` — exit 0; package build succeeded; 10 tests passed, 0 failed. Tests cover both locale outputs for number/currency/date, explicit timezone behavior, invalid/non-finite numbers, source-string/identifier rejection, unsupported locale/currency, invalid date, and invalid/missing time zone.
- `pnpm --filter @moonwitness/core typecheck` — exit 0.
- `pnpm exec eslint packages/core/src/locale-format.ts packages/core/src/index.ts` — exit 0.
- `git diff --check` — exit 0.

## Safety, rollback, and limits

These helpers only format explicit display values and do not translate or mutate source passages, names, citations, or IDs. No external data, network lookup, or environment-derived location is used. Rollback removes the formatter export, implementation, focused test and this report; no migrations or persisted data are involved. No application has adopted the helpers yet, so this task proves the shared formatter contract, not a rendered UI. The integrator reviewed the focused diff and exact result SHA is recorded above.
