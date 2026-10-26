# M38/M39 register and ADR ratification evidence

**Result SHA:** `8cdb760ed8a3107b2c1ca620701758cd770015af`
**Source contract SHA:** `71122e01acbabcc20822c8bd9dabaa4cd188a0db`
**Date:** 2026-10-27 · **Reviewer:** root integrator

## Register arithmetic

The committed `TODO.md` contains 338 unique task IDs: 267 retained M00–M28 IDs, 45 M29–M37 IDs, 14 M38 IDs, and 12 M39 IDs. M38-only arithmetic is 326 IDs (139 checked, 187 open); M39 adds 12 unchecked IDs for 338 (139 checked, 199 open), excluding the separately scoped M18-01 closure. The M04-05 row remains unchecked and only records the owner's deferral until an S3-compatible target is available.

At `8cdb760`, the final register has 338 unique rows, 154 checked and 184 open: the separate M18-01 closure adds one check, Cockpit M19-26..M19-30 adds five, and the nine M38/M39 document/skeleton deliverables add nine. No task ID was removed or duplicated.

## ADR evidence

- The owner directly confirmed M38 and ADR-0006 in this Codex work session, and later directly confirmed M39 and ADR-0007 in this session.
- ADR-0006 and ADR-0007 are listed as accepted in `docs/decisions/README.md` at `8cdb760`; ADR-0004 remains the only proposed ADR.
- ADR-0006 records WhatsApp before Telegram, the single second SQL owner `packages/skylink-store` for D18, and the bounded-service/security conditions.
- ADR-0007 records stateless D19 object storage, the closed SQL-owner set, the `sha256/<digest>` write-once model, `fs` then S3 driver order, and no implementation authorization by acceptance alone.
- Both ADRs preserve the registry entries' proposed/unassigned status and authority limits; neither assigns an office or access authority.

## Commands and result

- `git show 8cdb760:TODO.md` plus a PowerShell count of canonical task rows and unique task IDs — 338 rows, 338 unique, 154 checked, 184 open.
- `git show 8cdb760:docs/decisions/README.md` — ADR-0006 and ADR-0007 appear under ACCEPTED; ADR-0004 alone appears under PROPOSED.
- Scoped TODO diff review — 14 M38 rows and 12 M39 rows all have packet links; M39 adds exactly 12 open rows to the M38 stage. Separate M18-01 and M04-05 edits are not attributed to M38/M39 additions.

The source implementation and design evidence for M38-03..M38-05, M38-07 and M39-03..M39-05 is recorded in [the contract and skeleton report](M38-M39-docs-and-skylink-skeleton-71122e0.md).

## Limitations

This report closes only the ADR ratification and TODO register tasks M38-01, M38-02, M39-01 and M39-02 at the recorded exact source SHA. M38-06 and M39-06 are subsequent implementation work; no messaging provider, D18 store, ECHOLOG storage driver, bucket, or deployment is claimed.
