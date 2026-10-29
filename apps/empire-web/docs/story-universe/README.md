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
7. [MoonUI integration bridge](../../../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) — shared package stays unchanged; Empire consumes its existing primitives in a scoped app theme.

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
- `apps/empire-web` remains an isolated static pilot per accepted ADR-0012. Canonical LIGHTHOUSE remains Dock. A separate Vercel production deployment is authorized in the ADR-0012 addendum; no backend, auth, DB, custom domain, DNS, or changes to the existing `empire-of-the-light` Vercel project.
- Content, posters, scripture and source quotes require **human editorial/source/rights review** before publication. The mockup pictures are references, **not functioning pages**.
- "LIVE NOW", visitor counters, planned releases, and fake links from generated mockups MUST NOT be copied as real data.
- All 5 mockups differ: HOME, LIBRARY, READER, CODEX, GGS. Avoid repetitive dashboard templates.
- Visual debt and actual screenshots need to be assessed at 390 / 768 / 1122 / 1440 / 1920px. Preserve RTL verified Arabic as real text.
- No new branch for ordinary local work. Align with the existing dev→main CI gates and canonical TODO, which are not rewritten by this bundle.

**Implementation status (local working tree):** all five conceptual page surfaces now exist in the bilingual static pilot: home, searchable/filterable library, interactive AngelWithShotgun reader, character codex, and fictional GGS learning page. The app uses MoonUI CSS, buttons, and vector icons with scoped Empire tokens; the shared MoonUI package is unchanged. The project owner approved the five original AI-generated WebP illustrations for public deployment on 2026-10-29 (Asia/Jakarta); exact file checksums and this narrow approval are recorded in `contracts/generated_artwork_manifest.json`. That approval covers those five WebP files only. The five PNG screenshots remain private design references outside `public/` and the exported app. The generated art follows their composition and mood, but is not a copy of the source imagery and does not make the pages pixel-exact. Routes remain noindex. Editorial copy, religious/source claims, broader rights review, full visual comparison, and final human acceptance remain open.

**Release scope:** the project owner separately authorized an isolated Vercel production deployment for this static pilot. The canonical Lighthouse runtime remains Dock; this project must use a new Vercel project rooted at `apps/empire-web`, must not change the existing `empire-of-the-light` Vercel project or domains, and must keep `noindex, nofollow` until editorial/source/security review is complete.

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
