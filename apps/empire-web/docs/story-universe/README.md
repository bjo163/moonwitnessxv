# A-L-L-A-H.COM × MoonWitness XV — Story Universe

**Design reference package v1.0 (2026-10-29) — SPECIFICATION ONLY.**

This app-local folder is the **single editing location** for the five-page visual bible and its machine-readable design/content contracts. The screenshots are treated as private reference assets pending rights/editorial approval, not as production page backgrounds.

## Read in order
1. [VISUAL_BIBLE.md](VISUAL_BIBLE.md) — page-by-page visual and narrative specification (five separate page types, UI copy, menus, icons, layout, responsive behavior, acceptance).
2. [contracts/design_tokens.json](contracts/design_tokens.json) — colors, type, spacing, UI glyph mapping, responsive constraints; screenshot-derived approximations.
3. [contracts/content_manifest.json](contracts/content_manifest.json) — bilingual nav, story worlds, cards, editorial statuses, page content; distinguish canon from illustrative claims.
4. [contracts/asset_manifest.json](contracts/asset_manifest.json) — SHA-256 and names of the five PNG originals.
5. [contracts/generated_artwork_manifest.json](contracts/generated_artwork_manifest.json) — checksums and scoped publication approval for the five new, AI-generated WebP illustrations.
6. [AI_LOCAL_IMPLEMENTATION_PROMPT.md](prompts/AI_LOCAL_IMPLEMENTATION_PROMPT.md) — execution prompt for local AI.
7. [MoonUI integration bridge](../../../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) — the shared package owns reusable layout, styling and vector primitives; Empire supplies route data and artwork.
8. [Empire visual system](../../../../docs/design/EMPIRE_VISUAL_SYSTEM.md) — mark, orbital artwork, shared 404, palette roles and asset gates.

## The five PNG originals

| Ref | Filename | Visual |
| --- | --- | --- |
| REF-01 | assets/01-homepage.png | Empire of the Light — Home |
| REF-02 | assets/02-moonstories-library.png | MoonStories Library |
| REF-03 | assets/03-story-detail-reader.png | AngelWithShotgun Story/Reader |
| REF-04 | assets/04-character-codex.png | Character Codex |
| REF-05 | assets/05-ggs-full-moon-school.png | GGS Full Moon School |

**Binary-upload status:** The five original PNG bytes are distributed in the companion ChatGPT ZIP, `A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip`. The remote documentation API used for this commit cannot transfer PNG file payloads. **Do not claim that GitHub already contains the five PNGs until the importer has run and a commit has been verified.** Text specifications and SHA-256 manifests *are* committed.

Import the **exact original** PNGs when the ZIP is available on the local machine (no resizing or recompression):

```sh
node apps/empire-web/scripts/import-story-universe-assets.mjs --zip "/path/to/A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip"
git add apps/empire-web/docs/story-universe/assets/*.png
git commit -m "docs(empire): add five original story universe visual references"
git push origin dev
```

Each PNG is checked against the SHA-256 manifest and allowed filename list; a mismatch causes failure. Read script help using `--help`. The files should stay inside `docs/` (not `public/`) until publication is approved.

## Architecture boundaries and status
- `apps/empire-web` is a static, backend-free Empire site at `a-l-l-a-h.com` under [ADR-0016](../../../../docs/decisions/ADR-0016-public-domain-map.md); Dock remains the canonical LIGHTHOUSE runtime under ADR-0011. Coolify serves the indexable canonical domain. The separate `a-l-l-a-h-empire-web` Vercel project was removed at the owner's request on 2026-10-31; the unrelated `empire-of-the-light` project was left unchanged. No backend, auth, database, or DNS change is implied by this visual work.
- Content, posters, scripture and source quotes require **human editorial/source/rights review** before publication. The mockup pictures are references, **not functioning pages**.
- "LIVE NOW", visitor counters, planned releases, and fake links from generated mockups MUST NOT be copied as real data.
- All 5 mockups differ: HOME, LIBRARY, READER, CODEX, GGS. Avoid repetitive dashboard templates.
- Visual debt and actual screenshots need to be assessed at 390 / 768 / 1122 / 1440 / 1920px. Preserve RTL verified Arabic as real text.
- No new branch for ordinary local work. Align with the existing dev→main CI gates and canonical TODO, which are not rewritten by this bundle.

