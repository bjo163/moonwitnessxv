# Task register validator specification (M29-03)

**Status:** Executable specification in `scripts/planning/task-register-validator.mjs`; `TODO.md` remains the only task/status register. This validator is read-only and is not a task dispatcher, lease service, wiki publisher, or status writer.

## Inputs and output

`validateTaskRegister({ todoMarkdown, todoPath, markdownFiles, root })` receives the TODO text and an explicit file inventory. Each inventory entry has a repository-relative `path`; Markdown entries also provide `content` for heading checks. It returns `{ ok, taskCount, errors }`. Each diagnostic contains stable `code`, repository-relative `file`, one-based `line`, and a human-readable `message`. It performs no filesystem writes, network access, Git mutation, or TODO status changes.

## Task and dependency rules

- A task table row is recognized from the existing TODO Markdown table shape. IDs must match `Mdd-dd`, be unique, and are collected before dependency validation so forward references can resolve.
- Dependency cells accept comma-separated task IDs (`M29-02`), milestone IDs (`M29`, meaning all tasks in that milestone), and same-milestone inclusive ranges (`M41-04..10`). Every referenced task/milestone must exist; malformed and reversed ranges fail. Self-dependencies and cycles fail.
- A checked checkbox is parsed as data only. This validator does not decide whether the task's evidence is sufficient or whether a predecessor is complete at an exact SHA.

## Markdown local-link rules

- Scan inline Markdown links and images from the supplied file inventory. Resolve percent-encoded relative paths from the source directory and root-relative paths from repository root; query strings are ignored for filesystem resolution.
- External `http(s)`, `mailto`, and `data` targets are left to their owners. Unsupported schemes and any local path escaping the root fail closed.
- A local target must appear in the supplied inventory. A heading fragment is checked when the target has Markdown content, using case-insensitive heading slugs with duplicate-heading suffixes. Anchor-only links resolve against their source document. Directory targets may resolve to `README.md` or `index.md` when supplied.
- The caller supplies a complete repository file inventory; this keeps the core deterministic and testable. It must not treat an omitted file as evidence that a link is safe.

## Diagnostics and planned expansion

Initial diagnostics: `TASK_ROWS_MISSING`, `TASK_ID_INVALID`, `TASK_ID_DUPLICATE`, `DEPENDENCY_INVALID`, `DEPENDENCY_SELF`, `DEPENDENCY_CYCLE`, `LINK_UNSAFE`, `LINK_MALFORMED`, `LINK_MISSING`, and `LINK_FRAGMENT_MISSING`. Consumers should key on `code`, not message wording. M29-04 owns the broader invalid-fixture proof and integration into repository command workflows; this specification does not authorize status edits or CI wiring by itself.

## Positive and negative acceptance

Positive fixtures cover unique IDs, task/milestone/range references, valid relative paths/fragments, and safe external links. Negative fixtures cover malformed/duplicate IDs, missing dependencies, cycles, invalid percent encoding, missing paths/fragments, and root escape. All failures return diagnostics without modifying inputs or files.
