# UI2-G11 — superseding M38/M39 status snapshot at `25bd536`

**Scope:** `todo-ui-2.md` **UI2-G11** (Backend liaison, `docs/audit/ superseding note only`): "Update superseding M38/M39 status snapshot; do not describe current APIs as mere skeletons. DoD: M38-11/M39-10 present; M38-12/13 and M39-11/12 open." **This note does not tick UI2-G11 or any task checkbox.**
**Rules:** [ADR-0006](../decisions/ADR-0006-skylink-communication-surface.md) · [ADR-0007](../decisions/ADR-0007-echolog-storage.md) · **Prior:** [ui-reader-rail-ab44093](ui-reader-rail-ab44093.md) · [M38-11 evidence](M38-11-skylink-rest-ws.md) · [M39-10 evidence](M39-10-echolog-s3-endpoint.md) · [M39-11 evidence](M39-11-operator-console-render.md) · **Tasks:** [TODO.md](../../TODO.md) · [todo-ui-2.md](../../todo-ui-2.md)

## 0. Baseline recorded before writing anything

| Item | Observed |
|---|---|
| Branch | `dev` (no topic branch created, per Owner Policy) |
| HEAD | `25bd5361b62ce558622cebaae12166c7bc73a87d` |
| Working tree | **not clean.** Other sessions' uncommitted files present throughout and left untouched: `M apps/skylink/src/modules/routes.ts`, `?? apps/arsy/src/lib/skylink.ts`, `?? apps/arsy/test/skylink-client.test.ts`, `?? docs/audit/M38-12-arsy-skylink-client.md`, the ARSY/Cockpit/Orbit set and `docs/audit/screens/*`. None were added, modified or committed here |
| New file created | this note only; no other file edited |
| Commands actually run | `git rev-parse`, `git status --porcelain`, `git log --oneline --grep=…`, `git merge-base --is-ancestor`, `git show HEAD:…`, `git diff HEAD -- …`, `git ls-files`, plus `grep`/Read over source and docs. **No** test/build/lint/typecheck executed, **no** dev server or listener started, ports 3000–3006 untouched, **no** install, **no** `git add/commit/checkout/reset/stash/clean` |
| Method caveat | SHAs, checkbox states, routes and test-file counts are read from the committed tree and TODO rows; suite pass/fail totals are **quoted from the closing evidence docs**, not re-run here |

## 1. Six-task snapshot vs the UI2-G11 DoD

| Task | TODO row | Checkbox | Closing commit(s) | Evidence |
|---|---|---|---|---|
| **M38-11** SKYLINK REST/WS + 2 auth modes + dup-channel guard | `TODO.md:809` | `- [x]` present | impl `a53fffe`; doc-close `d54ad43` | [M38-11-skylink-rest-ws.md](M38-11-skylink-rest-ws.md) |
| **M38-12** ARSY as SKYLINK client behind `SKYLINK_ENABLED` | `TODO.md:810` | `- [ ]` open | none (`git log --grep=M38-12` empty) | untracked in-progress [M38-12-arsy-skylink-client.md](M38-12-arsy-skylink-client.md) |
| **M38-13** SKYLINK operator UI + design gates | `TODO.md:811` | `- [ ]` open | none (`--grep=M38-13` empty) | — |
| **M39-10** ECHOLOG bounded S3-compatible endpoint | `TODO.md:841` | `- [x]` present | impl `5ff7486`; exact `21f3bc7`; doc-close `d54ad43` | [M39-10-echolog-s3-endpoint.md](M39-10-echolog-s3-endpoint.md) |
| **M39-11** ECHOLOG handoff + operator UI + design gates | `TODO.md:842` | **`- [x]` CLOSED** | impl `b669de2`; exact `f0cdc3f`; doc-close `dee9b40` | [M39-11-operator-console-render.md](M39-11-operator-console-render.md) + [m39-11-operator-console.png](m39-11-operator-console.png) |
| **M39-12** ECHOLOG e2e proof + rollback + changelog | `TODO.md:843` | `- [ ]` open | none (only doc commit `07d1d2e`) | [M39-12-e2e-rollback.md](M39-12-e2e-rollback.md) |

