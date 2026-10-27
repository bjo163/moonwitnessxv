# M16-01 — Private witness object and provenance categories (spec evidence)

| Field | Evidence |
|---|---|
| `task_id` | M16-01 |
| `baseline_sha` | `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (`dev`, re-verified at completion — HEAD did not move during the task) |
| `worker` | Leaf agent, M16 (specification task) |
| `claimed_files` | `docs/decisions/M16-01-private-witness-object-spec.md`, `docs/audit/M16-01-witness-object-spec.md` |
| `actual_changed_files` | Exactly the two files above, both **new**. No file was deleted or modified. |
| `result_sha` | Not applicable — no commit created (per instruction: no `git add`, no commit). Deliverables are untracked in the working tree at `76ecdc5`. |
| `reviewer` | Integrator (self-approval not claimed; TODO leaf unchecked) |
| `rollback` | Delete the two files in `claimed_files`. Purely additive documentation; nothing references them. |
| `artifact type` | Specification / decision document. **No code, no schema, no migration, no route, no UI, no test file, no Docker or CI change was made.** |
| `next_eligible_task` | M16-02 (depends on M16-01) once the integrator accepts this leaf |

## Where the deliverable lives and why

`docs/tasks/M16/M16-01.md` designates no explicit output path; it says *"Produce only the scoped research/decision/design/code/test artifact."* The repository has **no `docs/specs/` directory** (verified with `ls docs` → `architecture audit decisions design governance milestones planning vision runbook-restore.md tasks`), and every prior task-level specification/decision artifact lives in `docs/decisions/` under a task-prefixed name (`M07-02-corpus-identity-schema.md`, `M02-02-domain-assignments.md`, `M03-06-witness-withdrawal-policy.md`, `M02-05-stable-ids-and-legacy-refs.md`). The spec therefore follows that convention and mirrors its house style (header block with Milestone/Task/Status/Reference, numbered sections, invariant rules), keeping the authority-documentation style of `docs/architecture/ECHOLOG.md` for boundary tables and the `NEEDS_*` flagging style of `M06-06` (`NEEDS_SOURCE`).

## Positive evidence — TODO acceptance *"Default private, no automatic public original"*

Proved at the specification level (this leaf is documentation; no executable surface exists yet):

- §2.5 axis 1 fixes visibility initial/default to **`PRIVATE`** for every creation path, with the four BLUEPRINT §6 axes kept orthogonal ("never combine to one score").
- §4.1 states the hard rule and decomposes it into six individually testable clauses **H-1…H-6** (no non-private default; no automatic public *original*; only an approved redacted *derivative* can go public; `WITHDRAWN` blocks projection but preserves the audit trail; no archive dumps; no personal data in logs/public surfaces), each anchored to a verbatim quote from ADR-0003, M03-06, BLUEPRINT §3/§4/§6 or SECURITY.md.
- §3.1 adopts the **existing** BLUEPRINT §6 epistemic-nature enum rather than minting a new one, and §3.2 fixes eight invariants (P-1…P-8) that make the M16-07 acceptance *"No unverified spiritual message asserted as fact"* testable downstream.
- §5 declares the consent/ACL plugs (consent scope must cover the target scope; role gate + row predicate per `packages/moonql/src/acl.ts`; rights veto blocks bytes not metadata; D08 as the only writer of review state) without implementing any of them.

## Negative evidence — commands actually run at `76ecdc5`, with observed output

```text
git rev-parse HEAD                                              -> 76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3
ls packages | grep -i witness                                  -> (no output, exit 1)
grep -rn "witness_testimonies" --include=*.ts packages apps    -> (no output, exit 1)
grep -rn "'wt_" --include=*.ts --include=*.tsx packages apps    -> (no output, exit 1)
grep -rEn "from '@moonwitness/(moonql-)?witness'" apps packages -> (no output, exit 1)
grep -c "moonql-witness" apps/arsy/src/addons.ts                -> 0
```

These confirm the negative conditions this spec had to respect:

1. **D06 Witness is unimplemented** — no `packages/moonql-witness`, no model, no `wt_` identifier issued, no addon registered in the single ARSY wiring point. So the spec could not, and did not, contradict shipped behaviour; and no "automatic public original" exists in code today either.
2. **No new SQL owner was introduced.** The importer set stays `{packages/moonql, packages/skylink-store}`; ADR-0006's *"No third SQL owner is authorized"* is untouched, ADR-0007's stateless ECHOLOG clause is untouched, and SKYLINK gained no identity/catalog/SQL surface (agents.md constraint honored).
3. **Method note / false positive avoided:** an initial probe used `grep -i witness apps/arsy/src/addons.ts`, which matched all 16 `@moonwitness/*` imports. That is **not** evidence of a witness addon. §8 of the spec was corrected to use the precise patterns above, so a reviewer re-running the checks gets the same result.
4. **Not executed:** no `pnpm verify`, no package tests, no typecheck, no Docker run — nothing in this task changed TypeScript, so the packet's `pnpm typecheck` condition does not apply. No test was run against a live service, so nothing here is evidence of deployment or shipped behaviour (agents.md: *"a green unrelated CI [is] not production proof"*).

## Working-tree state observed (preserved, not touched)

`git status --short` at completion showed concurrent work from other sessions, all left intact and unstaged by this task:

```text
 M apps/echolog/package.json          M apps/echolog/tsconfig.json
 M docs/architecture/ECHOLOG.md       M packages/eslint-config/src/index.js
 M scripts/check-ui-consistency.mjs   M scripts/git-hooks/commit-msg.mjs
 M scripts/git-hooks/pre-commit.mjs   ?? apps/echolog/client/
 ?? apps/echolog/test/operator-client.test.ts  ?? apps/echolog/vite.config.mjs
 ?? apps/aigateway/test/tsconfig.json ?? packages/moonui/test/tsconfig.json
 ?? packages/skylink-whatsapp/test/tsconfig.json  ?? scripts/check-ui-assets.mjs
 ?? docs/audit/M39-11-operator-console-render.md
```

The tree changed *during* this task (the hook scripts and several tsconfig files appeared after the initial baseline listing) while HEAD stayed at `76ecdc5`; these belong to the in-flight M39/ECHOLOG and tooling work, are disjoint from this task's file set, and were neither read as authority nor modified. Note that `docs/architecture/ECHOLOG.md` was mid-edit by another session; quotes used in this spec came from ADR-0007 and SECURITY.md (both unmodified at `76ecdc5`), not from the dirty ECHOLOG file, except one pointer to a section that is stable in both versions.

## Conflicts and ambiguities found (reported, not resolved by editing others' documents)

1. **Domain label in the TODO row.** The task brief referred to *"the closed D07 domain boundaries"* for M16-01. In the TODO table the `D3` column is **Difficulty**, not a domain, and M16-01 is a **D06 Witness** leaf: BLUEPRINT §4 row *"D06 | Witness | Private observation, consent, original testimony, dated corrections | Public archive only approved derivative"* and M02-02 D06 row. **D07 is Story & Media** (fiction). The spec states this in §1.1. If the integrator intended D07, that would mis-file lived testimony as fiction — flagged for confirmation, spec written to BLUEPRINT.
2. **Three competing provenance vocabularies.** BLUEPRINT §6 gives `PRIMARY_TEXT / ATTRIBUTED_BELIEF / HISTORICAL_EVIDENCE / SCIENTIFIC_OBSERVATION / PERSONAL_TESTIMONY / INTERPRETATION / FICTION`; `docs/vision/MASTER_VISION_NARRATIVE_XV.md` §04.2 gives a nine-value list (`EXPLICIT_TEXT`, `CREATIVE_FICTION`, `USER_TESTIMONY`, `EMPIRICAL_OBSERVATION`, `UNKNOWN`, …) and its §594–598 block gives a fourth naming (`SOURCE | ATTRIBUTED_CLAIM | OBSERVATION | INTERPRETATION | HYPOTHESIS | TESTIMONY | FICTION`). The spec adopts BLUEPRINT as normative and forbids a parallel enum (§3.1, `NEEDS_ADR-provenance-vocabulary-change` in §7). **The narrative documents were not edited.**
3. **A value outside the normative axis is already in use.** `docs/decisions/M06-02-xiv-v10-crosswalk.md` uses `SECONDARY_CITATION` and writes `INTERPRETATION / FICTION` as one combined "Classification" cell. Joining two axis values with "/" collides with BLUEPRINT §6 *"never combine to one score"*. Reported; the spec's P-1 single-value rule is stated for D06 only and does not retroactively rewrite M06-02.
4. **Stale paths in security guidance.** `docs/architecture/SECURITY.md` and BLUEPRINT §8 name critical sources under `apps/radio/` (`apps/radio/src/config.ts`, `apps/radio/src/modules`), but `apps/` now contains **`arsy`**, not `radio` (verified by `ls apps` and `apps/arsy/src/addons.ts`). The quoted *substance* of SECURITY.md still governs; only the paths drifted after the ARSY migration (M28). Reported for a future doc-correction pass, not edited here.
5. **Consent-record ownership read two ways.** M02-02 lists `consent_records` as a **D06** entity, while BLUEPRINT §4 gives **D08** *"…and consent policy"*. The spec resolves this by declaration rather than by editing either source: D06 stores the individual consent record, D08 owns the policy/rights decision that gates publication (§5, §6). Integrator may prefer to record this split explicitly in BLUEPRINT or an ADR.
6. **Prerequisite substance is thin for M16.** M06-07's crosswalk contains no D06 rows — V10 and Rocksoul material were mapped to D07 as `INTERPRETATION / FICTION`. So the prerequisites are closed, but **no real witness source has been inventoried yet**; M16-03…M16-06 will have no genuine testimony fixture to test against until a rights-cleared source exists. That is a source/rights gap, and per packet step 8 it is the kind of thing that blocks *implementation* leaves, not this specification leaf.
7. **`NEEDS_MIGRATION` is not an existing repo token.** Verified: `grep -rn NEEDS_MIGRATION` → no matches. The spec introduces it only as a *flag label* in §7, alongside the pre-existing `NEEDS_SOURCE` convention, and every flagged item names the ADR that would have to cover it (ADR-0002 for additive MoonQL work, a new ADR to amend ADR-0006 for any third SQL owner, M04-02's expand/switch/contract lifecycle for anything destructive). No schema decision was taken here.

## Security, rights and privacy

No personal data, testimony text, credential, object key, provider token, or witness material was introduced into the repository. The spec only *constrains* future handling: default private, no automatic public original, minors masked before review with guardian verification required for publication (M03-06 §2, ADR-0003 §2.2), bytes confined to ECHOLOG D19 references, no `bytea` anywhere, and the SECURITY.md rules quoted rather than paraphrased wherever load-bearing. Nothing in the two files is publishable content — they are policy and shape.

## Limitations

- Specification only: it proves the *contract* is coherent with the accepted ADRs and BLUEPRINT, not that any behaviour works. No runtime, database, browser, or deployment evidence is claimed.
- The field vocabulary in §2 is logical, not committed: naming, nullability and typing are settled by the future `@moonwitness/witness` implementation task under ADR-0002, and the register in §7 must be honored before any table is created.
- Status is "SPECIFICATION DRAFTED", not RATIFIED: ratification and the TODO checkbox belong to the integrator, and M16's exit gate additionally requires a human reviewer (the milestone file and M03's unresolved exit gate set that precedent).
- Concurrent sessions modified unrelated files during this task; this report reflects only the two files this task wrote.

**Verdict: READY-TO-CLOSE** (documentation acceptance met at `76ecdc5`; conflicts 1–7 above are for the integrator to route, none blocks this leaf).
