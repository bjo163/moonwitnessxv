# M26-06 — 25 Bidang Amanah source and mission-mapping audit

- **Task**: M26-06 — Locate exact 25 Bidang Amanah source and mission mapping
- **Milestone**: M26 — Legacy canon, Empire registries and missing sources
- **Baseline**: branch `dev`, task-pinned `baseline_sha` `659da2855f56c61ae9d21e2995be9649c77fc470` (659da28). Final observed worktree HEAD `e76df8b0931f7553615e7eb693084c2d36d39e55` (e76df8b). 659da28 is an ancestor of e76df8b.
- **Mode**: read-only repository research plus three new files. No TODO edit, no commit, no stash, no checkout, no reset, no build, no test of application code, no external fetch.
- **Dependency**: M26-05 is closed at `TODO.md:601` (`- [x] **M26-05**`).
- **Worktree note**: another session advanced `dev` during this task (commits `f4c18ca`, `dfc6556`, `f841db5`, `e76df8b`). Pre-existing uncommitted changes under `apps/cockpit`, `apps/dock`, `apps/headquarters` and `docs/audit/screens` were present and were not touched. The quoted `TODO.md` lines are unchanged by the new commits and all locators resolve at e76df8b.
- **Deliverables**: `docs/data/M26-06-bidang-amanah.json`, `scripts/check-m26-06-bidang-amanah.mjs`, this audit. No existing file was modified by this task.

## 1. Verdict

**The exact 25-field list is NOT FOUND in this repository at the baseline.** The only authoritative treatment, `docs/vision/MASTER_VISION_NARRATIVE_XV.md:904-921`, explicitly states that the exact final list, its Qur'an references and a previously mentioned `cosmic` Asma-engine design were not retrieved as verified repository files, and forbids manufacturing 25 names.

**Evidence count: 0 of the 25 fields have a field-level evidence row; all 25 of 25 remain explicitly unverified (`NEEDS_SOURCE`).** The 25 ledger slots each carry verified model- and count-level locators, but none carries a field name, sequence, definition or source. No name was guessed.

**Mission mapping: NOT FOUND.** Six source-cited missions exist in the M11 Prophetic Mission Table (`ms_001`–`ms_006`) for five figures, but none is mapped to a Bidang Amanah field. There is no mapping table, foreign key, 25-row matrix or document that assigns a mission to a field: 0 of 6 missions are mapped, and 0 of 25 slots receive a mission.

This audit does not close M26-06. `TODO.md:602` remains unchecked; the integrator and a human reviewer decide closure.

## 2. Method

1. Recorded branch, HEAD and worktree state before editing.
2. Searched tracked files at HEAD with `git grep` for `bidang amanah`, `bidang`, `amanah`, `prophetic mission`, `25 fields/domains/missions/amanah`, `twenty-five`, `dua puluh lima`.
3. Searched the full commit graph (372 commits, all refs) for the exact phrase, not only HEAD, to test whether an enumerated list existed in a deleted or older file.
4. Searched the working tree with `rg` (excluding `.git`, `node_modules`, `dist`, `.next`, `coverage`) so untracked WIP could not hide a list. The only matches were the same tracked authority documents.
5. Read the primary sources at the cited lines: the vision section 21A.7, the TODO task rows, the Blueprint distinctness list, the domain-coverage index, the M26-05 audit, the M11 actor seed/projection/evidence, and the AMANAH label surfaces in `moonql-ops` and `moonql-unilex`.
6. Classified every candidate mention as `EVIDENCED` / `PARTIAL_REFERENCE` / `NEEDS_SOURCE` / `NOT_FOUND`, with a source locator and quote for each. Repeated or derived mentions were not promoted to evidence.
7. Built the 25-slot ledger and a dependency-free validator that re-resolves every locator quote at the cited `file:line` and enforces the no-guess invariant. No external archive, chat log, database or sibling repository was opened.

## 3. Findings

### 3.1 The exact enumerated list is absent

The decisive statement is `docs/vision/MASTER_VISION_NARRATIVE_XV.md:919`:

> The exact final list of all 25 fields, associated Qur'an references, and a previously mentioned `cosmic` Asma-engine design **were not retrieved as verified repository files during this audit**. Therefore record the 25-field model as a **high-priority archival and source-recovery item**, **do not manufacture 25 names** or claim the model is integrated in XV.

