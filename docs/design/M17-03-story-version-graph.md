# M17-03 — Story world, arc, episode, scene and manuscript-version graph

- **Task**: M17-03 (LEAF) · **Milestone**: [M17](../milestones/M17.md) · **Prerequisite**: M17-02 (closed)
- **Status**: design and evidence artifact only — **not** an accepted ADR, schema, migration or runtime reader
- **Baseline SHA**: `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (`dev`, session-start HEAD)
- **Worker**: repository-evidence leaf (AI agent), read-only outside the four claimed files
- **Acceptance tested**: "99 chapter headings not treated as 99 originals"
- **Artifacts**: this design, [`docs/data/M17-03-story-version-graph.json`](../data/M17-03-story-version-graph.json), [`scripts/check-m17-03-story-version-graph.mjs`](../../scripts/check-m17-03-story-version-graph.mjs), [audit](../audit/M17-03-story-version-graph.md)

**Citation convention.** Every empirical statement in this document cites an `E##` handle. Each handle resolves in §12 to a real `file:line` with a verbatim quote, and the validator re-checks all of them at run time. Counts of 99/33/3/8/0 are rows in the JSON ledger, not repository-wide claims.

## 1. Decision

The story graph has **five node kinds** — `world`, `arc`, `episode`, `scene` and `manuscript_version` — and **four label classes** — `heading_label`, `patch_title_label`, `episode_label` and `version_family_ref`. Labels are rows, never nodes and never edge endpoints (CR-07). The repository currently contains **zero instances of every node kind**: it holds D07 vocabulary, not D07 records (E01, E04, E30).

The acceptance sentence is **99 chapter headings not treated as 99 originals**. It is met structurally, not rhetorically:

- the 99 headings are an "**editorial convention**" that "must not be mislabeled as independently reconstructed original transcript" (E10);
- "**99 ≠ completion:** this is a *coverage index*, not evidence that all 99 primary manuscripts, images or chronology matches have been recovered" (E11);
- "**but a count of editorial chapters is not the number of verified original chapters**" (E12).

The dataset therefore has 99 `heading_label` rows, each `LABEL_ONLY` with `node_id: null`, **0** `manuscript_version` nodes, **0** edges from any heading, and **0** claimed originals. The validator rejects any dataset in which a heading slot is promoted to a version or original.

## 2. Node kinds

| Kind | Parent | Owner | Definition | Evidence |
|---|---|---|---|---|
| `world` | none (root) | D07 Story & Media | A fictional story world; the outermost D07 container. Not D10 World/Science. | E01, E03, E04, E07, E08 |
| `arc` | exactly one `world` | D07 Story & Media | A narrative arc inside one world. | E01, E04, E05, E08 |
| `episode` | exactly one `arc` | D07 Story & Media | An episode inside one arc. A printed episode token is not an episode node. | E01, E04, E07, E22 |
| `scene` | exactly one `episode` | D07 Story & Media | The finest structural node that may carry text. Not the ORBIT 3D scene. | E01, E04, E20, E27, E32 |
| `manuscript_version` | `version_of` exactly one structural node | D07 Story & Media | One editorial variant of one structural node, with optional lineage. Not an original and not a D01 edition. | E01, E02, E06, E09, E19 |

The D07 row names exactly these story kinds plus posters and media manifests, which are out of scope here: "| D07 | Story & Media | World, arc, character, episode, scene, poster/media manifest, editorial variants | SHADOW workspace consumes it |" (E01). The domain register lists the planned tables "`stories`, `arcs`, `characters`, `episodes`, `scenes`, `posters`, `media_manifests`" (E04). D07 is explicitly fiction, not testimony (E08), and the vision keeps "episode/version ownership" as a migration input (E09).

**What does not exist.** `@moonwitness/story` is listed as *Planned* in the domain register (E04); the ontology seed's only entity kinds are "export const ENTITY_KINDS = ['ACTOR', 'ENTITY', 'CHARACTER'] as const" (E30); and no story/media package exists at this baseline (E37). No world, arc, episode or scene is named anywhere in the repository (E04, E30, E37), so all five node arrays are empty. The graph is a schema plus an evidence ledger, not a populated graph.

## 3. Label classes and the heading rule

