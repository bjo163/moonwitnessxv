# M33-02 — SHADOW host placement decision (recommendation)

**Status:** RECOMMENDATION — not ratified. No TODO row, ADR or application source is changed by this artifact.
**Task:** M33-02 — Decide HQ embedded versus separate SHADOW UI ([packet](../tasks/M33/M33-02.md)).
**Baseline:** `dev` at `5b70e76cfe81a9d310c17f4a02ca022aa84beb87`; prerequisite M33-01 is closed at `3a6f0b4`.
**Owner decision required:** the integrator/owner accepts or rejects this recommendation. A leaf agent cannot ratify an ADR, close M17-05, or pre-approve an extraction.

## 1. Question and scope

Where is the first SHADOW creative authoring surface hosted: inside the existing Headquarters application, or as a separate `apps/shadow` application?

This is a UI host and placement decision. It does not reassign a domain, a stored model, a permission system, a locale contract or a deployment topology. At the baseline, the only real creative code is the public Dock `/studio` demo (deterministic SVG avatars, seals and glyphs with clipboard/SVG/PNG export); the HQ "Story Forge" and "Poster Lab" cards are navigation with hardcoded counts, and no story, scene, poster, rights or version store exists (M33-01 ledger).

Out of scope: building the editor, choosing the authoritative renderer (M33-04), defining scene versions or media rights (M33-03), verifying private poster access and attribution (M33-05), and any schema, route, package, role or deployment change.

## 2. Options compared

| ID | Option | Auth and session | Data and runtime | Cost now | Decision |
|---|---|---|---|---|---|
| `HOST-HQ` | SHADOW editor embedded in Headquarters as a dedicated, permission-gated workspace | Reuses the existing `hq_token` cookie, ARSY `/auth/me`, and the server-side `guardModel`/`guardView` decision space | Calls D07 through the existing HQ server data/action layer to ARSY; HQ holds no data | One new HQ area plus extraction of the reusable generator into a shared package | **Recommended** |
| `HOST-APP` | Separate `apps/shadow` application | Needs an authorized cross-origin session mechanism that does not exist today (see A17) | Still ARSY-only, still no own API or database | New workspace, port, Dockerfile, compose service, CI entry, app shell, locale catalogs, login path and denial copy | Not recommended now |

### 2.1 Rejected alternative: host the editor in public Dock

Dock `/studio` is a public DEMO route with no auth boundary at all, and Dock has no auth anywhere. Making it private would introduce a session boundary into the public reading app and contradict the `DEMO` label the public information architecture requires. Dock stays the public demo consumer of the same generator component; it does not become the editor.

## 3. Recommendation

**Recommendation:** `HOST-HQ` — host the first SHADOW editor as a dedicated, permission-gated workspace inside the existing Headquarters application. Keep Dock `/studio` as the public DEMO consumer of the same generator component. Revisit a separate app only under the extraction conditions below.

Reasons, in order of weight:

1. **The open implementation task already names this host.** M17-05 is "Build SHADOW editor as HQ workspace on shared auth" (A06). M33-02 must not pre-empt an open task's defined host with a different one.
2. **The blueprint already describes SHADOW as an HQ area that may later be extracted.** It states that SHADOW and 100CENTER are areas in Headquarters, not separate IAM services (A01), and describes `apps/shadow` as a proposed extraction of the HQ workspace (A02).
3. **HQ is the only surface that already has a server-side identity, session and ACL boundary.** The middleware gates on the HQ session cookie (A13), the layout resolves the ARSY user, and authorization borrows the hub's `/auth/me` and published ACL rather than owning a role table (A14, A15, A16). That is exactly the "shared auth" M17-05 requires. Dock `/studio` has neither auth nor persistence.
4. **A separate origin cannot reuse today's session, and no broker is authorized.** The HQ cookie is host-scoped with no `Domain` attribute and the SSO design forbids broadening it to a parent domain by default (A17). A second app would therefore either mint its own login (a second session boundary) or require an unapproved code-exchange broker — both rejected by the identity constraint in §4.
5. **Review handoff and release authority already live in HQ.** M33-04's handoff and D08 publication gates are HQ concerns (A09). Co-location removes a cross-origin handoff without moving approval authority into the editor.
6. **A ninth app is real operational cost before any distinct audience is proven.** PORTS is a closed list of eight services (A20); a new app also needs a Dockerfile, a compose service, a registry entry, CI wiring, an app shell and its own locale and denial copy.

### 3.1 Revisit (extraction) conditions

Move to `apps/shadow` only when all of the following hold: (a) a measured, distinct authoring audience or product boundary exists that is not governance work; (b) an accepted ADR defines the cross-app session topology under the M37-02 rules; (c) M17-03 and M33-03 through M33-05 are closed; and (d) the extraction keeps ARSY/D00 identity, D07 records, D08 approval and ECHOLOG bytes exactly where they are.

