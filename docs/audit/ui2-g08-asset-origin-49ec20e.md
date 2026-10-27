# UI2-G08 — batch-2 (images 13–22) asset-origin ledger and rights gate

- **Branch:** `dev` · **HEAD:** `49ec20e` (`git rev-parse` observed at audit time).
- **Gate audited:** [`todo-ui-2.md:37`](../../todo-ui-2.md) — P1 · D2 · depends **G05** · owner Asset/design · file scope `docs/design/` (docs-only).
- **Method:** READ-only. No file under `docs/design/` was created, renamed, moved or deleted; no checkbox was ticked. The only file written by this audit is this document.
- **Working-tree caveat:** the tree carries other sessions' uncommitted work (`apps/arsy/src/*`, `apps/orbit/src/*`, `apps/skylink/src/modules/routes.ts`, `docs/audit/screens/*` — 45 tracked PNGs there, 51 files present, i.e. 6 untracked). `git status --porcelain docs/design` → **0 lines**: the design subject of this audit is clean and fully tracked (`git ls-files docs/design` → 33 files).

## 0. Baseline and commands actually run

`git rev-parse --abbrev-ref HEAD` (`dev`), `git rev-parse --short HEAD` (`49ec20e`), `git log --oneline -12`, `git status --porcelain`, `git ls-files`, `git check-ignore -v`, `git log --oneline --diff-filter=A --name-only -- docs/design/mockups-xv`, `ls`, `find` (+ `-printf '%s'`), `sha256sum` on all 33 `docs/design/` files, all 33 files in `apps/*/public`, and `docs/audit/screens/*.png`, `grep`/Read over `todo-ui-2.md`, `docs/design/*`, `docs/decisions/ADR-0009-public-ui-reference-adoption.md`, `docs/audit/ui-asset-ledger-d54ad43.md`, `docs/audit/ui2-preflight-2026-10-27.md`, `docs/audit/ui-visual-harness-d54ad43.md`, `docs/audit/M19-01-asset-ownership.md`, `scripts/check-ui-consistency.mjs`, `scripts/check-ui-assets.mjs`, `scripts/git-hooks/pre-commit.mjs`, `package.json`, `.github/workflows/ci.yml`, `node -e` PNG-header dimension reads.

Two static scanners were also **executed** because the packet required verifying a prior run's numbers rather than trusting them: `node scripts/check-ui-consistency.mjs` and `node scripts/check-ui-assets.mjs`. Both are side-effect-free by inspection — `check-ui-consistency.mjs:15` imports only `readdirSync, readFileSync, statSync`; `check-ui-assets.mjs` contains no `writeFileSync/mkdirSync/rmSync/createWriteStream` (grep → 0 matches). No dev server, Playwright harness, `pnpm build` or write-side git command was run.

## 1. Batch-1 inventory — everything that exists in `docs/design/` at `49ec20e` (33 files)

Naming convention observed in the gallery: `NN_slug.svg` (1600×900) at `mockups-xv/`, paired `NN_slug.png` (1920×1080) under `mockups-xv/png/`, `NN` zero-padded and equal to `manifest.json` `screens[].number` and to the README table row. **Consistent for all 12 pairs — no exceptions, no gaps, no orphan PNG/SVG.** Top-level design docs use a different, also-consistent scheme (`UPPER.md` for standing docs, `Mxx-yy-kebab-case.md` for milestone notes).

