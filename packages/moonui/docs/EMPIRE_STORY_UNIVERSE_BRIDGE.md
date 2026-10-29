# MoonUI ↔ A-L-L-A-H.COM Story Universe — design integration bridge

**Status: PROPOSED CONTRACT / NOT YET AN IMPLEMENTED MOONUI SKIN**
**Reference:** `apps/empire-web/docs/story-universe/VISUAL_BIBLE.md` and its three manifests.
**Date:** 2026-10-29 WIB.

## Important distinction

The user-approved five-page mockup package constitutes a **design and narrative target**. It does **not** authorize a global rebrand or rewrite of every MoonUI skin and consumer. The reference palette (`#090B0D`, `#C5A578`, `#DB1E31`) differs from the current exported MoonUI token defaults (`MOON_COLORS.ink #07060b`, `MOON_COLORS.accent #ffd400`, `MOON_COLORS.hot #ff1e56`). Do not silently mutate `packages/moonui/src/tokens.ts` or `packages/moonui/moon.css` to make the Empire app look right: that would cause global regressions.

## Ownership and recommended approach

- Keep semantic primitive API, accessibility, and icon exports owned by `@moonwitness/moonui`.
- Keep **Empire-specific visual theme and storytelling layout** in `apps/empire-web` until an accepted ADR and tests approve reuse.
- Proposed scoped wrapper: `data-theme="empire-story"` under the Empire app root, and tokens `--eol-*` mapped into MoonUI semantic primitives. No style leakage beyond that wrapper.
- Do not import concepts from an unrelated standalone `moonframe` repo without reviewed dependency/license/API contract.
- Do not create a parallel icon library. Prefer existing `@moonwitness/moonui/icons`; any new crown/crescent/lotus/interlocking circles must be original inline or MoonUI-owned SVG components, reviewed for viewBox, text alternatives and consistent stroke.

## Token adoption (proposal)

| Empire screenshot role | Proposed scoped value | Existing MoonUI concept | Rule |
|---|---|---|---|
| Canvas | #090B0D | ink/night | app scope only |
| Surface | #131518 | surface | app scope only |
| Card elevated | #1C1E22 | surface2 | app scope only |
| Foreground | #F1EDE5 | fg | do not lower contrast |
| Muted | #92938F | muted | minimum WCAG AA |
| Divider | #514638 | border/hair | decorative line |
| Aged gold | #C5A578 | accent | NOT global accent mutation |
| Primary red | #DB1E31 | hot | active CTA only |
| Moonlight | #D6D5CD | chalk | story imagery |
| Blueprint haze | #4A596B | moon/blue | atmospheric imagery only |

`contracts/design_tokens.json` is the proposed source of exact roles within the pilot. Treat pixel positions as an approximation requiring side-by-side screenshots, not pre-approved Figma fidelity.

## Five page-specific compositions

1. **HOME:** editorial lunar hero, ROCKSOUL back view, four story-world cards, four principles, clear real-route CTA; no fake statistics.
2. **STORIES:** five filters, searchable 4-card catalog, categorical and publication state, truth-preserving counters; accessible keyboard controls.
3. **STORY READER:** 2-column poster and narrative, four chapter/page thumbnails, prev/next with actionable destination, transcript and `<article>` semantics; never display a screenshot as a full interactive page.
4. **CODEX:** character traits grid (six traits), related ROCKSOUL / MYLUFT, accessible text alternative for relationship diagram, back-view-only character art, explicitly fictional connections.
5. **GGS:** fictional moon school, lesson and reflection layout, story time 10:12 WIB explicitly labeled as in-story, no invented live event booking, verified source verses separate from narration.

## Proposed reusable MoonUI component contracts (do not create without audit)

| Interface candidate | Inputs | Behavior / QA |
|---|---|---|
| `StoryHero` | title parts, imagery, overline, CTA[] | semantic h1, focusable real CTA, responsive text, reduces motion |
| `EditorialNav` | locale, nav links, active item | language preservation, keyboard skip, mobile focus |
| `StoryWorldCard` | unique cover, name, label, state, href? | no fake links; state label accessible |
| `StoryFilterBar` | filter IDs, values, controlled callback | keyboard and 390px wrap |
| `ChapterReader` | chapter/episode/pages, transcript, nav | prev/next working, alt + text transcript |
| `CharacterTraitGrid` | exactly semantic traits | legible at 320–390px |
| `RelationshipGraph` | nodes, edges, text list | always meaningful linear text alternative |
| `MoonLessonCard` | date/time type, reference, excerpt, review status | fictional/live status cannot be confused |
| `StatusBadge` | truthful status enum | never infer LIVE or COMPLETED from illustrations |

**Prefer existing MoonUI components.** Promote a component to the shared library only after two consumer use cases show identical semantics and keyboard behavior, and a review confirms non-regression across MoonUI skins/modes.

## Icon contract

See `contracts/design_tokens.json` icons mapping. Existing names may differ from external Lucide naming; audit `packages/moonui/src/icons/index.tsx` exports before implementation. Icons have semantic alt text where meaning-bearing, `aria-hidden` for decoration; never convert decorative SVG into inert pseudo-buttons.

## Visual QA and release gates

- Screenshot diff at 390×844, 768×1024, 1122×1402, 1440×900, 1920×1080; compare against 5 ORIGINAL screenshot assets after local import.
- Content contracts and localized copy verified against human-approved narrative; verified Qur'anic Arabic and commentary clearly sourced, `dir="rtl"` for Arabic.
- App `noindex` remains until public review; no Vercel, DNS, or production cutover from docs-only work.
- No unrelated MoonUI skin change; run `pnpm ui:check`, `pnpm --filter @moonwitness/moonui test`, app tests, typecheck and CI when actual code changes land.
- Track real task progress in canonical `TODO.md`; this document is a **design bridge**, not a duplicate backlog or declaration of delivered features.

## Integration order

1. Audit existing Empire/Dock/MoonUI components and accepted ADRs.
2. Extract tokens to a namespace under the pilot and establish semantic icon adapter.
3. Build five distinct page layouts, data-driven from manifest, without unpublished poster assets.
4. Verify screenshot parity using privately imported original PNGs, paired with real browser screenshots.
5. Propose shared MoonUI component promotion **only when demonstrated**; do not rebrand every consumer by default.
