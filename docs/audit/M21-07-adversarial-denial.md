# M21-07 — Adversarial denial: forged citations, scope bypass, auto-publication

**Task:** M21-07 — "Test forged citations, scope bypass and auto-publication denial".
**Acceptance under test:** "Unauthorized requests blocked and recorded".
**State:** adversarial suite and evidence complete; **not self-closed**. The integrator owns review, the TODO checkbox and the result SHA.
**Worker:** agent session (one new test file, this report).
**Date of observation:** 2026-10-27 (local).
**baseline_sha:** `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef` (branch `dev`, short `788fcab`).

## Baseline and worktree

- Observed `dev` HEAD at start and at end: `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef` (`docs(todo): close M17-03, M21-05 and M33-01 at their evidence SHAs`). This session did not commit, stage, push, rebase, merge or delete anything.
- `apps/aigateway` was clean at start: `git status --porcelain -- apps/aigateway` produced no output. The repository worktree was already dirty elsewhere (`apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/echolog`, `apps/headquarters`, `packages/moonql*`, `docs/audit/screens`, several untracked files). Those paths belong to parallel sessions and were not opened for write or modified.
- Read before writing: `docs/tasks/M21/M21-07.md`, `AGENTS.md`, the three gates `apps/aigateway/src/retrieval.ts` (M21-03), `apps/aigateway/src/source-guard.ts` (M21-04), `apps/aigateway/src/review-inbox.ts` (M21-05), their tests, and the sibling audits `docs/audit/M21-03-permission-retrieval.md`, `M21-04-source-guard.md`, `M21-05-review-inbox.md`. `TODO.md` was read only; it was not edited.
- Baseline verification before the change: `pnpm --filter @moonwitness/aigateway test` — 59 tests, 59 pass, 0 fail, exit 0.

## Method

The suite imports the three committed gates unchanged (`../src/*.js`, exactly as the M21-03/04/05 tests do) and attacks them with synthetic requests. Every refusal is produced by a gate, not by a test expectation:

- **Review inbox (M21-05):** `evaluateCanonicalAction`, `evaluateReviewInbox`.
- **Source permission (M21-03):** `evaluateSourceCandidate`, `selectAuthorizedSources` is not forced into the flow.
- **Source guard (M21-04):** `evaluateSourceText`, `evaluateProposedToolInvocation`.

One adapter, `attemptPublication`, chains the gates in review → retrieval → guard order. It adds one check the gates do not perform: the citation's source id must equal the approval's `sourceId`, the retrieval decision's `sourceId` and the passage's `sourceId`. That check is **adapter-enforced, not a production gate**, and two `limitation` tests record exactly what happens without it. No production pipeline, HTTP route, database or store was added or simulated.

"Recorded" is asserted in the only sense the current code supports: each refusal is a returned value with one stable reason code and a fixed, payload-free field list. The suite also asserts that no persistence, audit-log or telemetry export exists, instead of claiming one.

## Files

- `apps/aigateway/test/m21-07-adversarial.test.ts` — new, 23 `node:test` tests: 4 positive controls, 17 adversarial (forged citation, scope bypass, auto-publication), 2 explicit limitation records; every refusal asserted through shared helpers.
- `docs/audit/M21-07-adversarial-denial.md` — this report.

`git status --porcelain -- apps/aigateway` after the work shows exactly:

```
?? apps/aigateway/test/m21-07-adversarial.test.ts
```

No gate, provider, router, server, route, schema, manifest, config, TODO or UI file was changed.

## Positive evidence

Command (working directory `Z:\project\moonradio\apps\aigateway`), exit code **0**:

```
pnpm exec tsx --test --test-name-pattern "M21-07 positive" test/m21-07-adversarial.test.ts
```

