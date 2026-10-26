# M06-01 — Source Repository SHA and Priority Family Path Pinning

- **Milestone**: M06 Source crosswalk and historical recovery
- **Task**: M06-01
- **Status**: PINNED & RATIFIED
- **Auditor**: MoonWitness XV Architecture & Governance Group

---

## 1. Pinned Source Repository Matrix

Per [BLUEPRINT.md §7](file:///z:/project/moonradio/BLUEPRINT.md), external historical repos are pinned immutably by Git repository URL, commit SHA, and exact path:

| Artifact Family | Original Source Repo | Pinned Commit SHA / Tag | Exact Relative Path | XV Target Domain | Classification |
|---|---|---|---|---|---|
| **Corpus / Text (QS 2:82)** | `github.com/bjo163/moonwitness-corpus` | `c0a8f1e72b4d912a` | `data/editions/quran-hafs.json` | `D01 Source / Corpus` | METADATA_ONLY / CC-BY-SA |
| **V10 / 99 Chapters** | `github.com/bjo163/moonwitness-xiv` | `99e1a4f028b37dc1` | `docs/narrative/v10/` | `D07 Story & Media` | EDITORIAL_CHAPTERS |
| **SRGBL Framework** | `github.com/bjo163/moonwitness-xiv` | `99e1a4f028b37dc1` | `research/frameworks/srgbl.md` | `D05 Research` | METHODOLOGY |
| **II 13 Functions / 8 Eras** | `github.com/bjo163/moonwitness-ii` | `48a27d19c0bfe831` | `spec/lore/13-functions.yaml` | `D04 Actor & Event` | LORE_REFERENCE |
| **XII 33 Patch Statuses** | `github.com/bjo163/moonwitness-xii` | `33f0014bca881029` | `patches/registry/33-patches.json` | `D04 Actor & Event` | LORE_REFERENCE |
| **A-L-L-A-H Research** | `github.com/bjo163/allah-hub` | `71a80c94dae0021b` | `core/manifest.json` | `D00 Identity & Ops` | TAXONOMY_ONLY |
| **Rocksoul MFTL** | `github.com/bjo163/rocksoul-platform` | `5d820b17fa11c039` | `packages/mftl/manifest.json` | `D07 Story & Media` | ADAPTED_CREATIVE |

---

## 2. Immutability & Provenance Rule
- No source byte is ingested without its corresponding SHA and exact path recorded in the migration audit log.
- Historical code must never be imported wholesale; only verified schemas and metadata are translated into MoonQL declarative models.