| Path (under `docs/design/`) | Type | Bytes | SHA-256 (computed here) |
|---|---|---|---|
| `mockups-xv/png/01_dock_lighthouse.png` | raster PNG 1920×1080 | 1425238 | `80c315c954c2652b6c8aa8454d4b1f2782ed5e570cbdcc2c351428116c1a888f` |
| `mockups-xv/png/02_project_universe.png` | raster PNG | 1330106 | `4bcff08d6ab9907f49a1a60a79c5d721613681efdd450e20f8ece91ef581e54f` |
| `mockups-xv/png/03_story_forge.png` | raster PNG | 1295601 | `859e0b788710b85cd4526f8cfb2f847fa86bb447c2cca2b0c9709a94d8a20b42` |
| `mockups-xv/png/04_poster_lab.png` | raster PNG | 1364778 | `aadad8f3293b5fe779afc2680435f02df763f6119f449e496ce37e1364d82eb3` |
| `mockups-xv/png/05_corpus_reader.png` | raster PNG | 859029 | `960073f54982c22032f0ab914cf582e42b051affb7e7599cae134d61648036da` |
| `mockups-xv/png/06_unilex_explorer.png` | raster PNG | 1031432 | `0395aed20b33ea919c92f4941163a1ec8d28c678c2dab9c1499c6bda38febb75` |
| `mockups-xv/png/07_moonlab_research.png` | raster PNG | 877307 | `c74461de3548f3b1f2404ab56775051c76ac3cf99fcbed0e923a6a2c72876ab4` |
| `mockups-xv/png/08_world_monitor.png` | raster PNG | 962129 | `e1247803a21dfad5b9cca4df2f7fb15b5eb4d76b5563210a2325af06147bcf36` |
| `mockups-xv/png/09_publishing_hub.png` | raster PNG | 628978 | `4f94d6b34b5a1e5dcf1ae2ff97192a0b1d5cad7a18b393eb3aad08fb2a4caf82` |
| `mockups-xv/png/10_harbor_commons.png` | raster PNG | 1129170 | `1749b20eff9579354674c4c9a3d9b32ce98f5a8ff25ea0bbee2d35d272d7d99b` |
| `mockups-xv/png/11_works_economy.png` | raster PNG | 781230 | `497af92fd2f4d62dc54a9ef590b4a81e397fdb6cc05fe0f7bd2805b94a232429` |
| `mockups-xv/png/12_skylink_messaging.png` | raster PNG | 806654 | `45ee7843a178518684df80996fd903d380bddae6126a4abcecf1d7af9a3c91c0` |
| raster subtotal (12) | | **12491652** | all 12 verified 1920×1080 from IHDR |
| `mockups-xv/01_dock_lighthouse.svg` | vector SVG 1600×900 | 10356 | `1643e3b0926c9014be9e7cfa1b56659b501a756be333848e99b0e34487051ffd` |
| `mockups-xv/02_project_universe.svg` | vector | 10641 | `3ecff58b6a239961a1b90b20c0af5dd868d0db79861b42c49fe7aaa6bfb68f73` |
| `mockups-xv/03_story_forge.svg` | vector | 9923 | `dcee440a3052672ceb637663005f812643ac1a6d1cdae66abec59dacb25c8454` |
| `mockups-xv/04_poster_lab.svg` | vector | 9168 | `a844b914c26647f4931e7ba0517f2d7b566b399eea2c7b38e401bd52f95529cb` |
| `mockups-xv/05_corpus_reader.svg` | vector | 10232 | `642ef8c0601fb8d4260ab9b1591d8d83b38fdf3f043403bd4b8ef1916a52c8c5` |
| `mockups-xv/06_unilex_explorer.svg` | vector | 9227 | `df3568321dacf0df743cb03947168a8587d1ca8812a19fa3d03e8be3884027fb` |
| `mockups-xv/07_moonlab_research.svg` | vector | 10291 | `dabd1754f71665a1b9f2ff2ae4ac1f1d5d434256cb38a8d941216c20d281710c` |
| `mockups-xv/08_world_monitor.svg` | vector | 9950 | `a8ca41934aa82780e19a7cf80efafc643c87be3f9dcdfbd340238410fa51a3c4` |
| `mockups-xv/09_publishing_hub.svg` | vector | 10746 | `a41fdd3372b0238db54ff12262fa00a1fa31c6168a6d4339519552196bba06e7` |
| `mockups-xv/10_harbor_commons.svg` | vector | 9628 | `50400629ac7d83a72f10a6ac78022d1b5b6b196437c9fbd52e087e550d78893e` |
| `mockups-xv/11_works_economy.svg` | vector | 9727 | `c2501821de69b0f1b4afe4ed9eac44ce23202af4ec9327846995131da2ce5c7e` |
| `mockups-xv/12_skylink_messaging.svg` | vector | 9519 | `b7bfbed25bd2f9868f848df464ae2e0df0bfe593f5ec55468555e7ccd9820caf` |
| vector subtotal (12) | | **119408** | |
| `mockups-xv/manifest.json` | metadata | 4589 | `95a3f0b39388783b7528ba0d30dd2e04e4eb6022961216e81fb0d693fb0acce4` |
| `mockups-xv/README.md` | gallery doc | 5279 | `9d17dc0ef8f95de932d01694d80ecb32aaf859f9bc69574c4a86a7e86a2571ea` |
| `APPS.md` | design doc | 1236 | `c8fa686a1017dc3aa9d69d4036b14f285d3d6b188bf169fc22ced2ca9dde8fff` |
| `ASSETS.md` | pipeline doc | 2300 | `425203cec1c809ff641200a4c9506f98f6e717faa3ed8d76311347978c406602` |
| `COMPONENTS.md` | token SSOT doc | 6354 | `97297bf2ad7194f6574e696668a40c1a3cb1692d98da1e76a774decc0ccf0d0c` |
| `M30-04-bilingual-skin-rtl-media.md` | milestone note | 8160 | `a595bbd433e833ec00187769399ed841f6b2ee139d2d0a55f3aca3d2aca0d0fe` |
| `M37-02-sso-session-redirect-boundary.md` | milestone note | 7228 | `e2b591f86144fa5b0d8c502aba12269230717c8807fec6655a8d0528d7f7c46f` |
| `M37-03-tenant-role-capability-contract.md` | milestone note | 6924 | `5d60314a49b888af59b5a3054da1e3db7505acfc7d6ac9185be89ebf9b012677` |
| `M37-04-locale-link-event-ownership.md` | milestone note | 7832 | `248388a766554c34275f64368152929f4c03ba9f916423d34645bfcf295e368c` |