```
✔ M21-07 positive: a legitimate citation clears review, retrieval and source guard (5.0254ms)
✔ M21-07 positive: a restricted source opens through an exact principal and scope grant (0.2059ms)
✔ M21-07 positive: a trusted operator tool and an allow-listed https host still pass (1.8943ms)
✔ M21-07 positive: a distinct, live, exact-role human reviewer approves without echoing the payload (0.2017ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 115.0537
```

What the positive controls prove:

- The full composition clears only when a distinct human `principal:fixture:reviewer-001` holds a live `canonical-reviewer` authorization, the cited source is `PUBLIC`, `RIGHTS_EXACT_VERSION_CLEARED`, consent-covered for `model-context`, and the passage is benign. The cleared value names the source id, suggestion id and reviewer ref only — no body, text or URL.
- A `RESTRICTED` source still opens through an exact, principal- and scope-bound, unexpired grant with its body returned.
- A `TRUSTED_OPERATOR` tool call on an allow-listed tool is permitted, and an allow-listed `https` host is admitted byte-for-byte.
- A human approval returns metadata without echoing `payloadSummary` or the canary.

## Negative evidence

Command (same directory), exit code **0**:

```
pnpm exec tsx --test --test-name-pattern "M21-07 (forged|scope bypass|auto-publication|recorded|limitation)" test/m21-07-adversarial.test.ts
```

```
✔ M21-07 forged citation: a grant held for one source id does not authorize another id (2.4141ms)
✔ M21-07 forged citation: a grant held for another scope does not authorize model-context (0.2265ms)
✔ M21-07 forged citation: an approval for source alpha does not release beta bytes (0.7429ms)
✔ M21-07 limitation: the gates alone do not bind an approval to bytes; the adapter does (0.4178ms)
✔ M21-07 forged citation: a review decision recorded for one suggestion cannot canonicalize another (0.3573ms)
✔ M21-07 limitation: no inbox membership store exists, so an approved id absent from the batch is still allowed (0.9088ms)
✔ M21-07 scope bypass: a widened requested scope is not covered by exact rights or consent (0.3476ms)
✔ M21-07 scope bypass: model-context requested for a source cleared for another usage is denied (0.27ms)
✔ M21-07 scope bypass: an ACL issued to another principal never authorizes the requester (0.1994ms)
✔ M21-07 scope bypass: role and scope fields never authorize bytes (0.6273ms)
✔ M21-07 scope bypass: a replayed decision is refused instead of overriding the first (1.4463ms)
✔ M21-07 auto-publication: no human approval means no canonical action (0.2549ms)
✔ M21-07 auto-publication: an AI principal can never approve, even with the required role (0.2299ms)
✔ M21-07 auto-publication: the proposer cannot self-approve (0.1845ms)
✔ M21-07 auto-publication: a tool call from untrusted source content is always refused (0.5439ms)
✔ M21-07 auto-publication: a prompt-override passage never reaches an approved citation (1.079ms)
✔ M21-07 auto-publication: disallowed egress hosts and downgraded schemes are refused (3.8863ms)
✔ M21-07 recorded: every refusal keeps one stable reason code and no bytes, URL or text (0.7302ms)
✔ M21-07 recorded: no persistence, audit-log or telemetry layer exists; refusals are returned values only (0.2667ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 135.6644
```

Scenario-to-observed-refusal coverage (every fixture synthetic):

