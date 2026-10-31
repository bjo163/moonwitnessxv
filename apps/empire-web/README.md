# A-L-L-A-H.COM — Empire Story Universe static pilot

**Current status:** The owner requested removal of the isolated Vercel project on 2026-10-31. Project `a-l-l-a-h-empire-web`, its deployments, the repository's `vercel.json`, and the local `.vercel` project link have been removed. Empire continues on the owner-operated Coolify path under ADR-0016; Dock remains canonical LIGHTHOUSE under ADR-0011. This pilot adds no backend, auth, schema, API secrets, public control plane, custom domain, or DNS change.

Repository: bjo163/moonwitnessxv · apps/empire-web.

## Local checks (Node 24, pnpm 10)
From the monorepo root:
```sh
pnpm install --frozen-lockfile
pnpm --filter @moonwitness/core build
pnpm --filter @moonwitness/moonui build
pnpm --filter @moonwitness/empire-web test
pnpm --filter @moonwitness/empire-web typecheck
pnpm --filter @moonwitness/empire-web build
node apps/empire-web/test/export-check.mjs
pnpm --filter @moonwitness/empire-web dev
```
Local app: http://localhost:3010

## Hosting status

The former Vercel project and its deployments were removed on 2026-10-31 at the owner's request. The unrelated `empire-of-the-light` Vercel project was left unchanged. Historical release evidence remains in [M42-02](../../docs/tasks/M42/M42-02.md); no active Vercel deployment is authorized. The five generated WebP illustrations have the limited approval recorded in the artwork manifest; that approval does not cover the five PNG reference mockups, editorial copy, religious quotations, translations, tafsir, or source claims.

## Acceptance gates
1. Preserve the historical exact-SHA CI and Vercel READY evidence in M42-02; use current local/CI checks for later source changes.
2. Browser routes /, /id, /en; real accessible controls, mobile and keyboard.
3. Status copy: CODE EXISTS ≠ DEPLOYED; PLANNED has no fake clickthrough.
4. No PII, private sources, unsafe API endpoints, secrets or invented telemetry.
5. Retain noindex and the editorial/source/security gates; this pilot deployment is not public-indexing or full-product approval.
6. Existing Dock, ARSY and Headquarters continue unaffected.

Read: docs/product/A-L-L-A-H-COM-MASTER-SPEC.md, BLUEPRINT.md, TODO.md, and accepted ADRs.

## Information-page increment (29 October 2026)

The isolated pilot now includes `/id/about`, `/id/sources`, `/id/privacy` and their `/en` equivalents. Language links preserve the current information page. Footer links, visible mobile section navigation, and a keyboard skip link provide navigation without client-side state or another backend. The information pages remain noindex.

Privacy copy describes the application code separately from hosting logs, whose retention has not been verified. Source copy does not imply publication rights for scripture, research, or poster assets. This increment does not complete or change the canonical M31/Dock task statuses. The owner's explicit branch-specific pilot request is the scope for this work; accepted Dock runtime decisions remain authoritative for the canonical gateway.

## M45 fidelity, deviations and release record (30 October 2026)

Measured at `2e911af` after `pnpm --filter @moonwitness/empire-web build`; `node apps/empire-web/scripts/check-fidelity.mjs --strict` exits 0 with **all anchors within ±2 px** at 1122×1402 against `reference_measurements.json`, and every page reports `scroll == viewport` at 390/768/1440/1920.

| page | largest delta | measured columns |
|---|---|---|
| home | −1 (foundation 1257 vs 1258) | 30 / 297.8 / 565.5 / 833.3, right 1092 |
| library | +1 (header, footer) | 29 / 298.3 / 567.5 / 836.8, right 1093 |
| reader | 0 | 34 / 301.5 / 569 / 836.5, right 1088 |
| codex | +1 (header, footer) | 19 / 200.3 / 381.7 / 563 / 744.3 / 925.7, right 1097 |
| ggs | +1 (footer) | 27 / 525 / 840, right 1095 |

