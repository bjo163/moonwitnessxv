# M01-07 — CI Evidence Ledger & No-Bypass Rule

- **Task:** M01-07, publish the CI evidence ledger and state the no-bypass rule.
- **Audit date:** 2026-10-27.
- **Review baseline:** branch `codex/m05-08-locale-audit-387f784`, local HEAD `dc82e7920d3dc61e9ae4a41b137f05d2516f9dab`; clean working tree before this report edit.
- **Prerequisites checked in the current TODO working tree:** M01-04 and M01-06.
- **Earlier revalidation:** on 2026-10-26, seven then-most-recent CI runs failed; run `40256992028` (SHA `3822657`) failed during install, before `pnpm verify`. That historical finding is not the current status. See [M01–M05 revalidation](M01-M05-revalidation-2026-10-26.md).

## 1. No-bypass rule and evidence boundary

The project policy is that a change is not considered verified for promotion to `main` unless the full `Monorepo Verification & Safety Gates` job succeeds on the exact commit. Do not use `--no-verify` to bypass local checks. The workflow's promotion job is conditional on a push to `dev`, depends on the successful `verify` job, checks that `dev` has not moved and that `main` is an ancestor, then fast-forwards `main` to that verified SHA.

This policy and workflow are evidence of the intended automation. They do **not** prove GitHub branch-protection settings, required-review settings, or that repository administrators cannot bypass them: those server-side settings are not stored in the repository and were not inspected for this task. The claim “direct pushes to `main` are restricted” in `CONTRIBUTING.md` is documentation, not independent evidence of an active GitHub rule. No such enforcement is claimed here.

## 2. Workflow behavior observed in the repository

The checked-in [workflow](../../.github/workflows/ci.yml) runs on pushes to `dev` and pull requests targeting `dev`. Its `verify` job performs frozen dependency installation, `pnpm audit --audit-level=high`, a full-history Gitleaks scan (after successful install), then `pnpm verify` (build, lint, SDK drift, tests, and Dock/Headquarters web builds). The `promote` job only runs for a successful `push` event on `dev`; it is skipped for pull requests. A skipped promotion is not a failed verification and is not evidence that a commit reached `main`.

## 3. Current exact-SHA evidence ledger

