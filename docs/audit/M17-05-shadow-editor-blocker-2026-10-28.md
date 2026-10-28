# M17-05 — SHADOW editor blocker audit

## Evidence identity

- Branch: `dev`.
- `HEAD` and `origin/dev`: `7966257958103a4a23032bc62462ee5f48d02d64`.
- Date: 2026-10-28.
- The requested audit path did not exist before this change. No source or TODO file is changed; existing unrelated worktree modifications are preserved.

## Finding

**M17-05 cannot safely satisfy “Private drafts and revision permissions controlled” on the inspected baseline.** Three required foundations are absent: a D07 story store, an approved/implemented D07 record contract, and a revision-aware authorization boundary. HQ has a real shared session and schema-driven model CRUD ACL, but that generic model-level gate does not establish private draft ownership or per-revision permissions. Do not add local fake storage or infer story records from labels, dashboard counts, or the unrelated Dock vector generator.

`TODO.md` lists M17-05 open, P1, dependent on M17-03 and M03-02. M03-02 is closed and its deny-by-default template exists. The M17-03 design/audit is present and its prerequisite is shown closed in TODO, but it explicitly records D07 as planned and zero instances of all story graph node kinds. Thus the dependency being checked does not provide an operational story data contract/store.

## Exact evidence

- `docs/decisions/M02-02-domain-assignments.md:26` assigns D07 to `@moonwitness/story` **(Planned G3)** and names the planned `stories`, `arcs`, `characters`, `episodes`, `scenes`, `posters`, and `media_manifests` records.
- `docs/design/M17-03-story-version-graph.md:14` says all five graph node kinds currently have zero instances. Lines 36–37 say the D07 package is planned and the graph is schema/evidence rather than populated records. `docs/audit/M17-03-story-version-graph.md:158` explicitly says D07 is planned, no package exists, and fixture checks do not establish live instances. The design is not an accepted ADR or an implemented store.
- The M17-05 packet, `docs/tasks/M17/M17-05.md`, asks for a SHADOW editor in HQ and acceptance of private drafts/revision permissions. It directs inspection of Dock `GeneratorStudio.tsx`; that component is not a story editor: `apps/dock/src/ui/client/GeneratorStudio.tsx:616-631` maintains only avatar/seal/icon UI state, while lines 642-678 copy/downloads SVG and lines 680 onward export PNG. It has no story draft or revision persistence.
- The HQ dashboard's “Story Forge” is a `ModuleCard` at `apps/headquarters/src/app/(admin)/page.tsx:305-316` with a hard-coded “12 active projects” and “4 in review” display, not editor state. `apps/headquarters/src/lib/shell-copy.ts:120` routes the Story Forge navigation entry to `/models`. `apps/headquarters/src/app/(admin)/models/page.tsx:7-18` obtains the published schema and enumerates every model generically. This is generic CRUD catalog behavior, not a D07 workspace.
- HQ authorization is real and useful but coarse for this requirement: `apps/headquarters/src/lib/authz.ts:65-83` binds a route guard to the current session and evaluates the shared `can(meta,user,op)` model ACL; lines 91-100 deny an endpoint absent from the Hub schema. `apps/headquarters/src/data/actions.ts:82-96` fetches the published schema and authorizes create/update/remove against model metadata before writes. `apps/headquarters/src/app/(admin)/models/[model]/page.tsx:38-48` checks model-level list access before reading rows. None of these inspected interfaces evaluate a draft owner, story membership, revision lineage, or revision-specific grants. This audit does not claim the shared auth is broken; it says it cannot prove this acceptance without a D07 model/ACL contract and scoped policy.
- `docs/audit/M03-02-deny-by-default-template.md:9-25,65-66` defines deny-by-default for sensitive model REST interfaces and requires explicit ACL under the production policy. That template can protect future D07 models but does not define story ownership, private-draft scope, revision-level authorization, or an implemented store.
- Targeted source search across `apps/headquarters/src` and package TypeScript sources for `story`, `stories`, `episode`, `scene`, and `manuscript_version` found no story persistence/editor implementation. Expected story-related matches were dashboard/navigation copy, design vocabulary, unrelated component styles, and unrelated domains. No D07 package path was found in the package source inventory inspected.

## Blockers and evidence needed

1. **D07 owner and contract:** an accepted D07 domain/API decision that defines record identity, world/arc/episode/scene/version relations, revision immutability/lineage, and the owner of durable private drafts. The M17-03 fixture-backed graph alone is not an operational contract.
2. **Durable store:** the approved D07 owning package/schema and persistence integration, with migration/retention and recovery behavior. HQ must consume this owner through its published schema/API; it must not create a second story store.
3. **Authorization policy:** explicit private-draft and per-revision ACL semantics (who may read, create, revise, approve, and transfer ownership), including the trusted identity binding, denial behavior, and enforcement at both HQ route/action and owning API. Existing session plus model-level `can()` is necessary but insufficient evidence for revision rights.
4. **Focused evidence:** positive tests showing an authorized editor can create/read/revise only permitted private drafts and preserve revision lineage; negative cross-user/role tests showing every unauthorized read/write is denied before data is returned or mutated; tests for missing session, stale/unknown revision and store/API failure. Add evidence only after the D07 contract/store and permission policy are approved.

Until these foundations exist, keep M17-05 open and do not persist drafts in local component state or a new ad hoc HQ table. The existing Dock vector generator can remain a separate visual asset tool; it does not unblock story authoring or media rights work.

## Commands run and limits

Working directory: `Z:\project\moonradio`.

- `git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git rev-parse origin/dev; git status --short -- docs/audit/M17-05-shadow-editor-blocker-2026-10-28.md` — observed `dev`, matching SHA above, and no pre-existing audit file.
- `rg -n "M17-03|M17-05" TODO.md` — confirmed checked prerequisites and M17-05 open at P1.
- Read `docs/tasks/M17/M17-05.md`, `docs/design/M17-03-story-version-graph.md`, `docs/audit/M17-03-story-version-graph.md`, `docs/audit/M03-02-deny-by-default-template.md`, and `docs/decisions/M02-02-domain-assignments.md`.
- `rg -n "D07|...|story"` over the domain decision, M17 design/audit, HQ source, and package TypeScript sources; plus direct inspection of the HQ dashboard, generic models page, authz/actions, and Dock generator lines cited above.

No tests, builds, application scripts, database access, network calls, or deployment checks were run. This is a read-only source/document audit plus its new report; absence claims are limited to the inspected repository paths and searches, not runtime or production infrastructure.
