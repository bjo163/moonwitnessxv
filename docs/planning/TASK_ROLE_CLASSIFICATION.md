# Task Role Classification Registry (M29-01)

**Canonical reference:** [TODO.md](../../TODO.md) · [AI execution contract](AI_EXECUTION_CONTRACT.md).
**Review baseline SHA:** `7c739c6e4ce14590b6f8511d3120016510fd01c9`
**Date:** 2026-10-27 · **Task ID:** `M29-01`

---

## 1. Register Overview & Totals

At the original M29-01 review baseline, the register contained **42 milestones** and **360 unique task IDs**; those counts are historical.
- **LEAF Tasks (339):** Discrete, atomic deliverables implemented and evidenced at an exact git SHA with focused positive/negative tests.
- **UMBRELLA Tasks (21):** Roll-up milestones or composite gates that group multiple constituent microtasks. An umbrella task is **never** claimed as a standalone code implementation leaf. It is only closed when all child leaves pass their respective acceptance criteria and the parent DoD is met.

```
Historical unique tasks : 360
├── LEAF Tasks     : 339 (94.17%)
└── UMBRELLA Tasks :  21 ( 5.83%)
    ├── M19 (Frontend & A11y)      : 7 (M19-01 .. M19-07)
    ├── M27 (Release & Full-stack) : 7 (M27-01 .. M27-07)
    └── M28 (ARSY Hub Migration)   : 7 (M28-01 .. M28-07)
```

---

**TODO at the 2026-10-30 pre-registration snapshot:** 46 milestones, 393 IDs (372 LEAF / 21 UMBRELLA), 334 checked, 59 unchecked. **At V5 registration:** 51 milestones, 493 IDs (472 LEAF / 21 UMBRELLA), 334 checked, 159 unchecked. **At HEAD ad96dbf3ae98731e7c10972d7f0600b809398e9d (historical snapshot, 2026-10-30):** 51 milestones, 493 IDs, 335 checked, 158 unchecked after M20-06 closed; all 100 V5 candidate leaves remain unchecked. **At HEAD ca395d1 (2026-10-30):** 52 milestones, 499 IDs, 347 checked, 152 unchecked. Their role mapping is unchanged. See [TODO](../../TODO.md) and the [crosswalk matrix](../research/unified-100-issue-frontier-v5/ISSUE_MASTER_MATRIX.md).

## 2. Parent-to-Child Umbrella Mappings

| Umbrella Task | Title | Constituent Child Leaves |
|---|---|---|
| **M19-01** | MoonUI core design system | `M19-08`, `M19-09`, `M19-10`, `M19-11` |
| **M19-02** | Accessibility & WCAG AA standards | `M19-12`, `M19-13`, `M19-14`, `M19-15` |
| **M19-03** | Bilingual id/en UI layout parity | `M19-16`, `M19-17`, `M19-18`, `M19-19` |
| **M19-04** | Headquarters & Dock responsive shells | `M19-20`, `M19-21`, `M19-22`, `M19-23` |
| **M19-05** | Form controls, modals & focus traps | `M19-24`, `M19-25`, `M19-26`, `M19-27` |
| **M19-06** | Audio player & streaming interfaces | `M19-28`, `M19-29`, `M19-30`, `M19-31` |
| **M19-07** | Visual regression & theme consistency | `M19-32`, `M19-33`, `M19-34`, `M19-35` |
| **M27-01** | Full-stack production readiness | `M27-08`, `M27-09` |
| **M27-02** | Multi-service integration validation | `M27-10`, `M27-11` |
| **M27-03** | End-to-end security & ACL compliance | `M27-12` |
| **M27-04** | Performance, latency & load verification | `M27-13`, `M27-14` |
| **M27-05** | Disaster recovery & data restoration | `M27-15`, `M27-16` |
| **M27-06** | Production telemetry & log hygiene | `M27-17`, `M27-18` |
| **M27-07** | Human launch approval & final go/no-go | `M27-19` |
| **M28-01** | ARSY Hub identity inventory | `M28-08`, `M28-09` |
| **M28-02** | Fastify & MoonQL compatibility verification | `M28-08`, `M28-09` |
| **M28-03** | Runtime directory & package rename | `M28-10` |
| **M28-04** | Docker & Compose runner migration | `M28-11` |
| **M28-05** | Environment variable & DNS aliases | `M28-12` |
| **M28-06** | ARSY cross-service regression matrix | `M28-13`, `M28-14` |
| **M28-07** | Deployment compatibility & ADR closure | `M28-15` |

---

## 3. Milestone Summary Matrix

