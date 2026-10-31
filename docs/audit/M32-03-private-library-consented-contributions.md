# M32-03: Private Library and Consented Contributions Specification

**Task:** M32-03 — Specify private library and consented contributions
**Milestone:** [M32 — HARBOR member and community privacy](../milestones/M32.md) · [packet](../tasks/M32/M32-03.md)
**Role:** EXECUTABLE LEAF (specification artifact; no implementation)
**Priority / Difficulty:** P1 / D3
**Prerequisite:** M32-02 (D14 ownership and D00 session reuse) — [decision](M32-02-d14-ownership-d00-session-reuse.md)
**Baseline:** `dev` HEAD at time of authoring; parent SHAs 21f4e09 (M35-05) → db7b694 (M32-02) chain observed locally
**Status:** BASELINE ESTABLISHED — design and acceptance evidence only. Nothing in this document is implemented, deployed, or verified against a running HARBOR service.
**Data:** every identifier, filename, hash, quota figure and user in this document is synthetic.

## Executive Summary

HARBOR (proposed `apps/harbor`, [BLUEPRINT.md:97](../../BLUEPRINT.md)) is described as
*voluntary member/community, personal library, contributions*. M32-02 decided **who** owns the
community data (COMMUNITY domain owns D14; D00 sessions are reused, not duplicated). M32-03 decides
**where the boundary sits between the private library and the community**, and **what has to be true
before an item crosses it**.

Three decisions are specified here:

| # | Decision | Choice | Rejected alternative |
|---|---|---|---|
| D-1 | Private library default visibility | `private` is the only default; nothing is readable by any other member or by EMPIRE/ARSY without an explicit consent grant | opt-out publishing (rejected: inverts D06 consent semantics) |
| D-2 | Crossing mechanism | an item is *derived and published*, never *moved*; the private original is retained and remains the authoritative record | move/copy-on-publish (rejected: destroys D06 "original testimony + dated corrections") |
| D-3 | Consent scope model | per-item, per-purpose grant with an expiry, recorded against D06; withdrawal stops future reads and marks existing derivatives `revoked-pending-takedown` | account-level blanket consent (rejected: unrecoverable and non-portable) |

The specification covers the private library data model, the contribution lifecycle, the consent
grant schema, the read-path rules for every surface, retention, and the positive/negative acceptance
tests an integrator can run once (and only once) HARBOR exists.

## 1. Problem Statement

### 1.1 What is ambiguous today

The register leaf says only "specify private library and consented contributions". Inspecting the
real authorities:

- [BLUEPRINT.md:97](../../BLUEPRINT.md) — HARBOR row: "Voluntary member/community, personal library,
  contributions. Proposed; one shared D00 identity."
- [BLUEPRINT.md:110](../../BLUEPRINT.md) — "Proposed D14–D17 (not globally accepted domain
  contracts): D14 Community/Membership …". D14 is **not** an accepted contract, so no cross-domain
  guarantee may be built on it yet.
- [BLUEPRINT.md:207](../../BLUEPRINT.md) — D06 Witness: "Private observation, consent, original
  testimony, dated corrections. Public archive only approved derivative."
- M32-02 §4 established four cross-domain query rules (no direct cross-domain queries, API-mediated
  access, consent required, data minimisation) and a `community_profiles` table keyed on the D00
  `userId`.

Those facts do not answer: what a "personal library" item *is*, who may ever read it, how it becomes a
"contribution", or what happens on withdrawal. That gap is this leaf's deliverable.

### 1.2 Why the distinction matters

D06 is the only accepted contract in this neighbourhood and it is unambiguous: the **public surface
may only ever carry an approved derivative**. If HARBOR published a member's private object directly,
HARBOR would (a) make the private original unreachable for dated correction, and (b) create a second
canonical copy that ARSY/EMPIRE would have to reconcile. Both break existing boundaries, so the
publish path must be a derivation, not a relocation.

