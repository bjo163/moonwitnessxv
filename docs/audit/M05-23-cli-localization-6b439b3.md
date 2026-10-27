# M05-23 audit — shared CLI localization

- **Task:** M05-23, P1; prerequisites M05-08 and M05-10 are checked in TODO.
- **Baseline/result SHA:** `6b439b39a5bdcf10adde405b5047f0a53cac69e5`.
- **Worker/reviewer:** integrator reran the focused checks; independent agent review confirmed scope, contracts and evidence.
- **Changed implementation files for this evidence run:** none. Existing source and test at the pinned SHA were exercised; only this audit and canonical TODO status are added by the integrator.
- **Positive evidence:** `pnpm --filter @moonwitness/cli typecheck` passed; `pnpm --filter @moonwitness/cli build` passed; `pnpm --filter @moonwitness/arsy exec tsx --test test/m05-23-cli-locale.test.ts` passed 5/5; `pnpm exec eslint packages/cli/src/locale.ts packages/cli/src/index.ts apps/arsy/test/m05-23-cli-locale.test.ts` passed.
- **Negative/contract evidence:** the tests verify missing and unsupported locale rejection, unsupported environment locale fallback, unknown command errors in Indonesian and English with exit code 1, and stable command/option names, ports, endpoint format and `ONLINE`/`OFFLINE` tokens. SDK generator notices localize explanatory copy while preserving the `--allow-breaking` control and API major values.
- **Security/privacy:** no credentials or provider calls are used. Machine-facing command identifiers, port numbers, URLs, status tokens and exit codes remain stable.
- **Rollback:** revert the shared CLI locale adapter/copy and its M05-23 tests; no database or external state changes are involved.
- **Limitations/status:** no production deployment claim. The existing implementation passed its scoped evidence at this exact commit. Closure is pending independent review.
