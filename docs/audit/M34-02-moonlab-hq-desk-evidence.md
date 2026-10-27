# M34-02 — Acceptance evidence: MOONLAB host decision and raw-research containment

- **task_id**: M34-02 (LEAF of milestone M34) — Decide standalone MoonLab or HQ desk
- **baseline_sha**: `00b006443da8a1b9408226ed776e15090f0e640b` (branch `dev`, the baseline fixed by the task)
- **result_sha**: **uncommitted** — this task performed no `git add` or commit; the integrator commits the two files below
- **worker**: M34-02 leaf agent (Qoder subagent)
- **claimed_files / actual_changed_files**:
  - `docs/decisions/M34-02-moonlab-hq-desk-decision.md` — **new** (the decision artifact)
  - `docs/audit/M34-02-moonlab-hq-desk-evidence.md` — **new** (this evidence note)
  - **No other file created, modified or deleted. No source, schema, migration, package.json or TODO change.**
- **reviewer**: pending owner/integrator ratification; self-approval is not claimed
- **rollback**: delete the two new docs; no runtime, schema, data or status effect
- **next_eligible_task**: M34-03, subject to the reconciliation note below

---

## 1. Commands actually executed and results observed

1. `git branch --show-current` → `dev`; `git rev-parse HEAD` → `00b006443da8a1b9408226ed776e15090f0e640b` at task start.
2. `git status --porcelain` at task start: pre-existing worktree changes only in `docs/audit/screens/**`, `docs/audit/M05-20-*`, `docs/audit/M19-20-*`, `scripts/ui/visual.spec.mjs`, plus untracked `apps/cockpit/test/hub-url-contract.test.ts` and `docs/audit/M28-14-integration-contracts.md`. None of these was written, reverted or staged by this task.
3. `git diff --name-only 00b0064..HEAD -- packages/moonql-research packages/moonql/src packages/moonql-auth/src apps/dock/src apps/headquarters/src apps/arsy/src/addons.ts apps/arsy/src/app.ts apps/arsy/test/research.test.ts apps/arsy/test/m15-historical-pilot.test.ts apps/arsy/test/mizan.test.ts apps/arsy/test/public-projection-denial.test.ts apps/dock/test/research-public-withholding.test.mjs` → **empty**. Concurrent integration commits that advanced `dev` during the task did not touch any cited file.
4. Full reads of the sources cited in the decision, at the baseline: `packages/moonql-research/src/{index,projection,review,review-subsystem,common,seed,historical-pilot}.ts`, `packages/moonql/src/{model,acl,rest}.ts`, `packages/moonql-auth/src/index.ts`, `apps/arsy/src/{addons,app}.ts`, `apps/headquarters/src/lib/{authz,session,session-auth.mjs}`, `apps/headquarters/src/middleware.ts`, `apps/headquarters/src/layouts/vertical.tsx`, `apps/headquarters/src/app/(admin)/{layout.tsx,page.tsx,models/[model]/page.tsx}`, `apps/headquarters/src/data/{schema.ts,server-sdk.mjs,queries/records.ts,queries/registry.ts}`, `apps/headquarters/package.json`, `apps/dock/src/app/{research/page.tsx,reader/compare/page.tsx}`, `apps/dock/src/lib/states-copy.ts`, `apps/dock/src/ui/client/ResearchExplorer.tsx`, `apps/arsy/test/{research,m15-historical-pilot,mizan,public-projection-denial}.test.ts`, `docs/audit/M19-19-research-public-withholding.md`, `docs/audit/M34-01-*`, `docs/audit/M34-02-moonlab-host-placement.md`, ADR-0001..0004, M03-04, M14-01, `BLUEPRINT.md` §2A/§4, `TODO.md` M19-19/M27-08/M34 rows, `docs/design/mockups-xv/README.md`.

## 2. positive_test_and_output

Executed focused suites (no code changed by this task):

