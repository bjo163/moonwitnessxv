# ADR-0017 — Shared-first component ownership: MoonUI is the only component owner

**Status: ACCEPTED — owner instruction, 30 October 2026 (WIB).** This decision makes `@moonwitness/moonui` the single owner of every UI component in the monorepo and supersedes the component-placement clause of [ADR-0009](ADR-0009-public-ui-reference-adoption.md) §2.4. ADR-0009 §2.1–§2.3, §2.5 and §2.6 remain authoritative for reference assets, the four-space taxonomy, honesty rules and visual evidence.

## Context

`@moonwitness/moonui` already ships roughly ninety primitives across a server-safe barrel (`packages/moonui/src/index.ts`), a client barrel (`packages/moonui/src/client/index.ts`), a token module and a stylesheet. Consumers were nevertheless free to write their own components, and they did:

- `apps/cockpit/client/components/CockpitConfirmModal.tsx`, `CockpitHelpModal.tsx` and `modal-focus.ts` reimplement focus trapping, Escape handling and focus restoration that `Modal`/`AlertDialog` already provide.
- `apps/echolog/client/components/EchologConfirmDialog.tsx` plus the `.echolog-dialog*` rules reimplement the same contract a third time.
- `apps/orbit/src/components/OrbitQueueFilterBar.tsx` declares a local `Chip` that `Pill`/`PillGroup` already provides, and `OrbitNav.tsx` declares a section nav with no shared owner.
- `apps/empire-web/src/components/story/StatRow.tsx` and the `.dk-paper-stat-row` wrapper in `apps/dock/src/ui/components/sections.tsx` duplicate `Stat`.

`pnpm ui:check` reported `150 files, 0 violations` while all of the above were live, because the gate inspected a hard-coded 26-file surface list and a 14-literal stylesheet denylist. A guardrail that only recognises the names someone typed last year is not a guardrail; it is a changelog.

ADR-0009 §2.4 deliberately kept single-consumer components app-local so the design system would not grow single-use APIs. In practice that rule produced forty-odd local components, several of which drifted from the shared contract, and it gave every new surface a legal place to invent a primitive. The owner has decided the trade-off in the opposite direction.

## Decision

1. **R1 — Single owner.** Every presentational React component that renders DOM lives under `packages/moonui/src/**` and is exported from `@moonwitness/moonui` (server-safe) or `@moonwitness/moonui/client` (interactive). A component defined anywhere else is a defect, whether it has one consumer or ten.
2. **R2 — What application code may contain.** Route files (`app/**/page.tsx`, `app/**/layout.tsx`), locale/copy catalogs, data readers, and markup-free containers listed in the exception ledger. A container may hold state, effects, fetches and prop plumbing; it may not render intrinsic interactive elements of its own.
3. **R3 — Dependency direction.** MoonUI never imports application code and never owns data, copy catalogs, routes or fetches. Strings, records and callbacks arrive as props. A design-system component that needs Dock's `getLandingCopy` is a component that has not finished moving.
4. **R4 — No local restyling.** Component CSS lives in `packages/moonui/moon.css`. Application stylesheets may style page bands and layout only; they may not define a component class, and they may not override an `.m-*` primitive's anatomy.
5. **R5 — Ratchet.** `docs/design/moonui-exceptions.json` records the remaining app-local files. It may only shrink. The ceiling (`RATCHET`) is a constant in `scripts/check-ui-consistency.mjs`, so raising it is a visible, reviewable diff rather than a quiet ledger edit.
6. **R6 — Tests assert the shared contract.** A test asserts MoonUI classes, roles and ARIA on the shared component; it does not assert an app-local class name that only exists because the component had not moved yet.

The four enforcement layers are: the `pnpm ui:check` script (filesystem, CSS, registry, duplicate matrix), the `@moonwitness/shared-ui-only` ESLint rule (AST-accurate, editor-speed feedback), the exception ledger (bounded debt), and the `pnpm verify` CI gate (nothing reaches `main` that the first three reject).

## Consequences

**Positive**

- One implementation of focus trapping, Escape handling, roving tabindex, token usage and haptics, proven once by `packages/moonui/test/` and inherited by every surface.
- A new app cannot fork a primitive without failing CI on the first commit, because surface discovery is derived from `scripts/apps.registry.mjs` and the filesystem rather than from a list.
- Cross-app duplication becomes measurable: the linter prints a `name → apps → suggested module` promotion table instead of relying on review attention.

**Negative**

- MoonUI grows APIs with a single consumer today (for example the Dock space cards), which is exactly what ADR-0009 §2.4 forbade. Accepted: a shared component with one consumer is still one implementation, and the second consumer inherits it instead of re-deriving it.
- Migration touches app markup, so DOM-sensitive tests must be updated. The landmark, single-`h1`/single-`nav` and no-horizontal-overflow invariants are unchanged and must keep passing; only selectors may change.
- The exception ledger is debt by construction. It is bounded, enumerated and ratcheted, but it is not zero at the start.