**Batch-2 material in the repo: none.** `git log --oneline --diff-filter=A --name-only -- docs/design/mockups-xv` shows exactly two adding commits — `f55fd18` (12 SVG + README + manifest) and `8737fe4` (12 PNG). No `13_*` … `22_*` file exists in history or in the tree (`find` for `1[3-9]_*`/`2[0-2]_*` under the repo, build dirs excluded → 0 results). This matches [`todo-ui-2.md:7`](../../todo-ui-2.md) ("produced in the chat handoff but have not been uploaded or adopted into GitHub") and [`docs/audit/ui2-preflight-2026-10-27.md:15`](ui2-preflight-2026-10-27.md). **There is therefore nothing to clear, rename or quarantine for 13–22 yet — the intake plan in §5 is the deliverable.**

## 2. Rights / provenance evidence per asset

Authoritative statements found (all read, not inferred):

- `mockups-xv/README.md:2` — PNG+SVG are "conceptual design references, **not evidence of deployed or live product features**"; `:4` "Third-party illustrations, sample content, fonts, and source rights require review **before production redistribution**"; `:24` PNGs are "the original 12 raster mockups from the October 2026 handoff (1920×1080); their Git blob hashes match the source files"; `:26` "Audit origin, illustration rights, font licensing and content approvals before embedding any raster or derivative"; `:6` screenshots "may contain illustrative sample stats, never live operational claims".
- `mockups-xv/manifest.json:6-7` — `notDeployed: true`, `licenseReviewRequired: true`; `:149` `pngUse: "reference-only; pending rights review before production assets"`; every screen carries `status: "CONCEPT_ONLY"`.
- [`ADR-0009:12,25`](../decisions/ADR-0009-public-ui-reference-adoption.md) — "no per-asset rights record exists — no author, no SPDX identifier, no consent"; reference assets stay reference-only until a per-asset ledger row (author, SPDX or signed consent, permitted usage, content hash) exists; **no cropping, embedding, background, favicon or OG use**; reviewer check `git grep -n "mockups-xv/png" apps/` must stay empty. `:63` lists the per-asset rights ledger as an unfinished follow-up.
- [`ui-asset-ledger-d54ad43.md:124`](ui-asset-ledger-d54ad43.md) — for the 12 PNG + 12 SVG set: "Rights status: **UNRESOLVED, reference-only**".

