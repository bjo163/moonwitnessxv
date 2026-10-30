# M45 — mockup fidelity evidence ledger

**Date:** 2026-10-30 (Asia/Jakarta) · **SHA at last verification:** `2e0ab9c` · **Owner authorization:** explicit instruction to make the five pages match the mockups, with three scoped choices (regenerate artwork per slot, reproduce copy verbatim, carry the language across the site).

This file is the audit trail for the fidelity claim. The readable design rationale lives in [docs/story-universe/README.md](../story-universe/README.md); the measured reference values live in [docs/story-universe/LAYOUT_SPEC.md](../story-universe/LAYOUT_SPEC.md) and `contracts/reference_measurements.json`.

## 1. How the numbers were produced

`apps/empire-web/scripts/measure-reference.mjs` loads each `1122×1402` PNG at 1:1 in Chromium and reads the interface layers out of the pixels: structural rows by luminance jumps, column edges inside each band, and saturated-red rectangles (CTAs, active states). No coordinates were estimated by eye.

`apps/empire-web/scripts/check-fidelity.mjs` measures the built export the same way and compares. `--strict` fails on any band drift beyond **±2px**, a missing section, an `h1` count other than 1, horizontal overflow at 390/768/1440/1920, a contrast pair below **4.5:1**, any element still animating under `prefers-reduced-motion`, or a touch target below **24px**.

## 2. Measured result (1122×1402, both locales)

| Page | Band bottoms (px) | Columns (px) |
|---|---|---|
| Home (REF-01) | 73 / 546 / 1035 / 1258 / 1346 / 1402 | 30 / 297.8 / 565.5 / 833.3, right 1092 |
| Library (REF-02) | 73 / 443 / 581 / 653 / 1033 / 1264 / 1346 / 1403 | 29 / 298.3 / 567.5 / 836.8, right 1093 |
| Reader (REF-03) | 73 / 104 / 1218 / 1331 / 1374 / 1402 | 34 / 301.5 / 569 / 836.5, right 1088 |
| Codex (REF-04) | 73 / 416 / 722 / 945 / 1264 / 1349 / 1403 | 19 … 1097 |
| GGS (REF-05) | 73 / 487 / 571 / 917 / 1260 / 1341 / 1403 | 27 / 525 / 840, right 1095 |

`--locale en` and `--locale id` both report **all anchors within ±2px**. The Indonesian copy is longer in places (`GGS — / SEKOLAH BULAN / PURNAMA`) and still lands in the same boxes, which is what the plan's assumption required.

Reference deltas that remain inside tolerance but are not zero: the library's fourth card sits 13px left of a uniform grid in the mockup, and the codex trait columns are uneven (178/184/172/179/174/191). The app uses uniform grids and the harness asserts only the outer edges there.

## 3. Gates in CI

`.github/workflows/empire-web-preview.yml` after the navigation test:

```yaml
- name: Verify mockup fidelity (en)
  run: node apps/empire-web/scripts/check-fidelity.mjs --strict
- name: Verify mockup fidelity (id)
  run: node apps/empire-web/scripts/check-fidelity.mjs --strict --locale id
```

Additional suites: `contracts.test.mjs` (6), `token-purity.test.mjs` (4), `export-check.mjs` (6 PASS groups), `navigation.browser.mjs` (4 browser runs), `scripts/check-ui-consistency.mjs` (149 files).

Latest observed: CI `40979713635` **success**, Empire Web Preview Build `40979713733` **success**, `main` = `2e0ab9c`.

## 4. Accessibility numbers

```
--brand on --bg        8.47      --danger on --bg       6.50
--fg-subtle on --bg    9.04      --danger on --bg-1     6.03
--fg-muted on --bg     6.38      --brand on --bg-1      7.86
--fg on --bg          16.88
reduced motion: 0 element(s) still animate
touch targets: 16 measured · under 24px: 0 · under 44px (AAA, advisory): 10
info pages: 48 layouts checked (6 sections × 2 locales × 390/768/1440/1920)
```

The contrast gate found a real defect: `--brand-2` (`#db1e31`) is **3.98:1** on `--bg` — acceptable for the 70px display headlines, not for the 6–7px red labels the mockups use. Those eight text rules now use `--danger`; red fills, borders and large type keep the brand hue.

## 5. Deviations carried deliberately

1. **Artwork.** Five approved WebPs stand in for 19 planned slots (`ARTWORK_SLOTS.md`). Generation is blocked on image credits; each slot swaps one `src`.
2. **Display face.** The mockups use a licensed condensed grotesk; the app keeps `--font-display` (Impact/Anton/Arial Black). No webfont was added.
3. **Per-page footer height.** The mockups disagree (88+56 home, 78+55 library, 43+28 reader, 73+51 codex, 78+59 GGS). One `SiteFooter` component serves all five through `--footer-main-h` / `--footer-bar-h`.
4. **Uniform grids** where the mockups are uneven (see §2).
5. **Verbatim copy** under `CLAIMS.md`. The Qur'an panel is withheld (rights); `LIVE NOW` / `JOIN TODAY` carry a story-time caption; `50+ STORIES & IDEAS` is an unsupported metric the owner accepted.
6. **`/` stays zine.** `out/index.html` is asserted to be `data-skin="zine"` (ADR-0014); only the six information pages moved to the empire chrome.

## 6. Not met

| Item | Evidence |
|---|---|
| **M45-03** — 19 artwork slots | `ImageGen` returns `Insufficient Credits for ImageGen`; zero slots generated. Probe repeated 2026-10-30. |
| **M45-15** — `DEPLOYED_VERIFIED` | `https://a-l-l-a-h.com/en` → `Server: hcdn`, 32 079 bytes, `<title>Parked Domain name on Hostinger DNS system</title>`. The Vercel preview does serve the build (`su-home__hero` present), but it is not the canonical host. |

`DEPLOYED_VERIFIED` is defined in [RELEASE.md](../architecture/RELEASE.md) as a real HTTPS host with the deployment SHA and logs. Neither exists for M45 yet, so the milestone cannot be marked complete regardless of how green the repository gates are.

## 7. Re-running this evidence

```sh
pnpm --filter @moonwitness/empire-web build
node apps/empire-web/scripts/check-fidelity.mjs --strict
node apps/empire-web/scripts/check-fidelity.mjs --strict --locale id
node --test apps/empire-web/test/contracts.test.mjs apps/empire-web/test/token-purity.test.mjs
node apps/empire-web/test/export-check.mjs
pnpm exec playwright test --config apps/empire-web/playwright.config.mjs
```

Screenshots and per-page JSON land in `apps/empire-web/test-results/fidelity/` (outside `out/`, because the export contract forbids PNGs in the build output).
