# M19-02 — Reader/Research/Story/Operator layout & typography tokens

**Design decision · source SHA `eb3b9f085da73e1e19d8686d467dab95c2b7d13e` · tokens only, no app consumption.** `TODO.md` remains the only task-status register. [`MOON_EXPERIENCES`](../../packages/moonui/src/tokens.ts) is the single typed source for the four reading contexts; [`moon.css`](../../packages/moonui/moon.css) is untouched, so no rendered surface changes.

## Why four experiences

`MASTER_DESIGN.md` already gives each surface a distinct posture: the Dock is a moonpunk zine reading deck whose body copy "stays readable prose", the terms/hypothesis register is a reference surface scanned in lists, Studio story tiles are narrative, and the Cockpit is a "high-density mission supervisor and technician console". Those are different *reading* problems — measure, leading, hierarchy and gutter — while the palette, component contract and keyboard/ARIA semantics stay one system. `MOON_EXPERIENCES` names that difference so apps stop inventing inline type scales.

## Mode matrix

| Key | `reader` | `research` | `story` | `operator` |
|---|---|---|---|---|
| Surface | Dock `/reader` | terms / hypotheses detail | studio / story | Cockpit, Skylink, Echolog consoles |
| `measure` | `68ch` | `84ch` | `62ch` | `none` |
| `maxWidth` | `72rem` | `88rem` | `66rem` | `100%` |
| `density` | `comfortable` | `compact` | `airy` | `dense` |
| `lineHeight` | `1.75` | `1.55` | `1.8` | `1.3` |
| `fonts.heading` | `MOON_FONTS.display` | `MOON_FONTS.sans` | `MOON_FONTS.zine` | `MOON_FONTS.display` |
| `fonts.body` | `MOON_FONTS.sans` | `MOON_FONTS.sans` | `MOON_FONTS.sans` | `MOON_FONTS.sans` |
| `fonts.code` | `MOON_FONTS.mono` | `MOON_FONTS.mono` | `MOON_FONTS.mono` | `MOON_FONTS.mono` |
| `typeScale.display` | `48px` | `34px` | `56px` | `20px` |
| `typeScale.heading` | `28px` | `22px` | `30px` | `14px` |
| `typeScale.body` | `17px` | `14px` | `18px` | `12px` |
| `typeScale.caption` | `12px` | `11px` | `12px` | `10px` |
| `typeScale.code` | `13px` | `12px` | `13px` | `12px` |
| `space.gutter` | `MOON_SPACING.s5` | `MOON_SPACING.s4` | `MOON_SPACING.s5` | `MOON_SPACING.s3` |
| `space.section` | `MOON_SPACING.s5` | `MOON_SPACING.s3` | `MOON_SPACING.s5` | `MOON_SPACING.s2` |
| `space.inline` | `MOON_SPACING.s3` | `MOON_SPACING.s2` | `MOON_SPACING.s3` | `MOON_SPACING.s1` |

## What differs (intentional)

- **Measure and leading.** Reader is prose-comfortable (`68ch`, `1.75`); research widens the scan field and tightens leading (`84ch`, `1.55`); story narrows the column and opens leading for narrative rhythm (`62ch`, `1.8`); operator drops the measure cap entirely and runs at `1.3` because rows align to a grid and long log lines wrap instead of re-measuring.
- **Heading voice.** Display face for editorial headings (reader/operator), sans for reference headings (research), zine face for story. This mirrors the existing zine/console split rather than adding a face.
- **Scale.** Story has the largest display step (`56px`), reader next (`48px`), research compressed (`34px`), operator functional (`20px`). One descending scale shape in every mode.
- **Density and gutter.** Four distinct densities (`comfortable`, `compact`, `airy`, `dense`) and corresponding `MOON_SPACING` gutters, so reader and operator cannot collapse into the same layout.

## What must NOT differ (semantic invariants)

1. **Same key set in every mode.** `measure`, `maxWidth`, `density`, `lineHeight`, `fonts.{heading,body,code}`, `typeScale.{display,heading,body,caption,code}`, `space.{gutter,section,inline}` — no mode may add, rename or drop a key to fake a difference.
2. **A key means one thing.** Renaming semantics (e.g. story reusing `measure` to mean padding) is drift, not design; the test compares key paths across modes.
3. **No second palette.** Colour is not an experience decision. The group contains no colour value and no colour-shaped key; any future colour need resolves through `MOON_COLORS`.
4. **No new font families or magic spacing.** Font values must be `MOON_FONTS` members and spacing values `MOON_SPACING` members.
5. **Body text stays sans, code text stays mono, and body never drops below `12px`.**
6. **Accessibility and locale are not themable.** Density may change spacing only, never focus order, target semantics, ARIA, keyboard behaviour, copy, `dir` handling, or reduced-motion behaviour.

## Consumption contract (future work, not this leaf)

Apps may read `MOON_EXPERIENCES.reader` etc. to emit CSS custom properties at a layout boundary. They must not copy values, fork palettes, or use a mode to change meaning. `measure: 'none'` is a deliberate statement — "no text measure cap" — not a missing value.

## Evidence

The guarded behaviour lives in [`packages/moonui/test/experience-tokens.test.ts`](../../packages/moonui/test/experience-tokens.test.ts); see the [audit](../audit/M19-02-experience-tokens.md) for commands and observed output.
