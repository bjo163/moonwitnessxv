# M18-08 — D08 release decision boundary

- **Task:** M18-08 (P1) — implement the D08 decision contract authorized by [ADR-0013](../decisions/ADR-0013-d08-release-authority.md), step 2 of the [D08 proposal](../design/D08-release-authority-proposal.md).
- **Owner authorization:** explicit, scoped answer "Otorisasi kontrak D08" (29 October 2026): one official task row, implementation and tests for the pure contract only — **no schema, migration, route or store**.
- **State:** contract and focused evidence complete at exact SHA `81d26386cf80f6b7138bd8be361fd0b4093eec2f` (contract commit `ed043605aad307c3f3e987e8aee0838b12168cb3`, test-script follow-up `81d2638`).
- **Date of observation:** 2026-10-29.
- **Baseline:** branch `dev`, HEAD `4e7b8a09d4d64bcad72da22ddcf4436d6c4de900` before this task.

## Baseline and worktree

- The worktree was already dirty on entry with other sessions' WIP (`apps/cockpit`, `apps/empire-web`, `docs/audit/screens`, `TODO.md` M43 section, `next-env.d.ts`). Those unrelated hunks were not edited, staged, restored or deleted. The only `TODO.md` change staged was the new M18-08 row; the M43 section stayed unstaged and uncommitted.
- Files added by this task: `packages/governance/{package.json,tsconfig.json,src/index.ts,test/d08-release-decision.test.mjs}`. `pnpm-lock.yaml` gained only the `packages/governance` importer; the generated re-sort of the `apps/empire-web` block was removed so the diff contains this task's change only.
- The pre-commit MoonUI token-purity gate passed on both commits (142 files scanned, 0 violations).
- No push, rebase, branch creation or deployment was performed.

## What was implemented

`@moonwitness/governance` is a new workspace package (Node `>=24`, ESM, composite `tsc -b`, no runtime dependency) with one module, `packages/governance/src/index.ts`. Its only import is `node:crypto`. There is no ORM, store, route, schema, migration, environment lookup or wall clock; the D08 store and any activation boundary remain unimplemented and unauthorized.

Two entry points:

- `decideRelease(request, context)` — approves one exact revision for one exact `public` scope, or refuses.
- `readDecision(decision, context)` — re-checks the sealed decision against fresh snapshots immediately before a projection read.

### Bound values

A decision binds `domain`, `releaseId`/`recordId`, immutable `revisionId`, `contentDigest`, `contentType`, `scope`, `classification`, projection `fields`, the reviewer principal, four opaque evidence refs (`rightsRef`, `consentRef`, `sourceRef`, `reviewRef`) and the M18-03 `manifestHash`. Changing any bound value yields a different decision hash or an explicit refusal; a new revision is a new request.

### Decision shape and sealing

The returned decision is deeply frozen and contains ids and opaque refs only — never content, source URLs, object keys or consent detail. `state` is the literal `APPROVED_WITHIN_SCOPE` and `activation` the literal `DISABLED`; the type system and the read path cannot produce `PUBLISHED` or an enabled projection. `decisionHash` is sha256 over sorted-key canonical JSON excluding that field, so any edit after the fact is detected as `DECISION_TAMPERED`.

The M18-03 `manifestHash` is compared as **integrity evidence only**. A matching hash is never treated as approval, and a mismatch is `INTEGRITY_MISMATCH` before any other gate.

### Ratified policy applied