| Run | Event/context | Head SHA | Verification | Promotion | Evidence |
|---|---|---|---|---|---|
| [40408605486](https://github.com/bjo163/moonwitnessxv/actions/runs/40408605486) | Latest pull request #8 run, feature branch targeting `dev` | `dc82e7920d3dc61e9ae4a41b137f05d2516f9dab` | **failure** in `pnpm verify` → `ui:check`; PR merge checkout was `b99bc23e63e7297c43c291ac91292b67fd84e9dd` | `Promote verified dev to main`: **skipped**, as expected for a PR event | CI log: UI consistency found `background: '#00e5ff'` at `apps/dock/src/app/global-error.tsx:50`; `pnpm verify` exited 1. No claim that this finding was introduced by M01-07. |
| [40378453247](https://github.com/bjo163/moonwitnessxv/actions/runs/40378453247) | Earlier pull request #8 run | `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa` | `Monorepo Verification & Safety Gates`: **success** | `Promote verified dev to main`: **skipped**, as expected for a PR event | Check diagnostics: 10 ESLint warnings, one Node 20 runner warning, one runner notice, no errors |
| [40376979518](https://github.com/bjo163/moonwitnessxv/actions/runs/40376979518) | Earlier pull request head | `1971fd6f94543e89c71158c7ae19cbdedc9067a7` | **failure** in the full-history Gitleaks step; `pnpm verify` skipped | Not run | Two historical fixture matches were reported at `packages/moonql-stations/src/index.ts`; values are intentionally not reproduced here |

At `941cb24`, the two active seed `tokenHash` values were blanked, the allowlist was narrowed to exact historical fingerprints, and the full verification job passed. The newer exact-head run `40408605486` proves that the current PR head does **not** pass the full verification gate: the failure was in Dock UI consistency, after build and safety scans. This report records the failure for the integrator; it does not assign ownership or change that source. Neither PR run proves promotion or deployment. The workflow's subsequent preflight/fast-forward path can be proven only by a successful `dev` push run, not by a PR run.

## 4. Verdict and remaining limits

The former statement “MILESTONE M01 RESMI SELESAI & DITUTUP LENGKAP” is withdrawn. This ledger records a successful CI verification and the actual workflow's guarded promotion logic, but no server-side branch protection evidence. `TODO.md` remains the sole status register; M01-07 should only be closed by the integrator if its acceptance is satisfied by this documented policy and workflow evidence. M01 as a whole also remains open while other M01 tasks, including M01-05, are open.

Rollback is limited to restoring the prior contents of this report. No workflow, branch, repository setting, secret, or release state was changed by this report update.

## Follow-up — current integration state

- **Latest local branch/HEAD:** `dev` / `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`; `origin/dev` was the same SHA when checked after intervening commits `d66dc8f`, `7c6206a` and `2a3aaf1`.
- **GitHub evidence:** the connected repository returned no status checks and no workflow runs for `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`. Therefore there is still no exact-SHA CI result for the latest integration state.
- **Latest local test-chain attempt:** `pnpm test` exited 1 in the ARSY regression suite after Dock passed 137/137; ARSY reported 340 passed, 1 failed, 9 skipped. The failing case was `M03-05: API key cache TTL and capacity are isolated from parallel test clocks`, whose child assertion saw an API-key cache entry remain present after the simulated 60-second TTL. A direct rerun `pnpm --filter @moonwitness/arsy exec tsx --test test/m03-05-auth-cache-limits.test.ts` passed 3/3. The root chain therefore did not reach HQ/SKYLINK/Sentinel/App Factory/ECHOLOG on this invocation. No claim is made that the failure is fixed; this is a likely flaky/concurrency-sensitive result needing investigation. No occupied task port was present at invocation.
- **Follow-up diagnosis:** a read-only agent reran the M03-05 file eight times and ran the full ARSY test command. All M03-05 checks passed in those reruns, but the full ARSY suite still exited 1 because a newly present, untracked `test/public-projection-denial.test.ts` has two failing cases (UI-P05e projected-release expectation and UI-F20 synthetic corpus-marker denial). The untracked fixture is not part of `2a3aaf1`; its owner is not established here. This current workspace test failure must be resolved before a green full suite can be claimed.
- **Verdict:** M01-07 remains open. Recheck GitHub after an exact integration commit receives the required workflow result; a PR-only result still does not prove promotion to `main`.

## Revalidation — latest local worktree

- **Observed HEAD:** `dev` / `04533ab27b765f198c4449022b04f2a83f17b902`; `origin/dev` remains behind. The worktree is dirty, including TODO and multiple parallel task files, so these local commands are worktree evidence, not a clean exact-SHA CI substitute.
- **Full local test chain:** `pnpm test *> $null; $testExit = $LASTEXITCODE; Write-Output "pnpm test exit=$testExit"; exit $testExit` — observed `pnpm test exit=0`. The chain reached the final ECHOLOG package and emitted no failure; output was intentionally suppressed on this confirming run, so no per-suite counts are claimed from it.
- **ARSY detail:** `pnpm --filter @moonwitness/arsy test` — 364 tests, 354 passed, 0 failed, 10 optional PostgreSQL skips. The current untracked projection-denial fixture ran; known permissive Research/UNILEX projections were reported as GAP tests, not treated as denied behavior.
- **Exact-SHA CI:** GitHub combined status and workflow-run lookups for HEAD `04533ab27b765f198c4449022b04f2a83f17b902` returned empty lists (commit is not yet on remote). No root `pnpm verify`/CI success or promotion is claimed.
- **Updated verdict:** the transient/local suite failures documented above did not reproduce in the current runs, and the local full test chain now exits 0. M01-07 remains open pending exact-SHA `pnpm verify` CI and the server-side evidence required by the no-bypass claim.

## Final revalidation — exact push, promotion, release, and repository rules

- **Verified SHA:** `7c739c6e4ce14590b6f8511d3120016510fd01c9` on `dev`.
- **CI run:** [40450705187](https://github.com/bjo163/moonwitnessxv/actions/runs/40450705187), push event, exact head SHA above. Frozen install, high-severity dependency audit, full-history Gitleaks, and `pnpm verify` all succeeded.
- **Promotion:** the workflow's `Confirm dev has not moved and main can fast-forward` and `Fast-forward main to the verified dev commit` steps succeeded. GitHub readback confirmed `refs/heads/main` points to the exact SHA `7c739c6e4ce14590b6f8511d3120016510fd01c9`.
- **Release:** tag `v1.1.0` and GitHub Release were published for that exact SHA. Readback confirmed release ID `425040640`, published by `github-actions[bot]`; tag ref exists. The preceding exact run on `4979068` promoted main but failed during tag creation because the runner lacked a Git committer identity. That fix is in `6abbfe0`; its run `40450634545` passed verification but correctly refused stale promotion after `dev` moved. The subsequent `7c739c6` run proves the fixed path end to end.
- **No-bypass evidence:** GitHub API readback shows active repository ruleset `main-release-protection` (ID `25876549`) applies to `refs/heads/main`, requires `Monorepo Verification & Safety Gates`, prevents force-push and deletion, has no bypass actors, and reports `current_user_can_bypass: never`. Active `dev-integration-protection` (ID `25892833`) prevents force-push/deletion and also has no bypass actors with `current_user_can_bypass: never`. These are live ruleset observations, not merely repository documentation.
- **Current branch parity at revalidation:** `origin/dev` and `origin/main` both resolve to `7c739c6e4ce14590b6f8511d3120016510fd01c9`; tag `v1.1.0` resolves to annotated tag object `f371f2f69cf99434969e2acc4ba8147ce2576f76` targeting the same commit.
- **Verdict:** M01-07 acceptance is met at the exact verified SHA. This closes the CI evidence/no-bypass ledger task; it does not claim that every milestone is complete or that the published release is a production deployment.
