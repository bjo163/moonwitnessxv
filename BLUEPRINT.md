# MOONWITNESS XV — MASTER BLUEPRINT
## One universe · one active repository · explicit evidence · bounded domains

> **Status: XV planning baseline v1.0 — 26 October 2026.**
> This file specifies a TARGET, not proof proposed modules have shipped. **Single development home:** [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv). Owner policy: work directly on existing `dev`, create no topic branches, promote verified changes to `main` only after required gates. This supersedes older `main`-only wording in historical snapshots.

**Document hierarchy:** [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) = why/what/history/99 chapters; **BLUEPRINT.md** = owner boundaries, desired behavior and architecture; [TODO.md](TODO.md) = unique execution task IDs, gates, priorities, dependencies, status. Code + actual SHA-specific test results = what works. An approved future XV ADR supersedes design proposals. Historical repository ADRs do not automatically become XV ADRs.

## ARSY — accepted central Hub identity (ADR-0001)

**Owner-approved naming decision, 26 October 2026:** ARSY is the single existing Fastify + MoonQL + API + plugin Hub. The current dev tree contains the in-place move to **apps/arsy / @moonwitness/arsy**. This is the same service, not a second backend. M28-13/M28-14 regression, integration, Docker and release evidence remain open, so the path/package move is not full production certification.

| Architectural label | Current dev implementation/state | Compatibility invariant |
|---|---|---|
| Hub application | **apps/arsy** | One Fastify + MoonQL Hub only |
| Hub package | **@moonwitness/arsy** | Same service identity; no duplicate API |
| Compose/service aliases | Must be checked against current runtime config and M28 evidence | One service, stable external compatibility |
| Operational label | ARSY — MoonWitness Application & Orchestration Hub | No claim of autonomous/divine authority |
| Radio capability | Stations, schedule, playlog, listening and channels | Remains the bounded SIGNAL/RADIO domain |
| Port / public API | 3000 / /api/v1 / /docs | Preserve unless separately reviewed and tested |
| Identity and run state | D00/ARSY contracts | One authorization authority and one canonical task-state owner |

**Source-of-truth ADR:** [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md). **Migration status:** the app/package move is present in dev; M28 remains open for compatibility, regression, integration, Docker and rollback evidence.

Legacy references to apps/radio and @moonwitness/radio remain in historical snapshots and may survive in compatibility variables/tests. They must not be blindly rewritten without inspecting the current file. Current source paths and test evidence take precedence over copied historical documentation.

### ARSY compatibility and release gates

- The in-place move to apps/arsy must remain one Hub, one MoonQL bootstrap and one database authority; never run apps/radio and apps/arsy as parallel production Hubs.
- Preserve /api/v1, port 3000, table IDs, Radio media/player routes, auth, Swagger and error envelope.
- Verify workspace scripts, pnpm lock importer, Dockerfiles/Compose, internal DNS, environment aliases, generated SDK, test fixtures and operational docs against the actual dev tree.
- Preserve old RADIO_* environment names during any approved compatibility window; conflicting values must fail explicitly.
- M28-13/M28-14 need exact-SHA evidence for relevant tests, Docker builds, PostgreSQL parity, integration and rollback before a production-ready claim.
- No database table rename merely because the Hub package is named ARSY.
- The owner policy remains direct work on dev; no new feature branches or force pushes.

## LUMEN — agent framework and worker boundary (ADR-0010, accepted 27 October 2026)

LUMEN is an accepted TypeScript framework at `packages/lumen` plus a separately runnable internal worker at `apps/lumen-runtime` (M41). Acceptance records an architectural decision under ADR-0010, not an implementation claim. ARSY remains the only Hub, the canonical identity/authorization and run-state owner; AI Gateway remains the model router; Headquarters/100CENTER owns human decisions; ORBIT remains presentation-only. LUMEN may not own SQL tables, connect directly to PostgreSQL, expose a public task API, bypass the AI Gateway, or approve its own tools.

