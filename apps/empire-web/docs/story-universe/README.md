# A-L-L-A-H.COM × MoonWitness XV — Story Universe

**Design reference package v1.0 (2026-10-29) — SPECIFICATION ONLY.**

This app-local folder is the **single editing location** for the five-page visual bible and its machine-readable design/content contracts. The screenshots are treated as private reference assets pending rights/editorial approval, not as production page backgrounds.

## Read in order
1. [VISUAL_BIBLE.md](VISUAL_BIBLE.md) — page-by-page visual and narrative specification (five separate page types, UI copy, menus, icons, layout, responsive behavior, acceptance).
2. [contracts/design_tokens.json](contracts/design_tokens.json) — colors, type, spacing, UI glyph mapping, responsive constraints; screenshot-derived approximations.
3. [contracts/content_manifest.json](contracts/content_manifest.json) — bilingual nav, story worlds, cards, editorial statuses, page content; distinguish canon from illustrative claims.
4. [contracts/asset_manifest.json](contracts/asset_manifest.json) — SHA-256 and names of the five PNG originals.
5. [AI_LOCAL_IMPLEMENTATION_PROMPT.md](prompts/AI_LOCAL_IMPLEMENTATION_PROMPT.md) — execution prompt for local AI.
6. [MoonUI integration bridge](../../../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) — reuse and scoped theme proposal; **not implemented**.

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
- `apps/empire-web` remains a local/CI static pilot per accepted ADR-0012. Canonical LIGHTHOUSE remains Dock. No backend, auth, DB, DNS or Vercel production changes.
- Content, posters, scripture and source quotes require **human editorial/source/rights review** before publication. The mockup pictures are references, **not functioning pages**.
- "LIVE NOW", visitor counters, planned releases, and fake links from generated mockups MUST NOT be copied as real data.
- All 5 mockups differ: HOME, LIBRARY, READER, CODEX, GGS. Avoid repetitive dashboard templates.
- Visual debt and actual screenshots need to be assessed at 390 / 768 / 1122 / 1440px. Preserve RTL verified Arabic as real text.
- No new branch for ordinary local work. Align with the existing dev→main CI gates and canonical TODO, which are not rewritten by this bundle.

**Implementation status:** docs/contract imported, application page implementation **not yet started by this design-only commit**.