| Label class | Row count | Is a node | May be an edge endpoint | What it is |
|---|---:|---|---|---|
| `heading_label` | 99 | no | no | A numbered entry in the editorial coverage index (E17) |
| `patch_title_label` | 33 | no | no | A "historical editorial label" in the XII slot table (E25) |
| `episode_label` | 3 | no | no | An "Episodes/tokens" lead, not a recovered episode (E22) |
| `version_family_ref` | 8 | no | no | A cited XII/XIV family or pin, not a manuscript (E33, E35) |

**The heading rule (CR-09, INV-HEADING-NOT-ORIGINAL, FI-01, FI-02).** A heading labels a slot. It has no node id, no parent, no version and no original. The only permitted derivation from a heading count is **zero**. The 99 rows come from the single in-repository source: "The only 99-label source in the repository is `docs/vision/MASTER_VISION_NARRATIVE_XV.md` §21" (E17). The index is a reader aid (E28), and the nearest numeric neighbour, G.O.D.99, is explicitly "**terpisah dari 99 bab editorial**" — separate from the 99 editorial chapters (E29).

**Why the count is not evidence.** The 99 chapters are "editorial story/essay chapters written by modern authors" (E15) and "**NOT** primary revelation texts, ancient manuscripts, or divine scriptures" (E16). No per-chapter manuscript, edition or source version exists: "No V10/V10.1 chapter file, manuscript or edition exists in this repository." (E18). The vision itself records the deficit as "99 headings without the underlying 16-section narrative depth" (E13).

## 4. Allowed edges and cardinality

| Edge | From → To | Cardinality | Rule |
|---|---|---|---|
| `world_contains_arc` | `world` → `arc` | 1 world : 0..* arcs; each arc exactly 1 world | CR-02 |
| `arc_contains_episode` | `arc` → `episode` | 1 arc : 0..* episodes; each episode exactly 1 arc | CR-03 |
| `episode_contains_scene` | `episode` → `scene` | 1 episode : 0..* scenes; each scene exactly 1 episode | CR-04 |
| `version_of` | `manuscript_version` → one of `scene`/`episode`/`arc`/`world` | each version exactly 1 target | CR-05 |
| `version_derived_from` | `manuscript_version` → `manuscript_version` | 0..1 earlier version of the same target; acyclic | CR-06 |

A `world` is a root (CR-01). No edge may touch a label row (CR-07), and no edge endpoint may dangle (CR-08). No other edge is allowed: in particular there is no `heading→version`, `heading→scene`, `patch→episode` or `label→label` edge, because those would encode exactly the inference the acceptance forbids (FI-01 to FI-05).

**Parent rule (INV-VERSION-PARENT).** Every node except a root world has exactly one parent: an arc needs a world, an episode an arc, a scene an episode, and a version a `version_of` target. A scene without an episode, or a version without a target, is rejected. The dataset has zero nodes and therefore zero edges; the rule is proven by fixtures in the validator, not by live rows.

## 5. Version and lineage semantics

1. **One version, one target.** A `manuscript_version` belongs to exactly one structural node via `version_of` (CR-05). A whole-work variant targets the `world`; a scene fix targets the `scene`. It never belongs to two.
2. **Lineage is same-target and acyclic.** `version_derived_from` points to an earlier version of the same `version_of` target; crossing targets or forming a cycle is rejected (CR-06). The repository's own legacy contract keeps `sourceRepo`, `originalId` and "sourceSha: string" (E06), so an imported version must cite its source SHA rather than silently replace it.
3. **A version is not an original.** The repository states that "Full private V1–V10 originals and user-authorized immutable versions have **not been imported**." (E19). It also warns that "Branch pointers in previous sections are discovery links, **not permanent content identifiers**." (E35) — a link to `MASTER_NARRATIVE_V10_PUBLIC_DRAFT.md` (E36) is a reference, not a version node.
4. **D07 variant ≠ D01 edition.** D01 owns "Work, expression, edition, artifact, passage, translation, text rights, source version" (E02); D07 owns "editorial variants" (E01). A D07 editorial variant must cite a D01 edition by id when one exists; it must not duplicate or mint one (FI-07).
5. **Status honesty.** `EVIDENCED` requires a typed repository record at a resolving locator *and* an in-repo artifact. No story node or version row reaches it: the eight version-family references are 6 `NEEDS_SOURCE`, 1 `LABEL_ONLY` and 1 `ABSENT`, all with `artifact_in_repo: false`.