### 1.3 Out of scope for this leaf

| Out of scope | Owned by |
|---|---|
| Building `apps/harbor` | M32-01 / M32-05 verification work, never a spec leaf |
| Moderation queue, reporting, appeals | M32-04 |
| Consent UI copy in `id`/`en` and keyboard reachability | MASTER_DESIGN + M32-05 verification |
| D00 token issuance/rotation | D00 owner (existing identity contract) |
| D06 consent-store implementation | D06/Witness owner |
| Object-storage bytes | ECHOLOG (ADR-0007) — HARBOR must not become a SQL owner or a second Hub |

## 2. Reference Model

### 2.1 Entities

```
D00 identity (accepted contract)
   └── userId, sessionId          ← reused, never re-created (M32-02 §3)

Private library  (COMMUNITY-owned, D14-proposed)
   ├── LibraryItem        id, userId, kind, title, tags[], createdReason
   ├── LibraryRevision    id, itemId, seq, contentRef, note, createdAt   (immutable)
   └── ContentBlob        opaque reference only → ECHOLOG object key

Contribution  (COMMUNITY-owned, D14-proposed)
   ├── Contribution       id, itemId, revisionSeq, authorId, state, form
   ├── Derivative         id, contributionId, contentRef, generatedAt, hash
   └── ConsentGrant       id, itemId, revisionSeq, purpose, scope, grantedAt, expiresAt
```

Rules that fall directly out of the model:

1. A `LibraryItem` **cannot** be shared. Only a `Contribution` can be shared, and a `Contribution`
   always points at exactly one `LibraryRevision`.
2. `ContentBlob` holds no bytes — it holds a reference. HARBOR owns rows, ECHOLOG owns objects.
   HARBOR must not gain a third SQL owner or a storage owner (AGENTS.md, ADR-0006/0007).
3. `LibraryRevision` rows are append-only; editing produces `seq+1`. Correction is expressed as a new
   revision with a `note`, which is what D06 "dated corrections" demands.
4. `ConsentGrant` is the only object that can widen visibility, and it never names a specific
   recipient — it names a *purpose* and a *scope*.

### 2.2 Kinds and forms

`LibraryItem.kind` (private, member-authored):

| kind | example (synthetic) | publishable |
|---|---|---|
| `observation` | witness note about a site visit | yes |
| `research` | reading list, method sketch | yes |
| `media` | photo/audio reference | yes, subject to third-party rights gate |
| `draft` | unfinished narrative | yes |
| `private-note` | personal reminders, credentials-adjacent text | **never** |

`Contribution.form` (what the community sees):

| form | meaning | default audience |
|---|---|---|
| `post` | standalone text derivative | community members |
| `comment` | reply attached to another contribution | community members |
| `collection` | curated set of derivatives | community members |
| `archive-submission` | derivative offered to the approved public archive | EMPIRE review queue |

`private-note` being non-publishable is enforced at two layers (create and publish) because a single
check placed only in the UI would be bypassable by an API caller.

### 2.3 Lifecycle

```
LibraryItem:   private ──(publish request)──> Contribution.state = pending-consent
                                                  │
                        consent grant created ────┤
                                                  ▼
                                     derivative-built ──> under-review ──┬─> published
                                             │                           │
                                             └─> rejected ──> withdrawn  │
                                                                         │
        consent withdrawn ──────────────────────────────────────────────>│
                                                                         ▼
                                                          revoked-pending-takedown ──> removed
```

`withdrawn` and `removed` are terminal. A `removed` contribution never re-enters `published`; the
member must create a new contribution from a (possibly new) revision. This keeps the audit trail
linear and makes "was it ever public?" answerable.

## 3. Private Library Specification

### 3.1 Tables (proposed DDL, not applied)

