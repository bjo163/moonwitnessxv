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
