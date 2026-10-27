# M05-20 — App Factory worker variant worktree evidence

**State:** M05-20 closed at source SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b`. The original worktree baseline and evidence below are historical. M05-18 is checked in TODO.

## Scope and changed files

- `scripts/app-create.mjs`: worker output now includes an internal lifecycle runtime with in-process health state (`starting`, `ready`, `stopping`, `stopped`, `failed`), `SIGINT`/`SIGTERM` abort handling, and a stable `WORKER_FAILED` machine error code. The sample task waits for graceful shutdown. Failures do not print exception details.
- `test/app-factory/app-create.test.mjs`: worker contract verifies the manifest, absence of UI/network/database/Hub wiring, generated worker TypeScript typecheck, runtime health transitions, and stable/sanitized failure behavior.
- No generated app is added to the repository; the test materializes it under a temporary directory and removes it after the test.

## Original worktree evidence (historical snapshot)

- `pnpm exec eslint scripts/app-create.mjs test/app-factory/app-create.test.mjs` — passed with no output.
- `pnpm exec node --test test/app-factory/app-create.test.mjs` — 18 passed, 0 failed, 0 skipped. The M05-20 case compiles the generated worker source with the repository TypeScript compiler and executes the generated runtime with Node's type stripping to observe health/failure behavior.
- Negative assertions reject a React/JSX surface, network listener, public-port environment config, database driver, or new Hub dependency in the worker plan. The injected exception text `private detail` does not appear in output; machine code is exactly `WORKER_FAILED`.

## Boundaries and limitations at the original worktree snapshot

- Health is intentionally in-process; this task adds no HTTP health endpoint, listener, port, database, credentials, or Hub client. An external supervisor must inspect/own process health integration if needed.
- At that original point, this did not prove M05-21 frozen-install/workspace/container integration, exact-SHA CI, or production supervision. Exact-SHA CI for M05-20 was later verified at `007b7ac`; M05-21 and production supervision remain separate.
- Rollback: revert only the M05-20 worker template/runtime and its focused test changes after review; temporary generated files are cleaned by the test.
- M05-21 remains gated on M05-19 closing; M05-20 is now closed.

## Revalidation at integrated source SHA

- `dev` source SHA: `2d223fc998df22d57c714f996541fb8312931db6`. The task paths `scripts/app-create.mjs` and `test/app-factory/app-create.test.mjs` match this committed tree; neither has a working-tree diff.
- `pnpm exec node --test test/app-factory/app-create.test.mjs` — 19 passed, 0 failed, 0 skipped. This includes the M05-20 worker positive and negative contract assertions plus generated frontend regressions.
- `pnpm exec eslint scripts/app-create.mjs test/app-factory/app-create.test.mjs` — passed with no output.
- Independent read-only review found no blocker. The review inspected the task code and confirmed the M05-18 and M05-10 prerequisites are checked. It also confirmed the POSIX/Windows path normalization remains within the test scope.
- At report time, CI run `40462930335` covered SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b` and was still in progress; it later completed successfully. The run was rechecked through `gh run view 40462930335 --json headSha,status,conclusion,url` and returned `headSha=007b7ac1d5f88663b80fff2b523dadc8073b218b`, `status=completed`, `conclusion=success`.
- **Rollback:** revert only `scripts/app-create.mjs` and the M05-20 assertions in `test/app-factory/app-create.test.mjs` after checking later dependencies. The existing 19-test suite also covers M05-18/M05-19 behavior, so preserve unrelated assertions.
- **Limitations:** this does not prove M05-21 workspace/container integration or production supervision. Health remains in-process; there is no HTTP listener, public port, database, credentials, or Hub client.
- **Next eligible task:** M05-21 remains gated on M05-19 and M05-20 integration/closure.

## Closure verification

- At source SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b`, the exact focused suite passed 19/19, scoped ESLint passed, the independent read-only review found no blocker, and CI run `40462930335` passed the full verification and guarded promotion.
- M05-20's two source/test paths were clean and unchanged at the later `35b26e8171b555b4b2cddfd931832ad18e417009` branch head. The focused suite was rerun at intermediate source `2d223fc998df22d57c714f996541fb8312931db6` and passed 19/19; ESLint passed. The closure remains tied to exact verified source SHA `007b7ac`.
- M05-18 and M05-10 are checked prerequisites. M05-21 workspace/container integration and production supervision remain separate, unproven work.
