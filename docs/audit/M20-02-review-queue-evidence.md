# M20-02 — Evidence: Role-scoped review queue and work-item lifecycle design

## Packet report

| Field | Value |
|---|---|
| `task_id` | M20-02 |
| `baseline_sha` | `00b006443da8a1b9408226ed776e15090f0e640b` (task lease); tree re-read at `eef0c54a057c884c04aa8a9a9efa76b0b9e54f13` and re-verified at `b24bedd5f2e457039ef18ceff39e08f61636077d` after parallel sessions advanced `dev` |
| `worker` | Original M20-02 design draft by the task owner; integrator revalidation and predicate fixture by `/root` |
| `claimed_files` | `docs/decisions/M20-02-role-scoped-review-queue.md`, `docs/audit/M20-02-review-queue-evidence.md`; integrator added `test/planning/review-queue-predicate.test.mjs` as a design-only reference check |
| `actual_changed_files` | those three paths only; no source, schema, migration, package manifest, TODO row, screenshot or other audit changed |
| `positive_test_and_output` | `pnpm exec node --test test/planning/review-queue-predicate.test.mjs` → 4 passed, 0 failed: disjoint scoped human allowed; self, overlap, missing scope, machine, guest, delegated grant, stale digest/version and admin without scope denied. This fixture is a reference check of the written predicate, not application code. `pnpm --filter @moonwitness/arsy exec tsx --test test/mizan.test.ts` → 7 passed, 0 failed; M14-01 asserts self-approval returns 403/four-eyes. The test booted MoonQL's in-memory engine; `DATABASE_URL` was not set in the shell. |
| `negative_test_and_output` | `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/hq-authz-guard.test.ts` → 23 passed, 0 failed: anonymous redirect, non-admin forbidden, unavailable on Hub 503/unreachable, unpublished endpoint/rule forbidden, and no denial carries a credential or identity. The M14 suite also covers guest and self-approval refusals. |
| `security_rights_privacy` | No rights or publication decision was made. Restricted classification, approval-within-scope, quorum, retention and withdrawal/appeal are registered `BLOCKED-ON-D08`; scope grants, principal linkage and any reviewer login role are `NEEDS_ADR`. No HQ database, second identity, second Hub or second approval engine is proposed. No private source, witness body, token, cookie, credential or personal data appears in either artifact. |
| `reviewer` | Independent M20-02 review is in progress; no TODO closure until exact-result review is recorded. |
| `rollback` | Delete the two design/audit files and the reference predicate test. They change no runtime behaviour and no stored data. |
| `result_sha` | pending scoped integration commit on `dev` |
| `limitations` | Read/static analysis plus the existing test suites only. The queue, its tables and endpoints do not exist, so no live hub, database, browser or Docker run could exercise them; the predicate run evaluates the written rule, not an implementation. M20-01's N1/N3 text is stale relative to the current tree (see F1). No TypeScript changed, so no typecheck was required. `MASTER_DESIGN.md` has no Headquarters/100CENTER section to cite (25 lines total). |
| `next_eligible_task` | After integrator closure: M20-03 and M20-04. Any proposed implementation work in §9 must first be registered as a TODO leaf. Restricted decisions remain gated by D08 and the §10 decisions. |

## 1. Prerequisites and baseline

- M20-01 is closed in TODO (row 495) at audit SHA `d6b8847f7aae168e4dcb4208c2c8d3acc6c6715e`; its baseline was `76ecdc5` (`docs/audit/M20-01-hq-model-ui-route-guards-ops.md:4`).
- M18-01 is closed and specifies the single publication path `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`, with D08 enforcement still unimplemented (`docs/audit/M18-01-single-publication-state-machine.md:12-26,37`).
- The task lease SHA was `00b0064`. During this task parallel sessions committed `eef0c54` (M28-05) and later `b24bedd` (M40-06). Re-read at both: `git diff --name-only 00b0064..b24bedd -- apps/headquarters packages/moonql packages/moonql-auth packages/moonql-research packages/moonql-ops packages/moonql-apikeys` printed nothing, so every cited line below is valid at all three SHAs.
- TODO row 496 (`M20-02`) remains unchecked pending exact-result commit and independent review.

## 2. Method and evidence basis

Read-only inspection of the current tree, plus two existing focused test suites. Every current-behaviour statement in the design carries a `file:line` citation. The design does not claim any runtime evidence for the queue itself.

Inspected areas:

