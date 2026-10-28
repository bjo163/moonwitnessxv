# M17-05 — SHADOW editor contract and HQ workspace

## Evidence identity

- `task_id`: **M17-05** — Build SHADOW editor as HQ workspace on shared auth (P1/D4).
- `worker`: leaf implementation agent (single task, single changed-file claim).
- `baseline_sha`: `cc40c205070cdb68051b30a68276f3370a3bd4f1` (`git rev-parse HEAD`, branch `dev`). `HEAD` was still this SHA after the work; nothing was staged, committed, branched, pushed or rebased.
- `result_sha`: **left to the integrator** — this task's files are untracked in the worktree.
- Baseline worktree was already dirty from parallel sessions; the observed subset included `apps/cockpit/*`, `apps/dock/*` and `docs/audit/screens/*`, with `apps/headquarters/src/lib/monitor-copy.ts` untracked (the task brief also reported `.env.example`, `apps/arsy/*` and `packages/moonql*`). None of those paths were opened for writing; this task only added the five files below.
- Date: recorded at the baseline SHA above (session month 2026-10).

## Claimed and actual files

All five paths are new; no existing file was edited.

| File | Role |
|---|---|
| `apps/headquarters/src/lib/shadow-editor.ts` | Pure, import-free draft/revision permission contract |
| `apps/headquarters/src/app/(admin)/shadow/page.tsx` | New HQ route `/shadow`, server component, renders draft state through the contract only |
| `apps/headquarters/src/app/(admin)/shadow/locale-copy.ts` | `id`/`en` chrome catalog (ADR-0005 parity via `defineLocaleCatalog`) |
| `apps/headquarters/test/shadow-editor.test.ts` | Focused positive/negative/structural tests (12) |
| `docs/audit/M17-05-shadow-editor-contract.md` | This audit |

Final scoped `git status --short apps/headquarters` reported:

```text
?? apps/headquarters/src/app/(admin)/shadow/
?? apps/headquarters/src/lib/monitor-copy.ts        (pre-existing, untouched)
?? apps/headquarters/src/lib/shadow-editor.ts
?? apps/headquarters/test/shadow-editor.test.ts
```

No tracked HQ or Dock file was modified by this task.

## What the slice enforces

`shadow-editor.ts` has no imports (no Next, Hub client, database, clock, randomness or environment) and is a pure function over an immutable, caller-supplied store.

| Rule | Implementation |
|---|---|
| Only an authenticated human editor creates a private draft | `createDraft` requires `authenticated`, `kind: 'human'`, role in `SHADOW_AUTHOR_ROLES` (`editor`, M03-04). Anonymous, service-kind and reviewer/viewer callers are refused before input is inspected. |
| Draft ownership is explicit | Every draft records `ownerId`; the creator is the owner. Ownership is a record, not a re-derived role. |
| Revision permissions are explicit | Non-owner read requires a per-draft `read` grant; revise requires a `revise` grant written by the owner. `read` never implies `revise`. Grants do not bypass the role allow-list (`editor`/`reviewer`). |
| No grant, no access | A non-owner editor or reviewer without a grant is refused `not_owner_or_grantee`; a read-only grantee revising is refused `insufficient_grant`; a non-owner granting is refused `not_owner`. |
| Monotonic revisions, stale writes refused | Revisions are append-only; a write must carry `expectedRevision` equal to the current revision or it is refused `stale_revision` (older and future numbers both). New store, old store untouched. |
| Refusals carry nothing | `ShadowRefusal` is exactly `{ allowed: false, reason, draftId }`; `draftId` is the caller's own opaque handle. No body, owner identity, grant list or revision content. |
| Nothing becomes public | Draft `visibility` is the literal `'private'`. `authorizeDraft(..., 'publish')` always returns `publish_not_available` (before/after lookup, so it is not an existence oracle), `PUBLICATION_AVAILABLE` is `false`, and no publish function is exported. D08 keeps publication authority. |
| Workspace listing is filtered by the same decision | `describeWorkspace` includes only drafts `authorizeDraft(..., 'read')` allows, so the page cannot render a draft the contract refuses. |

HQ authorization remains server-side and borrowed: the page calls the existing `decideAccess`/`me()` boundary (`@/lib/authz`) with the contract's role allow-list, redirects anonymous callers to `/login?error=expired`, and renders the existing localized `AccessDenied` for `forbidden`/`unavailable`. The `(admin)` layout and middleware already gate the route; no second login, token or role table is introduced. ARSY remains the sole identity authority.

## Positive tests (observed)

Command (final run):

```text
pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/shadow-editor.test.ts
```

Observed output (final confirming run):