The framework core is built from scratch, but standard schema validation, testing and telemetry components should be reused. V1 is one agent per run with explicit versioned sequential steps, bounded budgets, checkpoint/retry/cancellation, tool allowlisting and approval pause/resume. Delivery is treated as at-least-once with idempotency where supported; exactly-once arbitrary side effects and a general-purpose deterministic workflow replay engine are not promised. Long-term memory/vector DB, multi-agent swarms, arbitrary-code tools and Rust are deferred until a measured need and separate review. Full rationale, risks and source references live in [LUMEN research](docs/research/LUMEN-framework-deep-research.md); the accepted decision is [ADR-0010](docs/decisions/ADR-0010-lumen-agent-runtime.md), and the sole task plan is M41 in [TODO](TODO.md). Implementation leaves proceed only after prerequisite M29/M28 gates are satisfied.

## 0 — Decision and acceptance horizon

**North star:** People can inspect a source, its exact edition, context, witnesses, relationships, attributed interpretations, uncertainty, and its creative derivatives without confusing sacred text, historical evidence, personal testimony, AI conjecture or fiction. The product provides **knowledge, witness, research, creation and accountable action**, not algorithmic divine authority.

**Preserve and expand:** XV's Radio + MoonQL + Dock + Headquarters is a real engineering baseline and must survive every change. XV is not yet a shipped full Corpus/Research/Story universe. Old repos are archival primary sources or reviewed migration candidates, not live dev targets.

**Target launch slice:** existing Radio unaffected + rights-cleared QS 2:82 Reader source trace + one contextual lexical/figure relationship + reviewed research explanation + human governance + tested backup restore and security; World/Cosmos/Journey/99 agents are not prerequisites.

## 1 — Source and implementation snapshot

At master audit commit `43dfcdebfbaa1a7a078d2a0657a10cfdae2ce298`, XV tree contained 244 files and **no GitHub issues found**. Confirm live HEAD again before any implementation.

| Existing implementation | Evidence paths | Contract to preserve |
|---|---|---|
| Fastify Hub, one MoonQL bootstrap | `apps/arsy/src/app.ts`, `apps/arsy/src/addons.ts` | One API, generated REST + explicit modules + channels |
| ORM, migration, addon registry, typed models | `packages/moonql/src/{boot,model,registry,rest,sync}.ts` | No duplicated models or routes; additive auto-sync only |
| SDK and OpenAPI | `packages/moonql-client`, `apps/radio/src/plugins/swagger.ts`, `apps/radio/src/tools/gen-sdk.ts` | Keep schema drift checks and envelope |
| Public Dock / Radio | `apps/dock/src/app`, `packages/moonql-stations`, `moonql-schedule`, `moonql-playlog` | Preserve station catalog/playback, live schedule, privacy |
| Admin Headquarters | `apps/headquarters/src/app`, `apps/headquarters/src/ui` | Reuse generic model forms, ops and session flow |
| Identity, ops and messaging | `moonql-auth`, `moonql-apikeys`, `moonql-ops`, `whatsapp`, `denpa` | Single authorization source; opt-in external integrations |
| Dev, tests, restore recipe | `package.json`, `apps/radio/test`, `docker-compose.yml`, `docs/runbook-restore.md` | Do not equate existence with passing tests/drill |

**Proven risk:** `packages/moonql/src/acl.ts` treats undefined ACL as public. `apps/arsy/src/config.ts` defaults `MOONQL_ACL_POLICY=warn`, whereas Docker Compose sets `require` for anonymous REST writes. That guard **does not prove GET/list/views/expand/export of sensitive models are protected**. `apps/headquarters/src/middleware.ts` tests cookie presence, not credential validity (Hub enforces actual authorization); generic MoonQL ops audits are asynchronous and not tamper-proof. The restore runbook has an empty execution ledger. All require gates before restricted data enters XV.

**Existing route convention** is the Hub `/api/v1` prefix, with `/docs` OpenAPI. **ADR-0001 supersedes the previous advice against renaming `apps/radio`: the owner selected ARSY as the Hub name.** Perform the physical rename **only with M28's compatibility and test gates**. Never create a second API/ORM authority merely to rename the existing Hub.

## 2 — Experience architecture: one discoverable product