```sql
-- COMMUNITY-owned. No foreign key into another domain's tables.
CREATE TABLE harbor_library_items (
  item_id        TEXT PRIMARY KEY,           -- 'lib_' + 22 char lowercase base32, opaque
  user_id        TEXT NOT NULL,              -- D00 userId; no duplicate identity table
  kind           TEXT NOT NULL CHECK (kind IN
                   ('observation','research','media','draft','private-note')),
  title          TEXT NOT NULL CHECK (length(title) <= 200),
  tags           TEXT NOT NULL DEFAULT '[]', -- JSON array of <= 12 lowercase tags
  created_reason TEXT NULL,                  -- free text; never required
  deleted_at     TEXT NULL,                  -- soft delete marker
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX harbor_items_user ON harbor_library_items (user_id, deleted_at, created_at DESC);

CREATE TABLE harbor_library_revisions (
  revision_id  TEXT PRIMARY KEY,
  item_id      TEXT NOT NULL REFERENCES harbor_library_items(item_id),
  seq          INTEGER NOT NULL CHECK (seq >= 1),
  content_ref  TEXT NOT NULL,                -- ECHOLOG object key; bytes never stored here
  content_hash TEXT NOT NULL,                -- sha256 of canonical bytes, hex, lowercase
  size_bytes   INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 26214400), -- 25 MiB cap
  note         TEXT NULL,                    -- why this revision exists (correction rationale)
  created_at   TEXT NOT NULL,
  UNIQUE (item_id, seq)
);

CREATE TABLE harbor_library_links (
  from_item TEXT NOT NULL,
  to_item   TEXT NOT NULL,
  kind      TEXT NOT NULL CHECK (kind IN ('relates','answers','supersedes')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (from_item, to_item, kind)
);
```

No column stores a name that could be used to identify a member to another member. `user_id` is the
D00 identifier and is never rendered in a community surface; the render path uses
`community_profiles.displayName` per M32-02 §4.

### 3.2 Operations

| op | input | effect | visibility after |
|---|---|---|---|
| `createItem` | kind, title, body | item + `seq=1` revision | author only |
| `reviseItem` | itemId, body, note | new revision `seq+1` | author only |
| `readItem` | itemId, revisionSeq? | latest revision if seq omitted | author only |
| `linkItems` | from, to, kind | edge row | author only |
| `deleteItem` | itemId | `deleted_at` set; revisions retained until retention clock | author only, then purge |
| `exportItem` | itemId | NDJSON of item + revisions + refs | author only |
| `publishItem` | itemId, revisionSeq, form, purpose | creates `Contribution` in `pending-consent` | unchanged until grant |

Quotas (synthetic defaults, all tunable, none verified against a real deployment):

- 5,000 items per member; 25 MiB per revision; 500 MiB total per member.
- 200 revisions per item.
- Rate limit: 60 writes/minute/member, burst 10.

### 3.3 Invariants

| # | invariant | enforcement point |
|---|---|---|
| I-1 | no library row is readable by a non-author principal | every read path filters `user_id = session.userId`; there is no "admin read-all" query |
| I-2 | revisions are immutable | no `UPDATE harbor_library_revisions` exists in the API surface |
| I-3 | bytes live in ECHOLOG, rows live in COMMUNITY | `content_ref` is a key, never a blob |
| I-4 | `private-note` never yields a contribution | `publishItem` rejects before consent evaluation |
| I-5 | deletion is soft, then permanent on the retention clock | `deleted_at` + scheduled purge, no silent hard delete |
| I-6 | an item's history survives withdrawal of consent | contributions go `removed`, revisions are untouched |

## 4. Consented Contribution Specification

### 4.1 Consent grant

Consent is evaluated by D06 (M32-02 §4 rule 3). HARBOR stores its own *evidence of the grant* so it
can re-check expiry without re-asking D06 on every read, but the grant is not the authority — D06 is.

