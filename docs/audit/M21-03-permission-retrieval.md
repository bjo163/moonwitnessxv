# M21-03 — Prototype source-permission-aware retrieval

**Task:** M21-03 — "Prototype source-permission-aware retrieval, not open private files".
**Acceptance under test:** restricted bytes cannot reach an unauthorized model or user.
**State:** implementation and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. TODO.md was not modified.
**Worker:** agent session (one new module, one new test file, one export line, this report).
**Date of observation:** 2026-10-27 (local).
**baseline_sha:** `dfc65564760eda4ced596f661bda3f84c2d755e5` (branch `dev`, short `dfc6556`).

## Baseline and worktree

- Observed `dev` HEAD at start: `dfc65564760eda4ced596f661bda3f84c2d755e5`, matching the stated baseline. No commits were created.
- The worktree was already dirty on entry: `apps/cockpit`, `apps/dock`, `apps/headquarters`, `docs/audit/screens`, and untracked files. Those paths belong to another session's WIP; none were opened for write or modified.
- `apps/aigateway` was clean at start: the initial repository-wide `git status --porcelain` output contained no `apps/aigateway` path.
- Baseline verification of the package before the change: `pnpm test` — 6 tests, 6 pass, 0 fail, exit 0; `pnpm typecheck` — no diagnostics, exit 0.

## Method

A **pure permission gate** was added at the AI Gateway boundary. It is a standalone module with no imports, no network, no database, no filesystem, no environment lookup, no wall clock, and no dependency on `providers/`, `router.ts`, or `server.ts`. The caller supplies candidate descriptors, requester identity, grants, requested scope, and the evaluation timestamp. The gate returns one decision per candidate:

- `AuthorizedSourceDecision` — source id, visibility, rights status, source locator, and `body` **only** when the candidate carried bytes and every gate passed.
- `DeniedSourceDecision` — source id (or `null` when the id itself is missing) plus a stable `reason` code. The denial type has no `body`, `snippet`, `text`, `content` or `sourceLocator` field, and the implementation constructs decisions from a whitelist so extra input fields cannot leak through.

Deny-by-default is structural: authorization is the final return statement after every check; any missing, malformed, unknown, expired or mismatched input returns a denial.

### Rule order and reason codes

Checks run in this fixed order, so reason codes are deterministic:

| # | Rule | Result when it fails |
|---|---|---|
| 1 | Requester shape: non-empty `principalRef` and `requestedScope`, parseable ISO `evaluatedAt`, string arrays for roles/scopes, valid grant list/entries | `REQUEST_FIELD_MISSING`, `REQUEST_TIMESTAMP_INVALID`, `REQUEST_FIELD_INVALID` |
| 2 | Candidate shape: `id`, `ownerPrincipalRef`, `rightsScope`, `sourceLocator` non-empty; `visibility`/`rightsStatus` present; optional `consentExpiresAt`/`body` well-typed | `SOURCE_FIELD_MISSING`, `SOURCE_FIELD_INVALID`, `SOURCE_VISIBILITY_INVALID`, `SOURCE_RIGHTS_STATUS_INVALID`, `CONSENT_TIMESTAMP_INVALID` |
| 3 | `WITHDRAWN` never releases bytes | `SOURCE_WITHDRAWN` |
| 4 | `PRIVATE` never releases bytes, including to its owner or an admin | `SOURCE_PRIVATE` |
| 5 | `RESTRICTED` requires an explicit grant bound to this `sourceId`, this `principalRef`, the exact requested scope, and an unexpired `expiresAt` | `SOURCE_RESTRICTED_NO_GRANT`, `SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL`, `SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH`, `SOURCE_RESTRICTED_GRANT_EXPIRED` |
| 6 | `RIGHTS_UNKNOWN` never yields bytes | `RIGHTS_UNKNOWN` |
| 7 | `rightsScope` must cover the requested scope (exact string match) | `RIGHTS_SCOPE_MISMATCH` |
| 8 | Consent must exist, cover the requested scope, and be unexpired | `CONSENT_MISSING`, `CONSENT_SCOPE_MISMATCH`, `CONSENT_EXPIRED` |
| 9 | Otherwise authorize; include `body` only if present | authorized decision |

Policy notes:

- **Roles and scopes are recorded but never consulted.** The requester's `roles`/`scopes` are validated for shape only. Only a principal-bound source grant unlocks a `RESTRICTED` source, so a role alone cannot override source permission.
- **Ownership is not an authorization input in this prototype.** `ownerPrincipalRef` is required metadata; a `PRIVATE` source is denied even when the requester is its owner. This is deliberately stricter than a future owner-access policy.
- **Interpretation of "PRIVATE/RESTRICTED/WITHDRAWN never reach context":** `PRIVATE` and `WITHDRAWN` are never released by this module. `RESTRICTED` is default-denied and becomes releasable **only** through a matching explicit grant (which is why the task requires "an explicit grant is required for non-public sources"). No requester can obtain `RESTRICTED` bytes from visibility, role, scope or ownership alone.
- **Consent is required for every release, including `PUBLIC`.** The positive case is public, rights-cleared and consent-covered. This follows the M21-02 evidence rule that absent consent evidence is invalid; it is conservative and can be relaxed only by an accepted decision.
- **No wall clock.** Expiry is evaluated against the caller-provided `evaluatedAt`; the module never reads `Date.now()`.
- **Exact-string scope matching** for rights, consent, and grants. There is no wildcard, hierarchy, or prefix semantics.

## Files

- `apps/aigateway/src/retrieval.ts` — new, pure gate and types (`SourceCandidate`, `SourceGrant`, `RetrievalRequester`, `RetrievalDecision`, `RetrievalDenialReason`, `evaluateSourceCandidate`, `selectAuthorizedSources`, `MODEL_CONTEXT_SCOPE`, `RETRIEVAL_POLICY_VERSION`). No imports.
- `apps/aigateway/test/m21-03-permission-retrieval.test.ts` — new, 18 `tsx --test` / `node:test` tests with synthetic canary fixtures.
- `apps/aigateway/src/index.ts` — one line added: `export * from './retrieval.js'`. No provider, router, server, package manifest, route, schema, or config file was changed.
- `docs/audit/M21-03-permission-retrieval.md` — this report.

`git status --porcelain -- apps/aigateway` after the work shows exactly those three paths: `M apps/aigateway/src/index.ts` and the two untracked new files. No other tracked file was touched.

## Positive evidence

`pnpm exec tsx --test test/m21-03-permission-retrieval.test.ts`, run in `Z:\project\moonradio\apps\aigateway`, exit code **0**:

```
✔ M21-03 positive: cleared, consent-covered public source is authorized with body and locator (1.5583ms)
✔ M21-03 positive: RESTRICTED opens only through a matching principal and scope grant (0.1866ms)
✔ M21-03 negative: PRIVATE is denied even for its owner holding admin roles (0.1748ms)
✔ M21-03 negative: RESTRICTED without a grant is denied (0.0974ms)
✔ M21-03 negative: RESTRICTED grant issued to another principal is denied (0.1258ms)
✔ M21-03 negative: RESTRICTED grant for a different scope is denied (0.1098ms)
✔ M21-03 negative: expired RESTRICTED grant is denied (0.1219ms)
✔ M21-03 negative: RIGHTS_UNKNOWN never yields bytes (0.09ms)
✔ M21-03 negative: rights scope that does not cover the requested scope is denied (0.1006ms)
✔ M21-03 negative: missing consent scope is denied (0.1474ms)
✔ M21-03 negative: expired consent is denied (0.1211ms)
✔ M21-03 negative: consent scope that does not cover the requested scope is denied (0.096ms)
✔ M21-03 negative: WITHDRAWN is denied despite consent and a valid grant (0.0881ms)
✔ M21-03 negative: roles alone never override source permission (0.5754ms)
✔ M21-03 negative: malformed or missing source fields fail closed (0.1941ms)
✔ M21-03 negative: malformed requests deny every candidate (0.1696ms)
✔ M21-03 negative: no denial result carries source text across a mixed batch (0.1902ms)
✔ M21-03: selection is deterministic and preserves candidate order (0.153ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 240.7082
```

What the positive tests prove:

- A `PUBLIC`, `RIGHTS_EXACT_VERSION_CLEARED`, `rightsScope === 'model-context'`, consent-covered document returns `authorized: true` with the exact synthetic body, the exact `fixture://` locator, visibility and rights status.
- A `RESTRICTED` document returns bytes only with a grant matching `sourceId`, `principalRef`, requested scope and unexpired `expiresAt`.

## Negative evidence

Each negative case returns `authorized: false` with the named stable reason code, and the shared assertion checks that the denial has no `body`, `snippet`, `text`, `content` or `sourceLocator` key and that its JSON does not contain the synthetic canary or the string `SYNTHETIC-CANARY`.

