# M27-18 — Preview acceptance vs full-stack M27 gate (contract + validator audit)

**task_id:** M27-18
**baseline_sha:** `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (branch `dev`, `docs(todo): close M17-04 and M21-07 at their evidence SHAs`, 2026-10-28)
**worker:** single task owner (low-context execution agent), no sub-delegation
**reviewer:** root integrator (pending)
**result_sha:** worktree-only; left to the integrator to commit and record
**date:** 2026-10-28

---

## 1. Task packet and dependency check

- `docs/tasks/M27/M27-18.md` **does not exist**. `docs/tasks/M27/` contains only M27-09, M27-10, M27-12, M27-14, M27-15, M27-16 and M27-19. M27-18 is tracked only by its TODO row, as `docs/milestones/M27.md` also shows (`[TODO]` link, role LEAF).
- The M27-18 dependency cell in `TODO.md` reads **`M27-12,M27-16`**. At the baseline SHA both rows are unchecked (`| - [ ] | **M27-12** ...` and `| - [ ] | **M27-16** ...`). The task brief's statement that no open prerequisite blocks M27-18 is therefore **not supported by the register**: both named predecessors are open.
- Consequence recorded, not worked around: this task delivers the **gate contract and its validator**, which can be authored before M27-12/M27-16 evidence exists. It does **not** enter Gate P or Gate F, does **not** produce or substitute for M27-12/M27-16 evidence, and claims no acceptance state. The contract and validator both state that the preview gate is not entered while those evidence classes are missing.
- Authoring observation is SHA-pinned inside the contract (`§1` and `§5`) so a later reader is not misled by the snapshot.

## 2. Claimed and actual changed files

**Claimed (three new files, no existing file edited):**

1. `docs/planning/M27-18-preview-vs-fullstack.md` — release-acceptance contract.
2. `scripts/check-m27-18-preview-vs-fullstack.mjs` — dependency-free Node validator with `--self-test`.
3. `docs/audit/M27-18-preview-vs-fullstack.md` — this audit.

**Actual changed files (`git status --porcelain -- <paths>` observed):**

```
?? docs/planning/M27-18-preview-vs-fullstack.md
?? scripts/check-m27-18-preview-vs-fullstack.mjs
?? docs/audit/M27-18-preview-vs-fullstack.md
```

No tracked file was modified, staged, committed or deleted. `TODO.md` was read only. Pre-existing dirty paths from parallel sessions (`.env.example`, `apps/**`, `docs/audit/screens/**`, `docs/architecture/ECHOLOG.md`, and others) were not opened for edit and are not part of this claim.

## 3. What the contract defines

Two gates, deliberately non-transitive:

- **Gate P — PREVIEW acceptance**: scoped bilingual Dock preview. Requires only `EV-SHA`, `EV-MANIFEST`, `EV-BUILD`, `EV-BROWSER`, `EV-RIGHTS`, `EV-HUMAN`. May claim `CI_VERIFIED` (scoped), `BUILD_VERIFIED` (preview artifact) and `PREVIEW_ACCEPTED`. Must not claim `DEPLOYED_VERIFIED` for production, `RELEASE_ACCEPTED`, production deployment, full XV/M27-01–07 completion, restore/off-host backup verification, or unshipped Empire modules.
- **Gate F — FULL-STACK M27 acceptance**: all 13 classes — `EV-SHA`, `EV-MANIFEST`, `EV-BUILD`, `EV-LINT-TYPECHECK`, `EV-TESTS`, `EV-SDK`, `EV-PG`, `EV-DOCKER`, `EV-BROWSER`, `EV-RESTORE`, `EV-RIGHTS`, `EV-ROLLBACK`, `EV-HUMAN`. `DEPLOYED_VERIFIED` requires M27-14 observed HTTPS/Coolify logs; `RELEASE_ACCEPTED` requires the M27-07 human go/no-go.
- Both gates require an exact 40-character SHA, observed evidence, a closure record and a rollback action. The contract states that preview acceptance does not imply production deployment, that preview evidence cannot be promoted to Gate F, and that no closed M27 leaf may cite inference or remembered results.

The machine-checked manifest in §6 is the source the validator compares with the prose headings, evidence bullets and claim lines.

## 4. Commands actually run and observed output

Only the validator and its self-test were run. No build, lint, typecheck, test suite, Docker, CI, network call or deployment was attempted.

### Positive: contract validation

```
$ node scripts/check-m27-18-preview-vs-fullstack.mjs
PASS contract=docs/planning/M27-18-preview-vs-fullstack.md gates=2 sha_length=40 anchors=10
PASS phrases=5 manifest=parseable
PASS PREVIEW evidence=6 may_claim=3 must_not_claim=6
PASS FULLSTACK evidence=13 may_claim=5 must_not_claim=5
PASS evidence_classes=13 preview_is_strict_subset=yes
exit=0
```

### Negative: tampered-fixture self-test

```
$ node scripts/check-m27-18-preview-vs-fullstack.mjs --self-test
PASS  accept: valid contract is accepted
PASS  reject: preview gate that claims production is rejected
PASS  reject: full-stack gate missing an evidence class is rejected
PASS  reject: gate without an exact-SHA requirement is rejected
PASS  reject: prose preview claim of production is rejected
PASS  reject: missing manifest marker is rejected
PASS  reject: missing preview evidence bullet is rejected
SELF-TEST PASS: 7/7 fixtures behaved as expected
exit=0
```

The tampered fixtures are applied to an in-memory copy of the real contract, not a synthetic document:

| Tamper | Required rejection |
|---|---|
| `PREVIEW.production_claim = true` and a `production deployment` may-claim | rejected with "preview gate must not claim production" |
| remove `EV-RESTORE` from `FULLSTACK.required_evidence` | rejected with "missing full-stack evidence class EV-RESTORE" |
| `FULLSTACK.exact_sha_required = false` | rejected on the exact-SHA requirement |
| preview `- MAY CLAIM:` prose changed to claim production | rejected with "preview gate must not claim production" |
| manifest END marker removed | rejected on the missing marker |
| `EV-RIGHTS` bullet removed from the preview evidence list | rejected with "preview section does not list required evidence EV-RIGHTS" |

One pre-fix run failed for an anchor-counting defect in the validator (markers were counted after the manifest block had been stripped); the counting was corrected to read markers from the original text, and both commands above are the post-fix observed results.

## 5. Security, rights, privacy

- No secrets, environment values, tokens, private witness material or unapproved source content are read into or written by these files.
- No runtime, network, database, Docker or deployment command was executed; no pass, deployment or rights claim is made.
- The contract forbids production/deployment/acceptance claims without observed exact-SHA evidence and requires an explicit withholding record for Research and other unreviewed material.
- `TODO.md` was not edited; no checkbox, status or register entry changed.

## 6. Rollback

Delete the three new files; nothing else changes:

```
rm docs/planning/M27-18-preview-vs-fullstack.md
rm scripts/check-m27-18-preview-vs-fullstack.mjs
rm docs/audit/M27-18-preview-vs-fullstack.md
```

No existing tracked file was touched, so no revert of tracked content is required. Unrelated dirty paths must be preserved.

## 7. Limitations

- This is a **contract**, not gate evidence. Neither Gate P nor Gate F has been entered; M27-12 and M27-16 (the register's named predecessors) remain open at the baseline SHA.
- The validator proves internal consistency of one Markdown file and rejects the six tamper classes above. It does not prove any runtime, build, deployment, restore, rights or locale behavior.
- The contract's status snapshot ("M27-12/M27-16 open") is date- and SHA-pinned and will go stale; it is an observation at `5b70e76`, not a live status source. `TODO.md` remains the sole register.
- The contract adds `PREVIEW_ACCEPTED` as a scoped state in its own text; it does not modify `docs/architecture/RELEASE.md`.
- No `docs/tasks/M27/M27-18.md` packet exists, so this work followed the TODO row, the M27 milestone context and the AI execution contract instead.
- Integrator action: review, commit, record `result_sha`, and decide the M27-18 checkbox. This audit does not self-approve.

**next_eligible_task:** M27-12 (execute at a frozen candidate SHA) is the earliest M27 predecessor that can unblock M27-18's gate entry; M27-16 follows it. The integrator must re-check the register, since both are open and other M27 leaves depend on the same evidence.