```text
pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts test/mizan.test.ts
→ tests 22 | pass 22 | fail 0 | duration 8180.68 ms

pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/hq-authz-guard.test.ts
→ tests 23 | pass 23 | fail 0 | duration 708.81 ms

pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs
→ tests 3 | pass 3 | fail 0 | duration 465.90 ms

pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts
→ tests 15 | pass 14 | fail 0 | cancelled 0 | skipped 1 | duration 17697.29 ms
```

What the positive result establishes:

- The existing review/MIZAN write path still enforces named-actor, four-eyes and fail-closed release semantics (`M14-01..M14-07` are inside the 22 passing tests; `M14-06` covers wrong role, forged evidence and a concurrent approval race).
- HQ authorization is ACL-derived and denies before fetching (`hq-authz-guard.test.ts` 23/23), so the chosen host can be guarded with the existing mechanism and without a local role table.
- Dock `/research` and `/reader/compare` are fail-closed in the current tree (3/3).
- The decision artifact's cited paths and line numbers exist and were read; the measured test counts match the cited test files.

## 3. negative_test_and_output

The required negative for Research is "unreviewed public-read denial". At this baseline it **fails at the API**, and the failure is the finding:

- `apps/arsy/test/research.test.ts:930-933` issues `GET /orm/research/hypotheses` with no auth headers and asserts `200`, `total 3`, all `CANDIDATE`; the suite passes, so anonymous candidate publication is the enforced contract today.
- `apps/arsy/test/m15-historical-pilot.test.ts:73,97,207` issues anonymous `GET /orm/research/comparative-case` and asserts `200`; the suite passes.
- `apps/arsy/test/public-projection-denial.test.ts:1015-1066` passes while asserting that anonymous research routes serve bytes that `corpus_translations` (401 anonymous, `ADMIN_FULL`) withholds. The file's own aggregate requirement is skipped, not satisfied:

```text
﹣ UI-P05e NOT SATISFIED: guessing a public link must be denied for every unapproved projection # SKIP
ℹ pass 14 | fail 0 | skipped 1
```

- The only passing fail-closed negative controls are the Dock withholding tests (3/3) and the absence of D08 release tables (`public-projection-denial.test.ts:195-215`).

Observed conclusion: **containment does not exist at the API owner; it exists only in two Dock pages.** This is recorded as the M34-04 target, not as a passing security test. No denial is claimed where none was observed.

## 4. security_rights_privacy

- No source text, licensed translation bytes, witness material, credential or PII was copied into either new document. The translation is referred to by route/test line only; its wording is not reproduced.
- No rights decision was made. The conflicting self-descriptions of `QS_2_82_id_kemenag` are recorded as NEEDS_ADR (NA-4), not resolved. Withholding is recommended where rights are unproven, consistent with ADR-0003.
- The decision adds no identity, role, session, API, database, SQL owner, publication authority or public projection. D08 release authority is registered as NEEDS_ADR (NA-1).
- M19-19 remains fail-closed; M27-08 remains blocked; no Dock, Orbit, Cockpit or Echolog file was touched.

## 5. What was verified by reading the actual files (file:line)