All closing SHAs verified reachable from HEAD (`git merge-base --is-ancestor` returned "ancestor" for `a53fffe 5ff7486 21f3bc7 b669de2 f0cdc3f d54ad43 dee9b40 07d1d2e`).

**DoD is itself superseded on one clause.** UI2-G11 expects "M39-11 … open," but M39-11 closed at `f0cdc3f` (impl `b669de2`, doc-close `dee9b40`) after the gate text was written. The other five clauses hold exactly: M38-11/M39-10 present; M38-12/M38-13/M39-12 open. Reality to hand to the owner: **M39-11 is closed, only M39-12 remains open on the ECHOLOG line**; the operator console the DoD assumed still missing already ships.

## 2. M38-11 — what the delivered SKYLINK code actually is

Package `@moonwitness/skylink` (`apps/skylink`), a standalone Fastify service (deps: `@fastify/websocket`, `skylink-core`, `skylink-store`, `skylink-telegram`). This is a real, tested control plane, **not a skeleton**. Committed routes in [apps/skylink/src/modules/routes.ts](../../apps/skylink/src/modules/routes.ts): `GET /api/v1/channels` (`:128`), `POST /api/v1/send` (`:140`), `POST /api/v1/broadcast` (`:160`), `POST /api/v1/channels/:id/start` (`:179`), `POST /api/v1/channels/:id/logout` (`:183`), `GET /api/v1/conversations` (`:187`), `GET /api/v1/conversations/:id/messages` (`:200`), `GET /api/v1/channels/accounts` (`:216`). Plus [ws.ts:22](../../apps/skylink/src/ws.ts) `GET /ws` (first-frame auth, `channel.state` events) and [webhooks.ts:26](../../apps/skylink/src/modules/webhooks.ts) `POST /api/v1/webhooks/:provider`. Two auth modes: `x-skylink-key` (service, send-only scope) or `Authorization: Bearer` validated upstream against ARSY `/api/v1/auth/me` ([auth.ts:34](../../apps/skylink/src/auth.ts)); no local JWT/cookie/login.

Tests: [apps/skylink/test/control-plane.test.ts](../../apps/skylink/test/control-plane.test.ts) (5) + [skylink.test.ts](../../apps/skylink/test/skylink.test.ts) (5); `pnpm --filter @moonwitness/skylink test` reported **10/10** against real Postgres (M38-11 doc §positive). Providers wired at [index.ts:34](../../apps/skylink/src/index.ts): **Telegram only** — `channels.register(createTelegramSkylinkChannel(...))`; the WhatsApp adapter package is **not** registered in the service.

**Operator web UI: none.** SKYLINK has no client/UI directory at all (only `src/` + `test/`). A user reaches the API only through ARSY; browsing channels/pairing/inbox as a web screen does not exist — that is M38-13, open.

## 3. M39-10 + M39-11 — what the delivered ECHOLOG code actually is

Package `@moonwitness/echolog` (`apps/echolog`), a **stateless** Fastify service on its own filesystem volume. This is a real, tested API, not a skeleton.
REST objects ([modules/objects/index.ts](../../apps/echolog/src/modules/objects/index.ts)): `POST /api/v1/objects` (`:65`), `GET /api/v1/objects/sha256/:digest/meta` (`:118`), `GET /api/v1/objects/sha256/:digest` (`:132`), `DELETE …` (`:163`), `POST /api/v1/gc` (`:188`).
S3 subset ([modules/s3/routes.ts:51](../../apps/echolog/src/modules/s3/routes.ts)): allow-list `HeadBucket`, single-request `PutObject`, `GetObject`, `HeadObject`, `DeleteObject`, `ListObjectsV2` (SigV4 header auth, [sigv4.ts](../../apps/echolog/src/modules/s3/sigv4.ts)); multipart/presign/batch-delete/versions/ACL/virtual-host fail closed with S3 XML (`501`). Deliberately a bounded subset, **not** full S3. MinIO removed.
Tests: [s3-server.test.ts](../../apps/echolog/test/s3-server.test.ts) (7), [operator-client.test.ts](../../apps/echolog/test/operator-client.test.ts) (10), fs-driver (9), echolog (6), + e2e/limits/object-routes/s3-upload-limiter (1 each) = **36**; suite reported 36/36 at `21f3bc7` (M39-10 doc §revalidation).

