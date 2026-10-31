# UI asset ledger — production surface @ `d54ad43` baseline

**Scope:** `todo-ui.md` leaf **UI-F14** (icon/vector pipeline: title/ARIA, no external scripts, license + content hash) and acceptance gate **QA-01** (source/license ledger for every production asset).
**Anchor:** task baseline `d54ad43` (verified an ancestor of the pre-change `dev` HEAD `db4e83f`). Hashes below were recomputed against the tree at collection time, not copied from an earlier audit.
**Enforcer:** `node scripts/check-ui-assets.mjs` (`pnpm ui:assets`), which parses the table in §2 as its source of truth.
**Rights vocabulary:** reused from the ratified [M06-06 classification](../decisions/M06-06-rights-classification.md) — `RIGHTS_UNKNOWN` may not be served on public endpoints or committed as raw media bytes.

> **Historical headline result at the original scan: QA-01 was RED.** 33 files were served from app public dirs. 3 were accounted for (owner-authored vectors); **30 were `RIGHTS_UNKNOWN` (UNRESOLVED) and live in production**. The scan universe was extended on 2026-10-31 to include Empire's public artwork and framework favicon; the current table contains 39 rows. The original baseline remains historical.

---

## 1. Scan universe — what is in, what is out, and why

**IN (assets the apps actually serve; git-tracked sources):**

| Directory | Served by | Evidence |
|---|---|---|
| `apps/dock/public/` | Dock (Next.js static root) | `apps/dock/src/app/globals.css:130,384,617`, `apps/dock/src/ui/components/sections.tsx:38-44,68,114,148,216,329` |
| `apps/headquarters/public/` | Headquarters (Next.js static root) | `apps/headquarters/src/app/(admin)/page.tsx:43,51,59,67,119` |
| `tools/cockpit/public/` | Cockpit node server | `tools/cockpit/src/server.ts:21` candidate root, `:93` `favicon.svg`, `:104` `bgm.mp3` |
| `tools/cockpit/client/public/` | Vite `publicDir` (`root` = `tools/cockpit/client`) | `tools/cockpit/vite.config.mjs:9`; `tools/cockpit/src/server.ts:105` fallback `../client/public/bgm.mp3` |
| `apps/empire-web/public/` | Empire Web (Next.js static root) | Five approved Story Universe WebP files; approval scope is recorded in the app artwork manifest |
| `apps/empire-web/src/app/icon.svg` | Empire Web (Next.js metadata icon) | Framework-served favicon source, included as an explicit scan file |

**OUT, with reason:**

- `dist/`, `.next/`, `build/`, `node_modules/` — generated output, not source assets. Verified rather than assumed: `tools/cockpit/dist/client/favicon.svg` is **byte-identical** to `tools/cockpit/client/public/favicon.svg` (`02d2f9f3dd8f33bf…`, 794 B), and `dist/client/bgm.mp3` matches `cabb0bfcd1e3df84…`. The brief's claim that `dist/client` is a build artifact and not a source asset **holds**; auditing it would double-count and would let a stale bundle mask source drift.
- `docs/design/mockups-xv/**` — 12 PNG + 12 SVG **reference-only** per [ADR-0009 §2.1](../decisions/ADR-0009-public-ui-reference-adoption.md). They are not production assets, get no ledger row in §2, and are excluded from the asset scan. Instead §4 proves no app can reach them.
- `packages/moonui` crown / seal / icons — inline JSX is **source code, not a binary asset**: it ships inside JS bundles, has no independent file digest, and cannot be cropped into another product without copying source. §3 records how the pipeline accounts for it.

---

## 2. Ledger of served assets (39 rows)

Legend — **Status**: `CLEARED` = authorship established and use inside this product documented (does **not** mean openly licensed); `UNRESOLVED — EXCLUDED-FROM-PRODUCTION` = no rights evidence, must be pulled from the served dir.
**License (SPDX)**: `NOASSERTION` is SPDX's reserved value for "no license determined" — it is an absence of claim, never a grant.