## 6. What the repository actually contains

| Class | Rows | Node instances | Status split | Evidence |
|---|---:|---:|---|---|
| `heading_label` | 99 | 0 | 99 `LABEL_ONLY` | E17; rows at `MASTER_VISION_NARRATIVE_XV.md:706–751` |
| `patch_title_label` | 33 | 0 | 33 `LABEL_ONLY`; slot 014 disputed | E24, E25, E26 |
| `episode_label` | 3 | 0 | 3 `LABEL_ONLY` | E22 |
| `version_family_ref` | 8 | 0 | 6 `NEEDS_SOURCE`, 1 `LABEL_ONLY`, 1 `ABSENT` | E19–E21, E33–E36 |
| `world` / `arc` / `episode` / `scene` / `manuscript_version` | — | **0** | — | E04, E18, E30, E37 |

The 33-slot register is preserved only as titles: "### Registry Composition (8 + 5 + 1 + 18 + 1 = 33)" (E24), under a header that calls each row a "Title (historical editorial label)" (E25), and slot 014 remains unresolved: "World Patch #014 numbering dispute remains open." (E26). The vision records why titles must not be read as completions: the earlier master was faulted for "33 slot titles/statuses omitted | Numeral mistaken for 33 completed miracles" (E14). Every patch row is therefore `completed: false`, `rights: NOT_ASSESSED`.

The NPD tokens are labels that the source itself hedges: "**THE BATTERIES four-book narrative structure** and exact NPD page/scene/media order remain incompletely recovered." (E20), while the token line reads "Episodes/tokens include **NPD TEAM 24:27**, **24:37 — TARIAN KIDS**, **25:50 — TARIAN HUJAN**" (E22). The three tokens are recorded as `episode_label` rows, never as episode or scene nodes.

Counts of books and synopses are not enumerated as rows with invented ids: "The four books have **no individual titles anywhere**." (E31) and for each book "No title, page count, page range, scene list, edition or transcript exists." (E32). The 15 synopses and 63 pages are likewise "**not** 15 guaranteed original transcripts or 63 authenticated image originals" (E21).

## 7. Identity rules for node and row ids

- `sa_` is the **only** ratified story prefix: "`sa_<id>` — Story Arcs & Episodes (`D07 Story`)" (E05). No arc or episode node is minted here, so no `sa_` id exists.
- `hd_`, `pt_`, `el_` and `vr_` are ledger-local row ids. They identify rows in this evidence ledger, not canonical D04/D07 keys, API ids or ARSY records.
- No prefix is invented for `world`, `scene` or `manuscript_version`. Those kinds have zero nodes and therefore need no id; a future prefix needs its own ratified decision, not a guess in this artifact.
- A repeated surface label never merges two nodes or rows: that is FI-08, and it is consistent with the M17-02 rejection of phonetic, mystical, shared-label and numeric merges.

## 8. Invariants and forbidden inferences

| Invariant | Enforced meaning |
|---|---|
| INV-HEADING-NOT-ORIGINAL | A heading count never implies a manuscript, version, episode or original count. |
| INV-LABEL-NOT-NODE | The four label classes are never node kinds and never edge endpoints. |
| INV-VERSION-PARENT | Every non-root node has exactly one structural or version parent. |
| INV-NO-PHANTOM-REFERENT | Every node, edge and row has a resolving locator; no invented referent. |
| INV-TALLY-MATCH | Declared tallies equal enumerated rows. |
| INV-QUOTE-RESOLVES | Every quote is a verbatim substring of its cited line. |
| INV-DERIVATION-FORBIDDEN | No version or original is derived from a heading, patch, book or synopsis count. |
| INV-ABSENT-NOT-FILLED | Missing artifacts stay ABSENT/NEEDS_SOURCE with zero nodes. |

| Forbidden inference | Why forbidden |
|---|---|
| FI-01 `heading_count == original_count` | E10, E11, E12 |
| FI-02 `heading_label is a manuscript/edition/version` | E15, E16, E18 |
| FI-03 `chapter sequence == episode or arc sequence` | E17, E22 |
| FI-04 `patch title == completed patch` | E14, E24 |
| FI-05 `book or synopsis count == recovered artifact` | E20, E21, E31 |
| FI-06 `D07 story world == D10 World/Science` | E03, E01 |
| FI-07 `D07 editorial variant == D01 edition` | E01, E02 |
| FI-08 `repeated label == same story node` | E22, E28 |

