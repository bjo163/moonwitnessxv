# Reference PNG assets — Pending binary import

The five original PNG screenshots are part of the companion ChatGPT ZIP, not the live application. Do not use them as entire-page static backgrounds.

Run from repository root:

```sh
node apps/empire-web/scripts/import-story-universe-assets.mjs --zip "/absolute/path/to/A-L-L-A-H-COM_STORY_UNIVERSE_MOCKUPS_AND_SPEC_v1.0.zip"
```

The importer verifies the exact five PNG payloads using `../contracts/asset_manifest.json` SHA-256. Commit the resulting PNGs on the existing dev branch after inspection.

Original screenshot reference files:
- 01-homepage.png
- 02-moonstories-library.png
- 03-story-detail-reader.png
- 04-character-codex.png
- 05-ggs-full-moon-school.png

Do not claim they are uploaded until their paths resolve to binary blobs in GitHub.