```sql
CREATE TABLE harbor_consent_grants (
  grant_id      TEXT PRIMARY KEY,
  item_id       TEXT NOT NULL,
  revision_seq  INTEGER NOT NULL,
  user_id       TEXT NOT NULL,
  purpose       TEXT NOT NULL CHECK (purpose IN
                  ('community-display','archive-review','search-index','research-use')),
  scope         TEXT NOT NULL CHECK (scope IN
                  ('metadata-only','body-text','body-text-and-media')),
  audience      TEXT NOT NULL CHECK (audience IN
                  ('members','moderators','reviewers','public-archive')),
  granted_at    TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  withdrawn_at  TEXT NULL,
  evidence_ref  TEXT NOT NULL,               -- D06 record id, opaque to HARBOR
  UNIQUE (item_id, revision_seq, purpose, audience)
);
```

Grant rules:

1. `expires_at - granted_at <= 365 days`. Longer-lived visibility requires a fresh grant; there is no
   "forever" checkbox, because a member who consents at 20 and never opens HARBOR again should not be
   permanently published.
2. One grant per (item, revision, purpose, audience). Publishing a *new* revision to an existing
   contribution requires a *new* grant — consent never silently follows an edit. This is the single
   most important rule in the leaf: it is what stops "I agreed to post v1" becoming "you published v3".
3. `audience` narrows the read path; `scope` narrows the payload. `metadata-only` means the title and
   tags only, never the body.
4. A grant may not name a recipient. Personalised grants would require HARBOR to model every possible
   reader, and would leak the existence of the item into an ACL table.

### 4.2 Derivation

`buildDerivative(itemId, revisionSeq, scope)` produces the published artifact:

| scope | included | excluded |
|---|---|---|
| `metadata-only` | title, tags, kind label, created date | body, media, note text |
| `body-text` | title, tags, body text, correction notes | media refs, links, export traces |
| `body-text-and-media` | above + media the member explicitly selected | `private-note` items, other members' quoted text |

Derivation is destructive-by-design: the derivative is generated as a **new** immutable byte object
(new `content_ref`, new `content_hash`) and stored with `generatedAt` and the source
`(itemId, revisionSeq)`. The private original is never handed out and the derivative never points back
into the private table for content. Consequences:

- A reader of a published contribution cannot traverse to the private library, even with a compromised
  read path, because the bytes are physically a different object.
- Takedown is a bounded operation: remove the derivative object, mark the contribution `removed`,
  leave the original intact.
- Corrections are explicit: publishing a corrected revision creates a second derivative and a
  dated relationship, satisfying D06.

### 4.3 Third-party and rights gate (media)

`kind = media` adds one mandatory pre-check before `under-review` is reachable:

```
mediaRightsDeclared  ∈ {self, licensed-explicit, uncertain}
if mediaRightsDeclared = 'uncertain' → publish blocked, member prompted
if mediaRightsDeclared ∈ {self, licensed-explicit} → reviewer sees the declaration verbatim
```

Recognised faces, voices or identifiable third parties in a `media` item require the member to assert
that third-party permission exists. HARBOR does not verify it and must not claim to; the assertion is
recorded as text and surfaced to the reviewer. Any real rights clearance is a human/legal decision
(packet §8: stop BLOCKED when rights are missing), not something a spec can manufacture.

### 4.4 Read-path matrix

This is the operative privacy contract of the leaf. `session` = D00 session validated per M32-02 §3.

| request | author | other member | moderator | reviewer | EMPIRE/ARSY service | anonymous |
|---|---|---|---|---|---|---|
| library item body | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| library item metadata | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| contribution `pending-consent` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| contribution `under-review` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| contribution `published`, scope `body-text`, audience `members` | ✅ | ✅ | ✅ | ✅ | only via API + grant check | ❌ |
| contribution `published`, audience `public-archive` | ✅ | ✅ | ✅ | ✅ | ✅ after EMPIRE approval | ✅ after approval |
| contribution `revoked-pending-takedown` | ✅ | ❌ | ✅ (read for audit) | ✅ (read for audit) | ❌ | ❌ |
| contribution `removed` | ✅ | ❌ | audit read only | audit read only | ❌ | ❌ |

