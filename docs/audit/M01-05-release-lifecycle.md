# M01-05 — SemVer, Changelog & Protected Release Lifecycle

- **Updated:** 2026-10-27
- **Baseline package version:** `1.0.0` (private root workspace)
- **Implementation SHA:** `f8769f695a47408e2e11d7c293f74c4537dd85e1`.
- **Gates and release-engine SHA:** recorded by the integrator when the change
  described in §6 lands on `dev`.
- **Changelog:** [`CHANGELOG.md`](../../CHANGELOG.md)
- **Repository:** [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv)

This policy governs versioned repository releases. A GitHub release or green CI
does not establish that a web application is deployed or that a product release
has been accepted.

---

## 1. Version and changelog rules

The root `package.json` is the version authority for this private monorepo. Do
not publish it to npm. Use SemVer for repository release tags:

- **MAJOR** for an incompatible public API, persisted-data, or supported
  application behavior change. Include migration and compatibility notes.
- **MINOR** for backward-compatible functionality or a newly supported
  capability.
- **PATCH** for backward-compatible fixes and maintenance changes.
- Use a pre-release suffix (for example, `1.1.0-rc.1`) only for an explicitly
  reviewed candidate; it is not a production acceptance signal.

For every release candidate, add a concise, user-facing entry under `Unreleased` in
[`CHANGELOG.md`](../../CHANGELOG.md), grouped under `Added`, `Changed`,
`Deprecated`, `Removed`, `Fixed`, or `Security` as applicable. Before tagging,
move those entries under the version and release date, create a fresh
`Unreleased` section, and update the root package version in the same `dev`
commit that CI verifies and promotes. Do not describe planned or unverified
work as shipped. Schema contract
changes must also follow the API/schema history policy in
[`M01-04`](M01-04-sdk-drift-gate.md).

[`scripts/release.mjs`](../../scripts/release.mjs) implements this numbering:
the next version is derived from the most recent `vX.Y.Z` tag (the root
`package.json` version is the baseline only while no tag exists) and the commit
type decides the increment. `pnpm release` performs the reviewed local write:
it prepends the release section under `Unreleased` and bumps the root manifest,
and the resulting change is committed on `dev` like any other change. The CI
mode never writes those files, so a workflow cannot publish a tag whose commit
still declares the previous version; the root manifest therefore lags the newest
tag until the next `pnpm release` commit reconciles it. Only the root manifest is
rewritten: the 40 workspace manifests keep their own `1.0.0` because the root is
the single version authority for this private monorepo.

---

## 2. Reviewed release procedure

1. Land changes on `dev` (directly or by pull request) with the changelog entry
   and recovery path. `dev` is the sole integration branch. `.githooks/` gives
   fast local feedback (commit format, staged secrets, `ui:check`, branch
   discipline); it is not the authority and CI does not repeat those narrow
   checks as separate lanes.
2. Require the successful **Monorepo Verification & Safety Gates** check on
   the exact `dev` commit. The `promote` job may fast-forward only that verified
   SHA to `main`; force pushes and deletion are blocked, and no actor bypasses
   the active `main` ruleset.
3. Run `pnpm install --frozen-lockfile` and `pnpm verify` on the proposed
   release commit. Confirm that the changelog and root package version agree.
4. After the verified commit reaches `main`, the same `promote` job runs
   `node scripts/release.mjs --ci`, which creates the annotated `vX.Y.Z` tag at
   that exact SHA, pushes only that tag, and publishes a GitHub Release whose
   notes are generated from the commits since the previous tag. The step writes
   no files. It publishes nothing while no baseline tag exists yet, and it skips
   a commit that already carries a tag.
5. Read back the tag, its target SHA, and the CI run. Regenerate or correct
   release notes by editing the GitHub Release, never by moving the tag. Record
   any application deployment evidence separately; a repository release tag is
   not a production deployment.

## 3. Rollback

For a repository release, publish a corrective patch release from a reviewed
commit; do not rewrite or move a published tag. If the CI release step pushes a
tag and then fails before the GitHub Release appears, delete that unpublished tag
on the remote and re-run the step; a tag that already has a published Release or
that anyone has pulled is corrected forward by a new patch release instead.
For a deployed application,
follow its actual deployment platform's rollback process and verify the target
deployment before claiming recovery. If database state is involved, use the
verified snapshot and procedure in [`docs/runbook-restore.md`](../runbook-restore.md).

Do not use `git checkout <old-sha>` followed by a fresh deployment as a generic
rollback: it may not restore database state or deployment configuration.

## 4. Protection verification

