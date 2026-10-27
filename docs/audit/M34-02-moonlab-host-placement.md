# M34-02 — MOONLAB host placement decision proposal

**Status:** recommendation prepared for owner/integrator review; not ratified and not closed. This artifact does not change an ADR, TODO status, application, route, or domain owner.

- **Task:** M34-02 — Decide standalone MoonLab or HQ desk
- **Baseline:** `dev` at `bb751262d9ae215620acc634998fb63ab6e4b887`; `HEAD` equaled `origin/dev` when inspected.
- **Worktree:** already contains parallel, unrelated App Factory, Dock, Headquarters, ECHOLOG and other task edits. The inspected research package and ARSY addon sources were unchanged from `HEAD`; existing Headquarters pages/layout have parallel localization edits, so this proposal does not treat their current worktree rendering as M34 evidence.
- **Prerequisite:** M34-01 inventory is present and was refreshed in the shared worktree. It records current raw Research exposure and the absent D08 release projection. Its exact result SHA and independent review are still pending.

## Decision proposed

For the initial private research workbench, present MOONLAB as a **dedicated research desk inside the existing Headquarters application**, not as a standalone `apps/moonlab` workspace. Keep MOONLAB as the product/workflow name if useful, while using Headquarters for its authenticated route and operator shell.

This is a UI placement decision only:

- D05 cases, frames, claims, hypotheses, review metadata and MIZAN runs remain owned by the existing `@moonwitness/moonql-research` addon mounted in the single ARSY/MoonQL service.
- Headquarters owns the privileged research desk, human decisions and D08 release controls, consistent with accepted ADR-0004. The desk must call authorized ARSY contracts through existing server-side/BFF patterns; it must not connect directly to the database.
- Dock remains a separate public reader. It may show research only through a later approved D08 projection (M34-04/M19-19); it must not fetch current candidate or raw Research endpoints.
- Do not create a MoonLab identity system, database/schema owner, Hub, duplicate review engine, publication authority, or independent deployment as part of this placement.

## Options

| Option | Assessment |
|---|---|
| Standalone `apps/moonlab` frontend now | Not justified by current evidence. It would add another app/build/deployment boundary before a distinct researcher role or independent interaction requirement has been demonstrated. A standalone UI would still have to share D00 identity, ARSY data, and HQ review; it would not make Research data safe to publish. |
| Dedicated private desk within Headquarters | **Recommended.** HQ is already the privileged governance surface; a dedicated route can keep D05 authoring separate from D08 human approval while sharing the established session, server-side API access and operational shell. It reduces app/runtime boundaries without moving D05 ownership into HQ. |
| Put MOONLAB on public Dock | Rejected for the initial workbench. Existing public Research routes and raw model REST expose unreviewed candidate data; labels such as `ENGINEERING_ONLY` are not authorization or a release projection. |

Revisit standalone placement only if a reviewed workflow demonstrates a separate researcher audience or a materially distinct interface/runtime need, with a separate extraction decision that preserves D00 identity, ARSY/MoonQL ownership, HQ human approval and D08 publication controls. A future frontend extraction must not imply a separate API, data owner, login, approval engine or deployment by default.

## Evidence observed

### Positive architecture evidence

- `docs/decisions/ADR-0004-empire-surfaces.md` assigns restricted review queues, human decisions, audit, source rights and release controls to Headquarters; it says the other proposed spaces are individually gated and do not receive independent ownership, schemas or deployments by default.
- `docs/decisions/ADR-0002-additive-moonql-domains.md` sets the additive single-Hub pattern. The M34-01 inventory records Research as the existing `packages/moonql-research` addon mounted in ARSY and identifies no `apps/moonlab` directory.
- `docs/decisions/M14-01-review-workflow.md` keeps publication unavailable even when a review is release-eligible; approval is a named-human, four-eyes action. The review workflow already belongs to D05/D08 contracts, not a new frontend-owned service.
- `docs/design/mockups-xv/README.md` records MOONLAB as blocked while the private case workspace placement is undecided. This proposal resolves that placement for review without treating the mockup as implementation evidence.
- `Test-Path apps/moonlab` returned `False`. Inspection of the `HEAD` Headquarters navigation/dashboard shows a generic “Research Lab” entry pointed at `/models/monitor_radars`, with signal/radar metrics; it is not a research review workflow. Thus the recommendation is a future dedicated HQ route, not a claim that the route already exists.

### Negative acceptance and safety evidence

Commands run from the current repository worktree:

- `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts` — **15 passed, 0 failed**. The tests include anonymous reads of candidate hypotheses and comparative research. Their success confirms the current API behavior; it is a blocker against wiring that data to a public workbench, not a security pass.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/mizan.test.ts` — **7 passed, 0 failed**. The suite verifies named role-scoped review, four-eyes behavior, exact-SHA evidence checks, and `publicationAvailable: false`.
- `Test-Path apps/moonlab` — `False`; `rg --files apps | Select-String 'moonlab'` — no MoonLab app files.
- `git diff --name-only HEAD -- packages/moonql-research apps/arsy/src` — empty. The source facts above are at the recorded baseline. Other parallel worktree changes do not establish integrated or deployed behavior.

M34-01 documents the exact risk: raw `rest: true` Research models with `ADMIN_WRITE` do not guard `list/get`; direct public projections include candidate material; Dock must remain fail-closed until D08 defines a released projection. No live deployment or external site was probed.

## Implementation gates implied by this proposal

1. M34-03 may specify draft interactions for the private HQ desk while retaining source locators, exact evidence SHA, uncertainty and counterevidence. It must not create public text or alter source rights.
2. M34-05 must define reviewer/submitter separation and role-negative tests before any desk mutation is enabled. Existing HQ route hiding is not authorization; server-side session/role checks remain mandatory.
3. M34-04 and M19-19 must define and verify any D08 public projection before Dock reads research. The current anonymous routes/raw REST are not valid public contracts.
4. A later decision can revisit a standalone frontend based on verified usage/operational needs. It would remain a frontend only and share the same D00/ARSY/D08 owners.

## Required report

- `task_id`: M34-02
- `baseline_sha`: `bb751262d9ae215620acc634998fb63ab6e4b887`
- `worker`: research placement subagent
- `claimed_files`: `docs/audit/M34-02-moonlab-host-placement.md`
- `actual_changed_files`: this one new decision-proposal artifact only
- `positive_test_and_output`: source/architecture checks above; MIZAN suite 7/7
- `negative_test_and_output`: anonymous Research behavior documented and verified by Research suite 15/15; this is a fail-closed requirement, not approval to expose data
- `security_rights_privacy`: no source content, credentials, or personal data copied; no code/API/access changes made; D08 remains authoritative
- `reviewer`: pending owner/integrator review; self-approval is not claimed
- `rollback`: delete this new artifact; no runtime or status changes to revert
- `result_sha`: unavailable; no commit/integration SHA was created
- `limitations`: exact-SHA review/CI unavailable; recommendation is not owner-ratified; no deployment or real researcher workflow was probed
- `next_eligible_task`: M34-03, after owner/integrator accepts this placement proposal

**Closure:** keep M34-02 unchecked until the owner/integrator accepts the recommendation and exact-SHA evidence is recorded after integration.