Two rows deserve comment. `revoked-pending-takedown` keeps content readable to moderators *only* so a
takedown can be executed and evidenced; it is not a general visibility grant. `removed` audit reads
return metadata and hashes, never body text, because after removal the only legitimate interest is
"what happened", not "what did it say".

### 4.5 Withdrawal

```
withdrawConsent(grantId):
  1. set withdrawn_at; mark grant inactive
  2. for each contribution using that grant:
       state -> 'revoked-pending-takedown'
       emit event 'harbor.consent.revoked'   (audit log, no body text)
  3. cache purge across member/public surfaces, target ≤ 60 s
  4. reviewers get a takedown task, SLA 24 h
  5. on takedown completion: state -> 'removed', derivative object deleted,
     tombstone row retained (grant id, hashes, dates) for legal audit
```

Withdrawal is not retroactive-deletion theatre. The tombstone exists precisely so a future question
("did you ever publish this, and when did you stop?") has an answer that does not depend on the body.

## 5. API Surface (contract only)

All routes are namespaced under an existing HARBOR app if one is ever accepted; this leaf does not
create one.

| method | path | purpose | guard |
|---|---|---|---|
| POST | `/library/items` | create | session |
| GET | `/library/items/:id` | read latest revision | session + author |
| POST | `/library/items/:id/revisions` | append revision | session + author |
| GET | `/library/items/:id/export` | NDJSON export | session + author |
| DELETE | `/library/items/:id` | soft delete | session + author |
| POST | `/contributions` | create `pending-consent` from a revision | session + author + kind gate |
| POST | `/contributions/:id/consent` | attach grant | session + author |
| POST | `/contributions/:id/publish` | build derivative → `under-review` | grant valid + rights declared |
| GET | `/contributions/:id` | read derivative | per §4.4 |
| POST | `/consent/:grantId/withdraw` | withdrawal | session + author |
| GET | `/me/visibility` | list every live grant | session |

Envelope: `{ "data": …, "meta": { "requestId", "servedAt" }, "error": null }`. Errors use the existing
Fastify error shape of the app that hosts these routes; no parallel error dialect is introduced.

| condition | status | code |
|---|---|---|
| consent grant absent/expired | 403 | `CONSENT_REQUIRED` |
| grant present but scope too narrow | 200 with truncated payload | — |
| `private-note` publish attempt | 422 | `KIND_NOT_PUBLISHABLE` |
| item not owned by session | 404 | `NOT_FOUND` (not 403, to avoid existence leak) |
| revision already exists for that (item, seq) | 409 | `REVISION_CONFLICT` |
| media rights undeclared | 422 | `RIGHTS_UNDECLARED` |
| publish with a withdrawn grant | 403 | `CONSENT_WITHDRAWN` |

404 rather than 403 on foreign items is deliberate: a 403 tells an attacker the item exists, which in
a private-library product is itself a disclosure.

## 6. Acceptance Criteria

### 6.1 Positive test — publish a research note with a scoped, expiring grant

```bash
# synthetic member, synthetic item; run only once apps/harbor exists and is migrated
node scripts/diagnostics/harbor-consent-flow.mjs --scenario publish-scope-expiry
```

Expected assertions (all must hold):

| # | assertion |
|---|---|
| P-1 | library item created, `kind=research`, `seq=1`, `content_hash` matches sha256 of canonical body |
| P-2 | GET `/library/items/:id` as a second synthetic member → 404 |
| P-3 | contribution created → `state=pending-consent`; GET `/contributions/:id` as second member → 404 |
| P-4 | grant issued (`purpose=community-display`, `scope=metadata-only`, `audience=members`, expiry +30d) |
| P-5 | publish → derivative built; derivative object key ≠ original key; `state=under-review` |
| P-6 | after approval → `published`; second member sees title+tags, body length reported as 0 |
| P-7 | original body bytes absent from derivative payload and absent from response log |
| P-8 | audit log contains `harbor.consent.granted` with grant id and expiry, no body text |

