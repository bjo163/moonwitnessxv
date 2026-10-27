# M40-08 — Human-Approval Handoff to Headquarters / 100CENTER Evidence

**Task ID:** `M40-08`
**Task Title:** Human-approval handoff to Headquarters / 100CENTER
**Baseline SHA:** `49ec20ec2b224bcb37c61d15de84aa494cead79e`
**Date:** 2026-10-27
**Worker:** AI Pair Programmer
**Reviewer:** Root Integrator
**Status:** CLOSED (`- [x]`) — ORBIT-side handoff boundary only (see §6 non-scope)

---

## 1. Summary of deliverables

Pursuant to [ADR-0004](../decisions/ADR-0004-empire-surfaces.md), [docs/architecture/ORBIT.md](../architecture/ORBIT.md), the [M20-02 review-queue design](../decisions/M20-02-role-scoped-review-queue.md), and [docs/tasks/M40/M40-08.md](../tasks/M40/M40-08.md):

1. **Handoff contract** ([`approval-handoff.ts`](../../apps/orbit/src/lib/handoff/approval-handoff.ts)):
   - `isApprovalRequired(task)` — true only for `status: 'APPROVAL_REQUIRED'` with a non-blank `action` **and** `requestedRole`.
   - `buildApprovalHandoff(task, { connectionStatus, reviewSurface })` — returns one of `NOT_REQUIRED`, `AWAITING_HUMAN_REVIEW`, `UNAVAILABLE`, plus the `simulated` marker inherited from record provenance.
   - `validateReviewOrigin(raw)` — refuses empty/whitespace (`ORIGIN_UNRESOLVED`), unparseable (`ORIGIN_MALFORMED`), non-`http(s)` (`ORIGIN_SCHEME_UNSUPPORTED`) and credential-bearing (`ORIGIN_CREDENTIALS_FORBIDDEN`) values; returns only the parsed `origin` on success (scheme + host + port, path/query stripped).
   - `resolveReviewSurface(env)` / `LOOPBACK_REVIEW_SURFACE` — configuration read is server-side only; the default reuses `FRONTEND_URLS.headquarters` from `@moonwitness/core`, so ORBIT cannot drift onto a different 100CENTER origin than the rest of the workspace and never points at the hub port.

2. **Server-owned review surface in the projection contract** ([`types.ts`](../../apps/orbit/src/lib/projections/types.ts)): new `ReviewSurface` / `ReviewSurfaceDenial` types, `reviewSurface` as a **required** field of `OrbitStateProjection`, and `ProjectionOptions.reviewSurface`.
   [`operational-projection.ts`](../../apps/orbit/src/lib/projections/operational-projection.ts) populates it on all three return paths; [`arsy-runtime-client.ts`](../../apps/orbit/src/lib/server/arsy-runtime-client.ts) resolves it **once** from the environment and threads it through every branch (simulated, hub-payload live, hub-health live, 401/403, non-2xx, probe failure, endpoint-resolve failure). The browser therefore receives the *outcome* of validation, never a raw environment value.

3. **Destination is never payload-controlled**: the review path `/review` is an ORBIT-owned constant; only the task id and requested role are appended through `URLSearchParams`. No field of a task record is used as a navigation target.

4. **UI rewired to the descriptor**:
   - [`OrbitNodeInspector.tsx`](../../apps/orbit/src/components/OrbitNodeInspector.tsx) replaced the hardcoded `href="http://localhost:3000"` (which pointed at the hub, not the review surface) and the emoji-led banner with a descriptor-driven panel: metadata, the stated no-decision boundary, the `[SIMULATED]` marker plus `handoffNoLiveQueue` when the source is a fixture, the `rel="noopener noreferrer"` link when eligible, and an honest `role="status"` unavailable line otherwise.
   - [`OrbitOperationsWorkspace.tsx`](../../apps/orbit/src/components/OrbitOperationsWorkspace.tsx) adds a `handoffContext` memo (session + surface from the projection), derives the queue-row notice via `buildApprovalHandoff` instead of reading `task.approvalPayload` directly, drops the inline-styled notice for a token class, and gives the task inspector a full handoff block (`dl` metadata, boundary statement, link or denial).
   - [`OrbitShellHeader.tsx`](../../apps/orbit/src/components/OrbitShellHeader.tsx) takes the `reviewSurface` prop; the 100CENTER nav link now uses the validated origin and renders a textual unavailable state instead of a dead link when the origin is refused.
   - [`page.tsx`](../../apps/orbit/src/app/page.tsx) passes `activeWorkspaceData.reviewSurface`, keeping the header and the workspace bound to the same displayed data.

