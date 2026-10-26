---
name: repo-orientation
description: Navigate MoonWitness XV manifests, document authorities, application paths, and existing commands before a bounded repository inspection. Use for orientation, not task selection or implementation.
---

# Repository orientation

Read [project guidance](../../../AGENTS.md). Input: the question or area the user wants to inspect; if absent, provide a short navigation map.

1. Record repository root, branch, HEAD, and working-tree status with read-only Git commands.
2. Read the root manifest, workspace definition, README, and relevant document indexes. Inspect only the app/package manifests needed for the question.
3. Route architecture questions to BLUEPRINT and accepted ADRs, UI questions to MASTER_DESIGN, and status questions to TODO. Existing docs/planning indexes are navigation, not additional status authority.
4. Use `node scripts/diagnostics/environment-doctor.mjs --commands` to discover actual root script definitions without running them. Reuse scripts/governance for GitHub/Wiki diagnosis.

Permitted: navigation, manifest reading, locating contracts and existing implementations. Do not classify task leaf/umbrella roles, compute readiness, create a task index, allocate work, edit files, or execute application scripts.

Report the observed root/SHA, the few paths relevant to the user's question, actual command definitions when useful, and stale or conflicting claims. Label missing files and inaccessible resources. An existing source file is not proof that its behavior passed acceptance or was deployed.

Example request: “Where are Dock's public routes and their architecture rules?” Inspect apps/dock's manifest and route tree, cite the owning contracts, and stop at navigation.
