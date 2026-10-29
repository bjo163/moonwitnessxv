# M43-04 — Both-skin local verification (PARTIAL)

**Status: PARTIAL, NOT CLOSED.** 29 October 2026 (Asia/Jakarta). [TODO](../../TODO.md) owns task status. This note records only what was observed locally; the row stays open because promotion, redeploy and the full interaction-state sweep did not happen.

## Run identity

| Item | Value |
|---|---|
| Branch | `dev` |
| HEAD at run | `e9d8a59` (M43 code identical to `1fa799d`; `e9d8a59` adds docs only) |
| Static export | `apps/empire-web/out/` from `pnpm --filter @moonwitness/empire-web build` at `1fa799d` |
| Browser | Playwright 1.64.1, Chromium headless, deviceScaleFactor 1 |
| Server | throwaway `node:http` file server bound to `127.0.0.1:0`, closed at the end of the run |
| Artifacts | [`M43-04-local/geometry.json`](M43-04-local/geometry.json), 22 screenshots at 390 and 1440 in [`M43-04-local/screens/`](M43-04-local/screens/), and [`M43-04-local/states/`](M43-04-local/states/) |

## Matrix actually observed

11 routes × 5 viewports (390×844, 768×1024, 1122×1402, 1440×900, 1920×1080) = **55 records**:

- `/` — zine
- `/id`, `/en` — empire
- `/id/stories`, `/en/stories` — empire
- `/id/stories/angelwithshotgun`, `/en/stories/angelwithshotgun` — empire
- `/id/characters`, `/en/characters` — empire
- `/id/ggs`, `/en/ggs` — empire

## Observed results

| Check | Result |
|---|---|
| HTTP status | 200 on all 55 records |
| `data-skin` | `zine` on `/`, `empire` on all ten locale routes |
| Computed `--bg` | `#07060b` on `/`; `#090b0d` on every locale route (55/55 match) |
| Horizontal overflow | 0 records; in particular 0 at 1920 |
| Console errors | 0 |
| Failed requests | 0 |
| `meta robots` | `noindex, nofollow` on every record |
| Keyboard focus ring | present on all 55 after one `Tab`: 3px solid `rgb(0, 212, 255)` (zine) and 3px solid `rgb(143, 164, 184)` (empire) |

The screen captures are viewport screenshots, not full-page, to keep the evidence set at 16 MB.

## Interaction states observed

A second Playwright pass over the same static export (`states/states.json`):

| State | zine (`/`) | empire (`/en`) |
|---|---|---|
| Hover on the first `.m-btn` | `transform: translate(-1px,-1px)`, `filter: brightness(1.1)` | same transform and filter |
| Active (mouse down on the same button) | transform animates toward `+1px,+1px` | same |
| Disabled controls present | 0 | 0 |
| Mobile menu (390 only) | no menu control exists on the entry page | `aria-expanded` `false`→`true`, nav `display` `none`→`grid`, height 345px, closes back to `false`; no console errors |
| Error page `/definitely-missing` | 404, no `data-skin` attribute, computed `--bg` `#07060b` (default `:root` zine), no overflow at 390 or 1440 | no empire-specific 404 is exported |

The 404 console entry is the navigation request itself (404 status), not a script error.

## Not observed — why the row stays open

- **Empty state** was not exercised: the exported pages contain no search/filter input and no empty collection view.
- **Disabled state** has no control to exercise: `:disabled` matches zero elements in both skins, so the state is absent rather than verified.
- **Error state** exists only as the entry-skin 404; there is no empire-specific error route to compare.
- **Security headers** (`X-Content-Type-Options`, `frame-ancestors`, referrer policy) cannot be observed from a local file server; the M42-02 live check remains the authority for headers. `noindex, nofollow` was observed as a meta tag only.
- **WebP responses** were verified by `export-check.mjs` at build time, not over HTTP in this run.
- **Baseline pixel comparison** was not performed; screenshots here have no committed pre-change counterpart.
- **Promotion and redeploy** were not performed: no push, no `dev`→`main`, no Vercel deployment. No promoted SHA or redeploy result exists to record.

## Rollback

Unchanged: production deployment `dpl_G4b6HsDLK81qseMRYHA251jmCTqe` at `cea723ca` remains the rollback target for the Empire pilot. This run changed no deployment.

## Disposition

The local both-skin render contract holds at the five required viewports. M43-04 remains open for the interaction-state sweep, live header/WebP checks, baseline comparison, promotion and recorded redeploy.