The surrounding section (`:904-921`) names the model and its conceptual chain:

> `QUR'AN / DIVINE ONTOLOGY → ATTRIBUTED DIVINE RELATIONS → AMANAH (WHAT / RESPONSIBILITY) → PROPHETIC MISSION (SOURCE-ATTRIBUTED PATTERN) → AVATAR (PEDAGOGICAL/ROLE MODEL) → AI AGENT (OPTIONAL TOOL EXECUTOR) → SHADOW (CREATIVE/OPERATOR SURFACE) → TASKS`

It defines the intended semantics (Amanah is a human responsibility, not supernatural power; a prophetic mission is source-attributed, not one invented exclusive mandate; an avatar is not the prophet; an agent is a bounded tool; a shadow is a workflow/presentation layer). It supplies **zero field names, zero sequences, zero Qur'an references and zero mission assignments**.

`MASTER_VISION_NARRATIVE_XV.md:1124` records the gap as priority P1 — “25 Bidang Amanah absent | Large conceptual agent/mission family lost | Authorized source retrieval and 25-row reviewed matrix” — and `:1096` lists “exact final 25 Amanah mapping” among open evidence tasks.

### 3.2 Only partial references, counts, labels and plans exist

Twelve candidate mentions were classified in the ledger. None enumerates a field.

| Candidate id | Kind | Status | Primary locator | What it actually supplies |
|---|---|---|---|---|
| `candidate-model-statement` | MODEL_LABEL | PARTIAL_REFERENCE | `MASTER_VISION_NARRATIVE_XV.md:906` | Names the model and its conceptual chain; no fields |
| `candidate-recovery-mandate` | RECOVERY_MANDATE | PARTIAL_REFERENCE | `MASTER_VISION_NARRATIVE_XV.md:919` | Recovery plan, no-manufacture rule, `NEEDS_SOURCE` marking; no fields |
| `candidate-blueprint-roster` | COUNT_STATEMENT | PARTIAL_REFERENCE | `BLUEPRINT.md:227` | “25 Amanah (roster unverified)”; count only |
| `candidate-avatar-proposal` | RELATED_PROPOSAL | PARTIAL_REFERENCE | `packages/moonql-actors/src/seed.ts:58` | The separate 25 Prophetic Mission Avatars proposal; 0 names recovered, 0 seeded |
| `candidate-mission-registry` | RELATED_REGISTRY | PARTIAL_REFERENCE | `packages/moonql-actors/src/seed.ts:39` | 6 real missions and 5 figures; no Amanah field |
| `candidate-25-agents-constraint` | COUNT_STATEMENT | PARTIAL_REFERENCE | `MASTER_VISION_NARRATIVE_XV.md:1102` | Prohibits creating 25 agents by writing the narrative; no inventory |
| `candidate-exact-list-absence` | ABSENCE_STATEMENT | NOT_FOUND | `MASTER_VISION_NARRATIVE_XV.md:919` | States the exact list was not retrieved; absence, not source |
| `candidate-mission-map-absence` | ABSENCE_STATEMENT | NOT_FOUND | `MASTER_VISION_NARRATIVE_XV.md:1096` | “exact final 25 Amanah mapping” is an open evidence task; no mapping |
| `candidate-amanah-label-collision` | LABEL_COLLISION | NOT_FOUND | `packages/moonql-ops/src/empire.ts:56` | `AMANAH Access` is one Empire system label, not a 25-field entry |
| `candidate-cosmic-asma-engine` | ABSENCE_STATEMENT | NOT_FOUND | `MASTER_VISION_NARRATIVE_XV.md:919` | The related `cosmic` Asma-engine design is also unretrieved |
| `candidate-xii-mission-registries` | EXTERNAL_REFERENCE | NEEDS_SOURCE | `MASTER_VISION_NARRATIVE_XV.md:921` | A comparison target named in the research to-do; not in this repository |
| `candidate-authorized-originals` | EXTERNAL_REFERENCE | NEEDS_SOURCE | `MASTER_VISION_NARRATIVE_XV.md:921` | Authorized originals to locate; identity, location and rights unknown |

No candidate is `EVIDENCED`. A model label, a count, a related proposal, a plan and a label collision are not an enumeration.

