# Reference PNG assets — Imported local references

The five original PNG screenshots are present here as private design references. They match the SHA-256 values in `../contracts/asset_manifest.json` and remain outside the application's `public/` directory. Do not use them as entire-page static backgrounds or treat them as approved publication artwork.

Run from repository root:

```sh
node apps/empire-web/scripts/import-story-universe-assets.mjs --zip "/absolute/path/to/A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip"
```

The importer can be used to verify/import the exact five PNG payloads using `../contracts/asset_manifest.json` SHA-256. Keep the references on the existing dev branch only after review.

Local source copies supplied under `docs/` have these names; canonical names below are byte-identical copies:
- `ChatGPT Image Oct 29, 2026, 02_14_52 PM-1.png`
- `ChatGPT Image Oct 29, 2026, 02_14_54 PM-2.png`
- `ChatGPT Image Oct 29, 2026, 02_14_56 PM-3.png`
- `ChatGPT Image Oct 29, 2026, 02_14_58 PM-4.png`
- `ChatGPT Image Oct 29, 2026, 02_15_00 PM-5.png`

Original screenshot reference files:
- 01-homepage.png
- 02-moonstories-library.png
- 03-story-detail-reader.png
- 04-character-codex.png
- 05-ggs-full-moon-school.png

They are available in the local working tree; this does not claim they are committed or uploaded to GitHub.

## Original generated artwork approved for the isolated pilot

Five separate AI-generated WebP scenes are used by the isolated static pilot from `apps/empire-web/public/story-universe/`. Their dimensions and checksums are in [`../contracts/generated_artwork_manifest.json`](../contracts/generated_artwork_manifest.json), which records the project owner's explicit approval to publish only those five files. They are original interpretations of the page compositions, not extracted from the private screenshots.

This approval does not cover the five PNG references, story or lesson copy, character claims, religious quotations/translations/tafsir/source claims, broader source rights, or the full MoonWitness product. The PNGs remain private under `docs/`; no `.png` may appear in `public/` or the static export. ADR-0016 permits indexing on the canonical Coolify host. The separate Vercel project was removed on 2026-10-31; the unrelated `empire-of-the-light` project and all domains/DNS remain untouched.