| Group | Attack | Observed result |
|---|---|---|
| Forged citation | Grant held for `src_fixture_alpha`, citation names `src_fixture_beta` (RESTRICTED) | `SOURCE_RESTRICTED_NO_GRANT` |
| Forged citation | Grant for beta carries scope `publication`, citation requests `model-context` | `SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH` |
| Forged citation | Approval is for alpha; cited beta is not independently cleared | retrieval refuses beta (`SOURCE_RESTRICTED_NO_GRANT`); adapter refuses the pairing (`CITATION_SOURCE_MISMATCH`) |
| Forged citation | APPROVE decision recorded for suggestion 001 transplanted to pending suggestion 404 | `SUGGESTION_PENDING` |
| Scope bypass | Requested scope `model-context publication`, `model-context,publication`, `publication` | `RIGHTS_SCOPE_MISMATCH`; restricted grant variant `SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH` |
| Scope bypass | `model-context` requested while consent covers only `publication` | `CONSENT_SCOPE_MISMATCH` |
| Scope bypass | Rights and consent cover only `publication` | `RIGHTS_SCOPE_MISMATCH` |
| Scope bypass | Grant issued to `principal:fixture:other-reader`, requester also holds admin/owner roles | `SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL` |
| Scope bypass | `roles: ['admin','owner','canonical-reviewer']`, `scopes: ['model-context','admin:full']` | `SOURCE_RESTRICTED_NO_GRANT`, decision deep-equal to an anonymous requester; PRIVATE owner `SOURCE_PRIVATE` |
| Scope bypass | APPROVE replayed twice, or APPROVE then REJECT | `DUPLICATE_DECISION`, identical on re-evaluation |
| Auto-publication | PENDING with APPROVE; APPROVED with no decision; APPROVED with REJECT | `SUGGESTION_PENDING`, `DECISION_MISSING`, `DECISION_NOT_APPROVE` |
| Auto-publication | AI actor with a matching `AI_AGENT` authorization; `principal:agent:007` declared `HUMAN` | `REVIEWER_NOT_HUMAN` |
| Auto-publication | Proposer approving itself with a valid human grant | `REVIEWER_IS_PROPOSER` |
| Auto-publication | Tool call declared `UNTRUSTED_SOURCE`; non-allow-listed tool; unknown origin | `TOOL_FROM_UNTRUSTED_SOURCE`, `TOOL_NOT_ALLOWED`, `TOOL_PROPOSAL_INVALID` |
| Auto-publication | English and Indonesian prompt-override passages | `PROMPT_OVERRIDE_INSTRUCTION` (direct and composed) |
| Auto-publication | `https://not-allowed.example/...`; `http://fixture.example/...` | `EGRESS_DESTINATION_NOT_ALLOWED`, `EGRESS_SCHEME_NOT_ALLOWED` |

The `recorded` test re-evaluates 16 mixed refusals twice, asserts `deepEqual` stability, the expected reason code, and the absence of 16 payload-bearing keys plus the canary, the body canary, `://`, the blocked host and the evil host in every serialized value.

## Commands and observed results

All commands were run locally on 2026-10-27. No network, provider, database, Docker, browser or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `git rev-parse HEAD` / `git status --porcelain -- apps/aigateway` (repo root), before the work | `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef`; no output for `apps/aigateway` |
| `pnpm --filter @moonwitness/aigateway test` (repo root), before the change | 59 tests, 59 pass, 0 fail, exit 0, `duration_ms 479.3034` |
| `pnpm exec tsx --test test/m21-07-adversarial.test.ts` (`apps/aigateway`), first run | 23 tests, 23 pass, 0 fail, exit 0, `duration_ms 230.7139` |
| `pnpm exec tsx --test --test-name-pattern "M21-07 positive" test/m21-07-adversarial.test.ts` (`apps/aigateway`) | 4 tests, 4 pass, 0 fail, exit 0 (verbatim above) |
| `pnpm exec tsx --test --test-name-pattern "M21-07 (forged\|scope bypass\|auto-publication\|recorded\|limitation)" test/m21-07-adversarial.test.ts` (`apps/aigateway`) | 19 tests, 19 pass, 0 fail, exit 0 (verbatim above) |
| `pnpm --filter @moonwitness/aigateway test` (repo root), after the change | 82 tests, 82 pass, 0 fail, exit 0, `duration_ms 441.4049` (59 existing + 23 M21-07) |
| `pnpm --filter @moonwitness/aigateway typecheck` (repo root) | `tsc --noEmit`, no diagnostics, exit 0 |
| `pnpm exec tsc -p test/tsconfig.json --noEmit` (`apps/aigateway`) | exit 2 with `TS6305` for the referenced, unbuilt `dist/*.d.ts` of `source-guard` and `review-inbox`; the same errors appear for the pre-existing `m21-04`/`m21-05` tests, so this is a build-order artifact of running the test project directly, not a diagnostic on this file. Not used as evidence. |
| `pnpm exec eslint apps/aigateway/test/m21-07-adversarial.test.ts` (repo root) | no output, exit 0 |
| `git rev-parse HEAD` / `git status --porcelain -- apps/aigateway docs/audit/M21-07-adversarial-denial.md` (repo root), after the work | HEAD unchanged at `788fcab`; exactly `?? apps/aigateway/test/m21-07-adversarial.test.ts` and this report |

