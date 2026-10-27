# UI screens — blockers register

**Baseline:** `dev` @ `8737fe4` · **Rules:** [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) · **Baseline audit:** [ui-baseline-8737fe4](ui-baseline-8737fe4.md)

Eight of the twelve reference screens cannot be built today. This register records **why** and the **smallest action that unblocks each one**, so no screen is ever built with sample data to resemble an image (ADR-0009 §2.5). A row leaves this table only when the owner decision exists and the route is authorized.

| # | Screen | Owner today | Reality in code | Missing decision | Smallest unblock action | Status |
|---|---|---|---|---|---|---|
| 02 | PROJECT UNIVERSE | none (M17 proposed) | `grep -r "/projects" apps/dock` = 0; `/missions` is the Prophetic Mission Table over the Figure Registry, unrelated to projects | Which app owns a projects surface, and which query supplies approved public projects | M17 owner files a route + data-owner decision naming the query module, then a packet can be opened | **BLOCKED (M17)** |
| 03 | STORY FORGE | Headquarters generic model editor | No dedicated story workspace; draft fiction and witness text are not visually separated anywhere | Whether SHADOW is authorized (M33) and where drafts live | M33 acceptance of SHADOW scope; until then drafts stay in generic CRUD and no forge UI is built | **BLOCKED (M33)** |
| 04 | POSTER LAB | `/studio` `GeneratorStudio` | Real SVG generator, but no canvas/layer model, no export approval, no asset consent trail | Export-approval gate (M18) and asset rights review (M33) | Define the export approval state machine + consent ledger entry format; the generator itself already exists | **BLOCKED (M18/M33)** |
| 07 | MOONLAB RESEARCH | public `/research` with withholding | Public research page exists and is withholding-tested; no private case workspace, no reviewer separation | Private case workspace scope (M34) | M34 decision on case/evidence/hypothesis objects and reviewer separation | **BLOCKED (M34)** |
| 08 | WORLD MONITOR | Dock `#world-monitor` card + HQ `/world-monitor` | Signal feed renders sentiment/urgency from the hub; no freshness, uncertainty or revoked-source states | Source freshness/uncertainty model (M24) | M24 defines freshness + uncertainty fields; the existing card then renders them instead of a new map | **BLOCKED (M24)** |
| 09 | PUBLISHING HUB | HQ `(admin)/views` and `(admin)/models` | Generic CRUD only; no draft→rights→reviewer→released state machine, no withdrawal audit | Publishing state machine ownership (M18/M20) | M18/M20 agree the state machine and who may transition it; HQ then renders states, not a new app | **BLOCKED (M18/M20)** |
| 10 | HARBOR COMMONS | — | No app, no ADR, no data owner | Whether a member commons app exists at all (M32/M37) | An ADR authorizing the app and its data boundary | **BLOCKED (M32/M37)** |
| 11 | WORKS / ECONOMY | — | No app, no ADR | D15/D16 source-of-truth review, merchant/legal posture (M35/M37) | ADR + D15/D16 review before any quotes/orders/invoice UI | **BLOCKED (M35/M37)** |
| 12 | SKYLINK MESSAGING | `apps/skylink` service skeleton | Fastify skeleton (health/auth/channels/events/ws) with no UI and incomplete messaging API | M38 UI authorization + the M38 code phase | M38 code phase completes the API; then an operator-inbox UI packet can be opened | **BLOCKED (M38)** |

## Why the remaining four can ship

| # | Screen | Why it is executable |
|---|---|---|
| 01 | LIGHTHOUSE / DOCK | Owner `apps/dock`, route `/`, real data via `homePayload()`, honest offline branch already exists |
| 05 | CORPUS READER | Owner `apps/dock`, route `/reader` + `/reader/compare`, exact edition/rights data already returned by `data/queries/reader.ts` |
| 06 | UNILEX EXPLORER | Owner `apps/dock`, routes `/terms`, `/figures`, `/constellation` over existing lexicon queries |
| — | HQ/Cockpit screens | Already shipped under other ADRs (Cockpit ADR-0008) or session-gated with their own milestone chains |

## Review rule

Before a screen leaves this register, its packet must show: the owner decision (ADR or accepted milestone note), a real query or an explicit `DEMO` label, a positive test, a negative/denied test, and geometry evidence at 390/768/1440/1920. Until then the row stays **BLOCKED** and the mockups README keeps the same status.