Ledger rows (batch 1; batch 2 rows are created only when a file is uploaded):

| Asset group | Author/origin | SPDX | Consent | Permitted use | Status |
|---|---|---|---|---|---|
| 12 PNG, `mockups-xv/png/` | UNKNOWN — "October 2026 handoff" (`README.md:24`); commit author `bjo163` in `8737fe4` is *who uploaded*, not the illustrator | UNKNOWN (none recorded anywhere) | UNKNOWN | reference-only per ADR-0009 §2.1 | **UNRESOLVED — REFERENCE-ONLY** |
| 12 SVG, `mockups-xv/` | UNKNOWN — same handoff, `f55fd18` | UNKNOWN | UNKNOWN | reference-only; not for embedding | **UNRESOLVED — REFERENCE-ONLY** |
| `manifest.json`, `README.md`, `APPS.md`, `ASSETS.md`, `COMPONENTS.md`, 4× `M3x-04/0x` notes | in-repo prose authored on `dev` | NOASSERTION (repo has **no root `LICENSE`**, `package.json` has no `license` field, `private: true` — verified in `M19-01-asset-ownership.md` §1.1) | Not applicable — no person depicted | internal documentation | CLEARED (docs, not app assets) |

Two additional rights observations this audit made from the asset bytes themselves:

1. **Font references inside the vectors.** Every one of the 12 SVGs sets `font-family="Impact,Arial Black,sans-serif"` (e.g. `mockups-xv/01_dock_lighthouse.svg:14`). No font file is embedded, so nothing is redistributed today; but `docs/design/COMPONENTS.md:12` puts `Impact`, `Anton`, `Comic Sans MS`, `Segoe Print`, `Inter`, `JetBrains Mono` into the live token stack. Any batch-2 vector that enters an app must declare a font-permitted-use field — the repo has **no font licence evidence for any of these**. `ASSETS.md:2` already forbids redistributing fonts.
2. **Accessible-name state of the gallery.** All 12 SVGs open with `role="img" aria-label="MOONWITNESS XV conceptual UI reference …"` (line 1 of each file), so they would pass the SVG naming rule *if* it applied to them — but it does not: `check-ui-assets.mjs:29` explicitly excludes `docs/design/mockups-xv/**` from the scan universe. The gallery is unenforced by design; containment (§3) is the only check that touches it.

## 3. Production-asset boundary check

Served asset dirs found (`find apps -type d -name public`, build/node_modules pruned): `apps/dock/public`, `apps/headquarters/public`, `apps/cockpit/public`, `apps/cockpit/client/public`. `apps/skylink`, `apps/echolog`, `apps/arsy`, `apps/orbit` have **no** public dir and **no** raster/audio file anywhere (`find` for `*.png/jpg/jpeg/webp/gif/mp3/ico` under `apps` → 30 hits, all inside the four dirs above). `apps/dock/src/app/icon*`: none — the Dock icon is `apps/dock/public/icon.svg`.