## Known gaps (documented, not fixed here)

- `packages/moonui/src/nav.tsx` exports the interactive `Tabs` from the server-safe barrel and imports `./client/haptics.js`. Splitting `Tabs` into `src/client/tabs.tsx` is a hardening follow-up, not a prerequisite for this ADR.
- **The CSS inversion behind the promoted surfaces is measured and now forbidden.** It was found at 120 classes (Empire 82, Orbit 24, Cockpit 11, ECHOLOG 3) — classes a MoonUI component renders whose rules only an `apps/**` stylesheet defines, so those "shared" components rendered unstyled for every other consumer. All 120 were moved into `packages/moonui/moon.css` the same day (ECHOLOG's three folded into `m-row` plus `.m-detail-stats`/`.m-detail-pills`). Check **C7** now holds the ceiling at **0**: no MoonUI file may emit a class that an application stylesheet alone defines. The moved rules keep their original `su-*`/`orbit-*`/`cockpit-*` spellings — renaming them to `.m-*` is a naming follow-up; the ownership is already corrected, and C7 would fail any new dependence either way.
- **Artwork is content and stays with the app.** `StoryGgsPage` takes every picture URL as `StoryGgsArtwork` props; the reflection band is painted by `moon.css` from the `--m-surface-art` custom property the view sets, so no design-system file names an Empire asset (guarded by `apps/empire-web/test/token-purity.test.mjs`).
- **A variant is a `data-*` attribute, never a class name the component assembles from data.** `emp-space-${accent}` and `m-terminal-${level}` emitted `emp-space-warm` / `m-terminal-error` and similar names that appear nowhere as literals, so C7 could not see whether an application stylesheet was their only styling — and in one case it was. Both sites now render `data-accent` / `data-level` with the rules in `moon.css`, and gate check **C9** rejects the pattern outright, so the invisible channel is closed rather than policed by attention.
- **An override does not have to name a primitive to be one.** `.m-sidebar { border-right: none }` in an app stylesheet is visible to a selector scan; `.emp-state-dot { width: 7px; background: var(--muted) }` applied on `<span class="emp-state-dot m-live-dot">` is the same act through the band's own name, and it was found in a browser, not in source. Gate check **C10** now measures both halves: an app rule that sets an anatomy property on a class `moon.css` defines, and a rule on any band class MoonUI stacks on top of a primitive that restates a property the primitive itself declares. Position stays legal — a band may place a primitive, and a `data-*` compound stays the sanctioned variant. The same browser pass found the other side of the guarantee missing: controls that carry no `.m-*` class had no focus ring, so `moon.css` now grants the ring to every interactive element inside a design-system shell (`.su-shell`/`.emp-shell`) and treats a label-wrapped field as a field.
- Application artwork (CSS-drawn moons, skylines, silhouettes) stays application-owned; it is illustration, not component anatomy.
- Skins remain governed by [ADR-0014](ADR-0014-moonui-skin-contract.md); this ADR changes ownership, not the token layer.

## Rollback

Reinstate ADR-0009 §2.4 in `docs/design/COMPONENTS.md`, delete `docs/design/moonui-exceptions.json`, remove the `shared-ui-only` rule from `packages/eslint-config`, and restore the previous `scripts/check-ui-consistency.mjs`. Migrated components keep working because they only consume MoonUI exports that already shipped; only the promotion of Dock's space/state components would need a copy back into `apps/dock/src/ui/components/`.

## Compliance & evidence

| Rule | Enforced by |
|---|---|
| R1 single owner | `scripts/check-ui-consistency.mjs` C5 (duplicate matrix) + C8 (markup fingerprint, catches a view renamed rather than reused) + C9 (no class name assembled from data) + `@moonwitness/shared-ui-only` `LocalPrimitive` |
| R2 app scope | C6 ledger completeness; C5 declaration scan |
| R3 dependency direction | `packages/moonui/package.json` dependencies (`@moonwitness/core` only) + C7 (no app stylesheet may define what MoonUI renders) + review |
| R4 no local restyling | C3 component-class denylist (suffix matched after `__`/`--` are folded to `-`, so a BEM spelling is the same violation); C2 token purity; C7 forbids the reverse — MoonUI depending on an app stylesheet; C10 keeps a primitive's anatomy in the design system, through the primitive's own class or through a band class stacked on it |
| R5 ratchet | C6 `RATCHET` constant; C7 `MOONUI_CSS_DEBT_CEILING` constant |
| R6 shared-contract tests | `packages/moonui/test/*`; app suites assert `.m-*` selectors; `test/governance/ui-consistency-linter.test.mjs` proves each of the ten gate checks fails on a fixture |
