# MOONWITNESS XV — MASTER BLUEPRINT
## One universe · one active repository · explicit evidence · bounded domains

> **Status: XV planning baseline v1.0 — 26 October 2026.**
> This file specifies a TARGET, not proof proposed modules have shipped. **Single forward development home:** [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv), existing `main` branch only. No new branch, repo or issue is required to document this blueprint.

**Document hierarchy:** [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) = why/what/history/99 chapters; **BLUEPRINT.md** = owner boundaries, desired behavior and architecture; [TODO.md](TODO.md) = unique execution task IDs, gates, priorities, dependencies, status. Code + actual SHA-specific test results = what works. An approved future XV ADR supersedes design proposals. Historical repository ADRs do not automatically become XV ADRs.

## 0 — Decision and acceptance horizon

**North star:** People can inspect a source, its exact edition, context, witnesses, relationships, attributed interpretations, uncertainty, and its creative derivatives without confusing sacred text, historical evidence, personal testimony, AI conjecture or fiction. The product provides **knowledge, witness, research, creation and accountable action**, not algorithmic divine authority.

**Preserve and expand:** XV's Radio + MoonQL + Dock + Headquarters is a real engineering baseline and must survive every change. XV is not yet a shipped full Corpus/Research/Story universe. Old repos are archival primary sources or reviewed migration candidates, not live dev targets.

**Target launch slice:** existing Radio unaffected + rights-cleared QS 2:82 Reader source trace + one contextual lexical/figure relationship + reviewed research explanation + human governance + tested backup restore and security; World/Cosmos/Journey/99 agents are not prerequisites.

## 1 — Source and implementation snapshot

At master audit commit `43dfcdebfbaa1a7a078d2a0657a10cfdae2ce298`, XV tree contained 244 files and **no GitHub issues found**. Confirm live HEAD again before any implementation.

| Existing implementation | Evidence paths | Contract to preserve |
|---|---|---|
| Fastify Hub, one MoonQL bootstrap | `apps/radio/src/app.ts`, `apps/radio/src/addons.ts` | One API, generated REST + explicit modules + channels |
| ORM, migration, addon registry, typed models | `packages/moonql/src/{boot,model,registry,rest,sync}.ts` | No duplicated models or routes; additive auto-sync only |
| SDK and OpenAPI | `packages/moonql-client`, `apps/radio/src/plugins/swagger.ts`, `apps/radio/src/tools/gen-sdk.ts` | Keep schema drift checks and envelope |
| Public Dock / Radio | `apps/dock/src/app`, `packages/moonql-stations`, `moonql-schedule`, `moonql-playlog` | Preserve station catalog/playback, live schedule, privacy |
| Admin Headquarters | `apps/headquarters/src/app`, `apps/headquarters/src/ui` | Reuse generic model forms, ops and session flow |
| Identity, ops and messaging | `moonql-auth`, `moonql-apikeys`, `moonql-ops`, `whatsapp`, `denpa` | Single authorization source; opt-in external integrations |
| Dev, tests, restore recipe | `package.json`, `apps/radio/test`, `docker-compose.yml`, `docs/runbook-restore.md` | Do not equate existence with passing tests/drill |

**Proven risk:** `packages/moonql/src/acl.ts` treats undefined ACL as public. `apps/radio/src/config.ts` defaults `MOONQL_ACL_POLICY=warn`, whereas Docker Compose sets `require` for anonymous REST writes. That guard **does not prove GET/list/views/expand/export of sensitive models are protected**. `apps/headquarters/src/middleware.ts` tests cookie presence, not credential validity (Hub enforces actual authorization); generic MoonQL ops audits are asynchronous and not tamper-proof. The restore runbook has an empty execution ledger. All require gates before restricted data enters XV.

**Existing route convention** is the Hub `/api/v1` prefix, with `/docs` OpenAPI; do not rename `apps/radio` just to sound more universal. No second public API or ORM stack until an XV ADR establishes a measurable need.

## 2 — Experience architecture: one discoverable product

| Mode | Public UI | Privileged UI | Domain owner |
|---|---|---|---|
| **DISCOVER** | Home, universal search, topic hub, history/guide | indexing/release diagnostics | projections; not canonical |
| **READ** | Corpus Reader, works, editions, passage, source and citations | source/rights steward | SOURCE/TEXT |
| **EXPLORE** | UNILEX, ontology, figure registry, prophetic missions, temporal/maps | identity and relation review | LEXICON/ONTOLOGY/ACTOR/EVENT |
| **RESEARCH** | Compare, Key Witness, SRGBL, MIZAN, counterevidence | reviewer desk, decision/retract | RESEARCH |
| **WITNESS** | Consented archive, event, fault line, past presence, correction | private witness editor | WITNESS |
| **STORIES** | Four creative lenses, 99-chapter archive, crew, episodes, posters | SHADOW story studio | STORY + MEDIA |
| **SIGNAL** | **Existing** Radio stations, schedule, player | existing radio admin/channel ops | SIGNAL (existing) |
| **WORLD** | Future Earth Monitor, time/cosmos, experiments | World-source quality | WORLD (optional) |
| **JOURNEY** | Future voluntary paths, 33 patch archive, AETHERION fiction | 100CENTER mandate/mission | JOURNEY (optional) |

**One search, multiple lenses, one permission system.** The Prophetic Mission Table is a Figure/Actor registry view, not an independent prophet database; the Terms Table is the Lexicon view; Reader and Explorer share immutable source IDs; Constellation is a graph projection of reviewed relations, not another editable database; SHADOW and 100CENTER are areas in Headquarters, not separate IAM services. Existing Signal remains visible in the navigation.

Use progressive disclosure: search/read first; sources before analysis; reviewer and private tools only for authorized users. On mobile prioritize reading, search, stories and signal.

## 3 — Target architecture (logical, not already deployed)

    apps/dock (public Next.js)
           |
      typed API/SDK
           |
      apps/radio Fastify Hub
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
| D13 | Design (Git) | UI contracts, brand, asset provenance | MoonUI consumer; Moonframe/Assets optional |

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

P0: deny-by-default sensitive list/get/create/update/delete, view projections, expand/filter/search/export, row ownership and cross-tenant request paths; enforce at API, not just UI. Non-sensitive public stations deliberately stay public. Critical sources: `packages/moonql/src/acl.ts`, `apps/radio/src/config.ts`, `apps/radio/src/modules