**Operator web UI: exists and ships (M39-11).** [apps/echolog/client/App.tsx](../../apps/echolog/client/App.tsx) + components + [lib/api.ts](../../apps/echolog/client/lib/api.ts), a Vite React/MoonUI console (`dev:client`/`build:client`). What a user can do there: paste an ARSY session bearer (kept in memory only, opt-in — no token = no reads/writes, `App.tsx:208`), read object metadata, request a download grant, delete (with confirm; 409 legal-hold/retention refusal shown verbatim), upload against the shipped MIME allow-list, run administrator GC. Enumeration stays server-side; the console keeps a **local watchlist of consumer references only** (`{object_key, digest, size, content_type}`). What it cannot do and does not claim: it is a loopback dev console over the documented REST API, not a production-embedded admin panel; the retained screenshot/keyboard evidence used a **synthetic** session token, not a real ARSY login or a live provider; scan status is shown honestly as `not scanned`; it is not a data owner and issues no identity. Screenshot [m39-11-operator-console.png](m39-11-operator-console.png), 1440×1000, loopback, no private data.

## 4. Open tasks — precise state, not "nothing"

- **M38-12 (open, in progress).** Untracked evidence doc + uncommitted source exist in the tree: `?? apps/arsy/src/lib/skylink.ts`, `?? apps/arsy/test/skylink-client.test.ts`, and an uncommitted edit adding `POST /api/v1/channels/register` (service-key, `id/label/state` only) + a `'service'` `RoutePolicy` to `routes.ts` (`git diff HEAD`). The evidence doc itself states `result_sha: partially committed by a concurrent session, not by this task` and the row is `- [ ]`. Per M38-12 doc §limitations, WhatsApp is not wired into the SKYLINK service, so flag-on WhatsApp is unavailable. **This is not closed code** — it is one session's dirty work-in-progress; TODO keeps it open.
- **M38-13 (open).** No SKYLINK operator UI exists; nothing found.
- **M39-12 (open).** Only a doc commit `07d1d2e` ("refresh M39-12 rollback evidence"); row `- [ ]`, awaiting M39-10/M39-11 exact-SHA integration plus SKYLINK consumer rollback/no-op evidence.

## 5. Stale statements ledger (quoted, not edited)