5. **Copy and style**: six new keys in **both** locales (`handoffCta`, `handoffBoundaryNotice`, `handoffNoLiveQueue`, `handoffUnavailable`, `handoffRoleLabel`, `handoffReasonLabel`) in [`orbit-copy.ts`](../../apps/orbit/src/lib/orbit-copy.ts); new `.orbit-handoff-*` rules in [`globals.css`](../../apps/orbit/src/app/globals.css) plus `.orbit-handoff-link:focus-visible`, all design-token based, zero hex literals.

---

## 2. Claimed vs actual changed files

| Claimed (packet scope) | Actual | Change |
|---|---|---|
| `apps/orbit/src/lib/handoff/approval-handoff.ts` | same | **added** — handoff contract, origin validation, env resolver |
| `apps/orbit/src/lib/projections/types.ts` | same | `ReviewSurface`, `ReviewSurfaceDenial`, required `reviewSurface` field, `ProjectionOptions.reviewSurface` |
| `apps/orbit/src/lib/projections/operational-projection.ts` | same | surface threaded into all three projection returns |
| `apps/orbit/src/lib/server/arsy-runtime-client.ts` | same | `resolveReviewSurface(env)` once; threaded through all 7 state branches; optional `reviewSurface` params on the two exported builders (defaults preserve prior call signatures) |
| `apps/orbit/src/components/OrbitNodeInspector.tsx` | same | descriptor-driven handoff; hardcoded hub URL and payload-truth gating removed |
| `apps/orbit/src/components/OrbitOperationsWorkspace.tsx` | same | `handoffContext`, row + inspector handoff, inline style removed |
| `apps/orbit/src/components/OrbitShellHeader.tsx` | same | validated HQ origin; honest unavailable state |
| `apps/orbit/src/app/page.tsx` | same | passes `reviewSurface` to the header |
| `apps/orbit/src/lib/orbit-copy.ts` | same | +6 keys × 2 locales |
| `apps/orbit/src/app/globals.css` | same | handoff classes + focus-visible link |
| `apps/orbit/test/orbit-approval-handoff.test.mjs` | same | **added** — 12 M40-08 tests |
| `apps/orbit/test/orbit-spatial-scene.test.mjs` | same | one assertion updated: the M40-03 contract checked for the removed `hqLink` literal in the inspector; it now checks the rendered handoff link class. Caused by this task's own change, no other assertion touched. |
| `docs/tasks/M40/M40-08.md`, `docs/audit/M40-08-approval-handoff.md`, `TODO.md` | same | packet, evidence, status row |

No file outside `apps/orbit` and the ORBIT task/audit/TODO rows was modified. The other working-tree changes present at baseline (apps/arsy, apps/cockpit, apps/dock, apps/skylink, `docs/audit/screens/*`) belong to concurrent sessions and were kept out of this commit.

---

## 3. Verification commands and observed results