**Implementation status (working tree):** all five conceptual page surfaces exist in the bilingual static site: home, searchable/filterable library, interactive AngelWithShotgun reader, character codex, and fictional GGS learning page. MoonUI owns the shared components, component styling, vector mark and orbit artwork; Empire provides route copy and art URLs. Every Empire route, including `/`, selects the `empire` skin, whose colors come from shared MoonUI roles. The project owner approved the five original AI-generated WebP illustrations for public deployment on 2026-10-29 (Asia/Jakarta); exact checksums and the narrow approval scope are recorded in `contracts/generated_artwork_manifest.json`. That approval covers those five WebP files only. The five PNG screenshots remain private design references outside `public/` and the exported app. The 19 additional artwork slots remain pending because image generation is blocked on credits and require their own provenance, review, and publication approval. `a-l-l-a-h.com` is indexable by ADR-0016. The Vercel project and deployment were removed on 2026-10-31. Editorial/source review and final human acceptance remain open.

**Release scope:** ADR-0016 assigns `a-l-l-a-h.com` to Empire on Coolify and permits indexing there. The former Vercel project was removed at the owner's request; Vercel is not an active release target. Dock remains the canonical LIGHTHOUSE runtime. Follow [release evidence requirements](../../../../docs/architecture/RELEASE.md) before making any deployment claim.

### Local visual implementation checkpoint

| Page / route | Reference | In place locally | Still differs / gate |
|---|---|---|---|
| Home `/id`, `/en` | `01-homepage.png` | Moonlit city hero with faceless rear-view figure, four individually illustrated world cards, four semantic foundation icons | Original AI artwork and MoonUI/custom vector icons are composition-led approximations; precise crop, spacing and typography comparison remains |
| Library `/[locale]/stories` | `02-moonstories-library.png` | Separate guardian hero, five icon filters, search/sort/world/status, four distinct story records and artwork | Artwork is original and distinct but not the reference painting; header/nav proportions and card crop need multi-viewport comparison |
| Reader `/[locale]/stories/angelwithshotgun` | `03-story-detail-reader.png` | Separate poster + synopsis/metadata, four selectable panels with varied scene art, previous/next and transcript | Scene art is drawn from five original preview illustrations, not four sequential authored comic panels; exact composition remains open |
| Codex `/[locale]/characters` | `04-character-codex.png` | Dedicated wide guardian artwork, six traits, relationship explanation and accessible text | Artwork is original rather than source reference; precise crop, diagram lines and section proportions need comparison |
| GGS `/[locale]/ggs` | `05-ggs-full-moon-school.png` | Dedicated moon-academy art, fictional 10:12 WIB lesson, reflection, three lessons, session disclosure and four paths | Academy painting is original rather than source reference; exact crop, section proportions and typography need comparison |

**M42-01 verification checkpoint — exact application source SHA `7988a20c90511810f903d2c695b81e07f5dec8f0` (2026-10-29):** `pnpm --filter @moonwitness/empire-web test` passed 6/6; the app typecheck, scoped ESLint, optimized static build, and `node apps/empire-web/test/export-check.mjs` passed. The export checker confirms all eight Story Universe routes are localized and noindex, all 25 exported HTML links/anchors resolve, the five approved WebPs are present, and no PNG exists anywhere in `out/`. The five local PNG references still match `asset_manifest.json` SHA-256 and were not staged or exported.

Browser verification covered all five `id` and five `en` routes at 390×844, 768×1024, 1122×1402, 1440×900, and 1920×1080. Every route retained `noindex, nofollow`; the 1920px matrix had no horizontal overflow. Full-page comparison at the 1122×1402 reference size confirmed five distinct compositions. Search for “GGS” returns one card, the guardian category filter returns one card, reader page controls update the current page, mobile navigation opens, and the browser console had no errors.