| Scenario | Observed reason |
|---|---|
| `PRIVATE`, requester is owner and holds `admin` | `SOURCE_PRIVATE` |
| `RESTRICTED`, no grant | `SOURCE_RESTRICTED_NO_GRANT` |
| `RESTRICTED`, grant issued to a different principal | `SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL` |
| `RESTRICTED`, grant for a different scope | `SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH` |
| `RESTRICTED`, expired grant | `SOURCE_RESTRICTED_GRANT_EXPIRED` |
| `RIGHTS_UNKNOWN` with valid consent | `RIGHTS_UNKNOWN` |
| Rights scope does not cover requested scope | `RIGHTS_SCOPE_MISMATCH` |
| Consent scope `null` | `CONSENT_MISSING` |
| Consent expired before `evaluatedAt` | `CONSENT_EXPIRED` |
| Consent scope does not match requested scope | `CONSENT_SCOPE_MISMATCH` |
| `WITHDRAWN` with admin/reviewer roles, valid grant and valid consent | `SOURCE_WITHDRAWN` |
| Roles/scopes only, no grant, `RESTRICTED` | `SOURCE_RESTRICTED_NO_GRANT`; result is byte-identical to the anonymous requester's denial |
| Missing id / owner / visibility / rights status / rights scope / locator; unknown visibility or rights status; non-string body; non-object candidate | `SOURCE_FIELD_MISSING`, `SOURCE_VISIBILITY_INVALID`, `SOURCE_RIGHTS_STATUS_INVALID`, `SOURCE_FIELD_INVALID` |
| Missing principal / requested scope, invalid timestamp, non-array grants, malformed grant entry | `REQUEST_FIELD_MISSING`, `REQUEST_TIMESTAMP_INVALID`, `REQUEST_FIELD_INVALID` |
| Mixed batch of private, restricted, withdrawn, rights-unknown, no-consent and expired-consent candidates | all denied; no denial contains source text; candidate order preserved |

A determinism test runs `selectAuthorizedSources` twice on the same inputs and asserts deep equality and stable ordering.

## Commands and observed results

All commands were run locally on 2026-10-27. No network, model provider, database, Docker, or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `pnpm test` (`apps/aigateway`), before the change | 6 tests, 6 pass, 0 fail, exit 0 |
| `pnpm typecheck` (`apps/aigateway`), before the change | no diagnostics, exit 0 |
| `pnpm exec tsx --test test/m21-03-permission-retrieval.test.ts` (`apps/aigateway`) | 18 tests, 18 pass, 0 fail, exit 0, 240.7082 ms |
| `pnpm test` (`apps/aigateway`), after the change | 24 tests, 24 pass, 0 fail, exit 0, 354.0959 ms (6 existing + 18 M21-03) |
| `pnpm typecheck` (`apps/aigateway`), after the change | no diagnostics, exit 0 |
| `pnpm build` (`apps/aigateway`), to refresh declarations for the test tsconfig | `tsc -b` with no diagnostics, exit 0 |
| `pnpm exec tsc -p test/tsconfig.json --noEmit` (`apps/aigateway`) | no diagnostics, exit 0 (only after `pnpm build`; before the build it reports TS6305 because the referenced project output is stale, which is the existing composite-project build order, not a type error in the new code) |
| `pnpm exec eslint apps/aigateway/src/retrieval.ts apps/aigateway/test/m21-03-permission-retrieval.test.ts apps/aigateway/src/index.ts` (repo root) | no output, exit 0 |

The package test command is `tsx --test test/*.test.ts` and does not require env, network, or a database; the full 24-test suite ran successfully, so the focused command was not needed as a fallback.

## Security, rights and privacy notes

- **Fail-closed construction.** Denials are returned from a whitelist-built object; candidate fields such as an unexpected `snippet` are not copied into any decision.
- **No bytes in denials.** The test canary appears only in authorized results. All denial paths were checked for the canary and for body-like keys.
- **Withdrawal is terminal in this prototype.** `WITHDRAWN` is checked before rights, grants and consent, consistent with ADR-0003's right-to-withdraw rule.
- **Rights gate matches M07-04/M06-06 intent.** `RIGHTS_UNKNOWN` cannot yield bytes; only `RIGHTS_EXACT_VERSION_CLEARED` with a covering rights scope can.
- **Role escalation is impossible through this gate.** Roles and scopes never participate in the decision; only explicit grants do. This matches the M03-04 role hierarchy being an access model, not a source-rights override.
- **Consent is scope-bound.** A consent for another purpose does not release bytes, matching ADR-0003 and M21-02's scope-bound consent evidence.
- **No real data.** All fixtures are synthetic strings and `fixture://` locators. No witness, source, prompt, model output, secret, environment value, or production record was used or written.

