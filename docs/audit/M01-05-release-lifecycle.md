# M01-05 — SemVer, Changelog & Protected Release Lifecycle

- **Updated:** 2026-10-26
- **Baseline package version:** `1.0.0` (private root workspace)
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

For every release PR, add a concise, user-facing entry under `Unreleased` in
[`CHANGELOG.md`](../../CHANGELOG.md), grouped under `Added`, `Changed`,
`Deprecated`, `Removed`, `Fixed`, or `Security` as applicable. Before tagging,
move those entries under the version and release date, create a fresh
`Unreleased` section, and update the root package version in the same reviewed
PR. Do not describe planned or unverified work as shipped. Schema contract
changes must also follow the API/schema history policy in
[`M01-04`](M01-04-sdk-drift-gate.md).

---

## 2. Reviewed release procedure

1. Open a pull request to `main`; summarize behavior changes, migration impact,
   changelog entry, and recovery path. Do not create a `dev` branch as part of
   this policy.
2. Obtain at least one human approval and a successful required
   **Monorepo Verification & Safety Gates** check. `main` also blocks force
   pushes and deletion; administrators are subject to the same rules.
3. Run `pnpm install --frozen-lockfile` and `pnpm verify` on the proposed
   release commit. Review the exact source SHA and confirm that the changelog
   and package version agree.
4. After merge, create an annotated `vX.Y.Z` tag at the reviewed `main` commit
   and publish a GitHub Release with notes matching the changelog. This is a
   human release action; no workflow publishes packages or deploys production.
5. Record the tag, source SHA, CI run, and any application deployment evidence
   separately. Do not call a repository release a production deployment.

## 3. Rollback

For a repository release, publish a corrective patch release from a reviewed
commit; do not rewrite or move a published tag. For a deployed application,
follow its actual deployment platform's rollback process and verify the target
deployment before claiming recovery. If database state is involved, use the
verified snapshot and procedure in [`docs/runbook-restore.md`](../runbook-restore.md).

Do not use `git checkout <old-sha>` followed by a fresh deployment as a generic
rollback: it may not restore database state or deployment configuration.

## 4. Protection verification

The [`main-release-protection` ruleset (ID 25876549)](https://github.com/bjo163/moonwitnessxv/rules/25876549) requires a pull request, one approving review, and the `Monorepo Verification & Safety Gates` status check. Stale approvals are dismissed after new commits, and no actor can bypass the ruleset. Force pushes and branch deletion are disabled. The authoritative state is the live GitHub ruleset; if it drifts, treat release acceptance as blocked until it is restored and rechecked.

The GitHub workflow exercises CI on pull requests targeting `main`. No
release-specific workflow, `dev` promotion path, npm publishing, or production
approval automation is configured by this task.

## 5. Acceptance evidence

- Positive: root `package.json` is `1.0.0`; this policy and
  [`CHANGELOG.md`](../../CHANGELOG.md) define a versioned reviewed-release
  procedure; live branch protection requires review and CI.
- Negative: a direct push, force push, or branch deletion on `main` is rejected
  by the active ruleset; its effective rules were read back through GitHub's
  branch-rules API. No actor can bypass the rule. The private package has no
  publish script, and this lifecycle does not trigger production deployment.
- Baseline: `638480315c6daf4d9535535f6493c68c2e9ec2aa`.
- Initial verification found `main` unprotected and no `CHANGELOG.md`; see
  [M01–M05 revalidation](M01-M05-revalidation-2026-10-26.md) for historical
  findings.
- Local: `pnpm verify` passed: build, UI consistency, lint, SDK drift check,
  314 tests (305 passed, 9 skipped, 0 failed), Headquarters production build,
  and Dock production build. Existing warnings include lint non-null
  assertions, large Cockpit bundle, and the Next.js middleware convention.
- Focused policy check: package version/privacy, changelog structure, relative
  links, and absence of a publish script passed; `git diff --check` passed.