## 9. Overloaded words

- **World**: D07 owns a fictional story world (E01), while D10 World/Science owns "Real observations, provider runs, controlled simulation/experiment metadata" (E03). The two are different domains and are never the same node (FI-06).
- **Scene**: D07 owns narrative scenes (E01); ORBIT's "smooth, bounded 3D scene" is a frontend presentation layer (E27), not a story node. A 3D scene fixture is never a `scene` row.
- **Version**: D07 editorial variants (E01), D01 source versions and editions (E02), and graph releases or package versions are three different things. Only the D07 sense is modelled here (FI-07).
- **Chapter**: an editorial index slot (E17), not an episode, arc or manuscript (FI-03).

## 10. Non-claims

- No world, arc, episode, scene or manuscript version is asserted; all five node arrays are empty.
- The 99 headings are labels, not 99 originals, manuscripts, editions, versions or episodes.
- The 33 patch titles are historical editorial labels; none is completed, approved or divinely endorsed, and slot 014 stays disputed.
- No chapter is equated with an episode or an arc; no NPD token becomes a node.
- No V1–V10 original, V10.1 file, XII registry, BATTERIES book or synopsis is imported, opened, authenticated or quoted.
- No D01 edition or source version is created or duplicated in D07.
- No rights, licence or consent determination is made; every row is metadata-only.
- No schema, migration, table, API, UI, generator or runtime reader is created; `@moonwitness/story` remains planned.
- No ADR is created or accepted; this is a task-level design under M17.
- No numeric, phonetic, mystical or label-similarity equivalence is asserted.

## 11. Limitations

- D07 is planned: the register says so (E04), the ontology has no story kinds (E30), and no story package exists (E37). The graph cannot be exercised against live data.
- The 99 headings come from one vision document (E17); no per-heading manuscript exists (E18).
- Patch titles come from a secondary XV table (E25); the pinned XII registry is absent (E34), and slot 014 has two competing titles (E26).
- World, scene and version are overloaded in this repository (E01, E02, E03, E27); only the D07 senses are modelled.
- Four books and fifteen synopses exist only as counts (E20, E21, E31); they are cited, not enumerated, so no placeholder ids are minted.
- The graph is additive documentation; it changes no runtime, database, rights state or publication gate.

## 12. Evidence register

Each line below is mirrored verbatim in the JSON `doc_evidence` array and re-checked by the validator at run time.