Observed result at authoring: **not run** — `scripts/diagnostics/harbor-consent-flow.mjs` does not
exist because HARBOR is unimplemented. Recorded honestly as pending; this leaf establishes the
acceptance recipe, not its passage.

### 6.2 Negative tests

| # | scenario | expected safe failure |
|---|---|---|
| N-1 | publish `private-note` | 422 `KIND_NOT_PUBLISHABLE`, no contribution row created |
| N-2 | publish with no grant | 403 `CONSENT_REQUIRED`, item stays private |
| N-3 | grant expired 1 s ago | derivative not served; cache invalidated; state moves to `revoked-pending-takedown` |
| N-4 | member edits to `seq=2` after publishing `seq=1` | surface still shows `seq=1` derivative; `seq=2` requires a fresh grant (rule §4.1.2) |
| N-5 | withdraw consent on a published contribution | readers get 404 within the cache window; tombstone row present |
| N-6 | non-author guesses an item id | 404, identical response shape and timing class to a nonexistent id |
| N-7 | EMPIRE service requests a `pending-consent` contribution | denied — the only accepted public artifact is an approved derivative |
| N-8 | session token whose `userId` was deleted in D00 | read of any library item fails; no orphan row is exposed |
| N-9 | `media` item with `mediaRightsDeclared=uncertain` | 422 `RIGHTS_UNDECLARED`, blocked before review |
| N-10 | attempt to `UPDATE harbor_library_revisions` via the API | no such operation; the API surface has no revision-mutation route |
| N-11 | two grants for the same (item, revision, purpose, audience) | 409 `REVISION_CONFLICT`-class uniqueness failure, second grant not stored |
| N-12 | payload replay of `POST /contributions` after success | second call returns the same contribution id; no duplicate derivative is generated |

N-3, N-4 and N-5 are the ones that matter most: expiry, edit-after-publish, and withdrawal are exactly
where a "consented contribution" feature usually leaks.

### 6.3 Commands actually available today

```bash
git rev-parse --abbrev-ref HEAD   # dev
node scripts/diagnostics/environment-doctor.mjs --commands
```

No HARBOR package script, no HARBOR migration, and no HARBOR test exists; asserting otherwise would be
fabricating evidence. Root `pnpm verify` remains a broad integration check and does not prove anything
about this specification.

## 7. Risk Assessment

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | consent copy drifts from D06 truth | medium | high | grant carries `evidence_ref`; revalidate D06 on publish and daily for live grants |
| R-2 | edit-after-publish surprise | high | high | rule §4.1.2 + N-4 test |
| R-3 | derivative retains private text by accident | medium | high | derivation is a fresh object built from a declared scope, never a passthrough |
| R-4 | takedown never completes | medium | high | `revoked-pending-takedown` is a visible queue with SLA, not a background wish |
| R-5 | quota abuse / storage growth | medium | medium | 25 MiB/500 MiB caps, ECHOLOG holds bytes, HARBOR rows stay small |
| R-6 | existence leak via 403 | low | medium | 404-for-foreign-items rule |
| R-7 | media third-party rights unresolved | medium | high | declaration gate + human legal review; BLOCKED per packet §8 without rights |
| R-8 | HARBOR becomes a second SQL owner | medium | high | only COMMUNITY-owned `harbor_*` tables; no writes into other domains |
| R-9 | cache serves revoked content long-tail | medium | high | explicit purge step in withdrawal + measured 60 s target |
| R-10 | D14 never accepted, spec silently becomes dead weight | medium | medium | every rule is expressed against accepted D00/D06 so it survives a D14 rename |
| R-11 | moderator over-reach into libraries | low | high | §4.4 grants moderators no library read; audit reads are metadata-only |
| R-12 | export used to exfiltrate another member's data | low | medium | export is single-user scoped, session-bound, rate-limited |

