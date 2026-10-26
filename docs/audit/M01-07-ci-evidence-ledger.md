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