| Area | Files |
|---|---|
| HQ route guards, denial view, actions | `apps/headquarters/src/lib/authz.ts`, `src/lib/denial-copy.ts`, `src/lib/session-auth.mjs`, `src/middleware.ts`, `src/ui/widgets/AccessDenied.tsx`, `src/data/actions.ts`, `(admin)/**` |
| Hub ACL and REST enforcement | `packages/moonql/src/acl.ts`, `rest.ts`, `model.ts` |
| Identity and machine principals | `packages/moonql-auth/src/index.ts`, `packages/moonql-apikeys/src/index.ts` |
| Existing four-eyes machine | `packages/moonql-research/src/review.ts`, `review-subsystem.ts`, `common.ts`, `apps/arsy/test/mizan.test.ts` |
| Audit reality | `packages/moonql-ops/src/index.ts` |
| Rights vocabulary | `packages/moonql-corpus/src/index.ts`, `docs/decisions/M07-04-rights-veto-policy.md`, ADR-0003 |
| Boundaries | `BLUEPRINT.md`, `docs/architecture/APPS.md`, `SECURITY.md`, `docs/architecture/SECURITY.md`, `docs/architecture/LUMEN.md` |

## 3. Findings and conflicts

### F1 — M20-01's N1/N3 handoff is stale; UI-F13 already changed the page half

M20-01 recorded N1 (ungated write forms) and N3 (uncaught 403 crash) at `76ecdc5` (`docs/audit/M20-01-hq-model-ui-route-guards-ops.md:48,50`). Commit `fe21e6d` ("decide private-route access on the server", 2026-10-27) added `guardModel`/`guardView`/`guardEndpoint` and applied them to the pages:

- create page guards `create` before fetching relation options: `apps/headquarters/src/app/(admin)/models/[model]/new/page.tsx:27-30`;
- edit page guards `get` before fetching the row, computes `canUpdate` and hides the form otherwise: `.../[id]/page.tsx:28-43,67`;
- list page guards `list`: `.../[model]/page.tsx:34-39`;
- `/system` and `/` guard `/ops/dashboard` before calling `dashboard()`: `apps/headquarters/src/app/(admin)/system/page.tsx:14-20`, `(admin)/page.tsx:116-120`.

So the TODO row's statement that N1/N3 are open inputs to M20-02/M20-07 is no longer accurate at HEAD. The **action-level** half of N1 remains: `createRecordAction`/`updateRecordAction`/`deleteRecordAction` call the SDK directly and redirect the hub's `errorMessage` into a query parameter (`apps/headquarters/src/data/actions.ts:44-79,50,64,75`), rendered as an `Alert` (`new/page.tsx:48`, `[id]/page.tsx:66`). The design treats that as a denial-UX defect, not an authorization hole, because the hub still decides.

### F2 — N2 remains open

`/models` still renders the full registry to any authenticated role with no guard (`apps/headquarters/src/app/(admin)/models/page.tsx:5-18`), and `_schema` itself defaults to `auth` (`packages/moonql/src/rest.ts:438-441`). The queue design avoids repeating this in its own page but does not fix the registry; that stays with M20-07's executed matrix.

### F3 — The role vocabulary is not implemented

M03-04 ratifies `anonymous` / `user` / `editor`+`reviewer` / `admin` (`docs/decisions/M03-04-tenant-role-boundaries.md:18-25`), but `auth_users.role` accepts only `admin`, `user`, `guest` (`packages/moonql-auth/src/index.ts:43`). There is no `reviewer` login role to hang a role-scoped queue on. The design therefore separates a **D12 scope mandate** from the login role and registers the grant model as `NEEDS_ADR`; it does not widen the enum.

### F4 — M14's four-eyes is account-level only, and its read/decision ACLs are asymmetric

`reviewDecide` refuses `submittedByRef === actor.id` (`packages/moonql-research/src/review-subsystem.ts:753-755`; test `apps/arsy/test/mizan.test.ts:245-251`), but:

- the review list/detail endpoints are `ADMIN_ONLY` (`:603-606,637-640`), while `decide` is `'auth'` (`:736-739`) and `humanActor` accepts any named `user`/`admin` (`packages/moonql-research/src/common.ts:74-89`);
- there is no scope model, so overlapping-scope accounts are indistinguishable from independent reviewers.

The queue is strictly tighter for restricted items than M14 today. The design does not retrofit M14; that is a follow-up decision.

### F5 — A machine principal can pass the current named-human check

`humanActor` checks the `auth_users` row by id, the display name and the role, and the caller's `user.roles` (`packages/moonql-research/src/common.ts:76-88`), but never inspects `user.meta.keyId`. The API-key resolver returns the **owner's** id with the key's own role list and `meta.keyId` (`packages/moonql-apikeys/src/index.ts:88-113,110`). An admin can create a key carrying `admin` (`:49-68`), and that key would resolve to the owner's display name and role. It can therefore satisfy the current `humanActor` check.