## 8. Overlap Analysis

| neighbour | relationship | boundary |
|---|---|---|
| M32-02 | predecessor; consumes its session + cross-domain rules | this leaf adds item/derivative semantics only |
| M32-04 | successor; `under-review` and `revoked-pending-takedown` are its intake queues | this leaf defines the states, M32-04 defines who acts on them and appeals |
| M32-05 | successor; runs §6 against a real deployment | no verification claimed here |
| D06 (accepted) | authority for consent | HARBOR mirrors evidence, never overrides |
| D00 (accepted) | authority for identity | reuse only, per M32-02 §3 |
| ECHOLOG (ADR-0007) | owns bytes | HARBOR stores `content_ref` only |
| EMPIRE | public archive | receives only approved derivatives |
| ARSY | research surface | API-mediated read of approved derivatives with grant check |

## 9. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | actual `apps/harbor` service | post-M32-05, only with an accepted ADR |
| 2 | migrations for the 5 proposed tables | implementation task |
| 3 | D06 grant-issuing API detail | D06 owner |
| 4 | ECHOLOG upload/retention API contract | ECHOLOG owner |
| 5 | signed URLs for media preview | implementation task |
| 6 | consent-bundle UI, `id`/`en` copy, keyboard path | MASTER_DESIGN + M32-05 |
| 7 | cache purge implementation and timing measurement | implementation task |
| 8 | tombstone retention period decision | legal/security owner |
| 9 | third-party recognition tooling (faces/voices) | explicitly not promised; human declaration only |
| 10 | moderation queue actions | M32-04 |
| 11 | appeals for a blocked publish | M32-04 |
| 12 | anonymous posting | rejected pending a rights decision, not deferred silently |
| 13 | cross-member item sharing (`share-with-one-person`) | needs a recipient-scoped consent model, currently unsupported by §4.1 |
| 14 | analytics on library contents | out of scope; private means unobserved |
| 15 | translation of derivatives | EMPIRE concern |
| 16 | notification fan-out on grant expiry | implementation task |
| 17 | bulk publish from a collection | needs per-item grant UX first |
| 18 | rate limit values validation against real load | post-pilot |
| 19 | 25 MiB cap validation | post-pilot |
| 20 | GDPR-style erasure interplay with tombstones | legal owner |

## 10. Rollback

Rolling back this leaf is a documentation operation, not a data operation:

1. revert the commit that adds this file and the TODO.md row change;
2. no table, route, or feature flag exists to unwind, because nothing was implemented;
3. if a later implementation shipped and this spec is replaced, the *derivative immutability* rule
   (§4.2) and the *fresh-grant-on-edit* rule (§4.1.2) must be carried into the replacement — dropping
   either one is a privacy regression, not a simplification.

## 11. Report

| field | value |
|---|---|
| `task_id` | M32-03 |
| `baseline_sha` | dev HEAD `db7b694` (M32-02) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M32-03-private-library-consented-contributions.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files |
| `positive_test_and_output` | §6.1 recipe defined; **not executed** — the runner does not exist because HARBOR is unimplemented |
| `negative_test_and_output` | §6.2 defines 12 synthetic failure cases with expected codes; **not executed** |
| `security_rights_privacy` | private-by-default, per-item/per-purpose/expiring consent, derivation-not-movement, 404-not-403, no third-party verification claimed, no real member data used |
| `reviewer` | integrator (not self-approved) |
| `rollback` | §10 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | specification only; all quotas/SLAs are synthetic defaults; D14 is not an accepted domain contract; consent semantics depend on D06 APIs that HARBOR does not yet call |
| `next_eligible_task` | M32-04 — Specify moderation reporting and appeals |

## 12. Conclusion

