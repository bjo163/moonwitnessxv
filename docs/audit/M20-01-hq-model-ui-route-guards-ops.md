# M20-01 — Audit: HQ generic model UI, route guards and existing ops widgets

- **Task:** M20-01 (`TODO.md` row 493, authority for this task — no packet file exists under `docs/tasks/M20/` for M20-01).
- **Baseline branch/SHA:** `dev` / `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3` (`baseline_sha 76ecdc5`).
- **Prerequisites honored:** M00-02 (closed, `docs/audit/M00-02-routes-addons-matrix.md`) and M14-01 (closed; TODO revalidation note at `ada9d3b` records the four-eyes, named-human-actor transition machine).
- **Method:** READ-mostly. Every claim below was read from the committed tree via `git show 76ecdc5:apps/headquarters/<path>` (and hub-side `packages/...` blobs at the same SHA), never from the dirty working tree. **No code changed.** The only file written is this artifact.
- **Scope counts:** 12 route handlers audited (9 `(admin)` pages + login + `POST/DELETE /api/session` + `GET /api/ops/stream`); 6 guard layers verified (see §2); 9 HQ-owned UI widgets inventoried (see §3).

## 1. Generic model UI — what `(admin)/models` actually renders

**Data flow (all real, nothing mocked at this layer):**

1. `getSchema()` (`src/data/schema.ts`, committed at 76ecdc5) fetches `GET /_schema` from the hub through the per-request server SDK (`src/data/sdk.ts` → `src/data/server-sdk.mjs`, token from the httpOnly `hq_token` cookie via `src/lib/session.ts:readToken`), caches it 30 s and reports contract drift (`describeDrift`).
2. `/models` index (`src/app/(admin)/models/page.tsx:6`) renders one `DataTable` row per `doc.models` entry: `name`, `label`, `addon`, `dataTier` (via `TierBadge`), `delete` strategy, field count and enabled operations — all straight from `_schema` (`meta.label`, `meta.addon`, `meta.dataTier`, `meta.operations`). The page's own footer states the rule: "every table, form and menu on this screen came from GET /\_schema".
3. `/models/[model]` (`page.tsx:30-40`) resolves `meta` from the same document, then `listRecords()` (`src/data/queries/records.ts`) rides the hub's list route with `q`/`page`/`total` — search targets `searchField(meta)` (first plain `str` field, `packages/moonql-client/src/ui-meta.ts:42-47`).
4. `ModelTable` (`src/ui/widgets/ModelTable.tsx:36-45`) generates columns from `meta.fields` (skips `writeOnly`, badges `compute` cells, prints `*Record` values through shared `cellText`).
5. `/models/[model]/new` and `/models/[model]/[id]` render `RecordForm` (`src/ui/widgets/RecordForm.tsx:28`), whose fields come from `formFields(meta, mode)` (`packages/moonql-client/src/ui-meta.ts:50-74`) — the create/update JSON Schemas plus `FieldMeta.kind`. Field widgets are chosen by `kind` through `FieldWidget` (`src/ui/fields/registry.tsx:14-17`), which delegates to `@moonwitness/moonui`'s `fieldWidgetFor`. `deleteRecordAction`/`updateRecordAction`/`createRecordAction` (`src/data/actions.ts`) are generic: form keys carry their kind (`name="field::kind"`), so one parser serves every model.
6. Sidebar beyond the generic registry: `menuGroups(doc)` (`src/data/queries/registry.ts:19-31`) builds nav groups entirely from `_schema.menu` entries (`kind`, `key`, `label`, `group`, `icon`), mapping model/view/endpoint items onto HQ URLs (`menuHref`, `registry.ts:8-16`).

**Where metadata-generated labels come from (input for M19-22/M20-02):**

- **Model labels** — the addon's `defineModel({ label: ... })` on the hub, e.g. `label: 'Empire System'` (`packages/moonql-ops/src/index.ts:97`), published in `_schema` and consumed as `meta.label` (`models/page.tsx:10`, `[model]/page.tsx:46`, breadcrumb/title on the detail pages).
- **Menu labels** — `MenuSpec.label`/`group` from the hub (`_schema.menu`), never hardcoded in HQ's dynamic section.
- **Field labels — raw identifiers.** `formFields` sets `label: key` (`packages/moonql-client/src/ui-meta.ts:65`), and `ModelTable`/`RecordForm` print the field key as the label. So every field label in forms and tables is the machine identifier, shared with Studio via the client kit. M19-22's "inventory metadata-generated labels" reduces to these two seams: `meta.label` (hub string) and `key` (identifier, must stay stable per the TODO DoD).

