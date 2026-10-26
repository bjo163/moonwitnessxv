# M12-01 — Rocksoul STORY / EVENT / PERSON / TEXT / LAW / PERSPECTIVE Boundaries

- **Milestone**: M12 Typed correlation and evidence graph
- **Task**: M12-01
- **Status**: RATIFIED
- **Depends on**: M06-05 (inventory of Corpus, Empire, A-L-L-A-H and Rocksoul interfaces)
- **Evidence of record**: `docs/decisions/M06-05-historical-interfaces-map.md`, `docs/audit/M06-01-source-repo-pins.md`, `BLUEPRINT.md` §"Historical systems"
- **Pinned legacy source**: `github.com/bjo163/rocksoul-platform@5d820b17fa11c039` (MFTL manifest)

---

## 1. Decision

MoonWitness XV references Rocksoul's historical surfaces by stable identifier and provenance
digest. It **never** re-implements a Rocksoul owner, bulk-copies its rows, or runs it as a live
runtime dependency. Each historical role has exactly one XV canonical owner; every other module
(including the M12 graph) may only cite it.

> Reference is not duplication. A citation is a code plus an exact SHA; a duplicate is a second
> writable copy of somebody else's record.

## 2. Owner matrix

| Legacy surface | Historical role | XV canonical owner | Canonical records | M12 graph treatment | Non-duplication rule |
|---|---|---|---|---|---|
| **Corpus / RGBL** | TEXT | **D01 Source / Corpus** | `corpus_works`, `corpus_editions`, `corpus_passages`, `corpus_translations` | Evidence spans cite an edition/passage code and the source `provenanceSha`; no passage text is stored as graph content | The graph never parses, edits or re-catalogs scripture |
| **Rocksoul MFTL** | STORY | **D07 Story & Media** | World / arc / character / episode / media manifests (future models) | A candidate may reference a story artefact by external stable reference; the referent itself is an ontology entity | The graph never becomes a second story world or episode store |
| **Legend** | EVENT | **D04 Actor & Event** | `actor_events` (M11) | A correlation may cite an `eventCode`; chronology confidence stays in D04 | No event rows, dates or chronology tables are copied into the graph |
| **Superhero** | PERSON | **D04 Actor & Event** | `actor_figures`, `actor_roles`, `actor_missions` (M11) | A correlation may cite a `figureCode`; person attributes stay in D04 | The graph stores no person biography, rank or mission field |
| **AWS** | LAW | **D08 Publication / Governance** | Rights decisions, reviewer sign-off, release/withdraw/retract policy | The graph may cite a governance decision as evidence; it cannot enact one | No rule engine or rights ledger is duplicated in D03 |
| **Perspective** | Attributed interpretive lens | **D03 Ontology** | `perspective` field on entities, aliases and relations | A required field on candidate edges; a lens label, never a node | No "perspective entity" rows and no perspective hierarchy |
| **Correlation** | Reviewed RELATIONSHIP | **D03 Ontology** | `onto_relations` (reviewed canonical), `graph_candidates` (typed claims), `graph_releases` (immutable freeze), `graph_release_pointer` (one active), `graph_adjacency` (derived) | M12 owns candidate claims and frozen releases; reviewed relations remain canonical in `onto_relations` | A release is a projection; it never writes back or replaces `onto_relations` |
| **Crayon** | Console | **D00 Identity & Ops** | Operator surfaces (Cockpit / Dock / ops models) | The constellation relation detail is a read-only consumer | No second console, route table or login |
| **Rocksoul Platform** | IAM | **D00 Identity & Ops** | `auth_users`, sessions, API keys, roles | Reviewer names in graph rows are audit labels, never identities or credentials | Graph rows never carry passwords, tokens or role grants |
| **Rocksoul Assets / Creative / UI** | Visual sources | **D13 Design** + **D07 media manifests** | MoonUI contracts, asset provenance, media manifests | Releases cite a source code and SHA; no binaries or thumbnails are embedded | The graph never stores or rewrites visual assets |

## 3. Sub-ownership inside D03

Because TEXT, STORY, EVENT, PERSON and LAW all meet in the ontology, D03 needs an internal
write hierarchy. Only one layer may mutate each record:

1. **`onto_relations` — canonical reviewed relation.** Written by the M10 edge registration and
   reviewer flow. Verified edges require reviewer + reason + evidence. This is the authority the
   Constellation reads.
2. **`graph_candidates` — typed claims.** Append-only claims that a relation may exist. A candidate
   is not a graph edge. It can carry an evidence span, an evidence frame and an exact SHA. A
   candidate cannot be approved without evidence.
3. **`graph_releases` — immutable freeze.** A deterministic manifest over verified `onto_relations`
   plus approved candidates. Same inputs produce the same `graphSha`; the same SHA is never stored
   twice.
4. **`graph_release_pointer` — one active version.** A singleton row names the active release and
   the release it replaced. Rollback activates an older immutable release; it never edits one.
5. **`graph_adjacency` — derived, droppable.** Neighbour and search rows reconstructed from the
   active manifest. It can be dropped at any time and rebuilt; it is never an authority.

`sameAs` is deliberately outside this hierarchy. Identity is decided only by M10
`onto_identity_reviews`; a graph candidate of type `sameAs` can be registered and displayed but can
never be approved into a release.

## 4. Boundary rules

- **R1 — One writer.** Each record has exactly one owning model. D03 graph tables never write
  `corpus_*`, `actor_*`, `auth_*` or story tables.
- **R2 — Cite, don't copy.** A cross-domain statement is stored as a stable code plus an exact
  SHA-256. There is no live network call to a legacy repository at runtime.
- **R3 — Evidence at exact SHA.** An approved edge must resolve to an approved source whose
  `provenanceSha` equals the candidate's `evidenceSha`. A missing span or missing digest blocks
  approval rather than producing an "assumed" edge.
- **R4 — Perspective is a lens.** It is a typed enum on the claim, not an entity and not a truth
  score.
- **R5 — Unknown stays unknown.** Co-occurrence, phonetic similarity, shared labels and chronology
  proximity are candidate signals only. They never auto-approve, and `sameAs` is never automatic.
- **R6 — Releases are immutable; the pointer moves.** History is preserved by appending a release
  and moving the singleton pointer, not by overwriting a manifest.
- **R7 — Derived means reconstructable.** Adjacency and search rows must be reproducible from the
  active release manifest with no loss; a rebuild is an idempotent operation.
- **R8 — Revoked stays visible.** Revocation ends release membership but not the candidate record;
  the review trail remains queryable.

## 5. Non-goals

- No bulk import of Rocksoul, Corpus or A-L-L-A-H tables.
- No live calls to `rocksoul-platform` or any legacy API.
- No graph write path into D01, D04, D07 or D08.
- No second identity system: `sameAs` stays an M10 reviewer decision.

## 6. Consequences

- The M12 graph package depends on the ontology addon for entity and source records, and on no
  legacy package.
- A future Rocksoul or Corpus adapter must first land its own typed owner in D01/D07, then be cited
  by code and SHA; it cannot write graph rows.
- The Constellation can safely expose a relation detail page because every field it renders is
  either an M10/M12 record or an explicit "unknown" state.
