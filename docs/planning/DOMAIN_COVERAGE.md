# Full vision-to-work coverage index (not independent task status)
[Vision](../vision/MASTER_VISION_NARRATIVE_XV.md) → [Blueprint](../../BLUEPRINT.md) → [Master Design](../../MASTER_DESIGN.md) → [ADRs](../decisions/README.md) → [TODO](../../TODO.md) → exact SHA tests.

D00 foundation/auth M00–05/M29/M37; D01–04 Corpus/UNILEX/ontology M06–12; D05 Research M13–15/M34; D06 private witness M16; D07 story SHADOW M17/M33; D08 publication/rights M18/M20; D09 Radio M22/M28; D10 World/Time/Science M24–25/M36; D11 Journey M23; D12 optional AI M21; D13 MoonUI/global i18n M05/M19/M30; proposed D14 Harbor M32; proposed D15/D16 WORKS M35 (ISP vertical mapped by ADR-0018); proposed D17 HELIOGRID M36; accepted D20 ISP/network technical operations M51; Lighthouse M31; preview/full release M27. Unverified 25 Amanah originals, rights, live revenue, domain DNS and measured energy remain UNKNOWN.


## Cross-domain candidate coverage (M46–M50)

| TODO milestones | Existing domain and authority | Boundary |
|---|---|---|
| M46 engineering | D00–D17, mapped per task to existing package/service owners | No new platform/data owner. SKYLINK stays D18 control plane; ECHOLOG stays stateless D19 object storage; ARSY stays the Hub. |
| M47 frontier | Existing D05 research, D12 optional AI, corpus/graph/UX and privacy owners | Synthetic/approved fixtures first; M21/security and rights gates remain; no autonomous authority or production integration. |
| M48 economy | Existing WORKS D15/D16 and M35 owner | No merchant, payment, SQL, ledger, revenue or buyer assumption is created; retain M35 gates. |
| M49 humanitarian | Existing HARBOR D14/M32, D03 privacy and D08 rights/publication owners | No beneficiary intake, outreach, sensitive-data collection or fund handling without authority and consent. |
| M50 ontology | Existing D01–D05 corpus/research/ontology, D06 witness, D08 rights/publication and D13 reader owners | Preserve edition/provenance/uncertainty; add no theological, identity, storage or SQL owner. |

These are crosswalks to existing owners, not new domain IDs. [TODO](../../TODO.md) remains the sole status register.

## M51 ISP & Network Operations

| Milestone | Domain and owner | Boundary |
|---|---|---|
| M51 | D00 identity/grants; D15 customer, package, subscription and invoice; D16 manual payment/reconciliation; D20 ISP tenant and network access operations under MoonQL/ARSY | `apps/isp-radius` is a Go protocol adapter without SQL; `apps/isp-console` is a private UI. No third SQL owner, second Hub, copied billing rows, public portal, online gateway, or router writes. M35/M38 release gates remain in force. |