### 3.3 No mission-to-field mapping exists

The M11 Prophetic Mission Table is real and source-cited: `packages/moonql-actors/src/seed.ts:38-39` reports `figureCount: 5` and `missionCount: 6`; `docs/audit/M11-figure-mission-table.md:38` records “5 figures · 7 roles · 6 missions · 5 events · 0 avatars”. The six missions are:

| Mission | Figure | Title (quoted from the seed) | Mapped slot |
|---|---|---|---|
| `ms_001` | `fg_001` | Warn a community before a trial | none |
| `ms_002` | `fg_002` | Call a community away from idols to one God | none |
| `ms_003` | `fg_003` | Confront a transgressing ruler with a sign | none |
| `ms_004` | `fg_004` | Bring a sign to the Children of Israel | none |
| `ms_005` | `fg_005` | Mercy to the worlds | none |
| `ms_006` | `fg_005` | Mercy without one exclusive mission | none |

The registry is a filtered view over `actor_figures`; it is explicitly not a separate prophet database (`packages/moonql-actors/src/seed.ts:49`). It has no 25-field foreign key, no Amanah column and no mapping model. The 25-avatar proposal cannot supply the mapping either: `AVATAR_POLICY` records `modelStatus: 'PROPOSAL_ONLY_NOT_INTEGRATED'`, `namesRecovered: false` and `seededNames: 0` (`seed.ts:59-61`).

**Conclusion: 0 of 6 missions map to any of the 25 fields, and no mapping artifact exists.** The mission titles in this table are source-cited M11 labels, not Bidang Amanah field names.

### 3.4 The closest 25-item proposal is not the 25 Bidang Amanah

The repository does contain a separate 25-item concept: **25 Prophetic Mission Avatars** (`MASTER_VISION_NARRATIVE_XV.md:278,473`; `packages/moonql-actors/src/seed.ts:58`). M11 records it as pedagogy only, with five policy rules, a mandatory “not the prophet” disclosure, `PEDAGOGICAL_ONLY` authority, zero recovered names and zero seeded avatars. It is a related proposal, not the 25-field Amanah model, and it supplies no field names.

### 3.5 AMANAH also appears as unrelated or narrower labels

