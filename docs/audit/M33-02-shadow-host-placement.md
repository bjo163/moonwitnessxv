# M33-02 — SHADOW host placement decision audit

**Task:** M33-02 — Decide HQ embedded versus separate SHADOW UI
**Status:** leaf artifact complete; **recommendation only, not self-approved** — owner/integrator review required
**Baseline commit:** `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (`git rev-parse HEAD` at task start)
**Branch:** `dev`
**Worker:** Qoder leaf agent (M33-02)
**Prerequisite:** M33-01 closed at `3a6f0b4` (observed in `TODO.md` and `git log -- docs/data/M33-01-generator-inventory.json`)
**Reviewer:** not assigned
**Result SHA:** left to the integrator (all three files are new and uncommitted)
**Canonical state:** [TODO.md](../../TODO.md) — this audit does not edit or check any TODO row, and creates no ADR.

## 1. Files

| Kind | Path |
|---|---|
| Decision/design recommendation | `docs/design/M33-02-shadow-host-placement.md` |
| Validator | `scripts/check-m33-02-shadow-host-placement.mjs` |
| Audit (this file) | `docs/audit/M33-02-shadow-host-placement.md` |

Claimed and actual changed files are these three. No existing file was edited, staged, reverted or deleted, including every path already dirty from parallel sessions (`.env.example`, `apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/echolog`, `apps/headquarters`, `docs/architecture/ECHOLOG.md`, `docs/audit/screens/*`). No commit was created.

## 2. Scope and method

Read-only inspection of the real tree at the baseline, plus the M33-01 ledger:

- `BLUEPRINT.md` (§2A app table, D00/D07 rows, anti-overlap rule), `MASTER_DESIGN.md`, `TODO.md` (M17-05, M33 block, §anti-overlap statement), `docs/decisions/README.md`.
- `docs/decisions/ADR-0004-empire-surfaces.md`, `ADR-0005-locale.md`, `M03-04-tenant-role-boundaries.md`.
- `docs/design/M37-02-sso-session-redirect-boundary.md`, `docs/design/M19-03-public-ia.md`, `docs/design/APPS.md`.
- `apps/headquarters/src/middleware.ts`, `src/lib/authz.ts`, `src/lib/session.ts`, `src/lib/request-locale.ts`, `src/app/api/session/route.ts`, `src/app/(admin)/layout.tsx`, `src/app/(admin)/models/[model]/[id]/page.tsx`, `apps/headquarters/test/hq-authz-guard.test.ts`.
- `apps/dock/src/middleware.ts`, `apps/dock/src/app/studio/page.tsx`, `apps/dock/src/ui/client/GeneratorStudio.tsx`, `apps/dock/test/*studio/space/locale*` references.
- `packages/core/src/workspace.ts` (`PORTS`), `scripts/apps.registry.mjs`, `docker-compose.yml` service list, workspace `package.json` names/dependencies.
- `docs/audit/M33-01-generator-inventory.md`, `docs/data/M33-01-generator-inventory.json`, `docs/audit/ui-p02-p12-audits-fe8e84c.md`.

The artifact recommends `HOST-HQ`: host the first SHADOW editor as a dedicated, permission-gated area inside the existing Headquarters application, and keep Dock `/studio` as the public DEMO consumer of a shared generator component. It records the separate-app option, the shared constraints, the prerequisites, and the extraction conditions under which the recommendation should be revisited.

The validator enforces the document's required structure and its evidence, not the merits of the recommendation:

1. `**Status:**` declares RECOMMENDATION and cannot claim ACCEPTED/RATIFIED/APPROVED.
2. All nine required sections are present once, in order.
3. Eight shared-constraint phrases survive editing (identity authority, no second login, no new SQL owner, no second Hub, one shared auth/session boundary, `id`/`en`, no `apps/shadow` creation, no status change).
4. Exactly one `HOST-*` option is marked Recommended and the `**Recommendation:**` line names that same option.
5. Every evidence anchor quote resolves verbatim at its cited `file:line`, only within the evidence section.
6. Anchor paths are repo-relative, non-escaping, outside build output, and exist.
7. Anchors cover BLUEPRINT, TODO, `docs/decisions`, `apps/headquarters` and `apps/dock` (at least ten anchors in total).

## 3. Commands actually executed

| Command | Observed output | Exit |
|---|---|---|
| `git rev-parse HEAD` | `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` | 0 |
| `git rev-parse --abbrev-ref HEAD` | `dev` | 0 |
| `git status --porcelain \| head -60` (start) | Pre-existing modifications from parallel sessions across `.env.example`, `apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/echolog`, `apps/headquarters`, `docs/architecture/ECHOLOG.md` and `docs/audit/screens/*`; nothing staged. | 0 |
| `git log --oneline -3 -- docs/data/M33-01-generator-inventory.json …` | `3a6f0b4 docs(m33): inventory the real generator and the HQ Story plans` | 0 |
| `node scripts/check-m33-02-shadow-host-placement.mjs` | `M33-02 placement check: PASS`; `sections=9 options=2 recommended=HOST-HQ anchors=21` | 0 |
| `node scripts/check-m33-02-shadow-host-placement.mjs --self-test` | `M33-02 self-test: PASS`; valid document accepted; 8 tampered fixtures each rejected with the expected code | 0 |
| `git status --short --untracked-files=all \| grep -i "M33-02"` | The three new untracked files listed in §1 | 0 |
| `git diff --cached --stat \| wc -l` | `0` (nothing staged) | 0 |
| `git diff --stat -- docs/design/M33-02-shadow-host-placement.md scripts/check-m33-02-shadow-host-placement.mjs docs/audit/M33-02-shadow-host-placement.md \| wc -l` | `0` (no tracked file in these paths was modified) | 0 |

File inspection used the Read/Grep tools rather than shell `cat`; those reads are the source of the anchor line numbers, and the validator re-resolves every quote at run time.

## 4. Decision summary

**Recommended: `HOST-HQ`.** The first SHADOW editor is a dedicated, permission-gated workspace inside `apps/headquarters`; Dock `/studio` stays the public DEMO consumer of the same generator component. Revisit `apps/shadow` only after (a) a measured, distinct non-governance authoring audience exists, (b) an accepted ADR defines the cross-app session topology under the M37-02 rules, and (c) M17-03 and M33-03..05 are closed.

Grounded reasons, in weight order:

1. M17-05, the open implementation task, is defined as "Build SHADOW editor as HQ workspace on shared auth" (`TODO.md:420`).
2. The blueprint already places SHADOW in Headquarters and describes `apps/shadow` as a proposed extraction of the HQ workspace (`BLUEPRINT.md:83`, `:98`).
3. HQ is the only surface with a server-side identity/session/ACL boundary today (`hq_token` middleware, ARSY `/auth/me`, published-ACL `guard*`); Dock has no auth at all.
4. A separate origin cannot reuse the host-scoped HQ cookie, and the SSO design forbids broadening cookie `Domain` by default and authorizes no code-exchange broker — a separate app would therefore create a second session boundary or an unapproved broker.
5. Review handoff (M33-04) and D08 approval already live in HQ; co-location removes a cross-origin handoff without moving authority.
6. `PORTS` is a closed list of eight services; a ninth app adds workspace, port, Dockerfile, compose, CI, shell, locale and denial-copy cost before any distinct audience is proven.

Explicit limits of the recommendation: it is not ratified, does not create an ADR, does not close M17-05, and does not make any M33 leaf implemented.

## 5. Positive evidence

```
$ node scripts/check-m33-02-shadow-host-placement.mjs
M33-02 placement check: PASS
  sections=9 options=2 recommended=HOST-HQ anchors=21
exit=0
```

This proves the artifact keeps all nine required sections in order, still states the eight shared constraints, marks exactly one option Recommended with a matching recommendation line, and resolves all 21 evidence quotes verbatim at their cited `file:line` across BLUEPRINT, TODO, decisions, HQ and Dock sources.

## 6. Negative evidence

```
$ node scripts/check-m33-02-shadow-host-placement.mjs --self-test
M33-02 self-test: PASS
  valid document accepted
  missing section rejected (SECTION_MISSING)
  anchor quote drift rejected (ANCHOR_QUOTE_MISMATCH)
  accepted status rejected (STATUS_NOT_RECOMMENDATION)
  recommendation drift rejected (RECOMMENDATION_MISMATCH)
  double recommendation rejected (RECOMMENDATION_AMBIGUOUS)
  dropped shared constraint rejected (INVARIANT_MISSING)
  fabricated anchor path rejected (ANCHOR_PATH_MISSING)
  anchor coverage gap rejected (ANCHOR_COVERAGE)
exit=0
```

The self-test mutates in-memory copies of the real document (no fixture files are written): a removed section, a changed anchor quote, a status upgraded to ACCEPTED, a recommendation line pointing at the non-recommended option, a second option marked Recommended, a deleted "No second Hub" constraint, a fabricated anchor path, and a deletion of all HQ anchors (coverage gap). Each is rejected with the expected code, and the untampered document is accepted.

## 7. Rights, privacy and security notes

- Only minimal public locator quotes are reproduced; no copyrighted narrative text, lyrics, artwork, private witness material, credentials or environment values appear in any of the three files.
- No source content is published by this task, and no rights state is asserted as approved. The artifact states that no export, share or publish path may exist without an explicit rights/consent state, and that D08 remains the publication authority.
- The decision explicitly keeps ARSY as the sole identity authority, forbids a second login, a second SQL owner and a second Hub, and requires server-side authorization rather than cookie presence or hidden UI.
- Reading `.env.example` was neither needed nor performed; no secret or environment value was read into the artifacts.

## 8. Rollback

Delete the three new files:

```
docs/design/M33-02-shadow-host-placement.md
scripts/check-m33-02-shadow-host-placement.mjs
docs/audit/M33-02-shadow-host-placement.md
```

No tracked file, `TODO.md` row, ADR, dependency, build output, route, schema or configuration was changed, so deletion fully restores the pre-task tree apart from the concurrent sessions' own edits, which this task did not touch.

## 9. Limitations

- The working tree was already dirty from parallel sessions at task start. Anchors were resolved against the working tree at check time, while `baseline_sha` is commit `5b70e76`. If a parallel edit moves a cited line, the validator must be re-run before integration.
- Source inspection only. No browser, dev server, ARSY instance, database, Docker, build, typecheck or deployment was run; no visual, keyboard, responsive, auth-runtime or deployment behavior is claimed.
- "A separate origin cannot reuse today's session" is an inference from the host-only cookie options and the M37-02 prohibition, not a penetration test or a security certification.
- The validator enforces structure, invariants, option consistency and anchor truth. It does not and cannot prove the recommendation is the right product/architecture choice, and it does not enforce `HOST-HQ` as the answer; that judgement is the owner's/integrator's review.
- M33-02 does not satisfy or close M17-05, M33-03, M33-04 or M33-05; those remain open with their own packets.
- `result_sha` is intentionally unset; the integrator owns the commit and the exact-SHA evidence check.

**Report fields:** `task_id` M33-02 · `baseline_sha` `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` · `worker` Qoder leaf agent · `claimed_files` 3 · `actual_changed_files` 3 · `positive_test_and_output` validator PASS: 9 sections, 2 options, recommended HOST-HQ, 21 anchors, exit 0 · `negative_test_and_output` self-test PASS: 8/8 tampered fixtures rejected, exit 0 · `reviewer` unassigned · `rollback` delete the three new files · `result_sha` integrator-owned · `limitations` dirty concurrent working tree, source inspection only, recommendation not ratified · `next_eligible_task` M33-03 after the owner/integrator accepts this placement recommendation.
