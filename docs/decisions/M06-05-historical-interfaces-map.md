# M06-05 — Inventory of Corpus, Empire, A-L-L-A-H, and Rocksoul Interfaces

- **Milestone**: M06 Source crosswalk and historical recovery
- **Task**: M06-05
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Owner & Compatibility Map

Bulk code imports from legacy systems are strictly forbidden. Interfaces are translated into MoonQL declarative schemas:

| System / Subsystem | Historical Role | XV Domain Owner | Integration Strategy |
|---|---|---|---|
| **Corpus / RGBL** | Sacred text parsing & linguistic analysis | `D01 Source / Corpus` | Declarative schema for Work/Expression/Edition/Passage |
| **Empire (14 Systems)** | 14 Microservices proposal | `D00–D13 Taxonomies` | Domain vocabulary; consolidated in monorepo |
| **A-L-L-A-H Hub** | Accountable Life, Learning & Action | `D00 Identity & Ops` | Disambiguated acronym taxonomy only |
| **Rocksoul MFTL / Platform** | Story arc & creative audio-visuals | `D07 Story & Media` | Creative story manifests and media links |

---

## 2. Ingestion Gate
- All incoming interfaces must be reviewed for API compatibility and security.
- Data from these systems will be ingested as static seed/data rows adhering to MoonQL typed contracts.