- `packages/moonql-ops/src/empire.ts:55-56`: `sys_amanah` / `AMANAH Access`, one of 14 Empire logical systems; the vision defines it as human permissions, mandate and consent and forbids “Spiritual mandate generated by software” (`MASTER_VISION_NARRATIVE_XV.md:883`).
- `packages/moonql-unilex/src/data/registry.ts:477`: UNILEX concept `S002`, “Amanah (Qur'anic concept)”, domain `SCRIPTURE`, kind `concept`.
- `MASTER_VISION_NARRATIVE_XV.md:441`: “`AMANAH` = scoped responsibility … not supernatural appointment.”

These are label collisions and concept definitions, not 25-field entries. They grant no authority and were not promoted.

### 3.6 History contains no hidden list

The exact phrase “Bidang Amanah” has existed in only four file paths across all 372 commits: `docs/vision/MASTER_VISION_NARRATIVE_XV.md`, `TODO.md`, `docs/tasks/M26/M26-06.md` and `docs/audit/M26-05-empire-taxonomy-audit.md`. No data file, registry, schema, seed, table or deleted list ever carried an enumerated 25-field roster. `git log -S "Bidang Amanah" --all` returns four documentation commits (`ed3561a`, `94047e8`, `7c13947`, `43dfcde`), none of which adds or removes a name list.

## 4. Status distribution

| Scope | Total | EVIDENCED | PARTIAL_REFERENCE | NEEDS_SOURCE | NOT_FOUND |
|---|---:|---:|---:|---:|---:|
| Field slots | 25 | 0 | 0 | **25** | 0 |
| Candidate mentions | 12 | 0 | 6 | 2 | 4 |
| M11 missions | 6 | — | — | — | **6 unmapped** |
| Mission-to-slot mappings | 0 | 0 | 0 | 0 | 0 |

- **0 of 25 fields have real field-level evidence.**
- **25 of 25 fields are explicitly unverified.**
- **0 of 25 names were guessed or asserted.**
- **0 mission mappings exist.**

The 25 rows satisfy the acceptance shape “25 evidence rows or explicitly unverified” only in the second branch: 25 explicitly unverified slots, each with verified model/count locators. They do not satisfy it as 25 named evidence rows, and this audit does not claim that they do.

## 5. Non-claims

- This audit does not prove the 25-field model does not exist outside this repository. It proves only that it is absent from the tracked tree and history at the baseline and observed HEAD.
- It does not recover, authenticate, license, date or translate any field. No field name, sequence, Qur'an reference or mission is approved.
- It does not treat the M11 mission titles, the 25-avatar proposal, the AMANAH Empire label or the UNILEX `S002` concept as field evidence.
- It does not claim the model is integrated in XV, implemented in code, exposed by an API, rendered in a UI, reviewed editorially, or cleared for publication.
- It does not claim any external source is missing, inaccessible or unauthorized; external candidates remain `NEEDS_SOURCE`.
- It does not close M26-06 or change `TODO.md`.

## 6. Limitations

- Research is lexical and in-repository. A list expressed only through synonyms, images, attachments, an uncommitted stash, a non-default remote branch not present locally, or an external archive would not be found. The searches covered the obvious Indonesian and English terms plus mission/25/avatar variants, but cannot prove exhaustive synonym coverage.
- The full-history search covers all refs and 372 commits present locally. It does not cover remote refs that were never fetched, deleted reflog objects, GitHub Issues, or chat logs.
- No external repository, archive, credentialed source, database or private witness material was opened. The XII mission registries and authorized originals are `NEEDS_SOURCE`, not verified absent.
- The worktree HEAD advanced during the task because another session committed M26-02 and M31-03 work. The ledger keeps the task baseline 659da28 and records the final observed HEAD e76df8b; all quotes re-resolve at e76df8b. Uncommitted WIP was not reviewed as evidence and was not modified.
- The validator proves internal consistency and locator resolution, not the truth, completeness or rights of any future source. It is not a substitute for editorial review.

## 7. Commands and observed results

All commands were run from the repository root. `git` commands are read-only.

### 7.1 Baseline and worktree

```
$ git branch --show-current
dev
$ git rev-parse HEAD            # first observation, before writing
659da2855f56c61ae9d21e2995be9649c77fc470
$ git rev-parse HEAD            # final observation
e76df8b0931f7553615e7eb693084c2d36d39e55
$ git merge-base --is-ancestor 659da2855f56c61ae9d21e2995be9649c77fc470 HEAD && echo "659da28 IS ANCESTOR"
659da28 IS ANCESTOR
$ git log --oneline -5
e76df8b docs(todo): close M26-02 at the separation ledger
f841db5 docs(m26): record GOD PROMISE separation evidence
dfc6556 docs(todo): close M31-03 at the accepted Dock runtime decision
f4c18ca docs(m31): accept Dock as the LIGHTHOUSE gateway runtime
659da28 docs(todo): close M21-06, M26-03, M26-04 and M26-07 at verified SHAs
```

`git status --short` showed the pre-existing modified cockpit/dock/HQ/screens files. The three deliverables are new untracked files; no existing tracked file was changed by this task.

### 7.2 Lexical evidence at HEAD

```
$ git grep -n -i "bidang amanah" HEAD
HEAD:TODO.md:602:| - [ ] | **M26-06** — Locate exact 25 Bidang Amanah source and mission mapping | P2 | D4 | M26-05 | 25 evidence rows or explicitly unverified, never guessed names ; [packet](docs/tasks/M26/M26-06.md) |
HEAD:docs/audit/M26-05-empire-taxonomy-audit.md:215:No local registry, no 99 names, no data file. ... `M26-06` is the 25 Bidang Amanah task, not the Asma registry. ...
HEAD:docs/tasks/M26/M26-06.md:1:# M26-06 — Locate exact 25 Bidang Amanah source and mission mapping
HEAD:docs/tasks/M26/M26-06.md:6:Deliver **Locate exact 25 Bidang Amanah source and mission mapping**. Acceptance from existing TODO: 25 evidence rows or explicitly unverified, never guessed names. ...
HEAD:docs/vision/MASTER_VISION_NARRATIVE_XV.md:904:## 21A.7 Twenty-five Bidang Amanah — recover a missing architecture family
HEAD:docs/vision/MASTER_VISION_NARRATIVE_XV.md:906:Earlier design discussions refer to a **25 Bidang Amanah** model linked to actual **prophetic mission patterns**, **Divine Ontology**, **Asma/principles**, and ordinary general-domain responsibilities. ...
HEAD:docs/vision/MASTER_VISION_NARRATIVE_XV.md:1124:| **P1** | 25 Bidang Amanah absent | Large conceptual agent/mission family lost | Authorized source retrieval and 25-row reviewed matrix |
```

Seven lines in four files; the `M26-05:215` and `M26-06:1,6` references are derived task/audit text, not primary evidence. `git grep -c -i "bidang" HEAD` returned 10 matches in six files: the three additional matches are Headquarters UI strings where `bidang` means a form/table “field”, unrelated to Amanah.

```
$ git grep -c -i "amanah" HEAD
HEAD:BLUEPRINT.md:1
HEAD:TODO.md:3
HEAD:apps/arsy/test/ecosystem-god-tier.test.ts:3
HEAD:apps/headquarters/src/app/(admin)/page.tsx:1
HEAD:docs/audit/M26-05-empire-taxonomy-audit.md:2
HEAD:docs/audit/ui-p02-p12-audits-fe8e84c.md:1
HEAD:docs/data/M26-01-chapter-crosswalk.json:1
HEAD:docs/planning/DOMAIN_COVERAGE.md:1
HEAD:docs/tasks/M26/M26-06.md:2
HEAD:docs/vision/MASTER_VISION_NARRATIVE_XV.md:13
HEAD:packages/moonql-ops/src/empire.ts:2
HEAD:packages/moonql-unilex/src/data/registry.ts:2
HEAD:packages/types/src/sentinel/telemetry.ts:1
```

33 matches in 13 files. None is an enumerated 25-field list; the only 25-specific lines are the model labels, counts, gap statements, avatar proposal and plans recorded in the ledger.

### 7.3 Full-history check

```
$ git grep -l -i "bidang amanah" $(git rev-list --all) | sed 's/^[0-9a-f]*://' | sort | uniq -c | sort -rn
    372 docs/vision/MASTER_VISION_NARRATIVE_XV.md
    366 TODO.md
    294 docs/tasks/M26/M26-06.md
     14 docs/audit/M26-05-empire-taxonomy-audit.md
$ git log --oneline -S "Bidang Amanah" --all -- .
ed3561a feat(moonui): define experience tokens and Empire taxonomy index
94047e8 docs(xv): ship 38 milestone contexts and small-agent leaf task packets
7c13947 docs(todo): complete XV 28 milestones 196 task register and dependency QA
43dfcde docs(vision): deepen XV master with source-pinned repository and narrative audit v1.1
```

Only four documentation paths ever carried the phrase; no list-bearing file appears at any commit.

### 7.4 Positive validation

```
$ node scripts/check-m26-06-bidang-amanah.mjs
PASS slots=25 candidates=12 baseline=659da2855f56c61ae9d21e2995be9649c77fc470
PASS slot status EVIDENCED=0 PARTIAL_REFERENCE=0 NEEDS_SOURCE=25 NOT_FOUND=0
PASS candidate status EVIDENCED=0 PARTIAL_REFERENCE=6 NEEDS_SOURCE=2 NOT_FOUND=4
PASS slot indices 1-25 complete; named slots=0 unnamed=25
PASS candidate missions=6 mission mappings=0 mapped fields=0
PASS 54 locator quotes resolved at the cited file:line
PASS zero names without a locator; zero complete-25 assertions without an enumerated source
PASS declared counts match rows, candidate kinds and name statuses
NOTE exact 25-field list absent: 0 EVIDENCED fields, 0 names guessed, 0 mission mappings
EXIT=0
```

### 7.5 Negative validation

```
$ node scripts/check-m26-06-bidang-amanah.mjs --self-test
PASS  negative: duplicate slot id is rejected
PASS  negative: a missing 25th slot is rejected
PASS  negative: a duplicate slot index is rejected
PASS  negative: a slot index outside 1-25 is rejected
PASS  negative: an invented slot name without a name locator is rejected
PASS  negative: a name quote that does not contain the name is rejected
PASS  negative: an unknown slot status is rejected
PASS  negative: a misdeclared slot total is rejected
PASS  negative: a misdeclared slot-status tally is rejected
PASS  negative: an evidence quote absent from the cited line is rejected
PASS  negative: a dangling evidence id is rejected
PASS  negative: a duplicate evidence id is rejected
PASS  negative: PARTIAL_REFERENCE without source_locator is rejected
PASS  negative: an EVIDENCED candidate without an enumerated source is rejected
PASS  negative: a NOT_FOUND candidate carrying source_locator is rejected
PASS  negative: a disabled no-guess invariant is rejected
PASS  negative: asserting a complete 25 without an enumerated source is rejected
PASS  negative: asserting 25 field names with no names is rejected
PASS  negative: an enumerated source with fewer than 25 entries is rejected
PASS  negative: a mission mapped without a mapping locator is rejected
PASS  negative: a misdeclared mission-mapping total is rejected
PASS  negative: a mission title quote that does not contain the title is rejected
PASS  negative: NOT_FOUND mapping status with a mapped mission is rejected
PASS  negative: a NEEDS_SOURCE slot carrying source_locator is rejected
PASS  negative: a null name marked EVIDENCED_IN_REPOSITORY is rejected
SELF-TEST PASS: all 25 invalid datasets rejected
EXIT=0
```

Representative first errors, also observed: `declared slots 26 !== rows 25`; `declared by_slot_status.NEEDS_SOURCE=24 !== rows 25`; `evidence EV-001 quote "this text is not on the cited line" not found at docs/vision/MASTER_VISION_NARRATIVE_XV.md:904`; `slot amanah-slot-01 references missing evidence id "EV-999"`; `candidate candidate-exact-list-absence is NOT_FOUND but carries source_locator "TODO.md:602"`; `mission candidate-mission-ms-001 title quote "title: 'Nonexistent mission'," not found at packages/moonql-actors/src/seed.ts:247`.

## 8. Rollback

Delete exactly the three new files:

```
rm docs/data/M26-06-bidang-amanah.json
rm scripts/check-m26-06-bidang-amanah.mjs
rm docs/audit/M26-06-bidang-amanah.md
```

No other file was created or modified by this task. Rollback must not touch `TODO.md`, the pre-existing WIP under `apps/cockpit`, `apps/dock`, `apps/headquarters` or `docs/audit/screens`, or the commits made by the other session.

## 9. Required report fields

| Field | Value |
|---|---|
| `task_id` | M26-06 |
| `baseline_sha` | `659da2855f56c61ae9d21e2995be9649c77fc470` |
| `worker` | Qoder agent, single session; no subagent delegation |
| `claimed_files` | `docs/data/M26-06-bidang-amanah.json`, `scripts/check-m26-06-bidang-amanah.mjs`, `docs/audit/M26-06-bidang-amanah.md` |
| `actual_changed_files` | The same three new files; no existing file modified by this task |
| `positive_test_and_output` | `node scripts/check-m26-06-bidang-amanah.mjs` → exit 0, 25 slots / 12 candidates, 54 locator quotes resolved, 0 names, 0 mappings (§7.4) |
| `negative_test_and_output` | `node scripts/check-m26-06-bidang-amanah.mjs --self-test` → exit 0, 25/25 invalid datasets rejected (§7.5) |
| `security_rights_privacy` | No secrets, environment values, private witness material or external content fetched. Only short repository quotes. No rights, consent or publication claim is made; the field list and its originals remain `NEEDS_SOURCE`. |
| `reviewer` | Not assigned. Human/integrator review required. |
| `rollback` | Delete the three files listed in §8. |
| `result_sha` | Not committed. Worktree HEAD at final observation `e76df8b`; ledger baseline `659da28`; three files untracked. |
| `limitations` | See §6; chiefly in-repository lexical search and no external source access. |
| `next_eligible_task` | Not selected here. `TODO.md` remains canonical; M26-06 stays unchecked. |

## 10. Closure decision

**NOT CLOSED by this worker.** The task's research result is a documented absence, not a recovered 25-row name matrix. The acceptance branch “explicitly unverified, never guessed names” is met; the branch “25 evidence rows” in the sense of 25 named fields is not, and cannot be met from this repository at the baseline. `TODO.md:602` remains `[ ]` for the integrator to assess against this evidence. No name, sequence, mission mapping or canonical field was invented.
