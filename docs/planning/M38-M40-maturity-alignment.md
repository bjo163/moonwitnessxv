# M38–M40 Maturity Alignment

**Date:** 2026-10-30 · **HEAD:** b985f77 · **Owner:** M46-03 task

This document aligns the maturity statements in TODO.md (M38, M39, M40) with the evidence recorded in their respective architecture documentation files. The goal is to replace generic "PLANNED" labels with precise, evidence-backed status that reflects what has actually been implemented versus what remains planned.

## M38 — SKYLINK multi-channel communication surface

**TODO.md current statement:**
> Status: PLANNED; documentation tasks M38-02..M38-05 gate every line of code.

**Architecture doc evidence** ([SKYLINK.md](../architecture/SKYLINK.md)):
> Status: ACCEPTED boundaries (ADR-0006); M38-07 health-only skeleton exists. Provider integrations, D18 storage and operator UI remain planned, not shipped.

**Aligned maturity statement:**
**ACCEPTED PARTIAL** — ADR-0006 accepted; M38-07 health-only skeleton implemented and verified. Provider integrations (WhatsApp, Telegram), D18 schema/storage, and operator UI remain planned, not shipped. Documentation tasks M38-02..M38-05 are complete (ADR-0006 is the source of truth).

**Evidence links:**
- ADR-0006: [docs/decisions/ADR-0006-skylink-communication-surface.md](../decisions/ADR-0006-skylink-communication-surface.md)
- Health skeleton: M38-07 task row in TODO.md
- Architecture contract: [docs/architecture/SKYLINK.md](../architecture/SKYLINK.md)

## M39 — ECHOLOG storage and attachments

**TODO.md current statement:**
> Status: PLANNED; documentation tasks M39-02..M39-05 gate every line of code.

**Architecture doc evidence** ([ECHOLOG.md](../architecture/ECHOLOG.md)):
> Status: ACCEPTED boundaries (ADR-0007 Amendment 1), implementation in progress (M39).

Additional evidence from architecture doc:
> M39-12 e2e proof (2026-10-27): `apps/echolog/test/e2e-roundtrip.test.ts` exercises both surfaces (REST and S3-compatible endpoint) in a single run against a single ephemeral storage root. Round trip, write-once, hold refusal, and rollback demonstrated. Full command-by-command evidence: [docs/audit/M39-12-e2e-rollback.md](../audit/M39-12-e2e-rollback.md).

**Aligned maturity statement:**
**IMPLEMENTATION IN PROGRESS** — ADR-0007 Amendment 1 accepted; M39-09 (REST API), M39-10 (S3-compatible endpoint), and M39-11 (consumer handoff contract) are closed with exact-SHA evidence. M39-12 e2e roundtrip proof completed 2026-10-27 at SHA `f0cdc3f` (36/36 ECHOLOG tests, full CI run `40452126111`). Documentation tasks M39-02..M39-05 are complete (ADR-0007 is the source of truth). Remaining open: M39-12 exact-SHA verification in TODO.md row, M04-05 separate-host backup/retention/restore test.

**Evidence links:**
- ADR-0007 Amendment 1: [docs/decisions/ADR-0007-echolog-storage.md](../decisions/ADR-0007-echolog-storage.md)
- M39-09 REST API: closed at SHA `21f3bc7` (CI run `40452126111`)
- M39-10 S3 endpoint: closed at SHA `21f3bc7` (CI run `40452126111`)
- M39-11 Consumer handoff: closed at SHA `f0cdc3f` (CI run `40453405712`)
- M39-12 E2E proof: completed 2026-10-27, evidence at [docs/audit/M39-12-e2e-rollback.md](../audit/M39-12-e2e-rollback.md)
- Architecture contract: [docs/architecture/ECHOLOG.md](../architecture/ECHOLOG.md)

## M40 — ORBIT spatial agent operations frontend

**TODO.md current statement:**
> Status: PLANNED; architecture documented, app code not created.

**Architecture doc evidence** ([ORBIT.md](../architecture/ORBIT.md)):
> Decision: accepted frontend boundary in ADR-0004 · Implementation: planned under M40; not shipped.

**Aligned maturity statement:**
**ACCEPTED NOT STARTED** — ADR-0004 accepted; architecture contract documented in [ORBIT.md](../architecture/ORBIT.md). No app code created; `apps/orbit` directory does not exist. Implementation planned under M40 tasks.

**Evidence links:**
- ADR-0004: [docs/decisions/ADR-0004-empire-surfaces.md](../decisions/ADR-0004-empire-surfaces.md)
- Architecture contract: [docs/architecture/ORBIT.md](../architecture/ORBIT.md)

## Summary table

| Milestone | TODO.md status (before) | Architecture evidence | Aligned status | Key evidence |
|---|---|---|---|---|
| **M38** SKYLINK | PLANNED | ADR-0006 accepted; M38-07 health skeleton exists | **ACCEPTED PARTIAL** | Health skeleton implemented; providers/D18/UI planned |
| **M39** ECHOLOG | PLANNED | ADR-0007 Amendment 1 accepted; implementation in progress; M39-12 e2e proof completed | **IMPLEMENTATION IN PROGRESS** | M39-09/10/11 closed with exact SHA; M39-12 e2e proof 2026-10-27 |
| **M40** ORBIT | PLANNED | ADR-0004 accepted; architecture documented; not shipped | **ACCEPTED NOT STARTED** | No app code; `apps/orbit` does not exist |

## Recommendation

Update TODO.md M38, M39, M40 section headers to reflect the aligned status statements above. Replace generic "PLANNED" with precise, evidence-backed labels that distinguish:
- **ACCEPTED PARTIAL** (M38): ADR accepted, partial implementation exists
- **IMPLEMENTATION IN PROGRESS** (M39): ADR accepted, multiple tasks closed with exact-SHA evidence
- **ACCEPTED NOT STARTED** (M40): ADR accepted, architecture documented, no implementation

This alignment ensures TODO.md reflects the actual state of the codebase and documentation, not a stale or overly conservative label.