The same run keeps small text at or above AA (`--brand` 8.47, `--fg-subtle` 9.04, `--fg-muted` 6.38, `--danger` 6.50 on `--bg`), finds 0 elements still animating under `prefers-reduced-motion`, and checks 48 information-page layouts (6 sections × 2 locales × 4 widths). `node apps/empire-web/test/export-check.mjs` and `pnpm --filter @moonwitness/empire-web test` both pass. A rebuild and strict re-run on the tree that carries `b4b655f` (the footer social marks) exits 0 with the same anchors.

Deviations from the mockups, recorded rather than hidden:

- **Display face.** The references use a licensed display face. The ADR-0014 token stack resolves `--font-display` to `"Impact", "Anton", "Arial Black", …`, so the display role falls back to a locally installed face instead of a licensed webfont; the ±2 px harness matched the laid-out boxes anyway.
- **Artwork.** The five approved WebP illustrations ship; the 19 M45 slots are still `pending_approval` because the 2026-10-29 generation attempt returned `Insufficient Credits for ImageGen`, so their blocks are drawn with CSS.

Release evidence: Coolify deployment `qvgfqmwmbfhvaxqaqbcvywmg` built commit `b0b44f9d606654d45a7395b343ec73a1c9941639` (`is_webhook: true`, created 00:21:50Z, finished 2026-10-30T00:28:15Z). Its log shows `Image …-empire-web Built` and `Container empire-web-…-20261030T002351 Started`; after `finished_at`, `https://a-l-l-a-h.com/id` and `/en` served the Empire title and canonicals over HTTPS ([audit §11](../../docs/audit/M44-domain-cutover.md)).

`node apps/empire-web/test/export-check.mjs` checks the generated HTML after building: information pages, locale links, headings, main landmarks, noindex and absence of forms/embeds. It is also run by the dedicated CI workflow. It is not a browser accessibility audit or deployment check.

## Static pilot completion scope

Both `/id` and `/en` expose home plus `about`, `ecosystem`, `values`, `roadmap`, `sources` and `privacy`. `/` deterministically serves the English fallback. Locale root layouts set the actual HTML document language before JavaScript; information-page language switches preserve the section. The multi-root layout uses Next's supported experimental `globalNotFound` configuration to produce an exported bilingual recovery page. This flag must be reviewed when upgrading Next.

The atlas includes implementation state, separate unverified public-access state, audience, design owner, pinned planning/code references and source-review date. It has no unverified service destination. Four discovery cards lead to actual local information pages. Story content remains the already-present narrative reflection; no new poster or scripture publication is implied.

Verification commands after build:
```sh
node apps/empire-web/test/export-check.mjs
pnpm exec playwright install --with-deps chromium --only-shell
pnpm exec playwright test --config apps/empire-web/playwright.config.mjs
```
The Playwright suite covers both locales at 390px and 1440px, keyboard skip navigation, all information-page links and locale round trips, overflow, global 404, JavaScript errors and unexpected external requests. The dedicated CI workflow runs it after the static build; configuring it is not evidence of a passing run.

See `docs/audit/empire-web-static-pilot-2026-10-29.md` for observed local evidence and remaining release gates. ADR-0012 and M42 retain the historical Vercel authorization and deployment record; the owner withdrew that authorization and the project was removed on 2026-10-31. Coolify remains the current Empire hosting path.

## Story Universe design reference (draft)

Five page-level mockups are specified in [docs/story-universe/README.md](docs/story-universe/README.md), with the full visual/narrative bible, reusable design tokens, content manifest, private source-image SHA-256 manifest, and local AI execution prompt. The complementary [MoonUI bridge](../../packages/moonui/docs/EMPIRE_STORY_UNIVERSE_BRIDGE.md) keeps shared package ownership unchanged. The five PNG files stay private under `docs/`; only the five owner-approved generated WebPs may be in `public/` and the export.