- **Mockup → production duplicates: none.** The 33 served-asset digests computed here were set-compared against the 12 `mockups-xv/png` digests: **0 overlap** (different bytes and sizes; mockups are ~0.6–1.4 MB PNG, served art is 2–647 KB JPEG). ADR-0009 §2.1 containment also holds textually: `grep -rl "mockups-xv" apps/` → **no files**; `check-ui-assets.mjs` CHECK 4 (`:314-336`, patterns `mockups-xv/png`, `mockups-xv/NN_*.svg`, `docs/design/mockups-xv`) reports `reference_hits=0` over 497 app files.
- **Real defect, named:** the production boundary is *breached on the rights clause even though it is clean on the mockup clause*. 30 of the 33 served assets are `RIGHTS_UNKNOWN` and are nonetheless served — 28 JPEGs in `apps/dock/public/art/` + `apps/headquarters/public/art/` and 2 copies of `apps/cockpit/public/bgm.mp3` / `apps/cockpit/client/public/bgm.mp3`. Live gate output at `49ec20e`: `SUMMARY|assets_total=33|…|ledger_cleared=3|ledger_blockers=30|app_files=497|reference_hits=0|violations_total=32|violations_svg_accessiblename=2|violations_rights=30|exit=1`.
- **Byte-identical duplicates *within* the served set** (recomputed, matching the earlier ledger): `0f0fa1ae3488ddf0…` = `dock/public/art/rooftop-watcher.jpg` == `headquarters/public/art/login-watcher.jpg`; `0a4ac453f0f768b1…` = `poster-ska.jpg` in both apps; `cabb0bfcd1e3df84…` = `bgm.mp3` in both Cockpit roots; `02d2f9f3dd8f33bf…` = `favicon.svg` in both Cockpit roots. One clearance can clear two slots; renaming is not a new asset.
- **`docs/audit/screens/` is evidence, not a production asset.** It is the Playwright/visual-harness output dir (`scripts/ui/playwright.config.mjs`, `scripts/ui/paths.mjs`), git-tracked (45 PNGs), 50 PNGs present all with **unique** digests and **zero** overlap with `mockups-xv/png`. It is not served by any app. It currently holds another session's uncommitted modifications — untouched here.

## 4. What `pnpm ui:check` actually enforces — and what it does not

`package.json:51` → `node scripts/check-ui-consistency.mjs`; run by the pre-commit hook (`scripts/git-hooks/pre-commit.mjs:44`) and inside `pnpm verify` (`package.json:54`, CI: `.github/workflows/ci.yml:52`).

**Live re-verification at `49ec20e`: `Files scanned: 132 | Total Violations: 0`, exit 0.** The 132 is arithmetically confirmed: 17 mandatory surfaces (`check-ui-consistency.mjs:79-97`) + 110 unique `.tsx`/`.css` files from the 5 scan roots (`apps/dock/src` 47, `apps/headquarters/src` 24, `apps/cockpit/client` 15, `apps/echolog/client` 7, `apps/orbit/src` 16 = 109, plus hardcoded `apps/arsy/src/lib/launchpad.ts` = 110) + 5 app stylesheets in CHECK 3 = **132**.

Enforced: (1) those 17 listed files contain a literal `@moonwitness/moonui` import; (2) 26 known "drifted" hex values (`:31-58`) absent from `.tsx`/`.css` in the roots; (3) 14 forbidden local component class selectors (`:61-76`) absent from the 5 listed stylesheets; (4) `font-family` not set to raw Arial/sans-serif/monospace/Consolas/Helvetica (`:259`).

**Would a raster background entering an app be caught by `ui:check`? No.** It never lists a directory of binaries, never reads `public/`, never computes a digest, never consults a rights ledger, never looks for `background-image: url(/art/…)`, and never reads `docs/design/` at all. Its file universe is `.tsx`/`.css` plus one hardcoded `.ts` — a PNG, JPEG or MP3 is invisible to it. CHECK 4 (typography) increments only `fontDriftCount`, never `totalViolations` (`:263` vs `:269`), so a typography hit is a warning that cannot fail the build. The hardcoded-surface list is a whitelist: an app not listed (e.g. a new `apps/skylink` UI in M38-13, `apps/orbit` beyond `src/app/page.tsx`) is unpoliced.

