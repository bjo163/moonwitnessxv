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

**Status:** Evidence verified at source SHA `4fec23973ab3e28ad289035402bf3e89590ddd91`; M29-03 closure is recorded in the current TODO update. M29-02 was checked at this baseline.

## Integrated exact-SHA revalidation

At `4fec23973ab3e28ad289035402bf3e89590ddd91`, from a clean detached checkout:

- `node --test test/planning/task-register-validator.test.mjs` — 2 passed, 0 failed, 0 skipped.
- `pnpm exec eslint scripts/planning/task-register-validator.mjs test/planning/task-register-validator.test.mjs` — exit 0; scoped `git diff --check` — no whitespace errors.
- Full tracked-file inventory scan covered 1,230 tracked paths and found 360 task rows, zero ID/dependency diagnostics, and 25 link diagnostics: 18 missing targets, 4 missing fragments, 1 malformed percent encoding, and 2 unsupported/unsafe schemes. These remain diagnostics; no broken or unsafe link is accepted by the validator.

Reproduction command for that inventory scan (tracked paths from `git ls-files --cached -z`; Markdown contents supplied only for heading checks):

```powershell
node --input-type=module -e 'import { execFileSync } from "node:child_process"; import fs from "node:fs"; import { validateTaskRegister } from "./scripts/planning/task-register-validator.mjs"; const inventory = execFileSync("git", ["ls-files", "--cached", "-z"], { encoding: "buffer" }).toString("utf8").split("\0").filter(Boolean); const markdownFiles = inventory.map((file) => ({ path: file, ...( /\.md$/i.test(file) ? { content: fs.readFileSync(file, "utf8") } : {} ) })); const result = validateTaskRegister({ todoMarkdown: fs.readFileSync("TODO.md", "utf8"), markdownFiles, root: process.cwd() }); const counts = Object.fromEntries([...new Set(result.errors.map((error) => error.code))].map((code) => [code, result.errors.filter((error) => error.code === code).length])); console.log(JSON.stringify({ taskCount: result.taskCount, ok: result.ok, errors: result.errors.length, counts }, null, 2)); if (result.taskCount !== 360) process.exitCode = 1;'
```

The scan returned `ok: false` with `LINK_MISSING: 18`, `LINK_FRAGMENT_MISSING: 4`, `LINK_MALFORMED: 1`, and `LINK_UNSAFE: 2`. This is expected diagnostic output for existing link debt, not a claim that the repository has no link issues. Earlier scan count 24 is superseded by this exact-SHA inventory.

Independent read-only review found no validator implementation blocker and confirmed findings remain errors, not accepted links; reviewer did not run tests. The validator is read-only, does not access the network or mutate TODO, and still is not wired into root/CI workflows; M29-04 owns fixture proof and workflow integration.

**Next eligible task:** M29-04 is now eligible; its invalid-fixture suite must be rerun after this status update is integrated.