### 3.1 ORBIT suite — 69/69
```bash
pnpm --filter @moonwitness/orbit test
```
```
✔ M40-08: approval-required is read from the record, never inferred (1.5372ms)
✔ M40-08: positive handoff builds a validated 100CENTER review link (0.4774ms)
✔ M40-08: no handoff is offered when the task does not require approval (0.1653ms)
✔ M40-08: unverified session denies the handoff instead of faking one (0.1772ms)
✔ M40-08: invalid redirect targets are refused by the origin validator (0.3914ms)
✔ M40-08: a denied origin cannot be bypassed by a poisoned payload (0.3355ms)
✔ M40-08: review surface is server-resolved and defaults to 100CENTER, not the hub (0.6855ms)
✔ M40-08: simulated fixtures label themselves and never claim a live queue (0.6225ms)
✔ M40-08: every projected state carries the server-validated review surface (0.745ms)
✔ M40-08: ORBIT owns no review engine — no decision path, no mutating call, no hardcoded target (35.6194ms)
✔ M40-08: handoff copy exists in en and id with identical key sets (0.371ms)
✔ M40-08: the handoff is stated as a boundary in the rendered markup (0.5487ms)
ℹ tests 69
ℹ pass 69
ℹ fail 0
```

### 3.2 Typecheck
```bash
pnpm --filter @moonwitness/orbit typecheck   # tsc --noEmit
```
Exit `0`, no diagnostics. Required `reviewSurface` on `OrbitStateProjection` compiles at every construction site, which is the mechanical proof that no state path can ship without a validated surface.

### 3.3 Lint
```bash
pnpm exec eslint apps/orbit --max-warnings 0
```
Exit `0`, no output. (During preparation it reported `no-undef` for `URL` in the new test file; fixed by importing `URL` from `node:url`, then re-run clean.)

### 3.4 Standalone ORBIT build
```bash
pnpm --filter @moonwitness/orbit build
```
```
✓ Compiled successfully in 1837ms
  Running TypeScript ... Finished TypeScript in 4.0s
✓ Generating static pages using 5 workers (3/3) in 727ms
┌ ƒ /
├ ƒ /_not-found
└ ƒ /api/ops/state
```

### 3.5 Design-token / UI consistency gate
```bash
pnpm ui:check
```
```
Files scanned: 132 | Total Violations: 0
✨ Monorepo UI consistency check PASSED!
```

### 3.6 ARSY Radio/SIGNAL regression
```bash
cd apps/arsy && pnpm exec tsx --test test/arsy-env-compat.test.ts test/moonql-web-kit.test.ts test/compose-contract.test.ts
```
```
ℹ tests 28
ℹ pass 28
ℹ fail 0
```

### 3.7 Combined artifact note
`pnpm build:web` was **not** re-run for this leaf. At the M40-07 baseline the combined artifact already failed inside `@moonwitness/dock` on another session's uncommitted `constellation.tsx` work, which is outside ORBIT scope; the equivalent ORBIT proof is the standalone `pnpm --filter @moonwitness/orbit build` in §3.4. This gap is stated rather than papered over.

---

## 4. Positive and negative evidence detail

| Claim | Command | Observed |
|---|---|---|
| Handoff shown only when the API says so | test §3.1 #1/#3 | `RUNNING`/`QUEUED` statuses and blank-action payloads → `NOT_REQUIRED`, `reviewUrl === undefined` |
| Verified session produces the link | test §3.1 #2 | `https://hq.example.test/review?task=task-sec-401&role=SECURITY_AUDITOR`, parsed origin equals the validated surface |
| Stale/unverified session denied | test §3.1 #4 | `UNAUTHORIZED`, `OFFLINE`, `UNKNOWN` each → `UNAVAILABLE` with no link |
| Invalid redirect refused server-side | test §3.1 #5 | `javascript:`, `data:`, `file:` → `ORIGIN_SCHEME_UNSUPPORTED`; `http://admin:p@ss@…` → `ORIGIN_CREDENTIALS_FORBIDDEN`; `not a url` → `ORIGIN_MALFORMED`; `''`/`'   '`/`undefined` → `ORIGIN_UNRESOLVED`; none yield an origin |
| Poisoned payload cannot steer the target | test §3.1 #6 | hostile `reviewUrl`/`href`/reason text present → link origin still `https://hq.example.test`; `evil.test` and `javascript:` absent from the URL |
| No hub-port confusion | test §3.1 #7 | default surface port is `3002` (100CENTER), not `3000` (hub) |
| Simulated fixtures stay honest | test §3.1 #8 | fixture handoff is `AWAITING_HUMAN_REVIEW` **and** `simulated: true`; the inspector renders `handoffNoLiveQueue` |
| No ORBIT-owned review engine | test §3.1 #10 | across all 26 `apps/orbit/src/**/*.{ts,tsx}` files: zero `POST/PUT/PATCH/DELETE` call sites and zero `.post()/.put()/…`; no `approveTask/rejectTask/castDecision/submitApproval/autoPublish` callable; no hardcoded `http://localhost|127.0.0.1` `href`; no `process.env` inside `src/app` or `src/components`; `src/app/api/ops/state` contains exactly `route.ts` and no `export async function POST` |
| Locale parity | test §3.1 #11 | `en` and `id` key sets deep-equal; each new key differs between locales |
| Keyboard stability | test §3.1 #12 | `.orbit-handoff-link:focus-visible` present; link carries `rel="noopener noreferrer"` |

