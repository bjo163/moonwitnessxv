# ADR-0009: Public UI Reference Adoption — Dock Space Taxonomy and Reference-Asset Rules

- **Status:** ACCEPTED
- **Date:** 2026-10-27
- **Deciders:** MoonWitness XV Core Engineering, Product/Design Owner
- **Scope:** `apps/dock` public surface, `@moonwitness/moonui` usage policy, `docs/design/mockups-xv` reference set

---

## 1. Context & Problem Statement

Twelve concept images were delivered as a 1920×1080 raster set (`docs/design/mockups-xv/png/`) with simplified vector companions (`*.svg`). The manifest marks them `CONCEPT_ONLY`, `licenseReviewRequired: true`, `pngUse: "reference-only; pending rights review before production assets"`. The baseline audit (`docs/audit/ui-baseline-8737fe4.md`) records a SHA-256 ledger per file and confirms that **no per-asset rights record exists** — no author, no SPDX identifier, no consent.

The reference screens show a persistent 13-item left rail, a global search field, an "01/12" index counter and a mockup footer strip. Only one public surface in the repository actually renders real content (`apps/dock`, 20 routes); `apps/headquarters` is session-gated, `apps/cockpit` is an operator console, and `apps/skylink` / `apps/echolog` are services without UI.

Three failure modes had to be prevented:

1. **Fake surfaces.** Building twelve dashboards with sample data to resemble the images would breach the repository rule that a reference is never proof of a feature.
2. **Navigation duplication.** Copying the rail would put a second navigation landmark beside the existing header nav, contradict M19-03 ("Reader not buried under 30 equal nav labels") and break the AST landmark tests.
3. **Unlicensed art in product.** Cropping a reference portrait or skyline into the UI would redistribute art whose rights are unresolved.

## 2. Decision

### 2.1 Reference assets are not product assets
The twelve PNGs and their SVG companions remain **reference-only** until a per-asset ledger entry exists (original author, SPDX or signed consent, permitted usage, content hash). No cropping, embedding, background use, favicon or OG image. Implementation uses semantic MoonUI tokens and original CSS only. Reviewer check: `git grep -n "mockups-xv/png" apps/` must stay empty.

### 2.2 Public surface taxonomy is four spaces
The public Dock entry exposes exactly four spaces, each mapped to a route that already renders real data:

| Space | Route | Status shown |
|---|---|---|
| `READ` | `/reader` | `REAL` |
| `EXPLORE` | `/terms` | `REAL` |
| `CREATE` | `/studio` | `DEMO` (publishing awaits M33) |
| `SIGNAL` | `/stations` | `REAL` |

The 13-item rail is rejected. Depth navigation stays in the existing header nav plus `PageHeader` breadcrumbs (already used by 14 pages).

### 2.3 Reference chrome is not shipped
Not shipped: the `01/12` index counter (a mockup index, not product information), the global search box (no cross-surface query endpoint exists; a dead field is a false affordance), and the mockup footer strip. The product footer remains `SiteFooter`.

### 2.4 Component placement
`SpaceCard`, `SpaceGrid`, `PanelState` and `StatusTag` live in `apps/dock/src/ui/components/` while Dock is their only consumer. Promotion into `@moonwitness/moonui` requires a second consuming application, so the design system does not grow a single-use API. Dialogs do **not** need a new primitive: `Modal` and `AlertDialog` already ship from `@moonwitness/moonui/client` with focus trapping and Escape handling.

### 2.5 Honesty rule
Any surface that projects data must state its nature in words — `REAL`, `PLANNED` or `DEMO` — and must never render an invented counter, "LIVE" badge or delivery statistic. A screen whose owner milestone or ADR is missing is listed in `docs/audit/ui-blocked-screens-<sha>.md` with the exact unblock action instead of being built with sample data.

### 2.6 Visual evidence
The repository has no screenshot harness and the local IDE browser cannot be resized. Visual evidence is therefore **DOM geometry** at 390 / 768 / 1440 / 1920 px: `documentElement.scrollWidth === clientWidth`, computed column count, and no element outside the viewport. Pixel screenshots are recorded as environment-blocked, never claimed.

## 3. Consequences

**Positive**
- The three screens with an owner, a route and real data (01 Lighthouse, 05 Corpus Reader, 06 UNILEX) can ship without touching a second app, a database or the media renderer.
- The rules are testable: route existence, status enum, copy parity and landmark constraints all have automated checks.
- No unlicensed raster can enter the product without tripping an explicit checklist item.

**Negative**
- Screen 02 (Project Universe) stays blocked until M17 defines a route and a data owner; screens 03/04/07/08/09/10/11/12 stay blocked behind their milestones, so visual parity with the twelve images will remain partial by design.
- The Dock home gains a section that the mockup drew as a rail; the information architecture is therefore equivalent, not pixel-identical.

**Follow-ups (not authorized by this ADR)**
- Per-asset rights ledger for the PNG set (QA-01).
- An owner-approved screenshot harness (touches lockfile and Docker contract tests).
- An M17 decision on a projects surface.
- An M38 UI authorization before any SKYLINK inbox screen.

## 4. Non-goals

- No new application, no `/projects` route, no second renderer, no new database table.
- No change to Hub, ARSY, SKYLINK or ECHOLOG service contracts.
- No restyling of existing Dock content sections beyond the header band and the new space entry.
- No claim that a concept image is deployed behaviour.

## 5. Compliance & evidence

| Rule | Enforced by |
|---|---|
| Four spaces, real routes only | `apps/dock/test/space-grid.test.mjs` — every `href` maps to an existing `src/app/**/page.tsx` |
| Status enum limited to REAL/PLANNED/DEMO | same test — literal-union assertion |
| Bilingual copy parity | `apps/dock/test/landing-copy*.test.mjs` (compile-enforced catalog) |
| No counter in a space card | `apps/dock/test/home-spaces.test.mjs` |
| Single `h1` / single nav | `apps/dock/test/landmarks.test.mjs` |
| Rights denial stays explicit | `apps/dock/test/reader-rights.test.mjs` |
| No token drift | `pnpm ui:check` |

Acceptance note: accepted on 2026-10-27 together with owner approval of the docs-first UI build plan; implementation evidence is tracked per wave in `todo-ui.md` and `docs/audit/ui-screens-evidence-<sha>.md`.