| ADR-0013 position | Contract behaviour |
|---|---|
| One independent human reviewer | The deciding principal comes from `context.actor`, must be `kind: HUMAN`, verified (`verifiedAt` not in the future, `verificationRef` present), and must hold a live `RELEASE_REVIEWER` grant scoped to the domain and scope. Identity alone grants nothing: an empty grant list denies. |
| Self-review and conflicts excluded | Actor equal to `submittedBy` is `SELF_REVIEW`; actor listed in `conflictPrincipalRefs` or owning any evidence snapshot is `REVIEWER_CONFLICT`. |
| Rights/consent by opaque reference | `rightsRef`/`consentRef`/`sourceRef`/`reviewRef` resolve against caller-supplied snapshots bound to the same domain, record, revision and digest, the exact scope, `CLEARED` state and (consent) a future expiry. Missing, stale, withdrawn, pending, conflicting, unverifiable or expired evidence denies. |
| Restricted/unknown classification stays withheld | Only `UNCLASSIFIED` is decidable; `RESTRICTED` and `UNKNOWN` deny. |
| Public projections disabled by default | Fields must be a non-empty, duplicate-free subset of a caller-supplied per-domain allowlist; an empty allowlist denies every field. |
| Activation stays off | `activation` is `DISABLED` in decisions and read results; no code path publishes. |
| Revocation is release-bound | The M18-04 snapshot must name the same release and revision; `PENDING`, `WITHDRAWN`, `CORRECTED`, `TAKEDOWN` and `UNKNOWN` all deny, and any other release/revision is `RELEASE_STATE_UNKNOWN`. |
| One decision per exact revision | A prior decision with the same `requestId`, or the same release/revision/scope, is `REPLAY`. |

### Check order

`decideRelease` evaluates, in this fixed order: request shape and unknown keys → context shape, unknown keys and time → exact-revision/manifest integrity → reviewer identity → replay → self-review/conflict → reviewer grant (missing/revoked/expired/scope) → classification → scope and allowlist → withdrawal → rights, consent, source and review evidence → sealed decision.

`readDecision` evaluates: decision shape, unknown keys and hash → context shape and time → integrity binding → reviewer grant revalidation → allowlist → withdrawal → all four evidence refs → available result with `activation: 'DISABLED'`.

Refusals return only `{ approved: false, requestId, releaseId, reason }`; read refusals return only `{ available: false, releaseId, reason }`. No refusal carries an evidence ref, owner principal, content or source locator.

### Refusal vocabulary (stable codes)

Request/context: `REQUEST_INVALID`, `REQUEST_UNKNOWN_FIELD`, `REQUEST_FIELD_MISSING`, `REQUEST_FIELD_INVALID`, `REQUEST_TIMESTAMP_INVALID`, `CONTEXT_INVALID`, `CONTEXT_UNKNOWN_FIELD`, `CONTEXT_TIME_INVALID`.

Binding/authority: `DOMAIN_UNKNOWN`, `CONTENT_TYPE_UNKNOWN`, `CONTENT_DIGEST_INVALID`, `SCOPE_INVALID`, `SCOPE_MISMATCH`, `CLASSIFICATION_INVALID`, `CLASSIFICATION_RESTRICTED`, `CLASSIFICATION_UNKNOWN`, `INTEGRITY_MISMATCH`, `IDENTITY_UNVERIFIED`, `ACTOR_NOT_HUMAN`, `REVIEWER_NOT_GRANTED`, `REVIEWER_GRANT_REVOKED`, `REVIEWER_GRANT_EXPIRED`, `REVIEWER_SCOPE_MISMATCH`, `SELF_REVIEW`, `REVIEWER_CONFLICT`.

Evidence/withdrawal: `EVIDENCE_MISSING`, `EVIDENCE_AMBIGUOUS`, `EVIDENCE_KIND_MISMATCH`, `EVIDENCE_STALE`, `EVIDENCE_SCOPE_MISMATCH`, `EVIDENCE_PENDING`, `EVIDENCE_WITHDRAWN`, `EVIDENCE_CONFLICTING`, `EVIDENCE_UNVERIFIABLE`, `RIGHTS_MISSING`, `RIGHTS_WITHDRAWN`, `RIGHTS_SCOPE_MISMATCH`, `CONSENT_MISSING`, `CONSENT_WITHDRAWN`, `CONSENT_SCOPE_MISMATCH`, `CONSENT_EXPIRED`, `WITHDRAWAL_PENDING`, `RELEASE_WITHDRAWN`, `RELEASE_CORRECTED`, `RELEASE_TAKEDOWN`, `RELEASE_STATE_UNKNOWN`, `REPLAY`, `FIELDS_INVALID`, `FIELD_NOT_ALLOWLISTED`.

