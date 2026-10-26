# M06-06 — License, Privacy, Consent and Missing Media Classification

- **Milestone**: M06 Source crosswalk and historical recovery
- **Task**: M06-06
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Legal & Security Group

---

## 1. Classification Framework

Every ingested historical artifact must carry clear licensing and rights metadata:

| Rights Class | Meaning | Storage Policy |
|---|---|---|
| `RIGHTS_EXACT_VERSION_CLEARED` | Public domain or explicitly licensed under CC-BY / MIT / Apache 2.0 | Stored and served openly |
| `RIGHTS_UNKNOWN` | License or provenance cannot be confirmed with certainty | Restricted to `METADATA_ONLY`; text content flagged `NEEDS_SOURCE` |
| `PRIVATE_WITNESS` | User testimonies or private personal observations | Strictly private, encrypted, or pseudonymized per M03-06 |
| `MISSING_MEDIA` | Audio stream, zine poster, or image asset URL dead / unreachable | Flagged `SOURCE_MISSING`; placeholder with descriptive attribution |

---

## 2. Invariant Gate
No asset with `RIGHTS_UNKNOWN` may be exposed on public endpoints or committed as raw media bytes into the public Git repository.
