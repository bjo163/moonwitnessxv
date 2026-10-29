# M45 artwork slots — 19 briefs

The references are paintings inside the mockups; they cannot be copied (`ADR-0009`, `M42`, and `export-check.mjs`'s zero-PNG rule). Each slot below is **generated fresh**, reviewed against the art rules, converted to WebP, and only then moved from `slots` into `assets` in `contracts/generated_artwork_manifest.json`.

The plan's summary said "18 slots"; the slot table lists 19 rows. Nineteen is correct — the count is fixed here so nothing is silently dropped.

## Shared art direction (prepend to every slot prompt)

> Cinematic digital painting, 16-bit-era concept art finish, matte texture, no photography. Palette locked to near-black `#090b0d`, warm gold `#c5a578`, deep blood red `#db1e31`, hairline brown `#514638`. Moonlight from the upper right, volumetric haze, ember highlights. Figures are hooded, seen from behind or in silhouette; **no visible faces**, no recognisable real people, no readable text or lettering inside the image, no religious calligraphy or scripture glyphs, no logos. Composition leaves the specified negative space empty for HTML overlays.

## Review rules (reject the slot if any fails)

1. No face, no portrait, no identifiable person.
2. No text, watermark, signature, UI chrome or frame baked into the image.
3. No Arabic script, verse, calligraphy or religious symbol beyond the crescent motif already used by the brand.
4. Palette within the four locked colours plus their tints.
5. Negative space honoured: the area named in the brief stays dark and low-detail so text stays legible at AA.
6. File is WebP, exact slot dimensions, < 500 KB after conversion.

## Slots

| # | Slot | File | Size (2×) | Serves | Composition brief |
|---|---|---|---|---|---|
| 1 | home-hero | `home-hero.webp` | 2244×1380 | REF-01 | Wide ruined skyline, full moon upper right behind a gothic citadel, red banner with crescent on the right, guardian seated rear-view on a rock at centre-left, scroll on the ground, heavy mist. **Left 46% stays dark** for the H1 block; bottom-left 30% empty for CTAs. |
| 2 | card-manusia-pulpen | `card-manusia-pulpen.webp` | 560×900 | REF-01/02 | Hooded writer rear-view on rubble, pages blowing in the wind, crescent moon upper left, distant city. Top 38% darker for the card number/eyebrow. |
| 3 | card-angelwithshotgun | `card-angelwithshotgun.webp` | 560×900 | REF-01/02 | Guardian rear-view with slung rifle, huge red moon behind a broken cathedral, ember-lit ruins, red banner. Top 38% darker. |
| 4 | card-ggs | `card-ggs.webp` | 560×900 | REF-01/02 | Domed academy lit from within, robed students walking away up a stone stair, full moon behind the dome, hanging banners `GGS` motif only as an abstract crescent, no letters. |
| 5 | card-empire | `card-empire.webp` | 560×900 | REF-01/02 | Orbital ring arcing over an assembly hall, seated silhouettes in rows, banners, cold moon glow behind. |
| 6 | library-hero | `library-hero.webp` | 2244×900 | REF-02 | Guardian on a rock outcrop centre-right, moon upper right, cliff city and bridge to the left, red banner. **Left 48% dark** for the two-line H1 and intro. |
| 7 | reader-poster | `reader-poster-v2.webp` | 900×1500 | REF-03 | Vertical poster: red moon over a gothic skyline, guardian rear-view lower third, rubble foreground. Bottom 26% dark for the title lockup overlay. |
| 8 | reader-panel-1 | `reader-panel-1.webp` | 840×1120 | REF-03 | "A Longer Night" — lone figure on a shelled street, red moon, smoke, no action. |
| 9 | reader-panel-2 | `reader-panel-2.webp` | 840×1120 | REF-03 | "The Weight We Carry" — figure kneeling under a broken arch, light shaft, birds. |
| 10 | reader-panel-3 | `reader-panel-3.webp` | 840×1120 | REF-03 | "Closer Every Day" — figure on a rooftop facing a distant burning district. |
| 11 | reader-panel-4 | `reader-panel-4.webp` | 840×1120 | REF-03 | "Still Here, Still Human" — three silhouettes walking toward a lit gate, dawn. |
| 12 | codex-hero | `codex-hero.webp` | 2244×900 | REF-04 | Winged silhouette rear-view, torn black-red wings, full moon, citadel. **Left 40% dark** for `CHARACTER CODEX`. |
| 13 | codex-featured | `codex-featured.webp` | 1600×700 | REF-04 | Guardian on rubble with rifle and blowing pages, moon behind, bridge city. **Left 45% dark** for `WHO IS ANGELWITHSHOTGUN?`. |
| 14 | codex-rocksoul | `codex-rocksoul.webp` | 560×640 | REF-04 | Hooded guardian with rifle, red moon, card portrait crop, chest-up rear/side silhouette. |
| 15 | codex-myluft | `codex-myluft.webp` | 560×640 | REF-04 | Pale-robed figure, moonlit city behind, calm blue-grey moonlight, rear-view. |
| 16 | ggs-hero | `ggs-hero.webp` | 2244×980 | REF-05 | Academy gate with lanterns, robed students walking in, full moon directly behind the dome, warm window glow. **Left 45% dark** for the hero copy. |
| 17 | ggs-lesson | `ggs-lesson.webp` | 900×1100 | REF-05 | Interior stone hall, figure seated before a tall arched window with the moon, candles, prayer rug as texture only. |
| 18 | ggs-reflection | `ggs-reflection.webp` | 900×1100 | REF-05 | Figure seated by still water reflecting the moon, reeds, distant city silhouette. |
| 19 | ggs-session | `ggs-session.webp` | 1200×600 | REF-05 | Circle of seated students seen from behind, lanterns, banners, moon above the courtyard. |

## Import contract

1. Generate → save PNG/JPG outside the repo.
2. Convert to WebP at the slot size (Chromium canvas encoder; ffmpeg in the Playwright cache has no WebP muxer).
3. Verify: WebP container (`RIFF`/`WEBP`), exact dimensions, < 500 KB.
4. Add to `assets` with `sha256`, `bytes`, `slot`, `page`, `reference`, and an `approvalEvidence` line naming the owner approval; set the old asset's `supersededBy` when applicable.
5. Run `node --test apps/empire-web/test/contracts.test.mjs` — the artwork contract asserts the WebP signature, byte size, SHA-256, and that `assets` is exactly the set of `.webp` files in `public/story-universe/`.

Until step 5 passes, the page keeps its current artwork and the slot stays `pending_approval`.
