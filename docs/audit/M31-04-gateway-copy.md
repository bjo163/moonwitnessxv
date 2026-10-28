# M31-04 — Accessible id/en gateway copy and metadata

**Baseline SHA `dfc6556` · leaf artifact · copy and metadata only.** This audit records the M31-04 change: a visible, localized LIGHTHOUSE gateway label in the existing Dock home hero and a matching `id`/`en` metadata description. It does not close M31-04 or the M31 milestone; the integrator checks the TODO leaf against reproducible evidence.

## 1. Scope and authorities

The accepted hierarchy is [M31-01](M31-01-brand-hierarchy-proposal.md) (ratified option A) and [ADR-0011](../decisions/ADR-0011-lighthouse-dock-runtime.md): MoonWitness XV is the program and brand, LIGHTHOUSE is the public gateway experience delivered inside the existing `apps/dock` application, and `a-l-l-a-h.com` remains an intended entry point only after separate ownership, DNS/TLS and release checks. M31-04 owns the `id`/`en` copy and metadata (ADR-0011 §4; [M31-02](../design/M31-02-gateway-journeys.md) §8).

Constraints applied: keep `MOONWITNESS` as the page `h1`; do not rename the site or promote LIGHTHOUSE into the heading; state the gateway purpose factually in both locales; make no domain, deployment, liveness, ownership, religious-authority, canon-approval or rights-clearance claim; do not add routes, nav entries, cards, planned states, components, CSS or a global search field.

## 2. Files changed

| File | Change |
|---|---|
| `apps/dock/src/lib/landing-copy.ts` | `heroEyebrow` value changed in both locale catalogs (no new key) |
| `apps/dock/src/lib/metadata.ts` | `dockMetadataCopy.id.description` and `.en.description` changed; canonical origin logic untouched |
| `apps/dock/test/landing-copy.test.mjs` | New positive and negative M31-04 assertions, including visible-text source checks |
| `apps/dock/test/metadata.test.mjs` | Pinned descriptions updated; new positive/negative gateway-description test |
| `docs/audit/M31-04-gateway-copy.md` | This audit |

Not changed: `apps/dock/src/app/page.tsx`, `apps/dock/src/ui/components/shell.tsx`, `apps/dock/src/app/globals.css`, `apps/dock/test/required-landing-ui-keys.mjs` (no new required key), `apps/dock/src/app/patches/page.tsx`, `apps/dock/src/ui/client/PatchesExplorer.tsx`, `apps/dock/next-env.d.ts`, `apps/cockpit/*`, `apps/headquarters/*`, `docs/audit/screens/*`, and `TODO.md`. The working tree already contained another session's modifications and untracked files at `dfc6556`; they were preserved and not touched.

## 3. New strings

| Surface | Locale | Exact string | Length |
|---|---|---|---|
| Hero label (`heroEyebrow`) | `en` | `LIGHTHOUSE · PUBLIC GATEWAY OF MOONWITNESS XV` | 45 |
| Hero label (`heroEyebrow`) | `id` | `LIGHTHOUSE · GERBANG PUBLIK MOONWITNESS XV` | 42 |
| Metadata description | `en` | `LIGHTHOUSE is the public gateway of MoonWitness XV: catalogued radio, reading and research.` | 91 |
| Metadata description | `id` | `LIGHTHOUSE adalah gerbang publik MoonWitness XV: radio, bacaan, dan riset dalam katalog.` | 88 |

The label reuses the existing `heroEyebrow` slot rather than adding a new key, because the only consumers of that slot (`src/ui/components/shell.tsx` `Hero` and the `OfflineLanding` branch of `src/app/page.tsx`) were outside the permitted change set. The slot is already rendered as a `<Tape tone="accent">` text element directly below the `MOONWITNESS` heading and motto, in both the live and the offline hero, so the label is real text and not decoration. The previous tagline in this slot (`PEOPLE. PLACES. STORIES. ANOTHER SIDE OF REALITY.` / `ORANG. TEMPAT. KISAH. SISI LAIN DARI REALITAS.`) remains available in the footer copy `footerPeopleNote` in both locales.

The metadata title, canonical origin resolution (`DOCK_PUBLIC_URL` / `NEXT_PUBLIC_SITE_URL` / `FRONTEND_URLS.dock`), language alternates and OpenGraph locale fields are unchanged.

## 4. Commands and observed results

### Focused copy/metadata tests

Command, run from `apps/dock`:

```
node --experimental-strip-types --test test/landing-copy.test.mjs test/landing-copy-english.test.mjs test/landing-copy-required-keys.test.mjs test/metadata.test.mjs test/home-spaces.test.mjs test/space-grid.test.mjs
```

Observed (exit 0):

```
ℹ tests 31
ℹ suites 0
ℹ pass 31
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 210.3066
```

The run emits the pre-existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning for `src/lib/*.ts` imports; it is not introduced by this change and does not fail the run.

### Typecheck

Command, run from `apps/dock`:

```
pnpm typecheck
```

Observed (exit 0, no diagnostics):

```
> @moonwitness/dock@1.0.0 typecheck Z:\project\moonradio\apps\dock
> tsc --noEmit
```

## 5. Positive evidence

