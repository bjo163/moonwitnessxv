# M25-05 — Cosmos/Time explorer sketch

**PROPOSAL STATUS: PROPOSAL — NOT SHIPPED — NOT DISCOVERABLE.**

Task: M25-05 — *Sketch optional Cosmos/Time explorer with proposal label* ([TODO.md:584](../../TODO.md); priority **P3**, difficulty D2). No packet file exists at `docs/tasks/M25/M25-05.md` at this baseline; the canonical task statement is the TODO row and its acceptance, *"Not discoverable as shipped feature"*.
Milestone: [M25](../milestones/M25.md) · Time, Cosmos, Earth science and research horizons ([TODO.md:572-576](../../TODO.md)).
Evidence and command log for every claim below: [docs/audit/M25-05-cosmos-explorer-proposal.md](../audit/M25-05-cosmos-explorer-proposal.md).

**What this document is.** A design sketch for a *possible* future reading surface that would let a reader inspect time and sky-related material only when each item states what kind of claim it is. It is written so that the idea can be criticised, costed, or rejected before anyone writes code. It is not a specification, not a commitment, and not a description of existing behaviour.

**What this document is not.** It is not a route, a page, a component, a navigation label, a sitemap entry, a metadata record, a search result, a feature flag, or copy. Nothing in this document is an implementation order. It does not add a route, a page, a navigation entry, a sitemap entry, a metadata record, a search record or a component. The repository baseline contains no such surface, and Section 8 records the mechanism that keeps it that way.

---

## 1. Purpose (proposed, not approved)

The repository already contains three *unrelated* time-like things that a reader could easily conflate:

1. a UTC persistence and transport base (`packages/moonql/src/schema.ts:14-15`; `packages/core/src/time.ts:1-19`, `:18-19`);
2. a display-only lunar-phase approximation in the shared header clock (`packages/moonui/src/client/mts-clock.tsx:21-23`, `:38-42`, `:83-86`);
3. narrative chronology expressed as ordinal era labels with no dates (`apps/dock/src/app/timeline/page.tsx:4-10`, `:12-20`; `packages/moonql-actors/src/index.ts:317-318`; `packages/moonql-actors/src/seed.ts:24`).

The proposal exists to answer one question: **if** the project ever wants a place to look at time and sky material side by side, what would it have to show, and what would it have to refuse to show, so that a narrative label is never mistaken for an observation, a simulation is never mistaken for a measurement, and a borrowed almanac fact is never mistaken for something MoonWitness measured?

The intended reader benefit is honesty, not spectacle: one screen on which the *nature* of every item is visible before its content. If that benefit cannot be delivered without inventing data, the correct outcome is to reject the proposal.

**Current answer to "does anything need this today?"** No shipped surface requests it, no milestone authorises it, and no data set exists to fill it (Section 5). This is an optional P3 horizon, not a gap in the current product.

---

## 2. Explicit non-goals

This sketch does **not**:

1. propose, name or reserve a URL, slug or route segment — no path is specified anywhere in this document;
2. propose a fifth public space. The accepted public taxonomy is exactly four spaces (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:27-35`; `MASTER_DESIGN.md:22`), and M19-03 records "no fifth space" as a non-goal (`docs/design/M19-03-public-ia.md:223`);
3. claim that any measurement, observation, ephemeris, almanac, coordinate, instrument, sensor, simulation or astronomy record exists — none does (Section 5);
4. turn the header's lunar-phase percentage into astronomy. That component is a mean-synodic arithmetic display whose own docstring calls it an "ephemeris" (`packages/moonui/src/client/mts-clock.tsx:83-86`); M25-01 finds the label inaccurate and the value unpersisted and unordered (`docs/audit/M25-01-mtime-antikythera-audit.md:36`, `:58`, `:62`, `:230`);
5. extend the MTS/Antikythera proposal or imply a Moonwitness Time System exists. M-TIME/Antikythera is historical proposal prose only (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:491`; `docs/audit/M25-01-mtime-antikythera-audit.md:28-32`), and MTS "must not replace standard civil/UTC time" without a separate audit (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:496`);
6. host comparative-cosmos material from sacred traditions. That requires its own source and rights work (M25-06, open at `TODO.md:585`), and the vision keeps scripture, historical hypothesis and astronomy in separate categories (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:493`);
7. provide forecasting, astrology, eclipse prediction, observing advice, navigation, or any safety-critical output;
8. define a database table, domain owner, API endpoint or package. D10 World/Science is still *planned* with no package (`docs/decisions/M02-02-domain-assignments.md:29`; no `packages/world` exists);
9. authorise visual art, 3D, assets or reference mockups. The twelve reference images remain reference-only (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:25`);
10. claim that this sketch closes M25-05 or any other task. Closure belongs to the integrator and a human reviewer.

---

## 3. Claim-type vocabulary (the core of the proposal)

The acceptance of the sibling task M25-02 is *"UI ontology has explicit claim type and source"* (`TODO.md:581`), and **M25-02 is open**. The vocabulary below is therefore a *proposal for that ontology*, not an existing enum. The repository has no `claimType`, `claim_type` or equivalent field today (no match in `apps`, `packages` or `docs`; see audit N6).

Every item shown in any future explorer would carry exactly **one** of four types, rendered as text (not colour alone), with a source field beside it:

| Claim type | Means | May be shown | Must never be shown as | Minimum provenance before display | Exists today? |
|---|---|---|---|---|---|
| `PHYSICAL READING` | A value produced by an identified physical instrument or system | A value with instrument id, calibration state, UTC timestamp, sample interval/aggregation, and a retained raw-data reference | "astronomy", "observation of the sky", a model output, a fixture | Instrument identity **and** calibration state **and** UTC time **and** raw reference. Any missing field ⇒ not displayable | **No** for cosmos/time. No meter, sensor or instrument exists in this domain (M25-01; no `astronomy_time_records` model, `docs/decisions/M02-02-domain-assignments.md:29`) |
| `SIMULATION` | Output of a named computational model over declared inputs | Modelled values with model name/version, inputs, assumptions, epoch/time scale, run time in UTC, and the word `SIMULATED` adjacent to the value | "measured", "observed", "live", a physical reading, a prediction of a specific future event | Model identity **and** inputs **and** assumptions. A simulation with unnamed inputs is not displayable | **No** cosmos/time simulation exists. M25-01 records only a display approximation, not a simulation (`docs/audit/M25-01-mtime-antikythera-audit.md:58`) |
| `ASTRONOMY` | A published reference fact or geometric quantity taken from an external authoritative source | Positions/phases/times quoted from a pinned almanac or standard, with publisher, edition, digest and the source's time scale | "measured by MoonWitness", a reading, a simulation, a live feed | Pinned edition **and** digest **and** time scale **and** licence/permission for the quoted use | **No**. No almanac, ephemeris library or pinned reference is in the repository; M25-03's H5 is `BLOCKED-SOURCE` (`docs/design/M25-03-heliogrid-material-forge-questions.md:104-112`) |
| `STORY` | Narrative or creative chronology owned by the story domain | Ordinal era labels, story chronology labels with confidence, clearly fictional framing | A date, a timestamp, an astronomical event, evidence of history | Story source/edition reference; a label is never silently converted to a calendar date | **Yes, as labels only**: eight ordinal eras with no date field (`apps/dock/src/app/timeline/page.tsx:4-10`, `:12-20`) and `chronologyLabel` + confidence enum (`packages/moonql-actors/src/index.ts:317-318`; `packages/moonql-actors/src/seed.ts:24`) |

Rules that would apply to the vocabulary:

1. **One type per item.** An item that cannot state its type is not displayed at all.
2. **No silent promotion.** A value never moves from `SIMULATION` to `PHYSICAL READING`, or from `ASTRONOMY` to `PHYSICAL READING`, without a new source record and human review. Promotion is a content change, not a display toggle.
3. **No forecast type.** Forecasting is excluded entirely: M25-03 rules that "measured ≠ simulated ≠ forecast ≠ fiction" (`docs/design/M25-03-heliogrid-material-forge-questions.md:25`) and the vision requires strict category separation (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:493`).
4. **Source is a field, not a tooltip.** The source travels with the item into any export, not only into hover text.
5. **Absence is a state, not a blank.** If provenance is incomplete, the item renders a named blocked/unknown state (Section 4) rather than an empty value.
6. **The four types do not cover scripture or historical interpretation.** Those remain out of scope until M25-06 defines their separation; they must not be forced into `ASTRONOMY` to make the screen look complete (`TODO.md:585`).