### 3.2 What would falsify this recommendation

A measured HQ bundle or interaction regression that cannot be code-split; a rights requirement that creative drafts must never share an origin with governance screens; or an owner decision to sell SHADOW as a separate product with its own brand and tenant story.

## 4. Shared constraints that bind either host

1. **ARSY remains the sole identity authority.** SHADOW never mints users, sessions, tokens or roles, and never adds a login UI or credential store. There is no second login; roles come from existing D00 (M03-04's canonical `editor`/`reviewer`, A12), never from a local role table.
2. **No new SQL owner.** D07 records belong to a MoonQL addon mounted in ARSY. The editor holds no schema, migration, ORM import or direct database connection. ECHOLOG (D19) owns object bytes and still owns no tables.
3. **No second Hub.** No SHADOW REST service, model catalog, graph or publication engine, and no redirect that bypasses the single Hub.
4. **One shared auth/session boundary.** Every protected page, server action and data call validates session, role and scope against ARSY on the server. Cookie presence is not authorization, and hidden UI is not authorization; deny-by-default and role-negative tests are mandatory (A14, A16).
5. **One locale boundary.** ADR-0005 `id`/`en` with 1:1 catalog parity and English fallback; machine identifiers, route names and API fields are never localized. HQ resolves locale from the persisted `mw_locale` cookie then `Accept-Language` (A11); Dock resolves from the `/id` and `/en` route roots. A new host must adopt one of these, not invent a third.
6. **Rights, privacy and honest state.** No export, publish or share path without an explicit rights/consent state (ADR-0003). D08 stays the publication authority. No invented counters and no fictional `LIVE`/`NOMINAL` state; today's HQ Story Forge and Poster Lab badge counts are static literals and must not be copied into a real workspace.

## 5. Consequences

### 5.1 If `HOST-HQ` is accepted

- **Gained:** no new app, port, container, CI job or origin; session, ACL, denial copy, locale resolution, MoonUI primitives and server data/action patterns are reused; review handoff stays inside one application.
- **Cost:** the reusable generator must leave `apps/dock` for a package both hosts may import, because an app-to-app import is not a declared dependency and would bypass package ownership. Which renderer that package owns is M33-04's decision, not this one.
- **Cost:** the studio client component currently carries hardcoded uppercase English labels (A19) and no locale plumbing, so an `id`/`en` catalog, keyboard/ARIA and reduced-motion work are prerequisites, not polish.
- **Risk:** a creative surface inside a governance shell can blur roles. Mitigate with a distinct `/shadow` area, explicit draft-state wording, no publish control, and server-side reviewer separation rather than route hiding.
- **Risk:** a large client component in the privileged app. Mitigate with lazy/code-split loading measured in the implementation task.
- **No effect on ownership:** HQ gains no identity store, schema, approval engine or publication authority; D07 stays ARSY's.

### 5.2 If `HOST-APP` is accepted

- **Must be decided first:** an authorized cross-origin session mechanism. Host-only cookies do not travel between production hosts, and no code-exchange broker or SSO flow is authorized today (A17).
- **Must be added:** workspace and manifest, a port in the closed `PORTS` list (A20), `scripts/apps.registry.mjs` entry, Dockerfile, compose service, CI wiring, app shell, `id`/`en` catalogs, denial copy, and its own auth-negative and role-negative tests. `docs/architecture/APPS.md` and the README app count would need updating.
- **Gained:** independent release cadence, independent branding ("brutalist creative studio"), and a smaller privileged origin.
- **Risk:** two session boundaries drift apart; ACL enforcement exists in two places; locale and denial copy duplicate; delivery of M17-05 is delayed behind new infrastructure with no proven audience.

## 6. Prerequisites before either option is implemented

| ID | Prerequisite | Why it blocks the editor |
|---|---|---|
| P1 | M17-03 story world/arc/episode/scene/version graph closed | There is nothing to edit until D07 kinds and identity exist |
| P2 | M33-03 scene version and media rights specification | Drafts need version identity and a rights state before they can be stored or shown |
| P3 | M33-04 single renderer and HQ review handoff | The current studio is a flat SVG demo with no canvas, layers or selected-object model; one renderer must be named |
| P4 | M17-06 media licensing plus M33-05 private access and attribution | No export, share or publish path without rights and access evidence |
| P5 | A D07 MoonQL addon owned by ARSY with deny-by-default REST and published ACL | Keeps one SQL owner and one Hub; the UI must not create a parallel store |
| P6 | Editor/reviewer assignment under D00 with server-side negative tests | Private drafts and revision permissions are the M17-05 acceptance condition, not a UI toggle |
| P7 | Reusable generator extracted to a package with its own tests | Removes any app-to-app import; subject to P3 for which renderer is authoritative |
| P8 | `id`/`en` catalogs, keyboard/ARIA and reduced motion on MoonUI tokens | ADR-0005 parity and MASTER_DESIGN behavior are release gates, not follow-ups |
| P9 | Only for `HOST-APP`: accepted cross-app session ADR under M37-02, plus port, registry, Dockerfile, compose and CI entries | Without it a second app creates a second session boundary or an unapproved broker |

## 7. Evidence anchors

Every quote below is a verbatim substring of the cited `path:line` at the baseline and is re-resolved by `scripts/check-m33-02-shadow-host-placement.mjs`.

| ID | Locator | Quote |
|---|---|---|
| A01 | `BLUEPRINT.md:83` | SHADOW and 100CENTER are areas in Headquarters, not separate IAM services |
| A02 | `BLUEPRINT.md:98` | Proposed extraction of HQ workspace; D07 records, no parallel publisher |
| A03 | `BLUEPRINT.md:142` | PLANNED, no current code |
| A04 | `BLUEPRINT.md:199` | All apps; no SHADOW second login |
| A05 | `BLUEPRINT.md:206` | SHADOW workspace consumes it |
| A06 | `TODO.md:420` | Build SHADOW editor as HQ workspace on shared auth |
| A07 | `TODO.md:722` | PLANNED, no implementation implied |
| A08 | `TODO.md:851` | one user/IAM system for HQ/100CENTER |
| A09 | `docs/decisions/ADR-0004-empire-surfaces.md:7` | Headquarters / 100CENTER remains the human-governance surface |
| A10 | `docs/decisions/ADR-0004-empire-surfaces.md:12` | do not get independent ownership, schemas, or deployments |
| A11 | `docs/decisions/ADR-0005-locale.md:29` | The user's explicit, persisted locale selection. |
| A12 | `docs/decisions/M03-04-tenant-role-boundaries.md:24` | `editor` / `reviewer` |
| A13 | `apps/headquarters/src/middleware.ts:11` | if (request.cookies.get('hq_token')) return NextResponse.next() |
| A14 | `apps/headquarters/src/lib/authz.ts:10` | HQ is NOT an auth or ACL owner |
| A15 | `apps/headquarters/src/lib/session.ts:5` | The admin token lives in one opaque, httpOnly cookie |
| A16 | `apps/headquarters/src/app/api/session/route.ts:6` | login + logout are the ONLY places the token crosses the server boundary |
| A17 | `docs/design/M37-02-sso-session-redirect-boundary.md:14` | Do not broaden cookie `Domain` to a parent domain by default. |
| A18 | `docs/design/M19-03-public-ia.md:35` | publishing awaits M33 |
| A19 | `apps/dock/src/ui/client/GeneratorStudio.tsx:719` | { id: 'avatar', label: 'AVATAR FORGE' }, |
| A20 | `packages/core/src/workspace.ts:16` | export const PORTS = { hub: 3000, dock: 3001, headquarters: 3002 |
| A21 | `docs/audit/ui-p02-p12-audits-fe8e84c.md:143` | there is no `scene_versions`, no rights store, and no review queue |

## 8. Non-goals and stop conditions

- This artifact is a recommendation. No `apps/shadow` workspace is created by this artifact, and no route, package, schema, role, cookie, port or compose service is added.
- No ADR is created or edited here. If the owner wants this binding, an ADR is the owner's and integrator's step, not a leaf agent's.
- No TODO row is checked and no milestone is declared implemented. M17-05 and M33-03 through M33-05 remain open.
- **Stop** if the owner rejects the host choice, or if a required editor permission cannot be expressed through ARSY's published ACL, or if the rights/consent review for drafts is missing, or if implementing either option would require editing an accepted ADR.

## 9. Limitations and evidence status

- Source inspection only, at the recorded baseline. The working tree was already dirty from parallel sessions; anchors are re-resolved from the working tree by the validator, so a concurrent edit that moves a cited line must be caught by re-running it before integration.
- No browser, dev server, database, ARSY instance, build, typecheck or deployment was run for this artifact, and no visual, keyboard or responsive behavior is claimed.
- "No cross-origin session mechanism exists" is an inference from the host-only cookie and the M37-02 prohibition, not a penetration test. It is stated as a design constraint, not a security certification.
- No secrets, environment values, credentials, private witness material or unapproved source content were read into or written by this artifact; only minimal public locator quotes are reproduced.
- The recommendation is not ratified, does not close M17-05, and does not make any M33 leaf implemented.