- `landingCopy.en.heroEyebrow === 'LIGHTHOUSE · PUBLIC GATEWAY OF MOONWITNESS XV'` and `landingCopy.id.heroEyebrow === 'LIGHTHOUSE · GERBANG PUBLIK MOONWITNESS XV'` are asserted exactly (`test/landing-copy.test.mjs`).
- Both labels are asserted to be non-empty strings that start with `LIGHTHOUSE · ` and end with `MOONWITNESS XV`, and to be at most 60 characters.
- The label is asserted to be rendered as visible text: `<Tape tone="accent">{copy.heroEyebrow}</Tape>` in both `src/ui/components/shell.tsx` (`Hero`) and the offline branch of `src/app/page.tsx` (`OfflineLanding`).
- The `h1` is asserted to remain `MOONWITNESS` in both branches; the heading was not replaced.
- `getDockMetadata('en', '/en').description` and `getDockMetadata('id', '/id').description` are asserted to begin with the localized LIGHTHOUSE gateway sentence, and the pinned metadata/OpenGraph description tests were updated to the same values.
- Existing key-parity and required-label checks continue to pass (`assertRequiredLocaleKeys`), so neither locale is missing the changed key.

## 6. Negative evidence

The new tests assert that the gateway labels and both metadata descriptions contain:

- no `a-l-l-a-h.com` (case-insensitive) — no hardcoded domain;
- no uppercase `LIVE` token — no liveness badge or claim;
- no `deployed` or `production` — no deployment claim;
- no `religious authority`, `divine authority`, `canon approval`/`canonical approval`, `rights clear`, `otoritas agama`, `kewenangan ilahi` or `persetujuan kanon` — no authority, canon or rights claim.

The unchanged canonical-origin test (`base URL is strictly grounded in FRONTEND_URLS.dock without fictitious domains`) still passes, confirming this change did not alter canonical URL generation. Existing negative copy tests (no invented counters, dates or `LIVE`/`AI` labels) also still pass.

## 7. Accessibility and locale notes

- **Real text, not an image.** The label is a text node rendered by the MoonUI `Tape` primitive in the hero; no background-image-only text, icon font or pseudo-element carries it.
- **Heading preserved.** `MOONWITNESS` remains the sole `h1`; `LIGHTHOUSE` is an eyebrow-style label below it, so the page and brand are not renamed.
- **No ALL-CAPS sentence body.** The new label follows the existing uppercase eyebrow style; the metadata descriptions are normal sentence case.
- **Length / no-clip contract (structural only).** The label is 45 (`en`) and 42 (`id`) characters, shorter than the 52 (`en`) and 49 (`id`) strings it replaces in the same `.m-tape` slot. Because the element, font, size, letter spacing and `text-transform` are unchanged and the text is shorter, this change cannot widen that slot relative to the pre-change baseline. No browser measurement was made at 320/390/1440/1920 px in this leaf.
- **Locale parity.** Both catalogs carry the same `heroEyebrow` key with a non-empty localized value, and both metadata descriptions are populated; the existing `assertRequiredLocaleKeys` gate passes.
- **No new interactive or decorative control.** No route, nav entry, card, planned state, component, CSS rule or search field was added; the metadata description is plain text.

## 8. Non-claims

- No claim that `a-l-l-a-h.com` is owned, configured, resolving, TLS-terminated or released.
- No claim that the gateway is deployed, in production, live, monitored or publicly reachable.
- No `LIVE` badge, count or availability guarantee.
- No claim of religious authority, canon approval, source-rights clearance, ownership of the A-L-L-A-H / Empire of the Light vision, or approval of any narrative content.
- No claim that Dock is renamed to LIGHTHOUSE; `MOONWITNESS` remains the `h1` and the site name.
- No browser, screenshot, screen-reader, Lighthouse-tool or deployment evidence; all results above are Node test and TypeScript results at `dfc6556`.
- This audit does not close M31-04, M31-05 or the M31 milestone.

## 9. Limitations

- The metadata description is produced by the shared `getDockMetadata` helper, so it applies to every Dock route using that helper, not only the home page. That is the existing metadata architecture and was not widened here.
- The label reuses `heroEyebrow`; no dedicated `gatewayLabel` key exists. A future dedicated slot would require a component change owned outside this task.
- The previous hero tagline was replaced in that slot; the same motif remains only in the footer (`footerPeopleNote`), so the hero no longer displays it.
- No new required key was added, so `test/required-landing-ui-keys.mjs` was intentionally left unchanged; `heroEyebrow` was already a required label.
- Responsive fit is inferred from the shorter string in an unchanged slot, not measured in a browser. The parallel session's changes to `globals.css` and other files could alter layout independently of this change.
- Another session's working-tree changes and untracked files were present at baseline and were not reviewed or altered here.

## 10. Rollback

Manually revert the copy and test hunks in:

- `apps/dock/src/lib/landing-copy.ts` (restore the previous `heroEyebrow` values in both catalogs)
- `apps/dock/src/lib/metadata.ts` (restore the previous `id`/`en` descriptions; the `en` value was `SITE_TAGLINE`)
- `apps/dock/test/landing-copy.test.mjs` (remove the three M31-04 tests and the added `node:fs`/`node:path`/`node:url` imports and source reads)
- `apps/dock/test/metadata.test.mjs` (restore the pinned descriptions and remove the M31-04 metadata test)

Then delete this audit file. No route, component, CSS, schema, deployment, DNS or canonical-origin change is involved, so no runtime rollback is required.
