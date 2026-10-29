# ADR-0014 — MoonUI dual-skin token contract

**Status: ACCEPTED — owner instruction, 29 October 2026 (WIB).** This decision permits a second, first-class MoonUI skin. ADR-0011 (Dock = canonical LIGHTHOUSE) and ADR-0012 (isolated Empire Web static pilot) remain unchanged and authoritative for their scopes.

## Context

`apps/empire-web` already renders the approved Story Universe palette, but only as an app-local pseudo-skin: `.su-shell[data-theme="empire-story"]` in `apps/empire-web/src/app/globals.css` declares nine `--eol-*` values that are re-mapped onto six `--su-*` locals, while 139 further UI colours remain raw hex literals in the same file. `packages/moonui/moon.css` owns exactly one `:root` palette and knows nothing about skins, so the second visual language lives outside the design system that is supposed to be its single source.

[packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md](../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) records the condition for promoting it: the shared package stays unchanged *"until an accepted ADR and tests approve reuse"*. [docs/design/M30-04-bilingual-skin-rtl-media.md](../design/M30-04-bilingual-skin-rtl-media.md) already defines what a skin may and may not select, and `MASTER_DESIGN.md` fixes the invariant that a skin never changes keyboard handling, ARIA, form meaning, permissions, source identity or the machine API.

## Decision

1. **A skin is a token layer.** It may select colour roles, shadow/edge treatment and typography roles. It may never change layout, composition, copy, routing, locale behaviour, rights/source labels, consent state, keyboard handling, focus order or ARIA.
2. **`packages/moonui/moon.css` remains the sole token owner.** Nothing else declares palette values. `scripts/check-ui-consistency.mjs` continues to enforce that rule.
3. **Each skin block is self-contained** — it declares both the role tokens and every legacy alias — and is selected by `data-skin` on the `<html>` element. Self-containment is required because a custom property that references another custom property resolves on the element that declares it; aliases declared only on `:root` would not follow an attribute set lower in the tree.
4. **Only an allowlisted property set may appear in a skin block:** the colour roles, the 24 legacy aliases, `color-scheme`, and the edge/shadow roles. Geometry (`--s1`…`--s5`, `--ctl`) and font stacks are skin-independent and forbidden.
5. **`zine` is the default and may never drift.** Its values are byte-identical to the pre-ADR palette, and a test asserts that `MOON_COLORS` still equals `MOON_SKINS.zine` so an unrelated edit cannot silently rebrand eight consuming apps.
6. **`empire` values come from the M42-01-approved art direction** already proven in `--eol-*` (`#090b0d`, `#131518`, `#1c1e22`, `#f1ede5`, `#92938f`, `#514638`, `#c5a578`, `#db1e31`, `#d6d5cd`). Three values are **derived, not sampled**: `--signal #8fa4b8`, `--success #7fae88`, `--danger #ff5a6b`. The mockup has no cyan, green or error colour, so these exist to keep information and error states readable; they are proposals until the contrast test and owner review pass.
7. **Brand red and error red are separate.** `.m-btn[data-variant="danger"]` moves from `var(--hot)` to `var(--danger)`; the zine value is unchanged (`#ff1e56`), so no consumer sees a different pixel, while the empire skin can keep its CTA red without telling users that every action is an error. The call-to-action surface also gets its own role: `--brand-2-strong` (`#a91525` in empire, `#ff007a` in zine) keeps white CTA text at 6.4:1, while `--brand-2` (`#db1e31`) stays the brighter accent for rules, pressed states and emphasis at 4.0:1 against the canvas.
8. **No runtime skin switcher, no cookie, no per-user preference.** `apps/empire-web` is `output: 'export'`, so a cookie cannot be read at render time and a client toggle would flash. Each app pins its skin statically in its root layout.
9. **ADR-0009 still governs media.** The five private PNG references never become skin tokens, CSS backgrounds, or public assets. The five approved WebP illustrations remain application media.
10. **No deployment, domain, DNS or indexing change** is authorised by this ADR. Dock remains the canonical LIGHTHOUSE runtime; this changes the visual recipe only.

## Consequences

- `apps/empire-web` deletes its private skin (`--eol-*`, `--su-*` literals, `data-theme`, 139 UI hex values, 13 font shorthands) and consumes role tokens only, so its appearance becomes a property of MoonUI rather than of that app.
- Palette drift becomes testable: key parity, the zine/`MOON_COLORS` bridge, WCAG pairs and the property allowlist all run under `pnpm --filter @moonwitness/moonui test`, which this ADR also adds to the root `test` script because it was previously outside `pnpm verify`.
- Artwork colours (the CSS-drawn moons, skylines and silhouettes) stay application-owned. They are illustration, not palette, and are exempted from the drift check by an explicit app-local test rather than by loosening the shared gate.

## Known gaps (documented, not fixed here)

- `.m-btn` variants `paper`, `cyan` and `cyber`, and `.m-card[data-variant="art"]`, still contain zine literals. `apps/empire-web` does not use them; migrating them is a later, separate change.
- `--line` remains the historical border shorthand; colour roles use `--rule*` to avoid the name collision.
- The skin changes mood only. The five mockups' compositions, crops and artwork remain M42-01's documented deviations.

## Rollback

Delete the `:root[data-skin='empire']` block and its `body` field rule from `packages/moonui/moon.css`, restore the pre-ADR `:root` block, revert the two `.m-btn` variant lines, and remove `MOON_SKINS` plus `skins.test.ts`. `apps/empire-web` then falls back to its previous app-local `--eol-*` block; no other app changes because the default skin is value-identical. This ADR file and its TODO entries are removed last, after confirming nothing depends on them.
