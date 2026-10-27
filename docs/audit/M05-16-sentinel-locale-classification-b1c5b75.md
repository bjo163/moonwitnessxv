# M05-16 audit — Sentinel human-copy classification

- **Task:** M05-16, P1; prerequisite M05-09 is closed.
- **Source baseline:** `6b439b39a5bdcf10adde405b5047f0a53cac69e5`; review/documentation SHA `b1c5b759e33251c619de472f802c984e1962f83b`.
- **Worker/reviewer:** integrator and independent Sentinel-focused agent reviewed the package entrypoint and manifest.
- **Finding:** `apps/sentinel` has no `test/` directory, no package `test` script, and no `--help` or interactive CLI surface. `--once` is a worker execution switch. The only human-readable output candidates are process/cycle `console.info` and `console.warn` messages, including serialized worker-cycle results. There is no supported boundary proving these logs are not consumed by operators or automation.
- **Positive evidence:** Sentinel `typecheck`, build and scoped ESLint on `apps/sentinel/src/index.ts` passed; package inventory confirms there is no existing test or CLI-help surface.
- **Negative evidence:** no locale or log source was changed, so no machine-facing output was localized or altered. This preserves the current worker output contract; however, no automated regression test currently pins that contract.
- **Security/privacy:** no credentials, network calls or provider operations were used for this classification.
- **Rollback:** no source changes were made; remove this audit note if later evidence disproves the classification.
- **Status/limitation:** **open, not closed**. The task row requires focused positive/negative regression evidence, and the current package has no harness to prove a human-only localization boundary or pin worker log compatibility. Do not add a locale UI or translate worker logs until a human-facing surface and log-consumer contract are established.

## Follow-up — executable worker-log contract

- **Review baseline:** `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev` (`HEAD` = `origin/dev` when inspected).
- **Current result SHA:** pending integration; the changes below are still in the shared working tree and the M05-16 checkbox remains open.
- **Changed files:** `apps/sentinel/test/worker-log-contract.test.ts`, `apps/sentinel/test/tsconfig.json`, `apps/sentinel/package.json`, and the root `package.json` test chain.
- **Positive test:** `pnpm --filter @moonwitness/sentinel test` → 7 tests, 7 pass, 0 fail, 0 skipped. A real Sentinel child process talks only to a deterministic Hub stub bound to `127.0.0.1`; the suite pins output shapes/streams, checks `--once`, and proves byte-identical logs for `MW_LOCALE=id` and `en`.
- **Negative test:** the suite checks no locale catalog/helper is imported into the Sentinel worker and no translated output appears under the Indonesian locale. Child test processes remove inherited Hub URLs, Sentinel credentials, MoonQL admin login/password, `EGRESS_ENABLED`, and `MW_LOCALE` before applying explicit fixture values.
- **Type/lint:** `pnpm --filter @moonwitness/sentinel typecheck` → exit 0 (source and `test/tsconfig.json`); `pnpm exec eslint apps/sentinel/test/worker-log-contract.test.ts` → exit 0.
- **Security/privacy limitation:** one existing worker warning still includes the Hub's raw error message. The fixture uses a harmless local dummy message and proves locale stability only; it does **not** prove arbitrary upstream error text cannot contain sensitive data. No such safety claim is made here; sanitizing that log is outside this classification change and needs a separately scoped review.
- **Independent review:** M05-16 review found the harness and package test/typecheck wiring appropriate for the bounded localization classification, with the raw-error limitation explicitly retained. Closure still requires the exact integration SHA and a fresh CI result for that SHA.
- **Rollback:** remove the four test/integration changes above; production Sentinel source and log behavior are unchanged by this follow-up.

## Revalidation in the current shared worktree

- **Observed repository baseline:** `dev` and `origin/dev` both resolve to `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; the artifacts below remain uncommitted in a shared worktree.
- **Commands/results:** `pnpm --filter @moonwitness/sentinel test` — 7/7 pass; `pnpm --filter @moonwitness/sentinel typecheck` — exit 0 for source and test project; `pnpm exec eslint apps/sentinel/test/worker-log-contract.test.ts` — exit 0; scoped `git diff --check` — no whitespace errors.
- **Limit remains:** worker warning still forwards the raw Hub error text; only locale-byte stability and the existing output shape are proven. No integration SHA or CI run was observed, therefore the TODO checkbox stays open.
