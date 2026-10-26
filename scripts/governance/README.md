# Governance command-line tools

These tools inspect repository governance and prepare a narrowly allowlisted Wiki page. They use Node.js built-ins and the already installed GitHub CLI or Git executable; they do not add dependencies or modify `package.json`.

## GitHub Governance Doctor

Run from the repository root:

```text
node scripts/governance/github-doctor.mjs
node scripts/governance/github-doctor.mjs --json
node scripts/governance/github-doctor.mjs --repo owner/name
node scripts/governance/github-doctor.mjs --help
```

The Doctor reads repository metadata, branches, recent commits, rulesets, branch protection, Pages, security settings, labels, milestones, Issues, pull requests, Projects, Wiki pages, releases, tags, and workflow status. It also checks for local governance files. Remote checks require an existing authenticated `gh` session; authentication output and credential values are never printed. A failed or permission-denied request is reported as `NOT_ACCESSIBLE`, not as absence. Project V2 inventory can require the `read:project` scope.

Statuses are `VERIFIED_PRESENT`, `VERIFIED_ABSENT`, `NOT_ACCESSIBLE`, `NOT_INSPECTED`, and `CONFLICTING_EVIDENCE`. The report is observational; it does not change labels, settings, Issues, files, or task status.

## Knowledge-to-Wiki Publisher

Run a read-only dry-run from the repository root:

```text
node scripts/governance/wiki-publish.mjs --dry-run
node scripts/governance/wiki-publish.mjs --dry-run --json
node scripts/governance/wiki-publish.mjs --help
```

The explicit source map currently contains only `CONTRIBUTING.md` → `Contribution-and-Pull-Requests`. The publisher validates required headings and local links, adds a source SHA marker, and rewrites relative file links to canonical links on the repository's live default branch. Before publication, the source must be tracked, clean, and at the exact SHA of the live `origin` default branch. The Wiki must be readable so existing page names and content can be compared.

The default mode never writes. A future additive publication requires a successful dry-run, an accessible Wiki, an unchanged allowlisted source on the live default branch, and an explicit page confirmation:

```text
node scripts/governance/wiki-publish.mjs --apply --confirm-page Contribution-and-Pull-Requests
```

Only absent pages can be created. Identical pages are `NO_CHANGE`; publisher-marked changed pages are `UPDATE_CANDIDATE`; human-owned pages and case-colliding names are `CONFLICT`. Conflicts and source-state failures block all writes. The apply path uses a temporary clone of the Wiki repository, stages only allowlisted page files, commits them, and performs a normal push. It never force-pushes or changes the source repository. The result includes page URLs, source hashes, and the Wiki commit SHA. A confirmed Wiki commit can be recovered through the Wiki repository's normal Git history; uncertain push outcomes are reported as unknown and must be inspected before retrying.

## Scope boundary

Neither tool parses or changes `TODO.md`, task packets, milestone status, application code, release state, or deployment configuration. Do not extend these tools into the TODO registry validator, task-to-Issue synchronizer, agent handoff runner, release automation, or Empire website workflow while those outcomes remain under protected TODO tasks.