```text
✔ an authenticated human editor creates a private draft at revision 1 (1.1122ms)
✔ only an authenticated human editor may create: every other caller is refused before input (0.2042ms)
✔ the owner reads the current revision and revisions increase monotonically (0.3284ms)
✔ a write built on a stale or future revision is refused and changes nothing (0.1886ms)
✔ a non-owner needs an explicit grant; read never implies revise, and grants are per draft (0.3242ms)
✔ publish is refused for everyone and this module exposes no publication path (2.449ms)
✔ every refusal carries only an opaque id and a stable reason (0.2809ms)
✔ malformed drafts, revisions and grants are refused as invalid input (0.2118ms)
✔ the workspace summary lists only readable drafts and reports authoring honestly (0.238ms)
✔ the contract stays import-free and pure (4.3405ms)
✔ the HQ page renders through the contract only (0.5523ms)
✔ SHADOW copy has 1:1 en/id keys and every message is non-empty (0.2106ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 152.7034
```

Positive flows proven: editor creates revision 1 owned by it; owner reads and revises 1 -> 2 -> 3 with append-only numbering; owner grants `read` then `revise` to a reviewer, who reads and produces revision 2 (author recorded); workspace summary shows the draft only to owner and grantee.

## Negative tests (observed, same suite)

- anonymous, service-kind, `viewer` and `reviewer` create attempts refused (`unauthenticated`, `not_human`, `role_not_permitted`, `role_not_permitted`) with no store written;
- non-owner without a grant cannot read or revise;
- read-only grantee cannot revise (`insufficient_grant`), non-owner cannot grant (`not_owner`), an explicit grant to a `viewer` still fails `role_not_permitted`;
- grant on draft A opens only A; a second draft B stays unreadable to the grantee and to A's owner (`not_owner_or_grantee`);
- stale (`1`, `99`) and malformed (`0`, `1.5`, `'2'`, `null`, `undefined`) expected revisions refused; store revision count unchanged;
- publish is `publish_not_available` for owner, non-owner, reviewer, unknown draft; anonymous publish is `unauthenticated`; no publish export exists;
- malformed draft ids/bodies (short, padded, over-long, non-string, blank, over-limit) and grants (blank, owner, unknown permission, `__proto__`) refused `invalid_input` with no grant written;
- every refusal asserted to have exactly `allowed`/`draftId`/`reason` keys and to contain no draft body, owner id or credential shape.

## Commands actually run and observed results

Working directory `Z:\project\moonradio` throughout.

1. `git rev-parse HEAD && git status --short | head -50 && git branch --show-current` — observed `cc40c205070cdb68051b30a68276f3370a3bd4f1`, branch `dev`, and pre-existing modifications across cockpit/dock/docs screens (parallel sessions).
2. `find apps/headquarters -path ./node_modules -prune -o -path ./.next -prune -o -type f -print` — listed the HQ app tree; no `shadow` route existed.
3. `cat apps/headquarters/package.json`, `ls docs/decisions/`, `ls apps/headquarters/test/` — confirmed the HQ scripts (`typecheck` = `tsc --noEmit`), ADR indexes and the existing test style.
4. `cat apps/headquarters/tsconfig.json`, `cat eslint.config.mjs`, `sed -n '85,275p' packages/eslint-config/src/index.js` — confirmed `@/*` path alias, strict TS and the central lint rules (type-checked, `consistent-type-imports`, `no-floating-promises`).
5. `grep -n "M17-05\|M17-03" TODO.md` and `sed -n '414,424p' TODO.md` — M17-03 closed, M17-05 open with the D07 blocker note; M17-06 depends on M17-05.
6. `grep -rn -i "shadow" apps/headquarters/src` and `ls docs/audit/ | grep -i "M17-05"` — only login/shell visual names; the prior blocker audit exists.
7. `cat apps/headquarters/next.config.mjs && ls apps/headquarters/src/app/`, `ls node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/`, `sed -n '1,80p' .../page.md` — confirmed Next `16.4.3` and the file-convention page shape used.
8. Additional read-only inspections: `cat apps/headquarters/src/data/queries/session.ts` and `sed -n '1,60p' src/lib/env.ts` (session shape, server-only Hub URL); `grep -rn "defineLocaleCatalog" packages/core/src` plus `sed -n '1,60p' packages/core/src/locale.ts` (catalog parity helper); `cat packages/moonui/src/index.ts` and `grep -n "BadgeTone\|export function Badge\|function Panel\|function PageHeader\|interface DataTableProps" packages/moonui/src/{layout,data}.tsx` plus `grep -n "export function Alert"` (available primitives and their exact props); `cat package.json` and `grep -rn "headquarters/test" --include=... .` (root test script enumerates HQ suites explicitly, so the new suite is not yet in `pnpm verify`).
9. `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/shadow-editor.test.ts` (first run) — 12 tests, 12 pass, 0 fail.
10. `pnpm --filter @moonwitness/headquarters typecheck` (first run) — **failed** with `test/shadow-editor.test.ts(289,21): error TS2345 ... 'ShadowDecision' is not assignable to parameter of type 'ShadowRefusal'`. Fixed by narrowing through `expectRefusal`, not by weakening the assertion.
11. `pnpm --filter @moonwitness/headquarters typecheck` (second run) — `tsc --noEmit` completed with no diagnostics (exit 0).
12. Focused test command re-run after the fix — 12 tests, 12 pass, 0 fail (`duration_ms 248.65`).
13. `pnpm exec eslint apps/headquarters/src/lib/shadow-editor.ts "apps/headquarters/src/app/(admin)/shadow/page.tsx" "apps/headquarters/src/app/(admin)/shadow/locale-copy.ts" apps/headquarters/test/shadow-editor.test.ts` — no output (no errors or warnings), exit 0.
14. Focused test command confirming run (output quoted above) — 12 tests, 12 pass, 0 fail (`duration_ms 152.70`).
15. `git status --short apps/headquarters docs/audit && git rev-parse HEAD` — only the new untracked paths above plus pre-existing dirty screens; `HEAD` unchanged at the baseline SHA.
16. `git status --short apps/headquarters/src/lib/shadow-editor.ts "apps/headquarters/src/app/(admin)/shadow" apps/headquarters/test/shadow-editor.test.ts docs/audit/M17-05-shadow-editor-contract.md && git rev-parse HEAD` (final check after writing this audit) — observed exactly the four untracked delivery paths (`??`) and `cc40c205070cdb68051b30a68276f3370a3bd4f1`; nothing staged, committed or modified.