| Mode | Public UI | Privileged UI | Domain owner |
|---|---|---|---|
| **DISCOVER** | Home, universal search, topic hub, history/guide | indexing/release diagnostics | projections; not canonical |
| **READ** | Corpus Reader, works, editions, passage, source and citations | source/rights steward | SOURCE/TEXT |
| **EXPLORE** | UNILEX, ontology, figure registry, prophetic missions, temporal/maps | identity and relation review | LEXICON/ONTOLOGY/ACTOR/EVENT |
| **RESEARCH** | Compare, Key Witness, SRGBL, MIZAN, counterevidence | reviewer desk, decision/retract | RESEARCH |
| **WITNESS** | Consented archive, event, fault line, past presence, correction | private witness editor | WITNESS |
| **STORIES** | Four creative lenses, 99-chapter archive, crew, episodes, posters | SHADOW story studio | STORY + MEDIA |
| **SIGNAL / RADIO** | **Existing** Radio stations, schedule, player | existing radio admin/channel ops | SIGNAL (existing) |
| **WORLD** | Future Earth Monitor, time/cosmos, experiments | World-source quality | WORLD (optional) |
| **JOURNEY** | Future voluntary paths, 33 patch archive, AETHERION fiction | 100CENTER mandate/mission | JOURNEY (optional) |

**One search, multiple lenses, one permission system.** The Prophetic Mission Table is a Figure/Actor registry view, not an independent prophet database; the Terms Table is the Lexicon view; Reader and Explorer share immutable source IDs; Constellation is a graph projection of reviewed relations, not another editable database; SHADOW and 100CENTER are areas in Headquarters, not separate IAM services. Existing Signal remains visible in the navigation.

Use progressive disclosure: search/read first; sources before analysis; reviewer and private tools only for authorized users. On mobile prioritize reading, search, stories and signal.

## 2A — Global ecosystem surfaces and implementation reality (proposal, 26 October 2026)

**Historical inventory at source SHA `bb3aed0`:** six app workspaces were present then. Current `dev` has eight app directories: `apps/arsy`, `apps/dock`, `apps/headquarters`, `apps/cockpit`, `apps/aigateway`, `apps/sentinel`, `apps/skylink`, and `apps/echolog`. Directory presence is not production certification; check current SHA-specific evidence for integration, deployment, localization, and restore.

### 2A.1 Branding and proposed future apps (not shipped)

