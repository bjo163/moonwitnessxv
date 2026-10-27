# M05-20 — App Factory worker variant worktree evidence

**State:** implementation/evidence in the shared worktree, not closed. Baseline HEAD observed before this task: `bb751262d9ae215620acc634998fb63ab6e4b887` on `dev`, equal to `origin/dev`. No integrated result SHA exists. M05-18 remains open, so M05-20's declared prerequisite is not yet evidenced at an integrated SHA.

## Scope and changed files

- `scripts/app-create.mjs`: worker output now includes an internal lifecycle runtime with in-process health state (`starting`, `ready`, `stopping`, `stopped`, `failed`), `SIGINT`/`SIGTERM` abort handling, and a stable `WORKER_FAILED` machine error code. The sample task waits for graceful shutdown. Failures do not print exception details.
- `test/app-factory/app-create.test.mjs`: worker contract verifies the manifest, absence of UI/network/database/Hub wiring, generated worker TypeScript typecheck, runtime health transitions, and stable/sanitized failure behavior.
- No generated app is added to the repository; the test materializes it under a temporary directory and removes it after the test.

## Evidence observed

- `pnpm exec eslint scripts/app-create.mjs test/app-factory/app-create.test.mjs` — passed with no output.
- `pnpm exec node --test test/app-factory/app-create.test.mjs` — 18 passed, 0 failed, 0 skipped. The M05-20 case compiles the generated worker source with the repository TypeScript compiler and executes the generated runtime with Node's type stripping to observe health/failure behavior.
- Negative assertions reject a React/JSX surface, network listener, public-port environment config, database driver, or new Hub dependency in the worker plan. The injected exception text `private detail` does not appear in output; machine code is exactly `WORKER_FAILED`.

## Boundaries and limitations

- Health is intentionally in-process; this task adds no HTTP health endpoint, listener, port, database, credentials, or Hub client. An external supervisor must inspect/own process health integration if needed.
- This does not prove M05-21 frozen-install/workspace/container integration, exact-SHA CI, or production supervision. The frontend App Factory implementation and other task changes share the same dirty worktree.
- Rollback: revert only the M05-20 worker template/runtime and its focused test changes after review; temporary generated files are cleaned by the test.
- Next eligible owner after M05-18 and M05-19 evidence is integrated: M05-21 App Factory + CI.