The repository already separates UTC from narrative time in shipped code (M25-01, `docs/audit/M25-01-mtime-antikythera-audit.md:53-62`). This vocabulary would extend that separation to the *display* layer, which does not exist yet.

---

## 4. Proposed surface states (design only — no surface exists)

These states describe what a future explorer would have to render. They are proposal text, not a state machine in code, and no component implements them. They follow the existing four-state contract used by Dock panels (`apps/dock/src/ui/components/states.tsx:9`, `:38`, `:57`, `:64`) and the honesty rule that a surface states its nature in words (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:45-46`; `MASTER_DESIGN.md:16`).

| Proposed state | Trigger | What may be shown | What must not be shown |
|---|---|---|---|
| `NOT_BUILT` | Today, and until an approved milestone authorises work | Nothing; the surface is absent | Any placeholder, teaser, "coming soon" badge, hidden route or disabled nav item |
| `EMPTY_NO_SOURCE` | No pinned reference and no verified reading | One sentence naming what is missing and which task must supply it | A decorative sky, a sample chart, a plausible-looking curve |
| `READING` | A `PHYSICAL READING` record with complete provenance | The value, unit, UTC time, instrument id, calibration state, raw reference | Any value missing a field; any derived "insight" presented as measurement |
| `SIMULATION` | A `SIMULATION` record with named model and inputs | The modelled value, the word `SIMULATED`, model version, assumptions, run time | "Live", "observed", "real", a physical-unit claim without a model |
| `ASTRONOMY` | A pinned `ASTRONOMY` reference | The quoted quantity, source publisher/edition/digest, time scale | "MoonWitness measured"; a recomputation presented as the source's value |
| `STORY` | A `STORY` item | Era/chronology labels, confidence, fictional framing | A calendar date, a timestamp, or an astronomical alignment claim |
| `PARTIAL` | Some layers complete, others blocked | The complete layers plus an explicit, per-layer gap statement | A single total or summary that hides the gaps |
| `BLOCKED_SOURCE` | The needed reference is unpinned or unlicensed | The blocked layer named in words and its owner task | A number sourced from memory, a search result, or a model's guess |
| `WITHHELD` | Rights veto, withdrawal, or unapproved source | A denial state in words, consistent with the Reader's withholding pattern (`apps/dock/src/app/research/page.tsx` renders a withholding alert) | The withheld text, a blur, a teaser, or a "request access" affordance that does not exist |
| `STALE` / `OFFLINE` / `UNKNOWN` | Transport age or outage, when a future data path exists | The state word plus the UTC as-of time and the reason | A green dot, `LIVE`, `NOMINAL`, `SYNCHRONIZED`, or an unqualified last value |
| `ERROR` | A failed read or rejected payload | The error named in words, retry only if a real retry exists | A fabricated fallback value, a cached value presented as current, an infinite spinner |

Proposed interaction shape (still only a proposal): a **list/detail** reading surface — one filterable list of time/sky items, one detail panel per item, with the claim type and source repeated in both. No map, no globe, no animated sky is proposed here; any visual layer would be a separate decision (Section 9, decision D9).

Offline behaviour, if ever built, would follow Dock's existing rule: static shell and honest error states, no service worker (`apps/dock/src/app/manifest.ts` records that stale cached browsing is rejected; see `docs/design/M19-03-public-ia.md:200`).

---

## 5. Data the explorer would need — and what is absent today

This is the section that decides whether the proposal is buildable. "Exists today" means the statement is verifiable in the repository at baseline; it does **not** mean the data is suitable for this surface.

| # | Data layer | Why the explorer would need it | Status today (with evidence) |
|---|---|---|---|
| 1 | UTC civil time base | Every item must carry a UTC time or explicitly say it has none | **Exists as a base, not as explorer data.** Audit timestamps are `timestamp with time zone` (`packages/moonql/src/schema.ts:14-15`); schedule slots are minutes since UTC midnight (`packages/core/src/time.ts:1-19`, `:18-19`). No time item is exposed for this purpose |
| 2 | Lunar phase / illumination | A reader would expect the familiar phase | **Partial and unsuitable.** A mean-synodic fraction from a fixed epoch, no observer, latitude, timezone, true anomaly or illumination term (`packages/moonui/src/client/mts-clock.tsx:21-23`, `:38-42`); display-only, never stored or ordered (M25-01, `docs/audit/M25-01-mtime-antikythera-audit.md:58`) |
| 3 | Solar/lunar position (ephemeris) | Any astronomy layer would need positions at a declared time and place | **Absent.** No ephemeris code or feed (M25-01, `docs/audit/M25-01-mtime-antikythera-audit.md:33-36`, `:62`); H5 is `BLOCKED-SOURCE` (`docs/design/M25-03-heliogrid-material-forge-questions.md:104-112`) |
| 4 | Observer location, timezone, precision | Positions and local times are meaningless without a declared observer | **Absent.** The only `lat`/`lng` fields belong to Sentinel signal blips (`packages/types/src/sentinel/signals.ts:24-25`), not an observing site; no timezone field exists in a cosmos/time model |
| 5 | Sidereal time / illumination fraction | The dead telemetry type advertises them | **Dead type only.** `MtsTelemetryData` declares `illuminationPct` and `siderealHours` with no producer or consumer (`packages/types/src/sentinel/telemetry.ts:27-34`; M25-01 `:36`) |
| 6 | Astronomy observation store | Astronomy records would need an owner, schema and ACL | **Absent.** `astronomy_time_records` is a *planned* D10 table with a planned package (`docs/decisions/M02-02-domain-assignments.md:29`); no `packages/world` exists; the app inventory has no world app |
| 7 | Claim type + source per item | The whole proposal depends on it | **Absent.** M25-02 is open (`TODO.md:581`); no `claimType`/`claim_type` field matches in `apps`, `packages` or `docs` (audit N6) |
| 8 | Units, calibration and source metadata | A physical reading is only meaningful with a unit and a calibration state | **Absent.** M25-04 is open (`TODO.md:583`); M25-03's unit/instrument table is a *design register* only (`docs/design/M25-03-heliogrid-material-forge-questions.md:34-46`) |
| 9 | Narrative eras | The story layer would reuse them | **Exists as labels.** Eight ordinal eras with `eraNum`, title, subtitle, tone, description; no date field (`apps/dock/src/app/timeline/page.tsx:4-10`, `:12-20`) |
| 10 | Historical chronology with confidence | Historical items must not become dates | **Exists as text + enum.** `chronologyLabel` plus `UNDATED/REPORTED_DATE/DISPUTED_DATE/ATTESTED_DATE` (`packages/moonql-actors/src/index.ts:317-318`; `packages/moonql-actors/src/seed.ts:24`) |
| 11 | Pinned astronomical reference (almanac/standard) | `ASTRONOMY` claims need an edition, digest and time scale | **Absent.** No pinned almanac, standard edition or digest exists in the repository; M25-03 H5 requires one before any such claim (`docs/design/M25-03-heliogrid-material-forge-questions.md:104-112`) |
| 12 | Rights/edition metadata for source text | Comparative or quoted material needs rights state | **Partial, for the corpus only.** D01 edition/rights fields and ADR-0003's rights classes exist (`docs/decisions/ADR-0003-source-rights-and-consent.md:29-38`); no comparative-cosmos source set exists, and M25-06 is open (`TODO.md:585`) |
| 13 | Bilingual copy for the surface | Dock is `id`/`en` and copy is catalogued, not literal | **Absent for this surface.** Dock metadata is generic site metadata (`apps/dock/src/lib/metadata.ts:21-35`); no cosmos/time strings exist in Dock (audit N1/N4) |
| 14 | Search/index entry | A discoverable feature would need a real search path | **Absent, by decision.** No global search exists; per-surface forms only (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:40`; `apps/dock/src/app/terms/page.tsx:141`) |

