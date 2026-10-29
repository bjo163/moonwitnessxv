# M19-03 responsive search-flow verification

- **Task:** M19-03 — Map public information architecture and responsive search flows
- **Application source SHA:** `b7a1e9970738fad7e4f6b7e91869724b3b35802e`
- **Observed refs:** `origin/dev` and `origin/main` both pointed to this SHA during verification; CI run `40836695194` passed and promoted it.
- **Worker:** `/root/m19_03_residual`
- **Changed artifacts in this worktree:** `scripts/ui/m19-03-search-flows.spec.mjs`, `docs/tasks/M19/M19-03.md`, `docs/design/M19-03-public-ia.md`, this audit. The Stations `role="search"` implementation and its static contract test are already included in source SHA `b7a1e99`.

## Scope and method

The browser matrix covers Reader, Terms, Stations, and Missions for both `id` and `en` at 390px and 1440px. It runs with the UI harness's Hub URL pinned to an unreachable loopback port, so it exercises the honest offline/error state and does not access live or rights-gated source data. Queries are synthetic `M19-03-SYNTHETIC-*` strings.

Each case asserts that the form is visible and has `role="search"`, uses GET, posts to the same locale-prefixed route, and that the header contains no global search field. It measures document overflow before and after submission, submits the synthetic query, and verifies that the route, query parameter, and rendered input value are preserved. The offline response must expose one or more visible, non-empty `main [role="alert"]` messages.

## Results

- `pnpm install --offline --frozen-lockfile` — passed; lockfile already matched and packages were reused from the local store.
- `pnpm build:libs` — passed; all 33 package workspaces with build scripts completed.
- `UI_PORT=3198 UI_HUB_URL=http://127.0.0.1:65535/api/v1 UI_SCREENS_DIR=<external-temp> pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-03-search-flows.spec.mjs` — **16 passed, 0 failed**.
- `pnpm exec eslint scripts/ui/m19-03-search-flows.spec.mjs` — passed.
- `git diff --check` — passed.

The initial browser run had 8 test-code failures caused by using a strict single-element locator where Reader and Terms correctly render two alerts. The assertion was corrected to require a visible alert and non-empty text for every rendered alert; the final run passed all 16 cases.

## Limits and review

This verifies responsive form semantics, route/locale/query preservation, no document overflow, and explicit offline error messaging. It does not verify live Hub query results, real corpus content, or rights decisions. No private, witness, or licensed source text was used. No runtime source changes were made in this task worktree. Parent task status remains for the integrator to decide after review. The broader M19-06 experience-mode screenshot/behavior baseline is downstream of M19-03, not a prerequisite for M19-03 closure.

- **Reviewer:** integrator review pending
- **Rollback:** remove the browser spec and these documentation changes; no runtime behavior in this task worktree needs rollback.
- **Next task after accepted M19-03:** M19-06 broader screenshot and behavior baseline.