| Milestone | Group | Tasks | Umbrella IDs | Leaf IDs | Role Notes |
|---|---|---|---|---|---|
| **M00** | G0 Foundation | 7 | None | `M00-01` .. `M00-07` | All LEAF |
| **M01** | G0 Foundation | 7 | None | `M01-01` .. `M01-07` | All LEAF |
| **M02** | G0 Foundation | 7 | None | `M02-01` .. `M02-07` | All LEAF |
| **M03** | G0 Foundation | 7 | None | `M03-01` .. `M03-07` | All LEAF |
| **M04** | G0 Foundation | 7 | None | `M04-01` .. `M04-07` | All LEAF |
| **M05** | G0 Foundation | 23 | None | `M05-01` .. `M05-23` | All LEAF |
| **M06** | G1 Source Corpus | 7 | None | `M06-01` .. `M06-07` | All LEAF |
| **M07** | G1 Source Corpus | 7 | None | `M07-01` .. `M07-07` | All LEAF |
| **M08** | G1 Source Corpus | 7 | None | `M08-01` .. `M08-07` | All LEAF |
| **M09** | G1 Source Corpus | 7 | None | `M09-01` .. `M09-07` | All LEAF |
| **M10** | G1 Source Corpus | 7 | None | `M10-01` .. `M10-07` | All LEAF |
| **M11** | G1 Source Corpus | 7 | None | `M11-01` .. `M11-07` | All LEAF |
| **M12** | G2 Research & Lexicon | 7 | None | `M12-01` .. `M12-07` | All LEAF |
| **M13** | G2 Research & Lexicon | 7 | None | `M13-01` .. `M13-07` | All LEAF |
| **M14** | G2 Research & Lexicon | 7 | None | `M14-01` .. `M14-07` | All LEAF |
| **M15** | G2 Research & Lexicon | 7 | None | `M15-01` .. `M15-07` | All LEAF |
| **M16** | G2 Research & Lexicon | 7 | None | `M16-01` .. `M16-07` | All LEAF |
| **M17** | G3 Creative Story | 7 | None | `M17-01` .. `M17-07` | All LEAF |
| **M18** | G3 Creative Story | 7 | None | `M18-01` .. `M18-07` | All LEAF |
| **M19** | G3 Frontend & UI | 35 | `M19-01` .. `M19-07` (7) | `M19-08` .. `M19-35` (28) | 7 Umbrellas refined by 28 Leaves |
| **M20** | G4 Operations | 7 | None | `M20-01` .. `M20-07` | All LEAF |
| **M21** | G4 Operations | 7 | None | `M21-01` .. `M21-07` | All LEAF |
| **M22** | G4 Operations | 7 | None | `M22-01` .. `M22-07` | All LEAF |
| **M23** | G4 Operations | 7 | None | `M23-01` .. `M23-07` | All LEAF |
| **M24** | G5 Optional Research | 7 | None | `M24-01` .. `M24-07` | All LEAF |
| **M25** | G5 Optional Research | 7 | None | `M25-01` .. `M25-07` | All LEAF |
| **M26** | G5 Optional Research | 7 | None | `M26-01` .. `M26-07` | All LEAF |
| **M27** | G6 Release | 19 | `M27-01` .. `M27-07` (7) | `M27-08` .. `M27-19` (12) | 7 Umbrellas refined by 12 Leaves |
| **M28** | G0/T2 ARSY Rename | 15 | `M28-01` .. `M28-07` (7) | `M28-08` .. `M28-15` (8) | 7 Umbrellas refined by 8 Leaves |
| **M29** | G7 AI Execution | 5 | None | `M29-01` .. `M29-05` | All LEAF |
| **M30** | G7 Ecosystem | 5 | None | `M30-01` .. `M30-05` | All LEAF |
| **M31** | G7 Ecosystem | 5 | None | `M31-01` .. `M31-05` | All LEAF |
| **M32** | G7 Ecosystem | 5 | None | `M32-01` .. `M32-05` | All LEAF |
| **M33** | G7 Ecosystem | 5 | None | `M33-01` .. `M33-05` | All LEAF |
| **M34** | G7 Ecosystem | 5 | None | `M34-01` .. `M34-05` | All LEAF |
| **M35** | G7 Ecosystem | 5 | None | `M35-01` .. `M35-05` | All LEAF |
| **M36** | G7 Ecosystem | 5 | None | `M36-01` .. `M36-05` | All LEAF |
| **M37** | G7 Ecosystem | 5 | None | `M37-01` .. `M37-05` | All LEAF |
| **M38** | G4 SKYLINK | 14 | None | `M38-01` .. `M38-14` | All LEAF |
| **M39** | G4 ECHOLOG | 12 | None | `M39-01` .. `M39-12` | All LEAF |
| **M40** | G7 ORBIT | 10 | None | `M40-01` .. `M40-10` | All LEAF |
| **M41** | G7 LUMEN | 12 | None | `M41-01` .. `M41-12` | All LEAF |
| **M42** | G7 Empire Story Universe | 2 | None | `M42-01` .. `M42-02` | All LEAF |
| **M43** | G7 MoonUI skin | 4 | None | `M43-01` .. `M43-04` | All LEAF |
| **M44** | G7 Domain cutover | 9 | None | `M44-01` .. `M44-09` | All LEAF |
| **M45** | G7 Story Universe fidelity | 15 | None | `M45-01` .. `M45-15` | All LEAF |
| **M46** | G7 Engineering candidates | 32 | None | `M46-01` .. `M46-32` | All LEAF; maps to ENG candidate IDs |
| **M47** | G7 Frontier candidates | 30 | None | `M47-01` .. `M47-30` | All LEAF; maps to FUT candidate IDs |
| **M48** | G7 WORKS candidates | 8 | None | `M48-01` .. `M48-08` | All LEAF; maps to ECO candidate IDs |
| **M49** | G7 HARBOR candidates | 10 | None | `M49-01` .. `M49-10` | All LEAF; maps to CHAR candidate IDs |
| **M50** | G7 Ontology candidates | 20 | None | `M50-01` .. `M50-20` | All LEAF; maps to ONT candidate IDs |

---

## 4. Multi-Agent Task Claim Invariants

1. **Leaf Exclusivity:** An autonomous agent or developer claiming work must claim an atomic `LEAF` task that exists in the current `TODO.md`, with all predecessors satisfied. `validateTaskClaim` rejects unknown task IDs before accepting the claim.
2. **Umbrella Non-Execution:** No agent may claim an `UMBRELLA` task ID as an implementation target.
3. **No Dual Parent-Child Claim:** A parent umbrella and its constituent child leaves must never be assigned simultaneously to execute or implement the same code path twice.
4. **Integration Gate:** Only the root integrator closes an umbrella task when all child deliverables have exact-SHA evidence and human review.