**Demo vs real inside the generic-model and ops surfaces:**

- `/models*`, `/views*` are fully real (hub data through the caller's own token; `/views/[view]` clamps `limit` to the view's declared `meta.limit`, `views/[view]/page.tsx:24`).
- `/` (`(admin)/page.tsx`) is a **mix**. Real: everything under "MoonQL Hub Telemetry" (lines 434-529) from `GET /ops/dashboard` — engine, uptime, per-model counts, crons + last run, jobs, audit trail, views, bus event typology — and the live `EventStream` (SSE proxy). Demo/hardcoded: `PROJECTS` (lines 30-70), `WORKFLOWS` (72-78), `COMMAND_FEED_ITEMS` (80-86), `MISSION_ALERTS` (88-92), `EMPIRE_14_SYSTEMS` (94-109 — a static table, while the hub actually exposes an `empire_systems` model and an `empireSystemsOverview` view, `moonql-ops/src/index.ts:96-123`, which the dashboard does **not** read). Fake-number fallbacks dress demo as telemetry: `monitor.counts.signals || 46` (line 201), `|| 10` (202), `|| 12` / `|| 3` (254-255), `Math.max(18, crons.length)` (282 — claims at least 18 active workflows), `ops.jobs.length || 3` (283), and static badges "12 active projects"/"4 in review" (175-176), "8 in progress"/"3 queued" (187-189), "5 scheduled"/"2 publishing" (267-269). The navbar "ALERTS 3" badge is literal (3, `src/layouts/vertical.tsx:103`).
- `/world-monitor` is real *data* (all tiers from `GET /monitor/overview`) but its `ThreatRadarMap` (`src/ui/client/ThreatRadarMap.tsx:18-25`) renders hardcoded `DEFAULT_TARGETS` with fabricated signal/urgency counts; the page passes it only `selectedRadarId` (line 179) — no real radar rows reach the map.
- `getMonitorOverview` swallows **all** errors into `EMPTY_OVERVIEW` (`src/data/queries/monitor.ts:51-55`), so a hub 403/500 renders as "zero radars" — contrary to the fail-loud rule the session layer deliberately follows (`src/data/queries/session.ts:6-14`, `src/lib/session-auth.mjs:4-11`: only hub 401 counts as anonymous).

## 2. Route guards — enumeration and findings (tree 76ecdc5)

Guard layers, outermost first:

| # | Layer | File (committed) | Rule |
|---|---|---|---|
| 1 | Edge middleware | `src/middleware.ts:4,8-11` | Only `/login` and `/api/session` are public; everything else passes on **cookie presence** (`if (request.cookies.get('hq_token'))` — line 11), not validity. Redirects to `/login?next=…` (13-17). |
| 2 | `(admin)` RSC layout | `src/app/(admin)/layout.tsx:5-6` | `const user = await me()`; `if (!user) redirect('/login?error=expired')` — session **validity** verified per render against hub `/auth/me`. No role test. |
| 3 | Session resolver | `src/lib/session-auth.mjs:4-11`, `src/data/queries/session.ts:12-14` | Only a hub 401 ⇒ anonymous; hub outages/5xx rethrow instead of faking logout. |
| 4 | Per-page affordance (`can()`) | `models/[model]/page.tsx:38-40`; `models/[model]/[id]/page.tsx:34` | `can(meta, me(), 'create'/'update'/'remove')` from `packages/moonql-client/src/acl.ts:25-35` mirrors the hub ACL — hides buttons the API would 403. |
| 5 | API routes | `src/app/api/ops/stream/route.ts:30-31`; `src/app/api/session/route.ts:38-39,57-61` | Stream: 401 without token, then hub (ADMIN_ONLY) decides; token never leaves the server. Session route: open-redirect-safe `next` (`!startsWith('//')`/`'/\\'`). |
| 6 | Hub-side enforcement (owner of real authz) | `packages/moonql/src/rest.ts:120-126,438-441`; `packages/moonql/src/model.ts:30-42`; `moonql-ops/src/index.ts:126-128,176-178` | `/ops/dashboard` and `/ops/stream` `requires: ADMIN_ONLY`; `/_schema` default `'auth'`; CRUD via ADMIN_WRITE/ADMIN_FULL matrices; `auth_users` is `rest: false` (`moonql-auth/src/index.ts:46`). |