**Conclusion of this section:** layers 1, 9 and 10 exist as unrelated primitives; layer 2 exists as a display approximation that must not be promoted; layer 12 exists only for corpus text. Layers 3–6, 11 and 13–14 are absent, and layers 7–8 are open prerequisite tasks. A surface built today would have nothing honest to display beyond story labels, which already have a home on the existing timeline page. **That is an argument against building it now.**

---

## 6. Accessibility, keyboard, reduced motion and locale requirements

If the proposal were ever authorised, these would be acceptance criteria, not enhancements. Each cites the existing contract it would inherit.

### 6.1 Structure and keyboard

1. **List/detail is the primary surface.** The item list and detail panel are ordinary DOM, reachable by `Tab`, with a visible `:focus-visible` outline (already global: `apps/dock/src/app/globals.css:114-119`). No canvas, WebGL or drag interaction may be the only way to reach an item. ORBIT is the accepted precedent that a visual scene needs a full keyboard-operable 2D alternative (`MASTER_DESIGN.md:25`).
2. **Mode/claim-type switching** uses a real WAI-ARIA tab pattern with roving `tabIndex` and `Arrow`/`Home`/`End` support, which MoonUI already implements (`packages/moonui/src/nav.tsx:78-99`, `:103-110`; `docs/design/COMPONENTS.md:36`). Claim type is also present as text in the detail, so the tab is not the only carrier of meaning.
3. **Dialogs** (source detail, provenance) reuse MoonUI `Modal`/`AlertDialog` focus trapping, `Escape` dismissal and focus restoration (`packages/moonui/src/client/modal.tsx:82-125`, `:143`); no new dialog primitive is proposed.
4. **Skip link and focusable main** are prerequisites, not optional. Dock's `<main className="dk-main">` has no `id` or `tabIndex` today (`apps/dock/src/layouts/site.tsx:22`), and M19-03 records the missing skip link as an open finding (`docs/design/M19-03-public-ia.md:94`, `:189`). A dense explorer must not ship before that is fixed.
5. **No hover-only or pointer-only affordance.** Every value and source is reachable with the keyboard and readable without a pointer, consistent with the Dock space-card invariants (`docs/design/COMPONENTS.md:49`).
6. **Target size, zoom and reflow.** Usable at 320 CSS px and 200% zoom without horizontal scrolling; the existing responsive contract is `apps/dock/src/app/globals.css` and the Dock suite includes responsive/accessibility checks (`apps/dock/test/responsive-accessibility.test.mjs`).
7. **Screen-reader semantics.** A time value is marked up so UTC versus local is explicit; a claim type is announced with the item, not only inferred from a colour or icon. State changes announce politely (`role="status"`) and failures interrupt (`role="alert"`), matching `PanelState` (`apps/dock/src/ui/components/states.tsx:38`, `:57`).

