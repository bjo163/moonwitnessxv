# M16-01 — Private Witness Object and Provenance Categories (Specification)

- **Milestone**: M16 — Private witness archive and consent lifecycle
- **Task**: M16-01
- **Status**: SPECIFICATION DRAFTED at `76ecdc5` — awaiting integrator review; the integrator, not this document, ratifies and checks the TODO leaf
- **Domain**: **D06 Witness** (see §1.1 — the TODO row's `D3` is the difficulty column, not a domain ID)
- **Reference**: [ADR-0002](ADR-0002-additive-moonql-domains.md), [ADR-0003 §1–2](ADR-0003-source-rights-and-consent.md), [ADR-0006](ADR-0006-skylink-communication-surface.md), [ADR-0007](ADR-0007-echolog-storage.md), [M02-02 D06 row](M02-02-domain-assignments.md), [M02-05](M02-05-stable-ids-and-legacy-refs.md), [M03-02 template](../audit/M03-02-deny-by-default-template.md), [M03-04](M03-04-tenant-role-boundaries.md), [M03-06](M03-06-witness-withdrawal-policy.md), [M06-07 crosswalk](../audit/M06-07-source-crosswalk-queue.md), [BLUEPRINT.md §4 §6 §8](../../BLUEPRINT.md), [SECURITY.md](../architecture/SECURITY.md), [TODO](../../TODO.md)

---

## 0. Scope, deliverable and explicit non-scope

**Delivered here (specification only — no code, no schema, no migration):**

1. The canonical shape of the **private witness object** (`witness_testimony`) in domain D06: identity, owner scope, date slots, provenance class, rights/consent references and media references.
2. The **default-private posture** and the hard rule that **no automatic public original exists**.
3. The **provenance-category enum** for witness material plus its invariants (the vocabulary only; projection and rendering are M16-07).
4. The **plugs** where consent and ACL gating (M03-02, M16-04) attach, declared as contracts, not implemented.
5. The **NEEDS_MIGRATION / NEEDS_ADR register** for anything this shape would eventually require.

**Explicitly NOT delivered here** (owned by sibling leaves — do not read this spec as doing their work):

| Deferred to | Owned by |
|---|---|
| Date-slot *semantics*, precision, timezone and Tick-Tock corrected chronology | **M16-02** |
| Original immutability, append-only correction lineage, byte overwrite rules | **M16-03** |
| Consent/ACL enforcement, anonymous-access and media-link tests | **M16-04** |
| Redacted derivative preview and the human publishing request | **M16-05** |
| Withdrawal, retention, search/export purge | **M16-06** |
| Rendering the testimony/empirical/fiction label in every projection | **M16-07** |
| Any table, addon package, migration, route or UI component | this task creates none |

---

## 1. Domain placement

### 1.1 D06, not D07

[BLUEPRINT.md §4](../../BLUEPRINT.md) line "D06 | Witness | Private observation, consent, original testimony, dated corrections | Public archive only approved derivative" and [M02-02](M02-02-domain-assignments.md) row D06 (`@moonwitness/witness`, *Planned G3*, canonical entities `testimonies`, `consent_records`, `faultlines`, `corrections`) place this object in **D06 Witness**.

**D07 is Story & Media** (worlds, arcs, characters, episodes, scenes, `media_manifests`) — it owns fiction, not testimony. [M06-07 §1](../audit/M06-07-source-crosswalk-queue.md) confirms that mapping in practice (V10 narrative and Rocksoul MFTL → `D07 Story & Media`, classified `INTERPRETATION / FICTION` in [M06-02](M06-02-xiv-v10-crosswalk.md)). Any D06 object placed in D07 would silently reclassify lived testimony as fiction; this spec forbids that.

### 1.2 Canonical-owner rule

The witness record is owned by exactly one domain (D06). Search indexes, Dock/HQ read models, exports, graphs and RAG retrieval are **derived read-only projections** and never a second source of truth — [BLUEPRINT.md §4](../../BLUEPRINT.md) *"A record is stored under one canonical owner"*, [M02-02 §1](M02-02-domain-assignments.md).

### 1.3 Ontological distinctness (carried in from BLUEPRINT §5)

`Event ≠ Story ≠ Testimony ≠ ExternalVerification` and `UserReported ≠ RevealedMessage`. A witness record therefore never asserts that what was witnessed is an empirical fact, a scripture claim, or a divine confirmation; it asserts only that a specific principal reported a specific experience at a specific time.

---

## 2. The private witness object

Logical contract only. Field names are the vocabulary the future `@moonwitness/witness` addon must express; they are **not** a committed schema (see §7).

### 2.1 Identity

| Slot | Contract |
|---|---|
| `stableId` | `wt_<ulid-or-nanoid>` — prefix already assigned to *Witness Testimonies (D06)* by [M02-05 §1](M02-05-stable-ids-and-legacy-refs.md). Once issued it is never changed, reused or overwritten (M02-05 §2). |
| `revisionOf` / `revisionNumber` | Self-reference for the revision chain; lineage mechanics belong to M16-03. |
| Foreign identifiers | External or legacy IDs (XIV witness records, community forms) are stored as **mapping attributes** in the `LegacyReference` shape of [M02-05 §2–3](M02-05-stable-ids-and-legacy-refs.md) (`sourceRepo`, `originalId`, pinned SHA, path, reviewer), never as the primary key and never fabricated. |

No witness object may be created by automatic crawl, AI generation, or bulk import. Every record has an identified human or reviewed-ingestion origin.

### 2.2 Owner and access scope

| Slot | Contract |
|---|---|
| `ownerPrincipalRef` | Reference to the D00 identity (`auth_users`) that holds the record. **D00/ARSY stays the sole identity owner** ([ADR-0001], [ADR-0007 §Boundary](ADR-0007-echolog-storage.md)); D06 stores a reference, not a duplicate user, session or credential. |
| `witnessSubjectRef` | The person whose testimony this is. May differ from `ownerPrincipalRef` (a recorder capturing someone else's account). |
| `consentRecordRef` | Reference to the D06 `consent_records` entity ([M02-02] D06 row) that authorizes any handling of this record. Nullable only while a record sits in `PRIVATE` intake state; **non-null is required for any state change that broadens visibility**. |
| `guardianshipFlag` / `minorProtectedFlag` | Marking only. The rule is [M03-06 §2](M03-06-witness-withdrawal-policy.md): *"Kesaksian atau rekaman yang melibatkan anak di bawah umur TIDAK BOLEH dipublikasikan dalam bentuk data terbuka yang dapat mengidentifikasi individu"*, and [ADR-0003 §2.2](ADR-0003-source-rights-and-consent.md) requires guardian verification before any minor's testimony becomes publishable. Enforcement is M16-04/M16-06 work. |
| Tenant | **No tenant column.** Commercial multi-tenancy is out of scope per [M03-04 §1](M03-04-tenant-role-boundaries.md); scoping is principal/role based (`anonymous` / `user` / `editor`+`reviewer` / `admin`) per [M03-04 §2](M03-04-tenant-role-boundaries.md). |

### 2.3 Date slots (declared as the object requires; semantics are M16-02)

The object MUST carry four **distinct, independently nullable** slots so that M16-02 can preserve them separately:

- `occurredAt` — when the witnessed event happened
- `observedAt` — when the witness perceived/reports having perceived it
- `recordedAt` — when it was captured by the system or a recorder
- `writtenAt` — when the testimony text as it stands was authored/last transcribed

Invariants fixed here (the *shape* requirement only): no slot may be inferred from another, silently defaulted, or collapsed into a single "date"; a missing slot stays `null` rather than being filled with a plausible value ([BLUEPRINT.md §6] *"no invented IDs/checksums on not-found"*, and the same reasoning applies to timestamps). Correction of chronology is an **appended** event, handled with M16-03/M16-02 — the Tick-Tock acceptance *"corrected chronology remains exact"* is M16-02's, not proven here.

### 2.4 Content and media reference (byte boundary)

| Slot | Contract |
|---|---|
| `bodyText` | The testimony text as recorded. It is **private data at rest**, never serialized into a public projection without the M16-05 redacted-derivative path. Sensitive sub-fields use the MoonQL `private: true` field convention from [M03-02] so they never reach JSON. |
| `attachmentRefs[]` | Zero or more **ECHOLOG D19 references only**: `{object_key, digest, size, content_type}` — the exact consumer contract of [ADR-0007](ADR-0007-echolog-storage.md) and [ECHOLOG.md §Data ownership](../architecture/ECHOLOG.md). |
| Media bytes | **Never in D06, never in Git, never in Postgres.** [SECURITY.md §Object storage]: *"**No bytes in Postgres.** No `bytea` column anywhere; ECHOLOG is stateless and holds no tables."* [ADR-0003 §1] and [BLUEPRINT.md §3] keep raw audio/scan/video outside Git; [M03-06 §1.2](M03-06-witness-withdrawal-policy.md) forbids copying private recordings, witness ID photos or raw court documents into a public Git repo. |
| Digest integrity | The digest is ECHOLOG's `sha256/<digest>` content address. D06 stores it as a reference; it does not recompute ownership of it. |

### 2.5 State slots (orthogonal axes, never merged)

Per [BLUEPRINT.md §6] *"Multidimensional statuses (never combine to one score)"*, the object carries **four independent axes**:

1. **Visibility**: `PRIVATE | RESTRICTED | PUBLIC | WITHDRAWN` (exactly the BLUEPRINT axis). Initial and default value: **`PRIVATE`** — always, including for records created by an authenticated editor.
2. **Review state**: `DRAFT | IN_REVIEW | APPROVED_WITHIN_SCOPE | DISPUTED | RETRACTED`, gated by D08 ([ADR-0003 §3] strict cycle `DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED`, *"Tidak ada konten baru yang dapat dipublikasikan secara otomatis oleh bot atau AI tanpa telaah manusia"*).
3. **Rights/consent state**: `RIGHTS_UNKNOWN | RIGHTS_EXACT_VERSION_CLEARED` ([BLUEPRINT.md §6]) plus the consent scope recorded in `consent_records` (full anonymity, verified pseudonym, or public name with written permission — [ADR-0003 §2.2]).
4. **Provenance category**: the single-valued enum of §3.

No axis may be derived from, or encoded into, another. A `PUBLIC` visibility never implies `APPROVED_WITHIN_SCOPE` review, and an `APPROVED_WITHIN_SCOPE` review never implies rights are cleared.

---

## 3. Provenance categories

### 3.1 Vocabulary (adopted, not invented)

M16-01 adopts the existing epistemic-nature axis of [BLUEPRINT.md §6](../../BLUEPRINT.md):

```
PRIMARY_TEXT | ATTRIBUTED_BELIEF | HISTORICAL_EVIDENCE
SCIENTIFIC_OBSERVATION | PERSONAL_TESTIMONY | INTERPRETATION | FICTION
```

A witness object stores **exactly one** value of this enum. The subset that legitimately appears in D06 is:

- `PERSONAL_TESTIMONY` — the default and normal value: what one principal reports having experienced.
- `HISTORICAL_EVIDENCE` — a testimony record that carries an externally attested documentary artifact (only when such attestation actually exists, with its source locator).
- `ATTRIBUTED_BELIEF` — a belief claim attributed to a tradition or person, reported rather than asserted by the system.
- `SCIENTIFIC_OBSERVATION` — permitted only as a **cross-reference** to a D10 World/Science observation; the measurement itself stays D10-owned ([M02-02] D10 row) and D06 must not copy it.
- `INTERPRETATION` / `FICTION` — normally **not** D06 values; they belong to D05/D03 and D07 respectively. Their presence on a D06 row is a modelling error unless the row is explicitly a creative reworking, which then belongs in D07 per [M06-02](M06-02-xiv-v10-crosswalk.md).
- `PRIMARY_TEXT` — **forbidden** in D06. Scripture is D01 Corpus; no testimony may be labelled or treated as primary text.

`UNKNOWN` is not a member of the adopted axis. A record whose category is genuinely undetermined stays in intake with `RIGHTS_UNKNOWN` and an unresolved provenance slot marked for the reviewer queue ([M06-06](M06-06-rights-classification.md) `NEEDS_SOURCE` discipline); it is never defaulted to `PERSONAL_TESTIMONY` merely to make a write succeed.

The narrative variants in [MASTER_VISION_NARRATIVE_XV.md §04.2](../vision/MASTER_VISION_NARRATIVE_XV.md) (`CREATIVE_FICTION`, `EMPIRICAL_OBSERVATION`, `USER_TESTIMONY`, …) are the same distinctions under different names. **BLUEPRINT §6 is the normative vocabulary**; the narrative names map onto it and must not become a second parallel enum. If a future task needs the finer narrative distinctions, that is a documented mapping, not a new axis.

### 3.2 Invariants

1. **P-1 Single value.** Every witness record carries exactly one provenance category. No score, no confidence percentage, no merged "truth index".
2. **P-2 Orthogonality.** Provenance is independent of visibility, review state and rights state (§2.5).
3. **P-3 No automatic assignment.** Neither import, AI suggestion, nor a UI default may set `HISTORICAL_EVIDENCE` or `SCIENTIFIC_OBSERVATION` without a human reviewer decision recorded in D08. `PERSONAL_TESTIMONY` may be set by the capturing editor; downgrading a testimony to `FICTION`, or upgrading it to evidence, is a governance act, not an edit convenience.
4. **P-4 Testimony ≠ fact-assertion.** A `PERSONAL_TESTIMONY` record must never be projected as verified empirical fact or as a divine/revealed message ([BLUEPRINT.md §5] `UserReported ≠ RevealedMessage`; TODO M16-07 acceptance *"No unverified spiritual message asserted as fact"*).
5. **P-5 Empirical claims stay empirical-owned.** Calibrated measurement versus simulation is a source distinction that must survive into the record's reference, with no physical-actuation claim attached ([BLUEPRINT.md §4] D10 *"no physical-device claim"*). D06 references such a claim; it does not own it.
6. **P-6 Fiction is never testimony, testimony is never fiction.** A `FICTION` artefact may not be filed in D06, and a D06 record may not be silently reclassified as `FICTION` to make publishing easier. Alias/identity confusion rules in [M02-01](M02-01-disambiguation-registry.md) and the M17-02 false-alias rule apply with the same force here.
7. **P-7 Label survives projection.** Whatever projection a record reaches (Dock, HQ, search, export, SDK), its category must remain distinguishable; collapsing it is M16-07's failure case, not an acceptable simplification.
8. **P-8 No cross-domain laundering.** A D05 Research assertion (including the SRGBL *"candidate witness support/100"* scale, [BLUEPRINT.md §6]) is not a D06 testimony and may not be stored as one; the research scale is explicitly *"not a scripture quality or salvation score"*.

---

## 4. Default-private posture and the no-automatic-public-original rule

### 4.1 The hard rule

> **There is no automatic public original.**

Concretely, and testable in later leaves:

- **H-1** New witness records are `PRIVATE` by default. There is no code path, seed, import, webhook, cron, AI candidate, or SDK default that creates a witness record with visibility other than `PRIVATE`.
- **H-2** No mechanism converts a witness **original** (`bodyText`, attachments, identity-bearing fields) into a public surface automatically, ever — not on approval, not on rights clearance, not on a schedule. [M03-06 §1.2](M03-06-witness-withdrawal-policy.md): *"DILARANG menyalin berkas rekaman suara pribadi, foto identitas saksi, atau dokumen pengadilan mentah ke dalam repositori Git publik. Repositori hanya mencatat metadata indeks dan status izin."* [BLUEPRINT.md §4] D06 row: *"Public archive only approved derivative."*
- **H-3** The **only** path from private witness to public is a **redacted derivative** produced on an explicit human publishing request and approved through D08 ([BLUEPRINT.md §6] publication sequence: *"rights/privacy/consent → … → independent human review → publication manifest/version → public projection"*; M16-05 owns that derivative). An approval broadens visibility of a *derivative*; the original remains private.
- **H-4** `WITHDRAWN` is terminal for public display: [ADR-0003 §2.2] *"Proyeksi publik (API/Search) langsung memblokir tampilan konten, sementara jejak audit tetap disimpan demi integritas catatan sejarah"* and [M03-06 §3.1]. Withdrawal blocks projections without deleting the audit trail or the immutable original (M16-06 owns the mechanics).
- **H-5** No public archive dump. [BLUEPRINT.md §3] *"No public private-archive dumps."* [ADR-0007 §Boundary]: *"No public archive dumps: private by default, access only through a grant."* Export, search indexing, caching, and RAG retrieval are projections subject to the same gate as the API.
- **H-6** Personal data in private records is not public-safe by transformation alone. [SECURITY.md §SKYLINK] states of normalized D18 message text: *"Normalized message bodies can contain personal data (including names, contact identifiers and private text); they remain private D18 data and must not be copied into logs or public surfaces."* The same bar is applied here to testimony text by analogy — it is the stricter reading, not a relaxation. No witness body, name, contact identifier, or attachment key may be written to logs, telemetry, or error messages.

### 4.2 Public REST surface

Because [SECURITY.md §Data release/privacy contract] warns that *"`ADMIN_WRITE` in MoonQL does not protect list/get"* and raw models *"must not be mistaken for reviewed public projection"*, the shape requires:

- The D06 model's auto-REST surface is **closed by default** — `rest: false`, or `acl` denying `list`/`get` to `anonymous`, following [M03-02] patterns 1–2, with `MOONQL_ACL_POLICY=require` boot-time fail-closed.
- Auto-generated `/api/v1/<model>` routes ([ADR-0002 §3]) are never a publishing surface for testimony; any public read goes through an explicit hand-written projection, and reserved-path protection prevents a model from shadowing it.
- Translation/catalog text is never stored as an API identifier ([BLUEPRINT.md §2A.3] / ADR-0005), so a provenance category is machine-stable (`PERSONAL_TESTIMONY`) and only its *display* is localized (`id`/`en`) — that display is M16-07's, and per [MASTER_DESIGN.md] a skin change may never alter *"source identity, publication/rights state, or machine API"*.

---

## 5. Consent and ACL gating — declared plugs (not implemented here)

This spec only fixes *where* the gates attach and *what question* each must answer.

| Plug | Contract fixed here | Implemented by |
|---|---|---|
| `consent_records` (D06, [M02-02]) | Records consent type (full anonymity / verified pseudonym / public name with written permission), scope of publication (private archive / internal / public anonymous / public attributed) and withdrawal. A visibility transition requires a consent record whose scope **covers the target scope**; absent, expired, or narrower consent fails closed. | M16-04, M16-06 |
| Role gate | Deny-by-default `acl` split into a role rule and a row predicate, as `resolveAcl`/`checkAcl` already do in `packages/moonql/src/acl.ts`: role gate in `preHandler`, row predicate in handlers, `expand` decided by `allowsAcl` rather than aborting. | M16-04 |
| Row ownership predicate | Non-owner, non-guardian, non-reviewer reads return not-found/403 without leaking existence; anonymous list/get/expand/export/cache/search paths must be negative-tested. | M16-04 (template from M03-02) |
| Rights veto | Unknown rights block **bytes**, not safe metadata ([M07-04](M07-04-rights-veto-policy.md)); `RIGHTS_UNKNOWN` never promotes visibility. | M16-04, M16-05 |
| D08 governance gate | The only writer of the review axis; human-in-the-loop, no bot/AI auto-publish ([ADR-0003 §3]). D06 never stores a rights decision as its own truth — it references it. | M18 rows, M16-05 |
| Grant for media | Downloads go through an ECHOLOG short-lived grant (presigned TTL ≤ 5 min, never logged, never for upload — [SECURITY.md §Object storage]); a public page never embeds a raw object key. | M16-04 |
| Minors | `minorProtectedFlag` set ⇒ automatic masking/redaction before `IN_REVIEW` ([M03-06 §2]) and a hard public block absent guardian verification ([ADR-0003 §2.2]). | M16-04, M16-06 |

**Nothing in this table is built by M16-01.** Any code that later implements it must satisfy these contracts, not redefine them.

---

## 6. Ownership boundary check against accepted ADRs

| Concern | Owner | This spec's position |
|---|---|---|
| Witness rows, consent records, corrections, fault lines | **D06 `@moonwitness/witness`** *(Planned G3 — not implemented; no such package exists at `76ecdc5`)* | Vocabulary defined here; no addon created |
| Identity, sessions, roles | **D00 / ARSY** ([ADR-0001]) | Reference only; no new login, no duplicated user |
| Rights decisions, sign-off, takedown log | **D08 Governance** | Reference only |
| Object bytes, digest, MIME, retention, legal hold, download grants | **D19 ECHOLOG** ([ADR-0007], stateless, **no tables**) | Reference `{object_key, digest, size, content_type}` only |
| Messaging, conversations, attachments links | **D18 SKYLINK** ([ADR-0006]) | D06 gains no messaging, no channel, no third identity surface; SKYLINK *"is not a second Hub and must not gain identity, a model catalog, or a third SQL owner"* (agents.md) |
| Fiction/story artefacts | **D07 Story & Media** | Never filed in D06 |
| Empirical/provider observations | **D10 World/Science** | Cross-reference only |
| SQL schema and migrations | `packages/moonql` and `packages/skylink-store` **only** | This spec adds **no** SQL owner; the closed importer set `{packages/moonql, packages/skylink-store}` ([ADR-0006 §Boundary, item 3](ADR-0006-skylink-communication-surface.md): *"No third SQL owner is authorized"*) is untouched |

---

## 7. NEEDS_MIGRATION / NEEDS_ADR register

Anything below is a **flagged decision for a future, separately-authorized task** — it is not authorized, not created, and not migrated by this specification.

| ID | Needed eventually | Gate that must cover it |
|---|---|---|
| `NEEDS_MIGRATION-D06-addon` | A `packages/moonql-witness` addon registered in the single ARSY wiring point | **Already covered** by [ADR-0002] (additive `defineAddon`, explicit `acl`, one wiring file). Migrations live only in `packages/moonql/drizzle.config.ts`; additive columns via `autoSync`, anything destructive through the M04-02 expand → switch → contract lifecycle with a `rollback.sql`. |
| `NEEDS_MIGRATION-D06-tables` | SQL tables `witness_testimonies`, `witness_consent_records`, `witness_corrections`, `witness_faultlines` | Covered by [ADR-0002] **provided** they live in the MoonQL-owned schema. A separate `witness` SQL *schema* with its own drizzle/postgres importer would need a **new ADR that amends ADR-0006**, which currently caps SQL owners at `{packages/moonql, packages/skylink-store}` and *"No third SQL owner is authorized"*. Do **not** create one silently. |
| `NEEDS_DECISION-attachment-placement` | Whether witness attachment references sit as columns on the D06 row or in a D06-owned join table | ADR-0002 scope (still MoonQL-owned); choose at implementation time, informed by M04-02 (destructive changes are expensive, so favor the additive shape). |
| `NEEDS_ADR-provenance-vocabulary-change` | Any new provenance value, or adoption of the narrative `§04.2` names as a second axis | **A new ADR** amending [BLUEPRINT.md §6]. This spec deliberately refuses to mint a parallel enum. |
| `NEEDS_ADR-raw-retention` | Storing raw provider/consent evidence bytes or raw private text with a retention window | [SECURITY.md §SKYLINK] pattern: purpose, PII classification, access control, retention duration and per-conversation deletion must be defined first, and retention defaults ≤ 30 days with enforced deletion. Same bar applies to any witness `raw` slot. |
| `NEEDS_MIGRATION-withdrawn-tombstone` | A public-projection tombstone/index invalidation record so `WITHDRAWN` ceases public availability across search/preview/export/cache | Needs the D08 governance model from [ADR-0003 §3] plus M18-04/M18-05 scope; no new SQL owner may be introduced to get it. |
| `NEEDS_REVIEW-off-host-backup` | Any witness archive backup target | [SECURITY.md]: off-host backup remains a review gate; ECHOLOG running on the same host does not satisfy "off-host". |

---

## 8. Acceptance mapping for the TODO line *"Default private, no automatic public original"*

This leaf's acceptance is **documentary**, and its evidence is [docs/audit/M16-01-witness-object-spec.md](../audit/M16-01-witness-object-spec.md):

- **Positive (spec-level):** the object definition states default `PRIVATE` (§2.5 axis 1, H-1), fixes a single-valued provenance enum drawn from the existing BLUEPRINT vocabulary (§3.1), and states the no-automatic-public-original rule with six testable clauses (H-1…H-6) that later leaves can each pin with a negative test.
- **Negative (spec-level):** the spec was checked against the real authority documents rather than assumed — ADR-0002/0003/0006/0007, M03-02/03-04/03-06, M06-06/07, M07-04, BLUEPRINT §4–§8, SECURITY.md and MASTER_DESIGN.md — and creates no SQL owner, no second Hub, no ECHOLOG table, no SKYLINK identity surface and no public default (§6).
- **Not claimed:** no code, schema, migration, route, UI, test file, or Docker change; no test executed against a running service; no deployment. Configuration and documents prove nothing about shipped behaviour, per agents.md and the M16 exit gate.

Reproducible checks a reviewer can re-run at the baseline to confirm this spec did not overreach:

```
git rev-parse HEAD                                              # 76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3
ls packages | grep -i witness                                  # no match -> no D06 package exists
grep -rn "witness_testimonies" --include=*.ts packages apps    # no match -> no D06 model declared
grep -rn "'wt_" --include=*.ts --include=*.tsx packages apps   # no match -> no witness IDs issued
grep -rEn "from '@moonwitness/(moonql-)?witness'" apps packages  # no match -> no D06 import anywhere
grep -c "moonql-witness" apps/arsy/src/addons.ts               # 0 -> addon not registered in the Hub
git status --short -- packages apps docker-compose.yml         # only unrelated parallel WIP; nothing from this task
```

> A naive `grep -i witness apps/arsy/src/addons.ts` matches every `@moonwitness/*` import and is **not** evidence of a witness addon; the precise patterns above are the check.

---

## 9. Rollback

Purely additive documentation. Rollback = delete the two files created by this task
(`docs/decisions/M16-01-private-witness-object-spec.md`, `docs/audit/M16-01-witness-object-spec.md`);
no other document, TODO row, schema, or code reference depends on them, and reverting cannot strand data because none was created.

---

## 10. Link targets for short-form references used above

[ADR-0001]: ADR-0001-arsy-is-xv-hub.md
[ADR-0002]: ADR-0002-additive-moonql-domains.md
[ADR-0003]: ADR-0003-source-rights-and-consent.md
[ADR-0003 §1]: ADR-0003-source-rights-and-consent.md
[ADR-0003 §2.2]: ADR-0003-source-rights-and-consent.md
[ADR-0003 §3]: ADR-0003-source-rights-and-consent.md
[ADR-0006]: ADR-0006-skylink-communication-surface.md
[ADR-0007]: ADR-0007-echolog-storage.md
[ADR-0007 §Boundary]: ADR-0007-echolog-storage.md
[M02-02]: M02-02-domain-assignments.md
[M03-02]: ../audit/M03-02-deny-by-default-template.md
[MASTER_DESIGN.md]: ../../MASTER_DESIGN.md
[BLUEPRINT.md §3]: ../../BLUEPRINT.md
[BLUEPRINT.md §4]: ../../BLUEPRINT.md
[BLUEPRINT.md §5]: ../../BLUEPRINT.md
[BLUEPRINT.md §6]: ../../BLUEPRINT.md
[BLUEPRINT.md §2A.3]: ../../BLUEPRINT.md
[SECURITY.md §Object storage]: ../architecture/SECURITY.md
[SECURITY.md §SKYLINK]: ../architecture/SECURITY.md