**Negative finding (deliberate, confirmed): there is NO server-side role check anywhere inside HQ.** The admin section is reachable by *any* authenticated hub identity — roles `admin/user/guest` all exist (`moonql-auth/src/index.ts:43`) — with authorization delegated entirely to hub ACL. This is recorded as a proven risk in BLUEPRINT.md ("Proven risk": `apps/headquarters/src/middleware.ts` tests cookie presence, not credential validity; Hub enforces actual authorization), so this audit confirms rather than discovers it. Concrete consequences on 76ecdc5:

- **N1 — unguarded write forms via direct URL.** `/models/[model]/new` renders `RecordForm` + `createRecordAction` with no `me()`/`can()` import at all (`models/[model]/new/page.tsx:21,42`), and `/models/[model]/[id]` renders the update `RecordForm` unconditionally (`[id]/page.tsx:58`) while checking only `canDelete` (line 34) — versus the list page that computes `canCreate` (`[model]/page.tsx:38`). A `user`-role session can open/submit both forms; the hub 403s the action and the error is surfaced via redirect (`src/data/actions.ts`). UI affordance inconsistency, not a data leak; M20-02/M20-07 must decide whether the page itself should 404/redirect.
- **N2 — `/models` index discloses the whole registry to any authenticated role** (`models/page.tsx:6` needs only `_schema`, ACL `'auth'`): every model name, label, tier, ACL and operations, for all addons — structure, not rows.
- **N3 — `/system` answers a non-admin with a crash, not a denial.** `dashboard()` has no local catch (`system/page.tsx:10`; same call at `(admin)/page.tsx:112`), so a `user`-role session hitting `/system` or `/` directly gets an unhandled hub 403 error page instead of a redirect. Honest failure (no leak), wrong semantics — M20-07's matrix should pin this.
- **N4 — World Monitor read is public at the hub.** `/monitor/overview` declares no `requires` (`packages/moonql-monitor/src/index.ts:701-705`), and `guard(undefined)` ⇒ no preHandler (`rest.ts:120-122`), so every radar/source/signal/task row (incl. `aiSummary`, author, URLs) is anonymous-readable via direct API call whenever the hub is network-reachable; HQ only masks this behind cookie presence. Combined with N1's unguarded new/edit forms on `monitor_*` models, this is the live instance of the SECURITY.md review gate ("`ADMIN_WRITE` in MoonQL does not protect list/get") and BLUEPRINT line 60. Restricted D08/Research data has no such gap found: research models are gated by M14's ACL'd routes and `auth_users` has no REST at all.