**Remaining visual deviations:** the five approved WebPs are original composition-led illustrations rather than copies of the private mockup paintings; several crops, exact typography/spacing, and decorative/vector icon details still differ. The reader reuses conceptual scenes rather than four sequential final comic panels. No screenshot captures were added to the repository; the five reference PNGs remain private. Copy, religious/source claims, broader rights, and indexing remain gated.

## M45 — mockup-faithful reconstruction (status 2026-10-29)

The five Story Universe routes were rebuilt against the five 1122×1402 mockups. Fidelity is measured, not judged: docs/story-universe/LAYOUT_SPEC.md records the bands read out of the PNGs by scripts/measure-reference.mjs, and scripts/check-fidelity.mjs --strict fails the build when a band drifts past ±2px, a section disappears, a page has more than one h1, or a derived width (390/768/1440/1920) overflows.

Measured at 1122×1402 in **both locales** (`en` and `id`), all five pages, deltas after the final pass. CI runs the harness twice (`--locale en`, `--locale id`) because the plan requires the Indonesian copy to sit in the same boxes:

| Page | Bands | Columns |
|---|---|---|
| Home (REF-01) | 73 / 546 / 1035 / 1258 / 1346 / 1402 | 30 / 297.8 / 565.5 / 833.3, right 1092 |
| Library (REF-02) | 73 / 443 / 581 / 653 / 1033 / 1264 / 1346 / 1403 | 29 / 298.3 / 567.5 / 836.8, right 1093 |
| Reader (REF-03) | 73 / 104 / 1218 / 1331 / 1374 / 1402 | 34 / 301.5 / 569 / 836.5, right 1088 |
| Codex (REF-04) | 73 / 416 / 722 / 945 / 1264 / 1349 / 1403 | 19 … 1097 |
| GGS (REF-05) | 73 / 487 / 571 / 917 / 1260 / 1341 / 1403 | 27 / 525 / 840, right 1095 |

### Deliberate deviations

1. **Artwork.** The five approved WebPs still stand in for the 19 planned slots (ARTWORK_SLOTS.md). Generation is blocked on image credits; every page swaps one src per slot when the art lands.
2. **Display face.** The mockups use a licensed condensed grotesk. The app keeps --font-display (Impact/Anton/Arial Black). No webfont was added.
3. **Footer height per page.** The mockups disagree (home 88+56, library 78+55, reader 43+28, codex 73+51, GGS 78+59). One SiteFooter component serves all five, with --footer-main-h / --footer-bar-h tokens set per page so each mockup's own numbers are met.
4. **Non-uniform grids.** The mockups' trait/thumbs columns are uneven (e.g. codex traits 178/184/172/179/174/191). The app uses a uniform grid and the harness asserts only the outer edges there.
5. **Mockup copy.** Reproduced verbatim under the owner decision; every statement is registered in CLAIMS.md. The Qur'an panel is **withheld** (rights), LIVE NOW / JOIN TODAY carry a story-time caption, and 50+ STORIES & IDEAS remains an unsupported metric the owner accepted.
6. **/ uses the Empire skin.** The root entry and localized pages share the `data-skin="empire"` role palette and brand mark; `zine` remains MoonWitness's default for surfaces that do not select Empire. The six information pages use the same Empire chrome.

7. **Social marks are drawn, not linked.** The four icons match the mockup; they carry `aria-hidden` and no `href` until a real account exists (CLAIMS.md row 7).

### Deployment evidence

- At the M42-02 verification checkpoint, `https://a-l-l-a-h-empire-web.vercel.app/en` served the build (`su-home__hero` present in 38 KB of HTML). The project was removed on 2026-10-31; this is historical release evidence, not an active URL.
- The earlier parked-domain response was superseded by the Coolify cutover evidence in [M44-domain-cutover](../../../../docs/audit/M44-domain-cutover.md).
