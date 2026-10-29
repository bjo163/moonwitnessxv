# M43-04 — Both skins, promotion and production redeploy: evidence

**Status: CLOSED at promotion SHA `e740900e50f8dcd9dcf4dceefee1e06a159b5297`.** 29 October 2026 (Asia/Jakarta). [TODO](../../TODO.md) owns task status; this note records only observed evidence.

## Release chain

| Step | Observed |
|---|---|
| `dev` push | `3d8b6a0..b3f120c`, then `b3f120c..e740900` (the second push carried the gitleaks allowlist that unblocked the gate) |
| CI run | [40885808102](https://github.com/bjo163/moonwitnessxv/actions/runs/40885808102) — `CI Verify & Gate`, **conclusion success** at `e740900` |
| Gate content | the run executed the full `pnpm verify` chain (build, `ui:check`, lint, `gen:sdk:check`, `pnpm test`, `build:web`), so the earlier "root `pnpm test` not run end to end" limitation from the `1fa799d` certification is now resolved by CI rather than by a local run |
| Promotion | the `promote` job fast-forwarded `main`; `git rev-parse origin/main` and `origin/dev` both return `e740900e50f8dcd9dcf4dceefee1e06a159b5297` |
| Release | `v2.20.0`, published by the promote job (previous tags `v2.18.0`, `v2.19.0`) |
| Production | Vercel project `a-l-l-a-h-empire-web` rebuilt from `main`; the alias now serves `e740900` (proved by the skin attributes below, which do not exist in the previous build) |

### Unblocking note

The first push failed the `Scan Git history for secrets` step: gitleaks reported one `generic-api-key` finding at `818a92d:scripts/ui/m19-07-acceptance.mjs:123`, where the on-demand M19-07 harness sets `MOONQL_AUTH_ADMIN_PASSWORD` to a throwaway literal for an ephemeral in-memory hub. It is not a credential, but it is committed history, so it cannot be fixed forward. The exact fingerprint was added to the existing `.gitleaksignore` (the file already allowlists two identical `moonql-stations` findings) in commit `e740900`; the scan then passed. No secret value is reproduced here.

## Live production verification (anonymous, Playwright + HTTP)

| Route | `data-skin` | `--bg` | `--brand` | `--danger` | `--focus` | overflow | status |
|---|---|---|---|---|---|---|---|
| `/en` | `empire` | `#090b0d` | `#c5a578` | `#ff5a6b` | `#e3c391` | 0 | 200 |
| `/id/stories` | `empire` | `#090b0d` | `#c5a578` | `#ff5a6b` | `#e3c391` | 0 | 200 |
| `/` | `zine` | `#07060b` | `#ffd400` | `#ff1e56` | `#00d4ff` | 0 | 200 |

`/en` response headers: `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. No custom domain, DNS record or indexing change was made.

## Viewport matrix (pre-promotion build, same source)

Eleven route families (`/`, `/id`, `/en`, `/id|en/stories`, `/id|en/stories/angelwithshotgun`, `/id|en/characters`, `/id|en/ggs`) × 390/768/1122/1440/1920:

- **After** (local export of the same source): 55/55 HTTP 200, correct `data-skin` per route family, **0 px horizontal overflow at every width including 1920**, **0 console errors**.
- **Before**: 55/55 captured from the then-current production deployment (`cea723ca`), which carries no `--bg`/`--brand` — the pre-change fingerprint.
- **Pixel diff** (channel delta > 24): `/` **0.00 %** at all five widths; `/id`, `/en`, stories, characters, ggs **0.56 %–2.44 %**; readers **3.94 %–6.27 %** (most text-dense page, where 14 near-duplicate greys collapsed into `--fg-muted`/`--fg-subtle`). No dimension mismatches.
- **States**: gold focus ring in empire, zine focus, library empty state, disabled reader control.

Screenshots, `report.json` and `diff.json` are reproducible artifacts in the gitignored `apps/empire-web/out/.screens/{after,before,live}/`.

## Token and structure proof

- `/` → **14/14** legacy colours resolve to the pre-ADR values, plus `--chalk #f7f4ece0`, `--chalk-dim #f7f4ec47`, `--hair #f7f4ec21`, `--border #f7f4ec38`, `--border-strong #f7f4ec73`, `--shadow 3px 3px 0 #000`.
- `/[locale]` → **14/14** alias→role pairs resolve identically; `--brand-2` (`rgb(219,30,49)`) stays distinct from `--brand-2-strong` (`rgb(169,21,37)`).
- `git diff -U0` on `moon.css` over the whole change: **25 removed / 124 added** lines, where the only primitive lines touched are the four `.m-btn[data-variant="accent"]` declarations and the `background` of `.m-btn[data-variant="danger"]`. No `.m-*` rule was added or removed.

## Limitations

- The other seven MoonUI consumers were not re-screenshotted; their evidence is token-level (exact legacy values above) plus the unchanged primitive rules.
- Six 8-digit alpha forms of the panel surface remain literal inside artwork overlays (`#111316ef`, `#111316e8`, `#111316dd`, `#11131655`, `#11131635`, `#11131629`), as the plan's rule permits where `color-mix()` is not already guarded.
- The zine primary button's pre-existing white-on-pink contrast (3.45:1) is grandfathered by ADR-0014; the empire CTA does not inherit it.

## Rollback

Promote the previous production deployment `dpl_G4b6HsDLK81qseMRYHA251jmCTqe` (serving `cea723ca`) in the existing Vercel project, or revert `e740900` and the M43 commits. No domain or DNS action is required, and the default `zine` skin needs no consumer change.
