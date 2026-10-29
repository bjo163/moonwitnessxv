# Story Universe — measured layout spec (1122×1402)

**M45-01 · source: `contracts/reference_measurements.json` · produced by `apps/empire-web/scripts/measure-reference.mjs`.**

Every number below came out of the reference PNGs, not out of the current stylesheet. The script loads each 1122×1402 mockup at 1:1 in Chromium, finds structural rows by luminance jumps, finds column edges inside each band, and finds saturated-red rectangles (CTAs and active states). Re-run it after any doubt:

```sh
node apps/empire-web/scripts/measure-reference.mjs            # printed summary
node apps/empire-web/scripts/measure-reference.mjs --json apps/empire-web/docs/story-universe/contracts/reference_measurements.json
```

The five mockups are AI-generated and disagree by ±2px on the shared chrome. **The chrome is therefore fixed once** (header 72px) and each page keeps its own measured body bands.

## Shared chrome (all five references)

| Part | Measured | Notes |
|---|---|---|
| Header height | 70–74 px across the five (home 73, library 72, reader 73, codex 70, GGS 72) | fix at **72px**, bottom hairline 1px |
| Header right cluster | search icon ≈ x 975–983, language `EN` ≈ x 1092–1096 | utility box sits left of them |
| Left content inset | 30 px (card grid), 41–44 px (hero copy / CTAs) | two insets, not one |
| Bottom bar | 51–59 px (home 54, library 55, reader ~68 with socials, codex 51, GGS 59) | fix at **56px** |
| Footer main band | 73–88 px | fix at **80px** |
| Hairline colour | `#514638` (`--rule`) | measured separators at every band edge |
| Active red | `#DB1E31`–`#A91525` (`--brand-2` / `--brand-2-strong`) | CTA fills measured with ≥0.86 rectangular fill |
| Gold | `#C5A578` (`--brand`) | eyebrows, icon strokes, stat numerals |

## REF-01 — Home

| Band | Top | Height |
|---|---|---|
| header | 0 | 73 |
| hero | 73 | 473 (to 546) |
| story worlds (4 cards) | 546 | 489 (to 1035) |
| principles | 1036 | 222 (to 1258) |
| footer main | 1258 | 88 |
| bottom bar | 1346 | 56 |

- **Card grid:** 4 columns at x = **30 / 298 / 566 / 834**, right edge **1093**; pitch 268 → card 259 + gutter 9.
- **Hero copy:** inset x = 44. H1 red lines measured at y 237–345, cap height **49–51px**, line pitch **55px** → display size ≈ **72px / 0.9**.
- **Primary CTA:** `x 44, y 413, 200×45` (fill 0.89). Secondary CTA sits to its right on the same baseline.
- Stat row sits under the CTAs inside the hero; `4+ / ∞ / 1` with 8px mono labels.

## REF-02 — MoonStories Library

| Band | Top | Height |
|---|---|---|
| header | 0 | 72 |
| hero | 74 | 368 (to 442) |
| filter tabs | 445 | 136 (to 581) |
| search + selects | 596 | 56 (to 652) |
| card grid | 655 | 377 (to 1032) |
| results / stats strip | 1058 | 54 (to 1112) |
| stories-umbrella band | 1115 | 148 (to 1263) |
| footer main | 1266 | 78 |
| bottom bar | 1347 | 55 |

- **Filter tabs:** 5 boxes between x **41** and **1080**, edges at 41 / 183 / 324–333 / 485–492 / 665–673 / 866–874 / 1080.
- **Card grid:** 4 columns at x = **29 / 297 / 567 / 821**, right edge **1093**; card ≈ 255, gutter ≈ 13.
- **Hero CTA:** `x 41, y 401, 194×44`.
- **Hero H1:** red glyphs y 192–253, cap **60–61px** → display size ≈ **84px / 0.9**.
- Badge row per card (`Origin Story`, `Completed`, `Ongoing`, `In Development`) sits above the `ENTER STORY WORLD` footer line.

## REF-03 — AngelWithShotgun reader