This is a code-read finding, not a live exploit; no request was made against a running hub. The design requires decision endpoints to reject any `meta.keyId` principal and to record `principalKind: 'human'` only for a session principal. M14 should receive the same check in a follow-up.

### F6 — The existing audit trail cannot be the decision evidence

`ops_audit` is written fire-and-forget with the comment "the 'who' is not on the bus, by design" (`packages/moonql-ops/src/index.ts:54-60`), has no actor column (`:70-81`), and is purged daily with a default 14-day retention (`:190-193`). The design uses an append-only task event as the evidence and leaves general audit attribution/retention to M20-05, consistent with its TODO acceptance ("No assumption existing async audit is immutable").

### F7 — Generic REST cannot safely own work items

`ADMIN_WRITE` covers writes only, not list/get (`packages/moonql/src/model.ts:30-41`; `SECURITY:2` warns exactly this). The generic `create` route has a role guard but no row predicate (`packages/moonql/src/rest.ts:226-244`), so it cannot bind `submittedByRef` from the session. The design closes the models (`rest: false`) and uses hand-written endpoints, mirroring M14's handler-only mutations.

### F8 — LUMEN's approval gate is an execution gate, not durable evidence

The adapter keeps approval records in an in-memory `Map` (`packages/lumen/src/adapters/approval-gate.ts:91`), binds arguments by SHA-256 and refuses machine self-approval, but it does not persist a cross-process decision trail. LUMEN is forbidden from becoming a second approval system (`docs/architecture/LUMEN.md:104-108,134-135`; `BLUEPRINT:110`). M40-08's handoff must therefore bind to a durable HQ/D12 work item; the design lists this as a follow-up, not an implemented integration.

### F9 — Documentation gap in MASTER_DESIGN

`MASTER_DESIGN.md` is 25 lines and has no Headquarters/100CENTER surface-semantics section; only ORBIT/SKYLINK/ECHOLOG/COCKPIT/DOCK are described. The design therefore relies on `BLUEPRINT`, `APPS.md`, MoonUI primitives and the existing `AccessDenied`/`denial-copy` pattern for HQ UI semantics. This is recorded as a limitation, not a decision.

## 4. Positive verification detail

### 4.1 Existing four-eyes enforcement (actual run)

Command:

```text
pnpm --filter @moonwitness/arsy exec tsx --test test/mizan.test.ts
```

Observed output (tail):

