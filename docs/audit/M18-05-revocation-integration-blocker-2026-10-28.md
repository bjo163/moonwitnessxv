# M18-05 — Revocation integration blocker audit

## Evidence identity

- Observed branch: `dev`.
- Observed `HEAD` and `origin/dev`: `b2cac4a526c688a843f9df1d66a5cd880c823e89`.
- Audit date: 2026-10-28.
- The shared worktree contains unrelated existing changes. This audit adds only this document; no source or TODO status was changed.

## Finding

**M18-05 remains blocked at the integration boundary.** M18-04's accepted lifecycle functions can decide availability only over caller-supplied records. There is no integrated durable D08 release/revocation authority, no active Dock public Research or compare projection consumer, and therefore no release-aware search, preview, export, or generated-cache invalidation path to exercise. The current Dock pages withhold the affected content, which is a useful fail-closed containment state; it is not evidence that a published release can be revoked or purged from projections.

`TODO.md` marks M18-05 unchecked (P1, depends on M18-04), with acceptance “No revoked content leaks from projections.” Its packet asks for the real Dock query and related tests, but `apps/dock/src/data/queries/research.ts` is absent from the current query directory.

## What exists

- M18-03 supplies a pure release-manifest contract. Its audit explicitly says it is not imported by the package barrel, a route, store, endpoint, projection, search, export or cache; it creates no publication, schema or persistence. Its hash provides integrity, not authenticity, and the D08 store's pointer-write authority is absent.
- M18-04 supplies a pure in-process withdrawal/correction/takedown/appeal lifecycle. `packages/moonql-research/src/withdrawal.ts` documents no store/ORM/network/clock dependency. Its audit says it is not wired to routes, D08 store, UI, package exports or projections; callers supply actors/timestamps and there is no durable audit. Thus it cannot itself publish or propagate a revocation.
- The owning ARSY addon registers the Research package (`apps/arsy/src/addons.ts`), and `packages/moonql-research/src/index.ts` defines authenticated/private Research APIs. Searches in those files found no imports or calls to `withdrawal.ts`, `release-manifest.ts`, `evaluatePublicAvailability`, or `createReleaseManifest`. M34-04's containment audit/spec say anonymous Research endpoints/raw models are denied and no D08 projection endpoint was added.
- Dock `/research` and `/reader/compare` are dynamic server pages that render localized withholding alerts. Compare states that source text is shown only after an approved public projection is available. The Dock query directory has no `research.ts`. `ResearchExplorer.tsx` exists as a component but `rg` found no importer under Dock source. Search for D08 lifecycle imports and consumer hooks (`readResearch`, `revalidateTag`, `revalidatePath`, `unstable_cache`, `cacheTag`) found no active Dock consumer or invalidation hook.
- The M34-04 spec expressly leaves E7 `/reader/compare` and E9 `/research` fail-closed, E8 `ResearchExplorer` unwired, and says no public projection is approved or implemented. It lists unresolved NA-1 (authoritative release record and lifecycle), NA-3 (Jerusalem comparative-view ratification), and NA-4 (rights-attribution conflict). It states D08 has no public projection model, release record, rights approval, editorial sign-off or takedown ledger.

These are scoped source and document observations, not a claim that no unrelated search, export, preview, or cache exists anywhere in the product. No such unrelated feature was found to consume D08 released content or revocation identity in the inspected Research/Dock paths.

## What must exist to unblock M18-05

1. An owner-approved D08 authority and rights/review basis, resolving NA-1 and any applicable NA-3/NA-4 inputs before public Research content is released.
2. A durable release/takedown/withdrawal record and authorized mutation/read interface. Revocation must identify the exact `releaseId` and immutable release version; record actor, scope, reason, and server-assigned event time/sequence; enforce authorization and independent review; and support idempotency, replay handling, and recovery. Caller-supplied pure-function inputs alone are insufficient.
3. A consumer contract that carries release identity/version to every projection and defines how accepted revocation is delivered to search/index, preview, export/download, and generated caches. Define synchronous deny behavior, invalidation/purge acknowledgement, cache keys/tags, and behavior during consumer outage or stale replicas.
4. Positive integration evidence: publish a synthetic approved release, observe it in each supported consumer, accept a revocation, then verify every consumer refuses/omits it and all relevant caches/exports are invalidated. Include retry/replay/recovery coverage so a missed or duplicated event cannot restore stale content.
5. Negative evidence: unauthorized or malformed/stale revocation events fail closed and reveal no protected bytes. Include the current anonymous Research denial as a separate pre-release guard; it does not replace propagation coverage.
6. A focused audit of real consumer routes and cache/index ownership, reviewer sign-off, exact-SHA test results, and a rollback plan that does not re-open anonymous access.

Until those interfaces and tests exist, M18-05 cannot demonstrate its acceptance criterion. Keep it open. Dock withholding currently contains public exposure on the two identified pages; it does not demonstrate invalidation after publication.

## Commands run for this audit

Working directory: repository root `Z:\project\moonradio`.

- `git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git rev-parse origin/dev; git status --short -- docs/audit/M18-05-revocation-integration-blocker-2026-10-28.md` — observed `dev`, matching local/remote SHA above, and no pre-existing file at the audit path.
- `rg -n "M18-05|M18-04|M18-03" TODO.md` — confirmed M18-05 open and its M18-04 prerequisite closed; recorded M18-03/M18-04 non-integration claims.
- `rg -n "D08|release|takedown|withdraw|NA-1|NA-3|NA-4|search|preview|export|cache" docs/planning/M34-04-d08-projection-spec.md docs/audit/M34-04-d08-projection-containment.md` — observed the D08 missing-authority/projection findings and explicit Dock withholding boundaries.
- `rg -n "withdrawal\\.js|withdrawal|release-manifest\\.js|release-manifest|evaluatePublicAvailability|createReleaseManifest|from './withdrawal|from './release-manifest" packages/moonql-research/src/index.ts apps/arsy/src apps/dock/src` — no integration matches in the inspected entrypoints; hits were confined to the standalone module comments/definitions where applicable.
- `rg -n "D08|research" apps/arsy/src/addons.ts` — confirmed the existing Research addon registration; this is not a D08 release integration.
- `rg -n "ResearchExplorer|readResearch|revalidateTag|revalidatePath|unstable_cache|cacheTag" apps/dock/src` — only the component's own definition matched; no importer or relevant invalidation hook matched.
- `Get-Content apps/dock/src/app/research/page.tsx`, `Get-Content apps/dock/src/app/reader/compare/page.tsx`, `Get-ChildItem apps/dock/src/data/queries -Name`, and targeted `rg` on those page files — verified the pages render withholding alerts and no `research.ts` query file exists.
- Read `docs/tasks/M18/M18-05.md`, M18-03/M18-04 audit reports, `docs/planning/M34-04-d08-projection-spec.md`, and `docs/audit/M34-04-d08-projection-containment.md` for task boundaries and recorded limitations.

No tests, builds, application scripts, database access, deployment checks, or network calls were run. This is a source/document blocker audit; it does not prove runtime or production behavior.