| Experience | Runtime/code owner | Business responsibility | Status / boundary |
|---|---|---|---|
| LIGHTHOUSE | Proposed landing experience **within Dock** | Gateway for \`a-l-l-a-h.com\` | Proposed; domain, DNS and TLS unverified |
| DOCK | \`apps/dock\` | Public source-first reading, discovery, Stories, SIGNAL | Existing; public data-release gate still required |
| HARBOR | Proposed \`apps/harbor\` | Voluntary member/community, personal library, contributions | Proposed; one shared D00 identity |
| SHADOW | Proposed \`apps/shadow\` | Story/poster/media editing and source-aware creative drafts | Proposed extraction of HQ workspace; D07 records, no parallel publisher |
| MOONLAB | Proposed \`apps/moonlab\` | Research workbench, SRGBL/MIZAN candidate prep | Proposed extraction; D05 data, HQ review remains independent |
| WORKS | Proposed \`apps/works\` | Catalog, offers, CRM, work delivery, invoicing and revenue operations | Proposed; no independent payments bank or D00 |
| HELIOGRID | Conditional \`apps/heliogrid\` | Read-only energy site/meters, PV, battery/UPS/maintenance analytics | Proposed **only after** measured pilot; not an energy generator |
| HEADQUARTERS / 100CENTER | \`apps/headquarters\` | Review, publication veto, rights, finance oversight and audit | Existing UI, new governance flows not certified |
| COCKPIT | \`apps/cockpit\` | Developer process/log/preview supervisor | Existing local application, not public admin or production energy controller |
| AI Gateway / Sentinel | \`apps/aigateway\`, \`apps/sentinel\` | Internal bounded model routing / source collection | Existing workers/services, not public AI/monitoring authority |
| ARSY / SIGNAL | `apps/arsy` / `@moonwitness/arsy` | ONE Fastify/MoonQL API, data authority and existing Radio domain | Runtime/package move present in `dev`; M28-13/M28-14 integration and release evidence remain open |
| **SKYLINK** | `apps/skylink` (M38) | REST + WebSocket control plane and provider adapters are present; ARSY integration, operator UI and e2e release proof remain open (M38-12..14) | Accepted ADR-0006; bounded service, not a second Hub; owns D18 only |
| **ECHOLOG** | `apps/echolog` (M39) | Filesystem-backed content-addressed storage and bounded S3-compatible subset are present; UI and final e2e proof remain open (M39-11/12) | Accepted ADR-0007; stateless, no tables; not a second Hub; owns D19 only |
| **ORBIT** | Planned `apps/orbit` (M40) | Standalone 3D-first spatial frontend with accessible 2D fallback | Accepted by ADR-0004; not implemented; shares D00/ARSY; no backend/domain/DB of its own |

**Proposed D14–D17 (not accepted domain contracts):** D14 Community/Membership; D15 Commerce & Work; D16 Financial Operations/treasury oversight; D17 physical Energy & Assets. Design governance by separate ADR before creating schemas. Each model has precisely one ARSY/MoonQL owner; frontend boundaries do not confer database ownership. WORKS initially sells actual existing products/services via appropriately licensed payment providers; multi-seller wallets, banking, speculative tokens and automated payouts are out of initial scope. HELIOGRID pilot must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation/savings. No second REST hub, login system, editor, approval engine or graph database.

**D18 — accepted carve-out (ADR-0006):** **D18 Messages & Channels** is owned by **SKYLINK** (`apps/skylink`), the single accepted exception to "every model is owned by ARSY/MoonQL". SKYLINK owns one dedicated `skylink` schema and is the **second and final** SQL/migration owner besides \`@moonwitness/moonql\`; a guard test must keep that set closed. The carve-out authorizes **no** second REST hub, no second login/identity system, no second publishing/approval engine, no graph database and no second database container. D09 keeps stations, schedules, playlogs and DENPA and must not regress; `channels` semantics move to D18 by migration, never by duplication.

**D19 — accepted storage owner (ADR-0007):** **D19 Object Storage & Attachments** is owned by **ECHOLOG** (`apps/echolog`). ECHOLOG is **stateless**: it owns no tables and imports no SQL driver, so the closed SQL-owner set stays exactly `{@moonwitness/moonql, @moonwitness/skylink-store}`. It owns bytes, digests, retention, legal hold and download grants only — never rights/consent (D08), identity (D00), media manifests (D07), artifact metadata (D01) or message rows (D18). Consumers store `{object_key, digest, size, content_type}`. This carve-out authorizes no second Hub, no second identity, no second database and no `bytea` payloads in Postgres.

### 2A.2 Reusable App Factory — early engineering contract, NOT implemented

**Goal:** safely add applications to the current \`pnpm\` monorepo without re-inventing package/TypeScript/build/config/deployment/i18n conventions. Candidate entry point \`pnpm app:create\` is **not** an existing script. Inventory \`apps/*\`, \`packages/*\`, \`pnpm-workspace.yaml\`, Dockerfiles, \`@moonwitness/web-config\`, \`@moonwitness/moonui\` and CI first. Implement the smallest dry-run-capable scaffolder; reject name/path collisions and accidental overwrite; generate only runtime variants actually needed (public Next/privileged Next/local Vite/internal service/worker). Not every template receives a database, public port or Docker service. A successful sample app must install, build, pass tests including \`id/en\` locale coverage and relevant container routing **without manually repairing generated manifests**. Canonical executable subtasks are M05-17–M05-22.

### 2A.3 Mandatory global i18n / localization contract — accepted by ADR-0005; implementation not shipped

**Ratified contract:** [ADR-0005](docs/decisions/ADR-0005-locale.md) now fixes the canonical `id`/`en` policy, deterministic preference order and per-runtime boundary. Its positive/negative vectors are inputs to M05-10/M05-11 tests, not evidence that a locale resolver or bilingual app is shipped. M05-10 chooses the smallest viable existing package home for the one registry after inspecting reuse.

- **Supported UI languages v1:** ISO language tags \`id\` and \`en\`; no assumption that country is language or that translated UI means translated sacred source.
- **Central owner:** one reusable locale registry/catalog contract in a justified shared package (proposed \`@moonwitness/i18n\` **only if** existing \`@moonwitness/core\`/MoonUI cannot cleanly own it). Text keys should be named, type-checked, and parity-checked by tests; never translated into stored API identifiers.
- **Precedence:** explicit URL locale → user-selected persistent locale → existing account preference → validated \`Accept-Language\` hint → declared default; never infer from precise geolocation or force IP lookup. An explicit URL always wins. \`id-ID\`, \`en-US\`, country, timezone and source-language are distinct dimensions.
- **Public URL contract:** \`/id\` and \`/en\` MUST render complete meaningful landing pages; \`/\` has documented deterministic redirect/selection; unknown locale responds predictably, with preserved existing legacy routes, API paths, assets and embeds. Locale switcher preserves route when a localized equivalent exists. Locale-specific title/description, \`hreflang\`, canonical URLs, and browser \`lang\` must be tested.
- **Next.js 16 implementation note:** the project currently uses \`src/middleware.ts\` on Dock and HQ for security. Next.js 16 officially calls this convention \`proxy.ts\`; audit security header/CSP matchers and auth coverage before changing it. Locale routing must NOT override \`/api/*\`, \`/_next/*\`, \`/embed/*\`, auth endpoints, stream endpoints or static metadata. Primary reference: https://nextjs.org/docs/app/guides/internationalization and https://nextjs.org/docs/app/api-reference/file-conventions/proxy .
- **Per-runtime strategy:** Next frontends can use URL locale routing and SSR catalog dictionaries; Cockpit Vite/React uses an accessible GUI selector and appropriate local persistence, not forced \`/id\` URLs; ARSY/API can negotiate human-facing error messages using validated headers while keeping stable machine codes; AI Gateway human descriptions only if relevant; Sentinel worker logs, automation codes, service IDs, API fields, model names and CLI commands MUST remain machine-stable.
- **Corpus separation:** never silently translate Quranic/scriptural source passages, citation fingerprints, rights, source-language original, edition IDs or authoritative statements as merely UI chrome. UI locale \`id/en\` is not evidence of an approved translation of any text.
- **App acceptance matrix:**

| Existing application | Localizable human interface | Baseline (source inventory at `387f784`) | Owner / canonical TODO | Gate |
|---|---|---|---|---|
| Dock | Public Next UI, navigation, forms, content, SEO | PARTIAL/UNKNOWN; no verified \`/id\`/\`/en\` | M19-08–M19-19, M19-31 | Both routes, switcher, degraded mode, rights gate, browser E2E |
| Headquarters | Login, sidebar, model/forms, errors, admin status | NOT VERIFIED in two languages | M19-20–M19-24 | id/en role tests and visible copy parity |
| Cockpit | React/Vite console, panels, dialogs/help, optional CLI | VERIFIED BILINGUAL TECHNICIAN CONSOLE (M19-25–M19-30, ADR-0008) | M19-25–M19-30 | In-GUI switcher, localStorage persistence, 1:1 key parity, accessible alertdialog confirmations, machine log invariance |
| ARSY (currently radio) | Human-facing launchpad, authenticated Studio UI, safe errors/diagnostics | NOT VERIFIED in two languages | M05-14; M28 migration | stable routes/envelope/error discriminators and auth, id/en UI and messages |
| AI Gateway | User-visible provider/error info if exposed | NOT VERIFIED in two languages | M05-15 | human messages appropriate, IDs stable |
| Sentinel | Human CLI help/actionable diagnostics if any | UNKNOWN/NOT VERIFIED | M05-16 | no translation of machine logs or automation output |
| Future Harbor/SHADOW/MoonLab/WORKS/HELIOGRID | New user-facing interfaces | PLANNED, no current code | M05-19/M05-21 App Factory | all UI templates inherit typed locale and tests |

**Global i18n VERIFIED gate:** per-app QA evidence at exact SHA, key parity, locale preference, date/number formatting, keyboard/accessible labels, auth-negative tests, stable machine output, and zero inadvertently changed API identifiers. One visible switcher is never proof of full coverage. Detailed tasks live exclusively in TODO (M05 and M19). The platform-wide i18n acceptance is intentionally separate from the narrower **Dock bilingual preview** gate; do not delay the small public preview for unrelated privileged-language screens, while retaining early, explicit all-app delivery requirements. ADR-0005 accepts the contract only; this gate remains unverified until implementation evidence exists.

### 2A.4 Bilingual public preview and release topology

**First release slice:** truthful public landing experience in existing Dock, NOT a new Next app or an assertion that all Empire products run. Core sections Hero/Mission, Empire context, existing/pilot/planned capabilities, principles, voluntary participation, README/contact/privacy, source links. Both \`/id\` and \`/en\` are release-blocking; handle \`/\`, 404 unknown locale, navigation, keyboard/mobile, contrast, reduced motion, descriptive metadata, privacy/rights and clean fallback if Hub offline. Existing \`apps/dock/src/app/page.tsx\` requires several live MoonQL reads; separating static mission from optional Hub widgets is an implementation task, **not yet delivered**.

**Compose/Coolify:** currently \`docker-compose.yml\` starts db, \`radio\`, \`dock\`, \`headquarters\` and backup; Dockerfiles are present, \`pnpm verify:docker\` exists but is NOT in the observed CI. Current Compose publishes host \`radio:3000\`, \`dock:3001\`, \`headquarters:3002\`; check external exposure before production and prefer a constrained preview or secure full-stack topology. Pin secrets, volume namespace, health/readiness, Docker build, stage smoke, TLS/DNS, actual deployment SHA and tested rollback. Coolify supports Git-backed Compose: https://coolify.io/docs/applications/builds/docker-compose . Do not assert domain ownership/active TLS, Docker success or DEPLOYED_VERIFIED without logs. Implementation subtasks M27-08–M27-19.

**Release stages are distinct:** \`CI_VERIFIED\` ≠ \`BUILD_VERIFIED\` ≠ \`DEPLOYMENT_READY\` ≠ \`DEPLOYED_VERIFIED\` ≠ \`RELEASE_ACCEPTED\`. Full XV M27 acceptance still requires its separate human rights, security, restore and publication gates.


## 2B — Modular contracts and project decomposition

[Master Design](MASTER_DESIGN.md) owns shared UI semantics; [architecture contracts](docs/architecture/README.md) detail app/data boundaries, [ADRs](docs/decisions/README.md) record accepted versus proposed decisions, [AI execution](docs/planning/AI_EXECUTION_CONTRACT.md) governs small-agent handoff. Existing M00–M39 are preserved; M29–M37 define ecosystem discovery/adoption boundaries, and M40 defines the accepted ORBIT frontend boundary (planned, not shipped). Lighthouse reuses Dock until a reviewed decision; Harbor, SHADOW, MoonLab, WORKS and HELIOGRID cannot acquire independent data or IAM owners by default.

## 3 — Target architecture (logical, not already deployed)

    apps/dock (public Next.js)
           |
      typed API/SDK
           |
      ARSY Fastify Hub (currently apps/radio)
      / plugins / modules / MoonQL REST / channel gateway
           |
      packages/moonql (one model/ACL/relations/addon boundary)
           |
      approved persistent database (PostgreSQL)
           |
      canonical typed records, review actions and release pointers
           |                       |
      derived search/graph          human-reviewed AI candidates
           |                       |
      apps/headquarters <---- authorized reviewer actions

    Messaging dependency direction (ADR-0006) — a bounded service, not a second Hub:
      ARSY/SIGNAL and other apps ──REST+WS (service key / D00 session)──▶ SKYLINK (apps/skylink, D18)
                                                                          ──▶ WhatsApp · Telegram · later providers

    Storage dependency direction (ADR-0007) — bounded and stateless, not a second Hub:
      apps and workers ──API (service key / D00 session)──▶ ECHOLOG (apps/echolog, D19)
                                                          ──▶ driver: fs (default) · s3 (MinIO/R2/AWS)

- **Git XV** owns software, vocabulary definitions, schemas, policies and approved editorial specs.
- **Publisher/source owner** owns the original outside work/license, not XV.
- **Approved asset storage** owns one immutable version of consented media/source bytes; XV stores metadata/digests. No public private-archive dumps.
- **Selected operational persistence** owns canonical records and human decisions; search/cache/materialized graph are derived, rebuildable.
- **AI** is optional, disabled by default, source-grounded and confined to **candidates**. No background hidden provider fallback or auto-publish.
- **API/UI** are projections/authorized operations, not independently editable truth.

These boundaries require an XV-local ADR for any schema/data migration. XIV's Objection/Knex + PostgreSQL policy is historical and must not be silently imported into XV's MoonQL/Drizzle-oriented code.

## 4 — One owner per domain (proposed ADR targets)

| Domain ID | Domain | Owns the canonical kinds | Shared readers / anti-overlap |
|---|---|---|---|
| D00 | Identity & ops **existing** | Users/sessions, API keys, role/permission, audit/job/state | All apps; no SHADOW second login |
| D01 | Source / Corpus | Work, expression, edition, artifact, passage, translation, text rights, source version | Reader/Research/Explorer reference exact IDs |
| D02 | UNILEX | Term, sense, language, designation, attributed meaning, translation relation | Terms table, Search, figure names |
| D03 | Ontology | Entity, typed link, alias observation, identity decision, released graph | Constellation, related terms/persons |
| D04 | Actor & Event | Figure, role, transmission, event, place, time/chronology | Prophetic Table is a **view** |
| D05 | Research | Case, frame, source-linked assertion, counterevidence, SRGBL stages, MIZAN method/run | Doesn't own original TEXT |
| D06 | Witness | Private observation, consent, original testimony, dated corrections | Public archive only approved derivative |
| D07 | Story & Media | World, arc, character, episode, scene, poster/media manifest, editorial variants | SHADOW workspace consumes it |
| D08 | Publication/Governance | Rights decision, reviewer/sign-off, release/withdraw/retract and consent policy | All public publishing gates |
| D09 | Signal **existing** | Stations, schedule, playlog, channels, DENPA | Must not regress |
| D10 | World/Science optional | Real observations, provider runs, controlled simulation/experiment metadata | Cosmos/world views, no physical-device claim |
| D11 | Journey optional | Path, milestone, mission, human mandate, game cross-reference | 100CENTER views; no faith score |
| D12 | Workflow optional | Human task/review queue and AI suggestion lifecycle | Only one orchestration owner |
| D13 | Design (Git) | UI contracts, tokens, sensory feedback, brand, asset provenance | Unified MoonUI design system (@moonwitness/moonui; verified M19-32, M30-01..M30-03) |
| **D18** | **Messages & Channels — owned by SKYLINK** | `channel_accounts`, `conversations`, `messages`, `delivery_attempts` (schema `skylink`) | ARSY and other apps are clients only; no identity/session ownership; D09 `channels` migrated here |
| **D19** | **Object Storage & Attachments — owned by ECHOLOG** | Object bytes, `sha256` digest, size, MIME, retention, legal hold, quota, download grants (sidecar metadata; **no tables**) | Consumers hold references only; not rights (D08), identity (D00), manifests (D07) or artifacts (D01) |

A record is stored under one canonical owner. Search exports, charts, caches, UI read models and RAG retrieval never create a competing source of truth. Don't implement 14 names of Empire as 14 microservices.

## 5 — Fundamental ontology constraints

**Always distinct:** `SourceArtifact ≠ Work ≠ Expression ≠ Edition ≠ Passage ≠ Translation ≠ Assertion ≠ Evidence ≠ Interpretation`. `Actor ≠ Role ≠ Character ≠ Alias`. `Event ≠ Story ≠ Testimony ≠ ExternalVerification`. `UserReported ≠ RevealedMessage`. `THE BATTERIES ≠ ALLAH`. `SHADOW(character) ≠ SHADOW(workspace)`.

Keep different:
- ALLAH as religious referent and A-L-L-A-H as project acronym (Accountable Life, Learning & Action Hub).
- Four Qur'an/Taurat/Zabur/Injil **revelation identities** vs four Qur'an/Torah/Psalms/canonical Gospels **extant source families**.
- Four Soul Pillars vs Four Empire operational pillars; 1·6·3 framework vs hidden numeric scripture code.
- ZILL Shadow Witness vs ZILL Tasawuf; historical ZIIL occurrence retained as source form.
- Nine Prime Code values, ten WINGS, 25 Amanah (roster unverified), G.O.D.99, Asmaul Husna 99, 99 Human States, AETHERION 10 realms/100 levels, 33 World Patches, 99 V10 chapters.
- `00-MAIN GOD PROMISE`, `GOD PROMISE: THE ROCKSOUL` and 1·6·3 research paper.
- The witnessed meaning of a musical reference vs rights to reproduce lyrics and recording.
- A fiction realm, actual astronomy, scripture-reported cosmology and a proposed simulation.

**Versioned identity:** NEVER turn similarity of names, numbers, sounds, nicknames or rhetorical symbolism into `sameAs` automatically. Use `distinctFrom`, `inspiredBy`, `candidateRelation`, `interpretedBy`, `attestedIn` with specific source, version and human reviewer scope.

## 6 — Source and research data contract

**Canonical source chain:** `Artifact → Work → Expression → Edition → Passage → Content → Assertion → Evidence → Provenance`. Every stage identifies actual sources and versions; no invented IDs/checksums on not-found.

Minimal proposed fields per object where applicable: `owner_domain`, stable ID, type, edition/locale/script, source URI, pinned SHA/manifest release, exact selector, observed digest, rights/consent, visibility, epistemic class, perspective/frame, author/attributor, human reviewer, state, conflict/retraction, occurred/observed/recorded/created/published timestamp (different dates), revisions and evidence references.

**Multidimensional statuses (never combine to one score):**
- `SOURCE_AVAILABLE / SOURCE_MISSING / UNKNOWN / METADATA_ONLY`.
- `PRIMARY_TEXT / ATTRIBUTED_BELIEF / HISTORICAL_EVIDENCE / SCIENTIFIC_OBSERVATION / PERSONAL_TESTIMONY / INTERPRETATION / FICTION`.
- `DRAFT / IN_REVIEW / APPROVED_WITHIN_SCOPE / DISPUTED / RETRACTED`.
- `RIGHTS_UNKNOWN / RIGHTS_EXACT_VERSION_CLEARED`.
- `PRIVATE / RESTRICTED / PUBLIC / WITHDRAWN`.
- `PLANNED / CODE_EXISTS / TESTED_AT_SHA / BROWSER_VERIFIED / DEPLOYED / RELEASE_APPROVED`.

**Research:** SRGBL S1 Source & Sense → R2 Reality → G3 Governing Order → B4 Being → L5 Light. Independent scales `maturity/15`, `quality/40`, `candidate witness support/100`, `direction −2..+2`; *not a scripture quality or salvation score*. SWING generates counter-hypotheses; MIZAN helps human evaluation; FURQAN is a source/evidence gate, not divine judgement. Positive Correction requires the declared religious/research lens.

**Publication:** acquire exact authorized source → rights/privacy/consent → normalization/provenance → interpretation/evidence → independent human review → publication manifest/version → public projection → correction/retraction/takedown. Unreviewed source is either metadata-only or inaccessible.

## 7 — Historical federation and migration model

Historically documented roles: Corpus/RGBL=TEXT; Rocksoul MFTL=STORY; Legend=EVENT; Superhero=PERSON; AWS=LAW; Perspective=attributed interpretive lens; Correlation=reviewed RELATIONSHIP; Crayon=console; Rocksoul Platform=IAM; Rocksoul Assets/Creative/UI=visual sources. The integrated XV domain model should *reference* them, not demand live networking across 20 repositories.

**Migration row:** source repo, source branch/immutable SHA, path, original record ID, source edition/bytes digest (when available), license, consent, public/secret classification, target XV owner, transform version, reviewer, rollback and acceptance test. No blind CSV, no source byte copy from private manuscripts, no unreviewed schema adaptation, no duplicate canonical source.

**Source-to-code candidates by cost/risk:**
1. XIV narrative source crosswalk, V10/V10.1, actor/identity & witness review patterns (**read/reconcile first**).
2. Corpus exact-source/rights/SRGBL models; use **metadata-only pilot**, test licensing.
3. A-L-L-A-H research approval and World Monitor/YouTube Sentinel **source code**; review rate limits, platform moderation and human rights.
4. Rocksoul correlation and historical Jerusalem 70 CE reference case.
5. Moonframe/Rocksoul Assets only after UI behavior/a11y and permission audit.
6. Empire Prime Code and 14 logical system names as *vocabulary*, not automatic services.

## 8 — Security and integrity gates (must precede private ingestion)

P0: deny-by-default sensitive list/get/create/update/delete, view projections, expand/filter/search/export, row ownership and cross-tenant request paths; enforce at API, not just UI. Non-sensitive public stations deliberately stay public. Critical sources: `packages/moonql/src/acl.ts`, `apps/arsy/src/config.ts`, `apps/radio/src/modules
