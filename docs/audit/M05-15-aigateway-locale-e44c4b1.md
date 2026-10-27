# M05-15 audit — AI Gateway human-facing localization

- **Task:** M05-15, P1; prerequisite M05-09 is closed.
- **Baseline:** `6b439b39a5bdcf10adde405b5047f0a53cac69e5`.
- **Result SHA:** `e44c4b17b170f14305e258efe6d0fe9f75bda9e3`.
- **Worker/reviewer:** AI Gateway agent implemented; integrator reran checks; independent agent reviewed the diff with no concrete findings.
- **Changed paths:** `apps/aigateway/src/presentation.ts`, `apps/aigateway/src/server.ts`, `apps/aigateway/test/presentation.test.ts`, `apps/aigateway/package.json`, `pnpm-lock.yaml`. Integrator also committed the runtime/test dependencies requested for the in-progress SKYLINK owner in `apps/skylink/package.json` as the same workspace-manifest integration.
- **Positive evidence:** `pnpm install --frozen-lockfile --ignore-scripts` passed for all 40 workspace projects; `pnpm --filter @moonwitness/aigateway typecheck`; `pnpm --filter @moonwitness/aigateway build`; scoped ESLint on presentation/server source; focused presentation suite 4/4; ARSY workspace dependency contract 1/1. Commit hook `ui:check` passed with 100 files scanned and 0 violations.
- **Negative/contract evidence:** tests prove unsupported language negotiation falls back to English; invalid chat/embedding requests localize only the safe message while retaining HTTP status and OpenAI error fields; health and provider runtime diagnostics remain unchanged; model/provider IDs, status values and unknown provider diagnostic text are preserved.
- **Security/privacy:** locale uses shared `preferredLocale()` from `@moonwitness/core`; responses set `Vary: Accept-Language`. No auth, provider credentials, model identifiers, or logging behavior was changed.
- **Rollback:** revert the AI Gateway presentation/server/test changes and remove its `@moonwitness/core` dependency if unused; no data or deployment changes.
- **Limitations:** no live model provider or production endpoint was used. Review observed the pre-existing runtime error response can include provider error text; that code was unchanged and is outside the localization diff.