## Security, rights and privacy notes

- **Fail-closed gates, unchanged.** The suite imports the committed gates without patching them. Roles and scopes are recorded but never authorize (asserted by deep equality against an anonymous requester); widened scopes fail exact-string matching; ACLs for other principals fail.
- **No bytes, URL or text in refusals.** Shared helpers assert the absence of `body`, `data`, `text`, `snippet`, `content`, `url`, `host`, `sourceLocator`, `payloadSummary`, `note`, `decisions`, `suggestion`, `passage`, `candidate`, `arguments` and `bytes`, plus the synthetic canaries and hostnames, in every refusal of every gate and in the composed refusal.
- **Fixed refusal field lists.** The `recorded` test asserts exact key sets: retrieval `{authorized, reason, sourceId}`, guard `{admitted, contentTrust, evaluatedAt, policyVersion, reason, sourceId}`, review `{allowed, evaluatedAt, policyVersion, reason, suggestionId}`, composed `{cleared, reasonCode, stage}`. No record id, audit id or storage timestamp is returned.
- **No persistence, no telemetry.** Module namespaces expose no store/persist/record/audit/telemetry/log/queue/database export. "Recorded" here is a returned, deterministic value; the suite makes no logging or retention claim. Clock values are the caller's `evaluatedAt`, never a wall clock.
- **Human approval is structural.** No approval, AI approval (declared or `agent:`-shaped), self-approval and duplicate/replayed decisions are all refused; an untrusted-source tool call is refused even when allow-listed; prompt-override and exfiltration-adjacent passages never reach the composed result; egress is exact-host `https` only.
- **No real data.** All fixtures are synthetic: reserved example hostnames (`fixture.example`, `not-allowed.example`, `evil.example`), opaque ids and canary strings. No witness, private source, AI output, secret, environment value or production record was read or written.
- **No ambient state or side effects.** No network, filesystem, database, provider or clock access in test or gate. No route, queue, notification or canonical write exists.
- **Rights.** No rights, consent, publication or review decision is granted, stored or applied by this task; the suite only evaluates returned descriptors.

## Defects and gaps observed (not patched)

No defect was found in the three committed gates: every adversarial input produced the documented stable denial and no payload. Two integration gaps were observed and are recorded rather than fixed, because the task forbids editing the gates and the gaps are already known prototype limits (M21-03/04/05 audits):

1. **Approval is not bound to bytes by any gate.** The gate outputs share no binding token; the approval's `sourceId` and the retrieval/guard `sourceId` are independent. A pairing of approval-for-alpha with a public, cleared beta passes both gates; only the test adapter's equality check refuses it. Owner of a future integration: M21-07 follow-up / model-context pipeline owner.
2. **No inbox membership store.** `evaluateReviewInbox` maps requests and cannot know whether a suggestion was ever enqueued; a fully valid, human-approved suggestion id absent from the batch is allowed. The suite records this as a limitation and asserts the absence of persistence, rather than claiming a membership denial. Same owner.

Neither gap produces bytes without a human approval, a cleared source and a benign passage; both are reported as limitations, not as acceptance evidence.

