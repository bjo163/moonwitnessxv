# M29-04 — Validator invalid-fixture evidence

**Task:** Prove validator on invalid fixtures\
**Baseline SHA:** `435c4b2543982b2063f2b689e6cd7c942bba8f3e` (M29-03 complete)\
**Result SHA:** `d61f8a8077422b26607008bb5eaf348e89f3728a`\
**Worker:** `/root/m29_04_invalid_fixtures`\
**Reviewer:** Independent read-only review; no blocker.

## Changed paths

- `test/planning/task-register-invalid-fixtures.test.mjs`
- `test/planning/fixtures/task-register/valid-todo.md`
- `test/planning/fixtures/task-register/valid-links.md`
- `test/planning/fixtures/task-register/folder/README.md`
- `test/planning/fixtures/task-register/invalid-task-ids.md`
- `test/planning/fixtures/task-register/invalid-dependencies.md`
- `test/planning/fixtures/task-register/invalid-links.md`

## Exact-SHA evidence

At `d61f8a8077422b26607008bb5eaf348e89f3728a`:

- `node --test test/planning/task-register-invalid-fixtures.test.mjs` — 4 passed, 0 failed. Valid fixtures accept task/milestone/range dependencies, local links, and directory README resolution. Negative fixtures assert stable diagnostic codes and line numbers for duplicate/malformed IDs; self, cyclic, unresolved and malformed dependencies; missing paths/fragments, invalid encoding, root escape, and unsafe schemes.
- Fixture bytes are reread and compared before/after validation to prove no mutation.
- `pnpm exec eslint test/planning/task-register-invalid-fixtures.test.mjs` — exit 0.
- `git show --check --oneline HEAD` — no whitespace errors.

## Limits and rollback

No production source, command wiring, TODO status, network, or real witness data was changed. This is fixture proof only; it does not wire the validator into root verification/CI. Roll back only the seven files listed above from commit `d61f8a8`; preserve all unrelated worktree changes.

**Status:** OPEN and eligible after M29-03 closure is recorded in TODO at source SHA `4fec23973ab3e28ad289035402bf3e89590ddd91`. M29-04 itself remains unverified on that predecessor-integrated baseline; rerun its fixture suite and obtain review before closure.

**Next eligible task:** M29-05 after M29-04 is revalidated and closed.