**Direct-URL table (precursor input for M20-07's matrix; "reachable" = renders content, verified by code path, not live browser):**

| Path | Anonymous | Forged/expired cookie | `user`-role session | `admin` session |
|---|---|---|---|---|
| `/login`, `POST /api/session` | 200 (public, middleware:4) | 200 | 200 | 200 |
| `/` | redirect→login | layout `me()` null → `/login?error=expired` | 500 crash on `/ops/dashboard` 403 (N3) | 200 |
| `/models` | redirect | →login?error=expired | 200, full registry (N2) | 200 |
| `/models/<m>` | redirect | →login | rows iff hub list ACL allows; write buttons hidden by `can()` | 200 + affordances per ACL |
| `/models/<m>/new`, `/models/<m>/<id>` | redirect | →login | form renders; POST → hub 403 (N1) | 200 / hub per ACL |
| `/system` | redirect | →login | crash (N3) | 200 (endpoints, ACL dumps, crons) |
| `/views`, `/views/<v>` | redirect | →login | list 200; run guarded by `view.aclSpec` (`rest.ts:305`) | 200 |
| `/world-monitor` | redirect | →login (and silently empty via monitor.ts:54 on hub errors) | 200 with all data (hub-public, N4) | 200 |
| `GET /api/ops/stream` | middleware redirect | 401 (route:31) / hub 401 | hub `ADMIN_ONLY` 403 (`moonql-ops:176-178`) | 200 SSE |

## 3. Existing ops widgets — inventory and reuse verdict

HQ-owned UI components (`src/ui`, 9) and their provenance:

| Widget | Reuse vs local | Evidence (committed) |
|---|---|---|
| `FieldWidget` + 7 kind controls | **Shared** — registry moved to `@moonwitness/moonui` (`FIELD_WIDGETS`), HQ file is "the local door" | `ui/fields/registry.tsx:5-17`; `ui/fields/widgets.tsx:4-13` re-exports moonui's `Bool/Int/M2o/Sel/Str/Text/TsField` |
| `ModelTable`, `TierBadge` | Thin local wrapper over shared `DataTable`, `cellText` | `ui/widgets/ModelTable.tsx:3-4,47` |
| `RecordForm` | Local composition of shared `Panel/Button` + shared `formFields` + shared widgets | `ui/widgets/RecordForm.tsx:2-5,28` |
| `AuditFeed`, `JobTable` | Local column config over shared `DataTable/Badge` | `ui/widgets/Feeds.tsx:2,7,28` |
| `SideNav` | Client hook over shared `Nav`; groups from `_schema.menu` | `ui/client/SideNav.tsx:4,10`; `data/queries/registry.ts:19-31` |
| `EventStream` | Reconnect/streaming logic delegated to shared kit `openLiveStream`/`sameOriginSdk` | `ui/client/EventStream.tsx:4,43` |
| `ThreatRadarMap` | **Local + demo** (hardcoded targets, §1) | `ui/client/ThreatRadarMap.tsx:18-25` |
| `VerticalLayout`, `AuthLayout` | Chrome from moonui (`BrandLogo/Nav/Nav/ZineNote/UserChip/MtsTelemetryClock`…); Mission-Control group hardcoded | `layouts/vertical.tsx:2-18,20-33`; `layouts/auth.tsx:2` |
| Dashboard/World-Monitor pages | Compose the above + moonui primitives; data via shared SDK | `(admin)/page.tsx:1-22`; `world-monitor/page.tsx:1-19` |

Derived screen logic is not local either: `tableColumns`, `searchField`, `formFields` are re-exported from `@moonwitness/moonql-client` so "Headquarters, Moonql Studio and any future surface share one implementation" (`src/data/types.ts:3-8`), and the field-widget map was deliberately centralized because "the hub's Studio renders the very same `/_schema` metadata" (`ui/fields/registry.tsx:5-9`).

**Outcome question — "Existing features reused, not duplicate admin app": YES, reused.** HQ is a thin, schema-driven client over the existing hub: zero HQ-owned SQL, zero invented auth (opaque `hq_token` against hub `/auth/*`), zero model-specific CRUD code, one widget registry shared with Studio, and hub ACL as the single authorization authority. It is not a second backend or a second IAM (consistent with BLUEPRINT's role separation: SHADOW/100CENTER are *areas inside* Headquarters, not separate services). The residual duplication risks to manage going forward (for M20-02+): the static `MISSION_GROUP` overlay nav (`vertical.tsx:20-33`) and the local page shells duplicate chrome semantics that `_schema.menu` + moonui already provide, and the hub's embedded Studio (`apps/arsy/src/modules/studio/`, M00-02 §2) remains the adjacent admin surface — both should keep consuming shared contracts rather than forking behavior.

## 4. Acceptance evidence

- **Positive:** every path enumerated above was read from `git show 76ecdc5:...` — 40 committed HQ source blobs exported and inspected; guard chain layers 1-6 each backed by the cited file:line; reuse claims backed by the delegation comments and imports in §3. Prerequisites verified closed in TODO (M00-02 row 85, M14-01 row 359 with the 2026-10-26 revalidation note at row 367, recording four-eyes named-actor transitions — the contract M20-02 will build the queue on).
- **Negative:** four concrete gaps recorded with committed-tree citations — N1 (`models/[model]/new/page.tsx:21,42` and `[id]/page.tsx:34,58`: write forms render without `can('create'/'update')`), N2 (`models/page.tsx:6`), N3 (`system/page.tsx:10`, `(admin)/page.tsx:112` uncaught hub 403), N4 (`moonql-monitor/src/index.ts:701-705` + `moonql/src/rest.ts:120-122`: public `/monitor/overview`). The deliberate attempt list proving the check: every route pattern in `(admin)` plus `api/*` was walked as direct URL in the §2 table; the forged-cookie path is additionally pinned by the committed test `apps/headquarters/test/session-auth.test.ts:22-32` ("a present HQ cookie passes only middleware; the Hub decides whether it is a session").
- **Honesty limits:** static analysis only — no dev server, browser, hub instance or Docker run was performed (per repo policy on unexecuted claims); "reachable" in the table is a code-path conclusion, to be executed against by M20-07.

## 5. Status

- `baseline_sha` = `76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3`; branch `dev`.
- **No code changed.** Actual changed files: this artifact only (`docs/audit/M20-01-hq-model-ui-route-guards-ops.md`). TODO row left untouched for the integrator.
- Rollback: delete this file.
- Verdict: **READY-TO-CLOSE** for the audit itself; findings N1-N4 are inputs for M20-02 (queue must not inherit the missing role check) and M20-07 (must convert §2's code-path table into executed server-denial tests), not blockers here.