### 6.2 Motion

1. **No auto-playing sky, auto-rotating globe, parallax or timed reveal.** Any motion must be user-initiated and stoppable.
2. The global reduced-motion block already neutralises animation and transitions (`apps/dock/src/app/globals.css:2472-2495`). If any new animation is proposed, that block must cover it; reduced motion must not remove information, only movement.
3. A visual layer may never be the only representation of a value; the text value is always present.

### 6.3 Locale

1. **`id` and `en` parity, no runtime machine translation.** Dock serves `/id/*` and `/en/*` through middleware rewrites (`apps/dock/src/middleware.ts:24`, `:45-59`), and copy lives in typed catalogs with a parity test (`apps/dock/test/landing-copy.test.mjs:6-12`, as observed at baseline `dfc6556`).
2. **Locale is a language, not a timezone.** ADR-0005 states that `id`/`en` are not timezone identifiers and that location must not select a locale (`docs/decisions/ADR-0005-locale.md:18`). Local time therefore needs an explicit, separately stored timezone — which does not exist (Section 5, layer 4).
3. **Date and number formatting** uses explicit `Intl` locale inputs as ADR-0005 requires (`docs/decisions/ADR-0005-locale.md:21`); no hand-rolled month names. Dock currently has no `Intl` usage (audit N8), so this would be new work.
4. **UTC is always shown or explicitly stated.** If a local-time view exists, it is labelled as local, following the existing clock's `LOC` label (`packages/moonui/src/client/mts-clock.tsx:111`), and never replaces UTC silently.
5. **Source-language and scripture text keep their own direction** under RTL, per the Master Design keyboard/ARIA/RTL invariant (`MASTER_DESIGN.md:6`). Direction is never inferred from the UI locale.
6. **Claim-type words are translated as controlled vocabulary**, with the same four meanings in both catalogs; a translator must not introduce a fifth label.

---

## 7. What the proposal would refuse to display

A short, testable must-not-ship list, in the form used by M25-03 (`docs/design/M25-03-heliogrid-material-forge-questions.md:224-244`):

