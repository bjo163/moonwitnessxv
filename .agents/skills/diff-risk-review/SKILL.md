---
name: diff-risk-review
description: Review a supplied MoonWitness XV diff for concrete regression, compatibility, privacy, scope, and evidence risks without modifying files. Use for read-only review of a known change.
---

# Diff risk review

Read [project guidance](../../../AGENTS.md). Inputs: the diff/base revision and intended scope. If no base is supplied, inspect working-tree status and review only the named changes; keep pre-existing user changes distinct.

Inspect full changed files where context matters, including relevant untracked files that ordinary git diff omits. Read nearby contracts and manually check the applicable TODO scope; do not build a task classifier or validator.

Focus on actionable risks introduced by the diff: unrelated changes, duplicate domain ownership, API/schema compatibility, access control/privacy/source rights, id/en parity, accessibility, and claims unsupported by evidence. For changed documentation only, resolve relevant local references manually; do not scan the task register or build the M29 link validator. Never echo suspected secret values.

Do not edit, stage, format, generate files, run application acceptance commands, or mark tasks complete. Missing tests are a review finding when a concrete behavior needs evidence, not a reason to run protected tests automatically.

Report actionable findings first, with severity, exact path/line, failure condition, and consequence. Separate observed defects from uncertainty and questions. If there are no findings, state the review scope and remaining evidence limits; do not claim runtime safety. Use the [report template](../../../scripts/diagnostics/report-template.md) for an exported review, not as a task handoff.