| Asset path | SHA-256 | Bytes | Author / origin | License (SPDX) | Consent | Status |
|---|---|---|---|---|---|---|
| `apps/empire-web/public/story-universe/home-mooncity.webp` | `06172c0819af0bacb8735339dbcc33b24a7a44f55640006db0a2b72d6a7134c3` | 310642 | AI-generated for MoonWitness XV; see `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json` for approval and scope | NOASSERTION | Not applicable — fictional generated illustration; no identified real person | CLEARED |
| `apps/empire-web/public/story-universe/library-guardian.webp` | `45e3727ca1b3a086ca6e6f7be5f6034b94533824e226c55e9e59c8f5040c1506` | 254828 | AI-generated for MoonWitness XV; see `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json` for approval and scope | NOASSERTION | Not applicable — fictional generated illustration; no identified real person | CLEARED |
| `apps/empire-web/public/story-universe/reader-poster.webp` | `d945df57c68310e95a0bd8054c0c7d270fa09136248175b1e56433d2ecf39939` | 270472 | AI-generated for MoonWitness XV; see `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json` for approval and scope | NOASSERTION | Not applicable — fictional generated illustration; no identified real person | CLEARED |
| `apps/empire-web/public/story-universe/codex-guardian.webp` | `806577d44ede0a2e179704264cb80e7198c9d8c51a1eb99776963f0f84d4fc47` | 102216 | AI-generated for MoonWitness XV; see `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json` for approval and scope | NOASSERTION | Not applicable — fictional generated illustration; no identified real person | CLEARED |
| `apps/empire-web/public/story-universe/moon-academy.webp` | `6b2672751021e632f49421734fd5f07cf45bb40862f81f12f9fb1a0fd2c999d3` | 193172 | AI-generated for MoonWitness XV; see `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json` for approval and scope | NOASSERTION | Not applicable — fictional generated illustration; no identified real person | CLEARED |
| `apps/empire-web/src/app/icon.svg` | `fb8c998eb5b547ce21799b6714f09ba653efd876c0175aee8ddbbee4171742f7` | 844 | Original Empire orbital mark created in-repo for MoonWitness XV; geometry and palette align with the shared Empire skin | NOASSERTION | Not applicable — abstract vector; no person depicted | CLEARED |
| `apps/dock/public/icon.svg` | `c8f5b26f53820d99c2e24a6ea43d581c6e33d089f9620d810306b49815e94722` | 402 | bjo163 (repo owner) — in-repo original vector; added `0e0b3b8` 2026-10-26 | NOASSERTION | Not applicable — no person depicted | CLEARED |
| `tools/cockpit/public/favicon.svg` | `02d2f9f3dd8f33bf5402cc453789ac00a194cba1eed2b380b188671b5755c76d` | 794 | bjo163 (repo owner) — in-repo original vector; added `3178a4c` | NOASSERTION | Not applicable — no person depicted | CLEARED |
| `tools/cockpit/client/public/favicon.svg` | `02d2f9f3dd8f33bf5402cc453789ac00a194cba1eed2b380b188671b5755c76d` | 794 | bjo163 (repo owner) — byte-identical duplicate of `tools/cockpit/public/favicon.svg` | NOASSERTION | Not applicable — no person depicted | CLEARED |
| `tools/cockpit/public/bgm.mp3` | `cabb0bfcd1e3df84f61490dffc967ecb47b0f8d67061694f0ff1291b483a09c9` | 2606046 | UNRESOLVED — bulk binary commit `3178a4c`, no source or author recorded | UNRESOLVED | UNRESOLVED — performers/writers unknown; ASSETS.md forbids unlicensed music | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `tools/cockpit/client/public/bgm.mp3` | `cabb0bfcd1e3df84f61490dffc967ecb47b0f8d67061694f0ff1291b483a09c9` | 2606046 | UNRESOLVED — bulk binary commit `3178a4c`, no source or author recorded | UNRESOLVED | UNRESOLVED — performers/writers unknown; ASSETS.md forbids unlicensed music | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-1.jpg` | `bb0ea932f2c23a372beaa0f3a0f41e1cd1c485b8627eb0fa3e0c152ebe4aa82a` | 2438 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-2.jpg` | `c5c8af6ab8f6fdd96443333d3516f14d2393cc7cece866d4a4747918a78dff82` | 2476 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-3.jpg` | `7dabd8f23ab89214bfa4d8b082eb92e3a820bc784132bbbe3c41ffa3b8b1e498` | 2432 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-4.jpg` | `d0985224855b540ac12ebf3c60668b5798d2ad1eccd6b3379317b060028ceecb` | 2866 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-5.jpg` | `caccdd5ff45d166ed9412f210471182d781ab61d8df5d11fa1537e6bc4f4405e` | 2206 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-6.jpg` | `8f62601c7e2453749674a4fe6ee6a94cfa024dffeba8d650ce755fa83c05f8f8` | 2604 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/archive-7.jpg` | `1c1b0c8ee962c257b4b8bf3360cc453c9d4fab14b38d8ab80f580b628e88e7ba` | 2518 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/band-hero.jpg` | `e9e79c0e554007917e502a71da6b37e6ef4ddf63d08ca355534ffee0ece3ef42` | 153084 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/card-shadow.jpg` | `c285a3c916c4c178aa6add9133d7eca54281fab8e6acc84e13ba45b56825966b` | 13808 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/card-storytelling.jpg` | `8c305305d562144e329085c6f318fed077f614898e8cb33a123d3a46c6eed00c` | 15939 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/card-transmission.jpg` | `594ccb966606752d390fae71cc5fb960c1c4e70531032ce6aeb55b411abfbd7a` | 16621 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/constellation-map.jpg` | `31fbf1475ce5b62319379ca2427c57ec06521ca4b505560f74fbd1f7109878f7` | 34375 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/footer-crowd.jpg` | `8c7074e0dcc789affab866e6b647e878e6e3f97ec9095d3dc7050c1e7ee57f9e` | 34943 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — crowd scene; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/hero-banner.jpg` | `492f20e504bfda82d133f8df472acd8095a884fd3656d2e9f9b6fb67a988c83a` | 132295 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/hero-girl-moon.jpg` | `fb915ffae106334a6ab36f665aed09d0a7825029e35d8ab6fc0588a62d782c81` | 102057 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — depicts a figure; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/moon-corner.jpg` | `822da953bd70e25264e6af97c2e82cdf8c71e5aac801e798a698407a928b8414` | 11127 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/poster-ska.jpg` | `0a4ac453f0f768b199a64a4b6f1985f7b7d1eb15a0ca1bf75383f0831bb126a0` | 647303 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — poster artwork; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/dock/public/art/rooftop-watcher.jpg` | `0f0fa1ae3488ddf0eb41d636b652369fc52387b12b5e0dca62c31e4d65850b95` | 152685 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — depicts a figure; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/login-watcher.jpg` | `0f0fa1ae3488ddf0eb41d636b652369fc52387b12b5e0dca62c31e4d65850b95` | 152685 | UNRESOLVED — bulk binary commit `787210b`; **same bytes as `apps/dock/public/art/rooftop-watcher.jpg`** | UNRESOLVED | UNRESOLVED — depicts a figure; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/manga-eye.jpg` | `dfff41ed67c68e7df7278879070eafc1aab00524df22e32e71f65890b8ab49d4` | 8703 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figure; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/mission-hero.jpg` | `b521b4edb118aaa2f6992d3e1b3ab871d6fec0ce2684c6810d840469a484445e` | 91126 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/mission-operator.jpg` | `cfbf823c07a1d416503ae3c3ba23a6a59a748187cca71f7c19f041114be1c863` | 53238 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/moon-radar.jpg` | `7d7734c6b4dee3ab1c2de1de05880df57a311b9a551ea043bdff51e71a36c201` | 40935 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/poster-ska.jpg` | `0a4ac453f0f768b199a64a4b6f1985f7b7d1eb15a0ca1bf75383f0831bb126a0` | 647303 | UNRESOLVED — bulk binary commit `787210b`; **same bytes as `apps/dock/public/art/poster-ska.jpg`** | UNRESOLVED | UNRESOLVED — poster artwork; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/proj-allah.jpg` | `c8655cf1497752a453c5a585d007cf60da28d237f5efb9456e4b3fc0d4b7fc91` | 4244 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/proj-batteries.jpg` | `7100d1176cecbc488d3e765931fa971171e548160e888c75507c61e71f7336dc` | 3962 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/proj-pendeta.jpg` | `1ba9f345cbe796d7e6d6e6d28c967cabd256d79843996220e67f8a58c15524f9` | 3835 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |
| `apps/headquarters/public/art/proj-zill.jpg` | `f1204a0eecee447123afa0e5b93d31562d8ceb26622c897bf4159db53eada518` | 3342 | UNRESOLVED — bulk binary commit `787210b`, no author or source recorded | UNRESOLVED | UNRESOLVED — stylised figures may be depicted; no consent record | UNRESOLVED — EXCLUDED-FROM-PRODUCTION |

Full 64-hex digests are stored in the table above because the gate parses this file as its machine-readable source of truth and compares the complete digest it computes (`node:crypto` SHA-256). The §4 reference table keeps the 16-char house style of [`ui-baseline-8737fe4.md:60-73`](ui-baseline-8737fe4.md) because those files are deliberately outside the gate.

### 2.1 Content duplicates found (single digest, multiple placements)

| Digest (16) | Bytes | Placements | Consequence |
|---|---|---|---|
| `0f0fa1ae3488ddf0` | 152685 | `dock/…/rooftop-watcher.jpg`, `headquarters/…/login-watcher.jpg` | One rights clearance clears two slots; renaming does not create a new asset. |
| `0a4ac453f0f768b1` | 647303 | `dock/…/poster-ska.jpg`, `headquarters/…/poster-ska.jpg` | Largest raster pair (1.25 MB shipped twice). |
| `cabb0bfcd1e3df84` | 2606046 | `cockpit/public/bgm.mp3`, `cockpit/client/public/bgm.mp3` (+ `dist/client` copy) | Audio duplicated in source, not just build output. |
| `02d2f9f3dd8f33bf` | 794 | `cockpit/public/favicon.svg`, `cockpit/client/public/favicon.svg` (+ `dist/client` copy) | Vector duplicated in two served source dirs; keep one canonical. |

**Provenance method and its limit:** every UNRESOLVED row was traced with `git log --diff-filter=A` to the adding commit and author. Git author (`bjo163`) is the *person who committed the file*, which is **not** evidence of artwork authorship or of a redistribution licence; commit `787210b` ("stabilize UI design system…") and `3178a4c` drop finished binaries with no source, no vendor manifest and no `LICENSE`/`README` inside `public/art/` (verified: `find apps -path '*/public/*' -name '*.md' -o -path '*/public/*' -name 'LICENSE*'` → no results). The repository also declares **no** root `LICENSE` file and `package.json` carries no `license` field (`private: true`), so no blanket licence can be inferred for any asset. Nothing here was assumed, and no SPDX identifier was invented.

---

## 3. Inline JSX artwork — code, not an asset

The crown, seal and icon set are procedural/inline SVG emitted by React components. They have no file-level digest, so they cannot appear in §2; the pipeline accounts for them by asserting naming at the component level instead.

| Artwork | Source | Naming today | Evidence |
|---|---|---|---|
| `Crown` (3-point zine crown) | `packages/moonui/src/zine.tsx:14` (component), `aria-hidden` at `:33` | decorative | hand-drawn path, `viewBox="0 0 36 26"`, `stroke="currentColor"` |
| `StationSeal` (procedural heraldic seal) | `packages/moonui/src/seal.tsx:58` | **named**: `role="img"` + `aria-label="{name} Insignia Seal"` (`:63-64`) | deterministic PRNG from station metadata, replacing third-party raster logos |
| `Icon*` factory (32 exported icons) | `packages/moonui/src/icons/index.tsx:10-26`, `aria-hidden="true"` at `:22` | decorative | single `svg()` wrapper, `stroke="currentColor"` |
| `Glyph` / `Chevron` | `packages/moonui/src/glyph.tsx:24,43` | decorative | |
| CRT backdrop layers | `packages/moonui/src/crt.tsx:50,67` | decorative | |
| `MoonAvatar` generator | `packages/moonui/src/avatar/generator.tsx:39-45,94-100,132-137` | **named**: `role="img"` + `aria-label={alt}` | |
| **S-meter galvanometer face** | `packages/moonui/src/client/s-meter.tsx:82` | **GAP — neither named nor `aria-hidden`** | only inline SVG in MoonUI found without an accessible-name decision |

Two consequences: (1) a rights review of these components is a **code** review under the repo's own licence position (`NOASSERTION`, §2), not an asset clearance; (2) the UI-F14 naming rule is *not* fully satisfied in-library — `s-meter.tsx:82` needs `aria-hidden="true"` (it is decoration inside a labelled meter) or a `role="img"`+`aria-label`. That file is owned by the concurrent MoonUI task (#1) and was **not** edited here; it is recorded as the named follow-up. `pnpm ui:check` (`scripts/check-ui-consistency.mjs`) covers token drift in these files, and no automated check yet covers inline-JSX naming — that gap is now explicit rather than implied.

---

## 4. Reference media quarantine (ADR-0009 §2.1)

`docs/design/mockups-xv/` holds 12 PNG (1920×1080) + 12 SVG reference files. They are **not** in the asset scan universe. Recomputed at this baseline, the PNG digests match the 16-char prefixes recorded in [`ui-baseline-8737fe4.md:62-73`](ui-baseline-8737fe4.md) exactly — the files have not been silently replaced since that audit.

| # | PNG digest (16) | Bytes | SVG companion digest (16) |
|---|---|---|---|
| 01 | `80c315c954c2652b` | 1425238 | `1643e3b0926c9014` |
| 02 | `4bcff08d6ab9907f` | 1330106 | `3ecff58b6a239961` |
| 03 | `859e0b788710b85c` | 1295601 | `dcee440a3052672c` |
| 04 | `aadad8f3293b5fe7` | 1364778 | `a844b914c26647f4` |
| 05 | `960073f54982c220` | 859029 | `642ef8c0601fb8d4` |
| 06 | `0395aed20b33ea91` | 1031432 | `df3568321dacf0df` |
| 07 | `c74461de3548f3b1` | 877307 | `dabd1754f71665a1` |
| 08 | `e1247803a21dfad5` | 962129 | `a8ca41934aa82780` |
| 09 | `4f94d6b34b5a1e5d` | 628978 | `a41fdd3372b0238d` |
| 10 | `1749b20eff957935` | 1129170 | `50400629ac7d83a7` |
| 11 | `497af92fd2f4d62d` | 781230 | `c2501821de69b0f1` |
| 12 | `45ee7843a1785186` | 806654 | `b7bfbed25bd2f986` |

Rights status: **UNRESOLVED, reference-only** — `manifest.json` carries `licenseReviewRequired: true` and `pngUse: "reference-only; pending rights review before production assets"`; no per-file author, SPDX or consent exists. No cropping, embedding, background, favicon or OG use is permitted until a per-asset row is added here with real evidence.

Containment check (gate CHECK 4): `git grep -n "mockups-xv/png" -- apps/` → **no matches**; the gate additionally scans every `.tsx/.ts/.js/.mjs/.css/.html/.json/.md/.txt` file under `apps/` for `mockups-xv/png`, `mockups-xv/NN_*.svg` and `docs/design/mockups-xv` and finds **0 hits**. The 30 UNRESOLVED JPEGs in §2 are therefore *not* byte-copies of the reference PNGs (different digests, different sizes) — they are a separate unprovenanced set, which is why they need their own clearance rather than inheriting the reference review.

---

## 5. Gate result at this baseline

`node scripts/check-ui-assets.mjs` on the working tree:

| Check | Result |
|---|---|
| 1 — SVG accessible name | **2 violations** (`tools/cockpit/public/favicon.svg`, `tools/cockpit/client/public/favicon.svg`: no `<title>`, no `role="img"`+`aria-label`, not `aria-hidden`); `apps/dock/public/icon.svg` passes |
| 2 — SVG self-containment | **0 violations** — 3/3 vectors carry no `<script>`, `@import`, remote `href`/`xlink:href`, remote `<image>`, `url(//…)` or base64 payload |
| 3 — Ledger row + hash + resolved rights | **30 violations** — all 30 UNRESOLVED rows are served; 3 CLEARED rows hash-match the ledger |
| 4 — Reference containment | **0 violations** |
| **Total** | **32 violations → exit 1** |

Machine-readable line emitted: `SUMMARY|assets_total=33|svg_total=3|…|ledger_cleared=3|ledger_blockers=30|violations_total=32|exit=1`.

### 5.1 Both-directions proof (executed; temporary edits reverted)

The gate accepts `--root` / `--ledger` overrides, which is the test seam used below. A sandbox tree mirroring `apps/dock/public/` was used for the positive run and for the SVG-content negatives, because mutating the other agents' live files under `tools/cockpit/` would have been a false-authority edit outside this packet's scope.

| # | Command run | Observed |
|---|---|---|
| A | `node scripts/check-ui-assets.mjs` (real tree) | `exit=1`, `violations_total=32`, `svg_accessiblename=2`, `svg_selfcontained=0`, `ledger_hash=0`, `rights=30`, `reference_hits=0` — the honest QA-01 verdict |
| B | Sandbox fixture, conforming: one `<title>`-bearing SVG + one `CLEARED` row with correct digest | `exit=0`, `violations_total=0`, `assets_total=1`, `ledger_cleared=1` — **the gate is not vacuously failing** |
| C | Real repo ledger, first hex char of the `apps/dock/public/icon.svg` digest flipped `c8f5b26f…` → `08f5b26f…` | `exit=1`, `violations_ledger_hash=1`, `violations_total=33` ("content hash does not match the ledger") |
| C-1 | Ledger restored from a byte copy taken before the tamper | ledger SHA-256 `c543e95cc82a2443` before **and** after; re-run shows `violations_ledger_hash=0` |
| D | Sandbox: `<title>` removed from the fixture SVG | `exit=1`, `violations_svg_accessiblename=1` ("has no accessible name") |
| E | Sandbox: SVG carrying `<script>`, a remote `xlink:href`, a remote `<image>` and a `data:…;base64` payload | `exit=1`, `violations_svg_selfcontained=4` — one violation per distinct hazard |
| F | Sandbox: app source line pointing at `docs/design/mockups-xv/png/01_dock_lighthouse.png` | `exit=1`, `violations_reference=1` |
| G | Sandbox: a `CLEARED` ledger row whose file was deleted (`apps/dock/public/gone.svg`) | `exit=1`, `violations_ledger_stale=1` ("ledgered as CLEARED but no file exists in any scanned dir"). Rows carrying a non-shipping status may point at nothing — keeping that evidence after removal is the ledger's job. |
| H | Sandbox: app source line pointing at the reference PNG, run twice | first version double-counted one line (two patterns matched); corrected to one violation per offending line → `violations_reference=1` |

A green run is claimed **only** for the fixture (B), never for the product tree. The real tree cannot pass checks 1 and 3 today: the two serving defects live in `tools/cockpit/` and `packages/moonui/` (owned by concurrent tasks) and the 30 UNRESOLVED rights rows need evidence this repository does not contain. Greening the ledger would have meant inventing licences, which this packet forbids.

### 5.2 Unblock actions (QA-01 exit criteria)

1. **30 raster + audio assets:** obtain per-file author + licence (or replace with original work). Until then they violate M06-06's `RIGHTS_UNKNOWN` invariant and should be pulled from `public/art/` (Dock/HQ) and `public/bgm.mp3` (Cockpit), with CSS/`<Card variant="art">` slots switched to MoonUI tokens or an original vector.
2. **`tools/cockpit/**/favicon.svg`:** add `role="img" aria-label="Moonwitness Cockpit"` (or `<title>`) — one line, and delete the duplicate so only the Vite `publicDir` copy is served.
3. **`packages/moonui/src/client/s-meter.tsx:82`:** decide name vs decorative for the inline SVG.
4. **Gate status:** the root `ui:assets` command is registered and now scans Empire's public artwork plus its framework favicon. The full gate still reports 30 legacy rights blockers and two Cockpit SVG naming violations, so it is not safe to make this failing whole-repository gate a required CI check yet. Empire's six current served assets pass their hash, ledger, and SVG checks in the latest observed scan.
5. **Optional future hardening:** the gate flags base64 payloads as unaccounted; if a legitimate embedded font/asset is ever approved, add it as a ledger row with a digest instead of relaxing the rule.

## 6. Evidence commands

```
git rev-parse --abbrev-ref HEAD            # dev
git rev-parse HEAD                         # 76ecdc5 (working HEAD)
git merge-base --is-ancestor d54ad43 HEAD  # true — task baseline is an ancestor
node --input-type=module -e "...walk+sha256 over apps/*/public..."   # §2 digests (33 files)
Get-FileHash docs/design/mockups-xv/png/*.png -Algorithm SHA256      # §4 digests, match ui-baseline-8737fe4
git log --diff-filter=A --format="%h %an %ad %s" -- apps/dock/public/art/hero-girl-moon.jpg   # 787210b
git log --diff-filter=A --format="%h %an %ad %s" -- tools/cockpit/public/bgm.mp3               # 3178a4c
git grep -n "mockups-xv/png" -- apps/        # empty
find apps -path '*/public/*' -name '*.md' -o -path '*/public/*' -name 'LICENSE*'   # empty
node scripts/check-ui-assets.mjs           # exit 1, 32 violations
node scripts/check-ui-assets.mjs --root <sandbox> --ledger <sandbox-ledger>   # exit 0 (proof B)
```

| Gate | Result at this baseline |
|---|---|
| `node scripts/check-ui-assets.mjs` | **32 violations, exit 1** — `svg_accessiblename=2`, `rights=30`, `svg_selfcontained=0`, `ledger_hash=0`, `ledger_missing=0`, `ledger_stale=0`, `reference=0`. QA-01 **RED** by evidence. |
| Scan coverage | 33 served assets (3 SVG, 28 raster, 2 audio, 0 font), 33 ledger rows, 3 `ledger_cleared`, 30 `ledger_blockers`; every tracked file under `apps/` searched for reference embeds (`app_files=` in the SUMMARY line is the live count and moves with concurrent work — compare violations, not that number) |
| Sandbox: conforming tree | 0 violations, exit 0 |
| Sandbox: altered SHA-256 (real ledger, reverted) | `violations_ledger_hash=1`, exit 1 |
| Sandbox: unnamed SVG | `violations_svg_accessiblename=1`, exit 1 |
| Sandbox: `<script>` + remote href/image + base64 | `violations_svg_selfcontained=4`, exit 1 |
| Sandbox: app file embedding a mockup PNG | `violations_reference=1`, exit 1 |
| Sandbox: stale `CLEARED` row | `violations_ledger_stale=1`, exit 1 |
| `git grep -n "mockups-xv/png" -- apps/` | empty — ADR-0009 §2.1 holding |
