# M30-04 — Bilingual skin, RTL, vector and media pipeline

**Design specification · source SHA `ea98ddfa50f89c60be779d3ef5904c9b49209410` · no implementation or asset approval.** This document completes M30-04's design leaf. `TODO.md` remains the only task-status register; this specification neither changes application behavior nor clears any media rights.

## Scope and authorities

This pipeline applies to UI skinning and visual media in MoonWitness applications. The accepted locale policy is [ADR-0005](../decisions/ADR-0005-locale.md), source/media rights are governed by [ADR-0003](../decisions/ADR-0003-source-rights-and-consent.md) and the D08/M06-06 decisions, the MoonUI token and interaction contract is [MASTER_DESIGN.md](../../MASTER_DESIGN.md) plus the [component behavior bible](COMPONENTS.md), and public reference reuse follows [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md). This is a design rule set, not a new runtime, asset registry, or rights decision.

## Bilingual skin contract

- `id` and `en` select interface copy only. Route and preference resolution follows ADR-0005; locale never changes authorization, API identifiers, source text, or a source passage's language.
- Keep semantic catalog keys stable across locales. Translate human-facing labels, instructions, and errors; preserve machine values such as route names, response fields, filenames, IDs, and service states. Human-readable dates and numbers use the explicit UI locale; timezone and currency remain explicit data.
- A skin may select semantic MoonUI tokens, typography roles, spacing, and decorative treatment. It must preserve content, role, focus order, keyboard behavior, contrast, errors, loading/empty states, consent and rights labels. Skin selection cannot imply that content is real, approved, licensed, scanned, or published.
- Verify `id`/`en` key parity, non-empty values, and rendering of visible copy with the app's catalog checks. Missing translations fail verification; runtime fallback follows ADR-0005 and must not expose raw keys.

## Direction and text shaping

- Set document direction from the rendered content context, not from `id` versus `en`. The two supported UI locales are not a proxy for source direction.
- Mark mixed-direction passages, quotations, filenames, identifiers, and user-supplied strings locally with semantic `dir="auto"` or an equivalent isolated text wrapper. Keep surrounding controls and navigation in the UI's intended direction; never reverse API values or mutate stored source bytes to make them display correctly.
- Use logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start/end`) for layout that mirrors. Do not mirror icons whose meaning is physical or non-directional; test directional icons and previous/next semantics independently.
- RTL acceptance covers keyboard order, focus visibility, truncation/wrapping, punctuation, diacritics, copy/paste, and mixed-script boundaries at narrow and wide layouts. Until an RTL locale is accepted, these are source-text robustness requirements rather than a claim that an Arabic/Hebrew UI locale ships.

## Vector and media pipeline

1. **Choose an owner and provenance.** Add an asset only to its consuming app's served public directory. Record actual creator/source, SPDX license or `NOASSERTION` when undocumented, usage permission, consent where people are depicted, and computed SHA-256 in the existing asset ledger. Do not invent attribution or infer rights from availability.
2. **Keep references separate.** Concept mockups and their vector companions remain reference-only under ADR-0009 until individually cleared. Do not crop, embed, use as backgrounds, favicons, social images, training examples, or ship them as product media.
3. **Review SVG safety and meaning.** Require a bounded `viewBox`; provide a `<title>` plus accessible image role/label for informative graphics, or mark decorative SVG `aria-hidden="true"` and remove it from the accessibility tree. Reject scripts, event handlers, external references, remote images/fonts, CSS imports, and embedded/base64 payloads. The current `scripts/check-ui-assets.mjs` checks scripts and external references but does not detect event-handler attributes or validate `viewBox`; those cases require a focused extension/test before claiming they are automatically gated. Color uses currentColor or semantic tokens; interactive focus belongs to the MoonUI control wrapping the vector.
4. **Respect media and motion.** Verify font, audio, image and video rights before bundling; do not redistribute unlicensed fonts/music or lyrics. Provide text alternatives/captions where the medium carries information. No automatic sound. Animation is nonessential, stoppable, and disabled or simplified under `prefers-reduced-motion` without hiding information or changing task meaning.
5. **Gate before serving.** Run `node scripts/check-ui-assets.mjs` against source assets and require a matching cleared ledger entry and digest. The guide documents `pnpm ui:assets`, but that script is absent from the current root manifest; registering it is a follow-up outside this leaf. Run `pnpm ui:check` for token/component drift. Build output is not the source of rights evidence. A failed or unresolved asset stays out of served directories; use CSS/token-based original artwork or a neutral placeholder that does not suggest a real source.

## Acceptance matrix for future implementations

| Area | Positive evidence | Negative evidence |
|---|---|---|
| Locale/skin | `id` and `en` have equal semantic keys; visible labels and errors render from catalogs; skin changes preserve MoonUI semantics | Missing key, raw key leakage, unsupported locale silently rewritten, or machine identifier translated is rejected |
| Direction | Mixed RTL/LTR source text remains readable, selectable and isolated while controls retain stable keyboard order | Switching UI locale alone does not flip source text; malformed/untrusted direction markup is rendered as text, not executable markup |
| Vector | Informative/decorative semantics are explicit; digest and rights ledger agree; tokenized color and focus behavior pass | Script/event handler, remote reference, missing title/decorative marker, digest mismatch or unresolved rights fails the asset gate |
| Media/motion | Captions/alternatives exist where needed; reduced-motion mode retains information; no asset enters before provenance review | Unlicensed reference media, autoplay sound, essential animated-only meaning, or an unresolved file in a served folder fails review |

## Evidence at specification baseline

Inspected at `ea98ddfa50f89c60be779d3ef5904c9b49209410`: `MASTER_DESIGN.md`, `packages/moonui/moon.css`, `docs/design/ASSETS.md`, `docs/design/COMPONENTS.md`, `docs/design/APPS.md`, ADR-0005, ADR-0009, and M30-01 through M30-03 packets/TODO status. These sources establish the existing authorities and asset gate. `pnpm ui:check` passed (131 files, 0 violations). `node scripts/check-ui-assets.mjs` exited 1 with 32 violations: 2 unnamed Cockpit favicons and 30 served assets with unresolved rights; containment check passed with 0 reference hits. A negative run using a deliberately missing ledger exited 1 with 36 violations (33 missing ledger rows, two unnamed icons, and the missing-ledger diagnostic); no repository file was created or changed by that run. Read-only reviewer found the design consistent and suitable as a design-only artifact, and identified that event-handler attributes and `viewBox` are not checked by the current asset script; this limitation is now explicit. No app or package runtime code, catalog, media file, or asset ledger was modified.

## Rollback and limitations

This is one additive design document. Rollback is deletion of this file only, after confirming no accepted implementation depends on it. It grants no rights, selects no additional locale, and certifies no runtime RTL implementation. The existing asset checker covers the served directories named in `docs/design/ASSETS.md`; broader app-specific runtime behavior still requires task-scoped acceptance tests.
