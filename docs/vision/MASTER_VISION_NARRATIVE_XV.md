# MOONWITNESS XV — MASTER VISION NARRATIVE
## EMPIRE OF THE LIGHT · A-L-L-A-H · GOD-PROMISE · ROCKSOUL · CORPUS · WITNESS · THE BATTERIES

> **THE MOON WATCHES. THE RECORD REMEMBERS. THE EVIDENCE REMAINS INSPECTABLE.**  
> **Different people. One sky. Many stories.**  
> **Trace the text. Examine the witness. Preserve the difference.**

| Field | Decision |
|---|---|
| Document | `MASTER_VISION_NARRATIVE_XV.md` |
| Edition | **XV / 15 — consolidated vision v1.1 · deep-source audit** |
| Prepared | **26 October 2026**, Asia/Jakarta |
| **Single active implementation and planning repository** | **[`bjo163/moonwitnessxv`](https://github.com/bjo163/moonwitnessxv)** |
| Working branch policy | Work directly on existing `dev`; promote verified changes to `main` only after required gates; do not create topic branches |
| Classification | Public-safe strategic/editorial synthesis; **not** a verbatim private archive, approved religious canon, accepted system ADR, feature completion report, or production certification |
| Research baseline | Review of XV, MOONWITNESS II/XII/XIV, MOONWITNESS Corpus, A-L-L-A-H, Empire, ROCKSOUL family, Moonframe, Moonwitness Time System and earlier narrative handoffs |
| Priority | **Preserve first → map sources → reconcile semantics → ratify boundaries → build in XV → verify** |

**ARSY — the single central backend Hub:** current `dev` contains `apps/arsy` / `@moonwitness/arsy` following the in-place M28 runtime/package move. **One ARSY backend only; no second Hub.** M28-13/M28-14 regression, integration and release evidence remain open, so the move is not full production certification. Radio stations/schedules/playback remain the bounded **SIGNAL/RADIO** domain within the same service. ARSY remains the only public Hub and canonical run-state owner. A specialized LUMEN worker is proposed in M41 to execute authorized runs behind ARSY contracts; it must not become a second Hub, identity authority or SQL owner. No theological al-'Arsh representation or divine authority is claimed.

**SKYLINK — accepted bounded messaging service (27 October 2026, [ADR-0006](../../docs/decisions/ADR-0006-skylink-communication-surface.md)):** `apps/skylink` / port `3005` owns D18 and has a REST + WebSocket control plane and provider adapters. ARSY integration, operator UI, and full e2e release proof remain open at M38-12..14. Identity remains D00/ARSY; SKYLINK is not a second Hub, publishing engine, or graph store.

**ECHOLOG — accepted bounded storage service (27 October 2026, [ADR-0007](../../docs/decisions/ADR-0007-echolog-storage.md)):** `apps/echolog` / port `3006` owns D19. Filesystem-backed content-addressed storage, sidecar metadata, retention/legal hold and a bounded S3-compatible operation subset are present in `dev`; this is not full S3 compatibility. M39-11 consumer/operator UI and M39-12 end-to-end/rollback evidence remain open. ECHOLOG is stateless and owns no database tables.

**ORBIT — accepted frontend boundary (27 October 2026, [ADR-0004](../../docs/decisions/ADR-0004-empire-surfaces.md), planned M40):** `apps/orbit` is a standalone spatial agent-operations frontend designed for a futuristic 3D view plus a fully usable 2D fallback. It reads task/workstation/event state through shared D00/ARSY contracts, uses MoonUI, and hands restricted decisions to Headquarters / 100CENTER. It is not a backend, AI executor, database, identity owner, or canonical domain. Its directory and UI are not implemented yet.

**LUMEN — accepted agent framework boundary (27 October 2026, [ADR-0010](../../docs/decisions/ADR-0010-lumen-agent-runtime.md) / planned M41):** LUMEN is an accepted TypeScript framework package (`packages/lumen`) plus internal worker process (`apps/lumen-runtime`), ratified by the owner under ADR-0010 on 27 October 2026. The architectural decision explicitly resolves earlier narrative wording: the worker process is permitted solely as an execution worker behind ARSY contracts. It is not yet implemented. ARSY remains the Hub and canonical run-state authority; AI Gateway routes models; 100CENTER owns human approval; ORBIT presents run state. See the [research](../../docs/research/LUMEN-framework-deep-research.md), [architecture contract](../../docs/architecture/LUMEN.md) and [ADR-0010](../../docs/decisions/ADR-0010-lumen-agent-runtime.md).

**XV execution handoff (updated 27 October 2026):** This narrative governs scope and interpretive boundaries. Architecture/owner decisions are tracked in [`BLUEPRINT.md`](../../BLUEPRINT.md); the **sole task ID/status plan** is [`TODO.md`](../../TODO.md), now M00–M41 across G0–G7. M27 remains the release gate. M40 plans ORBIT as a standalone frontend; M41 accepts the LUMEN architecture under ADR-0010, but its implementation remains planned. **TODO owns task status, BLUEPRINT owns technical boundaries, this narrative owns vision.** No document certifies runtime behavior without exact-SHA evidence.

**Deep audit v1.1:** Section **21A** is the source-specific expansion covering II's 13 functions and eight eras, Corpus dataset inventory, XIV V10.1, A-L-L-A-H operational research, the 14 Empire system names, 25 Amanah recovery gap, all 33 patch rows, XV ACL and seven end-to-end journeys. This remains a vision and source inventory, **not a claim of completed migration or production capability**.

**This decision supersedes earlier recommendations to keep implementing in XIV, XI, A-L-L-A-H, or other repositories.** Old repository files, issues, images, histories, and immutable references remain evidence and history; **they are not deleted, silently copied, rewritten, or treated as live runtime dependencies**. A historical ADR may remain valid *within its historical repository* without automatically becoming an XV ADR. The owner now directs all **new project work** for this unified vision to XV. Other independent products are not thereby declared nonexistent or transferred without review.

---

## Modular navigation map (the original archive remains intact)

Short reader companions: [Mission](chapters/MISSION.md), [Empire economy/energy](chapters/EMPIRE.md), [ZILL/SHADOW](chapters/IDENTITY.md), [Source/research ethics](chapters/RESEARCH.md) and [source-section crosswalk](chapters/README.md). None replace the unabridged 99-chapter index or §21A historical audit. Technical authority: [BLUEPRINT](../../BLUEPRINT.md); visual contract: [Master Design](../../MASTER_DESIGN.md); task status: [TODO](../../TODO.md).

# 00 — Executive decision: what are we building?

**MOONWITNESS XV is to become a human-governed knowledge, witness, research, storytelling, and action ecosystem that connects source-grounded texts, events, people, traditions, lived experience, and creative works without erasing the boundaries between them.**

It is neither merely a Quran app, nor a universal religious verdict engine, nor a fictional comic, nor an ERP dashboard, nor a radio website. It is an **observatory and operating platform** in which different knowledge modes cooperate:

1. **TEXT / CORPUS** — What does this exact source, edition, passage, and translation say?
2. **PERSON / TRANSMISSION** — Who authored, spoke, interpreted, recorded, witnessed, or passed it on?
3. **EVENT / HISTORY** — What happened, when and where, and which evidence supports or challenges it?
4. **STORY / WITNESS** — What was told or experienced, by whom, and what is narrative rather than external verification?
5. **ONTOLOGY / UNILEX** — What is this thing, concept, term, alias, category, and relationship in its context?
6. **RESEARCH / MIZAN / SRGBL** — Which claims, comparisons, corrections, alternative hypotheses, and limits are defensible?
7. **LAW / GOVERNANCE** — What legal, ethical, rights, consent, jurisdictional and operational constraints apply?
8. **CREATIVE / MEDIA** — How can research and memory inspire comics, writing, music commentary, visuals and fiction?
9. **JOURNEY / MISSION** — How can humans turn understanding into a voluntary, accountable plan or meaningful action?
10. **PLATFORM / AI / OPERATIONS** — How are all these capabilities delivered, authorized, tested, observed and improved?

**The outcome is not "one AI that declares ultimate truth."** The outcome is a system where people can find out **what is known, what a specific source says, what is believed or interpreted, what is hypothetical, what is fictional, and what remains unresolved**—with source links and a transparent chain of review.

## 00.1 North Star

> Preserve the original. Trace each claim. Respect each perspective. Investigate openly. Create freely. Keep humans responsible.

**Primary user promise:** Search a passage, name, story, person, event, or idea; follow explicit relations to sources and context; compare multiple interpretations; inspect uncertainty, rights and editorial decisions; optionally develop or publish a clearly attributed research or creative work.

**Technical promise:** No duplicate canonical owner, no invisible upgrades of an AI proposal into approved source truth, no schema migration on the strength of a poetic metaphor, no production-complete claim based only on CI, and no irreversible migration of historical content without its original lineage.

## 00.2 Product horizons

| Horizon | Concrete outcome | Maturity claim |
|---|---|---|
| H1 — Knowledge Observatory | Reader, searchable corpus catalog, sources, lexicon, provenance, people/events/relations | Target; some historical technical primitives exist elsewhere |
| H2 — Research + Witness Workbench | AI-assisted investigation, SRGBL, editorial review, comparative tables, source-backed citations | Target; research contracts and previews exist elsewhere |
| H3 — Creative Universe + SHADOW | Characters, episode graph, witness archive, comics, media, editorial lifecycle | Target; many historical texts/assets exist, not all originals available |
| H4 — Governed Empire / 100CENTER | Modular workspace, operations, permissions, missions, human approval, release integrity | Target; XV already has a narrower radio/ORM/admin foundation |
| H5 — Civilization, Cosmos & Journey | Voluntary human journey, age/time research, earth/cosmic data, game/simulation realms | Exploratory/research; no claim of physical/supernatural capability |

**Scope discipline:** Completing H1 does not require launching H5. Future horizons do not authorize a rewrite of XV's running radio stack.

## 00.3 Empire of the Light — global ecosystem direction (reconciled proposal, 26 October 2026)

**Why:** This program is inspired by devotion to **ALLAH** through beneficial knowledge, truthful witness, just correction, compassion, accountable creation and service. It respects Nabi Muhammad SAW and Nabi Isa AS within their accurately attributed traditions; the project does not claim revelation, prophecy, divine appointment, or authority over human conscience. Scriptural source, traditional interpretation, personal reflection, technological metaphor and experimental hypothesis must always be labeled separately. End-time interests are source-grounded study and preparedness, not predictions or compelled affiliation.

**What:** **EMPIRE OF THE LIGHT** is the aspirational organizational vision, a voluntary, distributed movement for learning, creating, working, measuring results and improving lives — **not** dominion over people. **A-L-L-A-H** is the project acronym *Accountable Life, Learning & Action Hub*, not the religious referent ALLAH. **A-L-L-A-H.COM** is the **owner-proposed** global domain/gateway; possession, DNS and deployment are not verified by this narrative. **MOONWITNESS XV** is the knowledge, witness, creative and radio/discovery product within the Empire.

**Value loops, never confused with proof of implementation:** Knowledge: discover → read source → research → human review → create → publish. Productive economy: learn → create useful work → offer → deliver → receive actual payment → account for cost → reinvest. Resource/energy: measure real energy use → verify → optimize safely → assess savings → maintain. Revenue is a commercial outcome to validate, not an entitlement from a spiritual name; no infinite/free-energy claims or tokenized miracle economy.

**User/work spaces have different maturity states:** LIGHTHOUSE stays an optional gateway within Dock; DOCK is public discovery; HEADQUARTERS/100CENTER is human governance; **ORBIT is an accepted, planned standalone spatial operations frontend (`apps/orbit`, M40)**; HARBOR is an opt-in member portal; SHADOW is creative authoring; MOONLAB is research preparation; WORKS is work/commerce; HELIOGRID is conditional on a calibrated pilot. ORBIT owns no backend, domain, database or IAM. SKYLINK (D18) and ECHOLOG (D19) are bounded backend-service exceptions; ORBIT is not a service. Current ARSY Hub path is `apps/arsy`; regression/release gates remain open.

**Global access is intrinsic, not translation theater:** First UI languages are \`id\` and \`en\`, with explicit visible language selection and a bilingual \`/id\` and \`/en\` landing page from the first preview. UI translations do not silently alter Qur'anic or other original passages, source language, rights, translator identity, or meaning. A user's language is not assumed from nationality, IP, or precise location; participation remains voluntary and accessible without requiring religious assent for public reading.

**Release discipline:** The first deliverable is a truthful, bilingual MoonWitness XV public preview using existing \`apps/dock\`, built and validated in Docker Compose before Coolify deployment is claimed. Cockpit technician supervision and bilingual localization are verified under ADR-0008 (M19-25–M19-30). App Factory, remaining app localizations, ARSY physical rename, full publishing, WORKS, and HELIOGRID maintain explicit but separately scoped evidence gates. These decisions are architecture *proposals* pending accepted ADRs where they would revise product or domain ownership. Execution and tested status belong to [BLUEPRINT](../../BLUEPRINT.md) and [TODO](../../TODO.md), never to this vision narrative.


---

# 01 — Name constitution: five identities, no forced synonym

| Name | Proper role | Must not be confused with |
|---|---|---|
| **ALLAH** | Divine referent in the Islam-anchored, tawhid-focused research and devotional/personal narrative lens | An app, agent, account, fictional battery, algorithm, governance authority or theological endorsement of software |
| **A-L-L-A-H** | Project/brand acronym **Accountable Life, Learning & Action Hub**; technical/governance ecosystem | ALLAH as religious referent; the acronym has no divine authority |
| **EMPIRE OF THE LIGHT** | Umbrella vision: civilization, knowledge, creativity, accountable technology and action | An empire ruling actual people, a proven cosmic system, or a single existing production app |
| **MOONWITNESS** | Public-facing main identity, story/witness platform, knowledge observatory and end-user product | A single literal moon witness, a total database, or merely XV's current radio module |
| **ROCKSOUL** | Historical philosophical/creative research family and ecosystem of real tools, research domains, digital world/runtime and visual assets | MOONWITNESS as a synonym, human soul/ruh/nafs, or a verified conscious agent |

**Brand hierarchy for XV:** MOONWITNESS is prominent to the end user; Empire of the Light / A-L-L-A-H is parent context; ROCKSOUL and domain names appear only where needed. Keep **moonwitnessxv** the sole new writing/implementation home as instructed by the owner.

The identity of **GOD**, **Tuhan**, **Elohim**, **YHWH**, **Adonai**, **Hashem**, **El**, **Eloah** and related labels can be standardized in *a declared interpretive lens*, but their original words, linguistic senses, historical use, quotation, source and tradition must be retained. **Translation conventions are not evidence of perfect historical or lexical equivalence.**

### 01.1 The "SHADOW above ALLAH" conflict

An earlier creative ontology used a `SHADOW` root and an `AGE OF LIGHT` class numbered `0 ALLAH`, together with other story-role classes. **Preserve this as a historical/fictional taxonomy**, including its exact scope and version. It cannot silently become a theological hierarchy with SHADOW above the divine referent. Separate identities: `story:shadow`, `workspace:shadow`, `legacy-taxonomy:shadow-root`, and `theology:allah-under-specific-lens`. Those are conceptual namespace examples, **not minted canonical IDs**.

### 01.2 Precise name separations

- `ZILL — The Shadow Witness` **distinct from** `ZILL — Ahluz Zikir / Tasawuf`; older `ZIIL` occurrences are historical spellings/typos needing source-aware alias decisions, not universal renaming.
- `00-MAIN GOD PROMISE` **distinct from** `GOD PROMISE: THE ROCKSOUL` and from the academic `GOD-PROMISE MOONWITNESS` 1·6·3 paper.
- `THE BATTERIES / A-L4H THE BATTERY` is a **fictional character/alias**, not ALLAH.
- `SHADOW` character **distinct from** `SHADOW` editor workspace.
- `HONEY`, `QUEEN R`, `MYLUFT`, `MA'LŪF` and the name **Al-Wadūd** have different origins; thematic relation is not identity.
- `G.O.D. 99` organization **distinct from** Asmaul Husna 99, 99 Human States, and any 99 editorial chapter count.
- `WINGS 10` divisions **distinct from** `AETHERION 10 Realms`.
- `ARSY` technology **distinct from** al-'Arsh in scripture; `MIZAN` scoring **distinct from** eschatological judgment.
- `SKYLINK` (the communication service) **distinct from** `SIGNAL` (the bounded Radio domain inside ARSY) and **distinct from** any angelic, prophetic or divine authority; its registry entry carries `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY` and names a human operations wing, never an angel identity.
- `PHONNY` is a **proposed communication-surface slot** with `projectStatus: NAME_UNCONFIRMED`, not a shipped product name; [ADR-0006](../../docs/decisions/ADR-0006-skylink-communication-surface.md) resolves that slot to `SKYLINK`.
- `ECHOLOG` (the storage service) **distinct from** observability and logging — log/audit retention stays with `moonql-ops` and the Cockpit; ECHOLOG stores **bytes and attachments**, never log streams. It is also **distinct from** `SIGNAL` and from any angelic, prophetic or divine authority; its registry entry carries `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`.

---

# 02 — The historical path: engineering converges with witness

The archive presents a **three-year project legacy**. Dates for reconstructed ideas are not necessarily dates of first creation:

| Phase | Recovered family | Contribution to XV |
|---|---|---|
| 2023 — unrecorded/early | Source material whose original timestamps or manuscripts are incomplete | Archive with `UNKNOWN` where needed; avoid invented origin story |
| 2024 — ZENIX / ZENIVERSE | ERP, Odoo/Fastify, integrations, geolocation, ISP tooling, SaaS, enterprise systems | Practical engineering heritage; not all become XV modules |
| 2025 — Universe / platform | Metadata-driven models, APIs, auth, PostgreSQL, ORM, packages, workers, deployment, local AI | The conviction that one declaration should generate predictable model/API/UI behavior |
| 2026 — creative research convergence | MOONWITNESS II, GOD-PROMISE, ROCKSOUL, A-L-L-A-H/Empire, XIV, Corpus, visual design, character archive | Knowledge + story + research + AI + governance integrated into a product vision |
| **2026-10-26 — XV consolidation decision** | The owner's explicit newest instruction | **XV is now the only active repository for further unified planning and building** |

**How the two paths join:** The engineering track solves "how to organize reliable systems"; the research/story track solves "what does humanity want to explore, preserve and express?" XV's challenge is to join them with **transparent contracts and migration evidence**, not with names alone.

### 02.1 Engineering capability legacy

Fastify, Next.js/React, Vite, Node.js/TypeScript and JavaScript, PostgreSQL, SQLite/D1, Odoo 17, ORM addons, metadata-driven UI, REST/JSON-RPC, Cloudflare, Docker Compose, GitHub CI, versioning, WhatsApp/Baileys, ISP subscriber/RADIUS/PPPoE, GIS/DCIM, monitoring, desktop Tauri, package design systems and local coding agents. These are **potential building blocks or separately owned products**, not presumed imported implementations. **Accepted adoption:** ADR-0018 brings the owned MWX-ISP feature set into XV as the real D20 connectivity operations capability under Empire WORKS; it does not turn ISP records into Story Universe canon or authorize importing customer data/secrets.

### 02.2 Decisions that survive historical changes

- No unnecessary new repositories or branches.
- Preserve original names, revisions, citations, characters, raw sources and media provenance.
- Public repository does not automatically have permission to hold personal chats, private diary extracts, unlicensed scripture translations, music lyrics or copyrighted posters.
- Human review is required for identity equivalence, religious framing, publication and consequential actions.
- Issue/CI/PR labels are *engineering workflow evidence*, not proof of a theological, historical or scientific proposition.

---

# 03 — MOONWITNESS II: the original story/witness engine

**Original core:** "When the Moon Witness, We Share a Message." The historical MOONWITNESS II application and blueprint describe a **Story & Witness Platform**: **Capture → Connect → Witness → Understand → Preserve → Promote → Move Forward.**

Its expressive cycle is:

`WITNESS → EVENT → MESSAGE → SEDUCTION → FAULT LINE → EXPOSURE → PAST PRESENCE → AUDIT → EVALUATION → BALANCING → PROMOTING → CONFLICT → SANITY'S LAST BREATH → CHANGE → NEXT ERA`

This is a **narrative progression**, not a mandatory process every real witness must follow. Important features/archives: people and characters, events, witnesses, signals, messages, relationships, fault lines, exposure, past presence, crew, villains, conflicts, change, timeline, constellation, lore, entity detail and alternate endings.

**Past Presence** expresses what remains after an event ends: memories, influence, stored records or unresolved consequences. A creative motif of memory is not proof of supernatural persistence.

## 03.1 Era systems: never collapse incompatible numbers

- **MOONWITNESS II eight eras:** a source-specific narrative structure that must preserve exact original names/version when recovered.
- **Historical AGE CODE:** `T-2 MYTH AGE → T-1 AGE OF DARKNESS → T0 THE LIGHT (transition) → T1 AGE OF LIGHT`, with numbered role classes inside T1. This is a separately authored taxonomy.
- **AETHERION:** ten realms, one hundred RPG levels; a game progression system.
- **AGE STORY:** human ages/calendar calculation, scripture chronology and narrative motifs.
- **Software release phases:** XV versions and CI state.

No system should translate an era number into calendar years, human virtue, divine station, or quest level without a supported transformation.

## 03.2 Story archive obligations

A story record needs: original author/source, version, world/canon branch, character references, scene and episode ordering, source excerpt locator, dates with type, media manifests, content rights, privacy, adaptations, review decision and unresolved conflicts. A derivative comic is not the original source. A model-created summary must say it is a synthesis.

---

# 04 — GOD-PROMISE: revelation, human agency and the monocentric lens

The research paper **GOD-PROMISE MOONWITNESS** proposes a conceptual **Monocentric 1·6·3**:

| Number | Concept | Source framing | Limitation |
|---|---|---|---|
| **1** | ONE GOD / Tawhid | Qur'an 112:1; 39:62 | A project research lens, not a numerical software identity for ALLAH |
| **6** | CREATION / six *ayyām* | Qur'an 7:54, 10:3, 11:7, 25:59, 32:4, 50:38, 57:4 | Doesn't prove a secret arithmetic code, nor arbitrary scientific timescales |
| **3** | HIZAB as conceptual boundaries: Hijab, Hudud, Barzakh | Distinct Qur'anic source concepts | **The Qur'an does not teach the equation "3 = HIZAB"**; that compression is project-authored |

This framework links **Creation → Life → Return → Accountability** as a thematic research horizon, particularly inspired by Qur'an 10:3–4. Neither MOONWITNESS nor MIZAN can render the final divine judgment.

**Fundamental distinction:** ULTIMATE REALITY / GOD → REVELATION CLAIM → REVELATION IDENTITY → TEXTUAL WITNESS → MANUSCRIPT / RECENSION → CANON → BOOK → EDITION → TRANSLATION → TRADITION → BRANCH / DENOMINATION / SCHOOL → INTERPRETATION. These are **different object kinds**.

## 04.1 The four revelation identities and four source families

Research focus traditionally includes Qur'an, Taurat, Zabur and Injil, **but** the historical Empire design calls for **four independent textual source families**: Qur'an, Torah, Psalms, canonical Gospels.

The Islamic **Injil** referent is not automatically textually identical with the four canonical Gospel narratives. The Islamic **Taurat** referent does not make every extant Torah manuscript a word-for-word copy of an original revelation. Zabur/Psalms identities must be attributed and researched. Canon status and sacredness are tradition-scoped assertions, **not a universal verdict inferred from the corpus**.

Comparative scope extends beyond Abrahamic traditions: Hindu, Buddhist, Daoist, Shinto, Sikh, Jain, Zoroastrian, Bahá'í, Confucian and other literature/traditions, with source-specific language, chronology and rights.

## 04.2 Revelation-research epistemic types

`EXPLICIT_TEXT`, `SOURCE_ATTRIBUTED_CLAIM`, `HISTORICAL_ATTESTATION`, `INTERPRETATION`, `FRAMEWORK_HYPOTHESIS`, `EMPIRICAL_OBSERVATION`, `PERSONAL_TESTIMONY`, `CREATIVE_FICTION`, `UNKNOWN`.

Do not equate observed = proved, cited = licensed, repeated = independent, AI confidence = objective truth, or "positive" = "miraculous".

## 04.3 Human choice and accountability

Research chain: `received → understood → intended → chosen → acted → impact → accountability → judgment`. An application may document observable actions, consent and human-defined evaluation processes; **the ultimate divine judgment stays outside application scope**.

---

# 05 — MOONWITNESS CORPUS: the evidentiary foundation

Corpus's value is **exact source identity and traceable provenance**, not asserting which text carries universal divine authority.

`ARTIFACT → WORK → EXPRESSION → EDITION → PASSAGE → CONTENT → SCOPED ASSERTION → EVIDENCE → PROVENANCE`

Each canonical passage requires its real owning source identity, language/script, edition/expression, segment selection, original or permitted translation, digest/locator, citation form, rights and provenance.

### 05.1 Golden rules

- Textual presence **≠** universal religious authority.
- A translation **≠** original source text.
- Textual parallel **≠** identity or direct historical borrowing.
- Community attribution **≠** universally established revelation.
- An inferred source correction **≠** a neutral absolute truth.
- A religious miracle report **≠** independently validated empirical miracle.
- A checksum **≠** publisher authorization, copyright permission or human reviewer signature.
- A metadata-only record may be publishable even when the licensed text itself may not be redistributed.

### 05.2 Reader user journey

1. Search `QS 2:82`, a person, a term, an event or a manuscript.
2. Select **actual** edition and passage ID; never invent a canonical ID on a missing lookup.
3. See permitted original/translation in parallel, verse context, source artifact, attribution and rights.
4. Inspect speaker, recipient, genre, historical placement and UNKNOWN gaps when evidenced.
5. Follow `Key Witness` assessment, frame, source-linked fragments and disagreement.
6. Run SRGBL stages; if unpublished, display `UNKNOWN`, `NOT_REVIEWED` or `UNAVAILABLE`, not fabricated prose.
7. Compare with a second exact source under an explicitly selected lens.
8. Examine candidate `SWING`, corroboration and independent evidence status.
9. Export citation, edition, selector, reference digest, rights and reproducibility details.

First pilot example is **QS 2:82**. A sample user journey is **not** proof a reviewed annotation already exists.

---

# 06 — UNILEX and ontology: same word, different senses

**UNILEX** is the historical Empire design for a source-aware Universal Lexicon. An initial proposed **71-concept registry** exists in the Empire project, and it is a **seed**, not a ratified final dictionary.

Four lanes:
1. `UNIVERSAL`: general terms such as responsibility, trust, fairness.
2. `SCRIPTURE`: referents used by particular traditions.
3. `TEXT_SOURCE`: extant corpora, authors, editions, manuscripts.
4. `PROJECT`: ARSY, 100CENTER, fictional persona, UI/module terminology.

Supported conceptual relations: `relatedTo`, `inspiredBy`, `distinctFrom`, `closeMatch`, `exactMatch` **only after scoped evidence and review**, `broaderThan`, `narrowerThan`, `interpretedAsInTradition`, `appearsIn`, `attests`, `recordedBy`.

**Ontology dimensions:** source object; assertion; conceptual sense; language; tradition; actor; role; identity decision; event; place; time; fictional world; relation; evidence; law; researcher/reviewer; software capability.

### 06.1 Name-research cases

El/Elohim/YHWH/Adonai/Hashem/GOD/ALLAH; Isa/Jesus/Christ; Rasul/Rosul/RA-SOUL; `Za` in ancient Egyptian; `RE-ZA` as a creative wordplay; Asmaul Husna; Sufi titles and tariqa vocabulary. A joke using similar syllables **does not establish linguistic etymology, divine descent, identity or supernatural events**.

### 06.2 Prophetic missions

The user-authored thesis "each prophet was sent to address particular problems" motivates **Prophetic Mission Table**: prophet figure, text/tradition, mission claims, challenges, human community, historical setting, passage references and differing interpretations. One narrative may assign several missions; avoid forcing one summary into a universal exclusive mission.

A historical concept of **25 Prophetic Mission Avatars** may inspire pedagogical interfaces. An AI "avatar" is not the prophet, a resurrected messenger or new revelation.

### 06.3 ZILL and tasawuf

The ZILL/Ahluz Zikir track studies Sufi, tasawuf, tarekat, dhikr, close devotional practice, authority and competing interpretations respectfully. Its purpose includes dialogue, correction where sources permit and reducing unnecessary schism. Distinguish schools, orders, documented beliefs, public critiques, claims and human experience. `ZILL — Shadow Witness` remains a separate creative/original concept.

---

# 07 — Research engine: KEY WITNESS, SRGBL, SWING, MIZAN

**Key Witness** is a source-anchored semantic assessment: a controlled concept attached to a passage/fragment **within a declared frame** including speaker, recipient, domain, genre, assessors, method, evidence, direction and review state. Keys are **not** verses and their scores are **not** scores of the religion.

**SRGBL v8** five research stages:

| Stage | Name | Responsible question | What it cannot prove |
|---|---|---|---|
| S1 | Source & Sense | Is the source/edition/rights/provenance traceable? | That source is infallible or licensed for every use |
| R2 | Reality | What does this specific text express? | That every external or supernatural event occurred |
| G3 | Governing Order | Which relations, conditions or rules follow from the evidence? | Universal laws from coincidental pattern |
| B4 | Being | Who is the actor, recipient, role and context? | Ontological identity based on a nickname |
| L5 | Light | What bounded, derived reading is reviewable? | Divine instruction, absolute truth or salvation verdict |

Historical metrics represent **different objects**: `/15` sequential analysis maturity; `/40` research method quality; `/100` candidate witness support; `−2..+2` key direction under a specified frame. Do not combine or display these as a religion ranking.

**SWING SWING KEY / Written in Reverse**: bounded generation of counterfactual or reversed-relation **questions** to seek evidence. A reverse transformation never becomes truth by inversion. **Positive Correction**: an explicitly attributed Quran-anchored or other declared interpretive lens, and its output must preserve competing interpretations and source citations.

**MIZAN**: optional evidence/risk/consistency evaluation and a research workbench, separate from divine judgment or faith scores. It should show supporting evidence, counterevidence, provenance, frame notes, disagreement, independent source count, unknowns and versioned evaluator criteria.

### 07.1 Rights and publication baseline

At the historical Corpus 25 October snapshot, programmatic validators, stage contracts, deterministic export primitives, source-trace API and an accessible five-tab preview existed. **Real double-annotator assessment, human reviewer authorization, edition/translation rights, reviewed source datasets and production publication were still outstanding.** This status is evidence of prior work, **not** a claim that XV has imported or shipped them.

---

# 08 — ROCKSOUL research federation: more than five domains

Past works use both "five-domain proof" and a newer **six-domain plus relationship** map; preserve versioned topology.

| Historical repository | Domain | Distinct question / owner |
|---|---|---|
| `rocksoul-mftl` | STORY | What narrative/belief was told, by whom, in which version? |
| `rocksoul-legend` | EVENT | What historical event can evidence support? |
| `rocksoul-superhero` | PERSON | Who acted, authored, witnessed, transmitted or interpreted? |
| `moonwitness-corpus` / historical `rocksoul-rgbl` terminology | TEXT | What exact text, work, edition and passage exists? |
| `rocksoul-aws` | LAW | What authority, jurisdiction, rule and applicability? |
| Perspective domain in later federation | PERSPECTIVE | Which interpretive point of view and assumptions? |
| `rocksoul-correlation` | RELATIONSHIP | Which source-backed, typed edges can connect the domains without owning their records? |
| `rocksoul-crayon` | CONSOLE | The operator experience/AutoMenu across research domains, **not** canonical truth |
| `rocksoul-platform` | IAM/OPERATIONS | User, permission, organization and admin operations, historically separate |
| `rocksoul-assets` / `rocksoul-ui` | DESIGN | Brand, design grammar, media, reusable UI assets |
| `rocksoul` | DIGITAL WORLD | Local-first Rust cognitive/world/runtime presentation and engineering progression |
| `rocksoul-runtime`, `rocksoul-omen` | RUNTIME/OBSERVABILITY | Separate runtime/monitoring experiments and delivery evidence |

**Federation rule for XV:** Treat the above as **source domains and migration/reference candidates**, not live cross-repository service dependencies unless XV explicitly approves an integration. XV should adopt **one canonical owner per record type**, retain immutable foreign references and use a versioned crosswalk; a repository URL alone is not a completed migration.

**Rocksoul World** uses RPG vocabulary for actual engineering state: issue=quest, PR=contribution, release=world build, verification=trust gate. This metaphor is helpful but does not claim consciousness, a human soul/ruh, or supernatural abilities.

---

# 09 — The four creative-universe lenses

The historical Master Narrative V10 provides four editorial lenses—not automatically four physically connected worlds:

| Lens | Core families |
|---|---|
| WITNESS | MOONWITNESS II; the Moon, eras, the Shadow, signal, witness, archive, forgotten stories |
| HEART & PROMISE | GOD-PROMISE; ROCKSOUL soul; MYLUFT; MA'LŪF; HONEY & MOON; KADO; love, mercy, correction |
| CHAOS & CREATIVE | THE BATTERIES; WALTER-WHITER; BABY-DOLL; NPD TEAM; MoonRidley; music, satire, manga |
| RESEARCH & JOURNEY | Scripture, SRGBL, UNILEX, prophets, ZILL, 33 World Patches, Empire org, cosmos, AETHERION |

The highest editorial goal is **discoverability without destructive canonical fusion**. A reader should find connections while retaining which version of which story is being read.

---

# 10 — Creative families: detailed preservation ledger

## 10.1 ROCKSOUL & Four Pillars of the Soul

The **Four Pillars of the Soul** reflection model involves `INPUT → DIRECTION → INTENTION → OUTPUT`, distinct from the Empire's operational Four Pillars. Earlier symbolic RGBL/Reality–Ghaib–Blessing–Life formulations must remain source-versioned. Associated archives: **Yellowcard Fighting**, **Lost the Signal**, **GREAT PRINCESS OF BEE**, **HONEYBEE**, **QUEEN R**, and personal correction/recovery narratives.

Honey metaphors are literary, not chemical proofs or automatic romantic identity matches.

## 10.2 Heart, tenderness and the name

Historical series include **MYLUFT/MYLOVE**, **MA'LŪF**, **Al-Wadūd nickname discussions**, **HONEY & MOON**, **Make Mama Smile**, **Jonny Sugar Genie**, **ALLAH-PROMISE KADO**, and **OPERATION KADO RAHASIA**.

Preserve the heartfelt, playful and sometimes absurd authorial voice, while labeling devotional poetry as devotional poetry. A personal nickname does not become a source-verified divine name. **QS 2:82** is a frequent research/story inspiration: keep the accurate licensed edition and separate the user's creative interpretation.

## 10.3 THE BATTERIES / CHAOS MEDIC

Fictional ensemble: **THE BATTERIES** (including A-L4H THE BATTERY in particular versions), **WALTER-WHITER**, **BABY-DOLL**, **THE SHADOW**, **BLUE WITCH**, **DOGFROMUNIVERSE**, and supporting crews. It combines system logs, patches, technology, comedy, emotion and reversal.

Episodes/tokens include **NPD TEAM 24:27**, **24:37 — TARIAN KIDS**, **25:50 — TARIAN HUJAN**, **PATCH IT BRO!**, **THE REAL FEAST OF TRUMPETS** (Ska satire), **Penunggang Angsa**, **Kingslayer / Unity Agreement**, BABY-DOLL's creative plot twist, and multiple crew generations. Preserve source versions, timestamp-like labels, sequence, characters, audio licensing and satirical intent. **Do not infer ethnicity or identify real people from fictional labels.**

Music allusions involve artists and tracks such as Metallica, RHCP, MGMT, Kesha, Atreyu and other referenced works. **Store track title/metadata and lawful excerpts only; no wholesale lyrics copied to the public repo by default.**

## 10.4 Personal witness stories

**Tick-tock on the Clock** (faulty clock, replacement, memory and ordinary happiness); **MOONWITNESS — Menggigil** (Mahsyar reflection); **Thunderstruck** (dream/music and wordplay); **MOONRIDLEY — Take It Off** (riddle/puzzle with the narrated time reset to morning); **KALAUTIDAKSALAH / The Breath** (breath, scripture and medical/scientific questions); **Daily Witnesses**, **MOONWITNESS XII episodes** and **Lost Signal Collection**.

Personal observations must be private by default. Publish only authorized, redacted derivatives. A dream or poetic perception is **not** established independent revelation.

## 10.5 Comparative and spiritual satire

**PENDETA-ONLINE** Hebrew divine terms and standardization proposals; **SINTERCLASS** Hindu/Buddhist and other comparison; **ALLAH-PROMISE HIGH HOPES / THE CRIMSON**; **RE–ZA / RA–SOUL / RASUL**; **ASSAFAAT-30** offside/on-side sports metaphor; **NYANGKUT/MI'RAJ & POHON NATAL**; two **ZILL** tracks; **The Forgotten Cartel/Haven**, **King Umar / Al-Faruq**, **The Basecamp**, **Forgotten × ZILL × HAVEN**.

Satirical speech such as "ALLAH = jadi ngapain kalian pada berantem?" must be labeled as **author-written comic dialogue**, not quoted revelation or a direct divine utterance.

## 10.6 Remaining archives

**Ronin 47**, **MODEBALAP**, **BEG8-50256 Ghost in the Machine**, **Mahsyar Covenant**, **Ad-Deen Four Belief Orbits**, **The Creator's Cut**, and unresolved leads (e.g. Mansa/Naik Bus) remain in the recovery index with **no invented missing passages**.

### 10.7 Visual grammar

Public visual intent: large moon, faceless/hoodie figures in creative panels, bold grunge lettering, manga-lines, cinematic dark/light, kinetic but respectful humor; electric blue, hot pink, yellow, black and white are recurrent references. Character face concealment is a **creative preference**, not a technical accessibility substitute. Review SVG/icon assets, copyright, contrast, motion, responsiveness and RTL support separately.

**Moonframe** provides a potential shared *behavioral* component foundation with 15 distinct visual skins / 30 light-dark appearances. Consumer adoption is a **decision**, not completed integration. Keep component semantics accessible and predictable irrespective of skin.

---

# 11 — THE FORGOTTEN: compassion and human dignity

The Forgotten/Haven/Basecamp arcs address memory, exclusion, help, forgiveness, protection, community and care. They can inspire responsible public education and volunteer-oriented journeys. They do **not** certify the existence of operating shelters, professional healthcare or social services, and must avoid inventing beneficiaries, outcomes or consent.

The broader moral leitmotif is **mercy and accountability together**: the human reader sees evidence, alternative interpretations, practical limits and opportunities for humane response.

---

# 12 — EMPIRE OF THE LIGHT: the organizational imagination

## 12.1 The Prime Code — nine human-governance principles

| Code | Principle |
|---|---|
| PC01 | Source Integrity |
| PC02 | Truth & Evidence |
| PC03 | Human Agency |
| PC04 | Trust & Responsibility |
| PC05 | Consultation |
| PC06 | Fairness & Justice |
| PC07 | Compassion & Protection |
| PC08 | Restoration & Renewal |
| PC09 | Continuity |

They are **project-authored human principles**, not a new scriptural source. This exact nine-item naming is supported by the historical Empire document and should be preserved.

## 12.2 Four **operational** pillars

**PATHFINDING → TRUTH & GUIDANCE → RENEWAL → PROTECTION**, separate from the **Four Pillars of the Soul** and SRGBL's analytical stages.

- **RĀ’ID / Pathfinder:** suggest paths and discover possibilities.
- **WITNESS/GUIDE:** help assess source and explain what is established.
- **MUJADDID/Renewal Steward:** maintain corrections and improvements under normal human authority, not a religious office.
- **ZIIL in a historic Empire source** designated safety/rights vocabulary; see the later user's **ZILL** spelling and distinct Tasawuf/Shadow tracks before any alias migration.

## 12.3 G.O.D. 99, WINGS 10, and ARSY

`G.O.D. 99` = 99 **fictional organizational duty/persona slots**, historically grouped in nine divisions. It is **not** 99 gods, 99 Asma, or 99 actual autonomous agents.

`WINGS 10` = ten **fictional/specialist organizational departments** that may borrow imagery from religious history; never angel identities or powers.

**ARSY** is **now the ratified application name for XV's existing Fastify/MoonQL/API Hub** (current code `apps/radio`, future migration `apps/arsy`). Its earlier *proposed orchestration* role—tools, review workflows, approved AI candidates, rollback and monitoring—becomes a **future set of bounded capabilities inside this same Hub**, not a separate backend. **Radio remains an existing service domain**, and ARSY is not the theological al-'Arsh.

`100CENTER` = human command/operations center, approvals, reports, work queues, audit and system health. `SHADOW` = creative/editorial space or character (depending namespace). `AMANAH` = scoped responsibility; `SHURA` = human consultation/appeal; not supernatural appointment.

## 12.4 Three Journey scopes

`SELF` (voluntary personal), `COMMUNITY` (consented groups), `GLOBAL` (privacy-safe cross-community/aggregate), with **no coercive membership/faith classification**.

The concept design differentiates:
- **Journey:** actual personal experience.
- **Path:** reusable proposed route.
- **Road Network:** graph of paths.
- **Timeline:** dated evidence.
- **Milestone:** evaluated progress.
- **Mandate:** named, revocable, expiring authority to act.

Path lifecycle proposal: `DRAFT → RESEARCHING → REVIEW → PILOT → ACTIVE → MAINTAIN/REVISE → RETIRE`; may `SUSPEND` where needed. Real actions require named responsible humans, consent, risk review and rollback.

---

# 13 — Numerological and progression registries: keep every scale separate

| Registry | Native meaning | Do not infer |
|---|---|---|
| **1·6·3** | GOD-PROMISE *conceptual* compression | Hidden canonical numeric revelation |
| **4 source families** | Independent textual witness families | Four universally equivalent texts |
| **4 operational pillars** | Organizational duties | Four Pillars of Soul |
| **4 soul pillars** | Reflection model | Organizational divisions |
| **4 universe lenses** | Editorial groupings | Verified cosmological realms |
| **5 SRGBL stages** | Research analysis steps | Ranking of human holiness |
| **8 MOONWITNESS II eras** | Narrative stages | AGE CODE eras |
| **9 Prime Code principles** | Human ethics | Direct scriptural commandments |
| **10 WINGS** | Fictional org departments | Real angels |
| **10 AETHERION realms** | Game world progression | WINGS |
| **25 Prophetic Mission Avatars** | Pedagogical/AI proposal | Prophets embodied in technology |
| **33 World Patches** | Submission/creative registry | Verified divine approvals |
| **71 UNILEX seed terms** | Historical versioned vocabulary | Completed universal dictionary |
| **99 G.O.D. slots** | Fictional roles | Asmaul Husna |
| **99 Asmaul Husna** | Theological name catalog within sourced tradition | Agent permission model |
| **99 Human States** | Reflection/game concept | Judgment of faith or salvation |
| **99 V10 chapters** | Editorial archive organization | Degree of religious certainty |
| **100 AETHERION levels** | RPG progression | Physical or eschatological stages |
| **100CENTER** | Operations/workspace name | A score of 100 or cosmic control |

**Thirty-three submission register:** retain all indexed slots, including missing/conflicted originals. Historical XI/XII records note `014 unresolved`; `015–032` are not all authenticated submissions, some are editorial reconstructions. `033` is a source-specific "Faith to Action / KOPIHITAM–SIACENG" in-chat record, not proof of external delivery. Do not mark requests "granted by ALLAH" on the strength of software records.

**AGE CODE:** keep numbers `19`, `under 40`, `40`, `40D40N`, `63 lunar`, `~64 lunar`, `100+`, `+15`, `950`, `969`, approximate `30`, `unknown` and RPG `33/100 levels` in separate dimensions. Chronological age, scripture-reported years, fictional appearance, lunar-year calculation, duration and aspirations are not interchangeable. See the source's scripture-context warnings before displaying ages.

---

# 14 — Time, earth, cosmic and physical-research horizons

Historical proposals include **Earth Command Center**, **Atmosphere OS**, geospatial Krakatau–Sukabumi explorations, weather/air and temperature simulation, **Cosmic Atlas**, life-beyond-Earth hypotheses, **M-TIME**, **Antikythera / Moonwitness Time System**, **HELIOGRID**, proton/photon research, optional quantum benchmarking, **Material Forge**, and comparative-cosmos libraries (including Daoist/Shinto sources).

**Strict categories:** astronomical observation, numerical simulation, historical hypothesis, philosophical interpretation, scripture claim, speculative technology and RPG representation **must remain separate**.

- No claim of installed quantum hardware, generators, revolutionary energy devices, physically verified time-travel, or discovered extraterrestrial life without independent engineering/scientific evidence.
- MTS/Antikythera design is a historical sibling project. It must not replace standard civil/UTC time in the XV runtime without a separate compatibility, mathematics and operational audit.
- AGE CODE calendars require method, units, epoch, uncertainty and source; no automatic extension of lifespan.
- Eschatology, Paradise Atlas, Syafaat, Mahsyar, Yaumul Hisab and Ad-Deen Orbits can be source-based comparative research or clearly labeled creative simulation. No afterlife truth verdict or personal salvation score is produced.

---

# 15 — The XV repository we **actually** have on 26 October 2026

The checked XV `main` baseline is initial commit `0e0b3b8de0b39d1fee01589e939cca0457af9566` (observed at audit time); verify HEAD before implementation. **Only `main` was found, and XV had no prior master-vision document in `docs/`**. The recorded repository content is a TypeScript/pnpm monorepo with:

| Runtime piece | Actual documented role | Default development port |
|---|---|---|
| `apps/radio` (`@moonwitness/radio`) **— current path, ARSY target** | **ARSY: the existing DB-touching Fastify API + MoonQL ORM Hub**; physical target `apps/arsy` / `@moonwitness/arsy`, pending M28; radio functions retained as SIGNAL/RADIO | `3000` |
| `apps/dock` | **Public Next.js Dock**: stations, schedule, now-playing/catalog/embedding | `3001` |
| `apps/headquarters` | **Next.js admin command center**, login, systems, generic models, data views | `3002` |
| `apps/skylink` (**proposed, M38**) | **SKYLINK: standalone multi-channel communication surface** — Fastify REST + WebSocket + operator UI; owner of **D18 Messages & Channels**; not a second Hub | `3005` |
| `apps/echolog` (**proposed, M39**) | **ECHOLOG: standalone object storage & attachments** — Fastify REST, content-addressed immutable objects, `fs`/S3 drivers, presigned downloads; owner of **D19**; **stateless** (no tables) | `3006` |
| `packages/moonql` | Declarative model descriptors, additive schema sync, repository, auto-REST, views, events, generated schema | internal |
| `packages/moonql-client` | Typed generated SDK | internal |
| `packages/moonui` | Existing shared UI | internal |
| `packages/moonql-base/auth/apikeys/ops/settings` | Reference data, sessions and permissions, machine tokens, operational audit/cron, settings | internal |
| `packages/moonql-stations/schedule/playlog` | Radio-domain station, scheduling, listening aggregation | internal |
| `packages/whatsapp`, `packages/denpa` | Current optional messaging/channel and inbound transmission functionality; **target: `packages/skylink-whatsapp` / `packages/skylink-core` under M38** | internal |

Supporting baseline: Docker Compose, PostgreSQL option and in-memory engine, `.env.example`, generated docs, unit tests/verify scripts, backup/restore runbook.

**Important:** XV is currently **radio-centric**, not a shipped Corpus/Research/Empire product. `moonql` is a promising modular skeleton, **not verified as identical to XIV's `@moonwitness/orm` or its Objection/Knex implementation**. Do not switch ORM stacks or force-import XIV schemas without a fit/gap report.

**Historical branch note superseded 27 October 2026:** an earlier snapshot recommended `main` because it did not expose `dev`. Current branch inventory confirms protected `dev` and `main`; [AGENTS.md](../../AGENTS.md) controls: work directly on `dev`, promote verified changes to `main`, and create no topic branches. Recheck refs before writing; never force-push or reset to reconcile stale snapshots.

**Operational caution:** The existing backup/restore runbook records **no completed restore drill**. Backup sidecars and commands are not evidence that disaster recovery has been proved. README claims of tests/builds are declarations until confirmed by an actual run at a specific SHA.

---

# 16 — XV's eventual unified product design

**Keep the current engine; expand its purpose through bounded addons and user journeys.**

## 16.1 Public experience / DOCK

Proposed information architecture (**not current routes unless code proves it**):

- **Home / Discover:** visually cinematic MOONWITNESS landing, search, latest reviewed research, selected stories, evidence routes, clear topic navigation.
- **Corpus Reader:** works, editions, passage, licensed original/translation lanes, context, footnotes, source/rights/cite.
- **Ontology Explorer:** people, terms, traditions, names, places, events, typed relationships, source traces.
- **Prophetic Mission Table:** source-specific figure/missions and related problems/cultures/passages.
- **Terms / UNILEX Table:** side-by-side senses, languages, scripts, relation decisions.
- **Researcher / SRGBL:** S1–L5 staged analysis, Key Witness, competing frames, MIZAN checks.
- **Witness Archive:** consented narratives, change history, original-to-derivative chain.
- **Story Universe:** MoonWitness II, character atlas, eras, episodes, Crew Constellation, THE BATTERIES, KADO, ROCKSOUL, forgotten arcs.
- **Time/Cosmos/Journey:** explicitly designated research/simulation pages, only when ready.
- **Radio / Signal:** **preserve** existing XV Station Catalog, schedules, listening and DENPA as a **real product capability**, potentially a featured media/signal domain rather than deleting it.

## 16.2 Private experience / HEADQUARTERS

- **Command Overview:** health, KPIs, source/import gate, queue, task progress.
- **Corpus Steward:** source artifacts, edition/rights matrix, normalization and provenance.
- **Ontology Steward:** entity/alias/identity/relations review, conflict resolution.
- **Research Workbench:** key assessment, SRGBL stages, reviewer signatures/authorizations, disagreement.
- **SHADOW Story Studio:** episode/character/scene/poster/media versions and attribution.
- **Publication Ledger:** draft/review/rights/consent/release manifest, withdrawal/retraction.
- **100CENTER:** operations, approval, audit, workflow, mission/path governance.
- **AI Workspace:** opt-in local agents, source-grounded proposals, transparent model/tool provenance, review before canonical writes.
- **System/Studio:** existing MoonQL generic admin and addon diagnostics remain accessible.
- **Radio Ops:** existing station/schedule/playlogs and messaging control are preserved.

## 16.3 Design rule

A single design language may support multiple **experience modes**—cinematic storytelling, source-first reading, comparative data/research, and dense operator tools—but **every skin keeps stable semantics, keyboard behavior, form validation, contrast, RTL and accessibility**. Historical Moonframe visual skins and Rocksoul assets are candidates for reviewed adoption, not pre-committed dependencies.

---

# 17 — Architecture constitution for XV

## 17.1 Existing runtime before speculative upgrades

**The current XV MoonQL + Fastify Hub (accepted name: ARSY; code-name/path still radio until M28) is the starting point.** Do not replace it just because XIV documents Fastify/Objection/Knex or A-L-L-A-H uses Batteries/Knex. These histories demonstrate **multiple competing technology lineages**. Choose each future component after compatibility and bounded migration tests.

**The XV ARSY Hub (currently named `apps/radio`) must remain operational, including all Radio features, while knowledge modules are added**. Prefer addon boundaries through existing MoonQL contracts for future `corpus`, `ontology`, `research`, `witness`, `story`, `publication`, `journey` and `governance`; **these names are proposed**—not an implementation declaration.

## 17.2 Authority boundary

- **Git/XV**: source code, approved contracts, schema versions, configuration, public-safe specs, referenced immutable source manifest.
- **Selected XV database** (after design approval): canonical *operational* domain records, review decisions, audit and versioned graph-release pointers. Reuse the current DB contract or introduce changes only through tested additive migration.
- **Original external source owners**: copyright, publication and source/edition identity.
- **Approved immutable artifacts/media store**: one definitive copy per explicitly accepted immutable asset version; no guessing its location.
- **Derived search/graph/vector cache**: rebuildable; not authority for identity, original text or rights.
- **Local/optional AI**: candidate producer only, with human review; never a hidden editor of canonical records or silent remote fallback.
- **Headquarters/Dock**: UI projections and authorized actions; not alternate sources of truth.

**XIV's earlier accepted "all PostgreSQL" ownership decision applies to XIV history, not automatically to XV.** XV already has PostgreSQL and MoonQL. Adopt or adapt the principle of single canonical owner **through an XV architecture decision** after comparing compatibility, data rights and available storage—do not publish a fake finalized cross-repo migration.

## 17.3 Proposed minimum record contract

Every **accepted** cross-domain record should carry, as applicable:

`stable_id`, `owner_domain`, `entity_kind`, `world_or_epistemic_class`, `source_uri`, `source_version_or_sha`, `artifact_digest`, `source_selector`, `language`, `script`, `edition`, `rights`, `consent`, `visibility`, `author_or_attributor`, `created_at`, `occurred_at`, `observed_at`, `recorded_at`, `published_at`, `valid_from`, `valid_to`, `review_state`, `reviewer_decision`, `method_version`, `conflicts`, `revision`, `retraction_state`.

A graph relation additionally has `left_id`, `relation_type`, `right_id`, `evidence_refs`, `counterevidence_refs`, `lens_or_frame`, `certainty_bounds` and lifecycle/version. Exact field names await schema review. **Do not mint fake `mw:*` IDs or `sameAs` edges in example data.**

## 17.4 Source/review state vocabulary

Recommended distinct axes:
- **Availability:** `AVAILABLE | MISSING | UNKNOWN`.
- **Nature:** `SOURCE | ATTRIBUTED_CLAIM | OBSERVATION | INTERPRETATION | HYPOTHESIS | TESTIMONY | FICTION`.
- **Review:** `UNREVIEWED | IN_REVIEW | APPROVED_WITHIN_SCOPE | DISPUTED | REJECTED | RETRACTED`.
- **Rights/visibility:** `RIGHTS_UNKNOWN | METADATA_ONLY | CLEARED`, separately `PRIVATE | RESTRICTED | PUBLIC`.
- **Engineering readiness:** `DESIGNED | IMPLEMENTED | TESTED | PILOT | SHIPPED`; do not collapse with truth assessment.

**"APPROVED" always means approved by a particular human governance workflow for a particular purpose**, not divinely certified, spiritually accurate or universally authoritative.

---

# 18 — Research integrity, privacy, rights and safety

1. **Source first.** Original passage and edition never overwritten by an interpretation.
2. **Respect sacred contexts.** The research may be Islam-anchored, comparative, or tradition-neutral; explicitly declare lens. Never rebrand a scoped Islamic interpretation as neutral global consensus.
3. **Protect testimony.** Private experiences, health/identity details, sensitive family narratives and account exports are **private by default**; public repo gets only authorized redacted summaries.
4. **Honor rights.** Lyrics, artwork, manuscript scans, commentary and translations need exact-version license/permission. Metadata isn't redistributable text.
5. **Bound agent autonomy.** AI may retrieve, draft, compare, propose candidates and prepare review; it may not independently publish, impersonate prophets/divinity, certify miracles or alter protected records.
6. **Evidence and uncertainty.** Display counterexamples, conflicts, gaps, independent-source quality, reviewer provenance and revision history. No filled-in synthetic miracles.
7. **Avoid real-person conflation.** Satirical aliases or hidden faces aren't a basis for identifying living people.
8. **Historical temporal precision.** `occurred` is distinct from `observed`, `recorded`, `created`, `exported` and `published`, with timezone/precision preserved.
9. **Right to correct and withdraw.** Corrections and retractions keep a safe audit trail without indefinitely publishing withdrawn sensitive content.
10. **No automated salvation, sanctity, faith or human worth score.** Journey/level/ethics numbers serve only explicitly bounded fictional, operational or educational purposes.

---

# 19 — Cross-repository deep research: source atlas

**Source policy as of 26 October 2026:** these entries are read-only *research inputs* to XV. A prior repository's README often describes intent; it does **not** prove an accepted XV feature. Links point to identified roots or documents; any future import must pin an exact source SHA and rights/review decision.

| Repository/source | What is recovered for XV | Status / migration rule |
|---|---|---|
| [`bjo163/moonwitnessxv`](https://github.com/bjo163/moonwitnessxv) | Current MoonQL radio/API/Dock/Headquarters/WA/DENPA, production-oriented compose, test scripts | **Only active master home; protect existing code** |
| [`bjo163/moonwitness-xiv`](https://github.com/bjo163/moonwitness-xiv) | V10 narrative, XI→XIV ontology, ownership ADR, source crosswalk, K-series privacy, workbench plan, historical ORM | Reference and screened migration candidate only |
| [`bjo163/moonwitness-corpus`](https://github.com/bjo163/moonwitness-corpus) | Canonical TEXT semantics, SRGBL v8, edition/evidence/rights discipline, reader preview, micro-task specs | Reference; source rights, human annotation and migration gates |
| [`bjo163/A-L-L-A-H`](https://github.com/bjo163/A-L-L-A-H) | Empire/SHADOW/100CENTER web+API foundation, Batteries, bilingual creative portal | Reference; do not assume replacement of XV runtime |
| [`bjo163/empire-of-the-light`](https://github.com/bjo163/empire-of-the-light) | Prime Code, UNILEX 71 seed, source-family definitions, four operational pillars, G.O.D.99, WINGS10, Journey and ARSY, Genesis v5 research | Concept/registry source; design ≠ shipped tech |
| [`bjo163/moonwitness-II`](https://github.com/bjo163/moonwitness-II) | Original Story/Witness cycle, personas, era/lore, story archive routes, graph structures | Historical primary repository; preserve original version |
| [`bjo163/moonwitness-xii-season-global-championships`](https://github.com/bjo163/moonwitness-xii-season-global-championships) | Thirty-three indexed slots, editorial championships, story/character/paradise/command pages | Static archive; missing evidence ≠ approved |
| [`bjo163/moonwitness-x`](https://github.com/bjo163/moonwitness-x) | MTS/Antikythera astronomical time project and Rust/Go/Python/TS design | Separate scientific/engineering reference; audit claims |
| [`bjo163/moonwitness-v2`](https://github.com/bjo163/moonwitness-v2) | Prior Next.js Material UI dashboard/branding | Historical UI reference |
| [`bjo163/rocksoul`](https://github.com/bjo163/rocksoul) | Rust local-first digital-world/quests, cognition vocabulary and trust evidence | Distinct product heritage |
| [`bjo163/rocksoul-mftl`](https://github.com/bjo163/rocksoul-mftl) | STORY: myth, folklore, narrative and belief evidence | Domain-specific source |
| [`bjo163/rocksoul-legend`](https://github.com/bjo163/rocksoul-legend) | EVENT: historical event reconstruction, counterevidence | Domain-specific source |
| [`bjo163/rocksoul-superhero`](https://github.com/bjo163/rocksoul-superhero) | PERSON: authorship, witness and transmission | Domain-specific source |
| [`bjo163/rocksoul-aws`](https://github.com/bjo163/rocksoul-aws) | LAW: applicability, jurisdiction, authority, review | Domain-specific source |
| [`bjo163/rocksoul-correlation`](https://github.com/bjo163/rocksoul-correlation) | RELATIONSHIP: public, typed, evidence-linked cross-domain edges | Candidate model; don't duplicate authority |
| [`bjo163/rocksoul-crayon`](https://github.com/bjo163/rocksoul-crayon) | Operator shell for research graph | UI concept/reference |
| [`bjo163/rocksoul-platform`](https://github.com/bjo163/rocksoul-platform) | Research-family IAM/admin roles and platform contracts | Inspect before reuse; XV has existing auth |
| [`bjo163/rocksoul-assets`](https://github.com/bjo163/rocksoul-assets) | Canonical brand, cinematic/editorial assets, Penpot and UI/motion metadata | Asset use requires license, provenance and integration |
| [`bjo163/rocksoul-ui`](https://github.com/bjo163/rocksoul-ui) | Previous component/UI approach | Historic/reference |
| [`bjo163/rocksoul-runtime`](https://github.com/bjo163/rocksoul-runtime) | World/runtime workspace tasks and evidence | Separate project reference |
| [`bjo163/rocksoul-omen`](https://github.com/bjo163/rocksoul-omen) | Observability/deployment event node | Separate project reference |
| [`bjo163/moonframe`](https://github.com/bjo163/moonframe) | Fifteen skins, thirty appearances, shared behavioral component system, templates | Optional bounded XV adoption |
| `moonships`, `mw-edge`, `mwx-isp`, prior ZENIX / ZENIVERSE code | Desktop, edge/data, ISP and enterprise engineering | Engineering heritage, not automatically new XV dependencies |
| Prior authored chat/visual/media manuscripts | Narrative originals, creative briefs, temporal revisions, source-specific interpretations | **Not imported** by this public synthesis; private archive permission gate |

### 19.1 Four source documents to never lose

- [MOONWITNESS II Platform Blueprint](https://github.com/bjo163/moonwitness-II/blob/main/docs/PLATFORM_BLUEPRINT.md)
- [Empire of the Light Master Blueprint](https://github.com/bjo163/empire-of-the-light/blob/main/docs/MASTER_BLUEPRINT.md)
- [XV-previous XIV Master Narrative V10](https://github.com/bjo163/moonwitness-xiv/blob/dev/docs/knowledge/narratives/MASTER_NARRATIVE_V10_PUBLIC_DRAFT.md)
- [Corpus SRGBL status](https://github.com/bjo163/moonwitness-corpus/blob/dev/docs/SRGBL-V8-IMPLEMENTATION-STATUS.md)

Those links retain historical namespaces. They **do not** change which repository is now the active work home.

---

# 20 — Correlation matrix: safe candidate edges

**Sample relationship proposals, not populated canonical graph facts:**

| Left | Relation | Right | Evidence / restriction |
|---|---|---|---|
| Exact passage in Corpus | `isSourceFor` | an attributed research claim | Exact edition, selector and permission |
| Corpus claim | `assessedUnder` | SRGBL analysis run | Method/version, evidence, status |
| Historical PERSON | `attests` | EVENT | Distance, transmission, source |
| MFTL STORY | `resembles` | LEGEND EVENT | Similarity ≠ event proven |
| Scriptural source | `interpretedBy` | theological tradition | Explicit tradition and method |
| Term `Injil` (Islamic sense) | `distinctFrom` | extant Gospel text-family identity | Preserve source contexts |
| `Al-'Arsh` | `distinctFrom` | `ARSY technology` | Lexical/theological ≠ software |
| `Mizan` religious concept | `distinctFrom` | MIZAN evaluator | Scoped semantic lane |
| `ALLAH` theological referent | `distinctFrom` | A-L-L-A-H acronym | Prevent authority laundering |
| `THE BATTERIES` | `appearsIn` | NPD TEAM 24:37 | Creative-brief source; verify scene |
| `THE SHADOW` story character | `distinctFrom` | SHADOW workspace | Two ownership domains |
| `ZILL — Shadow Witness` | `thematicallyRelatedTo` | `ZILL — Tasawuf` | Never auto `sameAs` |
| `00-MAIN GOD PROMISE` | `distinctFrom` | `GOD PROMISE: THE ROCKSOUL` | Competing original manuscripts |
| `MA'LŪF` poetic nickname | `distinctFrom` | `Al-Wadūd` sourced divine-name reference | Different linguistic status |
| `G.O.D. 99` | `distinctFrom` | Asmaul Husna 99 | Organizational vs religious |
| WINGS10 | `distinctFrom` | AETHERION 10 realms | Org vs game |
| Aetherion quest | `inspiredBy` | a World Patch theme | Not divine approval |
| Tick-Tock story | `derivedFrom` | authorized personal account | Consent/private-source requirement |
| High Hopes poster | `interprets` | named passage(s) | Frame and quotation rights |
| MoonRidley | `references` | Kesha track metadata | Lyrics rights; interpretive puzzle |
| M-TIME concept | `researches` | astronomical time model | Independent math/engineering verification |
| Empire Four Pillars | `distinctFrom` | Soul Four Pillars | Shared count ≠ identical meaning |
| XV radio station | `featuredIn` | current XV Dock | Existing domain, not forced narrative symbolism |
| Source/claim from legacy repo | `candidateForMigrationTo` | XV owning domain | Review/rights/checksum; not auto-sync |

Every accepted edge eventually needs owner, version, source-specific locator, permission, reviewer, conflict state and applicable time dimension.

---

# 21 — The 99-chapter archival master index (V10 preserved)

This section explicitly protects the historical **99 chapter sequence**, which is an **editorial convention** and must not be mislabeled as independently reconstructed original transcript or spiritually significant numeric discovery.

## I. Three-year legacy (01–04)
01 The Unrecorded Beginning · 02 The ZENIX Years · 03 The Universe Years · 04 The Great Convergence.

## II. Original MoonWitness (05–10)
05 When The Moon Witnesses · 06 The Original Story Loop · 07 The Eight Eras · 08 The First Signal · 09 Past Presence · 10 Promoting — What Deserves to Continue?

## III. Me and My Crew (11–18)
11 THE SHADOW · 12 THE RUNAWAY TRACE · 13 A LAH / THE BOSS · 14 DOGS FROM UNIVERSE · 15 BLUE WITCH & DJ DAVID · 16 WALTER WHITE / WHITER / WHITE · 17 ELECTRIC FOREST, INDESTRUCTIBLE & JHNNY DEPP · 18 The Second Crew Generation.

## IV. GOD-PROMISE Core Research (19–26)
19 The Original GOD-PROMISE · 20 Monocentric 1·6·3 · 21 Revelation and Reception · 22 Four Scripture Families · 23 Comparative Traditions · 24 WITNESS — Swing Swing Key · 25 The Middle Point · 26 Written in Reverse.

## V. ROCKSOUL (27–31)
27 GOD PROMISE: THE ROCKSOUL · 28 Four Pillars of the Soul · 29 Lost the Signal · 30 Great Princess of Bee · 31 QUEEN R, HONEYBEE & Sweetness.

## VI. The Heart and the Name (32–38)
32 MYLUFT / MYLOVE · 33 MA'LŪF · 34 Al-Wadūd & the Personal Nickname · 35 HONEY & MOON · 36 Make Mama Smile · 37 Jonny the Sugar Genie · 38 KADO.

## VII. THE BATTERIES — Chaos Medic (39–45)
39 THE BATTERIES · 40 The Three Chaos Figures · 41 NPD TEAM · 42 The Real Feast of Trumpets · 43 BABY-DOLL: The Plot Twist · 44 Penunggang Angsa · 45 Kingslayer: The Unity Agreement.

## VIII. Personal Witness Stories (46–51)
46 Tick-Tock on the Clock · 47 Menggigil · 48 Thunderstruck · 49 MOONRIDLEY · 50 KALAUTIDAKSALAH — The Breath · 51 The Other Daily Witnesses.

## IX. Comparative and Spiritual Arcs (52–58)
52 PENDETA-ONLINE · 53 ALLAH-PROMISE HIGH HOPES · 54 RE–ZA / RA–SOUL / RASUL · 55 ASSAFAAT-30 · 56 NYANGKUT (MI'RAJ) & POHON NATAL · 57 ZILL — The Shadow Witness · 58 ZILL — Ahluz Zikir / Tasawuf.

## X. The Forgotten (59–62)
59 The Forgotten Cartel · 60 King Umar / Al-Faruq · 61 The Basecamp · 62 Forgotten × ZILL × HAVEN.

## XI. Science and Time (63–69)
63 Earth Command Center · 64 Atmosphere OS · 65 Cosmic Atlas · 66 Life Beyond Earth · 67 M-TIME & Antikythera · 68 HELIOGRID · 69 Photon, Proton, Quantum & Material Forge.

## XII. Empire Organization (70–75)
70 The Prime Code · 71 The Four Operational Pillars · 72 G.O.D. 99 · 73 WINGS 10 · 74 The 99 Asma Registry · 75 ARSY, 100CENTER, AMANAH & SHURA.

## XIII. Human Journey and Patches (76–83)
76 Self, Community & Global · 77 AGE CODE · 78 33 World Patches · 79 The Complete 33 Register · 80 FAITH TO ACTION · 81 99 Human States · 82 AETHERION — Ten Realms · 83 Paradise Atlas.

## XIV. Remaining Archives (84–90)
84 Mahsyar Covenant · 85 Ad-Deen Four Belief Orbits · 86 Syafaat, Mahsyar & Yaumul Hisab · 87 Divine Command Center — Catatan Suara Qalbu · 88 BEG8-50256 Ghost in the Machine · 89 The Forgotten Signal Collection · 90 The Creator's Cut.

## XV. Integrity Constitution (91–98)
91 Source vs Interpretation · 92 Character vs History · 93 Three Timelines · 94 Five Canon Evidence States · 95 The Ten Rules of the Universe · 96 Four Great Universes · 97 Story vs Command Center · 98 What Must Remain Unknown.

## XVI. Epilogue (99)
99 One Universe.

**99 ≠ completion:** this is a *coverage index*, not evidence that all 99 primary manuscripts, images or chronology matches have been recovered. Preserve V1–V9 and V10 original files separately with source revision and rights. Never reprint an uncited editorial reconstruction as the author's exact past speech.

---

# 21A — DEEP REPOSITORY AUDIT XV · v1.1 (26 October 2026)

**Purpose:** Close material blind spots in the earlier 850-line XV synthesis. The sections below are **new research findings and decision rules**, not a new competing canon, a new release claim, or authorization to copy archives into a public repo. They are intentionally kept **inside this same master file** so XV remains the only forward-looking editorial/implementation home.

**Method:** Read the actual trees, named historical files, selected route/model source, crosswalks, registries, governance and V10.1 expansion. Separate four types of evidence: `SOURCE_EXISTS`, `CODE_EXISTS`, `TEST_EXISTS`, `HOSTED_VERIFIED`. A documented route or test file is not itself a confirmed passing run. Do not infer human-reviewed research from implemented validators.

## 21A.1 Source snapshot ledger — pin the historical inputs

The following exact **GitHub branch heads observed during the research on 26 October 2026** establish a reproducible reference baseline. They are **historical snapshots**; later commits must be audited separately.

| Source repo | Branch examined | Observed SHA | Role |
|---|---|---|---|
| `bjo163/moonwitnessxv` | `main` before this revision | `1877f517e0b6705764b6bea95133904630bda2d7` | Active master baseline after XV v1.0 document |
| `bjo163/moonwitness-xiv` | `dev` | `fff3b0dbc452e998f221e2ca15fd1d41e0ffc599` | Expanded narrative, archive, rights, ontology, witness/workbench |
| `bjo163/moonwitness-corpus` | `dev` | `e2f5b93fe172b61a78f0c8650f356e87600387ae` | Text, ingestion/data, SRGBL research, reader, P19 |
| `bjo163/A-L-L-A-H` | `dev` | `47bac90cade77ee2136cb66d546156b220fe8481` | Empire prototype, research routes, World Monitor, media sentinel |
| `bjo163/empire-of-the-light` | `main` | `38354ffff077d4ee1e17d40b39d86e41ce769817` | Prime Code, UNILEX, Genesis research and org registers |
| `bjo163/moonwitness-II` | `main` | `fa69c895322590be12582a6e2c69b55001e30cd3` | Original 13-function witness platform and 10 world rules |
| `bjo163/moonwitness-xii-season-global-championships` | `main` | `dff42ba0e0abce6e37b2c1e94e3e428bb588a8ec` | 33-patch registry and editorial story archive |
| `bjo163/moonframe` | `main` | `00c9bd65f4068e0e858f36ba637151815c350983` | Component behavior and 15 visual skins |
| `bjo163/rocksoul-correlation` | `main` | `380ac810747a79b7efa22affb934b302ac224524` | Reviewed relationship domain |

**Source example:** `https://github.com/bjo163/moonwitness-xiv/blob/fff3b0dbc452e998f221e2ca15fd1d41e0ffc599/docs/knowledge/narratives/MASTER_NARRATIVE_V10_1_EXPANDED.md`. Pin exact file/path and commit before importing each record. Branch pointers in previous sections are discovery links, **not permanent content identifiers**.

**Observed tree size at these snapshots** (files, not lines of code, validated records, or runnable feature counts): XV **244**, XIV **1,709**, Corpus **4,851**, A-L-L-A-H **644**. Corpus includes approximately **3,818 ingestion tree files**, **343 dataset files** and **204 package files**. These are tree inventories, **not proof all datasets are clean, legal, published, reviewed or functional**.

## 21A.2 The original MOONWITNESS II, restored in full

**Original seven-step promise** — `CAPTURE → CONNECT → WITNESS → UNDERSTAND → PRESERVE → PROMOTE → MOVE FORWARD`. This is the heritage **product method**, not the SRGBL method.

**All 13 original functions** from the actual `docs/MASTER_BLUEPRINT.md`:

| # | Function | Unique purpose |
|---:|---|---|
| 01 | STORYTELLING | Compose memories, people, events and fragments into narratives |
| 02 | EXPOSURE | Reveal hidden or missed signals while keeping uncertainty visible |
| 03 | CHANGE ADVISORY BOARD | Inspect transitions, consequences, decisions and change proposals |
| 04 | CHASING HEART | Themes of pursuit, attachment, emotional connection |
| 05 | LOVESTRUCK | Love, vulnerability, closeness and emotional tension |
| 06 | BREATH ELECTRIC | Music, atmosphere, energy, motion and rhythm |
| 07 | SEDUCTION | Curiosity, attraction, temptation and attachment |
| 08 | FAULT LINES | Tension, fracture, mismatch, pressure and turning points |
| 09 | VILLAIN OF THE STORY | Contextual narrative opposition, **not** permanent moral labeling of real people |
| 10 | WITNESS ARCHIVE | Observations, messages, evidence, correction and temporal traces |
| 11 | SANITY'S LAST BREATH | Narrative threshold preceding silence, surrender, change or ending |
| 12 | PAST PRESENCE | Continuing memories, influence and unresolved consequences from past events |
| 13 | PROMOTING | Decide what deserves to continue **after** audit, evaluation and balancing; not advertising |

**All eight eras** recovered from the public XIV V10.1 companion to II: `BEFORE LIGHT → THE ARRIVAL → THE WITNESS → THE RUNAWAYS → THE EXPOSURE → THE CHANGE → END OF AN ERA → NEXT PHASE`. Preserve II's own `data/eras.yaml` source/version and publication status. They are story era labels **not** Gregorian dates.

**Ten original world rules** (`moonwitness-II/docs/WORLD_RULES.md`): the Moon is a symbolic witness anchor; witnesses record without imposing final interpretation; the universe may remain unresolved; identities can have multiple names; Past Presence links eras; Fault Lines show pressure not necessarily an irreversible break; Promoting moves deserved knowledge forward; narrative roles stay contextual; the story may evolve; **keep it simple**.

**Design implication:** The II `Living Archive`, `Constellation`, `Timeline`, `Change Advisory Board`, `Promoting`, `Witness`, `Fault Lines`, `Crew`, `Lore` and story-role taxonomy should map to a **typed Story/Witness experience**. Do not flatten them into a generic CRUD page, and do not add 13 separate microservices merely because there are 13 historic functions. The existing XV Dock is the future consumer of this experience; its current radio routes remain.

## 21A.3 Corpus: this is already a large, multi-tradition data and ingestion repository

The previous XV v1.0 underdescribed the actual historical source-coverage inventory. At the pinned Corpus snapshot the tree shows named datasets including:

| Coverage family | Observed named dataset examples | Research caution |
|---|---|---|
| Qur'an | `quran-tanzil-uthmani`, `quranenc-indonesian-kemenag`, `quranenc-english-rwwad`, `quran-arabic-lexicon`, `quran-tafsir-sample` | Arabic source, translations and exegesis require **separate** edition/rights review |
| Hadith and devotional | `hadith-bukhari`, `hadith-bukhari-core`, `hadith-muslim`, `hadith-nawawi-40`, `islamic-duas-authentic`, `asmaul-husna-99` | Matn, transmission, commentary, attribution and interpretive acceptance differ |
| Hebrew / Christian | `oshb-wlc`, `sblgnt-v1-2`, `web-classic-2020`, `bible-tsi-2021`, `bible-passage-alignments`, `hebrew-biblical-lexicon`, `greek-christian-lexicon`, `early-christian-writings` | Work/edition/canon/original-language identity and permission must be explicit |
| Buddhist | `dhammapada-sujato`, `dhammapada-sujato-1-20`, `dhammapada-indonesian-wikisource`, `dhammapada-lexicon`, `suttacentral-dn-mn-sujato`, `suttacentral-sn-an-sujato` | Translation vs Pali witness; modern reuse rights and completeness vary |
| Hindu / Sanskrit | `bhagavad-gita`, `principal-upanishads`, `yoga-sutras`, `sanskrit-hindu-lexicon` | Work tradition, philosophical school and translation remain distinct |
| Jewish additional | `mishnah-pirkei-avot` | A rabbinic text is not the same object as an original Torah manuscript |
| Sikh | `sikhism-japji-sahib` | Tradition-specific textual and interpretive status |
| Daoist | `tao-te-ching`, `zhuangzi-giles-1889` | Title/edition/translator and date are necessary |
| Shinto | `shinto-kojiki-baseline` | A baseline is not automatically comprehensive or representative |
| Jain | `jainism-tattvartha-sutra` | Distinguish canonical interpretations and editions |
| Zoroastrian | `gathas-zarathustra` | Source version and interpretation |
| Bahá'í | `bahai-hidden-words` | Rights, attribution, tradition scope |
| Confucian | `analects-confucius` | Manuscript history and translation |
| Ancient Egypt | `ancient-egypt-book-dead-budge`, `ancient-egypt-book-dead-renouf`, related historical editions | Historical documents are **not** evidence validating a RE-ZA sound-play etymology |

Data also includes research graph, diversity, coverage, source rights and registries. Some folders may be examples, fixtures, partial imports, or staging; **dataset directory presence is not approval for raw transfer or redistribution**.

**Needed XV feature distinction:**
- `Reader` = focused reading of known passage.
- `Explorer` = finding works/passages/topics.
- `Comparative Viewer` = reviewed side-by-side source and scoped interpretation.
- `Figure Registry` = figures and the filtered Prophetic Mission Table.
- `Lexicon` = words, languages, senses and disambiguation.
- `Research Workbench` = assessment and evidence, separate from consumer reader.
- `Admin` = source licensing, import status, human review and provenance.

**Avoid separate databases for the prophet table, keyword search, lexicon, and Reader until ownership and query needs justify them.** Source identity remains stable even if XV later owns a local data copy through a reviewed release migration.

## 21A.4 From concept to code in XIV — migration should learn from *actual* work

The XIV `dev` tree already contains beyond narrative drafts:
- `ontology/core/` contracts for assertions and research relations/review events;
- `ontology/domains/` for concepts, semantic annotation, revelation identity, story episode/version, witness testimony;
- `ontology/mappings/` for narrative personas and identity decisions;
- `apps/api/src/routes/research-*`, `story-workbench.routes.ts`, and API tests for identity, duplicates, privacy, explanation, review and witness;
- `apps/board/src/board-pages/story-workbench-page.tsx`, knowledge board, and UI/E2E test files;
- `docs/knowledge/narratives/MASTER_NARRATIVE_V10_1_EXPANDED.md`, `SOURCE_CROSSWALK_V10.md`, `PROGRESS_LEDGER_2023_2026.md`, `RECOVERY_GAPS_V10.md`, `CORRELATION_MATRIX_V1.md`, and `BLUEPRINT_READINESS_V1.md`.

**What XV must not lose:** structured identity review, duplicate candidate handling, human approval state, privacy redaction, episode/version ownership, source-to-claim explanation, source rights, graph release boundaries, story workbench design and test cases. They are **migration design inputs**, not files that may be copied blindly across incompatible ORMs.

**What remains unfinished:** full original private V1–V10 manuscript capture, human-approved story canon and source identity reconciliation, approved external import/rights, graph data transfer and final XV-compatible schema/SDK. XIV's prior `dev` deployment/CI decisions belong to XIV history; only XV may ratify its own architecture.

## 21A.5 A-L-L-A-H includes operational research and monitoring code, not only conceptual diagrams

The historical `A-L-L-A-H/dev` tree includes **Fastify research workflow routes** (`ResearchRun`, `ResearchApproval`, `ResearchEvidence`, `ResearchWorkflow`, `ResearchJob`), tenant/session permission checks, audits, World Monitor ingestion/scheduling/storage, a `WorldMonitorView` globe/dashboard, and YouTube Sentinel scanning and moderation workflows.

Fixtures/source adapters refer to **USGS earthquake**, **GDACS disaster**, **NOAA geomagnetic/space weather**, and **Open-Meteo weather/air quality** types. This establishes **code and fixture presence**, not today's live feed freshness, correct alert delivery, healthy scheduler or deployed environmental sensor. An XIV/Empire strategic document must not erase these genuine historical engineering candidates.

**Domain opportunities for XV** after explicit review:
- World Monitor / Earth Observatory — provenance-tagged observations with freshness, revision, data attribution, alert history, geo/time scope, and failure states.
- Science Research — historical hypotheses separated from real environmental observations.
- Media / YouTube Sentinel — catalog, references, review queue, actions/retractions **subject to human rights and platform rules**. Labels such as `VERIFIED_SYIRIK` found in historical workflow code are *actor-attributed editorial classifications within a religious lens*, **not** objective machine-proven evidence or acceptable automatic targeting/reporting of people. Retain appeal/retraction and no automated punitive actions.
- Research approval workflow — potential model for a XV native review system, but not a parallel XV authentication stack.

**A-L-L-A-H is not replaced as a historical archive by XV's document; its code may be adapted only after licensed/source-compatible, test-driven review.**

## 21A.6 The original Empire 14-system vocabulary — bounded logical capabilities

A XIV V10.1 companion identifies the following **14 system concepts** that were too easily condensed in v1.0:

| Historical conceptual system | Proper XV mapping if ever approved | Disallowed interpretation |
|---|---|---|
| MoonWitness OS | Umbrella runtime/experience contracts | Supernatural operating system |
| Semantic Engine | UNILEX senses / ontology relations | Truth by similar names |
| FURQAN Evidence Gate | Source/evidence/claim classification | Divine power of judgment |
| MIZAN Review | Bounded evaluation of evidence/quality | Universal religion/salvation score |
| AMANAH Access | Human permissions, mandate, consent | Spiritual mandate generated by software |
| SHURA Deliberation | Consultation, peer review and appeal | Infallible council |
| 100CENTER | Governed operator workspace | Authority over people's lives |
| KITAB Ledger | Verified, versioned knowledge/review ledger | Replacement for sacred scripture |
| SIDRA TREE Graph | Typed relation exploration, evidence graph | Literal unseen metaphysical geography |
| Divine Command Center Hub | Historical creative/organizational label; require disambiguation | Direct access to God |
| Atmosphere OS | Environmental data/research surface | Weather control machine |
| HELIOGRID | Energy/physics research tracker | Completed energy generator |
| ARSY Research Compute | Approved orchestrator for bounded AI/tools | The theological al-'Arsh |
| Material Forge | Materials science research and experiments | Proven quantum/proton manufacturing hardware |

**Do not implement 14 separate services just to satisfy a diagram.** Feature ownership in XV follows data/access contracts and real use cases. `FURQAN`, `KITAB`, `SIDRA TREE`, `AMANAH` and `SHURA` were **material omissions from the earlier master**, and are now explicitly retained as historical logical domains.

### Ten WINGS names preserved from V10.1

The ten fictional/specialist labels named in the historical narrative are: **SKYLINK**, **RAINMAKERS**, **LAST SIGNAL**, **SOFT LANDING**, **QUESTION ZERO**, **DOUBLE CHECK**, **ECHOLOG**, **LEDGER PUNK**, **FIREWALL**, **HAVEN**. These are sourced as a *creative governance taxonomy*, not actual angels, service accounts or granted operator permissions. Verify their current source JSON registry at a pinned version before using them as configuration.

**W01 `SKYLINK` cross-reference (27 October 2026):** the sibling Empire repository's `data/organization/wings10.json` (v1.0.0) defines `W01 | SKYLINK | team: SIGNAL COURIERS | area: Transmission & Knowledge | primaryPillar: TRUTH_GUIDANCE | proposedLeadPersonaSlot: GOD-049`, with `status: PROPOSED_NOT_ASSIGNED`, `unitType: HUMAN_OPERATIONS_WING` and `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`. The name is used as the **software identity** of XV's planned communication surface per [ADR-0006](../../docs/decisions/ADR-0006-skylink-communication-surface.md), not as configuration. The registry entry remains **`PROPOSED_NOT_ASSIGNED`**; using the name assigns no office, grants no authority, converts no fictional persona into an operator, and does not modify the registry.

**W07 `ECHOLOG` cross-reference (27 October 2026):** the sibling Empire registry defines `W07 | ECHOLOG | team: FIELD RECORDERS | area: Observation & Documentation | primaryPillar: TRUTH_GUIDANCE | proposedLeadPersonaSlot: GOD-050`, with `GOD-050 | FIELD WITNESS | dept D02 SIGNAL RUNNERS`, `status: PROPOSED_NOT_ASSIGNED` and `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`. These fields are a source-name reference only, never runtime configuration. The name is used as the **software identity** of XV's planned object-storage surface per [ADR-0007](../../docs/decisions/ADR-0007-echolog-storage.md). It assigns no office, no custody authority over private source material, and does not modify the registry.

## 21A.7 Twenty-five Bidang Amanah — recover a missing architecture family

Earlier design discussions refer to a **25 Bidang Amanah** model linked to actual **prophetic mission patterns**, **Divine Ontology**, **Asma/principles**, and ordinary general-domain responsibilities. The historical conceptual chain:

`QUR'AN / DIVINE ONTOLOGY → ATTRIBUTED DIVINE RELATIONS → AMANAH (WHAT / RESPONSIBILITY) → PROPHETIC MISSION (SOURCE-ATTRIBUTED PATTERN) → AVATAR (PEDAGOGICAL/ROLE MODEL) → AI AGENT (OPTIONAL TOOL EXECUTOR) → SHADOW (CREATIVE/OPERATOR SURFACE) → TASKS`

This is an important architectural distinction absent from earlier XV versions:
- **Asma / source-linked principle** explains a declared *why* within a specific tradition.
- **Amanah** names a human responsibility, not supernatural power.
- **Prophetic mission** is a *source-attributed* historical/religious teaching pattern, not one invented exclusive mandate per prophet.
- **Avatar** is a teaching metaphor, never the actual prophet.
- **Agent** is a replaceable, bounded software tool, not holy authority.
- **Shadow** here is a workflow/presentation layer, not the historical fictional character.
- **Task** is a human-authorized engineering/operational action.

The exact final list of all 25 fields, associated Qur'an references, and a previously mentioned `cosmic` Asma-engine design **were not retrieved as verified repository files during this audit**. Therefore record the 25-field model as a **high-priority archival and source-recovery item**, **do not manufacture 25 names** or claim the model is integrated in XV.

**Research to-do:** locate authorized original source(s), compare against Empire WINGS10/G.O.D.99/Prime Code and XII mission registries, build a qualified source table, mark every unsupported role `NEEDS_SOURCE`, and obtain editorial review before taking any of the 25 into production domain vocabulary.

## 21A.8 The 33 World Patches — full status-preserving registry, not just a numeric slogan

The XII source explicitly records **8 chat reports + 5 recovered drafts + 1 numbering conflict + 18 editorial proposals + 1 submission recorded in chat**, with **zero independently verified divine approvals**.

| Slot | Title (historical editorial label) | Nature / status |
|---|---|---|
| 001 | AEGIS PROTECTION | reported in chat |
| 002 | NEVERMORE | reported in chat |
| 003 | DIPINGIT MODE ON | reported in chat |
| 004 | PINK NOISE | reported in chat |
| 005 | WINDWALKER | reported in chat |
| 006 | PATCH QIBLAT UTARA | reported in chat |
| 007 | MAROON 5 | reported in chat |
| 008 | FUTURE IS NOW | reported in chat |
| 009 | WE ARE SAVAGES | recovered draft |
| 010 | HAVE A NICE DAY | recovered draft |
| 011 | KARMA — THE BUG IS ME | recovered draft |
| 012 | THE PRIME DIRECTIVE | recovered draft |
| 013 | SAFE FROM DAY ONE | recovered draft |
| 014 | FAMILY WITHOUT FEAR **vs** THE WRONG WAY / HELLROAD | **unresolved numbering conflict** |
| 015 | FAIR WORK, FAIR LIFE | editorial proposal |
| 016 | BREAK THE DEBT LOOP | editorial proposal |
| 017 | THE SECOND CHANCE | editorial proposal |
| 018 | JUSTICE FOR EVERYONE | editorial proposal |
| 019 | THE HONEST WITNESS | editorial proposal |
| 020 | NO ONE DIES ALONE | editorial proposal |
| 021 | THE MERCY NETWORK | editorial proposal |
| 022 | CLEAN WATER FOR ALL | editorial proposal |
| 023 | NO ONE GOES HUNGRY | editorial proposal |
| 024 | HEALTH WITHOUT BARRIERS | editorial proposal |
| 025 | LEARN FOR LIFE | editorial proposal |
| 026 | NO ONE LEFT BEHIND | editorial proposal |
| 027 | CRISIS READY | editorial proposal |
| 028 | EARTH STEWARDSHIP | editorial proposal |
| 029 | SAFE DIGITAL WORLD | editorial proposal |
| 030 | FAIR GOVERNANCE | editorial proposal |
| 031 | PEACE BUILDER | editorial proposal |
| 032 | A SAFE PLACE TO LIVE | editorial proposal |
| 033 | KOPIHITAM - SIACENG / FAITH TO ACTION | **user-submitted-in-chat** only |

Unnumbered historical records: **WILD YOUTH / MWX-SYF-00752**, **RIBA — NOT APPROVED**, displaced concept **THE FINAL AUDIT**. Never silently reassign slot 014 or 033. Source: `moonwitness-xii-season-global-championships/docs/MASTER_BUG_PATCH_33_V2.md` pinned to XII snapshot.

The #033 theme includes worship, learning, family/humanity, environment and accountable technology; thematic source references do **not** show that a scripture instructs creation of a specific app. Future operational work inspired by a World Patch requires a **normal accountable human project and measurable deliverable**, not a "divine patch completed" record.

## 21A.9 Complete archival recovery risk: we still do not possess all originals

The previous 99-chapter index remains useful, **but a count of editorial chapters is not the number of verified original chapters**. Concrete recovered gaps from XIV's `RECOVERY_GAPS_V10.md`:

- Full private V1–V10 originals and user-authorized immutable versions have **not been imported**. V10.1 is a public-safe expansion, not verbatim original.
- `00-MAIN GOD PROMISE` and `GOD PROMISE: THE ROCKSOUL` original lines, and the academic 1·6·3 draft require independent identity and revision review.
- **THE BATTERIES four-book narrative structure** and exact NPD page/scene/media order remain incompletely recovered. NPD 24:27, 24:37 and 25:50 are different works.
- XII's **15 story archive synopsis entries** and **63 editorially reconstructed pages** are **not** 15 guaranteed original transcripts or 63 authenticated image originals.
- Kingslayer's reported **five poster source descriptors** are not equivalent to five cleared original binary images.
- World Patch #014 numbering dispute remains open.
- THE SHADOW, A LAH / 4-LAH, DOGS FROM UNIVERSE, BLUE WITCH, WALTER aliases and generations require typed candidate identity review.
- **ZILL Shadow-optics** and **ZILL Tasawuf** are separate origins; user-preferred spelling **ZILL** does not overwrite historical source bytes.
- MYLUFT, MA'LŪF, HONEY, QUEEN R, Al-Wadūd have lexical, devotional and character distinctions.
- Tick-Tock's **occurred vs recorded vs replacement** times and MOONRIDLEY **morning storytelling vs nocturnal referenced lyric** should remain separate.
- **GOD-PROMISE MAIN, MOONDANCE, Mercy × 3, AL-HAKIM and Signal Collection** include missing primary work that must be located before any original-copy publication.
- **MAHSYAR COVENANT, AD-DEEN, Astronomy Festival, Ghost in Machine, KADO** and alternate endings need primary-source checks.
- Early ZENIX/2023–2025 origins remain historical leads without comprehensive signed-off source timelines.

This means **"Master Vision Narrative final" describes the decisions and bounded universe coverage**, **not** a certification that all primary artifacts are recovered. That distinction protects historical accuracy.

## 21A.10 Real Rocksoul cross-domain case: Jerusalem, 70 CE

The historical Corpus/Rocksoul federation documents a shared example around **Mark 13:2** and the destruction of the Second Temple in Jerusalem (70 CE):

- **TEXT / RGBL** owns exact Mark passage and its specific edition ID(s).
- **STORY / MFTL** records temple-destruction prediction narratives.
- **EVENT / LEGEND** investigates the historical destruction, evidence and alternative reconstructions.
- **PERSON / SUPERHERO** tracks witness/recorder Flavius Josephus and transmission.
- **LAW / AWS** may analyze jurisdiction/applicability only for an independently defined legal research question.
- **PERSPECTIVE / CORRELATION** links or compares **reviewed, attributed** relations without asserting prophecy validation as an automated universal verdict.

The case is important because it demonstrates **why five or six independent data domains are useful**. One text and one historical event must never be silently fused; an event chronology does not mechanically prove miracle fulfillment. This should be an **XV interoperability demonstration**, after QS 2:82 and story provenance pilots, not an imported universal truth claim.

## 21A.11 XVIII sources, rights and ontology: a more precise review model

Retain **five historically described canon-evidence classes**: `primary original`, `repository lore`, `derivative media`, `editorial synthesis`, `unresolved/conflicted`. Additionally distinguish status axes:

| Axis | Sample legal value | What it means |
|---|---|---|
| **Recordedness** | `ORIGINAL_OBSERVED`, `RECONSTRUCTED`, `SOURCE_MISSING` | Material lineage only |
| **Epistemic nature** | `TEXT`, `HISTORICAL_EVIDENCE`, `ATTRIBUTED_BELIEF`, `RESEARCH_INTERPRETATION`, `USER_TESTIMONY`, `CREATIVE_FICTION` | What kind of claim |
| **Method confidence** | `SUPPORTED`, `PARTIAL`, `PENDING`, `UNKNOWN`, `UNSUPPORTED`, `DISPUTED` | Method-bound evidence support |
| **Corpus classification** | `DIRECT_CORE`, `CORE_RELATED`, `COMPARATIVE`, `UNMAPPED`, `REQUIRES_RESEARCH`, `DISPUTED`, `INSUFFICIENT_EVIDENCE` | Project lens classification, **not** religion pass/fail |
| **Review** | `DRAFT`, `REVIEWED_WITHIN_SCOPE`, `REJECTED`, `RETRACTED` | Human editorial action |
| **Rights** | `UNVERIFIED`, `METADATA_ONLY`, `CLEARED_EXACT_VERSION` | Permission for a specific use |
| **Publication** | `PRIVATE`, `RESTRICTED`, `PUBLIC`, `WITHDRAWN` | Visibility/consent decision |
| **Engineering** | `DESIGNED`, `CODED`, `TESTED_AT_SHA`, `BROWSER_VERIFIED`, `DEPLOYED`, `RELEASE_APPROVED` | Actual capability/readiness |

**Never use a single numeric `confidence` to replace those axes.** A claim can be high method-quality but unlicensed; a source can be directly quoted but disputed; an authentic personal account can be real testimony without independently proving supernatural causation; passing unit tests does not pass a human-review gate.

The original GOD-PROMISE paper replaces crude `PASSED/NOT PASSED` labeling with the nuanced corpus classification above. `NOT PASSED` must not be an automatic label of a supposedly false religion or damned person.

## 21A.12 Why XV MoonQL is promising — and what code inspection actually found

Unlike the historical XIV runtime, XV `apps/radio/src/app.ts` actually boots **MoonQL once**, then installs plugins, generated REST, channels and handwritten modules. The loader discovers route modules by folder and checks reserved path collisions. Existing code exposes Swagger/OpenAPI and service inventory.

`packages/moonql/src/model.ts` includes field declarations, indices, unique constraints, optional row-level ACL predicates, seed/diff-sync reference data, deletion policies and UI menu metadata. **It is a genuine candidate foundation for metadata-driven knowledge modules**.

**Security warning from inspected code:** the model contract explicitly states that missing ACL rules default to `public` (while some code/config can enforce policies at boot). Therefore **never enable auto-REST for witness testimony, reviewer identity, consent, private case notes, source-rights ledger, AI prompts or research approval without explicit deny-by-default authorization verified by tests**. Review row-level scoping and inherited access, data visibility of generated views, read/REST vs direct custom handlers, and migration against existing seeded radio data.

 XV currently has:
- `apps/radio` (backend and ORM hub);
- `apps/dock` (public Radio/catalog/site);
- `apps/headquarters` (admin/model-data board);
- `packages/moonql`, `moonql-client`, `moonui`;
- base/auth/apikeys/ops/settings/stations/schedule/playlog;
- messaging/channel, DENPA;
- Postgres/Compose backup definitions and restore runbook.

**No live Corpus, Key Witness, SRGBL, 25 Amanah, 10 Wings or 100CENTER integration was found in the observed XV tree. ARSY is the accepted **name** of the existing API Hub, not evidence that future ARSY research-compute features are implemented.** Do not advertise them as shipped. XV has a backup/restore runbook but the runbook's drill ledger explicitly records **no performed restore test** at that snapshot.

Recommended architecture approach: protect existing stations/API clients, add one constrained read-only study module at a time, verify permission and source rights, implement per-domain owner contracts, and keep radio operational throughout. **No ORM rewrite, no new identity provider, and no new DB by default**.

## 21A.13 Site taxonomy: the product should not become a wall of random menus

**One search, several views, one permission model.** Proposed consumer information architecture:

| Category | User experience | Canonical data owner / primary lens |
|---|---|---|
| **DISCOVER** | Home, Search, Topics, Featured Cases, Guide, Constellation | Index/projection only |
| **READ** | Corpus Reader, Works, Editions, Passages, Context, Citations | TEXT / Corpus |
| **EXPLORE** | Lexicon, Ontology, Figure Registry, Prophetic Table, Timelines, Maps | Concepts, People, Events / typed graph |
| **RESEARCH** | Cross-text comparison, Key Witness, SRGBL, Swing, MIZAN, Evidence Trail | Research/assessments (derived, reviewable) |
| **WITNESS** | Observations, Testimony, Events, Messages, Fault Lines, Past Presence | Consent-aware story/witness domain |
| **STORIES** | Four lenses, eight eras, Crew, Episodes, Character Atlas, Posters/Comics | Creative/world-specific canon |
| **SIGNAL** | Radio stations, schedule, DENPA, music/media source references | **Existing XV product domain** |
| **LINK / MESSAGES** | Multi-provider inbox (WhatsApp, Telegram; later Discord, Instagram, Messenger, X), pairing, transmit/receive, channel status | **D18 owned by SKYLINK**; ARSY and other apps consume it as clients |
| **STORE / ATTACHMENTS** | Object storage and attachments: verified upload, digest, retention, legal hold, presigned download | **D19 owned by ECHOLOG**; stateless (no tables); consumers store `{object_key,digest,size,content_type}` only |
| **WORLD** | World Monitor, Earth/Cosmos, MTS/Time, scientific simulations | Source-grounded monitoring/research, later |
| **JOURNEY** | Voluntary reflections, Mission, Path, World Patches, AETHERION game | Journey/workflow vs fiction separated |
| **ABOUT** | Vision, source policy, method, data rights, project history, how to cite | Published governance |

**Headquarters operator areas:** Source/Edition Steward, Rights/Consent, Ontology/Identity Review, Research Assessor, Witness Editor, SHADOW Studio, 100CENTER Governance, publication/retraction, audit/backups, radio ops, AI candidate inbox and cross-repo migration ledger.

Avoid standalone tables that create parallel sources: **Prophetic Table is a view/filter on Figure Registry**; terms table and lexicon share a model; Reader and Explorer consume one corpus identity; graph is a visualization of reviewed relations, not a second truth engine; AI assistant is a workflow participant, not a hidden editor.

## 21A.14 Seven complete user journeys — turn the vision into a testable product

| Journey | Entry point | Source-backed success | Honest fallback |
|---|---|---|---|
| **J01 Verse search** | QS 2:82 | Exact source/edition + rights + meaning/frame + citation | `UNKNOWN`, metadata-only; no fake ayah |
| **J02 Prophetic mission** | A prophet or community | Source-specific figures, roles, mission patterns, alternative views | No reduction to one universal mission |
| **J03 Divine-name comparison** | Elohim / YHWH / ALLAH | Original languages, senses, usage, tradition labels, relation evidence | No forced `sameAs` |
| **J04 Historical cross-domain** | Mark 13:2 / Jerusalem 70 CE | Separately cited TEXT, EVENT, PERSON and contextual interpretation | Disagreement/uncertainty visible |
| **J05 Creative archive** | THE BATTERIES episode | Original revision + characters + art/media manifest + rights; stable sequence | Metadata-only; don't fabricate four missing books |
| **J06 Personal witness** | Tick-tock on the Clock | Source privacy, times of occurrence/recording, amendments, approved derivative | Private-only; no claims of supernatural cause |
| **J07 Earth/Signal** | Radio station or weather/disaster observation | Operational radio capability or sourced timestamped monitoring, clearly differentiated | No inferred live sensor/feed if stale or unsupported |

**Future J08** (not an initial acceptance dependency): voluntary Path/Mission or AETHERION experience with human governance and no spiritual scoring.

For each journey the UI, API, model, data owner, positive case, not-found case, unauthorized case, citation/rights case and browser test must be explicitly named in later XV technical tickets.

## 21A.15 Missing capability map: technology, philosophy and human outcome

A persistent source of incompleteness is confusing **what the user ultimately wants** with **what a package currently provides**.

| Pillar | Long-term human outcome | Current historical evidence | Required XV migration/implementation |
|---|---|---|---|
| Witness & Memory | Preserve human narratives with corrections | II content graph, XII archive, XIV witness/story-workbench code | Consented import, versioning, dedicated ACL and story UI |
| Scripture & Comparative Knowledge | Read and compare actual sources | Corpus multi-tradition datasets/ingestion and reader preview | Rights/license audit, validated source adapters and XV API |
| Terminology & Identity | Distinguish sense, name, actor, role | Empire UNILEX; XIV ontology; Rocksoul PERSON | XV vocabulary/identity decision contracts |
| Research & MIZAN | Explain claims and alternatives | SRGBL/Key Witness contracts, XIV/A-L-L-A-H research routes | Human editorial pilot and versioned analysis projection |
| Art & Pop Culture | Tell complex ideas in creative media | II/XII storyboard, Rocksoul Assets, Moonframe | Media provenance, lyric/art licensing, editor/release workflow |
| World & Cosmos | Connect external environmental observations to research | A-L-L-A-H adapters/fixtures, MTS, HELIOGRID proposals | Source integration pilot; no hardware/online claims without tests |
| Human Journey & Action | Translate learning into voluntary useful action | Empire Prime Code/Paths/33 patch narrative | Scope/consent/governance and measurable impact tests |
| AI & Operator Experience | Efficient, auditable research and coding | XV MoonQL/Headquarters; Crayon; historical AI tooling | Reviewable candidate inbox, permissions, tests, deployment discipline |

### What is still irreducibly unknown?

Actual private earliest original texts; full authorship chain for character alias variations; exact final 25 Amanah mapping; whether dormant/historical code still runs against current dependencies; exact public deployment readiness; every source's license; current reviewer authorization; full reproduced Corpus/SRGBL tests inside XV; and whether all source-derived screens meet accessibility standards. Those must remain **open evidence tasks**, not filled in through literary improvisation.

## 21A.16 XV architectural and editorial decisions proposed for owner review

**Ratified for this document by the user's instruction:** one active target repository = XV; no new branch; preserve current XV running features; historical repos remain provenance references; review before import.

**Not ratified by merely writing this file:** new schema/ORM, complete canon decisions, automated cross-repo sync, source rights, public release, private record import, AI autonomy expansion, unprotected writes, creation of 25 agents or 99 system accounts.

A future **XV-local ADR** should decide:
- canonical structured record ownership per object type and derived projections;
- exact MoonQL addon boundary, auth model, data/tenant privacy;
- local in XV vs referenced immutable source artifacts and legal permissions;
- cross-repo import policy with source SHA and checksums;
- review/consent/withdrawal transactions and public publication manifest;
- staged route/navigation naming (preserve current `/stations` and admin models);
- CI, backup/restore, crash recovery, source-accuracy tests;
- release policy with **no unnecessary branches** or premature `main` promotion.

## 21A.17 Remaining gaps prioritized: a real completion ledger

| Priority | Deficit | Why the previous master was insufficient | Evidence required to close |
|---|---|---|---|
| **P0** | No full SHA-specific archival source map | Descriptive links alone lose provenance | Public version-pinned source list; private originals authorized separately |
| **P0** | XIV V10.1 and progress ledger omitted | 99 headings without the underlying 16-section narrative depth | Crosswalk row per researched family, draft vs primary classification |
| **P0** | Corpus dataset breadth underrepresented | Seemed like only four scriptural families | Data/rights/coverage matrix, source and dataset completeness |
| **P0** | XV ACL defaults need scrutiny | Generic CRUD may expose restricted data | Sensitive-model fail-closed tests/explicit policies |
| **P0** | XV radio-first transition unclear | Encourages rewrite rather than extend | XV code mapping and regression tests for existing radio |
| **P0** | 33 slot titles/statuses omitted | Numeral mistaken for 33 completed miracles | Full XII registry retained and source-specific statuses |
| **P1** | 25 Bidang Amanah absent | Large conceptual agent/mission family lost | Authorized source retrieval and 25-row reviewed matrix |
| **P1** | A-L-L-A-H World Monitor actual code missed | Research capability incorrectly labeled wholly conceptual | Technical import audit, smoke data, source freshness, consent |
| **P1** | 14 Empire logical systems underspecified | Labels omitted: FURQAN, KITAB, SIDRA TREE, AMANAH, SHURA | XV ownership/feature mapping with no 14-service explosion |
| **P1** | Missing originals of four-book BATTERIES/NPD | Creative archiving was only at title level | Media/scripts revision match + rights |
| **P1** | 13-function Story/Witness product diluted | MOONWITNESS II foundation lost | Two end-to-end witness/story journeys |
| **P1** | Real PERSON/EVENT/TEXT/LAW proof not exemplified | Federation looked abstract | Jerusalem case and tested typed cross-domain references |
| **P1** | God-Promise passage/lens and classification model | Unattributed framework could look like universal proof | Source-level citations, class and perspective-specific review |
| **P2** | Cosmos/HELIOGRID/MTS readiness ambiguity | Speculative proposals looked like deployed tech | Experiment plans, measurements, licensing and independent verification |
| **P2** | Visual asset and interactive mockup coverage | Design mode could become an afterthought | Assets/manifests and 15-skin UI accessibility compatibility audit |
| **P2** | Early 2023/2024 origins and legacy engineering timeline | Broad narrative lacked source originals | Historical commit/repository mapping; mark remaining UNKNOWN |

**Finish condition for this audit:** The document's *scope inventory and epistemic boundaries* are now explicit. **Finishing the archive or software implementation** requires actual original source, rights, technical tests and human ratification. No change to these principles should be inferred from the word "final".

# 22 — Critical contradictions, gaps and decisions for XV

| Conflict / ambiguity | Observed situation | XV final narrative policy |
|---|---|---|
| XI/XIV formerly "sole canonical" | Accepted XIV ADR/handoff predates user selecting XV | **XV is new forward-looking master**; retain older decision historically, no edits to old repo |
| XV mono-repo is currently radio-centric | No Corpus/Story/SRGBL packages in observed XV tree | **Do not claim these are shipped**; expand additively and preserve radio |
| XIV ORM vs XV MoonQL vs A-L-L-A-H Batteries | Different technical models and APIs | Audit schema/SDK compatibility before any reuse or migration |
| Corpus canonical `mw:*` IDs vs future XV IDs | Corpus has historical exact source semantics | Preserve foreign IDs; design XV owner/crosswalk; don't mint/fork IDs casually |
| Five-domain vs six-domain Rocksoul research | Federation evolved to include perspective plus correlation | Version the topology; don't collapse concepts |
| Four revelation identities vs four textual families | Different theological/textual layers | Both models coexist with explicit relationship scopes |
| 8 eras vs AGE CODE four phases vs AETHERION | Different narrative/time/game constructs | Separate native IDs and units |
| Four Pillars of Soul vs Empire four pillars | Similar count, different subject | Keep distinct |
| 99 names vs GOD99 vs 99 human states/chapters | Numerically similar but conceptually unrelated | No automatic merge |
| THE BATTERIES ≈ ALLAH in satirical alias | Fiction can use religious wordplay | Never identity equivalence or impersonation |
| ZILL vs ZIIL | Historical spellings and distinct ZILL contexts | User-preferred ZILL for relevant later canon, source original preserved |
| AI summaries vs primary manuscripts | Private narrative V10 and original media not all in public GitHub | Do not publish private or regenerate as "original" |
| GitHub green checks vs reviewed research | Some technical guards pass without real annotation/rights | Distinct readiness gates |
| Empire physical science research | Future speculative capability | No claim of hardware, cosmic control or verified discovery |
| Multiple old dashboards | Overlapping Admin/Crayon/100CENTER/SHADOW | XV Headquarters is integration host; modules retain bounded roles |
| Radio/media vs religious research | Current XV radio is real, research is a future expansion | Radio becomes first operational domain, not unwanted leftover |
| One repo vs distributed historical data | Many source repos retain their own canonical past | **Only new work in XV; historical repos read-only sources**, imports only after authorization |

---

# 23 — Implementation sequencing: XV only

**This document is the charter. It is not permission to ship an unreviewed feature or modify unrelated files.**

| Gate | Work to perform **in XV** | Evidence/DoD |
|---|---|---|
| **P0 — Baseline & preservation** | Record exact HEAD, actual 3 apps/packages, health, tests, secrets/rights, backup/restore; copy no foreign data | Read-only inventory, build/test result, known defects, non-destructive baseline |
| **P1 — Source crosswalk** | Registry of prior repo documents, SHA, file path, source type, privacy, rights, missing originals | Every imported proposal is traceable; UNKNOWN valid |
| **P2 — Vision → experience contract** | Agree target persona, two frontends, research vs story lanes, existing Radio product | Screen/flow map, acceptance tests; design not confused with implementation |
| **P3 — Canonical domain decision** | Audit MoonQL model/addon/permissions; choose bounded object contracts and ownership | XV-local reviewed ADR; no parallel DB without accepted reason |
| **P4 — Corpus pilot** | Edition catalog, source selectors, rights gating, read-only passage lookup, citation | Reproducible QS 2:82 journey using **actual** permitted source material |
| **P5 — Lexicon & ontology pilot** | Names, figures, relations, language/sense, alias review; Prophetic Mission Table | `distinctFrom` tests; no false equivalence |
| **P6 — Research pilot** | S1–L5, Key Witness, MIZAN, attributed interpretations and reviewer pipeline | Real human paired annotations, provenance, UNKNOWN/fail-closed, rights |
| **P7 — Creative/witness pilot** | Story/characters/episode graph, original/adaptation chain, SHADOW workbench | Private Tick-Tock original handled with consent; public derivative only if approved |
| **P8 — Headquarters/100CENTER** | Human approval workflows, task/mission ledger, audit and publication gates | Denied unauthorized writes, role matrix, reproducible decisions |
| **P9 — AI & interoperability** | Local, opt-in, bounded research assistant and migration adapters | No remote fallback, source-grounded drafts, candidates never auto-publish |
| **P10 — Expansion** | Other research domains, Cosmos/Journey/AETHERION/Empire modules if warranted | Separate evidence, cost, risk, scientific/rights review |
| **P11 — Release** | Backup/restore drill, end-to-end accessibility, security, performance, exact-SHA tests | Explicit release decision; no CI-green shortcut |

**Suggested first two vertical slices:**
- **Research:** Query QS 2:82 → exact source/edition → licensed text/metadata → context → Key Witness → SRGBL → reviewed citation.
- **Creative:** Authorized Story/Event → Character/Episode → Scene/Poster → Editorial version → rights/consent → reviewed publication.

Each slice should execute through XV's existing API and frontend patterns while leaving the radio/stations use cases intact.

**Small AI-local tasks:** Require one owner module/file scope, prerequisites, tests, explicit non-goals, clear acceptance checklist, evidence and DoD. **Do not automatically generate duplicate GitHub issues or create new branches.** The owner expressly requested one XV home.

---

# 24 — What "final" actually means

This file **finalizes the product identity, north star, narrative domains, preserved archival coverage, data integrity rules, source hierarchy and repository home**. It does **not** declare:

- all original ChatGPT/account transcripts inspected;
- private diary/voice/artwork publicly consented;
- every named scripture translation licensed;
- all 99 original chapter manuscripts reconstructed;
- all historical timelines or aliases settled;
- all prior repositories and all commits exhaustively audited;
- MoonQL capable of every proposed ontology/research workflow;
- all story, research, science, agency and journey features already implemented;
- religious truth or miracle claims externally verified;
- production deployment, CI or backup restore success.

## 24.1 Final acceptance checklist for this document

- [x] **New single active destination** = XV, not XIV/XI; no new branch required.
- [x] Existing XV three-app/radio/MoonQL baseline recognized and protected.
- [x] Empire of the Light, A-L-L-A-H, ALLAH, MOONWITNESS, ROCKSOUL clarified.
- [x] MOONWITNESS II original story cycle, eight-era family and AGE CODE kept distinct.
- [x] GOD-PROMISE 1·6·3; revelation identity vs manuscript/edition/tradition separated.
- [x] Four textual families, wider traditions, UNILEX, prophets, ZILL included.
- [x] Corpus, ontology, key witness, SRGBL, SWING, MIZAN and Rocksoul domain federation included.
- [x] SHADOW, 100CENTER, ARSY, G.O.D.99, WINGS10, Prime Code, Four Pillars included.
- [x] 33 patches, 99 human states, age timeline, AETHERION, 100 levels distinct.
- [x] Character/creative families and **all 99 V10 editorial chapter titles** indexed.
- [x] Earth/Atmosphere/Cosmos/HELIOGRID/M-TIME/Material Forge retained as research horizons.
- [x] Rightsholder, privacy, provenance, human-review and AI limits defined.
- [x] Source atlas links provided and technical incompatibilities acknowledged.
- [x] XV-only progressive execution gates specified.
- [ ] **Every private original** and source-version digest collected and authorized (**not in scope for public narrative**).
- [ ] Explicit XV technical ADR and domain schema approved (**not in scope for vision**).
- [ ] Full runnable tests/feature audits and public production release (**not established by this document**).

---

# 25 — Primary research/source register

**Directly reviewed for this synthesis** (repo README, relevant docs and/or tree, not every file/commit):

1. [XV README](https://github.com/bjo163/moonwitnessxv/blob/main/README.md), [XV package scripts](https://github.com/bjo163/moonwitnessxv/blob/main/package.json), [XV backup runbook](https://github.com/bjo163/moonwitnessxv/blob/main/docs/runbook-restore.md).
2. [XIV Master Narrative V10](https://github.com/bjo163/moonwitness-xiv/blob/dev/docs/knowledge/narratives/MASTER_NARRATIVE_V10_PUBLIC_DRAFT.md), [XIV ADR 0004](https://github.com/bjo163/moonwitness-xiv/blob/dev/docs/decisions/0004-knowledge-rebuild-centralization.md), [XIV ownership](https://github.com/bjo163/moonwitness-xiv/blob/dev/docs/architecture/knowledge-domain-ownership.md).
3. [Corpus README](https://github.com/bjo163/moonwitness-corpus/blob/dev/README.md), [Product Walkthrough](https://github.com/bjo163/moonwitness-corpus/blob/dev/docs/MOONWITNESS-EXPLAINED-WALKTHROUGH.md), [SRGBL Implementation Status](https://github.com/bjo163/moonwitness-corpus/blob/dev/docs/SRGBL-V8-IMPLEMENTATION-STATUS.md), [Rocksoul interoperability](https://github.com/bjo163/moonwitness-corpus/blob/dev/docs/ROCKSOUL_INTEROP.md).
4. [Empire of the Light README](https://github.com/bjo163/empire-of-the-light/blob/main/README.md), [Master Blueprint](https://github.com/bjo163/empire-of-the-light/blob/main/docs/MASTER_BLUEPRINT.md), [Prime Code](https://github.com/bjo163/empire-of-the-light/blob/main/docs/THE_PRIME_CODE.md), [UNILEX](https://github.com/bjo163/empire-of-the-light/blob/main/docs/UNILEX_SPEC.md), [AGE Story](https://github.com/bjo163/empire-of-the-light/blob/main/docs/AGE_STORY_CORRELATION.md).
5. [A-L-L-A-H README](https://github.com/bjo163/A-L-L-A-H/blob/dev/README.md); [MOONWITNESS II README](https://github.com/bjo163/moonwitness-II/blob/main/README.md) and [platform blueprint](https://github.com/bjo163/moonwitness-II/blob/main/docs/PLATFORM_BLUEPRINT.md); [XII readme](https://github.com/bjo163/moonwitness-xii-season-global-championships/blob/main/README.md).
6. ROCKSOUL [`mftl`](https://github.com/bjo163/rocksoul-mftl), [`legend`](https://github.com/bjo163/rocksoul-legend), [`superhero`](https://github.com/bjo163/rocksoul-superhero), [`aws`](https://github.com/bjo163/rocksoul-aws), [`correlation`](https://github.com/bjo163/rocksoul-correlation), [`crayon`](https://github.com/bjo163/rocksoul-crayon), [`platform`](https://github.com/bjo163/rocksoul-platform), [`assets`](https://github.com/bjo163/rocksoul-assets), [`world`](https://github.com/bjo163/rocksoul), and [Moonframe](https://github.com/bjo163/moonframe).
7. Prior private research handoff **GOD-PROMISE MOONWITNESS — Monocentric 1·6·3** and **MOONWITNESS XIV Master Narrative V10 to Blueprint Handoff** read in conversation context; **their original private bytes are not copied here**.

**Evidence standard for next revision:** freeze a source-crosswalk row per included asset or research claim with canonical repo path, version SHA, author, date kind, source span, rights/visibility, confidence scope and unresolved conflicts. This public vision currently cites *locations*, not immutable line-level evidence for every individual story.

---

# EPILOGUE — ONE UNIVERSE, MANY WITNESSES

> **THE MOON DOES NOT HAVE TO ANSWER EVERYTHING.**  
> **IT CAN HELP US SEE WHAT WE HAVE YET TO UNDERSTAND.**

Different people look at one sky through different histories, languages, traditions, experiences and hopes. A document can be preserved without being endorsed. A story can move hearts without being historical proof. A question can remain unresolved without being erased. Research may propose a correction without appropriating another community's convictions. Human creativity can be playful while remaining accountable.

**MOONWITNESS XV** is the home in which these disciplines are intended to meet:

- **Corpus** preserves the exact text.
- **Ontology / UNILEX** preserves sense, identity and distinction.
- **History / Person / Story** preserve context, transmission and testimony.
- **Research / MIZAN / SRGBL** examine evidence, alternatives and limits.
- **ROCKSOUL** preserves a broad creative, research and engineering lineage.
- **SHADOW** helps create and curate stories.
- **100CENTER / ARSY** aspire to coordinate accountable work.
- **A-L-L-A-H / Empire of the Light** provide the overarching human-centered project vision.
- **XV's existing radio/signal infrastructure** remains a working part of the platform's beginning, not something to pretend never existed.

The system should help humans **observe, preserve, understand, correlate, research, create, share, reflect and act**. It must not replace human conscience, scientific method, qualified scholarship or divine judgment.

**ONE ACTIVE REPOSITORY FORWARD: `bjo163/moonwitnessxv`.**  
**ONE UNIVERSE OF DISCOVERY; DIFFERENT EVIDENCE LANES; HONEST STATUS ALWAYS.**

*End of Master Vision Narrative XV, deep-source audited edition v1.1 — 26 October 2026.*