- Single Hub and addon mount: `apps/arsy/src/addons.ts:15,39`; `apps/arsy/src/app.ts:69`.
- Public research reads: `packages/moonql-research/src/index.ts:649-696` (`overview` 649-656, `case` 658-667, `metrics` 669-678, `trace` 680-689, `hypotheses` 691-696); `historical-pilot.ts:258-271`.
- Projection content and labels: `projection.ts:226-291` (`rightsSnapshot` 258), `412-450`, `452-474`; `reviewState: 'ENGINEERING_ONLY'` and `humanReviewed: false` are labels, not gates.
- Raw REST: 7 models `rest: true` + `acl: ADMIN_WRITE` at `index.ts:361-517`; `ADMIN_WRITE` omits list/get at `packages/moonql/src/model.ts:31-37`; default-public note `model.ts:128-129`; anonymous pass at `acl.ts:13-30`; route guards at `rest.ts:120-126,162-198`.
- Fail-closed review: `review.ts:171,178-214`; `review-subsystem.ts:211,625,631,696,804,832,863,898,938,1148,1198,1216`; `seed.ts:623-625`.
- Four-eyes/named actor: `common.ts:74-88` (admin/user only, guest/anon rejected).
- HQ is a client, not an owner: `apps/headquarters/src/lib/authz.ts:7-17,50-101`; `src/data/server-sdk.mjs:4-10`; `src/data/queries/records.ts:26-42`; `src/lib/session-auth.mjs:4-12`; `src/middleware.ts:3-17`; no SQL driver in `apps/headquarters/package.json`.
- HQ research today is decorative: `src/app/(admin)/page.tsx:101` "MIZAN Review NOMINAL", `:207` "Research Lab" linking `/models/monitor_radars`; `src/lib/shell-copy.ts:122` repeats the same link. No research workflow exists in HQ.
- No MoonLab app: `ls apps/moonlab` → No such file or directory; `ls apps` shows 11 directories, none named moonlab.
- Dock containment at this baseline: `apps/dock/src/app/research/page.tsx:26-34`; `apps/dock/src/app/reader/compare/page.tsx:24-34`; copy `src/lib/states-copy.ts:96,237`.
- Role enum and session roles: `packages/moonql-auth/src/index.ts:43` (`admin/user/guest`), `:210,215` (`roles: [user.role]`).
- Blueprint/ADR constraints: `BLUEPRINT.md:83` (SHADOW/100CENTER are areas in HQ), `:99` (MOONLAB proposed extraction), `:116` (App Factory not implemented), `:203/206` (D05/D08), `ADR-0004:12` (MOONLAB gated), `ADR-0003 §3` (publication gate), `M03-04 §2` (declared editor/reviewer role).

## 6. Conflicts and reconciliation

1. **Concurrent closure of M34-02.** While this task was running, commit `76fc1d24269e31e3c76a9cc317da0d34bf171440` ("docs(todo): close M34-02 with the accepted HQ research-desk placement") checked the M34-02 row at artifact SHA `724fb15` (the prior `docs/audit/M34-02-moonlab-host-placement.md`). `dev` also advanced from `00b0064` to `eef0c54`, then `68db10e`, by concurrent integration work. This task did not make that change and does not revert it; TODO remains owned by the integrator. The decision artifact is a superseding, fuller record (criteria, rejected option, containment, NEEDS_ADR) and does not depend on the checkbox.
2. **M34-01 E7 is historical.** The inventory's E7 verdict matches `76ecdc5`/`bb751262`; at `00b0064` the comparative page is already fail-closed and its regression passes.
3. **M34-01 understates E2/E3/E5.** The shipped denial matrix proves `corpus_translations` bytes are served anonymously through research paths, which the inventory recorded as unreviewed exposure without the byte-level dimension.
4. **Rights self-description conflict.** `packages/moonql-corpus/src/index.ts:279-292` labels the Kemenag translation open/public-domain/cleared; `packages/moonql-research/src/seed.ts:475` calls it licensed. Neither is a D08 record (NA-4).
5. **Role authority vs implementation.** M03-04 declares `editor`/`reviewer`; the runtime enum has no such role. NA-2.
6. **Generic HQ model CRUD bypass.** `research_*` are `rest: true`, so an admin can mutate governed fields through the generic model page without a review event. The decision forbids the desk from using that path and assigns a negative test to M34-05.

## 7. Limitations

- Documentation and review evidence only: no source, schema, ACL, route, package or deployment change; no runtime HTTP probe was written. Anonymous-read facts rest on executed shipped tests and static ACL derivation.
- No deployment or CI was run or claimed. Test runs are local, in-process, at the task baseline; they are not exact-SHA CI or production proof.
- The decision is not owner-ratified and NEEDS_ADR items NA-1..NA-4 remain open; M34-04 cannot claim an approved projection until NA-1 is accepted.
- `dev` moved during the task (concurrent commits). The baseline recorded here is the task baseline `00b0064`; the repo HEAD at last check was `68db10e`. Cited files were verified unchanged between them; the TODO row was changed externally.
- No reviewer signature exists; do not treat this note as self-approval or as M34-02 closure evidence beyond the artifact itself.