| Forbidden | Why | Owner if ever built |
|---|---|---|
| A sky, globe or chart rendered as if it were observed data | No observation exists | M25-02 / M25-04 |
| A phase percentage labelled "ephemeris", "astronomy" or "observed" | Today's clock is arithmetic, not astronomy (`packages/moonui/src/client/mts-clock.tsx:83-86`; M25-01 `:62`) | M25-02 |
| Any `LIVE`, `NOMINAL`, `SYNCHRONIZED` or green-dot status | No live feed or freshness contract exists (`MASTER_DESIGN.md:16`; `docs/design/APPS.md:2`) | M25-02 |
| A date attached to a narrative era or a story label | Eras have no date field (`apps/dock/src/app/timeline/page.tsx:4-10`) | M25-02 / M25-06 |
| A scripture or historical interpretation presented as astronomy | Categories must remain separate (`docs/vision/MASTER_VISION_NARRATIVE_XV.md:493`) | M25-06 |
| An observer location, even coarsely, without a privacy decision | Location is personal data; none is collected today | M25-04 / privacy review |
| A quoted almanac value without edition, digest and licence | Unpinned source; H5 is blocked (`docs/design/M25-03-heliogrid-material-forge-questions.md:104-112`) | M25-04 / rights |
| A "coming soon" badge, teaser or disabled nav row | A proposal is not a product promise | Integrator / M25-02 |

---

## 8. How it stays non-discoverable until an approved milestone

**The mechanism is absence, not concealment.** At baseline the explorer is not a hidden route, a disabled link, a feature flag or a `noindex` page. It does not exist as an artifact outside this document and its audit. A hidden-but-shipped route would still be shipped code and would violate the acceptance.

Baseline facts (commands and output in the audit):

- `apps/dock/src/app` contains 20 page files, none of them cosmos/time (audit N1). `apps/dock/src/app/timeline` is the existing eight-era narrative page (`apps/dock/src/app/timeline/page.tsx:12-20`), not this explorer and not a sky surface.
- `NAV_LINKS` holds 15 entries and none is cosmos/time (`apps/dock/src/ui/components/shell.tsx:27-43`).
- `DOCK_SITEMAP_ROUTES` holds 15 routes and none is cosmos/time (`apps/dock/src/app/sitemap.ts:16-32`).
- No Dock copy, component, metadata or search record mentions cosmos or astronomy (audit N4, N5).

**Boundary gate.** `scripts/check-m25-05-proposal-boundary.mjs` is a dependency-free read-only validator that fails (exit 1) if any of the following appears:

1. a cosmos/astronomy/time route directory under `apps/dock/src/app` (the existing `timeline` route is explicitly allowed; a bare `time` segment is not);
2. a cosmos/astronomy entry in `NAV_LINKS` (`apps/dock/src/ui/components/shell.tsx:27-43`);
3. a cosmos/astronomy entry in `DOCK_SITEMAP_ROUTES` (`apps/dock/src/app/sitemap.ts:16-32`);
4. cosmos/astronomy vocabulary inside `apps/dock/src` outside the allowed existing narrative words;
5. loss of this document's proposal markers, or any live-shipping wording inside it.

The script is a tripwire for accidental shipping, not a security control. It reads tracked and working-tree files; it writes nothing.

**If the idea is ever approved**, the authorised change must, in one reviewed diff: close M25-02 and M25-04 (and M25-06 for comparative sources), record an accepted decision or ADR naming the owner and data source, add real provenance, and deliberately update this gate alongside the implementation. Updating the gate is itself the review signal that the surface is leaving proposal state. No one may "just add the route".

**What "non-discoverable" means here.** Repository readers can find this document by path or `git grep`; that is intended. Product users, search engines, sitemaps, navigation and site metadata cannot reach the explorer because it has no product artifact. The proposal is discoverable as a document and absent as a feature.

---

## 9. Decisions still owed

