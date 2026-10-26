# M05-06 — Historical Repo Adapter Boundaries

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-06
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Principle of Clean Isolation

1. **Zero Runtime Dependency on Historical Repos**:
   - XV codebase MUST NOT import or dynamically require code from XIV, Empire, or legacy scrapers at runtime.
   - Any historical corpus data is ingested purely via declarative data/seed files or explicit one-time ETL migrations into MoonQL models.

2. **Adapter Boundaries**:
   - Legacy schemas are mapped to canonical D00-D13 schemas via adapters located in isolated tooling packages (e.g. `scripts/` or `tools/`), never inside Fastify Hub or Next.js core pipelines.
   - Compatibility adapters must validate input types and scrub deprecated or non-compliant attributes.