The boundary HARBOR needs is narrow and testable: **the private library is unreadable by everyone
except its author, and the community sees only an immutable derivative that was produced by an
explicit, purpose-scoped, expiring consent grant.** Two rules carry almost all of the privacy weight —
publish derives rather than moves, and an edit invalidates the grant that covered the earlier
revision. Everything in §3–§5 exists to make those two rules un-bypassable, and the twelve negative
cases in §6.2 exist to catch the specific ways an implementation would quietly break them.

## Appendix A: Private → Public Flow

```
member            HARBOR/COMMUNITY        D06            ECHOLOG        reviewer       EMPIRE
  │ create item      │                      │                │               │            │
  ├───────────────>append rev seq=1 ───────>│ store bytes ──>│               │            │
  │                 │  (private, author-only)│                │               │            │
  │ publish         │                      │                │               │            │
  ├───────────────>contribution=pending-consent              │               │            │
  │ grant form      │                      │                │               │            │
  ├───────────────>grant request ─────────>│ approve        │               │            │
  │                 │<── evidence_ref ──────┤                │               │            │
  │ confirm         │                      │                │               │            │
  ├───────────────>buildDerivative ────────────────────────>│ new object    │            │
  │                 │state=under-review ────────────────────────────────────>│            │
  │                 │                      │                │   approve ────┤            │
  │                 │state=published ────────────────────────────────────────────────────>│
  │                 │                      │                │               │  archive   │
  │                 │                      │                │               │  review    │
```

## Appendix B: Consent Decision Table (pseudocode)

```
canRead(principal, contribution):
  g = activeGrant(contribution.itemId, contribution.revisionSeq,
                  purpose=contribution.purpose, audience=contribution.audience)
  if g is null:            return DENY(403 CONSENT_REQUIRED)
  if g.expiresAt < now:    scheduleTakedown(contribution); return DENY(404)
  if g.withdrawnAt != null:scheduleTakedown(contribution); return DENY(404)
  if contribution.state in (revoked-pending-takedown, removed):
                           return AUDIT_ONLY(principal)
  switch contribution.audience:
    members:        return ALLOW if principal.hasValidD00Session()
    moderators:     return ALLOW if principal.role in (moderator, admin)
    reviewers:      return ALLOW if principal.role = reviewer
    public-archive: return ALLOW if contribution.approvedByEmpire

buildDerivative(item, seq, scope):
  src = fetchBytes(item.revisions[seq].content_ref)   # ECHOLOG
  out = project(src, scope)                           # drop everything not in scope
  assert not containsAny(out, item.privateLinkEdges)
  assert not containsAny(out, otherMemberIdentifiers(src))
  key = echoLog.put(out); hash = sha256(out)
  assert key != item.revisions[seq].content_ref       # derivation, not passthrough
  return {key, hash, generatedAt: now(),
          source: {itemId: item.id, revisionSeq: seq}}
```

## Appendix C: Glossary (selected)

| term | definition used here |
|---|---|
| private library | the per-member set of `LibraryItem` rows and their revisions; author-only read |
| revision | an immutable append of an item's content, `seq` ordered, carrying an optional correction note |
| contribution | the publishable object derived from exactly one revision |
| derivative | the bytes actually served to a non-author reader; a distinct ECHOLOG object |
| consent grant | a per-(item, revision, purpose, audience) permission with an expiry, evidenced against D06 |
| purpose | why content may be used: display, archive review, search indexing, research |
| scope | how much may be used: metadata only, body text, body text and media |
| audience | who may read: members, moderators, reviewers, public archive |
| withdrawal | the member's act of ending a grant, triggering takedown without deleting the original |
| tombstone | the post-removal metadata-and-hashes record retained for audit |
| soft delete | `deleted_at` set, data retained until the retention clock |
| dated correction | a new revision with a note, satisfying D06's correction semantics |
| existence leak | a response that reveals an item exists even though its content is withheld |
| audit-only read | metadata/hash access granted to a moderator or reviewer after takedown |
| approved derivative | the only artifact EMPIRE may publish, per D06 |