---

## 5. Security, rights and privacy

- **No credential in the bundle.** The review surface is resolved from the environment in the server module only; the lint-enforced contract test asserts no `process.env` reference exists under `src/app` or `src/components`. The browser receives an origin string (a routing fact), never a token, key or header value, and `sanitizePayload` from M40-05 still redacts secret-shaped fields from the payload.
- **Open-redirect surface closed.** Destination = validated origin + constant path + encoded ids. Configured values that are malformed, non-`http(s)` or credential-bearing produce a denial, not a link; task payloads are display data and cannot contribute to the target.
- **No new authority.** ORBIT gains no table, no route that writes, no identity, no role model and no publication path. The four-eyes transition, reviewer scope and release stay with the hub and D08, exactly as the M20-02 design requires.
- **Rights/consent untouched.** Approval *evidence* (`action`, `requestedRole`, `reason`) is displayed, never acted upon; no content is published or withdrawn by this leaf.

---

## 6. Explicit non-scope and honest limits

- **M20-06** (100CENTER view for human task/incident decisions), **M20-07** (direct-URL/API-role/stale-cookie denial tests) and **M37-05** (cross-app token expiry and role isolation) remain **unchecked** in [TODO.md](../../TODO.md). The server-side denial of an *actual approval decision by an under-privileged or stale-session account* is therefore not yet proven by those leaves; this task proves only that ORBIT never offers a decision path and never renders a handoff it cannot vouch for.
- No live review queue is claimed. With `ORBIT_SIMULATED`/offline fixtures the UI states that the record is simulated and that no live queue is connected.
- The hub exposes no `review_task` projection today, so the descriptor is built from the approval fields already carried in operational state; wiring to a real queue read model is M20 work, not this leaf.

---

## 7. Rollback

Reverting this leaf is a single-file-set revert with no data migration:

```bash
git revert <result-sha> -- apps/orbit/src/lib/handoff \
  apps/orbit/src/lib/projections apps/orbit/src/lib/server/arsy-runtime-client.ts \
  apps/orbit/src/components apps/orbit/src/app/page.tsx apps/orbit/src/app/globals.css \
  apps/orbit/src/lib/orbit-copy.ts apps/orbit/test docs/tasks/M40/M40-08.md docs/audit/M40-08-approval-handoff.md TODO.md
```

`reviewSurface` is additive to the projection contract, so no ARSY route, MoonQL table, HQ page, Dock page or Radio/SIGNAL behaviour depends on it; rolling back restores the previous banner markup and leaves hub data untouched.

---

## 8. Next eligible task

**M40-09** — Cross-app auth, deployment and extraction boundaries. Its prerequisite **M40-08** is now closed; **M37-01..04** are closed while **M37-05** is not, so M40-09 must deliver ORBIT-side boundary proof (direct URL, role/expiry handling as observed from ORBIT, env contract, independent artifact, no private HQ imports) and must state the remaining M37-05/M20-06/M20-07 gaps rather than claim workspace-wide cross-app auth verification.