Read path: `DECISION_INVALID`, `DECISION_UNKNOWN_FIELD`, `DECISION_TAMPERED` (plus every re-checked code above).

### Case matrix from ADR-0013 step 2

| Required case | Test block | Observed refusal / result |
|---|---|---|
| Positive exact-revision release | "one verified human approves exactly one revision and cannot publish it" | `approved: true`, `APPROVED_WITHIN_SCOPE`, `DISABLED`, deterministic hash, frozen decision, readable |
| Stale digest | "a stale digest or a different manifest is never accepted"; read-time test | `INTEGRITY_MISMATCH`, `EVIDENCE_STALE` |
| Wrong scope | "a scope other than the requested exact scope is refused" | `SCOPE_INVALID`, `SCOPE_MISMATCH`, `REVIEWER_SCOPE_MISMATCH`, `RIGHTS_SCOPE_MISMATCH` |
| Missing rights/consent | "missing, withdrawn, pending, stale or unbound rights and consent deny" | `RIGHTS_MISSING`, `CONSENT_MISSING`, `RIGHTS_WITHDRAWN`, `CONSENT_WITHDRAWN`, `EVIDENCE_PENDING`, `EVIDENCE_CONFLICTING`, `EVIDENCE_UNVERIFIABLE`, `CONSENT_EXPIRED`, `EVIDENCE_STALE`, `EVIDENCE_AMBIGUOUS` |
| Self-review | "self-review and conflicts of interest cannot approve" | `SELF_REVIEW`, `REVIEWER_CONFLICT` |
| Wrong role | "only a verified human holding a live reviewer grant decides" | `ACTOR_NOT_HUMAN`, `REVIEWER_NOT_GRANTED`, `REVIEWER_GRANT_REVOKED`, `REVIEWER_GRANT_EXPIRED`, `REVIEWER_SCOPE_MISMATCH`, `IDENTITY_UNVERIFIED`, `CONTEXT_INVALID` (unknown role) |
| Replay | "the same request or the same exact release revision cannot be replayed" | `REPLAY` for same request id and for same release/revision/scope |
| Withdrawal | "pending, accepted and quarantined withdrawal states deny approval" | `WITHDRAWAL_PENDING`, `RELEASE_WITHDRAWN`, `RELEASE_CORRECTED`, `RELEASE_TAKEDOWN`, `RELEASE_STATE_UNKNOWN` |
| Unknown field | "unknown fields are denied at the request, context and decision boundary" | `REQUEST_UNKNOWN_FIELD`, `CONTEXT_UNKNOWN_FIELD`, `DECISION_UNKNOWN_FIELD` |
| Never publish | "a sealed decision cannot be altered or moved to PUBLISHED" | `DECISION_TAMPERED`, `DECISION_INVALID` for `PUBLISHED`/enabled state; frozen mutation throws `TypeError` |
| Read-time recheck | "readDecision re-checks evidence, grant, withdrawal and fields on every read" | `EVIDENCE_STALE`, `CONSENT_EXPIRED`, `RELEASE_WITHDRAWN`, `REVIEWER_GRANT_REVOKED`, `FIELD_NOT_ALLOWLISTED`, `INTEGRITY_MISMATCH` |
| Non-sensitive refusal | "no refusal or unavailable result echoes evidence refs, raw body or actor ids" | Canary refs, raw body and actor ids absent from ten refusal/read-refusal records |

## Evidence (verbatim)