The gate that *does* police production assets is `scripts/check-ui-assets.mjs` — SVG accessible name, SVG self-containment, ledger row + SHA-256 + `CLEARED` status, and ADR-0009 reference containment. **It is not wired anywhere**: `pnpm ui:assets` is referenced by `docs/design/ASSETS.md:6,8` and `ui-asset-ledger-d54ad43.md:5` but the root manifest exposes only `ui:check` (`package.json:51`), the pre-commit hook does not call it, and CI never runs it. The discrepancy is already acknowledged twice — `ui-asset-ledger-d54ad43.md:167` ("Register the gate as `ui:assets` and add it to CI") and `docs/design/M30-04-bilingual-skin-rtl-media.md:29` ("The guide documents `pnpm ui:assets`, but that script is absent from the current root manifest") — and is still open at `49ec20e`. So today the "no raster from the gallery" rule is enforced by a manually invoked script plus a reviewer grep, not by any hook or CI job.

## 5. Naming + intake plan for images 13–22

Numbering is kept in the existing `NN_slug` sequence, one pair per concept screen, mapped to the routes the plan already grounds (`todo-ui-2.md:51-139`). Files land in `docs/design/mockups-xv/` (SVG) and `docs/design/mockups-xv/png/` (PNG) — **reference dir only; never a served dir.**

| # | Proposed pair (same stem, both extensions) | Concept (todo-ui-2 row) | Owner app boundary | Intake disposition |
|---|---|---|---|---|
| 13 | `13_dock_station_catalog` | Signal Catalog + Station Detail | `apps/dock` `/stations`, `/stations/[id]` | REFERENCE-ONLY |
| 14 | `14_dock_denpa_transceiver` | DENPA Transceiver | `apps/dock` `/denpa` | REFERENCE-ONLY |
| 15 | `15_dock_constellation_graph` | Constellation + typed relation | `apps/dock` `/constellation` | REFERENCE-ONLY |
| 16 | `16_dock_world_patches` | World Patches Explorer | `apps/dock` `/patches` | REFERENCE-ONLY |
| 17 | `17_dock_comparative_reader` | 1·6·3 Comparative Reader | `apps/dock` `/reader/compare` | REFERENCE-ONLY (rights-gated by G02/D08) |
| 18 | `18_cockpit_media_rack` | Media Rack + IPTV + tuner | `apps/cockpit/client` | REFERENCE-ONLY |
| 19 | `19_cockpit_web_preview` | In-app web preview | `apps/cockpit/client` | REFERENCE-ONLY (security-gated by G03) |
| 20 | `20_cockpit_mission_progress` | Progress + TODO register | `apps/cockpit/client` | REFERENCE-ONLY |
| 21 | `21_hq_record_editor` | Schema-driven record editor | `apps/headquarters` `(admin)` | REFERENCE-ONLY |
| 22 | `22_hq_world_monitor` | World Monitor + Sentinel triage | `apps/headquarters` `/world-monitor` | REFERENCE-ONLY |

Rules for the batch:

1. **Naming:** `NN_lower_snake_case.svg` + `png/NN_lower_snake_case.png`, NN zero-padded 2-digit, one stem for both files, `NN` must equal `manifest.json.screens[].number` and the README table row. PNG stays 1920×1080; SVG stays 1600×900 with `role="img"` + `aria-label="MOONWITNESS XV conceptual UI reference <TITLE>"` on line 1. `13_skylink_inbox`-style names are forbidden — SKYLINK UI belongs to M38-13, not UI-II.
2. **Metadata:** extend `manifest.json` (schema `moonwitness-xv-ui-reference-v1`) with the 10 entries, each `status: "CONCEPT_ONLY"`, and keep `licenseReviewRequired: true` / `pngUse: reference-only` until per-asset evidence exists. Record provenance fields the batch-1 manifest never carried: `origin` (tool/author of the handoff export), `acquired` (date + channel), `sourceOfOriginal` (where the true master file lives — currently the chat handoff, i.e. off-repo).
3. **Ledger row required before anything enters an app** (extend `docs/audit/ui-asset-ledger-*.md`, which is `check-ui-assets.mjs`'s machine-readable source): `author/origin` with real evidence, `license SPDX` (`NOASSERTION` when undocumented — never an invented licence), `consent` (`Not applicable — no person depicted` only when true; a crowd/figure crop needs a real record), `permittedUse`, computed `SHA-256`, `status ∈ {CLEARED, UNRESOLVED — EXCLUDED-FROM-PRODUCTION, REFERENCE-ONLY}`.
4. **What may cross into an app:** only (a) an *original* vector authored for the project with a CLEARED ledger row, or (b) a re-implementation as MoonUI tokens + CSS (`COMPONENTS.md` palette/spacing/type; `ASSETS.md:2` SVG safety: safe viewBox, `<title>` or `aria-hidden`, no `<script>`/`@import`/remote href/base64). Raster PNGs — batch 1 or batch 2 — never become backgrounds, heroes, favicons or OG images. A mockup's *layout idea* is not an asset.
5. **What stays reference-only:** every `mockups-xv` raster and SVG (all 12 existing + the 10 planned) plus any inline sample statistics, fake counters, 13-item rail, global search field and mockup footer strip, which ADR-0009 §2.3 already rejects outright.
6. **Enforcement follow-up this gate depends on:** register `ui:assets` in the root manifest, run it in CI and the pre-commit hook (or a pre-push binary-diff guard), so that a committed raster into `apps/*/public` fails closed instead of relying on review. Also add a name/hash-collision check between `docs/design/mockups-xv/**` and every served dir so a cropped mockup cannot slip in under a new filename.

## 6. Verdict against the DoD

| DoD clause | Evidence | Verdict |
|---|---|---|
| "asset-origin ledger" | Batch 1 already has one (`ui-asset-ledger-d54ad43.md` §4) and §1–§2 above re-hash all 24 assets and record batch-1 status as UNKNOWN/UNRESOLVED; batch 2 has **no assets in the repo** — `git log --diff-filter=A` shows only `f55fd18` + `8737fe4`. Nothing to clear, nothing renamed, no screenshot added to a production dir. | **Satisfiable by this document** for the "plan and review" wording. |
| "do not add screenshots to production assets" | `grep -rl mockups-xv apps/` → none; `check-ui-assets.mjs` CHECK 4 `reference_hits=0` over 497 files; 0 digest overlap between the 24 design files and the 33 served assets. | **Holds.** |
| "only licensed original vector/CSS enters apps" | `node scripts/check-ui-assets.mjs` at `49ec20e` → **32 violations, exit 1**: 30 served assets with unresolved rights (28 JPEGs + duplicated `bgm.mp3`), 2 unnamed served `favicon.svg`. Plus 4 byte-identical duplicate placements inside the served set. The gate that would block these is not registered as a script, hook or CI job. | **Fails at this HEAD** — the repo-wide rule is not yet true, independently of batch 2. |
| Dependency UI2-G05 | Unchecked (`todo-ui-2.md:34`), no `docs/audit` artifact for it (dir holds only `ui2-g01-lint-*`, `ui2-g11-*`, `ui2-preflight-*`). Its DoD's `ui:check` half is green (132 files / 0 violations, verified live), but the "no-clipping" half is **contradicted by evidence**: `ui-visual-harness-d54ad43.md:150` defect A — 8 header elements laid out past 1440 px, silently cut by `overflow-x: hidden`, 12 failing records; defect B — `/reader` and `/terms` on the error boundary (20 records). No Dock/Cockpit/HQ shell+token contract doc names a source of truth beyond `COMPONENTS.md:4`. | **Open.** |

**Can UI2-G08 honestly be ticked? No.** The ledger/review deliverable is produced here (docs-only, as scoped), but the gate's second DoD clause is unmet for the whole production asset surface, G08's own second clause is not scoped to batch 2 alone, and its declared dependency UI2-G05 is open with counter-evidence on the no-clipping term. **Dependency honesty:** `todo-ui-2.md:176` ("Now: … with independent read-only G02/G03/G08/G11") and the gate policy at `:46` both treat G08 as independent, while row `:37` itself declares `depends G05`; the plan's packet-1 line understated that edge. G08's *artifacts* can be reviewed now; the checkbox belongs to the integrator after G05 closes and the 30 rights rows are cleared or removed. No checkbox was modified by this audit.