## Explicit non-claims

- **Not an integrated retrieval pipeline.** The module is not called by `server.ts`, `router.ts`, providers, or any route. No endpoint or HTTP behavior was added or changed.
- **No model/provider call** occurred; no prompt was assembled and no inference was run.
- **No database, schema, migration, table, consent store, rights store, source registry, or ACL source** was touched or introduced.
- **Not wired into the AI Gateway process.** `src/index.ts` only re-exports the module; it does not invoke it.
- **No production data or deployment.** CI, Docker, and deployment success are not claimed.
- **No TODO or milestone closure.** M21-03 remains unchecked; the integrator must review the evidence.
- **No reviewer approval.** Reviewer is unassigned in this report.

## Limitations

- **Prototype, in-memory only.** The gate trusts caller-supplied descriptors, grants and timestamps. It does not query a real source registry, rights ledger, consent store, or identity provider.
- **No real ACL source.** `principalRef`, `ownerPrincipalRef`, grants and consent scopes are opaque fixture strings; no signature, issuer, provenance or decision-record verification exists.
- **Exact-string scopes.** Rights, consent and grant scopes must match `requestedScope` character-for-character. There is no hierarchy, wildcard, or normalization.
- **Coarse byte decision.** A source is admitted or denied as a whole; there is no field-level or passage-level redaction, and no content inspection for secrets or personal data inside an authorized body.
- **Denial metadata may itself be sensitive.** The denial exposes the opaque `sourceId` and a reason such as `SOURCE_PRIVATE` or `SOURCE_WITHDRAWN`. A real endpoint should decide whether reasons are returned to end users or only recorded in audit telemetry; that policy is not implemented here.
- **Ambient mutation is not prevented.** Types are `readonly`, but inputs are not frozen at runtime; a caller could mutate an object between calls. Determinism is proven for unchanged inputs.
- **Consent revocation propagation and grant administration are out of scope.** The gate reads the snapshot it is given; it does not listen for withdrawals.
- **Prompt injection, egress and tool permissions are out of scope.** They belong to M21-04.
- **No test of package-root import side effects.** `src/index.ts` remains the Fastify bootstrap and now also re-exports the gate; importing the built package root still starts the server by existing design. No consumer was changed to import it.

## Rollback

Delete the three new files:

1. `apps/aigateway/src/retrieval.ts`
2. `apps/aigateway/test/m21-03-permission-retrieval.test.ts`
3. `docs/audit/M21-03-permission-retrieval.md`

Then remove the single line `export * from './retrieval.js'` from `apps/aigateway/src/index.ts`. No schema, data, dependency, environment, route or provider change requires reverting.

## Report fields

- `task_id`: M21-03
- `baseline_sha`: `dfc65564760eda4ced596f661bda3f84c2d755e5`
- `worker`: agent session
- `claimed_files`: `apps/aigateway/src/retrieval.ts`, `apps/aigateway/test/m21-03-permission-retrieval.test.ts`, `apps/aigateway/src/index.ts`, `docs/audit/M21-03-permission-retrieval.md`
- `actual_changed_files`: same four paths; `apps/aigateway/src/index.ts` changed by one export line
- `positive_test_and_output`: `pnpm test` in `apps/aigateway` — 24/24 pass, 0 fail, exit 0; focused M21-03 file — 18/18 pass, 0 fail, exit 0
- `negative_test_and_output`: 15 denial tests covering 16 candidate/request scenarios with stable codes; every denial checked for zero source text; all pass in the same 18/18 run
- `security_rights_privacy`: deny-by-default; PRIVATE/WITHDRAWN never released; RESTRICTED only via principal/scope-bound grant; RIGHTS_UNKNOWN yields no bytes; consent scope/expiry enforced; roles never authorize; denials carry no bytes; synthetic fixtures only
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the three new files and the export line (above)
- `result_sha`: no commit created; worktree remains at `dfc6556` plus the uncommitted paths above
- `limitations`: prototype pure function, caller-supplied ACL/consent/clock, exact-string scopes, coarse byte decision, denial metadata policy undecided, not wired into any route/server path
- `next_eligible_task`: M21-04 — "Guard prompt injection, egress and tool permissions"
