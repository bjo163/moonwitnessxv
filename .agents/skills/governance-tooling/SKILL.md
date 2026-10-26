---
name: governance-tooling
description: Operate the existing MoonWitness XV GitHub Governance Doctor and Wiki dry-run publisher for read-only governance diagnosis. Reuses Phase 2 tools and does not create Issues, labels, or publication systems.
---

# Existing governance diagnostics

Read [project guidance](../../../AGENTS.md) and the [Phase 2 tool guide](../../../scripts/governance/README.md). Input: repository governance question or request to preview the existing allowlisted Wiki page.

- Inventory: `node scripts/governance/github-doctor.mjs` or `--json`.
- Wiki preview: `node scripts/governance/wiki-publish.mjs --dry-run` or add `--json`.

Use existing authentication; do not print credentials, log in, create tokens, or change permissions. Preserve NOT_ACCESSIBLE when an API or Wiki checkout fails. Report source tracking/cleanliness and live default-branch checks independently of Wiki access.

During preparation-only requests, use dry-run only. Do not invoke --apply, push Wiki commits, change labels, open/close Issues, create Projects, alter settings, or trigger workflows. A future publication request requires its own authorization and the existing publisher's source, confirmation, and additive-page guards; this skill grants none.

Report observed statuses and evidence sources, page actions and blockers, commands actually run, and whether any remote write occurred. Do not copy TODO status into Wiki or create another inventory script/report format. Retain the existing source allowlist; release, agent-execution, and Empire pages may overlap protected tasks.