| # | File:line | Stale sentence (quoted) | Accurate replacement |
|---|---|---|---|
| 1 | [AGENTS.md:10](../../AGENTS.md) | "**SKYLINK is accepted (ADR-0006) and has only an M38-07 health skeleton:** messaging, D18 storage and UI are not implemented" | "SKYLINK is accepted (ADR-0006). D18 storage (M38-08, `@moonwitness/skylink-store`) and the REST/WS control plane with two auth modes (M38-11) are implemented and tested; Telegram is wired and the WhatsApp adapter ships as a package not yet registered in the service. Only the operator UI (M38-13) and ARSY-client integration (M38-12) remain open." |
| 2 | [AGENTS.md:10](../../AGENTS.md) | "ECHOLOG is the accepted, **planned** D19 Object Storage & Attachments service" | "ECHOLOG is the accepted D19 service with a **shipped** stateless REST object API (M39-09), bounded S3-compatible endpoint (M39-10) and MoonUI operator console (M39-11); only e2e/rollback (M39-12) and consumers remain open." The clauses "owns no tables, is not a second Hub, must not become a SQL owner" stay correct. |
| 3 | [docs/architecture/SKYLINK.md:3](../architecture/SKYLINK.md) | "**M38-07 health-only skeleton exists.** Provider integrations, D18 storage and operator UI remain planned, not shipped." | "REST/WS control plane (M38-11), D18 store (M38-08) and the Telegram provider (M38-10) are shipped; the WhatsApp adapter exists as a package; operator UI (M38-13) remains planned." |
| 4 | [README.md:17](../../README.md) | "the LUMEN worker has no server, and **no SKYLINK/ECHOLOG operator UI is shipped**." | "…no **SKYLINK** operator UI is shipped (M38-13 open); ECHOLOG ships a bounded loopback operator console (M39-11, `apps/echolog/client`)." |
| 5 | [README.md:15](../../README.md) & [README.md:100](../../README.md) | "ECHOLOG … consumer UI and final end-to-end/rollback gates remain open (**M39-11/12**)" / "**M39-11/12** UI, e2e and rollback gates remain open." | "ECHOLOG operator UI is shipped (M39-11 closed at `f0cdc3f`); only the e2e/rollback gate (M39-12) remains open." |
| 6 | [docs/architecture/ECHOLOG.md:3](../architecture/ECHOLOG.md) | "implementation in progress (M39). This file records the contract, **not shipped behaviour**." | Internally inconsistent with the same file's line 58 ("every call below is the documented REST/S3 surface shipped by M39-09/M39-10"). Reword to: "M39-06..11 shipped; this file states the contract, and the shipped REST/S3/UI surfaces satisfy it. Consumers and M39-12 e2e/rollback remain open." Line 60 ("SKYLINK attachments **planned** — M38-12..M38-14 still open … `apps/skylink` contains no attachment storage code") stays accurate and is **not** stale. |

## 6. Boundaries re-verified in code (fact, this session)

| Boundary | Where checked | Result |
|---|---|---|
| Neither app is a second Hub / SQL owner beyond the closed set | [apps/arsy/test/workspace-topology.test.ts:189-208](../../apps/arsy/test/workspace-topology.test.ts) — asserts only `['packages/moonql', 'packages/skylink-store']` may import `drizzle-orm`/`postgres` (`:205`) | Holds. `apps/skylink` imports `@moonwitness/skylink-store` (the sanctioned D18 owner); `apps/echolog/src` imports **no** `moonql`/`drizzle`/`postgres`/orm (grep empty) |
| ECHOLOG owns no tables | grep over `apps/echolog/src` for `defineModel`/`pgTable`/`CREATE TABLE` | None. D18 tables live only in [packages/skylink-store/src/schema.ts](../../packages/skylink-store/src/schema.ts) (`channelAccounts`/`conversations`/`messages`/`deliveryAttempts`) + migration `0000_d18_messages_channels.sql` |
| Neither holds identity | `apps/skylink/src/auth.ts:34` and `apps/echolog/src/auth.ts:30` both resolve sessions by calling ARSY `/api/v1/auth/me` | No `/login` or session-issuing endpoint in either app (grep empty). ARSY is the single identity source; SKYLINK's `POST /channels/register` (uncommitted M38-12) is id/label/state only and writes no row |
| Neither may hold a model catalog | grep `catalog`/`aigateway`/`model.?registry` over `apps/skylink/src`, `apps/echolog/src`, `apps/echolog/client` | Empty — no catalog import or registration in either service |

## 7. Limits

Documentary + source-tree snapshot at HEAD `25bd536`. Test totals (SKYLINK 10/10, ECHOLOG 36/36, ui:check 0 violations, exact-SHA CI/promotion runs) are **quoted from the closing evidence docs**, not re-executed here. No build, lint, typecheck, server, listener or install was run; ports 3000–3006 untouched. Routes and checkbox states are read from the committed tree and `TODO.md`. M38-12/M38-13/M39-12 open-state is asserted against HEAD; the working-tree SKYLINK/ARSY edits are another session's uncommitted files and are explicitly **not** treated as shipped. No checkbox was ticked anywhere, including UI2-G11.