## Limitations

- **In-process only.** The suite calls pure functions. There is no HTTP route, server handler, provider call, model context, queue or FFI boundary; no transport-level authentication or rate limiting is tested.
- **No persistence or audit log.** Refusals are returned values. Nothing is written, retained, correlated, alerted or queryable; "recorded" cannot mean durable evidence here, and no telemetry claim is made.
- **No database, browser, Docker, CI or deployment evidence.** No schema, migration, UI, screenshot or runtime deployment was exercised. Configuration success is not deployment success.
- **Adapter-enforced binding.** `attemptPublication` is test-local wiring; its `CITATION_SOURCE_MISMATCH`, `REVIEW_SUGGESTION_MISMATCH` and stage ordering are not production behaviour. The two limitation tests make this explicit.
- **Declared provenance.** Reviewer `principalKind`, decision actors, grants and `origin: 'TRUSTED_OPERATOR'` are caller-supplied and unauthenticated. The AI-principal check is a prefix heuristic that cannot detect a mislabelled human.
- **Single exact role, single approver, caller-supplied history.** No quorum, delegation, revocation, conflict graph or store-backed duplicate detection; a caller that drops a prior decision from the array can replay it.
- **No membership, freshness or ordering.** Suggestion provenance in an inbox and timestamp ordering are not checked; only authorization/consent expiry uses the caller clock.
- **Heuristic content inspection.** Prompt-override, tool-call and exfiltration detection is pattern-based; novel phrasing is not covered, and admitted text is still untrusted data at later layers.
- **Not a formal security review.** No fuzzing, property-based testing, ReDoS or complexity audit; the suite is deterministic example-based evidence over small synthetic inputs.
- **Result SHA.** No commit was created by this session; the integrator records the result SHA after review.

## Rollback

Delete the two new files; no existing file, gate, manifest or dependency needs reverting:

1. `apps/aigateway/test/m21-07-adversarial.test.ts`
2. `docs/audit/M21-07-adversarial-denial.md`

## Report fields

- `task_id`: M21-07
- `baseline_sha`: `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef`
- `worker`: agent session
- `claimed_files`: `apps/aigateway/test/m21-07-adversarial.test.ts`, `docs/audit/M21-07-adversarial-denial.md`
- `actual_changed_files`: same two new files; no existing file modified
- `positive_test_and_output`: `pnpm exec tsx --test --test-name-pattern "M21-07 positive" test/m21-07-adversarial.test.ts` — 4/4 pass, 0 fail, exit 0 (verbatim above); full package `pnpm --filter @moonwitness/aigateway test` — 82/82 pass, 0 fail, exit 0
- `negative_test_and_output`: same command without the positive filter — 19/19 pass, 0 fail, exit 0 (verbatim above); all 23 tests pass in one run; every refusal asserted to carry a stable reason code and no bytes/URL/text
- `security_rights_privacy`: gates imported unmodified; deny-by-default composition; forged id/scope, other-principal ACL, widened scope, role/scope-only and replayed decisions refused; no approval, AI approval, self-approval, untrusted-source tool call, prompt override or disallowed egress passes; refusals carry only opaque ids, reason, policy version and caller timestamp; no persistence/telemetry; synthetic fixtures only; no rights, consent, canonical write or real data
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the two new files (above)
- `result_sha`: no commit created; HEAD remains `788fcab610bdd18cc89f4d0707f01bf3d30bf3ef` with the two untracked files on top. The integrator records the result SHA after review.
- `limitations`: in-process only, no HTTP route, no persistence/audit log/telemetry, no browser/DB/CI/deployment; approval-to-bytes binding and inbox membership are adapter-only or absent; declared provenance unauthenticated; heuristic content checks; single approver/role; caller-supplied history
- `next_eligible_task`: none assigned by this report; the integrator should choose from the remaining unchecked `TODO.md` leaves after M21-07 is reviewed.