`git rev-parse HEAD` = `81d26386cf80f6b7138bd8be361fd0b4093eec2f`; `git status --porcelain packages/governance pnpm-lock.yaml` printed nothing.

```
> @moonwitness/governance@1.0.0 test Z:\project\moonradio\packages\governance
> node --test "test/**/*.test.mjs"

✔ one verified human approves exactly one revision and cannot publish it (4.6054ms)
✔ a stale digest or a different manifest is never accepted (0.5924ms)
✔ a scope other than the requested exact scope is refused (0.489ms)
✔ missing, withdrawn, pending, stale or unbound rights and consent deny (0.8997ms)
✔ self-review and conflicts of interest cannot approve (0.3835ms)
✔ only a verified human holding a live reviewer grant decides (0.3419ms)
✔ the same request or the same exact release revision cannot be replayed (0.3174ms)
✔ pending, accepted and quarantined withdrawal states deny approval (0.311ms)
✔ unknown fields are denied at the request, context and decision boundary (0.3039ms)
✔ restricted and unknown classifications stay withheld (0.42ms)
✔ the projection allowlist denies by default (0.3406ms)
✔ a sealed decision cannot be altered or moved to PUBLISHED (0.75ms)
✔ readDecision re-checks evidence, grant, withdrawal and fields on every read (0.673ms)
✔ context time is caller-supplied and a future request is refused (0.1764ms)
✔ no refusal or unavailable result echoes evidence refs, raw body or actor ids (0.5926ms)
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 146.0129
```

```
> @moonwitness/governance@1.0.0 typecheck Z:\project\moonradio\packages\governance
> tsc --noEmit
```

`pnpm exec eslint packages/governance` printed nothing (exit 0). `pnpm --filter @moonwitness/governance build` (`tsc -b`) printed only the command banner (exit 0) and emitted `dist/index.js`, `dist/index.d.ts` and maps.

```
Scope: all 46 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
```

## Limits and non-claims

- **No content is public.** Decisions are eligibility records, not publication. `activation` is always `DISABLED`, no projection, route, cache or search consumer reads this contract, and no deployment or database was touched.
- **The context is caller-supplied and therefore not trusted by itself.** `actor`, `grants`, `evidence`, `withdrawal`, `integrity` and `allowlist` are snapshots a future authorized D08 store would load and verify. This contract proves the decision logic over those facts; it does **not** prove D00 identity, D01/D05/D06/D07 evidence, M18-04 state or the M18-03 manifest are genuine. Forging the context is exactly the risk a store, signature and D00/D12 grant ADR must close.
- **No D00/D12 reviewer-grant ADR exists.** `RELEASE_REVIEWER` here is a D12-style mandate label exercised by tests only; no real principal holds it, and adding a D00 reviewer role still requires a separate ADR.
- **No classification taxonomy is ratified**, so only `UNCLASSIFIED` is decidable and restricted content remains blocked.
- **No retention, export or deletion rule is invented.** No durable audit, decision ledger or evidence copy exists; decisions are in-process values that a caller may discard.
- **The M18-03 digest is integrity only.** Matching hashes never approve content, and the contract never parses a real manifest.
- M18-02, M18-05, M19-19, M20-04 and the M27 release leaves remain open: nothing here binds rights/consent evidence into a durable store (M18-02), invalidates caches (M18-05), or supplies a released public projection (M19-19). The D08 store, schema, migration, routes and activation boundary still require their own scoped task and owner review.

## Sources

- [ADR-0013 — D08 release authority](../decisions/ADR-0013-d08-release-authority.md)
- [D08 release-authority proposal](../design/D08-release-authority-proposal.md)
- [M18-03 release manifest](M18-03-release-manifest.md)
- [M18-04 withdrawal/correction/takedown/appeal](M18-04-withdrawal-correction-takedown-appeal.md)
- [M20-02 role-scoped review queue](../decisions/M20-02-role-scoped-review-queue.md)