The [`main-release-protection` ruleset (ID 25876549)](https://github.com/bjo163/moonwitnessxv/rules/25876549) is active and requires the `Monorepo Verification & Safety Gates` status check, prohibits force pushes and deletion, and has no bypass actor. A pull-request/approval rule is intentionally absent because the accepted integration flow fast-forwards the exact CI-verified `dev` commit to `main`; requiring a PR there would block that promotion. The authoritative state is the live GitHub ruleset; if it drifts, treat release acceptance as blocked until it is restored and rechecked.

The GitHub workflow runs CI on pushes and pull requests targeting `dev`; its
promotion job fast-forwards `main` only after verification, then tags and
publishes the GitHub Release for that same verified SHA with
`contents: write`. No separate release workflow, npm publishing, container
publishing, or production approval automation is configured by this task, and
the release step cannot deploy anything.

## 5. Acceptance evidence

- Positive: root `package.json` is `1.0.0`; this policy and
  [`CHANGELOG.md`](../../CHANGELOG.md) define versioned releases; live ruleset
  readback shows CI required, force push/deletion prohibited, no bypass actor,
  and `current_user_can_bypass: never`.
- Negative: unverified commits cannot satisfy the active required status-check
  rule. Force push/deletion remain prohibited. This task did not attempt a
  destructive write to test rejection. The private package has no
  publish script, and this lifecycle does not trigger production deployment.
- Baseline: `638480315c6daf4d9535535f6493c68c2e9ec2aa` (historical assessment).
- Initial verification found `main` unprotected and no `CHANGELOG.md`; see
  [M01–M05 revalidation](M01-M05-revalidation-2026-10-26.md) for historical
  findings.
- Local: `pnpm verify` passed: build, UI consistency, lint, SDK drift check,
  314 tests (305 passed, 9 skipped, 0 failed), Headquarters production build,
  and Dock production build. Existing warnings include lint non-null
  assertions, large Cockpit bundle, and the Next.js middleware convention.
- Current live ruleset re-read 2026-10-27: `gh api repos/bjo163/moonwitnessxv/rulesets/25876549`; active rules include `non_fast_forward`, `deletion`, and required status context `Monorepo Verification & Safety Gates`; bypass list empty and bypass `never`.
- Focused policy check: package version/privacy, changelog structure, relative
  links, and absence of a publish script passed; `git diff --check` passed.

## 6. Gate and release-engine evidence (2026-10-27, baseline `6b439b3`)

Local gates, exercised against the real `.githooks/` wiring in a throwaway
sandbox repository (`core.hooksPath` set, LF-pinned shims, `ui:check` stubbed so
the sandbox cannot inherit repository state):

- Positive: a real `git commit` with `chore: seed sandbox` and one with
  `chore: commit env template` (staging `.env.example`) were accepted.
- Negative: `git commit -m "update stuff"` was rejected by `commit-msg` with exit
  `1`; staging `.env.local` was rejected by `pre-commit` with exit `1`.
- `commit-msg` matrix: 10 accepted forms (`feat`, `fix`, `docs`, `perf`, `chore`,
  `revert`, `feat(scope)!:`, merge commit, `Release vX.Y.Z`, `vX.Y.Z`) and 6
  rejected forms (`update stuff`, `fixed bug`, `Feat: capitalize`, `feat:no
  space`, `wip`, empty) — 16/16 as expected.
- `pre-push` matrix: fast-forward on `dev` accepted; older-onto-newer (force) push
  blocked; push to a ref outside `dev`/`main` blocked; push from a `topic/x`
  branch blocked; branch deletion and new-ref creation passed through for GitHub
  to judge.

Release engine (`scripts/release.mjs`), run in the sandbox against a seeded
`v1.0.0` tag:

- Bump arithmetic: `feat` → `1.1.0`, docs-only since the tag → `1.0.1`, `fix` →
  PATCH, `feat!:` → `2.0.0`; the base version comes from the latest tag, not from
  a stale manifest.
- Local mode wrote the release section under `## [Unreleased]`, set the root
  `package.json` version, and created the annotated tag with `--tag` without
  pushing it.
- `--ci` mode created and pushed only `refs/tags/v1.0.2` (verified in a bare
  sandbox remote), left `CHANGELOG.md` and `package.json` untouched, printed the
  version-lag note, exited `0` when no baseline tag exists, exited `0` when HEAD
  already carries a tag, and exited `1` with an explicit message when the GitHub
  Release call failed.
- Dry-run (`pnpm release:dry`) printed the full preview and wrote nothing, so the
  real repository still has zero tags and no release section.

Unverified by this change: the `promote` job release step has not run on a GitHub
hosted runner, and no tag or GitHub Release exists yet. Reporting them as shipped
would require an observed CI run.

`eslint` on `scripts/release.mjs`, `scripts/setup-git-hooks.mjs`, and
`scripts/git-hooks/` passed with `--max-warnings=0`; `pnpm ui:check` passed.
