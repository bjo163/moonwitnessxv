# M29-03 — Task register validator evidence

**Task:** Specify ID/dependency/Markdown-link validator\
**Baseline:** `1ed20a93b2ab6de8b369f94e993966a92a432b93` (M29-02 closed)\
**Implementation SHA:** `944f08d7f6fdf585448975617e673bda9995e62a`\
**Worker:** Root integrator\
**Reviewer:** Independent read-only M29-03 reviewer; no blocker after encoded-delimiter fix.

## Deliverable

- Specification: `docs/planning/TASK_REGISTER_VALIDATOR.md`.
- Pure read-only validator: `scripts/planning/task-register-validator.mjs`.
- Positive and negative fixtures: `test/planning/task-register-validator.test.mjs`.

The validator checks TODO task row IDs for syntax and uniqueness, dependency tokens (task, milestone, inclusive same-milestone range), self-dependencies and cycles, and supplied local Markdown link paths/fragments. Diagnostics include stable codes and one-based source line. It does not change files or task status, access the network, or determine whether checked work has sufficient exact-SHA evidence.

## Exact-SHA verification

At `944f08d7f6fdf585448975617e673bda9995e62a`:

- `node --test test/planning/task-register-validator.test.mjs` — 2 passed, 0 failed. Positive case includes milestone/range dependencies, relative/root/anchor links, percent-encoded spaces, `#`, and `?` filename delimiters. Negative case includes malformed/duplicate IDs, unknown dependency, dependency cycle, missing path/fragment, root escape, and invalid percent encoding.
- `pnpm exec eslint scripts/planning/task-register-validator.mjs test/planning/task-register-validator.test.mjs` — exit 0.
- `git show --check --oneline HEAD` — no whitespace errors.
- Whole current repository scan over `rg --files` inventory — 360 task rows, zero ID/dependency errors; 24 existing local-link findings (21 absent targets, 3 missing fragments). Examples are legacy `apps/radio/...` paths after the ARSY path migration and stale documentation anchors. These are reported findings, not silently accepted links; this task does not repair unrelated historical references.

## Security, rollback, and limits

The validator has no write, network, Git mutation, or publication behavior. It consumes an explicit repository-relative file inventory; incomplete inventories cannot prove links safe. It is not yet wired into a root/CI command; M29-04 owns invalid-fixture proof and workflow integration. Roll back only the validator spec, module, and test added by commits `142e56f` and `944f08d`; preserve all unrelated worktree changes.

**Status:** OPEN and eligible after M29-02 closure is recorded in TODO at source SHA `ab4409393dba448b5678bdb0f1ecb457a70c1672`. M29-03 itself remains unverified on that predecessor-integrated baseline; rerun its positive/negative validator evidence and obtain review before closure.

**Next eligible task:** M29-04 after M29-03 is revalidated and closed.
