# M21-01 — AI Gateway behavior with inference disabled

**State:** focused worktree evidence and independent review complete; TODO remains open pending integration and exact-SHA CI.

- **Baseline:** branch `dev`, SHA `5ebd7239e8fed698f3bcd21fca9f6813c80ffa98`; `apps/aigateway` had no dirty files at inspection.
- **Changed paths:** `apps/aigateway/package.json`, `src/router.ts`, `src/presentation.ts`, `src/server.ts`, `test/presentation.test.ts`, and new `test/availability.test.ts`.
- **Disable switch:** provider inference is disabled unless `AI_ENABLED` is exactly `true`. This applies to built-in and injected providers. Without opt-in the router exposes and calls only the deterministic heuristic; both `free` and `auto` catalog descriptions list only the active heuristic provider.
- **Positive evidence:** the default service returns HTTP 200 for `/v1/providers`, accurately reports only the heuristic, and serves a completion without configured model inference.
- **Negative evidence:** a fixture provider that throws with prompt/token-like text is never called when AI is disabled. With inference explicitly enabled for the test, provider failure falls back safely and neither telemetry nor response body contains the raw error snippet. An unexpected route exception returns a stable generic API error.
- **Commands/results:** `pnpm --filter @moonwitness/aigateway test` — 6/6 passed; `pnpm --filter @moonwitness/aigateway typecheck` — passed; scoped ESLint over changed TypeScript files — passed; scoped `git diff --check` — passed.
- **Independent review:** read-only review confirmed the process-wide switch also gates injected providers, test fixtures explicitly opt in, model descriptions reflect actual provider order, and no bypass was found in the repository's production construction path.
- **Security/privacy limits:** tests use fixtures only; no cloud key, local Ollama service, private prompt, or real provider request was used. This proves local default-off and response redaction in these paths; it does not establish provider retention behavior when an operator explicitly enables inference.
- **Rollback:** revert the listed gateway/package/test changes and remove this report. No data or credentials were modified.
- **Next task:** M21-02 becomes eligible after M21-01 is integrated and verified.
