# M43-01..M43-03 — MoonUI dual-skin contract: closure certification at `1fa799d`

**Status: M43-01, M43-02 and M43-03 VERIFIED at exact SHA `1fa799d`; M43-04 remains open.** 29 October 2026 (Asia/Jakarta). [TODO](../../TODO.md) owns task status; this note records evidence only. The design-layer report at [`M43-01-moonui-skin-layer.md`](M43-01-moonui-skin-layer.md) records the pre-commit implementation work and closes nothing; this certification supersedes it for closure.

## Run identity

| Item | Value |
|---|---|
| Branch | `dev` |
| HEAD | `1fa799d32523b8bc4395602d5ced46198ebee745` |
| Commits under review | `a841490` (ADR-0014, packets, bridge status), `33dc9b5` (MoonUI skin layer), `1fa799d` (Empire adoption) |
| Scope | M43-01, M43-02, M43-03 |
| Excluded from those commits | parallel working-tree changes to cockpit, Story Universe reference docs/assets, `docs/audit/screens/*`, M19-04, `todo-ui-2.md`, `next-env.d.ts` and other M19 files — inspected with `git status` and left untouched |
| Deployment | none. No push, promotion or redeploy was performed |

The M43 files themselves had no uncommitted edits when the commands below ran; the unrelated changes above cannot affect MoonUI tokens, the Empire stylesheet or the listed tests.

## Commands actually run at `1fa799d`

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonui build` | exit 0, updated `dist` types |
| `pnpm --filter @moonwitness/moonui test` | **121 pass, 0 fail, 0 skipped** |
| `pnpm ui:check` | **142 files scanned, 0 violations**; includes `StoryUniverse.tsx` and `apps/empire-web/src/app/globals.css` |
| `pnpm --filter @moonwitness/empire-web test` | **10 pass, 0 fail** |
| `pnpm --filter @moonwitness/empire-web typecheck` | exit 0 |
| `pnpm exec eslint` on the two layouts, `StoryUniverse.tsx`, `tokens.ts`, `skins.test.ts`, `check-ui-consistency.mjs` | exit 0, no output (`empire-web` declares no package `lint` script, so the root ESLint binary is the scoped command) |
| `pnpm --filter @moonwitness/empire-web build` | exit 0, static export emitted |
| `node apps/empire-web/test/export-check.mjs` | 5 PASS lines: eight localized routes, twelve information pages, five WebP/zero PNG, 25 HTML files' anchors, 404 |

Root `pnpm test` was not executed locally here. It was executed later by CI run [40885808102](https://github.com/bjo163/moonwitnessxv/actions/runs/40885808102) at `e740900`, a descendant of this SHA: the `pnpm verify` chain (build, `ui:check`, lint, `gen:sdk:check`, `pnpm test`, `build:web`) concluded **success**, so the root wiring is proved by CI rather than by this local evidence.

## Contract checks

### Default skin is value-identical

- `test/skins.test.ts` asserts every `MOON_SKINS.zine` role equals its CSS declaration in `:root, :root[data-skin='zine']` (23 roles, exact string comparison after whitespace normalisation).
- It asserts 17 legacy `MOON_COLORS` keys map to the same `zine` roles, so the eight existing consumers keep their values.
- Geometry (`--s1`…`--s5`, `--ctl`) and font stacks remain in the default block only; `--font-editorial` was added there.

### Empire block is self-contained and allowlisted

- 49 declared properties: 25 roles (23 palette roles + `--edge-shadow`, `--edge-shadow-sm`) and 24 legacy aliases.
- No geometry, no `--font-*`, no property outside the test allowlist; asserted by `skins.test.ts`.
- `:root[data-skin='empire'] body` (`moon.css:137`) selects the Empire field; the default body rule is unchanged.
- `.m-btn[data-variant="danger"]` reads `var(--danger)` (`moon.css:1103`) and the accent variant reads `var(--on-brand)` (`moon.css:1086`); both are value-identical in zine.

### Measured contrast (same formula as the test)

| Pair | zine | empire | Required |
|---|---|---|---|
| `fg` / `bg` | 18.37:1 | 16.88:1 | ≥ 4.5 |
| `fg` / `bg-1` | 17.07:1 | 15.66:1 | ≥ 4.5 |
| `fg-muted` / `bg` | 7.16:1 | 6.38:1 | ≥ 4.5 |
| `brand` / `bg` | 14.11:1 | 8.47:1 | ≥ 4.5 |
| `on-brand` / `brand` | 14.11:1 | 8.15:1 | ≥ 4.5 |
| `focus` / `bg` | 11.41:1 | 11.72:1 | ≥ 3 |
| `rule` / `bg` | 1.80:1 | 2.14:1 | ≥ 1.5 (test threshold) |
| empire CTA `fg` / `brand-2-strong` | — | 6.38:1 | ≥ 4.5 |
| empire `brand-2` / `bg` | — | 3.98:1 | ≥ 3 |

The zine primary button (`fg` on `#ff007a`, 3.45:1) predates ADR-0014 and is grandfathered; the Empire skin does not inherit it.

### Empire adoption

- Both root layouts pin `data-skin` on `<html>`: `zine` for `(entry)`, `empire` for `(localized)`; the static export is checked by `export-check.mjs` against `<html lang="…" data-skin="…">`.
- `data-theme="empire-story"` occurs zero times in `StoryUniverse.tsx` and `globals.css`; `--eol-` occurs zero times in the stylesheet.
- Palette-listed hex literals outside the artwork selectors: **0** (enforced by `token-purity.test.mjs`). Remaining raw hex outside artwork: 25 non-palette neutral/alpha values (`#fff`, `#0009`, `#090b0d*` alpha variants, separators); artwork selectors keep 89.
- Diff `bf0605d..1fa799d` on `globals.css`: 167 hex occurrences removed, 23 added back (artwork/neutral), 11 shorthands with literal font families replaced, 27 shorthands now reference `var(--font-*)`.

## Limitations

- No both-skin end-to-end viewport matrix (390/768/1122/1440/1920), computed-`--bg` proof per route family, or interaction-state sweep was performed in this run; those belong to M43-04.
- No commit was pushed, no `dev`→`main` promotion and no Vercel redeploy occurred, so no promotion SHA or redeploy result exists to record.
- The 55-capture before/after pixel comparison described in the design-layer report was not re-run here.

## Rollback

Revert `a841490`, `33dc9b5` and `1fa799d`; the default `zine` skin needs no consumer change. For the Empire pilot, the existing production deployment `dpl_G4b6HsDLK81qseMRYHA251jmCTqe` at `cea723ca` remains the rollback target and was not touched.

## Disposition

M43-01, M43-02 and M43-03 are verified at `1fa799d`. M43-04 stays open until the both-skin end-to-end verification, promotion and recorded redeploy exist.
