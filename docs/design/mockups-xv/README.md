# MoonUI XV — 12 PNG originals + 12 SVG reference layouts
> The original **1920×1080 PNG** mockups from the MoonWitness XV visual design handoff are now stored in [png/](png/) as **12 separate files**. Each PNG has a paired, simplified 1600×900 original SVG layout reference in this folder. Both are conceptual design references, **not evidence of deployed or live product features**.
>
> Implement through [todo-ui.md](../../../todo-ui.md) and canonical [TODO.md](../../../TODO.md); use [MASTER_DESIGN](../../../MASTER_DESIGN.md), [Components](../COMPONENTS.md), and [App boundaries](../APPS.md). Third-party illustrations, sample content, fonts, and source rights require review **before production redistribution**.
>
> Theme: Moonpunk zine, ink-black, neon magenta/cyan/yellow, brutalist components with accessible behavior. Screenshots may contain illustrative sample stats, never live operational claims.

| No. | PNG original | SVG companion | Product boundary | Canonical scope |
|---|---|---|---|---|
| 01 | [PNG](png/01_dock_lighthouse.png) | [LIGHTHOUSE / DOCK](01_dock_lighthouse.svg) | apps/dock | M19 / M31 |
| 02 | [PNG](png/02_project_universe.png) | [PROJECT UNIVERSE](02_project_universe.svg) | apps/dock + Headquarters | M17 / M19 |
| 03 | [PNG](png/03_story_forge.png) | [STORY FORGE](03_story_forge.svg) | HQ workspace, SHADOW proposed | M17 / M33 |
| 04 | [PNG](png/04_poster_lab.png) | [POSTER LAB](04_poster_lab.svg) | existing GeneratorStudio, scoped SHADOW | M18 / M33 |
| 05 | [PNG](png/05_corpus_reader.png) | [CORPUS READER](05_corpus_reader.svg) | apps/dock | M08 / M19 |
| 06 | [PNG](png/06_unilex_explorer.png) | [UNILEX EXPLORER](06_unilex_explorer.svg) | existing data owners + Dock projection | M10 / M12 / M19 |
| 07 | [PNG](png/07_moonlab_research.png) | [MOONLAB RESEARCH](07_moonlab_research.svg) | HQ research desk, MOONLAB proposed | M14 / M34 |
| 08 | [PNG](png/08_world_monitor.png) | [WORLD MONITOR](08_world_monitor.svg) | future WORLD projections | M24 |
| 09 | [PNG](png/09_publishing_hub.png) | [PUBLISHING HUB](09_publishing_hub.svg) | apps/headquarters | M18 / M20 |
| 10 | [PNG](png/10_harbor_commons.png) | [HARBOR COMMONS](10_harbor_commons.svg) | planned member app | M32 / M37 |
| 11 | [PNG](png/11_works_economy.png) | [WORKS / ECONOMY](11_works_economy.svg) | planned commerce app | M35 / M37 |
| 12 | [PNG](png/12_skylink_messaging.png) | [SKYLINK MESSAGING](12_skylink_messaging.svg) | apps/skylink (service skeleton) | M38 / M19 |

## Rules of use
- The PNG files in `png/` are the **original 12 raster mockups** from the October 2026 handoff (1920×1080); their Git blob hashes match the source files.
- SVGs are *simplified design companions*, not pixel-perfect PNG reproductions. PNG visuals must not be reimplemented as an image-only interface.
- Images are **reference assets**. Audit origin, illustration rights, font licensing and content approvals before embedding any raster or derivative into publicly shipped product UI.
- Real application statuses, statistics, citations, accounts and delivery trails must come from verified domain owners; never ship mock data as `LIVE`.
- Implement public Dock, private HQ and future planned surfaces according to architecture boundaries and `todo-ui.md`; avoid duplicate renderers and non-semantic token drift.

## Implementation status (ADR-0009)
A concept view is never evidence that a feature exists. This table states what the code does today; blocked screens carry the owner action that unblocks them, and nothing is built with sample data to resemble an image. Full detail: [blockers register](../../audit/ui-blocked-screens-8737fe4.md) · [ADR-0009](../../decisions/ADR-0009-public-ui-reference-adoption.md).

| # | Screen | Owner route today | Status |
|---|---|---|---|
| 01 | LIGHTHOUSE / DOCK | `apps/dock` `/` — four-space entry READ/EXPLORE/CREATE/SIGNAL | **PARTIAL** — header band + space entry shipped; mockup rail/search/index chrome rejected |
| 02 | PROJECT UNIVERSE | none (`grep /projects` = 0) | **BLOCKED (M17)** — route and data owner undecided |
| 03 | STORY FORGE | HQ generic model editor | **BLOCKED (M33)** — SHADOW scope not accepted |
| 04 | POSTER LAB | `/studio` generator (no canvas/export model) | **BLOCKED (M18/M33)** — export approval + asset consent absent |
| 05 | CORPUS READER | `apps/dock` `/reader` | **PARTIAL** — provenance disclosure shipped; D08 denial tests in M19-19 |
| 06 | UNILEX EXPLORER | `apps/dock` `/terms`, `/figures`, `/constellation` | **PARTIAL** — keyboard list alternative shipped |
| 07 | MOONLAB RESEARCH | public `/research` only | **BLOCKED (M34)** — private case workspace undecided |
| 08 | WORLD MONITOR | Dock `#world-monitor` card + HQ `/world-monitor` | **BLOCKED (M24)** — freshness/uncertainty model undecided |
| 09 | PUBLISHING HUB | HQ generic CRUD | **BLOCKED (M18/M20)** — draft→rights→reviewer→released absent |
| 10 | HARBOR COMMONS | — | **BLOCKED (M32/M37)** — no ADR, no app |
| 11 | WORKS / ECONOMY | — | **BLOCKED (M35/M37)** — D15/D16 source-of-truth review missing |
| 12 | SKYLINK MESSAGING | `apps/skylink` service skeleton only | **BLOCKED (M38)** — inbox UI not authorized; API incomplete |
