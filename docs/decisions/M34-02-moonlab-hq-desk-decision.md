# M34-02 — MOONLAB host placement and raw-research containment decision

- **Milestone**: M34 MOONLAB research workbench
- **Task**: M34-02 (LEAF) — Decide standalone MoonLab or HQ desk
- **Status**: DECIDED at engineering level; owner/integrator ratification pending. No TODO status changed by this artifact.
- **Baseline**: `dev` at `00b006443da8a1b9408226ed776e15090f0e640b`
- **Inputs of record**: [M34-01 inventory](../audit/M34-01-inventory-d05-mizan-research-exposure.md) (C1–C16, E1–E10), [M34-01 evidence](../audit/M34-01-d05-mizan-research-exposure.md), [prior placement proposal](../audit/M34-02-moonlab-host-placement.md)
- **Companion evidence note**: [M34-02-moonlab-hq-desk-evidence.md](../audit/M34-02-moonlab-hq-desk-evidence.md)
- **Authority**: [BLUEPRINT](../../BLUEPRINT.md) D05/D08 and §2A, [ADR-0001](ADR-0001-arsy-is-xv-hub.md), [ADR-0002](ADR-0002-additive-moonql-domains.md), [ADR-0003](ADR-0003-source-rights-and-consent.md), [ADR-0004](ADR-0004-empire-surfaces.md), [M14-01](M14-01-review-workflow.md), [M03-04](M03-04-tenant-role-boundaries.md)
- **Scope**: host placement for MOONLAB and the containment policy for raw-research exposure E1–E7. This is a decision, not an implementation: it authorizes no source, schema, ACL, package, route, deployment or TODO change.

---

## 1. Decision

**MOONLAB is a dedicated private research desk inside the existing Headquarters application (`apps/headquarters`), not a standalone `apps/moonlab` workspace.** D05 data stays in `@moonwitness/moonql-research` mounted in the single ARSY/MoonQL service; D08 sign-off stays in the hub's review surface; Dock stays fail-closed.

Decision clauses:

| # | Clause |
|---|---|
| D1 | Initial MOONLAB host is a dedicated route area under `apps/headquarters` (working namespace `/research/*`; exact URLs are M34-03's). MOONLAB remains a product/workflow label, not an application boundary. |
| D2 | No `apps/moonlab` directory, workspace, build target, CI job, Docker service, port, login, session store, SQL owner or API is created by M34-02 or its follow-up leaves. |
| D3 | The desk is a client. It reads and writes through existing ARSY/MoonQL endpoints via the HQ server-only SDK and the `hq_token` cookie. It never reaches the database and never holds hub credentials in browser code. |
| D4 | Desk reads and writes are authorized server-side from the hub's `/auth/me` and published `_schema` ACL (`apps/headquarters/src/lib/authz.ts:7-17,50-101`), not from route names, menu visibility or cookie presence. |
| D5 | The desk must use explicit intent endpoints (register/validate/review/MIZAN) for governed transitions, not generic model create/update on `research_*` models. Generic admin CRUD is not a review workflow. |
| D6 | No placement may grant publication authority. Release remains `publicationAvailable: false` (`packages/moonql-research/src/review.ts:171,205`) and no public D05 projection exists until a D08-approved one is specified by M34-04. |
| D7 | No new role is created. Reviewer separation remains the existing named-actor, four-eyes rule (`packages/moonql-research/src/common.ts:74-88`). A reviewer-only role is registered as NEEDS_ADR (NA-2), not decided here. |
| D8 | Raw-research containment is enforced at the owning API, not only in frontends. The only legitimate anonymous D05 read path is an approved D08 released-research projection. |

**Rejected option:** standalone `apps/moonlab` at this stage (see §4).

---

## 2. Criteria (falsifiable)

Each criterion is written so a later reviewer can overturn the decision with observed evidence, not opinion.

| # | Criterion | How it is falsified | Evidence at baseline | HQ desk | Standalone MoonLab |
|---|---|---|---|---|---|
| K1 | A distinct research audience exists, separate from `admin`/`user` | A ratified non-admin role with D05 authoring scope exists and is exercised | `auth_users.role` is `['admin','user','guest']` (`packages/moonql-auth/src/index.ts:43`); `humanActor` accepts only admin/user (`common.ts:74-88`). M03-04 declares an `editor`/`reviewer` role but it is not implemented (conflict C1) | PASS (no separate audience to serve) | FAIL (nothing distinct to host) |
| K2 | A distinct runtime or interaction need requires a separate build/deployment | A documented requirement that cannot be met inside the HQ Next app | `docs/design/mockups-xv/README.md:16` places screen 07 as "HQ research desk, MOONLAB proposed"; no separate runtime requirement is recorded | PASS | FAIL |
| K3 | Chosen host adds no second Hub, identity or SQL owner | The host imports a SQL driver, issues its own sessions, or exposes a new API | HQ deps are `core`, `moonql-client`, `moonui`, `web-config`, Next/React only (`apps/headquarters/package.json`); server SDK is a thin client (`src/data/server-sdk.mjs:4-10`); auth is hub `/auth/me` (`src/lib/session-auth.mjs:4-12`) | PASS | FAIL unless every constraint is re-proven (ADR-0004:12 gates MOONLAB) |
| K4 | Authorization is server-enforced and ACL-derived | A route hides data only in UI, or re-derives rule meaning locally | `authz.ts:7-17` states HQ is not an ACL owner; `guardModel` is checked before any fetch (`src/app/(admin)/models/[model]/page.tsx:35-42`); 23/23 authz tests pass | PASS | Must rebuild equivalent guard; no security gain |
| K5 | Host functions without anonymous public research reads | Desk requires a public endpoint to render | Desk reads via the session-bound server SDK (`src/data/queries/records.ts:26-42`) | PASS | FAIL (same requirement) |
| K6 | Cost and reversibility are proportionate | Adding the host requires manual workspace/build/CI/deploy work not yet productized | App Factory is "NOT implemented" (`BLUEPRINT.md:116`); 11 app directories already exist (`ls apps`); ADR-0004:12 keeps MOONLAB gated | PASS (additive route) | FAIL (new workspace, CI, Dockerfile.web arg, routing, port) |
| K7 | Placement does not weaken reviewer independence | Same actor can author and approve, or desk can approve without a hub review event | Four-eyes is actor-level and server-side (`M14-01` §3; test `M14-06` passes); placement does not change it | PASS if D5/D7 hold | PASS only if the same server rule is reused |
| K8 | Locale, shell and accessibility are reused, not duplicated | New app must re-implement `id`/`en`, shell, a11y | HQ shell resolves locale and renders `lang` (`src/layouts/vertical.tsx:32-46`) | PASS | FAIL (duplication) |

K5–K7 are host-neutral: a standalone app would not make the API safer, and would not fix the role gap. K1, K2, K6 and K8 decide the placement, and all four fail for standalone today.

---

## 3. Revisit triggers

The decision must be revisited if **any** of the following is observed and accepted:

1. K1 becomes true: a reviewer/editor role is ratified and implemented (NA-2), and at least one non-admin research operator is a real, named user.
2. K2 becomes true: a documented runtime need (offline field research, dedicated compute, separate deployment cadence) that HQ cannot meet.
3. K6 becomes cheap: the App Factory (M05-17..M05-22) can generate a privileged Next app with `id`/`en`, CI, routing and rollback without manual repair.
4. M34-05 shows the desk cannot preserve reviewer separation because of UI coupling, **and** the failure is placement-specific (not a hub four-eyes failure, which would block either option).

A future extraction is frontend-only: it must keep D00 identity, ARSY/MoonQL D05 ownership, HQ/hub D08 approval and the same typed API contracts, and it requires its own accepted ADR analogous to ADR-0004.

---

## 4. Rejected option: standalone MoonLab now

`apps/moonlab` is rejected for the initial workbench because:

- It serves no distinct, ratified audience (K1) or runtime need (K2); MOONLAB screen 07 is itself an HQ desk (`docs/design/mockups-xv/README.md:16`).
- It adds a build/deploy/CI/routing boundary before the App Factory exists (`BLUEPRINT.md:116`), and ADR-0004:12 explicitly withholds independent ownership/deployment from MOONLAB.
- It purchases no security: every security property (identity, ACL, four-eyes, release gate) stays in ARSY/D08, which a second frontend cannot strengthen.
- It duplicates locale/shell/a11y work (K8) and makes rollback a deployment event instead of a route revert.

Also rejected: exposing MOONLAB on public Dock. Dock remains a reader; it may show research only through an approved D08 projection (M34-04/M19-19).

---

## 5. Consequences

**Positive**

- One privileged shell, one session mechanism, one ACL source; no second identity, Hub or SQL owner.
- MOONLAB is reversible: deleting a route area returns the system to today's state without a data migration.
- Containment is assigned to the API owner, so every future client inherits it.

**Negative / accepted costs**

- Authoring and review live in the same application; separation depends on server-side actor checks and route separation, not an app boundary. This is recorded as a residual risk for M34-05.
- HQ's generic model pages already reach `research_*` because the models declare `rest: true` with `ADMIN_WRITE` and `_schema.menu` includes them; the desk must not institutionalize that path (D5, E5).
- Any containment change to public endpoints breaks the shipped tests that currently assert anonymous 200s; M34-04 must replace those assertions with denial tests and record the contract change.

**Explicit non-goals**

- No new role, permission, login, session, API, database, migration, package or deployment.
- No D08 rights decision, no publication, no release manifest, no Dock positive projection.
- No change to M19-19 or M27-08 status: M19-19 stays fail-closed; M27-08 stays blocked (`TODO.md` M27-08 row) until an approved D08 projection exists.

---

## 6. Raw-research containment (E1–E7, plus E8–E10)

Containment principles:

1. **Owner-side first.** Withholding in Dock is necessary but not sufficient; the ARSY/MoonQL contract is the root. A frontend that stops calling a public endpoint does not close it.
2. **No anonymous D05 read.** Unreviewed cases, claims, witnesses, hypotheses, scores, traces and rights snapshots are not anonymous material. Public D05 output exists only as an approved D08 released-research projection.
3. **Withholding is not a rights decision.** Blocking a surface is always permitted under ADR-0003; it asserts nothing about clearance or ownership.
4. **Tests encode the current exposure.** `apps/arsy/test/research.test.ts:930-933` asserts anonymous 200 with all `CANDIDATE` hypotheses, and `m15-historical-pilot.test.ts:73,97,207` asserts anonymous 200 on the comparative view. Those assertions are the containment target, not the acceptance baseline, for M34-04.

| ID | Surface at `00b0064` | Observed state (verified) | Containment rule | Enforcement / consuming leaf |
|---|---|---|---|---|
| **E1** | `GET /research/hypotheses` | `requires: 'public'` (`packages/moonql-research/src/index.ts:691-696`); `listHypotheses` has no review-state filter (`projection.ts:452-474`); anonymous 200 with 3 `CANDIDATE` rows is asserted by the shipped suite (`apps/arsy/test/research.test.ts:930-933`) | Remove anonymous/public access. Until a D08 projection exists, require an authenticated, reviewer-capable caller; never serve CANDIDATE questions publicly | M34-04 decides endpoint fate; execution is a separately authorized source change |
| **E2** | `GET /research/case` | `requires: 'public'` (`index.ts:658-667`); `caseDetail` returns claims, witnesses, frames, hypotheses, metrics and `rightsSnapshot` (`projection.ts:226-291`, snapshot at 258); includes the `RIGHTS_UNKNOWN` case (`seed.ts:273-286`); anonymous 200 asserted by `public-projection-denial.test.ts:1051-1052` | Deny anonymous. Do not expose per-case rights snapshots or licensed/translation-derived text; no rights-unknown case enumerable publicly | M34-04; rights attribution under NA-4 |
| **E3** | `GET /research/trace` | `requires: 'public'` (`index.ts:680-689`); trace carries claim spans, witness conclusions and citations (`projection.ts:412-450`); anonymous 200 and byte-level content asserted (`public-projection-denial.test.ts:1064-1066`) | Deny anonymous. Trace is reviewer evidence, not public output; only an approved projection may publish a bounded derivative | M34-04 |
| **E4** | `GET /research/overview`, `GET /research/metrics` | `requires: 'public'` (`index.ts:649-678`); overview exposes per-case rights snapshot and stage/score state (`projection.ts:293-374`) | Overview may later be whitelisted as metadata-only with no per-case rights/content; metrics over unreviewed cases stay authenticated until a released projection exists. Default now: deny anonymous | M34-04 |
| **E5** | Raw REST: `research_cases`, `_frames`, `_claims`, `_relations`, `_witnesses`, `_quality_runs`, `_hypotheses` | `rest: true` + `acl: ADMIN_WRITE` (`index.ts:361-517`); `ADMIN_WRITE` omits `list`/`get` (`packages/moonql/src/model.ts:31-37`), default rule is public (`model.ts:128-129`), so list/get are anonymous (`acl.ts:13-30`, `rest.ts:120-126,162-198`). Confirmed: anonymous 200 and licensed-text bytes through `research_claims`/`research_witnesses` (`apps/arsy/test/public-projection-denial.test.ts:1038-1045`) | Change the read rule to admin-only (`ADMIN_FULL`-style or a row rule). Keep `rest: true` types only if rows are gated. Generic admin CRUD is not the desk write path (D5) | M19-19/M34-04 contract; execution separately authorized |
| **E6** | `GET /research/comparative-case`, `/jerusalem-70ce` | `requires: 'public'` (`historical-pilot.ts:258-271`); view self-declares `reviewState: 'REVIEWED_DISTINCT_DOMAINS'` with no review/counterevidence/MIZAN/pilot trail (inventory E6) | Fail closed to authenticated access pending re-ratification as a D08 fixture with a real sign-off, or retirement into the released projection | **NEEDS_ADR (NA-3)**; M34-04 consumes |
| **E7** | Dock `/reader/compare` | **Contained at this baseline**: the public page renders only the localized D08 withholding notice (`apps/dock/src/app/reader/compare/page.tsx:24-34`; copy `src/lib/states-copy.ts:96,237`); regression 3/3 passes | Keep fail-closed. No positive rendering until the approved projection exists | M19-19 owns Dock; M34-04 owns the projection |
| **E8** | Dock `ResearchExplorer` | Component exists, zero importers (`grep -rn "ResearchExplorer" apps/dock/src` returns only its own definition) | Keep unwired. Any future public research UI binds only to the released-projection type, never to `ResearchCasesRow/WitnessesRow/HypothesesRow[]` | M34-04 whitelist rule |
| **E9** | Dock `/research` | Withhold notice only (`apps/dock/src/app/research/page.tsx:26-34`) | Keep fail-closed | M19-19 |
| **E10** | Hub `/_schema` | Authenticated (`rest.ts:440` default `auth`) | Unchanged; route shape is not content, but M34-04 must record the published-ACL change when E1–E5 are tightened | M34-04 |

**Ordering constraint:** E1–E5 are the root exposures; E7/E9 are already fail-closed UI. Tightening the API first cannot increase public exposure and makes the desk's authorization meaningful. Until E1–E5 are tightened, any "HQ desk" over those endpoints is only as private as "any authenticated session", and the hub remains anonymously readable.

---

## 7. D08 boundary and M19-19

- No release record, release manifest, rights approval, editorial sign-off or takedown ledger exists in the model registry; the shipped matrix proves the absence from the live registry (`apps/arsy/test/public-projection-denial.test.ts:195-215`).
- The review engine can reach `eligible: true`, but every response hardcodes `publicationAvailable: false` (`review.ts:178-214`; `review-subsystem.ts:211,625,631,696,804,832,863,898,938,1148,1198,1216`).
- M19-19 remains **fail-closed** and open until M34-04 defines and an approved D08 projection exists; M27-08 remains blocked.
- M34-02 does not approve any public projection and does not re-ratify E6.

---

## 8. NEEDS_ADR register (not decided here)

| # | Question | Why it needs ADR authority | Blocks |
|---|---|---|---|
| **NA-1** | D08 released-research projection: authoritative release record (scope, approver, rights snapshot, withdraw/retract, takedown) | D08 owns all public publishing gates (BLUEPRINT:206; ADR-0003 §3). M34-04 may specify a contract, but cannot invent the authority or its state machine | M34-04's approved projection; M19-19 closure; M27-08 |
| **NA-2** | Implement the `editor`/`reviewer` role declared by M03-04 | Role values are D00 identity (`auth_users.role` enum `admin/user/guest`, `packages/moonql-auth/src/index.ts:43`). Adding a role widens identity and session semantics | Reviewer-only desk access; a true wrong-role acceptance test in M34-05 |
| **NA-3** | Re-ratify the M15 Jerusalem comparative view (`REVIEWED_DISTINCT_DOMAINS`) as a D08 fixture or retire it | Rights and review sign-off are D08; the current state is self-declared in code (`historical-pilot.ts:121-256`) | E6 containment choice |
| **NA-4** | Rights attribution for `QS_2_82_id_kemenag` | The corpus seed labels it `RIGHTS_EXACT_VERSION_CLEARED` / "Public Domain / Open Translation" (`packages/moonql-corpus/src/index.ts:279-292`), while the research seed calls it a "licensed translation" (`packages/moonql-research/src/seed.ts:475`). Neither is a D08 rights record | E2/E3/E5 byte-level exposure; the released projection's rights field |

Until these are accepted, the affected surfaces stay withheld by default; withholding is not a rights determination.

---

## 9. Migration plan

No schema, data, package, lockfile, environment or deployment migration occurs. The "migration" is access and UI placement:

1. **Phase 0 (this artifact):** record the placement and containment policy; no runtime change.
2. **Phase 1 (M34-03):** add a private route area in `apps/headquarters`, server-guarded, using explicit hub endpoints; drafts remain `DRAFT`/`CANDIDATE` and are never public.
3. **Phase 2 (M34-04):** specify the D08 projection and the per-row E1–E7 contract change; resolve NA-1/NA-3/NA-4 or keep the surface withheld.
4. **Phase 3 (M34-05):** add reviewer-separation and wrong-role tests against the desk and hub; assert anonymous denial, same-actor refusal, and no generic-CRUD bypass.
5. **Phase 4 (M19-19/M27-08):** only after an approved projection, wire the positive Dock path and unblock the release track.

If a future ADR selects `apps/moonlab`, Phase 1's route moves as a frontend-only extraction; D05 endpoints, identity and release controls do not move.

---

## 10. Rollback

| Change | Rollback | Consequence |
|---|---|---|
| This decision document | Delete the file | None; no runtime effect |
| HQ desk route (M34-03) | Revert the additive route commit; the previous HQ pages remain | Desk disappears; Dock stays fail-closed |
| API containment (E1–E5) | Revert only with an approved D08 projection or an owner-signed rights exception, and with denial tests updated deliberately | A blind revert re-exposes unreviewed content and, for E2/E3/E5, bytes that `corpus_translations` withholds |
| Projection (M34-04) | Withdraw/disable the projection and keep Dock withholding | Public research returns to the current fail-closed state |

There is no database migration to undo and no data to move, because D05 rows never leave ARSY/MoonQL.

---

## 11. Follow-up leaves that consume this decision

| Leaf | Consumes | Must not do |
|---|---|---|
| **M34-03** — Specify source-linked case and hypothesis drafts | D1/D3/D5/D7; HQ host; private `/research/*` route area; draft objects carry source locator, exact SHA, uncertainty and counterevidence; server-side guards before any read | Add a role, a database, a public surface, or generic-CRUD governed writes; publish drafts |
| **M34-04** — Specify D08 released research projection | D6/D8; the E1–E7 matrix; NA-1/NA-3/NA-4; API-first containment; E7/E9 stay withheld; E8 binds only to the projection type | Invent a release authority or rights decision; claim an approved projection; approve E6 by assertion |
| **M34-05** — Test reviewer separation and wrong-role access | D4/D5/D7; four-eyes at the hub (`common.ts:74-88`); negative tests for anonymous, guest, same-actor, forged SHA and generic-CRUD bypass; desk guard tests | Add `editor`/`reviewer` to make a test pass; treat hidden routes as authorization |

Downstream constraints, not owned by M34: M19-19 stays open and fail-closed; M27-08 stays blocked; M27-05's "no unreviewed/rights-unknown raw source publicly served" gate depends on M34-04.

---

## 12. Evidence observed at baseline (file:line)

- Single hub/addon wiring: `apps/arsy/src/addons.ts:15,39`; REST mount `apps/arsy/src/app.ts:69`.
- Public research endpoints: `packages/moonql-research/src/index.ts:649-696`; comparative `historical-pilot.ts:258-271`.
- Raw REST ACL: `index.ts:361-517`; `packages/moonql/src/model.ts:31-37,128-129`; `acl.ts:13-30`; `rest.ts:120-126,162-198`.
- Review fail-closed: `review.ts:171,178-214`; `review-subsystem.ts:211` and siblings; `seed.ts:623-625`.
- Named-human four-eyes: `common.ts:74-88`; `M14-01` §3.
- HQ authorization: `apps/headquarters/src/lib/authz.ts:7-17,50-101`; admin layout `src/app/(admin)/layout.tsx:5-9`; middleware `src/middleware.ts:3-17`; server SDK `src/data/server-sdk.mjs:4-10`; no SQL dependency in `apps/headquarters/package.json`.
- HQ research decoration only: `src/app/(admin)/page.tsx:101,207`; `src/layouts/vertical.tsx` nav; `src/lib/shell-copy.ts:122` points "Research Lab" at `/models/monitor_radars`.
- Dock containment: `apps/dock/src/app/research/page.tsx:26-34`; `src/app/reader/compare/page.tsx:24-34`; `src/lib/states-copy.ts:96,237`.
- Confirmed byte-level exposure: `apps/arsy/test/public-projection-denial.test.ts:1015-1066`; absence of D08 tables: same file 195-215.
- Executed checks (see companion evidence note): research/MIZAN 22/22, HQ authz 23/23, Dock withholding 3/3, public-projection matrix 14 pass + 1 skipped "NOT SATISFIED".

---

## 13. Conflicts found

1. **Role authority vs implementation.** M03-04 §2 declares `editor`/`reviewer` for D05/D08; `auth_users.role` is `admin/user/guest` (`packages/moonql-auth/src/index.ts:43`) and `humanActor` accepts only admin/user. A reviewer-only desk cannot be built without NA-2.
2. **M34-01 E7 is historical.** At `76ecdc5`/`bb751262` the comparative page served hardcoded text; at `00b0064` it is fail-closed with a passing regression. The inventory's E7 verdict is correct for its baseline only.
3. **M34-01 understates E2/E3/E5.** The inventory records unreviewed/rights-unknown exposure; the shipped matrix additionally proves that bytes from `corpus_translations` (an `ADMIN_FULL` model) are served anonymously through research paths (`public-projection-denial.test.ts:1015-1066`). Severity is higher than the inventory wording.
4. **Rights self-description conflict.** The same translation is labelled open/public domain in the corpus seed and "licensed" in the research seed (NA-4).
5. **TODO wording is stale.** The M34-02 row calls the prior artifact a "worktree proposal"; `docs/audit/M34-02-moonlab-host-placement.md` is tracked at `724fb15`. Status is still open and unratified.
6. **Generic HQ CRUD is a bypass.** `research_*` models are `rest: true`; an admin can PATCH governed fields through the generic model page without a review event (hooks in `index.ts:548-646` validate shape, not review state). The desk must not use it (D5), and M34-05 should test it.