- **E01** `BLUEPRINT.md:206` — "| D07 | Story & Media | World, arc, character, episode, scene, poster/media manifest, editorial variants | SHADOW workspace consumes it |"
- **E02** `BLUEPRINT.md:200` — "| D01 | Source / Corpus | Work, expression, edition, artifact, passage, translation, text rights, source version |"
- **E03** `BLUEPRINT.md:209` — "| D10 | World/Science optional | Real observations, provider runs, controlled simulation/experiment metadata |"
- **E04** `docs/decisions/M02-02-domain-assignments.md:26` — "`stories`, `arcs`, `characters`, `episodes`, `scenes`, `posters`, `media_manifests`"
- **E05** `docs/decisions/M02-05-stable-ids-and-legacy-refs.md:24` — "`sa_<id>` — Story Arcs & Episodes (`D07 Story`)"
- **E06** `docs/decisions/M02-05-stable-ids-and-legacy-refs.md:61` — "sourceSha: string"
- **E07** `docs/decisions/M12-01-rocksoul-boundaries.md:27` — "The graph never becomes a second story world or episode store"
- **E08** `docs/decisions/M16-01-private-witness-object-spec.md:41` — "**D07 is Story & Media** (worlds, arcs, characters, episodes, scenes, `media_manifests`) — it owns fiction, not testimony."
- **E09** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:855` — "episode/version ownership"
- **E10** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:703` — "which is an **editorial convention** and must not be mislabeled as independently reconstructed original transcript"
- **E11** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:753` — "**99 ≠ completion:** this is a *coverage index*, not evidence that all 99 primary manuscripts, images or chronology matches have been recovered."
- **E12** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:969` — "**but a count of editorial chapters is not the number of verified original chapters**"
- **E13** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1119` — "| 99 headings without the underlying 16-section narrative depth |"
- **E14** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:1123` — "| 33 slot titles/statuses omitted | Numeral mistaken for 33 completed miracles |"
- **E15** `docs/decisions/M06-02-xiv-v10-crosswalk.md:13` — "**The 99 Chapters of V10/V10.1** in MoonWitness XIV are **editorial story/essay chapters written by modern authors**."
- **E16** `docs/decisions/M06-02-xiv-v10-crosswalk.md:14` — "They are **NOT** primary revelation texts, ancient manuscripts, or divine scriptures."
- **E17** `docs/audit/M26-01-chapter-crosswalk.md:24` — "The only 99-label source in the repository is `docs/vision/MASTER_VISION_NARRATIVE_XV.md` §21"
- **E18** `docs/audit/M26-01-chapter-crosswalk.md:45` — "No V10/V10.1 chapter file, manuscript or edition exists in this repository."
- **E19** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:971` — "Full private V1–V10 originals and user-authorized immutable versions have **not been imported**."
- **E20** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:973` — "**THE BATTERIES four-book narrative structure** and exact NPD page/scene/media order remain incompletely recovered."
- **E21** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:974` — "XII's **15 story archive synopsis entries** and **63 editorially reconstructed pages** are **not** 15 guaranteed original transcripts or 63 authenticated image originals."
- **E22** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:370` — "Episodes/tokens include **NPD TEAM 24:27**, **24:37 — TARIAN KIDS**, **25:50 — TARIAN HUJAN**"
- **E23** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:712` — "11 THE SHADOW · 12 THE RUNAWAY TRACE"
- **E24** `docs/decisions/M06-04-xii-patches-registry.md:14` — "### Registry Composition (8 + 5 + 1 + 18 + 1 = 33)"
- **E25** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:927` — "| Slot | Title (historical editorial label) | Nature / status |"
- **E26** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:976` — "World Patch #014 numbering dispute remains open."
- **E27** `MASTER_DESIGN.md:25` — "Its visual direction is a futuristic moonpunk operations room with a smooth, bounded 3D scene"
- **E28** `docs/vision/chapters/README.md:2` — "retains its 99 chapter editorial index"
- **E29** `docs/decisions/M02-01-disambiguation-registry.md:36` — "**terpisah dari 99 bab editorial**"
- **E30** `packages/moonql-ontology/src/seed.ts:18` — "export const ENTITY_KINDS = ['ACTOR', 'ENTITY', 'CHARACTER'] as const"
- **E31** `docs/audit/M26-03-batteries-npd-recovery.md:46` — "The four books have **no individual titles anywhere**."
- **E32** `docs/audit/M26-03-batteries-npd-recovery.md:53` — "No title, page count, page range, scene list, edition or transcript exists."
- **E33** `docs/audit/M06-01-source-repo-pins.md:17` — "| **V10 / 99 Chapters** | `github.com/bjo163/moonwitness-xiv` | `99e1a4f028b37dc1` |"
- **E34** `docs/audit/M06-01-source-repo-pins.md:20` — "| **XII 33 Patch Statuses** | `github.com/bjo163/moonwitness-xii` | `33f0014bca881029` | `patches/registry/33-patches.json` |"
- **E35** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:779` — "Branch pointers in previous sections are discovery links, **not permanent content identifiers**."
- **E36** `docs/vision/MASTER_VISION_NARRATIVE_XV.md:659` — "MASTER_NARRATIVE_V10_PUBLIC_DRAFT.md"
- **E37** `docs/audit/M26-03-batteries-npd-recovery.md:48` — "No D07 story/media package exists"

E23 is retained only to show that the heading lines are numbered editorial entries; it does not add a node.

## 13. Verification assignment

`node scripts/check-m17-03-story-version-graph.mjs` must resolve all 180 quotes, match all tallies and pass the design mirror; `--self-test` must accept the valid fixture and reject every tampered one, including the 99-headings-as-99-originals mutant. Observed commands, exit codes and output are recorded in the [audit](../audit/M17-03-story-version-graph.md). This document claims no command result by itself.