No build, dev server, browser, database, Docker, deployment, `pnpm verify` or production check was run, and none is claimed.

## Security, rights and privacy

- No secret, environment value, credential, witness material or private source content was read into or written by this task. Test bodies and identities are visibly synthetic.
- No second identity authority, session, token, role table, SQL owner, migration, Hub call or model catalog was added. ARSY identity and the HQ server-side ACL are reused unchanged.
- Privilege checks are server-side; hidden UI is not relied on. The role allow-list is the canonical `editor`/`reviewer` from M03-04; publication stays with D08.
- The page shows only the signed-in account's display name and role, its own (empty) readable draft list, and the public rule table. No email, token or other user's identity is rendered.
- Locale: new `id`/`en` catalog with 1:1 keys; machine values (roles, reason codes, draft ids, `shadow-editor.ts` path) stay untranslated.

## Rollback

Delete the four new code/test files (and this audit). There is no migration, schema, config, route registration, environment variable or stored data to reverse; the page disappears when its directory is removed. Nothing was staged or committed, so no Git history operation is required.

## Limitations and evidence status

- **In-process contract only.** There is no D07 store, database persistence, server action or request-to-request memory; the page passes `EMPTY_SHADOW_STORE`, so it always renders zero drafts. Draft creation, editing and saving remain closed and are stated as closed in the UI copy.
- **The prior blocker audit still applies to durable drafts.** `docs/audit/M17-05-shadow-editor-blocker-2026-10-28.md` required a D07 owner, durable store and revision-aware ACL at the owning API. This slice supplies the revision/ownership policy, its tests and the HQ shell; it does not supply D07 persistence or enforcement at the owning API. The integrator must decide whether the leaf acceptance is met at contract level or stays open pending D07; this audit does not self-approve either.
- **Route mount is by Next file convention only.** No browser, dev server or `next build` was run, so rendering, keyboard behavior, responsive layout and the real middleware redirect were not observed. The structural test pins the page's server-component shape and its contract-only wiring.
- **No revocation API yet.** Re-granting to the same identity replaces the previous permission (including a downgrade), but there is no explicit revoke call and no transfer-of-ownership operation.
- **`admin` is not implicitly admitted.** The workspace allow-list is `editor`/`reviewer`, so an administrative account sees the localized `forbidden` denial rather than a widened role. Widening it would be a role decision (M03-04) for the owner, not a leaf inference.
- **Grant rows carry no role snapshot.** Grantee eligibility is evaluated from the caller's current ARSY role at access time; a later role change is therefore honoured, and a stale grant cannot widen access on its own.
- **Draft ids are treated as opaque handles.** Refusals distinguish `draft_not_found` from `not_owner_or_grantee`, so a party who already holds an unguessable draft id can learn whether it exists. Issuing unguessable ids and never publishing draft ids remains a requirement for the future D07 implementation.
- **Root test list not edited.** To include this suite in `pnpm verify`, the integrator must append `../../apps/headquarters/test/shadow-editor.test.ts` to the `tsx --test` list inside the root `test` script in `package.json`. That shared file was intentionally left untouched in this parallel-session worktree.
- **No navigation entry.** `shell-copy.ts` was not edited; `/shadow` is reachable directly and through the existing session middleware. "Story Forge" still points at `/models`.
- **Reviewer:** unassigned. A human reviewer must inspect the diff; a green focused suite is not a human review.

## Next eligible task

M17-06 depends on M17-05 and stays blocked until the integrator accepts this leaf (or records what remains). No other M17 leaf is open (M17-01 through M17-04 are closed). If M17-05 remains open pending D07, the integrator should select work from another milestone rather than starting M17-06 early.