```text
✔ M14-01: named role-scoped draft/submitted/reviewed machine, no auto approval (1845.3547ms)
✔ M14-02: exact-SHA reviewer detail and counterevidence resolution (51.3322ms)
✔ M14-03: independent paired pilot recording, disagreement preserved (65.0501ms)
✔ M14-04: bounded MIZAN method, explicit criteria and explanation (37.9338ms)
✔ M14-05: rejection, revision and retraction preserve the immutable trail (21.4339ms)
✔ M14-06: wrong role, forged evidence and a concurrent approval race (23.6486ms)
✔ M14-07: release criteria stay fail-closed while publication is unavailable (18.5272ms)
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

The M14-01 case asserts the submitter gets `403` matching `/four eyes/i` on `decide` (`apps/arsy/test/mizan.test.ts:245-251`). This proves the existing per-account prohibition, which the design extends; it does not prove the new queue.

### 4.2 Design predicate evaluation (actual run, not application code)

The exact reference function and cases are maintained in `test/planning/review-queue-predicate.test.mjs`. Run it with:

```text
pnpm exec node --test test/planning/review-queue-predicate.test.mjs
```

At the integrator revalidation it reported 4 tests, 4 passed, 0 failed. The test encodes only clauses I1-I6 from §6; it is a design consistency check and cannot prove runtime enforcement.

The original draft's throwaway in-memory evaluation produced:

```text
A approves own research task         DENY_SELF
B (overlaps A on D08.RIGHTS)         DENY_OVERLAP
C (disjoint, holds research)         ALLOW
D (lacks research)                   DENY_SCOPE
B via API key                        DENY_MACHINE
E (grant issued by A)                DENY_DELEGATED
rights task: A                       DENY_SELF
rights task: B                       DENY_OVERLAP
rights task: C                       DENY_SCOPE
rights task: D                       DENY_OVERLAP
```

This shows the written rule rejects self, overlapping-scope, missing-scope, machine and submitter-delegated approvals, and allows only the disjoint required-scope human. It is a consistency check of the specification, not evidence that the hub enforces it.

## 5. Negative verification detail

### 5.1 Existing denial behaviour (actual run)

Command:

```text
pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/hq-authz-guard.test.ts
```

Observed output (tail):

```text
✔ a signed-in user without the role is denied forbidden for a model create (1.4595ms)
✔ an admin-only view rule and an admin-only endpoint rule both refuse a non-admin (1.4772ms)
✔ an operation the hub does not publish is refused even for an admin — the document is the gate (0.9804ms)
✔ an endpoint the hub does not publish is forbidden rather than guessed (1.234ms)
✔ a view or endpoint with no published rule is forbidden, not public by default (1.1091ms)
✔ a hub 503 is unavailable and explicitly not anonymous: the session is kept (1.9936ms)
✔ a thrown fetch (hub unreachable) is unavailable, not a sign-out (1.1484ms)
✔ only a hub 401 may read as anonymous: a hub 500 stays unavailable (0.6718ms)
✔ no denial — anonymous, forbidden or unavailable — carries a credential or an identity (2.2171ms)
✔ denial copy selects only the two stable codes and reflects nothing back (0.6595ms)
ℹ tests 23
ℹ pass 23
ℹ fail 0
```

This confirms the current HQ guard/denial behaviour that the queue page must reuse: 403 is a data-free localized denial, 503/unreachable is `unavailable`, and only a hub 401 is anonymous. It does not execute a queue route, because none exists.

### 5.2 Static checks

- Every path cited by the design exists; a shell `test -e` loop over 31 paths printed only `path check done`.
- The design file has 430 lines, zero code fences and zero trailing-whitespace lines (`grep -cP '[ \t]+$'` → 0).
- `git diff --name-only 00b0064..b24bedd -- apps/headquarters packages/moonql packages/moonql-auth packages/moonql-research packages/moonql-ops packages/moonql-apikeys` → empty, so the parallel commits did not invalidate any citation.
- `git status --porcelain` after writing shows only the two new `docs/decisions/M20-02-*` and `docs/audit/M20-02-*` files from this task; the pre-existing dirty screenshot/worktree files were left untouched.

## 6. Security, rights and privacy review

- **No rights decision was made.** The design does not decide which material is restricted, what `APPROVED_WITHIN_SCOPE` authorizes, whether a quorum is required, or how publication happens. All are `BLOCKED-ON-D08` (design §10). Text rights reuse the accepted M07-04 veto (`RIGHTS_EXACT_VERSION_CLEARED` only, `packages/moonql-corpus/src/index.ts:31-40`, `M07-04:10-15`) without extending it to other classes.
- **No publication path was added.** The state machine has no `PUBLISHED`; D08 remains the only publisher. This preserves ADR-0003 and M18-01 and avoids a second approval engine (`BLUEPRINT:110`).
- **No identity or data owner was added.** Scope grants reference `auth_users`; HQ gains no database, no role table and no SQL. The work-item tables, if later approved, stay in the MoonQL-owned schema under ADR-0002.
- **Privacy.** Evidence stores references and digests, not witness bodies, source text, credentials or personal data. Denial views carry no identity or token (`hq-authz-guard.test.ts`, "no denial … carries a credential or an identity").
- **New security finding.** F5 (API-key principals can satisfy the current `humanActor` check) is recorded for the queue implementation and an M14 follow-up. It was not exploited or tested live; the claim is from `humanActor` and the API-key resolver.
- **Residual risk stated.** Two accounts controlled by one human with disjoint grants are not detectable by D00 today; the design does not pretend otherwise and registers `NEEDS_ADR-D00-principal-linkage`.

## 7. What this does not prove

- That any queue route, table, scope grant or UI exists or works.
- That the hub currently enforces scope disjointness; only M14's account-level self-approval refusal is executed evidence.
- That N1/N3 are fully closed: N1's action-level denial UX and N2's registry disclosure remain, and N4 is untouched.
- That D08 has classified restricted material or authorized any publication.
- That an independent human reviewer has accepted this design; the integrator must do that.

## 8. Status

- Design: **READY FOR INTEGRATOR CLOSURE** after the design-only reference suite, reviewer, and exact-result commit are recorded.
- Implementation of restricted decisions: **BLOCKED-ON-D08** and the `NEEDS_ADR` items in design §10. No unregistered M20-02-L1 task exists; any hub/HQ implementation work must first be registered in TODO. Enabling real grants and decisions remains `NEEDS_ADR`, and any rights-gated approval remains D08-blocked.
- TODO row 496 is still unchecked. The result SHA is pending the scoped integration commit; no runtime implementation or deployment is claimed.