| # | Decision | Why it blocks | Candidate owner |
|---|---|---|---|
| D1 | Is a Cosmos/Time explorer wanted at all, and under which milestone/ADR? | A P3 horizon sketch does not authorise implementation | Milestone owner + integrator |
| D2 | Final claim-type enum and source-field shape | The four types here are a proposal; M25-02 owns the UI ontology (`TODO.md:581`) | M25-02 |
| D3 | Unit and time-scale normalisation (UTC vs other time scales), precision, uncertainty | M25-04 owns units/calibration/source metadata (`TODO.md:583`); the repo models only UTC civil time | M25-04 |
| D4 | Which authoritative reference is pinned, and under what licence | No almanac/edition/digest exists; H5 is `BLOCKED-SOURCE` | M25-04 + M25-03 H5 |
| D5 | Whether observer coordinates are collected, at what precision, stored where, and for how long | No coordinates or timezone exist; location is sensitive personal data | Privacy/rights review + M25-04 |
| D6 | Whether comparative-cosmos material is in scope, and how historical/scripture claims are separated | M25-06 is open (`TODO.md:585`); forcing it into `ASTRONOMY` would be false | M25-06 |
| D7 | Information-architecture placement and label | Four public spaces are fixed (`docs/decisions/ADR-0009-public-ui-reference-adoption.md:27-35`); no fifth space (`docs/design/M19-03-public-ia.md:223`) | Dock IA owner / M19-13 follow-up |
| D8 | Story chronology representation: labels only, or a sourced date model? | Eras have no dates today (`apps/dock/src/app/timeline/page.tsx:4-10`) | Story domain + M25-02 |
| D9 | Whether any visual layer is permitted (2D chart, globe, 3D), and its performance/accessibility budget | No data exists to draw; ORBIT's 2D fallback and `SIMULATED` rule are the precedent (`MASTER_DESIGN.md:25`) | Design owner + a11y reviewer |
| D10 | Data owner and storage (D10 remains proposed; no package) | `@moonwitness/world` is planned only (`docs/decisions/M02-02-domain-assignments.md:29`) | Architecture owner |
| D11 | A11y evidence owner and browser/AT matrix, including skip link (M19-04) | The skip link is still missing (`apps/dock/src/layouts/site.tsx:22`) | M19-04 |
| D12 | Logging/retention: no user location or query logging without a decision | Privacy; nothing is logged today because nothing exists | Privacy review |
| D13 | Who owns and updates the boundary gate after approval | The gate must not silently rot or be deleted | Integrator |

Until D1–D4 at minimum are decided, no further design detail would be honest: elaborating a screen around data that does not exist would manufacture the impression of a capability.

---

## 10. Prerequisite status and handoff

| Task | Status at baseline | What this sketch needs from it |
|---|---|---|
| M25-01 — M-TIME/Antikythera audit | **Closed** at `ed3561a` (`TODO.md:580`; `docs/audit/M25-01-mtime-antikythera-audit.md`) | The separation facts: UTC persisted, narrative labels, display-only phase |
| M25-02 — Separate physical readings, simulation, astronomy and story modes | **Open** (`TODO.md:581`) | The claim-type enum and source field this sketch proposes but cannot define |
| M25-03 — HELIOGRID/Material Forge questions | **Closed** at `4b0a872` (`TODO.md:582`) | The evidentiary rules and unit/instrument vocabulary reused in Sections 3 and 5 |
| M25-04 — Unit normalization, measurement/calibration, source metadata | **Open** (`TODO.md:583`) | Units, calibration state, source metadata before any `PHYSICAL READING` is displayable |
| M25-06 — Comparative cosmos sources | **Open** (`TODO.md:585`) | Source/rights separation for any comparative material |
| M25-07 — Cost/safety/hardware feasibility | **Open** (`TODO.md:586`) | Only if hardware were ever proposed; this sketch proposes none |

**P3 status.** This is a P3, optional research-horizon sketch. It has no implementation, no test in `apps`, no route, no owner consent and no approved milestone slice. M25-02 and M25-04 remain the open prerequisites for any implementation, and M25-06 remains open for any comparative material. The existence of this document changes none of those statuses.

**Handoff.** The integrator may use this sketch to reject the idea cheaply, to scope M25-02's enum, or to open a future design packet. No downstream task inherits an obligation to build anything from it.

---

## 11. Acceptance trace, rollback and evidence

- **M25-05 acceptance `"Not discoverable as shipped feature"`:** supported negatively — no route, navigation entry, sitemap entry, metadata, copy, search record or component exists at baseline (audit N1–N5), and the new gate keeps it that way (audit P4–P6).
- **Proposal label:** the document's first status line and every section frame the content as proposal; the gate fails if the markers disappear (audit P5).
- **No invented astronomy:** every "exists today" statement above cites a repository file:line; absent layers are named absent. No measurement, simulation, ephemeris, coordinate or almanac value is asserted.
- **Rollback:** delete this file, its audit, and `scripts/check-m25-05-proposal-boundary.mjs`. Nothing imports any of them; no schema, route, runtime, TODO status or build configuration references them.

**This is a sketch for discussion. It authorises no UI work, no data collection, no source acquisition and no publication.**
