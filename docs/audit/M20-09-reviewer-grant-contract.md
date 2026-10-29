# M20-09 — D12 reviewer-grant contract audit

**Status: CLOSED at exact implementation SHA `0ef577e52d2c7fb094fc94b336675f5b3e288180`.** Baseline `5f701d3`. Evidence below was observed locally; no push, deployment, database or live Hub was exercised.

## Scope and artifacts

- Package [`packages/review-grants`](../../packages/review-grants) — pure D12 contract implementing [ADR-0015](../decisions/ADR-0015-d00-d12-reviewer-grants.md) and the [M20-08 design](../design/M20-08-reviewer-grant-store-design.md).
- `git diff --numstat 5f701d3..9ceec92` (observed):
  - `packages/review-grants/package.json` 24/0
  - `packages/review-grants/src/index.ts` 824/0
  - `packages/review-grants/test/review-grants.test.mjs` 504/0
  - `packages/review-grants/tsconfig.json` 9/0
  - `pnpm-lock.yaml` 9/0 (importer entry only)
- Commits: `698ffbb` (package), `9ceec92` (pending TTL left to the authorized caller) and `0ef577e` (supersession applies only once the replacement is active; cyclic supersession chains rejected). Final `git diff --numstat 5f701d3..0ef577e` adds 850 lines of source and 556 lines of tests; no schema, migration, table, route, endpoint, SDK, UI, grant or principal.

## Implemented contract

- Closed vocabularies for kinds (`author`/`approve`), states, actions, outcomes and lanes; V10 mapping `D05.RESEARCH→D05_RESEARCH/public`, `D06.WITNESS→D06_WITNESS/public`, `D07.STORY→D07_STORY/public`, with `D01.TEXT` and `D08.RIGHTS` unmapped.
- `requestGrant` issues `author` directly as `ACTIVE` and `approve` as `PENDING_CONFIRMATION`; `confirmGrant` requires a second, distinct active admin and a non-expired pending request; `revokeGrant` accepts the issuer, any active admin, or the explicit `ACCOUNT_CONTROL` process; `deriveGrantState` is derived from the record, supersession links, server time and caller-supplied pending TTL.
- Supersession is explicit and requires an `ACTIVE` predecessor; a second live grant in the same slot is refused. A predecessor becomes `SUPERSEDED` only when the replacement itself derives as `ACTIVE`, so an unconfirmed `approve` replacement never revokes the authority it intends to replace (T10b). Cyclic supersession chains invalidate the store. Live `author` and `approve` in one lane conflict. Guest, machine, inactive, unnamed and unknown accounts are refused as grantees; admins cannot grant themselves.
- Strict unknown-key rejection on accounts, grants, events, context, operations and loader input; duplicate refs and inconsistent rows invalidate the store (V15, T21).
- `loadReviewerGrants` is read-only and fail-closed: only live `approve` grants for the verified principal, mapped through V10 to the exact requested domain/scope, returned in the D08 `ReviewerGrant` shape with `role: 'RELEASE_REVIEWER'`, `grantedAt` at confirmation and `revokedAt: null`. Pending, expired, revoked, superseded, unmapped or non-approval records yield no authority. Caller-supplied `grants` and legacy `reviewer` fields are refused.

## Checks observed

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm --filter @moonwitness/review-grants test` | 23 tests, 23 pass, 0 fail (T1–T21, T10b and a pending-loader/malformed-input case) |
| Typecheck | `pnpm --filter @moonwitness/review-grants typecheck` | clean (`tsc --noEmit`) |
| Build | `pnpm --filter @moonwitness/review-grants build` | clean (`tsc -b`) |
| Lint | `pnpm exec eslint packages/review-grants/src packages/review-grants/test` | clean after removing one unused helper |
| Install | `pnpm install --frozen-lockfile` | 47 workspace projects, lockfile up to date |

Negative coverage includes self-confirmation, self-assignment, guest/machine/inactive/unnamed/unknown grantees, unknown kind/lane/wildcard, missing or past expiry, opposite-kind conflict, duplicate live grant, pending TTL expiry, non-admin confirmation/revocation, expired and revoked loader refusals, caller-supplied grants, cross-lane scope widening, the accepted residual two-account risk and an inconsistent store. T10b additionally proves that an unconfirmed approval replacement leaves the predecessor live and that confirmation then swaps authority atomically. No refusal echoes the injected canary reviewer string.

## Non-claims and limitations

- This is a **contract only**. No durable grant store, storage adapter, schema, migration, route, admin surface, retention rule, account-linkage mechanism, D08 integration or activation was implemented. No grant or principal was created or assigned.
- The actor, account rows, stored grants, server time and pending TTL remain caller-supplied server-side snapshots. The module enforces the contract over them; it cannot prove that a future adapter loads them atomically or from the canonical store.
- `ACCOUNT_CONTROL` revocation trusts the server-supplied actor ref; the future store must authenticate that process.
- The accepted ADR-0015 §9 residual risk (two accounts controlled by one human are not linked) is asserted by T19 as documented risk, not solved.
- No real D00 account, database, Hub, route or deployment was exercised. Passing tests are not production proof.

## Rollback

Revert `0ef577e`, `9ceec92` and `698ffbb` (package + lockfile importer only). No schema, data, route or deployment depends on them.
