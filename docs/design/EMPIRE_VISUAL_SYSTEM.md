# Empire visual system

This document defines the shared visual language for Empire Web. The application selects the `empire` skin; MoonUI remains the single owner of color roles, reusable components, and component geometry. It does not grant rights to reference imagery or unapproved editorial artwork.

## Art direction

Empire should feel like a contemporary observatory and a considered editorial imprint: precise geometry, generous negative space, restrained metallic warmth, and one clear signal color. The system avoids noisy neon, decorative effects that compete with reading, and typefaces without documented rights.

| Role | Use |
|---|---|
| `--bg`, `--bg-1`, `--bg-2`, `--surface` | Near-black dark surfaces and warm paper-like light surfaces |
| `--brand`, `--brand-soft` | Brass light, key lines, primary mark and selected headings |
| `--brand-2` | A small red signal point or deliberate action emphasis |
| `--signal`, `--rule`, `--rule-strong` | Secondary diagram lines, quiet labels and structure |
| `--fg`, `--fg-muted`, `--fg-subtle` | Reading hierarchy, with contrast maintained by the skin contract |

Role values live only in `packages/moonui/src/tokens.ts` and `packages/moonui/moon.css`. Dark and light blocks must agree with `MOON_SKINS` and `MOON_BRIGHTNESSES`; the MoonUI skin tests pin that parity and check text, focus, and hairline contrast.

## Vector grammar

The mark pairs a fine orbital ring with a four-point light and one red signal point. Its companion hero illustration uses concentric rings, a single tilted orbital path, a centered architectural portal, and sparse locator points. Linework stays thin and calm; glow is limited to the mark at display size. Gold and red come from theme roles in React artwork, never from component-local hex values.

The shared implementation is:

- `IconEmpireMark` for the brand mark, exposed through the MoonUI icon and root exports.
- `EmpireOrbitArtwork` for the decorative landing illustration, owned by MoonUI and consumed by `LandingPage`.
- `SiteBrandCopy.mark = 'empire'` to select the mark in the shared header and footer. Other brands keep the default Moon icon.
- `apps/empire-web/src/app/icon.svg` for the standalone browser icon. SVG geometry is self-contained; a contract test ties its three colors to the dark Empire tokens.
- `SiteNotFound` for one shared 404 layout; the app supplies its messages, link labels, and routes.

The mark is decorative inside a home link: the adjacent brand name supplies the link's accessible name. The hero vector is `aria-hidden` because its geometry adds no information beyond the surrounding copy. New icons should use SVG paths, semantic roles from CSS tokens, stable geometry, and the same accessibility contract. Avoid emoji, icon fonts, inline raster payloads, external SVG references, and unnecessary animation.

## Artwork and content boundary

Use vector geometry for identity, interface symbols, abstract diagrams, and reusable ornaments. Use raster illustration for cinematic scenes whose composition depends on texture, lighting, or characters. Do not turn story text, sacred text, claims, or source material into artwork.

The five current WebP illustrations remain the only generated scenes approved for public deployment. Their approval and checksums are recorded in `apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json`; it does not clear the private PNG references or approve any other content. The manifest's 19 future slots remain `pending_approval`. M45-03 records that image generation stopped when the available credits were exhausted. Those slots need valid generation access, per-file provenance, visual review, size checks, and the applicable publication approval before they can replace existing art.

No licensed display face is available in the repository. Keep the shared MoonUI font stacks until a suitable font has a documented source and license. Do not simulate a licensed face with a new font download.

## Page and responsive rules

- Every Empire route, including `/`, uses `data-skin="empire"`; the shared MoonWitness default remains `zine` for other surfaces.
- Header, footer, page controls, stats, cards, and repeated Story Universe structures stay in MoonUI. Route files and the app own navigation data, copy, and artwork URLs.
- Keep the orbital illustration square through its `viewBox`, scale it with the hero column, and let its surrounding labels wrap or disappear only through the existing responsive layout rules.
- Preserve readable text contrast and visible focus states in both Empire brightness modes. Do not encode selected, warning, or status meaning by color alone.
- Prefer still artwork. If motion is added later, respect reduced-motion preferences and keep the static composition complete.

## Review checklist

1. Confirm the page selects the Empire skin and uses MoonUI roles rather than an app-local palette.
2. Confirm repeated anatomy is implemented and styled in MoonUI; app CSS only arranges page bands.
3. Confirm the vector is decorative or has a concise accessible name, uses no external resource, and scales without clipping.
4. Compare the dark and light palettes with the shared TypeScript tokens; check text, focus, and thin-line contrast.
5. For raster art, verify the exact file is in the manifest and asset ledger, has an observed digest and provenance, and has approval for the exact public use.
6. Capture the actual route at mobile, tablet, and desktop sizes before claiming visual acceptance. A CSS or unit test is not screenshot evidence.
