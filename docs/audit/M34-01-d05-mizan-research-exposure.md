# M34-01 — Acceptance evidence: D05 MIZAN and raw Research exposure inventory

- **task_id**: M34-01 (LEAF of milestone M34)
- **baseline_sha**: `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (branch `dev`)
- **result_sha**: not committed by this task (no `git add`/`commit` per instructions; integrator commits the two files below)
- **worker**: research-leaf agent (Qoder subagent)
- **claimed_files / actual_changed_files**:
  - `docs/audit/M34-01-inventory-d05-mizan-research-exposure.md` — **new** (the reviewed inventory artifact; every claimed path spot-checked by reading the file at baseline)
  - `docs/audit/M34-01-d05-mizan-research-exposure.md` — **new** (this evidence note)
  - **No other file created, modified, or deleted. NO CODE CHANGED.** `git status --porcelain` before and after shows the identical pre-existing dirty set (echolog/eslint/hooks WIP owned by other agents) plus only these two new docs.

## Commands actually executed, with observed results (all at `76ecdc5`)

1. `git rev-parse HEAD` → `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3`; `git branch --show-current` → `dev`.
2. `git diff --name-only HEAD -- packages/moonql-research apps/dock apps/arsy/test` → **empty** — every inventoried source file is unmodified at the baseline, so line references in the artifact match the SHA.
3. Full reads (evidence of "read before claiming"): `packages/moonql-research/src/index.ts` (1268 L), `projection.ts` (476 L), `review-subsystem.ts` (1238 L), `review.ts` (234 L), `seed.ts` (697 L), `historical-pilot.ts` (385 L), `common.ts` (89 L), `packages/moonql/src/{model.ts,acl.ts,rest.ts}`, `apps/dock/src/app/research/page.tsx`, `apps/dock/src/ui/client/ResearchExplorer.tsx`, `apps/dock/src/app/reader/compare/page.tsx`, `apps/dock/src/lib/states-copy.ts`, `apps/arsy/src/addons.ts`, `docs/architecture/SECURITY.md`, `BLUEPRINT.md` D05/D08 rows (197/200), `TODO.md` M14/M19-19/M27/M34 rows, `docs/decisions/M14-01-review-workflow.md`, `docs/audit/M14-mizan-review.md`, `docker-compose.yml`.
4. **Positive test** (artifact existence + path truth, the TODO LEAF acceptance): `ls docs/audit | grep M34-01` → both files present; the artifact's §D verification block re-checks each claimed path with `sed -n` ranges listed above. All 8 `packages/moonql-research/src/*` files and all consumer paths listed in artifact §A exist (`ls packages/moonql-research/src`, `find apps/dock/src -path "*research*"`).
5. **Focused suite run — the executed proof of the negative finding**:
   `pnpm exec tsx --test test/research.test.ts` (cwd `apps/arsy`) →
   `tests 8 / pass 8 / fail 0` in 3.9 s, **including** `M13-07: Positive Correction/OFFSIDE require a declared lens…`, which at `apps/arsy/test/research.test.ts:930–943` issues `GET /orm/research/hypotheses` **with no auth headers** and asserts `statusCode 200`, `total 3`, and every item `status === 'CANDIDATE'`. A green suite here is itself the demonstration that unreviewed candidate hypotheses are served to anonymous callers by design at this SHA.
6. `pnpm exec tsx --test test/m15-historical-pilot.test.ts` → `tests 7 / pass 7 / fail 0`, including `M15-06: Evidence-centered public explanatory comparative case view` — anonymous `GET /orm/research/comparative-case` asserts 200 (test lines 73/97/207, no headers).
7. `grep -rn "ResearchExplorer" apps/dock/src | grep -v ui/client/ResearchExplorer` → empty → explorer is unwired (E8 latent, not active).

## Negative acceptance evidence (packet step 5: "Research includes unreviewed public-read denial")

The inventory is load-bearing: it does **not** whitelist the following live exposures; each is recorded, file/line pinned, and deliberately **not fixed** (remediation belongs to M19-19 / M34-04, whose M27-08 block already cites them):

- **N1 (strongest)** — `packages/moonql-research/src/index.ts:691–696` declares `GET /research/hypotheses` with `requires: 'public'`; `projection.ts:452–474` returns **every** hypothesis including `CANDIDATE` status with full question/evidence text and `proposedBy`. No D08 gate of any kind sits between seed and reader. Executed proof: command 5 above (anonymous 200 asserted by the shipped suite at the exact SHA).
- **N2** — `index.ts:658–667` + `projection.ts:383–386`: `GET /research/case` serves the `RC-QS-037-030-AR` case (`seed.ts:273–286`) whose `rightsSnapshot` is **`RIGHTS_UNKNOWN`** and `evidenceSha` is `null`, anonymously.
- **N3** — raw model REST: the 7 `rest: true` + `acl: ADMIN_WRITE` research models (`index.ts:359–544`) are anonymous list/get readable because `ADMIN_WRITE` omits `list`/`get` (`packages/moonql/src/model.ts:31–36`, default `'public'` note at 128–129; `acl.ts:25–30`; `rest.ts:120–126,162–198`). This is the exact hazard stated in `docs/architecture/SECURITY.md:2`.
- **N4** — `apps/dock/src/app/reader/compare/page.tsx:15–70,95`: public Next.js page serving six hardcoded texts of QS 2:82 (incl. Warsh and Sahih International renderings with **no rights record anywhere in the repo** at this SHA) under a hardcoded `RIGHTS_CLEARED` badge, plus an "Editorial Linguistic Note" commentary published with no review trail — the direct target of M19-19 ("remove direct unrestricted candidate publication").
- **N5** — `historical-pilot.ts:258–271` + view 121–256: public comparative case self-declares `reviewState: 'REVIEWED_DISTINCT_DOMAINS'` with no review/counterevidence/MIZAN/pilot rows behind it.
- **Honest negative-test limitation**: a live in-process HTTP probe script was attempted twice (commands `pnpm exec tsx -e …` and a `$TEMP/m3401probe.ts` run) and **failed to execute** (esbuild top-level-await CJS transform error; first attempt produced no output). No probe output is claimed. The anonymous-exposure facts rest on (a) executed shipped tests 5–6 that assert anonymous 200s and (b) the static ACL derivation in N3 — both observed at the exact baseline.

## security_rights_privacy

Artifact exposes only repo file paths, route names, seed constants already in Git, and non-secret SHAs; no PII, no credentials, no raw witness material. Rights posture recorded per exposure row. Review/MIZAN write-path controls verified as positive controls (four-eyes, named-actor, fail-closed `publicationAvailable: false` — `review-subsystem.ts:211` and siblings, `review.ts:205`).

## reviewer / rollback / limitations

- Reviewer: integrator/human owner (self-approval not claimed; parent M34 not implemented).
- Rollback: delete the two new docs files; no code or status side effects.
- Limitations: inventory reflects code at `76ecdc5` on `dev` (packet step 1 says pin latest `main`; the owner directive for this run fixed the baseline to `dev@76ecdc5`, recorded above). Docker/production reachability of ARSY port 3000 was **not** verified — compose maps `3000:3000` (docker-compose.yml:54–55) but no deployment was probed; configuration is not deployment proof.
- **next_eligible_task**: M34-02 (standalone MoonLab vs HQ desk decision) — consumes artifact §A C12/C14/C15.

## Verdict

**Historical READY-TO-CLOSE assessment applies only to the original `76ecdc5` snapshot.** The current TODO leaf remains open. The revalidation below refreshes the findings against the current repository baseline and records a current worktree containment change; no exact integrated result SHA has been produced by this task, and the integrator must decide closure after review.

## Revalidation at current shared-worktree baseline

- **current baseline SHA**: `bb751262d9ae215620acc634998fb63ab6e4b887` (`dev`, equal to `origin/dev` at inspection).
- `git diff --name-only HEAD -- packages/moonql-research packages/moonql/src packages/moonql-client/src apps/arsy/src apps/arsy/test/research.test.ts apps/arsy/test/m15-historical-pilot.test.ts` → empty. The research addon, MoonQL ACL/REST implementation, ARSY routes and cited anonymous-read tests remain byte-for-byte at this baseline; the original route/exposure analysis is still applicable.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts` → 8 passed, 0 failed. Test M13-07 issues `/orm/research/hypotheses` without auth headers and asserts HTTP 200 with all three items `CANDIDATE`.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/m15-historical-pilot.test.ts` → 7 passed, 0 failed. Test M15-06 issues `/orm/research/comparative-case` without auth headers and asserts HTTP 200.
- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs` → 3 passed, 0 failed. This runs against the current shared worktree: public `/research` and `/reader/compare` now render the localized D08 withholding notice. `apps/dock/src/app/reader/compare/page.tsx`, its locale copy, and its regression test are uncommitted worktree changes. This does not change the `bb751262` baseline's historical E7 exposure, and it is not deployment proof.
- `M14-07` prerequisite is closed in TODO with evidence at implementation SHA `6ed2540` and CI run `40294309739`; its policy keeps `publicationAvailable` false.
- **Current verdict**: research API exposures E1–E6 and raw REST E5 remain in the code baseline; Dock E7 is contained in the current worktree but not in `HEAD`. D08's approved projection remains absent. The M34-01 inventory remains a read-only artifact and does not authorize publishing or changing source rights.
- **result_sha**: not available; no commit/integrated SHA was created. Do not check M34-01 complete until an independent reviewer accepts the refreshed artifact and exact-SHA evidence is attached to an integrated result.

### Revalidation after branch advanced

- Current branch HEAD and `origin/dev` are both `2a3aaf16a19a01264de6f1cab4079a1ea65f6cec`. The research addon, API routes and anonymous-read tests remain unchanged at this base; current worktree still withholds Dock Compare content.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/research.test.ts test/m15-historical-pilot.test.ts` — 15 passed, 0 failed; tests still assert anonymous candidate/comparative reads return success.
- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/research-public-withholding.test.mjs` — 3 passed, 0 failed against the withheld worktree Compare page.
- These checks are current worktree evidence, not exact-SHA closure or a D08 publication approval.
