# M01-07 — CI Evidence Ledger & No-Bypass Rule

- **Task:** M01-07, publish the CI evidence ledger and state the no-bypass rule.
- **Audit date:** 2026-10-27.
- **Review baseline:** branch `codex/m05-08-locale-audit-387f784`, local HEAD `6e4d3a37c265e6df0d0b1853d312b04c32d69830`; worktree also contains independent in-progress M03-05 and M22-06 changes. This report does not modify those paths.
- **Prerequisites checked in the current TODO working tree:** M01-04 and M01-06.
- **Earlier revalidation:** on 2026-10-26, seven then-most-recent CI runs failed; run `40256992028` (SHA `3822657`) failed during install, before `pnpm verify`. That historical finding is not the current status. See [M01–M05 revalidation](M01-M05-revalidation-2026-10-26.md).

## 1. No-bypass rule and evidence boundary

The project policy is that a change is not considered verified for promotion to `main` unless the full `Monorepo Verification & Safety Gates` job succeeds on the exact commit. Do not use `--no-verify` to bypass local checks. The workflow's promotion job is conditional on a push to `dev`, depends on the successful `verify` job, checks that `dev` has not moved and that `main` is an ancestor, then fast-forwards `main` to that verified SHA.

This policy and workflow are evidence of the intended automation. They do **not** prove GitHub branch-protection settings, required-review settings, or that repository administrators cannot bypass them: those server-side settings are not stored in the repository and were not inspected for this task. The claim “direct pushes to `main` are restricted” in `CONTRIBUTING.md` is documentation, not independent evidence of an active GitHub rule. No such enforcement is claimed here.

## 2. Workflow behavior observed in the repository

The checked-in [workflow](../../.github/workflows/ci.yml) runs on pushes to `dev` and pull requests targeting `dev`. Its `verify` job performs frozen dependency installation, `pnpm audit --audit-level=high`, a full-history Gitleaks scan (after successful install), then `pnpm verify` (build, lint, SDK drift, tests, and Dock/Headquarters web builds). The `promote` job only runs for a successful `push` event on `dev`; it is skipped for pull requests. A skipped promotion is not a failed verification and is not evidence that a commit reached `main`.

## 3. Current exact-SHA evidence ledger

| Run | Event/context | SHA | Verification | Promotion | Evidence |
|---|---|---|---|---|---|
| [40378453247](https://github.com/bjo163/moonwitnessxv/actions/runs/40378453247) | Pull request #8, feature branch targeting `dev` | `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa` | `Monorepo Verification & Safety Gates`: **success** | `Promote verified dev to main`: **skipped**, as expected for a PR event | Check diagnostics for head `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`; 10 ESLint warnings, one Node 20 runner warning, one runner notice, no errors |
| [40376979518](https://github.com/bjo163/moonwitnessxv/actions/runs/40376979518) | Earlier pull request head | `1971fd6f94543e89c71158c7ae19cbdedc9067a7` | **failure** in the full-history Gitleaks step; `pnpm verify` skipped | Not run | Two historical fixture matches were reported at `packages/moonql-stations/src/index.ts`; values are intentionally not reproduced here |

At `941cb24`, the two active seed `tokenHash` values were blanked, the allowlist was narrowed to exact historical fingerprints, and the full verification job passed. The successful PR check proves verification for that exact SHA only. It does not prove promotion or deployment. The workflow's subsequent preflight/fast-forward path can be proven only by a successful `dev` push run, not by this PR run.

## 4. Verdict and remaining limits

The former statement “MILESTONE M01 RESMI SELESAI & DITUTUP LENGKAP” is withdrawn. This ledger records a successful CI verification and the actual workflow's guarded promotion logic, but no server-side branch protection evidence. `TODO.md` remains the sole status register; M01-07 should only be closed by the integrator if its acceptance is satisfied by this documented policy and workflow evidence. M01 as a whole also remains open while other M01 tasks, including M01-05, are open.

Rollback is limited to restoring the prior contents of this report. No workflow, branch, repository setting, secret, or release state was changed by this report update.