| Band | Top | Height |
|---|---|---|
| header | 0 | 73 |
| breadcrumb + poster top | 74 | ~188 (to 262) |
| title / chapter bar | 304 | 173 (to 477) |
| synopsis | 479 | 148 (to 627) |
| meta row (3 columns) | 630 | 219 (to 849) |
| prev / next row | 867 | 62 (to 929) |
| wisdom panel (top) | 931 | 51 (to 982) |
| wisdom panel (body) + poster foot | 985 | 233 (to 1218) |
| chapter strip header | 1220 | 24 |
| panel thumbnails | 1247 | 84 (to 1331) |
| footer + bar | 1334 | 68 |

- **Two-column body:** poster column left ≈ x 34–565, right column ≈ x 593–1090 (measured peaks 32/34, 565, 593, 1089).
- **NEXT CTA:** `x 870, y 866, 220×65` (fill 0.97) — right-aligned with the column, directly under the prev button.
- **Panel thumbnails:** 4 at x = **34 / 301 / 570 / 835**, right edge **1089**; pitch 267, width ≈ 250, gutter ≈ 17. Active thumb takes a 2px red border.
- Metadata grid inside the wisdom panel: key column ≈ 70px, value column right-aligned at 1090 (`8:60 | 2:190 | 4:75 | 47:4 | 3:104 | 9:122`).

## REF-04 — Character Codex

| Band | Top | Height |
|---|---|---|
| header | 0 | 70 |
| hero | 73 | 343 (to 416) |
| featured banner | 425 | 297 (to 722) |
| trait grid (6 columns) | 740 | 205 (to 945) |
| related + relationship map | 959 | 305 (to 1264) |
| footer main | 1275 | 73 |
| bottom bar | 1351 | 51 |

- **Featured banner** spans x **19 → 1103** (full width minus 19px side bleed).
- **Trait grid:** **6 columns**, edges at 19–26 / 197–206 / 381 / 553–560 / 732–739 / 906–913, right edge **1097** → pitch ≈ 180, card ≈ 171.
- **Relations band:** two related-character cards on the left (x 19–243, 243–462) and the relationship map from x 462 to 1103.
- Hero and featured CTAs: `ALL CHARACTERS →` and `READ FULL BIO →` sit at the same 44px inset as the home hero.

## REF-05 — GGS Full Moon School

| Band | Top | Height |
|---|---|---|
| header | 0 | 72 |
| hero | 75 | 412 (to 487) |
| hero stat strip | 490 | 81 (to 571) |
| lesson / reflection split | 587 | 330 (to 917) |
| lessons / sessions / paths row | 933 | 327 (to 1260) |
| footer main | 1262 | 78 |
| bottom bar | 1343 | 59 |

- **Hero stats** (`4+ / ∞ / 1`) sit in the 490–571 strip, right of the CTA row.
- **Three-column row:** lessons ≈ x 27–512, sessions ≈ x 525–827, paths ≈ x 849–1095.
- `LIVE NOW` badge and `JOIN TODAY — 10:12 WIB` CTA live inside the lesson card; `SAVE THE DATE` is a bordered button in the sessions card.

## Typography derived from the measurements

| Role | Reference evidence | Value |
|---|---|---|
| Display (H1) | home cap 49–51px, library cap 60–61px, both at 0.9 line-height | `clamp()` upward from 72px (home) / 84px (library); one display stack (`--font-display`) |
| Section H2 | mockup uses the same face at ≈ 0.55× the H1 | 40–48px |
| Eyebrow / labels | 8–10px mono, `0.14em` tracking, gold | `--font-mono`, `--brand` |
| Body | 13–15px, 1.55–1.65 leading, `--fg-subtle` | inherits |
| Serif quotes | footer quote and the codex/gss pull-quotes | `--font-editorial` |
| Numeral stats | 18–22px serif, gold | `--font-editorial`, `--brand-soft` |

No webfont is added: the references use a condensed grotesk that the repo does not licence, so `--font-display` (Impact/Anton/Arial Black) stands in. This is the single largest type deviation and is listed in the M45-15 report.

## How the spec is consumed

- `M45-06…10` build each page against the band table above.
- `M45-14` reads `reference_measurements.json`, measures the same DOM blocks in the built export at 1122×1402, and fails when a band's top/height drifts more than **±2px**, when a grid's column x positions drift more than ±2px, or when a page exceeds its image budget.
- Artwork bounding boxes are **excluded** from the comparison: the regenerated paintings are intentionally not the references.
